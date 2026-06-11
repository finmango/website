# Editorial Design System — Migration Guide

How to migrate a legacy page to the editorial system. The canonical
reference implementation is `index.html`; the most compact migrated
exemplar is `donate.html`. A running log of past migrations with
per-page decisions lives in `MIGRATION-NOTES.md`.

## The system in one paragraph

One paper, one ink, one orange. `--paper: #FAFAF7` background,
`--ink: #0A0A0A` text, `--orange: #FF6B35` accent (`--orange-deep: #E5511B`
hover). DM Sans (300–900) is the voice; JetBrains Mono 400/500 is the
apparatus (labels, stats, meta lines, eyebrows). Hairlines, not boxes:
1px rules in `var(--ink-line)` separate content. Orange is never a
background — each page gets at most one ink (dark) section as its
"ink moment", plus the CTA→footer coda. At most one hand-drawn accent
per page (the hero underline stroke).

## Banned (remove on sight)

- Offset box-shadows, any box-shadow on cards/buttons
- Borders thicker than 1px; border-radius pills and rounded cards
  (perfect circles for avatars are the one allowed radius)
- Orange or gradient section backgrounds
- Uppercase buttons, dot-grid hero textures, squiggle dividers,
  sketchy-circle SVG button decorations
- Reveal-on-scroll IntersectionObservers and animated stat counters
  (stats are static text)
- `css/navbar.css` + `js/navbar.js` links, announcement-bar markup/JS
- Legacy palettes (`--warm-white`, navy inks, colored tag chips)

## Preserve verbatim (never lose these)

- `<title>`, every `<meta>` (description, keywords, OG, Twitter, COPPA
  block where present), `rel="canonical"`, robots, JSON-LD blocks
- Google Analytics tag `G-DW5HBYS9JW`
- All visible copy word-for-word, all hrefs, all anchor `id`s
  (`scroll-margin-top` handles the fixed nav), form `action`s and field
  names, Cloudflare email-protection links (`/cdn-cgi/l/email-protection#…`)
- ALL functional JavaScript: calculators, games, charts, maps, quizzes.
  Keep every element ID/class/data-attribute the JS touches. If page JS
  writes legacy custom properties inline (e.g. `var(--black)`), keep a
  legacy alias in `:root` (e.g. `--black: #0A0A0A`) so those writes still
  resolve.
- External script includes (Chart.js, Twitter widgets, …) and
  `data/` / `scripts/` includes in their original positions
- Images and their alt text

## Recipe

1. Read the legacy page fully. Inventory: meta/head, copy sections,
   interactive hooks (every ID/class referenced from JS), scripts.
2. Start the new page from the exemplar pattern:
   - Head: keep the page's own meta/title/canonical/JSON-LD/GA verbatim;
     use index.html's font preload pattern (DM Sans + JetBrains Mono).
   - Copy the editorial foundation CSS from `donate.html`'s `<style>`
     (tokens through footer/mobile-menu/responsive rules), drop donate's
     page-specific sections, add your page's sections restyled to the
     system.
3. Chrome: paste `templates/nav.html` between
   `<!-- chrome:nav -->` … `<!-- /chrome:nav -->`, `templates/footer.html`
   between `<!-- chrome:footer -->` … `<!-- /chrome:footer -->`, and
   `templates/chrome-script.html` between `<!-- chrome:script -->` …
   `<!-- /chrome:script -->`. No `active=` param unless the page IS one of
   the five top-level nav targets. Keep the Cloudflare
   `email-decode.min.js` script line before the chrome script. Page JS
   stays in its own separate `<script>` tags after the chrome script.
4. Restyle page content with system primitives: `.eyebrow` mono labels
   with orange dash, ruled lists, hairline lattice grids
   (1px-gap background trick), mono meta lines, `.btn-primary` /
   `.btn-secondary`. Stats become static ruled blocks with orange `<em>`
   units. Pick the page's single ink moment deliberately.
5. For tools/calculators: the tool UI (inputs, sliders, results, charts)
   is restyled to hairline aesthetic but its DOM structure and JS remain
   functionally identical. When in doubt, keep the structure and only
   change colors/borders/fonts via CSS.

## Verify before you're done

```bash
python3 tools/stamp_chrome.py --check   # chrome in sync
python3 tools/check_pages.py            # links + invariants
```

Plus per page: GA tag present, canonical present, no `navbar.css`
reference left, no `box-shadow` left, fonts pattern present, and for
tool pages a diff confirming the functional `<script>` bodies are
unchanged.

## Report

Add an entry to `MIGRATION-NOTES.md` (Removed / Preserved / Flags) so
review stays possible page-by-page.
