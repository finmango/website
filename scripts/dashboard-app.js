/**
 * FinMango Research Dashboard Logic
 * Handles map interaction, data visualization, animations, and UI updates
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- State Management ---
    const APP_STATE = {
        currentIndicator: 'financial_anxiety',
        currentPeriod: '12m',
        chartInstance: null,
        mapData: null,
        currentState: null,  // US-XX while the state panel is open, else null
        sortKey: 'financial_anxiety', // rankings table sort column
        sortDir: 'desc'               // 'desc' = most stressed first
    };

    // --- DOM Elements ---
    const els = {
        lastUpdated: document.getElementById('last-updated-date'),
        liveIndicator: document.getElementById('live-indicator'),
        staleDataBanner: document.getElementById('stale-data-banner'),
        indicatorCards: document.querySelectorAll('.indicator-card'),
        valAnxiety: document.getElementById('val-financial_anxiety'),
        changeAnxiety: document.getElementById('change-financial_anxiety'),
        valFood: document.getElementById('val-food_insecurity'),
        changeFood: document.getElementById('change-food_insecurity'),
        valHousing: document.getElementById('val-housing_stress'),
        changeHousing: document.getElementById('change-housing_stress'),
        valAfford: document.getElementById('val-affordability'),
        changeAfford: document.getElementById('change-affordability'),
        usMap: document.getElementById('us-map'),
        tooltip: document.getElementById('state-tooltip'),
        panelOverlay: document.getElementById('panel-overlay'),
        statePanel: document.getElementById('state-panel'),
        panelClose: document.getElementById('panel-close'),
        panelStateName: document.getElementById('panel-state-name'),
        panelIndicators: document.getElementById('panel-indicators'),
        chartCanvas: document.getElementById('trend-chart'),
        chartIndicatorSelect: document.getElementById('chart-indicator'),
        chartPeriodSelect: document.getElementById('chart-period'),
        rankingsBody: document.getElementById('rankings-body'),
        rankingsTable: document.getElementById('rankings-table'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        pageStart: document.getElementById('page-start'),
        pageEnd: document.getElementById('page-end'),
        downloadCsv: document.getElementById('download-csv'),
        downloadJson: document.getElementById('download-json'),
        copyCitation: document.getElementById('copy-citation'),
        // Share / embed (all optional — guarded at every use site)
        shareCopyLink: document.getElementById('share-copy-link'),
        shareDownloadCard: document.getElementById('share-download-card'),
        shareX: document.getElementById('share-x'),
        shareLinkedin: document.getElementById('share-linkedin'),
        embedBtn: document.getElementById('embed-widget'),
        embedModal: document.getElementById('embed-modal'),
        embedClose: document.getElementById('embed-close'),
        embedScope: document.getElementById('embed-scope'),
        embedIndicator: document.getElementById('embed-indicator'),
        embedTheme: document.getElementById('embed-theme'),
        embedPreview: document.getElementById('embed-preview'),
        embedCode: document.getElementById('embed-code'),
        embedCopy: document.getElementById('embed-copy'),
        embedOpen: document.getElementById('embed-open')
    };

    const INDICATOR_META = [
        { key: 'financial_anxiety', label: 'Financial Anxiety' },
        { key: 'food_insecurity', label: 'Food Insecurity' },
        { key: 'housing_stress', label: 'Housing Stress' },
        { key: 'affordability', label: 'Affordability' }
    ];

    // --- Initialization ---
    async function init() {
        // Load Map SVG
        await loadMapSVG();

        // Check if data is loaded
        if (typeof DASHBOARD_DATA === 'undefined') {
            console.error('DASHBOARD_DATA not loaded');
            return;
        }

        // Initialize each component independently so a single failure
        // (e.g. Chart.js CDN down) doesn't take down the whole dashboard.
        const steps = [
            ['updateHeader', updateHeader],
            ['updateIndicatorCards', updateIndicatorCards],
            ['initMapInteraction', initMapInteraction],
            ['initChart', initChart],
            ['initRankings', initRankings],
            ['setupEventListeners', setupEventListeners],
            ['updateMapView', () => updateMapView(APP_STATE.currentIndicator)],
            ['updateRankingsTable', () => setSort(APP_STATE.currentIndicator, 'desc')],
            ['initEmbedBuilder', initEmbedBuilder],
            ['renderProvenance', renderProvenance],
            ['renderMethodologyStats', renderMethodologyStats],
            ['openStateFromUrl', openStateFromUrl]
        ];

        for (const [name, fn] of steps) {
            try {
                fn();
            } catch (err) {
                console.error(`[init] ${name} failed:`, err);
            }
        }

        console.log('Dashboard initialized successfully');
    }

    // --- Data & Helpers ---
    function formatValue(val) {
        // Indicators publish null when no value could be computed or carried
        // forward. Rendering that as "NaN" or crashing the card is worse than
        // saying nothing is available.
        if (typeof val !== 'number' || !isFinite(val)) return '--';
        return val.toFixed(1);
    }

    // Render a period-over-period change.
    //
    // Three distinct states, which this used to collapse into one. An indicator
    // with no change series at all (Food Insecurity and Affordability have
    // none — SAIPE poverty is annual, and Affordability is a restatement of the
    // other two) publishes change: null. That was previously stored as a
    // hardcoded 0 and rendered here as a red "▲ 0.0%", telling every reader
    // that food insecurity was rising when no change had been measured.
    //
    //   null  -> "no change data", with the reason on hover
    //   ~0    -> flat, neutral
    //   +/-   -> up (red) or down (green)
    function formatChange(val, basis) {
        if (typeof val !== 'number' || !isFinite(val)) {
            const title = basis ? ` title="${String(basis).replace(/"/g, '&quot;')}"` : '';
            return `<span class="change-none"${title}>no change data</span>`;
        }

        if (Math.abs(val) < 0.05) {
            return `<span class="flat" title="No measurable change since the last reading"> — 0.0%</span>`;
        }

        const sign = val > 0 ? '▲' : '▼';
        const cssClass = val > 0 ? 'up' : 'down'; // Red = rising stress
        // The percentage is a change in the underlying measurement (e.g. the
        // year-over-year unemployment rate), not in the index itself. Say so
        // on hover rather than letting it read as index movement.
        const title = basis ? ` title="Change in ${String(basis).replace(/"/g, '&quot;')}"` : '';
        return `<span class="${cssClass}"${title}> ${sign} ${Math.abs(val).toFixed(1)}%</span>`;
    }

    // Colour for a value that may be missing: null/NaN get a neutral grey so a
    // state with no reading is not painted as "Low".
    const NO_DATA_COLOR = 'rgba(250, 250, 247, .12)';
    function colorOrNoData(value, indicator) {
        return (typeof value === 'number' && isFinite(value))
            ? getColorForValue(value, indicator)
            : NO_DATA_COLOR;
    }

    // Severity ramp. Standardized scale, matches the map legend & methodology:
    //   < 90      Low
    //   90 - 120  Moderate
    //   120 - 150 Elevated
    //   > 150     High
    //
    // Two ramps, because the ramp has to be read against its ground. The old
    // single set (#10B981 / #F59E0B / #F97316 / #EF4444) put three adjacent
    // oranges next to each other — 1.18, 1.31 and 1.34:1 between neighbours,
    // i.e. indistinguishable — so a choropleth painted with it read as one
    // flat blob regardless of the data.
    //
    // ON INK (everything on screen: the map, the indicator cards, the state
    // panel, the rankings bars). Steps through hue with 2.00 / 1.82 / 2.13:1
    // between neighbours and 4:1 or better against #0A0A0A.
    // Keep in sync with .legend-* and .indicator-card.severity-* in
    // barometer.html, and with getColor() in index.html.
    function getColorForValue(value, indicator) {
        if (value < 90) return '#14B8A6';  // teal
        if (value < 120) return '#FDE68A'; // pale amber
        if (value < 150) return '#FB923C'; // orange
        return '#DC2626';                  // red
    }

    // ON PAPER (the downloadable share card, drawn on #FAFAF7). The ink ramp
    // cannot be reused here: #FDE68A against paper is 1.19:1, so a Moderate
    // bar would be invisible on the card. This one darkens monotonically as
    // severity rises — 2.94 / 4.71 / 6.99 / 10.85:1 against paper, with 1.48:1
    // or better between neighbours.
    function getColorForValueOnPaper(value, indicator) {
        if (value < 90) return '#12A594';  // teal
        if (value < 120) return '#A16207'; // dark amber
        if (value < 150) return '#9A3412'; // dark orange
        return '#701A1A';                  // deep red
    }

    // --- Provenance: what this reading actually used ---
    //
    // The methodology section lists the sources the Barometer is *designed*
    // around. This renders what each source actually returned for the current
    // reading, straight out of meta.data_sources, so a fallback or a carried
    // forward value is visible on the page rather than only in the JSON.
    function renderProvenance() {
        const host = document.getElementById('provenance-table');
        if (!host) return;

        const sources = DASHBOARD_DATA.meta?.data_sources;
        if (!sources) {
            host.innerHTML = '<p>Provenance metadata is unavailable for this reading.</p>';
            return;
        }

        const LABELS = {
            unemployment: 'Unemployment rate',
            housing_prices: 'House price index',
            poverty: 'Poverty rate',
            rent_burden: 'Rent burden',
            fair_market_rent: 'Fair market rent (published $ figure)',
            housing_wage: 'Housing wage (published figure)',
            jchs_calibration: 'Housing cost burden calibration',
            trends: 'Search trends'
        };

        // Anything that is not a clean primary read gets flagged, so a reader
        // scanning the table sees degraded inputs without parsing the text.
        function statusOf(value) {
            const v = String(value).toLowerCase();
            // Check the failure strings before the generic ones: a dead
            // integration reported "NOT WORKING" was falling through every
            // branch and rendering as a green "Primary source".
            if (v.includes('not working')) return ['estimated', 'Not working'];
            // A term omitted from the composite is missing, not measured.
            if (v.includes('omitted') || v.startsWith('unavailable')) return ['estimated', 'Term omitted'];
            if (v.includes('no api key')) return ['unused', 'No API key'];
            if (v.includes('not applied') || v.includes('withheld')) return ['carried', 'Published, not applied'];
            if (v.includes('not loaded') || v.includes('not used') || v.includes('not fetched')) return ['unused', 'Not used'];
            if (v.includes('estimated')) return ['estimated', 'Estimated'];
            if (v.includes('carried forward for all')) return ['carried', 'Held (all states)'];
            if (v.includes('carried forward')) return ['carried', 'Carried forward'];
            if (v.includes('fallback')) return ['fallback', 'Fallback source'];
            return ['live', 'Primary source'];
        }

        const rows = Object.entries(sources).map(([key, value]) => {
            const [cls, label] = statusOf(value);
            const name = LABELS[key] || key.replace(/_/g, ' ');
            return `<tr>
                <td><strong>${name}</strong></td>
                <td>${String(value)}</td>
                <td><span class="prov-badge prov-${cls}">${label}</span></td>
            </tr>`;
        }).join('');

        host.innerHTML = `<table class="data-dictionary">
            <thead><tr><th>Input</th><th>What answered for this reading</th><th>Status</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>`;

        renderIndexTerms();
        renderTrendsCoverage();
        renderPartialWarning();
    }

    // Which source actually fed each *term of the index*, counted across the
    // 51 states from their own metrics. This can differ from the run-level
    // table above: the published fair-market-rent dollar figure may come from
    // one source while the FMR term inside Housing Stress was scored from
    // another, and a reader deciding whether to cite the index needs the
    // latter.
    function renderIndexTerms() {
        const host = document.getElementById('provenance-terms');
        if (!host) return;

        const states = Object.values(DASHBOARD_DATA.states || {});
        if (states.length === 0) { host.innerHTML = ''; return; }

        const SOURCE_NAMES = {
            census_acs: 'Census ACS B25071 (live)',
            census_acs_carried_forward: 'Census ACS B25071 (carried forward)',
            jchs_calibrated: 'Harvard JCHS 2025 calibration (fallback)',
            hud_fmr: 'HUD FMR API (live)',
            hud_fmr_carried_forward: 'HUD FMR API (carried forward)',
            jchs_2025: 'Harvard JCHS 2025 median rent vs a $1,200 national median (fallback)',
            tier_estimate: 'Hand-assigned tier estimate',
            default: 'No source — term scored 0'
        };
        const describe = key => SOURCE_NAMES[key] || (key ? String(key).replace(/_/g, ' ') : 'not recorded');

        function tally(pick) {
            const counts = {};
            states.forEach(st => {
                const k = pick(st.metrics || {});
                const key = (k === null || k === undefined || k === '') ? 'default' : String(k);
                counts[key] = (counts[key] || 0) + 1;
            });
            return Object.entries(counts).sort((a, b) => b[1] - a[1]);
        }

        function statusFor(key) {
            const k = String(key).toLowerCase();
            if (k === 'default') return ['estimated', 'Term omitted'];
            if (k.includes('tier')) return ['estimated', 'Estimated'];
            if (k.includes('carried')) return ['carried', 'Carried forward'];
            if (k.includes('jchs') || k.includes('fallback') || k.includes('nlihc')) return ['fallback', 'Fallback source'];
            return ['live', 'Primary source'];
        }

        function rowsFor(label, entries, formatter) {
            return entries.map(([key, n], i) => {
                const [cls, status] = statusFor(key);
                return `<tr>
                    ${i === 0 ? `<td rowspan="${entries.length}"><strong>${label}</strong></td>` : ''}
                    <td>${formatter ? formatter(key) : describe(key)} · ${n} state${n === 1 ? '' : 's'}</td>
                    <td><span class="prov-badge prov-${cls}">${status}</span></td>
                </tr>`;
            }).join('');
        }

        const periods = tally(m => m.unemployment_period);
        const rows =
            rowsFor('Unemployment term (Financial Anxiety)', periods,
                key => key === 'default' ? 'No period recorded' : `BLS LAUS, reference month ${key}`) +
            rowsFor('Rent-burden term (Housing Stress)', tally(m => m.rent_burden_source)) +
            rowsFor('Fair-market-rent term (Housing Stress)', tally(m => m.fmr_score_source)) +
            rowsFor('House-price term (Housing Stress)', tally(m => m.housing_price_change_source),
                key => key === 'default' ? 'No source — term omitted' : String(key).replace(/_/g, ' '));

        host.innerHTML = `<p class="provenance-note" style="margin-top:1.25rem">
                <strong>Which source fed each term of the index,</strong> counted state by state from the
                published metrics. A published dollar figure above and the term the index was actually
                scored from can come from different sources; this table is the one that describes the
                numbers on the map.</p>
            <table class="data-dictionary">
                <thead><tr><th>Index term</th><th>Source used</th><th>Status</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>`;
    }

    // --- Methodology figures that depend on the data ----------------------
    //
    // The "Scaling & Regional Adjustment" section quantifies how much the
    // hand-assigned multipliers move the rankings. Those figures drift as the
    // government inputs change, and a hardcoded "Mississippi moves 24 places"
    // was already three places out of date. Recompute them from the published
    // file so the page describes the reading it is showing; the static text
    // stays as the no-JS fallback.
    function renderMethodologyStats() {
        const states = Object.values(DASHBOARD_DATA.states || {});
        if (states.length === 0) return;

        const set = (name, text) => {
            document.querySelectorAll(`[data-stat="${name}"]`).forEach(el => { el.textContent = text; });
        };
        const num = v => (typeof v === 'number' && isFinite(v)) ? v : null;

        // Rank churn from removing the multiplier (Financial Anxiety, the
        // indicator the methodology text quotes).
        const withMult = states
            .map(st => ({ st, value: num(st.financial_anxiety?.value), mult: num(st.metrics?.regional_stress_multiplier) }))
            .filter(r => r.value !== null && r.mult);
        if (withMult.length > 2) {
            const byAdj = [...withMult].sort((a, b) => b.value - a.value);
            const byRaw = [...withMult].sort((a, b) => (b.value / b.mult) - (a.value / a.mult));
            const rankAdj = new Map(byAdj.map((r, i) => [r.st.abbr, i + 1]));
            const rankRaw = new Map(byRaw.map((r, i) => [r.st.abbr, i + 1]));
            let changed = 0, biggest = null;
            withMult.forEach(r => {
                const move = Math.abs(rankAdj.get(r.st.abbr) - rankRaw.get(r.st.abbr));
                if (move > 0) changed++;
                if (!biggest || move > biggest.move) biggest = { name: r.st.name, move };
            });
            set('ranks-changed', String(changed));
            if (biggest) {
                set('biggest-mover', biggest.move === 0
                    ? 'No state would move'
                    : `${biggest.name} would move ${biggest.move} place${biggest.move === 1 ? '' : 's'}`);
            }

            const mults = withMult.map(r => r.mult);
            set('mult-span', String(Math.round((Math.max(...mults) - Math.min(...mults)) * 120)));
        }

        // Spread of the actual unemployment inputs, on the index's own scale
        // (18 points per percentage point).
        const unemp = states.map(st => num(st.metrics?.unemployment_rate)).filter(v => v !== null);
        if (unemp.length > 1) {
            set('unemp-span', String(Math.round((Math.max(...unemp) - Math.min(...unemp)) * 18)));
        }

        // Affordability's correlation with Housing Stress.
        const pairs = states
            .map(st => [num(st.housing_stress?.value), num(st.affordability?.value)])
            .filter(([h, a]) => h !== null && a !== null);
        if (pairs.length > 2) {
            const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
            const hs = pairs.map(p => p[0]), as = pairs.map(p => p[1]);
            const mh = mean(hs), ma = mean(as);
            let cov = 0, vh = 0, va = 0;
            pairs.forEach(([h, a]) => { cov += (h - mh) * (a - ma); vh += (h - mh) ** 2; va += (a - ma) ** 2; });
            if (vh > 0 && va > 0) set('afford-r', (cov / Math.sqrt(vh * va)).toFixed(2));
        }

        // Average size of the house-price term (change % x 2).
        const hpi = states.map(st => num(st.metrics?.housing_price_change)).filter(v => v !== null);
        if (hpi.length > 0) {
            set('hpi-term', String(Math.round(hpi.reduce((a, b) => a + b * 2, 0) / hpi.length)));
        }

        // Tier estimates actually used in this reading.
        const scored = DASHBOARD_DATA.meta?.tier_estimates?.states_scored;
        if (scored && typeof scored === 'object') {
            const rb = num(scored.rent_burden) || 0, fm = num(scored.fmr_score) || 0;
            const plural = n => `${n} state${n === 1 ? '' : 's'}`;
            set('tier-count', (rb === 0 && fm === 0)
                ? 'In the current reading, no state is scored from a tier.'
                : `In the current reading, ${plural(rb)} take the rent-burden term and ${plural(fm)} take the fair-market-rent term from a tier.`);
        }
    }

    // A state whose composite lost a term is not comparable with states that
    // still have all four, so it gets said out loud rather than left to be
    // inferred from a field in the JSON.
    function renderPartialWarning() {
        const el = document.getElementById('provenance-partial');
        if (!el) return;

        const partial = Object.values(DASHBOARD_DATA.states || {})
            .filter(st => st.housing_stress && st.housing_stress.partial)
            .map(st => st.abbr);

        if (partial.length === 0) {
            el.style.display = 'none';
            return;
        }

        el.style.display = 'block';
        el.innerHTML = `<strong>Incomplete indices:</strong> Housing Stress for
            ${partial.length} state${partial.length === 1 ? '' : 's'}
            (${partial.join(', ')}) is missing its house-price term, which could not be
            sourced or carried forward. Those scores omit a component the other states
            include, so they are not directly comparable and will read lower than they
            should. They are flagged <code>partial</code> in the data.`;
    }

    // Coverage of the rotating Health Trends fetch. The boost only reaches the
    // published index once all 51 states have a current reading, so readers
    // need to know which state the rotation is in.
    function renderTrendsCoverage() {
        const el = document.getElementById('provenance-trends');
        if (!el) return;

        const coverage = DASHBOARD_DATA.meta?.trends_coverage;
        if (!coverage) {
            el.textContent = '';
            return;
        }

        const entries = Object.entries(coverage);
        const complete = entries.filter(([, c]) => c.complete).length;
        const lowest = Math.min(...entries.map(([, c]) => c.states_covered));
        const highest = Math.max(...entries.map(([, c]) => c.states_covered));
        const total = entries[0]?.[1]?.states_total || 51;

        if (complete === entries.length) {
            el.innerHTML = `<strong>Search trends coverage:</strong> all ${total} states current across
                all four indicators, so the volatility boost is included in the published index.`;
            return;
        }

        // A rotation still working its way round and one that is returning
        // nothing both sit at low coverage; only the first is progress.
        const run = DASHBOARD_DATA.meta?.trends_run;
        if (run && run.attempted === false) {
            el.innerHTML = `<strong>Search trends not configured:</strong> no Health Trends API key is
                set for the pipeline, so no search data was requested. The volatility boost is withheld
                and the indices shown are built from the official government series alone.`;
            return;
        }
        if (run && run.state_requests > 0 && run.state_readings === 0) {
            const since = DASHBOARD_DATA.meta?.trends_cache?.last_successful_fetch;
            el.innerHTML = `<strong>Search trends unavailable:</strong> the Health Trends API returned no
                data for any state in the latest run${since ? `, and none since ${since}` : ''}. The
                volatility boost is withheld entirely, so the indices shown are built from the official
                government series alone. Nothing is estimated to cover the gap.`;
            return;
        }

        const span = lowest === highest ? `${lowest}` : `${lowest}\u2013${highest}`;
        el.innerHTML = `<strong>Search trends coverage:</strong> ${span} of ${total} states have a
            current reading. The Health Trends quota is too small to poll every state daily, so the
            fetch rotates and completes roughly weekly. Until coverage is complete the volatility
            boost is <strong>published but not added to the index</strong>, so no state is ranked
            higher simply because the rotation reached it first.`;
    }

    // --- Data Freshness Check ---
    //
    // Two different clocks, previously conflated into one:
    //
    //   meta.generated  — when this file was last written. The daily workflow
    //                     restamps it on every run, so it says nothing about
    //                     whether new data actually arrived.
    //   meta.data_age   — how old the oldest measurement any published index
    //                     still depends on actually is.
    //
    // Keying the badge off meta.generated meant the STALE warning could never
    // fire while the workflow was healthy: unemployment was carried forward for
    // 23 consecutive days behind a green LIVE badge. The measurement clock is
    // the one that matters to a reader, so it drives the badge; the file clock
    // is only a backstop for a pipeline that has stopped running entirely.
    function checkDataFreshness() {
        const fileAgeHours = DASHBOARD_DATA.meta?.generated
            ? (Date.now() - new Date(DASHBOARD_DATA.meta.generated).getTime()) / 3600000
            : null;

        const dataAge = DASHBOARD_DATA.meta?.data_age;
        const dataAgeDays = typeof dataAge?.age_days === 'number' ? dataAge.age_days : null;

        if (fileAgeHours === null && dataAgeDays === null) {
            console.warn('[Freshness] No freshness metadata in DASHBOARD_DATA.meta');
            return;
        }

        console.log(`[Freshness] File age: ${fileAgeHours === null ? 'unknown' : fileAgeHours.toFixed(1) + 'h'}; ` +
            `oldest measurement: ${dataAgeDays === null ? 'unknown' : dataAgeDays + 'd'}`);

        // The pipeline itself has stopped: nothing is being refreshed at all.
        if (fileAgeHours !== null && fileAgeHours > 72) {
            const dateStr = new Date(DASHBOARD_DATA.meta.generated)
                .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            showBanner(`⚠️ The data pipeline has not run since ${dateStr}. These figures may be well out of date.`);
            setBadge('⚠ PIPELINE STALLED');
            return;
        }

        // The pipeline is running, but the measurements behind it are not moving.
        // 14 days is the threshold: the fastest-moving input (BLS LAUS) is
        // monthly, so a fortnight without a fresh read means a release was
        // likely missed rather than merely not due yet.
        if (dataAgeDays !== null && dataAgeDays >= 14) {
            showBanner(`⚠️ Underlying data has not refreshed since ${dataAge.oldest_observation} ` +
                `(${dataAgeDays} days). The ${labelForSource(dataAge.oldest_source)} figures are being ` +
                `held at their last published values, not re-measured.`);
            setBadge(`⚠ DATA ${dataAgeDays}D OLD`);
            return;
        }

        if (dataAgeDays !== null && dataAgeDays >= 2) {
            setBadge(`HELD · ${dataAgeDays}D`, 'held');
            return;
        }

        if (fileAgeHours !== null && fileAgeHours > 26) {
            setBadge('⚠ STALE DATA');
        }
    }

    function labelForSource(key) {
        const LABELS = {
            unemployment: 'unemployment',
            housing_prices: 'house price',
            rent_burden: 'rent burden',
            fair_market_rent: 'fair market rent',
            financial_anxiety: 'Financial Anxiety',
            food_insecurity: 'Food Insecurity',
            housing_stress: 'Housing Stress',
            affordability: 'Affordability'
        };
        return LABELS[key] || String(key).replace(/_/g, ' ');
    }

    function showBanner(text) {
        if (!els.staleDataBanner) return;
        els.staleDataBanner.textContent = text;
        els.staleDataBanner.style.display = 'block';
        console.error(`[Freshness] ${text}`);
    }

    function setBadge(text, tone) {
        if (!els.liveIndicator) return;
        els.liveIndicator.innerHTML = text;
        els.liveIndicator.style.cssText = tone === 'held'
            ? 'color:#92400E; background:#FEF3C7; border:1px solid #FCD34D; border-radius:4px; padding:2px 8px; font-weight:600; font-size:0.8rem;'
            : 'color:#92400E; background:#FEF3C7; border:1px solid #F59E0B; border-radius:4px; padding:2px 8px; font-weight:600; font-size:0.8rem;';
    }

    // --- Header & Top Stats ---
    function updateHeader() {
        if (!DASHBOARD_DATA.meta) return;
        const date = new Date(DASHBOARD_DATA.meta.generated);
        els.lastUpdated.textContent = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        checkDataFreshness();
    }

    function getSeverityClass(value) {
        if (value < 90) return 'severity-low';
        if (value < 120) return 'severity-moderate';
        if (value < 150) return 'severity-elevated';
        return 'severity-high';
    }

    function applyCardSeverity() {
        const national = DASHBOARD_DATA.national;
        const indicators = ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability'];
        indicators.forEach(indicator => {
            const card = document.querySelector(`.indicator-card[data-indicator="${indicator}"]`);
            if (!card) return;
            card.classList.remove('severity-low', 'severity-moderate', 'severity-elevated', 'severity-high');
            card.classList.add(getSeverityClass(national[indicator].value));
        });
    }

    // The national object carries no change_basis of its own; every state
    // does, and it is the same series for all of them, so borrow the first.
    function nationalChangeBasis(indicator) {
        const national = DASHBOARD_DATA.national[indicator] || {};
        if (national.change_basis) return national.change_basis;
        const st = Object.values(DASHBOARD_DATA.states || {}).find(s => s[indicator]?.change_basis);
        return st ? st[indicator].change_basis : undefined;
    }

    function updateIndicatorCards() {
        const national = DASHBOARD_DATA.national;

        els.valAnxiety.textContent = formatValue(national.financial_anxiety.value);
        els.changeAnxiety.innerHTML = formatChange(national.financial_anxiety.change, nationalChangeBasis('financial_anxiety'));

        els.valFood.textContent = formatValue(national.food_insecurity.value);
        els.changeFood.innerHTML = formatChange(national.food_insecurity.change, nationalChangeBasis('food_insecurity'));

        els.valHousing.textContent = formatValue(national.housing_stress.value);
        els.changeHousing.innerHTML = formatChange(national.housing_stress.change, nationalChangeBasis('housing_stress'));

        els.valAfford.textContent = formatValue(national.affordability.value);
        els.changeAfford.innerHTML = formatChange(national.affordability.change, nationalChangeBasis('affordability'));

        // Apply severity border classes
        applyCardSeverity();

        // Render sparklines
        renderSparklines();
    }

    // A national history is only drawn when it looks like a measurement:
    // enough months, not pinned to its floor for long stretches (months stuck
    // at the minimum, zero included, are missing search data rather than calm),
    // and more than a handful of distinct levels. A history that fails this is
    // replaced by a note instead of a line that would read as a real trend.
    function isUsableHistory(points) {
        if (!points || points.length < 12) return false;
        const values = points.map(p => Number(p.value));
        const floor = Math.min(...values);
        const atFloor = values.filter(v => v === floor).length;
        return atFloor / values.length < 0.2 && new Set(values).size >= 5;
    }

    // --- Sparklines ---
    function renderSparklines() {
        const indicators = ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability'];
        indicators.forEach(indicator => {
            const container = document.getElementById('spark-' + indicator);
            if (!container) return;

            const rawPoints = (DASHBOARD_DATA.timeseries && DASHBOARD_DATA.timeseries.national && DASHBOARD_DATA.timeseries.national[indicator]) || [];
            if (!isUsableHistory(rawPoints)) {
                container.innerHTML = '<span class="spark-note">History under review</span>';
                return;
            }
            // Use last 12 points for sparkline
            const points = rawPoints.slice(-12);
            if (points.length < 2) return;

            const values = points.map(p => p.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min || 1;

            const w = 120;
            const h = 28;
            const padding = 1;

            const coords = values.map((v, i) => {
                const x = padding + (i / (values.length - 1)) * (w - padding * 2);
                const y = h - padding - ((v - min) / range) * (h - padding * 2);
                return `${x},${y}`;
            });

            const card = container.closest('.indicator-card');
            const isActive = card && card.classList.contains('active');
            const strokeColor = isActive ? 'rgba(255,255,255,0.8)' : 'var(--orange)';

            container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
                <polyline points="${coords.join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
        });
    }

    // --- Map Implementation ---
    async function loadMapSVG() {
        // Try multiple loading methods to handle both http:// and file:// protocols
        let svgText = null;

        // Method 0: Check for inlined content (Fix for local file:// & legacy browsers)
        if (typeof MAP_SVG_CONTENT !== 'undefined') {
            svgText = MAP_SVG_CONTENT;
        }

        // Method 1: Try fetch (works on http/https)
        if (!svgText) {
            try {
                const response = await fetch('us-map-v2.svg');
                if (response.ok) {
                    svgText = await response.text();
                }
            } catch (e) {
                console.log('Fetch failed, trying XMLHttpRequest...');
            }
        }

        // Method 2: Try XMLHttpRequest (sometimes works on file://)
        if (!svgText) {
            try {
                svgText = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', 'us-map-v2.svg', true);
                    xhr.onload = () => {
                        if (xhr.status === 200 || xhr.status === 0) { // status 0 for file://
                            resolve(xhr.responseText);
                        } else {
                            reject(new Error('XHR failed'));
                        }
                    };
                    xhr.onerror = () => reject(new Error('XHR error'));
                    xhr.send();
                });
            } catch (e) {
                console.log('XMLHttpRequest also failed:', e);
            }
        }

        // If we got the SVG, inject it
        if (svgText && svgText.includes('<svg')) {
            // Extract just the inner content if it's a full SVG
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgEl = svgDoc.querySelector('svg');

            if (svgEl) {
                // Copy all child nodes into our container SVG
                els.usMap.innerHTML = svgEl.innerHTML;

                // The SVG uses data-id="XX" format, we need to add id="US-XX" for our data lookup
                els.usMap.querySelectorAll('path[data-id]').forEach(path => {
                    const stateAbbr = path.getAttribute('data-id');
                    if (stateAbbr && stateAbbr.length === 2) {
                        path.id = 'US-' + stateAbbr.toUpperCase();
                    }
                });

                console.log('US Map SVG loaded successfully');
                return;
            }
        }

        console.warn('Could not load US map SVG, will use fallback grid');
    }

    // Quick Fix: Since I didn't put the SVG file, let's create a "Mock" Map Loader for the agent task 
    // that draws 50 squares if the SVG is empty.
    async function initMapInteraction() {
        // Mock Map Generation if empty (just so we have something clickable)
        if (!els.usMap.querySelector('path')) {
            // Very rough Grid Map
            const states = Object.keys(DASHBOARD_DATA.states);
            let svgContent = '';
            states.forEach((stateCode, i) => {
                const row = Math.floor(i / 10);
                const col = i % 10;
                // Using rects as paths for simplicity in this fallback
                svgContent += `<path id="${stateCode}" d="M${col * 90 + 10},${row * 60 + 10} h70 v40 h-70 Z" fill="#ddd" stroke="white" data-state="${stateCode}" />`;
                svgContent += `<text x="${col * 90 + 45}" y="${row * 60 + 35}" text-anchor="middle" font-size="12" pointer-events="none">${stateCode.replace('US-', '')}</text>`;
            });
            els.usMap.innerHTML = svgContent;
        }

        // Every state is a focusable button for keyboard and screen-reader users.
        els.usMap.querySelectorAll('path').forEach(path => {
            if (!DASHBOARD_DATA.states[path.id]) return;
            path.setAttribute('role', 'button');
            path.setAttribute('tabindex', '0');
        });

        // Add Listeners
        els.usMap.addEventListener('click', (e) => {
            if (e.target.tagName === 'path') {
                const stateCode = e.target.id;
                openStatePanel(stateCode);
            }
        });

        els.usMap.addEventListener('keydown', (e) => {
            if (e.target.tagName !== 'path') return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openStatePanel(e.target.id);
            }
        });

        els.usMap.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'path') {
                showTooltip(e, e.target.id);
            }
        });

        els.usMap.addEventListener('mouseout', (e) => {
            hideTooltip();
        });

        els.usMap.addEventListener('mousemove', (e) => {
            moveTooltip(e);
        });
    }

    function updateMapView(indicator) {
        // Colorize States
        const paths = els.usMap.querySelectorAll('path');
        console.log(`[updateMapView] Found ${paths.length} paths. Indicator: ${indicator}`);
        let coloredCount = 0;
        paths.forEach(path => {
            const stateCode = path.id;
            const stateData = DASHBOARD_DATA.states[stateCode];
            if (stateData) {
                const val = stateData[indicator]?.value;
                path.style.fill = colorOrNoData(val, indicator);
                const label = (INDICATOR_META.find(i => i.key === indicator) || {}).label || indicator;
                path.setAttribute('aria-label', `${stateData.name}: ${label} ${formatValue(val)}. Open details.`);
                coloredCount++;
            }
        });
        console.log(`[updateMapView] Colored ${coloredCount} states with data-driven colors.`);
    }


    // --- State Panel ---
    function openStatePanel(stateCode) {
        const data = DASHBOARD_DATA.states[stateCode];
        if (!data) return;

        els.panelStateName.textContent = data.name;
        els.panelIndicators.innerHTML = ''; // Clear

        const indicators = [
            { key: 'financial_anxiety', label: 'Financial Anxiety' },
            { key: 'food_insecurity', label: 'Food Insecurity' },
            { key: 'housing_stress', label: 'Housing Stress' },
            { key: 'affordability', label: 'Affordability' }
        ];

        indicators.forEach(ind => {
            const indData = data[ind.key] || {};
            const nationalVal = DASHBOARD_DATA.national[ind.key]?.value;
            const hasValue = typeof indData.value === 'number' && isFinite(indData.value);
            const hasNational = typeof nationalVal === 'number' && isFinite(nationalVal);
            const maxVal = 200; // scale max
            const statePercent = hasValue ? Math.min((indData.value / maxVal) * 100, 100) : 0;
            const nationalPercent = hasNational ? Math.min((nationalVal / maxVal) * 100, 100) : 0;
            const total = Object.keys(DASHBOARD_DATA.states).length;
            const diff = (hasValue && hasNational)
                ? `${indData.value > nationalVal ? '+' : ''}${(indData.value - nationalVal).toFixed(1)} vs mean`
                : 'no reading';
            const div = document.createElement('div');
            div.className = 'panel-indicator';
            div.innerHTML = `
                <div class="panel-indicator-label">${ind.label}</div>
                <div class="panel-indicator-row">
                    <div class="panel-indicator-value" style="color: ${colorOrNoData(indData.value, ind.key)}">${formatValue(indData.value)}</div>
                    <div class="panel-indicator-meta">
                        <div class="panel-rank" title="1 = most stressed of ${total}${indData.clamped ? '. This value sits at the index bound, so it is tied with any other state at that bound.' : ''}">${indData.rank ? `Rank #${indData.rank} of ${total}` : 'Unranked'}${indData.clamped ? ' · tied' : ''}</div>
                        <div class="panel-change">${formatChange(indData.change, indData.change_basis)}</div>
                    </div>
                </div>
                <div class="panel-comparison">
                    <div class="panel-comparison-label" title="Unweighted mean of the ${total} state indices">vs National Mean (${formatValue(nationalVal)})</div>
                    <div class="panel-comparison-bar-track">
                        <div class="panel-comparison-bar-fill" style="width: ${statePercent}%; background: ${colorOrNoData(indData.value, ind.key)};"></div>
                        <div class="panel-comparison-marker" style="left: ${nationalPercent}%;" title="National mean"></div>
                    </div>
                    <div class="panel-comparison-values">
                        <span>0</span>
                        <span>${diff}</span>
                        <span>200</span>
                    </div>
                </div>
            `;
            els.panelIndicators.appendChild(div);
        });

        els.statePanel.classList.add('open');
        els.panelOverlay.classList.add('visible');
        if (els.panelClose) els.panelClose.focus({ preventScroll: true });

        APP_STATE.currentState = stateCode;
        syncStateUrl(stateCode);
        updateShareLinks(stateCode);
    }

    function closePanel() {
        els.statePanel.classList.remove('open');
        els.panelOverlay.classList.remove('visible');
        APP_STATE.currentState = null;
        syncStateUrl(null);
    }

    // --- Shareable State Permalinks ---------------------------------------
    // The panel is reflected in the URL as ?state=OH so a state view can be
    // linked, bookmarked and cited. replaceState (not pushState) keeps the
    // back button behaving exactly as it did before this existed.

    function shortStateCode(stateCode) {
        return String(stateCode || '').replace(/^US-/, '');
    }

    function syncStateUrl(stateCode) {
        if (!window.history || !window.history.replaceState) return;
        const url = new URL(window.location.href);
        if (stateCode) {
            url.searchParams.set('state', shortStateCode(stateCode));
        } else {
            url.searchParams.delete('state');
        }
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }

    function normalizeStateCode(raw) {
        if (!raw) return null;
        let code = String(raw).trim().toUpperCase();
        if (!code) return null;
        if (code.indexOf('US-') !== 0) code = 'US-' + code;
        return DASHBOARD_DATA.states && DASHBOARD_DATA.states[code] ? code : null;
    }

    function stateShareUrl(stateCode) {
        const url = new URL(window.location.href);
        url.hash = '';
        url.search = '';
        url.searchParams.set('state', shortStateCode(stateCode));
        return url.toString();
    }

    function openStateFromUrl() {
        const requested = new URLSearchParams(window.location.search).get('state');
        const code = normalizeStateCode(requested);
        if (code) openStatePanel(code);
    }

    function updateShareLinks(stateCode) {
        const data = DASHBOARD_DATA.states[stateCode];
        if (!data) return;

        const url = stateShareUrl(stateCode);
        const indicator = APP_STATE.currentIndicator;
        const label = (INDICATOR_META.find(i => i.key === indicator) || {}).label || 'Financial stress';
        const value = formatValue(data[indicator]?.value);
        const text = `${data.name}: ${label} index ${value} on the FinMango Financial Health Barometer.`;

        if (els.shareX) {
            els.shareX.href = 'https://x.com/intent/post?text=' +
                encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
        }
        if (els.shareLinkedin) {
            els.shareLinkedin.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' +
                encodeURIComponent(url);
        }
    }

    // --- Branded Share Card ------------------------------------------------
    // Renders a 1200x630 PNG of a state's four indicators, with the FinMango
    // wordmark and the source URL burned in, so the numbers stay attributed
    // wherever the image ends up.

    const SHARE_CARD = { w: 1200, h: 630, pad: 72 };

    function formatAsOfDate(iso) {
        const parts = String(iso || '').slice(0, 10).split('-');
        if (parts.length !== 3) return iso || '';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(parts[1], 10) - 1] || ''} ${parseInt(parts[2], 10)}, ${parts[0]}`;
    }

    function drawTrackedText(ctx, text, x, y, tracking) {
        // Canvas letterSpacing is not supported everywhere — space manually.
        let cursor = x;
        for (const char of text) {
            ctx.fillText(char, cursor, y);
            cursor += ctx.measureText(char).width + tracking;
        }
    }

    function loadLogo() {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);   // fall back to a text wordmark
            img.src = 'finmango.png';
        });
    }

    async function renderShareCard(stateCode) {
        const data = DASHBOARD_DATA.states[stateCode];
        if (!data) return null;

        const { w, h, pad } = SHARE_CARD;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // Web fonts must be resolved before the first fillText or the canvas
        // silently falls back to a system face.
        if (document.fonts && document.fonts.ready) {
            try { await document.fonts.ready; } catch (e) { /* non-fatal */ }
        }
        const body = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
        const mono = "'JetBrains Mono', 'SF Mono', Menlo, monospace";

        // Paper
        ctx.fillStyle = '#FAFAF7';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#F25A27';
        ctx.fillRect(0, 0, w, 10);

        // Eyebrow
        ctx.fillStyle = '#F25A27';
        ctx.font = `700 20px ${body}`;
        ctx.textBaseline = 'alphabetic';
        drawTrackedText(ctx, 'FINANCIAL HEALTH BAROMETER', pad, pad + 34, 3.4);

        // State name — shrink to fit rather than overflow (e.g. District of Columbia)
        ctx.fillStyle = '#0A0A0A';
        let nameSize = 82;
        ctx.font = `900 ${nameSize}px ${body}`;
        while (ctx.measureText(data.name).width > w - pad * 2 && nameSize > 40) {
            nameSize -= 4;
            ctx.font = `900 ${nameSize}px ${body}`;
        }
        ctx.fillText(data.name, pad, pad + 130);

        // 2x2 indicator grid
        const colW = (w - pad * 2) / 2;
        const rowTop = pad + 190;
        const rowH = 128;

        INDICATOR_META.forEach((ind, i) => {
            const d = data[ind.key];
            if (!d) return;
            const x = pad + (i % 2) * colW;
            const y = rowTop + Math.floor(i / 2) * rowH;
            const color = getColorForValueOnPaper(d.value, ind.key);

            ctx.fillStyle = 'rgba(10,10,10,.62)';
            ctx.font = `500 20px ${body}`;
            ctx.fillText(ind.label, x, y);

            ctx.fillStyle = color;
            ctx.font = `500 58px ${mono}`;
            ctx.fillText(d.value.toFixed(1), x, y + 62);

            const valueWidth = ctx.measureText(d.value.toFixed(1)).width;
            ctx.fillStyle = 'rgba(10,10,10,.38)';
            ctx.font = `500 18px ${body}`;
            // A null change has no percentage to print — say so rather than
            // rendering a 0.0% that reads as a measured result.
            const hasChange = typeof d.change === 'number' && isFinite(d.change);
            const changeText = !hasChange
                ? 'no change data'
                : (Math.abs(d.change) < 0.05
                    ? '— 0.0%'
                    : `${d.change > 0 ? '▲' : '▼'} ${Math.abs(d.change).toFixed(1)}%`);
            const meta = (d.rank ? `#${d.rank} of 51` : '') +
                (d.rank ? '  ·  ' : '') + changeText;
            ctx.fillText(meta, x + valueWidth + 16, y + 62);

            // Severity bar (0-200 scale, same as the dashboard)
            const barW = colW - 60;
            ctx.fillStyle = 'rgba(10,10,10,.1)';
            ctx.fillRect(x, y + 82, barW, 5);
            ctx.fillStyle = color;
            ctx.fillRect(x, y + 82, barW * Math.max(0.02, Math.min(1, d.value / 200)), 5);
        });

        // Footer rule
        const footY = h - pad - 42;
        ctx.fillStyle = 'rgba(10,10,10,.1)';
        ctx.fillRect(pad, footY - 26, w - pad * 2, 1);

        // Wordmark
        const logo = await loadLogo();
        if (logo && logo.width) {
            const logoH = 42;
            const logoW = (logo.width / logo.height) * logoH;
            ctx.drawImage(logo, pad, footY - 6, logoW, logoH);
        } else {
            ctx.fillStyle = '#0A0A0A';
            ctx.font = `900 34px ${body}`;
            ctx.fillText('FinMango', pad, footY + 26);
        }

        // Source line
        ctx.fillStyle = 'rgba(10,10,10,.38)';
        ctx.font = `500 18px ${body}`;
        ctx.textAlign = 'right';
        ctx.fillText(`finmango.org/barometer  ·  Updated ${formatAsOfDate(DASHBOARD_DATA.as_of)}`,
            w - pad, footY + 26);
        ctx.textAlign = 'left';

        return canvas;
    }

    async function downloadShareCard(stateCode) {
        const canvas = await renderShareCard(stateCode);
        if (!canvas) return;
        const name = DASHBOARD_DATA.states[stateCode].name
            .toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await new Promise(resolve => {
            canvas.toBlob(blob => {
                if (!blob) return resolve();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `finmango-barometer-${name}-${DASHBOARD_DATA.as_of}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                resolve();
            }, 'image/png');
        });
    }

    // --- Embed Snippet Builder ---------------------------------------------

    function initEmbedBuilder() {
        if (!els.embedModal || !els.embedScope) return;

        const states = Object.entries(DASHBOARD_DATA.states || {})
            .map(([code, s]) => ({ code, name: s.name }))
            .sort((a, b) => a.name.localeCompare(b.name));

        els.embedScope.innerHTML = '<option value="">United States (national)</option>' +
            states.map(s => `<option value="${shortStateCode(s.code)}">${s.name}</option>`).join('');

        [els.embedScope, els.embedIndicator, els.embedTheme].forEach(sel => {
            if (sel) sel.addEventListener('change', updateEmbedSnippet);
        });
    }

    function embedSrc() {
        const params = new URLSearchParams();
        const scope = els.embedScope ? els.embedScope.value : '';
        const indicator = els.embedIndicator ? els.embedIndicator.value : 'all';
        const theme = els.embedTheme ? els.embedTheme.value : 'light';
        if (scope) params.set('state', scope);
        if (indicator && indicator !== 'all') params.set('indicator', indicator);
        if (theme === 'dark') params.set('theme', 'dark');
        const query = params.toString();
        return 'https://finmango.org/barometer-embed' + (query ? '?' + query : '');
    }

    function updateEmbedSnippet() {
        if (!els.embedCode) return;
        const src = embedSrc();
        const single = els.embedIndicator && els.embedIndicator.value !== 'all';
        const height = single ? 250 : 320;
        const scopeSelect = els.embedScope;
        const scopeName = scopeSelect && scopeSelect.value
            ? scopeSelect.options[scopeSelect.selectedIndex].text
            : 'United States';

        els.embedCode.value =
            `<iframe src="${src}"\n` +
            `        title="FinMango Financial Health Barometer — ${scopeName}"\n` +
            `        width="100%" height="${height}" loading="lazy"\n` +
            `        style="border:0;max-width:560px"></iframe>`;

        if (els.embedPreview) {
            // Preview from the local copy so it works before deploy too.
            els.embedPreview.src = src.replace('https://finmango.org/barometer-embed',
                'barometer-embed.html');
            els.embedPreview.height = height;
        }
        if (els.embedOpen) {
            els.embedOpen.href = src.replace('https://finmango.org/barometer-embed',
                'barometer-embed.html');
        }
    }

    function openEmbedModal() {
        if (!els.embedModal) return;
        // Show first, then point the preview at its src — the iframe has to be
        // laid out before it will load.
        els.embedModal.classList.add('open');
        updateEmbedSnippet();
    }

    function closeEmbedModal() {
        if (!els.embedModal) return;
        els.embedModal.classList.remove('open');
        if (els.embedPreview) els.embedPreview.src = 'about:blank';
    }

    // --- Small feedback helper for copy actions ---
    function flashButtonLabel(btn, message) {
        if (!btn) return;
        const target = btn.querySelector('.tool-label') || btn;
        const original = target.textContent;
        target.textContent = message;
        setTimeout(() => { target.textContent = original; }, 1600);
    }

    function copyText(text, btn, message) {
        const done = () => flashButtonLabel(btn, message);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
        } else {
            fallbackCopy(text, done);
        }
    }

    function fallbackCopy(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* clipboard unavailable */ }
        document.body.removeChild(ta);
        done();
    }

    // --- Tooltip ---
    function showTooltip(e, stateCode) {
        const data = DASHBOARD_DATA.states[stateCode];
        if (!data) return;

        els.tooltip.querySelector('.tooltip-state').textContent = data.name;
        const val = data[APP_STATE.currentIndicator]?.value;
        const formatted = APP_STATE.currentIndicator.replace('_', ' ').toUpperCase();
        els.tooltip.querySelector('.tooltip-value').textContent = `${formatted}: ${formatValue(val)}`;

        els.tooltip.classList.add('visible');
    }

    function hideTooltip() {
        els.tooltip.classList.remove('visible');
    }

    function moveTooltip(e) {
        // Offset from mouse
        els.tooltip.style.left = e.clientX + 15 + 'px';
        els.tooltip.style.top = e.clientY + 15 + 'px';
    }

    // --- Charts ---
    function initChart() {
        if (typeof Chart === 'undefined') {
            console.warn('[initChart] Chart.js not loaded — chart disabled');
            return;
        }
        const ctx = els.chartCanvas.getContext('2d');
        APP_STATE.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'National Average',
                    data: [],
                    borderColor: '#000000',
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: '#F25A27',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const isLast = ctx.dataIndex === ctx.dataset.data.length - 1;
                                return ` ${Number(ctx.parsed.y).toFixed(1)}${isLast ? ' (current index value)' : ' (search-interest shape)'}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: false, title: { display: true, text: 'Index (0–200 reference scale)' } } // Scales to data
                }
            }
        });
        updateChart();
    }

    function updateChart() {
        if (!APP_STATE.chartInstance) return;
        const indicator = els.chartIndicatorSelect.value;
        const period = els.chartPeriodSelect.value;

        // Get actual data points from the static dataset
        const rawPoints = (DASHBOARD_DATA.timeseries && DASHBOARD_DATA.timeseries.national && DASHBOARD_DATA.timeseries.national[indicator]) || [];

        // A broken history gets a note in place of the chart, not a false line
        const usable = isUsableHistory(rawPoints);
        const container = document.querySelector('.chart-container');
        if (container) {
            let note = container.querySelector('.chart-empty');
            if (!usable && !note) {
                note = document.createElement('div');
                note.className = 'chart-empty';
                note.innerHTML = '<strong>History under review</strong>' +
                    '<span>The search-interest history for this indicator has gaps, so it is not drawn. ' +
                    'Today’s index value above is unaffected.</span>';
                container.appendChild(note);
            }
            container.classList.toggle('is-empty', !usable);
        }
        if (!usable) {
            APP_STATE.chartInstance.data.labels = [];
            APP_STATE.chartInstance.data.datasets[0].data = [];
            APP_STATE.chartInstance.update();
            updateChartCaption(indicator);
            return;
        }
        
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (period) {
            case '3m': cutoffDate.setMonth(now.getMonth() - 3); break;
            case '6m': cutoffDate.setMonth(now.getMonth() - 6); break;
            case '12m': cutoffDate.setFullYear(now.getFullYear() - 1); break;
            case '5y': cutoffDate.setFullYear(now.getFullYear() - 5); break;
            case '10y': cutoffDate.setFullYear(now.getFullYear() - 10); break;
            case '15y': cutoffDate.setFullYear(now.getFullYear() - 15); break;
            default: cutoffDate.setFullYear(now.getFullYear() - 5); break;
        }

        // Filter points based on selected period
        const filteredPoints = rawPoints.filter(p => new Date(p.date) >= cutoffDate);
        // Ensure we always show some data if the filter is too narrow
        const displayPoints = filteredPoints.length > 0 ? filteredPoints : rawPoints.slice(-2);

        const labelFormat = { month: 'short', year: '2-digit' };

        let labelSuffix = ' (National)';
        if (displayPoints.length < 4 && period !== '3m') {
             labelSuffix += ` - Limited History (${displayPoints.length} updates)`;
        } else if (displayPoints.length === rawPoints.length && rawPoints.length > 0) {
             labelSuffix += ` - All Available History`;
        }

        // Dates are YYYY-MM-01; parse as local so the month label never slips
        // into the previous month in western time zones.
        const labelFor = d => {
            const [y, m] = String(d.date).split('-').map(Number);
            return new Date(y, (m || 1) - 1, 1).toLocaleDateString('en-US', labelFormat);
        };
        APP_STATE.chartInstance.data.labels = displayPoints.map(labelFor);
        APP_STATE.chartInstance.data.datasets[0].data = displayPoints.map(d => Number(d.value));
        APP_STATE.chartInstance.data.datasets[0].label = indicator.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + labelSuffix;
        APP_STATE.chartInstance.update();
        updateChartCaption(indicator);
    }

    // Say under the chart exactly what the line is, for the indicator shown.
    function updateChartCaption(indicator) {
        const el = document.getElementById('chart-caption');
        if (!el) return;
        const term = DASHBOARD_DATA.meta?.trends_terms?.[indicator];
        const run = DASHBOARD_DATA.meta?.trends_run;
        const lastFetch = DASHBOARD_DATA.meta?.trends_cache?.last_successful_fetch;
        const trendsDown = run && run.attempted !== false && run.state_readings === 0;
        const termText = term ? `for <strong>“${term}”</strong>` : 'for one representative term';
        const staleText = trendsDown
            ? ` The search-interest source did not return data for this reading${lastFetch ? ` (last successful fetch ${lastFetch})` : ''}, so the historical shape is the last one published, re-pinned to today’s value.`
            : '';
        el.innerHTML = `Only the most recent point is an actual index value. Earlier points trace Google Health
            Trends search interest ${termText}, rescaled so the latest month equals today’s index and smoothed
            over three months — see “Trend Chart” in the methodology.${staleText}`;
    }

    // --- Rankings Table ---
    let currentPage = 1;
    const itemsPerPage = 10;

    function setSort(key, dir) {
        APP_STATE.sortKey = key;
        APP_STATE.sortDir = dir;
        currentPage = 1;
        document.querySelectorAll('th[data-sort]').forEach(th => {
            const active = th.dataset.sort === key;
            th.setAttribute('aria-sort', active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none');
            const arrow = th.querySelector('.sort-arrow');
            if (arrow) arrow.textContent = active ? (dir === 'asc' ? '↑' : '↓') : '↕';
        });
        updateRankingsTable();
    }

    function initRankings() {
        // Column headers sort the table. Clicking the active column flips the
        // direction; a new column starts most-stressed first (A-Z for names).
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.setAttribute('tabindex', '0');
            th.setAttribute('role', 'button');
            const activate = () => {
                const key = th.dataset.sort;
                let dir;
                if (APP_STATE.sortKey === key) {
                    dir = APP_STATE.sortDir === 'desc' ? 'asc' : 'desc';
                } else {
                    dir = key === 'name' ? 'asc' : 'desc';
                }
                setSort(key, dir);
            };
            th.addEventListener('click', activate);
            th.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
            });
        });

        els.prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateRankingsTable();
            }
        });

        els.nextBtn.addEventListener('click', () => {
            const max = Math.ceil(Object.keys(DASHBOARD_DATA.states).length / itemsPerPage);
            if (currentPage < max) {
                currentPage++;
                updateRankingsTable();
            }
        });
    }

    function getValueBarWidth(value) {
        // Scale value 0-200 to percentage width
        return Math.min((value / 200) * 100, 100);
    }

    function renderValueCell(ind, indicator, sorted) {
        const value = ind?.value;
        const hasValue = typeof value === 'number' && isFinite(value);
        const color = colorOrNoData(value, indicator);
        const width = hasValue ? getValueBarWidth(value) : 0;
        const tied = ind?.clamped ? ' title="At the index bound — tied with any other state at that bound"' : '';
        return `<td class="value-cell${sorted ? ' sorted-col' : ''}" style="position:relative;"${tied}>
            <div class="value-bar" style="width:${width}%; background:${color};"></div>
            <span class="value-text">${formatValue(value)}${ind?.clamped ? '<span aria-hidden="true">*</span>' : ''}</span>
        </td>`;
    }

    function updateRankingsTable() {
        const sortKey = APP_STATE.sortKey;
        const sortDir = APP_STATE.sortDir;
        const searchTerm = (document.getElementById('rankings-search')?.value || '').toLowerCase().trim();

        let states = Object.entries(DASHBOARD_DATA.states).map(([code, s]) => ({ ...s, code }));

        // Filter by search
        if (searchTerm) {
            states = states.filter(s => s.name.toLowerCase().includes(searchTerm)
                || (s.abbr || '').toLowerCase() === searchTerm);
        }

        const valueOf = s => {
            const v = s[sortKey]?.value;
            return (typeof v === 'number' && isFinite(v)) ? v : null;
        };
        states.sort((a, b) => {
            if (sortKey === 'name') {
                return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            }
            const av = valueOf(a), bv = valueOf(b);
            if (av === null && bv === null) return a.name.localeCompare(b.name);
            if (av === null) return 1;   // missing readings sink to the bottom
            if (bv === null) return -1;
            if (av === bv) return a.name.localeCompare(b.name);
            return sortDir === 'asc' ? av - bv : bv - av;
        });

        const totalStates = states.length;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = states.slice(start, end);

        // The rank column is the state's published rank on the sorted
        // indicator (1 = most stressed), not its row number: a search filter
        // or an ascending sort must not renumber the states.
        const rankKey = sortKey === 'name' ? APP_STATE.currentIndicator : sortKey;

        els.rankingsBody.innerHTML = '';
        if (pageData.length === 0) {
            const tr = document.createElement('tr');
            tr.className = 'rankings-empty';
            tr.innerHTML = `<td colspan="6">No state matches “${searchTerm.replace(/</g, '&lt;')}”.</td>`;
            els.rankingsBody.appendChild(tr);
        }
        pageData.forEach((s) => {
            const tr = document.createElement('tr');
            tr.dataset.state = s.code;
            tr.setAttribute('tabindex', '0');
            tr.setAttribute('title', `Open ${s.name}`);
            const rank = s[rankKey]?.rank;
            tr.innerHTML = `
                <td><span class="rank-badge" title="Rank on ${(INDICATOR_META.find(i => i.key === rankKey) || {}).label || rankKey}">${rank || '–'}</span></td>
                <td><strong>${s.name}</strong></td>
                ${renderValueCell(s.financial_anxiety, 'financial_anxiety', sortKey === 'financial_anxiety')}
                ${renderValueCell(s.food_insecurity, 'food_insecurity', sortKey === 'food_insecurity')}
                ${renderValueCell(s.housing_stress, 'housing_stress', sortKey === 'housing_stress')}
                ${renderValueCell(s.affordability, 'affordability', sortKey === 'affordability')}
            `;
            els.rankingsBody.appendChild(tr);
        });

        els.pageStart.textContent = totalStates > 0 ? start + 1 : 0;
        els.pageEnd.textContent = Math.min(end, totalStates);
        const totalEl = document.getElementById('page-total');
        if (totalEl) totalEl.textContent = totalStates;

        els.prevBtn.disabled = currentPage === 1;
        els.nextBtn.disabled = end >= totalStates;
    }


    // --- Event Listeners Central ---
    function setupEventListeners() {
        // Indicator Cards — sole map/chart selector (toggle removed)
        els.indicatorCards.forEach(card => {
            const select = () => {
                // Active State
                els.indicatorCards.forEach(c => {
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                });
                card.classList.add('active');
                card.setAttribute('aria-pressed', 'true');

                // Update State
                APP_STATE.currentIndicator = card.dataset.indicator;

                // Update View
                updateMapView(APP_STATE.currentIndicator);
                setSort(APP_STATE.currentIndicator, 'desc');
                renderSparklines();

                // Update Chart Select to match
                els.chartIndicatorSelect.value = APP_STATE.currentIndicator;
                updateChart();

                // Keep the open state panel's share text on the live indicator
                if (APP_STATE.currentState) updateShareLinks(APP_STATE.currentState);
            };
            card.addEventListener('click', select);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
            });
        });

        // Rankings rows open the state panel
        if (els.rankingsBody) {
            const rowState = e => e.target.closest('tr[data-state]')?.dataset.state;
            els.rankingsBody.addEventListener('click', (e) => {
                const code = rowState(e);
                if (code) openStatePanel(code);
            });
            els.rankingsBody.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                const code = rowState(e);
                if (code) { e.preventDefault(); openStatePanel(code); }
            });
        }

        // Panel
        els.panelClose.addEventListener('click', closePanel);
        els.panelOverlay.addEventListener('click', closePanel);

        // Chart Controls
        els.chartIndicatorSelect.addEventListener('change', updateChart);
        els.chartPeriodSelect.addEventListener('change', updateChart);

        // Rankings Search
        const searchInput = document.getElementById('rankings-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                currentPage = 1;
                updateRankingsTable();
            });
        }

        // Tools (with null checks for optional elements)
        // Download CSV
        if (els.downloadCsv) {
            els.downloadCsv.addEventListener('click', () => {
                // Generate CSV from DASHBOARD_DATA
                // The methodology tells researchers to model on the raw inputs,
                // not the composites, and to divide the regional multiplier
                // back out. Export everything that takes: each index with its
                // rank, change and clamp flag, every underlying metric with its
                // source, and the multiplier.
                const headers = [
                    'State', 'Abbr', 'As Of',
                    'Financial Anxiety Index', 'Financial Anxiety Rank', 'Financial Anxiety Change (%)', 'Financial Anxiety Change Basis', 'Financial Anxiety Clamped',
                    'Food Insecurity Index', 'Food Insecurity Rank', 'Food Insecurity Clamped',
                    'Housing Stress Index', 'Housing Stress Rank', 'Housing Stress Change (%)', 'Housing Stress Change Basis', 'Housing Stress Clamped', 'Housing Stress Partial',
                    'Affordability Index', 'Affordability Rank', 'Affordability Clamped',
                    'Unemployment Rate (%)', 'Unemployment Reference Month',
                    'Poverty Rate (%)',
                    'Rent Burden (%)', 'Rent Burden Source',
                    'Fair Market Rent 2BR ($)', 'Fair Market Rent Source', 'FMR Term Source',
                    'House Price Change YoY (%)', 'House Price Source',
                    'Regional Multiplier'
                ];
                const csvNum = (v, digits) => (typeof v === 'number' && isFinite(v))
                    ? (digits === undefined ? String(v) : v.toFixed(digits)) : '';
                const csvStr = v => (v === null || v === undefined) ? '' : `"${String(v).replace(/"/g, '""')}"`;
                const csvFlag = v => v ? 'yes' : 'no';
                let csvContent = headers.join(',') + '\n';

                Object.values(DASHBOARD_DATA.states).forEach(state => {
                    const m = state.metrics || {};
                    const fa = state.financial_anxiety || {}, fi = state.food_insecurity || {};
                    const hs = state.housing_stress || {}, af = state.affordability || {};
                    const row = [
                        csvStr(state.name), csvStr(state.abbr), csvStr(DASHBOARD_DATA.as_of),
                        csvNum(fa.value, 1), csvNum(fa.rank), csvNum(fa.change, 1), csvStr(fa.change_basis), csvFlag(fa.clamped),
                        csvNum(fi.value, 1), csvNum(fi.rank), csvFlag(fi.clamped),
                        csvNum(hs.value, 1), csvNum(hs.rank), csvNum(hs.change, 1), csvStr(hs.change_basis), csvFlag(hs.clamped), csvFlag(hs.partial),
                        csvNum(af.value, 1), csvNum(af.rank), csvFlag(af.clamped),
                        csvNum(m.unemployment_rate, 1), csvStr(m.unemployment_period),
                        csvNum(m.poverty_rate, 1),
                        csvNum(m.rent_burden_pct, 1), csvStr(m.rent_burden_source || state.rent_burden?.source),
                        // fair_market_rent_2br is HUD-only now, so fall back to the
                        // top-level resolved figure rather than exporting a blank
                        // column whenever HUD has not answered.
                        csvNum(m.fair_market_rent_2br ?? state.fmr_2br?.value),
                        csvStr(m.fair_market_rent_source || state.fmr_2br?.source),
                        csvStr(m.fmr_score_source),
                        csvNum(m.housing_price_change, 2), csvStr(m.housing_price_change_source),
                        csvNum(m.regional_stress_multiplier)
                    ];
                    csvContent += row.join(',') + '\n';
                });

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `finmango-barometer-data-${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }

        // Download JSON
        if (els.downloadJson) {
            els.downloadJson.addEventListener('click', () => {
                const jsonStr = JSON.stringify(DASHBOARD_DATA, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `finmango-barometer-data-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url); // Clean up
            });
        }

        // Copy Citation
        if (els.copyCitation) {
            els.copyCitation.addEventListener('click', () => {
                // Same text as the "Cite This Data" block, with the data date the
                // reader is looking at. (This used to copy a 2024 citation to a
                // URL that no longer exists.)
                const asOf = DASHBOARD_DATA.as_of || new Date().toISOString().slice(0, 10);
                const year = asOf.slice(0, 4);
                const citation = `FinMango Research Team. (${year}). Financial Health Barometer: US Economic Stress Indicators [Data set, reading of ${asOf}]. FinMango. https://finmango.org/barometer`;
                copyText(citation, els.copyCitation, 'Citation copied');
            });
        }

        // --- Share: state permalink + branded image ---
        if (els.shareCopyLink) {
            els.shareCopyLink.addEventListener('click', () => {
                if (!APP_STATE.currentState) return;
                copyText(stateShareUrl(APP_STATE.currentState), els.shareCopyLink, 'Link copied');
            });
        }

        if (els.shareDownloadCard) {
            els.shareDownloadCard.addEventListener('click', async () => {
                if (!APP_STATE.currentState) return;
                const btn = els.shareDownloadCard;
                const original = btn.textContent;
                btn.disabled = true;
                btn.textContent = 'Rendering…';
                try {
                    await downloadShareCard(APP_STATE.currentState);
                } catch (err) {
                    console.error('[share] card render failed:', err);
                } finally {
                    btn.disabled = false;
                    btn.textContent = original;
                }
            });
        }

        // --- Embed builder ---
        if (els.embedBtn) els.embedBtn.addEventListener('click', openEmbedModal);
        if (els.embedClose) els.embedClose.addEventListener('click', closeEmbedModal);
        if (els.embedModal) {
            els.embedModal.addEventListener('click', (e) => {
                if (e.target === els.embedModal) closeEmbedModal();
            });
        }
        if (els.embedCopy) {
            els.embedCopy.addEventListener('click', () => {
                copyText(els.embedCode.value, els.embedCopy, 'Copied');
            });
        }

        // Escape closes whichever layer is open
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (els.embedModal && els.embedModal.classList.contains('open')) {
                closeEmbedModal();
            } else if (els.statePanel && els.statePanel.classList.contains('open')) {
                closePanel();
            }
        });
    }

    // Run
    init();
});
