// Shared SEO configuration: which pages are public, and what their
// canonical (clean, extension-less) URLs are. Used by
// normalize-canonicals.js and generate-sitemap.js.
//
// Cloudflare Pages `_redirects` 301s every /*.html URL to its clean
// equivalent, so canonical URLs must never include the .html extension.

const fs = require('fs');
const path = require('path');

const SITE = 'https://www.finmango.org';
const ROOT = path.join(__dirname, '..');

// Internal utility pages: social-graphic generators, print artifacts,
// private posting/review tools. Kept out of the sitemap, given no
// canonical tag, and disallowed in robots.txt.
const INTERNAL_PAGES = new Set([
  'ambassador-graphics.html',
  'barrier-breakers-flyer.html',
  'barrier-breakers-one-pager-2026.html',
  'bob-post.html',
  'instagram-ambassador-2026.html',
  'instagram-post.html',
  'judging-form.html',
  'linkedin-ambassador-2026.html',
  'linkedin-barometer.html',
  'linkedin-company-banner.html',
  'linkedin-cover.html',
  'og-barometer.html',
  'one-pager.html',
  'post-review.html',
  'post.html', // query-param post viewer; canonicalizing it would collapse all posts
  'resource-graphics.html',
  'social-post.html',
]);

// Subdirectories that contain public pages.
const PUBLIC_DIRS = ['ai-ready', 'judges', 'talent'];

function listPublicPages() {
  const pages = [];
  for (const f of fs.readdirSync(ROOT)) {
    if (f.endsWith('.html') && !INTERNAL_PAGES.has(f)) pages.push(f);
  }
  for (const dir of PUBLIC_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (f.endsWith('.html')) pages.push(path.posix.join(dir, f));
    }
  }
  return pages.sort();
}

// Map a repo-relative HTML path to its canonical URL.
function urlFor(page) {
  if (page === 'index.html') return `${SITE}/`;
  if (page.endsWith('/index.html')) return `${SITE}/${page.slice(0, -'index.html'.length)}`;
  return `${SITE}/${page.replace(/\.html$/, '')}`;
}

module.exports = { SITE, ROOT, INTERNAL_PAGES, listPublicPages, urlFor };
