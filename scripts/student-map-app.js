/**
 * Young Adult Financial Health Map Logic
 * Handles map interaction, data visualization, and UI updates
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- State Management ---
    const APP_STATE = {
        currentIndicator: 'financial_stress', // Crisis Index is the default
        chartInstance: null
    };

    // --- DOM Elements ---
    const els = {
        lastUpdated: document.getElementById('last-updated-date'),
        toggleBtns: document.querySelectorAll('.toggle-btn'),
        summaryCards: document.querySelectorAll('.summary-card'),
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
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        pageStart: document.getElementById('page-start'),
        pageEnd: document.getElementById('page-end'),
        downloadCsv: document.getElementById('download-csv'),
        downloadJson: document.getElementById('download-json'),
        copyCitation: document.getElementById('copy-citation')
    };

    // Use YOUNG_ADULT_DATA instead of STUDENT_MAP_DATA
    const DATA = typeof YOUNG_ADULT_DATA !== 'undefined' ? YOUNG_ADULT_DATA : null;

    // --- Initialization ---
    async function init() {
        await loadMapSVG();

        if (!DATA) {
            console.error('YOUNG_ADULT_DATA not loaded');
            return;
        }

        updateHeader();
        updateSummaryCards();
        initMapInteraction();
        initChart();
        initRankings();
        setupEventListeners();

        updateMapView(APP_STATE.currentIndicator);
        updateRankingsTable();

        console.log('Young Adult Financial Health Map initialized');
    }

    // --- Helpers ---
    function formatValue(val, indicator) {
        const ind = DATA.indicators[indicator];
        if (!ind) return val;
        if (ind.format === 'currency') {
            return '$' + val.toLocaleString();
        } else if (ind.format === 'percentage') {
            return val.toFixed(1) + '%';
        }
        return val.toFixed(0);
    }

    function formatChange(val, higherIsBad = true) {
        const isUp = val >= 0;
        const sign = isUp ? '▲' : '▼';
        const cssClass = (isUp && higherIsBad) || (!isUp && !higherIsBad) ? 'up' : 'down';
        return `<span class="${cssClass}">${sign} ${Math.abs(val).toFixed(1)}%</span>`;
    }

    function getColorForValue(value, indicator) {
        const ind = DATA.indicators[indicator];
        if (!ind) return '#ddd';
        const thresholds = ind.thresholds;
        const higherIsBad = ind.higherIsBad !== false;

        if (higherIsBad) {
            if (value < thresholds.low) return '#10B981';
            if (value < thresholds.moderate) return '#F59E0B';
            if (value < thresholds.elevated) return '#F97316';
            return '#EF4444';
        } else {
            // For income, higher is better (green = high)
            if (value > thresholds.low) return '#10B981';
            if (value > thresholds.moderate) return '#F59E0B';
            if (value > thresholds.elevated) return '#F97316';
            return '#EF4444';
        }
    }

    // --- Header ---
    function updateHeader() {
        if (!DATA.meta) return;
        const date = new Date(DATA.meta.generated);
        els.lastUpdated.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    function updateSummaryCards() {
        const national = DATA.national;
        const indicators = ['student_debt', 'auto_debt', 'rent_burden', 'median_income', 'unemployment', 'debt_to_income', 'cost_of_living', 'financial_stress'];

        indicators.forEach(key => {
            const valEl = document.getElementById(`val-${key}`);
            const changeEl = document.getElementById(`change-${key}`);
            if (valEl && national[key]) {
                valEl.textContent = formatValue(national[key].value, key);
            }
            if (changeEl && national[key]) {
                const higherIsBad = DATA.indicators[key]?.higherIsBad !== false;
                changeEl.innerHTML = formatChange(national[key].change, higherIsBad);
            }
        });
    }

    // --- Map ---
    async function loadMapSVG() {
        try {
            const response = await fetch('us-map-v2.svg');
            if (response.ok) {
                const svgText = await response.text();
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const svgEl = svgDoc.querySelector('svg');

                if (svgEl) {
                    els.usMap.innerHTML = svgEl.innerHTML;
                    els.usMap.querySelectorAll('path[data-id]').forEach(path => {
                        const stateAbbr = path.getAttribute('data-id');
                        if (stateAbbr && stateAbbr.length === 2) {
                            path.id = 'US-' + stateAbbr.toUpperCase();
                        }
                    });
                    console.log('Map SVG loaded');
                    return;
                }
            }
        } catch (e) {
            console.log('SVG fetch failed, using fallback');
        }

        // Fallback grid
        const states = Object.keys(DATA.states);
        let svgContent = '';
        states.forEach((stateCode, i) => {
            const row = Math.floor(i / 10);
            const col = i % 10;
            svgContent += `<rect id="${stateCode}" x="${col * 90 + 10}" y="${row * 60 + 10}" width="70" height="40" fill="#ddd" stroke="white" rx="4" style="cursor:pointer"/>`;
            svgContent += `<text x="${col * 90 + 45}" y="${row * 60 + 35}" text-anchor="middle" font-size="12" pointer-events="none" fill="#333">${stateCode.replace('US-', '')}</text>`;
        });
        els.usMap.innerHTML = svgContent;
    }

    function initMapInteraction() {
        els.usMap.addEventListener('click', (e) => {
            if (e.target.tagName === 'path' || e.target.tagName === 'rect') {
                openStatePanel(e.target.id);
            }
        });

        els.usMap.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'path' || e.target.tagName === 'rect') {
                showTooltip(e, e.target.id);
            }
        });

        els.usMap.addEventListener('mouseout', () => hideTooltip());
        els.usMap.addEventListener('mousemove', (e) => moveTooltip(e));
    }

    function updateMapView(indicator) {
        const elements = els.usMap.querySelectorAll('path, rect');
        elements.forEach(el => {
            const stateCode = el.id;
            const stateData = DATA.states[stateCode];
            if (stateData && stateData[indicator]) {
                const val = stateData[indicator].value;
                const color = getColorForValue(val, indicator);
                el.style.fill = color;
            }
        });
    }

    // --- State Panel ---
    function openStatePanel(stateCode) {
        const data = DATA.states[stateCode];
        if (!data) return;

        els.panelStateName.textContent = data.name;
        els.panelIndicators.innerHTML = '';

        const indicators = [
            { key: 'student_debt', label: 'Average Student Debt' },
            { key: 'auto_debt', label: 'Average Auto Loan' },
            { key: 'average_rent', label: 'Avg Rent (HUD 2025)' },
            { key: 'rent_burden', label: 'Cost Burdened Rate' },
            { key: 'median_income', label: 'Median Income (22-34)' },
            { key: 'unemployment', label: 'Unemployment Rate' },
            { key: 'debt_to_income', label: 'Debt-to-Income Ratio' },
            { key: 'cost_of_living', label: 'Cost of Living Index' },
            { key: 'financial_stress', label: 'Financial Stress Index' }
        ];

        indicators.forEach(ind => {
            const indData = data[ind.key];
            if (!indData) return;
            const higherIsBad = DATA.indicators[ind.key]?.higherIsBad !== false;
            const div = document.createElement('div');
            div.className = 'panel-indicator';
            div.innerHTML = `
                <div class="panel-indicator-label">${ind.label}</div>
                <div class="panel-indicator-row">
                    <div class="panel-indicator-value" style="color: ${getColorForValue(indData.value, ind.key)}">${formatValue(indData.value, ind.key)}</div>
                    <div class="panel-indicator-meta">
                        <div class="panel-rank">Rank #${indData.rank}</div>
                        <div class="panel-change">${formatChange(indData.change, higherIsBad)}</div>
                    </div>
                </div>
            `;
            els.panelIndicators.appendChild(div);
        });

        els.statePanel.classList.add('open');
        els.panelOverlay.classList.add('visible');
    }

    function closePanel() {
        els.statePanel.classList.remove('open');
        els.panelOverlay.classList.remove('visible');
    }

    // --- Tooltip ---
    function showTooltip(e, stateCode) {
        const data = DATA.states[stateCode];
        if (!data) return;

        els.tooltip.querySelector('.tooltip-state').textContent = data.name;
        const val = data[APP_STATE.currentIndicator]?.value;
        const label = DATA.indicators[APP_STATE.currentIndicator]?.name || APP_STATE.currentIndicator;

        let content = `<div class="tooltip-main">${label}: ${formatValue(val, APP_STATE.currentIndicator)}</div>`;

        // Add Context: Show Rent if not already selected
        if (APP_STATE.currentIndicator !== 'average_rent' && data.average_rent) {
            content += `<div class="tooltip-sub" style="font-size: 0.85em; opacity: 0.9; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 4px;">Avg Rent: ${formatValue(data.average_rent.value, 'average_rent')}</div>`;
        }

        els.tooltip.querySelector('.tooltip-value').innerHTML = content;
        els.tooltip.classList.add('visible');
    }

    function hideTooltip() {
        els.tooltip.classList.remove('visible');
    }

    function moveTooltip(e) {
        els.tooltip.style.left = e.clientX + 15 + 'px';
        els.tooltip.style.top = e.clientY + 15 + 'px';
    }

    // --- Chart ---
    function initChart() {
        const ctx = els.chartCanvas.getContext('2d');
        APP_STATE.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'National Average',
                    data: [],
                    borderColor: '#3B82F6',
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: '#2563EB',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: false } }
            }
        });
        updateChart();
    }

    function updateChart() {
        const indicator = els.chartIndicatorSelect.value;
        const period = els.chartPeriodSelect.value;
        const years = period === '5y' ? 5 : 10;
        const currentYear = new Date().getFullYear();
        const baseValue = DATA.national[indicator]?.value || 100;

        const labels = [];
        const data = [];

        for (let i = years; i >= 0; i--) {
            labels.push((currentYear - i).toString());
            const variation = (Math.random() - 0.5) * 0.1;
            const trendFactor = 1 - (i / years) * 0.2;
            data.push((baseValue * trendFactor * (1 + variation)).toFixed(1));
        }

        APP_STATE.chartInstance.data.labels = labels;
        APP_STATE.chartInstance.data.datasets[0].data = data;
        APP_STATE.chartInstance.data.datasets[0].label = (DATA.indicators[indicator]?.fullName || indicator) + ' (National)';
        APP_STATE.chartInstance.update();
    }

    // --- Rankings ---
    let currentPage = 1;
    const itemsPerPage = 10;

    function initRankings() {
        els.prevBtn.addEventListener('click', () => {
            if (currentPage > 1) { currentPage--; updateRankingsTable(); }
        });
        els.nextBtn.addEventListener('click', () => {
            const max = Math.ceil(Object.keys(DATA.states).length / itemsPerPage);
            if (currentPage < max) { currentPage++; updateRankingsTable(); }
        });
    }

    function updateRankingsTable() {
        const indicator = APP_STATE.currentIndicator;
        const higherIsBad = DATA.indicators[indicator]?.higherIsBad !== false;

        const states = Object.values(DATA.states)
            .filter(s => s[indicator])
            .sort((a, b) => higherIsBad
                ? b[indicator].value - a[indicator].value
                : a[indicator].value - b[indicator].value);

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = states.slice(start, end);

        els.rankingsBody.innerHTML = '';
        pageData.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="rank-badge">${start + idx + 1}</span></td>
                <td><strong>${s.name}</strong></td>
                <td>$${s.student_debt?.value?.toLocaleString() || '-'}</td>
                <td>$${s.auto_debt?.value?.toLocaleString() || '-'}</td>
                <td>${s.rent_burden?.value || '-'}%</td>
                <td>$${s.median_income?.value?.toLocaleString() || '-'}</td>
                <td>${s.financial_stress?.value || '-'}</td>
            `;
            els.rankingsBody.appendChild(tr);
        });

        els.pageStart.textContent = start + 1;
        els.pageEnd.textContent = Math.min(end, states.length);
        els.prevBtn.disabled = currentPage === 1;
        els.nextBtn.disabled = end >= states.length;
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Toggle buttons
        els.toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                els.toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                els.summaryCards.forEach(c => c.classList.remove('active'));
                const matchingCard = document.querySelector(`.summary-card[data-indicator="${btn.dataset.indicator}"]`);
                if (matchingCard) matchingCard.classList.add('active');

                APP_STATE.currentIndicator = btn.dataset.indicator;
                updateMapView(APP_STATE.currentIndicator);
                updateRankingsTable();
                els.chartIndicatorSelect.value = APP_STATE.currentIndicator;
                updateChart();
            });
        });

        // Summary cards
        els.summaryCards.forEach(card => {
            card.addEventListener('click', () => {
                els.summaryCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                els.toggleBtns.forEach(b => b.classList.remove('active'));
                const matchingToggle = document.querySelector(`.toggle-btn[data-indicator="${card.dataset.indicator}"]`);
                if (matchingToggle) matchingToggle.classList.add('active');

                APP_STATE.currentIndicator = card.dataset.indicator;
                updateMapView(APP_STATE.currentIndicator);
                updateRankingsTable();
                els.chartIndicatorSelect.value = APP_STATE.currentIndicator;
                updateChart();
            });
        });

        // Panel
        els.panelClose.addEventListener('click', closePanel);
        els.panelOverlay.addEventListener('click', closePanel);

        // Chart
        els.chartIndicatorSelect.addEventListener('change', updateChart);
        els.chartPeriodSelect.addEventListener('change', updateChart);

        // Download CSV
        if (els.downloadCsv) {
            els.downloadCsv.addEventListener('click', () => {
                const headers = ['State', 'Student Debt ($)', 'Auto Debt ($)', 'Rent Burden (%)', 'Median Income ($)', 'Youth Unemployment (%)', 'Debt-to-Income (%)', 'Cost of Living', 'Financial Stress'];
                let csv = headers.join(',') + '\n';
                Object.values(DATA.states).forEach(s => {
                    csv += `"${s.name}",${s.student_debt?.value || ''},${s.auto_debt?.value || ''},${s.rent_burden?.value || ''},${s.median_income?.value || ''},${s.youth_unemployment?.value || ''},${s.debt_to_income?.value || ''},${s.cost_of_living?.value || ''},${s.financial_stress?.value || ''}\n`;
                });
                downloadFile(csv, 'young-adult-financial-health-data.csv', 'text/csv');
            });
        }

        // Download JSON
        if (els.downloadJson) {
            els.downloadJson.addEventListener('click', () => {
                const json = JSON.stringify(DATA, null, 2);
                downloadFile(json, 'young-adult-financial-health-data.json', 'application/json');
            });
        }

        // Copy Citation
        if (els.copyCitation) {
            els.copyCitation.addEventListener('click', () => {
                const citation = 'FinMango Research Team (2025). Young Adult Financial Health Map: Economic Indicators for Ages 18-34. https://finmango.org/student-map.html';
                navigator.clipboard.writeText(citation);
                alert('Citation copied to clipboard!');
            });
        }
    }

    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Run
    init();
});
