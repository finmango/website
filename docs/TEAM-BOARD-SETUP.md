# FinMango HQ (Team Workspace) — setup & operations

A Notion-style internal workspace for the FinMango team at
**finmango.org/team-board**, built around three concepts — deliberately never
more:

- **Boards** — kanban + table views. Two are seeded: **🧭 Roadmap** (the
  org-level Now / Next / Later / Someday / Shipped view, imported from the old
  Notion roadmap) and **🥭 Team HQ** (day-to-day tasks).
- **Pages** — a markdown wiki: Start Here hub, Get Involved, leadership call
  notes, initiative write-ups. Supports `[[wikilinks]]` between pages.
- **Members** — created automatically on Google sign-in, with names and
  photos from the person's @finmango.org account.

Plus a public face: cards and pages flagged **🌐 public** render on
**finmango.org/roadmap** — a live, FinMango-branded public roadmap.

No server to run: the shared backend is a Google Apps Script web app with a
Google Sheet as storage (same pattern as the Community Wall and Ambassador
Notes).

The page is **gated**: visitors see only a sign-in screen — no workspace UI,
no content — until they authenticate. Once in, everyone sees and edits the
*same* shared workspace; changes propagate to other open tabs within ~15
seconds. (Edits are also cached in the browser's localStorage, so brief
connectivity blips don't lose work.)

The gate is a UX/visibility layer — the actual security boundary is the
backend, which refuses every read and write without valid credentials.

Access has **two doors**:

- **Sign in with FinMango** (the primary door) — Google sign-in restricted to
  @finmango.org accounts. Identity is automatic: signing in registers you as
  a member, and your Google name and profile photo flow onto your avatar,
  comments, and edits. No passwords, no key to share. (Requires the OAuth
  client ID setup below.)
- **Team key** (fallback) — one shared passphrase for access without a
  FinMango account. Key-only sessions can read and edit but aren't attributed
  to a person — identity comes exclusively from Google sign-in.

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
7. Open finmango.org/team-board, click **Sync** in the sidebar, and connect —
   sign in with your @finmango.org account (if Google Sign-In is set up) or
   enter the `ACCESS_KEY`. The first device to connect publishes its local
   workspace as the shared one; everyone after that receives it.

> After **any** change to the Apps Script, redeploy a new version:
> Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.
> The /exec URL stays the same.

## Google Sign-In setup (≈5 minutes, optional but recommended)

This enables the "Sign in with FinMango" door — real names and photos, no
shared key needed for staff. It's one OAuth client ID, free, created once:

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) signed
   in as scott@finmango.org. Create a project (e.g. "FinMango HQ") or reuse
   an existing one.
2. **APIs & Services → OAuth consent screen** → User type: **Internal**
   (available because finmango.org is a Google Workspace org — it restricts
   sign-in to org accounts before our code even runs). App name "FinMango HQ",
   your email for the contacts. Save — no scopes need adding.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   → Application type: **Web application** → Name "FinMango HQ".
   Under **Authorized JavaScript origins** add:
   - `https://www.finmango.org`
   - `https://finmango.org`
   (add a `*.pages.dev` branch-preview origin too if you want sign-in to work
   on preview deploys — origins must be exact, wildcards aren't allowed.)
4. Copy the **Client ID** (ends in `.apps.googleusercontent.com`). It's public
   by design — safe to commit. Paste it in **two** places:
   - `team-board.html` → `GOOGLE_CLIENT_ID`
   - the Apps Script → `CONFIG.GOOGLE_CLIENT_ID` (then redeploy a new version)
5. Commit/push the site change. Done — the Google button appears in the
   Access & sync modal and the who-are-you dialog.

How it works under the hood: Google sign-in hands the browser a signed ID
token, which the Apps Script verifies against Google (signature, expiry,
audience, domain). Google ID tokens only last about an hour, so right after
sign-in the front-end trades it for a **session token** minted by the Apps
Script — HMAC-signed with a secret the script auto-generates into Script
Properties (`SESSION_SECRET`) — valid **30 days** and renewed on each visit.
That's what "stay signed in" rests on: sign in once, and as long as you open
the board at least once a month you never see the gate again. All credentials
travel via POST (never in URLs). If the deployed script predates session
tokens, the front-end quietly falls back to the old behavior (1-hour tokens,
One Tap re-issue) — so redeploy a new version of the Apps Script to turn
persistent sign-in on.

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

### The Review tabs

Two moderation queues live in the sidebar under **Review**, so approvals
aren't stuck in one person's inbox. Anyone signed in to HQ can clear them,
and every decision is recorded with the reviewer's name.

- **📝 Ambassador Notes** — drafts from `write.html`. Approve (and schedule
  the go-live), request changes, reject, publish. See `docs/POSTS-SETUP.md`.
- **🧡 Pledges & Stories** — everything submitted to the Pledge Wall
  (`pledge-wall.html`) and the Community Wall (`community-wall.html`).
  Approve or reject; approved items appear publicly within a couple of
  minutes. Pledges whose signer didn't opt into the public wall are labelled
  **🔒 Private** — they're counted but never displayed, whatever you decide.
  See `docs/COMMUNITY-WALL-SETUP.md`.

Both tabs show a badge with the pending count and warm themselves in the
background at load, so the queue is on screen the moment you click.

Each queue reaches its own backend through this Apps Script, which holds the
review key server-side — **being signed in to HQ is the only credential a
browser ever carries.** They need one config value each, and until it's set
the tab explains which one is missing:

| Tab | CONFIG key in `tools/team-board-apps-script.js` | Value |
| --- | --- | --- |
| Ambassador Notes | `POSTS_REVIEW_KEY` | the posts script's `REVIEW_KEY` |
| Pledges & Stories | `WALL_MODERATION_KEY` | the Community Wall script's `MODERATION_KEY` |

Set them in the CONFIG block, redeploy a new version (Deploy → Manage
deployments → ✏️ Edit → Version: New version), and the tabs light up. The
`/exec` URL doesn't change. Never commit the real values — this repo is
public.

## Security notes, honestly stated

- Access is Google sign-in (@finmango.org, verified server-side) or one shared
  passphrase for volunteers. Everyone with either has full read/write — so
  **don't put secrets, credentials, or sensitive personal data on cards or
  pages.**
- Anything flagged 🌐 is on the open internet within ~2 minutes. The flag is
  off by default; flagging is a deliberate act. Review the card's notes before
  ticking it — notes are published along with the title.
- Anyone with the key can edit anything; there are no per-user permissions.
  The Sheet's version history (File → Version history) is the recovery path,
  plus JSON backups.
- Rotating the key: change `ACCESS_KEY` in the Apps Script, redeploy a new
  version, share the new key. Old clients just get "Wrong key" until updated.
- Signing everyone out at once (e.g. a lost laptop): in the Apps Script editor,
  Project Settings → Script Properties → delete `SESSION_SECRET`. A fresh
  secret is generated on the next request, which invalidates every outstanding
  session token; people just sign in with Google again. (Individual sessions
  can't be revoked — the tokens are stateless — but "sign out" on the device
  itself always works, and sessions die on their own after 30 days away.)

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
