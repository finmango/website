// Barrier Breakers backend (Apps Script web app). Repo copy:
// tools/barrier-breakers-apply-apps-script.js. Deploy with tools/clasp-sync.py
// (see docs/APPS-SCRIPT-DEPLOY.md). CONFIG values are filled from the live project.
const CONFIG = {
  SHEET_ID: 'REPLACE_WITH_SHEET_ID',
  NOTIFY_EMAIL: 'competition@finmango.org',
};
const NOTIFY_SHEET = '2027 Notify';

function doPost(e) {
  if (e && e.parameter && e.parameter.form === 'notify') return handleNotify(e.parameter);
  try {
    var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var row = [
      new Date(),
      data.teamName,
      data.teamSize,
      data.schoolName,
      data.schoolAddress,
      data.member1Name,
      data.member1Email,
      data.member1Grade,
      data.member2Name || '',
      data.member2Email || '',
      data.member2Grade || '',
      data.member3Name || '',
      data.member3Email || '',
      data.member3Grade || '',
      data.track,
      data.oneSentence,
      data.problem,
      data.solution,
      data.whyYou,
      data.progress,
      data.videoUrl || '',
      data.anythingElse || '',
      data.teacherName,
      data.teacherEmail
    ];
    
    sheet.appendRow(row);
    
    // Send confirmation email
    sendConfirmationEmail(data);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getTrackStats') {
    return getTrackStats();
  }
  return ContentService.createTextOutput('OK');
}

function getTrackStats() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheets()[0]; 
  const data = sheet.getDataRange().getValues();
  
  const trackCol = data[0].findIndex(h => h.toString().toLowerCase().includes('track'));
  
  const tracks = {
    'Transportation': 0,
    'Housing Affordability': 0,
    'Healthcare Access': 0,
    'Open Track': 0,
    'Literacy & Investment Access': 0
  };
  
  if (trackCol !== -1) {
    for (let i = 1; i < data.length; i++) {
      const track = data[i][trackCol];
      if (track && tracks.hasOwnProperty(track)) tracks[track]++;
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    tracks: tracks,
    total: Object.values(tracks).reduce((a,b) => a+b, 0),
    lastUpdated: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function sendConfirmationEmail(data) {
  // Build recipient list
  var recipients = [data.teacherEmail, data.member1Email];
  if (data.member2Email) recipients.push(data.member2Email);
  if (data.member3Email) recipients.push(data.member3Email);
  
  // Remove duplicates and empty values
  recipients = [...new Set(recipients.filter(email => email))];
  
  // Build team members list for email
  var teamMembers = data.member1Name + ' (' + data.member1Grade + ')';
  if (data.member2Name) teamMembers += ', ' + data.member2Name + ' (' + data.member2Grade + ')';
  if (data.member3Name) teamMembers += ', ' + data.member3Name + ' (' + data.member3Grade + ')';
  
  var subject = '✅ Application Received: ' + data.teamName + ' - Barrier Breakers 2026';
  
  var htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #FF6B35; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Barrier Breakers 2026</h1>
        <p style="color: white; margin: 10px 0 0; opacity: 0.9;">Application Confirmed</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <p style="font-size: 18px; margin-top: 0;">Hi ${data.teacherName} and Team ${data.teamName}! 👋</p>
        
        <p>Great news — we've received your application for the <strong>Barrier Breakers Financial Health Innovation Challenge</strong>!</p>
        
        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #FF6B35;">Application Summary</h3>
          <p style="margin: 8px 0;"><strong>Team Name:</strong> ${data.teamName}</p>
          <p style="margin: 8px 0;"><strong>School:</strong> ${data.schoolName}</p>
          <p style="margin: 8px 0;"><strong>Team Members:</strong> ${teamMembers}</p>
          <p style="margin: 8px 0;"><strong>Track:</strong> ${data.track}</p>
          <p style="margin: 8px 0;"><strong>Your Idea:</strong> ${data.oneSentence}</p>
        </div>
        
        <h3 style="color: #FF6B35;">What's Next?</h3>
        <ol style="line-height: 1.8;">
          <li><strong>Start building your solution</strong> — use AI tools like Google Gemini or Claude to help prototype and research.</li>
          <li><strong>We'll notify you by early March</strong> whether you've been selected for Demo Day (top 5 teams) or the Innovation Gallery.</li>
          <li><strong>Competition Day: March 20, 2026</strong> at Kent State University.</li>
        </ol>
        
        <div style="background: #FFF5F1; border-left: 4px solid #FF6B35; padding: 15px; margin: 25px 0;">
          <strong>💡 Pro tip:</strong> The best applications show deep understanding of the problem. Research why your barrier matters and who it affects most.
        </div>
        
        <p>Questions? Reply to this email or contact us at <a href="mailto:competition@finmango.org" style="color: #FF6B35;">competition@finmango.org</a></p>
        
        <p style="margin-bottom: 0;">Good luck!<br><strong>The FinMango Team</strong></p>
      </div>
      
      <div style="background: #222; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2025 FinMango | <a href="https://www.finmango.org/barrier-breakers" style="color: #FF6B35;">Competition Info</a></p>
      </div>
    </div>
  `;
  
  var plainBody = `
Application Confirmed - Barrier Breakers 2026

Hi ${data.teacherName} and Team ${data.teamName}!

We've received your application for the Barrier Breakers Financial Health Innovation Challenge.

APPLICATION SUMMARY
- Team Name: ${data.teamName}
- School: ${data.schoolName}
- Team Members: ${teamMembers}
- Track: ${data.track}
- Your Idea: ${data.oneSentence}

WHAT'S NEXT
1. Start building your solution — use AI tools like Google Gemini or Claude to help.
2. We'll notify you by early March whether you're in Demo Day or Innovation Gallery.
3. Competition Day: March 20, 2026 at Kent State University.

Questions? Email competition@finmango.org

Good luck!
The FinMango Team
  `;
  
  // Send email
  GmailApp.sendEmail(
    recipients.join(','),
    subject,
    plainBody,
    {
      htmlBody: htmlBody,
      name: 'FinMango Barrier Breakers',
      replyTo: 'competition@finmango.org'
    }
  );
}

// ---------------------------------------------------------------------------
// "Get notified for 2027" form on barrier-breakers.html. Form-encoded POST with
// form=notify, email, role, page. One row per sign-up on the NOTIFY_SHEET tab of
// the same spreadsheet (created on first use), plus a short email to NOTIFY_EMAIL.
// ---------------------------------------------------------------------------
function handleNotify(p) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var email = String(p.email || '').trim().slice(0, 200);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonOut({ result: 'error', error: 'invalid email' });
    var role = String(p.role || '').trim().slice(0, 40);
    var page = String(p.page || '').trim().slice(0, 200);
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName(NOTIFY_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(NOTIFY_SHEET);
      sheet.appendRow(['Timestamp', 'Email', 'I am a', 'Source page']);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date(), email, role, page]);
    if (CONFIG.NOTIFY_EMAIL) {
      try {
        GmailApp.sendEmail(CONFIG.NOTIFY_EMAIL,
          'Barrier Breakers 2027 notify list: ' + email + (role ? ' (' + role + ')' : ''),
          email + '\n' + (role || '(no role given)') + '\n\nSheet: ' + ss.getUrl() + '\nTab: ' + NOTIFY_SHEET,
          { name: 'FinMango website', replyTo: email });
      } catch (err) { /* never fail the sign-up over the email */ }
    }
    return jsonOut({ result: 'success' });
  } catch (err) {
    return jsonOut({ result: 'error', error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
