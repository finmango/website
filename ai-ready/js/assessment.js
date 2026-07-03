/* ==========================================================================
   AI-Ready Financial Resilience Tool — Assessment Controller
   
   Handles:
   - Multi-step navigation with smooth transitions
   - Form input capture and validation
   - Score calculation (using functions from data.js)
   - Results rendering with animated score displays
   - Social sharing
   ========================================================================== */

(function() {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================
  let currentStep = 0;             // 0 = intro, 1-4 = dimensions, 5 = results
  const totalDimensionSteps = 4;
  
  // User answers, organized by dimension
  const answers = {
    exposure: {},
    cushion: {},
    adaptability: {},
    safety: {}
  };

  // Results (populated after scoring)
  let results = null;

  // Employer cohort mode: assessments opened via an org link (?org=CODE)
  // contribute anonymous scores to that org's aggregate dashboard.
  // See docs/AI-READY-WORKFORCE-SETUP.md. Individuals without a link are
  // unaffected — nothing is ever submitted for them.
  const orgParam = new URLSearchParams(window.location.search).get('org') || '';
  const orgCode = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,39}$/.test(orgParam) ? orgParam.toLowerCase() : '';


  // ============================================================
  // DOM REFERENCES
  // ============================================================
  const stepsContainer = document.getElementById('steps-container');
  const progressFill = document.getElementById('progress-fill');
  const progressSteps = document.querySelectorAll('.progress-bar__step');
  const resultsContainer = document.getElementById('results-container');


  // ============================================================
  // INITIALIZATION
  // ============================================================
  function init() {
    // Set up event delegation for option cards and toggles
    stepsContainer.addEventListener('click', handleStepClick);
    
    // Set up slider listeners and capture their default values
    document.querySelectorAll('input[type="range"]').forEach(slider => {
      slider.addEventListener('input', handleSliderChange);
      // Trigger initial display
      handleSliderChange({ target: slider });
      
      // Also store the default value so we don't need the step to be visible
      const step = slider.closest('.step');
      const dimension = step ? step.dataset.dimension : null;
      const name = slider.name;
      if (dimension && name) {
        answers[dimension][name] = parseInt(slider.value);
      }
    });

    // Set up select listeners
    document.querySelectorAll('.form-select').forEach(select => {
      select.addEventListener('change', handleSelectChange);
    });

    // Cohort mode: tell the user exactly what their employer will (and won't) see
    if (orgCode) showCohortNotice();

    // Show initial step
    showStep(0);
  }

  function showCohortNotice() {
    const wrapper = document.querySelector('.assessment-wrapper');
    if (!wrapper) return;
    const notice = document.createElement('div');
    notice.setAttribute('role', 'note');
    notice.style.cssText = 'max-width:640px;margin:0 auto 1.25rem;padding:0.75rem 1rem;' +
      'background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.3);border-radius:10px;' +
      'font-size:0.85rem;line-height:1.5;color:inherit;';
    notice.innerHTML = '🔒 <strong>You\'re taking this through your organization.</strong> ' +
      'Your results stay anonymous — no name, email, or identifier is collected. Your organization ' +
      'only sees combined scores across everyone who participates, never individual answers.';
    wrapper.insertBefore(notice, wrapper.firstChild);

    // The intro's "No data collected or stored" claim is written for individual
    // mode; in cohort mode anonymous scores ARE stored, so keep the copy honest.
    document.querySelectorAll('.step[data-step="0"] span').forEach(span => {
      if (span.textContent.trim() === 'No data collected or stored') {
        span.textContent = 'Anonymous — scores shared with your org only in aggregate';
      }
    });
  }


  // ============================================================
  // STEP NAVIGATION
  // ============================================================
  function showStep(stepIndex) {
    currentStep = stepIndex;

    // Hide all steps
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    
    // Show target step
    const targetStep = document.querySelector(`.step[data-step="${stepIndex}"]`);
    if (targetStep) {
      targetStep.classList.add('active');
    }

    // Update progress bar
    updateProgress();

    // Scroll to top of step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextStep() {
    if (currentStep < totalDimensionSteps) {
      showStep(currentStep + 1);
    } else if (currentStep === totalDimensionSteps) {
      // Calculate and show results
      calculateAndShowResults();
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  }

  function updateProgress() {
    // Calculate fill percentage (0 at step 0, 100% at step 4)
    const pct = currentStep === 0 ? 0 : (currentStep / totalDimensionSteps) * 100;
    progressFill.style.width = `${pct}%`;

    // Update step labels
    progressSteps.forEach((label, i) => {
      label.classList.remove('active', 'completed');
      if (i + 1 < currentStep) {
        label.classList.add('completed');
      } else if (i + 1 === currentStep) {
        label.classList.add('active');
      }
    });
  }


  // ============================================================
  // EVENT HANDLERS
  // ============================================================
  function handleStepClick(e) {
    const target = e.target;

    // Handle "Start Assessment" button
    if (target.closest('[data-action="start"]')) {
      nextStep();
      return;
    }

    // Handle "Next" button
    if (target.closest('[data-action="next"]')) {
      nextStep();
      return;
    }

    // Handle "Back" button
    if (target.closest('[data-action="prev"]')) {
      prevStep();
      return;
    }

    // Handle option card clicks
    const optionCard = target.closest('.option-card');
    if (optionCard) {
      handleOptionSelect(optionCard);
      return;
    }

    // Handle toggle button clicks
    const toggleBtn = target.closest('.toggle-btn');
    if (toggleBtn) {
      handleToggleSelect(toggleBtn);
      return;
    }
  }

  function handleOptionSelect(card) {
    const group = card.closest('.option-group');
    const name = group.dataset.name;
    const value = card.dataset.value;
    const dimension = card.closest('.step').dataset.dimension;

    // Deselect siblings
    group.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    
    // Select this one
    card.classList.add('selected');

    // Store answer
    if (dimension && name) {
      answers[dimension][name] = value;
    }
  }

  function handleToggleSelect(btn) {
    const group = btn.closest('.toggle-group');
    const name = group.dataset.name;
    const value = btn.dataset.value;
    const dimension = btn.closest('.step').dataset.dimension;

    // Deselect siblings
    group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('selected'));
    
    // Select this one
    btn.classList.add('selected');

    // Store answer
    if (dimension && name) {
      answers[dimension][name] = value;
    }
  }

  function handleSliderChange(e) {
    const slider = e.target;
    const valueDisplay = document.getElementById(slider.dataset.display);
    const dimension = slider.closest('.step')?.dataset.dimension;
    const name = slider.name;

    // Update display
    if (valueDisplay) {
      const val = parseInt(slider.value);
      if (name === 'emergency_months') {
        valueDisplay.innerHTML = val >= 12 ? '12+ <span>months</span>' : `${val} <span>month${val !== 1 ? 's' : ''}</span>`;
      } else if (name === 'routine_work') {
        valueDisplay.innerHTML = `${val}<span>%</span>`;
      }
    }

    // Store answer
    if (dimension && name) {
      answers[dimension][name] = parseInt(slider.value);
    }
  }

  function handleSelectChange(e) {
    const select = e.target;
    const dimension = select.closest('.step')?.dataset.dimension;
    const name = select.name;

    if (dimension && name) {
      answers[dimension][name] = select.value;
    }
  }


  // ============================================================
  // RESULTS
  // ============================================================
  function calculateAndShowResults() {
    // Provide sensible defaults for any unanswered questions
    if (!answers.exposure.industry) answers.exposure.industry = 'other';
    if (!answers.exposure.role) answers.exposure.role = 'customer_facing';
    if (answers.exposure.routine_work === undefined) answers.exposure.routine_work = 50;
    if (!answers.exposure.income_sources) answers.exposure.income_sources = 'single';

    if (answers.cushion.emergency_months === undefined) answers.cushion.emergency_months = 2;
    if (!answers.cushion.debt_ratio) answers.cushion.debt_ratio = 'moderate';
    if (!answers.cushion.expense_flexibility) answers.cushion.expense_flexibility = 'mixed';
    if (!answers.cushion.health_insurance) answers.cushion.health_insurance = 'no';

    if (!answers.adaptability.recent_skill) answers.adaptability.recent_skill = 'no';
    if (!answers.adaptability.side_income) answers.adaptability.side_income = 'no';
    if (!answers.adaptability.network_size) answers.adaptability.network_size = 'small';
    if (!answers.adaptability.education_plan) answers.adaptability.education_plan = 'no';

    if (!answers.safety.unemployment_knowledge) answers.safety.unemployment_knowledge = 'no';
    if (!answers.safety.retraining_awareness) answers.safety.retraining_awareness = 'no';
    if (!answers.safety.financial_tools) answers.safety.financial_tools = 'no';
    if (!answers.safety.gov_assistance_knowledge) answers.safety.gov_assistance_knowledge = 'no';

    // Calculate scores using functions from data.js
    results = calculateResults(answers);

    // Cohort mode: contribute this result to the org's anonymous aggregate.
    // Fire-and-forget — a backend hiccup must never block someone's results.
    if (orgCode) {
      try {
        fetch('/api/ai-ready', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            action: 'submit',
            org: orgCode,
            total: results.total,
            scores: results.scores,
            category: results.category.key
          })
        }).catch(() => {});
      } catch (e) { /* ignore */ }
    }

    // Hide steps, show results
    stepsContainer.style.display = 'none';
    document.querySelector('.progress-bar').style.display = 'none';
    resultsContainer.style.display = 'block';

    // Render results
    renderResults();
  }

  function renderResults() {
    const r = results;
    const cat = r.category;

    resultsContainer.innerHTML = `
      <div class="results">
        <!-- Overall Score Card -->
        <div class="results__hero ${cat.cssClass}">
          <span class="results__category">Your AI-Ready Profile</span>
          <h2 class="results__title">${cat.label}</h2>
          
          <div class="results__score-ring">
            <svg viewBox="0 0 140 140">
              <circle class="ring-bg" cx="70" cy="70" r="60" />
              <circle class="ring-fill" cx="70" cy="70" r="60"
                style="stroke: ${cat.color};"
                data-score="${r.total}" />
            </svg>
            <div class="results__score-number">
              ${r.total}<span>/100</span>
            </div>
          </div>

          <p class="results__summary">${cat.summary}</p>
        </div>

        <!-- Dimension Breakdown -->
        <div class="results__dimensions">
          <h3>Your resilience profile, by dimension</h3>
          ${r.dimensionDetails.map(d => `
            <div class="dimension-card">
              <div class="dimension-card__icon">
                ${getDimensionIcon(d.key)}
              </div>
              <div class="dimension-card__info">
                <h4>${d.label}</h4>
                <p class="dimension-card__label">${d.description}</p>
                <div class="dimension-card__bar">
                  <div class="dimension-card__bar-fill" 
                    data-width="${d.percentage}" 
                    style="background: ${d.color};"></div>
                </div>
              </div>
              <div class="dimension-card__score" style="color: ${d.color};">
                ${d.score}<span style="font-size: 0.7em; color: var(--text-light);">/25</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Action Items -->
        <div class="results__actions">
          <h3 style="font-size: 1.4rem; color: var(--orange); margin-bottom: 0.25rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.85rem;">What To Do Next</h3>
          <h3 style="margin-bottom: 1.25rem;">Your personalized action plan</h3>
          ${r.actionItems.map((item, i) => `
            <div class="action-item">
              <div class="action-item__num">${i + 1}</div>
              <div class="action-item__text">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                ${item.link ? `
                  <a class="action-item__link" href="${item.link}" target="_blank" rel="noopener">
                    ${item.linkText} 
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 11L11 1M11 1H3M11 1v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </a>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Share Card -->
        <div class="share-card">
          <h3>Share your results</h3>
          <p>Help others check their financial resilience too.</p>
          <div class="share-buttons">
            <button class="share-btn share-btn--x" onclick="shareOnX()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share on X
            </button>
            <button class="share-btn share-btn--linkedin" onclick="shareOnLinkedIn()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
            <button class="share-btn share-btn--copy" onclick="copyResults()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy Results
            </button>
          </div>
        </div>

        <!-- Footer CTA -->
        <div class="results__footer">
          <a href="index.html" class="btn btn--primary">
            Explore Resources
            <svg class="btn__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <br>
          <button class="retake-link" onclick="retakeAssessment()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7a6 6 0 1011.196-3M12.196 1v3h-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Retake assessment
          </button>
        </div>
      </div>
    `;

    // Animate score ring and bars after render
    requestAnimationFrame(() => {
      setTimeout(animateResults, 100);
    });
  }

  function animateResults() {
    // Animate score ring
    const ringFill = resultsContainer.querySelector('.ring-fill');
    if (ringFill) {
      const score = parseInt(ringFill.dataset.score);
      const circumference = 2 * Math.PI * 60; // r = 60
      const offset = circumference - (score / 100) * circumference;
      ringFill.style.strokeDashoffset = offset;
    }

    // Animate dimension bars
    resultsContainer.querySelectorAll('.dimension-card__bar-fill').forEach(bar => {
      const width = bar.dataset.width;
      bar.style.width = `${width}%`;
    });
  }

  function getDimensionIcon(key) {
    const icons = {
      exposure: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="16" stroke="#FF6B35" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 3"/>
        <path d="M20 10v10l7 3" stroke="#FF6B35" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="14" cy="28" r="2" fill="#FF6B35" opacity="0.3"/>
        <circle cx="28" cy="14" r="1.5" fill="#FF6B35" opacity="0.4"/>
      </svg>`,
      cushion: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <ellipse cx="20" cy="28" rx="10" ry="4" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M10 28V18c0-5.5 4.5-10 10-10s10 4.5 10 10v10" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M16 22l4-4 4 4" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="20" y1="18" x2="20" y2="26" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`,
      adaptability: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M8 32L16 24L22 28L32 12" stroke="#5a574f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M26 12h6v6" stroke="#5a574f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="8" cy="32" r="2" fill="#5a574f" opacity="0.3"/>
      </svg>`,
      safety: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M20 6l12 6v10c0 7-5 12-12 14C13 34 8 29 8 22V12l12-6z" stroke="#FF8C61" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 20l3 3 7-7" stroke="#FF8C61" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    };
    return icons[key] || '';
  }


  // ============================================================
  // SHARING
  // ============================================================
  window.shareOnX = function() {
    const text = `I just checked my AI-Ready financial resilience score: ${results.category.label} (${results.total}/100). How prepared are you for AI-driven economic changes? Take the free assessment:`;
    const url = window.location.origin + '/ai-ready/assessment.html';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  };

  window.shareOnLinkedIn = function() {
    const url = window.location.origin + '/ai-ready/assessment.html';
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  };

  window.copyResults = function() {
    const text = `My AI-Ready Financial Resilience Score: ${results.category.label} (${results.total}/100)\n\n` +
      results.dimensionDetails.map(d => `${d.label}: ${d.score}/25`).join('\n') +
      `\n\nTake the free assessment: ${window.location.origin}/ai-ready/assessment.html`;
    
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.querySelector('.share-btn--copy');
      const original = btn.innerHTML;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8l3 3 5-5"/></svg> Copied!';
      setTimeout(() => { btn.innerHTML = original; }, 2000);
    });
  };

  window.retakeAssessment = function() {
    // Reset state
    currentStep = 0;
    Object.keys(answers).forEach(k => { answers[k] = {}; });
    results = null;

    // Reset UI
    resultsContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    stepsContainer.style.display = 'block';
    document.querySelector('.progress-bar').style.display = 'block';

    // Reset all selected states
    document.querySelectorAll('.option-card.selected').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.toggle-btn.selected').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.form-select').forEach(s => { s.selectedIndex = 0; });
    document.querySelectorAll('input[type="range"]').forEach(s => {
      s.value = s.defaultValue || 0;
      handleSliderChange({ target: s });
    });

    showStep(0);
  };


  // ============================================================
  // NAV SCROLL EFFECT
  // ============================================================
  const nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.site-nav__links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }


  // ============================================================
  // BOOT
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
