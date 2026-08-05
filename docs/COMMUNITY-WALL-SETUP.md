# Community Wall — setup & operations

A public wall where anyone can share what financial health really looks like
in their own community — short, first-name-only stories about challenges and
wins (housing, food access, debt, savings, community wins…). Every story is
human-reviewed before it appears. No server to run: the backend is a Google
Apps Script web app with a Google Sheet as storage (same pattern as Ambassador
Notes, but lighter — no Drive folder, no images).

## The pieces

| File | Role | Audience |
| --- | --- | --- |
| `community-wall.html` | The wall + "share your story" form | Everyone |
| `pledge-wall.html` | The Pledge Wall (see "The Pledge Wall" below) | Everyone |
| `get-involved.html#pledge` | The "take the pledge" form | Everyone |
| `tools/community-wall-apps-script.js` | The backend for both walls (deploy to Apps Script) | One-time setup |
| `team-board.html` → 🤝 **Pledge Wall** | The team's pledge review queue (see "Reviewing pledges in HQ") | Team |
| `functions/api/wall.js` | Cloudflare edge layer: same-origin, cached reads | Auto (no setup) |
| `functions/pledge-photo.js` | Cloudflare edge layer: cached pledge photos | Auto (no setup) |

## How it flows

1. A visitor writes a short story (≤600 chars) on `community-wall.html` and
   submits. Stored in the Sheet with status = **pending**.
2. The moderator gets an email with the story and **one-click ✓ Approve /
   ✗ Reject links** (they can also just edit the `status` cell in the Sheet:
   `pending` → `approved` / `rejected`).
3. Approved stories appear on the wall (newest first) within a couple of
   minutes — the edge cache refreshes every ~2 minutes.
4. Readers can tap the ♥ button on a story ("this resonates"); counts are
   stored in the Sheet. One heart per story per browser (localStorage).

The wall always includes a set of hard-coded **seed stories** (`SEED_STORIES`
in `community-wall.html`), merged with live approved stories and sorted
together by date. They render exactly like live stories; their fixed dates
mean they age naturally and drift down as newer real stories arrive. Edit or
remove them directly in that file.

## One-time setup (≈10 minutes)

> The "Community Wall — Story Submissions (finmango.org)" Sheet already exists
> in the team Drive, and `SPREADSHEET_URL` / `MODERATOR_EMAIL` in the script
> are pre-filled to match.
> Only the `MODERATION_KEY` needs to be set by hand — it's kept out of this
> (public) repo on purpose.

1. **Create a Google Sheet** (any name) — or use the existing "FinMango
   Community Wall" Sheet. Copy its URL.
2. In the Sheet, go to **Extensions → Apps Script**. Delete the sample code and
   paste all of `tools/community-wall-apps-script.js`.
