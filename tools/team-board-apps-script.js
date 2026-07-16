/**
 * ============================================================================
 * FinMango — Team Board backend (Google Apps Script Web App)
 * ============================================================================
 * Powers team-board.html: the internal Notion-style workspace (boards, cards,
 * assignees, comments). The whole workspace is stored as one versioned JSON
 * document in a Google Sheet — simple, free, and no server to run (same
 * pattern as the Community Wall and Ambassador Notes backends).
 *
 * Concurrency model: optimistic locking. Every save must carry the version it
 * was based on; if a teammate saved first, the request gets a 'conflict'
 * response with the newer document and the front-end refreshes itself.
 *
 * ------------------------------- SETUP --------------------------------------
 * 1. Create a Google Sheet (any name, e.g. "FinMango Team Board"). Note its URL.
 * 2. In the Sheet: Extensions > Apps Script. Delete the sample code, paste THIS file.
 * 3. Fill in the CONFIG block below (Sheet URL + an ACCESS_KEY passphrase you
 *    invent and share privately with the team).
 * 4. Run `setup` once (top toolbar) and grant the permissions it requests.
 * 5. Deploy > New deployment > Web app:
 *       Execute as: Me        Who has access: Anyone
 *    Copy the resulting /exec URL.
 * 6. Paste that URL into BOARD_APPS_SCRIPT_URL in functions/_shared.js.
 * 7. Team members open finmango.org/team-board, hit "Sync", and enter the
 *    ACCESS_KEY once — their edits are shared with everyone from then on.
 *
 * Re-deploy (Deploy > Manage deployments > Edit > New version) after any change.
 * ----------------------------------------------------------------------------
 */

// ============================== CONFIG =====================================
const CONFIG = {
  // The "FinMango HQ Workspace" Sheet in the team Drive (owner: scott@finmango.org).
  SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/16qX99ym-7RdxdKtqt2cD6DQKMyZvK0Wu_eZmtjgG9bE/edit',
  // The shared team passphrase (the "volunteer door"). Anyone with this key
  // can read AND write the board, so treat it like a password: invent a real
  // one when deploying and never commit it to the (public) repo.
  ACCESS_KEY: 'change-this-passphrase',
  // "Sign in with FinMango" (the "team door"): the OAuth client ID from Google
  // Cloud Console — must match GOOGLE_CLIENT_ID in team-board.html. Client IDs
  // are public by design. Until set, only the ACCESS_KEY door works.
  GOOGLE_CLIENT_ID: 'REPLACE_WITH_GOOGLE_OAUTH_CLIENT_ID',
  // Only Google accounts on this domain are accepted.
  ALLOWED_DOMAIN: 'finmango.org',
  // Ambassador post reviews bridge: lets HQ show the pending-post queue with
  // approve/reject buttons. The review key stays HERE (server-side) — being
  // signed in to HQ is the credential. Until the key is set, HQ shows a
  // "not wired up" note and the standalone post-review.html panel still works.
  POSTS_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyw06JczRZVwdf3vw70xeshZ_shp2J1zzvPvPqhR-2_FSqzSBFaq0Yu-OZ7KjKYfCuthQ/exec',
  POSTS_REVIEW_KEY: 'REPLACE_WITH_POSTS_REVIEW_KEY',
  // When a reviewer requests changes (with a note), the author is emailed the
  // note directly. Replies to that email land here.
  NOTES_REPLY_TO: 'scott@finmango.org',
  // Refuse absurdly large documents (protects the Sheet; ~500 KB of JSON is
  // thousands of cards — far beyond normal use).
  MAX_DOC_BYTES: 500000,
};

const SHEET_NAME = 'Board';
// Sheet layout:
//   A1 = version (integer)   B1 = updatedAt (ISO)   C1 = updatedBy (name)
//   A3:A  = JSON document, split into chunks (Sheets caps a cell at 50k chars)
const CHUNK_SIZE = 45000;

// ============================== ROUTING ====================================
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'public') return json(publicDoc_());
    if (p.action === 'ping') return json({ result: 'success', pong: true });
    return json({ result: 'error', error: 'Unknown action' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  }
}

