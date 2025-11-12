# Cloudflare Pages Deployment Guide

This guide will help you migrate your website from Netlify to Cloudflare Pages.

## Why Cloudflare Pages?

- **No bandwidth limits** - Unlike Netlify, Cloudflare Pages doesn't have bandwidth restrictions
- **Free tier includes unlimited requests** - No usage limits
- **Global CDN** - Fast delivery worldwide
- **Automatic HTTPS**
- **Compatible with your existing configuration** - Your `_redirects` and `_headers` files already work with Cloudflare Pages

## Prerequisites

- A Cloudflare account (free tier is sufficient)
- Your GitHub repository connected to Cloudflare Pages

## Deployment Steps

### Option 1: Connect via Cloudflare Dashboard (Recommended)

1. **Sign in to Cloudflare**
   - Go to https://dash.cloudflare.com/
   - Sign up for a free account if you don't have one

2. **Create a new Pages project**
   - Click on "Workers & Pages" in the left sidebar
   - Click "Create application"
   - Select the "Pages" tab
   - Click "Connect to Git"

3. **Connect your GitHub repository**
   - Authorize Cloudflare to access your GitHub account
   - Select the `finmango/website` repository

4. **Configure build settings**
   - **Framework preset**: None (Static HTML)
   - **Build command**: (leave empty - no build needed)
   - **Build output directory**: `/` (root directory)
   - **Root directory**: `/` (root directory)

5. **Deploy**
   - Click "Save and Deploy"
   - Your site will be live in ~1 minute at a `*.pages.dev` URL

6. **Add custom domain** (optional)
   - Go to your Pages project settings
   - Click "Custom domains"
   - Add your domain (e.g., finmango.org)
   - Follow the DNS configuration instructions

### Option 2: Deploy via Wrangler CLI

```bash
# Install Wrangler (Cloudflare's CLI)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy your site
wrangler pages deploy . --project-name=finmango-website
```

## What's Already Configured

### Clean URLs (via `_redirects`)
Your `_redirects` file removes `.html` extensions from URLs:
- `https://yoursite.com/about.html` → `https://yoursite.com/about`

### Security & Caching Headers (via `_headers`)
Your `_headers` file includes:
- Cache control for HTML, images, fonts, and JSON
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Referrer and Permissions policies

Both files are fully compatible with Cloudflare Pages - no changes needed!

## DNS Configuration

Once your site is deployed on Cloudflare Pages, you'll need to update your domain's DNS:

1. If your domain is already on Cloudflare:
   - Cloudflare will automatically configure DNS for your custom domain

2. If your domain is elsewhere:
   - Add a CNAME record pointing to your `*.pages.dev` URL
   - Or transfer your domain to Cloudflare for easier management

## Comparison: Netlify vs Cloudflare Pages

| Feature | Netlify Free | Cloudflare Pages Free |
|---------|-------------|----------------------|
| Bandwidth | 100 GB/month | Unlimited |
| Builds | 300 minutes/month | 500 builds/month |
| Sites | 1 site | Unlimited |
| Custom domains | Yes | Yes |
| HTTPS | Yes | Yes |
| CDN | Yes | Yes (faster, global) |

## Troubleshooting

### Site not loading correctly?
- Check that the build output directory is set to `/` (root)
- Verify that `_redirects` and `_headers` files are present

### Clean URLs not working?
- Cloudflare Pages automatically supports `_redirects` files
- No additional configuration needed

### Custom domain issues?
- Wait 24-48 hours for DNS propagation
- Use Cloudflare's DNS for instant updates

## Support

- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Cloudflare Community: https://community.cloudflare.com/
- Cloudflare Discord: https://discord.cloudflare.com/

## Next Steps

After deploying to Cloudflare Pages:

1. Test your site thoroughly at the `*.pages.dev` URL
2. Configure your custom domain
3. Set up any necessary environment variables (if applicable)
4. Remove or pause your Netlify deployment to avoid confusion

Your site should be live with no bandwidth limits!
