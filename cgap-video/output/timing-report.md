# FinMango CGAP pitch — timing report

Generated: 2026-06-12T19:58:40.363Z

## ⚠️ Placeholder mode

The following assets were **not found** in `cgap-video/assets/`, so their segments use the planned slot durations with labelled placeholder visuals/silence:

- ❌ `assets/camera-open.mp4` — missing
- ❌ `assets/camera-close.mp4` — missing
- ❌ `assets/vo-segment2.m4a` — missing
- ❌ `assets/vo-segment3.m4a` — missing

Drop the files in and re-run `./build.sh` — all timing snaps to the real audio automatically. Caption + stat timings are proportional estimates until then (whisper pass runs once real audio exists).

## Segment timing

| Segment | Start | End | Duration | Source |
|---|---|---|---|---|
| 1 — Camera open | 0:00.0 | 0:15.0 | 15.00s | planned slot (placeholder) |
| 2 — Calculators | 0:15.0 | 0:38.0 | 23.00s | planned slot (placeholder) |
| 3 — Montage | 0:38.0 | 0:58.0 | 20.00s | planned slot (placeholder) |
| 4 — Camera close | 0:58.0 | 1:28.0 | 30.00s | planned slot (placeholder) |

**Total runtime: 1:28.0 (88.00s)** — within the 90s budget ✅

## Inside segment 2

- Housing calculator: 12.50s slot (recording is 13.47s, tail trimmed by 0.97s)
- Battle of the IRAs: 10.50s slot (recording is 10.50s, back-aligned)

Caption timing source: proportional (reference script).

## Audio

- Music bed: generated 44.0s — fades in under segment 2, lifts slightly at segment 3, fade-out completes 0.1s before segment 4 begins. The close is clean voice only.
- Speech normalization: pending (no speech assets yet).
- Final-mix loudness normalization is skipped in placeholder mode (music-only mix would be cranked to -16 LUFS and defeat the “felt not heard” bed).

## Rendered file

- `output/finmango-cgap-pitch.mp4` — 88.04s, 49.2 MB (limit 2 GB ✅)
- 1920x1080 @ 30fps, H.264 + AAC
