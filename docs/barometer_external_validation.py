#!/usr/bin/env python3
"""External convergent-validity check for the Barometer's Food Insecurity index.

Tests whether the Barometer's Food Insecurity composite tracks an INDEPENDENT
ground-truth measure (USDA ERS state food-insecurity prevalence) — and, crucially,
whether it adds anything beyond the Census poverty rate it is built from.

Data: data/external/usda_food_insecurity_state.csv (see header for provenance/vintage).
Stdlib only. Run:  python3 docs/barometer_external_validation.py
"""
import json, math, csv, statistics as st
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
raw = (ROOT / "data" / "dashboard-data.js").read_text(encoding="utf-8")
bar = json.loads(raw[raw.index("{"):raw.rindex("}") + 1])["states"]

# Load external target (skip comment lines, parse by header)
csv_path = ROOT / "data" / "external" / "usda_food_insecurity_state.csv"
_lines = [l for l in csv_path.read_text(encoding="utf-8").splitlines() if not l.startswith("#")]
usda = {row["state"]: float(row["food_insecurity_pct"]) for row in csv.DictReader(_lines)}


def pearson(xs, ys):
    n = len(xs); mx, my = sum(xs)/n, sum(ys)/n
    num = sum((x-mx)*(y-my) for x, y in zip(xs, ys))
    dx = math.sqrt(sum((x-mx)**2 for x in xs)); dy = math.sqrt(sum((y-my)**2 for y in ys))
    return num/(dx*dy) if dx and dy else float("nan")


def ranks(vals):
    order = sorted(range(len(vals)), key=lambda i: vals[i])
    r = [0.0]*len(vals); i = 0
    while i < len(vals):
        j = i
        while j+1 < len(vals) and vals[order[j+1]] == vals[order[i]]:
            j += 1
        avg = (i+j)/2 + 1
        for k in range(i, j+1):
            r[order[k]] = avg
        i = j+1
    return r


def spearman(xs, ys):
    return pearson(ranks(xs), ranks(ys))


def partial(xy, xz, yz):  # corr(x,y | z)
    return (xy - xz*yz) / math.sqrt((1-xz**2)*(1-yz**2))


# Align by state name
names = [s["name"] for s in bar.values() if s["name"] in usda]
missing = [s["name"] for s in bar.values() if s["name"] not in usda]
by_name = {s["name"]: s for s in bar.values()}
barometer_fi = [by_name[n]["food_insecurity"]["value"] for n in names]
poverty = [by_name[n]["metrics"]["poverty_rate"] for n in names]
target = [usda[n] for n in names]

print(f"matched {len(names)}/51 states; unmatched: {missing or 'none'}\n")

r_bt = pearson(barometer_fi, target)       # Barometer FI  vs  USDA FI
rho_bt = spearman(barometer_fi, target)
r_pt = pearson(poverty, target)            # poverty (the input) vs USDA FI  [baseline]
r_bp = pearson(barometer_fi, poverty)      # Barometer FI vs poverty (should be ~0.96)
pcorr = partial(r_bt, r_bp, r_pt)          # Barometer FI vs USDA FI, controlling for poverty

print("CONVERGENT VALIDITY — Barometer Food Insecurity vs USDA food insecurity")
print(f"   Pearson  r = {r_bt:.3f}")
print(f"   Spearman rho = {rho_bt:.3f}")
print("\nDOES THE INDEX BEAT ITS OWN INPUT?")
print(f"   poverty (SAIPE) vs USDA FI:          r = {r_pt:.3f}   <- baseline to beat")
print(f"   Barometer FI    vs USDA FI:          r = {r_bt:.3f}")
print(f"   Barometer FI    vs poverty:          r = {r_bp:.3f}   (index is ~poverty by construction)")
print(f"   partial r(Barometer FI, USDA | poverty) = {pcorr:.3f}")
print("   -> if the partial r is ~0, the index adds ~nothing beyond poverty for tracking USDA.")
