# FinMango HQ (Team Workspace) — setup & operations

A Notion-style internal workspace for the FinMango team at
**finmango.org/team-board**, built around three concepts — deliberately never
more:

- **Boards** — kanban + table views. Two are seeded: **🧭 Roadmap** (the
  org-level Now / Next / Later / Someday / Shipped view, imported from the old
  Notion roadmap) and **🥭 Team HQ** (day-to-day tasks).
- **Pages** — a markdown wiki: Start Here hub, Get Involved, leadership call
  notes, initiative write-ups. Supports `[[wikilinks]]` between pages.
- **Members** — names with avatar colors; each person picks "who they are" on
  their own device.

Plus a public face: cards and pages flagged **🌐 public** render on
**finmango.org/roadmap** — a live, FinMango-branded public roadmap.

No server to run: the shared backend is a Google Apps Script web app with a
Google Sheet as storage (same pattern as the Community Wall and Ambassador
Notes).

It works in two modes:

- **Local mode (zero setup)** — open the page and start organizing. Everything
  is saved in that browser's localStorage. Nothing is shared.
- **Team sync mode** — after the one-time setup below, everyone who enters the
  shared team key sees and edits the *same* workspace. Changes propagate to
  other open tabs within ~15 seconds.

The workspace page is `noindex` and isn't linked from the public site. The
public roadmap page (`roadmap.html`) IS meant to be found and linked.

## The pieces

| File | Role | Audience |
| --- | --- | --- |
| `team-board.html` | The whole workspace app (boards, wiki, modals, sync client) | Team |
| `roadmap.html` | Public roadmap — renders only 🌐-flagged items | Everyone |
| `tools/team-board-apps-script.js` | The backend (deploy to Apps Script) | One-time setup |
| `functions/api/board.js` | Cloudflare edge layer: load/save proxy (never cached) + public subset (cached ~2 min) | Auto (no setup) |

## How sync works

The whole workspace is one JSON document stored (in chunks) in a Sheet tab,
with an integer version number. Saves are optimistic: each save says which
version it was based on; if a teammate saved first, the backend answers
`conflict` with the newer document and the front-end **merges item-by-item**
(newest edit wins for cards and pages, deletions tracked with tombstones) and
saves again. The front-end also polls every 15s and on tab focus.

## How the public roadmap works

Each card and page has a **🌐 public** checkbox, **off by default** (the
seeded roadmap items that came from the old *public* Notion roadmap start
flagged on, since that content was already public). `roadmap.html` calls
`/api/board?action=public` — a key-less endpoint that returns **only** flagged
items, and only safe fields: title, notes, tags, column, and page bodies.
Comments, assignees, and member names are never included. Responses are
edge-cached ~2 minutes, so public traffic barely touches the backend.

## One-time setup (≈10 minutes)

> The "FinMango HQ Workspace" Sheet already exists in the team Drive
> (owner: scott@finmango.org) and `SPREADSHEET_URL` in the script is
> pre-filled to match. Only `ACCESS_KEY` needs to be set by hand — it's kept
> out of this (public) repo on purpose.

1. **Create a Google Sheet** — or use the existing "FinMango HQ Workspace"
   Sheet. You never need to edit this Sheet by hand.
2. In the Sheet: **Extensions → Apps Script**. Delete the sample code and
   paste all of `tools/team-board-apps-script.js`.
3. Edit the **CONFIG** block at the top:
   - `SPREADSHEET_URL` — the Sheet URL from step 1 (pre-filled)
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
   `ACCESS_KEY`. The first device to connect publishes its local workspace as
   the shared one; everyone after that receives it.

> After **any** change to the Apps Script, redeploy a new version:
> Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.
> The /exec URL stays the same.

## Day-to-day

- **The Roadmap board** is the org's strategy view. Rules that keep it honest:
  "Now" holds only what's truly in motion (3–5 cards); order within a column
  is the priority; when something ships, drag it to Shipped.
- **Leadership calls** — flag any card with **📞 Discuss at next call** (in
  the card). On the call, open the Roadmap and hit the **📞 Agenda** button:
  it shows everything in Now plus every flagged card — that's the agenda.
  Drag cards between horizons as decisions get made, unflag as you go, and jot
  decisions in the **📞 Leadership Call Notes** page.
- **Initiatives** — before proposing something big, copy the **💡 Initiative
  Template** page and link it from the card with a `[[wikilink]]`.
- **Pages** — Edit/Read toggle top-right. Markdown: `#` headings, `**bold**`,
  `-` lists, `[links](https://…)`, `[[Other Page]]`, ``` code blocks.
- **Quick find** — `Ctrl/Cmd+K` searches boards, cards, and pages.
- **Publishing** — tick 🌐 on a card or page and it appears on
  finmango.org/roadmap within ~2 minutes. Untick to unpublish.
- **Backups** — sidebar → Backup / restore downloads the whole workspace as
  JSON. Do this before big reorganizations.

## Security notes, honestly stated

- One shared passphrase gates read and write for the whole workspace. That's
  the right weight for a small team — but it means **don't put secrets,
  credentials, or sensitive personal data on cards or pages.**
- Anything flagged 🌐 is on the open internet within ~2 minutes. The flag is
  off by default; flagging is a deliberate act. Review the card's notes before
  ticking it — notes are published along with the title.
- Anyone with the key can edit anything; there are no per-user permissions.
  The Sheet's version history (File → Version history) is the recovery path,
  plus JSON backups.
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
- **/roadmap shows "check back soon"** — either sync isn't set up yet, nothing
  is flagged 🌐, or the edge cache hasn't refreshed (~2 min).
- **Backend errors after editing the script** — you probably forgot to
  redeploy a new version (see the note above).
