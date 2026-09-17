/* Story viewer navigation shared by every Mango Stories lesson page.
   Adds Back / Next buttons, a slide counter, swipe gestures and tap zones
   so the slides work with a thumb on a phone as well as a mouse. */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // Elements a tap should never turn into a slide change.
  var INTERACTIVE = 'button, a, input, select, textarea, label, .interactive-card, .interactive-drivers, .ai-search-tool, [onclick]';

  function story() {
    return (typeof currentStory !== 'undefined') ? currentStory : null;
  }

  function slideIndex() {
    return (typeof currentSlideIndex !== 'undefined') ? currentSlideIndex : 0;
  }

  // Called from showSlide() on every page after currentSlideIndex changes.
  window.updateStoryNav = function () {
    var s = story();
    if (!s) return;
    var total = s.slides.length;
    var i = slideIndex();
    var counter = document.getElementById('storyCounter');
    var prevBtn = document.getElementById('storyPrevBtn');
    var nextBtn = document.getElementById('storyNextBtn');
    var container = document.getElementById('slideContainer');

    if (counter) counter.textContent = (i + 1) + ' / ' + total;
    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) {
      var last = i === total - 1;
      nextBtn.classList.toggle('is-finish', last);
      nextBtn.setAttribute('aria-label', last ? 'Finish story' : 'Next slide');
      var label = nextBtn.querySelector('.story-nav-label');
      if (label) label.textContent = last ? 'Finish' : 'Next';
    }
    // New slide: start reading from the top.
    if (container) container.scrollTop = 0;
  };

  ready(function () {
    var viewer = document.getElementById('storyViewer');
    var container = document.getElementById('slideContainer');
    if (!viewer || !container) return;

    var startX = 0, startY = 0, startT = 0, swiped = false;

    viewer.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startT = Date.now();
      swiped = false;
    }, { passive: true });

    viewer.addEventListener('touchend', function (e) {
      if (!story()) return;
      if (e.target.closest(INTERACTIVE)) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      // A quick, mostly-horizontal drag is a swipe between slides.
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - startT < 800) {
        swiped = true;
        if (dx < 0) { nextSlide(); } else { previousSlide(); }
      }
    }, { passive: true });

    // Tap the left third of the slide to go back, anywhere else to go forward.
    container.addEventListener('click', function (e) {
      if (!story()) return;
      if (swiped) { swiped = false; return; }
      if (e.target.closest(INTERACTIVE)) return;
      var sel = window.getSelection && window.getSelection();
      if (sel && String(sel).length > 0) return;
      var rect = container.getBoundingClientRect();
      var x = e.clientX - rect.left;
      if (x < rect.width / 3) { previousSlide(); } else { nextSlide(); }
    });

    // Tapping the dimmed backdrop closes the story.
    viewer.addEventListener('click', function (e) {
      if (e.target === viewer && story()) closeStory();
    });
  });
})();
