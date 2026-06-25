// ============================================================================
// /post-image?id=… — same-origin cover image for social/link previews
// ----------------------------------------------------------------------------
// A post's cover is stored on Google Drive (drive.google.com/thumbnail?id=…),
// whose URLs are unreliable for crawlers (redirects, rate limits, the odd HTML
// response). Serving the bytes from our own domain makes the cover show up
// dependably as the og:image / twitter:image when a post is shared.
//
// Falls back to the default FinMango card if the post has no cover or the
// upstream image can't be fetched.
// ============================================================================

import { fetchPostJson, DEFAULT_OG_IMAGE } from './_shared.js';

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';

  const post = id ? await fetchPostJson(id) : null;
  const coverUrl = post && post.cover ? post.cover : '';
  if (!coverUrl) return Response.redirect(DEFAULT_OG_IMAGE, 302);

  try {
    const img = await fetch(coverUrl, {
      cf: { cacheTtl: 86400, cacheEverything: true },
      redirect: 'follow'
    });
    const type = img.headers.get('content-type') || '';
    if (!img.ok || !type.startsWith('image/')) return Response.redirect(DEFAULT_OG_IMAGE, 302);
    return new Response(img.body, {
      status: 200,
      headers: {
        'content-type': type,
        'cache-control': 'public, max-age=86400, s-maxage=86400'
      }
    });
  } catch (e) {
    return Response.redirect(DEFAULT_OG_IMAGE, 302);
  }
}
