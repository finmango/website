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
## barrier-breakers.html — DONE

### Removed (old system)
- **Caveat handwriting font** everywhere (kicker, step numbers, $20k figure, year labels,
  section labels) → mono eyebrows / display sans per the system. Aurora hero background +
  scroll-bounce hint, squiggle break, fade-in observer JS, 3px-border/shadow dropdown.
- **Medal pastel gradients** on prize rows and winner-card headers (off-palette golds/
  silvers/bronzes) → ruled rows with mono place labels; 1st place reads orange; 🥇🥈🥉
  emojis kept as content glyphs.
- **Orange caption badge** on the problem photo (orange bg + white text, banned) → mono
  caption line under a hairline-framed image. Grayscale photo filter dropped.
- Pill resource links + button emojis (📋📝📄⭐) → btn-secondary row; rounded gallery
  tiles → hairline-framed tiles; track icon boxes → bare emoji glyphs in a ruled list.
- Ink budget: was 3 dark sections (problem, gallery, final CTA) → now gallery (the
  photographic moment) + CTA→footer coda; the problem section moved to paper with a
  ruled stat lattice.

### Preserved & verified
- **Lightbox fully working** (the page's one JS feature): script kept verbatim; all hooks
  (`#lightbox`, `#lightbox-img/caption/counter`, `.gallery-item[data-caption]`,
  `.lightbox-close/prev/next`) intact. The redundant `.gallery-row` wrappers were
  flattened (CSS-columns masonry ignores them; JS queries `.gallery-item` only — DOM
  order and the 23-item count unchanged). Verified: opens at "3 / 23" with caption,
  arrow keys navigate, Escape closes.
- All 23 gallery photos + captions/alts, `#gallery-2026` anchor (hero button verified at
  the 84px margin), all prize figures + breakdowns + note, scoring rubric, 12 judges
  (titles sans, orgs mono), 2025/2024 winners + photos, partnership logos, sponsor tiers
  (💎/🥈 labels kept), all PDFs and mailto links, head meta/OG verbatim.
- Hero meta trio became hb-stats with orange `<em>` units ($20K+ / 5 / 3); hero stroke
  under "barriers." + CTA squiggle = the hand-drawn ration (2).

### Added / flags
- **Google Analytics tag added** — this page was the only one in the set without it;
  flagging in case its absence was intentional.
- Footer swapped to the standard index footer: the plain `mailto:info@finmango.org`
  links became the Cloudflare email-protection links used site-wide (decode script added).
- New secondary hero button "See the 2026 event" (anchors to the existing gallery) to
  fill the index CTA-pair pattern — easy to drop if unwanted.
- hb-status "2027 INTEREST OPEN" added as the hero's status readout (mirrors the page's
  own "Applications for 2027 open soon"). Scroll-hint affordance dropped.

### Verified (headless Chromium)
- Zero horizontal overflow at 320/375/768/1024/1440; no JS errors; tablet tier active;
  <560 stacked CTAs + single-column stats; masonry 4/3/2 columns.
## navtech.html — DONE

### Same template family as ai-economic-signal.html — same reconciliation
- **Particle canvas removed** (`#hero-canvas` + routing-network animation JS).
- **Exact tokens** replace the near-misses (same drift set: `#FAFAFA`, .6/.35/.08 opacities,
  `--bg-soft`, max 1400). `min-height:100vh` scaffold → padding rhythm. Hero em
  ("literacy") trades the text-decoration slab for the hand stroke; CTA squiggle = the
  second hand-drawn accent.
- Old `fm-*` nav/menu/footer chrome → index standard; reveal observer + entrance
  animations dropped; **stat count-up JS dropped** (stats static, per the established
  precedent) — flagging as on earlier pages.
- White-on-orange "NOW BUILDING" badge → orange-outline mono chip (kept inside the
  featured phase summary, where it lives in the markup).
- `.why-item` boxes → ruled rows; `phase-featured` 3px rule → 2px.
- Ink rhythm: stakes (ink moment) + CTA coda; work/roadmap/why stay paper.

### Preserved & verified
- All copy verbatim: hero, 3 sourced stats (Urban Institute / Harvard JCHS / End
  Homelessness links with ↗), the 4 work-list tools (disaster-desk,
  food-assistance-calculator, food-desert-analyzer, barometer) with tags + descriptions,
  "See all 25+ tools →" foot link, all 3 roadmap phases + tool lists (phase 02 featured
  and open by default — verified toggling), why items, CTA copy + both buttons.
