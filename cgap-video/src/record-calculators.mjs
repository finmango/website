/**
 * Records scripted interactions with the FinMango calculators, served locally
 * from the repo root (same pages as finmango.org).
 *
 * Capture method: deterministic per-frame screenshot stitching. Real-time CDP
 * screencast in this container tops out around 8-11 fps at 2x resolution, so
 * instead every output frame (30fps) is computed: cursor position follows an
 * eased parametric path, keystrokes / clicks / slider values / scrolls are
 * applied on exact frame boundaries, then the page is screenshotted.
 * Smoothness is guaranteed regardless of capture speed. Page-side CSS
 * transitions are disabled and the result animations that matter (gauge
 * pointer, savings bar) are re-animated frame-accurately by the script.
 *
 * Frames render at 2560x1440 (html zoom 2 in a 2560x1440 window) for crisp
 * downstream punch-ins, then encode to recordings/<scene>.mp4 at 30fps.
 *
 * Usage: node src/record-calculators.mjs [probe|housing|ira|barometer|all]
 */
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BASE = process.env.SITE_BASE || 'http://127.0.0.1:8907';
const VIEW = { width: 2560, height: 1440 };
const ZOOM = 2;
const FPS = 30;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const SETUP_JS = `
(() => {
  if (window.__vcursor) return;
  document.documentElement.style.zoom = '${ZOOM}';
  const c = document.createElement('div');
  c.id = '__vcursor';
  c.innerHTML = '<svg width="20" height="29" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M2 2 L2 30 L9.5 23.5 L14 35 L18.5 33 L14 21.5 L24 21 Z" ' +
    'fill="#FFFFFF" stroke="#1A1A1A" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  Object.assign(c.style, {
    position: 'fixed', left: '0px', top: '0px', zIndex: '2147483647',
    pointerEvents: 'none', transformOrigin: '2px 2px',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))',
  });
  document.documentElement.appendChild(c);
  window.__vcursor = c;
  window.__setCursor = (x, y, down) => {
    c.style.transform = 'translate(' + (x / ${ZOOM}) + 'px,' + (y / ${ZOOM}) + 'px) scale(' + (down ? 0.86 : 1) + ')';
  };
  window.__setCursor(-60, -60, false);
  const style = document.createElement('style');
  style.textContent = [
    '::-webkit-scrollbar{display:none !important}',
    'html{scrollbar-width:none}',
    /* wall-clock animations would play at the wrong speed in stitched */
    /* frames; we re-animate the ones that matter frame-accurately */
    '*,*::before,*::after{transition:none !important;animation:none !important}',
    'input{caret-color:transparent !important}',
    /* cleaner product-focused capture; the video adds its own lower thirds */
    '#nav{display:none !important}',
  ].join(' ');
  document.head.appendChild(style);
  /* window.scrollTo misbehaves under a zoomed root and the page only uses
     it for step changes; framing is driven by the recorder instead */
  window.scrollTo = () => {};
})();
`;

/**
 * Virtual-clock scene: actions are scheduled on a frame timeline, then
 * rendered one screenshot per frame. Cursor coordinates are window pixels;
 * page scroll is tracked so scheduled clicks land where elements will be.
 */
