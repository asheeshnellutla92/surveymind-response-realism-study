---
name: nbb
description: >
  Create a NikBearBrown (NBB) beat sheet from any input — a reel folder,
  a lecture folder, or a book (batch: every reel/lecture it contains). Writes
  into a new nbb- directory; the source is never modified. Rewrites narration in
  the Teardown register (take it apart, explain how each piece works, judge the
  design choices — Feynman × MKBHD), inserts an LLM exercise as the
  second-to-last beat (paste-ready prompt + dig-deeper follow-up), and ends with
  the NikBearBrown outro. Voice: LIAM — Kokoro am_onyx, free and local, Liam in
  for Bear (IN-FOR-BEAR LAW). There is no paid voice; ElevenLabs was permanently
  removed 2026-09-03. Palette: teardown (white
  #FFFFFF / ink #2A1A0E / one red #C8102E).
  Use when the user types `nbb [input]`, asks for the NikBearBrown / brutalist /
  teardown cut of a reel, or wants the default-channel version of content.
  Brand spec: brands/nbb.md.
---

# nbb — the NikBearBrown cut

Creates a **new `nbb-` directory** from any source input and writes the NBB beat
sheet as `beat_sheet.nbb.json` inside it. The canonical source (`beat_sheet.json`,
build scripts, media) is **never modified**.

## Trigger

```
nbb [input]
```

`[input]` is one of:
- **Reel folder** — `[book]/youtube/[slug]/` (has `beat_sheet.json`)
- **Lecture folder** — `[book]/lectures/[chapter]-lecture/` (has `beat_sheet.json`)
- **Book folder** — `[book]/` → batch: convert every reel + lecture it contains

## Output directory convention

| Source path | nbb- output directory | Beat sheet filename |
|---|---|---|
| `[book]/youtube/[slug]/` | `[book]/youtube/nbb-[slug]/` | `beat_sheet.nbb.json` |
| `[book]/lectures/[chapter]-lecture/` | `[book]/nbb-lectures/[chapter]-lecture/` | `beat_sheet.nbb.json` |

Inside that `nbb-` directory:
- `beat_sheet.nbb.json` — the NBB cut
- Lecture build scripts copied from source: `build_deck.py`, `make_audio*.py`, `render.py`
- When building, point those scripts at `beat_sheet.nbb.json` (pass as argument, or
  create a `beat_sheet.json → beat_sheet.nbb.json` symlink in the nbb- dir)

---

## Flow (per reel or lecture)

### Step 1 — Scaffold (deterministic, no spend)

```bash
python3 runtime/scripts/brand_variant.py [INPUT_PATH] nbb
```

Creates the `nbb-` directory and writes `beat_sheet.nbb.json` with audience
metadata pre-set and a `_variant_todo` checklist. For lectures, copies build
scripts from the source dir. No API calls, no spend.

**What the script sets:**
```json
{
  "audience": "NikBearBrown",
  "engine": "kokoro",
  "voice_kokoro": "am_onyx",
  "palette": "teardown",
  "typography": { "display": "Montserrat", "serif": "EB Garamond", "mono": "PT Mono" },
  "register": "Teardown",
  "outro_source": "AUTHOR.MD :: NikBearBrown",
  "derived_from": "beat_sheet.json"
}
```

### Ask/intro scene rule (2026-07)

The ASK / intro beat of every NBB (and claude-brand) beat sheet renders with
**`ClaudeComposerAsk`** (`runtime/remotion` — the Claude desktop composer, cream
page, terracotta spark, `@NikBearBrown` folder chip; comps `ClaudeComposerAsk` /
`ClaudeComposerAsk916`). Same prop contract as the old scene — swap the scene
name, keep the props. `NikBearBrownTerminalAsk` (dark Onda-style terminal) is
**legacy**: keep it registered so historical reels re-render identically, but do
not use it for new beat sheets.

### Step 2 — Rewrite the register (Teardown)

Open the new `nbb-[…]/beat_sheet.nbb.json` and **rewrite every beat's narration**
in the Teardown register (`prose/teardown/PROSE.md`, `brands/nbb.md`):

- **Take it apart**: explain how each piece actually works — the machinery, not
  just the name. Strip jargon, reveal the mechanism.
- **Reveal the design philosophy**: what was this optimized for? what does that
  choice sacrifice? "They chose X over Y" tells you priorities.
- **Judge the design choices**: evaluate whether they succeed on their own terms —
  intellectual honesty, not boosterism; name the trade-offs.
- Feynman's honesty ("I don't fully understand why this works… but in the context
  of the whole system, it makes sense") + MKBHD's design-critic lens ("After two
  weeks, does this choice still make sense?").
- **Change the voice, not the facts.** No fabrication.

Forbidden phrases: "One could argue…" / "It seems as though…" / "innovative" without
saying what changed / specs without context. Instead: "Here's what's actually
happening…" / "They optimized for X at the expense of Y" / "This works if you
value X; it fails if you need Y."

For **reel** format: rewrite `beats[*].narration_text`.
For **lecture** format: rewrite `segments[*].beats[*].text`.

Preserve beat/segment IDs, act structure, visuals, and on-screen card copy where
it still fits the Teardown register.

### Step 3 — LLM exercise (SECOND-TO-LAST beat)

Insert **one beat** before the outro: a **ready-to-paste LLM prompt** derived from
the whole video's subject, using the `/mega` skill's logic (designed to paste
directly into Claude, ChatGPT, or Gemini — not a CLI command).

The beat has two parts:

1. **The LLM prompt** — a paste-ready block the viewer can run in any frontier
   LLM today. Well-crafted context + a specific, genuinely answerable question.
   The prompt should produce a useful output on its own, without the video.
2. **The dig-deeper prompt** — a follow-up question that pushes the viewer to
   explore the topic further. A genuinely useful next question, not a summary.
   Present as: *"Go deeper: [question]."*

**Beat schema:**

```json
{
  "beat_id": "B_LLM",
  "act": "LLM EXERCISE",
  "narration_text": "Here is a prompt you can paste directly into Claude, ChatGPT, or Gemini. … Go deeper: [follow-up question].",
  "llm_exercise": {
    "prompt": "I want to understand [topic]. [2-3 sentences of context]. [Specific question that produces a useful output].",
    "dig_deeper": "Go deeper: [A follow-up question the viewer can explore on their own.]"
  },
  "shot": { "type": "CARD", "source": "own", "motion": "hold" }
}
```

The card renders in the **teardown palette** (white / ink / red) and the
narration is read by **Liam, in for Bear (Kokoro `am_onyx`)** — the same voice
as every other claude-liam reel. Liam says so out loud in the cold open and signs
off the same way; he never imitates Bear or claims to be him (IN-FOR-BEAR LAW).

### Step 4 — Outro (LAST beat)

Add/replace the final beat with the **NikBearBrown outro**. Content from the
`NikBearBrown` section of the book's `AUTHOR.MD` (default channel:
`www.brutalist.art`). Renders via Remotion `OutroSeries` / `OutroCTA` in the
teardown palette.

