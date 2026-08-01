/**
 * ============================================================================
 * FinMango — Community Wall backend (Google Apps Script Web App)
 * ============================================================================
 * Powers community-wall.html: short, first-name-only stories about financial
 * health challenges (and wins) in people's own communities. Every story is
 * human-reviewed before it appears on the wall.
 *
 * ALSO powers the Pledge Wall (get-involved.html#pledge → pledge-wall.html):
 * signers pick a systemic barrier, optionally say why it matters and add a
 * photo, and opt in (or not) to appearing on the public wall. Pledges live in
 * their own "Pledges" tab; photos go to a Drive folder the script creates.
 *
 * Storage is a Google Sheet ("Wall" + "Pledges" tabs) plus one Drive folder
 * for pledge photos.
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
  SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1K-b0G0YET_GDgtQw7L4ayFBfFsnjIasnGbyHItf-qF8/edit',
  MODERATOR_EMAIL: 'scott@finmango.org',       // who gets "new story" emails (with 1-click approve/reject links)
  MODERATION_KEY:  'change-this-passphrase',   // protects the moderation endpoints — set a real passphrase when deploying (keep it out of this repo)
  SITE_BASE:       'https://www.finmango.org', // used in notification links
  MAX_MESSAGE_LEN: 600,
  MAX_HEARTS_PER_CALL: 1,                      // hearts increment one at a time
  MAX_WHY_LEN: 400,                            // pledge "why this barrier" note
  MAX_PHOTO_DATAURL: 4500000,                  // ~3.3MB image after base64 — client downscales well below this
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

// --- Pledge Wall ---
const PLEDGE_SHEET_NAME = 'Pledges';
const PLEDGE_HEADERS = [
  'id', 'createdAt', 'status', 'name', 'location', 'barrier',
  'why', 'photoUrl', 'showOnWall', 'publishedAt', 'moderatedBy'
];
// Must match the options on get-involved.html#pledge exactly.
const BARRIERS = [
  'Housing', 'Healthcare costs', 'Debt & credit', 'Food access',
  'Work & income', 'Education'
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
    if (data.action === 'pledge') return json(submitPledge_(data));
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
      case 'pledges':  return json({ result: 'success', pledges: listApprovedPledges_() });
      // --- moderator-only (key required) ---
      case 'list':     requireKey_(p.key); return json({ result: 'success', stories: listForModeration_(p.status || 'pending') });
      case 'listPledges': requireKey_(p.key); return json({ result: 'success', pledges: listPledgesForModeration_(p.status || 'pending') });
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

// Moderator list: pledges by status ('pending' / 'approved' / 'rejected' /
// 'all'), newest first — what the HQ Pledge Wall review tab renders. Photos
// travel as the Drive file id (photoId) so the front-end can show them through
// the edge-cached /pledge-photo proxy, same as the public wall.
function listPledgesForModeration_(status) {
  return readRowsFrom_(getPledgeSheet_())
    .filter(r => status === 'all' ? true : r.status === status)
    .map(r => {
      const idMatch = /[?&]id=([\w-]+)/.exec(String(r.photoUrl || ''));
      return {
        id: r.id,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
        status: r.status, name: r.name, location: r.location, barrier: r.barrier,
        why: r.why,
        showOnWall: (r.showOnWall === 'yes' || r.showOnWall === true) ? 'yes' : '',
        photoId: idMatch ? idMatch[1] : '',
        moderatedBy: r.moderatedBy || ''
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Works for both wall stories ('w-…' ids, Wall tab) and pledges ('p-…' ids,
// Pledges tab) — the id prefix decides which tab the row lives in.
function moderate_(p) {
  const decision = p.decision === 'approve' ? 'approved' : p.decision === 'reject' ? 'rejected' : '';
  if (!decision) return json({ result: 'error', error: 'decision must be approve or reject' });

  const isPledge = String(p.id || '').indexOf('p-') === 0;
  const sheet = isPledge ? getPledgeSheet_() : getSheet_();
  const rowIndex = findRowIndex_(sheet, p.id);
  if (rowIndex < 0) return json({ result: 'error', error: 'Row not found' });

  setCell_(sheet, rowIndex, 'status', decision);
  setCell_(sheet, rowIndex, 'moderatedBy', clean_(p.by, 80) || 'email-link');
  if (decision === 'approved') setCell_(sheet, rowIndex, 'publishedAt', new Date().toISOString());

  if (p.ui) {
    // Friendly confirmation page for clicks from the notification email.
    const ok = decision === 'approved';
    const noun = isPledge ? 'Pledge' : 'Story';
    const wallPath = isPledge ? '/pledge-wall' : '/community-wall';
    return HtmlService.createHtmlOutput(
      '<body style="font-family:sans-serif;padding:3rem;text-align:center">' +
      '<h1 style="color:' + (ok ? '#1a7f37' : '#c93c37') + '">' + (ok ? '✓ Approved' : '✗ Rejected') + '</h1>' +
      '<p>' + noun + ' <code>' + esc_(p.id) + '</code> is now <strong>' + decision + '</strong>.' +
      (ok ? ' It appears on the wall within a few minutes (edge cache).' : '') + '</p>' +
      '<p><a href="' + CONFIG.SITE_BASE + wallPath + '">View the wall →</a></p></body>'
    );
  }
  return json({ result: 'success', id: p.id, status: decision });
}

// ============================== PLEDGES ====================================
function submitPledge_(data) {
  // Honeypot — same trick as stories: pretend success, store nothing.
  if (data.website) return { result: 'success' };

  const location = clean_(data.location, 120);
  if (!location) return { result: 'error', error: 'Location is required' };
  if (BARRIERS.indexOf(data.barrier) < 0) return { result: 'error', error: 'Unknown barrier' };

  const why = cleanMultiline_(data.why, CONFIG.MAX_WHY_LEN);

  let photoUrl = '';
  if (data.photo) {
    if (String(data.photo).length > CONFIG.MAX_PHOTO_DATAURL) {
      return { result: 'error', error: 'Photo too large' };
    }
    photoUrl = storePledgePhoto_(String(data.photo));
  }

  const id = makeId_('p-');
  const pledge = {
    id: id,
    createdAt: new Date().toISOString(),
    status: 'pending',
    name: clean_(data.name, 80) || 'Anonymous',
    location: location,
    barrier: data.barrier,
    why: why,
    photoUrl: photoUrl,
    showOnWall: data.showOnWall ? 'yes' : '', // opted in to the public Pledge Wall
    publishedAt: '',
    moderatedBy: ''
  };

  getPledgeSheet_().appendRow(PLEDGE_HEADERS.map(h => pledge[h]));
  notifyModeratorPledge_(pledge);
  return { result: 'success', id: id };
}

// Public list: approved pledges whose signer opted into the wall, newest first.
function listApprovedPledges_() {
  return readRowsFrom_(getPledgeSheet_())
    .filter(r => r.status === 'approved' && (r.showOnWall === 'yes' || r.showOnWall === true))
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)))
    .map(publicPledge_);
}

function publicPledge_(r) {
  // The site serves photos through /pledge-photo?id=… (edge-cached), so hand
  // the front-end the Drive file id rather than the raw Drive URL.
  const idMatch = /[?&]id=([\w-]+)/.exec(String(r.photoUrl || ''));
  return {
    id: r.id,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    publishedAt: r.publishedAt instanceof Date ? r.publishedAt.toISOString() : String(r.publishedAt || ''),
    name: r.name, location: r.location, barrier: r.barrier,
    why: r.why, photoId: idMatch ? idMatch[1] : ''
  };
}

// Save a pledge photo (base64 data URL) into the shared Drive folder.
// Mirrors storeDataUrl_ in the Ambassador Notes backend.
function storePledgePhoto_(dataUrl) {
  try {
    const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
    if (!m) return '';
    const mime = m[1];
    const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const bytes = Utilities.base64Decode(m[2]);
    const blob = Utilities.newBlob(bytes, mime, makeId_('pp-') + '.' + ext);
    const file = getPledgePhotoFolder_().createFile(blob);
    // Best-effort: some Workspace domains block programmatic "anyone" sharing.
    // The folder already grants link access, so a throw here is non-fatal.
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* non-fatal */ }
    return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600';
  } catch (e) {
    return ''; // a photo problem must never lose the pledge itself
  }
}

