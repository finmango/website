const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1584, height: 396, deviceScaleFactor: 2 });

    const fileUrl = 'file://' + path.resolve('linkedin-company-banner.html');
    console.log(`Opening ${fileUrl}...`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    const element = await page.$('#capture');
    const outputPath = path.resolve('linkedin-company-banner.png');
    await element.screenshot({ path: outputPath, type: 'png', omitBackground: false });
    console.log(`Saved ${outputPath}`);
    await browser.close();
})();
