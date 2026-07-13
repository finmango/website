// ============================================================================
// /api/wall — same-origin, edge-cached read proxy for the Community Wall API
// ----------------------------------------------------------------------------
// community-wall.html calls this instead of hitting the Google Apps Script web
// app directly — same pattern (and same reasons) as functions/api/posts.js:
// edge caching hides Apps Script cold starts, and same-origin avoids CORS.
//
// Read-only: only the public "approved" action is proxied. Submissions and
// hearts POST straight to the Apps Script (no-cors), and moderation actions
// never pass through here.
// ============================================================================

import { WALL_APPS_SCRIPT_URL, jsonResponse } from '../_shared.js';

// Hearts and new approvals should show up reasonably fast, so the wall uses a
// shorter logical TTL than the posts proxy.
const WALL_TTL = 120; // seconds
const SWR = 86400;    // how long the edge may serve stale while revalidating

export async function onRequestGet(context) {
  const { request, waitUntil } = context;
  const url = new URL(request.url);

  if (url.searchParams.get('action') !== 'approved') {
    return jsonResponse({ result: 'error', error: 'Unsupported action' }, 400);
  }
  if (WALL_APPS_SCRIPT_URL.indexOf('REPLACE_WITH') === 0) {
    return jsonResponse({ result: 'error', error: 'Not configured' }, 503);
  }

  const upstream = WALL_APPS_SCRIPT_URL + '?action=approved';
  const cache = caches.default;
  const cacheKey = new Request(url.origin + url.pathname + '?action=approved', { method: 'GET' });

  async function fetchFresh() {
    const upstreamRes = await fetch(upstream, {
      cf: { cacheTtl: WALL_TTL, cacheEverything: true },
      headers: { accept: 'application/json' }
    });
    if (!upstreamRes.ok) return null;
    const body = await upstreamRes.text();
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': `public, max-age=${WALL_TTL}, s-maxage=${SWR}, stale-while-revalidate=${SWR}`,
        'access-control-allow-origin': '*',
        'x-cached-at': String(Date.now())
      }
    });
  }

  const hit = await cache.match(cacheKey);
  if (hit) {
    // Serve the cached copy immediately; refresh in the background once it's
    // older than WALL_TTL so the next visitor gets fresh data.
    const cachedAt = Number(hit.headers.get('x-cached-at')) || 0;
    const isStale = (Date.now() - cachedAt) > WALL_TTL * 1000;
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

  let res;
  try {
    res = await fetchFresh();
  } catch (e) {
    res = null;
  }
  if (!res) return jsonResponse({ result: 'error', error: 'Backend unavailable' }, 502);

  waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
