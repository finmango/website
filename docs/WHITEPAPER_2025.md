# Financial Health Barometer: 2025 Methodology & Data Architecture
**Prepared by:** FinMango Research Team
**Date:** December 2025
**Version:** 2.4

## Abstract

Traditional economic indicators (unemployment, CPI) are often lagging, published with a delay of weeks or months. In a rapidly evolving economic landscape—characterized by post-pandemic inflation and housing volatility—decision-makers require real-time signals. The **FinMango Financial Health Barometer** bridges this gap by fusing authoritative government data (BLS, Census, HUD) with real-time behavioral signals (Google Health Trends API) and academic calibration (Harvard JCHS). This whitepaper details the data architecture, search term ontology, and index scaling logic that powers the Barometer.

---

## 1. Data Philosophy: The Hybrid Model

Our approach rejects the binary choice between "slow but accurate" government data and "fast but noisy" big data. Instead, we employ a **Hybrid Calibration Model**:

| Layer | Source | Role | Update Freq |
|-------|--------|------|-------------|
| **Base Layer** | **Census Bureau, HUD, BLS** | Provides the structural "truth" (e.g., poverty rates, fair market rents). This anchors our indices to demographic reality. | Annual/Monthly |
| **Signal Layer** | **Google Health Trends API** | providing real-time sensitivity to acute shocks. We extract conditional probability values for specific distress-related search terms. | Real-Time |
| **Calibration** | **Harvard JCHS** | "The State of the Nation's Housing 2025" report serves as our "golden master" for validating housing stress scores. | Annual |

---

## 2. Indicator Components & Search Ontology

Each of the four key indices is constructed from a weighted mix of structural data and behavioral signals.

### A. Financial Anxiety Index
*Measures labor market precarity and household liquidity stress.*
*   **Primary Input:** Local Area Unemployment Statistics (LAUS) from BLS.
*   **Behavioral Signal (Search Terms):**
    *   `"debt help"` (Indicator of insolvency)
    *   `"bankruptcy"` (Legal distress)
    *   `"can't pay rent"` (Immediate liquidity crisis)
*   **Rationale:** Unemployment rates hide "underemployment" and gig-economy fragility. Search terms for debt relief often spike *before* official default rates rise.

### B. Food Insecurity Index
*Measures access to nutritional sufficiency.*
*   **Primary Input:** Census Bureau SAIPE (Small Area Income and Poverty Estimates).
*   **Behavioral Signal (Search Terms):**
    *   `"food stamps"` (Program participation intent)
    *   `"food bank near me"` (Immediate physical need)
*   **Rationale:** Real-time spikes in "food bank" searches often correlate with localized economic shocks (e.g., natural disasters or plant closures) invisible to annual poverty metrics.

### C. Housing Stress Index
*Measures the burden of shelter costs relative to income.*
*   **Primary Inputs:**
    *   **Rent Burden:** Census ACS (Median Gross Rent as % of Income).
    *   **Market Price:** HUD Fair Market Rents (FMR). *Calculation:* State-level FMR is derived from the **median of all county-level 2-Bedroom FMRs** (FY2025 data).
    *   **Calibration:** Harvard JCHS 2025 Cost Burden data.
*   **Behavioral Signal (Search Terms):**
    *   `"eviction help"` (Displacement risk)
    *   `"rent assistance"` (safety net seeking)
*   **Rationale:** We heavily weigh the **Harvard JCHS** data to calibrate this index. If government data suggests a state is "stable" but JCHS data identifies >50% severe cost burden, our model overrides the government baseline to reflect the crisis.

### D. Affordability Index
*A composite measure of purchasing power.*
*   **Formula:** `(Housing Stress × 0.60) + (Food Insecurity × 0.40)`
*   **Rationale:** Housing is the largest fixed cost for most households. When housing eats up >30% of income (Cost Burdened), the residual income for food and healthcare acts as the final buffer before crisis.

---

## 3. The Barometer Scale (80-200)

Unlike a standard 0-100 index, we utilize an **80-200** scale to maximize the visibility of volatility in the "Crisis Zone."

### Why 80-200?
*   **Standard Deviation Sensitivity:** Standard indices often compress outliers. Our scale amplifies deviation above the mean.
*   **Baseline (100):** Represents a theoretical "healthy" national average (e.g., 3.5% unemployment, 25% rent burden).
*   **The "Red Zone" (>150):** This threshold is calibrated to represent **Structural Failure**.
    *   *Example:* A score of 150+ in Housing corresponds to >50% of renters being cost-burdened. It is not just "expensive"; it is mathematically unsustainable for the median earner.

### Scale Definitions
*   🟢 **< 90 (Stable):** Healthy economic conditions. Low unemployment (<3.0%), Affordable housing (<30% income).
*   🟡 **90 - 120 (Moderate):** Typical stress. Inflationary pressure felt but manageable.
*   🟠 **120 - 150 (Elevated):** Warning signs. "Paycheck to paycheck" living becomes dominant.
*   🔴 **> 150 (Crisis):** Immediate intervention required. High probability of displacement, hunger, or insolvency.

---

## 4. Regional Stress Multipliers

To account for cost-of-living differences and historical inequality, we parse raw values through **Regional Multipliers**:

*   **Deep South (e.g., MS, LA):** `1.25x - 1.35x`
    *   *Why?* Lower raw nominal costs are offset by significantly lower median incomes and weaker social safety nets. A $1000 rent in MS is more stressful than $1000 in IL.
*   **High-Cost Coastal (e.g., CA, NY, FL):** `1.12x - 1.15x`
    *   *Why?* Accounts for the "floor" of entry. Even high earners face liquidity crises due to extreme housing costs.
*   **Great Plains (e.g., ND, SD):** `0.85x - 0.95x`
    *   *Why?* Lower housing density and energy independence often cushion these regions from national inflation shocks.

## 5. Conclusion

The FinMango Financial Health Barometer 2.4 represents a step forward in **Equity-Centered Data Science**. By combining the statistical rigor of the Census with the real-time sensitivity of search data—and validating it against Harvard's housing research—we provide a tool that doesn't just measure the economy, but measures the *human experience* of the economy.

---

*© 2025 FinMango. Open Source License (MIT).*
