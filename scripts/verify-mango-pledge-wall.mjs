/* Drives the mangoes on the Pledge Wall preview and measures them.
 *
 *   npx http-server -p 8899 -s &
 *   PLAYWRIGHT_MODULE=$(npm root -g)/playwright/index.mjs \
 *     node scripts/verify-mango-pledge-wall.mjs
 *
 * Positions come from getBoundingClientRect(), never from
 * getComputedStyle().transform, which reads zero for anything positioned any
 * other way and would make every "it never moved" conclusion wrong.
 */
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

const ORIGIN = process.env.MANGO_ORIGIN || 'http://127.0.0.1:8899';
const URL = `${ORIGIN}/pledge-wall-mango-preview.html`;
const BASE = `${ORIGIN}/pledge-wall.html`;
let pass = 0, fail = 0;
const ok = (n, c, extra = '') => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${extra ? ' — ' + extra : ''}`); };

const browser = await chromium.launch();
const settled = p => p.waitForFunction(
  () => window.__mangoHero && window.__mangoHero.isIdle(), null, { timeout: 30000 });

/* ---------- 1. Nothing new in the console ---------- */
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const grab = async url => {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(4000);
    await p.close();
    return errs;
  };
  const base = await grab(BASE);
  const added = (await grab(URL)).filter(e => !base.includes(e));
  ok(`no new console errors at ${w}px`, added.length === 0, added.join(' | '));
}

/* ---------- 2. One mango per recent signer, and the count is honest ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await settled(p);
  const state = await p.evaluate(() => ({
    fruit: document.querySelectorAll('.mango').length,
    cards: document.querySelectorAll('.pledge-card').length,
    liveCount: (document.getElementById('wallStatus') || {}).textContent || '',
    names: [...document.querySelectorAll('.mango')].map(e => e.getAttribute('aria-label'))
  }));
  ok('the pile is capped, not one body per name', state.fruit <= 12 && state.fruit > 0,
    `${state.fruit} fruit for ${state.cards} cards`);
  /* The pile carries no count of its own on purpose — the hero's live counter
     already states the real total, so a second number would just repeat it. */
  ok('the hero states the real total, so the pile need not',
    state.liveCount.replace(/\D/g, '') === String(state.cards),
    `hero says "${state.liveCount.trim()}", wall has ${state.cards}`);
  ok('the pile adds no second count of its own',
    await p.evaluate(() => !document.querySelector('.mango-tally, #mangoTally')));
  ok('every mango is named after a person, not a page',
    state.names.every(n => n && n.length > 2 && !/\.html/.test(n)), state.names.slice(0, 3).join(', '));
  await p.close();
}

/* ---------- 3. Each mango points at a card that exists, and reaches it ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await settled(p);

  const dangling = await p.evaluate(() => [...document.querySelectorAll('.mango')]
    .map(e => e.getAttribute('href'))
    .filter(href => !href || !document.getElementById(href.slice(1))));
  ok('no mango links to a card that is not there', dangling.length === 0, dangling.join(', '));

  const target = await p.evaluate(() => document.querySelectorAll('.mango')[2].getAttribute('href'));
  const r = await p.evaluate(() => {
    const b = document.querySelectorAll('.mango')[2].getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  });
  await p.mouse.click(r.x, r.y);
  await p.waitForTimeout(1200);
  const landed = await p.evaluate(id => {
    const el = document.getElementById(id.slice(1));
    if (!el) return { ok: false };
    const b = el.getBoundingClientRect();
    return { ok: b.top > -50 && b.top < window.innerHeight, hash: location.hash, top: Math.round(b.top) };
  }, target);
  ok('clicking a mango brings its card into view', landed.ok, `${target} → card top ${landed.top}`);
  ok('the card is the :target so it can be highlighted', landed.hash === target, landed.hash);
  await p.close();
}

/* ---------- 4. A filtered-out card is still reachable ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await settled(p);

  /* Pick a mango, then filter the wall to a barrier that excludes it */
  const pick = await p.evaluate(() => {
    const m = document.querySelectorAll('.mango')[0];
    return { href: m.getAttribute('href'), label: m.getAttribute('aria-label') };
  });
  const other = await p.evaluate(mine => {
    const btns = [...document.querySelectorAll('#filters .filter-btn')].slice(1);
    const b = btns.find(x => !mine.includes(x.textContent.trim()));
    if (b) b.click();
    return b ? b.textContent.trim() : null;
  }, pick.label);
  await p.waitForTimeout(500);

  const gone = await p.evaluate(id => !document.getElementById(id.slice(1)), pick.href);
  ok(`filtering to "${other}" removes that card from the wall`, gone);

  const r = await p.evaluate(() => {
    const b = document.querySelectorAll('.mango')[0].getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  });
  await p.mouse.click(r.x, r.y);
  await p.waitForTimeout(1200);
  const recovered = await p.evaluate(id => {
    const el = document.getElementById(id.slice(1));
    const all = document.querySelector('#filters .filter-btn');
    return { present: !!el, filterReset: all && all.classList.contains('active'),
             visible: el ? el.getBoundingClientRect().top < window.innerHeight : false };
  }, pick.href);
  ok('clicking it clears the filter first', recovered.filterReset);
  ok('and the card is back and on screen', recovered.present && recovered.visible);
  await p.close();
}

/* ---------- 5. The pile stops, and so does the loop ---------- */
for (const [w, h] of [[1440, 900], [390, 844], [768, 1024]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL, { waitUntil: 'commit' });
  await p.waitForSelector('.mango');
  const t0 = Date.now();
  let idle = true;
  try { await settled(p); } catch (e) { idle = false; }
  ok(`the animation loop stands down at ${w}px`, idle, idle ? `${Date.now() - t0}ms` : 'never');

  if (idle) {
    const rect = () => p.evaluate(() => [...document.querySelectorAll('.mango')]
      .map(e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top }; }));
    const a = await rect();
    await p.waitForTimeout(1500);
    const b = await rect();
    const moved = a.reduce((s, m, i) => s + Math.hypot(b[i].x - m.x, b[i].y - m.y), 0);
    ok(`and the pile is genuinely motionless at ${w}px`, moved === 0, `${moved}px over 1.5s`);

    const tilts = await p.evaluate(() => [...document.querySelectorAll('.mango')].map(e => {
      const m = new DOMMatrixReadOnly(getComputedStyle(e.querySelector('.mango-art')).transform);
      return Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI);
    }));
    const onEnd = tilts.filter(d => Math.abs(d) > 55 && Math.abs(d) < 125);
    ok(`no mango rests on its end at ${w}px`, onEnd.length === 0, tilts.join(' '));
    ok(`the pile is not machined flat at ${w}px`, new Set(tilts).size > 2, tilts.join(' '));
  }
  await p.close();
}

/* ---------- 6. This page has no dock ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await settled(p);
  const before = await p.evaluate(() => [...document.querySelectorAll('.mango')]
    .map(e => { const r = e.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY }; }));
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await p.waitForTimeout(1600);
  const docked = await p.evaluate(() =>
    document.getElementById('mango-layer').classList.contains('is-docked'));
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1600);
  const after = await p.evaluate(() => [...document.querySelectorAll('.mango')]
    .map(e => { const r = e.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY }; }));
  const drift = before.reduce((s, m, i) => s + Math.hypot(after[i].x - m.x, after[i].y - m.y), 0);
  ok('the mangoes never dock on this page', !docked);
  ok('they stay in the hero across a full scroll', drift === 0, `${drift}px`);
  await p.close();
}

/* ---------- 7. Reduced motion ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const rm = await p.evaluate(() => ({
    fruit: document.querySelectorAll('.mango').length,
    isStatic: document.getElementById('mango-layer').classList.contains('is-static'),
    links: [...document.querySelectorAll('.mango')].every(e => e.tagName === 'A' && e.getAttribute('href'))
  }));
  ok('reduced motion still shows the mangoes', rm.fruit > 0, `${rm.fruit}`);
  ok('reduced motion uses the static layout', rm.isStatic);
  ok('reduced motion mangoes are still real links', rm.links);
  ok('reduced motion throws no errors', errs.filter(e => !/JSON/.test(e)).length === 0);
  await ctx.close();
}

/* ---------- 8. Accessibility contract ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await settled(p);
  const a11y = await p.evaluate(() => {
    const layer = document.getElementById('mango-layer');
    const ms = [...document.querySelectorAll('.mango')];
    return {
      nav: layer.tagName === 'NAV' && !!layer.getAttribute('aria-label'),
      anchors: ms.every(e => e.tagName === 'A' && e.getAttribute('href')),
      named: ms.every(e => (e.getAttribute('aria-label') || '').length > 2),
      artHidden: ms.every(e => e.querySelector('.mango-art').getAttribute('aria-hidden') === 'true'),
      noText: ms.every(e => [...e.children].every(c =>
        !c.textContent.trim() || getComputedStyle(c).opacity === '0'))
    };
  });
  ok('layer is a labelled nav', a11y.nav);
  ok('every mango is a real anchor', a11y.anchors);
  ok('every mango has an accessible name', a11y.named);
  ok('art is hidden from assistive tech', a11y.artHidden);
  ok('no text is legible on the fruit at rest', a11y.noText);

  const total = await p.evaluate(() => document.querySelectorAll('.mango').length);
  const seen = new Set();
  await p.evaluate(() => document.body.focus());
  for (let i = 0; i < 400 && seen.size < total; i++) {
    await p.keyboard.press('Tab');
    const hit = await p.evaluate(() => {
      const a = document.activeElement;
      return a && a.classList.contains('mango') ? a.getAttribute('aria-label') : null;
    });
    if (hit) seen.add(hit);
  }
  ok('every mango is reachable by Tab', seen.size === total, `${seen.size}/${total}`);
  await p.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
