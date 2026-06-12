/**
 * Generates the music bed: a minimal, warm pulse + pad, deliberately subtle
 * ("felt not heard"). Written as raw PCM -> recordings/audio/music.wav.
 *
 * Structure: gentle two-chord pad (Fmaj7 -> Am-ish) with a soft sine pulse
 * on eighth notes at 96bpm. Energy lifts slightly in the second half
 * (segment 3) by adding a quiet upper voice. Peaks stay around -18 dBFS;
 * the mix ducks it further under voiceover.
 *
 * Usage: node src/generate-music.mjs <durationSec> <liftAtSec>
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SR = 44100;
const durationSec = parseFloat(process.argv[2] || '50');
const liftAtSec = parseFloat(process.argv[3] || String(durationSec * 0.5));
const N = Math.round(SR * durationSec);

const L = new Float64Array(N);
const R = new Float64Array(N);

const TWO_PI = Math.PI * 2;

/* ---------- helpers ---------- */
const noteHz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// soft sine voice with slight detune + tremolo, per-sample accumulate
function pad({ midi, start, end, gain, detune = 0.15, lfoHz = 0.07, pan = 0 }) {
  const f = noteHz(midi);
  const a = SR * 1.8; // slow attack
  const r = SR * 2.5; // slow release
  const s0 = Math.round(start * SR), s1 = Math.min(Math.round(end * SR), N);
  let ph1 = Math.random() * TWO_PI, ph2 = Math.random() * TWO_PI;
  const w1 = TWO_PI * f / SR, w2 = TWO_PI * (f + detune) / SR;
  const lfoW = TWO_PI * lfoHz / SR;
  let lfoPh = Math.random() * TWO_PI;
  const gl = gain * (pan <= 0 ? 1 : 1 - pan);
  const gr = gain * (pan >= 0 ? 1 : 1 + pan);
  for (let i = s0; i < s1; i++) {
    const t = i - s0;
    const envA = Math.min(t / a, 1);
    const envR = Math.min((s1 - i) / r, 1);
    const lfo = 0.85 + 0.15 * Math.sin(lfoPh);
    // two detuned sines + a faint octave for warmth
    const v = (Math.sin(ph1) * 0.6 + Math.sin(ph2) * 0.6 + Math.sin(ph1 * 2) * 0.08) * envA * envR * lfo;
    L[i] += v * gl;
    R[i] += v * gr;
    ph1 += w1; ph2 += w2; lfoPh += lfoW;
  }
}

// soft plucked sine: fast attack, exponential decay, lowpass-ish via sine purity
function pluck({ midi, at, gain, decay = 0.5, pan = 0 }) {
  const f = noteHz(midi);
  const s0 = Math.round(at * SR);
  const len = Math.min(Math.round(decay * 3 * SR), N - s0);
  if (len <= 0) return;
  const w = TWO_PI * f / SR;
  const gl = gain * (pan <= 0 ? 1 : 1 - pan);
  const gr = gain * (pan >= 0 ? 1 : 1 + pan);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(t / 0.008, 1) * Math.exp(-t / decay);
    const v = (Math.sin(w * i) + Math.sin(w * i * 2) * 0.12) * env;
    const idx = s0 + i;
    L[idx] += v * gl;
    R[idx] += v * gr;
  }
}

/* ---------- arrangement ---------- */
const BPM = 96;
const beat = 60 / BPM;
const bar = beat * 4;

// Two alternating chords, one per two bars: Fmaj7 and Am7 (no 5ths, airy)
// F3 A3 E4  /  A3 C4 G4
const chords = [
  [53, 57, 64],
  [57, 60, 67],
];
for (let t = 0, ci = 0; t < durationSec; t += bar * 2, ci++) {
  const ch = chords[ci % 2];
  const end = Math.min(t + bar * 2 + 1.5, durationSec);
  pad({ midi: ch[0], start: t, end, gain: 0.045, pan: -0.2 });
  pad({ midi: ch[1], start: t, end, gain: 0.038, pan: 0.15 });
  pad({ midi: ch[2], start: t, end, gain: 0.026, pan: 0.3, lfoHz: 0.05 });
  // octave shimmer voice, only after the lift point (segment 3 energy)
  if (t + bar >= liftAtSec) {
    pad({ midi: ch[2] + 12, start: Math.max(t, liftAtSec), end, gain: 0.014, pan: -0.3, lfoHz: 0.09 });
  }
}

// Pulse: eighth notes alternating F2 / C3, very quiet, slightly stronger after lift
for (let t = beat; t < durationSec - 0.5; t += beat / 2) {
  const idx = Math.round(t / (beat / 2));
  const midi = idx % 4 === 0 ? 41 : idx % 4 === 2 ? 48 : 45;
  const lifted = t >= liftAtSec;
  const accent = idx % 2 === 0 ? 1 : 0.55;
  pluck({ midi, at: t, gain: (lifted ? 0.075 : 0.058) * accent, decay: lifted ? 0.42 : 0.36, pan: idx % 2 ? 0.18 : -0.18 });
}
// after the lift, add a sparse high answer note on bar starts
for (let t = Math.ceil(liftAtSec / bar) * bar; t < durationSec - 1; t += bar) {
  pluck({ midi: 72, at: t + beat * 1.5, gain: 0.035, decay: 0.6, pan: 0.25 });
  pluck({ midi: 76, at: t + beat * 3, gain: 0.026, decay: 0.6, pan: -0.25 });
}

/* ---------- master: gentle fade edges + soft clip + normalize to -18 dBFS peak ---------- */
const fadeIn = 0.8 * SR, fadeOut = 1.2 * SR;
for (let i = 0; i < N; i++) {
  let g = 1;
  if (i < fadeIn) g = i / fadeIn;
  if (N - i < fadeOut) g = Math.min(g, (N - i) / fadeOut);
  L[i] *= g; R[i] *= g;
}
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const target = Math.pow(10, -18 / 20);
const norm = peak > 0 ? target / peak : 1;

const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), i * 4);
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), i * 4 + 2);
}

/* ---------- WAV container ---------- */
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);   // PCM
header.writeUInt16LE(2, 22);   // stereo
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(pcm.length, 40);

const outDir = path.join(ROOT, 'recordings', 'audio');
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'music.wav');
writeFileSync(out, Buffer.concat([header, pcm]));
console.log(`[music] ${durationSec.toFixed(1)}s bed (lift at ${liftAtSec.toFixed(1)}s) -> ${out}`);
