# Deploying the Apps Script backends from a Claude session

The site's backends (`tools/*-apps-script.js`) run as Google Apps Script web
apps. Apps Script has no git integration, so a change to one of those files
does nothing until it is pushed to the live project and a new version is
deployed. This page is how a Claude Code cloud session does that itself, so
Scott never has to open the Apps Script editor.

## Credential

Google's CLI for Apps Script, **clasp**, needs an OAuth credential for
scott@finmango.org. It is **not** in this repo and must never be committed.

It lives as a private file in Scott's Google Drive, readable only by him:

- Drive file: **`claude-clasp-credentials.json`** (id `1-HPQot8ULsywEsd8QD3JM36Mj9t_1yVa`)

A session with the Google Drive connector reads it and writes it to
`~/.clasprc.json`; clasp then works with no sign-in. The token is a long-lived
refresh token; it stops working only if Scott revokes clasp's access in his
Google account or it goes unused for many months. If it ever fails, redo the
one-time login below.

## Session setup (about a minute)

```bash
npm install -g @google/clasp                    # clasp 3.x
# fetch the Drive file above through the Drive connector, then:
cat > ~/.clasprc.json   # paste the file's contents
chmod 600 ~/.clasprc.json
clasp list              # should answer without asking to log in
```

Then push a repo file to its live project and deploy it in one go:

```bash
tools/clasp-sync.py <script-id> <deployment-id> tools/<backend>-apps-script.js --dry-run   # inspect
tools/clasp-sync.py <script-id> <deployment-id> tools/<backend>-apps-script.js             # deploy
```

The script clones the live project, takes the repo file, copies every real
CONFIG value (keys, client IDs, sheet URLs) from the live copy over the repo's
`REPLACE_WITH…` placeholders, pushes, and deploys a new version of the
**existing** deployment so the `/exec` URL the Cloudflare functions call never
changes. Secrets stay in Google; the repo keeps its placeholders.

## Projects

| Backend | Repo file | Script ID | Live deployment ID |
| --- | --- | --- | --- |
| FinMango HQ (team board) | `tools/team-board-apps-script.js` | `1oYyZEunbkwrwGGuN16N1XPqdoepPT9UJN4umm4VXWz1tmXhsJmk9BqXl` | `AKfycbxi0w34MJLnCnHlsBgRiWrMm7o-JxHYbJXEL5X9iLhUC8to0RWshZPkNxNhiyhHU7J3` |
| Barrier Breakers application + 2027 notify form | `tools/barrier-breakers-apply-apps-script.js` | `1Dcy4DSHgcPmrwOEnKwfZ8oFvmSibFni0qy0MM95sD7n-iAxf_l67dmeL` | `AKfycbwAqIzAGz8YH_xzaTPWhTGTKI5jBRtunrCf7IlWPkkvSjBT9Mae_jOgqbaz_ps76fciSQ` (notify form, `barrier-breakers.html`); the 2026 apply/track-stats deployments in the same project are listed by `clasp deployments` |
| Barrier Breakers judge sign-ups, projects, quiz | `tools/barrier-breakers-{judge,projects,quiz}-apps-script.js` | Sheet-bound, not recorded yet (see below) | judge: `AKfycbzXD9YpxDFyySYQOntQYGl9Lav-GGZBRim8AZUz4orksyAXiZkch25xmXS01y8TFnFSMg` |
| Ambassador Notes (posts) | `tools/posts-apps-script.js` | not recorded yet | `AKfycbyw06JczRZVwdf3vw70xeshZ_shp2J1zzvPvPqhR-2_FSqzSBFaq0Yu-OZ7KjKYfCuthQ` |
| Community Wall | `tools/community-wall-apps-script.js` | not recorded yet | `AKfycbyogpgQ2naRVxs1LK1opqJywYZq0k9JpD7C9dLeKPqMs3BFikOh527QKuOCB6n3q1fHfQ` |

The Barrier Breakers application project is the one standalone project
`clasp list` shows for this account; it already holds the Sheets and Gmail
permissions, so new handlers that write to its spreadsheet (the 2027 notify
form does, on a `2027 Notify` tab) need no new authorization.

Sheet-bound scripts (HQ is one) do not show up in `clasp list` or Drive
search. To find a missing Script ID: open the bound Sheet → Extensions →
Apps Script → ⚙ Project Settings → Script ID, and add it to this table.
The deployment ID is the long `AKfycb…` segment of the web app's `/exec` URL
(see `functions/_shared.js`).

## One-time login (only if the credential stops working)

In a session: `clasp login --no-localhost` prints a Google sign-in link.
Scott opens it, approves, and pastes back the `http://localhost:8888/?code=…`
address his browser lands on. clasp writes `~/.clasprc.json`; upload that
file's contents to the Drive file above (replace its content, keep the name).
Note: in a session running in Auto permission mode, the waiting login process
is refused; switch the session to Accept edits first.

## Checks

- `clasp login` asks for a browser: `~/.clasprc.json` is missing or invalid.
- `User has not enabled the Apps Script API`: Scott turns it on at
  script.google.com/home/usersettings (done once on 2026-10-13).
- After a deploy, the backend answers the new actions; e.g. for HQ,
  `POST /api/board {"action":"volunteers-list"}` returns `Invalid access key`
  (route exists, auth refused) rather than `Unknown action`.
