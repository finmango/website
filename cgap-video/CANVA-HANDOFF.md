# Canva / external-editor handoff

Everything you need to finish the CGAP pitch in Canva (or CapCut/Premiere/
DaVinci). The Remotion build in this folder can still produce the final
file automatically, but if you'd rather assemble by hand, use these parts.

## The parts

| File | What it is | Use |
|---|---|---|
| `output/finmango-cgap-pitch.mp4` | Full 88s rough cut, captions burned in | Reference for timing/design; segments 1+4 are placeholder slates |
| `output/canva-segment2-calculators.mp4` | Segment 2 picture, 23.0s, **no captions, no audio** | Drop in at 0:15, lay your VO under it |
| `output/canva-segment3-montage.mp4` | Segment 3 picture, 20.0s, **no captions, no audio** | Drop in at 0:38, lay your VO under it |
| `recordings/housing.mp4` | Raw housing-calculator screen recording, 13.5s @ 2560×1440 | If you want to do your own crops/zooms |
| `recordings/ira.mp4` | Raw IRA-battle screen recording, 10.5s @ 2560×1440 | Same |
| `recordings/barometer.png` | Barometer dashboard still @ 2560×1440 | Same |
| `output/music-bed.mp3` / `recordings/audio/music.wav` | Generated 44s music bed (lifts slightly at the 23s mark) | Under segments 2–3 only |

## Assembly plan (the timeline the rough cut uses)

| Segment | Time | Content | Audio |
|---|---|---|---|
| 1 | 0:00–0:15 | Your camera-open take, full frame | Camera audio |
| 2 | 0:15–0:38 | `canva-segment2-calculators.mp4` | vo-segment2 + music bed |
| 3 | 0:38–0:58 | `canva-segment3-montage.mp4` | vo-segment3 + music bed |
| 4 | 0:58–1:28 | Your camera-close take, full frame | Camera audio — **no music** |

Rules that kept the rough cut honest:
- If a voice take runs long, stretch the b-roll segment to match — never
  trim or speed up voice. Keep total ≤ 90s.
- 0.3s audio crossfades at segment boundaries.
- Music: fade in under segment 2, keep it ~18dB below the voice, fade out
  completely before segment 4 starts. The close is clean voice only.
- Aim the final mix at −16 LUFS integrated, −1.5dB peak.
- First frame of the video should be Scott's face — no logo, no black.

## Matching the design in Canva

- Headline / stat numbers: **DM Sans Bold** (Canva has it)
- Labels / name card: **JetBrains Mono**, uppercase, generous letter-spacing
- Colors: paper `#FAF7F2` · ink `#1A1A1A` · orange `#FF6B35`
  (orange for stat numbers and thin accent bars only — never as a fill)
- Captions: DM Sans Medium, white on 80% black bar, bottom-center, max 2
  lines. Caption text is in `src/reference-script.json` — copy from there,
  it's the cleaned script (FinMango/CGAP spelled right).
- Name card (0:03–0:08 in segment 1): "SCOTT GLASGOW / FOUNDER, FINMANGO"
  in JetBrains Mono on a paper chip with a 4px orange bar on the left.
  `graphics/ref-name-card.png` shows the exact look.
- Stat cards already baked into segment 3 at: 100,000+ students (~0:40),
  13 countries (~0:42), WHO·World Bank·IMF with the FinMango × Google
  Health partnership lockup (~0:44), Barometer (~0:53). The cropped
  lockup lives at `assets/photos/google-health-lockup.png` if you need
  it as a separate element in Canva.

## If you change your mind

Drop `camera-open.mp4`, `camera-close.mp4`, `vo-segment2.m4a`,
`vo-segment3.m4a` into `cgap-video/assets/` and run `./build.sh` — the
pipeline re-times everything to your audio (whisper-aligned captions
included) and ships the finished file itself.
