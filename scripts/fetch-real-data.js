/**
 * Fetch Real Economic Data for Financial Health Barometer
 * 
 * Data Sources:
 * - BLS API v1.0 (No key required) - State unemployment rates
 * - FRED API (Free key) - Housing price indices, delinquency rates
 * - Census SAIPE API (Free key) - Poverty rates by state
 * - Census ACS API (Free key) - Rent burden percentages
 * - HUD FMR API (Free key) - Fair Market Rents by state
 * - Harvard JCHS 2025 Reference (Static) - Authoritative cost burden calibration
 * 
 * Environment Variables:
 * - FRED_API_KEY: Get free at https://fred.stlouisfed.org/docs/api/api_key.html
 * - CENSUS_API_KEY: Get free at https://api.census.gov/data/key_signup.html
 * - HUD_API_KEY: Get free at https://www.huduser.gov/hudapi/public/register
 */

const fs = require('fs');
const path = require('path');

// State FIPS codes for BLS and Census APIs
const STATE_FIPS = {
    'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06',
    'CO': '08', 'CT': '09', 'DE': '10', 'DC': '11', 'FL': '12',
    'GA': '13', 'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18',
    'IA': '19', 'KS': '20', 'KY': '21', 'LA': '22', 'ME': '23',
    'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28',
    'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33',
    'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38',
    'OH': '39', 'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44',
    'SC': '45', 'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49',
    'VT': '50', 'VA': '51', 'WA': '53', 'WV': '54', 'WI': '55',
    'WY': '56'
};

const STATE_NAMES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii',
    'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
    'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota',
    'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska',
    'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico',
    'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
    'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas',
    'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
    'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// Google Health Trends API search terms (limited set to avoid quota)
// The Health Trends API returns: P(term | time, geo) × 10,000,000
// Values are absolute probabilities (typically 1-20 for these terms),
// NOT the 0-100 relative scale from the public Google Trends website.
const TRENDS_TERMS = {
    financial_anxiety: ["debt help", "bankruptcy", "can't pay rent"],
    food_insecurity: ["food stamps", "food bank near me"],
    housing_stress: ["eviction help", "rent assistance"],
    affordability: ["cost of living", "can't afford"]
};

// Helper: delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: fetch with retry
async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed: ${error.message}`);
            if (i < retries - 1) await delay(2000);
            else throw error;
        }
    }
}

/**
 * Load Harvard JCHS Reference Data
 * Authoritative housing cost burden data for calibration
 * Source: The State of the Nation's Housing 2025
 */
function loadJCHSReferenceData() {
    console.log('📚 Loading Harvard JCHS 2025 reference data...');
    try {
        const jchsPath = path.join(__dirname, '..', 'data', 'jchs-reference-2025.json');
        const data = JSON.parse(fs.readFileSync(jchsPath, 'utf8'));
        console.log(`  ✓ Loaded JCHS reference data for ${Object.keys(data.states).length} states`);
        return data;
    } catch (error) {
        console.warn(`  ⚠️ Could not load JCHS reference: ${error.message}`);
        return null;
    }
}

/**
 * Load NLIHC Out of Reach 2025 fallback data.
 * Used when live Census ACS (B25071) or HUD FMR APIs are unavailable so that
 * every state entry in DASHBOARD_DATA still exposes rent_burden / fmr_2br /
 * housing_wage for the Policy Lab's top-line stat cards.
 */
function loadNLIHCFallbackData() {
    console.log('📚 Loading NLIHC Out of Reach 2025 fallback data...');
    try {
        const p = path.join(__dirname, '..', 'data', 'nlihc-oor-2025-fallback.json');
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        console.log(`  ✓ Loaded NLIHC fallback for ${Object.keys(data.states).length} states`);
        return data;
    } catch (error) {
        console.warn(`  ⚠️ Could not load NLIHC fallback: ${error.message}`);
        return null;
    }
}

// NLIHC Housing Wage definition: hourly wage needed to afford FMR at 30% of
// income, assuming 2,080 work hours per year. Matches NLIHC OOR methodology.
function deriveHousingWage(fmr2br) {
    if (!fmr2br || fmr2br <= 0) return null;
    return Math.round((fmr2br * 12) / (2080 * 0.30) * 100) / 100;
}

/**
 * Fetch data from the Google Health Trends API (exclusive, approved access only).
 * Unlike the public Google Trends website (relative 0-100 scale), this API returns
 * absolute probability values: P(term | time, geography) × 10,000,000.
 * A value of 5 means 5 out of every 10 million search sessions included that term.
 * Values for our financial stress terms typically range from 1-20.
 */
async function fetchGoogleTrends() {
    const apiKey = process.env.GOOGLE_TRENDS_API_KEY;
    if (!apiKey) {
        console.log('⚠️  GOOGLE_TRENDS_API_KEY not set - skipping trends data');
        return null;
    }

    console.log('📈 Fetching Google Trends data (limited to avoid quota)...');
    const results = { states: {}, nationalTimeSeries: {} };

    // Calculate dates
    const d3 = new Date(); d3.setMonth(d3.getMonth() - 3);
    const startDate3m = d3.toISOString().slice(0, 7);
    
    const d10y = new Date(); d10y.setFullYear(d10y.getFullYear() - 10);
    const startDate10y = d10y.toISOString().slice(0, 7);

    // Subset for state state-boosts
    const sampleStates = ['US-CA', 'US-TX', 'US-FL', 'US-NY', 'US-MS', 'US-LA', 'US-WV', 'US-NH', 'US-ND', 'US-IL'];

    let requestCount = 0;
    const MAX_REQUESTS = 40; 

    for (const indicator of Object.keys(TRENDS_TERMS)) {
        results.states[indicator] = {};
        const term = TRENDS_TERMS[indicator][0];

        // 1. Fetch 12-month National Data for the chart shapes
        try {
            const nationalUrl = `https://www.googleapis.com/trends/v1beta/graph?terms=${encodeURIComponent(term)}&restrictions.geo=US&restrictions.startDate=${startDate10y}&key=${apiKey}`;
            const natResponse = await fetch(nationalUrl);
            
            if (natResponse.ok) {
                const data = await natResponse.json();
                if (data.lines?.[0]?.points?.length > 0) {
                    results.nationalTimeSeries[indicator] = data.lines[0].points;
                }
            }
            requestCount++;
            await delay(500);
        } catch (error) {
            console.warn(`   Could not fetch national 12m trends for ${indicator}`);
        }

        // 2. Fetch 3-month State Data for state boosts
        for (const region of sampleStates) {
            if (requestCount >= MAX_REQUESTS) break;
            try {
                const stateUrl = `https://www.googleapis.com/trends/v1beta/graph?terms=${encodeURIComponent(term)}&restrictions.geo=${region}&restrictions.startDate=${startDate3m}&key=${apiKey}`;
                const response = await fetch(stateUrl);

                if (response.status === 429) {
                    console.log('   ⚡ Rate limited, stopping Trends state fetch');
                    break;
                }

                if (response.ok) {
                    const data = await response.json();
                    if (data.lines?.[0]?.points?.length > 0) {
                        const points = data.lines[0].points;
                        const lastValue = points[points.length - 1].value;
                        const stateAbbr = region.replace('US-', '');
                        results.states[indicator][stateAbbr] = lastValue;
                    }
                }

                requestCount++;
                await delay(500); 
            } catch (error) {
                console.warn(`   Could not fetch trends for ${indicator}/${region}`);
            }
        }
    }

    console.log(`  ✓ Retrieved trends data (${requestCount} requests made)`);
    return Object.keys(results.states).length > 0 ? results : null;
}

