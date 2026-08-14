#!/usr/bin/env node
/**
 * ============================================================================
 * Build 1200x630 social cards for Ambassador Notes whose covers don't fit
 * ============================================================================
 * Social previews are rendered in a ~1.91:1 frame, and every platform gets
 * there by cropping. A 16:9 photo survives that; a 2.7:1 chart with its own
 * headline, axis labels and source line does not — a quarter of its width is
 * simply gone from the share, and the text that's left is tiny.
 *
 * So for covers that are too wide (or too tall) to crop, this renders the cover
 * whole onto a 1200x630 card — scripts/og-post-template.html, the same
 * puppeteer + bundled-fonts recipe as scripts/render-og.js — and functions/
 * post.js points og:image / twitter:image at that card instead of the raw cover.
 * Covers that already crop cleanly are left alone: a full-bleed photo makes the
 * stronger share.
 *
 * Idempotent. og/posts/manifest.json records what each card was built from, so
 * a run with nothing new never even launches Chromium (and never re-commits an
 * identical PNG). Cards are keyed by post id and never pruned — the snapshot
 * only carries currently published notes, and an old share link should keep
 * working.
 *
 *   node scripts/generate-post-og.js               # anything new or changed
 *   node scripts/generate-post-og.js --force       # rebuild every card
 *   node scripts/generate-post-og.js --id=<postId> # just this note
 *
 * Run by .github/workflows/daily-update.yml after the posts snapshot, and fails
 * soft for the same reason its siblings do: no social card is a worse preview,
 * not a broken build.
 * ----------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', 'posts.js');
const TUNING = path.join(ROOT, 'data', 'cover-tuning.json');
const TEMPLATE = path.join(__dirname, 'og-post-template.html');
const OUT_DIR = path.join(ROOT, 'og', 'posts');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');

const CARD_W = 1200;
const CARD_H = 630;

// Covers between these ratios crop into a 1.91:1 social frame without losing
// anything that matters. Outside them, the crop starts eating content: a 2.7:1
// chart loses ~30% of its width, a 4:5 portrait ~40% of its height.
const KEEP_MIN_RATIO = 1.25;
const KEEP_MAX_RATIO = 2.15;

// Bump when the template changes so existing cards get rebuilt on the next run.
const RENDERER = 1;

const FETCH_TIMEOUT_MS = 30000;

const round = n => Math.round(n * 100) / 100;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY_ID = (args.find(a => a.startsWith('--id=')) || '').slice('--id='.length);

function readSnapshot() {
  const src = fs.readFileSync(SNAPSHOT, 'utf8');
  const start = src.indexOf('{');
  const end = src.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('could not parse data/posts.js');
  const snap = JSON.parse(src.slice(start, end + 1));
  return Array.isArray(snap.rows) ? snap.rows.filter(r => r && r.id && r.cover) : [];
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; }
}

// Post ids are already slug-shaped; this is belt-and-braces against a stray id
// turning into a path.
const safeId = id => String(id).toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 120);

// Covers occasionally reach the snapshot HTML-escaped (…?id=x&amp;sz=w2000).
const coverUrl = cover => String(cover).replace(/&amp;/g, '&');

// 'card' / 'cover' from data/cover-tuning.json override the ratio test; anything
// else (including nothing) leaves the decision automatic.
function tunedMode(tuning, id) {
  const entry = tuning && tuning[id];
  const mode = entry && typeof entry === 'object' ? entry.og : '';
  return mode === 'card' || mode === 'cover' ? mode : 'auto';
}

function tunedBg(tuning, id) {
  const entry = tuning && tuning[id];
  const bg = entry && typeof entry === 'object' ? entry.bg : '';
  return typeof bg === 'string' && /^(#[0-9a-f]{3,8}|rgb|hsl)/i.test(bg) ? bg : '';
}

async function fetchDataUri(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { accept: 'image/*' }
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const type = (res.headers.get('content-type') || '').split(';')[0];
  if (!type.startsWith('image/')) throw new Error('not an image (' + (type || 'no content-type') + ')');
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error('empty response');
  return 'data:' + type + ';base64,' + buf.toString('base64');
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium',
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
  ].filter(Boolean);
  return candidates.find(p => fs.existsSync(p));
}

function loadPuppeteer() {
  try { return require('puppeteer'); } catch (e) { /* fall through */ }
  try { return require('puppeteer-core'); } catch (e) { /* fall through */ }
  throw new Error('puppeteer not installed — run: npm i --no-save puppeteer-core');
}

