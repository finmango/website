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

// Google Health Trends API search terms (one representative term per indicator).
// The Health Trends API returns: P(term | time, geo) x 10,000,000
// Values are absolute probabilities (typically 1-20 for these terms),
// NOT the 0-100 relative scale from the public Google Trends website.
//
// Only the FIRST term of each list is actually queried. It is named on the
// public methodology page so readers know exactly which search phrase drives
// the trend chart and the volatility boost for each indicator.
const TRENDS_TERMS = {
    financial_anxiety: ["debt help", "bankruptcy", "can't pay rent"],
    food_insecurity: ["food stamps", "food bank near me"],
    housing_stress: ["eviction help", "rent assistance"],
    affordability: ["cost of living", "can't afford"]
};

// Health Trends quota budget for a single daily run. Four national series
// (one per indicator) plus STATES_PER_RUN x 4 state series.
const TRENDS_MAX_REQUESTS = 40;
const TRENDS_STATES_PER_RUN = 9; // 9 states x 4 indicators + 4 national = 40

// A state's cached trends reading is considered usable for this many days.
// With 9 states per daily run, all 51 states refresh every 6 days, so a
// 10-day window keeps full coverage even if a run or two fails.
const TRENDS_MAX_AGE_DAYS = 10;

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

/**
 * Load the previously published snapshot (data/latest.json).
 * This is the run's memory: when an upstream API is down, yesterday's numbers
 * are a far better answer than a synthesized one. Read once, reused by the
 * unemployment carry-forward, the indicator carry-forward and the timeseries.
 */
let previousSnapshotCache;

/**
 * Test seam. The carry-forward paths are the hardest part of this pipeline to
 * get right and the most costly to get wrong, so tests need to drive them with
 * a known previous snapshot rather than whatever happens to be on disk.
 */
function __setPreviousSnapshot(snapshot) {
    previousSnapshotCache = snapshot;
}

function loadPreviousSnapshot() {
    if (previousSnapshotCache !== undefined) return previousSnapshotCache;
    try {
        const p = path.join(__dirname, '..', 'data', 'latest.json');
        previousSnapshotCache = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (error) {
        previousSnapshotCache = null;
    }
    return previousSnapshotCache;
}

/**
 * Rebuild an unemployment map from the last published snapshot.
 *
 * BLS goes down for maintenance often enough that treating an outage as "no
 * unemployment anywhere" is the wrong default — it wipes the single biggest
 * input to Financial Anxiety and lets every state collapse onto a synthetic
 * baseline. Carrying the last known rate forward keeps the index anchored to
 * real measurements until BLS answers again.
 *
 * latest.json stores the rate but not the year-ago comparison, so the change
 * is carried across directly rather than recomputed from a value we no longer
 * have.
 */
// LAUS is monthly; past 90 days a real release has been missed and the carried
// rate should no longer be presented as current.
const UNEMPLOYMENT_MAX_AGE_DAYS = 90;

function carryForwardUnemployment() {
    const previous = loadPreviousSnapshot();
    if (!previous?.states) return null;

    // Without an age cap a prolonged BLS outage would keep republishing the
    // same rate indefinitely, each run looking as current as the last.
    const observedOn = previous.meta?.unemployment_observed || previous.as_of;
    if (observedOn) {
        const ageDays = (Date.now() - new Date(observedOn).getTime()) / 86400000;
        if (isFinite(ageDays) && ageDays > UNEMPLOYMENT_MAX_AGE_DAYS) {
            console.warn(`  ⚠️  Previous unemployment data is ${Math.round(ageDays)} days old (cap ${UNEMPLOYMENT_MAX_AGE_DAYS}) — not carrying forward`);
            return null;
        }
    }

    const results = {};
    for (const state of Object.values(previous.states)) {
        const rate = state?.metrics?.unemployment_rate;
        if (typeof rate !== 'number') continue;

        results[state.abbr] = {
            value: rate,
            previousValue: null,
            carriedChange: state.financial_anxiety?.change ?? 0,
            date: observedOn || previous.as_of || null,
            carriedForward: true,
            observedOn: observedOn || previous.as_of || null
        };
    }

    const count = Object.keys(results).length;
    if (count === 0) {
        console.warn('  ⚠️  No previous unemployment data to carry forward');
        return null;
    }

    console.log(`  ↩️  Carried forward unemployment for ${count} states from ${previous.as_of}`);
    return results;
}

/**
 * Carry a single *component* of a composite index forward from the last
 * published snapshot.
 *
 * Dropping a component is not a neutral act. Housing Stress is
 * 100 + rentBurdenScore + fmrScore + hpiScore, so a missing FRED observation
 * does not make the index "less certain" — it silently redefines it for that
 * one state while the other 50 keep all four terms. In the current reading the
 * house-price term is worth 29 points on average (55 for West Virginia, 19% of
 * a typical score). If FRED alone missed Mississippi, its Housing Stress would
 * read 144 instead of 182 and it would fall from 5th to 33rd — a phantom
 * improvement caused entirely by an API outage.
 *
 * That is why the last real measurement is reused instead. Every input here is
 * slow-moving relative to the daily run — house prices are quarterly, poverty,
 * rent burden and FMR are annual — so yesterday's value is very close to
 * lossless, and vastly closer to the truth than either a fabricated constant or
 * a silently dropped term.
 *
 * Two guards keep this honest:
 *  - `maxAgeDays` stops a dead source from being carried indefinitely. Each cap
 *    is set to roughly twice the source's real publication interval, so a value
 *    expires only when a genuine release has been missed.
 *  - `wasPrimary` refuses to carry a value that was itself a fallback or a tier
 *    estimate. Without it, a hardcoded prior would be laundered into looking
 *    like a carried-forward measurement after one run.
 *
 * When a component does expire, it falls through to the reference datasets and
 * ultimately to carryForwardMissingIndicators, which holds the whole indicator
 * rather than publishing a partial composite.
 */
function carryForwardMetric(abbr, field, { maxAgeDays, wasPrimary }) {
    const previous = loadPreviousSnapshot();
    const metrics = previous?.states?.[`US-${abbr}`]?.metrics;
    if (!metrics) return null;

    const value = metrics[field];
    if (typeof value !== 'number') return null;

    // Only a value that was a primary read (or an unexpired carry of one) may
    // be carried again.
    if (!wasPrimary(metrics)) return null;

    // The snapshot records when the value was published; measure staleness from
    // the original observation date where one was kept, so repeated carries do
    // not reset the clock.
    const observedOn = metrics[`${field}_observed`] || previous.as_of;
    if (!observedOn) return null;

    const ageDays = (Date.now() - new Date(observedOn).getTime()) / 86400000;
    if (!isFinite(ageDays) || ageDays > maxAgeDays) return null;

    return { value, observedOn, ageDays: Math.round(ageDays) };
}

/**
 * Tier estimates — the last-resort fallback for the two housing components.
 *
 * Like REGIONAL_STRESS, these are author-assigned priors rather than
 * measurements: a state is placed in a band by hand and given that band's score.
 * They exist so a state is never simply absent from the map, and they now sit
 * BELOW carry-forward in the precedence chain, so in normal operation they
 * should never fire. Any state actually scored from them is labelled
 * `tier_estimate` in its published metrics, and the count is reported in
 * meta.tier_estimates so it is visible when it does happen.
 *
 * If you find these firing for more than a handful of states, the fix is to
 * repair the upstream fetch, not to tune the tiers.
 */
const RENT_BURDEN_TIERS = {
    // Assumed median gross rent as a share of income, mapped to (pct - 25) * 3
    tier1: { states: ['CA', 'NY', 'MA', 'HI', 'DC', 'NJ'], assumed_pct: 32, score: 21 },
    tier2: { states: ['WA', 'CO', 'FL', 'MD', 'MN', 'CT', 'OR'], assumed_pct: 29, score: 12 },
    tier3: { states: ['NH', 'VA', 'AZ', 'NV', 'TX', 'IL', 'RI', 'VT', 'AK'], assumed_pct: 27, score: 6 }
    // Every other state is assumed to sit at the 25% baseline and scores 0.
};

const FMR_HIGH_COST_TIER = {
    states: ['CA', 'NY', 'MA', 'HI', 'DC', 'NJ', 'WA', 'CO', 'MD', 'CT'],
    score: 15
    // Every other state scores 0.
};

/**
 * Regional stress multipliers.
 *
 * IMPORTANT — these are author-assigned priors, not measurements. They are not
 * estimated from any dataset, not fitted to any outcome, and carry no standard
 * error. They were set by hand to reflect structural conditions the annual
 * federal series are slow to capture, and every published index is multiplied
 * by them.
 *
 * Their effect is large. Removing them reorders 42 of the 51 Financial Anxiety
 * ranks, moving Mississippi 24 places; the 0.85-1.35 range spans 60 index
 * points on the 120 base, against the 72 points spanned by the full national
 * range of actual state unemployment rates. Roughly half the spread readers
 * see on the map therefore comes from this table rather than from BLS.
 *
 * They are published per state in the output and disclosed on the public
 * methodology page. Do not change a value here without updating that
 * disclosure — an undocumented edit silently reorders the map.
 */
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

// NLIHC Housing Wage definition: hourly wage needed to afford FMR at 30% of
// income, assuming 2,080 work hours per year. Matches NLIHC OOR methodology.
function deriveHousingWage(fmr2br) {
    if (!fmr2br || fmr2br <= 0) return null;
    return Math.round((fmr2br * 12) / (2080 * 0.30) * 100) / 100;
}

/**
 * Read the previously published per-state trends cache.
 *
 * The Health Trends quota only allows a few dozen requests per run, so a
 * single run cannot cover 51 states x 4 indicators. Instead each run refreshes
 * a rotating slice and merges it into this cache, which is republished every
 * day. Every cached reading carries the date it was actually fetched so a
 * stale value can be aged out rather than silently reused forever.
 */
function loadTrendsCache() {
    const cached = loadPreviousSnapshot()?.meta?.trends_cache;
    if (!cached || typeof cached !== 'object') return { states: {}, cursor: 0 };
    return {
        states: cached.states && typeof cached.states === 'object' ? cached.states : {},
        cursor: Number.isInteger(cached.cursor) ? cached.cursor : 0
    };
}

/**
 * Drop cached trends readings older than TRENDS_MAX_AGE_DAYS.
 * An expired reading is worse than no reading: it would hand a state a stale
 * volatility boost that its neighbours have already had refreshed.
 */
function pruneTrendsCache(cache, today) {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - TRENDS_MAX_AGE_DAYS);

    let dropped = 0;
    for (const [indicator, byState] of Object.entries(cache.states)) {
        for (const [abbr, entry] of Object.entries(byState)) {
            const fetched = entry && entry.fetched ? new Date(entry.fetched) : null;
            if (!fetched || fetched < cutoff) {
                delete cache.states[indicator][abbr];
                dropped++;
            }
        }
    }
    if (dropped > 0) console.log(`  \u{1F5D1}\uFE0F  Dropped ${dropped} trends readings older than ${TRENDS_MAX_AGE_DAYS} days`);
    return cache;
}

