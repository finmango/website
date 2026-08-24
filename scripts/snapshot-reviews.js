#!/usr/bin/env node
/**
 * ============================================================================
 * Snapshot the Millionaire Mindset student survey into data/reviews.js
 * ============================================================================
 * The education page has claimed "16,000 reviews, not one of them edited"
 * since it was written, and then showed the reader none of them — the only way
 * through was a link out to a raw Google Sheet, which nobody clicks. This bakes
 * the aggregate numbers and a readable sample of the responses into a static
 * file the page ships with, so the proof is on screen instead of one hop away.
 *
 * The sample is NOT curated for sentiment. Comments are picked by a stable hash
 * of their own text, stratified across years, so the mix of raves, shrugs and
 * criticism that lands on the page is the mix that's in the sheet. That is the
 * whole point of the claim — a wall of five-star quotes would be worth less
 * than the spreadsheet link it replaced.
 *
 * Two filters do run, and neither is about sentiment:
 *   - respondents are overwhelmingly minors, so the free-text "Additional Info"
 *     column (name / school) is never emitted, and any contact detail that
 *     turns up inside a comment drops the row;
 *   - a short hard-profanity blocklist drops a handful of rows (8 of 16.5k at
 *     the time of writing) that can't run unattended on a school-facing page.
 * Everything else — including every "this was boring" — ships as written.
 *
 * Run by .github/workflows/daily-update.yml. Sibling of snapshot-posts.js and
 * snapshot-pledges.js, and fails soft for the same reason: a wobbly upstream
 * must not break the build or blank the section, so on any error the existing
 * snapshot stands.
 * ----------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'reviews.js');

// The public post-program survey. Same sheet the page links out to, so the
// numbers here and the numbers a reader counts by hand always agree.
const SHEET_ID = '1s6Cme1fAsFG-XFtyo9c1MSoLzafpK9MmASopbEvPBMA';
const TAB = 'Mindset Survey';

const TIMEOUT_MS = 90000;
const ATTEMPTS = 3;

// How many comments reach the page. The wall shuffles client-side, so this is
// a depth budget, not a display count — big enough that a reader who keeps
// pulling never hits the end, small enough to stay a ~40KB static file.
const SAMPLE_TARGET = 240;
// Long enough to say something, short enough to read in a card.
const MIN_LEN = 55;
const MAX_LEN = 420;

// Contact details occasionally turn up in the free-text box. Drop the row.
const CONTACT = [/[\w.+-]+@[\w-]+\.\w{2,}/, /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/, /(^|\s)@[A-Za-z_][A-Za-z0-9_.]{2,}/];
// Deliberately short and deliberately not a criticism filter.
const PROFANITY = /\b(f+u+c+k+\w*|sh[i1]t+\w*|b[i1]tch\w*|c+u+n+t+|n[i1]gg\w*|retard\w*|wh[o0]re|d[i1]ck head|assh[o0]le)\b/i;

function gvizUrl() {
  return 'https://docs.google.com/spreadsheets/d/' + SHEET_ID
    + '/gviz/tq?tqx=out:json&headers=1&sheet=' + encodeURIComponent(TAB)
    + '&_=' + Date.now();
}

async function fetchTable() {
  let lastErr;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(gvizUrl(), { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const open = text.indexOf('(');
      const close = text.lastIndexOf(')');
      if (open < 0 || close < 0) throw new Error('unrecognised gviz envelope');
      const json = JSON.parse(text.slice(open + 1, close));
      if (json.status === 'error') {
        throw new Error('gviz error on tab "' + TAB + '": ' + JSON.stringify(json.errors || []).slice(0, 160));
      }
      return json.table;
    } catch (err) {
      lastErr = err;
      if (attempt < ATTEMPTS) {
        console.warn('  attempt ' + attempt + ' failed (' + err.message + ') — retrying');
        await new Promise((r) => setTimeout(r, attempt * 5000));
      }
    }
  }
  throw lastErr;
}

// Match columns by what the header says rather than by position — the form has
// picked up and dropped questions over five years and the order has moved.
const COLUMN_PATTERNS = {
  classification: /^classification/i,
  ageAppropriate: /appropriate for the targeted age/i,
  engaging: /engaging and interactive/i,
  comprehensive: /comprehensive and of appropriate length/i,
  roth: /roth ira/i,
  comment: /^general comments/i,
  submitted: /^submitted at|^timestamp/i
};

function mapColumns(labels) {
  const map = {};
  Object.keys(COLUMN_PATTERNS).forEach((key) => {
    labels.forEach((label, i) => {
      if (map[key] === undefined && COLUMN_PATTERNS[key].test(String(label || '').trim())) map[key] = i;
    });
  });
  return map;
}

function cellValue(row, i) {
  if (i === undefined) return null;
  const c = row.c || [];
  if (i >= c.length || !c[i]) return null;
  return c[i].v;
}

// gviz hands datetimes back as the literal string "Date(2025,4,14,5,1,26)".
function yearOf(v) {
  if (typeof v !== 'string') return null;
  const m = /^Date\((\d{4})/.exec(v);
  return m ? Number(m[1]) : null;
}

// FNV-1a. Any stable hash works; the point is that the same comment sorts to
// the same place on every rebuild, so a daily run doesn't reshuffle the file.
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function round1(n) { return Math.round(n * 10) / 10; }

function main() {
  return fetchTable().then((table) => {
    const labels = (table.cols || []).map((c) => (c && c.label) || '');
    const col = mapColumns(labels);
    const rows = table.rows || [];

    ['classification', 'roth', 'comment'].forEach((k) => {
      if (col[k] === undefined) throw new Error('could not find the "' + k + '" column in: ' + labels.join(' | ').slice(0, 200));
    });

    const scores = { ageAppropriate: [], engaging: [], comprehensive: [] };
    const byKind = {};
    const years = {};
    let rothYes = 0;
    let rothTotal = 0;
    let withComment = 0;
    const candidates = [];

    rows.forEach((row) => {
      const kind = String(cellValue(row, col.classification) || '').trim() || 'Student';
      byKind[kind] = (byKind[kind] || 0) + 1;

      Object.keys(scores).forEach((k) => {
        const v = cellValue(row, col[k]);
        if (typeof v === 'number' && v >= 1 && v <= 5) scores[k].push(v);
      });

      const r = cellValue(row, col.roth);
      if (r === true || r === false) { rothTotal++; if (r) rothYes++; }

      const year = yearOf(cellValue(row, col.submitted));
      if (year) years[year] = (years[year] || 0) + 1;

      const raw = cellValue(row, col.comment);
      const comment = raw === null || raw === undefined ? '' : String(raw).replace(/\s+/g, ' ').trim();
      if (!comment) return;
      withComment++;

      // Everything below decides only whether this row is safe to render on a
      // school-facing page unattended — never whether it is flattering.
      if (comment.length < MIN_LEN || comment.length > MAX_LEN) return;
      if (PROFANITY.test(comment)) return;
      if (CONTACT.some((re) => re.test(comment))) return;

      candidates.push({ c: comment, k: kind, y: year || null });
    });

    const total = rows.length;
    if (!total) throw new Error('survey returned zero rows — keeping the previous snapshot');

    // Stratify by year so the wall isn't dominated by whichever year ran the
    // most sessions, then fill any shortfall from the remaining pool.
    const buckets = {};
    candidates.forEach((r) => {
      const key = r.y || 'undated';
      (buckets[key] = buckets[key] || []).push(r);
    });
    const keys = Object.keys(buckets).sort();
    keys.forEach((k) => buckets[k].sort((a, b) => hash(a.c) - hash(b.c)));

    const perYear = Math.ceil(SAMPLE_TARGET / Math.max(keys.length, 1));
    const picked = [];
    const seen = new Set();
    keys.forEach((k) => {
      buckets[k].slice(0, perYear).forEach((r) => {
        if (seen.has(r.c)) return;
        seen.add(r.c);
        picked.push(r);
      });
    });
    if (picked.length < SAMPLE_TARGET) {
      candidates
        .slice()
        .sort((a, b) => hash(a.c) - hash(b.c))
        .forEach((r) => {
          if (picked.length >= SAMPLE_TARGET || seen.has(r.c)) return;
          seen.add(r.c);
          picked.push(r);
        });
    }
    const sample = picked.slice(0, SAMPLE_TARGET).sort((a, b) => hash(a.c) - hash(b.c));

    if (!sample.length) throw new Error('no publishable comments survived the safety filters');

    const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
    const means = {
      ageAppropriate: avg(scores.ageAppropriate),
      engaging: avg(scores.engaging),
      comprehensive: avg(scores.comprehensive)
    };
    const present = Object.values(means).filter((v) => v !== null);
    const yearNums = Object.keys(years).map(Number).filter(Boolean).sort();

    const stats = {
      total: total,
      withComment: withComment,
      byKind: byKind,
      firstYear: yearNums[0] || null,
      lastYear: yearNums[yearNums.length - 1] || null,
      rothYesPct: rothTotal ? Math.round((rothYes / rothTotal) * 100) : null,
      rothTotal: rothTotal,
      scores: {
        ageAppropriate: means.ageAppropriate === null ? null : round1(means.ageAppropriate),
        engaging: means.engaging === null ? null : round1(means.engaging),
        comprehensive: means.comprehensive === null ? null : round1(means.comprehensive)
      },
      scoreMean: present.length ? round1(avg(present)) : null,
      sampled: sample.length
    };

    const body = '// Generated by scripts/snapshot-reviews.js — do not edit by hand.\n'
      + '// Aggregates cover every response in the public survey sheet. The sampled\n'
      + '// comments are picked by a stable hash of their own text, not by sentiment.\n'
      + 'window.__REVIEWS_SNAPSHOT = '
      + JSON.stringify({ t: new Date().toISOString(), stats: stats, rows: sample }) + ';\n';

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, body);
    console.log('Wrote ' + path.relative(ROOT, OUT) + ' — ' + total + ' responses, '
      + sample.length + ' comments sampled, ' + Math.round(body.length / 1024) + ' KB');
  });
}

main().catch((err) => {
  const kept = fs.existsSync(OUT) ? 'existing snapshot kept' : 'no snapshot yet — the section stays hidden';
  console.warn('::warning::Reviews snapshot skipped (' + err.message + ') — ' + kept);
  process.exit(0); // never fail the build over this
});