class VScene {
  constructor(page, name) {
    this.page = page;
    this.name = name;
    this.dir = path.join(ROOT, 'recordings', 'frames', name);
    this.events = [];
    this.tracks = [];
    this.cursorKeys = [{ f: 0, x: -60, y: -60 }];
    this.downSpans = [];
    this.f = 0;
    this.offset = 0; // content shift in window px (body translateY)
  }
  #cursorAt(frame) {
    const keys = this.cursorKeys;
    let prev = keys[0];
    for (const k of keys) {
      if (k.f <= frame) { prev = k; continue; }
      const span = Math.max(k.f - prev.f, 1);
      const p = easeInOut(Math.min(Math.max((frame - prev.f) / span, 0), 1));
      return { x: prev.x + (k.x - prev.x) * p, y: prev.y + (k.y - prev.y) * p };
    }
    return { x: prev.x, y: prev.y };
  }
  #isDown(frame) { return this.downSpans.some(([a, b]) => frame >= a && frame <= b); }
  hold(sec) { this.f += Math.round(sec * FPS); return this; }
  moveTo(x, y, sec) {
    const last = this.cursorKeys[this.cursorKeys.length - 1];
    this.cursorKeys.push({ f: this.f, x: last.x, y: last.y });
    this.f += Math.round(sec * FPS);
    this.cursorKeys.push({ f: this.f, x, y });
    return this;
  }
  /** Move to a document-space point (window px), given current framing. */
  moveToDoc(doc, sec) { return this.moveTo(doc.x, doc.y - this.offset, sec); }
  at(fn) { this.events.push({ frame: this.f, fn }); return this; }
  click(realMouse = true) {
    const downAt = this.f;
    if (realMouse) this.at(async () => { await this.page.mouse.down(); });
    this.hold(0.1);
    this.downSpans.push([downAt, this.f]);
    if (realMouse) this.at(async () => { await this.page.mouse.up(); });
    this.hold(0.07);
    return this;
  }
  type(text, cps = 10) {
    const step = Math.max(1, Math.round(FPS / cps));
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      this.events.push({ frame: this.f + i * step, fn: async () => { await this.page.keyboard.type(ch); } });
    }
    this.f += text.length * step;
    return this;
  }
  /** Eased content glide to an absolute offset (window px, downward+). */
  glideTo(toWin, sec) {
    const from = this.offset, page = this.page;
    this.animate(sec, async (p) => {
      const y = (from + (toWin - from) * p) / ZOOM;
      await page.evaluate((yy) => { document.body.style.transform = 'translateY(' + (-yy) + 'px)'; }, y);
    });
    this.offset = toWin;
    return this;
  }
  /** Instant reframe (mimics the page's own jump-to-top on step change). */
  jumpTo(toWin) {
    const page = this.page;
    this.at(async () => {
      await page.evaluate((yy) => { document.body.style.transform = 'translateY(' + (-yy) + 'px)'; }, toWin / ZOOM);
    });
    this.offset = toWin;
    return this;
  }
  /** Glide if needed so a target sits comfortably in frame for a click. */
  ensure(doc, sec = 0.55) {
    const vy = doc.y - this.offset;
    if (vy > VIEW.height * 0.88 || vy < VIEW.height * 0.1) {
      this.glideTo(Math.max(0, doc.y - VIEW.height * 0.58), sec);
    }
    return this;
  }
  animate(sec, fn, { pressed = false } = {}) {
    const from = this.f, to = this.f + Math.round(sec * FPS);
    this.tracks.push({ from, to, fn });
    if (pressed) this.downSpans.push([from, to]);
    this.f = to;
    return this;
  }
  animatePar(sec, fn) {
    this.tracks.push({ from: this.f, to: this.f + Math.round(sec * FPS), fn });
    return this;
  }

  async render() {
    rmSync(this.dir, { recursive: true, force: true });
    mkdirSync(this.dir, { recursive: true });
    const total = this.f;
    this.events.sort((a, b) => a.frame - b.frame);
    let ei = 0;
    const t0 = Date.now();
    for (let f = 0; f <= total; f++) {
      while (ei < this.events.length && this.events[ei].frame <= f) {
        await this.events[ei].fn(); ei++;
      }
      let pinned = null;
      for (const tr of this.tracks) {
        if (f >= tr.from && f <= tr.to) {
          const p = easeInOut((f - tr.from) / Math.max(tr.to - tr.from, 1));
          const res = await tr.fn(p);
          if (res && typeof res.x === 'number') pinned = res;
        }
      }
      const c = pinned || this.#cursorAt(f);
      const down = this.#isDown(f);
      await this.page.evaluate(([x, y, d]) => window.__setCursor(x, y, d), [c.x, c.y, down]);
      await this.page.mouse.move(c.x, c.y);
      await this.page.screenshot({
        path: path.join(this.dir, `f-${String(f).padStart(5, '0')}.jpg`),
        type: 'jpeg', quality: 90,
      });
      if (pinned) this.cursorKeys.push({ f, x: pinned.x, y: pinned.y });
    }
    const wall = (Date.now() - t0) / 1000;
    console.log(`[${this.name}] ${total + 1} frames (${(total / FPS).toFixed(2)}s) rendered in ${wall.toFixed(1)}s wall`);
    this.encode();
    return total / FPS;
  }

  encode() {
    const out = path.join(ROOT, 'recordings', `${this.name}.mp4`);
    execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', path.join(this.dir, 'f-%05d.jpg'),
      '-vf', 'format=yuv420p', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', out],
      { stdio: ['ignore', 'ignore', 'pipe'] });
    console.log(`[${this.name}] encoded -> ${out}`);
  }
}

