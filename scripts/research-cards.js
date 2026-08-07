/* ============================================================
   RESEARCH CARDS — the one renderer for report and publication
   markup. Three pages consume it:

     research.html               featured report teaser + 3 publications
     research-reports.html       full library, filtered
     research-publications.html  full bibliography + working papers + team

   Data comes from data/reports.js and data/publications.js. Keep the
   markup here and nowhere else, so a class change lands on every page
   at once. Plain ES5 — these pages ship no build step.
   ============================================================ */
window.FinMangoResearchCards = (function () {

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M5 12h14M12 5l7 7-7 7"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------------------------------------------------------- REPORTS */

  function authorsHtml(authors) {
    return (authors || []).map(function (a) {
      return esc(a.name) + '<span class="aff"> (' + esc(a.affiliation) + ')</span>';
    }).join(', ');
  }

  function metaHtml(r) {
    return [r.partner, r.term].filter(Boolean).map(function (m) {
      return '<span>' + esc(m) + '</span>';
    }).join('');
  }

  function tagsHtml(r) {
    if (!r.tags || !r.tags.length) return '';
    return '<div class="report-tags">' + r.tags.map(function (t) {
      return '<span class="report-tag">' + esc(t) + '</span>';
    }).join('') + '</div>';
  }

  function docsHtml(docs) {
    return (docs || []).map(function (d) {
      return '<a class="report-doc" href="' + esc(d.url) + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="kind">' + esc(d.kind) + '</span> ' + esc(d.label) + '</a>';
    }).join('');
  }

  function upLinkHtml(r) {
    if (!r.publicationUrl) return '';
    var doi = r.doi ? ' &middot; ' + esc(r.doi) : '';
    return '<a class="report-link" href="' + esc(r.publicationUrl) + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="dir up" aria-hidden="true">&uarr;</span> Peer-reviewed paper' + doi + '</a>';
  }

  // Two-column treatment: summary + source docs on the left, key findings
  // and the tools this research informed on the right.
  function reportFeaturedHtml(r, types) {
    var t = (types && types[r.type]) || { label: r.type };
    var findings = (r.keyFindings || []).map(function (f) {
      return '<li>' + esc(f) + '</li>';
    }).join('');
    var tools = (r.relatedTools || []).map(function (tool) {
      return '<a class="report-link" href="' + esc(tool.url) + '">' +
        '<span class="dir down" aria-hidden="true">&darr;</span> ' + esc(tool.label) + '</a>';
    }).join('');
    return '<article class="report-featured" id="' + esc(r.id) + '" data-type="' + esc(r.type) +
      '" data-tags="' + esc((r.tags || []).join(' ')) + '">' +
      '<div class="rf-main">' +
        '<span class="report-type">' + esc(t.label) + '</span>' +
        '<h3 class="report-title">' + esc(r.title) + '</h3>' +
        '<div class="report-meta">' + metaHtml(r) + '</div>' +
        '<p class="report-authors">' + authorsHtml(r.authors) + '</p>' +
        '<p class="report-summary">' + esc(r.plainLanguageSummary) + '</p>' +
        tagsHtml(r) +
        '<div class="report-docs">' + docsHtml(r.documents) + upLinkHtml(r) + '</div>' +
      '</div>' +
      '<div class="rf-side">' +
        (findings ? '<div><div class="rf-block-label">Key findings</div>' +
          '<ul class="findings-list">' + findings + '</ul></div>' : '') +
        (tools ? '<div><div class="rf-block-label">What it informed &darr;</div>' +
          '<div class="rf-links">' + tools + '</div></div>' : '') +
      '</div>' +
    '</article>';
  }

  function reportCardHtml(r, types) {
    var t = (types && types[r.type]) || { label: r.type };
    return '<article class="report-card" id="' + esc(r.id) + '" data-type="' + esc(r.type) +
      '" data-tags="' + esc((r.tags || []).join(' ')) + '">' +
      '<span class="report-type">' + esc(t.label) + '</span>' +
      '<h3 class="report-title">' + esc(r.title) + '</h3>' +
      '<p class="report-summary">' + esc(r.plainLanguageSummary) + '</p>' +
      tagsHtml(r) +
      '<div class="report-docs">' + docsHtml(r.documents) + upLinkHtml(r) + '</div>' +
    '</article>';
  }

  /* ----------------------------------------------------- PUBLICATIONS */

  // `authors` carries pre-escaped entities (&amp; between author names), so
  // it is intentionally interpolated raw. Everything else goes through esc().
  function pubHead(p) {
    var meta = (p.featured ? '<span class="pub-tag-featured">Featured</span>' : '') +
      (p.meta || []).map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('');
    return '<div class="pub-meta">' + meta + '</div>' +
      '<h3 class="pub-title">' + esc(p.title) + '</h3>' +
      '<p class="pub-authors">' + p.authors + '</p>' +
      '<p class="pub-journal">' + esc(p.journal) + '</p>';
  }

  // Full entry: adds the expandable abstract. Call bindAbstractToggles()
  // once the markup is in the DOM.
  function publicationHtml(p) {
    var absId = 'abs-' + esc(p.id);
    return '<div class="pub-row">' + pubHead(p) +
      '<div class="pub-links">' +
        '<a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" class="quiet-link">' +
          esc(p.linkLabel) + ' ' + ARROW + '</a>' +
        '<button class="paper-toggle" aria-expanded="false" aria-controls="' + absId + '">' +
          '<span class="toggle-label">Read abstract</span>' +
          '<span class="toggle-arrow">&darr;</span></button>' +
      '</div>' +
      '<div class="paper-abstract-wrap" id="' + absId + '">' +
        '<p class="paper-abstract">' + esc(p.abstract) + '</p>' +
      '</div>' +
    '</div>';
  }

  // Teaser entry: same row, no abstract. The full bibliography page owns
  // the abstracts.
  function publicationTeaserHtml(p) {
    return '<div class="pub-row">' + pubHead(p) +
      '<div class="pub-links">' +
        '<a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" class="quiet-link">' +
          esc(p.linkLabel) + ' ' + ARROW + '</a>' +
      '</div>' +
    '</div>';
  }

  function workingPaperHtml(w) {
    return '<div class="pub-row">' +
      '<div class="pub-meta"><span>' + esc(w.year) + '</span><span>' + esc(w.fields) + '</span>' +
        '<span class="pub-tag-progress">In Progress</span></div>' +
      '<h3 class="pub-title">' + esc(w.title) + '</h3>' +
      '<p class="pub-authors">' + esc(w.authors) + '</p>' +
    '</div>';
  }

  function leadHtml(l) {
    return '<div class="lead-cell"><span class="lead-mark">' + esc(l.mark) + '</span>' +
      '<span class="lead-name">' + esc(l.name) + '</span></div>';
  }

  function collaboratorHtml(c) {
    return '<div class="collaborator"><div class="collaborator-name">' + esc(c.name) + '</div>' +
      '<div class="collaborator-org">' + esc(c.org) + '</div></div>';
  }

  function bindAbstractToggles(root) {
    var scope = root || document;
    Array.prototype.forEach.call(scope.querySelectorAll('.paper-toggle'), function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        var wrap = document.getElementById(btn.getAttribute('aria-controls'));
        if (wrap && wrap.classList.contains('paper-abstract-wrap')) wrap.classList.toggle('open');
        var label = btn.querySelector('.toggle-label');
        if (label) label.textContent = expanded ? 'Read abstract' : 'Hide abstract';
      });
    });
  }

  return {
    ARROW: ARROW,
    esc: esc,
    reportFeaturedHtml: reportFeaturedHtml,
    reportCardHtml: reportCardHtml,
    publicationHtml: publicationHtml,
    publicationTeaserHtml: publicationTeaserHtml,
    workingPaperHtml: workingPaperHtml,
    leadHtml: leadHtml,
    collaboratorHtml: collaboratorHtml,
    bindAbstractToggles: bindAbstractToggles,
  };
})();
