#!/usr/bin/env python3
"""Exploratory analysis of the Financial Health Barometer dataset.

Regenerates the descriptive statistics and correlation tables reported in
docs/ACADEMIC_PAPER_FEASIBILITY_2026.md (§2), and writes a clean state-level
cross-section to data/barometer_state_cross_section.csv.

Stdlib only (no numpy/pandas required). Run from anywhere:
    python3 docs/barometer_exploratory_analysis.py
"""
import json, math, statistics as st
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # repo root
SRC = ROOT / "data" / "dashboard-data.js"
OUT_CSV = ROOT / "data" / "barometer_state_cross_section.csv"

raw = SRC.read_text(encoding="utf-8")
data = json.loads(raw[raw.index("{"):raw.rindex("}") + 1])


def pearson(xs, ys):
    n = len(xs)
    if n < 3:
        return float("nan")
    mx, my = sum(xs) / n, sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    dx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    dy = math.sqrt(sum((y - my) ** 2 for y in ys))
    return num / (dx * dy) if dx and dy else float("nan")


COMPOSITES = ["financial_anxiety", "food_insecurity", "housing_stress", "affordability"]
METRICS = ["unemployment_rate", "poverty_rate", "rent_burden_pct",
           "fair_market_rent_2br", "housing_price_change", "regional_stress_multiplier"]

states = data["states"]
print("=" * 70)
print(f"STATE-LEVEL CROSS-SECTION  (n = {len(states)} states+DC)")
print("=" * 70)

cols = {c: [] for c in COMPOSITES}
mcols = {m: [] for m in METRICS}
names = []
for s in states.values():
    names.append(s["name"])
    for c in COMPOSITES:
        cols[c].append(s[c]["value"])
    for m in METRICS:
        mcols[m].append(s["metrics"].get(m, float("nan")))

print("\n-- Composite index descriptive stats --")
print(f"{'indicator':<20}{'mean':>8}{'sd':>8}{'min':>8}{'max':>8}")
for c in COMPOSITES:
    v = cols[c]
    print(f"{c:<20}{st.mean(v):>8.1f}{st.pstdev(v):>8.1f}{min(v):>8.1f}{max(v):>8.1f}")

print("\n-- Raw metric descriptive stats --")
print(f"{'metric':<26}{'mean':>8}{'sd':>8}{'min':>8}{'max':>8}")
for m in METRICS:
    v = [x for x in mcols[m] if not math.isnan(x)]
    print(f"{m:<26}{st.mean(v):>8.2f}{st.pstdev(v):>8.2f}{min(v):>8.2f}{max(v):>8.2f}")

print("\n-- Correlation: composite vs raw drivers (cross-state) --")
print(f"{'':<20}" + "".join(f"{m[:10]:>12}" for m in METRICS))
for c in COMPOSITES:
    row = ""
    for m in METRICS:
        pairs = [(a, b) for a, b in zip(cols[c], mcols[m]) if not math.isnan(b)]
        row += f"{pearson([a for a, _ in pairs], [b for _, b in pairs]):>12.2f}"
    print(f"{c:<20}{row}")

print("\n-- Correlation among composites (cross-state) --")
print(f"{'':<20}" + "".join(f"{c[:10]:>12}" for c in COMPOSITES))
for c1 in COMPOSITES:
    print(f"{c1:<20}" + "".join(f"{pearson(cols[c1], cols[c2]):>12.2f}" for c2 in COMPOSITES))

print("\n" + "=" * 70)
print("NATIONAL TIME SERIES")
print("=" * 70)
ts = data["timeseries"]["national"]
series = {}
for c in COMPOSITES:
    pts = ts[c]
    vals = [p["value"] for p in pts]
    series[c] = vals
    dates = [p["date"] for p in pts]
    mom = [vals[i] - vals[i - 1] for i in range(1, len(vals))]
    print(f"\n{c}: n={len(vals)}  {dates[0]} -> {dates[-1]}")
    print(f"   level mean={st.mean(vals):.1f} sd={st.pstdev(vals):.1f} "
          f"min={min(vals):.0f} max={max(vals):.0f}")
    print(f"   month-over-month vol (sd of deltas) = {st.pstdev(mom):.2f}")

print("\n-- Correlation among national series (levels) --")
print(f"{'':<20}" + "".join(f"{c[:10]:>12}" for c in COMPOSITES))
for c1 in COMPOSITES:
    print(f"{c1:<20}" + "".join(f"{pearson(series[c1], series[c2]):>12.2f}" for c2 in COMPOSITES))

with OUT_CSV.open("w", encoding="utf-8") as f:
    f.write(",".join(["state"] + COMPOSITES + METRICS) + "\n")
    for i, name in enumerate(names):
        f.write(",".join([name] + [str(cols[c][i]) for c in COMPOSITES]
                         + [str(mcols[m][i]) for m in METRICS]) + "\n")
print(f"\nWrote {OUT_CSV.relative_to(ROOT)}")
