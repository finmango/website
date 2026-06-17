#!/usr/bin/env python3
"""Build the state-month panel SCAFFOLD for the Path B nowcasting study.

Generates an empty-but-structured table: one row per (state, month) over the
post-2022 Google Health Trends regime, with all feature/target columns present
but blank, ready to be filled from their sources (see data/panel/README.md).
Key columns and the one cross-sectional anchor we already have (USDA food
insecurity) are populated; everything requiring a live data pull is left blank.

Stdlib only. Run:  python3 docs/build_panel.py
"""
import json, csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
raw = (ROOT / "data" / "dashboard-data.js").read_text(encoding="utf-8")
states = json.loads(raw[raw.index("{"):raw.rindex("}") + 1])["states"]

# USDA cross-sectional anchor (already in repo)
usda = {}
for line in (ROOT / "data" / "external" / "usda_food_insecurity_state.csv").read_text().splitlines():
    if line.startswith("#") or line.startswith("state,") or not line.strip():
        continue
    parts = line.split(",")
    usda[parts[0]] = parts[1]

# Post-2022 GHT regime window (inclusive)
START = (2022, 1)
END = (2026, 6)

def months(start, end):
    y, m = start
    while (y, m) <= end:
        yield y, m
        m += 1
        if m > 12:
            y, m = y + 1, 1

COLUMNS = [
    # --- keys ---
    "state", "abbr", "date", "year", "month",
    # --- TARGETS (independent ground truth to nowcast) — BLANK ---
    "pulse_difficulty_expenses_pct", "pulse_food_insufficient_pct", "pulse_behind_on_housing_pct",
    # --- SEARCH treatment: Google Health Trends absolute probabilities — BLANK ---
    "ght_financial_abs", "ght_food_abs", "ght_housing_abs",
    # --- SEARCH benchmark: public relative Google Trends (0-100) — BLANK ---
    "gt_financial_rel", "gt_food_rel", "gt_housing_rel",
    # --- OFFICIAL INPUT baseline (lagged, as-released) — BLANK ---
    "unemployment_rate", "ui_initial_claims", "poverty_rate", "rent_burden_pct", "hpi_change",
    # --- REFERENCE anchor we already have (3-yr avg; constant across window) ---
    "usda_food_insecurity_3yr_avg",
]

rows = []
for s in sorted(states.values(), key=lambda x: x["name"]):
    for y, m in months(START, END):
        row = {c: "" for c in COLUMNS}
        row.update(state=s["name"], abbr=s["abbr"], date=f"{y}-{m:02d}-01", year=y, month=m)
        row["usda_food_insecurity_3yr_avg"] = usda.get(s["name"], "")
        rows.append(row)

out_dir = ROOT / "data" / "panel"
out_dir.mkdir(parents=True, exist_ok=True)
out = out_dir / "state_month_panel.csv"
with out.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=COLUMNS)
    w.writeheader()
    w.writerows(rows)

n_states = len({r["state"] for r in rows})
n_months = len({r["date"] for r in rows})
print(f"Wrote {out.relative_to(ROOT)}")
print(f"  {len(rows)} rows = {n_states} states/DC x {n_months} months ({rows[0]['date']} .. {rows[-1]['date']})")
print(f"  {len(COLUMNS)} columns; populated: keys + usda_food_insecurity_3yr_avg; rest blank (see README).")
