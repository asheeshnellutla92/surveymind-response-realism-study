# Duration & pacing — the evidence

What's actually known about how long an educational beat/video should be, and where the
numbers are firm vs. invented. As with the media-router, **effect sizes here are the
*independent* meta-analytic estimates, not Mayer's larger in-house figures.**

## The one true principle: duration is an output

There is **no** empirical support for a uniform clock target (30 s, 1 min) across
content. No study recommends it; several explicitly warn against "a magic number
derived from an average of thousands of courses." Duration should fall out of
content structure (beat count × per-beat consolidation time + holds), not be imposed.

## What the segmenting evidence establishes (and what it doesn't)

- **Segmenting helps.** Breaking a continuous narrated animation into idea-sized,
  (ideally learner-paced) segments improves retention and transfer. *Independent*
  estimate: **g ≈ 0.32–0.36** (Rey et al. 2019 meta-analysis, 88 comparisons,
  N ≈ 7,700). Mayer's own lightning-formation studies report ~d = 1.0 — treat that as
  an in-house upper bound, not the field estimate.
- **Meaningful boundaries beat arbitrary cuts.** Segment at natural idea/event
  boundaries; cutting mid-idea harms learning (Biard, Cojean & Jamet 2017). *This is
  why you never split a beat to hit a clock.*
- **The pause itself matters, modestly.** A ~1–2 s pause between auto-advancing
  segments improved outcomes (Spanjers et al. 2012) — the effect is small (≈ η²p 0.03)
  and came from the *pause* (consolidation), not the boundary cue alone. Supports
  inter-beat holds; don't oversell the size.
- **What it does NOT say:** it does not say all beats are the same length, that 30 s is
  a natural segment, or anything about *total* video duration. It's a within-video,
  idea-grain principle.

## The cognitive basis for a consolidation floor

- Stabilizing one working-memory representation takes ~**1–2 s** per item; novel
  unrehearsed info decays in ~**15–30 s** (standard WM findings — Cowan; Nieuwenstein
  et al. 2009; Ricker & Hardman 2017).
- The phonological loop holds ~2 s of speech; one narrated sentence (~7–12 words) is
  about one auditory idea unit (Baddeley & Hitch).
- **Intrinsic load scales with element interactivity** (Sweller, Ayres & Kalyuga 2011;
  Chen, Kalyuga & Sweller 2017). High-interactivity steps need more integration time;
  isolating elements before their interactions helps (Pollock, Chandler & Sweller 2002).
- For **equations specifically**, the *transient information effect* (Leahy & Sweller
  2011; Wong et al. 2012) is strongest: a complex equation narrated then replaced
  collapses working memory — keep it permanent on screen or segment the derivation
  across held frames. Worked-example pacing (reveal steps deliberately) is well
  supported (g ≈ 0.48; Barbieri et al. 2023 meta).

## The heuristic floor/ceiling table — labeled honestly

These second-ranges are **reasoned heuristics, not measured constants.** Mayer's one
well-known datapoint is ~8–10 s per segment for a 16-step process (lightning), and that
hasn't been replicated across content types. Use them as defaults and adjust by the
actual element count in the beat.

| `content_type` | Element interactivity | Floor (min on-screen) | Ceiling (split signal) |
|---|---|---|---|
| `title` / definitional | very low | 3–5 s | ~9 s |
| `realworld` context | low | 4–5 s | ~11 s |
| `structure` | low–moderate | 6–8 s | ~16 s |
| `geometric` | moderate | 6–8 s | ~18 s |
| `data` | low–moderate | 6–8 s | ~18 s |
| `mechanism` (per step) | high | 6–10 s | ~20 s |
| `equation` (per step) | high | 7–12 s | ~24 s |

Total video runtime is the **sum of beat durations + inter-beat holds**, and lands
where the content puts it: ~30–90 s for definitional/context videos, ~1–2.5 min for
simple processes, ~2.5–4 min for complex mechanisms, ~3–5 min for full derivations.

## Engagement ≠ learning (don't optimize the wrong metric)

- The Guo, Kim & Rubin (2014) "6-minute rule" (6.9M edX sessions) measures *engagement*
  (watch time), which the authors flag as distinct from learning. It does **not**
  replicate as a learning result in enrolled courses (Lagerstrom et al. 2015 found
  12–20 min watched to completion; other MOOC work found *no* length–dropout
  correlation and warned against splitting to hit a threshold).
- Independent evidence keeps separating the two: animated-vs-talking-head is a learning
  *null* despite preference differences (Marx & König 2025); "like it but don't learn
  from it" recurs; slick math animation produces an *illusion of understanding*.
- **Rule:** optimize for the structural completeness of each beat, not completion rate.

## Confidence & contested ground

| Claim | Status |
|---|---|
| Uniform clock targets are not evidence-based | **Strong by absence** — no support; explicit warnings against |
| Segmenting at meaningful boundaries helps | **Strong** — g ≈ 0.32–0.36 independent (larger in Mayer corpus) |
| Pause/hold at boundaries adds a little | **Moderate** — Spanjers 2012, small effect |
| High element-interactivity needs more time/beats | **Strong** — CLT + Pollock et al. 2002 |
| Equations need permanence (transient-info) | **Strong** — Leahy & Sweller; Wong et al. |
| Specific per-type second ranges | **Thin / heuristic** — one Mayer datapoint, not replicated across types |
| "Experts are harmed by segmentation" | **Contested** — Spanjers 2011 (single study) found reversal; Rey 2019 meta found high-prior-knowledge benefited *more* (d = 0.73). Do not treat as settled. |
| 30 s vs 60 s uniform beats differentially harm learning | **No direct evidence** — theoretically grounded, untested |
