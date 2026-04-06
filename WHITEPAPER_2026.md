# Financial Health Barometer: 2026 Methodology & Data Architecture

**Prepared by:** FinMango Research Team
**Date:** April 2026
**Version:** 3.0

---

## Abstract

Traditional economic indicators—unemployment rate, CPI, poverty estimates—are lagging by design, published with delays of weeks to months. In a rapidly evolving economic landscape characterized by post-pandemic inflation, housing volatility, and labor market fragmentation, decision-makers require real-time signals. The FinMango Financial Health Barometer bridges this gap by fusing authoritative government data (BLS, Census, HUD, FRED) with real-time behavioral signals from the Google Health Trends API and academic calibration from the Harvard Joint Center for Housing Studies. This whitepaper details the data architecture, index formulas, search term ontology, scaling logic, and regional adjustment methodology that power the Barometer.

---

## 1. Data Philosophy: The Hybrid Calibration Model

Our approach rejects the binary choice between "slow but accurate" government data and "fast but noisy" big data. Instead, we employ a **Hybrid Calibration Model** with three distinct layers:

| Layer | Source | Role | Update Frequency |
|-------|--------|------|-----------------|
| **Base Layer** | Census Bureau, HUD, BLS, FRED | Provides the structural "truth"—poverty rates, fair market rents, unemployment, housing price indices. Anchors indices to demographic reality. | Annual / Monthly / Quarterly |
| **Signal Layer** | Google Health Trends API | Provides real-time sensitivity to acute shocks. We extract absolute search probability values for specific distress-related terms. | Daily |
| **Calibration Layer** | Harvard JCHS | *The State of the Nation's Housing 2025* report validates housing stress scores against the most authoritative independent housing research. | Annual |

### 1.1 Why Three Layers?

- **Base Layer alone** would produce a static snapshot, blind to acute shocks (e.g., a factory closure in a rural county).
- **Signal Layer alone** would be noisy and ungrounded—search spikes might reflect media coverage, not lived experience.
- **Calibration Layer** provides an independent validation check. If government data suggests a state is "stable" but Harvard JCHS identifies >50% severe cost burden among renters, the calibration data takes precedence.

---

## 2. Data Sources & Dictionary

The Barometer aggregates the following official datasets, calculated daily:

| Variable | Source | Dataset / Frequency | Use in Index |
|----------|--------|-------------------|--------------|
| **Unemployment Rate** | Bureau of Labor Statistics (BLS) | Local Area Unemployment Statistics (LAUS) / Monthly | Primary driver for *Financial Anxiety*. National baseline set at 3.5%. |
| **Poverty Rate** | Census Bureau | Small Area Income and Poverty Estimates (SAIPE) / Annual | Primary driver for *Food Insecurity*. National baseline set at 10%. |
| **Rent Burden %** | Census Bureau | ACS 1-Year Estimates, Table B25071 (Median Gross Rent as % of Income) / Annual | Primary driver for *Housing Stress*. 30%+ = HUD "cost-burdened" threshold. |
| **Fair Market Rent** | HUD (Dept. of Housing and Urban Development) | FMR API, 2-bedroom median / Annual | Used for relative cost comparison across states in *Housing Stress*. |
| **Housing Price Index** | FRED (Federal Reserve Bank of St. Louis) | FHFA All-Transactions House Price Index / Quarterly | Measures housing price volatility for *Housing Stress*. |
| **Search Trends** | Google Health Trends API *(exclusive access)* | Probability-scaled search volume / Daily | Real-time "Volatility Boost" (+0–10 pts) across all indices. See Section 4. |
| **Housing Cost Burden** | Harvard JCHS | *State of the Nation's Housing 2025* / Annual | Authoritative calibration and fallback source for *Housing Stress*. Provides state-level % of cost-burdened and severely cost-burdened renters. |

---

## 3. Indicator Components, Search Ontology & Formulas

Each of the four indices is constructed from a weighted combination of structural government data, a base index value, scaling factors, regional multipliers, and a real-time behavioral signal (Trends Boost).

### A. Financial Anxiety Index

Measures labor market precarity and household liquidity stress.

**Formula:**

```
Financial Anxiety = (120 + (Unemployment Rate − 3.5%) × 18) × Regional Multiplier + Trends Boost
```

- **Primary Input:** Local Area Unemployment Statistics (LAUS) from BLS
- **Base Index:** 120 (places typical conditions in the "Moderate" range)
- **Scaling Factor:** 18 per percentage point above 3.5% baseline
- **Behavioral Signal (Search Terms):**
  - `"debt help"` — Indicator of household insolvency
  - `"bankruptcy"` — Legal financial distress
  - `"can't pay rent"` — Immediate liquidity crisis

**Rationale:** Official unemployment rates hide underemployment and gig-economy fragility. Search terms for debt relief frequently spike *before* official default rates rise, providing a leading indicator.

