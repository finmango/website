/**
 * GOOGLE APPS SCRIPT FOR FINMANGO JUDGING FORM
 * 
 * Instructions:
 * 1. Open a new Google Sheet.
 * 2. Rename the first tab "Responses" (or create a new sheet with that name).
 * 3. Go to Extensions > Apps Script.
 * 4. Paste this script, click Save.
 * 5. Click Deploy > New Deployment.
 * 6. Select type: "Web App". Execute as: "Me", Who has access: "Anyone".
 * 7. Click Deploy, Authorize the script, and copy the Web App URL!
 */

function doPost(e) {
  try {
    var sheetName = "Responses";
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    // Automatically create the "Responses" sheet if it doesn't even exist yet!
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
    }

    // Automatically add nicely-formatted headers if the sheet is empty
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

    // Parse the JSON data sent from the HTML form
    var data = JSON.parse(e.postData.contents);
    
    // Create an array with the data ordered correctly under the headers
    var rowData = [
      data.timestamp || new Date().toISOString(), // Column 1: Timestamp
      data.judgeName || "",                       // Column 2: Judge Name
      data.teamNumber || "",                      // Column 3: Team Number
      data.scoreProblem || "",                    // Column 4: Problem Score
      data.scoreSolution || "",                   // Column 5: Solution Score
      data.scorePresentation || "",               // Column 6: Presentation Score
      data.scoreImpact || "",                     // Column 7: Impact Score
      data.totalScore || "",                      // Column 8: Total Score
      data.comments || ""                         // Column 9: Comments
    ];
    
    // Append the team's score to the bottom of the Google Sheet
    sheet.appendRow(rowData);
    
    // Return a success JSON response
    return ContentService.createTextOutput(JSON.stringify({"result":"success", "data": JSON.stringify(data)}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result":"error", "error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
