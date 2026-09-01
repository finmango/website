/**
 * Regression tests for the Financial Health Barometer index calculation.
 *
 * These cover the accuracy guarantees the public methodology page now makes.
 * Each test corresponds to a claim a reader can check against the data file,
 * so a change that quietly breaks one of them is a change that makes the
 * published methodology wrong.
 *
 * Run: node scripts/test/barometer-indices.test.js
 */

const assert = require('assert');
const {
    calculateIndices,
    calculateNational,
    trendsBoostFor,
    clampIndex,
    deriveHousingWage
} = require('../fetch-real-data.js');

let passed = 0;
function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (err) {
        console.error(`  ✗ ${name}\n    ${err.message}`);
        process.exitCode = 1;
    }
}

const ALL = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC',
    'ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const unemployment = Object.fromEntries(ALL.map(a => [a, { value: 4.0, previousValue: 4.0 }]));
const poverty = Object.fromEntries(ALL.map(a => [a, { povertyRate: 12.0 }]));

function trendsFor(coveredStates) {
    const indicators = ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability'];
    return {
        states: Object.fromEntries(indicators.map(i =>
            [i, Object.fromEntries(coveredStates.map(a => [a, 8]))])),
        coverage: Object.fromEntries(indicators.map(i => [i, {
            states_covered: coveredStates.length,
            states_total: ALL.length,
            complete: coveredStates.length === ALL.length
        }]))
    };
}

console.log('Barometer index calculation');

test('a missing FRED observation adds no house-price points (no invented 5% default)', () => {
    // The old `hpi?.change || 5` gave every FRED-less state a fabricated year
    // of 5% house-price growth, worth 10 index points.
    const withoutHPI = calculateIndices(unemployment, null, poverty);
    const withZeroHPI = calculateIndices(
        unemployment,
        Object.fromEntries(ALL.map(a => [a, { change: 0 }])),
        poverty
    );
    assert.strictEqual(
        withoutHPI['US-TX'].housing_stress.value,
        withZeroHPI['US-TX'].housing_stress.value,
        'missing HPI should score the same as a measured 0% change'
    );
});

test('a genuine 0% house-price change is preserved, not rewritten as 5%', () => {
    const states = calculateIndices(
        unemployment,
        Object.fromEntries(ALL.map(a => [a, { change: 0 }])),
        poverty
    );
    assert.strictEqual(states['US-TX'].metrics.housing_price_change, 0);
    assert.strictEqual(states['US-TX'].housing_stress.change, 0);
});

test('indicators with no change series publish null, never a hardcoded 0', () => {
    const states = calculateIndices(unemployment, null, poverty);
    assert.strictEqual(states['US-TX'].food_insecurity.change, null);
    assert.strictEqual(states['US-TX'].affordability.change, null);
    assert.match(states['US-TX'].food_insecurity.change_basis, /not available/);
});

test('national aggregation reports null change and null trend, not "up"', () => {
    const national = calculateNational(calculateIndices(unemployment, null, poverty));
    assert.strictEqual(national.food_insecurity.change, null);
    assert.strictEqual(national.food_insecurity.trend, null);
    assert.strictEqual(national.food_insecurity.change_coverage.states_with_change, 0);
});

test('a national change of exactly zero is "flat", not "up"', () => {
    // unemployment equals its year-ago value, so every state's change is 0.0
    const national = calculateNational(calculateIndices(unemployment, null, poverty));
    assert.strictEqual(national.financial_anxiety.change, 0);
    assert.strictEqual(national.financial_anxiety.trend, 'flat');
});

test('the trends boost is withheld while coverage is partial', () => {
    const partial = trendsFor(['CA', 'TX', 'FL']);
    const withBoost = calculateIndices(unemployment, null, poverty, null, null, null, partial);
    const noTrends = calculateIndices(unemployment, null, poverty);

    assert.strictEqual(
        withBoost['US-CA'].financial_anxiety.value,
        noTrends['US-CA'].financial_anxiety.value,
        'a covered state must not gain points while other states are uncovered'
    );
    // ...but the reading is still published for inspection
    assert.strictEqual(withBoost['US-CA'].metrics.trends_boost.financial_anxiety.value, 8);
    assert.strictEqual(withBoost['US-CA'].metrics.trends_boost.financial_anxiety.applied, false);
});

test('the trends boost is applied once every state is covered', () => {
    const full = calculateIndices(unemployment, null, poverty, null, null, null, trendsFor(ALL));
    const noTrends = calculateIndices(unemployment, null, poverty);

    assert.strictEqual(
        full['US-CA'].financial_anxiety.value - noTrends['US-CA'].financial_anxiety.value,
        8
    );
    assert.strictEqual(full['US-CA'].metrics.trends_boost.financial_anxiety.applied, true);
});

