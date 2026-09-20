# The `musinique` palette — the clean-SaaS / shadcn look (6th palette)

Musinique (musinique.com + the artist subdomains) is a **new, distinct** design palette — the
opposite pole from `brutalist`. Where brutalist is a hard-edged terminal aesthetic (orange,
JetBrains Mono, no radius, dot-grid, Solari), **musinique is essentially MONOCHROME** — an all-greys,
editorial-SaaS system: white → greys → black, black/white high-contrast CTAs, rounded corners, soft
shadows, a humanist sans, generous whitespace, and lucide line icons. There is no brand accent color
— contrast (black-on-white / white-on-black) IS the accent. The lone blue (`text-blue-600` on the
Humanitarians AI link) is an incidental default hyperlink color, not part of the palette.

It is **not yet in the toolkit** — neither the Manim `_PALETTES` nor the Remotion `tokens/` has a
`musinique` entry. Adding it makes the design system six: `brutalist, hai, medhavy, musinique, neu,
nikbearbrown`.

## What the source is

The page is a **Next.js app generated with v0.dev**, styled with **Tailwind + shadcn/ui** (the
`bg-background`/`text-foreground`/`text-muted-foreground`/`text-primary`/`ring-ring`/`border-input`
token vocabulary). Light default, dark mode via `next-themes` (`defaultTheme: light`,
`enableSystem: true`). Body: `font-sans` (a preloaded woff2 — the v0 default humanist sans, Geist/
Inter family), NOT monospace.

## Design DNA (read from the class usage — reliable)

| aspect | musinique | (contrast: brutalist) |
|---|---|---|
| base | neutral grayscale (white → gray-50/100 → gray-800/900/950 → black) | eggshell + `#080808` |
| accent | **none — monochrome**; contrast is the accent (black/white CTAs). Blue links are incidental | one orange `#ea580c` |
| type | humanist **sans** (`font-sans`) | **JetBrains Mono** |
| shape | **rounded** (`rounded-md` buttons, `rounded-lg` cards, `rounded-xl` media), **soft shadows** (`shadow`, `hover:shadow-lg`) | hard borders, no radius |
| icons | **lucide** line icons (radio, mic-vocal, code, book, flame, users, music) | terminal glyphs, Solari tiles |
| rhythm | alternating section bands: white → `gray-50` → white → `gray-900` (dark) → `gray-50` → `gray-100` | full-bleed dark terminal |
| mode | light + dark (system-aware) | light + dark |

## Concrete token values

**Literal Tailwind values used** (known, exact): `blue-600 #2563eb`, `gray-50 #f9fafb`,
`gray-100 #f3f4f6`, `gray-300 #d1d5db`, `gray-800 #1f2937`, `gray-900 #111827`, `gray-950 #030712`,
`black #000`, `white #fff`.

**The shadcn `:root` tokens** (`--background`, `--foreground`, `--primary`, `--muted`,
`--muted-foreground`, `--border`, `--ring`, `--card`, `--accent`) are **NOT in the pasted HTML** —
they live in the external `/_next/static/css/cb13893dd7973b05.css`. Based on the shadcn "neutral"
preset the site uses, they are approximately: `--background 0 0% 100%` / dark `0 0% 3.9%`;
`--foreground 0 0% 3.9%` / dark `0 0% 98%`; `--muted 0 0% 96.1%`; `--muted-foreground 0 0% 45.1%`;
`--primary 0 0% 9%` / dark `0 0% 98%` (near-black, NOT blue — the blue is only for hyperlinks).
**These are inferred, not confirmed** — to lock the palette exactly, drop in that CSS file (or the
site's `globals.css` `:root`/`.dark` block) and I'll replace this section with the real values.

## Notes for adding it to the registry

- musinique carries a **radius + shadow + sans** language the video palettes don't model — for
  Manim/Remotion the renderable part is the color set (neutral base, black/white marks, blue accent)
  (monochrome greys) + the sans type law; the rounded-corner/soft-shadow feel is a deck/web trait. No chromatic accent to carry.
- It's the palette of the **Musinique web properties** (record-label / artist pages), so like
  `brutalist` it will most naturally appear on the **HTML/deck surface** first; a Manim/Remotion
  entry lets a musinique-branded video match.
- Mapping when added: GROUND=`--background` (white/near-black), INK=`--foreground`, accent/link=
  `blue-600 #2563eb`, SLATE=`--muted-foreground`, with a humanist-sans type law (like neu→Lato).
