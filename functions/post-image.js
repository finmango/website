// ============================================================================
// /post-image?id=…[&f=…][&w=…] — same-origin cover image for cards, articles & shares
// ----------------------------------------------------------------------------
// A post's cover is stored on Google Drive (drive.google.com/thumbnail?id=…),
// whose URLs are unreliable for crawlers (redirects, rate limits, the odd HTML
// response) and slow for visitors (third-party connection, no edge cache).
// Serving the bytes from our own domain makes the cover show up dependably as
// the og:image / twitter:image AND lets posts.html / post.html load covers
// fast from the Cloudflare edge.
//
// The optional f=<Drive file id> names the cover file directly. Every caller
// already holds the post (posts.html has the list, post.html has __POST__, the
// /post Function has just fetched it), so passing the id along means this
// route never has to ask Apps Script which file the cover is. That lookup is
// the weak link: the backend cold-starts past our budget often enough that an
// article whose HTML came straight from the edge cache would still get the
// default FinMango card as its hero, because the image's own lookup failed —
// while the cards on /posts, cached earlier, showed the real cover. The file
// id is also part of the cache key, so a cover swapped in the Sheet shows up
// as soon as the page carries the new id rather than after the day-long
// image TTL. Only Drive thumbnails can be named this way (the id is validated
// and the host is fixed), so this is not a general-purpose image proxy.
//
// Without f, the post is looked up by id as before (older cached pages, hand-
// written links).
//
// The optional w=480|800|1200|1600 asks Drive for a right-sized thumbnail, so
// a 400px card doesn't download a 2000px image. Non-Drive covers ignore it.
//
// Falls back to the default FinMango card if the post has no cover or the
// upstream image can't be fetched. That redirect is never cached: it stands
// for "couldn't get the cover just now", not "this is the cover".
// ============================================================================

import { fetchPostJson, DEFAULT_OG_IMAGE, DRIVE_FILE_ID_RE } from './_shared.js';

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

// The Drive thumbnail URL for a cover named by file id (the same shape the HQ
// board stores, so the bytes match what the post record would have given us).
function driveCoverUrl(fileId, w) {
  return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(fileId) + '&sz=w' + (w || '2000');
}

// A redirect to the default card that no cache (edge or browser) may keep.
function fallback() {
  return new Response(null, {
    status: 302,
    headers: { location: DEFAULT_OG_IMAGE, 'cache-control': 'no-store' }
  });
}

// Some crawlers (and link-checkers) probe an og:image with HEAD first. Pages
// only routes the methods a Function exports, so without this the probe falls
// through to static asset serving and comes back as the site's HTML — answer it
// with the real image headers instead.
export async function onRequestHead(context) {
  const res = await onRequestGet(context);
  return new Response(null, { status: res.status, headers: res.headers });
}

export async function onRequestGet(context) {
  const { request, waitUntil } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  const fParam = url.searchParams.get('f') || '';
  const f = DRIVE_FILE_ID_RE.test(fParam) ? fParam : '';
  const wParam = url.searchParams.get('w') || '';
  const w = WIDTHS.has(wParam) ? wParam : '';

  // Serve straight from the edge cache when possible — repeat visitors (and
  // every card on posts.html after the first paint) never re-run the Apps
  // Script lookup or the Drive fetch. The key is normalized to id + f + w only.
  const cache = caches.default;
  const cacheKey = new Request(
    url.origin + url.pathname + '?id=' + encodeURIComponent(id) + (f ? '&f=' + f : '') + (w ? '&w=' + w : ''),
    { method: 'GET' }
  );
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let coverUrl = '';
  if (f) {
    coverUrl = driveCoverUrl(f, w);
  } else {
    const post = id ? await fetchPostJson(id) : null;
    coverUrl = post && post.cover ? sizedCoverUrl(post.cover, w) : '';
  }
  if (!coverUrl) return fallback();

  try {
    const img = await fetch(coverUrl, {
      cf: { cacheTtl: 86400, cacheEverything: true },
      redirect: 'follow'
    });
    const type = img.headers.get('content-type') || '';
    if (!img.ok || !type.startsWith('image/')) return fallback();
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
    return fallback();
  }
}
