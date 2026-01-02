/**
 * Affordability Lab Map Logic
 * Simplified version of Young Adult Map for Affordability Page
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- State Management ---
    const APP_STATE = {
        currentIndicator: 'financial_stress' // Crisis Index is the default
    };

    // --- DOM Elements ---
    const els = {
        toggleBtns: document.querySelectorAll('.toggle-btn'),
        summaryCards: document.querySelectorAll('.summary-card'),
        usMap: document.getElementById('us-map'),
        tooltip: document.getElementById('state-tooltip'), // Will create these dynamically or expect them in DOM
        panelOverlay: document.getElementById('panel-overlay'),
        statePanel: document.getElementById('state-panel'),
        panelClose: document.getElementById('panel-close'),
        panelStateName: document.getElementById('panel-state-name'),
        panelIndicators: document.getElementById('panel-indicators')
    };

    // Use YOUNG_ADULT_DATA
    const DATA = typeof YOUNG_ADULT_DATA !== 'undefined' ? YOUNG_ADULT_DATA : null;

    // --- Initialization ---
    async function init() {
        await loadMapSVG();

        if (!DATA) {
            console.error('YOUNG_ADULT_DATA not loaded');
            return;
        }

        updateSummaryCards();
        initMapInteraction();
        setupEventListeners();

        updateMapView(APP_STATE.currentIndicator);

        console.log('Affordability Map initialized');
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
        return `<span class="summary-change ${cssClass}">${sign} ${Math.abs(val).toFixed(1)}%</span>`;
    }

    function getColorForValue(value, indicator) {
        const ind = DATA.indicators[indicator];
        if (!ind) return '#ddd';

        const higherIsBad = ind.higherIsBad !== false;

        // "Pessimistic" Coloring Logic:
        // We artificially tighten the thresholds to show more "Red/Orange" 
        // effectively grading on a harder curve.
        let t = { ...ind.thresholds };

        // Adjust thresholds to be stricter (approx 10-15% stricter)
        if (higherIsBad) {
            // Lower the bar for "Bad" colors
            // e.g. if Low was 30, now it's 27. Anything above 27 isn't green anymore.
            // if High was 40, now it's 36. Anything above 36 is RED.
            t.low = t.low * 0.9;
            t.moderate = t.moderate * 0.9;
            t.elevated = t.elevated * 0.95;
        } else {
            // For income (Higher is good), Raise the bar for "Good" colors
            // e.g. if Low was 50k, now it's 55k. You need 55k to be green.
            t.low = t.low * 1.1;
            t.moderate = t.moderate * 1.1;
            t.elevated = t.elevated * 1.05;
        }

        if (higherIsBad) {
            if (value < t.low) return '#10B981'; // Green
            if (value < t.moderate) return '#F59E0B'; // Yellow
            if (value < t.elevated) return '#F97316'; // Orange
            return '#EF4444'; // Red
        } else {
            // For income, higher is better
            if (value > t.low) return '#10B981';
            if (value > t.moderate) return '#F59E0B';
            if (value > t.elevated) return '#F97316';
            return '#EF4444';
        }
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
        // Try to load from global constant first (file:// protocol fix)
        if (typeof MAP_SVG_CONTENT !== 'undefined') {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(MAP_SVG_CONTENT, 'image/svg+xml');
            const svgEl = svgDoc.querySelector('svg');
            if (svgEl) {
                // Transfer attributes if needed, or just replace innerHTML
                // We want to keep the viewBox if it exists in HTML, or take from SVG
                if (!els.usMap.getAttribute('viewBox')) {
                    els.usMap.setAttribute('viewBox', svgEl.getAttribute('viewBox'));
                }
                els.usMap.innerHTML = svgEl.innerHTML;

                // Add IDs
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
            { key: 'student_debt', label: 'Average Student Debt' },
            { key: 'auto_debt', label: 'Average Auto Loan' },
            { key: 'rent_burden', label: 'Rent Burden (% of Income)' },
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
        const label = DATA.indicators[APP_STATE.currentIndicator]?.name || APP_STATE.currentIndicator;
        els.tooltip.querySelector('.tooltip-value').textContent = `${label}: ${formatValue(val, APP_STATE.currentIndicator)}`;
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

        // Form handled independently now
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
        const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';

        if (submitBtn) {
            submitBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const name = document.getElementById('suggestName').value;
                const email = document.getElementById('suggestEmail').value;
                const problem = document.getElementById('suggestProblem').value;
                const why = document.getElementById('suggestWhy').value;

                if (!name || !email || !problem) {
                    alert('Please fill in at least Name, Email, and the Problem description.');
                    return;
                }

                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Submitting...';
                submitBtn.disabled = true;

                const formData = { name, email, problem, why };

                try {
                    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
                        console.warn('Google Script URL not set. Simulating success.');
                        await new Promise(r => setTimeout(r, 1500));
                        alert('Form ready! To save data, please deploy the Google Apps Script and paste the URL in scripts/affordability-map.js');
                    } else {
                        await fetch(GOOGLE_SCRIPT_URL, {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(formData)
                        });
                        alert('Suggestion submitted successfully! Thank you.');
                    }

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
