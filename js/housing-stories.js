const stories = [
  {
    id: 1,
    title: "Intro to the housing affordability crisis",
    author: "Christopher Wang",
    icon: "🏠",
    description: "Understand the basics of the housing crisis and why it matters to everyone.",
    lessons: 4,
    time: "8 min",
    slides: [
      { emoji: "📊", title: "What is it?", text: "Housing is considered affordable when a household spends no more than 30% of its income on housing costs.\n\nToday, nearly half of American renters are 'cost-burdened,' paying far more than that. Rising rents, stagnant wages, and a shortage of homes have pushed millions to the financial edge.\n\n49% are cost burdened, and there is a 7M+ unit shortage in the U.S." },
      { emoji: "🌊", title: "Why is it important?", text: "Housing affordability goes far beyond housing: It affects health, education, and the economy.\n\nFamilies who spend too much on rent have less for food, healthcare, and savings. Children in unstable housing have worse school outcomes. Communities lose workers when housing costs force people out." },
      { emoji: "💡", title: "Local Resources", text: "There is help available. Resources include:\n- 211.org\n- HUD housing counselors\n- NLIHC emergency rental assistance finder\n- Consumer Financial Protection Bureau housing tools." },
      { emoji: "🗺️", title: "Find Local Resources", text: "", html: "<div class='ai-search-tool' id='aiSearch1'><h3>Find Local Housing Resources</h3><p>Enter your zip code to discover tailored housing assistance.</p><div class='ai-input-group'><input type='text' id='zip1' placeholder='ZIP Code' maxlength='5'><select id='type1'><option value='rent'>I am renting</option><option value='own'>I own a home</option></select><button onclick='simulateAISearch(1)' class='ai-btn'>Search</button></div><div id='aiResults1' class='ai-results hidden'><div class='loader'>Searching local databases...</div></div></div>" }
    ]
  },
  {
    id: 2,
    title: "Drivers of the housing affordability crisis",
    author: "Shreeya Suresh",
    icon: "📈",
    description: "Why does housing feel so expensive right now? Let's break down the main causes.",
    lessons: 6,
    time: "12 min",
    slides: [
      { emoji: "🤔", title: "Why does housing feel so expensive right now?", text: "If it feels like rent is draining your paycheck, or buying a home is out of reach, you aren't imagining it. There are a few big reasons for that– let's walk through them." },
      { emoji: "📉", title: "Not Enough Homes", text: "For over a decade, the U.S. has not built enough homes to keep up with demand. Experts estimate that we're short by millions of homes, which means that more people are competing for fewer places to live. When that happens, prices naturally rise." },
      { emoji: "🚧", title: "Zoning Limits What Can Be Built", text: "In many cities, 70-80% of residential land allows only single-family homes. That means that apartments, duplexes, and other more affordable options often can't be built, even when there is demand. This prevents growth of the number of available homes, which pushes prices higher." },
      { emoji: "📈", title: "Rising Mortgage Rates", text: "Even if home prices didn't increase, higher mortgage rates have made monthly payments more expensive. On top of that, many current homeowners are holding on to the low interest rates they locked in many years ago, which means fewer people are selling. Fewer homes make it hard to find something affordable." },
      { emoji: "🏗️", title: "It's More Expensive to Build", text: "Building new housing is not as easy as it used to be. The cost of materials, labor and regulations have gone up, which slows down construction. When it's harder to build, fewer homes get made, which keeps supply low." },
      { emoji: "💸", title: "Income Isn’t Keeping Up", text: "Housing costs have been rising faster than wages in many places. That means even if you're earning more than before, it doesn’t go as far when it comes to rent or a mortgage. A lot of people now spend a large portion of their income just on housing." }
    ]
  },
  {
    id: 3,
    title: "The Suburban Housing Crisis",
    author: "Christopher Wang",
    icon: "🏘️",
    description: "Suburbs were once affordable alternatives to cities, but no longer.",
    lessons: 4,
    time: "8 min",
    slides: [
      { emoji: "🚗", title: "Specific drivers", text: "Suburbs were once affordable alternatives to cities, but no longer. Zoning laws that ban apartments, rising land costs, and an influx of remote workers have driven suburban home prices up 40% since 2020. Long commutes and car dependency add up to $10,000 per year in hidden transportation costs." },
      { emoji: "🛠️", title: "Specific solutions", text: "Communities have already attempted to rezone for “missing middle” housing, including duplexes, townhomes, and ADUs that fit suburban neighborhoods without introducing high-rises. Transit oriented development clusters homes near train stops to cut car costs. First-time buy programs and down payment assistance can also help." },
      { emoji: "📚", title: "Specific resources", text: "- HUD’s FHA loan for first time home buyers\n- State housing finance agency (SHA)\n- Local community land trusts\n- Property tax freeze/circuit breaker programs" },
      { emoji: "🌟", title: "Example: Columbus, Ohio", text: "Jasmin Wooten, a single mom in Columbus, purchased a 3-bedroom new build home in the Hilltop neighborhood for $150,000 through the Central Ohio Community Land Trust, well below the market rate.\n\n“It’s not just a house. It’s not just a place where we live right now. We have a home.”\n\nThe Land Trust holds the land while buyers own the structure, which helps keep homes permanently affordable." }
    ]
  },
  {
    id: 4,
    title: "Impacts of a Lack of Affordable Housing",
    author: "Tyler George",
    icon: "💥",
    description: "How does the housing crisis affect individuals and communities on a daily basis?",
    lessons: 4,
    time: "8 min",
    slides: [
      { emoji: "⚖️", title: "Definition of “Unaffordable Housing”", text: "Housing is generally defined as unaffordable when payments on rent or mortgage and utilities exceed 30% of household income. Families paying above this threshold typically struggle to cover other essential living expenses. This widely-used benchmark helps quickly compare the housing crisis in different cities or areas." },
      { emoji: "📉", title: "Consequences of Spending Over 30%", text: "When households spend a large portion of income on housing, they may cut back on other essential costs like food or healthcare. They may rely on credit or deplete savings, hindering their ability to deal with emergency costs like medical bills or repairs. Over time, minimal savings limits a household’s opportunity to invest in education, start a business, or buy a home. These constraints make it harder for a household to achieve upward mobility and reach financial stability." },
      { emoji: "🌪️", title: "Dangers of Inconsistent Housing", text: "Unaffordable housing can make families move around frequently or overcrowd housing. Frequent moving disrupts education and work, and may pull families out of local communities. Extended housing instability can lead to stress, with lasting social and economic consequences." },
      { emoji: "🔍", title: "Challenges of Finding Affordable Housing", text: "Searching for affordable housing may force households to choose between unsafe neighborhoods or long commutes. In some areas, the only affordable units are far away from jobs and necessary services, limiting access to economic opportunity and decreasing overall quality of life." }
    ]
  },
  {
    id: 5,
    title: "How to Find Affordable Housing",
    author: "Tyler George",
    icon: "🔍",
    description: "Strategies and resources to secure affordable housing in a difficult market.",
    lessons: 5,
    time: "10 min",
    slides: [
      { emoji: "🏢", title: "Types of Affordable Housing", text: "Affordable housing can be through both private markets and government-supported programs. Private affordable housing includes units with rents below market rates, typically based on tenant income and managed by bigger developers. Government support might include housing vouchers, known as “Section 8,” that cover a portion of rent in private units." },
      { emoji: "🤝", title: "Strategies for Finding Private Housing", text: "Contacting property managers directly may reveal special income-restricted units that aren’t widely advertised. Housing nonprofits often maintain lists of affordable nearby rentals. In addition, leveraging personal networks and word-of-mouth may uncover housing opportunities." },
      { emoji: "🏛️", title: "Finding Government-Supported Housing", text: "Government support varies significantly by city and state. Offerings could include public housing, Section 8 vouchers, or rent-subsidy programs. It’s important to apply to these programs early as they may be in high demand." },
      { emoji: "🌍", title: "Nonprofits and Community Alternatives", text: "Nonprofits and co-ops can provide alternative affordable housing solutions. Co-ops allow residents to pool resources, share ownership, and reduce individual costs. These options, which may be organized independently or through nonprofits can increase affordability while also developing community." },
      { emoji: "🤖", title: "Find Local Resources", text: "", html: "<div class='ai-search-tool' id='aiSearch3'><h3>Find Affordable Housing Resources</h3><p>Enter your zip code to discover housing assistance near you.</p><div class='ai-input-group'><input type='text' id='zip3' placeholder='ZIP Code' maxlength='5'><select id='type3'><option value='rent'>I am renting</option><option value='own'>I own a home</option></select><button onclick='simulateAISearch(3)' class='ai-btn'>Search</button></div><div id='aiResults3' class='ai-results hidden'><div class='loader'>Searching local databases...</div></div></div>" }
    ]
  },
  {
    id: 6,
    title: "The Urban Housing Crisis",
    author: "Tyler George",
    icon: "🏙️",
    description: "Why cities are facing extreme housing shortages and what can be done.",
    lessons: 5,
    time: "10 min",
    slides: [
      { emoji: "🏙️", title: "Why Are Urban Areas More Expensive?", text: "Cities are generally wealthier, as high-paying jobs drive up housing demand. Furthermore, developers typically deal with limited land and a desire for high-quality amenities in apartments. As urban areas develop, many residents can move in quickly, creating sudden competition for housing while supply takes a while to catch up." },
      { emoji: "🧱", title: "Ongoing Challenges", text: "Local governments can play a big role in housing development, particularly through zoning restrictions that limit where new housing can be built or how large buildings can be. Construction delays and high material costs, particularly with global trade uncertainty, can slow the development of new units. Local opposition through “NIMBY” movements also slow housing development in certain areas." },
      { emoji: "💡", title: "Emerging Solutions", text: "Some cities have relaxed or removed zoning laws to enable more multifamily or low income housing. Other effective policies include requiring affordable units in new construction or incentivizing low-cost construction. Deregulation generally helps expand housing supply in urban areas." },
      { emoji: "📚", title: "Resources", text: "Urban areas typically have more robust local government, which may support affordable housing initiatives. Furthermore, nonprofits are typically located in urban areas, providing rental assistance and community-based options to find housing. Residents generally have broader access to public and private networks in comparison to rural areas." },
      { emoji: "🤖", title: "Find Local Resources", text: "", html: "<div class='ai-search-tool' id='aiSearch4'><h3>Urban Housing Assistance Locator</h3><p>Find programs active in your zip code.</p><div class='ai-input-group'><input type='text' id='zip4' placeholder='ZIP Code' maxlength='5'><select id='type4'><option value='rent'>I am renting</option><option value='own'>I own a home</option></select><button onclick='simulateAISearch(4)' class='ai-btn'>Search</button></div><div id='aiResults4' class='ai-results hidden'><div class='loader'>Searching local databases...</div></div></div>" }
    ]
  },
  {
    id: 7,
    title: "Rural Housing Crisis",
    author: "Christopher Wang",
    icon: "🌾",
    description: "The unique challenges making homeownership and renting difficult in rural communities.",
    lessons: 6,
    time: "12 min",
    slides: [
      { emoji: "🚜", title: "Definition & Rural Specifics", text: "Median home sale price has increased by 61% in rural areas, it currently sits at ~$280K (compared w/ 49% in suburban areas, 46% in urban areas).\n\nHomebuyers need to earn an annual income of ~$75K to afford a median-priced home (105% increase compared to pre-pandemic numbers). Pre-pandemic, rural residents needed an annual income of ~$36K." },
      { emoji: "🧩", title: "Specific Drivers of the Rural Crisis", text: "", html: "<div class='interactive-drivers'><p class='drivers-intro'>Click on a driver to learn more about why rural housing remains unaffordable.</p><div class='drivers-grid'><button class='driver-btn' onclick='toggleDriver(1)'>Pandemic-era Surge</button><button class='driver-btn' onclick='toggleDriver(2)'>Stagnant Wages</button><button class='driver-btn' onclick='toggleDriver(3)'>Limited Supply</button><button class='driver-btn' onclick='toggleDriver(4)'>Construction Costs</button><button class='driver-btn' onclick='toggleDriver(5)'>Cookie-Cutter Policies</button></div><div id='driverInfoBox' class='driver-info-box hidden'></div></div>" },
      { emoji: "🛠️", title: "Specific Solutions", text: "• ROAD to Housing Act (2025 bipartisan senate bill)\n• Grants to local govts to implement pre-approved housing designs (10% of funding reserved for rural areas)\n• Preserve existing affordable units by decoupling rental assistance from maturing USDA mortgages.\n• Reduce regulatory barriers." },
      { emoji: "📚", title: "Specific Resources", text: "• USDA Rural Housing Service (loans, grants)\n• Housing Assistance Council (credit, maintaining stock, building housing)\n• National Low Income Housing Coalition (NLIHC) rural renter’s factsheet." },
      { emoji: "🤖", title: "Find Rural Resources", text: "", html: "<div class='ai-search-tool' id='aiSearch5'><h3>Find USDA & Rural Housing Assistance</h3><p>Enter your zip code to discover rural housing resources.</p><div class='ai-input-group'><input type='text' id='zip5' placeholder='ZIP Code' maxlength='5'><select id='type5'><option value='rent'>I am renting</option><option value='own'>I own a home</option></select><button onclick='simulateAISearch(5)' class='ai-btn'>Search</button></div><div id='aiResults5' class='ai-results hidden'><div class='loader'>Searching local databases...</div></div></div>" },
      { emoji: "🌟", title: "Example: McCall, Idaho", text: "McCall, an idyllic rural town in western Idaho, has been severely affected by the housing affordability crisis. Due to a surge in demand from urban residents interested in moving to McCall from nearby cities like Boise for remote work, or interested in buying a vacation home.\n\nThis has led housing prices to surge, pricing residents out. Drastic measures have been taken, such as the local hospital spending over $1 million to build housing for employees, who are leaving because they cannot afford to live in this town with a population of just over 4,000." }
    ]
  },
  {
    id: 8,
    title: "Looking Forward",
    author: "Christopher Wang",
    icon: "🔭",
    description: "Where we stand now, problematic headwinds, and hopeful news on the horizon.",
    lessons: 4,
    time: "8 min",
    slides: [
      { emoji: "📍", title: "Where we stand now", text: "• 53% of Americans spend more than ½ of their household income on housing\n• Shortage of 3-4 million homes\n• Median first-time home buyer is 40 yrs old (up from 33 in 2021)\n• 18% of Americans experiencing homelessness\n• ⅓ of young adults (18-34) live in their parents’ home" },
      { emoji: "⚠️", title: "Problematic Headwinds", text: "Federal budget cuts threaten housing safety nets. Climate disasters are increasing in frequency and strength, destroying housing stock and sending insurance rates skyrocketing (up 11% in 2023 alone). Homelessness is at a record high, concentrated in urban areas where current resources cannot match the demand." },
      { emoji: "🌱", title: "Some Hopeful News", text: "• Momentum! Over 400 land-use change bills introduced in early 2025.\n• Housing finance reforms like permanently raising 9% credit allocations and cutting bond financing thresholds from 50% to 25%.\n• Wages rising (a 3.5% projected increase in 2026) and 19 states raised their minimum wages." },
      { emoji: "⚙️", title: "What Needs to Happen", text: "• Housing regulation reform (zoning, density)\n• Adaptive (re)use of empty commercial spaces\n• Financial reforms supporting construction without cuts to HUD programs\n• Modular construction and off-site building to reduce construction costs and timelines." }
    ]
  },
  {
    id: 9,
    title: "What YOU can do",
    author: "Tyler George",
    icon: "🫵",
    description: "Actionable steps you can take today to protect yourself and advocate for your community.",
    lessons: 5,
    time: "10 min",
    slides: [
      { emoji: "🔍", title: "Locate housing assistance programs", text: "Local, state, and the federal government have housing assistance programs available to those struggling to find affordable housing. These are available for first-time home buyers, renters, and those who already own a home." },
      { emoji: "👤", title: "Use a HUD-approved housing counselor", text: "Get expert advice from a HUD-approved counselor or agency to help guide your decision." },
      { emoji: "🗣️", title: "Advocate", text: "Advocate for yourself and your community’s housing needs through attending zoning meetings or speaking with your member of congress." },
      { emoji: "📖", title: "Know your rights (renters)", text: "Eviction requirements, habitability standards, and rent increase limits vary by city and state. Knowing the laws surrounding housing will help you protect yourself! Check out the NHLP Green Book." },
      { emoji: "⏱️", title: "Ownership Timeline calculator", text: "Determining the right type of housing, the appropriate down payment, or how much to save each month can be daunting. Use online calculators or spreadsheets to help you plan properly!" }
    ]
  }
];