/**
 * Fetch data from the Google Health Trends API (exclusive, approved access only).
 * Unlike the public Google Trends website (relative 0-100 scale), this API returns
 * absolute probability values: P(term | time, geography) x 10,000,000.
 * A value of 5 means 5 out of every 10 million search sessions included that term.
 * Values for our financial stress terms typically range from 1-20.
 *
 * Quota forces a rotation rather than a full sweep. Previously this fetched a
 * hardcoded list of 10 states, which handed those 10 a volatility boost the
 * other 41 could never receive and quietly moved them up the rankings. Now the
 * run advances a cursor through all 51 states, merging each slice into a cache
 * that reaches full coverage in six days and refreshes on a rolling basis.
 */
async function fetchGoogleTrends() {
    const apiKey = process.env.GOOGLE_TRENDS_API_KEY;
    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10);

    // The cache is the run's memory and is republished even when the API is
    // unreachable, so a failed fetch never wipes coverage built up over days.
    const cache = pruneTrendsCache(loadTrendsCache(), today);

    if (!apiKey) {
        console.log('\u26A0\uFE0F  GOOGLE_TRENDS_API_KEY not set - skipping trends fetch');
        return summariseTrends(cache, {}, todayISO, cache.cursor, { attempted: false });
    }

    console.log('\u{1F4C8} Fetching Google Trends data (rotating slice)...');
    const nationalTimeSeries = {};

    const d3 = new Date(); d3.setMonth(d3.getMonth() - 3);
    const startDate3m = d3.toISOString().slice(0, 7);

    const d10y = new Date(); d10y.setFullYear(d10y.getFullYear() - 10);
    const startDate10y = d10y.toISOString().slice(0, 7);

    // The rotating slice: TRENDS_STATES_PER_RUN states starting at the stored
    // cursor, wrapping around the alphabetical state list.
    const allStates = Object.keys(STATE_FIPS);
    const cursor = cache.cursor % allStates.length;
    const slice = [];
    for (let i = 0; i < TRENDS_STATES_PER_RUN; i++) {
        slice.push(allStates[(cursor + i) % allStates.length]);
    }
    console.log(`   Slice ${cursor}-${cursor + TRENDS_STATES_PER_RUN - 1} of ${allStates.length}: ${slice.join(', ')}`);

    let requestCount = 0;
    let stopped = false;
    // Distinguish "the rotation has not reached these states yet" from "every
    // request came back empty". Both leave coverage at 0, but only the second
    // means the integration is broken.
    let stateRequests = 0;
    let stateReadings = 0;

    for (const indicator of Object.keys(TRENDS_TERMS)) {
        const term = TRENDS_TERMS[indicator][0];
        if (!cache.states[indicator]) cache.states[indicator] = {};

        // 1. National 10-year series, used only for the shape of the trend chart
        try {
            const nationalUrl = `https://www.googleapis.com/trends/v1beta/graph?terms=${encodeURIComponent(term)}&restrictions.geo=US&restrictions.startDate=${startDate10y}&key=${apiKey}`;
            const natResponse = await fetch(nationalUrl);

            if (natResponse.ok) {
                const data = await natResponse.json();
                if (data.lines?.[0]?.points?.length > 0) {
                    nationalTimeSeries[indicator] = data.lines[0].points;
                }
            }
            requestCount++;
            await delay(500);
        } catch (error) {
            console.warn(`   Could not fetch national trends for ${indicator}`);
        }

        // 2. This run's slice of states
        for (const abbr of slice) {
            if (requestCount >= TRENDS_MAX_REQUESTS) { stopped = true; break; }
            try {
                const stateUrl = `https://www.googleapis.com/trends/v1beta/graph?terms=${encodeURIComponent(term)}&restrictions.geo=US-${abbr}&restrictions.startDate=${startDate3m}&key=${apiKey}`;
                const response = await fetch(stateUrl);

                if (response.status === 429) {
                    console.log('   \u26A1 Rate limited - stopping trends fetch, cache keeps prior coverage');
                    stopped = true;
                    break;
                }

                stateRequests++;
                if (response.ok) {
                    const data = await response.json();
                    const points = data.lines?.[0]?.points;
                    if (points?.length > 0) {
                        cache.states[indicator][abbr] = {
                            value: points[points.length - 1].value,
                            fetched: todayISO
                        };
                        stateReadings++;
                    }
                }

                requestCount++;
                await delay(500);
            } catch (error) {
                console.warn(`   Could not fetch trends for ${indicator}/${abbr}`);
            }
        }
        if (stopped) break;
    }

    // Only advance the cursor when the slice actually completed, so a run cut
    // short by the quota retries the same states tomorrow instead of skipping
    // them and leaving a permanent hole in coverage.
    const nextCursor = stopped ? cursor : (cursor + TRENDS_STATES_PER_RUN) % allStates.length;

    console.log(`  \u2713 Trends: ${requestCount} requests, ${stateReadings}/${stateRequests} state requests returned data`);
    if (stateRequests > 0 && stateReadings === 0) {
        console.warn('  \u26A0\uFE0F  Health Trends returned no data for any state this run — check API access.');
        console.warn('      Coverage cannot complete while this persists, so the volatility boost stays withheld.');
    }

    return summariseTrends(cache, nationalTimeSeries, todayISO, nextCursor, {
        state_requests: stateRequests,
        state_readings: stateReadings,
        attempted: true
    });
}