// The photos folder is created on first use and remembered in script properties.
function getPledgePhotoFolder_() {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty('PLEDGE_PHOTO_FOLDER_ID');
  if (saved) {
    try { return DriveApp.getFolderById(saved); } catch (e) { /* recreate below */ }
  }
  const folder = DriveApp.createFolder('FinMango Pledge Wall Photos');
  try { folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* non-fatal */ }
  props.setProperty('PLEDGE_PHOTO_FOLDER_ID', folder.getId());
  return folder;
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

function notifyModeratorPledge_(pledge) {
  try {
    const base = ScriptApp.getService().getUrl();
    const link = decision =>
      base + '?action=moderate&decision=' + decision + '&ui=1' +
      '&id=' + encodeURIComponent(pledge.id) + '&key=' + encodeURIComponent(CONFIG.MODERATION_KEY);
    const optedIn = pledge.showOnWall === 'yes';
    MailApp.sendEmail({
      to: CONFIG.MODERATOR_EMAIL,
      subject: '[Pledge Wall] New pledge from ' + pledge.name + ' — ' + pledge.barrier,
      htmlBody:
        '<p><strong>' + esc_(pledge.name) + '</strong> · ' + esc_(pledge.location) +
        ' · standing against <strong>' + esc_(pledge.barrier) + '</strong></p>' +
        (pledge.why
          ? '<blockquote style="border-left:3px solid #FF6B35;padding-left:12px;margin:12px 0">' +
            esc_(pledge.why).replace(/\n/g, '<br>') + '</blockquote>'
          : '<p style="color:#888">(no "why" note)</p>') +
        (pledge.photoUrl
          ? '<p><img src="' + esc_(pledge.photoUrl.replace('sz=w1600', 'sz=w480')) + '" style="max-width:320px;border:1px solid #ddd" alt="pledge photo"></p>'
          : '') +
        (optedIn
          ? '<p>Signer <strong>opted in</strong> to the public Pledge Wall — approving publishes this card.</p>' +
            '<p><a href="' + link('approve') + '" style="color:#1a7f37"><strong>✓ Approve → show on the wall</strong></a>' +
            ' &nbsp;·&nbsp; <a href="' + link('reject') + '" style="color:#c93c37"><strong>✗ Reject</strong></a></p>'
          : '<p style="color:#888">Signer did <strong>not</strong> opt into the public wall — the pledge is counted ' +
            'but never shown, no action needed.</p>') +
        '<p style="color:#888;font-size:12px">You can also change the status cell directly in the ' +
        'Pledges tab (pending → approved / rejected).</p>'
    });
  } catch (err) {
    // Email failure must never lose a pledge — the row is already saved.
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

function getPledgeSheet_() {
  const ss = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);
  let sheet = ss.getSheetByName(PLEDGE_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(PLEDGE_SHEET_NAME);
    sheet.appendRow(PLEDGE_HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readRows_() { return readRowsFrom_(getSheet_()); }

function readRowsFrom_(sheet) {
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
  const headers = sheet.getName() === PLEDGE_SHEET_NAME ? PLEDGE_HEADERS : HEADERS;
  const col = headers.indexOf(header);
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

function makeId_(prefix) {
  return (prefix || 'w-') + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' +
    Math.random().toString(36).slice(2, 8);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run once from the editor to create the sheet tabs, the pledge photo folder,
// and grant permissions (Sheets + Drive + Mail).
function setup() {
  getSheet_();
  getPledgeSheet_();
  getPledgePhotoFolder_();
  Logger.log('Community Wall + Pledge Wall setup complete. Now deploy as a Web App.');
}
