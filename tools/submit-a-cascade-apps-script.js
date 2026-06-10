/**
 * Google Apps Script — Money Mango Daily cascade submissions.
 *
 * SETUP:
 * 1. Create a new Google Sheet titled "Money Mango Submissions".
 * 2. Extensions > Apps Script. Replace the default code with this file.
 * 3. Run setup() once to grant permissions and seed headers.
 * 4. Deploy > New deployment > Type: Web app
 *      - Description: "Money Mango cascade submissions v1"
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the resulting Web App URL and paste it as `SUBMIT_URL` in
 *    submit-a-cascade.html.
 *
 * The script stores each submission as one row. Frontend posts JSON,
 * but form-encoded fallback works too (e.parameter).
 */

const SHEET_NAME = "Submissions";
const HEADERS = [
  "Timestamp",
  "Status",          // Pending / Reviewed / Approved / Rejected
  "Name",
  "Country",
  "Email",
  "Ambassador?",
  "Theme",
  "Starting event",
  "Step 1 — event",
  "Step 1 — truth",
  "Step 2 — event",
  "Step 2 — truth",
  "Step 3 — event",
  "Step 3 — truth",
  "Step 4 — event",
  "Step 4 — truth",
  "Step 5 — event",
  "Step 5 — truth",
  "Step 6 — event",
  "Step 6 — truth",
  "Source / research link",
  "Notes",
  "Reviewer notes"
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = doc.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      data = e.parameter || {};
    }

    const row = HEADERS.map(function (h) {
      switch (h) {
        case "Timestamp":          return new Date();
        case "Status":             return "Pending";
        case "Name":               return data.name || "";
        case "Country":            return data.country || "";
        case "Email":              return data.email || "";
        case "Ambassador?":        return data.ambassador || "No";
        case "Theme":              return data.theme || "";
        case "Starting event":     return data.starting || "";
        case "Step 1 — event":     return data.step1_event || "";
        case "Step 1 — truth":     return data.step1_truth || "";
        case "Step 2 — event":     return data.step2_event || "";
        case "Step 2 — truth":     return data.step2_truth || "";
        case "Step 3 — event":     return data.step3_event || "";
        case "Step 3 — truth":     return data.step3_truth || "";
        case "Step 4 — event":     return data.step4_event || "";
        case "Step 4 — truth":     return data.step4_truth || "";
        case "Step 5 — event":     return data.step5_event || "";
        case "Step 5 — truth":     return data.step5_truth || "";
        case "Step 6 — event":     return data.step6_event || "";
        case "Step 6 — truth":     return data.step6_truth || "";
        case "Source / research link": return data.source || "";
        case "Notes":              return data.notes || "";
        case "Reviewer notes":     return "";
        default:                   return "";
      }
    });

    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

    // Optional: email FinMango when a new submission lands.
    // Uncomment and set the recipient to enable notifications.
    // MailApp.sendEmail({
    //   to: "research@finmango.org",
    //   subject: "New Money Mango cascade submission: " + (data.theme || "(no theme)"),
    //   body: "From: " + (data.name || "?") + " (" + (data.country || "?") + ")\n\n"
    //       + "Theme: " + (data.theme || "") + "\n\n"
    //       + "Starting event:\n" + (data.starting || "") + "\n\n"
    //       + "Review in the Sheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()
    // });

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", row: nextRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = doc.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    // Freeze header row, bold it
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
}
