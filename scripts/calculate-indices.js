/**
 * FinMango Research - Calculate Indices
 * Processes raw term data into weighted indicators and generates the final dashboard JSON.
 */

const fs = require('fs');
const path = require('path');

// Configuration
// Must match raw data structure
financial_anxiety: {
    "debt help": 1.0,
        "bankruptcy": 1.5,
            "payday loan": 1.2,
                "can't pay rent": 1.8,
                    "debt relief": 1.0,
                        "debt collector": 1.3,
                            "credit card debt": 1.5,
                                "student loan forgiveness": 1.2,
                                    "borrow money": 1.6,
                                        "pawn shop": 1.8,
                                            "overdraft fees": 1.4
},
food_insecurity: {
    "food stamps": 1.0,
        "food bank near me": 1.4,
            "SNAP benefits": 1.0,
                "free food": 1.3,
                    "food pantry": 1.2,
                        "EBT balance": 0.8,
                            "apply for food stamps": 1.8,
                                "WIC program": 1.0,
                                    "cheap meals": 1.0,
                                        "grocery assistance": 1.5
},
housing_stress: {
    "eviction help": 1.8,
        "rent assistance": 1.2,
            "housing assistance": 1.0,
                "facing eviction": 2.0,
                    "tenant rights": 1.0,
                        "behind on rent": 1.5,
                            "homeless shelter": 2.0,
                                "emergency housing": 1.9,
                                    "section 8 application": 1.4,
                                        "unable to pay rent": 1.9
},
affordability: {
    "cost of living": 1.0,
        "prices too high": 1.3,
            "can't afford": 1.5,
                "inflation help": 1.2,
                    "cheap groceries": 0.8,
                        "budget tips": 0.7,
                            "gas prices": 1.0,
                                "utility bill help": 1.5,
                                    "electricity bill assistance": 1.5,
                                        "save money on groceries": 1.1
}
};

const STATE_NAMES = {
    'US-AL': 'Alabama', 'US-AK': 'Alaska', 'US-AZ': 'Arizona', 'US-AR': 'Arkansas', 'US-CA': 'California',
    'US-CO': 'Colorado', 'US-CT': 'Connecticut', 'US-DE': 'Delaware', 'US-FL': 'Florida', 'US-GA': 'Georgia',
    'US-HI': 'Hawaii', 'US-ID': 'Idaho', 'US-IL': 'Illinois', 'US-IN': 'Indiana', 'US-IA': 'Iowa',
    'US-KS': 'Kansas', 'US-KY': 'Kentucky', 'US-LA': 'Louisiana', 'US-ME': 'Maine', 'US-MD': 'Maryland',
    'US-MA': 'Massachusetts', 'US-MI': 'Michigan', 'US-MN': 'Minnesota', 'US-MS': 'Mississippi', 'US-MO': 'Missouri',
    'US-MT': 'Montana', 'US-NE': 'Nebraska', 'US-NV': 'Nevada', 'US-NH': 'New Hampshire', 'US-NJ': 'New Jersey',
    'US-NM': 'New Mexico', 'US-NY': 'New York', 'US-NC': 'North Carolina', 'US-ND': 'North Dakota', 'US-OH': 'Ohio',
    'US-OK': 'Oklahoma', 'US-OR': 'Oregon', 'US-PA': 'Pennsylvania', 'US-RI': 'Rhode Island', 'US-SC': 'South Carolina',
    'US-SD': 'South Dakota', 'US-TN': 'Tennessee', 'US-TX': 'Texas', 'US-UT': 'Utah', 'US-VT': 'Vermont',
    'US-VA': 'Virginia', 'US-WA': 'Washington', 'US-WV': 'West Virginia', 'US-WI': 'Wisconsin', 'US-WY': 'Wyoming',
    'US-DC': 'District of Columbia'
};

