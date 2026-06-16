# Barometer — First Validation Pass

**Companion to** `ACADEMIC_PAPER_FEASIBILITY_2026.md`
Prepared June 2026 · reproducible via `docs/barometer_decomposition.py`

This note reports the first concrete validation work on the Financial Health Barometer, on two
fronts: (a) an **internal decomposition** — does the index measure anything beyond its own inputs,
and does the real-time search signal actually move it? — and (b) a first **external
convergent-validity** check against an independent ground-truth survey (USDA food insecurity).
Both point to the same conclusion and are reproducible from the repo.

> **Bottom line:** the Food Insecurity index is a *valid proxy* (r = 0.75 with USDA's independent
> measure) but does **not beat the Census poverty rate it is built from** (poverty alone: r = 0.75;
> the index's partial correlation controlling for poverty is just 0.18, n.s.). The composite is
> real but redundant with its inputs — so the publishable contribution has to come from the
> **search signal** adding information beyond official statistics, or a **re-derived index** that
> demonstrably beats its inputs.

---

## 1. Headline findings (all reproducible from repo data)

**Finding 1 — The composite carries ~no information beyond its documented inputs.**
Reconstructing each index from the published formulas (barometer.html → Index Formulas) using only
the per-state raw metrics reproduces the published values almost exactly:

| Composite | corr(published, reconstructed) | residual mean / sd | residual range |
|---|---|---|---|
| Financial Anxiety | **0.995** | +0.74 / 2.75 | −0.5 … +10.3 |
| Food Insecurity | **0.984** | +0.23 / 4.70 | −17.9 … +10.3 |
| Housing Stress* | **0.997** | +1.15 / 1.60 | −1.6 … +11.8 |
| Affordability | **0.991** | +1.16 / 3.28 | −0.4 … +10.4 |

The residual is the *only* part of the index not mechanically determined by BLS/Census/HUD/FRED
inputs — and for 49–51 of 51 units it sits inside the documented +0–10 search-boost band.
**Interpretation:** the composite is a deterministic re-expression of official statistics plus a
small search nudge. It is not an independent measurement. (This matches FinMango's own
researcher note — "use the raw underlying metrics for econometric modeling.") For a paper, this is
the central fact: **model the raw inputs, not the composite.**
*\*Housing Stress reconstruction assumes National Avg FMR = mean of state 2BR FMR (≈$1,229); the
exact FMR definition is ambiguous in the data (two FMR fields exist), a reproducibility item.*

**Finding 2 — A hand-set, subjective parameter drives ~40% of cross-state spread.**
The `regional_stress_multiplier` (0.85–1.35, assigned, not estimated) inflates the cross-state
standard deviation by **1.6–1.7×** (Financial Anxiety 15.6 → 25.6; Food Insecurity 14.6 → 24.7).
A reviewer will treat an unestimated multiplier that dominates the variance as a serious weakness.
**Fix:** derive it from observables or drop it.

**Finding 3 — The real-time search signal, as wired, is a minor nudge — not a driver.**
The Health Trends boost is capped at +10, i.e. **at most 6–10% of each index level**, and observed
residuals show it usually moves the index by ~1–3 points. The signal the flagship paper would be
built on currently contributes almost nothing to the published number.
**Strategic implication:** to make a search-nowcasting paper compelling, search must be *promoted
from a ≤10-pt additive boost to a primary, validated signal* — not left as garnish. This sharpens
the paper's thesis considerably.

---

## 2. What this means for the three paths

- **Path A (data/tool descriptor):** unaffected and still shippable — just describe the index
  honestly as a heuristic composite of official inputs.
- **Path B (nowcasting, the flagship):** *strengthened and clarified.* Findings 1 & 3 say the
  contribution must be "can absolute-probability Health-Trends search **add predictive signal** for
  state distress **beyond** the lagged official inputs?" That is a clean, testable, novel question.
- **Path C (re-derived index):** Findings 1 & 2 give it a concrete mandate — replace the heuristic
  weights and the subjective multiplier with estimated/validated ones.

---

## 3. External convergent-validity check — first pass complete

Run via `docs/barometer_external_validation.py` against `data/external/usda_food_insecurity_state.csv`.
The target is USDA ERS state food-insecurity prevalence — independent of the index's inputs, since
the index drives Food Insecurity off **Census poverty (SAIPE)**, not the USDA food-security survey.

**Result (n = 51 matched):**

| Comparison | r |
|---|---|
| Barometer Food Insecurity vs USDA food insecurity | **0.753** (Spearman 0.638) |
| Census poverty (the input) vs USDA food insecurity | **0.751** ← baseline to beat |
| Barometer Food Insecurity vs poverty | 0.958 (≈ poverty by construction) |
| **Partial r(Barometer FI, USDA \| poverty)** | **0.179** (n.s.; critical r≈0.28 at n=51) |

**Interpretation.** The index is a *valid proxy* — states it flags as food-insecure are food-insecure
in USDA's independent survey. But it is statistically indistinguishable from simply using the Census
poverty rate (0.753 vs 0.751), and once poverty is controlled for it adds nothing significant (0.179).
This is the external confirmation of Finding 1: **for research, use poverty (or USDA) directly; the
composite is redundant with its inputs.**

**Data provenance & caveat.** First pass uses USDA's **2019–2021** 3-yr average (via World Population
Review, citing USDA ERS; single automated extraction). State food-insecurity ranks are highly
persistent, so the directional conclusion is robust to vintage — but for a publication-grade number,
swap in the latest official table and re-run (it's a drop-in). Verified anchors to validate any
replacement: 2021–2023 → NH 7.4 / AR 18.9 / US 12.2; 2022–2024 → ND 9.0 / AR 19.4.
Authoritative source: USDA ERS, *Household Food Security in the United States* (ERR-337) /
https://www.ers.usda.gov/topics/food-nutrition-assistance/food-security-in-the-us/interactive-charts-and-highlights

**Still to do (needs a browser / independent target):** repeat for the financial-anxiety construct
against the **Census Household Pulse Survey** ("difficulty paying usual household expenses"), which is
independent of the index's unemployment input.

---

## 4. Minor data-quality items surfaced (quick wins for the live tool)

- Two states show Food Insecurity ~18 pts **below** the formula reconstruction (residual −17.9) —
  a regmult/version mismatch or a negative adjustment not in the documented formula; worth tracing.
- Housing Stress residual reaches +11.8 (>10 cap) — FMR-definition ambiguity / rounding.
- (From the companion doc) national history is on a different scale than the headline indices, and
  Food Insecurity history exceeds the stated 0–200 bound; the Google Health Trends API also has a
  documented 2022-01-01 sampling break mid-series.

---

## 5. Recommended next action

The external check now confirms (Finding 1, externally): the composite is redundant with its inputs.
So:

1. **Commit the flagship paper to the live question** the decomposition + validation isolate:
   *"does absolute-probability Google Health Trends search add nowcast signal for state household
   distress **beyond** the lagged official inputs?"* That is the only path where the contribution is
   not already contained in BLS/Census data.
2. Swap the latest USDA vintage into `data/external/` and re-run §3 for the publication number.
3. Extend the external check to the **financial-anxiety construct** vs Census Household Pulse.
