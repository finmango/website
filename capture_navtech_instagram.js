const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1500, deviceScaleFactor: 2 });

  const fileUrl = 'file://' + path.resolve('navtech-instagram-posts.html');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const outDir = path.resolve('navtech-instagram-graphics');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const targets = [
    { id: 'ig1',  out: 'ig-01-thesis.png' },
    { id: 'ig7',  out: 'ig-07-quote.png' },
    { id: 'ig8a', out: 'ig-08-proof-slide-1-title.png' },
    { id: 'ig8b', out: 'ig-08-proof-slide-2-reach.png' },
    { id: 'ig8c', out: 'ig-08-proof-slide-3-tools.png' },
    { id: 'ig8d', out: 'ig-08-proof-slide-4-privacy.png' },
    { id: 'ig8e', out: 'ig-08-proof-slide-5-partners.png' },
  ];

  for (const t of targets) {
    const el = await page.$('#' + t.id);
    const out = path.join(outDir, t.out);
    await el.screenshot({ path: out, type: 'png' });
    console.log(`Saved ${out}`);
  }

  await browser.close();
})();
