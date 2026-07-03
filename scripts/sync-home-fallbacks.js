// Sync the static fallback numbers on the homepage with the latest
// barometer data. The hero and the Financial Anxiety readout are hard-coded
// in index.html so no-JS visitors and search engines see a real value —
// this keeps that value from drifting out of date between deploys.
// Run after the data pipeline: node scripts/sync-home-fallbacks.js

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataPath = path.join(root, 'data', 'dashboard-data.js');
const indexPath = path.join(root, 'index.html');

const dataSrc = fs.readFileSync(dataPath, 'utf8');
const match = dataSrc.match(/"financial_anxiety":\s*{\s*"value":\s*([\d.]+)/);
if (!match) {
  console.error('sync-home-fallbacks: could not find national financial_anxiety value — leaving index.html untouched');
  process.exit(0);
}
const value = Math.round(parseFloat(match[1]));

let html = fs.readFileSync(indexPath, 'utf8');
const before = html;
html = html.replace(
  /(<span class="stat-num" id="headline-stat-value">)[^<]*(<\/span>)/,
  `$1${value}$2`
);
html = html.replace(
  /(<div class="barometer-indicator-value" id="home-val-anxiety">)[^<]*(<\/div>)/,
  `$1${value}$2`
);

if (html !== before) {
  fs.writeFileSync(indexPath, html);
  console.log(`sync-home-fallbacks: homepage fallback updated to ${value}`);
} else {
  console.log(`sync-home-fallbacks: homepage already shows ${value}, no change`);
}
