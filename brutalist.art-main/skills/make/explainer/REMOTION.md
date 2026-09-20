# The Remotion assembly plane — spec (v1, not yet built)

Workflow step 7 (`assemble`) in SKILL.md. This file is the rule owner for the
plane; SKILL.md points here. MOTION.md §7 owns the annotation motion language;
this file owns the machinery that renders it.

## What the plane is

A word-keyed OVERLAY FRAGMENT RENDERER. It reads the beat sheet, the word
clock, and a per-reel `annotations.json`, and renders transparent per-beat
overlay clips that `vox_compile.py` composites at assembly. It expresses the
two shot types that currently degrade to clean plates (DOCUMENT, COMPOSITE),
upgrades the equation tangent's static spotlight to word-keyed advancement,
sets kicker typography, and renders the auto-credits block from sidecars.

## What the plane is NOT

- NOT the assembler. ffmpeg (`vox_compile.py`) remains the assembler. The
  rejected alternative — Remotion imports the cut and renders the master —
  was rejected because it breaks the slot contract: any media swap would
  re-render the whole film through a browser, and Gate B would go blind.
  Overlay fragments ARE slots; the contract extends, nothing is replaced.
- NOT captions. THE CAPTION POLICY (MOTION.md) stands: explainers ship SRT
  sidecars to the platform, never burn-ins. Karaoke is a DERIVATIVE (below),
  not plane scope.
- NOT treatment. The newsprint launder happens at conform, per source,
  before the plane ever sees a frame.
- NOT a re-edit surface. The plane never changes timing, order, or duration.
  Audio remains the master clock.
- It never writes into `clips/` (machine-owned, clean) or `media/` (yours).

## The word clock (`scripts/vox_align.py` — build first)

Port of `skills/deck-lecture/scripts/align_captions.py` (itself the muzak
lyric aligner): narration text is KNOWN — the TTS already synthesised it — so
faster-whisper supplies word-level TIMING and we sequence-align the known
words onto it; missed words interpolate between anchors. Exact text, no
drift, free, local.

- Runs at audio lock (workflow step 3), immediately after
  `generate_audio_kokoro.py`. Rerun whenever any beat's mp3 regenerates.
- Reads `beat_sheet.json` (narration_text + audio_file per beat), writes
  `reels/<slug>/mp3/words.json`:

```json
{ "fps": 24,
  "beats": { "T01": [ {"text": "The", "startFrame": 0, "endFrame": 6}, … ] } }
```

- Frames are BEAT-LOCAL at the film fps (vox renders at 24, not the
  deck-lecture 30 — parameterized).
- Consumers besides the plane: `vox_emit.py` upgrades SRT cue timing from
  beat windows to word-grouped lines where words.json exists; the karaoke
  derivative reads the same file. One clock, three consumers.
- Fallback: no faster-whisper → plane refuses word-keyed tracks, accepts
  beat-window tracks (`at: "beat"`), warns loudly. Never estimate from word
  count.

## `annotations.json` — the authoring surface

Per reel, human-authored (agent may draft at plan time; SHOTLIST carries the
intent). One entry per annotated beat; beats absent from the file get no
overlay and cost nothing.

```json
{
  "B06": {
    "tracks": [
      { "kind": "highlight",
        "words": ["matter", "waves"],          // keys into words.json
        "region": [0.22, 0.41, 0.55, 0.47],    // x0 y0 x1 y1, 0–1 frame coords
        "color": "highlighter" },
      { "kind": "ring", "at": "word:diffraction",
        "region": [0.61, 0.30, 0.78, 0.44], "color": "annotation" },
      { "kind": "push", "after": "ring",       // soft camera push into region
        "region": [0.55, 0.25, 0.85, 0.50] }
    ]
  },
  "T02": { "tracks": [ { "kind": "spotlight",
    "targets": [ {"sym": "λ", "word": "wavelength"},
                 {"sym": "p", "word": "momentum"},
                 {"sym": "h", "word": "Planck's"} ] } ] },
  "B13": { "tracks": [ { "kind": "kicker",
    "name": "Louis de Broglie", "dates": "1892–1987",
    "line": "He proposed it in a doctoral thesis. The committee asked Einstein." } ] }
}
```

Track vocabulary (v1 — everything else is out of scope until a film demands
it):

