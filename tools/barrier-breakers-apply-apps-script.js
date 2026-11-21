// Barrier Breakers backend (Apps Script web app). Repo copy:
// tools/barrier-breakers-apply-apps-script.js. Deploy with tools/clasp-sync.py
// (see docs/APPS-SCRIPT-DEPLOY.md). CONFIG values are filled from the live project.
const CONFIG = {
  SHEET_ID: 'REPLACE_WITH_SHEET_ID',
  NOTIFY_EMAIL: 'competition@finmango.org',
};
const NOTIFY_SHEET = '2027 Notify';
const TESTIMONY_SHEET = 'Teacher Testimonies';

function doPost(e) {
  if (e && e.parameter && e.parameter.form === 'notify') return handleNotify(e.parameter);
  if (e && e.parameter && e.parameter.form === 'testimony') return handleTestimony(e.parameter);
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

// ---------------------------------------------------------------------------
// Teacher testimony form on teacher-testimony.html. Form-encoded POST with
// form=testimony. One row per teacher on the TESTIMONY_SHEET tab of the same
// spreadsheet (created on first use), an email to NOTIFY_EMAIL carrying the full
// text, and a thank-you to the teacher.
//
// The optional photo arrives as base64 (the page shrinks it to a JPEG first) and
// is attached to the NOTIFY_EMAIL message. It is not written to Drive: this
// project is authorized for Sheets and Gmail only, and adding DriveApp would
// take the whole web app down until Scott re-authorized it in the editor.
// ---------------------------------------------------------------------------
var TESTIMONY_HEADERS = ['Timestamp', 'Name', 'Email', 'School', 'Teaches', 'Worked with FinMango through',
  'The problem in schools', 'Barrier Breakers', 'Anything else', 'Credit as', 'Permission to share',
  'Open to follow-up', 'Photo', 'Source page'];

function handleTestimony(p) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var clean = function (v, max) { return String(v || '').trim().slice(0, max); };
    var name = clean(p.name, 120), email = clean(p.email, 200), school = clean(p.school, 200);
    var problem = clean(p.problem, 5000), bb = clean(p.bb, 5000);
    if (!name || !school) return jsonOut({ result: 'error', error: 'missing name or school' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonOut({ result: 'error', error: 'invalid email' });
    if (!problem && !bb) return jsonOut({ result: 'error', error: 'no testimony' });
    if (p.consent !== 'yes') return jsonOut({ result: 'error', error: 'no permission to share' });
    var teaches = clean(p.teaches, 200), programs = clean(p.programs, 300), more = clean(p.more, 5000);
    var credit = clean(p.credit, 60) || 'Name and school', followup = p.followup === 'yes' ? 'Yes' : 'No';
    var page = clean(p.page, 200);

    // Photo: JPEG or PNG only, 6 MB decoded at most. A bad photo never costs us the words.
    var photo = null, photoNote = '';
    if (p.photo) {
      try {
        var type = /^image\/(jpeg|png)$/.test(p.photoType) ? p.photoType : '';
        var bytes = type ? Utilities.base64Decode(String(p.photo)) : null;
        if (bytes && bytes.length <= 6 * 1024 * 1024) {
          var ext = type === 'image/png' ? '.png' : '.jpg';
          var base = (name + ' ' + school).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
          photo = Utilities.newBlob(bytes, type, 'testimony-' + base + ext);
          photoNote = 'Attached to the notification email (' + photo.getName() + ')';
        } else {
          photoNote = 'Sent, but not usable (wrong type or over 6 MB). Ask for it by email.';
        }
      } catch (err) {
        photoNote = 'Sent, but could not be read. Ask for it by email.';
      }
    }

    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    var sheet = ss.getSheetByName(TESTIMONY_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(TESTIMONY_SHEET);
      sheet.appendRow(TESTIMONY_HEADERS);
      sheet.setFrozenRows(1);
    }
    // Text typed by the public: keep a leading = + - @ from being read as a formula.
    var cell = function (v) { return /^[=+\-@]/.test(v) ? "'" + v : v; };
    sheet.appendRow([new Date(), cell(name), cell(email), cell(school), cell(teaches), cell(programs),
      cell(problem), cell(bb), cell(more), cell(credit), 'Yes', followup, photoNote, cell(page)]);

    var text = [
      name + ', ' + school + (teaches ? ' (' + teaches + ')' : ''),
      email,
      'Worked with FinMango through: ' + (programs || '(not given)'),
      'Credit as: ' + credit,
      'Open to a follow-up call or video: ' + followup,
      'Photo: ' + (photoNote || 'none'),
      '',
      'THE PROBLEM IN SCHOOLS',
      problem || '(left blank)',
      '',
      'BARRIER BREAKERS',
      bb || '(left blank)',
      '',
      'ANYTHING ELSE',
      more || '(left blank)',
      '',
      'Sheet: ' + ss.getUrl(),
      'Tab: ' + TESTIMONY_SHEET
    ].join('\n');

    if (CONFIG.NOTIFY_EMAIL) {
      try {
        var options = { name: 'FinMango website', replyTo: email };
        if (photo) options.attachments = [photo];
        GmailApp.sendEmail(CONFIG.NOTIFY_EMAIL, 'Teacher testimony: ' + name + ', ' + school, text, options);
      } catch (err) {
        // The row is saved; say on it that the email (and any photo) did not go out.
        try { sheet.getRange(sheet.getLastRow(), 13).setValue((photo ? 'Photo lost: ' : '') + 'notification email failed (' + err + ')'); } catch (e2) {}
      }
    }

    try { sendTestimonyThanks(name, email, problem, bb, more, credit); } catch (err) { /* never fail the submission over the thank-you */ }
    return jsonOut({ result: 'success' });
  } catch (err) {
    return jsonOut({ result: 'error', error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

function sendTestimonyThanks(name, email, problem, bb, more, credit) {
  var first = name.split(/\s+/)[0];
  var copy = [];
  if (problem) copy.push('What your students are up against:\n' + problem);
  if (bb) copy.push('Barrier Breakers:\n' + bb);
  if (more) copy.push('Anything else:\n' + more);
  var body = [
    'Hi ' + first + ',',
    '',
    'Thank you. We know how full a teacher\'s day is, and you gave some of it to us.',
    '',
    'Your words help us show funders and partners what students are facing and why this programming is worth keeping in schools. You asked to be credited as: ' + credit + '. We may trim for length, but we won\'t change what you mean.',
    '',
    'If you ever want something edited or taken down, reply to this email and we\'ll take care of it.',
    '',
    'For your records, here is what you sent:',
    '',
    copy.join('\n\n'),
    '',
    'With appreciation,',
    'The FinMango team'
  ].join('\n');
  GmailApp.sendEmail(email, 'Thank you for your testimony', body,
    { name: 'FinMango', replyTo: CONFIG.NOTIFY_EMAIL || 'competition@finmango.org' });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
