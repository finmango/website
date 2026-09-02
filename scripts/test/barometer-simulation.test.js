/**
 * Multi-day simulation of the Financial Health Barometer pipeline.
 *
 * The unit tests check each rule in isolation. This drives the real index
 * calculation day after day for 750 simulated days, feeding each day's output
 * back in as the next day's "previous snapshot" exactly as production does,
 * while upstream sources drop out and return on a schedule. It then asserts
 * the properties a reader of the published data is entitled to rely on:
 *
 *   - a held value is identical to the live value it replaces (lossless)
 *   - held values age from their ORIGINAL observation and actually expire
 *   - nothing is ever NaN, undefined, or outside its published bounds
 *   - Affordability always equals its published formula
 *   - every top-level field agrees with the metrics the index was scored on
 *   - the run-level summaries agree with the per-state flags they summarise
 *
 * Run: node scripts/test/barometer-simulation.test.js
 */

const assert = require('assert');

// ---------------------------------------------------------------------------
// Controllable clock. The pipeline dates observations with `new Date()` and
// ages them with `Date.now()`, so both must follow the simulated day.
// ---------------------------------------------------------------------------
const RealDate = Date;
let simNow = RealDate.UTC(2026, 8, 1); // 2026-09-01
class SimDate extends RealDate {
    constructor(...args) { args.length === 0 ? super(simNow) : super(...args); }
    static now() { return simNow; }
}
global.Date = SimDate;
const DAY = 86400000;
const iso = ms => new RealDate(ms).toISOString().slice(0, 10);
const dayISO = d => iso(RealDate.UTC(2026, 8, 1) + d * DAY);

const P = require('../fetch-real-data.js');

const ALL = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC',
    'ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
const idx = Object.fromEntries(ALL.map((a, i) => [a, i]));

// ---------------------------------------------------------------------------
// Sources. Everything except unemployment is constant so that a held value can
// be compared exactly against the live value it stands in for.
// ---------------------------------------------------------------------------
const src = {
    unemployment: day => Object.fromEntries(ALL.map(a => {
        const v = 3 + idx[a] * 0.06 + 0.3 * Math.sin(day / 30);
        return [a, { value: +v.toFixed(1), previousValue: +(v - 0.2).toFixed(1), date: '2026-07' }];
    })),
    housing: () => Object.fromEntries(ALL.map(a => [a, { change: 4 + idx[a] * 0.2 }])),
    poverty: () => Object.fromEntries(ALL.map(a => [a, { povertyRate: 9 + idx[a] * 0.25 }])),
    rentBurden: () => Object.fromEntries(ALL.map(a => [a, { medianRentBurden: 26 + idx[a] * 0.15, year: 2024 }])),
    fmr: () => Object.fromEntries(ALL.map(a => [a, { fmr_2br: 900 + idx[a] * 35 }])),
    jchs: { states: Object.fromEntries(ALL.map(a => [a, { renters_cost_burdened: 45 + idx[a] * 0.2, median_rent: 850 + idx[a] * 30 }])) },
    nlihc: { states: Object.fromEntries(ALL.map(a => [a, { rent_burden: 28 + idx[a] * 0.1, fmr_2br: 1000 + idx[a] * 35, housing_wage: 20 + idx[a] }])) }
};

