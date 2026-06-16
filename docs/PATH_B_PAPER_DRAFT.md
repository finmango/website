# Path B Paper — Working Draft

**Status:** Working manuscript + preregistration-style protocol. Sections 1–5 and the preliminary
results in §3 are grounded in analyses already in this repo. The *core* nowcasting results (§6) are
marked `[PENDING DATA]` — they require the state-month panel and raw search pulls described in §4.
Companion docs: `ACADEMIC_PAPER_FEASIBILITY_2026.md`, `BAROMETER_VALIDATION_2026.md`.

---

## Title (working)

**Does Real-Time Search Add Anything? Incremental Nowcasting of State-Level Household Financial
Distress with Absolute-Probability Google Health Trends Data**

Author line: FinMango Research Team (add co-authors / academic affiliation as appropriate).

---

## Abstract (working draft — results pending)

> Composite "economic stress" dashboards increasingly promise real-time, geographically resolved
> readings of household financial distress, yet most are built from official statistics that are
> themselves released with a lag. We first show, using the FinMango Financial Health Barometer as a
> worked case, that such a composite is **redundant with its inputs**: its state values are
> reconstructable from the underlying official series at correlations of 0.98–0.997, and its Food
> Insecurity index correlates with an independent USDA survey measure exactly as well as the raw
> Census poverty rate does (r = 0.685 vs 0.685; partial r controlling for poverty = 0.14, n.s.).
> The real-time value of such an instrument therefore cannot come from re-expressing lagged official
> data; it must come from information those releases do not yet contain. We test whether
> internet-search signals provide that information. Using a monthly panel of all 50 U.S. states and
> DC, we evaluate whether **absolute-probability** signals from the restricted-access Google Health
> Trends API improve out-of-sample nowcasts of household distress (financial difficulty, food
> sufficiency, housing insecurity) **beyond** a baseline of the lagged official inputs, and whether
> absolute probabilities outperform the conventional relative (0–100) Google Trends series. We
> address the documented January 2022 change in Health Trends sampling by modeling the post-change
> regime separately, and we benchmark with rolling-origin validation and Diebold–Mariano tests.
> `[PENDING DATA: headline incremental-accuracy result.]` All data, code, and the live tool are
> released openly.

---

## 1. Introduction

Timely, geographically granular measurement of household financial distress is a standing problem in
economic policy. The authoritative series — unemployment (BLS LAUS), poverty (Census SAIPE), housing
cost burden (Census ACS), food insecurity (USDA CPS-FSS) — are accurate but lagged and, for some, only
annual at the state level. This lag has motivated a wave of "nowcasting" tools, including public
dashboards that combine official inputs into a single real-time stress index.

We make a simple but consequential observation, then act on it. A composite index assembled from
lagged official statistics inherits both their content **and** their lag: dressing poverty and
unemployment in a 0–200 costume does not create new, timelier information. If a real-time instrument
is to earn the label, its incremental value must come from a data source that moves *before* the
official releases. Internet search is the leading candidate (Choi & Varian, 2012). The question this
paper answers is not "does search correlate with distress?" (it does) but the sharper, decision-relevant
one: **does search add predictive signal beyond the official inputs a dashboard already uses, at the
state-month level, for household financial distress?**

Our contributions:

1. **A redundancy diagnostic** for composite stress indices, demonstrated on a live tool, showing the
   composite is recoverable from its inputs and adds nothing beyond them against independent ground
   truth (§3). This reframes what such tools can and cannot claim.
2. **An incremental-validity nowcasting design** that pits search against the official-input baseline
   directly, rather than against a naïve no-information baseline (§5).
3. **A head-to-head test of absolute-probability vs. relative Google Trends** signals — rarely
   compared for economic nowcasting — using the restricted-access Google Health Trends API (§4.1).
4. **Open data and code**, including the live dashboard and the analysis scripts in this repository.

## 2. Related work

- **Search-based nowcasting.** Choi & Varian (2012) established that Google query volume can "predict
  the present" for indicators released with a lag; the approach has been extended and re-evaluated
  (Varian, 2023) and applied extensively to unemployment and unemployment-insurance claims, including
  state-panel models during COVID-19. Our design differs by testing *incremental* power over the
  official inputs rather than demonstrating predictive correlation per se.