/**
 * Shape the trends cache into the object the index calculation consumes, and
 * work out whether coverage is complete enough for the boost to be applied.
 *
 * The boost is only added to the published index when EVERY state has a
 * current reading for that indicator. A boost that reaches some states and not
 * others is not a signal, it is a thumb on the scale for whichever states
 * happened to be fetched, and it moves the rankings that readers compare.
 */
function summariseTrends(cache, nationalTimeSeries, todayISO, nextCursor, runStats = {}) {
    const totalStates = Object.keys(STATE_FIPS).length;
    const states = {};
    const coverage = {};

    for (const indicator of Object.keys(TRENDS_TERMS)) {
        const byState = cache.states[indicator] || {};
        states[indicator] = {};
        for (const [abbr, entry] of Object.entries(byState)) {
            if (entry && typeof entry.value === 'number') states[indicator][abbr] = entry.value;
        }

        const covered = Object.keys(states[indicator]).length;
        const dates = Object.values(byState).map(e => e?.fetched).filter(Boolean).sort();

        coverage[indicator] = {
            states_covered: covered,
            states_total: totalStates,
            complete: covered === totalStates,
            oldest_reading: dates[0] || null,
            newest_reading: dates[dates.length - 1] || null
        };

        const status = coverage[indicator].complete
            ? 'complete - boost applied'
            : `${covered}/${totalStates} - boost withheld until coverage completes`;
        console.log(`   ${indicator}: ${status}`);
    }

    // Preserve the date of the last run that actually retrieved something, so a
    // silently dead integration is visible rather than looking like a rotation
    // still working its way round.
    const previousCache = loadPreviousSnapshot()?.meta?.trends_cache;
    const lastSuccess = runStats.state_readings > 0
        ? todayISO
        : (previousCache?.last_successful_fetch || null);

    return {
        states,
        coverage,
        nationalTimeSeries,
        run: runStats,
        cache: {
            states: cache.states,
            cursor: nextCursor,
            updated: todayISO,
            last_successful_fetch: lastSuccess
        },
        term_used: Object.fromEntries(
            Object.entries(TRENDS_TERMS).map(([k, v]) => [k, v[0]])
        )
    };
}

/**
 * Fetch state unemployment rates from the BLS API.
 * Series ID format: LASST{FIPS}0000000000003
 *
 * v2 is used when BLS_API_KEY is set (500 requests/day, per registration).
 * Without a key this falls back to v1, whose 25 requests/day quota is counted
 * PER IP — and on shared CI runners that quota is routinely exhausted by other
 * tenants before this job runs. That is what took unemployment offline here for
 * 23 consecutive days: not a BLS outage, a shared anonymous quota.
 *
 * Get a free key at https://data.bls.gov/registrationEngine/
 */
async function fetchBLSUnemployment() {
    const apiKey = process.env.BLS_API_KEY;
    const version = apiKey ? 'v2' : 'v1';
    console.log(`📊 Fetching unemployment data from BLS (${version})...`);
    if (!apiKey) {
        console.log('   ⚠️  BLS_API_KEY not set — using the anonymous v1 quota (25/day, shared per IP).');
        console.log('      Get a free key at https://data.bls.gov/registrationEngine/');
    }

    const results = {};
    const stateAbbrs = Object.keys(STATE_FIPS);
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const seriesIds = stateAbbrs.map(abbr => `LASST${STATE_FIPS[abbr]}0000000000003`);

    // BLS allows 25 series per request on v1, 50 on v2
    const batchSize = apiKey ? 50 : 25;
    const batches = [];
    for (let i = 0; i < seriesIds.length; i += batchSize) {
        batches.push(seriesIds.slice(i, i + batchSize));
    }

    const url = apiKey
        ? 'https://api.bls.gov/publicAPI/v2/timeseries/data/'
        : 'https://api.bls.gov/publicAPI/v1/timeseries/data/';

    let quotaExhausted = false;

    for (const batch of batches) {
        try {
            const body = {
                seriesid: batch,
                startyear: lastYear.toString(),
                endyear: currentYear.toString()
            };
            if (apiKey) body.registrationkey = apiKey;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                console.error(`BLS API error: HTTP ${response.status} ${response.statusText}`);
                continue;
            }

            // BLS serves JSON under a text/plain content-type, including for its
            // error responses. The previous content-type guard rejected those
            // unread and logged "expected JSON, got text/plain", which hid the
            // actual message — a quota rejection — behind what looked like an
            // outage for three weeks. Parse first, then decide.
            const raw = await response.text();
            let data;
            try {
                data = JSON.parse(raw);
            } catch {
                console.error(`BLS API error: response was not JSON (${raw.slice(0, 120)})`);
                continue;
            }

            if (data.status !== 'REQUEST_SUCCEEDED') {
                const message = Array.isArray(data.message) ? data.message.join('; ') : data.status;
                console.error(`BLS API error: ${data.status} — ${message}`);
                if (/threshold|quota/i.test(message)) {
                    quotaExhausted = true;
                    break; // further batches will fail identically
                }
                continue;
            }

            for (const series of data.Results?.series || []) {
                const fips = series.seriesID.substring(5, 7);
                const stateAbbr = Object.entries(STATE_FIPS).find(([, f]) => f === fips)?.[0];
                if (!stateAbbr || !series.data?.length) continue;

                const latest = series.data[0];
                const lastYearValue = series.data.find(d =>
                    d.year === lastYear.toString() && d.period === latest.period
                );

                results[stateAbbr] = {
                    value: parseFloat(latest.value),
                    previousValue: lastYearValue ? parseFloat(lastYearValue.value) : null,
                    // The BLS reference month, not the fetch date. This is the
                    // observation the carry-forward age cap is measured from.
                    date: `${latest.year}-${latest.period.replace('M', '')}`
                };
            }

            await delay(1000); // Rate limiting
        } catch (error) {
            console.error('BLS API error:', error.message);
        }
    }

    const retrieved = Object.keys(results).length;
    if (retrieved === 0) {
        if (quotaExhausted) {
            console.warn('  ⚠️  BLS daily request quota exhausted — falling back to the last published values');
            console.warn('      Set BLS_API_KEY to use the v2 quota (500/day) instead of the shared anonymous one.');
        } else {
            console.warn('  ⚠️  BLS returned no usable data — falling back to the last published values');
        }
        return { data: null, reason: quotaExhausted ? 'quota exhausted' : 'no usable response' };
    }

    console.log(`  ✓ Retrieved unemployment data for ${retrieved} states`);
    return { data: results, reason: null };
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
 * Resolve the Health Trends volatility boost for one state and indicator.
 *
 * Returns the raw cached reading regardless of coverage so it can be published
 * for inspection, but only marks it `applied` when every state has a current
 * reading for that indicator. Applying a partial boost would rank states by
 * which ones the quota happened to reach that week.
 */
