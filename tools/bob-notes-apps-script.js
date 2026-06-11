/**
 * Google Apps Script — Bob Notes posting backend.
 *
 * Receives posts from bob-post.html (text + photos + videos + link),
 * saves the uploads to Drive (auto-shared, link-viewable), and appends
 * one row per post to the sheet that education.html reads.
 * Full walkthrough: docs/BOB-NOTES-SETUP.md (Option A).
 *
 * SETUP:
 * 1. Create a Google Sheet titled "Bob Notes (Website Feed)".
 * 2. Extensions > Apps Script. Replace the default code with this file.
 * 3. Set POSTING_CODE below to a code only Bob (and FinMango) knows.
 * 4. Run setup() once — grants permissions, seeds the headers, and makes
 *    the sheet + uploads folder link-viewable so the website can read them.
 *    The execution log prints the IDs to paste into the website.
 * 5. Deploy > New deployment > Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 6. Copy the Web App URL into SCRIPT_URL in bob-post.html, and the
 *    sheet ID (long string in the sheet's URL) into SHEET_ID in
 *    education.html.
 *
 * NOTE: code edits only go live after publishing a new version:
 * Deploy > Manage deployments > pencil icon > Version: New version > Deploy.
 */

const POSTING_CODE = "CHANGE-ME"; // <-- set this before deploying
const SHEET_NAME = "Posts";
const HEADERS = ["Timestamp", "Title", "Note", "Photos", "Videos", "Link", "Hide"];
const UPLOAD_FOLDER_NAME = "Bob Notes Uploads";
const MAX_PHOTOS = 10;
const MAX_VIDEOS = 3;
const MAX_FILE_BYTES = 30 * 1024 * 1024; // per file after decoding; bigger videos go in as links

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      data = e.parameter || {};
    }

    if (POSTING_CODE === "CHANGE-ME") {
      return reply_({ ok: false, error: "Backend not set up yet: POSTING_CODE is still the placeholder." });
    }
    if (String(data.code || "").trim() !== POSTING_CODE) {
      return reply_({ ok: false, error: "Wrong posting code." });
    }

    const title = String(data.title || "").trim().slice(0, 200);
    const note = String(data.note || "").trim().slice(0, 10000);
    const link = String(data.link || "").trim().slice(0, 500);
    const photoUrls = saveFiles_(data.photos, "image/", MAX_PHOTOS);
    const videoUrls = saveFiles_(data.videos, "video/", MAX_VIDEOS);

    if (!title && !note && !photoUrls.length && !videoUrls.length) {
      return reply_({ ok: false, error: "Nothing to post — write a note or attach something." });
    }

    getSheet_().appendRow([new Date(), title, note, photoUrls.join(", "), videoUrls.join(", "), link, ""]);

    // Optional: email FinMango when Bob posts.
    // MailApp.sendEmail({
    //   to: "hello@finmango.org",
    //   subject: "New Bob Note: " + (title || note.slice(0, 60) || "(media only)"),
    //   body: note + "\n\nReview in the Sheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()
    // });

    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, error: "Server error: " + err });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Saves base64-encoded uploads ({name, type, data}) to the uploads folder,
 * shares each file link-viewable so the website can display it, and returns
 * the Drive URLs. Files with the wrong MIME prefix or over the size cap are
 * skipped silently.
 */
function saveFiles_(files, typePrefix, maxCount) {
  if (!Array.isArray(files) || !files.length) return [];
  const folder = getUploadFolder_();
  const urls = [];
  files.slice(0, maxCount).forEach(function (f, i) {
    const type = String((f && f.type) || "");
    if (type.indexOf(typePrefix) !== 0) return;
    const bytes = Utilities.base64Decode(String((f && f.data) || ""));
    if (!bytes.length || bytes.length > MAX_FILE_BYTES) return;
    const safeName = String((f && f.name) || "upload").replace(/[^\w.\- ]+/g, "").slice(-80) || "upload";
    const file = folder.createFile(Utilities.newBlob(bytes, type, Date.now() + "-" + i + "-" + safeName));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    urls.push("https://drive.google.com/file/d/" + file.getId() + "/view");
  });
  return urls;
}

/**
 * Returns the Posts sheet, creating it if needed. A fresh spreadsheet's
 * empty first tab is renamed rather than added to, so Posts stays the
 * first tab — which is what education.html falls back to reading.
 */
function getSheet_() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(SHEET_NAME);
  if (!sheet) {
    const first = doc.getSheets()[0];
    sheet = first && first.getLastRow() === 0 ? first.setName(SHEET_NAME) : doc.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function getUploadFolder_() {
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty("UPLOAD_FOLDER_ID");
  if (savedId) {
    try {
      return DriveApp.getFolderById(savedId);
    } catch (err) {
      // folder was deleted — fall through and recreate
    }
  }
  const folder = DriveApp.createFolder(UPLOAD_FOLDER_NAME);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  props.setProperty("UPLOAD_FOLDER_ID", folder.getId());
  return folder;
}

function reply_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function setup() {
  const sheet = getSheet_();
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");

  const doc = SpreadsheetApp.getActiveSpreadsheet();
  // The website reads the sheet anonymously, so it must be link-viewable.
  DriveApp.getFileById(doc.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  getUploadFolder_();

  Logger.log("SHEET_ID for education.html: " + doc.getId());
  Logger.log("SHEET_TAB for education.html: " + SHEET_NAME);
  Logger.log("Next: Deploy > New deployment > Web app (Execute as: Me / Who has access: Anyone), then paste the Web App URL into SCRIPT_URL in bob-post.html.");
}
