/* ============================================================
   PUBLICATIONS — single source of truth.
   Hand-maintained (not generated).

   Read by:
     research.html               → the three most recent, teaser form
     research-publications.html  → the full bibliography + abstracts,
                                   working papers, team, collaborators

   PUBLISHED[] shape:
     id          slug — becomes the abstract toggle's aria-controls id
     year        string, used for ordering (newest first, as authored)
     meta[]      mono apparatus line, rendered '·'-separated
     featured    true → orange "Featured" tag ahead of the meta line
     title, authors, journal
     url         where the paper lives
     linkLabel   call to action for `url`
     abstract    plain-language abstract, shown behind the toggle

   WORKING[] shape:
     year, fields (mono topic string), title, authors
   ============================================================ */
window.FINMANGO_PUBLICATIONS = {

  PUBLISHED: [
    {
      id: 'whitepaper',
      year: '2025',
      featured: true,
      meta: ['2025', 'Technical Whitepaper · v2.4', 'Open Source'],
      title: 'Financial Health Barometer: 2025 Methodology & Data Architecture',
      authors: 'FinMango Research Team',
      journal: 'FinMango Technical Whitepaper (v2.4)',
      url: 'https://github.com/finmango/research/blob/main/WHITEPAPER_2025.md',
      linkLabel: 'Read the whitepaper',
      abstract: 'The whitepaper documents the data pipeline behind the Financial Health Barometer — a composite index combining Google Health Trends conditional probabilities, BLS and Census administrative data, and state-level housing and credit signals. We detail indicator construction, normalization choices, and the reasoning behind four composite tiers (Low → High).',
    },
    {
      id: 'mango',
      year: '2023',
      meta: ['2023', 'Am. J. of Health Education', '7 authors', 'Peer-reviewed'],
      title: 'The Mango Model: Best Practices in the Creation of a COVID-19 Open Data Project Through a Partnership with Google Health and the Non-Profit FinMango',
      authors: 'Oscar Wahltinez, Scott Glasgow, Aurora Cheung, James F. Glasgow, Martin Noguera, James W. Glasgow &amp; Pamela Neidert Hoalt',
      journal: 'American Journal of Health Education',
      url: 'https://www.tandfonline.com/doi/abs/10.1080/19325037.2023.2209620',
      linkLabel: 'Read the full paper',
      abstract: 'A practitioner\'s account of how a nonprofit-tech partnership can produce globally useful public-health data. We describe the decisions, missteps, and governance structures behind a dataset that ultimately spanned 22,579 locations across 190+ countries — and argue that the partnership model, not the tooling, is what made it scale.',
    },
    {
      id: 'covid',
      year: '2022',
      meta: ['2022', 'Nature · Scientific Data', '12 authors', 'Open Access'],
      title: 'COVID-19 Open-Data: A global-scale spatially granular meta-dataset for coronavirus disease',
      authors: 'Oscar Wahltinez, Aurora Cheung, Ruth Alcantara, Donny Cheung, Mayank Daswani, Anthony Erlinger, Matt Lee, Pranali Yawalkar, Paula Lê, Ofir Picazo Navarro, Michael P. Brenner &amp; Kevin Murphy',
      journal: 'Nature (Scientific Data)',
      url: 'https://www.nature.com/articles/s41597-022-01263-z',
      linkLabel: 'Read the full paper',
      abstract: 'A harmonized, spatially granular meta-dataset covering epidemiology, hospitalization, mobility, policy, and demographic data across 190+ countries — updated daily throughout the pandemic. The paper documents the schema, sourcing strategy, and reconciliation logic used to merge thousands of heterogeneous government feeds into a single, queryable resource.',
    },
  ],

  WORKING: [
    {
      year: '2026',
      fields: 'Housing · Mental Health',
      title: 'Predictive Signals: Do Mental Health-Related Google Searches Reflect Eviction Trends in Real Estate?',
      authors: 'with Eren Çifi, PhD — Austin Peay State University',
    },
    {
      year: '2026',
      fields: 'AI · Labor Markets',
      title: 'AI Adoption in Banking: Efficiency Gains and Employment Trade-offs',
      authors: 'with Eren Çifi, PhD — Austin Peay State University',
    },
    {
      year: '2026',
      fields: 'Climate · Community Banking',
      title: 'Tornadoes and Financial Resilience: Assessing the Effects of Natural Disasters on Community Banks',
      authors: 'with Eren Çifi, PhD — Austin Peay State University',
    },
    {
      year: '2026',
      fields: 'ESG · Market Behavior',
      title: 'Sustainable Investment Search Behavior as a Predictor of Market Activity',
      authors: 'with Madhavi Venkatesan, PhD — Northeastern University',
    },
    {
      year: '2026',
      fields: 'Financial Literacy',
      title: 'Comparative Analysis of Financial Literacy Search Patterns',
      authors: 'with John Longo, PhD — Rutgers University, and Danny Jang — Financial Futures',
    },
  ],

  LEADS: [
    { mark: 'T.R.', name: 'Tony Ramos' },
    { mark: 'O.W.', name: 'Oscar Wahltinez' },
    { mark: 'A.P.', name: 'Anjal Parikh' },
    { mark: 'S.C.', name: 'Sarah Cherian' },
    { mark: 'S.G.', name: 'Scott Glasgow' },
    { mark: 'S.P.', name: 'Soham Patel' },
  ],

  COLLABORATORS: [
    { name: 'Eren Çifi, PhD', org: 'Austin Peay State University' },
    { name: 'Madhavi Venkatesan, PhD', org: 'Northeastern University' },
    { name: 'Chen Zhang, PhD', org: 'Iowa State University' },
    { name: 'John Longo, PhD', org: 'Rutgers University' },
    { name: 'Christos Makridis, PhD', org: 'Arizona State / Stanford' },
  ],
};