3. Edit the **CONFIG** block at the top:
   - `SPREADSHEET_URL` — your Sheet URL (pre-filled)
   - `MODERATOR_EMAIL` — who gets "new story" emails (pre-filled)
   - `MODERATION_KEY` — invent a passphrase (protects the moderation endpoints;
     it's embedded in the approve/reject email links). **Never commit the real
     value to the repo.**
   - `SITE_BASE` — `https://www.finmango.org`
4. Run the `setup` function once (toolbar ▸ select `setup` ▸ Run) and grant the
   requested permissions.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, authorize, and copy the **/exec** Web App URL.
6. Paste that URL in **two** places:
   - `community-wall.html` → `WALL_SUBMIT_URL`
   - `functions/_shared.js` → `WALL_APPS_SCRIPT_URL`

   (Search for `REPLACE_WITH_WALL_APPS_SCRIPT_WEB_APP_URL`.)

> After **any** change to the Apps Script, redeploy a new version:
> Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.
> The /exec URL stays the same.

## Moderating

Two equally valid ways:

- **From the email** — every submission emails `MODERATOR_EMAIL` with the full
  story and ✓ Approve / ✗ Reject links. One click, done.
- **In the Sheet** — change a row's `status` cell to `approved` or `rejected`.
  (Set `publishedAt` to now if you want it sorted correctly; the email links do
  this automatically.)

There's also a JSON moderation endpoint if a review UI is ever wanted:
`GET …/exec?action=list&status=pending&key=MODERATION_KEY`. Its pledge
equivalent — `action=pledge-list` — is what FinMango HQ's review tab reads.

(That's for **stories**. Pledges are reviewed in HQ — see below.)

## The Pledge Wall

The "Take the pledge" form on `get-involved.html` and the public wall at
`pledge-wall.html` run on this same Apps Script. Signers pick a systemic
barrier, optionally add a short "why" note and a photo, and choose whether
their card may appear on the public Pledge Wall.

> ⚠️ **Redeploy required.** The pledge feature needs the current version of
> `tools/community-wall-apps-script.js` deployed: paste the file over the old
> script, run `setup` once more (it creates the "Pledges" tab and the
> "FinMango Pledge Wall Photos" Drive folder, and asks for the extra Drive
> permission), then Deploy → Manage deployments → ✏️ Edit → **New version** →
> Deploy. The /exec URL doesn't change. Until this is done, pledge
> submissions are silently dropped (`Unknown action`) — redeploy before (or
> with) shipping the site update. The same applies to the HQ review queue: it
> reads the `pledge-list` action, which only exists in the current version, and
> the deployed copy is also what decides whether pledge emails still go out
> (`CONFIG.PLEDGE_EMAIL_NOTIFY`, now `false`).

### How pledges flow

1. A visitor signs on `get-involved.html#pledge`. The pledge lands in the
   Sheet's **Pledges** tab with status = `pending`; the photo (if any) is
   saved to the Drive folder and its link stored in the row.
2. It shows up in the **🤝 Pledge Wall** queue in FinMango HQ, where anyone on
   the team can approve or reject it (next section). No email is sent — the
   queue *is* the notification.
3. `pledge-wall.html` shows approved, opted-in pledges (plus its permanent
   seed pledges), filterable by barrier. Photos are served through the
   edge-cached `/pledge-photo` function, not straight from Drive.

### Reviewing pledges in HQ

Open **finmango.org/team-board** → sidebar **Review** → **🤝 Pledge Wall**. The
badge counts pledges waiting on a decision. Each row shows the signer's first
name, location, barrier, their "why" note, and their photo (tap it for full
size), plus whether they opted into the public wall:

- **🌐 public** — ✓ Approve publishes the card to `pledge-wall.html` within a
  minute. Same content checks as stories: no full names or personal
  identifiers in the note, and the photo must be appropriate — when in doubt,
  reject. ✗ Reject keeps it counted but unseen.
- **🔒 private** — nothing to review. These are listed under a collapsed
  "Private pledges" toggle purely so the count is visible; they can never
  appear on the wall whatever their status.

Approved cards can be pulled back down (**✗ Take down**) or returned to the
queue (**↩ Back to pending**), and a rejected pledge can be approved later —
nothing is destructive, and every decision is tagged with who made it, in HQ
and in the Sheet's `moderatedBy` column. The header line ("N pledges signed ·
N on the wall · N kept private") is the running total, private ones included.

**Setup:** this needs `WALL_MODERATION_KEY` set in the *Team Board* Apps Script
(see the "Review queues" section of `docs/TEAM-BOARD-SETUP.md`) — HQ holds the
key server-side so reviewers never see it. Until it's set, the tab shows a
config note and the two fallbacks below still work.

**Fallbacks.** The Sheet is always editable by hand (`status`: `pending` →
`approved` / `rejected`), and the email approve/reject links can be turned
back on by flipping `CONFIG.PLEDGE_EMAIL_NOTIFY` to `true` in the Community
Wall script — worth doing temporarily if HQ is down or the pledge queue needs
watching from a phone. Community Wall *stories* are unaffected either way:
they still email `MODERATOR_EMAIL` with one-click links.

To count pledges (including private ones), the HQ header line has the totals,
or look at the Pledges tab — the `barrier` column makes per-barrier counts a
one-click filter.

Never move pledge rows onto the Wall tab or vice versa: ids are prefixed
(`p-` pledges, `w-` stories) and the moderation links route on that prefix.

### Pledge photos

A photo takes this path: the browser downscales it to ≤1200px JPEG → it posts as
a base64 data URL → the script writes it to the **FinMango Pledge Wall Photos**
Drive folder and link-shares it → the row's `photoUrl` cell holds
`https://drive.google.com/thumbnail?id=FILEID&sz=w1600` → HQ and the public wall
render it through `/pledge-photo?id=FILEID`, which only passes through files
Drive serves publicly.

**Check the whole path in one call.** With the script deployed:

```
https://script.google.com/macros/s/…/exec?action=photo-selftest&key=YOUR_MODERATION_KEY
```

It stores a 1×1 JPEG, link-shares it, fetches it back through the public
thumbnail URL, trashes it, and reports each step. `Run > photoSelfTest` in the
editor does the same and logs the result. Every step `ok` means a real signer's
photo will reach the wall.

**If a step fails with "Authorization is required to perform that action":** the
web app is still running on the scopes its owner granted before `DriveApp` was
added to the script, so *every* photo write throws and is dropped. Fix: open the
script → **Run > setup** → grant Drive access → **Deploy > Manage deployments >
✏️ Edit > New version**. Then re-run the self-test. (Symptom to recognise: the
Drive folder doesn't exist at all and every `photoUrl` cell is blank, including
for signers who definitely attached a photo.)

**Recovering a photo that was dropped.** The bytes are gone — the browser
discarded them after submit, so the signer has to re-send the file. Once you have
it: drop it in the Pledge Wall Photos folder, share it "anyone with the link",
copy its link, and paste that into the row's `photoUrl` cell. Any Drive link
shape works (`…/thumbnail?id=…`, `…/file/d/FILEID/view`, or a bare file id). The
wall picks it up within ~2 minutes.

When a photo fails on the way in, the reason is written to the row's
`photoError` column and shown on the card in HQ ("⚠ This signer attached a photo
and it didn't save"). A card with no photo and no warning means the signer simply
didn't attach one.

### Cropping and rotating a photo in HQ

A photo that's just framed badly shouldn't have to be rejected, so the queue has
**✂ Crop / rotate** on every card that has one. It opens the photo, you drag a
selection (or rotate in 90° steps), and **Save photo** replaces it.

The edit happens in the browser and the re-encoded JPEG (longest edge 1200px) is
sent to the backend, which writes it as a **new** Drive file. That matters:
`/pledge-photo` edge-caches by file id for 24 hours, so rewriting the old file's
bytes would keep serving the uncropped version for a day.

Nothing is destructive. The first time a photo is edited, the signer's original
URL is copied into the row's `photoOriginalUrl` column and the original file
stays in Drive, so the card shows **↩ Undo edit** — which restores it and clears
that column. Crop repeatedly and "undo" still goes back to what the signer
actually sent, not the previous crop. (Superseded crops stay in the Drive folder;
it accumulates a file per edit, same as the Ambassador Notes image folders.)

Two things worth knowing:

- Photo edits need **both** Apps Scripts redeployed — the Community Wall script
  gains the `pledge-photo-set` / `pledge-photo-revert` POST actions, and the Team
  Board script gains the `wallBridgePost_` bridge that reaches them. HQ's queue
  says "Unknown action" if only one side is updated.
- Edits are *not* attributed in the Sheet — `moderatedBy` still refers to the
  approve/reject decision. If you need to know who cropped a photo, that would
  be a new column.

## Security & safety notes

- Public endpoints only ever return **approved** stories; emails never leave
  the Sheet.
- Stories are plain text — the front-end escapes everything on render, so no
  submitted HTML/scripts can execute. Human review is still the backstop for
  content (no full names, addresses, account numbers, etc. — the form asks
  submitters not to include them, but check before approving).
- A hidden **honeypot** field silently drops naive bots; the moderation queue
  catches the rest.
- **Anyone who can reach FinMango HQ can approve a pledge onto the public
  wall** — that's the point (review shouldn't wait on one person), but it does
  mean the HQ team key is as sensitive as the moderation key. Decisions are
  attributed, so sign in with Google rather than the shared key.
- Hearts are unauthenticated by design (one per browser via localStorage) —
  they're a warmth signal, not a metric. The count lags up to ~2 minutes
  behind reality because of the edge cache.
- The page includes a crisis pointer (dial 211 / 211.org) so someone in acute
  financial distress isn't left with "post to a wall" as their only path.

## Speed (the `functions/` edge layer)

`functions/api/wall.js` is picked up automatically by Cloudflare Pages — no
setup or secrets. `community-wall.html` reads from `/api/wall?action=approved`
(same-origin, edge-cached ~2 min, stale-while-revalidate) so the wall loads
fast and survives Apps Script cold starts. Submissions and hearts POST
directly to the Apps Script URL with `mode: 'no-cors'` (same pattern as
`write.html`).

Test locally with `npx wrangler pages dev .` (serves the functions like
production).

## Troubleshooting

- **Form says "isn't accepting stories quite yet"** — the `WALL_SUBMIT_URL`
  placeholder in `community-wall.html` wasn't replaced.
- **Wall only shows the seed stories** — either `WALL_APPS_SCRIPT_URL` in
  `functions/_shared.js` wasn't replaced, or no story has been approved yet.
- **Submit seems to do nothing** — submissions use `no-cors` (the browser
  can't read the response), so confirm a row appeared in the Sheet.
- **Approve link says "Unauthorized"** — the key in the email link no longer
  matches `CONFIG.MODERATION_KEY` (redeploy after changing it).
- **HQ's Pledge Wall tab says "one config step left"** — `WALL_MODERATION_KEY`
  in the *Team Board* Apps Script is still the placeholder, or that script
  wasn't redeployed after it was set.
- **HQ's Pledge Wall tab can't reach the backend** — usually this script wasn't
  redeployed since `pledge-list` was added (it answers `Unknown action`), or
  `WALL_MODERATION_KEY` doesn't match this script's `MODERATION_KEY`.
- **A pledge photo never appears** (not in HQ, not on the wall) — check the row's
  `photoUrl` and `photoError` cells, then run the photo self-test above. Blank
  `photoUrl` on every row plus a missing Drive folder means the script never got
  Drive permission: `Run > setup`, grant it, redeploy.
- **No more pledge emails** — that's the default now
  (`CONFIG.PLEDGE_EMAIL_NOTIFY: false`); pledges are reviewed in HQ. Flip it to
  `true` and redeploy to get the email links back alongside the queue.
