const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport to a large size to ensure elements are rendered
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    const fileUrl = 'file://' + path.resolve('resource-graphics.html');
    console.log(`Opening ${fileUrl}...`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Wait for cards to be generated
    await page.waitForSelector('.graphic');

    // Get all graphic elements
    const graphics = await page.$$('.graphic');
    console.log(`Found ${graphics.length} graphics.`);

    const outputDir = path.join(process.env.HOME, 'Desktop', 'Resource_Graphics');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (let i = 0; i < graphics.length; i++) {
        const graphic = graphics[i];

        // Extract title for filename
        const title = await graphic.$eval('.title', el => el.innerText.replace(/[^a-z0-9]/gi, '_').toLowerCase());
        const filename = `${title}.jpg`;
        const outputPath = path.join(outputDir, filename);

        // Isolate the element to ensure full size capture
        await page.evaluate((el) => {
            // Store original styles if we wanted to revert, but we don't need to for this batch script
            el.style.position = 'fixed';
            el.style.top = '0';
            el.style.left = '0';
            el.style.zIndex = '9999';
            el.style.transform = 'none';
            el.style.margin = '0';
            el.style.boxShadow = 'none';
        }, graphic);

        // Wait for any layout shifts
        // await new Promise(r => setTimeout(r, 50));

        await graphic.screenshot({
            path: outputPath,
            type: 'jpeg',
            quality: 100,
            omitBackground: true
        });

        console.log(`Saved ${filename}`);

        // Hide the element after screenshot so it doesn't block the next one
        await page.evaluate((el) => {
            el.style.display = 'none';
        }, graphic);
    }

    await browser.close();
    console.log('Done!');
})();
