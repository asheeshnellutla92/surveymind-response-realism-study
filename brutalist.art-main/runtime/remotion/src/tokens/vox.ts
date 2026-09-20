// vox palette + motion tokens — the DEFAULT set the whole bench retints from.
// DEFAULT FLIPPED 2026-07: the house default is now `teardown` (minimalist —
// white / ink / RED-ONLY). The former default (cream / teal / crimson / gold) is
// preserved verbatim in tokens/newsprint.ts. Palette is a registry (DESIGN.md):
// the same SIX role keys, different values, selected per reel via metadata.palette.
//
// teardown grammar: red is the ONE accent (bad / lost / emphasis / primary series).
// GOOD/kept is PLAIN INK (TEAL === INK) — the KEPT/LOST label + side carry it,
// never a second hue. GOLD is a wash of the one accent (highlighter fill only).
export const VOX = {
  CREAM: '#FFFFFF',    // ground — flat white (never cream, never warm paper)
  INK: '#2A1A0E',      // warm near-black — all body text/marks
  TEAL: '#2A1A0E',     // good / kept / true — PLAIN INK (label + position carry it)
  CRIMSON: '#C8102E',  // bad / lost / broken — the ONE accent
  SLATE: '#545454',    // structure / entity cards / axes
  GOLD: '#F6D8DC',     // highlighter fill ONLY (never text) — a ~14% wash of the accent
  HAIRLINE: '#D4D4D4', // dividers, card borders — not a text color
} as const;

// The default set IS teardown.
export const TEARDOWN = VOX;

// House data-visualization palette — Okabe-Ito (colorblind-safe, the gold standard).
// SEPARATE from the brand palette above: reach for it ONLY at 3+ categorical series.
// 1–2 series still use the brand grammar (red-vs-ink). Assign in listed order.
// (NEU is excepted — NU brand law: red primary + grays, never this rainbow.)
export const DATAVIZ_CATEGORICAL = [
  '#000000', // black
  '#E69F00', // orange
  '#56B4E9', // sky blue
  '#009E73', // bluish green
  '#F0E442', // yellow
  '#0072B2', // blue
  '#D55E00', // vermillion
  '#CC79A7', // reddish purple
] as const;

// NEU brand emphasis red (brand / primary-series only; never "state").
export const NEU_RED = '#C8102E';

// Family names fall back to system faces until the bundled Montserrat / EB Garamond /
// PT Mono TTFs are loaded (see loadVoxFonts, wired in the real toolkit project).
// NEU overrides all type to Lato — see tokens/neu.ts FONT_NEU.
export const FONT = {
  display: 'Montserrat, "Helvetica Neue", Arial, sans-serif', // titles, labels (tracked caps)
  serif: '"EB Garamond", Georgia, serif',                     // quotes, editorial moments
  mono: '"PT Mono", "SF Mono", Menlo, monospace',             // data numbers + math only
} as const;

// House spring — calm, effectively no overshoot (DESIGN: no overshoot, one focal moment).
export const SPRING_SMOOTH = { damping: 30, stiffness: 110, mass: 1 } as const;
