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
 * 4. Fill in the CONFIG block below (Sheet URL, Drive folder ID, the reviewer
 *    emails that get "new submission" alerts, and a REVIEW_KEY passphrase you
 *    invent — share it only with reviewers).
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
  EDITOR_EMAIL:    'research@finmango.org',   // reply-to fallback on author emails
  // Everyone who should hear about a new submission. Comma-separated; the
  // whole review team can be listed here, and each name gets the same email
  // with a one-click link into the HQ queue.
  NOTIFY_EMAILS:   'scott@finmango.org, spatel@finmango.org, sarah@finmango.org',
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
  'ambassadorSlug', 'scheduledFor',
  // Attribution: who put the post in its current status (and when), plus the
  // approver — kept separately because it outlives approval, so a published
  // row can show "approved by Mia · published by Scott".
  'statusBy', 'statusAt', 'approvedBy'
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
      case 'attr':       requireKey_(p.key); return json({ result: 'success', attr: attrForIds_(p.ids) });
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
      scheduledFor: r.scheduledFor || '',
      // Reviewer attribution — read straight off the index so the whole queue
      // can be tagged with faces without opening one post.json per row.
      statusBy: r.statusBy || '', statusAt: toIso_(r.statusAt), approvedBy: r.approvedBy || ''
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

  const patch = { status: post.status, scheduledFor: post.scheduledFor || '', reviewsSummary: summarize_(post.reviews) };
  // Record who owns the post's current status, so HQ can tag the row with a
  // name and face. A vote on an already-published post doesn't move it, so it
  // must not overwrite "published by" either. `approvedBy` is cleared the
  // moment a post is knocked back out of "approved" — a stale approver tag
  // would be worse than none.
  if (vote !== 'comment' && post.status !== 'published') {
    post.statusBy = entry.reviewer;
    post.statusAt = entry.at;
    patch.statusBy = post.statusBy;
    patch.statusAt = post.statusAt;
    if (post.status === 'approved') { post.approvedBy = entry.reviewer; }
    else if (post.status === 'changes' || post.status === 'rejected') { post.approvedBy = ''; }
    patch.approvedBy = post.approvedBy || '';
  }

  saveJson_(r.jsonFileId, post);
  updateRow_(r.rowIndex, patch);
  if (post.scheduledFor) ensureSchedulerTrigger_();

  // Tell the author the good news (once per approval, or when a time is set).
  // Signed by the reviewer who clicked, with replies routed to their inbox.
  let emailed = false;
  if (vote === 'approve' && post.status === 'approved' && (!wasApproved || when)) {
    emailed = notifyAuthorApproved_(post, entry.reviewer, cleanEmail_(p.reviewerEmail));
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
  if (when) ensureSchedulerTrigger_();
  const emailed = when ? notifyAuthorApproved_(post, String(p.reviewer || ''), cleanEmail_(p.reviewerEmail)) : false;
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
  goLive_(r, post, String(p.reviewer || ''), cleanEmail_(p.reviewerEmail));
  return { result: 'success', id: post.id, url: CONFIG.SITE_BASE + '/post?id=' + encodeURIComponent(post.id) };
}