- **Health Trends API.** Epidemiology has used the Google Health Trends API, which returns scaled
  *absolute* search probabilities rather than the public 0–100 relative index; the methodological
  literature also documents a **January 2022 sampling change** that renders pre/post values not
  directly comparable — a fact any multi-year design must handle.
- **Text/search-based indices as research objects.** The Economic Policy Uncertainty index (Baker,
  Bloom & Davis) and the Philadelphia Fed "Anxious Index" show how non-survey signals become accepted
  measures: through validation against outcomes, not through construction alone.

(Full citations in §References.)

## 3. Motivating evidence: the redundancy problem (preliminary results — grounded)

These results are computed from the shipped dataset; see `docs/barometer_decomposition.py` and
`docs/barometer_external_validation.py`.

### 3.1 The composite is its inputs
Reconstructing each Barometer index from its published formula using only the per-state official
metrics reproduces the published values almost perfectly:

| Index | corr(published, reconstructed) |
|---|---|
| Financial Anxiety | 0.995 |
| Food Insecurity | 0.984 |
| Housing Stress | 0.997 |
| Affordability | 0.991 |

The residual — the only non-deterministic component — falls within the documented ≤10-pt search
"boost" for 49–51 of 51 units. A hand-set regional multiplier inflates cross-state spread by 1.6–1.7×,
and the search boost is capped at 6–10% of index level. In short, the composite carries essentially no
information beyond its official inputs plus a small, capped nudge.

### 3.2 External convergent validity adds nothing beyond poverty
Against an **independent** target (USDA CPS-FSS state food insecurity, 2022–2024 average; n = 51):

| Comparison | r |
|---|---|
| Barometer Food Insecurity vs USDA | 0.685 |
| Census poverty (the input) vs USDA | 0.685 |
| Partial r(Barometer FI, USDA \| poverty) | 0.14 (n.s.) |

The index is a *valid* proxy but statistically indistinguishable from the raw poverty rate it is built
from (robust across vintages: 2019–21 gave 0.75 / 0.18). **Conclusion:** the case for a real-time
instrument rests entirely on whether a non-official signal adds incremental information. The rest of
the paper tests exactly that.

## 4. Data

### 4.1 Search signal — Google Health Trends API (the treatment)
- Restricted-access API returning absolute search probabilities (P(term) × 10⁷) for distress-related
  query sets, by state, monthly.
