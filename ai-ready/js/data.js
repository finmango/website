/* ==========================================================================
   AI-Ready Financial Resilience Tool — Data & Scoring Configuration
   
   SCORING METHODOLOGY
   -------------------
   Each dimension is scored 0-25 points (total possible: 100).
   Questions within each dimension contribute proportionally.
   The scoring weights are intentionally conservative: we'd rather tell
   someone they have room to improve than give false comfort.
   
   MODULAR DESIGN
   -------------------
   Industry exposure data is isolated in INDUSTRY_DATA so it can be
   swapped for real Bureau of Labor Statistics automation probability
   data when available.
   
   ========================================================================== */

// ============================================================
// INDUSTRY DATA
// Each industry has an automation_risk score (0-1) representing
// the estimated share of tasks susceptible to AI automation.
// Sources: McKinsey Global Institute, Brookings Institution,
// and World Economic Forum Future of Jobs reports.
// These are placeholder estimates. Replace with BLS O*NET data.
// ============================================================

const INDUSTRY_DATA = {
  'technology': {
    label: 'Technology / Software',
    automation_risk: 0.25,
    note: 'AI augments most tech roles rather than replacing them, but entry-level coding and QA are shifting.'
  },
  'healthcare': {
    label: 'Healthcare / Medical',
    automation_risk: 0.30,
    note: 'Clinical roles remain human-centered, but administrative and diagnostic support roles face changes.'
  },
  'finance': {
    label: 'Finance / Banking / Insurance',
    automation_risk: 0.50,
    note: 'Transaction processing, underwriting, and routine analysis are highly automatable.'
  },
  'education': {
    label: 'Education / Training',
    automation_risk: 0.25,
    note: 'Teaching itself is hard to automate, but grading, admin, and content creation are evolving.'
  },
  'manufacturing': {
    label: 'Manufacturing / Production',
    automation_risk: 0.65,
    note: 'Routine assembly and quality inspection are already heavily automated in many facilities.'
  },
  'retail': {
    label: 'Retail / E-commerce',
    automation_risk: 0.55,
    note: 'Checkout, inventory, and customer service roles face significant automation pressure.'
  },
  'transportation': {
    label: 'Transportation / Logistics',
    automation_risk: 0.60,
    note: 'Autonomous vehicles and route optimization are actively being deployed.'
  },
  'food_service': {
    label: 'Food Service / Hospitality',
    automation_risk: 0.50,
    note: 'Ordering, prep, and back-of-house tasks are increasingly automated, but hospitality remains human.'
  },
  'construction': {
    label: 'Construction / Trades',
    automation_risk: 0.30,
    note: 'Physical, unpredictable work environments make full automation difficult. Planning tools are changing.'
  },
  'creative': {
    label: 'Creative / Media / Design',
    automation_risk: 0.40,
    note: 'Generative AI is transforming content creation, but high-level creative direction stays human.'
  },
  'legal': {
    label: 'Legal Services',
    automation_risk: 0.45,
    note: 'Document review and legal research are highly automatable. Strategy and litigation less so.'
  },
  'government': {
    label: 'Government / Public Sector',
    automation_risk: 0.35,
    note: 'Administrative processing faces automation, but policy and public-facing roles are more protected.'
  },
  'agriculture': {
    label: 'Agriculture / Farming',
    automation_risk: 0.45,
    note: 'Precision agriculture and monitoring are growing, but many tasks require physical flexibility.'
  },
  'energy': {
    label: 'Energy / Utilities',
    automation_risk: 0.40,
    note: 'Monitoring, grid management, and routine maintenance are becoming more automated.'
  },
  'real_estate': {
    label: 'Real Estate',
    automation_risk: 0.35,
    note: 'Valuation models and paperwork are automatable, but relationship-driven sales less so.'
  },
  'nonprofit': {
    label: 'Nonprofit / Social Services',
    automation_risk: 0.25,
    note: 'Human connection is core to the mission, but admin, fundraising tools, and data work are shifting.'
  },
  'other': {
    label: 'Other / Not Listed',
    automation_risk: 0.40,
    note: 'A moderate estimate applied when we don\'t have specific data for your industry.'
  }
};


