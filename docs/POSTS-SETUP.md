# Ambassador Notes — setup & operations

A lightweight "write → peer review → publish" pipeline for Ambassador-authored
notes, briefs, and stories. No server to run: the backend is a Google Apps
Script web app (same pattern as the site's other forms), with Google Sheets +
Drive as storage.

## The pieces

| File | Role | Audience |
| --- | --- | --- |
| `write.html` | Substack-style editor with a **live finmango.org preview**; drafts autosave locally; images insert by paste, drag & drop, or file picker; submits a draft | Contributors (public) |
| `post-review.html` | Peer-review panel: read, comment, vote, publish | Reviewers (passphrase) |
| `posts.html` | Public index of published posts | Everyone |
| `post.html` (served at `/post?id=…`) | Renders a single published post in full site chrome | Everyone |
| `tools/posts-apps-script.js` | The backend (deploy to Apps Script) | One-time setup |
| `functions/` | Cloudflare edge layer: speed + social share previews | Auto (no setup) |
| `js/cover-fit.js` + `data/cover-tuning.json` | Frames each cover to its own shape instead of cropping it into the slot; per-post overrides editable after publishing | Auto / editors |
| `scripts/generate-post-og.js` | Builds 1200x630 social cards for covers a link preview would crop badly | Auto (daily workflow) |

## How it flows

1. A contributor writes in `write.html`, sees the live preview, and submits.
2. The draft (text + images) is saved to a Drive folder + indexed in a Sheet;
   everyone in `NOTIFY_EMAILS` is emailed the submission — title, dek, author,
   cover, and an excerpt — with a button straight to that note's row in the HQ
   queue. Replies to that email go to the ambassador, not the robot.
   Status = **pending**.
3. Reviewers open `post-review.html`, enter the passphrase, read the rendered
   post, leave comments, and vote **approve / request changes / reject**.
   (The team can also review from the **Ambassador Notes** tab in
   `team-board.html`, which talks to this backend through the HQ bridge.)
4. Approving from the HQ tab also asks **when the post should go live** (or
   "approve without a time"). The author is emailed the approval — including
   the scheduled go-live time — right away, so nobody is left wondering.
5. Scheduled posts publish **themselves**: a time-driven trigger
   (`publishScheduledPosts`, installed by `setup`, runs every 15 minutes)
   flips any approved post whose time has arrived to **published** and emails
   the author the live link. Spreading go-live times out means notes trickle
   onto the site instead of all landing at once.
6. An editor can still click **Publish now** at any time (it clears any
   schedule), and **Reschedule / Clear** changes or removes the go-live time.

Images are downscaled in the browser, then stored in Drive (not in the Sheet,
which has a 50k-char-per-cell limit).

Paragraphs are normalized to real `<p>` tags by the shared sanitizer (at write,
review, and render time), so paragraph spacing is consistent everywhere — older
notes that stored `<div>`-based paragraphs are fixed automatically at render.

## One-time setup (≈10 minutes)

1. **Create a Google Sheet** (any name). Copy its URL.
2. **Create a Drive folder** for submissions (e.g. "FinMango Post Submissions").
   Open it and copy the folder ID from the URL (`…/folders/THIS_PART`).
3. In the Sheet, go to **Extensions → Apps Script**. Delete the sample code and
   paste all of `tools/posts-apps-script.js`.
4. Edit the **CONFIG** block at the top:
   - `SPREADSHEET_URL` — your Sheet URL
   - `DRIVE_FOLDER_ID` — the folder ID from step 2
   - `NOTIFY_EMAILS` — comma-separated list of everyone who gets "new
     submission" emails (defaults to Scott, Soham and Sarah). Each email has a
     **Review, approve & schedule** button that opens that note in the HQ queue
     (`team-board.html?view=notes&post=<id>`). Falls back to `EDITOR_EMAIL` if
     left blank.
   - `EDITOR_EMAIL` — reply-to fallback on emails sent to authors
   - `REVIEW_KEY` — invent a passphrase; share only with reviewers
   - `SITE_BASE` — `https://www.finmango.org`
   - `REQUIRE_APPROVAL_TO_PUBLISH` — `true` to require ≥1 approve vote before publishing
5. Run the `setup` function once (toolbar ▸ select `setup` ▸ Run) and grant the
   requested permissions. This also installs the every-15-minutes
   `publishScheduledPosts` trigger that publishes scheduled posts on time
   (re-running `setup` is safe — it never duplicates the trigger).

   > **Upgrading an existing install to scheduling?** Paste the updated
   > `tools/posts-apps-script.js`, re-run `setup` once (to install the
   > trigger), and redeploy a new version. Also paste the updated
   > `tools/team-board-apps-script.js` into the HQ script and redeploy it —
   > the HQ tab sends the schedule through that bridge. The new
   > `scheduledFor` column is appended after the existing headers, so old
   > Sheet rows keep their alignment.
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

### Scheduling go-live times (HQ Ambassador Notes tab)

- In `team-board.html` → **📝 Ambassador Notes**, clicking **✓ Approve** opens
  a small picker: choose a go-live date & time (defaults to tomorrow 9:00 in
  your timezone), or **Approve without a time** for manual publishing.
- The author is emailed the approval immediately, with the scheduled go-live
  time when one was picked.
- Approved rows show a blue **Scheduled** chip and "🕓 goes live …" in the
  meta line, plus **🕓 Reschedule** (change or clear the time) and
  **🚀 Publish now** (publishes immediately, clearing the schedule).
- The trigger runs every 15 minutes, so "9:00" means "live by ~9:15". Times
  are stored in UTC and shown in each viewer's local timezone; approval
  emails spell the time out in the script's timezone.
- Any vote that knocks a post out of *approved* (request changes / reject)
  clears its schedule, so nothing publishes by surprise. Because that's easy
  to do by accident, the HQ tab asks for confirmation before a reject or
  changes vote on an approved post (the prompt spells out the scheduled
  go-live it would cancel), and hides the redundant ✓ Approve button once a
  post is approved.

### Who approved what (attribution tags)

Every row in the HQ **📝 Ambassador Notes** queue carries a tag next to its
status chip showing **who** put it there — face, first name, and the full
"Approved by Mia Fawls · 3d ago" on hover:

| Status | Tag |
| --- | --- |
| Approved / Scheduled | ✓ the approver |
| Changes requested | ✎ whoever asked |
| Rejected | ✗ whoever rejected |
| Published | ✓ the approver **and** 🚀 the publisher |

A post published by the scheduler shows **🕓 auto-published** instead of a
person, and a decision made from a shared-key session (or the standalone
`post-review.html` panel) shows **team key** — there's no individual identity
behind those, and a face would imply one. Signing in with Google is what puts
your name on a decision.

Faces come from HQ members, so a reviewer who has signed in with their
`@finmango.org` account shows their Google photo; anyone else gets colored
initials. Expanding a post shows the full trail underneath it — every vote,
comment, schedule change, and edit, each with its author and when it happened.

The backend keeps this on the Sheet in three appended columns — `statusBy`,
`statusAt`, `approvedBy` — so the whole queue can be tagged without opening one
`post.json` per row. The columns never feed the public API: reviewer names stay
inside HQ.

> **Upgrading an existing install to attribution tags?** Paste the updated
> `tools/posts-apps-script.js`, run `setup` once (it labels the new columns and
> runs `backfillAttribution`, which replays each post's own review trail into
> them so old rows are tagged too), then redeploy a new version. No change is
> needed to the HQ script — it forwards the list verbatim. Until the redeploy,
> HQ falls back to deriving the tags from the review trails it has already
> loaded, so nothing breaks in the meantime. `backfillAttribution` only fills
> what the trail can prove: posts published before the backend recorded a
> publisher stay untagged for 🚀 rather than being guessed at.

### Who author emails come from

Apps Script can only *send* from the Google account that deployed the script —
that part can't change. What the author sees and where replies go **does**
follow the person who clicked, though: when a reviewer is signed in to HQ with
their `@finmango.org` Google account, approval / change-request / published
emails are signed with their name ("Mia Fawls · FinMango") and **Reply-To** is
set to their inbox, so the conversation lands with the person who actually
reviewed the note. The identity comes from the verified sign-in token
server-side — the browser can't spoof it. Reviewers using the shared team key
(or the standalone `post-review.html` panel) have no signed-in identity, so
those emails fall back to the generic "FinMango" name and the editor inbox
(`NOTES_REPLY_TO` in the HQ script / `EDITOR_EMAIL` in this one).

> **Upgrading an existing install to reviewer attribution?** Paste the updated
> `tools/posts-apps-script.js` *and* `tools/team-board-apps-script.js` into
> their Apps Script projects and redeploy a new version of **both** — the HQ
> bridge forwards the verified reviewer identity to this backend.

### Rejected posts (HQ Ambassador Notes tab)

Rejecting never deletes anything — the post keeps its Drive folder, Sheet row,
and full review trail; it's just hidden from the review queue. A quiet
**"▸ Rejected (n)"** toggle at the bottom of the HQ tab lists them; expanded
rows keep **✓ Approve** and **✎ Changes**, so a change of heart brings a post
back into the normal flow with one click (approving also clears nothing it
shouldn't — the schedule stays empty until you pick one).

## Security notes

- All reviewer actions require the `REVIEW_KEY`; public endpoints only ever
  return **published** posts.
- Submitted HTML is constrained by a whitelist sanitizer on the client when
  rendering (`write.html`, `post.html`, `post-review.html`) — only a small set
  of tags/attributes survive, `javascript:` URLs are stripped, and links are
  forced to `rel="noopener noreferrer"`. Human review is still the backstop.
- **Video embeds** are YouTube-only and locked down: the editor's *Video*
  button takes a YouTube link (watch / `youtu.be` / Shorts), extracts the video
  ID, and inserts a single `youtube-nocookie.com/embed/…` iframe. The sanitizer
  allows `<iframe>` **only** when its `src` is a valid YouTube embed URL, and
  rebuilds the element's attributes from scratch — so a hand-crafted iframe
  (other hosts, `srcdoc`, event handlers) can never survive. Videos embed
  inline in the note body and render responsively (16:9); nothing is uploaded
  or stored on our side.
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
| `/post-image?id=…[&w=480\|800\|1200\|1600]` | `functions/post-image.js` | Serves the post's cover from our own domain, **edge-cached** (Google Drive thumbnail URLs are flaky for crawlers and slow for visitors). The optional `w` asks Drive for a right-sized thumbnail, so grid cards load an ~800px image instead of the raw 2000px original. Used by the `og:image`, the `posts.html` cards, and the article cover on `post.html` (which `/post` also preloads for a fast LCP). Falls back to `og-image.png` when a post has no cover. |

Shared helpers (and the one copy of the backend URL) live in
`functions/_shared.js`. Posts with **no** cover image fall back to the default
FinMango card automatically.

Notes:
- `/api/posts` accepts `&refresh=1`, which skips the caches and re-primes the
  edge entry with a fresh backend read — the HQ Ambassador Notes tab sends it
  automatically right after a publish so editors see their post live at once.
- Old `/post.html?id=…` links still work — the existing clean-URL redirect sends
  them to `/post?id=…`, and crawlers follow it.
- `/post` prefers a pre-rendered `og/posts/<id>.jpg` card when the note has one
  (covers that a 1.91:1 crop would mangle) — see **Cover images** below.
- To preview a new cover in a share, use the platform's debugger to re-scrape
  (e.g. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/),
  [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)); they
  cache previews aggressively.
- Test locally with `npx wrangler pages dev .` (serves the functions like
  production).

## Cover images: framing, cropping, and social cards

Covers arrive in whatever shape the author uploaded — 16:9 photos, 3:2 photos,
4:5 portraits, and wide data-viz graphics with a headline, labels and a source
line baked in (2.7:1 so far). Nothing in the pipeline re-crops them, so three
things do the fitting, and **all three can be overridden after a note is
published**.

### 1. On the site: automatic, per image (`js/cover-fit.js`)

Loaded by `posts.html` and `post.html`. It measures each cover once it decodes
and stops cropping when a crop would cost real content:

| Frame | Behaviour |
| --- | --- |
| Article hero (`data-cover-frame="hero"`) | Adopts the **image's own aspect ratio** once it's more than ~11% off 16:9, so a 2.7:1 chart shows end to end. Clamped to 0.8–3.0 and capped at 78vh so a tall cover can't push the article off screen. |
| Grid cards (`data-cover-frame="fixed"`) | Keep their uniform 16:9 slot and crop — a thumbnail rhythm beats bars on every card — until the shape is one no crop survives (~40% off the slot: the 2.7:1 chart, a portrait). Those are letterboxed whole inside the slot. |

Letterbox bars take the cover's **own border colour** when its four corners
agree (a chart on white blends into the card); otherwise the frame keeps its
tint. No configuration, and it applies to every note, old and new.

### 2. Per-post overrides: `data/cover-tuning.json`

Edit, commit, done — no re-upload, no change to the Sheet. Keys are post ids
(the `?id=…` in the note's URL); every field is optional:

```json
{
  "women-s-economic-autonomy-latin-america-s-invisibl-260810-233728": {
    "fit": "contain",
    "focus": "50% 20%",
    "bg": "#ffffff",
    "og": "card"
  }
}
```

| Field | Effect |
| --- | --- |
| `fit` | `"cover"` crops to fill the frame, `"contain"` shows the whole cover letterboxed. Omit for automatic. |
| `focus` | Which part survives a crop, as a CSS `object-position` — `"50% 20%"`, `"left top"`. This is the "move the crop" knob. |
| `bg` | Letterbox bar colour. Omit to sample the cover's edge. |
| `og` | `"card"` forces a social card, `"cover"` forces the raw cover into shares. Omit for automatic. |

The file is served with a 1-hour cache, so allow up to an hour for a change to
reach everyone (or re-scrape with the platform debuggers linked above).

### 3. In shares: pre-rendered 1200x630 cards

Every platform crops an `og:image` into a ~1.91:1 frame, so a 2.7:1 chart loses
about a third of its width — labels and all — before anyone sees it. For covers
that far off, `scripts/generate-post-og.js` renders the cover **whole** onto a
1200x630 card (the cover, a ground matched to its edge colour, and one FinMango
strip; the note's title and dek are already the share's text). `functions/
post.js` then points `og:image` / `twitter:image` at that card. Covers between
1.25:1 and 2.15:1 are left alone — a full-bleed photo makes the stronger share.

```bash
npm i --no-save puppeteer-core                  # or full puppeteer
node scripts/generate-post-og.js                # anything new or changed
node scripts/generate-post-og.js --id=<postId>  # one note
node scripts/generate-post-og.js --force        # rebuild every card
```

Cards live in `og/posts/<postId>.jpg`; `og/posts/manifest.json` records what
each was built from (and is what `/post` reads to find it). The run is
idempotent — nothing new means Chromium never launches — and
`.github/workflows/daily-update.yml` runs it right after the posts snapshot, so
a new note gets its card within a day of publishing. Need it sooner: run the
command above, or trigger the workflow by hand from the Actions tab.

To re-frame a note *after* publishing, in order of effort: set `focus` (move the
crop), set `fit` (stop cropping), set `og` and re-run the generator (change the
share), or ask the author for a new cover and re-run with `--force`.

## Optional upgrade: pre-render to static files (SEO)

By default, published posts render dynamically via `/post?id=…` (with the edge
layer above) — robust and zero-secret. If you later want each post committed as
its own static HTML
file (better SEO / works if the Apps Script is ever unavailable), enable the
`commitStaticPage_(post)` hook in `publishPost_()` and add a fine-scoped GitHub
token to the script's properties. This trades a stored secret for static output;
keep it disabled unless you need it.

## Ambassador profile linking

Contributors can tie a note to their ambassador profile page. In `write.html`
there's an optional **"Your ambassador profile"** dropdown (populated from
`data/ambassadors.json`, generated from the `ambassadors.html` directory). When
chosen, the post stores an `ambassadorSlug`, which:

- turns the author's byline on the published post (`post.html`) into a link to
  `/<slug>.html`, and
- makes the note appear in a **"Notes from …"** section near the bottom of that
  ambassador's profile page (auto-hidden when they have no published notes).

The profile-page section is self-contained: it derives its slug from the page's
own filename and calls `/api/posts?action=published`, so no per-page wiring is
needed. To add the section to a brand-new profile page, copy the
`<section class="amb-notes" id="ambNotes" …>…</section>` block from any existing
profile (it sits just before the CTA section), and add the ambassador to
`data/ambassadors.json` so they show up in the `write.html` dropdown.

> The `ambassadorSlug` field is added to the Apps Script (`HEADERS`,
> `submitPost_`, `publicSummary_`). **Redeploy the Apps Script** (Deploy → Manage
> deployments → Edit → New version) so submissions start capturing it.

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
- **A scheduled post sailed past its go-live time without publishing** — the
  `publishScheduledPosts` time-driven trigger isn't installed. A `git push`
  never touches Apps Script: pasting the updated script and redeploying ships
  the *code*, but only running `setup` installs the *trigger* — an upgrade
  that skipped that step schedules posts that never fire. Fix it once: open
  the posts Apps Script, run `setup` (installs the trigger), then run
  `publishScheduledPosts` by hand to flush anything overdue. Check under
  **Triggers** (clock icon) that `publishScheduledPosts` is listed. From this
  version on the backend also self-heals — every schedule action re-installs
  a missing trigger — but that only helps after the new code is deployed.
- **Clicked Publish but the post isn't on `/posts` or the ambassador's
  profile** — that's caching, not a failed publish. The public list is cached
  at the Cloudflare edge (~5 min) and briefly in the browser, so a fresh
  publish can take a few minutes to appear; a hard refresh
  (Cmd/Ctrl+Shift+R) usually shows it sooner. The HQ tab now re-primes the
  edge cache automatically right after a publish. To confirm the publish
  itself worked, check the post's status in the Sheet (or hit the Apps Script
  `/exec?action=published` URL directly — it's uncached).
