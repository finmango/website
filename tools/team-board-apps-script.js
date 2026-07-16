/**
 * ============================================================================
 * FinMango — Team Board backend (Google Apps Script Web App)
 * ============================================================================
 * Powers team-board.html: the internal Notion-style workspace (boards, cards,
 * assignees, comments). The whole workspace is stored as one versioned JSON
 * document in a Google Sheet — simple, free, and no server to run (same
 * pattern as the Community Wall and Ambassador Notes backends).
 *
 * Concurrency model: optimistic locking. Every save must carry the version it
 * was based on; if a teammate saved first, the request gets a 'conflict'
 * response with the newer document and the front-end refreshes itself.
 *
 * ------------------------------- SETUP --------------------------------------
 * 1. Create a Google Sheet (any name, e.g. "FinMango Team Board"). Note its URL.
 * 2. In the Sheet: Extensions > Apps Script. Delete the sample code, paste THIS file.
 * 3. Fill in the CONFIG block below (Sheet URL + an ACCESS_KEY passphrase you
 *    invent and share privately with the team).
 * 4. Run `setup` once (top toolbar) and grant the permissions it requests.
 * 5. Deploy > New deployment > Web app:
 *       Execute as: Me        Who has access: Anyone
 *    Copy the resulting /exec URL.
 * 6. Paste that URL into BOARD_APPS_SCRIPT_URL in functions/_shared.js.
 * 7. Team members open finmango.org/team-board, hit "Sync", and enter the
 *    ACCESS_KEY once — their edits are shared with everyone from then on.
 *
 * Re-deploy (Deploy > Manage deployments > Edit > New version) after any change.
 * ----------------------------------------------------------------------------
 */

// ============================== CONFIG =====================================
const CONFIG = {
  SPREADSHEET_URL: 'REPLACE_WITH_YOUR_GOOGLE_SHEET_URL',
  // The shared team passphrase. Anyone with this key can read AND write the
  // board, so treat it like a password: invent a real one when deploying and
  // never commit it to the (public) repo.
  ACCESS_KEY: 'change-this-passphrase',
  // Refuse absurdly large documents (protects the Sheet; ~500 KB of JSON is
  // thousands of cards — far beyond normal use).
  MAX_DOC_BYTES: 500000,
};

const SHEET_NAME = 'Board';
// Sheet layout:
//   A1 = version (integer)   B1 = updatedAt (ISO)   C1 = updatedBy (name)
//   A3:A  = JSON document, split into chunks (Sheets caps a cell at 50k chars)
const CHUNK_SIZE = 45000;

