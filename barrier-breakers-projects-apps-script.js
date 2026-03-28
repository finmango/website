/**
 * Google Apps Script to handle Barrier Breakers Project Submissions.
 * 
 * INSTRUCTIONS:
 * 1. Go to sheets.google.com and create a new Sheet: "Barrier Breakers Projects"
 * 2. Extensions > Apps Script
 * 3. Paste this code.
 * 4. Run 'setup()' once to grant permissions.
 * 5. Deploy > New Deployment > Type: Web App
 *    - Description: "Project Submissions v1"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Copy the Web App URL and paste it into the script section of barrier-breakers-projects.html.
 */

const SHEET_NAME = "Submissions";

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const doc = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = doc.getSheetByName(SHEET_NAME);

        if (!sheet) {
            sheet = doc.insertSheet(SHEET_NAME);
            sheet.appendRow(["Timestamp", "Project Name", "Participant Names", "School", "Email", "Social Link", "Description", "Project Link", "Logo Link"]);
        }

        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const nextRow = sheet.getLastRow() + 1;

        let data;
        try {
            data = JSON.parse(e.postData.contents);
        } catch (err) {
            data = e.parameter;
        }

        let logoLink = "";
        if (data.logoBase64 && data.logoName && data.logoMimeType) {
            try {
               const decoded = Utilities.base64Decode(data.logoBase64);
               const blob = Utilities.newBlob(decoded, data.logoMimeType, data.logoName);
               
               const file = DriveApp.createFile(blob);
               file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
               logoLink = file.getUrl();
            } catch(err) {
               logoLink = "Error uploading logo: " + err.toString();
            }
        }

        const newRow = headers.map(function (header) {
            switch (header) {
                case "Timestamp": return new Date();
                case "Project Name": return data.projectName || "";
                case "Participant Names": return data.participantNames || "";
                case "School": return data.school || "";
                case "Email": return data.email || "";
                case "Social Link": return data.linkedin || "";
                case "Description": return data.description || "";
                case "Project Link": return data.projectLink || "";
                case "Logo Link": return logoLink;
                default: return "";
            }
        });

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "row": nextRow }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": e.toString() }))
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
        const headers = ["Timestamp", "Project Name", "Participant Names", "School", "Email", "Social Link", "Description", "Project Link", "Logo Link"];
        doc.getSheetByName(SHEET_NAME).appendRow(headers);
    }
    // This dummy call explicitly prompts Google to ask for Drive permissions when running setup
    try { DriveApp.getFileById("dummy"); } catch(e) {}
}
