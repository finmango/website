// Renders a post's social deck: one PNG per slide for the Instagram carousel,
// and the same slides as a multi-page PDF for a LinkedIn document post.
//
// The deck itself is post-graphics/<slug>/carousel.html — a single set of
// 1080x1350 slides. Instagram is the default; the PDF pass sets
// body.for-linkedin, which swaps the "link in bio" line for the real URL.
//
// PNGs come out at 1440x1800 (deviceScaleFactor 1.3333): Instagram's own
// ceiling is 1440px wide, so this is as crisp as the platform will keep and
// needs no downscale pass.
//
// Fonts are bundled in scripts/fonts/, so no network access is needed.
//
// Usage: node scripts/render-post-social.js [slug]
//   node scripts/render-post-social.js the-best-investment
const path = require('path');
const fs = require('fs');

let puppeteer;
try { puppeteer = require('puppeteer'); }
catch { puppeteer = require('puppeteer-core'); }

const SLUG = process.argv[2] || 'the-best-investment';
const DIR = path.resolve(__dirname, '..', 'post-graphics', SLUG);
const DECK = path.join(DIR, 'carousel.html');
const PDF = path.join(DIR, `finmango-${SLUG}-linkedin.pdf`);

const WIDTH = 1080;
const HEIGHT = 1350;
const PNG_SCALE = 1440 / WIDTH; // 1440x1800 — Instagram's own ceiling.

if (!fs.existsSync(DECK)) {
  console.error(`No deck at ${DECK}`);
  process.exit(1);
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium',
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  ].filter(Boolean);
  return candidates.find(p => fs.existsSync(p));
}

// The deck ships with the preview chrome the browser needs (scaled frames, the
// download row). A render wants none of it: unscale the slides, drop the
// furniture, and let each slide be its own full-size box.
const STRIP_CHROME = `
  .stage-head, .btn-row, .frame-label { display: none !important; }
  .stage { display: block !important; padding: 0 !important; }
  .deck { display: block !important; gap: 0 !important; }
  .frame { width: ${WIDTH}px !important; height: ${HEIGHT}px !important; box-shadow: none !important; }
  .frame > .slide { transform: none !important; }
  body { background: #fff !important; }
`;

(async () => {
  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium'],
  };
  const chrome = findChrome();
  if (chrome) launchOpts.executablePath = chrome;

  const browser = await puppeteer.launch(launchOpts);

  async function openDeck({ linkedin }) {
    const page = await browser.newPage();
    await page.setViewport({
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: linkedin ? 1 : PNG_SCALE,
    });
    await page.goto('file://' + DECK, { waitUntil: 'load' });
    await page.addStyleTag({ content: STRIP_CHROME });
    if (linkedin) await page.evaluate(() => document.body.classList.add('for-linkedin'));
    // Local woff2 files resolve instantly, but a slide measured mid-swap lays
    // out against the fallback metrics and the crop lands wrong.
    await page.evaluateHandle('document.fonts.ready');
    return page;
  }

  // ---- Instagram: one PNG per slide -------------------------------------
  const igPage = await openDeck({ linkedin: false });
  const count = await igPage.$$eval('.slide', els => els.length);
  for (let i = 1; i <= count; i++) {
    const el = await igPage.$(`[data-slide="${i}"]`);
    const out = path.join(DIR, `slide-${String(i).padStart(2, '0')}.png`);
    await el.screenshot({ path: out });
    const { size } = fs.statSync(out);
    console.log(`slide-${String(i).padStart(2, '0')}.png  ${(size / 1024).toFixed(0)} KB`);
  }
  await igPage.close();

  // ---- LinkedIn: the same slides, one per PDF page ----------------------
  const liPage = await openDeck({ linkedin: true });
  await liPage.pdf({
    path: PDF,
    width: `${WIDTH}px`,
    height: `${HEIGHT}px`,
    printBackground: true,
    pageRanges: `1-${count}`,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await liPage.close();
  console.log(`${path.basename(PDF)}  ${(fs.statSync(PDF).size / 1024).toFixed(0)} KB  (${count} pages)`);

  await browser.close();
})();
