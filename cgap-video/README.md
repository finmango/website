# FinMango CGAP pitch video

Build pipeline for the 90-second CGAP Financial Literacy Solutions Sprint
pitch (1920x1080 @ 30fps). Hybrid structure: two on-camera segments bookend
two voiceover-driven b-roll segments (calculator screen recordings + photo
montage with stat overlays).

## One-command build

```bash
./build.sh        # -> output/finmango-cgap-pitch.mp4 + output/timing-report.md
```

The build is fully asset-driven. Drop the real footage into `assets/` and
re-run — every duration, caption, and stat cue re-times itself:

```
assets/camera-open.mp4    Scott on camera, segment 1 (~15s)
assets/camera-close.mp4   Scott on camera, segment 4 (~30s)
assets/vo-segment2.m4a    VO for the calculator segment (~23s)
assets/vo-segment3.m4a    VO for the montage segment (~20s)
assets/photos/            montage photos (already populated from the repo)
```

Until those exist the build renders **placeholder mode**: planned slot
durations (15/23/20/30s), labelled paper-background slates for the camera
segments, silence where speech will be, and proportionally-timed captions
from the reference script. The timing report says exactly what's missing.

Useful flags:

```bash
FORCE_RECORD=1 ./build.sh      # re-capture the calculator screen recordings
FORCE_TRANSCRIBE=1 ./build.sh  # re-run the whisper caption pass
```

## How it works

| Stage | Script | Notes |
|---|---|---|
| Screen recordings | `src/record-calculators.mjs` | Serves the repo (the live finmango.org pages) locally, drives the housing + IRA calculators with Playwright, captures deterministic per-frame screenshots at 2560x1440 and stitches them to 30fps — real-time screencast was too choppy in this container. Also grabs the Barometer dashboard still. |
| Caption timing | `src/transcribe-captions.py` | Whisper (word timestamps) aligned against `src/reference-script.json` — the script text is the source of truth, so FinMango/CGAP never mis-transcribe. Produces `src/captions-timed.json` + segment-3 stat cues. Needs `pip install openai-whisper --break-system-packages`. |
| Music bed | `src/generate-music.mjs` | Code-generated minimal pulse/pad at 96bpm, slight lift at the segment-3 boundary, peaks at -18dBFS, ducked a further -18dB in the mix. Felt, not heard. |
| Timeline | `src/prepare-timeline.mjs` | Probes asset durations (ffprobe), conforms camera footage to 1080p30 (scale+pad, loudnorm -16 LUFS/-1.5dBTP), back-aligns the IRA clip inside segment 2, computes montage/stat/caption timings, stages media into `public/`, writes `src/timeline.json` + the timing report. |
| Composition | `src/Pitch.tsx` (Remotion) | All graphics as code: lower-third name card (in 0:03, out 0:08), recording labels, Ken Burns montage, count-up stat cards, burned-in captions (raised while the name card shows), audio crossfades (0.3s) and music automation (fully out before segment 4). |
| Finalize | `src/finalize-audio.mjs` | Two-pass loudnorm on the final mix (skipped in placeholder mode), appends actuals to the timing report. |

## Design system

Matches finmango.org: paper `#FAF7F2`, ink `#1A1A1A`, accent orange
`#FF6B35` (stat numbers, hairline accents, lower-third bars only — never
backgrounds), DM Sans for headline/stat type, JetBrains Mono for
labels/metadata, 1px hairline rules, no shadows/gradients. See
`src/design.ts`.

## Voice rule

If a voice take runs long or short, **the b-roll stretches/shrinks to
match the audio** — voice is never trimmed or sped up. If the total then
exceeds 90s, the timing report flags it with a recommended cut; the build
never silently ships >90s.
