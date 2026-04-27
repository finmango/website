const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const outDir = path.resolve('out/test-frames');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(`file://${path.resolve('ambassador-2026-reveal.html')}`, { waitUntil: 'networkidle0' });

  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.images];
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });

  await page.evaluate(() => { for (const a of document.getAnimations()) a.pause(); });

  // Key moments in the 9s timeline
  const stops = [
    { t: 0.6, name: '01_scene1' },          // 2026 / THE COHORT
    { t: 1.7, name: '02_scene2' },          // FROM 450 / 20 COUNTRIES
    { t: 2.7, name: '03_scene3' },          // ONLY 11
    { t: 3.0, name: '03b_cracks_through_11' },
    { t: 3.3, name: '04_flipping' },        // mid reveal
    { t: 4.0, name: '05_revealed' },        // photos shown
    { t: 5.0, name: '06_callout' },         // settled with callout
    { t: 8.0, name: '07_hold' },            // steady state
  ];

  for (const { t, name } of stops) {
    await page.evaluate((timeSec) => {
      for (const a of document.getAnimations()) {
        try { a.currentTime = timeSec * 1000; } catch (e) {}
      }
    }, t);
    const stage = await page.$('#stage');
    await stage.screenshot({ path: path.join(outDir, `${name}.png`) });
    console.log(`  captured t=${t}s → ${name}.png`);
  }

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