// ============================================================
// ROLE TYPE DATA
// How much a role type amplifies or dampens automation risk.
// Multiplier applied to industry risk. >1 = higher risk.
// ============================================================

const ROLE_DATA = {
  'administrative': {
    label: 'Administrative / Clerical',
    risk_multiplier: 1.4,
    note: 'Data entry, scheduling, and document processing are among the most automatable tasks.'
  },
  'creative': {
    label: 'Creative / Design',
    risk_multiplier: 0.9,
    note: 'Generative AI is changing the tools, but original creative vision remains valuable.'
  },
  'technical': {
    label: 'Technical / Engineering',
    risk_multiplier: 0.75,
    note: 'Technical problem-solving skills transfer well, though specific tools keep changing.'
  },
  'manual_labor': {
    label: 'Manual Labor / Physical',
    risk_multiplier: 0.85,
    note: 'Physical work in unpredictable environments is harder to automate than desk work.'
  },
  'management': {
    label: 'Management / Leadership',
    risk_multiplier: 0.7,
    note: 'People management, strategy, and decision-making remain distinctly human.'
  },
  'customer_facing': {
    label: 'Customer-Facing / Sales',
    risk_multiplier: 1.0,
    note: 'Routine customer service is automatable, but complex relationship selling less so.'
  },
  'analytical': {
    label: 'Data / Analytical',
    risk_multiplier: 1.1,
    note: 'Basic analysis is increasingly automated, but interpretation and storytelling remain human.'
  },
  'healthcare_clinical': {
    label: 'Clinical / Patient Care',
    risk_multiplier: 0.65,
    note: 'Direct patient care requires empathy and physical presence that AI can\'t replicate.'
  }
};


// ============================================================
// SCORING WEIGHTS
// How each question contributes to its dimension score (0-25).
// The weight represents the maximum points a question can add.
// ============================================================

const SCORING = {
  // Dimension 1: AI Exposure (0-25, higher = more exposed = lower score)
  // Note: This dimension is INVERTED — lower exposure = higher resilience score
  exposure: {
    maxPoints: 25,
    questions: {
      industry: { weight: 8 },       // Based on INDUSTRY_DATA automation_risk
      role: { weight: 6 },           // Based on ROLE_DATA risk_multiplier
      routine_work: { weight: 6 },   // How routine is the work (0-100 slider)
      income_sources: { weight: 5 }  // Single vs multiple income
    }
  },

  // Dimension 2: Financial Cushion (0-25)
  cushion: {
    maxPoints: 25,
    questions: {
      emergency_months: { weight: 8 },   // Months of expenses covered (0-12+)
      debt_ratio: { weight: 6 },          // Debt-to-income ratio
      expense_flexibility: { weight: 5 }, // Fixed vs flexible expenses
      health_insurance: { weight: 6 }     // Independent health insurance
    }
  },

  // Dimension 3: Adaptability Capital (0-25)
  adaptability: {
    maxPoints: 25,
    questions: {
      recent_skill: { weight: 7 },      // Learned new skill in past 12 months
      side_income: { weight: 6 },       // Has secondary income source
      network_size: { weight: 5 },      // Professional network
      education_plan: { weight: 7 }     // Savings/plan for retraining
    }
  },

  // Dimension 4: Safety Net Awareness (0-25)
  safety: {
    maxPoints: 25,
    questions: {
      unemployment_knowledge: { weight: 6 },   // Knows unemployment benefits
      retraining_awareness: { weight: 7 },      // Aware of free retraining programs
      financial_tools: { weight: 6 },            // Uses financial planning tools
      gov_assistance_knowledge: { weight: 6 }   // Knows about gov assistance
    }
  }
};


