/**
 * Probes the provided assets, computes the real segment timeline, prepares
 * audio (loudness-normalized copies, conformed camera footage, music bed at
 * the right length) and stages everything Remotion needs into public/.
 *
 * Missing camera/VO assets fall back to the planned slot durations and the
 * composition renders labelled placeholders — so the same one-command build
 * works before and after the real footage arrives.
 *
 * Outputs:
 *   src/timeline.json      consumed by the Remotion composition
 *   public/*               staged media
 *   output/timing-report.md
 */
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const A = (...p) => path.join(ROOT, 'assets', ...p);
const REC = (...p) => path.join(ROOT, 'recordings', ...p);
const PUB = (...p) => path.join(ROOT, 'public', ...p);

const PLANNED = { s1: 15.0, s2: 23.0, s3: 20.0, s4: 30.0 };
const FPS = 30;

mkdirSync(PUB('photos'), { recursive: true });
mkdirSync(PUB('audio'), { recursive: true });
mkdirSync(REC('audio'), { recursive: true });
mkdirSync(path.join(ROOT, 'output'), { recursive: true });

function probeDuration(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', file]).toString().trim();
  return parseFloat(out);
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
}

/** Normalize speech audio to -16 LUFS / -1.5 dBTP (single-pass loudnorm). */
function normalizeAudio(src, dst) {
  ffmpeg(['-i', src, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2', dst]);
}

/** Conform camera footage to 1920x1080@30 (scale + letterbox), keep audio. */
function conformCamera(src, dst) {
  ffmpeg(['-i', src,
    '-vf', `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=${FPS},format=yuv420p`,
    '-c:v', 'libx264', '-crf', '16', '-preset', 'medium',
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', dst]);
}

/* ------------------------------------------------------------------ */
/* 1. asset inventory                                                  */
const assets = {
  cam1: A('camera-open.mp4'),
  cam2: A('camera-close.mp4'),
  vo2: A('vo-segment2.m4a'),
  vo3: A('vo-segment3.m4a'),
};
const have = Object.fromEntries(Object.entries(assets).map(([k, f]) => [k, existsSync(f)]));

const seg = { ...PLANNED };
const prepared = {};

if (have.cam1) {
  conformCamera(assets.cam1, REC('audio', 'camera-open.mp4'));
  copyFileSync(REC('audio', 'camera-open.mp4'), PUB('camera-open.mp4'));
  seg.s1 = probeDuration(REC('audio', 'camera-open.mp4'));
  prepared.cam1 = 'camera-open.mp4';
}
if (have.cam2) {
  conformCamera(assets.cam2, REC('audio', 'camera-close.mp4'));
  copyFileSync(REC('audio', 'camera-close.mp4'), PUB('camera-close.mp4'));
  seg.s4 = probeDuration(REC('audio', 'camera-close.mp4'));
  prepared.cam2 = 'camera-close.mp4';
}
if (have.vo2) {
  normalizeAudio(assets.vo2, REC('audio', 'vo-segment2.wav'));
  copyFileSync(REC('audio', 'vo-segment2.wav'), PUB('audio', 'vo-segment2.wav'));
  seg.s2 = probeDuration(REC('audio', 'vo-segment2.wav'));
  prepared.vo2 = 'audio/vo-segment2.wav';
}
if (have.vo3) {
  normalizeAudio(assets.vo3, REC('audio', 'vo-segment3.wav'));
  copyFileSync(REC('audio', 'vo-segment3.wav'), PUB('audio', 'vo-segment3.wav'));
  seg.s3 = probeDuration(REC('audio', 'vo-segment3.wav'));
  prepared.vo3 = 'audio/vo-segment3.wav';
}

const placeholderMode = !(have.cam1 && have.cam2 && have.vo2 && have.vo3);

/* ------------------------------------------------------------------ */
/* 2. music bed: covers segments 2+3, lift at the s3 boundary          */
const musicDur = seg.s2 + seg.s3 + 1.0;
execFileSync('node', [path.join(__dirname, 'generate-music.mjs'), String(musicDur), String(seg.s2)],
  { stdio: ['ignore', 'inherit', 'inherit'] });
copyFileSync(REC('audio', 'music.wav'), PUB('audio', 'music.wav'));

/* ------------------------------------------------------------------ */
/* 3. screen recordings + montage media                                */
for (const f of ['housing.mp4', 'ira.mp4']) {
  if (!existsSync(REC(f))) throw new Error(`missing recording: ${f} — run npm run record`);
  copyFileSync(REC(f), PUB(f));
}
copyFileSync(REC('barometer.png'), PUB('barometer.png'));

const photoFiles = [
  'montage-1-crowd.jpg',
  'montage-2-ambassadors.jpg',
  'montage-3-workshop.jpg',
  'montage-4-team.jpg',
  'google-health-lockup.png',
];
for (const f of photoFiles) {
  if (existsSync(A('photos', f))) copyFileSync(A('photos', f), PUB('photos', f));
}
if (existsSync(A('photos', 'scott-placeholder.jpeg'))) {
  copyFileSync(A('photos', 'scott-placeholder.jpeg'), PUB('photos', 'scott-placeholder.jpeg'));
}

const housingDur = probeDuration(REC('housing.mp4'));
const iraDur = probeDuration(REC('ira.mp4'));

// inside segment 2: IRA clip is back-aligned and plays in full; housing
// takes the remaining head of the slot (trim its tail if needed)
const iraSlot = Math.min(iraDur, seg.s2 * 0.48);
const housingSlot = seg.s2 - iraSlot;

/* ------------------------------------------------------------------ */
/* 4. captions: proportional timing from the reference script          */
const script = JSON.parse(readFileSync(path.join(__dirname, 'reference-script.json'), 'utf8'));
function proportionalCaptions(units, segDur, lead = 0.15, tail = 0.25) {
  const words = units.map((u) => u.split(/\s+/).length);
  const total = words.reduce((a, b) => a + b, 0);
  const usable = segDur - lead - tail;
  const out = [];
  let t = lead;
  for (let i = 0; i < units.length; i++) {
    const d = (words[i] / total) * usable;
    out.push({ t0: +t.toFixed(2), t1: +(t + d).toFixed(2), text: units[i] });
    t += d;
  }
  return out;
}
const captions = {
  s1: proportionalCaptions(script.s1, seg.s1),
  s2: proportionalCaptions(script.s2, seg.s2),
  s3: proportionalCaptions(script.s3, seg.s3),
  s4: proportionalCaptions(script.s4, seg.s4),
};
// whisper-timed captions override the proportional estimates where available
// (src/captions-timed.json is produced by src/transcribe-captions.py)
let whisperCues = null;
const timedPath = path.join(__dirname, 'captions-timed.json');
let captionSource = 'proportional (reference script)';
if (existsSync(timedPath)) {
  const timed = JSON.parse(readFileSync(timedPath, 'utf8'));
  for (const k of ['s1', 's2', 's3', 's4']) {
    if (timed.captions?.[k]?.length) captions[k] = timed.captions[k];
  }
  whisperCues = timed.statCues ?? null;
  captionSource = `whisper (${timed.model}) aligned to reference script`;
}

/* ------------------------------------------------------------------ */
/* 5. montage plan within segment 3                                    */
const F = (x) => +(x * seg.s3).toFixed(2);
const clips = [
  { src: 'photos/montage-1-crowd.jpg', t0: F(0.00), t1: F(0.175), kb: { from: 1.04, to: 1.09, cx: 0.50, cy: 0.42, panX: 0.012 } },
  { src: 'photos/montage-2-ambassadors.jpg', t0: F(0.175), t1: F(0.35), kb: { from: 1.10, to: 1.04, cx: 0.50, cy: 0.50, panX: -0.012 } },
  { src: 'photos/montage-3-workshop.jpg', t0: F(0.35), t1: F(0.56), kb: { from: 1.04, to: 1.09, cx: 0.55, cy: 0.40, panX: 0.014 } },
  { src: 'photos/montage-4-team.jpg', t0: F(0.56), t1: F(0.75), kb: { from: 1.09, to: 1.045, cx: 0.50, cy: 0.45, panX: -0.012 } },
  { src: 'barometer.png', t0: F(0.75), t1: seg.s3, kb: { from: 1.02, to: 1.07, cx: 0.50, cy: 0.45, panX: 0.008 } },
];
// stat cues: whisper word times when available, else the start of the
// caption unit that speaks the phrase — captions and cards always agree
const capCue = (needle, fallbackFrac) => {
  const u = captions.s3.find((c) => c.text.toLowerCase().includes(needle));
  return u ? +(u.t0 + 0.15).toFixed(2) : F(fallbackFrac);
};
const barometerSpoken = whisperCues?.barometer ?? capCue('barometer', 0.78);
const cue = {
  students: whisperCues?.students ?? capCue('100,000', 0.105),
  countries: whisperCues?.countries ?? capCue('13 countries', 0.255),
  research: whisperCues?.research ?? capCue('research', 0.46),
  barometer: Math.max(barometerSpoken, clips[4].t0 + 0.25),
};
const montage = {
  clips,
  stats: [
    { at: cue.students, until: cue.countries - 0.25, number: 100000, suffix: '+', label: 'students reached', countUp: true },
    { at: cue.countries, until: cue.research - 0.25, number: 13, suffix: '', label: 'countries', countUp: true },
    { at: cue.research, until: Math.max(cue.research + 3.0, barometerSpoken - 0.3), text: 'WHO · World Bank · IMF', labelAbove: 'research used by', logo: 'photos/google-health-lockup.png', countUp: false },
    { at: cue.barometer, until: seg.s3 - 0.4, text: 'Financial Health Barometer', label: 'near real-time', countUp: false },
  ],
};

/* ------------------------------------------------------------------ */
/* 6. punch-in keyframes for the screen recordings                     */
const housingPunch = [
  { t: 0.0, s: 1.05, cx: 0.52, cy: 0.45 },
  { t: 1.2, s: 1.05, cx: 0.52, cy: 0.45 },
  { t: 2.2, s: 1.22, cx: 0.64, cy: 0.30 },   // income field while typing
  { t: 3.4, s: 1.22, cx: 0.64, cy: 0.30 },
  { t: 4.4, s: 1.07, cx: 0.55, cy: 0.45 },   // breathe out for step 2
  { t: 5.6, s: 1.34, cx: 0.64, cy: 0.33 },   // ZIP + auto-filled price
  { t: 7.0, s: 1.34, cx: 0.64, cy: 0.33 },
  { t: 8.0, s: 1.06, cx: 0.52, cy: 0.42 },
  { t: 8.6, s: 1.30, cx: 0.50, cy: 0.26 },   // verdict + metric strip
  { t: 10.4, s: 1.30, cx: 0.50, cy: 0.33 },
  { t: 12.4, s: 1.12, cx: 0.50, cy: 0.45 },  // settle during glide
];
const iraPunch = [
  { t: 0.0, s: 1.06, cx: 0.50, cy: 0.42 },
  { t: 1.3, s: 1.06, cx: 0.50, cy: 0.42 },
  { t: 2.6, s: 1.22, cx: 0.45, cy: 0.36 },   // slider + verdict together
  { t: 4.4, s: 1.26, cx: 0.58, cy: 0.30 },   // verdict card while it updates
  { t: 6.4, s: 1.26, cx: 0.58, cy: 0.30 },
  { t: 7.8, s: 1.32, cx: 0.60, cy: 0.27 },   // "$143K more" close
  { t: 9.2, s: 1.32, cx: 0.60, cy: 0.27 },
  { t: 10.3, s: 1.16, cx: 0.55, cy: 0.38 },
];

/* ------------------------------------------------------------------ */
/* 7. assemble timeline                                                */
const starts = {
  s1: 0,
  s2: seg.s1,
  s3: seg.s1 + seg.s2,
  s4: seg.s1 + seg.s2 + seg.s3,
};
const total = seg.s1 + seg.s2 + seg.s3 + seg.s4;

const timeline = {
  generatedAt: new Date().toISOString(),
  fps: FPS, width: 1920, height: 1080,
  placeholderMode,
  have,
  prepared,
  planned: PLANNED,
  segments: {
    s1: { start: starts.s1, dur: seg.s1 },
    s2: { start: starts.s2, dur: seg.s2 },
    s3: { start: starts.s3, dur: seg.s3 },
    s4: { start: starts.s4, dur: seg.s4 },
  },
  total,
  crossfade: 0.3,
  nameCard: { in: 3.0, out: 8.0 },
  music: {
    src: 'audio/music.wav',
    start: starts.s2 - 0.4,
    fadeIn: 1.2,
    fadeOutEnd: starts.s4 - 0.1, // fully silent before the close
    fadeOut: 1.6,
    bedDb: -18,                  // ducked level under VO
  },
  recordings: {
    housing: { src: 'housing.mp4', slot: +housingSlot.toFixed(2), clipDur: +housingDur.toFixed(2), punch: housingPunch },
    ira: { src: 'ira.mp4', slot: +iraSlot.toFixed(2), clipDur: +iraDur.toFixed(2), punch: iraPunch },
  },
  montage,
  captions,
};

writeFileSync(path.join(__dirname, 'timeline.json'), JSON.stringify(timeline, null, 2));
console.log(`[prepare] timeline: s1=${seg.s1.toFixed(2)}s s2=${seg.s2.toFixed(2)}s s3=${seg.s3.toFixed(2)}s s4=${seg.s4.toFixed(2)}s total=${total.toFixed(2)}s placeholderMode=${placeholderMode}`);

/* ------------------------------------------------------------------ */
/* 8. timing report                                                    */
const fmt = (x) => {
  const m = Math.floor(x / 60), s = x - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
};
const lines = [];
lines.push('# FinMango CGAP pitch — timing report');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
if (placeholderMode) {
  lines.push('## ⚠️ Placeholder mode');
  lines.push('');
  lines.push('The following assets were **not found** in `cgap-video/assets/`, so their segments use the planned slot durations with labelled placeholder visuals/silence:');
  lines.push('');
  for (const [k, f] of Object.entries(assets)) {
    lines.push(`- ${have[k] ? '✅' : '❌'} \`${path.relative(ROOT, f)}\`${have[k] ? '' : ' — missing'}`);
  }
  lines.push('');
  lines.push('Drop the files in and re-run `./build.sh` — all timing snaps to the real audio automatically. Caption + stat timings are proportional estimates until then (whisper pass runs once real audio exists).');
  lines.push('');
}
lines.push('## Segment timing');
lines.push('');
lines.push('| Segment | Start | End | Duration | Source |');
lines.push('|---|---|---|---|---|');
lines.push(`| 1 — Camera open | ${fmt(starts.s1)} | ${fmt(starts.s1 + seg.s1)} | ${seg.s1.toFixed(2)}s | ${have.cam1 ? 'camera-open.mp4 (actual)' : 'planned slot (placeholder)'} |`);
lines.push(`| 2 — Calculators | ${fmt(starts.s2)} | ${fmt(starts.s2 + seg.s2)} | ${seg.s2.toFixed(2)}s | ${have.vo2 ? 'vo-segment2 (actual)' : 'planned slot (placeholder)'} |`);
lines.push(`| 3 — Montage | ${fmt(starts.s3)} | ${fmt(starts.s3 + seg.s3)} | ${seg.s3.toFixed(2)}s | ${have.vo3 ? 'vo-segment3 (actual)' : 'planned slot (placeholder)'} |`);
lines.push(`| 4 — Camera close | ${fmt(starts.s4)} | ${fmt(starts.s4 + seg.s4)} | ${seg.s4.toFixed(2)}s | ${have.cam2 ? 'camera-close.mp4 (actual)' : 'planned slot (placeholder)'} |`);
lines.push('');
lines.push(`**Total runtime: ${fmt(total)} (${total.toFixed(2)}s)** — ${total <= 90.0001 ? 'within the 90s budget ✅' : '**EXCEEDS 90s** ⚠️'}`);
lines.push('');
if (total > 90.0001) {
  const over = total - 90;
  lines.push(`### ⚠️ Over budget by ${over.toFixed(2)}s — recommended cut`);
  lines.push('');
  lines.push(`Voice audio is never trimmed or sped up. Recommended places to recover ${over.toFixed(2)}s:`);
  lines.push('- Tighten the pause between segments (currently butted with 0.3s audio crossfades).');
  lines.push('- If a camera take runs long, trim dead air at its head/tail (re-export the take), not the speech.');
  lines.push('');
}
lines.push('## Inside segment 2');
lines.push('');
lines.push(`- Housing calculator: ${housingSlot.toFixed(2)}s slot (recording is ${housingDur.toFixed(2)}s${housingDur > housingSlot ? `, tail trimmed by ${(housingDur - housingSlot).toFixed(2)}s` : ''})`);
lines.push(`- Battle of the IRAs: ${iraSlot.toFixed(2)}s slot (recording is ${iraDur.toFixed(2)}s, back-aligned)`);
lines.push('');
lines.push(`Caption timing source: ${captionSource}.`);
lines.push('');
lines.push('## Audio');
lines.push('');
lines.push(`- Music bed: generated ${musicDur.toFixed(1)}s — fades in under segment 2, lifts slightly at segment 3, fade-out completes ${(starts.s4 - timeline.music.fadeOutEnd).toFixed(1)}s before segment 4 begins. The close is clean voice only.`);
lines.push(`- Speech normalization: ${have.vo2 || have.vo3 || have.cam1 || have.cam2 ? 'loudnorm I=-16, TP=-1.5 applied to provided audio' : 'pending (no speech assets yet)'}.`);
if (placeholderMode) {
  lines.push('- Final-mix loudness normalization is skipped in placeholder mode (music-only mix would be cranked to -16 LUFS and defeat the “felt not heard” bed).');
}
lines.push('');
writeFileSync(path.join(ROOT, 'output', 'timing-report.md'), lines.join('\n'));
console.log('[prepare] output/timing-report.md written');
