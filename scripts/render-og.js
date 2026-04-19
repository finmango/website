// Renders the OG image template to PNG at 1200x630.
// Usage: node scripts/render-og.js
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TEMPLATE = path.resolve(__dirname, 'og-image-template.html');
const OUTPUT = path.resolve(__dirname, '..', 'og-image.png');

(async () => {
  if (!fs.existsSync(CHROME)) {
    console.error(`Chromium not found at ${CHROME}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  const fileUrl = 'file://' + TEMPLATE;
  console.log(`Opening ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Give fonts a beat to settle.
  await new Promise(r => setTimeout(r, 400));

  const el = await page.$('#capture');
  await el.screenshot({ path: OUTPUT, type: 'png', omitBackground: false });
  console.log(`Wrote ${OUTPUT}`);

  await browser.close();
})();
