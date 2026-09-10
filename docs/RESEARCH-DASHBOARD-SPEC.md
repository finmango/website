# FinMango Research Dashboard — Complete Specification

> A live US financial health intelligence dashboard tracking four core indicators across all 50 states + DC, powered by the Google Health Trends API, updated daily.

---

## Table of Contents

1. [Overview](#overview)
2. [Google Health Trends API](#google-health-trends-api)
3. [Four Core Indicators](#four-core-indicators)
4. [Index Calculation](#index-calculation)
5. [Data Pipeline](#data-pipeline)
6. [Data Schema](#data-schema)
7. [Dashboard UI](#dashboard-ui)
8. [Tech Stack](#tech-stack)
9. [File Structure](#file-structure)
10. [GitHub Actions Automation](#github-actions-automation)
11. [Citation & License](#citation--license)

---

## Overview

**Mission:** Create an open-source, real-time dashboard that monitors the financial health pulse of America using search behavior data as a proxy for economic stress.

**Why it matters:**
- Financial anxiety is invisible until it becomes a crisis
- Search behavior reveals what people are actually experiencing
- Real-time data enables proactive policy responses
- Open source ensures transparency and reproducibility

**Who it serves:**
- Academic researchers
- Policymakers (WHO, World Bank, IMF)
- Journalists covering economic issues
- Nonprofit organizations
- General public

---

## Google Health Trends API

### Configuration

| Field | Value |
|-------|-------|
| Service | `trends.googleapis.com` |
| API Key | Stored only in the `GOOGLE_TRENDS_API_KEY` GitHub Actions secret. Never commit it: this repository is public. |
| Base URL | `https://trends.googleapis.com/v1/health/trends` |
| Auth Method | API key as query parameter or header |

### Request Format

```
GET https://trends.googleapis.com/v1/health/trends?
  terms=debt+help,bankruptcy,payday+loan
  &time=2024-01-01+2024-12-01
  &geo=US-OH
  &key=YOUR_API_KEY
```

### Response Format

```json
{
  "results": [
    {
      "term": "debt help",
      "points": [
        {"date": "2024-01-07", "value": 142},
        {"date": "2024-01-14", "value": 156}
      ]
    }
  ]
}
```

### Understanding the Values

The API returns **conditional probability values**, not normalized 0-100 scores:

```
Value = P(term | time AND geography) × 10,000,000
```

**Example:** A value of `142` means 142 searches per 10 million search sessions.

**Why this matters:**
- Values are directly comparable across terms
- Values are directly comparable across time periods
- Values are directly comparable across geographies
- Enables mathematically rigorous analysis
- This is what makes FinMango's data unique vs. public Google Trends

### Geographic Codes

| Level | Format | Example |
|-------|--------|---------|
| National | `US` | United States |
| State | `US-XX` | `US-CA` (California), `US-OH` (Ohio) |
| DMA | Numeric code | `506` (Boston), `501` (New York) |

---

## Four Core Indicators

### 1. Financial Anxiety Index

**What it measures:** Economic stress, fear, and financial desperation

| Search Term | Weight | Rationale |
|-------------|--------|-----------|
| `debt help` | 1.0 | General debt concern |
| `bankruptcy` | 1.5 | Severe financial distress |
| `payday loan` | 1.2 | Desperate short-term borrowing |
| `can't pay rent` | 1.8 | Immediate housing threat |
| `debt relief` | 1.0 | Seeking debt solutions |
| `debt collector` | 1.3 | Active collection pressure |

---

### 2. Food Insecurity Signal

**What it measures:** Hunger, food access challenges, and reliance on assistance

| Search Term | Weight | Rationale |
|-------------|--------|-----------|
| `food stamps` | 1.0 | SNAP program interest |
| `food bank near me` | 1.4 | Immediate food need |
| `SNAP benefits` | 1.0 | Government assistance |
| `free food` | 1.3 | Urgent food need |
| `food pantry` | 1.2 | Community food resources |
| `EBT balance` | 0.8 | Managing existing benefits |

---

### 3. Housing Stress Indicator

**What it measures:** Housing instability, eviction risk, and rental assistance needs

| Search Term | Weight | Rationale |
|-------------|--------|-----------|
| `eviction help` | 1.8 | Facing eviction |
| `rent assistance` | 1.2 | Seeking rental help |
| `housing assistance` | 1.0 | General housing support |
| `facing eviction` | 2.0 | Imminent eviction |
| `tenant rights` | 1.0 | Legal protection seeking |
| `behind on rent` | 1.5 | Payment delinquency |

---

### 4. Affordability Index

**What it measures:** Cost of living pressure and general economic squeeze

| Search Term | Weight | Rationale |
|-------------|--------|-----------|
| `cost of living` | 1.0 | General affordability concern |
| `prices too high` | 1.3 | Inflation frustration |
| `can't afford` | 1.5 | Direct affordability crisis |
| `inflation help` | 1.2 | Seeking inflation relief |
| `cheap groceries` | 0.8 | Budget food shopping |
| `budget tips` | 0.7 | Financial coping strategies |

---

## Index Calculation

### Formula

For each indicator, we calculate a weighted average:

```
Index = Σ(value × weight) / Σ(weight)
```

### JavaScript Implementation

```javascript
const weights = {
  // Financial Anxiety
  "debt help": 1.0,
  "bankruptcy": 1.5,
  "payday loan": 1.2,
  "can't pay rent": 1.8,
  "debt relief": 1.0,
  "debt collector": 1.3,

  // Food Insecurity
  "food stamps": 1.0,
  "food bank near me": 1.4,
  "SNAP benefits": 1.0,
  "free food": 1.3,
  "food pantry": 1.2,
  "EBT balance": 0.8,

  // Housing Stress
  "eviction help": 1.8,
  "rent assistance": 1.2,
  "housing assistance": 1.0,
  "facing eviction": 2.0,
  "tenant rights": 1.0,
  "behind on rent": 1.5,

  // Affordability
  "cost of living": 1.0,
  "prices too high": 1.3,
  "can't afford": 1.5,
  "inflation help": 1.2,
  "cheap groceries": 0.8,
  "budget tips": 0.7
};

function calculateIndex(termValues, indicatorTerms) {
  let sum = 0;
  let totalWeight = 0;

  for (const term of indicatorTerms) {
    const value = termValues[term] || 0;
    const weight = weights[term];
    sum += value * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? sum / totalWeight : 0;
}
```

### Change Calculation

```javascript
function calculateChange(currentValue, previousValue) {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}
```

---

## Data Pipeline

### Daily Update Flow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: FETCH DATA (Daily at midnight UTC)                │
├─────────────────────────────────────────────────────────────┤
│  For each of 51 regions (50 states + DC):                  │
│    • Fetch 6 Financial Anxiety terms                       │
│    • Fetch 6 Food Insecurity terms                         │
│    • Fetch 6 Housing Stress terms                          │
│    • Fetch 6 Affordability terms                           │
│                                                             │
│  Total API calls: 51 regions × 4 indicators = 204/day      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: CALCULATE INDICES                                 │
├─────────────────────────────────────────────────────────────┤
│  For each state:                                           │
│    • Calculate weighted index for each indicator           │
│    • Calculate week-over-week change                       │
│    • Determine national ranking                            │
│                                                             │
│  For national level:                                       │
│    • Calculate population-weighted national average        │
│    • Calculate overall change                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: SAVE DATA                                         │
├─────────────────────────────────────────────────────────────┤
│  • Save to: /data/financial-health-YYYY-MM-DD.json         │
│  • Update: /data/latest.json                               │
│  • Append to: /data/timeseries.json                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: COMMIT & DEPLOY                                   │
├─────────────────────────────────────────────────────────────┤
│  • Git commit with date                                    │
│  • Push to repository                                      │
│  • Static site auto-rebuilds                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Schema

### latest.json

```json
{
  "meta": {
    "generated": "2024-12-08T00:00:00Z",
    "version": "1.0",
    "source": "Google Health Trends API",
    "methodology": "https://finmango.org/research-dashboard#methodology",
    "terms_per_indicator": 6,
    "update_frequency": "daily"
  },

  "national": {
    "financial_anxiety": {
      "value": 127.3,
      "change": 3.2,
      "trend": "up"
    },
    "food_insecurity": {
      "value": 89.4,
      "change": -1.8,
      "trend": "down"
    },
    "housing_stress": {
      "value": 156.7,
      "change": 5.4,
      "trend": "up"
    },
    "affordability": {
      "value": 112.1,
      "change": 2.1,
      "trend": "up"
    }
  },

  "states": {
    "US-AL": {
      "name": "Alabama",
      "abbr": "AL",
      "financial_anxiety": {
        "value": 142.1,
        "change": 4.1,
        "rank": 12
      },
      "food_insecurity": {
        "value": 95.2,
        "change": -0.5,
        "rank": 18
      },
      "housing_stress": {
        "value": 134.8,
        "change": 2.3,
        "rank": 24
      },
      "affordability": {
        "value": 98.7,
        "change": 1.2,
        "rank": 31
      }
    },
    "US-AK": { "...": "..." },
    "US-AZ": { "...": "..." }
  },

  "timeseries": {
    "national": {
      "financial_anxiety": [
        {"date": "2024-11-01", "value": 118.2},
        {"date": "2024-11-08", "value": 121.5},
        {"date": "2024-11-15", "value": 119.8},
        {"date": "2024-11-22", "value": 123.4},
        {"date": "2024-11-29", "value": 125.1},
        {"date": "2024-12-08", "value": 127.3}
      ]
    },
    "US-OH": {
      "financial_anxiety": [
        {"date": "2024-12-01", "value": 138.2},
        {"date": "2024-12-08", "value": 142.1}
      ]
    }
  }
}
```

---

## Dashboard UI

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  ══════════════════════════════════════════════════════════════│
│  🥭 FinMango Research                                          │
│                                                                 │
│  FINANCIAL HEALTH PULSE OF AMERICA                             │
│  Real-time indicators powered by Google Health Trends API      │
│                                                                 │
│  Last updated: December 8, 2024  •  🟢 LIVE                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  INDICATOR CARDS (Clickable - changes map view)                │
│  ═══════════════════════════════════════════════════════════════│
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  FINANCIAL  │ │    FOOD     │ │   HOUSING   │ │ AFFORD-   │ │
│  │   ANXIETY   │ │ INSECURITY  │ │   STRESS    │ │  ABILITY  │ │
│  │             │ │             │ │             │ │           │ │
│  │    127.3    │ │    89.4     │ │    156.7    │ │   112.1   │ │
│  │   ▲ 3.2%    │ │   ▼ 1.8%    │ │   ▲ 5.4%    │ │  ▲ 2.1%   │ │
│  │             │ │             │ │             │ │           │ │
│  │  [ACTIVE]   │ │             │ │             │ │           │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  US MAP (Interactive SVG)                                       │
│  ═══════════════════════════════════════════════════════════════│
│                                                                 │
│           ┌──────────────────────────────────────┐             │
│           │                                      │             │
│           │         [Interactive US Map]         │             │
│           │                                      │             │
│           │    States color-coded by selected    │             │
│           │    indicator intensity               │             │
│           │                                      │             │
│           │    🟢 Low stress                     │             │
│           │    🟡 Moderate stress                │             │
│           │    🟠 Elevated stress                │             │
│           │    🔴 High stress                    │             │
│           │                                      │             │
│           │    Click state for details           │             │
│           │    Hover for quick tooltip           │             │
│           │                                      │             │
│           └──────────────────────────────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STATE DETAIL PANEL (appears when state clicked)               │
│  ═══════════════════════════════════════════════════════════════│
│                                                                 │
│  OHIO                                              [✕ Close]   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Financial Anxiety:  142.1  (Rank #12)  ▲ 4.1%                 │
│  Food Insecurity:     95.2  (Rank #18)  ▼ 0.5%                 │
│  Housing Stress:     134.8  (Rank #24)  ▲ 2.3%                 │
│  Affordability:       98.7  (Rank #31)  ▲ 1.2%                 │
│                                                                 │
│  [Compare with another state ▼]                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TIME SERIES CHART                                             │
│  ═══════════════════════════════════════════════════════════════│
│                                                                 │
│  [Financial Anxiety ▼]  [Last 12 months ▼]  [+ Add State]      │
│                                                                 │
│  160 ┤                                                         │
│      │                                            ╭──           │
│  140 ┤                              ╭─────────────╯             │
│      │                    ╭─────────╯                          │
│  120 ┤          ╭─────────╯                                    │
│      │    ╭─────╯                                              │
│  100 ┤────╯                                                    │
│      │                                                         │
│   80 ┤                                                         │
│      └──────────────────────────────────────────────────────   │
│        Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov   │
│                                                                 │
│        ── National Average   ── Ohio   ── California           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STATE RANKINGS TABLE                                          │
│  ═══════════════════════════════════════════════════════════════│
│                                                                 │
│  Sort by: [Financial Anxiety ▼]                                │
│                                                                 │
│  ┌──────┬────────────────┬─────────┬──────┬─────────┬────────┐ │
│  │ Rank │ State          │ Anxiety │ Food │ Housing │ Afford │ │
│  ├──────┼────────────────┼─────────┼──────┼─────────┼────────┤ │
│  │  1   │ Mississippi    │  189.2  │142.1 │  201.3  │ 156.8  │ │
│  │  2   │ Louisiana      │  178.4  │138.9 │  195.7  │ 149.2  │ │
│  │  3   │ West Virginia  │  171.2  │131.4 │  178.2  │ 142.1  │ │
│  │  4   │ Arkansas       │  168.9  │129.8 │  172.4  │ 138.7  │ │
│  │  5   │ Alabama        │  165.3  │127.2 │  169.1  │ 135.2  │ │
│  │ ...  │ ...            │  ...    │ ...  │  ...    │  ...   │ │
│  └──────┴────────────────┴─────────┴──────┴─────────┴────────┘ │
│                                                                 │
│  Showing 1-10 of 51  [< Prev] [Next >]                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  RESEARCHER TOOLS                                              │
│  ═══════════════════════════════════════════════════════════════│
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ 📥 Download  │ │ 📥 Download  │ │ 📋 Copy      │            │
│  │    CSV       │ │    JSON      │ │   Citation   │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ 📄 API       │ │ 🔗 Embed     │ │ 📖 Full      │            │
│  │   Docs       │ │   Widget     │ │   Methodology│            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  METHODOLOGY                                                   │
│  ═══════════════════════════════════════════════════════════════│
│                                                                 │
│  DATA SOURCE                                                   │
│  This dashboard uses the Google Health Trends API to access    │
│  actual conditional probability values for health-related      │
│  search terms. Unlike public Google Trends (0-100 normalized   │
│  scores), our data represents: P(term|time,geo) × 10,000,000   │
│                                                                 │
│  INDEX CALCULATION                                             │
│  Each indicator is a weighted average of 6 search terms.       │
│  Weights reflect the severity/urgency of each search behavior. │
│  See full methodology: github.com/finmango/research            │
│                                                                 │
│  UPDATE FREQUENCY                                              │
│  Data is updated daily at midnight UTC via automated pipeline. │
│                                                                 │
│  LIMITATIONS                                                   │
│  • Search behavior ≠ actual conditions (proxy measure)         │
│  • Internet access varies by demographic                       │
│  • Some terms may have multiple meanings                       │
│  • Data reflects searchers, not total population               │
│                                                                 │
│  CITATION                                                      │
│  FinMango Research Team (2024). Financial Health Pulse:        │
│  Real-Time US Economic Stress Indicators.                      │
│  https://finmango.org/research-dashboard                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend | Static HTML + Vanilla JS | Matches existing site, no build process |
| Styling | CSS (inline) | Consistent with FinMango site architecture |
| Charts | Chart.js | Already used on site, no new dependency |
| US Map | Inline SVG | No external library, full control |
| Data Storage | JSON files | Simple, versionable, no database needed |
| Automation | GitHub Actions | Free, reliable, easy to maintain |
| API Script | Node.js | JavaScript consistency, good fetch support |
| Hosting | Existing static host | No infrastructure changes |

---

## File Structure

```
/website
│
├── research-dashboard.html          # Main dashboard page
│
├── /data
│   ├── latest.json                  # Current data (updated daily)
│   ├── financial-health-2024-12-08.json
│   ├── financial-health-2024-12-07.json
│   └── /historical
│       ├── 2024-Q4.json             # Quarterly archives
│       └── 2024-Q3.json
│
├── /scripts
│   ├── fetch-trends.js              # API fetch script
│   ├── calculate-indices.js         # Index calculation
│   └── generate-exports.js          # CSV/JSON export generator
│
├── /assets
│   └── us-map.svg                   # US map (or inline in HTML)
│
└── /.github
    └── /workflows
        └── daily-update.yml         # GitHub Actions cron job
```

---

## GitHub Actions Automation

### daily-update.yml

```yaml
name: Update Financial Health Data

on:
  schedule:
    - cron: '0 5 * * *'  # 5 AM UTC daily (midnight EST)
  workflow_dispatch:      # Allow manual trigger

jobs:
  update-data:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install node-fetch

      - name: Fetch new data from Google Trends API
        env:
          GOOGLE_TRENDS_API_KEY: ${{ secrets.GOOGLE_TRENDS_API_KEY }}
        run: node scripts/fetch-trends.js

      - name: Calculate indices
        run: node scripts/calculate-indices.js

      - name: Generate export files
        run: node scripts/generate-exports.js

      - name: Commit and push changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

          git add data/

          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "📊 Update financial health data $(date +%Y-%m-%d)"
            git push
          fi
```

### Setting up the API Key Secret

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `GOOGLE_TRENDS_API_KEY`
5. Value: the Health Trends API key from the Google Cloud console (never paste it into this file)

---

## Citation & License

### Citation Format (BibTeX)

```bibtex
@misc{finmango2024pulse,
  title     = {Financial Health Pulse: Real-Time US Economic Stress Indicators},
  author    = {{FinMango Research Team}},
  year      = {2024},
  url       = {https://finmango.org/research-dashboard},
  note      = {Data sourced from Google Health Trends API. Updated daily.},
  publisher = {FinMango}
}
```

### Citation Format (APA)

```
FinMango Research Team. (2024). Financial Health Pulse: Real-Time US
Economic Stress Indicators. FinMango. https://finmango.org/research-dashboard
```

### License

**Code:** MIT License — free to use, modify, and redistribute

**Data:** CC BY 4.0 — free to use with attribution

---

## Contact

- **Website:** https://finmango.org
- **Research:** https://github.com/finmango/research
- **Email:** hello@finmango.org
- **Twitter:** @finmango

---

*This specification was created for the FinMango Research Dashboard project. Last updated: December 2024.*
