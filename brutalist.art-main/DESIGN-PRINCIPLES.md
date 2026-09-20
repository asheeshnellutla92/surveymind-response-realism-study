# DESIGN PRINCIPLES — locked

*Distilled from the Saul Bass and Anthropic/Claude research. The durable design grammar the skills
read — two registers (Claude = default; Bass = scoped skin), the lane-agnostic validators, and the
sourcing-honesty rule. Palette / voice / outro specifics defer to CLAUDE-BRAND / VOICE-LOCK /
OUTRO-LOCK where those exist; this governs the grammar and the checks.*

## 0. The failure mode we design against

Both registers fail the same way — by collapsing into the statistical default. Claude work drifts
into generic "AI startup" sci-fi (neon, orbs, circuit boards, blue-black gradients). Bass work
drifts into generic mid-century flat illustration without the two things that make it Bass:
shape-as-actor and percussive, score-timed motion. The point of a locked grammar is to not regress
to that default. If a result looks like the generic version of its genre, it's wrong.

## 1. Claude register — DEFAULT (everything @NikBearBrown ships)

- **Warm, muted, restrained.** Not neon, not clinical, not sci-fi. The restraint is load-bearing,
  not an oversight.
- **One canonical palette — collapse the drift.** Our tokens have drifted across files (cream as
  `#FAF9F5` and `#F5F1E8`; accent as `#dd775b`, `#D97757`, `#C15F3C`). Resolved primary triad,
  anchored to the official `anthropics/skills` brand-guidelines (which our ai-explainer skill
  already matches):
  - Cream / light ground: **`#FAF9F5`**  (deprecate `#F5F1E8`)
  - Warm ink / primary text: **`#3D3929`**  (our deliberate warm choice over the official
    near-black `#141413`)
  - Terracotta spark — the ONE accent: **`#D97757`**  (deprecate `#dd775b`, `#C15F3C`)
  - Secondary accents, sparing: official blue `#6a9bcc` / green `#788c5d` — CONFIRM against our
    existing sage/lavender before locking (open decision, don't guess).
- **Accent as event, not decoration.** Reserve terracotta for focal / transformation moments,
  never as a resting fill.
- **Type:** EB Garamond serif = the narrator voice; UI sans for chrome; mono for code. (The real
  brand fonts are Styrene/Tiempos; the license-free substitute is Poppins/Lora. We ship EB
  Garamond — don't mislabel it as "the" Anthropic typeface in a brand-accuracy context.)
- **Wordmark-led, never invent an icon.** No orb, spark, or logomark invented to mean "AI." The
  Claude mascot is our channel character for the OUTRO card, not a logomark — different job.
- **No AI cliché, ever:** no glowing circuits, neural-net nodes, holograms, robot heads, neon
  particles.
- **Restraint over spectacle, typography leads.** Fewer simultaneous movers, held states, soft
  transitions/eases. Imagery supports type, not the reverse.
- **Polarity balance — ~70–80% light, dark as punctuation.** The default ground is LIGHT (cream
  #FAF9F5, ink #3D3929 text); most composed beats/cards are light. Switch to a dark-ground beat
  now and then (roughly 1 in 4–5) to break monotony and mark a shift. So seeded polarity is
  WEIGHTED toward light, NOT a 50/50 flip — dark punctuates, it isn't a co-equal default. This is
  Anthropic's own pattern — the design/examples frames are mostly cream (interaction patterns,
  stat cards, "as agents operate…"), with dark used sparingly (the model curve, the Claude
  Platform cards). (Separate from this: real dark surfaces — terminals, GitHub — and dark-canvas
  Manim/physics exhibits are dark by their nature, not by the polarity roll.)
- **Card beats — TWO acceptable forms, nothing else.** Cards are used SPARINGLY (only when you
  genuinely need words / things on screen, never as default filler between exhibits). Both forms
  share: serif (EB Garamond), the SAME font throughout, generous negative space, and seeded
  polarity WEIGHTED ~70–80% toward light (see Polarity balance) — mostly dark-on-light (ink serif
  on cream), occasionally light-on-dark (cream/white serif on charcoal) to break monotony.
  - **Form A — text only.** Just the serif line(s), centered, on a plain solid ground. For a short
    text hold.
  - **Form B — text + simple icon(s).** When discussing enumerated "things" / concepts: the same
    serif text paired with a simple, slightly-rough LINE icon per thing, from the concept-icon
    library (a large "things" library of simple rough icons — sibling of the doodle/organized-svg
    rough set; Bear is building it). One icon + label per box; subtle rounded panels are fine (see
    the Anthropic three-up frames in design/examples). The icon is a simple line drawing, NOT a
    filled illustration. Bear authors the icons (roughened — a slight hand-drawn quality); the
    pipeline only places them.
  - **Icon resolution — specific → general → ASK, never invent.** Use the MOST specific library
    icon that fits: a CNN gets the CNN icon. If there's no specific one, fall back to the nearest
    GENERAL icon (an unspecified neural net gets the general NN icon). If neither exists, STOP and
    ask Bear to make it — NEVER auto-generate, improvise, or substitute a vaguely-related icon.
    Same exhibit-gate discipline as everywhere else: if the asset isn't in the library, you don't
    fake it.
    - **Detail exception.** The general icon is acceptable ONLY when the concept is genuinely
      generic. When the DETAIL is the point — discussing p53, not "a protein"; a CNN, not "a
      network" — the general icon is WRONG. Expand the library with the specific thing (Bear
      authors it; it joins the library). Many are already known: p53 is object #10 in
      object-inventory.json. Specificity that carries meaning is never flattened to the generic.
  - **Karaoke reveal.** Elements appear on their SPOKEN cue, never all at once: title first, then
    box 1 when its thing is named, box 2 when named, and so on — progressive disclosure synced to
    narration (this is the cue-point timing rule, §3).
  - **BANNED in both forms:** decorative circle / blob, gray kicker / eyebrow label (e.g.
    "MANIM · PHYSICS LIBRARY"), bold geometric sans headline, underline / rule accent (least of all
    pink), dot-matrix / node graphics. The decorated card is never generated again.
  - **References that ARE the target:** design/examples — the Anthropic keynote frames (text-only,
    three-up icon cards, stat cards, the labeled model-progression curve) and the HAI cold-open.
- **Simple visualization beats.** A card (icon/text boxes) MAY be followed by ONE simple
  visualization — a minimal, EB-Garamond-labeled graphic like the model-progression curve (labeled
  dots on a single line, terracotta as the event color). Same discipline: serif labels, ONE accent
  used as event not decoration, restrained, generous space. It's a beat, not a dashboard — never a
  wall of data or a multi-series chart.
- **Animated-flow beats — `FlowDiagram` (Remotion).** When the narration describes data or
  requests *moving through* an architecture, call graph, pipeline, or network, use `FlowDiagram`:
  positioned nodes with baked (x,y) coordinates, bezier edges that draw on in request-flow order,
  and a single data-pulse dot (terracotta for `skin:'claude'`, `GH.BLUE` for `skin:'github'`) that
  rides each path in sequence — ONE pulse at a time, sequence-diagram discipline. `FlowDiagram`
  generalizes `GitHubCallChain` (the linear vertical special case, which stays as-is for simple
  chains). Use `skin:'github'` when the subject is a code/repo call graph; `skin:'claude'` for all
  other architectures. The pulse and the hi-node ring are the ONLY accent events — no other
  terracotta anywhere. Node layout is baked at author time (dagre/elk offline); no runtime layout
  engine. `callChainToFlow()` migrates an existing CallChain beat to FlowDiagram props.
  The distinction from Manim: *static* structure diagrams (frozen boundaries, taxonomies, causal
  maps with no moving data) stay Manim / SVG; *animated* flows (data visibly traversing nodes)
  are `FlowDiagram`. When unsure, ask: does something move along the path? If yes → FlowDiagram.
- **No gen-AI clip as a fallback — compose from the vocabulary.** A beat with no content is a
  SCRIPTING GAP, never a "YOU → generate a 5–10s AI clip → pantry" slot. The pipeline must never
  default a beat to generated AI video, and must never ask Bear to supply one. Fill it from the
  design vocabulary instead: a real Manim / D3 exhibit, a text card, an icon card, or a simple
  visualization (progression, stat cards, labeled curve). Gen-AI video is NOT part of the Claude
  register — the only non-composed visual is the bookend mascot. A "0.014 vs 13.97 gigayears" beat
  is a text card; a "the orbit is the animation" beat is the real Manim clip; a "boxes fail" beat
  shows the failing exhibit. If genuinely nothing in the vocabulary fits, STOP and flag the
  scripting gap — never paper it with a generated clip.
- **App / interface skins — show the real surface, expand the library when it's missing.** When
  the subject IS a real app or interface, show it in ITS skin — a diegetic representation of that
  surface, never a generic card or a gen-AI screenshot. Discussing GitHub → the GitHub skin
  (RepoHero, CodeViewer, CodeDiff, …); Claude Code / the command line → the shell/terminal skin; a
  web app → that app's skin. Skins are the diegetic-DARK exception (real surfaces are dark — see
  Polarity balance), and they carry the constant Teardown voice (the cartridge model: same voice,
  swappable skin). Skin resolution mirrors icons/objects: use the existing skin if the registry
  has it; if the app has no skin yet, STOP and make it — often you pause a video to build the skin,
  and that pause EXPANDS the registry (blessed HTML mock → Remotion component; GitHub and shell
  already exist). Never fake a real interface.
