/**
 * ============================================================================
 * FinMango — Ambassador Notes backend (Google Apps Script Web App)
 * ============================================================================
 * Powers write.html (submit), posts.html / post.html (public read), and
 * post-review.html (peer-review panel).
 *
 * Each submission is stored as a folder in Drive containing `post.json`
 * plus any uploaded images. A Google Sheet ("Posts") is a lightweight index
 * for browsing/filtering. Images are offloaded to Drive so the Sheet never
 * hits its 50k-chars-per-cell limit.
 *
 * ------------------------------- SETUP --------------------------------------
 * 1. Create a Google Sheet (any name). Note its URL.
 * 2. Create a Drive folder to hold submissions (e.g. "FinMango Post Submissions").
 *    Open it and copy the folder ID from the URL (the part after /folders/).
 * 3. In the Sheet: Extensions > Apps Script. Delete the sample code, paste THIS file.
 * 4. Fill in the CONFIG block below (Sheet URL, Drive folder ID, editor email,
 *    and a REVIEW_KEY passphrase you invent — share it only with reviewers).
 * 5. Run `setup` once (top toolbar) and grant the permissions it requests.
 * 6. Deploy > New deployment > Web app:
 *       Execute as: Me        Who has access: Anyone
 *    Copy the resulting /exec URL.
 * 7. Paste that URL into SUBMIT_URL / API_URL in write.html, posts.html,
 *    post.html and post-review.html.
 *
 * Re-deploy (Deploy > Manage deployments > Edit > New version) after any change.
 * ----------------------------------------------------------------------------
 */

// ============================== CONFIG =====================================
const CONFIG = {
  SPREADSHEET_URL: 'PASTE_YOUR_GOOGLE_SHEET_URL_HERE',
  DRIVE_FOLDER_ID: 'PASTE_YOUR_DRIVE_FOLDER_ID_HERE',
  EDITOR_EMAIL:    'research@finmango.org',   // who gets notified of new submissions
  REVIEW_KEY:      'change-this-passphrase',   // reviewers enter this in post-review.html
  SITE_BASE:       'https://www.finmango.org', // used in notification links
  REQUIRE_APPROVAL_TO_PUBLISH: false,          // if true, publish() needs >=1 "approve" vote
};

const SHEET_NAME = 'Posts';
const HEADERS = [
  'id', 'createdAt', 'status', 'authorName', 'authorEmail', 'authorAffiliation',
  'category', 'tags', 'title', 'dek', 'hasCover', 'folderId', 'jsonFileId',
  'publishedAt', 'reviewsSummary',
  // Appended at the END so existing Sheet rows keep their column alignment.
  'ambassadorSlug', 'scheduledFor'
];

// ============================== ROUTING ====================================
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(20000);
  try {
    let data = {};
    try { data = JSON.parse(e.postData.contents); } catch (err) { data = e.parameter || {}; }
    if (data.action === 'submit') return json(submitPost_(data));
    if (data.action === 'update') { requireKey_(data.key); return json(updatePost_(data)); }
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
      case 'published': return json({ result: 'success', posts: listPublished_() });
      case 'post':      return json(getPublicPost_(p.id));
      // --- reviewer-only (key required) ---
      case 'list':       requireKey_(p.key); return json({ result: 'success', posts: listForReview_(p.status || 'all') });
      case 'review-get': requireKey_(p.key); return json(getFullPost_(p.id));
      case 'review':     requireKey_(p.key); return json(addReview_(p));
      case 'schedule':   requireKey_(p.key); return json(schedulePost_(p));
      case 'publish':    requireKey_(p.key); return json(publishPost_(p));
      default: return json({ result: 'error', error: 'Unknown action' });
    }
  } catch (err) {
    return json({ result: 'error', error: String(err.message || err) });
  }
}

