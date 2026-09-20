import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * GraphingDesign — B02 — four-step workflow + judgement defaults.
 */

export const graphingDesignSchema = z.object({
  sparkLine: z.string().default('Four steps: look, infer, write, look again. Rank bars. Label small datasets. Annotate what matters.'),
});
export type GraphingDesignProps = z.infer<typeof graphingDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const STEPS = [
  { step: '1. Look at the data', detail: 'Shape, count, and meaning drive the chart type. Trends → lines. Ranked categories → horizontal bars. Parts of a whole → pie (few slices).', warn: false },
  { step: '2. Infer colors', detail: 'Check tailwind config, CSS variables, brand guidelines, semantic meaning (red for errors, green for success). Pass to theme(bg=…) and palette(base=…).', warn: false },
  { step: '3. Write the script', detail: 'Import chartkit. Build with plain matplotlib or a Recharts component. Call finish. Save or write_html.', warn: false },
  { step: '4. Render and look', detail: 'Read the PNG back. Check: labels legible, nothing overlapping, colors distinguishable, story visible. Fix and re-render until right.', warn: false },
];

const DEFAULTS = [
  { rule: 'Rank categorical bars', when: 'Unless natural order exists', warn: false },
  { rule: 'Label bars with values', when: 'When ~12 or fewer bars', warn: false },
  { rule: 'Title states what chart shows', when: 'Not the chart type or column name', warn: false },
  { rule: 'Annotate what matters', when: 'Deploy lines, thresholds, peaks — not clutter', warn: false },
  { rule: 'Legend only for multiple series', when: 'Single series: named by title', warn: false },
];

export const GraphingDesign: React.FC<GraphingDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const stepSprings = STEPS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const defaultSprings = DEFAULTS.map((_, i) =>
    spring({ frame: frame - 18 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.42;
  const RIGHT_W = W * 0.44;
  const STEP_H = (H * 0.57) / 4 - 11;
  const DEF_H = (H * 0.57) / 5 - 9;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        GRAPHING · FOUR-STEP WORKFLOW + JUDGEMENT DEFAULTS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 40, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Judgement, not flags. Deviate when data argues for it.
      </div>

      {/* Steps (left) */}
      <div style={{ position: 'absolute', left: W * 0.03, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(stepSprings[0], 0, 1),
        }}>
          FOUR STEPS
        </div>
        {STEPS.map((s, i) => {
          const op = clamp(stepSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: STEP_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#4A7C59', marginBottom: 4 }}>{s.step}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{s.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Defaults (right) */}
      <div style={{ position: 'absolute', left: W * 0.51, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(defaultSprings[0], 0, 1),
        }}>
          JUDGEMENT DEFAULTS
        </div>
        {DEFAULTS.map((d, i) => {
          const op = clamp(defaultSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 9, padding: '7px 12px', marginBottom: 9,
              height: DEF_H, boxSizing: 'border-box' as const,
              boxShadow: '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#4A7C59', marginBottom: 2 }}>{d.rule}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>{d.when}</div>
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
