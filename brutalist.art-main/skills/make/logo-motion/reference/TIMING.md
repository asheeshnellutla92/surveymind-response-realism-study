# TIMING.md — the phase map

## The move

**The mark arrives nearly invisible and stays that way for half the runtime.**

Not: parts fly in at full strength and then something gets decorated. That is a
different, much cheaper animation, and it is the first thing you will build if
you only skim a contact sheet. The logo enters as an **emboss** — pressed into
the page, readable only as a shadow edge and a highlight edge — holds there, and
then **materialises** over one slow continuous ramp.

| # | phase | p | what is happening |
|---|---|---|---|
| 1 | BUILD | 0.03–0.16 | **camera pull-back** — opens on an extreme close-up of the letterform, oversized and tilted ~19°, zooming out and unrotating to front-on. Parts stagger in underneath, but the camera is the visible move |
| 2 | GHOST HOLD | 0.16–0.44 | settled. Nearly invisible. Nothing changes. |
| 3 | MATERIALISE | 0.44–0.83 | one slow ramp, emboss → full ink |
| 4 | LOCK | 0.83–1.00 | static |

## Measured, not invented

Contrast in the mark region (std-dev of luma) across the reference sting
(`logo animation.mov`, 7.01 s):

```
p 0.03-0.16   sd  2.9      fragments converge
p 0.16-0.43   sd  2.6      <- the ghost FLOOR. half a second either side of it, nothing.
p 0.43        sd  3.4      first hint
p 0.53        sd  5.2
p 0.57        sd  9.7
p 0.62        sd 15.2
p 0.67        sd 19.8
p 0.74        sd 24.5
p 0.80        sd 28.4      95% materialised
p 0.86        sd 29.5      plateau
```

Crossings: **5% at p=0.36, 50% at p=0.64, 95% at p=0.80.**

The ramp is slow at both ends — it creeps out of the floor and eases into the
plateau. `smoothstep` over `[ghost, materialise]` tracks it to a mean absolute
error of **0.040** across the whole window, verified against a rebuild.

## Why the ghost hold is the whole effect

Forty-four percent of the runtime spent nearly invisible is not dead air being
tolerated — it is the mechanism. The materialisation only reads as an arrival
because there was nothing to arrive from. Shorten the ghost and you do not get a
snappier sting, you get a fade-in.

The same logic as a hold before an accent, one level up: the pause is not the gap
between the events, it is what makes the event an event.

## The build must be a CAMERA move

The first version of this scene staggered parts inward on their own radial
vectors and called that the geometric transition. At ghost opacity it is
invisible — the client's words were *"it's just appearing."* They were right.

The reference opens on an **extreme close-up**: the mark at ~6.5x scale, rotated
about -19 degrees, offset, filling and overflowing the frame, then pulls back to
the settled lockup. Clipped by the frame, the first few hundred milliseconds read
as an abstract geometric plate sliding through — which is the whole appeal.

Ease it hard (`1-(1-t)^4`): the big move is over early and the last third is a
crawl, so it lands rather than stops.

## Defaults

```
buildStart 0.03   build 0.157   ghost 0.44   materialise 0.83
camera     scale 6.5   rotate -19   x 0.16   y 0.12
```

Fractions of total runtime, so they hold at any length.

## Text after the voice, not with the mark

`textPhases` is separate from `phases` on purpose. For a narrated sting the
useful order is: **logo resolves -> voice starts -> supporting type arrives under
the line.** The rule and the tagline are not part of the transition, and folding
them into it wastes the one moment the mark has the frame to itself.

## When there is narration

**The transition wins, and the voice waits for it.** This is the one place in the
toolkit where audio does not set the shape. A sting reproduces a known motion;
re-timing the materialisation to land on a word breaks the curve that makes it
work. Run the transition to completion, then start the voice.

That makes total runtime an OUTPUT: transition + (silence-trimmed) narration +
tail. Do not pick a round number first and then discover the line does not fit.

**Check the supplied track for leading silence before offsetting it.** Medhavy's
carried 0.88 s. Delaying it by 7.00 s would have put the first word at 7.88 s and
left a dead beat exactly where the sting is most exposed.

Worked example — Medhavy, 11.500 s:

```
0.00-1.10    BUILD          camera pull-back
1.10-3.08    GHOST HOLD
3.08-5.81    MATERIALISE
5.81-7.00    FULL COLOUR    the mark alone, resolved, holding
7.00-10.28   VOICE          "Medhavy AI, an AI-powered intelligent learning system."
  8.45-9.10    tagline fades up, under "AI-powered"
10.28-11.50  HOLD / OUT
```

## Diagnosing a sting that "looks cheap"

Check in this order:

1. **Does the mark arrive at full strength?** If yes, that is the bug. There is
   no ghost phase and nothing can materialise.
2. **Is there a chrome/gloss/bevel sweep?** A hard-edged metallic gradient
   crossing a flat mark is the single clearest tell of a stock template — and it
   renders the brand colour *wrong* for the whole time it passes.
3. **Does colour arrive during motion?** Then it reads as part of the motion
   rather than as an event.

The Medhavy sting this skill was first used to fix had all three: it popped the
full lockup in 0.27 s, held, then swept a silver gradient across a black mark
from 2.80–4.00 s — turning the brand mark grey for 20% of the runtime.