function trendsBoostFor(trends, indicator, abbr) {
    const raw = trends?.states?.[indicator]?.[abbr];
    if (typeof raw !== 'number') return { value: null, applied: false };

    const complete = trends?.coverage?.[indicator]?.complete === true;
    return { value: Math.min(raw, 10), applied: complete };
}

/**
 * Clamp an index value to its published range and report whether it was hit.
 *
 * Clamping is not cosmetic: states pinned at a bound lose their ordering
 * against each other (two states at the food-insecurity ceiling of 160 are
 * tied, and their relative rank is an artefact of sort order, not data).
 * Recording the clamp lets the site show that a rank is a tie.
 */
function clampIndex(raw, min, max) {
    const value = Math.round(Math.max(min, Math.min(max, raw)));
    const clamped = raw > max ? 'ceiling' : (raw < min ? 'floor' : null);
    return { value, clamped };
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
    const asOfToday = new Date().toISOString().slice(0, 10);
    const stateAbbrs = Object.keys(STATE_FIPS);

    // Resolve, up front, the Fair Market Rent each state will actually be scored
    // against — live where HUD answered, carried forward where it did not.
    //
    // This has to happen before the national average is taken, because the FMR
    // score is a RATIO against that average. Computing the average from only
    // the live subset while scoring states on carried values compares each
    // state against a different population than it belongs to. With HUD fully
    // down the average would fall back to the 1400 constant while the states
    // themselves carried real HUD figures averaging about 1529 — inflating
    // expensive states by up to 6 index points and understating cheap ones.
    // A partial HUD outage is worse still: the average would be taken over
    // whichever handful of states happened to answer.
    const effectiveFMR = {};
    for (const abbr of stateAbbrs) {
        const live = fmr?.[abbr]?.fmr_2br;
        if (typeof live === 'number') {
            effectiveFMR[abbr] = { value: live, carried: null };
            continue;
        }
        const carried = carryForwardMetric(abbr, 'fair_market_rent_2br', {
            maxAgeDays: 550, // HUD publishes FMRs annually
            wasPrimary: m => m.fair_market_rent_source === 'HUD FMR API'
                || m.fair_market_rent_source === 'HUD FMR API (carried forward)'
        });
        if (carried) effectiveFMR[abbr] = { value: carried.value, carried };
    }

    // National 2-BR FMR baseline, taken over every state that has a usable
    // figure — the same population the ratios are scored against.
    const fmrValues = Object.values(effectiveFMR).map(e => e.value);
    const nationalAvgFMR = fmrValues.length > 0
        ? fmrValues.reduce((a, b) => a + b, 0) / fmrValues.length
        : 1400; // Only reached when no state has an FMR at all

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

        // Health Trends readings for this state, recorded whether or not they
        // were applied, so the published data shows both the signal and
        // whether it reached the index. Resolved up front for all four
        // indicators: computing them inside the per-indicator branches meant an
        // upstream outage (no poverty data, say) silently dropped that
        // indicator's key from the published record.
        const boosts = Object.fromEntries(
            Object.keys(TRENDS_TERMS).map(ind => [ind, trendsBoostFor(trends, ind, abbr)])
        );

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

            // Google Health Trends volatility boost (+0 to +10 points), applied
            // only when all 51 states have a current reading. See trendsBoostFor.
            const anxietyBoost = boosts.financial_anxiety;
            if (anxietyBoost.applied) anxietyValue += anxietyBoost.value;
    
            // carriedChange is set when this rate came from the last published
            // snapshot rather than a live BLS response — the year-ago value
            // needed to recompute it isn't stored, so it rides along instead.
            const change = unemp.carriedChange ?? (unemp.previousValue
                ? ((unemp.value - unemp.previousValue) / unemp.previousValue * 100)
                : 0);

            const anxietyClamped = clampIndex(anxietyValue, 80, 200);
            states[stateCode].financial_anxiety = {
                value: anxietyClamped.value,
                change: parseFloat(change.toFixed(1)),
                change_basis: unemp.carriedChange != null
                    ? 'carried forward from previous run'
                    : (unemp.previousValue ? 'year-over-year unemployment rate' : 'no comparison period available'),
                rank: null,
                ...(anxietyClamped.clamped && { clamped: anxietyClamped.clamped })
            };
        }

        // Food Insecurity: Based on poverty rate + regional factor
        if (poverty?.[abbr]) {
            const pov = poverty[abbr];
            const rawValue = 85 + (pov.povertyRate - BASELINE_POVERTY) * POVERTY_MULTIPLIER;
            let foodValue = rawValue * regionalMultiplier;

            const foodBoost = boosts.food_insecurity;
            if (foodBoost.applied) foodValue += foodBoost.value;
    
            // Census SAIPE publishes annually, so there is no period-over-period
            // change to report at daily cadence. Publish null rather than 0 —
            // the frontend rendered a hardcoded 0 as a red "up 0.0%" arrow,
            // showing a rise where no change data exists at all.
            const foodClamped = clampIndex(foodValue, 55, 160);
            states[stateCode].food_insecurity = {
                value: foodClamped.value,
                change: null,
                change_basis: 'not available - SAIPE poverty data is annual',
                rank: null,
                ...(foodClamped.clamped && { clamped: foodClamped.clamped })
            };
        }

        // Housing Stress: Based on housing price changes + rent burden + FMR
        // DATA-DRIVEN FORMULA using Census ACS + Harvard JCHS calibration
        const hpi = housing?.[abbr];
        const stateRentBurden = rentBurden?.[abbr];
        const jchsState = jchs?.states?.[abbr];

        // Calculate rent burden score from actual Census data or JCHS reference
        // Base 25% is considered healthy; each % above adds to stress
        let rentBurdenScore = 0;
        let rentBurdenSource = 'default';

        // Precedence for every component below: live read, then the last real
        // measurement carried forward, then a reference dataset, then a
        // hardcoded tier estimate. Yesterday's actual ACS number beats today's
        // JCHS approximation of it, so carry-forward sits above the reference
        // sources, not below them.
        let rentBurdenCarried = null;

        if (stateRentBurden) {
            // Primary source: Census ACS B25071 (median gross rent as % of income)
            rentBurdenScore = (stateRentBurden.medianRentBurden - 25) * 3;
            rentBurdenSource = 'census_acs';
        } else if ((rentBurdenCarried = carryForwardMetric(abbr, 'rent_burden_pct', {
            maxAgeDays: 550, // ACS is annual; expire after a missed release
            // Must accept the label a previous carry writes, or the chain
            // breaks after a single day and drops to a tier estimate — the
            // 550-day cap would never actually be reached. The original
            // observation date still bounds the age, so accepting the carried
            // label does not extend the window.
            wasPrimary: m => m.rent_burden_source === 'census_acs'
                || m.rent_burden_source === 'census_acs_carried_forward'
        }))) {
            rentBurdenScore = (rentBurdenCarried.value - 25) * 3;
            rentBurdenSource = 'census_acs_carried_forward';
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
            // Last resort: a hand-assigned tier. See RENT_BURDEN_TIERS.
            const tier = Object.values(RENT_BURDEN_TIERS).find(t => t.states.includes(abbr));
            rentBurdenScore = tier ? tier.score : 0;
            rentBurdenSource = 'tier_estimate';
        }

        // Calculate FMR score (relative cost compared to national average)
        let fmrScore = 0;
        let fmrSource = 'default';

        // Resolved in the pre-pass above so the ratio and the average it is
        // taken against cover the same set of states.
        const resolvedFMR = effectiveFMR[abbr];
        const fmrCarried = resolvedFMR?.carried || null;

        if (resolvedFMR) {
            const fmrRatio = resolvedFMR.value / nationalAvgFMR;
            fmrScore = (fmrRatio - 1) * 40; // +40 points per 100% above average
            fmrSource = fmrCarried ? 'hud_fmr_carried_forward' : 'hud_fmr';
        } else if (jchsState && jchsState.median_rent) {
            // Secondary source: JCHS median rent by state
            const nationalAvgJCHS = 1200; // Approximate national median from JCHS
            const fmrRatio = jchsState.median_rent / nationalAvgJCHS;
            fmrScore = (fmrRatio - 1) * 40;
            fmrSource = 'jchs_2025';
        } else {
            // Last resort: a hand-assigned tier. See FMR_HIGH_COST_TIER.
            fmrScore = FMR_HIGH_COST_TIER.states.includes(abbr) ? FMR_HIGH_COST_TIER.score : 0;
            fmrSource = 'tier_estimate';
        }

        // Housing price change impact (from FRED HPI).
        //
        // This term used to default to 5% when FRED had no observation, which
        // invented a year of house-price growth and added 10 points; `|| 5`
        // also rewrote a genuine 0% change as 5%, unable to tell "no data" from
        // "no change". Neither a fabricated constant nor a dropped term is
        // acceptable here: the term is worth 29 points on average, so dropping
        // it would read as a housing-market improvement caused by an outage.
        // The last real observation is carried forward instead. FRED HPI is
        // quarterly, so across a daily gap this is very nearly lossless.
        let hpiChange = typeof hpi?.change === 'number' ? hpi.change : null;
        let hpiSource = hpiChange !== null ? 'FRED FHFA HPI' : null;
        let hpiCarried = null;

        if (hpiChange === null) {
            hpiCarried = carryForwardMetric(abbr, 'housing_price_change', {
                maxAgeDays: 180, // quarterly series; expire after two missed releases
                wasPrimary: m => typeof m.housing_price_change === 'number'
            });
            if (hpiCarried) {
                hpiChange = hpiCarried.value;
                hpiSource = `FRED FHFA HPI, carried forward from ${hpiCarried.observedOn}`;
            }
        }

        // Only once a value is genuinely unavailable does the term drop out —
        // and then the indicator is flagged rather than quietly rescaled.
        const hpiScore = hpiChange !== null ? hpiChange * 2 : 0;
        const hpiMissing = hpiChange === null;

        // Combine all factors into housing stress score
        // BASE 100 + rent burden impact + FMR impact + HPI impact
        const rawHousingStress = 100 + rentBurdenScore + fmrScore + hpiScore;
        let stressValue = rawHousingStress * regionalMultiplier;

        const housingBoost = boosts.housing_stress;
        if (housingBoost.applied) stressValue += housingBoost.value;

        // A composite missing one of its terms is not comparable with the
        // states that have all four, so say so on the indicator itself rather
        // than leaving the gap to be inferred from the metrics block.
        const housingClamped = clampIndex(stressValue, 80, 200);
        states[stateCode].housing_stress = {
            value: housingClamped.value,
            change: hpiChange !== null ? parseFloat(hpiChange.toFixed(1)) : null,
            change_basis: hpiChange === null
                ? 'not available - no FRED HPI observation for this state'
                : (hpiCarried
                    ? `year-over-year FHFA house price index (FRED), carried forward from ${hpiCarried.observedOn}`
                    : 'year-over-year FHFA house price index (FRED)'),
            rank: null,
            ...(hpiMissing && {
                partial: true,
                partial_reason: 'house-price term unavailable and too old to carry forward; '
                    + 'this score omits a component the other states include'
            }),
            ...(housingClamped.clamped && { clamped: housingClamped.clamped })
        };

        // Store raw metrics for transparency/export.
        // Null-coalescing (??) throughout: `||` treated a legitimate 0 as
        // missing data and replaced it with null.
        states[stateCode].metrics = {
            unemployment_rate: unemployment?.[abbr]?.value ?? null,
            // The BLS reference month the rate describes. Distinct from when we
            // fetched it: LAUS is monthly and published with its own lag, so a
            // freshly fetched rate still describes a prior month.
            unemployment_period: unemployment?.[abbr]?.date ?? null,
            poverty_rate: poverty?.[abbr]?.povertyRate ?? null,
            rent_burden_pct: rentBurden?.[abbr]?.medianRentBurden
                ?? rentBurdenCarried?.value
                ?? jchsState?.renters_cost_burdened ?? null,
            rent_burden_source: rentBurdenSource,
            // Original observation date, preserved across repeated carries so
            // staleness is measured from the real reading, not the last republish.
            rent_burden_pct_observed: rentBurden?.[abbr]
                ? asOfToday
                : (rentBurdenCarried?.observedOn ?? null),

            // HUD Fair Market Rent, and ONLY HUD FMR. This field previously
            // fell back to the JCHS median rent while still labelling itself
            // "fair_market_rent" with an fmr_source of jchs_2025 — two
            // different quantities under one name, disagreeing with the
            // top-level fmr_2br field for every state (California: $1,850 here
            // against $2,580 there). Median rent now has its own field and the
            // FMR field is null when HUD is unreachable.
            fair_market_rent_2br: fmr?.[abbr]?.fmr_2br ?? fmrCarried?.value ?? null,
            fair_market_rent_source: fmr?.[abbr]
                ? 'HUD FMR API'
                : (fmrCarried ? 'HUD FMR API (carried forward)' : null),
            fair_market_rent_2br_observed: fmr?.[abbr]
                ? asOfToday
                : (fmrCarried?.observedOn ?? null),
            median_rent_2br: jchsState?.median_rent ?? null,
            median_rent_source: jchsState?.median_rent ? 'Harvard JCHS 2025' : null,

            // Which input actually supplied the FMR term of the housing score
            fmr_score_source: fmrSource,
            housing_price_change: hpiChange,
            housing_price_change_source: hpiSource,
            housing_price_change_observed: typeof hpi?.change === 'number'
                ? asOfToday
                : (hpiCarried?.observedOn ?? null),

            // Author-assigned regional prior. Not measured, not fitted, and not
            // derived from any of the sources above — see REGIONAL_STRESS.
            regional_stress_multiplier: regionalMultiplier,

            // Health Trends readings, published whether or not they were added
            // to the index (they are withheld until all 51 states are covered).
            trends_boost: Object.fromEntries(
                Object.entries(boosts).map(([ind, b]) => [ind, { value: b.value, applied: b.applied }])
            ),

            // JCHS reference data (authoritative calibration)
            jchs_renters_cost_burdened: jchsState?.renters_cost_burdened ?? null,
            jchs_renters_severely_burdened: jchsState?.renters_severely_burdened ?? null,
            jchs_median_rent: jchsState?.median_rent ?? null
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
        // Use the same resolved figure the index was scored on. Keying these
        // off live HUD alone put a carried HUD value in the index while these
        // fields showed NLIHC — two disagreeing rents in one record, with the
        // Housing Policy Lab reading the second.
        let fmrValue = resolvedFMR?.value ?? null;
        let fmrOut = resolvedFMR
            ? (fmrCarried ? `HUD FY2025 (carried forward from ${fmrCarried.observedOn})` : 'HUD FY2025')
            : null;
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
        let wageSource = fmrValue !== null && resolvedFMR
            ? 'Derived from HUD FMR (NLIHC formula)'
            : (nlihcState ? 'NLIHC OOR 2025 (fallback)' : null);
        if (wageValue === null && nlihcState) {
            wageValue = nlihcState.housing_wage;
        }
        states[stateCode].housing_wage = wageValue !== null
            ? { value: wageValue, source: wageSource }
            : null;
    }

    // Prefer the last published reading over a synthesized one, then fall back
    // to regional estimates for anything with no history at all.
    carryForwardMissingIndicators(states);
    fillMissingValues(states, REGIONAL_STRESS);

    // Affordability is derived LAST, from the final Housing Stress and Food
    // Insecurity values.
    //
    // It used to be computed inside the state loop, before those two had been
    // carried forward or filled — so during a Census outage it fell back to a
    // hardcoded `115 * multiplier` for its food term while Food Insecurity was
    // separately carried forward to its real value moments later. The published
    // Affordability then contradicted its own published definition (Texas
    // showed 115 where 0.6·housing + 0.4·food gives 107.4) with nothing marking
    // it as estimated. Deriving it here means it always equals the formula the
    // methodology page states.
    deriveAffordability(states, trends);

    // Calculate ranks for each indicator
    calculateRanks(states);

    return states;
}

