/**
 * Stamp a ?v=<date> cache-buster on every page that loads dashboard-data.js.
 *
 * GitHub Pages ignores the _headers file, so the live Cache-Control on
 * /data/dashboard-data.js is hours long. Browsers and the Cloudflare edge
 * keep serving the stale file after the daily data update — versioning the
 * URL is the only cache-bust that works without host-level header control.
 *
 * The stamp uses the data's as_of date, so the URL only changes when the
 * data actually does. Runs as part of the daily update workflow after the
 * data pipeline; safe to run standalone.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const PAGES = [
    'barometer.html',
    'index.html',
    'research.html',
    'housing-policy-lab.html',
    'judges/index.html'
];

function resolveVersion() {
    try {
        const latest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'latest.json'), 'utf8'));
        if (latest.as_of) return latest.as_of.replace(/-/g, '');
    } catch (error) {
        console.warn('  ⚠ Could not read data/latest.json, falling back to today:', error.message);
    }
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function main() {
    const version = resolveVersion();
    console.log(`🔖 Stamping dashboard-data.js references with ?v=${version}`);

    for (const page of PAGES) {
        const filePath = path.join(ROOT, page);
        if (!fs.existsSync(filePath)) {
            console.warn(`  ⚠ Skipping missing page: ${page}`);
            continue;
        }

        const source = fs.readFileSync(filePath, 'utf8');
        const updated = source.replace(
            /src="((?:\.\.\/)?data\/dashboard-data\.js)(?:\?v=[^"]*)?"/g,
            (match, file) => `src="${file}?v=${version}"`
        );

        if (updated === source) {
            console.log(`  = ${page} (already current)`);
        } else {
            fs.writeFileSync(filePath, updated);
            console.log(`  ✓ ${page}`);
        }
    }
}

main();
