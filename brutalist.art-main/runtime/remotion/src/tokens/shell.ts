// Shell terminal fidelity tokens — diegetic subject surface for cli-explainer `--tool shell`.
// Source of truth: books/skin-mocks/shell-skin.html.
// Dark is sanctioned here as a real terminal surface. The ONE brand accent (terracotta)
// marks the prompt sigil and the "money" evidence line — same accent as the Claude skin.
export const SH = {
  STAGE: '#06070a',               // near-black stage we cut to
  TERM: '#0c0e12',                // terminal body background
  BAR: '#14171d',                 // title bar background
  BORDER: '#232830',              // window border
  FG: '#e6e6e6',                  // output text
  DIM: '#8a8f98',                 // dim output / comments
  CMD: '#faf9f5',                 // typed command — brightest
  USER: '#a8c0b4',                // prompt user@host — sage
  PATH: '#b5b4d6',                // prompt path — periwinkle
  ACCENT: '#d97757',              // terracotta — prompt sigil + highlight wash
  HI_BG: 'rgba(217,119,87,0.14)',// wash on the "money" evidence line
  // Traffic-light dots (macOS standard — never changed)
  DOT_RED: '#ff5f57',
  DOT_YEL: '#febc2e',
  DOT_GRN: '#28c840',
} as const;

export const SH_FONT = {
  mono: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace',
  ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
} as const;

export type SHTokens = typeof SH;
