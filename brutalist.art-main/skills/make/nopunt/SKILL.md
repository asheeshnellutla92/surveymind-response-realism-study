---
name: nopunt
description: The anti-punt catalog for Brutalist explainer beats — maps every animatable beat-type to the Brutalist primitive and the tool (Manim / Remotion / app-skin / FormB card) that renders it best, so the system never punts a beat that is better done as animation. Use when authoring or reviewing any explainer beat, when a beat is a placeholder / gen-AI ask / unfilled slate / "drop an image" still, or when unsure how to animate a concept. Triggers on `nopunt`, "how do I animate this beat", "what can Brutalist animate", "which tool for this beat", "this beat is punting", "is this better as an animation", or a beat that names a visual but has no scene. Register: Teardown. Never publishes.
---

# nopunt — if Brutalist can animate it, it never punts

The system punts because it has no single place that answers "can I draw this, and how?" This is
that place. Before you place ANY placeholder — a gen-AI clip, an unfilled slate, a card that just
names a visual, a doodle beat, or an "archive still" for a concept — consult the catalog below.
If a beat's content appears here, it is a PUNT to leave it unfilled. Author it.

## The one rule: HOLD vs PUNT

- **HOLD** (legitimate, keep as a slate placeholder): the beat needs a genuine archival
  **PHOTOGRAPH** of a real person, place, document, or event — or a judgment only Bear can make.
- **PUNT** (a bug, author it): a slot the system can draw/show itself but deferred. Every entry in
  the catalog below is animatable, therefore a PUNT if left unfilled.

Only a real photograph is a HOLD. Everything else animates. If nothing in the catalog fits, that is
a **scripting gap** to FLAG — never a gen-AI clip, never an "archive still," never a card of words.

## Step zero — ask the library (before any of the choices below)

The catalog below tells you what FORM the beat takes. It does not know what is
already built. Ask that first:

```bash
./art scenes "what the beat needs, in plain words"
./art scenes --check <ComponentName>     # is that name actually renderable?
```

A hit is a LEAD — read the desc and props. A candidate tagged `[derived text —
open the file]` has no header of its own; open it before trusting it. Only when
the library genuinely has nothing does the tool choice below apply, and that
miss is a design card: the search writes it to `TEMPLATE-MISSES.md` itself. A
miss is never a licence to slate, and never a licence to invent a punt costume.

## How to choose the tool

- **MOVING mechanism / math / geometry / transform / plotted curve → Manim** (a GRAPHIC scene in
  `scenes.py`). Manim owns anything that morphs, plots, or draws exact structure on cue.
- **Composed card / stat / typography / icon-grid / UI / document / karaoke text → Remotion**
  component.
- **Real code / terminal / app / config / schema / diff / trace → the app SKIN** (ClaudeCodeBeat /
  Onda code-block / shell / GitHub skin) — show the real artifact live, never a drawing of it.
- **A short list of named things, one icon each → FormB card.**
- **A few words with nothing to show → FormA card** (last resort; never wrap code in a card).

All beats: cream `#FAF9F5` ground, ink `#3D3929`, terracotta `#D97757` as the ONE event accent, EB
Garamond, karaoke reveal on the spoken cue, ~15–35% negative space, text never overlapping the figure.

## The catalog — narration describes → animate as → tool

### Data & quantity
| The narration is about… | Animate it as | Tool |
|---|---|---|
| A comparison / leaderboard / scoreboard (rows × cols, a winner) | drawn table, winner row ringed terracotta | Manim GRAPHIC |
| Benchmark scores / any bar comparison | bar chart, illustrative-labeled numbers | Manim BarChart / Remotion bars |
| A trend / scaling curve / non-monotonic / model-progression | axes + plotted curve, or labeled dots on a line | Manim |
| A single big number (76%, 2.8T, 2×) | stat card, terracotta number | Remotion stat card |
| A lower bound with headroom | bar + bracket marker showing the untested range | Manim |
| Part-to-whole / a percentage split (rights donut) | donut / stacked bar, one terracotta segment | Manim / D3 |
| An itemized cost / receipt | itemized list with real numbers, running total | Manim / Remotion |

