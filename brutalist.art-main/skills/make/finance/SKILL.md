---
name: finance
description: >
  Fully-templatized financial-filings reels on the ai-explainer chassis. Same
  ELEVEN beats, same five charts, same order, every company, every quarter —
  nothing is chosen at build time except the ticker, because GAAP already fixed
  the shape. Data comes from SEC EDGAR's XBRL JSON APIs, so no figure is ever
  retyped: ticker to CIK, then companyfacts for every tagged fact, then frames
  for a real sector population. Shape logic is locked — flow gets a Sankey
  (income statement, cash flow), a snapshot gets a mirrored bar (balance sheet),
  composition over time gets a stacked bar (segments) — and picking otherwise is
  a factual misrepresentation, not a style choice. Two independent deterministic
  audits gate every render: AUDIT-RECONCILE (the charts against their own
  arithmetic) and AUDIT-SOURCE (every rendered number against its XBRL fact).
  Both FAIL the build. Use when the user types `finance <TICKER>`, or asks to
  break down a public company's latest financials. Never publishes.
---

# finance — reading a public company's filings

The first fully-templatized modifier. Every other explainer needs judgment about
*what shape teaches this idea*. This one does not: three statements, three
structures, filed on a schedule, tagged in a standard vocabulary. **The template
is not a shortcut — it is the accounting standard, rendered.**

Which also inverts the failure mode. Nothing here is "did the model pick a good
visual." Everything is "does the number on screen equal the number in the
filing" — deterministic, machine-verifiable, twice.


## 0. SERIES POSITIONING — read this before anything else

**This series exists BECAUSE the standard treatment already exists.** Bar charts,
line charts, stock-photo-mountain-with-arrow — that treatment of financial data
has abundant, well-executed coverage on YouTube. The audience that wants it has
somewhere to go.

**Therefore: a bar chart where the spec calls for a Sankey is not a near-miss,
it is the failure mode.** It is the exact thing the series is defined against.
If a reel ships bar charts for the income statement or cash flow, it has no
reason to exist.

**The corollary — the bar is HIGHER, not lower.** An unusual chart must earn its
unusualness by being *more* accurate to the data's structure, not just more
distinctive. A chart that looks novel but misrepresents the statement (blending
two statements silently, forcing a snapshot into a flow shape) is WORSE than the
boilerplate, because it borrows credibility from "unusual = rigorous" without
doing the work.

## 0.1 TWO EPISODES PER COMPANY, NEVER ONE

Statement literacy (descriptive: what did they do) and moat analysis
(argumentative: can someone take this from them) are different questions,
different tones, different chart types. Cramming both into one video undercuts
the descriptive episode's closure and makes the strategy an afterthought.

- **Episode 1** — the eleven beats below. Ends at the verdict on the filings.
- **Episode 2** — replaceability and moat. Separate reel, explicitly framed as
  part two, same visual system. Measures replaceability by REVEALED SUBSTITUTION
  (what customers actually build instead), and entry cost across four independent
  dimensions: physical capital, equipment access, R&D spend AND intensity, and
  TIME as its own barrier. Its charts are NOT episode 1's — expect R&D-intensity
  time series and a substitution case-log, never a Sankey or mirrored bar.

Never put moat analysis in episode 1.

## 0.2 NARRATION — SPOKEN, NOT READ ALOUD

The voice track is heard, not skimmed. Acronym soup is unlistenable.

- **Expand every acronym on first use, in plain words.** "Cost of revenue — what
  it costs to make the thing" — not "COGS". Not "SG&A", "EPS", "GAAP", "CFO",
  "YoY" bare. The CARD may carry the term; the VOICE explains it.
- **Never chain acronyms.** Two in one sentence is a rewrite.
- **Say numbers the way a person says them.** "Two hundred sixteen billion
  dollars", not "215,943 million". Round in speech, exact on the card.