// Authenticated traffic (load AND save) arrives as POST so credentials never
// sit in a URL. Each request carries either `key` (team passphrase) or
// `idToken` (Google sign-in, verified server-side).
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(20000);
  try {
    let data = {};
    try { data = JSON.parse(e.postData.contents); } catch (err) { data = (e && e.parameter) || {}; }
    if (data.action === 'load') { requireAuth_(data); return json(loadDoc_()); }
    if (data.action === 'save') { requireAuth_(data); return json(saveDoc_(data)); }
    // --- Ambassador post reviews bridge (HQ-authenticated) ---
    if (data.action === 'posts-list') { requireAuth_(data); return json(postsBridge_({ action: 'list', status: String(data.status || 'all') })); }
    if (data.action === 'posts-get') { requireAuth_(data); return json(postsBridge_({ action: 'review-get', id: String(data.id || '') })); }
    if (data.action === 'posts-review') {
      requireAuth_(data);
      const vote = String(data.vote || 'comment');
      const comment = String(data.comment || '').slice(0, 2000);
      const reviewer = String(data.reviewer || 'HQ team');
      const out = postsBridge_({ action: 'review', id: String(data.id || ''), reviewer: reviewer, vote: vote, comment: comment });
      // "Request changes" with a note also emails the author the note.
      if (out && out.result === 'success' && vote === 'changes' && comment.trim()) {
        out.emailed = emailAuthorChanges_(String(data.id || ''), reviewer, comment.trim());
      }
      return json(out);
    }
    if (data.action === 'posts-publish') {
      requireAuth_(data);
      return json(postsBridge_({ action: 'publish', id: String(data.id || ''), reviewer: String(data.reviewer || 'HQ team') }));
    }
    if (data.action === 'posts-update') {
      requireAuth_(data);
      const upd = { action: 'update', id: String(data.id || ''), editor: String(data.editor || 'HQ editor') };
      if (typeof data.title === 'string') upd.title = data.title;
      if (typeof data.body === 'string') upd.body = data.body;
      return json(postsBridgePost_(upd));
    }
    return json({ result: 'error', error: 'Unknown action' });
  } catch (err) {
    return json({ result: 'error', error: errMessage_(err) });
  } finally {
    lock.releaseLock();
  }
}

// ============================== ACTIONS ====================================
function loadDoc_() {
  const sheet = getSheet_();
  const meta = sheet.getRange(1, 1, 1, 3).getValues()[0];
  const version = Number(meta[0]) || 0;
  if (version === 0) {
    // Fresh install — the front-end will seed its starter workspace and save.
    return { result: 'success', version: 0, data: null };
  }
  return {
    result: 'success',
    version: version,
    updatedAt: String(meta[1] || ''),
    updatedBy: String(meta[2] || ''),
    data: readChunks_(sheet)
  };
}

function saveDoc_(req) {
  const docString = JSON.stringify(req.data || null);
  if (docString === 'null') throw new Error('Missing document');
  if (docString.length > CONFIG.MAX_DOC_BYTES) throw new Error('Document too large');

  const sheet = getSheet_();
  const meta = sheet.getRange(1, 1, 1, 3).getValues()[0];
  const currentVersion = Number(meta[0]) || 0;
  const baseVersion = Number(req.baseVersion) || 0;

  if (currentVersion !== baseVersion) {
    // Someone else saved since this client last loaded. Hand back the newer
    // document instead of clobbering it — the front-end adopts it and retries.
    return {
      result: 'conflict',
      version: currentVersion,
      updatedAt: String(meta[1] || ''),
      updatedBy: String(meta[2] || ''),
      data: readChunks_(sheet)
    };
  }

  const newVersion = currentVersion + 1;
  writeChunks_(sheet, docString);
  sheet.getRange(1, 1, 1, 3).setValues([[
    newVersion,
    new Date().toISOString(),
    String(req.author || '').slice(0, 80)
  ]]);
  return { result: 'success', version: newVersion };
}