### Structure & relationship
| About… | Animate as | Tool |
|---|---|---|
| A 2×2 / matrix (model × context) | grid, cells drawn on cue | Manim |
| A funnel (set → filter → narrowed set) | funnel narrowing | Manim |
| A **static** flow / boundary / taxonomy / frozen mechanism | node-and-arrow diagram, drawn on cue | Manim / SVG |
| An **animated** flow / request path / call chain / pipeline / network (data moving through nodes) | **FlowDiagram** (Remotion, Rung 1) — positioned nodes, bezier edges draw-on, terracotta/blue pulse rides the path. Generalizes GitHubCallChain (the linear special case). `skin:'github'` for repo/code flows, `skin:'claude'` for everything else. | Remotion `FlowDiagram` |
| A stack / architecture (routers, filters, N layers) | labeled stack, one node lit | Manim |
| A binary gate (deploy / cannot) | gate diagram, yes/no branch | Manim |
| A ladder / tiers / hierarchy | ladder built rung by rung | Manim |
| A panel of N things (evaluators, experts, verifiers) | node panel, each labeled | Manim / Remotion |
| A control (temperature/effort/seed, a switch, a dial) | dial cluster / switch with dead-zone band | Manim |
| Two things compared (two machines, price vs cost) | two-up, aligned | Manim |

### Math & mechanism
| About… | Animate as | Tool |
|---|---|---|
| An equation / formula built up | MathTex, term by term on cue | Manim |
| A geometric or physics mechanism | the mechanism animated (the proven 211-clip lane) | Manim |
| One form becoming another | Transform / metamorphosis | Manim |

### Enumerated concepts → FormB
| About… | Animate as | Tool |
|---|---|---|
| A short list of named things/concepts (each gets an icon) | FormB card: text + one rough line icon per thing, karaoke reveal | Remotion FormBCard / ChipGrid |
| Progressive disclosure of N points, no icons | FormA/FormB karaoke lines | Remotion |

### Code / app / interface → the skin (show the real thing)
| About… | Show as | Skin |
|---|---|---|
| Code / a compile / schema validation / a trace / a diff | the real code running | ClaudeCodeBeat / Onda code-block |
| The Claude app / a prompt / the ask | the composer | ClaudeComposerAsk |
| GitHub (a repo, a PR, a diff) | the GitHub skin | RepoHero / CodeViewer / CodeDiff |
| The command line / a shell session | the shell skin | shell |
| A tech report / spec sheet / a document | the document, re-composed in cream (not a raw dark screenshot) | document skin |
| A dashboard / report / contact sheet | shown natively in the cream register, full-frame | re-compose or light-theme |

### Text (last resort) & bookends
| About… | Use |
|---|---|
| An act divider / trap header / closing aphorism / short hold | FormA text card |
| Cold open / verdict / your-turn / outro | ClaudeComposerAsk / ClaudeVerdictArtifact / ClaudeComposerAsk / ClaudeTitleOutro (the four bookends, always present) |

### The only HOLD
| About… | Keep as |
|---|---|
| A genuine archival PHOTOGRAPH of a real person/place/document/event | a STILL slot (human-supply) — the ONLY legitimate placeholder |

## FormB slides — the enumerated-things beat

When the narration names a set of "things" or concepts (2–5 of them), each gets its own box: the
serif label + one simple, slightly-rough LINE icon from the concept-icon library. Rules:

- One icon + label per box; subtle rounded panels are fine. The icon is a line drawing, not a
  filled illustration.