// Affordability is excluded: it is derived from the three below after they
// have settled, so carrying it forward or estimating it would only produce a
// value that deriveAffordability immediately overwrites.
const BASE_INDICATORS = ['financial_anxiety', 'food_insecurity', 'housing_stress'];

/**
 * Derive Affordability from the final Housing Stress and Food Insecurity values.
 *
 * Purely a restatement of those two indices (60/40), so it is computed after
 * every other indicator has settled — including carry-forward and estimation —
 * rather than mid-loop off values that may still be null.
 */
function deriveAffordability(states, trends) {
    for (const [stateCode, state] of Object.entries(states)) {
        const housing = state.housing_stress;
        const food = state.food_insecurity;
        if (typeof housing?.value !== 'number' || typeof food?.value !== 'number') continue;

        let value = housing.value * 0.60 + food.value * 0.40;

        const boost = trendsBoostFor(trends, 'affordability', state.abbr);
        if (boost.applied) value += boost.value;

        const clamped = clampIndex(value, 80, 200);

        // Affordability inherits whatever qualifies its inputs: a missing
        // component, a carried value or a regional estimate all flow through.
        const inherited = {};
        if (housing.partial) {
            inherited.partial = true;
            inherited.partial_reason = 'derived from a Housing Stress score that omits its house-price term';
        }
        if (housing.estimated || food.estimated) inherited.estimated = true;
        const carriedFrom = housing.carried_forward_from || food.carried_forward_from;
        if (carriedFrom) inherited.carried_forward_from = carriedFrom;

        state.affordability = {
            value: clamped.value,
            change: null,
            change_basis: 'not available - derived index, no independent change series',
            rank: null,
            ...inherited,
            ...(clamped.clamped && { clamped: clamped.clamped })
        };

        if (state.metrics?.trends_boost) {
            state.metrics.trends_boost.affordability = { value: boost.value, applied: boost.applied };
        }
    }
}

