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
| `tools/community-wall-apps-script.js` | The backend (deploy to Apps Script) | One-time setup |
| `functions/api/wall.js` | Cloudflare edge layer: same-origin, cached reads | Auto (no setup) |

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

Until the backend is deployed, the page shows clearly-badged **Example**
stories and the form politely refuses submissions — so it's safe to ship the
front-end first.

## One-time setup (≈10 minutes)

> The "FinMango Community Wall" Sheet already exists in the team Drive, and
> `SPREADSHEET_URL` / `MODERATOR_EMAIL` in the script are pre-filled to match.
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
`GET …/exec?action=list&status=pending&key=MODERATION_KEY`.

## Security & safety notes

- Public endpoints only ever return **approved** stories; emails never leave
  the Sheet.
- Stories are plain text — the front-end escapes everything on render, so no
  submitted HTML/scripts can execute. Human review is still the backstop for
  content (no full names, addresses, account numbers, etc. — the form asks
  submitters not to include them, but check before approving).
- A hidden **honeypot** field silently drops naive bots; the moderation queue
  catches the rest.
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
- **Wall only shows Example stories** — either `WALL_APPS_SCRIPT_URL` in
  `functions/_shared.js` wasn't replaced, or no story has been approved yet.
- **Submit seems to do nothing** — submissions use `no-cors` (the browser
  can't read the response), so confirm a row appeared in the Sheet.
- **Approve link says "Unauthorized"** — the key in the email link no longer
  matches `CONFIG.MODERATION_KEY` (redeploy after changing it).
