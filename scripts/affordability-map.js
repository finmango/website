/**
 * Affordability Lab Map Logic
 * Adapted to use Financial Health Barometer Data (dashboard-data.js)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- State Management ---
    const APP_STATE = {
        currentIndicator: 'financial_anxiety' // Default to Financial Anxiety
    };

    // --- DOM Elements ---
    const els = {
        toggleBtns: document.querySelectorAll('.toggle-btn'),
        summaryCards: document.querySelectorAll('.summary-card'),
        usMap: document.getElementById('us-map'),
        tooltip: document.getElementById('state-tooltip'),
        panelOverlay: document.getElementById('panel-overlay'),
        statePanel: document.getElementById('state-panel'),
        panelClose: document.getElementById('panel-close'),
        panelStateName: document.getElementById('panel-state-name'),
        panelIndicators: document.getElementById('panel-indicators')
    };

    let DATA = null;

    // --- Initialization ---
    async function init() {
        await loadMapSVG();

        // Robust Wait for Data
        try {
            await waitForData();
            DATA = typeof DASHBOARD_DATA !== 'undefined' ? DASHBOARD_DATA : window.DASHBOARD_DATA;
        } catch (e) {
            console.error('Data load timed out:', e);
            // Show error state on UI?
            return;
        }

        updateSummaryCards();
        initMapInteraction();
        setupEventListeners();

        updateMapView(APP_STATE.currentIndicator);

        console.log('Affordability Map initialized with Barometer Data');
    }

    function waitForData() {
        return new Promise((resolve, reject) => {
            if (typeof DASHBOARD_DATA !== 'undefined' || window.DASHBOARD_DATA) {
                return resolve();
            }

            console.log('Waiting for DASHBOARD_DATA...');
            let retries = 0;
            const maxRetries = 50; // 5 seconds total
            const interval = setInterval(() => {
                retries++;
                if (typeof DASHBOARD_DATA !== 'undefined' || window.DASHBOARD_DATA) {
                    clearInterval(interval);
                    resolve();
                } else if (retries >= maxRetries) {
                    clearInterval(interval);
                    reject(new Error('DASHBOARD_DATA not found after 5s'));
                }
            }, 100);
        });
    }

    // --- Helpers ---
    function formatValue(val) {
        // Barometer data is an index, usually 80-180 range
        return val.toFixed(1);
    }

    function formatChange(val) {
        const isUp = val >= 0;
        const sign = isUp ? '▲' : '▼';
        // For stress metrics, Up is "Red" (Bad), Down is "Green" (Good)
        // Since we don't have a "higherIsBad" config in dashboard-data per se, 
        // we assume all these stress indexes are negative if high.
        const cssClass = isUp ? 'up' : 'down';
        // Note: CSS might need adjustment if 'up' is green. 
        // Usually .summary-change.up { color: red } for bad things.
        // Let's check CSS: .up { color: var(--red) } in index.html, check local CSS too.
        // In affordability-lab.html: .summary-change.up { color: var(--red); }

        return `<span class="summary-change ${cssClass}">${sign} ${Math.abs(val).toFixed(1)}%</span>`;
    }

    function getColorForValue(value, indicator) {
        // Standardized Scale from dashboard-app.js
        if (value < 90) return '#10B981'; // Green
        if (value < 120) return '#F59E0B'; // Yellow
        if (value < 150) return '#F97316'; // Orange
        return '#EF4444'; // Red
    }

    function updateSummaryCards() {
        const national = DATA.national;
        const indicators = ['financial_anxiety', 'food_insecurity', 'housing_stress', 'affordability'];

        indicators.forEach(key => {
            const valEl = document.getElementById(`val-${key}`);
            const changeEl = document.getElementById(`change-${key}`);

            if (valEl && national[key]) {
                valEl.textContent = formatValue(national[key].value);
            }
            if (changeEl && national[key]) {
                changeEl.innerHTML = formatChange(national[key].change);
            }
        });
    }

    // --- Map ---
    async function loadMapSVG() {
        // Try to load from global constant first (file:// protocol fix)
        if (typeof MAP_SVG_CONTENT !== 'undefined') {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(MAP_SVG_CONTENT, 'image/svg+xml');
            const svgEl = svgDoc.querySelector('svg');
            if (svgEl) {
                if (!els.usMap.getAttribute('viewBox')) {
                    els.usMap.setAttribute('viewBox', svgEl.getAttribute('viewBox'));
                }
                els.usMap.innerHTML = svgEl.innerHTML;
                els.usMap.querySelectorAll('path[data-id]').forEach(path => {
                    const stateAbbr = path.getAttribute('data-id');
                    if (stateAbbr && stateAbbr.length === 2) {
                        path.id = 'US-' + stateAbbr.toUpperCase();
                    }
                });
                return;
            }
        }

        // Fallback to fetch
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
                    return;
                }
            }
        } catch (e) {
            console.log('SVG load failed', e);
        }

        // Final Fallback: Squares
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
        if (!els.usMap) return;

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
        if (!els.usMap) return;
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
        if (!data || !els.statePanel) return;

        els.panelStateName.textContent = data.name;
        els.panelIndicators.innerHTML = '';

        const indicators = [
            { key: 'financial_anxiety', label: 'Financial Anxiety' },
            { key: 'food_insecurity', label: 'Food Insecurity' },
            { key: 'housing_stress', label: 'Housing Stress' },
            { key: 'affordability', label: 'Affordability' }
        ];

        indicators.forEach(ind => {
            const indData = data[ind.key];
            if (!indData) return;

            const div = document.createElement('div');
            div.className = 'panel-indicator';
            div.innerHTML = `
                <div class="panel-indicator-label">${ind.label}</div>
                <div class="panel-indicator-row">
                    <div class="panel-indicator-value" style="color: ${getColorForValue(indData.value, ind.key)}">${formatValue(indData.value)}</div>
                    <div class="panel-indicator-meta">
                        <div class="panel-rank">Rank #${indData.rank}</div>
                        <div class="panel-change">${formatChange(indData.change)}</div>
                    </div>
                </div>
            `;
            els.panelIndicators.appendChild(div);
        });

        els.statePanel.classList.add('open');
        if (els.panelOverlay) els.panelOverlay.classList.add('visible');
    }

    function closePanel() {
        if (els.statePanel) els.statePanel.classList.remove('open');
        if (els.panelOverlay) els.panelOverlay.classList.remove('visible');
    }

    // --- Tooltip ---
    function showTooltip(e, stateCode) {
        if (!els.tooltip) return;
        const data = DATA.states[stateCode];
        if (!data) return;

        els.tooltip.querySelector('.tooltip-state').textContent = data.name;
        const val = data[APP_STATE.currentIndicator]?.value;
        const label = APP_STATE.currentIndicator.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

        els.tooltip.querySelector('.tooltip-value').textContent = `${label}: ${formatValue(val)}`;
        els.tooltip.classList.add('visible');
    }

    function hideTooltip() {
        if (els.tooltip) els.tooltip.classList.remove('visible');
    }

    function moveTooltip(e) {
        if (!els.tooltip) return;
        els.tooltip.style.left = e.clientX + 15 + 'px';
        els.tooltip.style.top = e.clientY + 15 + 'px';
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
            });
        });

        // Panel
        if (els.panelClose) els.panelClose.addEventListener('click', closePanel);
        if (els.panelOverlay) els.panelOverlay.addEventListener('click', closePanel);
    }

    function initModalAndForm() {
        const modal = document.getElementById('suggestion-modal-overlay');
        const openBtn = document.getElementById('open-suggestion-modal');
        const closeBtn = document.getElementById('close-suggestion-modal');

        // Modal Logic
        function openModal() {
            if (modal) {
                modal.classList.add('visible');
                document.body.style.overflow = 'hidden';
            }
        }

        function closeModal() {
            if (modal) {
                modal.classList.remove('visible');
                document.body.style.overflow = '';
            }
        }

        if (openBtn) openBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('visible')) closeModal();
            });
        }

        // Form Submission Logic
        const submitBtn = document.querySelector('.suggestion-form-modal .btn-submit');

        if (submitBtn) {
            submitBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const name = document.getElementById('suggestName').value;
                const email = document.getElementById('suggestEmail').value;
                const problem = document.getElementById('suggestProblem').value;

                if (!name || !email || !problem) {
                    alert('Please fill in at least Name, Email, and the Problem description.');
                    return;
                }

                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Submitting...';
                submitBtn.disabled = true;

                try {
                    // Simulation
                    await new Promise(r => setTimeout(r, 1500));
                    alert('Suggestion submitted successfully! Thank you for your feedback.');

                    const form = document.querySelector('.suggestion-form-modal');
                    if (form) form.reset();
                    closeModal();

                } catch (err) {
                    console.error('Submission Error:', err);
                    alert('Something went wrong. Please try again.');
                } finally {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }

    // Run
    initModalAndForm();
    init();
});