// ============================== ROUTING ====================================
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'load') return json(loadDoc_(p.key));
    if (p.action === 'public') return json(publicDoc_());
    if (p.action === 'ping') return json({ result: 'success', pong: true });
    return json({ result: 'error', error: 'Unknown action' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(20000);
  try {
    let data = {};
    try { data = JSON.parse(e.postData.contents); } catch (err) { data = (e && e.parameter) || {}; }
    if (data.action === 'save') return json(saveDoc_(data));
    return json({ result: 'error', error: 'Unknown action' });
  } catch (err) {
    return json({ result: 'error', error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ============================== ACTIONS ====================================
function loadDoc_(key) {
  requireKey_(key);
  const sheet = getSheet_();
  const meta = sheet.getRange(1, 1, 1, 3).getValues()[0];
  const version = Number(meta[0]) || 0;
  if (version === 0) {
    // Fresh install — the front-end will seed its starter workspace and save.
    return { result: 'success', version: 0, data: null };
  }
  return {
    result: 'success',
    version: version,
    updatedAt: String(meta[1] || ''),
    updatedBy: String(meta[2] || ''),
    data: readChunks_(sheet)
  };
}

function saveDoc_(req) {
  requireKey_(req.key);

  const docString = JSON.stringify(req.data || null);
  if (docString === 'null') throw new Error('Missing document');
  if (docString.length > CONFIG.MAX_DOC_BYTES) throw new Error('Document too large');

  const sheet = getSheet_();
  const meta = sheet.getRange(1, 1, 1, 3).getValues()[0];
  const currentVersion = Number(meta[0]) || 0;
  const baseVersion = Number(req.baseVersion) || 0;

  if (currentVersion !== baseVersion) {
    // Someone else saved since this client last loaded. Hand back the newer
    // document instead of clobbering it — the front-end adopts it and retries.
    return {
      result: 'conflict',
      version: currentVersion,
      updatedAt: String(meta[1] || ''),
      updatedBy: String(meta[2] || ''),
      data: readChunks_(sheet)
    };
  }

  const newVersion = currentVersion + 1;
  writeChunks_(sheet, docString);
  sheet.getRange(1, 1, 1, 3).setValues([[
    newVersion,
    new Date().toISOString(),
    String(req.author || '').slice(0, 80)
  ]]);
  return { result: 'success', version: newVersion };
}

// The one endpoint that needs NO key: the public roadmap subset, consumed by
// roadmap.html on the website. It returns ONLY items the team explicitly
// flagged `public`, and ONLY safe fields — never comments, assignees,
// member names, or anything unflagged.
function publicDoc_() {
  const sheet = getSheet_();
  const doc = readChunks_(sheet);
  if (!doc) return { result: 'success', updatedAt: null, boards: [], pages: [] };

  const boards = (doc.boards || []).map(function (b) {
    const columns = (b.columns || []).map(function (col) {
      const cards = (b.cards || [])
        .filter(function (c) { return c.public && c.colId === col.id; })
        .map(function (c) {
          return {
            title: String(c.title || ''),
            desc: String(c.desc || ''),
            tags: (c.tags || []).map(String).slice(0, 8),
            updatedAt: c.updatedAt || null
          };
        });
      return { name: String(col.name || ''), color: String(col.color || ''), cards: cards };
    }).filter(function (col) { return col.cards.length > 0; });
    return { name: String(b.name || ''), icon: String(b.icon || ''), columns: columns };
  }).filter(function (b) { return b.columns.length > 0; });

  const pages = (doc.pages || [])
    .filter(function (p) { return p.public; })
    .map(function (p) {
      return {
        title: String(p.title || ''),
        icon: String(p.icon || ''),
        body: String(p.body || ''),
        updatedAt: p.updatedAt || null
      };
    });

  return { result: 'success', updatedAt: doc.updatedAt || null, boards: boards, pages: pages };
}

// ============================== STORAGE ====================================
function readChunks_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return null;
  const values = sheet.getRange(3, 1, lastRow - 2, 1).getValues();
  let raw = '';
  for (let i = 0; i < values.length; i++) raw += String(values[i][0] || '');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (err) { return null; }
}

function writeChunks_(sheet, docString) {
  const rows = [];
  for (let i = 0; i < docString.length; i += CHUNK_SIZE) {
    rows.push([docString.substring(i, i + CHUNK_SIZE)]);
  }
  const lastRow = sheet.getLastRow();
  if (lastRow >= 3) sheet.getRange(3, 1, lastRow - 2, 1).clearContent();
  sheet.getRange(3, 1, rows.length, 1).setValues(rows);
}

// ============================== HELPERS ====================================
function requireKey_(key) {
  if (CONFIG.ACCESS_KEY === 'change-this-passphrase') {
    throw new Error('Backend not configured (set ACCESS_KEY)');
  }
  if (String(key || '') !== CONFIG.ACCESS_KEY) throw new Error('Invalid access key');
}

function getSheet_() {
  const ss = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 3).setValues([[0, '', '']]);
    sheet.getRange(2, 1).setValue('--- JSON document chunks below; do not edit by hand ---');
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor toolbar after filling in CONFIG. */
function setup() {
  const sheet = getSheet_();
  Logger.log('Sheet "%s" ready. Current version: %s',
    SHEET_NAME, sheet.getRange(1, 1).getValue());
  Logger.log('Now deploy as a Web App (Execute as: Me / Access: Anyone) and put the /exec URL in functions/_shared.js');
}