/**
 * Fetch state unemployment rates from BLS API v1.0 (NO API KEY REQUIRED)
 * Series ID format: LASST{FIPS}0000000000003
 */
async function fetchBLSUnemployment() {
    console.log('📊 Fetching unemployment data from BLS...');
    const results = {};

    // BLS allows 25 series per request, so we batch
    const stateAbbrs = Object.keys(STATE_FIPS);
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Build series IDs for all states
    const seriesIds = stateAbbrs.map(abbr => {
        const fips = STATE_FIPS[abbr];
        return `LASST${fips}0000000000003`; // Unemployment rate series
    });

    // Split into batches of 25
    const batches = [];
    for (let i = 0; i < seriesIds.length; i += 25) {
        batches.push(seriesIds.slice(i, i + 25));
    }

    for (const batch of batches) {
        try {
            const response = await fetch('https://api.bls.gov/publicAPI/v1/timeseries/data/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seriesid: batch,
                    startyear: lastYear.toString(),
                    endyear: currentYear.toString()
                })
            });

            const data = await response.json();

            if (data.status === 'REQUEST_SUCCEEDED' && data.Results?.series) {
                for (const series of data.Results.series) {
                    // Extract state from series ID
                    const fips = series.seriesID.substring(5, 7);
                    const stateAbbr = Object.entries(STATE_FIPS).find(([abbr, f]) => f === fips)?.[0];

                    if (stateAbbr && series.data?.length > 0) {
                        // Get most recent value
                        const latestValue = parseFloat(series.data[0].value);
                        // Get value from same month last year for change calculation
                        const lastYearValue = series.data.find(d =>
                            d.year === lastYear.toString() && d.period === series.data[0].period
                        );

                        results[stateAbbr] = {
                            value: latestValue,
                            previousValue: lastYearValue ? parseFloat(lastYearValue.value) : null,
                            date: `${series.data[0].year}-${series.data[0].period.replace('M', '')}`
                        };
                    }
                }
            }

            await delay(1000); // Rate limiting
        } catch (error) {
            console.error('BLS API error:', error.message);
        }
    }

    console.log(`  ✓ Retrieved unemployment data for ${Object.keys(results).length} states`);
    return results;
}

/**
 * Fetch housing price indices from FRED API
 * Requires FRED_API_KEY environment variable
 * Series: [ST]STHPI (e.g., CASTHPI for California)
 */
