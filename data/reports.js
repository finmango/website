/* ============================================================
   REPORTS & BRIEFS — single source of truth.
   Hand-maintained (not generated). Seeded from
   finmango/research → "3 - Preliminary Research.md".

   Read by:
     research.html            → featured report teaser (1)
     research-reports.html    → the full library + filters

   Add a report by appending one object below. Shape:
     id                    slug, unique, used for anchors
     type                  'working-paper' | 'focus-note' | 'data-spotlight'
     featured              true → two-column treatment on the library page
                           and eligible for the teaser on research.html
     title                 string
     partner, term         optional mono meta line
     authors[]             { name, affiliation }
     plainLanguageSummary  the whole point — no jargon
     keyFindings[]         optional, featured cards only
     documents[]           { label, kind, url }  kind = PDF | PPTX | FOLDER
     relatedTools[]        { label, url }  what this research informed
     publicationUrl, doi   set once a brief becomes a peer-reviewed paper
     tags[]                lowercase topic tags — drive the topic filter
   ============================================================ */
window.FINMANGO_REPORTS = {

  REPORT_TYPES: {
    'working-paper':  { label: 'Working Paper' },
    'focus-note':     { label: 'Focus Note' },
    'data-spotlight': { label: 'Data Spotlight' },
  },

  REPORTS: [
    {
      id: 'housing-affordability-seed-s26',
      type: 'focus-note',
      featured: true,
      title: 'Analyzing the American Housing Affordability Crisis',
      partner: 'SEED Consulting · University of Virginia',
      term: 'Spring 2026',
      authors: [
        { name: 'Claudia Dean', affiliation: 'Project Leader, SEED Consulting (UVA)' },
        { name: 'Shreeya Suresh', affiliation: 'SEED Consulting (UVA)' },
        { name: 'Tyler George', affiliation: 'SEED Consulting (UVA)' },
        { name: 'Christopher Wang', affiliation: 'SEED Consulting (UVA)' },
      ],
      plainLanguageSummary: 'An examination of the U.S. housing affordability crisis across five very different places — New York City, Los Angeles, Portland, McKinney (TX), and McCall (ID) — chosen to show how the same crisis looks different in cities, suburbs, and rural towns. Housing counts as "unaffordable" once rent and utilities pass 30% of monthly income, and the brief traces how that pressure spills into health, education, and the wider economy.',
      keyFindings: [
        '53% of Americans spend more than half of household income on housing',
        '49% of renters are cost-burdened',
        'Suburban home prices are up 40% since 2020',
        'Rural residents now need ~$75K/year to afford a median-priced home — a 105% jump vs. pre-pandemic',
      ],
      documents: [
        { label: 'Final Presentation — SEED × FinMango (S26)', kind: 'PPTX', url: 'reports/housing-affordability-seed-s26/SEED_x_FinMango_S26_Final_Presentation.pptx' },
      ],
      relatedTools: [
        { label: 'Mango Stories: Understand the Housing Crisis', url: 'housing-affordability-stories.html' },
        { label: 'Housing Affordability Calculator', url: 'housing-calculator.html' },
        { label: 'Rent vs. Buy Calculator', url: 'rent-vs-buy.html' },
        { label: 'Financial Health Barometer', url: 'barometer.html' },
      ],
      publicationUrl: null,
      doi: null,
      tags: ['housing'],
    },
    {
      id: 'food-insecurity-snap-seed-f25',
      type: 'focus-note',
      featured: true,
      title: 'Food Insecurity & SNAP Access Across the United States',
      partner: 'SEED Consulting · University of Virginia',
      term: 'Fall 2025',
      authors: [
        { name: 'Jaiden Khemani', affiliation: 'Project Leader, SEED Consulting (UVA)' },
        { name: 'Henna Fernandez', affiliation: 'SEED Consulting (UVA)' },
        { name: 'Alex Jennings', affiliation: 'SEED Consulting (UVA)' },
        { name: 'Mae Bledsoe', affiliation: 'SEED Consulting (UVA)' },
        { name: 'Matt Tam', affiliation: 'SEED Consulting (UVA)' },
      ],
      plainLanguageSummary: 'A look at food insecurity and SNAP access across five diverse communities — Atlanta, Chicago, Kansas City, Twin Falls (ID), and Wolfe County (KY). The finding: hunger is driven less by an absolute shortage of food than by structural barriers — transportation gaps, the uneven spread of SNAP retailers that stock fresh produce, restrictive state eligibility rules, and benefits that haven’t kept pace with housing and grocery costs.',
      keyFindings: [
        'Every $1 in SNAP benefits generates roughly $1.54 in GDP',
        'Transportation gaps and car dependency limit access more than food supply does',
        'Regional food banks are strained as benefits are cut',
      ],
      documents: [
        { label: 'Client Presentation — FinMango × SEED (F25)', kind: 'PPTX', url: 'reports/food-insecurity-snap-seed-f25/FinMango_x_SEED_F25_Client_Presentation.pptx' },
        { label: 'Atlanta, GA — Case Study', kind: 'PDF', url: 'reports/food-insecurity-snap-seed-f25/Atlanta_GA_Case_Study.pdf' },
        { label: 'Chicago, IL — Case Study', kind: 'PDF', url: 'reports/food-insecurity-snap-seed-f25/Chicago_IL_Case_Study.pdf' },
        { label: 'Kansas City, MO — Case Study', kind: 'PDF', url: 'reports/food-insecurity-snap-seed-f25/Kansas_City_MO_Case_Study.pdf' },
        { label: 'Twin Falls, ID — Case Study', kind: 'PDF', url: 'reports/food-insecurity-snap-seed-f25/Twin_Falls_ID_Case_Study.pdf' },
        { label: 'Wolfe County, KY — Case Study', kind: 'PDF', url: 'reports/food-insecurity-snap-seed-f25/Wolfe_County_KY_Case_Study.pdf' },
      ],
      relatedTools: [
        { label: 'Food Assistance / SNAP Eligibility Calculator', url: 'food-assistance-calculator.html' },
        { label: 'Mango Stories: Food Insecurity', url: 'food-insecurity-stories.html' },
        { label: 'Food Security Hub', url: 'food-security.html' },
      ],
      publicationUrl: null,
      doi: null,
      tags: ['food security'],
    },
    {
      id: 'affordable-housing-calculator-rec',
      type: 'focus-note',
      title: 'A Recommendation: Affordable Housing via an Accessible Calculator & Partnerships',
      plainLanguageSummary: 'A recommendation for improving financial health through affordable housing, built on two moves: a housing affordability calculator that combines market data and connects people to available grants, and strategic partnerships with organizations like LISC to stretch community impact through shared resources.',
      documents: [{ label: 'Read the recommendation', kind: 'PDF', url: 'reports/briefs/affordable-housing-recommendation.pdf' }],
      tags: ['housing'],
    },
    {
      id: 'climate-migration-colombia',
      type: 'focus-note',
      title: 'Climate Migration in Colombia',
      plainLanguageSummary: 'Climate change is displacing Colombians through disasters, food insecurity, and poverty, driving migration both within the country and beyond its borders. The brief argues the response demands global investment, local aid, and far greater awareness of climate impacts.',
      documents: [{ label: 'Read the brief', kind: 'PDF', url: 'reports/briefs/climate-migration-colombia.pdf' }],
      tags: ['climate migration'],
    },
    {
      id: 'immigration-policy-analysis',
      type: 'focus-note',
      title: 'Immigration Policy Analysis',
      plainLanguageSummary: 'A review of immigration policies around the world through the lens of climate change, regional challenges, and migration trends. It recommends better data tracking and deeper partnerships with NGOs.',
      documents: [{ label: 'Read the brief', kind: 'PDF', url: 'reports/briefs/immigration-policy-analysis.pdf' }],
      tags: ['immigration'],
    },
    {
      id: 'climate-migration-trend-scanner',
      type: 'focus-note',
      title: 'Climate Migration Trend Scanner',
      plainLanguageSummary: 'A concept report, developed with SEED Consulting, for a Climate Migration Trend Scanner — laying out the strategy, target audiences, data sources, and the machine-learning approach behind a future early-detection tool.',
      documents: [{ label: 'Open the report folder', kind: 'FOLDER', url: 'https://drive.google.com/drive/folders/1uC4ukGnMD8vc7IXRcHpsTfxWP_noAGKA?usp=sharing' }],
      tags: ['climate migration'],
    },
    {
      id: 'brazilian-financial-ecosystem',
      type: 'focus-note',
      title: 'Brazilian Financial Ecosystem Report',
      plainLanguageSummary: 'Brazil’s financial ecosystem is vast and layered, with many kinds of providers operating side by side. The report maps six key sectors, each with its own players, macroeconomic effects, and challenges.',
      documents: [{ label: 'Read the report', kind: 'PDF', url: 'reports/briefs/brazilian-financial-ecosystem.pdf' }],
      tags: ['brazil', 'global markets'],
    },
    {
      id: 'financial-health-measurement-toolkit',
      type: 'focus-note',
      title: 'Financial Health Measurement Toolkit',
      plainLanguageSummary: 'A breakdown of what "financial health" actually means, a survey of existing financial-health measurement instruments, and suggestions for where the field should go next. FinMango maintains a running catalog of these tools for thought leaders and policymakers.',
      documents: [{ label: 'Read the report', kind: 'PDF', url: 'reports/briefs/financial-health-measurement-toolkit.pdf' }],
      tags: ['financial health'],
    },
    {
      id: 'returning-citizens-barriers',
      type: 'focus-note',
      title: 'Acknowledging the Barriers Returning Citizens Face',
      plainLanguageSummary: 'Drawing on interviews, this brief maps the wide-ranging barriers faced by people returning from incarceration, then works to prioritize which of those barriers can realistically be addressed first.',
      documents: [{ label: 'View the presentation', kind: 'PDF', url: 'reports/briefs/returning-citizens-barriers.pdf' }],
      tags: ['equity'],
    },
    {
      id: 'argentina-brazil-comparative',
      type: 'focus-note',
      title: 'Comparative Study: Argentina & Brazil',
      plainLanguageSummary: 'Financial illiteracy is widespread among lower-income households in Argentina, limiting access to credit and slowing economic mobility. The study argues for stronger public-private partnerships to expand financial education and opportunity.',
      documents: [{ label: 'Read the study', kind: 'PDF', url: 'reports/briefs/argentina-brazil-comparative.pdf' }],
      tags: ['financial literacy', 'global markets'],
    },
    {
      id: 'nigerian-economic-data',
      type: 'focus-note',
      title: 'Case Study of Nigerian Economic Data',
      plainLanguageSummary: 'FinMango’s analysis of Nigeria’s economic data surfaced recurring problems — outdated information and a thin set of reporting sources — that point to a need for standardized data collection. In response, FinMango is building automated data-collection tools and pushing for better reporting.',
      documents: [{ label: 'Read the case study', kind: 'PDF', url: 'reports/briefs/nigerian-economic-data.pdf' }],
      tags: ['nigeria', 'data'],
    },
  ],
};