// The one endpoint that needs NO key: the public roadmap subset, consumed by
// roadmap.html on the website. It returns ONLY items the team explicitly
// flagged `public`, and ONLY safe fields — never comments, assignees,
// member names, or anything unflagged.
function publicDoc_() {
  const sheet = getSheet_();
  const doc = readChunks_(sheet);
  if (!doc) return { result: 'success', updatedAt: null, boards: [], pages: [] };

  const boards = (doc.boards || []).map(function (b) {
    const columns = (b.columns || []).map(function (col) {
      const cards = (b.cards || [])
        .filter(function (c) { return c.public && c.colId === col.id; })
        .map(function (c) {
          return {
            title: String(c.title || ''),
            desc: String(c.desc || ''),
            tags: (c.tags || []).map(String).slice(0, 8),
            updatedAt: c.updatedAt || null
          };
        });
      return { name: String(col.name || ''), color: String(col.color || ''), cards: cards };
    }).filter(function (col) { return col.cards.length > 0; });
    return { name: String(b.name || ''), icon: String(b.icon || ''), columns: columns };
  }).filter(function (b) { return b.columns.length > 0; });

  const pages = (doc.pages || [])
    .filter(function (p) { return p.public; })
    .map(function (p) {
      return {
        title: String(p.title || ''),
        icon: String(p.icon || ''),
        body: String(p.body || ''),
        updatedAt: p.updatedAt || null
      };
    });

  return { result: 'success', updatedAt: doc.updatedAt || null, boards: boards, pages: pages };
}

// ============================== STORAGE ====================================
function readChunks_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return null;
  const values = sheet.getRange(3, 1, lastRow - 2, 1).getValues();
  let raw = '';
  for (let i = 0; i < values.length; i++) raw += String(values[i][0] || '');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (err) { return null; }
}

function writeChunks_(sheet, docString) {
  const rows = [];
  for (let i = 0; i < docString.length; i += CHUNK_SIZE) {
    rows.push([docString.substring(i, i + CHUNK_SIZE)]);
  }
  const lastRow = sheet.getLastRow();
  if (lastRow >= 3) sheet.getRange(3, 1, lastRow - 2, 1).clearContent();
  sheet.getRange(3, 1, rows.length, 1).setValues(rows);
}

// ============================== AUTH =======================================
// Two doors: a Google ID token from a @finmango.org account, or the shared
// team ACCESS_KEY. Either one grants read/write to the whole workspace.
function requireAuth_(data) {
  if (data.idToken) { verifyIdToken_(String(data.idToken)); return; }
  requireKey_(data.key);
}

function requireKey_(key) {
  if (CONFIG.ACCESS_KEY === 'change-this-passphrase') {
    throw new Error('Backend not configured (set ACCESS_KEY)');
  }
  if (String(key || '') !== CONFIG.ACCESS_KEY) throw new Error('Invalid access key');
}

// Verify a Google ID token: signature/expiry via Google's tokeninfo endpoint,
// then audience (our OAuth client) and domain (finmango.org). Verified tokens
// are cached by hash until they expire, so polling clients cost one outbound
// verification per user per hour, not one per request.
function verifyIdToken_(idToken) {
  if (CONFIG.GOOGLE_CLIENT_ID.indexOf('REPLACE_WITH') === 0) {
    throw new Error('Google sign-in not configured');
  }
  const cache = CacheService.getScriptCache();
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, idToken)
    .map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
  const cacheKey = 'tok_' + hash;
  if (cache.get(cacheKey)) return;

  let info;
  try {
    const res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
      { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error('bad status');
    info = JSON.parse(res.getContentText());
  } catch (err) {
    throw new Error('Invalid token');
  }
  const email = String(info.email || '').toLowerCase();
  const domainOk = info.hd === CONFIG.ALLOWED_DOMAIN
    || email.slice(-(CONFIG.ALLOWED_DOMAIN.length + 1)) === '@' + CONFIG.ALLOWED_DOMAIN;
  if (info.aud !== CONFIG.GOOGLE_CLIENT_ID
      || String(info.email_verified) !== 'true'
      || !domainOk) {
    throw new Error('Invalid token');
  }
  const ttl = Math.max(60, Math.min(21600, Number(info.exp) - Math.floor(Date.now() / 1000) - 60));
  cache.put(cacheKey, '1', ttl);
}