- **Icon resolution — specific → general → ASK, never invent.** Use the most specific library icon
  (a CNN gets the CNN icon); else the nearest general icon (an unspecified net gets the general NN
  icon); if neither exists, STOP and ask Bear to make it. Detail-exception: when the detail IS the
  point (p53, not "a protein"), the general icon is wrong — expand the library with the specific one.
- Karaoke reveal: title first, then each box on its spoken cue.
- Banned in FormB (and FormA): decorative circle/blob, gray kicker/eyebrow, bold geometric sans
  headline, underline/rule accent, dot/node graphics, the decorated card. Doodle/rough.js is CUT.

## Punt costumes to reject (all seen 2026-07-30)

These are the same PUNT in different hats — none is ever valid for animatable content:
`YOU → gen-AI clip → pantry` · unfilled `PIPELINE → fill_slates/remotion_scenes` slate · a FormACard
whose narration NAMES a visual ("the routing diagram", "a funnel") · `DoodleScene` / `DoodleChart` ·
`STILL src=archive` "drop a historical image" for a concept or dataset. Each maps to a catalog row
above — draw it.

## SHOW / HOLD / CARD — the per-beat classification

The authoring loop in ai-explainer, deep-explainer, and cli-explainer uses
three beat states. Catalog rows above map what is animatable (always SHOW);
this table defines the full vocabulary:

| Class | When it applies |
|---|---|
| **SHOW** | A real skin surface, Manim diagram, Remotion scene, or legible artifact renders the beat's content. Component / scene ID is named in `shot`. |
| **HOLD** | A genuine archival PHOTOGRAPH of a real person, place, document, or event — OR a decision only the creator can make. Requires a one-line `hold_reason` in the beat's shot block. |
| **CARD** | A few words with nothing to show: act divider, aphorism, breathing beat. Last resort; a card whose narration names a visual or makes a factual claim is a PUNT, not a CARD. |

Anything else is a PUNT — a bug, not a style choice.

## Whole-sheet teaching-arc checklist

A beat sheet is not done until ALL of these hold. The authoring loop reads
this section — it is the **single source**; skill files reference it, they
do not repeat it.

- [ ] **FRAMEWORK beat** — an explicit beat presenting the framework, model,
  or structure BEFORE the first example. A framework named only in narration
  after the examples are shown does NOT count.
- [ ] **WORKED EXAMPLE** — at least one example walked through the framework
  step-by-step while the framework is on screen. The example must USE the
  framework visibly, not just be adjacent to it.
- [ ] **FALSIFIABILITY / edge-case beat** — one beat that stress-tests the
  framework: a counter-example, a failure mode, a domain where the model
  breaks. Not a caveat in passing — a full beat.
- [ ] **SCAFFOLDED viewer task** — the handoff (YOUR TURN / NEXT STEPS)
  contains a real prompt and a rubric the viewer can use to evaluate the
  output. "Ask Claude about X" is NOT scaffolded; "Paste this prompt, then
  check whether the output does A, B, and C" IS.
- [ ] **Four bookends** — cold open, verdict/summary, YOUR TURN,
  title-restate outro (already invariant; listed here so the loop counts them
  as part of the teaching arc, not as separate overhead).
- [ ] **No source, no verdict** — every beat whose narration makes a factual
  or structural claim carries an on-screen source or artifact. A number
  without a counter, a quote floating in narration alone, or a named result
  with no on-screen evidence is a violation. Verdict and YOUR TURN beats are
  exempt (they recapitulate, not assert).

## Keep in sync

The component names here (ClaudeCodeBeat, ClaudeComposerAsk, ClaudeVerdictArtifact, ClaudeTitleOutro,
FormACard, FormBCard, DeckPattern, ChipGrid, the GitHub skin, Onda) are examples from the current
registry. Keep this catalog synced with `runtime/remotion/src/scenes/` and the Manim scene library so
"can Brutalist animate it?" is always answerable from one place. The lint reads this: a beat whose
content matches a catalog row and is left unfilled is a PUNT (violation).
