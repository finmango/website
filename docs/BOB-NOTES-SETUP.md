# Bob Notes — Setup Guide

"Bob Notes" is a section on `education.html` (right below Bob's founder bio) where Bob
posts notes, photos, and videos himself — no code, no deploys, no one in the loop.

```
  Bob's phone/laptop            Google                      finmango.org
  ───────────────────────       ─────────────────────       ─────────────────────────
  A: bob-post.html        ──►   Google Sheet          ──►   education.html fetches the
     (custom form + Apps        (one row per post,          sheet on page load and
      Script backend)            uploads in Drive)          renders the posts live
  B: private Google Form  ──►
```

He posts whenever he wants; it's on the website the next time anyone loads the page.
The website only ever **reads** a public sheet — no credentials live in the repo.

The section is **hidden on the live site until a sheet is connected**, so everything
can be deployed before the input side exists. Design preview with sample content:

```
https://www.finmango.org/education.html?bobnotes=preview
```

There are two ways to give Bob his posting tool. Both write the same sheet format, so
you can start with one and switch later without touching the website section.

|                          | **A · Custom form (`bob-post.html`)**       | **B · Google Form**                  |
| ------------------------ | ------------------------------------------- | ------------------------------------ |
| Bob's experience         | Branded FinMango page, one bookmark, posting code | Generic Google Form, must sign into Google to upload files |
| Photos                   | ✅ auto-shrunk in the browser, auto-shared   | ✅ but the uploads folder must be shared manually |
| Video files              | Up to ~25 MB each (bigger → YouTube/Drive link) | ✅ up to gigabytes                   |
| Setup                    | ~15 min (paste & deploy an Apps Script)     | ~10 min (clicking, no code)          |
| Maintenance              | Ours (redeploy script after edits)          | Google's                             |

**Recommendation:** Option A, unless Bob will regularly upload large raw video files
straight from his phone — that's the one thing only the Google Form handles well.

---

## Option A — custom form + Apps Script (~15 minutes)

The repo already contains both halves: `bob-post.html` (the private posting page) and
`tools/bob-notes-apps-script.js` (the backend that receives posts, saves uploads to
Drive, and appends rows to the sheet).

### 1. Create the sheet and install the script

1. Create a Google Sheet named **Bob Notes (Website Feed)**.
2. In the sheet: **Extensions → Apps Script**. Delete the default code and paste in
   the full contents of `tools/bob-notes-apps-script.js`.
3. At the top of the script, change `POSTING_CODE` from `CHANGE-ME` to a code only
   Bob and FinMango know (this is what Bob types on the posting page).
4. Run the `setup()` function once (▶ Run, pick `setup`). Approve the permission
   prompts — the script runs as your account. `setup()` seeds the `Posts` tab with
   headers, creates a **Bob Notes Uploads** folder, and makes the sheet and folder
   link-viewable so the website can read them. The execution log prints the
   `SHEET_ID` you'll need in step 3.

### 2. Deploy the web app

**Deploy → New deployment → Type: Web app**, with:

- Execute as: **Me**
- Who has access: **Anyone**

Copy the Web App URL (ends in `/exec`).

> "Anyone" means anyone who knows the URL can *call* the endpoint — posting is still
> gated by the posting code, and the URL/code only live on an unlisted page. Wrong
> codes just get rejected. To rotate the code: edit `POSTING_CODE`, then
> **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**
> (script edits don't go live until a new version is published — easy to forget!).

### 3. Wire the website

Two paste-ins, both clearly marked:

- `bob-post.html` — search for `PASTE APPS SCRIPT WEB APP URL HERE`, paste the
  `/exec` URL into `SCRIPT_URL`.
- `education.html` — search for `PASTE GOOGLE SHEET ID HERE`, paste the sheet ID
  (the long string in the sheet's URL between `/d/` and `/edit`), and set
  `SHEET_TAB = 'Posts'`.

Commit and deploy the site.

### 4. Send Bob his link

Give Bob `https://www.finmango.org/bob-post.html` and his posting code. The page is
unlisted (`noindex`, linked from nowhere) and remembers the code on his device after
the first post. Phone tip: open the link → browser menu → **Add to Home Screen**.

What the page does for him: shrinks big photos automatically before upload, shows an
upload progress bar, and confirms with a "Posted." screen linking to the live section.
Videos over 25 MB are blocked with a friendly nudge to use a YouTube/Drive link
instead (Apps Script can't accept bigger uploads).

---

## Option B — Google Form (~10 minutes, zero code)

### 1. Create the form

[forms.google.com](https://forms.google.com) → blank form → name it **Bob Notes**:

| Question                | Type         | Settings                                              |
| ----------------------- | ------------ | ----------------------------------------------------- |
| `Title (optional)`      | Short answer | Not required                                          |
| `What's on your mind?`  | Paragraph    | **Required**                                          |
| `Photos`                | File upload  | Allow only **images**, max 10 files, 10 MB each       |
| `Videos`                | File upload  | Allow only **videos**, max 5 files, 1 GB each         |
| `Link (optional)`       | Short answer | Not required                                          |

Settings → Responses → **Limit to 1 response: OFF**.

> File-upload questions force respondents to sign into a Google account, and uploads
> count against the form owner's Drive storage.

### 2. Link to a sheet and share

1. **Responses → Link to Sheets → Create a new spreadsheet** (tab will be
   `Form Responses 1`).
2. Share the spreadsheet: **Anyone with the link: Viewer**.
3. Share the uploads folder the same way: Drive creates **"Bob Notes (File
   responses)"** in the form owner's My Drive (each upload question also has a
   "View folder" link). Without this, photos/videos won't display on the site.

### 3. Wire the website and send Bob the link

- `education.html` — paste the sheet ID into `SHEET_ID` (search for
  `PASTE GOOGLE SHEET ID HERE`); leave `SHEET_TAB` as `Form Responses 1`.
- Form → **Send** → link icon → copy → give it to Bob. Don't publish it on the site.

---

## Managing posts (both options, no code)

Everything is managed in the Google Sheet; changes show on the next page load.

- **Edit a post** — edit the cell text directly.
- **Unpublish a post** — put `yes` in the `Hide` column (Option B: add a `Hide`
  column at the right edge first). Clear it to republish.
- **Delete a post** — delete the row.
- Completely empty rows are skipped; posts render newest-first, 4 at a time with a
  "Show more notes" button.

## Column matching

The site finds columns by header text, case-insensitive, so exact wording is
flexible (Option A's headers and the recommended Option B questions both match):

| Site field | Header must contain one of                                     |
| ---------- | -------------------------------------------------------------- |
| Date       | `timestamp`                                                     |
| Title      | `title`, `headline`, `subject`                                  |
| Body text  | `note`, `message`, `mind`, `update`, `story`, `text`, `share`   |
| Photos     | `photo`, `image`, `pic`                                         |
| Videos     | `video`, `clip`                                                 |
| Link       | `link`, `url`                                                   |
| Hide flag  | `hide`, `hold`, `draft`, `skip`                                 |

Media handling: Drive photos display via Drive's image endpoint and click through to
the full file. Videos play inline — YouTube links get the YouTube player, Drive files
the Drive player. Other URLs become a button.

## Troubleshooting

| Symptom | Likely cause / fix |
| ------- | ------------------ |
| Section doesn't appear at all | `SHEET_ID` not set, sheet not link-viewable, or no visible posts. The browser console logs the reason. |
| Photos blank / missing | Uploads folder isn't link-viewable (Option B step 2.3 — Option A shares automatically). The site silently drops images it can't load. |
| Video shows but won't play | Same sharing issue, or Drive is still processing a fresh upload (give it a few minutes). |
| Post missing | `Hide` column flagged, or title/body/media cells all empty. |
| Wrong column picked up | Rename the sheet header (row 1) to match the table above — safe to edit freely. |
| "Wrong posting code" (A) | Code mismatch with `POSTING_CODE` — remember script edits need a **new version** deployment to take effect. |
| "Unexpected reply…" on posting (A) | Web app not deployed with **Who has access: Anyone**, or `SCRIPT_URL` points at the editor URL instead of the `/exec` URL. |
| Posted, but nothing on the site (A) | `SHEET_TAB` in education.html isn't `Posts` (or the Posts tab isn't the sheet's first tab). |

## Notes on the architecture

- The education.html renderer doesn't care where rows come from — the custom form,
  a Google Form, Zapier, or typing into the sheet by hand all work, in any mix.
- Option A's endpoint runs as the deploying account, writes only to this sheet and
  uploads folder, and exposes nothing else from the Drive account.
- Large-video limit (Option A) is an Apps Script request-size ceiling, not a design
  choice; chunked uploads could lift it later if it ever matters.