async function main() {
  const rows = readSnapshot().filter(r => !ONLY_ID || r.id === ONLY_ID);
  if (!rows.length) {
    console.log('No published notes with covers to consider.');
    return;
  }

  const tuning = readJson(TUNING, {});
  const manifest = readJson(MANIFEST, null) || { generated: '', posts: {} };
  if (!manifest.posts || typeof manifest.posts !== 'object') manifest.posts = {};

  // A post needs looking at when we've never seen it, when its cover changed,
  // when an editor changed its og mode, or when the template moved on.
  const pending = rows.filter(row => {
    if (FORCE) return true;
    const known = manifest.posts[row.id];
    if (!known) return true;
    const cardMissing = known.card && !fs.existsSync(path.join(ROOT, known.card));
    return cardMissing
      || known.cover !== coverUrl(row.cover)
      || known.mode !== tunedMode(tuning, row.id)
      || known.renderer !== RENDERER;
  });

  if (!pending.length) {
    console.log('Social cards up to date — ' + rows.length + ' notes checked, nothing to build.');
    return;
  }

  const puppeteer = loadPuppeteer();
  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium']
  };
  const chrome = findChrome();
  if (chrome) launchOpts.executablePath = chrome;   // full puppeteer ships its own

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch(launchOpts);
  let built = 0, skipped = 0, failed = 0;

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: CARD_W, height: CARD_H, deviceScaleFactor: 1 });
    await page.goto('file://' + TEMPLATE, { waitUntil: 'networkidle0' });

    for (const row of pending) {
      const mode = tunedMode(tuning, row.id);
      const rel = 'og/posts/' + safeId(row.id) + '.jpg';
      const out = path.join(OUT_DIR, safeId(row.id) + '.jpg');

      try {
        const dataUri = await fetchDataUri(coverUrl(row.cover));
        const info = await page.evaluate(
          data => window.setPost(data),
          { cover: dataUri, author: row.authorName || '', category: row.category || '', bg: tunedBg(tuning, row.id) }
        );

        const cropsCleanly = info.ratio >= KEEP_MIN_RATIO && info.ratio <= KEEP_MAX_RATIO;
        const wantCard = mode === 'card' || (mode === 'auto' && !cropsCleanly);

        if (!wantCard) {
          if (fs.existsSync(out)) fs.unlinkSync(out);   // cover was re-cropped upstream
          manifest.posts[row.id] = {
            card: null, cover: coverUrl(row.cover), ratio: round(info.ratio), mode, renderer: RENDERER
          };
          skipped++;
          console.log('· ' + row.id + ' — cover is ' + round(info.ratio) + ':1, crops cleanly (no card needed)');
          continue;
        }

        const el = await page.$('#capture');
        await el.screenshot({ path: out, type: 'jpeg', quality: 92 });
        manifest.posts[row.id] = {
          card: rel, w: CARD_W, h: CARD_H, cover: coverUrl(row.cover), ratio: round(info.ratio), mode, renderer: RENDERER
        };
        built++;
        console.log('✓ ' + rel + ' — cover is ' + round(info.ratio) + ':1'
          + (mode === 'card' ? ' (card forced by data/cover-tuning.json)' : ' (too far from 1.91:1 to crop)')
          + ', ' + Math.round(fs.statSync(out).size / 1024) + 'KB');
      } catch (err) {
        failed++;
        console.warn('::warning::Social card for ' + row.id + ' skipped (' + err.message + ')');
      }
    }
  } finally {
    await browser.close();
  }

  manifest.generated = new Date().toISOString();
  const ordered = {};
  Object.keys(manifest.posts).sort().forEach(k => { ordered[k] = manifest.posts[k]; });
  manifest.posts = ordered;
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

  console.log('Done — ' + built + ' card(s) built, ' + skipped + ' cover(s) left full-bleed, ' + failed + ' failed.');
}

main().catch(err => {
  console.warn('::warning::Social card generation skipped (' + err.message + ') — '
    + 'shares fall back to the raw cover image');
  process.exit(0);   // never fail the build over a preview image
});
