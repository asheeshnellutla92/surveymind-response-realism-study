# CLAUDE-BRAND.md — brand charter for the `claude` audience

The Claude cut: Brutalist explainer reels wearing the Claude desktop app's own
skin. A **fidelity brand** — the visuals replicate the real product so the
viewer is looking at the thing being taught. Skill: `skills/make/ai-explainer/` — an extension of `skills/make/explainer` (inherits Manim doctrine, slates, and the runtime belt).

## Why it exists

The channel's Claude-workflow content (Cowork, skills, CLIs, "type this, get
that") was being illustrated with a generic dark terminal. The product being
taught has its own strong visual identity; using it *is* the explanation. The
recurring shot of this brand is the composer window with a prompt typing into
it — the viewer's own first-person view of the tool.

## Palette (fixed — never retint)

| Token | Value | Role |
|---|---|---|
| PAGE | `#FAF9F5` | ground — the app's cream, never pure white |
| CARD | `#FFFFFF` | composer card, raised surfaces |
| BORDER | `#E5E2D9` | hairline borders |
| INK | `#3D3929` | primary text — warm near-black |
| INK_SOFT | `#73705F` | secondary text, chips |
| GHOST | `#A9A491` | placeholder text |
| SPARK | `#D97757` | **THE accent** — spark, `/skill` tokens, one focal moment |
| SEND | `#C6613F` | send button, deeper accent step |

Accent law: terracotta is *earned* — one orange moment per beat, same grammar
as teardown's one-red rule. Source of truth: `runtime/remotion/src/tokens/claude.ts`.

## Type

Serif (`Tiempos Text → EB Garamond → Georgia`) for greetings and segment
titles — Tiempos is proprietary, so **EB Garamond is the effective default**
(bundled in `runtime/fonts`). System UI sans for chrome and callouts; mono for
terminal output only. Segment titles are Title Case (`Photoelectric Effect`) —
never all caps, never sentence case.

## Channels — one look, many voices

The Claude skin is invariant; the channel sets voice, register, persona, and
folder chip (brand keys in `brand_variant.py`):

| Brand key | Persona | Folder chip | Voice | Register |
|---|---|---|---|---|
| `claude` | Bear | `@NikBearBrown` | kokoro am_onyx | Teardown |
| `claude-liam` | Liam (in for Bear) | `@NikBearBrown` | kokoro am_onyx | Teardown |
| `claude-hai` | HAI | `@HumanitariansAI` | kokoro am_onyx | Plain |
| `claude-medhavy` | Medhavy | `@Medhavy` | kokoro af_kore | Wonder |
| `claude-musinique` | Musinique | `@Musinique` | kokoro am_puck | Sardonic |

**Liam — the substitute narrator.** Liam is not a new channel; he is the nbb
persona's stand-in voice on the same @NikBearBrown channel (same Teardown
register, same laws, same chip), for reels where Liam's voice is the right
choice — batch runs, high-volume series. IN-FOR-BEAR
LAW: every Liam reel says so out loud — B00's narration introduces the voice
in its first breath ("… this is Liam, in for Bear.") and the outro signs off
the same way ("Liam, in for Bear."). Liam is a named voice, never a clone —
if a reel matters enough for Bear's voice, rebuild it on the `claude` default.

## The greeting

The app-style serif greeting above the composer is `<cue>, <persona>`. The cue
**defaults to a world-language hello**, rotated across reels so the channels
passively teach viewers to greet in languages from everywhere (lexicon in the
claude-explainer SKILL). Word budget: Bear → up to two words (Nǐ hǎo · Kia ora);
Liam → up to two words (same short name); Medhavy/Musinique → one (Hola ·
Jambo · Namaste); HAI → shortest forms only (Hi · Ola · Hej). Bear's hello is
`Wagwan, Bear` ~1 reel in 10 (slug character-sum mod 10 == 0) — Wagwan is
Bear's alone; Liam never takes it. Arc cues (`The ask,` · `Watch this,`) replace the
hello only when the beat earns it. `Happy Tuesday,` stays reserved for
channel-update reels.

## Scene inventory

- `ClaudeComposerAsk` / `916` (runtime/remotion) — the required ask/intro beat.
  Also the required ask beat for **nbb** going forward; the dark
  `NikBearBrownTerminalAsk` is legacy (historical re-renders only).
- Bench components (vox/remotion/_bench/onda): `claude-composer`,
  `claude-window`, `claude-callout` — plus Onda `code-block` for code, unchanged.
- Manim fragments and human screen-recordings drop into per-beat slots
  (vox-explainer slot contract).

## Cold open & outro laws

B00 is ALWAYS `ClaudeComposerAsk` — the video opens cold on the Claude UI,
never on a brand card. The outro restates the episode title (poster serif,
terracotta period) with the handle beneath — never a generic brand outro.

## Spark-line law

The spark line is TEXT. There is no spark glyph.

The eight-armed terracotta asterisk was removed from every scene on 2026-08-05
(`strip_spark.py`, 298 glyphs across 293 files, backup at
`runtime/remotion/.spark-strip-backup/`). It had repeatedly rendered at the wrong
scale — most recently filling an entire frame and burying a code card — and it was
carrying no information the serif line did not already carry. Scenes are not to
reintroduce it: not as a `<Spark/>` component, not as an inline `<svg viewBox="0 0 24 24">`
with lines radiating from `(12,12)`, not at any size. `SparkRule` (a 60x2 terracotta rule)
is a different element and is unaffected.

What the law actually requires is the LINE: inner beats carry one short serif line
summarizing the beat, the narration's key line compressed to four words or fewer.
B00's spark line is the hello greeting. Typing is a B00-only event — inner beats
show the command already typed. A beat that renders an empty spark line is the
defect the law exists to catch; a beat with no glyph is correct.

## Handoff law

The second-to-last beat is always the composer with a suggested prompt the
viewer can paste into Claude — the episode's lesson turned into their next
session. Greeting fixed to `Your turn.` (the one persona-less greeting);
typing appears in exactly two beats: cold open and handoff.

## Ask → result law

The brand's deepest habit: never show a generated graphic without first
showing the Claude prompt that made it. Composer micro-beat (the ask, real
prompt typed) → the graphic itself (the result), rendered in the episode
channel's palette. The Claude interface is not only the set — it is the
receipt. Placeholder slates (vox slot contract, inherited from `explainer`)
stand in for unfilled media: beat id + narration + `PIPELINE → fill …` pointer.

## Illustrate law (the anti-wallpaper rule)

The UI earns its beats. The Claude interface appears only where the interface
is the subject — cold open (with its RESULT lines), ask micro-beats, verdict
artifact page, handoff, outro. Every other inner beat ILLUSTRATES its concept:
an animated-deck rhetorical pattern (five shapes, `anim.json` gate, motion
must earn its place, retinted to the claude stage), a custom Remotion concept
illustration (cream stage, one accent, spark line overlaid), a Manim fragment,
or an Onda code-block for anything code. Two consecutive beats on the same
visual scheme is the smell; a reel of composer wallpaper is the failure this
law prevents.

## Signature move

Freeze the UI, annotate it: `claude-callout` boxes with draw-on arrows land one
per narration beat over a `claude-window` frame — the "Claude, oversimplified"
poster, animated and voiced. Post-ILLUSTRATE-LAW, this move is reserved for
beats where the UI itself is the thing being annotated.
