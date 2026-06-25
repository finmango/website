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
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let res;
  try {
    const upstreamRes = await fetch(upstream, {
      cf: { cacheTtl: EDGE_TTL, cacheEverything: true },
      headers: { accept: 'application/json' }
    });
    const body = await upstreamRes.text();
    res = new Response(body, {
      status: upstreamRes.ok ? 200 : 502,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': `public, max-age=${EDGE_TTL}, s-maxage=${EDGE_TTL}`,
        'access-control-allow-origin': '*'
      }
    });
  } catch (e) {
    // Don't cache failures — let the next request retry the backend.
    return jsonResponse({ result: 'error', error: 'Backend unavailable' }, 502);
  }

  if (res.status === 200) waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
