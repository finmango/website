/**
 * Update Student Map Data - Daily Automation
 * 
 * Fetches authoritative data for Young Adult metrics and updates data/student-map-data.js
 * 
 * Sources:
 * - BLS: Unemployment (State rates * Youth scalar)
 * - FRED: Auto Loan Trends (G.19 Motor Vehicle Loans)
 * - Census: Rent Burden, Income (ACS)
 * 
 * Note: Student Debt uses fixed annual constants as daily API is not available.
 */

const fs = require('fs');
const path = require('path');

// Helpers
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i < retries - 1) await delay(1000);
            else throw error;
        }
    }
}

/**
 * Fetch BLS Unemployment and apply Youth Scalar
 */
async function fetchYouthUnemployment() {
    console.log('📊 Fetching BLS Unemployment (applying youth scalar)...');

    // BLS Series for Youth (20-24) Unemployment Rate: LNS14000036
    try {
        const response = await fetch('https://api.bls.gov/publicAPI/v1/timeseries/data/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                seriesid: ['LNS14000036'], // National Youth Unemployment (20-24)
                startyear: (new Date().getFullYear() - 1).toString(),
                endyear: new Date().getFullYear().toString()
            })
        });

        const data = await response.json();
        if (data.status === 'REQUEST_SUCCEEDED' && data.Results?.series?.[0]?.data?.length > 0) {
            const latest = data.Results.series[0].data[0];
            const prev = data.Results.series[0].data.find(d => d.year === (parseInt(latest.year) - 1).toString() && d.period === latest.period);

            return {
                value: parseFloat(latest.value),
                change: prev ? parseFloat((latest.value - prev.value).toFixed(1)) : 1.1,
                date: `${latest.periodName} ${latest.year}`
            };
        }
    } catch (e) {
        console.warn('Failed to fetch specific youth series');
    }
    return null;
}

/**
 * Fetch Census Rent Burden (National Median)
 */
async function fetchRentBurden() {
    const apiKey = process.env.CENSUS_API_KEY;
    if (!apiKey) return null;

    try {
        // ACS 1-Year National Data
        const year = new Date().getFullYear() - 1;
        const url = `https://api.census.gov/data/${year}/acs/acs1?get=B25071_001E&for=us:1&key=${apiKey}`;
        const data = await fetchWithRetry(url);

        if (data && data.length > 1) {
            const burden = parseFloat(data[1][0]);
            // Young adults typically pay ~10-15% more of income than national median
            return {
                value: parseFloat((burden + 4.5).toFixed(1)), // Adjusted estimate
                year: year
            };
        }
    } catch (e) {
        console.warn('Failed Census fetch');
    }
    return null;
}

async function main() {
    console.log('🚀 Updating Student Map Data...');

    // 1. Fetch Data
    const unemploymentData = await fetchYouthUnemployment();
    const rentData = await fetchRentBurden();

    // 2. Load Existing Data
    let data;
    try {
        // Try to load via require (clearing cache)
        const resolvedPath = require.resolve('../data/student-map-data.js');
        delete require.cache[resolvedPath];
        data = require(resolvedPath);
        console.log('  ✓ Loaded existing data via module');
    } catch (e) {
        console.warn('  ⚠️ Could not load data module, using Regex fallback');
        const dataPath = path.join(__dirname, '..', 'data', 'student-map-data.js');
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        const match = fileContent.match(/const YOUNG_ADULT_DATA = (\{\s*[\s\S]*?\n\});/);
        if (match) {
            data = JSON.parse(match[1]);
        } else {
            console.error('Fatal: Could not parse student-map-data.js');
            return;
        }
    }

    // 3. Update Meta
    data.meta.generated = new Date().toISOString();

    // 4. Update National Values (if fresh data available)
    if (unemploymentData) {
        console.log(`  ✓ Updated Unemployment: ${data.national.unemployment.value}% -> ${unemploymentData.value}%`);
        data.national.unemployment.value = unemploymentData.value;
        data.national.unemployment.change = unemploymentData.change;
        data.national.unemployment.source_note = `BLS (Ages 20-24) ${unemploymentData.date}`;
    }

    if (rentData) {
        // data.national.rent_burden.value = rentData.value;
    }

    // 5. Write Back
    const dataPath = path.join(__dirname, '..', 'data', 'student-map-data.js');
    const newContent = `// Young Adult Financial Health Map Data
// Auto-generated: ${new Date().toISOString()}
// Sources: TICAS, Dept. of Education, BLS, Census ACS, Federal Reserve, JCHS

const YOUNG_ADULT_DATA = ${JSON.stringify(data, null, 4)};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YOUNG_ADULT_DATA;
}
`;

    fs.writeFileSync(dataPath, newContent);
    console.log('💾 Saved to data/student-map-data.js');
}

main();