// ============================================================
// RESULT CATEGORIES
// Overall score mapped to a resilience profile.
// Score ranges chosen to be motivating but honest.
// ============================================================

const RESULT_CATEGORIES = {
  'well-positioned': {
    range: [75, 100],
    label: 'Well-Positioned',
    emoji: '🟢',
    color: 'var(--status-great)',
    cssClass: 'status--great',
    summary: 'You have strong financial foundations for navigating economic changes. Your combination of financial cushion, diverse skills, and awareness of resources puts you in a solid position. Keep building on these strengths.',
    tone: 'Keep it up.'
  },
  'building': {
    range: [50, 74],
    label: 'Building Resilience',
    emoji: '🟡',
    color: 'var(--status-good)',
    cssClass: 'status--good',
    summary: 'You have some strong foundations, but there are specific areas where small improvements could make a big difference. Focus on your weakest dimension first, since those are your biggest opportunities.',
    tone: 'Good progress, specific next steps below.'
  },
  'needs-attention': {
    range: [25, 49],
    label: 'Needs Attention',
    emoji: '🟠',
    color: 'var(--status-caution)',
    cssClass: 'status--caution',
    summary: 'Several areas of your financial resilience need work. This isn\'t about panic. It\'s about knowing where you stand and taking targeted action. The good news: the most impactful changes are often the simplest ones.',
    tone: 'Focus on the basics first.'
  },
  'vulnerable': {
    range: [0, 24],
    label: 'Vulnerable',
    emoji: '🔴',
    color: 'var(--status-warning)',
    cssClass: 'status--warning',
    summary: 'Your financial position has significant vulnerabilities. This is common, and recognizing it is the first step. Start with the first action item below and work through them one at a time. Small steps compound.',
    tone: 'Start with one thing today.'
  }
};


// ============================================================
// ACTION ITEMS
// Concrete, specific advice based on weak dimensions.
// Each dimension has tiered action items based on score level.
// ============================================================

