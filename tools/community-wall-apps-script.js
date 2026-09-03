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
 * Pledges are reviewed by the team in FinMango HQ (team-board.html → 🤝 Pledge
 * Wall), which reaches the `pledge-list` / `moderate` actions below through the
 * Team Board backend — that script holds MODERATION_KEY, so a reviewer only
 * needs to be signed in to HQ. See docs/COMMUNITY-WALL-SETUP.md.
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
  // Pledges are reviewed by the whole team in FinMango HQ
  // (team-board.html → 🤝 Pledge Wall), so the per-pledge moderator email is
  // off: the queue is the notification. Flip to true to get the one-click
  // approve/reject emails back as well (the links keep working either way).
  // Story emails are unaffected — those still land in MODERATOR_EMAIL.
  PLEDGE_EMAIL_NOTIFY: false,
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
// `photoError` is the receipt for a photo that didn't make it: a signer's photo
// is written to Drive on submit, and if that write fails the pledge itself must
// still be saved. Recording *why* here is what makes the failure findable —
// a blank photoUrl on its own looks exactly like "no photo was attached", which
// is how a broken Drive write once went unnoticed through both the HQ queue and
// the public wall.
// `photoOriginalUrl` holds the signer's untouched photo once HQ has cropped or
// rotated it, so an edit is never destructive — the original file stays in
// Drive and "revert" is one click. Empty means the photo has never been edited.
const PLEDGE_HEADERS = [
  'id', 'createdAt', 'status', 'name', 'location', 'barrier',
  'why', 'photoUrl', 'showOnWall', 'publishedAt', 'moderatedBy', 'photoError',
  'photoOriginalUrl'
];
// Must match the options on get-involved.html#pledge exactly.
const BARRIERS = [
  'Housing', 'Healthcare costs', 'Debt & credit', 'Food access',
  'Work & income', 'Education', 'Banking access'
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
    // HQ photo edits (crop/rotate), reached through the Team Board bridge.
    // POST rather than GET because a re-encoded image is far too big for a
    // query string — same reasoning as the Ambassador Notes draft editor.
    if (data.action === 'pledge-photo-set') {
      requireKey_(data.key); return json(setPledgePhoto_(data));
    }
    if (data.action === 'pledge-photo-revert') {
      requireKey_(data.key); return json(revertPledgePhoto_(data));
    }
    return json({ result: 'error', error: 'Unknown action' });
  } catch (err) {
    return json({ result: 'error', error: String(err.message || err) });
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
      // The pledge review queue behind FinMango HQ (team-board.html). HQ calls
      // it through its own backend, which holds MODERATION_KEY server-side —
      // the key never reaches a reviewer's browser.
      case 'pledge-list': requireKey_(p.key); return json({ result: 'success', pledges: listPledgesForModeration_(p.status || 'all') });
      case 'moderate': requireKey_(p.key); return moderate_(p); // returns HTML when ui=1 (email links)
      // Walks the whole photo path end to end and reports each step, so
      // "photos aren't showing up" is a question with an answer instead of a
      // silent blank. See docs/COMMUNITY-WALL-SETUP.md.
      case 'photo-selftest': requireKey_(p.key); return json(photoSelfTest_());
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

// Works for both wall stories ('w-…' ids, Wall tab) and pledges ('p-…' ids,
// Pledges tab) — the id prefix decides which tab the row lives in.
function moderate_(p) {
  // 'pending' is the undo: it pulls an approved card back off the wall (or
  // un-rejects one) and returns it to the HQ queue. Only HQ sends it — the
  // email links are approve/reject only.
  const decision = p.decision === 'approve' ? 'approved'
    : p.decision === 'reject' ? 'rejected'
    : p.decision === 'pending' ? 'pending' : '';
  if (!decision) return json({ result: 'error', error: 'decision must be approve, reject, or pending' });

  const isPledge = String(p.id || '').indexOf('p-') === 0;
  const sheet = isPledge ? getPledgeSheet_() : getSheet_();
  const rowIndex = findRowIndex_(sheet, p.id);
  if (rowIndex < 0) return json({ result: 'error', error: 'Row not found' });

  setCell_(sheet, rowIndex, 'status', decision);
  setCell_(sheet, rowIndex, 'moderatedBy', clean_(p.by, 80) || 'email-link');
  if (decision === 'approved') setCell_(sheet, rowIndex, 'publishedAt', new Date().toISOString());
  // Back in the queue means it was never published — clear the stamp so the
  // row sorts by submission date again if it's approved a second time.
  if (decision === 'pending') setCell_(sheet, rowIndex, 'publishedAt', '');

  if (p.ui) {
    // Friendly confirmation page for clicks from the notification email.
    const ok = decision === 'approved';
    const noun = isPledge ? 'Pledge' : 'Story';
    const wallPath = isPledge ? '/pledge-wall' : '/community-wall';
    return HtmlService.createHtmlOutput(
      '<body style="font-family:sans-serif;padding:3rem;text-align:center">' +
      '<h1 style="color:' + (ok ? '#1a7f37' : decision === 'pending' ? '#8a6d1f' : '#c93c37') + '">' +
      (ok ? '✓ Approved' : decision === 'pending' ? '↩ Back to pending' : '✗ Rejected') + '</h1>' +
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
  let photoError = '';
  if (data.photo) {
    if (String(data.photo).length > CONFIG.MAX_PHOTO_DATAURL) {
      return { result: 'error', error: 'Photo too large' };
    }
    const stored = storePledgePhoto_(String(data.photo));
    photoUrl = stored.url;
    photoError = stored.error;
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
    moderatedBy: '',
    photoError: photoError
  };

  getPledgeSheet_().appendRow(PLEDGE_HEADERS.map(h => pledge[h]));
  // The pledge is already saved — HQ's queue picks it up on its next refresh.
  // The email is opt-in (CONFIG.PLEDGE_EMAIL_NOTIFY) precisely so a busy inbox
  // isn't the review tool.
  if (CONFIG.PLEDGE_EMAIL_NOTIFY) notifyModeratorPledge_(pledge);
  return { result: 'success', id: id };
}

// Replace a pledge's photo with one HQ re-encoded (cropped, rotated, or both).
// The edited image arrives as a data URL and becomes a NEW Drive file: the site
// serves photos through /pledge-photo, which edge-caches by file id for a day,
// so rewriting the old file's bytes would keep the uncropped version on screen
// until that cache expired. A new id shows up immediately.
function setPledgePhoto_(data) {
  const id = String(data.id || '');
  if (id.indexOf('p-') !== 0) return { result: 'error', error: 'Not a pledge id' };
  const photo = String(data.photo || '');
  if (!photo) return { result: 'error', error: 'No photo supplied' };
  if (photo.length > CONFIG.MAX_PHOTO_DATAURL) return { result: 'error', error: 'Photo too large' };

  const sheet = getPledgeSheet_();
  const rowIndex = findRowIndex_(sheet, id);
  if (rowIndex < 0) return { result: 'error', error: 'Pledge not found' };

  const stored = storePledgePhoto_(photo);
  // Unlike a signer's submission, an edit that can't be saved must fail loudly:
  // the reviewer is standing right there and needs to know it didn't take.
  if (!stored.url) return { result: 'error', error: stored.error || 'Could not save the photo' };

  const row = readRowsFrom_(sheet).filter(r => String(r.id) === id)[0] || {};
  // Remember the signer's original the first time only, so repeated crops still
  // revert all the way back to what they actually sent.
  if (!String(row.photoOriginalUrl || '') && String(row.photoUrl || '')) {
    setCell_(sheet, rowIndex, 'photoOriginalUrl', String(row.photoUrl));
  }
  setCell_(sheet, rowIndex, 'photoUrl', stored.url);
  setCell_(sheet, rowIndex, 'photoError', stored.error); // '' unless sharing failed
  return {
    result: 'success', id: id,
    photoId: driveFileId_(stored.url),
    photoOriginalId: driveFileId_(String(row.photoOriginalUrl || row.photoUrl || '')),
    photoError: stored.error
  };
}

// Put the signer's original photo back. The edited file stays in Drive (nothing
// is deleted here) but stops being referenced.
function revertPledgePhoto_(data) {
  const id = String(data.id || '');
  if (id.indexOf('p-') !== 0) return { result: 'error', error: 'Not a pledge id' };
  const sheet = getPledgeSheet_();
  const rowIndex = findRowIndex_(sheet, id);
  if (rowIndex < 0) return { result: 'error', error: 'Pledge not found' };
  const row = readRowsFrom_(sheet).filter(r => String(r.id) === id)[0] || {};
  const original = String(row.photoOriginalUrl || '');
  if (!original) return { result: 'error', error: 'This photo has not been edited' };
  setCell_(sheet, rowIndex, 'photoUrl', original);
  setCell_(sheet, rowIndex, 'photoOriginalUrl', '');
  setCell_(sheet, rowIndex, 'photoError', '');
  return { result: 'success', id: id, photoId: driveFileId_(original) };
}

// Moderator list: EVERY pledge, newest first — the queue FinMango HQ paints.
// Same shape as the public list plus the fields a reviewer needs (status,
// whether the signer opted into the wall, who decided it). Photos travel as
// Drive file ids so HQ renders them through /pledge-photo like the wall does.
function listPledgesForModeration_(status) {
  return readRowsFrom_(getPledgeSheet_())
    .filter(r => status === 'all' ? true : String(r.status || 'pending') === status)
    .map(r => {
      const p = publicPledge_(r);
      p.status = String(r.status || 'pending');
      p.showOnWall = (r.showOnWall === 'yes' || r.showOnWall === true);
      p.moderatedBy = String(r.moderatedBy || '');
      // Reviewer-only: a photo the signer attached that never made it to Drive.
      // HQ says so on the card instead of quietly showing no photo at all.
      p.photoError = String(r.photoError || '');
      // Set only when HQ has cropped/rotated this photo — HQ offers "revert to
      // the original" off the back of it.
      p.photoOriginalId = driveFileId_(r.photoOriginalUrl);
      return p;
    })
    // Sorted after mapping, where createdAt is always an ISO string (Sheets
    // hands back Dates for some rows, whose String() form doesn't sort).
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

// Public list: approved pledges whose signer opted into the wall, newest first.
function listApprovedPledges_() {
  return readRowsFrom_(getPledgeSheet_())
    .filter(r => r.status === 'approved' && (r.showOnWall === 'yes' || r.showOnWall === true))
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)))
    .map(publicPledge_);
}

function publicPledge_(r) {
  return {
    id: r.id,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    publishedAt: r.publishedAt instanceof Date ? r.publishedAt.toISOString() : String(r.publishedAt || ''),
    name: r.name, location: r.location, barrier: r.barrier,
    why: r.why, photoId: driveFileId_(r.photoUrl)
  };
}

// The site serves photos through /pledge-photo?id=… (edge-cached), so the
// front-end gets a Drive file id rather than a raw Drive URL. The column is
// also hand-editable — dropping a photo in the folder and pasting its link is
// how a lost photo gets recovered — so accept the shapes Drive actually hands
// you when you copy a link, plus a bare file id.
function driveFileId_(photoUrl) {
  const s = String(photoUrl || '').trim();
  if (!s) return '';
  const m = /[?&]id=([\w-]{10,80})/.exec(s)          // …/thumbnail?id=FILEID
    || /\/d\/([\w-]{10,80})/.exec(s)                  // …/file/d/FILEID/view
    || /^([\w-]{10,80})$/.exec(s);                    // just the id
  return m ? m[1] : '';
}

// Save a pledge photo (base64 data URL) into the shared Drive folder.
// Mirrors storeDataUrl_ in the Ambassador Notes backend.
//
// Returns { url, error }: a photo problem must never lose the pledge itself, so
// every failure here is non-fatal — but it is *reported*, never swallowed. The
// error rides back to submitPledge_, into the sheet's photoError column, and on
// into the HQ queue, so a reviewer sees "photo didn't save" instead of a card
// that looks like nobody attached one. The commonest cause by far is the Drive
// authorization scope: adding DriveApp to this script means the owner has to
// re-run `setup` from the editor and grant Drive access, then re-deploy. Until
// that happens every DriveApp call below throws "Authorization is required".
function storePledgePhoto_(dataUrl) {
  try {
    const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
    if (!m) return { url: '', error: 'Not a base64 image data URL' };
    const mime = m[1];
    const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const bytes = Utilities.base64Decode(m[2]);
    const blob = Utilities.newBlob(bytes, mime, makeId_('pp-') + '.' + ext);
    const file = getPledgePhotoFolder_().createFile(blob);
    // /pledge-photo can only proxy a file Drive itself serves publicly, so a
    // sharing failure means a stored-but-invisible photo — worth reporting even
    // though the bytes are safely on Drive.
    let error = '';
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
      error = 'Saved to Drive but link sharing failed (photo may not load): ' + msg_(e);
      logPhotoTrouble_('setSharing', e);
    }
    return { url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600', error: error };
  } catch (e) {
    logPhotoTrouble_('storePledgePhoto_', e);
    return { url: '', error: msg_(e) };
  }
}

// The photos folder is created on first use and remembered in script properties.
// Failures propagate to storePledgePhoto_, which turns them into a photoError.
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

// Photo trouble also goes to the Apps Script execution log (View > Executions),
// so there's a trail even for a pledge nobody thinks to look at.
function logPhotoTrouble_(where, err) {
  try { console.error('[Pledge Wall] photo ' + where + ' failed: ' + msg_(err)); } catch (e) { /* logging is never fatal */ }
}

function msg_(err) {
  return String((err && err.message) || err || 'unknown error').slice(0, 300);
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
        '<blockquote style="border-left:3px solid #F25A27;padding-left:12px;margin:12px 0">' +
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
        ' · barrier: <strong>' + esc_(pledge.barrier) + '</strong></p>' +
        (pledge.why
          ? '<blockquote style="border-left:3px solid #F25A27;padding-left:12px;margin:12px 0">' +
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
    return sheet;
  }
  // A tab created before a column was added keeps its old header row, and
  // readRowsFrom_ keys rows off whatever that row says — so a new column would
  // read back as undefined forever. Label the missing ones in place instead;
  // existing rows just leave them blank.
  const width = sheet.getLastColumn();
  const head = width ? sheet.getRange(1, 1, 1, width).getValues()[0].map(String) : [];
  const missing = PLEDGE_HEADERS.filter(h => head.indexOf(h) < 0);
  if (missing.length) {
    sheet.getRange(1, head.length + 1, 1, missing.length).setValues([missing]);
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

// Column looked up from the sheet's own header row, not from the constant, so a
// tab whose columns drifted from PLEDGE_HEADERS/HEADERS still gets written in
// the right place rather than one column over.
function setCell_(sheet, rowIndex, header, value) {
  const width = sheet.getLastColumn();
  const head = width ? sheet.getRange(1, 1, 1, width).getValues()[0].map(String) : [];
  const col = head.indexOf(header);
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
//
// Run it AGAIN after any change that touches Drive: a web app keeps running with
// the scopes its owner last granted, so newly added DriveApp code throws
// "Authorization is required" on every call until this is re-run and the script
// re-deployed. That is precisely how pledge photos were dropped for a week.
function setup() {
  getSheet_();
  getPledgeSheet_();
  const folder = getPledgePhotoFolder_();
  Logger.log('Community Wall + Pledge Wall setup complete. Photos folder: ' +
    folder.getName() + ' (' + folder.getId() + '). Now deploy as a Web App, then ' +
    'run photoSelfTest() to confirm photos can be stored and served.');
}

// The photo path, step by step, with the real error attached to whichever step
// breaks. Run it from the editor after `setup`, or hit
// ?action=photo-selftest&key=… on the deployed web app.
//
// A 1x1 JPEG goes to Drive, gets link-shared, and is fetched back through the
// public thumbnail URL the site proxies — then trashed. If every step says ok,
// a real signer's photo will land on the wall.
function photoSelfTest_() {
  const steps = [];
  const step = (name, fn) => {
    try { steps.push({ step: name, ok: true, detail: String(fn() || 'ok') }); return true; }
    catch (e) { steps.push({ step: name, ok: false, detail: msg_(e) }); return false; }
  };

  let folder = null, file = null;
  const gotFolder = step('drive-folder', () => {
    folder = getPledgePhotoFolder_();
    return folder.getName() + ' (' + folder.getId() + ')';
  });

  if (gotFolder) {
    step('create-file', () => {
      // Smallest thing Drive will accept as an image and make a thumbnail of.
      const bytes = Utilities.base64Decode(
        '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ' +
        'EBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAALCAABAAEBAREA' +
        'AP/EABQAAAEAAAAAAAAAAAAAAAAAAAAL/8QAFBABAAAAAAAAAAAAAAAAAAAAAAD/2gAI' +
        'AQEAAD8A0s8g/9k=');
      file = folder.createFile(Utilities.newBlob(bytes, 'image/jpeg', 'pledge-photo-selftest.jpg'));
      return file.getId();
    });
  }

  if (file) {
    step('link-sharing', () => {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return 'anyone with link can view';
    });
    step('fetch-thumbnail', () => {
      // What /pledge-photo asks Drive for. A fresh upload's thumbnail can take a
      // few seconds to generate, so a non-image here is worth one retry before
      // treating it as a real failure.
      const res = UrlFetchApp.fetch(
        'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w480',
        { muteHttpExceptions: true, followRedirects: true });
      const type = String(res.getHeaders()['Content-Type'] || res.getHeaders()['content-type'] || '');
      const detail = 'HTTP ' + res.getResponseCode() + ', content-type ' + (type || 'none');
      if (res.getResponseCode() !== 200 || type.indexOf('image/') !== 0) {
        throw new Error(detail + ' — /pledge-photo needs an image/* response, so this photo ' +
          'would not load. If the file is brand new, wait a few seconds and re-run.');
      }
      return detail;
    });
    step('cleanup', () => { file.setTrashed(true); return 'test file trashed'; });
  }

  const ok = steps.every(s => s.ok);
  return {
    result: ok ? 'success' : 'error',
    ok: ok,
    summary: ok
      ? 'Pledge photos can be stored and served.'
      : 'Pledge photos are broken — see the failing step. An "Authorization is required" ' +
        'error means: open this script in the editor, Run > setup, grant Drive access, ' +
        'then Deploy > Manage deployments > Edit > New version.',
    steps: steps
  };
}

// Editor-friendly wrapper: Run > photoSelfTest and read the log.
function photoSelfTest() {
  Logger.log(JSON.stringify(photoSelfTest_(), null, 2));
}
