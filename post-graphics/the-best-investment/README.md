# Social deck — "The Best Investment I Made Had No Paycheck"

Ambassador Note by Varsha Tulsani.
Source post: `/post?id=the-best-investment-i-made-had-no-paycheck-260724-104642`

## What's here

| File | For |
| --- | --- |
| `carousel.html` | The deck. Eight 1080x1350 slides, plus a browser preview and per-slide PNG export. |
| `slide-01.png` … `slide-08.png` | The Instagram carousel, 1440x1800 each. Upload in order. |
| `finmango-the-best-investment-linkedin.pdf` | The same eight slides as a LinkedIn document post, 8 pages at 4:5. |
| `captions.md` | Instagram caption, LinkedIn caption, per-slide alt text, posting notes. |
| `cover.jpg` | The post's own cover art, pulled from the Drive thumbnail the API serves. |

One deck feeds both platforms. The only thing that differs is the last line of
slide 8: Instagram gets "link in bio" because it can't take a link, LinkedIn
gets the URL. The renderer flips that with `body.for-linkedin`.

## Regenerating

```
npm install --no-save puppeteer-core        # if node_modules is cold
node scripts/render-post-social.js the-best-investment
```

That rewrites all eight PNGs and the PDF from `carousel.html`, so edit the
deck and re-run rather than retouching the exports. Fonts come from
`scripts/fonts/`, so the render needs no network.

`carousel.html` also opens in a browser: it previews the slides at 40% and can
export one at a time via html2canvas. Handy for a quick re-cut, but the
committed files come from the script, which uses headless Chrome and gets
CSS filters right where html2canvas approximates them.

## Starting a deck for a different post

Copy this folder to `post-graphics/<slug>/`, drop in that post's `cover.jpg`,
rewrite the eight slides, and run the script with the new slug. The slide
classes (`.slide--cover`, `.slide--ink`, `.compare`, `.list`, `.quote`) are
the reusable part; the copy is not.
