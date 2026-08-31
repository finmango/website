// Per-slide PNG export from the browser, for when someone wants one slide
// re-cut without opening a terminal. The committed PNGs come from
// scripts/render-post-social.js, which is the one to trust for a full
// batch: html2canvas approximates a few things (notably filter: invert),
// headless Chrome does not.
async function shoot(n) {
  var slide = document.querySelector('[data-slide="' + n + '"]');
  var prev = slide.style.transform;
  slide.style.transform = 'none';
  var canvas = await html2canvas(slide, {
    width: 1080, height: 1350, scale: 1.3333,
    useCORS: true, backgroundColor: null
  });
  slide.style.transform = prev;
  return canvas;
}

async function downloadSlide(n) {
  var canvas = await shoot(n);
  var a = document.createElement('a');
  a.download = 'slide-' + String(n).padStart(2, '0') + '.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}

async function downloadAll() {
  for (var n = 1; n <= 8; n++) {
    await downloadSlide(n);
    await new Promise(function (r) { setTimeout(r, 400); });
  }
}