// ============================== ACTIONS ====================================
function submitPost_(data) {
  const sheet = getSheet_();
  const id = makeId_(data.title);
  const folder = getParentFolder_().createFolder(id);

  // Offload images (cover + inline data: URLs) to Drive, swap in public URLs.
  const cover = data.cover ? storeDataUrl_(data.cover, folder, 'cover') : '';
  const body = tidyBody_(rewriteInlineImages_(data.body || '', folder));

  const post = {
    id: id,
    createdAt: new Date().toISOString(),
    publishedAt: '',
    scheduledFor: '',
    status: 'pending',
    authorName: (data.authorName || '').toString().slice(0, 160),
    authorEmail: (data.authorEmail || '').toString().slice(0, 200),
    authorAffiliation: (data.authorAffiliation || '').toString().slice(0, 200),
    // Links the note to an ambassador profile page (/<slug>.html). Constrained to
    // a safe slug shape so it can be dropped straight into a URL.
    ambassadorSlug: (data.ambassadorSlug || '').toString().toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80),
    category: (data.category || '').toString().slice(0, 60),
    tags: (data.tags || '').toString().split(',').map(s => s.trim()).filter(Boolean).slice(0, 12),
    title: (data.title || '').toString().slice(0, 200),
    dek: (data.dek || '').toString().slice(0, 300),
    cover: cover,
    body: body,
    reviews: []
  };

  const jsonFile = folder.createFile('post.json', JSON.stringify(post, null, 2), 'application/json');

  sheet.appendRow(HEADERS.map(h => {
    switch (h) {
      case 'hasCover': return cover ? 'yes' : '';
      case 'folderId': return folder.getId();
      case 'jsonFileId': return jsonFile.getId();
      case 'tags': return post.tags.join(', ');
      case 'reviewsSummary': return '';
      default: return post[h] !== undefined ? post[h] : '';
    }
  }));

  notifyEditors_(post);
  return { result: 'success', id: id };
}

function listPublished_() {
  return rows_()
    .filter(r => r.status === 'published')
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .map(r => publicSummary_(r));
}

function listForReview_(statusFilter) {
  return rows_()
    .filter(r => statusFilter === 'all' ? true : r.status === statusFilter)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .map(r => ({
      id: r.id, status: r.status, title: r.title, authorName: r.authorName,
      category: r.category, createdAt: r.createdAt, publishedAt: r.publishedAt,
      scheduledFor: r.scheduledFor || ''
    }));
}

function getPublicPost_(id) {
  const r = findRow_(id);
  if (!r || r.status !== 'published') return { result: 'error', error: 'Not found' };
  const post = readJson_(r.jsonFileId);
  // Posts published before the auto-cover rule still get one on the fly.
  if (!post.cover) post.cover = firstImg_(post.body);
  return { result: 'success', post: post };
}

function getFullPost_(id) {
  const r = findRow_(id);
  if (!r) return { result: 'error', error: 'Not found' };
  return { result: 'success', post: readJson_(r.jsonFileId) };
}

function addReview_(p) {
  const r = findRow_(p.id);
  if (!r) return { result: 'error', error: 'Not found' };
  const post = readJson_(r.jsonFileId);
  const vote = ['approve', 'changes', 'reject'].indexOf(p.vote) >= 0 ? p.vote : 'comment';

  // An approval can carry a go-live time; the post then publishes itself when
  // that time arrives (see publishScheduledPosts) instead of the moment an
  // editor clicks Publish — so approvals can be spread out over days.
  const when = vote === 'approve' ? parseWhen_(p.scheduledFor) : '';
  const entry = { reviewer: (p.reviewer || 'Reviewer').slice(0, 120), vote: vote, comment: (p.comment || '').slice(0, 2000), at: new Date().toISOString() };
  if (when) entry.comment = (entry.comment ? entry.comment + ' · ' : '') + '🕓 goes live ' + fmtWhen_(when);
  post.reviews = post.reviews || [];
  post.reviews.push(entry);

  // A vote nudges status (but never demotes a published post).
  const wasApproved = post.status === 'approved';
  if (post.status !== 'published') {
    if (vote === 'approve') post.status = 'approved';
    else if (vote === 'changes') post.status = 'changes';
    else if (vote === 'reject') post.status = 'rejected';
  }
  if (when) post.scheduledFor = when;
  // A post knocked out of "approved" must never auto-publish later.
  if (post.status !== 'approved' && post.status !== 'published') post.scheduledFor = '';

  saveJson_(r.jsonFileId, post);
  updateRow_(r.rowIndex, { status: post.status, scheduledFor: post.scheduledFor || '', reviewsSummary: summarize_(post.reviews) });

  // Tell the author the good news (once per approval, or when a time is set).
  let emailed = false;
  if (vote === 'approve' && post.status === 'approved' && (!wasApproved || when)) {
    emailed = notifyAuthorApproved_(post);
  }
  return { result: 'success', post: post, emailed: emailed };
}

