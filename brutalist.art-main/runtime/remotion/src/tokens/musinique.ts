// MUSINIQUE palette — monochrome editorial / SaaS-clean (musinique.com + artist pages).
// Same ROLE KEYS as tokens/vox.ts, different values, so a scene retints by swapping
// the import. Monochrome: white → greys → black; contrast IS the accent. The one
// non-neutral mark is the link blue (#2563eb) — NOT a general accent color; use it
// for the good/positive/primary-series role only, paired with label + position.
//
// SOURCE: runtime/design/musinique-palette.md (literal Tailwind values, shadcn-inferred
// for :root tokens). TODO: lock --background/--foreground/--muted-foreground from the
// site's globals.css when available — replace the inferred values below.
//
// COLOR LAW (monochrome variant):
//   Good/kept → blue accent #2563eb (the one non-neutral mark; still pair with label + position)
//   Bad/lost  → gray-700 #374151 (monochrome; label + position MUST carry meaning alone)
//   Gold (fill only) → gray-100 #f3f4f6 (subtle area fill / highlight wash)
//   Structure → gray-500 #6b7280 (entity cards, axes, scaffolding)
//
// TYPE LAW: Inter (humanist sans) throughout. Musinique is NOT JetBrains Mono or
// Montserrat — use FONT_MUSINIQUE everywhere you would reach for FONT.display.
export const MUSINIQUE = {
  CREAM:   '#ffffff',   // ground — white (shadcn --background inferred: 0 0% 100%)
  INK:     '#111827',   // text / marks — gray-900 near-black (shadcn --foreground ≈ 0 0% 3.9%)
  TEAL:    '#2563eb',   // good / kept / positive — blue-600, the ONE non-neutral accent
  CRIMSON: '#374151',   // bad / lost / negative — gray-700 (monochrome; label carries it)
  SLATE:   '#6b7280',   // structure — gray-500 / muted-foreground (entity cards, axes)
  GOLD:    '#f3f4f6',   // highlighter fill ONLY — gray-100 (very subtle; never text)
  HAIRLINE: '#d1d5db',  // dividers / card borders — gray-300
} as const;

// The blue accent isolated, for explicit reference in scenes.
export const MUSINIQUE_BLUE = '#2563eb'; // Tailwind blue-600 — the one chromatic mark

// Grayscale series for multi-series charts (no hue-coded categorical set in a
// monochrome palette — use black + gray steps + blue for primary series).
export const MUSINIQUE_SERIES = [
  '#2563eb', // blue-600 — primary series (the one accent)
  '#111827', // gray-900
  '#6b7280', // gray-500
  '#9ca3af', // gray-400
  '#d1d5db', // gray-300
] as const;

// Type override — Inter (humanist sans), the musinique type law.
// All headlines, labels, and body copy use Inter, not Montserrat or EB Garamond.
// TODO: bundle Inter woff2 in runtime/fonts/Inter/ for Remotion; already available
// as a Google Font and in most OS font caches.
export const FONT_MUSINIQUE = {
  display: 'Inter, "Helvetica Neue", Arial, sans-serif',
  serif:   'Inter, "Helvetica Neue", Arial, sans-serif', // musinique has no editorial serif — Inter throughout
  mono:    '"PT Mono", "SF Mono", Menlo, monospace',     // data numbers + math only
} as const;

// House spring — calm, no overshoot (same as vox.ts SPRING_SMOOTH).
export { SPRING_SMOOTH } from './vox';
