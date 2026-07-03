# Barometer Snapshot Archive

One file per day: the full `data/latest.json` output of the daily pipeline
(see `.github/workflows/daily-update.yml`), preserved as
`data/archive/YYYY-MM-DD.json`. The date is the file's own `as_of` field, not
the commit date, so re-runs of the pipeline on the same day simply overwrite
that day's snapshot.

`manifest.json` lists every available date (static hosting has no directory
listing) — fetch it first, then request `/data/archive/{date}.json`.

Why this exists: `latest.json` is overwritten every day, and the historical
time series is the core asset behind the Barometer's research and data-licensing
work. The archive was backfilled from git history on 2026-07-03 (snapshots
before 2026-05-01 predate the current `as_of` schema and are not included);
from then on the daily workflow appends each new day automatically.

Schema matches `latest.json` — see `docs/WHITEPAPER_2025.md` for methodology
and `docs/RESEARCH-DASHBOARD-SPEC.md` for field definitions. For commercial
use of this data, see `/barometer-partners-one-pager.html` or contact
scott@finmango.org.
