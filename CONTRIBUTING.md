# Contributing to FinMango Website

Thank you for your interest in contributing to FinMango! This guide will help you make effective updates to our website.

## 🎯 Quick Links

- [Getting Started](#getting-started)
- [Making Changes](#making-changes)
- [Code Duplication Strategy](#code-duplication-strategy)
- [Image Guidelines](#image-guidelines)
- [Testing](#testing)
- [Deployment](#deployment)

## 🚀 Getting Started

### Prerequisites

- Text editor (VS Code, Sublime, Atom, etc.)
- Web browser for testing
- Basic HTML/CSS knowledge
- Git for version control

### Setup

```bash
# Clone the repository
git clone https://github.com/finmango/website.git
cd website

# Create a new branch
git checkout -b feature/your-feature-name

# Open in your editor
code .
```

## ✏️ Making Changes

### Single Page Updates

For updates to a single page (e.g., updating content on the About page):

1. Open the specific HTML file
2. Make your changes
3. Test in browser
4. Commit

```bash
# Edit the file
code about.html

# Test locally
open about.html

# Commit
git add about.html
git commit -m "Update About page content"
```

### Multi-Page Updates (Navigation, Footer, Styles)

Our website uses **inline CSS and repeated HTML** across 69 files. This is intentional for simplicity, but requires careful updating.

#### Option 1: VS Code Find & Replace (Recommended)

1. **Open folder in VS Code**
   ```bash
   code .
   ```

2. **Open Find & Replace**
   - Press `Cmd + Shift + H` (Mac) or `Ctrl + Shift + H` (Windows/Linux)

3. **Enter search and replace**
   - Find: Old HTML/CSS snippet
   - Replace: New HTML/CSS snippet
   - Files to include: `*.html`

4. **Preview changes**
   - Click on results to preview each match
   - Use "Replace All" only when confident

5. **Test multiple pages**
   - Open 3-4 different pages to verify
   - Check home, about, and a calculator page

#### Option 2: Command Line (sed)

For simple text replacements:

```bash
# Update a link across all HTML files
sed -i '' 's|old-link.html|new-link.html|g' *.html

# Update a navigation item
sed -i '' 's|<a href="old.html">Old</a>|<a href="new.html">New</a>|g' *.html
```

**⚠️ Warning:** Test on a single file first!

```bash
# Test on one file
sed 's|old|new|g' index.html > test.html
open test.html
# If it looks good, run on all files
```

#### Option 3: Helper Script

Use our update template script:

```bash
./update-template.sh
```

### Common Update Scenarios

#### Adding a New Navigation Link

1. Find the navigation section in `index.html`:
   ```html
   <div class="nav-right">
     <a href="about.html">About</a>
     <a href="research.html">Research</a>
     <!-- Add new link here -->
   </div>
   ```

2. Add your new link:
   ```html
   <a href="new-page.html">New Page</a>
   ```

3. Copy the entire `<nav>...</nav>` section

4. Use VS Code Find & Replace:
   - Find: `<nav id="nav">` through `</nav>` (the old nav)
   - Replace: Your new nav HTML
   - Replace in all `*.html` files

5. Don't forget the mobile menu:
   ```html
   <div class="mobile-menu" id="mobileMenu">
     <a href="about.html">About</a>
     <!-- Add here too -->
   </div>
   ```

#### Updating Footer Content

Same process as navigation:

1. Edit footer in `index.html`
2. Copy entire `<footer>...</footer>` block
3. Find & replace across all files

#### Changing Global Styles

1. Open `index.html`
2. Find the `<style>` tag
3. Make your CSS changes
4. Test thoroughly
5. Copy entire style block
6. Replace across all files

**Example:** Changing primary color:

```css
/* Old */
--orange: #FF6B35;

/* New */
--orange: #FF8C42;
```

Then find & replace the entire `<style>` block.

## 🖼️ Image Guidelines

### Before Adding Images

**Optimize first!** Large images slow down the site.

#### Optimization Tools

**Online (easiest):**
- https://tinypng.com/ - PNG/JPG compression
- https://squoosh.app/ - Multiple formats
- https://imageoptim.com/ - Mac app

**Command line:**
```bash
# Install ImageMagick
brew install imagemagick  # macOS
sudo apt install imagemagick  # Ubuntu

# Compress PNG (85% quality)
convert input.png -quality 85 -strip output.png

# Compress JPG
convert input.jpg -quality 85 -strip output.jpg

# Resize large images
convert input.png -resize 1200x output.png
```

### Image Size Guidelines

| Image Type | Max Dimensions | Max File Size | Format |
|------------|----------------|---------------|---------|
| Hero images | 1400px wide | 500KB | PNG/JPG |
| Section images | 1200px wide | 300KB | PNG/JPG |
| Team photos | 400px × 400px | 100KB | PNG/JPG |
| Icons | 200px × 200px | 50KB | PNG |
| Logos | 400px wide | 50KB | PNG |

### Adding Images to HTML

Always include:
- Descriptive alt text
- `loading="lazy"` for below-fold images
- Width/height to prevent layout shift

```html
<!-- Hero image (loads immediately) -->
<img src="hero.png" alt="Students learning about financial health" width="1200" height="800">

<!-- Below-fold image (lazy load) -->
<img src="team-photo.jpg" alt="FinMango team at Kent State" loading="lazy" width="600" height="400">
```

### Image Naming

- Use descriptive names: `team-photo-2024.jpg` not `IMG_1234.jpg`
- Use lowercase and hyphens: `barrier-breakers-logo.png`
- No spaces: `kent state.jpg` ❌ → `kent-state.jpg` ✅

## 🧪 Testing

### Pre-Commit Checklist

- [ ] View page in browser (Chrome, Firefox, Safari)
- [ ] Test on mobile (responsive design)
- [ ] Click all links on the page
- [ ] Check console for errors (F12 → Console)
- [ ] Verify images load
- [ ] Test any forms or calculators
- [ ] Spell check content

### Cross-Browser Testing

Test on multiple browsers:
- ✅ Chrome (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Firefox
- ✅ Edge

### Mobile Testing

```bash
# Run a local server
python3 -m http.server 8000

# Then visit on your phone:
# http://YOUR_COMPUTER_IP:8000
```

Or use browser dev tools:
- Chrome: F12 → Device toolbar
- Safari: Develop → Enter Responsive Design Mode

### Validation Tools

**HTML Validation:**
```bash
# Visit https://validator.w3.org/
# Upload your HTML file or enter URL
```

**Accessibility Check:**
```bash
# Visit https://wave.webaim.org/
# Enter your page URL
```

**Performance Check:**
```bash
# Visit https://pagespeed.web.dev/
# Enter your page URL
# Target: 90+ score
```

## 📝 Content Guidelines

### Writing Style

**Do:**
- Use clear, direct language
- Focus on impact ("75,000+ students educated")
- Include specific numbers and data
- Write for action (CTAs)
- Break up long paragraphs

**Don't:**
- Use jargon without explanation
- Make vague claims without data
- Write walls of text
- Forget calls-to-action

### SEO Best Practices

Every page should have:

```html
<title>Specific Page Title - FinMango</title>
<meta name="description" content="Compelling 150-160 character description with keywords">
```

**Title Guidelines:**
- Under 60 characters
- Include main keyword
- End with "- FinMango"

**Meta Description Guidelines:**
- 150-160 characters
- Include primary keyword
- Compelling call-to-action
- Unique per page

### Accessibility

**Images:**
```html
<!-- Descriptive alt text -->
<img src="calculator.png" alt="FIRE calculator showing retirement timeline">

<!-- Decorative images -->
<img src="decoration.png" alt="">
```

**Links:**
```html
<!-- Descriptive link text -->
<a href="donate.html">Support Our Mission</a>

<!-- Not just "click here" -->
<a href="donate.html">click here</a> ❌
```

**Headings:**
```html
<!-- Logical hierarchy -->
<h1>Main Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection</h3>

<!-- Don't skip levels -->
<h1>Title</h1>
  <h3>Subsection</h3> ❌
```

## 🚀 Deployment

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/update-about-page

# 2. Make changes
# ... edit files ...

# 3. Test locally
open index.html

# 4. Stage changes
git add .

# 5. Commit with descriptive message
git commit -m "Update About page team section with new members"

# 6. Push to remote
git push origin feature/update-about-page

# 7. Create pull request on GitHub
# Visit repository and click "Compare & pull request"
```

### Commit Message Format

```bash
# Good commit messages:
git commit -m "Add Privacy Policy page"
git commit -m "Update navigation with new Resources link"
git commit -m "Optimize hero images (3.4MB → 500KB)"
git commit -m "Fix broken links in footer across all pages"

# Bad commit messages:
git commit -m "updates" ❌
git commit -m "fix stuff" ❌
git commit -m "asdf" ❌
```

### Deployment Process

1. **Merge to main branch**
2. **Automatic deployment** (if GitHub Pages configured)
3. **Or manual upload** to hosting provider

## 🔧 Code Duplication Strategy

### Why We Use Inline CSS

Our approach prioritizes:
- **Simplicity** - No build process
- **Independence** - Each page works standalone
- **Speed** - No external resource loading
- **Reliability** - No broken CSS links

### Managing Duplication

**Strategy 1: Update Templates**
1. Keep `index.html` as the master template
2. When updating nav/footer/styles, update index.html first
3. Test thoroughly
4. Then propagate to all other files

**Strategy 2: Batch Updates**
- Group navigation/footer updates
- Do them all at once (quarterly?)
- Use find & replace
- Test 5-10 random pages

**Strategy 3: Component Checklist**

When updating global components:

- [ ] Navigation
  - [ ] Desktop nav
  - [ ] Mobile nav
  - [ ] Nav on scroll (scrolled class)
- [ ] Footer
  - [ ] Links
  - [ ] Social media
  - [ ] Copyright year
- [ ] Styles
  - [ ] CSS variables
  - [ ] Common components
  - [ ] Responsive breakpoints

## 🐛 Common Issues

### Issue: Find & Replace Changed Too Much

**Solution:**
```bash
# Undo with git
git checkout -- *.html

# Or restore specific file
git checkout -- about.html
```

### Issue: Navigation Broken on Mobile

**Check:**
- Mobile menu HTML (`<div class="mobile-menu">`)
- Mobile menu button JavaScript
- CSS media queries `@media (max-width: 968px)`

### Issue: Images Not Loading

**Check:**
- File path is correct (case-sensitive)
- Image file exists in directory
- File extension matches (`.png` vs `.PNG`)

### Issue: Styles Not Applying

**Check:**
- CSS is inside `<style>` tags
- No typos in class names
- Specificity (more specific selectors win)
- Browser cache (hard refresh: Cmd+Shift+R)

## 📞 Getting Help

- **Questions:** Open a GitHub issue
- **Code review:** Tag maintainers in PR
- **Urgent issues:** hello@finmango.org

## 🎉 Thank You!

Your contributions help us fight financial inequality and improve financial health for millions. Every update makes a difference!

---

**FinMango** - Financial Health Is A Right, Not A Privilege
