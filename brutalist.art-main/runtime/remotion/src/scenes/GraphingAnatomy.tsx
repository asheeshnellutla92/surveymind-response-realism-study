import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * GraphingAnatomy — B01 — chartkit primitives + data helpers.
 */

export const graphingAnatomySchema = z.object({
  sparkLine: z.string().default('theme() derives colors from luminance. write_html inlines offline. zero_fill_days: skip if zeros would lie.'),
});
export type GraphingAnatomyProps = z.infer<typeof graphingAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PRIMITIVES = [
  { name: 'theme(bg, font)', purpose: 'Sets rcParams; returns resolved colors. Dark bg → dark chart automatically (luminance-derived foreground).', warn: false },
  { name: 'palette(n, base)', purpose: 'n colors. No base → default series. Hex base → ramp. List base → cycles list.', warn: false },
  { name: 'finish(ax, title, subtitle, source)', purpose: 'Typographic frame: left-aligned bold title, muted subtitle, small provenance caption.', warn: false },
  { name: 'save(fig, stem, formats, dpi)', purpose: 'Writes stem.png / stem.svg or both. Returns paths. Always call after finish.', warn: false },
  { name: 'write_html(out, data, component_js, …)', purpose: 'Self-contained offline page. Inlines React + Recharts from third_party/. No CDN needed.', warn: false },
];

const HELPERS = [
  { name: 'zero_fill_days(pairs)', purpose: 'Fill missing calendar days with zero. Skip when zeros would lie (sparse sampling, not absence).', warn: true },
  { name: 'rolling_mean(values, w)', purpose: 'Trailing mean — early points average what exists so far. Do not center on data that ends today.', warn: true },
  { name: 'log_floor(values)', purpose: 'Lower bound for log-scale bars at axis minimum. Zero height on log scale = invisible bar.', warn: false },
];

export const GraphingAnatomy: React.FC<GraphingAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const primSprings = PRIMITIVES.map((_, i) =>
    spring({ frame: frame - 18 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const helpSprings = HELPERS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.42;
  const RIGHT_W = W * 0.44;
  const PRIM_H = (H * 0.57) / 5 - 10;
  const HELP_H = (H * 0.57) / 3 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        GRAPHING · CHARTKIT PRIMITIVES + DATA HELPERS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        You write the chart. The kit writes the frame.
      </div>

      {/* Primitives (left) */}
      <div style={{ position: 'absolute', left: W * 0.03, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(primSprings[0], 0, 1),
        }}>
          CHARTKIT PRIMITIVES
        </div>
        {PRIMITIVES.map((p, i) => {
          const op = clamp(primSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 9, padding: '7px 12px', marginBottom: 9,
              height: PRIM_H, boxSizing: 'border-box' as const,
              boxShadow: '0 1px 6px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: '#4A7C59', marginBottom: 3 }}>{p.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{p.purpose}</div>
            </div>
          );
        })}
      </div>

      {/* Helpers (right) */}
      <div style={{ position: 'absolute', left: W * 0.51, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(helpSprings[0], 0, 1),
        }}>
          DATA HELPERS (USE WHEN THEY FIT)
        </div>
        {HELPERS.map((h, i) => {
          const op = clamp(helpSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: h.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${h.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${h.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: HELP_H, boxSizing: 'border-box' as const,
              boxShadow: h.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: h.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 4 }}>{h.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{h.purpose}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