- **The voice says what it MEANS, the card says what it IS.** If the narration
  can only be understood by someone reading the card, the beat has failed.
- **Define every piece of financial jargon in the sentence that uses it.** Not
  just acronyms — the terms of art too. CAGR, EBIT, EBITDA, FCF, ROIC, opex,
  capex, accrual, gross margin, operating margin, book value, dilution: each gets
  a plain-language gloss the first time it is spoken. "Compound annual growth
  rate — the smoothed year-over-year rate that gets you from the first number to
  the last." "EBIT — operating profit, before interest and taxes are taken out."
  The viewer should never have to already know the vocabulary to follow the beat.
- A narration line that would be incomprehensible played with the screen off is
  a BUILD FAILURE, not a style note.

### The card carries a gloss line — two channels, not one

Voice and card do different jobs and BOTH must handle the jargon.

- **VOICE** expands it in plain words in the sentence that first uses it.
- **CARD** carries a **GLOSS LINE along the bottom of the frame**, listing every
  acronym or term of art visible on that card with its expansion in parentheses:

  > `CAGR (Compound Annual Growth Rate)`
  > `EBIT (Earnings Before Interest and Taxes) · FCF (Free Cash Flow)`

  Multiple terms are separated by `·`. The line sits below the chart, in the
  muted rule colour, smaller than body type but still legible — it is a
  reference, not a caption.

**Why both:** a viewer who joins mid-beat, or who looks up from something else,
has the definition on screen without needing to have heard it. The voice teaches
it once; the card holds it for as long as the term is visible.

**GATE:** any acronym or term of art rendered on a card with no matching entry in
that card's gloss line FAILS the build.


## The ten design rules — ALL of them apply to every episode

1. **Sankeys cannot draw negative-width ribbons.** A loss year, or a section
   that is a net use of cash, is handled by adding a REAL, DISCLOSED inflow
   (beginning cash; equity financing proceeds) so every ribbon stays positive.
   **Never invent a number to force positivity.** Only real, sourced inflows.
2. **Never silently blend statements.** "Where did the cash to cover this loss
   come from" pulls from the cash-flow statement's financing section, not the
   income statement. If a chart needs data from two statements, **SAY SO ON THE
   CHART** — presenting it as one clean diagram overstates the rigor.
3. **A balance sheet is never a Sankey, however carefully styled.** Ribbons read
   as motion; a viewer's gut reading of a balance-sheet Sankey is "assets become
   liabilities," which is false. Mirrored bar is the default even though it is
   the less flashy option.
4. **Normalize before comparing across companies.** Absolute dollars comparing a
   $215B-revenue company to a $34B one only shows "the big one is bigger."
   Convert every node to **% of revenue** (or % of assets for balance sheets) so
   the SHAPES — margin structure, composition — sit on one axis.
5. **"Vs. sector" means a distribution, not two convenient peers.** A genuine
   sample of comparably-reported companies, subject marked, landing wherever it
   actually lands — including not first. (NVIDIA is second on gross margin in its
   own sector; Broadcom is higher. That is the honest and more interesting
   finding.)
6. **Flag every estimate visibly, on the chart itself.** Anything back-solved
   (total minus known components) rather than read from the filing gets a dashed
   border and a footnote — never blended in with as-reported numbers.
7. **Tickers plus a key, not full company names, once more than ~3 entities are
   on one chart.** Long labels crowd out the data; the key below carries the
   full names.
8. **Absence of a disclosure is itself a data point.** A filer that never trips
   the SEC's 10%-customer threshold has thereby PROVEN no single buyer exceeds
   ~10% of revenue. That is a real, checkable claim about business-model
   diffusion — not a gap. Never treat "nothing to report" as "nothing learned."
9. **Distinguish disclosed fact from analyst reconstruction, ON SCREEN.** The
   filing names "Customer A", not Microsoft. The mapping to real names is
   external inference, and it is one step further removed still, because direct
   customers are often ODM/system-integrator intermediaries rather than the end
   buyer. State which layer of the claim you are actually making.
