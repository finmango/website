// ============================================================================
// /post-image?id=…[&w=…] — same-origin cover image for cards, articles & shares
// ----------------------------------------------------------------------------
// A post's cover is stored on Google Drive (drive.google.com/thumbnail?id=…),
// whose URLs are unreliable for crawlers (redirects, rate limits, the odd HTML
// response) and slow for visitors (third-party connection, no edge cache).
// Serving the bytes from our own domain makes the cover show up dependably as
// the og:image / twitter:image AND lets posts.html / post.html load covers
// fast from the Cloudflare edge.
//
// The optional w=480|800|1200|1600 asks Drive for a right-sized thumbnail, so
// a 400px card doesn't download a 2000px image. Non-Drive covers ignore it.
//
// Falls back to the default FinMango card if the post has no cover or the
// upstream image can't be fetched.
// ============================================================================

import { fetchPostJson, DEFAULT_OG_IMAGE } from './_shared.js';

// Whitelisted so arbitrary values can't fragment the cache.
const WIDTHS = new Set(['480', '800', '1200', '1600']);

// Ask Drive's thumbnailer for the requested width; leave other hosts alone.
function sizedCoverUrl(cover, w) {
  if (!w) return cover;
  try {
    const u = new URL(cover);
    if (u.hostname === 'drive.google.com' && u.pathname === '/thumbnail') {
      u.searchParams.set('sz', 'w' + w);
      return u.toString();
    }
  } catch (e) { /* not a URL we can resize */ }
  return cover;
}

export async function onRequestGet(context) {
  const { request, waitUntil } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  const wParam = url.searchParams.get('w') || '';
  const w = WIDTHS.has(wParam) ? wParam : '';

  // Serve straight from the edge cache when possible — repeat visitors (and
  // every card on posts.html after the first paint) never re-run the Apps
  // Script lookup or the Drive fetch. The key is normalized to id + w only.
  const cache = caches.default;
  const cacheKey = new Request(
    url.origin + url.pathname + '?id=' + encodeURIComponent(id) + (w ? '&w=' + w : ''),
    { method: 'GET' }
  );
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const post = id ? await fetchPostJson(id) : null;
  const coverUrl = post && post.cover ? sizedCoverUrl(post.cover, w) : '';
  if (!coverUrl) return Response.redirect(DEFAULT_OG_IMAGE, 302);

  try {
    const img = await fetch(coverUrl, {
      cf: { cacheTtl: 86400, cacheEverything: true },
      redirect: 'follow'
    });
    const type = img.headers.get('content-type') || '';
    if (!img.ok || !type.startsWith('image/')) return Response.redirect(DEFAULT_OG_IMAGE, 302);
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
    return Response.redirect(DEFAULT_OG_IMAGE, 302);
  }
}
