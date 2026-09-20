import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CadencesFig2Tax — Tax Day spike.
 * Source: Anthropic Economic Index, Cadences (June 2026)
 *
 * Time-series line: US tax-related conversation share.
 * Flat baseline → cliff-face spike on Apr 14–15 (8× average May day)
 * → sharp drop Apr 16. Rest-of-world stays flat underneath.
 * Terracotta vertical rule on Apr 15 (US filing deadline).
 */

export const cadencesFig2TaxSchema = z.object({
  sparkLine: z.string().default('Eight times the average. One day.'),
});
export type CadencesFig2TaxProps = z.infer<typeof cadencesFig2TaxSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Days: Apr 1 – Apr 20 (20 points), normalized so avg May day = 1.0
// Apr 14 peak = 8, Apr 15 ~ 7.5, Apr 16 drops to ~2
const US_DATA = [
  1.0, 1.1, 0.9, 1.0, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, // Apr 1–10
  1.3, 1.5, 2.2, 8.0, 7.5, 2.0, 1.1, 1.0, 0.9, 1.0, // Apr 11–20
];
const ROW_DATA = US_DATA.map(() => 1.0 + Math.random() * 0.1); // flat ~1.0

// Apr 14 = index 13, Apr 15 = index 14
const DEADLINE_IDX = 14;
const LABELS: { idx: number; label: string }[] = [
  { idx: 0,  label: 'Apr 1' },
  { idx: 13, label: 'Apr 14' },
  { idx: 14, label: 'Apr 15' },
  { idx: 19, label: 'Apr 20' },
];

export const CadencesFig2Tax: React.FC<CadencesFig2TaxProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.09;
  const PAD_Y = height * 0.08;

  const titleIn  = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const lineAnim = spring({ frame: frame - 15, fps, config: { damping: 22, stiffness: 60, mass: 1.1 } });
  const ruleIn   = spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn  = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const CHART_TOP = height * 0.26;
  const CHART_BOTTOM = height * 0.80;
  const CHART_H = CHART_BOTTOM - CHART_TOP;
  const CHART_LEFT = PAD_X + 50;
  const CHART_RIGHT = width - PAD_X;
  const CHART_W = CHART_RIGHT - CHART_LEFT;

  const MAX_Y = 9.0;
  const n = US_DATA.length;

  const ptX = (i: number) => CHART_LEFT + (i / (n - 1)) * CHART_W;
  const ptY = (v: number) => CHART_BOTTOM - (v / MAX_Y) * CHART_H;

  // How many points to draw based on lineAnim
  const drawnPts = Math.floor(clamp(lineAnim, 0, 1) * n);

  // Build SVG polyline strings
  const buildLine = (data: number[]) =>
    data.slice(0, drawnPts + 1)
      .map((v, i) => `${ptX(i)},${ptY(v)}`)
      .join(' ');

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        TAX CONVERSATIONS · RELATIVE TO AVG MAY DAY
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        April 14: eight times the average May day.
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.13,
        display: 'flex', gap: 24, opacity: clamp(lineAnim, 0, 1),
      }}>
        {[
          { label: 'United States', color: CLAUDE.INK },
          { label: 'Rest of world', color: CLAUDE.GHOST },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 18, height: 2, background: l.color }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>

      {/* Y axis gridlines */}
      {[1, 2, 4, 8].map(v => {
        const y = ptY(v);
        return (
          <React.Fragment key={v}>
            <div style={{
              position: 'absolute', left: CHART_LEFT, top: y,
              width: CHART_W, height: 1,
              background: CLAUDE.BORDER, opacity: 0.7,
            }} />
            <div style={{
              position: 'absolute', right: width - CHART_LEFT + 8, top: y - 9,
              fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
              textAlign: 'right' as const,
            }}>
              {v}×
            </div>
          </React.Fragment>
        );
      })}

      {/* Chart SVG */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        width={width} height={height}
      >
        {/* Rest-of-world (flat) */}
        {drawnPts > 0 && (
          <polyline
            points={buildLine(ROW_DATA)}
            fill="none"
            stroke={CLAUDE.GHOST}
            strokeWidth={2}
            opacity={0.5}
          />
        )}
        {/* US line */}
        {drawnPts > 0 && (
          <polyline
            points={buildLine(US_DATA)}
            fill="none"
            stroke={CLAUDE.INK}
            strokeWidth={2.5}
          />
        )}
        {/* Spike peak dot — terracotta */}
        {drawnPts > 13 && (
          <circle
            cx={ptX(13)}
            cy={ptY(8.0)}
            r={6}
            fill={CLAUDE.SPARK}
          />
        )}
      </svg>

      {/* Terracotta vertical rule on Apr 15 */}
      {clamp(ruleIn, 0, 1) > 0.1 && (
        <>
          <div style={{
            position: 'absolute',
            left: ptX(DEADLINE_IDX) - 1,
            top: CHART_TOP,
            width: 2,
            height: (CHART_H + 8) * clamp(ruleIn, 0, 1),
            background: CLAUDE.SPARK,
          }} />
          <div style={{
            position: 'absolute',
            left: ptX(DEADLINE_IDX) + 6,
            top: CHART_TOP + height * 0.01,
            fontFamily: SANS, fontSize: height * 0.013,
            color: CLAUDE.SPARK, fontWeight: 700,
            opacity: clamp(ruleIn, 0, 1),
          }}>
            US filing deadline
          </div>
        </>
      )}

      {/* X-axis labels */}
      {LABELS.map(({ idx, label }) => (
        <div key={label} style={{
          position: 'absolute',
          left: ptX(idx) - 24, top: CHART_BOTTOM + 10,
          width: 48, fontFamily: SANS, fontSize: height * 0.012,
          color: idx === DEADLINE_IDX ? CLAUDE.SPARK : CLAUDE.GHOST,
          fontWeight: idx === DEADLINE_IDX ? 700 : 400,
          textAlign: 'center' as const,
          opacity: clamp(lineAnim, 0, 1),
        }}>
          {label}
        </div>
      ))}

      {/* Baseline axis */}
      <div style={{
        position: 'absolute', left: CHART_LEFT, top: CHART_BOTTOM,
        width: CHART_W, height: 2, background: CLAUDE.BORDER,
      }} />

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Data: Anthropic Economic Index, Cadences (June 2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    
      {/* @NikBearBrown watermark — lower-right, low opacity (LOGO LAW) */}
      <div style={{
        position: 'absolute',
        right: width * 0.04,
        bottom: height * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        @NikBearBrown
      </div>
    </AbsoluteFill>

  );
};
