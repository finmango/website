# Financial Health Barometer - Methodology

**Version 2.4** | Last Updated: December 2024

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

Regional multipliers account for persistent structural economic differences:

| Region | States | Multiplier | Rationale |
|--------|--------|------------|-----------|
| Deep South | MS, LA, AL, AR, WV | 1.22-1.35 | Higher historical poverty |
| High-Cost Coastal | CA, NY, HI, FL, NJ | 1.05-1.20 | Housing affordability crisis |
| Industrial Midwest | MI, OH, IN, IL, MN | 1.04-1.12 | Mixed employment recovery |
| Mountain/Plains | WY, ND, SD, NE, IA | 0.85-0.95 | Lower cost of living |

## Data Quality & Transparency

### Source Attribution

Each state's output includes source tracking:
- `rent_burden_source`: `census_acs` | `jchs_2025` | `tier_estimate`
- `fmr_source`: `hud_fmr` | `jchs_2025` | `tier_estimate`

### JCHS Reference Fields

When Harvard JCHS data is used:
- `jchs_renters_cost_burdened`: % of renters paying 30%+ on housing
- `jchs_renters_severely_burdened`: % of renters paying 50%+ on housing
- `jchs_median_rent`: State median rent from JCHS report

## Index Scaling

Indices are relative measures of economic stress, scaled 80-200 to maximize volatility visibility:

- **< 90 (Green):** Low Stress / Stable (Healthy Baseline)
- **90 - 120 (Yellow):** Moderate Stress
- **120 - 150 (Orange):** Elevated Stress - Warning Signs
- **> 150 (Red):** Crisis Level - Immediate Attention Needed

## Update Frequency

- **Daily:** Unemployment data (BLS)
- **Monthly:** Housing prices (FRED HPI)
- **Annual:** Poverty, rent burden, FMR, JCHS calibration

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
| 2.4 | Dec 2024 | Added Harvard JCHS 2025 as calibration source; source attribution |
| 2.3 | Dec 2024 | Added HUD FMR and Census ACS rent burden |
| 2.2 | Dec 2024 | Added regional stress multipliers |
| 2.1 | Dec 2024 | Initial real data integration |
| 2.0 | Nov 2024 | Refactored to use government APIs |

---

*Financial Health Is A Right, Not A Privilege* | © 2025 FinMango
