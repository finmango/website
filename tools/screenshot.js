#!/usr/bin/env node
// Screenshot local pages for visual review:
//   node tools/screenshot.js <page.html> [more.html ...]
// Writes /tmp/shots/<page>-<width>.png at 1280 and 375 wide.
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const outDir = '/tmp/shots';
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  for (const file of process.argv.slice(2)) {
    for (const width of [1280, 375]) {
      await page.setViewport({ width, height: 900 });
      await page.goto(`file://${path.resolve(file)}`, {
        waitUntil: 'networkidle0', timeout: 45000,
      }).catch((e) => errors.push(`${file}: ${e.message.slice(0, 120)}`));
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth);
      const name = path.basename(file, '.html');
      await page.screenshot({
        path: `${outDir}/${name}-${width}.png`, fullPage: true,
      });
      console.log(`${name}-${width}.png  overflow=${overflow}px`);
    }
  }
  if (errors.length) console.log('JS errors:', errors.join(' | '));
  await browser.close();
})();