let currentStory = null;
let currentSlideIndex = 0;

function initializeStories() {
  const grid = document.getElementById('storiesGrid');
  grid.innerHTML = '';

  stories.forEach((story, index) => {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.onclick = () => openStory(story);

    card.innerHTML = `
      <div class="story-header">
        <div>
          <span class="story-number">Lesson ${String(index + 1).padStart(2, '0')}</span>
          <span class="story-icon">${story.icon}</span>
          <h3 class="story-title">${story.title}</h3>
          <p class="story-author">by ${story.author}</p>
          <div class="story-meta">
            <div class="meta-item">
              <span>📖</span>
              <span>${story.slides.length} Slides</span>
            </div>
            <div class="meta-item">
              <span>⏱️</span>
              <span>${story.time}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function openStory(story) {
  currentStory = story;
  currentSlideIndex = 0;

  const viewer = document.getElementById('storyViewer');
  const metaTitle = document.getElementById('storyMetaTitle');
  const progress = document.getElementById('storyProgress');

  viewer.classList.add('active');
  metaTitle.textContent = story.title;

  progress.innerHTML = '';
  story.slides.forEach((slide, index) => {
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    if (index === 0) bar.classList.add('active');
    bar.innerHTML = '<div class="progress-fill"></div>';
    progress.appendChild(bar);
  });

  showSlide(0);
  document.body.style.overflow = 'hidden';
}

function closeStory() {
  document.getElementById('storyViewer').classList.remove('active');
  currentStory = null;
  document.body.style.overflow = '';
}

function showSlide(index) {
  if (!currentStory || index < 0 || index >= currentStory.slides.length) return;

  currentSlideIndex = index;
  const slide = currentStory.slides[index];

  document.getElementById('slideEmoji').textContent = slide.emoji || '';
  document.getElementById('slideTitle').textContent = slide.title || '';
  
  const slideText = document.getElementById('slideText');
  if (slide.html) {
    slideText.innerHTML = slide.html;
  } else {
    slideText.textContent = slide.text || '';
  }

  const backgrounds = ['gradient-bg-1', 'gradient-bg-2', 'gradient-bg-3', 'gradient-bg-4',
    'gradient-bg-5', 'gradient-bg-6', 'gradient-bg-7', 'gradient-bg-8'];
  const bgElement = document.getElementById('slideBackground');
  bgElement.className = 'slide-background ' + backgrounds[index % backgrounds.length];

  const progressBars = document.querySelectorAll('.progress-bar');
  progressBars.forEach((bar, i) => {
    if (i <= index) {
      bar.classList.add('active');
    } else {
      bar.classList.remove('active');
    }
  });
}

function nextSlide() {
  if (currentSlideIndex < currentStory.slides.length - 1) {
    showSlide(currentSlideIndex + 1);
  } else {
    closeStory();
  }
}

function previousSlide() {
  if (currentSlideIndex > 0) {
    showSlide(currentSlideIndex - 1);
  }
}

// Interactive Feature: Rural Housing Drivers
const ruralDriversData = {
  1: { title: "Pandemic-era Surge", text: "Home prices rose due to mass migration from big cities to rural areas. Urban residents were seeking a lower cost of living, a vacation home, or were able to move due to remote work. Housing remains affordable to urban migrants, NOT to rural residents who are being outpriced." },
  2: { title: "Stagnant Wages", text: "Median income has increased the least (33%), it currently sits at ~$69K compared to suburban (37%) and urban (39%) areas." },
  3: { title: "Limited Supply", text: "Rural areas saw additional pressures because of the already limited housing supply that existed before the pandemic." },
  4: { title: "Rising Construction Costs", text: "Developers are struggling to finance new construction in the face of rising operating costs, modest income growth, and higher interest rates (tariffs are also a driver of increased construction costs)." },
  5: { title: "Ill-fitting Cookie-Cutter Policies", text: "Many national policies are built around scales and capacities that don't work in rural areas. Rural areas don't have non-profit developers and large construction pipelines found in urban areas." }
};

window.toggleDriver = function(driverId) {
  const box = document.getElementById('driverInfoBox');
  const data = ruralDriversData[driverId];
  if (data) {
    box.innerHTML = "<h4>" + data.title + "</h4><p>" + data.text + "</p>";
    box.classList.remove('hidden');
    box.classList.add('visible');
  }
};

// Interactive Feature: AI Search Tool
window.simulateAISearch = function(instanceId) {
  const zipInput = document.getElementById('zip' + instanceId);
  const typeSelect = document.getElementById('type' + instanceId);
  const resultsDiv = document.getElementById('aiResults' + instanceId);
  
  const zip = zipInput.value.trim();
  if (zip.length < 5) {
    alert("Please enter a valid 5-digit ZIP code.");
    return;
  }
  
  resultsDiv.innerHTML = "<div class='loader'>Searching local databases for " + zip + "...</div>";
  resultsDiv.classList.remove('hidden');
  resultsDiv.classList.add('visible');
  
  setTimeout(() => {
    let html = "<h4>✨ Resources Found for " + zip + "</h4>";
    html += "<ul class='ai-resource-list'>";
    html += "<li><a href='https://www.211.org/' target='_blank'><strong>211 Resource Finder</strong> - Essential community services</a></li>";
    html += "<li><a href='https://hudgov-answers.force.com/housingcounseling/s/?language=en_US' target='_blank'><strong>HUD Counseling</strong> - Speak with a local expert</a></li>";
    
    if (typeSelect.value === 'rent') {
      html += "<li><a href='https://nlihc.org/era-dashboard' target='_blank'><strong>NLIHC ERA</strong> - Emergency Rental Assistance</a></li>";
    } else {
      html += "<li><a href='https://www.consumerfinance.gov/housing/' target='_blank'><strong>CFPB Housing Tools</strong> - Homeowner support</a></li>";
    }
    
    html += "</ul><p class='ai-footnote'>* Results simulated for demonstration</p>";
    
    resultsDiv.innerHTML = html;
  }, 1500);
};

document.addEventListener('keydown', (e) => {
  if (currentStory) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      previousSlide();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeStory();
    }
  }
});

const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

function initializeMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initializeMobileMenu();
  initializeStories();
});
