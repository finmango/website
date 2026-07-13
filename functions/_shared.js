// ============================================================================
// Shared helpers for the Ambassador Notes edge layer (Cloudflare Pages Functions)
// ----------------------------------------------------------------------------
// Files prefixed with "_" are NOT routed by Pages — this is a plain module that
// functions/api/posts.js, functions/post.js and functions/post-image.js import.
//
// The single source of truth for the backend URL lives here. The /exec URL is
// stable across Apps Script re-deploys (see docs/POSTS-SETUP.md), so this rarely
// changes — but if the script is ever re-created from scratch, update it here.
// ============================================================================

export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyw06JczRZVwdf3vw70xeshZ_shp2J1zzvPvPqhR-2_FSqzSBFaq0Yu-OZ7KjKYfCuthQ/exec';

// Community Wall backend (separate Apps Script — see docs/COMMUNITY-WALL-SETUP.md).
// Until it's deployed, /api/wall returns "Not configured" and community-wall.html
// shows its example stories instead.
export const WALL_APPS_SCRIPT_URL = 'REPLACE_WITH_WALL_APPS_SCRIPT_WEB_APP_URL';
export const SITE_BASE = 'https://www.finmango.org';
export const DEFAULT_OG_IMAGE = SITE_BASE + '/og-image.png';

// How long the edge holds a backend response. Published posts change rarely, so
// a few minutes keeps things fast while still reflecting edits/new posts quickly.
export const EDGE_TTL = 300; // seconds

export function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

// Safely embed a JSON value inside an inline <script> — neutralises </script>,
// <!-- and the two line-separator code points that break script parsing.
export function jsonForScript(obj) {
  // Escape <, >, & and the two line-separator code points so the JSON can sit
  // safely inside an inline <script> without prematurely closing it.
  return JSON.stringify(obj).replace(/[<>&\u2028\u2029]/g, c =>
    '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}

// Fetch one published post as a plain object, or null. The subrequest to Apps
// Script is cached at the Cloudflare edge so this is fast on repeat hits and
// resilient to Apps Script cold starts.
export async function fetchPostJson(id) {
  if (!id) return null;
  try {
    const res = await fetch(
      APPS_SCRIPT_URL + '?action=post&id=' + encodeURIComponent(id),
      { cf: { cacheTtl: EDGE_TTL, cacheEverything: true }, headers: { accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.result === 'success' && data.post) return data.post;
    return null;
  } catch (e) {
    return null;
  }
}
