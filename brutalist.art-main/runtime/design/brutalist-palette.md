# The `brutalist` palette — authoritative tokens (3 surfaces)

The `brutalist` palette is a real, actively-used design system — the terminal/Solari aesthetic of
the **HTML deck** program ("the slide deck is a program, not a canvas", brutalist.art) and of the
cancer-* book videos (`cancer-medicine`, `cancer-nanomedicine`, `cancer-research`). It is
**distinct** from `nikbearbrown` (the `teardown` white/ink/red palette).

Unlike the other palettes, `brutalist` renders on **three** surfaces, and the toolkit must keep them
in sync (see `TODO.md` — "Reconcile the palette registry"):

1. **HTML deck CSS** (`:root` custom properties) — the authoritative source, from the canonical
   "The Slide Deck Is a Program" deck.
2. **Remotion** — `runtime/remotion/src/tokens/brutalist.ts` (present).
3. **Manim** — `runtime/manim/animated_graphics.py` `_PALETTES` — **MISSING a `brutalist` key**; add it
   from the tokens below so Manim beats can render in this palette.

## Authoritative tokens (from the deck's `:root`)

| role | light | dark | note |
|---|---|---|---|
| ground `--bg` | `hsl(43,23%,93%)` (eggshell) | `hsl(0,0%,6%)` | dot-grid overlay at 5% |
| text `--fg` | `hsl(0,0%,4%)` | `hsl(43,23%,93%)` | |
| **accent `--accent`** | `#ea580c` (brutalist orange) | same | the one accent — invariant across modes |
| good `--green` | `#16a34a` (status green) | same | invariant across modes |
| muted `--muted` | `hsl(0,0%,40%)` | `hsl(0,0%,52%)` | |
| muted-bg `--muted-bg` | `hsl(40,10%,85%)` | `hsl(0,0%,12%)` | |
| card-bg `--card-bg` | `hsl(43,20%,90%)` | `hsl(0,0%,10%)` | |
| type `--font` | `'JetBrains Mono', monospace` | same | the brutalist typeface (NOT EB Garamond/Montserrat) |

**Solari sub-palette** (the split-flap departure board — a brutalist signature): board bg `#080808`,
tile bg `#141414`, tile border `#282828`, amber text/glow `#F5A623`.

## Notes for reconciliation

- The brutalist palette has a **fuller token set** than the 6-role Manim palettes
  (GROUND/INK/TEAL/CRIMSON/SLATE/GOLD/HAIRLINE): it adds a first-class `green` (status/good), a
  `card-bg`, a `muted-bg`, an invariant orange accent, and a **dark mode**. When adding the Manim
  entry, map: GROUND=`--bg`, INK=`--fg`, CRIMSON=`--accent` (#ea580c), TEAL=`--green` (#16a34a),
  SLATE=`--muted`, and carry JetBrains Mono as the palette's type override (like `neu`→Lato).
- The brutalist typeface is **JetBrains Mono**, not the house EB Garamond/Montserrat/PT Mono — the
  palette carries its own type law, same as `neu` carries Lato.
- This palette is the **deck/lecture substrate**: the animated-deck lecture pipeline (D4 reversal,
  see `TODO.md` Theme 3) builds brutalist-palette `deck.html` files and narrates them. Bringing that
  pipeline in and reconciling this palette are the same design system.
