# Measuring AI's Economic Impact on Household Financial Health

**A FinMango Positioning Brief**

**Prepared by:** FinMango Research Team
**Date:** May 2026
**Companion to:** Financial Health Barometer Methodology v2.4 (Dec 2025)

---

## Executive Summary

The economic transition driven by artificial intelligence will not first appear in GDP, productivity statistics, or even the official unemployment rate. It will appear in household balance sheets — in rent that goes unpaid, in retraining searched at 2 a.m., in food-bank traffic in metros where a single occupation cluster has lost its footing. By the time the Bureau of Labor Statistics confirms the shift in its quarterly release, the affected households have already absorbed months of stress.

FinMango operates the **Financial Health Barometer**, a state-level signal infrastructure that fuses authoritative government data (BLS, Census, HUD), real-time behavioral signals (Google Health Trends), and academic calibration (Harvard JCHS). Since 2024 it has tracked four dimensions of household financial stress — Financial Anxiety, Food Insecurity, Housing Stress, and Affordability — at a cadence ranging from daily to annual depending on the input.

This brief proposes a focused extension of that infrastructure to produce the **first real-time, household-level signal of AI-driven economic disruption in the United States**. We outline:

1. The measurement gap that current labor-market statistics leave open;
2. Four concrete extensions to the existing Barometer — an O\*NET-anchored AI-exposure layer, an AI-distress search ontology, a layoff cross-reference, and an industry × state signal cube;
3. A 12-month roadmap to operational outputs, validation, and public release.

The goal is to give policymakers, researchers, and grantmakers the kind of telemetry the OpenAI Foundation called for in *Economic Futures in the Age of AI* (May 2026): "measurement infrastructure that can detect distributional shifts as they happen, not after they have hardened into political crises."

---

## 1. The Measurement Gap

Three categories of statistics dominate the current view of AI's economic impact, and each has a structural limitation.

**Labor-market statistics (BLS LAUS, CPS, OEWS, JOLTS).** Authoritative and methodologically rigorous, but lagging by weeks to quarters. Occupation-level employment data is published annually. State-level unemployment is monthly, but moves only after layoffs are realized — not when households first sense exposure.

**AI-exposure indices (Felten et al. 2021; Eloundou et al. 2023 "GPTs are GPTs"; Brynjolfsson et al. 2023).** Excellent for ranking *which* occupations are exposed to AI substitution or augmentation, but silent on *whether and where* exposure has translated into financial stress. They are static maps, not flowing signals.

**Macro indicators (CPI, GDP, productivity).** Too aggregated. A 0.4-point national productivity bump can co-exist with severe localized displacement in administrative-support occupations in three Midwestern metros, and the macro signal will not surface it.

The missing layer is a **household-stress signal stratified by AI exposure** — one that asks not "is AI changing the economy?" but "are the workers most exposed to AI showing measurable financial distress, where, and how fast?"

FinMango's existing Barometer is uniquely positioned to fill that gap because it already operates at the intersection of structural government data and real-time behavioral signal. Adding an AI-exposure axis is an extension of an existing pipeline, not a new program.

---

## 2. Foundation: The Barometer Today

For context, the Barometer (v2.4, December 2025) measures four indices at US state level:

| Index | Primary Government Input | Behavioral Signal | Calibration |
|---|---|---|---|
| Financial Anxiety | BLS LAUS unemployment | Google Trends: "debt help", "bankruptcy" | — |
| Food Insecurity | Census SAIPE poverty rate | Google Trends: "food bank near me" | — |
| Housing Stress | Census ACS B25071, HUD FMR | Google Trends: "eviction help" | Harvard JCHS 2025 |
| Affordability | Composite | — | — |

Indices are scaled 80–200 with structural regional multipliers and published as state-level scores with full source attribution (`rent_burden_source`, `fmr_source`, etc.). The pipeline runs daily for unemployment, monthly for housing prices, and annually for structural inputs.

The extensions proposed below sit on top of this pipeline. Nothing in the existing methodology changes.

---

## 3. The AI Extension: Four Components

### 3.1 An O\*NET-Anchored AI-Exposure Layer

We propose constructing a state-level **AI Exposure Score** by combining occupational AI-exposure indices from the academic literature with BLS OEWS employment shares.

**Method.**

1. **Score occupations.** For each SOC-coded occupation, compute a composite AI-exposure score from three published indices:
   - *AIOE* (Felten, Raj, Seamans 2021) — occupational exposure to AI capabilities
   - *GPT exposure* (Eloundou et al. 2023) — task-level LLM exposure
   - *Brynjolfsson SML* (suitability-for-machine-learning), where available

   Composite via z-score normalization and equal weighting (sensitivity tested with alternative weightings).