const ACTION_ITEMS = {
  exposure: {
    low: [  // score 0-8 (high exposure)
      {
        title: 'Map your transferable skills',
        description: 'List every skill you use at work, then identify which ones apply outside your current role. Communication, problem-solving, and project management transfer across industries.',
        link: 'https://www.onetonline.org/',
        linkText: 'Explore skills on O*NET →'
      },
      {
        title: 'Learn one AI-adjacent tool this month',
        description: 'Pick one tool relevant to your field (ChatGPT, Copilot, Midjourney, or industry-specific AI) and spend 30 minutes with it. Understanding AI makes you harder to replace by it.',
        link: null,
        linkText: null
      }
    ],
    medium: [  // score 9-16
      {
        title: 'Diversify your income sources',
        description: 'If you rely on one paycheck, explore freelancing platforms, consulting, or part-time work that uses different skills than your day job.',
        link: null,
        linkText: null
      }
    ],
    high: [  // score 17-25
      {
        title: 'Stay curious about AI in your field',
        description: 'Your position looks solid. Stay ahead by following how AI is being used in your industry. Being an early adopter gives you an advantage.',
        link: null,
        linkText: null
      }
    ]
  },

  cushion: {
    low: [  // score 0-8
      {
        title: 'Start a micro emergency fund',
        description: 'Before targeting 3-6 months of expenses, aim for $500. Set up an automatic transfer of even $25/week. This covers most unexpected car repairs or medical copays.',
        link: 'https://www.consumerfinance.gov/start-small-save-up/',
        linkText: 'CFPB saving tips →'
      },
      {
        title: 'Review your fixed expenses',
        description: 'List every recurring payment. Cancel subscriptions you forgot about. Call providers to negotiate rates. Most people find $50-200/month in savings they didn\'t expect.',
        link: null,
        linkText: null
      }
    ],
    medium: [  // score 9-16
      {
        title: 'Build toward 3 months of expenses',
        description: 'You have some cushion. To strengthen it, calculate your actual monthly needs (not wants) and set a concrete savings target. High-yield savings accounts earn 4-5% right now.',
        link: null,
        linkText: null
      },
      {
        title: 'Explore health insurance options',
        description: 'If your health coverage is tied to your job, research marketplace plans and Medicaid eligibility. Knowing your options before you need them matters.',
        link: 'https://www.healthcare.gov/',
        linkText: 'Explore plans on HealthCare.gov →'
      }
    ],
    high: [  // score 17-25
      {
        title: 'Optimize your emergency fund placement',
        description: 'Make sure your emergency fund earns a competitive rate. Treasury bills and high-yield savings accounts are low-risk options worth checking.',
        link: null,
        linkText: null
      }
    ]
  },

  adaptability: {
    low: [  // score 0-8
      {
        title: 'Take one free online course this month',
        description: 'Google, Coursera, and edX offer free certifications. Pick something practical: data literacy, basic coding, digital marketing, or project management.',
        link: 'https://grow.google/certificates/',
        linkText: 'Free Google Career Certificates →'
      },
      {
        title: 'Reconnect with 3 people in your field',
        description: 'Send a short, genuine message to three former colleagues or classmates. Professional networks are your safety net for job transitions. It doesn\'t have to be awkward.',
        link: null,
        linkText: null
      }
    ],
    medium: [  // score 9-16
      {
        title: 'Create a learning budget',
        description: 'Set aside even $50/month for professional development: courses, books, conference tickets, or professional memberships. Treat it like a utility bill.',
        link: null,
        linkText: null
      },
      {
        title: 'Explore freelance or consulting work',
        description: 'Testing your skills in the open market, even on small projects, builds confidence and creates backup income. Start with one platform (Upwork, Fiverr, or Toptal).',
        link: null,
        linkText: null
      }
    ],
    high: [  // score 17-25
      {
        title: 'Mentor someone in your field',
        description: 'Teaching sharpens your own skills and strengthens your network. Many organizations need volunteer mentors, and it looks great on a resume.',
        link: null,
        linkText: null
      }
    ]
  },

  safety: {
    low: [  // score 0-8
      {
        title: 'Check your unemployment benefits eligibility',
        description: 'Every state has different rules and benefit amounts. Spend 10 minutes on your state unemployment website to understand what you\'d receive and how to apply.',
        link: 'https://www.careeronestop.org/LocalHelp/UnemploymentBenefits/unemployment-benefits.aspx',
        linkText: 'Find your state\'s benefits →'
      },
      {
        title: 'Discover free retraining programs near you',
        description: 'Federal and state workforce programs offer free training. Your local American Job Center can connect you with programs you didn\'t know existed.',
        link: 'https://www.careeronestop.org/LocalHelp/AmericanJobCenters/american-job-centers.aspx',
        linkText: 'Find an American Job Center →'
      }
    ],
    medium: [  // score 9-16
      {
        title: 'Set up basic financial tracking',
        description: 'You don\'t need a financial advisor to start. A free tool like Mint, YNAB (free trial), or even a simple spreadsheet helps you see where your money goes.',
        link: null,
        linkText: null
      },
      {
        title: 'Research government assistance programs',
        description: 'Benefits.gov can show you every federal and state program you might qualify for, not just unemployment. Many people are eligible for programs they\'ve never heard of.',
        link: 'https://www.benefits.gov/',
        linkText: 'Check your eligibility on Benefits.gov →'
      }
    ],
    high: [  // score 17-25
      {
        title: 'Help someone else navigate these resources',
        description: 'You\'re well-informed. Share what you know with a friend or family member who might need it. Financial knowledge is one of the few things that grows when you give it away.',
        link: null,
        linkText: null
      }
    ]
  }
};


// ============================================================
// DIMENSION METADATA
// Labels, colors, and icon references for each dimension.
// ============================================================

