/**
 * Google Apps Script to handle Judge Nomination Form submissions.
 * 
 * INSTRUCTIONS:
 * 1. Go to sheets.google.com and create a new Sheet: "Barrier Breakers Nominations"
 * 2. Add header row: Timestamp, Judge Name, Track, 1st Place, 1st Reason, 2nd Place, 3rd Place
 * 3. Extensions > Apps Script
 * 4. Paste this code.
 * 5. Run 'setup()' once to grant permissions.
 * 6. Deploy > New Deployment > Type: Web App
 *    - Description: "Judge Form v1"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (Critical!)
 * 7. Copy the Web App URL and provide it to the developer.
 */

const SHEET_NAME = "Nominations";

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const doc = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = doc.getSheetByName(SHEET_NAME);

        // Create sheet if missing
        if (!sheet) {
            sheet = doc.insertSheet(SHEET_NAME);
            sheet.appendRow(["Timestamp", "Judge Name", "Track", "1st Place", "1st Reason", "2nd Place", "3rd Place"]);
        }

        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const nextRow = sheet.getLastRow() + 1;

        // Parse data
        // Expecting JSON payload or Form parameters
        let data;
        try {
            data = JSON.parse(e.postData.contents);
        } catch (err) {
            data = e.parameter;
        }

        const newRow = headers.map(function (header) {
            // Map header names to incoming data keys
            switch (header) {
                case "Timestamp": return new Date();
                case "Judge Name": return data.judgeName;
                case "Track": return data.track;
                case "1st Place": return data.firstPlace;
                case "1st Reason": return data.firstPlaceReason;
                case "2nd Place": return data.secondPlace;
                case "3rd Place": return data.thirdPlace;
                default: return "";
            }
        });

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "row": nextRow }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function setup() {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);
    if (!sheet) {
        doc.insertSheet(SHEET_NAME);
        const headers = ["Timestamp", "Judge Name", "Track", "1st Place", "1st Reason", "2nd Place", "3rd Place"];
        doc.getSheetByName(SHEET_NAME).appendRow(headers);
    }
}
