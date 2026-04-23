const puppeteer = require('puppeteer');
const path = require('path');

const AMBASSADORS = [
  {
    slug: 'harshil-shah',
    name: 'Harshil Shah',
    photo: '../38_Updated.jpg',
    city: 'Columbia, SC',
    countryLabel: 'USA',
  },
];

const VARIANTS = [
  { template: 'square-template.html', suffix: 'square', width: 1080, height: 1080 },
  { template: 'story-template.html',  suffix: 'story',  width: 1080, height: 1920 },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  for (const v of VARIANTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: v.width, height: v.height, deviceScaleFactor: 2 });
    const templateUrl = 'file://' + path.resolve(__dirname, v.template);
    await page.goto(templateUrl, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    for (const amb of AMBASSADORS) {
      await page.evaluate((data) => window.setAmbassador(data), amb);
      await page.evaluate(async () => {
        const img = document.getElementById('photo');
        if (img.complete && img.naturalWidth > 0) return;
        await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
      });
      await new Promise(r => setTimeout(r, 200));
      const el = await page.$('#card');
      const outPath = path.join(__dirname, `${amb.slug}-${v.suffix}.png`);
      await el.screenshot({ path: outPath, type: 'png' });
      console.log(`✓ ${amb.slug}-${v.suffix}.png`);
    }
    await page.close();
  }

  await browser.close();
})();
