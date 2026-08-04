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

Paste everything in the block below into the `Draft:FinMango` edit box.

```wikitext
{{subst:submit}}
{{Short description|American nonprofit organization focused on financial health}}
{{Infobox organization
| name          = FinMango
| type          = [[Nonprofit organization]]
| tax_id        = 81-2543425
| founded       = 2017
| founder       = Scott Glasgow
| headquarters  = [[North Canton, Ohio]], U.S.
| leader_title  = Executive director
| leader_name   = Scott Glasgow
| website       = {{URL|https://www.finmango.org/}}
}}

'''FinMango''' is an American [[501(c)(3) organization|501(c)(3)]] [[nonprofit organization]] headquartered in [[North Canton, Ohio]]. It produces financial education programming for schools and conducts open-data research on household financial health. The organization was recognised as tax-exempt by the [[Internal Revenue Service]] in June 2017.<ref name="propublica" />

== History ==
FinMango grew out of class discussions at [[Kent State University]] and was founded by Scott Glasgow, who serves as its executive director.<ref name="mangomodel" /> It received IRS tax-exempt recognition in June 2017 and is classified under the [[National Taxonomy of Exempt Entities]] as a financial counselling and money management organisation.<ref name="propublica" />

== COVID-19 Open-Data ==
From 2020, FinMango collaborated with Google Health on COVID-19 Open-Data, an open-source [[dataset]] aggregating epidemiological, hospitalisation, mobility, government-response and demographic data for the [[COVID-19 pandemic]]. FinMango contributed a crowd-sourcing process that converted unstructured material — including screenshots of annotated maps published by health authorities — into structured records, and took part in assessing and ranking candidate data sources.<ref name="scidata" />

The resulting dataset covered 22,579 locations across 232 countries and territories. Its authors described it as the largest COVID-19 meta-dataset in terms of the number of locations, variables and timespan covered.<ref name="scidata" />

The partnership was later documented in the ''American Journal of Health Education'' in a 2023 article co-authored by Google and FinMango personnel, which set out the governance decisions behind the project and presented it as a model for nonprofit–industry collaboration on public-health data.<ref name="mangomodel" />

== Programmes ==
FinMango's education work includes classroom instruction on [[mutual fund]]s and [[Roth IRA]]s delivered in secondary schools, and Barrier Breakers, a student competition on financial-health innovation run with Kent State University.<ref name="about" />

== References ==
{{Reflist|refs=
<ref name="propublica">{{cite web |title=Finmango — Nonprofit Explorer |url=https://projects.propublica.org/nonprofits/organizations/812543425 |publisher=[[ProPublica]] |access-date=4 August 2026}}</ref>
<ref name="scidata">{{cite journal |last1=Wahltinez |first1=Oscar |last2=Cheung |first2=Aurora |last3=Alcantara |first3=Ruth |display-authors=3 |title=COVID-19 Open-Data: a global-scale spatially granular meta-dataset for coronavirus disease |journal=[[Scientific Data]] |volume=9 |issue=1 |page=162 |year=2022 |doi=10.1038/s41597-022-01263-z |pmid=35414102 |pmc=9005692}}</ref>
<ref name="mangomodel">{{cite journal |last1=Wahltinez |first1=Oscar |last2=Glasgow |first2=Scott |last3=Cheung |first3=Aurora |display-authors=3 |title=The Mango Model: Best Practices in the Creation of a COVID-19 Open Data Project Through a Partnership with Google Health and the Non-Profit FinMango |journal=American Journal of Health Education |volume=54 |issue=4 |pages=259–264 |year=2023 |doi=10.1080/19325037.2023.2209620}}</ref>
<ref name="about">{{cite web |title=About FinMango |url=https://www.finmango.org/about.html |publisher=FinMango |access-date=4 August 2026}}</ref>
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
| finmango.org | No — self-published | Limited, per [WP:ABOUTSELF](https://en.wikipedia.org/wiki/Wikipedia:Verifiability#Self-published_or_questionable_sources_as_sources_on_themselves) | No |

**Gap:** no independent journalism *about* FinMango was located. That is the
one thing that would move this from "declined" to "accepted".

## 4. Deliberate omissions

Cut because they are unverifiable self-claims and read as promotional to a
reviewer — the two most common decline reasons:

- reach figures ("1 million people", "10 million", "100+ countries")
- students-taught totals ("50,000", "75,000", "100k+")
- "used by the WHO, World Bank, IMF" (not established by the cited papers)
- internal branding ("moonshot factory", "Mangoes", mission language)

Add any of these back only with an independent source attached.