- Anchors `#stakes #work #roadmap #why #contact`; hero → `#work` verified at the 84px
  margin. Head meta/OG/Twitter/canonical verbatim. The work-list was already a ruled
  index — kept with token swaps only.
- **GA tag added** (third page in this template family without analytics).

### Verified (headless Chromium)
- Zero horizontal overflow at 320/375/768/1024/1440; no JS errors; canvas gone; details
  toggling works; tablet tier active; <560 stacked CTAs.
## ai-economic-signal.html — DONE

### What this page actually was
Not a live dashboard — a manifesto/proposal page that was already an early draft of the
design language (paper/ink/orange, mono eyebrows with dashes, DM Sans 900 display,
hairline grids, native `<details>` accordions). The job was reconciliation, not redesign.

### Removed (banned / drifted)
- **Particle network canvas** in the hero (`#hero-canvas` + its animation JS) — explicitly
  banned; the index radial glow remains.
- **`min-height: 100vh` centered section scaffold** → standard padding rhythm.
- **Hero `text-decoration` underline slab** on the em → the hand-stroke SVG (the exact
  swap the brief describes). Hand-drawn ration: hero stroke + CTA squiggle.
- **Neo-brutalist `.arm` cards** (2px black borders + 6px/9px offset shadows) → hairline
  plates with the orange top-line hover; arm-foot/arrow 2px borders → 1px.
- **`.causation` callout** orange offset shadow → hairline plate with a 2px orange left
  rule on a .04 orange tint.
- **White-on-orange "NOW BUILDING" badge** → orange-outline mono chip with pulse (the
  hard rule reserves white-on-orange for buttons).
- **Token near-misses** → exact: `#FAFAFA→#FAFAF7`, dim .6→.62, faint .35→.38,
  line .08→.1/.12, `--bg-soft`/`--bg-dark-soft`/`--orange-glow` dropped, max 1400→1280
  (hero 1440).
- Old `fm-nav`/`fm-mobile-menu`/`fm-footer` chrome (3px-border shadow dropdown) → index
  standard (ids now `nav`/`mobileMenuBtn`/`mobileMenu`; this page's chrome JS replaced
  wholesale — no external scripts referenced the fm-* ids).
- Dead CSS removed: `.work-list/.work-item/.stat/.stakes-grid` families (no markup used
  them). Reveal observer + entrance animations dropped per precedent.
- `.why-item` boxes (bg-soft + full borders) → ruled rows with mono markers.

### Ink rhythm fixed
Was: problem (dark) → paper → paper → horizon (dark) → paper → paper CTA → dark footer.
Now: **problem = the ink moment**; horizon keeps its exact components on paper; **CTA
became the ink coda** flowing into the footer.

### Preserved
- All copy verbatim (problem cells, arms, bridge line, causation discipline statement,
  all three `<details>` papers with their lists, horizon cells, why items, CTA).
- Native `<details>` accordions untouched (verified toggling; Paper 1 stays open by
  default); phases progress track kept; `phase-featured` emphasis kept (2px orange rule).
- Anchors `#problem #building #research #horizon #why #contact` (hero → #building
  verified at the 84px margin). Head meta/OG/Twitter/canonical verbatim.
- The page's good bones: hero-top status pulse, mono `ARM 01 / MEASUREMENT` labels,
  `phase-tag` meta lines, bridge mono sentence — all kept as-is.

### Added / flags
- **Google Analytics tag added** — like barrier-breakers, this page had none.
- Fonts: trimmed to the system set (page loaded DM Sans 200/800 weights it barely used).

### Verified (headless Chromium)
- Zero horizontal overflow at 320/375/768/1024/1440; no JS errors; canvas confirmed gone;
  tablet tier active; <560 stacked CTAs.
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
## resources.html — DONE

### What this page is
A JS-rendered tool directory: a `resources` data array (25 tools, 6 featured) + a
`sketchIcons` map of 27 hand-drawn stroke SVGs, rendered into `#featuredGrid`/`#mainGrid`
with live search (`#searchInput`) and category filters (`.filter-btn[data-category]`).

### Preserved (the page's engine, verbatim)
- The full `resources` array — every title, description, link, category, featured flag.
- The full `sketchIcons` map — the stroke icons were already perfect for the system
  (currentColor line art); they now render ink and turn orange on card hover.
