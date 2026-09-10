# Social deck — "Below the Baseline"

Ambassador Note by Hilya Indongo.
Source post: `/post?id=below-the-baseline-navigating-financial-health-in--260806-180100`

## What's here

| File | For |
| --- | --- |
| `carousel.html` | The deck. Eight 1080x1350 slides on `../deck.css`, plus a browser preview and per-slide PNG export. |
| `slide-01.png` … `slide-08.png` | The Instagram carousel, 1440x1800 each. Upload in order. |
| `finmango-below-the-baseline-linkedin.pdf` | The same eight slides as a LinkedIn document post, 8 pages at 4:5. |
| `captions.md` | Captions, per-slide alt text, posting notes, **and a note on sourcing the figures — read it before posting.** |
| `author.jpg` | Hilya's headshot cropped square for the slide 8 avatar. |

This note's cover art is her headshot at 601px, so the cover slide uses
`../../12.jpg`, the 1080px copy of the same photo, through `.slide--split`.

## Numbers, not charts

This is the first note in the set that leads with figures, so it added two
components to `../deck.css`:

- **`.hero`** — one number as the whole slide. Ink rather than orange: at 250px
  the figure carries by scale alone, and orange on paper sits under the 3:1
  large-text contrast line, a bad trade for the one thing the slide exists to
  say. Proportional figures, not `tabular-nums` — tabular gives every digit the
  width of a zero, which reads loose at display sizes.
- **`.kpi`** — a stacked list of stat tiles, value plus label. Stacked rather
  than a row because three values side by side on a 4:5 canvas get 300px of
  width each.

Neither slide is a chart, deliberately. 54.1%, 75%, 90% and 4% answer four
different questions and share no denominator, so a bar chart comparing them
would invent a relationship the data doesn't have. Headline numbers get stat
tiles; a chart needs a series.

## Regenerating

```
npm install --no-save puppeteer-core        # if node_modules is cold
node scripts/render-post-social.js below-the-baseline
```

That rewrites all eight PNGs and the PDF from `carousel.html`, so edit the
deck and re-run rather than retouching the exports. Fonts come from
`scripts/fonts/`, so the render needs no network.
