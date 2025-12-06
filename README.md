# FinMango Website

**Financial Health Is A Right, Not A Privilege**

Official website for FinMango, a 501(c)(3) nonprofit solving complex problems that endanger the financial health of young adults and vulnerable communities.

## 🌐 Live Site
[https://www.finmango.org](https://www.finmango.org)

## 📊 Impact
- **1M+** people impacted globally
- **100+** countries reached
- **75K+** students educated
- Partnerships with Google Health, WHO, World Bank, IMF

## 🎯 Our Work

### Research
Leveraging exclusive Google Trends API access and AI technologies to deliver real-time financial health indicators used by international organizations.

### Education
Teaching students about investing and retirement planning through digital calculators and interactive tools reaching hundreds of thousands annually.

### Advocacy
Empowering young leaders through our Ambassador program to drive change in their communities.

## 🏗️ Architecture

This website uses a **self-contained HTML approach** where each page includes all necessary CSS and JavaScript inline. This design choice provides:

- ✅ **Zero dependencies** - Each page works independently
- ✅ **No build process** - Direct editing, instant deployment
- ✅ **Simple hosting** - Works on any static host
- ✅ **No cache issues** - Updates appear immediately

### Directory Structure

```
website/
├── index.html              # Homepage
├── about.html             # About us
├── research.html          # Research initiatives
├── education.html         # Education programs
├── advocacy.html          # Advocacy & ambassadors
├── resources.html         # Tools and calculators
├── barrier-breakers.html  # Innovation challenge
├── donate.html            # Donation page
├── get-involved.html      # Volunteer opportunities
├── privacy.html           # Privacy policy
├── terms.html             # Terms of service
├── history.html           # Our history
├── approach.html          # Our methodology
├── [tool].html            # Calculator pages
├── [person].html          # Team/ambassador profiles
├── *.png, *.jpg           # Images (120MB total)
└── favicon.png            # Site icon
```

## 🚀 Quick Start

### Viewing Locally

Simply open any HTML file in a web browser:

```bash
# Clone the repository
git clone https://github.com/finmango/website.git
cd website

# Open in browser (macOS)
open index.html

# Or (Linux)
xdg-open index.html

# Or (Windows)
start index.html
```

### Deploying

Upload all files to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web server

## ✏️ Making Updates

### Updating a Single Page

Edit the HTML file directly:

```bash
# Open in your preferred editor
code about.html      # VS Code
nano about.html      # Terminal
vim about.html       # Vim
```

### Updating Navigation or Footer

Since navigation and footer are in all 69 HTML files, use find & replace:

**Option 1: Using VS Code**
1. Open the entire folder in VS Code
2. Press `Cmd/Ctrl + Shift + H` for global find & replace
3. Find the old HTML snippet
4. Replace with new snippet
5. Replace in all files

**Option 2: Using sed (terminal)**
```bash
# Example: Update a navigation link
sed -i 's|old-link.html|new-link.html|g' *.html
```

**Option 3: Using the helper script**
```bash
# See update-template.sh in the repository
./update-template.sh
```

### Updating Common Styles

All pages share similar CSS variables. To update global styles:

1. Choose a template file (e.g., `index.html`)
2. Make CSS changes in the `<style>` tag
3. Copy the entire `<style>...</style>` block
4. Use find & replace to update all files:
   - Find: `<style>` to `</style>` (old content)
   - Replace: Your new style block

## 🖼️ Image Optimization

**Current State:** 120MB of images (some files 1-3MB each)

### Recommended Optimization Process

1. **Compress existing images** (one-time task):
   ```bash
   # Install ImageMagick
   # macOS: brew install imagemagick
   # Ubuntu: sudo apt-get install imagemagick

   # Compress PNGs
   find . -name "*.png" -exec convert {} -quality 85 -strip {} \;

   # Compress JPGs
   find . -name "*.jpg" -exec convert {} -quality 85 -strip {} \;
   ```

2. **Use WebP format** for modern browsers:
   ```bash
   # Convert to WebP
   find . -name "*.png" -exec cwebp -q 85 {} -o {}.webp \;
   ```

3. **Add lazy loading** to images:
   ```html
   <img src="image.jpg" alt="Description" loading="lazy">
   ```

4. **Optimize new images before adding**:
   - Use https://tinypng.com/ or https://squoosh.app/
   - Target: <500KB for hero images, <200KB for photos

### Target Metrics
- Total size: ~30-40MB (down from 120MB)
- Largest file: <500KB
- Page load: <2 seconds on 4G

## 🔗 Fixing Dead Links

Current dead links to fix:
- Footer: Privacy and Terms links (`#`) → `privacy.html`, `terms.html`
- Team page: Some member links go to `#` → Create profile pages or remove links

## 🧪 Testing

### Manual Testing Checklist

Before deploying:
- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Check all navigation links work
- [ ] Verify forms submit correctly
- [ ] Test calculators function properly
- [ ] Validate HTML: https://validator.w3.org/
- [ ] Check accessibility: https://wave.webaim.org/

### Link Checker

```bash
# Install broken-link-checker
npm install -g broken-link-checker

# Run against local files
blc http://localhost:8000 -ro
```

## 📈 Analytics

Google Analytics tracking is implemented on all pages (ID: `G-DW5HBYS9JW`).

View analytics at: https://analytics.google.com/

## 🍎 Food Assistance Calculator

The Food Assistance Calculator (`food-assistance-calculator.html`) helps users determine their potential eligibility for SNAP (food stamps) and connects them with local resources to apply.

### How It Works

**Step 1: Location & Language**
- User enters their ZIP code
- Language preference selection

**Step 2: Household Information**
- Total household size (people who live together and prepare food together)
- Number of children under 5 (for WIC eligibility check)
- Adults 60+ or with disabilities (affects eligibility rules)
- Work-eligible adults ages 18-59 (may affect work requirements)

**Step 3: Income & Expenses**
- Gross monthly income (before taxes)
- Monthly rent or mortgage
- Monthly childcare/dependent care costs

**Step 4: Results**
The calculator displays:
- **Eligibility Status**: Likely Eligible, Borderline, or Likely Not Eligible
- **Estimated Monthly Benefit**: Dollar range based on household size and income
- **Nearby Resources**: Grocery stores and markets accepting SNAP
- **Next Steps**: Personalized action items
- **WIC Alert**: Shown if household has children under 5
- **Local Help**: Connects users with local organizations that provide free SNAP application assistance

### Eligibility Calculation Logic

The calculator uses federal SNAP guidelines (2024):

**Gross Income Limits (130% Federal Poverty Level):**
| Household Size | Monthly Limit |
|----------------|---------------|
| 1 | $1,580 |
| 2 | $2,137 |
| 3 | $2,694 |
| 4 | $3,251 |
| Each additional | +$557 |

**Deductions Applied:**
- 50% of rent/mortgage costs
- 100% of childcare/dependent care costs

**Benefit Estimation (2024 Max Allotments):**
| Household Size | Max Monthly Benefit |
|----------------|---------------------|
| 1 | $291 |
| 2 | $535 |
| 3 | $766 |
| 4 | $973 |
| Each additional | ~+$244 |

Estimated benefit = Max allotment - (30% of adjusted income), minimum $23/month.

### Local SNAP Help Coverage

The calculator provides personalized local SNAP application assistance for **every ZIP code in the United States**.

**Coverage Tiers:**

1. **Metro-Specific Resources (40+ cities)** - Links directly to local food bank SNAP outreach programs
2. **State-Level Fallbacks (All 50 states + DC + PR)** - Links to state food bank associations

**Metro Areas with Specific Coverage:**

| Region | Cities Covered |
|--------|----------------|
| **Northeast** | NYC, Long Island, Boston, Philadelphia, Pittsburgh, Newark/NJ |
| **Southeast** | Atlanta, Miami, Tampa, Orlando, Jacksonville, Charlotte, Raleigh, Nashville, Memphis |
| **Midwest** | Chicago, Detroit, Cleveland, Columbus, Cincinnati, Indianapolis, Minneapolis/St. Paul, St. Louis, Kansas City, Milwaukee |
| **Southwest** | Phoenix, Tucson, Houston, Dallas, Fort Worth, San Antonio, Austin, Denver, Las Vegas |
| **West** | Los Angeles, San Francisco, Oakland, San Diego, Seattle, Portland |
| **Capital Region** | Washington DC, Baltimore |

**State-Level Coverage:**
All 50 states plus DC and Puerto Rico have fallback resources linking to their state food bank networks.

**How ZIP Code Matching Works:**
1. Extract first 3 digits of ZIP code
2. Check against metro-specific database
3. If no match, determine state from ZIP range and use state resource
4. Display personalized resource with direct link to local help

### Data Sources

- **Eligibility Rules**: USDA SNAP Program Guidelines
- **Income Limits**: 2024 Federal Poverty Level Guidelines
- **Benefit Amounts**: USDA Maximum SNAP Allotments (FY2024)
- **Local Resources**: Feeding America network member food banks

### Disclaimer

The calculator provides estimates only and is not an official SNAP application. Final eligibility is determined by state agencies. Income limits and deduction rules vary by state.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Quick overview:
1. Make changes to HTML files
2. Test locally in browser
3. If updating navigation/footer, update all files
4. Optimize any new images
5. Test on mobile
6. Commit and push

## 📝 Content Guidelines

### Writing Style
- Clear, direct language
- Focus on impact and action
- Avoid jargon
- Use data to support claims
- Include calls-to-action

### SEO Best Practices
- Descriptive page titles (<60 characters)
- Meta descriptions (150-160 characters)
- Alt text for all images
- Semantic HTML headings (h1 → h2 → h3)
- Internal linking between pages

## 🔒 Security

- No server-side code (static HTML)
- No user data collection beyond analytics
- HTTPS enforced
- Content Security Policy recommended
- Regular dependency updates (Chart.js, etc.)

## 📞 Support

- Website issues: Open a GitHub issue
- Content questions: hello@finmango.org
- General inquiries: hello@finmango.org

## 📄 License

© 2025 FinMango. All rights reserved.

**EIN:** 81-2543425

---

Built with ❤️ by the FinMango team to fight financial inequality.