- All render/filter/search/toggle JS and the `createCardHTML` template untouched,
  including the `fadeUp` entrance (keyframes re-declared in the new CSS — the inline
  card styles depend on it, or cards would stay at opacity 0).
- Hooks: `#resourceCount` (kept inside the new hero status chip), `#searchInput`,
  `#featuredGrid/#mainGrid`, `#featuredHeader/#mainHeader`, `#featuredCount/#mainCount`,
  `#divider1`, `.filter-btn.active`.
- **Functionally verified**: 25 count renders, 6 featured + 19 main, retirement filter
  → 1+5, search "roth" → exactly Battle of the IRAs + Roth IRA Calculator, card click
  navigates to mango-stories.html, no JS errors.

### Removed / translated
- `css/navbar.css` + `js/navbar.js` + Caveat font → index standard chrome + fonts.
- Old card chrome (radius, shadows — 7 box-shadows on the page) → hairline-bordered
  cards with the orange top-line hover; category tags → mono hairline chips;
  "Featured" badge → orange mono label; section counts → mono.
- 🔍 emoji search icon → stroke SVG magnifier; search input + filter chips restyled as
  the directory's instrument panel under a hairline (active filter = orange fill, the
  button-state precedent from the barometer tabs).
- Hero: top-anchored billboard, stroke under "better" (the page's one hand-drawn
  accent), `#resourceCount` pulse chip as the status readout.
- Page stays all-paper (a directory has no ink moment); footer is the standard ink coda.

### Added / flags
- **GA tag added** — fourth page found without analytics.
- No OG/canonical existed on this page; not invented (left as-was, flagging in case
  you want them added).

### Verified (headless Chromium)
- Zero horizontal overflow at 320/375/768/1024/1440; tablet tier active; grid 3 → 2 →
  1 columns; filters wrap at small widths.
## david-johnson.html — DONE (prototype for all ~40 ambassador/profile pages)

### What this page is
A template-generated ambassador profile: hero (photo + name + meta tags + bio),
pull quote, two-question "In their own words" philosophy grid, "Their Plan as
Ambassador" paragraph, and an apply CTA. If approved, the same treatment rolls out
to every profile page.

### Preserved
- Every word of David's content: tagline, bio, full quote + attribution, both Q&A
  cards, the plan paragraph, CTA copy.
- Head verbatim: title, description, keywords, OG profile block (incl.
  `ambassadors/david-johnson-og.png` + dims), Twitter card, canonical
  (`/david-johnson`, no .html), robots, GA tag, favicon.
- Photo `33.jpg` (1080×1080) — now a hairline-framed 4:5 editorial portrait with a
  mono figcaption (name · cohort).

### Removed / translated
- `css/navbar.css` + `js/navbar.js` + Inter + DM Serif Display fonts → index
  standard chrome + DM Sans/JetBrains Mono.
- `.profile-badge` "2026 Ambassador" overlay chip → the hero status slot
  (`● 2026 AMBASSADOR` pulse chip, top right).
- `.profile-tag` pills (USA / Rice University / Smyrna, TN) → a ruled 3-column
  dossier facts row (Country / University / Hometown) closing the hero.
- Serif-italic pull quote → **the page's mid-page ink moment**: eyebrow
  "On financial health", large light quote with one orange `<em>` phrase
  ("having the legroom to not worry daily"), mono attribution.
- Philosophy cards (boxes) → ruled 2-column lattice with mono 01/02 indices
  and the orange hover line.
- Goal section → editorial memo: eyebrow rail ("Their plan as ambassador") +
  large light statement, hairline-topped.
- Added a mono "← All ambassadors" back link in the hero top row (navigational aid;
  the profile had no way back to the cohort).

### Link fix (flagged)
- Old CTA "Apply Now" → `ambassadors.html#apply`, but the migrated ambassadors page
  replaced the #apply anchor with the apply modal. Now points to `ambassadors.html`
  (where the apply modal lives). "Meet our ambassadors" → `#cohort-2025` still valid.

### Verified (headless Chromium)
- Zero horizontal overflow at 320/375/768/1024/1440; no JS errors; tablet tier
  (600–968) keeps the side-by-side portrait and 3-col facts; ≤560 CTA buttons stack
  full-width.