### B. Food Insecurity Index

Measures access to nutritional sufficiency.

**Formula:**

```
Food Insecurity = (85 + (Poverty Rate − 10%) × 6) × Regional Multiplier + Trends Boost
```

- **Primary Input:** Census Bureau SAIPE (Small Area Income and Poverty Estimates)
- **Base Index:** 85
- **Scaling Factor:** 6 per percentage point above 10% baseline
- **Behavioral Signal (Search Terms):**
  - `"food stamps"` — Program participation intent
  - `"food bank near me"` — Immediate physical need

**Rationale:** Real-time spikes in "food bank" searches often correlate with localized economic shocks (natural disasters, plant closures, seasonal layoffs) that are invisible to annual poverty metrics.

### C. Housing Stress Index

Measures the burden of shelter costs relative to income. This is the most complex index, combining three sub-scores.

**Formula:**

```
Housing Stress = (100 + Rent Burden Score + FMR Score + HPI Score) × Regional Multiplier + Trends Boost
```

**Where:**

- **Rent Burden Score** = (State Rent Burden % − 25%) × 3
  - Source: Census ACS Table B25071
- **FMR Score** = (State FMR / National Average FMR − 1) × 40
  - Source: HUD FMR API (2-bedroom median)
- **HPI Score** = Housing Price Change % × 2
  - Source: FRED FHFA All-Transactions Index

**Primary Inputs:**
- Rent Burden: Census ACS (Median Gross Rent as % of Income)
- Market Price: HUD Fair Market Rents (40th percentile rents)
- Price Volatility: FRED Housing Price Index (quarterly change)
- Calibration: Harvard JCHS 2025 cost burden data (fallback and validation)

**Behavioral Signal (Search Terms):**
- `"eviction help"` — Displacement risk
- `"rent assistance"` — Safety net seeking

**Rationale:** Housing stress is multi-dimensional. Rent burden alone misses markets where prices are rising rapidly (HPI) or where absolute costs are extreme relative to national norms (FMR). The Harvard JCHS data serves as an authoritative fallback: if government data suggests a state is "stable" but JCHS identifies >50% severe cost burden, our model reflects the crisis.

### D. Affordability Index

A composite measure of overall purchasing power and economic resilience.

**Formula:**

```
Affordability = (Housing Stress × 0.60 + Food Insecurity × 0.40) + Trends Boost
```

**Rationale:** Housing is the largest fixed cost for most American households. When housing consumes >30% of income (the HUD "cost-burdened" threshold), the residual income available for food, healthcare, and transportation acts as the final buffer before crisis. The 60/40 weighting reflects housing's dominant role in household budgets.

---

## 4. The Google Health Trends API: Real-Time Behavioral Signal

FinMango has **exclusive research access** to the Google Health Trends API, which differs fundamentally from the publicly available Google Trends website:

| Feature | Public Google Trends | Google Health Trends API |
|---------|---------------------|------------------------|
| **Scale** | Relative (0–100), normalized per query | Absolute search probability: P(term) × 10,000,000 |
| **Comparability** | Cannot compare across time periods or geographies | Directly comparable across all time periods and all geographies |
| **Granularity** | Weekly | Daily |
| **Access** | Public | Restricted to approved research organizations |

**How it works:** A Health Trends API value of 5 means that 5 out of every 10 million search sessions included that term—an absolute measure, not a relative one.

**Trends Boost:** The raw API probability value is used directly as an additive boost to each index, capped at 10 points. This provides a real-time signal of financial stress that moves faster than monthly or annual government data releases.

```
Trends Boost = min(raw_api_value, 10)
```

The Trends Boost is applied *after* the Regional Multiplier for Financial Anxiety, Food Insecurity, and Housing Stress. For the Affordability index, it is applied as a separate additive term after the weighted composite calculation.

---

## 5. The Barometer Scale (0–200)

The Barometer uses a **0–200 scale** designed to maximize the visibility of volatility in the stress and crisis zones.

### Why 0–200?

- **Standard Deviation Sensitivity:** Standard 0–100 indices often compress outliers into a narrow band. Our wider scale amplifies deviations above the mean, making state-to-state differences visually and analytically meaningful.
- **Base Index Calibration:** The base values (120 for Financial Anxiety, 100 for Housing Stress, 85 for Food Insecurity) are chosen to place typical national economic conditions in the "Moderate" range, ensuring that both improvement and deterioration are visible.

### Scale Definitions

| Range | Color | Label | Description |
|-------|-------|-------|-------------|
| **< 90** | 🟢 Green | **Low Stress / Stable** | Healthy economic conditions. Low unemployment (<3.0%), affordable housing (<30% of income). |
| **90–120** | 🟡 Yellow | **Moderate Stress** | Typical stress levels. Inflationary pressure is felt but manageable for most households. |
| **120–150** | 🟠 Orange | **Elevated Stress — Warning Signs** | "Paycheck to paycheck" living becomes dominant. Cost burden is widespread. Policy attention warranted. |
| **> 150** | 🔴 Red | **Crisis Level** | Immediate intervention required. High probability of displacement, hunger, or insolvency. Mathematically unsustainable for the median earner (e.g., >50% of renters cost-burdened). |

