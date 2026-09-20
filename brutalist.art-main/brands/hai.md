---
name: hai
description: >
  HAI (Humanitarians AI) brand spec — Plain register, Kokoro am_onyx
  voice, humanitarians palette (muted editorial). Used by the audience-preset skill when brand=hai. For the
  first-class hai command (which creates a hai- directory and adds the CLI
  exercise + outro beats), see skills/make/hai/SKILL.md.
---

# hai — HAI brand spec

Brand specification used by `audience-preset` when `<brand>=hai`. The
**first-class `hai` command** (including directory convention, CLI exercise
beat, and Humanitarians AI outro) is documented in
`skills/make/hai/SKILL.md`.

## Register — Plain

For busy, mid-career practitioners applying AI in social-impact work. Get
productive fast.

- Lead with **method**: what it is, what it produces.
- State when to use it — the decision trigger.
- **Required**: when NOT to use it and where it fails. This is the AI main
  event. Do not skip or soften.
- Efficient; no personality tax; no academic hedging.

Prose reference: `prose/plain/PROSE.md`

## Voice

| Engine | Default | Override |
|---|---|---|
| Kokoro | `am_onyx` | — |

**There is no paid voice.** ElevenLabs was permanently removed on 2026-09-03.

## Palette — `humanitarians`

Muted editorial (Economist / FT-adjacent). Tokens:
`runtime/remotion/src/tokens/humanitarians.ts`

| Role | Hex |
|---|---|
| CREAM (ground) | `#F3EBDD` |
| INK (text) | `#2F2A26` |
| TEAL (good/CVD-safe cool) | `#1F4E5F` |
| CRIMSON (bad/CVD-safe warm) | `#E4572E` |
| SLATE (structure) | `#29335C` |
| GOLD (fill only) | `#F3A712` |
| SAGE (human/growth) | `#A8C686` |

Typography — Humanitarians house type: **EB Garamond** (serif body) +
**Montserrat** (sans headers).

## Outro

Content from the **Humanitarians AI** section of the book's `AUTHOR.MD`.
Renders via Remotion `OutroSeries` / `OutroCTA` in the humanitarians palette.

## Irreducibly-Human tangent flavor

0–1 per video (ONLY on a clear opportunity). One bounded aside:
*"This the AI does well. This is the human's — it cannot be handed off."*
A decision boundary, not a sermon. Most reels get none.