10. **No stock-deck visual language, ever.** No low-poly mountain-and-arrow, no
    lorem-ipsum filler aesthetic, no upward-diagonal-through-a-triangle. If a
    chart type is recognizable as template deck art it is disqualified
    REGARDLESS of how well it fits the data — it signals "unexamined template"
    to anyone who has sat through a corporate deck.

## Trigger

`finance <TICKER>` · optional `--form 10-Q`

## Which filing

| Form | What it is | Use |
|---|---|---|
| **10-K** | Annual. **Audited.** Full statements + segment notes. | **The default.** |
| **10-Q** | Quarterly. **Unaudited.** Q1–Q3 only; Q4 folds into the 10-K. | The quarterly cut. |
| **8-K** | Current report. Earnings releases arrive here as Exhibit 99.1, weeks earlier. | **Never as primary** — unaudited, often non-GAAP. |
| **20-F** | Annual for foreign private issuers. | 10-K substitute for non-US filers. |

If only an 8-K exists for the period, say so on screen and label every figure
*unaudited, company-reported*. Never blend an 8-K figure into a 10-K chart
without marking it.

## Data — EDGAR XBRL, Rung 1, never retyped

```
https://www.sec.gov/files/company_tickers.json                      ticker -> CIK
https://data.sec.gov/submissions/CIK##########.json                 filing index
https://data.sec.gov/api/xbrl/companyfacts/CIK##########.json       every tagged fact
https://data.sec.gov/api/xbrl/frames/us-gaap/<Tag>/USD/CY####Q#I.json   sector population
```

CIK is zero-padded to 10 digits.

**Two hard requirements or it fails:**

- **A User-Agent naming your org and a contact email.** Without it SEC returns **403**.
- **10 requests/second maximum.** Sleep ~0.12s between calls or you get 429s.

Every fact carries its own `accn`, `form`, `fy`, `fp`, `end` — on-chart
provenance for free. Write the pull to `data/facts.json`; **charts read only from
that file.** No numeric constant is ever typed into a component.

## The eleven beats

| # | Beat | Visual |
|---|---|---|
| B01 | COLD OPEN — "break down COMPANY's latest financials" | composer → filing header |
| B02 | EXECUTIVE SUMMARY — BLUF, the shape of the year | headline stat card |
| B03 | THE SOURCE — form, period, filed date, accession number | provenance card |
| B04 | INCOME STATEMENT | **Sankey** |
| B05 | CASH FLOW — sources converge, uses diverge | **Sankey** |
| B06 | BALANCE SHEET | **mirrored bar** |
| B07 | SEGMENTS | **stacked bar** |
| B08 | VS SECTOR | **dot-plot distribution** |
| B09 | WHAT TO LOOK OUT FOR — concentration, one-offs, GAAP vs non-GAAP, estimates | annotated callouts |
| B10 | YOUR TURN | composer |
| B11 | OUTRO | title restate |

**No beat is ever dropped.** A company with no segment disclosure still renders
B07 and says so — a filer who never trips the 10%-customer threshold has thereby
proven no customer exceeds ~10% of revenue. *Absence of disclosure is a finding.*
Dropping a beat reintroduces the per-reel guessing this modifier removes.

## Shape logic, locked

**Flow → Sankey. Snapshot → mirrored bar. Composition × time → stacked bar.**

A balance sheet is **never** a Sankey: ribbons read as motion, and a viewer's gut
reading of a balance-sheet Sankey is "assets become liabilities," which is false.

Sankeys cannot draw negative-width ribbons. A net cash outflow is handled by
including a real, disclosed inflow (beginning cash) so every ribbon stays
positive. **Never invent a number to force positivity.**

## Palette

Page `#FAF9F5`, ink `#3D3929`, rule `#D8D2C4`.