/**
 * Carry the previous run's indicator values forward for any state the current
 * run could not calculate.
 *
 * Yesterday's real measurement beats today's estimate: an upstream outage
 * should freeze an indicator, not replace it with a number derived from a
 * hardcoded baseline and published under a "BLS LAUS" source label.
 */
function carryForwardMissingIndicators(states) {
    const previous = loadPreviousSnapshot();
    if (!previous?.states) return;

    const indicators = BASE_INDICATORS;
    const carried = {};

    for (const [stateCode, state] of Object.entries(states)) {
        const prevState = previous.states[stateCode];
        if (!prevState) continue;

        for (const indicator of indicators) {
            if (state[indicator].value !== null) continue;

            const prevValue = prevState[indicator]?.value;
            if (typeof prevValue !== 'number') continue;

            state[indicator] = {
                value: prevValue,
                change: prevState[indicator].change ?? null,
                change_basis: prevState[indicator].change_basis ?? 'carried forward from previous run',
                rank: null,
                carried_forward_from: previous.as_of || null
            };
            carried[indicator] = (carried[indicator] || 0) + 1;
        }
    }

    for (const [indicator, count] of Object.entries(carried)) {
        console.log(`  ↩️  ${indicator}: carried ${count} states forward from ${previous.as_of}`);
    }
}

/**
 * Fill missing values with regional estimates
 */
