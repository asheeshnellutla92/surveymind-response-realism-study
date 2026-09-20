---
name: hai
description: >
  Create an HAI (Humanitarians AI) beat sheet from any input — a reel folder,
  a lecture folder, or a book (batch: every reel/lecture it contains). Writes
  into a new hai- directory; the source is never modified. Rewrites narration in
  the Plain register (simple and direct: method, when to use it, and when NOT to/where it
  fails), adds an optional Irreducibly-Human tangent (0–1), inserts a CLI worked
  exercise as the second-to-last beat, and ends with the Humanitarians AI outro.
  Persona / voice: Kore with Kokoro af_kore. Palette: humanitarians
  (EB Garamond / Montserrat).
  Use when the user types `hai [input]`, asks for the Humanitarians / practitioner
  cut, or wants content for HAI Fellows. Brand spec: brands/hai.md.
---

# hai — the HAI (Humanitarians AI) cut

Creates a **new `hai-` directory** from any source input and writes the HAI beat
sheet as `beat_sheet.hai.json` inside it. The canonical source (`beat_sheet.json`,
build scripts, media) is **never modified**.

## Trigger

```
hai [input]
```

`[input]` is one of:
- **Reel folder** — `[book]/youtube/[slug]/` (has `beat_sheet.json`)
- **Lecture folder** — `[book]/lectures/[chapter]-lecture/` (has `beat_sheet.json`)
- **Book folder** — `[book]/` → batch: convert every reel + lecture it contains

## Output directory convention

| Source path | hai- output directory | Beat sheet filename |
|---|---|---|
| `[book]/youtube/[slug]/` | `[book]/youtube/hai-[slug]/` | `beat_sheet.hai.json` |
| `[book]/lectures/[chapter]-lecture/` | `[book]/hai-lectures/[chapter]-lecture/` | `beat_sheet.hai.json` |

Inside that `hai-` directory:
- `beat_sheet.hai.json` — the HAI cut
- Lecture build scripts copied from source: `build_deck.py`, `make_audio*.py`, `render.py`

---

## Flow (per reel or lecture)

### Step 1 — Scaffold (deterministic, no spend)

```bash
python3 runtime/scripts/brand_variant.py [INPUT_PATH] hai
```

Creates the `hai-` directory and writes `beat_sheet.hai.json` with audience metadata
pre-set and a `_variant_todo` checklist. For lectures, copies build scripts from
the source dir. No API calls, no spend.

**What the script sets:**
```json
{
  "audience": "HAI",
  "persona": "Kore, in for Humanitarians AI",
  "engine": "kokoro",
  "voice_kokoro": "af_kore",
  "palette": "humanitarians",
  "typography": { "serif": "EB Garamond", "sans": "Montserrat" },
  "register": "Plain",
  "outro_source": "AUTHOR.MD :: Humanitarians AI",
  "derived_from": "beat_sheet.json"
}
```


### Step 2 — Rewrite the register (Plain)

Open the new `hai-[…]/beat_sheet.json` and **rewrite every beat's narration**
in the Plain register (`prose/plain/PROSE.md`, `brands/hai.md`):

- Lead with **method**: what it is, what it produces.
- State clearly **when to use it** — the decision trigger.
- Required: **when NOT to and where it fails** — the AI main event for
  busy practitioners. This is not hedging; it is the diagnostic the audience
  needs. Do not skip.
- Efficient; no personality tax; no academic hedging; no vacuous caveats.
- **Change the voice, not the facts.** No fabrication.

For **reel** format: rewrite `beats[*].narration_text`.
For **lecture** format: rewrite `segments[*].beats[*].text`.

Preserve beat/segment IDs, act structure, visuals, and on-screen card copy
where it still fits the new register.

### Step 3 — Irreducibly-Human tangent (0–1 per video)

If — and **only** if — a clean opportunity appears, add **one** bounded aside
with a re-entry cue:

> *"This the AI does well. This is the human's — it cannot be handed off."*

A decision boundary, not a sermon. **Most reels get none.** Do not force it.

### Step 4 — CLI worked exercise (SECOND-TO-LAST beat)

Insert **one beat** before the outro. Derive it from the whole video's subject
using cli-scout logic (`skills/make/cli-scout/SKILL.md`):

1. **Classify lane:**
   - **BUILD** — quantitative, computable: "Build/measure/simulate X with Claude Code."
     Output = a plot, table, sim, or number.
   - **RESEARCH** — synthesis/evidence-based: "Research/investigate X with Claude."
     Output = a sourced brief, timeline, comparison, or annotated figure.