- **Query sets** (preregistered, with placebo controls): financial difficulty (e.g., "can't pay
  rent," "unemployment benefits"), food ("food bank," "SNAP application"), housing ("eviction help").
  Term lists fixed in advance; selection procedure and any expansion disclosed.
- **Regime break:** restrict primary analysis to the **post-2022-01-01** sampling regime; report the
  pre-break segment only as a cautioned robustness panel.
- **Benchmark signal:** the public **relative** Google Trends (0–100) for identical terms, to test
  whether absolute probabilities add value over what any researcher can obtain freely.

### 4.2 Official inputs (the baseline to beat)
The Barometer's own drivers, lagged as actually released: unemployment (BLS LAUS), poverty (SAIPE),
rent burden (ACS B25071), fair-market rent (HUD), house-price change (FRED HPI), plus autoregressive
terms of the target.

### 4.3 Validation targets (independent, timely, state-level)
- **Census Household Pulse Survey** (biweekly, state): "difficulty paying usual household expenses"
  (financial distress), food-sufficiency item (food), housing-security items (housing). Primary target
  because it is timely, state-level, and independent of the official *inputs*.
- **USDA CPS-FSS** food insecurity (annual; cross-sectional validation) — already in
  `data/external/usda_food_insecurity_state.csv`.
- **BLS state unemployment / UI initial claims** (financial distress, high-frequency).
- **Princeton Eviction Lab** filings (housing).

### 4.4 Panel construction
State × month, post-2022 primary window. Each target aligned to its release calendar; features lagged
to respect information availability at nowcast time (strict no-leakage construction).

## 5. Methods (preregistered analysis plan)

### 5.1 Hypotheses
- **H1 (incremental validity):** adding absolute-probability search features to the official-input
  baseline reduces out-of-sample nowcast error for household distress targets.
- **H2 (absolute > relative):** absolute-probability search features outperform relative (0–100)
  Google Trends features for the same targets.
- **H0 / placebo:** unrelated placebo search terms yield no improvement (guards against overfitting).

### 5.2 Models and baselines
Nested comparison on identical folds: (a) official-inputs-only baseline (+AR); (b) baseline + relative
Trends; (c) baseline + absolute GHT. Start with transparent linear/regularized models (interpretable,
fewer-degrees-of-freedom); report a gradient-boosted variant as robustness only.

### 5.3 Evaluation
Rolling-origin (expanding-window) nowcasts; MAE and RMSE vs. baseline; **Diebold–Mariano** tests for
equal predictive accuracy; incremental out-of-sample R². Report per-target and pooled.

### 5.4 Robustness & threats to validity
Placebo terms (§5.1); strict leakage audit (no target information in features); multiple-comparison
control over term/target combinations (e.g., Benjamini–Hochberg); COVID-window sensitivity; the
2022 regime split; state and month fixed effects as a panel robustness check.

## 6. Results

`[PENDING DATA]` — to be completed once the §4 panel is assembled. Reporting template:

- Table 1: nowcast error by model (baseline / +relative / +absolute) per target, with DM-test p-values.
- Table 2: incremental R² of search over baseline, pooled and by target.
- Figure 1: rolling-origin error over time, by model.
- Table 3: placebo-term results (expected null).

## 7. Discussion (to finalize with results)
Interpretation hinges on H1: if search adds nothing beyond the official inputs, the honest finding is
that "real-time" stress dashboards re-package lagged data — valuable for communication, not for
early warning. If search *does* add incremental signal (and absolute > relative), there is a concrete
case for a genuinely leading indicator, and for re-architecting the Barometer so search is a primary,
validated input rather than a ≤10-pt cosmetic boost (§3.1).

## 8. Limitations
Search signals are noisy and demographically non-representative; the GHT-API regime break constrains
history; query-term choice is researcher-dependent (mitigated by preregistration + placebos); Household
Pulse has its own sampling error and discontinuities. The composite-redundancy result (§3) is specific
to formula-based composites and does not indict search-based indices generally.

## 9. Reproducibility & open data
The live tool, the dataset, and the analysis scripts are open (MIT). Preliminary results in §3 run from
this repo with stdlib Python (`docs/barometer_decomposition.py`,
`docs/barometer_external_validation.py`). The §4 panel-build and §6 analysis scripts will be added as
the data is assembled.

## References (verified)
- Choi, H. & Varian, H. (2012). *Predicting the Present with Google Trends.* Economic Record 88:2–9.
  https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1475-4932.2012.00809.x
- Varian, H. (2023). *Nowcasting with Google Trends.* Economic Record.
  https://onlinelibrary.wiley.com/doi/10.1111/1475-4932.12783
- *Nowcasting of the U.S. unemployment rate using Google Trends.* https://www.sciencedirect.com/science/article/abs/pii/S1544612319301072
- *Forecasting unemployment insurance claims in realtime with Google Trends.* https://www.sciencedirect.com/science/article/abs/pii/S0169207021000649
- *Nowcasting unemployment insurance claims in the time of COVID-19* (state-panel). https://pmc.ncbi.nlm.nih.gov/articles/PMC8846950/
- Federal Reserve Bank of Chicago, *Initial UI Claims and Google Trends in the Post-Pandemic Era.* https://www.chicagofed.org/publications/blogs/chicago-fed-insights/2023/ui-claims-google-trends
- *Harnessing Google Health Trends Data for Epidemiologic Research.* Am. J. Epidemiology (2023). https://academic.oup.com/aje/article-abstract/192/3/430/6747668
- *Infodemiologists Beware: ... Google Health Trends API ... Incomparable Data as of 1 January 2022.* IJERPH. https://www.mdpi.com/1660-4601/19/22/15396
- Baker, Bloom & Davis, *Economic Policy Uncertainty Index.* https://www.policyuncertainty.com/us_monthly.html
- Federal Reserve Bank of Philadelphia, *The Anxious Index.* https://www.philadelphiafed.org/surveys-and-data/real-time-data-research/anxious-index

## Appendix: analysis assets in this repo
- `docs/barometer_exploratory_analysis.py` — descriptive stats + correlation structure
- `docs/barometer_decomposition.py` — §3.1 reconstruction / redundancy diagnostic
- `docs/barometer_external_validation.py` — §3.2 convergent validity vs USDA
- `data/external/usda_food_insecurity_state.csv` — USDA CPS-FSS 2022–24 target (with margins of error)
- `data/barometer_state_cross_section.csv` — clean 51-unit cross-section
