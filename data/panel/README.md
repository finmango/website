# State-Month Panel — data dictionary & build instructions

`state_month_panel.csv` is the **scaffold** for the Path B nowcasting study
(`docs/PATH_B_PAPER_DRAFT.md`). It has one row per **(state, month)** across the
post-2022 Google Health Trends regime (51 states/DC × 54 months, 2022-01 → 2026-06).
Keys and one cross-sectional anchor are filled; every other column is **blank by design**
and must be filled from the sources below. Regenerate with `python3 docs/build_panel.py`.

> **Why this shape?** The study asks whether real-time *search* predicts household distress
> **before** the official figure is released. That can only be tested across many state-months:
> hide each cell's target, predict it from search + already-released data, check against truth,
> repeat. See `docs/PATH_B_PAPER_DRAFT.md` §4.

## The golden rule: no leakage
Every feature must use **only information available at nowcast time**. When predicting a given
`(state, month)`, do not use any value that was published *after* that month's target was known.
Stamp each source with its real release date and lag accordingly.

## Columns

### Keys (filled)
| column | meaning |
|---|---|
| `state`, `abbr` | state name / USPS abbreviation |
| `date` | first of month (`YYYY-MM-01`) |
| `year`, `month` | convenience splits |

### Targets — independent ground truth to nowcast (BLANK)
| column | source | cadence | notes |
|---|---|---|---|
| `pulse_difficulty_expenses_pct` | Census **Household Pulse Survey** — "difficulty paying usual household expenses" | biweekly → aggregate to month | primary financial-distress target |
| `pulse_food_insufficient_pct` | Household Pulse — food-sufficiency item | biweekly → month | food target |
| `pulse_behind_on_housing_pct` | Household Pulse — behind on rent/mortgage | biweekly → month | housing target |

Household Pulse tables: https://www.census.gov/programs-surveys/household-pulse-survey/data.html
(state-level, downloadable per week; also a Public Use File for custom tabulation).

### Search treatment — Google Health Trends, ABSOLUTE probabilities (BLANK)
| column | source | cadence | notes |
|---|---|---|---|
| `ght_financial_abs` | GHT-API, distress term set (e.g. "unemployment benefits", "can't pay rent") | monthly, by state | P(term)×10⁷ |
| `ght_food_abs` | GHT-API, food term set ("food bank", "SNAP application") | monthly, by state | |
| `ght_housing_abs` | GHT-API, housing term set ("eviction help", "rental assistance") | monthly, by state | |

Restricted/application-gated API. **Fix the term lists in advance** (preregister) and include
placebo terms. Restrict to post-2022-01 because of the documented Jan-2022 sampling break.

### Search benchmark — public RELATIVE Google Trends 0–100 (BLANK)
`gt_financial_rel`, `gt_food_rel`, `gt_housing_rel` — same terms, from the free public Google
Trends, monthly by state. Lets us test whether the absolute-probability API beats what anyone
can get for free (paper hypothesis H2).

### Official-input baseline — lagged, as-released (BLANK)
| column | source | cadence | notes |
|---|---|---|---|
| `unemployment_rate` | BLS **LAUS** | monthly, state | the baseline to beat |
| `ui_initial_claims` | DOL / state UI | weekly → month | high-frequency distress input |
| `poverty_rate` | Census **SAIPE** | annual | carry forward within year (as-released) |
| `rent_burden_pct` | Census **ACS** B25071 | annual | carry forward within year |
| `hpi_change` | **FRED** FHFA HPI | quarterly | carry forward within quarter |

### Reference anchor (filled)
| column | source | notes |
|---|---|---|
| `usda_food_insecurity_3yr_avg` | USDA CPS-FSS 2022–24 (`data/external/usda_food_insecurity_state.csv`) | cross-sectional (one value per state); annual/3-yr — **not** a monthly series. Use for cross-sectional validation, not as a monthly target. |

## Fill order (suggested)
1. **Targets** — pull Household Pulse first (defines what we're predicting).
2. **Search** — GHT-API absolute + public relative for the same terms.
3. **Official inputs** — historical monthly/annual releases, properly lagged.
4. Validate the join (no missing months, leakage audit), then run the §6 analysis.