// Flip a post live — shared by manual Publish and the scheduler below (the
// scheduler passes no reviewer, so its emails fall back to the editor inbox).
function goLive_(r, post, reviewerName, reviewerEmail) {
  post.status = 'published';
  post.publishedAt = new Date().toISOString();
  post.scheduledFor = '';
  // Who pushed the button. 'Scheduler' when nobody did — the timed trigger
  // published it — which HQ shows as "auto-published on schedule".
  post.publishedBy = String(reviewerName || '').trim() || 'Scheduler';
  post.statusBy = post.publishedBy;
  post.statusAt = post.publishedAt;
  // No cover uploaded? The first image in the post becomes the cover.
  if (!post.cover) post.cover = firstImg_(post.body);
  saveJson_(r.jsonFileId, post);
  updateRow_(r.rowIndex, { status: 'published', publishedAt: post.publishedAt, scheduledFor: '', hasCover: post.cover ? 'yes' : '',
    statusBy: post.statusBy, statusAt: post.statusAt });

  // OPTIONAL upgrade: also commit a pre-rendered static .html to the repo via the
  // GitHub API for SEO. Disabled by default (no token needed). See docs/POSTS-SETUP.md.
  // commitStaticPage_(post);

  notifyAuthorPublished_(post, reviewerName, reviewerEmail);
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

// The scheduler above only runs if its time-driven trigger exists. setup()
// installs it, but a script upgraded to the scheduling version whose setup()
// was never re-run has NO trigger — posts sit "scheduled" forever and nothing
// says why. So every action that stores a go-live time also (re)installs the
// trigger on the spot. Never throws: the schedule itself is already saved, and
// a trigger hiccup must not fail the reviewer's click.
function ensureSchedulerTrigger_() {
  try {
    const exists = ScriptApp.getProjectTriggers()
      .some(t => t.getHandlerFunction() === 'publishScheduledPosts');
    if (!exists) ScriptApp.newTrigger('publishScheduledPosts').timeBased().everyMinutes(15).create();
  } catch (err) { /* the next schedule action retries */ }
}

// ============================== STORAGE HELPERS ============================
function getSheet_() {
  const ss = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); sheet.appendRow(HEADERS); sheet.setFrozenRows(1); sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold'); }
  // Columns are only ever appended to HEADERS, so an older Sheet can be a few
  // columns short of the current code. Grow it rather than throwing on write.
  const max = sheet.getMaxColumns();
  if (max < HEADERS.length) sheet.insertColumnsAfter(max, HEADERS.length - max);
  return sheet;
}

// Label any columns added since this Sheet was created. Data already works by
// index — this is purely so the Sheet reads sensibly to a human. Called by
// setup(); safe to run repeatedly.
function ensureHeaders_() {
  const sheet = getSheet_();
  const row = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (HEADERS.some((h, i) => String(row[i] || '') !== h)) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  }
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

