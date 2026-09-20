# brutalist — the pared-down video toolkit

Three skills. Two personas. Two voices. Zero API keys.

This is the simplified cut of `brutalist-art/`. Everything paid, everything
publishing-related, and every skill that doesn't directly serve the three
builders below has been removed. What's left builds complete, Claude-branded
explainer videos end to end — for free, locally.

---

## 1. What is Brutalist?

You can ask an AI to make a whole video in one click, and most of the time
what comes back is slop — clean, rendered, and dead on arrival. The asymmetry
that explains it: **Claude cannot watch the video.** It has never sat in the
audience, so it can't tell whether a joke lands or whether the idea clicked.
Taste isn't a step it does slowly — it's a step it can't do at all.

But flip it around: Claude is superhuman at the build. It writes Remotion and
Manim faster and more correctly than you ever will. A human spending twenty
hours hunting a render bug is twenty hours thrown away.

Brutalist holds the line between those extremes: **you are the conductor.**
You decide what the piece is, you listen for the wrong note, you own the
result. The machine performs every part on request, one beat at a time.

How that works in practice: every video is a **beat sheet**
(`beat_sheet.json`) — one beat per moment; everything else is derived from
it. The pipeline is **audio-first**: narration MP3s are generated and
*measured* first, and those real durations become the master clock every
visual conforms to. Never fix timing by hand — regenerate audio, recompile.
Then **fill-in**: the machine renders every beat it can (Manim, Remotion,
cards); beats it honestly can't make render as labeled **slates** — request
cards naming exactly what's needed. You drop the real thing into `pantry/`
and rebuild; only the changed slot recompiles. The first compile is always a
watchable previz. Nothing here ever publishes — the master stays in the reel
folder, and putting it in front of an audience is a human decision.

```
IDEAS → SCRIPT/BEATS → AUDIO (the clock) → VISUALS → ASSEMBLE/QC → done
```

## 2. Install

```bash
cd books/brutalist
./setup --install     # Python deps + Remotion node deps, then a readiness table
./setup               # re-check any time (aka ./art doctor)
```

What you need on the machine: `python3` (3.10+), `ffmpeg`, Node ≥ 20, and —
only for Manim equation beats — a LaTeX with `dvisvgm` (MacTeX / TeX Live).
The Kokoro voice model (~340MB) **ships inside this toolkit** at
`runtime/models/kokoro/` — no download, no account, no key. There is no
`.env` because there is nothing to put in one.

Sanity check the voice engine:

```bash
python3 runtime/scripts/generate_audio_kokoro.py --list-voices | grep -E 'bella|onyx'
```

### The two voices, the two personas

| Voice | Kokoro code | Persona | Register | Channel chip |
|---|---|---|---|---|
| **Onyx** | `am_onyx` | `nbb` (and Liam-in-for-Bear, the working default) | Teardown — take it apart, judge the design | `@NikBearBrown` |
| **Bella** | `af_bella` | `hai` | Plain — simple and direct; method, when to use it, when NOT to | `@HumanitariansAI` |

Set per reel in `beat_sheet.json` metadata (`"engine": "kokoro",
"voice_kokoro": "am_onyx"`), or per beat with `beat.voice`. Any other voice
code is rejected by the audio script. When Liam (Onyx) narrates the
@NikBearBrown channel, the IN-FOR-BEAR LAW applies: B00 says "…this is Liam,
in for Bear." and the outro signs off the same way.

The persona skills — `skills/make/nbb/` and `skills/make/hai/` — take any
existing reel and produce a register-rewritten, re-voiced variant in a new
`nbb-`/`hai-` directory (scaffold: `python3 runtime/scripts/brand_variant.py
<reel> nbb|hai`). The source reel is never modified.

## 3. The three skills

All three share one skeleton — the Claude-branded bookends — and differ only
in the middle. Cold open on the Claude composer (`ClaudeComposerAsk`, the ask
lands answered) → the body → verdict recap → YOUR TURN handoff (a suggested
prompt, read aloud and discussed) → title-restate outro. All three are
audio-first, phase-gated, and none of them ever publishes.

### ai-explainer — the tight reel

The middle is a **vox-style explainer**: whatever media teaches the concept —
Manim fragments for math, Remotion rhetorical patterns and concept
illustrations, Onda code-blocks for code. The ILLUSTRATE LAW keeps the Claude
UI honest: the interface appears only where the interface is the subject;
every other beat illustrates its concept. Use it when the source is **one
insight** that a 1–3 minute reel can land.

```bash
./art ai-explainer --help     # the full law
```

### cli-explainer — the build reel

The middle is the **build-with-Claude loop**: show the prompt (and discuss
it) → show the ACTUAL code it generated (`ClaudeCodeBeat`) → show the output
as a MOVING visualization — then at least one revision cycle (check, change,
better output). The through-line is *problem → build → run → check → change →
what it means*. THE ACTUAL-CODE LAW: real source trimmed to the lines that
teach, never pseudocode. Output beats are motion (Manim / Remotion / d3 /
screen capture), never a still. Use it when the source is **a thing you
built**.

```bash
./art cli-explainer --help
```

### deep-explainer — the documentary episode