---

## 6. Regional Stress Multipliers

Raw index values are adjusted through **Regional Multipliers** (range: 0.85×–1.35×) to account for structural cost-of-living differences and historical inequality. These are heuristic adjustments based on structural economic factors—not derived from a single dataset.

| Region | Multiplier Range | Rationale |
|--------|-----------------|-----------|
| **Deep South** (e.g., MS, LA, AL) | 1.25×–1.35× | Lower nominal costs are offset by significantly lower median incomes and weaker social safety nets. A $1,000/month rent in Mississippi is more stressful than $1,000 in Illinois. |
| **High-Cost Coastal** (e.g., CA, NY, FL, MA) | 1.12×–1.15× | Accounts for the extreme "floor" of entry. Even high earners face liquidity crises due to housing costs that consume 40–60% of income. |
| **Midwest Industrial** (e.g., OH, MI, IN) | 1.00×–1.10× | Moderate adjustment. Manufacturing decline creates localized stress pockets within otherwise affordable regions. |
| **Great Plains** (e.g., ND, SD, NE) | 0.85×–0.95× | Lower housing density and energy sector independence often cushion these regions from national inflation shocks. |

The multiplier is applied to the base calculation *before* the Trends Boost is added:

```
Index = (Base Calculation) × Regional Multiplier + Trends Boost
```

---

## 7. Historical Trend Data

The Barometer includes a historical trend chart powered by Google Health Trends API data, showing how stress indicators have changed over time.

**Methodology:**
- The shape of each trend curve reflects absolute search probability for indicator-specific terms (e.g., "debt help", "food bank near me", "eviction help").
- Historical values are **rescaled** so that the most recent month equals today's composite index value, preserving the trend shape while keeping the chart on the same scale as the map.
- Available time ranges: 3 months, 6 months, 12 months, 5 years, and 10 years.

**Interpretation Note:** Because search data is inherently volatile, month-to-month fluctuations can be large. Focus on longer-term directional trends rather than individual data points.

---

## 8. Academic Note: Heuristic Stress Model (HSM)

The indices presented in the Barometer utilize a **Heuristic Stress Model (HSM)** to quantify economic pressure. Unlike raw economic indicators, the HSM standardizes disparate metrics—unemployment rates, rent burden percentages, search behavior probabilities—into a unified 0–200 stress index. This enables cross-variable comparison at state-level granularity, similar in spirit to the Misery Index but with substantially richer inputs and geographic resolution.

### Important Researcher Notes

1. **Composite indices are heuristic.** They are designed for *relative comparison between states*, not as absolute measures of economic hardship.
2. **Base indices, scaling factors, and regional multipliers are editorial choices** that amplify differences for visualization purposes.
3. **For econometric modeling,** use the raw underlying metrics (unemployment rate, poverty rate, rent burden %, FMR, HPI) provided in the full CSV and JSON exports from the Barometer dashboard, rather than the composite index scores.
4. **The Trends Boost introduces real-time behavioral data** that is not present in traditional economic datasets. Researchers should document whether they are using the composite scores (which include the Boost) or raw government metrics (which do not).

---

## 9. Open Data & Exports

The Barometer provides all data in open, machine-readable formats:

- **CSV Export:** State-level data including composite index scores and raw underlying metrics (unemployment rate, poverty rate, rent burden %, fair market rent, affordability).
- **JSON Export:** Full DASHBOARD_DATA object including national averages, all 51 state/territory records, historical timeseries, and metadata.
- **Embed Widget:** Embeddable iframe snippet for third-party websites.
- **GitHub Repository:** Source code, data pipeline, and this whitepaper are available at [github.com/finmango/research](https://github.com/finmango/research).

---

## 10. Conclusion

The FinMango Financial Health Barometer v3.0 represents the next step in **equity-centered data science**. By combining the statistical rigor of the Census Bureau and BLS with the real-time sensitivity of Google Health Trends API search data—validated against Harvard's authoritative housing research—we provide a tool that doesn't just measure the economy, but **measures the human experience of the economy**.

The explicit formulas, transparent scaling logic, and open data exports documented in this whitepaper ensure that researchers, policymakers, and journalists can both use and scrutinize the Barometer's methodology.

---

## Citation

To cite the Financial Health Barometer in publications:

> FinMango Research Team. (2026). *Financial Health Barometer: Real-Time US Economic Stress Indicators* [Data set]. FinMango. https://finmango.org/barometer

---

© 2026 FinMango. Open Source License (MIT).