// New-submission alert to the review team. One email, every reviewer on it,
// with a button that opens the note's own row in the HQ queue — approve,
// schedule, or publish happens there, so nobody has to go hunting for it.
function notifyEditors_(post) {
  const to = notifyList_();
  if (!to) return;
  try {
    const reviewUrl = CONFIG.SITE_BASE + '/team-board.html?view=notes&post=' + encodeURIComponent(post.id);
    const author = esc_(post.authorName || 'An ambassador');
    const authorEmail = cleanEmail_(post.authorEmail);
    const meta = [post.category, (post.tags || []).join(', ')].filter(Boolean).map(esc_).join(' · ');
    const cover = /^https:\/\//.test(String(post.cover || '')) ? post.cover : '';
    MailApp.sendEmail({
      to: to,
      name: 'FinMango Ambassador Notes',
      // Replies land with the ambassador, not the robot — the most common
      // follow-up to a submission is a question for its author.
      replyTo: authorEmail || CONFIG.EDITOR_EMAIL,
      subject: '📝 New Ambassador Note: ' + (post.title || '(untitled)') + ' — ' + (post.authorName || 'unknown author'),
      htmlBody:
        '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1b1b18;max-width:560px;">' +
        '<p style="margin:0 0 4px;color:#6b6b63;font-size:13px;">New submission · waiting for review</p>' +
        '<h2 style="margin:0 0 6px;font-size:20px;line-height:1.3;">' + esc_(post.title || '(untitled)') + '</h2>' +
        (post.dek ? '<p style="margin:0 0 12px;color:#4a4a44;">' + esc_(post.dek) + '</p>' : '') +
        (cover ? '<p style="margin:0 0 14px;"><img src="' + esc_(cover) + '" alt="" style="max-width:100%;border-radius:10px;"></p>' : '') +
        '<p style="margin:0 0 14px;color:#4a4a44;">By <strong>' + author + '</strong>' +
        (authorEmail ? ' &lt;' + esc_(authorEmail) + '&gt;' : '') +
        (post.authorAffiliation ? ' · ' + esc_(post.authorAffiliation) : '') +
        (meta ? '<br>' + meta : '') + '</p>' +
        (excerpt_(post.body) ? '<blockquote style="margin:0 0 18px;padding:2px 0 2px 14px;border-left:3px solid #e2e2dc;color:#4a4a44;">' + esc_(excerpt_(post.body)) + '</blockquote>' : '') +
        '<p style="margin:0 0 16px;"><a href="' + reviewUrl + '" style="display:inline-block;background:#F2A03D;color:#1b1b18;text-decoration:none;font-weight:600;padding:11px 20px;border-radius:8px;">Review, approve &amp; schedule →</a></p>' +
        '<p style="margin:0;color:#8a8a82;font-size:12px;">Opens the note in the team portal. Standalone panel: ' +
        '<a href="' + CONFIG.SITE_BASE + '/post-review.html" style="color:#8a8a82;">post-review.html</a>' +
        (authorEmail ? ' · Replying to this email goes straight to ' + author + '.' : '') + '</p>' +
        '</div>'
    });
  } catch (err) { /* email failures shouldn't block submission */ }
}
// The reviewer list, cleaned up — blank entries dropped, editor inbox as the
// fallback so a half-filled CONFIG still tells somebody.
function notifyList_() {
  const list = String(CONFIG.NOTIFY_EMAILS || '').split(',').map(s => s.trim()).filter(cleanEmail_);
  return list.length ? list.join(',') : String(CONFIG.EDITOR_EMAIL || '');
}
// First ~280 characters of the note as plain text, for the email preview.
function excerpt_(html) {
  const text = String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 280 ? text.slice(0, 280).replace(/\s\S*$/, '') + '…' : text;
}
// Approval email — the author learns their note made the cut, and (when
// scheduled) exactly when it goes live. Also reused when the time changes.
// Signed with the acting reviewer's name and reply-to (Apps Script always
// sends *from* the deploying account — name + reply-to are what we can set),
// falling back to the editor inbox when no reviewer identity was passed.
function notifyAuthorApproved_(post, reviewerName, reviewerEmail) {
  if (!post.authorEmail) return false;
  try {
    const when = post.scheduledFor ? fmtWhen_(post.scheduledFor) : '';
    MailApp.sendEmail({
      to: post.authorEmail,
      name: senderName_(reviewerName),
      replyTo: reviewerEmail || CONFIG.EDITOR_EMAIL,
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
function notifyAuthorPublished_(post, reviewerName, reviewerEmail) {
  if (!post.authorEmail) return;
  try {
    MailApp.sendEmail({
      to: post.authorEmail,
      name: senderName_(reviewerName),
      replyTo: reviewerEmail || CONFIG.EDITOR_EMAIL,
      subject: 'Your FinMango Ambassador Note is published: ' + (post.title || ''),
      htmlBody:
        '<p>Great news — your Ambassador Note is now live on FinMango.</p>' +
        '<p><a href="' + CONFIG.SITE_BASE + '/post?id=' + encodeURIComponent(post.id) + '">Read it here</a></p>' +
        '<p>Thank you for contributing. — The FinMango team</p>'
    });
  } catch (err) { /* ignore */ }
}
function esc_(s) { return String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
// A reviewer identity only rides into an email if it looks like an address;
// anything else (including the generic 'HQ team' door) falls back to defaults.
function cleanEmail_(v) {
  const s = String(v || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : '';
}
// "Mia Fawls · FinMango" when a real reviewer name is known, else "FinMango".
function senderName_(reviewerName) {
  const n = String(reviewerName || '').trim();
  return n && n !== 'HQ team' && n !== 'Editor' && n !== 'Reviewer' ? n + ' · FinMango' : 'FinMango';
}

// ============================== ONE-TIME SETUP ============================
function setup() {
  if (CONFIG.SPREADSHEET_URL.indexOf('PASTE_') === 0) throw new Error('Set CONFIG.SPREADSHEET_URL first.');
  if (CONFIG.DRIVE_FOLDER_ID.indexOf('PASTE_') === 0) throw new Error('Set CONFIG.DRIVE_FOLDER_ID first.');
  getSheet_();            // creates the Posts tab + headers
  ensureHeaders_();       // labels columns added by later versions of this file
  getParentFolder_();     // verifies folder access
  backfillAttribution();  // fills reviewer attribution for pre-existing rows
  // Install (once) the time-driven trigger that publishes scheduled posts.
  // Safe to re-run setup — an existing trigger is never duplicated. (Scheduling
  // a post also self-installs this, so a skipped setup no longer strands posts.)
  ensureSchedulerTrigger_();
  Logger.log('Setup OK. Now Deploy > New deployment > Web app.');
}

// Posts reviewed before the attribution columns existed still know who did
// what — it's in their review trail. Replay it into the index so the HQ queue
// can tag old rows too. Only fills what it can prove: an unknown publisher
// stays blank rather than being guessed. Idempotent; run from setup() or by
// hand (toolbar ▸ backfillAttribution ▸ Run).
function backfillAttribution() {
  const MAX = 250;          // each row costs a Drive read; stay inside the 6-minute limit
  let filled = 0, looked = 0, more = false;
  rows_().forEach(r => {
    try {
      if (r.statusBy && r.approvedBy) return;
      if (looked >= MAX) { more = true; return; }
      looked++;
      if (attrPatchFor_(r)) filled++;
    } catch (err) { /* one unreadable post must not stop the sweep */ }
  });
  Logger.log('Attribution backfilled for ' + filled + ' post(s).'
    + (more ? ' Stopped at ' + MAX + ' — run backfillAttribution again to continue.' : ''));
  return filled;
}

// Recover one row's attribution from the post's own record and write it into
// the index. Returns the recovered names, or null when the post can't prove
// anything the index doesn't already hold.
function attrPatchFor_(r) {
  const post = readJson_(r.jsonFileId);
  const votes = (post.reviews || []).filter(x => ['approve', 'changes', 'reject'].indexOf(x.vote) >= 0);
  const last = votes[votes.length - 1];
  const approval = votes.filter(x => x.vote === 'approve').pop();
  const patch = {};
  if (!r.statusBy) {
    if (r.status === 'published') {
      // Only post.json can say who published it; older posts don't record it.
      if (post.publishedBy) { patch.statusBy = post.publishedBy; patch.statusAt = post.publishedAt || ''; }
    } else if (last) {
      patch.statusBy = last.reviewer; patch.statusAt = last.at || '';
    }
  }
  if (!r.approvedBy && approval && (r.status === 'approved' || r.status === 'published')) patch.approvedBy = approval.reviewer;
  if (!Object.keys(patch).length) return null;
  updateRow_(r.rowIndex, patch);
  return patch;
}

// Attribution for a batch of ids, in one request. HQ asks for exactly the rows
// the index couldn't tag, so a queue full of pre-attribution posts costs one
// round trip instead of one per row — and because each recovery is written back
// to the index on the way past, the next `list` carries it and nobody asks
// again. Same work backfillAttribution does, spread over the rows people
// actually look at.
function attrForIds_(idsCsv) {
  const MAX = 25;           // each id costs a Drive read — keep well inside the execution limit
  const want = String(idsCsv || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, MAX);
  if (!want.length) return {};
  const byId = {};
  rows_().forEach(r => { byId[String(r.id)] = r; });
  const out = {};
  want.forEach(id => {
    const r = byId[id];
    if (!r) return;
    let patch = null;
    // One unreadable post must neither fail the batch nor go unanswered — an
    // id with no answer is one HQ asks about again on every single load.
    try { patch = attrPatchFor_(r); } catch (err) { patch = null; }
    // Answer for every id we were asked about, recovered or not — "nothing to
    // find here" is an answer too, and it's what stops the asking.
    out[id] = { by: (patch && patch.statusBy) || r.statusBy || '',
                at: toIso_((patch && patch.statusAt) || r.statusAt),
                approvedBy: (patch && patch.approvedBy) || r.approvedBy || '' };
  });
  return out;
}