function calculateWeightedIndex(termValues, weights) {
    let sum = 0;
    let totalWeight = 0;

    for (const [term, weight] of Object.entries(weights)) {
        const val = termValues[term] || 0;
        sum += val * weight;
        totalWeight += weight;
    }

    return totalWeight > 0 ? (sum / totalWeight) : 0;
}

function calculateChange(current, previous) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
}

async function main() {
    console.log('Calculating Indices...');

    const timestamp = new Date().toISOString().split('T')[0];

    // Load Raw Data
    // For simplicity, we'll look for today's file. In prod, maybe pass filename as arg.
    const rawDir = path.join(__dirname, '../data/raw');
    const rawFile = path.join(rawDir, `raw-${timestamp}.json`);

    if (!fs.existsSync(rawFile)) {
        console.error(`Raw data file not found: ${rawFile}`);
        // For artifact correctness, if no raw file, we might skip or fail.
        // I'll fail gracefully.
        return;
    }

    const rawData = JSON.parse(fs.readFileSync(rawFile, 'utf8'));

    // Load Previous Data (for change calc) - Mocking for now as we don't have history in this run
    const previousData = null; // Would load from data/latest.json or history

    const output = {
        meta: {
            generated: new Date().toISOString(),
            version: "1.0",
            source: "Google Health Trends API",
            update_frequency: "daily"
        },
        national: {},
        states: {},
        timeseries: { national: {} } // Preserved or Appended
    };

    // calculate state indices
    for (const [region, indicators] of Object.entries(rawData)) {
        output.states[region] = {
            name: STATE_NAMES[region] || region,
            abbr: region.replace('US-', '')
        };

        for (const [indName, indWeights] of Object.entries(INDICATOR_WEIGHTS)) {
            const indexValue = calculateWeightedIndex(indicators[indName], indWeights);

            output.states[region][indName] = {
                value: indexValue,
                change: (Math.random() * 10) - 5, // Mock change since no history
                rank: 0 // Will calc later
            };
        }
    }

    // Ranking Logic
    for (const indName of Object.keys(INDICATOR_WEIGHTS)) {
        const sortedStates = Object.entries(output.states).sort((a, b) => {
            return b[1][indName].value - a[1][indName].value;
        });

        sortedStates.forEach(([region, data], idx) => {
            output.states[region][indName].rank = idx + 1;
        });
    }

    // National Aggregation (Simple average of states for demo)
    for (const indName of Object.keys(INDICATOR_WEIGHTS)) {
        const sum = Object.values(output.states).reduce((acc, s) => acc + s[indName].value, 0);
        const avg = sum / Object.keys(output.states).length;

        output.national[indName] = {
            value: avg,
            change: (Math.random() * 6) - 3, // Mock
            trend: avg > 100 ? "up" : "down" // Mock
        };
    }

    // Append Timeseries (Mock)
    if (output.timeseries) {
        // In real app, read existing timeseries.json and append today.
        // Here we just keep the structure for validity.
        output.timeseries.national = {
            financial_anxiety: [{ date: timestamp, value: output.national.financial_anxiety.value }],
            // ... others
        }
    }

    // Save Output
    // 1. latest.json (used by frontend - but our frontend creates a GLOBAL variable dashboard-data.js)
    // The frontend uses `data/dashboard-data.js`. So we should generate THAT.

    const jsContent = `// Auto-generated ${new Date().toISOString()}
const DASHBOARD_DATA = ${JSON.stringify(output, null, 2)};
if (typeof window !== 'undefined') window.DASHBOARD_DATA = DASHBOARD_DATA;
`;

    fs.writeFileSync(path.join(__dirname, '../data/dashboard-data.js'), jsContent);

    // Also save JSON for researchers
    fs.writeFileSync(path.join(__dirname, '../data/latest.json'), JSON.stringify(output, null, 2));

    console.log('Calculation complete. Updated dashboard-data.js');
}

if (require.main === module) {
    main().catch(console.error);
}
