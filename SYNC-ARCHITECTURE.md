# Barometer ↔ Policy Lab Sync Architecture

Reference doc for how `barometer.html` and `housing-policy-lab.html` share state-level data.

## Principle

**`data/dashboard-data.js` is the single source of truth.** Every state-level stat surfaced by either tool reads from that file. The pipeline that generates it runs against the primary sources (BLS, Census, HUD, FRED, NLIHC). Neither HTML file should carry its own copy of state data for anything except offline fallback.

## Data flow

```
  Primary sources                 Pipeline                       Frontend
  ───────────────────────────     ─────────────────────────      ──────────────────
  BLS LAUS (unemployment)         scripts/build_dashboard.py     barometer.html
  Census ACS B25071 / B25070  ──► (nightly cron or GHA)      ──► housing-policy-lab.html
  HUD FMR API                     writes to:                     (and any future tool)
  Census SAIPE                    data/dashboard-data.js
  FRED FHFA HPI
  Google Health Trends API
  Harvard JCHS (annual)
  NLIHC Out of Reach (annual)
```

Both HTML pages load `data/dashboard-data.js` via `<script>` tag, which sets a global `DASHBOARD_DATA` variable. Page-specific JS reads from that global.

## Expected shape of `DASHBOARD_DATA`

```js
const DASHBOARD_DATA = {
  last_updated: '2026-04-17T00:00:00Z',
  national: { /* aggregates */ },
  states: {
    'US-CA': {
      // Stress indices (0–200 scale, per Barometer methodology)
      housing_stress:    { value: 181, change: +2.1, rank: 1 },
      financial_anxiety: { value: 145, change: -0.4, rank: 8 },
      food_insecurity:   { value: 122, change: +1.1, rank: 12 },
      affordability:     { value: 164, change: +0.8, rank: 3 },

      // Raw housing inputs — needed by Policy Lab top-line stats
      rent_burden:  { value: 38.2, source: 'ACS B25071 2023' },  // median rent-to-income ratio %
      fmr_2br:      { value: 2580, source: 'HUD FY2025' },       // monthly, USD
      housing_wage: { value: 49.61, source: 'NLIHC OOR 2025' }   // hourly, USD

      // ... other raw inputs the Barometer formulas need
    },
    // ... 50 more states + DC
  }
};
```

State keys use the `US-XX` ISO 3166-2 convention (matches the SVG map paths). The Policy Lab falls back to checking bare `XX` as well.

## What the Policy Lab expects to read

| Lab field | Barometer key (primary) | Fallback keys the Lab will try |
|---|---|---|
| `stress` | `housing_stress.value` | `housingStress`, `stress` |
| `burden` | `rent_burden.value` | `rent_to_income`, `median_rent_burden`, `burden`, `rentBurden` |
| `fmr`    | `fmr_2br.value`     | `fmr`, `fair_market_rent`, `fmr2br` |
| `wage`   | `housing_wage.value`| `housingWage`, `wage_needed`, `wage` |

The Lab's `syncWithBarometerData()` tries all variants and logs counts to the console, so you can see in DevTools exactly which fields matched and which states are missing.

## Known issue to resolve: Rent Burden data source

The Barometer's data dictionary currently says:
> Rent Burden %  ·  Census Bureau  ·  ACS 1-Year Estimates (Table B25071) / Annual  ·  30%+ = cost-burdened

This conflates two different ACS measurements:

- **B25071** = median gross rent as a percentage of household income. One ratio per state (~28–38%). This is what the `Rent Burden Score = (RentBurden% − 25%) × 3` formula actually uses.
- **B25070** = distribution of renters across cost-burden brackets, including 30%+ (cost-burdened) and 50%+ (severely cost-burdened). The 30%+ bracket averages ~50% nationally.

**Decision needed:** which one do you actually want to display/use?

- If **median ratio** (B25071) — current formula is correct; fix the data dictionary label to say "Median rent-to-income ratio, ACS B25071" and drop the "30%+ = cost-burdened" gloss.
- If **cost-burdened share** (B25070) — switch the pipeline to pull B25070, recalibrate the `Rent Burden Score` formula coefficients (values will be ~20 points higher), and re-label the Lab's stat card.

Recommendation: stay with B25071 (the median ratio). It's what both tools' formulas assume today and it's more policy-interpretable as "typical renter's rent share" than as a headcount percentage.

## Acceptance criteria

- [ ] `data/dashboard-data.js` exposes `rent_burden`, `fmr_2br`, and `housing_wage` per state.
- [ ] Opening the Lab in a browser and checking the console shows `stress=51/51 burden=51/51 fmr=51/51 wage=51/51` in the sync log.
- [ ] Changing a value in `data/dashboard-data.js` and reloading both pages shows the same updated number on both.
- [ ] Removing the `<script src="data/dashboard-data.js">` tag still lets the Lab render (falls back to NLIHC 2025 values).
- [ ] The Barometer data dictionary matches what the formulas actually use (see decision above).

## Refresh cadence

| Source | Frequency | Next update |
|---|---|---|
| HUD FMR | Annual (Oct, FY basis) | FY2026 ~Oct 2026 |
| NLIHC Out of Reach | Annual (Jul) | OOR 2026 ~Jul 2026 |
| ACS 1-year | Annual (Sep) | 2025 1-yr ~Sep 2026 |
| BLS LAUS | Monthly | ~3 weeks after month end |
| SAIPE | Annual (Dec) | 2025 ~Dec 2026 |
| FRED HPI | Quarterly | ~60 days after quarter end |
| Google Health Trends | Daily | pipeline runs nightly |

Nightly pipeline run is overkill for burden/FMR/wage (those change once a year) but fine for the Trends-driven stress indices.
