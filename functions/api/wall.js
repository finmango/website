// ============================================================================
// /api/wall — same-origin, edge-cached read proxy for the Community Wall API
// ----------------------------------------------------------------------------
// community-wall.html and pledge-wall.html call this instead of hitting the
// Google Apps Script web app directly — same pattern (and same reasons) as
// functions/api/posts.js: edge caching hides Apps Script cold starts, and
// same-origin avoids CORS.
//
// Read-only: only the public "approved" (wall stories) and "pledges" (Pledge
// Wall) actions are proxied. Submissions and hearts POST straight to the Apps
// Script (no-cors), and moderation actions never pass through here.
// ============================================================================

import { WALL_APPS_SCRIPT_URL, jsonResponse } from '../_shared.js';

// Hearts and new approvals should show up reasonably fast, so the wall uses a
// shorter logical TTL than the posts proxy.
const WALL_TTL = 120; // seconds a cached copy counts as fresh
// Past the TTL a stale copy may still answer *once* while a refresh runs behind
// it — that's what hides an Apps Script cold start. But only within this grace
// window: beyond it, staleness is the worse problem and the request waits for
// real data. Without a bound, a low-traffic colo could sit on an old list for
// hours, because the visitor who triggers the refresh never sees its result and
// `caches.default` is per-datacentre, so HQ re-priming after a decision only
// fixes the one colo the reviewer's browser happened to hit. An approved pledge
// really was ~26 minutes late to the wall this way.
const WALL_GRACE = 120; // seconds past the TTL that stale may still answer
const SWR = WALL_TTL + WALL_GRACE; // what downstream caches are told
// Waiting for real data is right, but not without a limit: Apps Script cold
// starts run into seconds and the wall shows nothing until this resolves. Past
// this, a stale list beats an empty page — the refresh still finishes in the
// background and the next visitor gets it.
const UPSTREAM_BUDGET = 2500; // ms

const PUBLIC_ACTIONS = new Set(['approved', 'pledges']);

export async function onRequestGet(context) {
  const { request, waitUntil } = context;
  const url = new URL(request.url);

  const action = url.searchParams.get('action') || '';
  if (!PUBLIC_ACTIONS.has(action)) {
    return jsonResponse({ result: 'error', error: 'Unsupported action' }, 400);
  }
  // ?refresh=1 (sent by the HQ Pledge Wall tab right after a decision) skips
  // the cache and re-primes the entry every visitor reads, so a reviewer who
  // just approved a card sees it on the wall instead of waiting out the TTL.
  const refresh = url.searchParams.get('refresh') === '1';
  if (WALL_APPS_SCRIPT_URL.indexOf('REPLACE_WITH') === 0) {
    return jsonResponse({ result: 'error', error: 'Not configured' }, 503);
  }

  const upstream = WALL_APPS_SCRIPT_URL + '?action=' + action;
  const cache = caches.default;
  const cacheKey = new Request(url.origin + url.pathname + '?action=' + action, { method: 'GET' });

  // `bust` adds a throwaway param so Cloudflare's own upstream cache can't
  // answer — Apps Script ignores params it doesn't know.
  async function fetchFresh(bust) {
    const upstreamRes = await fetch(upstream + (bust ? '&_=' + Date.now() : ''), {
      cf: { cacheTtl: WALL_TTL, cacheEverything: true },
      headers: { accept: 'application/json' }
    });
    if (!upstreamRes.ok) return null;
    const body = await upstreamRes.text();
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        // Short browser max-age so a reviewer checking whether their approval
        // landed isn't answered by their own cache, and s-maxage bounded to the
        // same window this function serves stale for — it used to be 24h, which
        // let caches in front of us hold a decision back for a day.
        'cache-control': `public, max-age=30, s-maxage=${WALL_TTL}, stale-while-revalidate=${WALL_GRACE}`,
        'access-control-allow-origin': '*',
        'x-cached-at': String(Date.now())
      }
    });
  }

  // Resolves null if the upstream hasn't answered within the budget. The
  // underlying request is left to finish on its own.
  function withBudget(promise) {
    return Promise.race([
      promise,
      new Promise((resolve) => setTimeout(() => resolve(null), UPSTREAM_BUDGET))
    ]);
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
    const age = Date.now() - (Number(hit.headers.get('x-cached-at')) || 0);
    if (age <= WALL_TTL * 1000) return hit; // still fresh
    if (age <= (WALL_TTL + WALL_GRACE) * 1000) {
      // Just past it: answer now, refresh behind this response so the next
      // visitor to this colo gets the new list.
      waitUntil((async () => {
        try {
          const fresh = await fetchFresh();
          if (fresh) await cache.put(cacheKey, fresh.clone());
        } catch (e) { /* keep serving the stale copy */ }
      })());
      return hit;
    }
    // Too old to pass off as current — wait for real data, but only as long as
    // UPSTREAM_BUDGET. One in-flight request either way: if the budget runs out
    // the same promise finishes in the background and primes the cache.
    const pending = fetchFresh();
    let fresh = null;
    try { fresh = await withBudget(pending); } catch (e) { fresh = null; }
    if (fresh) {
      waitUntil(cache.put(cacheKey, fresh.clone()));
      return fresh;
    }
    waitUntil(pending.then((f) => (f ? cache.put(cacheKey, f.clone()) : null)).catch(() => {}));
    return hit;
  }

  // Nothing cached at all. Still bounded: the page falls back to its own copy
  // on an error, which beats holding the request open.
  const cold = fetchFresh();
  let res;
  try {
    res = await withBudget(cold);
  } catch (e) {
    res = null;
  }
  if (!res) {
    waitUntil(cold.then((f) => (f ? cache.put(cacheKey, f.clone()) : null)).catch(() => {}));
    return jsonResponse({ result: 'error', error: 'Backend unavailable' }, 502);
  }

  waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