// Outage schedule (inclusive day ranges during which a source returns nothing)
const down = {
    fred:   d => d >= 3   && d <= 400,   // last obs day 2 + 180 cap: held 3..182, partial 183..400
    hud:    d => d >= 5,                 // last obs day 4 + 550 cap: held 5..554, JCHS from 555
    bls:    d => d >= 10  && d <= 130,   // expect: held 10..99, estimated 100..130
    census: d => d >= 50  && d <= 700    // expect: FI held 50..599 then estimated; rent held 50..599 then JCHS
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function walk(node, path, out) {
    if (node === undefined) out.push(`${path} is undefined`);
    else if (typeof node === 'number' && !isFinite(node)) out.push(`${path} is ${node}`);
    else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`, out));
    else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, out);
}

const BOUNDS = { financial_anxiety: [80, 200], food_insecurity: [55, 160], housing_stress: [80, 200], affordability: [80, 200] };

// Run one simulated day, returning the snapshot that production would publish.
function runDay(day, previous) {
    simNow = RealDate.UTC(2026, 8, 1) + day * DAY;
    P.__setPreviousSnapshot(previous);

    const liveUnemp = down.bls(day) ? null : src.unemployment(day);
    const unemployment = liveUnemp || P.carryForwardUnemployment();

    const states = P.calculateIndices(
        unemployment,
        down.fred(day) ? null : src.housing(),
        down.census(day) ? null : src.poverty(),
        down.census(day) ? null : src.rentBurden(),
        down.hud(day) ? null : src.fmr(),
        src.jchs, null, src.nlihc
    );
    const national = P.calculateNational(states);
    const carried = P.summariseCarryForward(states);

    const meta = {
        generated: new Date().toISOString(),
        carried_forward: carried,
        unemployment_observed: liveUnemp
            ? dayISO(day)
            : (previous?.meta?.unemployment_observed || previous?.as_of || null)
    };
    const snapshot = {
        as_of: dayISO(day), meta, national, states,
        timeseries: { national: P.generateTimeseries(national, null) }
    };
    snapshot.meta.data_age = P.summariseDataAge(meta, states);
    return snapshot;
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------
let failures = 0;
const fail = (day, msg) => { failures++; if (failures <= 25) console.error(`  ✗ day ${day} (${dayISO(day)}): ${msg}`); };

const history = [];
let previous = null;
for (let day = 0; day <= 750; day++) {
    const snap = runDay(day, previous);
    history.push(snap);
    previous = snap;

    // --- 1. Nothing is NaN or undefined anywhere in the published object ---
    const bad = []; walk(snap, 'snapshot', bad);
    if (bad.length) fail(day, `non-finite/undefined values: ${bad.slice(0, 3).join('; ')}`);

    const st = Object.values(snap.states);
    if (st.length !== 51) fail(day, `expected 51 states, got ${st.length}`);

    for (const ind of Object.keys(BOUNDS)) {
        const [lo, hi] = BOUNDS[ind];
        const ranks = new Set();
        for (const s of st) {
            const v = s[ind].value;
            // --- 2. Every indicator numeric and within its published bounds ---
            if (typeof v !== 'number' || v < lo || v > hi) fail(day, `${s.abbr}.${ind}.value=${v} outside [${lo},${hi}]`);
            // clamp flag agrees with value at bound
            if (s[ind].clamped && v !== lo && v !== hi) fail(day, `${s.abbr}.${ind} flagged clamped but value ${v} not at a bound`);
            ranks.add(s[ind].rank);
            // change is number or null, never 0-as-placeholder without a basis
            if (s[ind].change !== null && typeof s[ind].change !== 'number') fail(day, `${s.abbr}.${ind}.change=${s[ind].change}`);
        }
        // --- 3. Ranks are a permutation of 1..51 ---
        if (ranks.size !== 51 || Math.min(...ranks) !== 1 || Math.max(...ranks) !== 51) fail(day, `${ind} ranks are not a permutation of 1..51`);
    }

    for (const s of st) {
        const m = s.metrics;
        // --- 4. Affordability equals its published formula ---
        const expect = Math.round(Math.max(80, Math.min(200, s.housing_stress.value * 0.6 + s.food_insecurity.value * 0.4)));
        if (s.affordability.value !== expect) fail(day, `${s.abbr} affordability ${s.affordability.value} != formula ${expect}`);

        // --- 5. Top-level fields agree with the metrics the index used ---
        if (typeof m.fair_market_rent_2br === 'number' && s.fmr_2br?.value !== m.fair_market_rent_2br)
            fail(day, `${s.abbr} fmr_2br top-level ${s.fmr_2br?.value} != metrics ${m.fair_market_rent_2br}`);
        if (s.fmr_2br && s.housing_wage) {
            const w = Math.round((s.fmr_2br.value * 12) / (2080 * 0.3) * 100) / 100;
            if (s.housing_wage.value !== w) fail(day, `${s.abbr} housing_wage ${s.housing_wage.value} != derived ${w}`);
        }
        if (/^census_acs/.test(m.rent_burden_source) && s.rent_burden?.value !== m.rent_burden_pct)
            fail(day, `${s.abbr} rent_burden top-level ${s.rent_burden?.value} != metrics ${m.rent_burden_pct} (${m.rent_burden_source})`);

        // --- 6. partial iff house-price term missing ---
        if (!!s.housing_stress.partial !== (m.housing_price_change === null))
            fail(day, `${s.abbr} partial=${!!s.housing_stress.partial} but housing_price_change=${m.housing_price_change}`);
        if (!!s.affordability.partial !== !!s.housing_stress.partial)
            fail(day, `${s.abbr} affordability.partial does not inherit housing_stress.partial`);

        // --- 7. A carried component is dated from its original observation ---
        if (m.housing_price_change_source && /carried/.test(m.housing_price_change_source)) {
            if (m.housing_price_change_observed !== dayISO(2)) fail(day, `${s.abbr} carried HPI observed ${m.housing_price_change_observed}, expected ${dayISO(2)}`);
        }
        if (m.fair_market_rent_source && /carried/.test(m.fair_market_rent_source)) {
            if (m.fair_market_rent_2br_observed !== dayISO(4)) fail(day, `${s.abbr} carried FMR observed ${m.fair_market_rent_2br_observed}, expected ${dayISO(4)}`);
        }
        if (m.rent_burden_source === 'census_acs_carried_forward') {
            if (m.rent_burden_pct_observed !== dayISO(49)) fail(day, `${s.abbr} carried rent burden observed ${m.rent_burden_pct_observed}, expected ${dayISO(49)}`);
        }
        // Whole-indicator hold keeps its origin, never slides
        if (s.food_insecurity.carried_forward_from && s.food_insecurity.carried_forward_from !== dayISO(49))
            fail(day, `${s.abbr} food_insecurity carried_forward_from ${s.food_insecurity.carried_forward_from} slid from ${dayISO(49)}`);
    }

    // --- 8. Run-level carried_forward summary matches per-state flags ---
    const cf = snap.meta.carried_forward;
    const cnt = (f, re) => st.filter(s => re.test(String(s.metrics[f] || ''))).length;
    const expectHP = cnt('housing_price_change_source', /carried/), expectRB = cnt('rent_burden_source', /carried/), expectFM = cnt('fair_market_rent_source', /carried/);
    if ((cf.housing_prices?.states_carried || 0) !== expectHP) fail(day, `carried_forward.housing_prices=${cf.housing_prices?.states_carried} but ${expectHP} states carried`);
    if ((cf.rent_burden?.states_carried || 0) !== expectRB) fail(day, `carried_forward.rent_burden=${cf.rent_burden?.states_carried} but ${expectRB} states carried`);
    if ((cf.fair_market_rent?.states_carried || 0) !== expectFM) fail(day, `carried_forward.fair_market_rent=${cf.fair_market_rent?.states_carried} but ${expectFM} states carried`);
    const expectPartial = st.filter(s => s.housing_stress.partial).length;
    if ((cf.housing_stress_partial?.states_partial || 0) !== expectPartial) fail(day, `partial summary ${cf.housing_stress_partial?.states_partial} != ${expectPartial}`);

    // --- 9. National aggregates ---
    for (const ind of Object.keys(BOUNDS)) {
        const n = snap.national[ind];
        if (typeof n.value !== 'number') fail(day, `national.${ind}.value not numeric`);
        if (n.change === null && n.trend !== null) fail(day, `national.${ind} has null change but trend ${n.trend}`);
        if (typeof n.change === 'number' && Math.abs(n.change) < 0.05 && n.trend !== 'flat') fail(day, `national.${ind} change ${n.change} but trend ${n.trend}`);
    }
    // Food Insecurity and Affordability never have a change series
    if (snap.national.food_insecurity.change !== null) fail(day, `national food_insecurity.change should be null`);
    if (snap.national.affordability.change !== null) fail(day, `national affordability.change should be null`);

    // --- 10. Timeseries ends at today's national value, no gaps of type ---
    for (const ind of Object.keys(BOUNDS)) {
        const ts = snap.timeseries.national[ind];
        const last = ts[ts.length - 1];
        if (last.value !== Math.round(snap.national[ind].value)) fail(day, `timeseries.${ind} last ${last.value} != national ${Math.round(snap.national[ind].value)}`);
        if (ts.length > 120) fail(day, `timeseries.${ind} length ${ts.length} > 120`);
    }

    // --- 11. data_age never claims the data is newer than it is ---
    const age = snap.meta.data_age;
    if (age && age.oldest_observation > snap.as_of) fail(day, `data_age.oldest_observation ${age.oldest_observation} is in the future`);
}

// ---------------------------------------------------------------------------
// Scenario expectations — the schedule above predicts exactly what should
// happen and when. These pin the carry-forward chains to the calendar.
// ---------------------------------------------------------------------------
const H = d => history[d];
const TX = d => H(d).states['US-TX'];
const expectEq = (day, actual, expected, what) => { if (actual !== expected) fail(day, `${what}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); };

