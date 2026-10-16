# Notes for Claude sessions

- **Apps Script backends** (`tools/*-apps-script.js`) are deployed by the
  session itself, not by Scott. Read `docs/APPS-SCRIPT-DEPLOY.md` first: it
  says where the clasp credential lives (a private Google Drive file), the
  script and deployment IDs, and the `tools/clasp-sync.py` one-liner that
  pushes a repo file and deploys a new version of the existing web app.
- The live site deploys from `main` via Cloudflare Pages. A change is not live
  until its pull request is merged.
- **Team board** (`team-board.html`) is a shell that loads `js/team-board.js`
  and `css/team-board.css` with a `?v=` cache-buster. After editing either
  file, bump the `?v=` on both tags in the HTML so open tabs get the new build.
