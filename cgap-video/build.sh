#!/usr/bin/env bash
# One-command reproducible build for the FinMango CGAP pitch video.
# Re-run after dropping new assets into assets/ — everything re-times itself.
set -euo pipefail
cd "$(dirname "$0")"

echo "==> deps"
[ -d node_modules ] || npm install

echo "==> screen recordings (set FORCE_RECORD=1 to re-capture)"
if [ ! -f recordings/housing.mp4 ] || [ ! -f recordings/ira.mp4 ] || [ ! -f recordings/barometer.png ] || [ "${FORCE_RECORD:-0}" = "1" ]; then
  (cd .. && python3 -m http.server 8907 --bind 127.0.0.1 >/tmp/cgap-http.log 2>&1 & echo $! > /tmp/cgap-http.pid)
  sleep 1
  node src/record-calculators.mjs all
  kill "$(cat /tmp/cgap-http.pid)" 2>/dev/null || true
fi

echo "==> caption timing (whisper, when speech assets + model are available)"
if ls assets/vo-segment2.m4a assets/vo-segment3.m4a assets/camera-open.mp4 assets/camera-close.mp4 >/dev/null 2>&1; then
  if python3 -c "import whisper" 2>/dev/null; then
    if [ ! -f src/captions-timed.json ] || [ "${FORCE_TRANSCRIBE:-0}" = "1" ]; then
      python3 src/transcribe-captions.py || echo "whisper pass failed — proportional captions will be used"
    fi
  else
    echo "openai-whisper not installed (pip install openai-whisper --break-system-packages) — proportional captions will be used"
  fi
fi

echo "==> timeline + media staging + music bed"
node src/prepare-timeline.mjs
mkdir -p public/fonts
cp node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2 \
   node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2 \
   node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2 \
   node_modules/@fontsource/dm-sans/files/dm-sans-latin-900-normal.woff2 \
   public/fonts/
cp node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2 \
   node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2 \
   node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2 \
   public/fonts/

echo "==> render"
npx remotion render src/index.ts Pitch output/finmango-cgap-pitch.mp4 --codec h264 --crf 19

echo "==> finalize audio + report"
node src/finalize-audio.mjs

echo "Done: output/finmango-cgap-pitch.mp4 (+ output/timing-report.md)"
