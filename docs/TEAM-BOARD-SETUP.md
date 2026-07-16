# Team Board — setup & operations

A Notion-style internal workspace for the FinMango team at
**finmango.org/team-board**: boards, kanban columns, cards with assignees /
due dates / tags / comments, plus a table view. No server to run: the shared
backend is a Google Apps Script web app with a Google Sheet as storage (same
pattern as the Community Wall and Ambassador Notes).

It works in two modes:

- **Local mode (zero setup)** — open the page and start organizing. Everything
  is saved in that browser's localStorage. Nothing is shared.
- **Team sync mode** — after the one-time setup below, everyone who enters the
  shared team key sees and edits the *same* workspace. Changes propagate to
  other open tabs within ~15 seconds.

The page is `noindex` and isn't linked from the public site — it's an internal
tool, but note the URL itself is public, which is why reads *and* writes
require the team key.

## The pieces

| File | Role | Audience |
| --- | --- | --- |
| `team-board.html` | The whole app (board, table, modals, sync client) | Team |
| `tools/team-board-apps-script.js` | The backend (deploy to Apps Script) | One-time setup |
| `functions/api/board.js` | Cloudflare edge layer: same-origin proxy, never cached | Auto (no setup) |

## How sync works

The whole workspace is one JSON document stored (in chunks) in a Sheet tab,
with an integer version number. Saves are optimistic: each save says which
version it was based on; if a teammate saved first, the backend answers
`conflict` with the newer document and the front-end **merges card-by-card**
(newest edit wins, deletions tracked with tombstones) and saves again. The
front-end also polls every 15s and on tab focus, so everyone converges fast.

## One-time setup (≈10 minutes)

1. **Create a Google Sheet** in the team Drive (e.g. "FinMango Team Board").
   Copy its URL. You never need to edit this Sheet by hand.
2. In the Sheet: **Extensions → Apps Script**. Delete the sample code and
   paste all of `tools/team-board-apps-script.js`.
3. Edit the **CONFIG** block at the top:
   - `SPREADSHEET_URL` — the Sheet URL from step 1
   - `ACCESS_KEY` — invent a passphrase and share it privately with the team
     (password manager / DM — **never commit it to this public repo**)
4. Run the `setup` function once (toolbar ▸ select `setup` ▸ Run) and grant
   the requested permissions.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, authorize, and copy the **/exec** Web App URL.
6. Paste that URL into `functions/_shared.js` → `BOARD_APPS_SCRIPT_URL`
   (search for `REPLACE_WITH_BOARD_APPS_SCRIPT_WEB_APP_URL`), commit, push.
   Cloudflare Pages redeploys automatically.
7. Open finmango.org/team-board, click **Sync** in the sidebar, enter the
   `ACCESS_KEY`. The first device to connect publishes its local board as the
   shared one; everyone after that receives it.

> After **any** change to the Apps Script, redeploy a new version:
> Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.
> The /exec URL stays the same.

## Day-to-day

- **Boards** — one per project works well (sidebar ➕). Each board has its own
  columns and cards.
- **Cards** — click to open; set status, assignee, due date, priority, tags;
  write notes and comments. Drag cards between columns; drag column headers to
  reorder columns.
- **Members** — sidebar → Team members. Members are just names with avatar
  colors; each person picks "who they are" on their own device (used for
  comments and the "edited by" trail).
- **Views** — Board (kanban) and Table, toggle top-right. Search and the
  assignee/priority filters apply to both.
- **Backups** — sidebar → Backup / restore downloads the whole workspace as
  JSON (do this before big reorganizations). Restore replaces the workspace.

## Security notes, honestly stated

- One shared passphrase gates read and write for the whole workspace. That's
  the right weight for a small team's task board — but it means **don't put
  secrets, credentials, or sensitive personal data on cards.**
- Anyone with the key can edit anything; there are no per-user permissions.
  The Sheet's version history (File → Version history in Google Sheets) is
  your recovery path if something gets mangled, plus the JSON backups.
- Rotating the key: change `ACCESS_KEY` in the Apps Script, redeploy a new
  version, share the new key. Old clients just get "Wrong key" until updated.

## Troubleshooting

- **"Sync not set up"** — `BOARD_APPS_SCRIPT_URL` in `functions/_shared.js`
  is still the placeholder, or the change hasn't deployed yet.
- **"Wrong key"** — the entered key doesn't match `ACCESS_KEY` (or the Apps
  Script still has the default `change-this-passphrase`, which refuses all
  requests until changed).
- **Changes not appearing for teammates** — both sides need the key entered
  (green dot, "Synced" in the sidebar). Remember the ~15s poll interval.
- **Backend errors after editing the script** — you probably forgot to
  redeploy a new version (see the note above).
