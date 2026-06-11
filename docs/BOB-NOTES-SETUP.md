# Bob Notes — Setup Guide

"Bob Notes" is a section on `education.html` (right below Bob's founder bio) where Bob
posts notes, photos, and videos himself — no code, no deploys, no one in the loop.

```
  Bob's phone/laptop          Google                      finmango.org
  ─────────────────────       ─────────────────────       ─────────────────────────
  Private Google Form   ──►   Linked Google Sheet   ──►   education.html fetches the
  (text, photos, videos)      (one row per post)          sheet on page load and
                                                          renders the posts live
```

He fills out the form whenever he wants; the post is on the website the next time
anyone loads the page. Nothing to merge, nothing to schedule.

The section is **hidden on the live site until the sheet is connected**, so this can
be deployed before the form exists. To see the design with sample content, open:

```
https://www.finmango.org/education.html?bobnotes=preview
```

---

## One-time setup (~10 minutes)

### 1. Create the Google Form

Go to [forms.google.com](https://forms.google.com) → blank form → name it **Bob Notes**.
Add these questions (this wording is recommended, but the site matches loosely — see
[Column matching](#column-matching) below):

| Question                | Type         | Settings                                              |
| ----------------------- | ------------ | ----------------------------------------------------- |
| `Title (optional)`      | Short answer | Not required                                          |
| `What's on your mind?`  | Paragraph    | **Required**                                          |
| `Photos`                | File upload  | Allow only **images**, max 10 files, 10 MB each       |
| `Videos`                | File upload  | Allow only **videos**, max 5 files, 1 GB each         |
| `Link (optional)`       | Short answer | Not required — for a YouTube/article link he mentions |

In form **Settings**:
- Responses → **Limit to 1 response: OFF** (he'll post many times)
- Responses → Collect email addresses: optional, not needed by the site

> **Heads-up on file uploads:** Google requires respondents to be signed into a
> Google account for file-upload questions, and the uploads count against the form
> owner's Drive storage. If that's a problem, drop the upload questions and have Bob
> paste YouTube links into the `Link` field instead.

### 2. Link responses to a Google Sheet

In the form: **Responses tab → "Link to Sheets" → Create a new spreadsheet** →
accept the default name ("Bob Notes (Responses)"). A tab called
`Form Responses 1` is created — that's what the website reads.

### 3. Share two things publicly (view-only)

The website reads these anonymously, so both must be link-viewable:

1. **The spreadsheet** — Share → General access → **Anyone with the link: Viewer**.
2. **The uploads folder** — when the form has file-upload questions, Drive creates a
   folder named **"Bob Notes (File responses)"** in the form owner's My Drive
   (each upload question also has a "View folder" link). Right-click that folder →
   Share → **Anyone with the link: Viewer**. New uploads inherit this, so photos
   and videos display on the site automatically.

Nothing else in the Drive account is exposed — only that sheet and that folder.

### 4. Connect the sheet to the website

Copy the spreadsheet ID from its URL — the long string between `/d/` and `/edit`:

```
https://docs.google.com/spreadsheets/d/【THIS_PART】/edit#gid=0
```

In `education.html`, search for `PASTE GOOGLE SHEET ID HERE` and paste it:

```js
var SHEET_ID = 'paste-the-id-here';
var SHEET_TAB = 'Form Responses 1';   // already correct if you accepted the default
```

Commit and deploy. The section appears as soon as the sheet has at least one post.

### 5. Send Bob the form link

Form → **Send** → link icon → copy (check "Shorten URL"). The link is private in the
sense that only people who have it can post — don't publish it anywhere on the site.

Tip for Bob's phone: open the form link → browser menu → **Add to Home Screen** →
now posting is one tap.

---

## Managing posts (no code needed)

Everything is done in the Google Sheet; changes show up on the next page load.

- **Edit a post** — edit the cell text directly.
- **Unpublish a post** — add a column with the header `Hide` (rightmost is fine) and
  type `yes` in that post's row. Clear it to republish.
- **Delete a post** — delete the row.
- **Posts with no text** — a post renders as long as it has a title, text, photo, or
  video; completely empty rows are skipped.

Posts always display **newest first**. The first 4 are shown, with a
"Show more notes" button for the rest.

## Column matching

The site finds columns by header text (the form question titles), case-insensitive,
so exact wording is flexible:

| Site field | Header must contain one of                          |
| ---------- | --------------------------------------------------- |
| Date       | `timestamp` (automatic — Forms adds this column)    |
| Title      | `title`, `headline`, `subject`                      |
| Body text  | `note`, `message`, `mind`, `update`, `story`, `text`, `share` |
| Photos     | `photo`, `image`, `pic`                             |
| Videos     | `video`, `clip`                                     |
| Link       | `link`, `url`                                       |
| Hide flag  | `hide`, `hold`, `draft`, `skip`                     |

Media handling: Drive photo uploads are displayed via Drive's image endpoint and
click through to the full file. Videos play inline — YouTube links use the YouTube
player, Drive uploads use the Drive player. Any other URL in the video/link fields
becomes a button.

## Troubleshooting

| Symptom | Likely cause / fix |
| ------- | ------------------ |
| Section doesn't appear at all | `SHEET_ID` not set, sheet not shared "Anyone with link: Viewer", or sheet has no visible posts. Check the browser console — the script logs the reason. |
| Photos are blank / missing | The "Bob Notes (File responses)" folder isn't shared link-viewable (step 3.2). The site silently drops images it can't load. |
| Video shows but won't play | Same sharing issue, or Drive is still processing a large upload (can take a few minutes after submission). |
| Post missing | Row may be flagged in the `Hide` column, or the body/title/media cells are all empty. |
| Wrong column picked up | Rename the sheet header (row 1) so it matches the table above — headers can be edited freely without breaking the form. |

## Why a Google Form instead of a custom form?

A custom form on the website can't upload photos/videos into Drive without a backend
(Apps Script web app + OAuth), which adds moving parts, failure modes, and a sign-in
flow we'd have to maintain. The Google Form gives Bob a private, phone-friendly
posting tool with uploads, drafts, and edit-after-submit for free — and the website
only ever *reads* public data, so there are no credentials anywhere in the repo.

If Bob ever outgrows it, the renderer doesn't care where the rows come from — any
process that writes to the same sheet (Apps Script, Zapier, manual entry) works.
