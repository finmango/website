#!/usr/bin/env node
/**
 * validate-barometer.js — Cross-sectional concurrent-validity check
 * ------------------------------------------------------------------
 * Standalone research utility (NOT part of the daily pipeline). Tests whether
 * the published Financial Health Barometer indices rank the 50 states + DC the
 * way an INDEPENDENT, held-out ground-truth series does.
 *
 * Ground truth: "Food Insecurity" from the County Health Rankings 2025 national
 * file, which carries Feeding America's Map the Meal Gap estimates. This is a
 * genuinely held-out target — the Barometer's Food Insecurity index is nominally
 * driven by Census SAIPE poverty, not by food-insecurity surveys.
 *
 * Usage:  node scripts/validate-barometer.js
 * Reads:  data/latest.json (local Barometer snapshot)
 * Fetches: County Health Rankings analytic_data2025_v3.csv (~13 MB, cached to /tmp)
 *
 * NOTE: This is a single-snapshot cross-sectional test. It speaks to the
 * state-RANKING validity of the indices, NOT to the "real-time / nowcasting"
 * temporal claim, which requires an index time series we do not yet retain.
 */
'use strict';
const fs = require('fs');
const https = require('https');
const path = require('path');

const CHR_URL = 'https://www.countyhealthrankings.org/sites/default/files/media/document/analytic_data2025_v3.csv';
const CHR_CACHE = '/tmp/chr2025.csv';
const SNAPSHOT = path.join(__dirname, '..', 'data', 'latest.json');

// ---- tiny CSV line parser (handles quoted fields) ----
function parseLine(line) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else { if (c === ',') { out.push(cur); cur = ''; } else if (c === '"') q = true; else cur += c; }
  }
  out.push(cur); return out;
}

// ---- stats ----
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
function pearson(x, y) {
  const n = x.length, mx = mean(x), my = mean(y);
  let nu = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { const a = x[i] - mx, b = y[i] - my; nu += a * b; dx += a * a; dy += b * b; }
  return nu / Math.sqrt(dx * dy);
}
function rank(a) {
  const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = [];
  let i = 0;
  while (i < idx.length) {
    let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1; for (let k = i; k <= j; k++) r[idx[k][1]] = avg; i = j + 1;
  }
  return r;
}
const spearman = (x, y) => pearson(rank(x), rank(y));
function erf(x) {
  const s = x < 0 ? -1 : 1; x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}
function pval(r, n) { const t = Math.abs(r) * Math.sqrt((n - 2) / (1 - r * r)); return 2 * (1 - 0.5 * (1 + erf(t / Math.SQRT2))); }
const fmtP = p => (p < 0.001 ? '<0.001' : p.toFixed(3));

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const go = u => https.get(u, { headers: { 'User-Agent': 'finmango-validation' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); return go(res.headers.location); }
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
      res.pipe(file); file.on('finish', () => file.close(() => resolve(dest)));
    }).on('error', reject);
    go(url);
  });
}

(async () => {
  if (!fs.existsSync(CHR_CACHE) || fs.statSync(CHR_CACHE).size < 1e6) {
    process.stdout.write('Downloading County Health Rankings 2025 …\n');
    await download(CHR_URL, CHR_CACHE);
  }

  // ---- parse CHR statewide food-insecurity rows ----
  const lines = fs.readFileSync(CHR_CACHE, 'utf8').split(/\r?\n/);
  const hdr = parseLine(lines[0]);
  const iAbbr = hdr.indexOf('State Abbreviation');
  const iCounty = hdr.indexOf('County FIPS Code');
  const iState = hdr.indexOf('State FIPS Code');
  const iFood = hdr.indexOf('Food Insecurity raw value');
  const chrFood = {};
  for (let i = 2; i < lines.length; i++) {
    if (!lines[i]) continue;
    const c = parseLine(lines[i]);
    if (c[iCounty] !== '000' || c[iState] === '00') continue; // statewide, non-US rows
    const v = parseFloat(c[iFood]);
    if (isFinite(v)) chrFood[c[iAbbr]] = v * 100; // proportion -> %
  }

  // ---- join with Barometer snapshot ----
  const d = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const rows = [];
  for (const k in d.states) {
    const s = d.states[k];
    const fi = chrFood[s.abbr];
    if (fi == null) continue;
    rows.push({
      abbr: s.abbr,
      food: s.food_insecurity?.value, finanx: s.financial_anxiety?.value,
      hous: s.housing_stress?.value, afford: s.affordability?.value,
      unemp: s.metrics?.unemployment_rate, rentb: s.metrics?.rent_burden_pct,
      jchs: s.metrics?.jchs_renters_cost_burdened, mult: s.metrics?.regional_stress_multiplier,
      chrFI: fi,
    });
  }

  const rep = (label, xk, yk, note) => {
    const f = rows.filter(r => r[xk] != null && r[yk] != null);
    const x = f.map(r => r[xk]), y = f.map(r => r[yk]);
    const r = pearson(x, y), rho = spearman(x, y);
    console.log(`${label}\n   n=${f.length}  Pearson r=${r.toFixed(3)}  Spearman ρ=${rho.toFixed(3)}  p≈${fmtP(pval(rho, f.length))}  ${note || ''}\n`);
  };

  console.log(`\nBarometer snapshot: ${d.as_of}  |  matched states: ${rows.length}\n`);
  console.log('=== PRIMARY HELD-OUT TEST (target is NOT an index input) ===');
  rep('Food Insecurity index  vs  Map-the-Meal-Gap food insecurity %', 'food', 'chrFI', '← headline');
  console.log('=== DISCRIMINANT (should be weaker than the headline) ===');
  rep('Housing Stress index   vs  food insecurity %', 'hous', 'chrFI');
  rep('Financial Anxiety idx  vs  food insecurity %', 'finanx', 'chrFI');
  console.log('=== INTERNAL CONSISTENCY (target IS an input/calibration) ===');
  rep('Financial Anxiety idx  vs  BLS unemployment', 'finanx', 'unemp', '[unemployment is the input]');
  rep('Housing Stress index   vs  ACS rent burden %', 'hous', 'rentb', '[rent burden is an input]');
  rep('Housing Stress index   vs  JCHS cost-burdened %', 'hous', 'jchs', '[JCHS = calibration source]');
  console.log('=== WHAT DRIVES EACH INDEX IN THIS SNAPSHOT (vs hand-set regional multiplier) ===');
  rep('Food Insecurity index  vs  regional_stress_multiplier', 'food', 'mult', '[r≈1.0 ⇒ no live-data signal: poverty input is null]');
  rep('Financial Anxiety idx  vs  regional_stress_multiplier', 'finanx', 'mult');
  rep('Housing Stress index   vs  regional_stress_multiplier', 'hous', 'mult');
})();
