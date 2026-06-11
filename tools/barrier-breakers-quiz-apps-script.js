/**
 * Barrier Breakers 2026 — Financial Literacy Quiz
 * Google Apps Script — Web App to receive quiz results
 *
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Paste this entire script into the editor
 * 3. Click Deploy → New Deployment
 * 4. Select type: "Web app"
 * 5. Execute as: "Me"
 * 6. Who has access: "Anyone"
 * 7. Click Deploy → copy the Web App URL
 * 8. Paste the URL into barrier-breakers-quiz.html (SHEETS_WEBHOOK_URL variable)
 *
 * SHEET SETUP:
 * The script will auto-create headers on first run if they don't exist.
 * Sheet name: "Quiz Results" (created automatically if not present)
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Quiz Results');

    // Create sheet + headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Quiz Results');
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Type (Student/Adult)',
        'Score',
        'Total Questions',
        'Percentage',
        'Total Time (seconds)',
        'Avg Time Per Question (seconds)',
        'Q1', 'Q1 Correct', 'Q1 Time',
        'Q2', 'Q2 Correct', 'Q2 Time',
        'Q3', 'Q3 Correct', 'Q3 Time',
        'Q4', 'Q4 Correct', 'Q4 Time',
        'Q5', 'Q5 Correct', 'Q5 Time',
        'Q6', 'Q6 Correct', 'Q6 Time',
        'Q7', 'Q7 Correct', 'Q7 Time',
        'Q8', 'Q8 Correct', 'Q8 Time',
        'Q9', 'Q9 Correct', 'Q9 Time',
        'Q10', 'Q10 Correct', 'Q10 Time',
        'Q11', 'Q11 Correct', 'Q11 Time',
        'Q12', 'Q12 Correct', 'Q12 Time',
      ]);

      // Bold & freeze header row
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
      sheet.setFrozenRows(1);

      // Set column widths
      sheet.setColumnWidth(1, 180); // Timestamp
      sheet.setColumnWidth(2, 160); // Name
      sheet.setColumnWidth(3, 140); // Type
    }

    // Build row data
    const row = [
      data.timestamp || new Date().toISOString(),
      data.name || 'Anonymous',
      data.type || 'Unknown',
      data.score,
      data.total,
      data.percentage + '%',
      data.totalTimeSeconds,
      data.avgTimePerQuestion,
    ];

    // Add per-question data
    if (data.answersDetail && Array.isArray(data.answersDetail)) {
      data.answersDetail.forEach(a => {
        row.push(a.selected);       // Answer chosen (A/B/C/D)
        row.push(a.correct ? 'Yes' : 'No');  // Correct?
        row.push(a.time + 's');     // Time spent
      });
    }

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS preflight (optional, helps with some browsers)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Barrier Breakers Quiz API is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