// FRED: held losslessly 3..183, then the term drops and the index is partial until FRED returns on 401
for (const d of [3, 50, 100, 182]) {
    expectEq(d, TX(d).housing_stress.value, TX(2).housing_stress.value, 'held HPI: housing_stress identical to last live day');
    expectEq(d, /carried/.test(TX(d).metrics.housing_price_change_source), true, 'HPI source says carried');
    expectEq(d, TX(d).housing_stress.partial, undefined, 'not partial while held');
}
for (const d of [183, 300, 400]) {
    expectEq(d, TX(d).housing_stress.partial, true, 'HPI expired: partial');
    expectEq(d, TX(d).metrics.housing_price_change, null, 'HPI expired: metric null');
    if (TX(d).housing_stress.value >= TX(2).housing_stress.value) fail(d, 'partial housing_stress should be lower than the complete score');
}
expectEq(401, TX(401).housing_stress.partial, undefined, 'FRED back: not partial');
expectEq(401, TX(401).housing_stress.value, TX(2).housing_stress.value, 'FRED back: value restored exactly');
expectEq(401, TX(401).metrics.housing_price_change_source, 'FRED FHFA HPI', 'FRED back: live source');

// HUD: held 5..555 (lossless, including the national-average consistency), then JCHS
for (const d of [5, 200, 554]) {
    expectEq(d, TX(d).metrics.fmr_score_source, 'hud_fmr_carried_forward', 'FMR carried');
    expectEq(d, TX(d).metrics.fair_market_rent_2br, src.fmr().TX.fmr_2br, 'carried FMR value intact');
}
// Housing stress on a HUD-down/FRED-up day must equal the fully-live score:
// tests that the FMR national average was taken over the carried population.
{
    // day 2 is fully live for FRED+HUD; day 4 is HUD-live too (hud down from 5). Compare day 401+ (FRED back, HUD carried, census down) is muddied by census.
    // Cleanest: compare day 2 (all live) with a synthetic day where only HUD is carried.
    simNow = RealDate.UTC(2026, 8, 1) + 4 * DAY; P.__setPreviousSnapshot(H(3));
    const onlyHudDown = P.calculateIndices(src.unemployment(4), src.housing(), src.poverty(), src.rentBurden(), null, src.jchs, null, src.nlihc);
    simNow = RealDate.UTC(2026, 8, 1) + 4 * DAY; P.__setPreviousSnapshot(H(3));
    const allLive = P.calculateIndices(src.unemployment(4), src.housing(), src.poverty(), src.rentBurden(), src.fmr(), src.jchs, null, src.nlihc);
    for (const a of ['CA', 'MS', 'TX', 'WY']) {
        expectEq(4, onlyHudDown[`US-${a}`].housing_stress.value, allLive[`US-${a}`].housing_stress.value, `${a} housing_stress with HUD carried == fully live`);
    }
}
for (const d of [555, 700]) {
    expectEq(d, TX(d).metrics.fmr_score_source, 'jchs_2025', 'FMR carry expired: JCHS');
    expectEq(d, TX(d).metrics.fair_market_rent_2br, null, 'FMR carry expired: no HUD figure');
    expectEq(d, TX(d).fmr_2br?.source, 'NLIHC OOR 2025 (fallback)', 'FMR carry expired: top-level from NLIHC');
}