### Rollout note
The structure is fully parametric (name, em-word, tagline, bio, photo, facts ×3,
quote + em phrase + attribution, Q&A ×2, plan, OG/canonical slugs) — ready to apply
to the rest of the profiles on approval.
## Ambassador profile rollout (42 pages) — DONE

### Scope
All 42 remaining old-template ambassador profiles (cohorts 2023–2026), generated
from the approved david-johnson.html design by a one-off extractor/generator
(content parsed from each old page, re-emitted into the new template). **Not
included:** the 7 team-member pages (soham-patel, sarah-cherian, scott-glasgow,
oscar-wahltinez, bob-gillingham, anthony-schilt, ojasvinee-singh) — they share the
old `profile-hero` CSS class but have a completely different body (team bios, no
quote/philosophy/plan). They still run the old design and need their own pass.

### Preserved per page
- Entire head verbatim minus fonts/styles: title, description, keywords, OG block
  (each page's own og:image and og:url — note older cohorts use
  `/ambassadors/<slug>` canonical/og:url, left exactly as found), Twitter card,
  canonical, robots, GA (all 42 had GA).
- All content fields word-for-word: tagline (+ terminal period added), bio, quote,
  attribution, both Q&As, goal/plan text. Photos unchanged (mixed jpg/png).

### Cohort-aware template decisions
- Quote eyebrow: "On financial health" only where the attribution is
  "…on what financial health means to them" (2026 cohort); famous/mantra quotes
  (Churchill, Coco Chanel, Proverbs, etc.) get "Words they live by".
- Orange `<em>` inside the quote: first occurrence of "financial health" if
  present (10 pages), otherwise no highlight — no algorithmic phrase-picking.
- Section eyebrows carry each page's own labels, sentence-cased: 2023–25 =
  "Personal philosophy" / "Current goal"; 2026 = "In their own words" /
  "Their plan as ambassador".
- Facts row: **value-only** ruled columns (no Country/University/Hometown labels).
  Old tag pills are role descriptors on most cohorts ("Nonprofit Founder",
  "Problem Solver") — inferred labels would be wrong. david-johnson.html keeps its
  labels (manually verified for him).
- Name `<em>` + hand stroke on the last name token (handles hyphenated
  "Mike-Adeogun" and 4-word accented names like "María Manuela Córdoba Aguirre").
- Same CTA fix as David's page: #apply → ambassadors.html.

### Verified (headless Chromium)
- All 42 pages × 5 widths (320/375/768/1024/1440): zero horizontal overflow, zero
  JS errors. Visual sample inspected per cohort + edge-case names
  (maria-manuela-cordoba-aguirre, dami-mike-adeogun, sophia-moffa) at desktop and
  mobile.
## get-involved.html — DONE

### What this page is
The lighter of the two conversion pages: hero + a 4-row "opportunity ladder"
(newsletter / share / volunteer / partner) with time-commitment chips.

### Preserved
- Head verbatim (title, OG, twitter, canonical, robots, GA — no JSON-LD existed).
- All four opportunities with exact hrefs (blog, x.com, volunteer Google form,
  partnership mailto), titles and descriptions; "1 MIN / 2 MIN / 2-5 HRS/WK /
  CUSTOM" time chips (now mono labels, en-dash for 2–5); `#opportunities` anchor.
- Hero headline + the "fix itself" emphasis (old hand-underline → the system's
  single hand stroke on the orange em).

### Removed / translated
- `css/navbar.css` + `js/navbar.js` → standard chrome; Inter-era font weights →
  DM Sans (added 300) + JetBrains Mono.
- Squiggle dividers (2) and footer squiggle → hairlines.
- `.opp-card` boxes → ruled ladder rows (mono time chip | title+desc | arrow),
  orange hover line.
- Old hero subtitle split across the page, per the conversion-page brief (paper
  ground, one ink CTA moment, single orange fill above the fold): sentence 1
  ("Whether you have 2 minutes or 10 hours a week…") stays in the hero; sentence 2
  ("Every contribution — big or small…") becomes the ink-coda subtitle.
- New ink CTA coda (the old page ended at the ladder): "Ready to get involved?"
  with Donate (primary) + Become an ambassador (secondary) — both real paths from
  this page's own footer column. Flagging as the page's one piece of added copy.
- Hero status chip "4 ways to start" (derived from the ladder count).

