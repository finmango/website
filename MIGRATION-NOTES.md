# Editorial Design System — Migration Notes

Running log of the migration of FinMango's main pages to the editorial system
defined by `index.html` (paper/ink/orange, DM Sans + JetBrains Mono, hairlines
not boxes). One entry per page: what was removed, what was preserved, open
questions.

---

## about.html — DONE (awaiting review)

### Removed (old system)
- `css/navbar.css` link and `js/navbar.js` — replaced with index.html's exact inline
  nav/footer markup, CSS, and script (same `nav` / `mobileMenuBtn` / `mobileMenu` IDs and
  behavior, plus the keyboard-accessible dropdown with synced `aria-expanded`, which the
  old shared navbar lacked).
- Orange→peach **gradient mission background** (orange-as-background is banned). Mission is
  now the page's single ink moment.
- All neo-brutalist artifacts: offset `box-shadow`s (`8px 8px 0 black` dropdown, card hover
  shadows, text-shadow on stats), 2–4px black borders, border-radius pills/cards, uppercase
  buttons, dot-grid hero texture, hero `border-left: 5px solid orange`.
- Sketchy-circle SVG around the secondary hero button and the squiggle section divider
  (hand-drawn ration). Page now carries **one** hand-drawn accent: the hero stroke under
  "a right".
- Team float animation, 3px orange photo rings, photo drop-shadows → hairline lattice
  (1px rules), circular photos kept (circles are the allowed radius), 1px hairline ring.
- Contributor pill chips → ruled name columns (`column-rule: 1px`), names verbatim.
- Reveal-on-scroll IntersectionObserver + animated stat counters (decorative old-system JS;
  stats are now static numbers in the index pattern). **Flagging since it is a JS-behavior
  change** — say the word if you want the count-up back.
- Old `--warm-white` / `--gray` palette, scrollbar styling, `--space-*`/`--text-*` token sets.

### Preserved
- `<title>`, every `<meta>` (description, keywords, COPPA block, OG, Twitter, robots),
  canonical URL, Schema.org `AboutPage` JSON-LD (12 members + 65 contributors) — verbatim.
- Google Analytics tag (`G-DW5HBYS9JW`) verbatim.
- All hrefs: `history.html`, `approach.html`, 7 team bio pages, 5 no-link members,
  `get-involved.html`, Notion roadmap, both Cloudflare email-protection links, all
  nav/footer/social links. Anchors `#team` and `#what-we-do` kept (hero buttons still work,
  `scroll-margin-top` handles the fixed nav).
- All copy: mission statement, three what-we-do blurbs, five values (and their stroke-drawn
  SVG icons — strokes recolored `#1a1a1a` → `#0A0A0A` to kill token drift), team intro,
  contributors subtitle, all 65 contributor names, stats 10M+ / 5 / 100K+.
- All images: `about_pic.jpg`, `research11.jpg`, `education.jpg`, `ambassadors.jpg`,
  `mission.png`, 12 team photos — now hairline-framed instead of bordered/shadowed.

### Added
- Cloudflare `email-decode.min.js` script (index.html parity; the page previously relied on
  Cloudflare auto-injection for its email-protection links).
- JetBrains Mono + DM Sans 300 to the font load (required by the system; DM Sans-only before).
- `aria-current="page"` on the About nav links + small CSS marker (the "active state" hook
  index.html itself doesn't need).

### Content questions / flags
- CTA subtitle **"Financial health shouldn't be a privilege. Help us make it a right."** is
  new connective copy (recombines the page's own hero headline) added to balance the index
  CTA layout. Happy to drop it.
- "Or read our roadmap →" text link retoned to a secondary button "Read our roadmap".
- Vague alt texts kept as-is (would love better descriptions): `about_pic.jpg` = "Data and
  research", `mission.png` = "FinMango contributors", what-we-do photos = "Research & Data",
  "Financial Education", "Youth Empowerment".
- Hero CTA "Meet the team" was previously `btn-primary` → kept as the page's only orange
  fill above the fold.

### Verified (headless Chromium)
- Screenshots at 320 / 375 / 768 / 1024 / 1440: **zero horizontal overflow at every width**
  (`scrollWidth == innerWidth` checked programmatically), no JS console errors.
- Nav fits on one line at 1024; active underline renders orange at full width.
- Tablet tier (600–968px) active: hero display type scales up on iPad widths.
- <560px: hero + CTA button rows stack full-width; stat grid is single-column.
- No single-word orphans in display headlines (`a&nbsp;privilege.`, `that&nbsp;way.`,
  `the&nbsp;movement?`).
- Ink sections: mission + CTA→footer coda only. All 12 team photos confirmed loading.

---

## research.html — pending
## education.html — pending
## ambassadors.html — pending
## barrier-breakers.html — pending
## navtech.html — pending
## ai-economic-signal.html — pending
## barometer.html — pending
## resources.html — pending
## get-involved.html — pending
## donate.html — pending
