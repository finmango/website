// Renders linkedin-company-banner.html to linkedin-company-banner.png.
// LinkedIn company page cover: 6:1, recommended upload 4200 x 700 (displays at ~1128 x 191).
// Usage: node tools/capture_linkedin_banner.js
const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: { width: 2100, height: 350 },
        deviceScaleFactor: 2,
    });

    const fileUrl = 'file://' + path.resolve('linkedin-company-banner.html');
    console.log(`Opening ${fileUrl}...`);
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const outputPath = path.resolve('linkedin-company-banner.png');
    await page.locator('#capture').screenshot({ path: outputPath, type: 'png' });
    console.log(`Saved ${outputPath}`);
    await browser.close();
})();
