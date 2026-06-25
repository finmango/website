// ============================================================================
// /post — server-rendered head for a single Ambassador Note
// ----------------------------------------------------------------------------
// The static post.html is a blank shell that fetches its content client-side,
// so (a) it shows "Loading…" until a slow Apps Script call returns, and (b)
// social/link crawlers — which don't run JavaScript — never see a title,
// description, or the post's COVER IMAGE. This Function fixes both:
//
//   • Injects real Open Graph / Twitter tags (title, description, and the
//     post's cover image) so shares show the cover instead of the bare logo.
//   • Inlines the post as window.__POST__ so the page paints instantly with no
//     extra network round-trip.
//
// Requests arrive here as /post?id=… . Older /post.html?id=… links are sent
// here by the existing /*.html → clean-URL redirect (crawlers follow 301s).
// ============================================================================

import { SITE_BASE, DEFAULT_OG_IMAGE, EDGE_TTL, escapeHtml, jsonForScript, fetchPostJson } from './_shared.js';

export async function onRequestGet(context) {
  const { request, env, waitUntil } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';

  // How long the browser/edge may keep serving a stale copy while a fresh one is
  // fetched in the background. The full rendered page is otherwise re-built (and
  // re-fetched from the slow Apps Script backend) on every single navigation.
  const SWR = 86400; // 1 day

  // Build the fully rendered page. Returns { res, cacheable } — only a real,
  // found post is cacheable; "not found" / no-id pages stay uncached so they
  // retry (and pick up a post the moment it's published).
  async function renderFresh() {
    // Load the static template. "/post" resolves to post.html via Pages clean-URL
    // asset serving and is NOT matched by the /*.html redirect, so this returns
    // the raw shell (env.ASSETS never re-invokes this Function — no loop).
    const templateRes = await env.ASSETS.fetch(new URL('/post', url.origin));
    if (!templateRes.ok) return { res: templateRes, cacheable: false };

    const post = id ? await fetchPostJson(id) : null;
    const meta = buildMeta(post, id);

    const rewriter = new HTMLRewriter()
      .on('title', { element(el) { el.setInnerContent(meta.title); } })
      .on('meta[name="description"]', { element(el) { el.setAttribute('content', meta.description); } })
      .on('head', { element(el) { el.append(meta.headHtml, { html: true }); } });

    const headers = new Headers(templateRes.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', `public, max-age=${EDGE_TTL}, s-maxage=${SWR}, stale-while-revalidate=${SWR}`);
    headers.set('x-cached-at', String(Date.now()));

    const res = rewriter.transform(new Response(templateRes.body, { status: 200, headers }));
    return { res, cacheable: !!(id && post) };
  }

  const cache = caches.default;
  const cacheKey = new Request(url.origin + url.pathname + url.search, { method: 'GET' });

  const hit = await cache.match(cacheKey);
  if (hit) {
    // Serve the cached page instantly. If it's older than EDGE_TTL, refresh it
    // in the background so the next visitor gets fresh content — this visitor
    // never waits on the Apps Script round-trip or the HTML rewrite.
    const cachedAt = Number(hit.headers.get('x-cached-at')) || 0;
    const isStale = (Date.now() - cachedAt) > EDGE_TTL * 1000;
    if (isStale) {
      waitUntil((async () => {
        try {
          const fresh = await renderFresh();
          if (fresh.cacheable) await cache.put(cacheKey, fresh.res.clone());
        } catch (e) { /* keep serving the stale copy */ }
      })());
    }
    return hit;
  }

  // Cold cache: this navigation builds the page (and waits on the backend once).
  const { res, cacheable } = await renderFresh();
  if (cacheable) waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

function buildMeta(post, id) {
  if (!post) {
    const desc = 'A note, brief, or story written by a FinMango Ambassador.';
    return {
      title: 'Ambassador Note — FinMango',
      description: desc,
      headHtml: ogBlock({
        url: SITE_BASE + '/post' + (id ? '?id=' + encodeURIComponent(id) : ''),
        title: 'FinMango Ambassador Note',
        description: desc,
        image: DEFAULT_OG_IMAGE,
        imageAlt: 'FinMango',
        imageWidth: 2400,
        imageHeight: 1260
      })
    };
  }

  const title = post.title || 'Ambassador Note';
  const desc = post.dek || ('An Ambassador note by ' + (post.authorName || 'a FinMango Ambassador') + ' on FinMango.');
  const canonical = SITE_BASE + '/post?id=' + encodeURIComponent(post.id);
  // When the post has a cover, point at our same-origin image proxy — Google
  // Drive thumbnail URLs are unreliable for crawlers. Otherwise fall back to the
  // default FinMango card.
  const hasCover = !!post.cover;
  const image = hasCover ? (SITE_BASE + '/post-image?id=' + encodeURIComponent(post.id)) : DEFAULT_OG_IMAGE;

  const og = ogBlock({
    url: canonical,
    title,
    description: desc,
    image,
    imageAlt: title,
    author: post.authorName || '',
    published: post.publishedAt || '',
    // Only assert dimensions for the known default card; cover dimensions vary.
    imageWidth: hasCover ? 0 : 2400,
    imageHeight: hasCover ? 0 : 1260
  });

  // Inline the post so post.html renders immediately (no fetch, no "Loading…").
  const inlined = '<script>window.__POST__=' + jsonForScript(post) + ';</script>';

  return { title: title + ' — FinMango', description: desc, headHtml: og + inlined };
}

function ogBlock(o) {
  const e = escapeHtml;
  const tags = [
    `<link rel="canonical" href="${e(o.url)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="FinMango">`,
    `<meta property="og:url" content="${e(o.url)}">`,
    `<meta property="og:title" content="${e(o.title)}">`,
    `<meta property="og:description" content="${e(o.description)}">`,
    `<meta property="og:image" content="${e(o.image)}">`,
    `<meta property="og:image:alt" content="${e(o.imageAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:site" content="@finmango">`,
    `<meta name="twitter:url" content="${e(o.url)}">`,
    `<meta name="twitter:title" content="${e(o.title)}">`,
    `<meta name="twitter:description" content="${e(o.description)}">`,
    `<meta name="twitter:image" content="${e(o.image)}">`,
    `<meta name="twitter:image:alt" content="${e(o.imageAlt)}">`
  ];
  if (o.imageWidth && o.imageHeight) {
    tags.push(`<meta property="og:image:width" content="${o.imageWidth}">`);
    tags.push(`<meta property="og:image:height" content="${o.imageHeight}">`);
  }
  if (o.author) tags.push(`<meta property="article:author" content="${e(o.author)}">`);
  if (o.published) tags.push(`<meta property="article:published_time" content="${e(o.published)}">`);
  return tags.join('');
}
