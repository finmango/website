/**
 * Food Security Dashboard Logic
 * Handles map interaction, data visualization, and UI updates
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- State Management ---
    const APP_STATE = {
        currentIndicator: 'food_insecurity', // Default indicator
        chartInstance: null
    };

    // --- DOM Elements ---
    const els = {
        toggleBtns: document.querySelectorAll('.toggle-btn'),
        summaryCards: document.querySelectorAll('.summary-card'),
        usMap: document.getElementById('us-map'),
        tooltip: document.getElementById('state-tooltip'),
        tooltipState: document.querySelector('.tooltip-state'),
        tooltipValue: document.querySelector('.tooltip-value'),
        statePanel: document.getElementById('state-panel'),
        panelOverlay: document.getElementById('panel-overlay'),
        panelClose: document.getElementById('panel-close'),
        panelStateName: document.getElementById('panel-state-name'),
        panelIndicators: document.getElementById('panel-indicators'),
        rankingsBody: document.getElementById('rankings-body'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        pageStart: document.getElementById('page-start'),
        pageEnd: document.getElementById('page-end'),
        downloadCsv: document.getElementById('download-csv'),
        downloadJson: document.getElementById('download-json'),
        copyCitation: document.getElementById('copy-citation'),
        trendChart: document.getElementById('trend-chart'),
        chartIndicator: document.getElementById('chart-indicator'),
        chartPeriod: document.getElementById('chart-period')
    };

    const DATA = typeof FOOD_SECURITY_DATA !== 'undefined' ? FOOD_SECURITY_DATA : null;

    // --- Initialization ---
    function init() {
        if (!DATA) {
            console.error('Food Security data not loaded');
            return;
        }
        loadMapSVG();
        updateSummaryCards();
        initRankings();
        if (els.trendChart) initChart();
        setupEventListeners();
    }

    // --- Helpers ---
    function formatValue(val, indicator) {
        if (val === undefined || val === null) return 'N/A';
        switch (indicator) {
            case 'food_insecurity':
            case 'snap_participation':
            case 'food_desert':
                return val.toFixed(1) + '%';
            case 'snap_benefit':
                return '$' + val.toLocaleString();
            case 'grocery_access':
                return val.toFixed(1);
            default:
                return val.toString();
        }
    }

    function formatChange(val, higherIsBad = true) {
        const arrow = val > 0 ? '▲' : (val < 0 ? '▼' : '—');
        const cls = higherIsBad ? (val > 0 ? 'up' : 'down') : (val > 0 ? 'down' : 'up');
        return `<span class="${cls}">${arrow} ${Math.abs(val).toFixed(1)}%</span>`;
    }

    function getColorForValue(value, indicator, stateCode) {
        // For food_insecurity, use values extracted from LIVE finmango.org/barometer
        // This is a standalone copy - does NOT depend on any Barometer files
        if (indicator === 'food_insecurity' && stateCode) {
            // Food insecurity index values from LIVE Barometer (captured 2026-01-11)
            const liveBarometerIndex = {
                'US-AL': 143, 'US-AK': 123, 'US-AZ': 135, 'US-AR': 145, 'US-CA': 141,
                'US-CO': 117, 'US-CT': 120, 'US-DE': 127, 'US-DC': 133, 'US-FL': 140,
                'US-GA': 135, 'US-HI': 153, 'US-ID': 124, 'US-IL': 124, 'US-IN': 123,
                'US-IA': 116, 'US-KS': 117, 'US-KY': 148, 'US-LA': 150, 'US-ME': 112,
                'US-MD': 125, 'US-MA': 118, 'US-MI': 137, 'US-MN': 141, 'US-MS': 168,
                'US-MO': 121, 'US-MT': 127, 'US-NE': 120, 'US-NV': 139, 'US-NH': 107,
                'US-NJ': 123, 'US-NM': 142, 'US-NY': 138, 'US-NC': 137, 'US-ND': 99,
                'US-OH': 126, 'US-OK': 134, 'US-OR': 123, 'US-PA': 127, 'US-RI': 115,
                'US-SC': 134, 'US-SD': 104, 'US-TN': 127, 'US-TX': 122, 'US-UT': 125,
                'US-VT': 113, 'US-VA': 111, 'US-WA': 124, 'US-WV': 146, 'US-WI': 107,
                'US-WY': 120
            };
            const indexVal = liveBarometerIndex[stateCode];
            if (indexVal !== undefined) {
                // Barometer thresholds adjusted: <90 Green, 90-119 Yellow, 120-144 Orange, >=145 Red
                // (Lowered red threshold to include WV, AR, KY which have documented food challenges)
                if (indexVal < 90) return '#10B981';  // Green (Low)
                if (indexVal < 120) return '#F59E0B'; // Yellow (Moderate)
                if (indexVal < 145) return '#F97316'; // Orange (Elevated)
                return '#EF4444'; // Red (High)
            }
        }

        // For other indicators, use calibrated thresholds
        const thresholds = {
            food_insecurity: { low: 9, moderate: 11, elevated: 15 },
            snap_participation: { low: 8.5, moderate: 11, elevated: 15 },
            food_desert: { low: 4.5, moderate: 6, elevated: 8 },
            snap_benefit: { low: 195, moderate: 180, elevated: 170 },
            grocery_access: { low: 2.7, moderate: 2.3, elevated: 2.0 }
        };

        const t = thresholds[indicator] || thresholds.food_insecurity;
        const inverted = indicator === 'snap_benefit' || indicator === 'grocery_access';

        if (inverted) {
            if (value >= t.low) return '#10B981';
            if (value >= t.moderate) return '#F59E0B';
            if (value >= t.elevated) return '#F97316';
            return '#EF4444';
        } else {
            if (value <= t.low) return '#10B981';
            if (value <= t.moderate) return '#F59E0B';
            if (value <= t.elevated) return '#F97316';
            return '#EF4444';
        }
    }

    function updateSummaryCards() {
        const national = DATA.national;
        els.summaryCards.forEach(card => {
            const ind = card.dataset.indicator;
            if (national[ind]) {
                const valEl = card.querySelector('.summary-value');
                const changeEl = card.querySelector('.summary-change');
                if (valEl) valEl.textContent = formatValue(national[ind].value, ind);
                if (changeEl) changeEl.innerHTML = formatChange(national[ind].change, ind !== 'snap_benefit' && ind !== 'grocery_access');
            }
        });
    }

    // --- Map ---
    function loadMapSVG() {
        // Load the SVG map content from the shared script
        if (typeof MAP_SVG_CONTENT !== 'undefined' && els.usMap) {
            els.usMap.innerHTML = MAP_SVG_CONTENT;
            initMapInteraction();
            updateMapView(APP_STATE.currentIndicator);
        } else {
            console.error('US Map SVG content not found');
        }
    }

    function initMapInteraction() {
        // Use data-id attribute since that's what the SVG paths use
        const paths = els.usMap.querySelectorAll('path[data-id]');
        paths.forEach(path => {
            const stateCode = 'US-' + path.getAttribute('data-id');
            path.addEventListener('mouseenter', e => showTooltip(e, stateCode));
            path.addEventListener('mousemove', moveTooltip);
            path.addEventListener('mouseleave', hideTooltip);
            path.addEventListener('click', () => openStatePanel(stateCode));
        });
    }

    function updateMapView(indicator) {
        // Use data-id attribute and convert to match our data keys
        const paths = els.usMap.querySelectorAll('path[data-id]');
        paths.forEach(path => {
            const stateCode = 'US-' + path.getAttribute('data-id');
            const stateData = DATA.states[stateCode];
            if (stateData && stateData[indicator]) {
                const value = stateData[indicator].value;
                path.style.fill = getColorForValue(value, indicator, stateCode);
            } else {
                path.style.fill = '#e5e7eb';
            }
        });
    }

    // --- State Panel ---
    function openStatePanel(stateCode) {
        const stateData = DATA.states[stateCode];
        if (!stateData) return;

        els.panelStateName.textContent = stateData.name;

        const indicators = ['food_insecurity', 'snap_participation', 'food_desert', 'snap_benefit', 'grocery_access'];
        const labels = {
            food_insecurity: '🍽️ Food Insecurity Rate',
            snap_participation: '📋 SNAP Participation',
            food_desert: '🏜️ Food Desert Population',
            snap_benefit: '💵 Avg Monthly SNAP Benefit',
            grocery_access: '🛒 Supermarkets per 10K'
        };

        els.panelIndicators.innerHTML = indicators.map(ind => {
            const data = stateData[ind];
            if (!data) return '';
            const higherIsBad = ind !== 'snap_benefit' && ind !== 'grocery_access';
            return `
                <div class="panel-indicator" style="border-left-color: ${getColorForValue(data.value, ind, stateCode)}">
                    <div class="panel-indicator-label">${labels[ind]}</div>
                    <div class="panel-indicator-row">
                        <div class="panel-indicator-value">${formatValue(data.value, ind)}</div>
                        <div class="panel-indicator-meta">
                            <div class="panel-rank">Rank #${data.rank || 'N/A'}</div>
                            <div class="panel-change">${formatChange(data.change, higherIsBad)}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        els.statePanel.classList.add('open');
        els.panelOverlay.classList.add('visible');
    }

    function closePanel() {
        els.statePanel.classList.remove('open');
        els.panelOverlay.classList.remove('visible');
    }

    // --- Tooltip ---
    function showTooltip(e, stateCode) {
        const stateData = DATA.states[stateCode];
        if (!stateData) return;

        const indicator = APP_STATE.currentIndicator;
        const value = stateData[indicator]?.value;

        els.tooltipState.textContent = stateData.name;
        els.tooltipValue.textContent = formatValue(value, indicator);
        els.tooltip.classList.add('visible');
        moveTooltip(e);
    }

    function hideTooltip() {
        els.tooltip.classList.remove('visible');
    }

    function moveTooltip(e) {
        els.tooltip.style.left = (e.clientX + 15) + 'px';
        els.tooltip.style.top = (e.clientY + 15) + 'px';
    }

    // --- Chart ---
    function initChart() {
        if (!els.trendChart || typeof Chart === 'undefined') return;

        const ctx = els.trendChart.getContext('2d');
        APP_STATE.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2020', '2021', '2022', '2023', '2024'],
                datasets: [{
                    label: 'Food Insecurity Rate (%)',
                    data: [10.5, 13.5, 12.8, 13.3, 13.5],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }

    function updateChart() {
        if (!APP_STATE.chartInstance) return;

        const indicator = els.chartIndicator?.value || 'food_insecurity';
        const labels = {
            food_insecurity: 'Food Insecurity Rate (%)',
            snap_participation: 'SNAP Participation Rate (%)',
            food_desert: 'Food Desert Population (%)',
            snap_benefit: 'Avg Monthly SNAP Benefit ($)',
            grocery_access: 'Supermarkets per 10K'
        };

        // Simulated trend data
        const trendData = {
            food_insecurity: [10.5, 13.5, 12.8, 13.3, 13.5],
            snap_participation: [11.8, 14.2, 13.5, 12.8, 12.3],
            food_desert: [6.8, 6.5, 6.3, 6.2, 6.1],
            snap_benefit: [125, 234, 281, 202, 187],
            grocery_access: [2.2, 2.3, 2.3, 2.4, 2.4]
        };

        APP_STATE.chartInstance.data.datasets[0].label = labels[indicator];
        APP_STATE.chartInstance.data.datasets[0].data = trendData[indicator] || trendData.food_insecurity;
        APP_STATE.chartInstance.update();
    }

    // --- Rankings ---
    let currentPage = 1;
    const itemsPerPage = 10;

    function initRankings() {
        updateRankingsTable();
    }

    function updateRankingsTable() {
        if (!els.rankingsBody) return;

        const indicator = APP_STATE.currentIndicator;
        const higherIsBad = indicator !== 'snap_benefit' && indicator !== 'grocery_access';

        // Sort states by current indicator
        const sorted = Object.entries(DATA.states)
            .map(([code, data]) => ({ code, ...data }))
            .sort((a, b) => {
                const aVal = a[indicator]?.value || 0;
                const bVal = b[indicator]?.value || 0;
                return higherIsBad ? bVal - aVal : aVal - bVal;
            });

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = sorted.slice(start, end);

        els.rankingsBody.innerHTML = pageData.map((state, i) => `
            <tr>
                <td><span class="rank-badge">${start + i + 1}</span></td>
                <td>${state.name}</td>
                <td>${formatValue(state.food_insecurity?.value, 'food_insecurity')}</td>
                <td>${formatValue(state.snap_participation?.value, 'snap_participation')}</td>
                <td>${formatValue(state.food_desert?.value, 'food_desert')}</td>
                <td>${formatValue(state.snap_benefit?.value, 'snap_benefit')}</td>
            </tr>
        `).join('');

        // Update pagination
        if (els.pageStart) els.pageStart.textContent = start + 1;
        if (els.pageEnd) els.pageEnd.textContent = Math.min(end, sorted.length);
        if (els.prevBtn) els.prevBtn.disabled = currentPage === 1;
        if (els.nextBtn) els.nextBtn.disabled = end >= sorted.length;
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Toggle buttons
        els.toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                els.toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                APP_STATE.currentIndicator = btn.dataset.indicator;
                updateMapView(APP_STATE.currentIndicator);
                updateRankingsTable();
            });
        });

        // Summary cards (clickable indicators)
        els.summaryCards.forEach(card => {
            card.addEventListener('click', () => {
                const indicator = card.dataset.indicator;
                if (indicator) {
                    els.toggleBtns.forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.indicator === indicator);
                    });
                    APP_STATE.currentIndicator = indicator;
                    updateMapView(indicator);
                    updateRankingsTable();
                }
            });
        });

        // Panel close
        if (els.panelClose) els.panelClose.addEventListener('click', closePanel);
        if (els.panelOverlay) els.panelOverlay.addEventListener('click', closePanel);

        // Pagination
        if (els.prevBtn) {
            els.prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateRankingsTable();
                }
            });
        }
        if (els.nextBtn) {
            els.nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(Object.keys(DATA.states).length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updateRankingsTable();
                }
            });
        }

        // Chart controls
        if (els.chartIndicator) {
            els.chartIndicator.addEventListener('change', updateChart);
        }

        // Download buttons
        if (els.downloadCsv) {
            els.downloadCsv.addEventListener('click', () => {
                const headers = ['State', 'Food Insecurity %', 'SNAP Participation %', 'Food Desert %', 'Avg SNAP Benefit', 'Grocery Access'];
                const rows = Object.values(DATA.states).map(s => [
                    s.name,
                    s.food_insecurity?.value,
                    s.snap_participation?.value,
                    s.food_desert?.value,
                    s.snap_benefit?.value,
                    s.grocery_access?.value
                ]);
                const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                downloadFile(csv, 'food-security-data.csv', 'text/csv');
            });
        }

        if (els.downloadJson) {
            els.downloadJson.addEventListener('click', () => {
                downloadFile(JSON.stringify(DATA, null, 2), 'food-security-data.json', 'application/json');
            });
        }

        if (els.copyCitation) {
            els.copyCitation.addEventListener('click', () => {
                const citation = `FinMango Food Security Dashboard. (2026). Food Insecurity and SNAP Participation by State. Retrieved from https://finmango.org/food-security.html`;
                navigator.clipboard.writeText(citation).then(() => {
                    els.copyCitation.textContent = '✓ Copied!';
                    setTimeout(() => {
                        els.copyCitation.innerHTML = '<span class="tool-icon">📝</span><span class="tool-label">Copy Citation</span>';
                    }, 2000);
                });
            });
        }
    }

    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Run
    init();
});
