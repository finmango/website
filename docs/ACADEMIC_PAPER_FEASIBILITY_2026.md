# Can the Financial Health Barometer Become an Academic Paper?

**A feasibility assessment and research roadmap**
Prepared June 2026 · Source artifact: `barometer.html` + `data/dashboard-data.js` (v2.4)

---

## Verdict

**Yes — but not as a "here is our index" submission.** As it stands the Barometer is
strong *data infrastructure* and sits on a genuinely interesting *signal* (restricted-access
Google Health Trends). It is **not yet** a defensible research object, because the headline
indices are heuristic (hand-chosen weights, no external validation) and the historical series
is back-fit. The path to publication is mostly about **reframing the contribution** around the
search signal and **adding a validation layer** — not rebuilding the tool.

**Recommended sequence:** ship a *data/tool descriptor* now (low friction, citeable), and build
toward a *nowcasting + validation* study, which is where the real intellectual contribution and
the headline live.

---

## 1. What the dataset actually contains (inventory)

Grounded in `data/dashboard-data.js` (generated 2026-06-16, v2.4):

| Element | Detail |
|---|---|
| Composite indices | 4 — Financial Anxiety, Food Insecurity, Housing Stress, Affordability (0–200 "Heuristic Stress Model") |
| Geographic coverage | 50 states + DC (51 units) |
| Per-state raw drivers | unemployment (BLS LAUS), poverty (Census SAIPE), rent burden (ACS B25071), fair-market rent (HUD/NLIHC), house-price change (FRED HPI), regional multiplier, Harvard JCHS calibration |
| Time series | **National only**, monthly, **2016-07 → 2026-06** (120 months × 4 indicators) |
| Search input | Google Health Trends API — *absolute* search probabilities (P(term)×10⁷), capped +0–10 pt "boost" |
| License | MIT, open data; CSV/JSON export already built into the page |

**Implication:** the cross-section (state × today) is rich; the panel (state × time) does **not
exist yet** in the published data — only national history is shipped. The raw inputs needed to
build a real state panel do exist upstream (BLS/Census/FRED are all state-level), so the panel is
*assemblable*, not *present*.

---

## 2. Evidence from the current data

Computed directly from the shipped dataset (`docs/barometer_exploratory_analysis.py`,
n = 51 units; derived table in `data/barometer_state_cross_section.csv`). These are the numbers a
reviewer would compute on day one — better that we see them first.

**Cross-state correlation, composite vs. its named driver** (Pearson):

| Composite | vs. its primary driver | r |
|---|---|---|
| Financial Anxiety | Unemployment rate | **0.86** |
| Food Insecurity | Poverty rate | **0.96** |
| Housing Stress | Rent burden % | **0.75** |
| Affordability | (blend of housing + food) | — |

This is internal consistency *by construction* — the indices are deterministic functions of their
inputs. Useful for a descriptor, but it means the index adds no information beyond its inputs
**until** it is validated against an external target (see §4).

**The regional multiplier is doing too much work.** The hand-assigned
`regional_stress_multiplier` (range 0.85–1.35) correlates with the composites at:

| Composite | r with regional multiplier |
|---|---|
| Food Insecurity | **0.91** |
| Affordability | **0.87** |
| Financial Anxiety | 0.77 |
| Housing Stress | 0.63 |

A reviewer will read this as: *a subjective, unestimated parameter is the single largest driver of
cross-state variation.* This must be justified, estimated, or removed.

**National time series — two things to reconcile before publication:**

- **Scale mismatch.** The Financial Anxiety *history* averages 57.2 (range 32–158), but the
  *current* national/cross-section value is ~140. The methodology text says "the most recent month
  equals today's composite," yet the last history point (158) ≠ today's value (140.8). The back-cast
  series and the headline index are **not on the same scale**.
- **Bound violation.** The Food Insecurity history reaches **221**, exceeding the stated 0–200 range.

**Structural note (a genuine finding):** in the national series, Food Insecurity is essentially
*uncorrelated* with the other three (r ≈ −0.01 to 0.14), while Financial Anxiety, Housing Stress and
Affordability co-move tightly (r = 0.83–0.89). Food Insecurity is also ~3× more volatile
month-to-month (σ of deltas 14.9 vs ~4–5). That divergence is interesting and worth explaining — but
it also hints the four series are built from different scaffolding.

---

## 3. Three publication paths