async function newPage(browser, url, settle = 1500) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.evaluate(SETUP_JS);
  await page.evaluate(() => document.fonts.ready);
  await sleep(settle);
  return { ctx, page };
}

/**
 * Element center in document-space window px. Captures must keep the page
 * scroll pinned (scrollTo is no-op'd; framing happens via body transform),
 * so we only need to undo any active transform offset.
 */
async function docCenter(page, selector) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`no boundingBox for ${selector}`);
  const shift = await page.evaluate(() => {
    const t = document.body.style.transform;
    const m = /translateY\((-?[\d.]+)px\)/.exec(t || '');
    return m ? parseFloat(m[1]) : 0;
  });
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 - shift * ZOOM };
}

/** x-coordinate of a range input's thumb at a given value (window px). */
function thumbX(box, min, max, val, thumbPx = 32) {
  const frac = (val - min) / (max - min);
  return box.x + thumbPx / 2 + frac * (box.width - thumbPx);
}

/* ------------------------------------------------------------------ */
async function recordHousing(browser) {
  const { ctx, page } = await newPage(browser, `${BASE}/housing-calculator.html`);
  await sleep(300);

  // measure everything in document space up front (step 2 measured by
  // flipping the card quietly, then flipping back; scrollTo is no-op'd so
  // the framing cannot shift underneath us)
  const income = await docCenter(page, '#annualIncome');
  const cont = await docCenter(page, '#step1 .btn-p');
  await page.evaluate(() => goStep(2));
  await sleep(150);
  const zip = await docCenter(page, '#zipCode');
  const calc = await docCenter(page, '#step2 .btn-p');
  await page.evaluate(() => goStep(1));
  await sleep(150);

  const sc = new VScene(page, 'housing');

  sc.hold(0.6);
  sc.moveToDoc(income, 0.7);
  sc.at(async () => { await page.evaluate(() => { const el = document.getElementById('annualIncome'); el.focus(); el.select(); }); });
  sc.click(false);
  sc.type('52000', 10);
  sc.hold(0.35);
  sc.ensure(cont, 0.55);
  sc.moveToDoc(cont, 0.6);
  sc.click();
  sc.jumpTo(0); // the page's own UX jumps to the top of the new step
  sc.hold(0.65);
  sc.ensure(zip, 0.5);
  sc.moveToDoc(zip, 0.65);
  sc.at(async () => { await page.evaluate(() => { document.getElementById('zipCode').focus(); }); });
  sc.click(false);
  sc.type('44240', 8);
  sc.hold(1.05); // area-median hint + auto-filled price get a beat to read
  sc.ensure(calc, 0.55);
  sc.moveToDoc(calc, 0.6);
  sc.click();
  sc.jumpTo(0);
  sc.hold(0.3);
  // re-animate the gauge pointer + savings progress bar frame-accurately
  sc.at(async () => {
    await page.evaluate(() => {
      const bar = document.getElementById('pBar');
      const ptr = document.getElementById('gaugePtr');
      window.__targets = { bar: bar?.style.width || null, ptr: ptr?.style.left || null };
      if (bar) bar.style.width = '0%';
      if (ptr) ptr.style.left = '0%';
    });
  });
  sc.animatePar(0.9, async (p) => {
    await page.evaluate((pp) => {
      const t = window.__targets || {};
      const bar = document.getElementById('pBar');
      const ptr = document.getElementById('gaugePtr');
      if (bar && t.bar) bar.style.width = (parseFloat(t.bar) * pp) + '%';
      if (ptr && t.ptr) ptr.style.left = (parseFloat(t.ptr) * pp) + '%';
    }, p);
  });
  sc.moveTo(VIEW.width - 380, VIEW.height - 300, 1.0);
  sc.hold(1.0);
  // glide down to bring the ratio gauge + breakdown into frame
  sc.glideTo(282 * ZOOM, 1.3);
  sc.hold(1.6);

  const dur = await sc.render();
  await ctx.close();
  return dur;
}

