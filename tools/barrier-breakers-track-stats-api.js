/**
 * Barrier Breakers Track Stats API
 * 
 * Add this function to your existing Google Apps Script that handles the 
 * Barrier Breakers application form. This enables the track popularity 
 * feature on the application page.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Apps Script project for the Barrier Breakers form
 * 2. Add the getTrackStats() function below
 * 3. Modify the existing doGet() function to handle the new action
 * 4. Deploy a new version of your web app
 */

// Add this to your existing doGet function, or create one if it doesn't exist
function doGet(e) {
  // Handle track stats request
  if (e && e.parameter && e.parameter.action === 'getTrackStats') {
    return getTrackStats();
  }
  
  // Handle other GET requests...
  return ContentService.createTextOutput('Barrier Breakers API');
}

/**
 * Returns track submission counts from the applications spreadsheet
 * Expects the spreadsheet to have a column named "track" with the track selections
 */
function getTrackStats() {
  try {
    // IMPORTANT: Replace this with your actual spreadsheet ID
    // You can find it in the URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
    const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
    const SHEET_NAME = 'Applications'; // Change if your sheet has a different name
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the track column index
    const trackColumnIndex = headers.findIndex(h => 
      h.toString().toLowerCase().includes('track')
    );
    
    if (trackColumnIndex === -1) {
      throw new Error('Track column not found in spreadsheet');
    }
    
    // Initialize track counts
    const tracks = {
      'Transportation': 0,
      'Housing Affordability': 0,
      'Healthcare Access': 0,
      'Open Track': 0,
      'Literacy & Investment Access': 0
    };
    
    // Count submissions per track (skip header row)
    for (let i = 1; i < data.length; i++) {
      const trackValue = data[i][trackColumnIndex];
      if (trackValue) {
        // Normalize the track name
        const normalizedTrack = normalizeTrackName(trackValue.toString());
        if (tracks.hasOwnProperty(normalizedTrack)) {
          tracks[normalizedTrack]++;
        }
      }
    }
    
    // Calculate total
    const total = Object.values(tracks).reduce((sum, count) => sum + count, 0);
    
    // Build response
    const response = {
      tracks: tracks,
      total: total,
      lastUpdated: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in getTrackStats: ' + error.message);
    
    // Return error response
    const errorResponse = {
      error: true,
      message: error.message,
      tracks: {
        'Transportation': 0,
        'Housing Affordability': 0,
        'Healthcare Access': 0,
        'Open Track': 0,
        'Literacy & Investment Access': 0
      },
      total: 0,
      lastUpdated: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Normalizes track names to match the expected format
 */
function normalizeTrackName(trackName) {
  const trackMap = {
    'transportation': 'Transportation',
    '🚗 transportation': 'Transportation',
    'housing': 'Housing Affordability',
    'housing affordability': 'Housing Affordability',
    '🏠 housing affordability': 'Housing Affordability',
    'healthcare': 'Healthcare Access',
    'healthcare access': 'Healthcare Access',
    '🏥 healthcare access': 'Healthcare Access',
    'open': 'Open Track',
    'open track': 'Open Track',
    '🌟 open track': 'Open Track',
    'literacy': 'Literacy & Investment Access',
    'literacy & investment access': 'Literacy & Investment Access',
    '📚 literacy & investment access': 'Literacy & Investment Access'
  };
  
  const lowercaseTrack = trackName.toLowerCase().trim();
  return trackMap[lowercaseTrack] || trackName;
}


/**
 * TEST FUNCTION: Run this to verify the track stats are working
 * Before running, make sure to set the correct SPREADSHEET_ID above
 */
function testGetTrackStats() {
  const result = getTrackStats();
  Logger.log(result.getContent());
}
