/**
 * ============================================================================
 * Capture a social carousel page into one PNG per slide
 * ============================================================================
 * The carousel pages (social-carousel-*.html) lay every slide out in a column
 * so the whole set can be reviewed in one scroll. This walks the .slide
 * elements in document order and shoots each one at 2x, which is what
 * Instagram and LinkedIn want to be handed: 2160x2700 for a 1080x1350 frame.
 *
 *   node tools/capture_carousel.js <page.html> <out-dir> [--scale=2] [--png] [--pdf]
 *
 * --pdf also writes <out-dir>/<out-dir-name>.pdf — one slide per page, which is
 * the format LinkedIn wants for a document (carousel) post.
 *
 * JPEG by default: the grain overlay pushes a lossless 2160x2700 slide past 6MB,
 * and both platforms re-encode on upload anyway. --png when a slide is headed
 * somewhere that needs it (print, a deck, further editing).
 *
 * Fonts are loaded from scripts/fonts/ by the page itself, so this needs no
 * network — only Chromium.
 * ----------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

function loadPuppeteer() {
  try { return require('puppeteer'); } catch (e) { /* fall through */ }
  try { return require('puppeteer-core'); } catch (e) { /* fall through */ }
  throw new Error('puppeteer not installed — run: npm i --no-save puppeteer-core');
}

// Same lookup as scripts/generate-post-og.js: the sandbox ships Chromium at a
// known path, and full puppeteer brings its own.
function findChrome() {
  return [
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium',
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
  ].filter(Boolean).find(p => fs.existsSync(p));
}

// JPEG dimensions and component count, straight off the SOF marker.
function jpegInfo(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const marker = buf[i + 1];
    // SOF0/1/2/3 and the progressive/arithmetic variants all carry the frame header.
    if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
      return {
        height: buf.readUInt16BE(i + 5),
        width: buf.readUInt16BE(i + 7),
        components: buf[i + 9]
      };
    }
    if (marker === 0xD8 || (marker >= 0xD0 && marker <= 0xD9)) { i += 2; continue; }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('could not read JPEG dimensions');
}

/**
 * Compose the slides into a PDF, one page per image, page box equal to slide box.
 *
 * Chromium's own print pipeline is the obvious route and the wrong one here: it
 * does not embed the variable-axis display face, so every headline silently
 * falls back to a default serif. Placing the rendered JPEGs keeps the pages
 * pixel-identical to the images (DCTDecode, so the bytes are passed through
 * rather than re-encoded), which is also what LinkedIn does to a document post
 * on upload anyway.
 */
function jpegsToPdf(files, out, widthPt, heightPt) {
  const objects = [];   // 1-indexed on write
  const add = body => { objects.push(body); return objects.length; };

  const pageIds = [];
  const deferred = [];
  const catalogId = add(null);   // placeholder: needs the Pages id
  const pagesId = add(null);

  for (const file of files) {
    const jpeg = fs.readFileSync(file);
    const { width, height, components } = jpegInfo(jpeg);
    const space = components === 1 ? '/DeviceGray' : components === 4 ? '/DeviceCMYK' : '/DeviceRGB';

    const imageId = add({
      dict: `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} `
        + `/ColorSpace ${space} /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,
      stream: jpeg
    });
    // Flip nothing, scale the image to fill the page box exactly.
    const content = Buffer.from(`q ${widthPt} 0 0 ${heightPt} 0 0 cm /Im0 Do Q\n`, 'latin1');
    const contentId = add({
      dict: `<< /Length ${content.length} >>`,
      stream: content
    });
    const pageId = add(null);
    pageIds.push(pageId);
    deferred.push({ pageId, imageId, contentId });
  }

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [`
    + pageIds.map(id => `${id} 0 R`).join(' ') + '] >>';
  for (const { pageId, imageId, contentId } of deferred) {
    objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R `
      + `/MediaBox [0 0 ${widthPt} ${heightPt}] `
      + `/Resources << /XObject << /Im0 ${imageId} 0 R >> >> `
      + `/Contents ${contentId} 0 R >>`;
  }

  const chunks = [];
  const offsets = [];
  let pos = 0;
  const push = buf => { chunks.push(buf); pos += buf.length; };

  push(Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1'));
  objects.forEach((obj, idx) => {
    offsets[idx] = pos;
    push(Buffer.from(`${idx + 1} 0 obj\n`, 'latin1'));
    if (typeof obj === 'string') {
      push(Buffer.from(obj + '\n', 'latin1'));
    } else {
      push(Buffer.from(obj.dict + '\nstream\n', 'latin1'));
      push(obj.stream);
      push(Buffer.from('\nendstream\n', 'latin1'));
    }
    push(Buffer.from('endobj\n', 'latin1'));
  });

  const xref = pos;
  let table = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(off => { table += String(off).padStart(10, '0') + ' 00000 n \n'; });
  table += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`
    + `startxref\n${xref}\n%%EOF\n`;
  push(Buffer.from(table, 'latin1'));

  fs.writeFileSync(out, Buffer.concat(chunks));
}

async function main() {
  const args = process.argv.slice(2);
  const page_ = args.find(a => !a.startsWith('--'));
  const outDir = args.filter(a => !a.startsWith('--'))[1];
  if (!page_ || !outDir) {
    console.error('usage: node tools/capture_carousel.js <page.html> <out-dir> [--scale=2] [--png] [--pdf]');
    process.exit(1);
  }
  const scale = Number((args.find(a => a.startsWith('--scale=')) || '--scale=2').split('=')[1]) || 2;
  const png = args.includes('--png');
  const pdf = args.includes('--pdf');

  const puppeteer = loadPuppeteer();
  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium']
  };
  const chrome = findChrome();
  if (chrome) launchOpts.executablePath = chrome;

  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch(launchOpts);
  try {
    const tab = await browser.newPage();
    await tab.setViewport({ width: 1240, height: 1400, deviceScaleFactor: scale });
    await tab.goto('file://' + path.resolve(page_), { waitUntil: 'networkidle0' });
    await tab.evaluate(() => document.fonts.ready);

    const slides = await tab.$$('.slide');
    if (!slides.length) throw new Error('no .slide elements found in ' + page_);

    const written = [];
    for (let i = 0; i < slides.length; i++) {
      const name = 'slide-' + String(i + 1).padStart(2, '0') + (png ? '.png' : '.jpg');
      const out = path.join(outDir, name);
      await slides[i].screenshot({
        path: out,
        captureBeyondViewport: true,
        ...(png ? { type: 'png' } : { type: 'jpeg', quality: 95 })
      });
      written.push(out);
      console.log('✓ ' + name + '  ' + Math.round(fs.statSync(out).size / 1024) + 'KB');
    }
    console.log('Done — ' + slides.length + ' slide(s) at ' + scale + 'x into ' + outDir);

    // LinkedIn takes a carousel as a document post, i.e. a PDF.
    if (pdf) {
      if (png) throw new Error('--pdf composes the JPEG slides; drop --png');
      const box = await slides[0].boundingBox();          // CSS px
      const out = path.join(outDir, path.basename(outDir) + '.pdf');
      jpegsToPdf(written, out, +(box.width * 0.75).toFixed(2), +(box.height * 0.75).toFixed(2));
      console.log('✓ ' + path.basename(out) + '  ' + written.length + ' pages, '
        + Math.round(fs.statSync(out).size / 1024) + 'KB');
    }
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Capture failed: ' + err.message);
  process.exit(1);
});