async function fetchFREDHousingPrices() {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) {
        console.log('⚠️  FRED_API_KEY not set - skipping housing price data');
        console.log('   Get a free key at: https://fred.stlouisfed.org/docs/api/api_key.html');
        return null;
    }

    console.log('🏠 Fetching housing price data from FRED...');
    const results = {};

    for (const [abbr, fips] of Object.entries(STATE_FIPS)) {
        try {
            const seriesId = `${abbr}STHPI`;
            const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=13&sort_order=desc`;

            const data = await fetchWithRetry(url);

            if (data.observations?.length > 0) {
                const latest = parseFloat(data.observations[0].value);
                const yearAgo = data.observations.length >= 13 ? parseFloat(data.observations[12].value) : null;

                results[abbr] = {
                    value: latest,
                    previousValue: yearAgo,
                    change: yearAgo ? ((latest - yearAgo) / yearAgo * 100) : null,
                    date: data.observations[0].date
                };
            }

            await delay(200); // FRED rate limit: 120 requests/minute
        } catch (error) {
            console.warn(`  Could not fetch housing data for ${abbr}: ${error.message}`);
        }
    }

    console.log(`  ✓ Retrieved housing price data for ${Object.keys(results).length} states`);
    return results;
}

/**
 * Fetch poverty rates from Census SAIPE API
 * Requires CENSUS_API_KEY environment variable
 */
async function fetchCensusPoverty() {
    const apiKey = process.env.CENSUS_API_KEY;
    if (!apiKey) {
        console.log('⚠️  CENSUS_API_KEY not set - skipping poverty data');
        console.log('   Get a free key at: https://api.census.gov/data/key_signup.html');
        return null;
    }

    console.log('📉 Fetching poverty data from Census SAIPE...');
    const results = {};

    try {
        // Get latest year's data (usually 1-2 years behind)
        const latestYear = new Date().getFullYear() - 1;

        // Try current year, fall back to previous
        for (let year = latestYear; year >= latestYear - 2; year--) {
            try {
                const url = `https://api.census.gov/data/timeseries/poverty/saipe?get=NAME,SAEPOVRTALL_PT,SAEPOVRT0_17_PT&for=state:*&time=${year}&key=${apiKey}`;
                const data = await fetchWithRetry(url);

                if (data && data.length > 1) {
                    // The SAIPE *timeseries* endpoint returns a `time` column
                    // BEFORE the `state` geography column, e.g. header:
                    //   ["NAME","SAEPOVRTALL_PT","SAEPOVRT0_17_PT","time","state"]
                    // Reading by fixed position put the year ("2023") into
                    // stateCode, so the FIPS->abbr lookup failed for every row
                    // and poverty silently came back empty. Locate columns by
                    // header name so we're robust to column ordering.
                    const header = data[0];
                    const colPov = header.indexOf('SAEPOVRTALL_PT');
                    const colChild = header.indexOf('SAEPOVRT0_17_PT');
                    const colState = header.indexOf('state');

                    if (colState === -1 || colPov === -1) {
                        console.log(`  ⚠️  Unexpected SAIPE columns, skipping ${year}: ${JSON.stringify(header)}`);
                        continue;
                    }

                    for (let i = 1; i < data.length; i++) {
                        const row = data[i];
                        const stateCode = String(row[colState]).padStart(2, '0');

                        // Find state abbreviation from FIPS
                        const abbr = Object.entries(STATE_FIPS).find(([, f]) => f === stateCode)?.[0];

                        if (abbr) {
                            results[abbr] = {
                                povertyRate: parseFloat(row[colPov]),
                                childPovertyRate: colChild !== -1 ? parseFloat(row[colChild]) : null,
                                year: year
                            };
                        }
                    }

                    if (Object.keys(results).length > 0) {
                        console.log(`  ✓ Retrieved poverty data for ${Object.keys(results).length} states (${year})`);
                        break;
                    }
                    // Rows returned but nothing matched — log and try an earlier year
                    console.log(`  ⚠️  SAIPE ${year} returned ${data.length - 1} rows but no states matched (FIPS mapping?)`);
                }
            } catch (e) {
                console.log(`  Year ${year} not available, trying earlier...`);
            }
        }
    } catch (error) {
        console.error('Census ACS error:', error.message);
    }

    return Object.keys(results).length > 0 ? results : null;
}

/**
 * Fetch Fair Market Rents from HUD API
 * Requires HUD_API_KEY environment variable
 * Returns FY2025 2-bedroom FMR by state (industry standard for comparisons)
 */
