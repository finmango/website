const puppeteer = require('puppeteer');
const path = require('path');

const AMBASSADORS_2026 = [
  { slug: 'david-johnson',       name: 'David Johnson',        photo: '../33.jpg', flag: '🇺🇸', country: 'United States',      tagline: 'Connecting the fight for financial freedom to the fight for true equality.' },
  { slug: 'dylan-forman',        name: 'Dylan Forman',         photo: '../34.jpg', flag: '🇺🇸', country: 'United States',      tagline: 'Building equitable access to financial information and technology.' },
  { slug: 'pranita-jadhav',      name: 'Pranita Jadhav',       photo: '../35.jpg', flag: '🇮🇳', country: 'India',              tagline: 'Turning complex financial concepts into simple, actionable steps.' },
  { slug: 'hans-patel',          name: 'Hans Patel',           photo: '../36.jpg', flag: '🇺🇸', country: 'United States',      tagline: 'Shifting financial education from individual responsibility to systemic issue.' },
  { slug: 'onyemeri-ihegazie',   name: 'Onyemeri Ihegazie',    photo: '../37.jpg', flag: '🇳🇬', country: 'Nigeria',            tagline: 'Building real, relatable financial health conversations for young Nigerians.' },
  { slug: 'harshil-shah',        name: 'Harshil Shah',         photo: '../38_Updated.jpg', flag: '🇺🇸', country: 'United States',      tagline: 'Co-founder of the Carolina Wealth Initiative — teaching financial health across campus and community.' },
  { slug: 'eduardo-charles-alba',name: 'Eduardo Charles Alba', photo: '../39.jpg', flag: '🇩🇴', country: 'Dominican Republic', tagline: 'Connecting data, institutions, and communities to make financial health actionable.' },
  { slug: 'caleb-vales',         name: 'Caleb Vales',          photo: '../40.jpg', flag: '🇺🇸', country: 'United States',      tagline: 'Community events, content, and classroom advocacy for financial literacy.' },
  { slug: 'aren-inan',           name: 'Aren Inan',            photo: '../41.jpg', flag: '🇺🇸', country: 'United States',      tagline: 'Founding developer of Futures Financials — teaching 10,000+ students nationwide.' },
  { slug: 'hayley-foote',        name: 'Hayley Foote',         photo: '../42.jpg', flag: '🇺🇸', country: 'United States',      tagline: 'Building a campus Financial Health System at Ohio State.' },
  { slug: 'sophie-hong',         name: 'Sophie Hong',          photo: '../43.jpg', flag: '🇺🇸', country: 'United States',      tagline: 'Financial literacy for vulnerable communities.' },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  const templateUrl = 'file://' + path.resolve(__dirname, 'og-template.html');
  await page.goto(templateUrl, { waitUntil: 'networkidle0' });

  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');

  const outDir = __dirname;

  for (const amb of AMBASSADORS_2026) {
    await page.evaluate((data) => window.setAmbassador(data), amb);
    // Wait for the image to be fully decoded
    await page.evaluate(async () => {
      const img = document.getElementById('photo');
      if (img.complete && img.naturalWidth > 0) return;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    await new Promise(r => setTimeout(r, 150));

    const el = await page.$('#card');
    const outPath = path.join(outDir, `${amb.slug}-og.png`);
    await el.screenshot({ path: outPath, type: 'png', omitBackground: false });
    console.log(`✓ ${amb.slug}-og.png`);
  }

  await browser.close();
  console.log('\nDone. Generated', AMBASSADORS_2026.length, 'images in', outDir);
})();