// Set, change, or clear an approved post's go-live time. An empty scheduledFor
// clears it (back to manual publish); setting one emails the author the date.
function schedulePost_(p) {
  const r = findRow_(p.id);
  if (!r) return { result: 'error', error: 'Not found' };
  const post = readJson_(r.jsonFileId);
  if (post.status !== 'approved') return { result: 'error', error: 'Only approved posts can be scheduled' };
  const when = parseWhen_(p.scheduledFor);
  if (p.scheduledFor && !when) return { result: 'error', error: 'Bad date' };
  post.scheduledFor = when;
  post.reviews = post.reviews || [];
  post.reviews.push({ reviewer: (p.reviewer || 'Editor').toString().slice(0, 120), vote: 'comment',
    comment: when ? '🕓 Scheduled to go live ' + fmtWhen_(when) : '🕓 Schedule cleared — will be published manually', at: new Date().toISOString() });
  saveJson_(r.jsonFileId, post);
  updateRow_(r.rowIndex, { scheduledFor: post.scheduledFor, reviewsSummary: summarize_(post.reviews) });
  const emailed = when ? notifyAuthorApproved_(post) : false;
  return { result: 'success', post: post, emailed: emailed };
}

// Reviewer-only: edit a post's title/body (used by the HQ Ambassador Notes
// tab). Works on drafts AND published posts — edits to a live post go live
// immediately, and every edit leaves an audit entry in the review trail so
// there's always a record of who changed what, when.
function updatePost_(p) {
  const r = findRow_(p.id);
  if (!r) return { result: 'error', error: 'Not found' };
  const post = readJson_(r.jsonFileId);
  const wasPublished = post.status === 'published';
  if (typeof p.title === 'string' && p.title.trim()) post.title = p.title.toString().slice(0, 200);
  if (typeof p.body === 'string' && p.body.trim()) {
    // Images added during review arrive as inline data URLs — file them in
    // the post's Drive folder and swap in hosted URLs, same as submissions.
    let body = p.body.toString();
    if (body.indexOf('data:image/') !== -1) {
      body = rewriteInlineImages_(body, DriveApp.getFolderById(r.folderId));
    }
    if (body.length > 200000) return { result: 'error', error: 'Body too large — remove an image or some text' };
    post.body = tidyBody_(body);
  }
  if (typeof p.dek === 'string') post.dek = p.dek.toString().slice(0, 300);
  post.reviews = post.reviews || [];
  post.reviews.push({ reviewer: (p.editor || 'Editor').toString().slice(0, 120), vote: 'comment',
    comment: wasPublished ? '✏️ Edited the live post' : '✏️ Edited the draft during review', at: new Date().toISOString() });
  saveJson_(r.jsonFileId, post);
  updateRow_(r.rowIndex, { title: post.title, reviewsSummary: summarize_(post.reviews) });
  return { result: 'success', post: post };
}

function publishPost_(p) {
  const r = findRow_(p.id);
  if (!r) return { result: 'error', error: 'Not found' };
  const post = readJson_(r.jsonFileId);
  if (CONFIG.REQUIRE_APPROVAL_TO_PUBLISH) {
    const approvals = (post.reviews || []).filter(x => x.vote === 'approve').length;
    if (approvals < 1) return { result: 'error', error: 'Needs at least one approval before publishing' };
  }
  goLive_(r, post);
  return { result: 'success', id: post.id, url: CONFIG.SITE_BASE + '/post?id=' + encodeURIComponent(post.id) };
}

// Flip a post live — shared by manual Publish and the scheduler below.
function goLive_(r, post) {
  post.status = 'published';
  post.publishedAt = new Date().toISOString();
  post.scheduledFor = '';
  // No cover uploaded? The first image in the post becomes the cover.
  if (!post.cover) post.cover = firstImg_(post.body);
  saveJson_(r.jsonFileId, post);
  updateRow_(r.rowIndex, { status: 'published', publishedAt: post.publishedAt, scheduledFor: '', hasCover: post.cover ? 'yes' : '' });

  // OPTIONAL upgrade: also commit a pre-rendered static .html to the repo via the
  // GitHub API for SEO. Disabled by default (no token needed). See docs/POSTS-SETUP.md.
  // commitStaticPage_(post);

  notifyAuthorPublished_(post);
}

