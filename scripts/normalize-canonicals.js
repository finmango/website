// Normalize canonical / og:url / twitter:url tags across all public pages.
//
// - Canonical URLs use the clean, extension-less form on www.finmango.org
//   (the `_redirects` file 301s .html URLs, so a .html canonical points at
//   a redirect — a signal conflict for search engines).
// - Pages missing a canonical tag get one inserted before </head>.
// - og:url and twitter:url are set to match the canonical.
//
// Run after adding new pages: npm run seo

const fs = require('fs');
const path = require('path');
const { ROOT, listPublicPages, urlFor } = require('./seo-config');

let fixed = 0;
let inserted = 0;

for (const page of listPublicPages()) {
  const abs = path.join(ROOT, page);
  const original = fs.readFileSync(abs, 'utf8');
  let html = original;
  const url = urlFor(page);

  const canonicalTag = `<link rel="canonical" href="${url}">`;
  if (/<link\s+rel="canonical"/.test(html)) {
    html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/g, canonicalTag);
  } else if (html.includes('</head>')) {
    html = html.replace('</head>', `  ${canonicalTag}\n</head>`);
    inserted++;
  }

  html = html.replace(
    /(<meta\s+property="og:url"\s+content=")[^"]*(")/g,
    `$1${url}$2`
  );
  html = html.replace(
    /(<meta\s+name="twitter:url"\s+content=")[^"]*(")/g,
    `$1${url}$2`
  );

  if (html !== original) {
    fs.writeFileSync(abs, html);
    fixed++;
  }
}

console.log(`Updated ${fixed} pages (${inserted} canonical tags newly inserted).`);
