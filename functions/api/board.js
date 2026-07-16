// ============================================================================
// /api/board — same-origin proxy for the FinMango Team Board backend
// ----------------------------------------------------------------------------
// team-board.html calls this instead of hitting the Google Apps Script web app
// directly. Same reasons as /api/wall and /api/posts (same-origin avoids CORS,
// the browser never sees the Apps Script URL), with one difference: board data
// is live collaborative state, so NOTHING here is edge-cached — every load hits
// the backend and every save is forwarded immediately.
//
// GET  /api/board?action=public  → key-less public roadmap subset,
//                                  edge-cached (~2 min) for roadmap.html
// POST /api/board  (JSON body)   → forwards to Apps Script doPost. All
//                                  authenticated traffic (load AND save) is
//                                  POST so credentials — the team key or a
//                                  Google ID token — never sit in a URL.
//
// Credentials are validated by the Apps Script itself, not here — this proxy
// is deliberately dumb so it never needs a secret in the repo.
// ============================================================================

import { BOARD_APPS_SCRIPT_URL, jsonResponse } from '../_shared.js';

const NOT_CONFIGURED = { result: 'error', error: 'Not configured' };

function noStore(res) {
  const headers = new Headers(res.headers);
  headers.set('cache-control', 'no-store');
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(res.body, { status: res.status, headers });
}

export async function onRequestGet(context) {
  const { request } = context;
  if (BOARD_APPS_SCRIPT_URL.indexOf('REPLACE_WITH') === 0) {
    return jsonResponse(NOT_CONFIGURED, 503);
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action') || '';

  // Public roadmap subset: no credentials, cached at the edge so the Apps
  // Script only sees a trickle of traffic no matter how popular /roadmap gets.
  if (action !== 'public') {
    return jsonResponse({ result: 'error', error: 'Unsupported action' }, 400);
  }
  try {
    const res = await fetch(BOARD_APPS_SCRIPT_URL + '?action=public', {
      cf: { cacheTtl: 120, cacheEverything: true },
      headers: { accept: 'application/json' },
      redirect: 'follow'
    });
    const body = await res.text();
    return new Response(body, {
      status: res.ok ? 200 : 502,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=120'
      }
    });
  } catch (e) {
    return jsonResponse({ result: 'error', error: 'Backend unavailable' }, 502);
  }
}

export async function onRequestPost(context) {
  const { request } = context;
  if (BOARD_APPS_SCRIPT_URL.indexOf('REPLACE_WITH') === 0) {
    return jsonResponse(NOT_CONFIGURED, 503);
  }

  let payload;
  try {
    payload = await request.text();
    // Sanity: must be a JSON object and within Apps Script's comfortable range.
    if (!payload || payload.length > 900000 || payload[0] !== '{') {
      return jsonResponse({ result: 'error', error: 'Bad request' }, 400);
    }
  } catch (e) {
    return jsonResponse({ result: 'error', error: 'Bad request' }, 400);
  }

  try {
    // text/plain keeps the upstream request "simple"; Apps Script reads the raw
    // body from e.postData.contents either way.
    const res = await fetch(BOARD_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      body: payload,
      redirect: 'follow'
    });
    const body = await res.text();
    return noStore(new Response(body, { status: res.ok ? 200 : 502 }));
  } catch (e) {
    return jsonResponse({ result: 'error', error: 'Backend unavailable' }, 502);
  }
}