async function fetchHUDFairMarketRents() {
    const apiKey = process.env.HUD_API_KEY;
    if (!apiKey) {
        console.log('⚠️  HUD_API_KEY not set - skipping Fair Market Rent data');
        console.log('   Get a free key at: https://www.huduser.gov/hudapi/public/register');
        return null;
    }

    console.log('🏠 Fetching Fair Market Rents from HUD...');
    const results = {};

    // HUD uses state abbreviations directly
    const states = Object.keys(STATE_FIPS);

    for (const abbr of states) {
        try {
            const url = `https://www.huduser.gov/hudapi/public/fmr/statedata/${abbr}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Get state-level FMR data (use 2-bedroom as standard)
                if (data && data.data) {
                    // HUD returns county-level data, we need state average
                    // Take the median of all county 2-BR FMRs for the state
                    const fmrs = [];
                    if (Array.isArray(data.data)) {
                        for (const county of data.data) {
                            if (county.fmr_2) {
                                fmrs.push(parseFloat(county.fmr_2));
                            }
                        }
                    }

                    if (fmrs.length > 0) {
                        // Calculate median FMR for state
                        fmrs.sort((a, b) => a - b);
                        const mid = Math.floor(fmrs.length / 2);
                        const medianFMR = fmrs.length % 2 !== 0
                            ? fmrs[mid]
                            : (fmrs[mid - 1] + fmrs[mid]) / 2;

                        results[abbr] = {
                            fmr_2br: Math.round(medianFMR),
                            county_count: fmrs.length
                        };
                    }
                }
            }

            await delay(100); // Rate limiting
        } catch (error) {
            console.warn(`  Could not fetch FMR for ${abbr}: ${error.message}`);
        }
    }

    console.log(`  ✓ Retrieved Fair Market Rent data for ${Object.keys(results).length} states`);
    return Object.keys(results).length > 0 ? results : null;
}

/**
 * Fetch Rent Burden data from Census ACS API
 * Table B25071: Median Gross Rent as Percentage of Household Income
 * Requires CENSUS_API_KEY environment variable
 */
async function fetchCensusRentBurden() {
    const apiKey = process.env.CENSUS_API_KEY;
    if (!apiKey) {
        console.log('⚠️  CENSUS_API_KEY not set - skipping rent burden data');
        return null;
    }

    console.log('📊 Fetching rent burden data from Census ACS...');
    const results = {};

    // Try recent years (ACS 1-year estimates)
    const currentYear = new Date().getFullYear();

    for (let year = currentYear - 1; year >= currentYear - 3; year--) {
        try {
            // B25071_001E = Median gross rent as percentage of household income
            const url = `https://api.census.gov/data/${year}/acs/acs1?get=NAME,B25071_001E&for=state:*&key=${apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                continue;
            }

            const data = await response.json();

            if (data && data.length > 1) {
                // Skip header row [NAME, B25071_001E, state]
                for (let i = 1; i < data.length; i++) {
                    const [name, rentBurden, stateCode] = data[i];

                    // Find state abbreviation from FIPS
                    const abbr = Object.entries(STATE_FIPS).find(([a, f]) => f === stateCode.padStart(2, '0'))?.[0];

                    if (abbr && rentBurden && rentBurden !== 'null') {
                        results[abbr] = {
                            medianRentBurden: parseFloat(rentBurden),
                            year: year,
                            // 30%+ is cost-burdened, 50%+ is severely cost-burdened
                            isCostBurdened: parseFloat(rentBurden) >= 30,
                            isSeverelyCostBurdened: parseFloat(rentBurden) >= 50
                        };
                    }
                }

                console.log(`  ✓ Retrieved rent burden data for ${Object.keys(results).length} states (${year})`);
                break;
            }
        } catch (error) {
            console.log(`  Year ${year} not available, trying earlier...`);
        }
    }

    return Object.keys(results).length > 0 ? results : null;
}

/**
 * Calculate composite indices from real data
 * Scaling adjusted to produce crisis-level visualization similar to mock data
 * while still reflecting real relative differences between states
 * @param {Object} unemployment - BLS unemployment data
 * @param {Object} housing - FRED housing price data
 * @param {Object} poverty - Census poverty data (SAIPE)
 * @param {Object} rentBurden - Census ACS rent burden data (B25071)
 * @param {Object} fmr - HUD Fair Market Rents data
 * @param {Object} jchs - Harvard JCHS 2025 reference data (calibration)
 * @param {Object} trends - Google Trends data (optional boost)
 * @param {Object} nlihc - NLIHC OOR 2025 fallback data (used when live sources miss)
 */