function fillMissingValues(states, regionalStress = {}) {
    const indicators = BASE_INDICATORS;

    // Calculate national averages from available data
    const averages = {};
    for (const indicator of indicators) {
        const values = Object.values(states)
            .map(s => s[indicator].value)
            .filter(v => v !== null);

        averages[indicator] = values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 120; // Higher baseline for crisis display

        // Nothing to average from means every state is being estimated off a
        // hardcoded constant — a whole-country outage, not a data gap. Say so
        // loudly; a silent version of this shipped 51 synthetic values once.
        if (values.length === 0) {
            console.warn(`  ⚠️  ${indicator}: no live or previous values anywhere — estimating all 51 states from the ${averages[indicator]} baseline`);
        }
    }

    // Fill missing values with averages adjusted by regional stress
    const estimated = {};
    for (const stateCode of Object.keys(states)) {
        const abbr = states[stateCode].abbr;
        const multiplier = regionalStress[abbr] || 1.0;

        for (const indicator of indicators) {
            if (states[stateCode][indicator].value === null) {
                states[stateCode][indicator].value = Math.round(averages[indicator] * multiplier);
                states[stateCode][indicator].change = null;
                states[stateCode][indicator].change_basis = 'not available - value is a regional estimate';
                states[stateCode][indicator].estimated = true;
                estimated[indicator] = (estimated[indicator] || 0) + 1;
            }
        }
    }

    for (const [indicator, count] of Object.entries(estimated)) {
        console.warn(`  ⚠️  ${indicator}: estimated ${count} states from regional baselines`);
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
        const values = Object.values(states).map(s => s[indicator].value).filter(v => typeof v === 'number');

        // Only states with a real change reading count toward the national
        // change. Indicators with no change series at all (food insecurity,
        // affordability) now report null instead of an average of hardcoded
        // zeros, which the dashboard was rendering as "up 0.0%".
        const changes = Object.values(states)
            .map(s => s[indicator].change)
            .filter(c => typeof c === 'number');

        const avgValue = values.length
            ? values.reduce((a, b) => a + b, 0) / values.length
            : null;
        const avgChange = changes.length
            ? changes.reduce((a, b) => a + b, 0) / changes.length
            : null;

        let trend = 'flat';
        if (avgChange === null) trend = null;
        else if (avgChange > 0.05) trend = 'up';
        else if (avgChange < -0.05) trend = 'down';

        national[indicator] = {
            value: avgValue !== null ? Math.round(avgValue * 10) / 10 : null,
            change: avgChange !== null ? Math.round(avgChange * 10) / 10 : null,
            change_coverage: { states_with_change: changes.length, states_total: values.length },
            trend
        };
    }

    return national;
}

/**
 * Count, per component, how many states are running on a carried-forward
 * reading rather than a live one, and how stale the oldest of them is.
 *
 * Component carries happen per state, but the provenance table readers see is
 * run-level. Without this, a run where FRED answered for 3 states and 48 were
 * carried would still display a flat "FRED HPI".
 */
function summariseCarryForward(states) {
    const FIELDS = {
        housing_prices: ['housing_price_change_source', 'housing_price_change_observed'],
        rent_burden: ['rent_burden_source', 'rent_burden_pct_observed'],
        fair_market_rent: ['fair_market_rent_source', 'fair_market_rent_2br_observed']
    };

    const summary = {};
    for (const [key, [sourceField, observedField]] of Object.entries(FIELDS)) {
        let carried = 0;
        let oldest = null;
        for (const state of Object.values(states)) {
            const source = state.metrics?.[sourceField];
            if (typeof source !== 'string' || !/carried[ _]forward/i.test(source)) continue;
            carried++;
            const observed = state.metrics?.[observedField];
            if (observed && (!oldest || observed < oldest)) oldest = observed;
        }
        if (carried > 0) summary[key] = { states_carried: carried, oldest_observation: oldest };
    }

    const partial = Object.values(states).filter(st => st.housing_stress?.partial).length;
    if (partial > 0) summary.housing_stress_partial = { states_partial: partial };

    return summary;
}

/**
 * Append any carry-forward detail to a source label, so the published
 * provenance string tells the whole story on its own.
 *
 * `primaryName` matters when the live fetch returned nothing at all: the base
 * label is then "estimated" or a reference dataset, but the states are actually
 * running on carried readings from the real source. Labelling that
 * "estimated (carried forward...)" would be self-contradictory and would
 * understate the data — so the primary source's own name is used instead.
 */
function withCarryForward(label, detail, primaryName) {
    if (!detail) return label;

    const when = detail.oldest_observation ? `, oldest observed ${detail.oldest_observation}` : '';
    const allCarried = detail.states_carried === Object.keys(STATE_FIPS).length;
    const base = (allCarried && primaryName) ? primaryName : label;
    const scope = allCarried
        ? 'carried forward for all 51 states'
        : `carried forward for ${detail.states_carried} of 51 states`;

    return `${base} (${scope}${when})`;
}

/**
 * Describe, for the published meta block, what the Health Trends layer actually
 * did this run — not merely whether a key was present. A reader checking
 * provenance needs to know whether the boost reached the numbers.
 */
function describeTrendsSource(trends) {
    if (!trends) return 'not used';

    const coverage = Object.values(trends.coverage || {});
    if (coverage.length === 0) return 'not used';

    const applied = coverage.filter(c => c.complete).length;
    if (applied === coverage.length) return 'Google Health Trends API (boost applied, all 51 states covered)';

    // A rotation that is progressing and one that is returning nothing both sit
    // at low coverage. Only the first is "building".
    const run = trends.run || {};
    if (run.attempted === false) {
        return 'Google Health Trends API (not fetched - no API key configured; boost withheld)';
    }
    if (run.state_requests > 0 && run.state_readings === 0) {
        const since = trends.cache?.last_successful_fetch;
        return `Google Health Trends API (NOT WORKING - ${run.state_requests} requests returned no data`
            + `${since ? `, last successful fetch ${since}` : ', no successful fetch on record'}; boost withheld)`;
    }

    const best = Math.max(...coverage.map(c => c.states_covered));
    if (applied === 0) {
        return `Google Health Trends API (published but NOT applied - coverage building, best ${best}/51)`;
    }
    return `Google Health Trends API (boost applied to ${applied} of ${coverage.length} indicators; others building coverage, best ${best}/51)`;
}

/**
 * Summarise how old the *measurements* are, as distinct from how old the file is.
 *
 * These two had been conflated, with real consequences. The frontend measured
 * staleness against meta.generated, which the daily workflow restamps on every
 * run whether or not any new data arrived — so the "STALE DATA" badge at 26
 * hours and the red banner at 72 hours could never fire while the workflow was
 * healthy. Unemployment was carried forward for 23 consecutive days behind a
 * green LIVE badge because of it.
 *
 * `oldest_observation` is what the badge should key off: the date of the oldest
 * reading any published index still depends on.
 */