// ============================== SCHEDULER ==================================
// Runs on a time-driven trigger (installed by setup, every 15 minutes) and
// publishes approved posts whose go-live time has arrived — so a scheduled
// post appears within ~15 minutes of its chosen time, author emailed as usual.
function publishScheduledPosts() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    rows_()
      .filter(r => r.status === 'approved' && r.scheduledFor && Date.parse(r.scheduledFor) <= Date.now())
      .forEach(r => {
        try { goLive_(r, readJson_(r.jsonFileId)); }
        catch (err) { /* one bad post must not block the rest of the queue */ }
      });
  } finally {
    lock.releaseLock();
  }
}

// ============================== STORAGE HELPERS ============================
function getSheet_() {
  const ss = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); sheet.appendRow(HEADERS); sheet.setFrozenRows(1); sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold'); }
  return sheet;
}
function getParentFolder_() { return DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID); }

function rows_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = {}; HEADERS.forEach((h, j) => row[h] = values[i][j]);
    row.rowIndex = i + 1;
    row.createdAt = toIso_(row.createdAt);
    row.publishedAt = toIso_(row.publishedAt);
    row.scheduledFor = toIso_(row.scheduledFor);
    if (row.id) out.push(row);
  }
  return out;
}
function findRow_(id) { return rows_().filter(r => String(r.id) === String(id))[0] || null; }
function updateRow_(rowIndex, patch) {
  const sheet = getSheet_();
  Object.keys(patch).forEach(k => {
    const col = HEADERS.indexOf(k);
    if (col >= 0) sheet.getRange(rowIndex, col + 1).setValue(patch[k]);
  });
}
function readJson_(fileId) { return JSON.parse(DriveApp.getFileById(fileId).getBlob().getDataAsString()); }
function saveJson_(fileId, obj) { DriveApp.getFileById(fileId).setContent(JSON.stringify(obj, null, 2)); }

function publicSummary_(r) {
  const post = readJson_(r.jsonFileId);
  return {
    id: post.id, title: post.title, dek: post.dek, category: post.category,
    tags: post.tags || [], authorName: post.authorName,
    cover: post.cover || firstImg_(post.body),
    ambassadorSlug: post.ambassadorSlug || '',
    publishedAt: post.publishedAt, createdAt: post.createdAt
  };
}

// ============================== IMAGE HANDLING ============================
// Save a base64 data URL into the post folder, return a public display URL.
function storeDataUrl_(dataUrl, folder, baseName) {
  try {
    const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
    if (!m) return '';
    const mime = m[1];
    const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const bytes = Utilities.base64Decode(m[2]);
    const blob = Utilities.newBlob(bytes, mime, baseName + '.' + ext);
    const file = folder.createFile(blob);
    // Best-effort: some Workspace domains block programmatic "anyone" sharing and
    // setSharing() throws. The parent folder already grants link access, so treat
    // this as non-fatal — an image must never abort the whole submission.
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* non-fatal */ }
    // Reliable embeddable URL for public Drive images.
    return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w2000';
  } catch (e) {
    return ''; // an image problem must never lose the whole submission
  }
}

// First image in a body, if any — used as the automatic cover.
function firstImg_(html) {
  const m = /<img[^>]*\bsrc="([^"]+)"/i.exec(String(html || ''));
  return m ? m[1] : '';
}

// Rich-text editors write a blank line as <p><br></p> (or a paragraph holding
// only &nbsp;/empty spans). Stacked on normal paragraph margins that reads as
// double spacing, so filler paragraphs are dropped at save time.
function tidyBody_(html) {
  return String(html || '')
    .replace(/<p>(?:\s|&nbsp;|\u00a0|<br\s*\/?>|<span>\s*<\/span>)*<\/p>/gi, '');
}

// Replace every inline data:image in the body with a stored Drive URL.
function rewriteInlineImages_(html, folder) {
  let n = 0;
  return html.replace(/(<img[^>]*\bsrc=")(data:image\/[^"]+)(")/gi, function (full, pre, dataUrl, post) {
    n++;
    const url = storeDataUrl_(dataUrl, folder, 'img-' + n);
    return url ? (pre + url + post) : full;
  });
}

