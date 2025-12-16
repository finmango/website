/**
 * FinMango Research - Fetch Google Health Trends Logic
 * uses the private Google Trends API (v1beta) with the provided API Key.
 * Endpoint: https://www.googleapis.com/trends/v1beta/graph
 */

const fs = require('fs');
const path = require('path');

// Ensure API key is present
// Ensure API key is present
const API_KEY = process.env.GOOGLE_TRENDS_API_KEY;
if (!API_KEY) {
    console.warn("WARNING: GOOGLE_TRENDS_API_KEY environment variable is missing. Fetch will be skipped.");
}

const BASE_URL = 'https://www.googleapis.com/trends/v1beta/graph';

// US States + DC
const REGIONS = [
    'US-AL', 'US-AK', 'US-AZ', 'US-AR', 'US-CA', 'US-CO', 'US-CT', 'US-DE', 'US-FL', 'US-GA',
    'US-HI', 'US-ID', 'US-IL', 'US-IN', 'US-IA', 'US-KS', 'US-KY', 'US-LA', 'US-ME', 'US-MD',
    'US-MA', 'US-MI', 'US-MN', 'US-MS', 'US-MO', 'US-MT', 'US-NE', 'US-NV', 'US-NH', 'US-NJ',
    'US-NM', 'US-NY', 'US-NC', 'US-ND', 'US-OH', 'US-OK', 'US-OR', 'US-PA', 'US-RI', 'US-SC',
    'US-SD', 'US-TN', 'US-TX', 'US-UT', 'US-VT', 'US-VA', 'US-WA', 'US-WV', 'US-WI', 'US-WY',
    'US-DC'
];

const INDICATOR_TERMS = {
    financial_anxiety: [
        "debt help", "bankruptcy", "payday loan", "can't pay rent", "debt relief", "debt collector",
        "credit card debt", "student loan forgiveness", "borrow money", "pawn shop", "overdraft fees"
    ],
    food_insecurity: [
        "food stamps", "food bank near me", "SNAP benefits", "free food", "food pantry", "EBT balance",
        "apply for food stamps", "WIC program", "cheap meals", "grocery assistance"
    ],
    housing_stress: [
        "eviction help", "rent assistance", "housing assistance", "facing eviction", "tenant rights", "behind on rent",
        "homeless shelter", "emergency housing", "section 8 application", "unable to pay rent"
    ],
    affordability: [
        "cost of living", "prices too high", "can't afford", "inflation help", "cheap groceries", "budget tips",
        "gas prices", "utility bill help", "electricity bill assistance", "save money on groceries"
    ]
};

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Returns the last value (most recent) with Retry Logic
async function fetchRegionData(region, term, retries = 3) {
    // Calculate 3 months ago YYYY-MM
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    const startDate = d.toISOString().slice(0, 7); // YYYY-MM

    const url = `${BASE_URL}?terms=${encodeURIComponent(term)}&restrictions.geo=${region}&restrictions.startDate=${startDate}&key=${API_KEY}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url);

            if (res.status === 429) {
                // Rate limited - wait longer (exponential backoff)
                const waitTime = 1000 * Math.pow(2, attempt);
                console.warn(`Rate limit hit for ${term} in ${region}. Waiting ${waitTime}ms...`);
                await sleep(waitTime);
                continue;
            }

            if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);

            const data = await res.json();

            // Structure: { lines: [ { points: [ { value: 50, date: "..." } ] } ] }
            if (data.lines && data.lines.length > 0 && data.lines[0].points) {
                const points = data.lines[0].points;
                const lastPoint = points[points.length - 1];
                return lastPoint ? lastPoint.value : 0;
            }
            return 0; // No data returned

        } catch (e) {
            if (attempt === retries) {
                console.error(`Failed to fetch ${term} for ${region} after ${retries} attempts:`, e.message);
                return null; // Return null on final failure to signal circuit breaker
            }
        }
    }
    return 0;
}

async function main() {
    console.log('Starting Daily Data Fetch via Official API Key...');

    const timestamp = new Date().toISOString().split('T')[0];
    const rawData = {};
    let errorCount = 0;

    // Use serial execution to be polite to the API rate limits
    let consecutiveFailures = 0;

    // Use serial execution to be polite to the API rate limits
    if (API_KEY) {
        outerLoop:
        for (const region of REGIONS) {
            console.log(`Processing ${region}...`);
            rawData[region] = {};

            for (const [indicator, terms] of Object.entries(INDICATOR_TERMS)) {
                rawData[region][indicator] = {};
                for (const term of terms) {
                    if (consecutiveFailures >= 5) {
                        console.error("CRITICAL: Too many consecutive failures (Rate Limit?). Aborting fetch.");
                        break outerLoop;
                    }

                    // Base throttle: 2000ms (to avoid 429 rate limits)
                    await sleep(2000);

                    const val = await fetchRegionData(region, term);

                    if (val === null) {
                        consecutiveFailures++;
                        rawData[region][indicator][term] = 0; // Default to 0 so downstream doesn't break
                    } else {
                        consecutiveFailures = 0; // Reset on success
                    }

                    rawData[region][indicator][term] = val;
                }
            }
        }
    }

    // Save Raw Data
    const rawDir = path.join(__dirname, '../data/raw');
    if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

    const outputFile = path.join(rawDir, `raw-${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(rawData, null, 2));

    console.log(`Fetch complete. Saved raw data to ${outputFile}`);
}

if (require.main === module) {
    main().catch(error => {
        console.error("Critical failure in main execution:", error);
        process.exit(1);
    });
}
