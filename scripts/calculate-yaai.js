#!/usr/bin/env node
/**
 * Calculate Young Adult Affordability Index (YAAI)
 * 
 * Methodology:
 * - Rent Burden: 35%
 * - Student Debt: 20%
 * - Debt-to-Income: 15%
 * - Cost of Living: 15%
 * - Median Income: 15% (inverted - higher is better)
 * 
 * Uses z-score normalization, then scales to 0-100
 * Lower = More Affordable
 */

const fs = require('fs');
const path = require('path');

// Read the current data
const dataPath = path.join(__dirname, '..', 'data', 'student-map-data.js');
let dataContent = fs.readFileSync(dataPath, 'utf8');

// Extract the YOUNG_ADULT_DATA object
const dataMatch = dataContent.match(/const YOUNG_ADULT_DATA = (\{[\s\S]*?\});/);
if (!dataMatch) {
    console.error('Could not find YOUNG_ADULT_DATA in file');
    process.exit(1);
}

// Parse the data (eval is safe here since we control the file)
let data;
eval('data = ' + dataMatch[1]);

// Weights for YAAI
const WEIGHTS = {
    rent_burden: 0.35,
    student_debt: 0.20,
    debt_to_income: 0.15,
    cost_of_living: 0.15,
    median_income: 0.15  // Will be inverted
};

// Get all state values for each indicator
const stateKeys = Object.keys(data.states);
const indicators = Object.keys(WEIGHTS);

// Calculate means and standard deviations
const stats = {};
for (const ind of indicators) {
    const values = stateKeys
        .map(k => data.states[k][ind]?.value)
        .filter(v => v !== undefined && v !== null);

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    stats[ind] = { mean, stdDev };
    console.log(`${ind}: mean=${mean.toFixed(2)}, stdDev=${stdDev.toFixed(2)}`);
}

// Calculate YAAI for each state
const yaaiScores = {};

for (const stateKey of stateKeys) {
    const state = data.states[stateKey];
    let yaaiRaw = 0;
    let validWeight = 0;

    for (const ind of indicators) {
        const val = state[ind]?.value;
        if (val === undefined || val === null) continue;

        const { mean, stdDev } = stats[ind];
        if (stdDev === 0) continue;

        // Calculate z-score
        let z = (val - mean) / stdDev;

        // Invert for median_income (higher is BETTER, so flip the sign)
        if (ind === 'median_income') {
            z = -z;
        }

        yaaiRaw += z * WEIGHTS[ind];
        validWeight += WEIGHTS[ind];
    }

    // Normalize if not all indicators available
    if (validWeight > 0 && validWeight < 1) {
        yaaiRaw = yaaiRaw / validWeight;
    }

    // Scale to 0-100: YAAI = 50 + (raw * 15)
    // Clamped to 0-100
    let yaai = 50 + (yaaiRaw * 15);
    yaai = Math.max(0, Math.min(100, yaai));
    yaai = Math.round(yaai * 10) / 10;  // Round to 1 decimal

    yaaiScores[stateKey] = yaai;
}

// Sort states by YAAI for ranking
const sortedStates = stateKeys
    .filter(k => yaaiScores[k] !== undefined)
    .sort((a, b) => yaaiScores[a] - yaaiScores[b]);  // Lower is better

// Add YAAI to each state
for (let i = 0; i < sortedStates.length; i++) {
    const stateKey = sortedStates[i];
    data.states[stateKey].yaai = {
        value: yaaiScores[stateKey],
        rank: i + 1,
        change: 0  // No historical data yet
    };
}

// Add national average (should be ~50)
const nationalYaai = stateKeys
    .map(k => yaaiScores[k])
    .filter(v => v !== undefined)
    .reduce((a, b) => a + b, 0) / stateKeys.length;

data.national.yaai = {
    value: Math.round(nationalYaai * 10) / 10,
    change: 0,
    label: "Young Adult Affordability Index",
    unit: "score",
    trend: "stable",
    source_note: "FinMango weighted composite (lower = more affordable)"
};

// Add YAAI indicator definition
data.indicators.yaai = {
    name: "YAAI",
    fullName: "Young Adult Affordability Index",
    description: "Weighted composite: Rent Burden (35%), Student Debt (20%), D/I Ratio (15%), Cost of Living (15%), Income (15%). Lower scores = more affordable.",
    source: "FinMango Research - Z-score normalized",
    sourceUrl: "https://finmango.org/affordability-lab",
    unit: "score",
    format: "index",
    higherIsBad: true,
    thresholds: {
        low: 35,
        moderate: 50,
        elevated: 65,
        high: 80
    }
};

// Update metadata
data.meta.version = "3.2";
data.meta.generated = new Date().toISOString();
data.meta.data_sources.yaai = "FinMango Research - Weighted z-score composite";

// Generate the new file content
const newDataContent = `// Young Adult Financial Health Map Data
// Auto-generated: ${data.meta.generated}
// Sources: TICAS, Dept. of Education, BLS, Census ACS, Federal Reserve, JCHS, Zillow

const YOUNG_ADULT_DATA = ${JSON.stringify(data, null, 4)};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YOUNG_ADULT_DATA;
}
`;

fs.writeFileSync(dataPath, newDataContent);
console.log('\n✅ YAAI calculated and added to student-map-data.js');

// Print top 10 most affordable and least affordable
console.log('\n🏆 Top 10 Most Affordable (Lowest YAAI):');
for (let i = 0; i < 10; i++) {
    const key = sortedStates[i];
    console.log(`  ${i + 1}. ${data.states[key].name}: ${yaaiScores[key]}`);
}

console.log('\n⚠️ Top 10 Least Affordable (Highest YAAI):');
for (let i = sortedStates.length - 1; i >= sortedStates.length - 10; i--) {
    const key = sortedStates[i];
    console.log(`  ${sortedStates.length - i}. ${data.states[key].name}: ${yaaiScores[key]}`);
}
