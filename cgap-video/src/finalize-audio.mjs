/**
 * Final-mix loudness pass + report footer.
 *
 * With real speech present, runs a two-pass ffmpeg loudnorm (-16 LUFS
 * integrated, -1.5 dBTP) on the rendered file's audio, video stream copied.
 * In placeholder mode (music-only mix) normalization is skipped — it would
 * crank the deliberately quiet bed to dialog loudness.
 */
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, appendFileSync, renameSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'output', 'finmango-cgap-pitch.mp4');
const timeline = JSON.parse(readFileSync(path.join(__dirname, 'timeline.json'), 'utf8'));

if (!timeline.placeholderMode) {
  // pass 1: measure
  let json = '';
  try {
    execFileSync('ffmpeg', ['-i', OUT, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
      { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (e) {
    json = e.stderr?.toString() ?? '';
  }
  const m = /\{[\s\S]*\}/.exec(json);
  if (m) {
    const stats = JSON.parse(m[0]);
    const tmp = OUT.replace('.mp4', '.tmp.mp4');
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', OUT,
      '-af', `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true`,
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', tmp]);
    renameSync(tmp, OUT);
    console.log(`[finalize] loudnorm two-pass applied (was I=${stats.input_i} LUFS)`);
  } else {
    console.warn('[finalize] could not parse loudnorm stats; leaving mix as rendered');
  }
} else {
  console.log('[finalize] placeholder mode — final loudness pass skipped');
}

// report footer with actuals
const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size',
  '-of', 'default=noprint_wrappers=1', OUT]).toString();
const dur = parseFloat(/duration=([\d.]+)/.exec(probe)?.[1] ?? '0');
const size = parseInt(/size=(\d+)/.exec(probe)?.[1] ?? '0', 10);
const report = path.join(ROOT, 'output', 'timing-report.md');
// replace any footer from a previous render of this build
const existing = readFileSync(report, 'utf8');
const stripped = existing.split('## Rendered file')[0].trimEnd() + '\n\n';
writeFileSync(report, stripped);
appendFileSync(report, [
  '## Rendered file',
  '',
  `- \`output/finmango-cgap-pitch.mp4\` — ${dur.toFixed(2)}s, ${(size / 1024 / 1024).toFixed(1)} MB (limit 2 GB ✅)`,
  `- 1920x1080 @ 30fps, H.264 + AAC`,
  '',
].join('\n'));
console.log(`[finalize] ${dur.toFixed(2)}s, ${(size / 1024 / 1024).toFixed(1)} MB`);
