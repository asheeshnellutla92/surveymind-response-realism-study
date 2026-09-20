// GitHub dark fidelity tokens — diegetic subject surface for cli-explainer `--tool github`.
// Source of truth: books/skin-mocks/github-skin.html + github-skin-evidence.html.
// Never retint; this palette is product fidelity, not brand expression.
export const GH = {
  BG: '#010409',      // near-black stage ground
  PANEL: '#0d1117',   // lifted surface: code viewer, pills
  PANEL2: '#161b22',  // chip fills, bucket bodies
  BORDER: '#30363d',  // hairline borders
  CHIP: '#21262d',    // chip / button fill
  FG: '#f0f6fc',      // headline near-white
  BODY: '#e6edf3',    // body / code default
  MUTED: '#8b949e',   // secondary text
  MUTED2: '#6e7681',  // line numbers, crumb separators, taglines (github-skin.html)
  DIM: '#484f58',     // frozen labels, arrows (github-skin-evidence.html)
  BLUE: '#2f81f7',    // accent: rules, links, hi-nodes
  GREEN: '#3fb950',   // added lines
  RED: '#f85149',     // deleted lines
  AMBER: '#d29922',   // warning / amber
  GOLD: '#e3b341',    // star icon
  ADD_BG: 'rgba(46,160,67,.15)',    // diff add row wash
  DEL_BG: 'rgba(248,81,73,.15)',    // diff del row wash
  // Syntax (GitHub dark)
  SYN_COM: '#8b949e',
  SYN_STR: '#a5d6ff',
  SYN_KW: '#ff7b72',
  SYN_VAR: '#79c0ff',
  SYN_NUM: '#79c0ff',
  SYN_FN: '#e6edf3',
} as const;

export const GH_FONT = {
  ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Helvetica, Arial, sans-serif',
  mono: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace',
} as const;

export type GHTokens = typeof GH;