### Step 5 — Verify ending order

Confirm the beat sequence closes as:

```
… Teardown body beats …
[LLM exercise + dig-deeper prompt]     ← second-to-last
[NikBearBrown outro]                   ← last
```

---

## Batch mode (book input)

When `[input]` is a book folder, run the scaffold for every source:

```bash
# Reels
find [book]/youtube/ -maxdepth 1 -mindepth 1 -type d ! -name 'nbb-*' | \
  while read d; do python3 runtime/scripts/brand_variant.py "$d" nbb; done

# Lectures
find [book]/lectures/ -maxdepth 1 -mindepth 1 -type d -name '*-lecture' | \
  while read d; do python3 runtime/scripts/brand_variant.py "$d" nbb; done
```

Then perform Steps 2–5 for each resulting `nbb-` directory.

---

## Build (only when the user also asks to build)

```bash
# Audio (Kokoro am_onyx — free and local)
python3 runtime/scripts/generate_audio_kokoro.py [nbb-dir]

# Lectures: deck + render (scripts point at beat_sheet.nbb.json)
python3 [nbb-dir]/build_deck.py beat_sheet.nbb.json
python3 [nbb-dir]/render.py beat_sheet.nbb.json

# Compile (reels)
python3 runtime/scripts/compile.py [nbb-dir] --height 1080
```

---

## The teardown palette

Minimalist, single accent:

| Role | Hex | When |
|---|---|---|
| CREAM / ground | `#FFFFFF` | flat white — never cream, never warm paper |
| INK | `#2A1A0E` | all body text / marks |
| TEAL (= INK) | `#2A1A0E` | good/kept — PLAIN INK; label + position carry meaning |
| CRIMSON | `#C8102E` | bad / lost / broken — the **one** accent |
| SLATE | `#545454` | structure / entity cards / axes |
| GOLD | `#F6D8DC` | highlighter fill only (never text) — ~14% wash of the accent |
| HAIRLINE | `#D4D4D4` | dividers, card borders |

**Color law:** red is the ONE accent. Good/kept is plain ink — never a second
hue. Position + explicit label carry meaning; color only reinforces.

Typography — teardown house type: **Montserrat** (display/titles/tracked caps) +
**EB Garamond** (serif/editorial moments) + **PT Mono** (data numbers/math).
Tokens: `runtime/remotion/src/tokens/vox.ts` (exported as `teardown`).

---

## Standing rules

- Source files (`beat_sheet.json`, build scripts, media) are **never modified**.
- Voice: Kokoro `am_onyx` — **Liam, in for Bear**. Free and local. No paid engine
  exists; ElevenLabs was permanently removed 2026-09-03.
