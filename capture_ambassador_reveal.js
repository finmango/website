/**
 * Capture ambassador-2026-reveal.html as a series of PNG frames, then
 * stitch them into an MP4 + WebP via ffmpeg.
 *
 * Usage:
 *   npm install
 *   node capture_ambassador_reveal.js              # default: 9s @ 30fps
 *   FPS=60 DURATION=9 node capture_ambassador_reveal.js
 *
 * Output:
 *   out/ambassador-reveal/frame_0000.png ... frame_NNNN.png
 *   out/ambassador-reveal.mp4
 *   out/ambassador-reveal.webp
 *
 * Requires: puppeteer, ffmpeg on PATH.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DURATION = parseFloat(process.env.DURATION || '9');   // seconds, must match --duration in CSS
const FPS      = parseInt(process.env.FPS || '30', 10);
const WIDTH    = 1080;
const HEIGHT   = 1920;
const OUT_DIR  = path.resolve('out');
const FRAME_DIR = path.join(OUT_DIR, 'ambassador-reveal');

(async () => {
  fs.mkdirSync(FRAME_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Native 1080x1920 viewport so the preview-scale media query does not trigger
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const htmlPath = path.resolve('ambassador-2026-reveal.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Wait for fonts + images to settle
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.images];
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
    // Let one animation frame paint so getAnimations() is populated
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });

  // Pause every running animation so we can step the clock deterministically
  await page.evaluate(() => {
    for (const a of document.getAnimations()) {
      a.pause();
    }
  });

  const totalFrames = Math.round(DURATION * FPS);
  console.log(`Capturing ${totalFrames} frames @ ${FPS}fps (${DURATION}s total)`);

  for (let i = 0; i < totalFrames; i++) {
    const t = i / FPS; // seconds
    await page.evaluate((timeSec) => {
      for (const a of document.getAnimations()) {
        // currentTime is in ms. The Web Animations API respects animation-delay
        // automatically when we assign currentTime on a paused CSS animation.
        try { a.currentTime = timeSec * 1000; } catch (e) { /* some animations may be finished */ }
      }
    }, t);

    const frameFile = path.join(FRAME_DIR, `frame_${String(i).padStart(4, '0')}.png`);
    const stage = await page.$('#stage');
    await stage.screenshot({ path: frameFile, omitBackground: false });

    if (i % 15 === 0) process.stdout.write(`  ${i}/${totalFrames}\r`);
  }
  console.log(`\nFrames written to ${FRAME_DIR}`);

  await browser.close();

  // Stitch with ffmpeg if available
  const ffmpeg = spawnSync('ffmpeg', ['-version']);
  if (ffmpeg.status !== 0) {
    console.log('ffmpeg not found on PATH — skipping video encode.');
    console.log('Install ffmpeg and re-run, or encode manually:');
    console.log(`  ffmpeg -y -framerate ${FPS} -i ${FRAME_DIR}/frame_%04d.png \\`);
    console.log(`    -c:v libx264 -pix_fmt yuv420p -crf 17 -movflags +faststart \\`);
    console.log(`    out/ambassador-reveal.mp4`);
    return;
  }

  const mp4 = path.join(OUT_DIR, 'ambassador-reveal.mp4');
  const webp = path.join(OUT_DIR, 'ambassador-reveal.webp');

  console.log('Encoding MP4...');
  spawnSync('ffmpeg', [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(FRAME_DIR, 'frame_%04d.png'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '17',
    '-movflags', '+faststart',
    mp4,
  ], { stdio: 'inherit' });

  console.log('Encoding animated WebP (social preview)...');
  spawnSync('ffmpeg', [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(FRAME_DIR, 'frame_%04d.png'),
    '-vcodec', 'libwebp',
    '-lossless', '0',
    '-q:v', '80',
    '-loop', '0',
    '-preset', 'picture',
    '-vf', `fps=${FPS},scale=720:-1:flags=lanczos`,
    webp,
  ], { stdio: 'inherit' });

  console.log(`\nDone.\n  ${mp4}\n  ${webp}`);
})().catch(err => { console.error(err); process.exit(1); });
