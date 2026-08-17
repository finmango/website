/* ==========================================================
   FINMANGO — MANGO PHYSICS HERO
   Draggable, throwable mangos that fall, tumble, collide, and settle into a
   pile in the hero, then converge into a dock along the bottom of the
   viewport as you scroll and act as navigation from there.

   The mechanic is ported from sglasgow.com. The tuning constants below are
   the ones from that build and are deliberately not "improved".

   Vanilla, no dependencies, no build step.
   ========================================================== */
(function () {
  'use strict';

  var layer = document.getElementById('mango-layer');
  if (!layer) return;

  var plate = document.getElementById('mango-dock-plate');
  var hero = document.querySelector('.hero');
  var band = document.getElementById('mango-band');
  var hint = document.getElementById('mango-hint');
  var controls = document.getElementById('mango-controls');
  var resetBtn = document.getElementById('mango-reset');
  var mobileMenu = document.getElementById('mobileMenu');

  if (!hero || !band) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Tuning ----------
     Ported as-is. Changing these is how the reference build ended up feeling
     wrong twice. */
  var gravity = 0.3;    // per 60fps step
  var friction = 0.99;  // per step, air drag
  var bounce = 0.7;     // restitution, walls and mango-to-mango
  var maxSpeed = 60;    // safety against tunnelling only; play never reaches it

  /* Not one of the four ported constants — an addition. Those describe
     gravity, air and restitution; none of them describe a surface. With air
     drag alone a mango that gets nudged rolls the full width of the page
     before it stops, so the heap flattens into a scattered line every time
     and never reads as a pile. This is rolling resistance, applied only on
     ground contact, and it is what lets them settle where they land. */
  var GROUND_FRICTION = 0.91;

  /* The simulation advances in whole 60fps steps and never a partial one, so
     every step moves a mango exactly as far as the last. Scaling forces by
     real elapsed time instead makes each frame's step slightly different,
     which is what reads as jitter. */
  var FRAME_MS = 1000 / 60;
  var MAX_CATCHUP = 5;
  var accumulator = 0;
  var lastFrame = 0;

  var FLICK_WINDOW = 120;   // ms of pointer trail a throw is read from
  var DRAG_SLOP = 6;        // px of movement that turns a click into a throw

  /* A mango that has been slow for this many steps is put to sleep, so the
     pile goes properly still instead of micro-bouncing forever. */
  var REST_SPEED = 0.2;
  var REST_STEPS = 30;
  var REST_SPIN = 0.012;

  /* Tumble. A rolling mango that never rotates looks wrong in a way a circle
     does not, so spin tracks horizontal speed while it is on the ground. */
  var ROLL_COUPLING = 0.28;
  var MAX_SPIN = 0.45;      // rad per step, keeps a hard throw from blurring

  /* A mango has a belly and a beak, so left alone it lies down rather than
     standing on end. Without this the pile settles into a bed of upright
     eggs, which is the single thing that most gives the effect away. */
  var SETTLE_TORQUE = 0.009;
  var SETTLE_DAMPING = 0.90;
  var SETTLE_SPEED = 1.3;   // only while it has stopped rolling
  var TWO_PI = Math.PI * 2;

  /* Pointer gravity. Push only, short range — an attraction term at any
     useful radius keeps every mango permanently agitated and nothing rests. */
  var REPEL_RADIUS = 110;
  var REPEL_FORCE = 0.45;
  var pointer = { x: 0, y: 0, active: false };

  /* ---------- Art ----------
     One flat silhouette and one leaf, both filled from CSS so the palette
     stays in the stylesheet. The outline is generated rather than drawn by
     hand: x is a plain cosine, so both ends round off with vertical tangents,
     one term skews the thickness toward the belly and one tilts the spine so
     the stem end rides higher. Hand-placed control points kept producing flat
     spots and kinks along the lower right. */
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var ART_BOX = '0 0 140 122';   // 122, not 120 — the belly reaches y=121.2
  var ART_BODY = 'M132 66 C132 69.7,130.9 73.6,129 77.5 C127 81.4,123.9 85.5,120.2 89.4 ' +
    'C116.4 93.3,111.6 97.3,106.4 100.9 C101.3 104.5,95.2 108,89.2 110.9 ' +
    'C83.1 113.7,76.4 116.3,70 118 C63.6 119.7,56.9 120.8,50.8 121 ' +
    'C44.8 121.2,38.7 120.6,33.6 119.1 C28.4 117.5,23.6 115.1,19.8 112 ' +
    'C16.1 108.9,13 104.8,11 100.5 C9.1 96.1,8 91,8 86 C8 81,9.1 75.5,11 70.6 ' +
    'C13 65.6,16.1 60.5,19.8 56.2 C23.6 51.9,28.4 47.9,33.6 44.7 ' +
    'C38.7 41.5,44.8 39,50.8 37.2 C56.9 35.4,63.6 34.4,70 34 ' +
    'C76.4 33.6,83.1 34.1,89.2 34.9 C95.2 35.8,101.3 37.4,106.4 39.3 ' +
    'C111.6 41.3,116.4 43.7,120.2 46.4 C123.9 49.1,127 52.2,129 55.5 ' +
    'C130.9 58.7,132 62.3,132 66Z';
  var ART_LEAF = 'M107 34 Q127.7 37.2 133 17 Q112.3 13.8 107 34Z';

  /* The leaf needs headroom, so the fruit sits low in its box. The simulation
     tracks the body, not the box, or the pile rests on an invisible margin. */
  var ART_RATIO = 140 / 122;     // element width / height
  var BODY_HALF_W = 0.443;       // of element width
  var BODY_HALF_H = 0.359;       // of element height
  var BODY_OFFSET_Y = 0.134;     // body centre sits below the box centre
  /* Body half-width works out at 0.508 of the element height, so this sits
     just inside touching — they nestle rather than hovering apart. */
  var COLLIDE_R = 0.49;          // of element height — the nestling knob

  /* Share of the window the settled pile is allowed to occupy. The slack is
     not cosmetic: a pile wedged between both walls can never resolve its
     overlaps, so it jostles forever and never sleeps. */
  var PILE_BUDGET = 0.80;

  var mangos = [];
  var animationId = null;
  var hasInteracted = false;
  var builtNatural = 0;    // width the current pile actually occupies
  var builtMobile = false;

  /* Cached so the loop never forces a layout mid-frame */
  var viewW = window.innerWidth;
  var viewH = window.innerHeight;
  var floorDoc = 0;    // pile floor, as a document offset
  var bandTopDoc = 0;
  var bandHeight = 0;
  var heroHeight = 0;

  /* Scroll-driven dock transition */
  var dockProgress = 0;
  var dockEased = 0;
  var lastEased = -1;
  var isDocked = false;
  var dockSize = 50;
  var dockGap = 14;

  /* ---------- Content ----------
     Four, deliberately. This is a quiet accent on a serious page, not the
     page's subject. `tone` picks the fill from the stylesheet; `size` is the
     element width in px at desktop and scales down from there. */
  var MANGO_DATA = [
    { label: 'Research', tone: 'deep', size: 120, url: 'research.html' },
    { label: 'Education', tone: 'orange', size: 110, url: 'education.html' },
    { label: 'Ambassador Notes', tone: 'orange', size: 106, url: 'posts.html',
      aria: 'Ambassador Notes', tip: 'Notes and briefs from our Ambassadors' },
    { label: 'The Pledge', tone: 'deep', size: 96, url: 'pledge-wall.html',
      aria: 'Sign the Pledge Wall', tip: 'Sign the Pledge Wall' }
  ];

  function smoothstep(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t * t * (3 - 2 * t);
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  /* Deterministic scatter. Real randomness gives a different — and
     occasionally ugly — opening arrangement on every load. */
  function jitter(i, salt) {
    var x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  /* ---------- Measurement ----------
     Everything the loop needs is read here and cached. Reading offsetHeight
     or getBoundingClientRect inside the animation loop forces a layout on
     every single frame. */
  function measure() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;

    var scrollY = window.pageYOffset;
    var bandRect = band.getBoundingClientRect();
    bandTopDoc = bandRect.top + scrollY;
    bandHeight = bandRect.height;
    floorDoc = bandRect.bottom + scrollY;
    heroHeight = hero.offsetHeight || viewH;

    var isMobile = viewW < 768;
    dockSize = isMobile ? 36 : 50;
    dockGap = isMobile ? 7 : 14;
  }

  /* The floor lives in the hero, so in viewport terms it climbs as you
     scroll. Clamped so a scrolled-away pile is squashed rather than crushed —
     it drops back out when you scroll up and the dock releases. */
  function floorY() {
    return clamp(floorDoc - window.pageYOffset, 240, viewH);
  }

  /* Inline rather than an <img>, so the fill is a stylesheet decision and one
     shape serves every tone */
  function buildArt() {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'mango-art');
    svg.setAttribute('viewBox', ART_BOX);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    for (var i = 0; i < 2; i++) {
      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', i === 0 ? ART_BODY : ART_LEAF);
      svg.appendChild(path);
    }
    return svg;
  }

  /* ---------- Building ---------- */
  function build() {
    for (var k = 0; k < mangos.length; k++) {
      layer.removeChild(mangos[k].el);
    }
    mangos = [];
    measure();

    var isMobile = viewW < 768;
    var natural = 0;
    for (var c = 0; c < MANGO_DATA.length; c++) {
      natural += MANGO_DATA[c].size * BODY_HALF_W * 2;
    }

    /* Scale the fruit so the settled pile always leaves slack at the walls.
       A pile wedged between both walls can never resolve its overlaps, so it
       jostles forever and never sleeps. */
    var scale = Math.min(1, (viewW * PILE_BUDGET) / natural);

    /* They start as a loose ring just above the band and fall a short way
       into it. Two things this gets right that a long drop does not: they
       arrive slowly enough to settle instead of scattering to the walls, and
       they start already touching, so they shoulder each other into a
       contiguous heap rather than leaving gaps where each one happened to
       land. Weighted right of centre to balance the left-set copy.

       A narrow window has no room to absorb a bouncy landing — the pile
       ricochets off both walls and settles as two clumps with a hole in the
       middle. Below 1024 they start inside the band and barely fall at all. */
    var tight = viewW < 1024;
    var ringX = viewW * (isMobile ? 0.5 : (tight ? 0.58 : 0.66));
    var ringY = bandTopDoc + bandHeight * (tight ? 0.30 : 0.22);
    var ringR = Math.min(viewW * 0.035, isMobile ? 38 : 48);

    for (var i = 0; i < MANGO_DATA.length; i++) {
      var data = MANGO_DATA[i];
      var w = Math.round(data.size * scale);
      var h = Math.round(w / ART_RATIO);

      var el = document.createElement('a');
      el.className = 'mango tone-' + data.tone;
      el.href = data.url;
      el.setAttribute('draggable', 'false');
      el.setAttribute('aria-label', data.aria || data.label);
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.style.fontSize = Math.max(8, w * 0.092) + 'px';

      var art = buildArt();
      el.appendChild(art);

      var label = document.createElement('span');
      label.className = 'mango-label';
      label.textContent = data.label;
      el.appendChild(label);

      var tip = document.createElement('span');
      tip.className = 'mango-tip';
      tip.textContent = data.tip || data.label || data.aria;
      el.appendChild(tip);

      layer.appendChild(el);

      /* Spread around a small ring, offset so they are not axis-aligned */
      var angle = ((i + 0.35) / MANGO_DATA.length) * Math.PI * 2;
      var dist = ringR;
      var m = {
        el: el,
        art: art,
        w: w,
        h: h,
        hw: w * BODY_HALF_W,
        hh: h * BODY_HALF_H,
        r: h * COLLIDE_R,
        x: clamp(ringX + Math.cos(angle) * dist, w * 0.5, viewW - w * 0.5),
        y: ringY + Math.sin(angle) * dist * 0.6 - jitter(i, 2) * 40,
        /* A touch of inward drift, so the ones on the edge of the ring join
           the heap instead of wandering off on their own */
        vx: (jitter(i, 3) - 0.5) * 0.6 - Math.cos(angle) * 0.8,
        vy: 0,
        angle: (jitter(i, 4) - 0.5) * 1.2,
        av: (jitter(i, 5) - 0.5) * 0.12,
        exX: w * BODY_HALF_W,
        exY: h * BODY_HALF_H,
        dockW: dockSize,               // resolved in layoutDock
        tx: 0,
        ty: 0,
        entered: false,
        dragging: false,
        frozen: false,
        resting: false,
        calm: 0,
        suppressClick: false
      };

      mangos.push(m);
      wireMango(m);
    }

    builtNatural = natural * scale;
    builtMobile = isMobile;
    layoutDock();
    lastEased = -1;
  }

  /* Where each mango goes once the page scrolls past the hero */
  function layoutDock() {
    measure();
    var totalW = 0;
    var i;

    for (i = 0; i < mangos.length; i++) {
      mangos[i].dockW = dockSize;
      totalW += dockSize;
    }
    totalW += (mangos.length - 1) * dockGap;

    var startX = (viewW - totalW) / 2;
    var rowY = viewH - dockSize / 2 - (viewW < 768 ? 18 : 26);
    var cursor = startX;

    for (i = 0; i < mangos.length; i++) {
      var m = mangos[i];
      m.tx = cursor + m.dockW / 2;
      m.ty = rowY;
      cursor += m.dockW + dockGap;
    }

    if (plate) {
      plate.style.left = (startX - 16) + 'px';
      plate.style.top = (rowY - dockSize * 0.82) + 'px';
      plate.style.width = (totalW + 32) + 'px';
      plate.style.height = (dockSize * 1.5) + 'px';
    }
  }

  function updateDockProgress() {
    var start = heroHeight * 0.30;
    var end = heroHeight * 0.70;
    var raw = (window.pageYOffset - start) / (end - start);
    dockProgress = clamp(raw, 0, 1);
    dockEased = smoothstep(dockProgress);

    var nowDocked = dockProgress > 0.55;
    if (nowDocked !== isDocked) {
      isDocked = nowDocked;
      layer.classList.toggle('is-docked', isDocked);
      for (var i = 0; i < mangos.length; i++) {
        mangos[i].el.classList.toggle('is-docked', isDocked);
      }
    }

    if (dockProgress > 0.15) {
      if (controls) controls.classList.add('is-retired');
      if (hint) hint.classList.add('is-hidden');
    } else {
      if (controls) controls.classList.remove('is-retired');
      if (hint && !hasInteracted) hint.classList.remove('is-hidden');
    }
  }

  /* ---------- Drag and throw ---------- */
  function wireMango(m) {
    var startX = 0, startY = 0, offX = 0, offY = 0;
    var samples = [];

    /* Keep a short trail of pointer positions. A throw's speed comes from
       this window, not from the final pointer event — hands decelerate just
       before letting go, and reading only the last event throws that away. */
    function sample(x, y, t) {
      samples.push(x, y, t);
      while (samples.length > 6 && t - samples[2] > FLICK_WINDOW) {
        samples.splice(0, 3);
      }
    }

    /* Take the fastest stretch ending at the release rather than averaging
       the whole window. A slow device may only report a handful of moves, and
       averaging lets the hand's final slowdown swallow the throw. */
    function flickVelocity() {
      var n = samples.length;
      if (n < 6) return null;

      var lastX = samples[n - 3], lastY = samples[n - 2], lastT = samples[n - 1];
      var best = null, bestSpeed = 0;

      for (var i = 0; i + 3 < n; i += 3) {
        var dt = lastT - samples[i + 2];
        if (dt < 4) continue;
        var vx = (lastX - samples[i]) / dt * FRAME_MS;
        var vy = (lastY - samples[i + 1]) / dt * FRAME_MS;
        var speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > bestSpeed) {
          bestSpeed = speed;
          best = { vx: vx, vy: vy };
        }
      }
      return best;
    }

    function onStart(e) {
      if (reduceMotion) return;
      if (dockProgress > 0.5) return;   // docked mangos are navigation, not toys
      if (e.button !== undefined && e.button !== 0) return;

      e.preventDefault();
      m.dragging = true;
      m.suppressClick = false;
      m.resting = false;
      m.calm = 0;
      m.vx = 0;
      m.vy = 0;

      startX = e.clientX;
      startY = e.clientY;
      offX = e.clientX - m.x;
      offY = e.clientY - m.y;

      samples.length = 0;
      /* One clock for every sample. Event timeStamps and performance.now()
         do not always share an origin, and mixing them wrecks the window. */
      sample(e.clientX, e.clientY, performance.now());

      /* Keeps the drag alive if the pointer outruns the mango */
      if (m.el.setPointerCapture) {
        try { m.el.setPointerCapture(e.pointerId); } catch (err) { /* not fatal */ }
      }

      /* Listen on the document, not the element, so the drag survives even
         where pointer capture is unavailable */
      document.addEventListener('pointermove', onMove, { passive: false });
      document.addEventListener('pointerup', onEnd);
      document.addEventListener('pointercancel', onEnd);

      markInteracted();
    }

    function onMove(e) {
      if (!m.dragging) return;
      e.preventDefault();

      sample(e.clientX, e.clientY, performance.now());
      m.x = e.clientX - offX;
      m.y = e.clientY - offY;

      /* Draw immediately rather than waiting for the next frame, so the mango
         stays glued to the cursor instead of trailing it by a frame */
      render(m, false);

      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_SLOP) m.suppressClick = true;
    }

    function onEnd(e) {
      if (!m.dragging) return;
      m.dragging = false;

      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onEnd);
      document.removeEventListener('pointercancel', onEnd);

      if (e && e.pointerId !== undefined && m.el.releasePointerCapture) {
        try { m.el.releasePointerCapture(e.pointerId); } catch (err) { /* not fatal */ }
      }

      var flick = flickVelocity();
      if (flick) {
        m.vx = flick.vx;
        m.vy = flick.vy;
        m.av = clamp(m.av + flick.vx * 0.010, -MAX_SPIN, MAX_SPIN);
      }
      samples.length = 0;
      m.entered = true;
    }

    m.el.addEventListener('pointerdown', onStart);

    /* A throw is not a click */
    m.el.addEventListener('click', function (e) {
      if (m.suppressClick) {
        e.preventDefault();
        m.suppressClick = false;
      }
    });

    m.el.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* Hold a mango still while it has keyboard focus, so the focus ring is
       not chasing a moving target */
    m.el.addEventListener('focus', function () {
      var visible = true;
      try { visible = m.el.matches(':focus-visible'); } catch (err) { /* freeze on any focus */ }
      if (visible) {
        m.frozen = true;
        m.vx = 0;
        m.vy = 0;
        m.av = 0;
      }
    });

    m.el.addEventListener('blur', function () { m.frozen = false; });
  }

  function markInteracted() {
    if (hasInteracted) return;
    hasInteracted = true;
    if (hint) hint.classList.add('is-hidden');
    if (controls && dockProgress <= 0.15) controls.classList.add('is-visible');
  }

  /* Returns true when the cursor actually pushed, which is also what wakes a
     sleeping mango */
  function applyPointerForces(m) {
    if (!pointer.active || !canHover) return false;
    var strength = 1 - dockEased;
    if (strength <= 0.01) return false;

    var dx = m.x - pointer.x;
    var dy = m.y - pointer.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) dist = 1;

    var radius = REPEL_RADIUS + m.r;
    if (dist >= radius) return false;

    var push = (1 - dist / radius) * REPEL_FORCE * strength;
    if (push < 0.02) return false;

    m.vx += (dx / dist) * push;
    m.vy += (dy / dist) * push;
    return true;
  }

  /* ---------- Simulation ---------- */
  function step() {
    var ground = floorY();
    var collisionScale = 1 - dockEased;
    var i, j;

    for (i = 0; i < mangos.length; i++) {
      var m = mangos[i];

      if (!m.dragging && !m.frozen) {
        if (applyPointerForces(m)) {
          m.resting = false;
          m.calm = 0;
        }

        /* A sleeping mango costs nothing and, more to the point, sits
           perfectly still */
        if (!m.resting) {
          m.vy += gravity;
          m.vx *= friction;
          m.vy *= friction;

          var speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
          if (speed > maxSpeed) {
            m.vx = (m.vx / speed) * maxSpeed;
            m.vy = (m.vy / speed) * maxSpeed;
            speed = maxSpeed;
          }

          m.x += m.vx;
          m.y += m.vy;

          /* Half-extents of the rotated body, so a tumbling mango rests on
             the floor at every angle instead of sinking into it */
          var c = Math.cos(m.angle), s = Math.sin(m.angle);
          var a2 = m.hw * m.hw, b2 = m.hh * m.hh;
          m.exX = Math.sqrt(a2 * c * c + b2 * s * s);
          m.exY = Math.sqrt(a2 * s * s + b2 * c * c);

          if (m.x - m.exX < 0) { m.x = m.exX; m.vx *= -bounce; }
          if (m.x + m.exX > viewW) { m.x = viewW - m.exX; m.vx *= -bounce; }

          if (!m.entered && m.y > 0) m.entered = true;
          if (m.entered && m.y - m.exY < 0) { m.y = m.exY; m.vy *= -bounce; }

          var grounded = false;
          if (m.y + m.exY > ground) {
            m.y = ground - m.exY;
            m.vy *= -bounce;
            grounded = true;
          }

          /* Tumble. Spin chases the horizontal speed while the mango is on
             the ground, which is what makes it read as rolling. */
          if (grounded) {
            m.vx *= GROUND_FRICTION;
            m.av += ((m.vx / m.r) - m.av) * ROLL_COUPLING;

            /* Once it has stopped rolling, torque it down onto its side.
               Measured against the nearest lying-down angle, so a mango
               topples whichever way is shorter. Note the -sin(off) rather
               than the tidier-looking -sin(2*angle): the latter's torque
               falls to zero as a mango approaches upright, which is exactly
               where it is needed, and one can then drop below the sleep
               threshold still balanced on its end. */
            if (Math.abs(m.vx) < SETTLE_SPEED) {
              /* Measured against upright, not merely against lying flat: a
                 mango resting with its leaf underneath is technically flat
                 and looks wrong, so the only stable orientation is stem up.
                 -sin always drives the short way round. */
              var off = m.angle - Math.round(m.angle / TWO_PI) * TWO_PI;
              var righting = Math.sin(off);
              /* Dead upside down is a balance point where sin vanishes, and a
                 mango can sleep there. Keep a floor so it always topples. */
              if (Math.abs(off) > 2.5 && Math.abs(righting) < 0.25) {
                righting = off > 0 ? 0.25 : -0.25;
              }
              m.av -= righting * SETTLE_TORQUE;
              m.av *= SETTLE_DAMPING;   // or the pile rocks forever
            }
          }
          m.av *= friction;
          m.av = clamp(m.av, -MAX_SPIN, MAX_SPIN);
          m.angle += m.av;

          /* Stay slow for long enough and the mango is done moving. Free fall
             never qualifies, because it is only slow for an instant. */
          if (speed < REST_SPEED && Math.abs(m.av) < REST_SPIN) {
            if (++m.calm > REST_STEPS) {
              m.vx = 0;
              m.vy = 0;
              m.av = 0;
              m.resting = true;
            }
          } else {
            m.calm = 0;
          }
        }
      }

      if (collisionScale > 0.01) {
        for (j = i + 1; j < mangos.length; j++) {
          var o = mangos[j];
          var dx = o.x - m.x;
          var dy = o.y - m.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var minDist = m.r + o.r;

          if (dist < minDist && dist > 0) {
            var overlap = (minDist - dist) * collisionScale;
            var nx = dx / dist, ny = dy / dist;

            m.x -= nx * overlap / 2;
            m.y -= ny * overlap / 2;
            o.x += nx * overlap / 2;
            o.y += ny * overlap / 2;

            var dot = (m.vx - o.vx) * nx + (m.vy - o.vy) * ny;

            /* Only a real knock wakes a sleeping mango. Mangos in a settled
               pile touch constantly; that must not count, or the pile keeps
               waking itself every frame and never goes still. */
            if (Math.abs(dot) > REST_SPEED) {
              m.resting = false;
              o.resting = false;
              m.calm = 0;
              o.calm = 0;
            }

            var impulse = dot * bounce * collisionScale;
            m.vx -= impulse * nx;
            m.vy -= impulse * ny;
            o.vx += impulse * nx;
            o.vy += impulse * ny;

            /* A glancing knock also sets them spinning */
            var tang = (m.vx - o.vx) * -ny + (m.vy - o.vy) * nx;
            m.av = clamp(m.av - tang * 0.004, -MAX_SPIN, MAX_SPIN);
            o.av = clamp(o.av + tang * 0.004, -MAX_SPIN, MAX_SPIN);
          }
        }
      }
    }

    /* Collisions run after each mango's own wall check, and a sleeping mango
       skips that check altogether — so a crowded pile can shove one off the
       edge with nothing left to pull it back. This final pass is the
       invariant: whatever else happened this step, everything is on screen. */
    for (i = 0; i < mangos.length; i++) {
      var q = mangos[i];
      if (q.dragging) continue;
      if (q.x - q.exX < 0) q.x = q.exX;
      else if (q.x + q.exX > viewW) q.x = viewW - q.exX;
      if (q.y + q.exY > ground) q.y = ground - q.exY;
    }
  }

  /* ---------- Render ---------- */
  function render(m, sizeChanged) {
    /* Blend the free simulation into the dock slot */
    var target = m.dockW || dockSize;
    var w = m.w + (target - m.w) * dockEased;
    var h = w / ART_RATIO;
    var cx = m.x + (m.tx - m.x) * dockEased;
    var cy = m.y + (m.ty - m.y) * dockEased;
    /* Mangos stand upright once they are a dock */
    var angle = m.angle * (1 - dockEased);

    if (sizeChanged) {
      m.el.style.width = w + 'px';
      m.el.style.height = h + 'px';
      m.el.style.fontSize = Math.max(8, w * 0.092) + 'px';
    }

    m.el.style.transform = 'translate3d(' +
      (cx - w / 2) + 'px,' + (cy - h / 2 - h * BODY_OFFSET_Y) + 'px,0)';
    m.art.style.transform = 'rotate(' + angle + 'rad)';
  }

  function update(now) {
    updateDockProgress();

    if (!lastFrame) lastFrame = now - FRAME_MS;
    var elapsed = now - lastFrame;
    lastFrame = now;
    if (elapsed > 200) elapsed = 200;
    /* Snap near-vsync frames to exactly one step, so a 60Hz display never
       alternates between one and two steps per frame. The accumulator is also
       what keeps a 120Hz display from running the sim at double speed. */
    if (Math.abs(elapsed - FRAME_MS) < 2) elapsed = FRAME_MS;
    accumulator += elapsed;

    var steps = 0;
    while (accumulator >= FRAME_MS && steps < MAX_CATCHUP) {
      step();
      accumulator -= FRAME_MS;
      steps++;
    }
    if (steps === MAX_CATCHUP) accumulator = 0;

    var sizeChanged = Math.abs(dockEased - lastEased) > 0.0005;
    for (var i = 0; i < mangos.length; i++) render(mangos[i], sizeChanged);
    if (sizeChanged) lastEased = dockEased;

    animationId = requestAnimationFrame(update);
  }

  function wakeAll() {
    for (var i = 0; i < mangos.length; i++) {
      mangos[i].resting = false;
      mangos[i].calm = 0;
    }
  }

  function reset() {
    hasInteracted = false;
    if (hint) hint.classList.remove('is-hidden');
    if (controls) controls.classList.remove('is-visible');
    lastFrame = 0;
    accumulator = 0;
    build();
  }

  /* ---------- Reduced motion ----------
     No loop, no dock, no drift. A tidy cluster resting in the band, still
     fully clickable and keyboard reachable. */
  function startStatic() {
    layer.classList.add('is-static');
    build();
    layoutStatic();
  }

  function layoutStatic() {
    measure();
    layer.style.top = bandTopDoc + 'px';
    layer.style.height = bandHeight + 'px';

    var total = 0, i;
    for (i = 0; i < mangos.length; i++) total += mangos[i].w * 0.82;
    var startX = Math.max(16, (viewW - total) / 2);
    var cursor = startX;

    for (i = 0; i < mangos.length; i++) {
      var m = mangos[i];
      var x = cursor + m.w * 0.41;
      var y = bandHeight - m.h * 0.55 - jitter(i, 6) * bandHeight * 0.24;
      m.el.style.transform = 'translate3d(' +
        (x - m.w / 2) + 'px,' + (y - m.h / 2) + 'px,0)';
      m.art.style.transform = 'rotate(' + ((jitter(i, 7) - 0.5) * 0.5) + 'rad)';
      cursor += m.w * 0.82;
    }
  }

  function start() {
    if (reduceMotion) {
      startStatic();
      return;
    }
    build();
    animationId = requestAnimationFrame(update);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  if (resetBtn) resetBtn.addEventListener('click', reset);

  if (canHover && !reduceMotion) {
    window.addEventListener('mousemove', function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    });
    document.addEventListener('mouseleave', function () { pointer.active = false; });
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (reduceMotion) {
        layoutStatic();
        return;
      }
      measure();
      /* The fruit is sized once, for the width it was built at. Rebuild when
         that sizing stops fitting — eight desktop mangos in a 700px window
         are wedged solid and can never settle — or when the window has grown
         enough that the pile looks lost in it. Anything in between just
         relays the dock out, so an idle nudge of the window edge does not
         dump a fresh pile on someone. */
      if ((viewW < 768) !== builtMobile ||
          builtNatural > viewW * PILE_BUDGET ||
          builtNatural < viewW * PILE_BUDGET * 0.62) {
        lastFrame = 0;
        accumulator = 0;
        build();
      } else {
        layoutDock();
        wakeAll();
      }
    }, 200);
  });

  /* The mobile menu is a full-screen overlay in the same stacking range —
     get out of its way while it is open. */
  if (mobileMenu && window.MutationObserver) {
    new MutationObserver(function () {
      layer.hidden = mobileMenu.classList.contains('active');
    }).observe(mobileMenu, { attributes: true, attributeFilter: ['class'] });
  }

  /* Pause the loop when the tab is hidden */
  document.addEventListener('visibilitychange', function () {
    if (reduceMotion) return;
    if (document.hidden) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else if (!animationId) {
      lastFrame = 0;
      accumulator = 0;
      animationId = requestAnimationFrame(update);
    }
  });

  /* Exposed only so the Playwright checks can read simulation state.
     Getters, not the array itself — build() replaces it. */
  window.__mangoHero = {
    count: function () { return mangos.length; },
    isResting: function () {
      for (var i = 0; i < mangos.length; i++) {
        if (!mangos[i].resting) return false;
      }
      return mangos.length > 0;
    },
    dockProgress: function () { return dockProgress; }
  };
})();