const DIMENSIONS = {
  exposure: {
    label: 'AI Exposure',
    shortLabel: 'Exposure',
    color: 'var(--dim-exposure)',
    hexColor: '#FF6B35',
    description: 'How much your current work might be affected by AI and automation.'
  },
  cushion: {
    label: 'Financial Cushion',
    shortLabel: 'Cushion',
    color: 'var(--dim-cushion)',
    hexColor: '#2a9d8f',
    description: 'Your financial buffer if your income changed unexpectedly.'
  },
  adaptability: {
    label: 'Adaptability Capital',
    shortLabel: 'Adaptability',
    color: 'var(--dim-adaptability)',
    hexColor: '#7b68ee',
    description: 'Your ability to learn, pivot, and create new income streams.'
  },
  safety: {
    label: 'Safety Net Awareness',
    shortLabel: 'Safety Net',
    color: 'var(--dim-safety)',
    hexColor: '#e76f51',
    description: 'How well you know the resources available to you.'
  }
};


// ============================================================
// SCORING FUNCTIONS
// These compute each dimension and overall score.
// ============================================================

/**
 * Calculate AI Exposure score.
 * NOTE: This dimension is INVERTED. High exposure = low score.
 * A person in a low-risk industry with a strategic role gets more points.
 * 
 * @param {Object} answers - User's answers for this dimension
 * @returns {number} Score from 0-25
 */
function scoreExposure(answers) {
  const weights = SCORING.exposure.questions;
  let score = 0;

  // Industry risk (inverted: low risk = high score)
  const industry = INDUSTRY_DATA[answers.industry] || INDUSTRY_DATA['other'];
  const industryScore = (1 - industry.automation_risk) * weights.industry.weight;
  score += industryScore;

  // Role risk multiplier (inverted)
  const role = ROLE_DATA[answers.role] || { risk_multiplier: 1.0 };
  // Clamp combined risk to 0-1 range
  const combinedRisk = Math.min(1, industry.automation_risk * role.risk_multiplier);
  const roleScore = (1 - combinedRisk) * weights.role.weight;
  score += roleScore;

  // Routine work (higher routine = higher risk = lower score)
  // answers.routine_work is 0-100
  const routineScore = (1 - (answers.routine_work / 100)) * weights.routine_work.weight;
  score += routineScore;

  // Income sources (multiple = more resilient)
  // 'single' = 0 points, 'multiple' = full points
  if (answers.income_sources === 'multiple') {
    score += weights.income_sources.weight;
  }

  return Math.round(score);
}


/**
 * Calculate Financial Cushion score.
 * 
 * @param {Object} answers - User's answers for this dimension
 * @returns {number} Score from 0-25
 */
function scoreCushion(answers) {
  const weights = SCORING.cushion.questions;
  let score = 0;

  // Emergency months (0-12+, mapped to 0-max)
  // Scoring: 0 months = 0, 3 months = 50%, 6+ months = 100%
  const months = Math.min(12, answers.emergency_months);
  const monthScore = Math.min(1, months / 6) * weights.emergency_months.weight;
  score += monthScore;

  // Debt ratio: low=100%, moderate=66%, high=33%, very_high=0%
  const debtMap = { 'low': 1.0, 'moderate': 0.66, 'high': 0.33, 'very_high': 0 };
  const debtScore = (debtMap[answers.debt_ratio] || 0.5) * weights.debt_ratio.weight;
  score += debtScore;

  // Expense flexibility: 'mostly_flexible' = 100%, 'mixed' = 50%, 'mostly_fixed' = 0%
  const flexMap = { 'mostly_flexible': 1.0, 'mixed': 0.5, 'mostly_fixed': 0 };
  const flexScore = (flexMap[answers.expense_flexibility] || 0.5) * weights.expense_flexibility.weight;
  score += flexScore;

  // Health insurance independent of employer
  if (answers.health_insurance === 'yes') {
    score += weights.health_insurance.weight;
  }

  return Math.round(score);
}


