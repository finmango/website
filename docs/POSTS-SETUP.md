# Community Posts — setup & operations

A lightweight "write → peer review → publish" pipeline for community-authored
reports, briefs, and stories. No server to run: the backend is a Google Apps
Script web app (same pattern as the site's other forms), with Google Sheets +
Drive as storage.

## The pieces

| File | Role | Audience |
| --- | --- | --- |
| `write.html` | Substack-style editor with a **live finmango.org preview**; submits a draft | Contributors (public) |
| `post-review.html` | Peer-review panel: read, comment, vote, publish | Reviewers (passphrase) |
| `posts.html` | Public index of published posts | Everyone |
| `post.html` (served at `/post?id=…`) | Renders a single published post in full site chrome | Everyone |
| `tools/posts-apps-script.js` | The backend (deploy to Apps Script) | One-time setup |
| `functions/` | Cloudflare edge layer: speed + social share previews | Auto (no setup) |

## How it flows

1. A contributor writes in `write.html`, sees the live preview, and submits.
2. The draft (text + images) is saved to a Drive folder + indexed in a Sheet;
   the editorial team is emailed. Status = **pending**.
3. Reviewers open `post-review.html`, enter the passphrase, read the rendered
   post, leave comments, and vote **approve / request changes / reject**.
4. An editor clicks **Publish to site**. Status = **published**, the author is
   emailed, and the post appears on `posts.html` and at `post.html?id=…`.

Images are downscaled in the browser, then stored in Drive (not in the Sheet,
which has a 50k-char-per-cell limit).

## One-time setup (≈10 minutes)

1. **Create a Google Sheet** (any name). Copy its URL.
2. **Create a Drive folder** for submissions (e.g. "FinMango Post Submissions").
   Open it and copy the folder ID from the URL (`…/folders/THIS_PART`).
3. In the Sheet, go to **Extensions → Apps Script**. Delete the sample code and
   paste all of `tools/posts-apps-script.js`.
4. Edit the **CONFIG** block at the top:
   - `SPREADSHEET_URL` — your Sheet URL
   - `DRIVE_FOLDER_ID` — the folder ID from step 2
   - `EDITOR_EMAIL` — who gets "new submission" emails
   - `REVIEW_KEY` — invent a passphrase; share only with reviewers
   - `SITE_BASE` — `https://www.finmango.org`
   - `REQUIRE_APPROVAL_TO_PUBLISH` — `true` to require ≥1 approve vote before publishing
5. Run the `setup` function once (toolbar ▸ select `setup` ▸ Run) and grant the
   requested permissions.
6. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, authorize, and copy the **/exec** Web App URL.
7. Paste that URL into the placeholder in **all four** front-end files:
   - `write.html` → `SUBMIT_URL`
   - `posts.html` → `API_URL`
   - `post.html` → `API_URL`
   - `post-review.html` → `API_URL`

   (Search each file for `REPLACE_WITH_APPS_SCRIPT_WEB_APP_URL`.)

> After **any** change to the Apps Script, redeploy a new version:
> Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.
> The /exec URL stays the same.

## Reviewing

- Go to `post-review.html`, enter your name + the `REVIEW_KEY`.
- Filter by Pending / Changes / Approved / Published / Rejected.
- Open a post to read it exactly as it will publish. Add a comment, then vote.
- **Approve** moves it to *approved*; **Request changes** to *changes*;
  **Reject** to *rejected*. Votes are advisory — an editor finalizes with
  **Publish to site**.

## Security notes

- All reviewer actions require the `REVIEW_KEY`; public endpoints only ever
  return **published** posts.
- Submitted HTML is constrained by a whitelist sanitizer on the client when
  rendering (`write.html`, `post.html`, `post-review.html`) — only a small set
  of tags/attributes survive, `javascript:` URLs are stripped, and links are
  forced to `rel="noopener noreferrer"`. Human review is still the backstop.
- The `REVIEW_KEY` lives in the Apps Script (server-side), not in the public
  pages.

## Speed & social share previews (the `functions/` edge layer)

The site runs on **Cloudflare Pages**, so the `functions/` folder is picked up
automatically — no setup, no secrets, no dashboard changes. It deploys with the
repo. Three small functions sit between visitors and the Apps Script backend:

| Route | File | What it does |
| --- | --- | --- |
| `/api/posts?action=published` / `…&action=post&id=…` | `functions/api/posts.js` | Same-origin, **edge-cached** read proxy. `posts.html` and `post.html` call this instead of the slow Apps Script URL, so repeat visits (and crawlers) skip the round-trip. Read-only — reviewer/submit actions are refused. |
| `/post?id=…` | `functions/post.js` | Server-renders the post's `<head>`: real Open Graph / Twitter tags (title, description, **cover image**) so shared links show the cover instead of the bare logo. Also inlines the post as `window.__POST__`, so the page paints **instantly** with no "Loading…". |
| `/post-image?id=…` | `functions/post-image.js` | Serves the post's cover from our own domain (Google Drive thumbnail URLs are flaky for crawlers). This is the `og:image`. Falls back to `og-image.png` when a post has no cover. |

Shared helpers (and the one copy of the backend URL) live in
`functions/_shared.js`. Posts with **no** cover image fall back to the default
FinMango card automatically.

Notes:
- Old `/post.html?id=…` links still work — the existing clean-URL redirect sends
  them to `/post?id=…`, and crawlers follow it.
- To preview a new cover in a share, use the platform's debugger to re-scrape
  (e.g. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/),
  [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)); they
  cache previews aggressively.
- Test locally with `npx wrangler pages dev .` (serves the functions like
  production).

## Optional upgrade: pre-render to static files (SEO)

By default, published posts render dynamically via `/post?id=…` (with the edge
layer above) — robust and zero-secret. If you later want each post committed as
its own static HTML
file (better SEO / works if the Apps Script is ever unavailable), enable the
`commitStaticPage_(post)` hook in `publishPost_()` and add a fine-scoped GitHub
token to the script's properties. This trades a stored secret for static output;
keep it disabled unless you need it.

## Troubleshooting

- **"Not configured yet"** — the `/exec` URL placeholder wasn't replaced.
- **Submit seems to do nothing** — submissions use `no-cors` (the browser can't
  read the response), so the UI assumes success; confirm a row appears in the
  Sheet.
- **Images don't show** — make sure `setup` ran and the Drive folder is owned by
  the same account running the script; uploaded image files are auto-shared
  "anyone with link".
- **Reviewer "Unauthorized"** — passphrase mismatch with `CONFIG.REVIEW_KEY`
  (redeploy if you changed it).
