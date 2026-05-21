const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 1300, deviceScaleFactor: 2 });

  const fileUrl = 'file://' + path.resolve('navtech-linkedin-posts.html');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const outDir = path.resolve('navtech-linkedin-graphics');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const titles = [
    '01-thesis',
    '02-case-manager-math',
    '03-four-tools',
    '04-ai-native',
    '05-feedback-loop',
    '06-2026-navigators',
    '07-quote',
    '08-proof-points',
  ];

  for (let i = 1; i <= 8; i++) {
    const el = await page.$(`#post${i}`);
    const out = path.join(outDir, `navtech-${titles[i-1]}.png`);
    await el.screenshot({ path: out, type: 'png' });
    console.log(`Saved ${out}`);
  }

  await browser.close();
})();