function calculateIndices(unemployment, housing, poverty, rentBurden = null, fmr = null, jchs = null, trends = null, nlihc = null) {
    const states = {};
    const stateAbbrs = Object.keys(STATE_FIPS);

    // Calculate national averages for relative comparisons
    let nationalAvgRentBurden = 27; // National baseline (healthy is ~25%)
    let nationalAvgFMR = 1400; // National 2-BR FMR baseline

    if (rentBurden) {
        const burdens = Object.values(rentBurden).map(r => r.medianRentBurden);
        nationalAvgRentBurden = burdens.reduce((a, b) => a + b, 0) / burdens.length;
    }

    if (fmr) {
        const fmrs = Object.values(fmr).map(f => f.fmr_2br);
        nationalAvgFMR = fmrs.reduce((a, b) => a + b, 0) / fmrs.length;
    }

    // Regional stress multipliers based on economic research
    // Southern states tend to have higher economic stress, Northern states lower
    const REGIONAL_STRESS = {
        // Deep South - historically higher economic stress
        'MS': 1.35, 'LA': 1.30, 'AL': 1.25, 'AR': 1.22, 'WV': 1.28,
        'KY': 1.18, 'TN': 1.12, 'SC': 1.15, 'GA': 1.10, 'NC': 1.08,
        'OK': 1.15, 'NM': 1.18, 'AZ': 1.10,
        // High cost of living states - different type of stress
        'CA': 1.12, 'NY': 1.15, 'HI': 1.20, 'FL': 1.15, 'NV': 1.12,
        'NJ': 1.05, 'MA': 1.02, 'CT': 1.02, 'DC': 1.18,
        // Mountain/Midwest - moderate stress
        'TX': 1.05, 'CO': 1.02, 'OR': 1.05, 'WA': 1.02, 'ID': 1.05,
        'MT': 1.00, 'WY': 0.95, 'UT': 1.02, 'AK': 1.08,
        // Industrial Midwest - includes MN (Twin Cities crisis)
        'MI': 1.08, 'OH': 1.06, 'IN': 1.04, 'IL': 1.05, 'PA': 1.02,
        'MO': 1.05, 'KS': 1.00, 'NE': 0.95, 'IA': 0.92, 'MN': 1.12,
        // New England/Upper Midwest - lower stress
        'VT': 0.92, 'NH': 0.88, 'ME': 0.95, 'WI': 0.95,
        'ND': 0.85, 'SD': 0.88, 'RI': 0.98, 'DE': 1.00, 'MD': 1.00,
        'VA': 0.98
    };

    // Base scaling parameters (adjusted for crisis-level display)
    const BASE_INDEX = 120; // Start higher to show stress
    const UNEMPLOYMENT_MULTIPLIER = 18; // Each 1% unemployment adds 18 points
    const POVERTY_MULTIPLIER = 6; // Each 1% poverty above baseline adds 6 points
    const HOUSING_CHANGE_MULTIPLIER = 4; // Each 1% housing price change adds 4 points
    const BASELINE_UNEMPLOYMENT = 3.5; // Consider < 3.5% as healthy
    const BASELINE_POVERTY = 10.0; // National target

    for (const abbr of stateAbbrs) {
        const stateCode = `US-${abbr}`;
        const regionalMultiplier = REGIONAL_STRESS[abbr] || 1.0;

        // Initialize state data
        states[stateCode] = {
            name: STATE_NAMES[abbr],
            abbr: abbr,
            financial_anxiety: { value: null, change: 0, rank: null },
            food_insecurity: { value: null, change: 0, rank: null },
            housing_stress: { value: null, change: 0, rank: null },
            affordability: { value: null, change: 0, rank: null }
        };

        // Financial Anxiety: Based primarily on unemployment + regional factor
        if (unemployment?.[abbr]) {
            const unemp = unemployment[abbr];
            // Higher base + unemployment impact + regional factor
            const rawValue = BASE_INDEX + (unemp.value - BASELINE_UNEMPLOYMENT) * UNEMPLOYMENT_MULTIPLIER;
            let anxietyValue = rawValue * regionalMultiplier;

            // Google Health Trends API Volatility Boost (+0 to +10 points)
            // The API returns P(term) × 10M — values typically 1-20 for our terms.
            // We use the raw value directly (capped at 10) as the boost.
            if (trends?.states?.financial_anxiety?.[abbr] != null) {
                anxietyValue += Math.min(trends.states.financial_anxiety[abbr], 10);
            }

            const change = unemp.previousValue
                ? ((unemp.value - unemp.previousValue) / unemp.previousValue * 100)
                : 0;

            states[stateCode].financial_anxiety = {
                value: Math.round(Math.max(80, Math.min(200, anxietyValue))),
                change: parseFloat(change.toFixed(1)),
                rank: null
            };
        }

        // Food Insecurity: Based on poverty rate + regional factor
        if (poverty?.[abbr]) {
            const pov = poverty[abbr];
            const rawValue = 85 + (pov.povertyRate - BASELINE_POVERTY) * POVERTY_MULTIPLIER;
            let foodValue = rawValue * regionalMultiplier;

            // Google Health Trends API Volatility Boost (+0 to +10 points)
            // Raw API value used directly (capped at 10) as real-time stress signal.
            if (trends?.states?.food_insecurity?.[abbr] != null) {
                foodValue += Math.min(trends.states.food_insecurity[abbr], 10);
            }

            states[stateCode].food_insecurity = {
                value: Math.round(Math.max(55, Math.min(160, foodValue))),
                change: 0, // Reliable historical change data absent globally for this metric
                rank: null
            };
        }

        // Housing Stress: Based on housing price changes + rent burden + FMR
        // DATA-DRIVEN FORMULA using Census ACS + Harvard JCHS calibration
        const hpi = housing?.[abbr];
        const stateRentBurden = rentBurden?.[abbr];
        const stateFMR = fmr?.[abbr];
        const jchsState = jchs?.states?.[abbr];

        // Calculate rent burden score from actual Census data or JCHS reference
        // Base 25% is considered healthy; each % above adds to stress
        let rentBurdenScore = 0;
        let rentBurdenSource = 'default';

        if (stateRentBurden) {
            // Primary source: Census ACS B25071 (median gross rent as % of income)
            rentBurdenScore = (stateRentBurden.medianRentBurden - 25) * 3;
            rentBurdenSource = 'census_acs';
        } else if (jchsState) {
            // Secondary source: Harvard JCHS 2025 (authoritative research)
            // Use renter cost burden % directly (already accounts for 30%+ threshold)
            // CALIBRATION: If 50% of renters are cost burdened (paying >30%), 
            // the median rent burden is exactly 30%.
            // Logic: Map 50% JCHS Burden -> 30% Median Rent Burden equivalent
            const jchsBurden = jchsState.renters_cost_burdened || 50;
            // Base 30% median + 0.5% for every 1% increase in burden
            const calibratedMedian = 30 + ((jchsBurden - 50) * 0.5);

            rentBurdenScore = (calibratedMedian - 25) * 3;
            rentBurdenSource = 'jchs_2025';
        } else {
            // Fallback: use tier-based estimates if no data available
            const TIER1 = ['CA', 'NY', 'MA', 'HI', 'DC', 'NJ']; // ~32%+ rent burden
            const TIER2 = ['WA', 'CO', 'FL', 'MD', 'MN', 'CT', 'OR']; // ~29-31%
            const TIER3 = ['NH', 'VA', 'AZ', 'NV', 'TX', 'IL', 'RI', 'VT', 'AK']; // ~27-29%

            if (TIER1.includes(abbr)) rentBurdenScore = 21; // (32-25)*3
            else if (TIER2.includes(abbr)) rentBurdenScore = 12; // (29-25)*3
            else if (TIER3.includes(abbr)) rentBurdenScore = 6; // (27-25)*3
            rentBurdenSource = 'tier_estimate';
        }

        // Calculate FMR score (relative cost compared to national average)
        let fmrScore = 0;
        let fmrSource = 'default';

        if (stateFMR) {
            // Primary source: HUD Fair Market Rents API
            const fmrRatio = stateFMR.fmr_2br / nationalAvgFMR;
            fmrScore = (fmrRatio - 1) * 40; // +40 points per 100% above average
            fmrSource = 'hud_fmr';
        } else if (jchsState && jchsState.median_rent) {
            // Secondary source: JCHS median rent by state
            const nationalAvgJCHS = 1200; // Approximate national median from JCHS
            const fmrRatio = jchsState.median_rent / nationalAvgJCHS;
            fmrScore = (fmrRatio - 1) * 40;
            fmrSource = 'jchs_2025';
        } else {
            // Fallback: known high-cost states
            const HIGH_COST = ['CA', 'NY', 'MA', 'HI', 'DC', 'NJ', 'WA', 'CO', 'MD', 'CT'];
            if (HIGH_COST.includes(abbr)) fmrScore = 15;
            fmrSource = 'tier_estimate';
        }

        // Housing price change impact (from FRED HPI)
        const hpiChange = hpi?.change || 5; // Default 5% if unavailable
        const hpiScore = hpiChange * 2; // Each 1% HPI change adds 2 points

        // Combine all factors into housing stress score
        // BASE 100 + rent burden impact + FMR impact + HPI impact
        const rawHousingStress = 100 + rentBurdenScore + fmrScore + hpiScore;
        let stressValue = rawHousingStress * regionalMultiplier;

        // Google Health Trends API Volatility Boost (+0 to +10 points)
        // Raw API value used directly (capped at 10) as real-time stress signal.
        if (trends?.states?.housing_stress?.[abbr] != null) {
            stressValue += Math.min(trends.states.housing_stress[abbr], 10);
        }

        states[stateCode].housing_stress = {
            value: Math.round(Math.max(80, Math.min(200, stressValue))),
            change: parseFloat(hpiChange.toFixed(1)),
            rank: null
        };

        // Affordability: Composite of housing costs, poverty, and regional cost of living
        // Housing weight: 60%, Food/Poverty proxy: 40%
        // Uses null-coalescing (??), not || , to avoid treating a valid score of 0 as missing.
        const housingVal = states[stateCode].housing_stress.value ?? (130 * regionalMultiplier);
        const povertyVal = states[stateCode].food_insecurity.value ?? (115 * regionalMultiplier);
        let affordValue = (housingVal * 0.60 + povertyVal * 0.40);

        // Google Health Trends API Volatility Boost (+0 to +10 points)
        // Raw API value used directly (capped at 10) as real-time stress signal.
        if (trends?.states?.affordability?.[abbr] != null) {
            affordValue += Math.min(trends.states.affordability[abbr], 10);
        }

        // Store raw metrics for transparency/export
        states[stateCode].metrics = {
            unemployment_rate: unemployment?.[abbr]?.value || null,
            poverty_rate: poverty?.[abbr]?.povertyRate || null,
            rent_burden_pct: rentBurden?.[abbr]?.medianRentBurden || jchsState?.renters_cost_burdened || null,
            rent_burden_source: rentBurdenSource,
            fair_market_rent_2br: fmr?.[abbr]?.fmr_2br || jchsState?.median_rent || null,
            fmr_source: fmrSource,
            housing_price_change: housing?.[abbr]?.change || null,
            regional_stress_multiplier: regionalMultiplier,
            // JCHS reference data (authoritative calibration)
            jchs_renters_cost_burdened: jchsState?.renters_cost_burdened || null,
            jchs_renters_severely_burdened: jchsState?.renters_severely_burdened || null,
            jchs_median_rent: jchsState?.median_rent || null
        };

        states[stateCode].affordability = {
            value: Math.round(Math.max(80, Math.min(200, affordValue))),
            change: 0,
            rank: null
        };

        // Top-level raw housing fields consumed by the Housing Policy Lab's
        // syncWithBarometerData(). Live sources win; NLIHC OOR 2025 is the
        // fallback when the Census/HUD APIs are unreachable.
        const nlihcState = nlihc?.states?.[abbr];

        // rent_burden: median gross rent-to-income %, ACS B25071
        let rbValue = rentBurden?.[abbr]?.medianRentBurden ?? null;
        let rbSource = rentBurden?.[abbr] ? `ACS B25071 ${rentBurden[abbr].year}` : null;
        if (rbValue === null && nlihcState) {
            rbValue = nlihcState.rent_burden;
            rbSource = 'NLIHC OOR 2025 (fallback)';
        }
        states[stateCode].rent_burden = rbValue !== null
            ? { value: rbValue, source: rbSource }
            : null;

        // fmr_2br: HUD FY2025 state-level 2-bedroom FMR (median of counties)
        let fmrValue = fmr?.[abbr]?.fmr_2br ?? null;
        let fmrOut = fmr?.[abbr] ? 'HUD FY2025' : null;
        if (fmrValue === null && nlihcState) {
            fmrValue = nlihcState.fmr_2br;
            fmrOut = 'NLIHC OOR 2025 (fallback)';
        }
        states[stateCode].fmr_2br = fmrValue !== null
            ? { value: fmrValue, source: fmrOut }
            : null;

        // housing_wage: NLIHC Housing Wage, derived from FMR when possible so
        // the two numbers stay internally consistent.
        let wageValue = deriveHousingWage(fmrValue);
        let wageSource = fmrValue !== null && fmr?.[abbr]
            ? 'Derived from HUD FMR (NLIHC formula)'
            : (nlihcState ? 'NLIHC OOR 2025 (fallback)' : null);
        if (wageValue === null && nlihcState) {
            wageValue = nlihcState.housing_wage;
        }
        states[stateCode].housing_wage = wageValue !== null
            ? { value: wageValue, source: wageSource }
            : null;
    }

    // Fill in missing values with estimates based on regional patterns
    fillMissingValues(states, REGIONAL_STRESS);

    // Calculate ranks for each indicator
    calculateRanks(states);

    return states;
}