### Profit and loss — green and red, with a hard condition

Green-for-profit / red-for-loss is universal in finance and this series uses it.
The measured pair:

| Meaning | Hex | Contrast on cream |
|---|---|---|
| **profit · inflow · gain** | `#009E73` (Okabe-Ito bluish green) | 3.25:1 |
| **loss · cost · outflow** | `#D55E00` (Okabe-Ito vermilion) | 3.67:1 |

Not pure green/red — the Okabe-Ito pair reads the same to normal vision and stays
distinguishable by hue under deuteran and protan colour blindness, which pure
red/green does not.

**THE CONDITION: those two differ in hue but NOT in luminance — 1.13:1 against
each other.** In greyscale, or to a colourblind viewer, they are two identical
blobs. So:

> **Colour may reinforce profit-versus-loss. It may never be the only thing
> carrying it.**

Every profit/loss distinction must ALSO be encoded by at least one of:
- **geometry** — in a Sankey the profit ribbon continues to the next column while
  the cost ribbon terminates; that already carries the meaning
- **the sign on the number** — an explicit `−` on screen, never colour alone
- **the label** — "operating loss", not a red bar the viewer must decode

**GREYSCALE TEST, enforced:** desaturate the rendered frame. If profit and loss
become ambiguous, the beat FAILS — regardless of how correct the colours are.

### Everything else

**Terracotta `#D97757` is reserved for the subject company only** — its dot, its
bars, nothing else. (It measures 2.96:1 on cream, just under the 3:1 graphic
threshold, so its keyline is load-bearing, not decorative.)

Neutral data series use the measured CVD-safe set: black `#000000` (totals), blue
`#0072B2` (4.92:1, neutral/structural), yellow `#F0E442` (other/adjustment).
Reserve green and vermilion for their profit/loss meaning — never spend them on a
category that has nothing to do with gain or loss.

**A 1px keyline `#1a1a1a` on every fill is mandatory** — yellow measures 1.1:1 on
cream and is invisible without it.

Estimates render with a dashed border, always.

## B08 — the comparator rule

Do not improvise per company. Take the subject's SIC code from its submissions
JSON, pull the same GAAP tag across that SIC via `frames`, keep filers with
revenue ≥ 10% of the subject's, require at least 5, cap at 8 for legibility. If
fewer than 5 qualify, widen to the 2-digit SIC group **and say so on the chart**.
Label with tickers plus a key.

**Let the subject land wherever it actually lands** — including not first. Two
hand-picked peers is cherry-picking with extra steps.

## The two audits — both deterministic, both fail the build

**AUDIT-RECONCILE — the charts against themselves.** Income statement columns
reconcile · cash-flow sources sum equals uses sum, no negative ribbon · balance
sheet assets equals liabilities plus equity, **computed from line items, not a
stored total** · each period's segments sum to that period's total AND periods
sum to the fiscal-year total · every non-terminal Sankey node's inflow equals
outflow.

**AUDIT-SOURCE — the charts against EDGAR.** Every rendered number equals its
XBRL fact by tag and value · every back-solved figure is dashed AND listed in
B09 · grep the components for hard-coded numerics and fail if any exist.

They are independent by construction: one checks internal arithmetic, the other
checks external truth. They cannot fail the same way.

Plus the render gate: no overflow, no truncation, and **no bar wider than its
track** — a 71.1% value in a 70%-wide track is a hard fail, not a clip.

## Known trap — the template does not fit banks

The income-statement Sankey assumes revenue → COGS → gross profit. **Banks have
no COGS**; they have net interest income. Insurers run on premiums and reserves;
REITs headline funds-from-operations. Running this template across the S&P 500
would render structurally meaningless charts for the financial and real-estate
sectors.

The **Nasdaq-100 excludes financials by construction**, which makes it the better
batch target. For financials, write a second template — do not force banks
through this one.

## Never

Never publish. Never spend. Never render past a failed audit.
