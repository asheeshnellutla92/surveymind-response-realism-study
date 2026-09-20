// brutalist — brutalist.art house tokens.
// This is the token set for the brutalist.art site and .dc.html decks.
// It is SEPARATE from the nikbearbrown (teardown) palette used by
// @NikBearBrown explainer videos. Do not apply these tokens to NBB reels.
// See vox/BRUTALIST.md for the full system description.

export const BRUTALIST = {
  // Typography — JetBrains Mono only (monospace throughout)
  font: {
    family: 'JetBrains Mono',
    weights: { regular: 400, semibold: 600, extrabold: 800 },
  },

  // Light mode
  light: {
    bg:       'hsl(43, 23%, 93%)',   // warm off-white paper
    fg:       'hsl(0, 0%, 4%)',      // near-black
    accent:   '#ea580c',             // brutalist orange
    green:    '#16a34a',             // status green
    muted:    'hsl(0, 0%, 40%)',     // secondary text
    mutedBg:  'hsl(40, 10%, 85%)',   // subtle surface
    cardBg:   'hsl(43, 20%, 90%)',   // card / panel surface
  },

  // Dark mode
  dark: {
    bg:       'hsl(0, 0%, 6%)',      // near-black
    fg:       'hsl(43, 23%, 93%)',   // warm off-white
    muted:    'hsl(0, 0%, 52%)',
    mutedBg:  'hsl(0, 0%, 12%)',
    cardBg:   'hsl(0, 0%, 10%)',
    // accent and green are invariant across modes
  },

  // Solari / CRT amber strip (dark-mode hero accent)
  solari: {
    amber: '#F5A623',
    bg:    '#080808',
    rail:  '#141414',
  },

  // Motifs — applied in Remotion components as CSS / SVG overlays
  motifs: {
    // Dotted grid: radial dots in fg color, 24 px pitch, 5 % opacity
    dottedGrid: {
      size:    24,
      opacity: 0.05,
      radial:  true,
    },
    borderWidth:  '2px',   // hard borders, no radius
    borderStyle:  'solid',
    cursorChar:   '▌',     // blinking block cursor (animate opacity 0↔1, 530 ms)
    bulletPrefix: '›',     // list item bullet
    labelPrefix:  '// ',   // inline label / comment prefix
    // Title reveal: glitch-skew — translate-x ±6 px, skewX ±3 deg, 3 frames, then settle
    titleReveal: {
      frames:      3,
      translateX:  6,
      skewX:       3,
      durationMs:  80,
    },
  },
} as const;

export type BrutalistTokens = typeof BRUTALIST;