// ============================== MISC HELPERS ==============================
function requireKey_(key) { if (String(key || '') !== String(CONFIG.REVIEW_KEY)) throw new Error('Unauthorized'); }
function json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function toIso_(v) { if (!v) return ''; if (v instanceof Date) return v.toISOString(); return String(v); }
// Normalize a client-supplied go-live time to ISO; garbage becomes ''. Past
// times are accepted — they simply publish on the scheduler's next pass.
function parseWhen_(v) {
  if (!v) return '';
  const t = Date.parse(String(v));
  return isNaN(t) ? '' : new Date(t).toISOString();
}
function fmtWhen_(iso) {
  return Utilities.formatDate(new Date(iso), Session.getScriptTimeZone(), "EEE, MMM d, yyyy 'at' h:mm a (z)");
}
function summarize_(reviews) {
  const c = { approve: 0, changes: 0, reject: 0 };
  (reviews || []).forEach(r => { if (c[r.vote] !== undefined) c[r.vote]++; });
  return '👍' + c.approve + ' ✏️' + c.changes + ' 👎' + c.reject;
}
function makeId_(title) {
  const slug = String(title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'post';
  const stamp = Utilities.formatDate(new Date(), 'UTC', 'yyMMdd-HHmmss');
  return slug + '-' + stamp;
}

function notifyEditors_(post) {
  if (!CONFIG.EDITOR_EMAIL) return;
  try {
    MailApp.sendEmail({
      to: CONFIG.EDITOR_EMAIL,
      subject: 'New Ambassador Note submitted: ' + (post.title || '(untitled)'),
      htmlBody:
        '<p><strong>' + esc_(post.authorName) + '</strong> (' + esc_(post.authorEmail) + ') submitted a ' + esc_(post.category || 'post') + '.</p>' +
        '<p><strong>' + esc_(post.title) + '</strong><br>' + esc_(post.dek || '') + '</p>' +
        '<p>Review it in the panel: <a href="' + CONFIG.SITE_BASE + '/post-review.html">' + CONFIG.SITE_BASE + '/post-review.html</a></p>'
    });
  } catch (err) { /* email failures shouldn't block submission */ }
}
// Approval email — the author learns their note made the cut, and (when
// scheduled) exactly when it goes live. Also reused when the time changes.
function notifyAuthorApproved_(post) {
  if (!post.authorEmail) return false;
  try {
    const when = post.scheduledFor ? fmtWhen_(post.scheduledFor) : '';
    MailApp.sendEmail({
      to: post.authorEmail,
      replyTo: CONFIG.EDITOR_EMAIL,
      subject: 'Approved 🎉 — your FinMango Ambassador Note: ' + (post.title || ''),
      htmlBody:
        '<p>Great news — <strong>' + esc_(post.title || 'your Ambassador Note') + '</strong> has been approved by our editorial team. 🎉</p>' +
        (when
          ? '<p>It\'s scheduled to go live on <strong>' + esc_(when) + '</strong>. We\'ll email you again with the link the moment it\'s published.</p>'
          : '<p>An editor will publish it soon — we\'ll email you the link the moment it\'s live.</p>') +
        '<p>Thank you for contributing. — The FinMango team 🥭</p>'
    });
    return true;
  } catch (err) {
    return false; // email failures never block the vote itself
  }
}
function notifyAuthorPublished_(post) {
  if (!post.authorEmail) return;
  try {
    MailApp.sendEmail({
      to: post.authorEmail,
      subject: 'Your FinMango Ambassador Note is published: ' + (post.title || ''),
      htmlBody:
        '<p>Great news — your Ambassador Note is now live on FinMango.</p>' +
        '<p><a href="' + CONFIG.SITE_BASE + '/post?id=' + encodeURIComponent(post.id) + '">Read it here</a></p>' +
        '<p>Thank you for contributing. — The FinMango team</p>'
    });
  } catch (err) { /* ignore */ }
}
function esc_(s) { return String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

// ============================== ONE-TIME SETUP ============================
function setup() {
  if (CONFIG.SPREADSHEET_URL.indexOf('PASTE_') === 0) throw new Error('Set CONFIG.SPREADSHEET_URL first.');
  if (CONFIG.DRIVE_FOLDER_ID.indexOf('PASTE_') === 0) throw new Error('Set CONFIG.DRIVE_FOLDER_ID first.');
  getSheet_();            // creates the Posts tab + headers
  getParentFolder_();     // verifies folder access
  // Install (once) the time-driven trigger that publishes scheduled posts.
  // Safe to re-run setup — an existing trigger is never duplicated.
  const hasTrigger = ScriptApp.getProjectTriggers()
    .some(t => t.getHandlerFunction() === 'publishScheduledPosts');
  if (!hasTrigger) ScriptApp.newTrigger('publishScheduledPosts').timeBased().everyMinutes(15).create();
  Logger.log('Setup OK. Now Deploy > New deployment > Web app.');
}
