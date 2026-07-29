// ============================================================================
// /pledge-photo?id=…[&w=…] — same-origin photos for Pledge Wall cards
// ----------------------------------------------------------------------------
// Pledge photos are stored on Google Drive (drive.google.com/thumbnail?id=…),
// whose URLs are slow for visitors (third-party connection, no edge cache) and
// occasionally flaky. Serving the bytes from our own domain lets pledge-wall
// cards load fast from the Cloudflare edge — same reasoning as post-image.js
// for Ambassador Notes covers.
//
// The optional w=480|800|1200 asks Drive for a right-sized thumbnail so a
// 400px card doesn't download a 1600px image.
//
// Only files Drive itself serves publicly can pass through here (Drive
// enforces its own ACL), and only image content-types are forwarded. Anything
// else is a plain 404 — the front-end hides the card's photo on error.
// ============================================================================

// Whitelisted so arbitrary values can't fragment the cache.
const WIDTHS = new Set(['480', '800', '1200']);
const DEFAULT_WIDTH = '800';

export async function onRequestGet(context) {
  const { request, waitUntil } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  const wParam = url.searchParams.get('w') || '';
  const w = WIDTHS.has(wParam) ? wParam : DEFAULT_WIDTH;

  // Drive file ids are long [-\w] tokens; reject anything else outright.
  if (!/^[\w-]{10,80}$/.test(id)) return new Response('Not found', { status: 404 });

  const cache = caches.default;
  const cacheKey = new Request(url.origin + url.pathname + '?id=' + id + '&w=' + w, { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  try {
    const img = await fetch(
      'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + w,
      { cf: { cacheTtl: 86400, cacheEverything: true }, redirect: 'follow' }
    );
    const type = img.headers.get('content-type') || '';
    if (!img.ok || !type.startsWith('image/')) return new Response('Not found', { status: 404 });
    const res = new Response(img.body, {
      status: 200,
      headers: {
        'content-type': type,
        'cache-control': 'public, max-age=86400, s-maxage=86400'
      }
    });
    waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
}
