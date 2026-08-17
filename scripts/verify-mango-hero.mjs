/* Drives the mango hero in a real browser and measures it.
 *
 * Serve the repo, then run:
 *   npx http-server -p 8899 -s &
 *   PLAYWRIGHT_MODULE=$(npm root -g)/playwright/index.mjs \
 *     node scripts/verify-mango-hero.mjs
 *
 * Chromium is preinstalled in the Claude Code web sandbox — do not run
 * `playwright install`.
 *
 * Positions always come from getBoundingClientRect(). Reading
 * getComputedStyle().transform returns zeros for anything positioned any
 * other way, which would make every "it never moved" conclusion wrong.
 */
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

const ORIGIN = process.env.MANGO_ORIGIN || 'http://127.0.0.1:8899';
const URL = `${ORIGIN}/mango-hero-preview.html`;
const BASE = `${ORIGIN}/index.html`;
let pass = 0, fail = 0;
const ok = (n, c, extra = '') => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${extra ? ' — ' + extra : ''}`); };

const browser = await chromium.launch();

/* Console noise that the untouched index.html already produces, so the
   preview is only judged on what it adds. */
async function consoleNoise(page, url) {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  return errs;
}

const rects = page => page.evaluate(() =>
  [...document.querySelectorAll('.mango')].map(e => {
    const r = e.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height,
             label: e.getAttribute('aria-label'), href: e.getAttribute('href') };
  }));

/* ---------- 1. Console cleanliness, both viewports ---------- */
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const bp = await browser.newPage({ viewport: { width: w, height: h } });
  const baseErrs = await consoleNoise(bp, BASE);
  await bp.close();

  const pp = await browser.newPage({ viewport: { width: w, height: h } });
  const previewErrs = await consoleNoise(pp, URL);
  await pp.close();

  const added = previewErrs.filter(e => !baseErrs.includes(e));
  ok(`no new console errors at ${w}px`, added.length === 0, added.join(' | '));
}

/* ---------- 2. The pile actually comes to rest ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  /* 'commit', not 'networkidle' — by the time the network goes idle the drop
     is already over and every sample reads zero */
  await p.goto(URL, { waitUntil: 'commit' });
  await p.waitForSelector('.mango');
  const samples = [];
  const t0 = Date.now();
  let restAt = null;
  for (let i = 0; i < 90; i++) {
    samples.push(await rects(p));
    if (restAt === null && await p.evaluate(() => window.__mangoHero.isResting())) restAt = Date.now() - t0;
    await p.waitForTimeout(100);
  }

  const motion = samples.slice(1).map((s, i) =>
    s.reduce((sum, m, j) => sum + Math.hypot(m.x - samples[i][j].x, m.y - samples[i][j].y), 0));
  const moved = motion.slice(0, 10).reduce((a, b) => a + b, 0);
  const tail = motion.slice(-15).reduce((a, b) => a + b, 0);

  ok('pile is genuinely in motion at first', moved > 50, `${moved.toFixed(1)}px in first second`);
  ok('per-frame movement reaches exactly zero', tail === 0, `${tail.toFixed(4)}px over last 1.5s`);
  ok('whole pile is asleep inside 6s', restAt !== null && restAt < 6000, `${restAt}ms`);
  await p.close();
}

/* ---------- 3. A click navigates, a drag does not ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);

  let r = (await rects(p))[1];
  await p.mouse.move(r.x, r.y);
  await p.mouse.down();
  for (let i = 1; i <= 12; i++) {
    await p.mouse.move(r.x - i * 22, r.y - i * 9);
    await p.waitForTimeout(9);
  }
  await p.mouse.up();
  await p.waitForTimeout(400);
  ok('a drag does not navigate', p.url().endsWith('mango-hero-preview.html'), p.url());

  /* And the throw carried — a release that read only the last pointer event
     would leave it dead in the water */
  const a = (await rects(p))[1];
  await p.waitForTimeout(120);
  const b = (await rects(p))[1];
  const carry = Math.hypot(b.x - a.x, b.y - a.y);
  ok('a throw carries real momentum', carry > 12, `${carry.toFixed(1)}px in 120ms after release`);

  await p.waitForTimeout(4000);
  r = (await rects(p))[3];
  await p.mouse.move(r.x, r.y);
  await p.mouse.down();
  await p.mouse.up();
  await p.waitForTimeout(900);
  ok('a click navigates', p.url().endsWith(r.href), `${r.href} → ${p.url()}`);
  await p.close();
}

/* ---------- 4. Keyboard: reachable, freezes on focus, Enter activates ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);

  const total = await p.evaluate(() => document.querySelectorAll('.mango').length);
  const seen = new Set();
  await p.evaluate(() => document.body.focus());
  for (let i = 0; i < 260 && seen.size < total; i++) {
    await p.keyboard.press('Tab');
    const hit = await p.evaluate(() => {
      const a = document.activeElement;
      return a && a.classList.contains('mango') ? a.getAttribute('aria-label') : null;
    });
    if (hit) seen.add(hit);
  }
  ok('every mango is reachable by Tab', seen.size === total, `${seen.size}/${total}`);

  /* Freeze-on-focus only fires for :focus-visible, so it has to be reached by
     real keystrokes — a programmatic .focus() does not match and would test
     nothing. Tabbing scrolls the page to the mangos, so scroll back and let
     the dock fully release before measuring. */
  const focused = await p.evaluate(() => {
    const a = document.activeElement;
    return a && a.classList.contains('mango') ? a.getAttribute('aria-label') : null;
  });
  ok('keyboard focus lands on a mango', !!focused, focused || 'none');

  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1800);
  const frozen = await p.evaluate(async () => {
    const el = document.activeElement;
    const before = el.getBoundingClientRect();
    await new Promise(r => setTimeout(r, 800));
    const after = el.getBoundingClientRect();
    return {
      moved: Math.hypot(after.left - before.left, after.top - before.top),
      named: (el.getAttribute('aria-label') || '').length > 2,
      outlined: getComputedStyle(el).outlineStyle !== 'none'
    };
  });
  ok('a focused mango holds still', frozen.moved === 0, `${frozen.moved}px`);
  ok('a focused mango exposes its name', frozen.named);
  ok('a focused mango shows a focus ring', frozen.outlined);

  const target = await p.evaluate(() => document.activeElement.getAttribute('href'));
  await p.keyboard.press('Enter');
  await p.waitForTimeout(900);
  ok('Enter activates a focused mango', p.url().endsWith(target), `${target} → ${p.url()}`);
  await p.close();
}

/* ---------- 5. The dock fits, at both widths ---------- */
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  await p.evaluate(() => window.scrollTo(0, document.querySelector('.hero').offsetHeight));
  await p.waitForTimeout(1600);

  const dock = await p.evaluate(() => {
    const ms = [...document.querySelectorAll('.mango')].map(e => e.getBoundingClientRect());
    const plate = document.getElementById('mango-dock-plate');
    const pr = plate.getBoundingClientRect();
    return {
      docked: document.getElementById('mango-layer').classList.contains('is-docked'),
      left: Math.min(...ms.map(r => r.left)), right: Math.max(...ms.map(r => r.right)),
      top: Math.min(...ms.map(r => r.top)), bottom: Math.max(...ms.map(r => r.bottom)),
      plateVisible: getComputedStyle(plate).visibility === 'visible',
      plateLeft: pr.left, plateRight: pr.right,
      overlaps: ms.some((a, i) => ms.some((b, j) => j > i && a.right > b.left + 1 && b.right > a.left + 1)),
      bodyScrollW: document.body.scrollWidth, innerW: window.innerWidth
    };
  });

  ok(`dock engages at ${w}px`, dock.docked && dock.plateVisible);
  ok(`dock fits the viewport at ${w}px`,
    dock.left >= 0 && dock.right <= w && dock.plateLeft >= 0 && dock.plateRight <= w,
    `mangos ${dock.left.toFixed(0)}–${dock.right.toFixed(0)}, plate ${dock.plateLeft.toFixed(0)}–${dock.plateRight.toFixed(0)} in ${w}`);
  ok(`dock sits along the bottom edge at ${w}px`, dock.top > h * 0.6 && dock.bottom <= h);
  ok(`dock does not overlap itself at ${w}px`, !dock.overlaps);
  ok(`no horizontal page scroll at ${w}px`, dock.bodyScrollW <= dock.innerW);

  /* Scrolling back up puts them into play again */
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1600);
  const back = await p.evaluate(() =>
    document.getElementById('mango-layer').classList.contains('is-docked'));
  ok(`scrolling back up releases the dock at ${w}px`, !back);
  await p.close();
}

/* ---------- 6. Reduced motion is genuinely static ---------- */
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);

  const docPos = () => p.evaluate(() =>
    [...document.querySelectorAll('.mango')].map(e => {
      const r = e.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY };
    }));

  const isStatic = await p.evaluate(() =>
    document.getElementById('mango-layer').classList.contains('is-static'));
  ok(`reduced motion uses the static layout at ${w}px`, isStatic);

  const before = await docPos();
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(1200);
  const docked = await p.evaluate(() =>
    document.getElementById('mango-layer').classList.contains('is-docked'));
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1200);
  const after = await docPos();

  const drift = before.reduce((s, b, i) => s + Math.hypot(after[i].x - b.x, after[i].y - b.y), 0);
  ok(`reduced motion never docks at ${w}px`, !docked);
  ok(`reduced motion drifts not at all across a full scroll at ${w}px`, drift === 0, `${drift}px`);
  ok(`reduced motion mangos are still real links at ${w}px`,
    await p.evaluate(() => [...document.querySelectorAll('.mango')].every(e =>
      e.tagName === 'A' && e.getAttribute('href'))));
  ok(`reduced motion throws no errors at ${w}px`, errs.length === 0, errs.join(' | '));
  await ctx.close();
}

/* ---------- 7. Markup contract ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const a11y = await p.evaluate(() => {
    const layer = document.getElementById('mango-layer');
    const ms = [...document.querySelectorAll('.mango')];
    return {
      navLabelled: layer.tagName === 'NAV' && !!layer.getAttribute('aria-label'),
      allAnchors: ms.every(e => e.tagName === 'A' && e.getAttribute('href')),
      allLabelled: ms.every(e => (e.getAttribute('aria-label') || '').length > 2),
      artHidden: ms.every(e => e.querySelector('.mango-art').getAttribute('aria-hidden') === 'true'),
      externalsSafe: ms.filter(e => e.target === '_blank')
        .every(e => (e.rel || '').includes('noopener') &&
                    /new tab/i.test(e.getAttribute('aria-label') || '')),
      touchAction: getComputedStyle(ms[0]).touchAction
    };
  });
  ok('layer is a labelled nav', a11y.navLabelled);
  ok('every mango is a real anchor with an href', a11y.allAnchors);
  ok('every mango has an accessible name', a11y.allLabelled);
  ok('mango art is hidden from assistive tech', a11y.artHidden);
  ok('external mangos are rel=noopener and say so', a11y.externalsSafe);
  ok('mangos take touch away from the page while draggable', a11y.touchAction === 'none');
  await p.close();
}

/* ---------- 11. The pile settles right-side-up ----------
   A mango lying flat but with its leaf underneath is a valid resting angle
   for the physics and looks wrong on the page. */
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(7000);
  const tilts = await p.evaluate(() => [...document.querySelectorAll('.mango')].map(e => {
    const m = new DOMMatrixReadOnly(getComputedStyle(e.querySelector('.mango-art')).transform);
    let deg = Math.atan2(m.b, m.a) * 180 / Math.PI;
    while (deg > 180) deg -= 360;
    while (deg < -180) deg += 360;
    return { n: e.getAttribute('aria-label'), deg: Math.round(deg) };
  }));
  const upside = tilts.filter(t => Math.abs(t.deg) > 90);
  ok(`every mango settles stem-up at ${w}px`, upside.length === 0,
    upside.map(t => `${t.n} ${t.deg}°`).join(', ') || tilts.map(t => `${t.deg}°`).join(' '));
  await p.close();
}

/* ---------- 8. The cursor agitates but never keeps the pile awake ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(5500);
  ok('pile is asleep before the cursor arrives', await p.evaluate(() => window.__mangoHero.isResting()));

  const r = (await rects(p))[3];
  for (let i = 0; i < 25; i++) { await p.mouse.move(r.x - 200 + i * 16, r.y); await p.waitForTimeout(16); }
  ok('the cursor pushes mangos out of the way', !(await p.evaluate(() => window.__mangoHero.isResting())));

  let back = null;
  const t = Date.now();
  for (let i = 0; i < 130 && back === null; i++) {
    if (await p.evaluate(() => window.__mangoHero.isResting())) back = Date.now() - t;
    else await p.waitForTimeout(100);
  }
  ok('pile goes back to sleep with the cursor still on screen', back !== null && back < 9000,
    back === null ? 'never' : `${back}ms`);
  await p.close();
}

/* ---------- 9. No instructional chrome, and the pile re-settles after play ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(5500);

  ok('the hero carries no hint or control chrome',
    await p.evaluate(() => !document.querySelector(
      '.mango-hint, .mango-controls, .mango-reset, #mango-hint, #mango-reset')));
  ok('the only affordance is the cursor',
    await p.evaluate(() => getComputedStyle(document.querySelector('.mango')).cursor === 'grab'));
  ok('no text is legible on the fruit at rest',
    await p.evaluate(() => [...document.querySelectorAll('.mango')].every(e =>
      [...e.children].every(c =>
        !c.textContent.trim() || getComputedStyle(c).opacity === '0'))));

  /* With the labels gone, hover is the only way to read a name */
  const named = await p.evaluate(async () => {
    const el = document.querySelectorAll('.mango')[1];
    const r = el.getBoundingClientRect();
    el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    el.classList.add('is-hovered');
    return { text: el.querySelector('.mango-tip').textContent, w: r.width };
  });
  await p.mouse.move((await rects(p))[1].x, (await rects(p))[1].y);
  await p.waitForTimeout(400);
  const tipShown = await p.evaluate(() =>
    getComputedStyle(document.querySelectorAll('.mango')[1].querySelector('.mango-tip')).opacity);
  ok('hovering a mango reveals its name', Number(tipShown) > 0.5 && named.text.length > 3,
    `"${named.text}" at opacity ${tipShown}`);

  const r = (await rects(p))[2];
  await p.mouse.move(r.x, r.y);
  await p.mouse.down();
  for (let i = 1; i <= 10; i++) { await p.mouse.move(r.x + i * 14, r.y - i * 16); await p.waitForTimeout(10); }
  await p.mouse.up();
  await p.waitForTimeout(300);
  ok('a throw wakes the pile', !(await p.evaluate(() => window.__mangoHero.isResting())));
  await p.waitForTimeout(8000);
  ok('the pile settles again after being thrown around',
    await p.evaluate(() => window.__mangoHero.isResting()));
  await p.close();
}

/* ---------- 10. Resize never strands a mango off-screen ---------- */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(5500);
  let escaped = [];
  for (const w of [1100, 900, 700, 480, 360, 1440]) {
    await p.setViewportSize({ width: w, height: 800 });
    await p.waitForTimeout(7000);
    const out = await p.evaluate(() => [...document.querySelectorAll('.mango')]
      .map(e => { const b = e.getBoundingClientRect(); return { n: e.getAttribute('aria-label'), l: b.left, r: b.right }; })
      .filter(m => m.l < -12 || m.r > window.innerWidth + 12));
    if (out.length) escaped.push(`${w}px: ${out.map(o => o.n).join(', ')}`);
    const rest = await p.evaluate(() => window.__mangoHero.isResting());
    ok(`pile settles at ${w}px`, rest);
  }
  ok('no mango is ever stranded off-screen by a resize', escaped.length === 0, escaped.join(' | '));
  await p.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