### Verified (headless Chromium)
- Zero horizontal overflow at 320/375/768/1024/1440; ladder rows stack
  (time chip above title) on mobile; CTA buttons full-width ≤560.
## Team profile pages (7) — DONE

### Scope
scott-glasgow, soham-patel, sarah-cherian, oscar-wahltinez, bob-gillingham,
anthony-schilt, ojasvinee-singh — the old team template (hero + ink CTA; Anthony
adds a contributions grid; Scott adds journey/impact/featured-tweet/TEDx/personal).

### Template
- Hero mirrors the ambassador profile: "← Meet the team" back link (about.html#team),
  "FinMango team" status chip, role as the eyebrow, name with the orange em + hand
  stroke taken from each page's own `<span>` emphasis (handles "…Singh, JD"),
  bio, the page's own hero buttons (first = primary with arrow), hairline 4:5
  portrait with mono figcaption.
- CTA coda: shared "Let's build the future of financial health." headline (each
  page's own button preserved as primary, sentence-cased; added "Meet the team"
  secondary). No subtitle existed, so the coda is headline + actions only.
- Anthony: 5 contribution cards → ruled 2-col lattice, mono 01–05, emoji icons
  dropped.
- Scott: journey → eyebrow-rail narrative (strongs kept); "Driving Impact" 4 bare
  titles → ruled 4-col strip; featured section keeps the live Google.org tweet
  embed (widgets.js preserved) in a hairline frame; TEDx YouTube iframe → 16:9
  hairline video frame; "Beyond the Work" → paragraph + mono interest chips
  (emojis stripped).

### Scott's new photo (user request)
- `scott_new_pic.jpeg` (890×1113) now used on: his page hero portrait, his
  og:image + twitter:image (were scott.jpg), and the about.html team grid.
- The about grid's 96px circle showed the full-body shot too small → added a
  `.team-photo-frame` zoom crop (scale 2.4, origin 50% 11%) so his face matches
  the other tiles' framing; responsive sizes synced at 80px/72px tiers.

### Preserved
- Heads verbatim minus font/style swaps — including Scott's and Sarah's JSON-LD
  Person schema; GA on all 7; every link/button href (LinkedIn, mailtos,
  get-involved).

### Verified (headless Chromium)
- All 7 pages + about.html × 5 widths: zero overflow, zero JS errors. Visual
  check: scott (full), anthony (grid), soham (mobile), about team grid crop.
## donate.html — DONE (final page of the original brief)

### What this page is
The primary conversion page: hero ask, 3 impact stats, transparency note, and the
every.org embed widget that turns every.org links into a donation modal.

### Preserved
- Head verbatim (title, OG incl. site_name, twitter, canonical, robots, GA; no
  JSON-LD existed).
- **The every.org widget script pair verbatim** (`button.js?explicit=1` +
  `createWidget` binding on `a[href*="every.org/finmango"]`) — both Donate
  buttons and the mobile-menu donate keep matching hrefs (donate-page utm kept).
- Hero copy (sentence-cased; both highlight words "research"/"advocates" keep
  emphasis as orange ems, hand stroke on "research"); subtitle verbatim with the
  em-dash spacing normalized; stats (10M+/5+/100K+ with their labels);
  transparency note word-for-word (moved into the ink coda's subtitle slot).

### Removed / translated
- `css/navbar.css` + `js/navbar.js` + Inter font → standard chrome + system fonts.
- Gray stats box → ruled 3-col strip on paper (orange + signs, mono labels).
- Per the conversion brief: single orange `.btn-primary` above the fold ("Donate
  now"); the one ink moment is the closing CTA — headline composed from the
  page's own subtitle phrases ("Evidence they can't ignore. Voices they can't
  silence."), with the transparency note as its subtitle and a second Donate ask +
  "Research on GitHub" secondary (link from the note's own claim).
- Nav: Donate chrome button carries aria-current.

### Verified (headless Chromium)
- Zero horizontal overflow at 320/375/768/1024/1440; no JS errors (every.org
  widget degrades gracefully offline); buttons full-width ≤560.

## about.html — team grid crop tweaks (post-merge, user request)
- Scott's tile: `.team-photo-frame` now `object-position: 50% 0` +
  `scale(2.35)` origin `50% 9%` after two rounds of user feedback (first showed
  more headroom, then nudged back up); face framing now matches neighboring tiles.
## Remaining: none — original brief complete (index was pre-existing reference).
