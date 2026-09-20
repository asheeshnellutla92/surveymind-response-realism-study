<!-- Bundled copy for the vox workshop (rule owner). Origin:
     unreal-reels/brutalist/EQUATIONS.md, copied 2026-07-08 so this folder
     stays self-contained. The Vox translation of this template (colors,
     fonts, beat-group form) lives in SKILL.md -> "The equation tangent";
     the components live in manim/animated_graphics.py (EquationTangent, EQT_*
     fixtures). If doctrine changes, THIS copy is the live one for vox. -->

# EQUATIONS.md — the equation tangent (a fixed template)

When an equation appears, the lecture takes a short **tangent** (~30–45s) before the
next slide. The point is a **repeatable slide pattern** that fires every time, so the
explanation quality never depends on improvising live. A tangent explains — it never
derives.

## The five zones (a fixed master, not ad-hoc bullets)

Build this as one layout the renderer fills from data — never hand-compose per slide.

1. **Symbolic form** — the equation, large, isolated, high contrast (dark box, mono).
2. **LHS / RHS as sentences + the sign as a claim** — translate each side into ONE
   plain sentence **before** naming any symbol, then a third sentence that reads the
   *relation symbol itself as a claim about the world or the model* — not punctuation.
   `=` "must be exactly equal," `≤` "can be no bigger than," `≈` "is close to," `:=`
   "is defined as," `argmax` "is the choice that maximizes." Audiences parse the claim
   type faster than the notation.
3. **Glossary with a Role column** — every symbol gets: `Symbol | Role | Plain meaning
   | Domain/Range`. The **Role** column is the one most decks skip and audiences most
   need — distinguish *random variable* vs *fixed value/label* vs *index* vs *operator*
   (`Ŷ` the variable vs its value `1`; `A` vs its values `a`,`b`).
4. **Worked example that holds or breaks** — a concrete scenario with real numbers:
   plug into each side, show the comparison explicitly (`40%` vs `22%` → violated), and
   one sentence on what the result *costs the people involved*. Let them feel the
   violation, don't just describe it.
5. **Values claim** — if the equation encodes a contestable judgment (fairness metrics
   always do), state it as a claim someone could reasonably disagree with — not neutral
   fact. (The deck's equation slides already carry this in the pink box — the tangent
   restates it in one line, or hands back to it.)

**Division of labor:** the deck's equation slide already shows zones 1, a short version
of 2, and 5. The **tangent supplies what the slide skips: the LHS/RHS sentence split,
the Role glossary, and the worked example.** Don't repeat the slide — extend it.

## Color convention (standing, deck-wide)

- **White box = mechanics** (sentences, glossary, the example's arithmetic).
- **Pink / red-tint box = a value judgment** (the values claim).
Teach the viewer this once and it reads automatically everywhere.

## Signaling: one red, moving (symbol coupling without rainbow)

Color-coupling a symbol across the equation, its glossary row, and its value in the
worked example lets the eye track one symbol instead of scanning — but multi-color
coding breaks the one-red palette. Reconcile by making **red a moving spotlight**: the
symbol *currently being explained* turns red in all three places at once, advancing
with the narration line. Same coupling benefit, one accent. (Everything not currently
spotlighted stays ink/gray.)

## Typesetting

- The **symbolic form is real math, not mono** — italic variables (Roman + Greek),
  roman operators/numbers/functions (`log`, `max`). Render it with **KaTeX** (the deck
  already does), never as a screenshot. JetBrains Mono is reserved for *data numbers*
  (the worked example), not the equation.
- Proper minus (`−` / en-dash), true Greek glyphs (`α`, not "a"), `Ŷ` not "Y-hat" in
  the symbolic form (spell it "Y-hat" only in narration).

## Entry & re-entry (don't lose the throughline)

- **Entry marker:** an eyebrow label (`METRIC 01 · EQUATION · TANGENT`) + the accent
  bar, so the audience recognizes "we've branched to an explainer," a recurring feature.
- **Re-entry cue:** the narration ends by handing back to the main argument —
  *"…and that's demographic parity. Now, back to the three definitions."* Always return
  the viewer to where the tangent branched.

## Pedagogy (why this order) + lineage

- **Words → symbols → number** is the worked-example effect: a single concrete
  instantiation does more than restating the definition twice (Sweller & Cooper, 1985).
- **Zoned layout + reveal one zone at a time** = split-attention + spatial-contiguity +
  segmenting (Mayer). Highlight the part you're naming (signaling).
- **Sentence-before-symbol** translation follows the 3Blue1Brown / Strogatz model:
  state the claim type before decomposing notation.
- **Values claim as contestable** follows Barocas, Hardt & Narayanan, *Fairness and
  Machine Learning* (fairmlbook.org) — every fairness metric encodes a value choice.
- One example, numbers in mono, ≤ ~45s, never derive.

## Authoring schema (per equation, data the template renders)

```jsonc
{
  "S05": {
    "eyebrow": "Metric 01 · equation · tangent",
    "title": "Demographic parity",
    "equation": "P(Ŷ=1 | A=a) = P(Ŷ=1 | A=b)",
    "lhs": "How often the model says “yes” to group A.",
    "rhs": "How often it says “yes” to group B.",
    "claim": "These two rates must be equal — not close, equal.",
    "glossary": [
      { "sym": "Ŷ",   "role": "random variable", "mean": "the model's prediction", "dom": "{0, 1}" },
      { "sym": "A",   "role": "random variable", "mean": "group membership",       "dom": "{a, b}" },
      { "sym": "a, b","role": "fixed values",    "mean": "the two specific groups", "dom": "categorical" },
      { "sym": "P(·)","role": "operator",        "mean": "probability of",          "dom": "[0, 1]" }
    ],
    "example": {
      "scenario": "A bank approves loans at 40% in neighborhood A, 22% in B.",
      "lhs_val": "40%", "rhs_val": "22%", "verdict": "40% ≠ 22% — violated",
      "cost": "Group B is handed loans far less often, regardless of who would repay."
    },
    "values_claim": "Outcomes should be equal regardless of base rates — redress over accuracy.",
    "reentry": "That's demographic parity. Back to the three definitions."
  }
}
```

The spoken `narration_text` for the tangent beat walks zones 2→3→4→(5)→re-entry in
order; the visual reveals each zone on its line. Keep each written zone ≤ ~40 words
(glossary excepted).

## Audit (per tangent)

1. Sentences before symbols; the `=` claim stated.
2. Glossary has the Role column; `Ŷ`≠`Y`, variable≠value kept distinct.
3. Worked example shows a real comparison that **holds or breaks**; ends on the human cost.
4. Numbers in mono; values claim in the pink box, mechanics in white.
5. Entry eyebrow present; narration ends with a re-entry cue.
6. ≤ ~45s; no derivation.
