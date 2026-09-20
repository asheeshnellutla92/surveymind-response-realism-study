# MOTION.md — the Vox motion pantry

Seven distinct motion languages. **A pantry, not a recipe:** a chef does not
dump every ingredient into a dish — a language goes into a film ONLY if it
improves that beat. Most explainers use three or four of the seven; none uses
all seven because the checklist said so. The unifying discipline — the actual
"Vox style," more than any single technique — is that **motion is subordinate
to information delivery.** Every move either reveals data, lands attention on
the word being spoken, or keeps a still from reading as dead air. Nothing
moves for its own sake.

Lineage (when a collaborator wants more motion "for engagement," the research
says no): Mayer's coherence principle bans decorative motion, the signaling
principle is why reveals land on the spoken word, the segmenting principle is
why shots stay idea-sized. Restraint is evidence-based, not taste.

## The seven languages

| # | language | solves | data shape | status |
|---|----------|--------|-----------|--------|
| 1 | KEN BURNS | still photo reads as dead air | — | built (`vox_compile.py` zoompan) |
| 2 | PARALLAX 2.5D | one striking image must carry 6+ s | — | media-prep (cutout + inpaint) |
| 3 | ISOTYPE | abstraction must become countable | share-of-whole, discrete units | built (`IsotypeGrid`) |
| 4 | CHART DRAW-ON | trend must be *watched* happening | continuous / over-time | built (UV reel chart arc idiom) |
| 5 | MAP MOTION | location/flow must be legible | geographic | stand-ins (tile grid; real geometry pending) |
| 6 | KINETIC TYPE | the spoken word/number needs weight | quotes, key terms, statistics | PENDING (Remotion assembly plane) |
| 7 | SCREEN ANNOTATION | claim must feel sourced | documents, UI, posts | PENDING (Remotion assembly plane) |

`shot.motion` per beat: `hold | kenburns | pan | parallax | isotype | drawon |
map | kinetic | annotate`. Type × motion are near-orthogonal: a STILL may be
kenburns or parallax; a GRAPHIC may be isotype, drawon, or map; a DOCUMENT is
usually annotate.

## 1 · Ken Burns (the workhorse)

- **Motivated direction.** Zoom toward the subject of the sentence — a face,
  a signature line — never a generic center-zoom. Set `shot.focus: [fx, fy]`
  (0–1 image coordinates); the compiler biases the zoompan target to it.
- **Slow.** 8–12% scale over the shot. Faster reads as a jump-cut.
- **Constant velocity.** Linear, never eased — easing makes the photo
  "perform," which breaks the documentary register.
- **Pan OR zoom, not both** under ~6 s. `motion: "pan"` for the pure pan.
- **Resolution guard.** The zoom crops in; a source smaller than the output
  frame reveals upscale artifacts. The compiler warns on undersized stills.

## 2 · Parallax 2.5D (the "expensively produced" tell)

Subject cut out onto its own layer, background inpainted where it stood,
camera push moves foreground 1.5–2× the background's distance. Reserve for a
single striking image with 6+ s — typically the portrait of a named person.
This is a **media-prep** language, not a renderer feature: the cutout/inpaint
is a generative-fill job (nano-banana/FLUX), producing `media/<beat>_fg.png`
+ `media/<beat>_bg.png`. Too expensive per shot to be a default; if the beat
doesn't deserve a lingering image, use Ken Burns.

## 3 · Isotype (see SKILL.md design tokens)

One mark = one discrete unit, reading order, count-up with lag_ratio
0.003–0.01, finishes as the line finishes, squares OR dots — one choice per
film. Use for share-of-whole and countable units (seats, votes, people).
**Not for continuous data** — that is draw-on's job. Never bounce.

## 4 · Chart draw-on

- Axes and gridlines FIRST, data after — establish the frame, then "here's
  what we found."
- The line draws left-to-right at constant velocity, timed so the rightmost
  point arrives on the spoken figure. Bars grow from the baseline, never
  descend.
- **Chart-type law outranks motion:** bars/columns start at true zero
  (truncated baselines are misinformation, not style); line charts need no
  zero baseline — the trend shape is the point.

## 5 · Map motion

Choropleth regions fill one at a time in VO order; connections are curved
arcs (a straight line reads "distance," a subtle arc reads "journey" — keep
the curve shallow) with a traveling dot; scope changes are a Ken Burns move
on the map layer, narrowing as the narration narrows.
**Choropleth law:** fill with rates/ratios, not raw totals — a raw-count map
is a population map wearing a costume. Absolute totals only as a deliberate,
stated choice. Real geometry (PD shapefiles via SVGMobject) is pending; the
tile-grid cartogram is the honest stand-in.

## 6 · Kinetic type (Remotion plane — pending)

One phrase on screen at a time — never a sentence building word-by-word
(that's the meme register, not the explainer tier). A spoken statistic gets
its own beat: the number large and isolated, unit label small beneath.
Emphasis is an **underline drawing on as the word is spoken** — the same
hairline grammar as serif labels, keeping one type system. Word-level timing
lives in the beat's `sub_beats` array (finer than shot-level clocking).

## 7 · Screen annotation (Remotion plane — pending)

Circle/box/arrow DRAWS on (stroke animation, same as a chart line — never a
fade), then a soft camera push into the annotated region: a zoom that works
as a cut without cutting. No floating cursor unless demonstrating an actual
click. Grounds a claim in a citable artifact — the DOCUMENT shot type's
native motion.

## Sequencing across a film (which language, where)

- **Cold open** — Ken Burns or parallax on one striking image; documentary
  tone before any graphic appears.
- **Setup/context** — map if geographic; kinetic type to define terms.
- **Evidence** — isotype or draw-on; the argument gets the densest language.
- **Counterpoint** — screen annotation; the counterargument gets a source.
- **Closer** — return to Ken Burns/parallax on a human image (and the
  relevance-gated "Who was X?" kicker lives here — see SKILL.md).

**The 40% cap:** no single language carries more than ~40% of a film's
beats. An isotype-heavy beat sheet means isotype was easiest, not best —
convert the excess to draw-on or map. The compiler prints the motion
histogram and warns past the cap.

## Sound (beat-synced, subliminal)

A restrained SFX pass timed to the same beat sheet: soft tick per isotype
mark, paper rustle on Ken Burns transitions, light click on an underline
draw, low tone on a choropleth fill. Felt, not heard — if it registers as a
sound effect, it's too loud. Schema: optional `sfx` tag per beat, so the
audio pass assembles from the same sheet as the visuals, not as a separate
manual pass after picture lock.

## Captions fall out of the schema — as SIDECARS, never burn-ins

THE CAPTION POLICY (settled): Vox-register explainers do NOT burn captions —
narration + identical on-screen text is the redundancy principle's textbook
failure. Burned/karaoke captions belong to music videos (lyrics ARE the
content) and kids' videos (co-viewing, literacy), or when explicitly asked.
Explainers ship the SRT/VTT as a SIDECAR generated from the beat sheet's
timing (word-level `sub_beats` where present, beat windows otherwise) and
hand it to the platform (`captions.insert`) — the viewer opts in, YouTube
gets clean machine-readable text, and accessibility is better served than by
pixels. Kinetic type stays what it is: emphasized fragments, not transcription.

## Typography note (decided: stay serif + mono)

The generic Vox research recommends serif labels + a geometric sans for
data. This repo's settled tokens are serif + mono-for-data-numerals
(`brutalist/EQUATIONS.md` division). Do not mix per-film; if the sans ever
wins, it wins repo-wide in one decision.
