# Barometer — First Validation Pass

**Companion to** `ACADEMIC_PAPER_FEASIBILITY_2026.md`
Prepared June 2026 · reproducible via `docs/barometer_decomposition.py`

This note reports the first concrete validation work on the Financial Health Barometer.
The original plan was an **external** convergent-validity check (does the index track an
independent ground-truth survey?). That step is partially blocked by data-access limits in the
build environment (see §3), so it is fully specified and ready to run. In its place we completed
an **internal decomposition** that turns out to be just as decisive for the paper: it answers
*"does the index measure anything beyond its own inputs, and does the real-time search signal
actually move it?"*

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

## 3. External convergent-validity check — specified, ready to run

This is the step that still needs one clean external dataset. Everything except the data fetch is
ready in `docs/barometer_decomposition.py` (correlation/partial-correlation helpers).

- **Target (independent of the index's inputs):** USDA ERS state food-insecurity prevalence
  (3-yr average). The index drives Food Insecurity off **Census poverty (SAIPE)**, *not* the USDA
  food-security survey, so this is a genuine convergent-validity test.
- **Verified anchors** (use to validate any fetched table before trusting it):
  - 2021–2023 average: low = **New Hampshire 7.4%**, high = **Arkansas 18.9%**, U.S. = **12.2%**.
  - 2022–2024 average: low = **North Dakota 9.0%**, high = **Arkansas 19.4%**.
- **Authoritative source:** USDA ERS, *Household Food Security in the United States in 2023*
  (ERR-337) and the Food Security data product (Excel/CSV).
  https://www.ers.usda.gov/topics/food-nutrition-assistance/food-security-in-the-us/interactive-charts-and-highlights
- **Why it's not done here:** the sandbox lacks PDF/Excel tooling, the ERS data is behind
  JS charts / Excel downloads, and Ag Data Commons returned 403. Downloading the CSV in a normal
  browser takes ~30 seconds — drop it in as `data/external/usda_food_insecurity_state.csv`.
- **Test design once data is in hand:**
  1. Pearson + Spearman: Barometer Food Insecurity (state) vs USDA food insecurity (state).
  2. **Partial correlation controlling for poverty rate** — the decisive test: does the index track
     food insecurity *beyond* what poverty alone explains? Given Finding 1, the honest prior is
     "barely," and confirming that quantitatively is itself a publishable result.
  3. Repeat for the financial-anxiety construct against the **Census Household Pulse Survey**
     ("difficulty paying usual household expenses"), which is independent of the index's inputs.

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

1. Drop in the USDA CSV and run the §3 external check (the one thing needing a browser).
2. If the partial correlation confirms the index ≈ its inputs, pivot the flagship paper firmly to
   **"does absolute-probability Health-Trends search add nowcast signal beyond official inputs?"** —
   which the decomposition shows is the live, unanswered question.
