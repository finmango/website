/**
 * ============================================================================
 * FinMango — Community Wall backend (Google Apps Script Web App)
 * ============================================================================
 * Powers community-wall.html: short, first-name-only stories about financial
 * health challenges (and wins) in people's own communities. Every story is
 * human-reviewed before it appears on the wall.
 *
 * Storage is a single Google Sheet tab ("Wall") — stories are short text, so
 * no Drive folder is needed (unlike the Ambassador Notes backend).
 *
 * ------------------------------- SETUP --------------------------------------
 * 1. Create a Google Sheet (any name). Note its URL.
 * 2. In the Sheet: Extensions > Apps Script. Delete the sample code, paste THIS file.
 * 3. Fill in the CONFIG block below (Sheet URL, moderator email, and a
 *    MODERATION_KEY passphrase you invent).
 * 4. Run `setup` once (top toolbar) and grant the permissions it requests.
 * 5. Deploy > New deployment > Web app:
 *       Execute as: Me        Who has access: Anyone
 *    Copy the resulting /exec URL.
 * 6. Paste that URL into WALL_SUBMIT_URL in community-wall.html and
 *    WALL_APPS_SCRIPT_URL in functions/_shared.js.
 *
 * Re-deploy (Deploy > Manage deployments > Edit > New version) after any change.
 * ----------------------------------------------------------------------------
 */

// ============================== CONFIG =====================================
const CONFIG = {
  SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1CknY3G7fcfBpWf-CJZ07jeTXWTRtV2e_X80zZmNlXKA/edit',
  MODERATOR_EMAIL: 'scott@finmango.org',       // who gets "new story" emails (with 1-click approve/reject links)
  MODERATION_KEY:  'change-this-passphrase',   // protects the moderation endpoints — set a real passphrase when deploying (keep it out of this repo)
  SITE_BASE:       'https://www.finmango.org', // used in notification links
  MAX_MESSAGE_LEN: 600,
  MAX_HEARTS_PER_CALL: 1,                      // hearts increment one at a time
};

const SHEET_NAME = 'Wall';
const HEADERS = [
  'id', 'createdAt', 'status', 'name', 'location', 'topic',
  'message', 'email', 'hearts', 'publishedAt', 'moderatedBy'
];

// Topics the front-end offers; anything else is coerced to 'Other'.
const TOPICS = [
  'Housing', 'Food access', 'Debt & credit', 'Savings', 'Work & income',
  'Education', 'Healthcare costs', 'Community wins', 'Other'
];

// ============================== ROUTING ====================================
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(20000);
  try {
    let data = {};
    try { data = JSON.parse(e.postData.contents); } catch (err) { data = (e && e.parameter) || {}; }
    if (data.action === 'submit') return json(submitStory_(data));
    if (data.action === 'heart')  return json(addHeart_(data.id));
    return json({ result: 'error', error: 'Unknown action' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    switch (p.action) {
      // --- public ---
      case 'approved': return json({ result: 'success', stories: listApproved_() });
      // --- moderator-only (key required) ---
      case 'list':     requireKey_(p.key); return json({ result: 'success', stories: listForModeration_(p.status || 'pending') });
      case 'moderate': requireKey_(p.key); return moderate_(p); // returns HTML when ui=1 (email links)
      default: return json({ result: 'error', error: 'Unknown action' });
    }
  } catch (err) {
    return json({ result: 'error', error: String(err.message || err) });
  }
}

// ============================== ACTIONS ====================================
function submitStory_(data) {
  // Honeypot: real visitors never fill the hidden "website" field. Pretend
  // success so bots don't learn they were caught, but store nothing.
  if (data.website) return { result: 'success' };

  const message = cleanMultiline_(data.message, CONFIG.MAX_MESSAGE_LEN);
  const location = clean_(data.location, 120);
  if (message.length < 20) return { result: 'error', error: 'Story is too short' };
  if (!location) return { result: 'error', error: 'Location is required' };

  const topic = TOPICS.indexOf(data.topic) >= 0 ? data.topic : 'Other';
  const id = makeId_();
  const story = {
    id: id,
    createdAt: new Date().toISOString(),
    status: 'pending',
    name: clean_(data.name, 80) || 'Anonymous',
    location: location,
    topic: topic,
    message: message,
    email: clean_(data.email, 200), // never exposed publicly; for follow-up only
    hearts: 0,
    publishedAt: '',
    moderatedBy: ''
  };

  getSheet_().appendRow(HEADERS.map(h => story[h]));
  notifyModerator_(story);
  return { result: 'success', id: id };
}

// Public list: approved stories, newest first. Emails never leave the sheet.
function listApproved_() {
  return readRows_()
    .filter(r => r.status === 'approved')
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)))
    .map(publicStory_);
}

function listForModeration_(status) {
  return readRows_()
    .filter(r => status === 'all' ? true : r.status === status)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map(r => ({
      id: r.id, createdAt: r.createdAt, status: r.status, name: r.name,
      location: r.location, topic: r.topic, message: r.message, hearts: r.hearts
    }));
}