2. **Map to states.** Use BLS OEWS state-level employment by SOC code to compute an employment-weighted state AI-exposure score:

   ```
   AIExposure_state = Σ_occ (employment_share_state,occ × ExposureScore_occ)
   ```

3. **Publish at two granularities:** an aggregate state score and a state × occupation-cluster matrix (e.g., "AI-exposed administrative support workers in Ohio").

**Why this works.** O\*NET task descriptions are public, occupation-level exposure indices are peer-reviewed, and OEWS employment shares are released annually by state and metro. No proprietary data is required, and the entire pipeline is reproducible.

**Output cadence.** Annual (limited by OEWS release). Occupational exposure scores are static between literature updates.

### 3.2 An AI-Displacement Search Ontology

We propose extending the existing Google Trends search ontology with a fifth signal category targeting AI-displacement distress.

**Candidate terms** (to be tested for signal-to-noise prior to inclusion):

- *Displacement awareness:* `"will AI take my job"`, `"AI replaced me"`, `"job to AI"`
- *Reskilling intent:* `"reskill from [occupation]"`, `"career change at 40"`, `"learn to code 2026"`
- *Acute distress:* `"laid off tech"`, `"severance negotiation"`, `"unemployment after layoff"`
- *Adaptation:* `"use ChatGPT at work"`, `"AI tools for [occupation]"` — *augmentation, not displacement; tracked separately*

**Method.** Same Google Health Trends API pipeline as the existing Barometer. Each term is normalized against a baseline search volume to control for general AI interest (a "Will AI take my job" spike that scales with overall ChatGPT search traffic is noise; one that diverges from it is signal).

**Validation.** Compare term spikes against announced layoffs (see 3.3) and against AI-exposure scores by state. A high-quality signal should correlate with both.

### 3.3 Layoff and JOLTS Cross-Reference

We propose ingesting two additional structural data sources to ground the search signal in realized labor events:

- **WARN Act notices** (state-level mandatory layoff disclosures, ≥50 or 100 employees depending on state) — manually compiled by labor-market trackers; some states publish APIs.
- **BLS JOLTS** (Job Openings and Labor Turnover Survey) at the industry level, monthly.

**Method.** For each layoff event, code the affected occupations using SOC codes and compute an exposure-weighted layoff intensity by state and quarter:

```
AILayoffIntensity_state,q = Σ_event (workers × ExposureScore_occ) / labor_force_state
```

This lets us distinguish a 500-person warehouse layoff (low AI exposure) from a 500-person paralegal or customer-service layoff (high AI exposure) — they look identical in standard layoff statistics but mean very different things for an AI-impact measurement.

### 3.4 An Industry × State Signal Cube

The existing Barometer is one-dimensional: state. The proposed extension publishes results along **two dimensions**: state and occupation cluster.

We propose six occupation clusters chosen for AI-exposure heterogeneity:

1. Office and administrative support (SOC 43-xxxx) — high exposure
2. Computer and mathematical (SOC 15-xxxx) — mixed exposure, high augmentation
3. Healthcare practitioner (SOC 29-xxxx) — low–moderate exposure
4. Production (SOC 51-xxxx) — moderate exposure
5. Transportation and material moving (SOC 53-xxxx) — moderate (autonomous systems)
6. Education, training, and library (SOC 25-xxxx) — moderate (AI-tutor substitution)

The cube enables outputs like:

> *"Financial Anxiety Index for SOC 43 (administrative support) in Ohio rose 18 points between Q1 and Q2 2026, against a state aggregate change of +4. AI-exposed occupations are driving 80% of the state's anxiety increase."*

This is the kind of statement no existing public data product can produce on a monthly cadence.

---

## 4. Proposed Outputs

The extension would produce three public artifacts:

**1. AI Economic Impact Dashboard.** A public web interface on `finmango.org` showing the state × occupation cube, updated monthly. Free, no login. Existing Barometer infrastructure is reused.

**2. Quarterly AI Impact Brief.** A short (8–12 page) data release describing what the prior quarter's signals showed, with state-level vignettes. Distributed to research partners (World Bank, IMF, Google Health, OpenAI Foundation as relevant) and the press.

**3. Open data + API.** State × occupation × month signal time series released as CSV and via a REST API under a permissive license (MIT, consistent with existing FinMango open-source posture). Methodology documentation hosted alongside.

---

## 5. Validation Plan

Three validation strategies, each independently sufficient:

