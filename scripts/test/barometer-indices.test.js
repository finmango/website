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
    __setPreviousSnapshot,
    calculateIndices,
    calculateNational,
    trendsBoostFor,
    clampIndex,
    deriveHousingWage
} = require('../fetch-real-data.js');

let passed = 0;
function test(name, fn) {
    try {
        // Default every test to "no history", so a test that cares about
        // carry-forward has to opt in explicitly and none of them silently
        // depend on whatever data/latest.json happens to contain.
        __setPreviousSnapshot(null);
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

// A previous snapshot carrying a real FRED reading for every state.
function snapshotWithHPI(change, observedOn) {
    return {
        as_of: observedOn,
        states: Object.fromEntries(ALL.map(a => [`US-${a}`, {
            abbr: a,
            metrics: {
                housing_price_change: change,
                housing_price_change_observed: observedOn
            }
        }]))
    };
}

const today = new Date();
const daysAgo = n => new Date(today.getTime() - n * 86400000).toISOString().slice(0, 10);

test('a missing FRED observation is carried forward, not dropped and not defaulted', () => {
    // Dropping the term is not neutral: it is worth ~29 points on average, so a
    // state that lost it would show a phantom housing-market improvement.
    __setPreviousSnapshot(snapshotWithHPI(8.0, daysAgo(3)));
    const carried = calculateIndices(unemployment, null, poverty);

    __setPreviousSnapshot(null);
    const live = calculateIndices(
        unemployment,
        Object.fromEntries(ALL.map(a => [a, { change: 8.0 }])),
        poverty
    );

    assert.strictEqual(
        carried['US-TX'].housing_stress.value,
        live['US-TX'].housing_stress.value,
        'a carried-forward reading should score identically to the live one'
    );
    assert.strictEqual(carried['US-TX'].metrics.housing_price_change, 8.0);
    assert.match(carried['US-TX'].metrics.housing_price_change_source, /carried forward/);
});

test('a carried-forward reading keeps its ORIGINAL observation date', () => {
    // Otherwise each republish resets the staleness clock and a dead source is
    // carried forever, one day at a time.
    const observed = daysAgo(40);
    __setPreviousSnapshot(snapshotWithHPI(8.0, observed));
    const states = calculateIndices(unemployment, null, poverty);
    assert.strictEqual(states['US-TX'].metrics.housing_price_change_observed, observed);
});

test('a carried-forward reading expires rather than being carried indefinitely', () => {
    // FRED HPI is quarterly; past 180 days a real release has been missed.
    __setPreviousSnapshot(snapshotWithHPI(8.0, daysAgo(400)));
    const states = calculateIndices(unemployment, null, poverty);
    assert.strictEqual(states['US-TX'].metrics.housing_price_change, null);
    assert.strictEqual(states['US-TX'].housing_stress.partial, true);
    assert.match(states['US-TX'].housing_stress.partial_reason, /omits a component/);
});

test('an index missing a component is flagged partial, never silently rescaled', () => {
    __setPreviousSnapshot(null);
    const states = calculateIndices(unemployment, null, poverty);
    assert.strictEqual(states['US-TX'].housing_stress.partial, true);
});

test('a complete index carries no partial flag', () => {
    const states = calculateIndices(
        unemployment,
        Object.fromEntries(ALL.map(a => [a, { change: 5 }])),
        poverty
    );
    assert.ok(!('partial' in states['US-TX'].housing_stress));
});

test('a missing observation is never replaced with the old fabricated 5% default', () => {
    __setPreviousSnapshot(null);
    const missing = calculateIndices(unemployment, null, poverty);
    const fabricated = calculateIndices(
        unemployment,
        Object.fromEntries(ALL.map(a => [a, { change: 5 }])),
        poverty
    );
    assert.notStrictEqual(
        missing['US-TX'].housing_stress.value,
        fabricated['US-TX'].housing_stress.value
    );
});

test('a fallback value is never laundered into a carried-forward measurement', () => {
    // The previous run's rent burden came from a hardcoded tier estimate. It
    // must not reappear tomorrow labelled as a carried-forward ACS reading.
    __setPreviousSnapshot({
        as_of: daysAgo(1),
        states: Object.fromEntries(ALL.map(a => [`US-${a}`, {
            abbr: a,
            metrics: { rent_burden_pct: 32, rent_burden_source: 'tier_estimate' }
        }]))
    });
    const states = calculateIndices(unemployment, null, poverty);
    assert.notStrictEqual(states['US-TX'].metrics.rent_burden_source, 'census_acs_carried_forward');
});

test('a prior ACS reading outranks the JCHS approximation of it', () => {
    const jchs = { states: Object.fromEntries(ALL.map(a => [a, { renters_cost_burdened: 52, median_rent: 925 }])) };
    __setPreviousSnapshot({
        as_of: daysAgo(2),
        states: Object.fromEntries(ALL.map(a => [`US-${a}`, {
            abbr: a,
            metrics: {
                rent_burden_pct: 30.2,
                rent_burden_source: 'census_acs',
                rent_burden_pct_observed: daysAgo(2)
            }
        }]))
    });
    const states = calculateIndices(unemployment, null, poverty, null, null, jchs);
    assert.strictEqual(states['US-TX'].metrics.rent_burden_source, 'census_acs_carried_forward');
    assert.strictEqual(states['US-TX'].metrics.rent_burden_pct, 30.2);
});

test('a genuine 0% house-price change is preserved, not rewritten as 5%', () => {
    __setPreviousSnapshot(snapshotWithHPI(9.9, daysAgo(1))); // must not be used
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

test('tier estimates only fire when nothing can be carried forward', () => {
    // With a carryable ACS reading present, the hand-assigned tier must lose.
    __setPreviousSnapshot({
        as_of: daysAgo(2),
        states: Object.fromEntries(ALL.map(a => [`US-${a}`, {
            abbr: a,
            metrics: {
                rent_burden_pct: 28.5,
                rent_burden_source: 'census_acs',
                rent_burden_pct_observed: daysAgo(2)
            }
        }]))
    });
    const states = calculateIndices(unemployment, null, poverty);
    assert.notStrictEqual(states['US-CA'].metrics.rent_burden_source, 'tier_estimate');
});

test('a tier-scored state is labelled tier_estimate', () => {
    __setPreviousSnapshot(null);
    const states = calculateIndices(unemployment, null, poverty);
    assert.strictEqual(states['US-CA'].metrics.rent_burden_source, 'tier_estimate');
    assert.strictEqual(states['US-CA'].metrics.fmr_score_source, 'tier_estimate');
});

test('a state outside every tier scores 0, not a silent default', () => {
    __setPreviousSnapshot(null);
    const states = calculateIndices(unemployment, null, poverty);
    // Nebraska is in no rent-burden tier and is not high-cost, so both housing
    // component scores are 0 and its housing stress is the bare base of 100.
    const ne = states['US-NE'];
    assert.strictEqual(ne.metrics.rent_burden_source, 'tier_estimate');
    assert.strictEqual(ne.housing_stress.value, Math.round(100 * ne.metrics.regional_stress_multiplier));
});

test('the FMR national average covers carried states, not just live ones', () => {
    // The FMR score is a ratio against the national average, so the average
    // must be taken over the same population the ratios are scored on. Taking
    // it over the live subset only, while scoring states on carried values,
    // compares each state against a population it is not part of.
    const fmrMap = Object.fromEntries(ALL.map((a, i) => [a, { fmr_2br: 1000 + i * 40 }]));

    // All live.
    __setPreviousSnapshot(null);
    const allLive = calculateIndices(unemployment, null, poverty, null, fmrMap);

    // Same figures, but HUD is down and every one of them is carried forward.
    __setPreviousSnapshot({
        as_of: daysAgo(2),
        states: Object.fromEntries(ALL.map((a, i) => [`US-${a}`, {
            abbr: a,
            metrics: {
                fair_market_rent_2br: 1000 + i * 40,
                fair_market_rent_source: 'HUD FMR API',
                fair_market_rent_2br_observed: daysAgo(2)
            }
        }]))
    });
    const allCarried = calculateIndices(unemployment, null, poverty);

    for (const abbr of ['CA', 'MS', 'NY']) {
        assert.strictEqual(
            allCarried[`US-${abbr}`].housing_stress.value,
            allLive[`US-${abbr}`].housing_stress.value,
            `${abbr}: a carried FMR should score identically to the same live figure`
        );
    }
});

test('a partial HUD outage does not rescale the states that did answer', () => {
    // Only three states answer live; the rest carry the same figures. Every
    // state should still be scored against the full-population average.
    const full = Object.fromEntries(ALL.map((a, i) => [a, 1000 + i * 40]));
    __setPreviousSnapshot({
        as_of: daysAgo(2),
        states: Object.fromEntries(ALL.map(a => [`US-${a}`, {
            abbr: a,
            metrics: {
                fair_market_rent_2br: full[a],
                fair_market_rent_source: 'HUD FMR API',
                fair_market_rent_2br_observed: daysAgo(2)
            }
        }]))
    });

    const partial = calculateIndices(unemployment, null, poverty, null,
        { CA: { fmr_2br: full.CA }, NY: { fmr_2br: full.NY }, MS: { fmr_2br: full.MS } });

    __setPreviousSnapshot(null);
    const complete = calculateIndices(unemployment, null, poverty, null,
        Object.fromEntries(ALL.map(a => [a, { fmr_2br: full[a] }])));

    assert.strictEqual(
        partial['US-CA'].housing_stress.value,
        complete['US-CA'].housing_stress.value,
        'a live state must not be rescaled by which other states answered'
    );
});

console.log(`\n${passed} passed${process.exitCode ? ', some failed' : ''}`);
