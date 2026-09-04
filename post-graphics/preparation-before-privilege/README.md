# Social deck — "Preparation before Privilege"

Ambassador Note by David Johnson.
Source post: `/post?id=preparation-before-privilege-the-guidance-college--260803-223115`

## What's here

| File | For |
| --- | --- |
| `carousel.html` | The deck. Eight 1080x1350 slides on `../deck.css`, plus a browser preview and per-slide PNG export. |
| `slide-01.png` … `slide-08.png` | The Instagram carousel, 1440x1800 each. Upload in order. |
| `finmango-preparation-before-privilege-linkedin.pdf` | The same eight slides as a LinkedIn document post, 8 pages at 4:5. |
| `captions.md` | Instagram caption, LinkedIn caption, per-slide alt text, posting notes. |

The cover and the slide 8 avatar both use `../../33.jpg` directly. It is
already a tight face, so it fills a 188px circle without a separate crop.

## Why the post's own cover art isn't slide 1

The Drive thumbnail for this note's cover comes back at 547x365. Full-bleeding
it into a 1080px canvas means a 2x upscale, and the sneakers-and-arrows stock
photo goes soft. David's portrait leads instead via `.slide--split`, with the
portrait area run taller (`--portrait-h: 780px`) and anchored lower
(`--portrait-pos: center 30%`) than the component default, because the photo
is a tight face rather than head-and-shoulders. Those two custom properties
are set inline on the slide and exist for exactly this: the crop belongs to
the photograph, not the component.

## Regenerating

```
npm install --no-save puppeteer-core        # if node_modules is cold
node scripts/render-post-social.js preparation-before-privilege
```

That rewrites all eight PNGs and the PDF from `carousel.html`, so edit the
deck and re-run rather than retouching the exports. Fonts come from
`scripts/fonts/`, so the render needs no network.