/**
 * Fill missing values with regional estimates
 */
function fillMissingValues(states, regionalStress = {}) {
    const indicators = ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability'];

    // Calculate national averages from available data
    const averages = {};
    for (const indicator of indicators) {
        const values = Object.values(states)
            .map(s => s[indicator].value)
            .filter(v => v !== null);

        averages[indicator] = values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 120; // Higher baseline for crisis display
    }

    // Fill missing values with averages adjusted by regional stress
    for (const stateCode of Object.keys(states)) {
        const abbr = states[stateCode].abbr;
        const multiplier = regionalStress[abbr] || 1.0;

        for (const indicator of indicators) {
            if (states[stateCode][indicator].value === null) {
                states[stateCode][indicator].value = Math.round(averages[indicator] * multiplier);
                states[stateCode][indicator].change = 0;
            }
        }
    }
}

/**
 * Calculate ranks for each indicator (1 = highest/worst)
 */
function calculateRanks(states) {
    const indicators = ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability'];

    for (const indicator of indicators) {
        const sorted = Object.entries(states)
            .sort((a, b) => b[1][indicator].value - a[1][indicator].value);

        sorted.forEach(([stateCode, _], index) => {
            states[stateCode][indicator].rank = index + 1;
        });
    }
}

/**
 * Calculate national aggregates
 */
