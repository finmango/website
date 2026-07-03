# AI-Ready Workforce — Cohort Backend Setup

The employer program has three moving parts, all already in this repo:

| Piece | File | Status |
|---|---|---|
| Assessment (cohort mode) | `ai-ready/assessment.html?org=CODE` + `ai-ready/js/assessment.js` | Live — submits anonymous scores when opened via an org link |
| Employer dashboard | `ai-ready/employer.html` (`?demo=1` for sample data) | Live — demo works with no backend |
| Score storage + aggregation | `tools/ai-ready-workforce-apps-script.js` → Google Sheet | **Needs one-time deploy (steps below)** |
| Edge proxy | `functions/api/ai-ready.js` | Deployed with the site; needs the Apps Script URL pasted in |

Until the backend is deployed, everything degrades gracefully: individuals can
still take the assessment normally, and the dashboard demo needs no backend.

## Privacy model (also enforced in code)

- Submissions contain **only** scores + the org code — no names, emails, IPs, or identifiers.
- Employers see **aggregates only**, and only after `MIN_REPORT_N` (5) submissions exist.
- Reading a report requires the org's **report key**; invalid org and invalid key
  return the same error so org codes can't be enumerated.

## One-time deploy (~10 minutes)

1. Create a new Google Sheet (suggested name: "AI-Ready Workforce — Cohort Data")
   in the FinMango Google account. Keep it private.
2. Extensions → Apps Script, delete the placeholder, paste the entire contents of
   `tools/ai-ready-workforce-apps-script.js`, and save.
3. Deploy → New deployment → type **Web app** → Execute as **Me** → Who has access
   **Anyone** → Deploy. Copy the `/exec` URL.
4. Paste that URL into `WORKFORCE_APPS_SCRIPT_URL` in `functions/api/ai-ready.js`,
   commit, and push — Cloudflare Pages redeploys automatically.

## Onboarding an employer

1. In the Apps Script editor, run (Run ▸ pick `addOrg` won't take args — use a
   scratch function or the editor's built-in "Run function with arguments"):
   ```js
   addOrg('acme-credit-union', 'Acme Credit Union');
   ```
   Codes are lowercase letters/numbers/dashes, 2–40 chars.
2. The execution log prints two links:
   - **Assessment link** (give to the whole team):
     `https://www.finmango.org/ai-ready/assessment.html?org=acme-credit-union`
   - **Dashboard link** (give to HR only — it contains the report key):
     `https://www.finmango.org/ai-ready/employer.html?org=acme-credit-union&key=XXXX`
3. The report shows a locked screen until 5 people have completed the assessment.

## Selling it

- Program one-pager: `/ai-ready-workforce-one-pager.html` (print → PDF)
- Live demo for prospects: `/ai-ready/employer.html?demo=1`

## Notes & known limits (fine for pilots)

- Repeat submissions aren't deduplicated (no identifiers by design), so someone
  retaking the assessment counts twice. At pilot scale this is noise; revisit if
  a client needs re-assessment campaigns (e.g. per-quarter org codes like
  `acme-2026q3`).
- Apps Script comfortably handles hundreds of submissions/day; if a rollout is
  bigger than that, move storage to Cloudflare KV/D1 behind the same
  `/api/ai-ready` contract without touching the frontend.
