// ============================================================================
// /api/posts — same-origin, edge-cached read proxy for the Ambassador Notes API
// ----------------------------------------------------------------------------
// posts.html and post.html call this instead of hitting the Google Apps Script
// web app directly. Two wins:
//   1. Speed — the response is cached at the Cloudflare edge, so repeat visits
//      (and crawlers) skip the slow Apps Script round-trip / cold start.
//   2. Simplicity — same-origin means no cross-origin/CORS fragility for the
//      browser, and the backend URL stays in one place (functions/_shared.js).
//
// Read-only: only the public "published" and "post" actions are proxied. The
// reviewer/submit actions never pass through here.
// ============================================================================

import { APPS_SCRIPT_URL, EDGE_TTL, jsonResponse } from '../_shared.js';

export async function onRequestGet(context) {
  const { request, waitUntil } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const id = url.searchParams.get('id') || '';

  let upstream;
  if (action === 'published') {
    upstream = APPS_SCRIPT_URL + '?action=published';
  } else if (action === 'post' && id) {
    upstream = APPS_SCRIPT_URL + '?action=post&id=' + encodeURIComponent(id);
  } else {
    return jsonResponse({ result: 'error', error: 'Unsupported action' }, 400);
  }

  const cache = caches.default;
  // Cache key is the normalized same-origin request URL (action + id).
  const cacheKey = new Request(url.origin + url.pathname + url.search, { method: 'GET' });

  // How long the browser may keep serving a stale copy while a fresh one is
  // fetched in the background. Lets repeat visitors render instantly.
  const SWR = 86400; // 1 day

  // Fetch from the backend and return a fresh, cacheable Response (or null on
  // failure). Kept long-lived in the edge cache (s-maxage) so the proxy can
  // serve it stale-while-revalidate; logical freshness is tracked separately
  // via the x-cached-at timestamp below.
  async function fetchFresh() {
    const upstreamRes = await fetch(upstream, {
      cf: { cacheTtl: EDGE_TTL, cacheEverything: true },
      headers: { accept: 'application/json' }
    });
    if (!upstreamRes.ok) return null;
    const body = await upstreamRes.text();
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': `public, max-age=${EDGE_TTL}, s-maxage=${SWR}, stale-while-revalidate=${SWR}`,
        'access-control-allow-origin': '*',
        'x-cached-at': String(Date.now())
      }
    });
  }

  const hit = await cache.match(cacheKey);
  if (hit) {
    // Serve the cached copy immediately. If it's older than EDGE_TTL, refresh
    // it in the background so the *next* visitor gets fresh data — but this
    // visitor never waits on the slow Apps Script round-trip.
    const cachedAt = Number(hit.headers.get('x-cached-at')) || 0;
    const isStale = (Date.now() - cachedAt) > EDGE_TTL * 1000;
    if (isStale) {
      waitUntil((async () => {
        try {
          const fresh = await fetchFresh();
          if (fresh) await cache.put(cacheKey, fresh.clone());
        } catch (e) { /* keep serving the stale copy */ }
      })());
    }
    return hit;
  }

  // Cold cache: nothing to serve, so this request does wait on the backend.
  let res;
  try {
    res = await fetchFresh();
  } catch (e) {
    res = null;
  }
  // Don't cache failures — let the next request retry the backend.
  if (!res) return jsonResponse({ result: 'error', error: 'Backend unavailable' }, 502);

  waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
