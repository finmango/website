/**
 * Augment data/dashboard-data.js and data/latest.json with the top-level
 * housing fields the Housing Policy Lab reads from DASHBOARD_DATA:
 *
 *   states['US-XX'].rent_burden  = { value, source }
 *   states['US-XX'].fmr_2br      = { value, source }
 *   states['US-XX'].housing_wage = { value, source }
 *
 * Priority:
 *   1. Live values already present at state.rent_burden / state.fmr_2br /
 *      state.housing_wage (future-proof: the main pipeline writes these when
 *      live Census / HUD APIs are available).
 *   2. Raw values from state.metrics.rent_burden_pct / .fair_market_rent_2br
 *      (populated by scripts/fetch-real-data.js from Census B25071 + HUD FMR).
 *   3. NLIHC Out of Reach 2025 fallback in data/nlihc-oor-2025-fallback.json.
 *
 * housing_wage is derived from fmr_2br whenever FMR is available so the two
 * figures stay internally consistent:
 *
 *     housing_wage = (fmr_2br * 12) / (2080 * 0.30)
 *
 * which is exactly NLIHC's Housing Wage definition.
 *
 * This script is idempotent: running it twice on the same input produces the
 * same output.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const JS_PATH = path.join(DATA_DIR, 'dashboard-data.js');
const JSON_PATH = path.join(DATA_DIR, 'latest.json');
const NLIHC_PATH = path.join(DATA_DIR, 'nlihc-oor-2025-fallback.json');

function loadDashboardJSON() {
    const js = fs.readFileSync(JS_PATH, 'utf8');
    const start = js.indexOf('{');
    const end = js.lastIndexOf('};');
    if (start < 0 || end < 0) {
        throw new Error('Could not locate DASHBOARD_DATA object literal in dashboard-data.js');
    }
    return JSON.parse(js.slice(start, end + 1));
}

function writeDashboardJSON(obj) {
    const jsContent = `// Financial Health Barometer Data
// Auto-generated: ${new Date().toISOString()}
// Sources: ${obj.meta?.source || 'BLS, FRED, Census Bureau, HUD, Harvard JCHS, Google Trends APIs'}

const DASHBOARD_DATA = ${JSON.stringify(obj, null, 2)};

if (typeof window !== 'undefined') window.DASHBOARD_DATA = DASHBOARD_DATA;
if (typeof module !== 'undefined') module.exports = DASHBOARD_DATA;
`;
    fs.writeFileSync(JS_PATH, jsContent);
    fs.writeFileSync(JSON_PATH, JSON.stringify(obj, null, 2));
}

function deriveHousingWage(fmr2br) {
    if (!fmr2br || fmr2br <= 0) return null;
    return Math.round((fmr2br * 12) / (2080 * 0.30) * 100) / 100;
}

function readValue(field) {
    if (field == null) return null;
    if (typeof field === 'number') return field;
    if (typeof field === 'object' && typeof field.value === 'number') return field.value;
    return null;
}

function augment() {
    const data = loadDashboardJSON();
    const nlihc = JSON.parse(fs.readFileSync(NLIHC_PATH, 'utf8'));

    if (!data.states) throw new Error('dashboard-data.js has no states block');

    let counts = { rent_burden: 0, fmr_2br: 0, housing_wage: 0 };
    let totalStates = 0;

    for (const [stateKey, state] of Object.entries(data.states)) {
        totalStates++;
        const abbr = state.abbr || stateKey.replace(/^US-/, '');
        const nlihcState = nlihc.states[abbr];
        const metrics = state.metrics || {};

        // rent_burden: prefer any existing top-level field, then metrics, then NLIHC
        const liveRB = readValue(state.rent_burden);
        const metricRB = typeof metrics.rent_burden_pct === 'number' ? metrics.rent_burden_pct : null;
        let rbValue = liveRB;
        let rbSource = state.rent_burden?.source || null;
        if (rbValue === null && metricRB !== null && metrics.rent_burden_source === 'census_acs') {
            rbValue = metricRB;
            rbSource = 'ACS B25071';
        }
        if (rbValue === null && nlihcState) {
            rbValue = nlihcState.rent_burden;
            rbSource = 'NLIHC OOR 2025 (fallback)';
        }
        if (rbValue !== null) {
            state.rent_burden = { value: rbValue, source: rbSource };
            counts.rent_burden++;
        }

        // fmr_2br: prefer any existing top-level, then HUD-sourced metrics, then NLIHC
        const liveFMR = readValue(state.fmr_2br);
        const metricFMR = typeof metrics.fair_market_rent_2br === 'number' ? metrics.fair_market_rent_2br : null;
        let fmrValue = liveFMR;
        let fmrSource = state.fmr_2br?.source || null;
        if (fmrValue === null && metricFMR !== null && metrics.fmr_source === 'hud_fmr') {
            fmrValue = metricFMR;
            fmrSource = 'HUD FY2025';
        }
        if (fmrValue === null && nlihcState) {
            fmrValue = nlihcState.fmr_2br;
            fmrSource = 'NLIHC OOR 2025 (fallback)';
        }
        if (fmrValue !== null) {
            state.fmr_2br = { value: fmrValue, source: fmrSource };
            counts.fmr_2br++;
        }

        // housing_wage: derive from FMR to stay consistent with it
        const liveWage = readValue(state.housing_wage);
        let wageValue = liveWage;
        let wageSource = state.housing_wage?.source || null;
        if (wageValue === null && fmrValue !== null) {
            wageValue = deriveHousingWage(fmrValue);
            wageSource = fmrSource && fmrSource.startsWith('HUD')
                ? 'Derived from HUD FMR (NLIHC formula)'
                : 'NLIHC OOR 2025 (fallback)';
        }
        if (wageValue === null && nlihcState) {
            wageValue = nlihcState.housing_wage;
            wageSource = 'NLIHC OOR 2025 (fallback)';
        }
        if (wageValue !== null) {
            state.housing_wage = { value: wageValue, source: wageSource };
            counts.housing_wage++;
        }
    }

    // Record that these fields are now surfaced
    data.meta = data.meta || {};
    data.meta.data_sources = data.meta.data_sources || {};
    if (!data.meta.data_sources.housing_wage) {
        data.meta.data_sources.housing_wage = 'Derived from HUD FMR (NLIHC formula)';
    }
    data.meta.augmented_at = new Date().toISOString();

    writeDashboardJSON(data);

    console.log('Augmented', totalStates, 'states:',
        `rent_burden=${counts.rent_burden}`,
        `fmr_2br=${counts.fmr_2br}`,
        `housing_wage=${counts.housing_wage}`);
}

augment();