/* ------------------------------------------------------------------ */
async function recordIra(browser) {
  const { ctx, page } = await newPage(browser, `${BASE}/ira-battle.html`);
  // frame the controls + verdict with no partial elements peeking at top:
  // align the left controls card ("YOU") a touch below the viewport top
  // getBoundingClientRect reports window px under the zoomed root, while
  // translateY consumes layout px — convert before applying
  const cardTopWin = await page.evaluate(() => {
    const youCard = document.getElementById('age')?.closest('div, section, aside');
    return youCard ? youCard.getBoundingClientRect().top : 0;
  });
  await page.evaluate((y) => { document.body.style.transform = 'translateY(' + (-y) + 'px)'; }, Math.max(0, cardTopWin / ZOOM - 40));
  await sleep(400);

  const sc = new VScene(page, 'ira');
  const yearsBox = await page.locator('#years').boundingBox();
  if (!yearsBox) throw new Error('years slider not visible');
  const cy = yearsBox.y + yearsBox.height / 2;
  const Y = { min: 5, max: 50 };
  const setYears = async (v) => {
    await page.evaluate((val) => {
      const el = document.getElementById('years');
      el.value = String(Math.round(val));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, v);
  };
  const dragYears = (from, to, sec) => {
    sc.animate(sec, async (p) => {
      const v = from + (to - from) * p;
      await setYears(v);
      return { x: thumbX(yearsBox, Y.min, Y.max, v), y: cy };
    }, { pressed: true });
  };

  sc.hold(0.7);
  sc.moveTo(thumbX(yearsBox, Y.min, Y.max, 40), cy, 0.8);
  sc.hold(0.15);
  dragYears(40, 24, 2.0);   // balances shrink live, the gap narrows
  sc.hold(0.9);
  dragYears(24, 45, 1.9);   // compounding takes off, Roth's lead widens
  sc.hold(0.7);

  const verdictBox = await page.locator('#verdictCard').boundingBox();
  sc.moveTo(verdictBox.x + verdictBox.width * 0.72, verdictBox.y + verdictBox.height * 0.55, 0.9);
  sc.hold(2.4);

  const dur = await sc.render();
  await ctx.close();
  return dur;
}

/* ------------------------------------------------------------------ */
async function captureBarometer(browser) {
  const { ctx, page } = await newPage(browser, `${BASE}/barometer.html`, 3500);
  await page.evaluate(() => {
    document.querySelector('#trend-chart')?.scrollIntoView({ block: 'center', behavior: 'instant' });
    if (window.__vcursor) window.__vcursor.style.display = 'none';
  });
  await sleep(1500);
  const out = path.join(ROOT, 'recordings', 'barometer.png');
  await page.screenshot({ path: out });
  console.log(`[barometer] still -> ${out}`);
  await ctx.close();
}

/* ------------------------------------------------------------------ */
async function probe(browser) {
  for (const [name, url, sel] of [
    ['housing-step1', `${BASE}/housing-calculator.html`, '#step1'],
    ['ira', `${BASE}/ira-battle.html`, '#verdictCard'],
    ['barometer', `${BASE}/barometer.html`, '#trend-chart'],
  ]) {
    const { ctx, page } = await newPage(browser, url, 2500);
    await page.evaluate((s) => {
      document.querySelector(s)?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }, sel);
    await sleep(1200);
    await page.screenshot({ path: `/tmp/probe-${name}.png` });
    console.log(`probe -> /tmp/probe-${name}.png`);
    await ctx.close();
  }
}

/* ------------------------------------------------------------------ */
const what = process.argv[2] || 'all';
const browser = await chromium.launch({
  // The sandbox proxy re-signs TLS; Chromium doesn't trust its CA, which
  // breaks Google Fonts + the pinned Chart.js CDN. Safe to ignore for
  // recording our own first-party pages.
  args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--ignore-certificate-errors'],
});
try {
  if (what === 'probe') await probe(browser);
  if (what === 'housing' || what === 'all') await recordHousing(browser);
  if (what === 'ira' || what === 'all') await recordIra(browser);
  if (what === 'barometer' || what === 'all') await captureBarometer(browser);
} finally {
  await browser.close();
}
