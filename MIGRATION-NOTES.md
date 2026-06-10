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

## research.html — DONE

### Removed (old system)
- `css/navbar.css` + `js/navbar.js` (replaced by index.html's inline nav/footer/script, as on about.html).
- **Instrument Serif** font and all serif-italic "academic polish" ornaments (§ label numerals,
  serif figure captions, serif tweet caption) → JetBrains Mono apparatus per the system.
- **Orange section background on the CTA** (banned) → ink coda.
- Neo-brutalist remnants: 2–3px black borders, offset/hover shadows on cards, pill chips
  (leadership + recognition stamps), rotated "pinned clipping" tweet frame with tape +
  drop shadow, dot-grid hero textures, navy `--ink: #1a3a5e` secondary palette (off-system),
  colored tag chips, squiggle section dividers (×2), sketchy-circle button decoration,
  recognition star icon, Twitter-blue icon fill (now ink-faint).
- Reveal-on-scroll + animated counters (same call as about.html — stats are static).

### Preserved
- All meta/OG/Twitter/canonical/robots + GA tag verbatim. (This page has no COPPA block or
  JSON-LD — none added.)
- **Map preview works untouched**: `data/dashboard-data.js`, `scripts/map-svg.js`,
  `scripts/research-map.js` kept verbatim in the same position; all hooks preserved
  (`#barometer-preview`, `#barometer-map-container`, `#barometer-preview-map`,
  `#preview-tooltip`, `#tooltip-state`, `#tooltip-value`, `#indicator-tabs`,
  `.indicator-tab[data-indicator]`). research-map.js writes inline `var(--black)`/orange
  styles on tab clicks, so the tokens include a `--black: #0A0A0A` legacy alias and the
  tab CSS matches the JS-set states exactly (verified: tab click → orange active + map
  recolor, 51/51 states painted, tooltip intact).
- Expandable abstracts: `.paper-toggle` / `.paper-abstract-wrap` behavior and IDs
  (`abs-whitepaper`, `abs-mango`, `abs-covid`) kept; lookup now goes through
  `aria-controls` instead of `nextElementSibling` because the toggle moved into a links
  row (same behavior, verified working).
- Twitter embed (blockquote + platform.twitter.com/widgets.js) verbatim.
- All anchors: `#approach`, `#partnerships`, `#focus`, `#publications`, `#team`,
  `#methodology`, `#barometer-preview`.
- All content: premise lede, 4 stats (30+ repos linked to GitHub), recognition copy +
  stamps (now a mono meta line), figure caption, 4 approach cards, 2 collaborations with
  Active/Archived status (now mono hairline tags), 6 open questions, 5 cited-by orgs,
  3 published papers + 5 working papers with full author lists/journals/links/abstracts,
  6 leadership names + initials, 5 academic collaborators, methodology list, CTA copy.

### New treatment highlights
- Publications = ruled list with mono meta lines (year · venue · authors · status);
  "Featured"/"In Progress" rendered in orange within the meta line.
- Premise = the page's ink moment (lede + 4 ruled stats with orange `<em>` units).
- Open questions + research leadership = hairline lattice grids.
- Hero live-signals strip kept as mono apparatus on the hero's bottom edge.
- Hand-drawn ration: hero stroke + CTA squiggle (2). Card titles retoned to sentence case.

### Content questions / flags
- External Google Health logo (webflow CDN URL) kept as-is — consider self-hosting.
- "Or read our roadmap" pattern n/a here; "Read Whitepaper (GitHub)" retoned to
  "Read the whitepaper" (the GitHub destination is shown by the external arrow/source line).

### Verified (headless Chromium)
- 320/375/768/1024/1440: zero horizontal overflow, no JS errors.
- Tab switching, map coloring (51/51), tooltip layout, abstract toggles all verified.
- Tablet tier active (hero scale-up + 2×2 premise stats); <560 full-width stacked CTAs.
## education.html — DONE

### Removed (old system)
- `css/navbar.css` + `js/navbar.js` (replaced by index.html's inline nav/footer/script).
- **Aurora gradients + floating particle divs** in the hero (banned particle decoration) →
  index hero glow only.
- **Orange gradient backgrounds** on the proof feature card and the CTA section (banned) →
  hairline proof plate on paper; CTA is now the ink coda. Giant 📧 emoji watermark removed.
- Neo-brutalist remnants: 2–2.5px black borders, offset shadows (cards, gallery hover,
  proof card), rotated "taped clipping" recognition card, ★ list markers, orange meta-badge
  chips ("5 Days"/"2.5 Hours" → mono meta line), dot-grid hero texture, uppercase buttons,
  squiggle section dividers (×3), sketchy-circle button decoration.
- Button emojis (📝 📊 ✨ 📸) — labels kept, emojis dropped per the button system.
- Reveal-on-scroll + animated counters (same call as previous pages — stats static).
- Old declaration/video black sections consolidated: video keeps ink; the declaration
  pull-quote moved to paper (ink budget: video + CTA→footer coda only).

### Preserved
- All meta (incl. COPPA block), OG/Twitter, canonical, robots, GA tag verbatim.
- Every link: student reviews sheet, survey form, 3 curriculum resources (incl. the Beta
  presentation, now marked with a mono BETA tag + original title attr), 3 Drive photo-folder
  links, YouTube embed (`agm8O9-uCw4`) with full allow/title attributes,
  `mailto:hello@finmango.org`, anchor `#millionaire-mindset`.
- All copy: program description (program-title folded into the lead paragraph as a bold
  opener), all 6 outcome titles + descriptions with their stroke-drawn icons (strokes
  recolored `#1a1a1a` → `#0A0A0A`), proof copy + 3 proof points, event copy + stats,
  founder bio (duplicate inner "Bob Gillingham" heading dropped — the section h2 carries
  it; role moved under the photo as a mono line), both recognition entries, declaration
  quote + attribution, CTA copy.
- All 10 gallery images with original alts (verified 10/10 load), bob.jpg, education7.png.

### New treatment highlights
- Hero: index billboard with "LIVE IN 30+ SCHOOLS" mono status, 3 stats with orange
  `<em>` units (warm-page direction), stroke under "informed".
- Outcomes = 3×2 hairline lattice with mono numerals; "What every student walks away
  with" as a dash-prefixed mono label.
- Proof = hairline plate: big 14K+ display number | 3 ruled proof rows.
- Recognition = hairline panel with mono meta lines (2024 · NORTHEAST REGION).
- Hand-drawn ration spent (2): hero stroke + declaration squiggle.
- `text-wrap: balance` added to section heads (orphan control without unbreakable runs —
  this fixed a 1px overflow at 320 from an over-eager `&nbsp;`).

### Content questions / flags
- education7.png alt "FinMango Financial Education" is vague — better description welcome.
- Old hero h1 was Title Case "From Beginners to Financially Informed Students" → sentence
  case per the retone rule.

### Verified (headless Chromium)
- 320/375/768/1024/1440: zero horizontal overflow (after the balance fix), no JS errors.
- Tablet tier active at 768; <560 full-width stacked CTAs and single-column grids;
  gallery mosaic responsive (4 → 2 → tighter rows); all lazy images confirmed loading.
## ambassadors.html — DONE

### Approach
Owner likes this page — treated as a *translation*, not a redesign. The photo collage
hero, big cohort year marks, portrait grids with flag chips, FAQ, and apply-modal flow
all survive; only the chrome changed.

### Removed (old system)
- 3px black photo borders + orange offset shadows on the collage (rotations kept, softened
  to ≤3°; hover straightens with a hairline-to-orange border instead of a shadow).
- 2px black borders + hover shadows on ambassador cards / benefit cards / FAQ boxes /
  modal (10px black shadow → the index dropdown's soft elevation shadow), uppercase
  buttons, orange-gradient CTA (→ ink coda), squiggle dividers, warm-white alternating
  backgrounds, scrollbar styling, reveal/stagger animation JS+CSS.

### Preserved
- All meta/OG/canonical/GA verbatim; every bio link (43 ambassadors across 4 cohorts),
  all portraits + flag emojis, anchors `#cohort-2026/25/24/23` (hero button verified
  landing at the 84px scroll margin).
- **Modal flow intact**: `#applyModal`, `#modalClose`, `#rollingApplyFrame` (same src/
  title/scrolling), `.open-apply-modal` triggers (hero + CTA), overlay/Escape close,
  postMessage `rbIframeHeight` resize + same-origin fallback — verified: iframe loads
  and auto-sizes (5924px), Escape closes. Mobile full-screen sheet kept.
- FAQ accordion JS + classes (`.faq-item/.faq-question/.faq-answer/.active`) — verified
  exclusive open/close. All five Q&As verbatim, mailto kept.
- Deliverable plate: Money Mango cascade copy, 🥭 label (already JetBrains Mono in the
  old code — it predicted the system), links to money-mango-daily.html +
  submit-a-cascade.html.
- Benefit emojis (🌍🎓🛠️🤝) kept as in-content glyphs on this warmest page — say the
  word if you'd rather have stroke-drawn icons like education's.

### New treatment
- Hero: eyebrow + display headline with stroke under "fighting" (hand-drawn 1 of 2);
  collage photos hairline-framed with mono flag-name chips.
- Stats: ink band, hairline lattice, orange `<em>` units (43 / 15+ / 4 / 300+).
- Cohort headers: big year with orange apostrophe kept; subtitles retoned to mono meta
  lines ("11 AMBASSADORS · 4 COUNTRIES"; '23 = "FOUNDING COHORT · …" — all counts kept);
  hairline rule under each header; cards fluid 4:5 portraits.
- Benefits: 4 ruled columns with hover top-line; FAQ: ruled list with orange +/×.
- Modal header badge `.apply-badge` (previously unstyled) now a mono dash label.
- CTA: ink coda with squiggle (hand-drawn 2 of 2) + "Apply on a rolling basis".

### Verified (headless Chromium)
- Zero horizontal overflow at 320/375/768/1024/1440; no JS errors.
- Modal open/resize/close, FAQ exclusivity, cohort anchor scroll all pass.
- Tablet tier active; <560: stacked CTAs, single-column stats, 2-col cohort grid.
## barrier-breakers.html — pending
## navtech.html — pending
## ai-economic-signal.html — pending
## barometer.html — DONE (out of order, by request)

### The data promise
`data/dashboard-data.js`, `scripts/us-map-content.js`, and `scripts/dashboard-app.js` are
**byte-for-byte untouched** (git diff confirms barometer.html is the only change). Every
DOM hook the app reads was preserved verbatim: all 32 IDs (`val-*`, `change-*`, `spark-*`,
`us-map`, `state-tooltip`, `panel-*`, `trend-chart`, `chart-indicator`, `chart-period`,
`rankings-*`, `page-*`, `prev/next-btn`, `download-csv/json`, `copy-citation`,
`live-indicator`, `last-updated-date`, `stale-data-banner`, `embed-widget`, `methodology`),
`data-indicator` / `data-sort` attributes, JS-toggled classes (`active`, `severity-*`,
`open`, `visible`, `up`/`down`), and every class the app injects (panel indicators,
rank badges, value bars/cells, sparkline containers). Chart.js CDN tag kept verbatim.

### Treatment — full ink instrument
- Whole page runs on ink with paper site chrome (index nav) on top; mono eyebrow
  "LIVE INSTRUMENT · 50 STATES" + display title with orange em.
- Indicator cards = hairline lattice cells in the index barometer style: mono labels,
  900 values, mono deltas with **signal colors** (▲ = signal-bad, ▼ = signal-good),
  severity classes now drive a 2px color-coded left rule (was 4px), active = orange rule +
  orange tint (index exact). Sparklines work as-is (JS picks white-ish stroke on active,
  orange otherwise — both legible on ink).
- Map = hairline-framed plate; state strokes switched to the index ink-map treatment
  (`rgba(10,10,10,.55)`); mono legend. Tooltip became a paper chip with mono readout.
- **Chart plate stays paper inside the ink page** — dashboard-app.js hardcodes the line
  color `#000000`, so the canvas keeps a paper ground rather than touching the JS.
  Selects restyled as mono apparatus with `color-scheme: dark`.
- Rankings = ruled table: mono headers/values, hairline circled rank badges (circles
  allowed), JS-injected data-colored value bars kept (opacity tuned for ink), hairline
  pagination buttons.
- Tools toolbar + methodology panel + accordions (inline onclick handlers untouched) +
  data dictionary + citation block restyled to hairlines/mono. Emojis dropped from tool
  buttons (📥📋📄🔗📖), labels kept.
- State panel = ink side sheet (bottom sheet on mobile — rounded corners removed per the
  radius rule, drag pill became a hairline bar).
- Replaced the minimal dashboard footer with the standard site footer; the citation +
  MIT-license line moved into the methodology "Cite This Data" block (nothing dropped).
- Old `#blob-canvas` CSS, segmented-toggle CSS, and `.highlighted` row CSS were dead
  (no JS/markup references) and removed. Inter font → DM Sans/JetBrains Mono.

### Functionally verified (headless Chromium, real data)
- Load: national values populate (140.0 / 104.5 / 156.7 / 136.8), 4 sparklines render,
  51/51 states colored, severity classes applied, LIVE badge + "June 9, 2026" date.
- Card click → active state moves, map recolors, chart select syncs, rankings re-sort.
- Hover Texas → tooltip "TEXAS / FINANCIAL ANXIETY: 141.0"; click → panel opens with 4
  indicators, ranks, colored comparison bars; closes cleanly.
- Chart.js: 60 points (5y), period switch to 12m works; chart canvas 1150×300.
- Search ("tex" filters), pagination (page 2 = 11–20, prev re-enables), accordions
  toggle, CSV/JSON download clicks error-free. Zero JS console errors.
- Zero horizontal overflow at 320/375/768/1024/1440 — including the Chart.js-failure
  path (added `canvas { max-width: 100% }` guard; the bare 300px canvas overflowed 320px
  screens even on the old page). Note: the Chart.js CDN fails in the sandbox only due to
  its TLS-intercepting proxy (`ERR_CERT_AUTHORITY_INVALID`); verified working with certs
  ignored, and the tag is unchanged from production.

### Flags
- The `#embed-widget` "Embed" button has no handler in dashboard-app.js (pre-existing);
  preserved as-is.
- Stale-data states preserved: >26h swaps LIVE for the JS's amber STALE chip (inline
  styles from the app, left untouched); >72h shows the banner — restyled to ink +
  signal-red text (JS only toggles `display`).
## resources.html — pending
## get-involved.html — pending
## donate.html — pending
