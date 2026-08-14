// ============================================================================
// cover-fit.js — aspect-aware framing for Ambassador Note cover images
// ----------------------------------------------------------------------------
// Covers arrive in whatever shape the author uploaded: 16:9 photos, 4:5
// portraits, and — increasingly — wide data-viz graphics with a headline, axis
// labels and a source line baked into the image (2.7:1 so far). The card grid
// and the article hero frame every cover with `object-fit: cover`, which
// silently slices the edges off anything that isn't roughly the frame's own
// shape: a chart loses its labels, a portrait loses a head.
//
// This module measures each cover once it decodes and, when cropping would
// throw away a meaningful slice of it, stops cropping:
//
//   • data-cover-frame="hero"  — the article's breakout cover adopts the
//     image's own aspect ratio, so nothing is cut at all.
//   • data-cover-frame="fixed" — grid cards keep their uniform slot and
//     letterbox the image inside it, so the whole graphic reads.
//
// Letterbox bars take the image's own border colour when its edges are a flat
// tone (charts on white land seamlessly); otherwise the frame keeps its tint.
//
// Every decision can be overridden per post — after publishing, without
// re-uploading anything — from data/cover-tuning.json. See docs/POSTS-SETUP.md.
// ============================================================================

(function () {
  'use strict';

  // How far a cover's shape may differ from its frame before we stop cropping,
  // as a ratio of ratios: 1.12 ≈ "the crop would eat ~11% of a dimension".
  //
  // The hero is the note's own figure, so it gives up cropping early — a 3:2
  // photo simply becomes a 3:2 hero. A grid card is a thumbnail in a rhythm of
  // thumbnails, where a modest crop reads better than bars on every card, so it
  // holds out until the shape is one no crop can survive: a 2.7:1 chart with
  // labels at both ends, or a portrait in a landscape slot.
  const CROP_TOLERANCE = { hero: 1.12, fixed: 1.4 };

  // Bounds for a hero frame adopting the image's shape — an unclamped 4:1
  // banner would become a letterbox slit, and a tall portrait would push the
  // article off the screen (hence the viewport cap alongside).
  const HERO_MIN_RATIO = 0.8;
  const HERO_MAX_RATIO = 3;
  const HERO_MAX_HEIGHT = '78vh';

  const TUNING_URL = '/data/cover-tuning.json';

  // Overrides are hand-written, but they still land in inline styles — keep the
  // accepted shapes narrow so a typo fails closed instead of injecting CSS.
  const FOCUS_RE = /^[-\w\s.%]{1,40}$/;
  const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%/]+\)|hsla?\([\d\s.,%/]+\)|[a-z]{3,20})$/i;

  const frames = [];        // every frame seen so far, for re-runs
  let tuning = null;        // post id → { fit, focus, bg }, once loaded
  let scanQueued = false;

  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  // The shape the stylesheet gives this frame, measured once — before we've
  // touched anything. Cached, so a hero that adopts a 2.7:1 image is still
  // compared against its original 16:9 slot on later passes (and can't
  // ping-pong between decisions).
  function referenceRatio(frame) {
    const cached = parseFloat(frame.dataset.coverRef || '');
    if (cached > 0) return cached;
    const box = frame.querySelector('img') || frame;
    const rect = box.getBoundingClientRect();
    if (!rect.width || !rect.height) return 0;   // hidden — try again once it lays out
    const ratio = rect.width / rect.height;
    frame.dataset.coverRef = String(ratio);
    return ratio;
  }

  // Letterbox bars look intentional when they continue the image's own border,
  // so average a small tile in each corner (a chart's white margin) and use that
  // colour only when all four agree — four different corners mean the image has
  // content at its edges and the frame keeps its tint. Covers are same-origin
  // (/post-image), so the canvas stays readable; a raw Drive URL would taint it,
  // hence the try/catch. scripts/og-post-template.html samples the same way for
  // social cards, so a cover's ground matches on the page and in the share.
  function sampleEdgeColor(img) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return '';
      const w = img.naturalWidth, h = img.naturalHeight;
      const tile = Math.max(2, Math.min(16, Math.round(Math.min(w, h) * 0.02)));
      const corners = [[0, 0], [w - tile, 0], [0, h - tile], [w - tile, h - tile]].map(([sx, sy]) => {
        ctx.drawImage(img, sx, sy, tile, tile, 0, 0, 1, 1);
        return ctx.getImageData(0, 0, 1, 1).data;
      });
      const avg = [0, 1, 2].map(i => corners.reduce((sum, px) => sum + px[i], 0) / corners.length);
      const spread = Math.max(...corners.map(px => Math.max(...[0, 1, 2].map(i => Math.abs(px[i] - avg[i])))));
      if (spread > 12) return '';
      return 'rgb(' + avg.map(v => Math.round(v)).join(',') + ')';
    } catch (e) {
      return '';   // cross-origin cover, or no canvas
    }
  }

  function tuningFor(frame) {
    const id = frame.getAttribute('data-cover-post');
    const entry = tuning && id ? tuning[id] : null;
    if (!entry || typeof entry !== 'object') return {};
    return {
      fit: entry.fit === 'cover' || entry.fit === 'contain' ? entry.fit : '',
      focus: typeof entry.focus === 'string' && FOCUS_RE.test(entry.focus) ? entry.focus : '',
      bg: typeof entry.bg === 'string' && COLOR_RE.test(entry.bg) ? entry.bg : ''
    };
  }

  function applyFit(frame) {
    const img = frame.querySelector('img');
    if (!img || !img.naturalWidth || !img.naturalHeight) return;   // waits for the load handler

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const slotRatio = referenceRatio(frame);
    const isHero = frame.getAttribute('data-cover-frame') === 'hero';
    const tune = tuningFor(frame);

    // Editors win; otherwise crop only while the crop stays modest.
    let fit = tune.fit;
    if (!fit) {
      const mismatch = slotRatio ? Math.max(imgRatio / slotRatio, slotRatio / imgRatio) : 1;
      fit = mismatch > CROP_TOLERANCE[isHero ? 'hero' : 'fixed'] ? 'contain' : 'cover';
    }

    const style = { objectFit: '', objectPosition: tune.focus, aspectRatio: '', maxHeight: '', background: '' };
    if (fit === 'contain') {
      style.objectFit = 'contain';
      // A hero can simply become the image's shape — then there are no bars to
      // paint (except for the extremes the clamp and the height cap rein in).
      if (isHero) {
        style.aspectRatio = clamp(imgRatio, HERO_MIN_RATIO, HERO_MAX_RATIO).toFixed(4);
        style.maxHeight = HERO_MAX_HEIGHT;
      }
      style.background = tune.bg || sampleEdgeColor(img);
    }

    // Only write when something actually changes: a hero's new aspect ratio
    // resizes the frame, which fires the ResizeObserver right back at us.
    const signature = JSON.stringify(style);
    if (frame.dataset.coverApplied === signature) return;
    frame.dataset.coverApplied = signature;

    img.style.objectFit = style.objectFit;
    img.style.objectPosition = style.objectPosition;
    img.style.aspectRatio = style.aspectRatio;
    img.style.maxHeight = style.maxHeight;
    frame.style.background = style.background;
    frame.setAttribute('data-cover-fit', fit);
  }

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(entries => {
      entries.forEach(entry => {
        const frame = entry.target.closest('[data-cover-frame]');
        if (frame) applyFit(frame);
      });
    })
    : null;

  function register(frame) {
    frame.setAttribute('data-cover-seen', '1');
    frames.push(frame);
    const img = frame.querySelector('img');
    if (!img) return;
    if (img.complete) applyFit(frame);
    else img.addEventListener('load', () => applyFit(frame), { once: true });
    if (resizeObserver) resizeObserver.observe(img);
  }

  function scan(root) {
    const list = (root || document).querySelectorAll('[data-cover-frame]:not([data-cover-seen])');
    for (let i = 0; i < list.length; i++) register(list[i]);
  }

  // Cards are painted by JS — twice on /posts (static snapshot, then the live
  // list) and again when "more notes" lazy-loads — so watch for new frames
  // instead of asking every render path to call in.
  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(() => { scanQueued = false; scan(document); });
  }

  if (typeof MutationObserver === 'function') {
    new MutationObserver(records => {
      if (records.some(r => r.addedNodes && r.addedNodes.length)) queueScan();
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  // Per-post overrides arrive a beat after the automatic pass, which is fine:
  // they refine covers that already look right rather than fixing a broken one.
  fetch(TUNING_URL)
    .then(res => (res.ok ? res.json() : {}))
    .catch(() => ({}))
    .then(data => {
      tuning = data && typeof data === 'object' ? data : {};
      frames.forEach(applyFit);
    });

  scan(document);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scan(document));
  }

  window.CoverFit = { scan, apply: applyFit };
})();
