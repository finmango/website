#!/usr/bin/env node
/**
 * Render a hand-made social card for one Ambassador Note.
 *
 * Most notes get their share image automatically (the raw cover, or a card
 * built by scripts/generate-post-og.js). When a cover makes a poor share — a
 * screenshot of someone else's article, say — write a 1200x630 page under
 * scripts/og-custom/<postId>.html, render it with this script, and mark the
 * note `"og": "custom"` in data/cover-tuning.json so the daily generator
 * leaves the card alone.
 *
 *   node scripts/render-og-custom.js <postId>
 *
 * Writes og/posts/<postId>.jpg and records it in og/posts/manifest.json, which
 * is what functions/post.js reads to point og:image at the card.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(__dirname, 'og-custom');
const OUT_DIR = path.join(ROOT, 'og', 'posts');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');
const CARD_W = 1200;
const CARD_H = 630;

const id = (process.argv[2] || '').trim();
if (!id || /[^a-z0-9-]/.test(id)) {
  console.error('usage: node scripts/render-og-custom.js <postId>   (ids are lowercase slugs)');
  process.exit(1);
}

const src = path.join(SRC_DIR, id + '.html');
if (!fs.existsSync(src)) {
  console.error('no source page at ' + path.relative(ROOT, src));
  process.exit(1);
}

function findChrome() {
  return [process.env.CHROME_PATH, '/opt/pw-browsers/chromium']
    .filter(Boolean).find(p => fs.existsSync(p));
}

function loadPuppeteer() {
  try { return require('puppeteer'); } catch (e) { /* fall through */ }
  try { return require('puppeteer-core'); } catch (e) { /* fall through */ }
  throw new Error('puppeteer not installed — run: npm i --no-save puppeteer-core');
}

async function main() {
  const puppeteer = loadPuppeteer();
  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium']
  };
  const chrome = findChrome();
  if (chrome) launchOpts.executablePath = chrome;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, id + '.jpg');
  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
    await page.goto('file://' + src, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const el = await page.$('#capture');
    if (!el) throw new Error('source page has no #capture element');
    await el.screenshot({ path: out, type: 'jpeg', quality: 92 });
  } finally {
    await browser.close();
  }

  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch (e) { manifest = null; }
  if (!manifest || typeof manifest !== 'object') manifest = { generated: '', posts: {} };
  if (!manifest.posts || typeof manifest.posts !== 'object') manifest.posts = {};
  const prev = manifest.posts[id] || {};
  manifest.posts[id] = {
    card: 'og/posts/' + id + '.jpg', w: CARD_W, h: CARD_H,
    cover: prev.cover || '', ratio: prev.ratio == null ? null : prev.ratio,
    mode: 'custom', renderer: prev.renderer == null ? 1 : prev.renderer
  };
  manifest.generated = new Date().toISOString();
  const ordered = {};
  Object.keys(manifest.posts).sort().forEach(k => { ordered[k] = manifest.posts[k]; });
  manifest.posts = ordered;
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

  console.log('✓ ' + path.relative(ROOT, out) + ' — ' + Math.round(fs.statSync(out).size / 1024) + 'KB (custom card)');
}

main().catch(err => { console.error(err.message); process.exit(1); });
