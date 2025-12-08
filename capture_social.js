const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport to match the post size
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

    const fileUrl = 'file://' + path.resolve('social-post.html');
    console.log(`Opening ${fileUrl}...`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    const outputDir = path.join(process.env.HOME, 'Desktop', 'Social_Graphics');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const element = await page.$('#capture');
    const filename = 'bradley_smith_spotlight.jpg';
    const outputPath = path.join(outputDir, filename);

    await element.screenshot({
        path: outputPath,
        type: 'jpeg',
        quality: 100
    });

    console.log(`Saved ${filename} to ${outputDir}`);

    await browser.close();
})();
