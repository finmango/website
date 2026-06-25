// ============================================================================
// /post — server-rendered head for a single Community Post
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

import { SITE_BASE, DEFAULT_OG_IMAGE, escapeHtml, jsonForScript, fetchPostJson } from './_shared.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';

  // Load the static template. "/post" resolves to post.html via Pages clean-URL
  // asset serving and is NOT matched by the /*.html redirect, so this returns
  // the raw shell (env.ASSETS never re-invokes this Function — no loop).
  const templateRes = await env.ASSETS.fetch(new URL('/post', url.origin));
  if (!templateRes.ok) return templateRes;

  const post = id ? await fetchPostJson(id) : null;
  const meta = buildMeta(post, id);

  const rewriter = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(meta.title); } })
    .on('meta[name="description"]', { element(el) { el.setAttribute('content', meta.description); } })
    .on('head', { element(el) { el.append(meta.headHtml, { html: true }); } });

  const headers = new Headers(templateRes.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'public, max-age=300');

  return rewriter.transform(new Response(templateRes.body, { status: 200, headers }));
}

function buildMeta(post, id) {
  if (!post) {
    const desc = 'A community-authored report, brief, or story published on FinMango.';
    return {
      title: 'Community Post — FinMango',
      description: desc,
      headHtml: ogBlock({
        url: SITE_BASE + '/post' + (id ? '?id=' + encodeURIComponent(id) : ''),
        title: 'FinMango Community Post',
        description: desc,
        image: DEFAULT_OG_IMAGE,
        imageAlt: 'FinMango',
        imageWidth: 2400,
        imageHeight: 1260
      })
    };
  }

  const title = post.title || 'Community Post';
  const desc = post.dek || ('A community post by ' + (post.authorName || 'a FinMango contributor') + ' on FinMango.');
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