test('trends_boost is published for all four indicators even when inputs are missing', () => {
    // poverty missing means the food branch never runs; the key must survive
    const states = calculateIndices(unemployment, null, null, null, null, null, trendsFor(ALL));
    assert.deepStrictEqual(
        Object.keys(states['US-TX'].metrics.trends_boost).sort(),
        ['affordability', 'financial_anxiety', 'food_insecurity', 'housing_stress']
    );
});

test('values pinned at a bound are flagged as clamped', () => {
    const extreme = Object.fromEntries(ALL.map(a => [a, { value: 30.0, previousValue: 30.0 }]));
    const states = calculateIndices(extreme, null, poverty);
    assert.strictEqual(states['US-TX'].financial_anxiety.value, 200);
    assert.strictEqual(states['US-TX'].financial_anxiety.clamped, 'ceiling');
});

test('unclamped values carry no clamped flag', () => {
    const states = calculateIndices(unemployment, null, poverty);
    assert.ok(!('clamped' in states['US-TX'].financial_anxiety));
});

test('clampIndex reports which bound was hit', () => {
    assert.deepStrictEqual(clampIndex(250, 80, 200), { value: 200, clamped: 'ceiling' });
    assert.deepStrictEqual(clampIndex(10, 80, 200), { value: 80, clamped: 'floor' });
    assert.deepStrictEqual(clampIndex(120.4, 80, 200), { value: 120, clamped: null });
});

test('fair_market_rent_2br holds only HUD FMR, never a JCHS median rent', () => {
    // These are different quantities. Publishing a median rent under the FMR
    // name put two disagreeing numbers in the same record.
    const jchs = { states: Object.fromEntries(ALL.map(a => [a, { median_rent: 925, renters_cost_burdened: 52 }])) };
    const states = calculateIndices(unemployment, null, poverty, null, null, jchs);

    assert.strictEqual(states['US-MS'].metrics.fair_market_rent_2br, null);
    assert.strictEqual(states['US-MS'].metrics.fair_market_rent_source, null);
    assert.strictEqual(states['US-MS'].metrics.median_rent_2br, 925);
    assert.strictEqual(states['US-MS'].metrics.median_rent_source, 'Harvard JCHS 2025');
});

test('HUD FMR, when present, is labelled as HUD FMR', () => {
    const fmr = Object.fromEntries(ALL.map(a => [a, { fmr_2br: 1400 }]));
    const states = calculateIndices(unemployment, null, poverty, null, fmr);
    assert.strictEqual(states['US-MS'].metrics.fair_market_rent_2br, 1400);
    assert.strictEqual(states['US-MS'].metrics.fair_market_rent_source, 'HUD FMR API');
});

test('every state publishes its regional multiplier', () => {
    const states = calculateIndices(unemployment, null, poverty);
    for (const s of Object.values(states)) {
        assert.strictEqual(typeof s.metrics.regional_stress_multiplier, 'number',
            `${s.abbr} is missing its multiplier`);
    }
});

test('dividing out the multiplier recovers the unadjusted index', () => {
    // The methodology page tells readers they can do exactly this.
    const states = calculateIndices(unemployment, null, poverty);
    const ms = states['US-MS'];
    const unadjusted = ms.financial_anxiety.value / ms.metrics.regional_stress_multiplier;
    const expected = 120 + (4.0 - 3.5) * 18; // base + unemployment term
    assert.ok(Math.abs(unadjusted - expected) < 1,
        `expected ~${expected}, got ${unadjusted.toFixed(1)}`);
});

test('a zero unemployment rate is published as 0, not swallowed as null', () => {
    const zero = Object.fromEntries(ALL.map(a => [a, { value: 0, previousValue: 0 }]));
    const states = calculateIndices(zero, null, poverty);
    assert.strictEqual(states['US-TX'].metrics.unemployment_rate, 0);
});

test('trendsBoostFor caps a reading at 10 points', () => {
    const trends = { states: { financial_anxiety: { CA: 47 } },
                     coverage: { financial_anxiety: { complete: true } } };
    assert.deepStrictEqual(trendsBoostFor(trends, 'financial_anxiety', 'CA'),
        { value: 10, applied: true });
});

test('housing wage follows the NLIHC formula', () => {
    // 30% of income, 2,080 hours: $2,580/mo -> $49.62/hr
    assert.strictEqual(deriveHousingWage(2580), 49.62);
    assert.strictEqual(deriveHousingWage(null), null);
});

console.log(`\n${passed} passed${process.exitCode ? ', some failed' : ''}`);
