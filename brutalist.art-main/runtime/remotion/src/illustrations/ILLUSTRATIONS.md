# Concept-illustration library (`runtime/remotion/src/illustrations/`)

Reusable, parameterized Remotion illustrations for Brutalist / Claude-skin reels.
Every component is a **pure function of the audio clock** (`useP()` → `p ∈ [0,1]`),
carries **one terracotta accent**, and is wrapped in `<IlluStage spark="…">` so the
spark-line law is satisfied. No CSS transitions, no timers, no `Math.random()`.

## The two families (pick the family before the component)

Illustration beats fall on **two orthogonal axes**. Deciding a viz is a two-level
choice — family first, then component. Do **not** flatten them into one enum.

```
narration beat
├─ enumerates the PARTS of a system?      → STRUCTURAL  (this folder)
│     ├─ layers / tiers stacking          → LayerStack
│     ├─ a source feeding a destination    → SourceFlow
│     └─ a set of peer items               → ChipGrid
│     (+ PredictCard — a pedagogy device, not structural, kept here for reuse)
│
└─ asserts something that CHANGES over t?  → RHETORICAL  (deckPatterns.tsx / deck_anim.js)
      ├─ a quantity shrinks through stages  → AttritionChain
      ├─ two identical things diverge        → DivergentFates
      ├─ several magnitudes on one scale     → ScaleComparison
      ├─ an ambiguity resolved by evidence   → BinaryBranch
      ├─ a value crosses a hard cutoff       → Threshold
      └─ none of the above (default)         → calloutTour (progressive disclosure)
```

`calloutTour` is the **auto-fallback**: any slide with no hand-authored pattern and
audio > 10 s gets progressive block disclosure. As of the last corpus audit it
covered **1101 of 1219** animated slides (90%) — i.e. most slides were never
classified, not that most slides are genuinely callout tours. The structural
family exists partly to give those default slides a real home when they are
enumerating parts (which the five rhetorical patterns cannot express).

## Components (STRUCTURAL family)

| Component | Use when the beat… | Key props | Adapted from |
|---|---|---|---|
| `LayerStack` | names N layers/tiers of a thing | `layers[{title,sub,accent?}]`, `caption?` | Teachers "Three layers, not an app" |
| `SourceFlow` | says data/content flows FROM a source INTO a tool | `sourceLabel`, `feeds[{label,tint?}]`, `destApp`, `destTitle`, `arcCaption?`, `settleLine?` | Teachers StandardsToCowork **+** medhavy ServerToCowork (merged) |
| `ChipGrid` | shows a SET of peer items | `items[]`, `cols?`, `caption?` | Teachers "Nine tools, day one" |
| `PredictCard` | asks the viewer to predict before the reveal | `question`, `commit` | medhavy PredictCard (pedagogy) |

## Not in this library (on purpose)

- **The `CoworkScheduleBeat` (the 4pm-routine annotated UI)** stays with its reel.
  It is the ILLUSTRATE-LAW exception — the Claude UI *is* the subject — and it
  depends on `ClaudeWindow` + `ClaudeCallout`. It is a UI-annotation composition,
  not a reusable structural illustration.
- **The five rhetorical patterns** live in `deckPatterns.tsx` (Remotion) and
  `skills/animated-deck/assets/deck_anim.js` (D3). Different family, different file.

## Adapting a component (starter-template contract)

Change the **props**, never the motion math. If you need to touch the animation
math, you are building a **new pattern** — add it as its own component here (with a
header block: WHAT / WHEN / PROPS / ADAPTED-FROM), rather than forking an existing
one. Two consecutive beats sharing the same scheme is the smell the ILLUSTRATE LAW
exists to prevent.

## Preview

`previews.tsx` registers `Illu-LayerStack`, `Illu-SourceFlow`, `Illu-ChipGrid`,
`Illu-PredictCard` in Studio with sample props — the canonical worked examples.
