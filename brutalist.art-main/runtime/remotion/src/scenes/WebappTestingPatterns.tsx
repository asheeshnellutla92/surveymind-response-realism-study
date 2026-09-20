import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WebappTestingPatterns — B02 — with_server.py patterns + Playwright best practices.
 */

export const webappTestingPatternsSchema = z.object({
  sparkLine: z.string().default('Server managed. Recon first. networkidle always.'),
});
export type WebappTestingPatternsProps = z.infer<typeof webappTestingPatternsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const SERVER_ITEMS = [
  { label: 'Always --help first', detail: 'See current options before writing any command' },
  { label: 'Single server', detail: '--server "npm run dev" --port 5173', mono: true },
  { label: 'Multiple servers', detail: '--server "backend cmd" --port 3000 --server "frontend" --port 5173', mono: true },
  { label: 'Lifecycle managed', detail: 'Helper starts, waits ready, runs script, tears down — your script is pure automation' },
];

const PLAYWRIGHT_ITEMS = [
  { label: 'sync_playwright()', detail: 'Always use synchronous API for scripted automation', mono: true },
  { label: 'Headless Chromium', detail: 'p.chromium.launch(headless=True) — always headless', mono: true },
  { label: 'networkidle wait', detail: 'page.wait_for_load_state("networkidle") before any DOM operation', mono: true, highlight: true },
  { label: 'Descriptive selectors', detail: 'text=, role=, CSS, IDs — never fragile absolute XPath', mono: false },
];

const EXAMPLE_SCRIPTS = [
  { name: 'element_discovery.py', desc: 'Find buttons, links, inputs on any page' },
  { name: 'static_html_automation.py', desc: 'Automate against file:// URLs' },
  { name: 'console_logging.py', desc: 'Capture browser console output' },
];

export const WebappTestingPatterns: React.FC<WebappTestingPatternsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const serverSprings = SERVER_ITEMS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const playwrightSprings = PLAYWRIGHT_ITEMS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const exampleSprings = EXAMPLE_SCRIPTS.map((_, i) =>
    spring({ frame: frame - 80 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.30;
  const COL_W = W * 0.40;
  const ITEM_H = (H * 0.52) / 4 - 11;
  const EXAMPLE_H = (H * 0.13) / 3 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        WEB APPLICATION TESTING · PATTERNS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 46, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        with_server.py + Playwright rules.
      </div>

      {/* Column headers */}
      <div style={{
        position: 'absolute', top: COL_TOP - 26, left: W * 0.06,
        fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.SPARK, textTransform: 'uppercase' as const,
        opacity: clamp(serverSprings[0], 0, 1),
      }}>
        WITH_SERVER.PY
      </div>
      <div style={{
        position: 'absolute', top: COL_TOP - 26, left: W * 0.53,
        fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
        color: '#4A7C59', textTransform: 'uppercase' as const,
        opacity: clamp(playwrightSprings[0], 0, 1),
      }}>
        PLAYWRIGHT RULES
      </div>

      {/* with_server.py column */}
      <div style={{ position: 'absolute', left: W * 0.06, top: COL_TOP, width: COL_W }}>
        {SERVER_ITEMS.map((item, i) => {
          const op = clamp(serverSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: `rgba(217,119,87,0.04)`, border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '11px 14px', marginBottom: 10,
              height: ITEM_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(217,119,87,0.06)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK, marginBottom: 3 }}>
                {item.label}
              </div>
              <div style={{
                fontFamily: item.mono ? MONO : SANS,
                fontSize: item.mono ? 11 : 12,
                color: CLAUDE.INK_SOFT, lineHeight: 1.4,
              }}>
                {item.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Playwright column */}
      <div style={{ position: 'absolute', left: W * 0.53, top: COL_TOP, width: COL_W }}>
        {PLAYWRIGHT_ITEMS.map((item, i) => {
          const op = clamp(playwrightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: item.highlight ? 'rgba(74,124,89,0.05)' : '#FFFFFF',
              border: `1px solid ${item.highlight ? '#4A7C59' : CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '11px 14px', marginBottom: 10,
              height: ITEM_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#4A7C59', marginBottom: 3 }}>
                {item.label}
              </div>
              <div style={{
                fontFamily: item.mono ? MONO : SANS,
                fontSize: item.mono ? 11 : 12,
                color: CLAUDE.INK_SOFT, lineHeight: 1.4,
              }}>
                {item.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Example scripts */}
      <div style={{
        position: 'absolute',
        top: COL_TOP + (H * 0.52) + 16,
        left: W * 0.06, right: W * 0.06,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(exampleSprings[0], 0, 1),
        }}>
          EXAMPLES/
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {EXAMPLE_SCRIPTS.map((ex, i) => {
            const op = clamp(exampleSprings[i], 0, 1);
            return (
              <div key={i} style={{
                flex: 1, background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
                borderTop: `3px solid ${CLAUDE.INK_SOFT}`,
                borderRadius: 8, padding: '10px 14px',
                height: EXAMPLE_H, boxSizing: 'border-box' as const,
                boxShadow: '0 2px 8px rgba(61,57,41,0.04)',
                opacity: op, transform: `translateY(${(1 - op) * 10}px)`,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>{ex.name}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{ex.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
