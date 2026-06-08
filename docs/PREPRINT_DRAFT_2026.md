# Nowcasting Household Financial Stress: The FinMango Financial Health Barometer

**Working paper — DRAFT v0.1 (for internal review, not yet for distribution)**

**FinMango Research Team**
**Draft date:** June 2026

> **Status note (delete before posting):** This is a first draft skeleton intended to
> get the Barometer onto a citable, peer-review-defensible footing — the keystone
> artifact that a press push and partner conversations can hook onto. It deliberately
> reframes the public dashboard's "real-time / crisis" language into nowcasting terms,
> is explicit about the heuristic weights, and proposes a concrete validation that the
> base Barometer has not yet undergone. Sections marked **[TODO]** need the empirical
> pass before this goes to SSRN/arXiv.

---

## Abstract

Official measures of household economic distress are authoritative but lagging: state
unemployment is monthly, poverty and rent-burden estimates are annual, and each is
published with weeks-to-months of delay. We describe the **FinMango Financial Health
Barometer**, an open, daily-updated, state-level (50 states + DC) indicator system that
combines authoritative government data (BLS LAUS, Census SAIPE and ACS, HUD Fair Market
Rents, FRED HPI) with behavioral search signals from the Google Health Trends API and an
academic housing-cost-burden anchor (Harvard JCHS). The Barometer publishes four composite
indices — Financial Anxiety, Food Insecurity, Housing Stress, and Affordability — on a
0–200 scale, with full per-state source attribution, downloadable open data (MIT license),
and a documented methodology. This paper (i) situates the Barometer within the economic
"nowcasting" literature, (ii) documents the data architecture and index construction,
(iii) is explicit about which components are empirically grounded versus heuristic, and
(iv) reports a first cross-sectional validation. Against an independent benchmark (Feeding
America's *Map the Meal Gap*), the Food Insecurity index's state ranking shows significant
concurrent validity (Spearman ρ = 0.62, *n* = 51, *p* < 0.001). The same analysis reveals,
and we report transparently, that this index is currently carried entirely by structural
regional adjustments rather than its live data inputs — a finding that both validates the
model's regional priors and bounds its present "real-time" claim.

---

## 1. Introduction

The gap this addresses is timing. The numbers economists trust most — BLS unemployment,
Census poverty, ACS rent burden — are the slowest to arrive. Households living through a
shock absorb months of stress before the official series confirm it. Decision-makers
(local governments, food banks, housing agencies, funders) increasingly want a *contemporaneous*
read: not a forecast, but a "predicting the present" estimate of where distress is
building right now.

Search behavior is a natural candidate signal. People search for "eviction help,"
"food bank near me," and "bankruptcy" at the moment of need, well before that need shows
up in administrative data. The contribution of the Barometer is not the discovery of this
idea — it is a *productionized, open, state-resolved, multi-domain* implementation of it,
running daily with transparent sourcing, packaged for non-specialist use.

We make three claims, and are careful about their limits:
1. **Coverage.** A single open dataset spanning four distress domains across all 50 states
   + DC, updated daily, with source attribution on every cell, did not previously exist in
   open form.
2. **Timeliness.** The search layer responds to acute local shocks that annual structural
   data cannot see within its revision cycle.
3. **Transparency.** Methodology, code, and data are MIT-licensed and reproducible.

We explicitly do **not** claim that the composite index values are calibrated cardinal
measures, nor that the color thresholds correspond to validated clinical or economic
cut-points. Section 5 addresses this directly.

## 2. Related work

The Barometer descends from a well-established line of "nowcasting with search data":

- **Choi & Varian (2012), "Predicting the Present with Google Trends"** established the
  canonical approach: search-query volumes improve contemporaneous estimates of economic
  variables (auto sales, unemployment claims, travel).
- **Da, Engelberg & Gao (2015), "The Sum of All FEARS," *Review of Financial Studies*** is
  the closest precedent. They construct an economic-sentiment index ("Financial and
  Economic Attitudes Revealed by Search") directly from Google search volumes of
  household-economy terms and show it has measurable asset-pricing content. Our index
  ontology (debt, eviction, food assistance) is a household-distress analogue.
- **Ettredge et al. (2005); Baker & Fradkin (2017)** use web-search data for labor-market
  measurement specifically.
- **Lazer et al. (2014), "The Parable of Google Flu," *Science*** is the cautionary anchor.
  Google Flu Trends failed by overfitting and overclaiming on search signals. We take two
  lessons from it directly: (a) search signals drift and must be re-validated, and (b) a
  "live" headline number invites scrutiny it must be able to survive. Both shape the design
  choices and limitations below.

The Barometer's distinguishing feature relative to this literature is the **Google Health
Trends API**, to which FinMango has access. Unlike the public Google Trends site (which
returns a relative 0–100 index), the Health Trends API returns *absolute* search
probabilities (P(term) × 10,000,000), which avoids the normalization ambiguity that
complicates much published Trends-based work.

## 3. Data and methods

### 3.1 Data layers

| Layer | Sources | Role | Cadence |
|---|---|---|---|
| Structural ("base truth") | BLS LAUS, Census SAIPE, Census ACS B25071, HUD FMR, FRED HPI | Anchors indices to demographic reality | Monthly / Annual |
| Behavioral (signal) | Google Health Trends API | Contemporaneous sensitivity to acute shocks | Daily |
| Calibration | Harvard JCHS, *State of the Nation's Housing 2025* | Housing-stress validation anchor | Annual |

### 3.2 Index construction

The four indices are weighted composites of a structural driver and a bounded search
"boost," scaled to a 0–200 range and adjusted by region. Full formulas are in the
[Methodology](METHODOLOGY.md) and [2025 Whitepaper](WHITEPAPER_2025.md); summarized:

- **Financial Anxiety** = (120 + (Unemployment − 3.5%) × 18) × RegionalMultiplier + Boost
- **Food Insecurity** = (85 + (Poverty − 10%) × 6) × RegionalMultiplier + Boost
- **Housing Stress** = (100 + RentBurdenScore + FMRScore + HPIScore) × RegionalMultiplier + Boost
- **Affordability** = (Housing × 0.60) + (Food × 0.40) + Boost

### 3.3 What is grounded vs. heuristic (stated plainly)

This is the section a reviewer turns to first, so we are direct.

- **Empirically grounded:** the *inputs* (unemployment, poverty, rent burden, FMR, HPI) are
  official statistics; the *directional* construction (higher unemployment → higher anxiety)
  is uncontroversial.
- **Heuristic, by current design:** the base constants (120 / 85 / 100), the slope
  multipliers (×18, ×6, ×3), the regional multipliers (0.85–1.35×), the +0–10 search-boost
  cap, and the 0–200 scale with its green/yellow/orange/red thresholds are **chosen, not
  estimated**. They were set to place typical conditions in the "moderate" band and to make
  volatility legible. They are appropriate for *relative comparison across states* and
  *time*, which is what the dashboard is for. They are **not** validated cardinal measures,
  and the "crisis" threshold is a presentational device, not (yet) an empirically derived
  cut-point.

We therefore recommend — and the open CSV provides — the **raw underlying metrics** for any
econometric use, with the composite indices used as a communication and ranking layer.

## 4. Validation

A distress index is only credible if it ranks places the way reality does. Because the
public data is a single daily snapshot (we do not yet retain an index time series), this is
a **cross-sectional concurrent-validity** test across the 50 states + DC (*n* = 51). It
speaks to the validity of the state *ranking*, not to the temporal "nowcasting" claim,
which remains untested (§5). All figures below are reproducible via
[`scripts/validate-barometer.js`](../scripts/validate-barometer.js).

**Held-out benchmark.** We use state food-insecurity rates from Feeding America's *Map the
Meal Gap* (via the County Health Rankings 2025 national file). This is genuinely held out:
the Barometer's Food Insecurity index is nominally driven by Census SAIPE poverty, not by
food-insecurity surveys. We report Spearman ρ (primary, since the indices are ordinal by
design) and Pearson *r*.

### 4.1 Results

| Test | Pearson *r* | Spearman ρ | *p* | Reading |
|---|---|---|---|---|
| **Food Insecurity index vs. Map-the-Meal-Gap** (held out) | 0.70 | **0.62** | <0.001 | Moderate–strong concurrent validity |
| Housing Stress vs. food insecurity (discriminant) | 0.24 | 0.24 | 0.085 | Weak, as it should be |
| Financial Anxiety vs. food insecurity (discriminant) | 0.39 | 0.38 | 0.004 | Moderate (distress dimensions co-move) |
| Financial Anxiety vs. BLS unemployment (input) | 0.86 | 0.84 | <0.001 | Internal consistency confirmed |
| Housing Stress vs. ACS rent burden (input) | 0.75 | 0.68 | <0.001 | Internal consistency confirmed |
| Housing Stress vs. JCHS cost burden (calibration) | 0.83 | 0.70 | <0.001 | Internal consistency confirmed |

Two positive findings. First, the Food Insecurity index has **statistically significant
concurrent validity against a fully independent benchmark** (ρ = 0.62, *p* < 0.001). Second,
the indices show **discriminant validity**: the Food Insecurity index tracks food insecurity
(ρ = 0.62) substantially better than the Housing (0.24) or Anxiety (0.38) indices do — they
are not merely all measuring "generic state hardship."

### 4.2 The finding that matters most (and why disclosing it makes the index *more* credible)

The validation also surfaced something we are obligated to report. The Food Insecurity index
correlates with the hand-set **regional stress multiplier at ρ = r = 1.00** — i.e., in this
snapshot the index is *exactly* `base × regional multiplier`. The reason: `poverty_rate` was
**null for all 51 states** (the SAIPE/Census feed did not populate), so the only term varying
across states was the multiplier the designers assigned by region.

The implication is precise, and double-edged:

- **The structural priors are good priors.** Multipliers set from regional economic knowledge
  (Deep South ≈ 1.25–1.35×, Plains ≈ 0.85–0.95×) correlate 0.62 with independent food
  insecurity. That is a real, defensible result.
- **But the "live data" layer contributed nothing to this index's ranking in this snapshot.**
  The Food Insecurity index is presently a static structural prior, not a live measurement,
  and its concurrent validity should be attributed to the multipliers, *not* to the data
  pipeline. Claiming this index as "real-time" is not currently supportable.
- **The other two data-bearing indices fare better.** Financial Anxiety retains independent
  signal from BLS unemployment (ρ = 0.84) on top of the multiplier (ρ = 0.78), and Housing
  Stress is genuinely data-driven (rent burden ρ = 0.68, JCHS ρ = 0.70) beyond the multiplier
  (ρ = 0.66). So the degradation is specific to Food Insecurity, not systemic.

This is also an **operational finding**: the production poverty feed has silently gone dark,
quietly reducing Food Insecurity to a constant-per-region value. Restoring it is the single
highest-value fix and a prerequisite to any "live" claim for that index.

### 4.3 Remaining validation (next phase)

- **Temporal / lead–lag.** Begin retaining the daily index series so month-over-month changes
  can be tested against subsequently released BLS unemployment, [Eviction Lab](https://evictionlab.org/)
  filings, and SNAP-application data. This is what would substantiate the *nowcasting* claim.
- **Held-out housing.** Re-validate Housing Stress against an ACS cost-burden series *not* used
  in calibration (the current JCHS check is partly circular).
- **Case-study check.** For the largest state movements each release, identify a real event
  (WARN notices, disaster declarations) that plausibly explains them.

## 5. Limitations

- **"Nowcast," not "real-time."** Only the search-boost layer updates daily; structural
  inputs revise monthly/annually. The dashboard's "LIVE" framing overstates this and should
  be revised to "daily-refreshed nowcast." *(This change also belongs on the public page.)*
- **Heuristic weights.** See §3.3. Until estimated or validated, the composite is ordinal.
- **Live-layer dependence.** Validation (§4.2) showed the Food Insecurity index currently
  reduces to `base × regional multiplier` because its poverty input was unpopulated; its
  cross-sectional validity reflects the regional priors, not live data. The data feeds must
  be confirmed live before per-index "real-time" claims are made.
- **Search-signal drift and saturation.** Per the Google Flu lesson, term performance decays;
  the ontology needs periodic re-validation.
- **Ecological inference.** State-level signals do not describe individuals.
- **Causal attribution.** The Barometer measures correlation between conditions and distress
  signals, not causation.

## 6. Availability

- Dashboard: https://finmango.org/barometer.html
- Data (CSV/JSON), methodology, and code: MIT-licensed, https://github.com/finmango/research
- Suggested citation: FinMango Research Team. (2026). *Financial Health Barometer:
  Real-Time US Economic Stress Indicators* [Data set]. FinMango. https://finmango.org/barometer

## 7. Suggested venues (delete before posting)

- **Preprint (now):** SSRN (econ) or arXiv econ.GN — establishes priority, citable immediately.
- **Data descriptor:** *Nature Scientific Data* or *EPJ Data Science*; dataset on Harvard Dataverse.
- **Peer-reviewed (post-validation):** *International Journal of Forecasting*, *EPJ Data Science*, *PLOS ONE*.
- **Natural co-author / partner:** Harvard JCHS (already a data dependency); World Bank / IMF working-paper series.

## References

- Choi, H., & Varian, H. (2012). Predicting the present with Google Trends. *Economic Record*, 88, 2–9.
- Da, Z., Engelberg, J., & Gao, P. (2015). The sum of all FEARS investor sentiment and asset prices. *Review of Financial Studies*, 28(1), 1–32.
- Ettredge, M., Gerdes, J., & Karuga, G. (2005). Using web-based search data to predict macroeconomic statistics. *Communications of the ACM*, 48(11), 87–92.
- Baker, S. R., & Fradkin, A. (2017). The impact of unemployment insurance on job search: Evidence from Google search data. *Review of Economics and Statistics*, 99(5), 756–768.
- Lazer, D., Kennedy, R., King, G., & Vespignani, A. (2014). The parable of Google Flu: Traps in big data analysis. *Science*, 343(6176), 1203–1205.
- Joint Center for Housing Studies of Harvard University. (2025). *The State of the Nation's Housing 2025*.

---

*Financial Health Is A Right, Not A Privilege* | © 2026 FinMango | Open Source License (MIT)
