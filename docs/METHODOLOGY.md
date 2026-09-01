# Financial Health Barometer - Methodology

**Version 2.5** | Last Updated: September 2026

## Overview

The FinMango Financial Health Barometer is a US state-level indicator system that measures economic stress across four key dimensions: Financial Anxiety, Food Insecurity, Housing Stress, and Overall Affordability. The barometer combines real-time government data with authoritative academic research to provide a comprehensive view of household financial health.

## Data Sources

### Primary Data Sources (Real-Time APIs)

| Source | Data | Frequency | Notes |
|--------|------|-----------|-------|
| **Bureau of Labor Statistics (BLS)** | State unemployment rates | Monthly | No API key required; LAUS series |
| **FRED (St. Louis Fed)** | Housing Price Index (HPI) | Monthly | Requires free API key |
| **Census Bureau SAIPE** | Poverty rates by state | Annual | Small Area Income and Poverty Estimates |
| **Census Bureau ACS** | Rent burden (B25071) | Annual | Median gross rent as % of income |
| **HUD FMR API** | Fair Market Rents | Annual | 2-bedroom rent by state/county |

### Calibration Data Source (Academic Research)

| Source | Data | Frequency | Notes |
|--------|------|-----------|-------|
| **Harvard JCHS** | State-level cost burden data | Annual | "State of the Nation's Housing" report |

The Harvard Joint Center for Housing Studies data serves as an authoritative fallback and validation source when API data is unavailable.

## Indicator Methodology

### 1. Financial Anxiety Index

**Primary Driver:** Unemployment rate

**Formula:**
```
Base Score = 120
Anxiety Score = Base + (Unemployment Rate - 3.5%) × 18
Final Score = Anxiety Score × Regional Stress Multiplier
```

**Interpretation:**
- 80-100: Low anxiety (healthy employment conditions)
- 100-130: Moderate anxiety
- 130-160: High anxiety
- 160+: Crisis level

### 2. Food Insecurity Index

**Primary Driver:** Poverty rate

**Formula:**
```
Base Score = 85
Food Score = Base + (Poverty Rate - 10%) × 6
Final Score = Food Score × Regional Stress Multiplier
```

### 3. Housing Stress Index

**Primary Drivers:** Rent burden, Fair Market Rents, Housing Price Index

**Data Hierarchy:**
1. **Census ACS B25071** - Median gross rent as % of household income
2. **Harvard JCHS 2025** - Renter cost burden percentages (fallback)
3. **Tier-based estimates** - Historical averages (last resort)

**Formula:**
```
Rent Burden Score = (Median Rent Burden % - 25%) × 3
FMR Score = ((State FMR / National FMR) - 1) × 40
HPI Score = Annual Housing Price Change % × 2

Housing Stress = (100 + Rent Burden Score + FMR Score + HPI Score) × Regional Multiplier
```

**Cost Burden Definitions (Industry Standard):**
- **Cost-Burdened:** Households spending 30%+ of income on housing
- **Severely Cost-Burdened:** Households spending 50%+ of income on housing

### 4. Affordability Index

**Composite Score:**
```
Affordability = (Housing Stress × 0.60) + (Food Insecurity × 0.40)
```

## Regional Stress Multipliers

Regional multipliers are intended to account for persistent structural economic
differences that annual federal series are slow to capture:

| Region | States | Multiplier | Rationale |
|--------|--------|------------|-----------|
| Deep South | MS, LA, AL, AR, WV | 1.22-1.35 | Higher historical poverty |
| High-Cost Coastal | CA, NY, HI, FL, NJ | 1.05-1.20 | Housing affordability crisis |
| Industrial Midwest | MI, OH, IN, IL, MN | 1.04-1.12 | Mixed employment recovery |
| Mountain/Plains | WY, ND, SD, NE, IA | 0.85-0.95 | Lower cost of living |

### These are priors, not measurements

**This is the largest source of uncertainty in the Barometer and the most
important thing to understand before citing it.**

The multipliers are assigned by hand. They are not estimated from any dataset,
not fitted to any outcome, and have no standard error. Every published index
value is multiplied by its state's figure, and the effect on what readers see
is substantial:

- Removing them changes **42 of 51** Financial Anxiety ranks.
- **Mississippi moves 24 places.**
- The 0.85-1.35 range spans roughly **60 index points** on the 120 base,
  against roughly **72 points** for the entire national spread of actual state
  unemployment rates.

In other words, about half the state-to-state variation on the map comes from
this table rather than from the government data. State-to-state gaps should be
read as indicative, not as measured differences.

Every state's multiplier is published in `data/latest.json` under
`meta.regional_multipliers` and per state under
`metrics.regional_stress_multiplier`, so any reader can divide it back out and
reconstruct the unadjusted index.

**Changing a value in `REGIONAL_STRESS` silently reorders the public map.** Do
not edit one without updating the disclosure on `barometer.html` and the figures
above.

## Data Quality & Transparency

### Source Attribution

