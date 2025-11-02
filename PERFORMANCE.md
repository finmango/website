# Performance Optimization Guide

This document explains the performance optimizations implemented and how to enable caching.

## ✅ Implemented Optimizations

### 1. Image Optimization (Completed)
- **Result**: Reduced total image size from 120MB to 96MB (20% reduction)
- Compressed all images using Pillow
- Converted large PNGs to JPEG for better compression
- All images include `loading="lazy"` attribute

### 2. Render-Blocking Resources (Completed)
- **Result**: Eliminated ~1,830ms of render blocking time
- Google Fonts now load asynchronously (non-blocking)
- Removed `@import` CSS for fonts
- Added comprehensive font fallbacks for faster initial render
- Google Analytics already uses `async` attribute

### 3. LCP Optimization (Completed)
- **Result**: Faster Largest Contentful Paint
- Added `<link rel="preload">` for hero image
- Used `fetchpriority="high"` attribute
- Hero image properly sized and compressed

## 🔧 Cache Headers Configuration

Cache headers significantly improve repeat visits but require server-side configuration.

### Option 1: Use Cloudflare (Recommended for GitHub Pages)

GitHub Pages doesn't support custom cache headers. Add Cloudflare as a CDN proxy:

1. **Sign up for Cloudflare** (free plan works)
2. **Add your domain** to Cloudflare
3. **Update nameservers** at your domain registrar
4. **Configure Page Rules** in Cloudflare dashboard:

```
www.finmango.org/*
- Browser Cache TTL: 1 year
- Edge Cache TTL: 1 month

www.finmango.org/*.html
- Browser Cache TTL: 1 hour
```

**Expected savings**: ~456 KiB on repeat visits

### Option 2: Migrate to Netlify

Netlify supports the `_headers` file included in this repo:

1. **Deploy to Netlify** (connect GitHub repo)
2. The `_headers` file will automatically apply
3. Build command: (none needed - static site)
4. Publish directory: `/`

**Expected savings**: ~456 KiB on repeat visits

### Option 3: Migrate to Cloudflare Pages

1. **Connect GitHub repo** to Cloudflare Pages
2. The `_headers` file will automatically apply
3. Framework preset: None
4. Build command: (none)
5. Output directory: `/`

**Expected savings**: ~456 KiB on repeat visits

## 📊 Current Performance Scores

### Desktop: ✅ Excellent
- All Core Web Vitals passing

### Mobile: ⚠️ Good (Can be improved with caching)
- **Without cache headers**: ~80-85 score
- **With cache headers**: Expected 90+ score

## 🎯 Additional Optimizations (Optional)

### 1. Convert to WebP Format
WebP images are 25-35% smaller than JPEG with same quality:

```bash
# Install webp tools
apt-get install webp

# Convert images
for file in *.jpg; do
  cwebp -q 85 "$file" -o "${file%.jpg}.webp"
done

# Update HTML to use <picture> with WebP fallback
<picture>
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero">
</picture>
```

**Expected savings**: Additional 200-300 KiB

### 2. Minify HTML
Reduce HTML file size by removing whitespace:

```bash
npm install -g html-minifier
html-minifier --collapse-whitespace --remove-comments index.html -o index.min.html
```

**Expected savings**: 50-100 KiB

### 3. Use CSS/JS Minification
Currently inline CSS is un-minified (easier to edit). For production:

```bash
# Use online tools or:
npm install -g csso-cli
csso style.css -o style.min.css
```

**Expected savings**: 20-30 KiB

### 4. Critical CSS (Advanced)
Extract above-the-fold CSS and inline it, defer the rest:

```bash
npm install -g critical
critical index.html --base ./ --inline > index-critical.html
```

**Expected savings**: Additional 200-300ms on mobile

## 🔍 How to Test

1. **Google PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Test both mobile and desktop
   - Aim for 90+ scores

2. **WebPageTest**
   - https://www.webpagetest.org/
   - Use "Mobile" device
   - Check "First View" vs "Repeat View" (cache impact)

3. **Chrome DevTools**
   - Open DevTools → Network tab
   - Throttle to "Slow 3G"
   - Check load times

## 📈 Expected Results

### Before Optimizations
- Desktop Score: ~70
- Mobile Score: ~60
- Total Size: 120MB
- Load Time (3G): 30+ seconds

### After Current Optimizations
- Desktop Score: 95+
- Mobile Score: 80-85 (90+ with caching)
- Total Size: 96MB
- Load Time (3G): 15-20 seconds

### After All Optimizations + Caching
- Desktop Score: 98+
- Mobile Score: 92+
- Total Size: 80MB (with WebP)
- Load Time (3G): 10-12 seconds

## 🚀 Quick Wins Summary

| Optimization | Effort | Impact | Status |
|-------------|--------|--------|--------|
| Image compression | ✅ Done | -24MB | Complete |
| Async font loading | ✅ Done | -1,830ms | Complete |
| LCP preload | ✅ Done | Faster LCP | Complete |
| Cache headers | ⚠️ Needs hosting | +15 points | Pending |
| WebP conversion | Low | -300KB | Optional |
| HTML minification | Low | -100KB | Optional |

## 📞 Support

For hosting migration help:
- Netlify docs: https://docs.netlify.com/
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Cloudflare CDN: https://developers.cloudflare.com/cache/

Questions? hello@finmango.org
