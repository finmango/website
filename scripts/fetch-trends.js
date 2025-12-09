/**
 * FinMango Research - Fetch Google Health Trends Logic
 * uses the private Google Trends API (v1beta) with the provided API Key.
 * Endpoint: https://www.googleapis.com/trends/v1beta/graph
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_TRENDS_API_KEY || 'AIzaSyDA69jVBXP5ga4op9OC_RK8m64rFNLBrmo';
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

// Returns the last value (most recent)
async function fetchRegionData(region, term) {
    // We want recent data. Let's ask for last 12 months to ensure we get a "line".
    // API param format: YYYY-MM
    // To be safe and get "Pulse", we can ask for specific range, but 'graph' often quantizes to months.
    // Let's try without start/end first to see default (2004-now), but that's heavy.
    // Specifying restrictions.startDate is better.

    // Calculate 3 months ago YYYY-MM
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    const startDate = d.toISOString().slice(0, 7); // YYYY-MM

    const url = `${BASE_URL}?terms=${encodeURIComponent(term)}&restrictions.geo=${region}&restrictions.startDate=${startDate}&key=${API_KEY}`;

    try {
        const res = await fetch(url);
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
        console.error(`Failed to fetch ${term} for ${region}:`, e.message);
        // Fallback or retry logic could go here.
        // For dashboard integrity, returning 0 or previous value is safer than crashing.
        return 0;
    }
}

async function main() {
    console.log('Starting Daily Data Fetch via Official API Key...');

    const timestamp = new Date().toISOString().split('T')[0];
    const rawData = {};

    // Use serial execution to be polite to the API rate limits
    for (const region of REGIONS) {
        console.log(`Processing ${region}...`);
        rawData[region] = {};

        for (const [indicator, terms] of Object.entries(INDICATOR_TERMS)) {
            rawData[region][indicator] = {};
            for (const term of terms) {
                // Throttle: 200ms
                await new Promise(r => setTimeout(r, 200));
                const val = await fetchRegionData(region, term);
                rawData[region][indicator][term] = val;
            }
        }
    }

    // Save Raw Data
    const rawDir = path.join(__dirname, '../data/raw');
    if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

    fs.writeFileSync(
        path.join(rawDir, `raw-${timestamp}.json`),
        JSON.stringify(rawData, null, 2)
    );

    console.log('Fetch complete. Saved raw data.');
}

if (require.main === module) {
    main().catch(console.error);
}
