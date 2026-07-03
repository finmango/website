// Renders the OG image template to og-image.png at 1200x630.
// Renders at 2x for crisp text, then downscales to 1200x630 with palette
// compression (needs sharp: npm i --no-save sharp) so the file stays small —
// this image loads on every social share of every page.
// Fonts are bundled in scripts/fonts/, so no network access is needed.
// Usage: node scripts/render-og.js
const path = require('path');
const fs = require('fs');
const os = require('os');

let puppeteer;
try { puppeteer = require('puppeteer'); }
catch { puppeteer = require('puppeteer-core'); }

const TEMPLATE = path.resolve(__dirname, 'og-image-template.html');
const OUTPUT = path.resolve(__dirname, '..', 'og-image.png');

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
  // Full puppeteer ships its own browser; only force a path if one exists.
  const chrome = findChrome();
  if (chrome) launchOpts.executablePath = chrome;

  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  console.log(`Opening file://${TEMPLATE}`);
  await page.goto('file://' + TEMPLATE, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const raw = path.join(os.tmpdir(), 'og-image-2x.png');
  const el = await page.$('#capture');
  await el.screenshot({ path: raw, type: 'png', omitBackground: false });
  await browser.close();

  try {
    const sharp = require('sharp');
    const info = await sharp(raw)
      .resize(1200, 630)
      .png({ palette: true, quality: 90, compressionLevel: 9 })
      .toFile(OUTPUT);
    console.log(`Wrote ${OUTPUT} (1200x630, ${Math.round(info.size / 1024)}KB)`);
  } catch (e) {
    // Without sharp the output would be 2400x1260 and ~2.5x heavier, which
    // contradicts the og:image:width/height meta tags — don't ship that.
    fs.copyFileSync(raw, OUTPUT + '.2x.png');
    console.error('sharp not available — wrote unoptimized 2400x1260 capture to og-image.png.2x.png instead.');
    console.error('Run: npm i --no-save sharp && node scripts/render-og.js');
    process.exit(1);
  }
})();
