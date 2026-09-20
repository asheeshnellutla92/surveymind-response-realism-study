---
name: duration-planner
description: >
  Sizes a video to its content instead of to a clock — answers "how long should
  this be?" the right way. Use when the user types `pacing`, `length`, `duration`,
  `how long`, `too long`, `too short`, `beat count`, or asks whether a video / beat
  is the right length, or wants to stop hitting a fixed 30s/1-min target. In this
  AUDIO-FIRST pipeline, duration is an OUTPUT (real Kokoro MP3 durations drive
  it), so the levers are script-sizing (beats per idea) and holds (extra on-screen
  time for consolidation). Enforces a per-content-type consolidation floor, rejects
  padding, recommends inter-beat holds, and lets total runtime fall where the
  content puts it. Evidence-grounded (segmenting + cognitive load), uses `content_type`.
---

# Pacing — size the video to the content, not the clock

The wrong question is "how long should this video be?" The right one is "how many
beats does this idea need, and does each beat get enough time to consolidate?"
**Duration is an output, never a target.** A complex mechanism lands at 3–4 min; a
definitional explainer at 30–60 s. Both are correct. A uniform 30 s / 1 min target has
no learning basis — it's a production convenience, and forcing content into it either
compresses (destroying integration) or pads (adding extraneous load).

## The audio-first reality (read this first — it changes everything)

This pipeline is **audio-first**: each beat's runtime is the real duration of its
Kokoro narration (`mp3/timings.json`), and the animation is timed to it. So you do
**not** "assign 15 seconds" to a beat. Your two real levers are:

1. **Script-sizing** — how many sentences/beats an idea gets. One sentence = one beat
   = one new element (see `whiteboard/reference/storyboard.md`). More interacting
   elements → more beats. This is where most pacing actually happens: a complex
   mechanism becomes *more beats*, not longer ones.
2. **Holds** — extending a beat's on-screen time *past* its narration when the idea
   needs consolidation time the voice didn't give it. A 3-word label narrated in 2 s
   that carries a key idea needs a hold to reach its consolidation floor. (The
   storyboard already has a `HOLD` beat type; in the scene base this is `wait()` time
   added beyond the audio.)

You shape duration by sizing the script and adding holds — not by stretching or
clipping narration to hit a number.

**Holds are now automatic.** The scene base (`bn_bio.BioScene`) applies a `HOLD_FLOOR`:
after each beat's narration it holds the final frame up to the `content_type` floor
(from `shared/bn_pacing.py`), and `assemble.py` pads that beat's audio with the same
silence so the two stay in sync. So consolidation time is built in at render — no manual
holds needed. Turn it off per video with `"hold_floor": false` in the beat sheet
metadata. Important: re-render **and** re-assemble together (both read `bn_pacing.py`);
rendering with one and assembling with the other would desync.

## How to pace a video

1. **Count interacting elements per beat.** If a beat carries more than one new thing
   that must be held simultaneously, it's more than one beat — split it. (This is the
   "one sentence = one element" rule doing double duty as pacing.)
2. **Read each beat's `content_type`** (set at storyboard time). It sets the
   *consolidation floor* — the minimum on-screen time before working memory can
   register and start integrating the new information. See
   `reference/duration-evidence.md` for the floor/ceiling table.
3. **Check the real durations** (`scripts/pace_check.py` reads `timings.json`). For any
   beat whose narration is **below its floor**, recommend a **hold** to reach it —
   don't shorten the narration of the next beat to compensate, and don't speed up the
   voice.
4. **Flag over-ceiling beats** as candidates to *split* (a beat carrying too much for
   one consolidation window is two ideas).
5. **Add inter-beat holds of ~1–2 s** at idea boundaries (a hold on the final frame is
   enough). Modest but real effect; also gives the segment a clean boundary cue.
6. **Report total runtime as an output** and stop. If a clock target is forcing splits
   or compression, say so plainly: that's a production compromise with a known learning
   cost, not an instructional choice.

## The consolidation floor (the load-bearing rule)

Cutting a beat below the time working memory needs to register and begin integrating
the new element does **not** make learning faster — it makes it fail. Rough floors by
content type (heuristics — see the reference for why these are not precise):

| `content_type` | Consolidation floor | If narration is shorter |
|---|---|---|
| `title` / definitional | ~3–5 s | brief is fine; hold only if it's a key term |
| `realworld` context | ~4–5 s | keep short by design (it's an anchor, not instruction) |
| `structure` / `geometric` | ~6–8 s | hold; labels need time to register with referents |
| `data` | ~6–8 s | hold; axes + units + trend each need a fixation |
| `mechanism` (per step) | ~6–10 s | hold; the new step must integrate with prior steps still active |
| `equation` (per step) | ~7–12 s | hold; symbol manipulation needs the prior state held — transient-information risk is highest here |

Floors are *minimums*, enforced with holds. Ceilings (roughly 2–3× the floor) are
*split signals*, not hard caps — a genuinely multi-element step can run long if it
truly is one idea.

## Don't pad (the other failure mode)

Once the idea is presented and the narration is done, adding decorative motion, filler
graphics, or time to hit a number is a coherence violation — extraneous load that
degrades learning. The ceiling on a beat is "understanding of this beat is complete";
then cut to the next beat or end the video. Padding to reach 1:00 is as wrong as
compressing to reach 0:30.

## Boundary conditions

- **High element-interactivity content** (multi-step mechanisms, derivations): needs
  *more beats*, generous holds, and isolated-element sequencing (introduce parts before
  their interactions). This is where uniform short targets do the most damage.
- **Low element-interactivity** (a definition, a label): short is correct; don't pad.
- **Expertise:** segmenting/holds help novices most. Note the contested evidence — a
  large meta-analysis found *high*-prior-knowledge learners also benefited (not the
  naive "experts need less" story), so don't strip holds for an intermediate audience.
  Design at the "novice in this sub-domain" level and let advanced viewers skip ahead.

## Engagement is not the target

The "6-minute rule" is an *engagement* (watch-time) finding from MOOCs, not a learning
result, and it doesn't replicate in enrolled courses. Optimize for the **structural
completeness of each beat**, not completion rate. A 4-minute video that teaches a
mechanism correctly beats a 1-minute video that fits the target and leaves a broken
schema. (And beware the inverse: slick short animation that *feels* complete can buy an
illusion of understanding — see the media-router's first principle.)

## Read before acting

- `reference/duration-evidence.md` — the evidence (with *independent* effect sizes, not
  Mayer-in-house), the heuristic floor/ceiling table, and the contested points.
- `scripts/pace_check.py` — reads a beat sheet + `timings.json`, flags below-floor beats
  (→ add a hold) and over-ceiling beats (→ split), and reports total runtime as an
  output. Advisory; never edits the sheet.

## Relationship to the other skills

`content_type` (from `storyboard.md`) feeds both this skill and `media-router`: one
picks the medium, this one sets the pace. Both treat duration/medium as *derived from
the content*, and both reject "what's easiest to pipeline" as the deciding factor.