function summariseDataAge(meta, states) {
    const observations = [];

    if (meta.unemployment_observed) observations.push(['unemployment', meta.unemployment_observed]);

    for (const [component, detail] of Object.entries(meta.carried_forward || {})) {
        if (detail.oldest_observation) observations.push([component, detail.oldest_observation]);
    }

    // Any indicator explicitly held from a previous run
    for (const state of Object.values(states)) {
        for (const indicator of ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability']) {
            const from = state[indicator]?.carried_forward_from;
            if (from) observations.push([indicator, from]);
        }
    }

    if (observations.length === 0) return null;

    observations.sort((a, b) => a[1].localeCompare(b[1]));
    const [oldestSource, oldest] = observations[0];

    // Floor, not round: a reading taken this morning is 0 days old, not 1.
    const ageDays = Math.max(0, Math.floor((Date.now() - new Date(oldest).getTime()) / 86400000));

    return {
        oldest_observation: oldest,
        oldest_source: oldestSource,
        age_days: ageDays
    };
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
    const [liveUnemployment, housing, poverty, rentBurden, fmr] = await Promise.all([
        fetchBLSUnemployment(),
        fetchFREDHousingPrices(),
        fetchCensusPoverty(),
        fetchCensusRentBurden(),
        fetchHUDFairMarketRents()
    ]);

    // BLS unavailable → reuse the last published rates rather than letting the
    // biggest input to Financial Anxiety disappear for every state at once.
    const liveUnemploymentData = liveUnemployment?.data || null;
    const unemploymentFailure = liveUnemployment?.reason || null;
    const unemployment = liveUnemploymentData || carryForwardUnemployment();
    const unemploymentStale = !liveUnemploymentData && !!unemployment;

    // Fetch Google Trends separately (with quota protection)
    const trends = await fetchGoogleTrends();

    console.log('━'.repeat(50));

    // Calculate indices with all data sources including JCHS calibration
    console.log('🔢 Calculating composite indices...');
    const states = calculateIndices(unemployment, housing, poverty, rentBurden, fmr, jchs, trends, nlihc);
    const national = calculateNational(states);
    const carried = summariseCarryForward(states);

    // Tier estimates should never fire in normal operation now that they sit
    // below carry-forward. Count them so it is obvious when they do.
    const tierCounts = {
        rent_burden: Object.values(states).filter(st => st.metrics?.rent_burden_source === 'tier_estimate').length,
        fmr_score: Object.values(states).filter(st => st.metrics?.fmr_score_source === 'tier_estimate').length
    };
    for (const [component, count] of Object.entries(tierCounts)) {
        if (count > 0) console.warn(`  ⚠️  ${component}: ${count} states scored from a hand-assigned tier estimate`);
    }

    for (const [component, detail] of Object.entries(carried)) {
        console.log(`  ↩️  ${component}: ${JSON.stringify(detail)}`);
    }

    // Build output
    const generated = new Date().toISOString();
    const output = {
        as_of: generated.slice(0, 10),
        meta: {
            generated,
            version: '2.5',
            source: 'BLS, FRED, Census Bureau, HUD, Harvard JCHS, Google Trends APIs',
            update_frequency: 'daily',
            data_sources: {
                unemployment: liveUnemploymentData
                    ? 'BLS LAUS'
                    : (unemploymentStale
                        ? `BLS LAUS (carried forward from ${loadPreviousSnapshot()?.meta?.unemployment_observed || loadPreviousSnapshot()?.as_of || 'previous run'} — BLS ${unemploymentFailure || 'unavailable'})`
                        : `estimated — BLS ${unemploymentFailure || 'unavailable'}`),
                housing_prices: withCarryForward(housing ? 'FRED HPI' : 'estimated', carried.housing_prices, 'FRED HPI'),
                poverty: poverty ? 'Census SAIPE' : 'estimated',
                rent_burden: withCarryForward(
                    rentBurden ? 'Census ACS B25071' : (nlihc ? 'NLIHC OOR 2025 (fallback)' : (jchs ? 'Harvard JCHS 2025' : 'estimated')),
                    carried.rent_burden, 'Census ACS B25071'),
                fair_market_rent: withCarryForward(
                    fmr ? 'HUD FMR API' : (nlihc ? 'NLIHC OOR 2025 (fallback)' : (jchs ? 'Harvard JCHS 2025' : 'estimated')),
                    carried.fair_market_rent, 'HUD FMR API'),
                housing_wage: fmr ? 'Derived from HUD FMR (NLIHC formula)' : (nlihc ? 'NLIHC OOR 2025 (fallback)' : 'estimated'),
                jchs_calibration: jchs ? 'Harvard JCHS State of the Nation\'s Housing 2025' : 'not loaded',
                trends: describeTrendsSource(trends)
            },

            // Per-run coverage of the Health Trends layer. The volatility boost
            // is only added to an indicator once all 51 states have a current
            // reading, so a partial week shows complete: false and the boost is
            // published but not applied.
            // Per-component carry-forward detail, so a reader can see exactly
            // which inputs are running on a held value and how old it is.
            carried_forward: carried,

            // Observation date behind the current unemployment rates, preserved
            // across carries so staleness is measured from the BLS release.
            unemployment_observed: liveUnemploymentData
                ? generated.slice(0, 10)
                : (loadPreviousSnapshot()?.meta?.unemployment_observed || loadPreviousSnapshot()?.as_of || null),

            trends_coverage: trends?.coverage || null,
            // What the latest fetch actually retrieved, so a dead integration is
            // distinguishable from a rotation still in progress.
            trends_run: trends?.run || null,
            trends_terms: trends?.term_used || null,

            // Rotating fetch state. Republished every run so the next run knows
            // where to resume; this is what lets 51 states be covered on a
            // quota that only allows a few dozen requests per day.
            trends_cache: trends?.cache || loadPreviousSnapshot()?.meta?.trends_cache || null,

            // How many states fell through to a hand-assigned tier, and the
            // tier tables themselves. Published for the same reason as the
            // regional multipliers: an assumption that moves a state's score
            // should be inspectable, not buried in the source.
            tier_estimates: {
                note: 'Author-assigned fallback bands, not measurements. Used only when a component has no live read and nothing to carry forward. states_scored counts how many states are affected in this reading.',
                states_scored: tierCounts,
                rent_burden_tiers: RENT_BURDEN_TIERS,
                fmr_high_cost_tier: FMR_HIGH_COST_TIER
            },

            // The author-assigned regional priors, published in full so any
            // reader can divide them back out. See REGIONAL_STRESS above.
            regional_multipliers: {
                note: 'Author-assigned priors, not measured or fitted. Every index value is multiplied by the state\'s multiplier. Divide by it to recover the purely data-driven index.',
                range: [Math.min(...Object.values(REGIONAL_STRESS)), Math.max(...Object.values(REGIONAL_STRESS))],
                values: REGIONAL_STRESS
            },

            // The bounds every index is clamped to. A state at a bound is tied
            // with any other state at that bound; its rank is sort order, not data.
            index_bounds: {
                financial_anxiety: [80, 200],
                food_insecurity: [55, 160],
                housing_stress: [80, 200],
                affordability: [80, 200]
            }
        },
        national: national,
        states: states,
        timeseries: {
            national: generateTimeseries(national, trends?.nationalTimeSeries)
        }
    };



    // How old the underlying measurements are — the clock the freshness badge
    // keys off, as opposed to how recently this file was regenerated.
    output.meta.data_age = summariseDataAge(output.meta, states);
    if (output.meta.data_age) {
        console.log(`  🕐 Oldest observation in this reading: ${output.meta.data_age.oldest_observation} (${output.meta.data_age.age_days}d, ${output.meta.data_age.oldest_source})`);
    }

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
function loadPreviousTimeseries() {
    return loadPreviousSnapshot()?.timeseries?.national || null;
}

function generateTimeseries(national, nationalTrends) {
    const timeseries = {};
    const indicators = ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability'];

    const todayKey = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    const MAX_MONTHS = 120;

    // Previously published history, used as a fallback so a failed Trends
    // fetch doesn't collapse the chart to a single point.
    const previous = loadPreviousTimeseries();

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
            // No trends data available — keep the previously published
            // history and re-pin today's month to the live composite index.
            const prevPoints = (previous?.[indicator] || []).filter(p => p.date !== todayKey);
            if (prevPoints.length > 0) {
                prevPoints.push({ date: todayKey, value: Math.round(baseValue) });
                prevPoints.sort((a, b) => a.date.localeCompare(b.date));
                timeseries[indicator] = prevPoints.slice(-MAX_MONTHS);
            } else {
                timeseries[indicator] = [{ date: todayKey, value: Math.round(baseValue) }];
            }
        }
    }

    return timeseries;
}

// Exported for tests; only auto-runs when invoked directly.
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    __setPreviousSnapshot,
    calculateIndices,
    calculateNational,
    trendsBoostFor,
    clampIndex,
    deriveHousingWage,
    summariseTrends,
    REGIONAL_STRESS
};