- **The slate cut — free audio + placeholders, ALWAYS.** The GATE-P review cut is never silent
  and never blocked. It ALWAYS mixes the free Kokoro narration (already generated — zero spend),
  and it ALWAYS stands a placeholder / request card in for any media not yet supplied (a missing
  pantry still, an unbuilt beat). There is no paid audio engine any more
  (ElevenLabs removed 2026-09-03), so **all narration is free Kokoro and always goes into the slate.**
  Missing media never stops the cut — it becomes a placeholder the human reviews around and swaps
  the real asset in later (the shopping-list convention). A watchable slate — sound + placeholders
  — is the entire point of the review pass; a silent slate, or one that halts because a still
  isn't ready, defeats it. (Real assets still replace their placeholders before `art final`.)

- **Beat 2 = the executive summary (context + stakes), ALWAYS.** The failure across nearly every
  reel is diving from the intro straight into details. Fix it structurally: after the cold-open
  hook, the SECOND beat states the whole idea in one breath for a **smart non-technical viewer** —
  *what is this video about, and why do I care* — before any specific. It's the advance organizer:
  the frame the details hang on. It states the idea WITHOUT spending the reveals (the body still
  earns them), and it pairs with the closing verdict recap — gist up front, gist at the end,
  details between — so a viewer who leaves after thirty seconds still leaves with the point.
  Applies to every explainer (ai-explainer chassis and all its children); the only exception is a
  reel whose cold open already IS the whole idea.
  **It is written, not shown.** Beat 2 renders as `BrutalistHesitantWriter` — the overview typed
  on screen, reconsidered, and corrected — not as a static framing card. The word the writer fixes
  must be the reel's real misconception, so the correction does pedagogical work rather than
  decorating the beat. See the EXECUTIVE-SUMMARY LAW in `skills/make/ai-explainer/SKILL.md` for the
  authoring and timing contract.