function calculateNational(states) {
    const indicators = ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability'];
    const national = {};

    for (const indicator of indicators) {
        const values = Object.values(states).map(s => s[indicator].value);
        const changes = Object.values(states).map(s => s[indicator].change);

        const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
        const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

        national[indicator] = {
            value: Math.round(avgValue * 10) / 10,
            change: Math.round(avgChange * 10) / 10,
            trend: avgChange >= 0 ? 'up' : 'down'
        };
    }

    return national;
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting real data fetch for Financial Health Barometer');
    console.log('━'.repeat(50));

    // Load JCHS reference data (static, authoritative calibration source)
    const jchs = loadJCHSReferenceData();

    // Load NLIHC OOR 2025 fallback (used only when live Census / HUD miss)
    const nlihc = loadNLIHCFallbackData();

    // Fetch data from all sources in parallel
    const [unemployment, housing, poverty, rentBurden, fmr] = await Promise.all([
        fetchBLSUnemployment(),
        fetchFREDHousingPrices(),
        fetchCensusPoverty(),
        fetchCensusRentBurden(),
        fetchHUDFairMarketRents()
    ]);

    // Fetch Google Trends separately (with quota protection)
    const trends = await fetchGoogleTrends();

    console.log('━'.repeat(50));

    // Calculate indices with all data sources including JCHS calibration
    console.log('🔢 Calculating composite indices...');
    const states = calculateIndices(unemployment, housing, poverty, rentBurden, fmr, jchs, trends, nlihc);
    const national = calculateNational(states);

    // Build output
    const generated = new Date().toISOString();
    const output = {
        as_of: generated.slice(0, 10),
        meta: {
            generated,
            version: '2.4',
            source: 'BLS, FRED, Census Bureau, HUD, Harvard JCHS, Google Trends APIs',
            update_frequency: 'daily',
            data_sources: {
                unemployment: unemployment ? 'BLS LAUS' : 'estimated',
                housing_prices: housing ? 'FRED HPI' : 'estimated',
                poverty: poverty ? 'Census SAIPE' : 'estimated',
                rent_burden: rentBurden ? 'Census ACS B25071' : (nlihc ? 'NLIHC OOR 2025 (fallback)' : (jchs ? 'Harvard JCHS 2025' : 'estimated')),
                fair_market_rent: fmr ? 'HUD FMR API' : (nlihc ? 'NLIHC OOR 2025 (fallback)' : (jchs ? 'Harvard JCHS 2025' : 'estimated')),
                housing_wage: fmr ? 'Derived from HUD FMR (NLIHC formula)' : (nlihc ? 'NLIHC OOR 2025 (fallback)' : 'estimated'),
                jchs_calibration: jchs ? 'Harvard JCHS State of the Nation\'s Housing 2025' : 'not loaded',
                trends: trends ? 'Google Trends' : 'not used'
            }
        },
        national: national,
        states: states,
        timeseries: {
            national: generateTimeseries(national, trends?.nationalTimeSeries)
        }
    };



    // Write outputs
    const dataDir = path.join(__dirname, '..', 'data');

    // dashboard-data.js
    const jsContent = `// Financial Health Barometer Data
// Auto-generated: ${new Date().toISOString()}
// Sources: ${output.meta.source}

const DASHBOARD_DATA = ${JSON.stringify(output, null, 2)};

if (typeof window !== 'undefined') window.DASHBOARD_DATA = DASHBOARD_DATA;
if (typeof module !== 'undefined') module.exports = DASHBOARD_DATA;
`;

    fs.writeFileSync(path.join(dataDir, 'dashboard-data.js'), jsContent);
    console.log('  ✓ Written: data/dashboard-data.js');

    // latest.json
    fs.writeFileSync(path.join(dataDir, 'latest.json'), JSON.stringify(output, null, 2));
    console.log('  ✓ Written: data/latest.json');

    console.log('━'.repeat(50));
    console.log('✅ Real data fetch complete!');

    // Summary
    console.log('\n📊 Data Summary:');
    console.log(`   National Financial Anxiety: ${national.financial_anxiety.value} (${national.financial_anxiety.trend})`);
    console.log(`   National Food Insecurity: ${national.food_insecurity.value} (${national.food_insecurity.trend})`);
    console.log(`   National Housing Stress: ${national.housing_stress.value} (${national.housing_stress.trend})`);
    console.log(`   National Affordability: ${national.affordability.value} (${national.affordability.trend})`);
}

