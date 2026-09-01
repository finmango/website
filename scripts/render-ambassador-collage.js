// Renders the ambassador collage from scripts/ambassador-collage-template.html.
//
// Two outputs, both captured as elements so their height follows the layout:
//   ambassador-collage-square.jpg  2160x2160 mosaic, faces only
//   ambassador-collage-story.jpg   1080x1920 (9:16) mosaic, faces only
//   ambassador-notes-square.jpg    1080x1080 Ambassador Notes announcement
//   ambassador-notes-story.jpg     1080x1920 announcement at 9:16
// Plus an optional captioned poster, rendered only when asked for by name.
//
// Fonts and photos are local, so no network access is needed.
//
// Usage: node scripts/render-ambassador-collage.js [target] [--seed=N] [--out-dir=DIR]
//   (no target renders everything except the poster)
//   --seed overrides the template's mosaic shuffle, for comparing
//   arrangements; --out-dir writes elsewhere so a sweep does not clobber
//   the committed images. Output names gain a -sN suffix when seeded.
const path = require('path');
const fs = require('fs');

let puppeteer;
try { puppeteer = require('puppeteer'); }
catch { puppeteer = require('puppeteer-core'); }

const TEMPLATE = path.resolve(__dirname, 'ambassador-collage-template.html');
const ROOT = path.resolve(__dirname, '..');

// All three are photographic edge to edge, so JPEG over PNG throughout.
// 2x on the square gives a 2160px master; the story renders at its native
// 1080x1920, and 2x there would only exceed what a story ever displays.
const TARGETS = {
  square: { selector: '#square', output: 'ambassador-collage-square.jpg', scale: 2, type: 'jpeg', quality: 92 },
  story: { selector: '#story', output: 'ambassador-collage-story.jpg', scale: 1, type: 'jpeg', quality: 92 },
  // The announcements carry type over photographs, so they render at their
  // native social sizes and at a higher quality to keep edges clean.
  'notes-square': { selector: '#notesSquare', output: 'ambassador-notes-square.jpg', scale: 1, type: 'jpeg', quality: 95 },
  'notes-story': { selector: '#notesStory', output: 'ambassador-notes-story.jpg', scale: 1, type: 'jpeg', quality: 95 },
  poster: { selector: '#poster', output: 'ambassador-collage.jpg', scale: 1.5, type: 'jpeg', quality: 92 },
};

// The captioned poster is opt-in; a bare run makes the mosaics and promos.
const DEFAULT_TARGETS = ['square', 'story', 'notes-square', 'notes-story'];

const args = process.argv.slice(2);
const seed = (args.find(a => a.startsWith('--seed=')) || '').split('=')[1];
const outDir = (args.find(a => a.startsWith('--out-dir=')) || '').split('=')[1];
const which = args.find(a => !a.startsWith('--'));
if (which && !TARGETS[which]) {
  console.error(`Unknown target "${which}". Known: ${Object.keys(TARGETS).join(', ')}.`);
  process.exit(1);
}
const targets = which ? [which] : DEFAULT_TARGETS;

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium',
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  ].filter(Boolean);
  return candidates.find(p => fs.existsSync(p));
}

(async () => {
  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium'],
  };
  const chrome = findChrome();
  if (chrome) launchOpts.executablePath = chrome;

  const browser = await puppeteer.launch(launchOpts);

  for (const name of targets) {
    const { selector, output, scale, type, quality } = TARGETS[name];
    const page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 1200, deviceScaleFactor: scale });
    await page.goto('file://' + TEMPLATE + (seed ? `?seed=${encodeURIComponent(seed)}` : ''), { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    // Every photo must be decoded before the capture, or tiles come out blank.
    await page.evaluate(() => Promise.all(
      [...document.images].map(img => img.complete && img.naturalWidth > 0
        ? null
        : new Promise(res => { img.onload = res; img.onerror = res; }))
    ));
    await new Promise(r => setTimeout(r, 300));

    const el = await page.$(selector);
    if (!el) throw new Error(`Template is missing ${selector}`);
    const box = await el.boundingBox();
    const named = seed ? output.replace(/\.(jpg|png)$/, `-s${seed}.$1`) : output;
    const outPath = path.join(outDir ? path.resolve(outDir) : ROOT, named);
    await el.screenshot({ path: outPath, type, quality, captureBeyondViewport: true });
    await page.close();

    const kb = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`Wrote ${named} (${Math.round(box.width)}x${Math.round(box.height)} @${scale}x, ${kb}KB)`);
  }

  await browser.close();
})();
