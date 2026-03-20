/**
 * FOOLPROOF GOOGLE APPS SCRIPT FOR FINMANGO JUDGING FORM
 * 
 * Instructions:
 * 1. Open a brand new Google Sheet.
 * 2. Copy the full URL of that Google Sheet from your browser's address bar.
 * 3. Go to Extensions > Apps Script.
 * 4. Delete the empty function and paste this entire code below.
 * 5. Paste your Google Sheet URL into line 15 where it says 'YOUR_GOOGLE_SHEET_URL_HERE'
 * 6. Click the Save icon.
 * 7. Click Deploy > New deployment.
 * 8. Select "Web app" (Execute as: "Me", Who has access: "Anyone").
 * 9. Click Deploy, Authorize the script, and copy the new Web App URL it gives you!
 */

function doPost(e) {
  try {
    // PASTE YOUR SPREADSHEET URL BELOW:
    var SPREADSHEET_URL = "YOUR_GOOGLE_SHEET_URL_HERE";
    var ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
    
    var sheetName = "Responses";
    var sheet = ss.getSheetByName(sheetName);
    
    // Automatically create the "Responses" tab if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // Automatically add nicely-formatted headers if the sheet is completely empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp", 
        "Judge Name", 
        "Team Number", 
        "Problem (1-5)", 
        "Solution (1-5)", 
        "Presentation (1-5)", 
        "Impact (1-5)", 
        "Total Score", 
        "Comments"
      ];
      sheet.appendRow(headers);
      
      // Make the headers bold and freeze the top row for easy scrolling
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // Since we are sending data securely via URLencoded format from the website, 
    // we extract the data using e.parameter instead of JSON parsing.
    var rowData = [
      e.parameter.timestamp        || new Date().toISOString(),
      e.parameter.judgeName        || "",
      e.parameter.teamNumber       || "",
      e.parameter.scoreProblem     || "",
      e.parameter.scoreSolution    || "",
      e.parameter.scorePresentation|| "",
      e.parameter.scoreImpact      || "",
      e.parameter.totalScore       || "",
      e.parameter.comments         || ""
    ];
    
    // Append the team's score to the bottom of the Google Sheet! 🚀
    sheet.appendRow(rowData);
    
    // Return a success JSON response
    return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return the error message if something fundamentally broke
    return ContentService.createTextOutput(JSON.stringify({"result":"error", "error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