## 2. Bass register — SCOPED SKIN (stings / intros / transitions only)

A genuinely different grammar with its own timing law. Never the body of an explainer, never
wearing the Claude bookends or mascot outro. Use deliberately.

- **Shape-as-actor** — silhouette stands in for narrative content, not decoration. Gestalt-closure
  test: if a viewer can't complete the implied form in under a second, it's too abstract or too
  literal.
- **Geometric abstraction of theme** — the shape IS the metaphor (spiral = obsession, jagged wedge
  = rupture). Design one central motif; cycle it through grammatical roles (incision, cluster,
  divider, constructor, overstrike), don't just repeat it.
- **Flat, saturated, limited palette** — 2–4 colors + black, chosen for max figure/ground contrast.
- **Kinetic type as structure** — per-letter shape layers, sliced/obscured/reassembled by other
  shapes. At least one type↔shape metamorphosis per sequence.
- **Hard cuts / clip-path wipes, never crossfades.**
- **Percussive timing** — cue-point driven (onset detection), lands on downbeats. Legibility holds
  after impact (1–2 frames). Two velocity profiles: linear wipes (zero easing) vs asymmetric
  two-frame snap. Deliberate 1–3px misregistration on impact frames only (never continuous).
- **The collision:** Bass hard-cut/no-easing directly opposes the Claude soft-warm register. They
  never mix inside one piece.

## 3. Lane-agnostic validators — the engineering

Same standard as Manim: deterministic, checkable, fails loudly. These apply to any lane.

- **Contrast: compute it.** WCAG relative-luminance ratio when locking a palette — never assert a
  ratio as flavor text.
- **Palette-clamp** any generated (Higgsfield) frame to the locked palette before it enters the
  timeline. Catches color drift frame-by-frame can't.
- **Timing off cue points**, not uniform `run_time` / evenly spaced frames (onset / beat /
  narration stress → transforms).
- **Composition constraint** — explicit negative-space / frame-coverage field in the shot schema
  (~15–35%), validated before render.
- **Motion budget** — one dominant mover + ≤2 subordinate, per scene. A validation rule, not a vibe.
- **Determinism** — seed randomness once (per slug), never `Math.random` per frame.
- **Shot schema as a real JSON Schema** — palette membership, coverage %, motion budget, transition
  type checked before a shot renders.
- **Higgsfield negative-prompting** — Claude: against robot/circuit/neon/hologram; Bass: against
  gradient/drop-shadow/soft-shading. Condition on a flat-vector reference from our own pipeline,
  not a photo.

## 4. Sourcing honesty (a design principle — these specs invite fabrication)

- **Separate VERIFIED from INFERRED.** Verified Claude identity (Geist case study +
  `anthropics/skills` brand-guidelines): palette, type pairing, wordmark-led logo, human/abstract
  illustration. Inferred / unverified: exact motion choreography, frame-perfect cue tables, named
  slash symbolism, per-color contrast ratios, attributed Bass quotes.
- **Never ship invented quotes, invented hexes, or frame-exact tables presented as sourced.**
  Compute what's checkable (contrast); label the rest a production template, not film history.

## Precedence
CLAUDE-BRAND / VOICE-LOCK / OUTRO-LOCK win on their specifics. This doc governs the design grammar
and the validators, and is the source of truth for the canonical palette resolution above.