Each state's output includes source tracking:
- `rent_burden_source`: `census_acs` | `jchs_2025` | `tier_estimate`
- `fmr_score_source`: which input supplied the FMR term of the housing score
  (`hud_fmr` | `jchs_2025` | `tier_estimate`)
- `fair_market_rent_2br` / `fair_market_rent_source`: HUD Fair Market Rent only.
  Null when HUD is unreachable. This field previously fell back to the JCHS
  median rent while still labelling itself a Fair Market Rent, putting two
  different quantities under one name — they disagreed for all 51 states, by as
  much as $730 (California).
- `median_rent_2br` / `median_rent_source`: JCHS state median rent, now its own
  field rather than sharing the FMR one.
- `housing_price_change` / `housing_price_change_source`: FRED FHFA HPI year-over-year
  change, or null. A missing observation contributes nothing to the score; it is
  never replaced with a default.
- `regional_stress_multiplier`: the author-assigned prior applied to this state.
- `trends_boost`: the Health Trends reading per indicator, and whether it was
  `applied` to the index.
- `clamped`: present on an indicator whose value was cut off at an index bound.
- `estimated` / `carried_forward_from`: set when a value could not be computed
  from live data this run.

Run-level provenance lives in `meta.data_sources` and is rendered on the public
page under "What today's reading actually used", so a fallback or carried-forward
value is visible to readers rather than only present in the JSON.

### Missing data policy

The pipeline never substitutes a synthesized number for a measurement without
saying so, and it never drops a term from a composite when the last real
reading is still usable.

**Why dropping is not the safe default.** Housing Stress is
`100 + rentBurdenScore + fmrScore + hpiScore`. If FRED misses one state, letting
that term contribute nothing does not make the index "more cautious" — it
redefines the index for that one state while the other 50 keep all four terms.
The house-price term is worth 29 points on average (55 for West Virginia, 19% of
a typical score). Mississippi with FRED missing would read 144 instead of 182
and fall from 5th to 33rd: a phantom improvement caused entirely by an outage.
Because every input here is slow-moving relative to the daily run — house prices
quarterly, poverty, rent burden and FMR annual — reusing the last real
observation is close to lossless and far closer to the truth than either a
fabricated constant or a silently dropped term.

Precedence for every component:

1. **Live API value** — used and labelled with its source.
2. **Carried forward** — the last real measurement for that same series, within
   its age cap. Sits *above* the reference datasets: yesterday's actual ACS
   number beats today's JCHS approximation of it.
3. **Reference dataset** — Harvard JCHS 2025 or NLIHC OOR 2025.
4. **Tier estimate** — a hardcoded prior, flagged `tier_estimate`.
5. **Nothing** — the whole indicator is carried forward
   (`carried_forward_from`), or failing that estimated from regional baselines
   (`estimated: true`).

Two guards keep carry-forward honest:

- **Age caps**, set to roughly twice each source's real publication interval, so
  a value expires only when a genuine release has been missed. Staleness is
  measured from the original observation date (`*_observed`), preserved across
  repeated carries — otherwise each republish would reset the clock and a dead
  source would be carried forever, one day at a time.

  | Series | Cadence | Cap |
  |--------|---------|-----|
  | Unemployment (BLS LAUS) | Monthly | 90 days |
  | House prices (FRED HPI) | Quarterly | 180 days |
  | Rent burden (Census ACS) | Annual | 550 days |
  | Fair Market Rent (HUD) | Annual | 550 days |
  | Search trends (Health Trends) | Rotating | 10 days |

- **No laundering.** A value is only carried if it was itself a primary read.
  Without this check, a hardcoded tier estimate would reappear the next day
  labelled as a carried-forward ACS measurement.

**When a component does expire**, the term drops out and the indicator is marked
`partial: true` with a `partial_reason`. The public page raises a warning naming
the affected states, because a composite missing a term is not comparable with
the states that have all four. Run-level carry-forward detail is published in
`meta.carried_forward` and rendered in the provenance table.

There is deliberately no fallback data pipeline. The legacy
`scripts/calculate-indices.js` filled `change` fields with `Math.random()` and
carried no provenance metadata, so a failed real fetch could silently replace the
published dataset with invented movement figures. It is retired, gated behind an
explicit flag, and can no longer write to the live dashboard files. If the real
fetch fails, the previous dataset stands and the frontend surfaces a staleness
warning after 26 hours.

### JCHS Reference Fields

When Harvard JCHS data is used:
- `jchs_renters_cost_burdened`: % of renters paying 30%+ on housing
- `jchs_renters_severely_burdened`: % of renters paying 50%+ on housing
- `jchs_median_rent`: State median rent from JCHS report

## Index Scaling

Indices are relative measures of economic stress:

- **< 90 (Green):** Low Stress / Stable (Healthy Baseline)
- **90 - 120 (Yellow):** Moderate Stress
- **120 - 150 (Orange):** Elevated Stress - Warning Signs
- **> 150 (Red):** Crisis Level - Immediate Attention Needed

### Bounds and ties

Each index is clamped to a fixed range, published in `meta.index_bounds`:

| Indicator | Bounds |
|-----------|--------|
| Financial Anxiety | 80-200 |
| Food Insecurity | 55-160 |
| Housing Stress | 80-200 |
| Affordability | 80-200 |

