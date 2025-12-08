const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Set a large viewport
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

    const htmlPath = path.resolve('ambassador-graphics.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    // Inject CSS to reset transforms for screenshotting
    await page.addStyleTag({
        content: `
      .graphic {
        transform: none !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      .graphic-container {
        display: block !important;
        width: 1080px !important;
        height: 1920px !important;
        margin-bottom: 20px !important;
      }
      .gallery {
        display: block !important;
      }
    `
    });

    const outputDir = '/Users/mangoscott/Desktop/Ambassador_Graphics_2025';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const graphics = await page.$$('.graphic');

    // Names for files
    const names = [
        'Aaliyah_Marie_Kissick',
        'Jose_Ismael_Batista',
        'Dami_Mike_Adeogun',
        'Anvitha_Marlapati',
        'Bradley_Smith',
        'Mansi_Rupesh_More',
        'Valentina_Villa',
        'Danny_Jang',
        'Ananya_Mallick',
        'Alexander_Keller',
        'Priyanka_Anantha',
        'Varsha_Tulsani'
    ];

    for (let i = 0; i < graphics.length; i++) {
        const graphic = graphics[i];
        const name = names[i] || `Ambassador_${i + 1}`;
        const filePath = path.join(outputDir, `${name}.jpg`);

        await graphic.screenshot({
            path: filePath,
            type: 'jpeg',
            quality: 100,
            omitBackground: true
        });

        console.log(`Saved ${filePath}`);
    }

    await browser.close();
})();
