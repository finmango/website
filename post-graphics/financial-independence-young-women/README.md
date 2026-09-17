# Social deck — "The Financial Independence of Young Women"

Ambassador Note by Mariana Nunes Santos Gomes.
Source post: `/post?id=the-financial-independence-of-young-women-and-its--260808-142959`

## What's here

| File | For |
| --- | --- |
| `carousel.html` | The deck. Eight 1080x1350 slides on `../deck.css`, plus a browser preview and per-slide PNG export. |
| `slide-01.png` … `slide-08.png` | The Instagram carousel, 1440x1800 each. Upload in order. |
| `finmango-financial-independence-young-women-linkedin.pdf` | The same eight slides as a LinkedIn document post, 8 pages at 4:5. |
| `captions.md` | Captions, per-slide alt text, posting notes, and a note on the 20% figure. |
| `author.jpg` | Her profile photo cropped square for the slide 8 avatar. |

The cover uses her profile photo (`../../20.jpg`) rather than the post's own
cover art, by request. It is a tight face, so the portrait area runs taller
(`--portrait-h: 700px`) and anchors high (`--portrait-pos: center 6%`) to keep
her hairline in frame.

Back to the paper-dominant default after the dark foundation-for-peace deck,
with ink on two beats: the Beauvoir epigraph and the GDP figure.

## The figure

Slide 6 uses `.hero`, and the label reads "the **least** that gender equality
in the labor market could add to global GDP" rather than a flat "20% gain."
She writes "at least 20%", which is a floor. A hero figure is the easiest
place in a deck to quietly upgrade a floor into a point estimate, so the
wording is deliberate. The `.source` line names the World Bank because she
does — unlike the Namibia note, this one cites where its number came from.

## Regenerating

```
npm install --no-save puppeteer-core        # if node_modules is cold
node scripts/render-post-social.js financial-independence-young-women
```

Fonts come from `scripts/fonts/`, so the render needs no network.
