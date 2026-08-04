# Draft:FinMango — submission package

Working copy of the Wikipedia draft submitted via [Articles for Creation](https://en.wikipedia.org/wiki/Wikipedia:Articles_for_creation).
Kept in the repo so the wikitext isn't lost between edits.

**Status:** drafted, pending submission
**Draft URL:** https://en.wikipedia.org/wiki/Draft:FinMango

---

## 1. Conflict-of-interest disclosure (do this first)

Required by the Wikimedia [Terms of Use](https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use),
not merely by guideline. Post on your **user page** (`User:<yourusername>`):

```
{{UserboxCOI|1=FinMango}}

I am the founder and executive director of FinMango and have a
[[WP:COI|conflict of interest]] regarding that topic. I disclose this in
accordance with the [[WP:PAID|paid-contribution disclosure]] requirement.
I intend to submit drafts through [[WP:AFC|Articles for Creation]] and to
use edit requests rather than editing articles about FinMango directly.
```

And on **`Draft talk:FinMango`**:

```
{{Connected contributor (paid)|User1=<yourusername>|U1-employer=FinMango|U1-client=FinMango|U1-EH=yes|U1-declared=yes}}
```

---

## 2. Draft wikitext

Two-step, because the Article Wizard preload already contains a submission
banner in *unsubmitted* state:

1. Paste the block below into the `Draft:FinMango` edit box and **Publish**.
   Keep the two preload templates and the HTML comment on the first two lines
   — they are the AfC scaffolding. Replace the wizard's `$1` placeholder with
   `FinMango`.
2. Confirm the page renders (no red `cite` errors, references list populated),
   then **Edit** again and add `{{subst:submit}}` as a new first line. That is
   what places it in the review queue.

Doing it in that order avoids two competing AfC banners and gives you a look
at the rendered draft before it enters the queue.

```wikitext
{{subst:AfC submission/draftnew}}{{subst:AfC submission/coi|FinMango}}
<!-- Important, do not remove anything above this line before article has been created. -->
{{Short description|American nonprofit organization focused on financial health}}
'''FinMango''' is an American [[501(c)(3) organization|501(c)(3)]] [[nonprofit organization]] headquartered in [[North Canton, Ohio]]. It works on the financial health of young adults, combining research on the economic pressures affecting household financial stability — among them housing costs, medical debt and access to credit — with financial education programming, free online planning tools and a youth advocacy programme.<ref name="about" /> The organization was recognised as tax-exempt by the [[Internal Revenue Service]] in June 2017.<ref name="propublica" />

== History ==
FinMango grew out of class discussions at [[Kent State University]] and was founded by Scott Glasgow, who serves as its executive director.<ref name="mangomodel" /> It received IRS tax-exempt recognition in June 2017 and is classified under the [[National Taxonomy of Exempt Entities]] as a financial counselling and money management organisation.<ref name="propublica" /> Following a strategic review, the organization broadened its stated focus from financial education to the wider financial stability of young adults in transition.<ref name="about" />

== Research ==
FinMango's research examines the conditions that erode household financial stability, including housing affordability, healthcare costs, debt and predatory lending.<ref name="about" />

Its Financial Health Barometer is a composite index reporting estimated financial stress for each U.S. state across measures of financial anxiety, food insecurity and housing pressure. The published methodology combines federal administrative statistics — including [[American Community Survey]] rent-burden data, [[United States Department of Housing and Urban Development|HUD]] Fair Market Rents and [[Federal Reserve Economic Data|FRED]] house-price indices — with [[Google Trends]] search-interest data, scaled to a common reference range.<ref name="barometer" /> The organization also publishes working papers with academic collaborators and releases its methodologies and datasets publicly.<ref name="research" />

=== COVID-19 Open-Data ===
From 2020, FinMango collaborated with Google Health on COVID-19 Open-Data, an open-source [[dataset]] aggregating epidemiological, hospitalisation, mobility, government-response and demographic data for the [[COVID-19 pandemic]]. FinMango contributed a crowd-sourcing process that converted unstructured material — including screenshots of annotated maps published by health authorities — into structured records, and took part in assessing and ranking candidate data sources.<ref name="scidata" />

The resulting dataset covered 22,579 locations across 232 countries and territories. Its authors described it as the largest COVID-19 meta-dataset in terms of the number of locations, variables and timespan covered.<ref name="scidata" />

In August 2020, [[Google.org]] featured the collaboration in a series highlighting nonprofit organizations using Google tools in their responses to the pandemic.<ref name="research" /><ref name="googleorg" />

The partnership was later documented in the ''American Journal of Health Education'' in a 2023 article co-authored by Google and FinMango personnel, which set out the governance decisions behind the project and presented it as a model for nonprofit–industry collaboration on public-health data.<ref name="mangomodel" />

== Education and programmes ==
FinMango delivers classroom instruction on topics including [[mutual fund]]s and [[Roth IRA]]s in secondary schools, and runs Barrier Breakers, a student competition on financial-health innovation held with Kent State University.<ref name="about" /> It also publishes a set of free online calculators and planning tools covering areas such as student loan repayment, retirement saving, and renting compared with buying a home.<ref name="about" />

Through an annual ambassador programme, the organization selects roughly ten young adults aged 18 to 34 from a range of countries to carry out financial-health advocacy projects in their own communities. Participation is free of charge.<ref name="ambassadors" />

== References ==
{{Reflist|refs=
<ref name="propublica">{{cite web |title=Finmango — Nonprofit Explorer |url=https://projects.propublica.org/nonprofits/organizations/812543425 |publisher=[[ProPublica]] |access-date=4 August 2026}}</ref>
<ref name="scidata">{{cite journal |last1=Wahltinez |first1=Oscar |last2=Cheung |first2=Aurora |last3=Alcantara |first3=Ruth |display-authors=3 |title=COVID-19 Open-Data: a global-scale spatially granular meta-dataset for coronavirus disease |journal=[[Scientific Data]] |volume=9 |issue=1 |page=162 |year=2022 |doi=10.1038/s41597-022-01263-z |pmid=35414102 |pmc=9005692}}</ref>
<ref name="mangomodel">{{cite journal |last1=Wahltinez |first1=Oscar |last2=Glasgow |first2=Scott |last3=Cheung |first3=Aurora |display-authors=3 |title=The Mango Model: Best Practices in the Creation of a COVID-19 Open Data Project Through a Partnership with Google Health and the Non-Profit FinMango |journal=American Journal of Health Education |volume=54 |issue=4 |pages=259–264 |year=2023 |doi=10.1080/19325037.2023.2209620}}</ref>
<ref name="about">{{cite web |title=About FinMango |url=https://www.finmango.org/about.html |publisher=FinMango |access-date=4 August 2026}}</ref>
<ref name="research">{{cite web |title=Research |url=https://www.finmango.org/research |publisher=FinMango |access-date=4 August 2026}}</ref>
<ref name="barometer">{{cite web |title=Financial Health Barometer: 2025 Methodology & Data Architecture |url=https://www.finmango.org/barometer |publisher=FinMango |access-date=4 August 2026}}</ref>
<ref name="ambassadors">{{cite web |title=Ambassador Program |url=https://www.finmango.org/ambassadors |publisher=FinMango |access-date=4 August 2026}}</ref>
<ref name="googleorg">{{cite tweet |author=Google.org |user=Googleorg |number=1299104929743765505 |date=27 August 2020 |title=Meet the nonprofits using Google tools to support their communities during COVID-19. Watch their stories:}}</ref>
}}

<!-- Categories are commented out until the draft is accepted into mainspace.
[[Category:Non-profit organizations based in Ohio]]
[[Category:Financial literacy]]
[[Category:Organizations established in 2017]]
[[Category:Charities based in Ohio]]
-->
```

---

## 3. Source ledger

What each citation can and cannot do, under
[WP:ORGIND](https://en.wikipedia.org/wiki/Wikipedia:Notability_(organizations_and_companies)#Independent_sources):

| Source | Independent? | Supports facts | Supports notability |
|---|---|---|---|
| *Scientific Data* (Nature), 2022 | Yes, but FinMango is a passing mention | Yes | Weakly — not significant coverage |
| *AJHE* "The Mango Model", 2023 | No — Glasgow is a co-author | Yes | No |
| ProPublica Nonprofit Explorer | Yes, but a database mirror of IRS filings | Yes | No |
| finmango.org (about, research, barometer, ambassadors) | No — self-published | Limited, per [WP:ABOUTSELF](https://en.wikipedia.org/wiki/Wikipedia:Verifiability#Self-published_or_questionable_sources_as_sources_on_themselves) | No |
| [@Googleorg tweet](https://x.com/Googleorg/status/1299104929743765505), Aug 2020 | No — Google.org funded the project | Weakly; the tweet does not name FinMango | No |

**On the Google.org tweet** (included at the organization's request): it is
kept to a single attributed sentence describing what Google.org did, rather
than a claim about FinMango, because the tweet's text names nonprofits
generically and not FinMango. The FinMango-specific part of the sentence
rests on the research-page citation beside it. Three known weaknesses, any of
which a reviewer may act on: tweets are self-published ([WP:SPS](https://en.wikipedia.org/wiki/Wikipedia:Verifiability#Self-published_sources));
Google.org was the project's funder and so is not independent under
[WP:ORGIND](https://en.wikipedia.org/wiki/Wikipedia:Notability_(organizations_and_companies)#Independent_sources);
and the link may rot. If the underlying Google-published video or page can be
located and names FinMango, swap this citation for it — same standing on
independence, but far more durable and it verifies the actual claim.

**Gap:** no independent journalism *about* FinMango was located. That is the
one thing that would move this from "declined" to "accepted".

**Self-citation ratio:** 4 of 6 references are to finmango.org. The
financial-health material — Barometer, working papers, tools, ambassadors —
has no independent or third-party publication behind it: the Barometer
whitepaper is self-published (v2.4) and the academic collaborations are
described on the research page as pre-journal working papers. No DOI or
external publication record was found for any of them.

This is the structural weakness of the draft as it now stands. The sections
describing what FinMango currently does are the least verifiable; the COVID-19
Open-Data section, which is not the current focus, carries nearly all the
independent sourcing. Keeping that section substantial is deliberate.

**Highest-value fix:** get any Barometer finding cited or covered by a source
with no FinMango connection — a journalist using the index, a peer-reviewed
paper, or a government or policy publication referencing it. One such source
does more for this draft than any amount of rewriting.

## 4. Deliberate omissions

Cut because they are unverifiable self-claims and read as promotional to a
reviewer — the two most common decline reasons:

- reach figures ("1 million people", "10 million", "100+ countries")
- students-taught totals ("50,000", "75,000", "100k+")
- "used by the WHO, World Bank, IMF" (not established by the cited papers)
- internal branding ("moonshot factory", "Mangoes", mission language)
- "300+ applicants annually" for the ambassador programme
- the infobox (removed at request; optional under Wikipedia style anyway)

Add any of these back only with an independent source attached.
