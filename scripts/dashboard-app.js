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
        currentState: null   // US-XX while the state panel is open, else null
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
            ['updateRankingsTable', updateRankingsTable],
            ['initEmbedBuilder', initEmbedBuilder],
            ['renderProvenance', renderProvenance],
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
        return `<span class="${cssClass}"> ${sign} ${Math.abs(val).toFixed(1)}%</span>`;
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
            fair_market_rent: 'Fair market rent',
            housing_wage: 'Housing wage',
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

        renderTrendsCoverage();
        renderPartialWarning();
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

    function updateIndicatorCards() {
        const national = DASHBOARD_DATA.national;

        els.valAnxiety.textContent = formatValue(national.financial_anxiety.value);
        els.changeAnxiety.innerHTML = formatChange(national.financial_anxiety.change, national.financial_anxiety.change_basis);

        els.valFood.textContent = formatValue(national.food_insecurity.value);
        els.changeFood.innerHTML = formatChange(national.food_insecurity.change, national.food_insecurity.change_basis);

        els.valHousing.textContent = formatValue(national.housing_stress.value);
        els.changeHousing.innerHTML = formatChange(national.housing_stress.change, national.housing_stress.change_basis);

        els.valAfford.textContent = formatValue(national.affordability.value);
        els.changeAfford.innerHTML = formatChange(national.affordability.change, national.affordability.change_basis);

        // Apply severity border classes
        applyCardSeverity();

        // Render sparklines
        renderSparklines();
    }

    // --- Sparklines ---
    function renderSparklines() {
        const indicators = ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability'];
        indicators.forEach(indicator => {
            const container = document.getElementById('spark-' + indicator);
            if (!container) return;

            const rawPoints = (DASHBOARD_DATA.timeseries && DASHBOARD_DATA.timeseries.national && DASHBOARD_DATA.timeseries.national[indicator]) || [];
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

        // Add Listeners
        els.usMap.addEventListener('click', (e) => {
            if (e.target.tagName === 'path') {
                const stateCode = e.target.id;
                openStatePanel(stateCode);
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
                const val = stateData[indicator].value;
                const color = getColorForValue(val, indicator);
                path.style.fill = color;
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
            const indData = data[ind.key];
            const nationalVal = DASHBOARD_DATA.national[ind.key].value;
            const maxVal = 200; // scale max
            const statePercent = Math.min((indData.value / maxVal) * 100, 100);
            const nationalPercent = Math.min((nationalVal / maxVal) * 100, 100);
            const div = document.createElement('div');
            div.className = 'panel-indicator';
            div.innerHTML = `
                <div class="panel-indicator-label">${ind.label}</div>
                <div class="panel-indicator-row">
                    <div class="panel-indicator-value" style="color: ${getColorForValue(indData.value, ind.key)}">${formatValue(indData.value)}</div>
                    <div class="panel-indicator-meta">
                        <div class="panel-rank">Rank #${indData.rank}</div>
                        <div class="panel-change">${formatChange(indData.change, indData.change_basis)}</div>
                    </div>
                </div>
                <div class="panel-comparison">
                    <div class="panel-comparison-label">vs National Avg (${formatValue(nationalVal)})</div>
                    <div class="panel-comparison-bar-track">
                        <div class="panel-comparison-bar-fill" style="width: ${statePercent}%; background: ${getColorForValue(indData.value, ind.key)};"></div>
                        <div class="panel-comparison-marker" style="left: ${nationalPercent}%;" title="National Average"></div>
                    </div>
                    <div class="panel-comparison-values">
                        <span>0</span>
                        <span>${indData.value > nationalVal ? '+' : ''}${(indData.value - nationalVal).toFixed(1)} vs avg</span>
                        <span>200</span>
                    </div>
                </div>
            `;
            els.panelIndicators.appendChild(div);
        });

        els.statePanel.classList.add('open');
        els.panelOverlay.classList.add('visible');

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
        const value = data[indicator] ? data[indicator].value.toFixed(1) : '';
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
        const val = data[APP_STATE.currentIndicator].value;
        const formatted = APP_STATE.currentIndicator.replace('_', ' ').toUpperCase();
        els.tooltip.querySelector('.tooltip-value').textContent = `${formatted}: ${val.toFixed(1)}`;

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
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: { beginAtZero: false } // Scales to data
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

        APP_STATE.chartInstance.data.labels = displayPoints.map(d => new Date(d.date).toLocaleDateString('en-US', labelFormat));
        APP_STATE.chartInstance.data.datasets[0].data = displayPoints.map(d => d.value.toFixed(1));
        APP_STATE.chartInstance.data.datasets[0].label = indicator.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + labelSuffix;
        APP_STATE.chartInstance.update();
    }

    // --- Rankings Table ---
    let currentPage = 1;
    const itemsPerPage = 10;

    function initRankings() {
        // Add Sort Listeners
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                // Sorting Logic here (omitted for brevity in demo)
                // Just assuming pre-sorted by current indicator for now
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

    function renderValueCell(value, indicator) {
        const color = getColorForValue(value, indicator);
        const width = getValueBarWidth(value);
        return `<td class="value-cell" style="position:relative;">
            <div class="value-bar" style="width:${width}%; background:${color};"></div>
            <span class="value-text">${value.toFixed(1)}</span>
        </td>`;
    }

    function updateRankingsTable() {
        const indicator = APP_STATE.currentIndicator;
        const searchTerm = (document.getElementById('rankings-search')?.value || '').toLowerCase().trim();

        let states = Object.entries(DASHBOARD_DATA.states).map(([code, s]) => ({ ...s, code }));

        // Filter by search
        if (searchTerm) {
            states = states.filter(s => s.name.toLowerCase().includes(searchTerm));
        }

        states.sort((a, b) => b[indicator].value - a[indicator].value);

        const totalStates = states.length;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = states.slice(start, end);

        els.rankingsBody.innerHTML = '';
        pageData.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="rank-badge">${start + idx + 1}</span></td>
                <td><strong>${s.name}</strong></td>
                ${renderValueCell(s.financial_anxiety.value, 'financial_anxiety')}
                ${renderValueCell(s.food_insecurity.value, 'food_insecurity')}
                ${renderValueCell(s.housing_stress.value, 'housing_stress')}
                ${renderValueCell(s.affordability.value, 'affordability')}
            `;
            els.rankingsBody.appendChild(tr);
        });

        els.pageStart.textContent = totalStates > 0 ? start + 1 : 0;
        els.pageEnd.textContent = Math.min(end, totalStates);

        els.prevBtn.disabled = currentPage === 1;
        els.nextBtn.disabled = end >= totalStates;
    }


    // --- Event Listeners Central ---
    function setupEventListeners() {
        // Indicator Cards — sole map/chart selector (toggle removed)
        els.indicatorCards.forEach(card => {
            card.addEventListener('click', () => {
                // Active State
                els.indicatorCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                // Update State
                APP_STATE.currentIndicator = card.dataset.indicator;

                // Update View
                updateMapView(APP_STATE.currentIndicator);
                updateRankingsTable();
                renderSparklines();

                // Update Chart Select to match
                els.chartIndicatorSelect.value = APP_STATE.currentIndicator;
                updateChart();

                // Keep the open state panel's share text on the live indicator
                if (APP_STATE.currentState) updateShareLinks(APP_STATE.currentState);
            });
        });

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
                const headers = [
                    'State',
                    'Financial Anxiety Index', 'Unemployment Rate (%)',
                    'Food Insecurity Index', 'Poverty Rate (%)',
                    'Housing Stress Index', 'Rent Burden (%)', 'Fair Market Rent ($)',
                    'Affordability Index'
                ];
                let csvContent = headers.join(',') + '\n';

                Object.values(DASHBOARD_DATA.states).forEach(state => {
                    const m = state.metrics || {};
                    const row = [
                        `"${state.name}"`,
                        state.financial_anxiety.value.toFixed(1),
                        m.unemployment_rate ? m.unemployment_rate.toFixed(1) : '',
                        state.food_insecurity.value.toFixed(1),
                        m.poverty_rate ? m.poverty_rate.toFixed(1) : '',
                        state.housing_stress.value.toFixed(1),
                        m.rent_burden_pct ? m.rent_burden_pct.toFixed(1) : '',
                        // fair_market_rent_2br is HUD-only now, so fall back to the
                        // top-level resolved figure rather than exporting a blank
                        // column whenever HUD has not answered.
                        m.fair_market_rent_2br ?? state.fmr_2br?.value ?? '',
                        state.affordability.value.toFixed(1)
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
                navigator.clipboard.writeText('FinMango Research Team (2024). Financial Health Pulse: Real-Time US Economic Stress Indicators. https://finmango.org/research-dashboard');
                alert('Citation copied to clipboard!');
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
