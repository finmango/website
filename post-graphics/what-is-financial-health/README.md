# Social deck — "What is Financial Health all about?"

Ambassador Note by Onyemeri Jesus Ihegazie.
Source post: `/post?id=what-is-financial-health-all-about-260804-140424`

## What's here

| File | For |
| --- | --- |
| `carousel.html` | The deck. Eight 1080x1350 slides on `../deck.css`, plus a browser preview and per-slide PNG export. |
| `slide-01.png` … `slide-08.png` | The Instagram carousel, 1440x1800 each. Upload in order. |
| `finmango-what-is-financial-health-linkedin.pdf` | The same eight slides as a LinkedIn document post, 8 pages at 4:5. |
| `captions.md` | Instagram caption, LinkedIn caption, per-slide alt text, posting notes. |
| `author.jpg` | Onyemeri's headshot cropped square for the slide 8 avatar. `37.jpg` is a wider shot, so the face lands small once it's scaled into a 188px circle. |

## Why the post's own cover art isn't slide 1

This note's cover is a landscape illustration that already carries its own
headline, its own "FinMango Ambassador" lockup, and a cream/navy/amber palette
from outside the editorial system. Full-bleeding it into a 4:5 slide would put
two headlines and two logos on one canvas.

So the cover uses the author's portrait (`../../37.jpg`) instead, headline set
underneath it on paper via the `.slide--split` component. That also happens to
be what the note itself closes on: behind every statistic is a real person.

If you'd rather lead with the cover art, the honest way to do it is the
`scripts/og-post-template.html` treatment — the artwork whole and uncropped on
a paper ground with one slim brand strip, no type of ours over it.

## Regenerating

```
npm install --no-save puppeteer-core        # if node_modules is cold
node scripts/render-post-social.js what-is-financial-health
```

That rewrites all eight PNGs and the PDF from `carousel.html`, so edit the
deck and re-run rather than retouching the exports. Fonts come from
`scripts/fonts/`, so the render needs no network.

## Starting a deck for a different post

Copy this folder to `post-graphics/<slug>/`, keep the `../deck.css` and
`../deck.js` links, rewrite the eight slides, and run the script with the new
slug. `deck.css` holds the reusable pieces: two cover treatments
(`.slide--cover` full bleed, `.slide--split` portrait over type), `.slide--ink`
for a dark canvas, and `.list`, `.stack`, `.compare`, `.quote`, `.question-old`
/ `.question-new` for the middle slides. The copy is not reusable.
