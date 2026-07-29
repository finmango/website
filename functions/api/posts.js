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
  // ?refresh=1 (sent by the HQ board right after a publish) skips every cache
  // layer and re-primes the edge entry, so the editor who just clicked
  // Publish sees the post live immediately instead of waiting out the TTLs.
  const refresh = url.searchParams.get('refresh') === '1';

  let upstream, keySearch;
  if (action === 'published') {
    keySearch = '?action=published';
    upstream = APPS_SCRIPT_URL + keySearch;
  } else if (action === 'post' && id) {
    keySearch = '?action=post&id=' + encodeURIComponent(id);
    upstream = APPS_SCRIPT_URL + keySearch;
  } else {
    return jsonResponse({ result: 'error', error: 'Unsupported action' }, 400);
  }

  const cache = caches.default;
  // Cache key is the normalized same-origin URL (action + id ONLY — a
  // ?refresh=1 hit re-primes the same entry every ordinary visitor reads).
  const cacheKey = new Request(url.origin + url.pathname + keySearch, { method: 'GET' });

  // How long the edge keeps a copy at all (s-maxage — logical freshness is
  // tracked separately via x-cached-at), and how long a *browser* may keep
  // rendering a stale copy while it revalidates in the background. The
  // browser window is deliberately short: repeat visits still feel instant,
  // but a freshly published post can't hide behind a day-old browser copy.
  const EDGE_KEEP = 86400;   // 1 day
  const BROWSER_SWR = 600;   // 10 minutes

  // Fetch from the backend and return a fresh, cacheable Response (or null on
  // failure). `bust` adds a throwaway param so Cloudflare's upstream cache
  // can't answer — Apps Script ignores params it doesn't know.
  async function fetchFresh(bust) {
    const upstreamRes = await fetch(upstream + (bust ? '&_=' + Date.now() : ''), {
      cf: { cacheTtl: EDGE_TTL, cacheEverything: true },
      headers: { accept: 'application/json' }
    });
    if (!upstreamRes.ok) return null;
    const body = await upstreamRes.text();
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': `public, max-age=${EDGE_TTL}, s-maxage=${EDGE_KEEP}, stale-while-revalidate=${BROWSER_SWR}`,
        'access-control-allow-origin': '*',
        'x-cached-at': String(Date.now())
      }
    });
  }

  if (refresh) {
    let fresh = null;
    try { fresh = await fetchFresh(true); } catch (e) { fresh = null; }
    if (fresh) {
      waitUntil(cache.put(cacheKey, fresh.clone()));
      return fresh;
    }
    // Backend hiccup — fall through and serve whatever the cache has.
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
