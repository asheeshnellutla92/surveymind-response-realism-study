// Codex app fidelity tokens. Neutral workspace chrome, high-contrast content,
// and one green execution/status accent. Keep product UI colors centralized.
export const CODEX = {
  PAGE: '#F7F7F5',
  PANEL: '#FFFFFF',
  SIDEBAR: '#ECECEA',
  BORDER: '#D9D9D5',
  INK: '#171717',
  INK_SOFT: '#64645F',
  GHOST: '#969691',
  CODE: '#111111',
  CODE_INK: '#F3F3F0',
  ACCENT: '#10A37F',
  ACCENT_SOFT: '#DDF3EC',
  WARNING: '#D97706',
} as const;

export const CODEX_FONT = {
  ui: '-apple-system, "SF Pro Text", "Segoe UI", "Helvetica Neue", sans-serif',
  mono: 'ui-monospace, "SF Mono", "Roboto Mono", Menlo, monospace',
} as const;

export type CodexTokens = typeof CODEX;