// BLS: unemployment held 10..99, FA then ESTIMATED (not silently re-held) 100..130, live at 131
for (const d of [10, 60, 99]) {
    expectEq(d, TX(d).financial_anxiety.value, TX(9).financial_anxiety.value, 'held unemployment: FA identical to last live day');
    expectEq(d, TX(d).metrics.unemployment_rate, TX(9).metrics.unemployment_rate, 'held unemployment rate intact');
    expectEq(d, TX(d).financial_anxiety.estimated, undefined, 'not estimated while held');
    expectEq(d, H(d).meta.unemployment_observed, dayISO(9), 'unemployment_observed pinned to last live read');
}
for (const d of [100, 115, 130]) {
    expectEq(d, TX(d).financial_anxiety.estimated, true, 'unemployment carry expired: FA estimated');
    expectEq(d, TX(d).financial_anxiety.carried_forward_from, undefined, 'FA must not be re-held after unemployment expires');
    expectEq(d, TX(d).metrics.unemployment_rate, null, 'no unemployment rate published once expired');
}
expectEq(131, TX(131).financial_anxiety.estimated, undefined, 'BLS back: not estimated');
expectEq(131, typeof TX(131).financial_anxiety.change, 'number', 'BLS back: real change');
expectEq(131, H(131).meta.unemployment_observed, dayISO(131), 'BLS back: observed today');