| Path | What it is | Effort | Target venues |
|---|---|---|---|
| **A. Data / tool descriptor** | Document the open pipeline, sources, access, and the live tool. Heuristic index is fine if labeled. | **Low** — mostly writing | *Journal of Open Source Software*, *Data in Brief*, *SoftwareX*, *Scientific Data* |
| **B. Nowcasting + validation** ⭐ | Does the absolute-probability Health Trends signal nowcast state financial distress vs. validated targets, beating standard relative Google Trends? | **Medium** | *PLOS ONE*, *JMIR/JMIR Public Health* (infodemiology), *Economics Letters*, regional Fed working-paper series |
| **C. Re-derived, validated index** | Replace hand-picked weights with estimated weights (PCA/factor or supervised), report out-of-sample validation. | **High** | *Social Indicators Research*, *Journal of Economic & Social Measurement*, policy/health-economics journals |

**Recommendation: B, with A shipped first as a quick win.** Path B leverages the one asset nobody
else combines this way — restricted-access health-trends search at U.S. state granularity, fused with
official statistics — and slots into an established, citeable literature (§7).

---

## 4. The hard problems reviewers will raise (and the fix for each)

1. **Heuristic weights.** Constants (base 120/85/100, ×18, ×6, 10-pt cap) are asserted, not
   estimated. → *Fix:* estimate weights (PCA/factor analysis) or fit against a validated target;
   report sensitivity to the choice.
2. **Dominant subjective multiplier** (§2). → *Fix:* derive it from observables (cost of living,
   structural poverty) or drop it and let the data speak.
3. **No external validation / construct validity.** An index called "Financial Anxiety" must track
   something measured. → *Fix:* validate against **candidate ground-truth targets**:
   - *Financial anxiety:* Census **Household Pulse Survey** (difficulty paying usual expenses);
     NY Fed **Survey of Consumer Expectations**; UMich Survey of Consumers.
   - *Food insecurity:* **USDA ERS** Household Food Security; Household Pulse food-sufficiency item.
   - *Housing stress:* ACS cost-burden; Princeton **Eviction Lab** filings.
4. **Back-fit history.** The series is scaled to the present, so it can't support causal/time-series
   claims as-is. → *Fix:* archive the *raw* GHT pulls going forward and rebuild an honest,
   non-rescaled series; treat pre-collection history as illustrative only.
