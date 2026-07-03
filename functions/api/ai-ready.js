// ============================================================================
// /api/ai-ready — same-origin proxy for the AI-Ready Workforce cohort backend
// ----------------------------------------------------------------------------
// The assessment page POSTs anonymous scores here (action=submit) and the
// employer dashboard GETs aggregate reports (action=report). Both are relayed
// to a Google Apps Script web app backed by a private Sheet — same pattern as
// the Ambassador Notes layer (functions/api/posts.js).
//
// Until the Apps Script is deployed (see docs/AI-READY-WORKFORCE-SETUP.md and
// tools/ai-ready-workforce-apps-script.js), this endpoint returns 503 and the
// frontend degrades gracefully: the assessment still works for individuals,
// and the dashboard demo mode (?demo=1) needs no backend at all.
// ============================================================================

import { jsonResponse } from '../_shared.js';

// Paste the deployed Apps Script Web App /exec URL here (AI-READY-WORKFORCE-SETUP.md step 5).
export const WORKFORCE_APPS_SCRIPT_URL = '';

// Reports are aggregate-only and low-traffic; no edge caching so HR always
// sees current participation counts.

export async function onRequestGet(context) {
  if (!WORKFORCE_APPS_SCRIPT_URL) {
    return jsonResponse({ result: 'error', error: 'Cohort backend not configured yet' }, 503);
  }

  const url = new URL(context.request.url);
  const action = url.searchParams.get('action');
  if (action !== 'report') {
    return jsonResponse({ result: 'error', error: 'Unsupported action' }, 400);
  }

  const upstream = WORKFORCE_APPS_SCRIPT_URL +
    '?action=report' +
    '&org=' + encodeURIComponent(url.searchParams.get('org') || '') +
    '&key=' + encodeURIComponent(url.searchParams.get('key') || '');

  try {
    const res = await fetch(upstream, { headers: { accept: 'application/json' } });
    if (!res.ok) return jsonResponse({ result: 'error', error: 'Backend unavailable' }, 502);
    return new Response(await res.text(), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  } catch (e) {
    return jsonResponse({ result: 'error', error: 'Backend unavailable' }, 502);
  }
}

export async function onRequestPost(context) {
  if (!WORKFORCE_APPS_SCRIPT_URL) {
    return jsonResponse({ result: 'error', error: 'Cohort backend not configured yet' }, 503);
  }

  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return jsonResponse({ result: 'error', error: 'Invalid JSON' }, 400);
  }
  if (body.action !== 'submit') {
    return jsonResponse({ result: 'error', error: 'Unsupported action' }, 400);
  }

  try {
    // text/plain avoids a CORS preflight on the Apps Script side and matches
    // how the other Apps Script webhooks in this repo are called.
    const res = await fetch(WORKFORCE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'content-type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
    if (!res.ok) return jsonResponse({ result: 'error', error: 'Backend unavailable' }, 502);
    return new Response(await res.text(), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  } catch (e) {
    return jsonResponse({ result: 'error', error: 'Backend unavailable' }, 502);
  }
}