/**
 * Calculate Adaptability Capital score.
 * 
 * @param {Object} answers - User's answers for this dimension
 * @returns {number} Score from 0-25
 */
function scoreAdaptability(answers) {
  const weights = SCORING.adaptability.questions;
  let score = 0;

  // Learned a new skill recently
  if (answers.recent_skill === 'yes') {
    score += weights.recent_skill.weight;
  }

  // Has side income
  if (answers.side_income === 'yes') {
    score += weights.side_income.weight;
  }

  // Network size: small=25%, moderate=60%, large=100%
  const networkMap = { 'small': 0.25, 'moderate': 0.6, 'large': 1.0 };
  const networkScore = (networkMap[answers.network_size] || 0.25) * weights.network_size.weight;
  score += networkScore;

  // Education/retraining plan
  if (answers.education_plan === 'yes') {
    score += weights.education_plan.weight;
  }

  return Math.round(score);
}


/**
 * Calculate Safety Net Awareness score.
 * 
 * @param {Object} answers - User's answers for this dimension
 * @returns {number} Score from 0-25
 */
function scoreSafety(answers) {
  const weights = SCORING.safety.questions;
  let score = 0;

  if (answers.unemployment_knowledge === 'yes') {
    score += weights.unemployment_knowledge.weight;
  }

  if (answers.retraining_awareness === 'yes') {
    score += weights.retraining_awareness.weight;
  }

  if (answers.financial_tools === 'yes') {
    score += weights.financial_tools.weight;
  }

  if (answers.gov_assistance_knowledge === 'yes') {
    score += weights.gov_assistance_knowledge.weight;
  }

  return Math.round(score);
}


/**
 * Calculate all scores and determine category.
 * 
 * @param {Object} allAnswers - All answers organized by dimension
 * @returns {Object} Complete results object
 */
function calculateResults(allAnswers) {
  const scores = {
    exposure: scoreExposure(allAnswers.exposure || {}),
    cushion: scoreCushion(allAnswers.cushion || {}),
    adaptability: scoreAdaptability(allAnswers.adaptability || {}),
    safety: scoreSafety(allAnswers.safety || {})
  };

  const total = scores.exposure + scores.cushion + scores.adaptability + scores.safety;

  // Determine category
  let category = null;
  for (const [key, cat] of Object.entries(RESULT_CATEGORIES)) {
    if (total >= cat.range[0] && total <= cat.range[1]) {
      category = { key, ...cat };
      break;
    }
  }

  // If no category matched (shouldn't happen), default to 'needs-attention'
  if (!category) {
    category = { key: 'needs-attention', ...RESULT_CATEGORIES['needs-attention'] };
  }

  // Get relevant action items (prioritize weakest dimensions)
  const actionItems = getActionItems(scores);

  return {
    scores,
    total,
    category,
    actionItems,
    dimensionDetails: Object.entries(scores).map(([key, score]) => ({
      key,
      score,
      maxScore: 25,
      percentage: Math.round((score / 25) * 100),
      ...DIMENSIONS[key]
    }))
  };
}


/**
 * Select the most relevant action items based on dimension scores.
 * Returns 3-5 items, prioritizing the weakest dimensions.
 * 
 * @param {Object} scores - Scores by dimension
 * @returns {Array} Selected action items
 */
function getActionItems(scores) {
  const items = [];
  
  // Sort dimensions by score (lowest first = most needed)
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);

  for (const [dim, score] of sorted) {
    if (items.length >= 5) break;

    let tier;
    if (score <= 8) tier = 'low';
    else if (score <= 16) tier = 'medium';
    else tier = 'high';

    const dimActions = ACTION_ITEMS[dim]?.[tier] || [];
    for (const action of dimActions) {
      if (items.length >= 5) break;
      items.push({
        ...action,
        dimension: DIMENSIONS[dim].label,
        dimensionKey: dim
      });
    }
  }

  return items;
}
