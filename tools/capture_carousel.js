/**
 * ============================================================================
 * Capture a social carousel page into one PNG per slide
 * ============================================================================
 * The carousel pages (social-carousel-*.html) lay every slide out in a column
 * so the whole set can be reviewed in one scroll. This walks the .slide
 * elements in document order and shoots each one at 2x, which is what
 * Instagram and LinkedIn want to be handed: 2160x2700 for a 1080x1350 frame.
 *
 *   node tools/capture_carousel.js <page.html> <out-dir> [--scale=2] [--png]
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

async function main() {
  const args = process.argv.slice(2);
  const page_ = args.find(a => !a.startsWith('--'));
  const outDir = args.filter(a => !a.startsWith('--'))[1];
  if (!page_ || !outDir) {
    console.error('usage: node tools/capture_carousel.js <page.html> <out-dir> [--scale=2] [--png]');
    process.exit(1);
  }
  const scale = Number((args.find(a => a.startsWith('--scale=')) || '--scale=2').split('=')[1]) || 2;
  const png = args.includes('--png');

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

    for (let i = 0; i < slides.length; i++) {
      const name = 'slide-' + String(i + 1).padStart(2, '0') + (png ? '.png' : '.jpg');
      const out = path.join(outDir, name);
      await slides[i].screenshot({
        path: out,
        captureBeyondViewport: true,
        ...(png ? { type: 'png' } : { type: 'jpeg', quality: 95 })
      });
      console.log('✓ ' + name + '  ' + Math.round(fs.statSync(out).size / 1024) + 'KB');
    }
    console.log('Done — ' + slides.length + ' slide(s) at ' + scale + 'x into ' + outDir);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Capture failed: ' + err.message);
  process.exit(1);
});