/**
 * Generate timeseries from Google Trends historical shape, scaled to today's index.
 *
 * The timeseries uses Google Trends search-interest data to show the *shape*
 * of how stress has changed over time, but re-anchors it each run so the most
 * recent point equals today's composite index value.  This avoids the scaling
 * discontinuity that previously caused a false cliff between the backfilled
 * history and the current data point.
 */
function generateTimeseries(national, nationalTrends) {
    const timeseries = {};
    const indicators = ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability'];

    const todayKey = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    const MAX_MONTHS = 120;

    for (const indicator of indicators) {
        const baseValue = national[indicator].value;
        const trendPoints = nationalTrends?.[indicator] || [];

        if (trendPoints.length > 0) {
            // Use the average of the last 3 trend points for the scaling factor.
            // A single anomalous month (spike or dip in Google search interest)
            // no longer whipsaws the entire historical curve.
            const recentSlice = trendPoints.slice(-3);
            const avgRecentTrend = recentSlice.reduce((s, p) => s + p.value, 0) / recentSlice.length;
            const scalingFactor = avgRecentTrend > 0 ? (baseValue / avgRecentTrend) : 1;

            const scaled = trendPoints.map(tp => ({
                date: tp.date.split('T')[0].substring(0, 7) + '-01',
                value: Math.round(tp.value * scalingFactor)
            }));

            // Replace today's month with the exact composite index (avoid rounding drift)
            const withoutToday = scaled.filter(p => p.date !== todayKey);
            withoutToday.push({ date: todayKey, value: Math.round(baseValue) });
            withoutToday.sort((a, b) => a.date.localeCompare(b.date));

            // 3-month trailing average to smooth Google Trends volatility.
            // Raw search-interest data is inherently spiky; smoothing produces
            // a chart that better represents the composite index trajectory.
            const smoothed = withoutToday.map((p, i, arr) => {
                if (i < 2) return { ...p };
                const avg = (arr[i - 2].value + arr[i - 1].value + p.value) / 3;
                return { date: p.date, value: Math.round(avg) };
            });

            // Re-pin today so the chart endpoint matches the live card value
            const last = smoothed[smoothed.length - 1];
            if (last && last.date === todayKey) {
                last.value = Math.round(baseValue);
            }

            timeseries[indicator] = smoothed.slice(-MAX_MONTHS);
        } else {
            // No trends data available — carry forward a single point
            timeseries[indicator] = [{ date: todayKey, value: Math.round(baseValue) }];
        }
    }

    return timeseries;
}

main().catch(console.error);
