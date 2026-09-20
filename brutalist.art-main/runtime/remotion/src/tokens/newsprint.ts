// NEWSPRINT audience palette — the FORMER vox default (warm editorial), preserved
// verbatim after the 2026-07 flip to teardown. Same ROLE KEYS as tokens/vox.ts, so a
// scene retints by swapping the import. This is the ONE palette that keeps a distinct
// positive COLOR (teal); opt in per reel with metadata.palette: newsprint.
//
// COLOR LAW: TEAL = good/kept, CRIMSON = bad/lost — never swapped mid-film. GOLD is a
// highlighter fill only, never text. Pair color with position + an explicit label.
export const NEWSPRINT = {
  CREAM: '#F3EBDD',   // newsprint ground
  INK: '#2F2A26',     // warm near-black — all body text/marks
  TEAL: '#1F6F5C',    // good / kept / true  (accent A)
  CRIMSON: '#BF3339', // bad / lost / broken (accent B)
  SLATE: '#3E5559',   // structure / entity cards
  GOLD: '#F5D061',    // highlighter fill ONLY, never text
} as const;

// Fonts + house spring are audience-neutral — reuse tokens/vox.ts FONT and SPRING_SMOOTH.