2. **Write the exercise:**
   - Paste-ready `claude "…"` **ASK** that a practitioner can run today.
   - **OUTPUT** — what the run produces (concrete description).
   - One **CHANGE** — a single diff that deepens or stress-tests the result.
   - **OUTPUT 2** — what the revised run produces.
   - **NEXT STEP** = "Run it on your own `[data/question]`." — always concrete.
   - Genuinely runnable. Not illustrative. Not synthetic.

3. **Beat schema:**

```json
{
  "beat_id": "B_CLI",
  "act": "WORKED EXAMPLE",
  "narration_text": "Here is what this looks like in a real session. …",
  "cli_exercise": {
    "lane": "BUILD",
    "ask": "claude \"Simulate EPR accumulation for 30 nm vs 150 nm liposomes …\"",
    "output_description": "A two-column table: particle size, % injected dose/gram, rim vs core ratio.",
    "change": "Add --tumor-permeability low to stress-test the result.",
    "output2_description": "Same table with low-permeability column appended; the size advantage collapses.",
    "next_step": "Run it on your own particle design and actual ICP-MS accumulation data."
  },
  "shot": { "type": "TERMINAL", "source": "own", "motion": "type" }
}
```

Reference: `skills/make/cli-scout/SKILL.md` (lane classification + card schema),
`skills/make/cli-explainer/SKILL.md` (beat format, fixed spine).

### Step 5 — Outro (LAST beat)

Add/replace the final beat with the **Humanitarians AI outro**. Content from the
`Humanitarians AI` section of the book's `AUTHOR.MD`. Renders via Remotion
`OutroSeries` / `OutroCTA` in the humanitarians palette.

### Step 6 — Verify ending order

Confirm the beat sequence closes as:

```
… Plain body beats …
[optional Irreducibly-Human tangent]
[CLI worked exercise]          ← second-to-last
[Humanitarians AI outro]       ← last
```

---

## Batch mode (book input)

When `[input]` is a book folder, run the scaffold for every source:

```bash
# Reels
find [book]/youtube/ -maxdepth 1 -mindepth 1 -type d ! -name 'hai-*' | \
  while read d; do python3 runtime/scripts/brand_variant.py "$d" hai; done

# Lectures
find [book]/lectures/ -maxdepth 1 -mindepth 1 -type d -name '*-lecture' | \
  while read d; do python3 runtime/scripts/brand_variant.py "$d" hai; done
```

Then perform Steps 2–6 for each resulting `hai-` directory.

---

## Build (only when the user also asks to build)

From the `hai-` directory, build is audience-namespaced:

```bash
# Audio (Kokoro af_bella — free and local)
python3 runtime/scripts/generate_audio_kokoro.py [hai-dir]

# Lectures: deck + render from the copied build scripts
python3 [hai-dir]/build_deck.py
python3 [hai-dir]/render.py

# Compile (reels)
python3 runtime/scripts/compile.py [hai-dir] --height 1080
```


---

## The humanitarians palette

Muted editorial (Economist / FT-adjacent):

| Role | Hex | When |
|---|---|---|
| CREAM | `#F3EBDD` | ground |
| INK | `#2F2A26` | text / marks |
| TEAL | `#1F4E5F` | good / kept / true (CVD-safe cool) |
| CRIMSON | `#E4572E` | bad / lost / broken (CVD-safe warm) |
| SLATE | `#29335C` | structure / entity cards |
| GOLD | `#F3A712` | highlighter fill only — never text |
| SAGE | `#A8C686` | human / growth motifs |

Typography — Humanitarians house type: **EB Garamond** (serif body) +
**Montserrat** (sans headers). Tokens: `runtime/remotion/src/tokens/humanitarians.ts`.

---

## Channel title — required on every HAI video

Every HAI beat sheet **must** include `metadata.channel_title: "@HumanitariansAI"`.

```json
{
  "metadata": {
    "channel_title": "@HumanitariansAI",
    ...
  }
}
```

`compile.py` reads this field and burns `@HumanitariansAI` as a **centered
bottom-of-frame** text overlay — **on the first beat only**. Appearance:

- **Ink** (`#2F2A26`) text on a transparent ground — no pill, no box.
- **Serif house font** (EB Garamond) at 3% of frame height — same weight and
  palette as the body type on the verdict card.
- Positioned bottom center, 40px above the bottom edge.
- Disappears when the first beat ends; no other beat carries it.

The overlay must read as natural caption text on the first beat's cream
background, not as a watermark or badge.

## Standing rules

- Source files (`beat_sheet.json`, build scripts, media) are **never modified**.
- `metadata.channel_title: "@HumanitariansAI"` is required in every HAI beat sheet
  (see above — compile.py enforces the first-beat overlay automatically).
- HAI Fellows take the slate cut and refine it further with Claude Code — the
  variant is a strong on-doctrine starting point, not a locked master.