**Concurrent validation against realized outcomes.** Quarterly comparison of state × occupation signal levels against subsequently released BLS unemployment-by-occupation data. A high-quality signal should lead realized unemployment by 1–3 months in high-exposure occupations.

**Cross-validation against academic exposure indices.** State aggregate AI-exposure scores should correlate strongly with independently constructed academic measures (e.g., Acemoglu/Restrepo regional exposure work). Divergence flags methodology issues.

**Case-study validation.** For each release, identify the top three state × occupation cells by signal change and verify via news search and WARN notices that real events plausibly explain the movement. Misaligned signals trigger ontology review.

All validation results are published alongside the data, consistent with the existing Barometer's source-attribution practice.

---

## 6. Why FinMango

FinMango is a 501(c)(3) nonprofit with three properties relevant to this work:

- **Operational measurement infrastructure.** The Barometer is not a proposal; it is a running pipeline with daily/monthly/annual data ingestion, source-attribution, and public release. The AI extension reuses this pipeline.
- **Validated by institutional partners.** Existing research partnerships with the World Bank, IMF, WHO, and Google Health provide external validation of methodology and create natural distribution channels for AI-impact outputs.
- **Open by default.** Methodology, data, and code are public under MIT license. There is no proprietary lock-in for downstream researchers or funders — a posture consistent with the OpenAI Foundation's stated goal of "concrete institutional options that can be tested, governed, revised, and scaled."

FinMango does not propose to design post-AI economic systems, model UBI, or advocate specific policies. The proposed role is narrower and complementary to the broader OpenAI Foundation program: **be the measurement layer**.

---

## 7. Roadmap

| Phase | Months | Deliverable |
|---|---|---|
| 1. Exposure layer construction | 0–2 | O\*NET + AIOE/GPT-exposure composite; state-level scores published |
| 2. Search ontology extension | 1–3 | AI-displacement term set tested and added to Barometer pipeline |
| 3. Layoff/JOLTS integration | 2–4 | WARN + JOLTS ingestion live; AI-weighted layoff intensity computed |
| 4. Industry × state cube launch | 3–6 | Public dashboard live; first monthly data release |
| 5. Validation studies | 4–9 | Concurrent + cross-validation results published |
| 6. First Quarterly AI Impact Brief | 6 | Public release; partner distribution |
| 7. Open API + dataset release | 9–12 | Full programmatic access; methodology v3.0 frozen |

---

## 8. Open Questions

A short and honest list, included because every methodology paper should have one:

1. **Augmentation vs. substitution separation.** AI tools that *augment* knowledge workers may raise their productivity (and earnings) before any displacement appears. The search ontology must distinguish these, and we do not yet have a clean test for that distinction.
2. **Search-signal saturation.** Generic AI search interest is rising fast enough that displacement-specific signals risk drowning in baseline noise. Normalization strategy (Section 3.2) is our best current answer but needs empirical testing.
3. **Geographic resolution.** OEWS data supports MSA-level analysis in many states; whether to publish at MSA rather than state is a downstream decision that depends on validation results.
4. **Causal attribution.** This methodology measures *correlation* between AI exposure and financial stress. Establishing AI as the *cause* of observed stress is a different research program. We are explicit about this limit in all outputs.

---

## References

### AI Exposure Literature
- Felten, E., Raj, M., & Seamans, R. (2021). *Occupational, industry, and geographic exposure to artificial intelligence.* Strategic Management Journal.
- Eloundou, T., Manning, S., Mishkin, P., & Rock, D. (2023). *GPTs are GPTs: An early look at the labor market impact potential of large language models.* OpenAI / arXiv:2303.10130.
- Brynjolfsson, E., Mitchell, T., & Rock, D. (2018). *What can machines learn, and what does it mean for occupations and the economy?* AEA Papers and Proceedings.
- Acemoglu, D., & Restrepo, P. (2020). *Robots and jobs: Evidence from US labor markets.* Journal of Political Economy.

### Data Sources (Proposed Additions)
- O\*NET: https://www.onetonline.org/
- BLS Occupational Employment and Wage Statistics (OEWS): https://www.bls.gov/oes/
- BLS Job Openings and Labor Turnover Survey (JOLTS): https://www.bls.gov/jlt/
- WARN Act state notices (varies by state)

### FinMango Foundation
- FinMango Financial Health Barometer Methodology v2.4 (Dec 2025)
- FinMango Financial Health Barometer Whitepaper 2025

### Policy Context
- OpenAI Foundation, *Economic Futures in the Age of AI* (May 2026)

---

*Financial Health Is A Right, Not A Privilege* | © 2026 FinMango | Open Source License (MIT)