5. **The Google Health Trends 2022-01-01 discontinuity.** Google changed GHT-API sampling on
   2022-01-01; values before/after are **not directly comparable** (Stojanović et al. / "Infodemiologists
   Beware," §7). This break sits in the *middle* of the 2016–2026 series. → *Fix:* segment the series at
   the break, or restrict modeling to the post-2022 regime; disclose explicitly.
6. **"Exclusive access" claim.** The GHT-API is **restricted/application-gated**, not exclusive to
   FinMango — epidemiology groups use it widely. → *Fix:* drop "exclusive"; the real differentiator is
   the *application domain* (state-level household financial distress) and the *fusion* with official
   data, not access.

---

## 5. Recommended paper — outline + draft abstract

**Working title:** *Nowcasting Household Financial Distress Across U.S. States with
Restricted-Access Google Health Trends Data*

**Draft abstract (~200 words):**
> Official measures of household financial distress — food insecurity, housing cost burden,
> employment anxiety — are released with substantial lag and limited geographic granularity,
> constraining timely policy response. We assess whether internet-search signals from the
> restricted-access Google Health Trends API, which returns absolute search probabilities rather
> than the relative 0–100 series of the public Google Trends, can nowcast state-level household
> financial distress in the United States. Using monthly data for all 50 states and DC, we link
> search activity for distress-related terms to validated targets — the Census Household Pulse
> Survey, USDA food-security statistics, and BLS/Census economic releases — and benchmark
> absolute-probability signals against conventional relative Google Trends. We address the
> January 2022 change in Health Trends sampling by modeling the post-change regime separately and
> report out-of-sample nowcast accuracy with rolling-origin validation. [Results to follow.] We
> release the full pipeline, daily-updated indicators, and state-level export as an open resource.
> The findings inform whether search-based nowcasting can give policymakers a real-time,
> geographically resolved early-warning signal for household financial stress.

**Section outline:**
1. Introduction — lag/granularity gap in distress measurement; search-nowcasting opportunity.
2. Related work — Google Trends nowcasting; Health Trends in epidemiology; search-based economic indices (§7).
3. Data — GHT-API (absolute probabilities; 2022 break), official targets, the FinMango pipeline.
4. Methods — term selection; rolling-origin nowcast; absolute-vs-relative benchmark; regime split.
5. Validation — convergent validity vs. Household Pulse / USDA / BLS; out-of-sample error.
6. Results, Robustness (placebo terms, leakage checks, COVID-period sensitivity), Limitations.
7. Open-data/reproducibility statement.

---

## 6. Reproducible analysis plan

- **Assemble the state panel** (the missing piece): monthly state series for unemployment (LAUS),
  poverty/SAIPE, ACS cost burden, HPI, + raw GHT pulls per state. Store *raw, unscaled* values.
- **Lock validation targets** from Household Pulse (state, biweekly), USDA ERS, BLS/Census.
- **Benchmark:** absolute-probability GHT vs. relative public Google Trends on identical terms.
- **Model:** rolling-origin (expanding-window) nowcasts; report MAE/RMSE vs. a no-search baseline;
  segment at 2022-01-01.
- **Robustness:** placebo/unrelated search terms; COVID-window sensitivity; leakage audit (no
  target information in features); multiple-comparison discipline on term selection.
- **Reproducibility:** the repo already exports CSV/JSON and is MIT-licensed; add the raw-pull
  archive and the analysis scripts.

A first, fully-grounded exploratory pass over the *shipped* data is included at
`docs/barometer_exploratory_analysis.py` (regenerates the tables in §2 and the cross-section CSV).

---

## 7. Verified references

Nowcasting with search data:
- Choi, H. & Varian, H. (2012). *Predicting the Present with Google Trends.* **Economic Record** 88:2–9.
  https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1475-4932.2012.00809.x · PDF: https://people.ischool.berkeley.edu/~hal/Papers/2011/ptp.pdf
- Varian, H. (2023). *Nowcasting with Google Trends.* **Economic Record.**
  https://onlinelibrary.wiley.com/doi/10.1111/1475-4932.12783
- *Nowcasting of the U.S. unemployment rate using Google Trends.* ScienceDirect.
  https://www.sciencedirect.com/science/article/abs/pii/S1544612319301072
- *Forecasting unemployment insurance claims in realtime with Google Trends.* Int. J. Forecasting.
  https://www.sciencedirect.com/science/article/abs/pii/S0169207021000649
- *Nowcasting unemployment insurance claims in the time of COVID-19* (state-panel). PMC.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC8846950/
- Federal Reserve Bank of Chicago — *Initial UI Claims and Google Trends in the Post-Pandemic Era.*
  https://www.chicagofed.org/publications/blogs/chicago-fed-insights/2023/ui-claims-google-trends

Google Health Trends API (the signal + its caveats):
- *Harnessing Google Health Trends Data for Epidemiologic Research.* **Am. J. Epidemiology** (2023) — describes the scaled-probability API.
  https://academic.oup.com/aje/article-abstract/192/3/430/6747668
- *Infodemiologists Beware: Recent Changes to the Google Health Trends API Result in Incomparable Data as of 1 January 2022.* **IJERPH** — documents the 2022 break.
  https://www.mdpi.com/1660-4601/19/22/15396 · https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9692853/

Search/text-based indices as legitimized research objects (precedent):
- Baker, Bloom & Davis — **Economic Policy Uncertainty Index.** https://www.policyuncertainty.com/us_monthly.html · FRED: https://fred.stlouisfed.org/series/USEPUINDXD
- Federal Reserve Bank of Philadelphia — **The Anxious Index.** https://www.philadelphiafed.org/surveys-and-data/real-time-data-research/anxious-index

*Candidate validation targets (well-established U.S. data products):* Census Household Pulse Survey;
USDA ERS Household Food Security; NY Fed Survey of Consumer Expectations; Princeton Eviction Lab.

---

## 8. Next actions

- [ ] Decide path: **A now + B as the flagship** (recommended).
- [ ] Reconcile the §2 data issues (scale mismatch, 0–200 bound, 2022 break) — these are quick wins
      that also harden the live tool.
- [ ] Stand up the **raw GHT pull archive** so an honest panel accrues from today forward.
- [ ] Pull one validation target (Household Pulse is easiest) and run a first convergent-validity check.
- [ ] If validation holds, draft Path B for an infodemiology venue (JMIR Public Health / PLOS ONE).

*Note: FinMango's research artifacts live at github.com/finmango/research; this roadmap may be a
better fit there than in the website repo — moved here because it is the repo in scope.*
