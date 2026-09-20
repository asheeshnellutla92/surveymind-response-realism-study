---
name: nbb
description: >
  NikBearBrown brand spec — Teardown register (Feynman × MKBHD), Kokoro
  am_onyx (Liam, free and local), teardown palette (white / ink / one red). Used by the audience-preset skill when brand=nbb. For the
  first-class nbb command (directory convention, LLM exercise beat, outro),
  see skills/make/nbb/SKILL.md.
---

# nbb — NikBearBrown brand spec

Brand specification used by `audience-preset` when `<brand>=nbb`. The
**first-class `nbb` command** (directory convention, LLM exercise beat, and
NikBearBrown outro) is documented in `skills/make/nbb/SKILL.md`.

## Register — Teardown (Feynman × MKBHD)

Take it apart, explain how each piece works, judge the design choices.

- **Explain the machinery**: not the name — the actual mechanism.
- **Reveal design philosophy**: what was this optimized for? what did it sacrifice?
- **Judge the choices**: do they succeed on their own terms? name the trade-offs.
- Intellectual honesty: admit limits ("I don't fully understand why…"), think in
  ecosystems ("nothing exists in isolation").
- Design-critic lens: "They optimized for X at the expense of Y."
- Nik Bear Brown speaks in **first person** when the content is his.

Forbidden: "One could argue…" / "innovative" without saying what changed / specs
without context. Use: "Here's what's actually happening…" / "This works if you
value X; it fails if you need Y."

Prose reference: `prose/teardown/PROSE.md`

## Voice

| Engine | Setting |
|---|---|
| Kokoro | `am_onyx` — Liam, in for Bear (IN-FOR-BEAR LAW) |

**There is no paid voice.** ElevenLabs was permanently removed on 2026-09-03;
nbb used to be the one paid brand default and is not any more. `brand_variant.py`
writes `engine: "kokoro"`, `voice_kokoro: "am_onyx"`. Nothing here spends, so
GATE P has no audio spend left to guard on this brand.

## Palette — `teardown`

Minimalist, single accent. Tokens: `runtime/remotion/src/tokens/vox.ts`
(exported as `TEARDOWN`).

| Role | Hex |
|---|---|
| CREAM / ground | `#FFFFFF` — flat white |
| INK | `#2A1A0E` — all body text / marks |
| CRIMSON (the one accent) | `#C8102E` — bad / lost / emphasis |
| SLATE (structure) | `#545454` |
| GOLD (fill only) | `#F6D8DC` — ~14% wash of accent |
| HAIRLINE | `#D4D4D4` |

**Color law:** one accent only. Good/kept = plain INK (label + position carry
the meaning, not a second hue). Gold is fill-only, never text.

Typography: **Montserrat** (display/titles) + **EB Garamond** (serif/editorial)
+ **PT Mono** (data numbers/math).

## Outro

Content from the **NikBearBrown** section of the book's `AUTHOR.MD`
(default channel: `www.brutalist.art`). Renders via Remotion `OutroSeries` /
`OutroCTA` in the teardown palette.

## LLM exercise flavor

The second-to-last beat is an **LLM exercise** (not a CLI command): a
paste-ready prompt for Claude / ChatGPT / Gemini + a "go deeper" follow-up
question. The prompt must produce a useful output on its own. The follow-up
must be genuinely explorable, not a summary.