// Forward a reviewer action to the Ambassador Notes backend, attaching the
// server-side review key. HQ callers never see or send the key.
function postsBridge_(params) {
  if (CONFIG.POSTS_REVIEW_KEY.indexOf('REPLACE_WITH') === 0) {
    throw new Error('Post reviews not configured');
  }
  params.key = CONFIG.POSTS_REVIEW_KEY;
  const qs = Object.keys(params).map(function (k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
  }).join('&');
  const res = UrlFetchApp.fetch(CONFIG.POSTS_APPS_SCRIPT_URL + '?' + qs, { muteHttpExceptions: true });
  try { return JSON.parse(res.getContentText()); }
  catch (err) { throw new Error('Posts backend unavailable'); }
}

// POST variant of the bridge for payloads too large for a query string
// (draft edits carry the whole post body).
function postsBridgePost_(payload) {
  if (CONFIG.POSTS_REVIEW_KEY.indexOf('REPLACE_WITH') === 0) {
    throw new Error('Post reviews not configured');
  }
  payload.key = CONFIG.POSTS_REVIEW_KEY;
  const res = UrlFetchApp.fetch(CONFIG.POSTS_APPS_SCRIPT_URL, {
    method: 'post', contentType: 'text/plain', payload: JSON.stringify(payload),
    muteHttpExceptions: true, followRedirects: true
  });
  try { return JSON.parse(res.getContentText()); }
  catch (err) { throw new Error('Posts backend unavailable'); }
}

// Email the author the reviewer's change request. Sent from this (HQ) script
// so the posts backend needs no modification; the author's address comes from
// their original submission via the bridge. Returns true if a mail went out.
function emailAuthorChanges_(id, reviewer, comment) {
  try {
    const res = postsBridge_({ action: 'review-get', id: id });
    const post = res && res.post;
    if (!post || !post.authorEmail) return false;
    const title = String(post.title || 'your Ambassador Note');
    MailApp.sendEmail({
      to: post.authorEmail,
      replyTo: CONFIG.NOTES_REPLY_TO,
      subject: 'FinMango Ambassador Notes — changes requested: ' + title,
      htmlBody:
        '<p>Hi ' + escHtml_(String(post.authorName || 'there').split(/\s+/)[0]) + ',</p>' +
        '<p>Thanks for submitting <strong>' + escHtml_(title) + '</strong>! Our editorial team read it and has some feedback before it goes live:</p>' +
        '<blockquote style="border-left:3px solid #FF6B35;margin:12px 0;padding:6px 14px;color:#333;">' +
        escHtml_(comment).replace(/\n/g, '<br>') + '</blockquote>' +
        '<p style="color:#666;font-size:13px;">— ' + escHtml_(reviewer) + ', FinMango editorial</p>' +
        '<p>You can submit an updated version at <a href="https://www.finmango.org/write">finmango.org/write</a>, ' +
        'or just reply to this email if anything is unclear. We\'d love to publish this!</p>' +
        '<p>— The FinMango team 🥭</p>'
    });
    return true;
  } catch (err) {
    return false; // email failures never block the vote itself
  }
}

function escHtml_(s) {
  return String(s || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// ============================== HELPERS ====================================
// Error objects stringify as "Error: msg" — the front-end matches on the bare
// message ("Invalid token", "Invalid access key"), so strip the prefix.
function errMessage_(err) {
  return String(err && err.message ? err.message : err);
}

function getSheet_() {
  const ss = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 3).setValues([[0, '', '']]);
    sheet.getRange(2, 1).setValue('--- JSON document chunks below; do not edit by hand ---');
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor toolbar after filling in CONFIG. */
function setup() {
  const sheet = getSheet_();
  Logger.log('Sheet "%s" ready. Current version: %s',
    SHEET_NAME, sheet.getRange(1, 1).getValue());
  Logger.log('Now deploy as a Web App (Execute as: Me / Access: Anyone) and put the /exec URL in functions/_shared.js');
}
