// Generate sitemap.xml for all public pages, using each file's last git
// commit date as <lastmod>. Run after adding or editing pages: npm run seo

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ROOT, listPublicPages, urlFor } = require('./seo-config');

function lastmod(page) {
  try {
    const out = execSync(`git log -1 --format=%cs -- "${page}"`, {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch (_) {
    // fall through to file mtime
  }
  return fs.statSync(path.join(ROOT, page)).mtime.toISOString().slice(0, 10);
}

const entries = listPublicPages().map((page) => {
  return [
    '  <url>',
    `    <loc>${urlFor(page)}</loc>`,
    `    <lastmod>${lastmod(page)}</lastmod>`,
    '  </url>',
  ].join('\n');
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`Wrote sitemap.xml with ${entries.length} URLs.`);