The 5–10 minute cut on the ai-explainer chassis. The body is Manim and
Remotion, plus **VOX beats** — human-supplied stills from `pantry/`, animated in
the cutout grammar (Ken Burns, cutout springs, parallax, draw-on). Per **VOX
LAW** a still is used only where it IS the evidence — the actual record, the
real document — never as texture, and there is no target percentage. Two extra hard gates: the first compile is a full-length
**slate previz**, and a duration-locked, tier-tagged **SHOPPING.md** for
pantry stills is written after audio lock — never before. Use it when the
concept is **multi-act** (a chapter, a framework, a long research doc).

```bash
./art deep-explainer --help
```

Supporting doctrine the three builders inherit (kept, but not entry points):
`skills/make/explainer/` (the parent chassis — MOTION.md, EQUATIONS.md,
REMOTION.md, the slot/pantry/slate contracts), `skills/make/your-turn/` (the
closing three-beat standard), `skills/make/duration-planner/` (duration is an
output, never a target).

## 4. Build any reel (the loop is always the same)

```bash
# 1. author beat_sheet.json in <book>/youtube/<slug>/   (the skill's SKILL.md governs)
python3 runtime/scripts/generate_audio_kokoro.py <reel>     # 2. audio = the clock
./art run  <reel>                                           # 3. compile the review cut
./art todo <reel>                                           # 4. what still needs filling, and how
#    …drop media into pantry/, rerun — only changed slots recompile…
./art final <reel>                                          # 5. clean master (<slug>-cut.mp4)
```

Videos belong to their book: build into `<book>/youtube/<slug>/`, never into
this toolkit folder.

## 5. The worked examples — two per skill

Six real reels, copied with their complete build paperwork (beat sheet, build
prompt, gates, captions) but without rendered media — every one of them
rebuilds with the loop above, for $0.00. Read them in this order: the beat
sheet beside its BUILD-PROMPT.md, then the gate files.

### ai-explainer

**`examples/ai-explainer/claude-liam-algorithmic-art/`** — *"Claude, Seeded."*
(12 beats). The house exemplar of the skill-teardown modifier: an explainer
ABOUT Anthropic's algorithmic-art skill where every major visual was
generated by FOLLOWING the skill it explains (seeded flow fields, the 3×3
seed grid). Study how each ASK→RESULT pair reads as a receipt, and how
SOURCES.md logs every seed. The `.srt` shows captions riding measured beat
windows.

**`examples/ai-explainer/claude-debunked/`** — *"Claude, Debunked?"*
(10 beats). A myth-versus-mechanism reel. This one keeps its full build
paperwork: `PEDAGOGY.md` (narration sign-off), `NARRATION-GATE-P.md` (the
narration review record), and `FACTCHECK-THE-FACTCHECK.md` — the DOUBLE-CHECK LAW
applied to its own fact-check. `qc-sheet.png` is the visual-QC contact sheet.
The cleanest model of the phase gates working as designed.

### cli-explainer

**`examples/cli-explainer/claude-liam-terminal-screencast/`** — *"Claude,
Typed."* (11 beats). The meta-example: a CLI video about making CLI videos.
The full required spine in one small reel — INTRO → PROBLEM → CLI → CODE →
OUTPUT → revision cycle → SUMMARY → NEXT STEPS → OUTRO — with the Claude-skin
composer beats and a `PEDAGOGY.md` narration sign-off.

**`examples/cli-explainer/brand-palette-accessibility-auditor/`** — a real
build reel from the branding-and-ai book (10 beats): Claude builds a WCAG
contrast auditor for brand palettes. Includes `scenes.py` — the actual Manim
source for its OUTPUT beats — so you can see THE ACTUAL-CODE LAW and the
moving-output rule together: prompt → real code → animated result.

### deep-explainer

**`examples/deep-explainer/claude-liam-dashboard-that-lied/`** — *"The
Dashboard That Lied"* (33 beats), from the computational-skepticism book. A
full episode with the genre's whole paper trail: `FACTCHECK.md` (claim |
verdict | source | fix), `SHOPPING.md` (the duration-locked, tier-tagged
pantry manifest — note every motion asset asks for MORE seconds than its
beat), `SHOTLIST.md`, and a BUILD-LOG with gate signatures.

**`examples/deep-explainer/claude-liam-fluency-trap/`** — *"The Fluency
Trap"* (36 beats). Same contract, second data point — compare its lane
histogram (vox/manim/remotion mix) and its vox-run handoff blocks against
dashboard-that-lied to see what stays fixed across episodes (the quota, the
gates) and what flexes (act structure, run placement).

## 6. What was removed (and where it still lives)

Relative to `brutalist-art/`: every paid image/video engine (Suno,
Higgsfield/Minimax, fal), all publishing (YouTube API, channel credentials,
video-inventory), the other ~35 skills (scouts, music/dance/lyric tools,
asset generation, lectures, showcases, brand channels medhavy / musinique /
neu / codex), the mascot outro stage, and every root-level campaign prompt
doc. The full toolkit is untouched at `books/brutalist-art/` — anything
removed here still works there. This folder never needs an API key; if a
script ever asks for one, that's a bug.
