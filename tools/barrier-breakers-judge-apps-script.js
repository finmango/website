/**
 * Google Apps Script to collect Barrier Breakers judge sign-ups.
 * Receives POSTs from barrier-breakers-judge-apply.html.
 *
 * INSTRUCTIONS:
 * 1. Go to sheets.google.com and create a new Sheet: "Barrier Breakers Judges"
 * 2. Extensions > Apps Script
 * 3. Paste this code.
 * 4. Set NOTIFY_EMAIL below (or leave blank to skip the email).
 * 5. Run 'setup()' once to create the sheet tab and grant permissions.
 * 6. Deploy > New Deployment > Type: Web App
 *    - Description: "Judge sign-ups v1"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 7. Copy the Web App URL into APPS_SCRIPT_URL in barrier-breakers-judge-apply.html.
 *
 * To test without the page: open the Web App URL in a browser; it should say "ok".
 */

const SHEET_NAME = "Sign-ups";
const NOTIFY_EMAIL = "competition@finmango.org"; // "" to disable notifications

const HEADERS = [
    "Timestamp", "Name", "Email", "Organization", "Title", "Background",
    "Judged before", "Availability", "Link", "Note", "Source page", "Status"
];

function doGet() {
    return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const sheet = getSheet();
        const p = (e && e.parameter) || {};

        const row = [
            new Date(),
            p.name || "",
            p.email || "",
            p.org || "",
            p.title || "",
            p.background || "",
            p.experience || "",
            p.availability || "",
            p.link || "",
            p.note || "",
            p.page || "",
            "New"
        ];
        sheet.appendRow(row);

        if (NOTIFY_EMAIL && p.email) {
            const subject = "New judge sign-up: " + (p.name || "(no name)") + " — " + (p.org || "");
            const body = [
                "Name: " + (p.name || ""),
                "Email: " + (p.email || ""),
                "Organization: " + (p.org || ""),
                "Title: " + (p.title || ""),
                "Background: " + (p.background || ""),
                "Judged before: " + (p.experience || ""),
                "Availability: " + (p.availability || ""),
                "Link: " + (p.link || ""),
                "Note: " + (p.note || ""),
                "",
                "Sheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()
            ].join("\n");
            try { MailApp.sendEmail(NOTIFY_EMAIL, subject, body); } catch (err) { /* don't fail the sign-up over email */ }
        }

        return ContentService
            .createTextOutput(JSON.stringify({ result: "success" }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function getSheet() {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);
    if (!sheet) {
        sheet = doc.insertSheet(SHEET_NAME);
        sheet.appendRow(HEADERS);
        sheet.setFrozenRows(1);
    }
    return sheet;
}

function setup() {
    getSheet();
    // Touching MailApp here makes Google ask for the email permission during setup
    try { MailApp.getRemainingDailyQuota(); } catch (e) {}
}
