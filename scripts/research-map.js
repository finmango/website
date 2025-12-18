/**
 * Research Map Preview Script
 * Handles the loading and interactivity of the US Map on the Research page.
 * Depends on dashboard-data.js being loaded first.
 */

(async function () {
    // Configuration
    const CONFIG = {
        mapContainerId: 'barometer-preview-map',
        tooltipId: 'preview-tooltip',
        tooltipStateId: 'tooltip-state',
        tooltipValueId: 'tooltip-value',
        svgUrl: 'us-map-v2.svg'
    };

    let currentIndicator = 'financial_anxiety';

    // State Mapping (should match DASHBOARD_DATA keys if possible, or use lookup)
    // DASHBOARD_DATA uses 'US-XX' keys.

    // Helpers
    function getColorForValue(val) {
        if (val < 90) return '#10B981'; // Green
        if (val < 120) return '#F59E0B'; // Yellow/Orange
        if (val < 150) return '#F97316'; // Orange
        return '#EF4444'; // Red
    }

    async function loadMap() {
        let container = document.getElementById(CONFIG.mapContainerId);
        if (!container) return;

        let svgText = null;

        // 1. Try Inlined Content (Review Rescue)
        if (typeof MAP_SVG_CONTENT !== 'undefined') {
            svgText = MAP_SVG_CONTENT;
        }

        // 2. Fallback to network fetch if inline missing (Legacy)
        if (!svgText) {
            try {
                const response = await fetch(CONFIG.svgUrl);
                if (response.ok) svgText = await response.text();
            } catch (e) { console.log('Fetch failed', e); }
        }

        // 3. Process and Inject
        if (svgText && svgText.includes('<svg')) {
            try {
                // Trim whitespace to ensure valid XML start
                svgText = svgText.trim();

                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const newSvg = svgDoc.querySelector('svg');

                if (newSvg && !newSvg.querySelector('parsererror')) {
                    // Start Rescue Mode: Replace the container entirely to ensure clean state
                    newSvg.id = CONFIG.mapContainerId;

                    // Basic styling to match original
                    newSvg.style.width = '100%';
                    newSvg.style.height = 'auto';
                    newSvg.style.maxHeight = '60vh';
                    newSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                    // Replace in DOM
                    container.replaceWith(newSvg);

                    // Refresh reference
                    container = document.getElementById(CONFIG.mapContainerId);

                    // Ensure IDs are correct for data lookup (Data-ID -> ID)
                    container.querySelectorAll('path[data-id]').forEach(path => {
                        const stateAbbr = path.getAttribute('data-id');
                        if (stateAbbr) {
                            path.id = 'US-' + stateAbbr.toUpperCase();
                        }
                    });

                    initMapInteractivity();
                    updateMapColors(currentIndicator);
                    return;
                } else {
                    console.error('Parsed SVG is invalid or contains parsererror');
                    throw new Error('SVG Parsing Failed');
                }
            } catch (e) {
                console.error('Map loading error:', e);
                container.innerHTML = `<div style="color:red; padding:1rem;">Map Error: ${e.message}</div>`;
            }
        }

        // Final Fallback: Mock Map
        console.warn('Could not load US map SVG, using fallback grid');
        if (container && !container.querySelector('path')) {
            const states = Object.keys(DASHBOARD_DATA.states || {});
            let svgContent = '';
            states.forEach((stateCode, i) => {
                const row = Math.floor(i / 10);
                const col = i % 10;
                svgContent += `<path id="${stateCode}" d="M${col * 90 + 10},${row * 60 + 10} h70 v40 h-70 Z" fill="#ddd" stroke="white" data-state="${stateCode}" />`;
                svgContent += `<text x="${col * 90 + 45}" y="${row * 60 + 35}" text-anchor="middle" font-size="12" pointer-events="none">${stateCode.replace('US-', '')}</text>`;
            });
            container.innerHTML = svgContent;
            initMapInteractivity();
            updateMapColors(currentIndicator);
        }
    }

    function initMapInteractivity() {
        const container = document.getElementById(CONFIG.mapContainerId);
        const tooltip = document.getElementById(CONFIG.tooltipId);
        const tooltipState = document.getElementById(CONFIG.tooltipStateId);
        const tooltipValue = document.getElementById(CONFIG.tooltipValueId);

        if (!container) return;

        // Ensure paths have correct base styles and event listeners
        // We select by 'path' to include both SVG paths and fallback paths
        container.querySelectorAll('path').forEach(path => {
            // Base Styles
            path.style.stroke = '#fff';
            path.style.strokeWidth = '1.5';
            path.style.cursor = 'pointer';
            path.style.transition = 'all 0.25s ease';

            // Events
            path.addEventListener('mouseenter', (e) => {
                const stateCode = path.id; // Should be US-XX
                const stateData = DASHBOARD_DATA.states[stateCode];
                if (!stateData) return;

                path.style.opacity = '0.85';
                path.style.strokeWidth = '2';
                path.style.filter = 'brightness(1.1)';

                // Update Tooltip
                if (tooltip && tooltipState && tooltipValue) {
                    const indicatorData = stateData[currentIndicator];
                    tooltipState.textContent = stateData.name;
                    tooltipValue.textContent = indicatorData ? `Score: ${indicatorData.value.toFixed(1)}` : 'No Data';
                    tooltip.style.opacity = '1';
                }
            });

            path.addEventListener('mousemove', (e) => {
                if (tooltip) {
                    tooltip.style.left = (e.clientX + 15) + 'px';
                    tooltip.style.top = (e.clientY + 15) + 'px';
                }
            });

            path.addEventListener('mouseleave', () => {
                path.style.opacity = '1';
                path.style.strokeWidth = '1.5';
                path.style.filter = 'none';
                if (tooltip) tooltip.style.opacity = '0';
            });

            path.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = 'barometer.html';
            });
        });
    }

    function updateMapColors(indicator) {
        const container = document.getElementById(CONFIG.mapContainerId);
        if (!container) return;

        container.querySelectorAll('path').forEach(path => {
            const stateCode = path.id;
            const stateData = DASHBOARD_DATA.states[stateCode];

            if (stateData && stateData[indicator]) {
                path.style.fill = getColorForValue(stateData[indicator].value);
            } else {
                path.style.fill = '#e5e7eb'; // Default gray
            }
        });
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        // Check for Data
        if (typeof DASHBOARD_DATA === 'undefined') {
            console.error('DASHBOARD_DATA not loaded for Research Map');
            const container = document.getElementById(CONFIG.mapContainerId);
            if (container) container.innerHTML = '<div style="padding: 2rem; text-align:center; color: #EF4444;">Error: Data could not be loaded. Please refresh.</div>';
            return;
        }

        // Load the map
        loadMap();

        // Indicator Tabs Setup
        document.querySelectorAll('.indicator-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Reset active state
                document.querySelectorAll('.indicator-tab').forEach(t => {
                    t.style.background = 'white';
                    t.style.color = 'var(--black)';
                    t.classList.remove('active');
                });

                // Set new active
                tab.style.background = 'var(--orange)';
                tab.style.color = 'white';
                tab.classList.add('active');

                // Update map
                currentIndicator = tab.dataset.indicator;
                updateMapColors(currentIndicator);
            });
        });
    });

})();