| kind | is | motion law (MOTION.md §7) |
|---|---|---|
| `highlight` | golden highlighter sweep across a document region | sweep lands ON the keyed word; constant velocity |
| `underline` | hairline draw-on under a region | stroke DRAWS, never fades |
| `ring` / `strike` | hand-drawn terracotta/yellow ellipse or X | draw-on; one editor's-pen voice per graphic |
| `push` | soft zoom into the annotated region | a cut without cutting; follows a draw track |
| `spotlight` | equation-tangent crimson advancement | symbol turns crimson in equation + glossary + example AS its word is spoken; upgrades the static `viz.spotlight` |
| `kicker` | serif name + hairline + dates + the one line | design system only; timing from words.json |
| `credits` | auto-block from `media/*.source.txt` | shares `vox_emit.credits_block()`; never hand-authored |

All colors are token NAMES (`highlighter`, `annotation`, `data[0]`…) resolved
from the beat sheet's metadata — the plane owns no palette.

## The slot contract, extended

```
reels/<slug>/
  overlay/            MACHINE'S — <beat>.mov (alpha, ProRes 4444 or VP9),
                      rendered by the plane. Never hand-edit; regenerate.
  annotations.json    YOURS — the authoring surface
  mp3/words.json      the word clock (vox_align output)
```

- Compile precedence gains one rule: if `overlay/<beat>.mov` exists,
  composite it over the beat's conformed clip AT ASSEMBLY — exactly where
  `--review` burns live today, and under the same law: clips/ stay clean,
  clean master = same assembly, overlays included, no review burn.
- Hash discipline: overlay hash = (annotations.json entry + that beat's
  words.json slice + design tokens + plane version). Only changed overlays
  re-render; `vox_run` triggers the plane after Gate B, before compile.
- A beat with an annotations entry but a missing/stale overlay is a REVIEW
  finding, not a silent skip — the compiler warns like it warns slates.

## Remotion project layout

```
aspects/explainer/vox-explainer/remotion/   one project, all reels
  src/tracks/{Highlight,Ring,Push,Spotlight,Kicker,Credits}.tsx
  src/tokens.ts        generated from beat sheet metadata at render time
  render.mjs           CLI: node render.mjs <reel-dir> [--beat B06] [--height 1920]
```

The project is a dependency of the pipeline, not of any reel. Node modules
are a build-machine concern; the sandbox authors annotations.json and the
user's Mac renders (same split as Manim/paid steps today: absolute-path
commands handed to the user, `open` on outputs).

## Shorts

The Shorts law applies unchanged: annotations are RE-AUTHORED per aspect,
never scaled. `short/annotations.json` is its own file (16:9 side-by-side
regions re-band top-and-bottom); `vox_short.py` copies the master's entries
as a starting draft with regions flagged `needs_review`. Render with
`--height 1920` against the short's beat sheet.

## QC — Gate B extension

Gate B audits COMPOSITED frames (conformed clip + overlay) at each track's
landing moment (the keyed word's midframe), not overlay frames alone —
overlap against the plate is the thing that can go wrong. Annotation strokes
are intentional by declaration (the annotations.json entry IS the
declaration — the audit exempts declared regions, flags strokes outside
them, and keeps the ≥25% text-on-text rule everywhere else). Authoring
preflight (open item #1) checks declared regions against safe areas
render-free before any of this runs.

## The karaoke derivative (NOT plane scope — recorded here to stay settled)

`scripts/vox_karaoke.py <reel> [--style kids|poetry]` — a separate,
human-invoked derivative like `vox_short.py`. Burns word-synced captions
from the SAME words.json into its own output file (`<slug>-karaoke.mp4`).
Never a default, no genre heuristics, no flag in the beat sheet: the human
knows when a kids/literacy/language-learning version is warranted. Sidecar
SRTs still ship on every surface regardless — the platform caption is the
accessibility path; karaoke is a teaching artifact.

## Build order

1. `vox_align.py` + words.json (also upgrades vox_emit SRTs — value ships
   before any React is written).
2. Remotion project + `highlight`/`ring`/`push` tracks → the DOCUMENT beat
   in vox-ultraviolet-catastrophe (B-roll exists; first real render target).
3. Compile precedence + hash + Gate B composited audit.
4. `spotlight` (wave-function film's tangent is the first consumer),
   `kicker`, `credits`.
5. `vox_karaoke.py` — last, when a kids/poetry film actually calls for it.

Film four (THE WAVE FUNCTION, ch 3) is the acceptance test: author its plan
with DOCUMENT/COMPOSITE beats written as if the plane exists — Schrödinger's
paper and Born's probability note are exactly the artifacts the annotation
language was built for.

## Non-goals (v1)

CARD migration off Manim (works today, migrate only if typography demands),
music-film support (voiceover films first), any burn-in caption path for
explainers, cursor/UI demonstrations, treatment inside the plane.