function moderate_(p) {
  const decision = p.decision === 'approve' ? 'approved' : p.decision === 'reject' ? 'rejected' : '';
  if (!decision) return json({ result: 'error', error: 'decision must be approve or reject' });

  const sheet = getSheet_();
  const rowIndex = findRowIndex_(sheet, p.id);
  if (rowIndex < 0) return json({ result: 'error', error: 'Story not found' });

  setCell_(sheet, rowIndex, 'status', decision);
  setCell_(sheet, rowIndex, 'moderatedBy', clean_(p.by, 80) || 'email-link');
  if (decision === 'approved') setCell_(sheet, rowIndex, 'publishedAt', new Date().toISOString());

  if (p.ui) {
    // Friendly confirmation page for clicks from the notification email.
    const ok = decision === 'approved';
    return HtmlService.createHtmlOutput(
      '<body style="font-family:sans-serif;padding:3rem;text-align:center">' +
      '<h1 style="color:' + (ok ? '#1a7f37' : '#c93c37') + '">' + (ok ? '✓ Approved' : '✗ Rejected') + '</h1>' +
      '<p>Story <code>' + esc_(p.id) + '</code> is now <strong>' + decision + '</strong>.' +
      (ok ? ' It appears on the wall within a few minutes (edge cache).' : '') + '</p>' +
      '<p><a href="' + CONFIG.SITE_BASE + '/community-wall">View the wall →</a></p></body>'
    );
  }
  return json({ result: 'success', id: p.id, status: decision });
}

// Hearts: +1 to an approved story. Client-side dedupe (localStorage) keeps
// honest people honest; low stakes either way.
function addHeart_(id) {
  const sheet = getSheet_();
  const rowIndex = findRowIndex_(sheet, id);
  if (rowIndex < 0) return { result: 'error', error: 'Story not found' };
  const row = readRows_().filter(r => r.id === id)[0];
  if (!row || row.status !== 'approved') return { result: 'error', error: 'Story not found' };
  const hearts = (Number(row.hearts) || 0) + CONFIG.MAX_HEARTS_PER_CALL;
  setCell_(sheet, rowIndex, 'hearts', hearts);
  return { result: 'success', hearts: hearts };
}

// ============================== EMAIL ======================================
function notifyModerator_(story) {
  try {
    const base = ScriptApp.getService().getUrl();
    const link = decision =>
      base + '?action=moderate&decision=' + decision + '&ui=1' +
      '&id=' + encodeURIComponent(story.id) + '&key=' + encodeURIComponent(CONFIG.MODERATION_KEY);
    MailApp.sendEmail({
      to: CONFIG.MODERATOR_EMAIL,
      subject: '[Community Wall] New story from ' + story.name + ' — ' + story.location,
      htmlBody:
        '<p><strong>' + esc_(story.name) + '</strong> · ' + esc_(story.location) +
        ' · ' + esc_(story.topic) + '</p>' +
        '<blockquote style="border-left:3px solid #FF6B35;padding-left:12px;margin:12px 0">' +
        esc_(story.message).replace(/\n/g, '<br>') + '</blockquote>' +
        (story.email ? '<p style="color:#888">Contact (private): ' + esc_(story.email) + '</p>' : '') +
        '<p><a href="' + link('approve') + '" style="color:#1a7f37"><strong>✓ Approve</strong></a>' +
        ' &nbsp;·&nbsp; <a href="' + link('reject') + '" style="color:#c93c37"><strong>✗ Reject</strong></a></p>' +
        '<p style="color:#888;font-size:12px">You can also change the status cell directly in the Sheet ' +
        '(pending → approved / rejected).</p>'
    });
  } catch (err) {
    // Email failure must never lose a submission — the row is already saved.
  }
}

// ============================== HELPERS ====================================
function requireKey_(key) {
  if (!key || key !== CONFIG.MODERATION_KEY) throw new Error('Unauthorized');
}

function getSheet_() {
  const ss = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readRows_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const head = values[0] || [];
  return values.slice(1).map(row => {
    const obj = {};
    head.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  }).filter(r => r.id);
}

function findRowIndex_(sheet, id) {
  if (!id) return -1;
  const ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2; // 1-based + header row
  }
  return -1;
}

function setCell_(sheet, rowIndex, header, value) {
  const col = HEADERS.indexOf(header);
  if (col < 0) throw new Error('Unknown column: ' + header);
  sheet.getRange(rowIndex, col + 1).setValue(value);
}

function publicStory_(r) {
  return {
    id: r.id,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    publishedAt: r.publishedAt instanceof Date ? r.publishedAt.toISOString() : String(r.publishedAt || ''),
    name: r.name, location: r.location, topic: r.topic,
    message: r.message, hearts: Number(r.hearts) || 0
  };
}

function clean_(v, max) {
  return (v == null ? '' : String(v)).replace(/\s+/g, ' ').trim().slice(0, max);
}

// Same, but keeps paragraph breaks (stories are allowed line breaks).
function cleanMultiline_(v, max) {
  return (v == null ? '' : String(v))
    .replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}

function esc_(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function makeId_() {
  return 'w-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' +
    Math.random().toString(36).slice(2, 8);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run once from the editor to create the sheet tab and grant permissions.
function setup() {
  getSheet_();
  Logger.log('Community Wall setup complete. Now deploy as a Web App.');
}
