#!/usr/bin/env python3
"""Decomposition test: how much information does each Barometer composite carry
beyond its documented inputs, and how much does the real-time search 'boost'
actually move it?

Reconstructs each composite from the formulas published in barometer.html
(Methodology > Index Formulas) using the per-state raw metrics shipped in
data/dashboard-data.js, then compares to the published composite value. The
residual isolates the only non-deterministic component: the Google Health
Trends "boost" (capped at +0-10) plus rounding.

Stdlib only. Run:  python3 docs/barometer_decomposition.py
"""
import json, math, statistics as st
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
_raw = (ROOT / "data" / "dashboard-data.js").read_text(encoding="utf-8")
data = json.loads(_raw[_raw.index("{"):_raw.rindex("}") + 1])


def pearson(xs, ys):
    n = len(xs); mx, my = sum(xs)/n, sum(ys)/n
    num = sum((x-mx)*(y-my) for x, y in zip(xs, ys))
    dx = math.sqrt(sum((x-mx)**2 for x in xs)); dy = math.sqrt(sum((y-my)**2 for y in ys))
    return num/(dx*dy) if dx and dy else float("nan")


S = data["states"]
m = lambda s: s["metrics"]
nat_fmr = st.mean(m(s)["fair_market_rent_2br"] for s in S.values())
print(f"Assumed National Avg 2BR FMR (mean of state values) = {nat_fmr:.0f}\n")

rows = []
for s in S.values():
    M = m(s)
    fa = (120 + (M["unemployment_rate"] - 3.5) * 18) * M["regional_stress_multiplier"]
    fi = (85 + (M["poverty_rate"] - 10) * 6) * M["regional_stress_multiplier"]
    rent_score = (M["rent_burden_pct"] - 25) * 3
    fmr_score = (M["fair_market_rent_2br"] / nat_fmr - 1) * 40
    hpi_score = M["housing_price_change"] * 2
    hs = (100 + rent_score + fmr_score + hpi_score) * M["regional_stress_multiplier"]
    aff = s["housing_stress"]["value"] * 0.60 + s["food_insecurity"]["value"] * 0.40
    rows.append(dict(
        name=s["name"], regmult=M["regional_stress_multiplier"],
        FA_pub=s["financial_anxiety"]["value"], FA_rec=fa,
        FI_pub=s["food_insecurity"]["value"], FI_rec=fi,
        HS_pub=s["housing_stress"]["value"], HS_rec=hs,
        AFF_pub=s["affordability"]["value"], AFF_rec=aff,
        FA_metric=(120 + (M["unemployment_rate"] - 3.5) * 18),
        FI_metric=(85 + (M["poverty_rate"] - 10) * 6),
    ))


def report(tag, pub_k, rec_k):
    pub = [r[pub_k] for r in rows]; rec = [r[rec_k] for r in rows]
    resid = [p - q for p, q in zip(pub, rec)]
    print(f"== {tag} ==")
    print(f"   corr(published, reconstructed) = {pearson(pub, rec):.4f}")
    print(f"   residual (published - reconstructed):  mean={st.mean(resid):+.2f}  "
          f"sd={st.pstdev(resid):.2f}  min={min(resid):+.1f}  max={max(resid):+.1f}")
    in_boost = sum(1 for x in resid if -1.0 <= x <= 10.5)
    print(f"   residuals within [~0,10] search-boost band: {in_boost}/{len(resid)}")
    return resid


print("RECONSTRUCTION FROM PUBLISHED FORMULAS (residual = search boost + rounding)\n")
report("Financial Anxiety", "FA_pub", "FA_rec")
report("Food Insecurity", "FI_pub", "FI_rec")
report("Housing Stress (FMR definition ambiguous)", "HS_pub", "HS_rec")
report("Affordability", "AFF_pub", "AFF_rec")

print("\nHOW MUCH DOES THE HAND-SET REGIONAL MULTIPLIER DRIVE CROSS-STATE SPREAD?")
for tag, metric_k, pub_k in [("Financial Anxiety", "FA_metric", "FA_pub"),
                             ("Food Insecurity", "FI_metric", "FI_pub")]:
    metric_only = [r[metric_k] for r in rows]            # regmult fixed at 1.0
    pub = [r[pub_k] for r in rows]
    print(f"   {tag}: sd(metric term, regmult=1) = {st.pstdev(metric_only):.1f}  "
          f"vs  sd(published) = {st.pstdev(pub):.1f}  "
          f"(regmult inflates spread {st.pstdev(pub)/st.pstdev(metric_only):.2f}x)")

print("\nSEARCH-SIGNAL HEADROOM: the boost is capped at +10 on indices averaging:")
for k, lab in [("FA_pub", "Financial Anxiety"), ("FI_pub", "Food Insecurity"),
               ("HS_pub", "Housing Stress"), ("AFF_pub", "Affordability")]:
    mean_v = st.mean(r[k] for r in rows)
    print(f"   {lab:<18} mean={mean_v:6.1f}  ->  max search contribution = {10/mean_v*100:.1f}% of level")
