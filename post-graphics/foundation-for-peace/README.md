# Social deck — "Financial Health Is a Foundation for Peace"

Ambassador Note by María Manuela Córdoba Aguirre.
Source post: `/post?id=financial-health-is-a-foundation-for-peace-260806-161133`

## What's here

| File | For |
| --- | --- |
| `carousel.html` | The deck. Eight 1080x1350 slides on `../deck.css`, plus a browser preview and per-slide PNG export. |
| `slide-01.png` … `slide-08.png` | The Instagram carousel, 1440x1800 each. Upload in order. |
| `finmango-foundation-for-peace-linkedin.pdf` | The same eight slides as a LinkedIn document post, 8 pages at 4:5. |
| `captions.md` | Captions, per-slide alt text, posting notes, **including a consent check on the cover photo.** |
| `cover.jpg` | The post's own cover art: María running a workshop. |
| `author.jpg` | Her headshot cropped square for the slide 8 avatar. |

## What's different about this deck

The four earlier decks are paper decks that go to ink for a slide or two. This
one inverts that: **ink is the ground and the single paper slide (04, "the
opportunity to start again") is the turn in the argument.** It suited a note
written from inside armed-conflict work, and it needed no new tokens — just
the opposite default.

It is also the first note whose own cover art is a real documentary photograph
wide enough to fill the canvas, so slide 1 uses `.slide--cover` full bleed, a
treatment unused since the first deck. Where that photo is cropped is now a
per-deck variable (`--cover-pos`), like `--portrait-pos` on the split cover.

**`.chain`** is the new component: a causal argument drawn as a sequence, with
a spine and a node per step, so it reads as a progression rather than a list of
equals. That is the whole difference from `.list`, and it is what her closing
argument actually is — start again, then control, then community, then peace.

## Fixes that came out of building it

Going dark-first exposed three components that only ever worked on one ground:

- `.qlabel` was `ink-faint` with no ink override, so **"The cycle is" on slide 4
  of the preparation-before-privilege deck never rendered** — invisible ink on
  ink. That slide is re-exported.
- `.question-old` had the same problem, including its strike colour.
- `.author-role` had it too, which this deck's slide 8 would have hit.
- `.attrib` had it backwards: `paper-faint`, so it worked only on ink and would
  have vanished on a paper slide.

Every component now defaults to the paper ground and carries an explicit
`.slide--ink` override. That is the invariant to keep when adding more.

## Regenerating

```
npm install --no-save puppeteer-core        # if node_modules is cold
node scripts/render-post-social.js foundation-for-peace
```

Fonts come from `scripts/fonts/`, so the render needs no network.