A state sitting exactly at a bound has been cut off there and is **tied** with
any other state at that bound; the order printed between them is an artefact of
sort order, not a difference in the data. Clamped values carry a `clamped` field
(`ceiling` or `floor`).

### The bands are not comparable across indicators

The four indices are built from different inputs, on different base values (120,
85, 100), and are clamped to different ranges. A Housing Stress reading of 150
and a Food Insecurity reading of 150 do not represent the same severity. Compare
one indicator across states or over time — never two indicators against each
other.

**Affordability is not an independent measurement.** It is defined as
`0.60 × Housing Stress + 0.40 × Food Insecurity`, so it restates the two indices
beside it (r ≈ 0.90 with Housing Stress by construction) and cannot corroborate
them.

## Change Data

Only two indicators have a period-over-period change to report:

| Indicator | Change basis |
|-----------|--------------|
| Financial Anxiety | Year-over-year unemployment rate (BLS) |
| Housing Stress | Year-over-year FHFA house price index (FRED) |
| Food Insecurity | **None** — SAIPE poverty data is annual |
| Affordability | **None** — derived index, no independent series |

Indicators without a change series publish `change: null` and a `change_basis`
string explaining why. They previously published a hardcoded `0`, which the
dashboard rendered as a red "▲ 0.0%" — displaying a rise where nothing had been
measured. A national change of exactly zero now reports `trend: "flat"`, and an
absent one reports `trend: null`.

## Search Trends Layer

The Google Health Trends API returns absolute probabilities
(P(term | time, geo) × 10,000,000), not the relative 0-100 scale of the public
Google Trends site. One representative term is queried per indicator:

| Indicator | Term |
|-----------|------|
| Financial Anxiety | "debt help" |
| Food Insecurity | "food stamps" |
| Housing Stress | "eviction help" |
| Affordability | "cost of living" |

**Rotating fetch.** The quota allows roughly 40 requests per run, far short of
the 51 states × 4 indicators a full sweep needs. The fetch previously covered a
hardcoded list of 10 states, which handed those 10 a volatility boost the other
41 could never receive and quietly moved them up the rankings. It now advances a
cursor through all 51 states (9 per run), caching each reading with the date it
was fetched in `meta.trends_cache`, reaching full coverage in six days and
refreshing on a rolling basis. Readings older than 10 days are dropped. The
cursor only advances when a slice completes, so a quota-truncated run retries the
same states rather than leaving a permanent hole.

**Coverage gate.** The boost is added to an indicator only once every state has a
current reading (`meta.trends_coverage[indicator].complete`). Until then the
readings are published but not applied, so no state ranks higher merely because
the rotation reached it first.

**The trend chart is not index history.** The index is computed daily and has
never been back-calculated for past months. The chart shows the shape of search
interest in the single term above, rescaled so its most recent month equals
today's composite index, then smoothed with a 3-month trailing average. Only the
final point is an actual index value.

## Update Frequency

The pipeline runs daily, but its inputs do not. Most days, most numbers are
unchanged — the Barometer summarises official statistics in near-real-time, it
cannot see ahead of their release schedule.

- **Daily:** pipeline run; rotating slice of the search-trends layer
- **Monthly:** unemployment (BLS LAUS)
- **Quarterly:** house prices (FRED FHFA HPI)
- **Annual:** poverty (SAIPE), rent burden (ACS), FMR (HUD), JCHS calibration

Annual federal sources also run one to two years behind the period they
describe, so a poverty-driven reading today reflects a prior year's conditions.

## References

### Government Data Sources
- Bureau of Labor Statistics: https://www.bls.gov/lau/
- FRED Economic Data: https://fred.stlouisfed.org/
- Census Bureau SAIPE: https://www.census.gov/programs-surveys/saipe.html
- Census Bureau ACS: https://www.census.gov/programs-surveys/acs
- HUD FMR: https://www.huduser.gov/portal/datasets/fmr.html

### Academic Sources
- Harvard JCHS: https://www.jchs.harvard.edu/state-nations-housing-2025
- "The State of the Nation's Housing 2025" - Joint Center for Housing Studies of Harvard University

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.5 | Sep 2026 | Accuracy and transparency pass: replaced the fabricated 5% HPI default with age-capped component carry-forward; split the mislabelled FMR/median-rent field; replaced hardcoded `change: 0` with null plus `change_basis`; rotating trends fetch across all 51 states with a coverage gate; published regional multipliers, index bounds, clamp flags and per-run provenance; retired the `Math.random()` legacy pipeline; added regression tests |
| 2.4 | Dec 2024 | Added Harvard JCHS 2025 as calibration source; source attribution |
| 2.3 | Dec 2024 | Added HUD FMR and Census ACS rent burden |
| 2.2 | Dec 2024 | Added regional stress multipliers |
| 2.1 | Dec 2024 | Initial real data integration |
| 2.0 | Nov 2024 | Refactored to use government APIs |

---

*Financial Health Is A Right, Not A Privilege* | © 2025 FinMango