// Census: FI held 50..599 from origin day 49 (no clock slide), estimated 600..700, live 701
for (const d of [50, 300, 599]) {
    expectEq(d, TX(d).food_insecurity.value, TX(49).food_insecurity.value, 'held FI identical to last live day');
    expectEq(d, TX(d).food_insecurity.carried_forward_from, dayISO(49), 'FI hold dated from original observation');
    expectEq(d, TX(d).metrics.rent_burden_source, 'census_acs_carried_forward', 'rent burden carried');
    expectEq(d, TX(d).rent_burden?.value, TX(49).rent_burden.value, 'top-level rent_burden agrees with carried metric');
}
for (const d of [600, 650, 700]) {
    expectEq(d, TX(d).food_insecurity.estimated, true, 'FI hold expired: estimated');
    expectEq(d, TX(d).metrics.rent_burden_source, 'jchs_2025', 'rent burden carry expired: JCHS');
}
expectEq(701, TX(701).food_insecurity.estimated, undefined, 'Census back: FI live');
expectEq(701, TX(701).food_insecurity.value, TX(49).food_insecurity.value, 'Census back: FI value restored exactly');

// data_age tracks the oldest thing the index still rests on
expectEq(300, H(300).meta.data_age.oldest_observation, dayISO(4), 'day 300: oldest observation is the carried HUD FMR from day 4');
expectEq(300, H(300).meta.data_age.age_days, 296, 'day 300: age in days');
expectEq(0, H(0).meta.data_age.age_days, 0, 'day 0: fresh');

// An estimate is never re-carried as if it were history
for (const d of [101, 601]) {
    for (const s of Object.values(H(d).states)) {
        if (s.financial_anxiety.carried_forward_from && H(d - 1).states[`US-${s.abbr}`].financial_anxiety.estimated) fail(d, `${s.abbr} re-carried an estimated FA`);
        if (s.food_insecurity.carried_forward_from && H(d - 1).states[`US-${s.abbr}`].food_insecurity.estimated) fail(d, `${s.abbr} re-carried an estimated FI`);
    }
}

global.Date = RealDate;
if (failures === 0) {
    console.log(`✓ 751 simulated days, ${history.length * 51 * 4} indicator readings, all invariants held`);
} else {
    console.error(`\n${failures} failure(s)`);
    process.exitCode = 1;
}
