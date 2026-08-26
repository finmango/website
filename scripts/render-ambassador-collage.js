// Renders the ambassador collage from scripts/ambassador-collage-template.html.
//
// Two outputs, both captured as elements so their height follows the layout:
//   ambassador-collage.jpg         poster, 2800px wide, one row per cohort
//   ambassador-collage-square.png  1080x1080 social mosaic, faces only
//
// Fonts and photos are local, so no network access is needed.
//
// Usage: node scripts/render-ambassador-collage.js [poster|square]
//   (no argument renders both)
const path = require('path');
const fs = require('fs');

let puppeteer;
try { puppeteer = require('puppeteer'); }
catch { puppeteer = require('puppeteer-core'); }

const TEMPLATE = path.resolve(__dirname, 'ambassador-collage-template.html');
const ROOT = path.resolve(__dirname, '..');

const TARGETS = {
  // 45 photographs compress far better as JPEG than PNG; 1.5x keeps the
  // 13px names crisp without pushing the file into the megabytes.
  poster: { selector: '#poster', output: 'ambassador-collage.jpg', scale: 1.5, type: 'jpeg', quality: 92 },
  // The square is mostly flat cream behind large type, where PNG is both
  // smaller and cleaner, and it is already at its final social pixel size.
  square: { selector: '#square', output: 'ambassador-collage-square.png', scale: 1, type: 'png' },
};

const which = process.argv[2];
if (which && !TARGETS[which]) {
  console.error(`Unknown target "${which}". Known: ${Object.keys(TARGETS).join(', ')}.`);
  process.exit(1);
}
const targets = which ? [which] : Object.keys(TARGETS);

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
    await page.goto('file://' + TEMPLATE, { waitUntil: 'networkidle0' });
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
    const outPath = path.join(ROOT, output);
    await el.screenshot({ path: outPath, type, quality, captureBeyondViewport: true });
    await page.close();

    const kb = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`Wrote ${output} (${Math.round(box.width)}x${Math.round(box.height)} @${scale}x, ${kb}KB)`);
  }

  await browser.close();
})();
