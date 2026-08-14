# FinMango Barometer — Press Target List

**Compiled:** August 2026
**Owner:** Scott Glasgow (scott@finmango.org)
**Subject:** [Financial Health Barometer](https://finmango.org/barometer.html) + [Methodology & Validation](https://finmango.org/barometer-validation.html)

> **Verification note.** Every name below was confirmed against a 2026 byline, staff page, or
> trade-press announcement at the time of writing. Reporters move constantly — re-check the
> byline on the outlet's site (or Muck Rack) the week you send. No email addresses are listed
> here; see [Finding contacts](#finding-contacts).

---

## 1. The peg (read this before you pitch anyone)

Reporters don't cover products. They cover a change in the world, and the Barometer happens to
be the answer-shaped object sitting next to a very live story: **the federal government is
measuring household economic distress less than it used to, at exactly the moment household
economic distress became the top political issue in the country.**

Documented facts you can build a pitch on:

| Fact | Source |
|---|---|
| USDA terminated the Household Food Security Report (30 years of it) after the 2024 data — called it "redundant, costly, politicized" | [USDA press release, Sept 2025](https://www.usda.gov/about-usda/news/press-releases/2025/09/20/usda-terminates-redundant-food-insecurity-survey); [FRAC](https://frac.org/news/foodsecuritysurveyterminationsept25); [CSIS](https://www.csis.org/analysis/last-us-hunger-data-what-we-lose-termination-usdas-household-food-security-united-states) |
| BLS stopped publishing monthly state-by-state job openings/hires/layoffs snapshots, moving to annual releases | [C2ER](https://www.c2er.org/2025/06/proposed-federal-budget-signals-cuts-to-core-economic-data-capacity/) |
| All 13 principal federal statistical agencies lost staff; six shed ≥⅓, two shed >⅔ | [GovExec, Aug 2026](https://www.govexec.com/workforce/2026/08/statistical-agency-staffing-cuts-federal-data-scrutiny/415399/); [ASA via Bloomberg](https://www.bloomberg.com/news/articles/2026-07-28/us-statistical-agencies-face-risks-with-lean-staff-asa-says) |
| Cost of living is the #1 economic concern — 76% of Americans, up from 58% in April 2025 | CNN/SSRS, May 2026; [Brookings on affordability and the midterms](https://www.brookings.edu/articles/why-affordability-will-be-a-key-issue-in-the-2026-midterm-elections) |
| Private/alternative data is already the accepted workaround, and reporters have covered that shift | [Semafor](https://www.semafor.com/article/10/09/2025/alternative-economic-data-fills-gap-in-government-numbers); [Washington Post](https://www.washingtonpost.com/business/2025/10/09/government-shutdown-economic-data-private-firms/); [MinnPost](https://www.minnpost.com/economy/2025/10/private-data-fills-the-gap-imperfectly-as-government-shutdown-halts-key-economic-reports/) |

Against that backdrop, what the Barometer *is* — free, MIT-licensed, all 50 states + DC, four
indicators, CSV/JSON export, a formal citation, an embeddable self-updating widget, and a
published validation page — reads as a public good rather than a press release.

### 1a. What not to claim

This matters more than the target list. A data reporter will open the validation page before
replying to you, so pitch what that page actually says:

- **Do not pitch it as "real-time early warning."** Your own validation page says the indices
  are built from official statistics and therefore *inherit the release lag* of those sources,
  and that the Food Insecurity index's correlation with the USDA survey drops to **r = 0.14**
  once you control for the poverty rate. If a pitch overclaims and the reporter finds that in
  one click, you lose the story and some credibility with the beat.
- **Do pitch these three, in this order:**
  1. **A free, honest, state-level instrument in a shrinking-data environment.** Downloadable,
     citable, embeddable, open-source, from a 501(c)(3) with no product to sell.
  2. **Restricted Google Health Trends API access.** Very few nonprofits hold it. It returns
     absolute search probabilities rather than the public tool's relative 0–100 index. That is
     a genuine, checkable differentiator.
  3. **A preregistered study that will publish a null result.** "We are testing whether search
     signals add early warning over lagged official data, and we'll publish it even if the
     answer is 'search adds nothing.'" In 2026 that is the most novel thing you have — it is a
     story about honest measurement, and it is the pitch that works on statistics and
     science-of-science reporters who would ignore a dashboard launch.

---

## 2. Tier 1 — best fit, pitch these first

### A. Federal data vacuum / the statistics beat

| Reporter | Outlet | Beat | Why them | Lead with |
|---|---|---|---|---|
| **Molly Smith** | Bloomberg News | US economy; won the American Statistical Association's Excellence in Statistical Reporting Award for sustained focus on federal statistics | The single most on-beat journalist in the country for this story | Angle 3 (preregistration + honest limits) — she will respect the validation page more than the dashboard |
| **Jory Heckman** | Government Executive (senior reporter; joined from Federal News Network, July 2026) | Federal workforce and federal data; wrote GovExec's 2026 statistical-agency staffing series | Actively filing on the measurement collapse right now | Angle 1 — who fills the gap when agencies can't, and what the tradeoffs are |
| **Augusta Saraiva** | Bloomberg News | US economy reporter (labor markets, immigration); covered BLS data-quality controversies | Data-integrity reflexes, national reach | Angle 1, framed as state-level granularity that BLS no longer publishes monthly |
| **Liz Hoffman** | Semafor (Business & Finance editor) | Wrote Semafor's "alternative data fills gap in government numbers" | Already wrote the exact frame; a nonprofit entrant is the fresh beat on it | Angle 1 + "the free, non-commercial entry in a field of paid vendors" |
| **Neil Irwin** and **Courtenay Brown** | Axios (Axios Macro) | Chief economic correspondent; economics reporter | Axios Macro is where DC economic-policy people get their morning read; format rewards one clean chart | One state-ranking chart + one sentence of method |

### B. Food insecurity — your strongest single story

The USDA killed the survey your Food Insecurity index was validated against. That is a
narrative gift: *the government stopped counting, and here is a free state-level estimate,
along with an honest account of how good it is and isn't.*

| Reporter | Outlet | Beat | Why them |
|---|---|---|---|
| **Kevin Hardy** | Stateline | Business, labor, rural issues from the Midwest; filed 2026 stories on SNAP cuts costing states billions and mayors' hunger "crisis" | Most-published SNAP reporter on a wire that republishes free to hundreds of local outlets — one story becomes fifty |
| **Lisa Held** | Civil Eats (senior staff reporter / contributing editor) | Food policy; author of the "Losing Ground" USDA investigative series | Deepest food-policy sourcing in the space; audience is exactly the researchers and advocates who need a replacement measure |
| **Rebekah Alvey** | Civil Eats (staff reporter) | Federal food policy from DC | Second door into Civil Eats |

Stateline's Creative Commons republication model makes Hardy the single highest-leverage
target on this whole list.

### C. Housing, affordability, and the midterms

| Reporter | Outlet | Beat | Why them |
|---|---|---|---|
| **Robbie Sequeira** | Stateline | Housing and social services; 2026 stories on expiring emergency housing vouchers and HUD rules | State-by-state framing is his default; your Housing Stress index maps to his beat one-to-one |
| **Bloomberg CityLab housing desk** | Bloomberg CityLab | Housing affordability; ran a 2026 interactive housing-cost calculator and a cost-of-living graphics package | They *build* the kind of tool you built — pitch as a data source for their next interactive, not as a story about you. Identify the specific staff reporter on the most recent housing-affordability piece before you send; CityLab runs a mix of staff and outside contributors |
| **Wailin Wong**, **Darian Woods**, **Adrian Ma** | NPR, *The Indicator from Planet Money* | Daily 10-minute economics | The Indicator's whole format is "one number, explained." A single state's stress index reading is a ready-made episode |
| **David Brancaccio** | Marketplace (special correspondent since April 2026) | Long-term effects of economic decisions | New beat, actively looking for material; "what happens when a country stops measuring itself" fits it precisely |

### D. Distribution to other newsrooms (highest ROI per minute)

These aren't features about FinMango — they put the dataset in front of every data journalist
in the country, who then use it and cite you.

| Target | What it is | Why |
|---|---|---|
| **Jeremy Singer-Vine** — *Data Is Plural* | Weekly newsletter of useful/curious datasets; also runs the Data Liberation Project | Read by essentially every data journalist in the US. Your dataset meets his stated criteria exactly: freely and publicly available, downloadable in bulk **and** via API. This is a short, factual, no-adjectives email — highest hit probability of anything on this list |
| **Danielle Alberti** (data visualization editor) and **Jacque Schrag** (associate data viz editor) | Axios Visuals | Gatekeepers for Axios charts; a clean 50-state dataset with an embed is exactly their input format |
| **Chris Teale** (managing editor), **Kaitlyn Levinson** (reporter) | Route Fifty | Covers state/local government dashboards and data tools; audience is the state officials you want *using* the Barometer |
| **Andrew Deck** | Nieman Lab (staff writer) | Nieman Lab covers tools newsrooms adopt; the free embeddable widget for local newsrooms is the story, not the index |

### E. Local (Ohio) — easiest yes, useful for the clip file

| Reporter | Outlet | Notes |
|---|---|---|
| **Arielle Kass** | Signal Akron | Files on housing, economic development, and job availability; her author page and recent bylines list the beat inconsistently (education vs. economy), so check which she's on this month |
| Signal Cleveland / Signal Ohio economy desk | Signal Ohio network | Nonprofit newsroom network, 30+ staff, covers government/economy/education; friendly to local nonprofit research and to the Kent State connection |
| Crain's Cleveland Business | Crain's | Northeast Ohio business weekly; "local nonprofit builds national economic instrument" is a natural fit |

---

## 3. Tier 2 — worth a second wave

- **Brandon Kochkodin** (Forbes) — wrote the "investors turn to strange signals when government
  data stalls" piece. Receptive to unconventional indicators; Forbes contributor reach is
  variable, so treat as a bonus.
- **Eleanor Mueller** (Semafor, White House economic policy) and **Rohan Goswami** (Semafor,
  business) — secondary doors if Hoffman doesn't bite.
- **Shalina Chatlani** (Stateline, health care and environmental justice) — fits only if you
  frame around health outcomes of food and housing stress.
- **Chronicle of Philanthropy / Nonprofit Quarterly** — the "small 501(c)(3) does public-goods
  R&D that agencies stopped doing" story. Nonprofit-sector trade press, not general audience.
- **State-level members of the States Newsroom network** — one pitch per state with that state's
  numbers, once you have a national story to point at.
- **MinnPost** — covered private data filling federal gaps; regional but data-literate.

## 4. Explicit non-targets

- General tech/startup press (TechCrunch and similar). No funding round, no product launch, no
  hook. It will read as a nonprofit fishing for coverage.
- Crypto/fintech trade press. Wrong audience, and it dilutes the research positioning.
- Personal-finance service desks. They want "how to budget," not state-level indices.

---

## 5. Finding contacts

No email addresses in this file on purpose — stale or guessed addresses burn a first
impression. In order of reliability:

1. **The outlet's own author page.** Bloomberg, Axios, Stateline, Civil Eats, and Route Fifty
   all publish per-author pages, and many list a contact or Signal handle. Heckman's GovExec
   byline lists a Signal handle directly.
2. **Muck Rack profiles** (`muckrack.com/<name>`) — current outlet, beat, and recent bylines.
   Best single check that a reporter hasn't moved.
3. **LinkedIn** for the affiliation check, not for pitching. Don't cold-DM a reporter a pitch
   on LinkedIn; it reads as PR spam.
4. **Bluesky/X** — many economics and data reporters post an open "pitch me" line, and several
   prefer a short DM to email.

Do not buy a media-list database for this. It's fewer than 25 people and the manual check is
more accurate.

## 6. Pitch mechanics

**Subject lines that match the peg, not the product:**
- *"USDA stopped measuring hunger. We built a free state-level estimate — and published how well it works."*
- *"Free, open-source 50-state economic stress data (CSV/API), from a 501(c)(3)"*
- *"We're preregistering a study that might show our own data adds nothing"*

**Body, six sentences maximum:**
1. The peg — one documented fact from the table in §1.
2. What the Barometer is, in one sentence, including "free" and "open-source."
3. The one number most relevant to their beat or state.
4. The honest limitation, stated by you before they find it. This is what separates you from
   every vendor pitching them alternative data.
5. What you're offering: the data, the methodology, an interview, or a custom cut for their
   state.
6. Links: live tool, validation page, CSV.

**Have these ready before the first email goes out:**
- A one-paragraph plain-language summary of the Heuristic Stress Model that doesn't require the
  formulas.
- A named human available for interview, with a title.
- One chart, already made, that works at newsletter width.
- A single-state custom pull you can turn around in under an hour when someone asks.

**Sequencing.** Send Data Is Plural and the Stateline pitches first — they're the highest
probability and the widest republication. Use any resulting coverage as social proof for
Bloomberg and Axios, who are likelier to engage with something already in circulation. Don't
attempt an embargo; you have no announcement to embargo, and the tool is already public.

**One thing worth waiting for.** The preregistered nowcasting result is your strongest
story, and it's stronger *after* it exists. If publication is close, consider holding the
Bloomberg and Nieman Lab pitches until you can lead with the finding — including, and
especially, if the finding is null.
