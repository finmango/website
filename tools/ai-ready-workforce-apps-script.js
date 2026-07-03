/**
 * AI-Ready Workforce — Cohort Assessment Backend
 * Google Apps Script — Web App that stores anonymous assessment scores per
 * employer ("org") and serves aggregate-only reports to HR dashboards.
 *
 * SETUP INSTRUCTIONS (full walkthrough in docs/AI-READY-WORKFORCE-SETUP.md):
 * 1. Create a new Google Sheet → Extensions → Apps Script
 * 2. Paste this entire script into the editor
 * 3. Run addOrg('demo-org', 'Demo Organization') once from the editor to
 *    create your first org — the report key is logged and stored in "Orgs"
 * 4. Click Deploy → New Deployment → type "Web app"
 * 5. Execute as: "Me" • Who has access: "Anyone"
 * 6. Copy the Web App URL into APPS_SCRIPT_URL in functions/api/ai-ready.js
 *
 * PRIVACY MODEL:
 * - Submissions carry NO names, emails, or identifiers — only scores + org code
 * - Reports return aggregates only, and only once MIN_REPORT_N submissions
 *   exist for the org, so no individual is identifiable
 * - The report key (per org) is required to read aggregates
 */

var MIN_REPORT_N = 5; // reports stay locked until this many submissions exist

var SUBMISSIONS_SHEET = 'Submissions';
var ORGS_SHEET = 'Orgs';

// ============================================================
// ORG MANAGEMENT — run addOrg(...) manually from the editor
// ============================================================

/** Creates an org and returns its report key (also logged). */
function addOrg(code, name) {
  code = normalizeOrg_(code);
  if (!code) throw new Error('Org code must be 2-40 chars: letters, numbers, dashes');

  var sheet = getOrCreateSheet_(ORGS_SHEET, ['Code', 'Name', 'Report Key', 'Created']);
  if (findOrgRow_(sheet, code)) throw new Error('Org already exists: ' + code);

  var key = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
  sheet.appendRow([code, name || code, key, new Date().toISOString()]);
  Logger.log('Org "%s" created. Report key: %s', code, key);
  Logger.log('Assessment link: https://www.finmango.org/ai-ready/assessment.html?org=%s', code);
  Logger.log('Dashboard link: https://www.finmango.org/ai-ready/employer.html?org=%s&key=%s', code, key);
  return key;
}

// ============================================================
// WEB APP ENTRY POINTS
// ============================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action !== 'submit') return jsonOut_({ result: 'error', error: 'Unsupported action' });

    var org = normalizeOrg_(data.org);
    if (!org) return jsonOut_({ result: 'error', error: 'Missing or invalid org code' });

    var orgsSheet = getOrCreateSheet_(ORGS_SHEET, ['Code', 'Name', 'Report Key', 'Created']);
    if (!findOrgRow_(orgsSheet, org)) return jsonOut_({ result: 'error', error: 'Unknown org code' });

    var scores = data.scores || {};
    var dims = ['exposure', 'cushion', 'adaptability', 'safety'];
    var row = [new Date().toISOString(), org];
    var total = clampInt_(data.total, 0, 100);
    if (total === null) return jsonOut_({ result: 'error', error: 'Invalid total score' });
    row.push(total);
    for (var i = 0; i < dims.length; i++) {
      var s = clampInt_(scores[dims[i]], 0, 25);
      if (s === null) return jsonOut_({ result: 'error', error: 'Invalid dimension score' });
      row.push(s);
    }
    row.push(String(data.category || '').slice(0, 30));

    var sheet = getOrCreateSheet_(SUBMISSIONS_SHEET,
      ['Timestamp', 'Org', 'Total', 'Exposure', 'Cushion', 'Adaptability', 'Safety', 'Category']);
    sheet.appendRow(row);

    return jsonOut_({ result: 'success' });
  } catch (err) {
    return jsonOut_({ result: 'error', error: String(err) });
  }
}

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.action !== 'report') return jsonOut_({ result: 'error', error: 'Unsupported action' });

    var org = normalizeOrg_(p.org);
    var orgsSheet = getOrCreateSheet_(ORGS_SHEET, ['Code', 'Name', 'Report Key', 'Created']);
    var orgRow = org ? findOrgRow_(orgsSheet, org) : null;
    // Same error for bad org and bad key — don't leak which org codes exist
    if (!orgRow || !p.key || String(orgRow[2]) !== String(p.key)) {
      return jsonOut_({ result: 'error', error: 'Invalid org code or report key' });
    }

    var report = buildReport_(org);
    report.orgName = String(orgRow[1]);
    return jsonOut_({ result: 'success', report: report });
  } catch (err) {
    return jsonOut_({ result: 'error', error: String(err) });
  }
}

// ============================================================
// AGGREGATION
// ============================================================

function buildReport_(org) {
  var sheet = getOrCreateSheet_(SUBMISSIONS_SHEET,
    ['Timestamp', 'Org', 'Total', 'Exposure', 'Cushion', 'Adaptability', 'Safety', 'Category']);
  var rows = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues()
    : [];

  var subs = rows.filter(function (r) { return String(r[1]) === org; });
  var n = subs.length;

  if (n < MIN_REPORT_N) {
    return { locked: true, count: n, minRequired: MIN_REPORT_N };
  }

  var sumTotal = 0;
  var sums = { exposure: 0, cushion: 0, adaptability: 0, safety: 0 };
  var categories = { 'well-positioned': 0, 'building': 0, 'needs-attention': 0, 'vulnerable': 0 };

  subs.forEach(function (r) {
    sumTotal += Number(r[2]) || 0;
    sums.exposure += Number(r[3]) || 0;
    sums.cushion += Number(r[4]) || 0;
    sums.adaptability += Number(r[5]) || 0;
    sums.safety += Number(r[6]) || 0;
    var cat = String(r[7]);
    if (categories.hasOwnProperty(cat)) categories[cat]++;
  });

  return {
    locked: false,
    count: n,
    avgTotal: Math.round((sumTotal / n) * 10) / 10,
    dimensions: {
      exposure: Math.round((sums.exposure / n) * 10) / 10,
      cushion: Math.round((sums.cushion / n) * 10) / 10,
      adaptability: Math.round((sums.adaptability / n) * 10) / 10,
      safety: Math.round((sums.safety / n) * 10) / 10
    },
    categories: categories,
    updated: new Date().toISOString()
  };
}

// ============================================================
// HELPERS
// ============================================================

function normalizeOrg_(code) {
  code = String(code || '').trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{1,39}$/.test(code) ? code : null;
}

function clampInt_(v, min, max) {
  var n = Math.round(Number(v));
  if (isNaN(n) || n < min || n > max) return null;
  return n;
}

function findOrgRow_(sheet, code) {
  if (sheet.getLastRow() < 2) return null;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === code) return rows[i];
  }
  return null;
}

function getOrCreateSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
