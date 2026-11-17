/* Barrier Breakers event site: shared header, footer, countdown, notify form. */
(function () {
  // The mark: a barrier bar, snapped in two.
  var MARK = '<svg class="bb-mark" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="6" fill="#F25A27"/><path d="M5 20.5l9.5-3 1.6 5-9.5 3z" fill="#0B0B0C"/><path d="M18.5 12l9.5-3 1.6 5-9.5 3z" fill="#0B0B0C"/></svg>';

  var here = document.body.getAttribute('data-page') || '';

  // Links to sections of the old single page still work: send them to the page that now holds that content.
  if (here === 'home' && location.hash) {
    var MOVED = { '#support': 'sponsor.html', '#sponsors': 'sponsor.html', '#winners': 'winners.html', '#judges': 'winners.html#judges',
      '#gallery': 'winners.html#gallery', '#gallery-2026': 'winners.html#gallery', '#apply': '#notify-me',
      '#why': 'compete.html', '#how': 'compete.html', '#tracks': 'compete.html', '#format': 'compete.html',
      '#prizes': 'compete.html', '#resources': 'resources.html' };
    var to = MOVED[location.hash];
    if (to) location.replace(to);
  }
  var LINKS = [
    ['compete', 'compete.html', 'Compete'],
    ['schedule', 'schedule.html', 'Schedule'],
    ['judge', '../barrier-breakers-judge-apply.html', 'Judge'],
    ['sponsor', 'sponsor.html', 'Sponsor'],
    ['resources', 'resources.html', 'Deck and resources']
  ];

  /* ---------- Header ---------- */
  var head = document.getElementById('bb-header');
  if (head) {
    head.innerHTML =
      '<nav class="bb-nav" aria-label="Barrier Breakers"><div class="container">' +
        '<a class="bb-logo" href="index.html">' + MARK + '<span>Barrier Breakers</span></a>' +
        '<ul class="bb-links" id="bbLinks">' +
          LINKS.map(function (l) {
            return '<li><a href="' + l[1] + '"' + (l[0] === here ? ' aria-current="page"' : '') + '>' + l[2] + '</a></li>';
          }).join('') +
        '</ul>' +
        '<div class="bb-right">' +
          '<a class="btn btn-primary" href="' + (here === 'home' ? '#notify-me' : 'index.html#notify-me') + '">Get notified</a>' +
          '<button class="bb-burger" id="bbBurger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="bbLinks">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
          '</button>' +
        '</div>' +
      '</div></nav>';
    var burger = document.getElementById('bbBurger'), links = document.getElementById('bbLinks');
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    /* ---------- Footer ---------- */
    var foot = document.getElementById('bb-footer');
    if (foot) {
      foot.innerHTML =
        '<div class="container">' +
          '<a class="by" href="../index.html"><span>Barrier Breakers is a program of</span><img src="../images/finmango-white.png" alt="FinMango"></a>' +
          '<ul>' +
            '<li><a href="winners.html">Past winners</a></li>' +
            '<li><a href="https://www.every.org/finmango/f/barrier-breakers-202" target="_blank" rel="noopener">Give</a></li>' +
            '<li><a href="mailto:competition@finmango.org">competition@finmango.org</a></li>' +
          '</ul>' +
        '</div>';
    }

    /* ---------- Days to go ---------- */
    var c = document.getElementById('daysToGo');
    if (c) {
      var now = new Date();
      var days = Math.round((Date.UTC(2027, 2, 8) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
      if (days > 1) c.textContent = days + ' days away. ';
      else if (days === 1) c.textContent = 'Tomorrow. ';
      else if (days === 0) c.textContent = 'Today. ';
    }

    /* ---------- "Get notified" form (same backend as the current page) ---------- */
    var NOTIFY_URL = 'https://script.google.com/macros/s/AKfycbwAqIzAGz8YH_xzaTPWhTGTKI5jBRtunrCf7IlWPkkvSjBT9Mae_jOgqbaz_ps76fciSQ/exec';
    var form = document.getElementById('notify');
    if (form) {
      var startedAt = performance.now();
      var email = document.getElementById('notifyEmail'), role = document.getElementById('notifyRole');
      var btn = document.getElementById('notifyBtn'), msg = document.getElementById('notifyMsg'), done = document.getElementById('notifyDone');
      var FALLBACK = 'Email <a href="mailto:competition@finmango.org?subject=Barrier Breakers 2027 Interest">competition@finmango.org</a> and we\'ll add you by hand.';
      var showDone = function () { form.hidden = true; done.hidden = false; done.focus({ preventScroll: true }); };
      var fail = function (text) { btn.disabled = false; btn.firstChild.textContent = 'Get notified for 2027 '; msg.innerHTML = text + ' ' + FALLBACK; msg.hidden = false; };
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        msg.hidden = true; form.classList.remove('error');
        var value = email.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { form.classList.add('error'); msg.innerHTML = 'Enter an email address.'; msg.hidden = false; email.focus(); return; }
        // bots fill the hidden field or finish in under three seconds; humans do neither
        if (form.elements.company.value || (performance.now() - startedAt) < 3000) { showDone(); return; }
        btn.disabled = true; btn.firstChild.textContent = 'Sending… ';
        var body = new URLSearchParams({ form: 'notify', email: value, role: role.value, page: location.pathname });
        fetch(NOTIFY_URL, { method: 'POST', mode: 'no-cors', body: body })
          .then(showDone)
          .catch(function () { fail("That didn't go through. Check your connection and try again, or"); });
      });
    }
  });

})();
