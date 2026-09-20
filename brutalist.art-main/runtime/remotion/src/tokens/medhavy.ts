// MEDHAVY audience palette — Okabe-Ito (colorblind-safe, the gold standard).
// Same ROLE KEYS as tokens/vox.ts, different values, so a scene written against
// these keys renders in either palette by swapping the import. Ground is a warm
// eggshell off-white — Okabe-Ito is calibrated for white, softened just enough to
// stay warm without the vox newsprint tint. Structure uses a neutral gray added
// outside the 8 data colors.
//
// COLOR LAW (unchanged, and it matters MORE here): pair color with position + an
// explicit label. Okabe-Ito is hue-distinct across every CVD type, but redundant
// encoding stays the rule — color reinforces, it never carries meaning alone.
export const MEDHAVY = {
  CREAM: '#F0EAD6',   // ground — warm eggshell off-white
  INK: '#000000',     // text / marks — true black
  TEAL: '#009E73',    // accent A: good / kept / true — Okabe-Ito bluish green
  CRIMSON: '#D55E00', // accent B: bad / lost / broken — Okabe-Ito vermillion
  SLATE: '#4D4D4D',   // structure — neutral gray (entity cards, axes, scaffolding)
  GOLD: '#F0E442',    // highlighter — Okabe-Ito yellow (FILL ONLY, never text)
} as const;

// The full Okabe-Ito set, in the canonical assignment order, for categorical /
// multi-series charts that need more than the two semantic accents. Text-black
// and highlighter-yellow are intentionally excluded from series colors.
export const MEDHAVY_CATEGORICAL = [
  '#0072B2', // blue
  '#E69F00', // orange
  '#56B4E9', // sky blue
  '#009E73', // bluish green
  '#D55E00', // vermillion
  '#CC79A7', // reddish purple
] as const;

// Every Okabe-Ito color by name (for reference / explicit picks).
export const OKABE_ITO = {
  black: '#000000',
  orange: '#E69F00',
  skyBlue: '#56B4E9',
  bluishGreen: '#009E73',
  yellow: '#F0E442',
  blue: '#0072B2',
  vermillion: '#D55E00',
  reddishPurple: '#CC79A7',
} as const;

// Fonts + house spring are audience-neutral; MEDHAVY reuses tokens/vox.ts FONT and
// SPRING_SMOOTH. (Import them from './vox' at the scene, or re-export here later.)
