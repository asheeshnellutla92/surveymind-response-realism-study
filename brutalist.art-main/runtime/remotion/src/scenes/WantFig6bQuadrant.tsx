import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantFig6bQuadrant — Figure 6b: Around the World — Quadrant
 * Source: Anthropic, "What 81,000 People Want from AI" (2026)
 *
 * Scatter plot: x = jobs/economy concern %, y = negative sentiment %.
 * Bubble size = relative respondents (simplified to constant for clarity).
 * Dashed averages draw first (x=22%, y=33%), then bubbles land by region.
 *
 * ONE terracotta moment: wealthy cluster (top-right) gets terracotta outline
 * when those bubbles land.
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const wantFig6bQuadrantSchema = z.object({
  sparkLine: z.string().default('Same AI. Different stakes.'),
});
export type WantFig6bQuadrantProps = z.infer<typeof wantFig6bQuadrantSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Data: (x = jobs/econ concern %, y = negative sentiment %)
// isWealthy = top-right cluster
const REGIONS = [
  { label: 'Western Europe', x: 22.5, y: 35.6, isWealthy: true },
  { label: 'Oceania', x: 24.3, y: 35.5, isWealthy: true },
  { label: 'North America', x: 24.6, y: 34.5, isWealthy: true },
  { label: 'East Asia', x: 21.9, y: 34.5, isWealthy: true },
  { label: 'S. & E. Europe', x: 22.1, y: 34.0, isWealthy: true },
  { label: 'Central Asia', x: 15.9, y: 31.1, isWealthy: false },
  { label: 'South Asia', x: 21.5, y: 30.8, isWealthy: false },
  { label: 'North Africa', x: 18.2, y: 30.6, isWealthy: false },
  { label: 'Middle East', x: 19.9, y: 29.2, isWealthy: false },
  { label: 'Southeast Asia', x: 19.3, y: 28.3, isWealthy: false },
  { label: 'Latin America', x: 18.5, y: 26.3, isWealthy: false },
  { label: 'Sub-Saharan Africa', x: 18.2, y: 24.2, isWealthy: false },
];

const AVG_X = 22;
const AVG_Y = 33;
const X_MIN = 13; const X_MAX = 28;
const Y_MIN = 20; const Y_MAX = 40;

export const WantFig6bQuadrant: React.FC<WantFig6bQuadrantProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axisIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const avgLinesIn = spring({ frame: frame - 20, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });

  // Non-wealthy bubbles land first
  const nonWealthyAnims = REGIONS
    .filter(r => !r.isWealthy)
    .map((_, i) =>
      spring({ frame: frame - 45 - i * 8, fps, config: { damping: 24, stiffness: 80, mass: 1.1 } })
    );

  // Wealthy cluster lands after, with terracotta outline
  const wealthyBaseFrame = 45 + REGIONS.filter(r => !r.isWealthy).length * 8 + 10;
  const wealthyAnims = REGIONS
    .filter(r => r.isWealthy)
    .map((_, i) =>
      spring({ frame: frame - wealthyBaseFrame - i * 6, fps, config: { damping: 22, stiffness: 80, mass: 1.1 } })
    );

  const accentIn = spring({ frame: frame - wealthyBaseFrame - 5 * 6, fps, config: { damping: 20, stiffness: 60, mass: 1.3 } });

  const sparkIn = spring({ frame: frame - wealthyBaseFrame - 5 * 6 + 25, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - wealthyBaseFrame - 5 * 6 + 30, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.08;
  const PAD_Y = height * 0.06;
  const CHART_L = PAD_X + 70;
  const CHART_R = width - PAD_X - 100;
  const CHART_T = PAD_Y + height * 0.20;
  const CHART_B = height * 0.80;
  const CHART_W = CHART_R - CHART_L;
  const CHART_H = CHART_B - CHART_T;

  const scaleX = (v: number) => CHART_L + ((v - X_MIN) / (X_MAX - X_MIN)) * CHART_W;
  const scaleY = (v: number) => CHART_B - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_H;

  const avgXpx = scaleX(AVG_X);
  const avgYpx = scaleY(AVG_Y);

  // Separate region lists preserving original order
  const nonWealthy = REGIONS.filter(r => !r.isWealthy);
  const wealthy = REGIONS.filter(r => r.isWealthy);

  const DOT_R = 9;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        GLOBAL QUADRANT · JOBS FEAR vs. NEGATIVE SENTIMENT
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.05,
        fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Wealth predicts fear — not exposure to AI
      </div>

      {/* SVG chart */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width, height }}
        viewBox={`0 0 ${width} ${height}`}>

        {/* Chart box */}
        <rect x={CHART_L} y={CHART_T} width={CHART_W} height={CHART_H}
          fill="none" stroke={CLAUDE.BORDER} strokeWidth={1}
          opacity={clamp(axisIn, 0, 1)} />

        {/* X-axis ticks */}
        {[14, 16, 18, 20, 22, 24, 26].map(v => (
          <g key={v} opacity={clamp(axisIn * 0.7, 0, 1)}>
            <line x1={scaleX(v)} y1={CHART_B} x2={scaleX(v)} y2={CHART_B + 6}
              stroke={CLAUDE.BORDER} strokeWidth={1} />
            <text x={scaleX(v)} y={CHART_B + 20} textAnchor="middle"
              fontFamily={SANS} fontSize={height * 0.012} fill={CLAUDE.INK_SOFT}>{v}%</text>
          </g>
        ))}

        {/* Y-axis ticks */}
        {[22, 26, 30, 34, 38].map(v => (
          <g key={v} opacity={clamp(axisIn * 0.7, 0, 1)}>
            <line x1={CHART_L - 6} y1={scaleY(v)} x2={CHART_L} y2={scaleY(v)}
              stroke={CLAUDE.BORDER} strokeWidth={1} />
            <text x={CHART_L - 10} y={scaleY(v) + 4} textAnchor="end"
              fontFamily={SANS} fontSize={height * 0.012} fill={CLAUDE.INK_SOFT}>{v}%</text>
          </g>
        ))}

        {/* Average dashed lines */}
        <line x1={avgXpx} y1={CHART_T} x2={avgXpx} y2={CHART_B}
          stroke={CLAUDE.GHOST} strokeWidth={1.2} strokeDasharray="5 4"
          opacity={clamp(avgLinesIn, 0, 1) * 0.6} />
        <line x1={CHART_L} y1={avgYpx} x2={CHART_R} y2={avgYpx}
          stroke={CLAUDE.GHOST} strokeWidth={1.2} strokeDasharray="5 4"
          opacity={clamp(avgLinesIn, 0, 1) * 0.6} />

        {/* Avg labels */}
        {clamp(avgLinesIn, 0, 1) > 0.5 && (
          <>
            <text x={avgXpx + 4} y={CHART_T + 14}
              fontFamily={SANS} fontSize={height * 0.011} fill={CLAUDE.GHOST}
              opacity={clamp(avgLinesIn, 0, 1)}>avg {AVG_X}%</text>
            <text x={CHART_R + 4} y={avgYpx - 4}
              fontFamily={SANS} fontSize={height * 0.011} fill={CLAUDE.GHOST}
              opacity={clamp(avgLinesIn, 0, 1)}>avg {AVG_Y}%</text>
          </>
        )}

        {/* Non-wealthy bubbles */}
        {nonWealthy.map((r, i) => {
          const anim = nonWealthyAnims[i];
          const prog = clamp(anim, 0, 1);
          return (
            <circle key={r.label}
              cx={scaleX(r.x)} cy={scaleY(r.y)}
              r={DOT_R * prog}
              fill={CLAUDE.INK_SOFT}
              opacity={prog * 0.75}
            />
          );
        })}

        {/* Wealthy bubbles */}
        {wealthy.map((r, i) => {
          const anim = wealthyAnims[i];
          const prog = clamp(anim, 0, 1);
          return (
            <circle key={r.label}
              cx={scaleX(r.x)} cy={scaleY(r.y)}
              r={DOT_R * prog}
              fill={CLAUDE.INK}
              opacity={prog * 0.85}
            />
          );
        })}

        {/* Terracotta cluster outline — ONE accent */}
        {clamp(accentIn, 0, 1) > 0.05 && (() => {
          // Compute bounding area of wealthy cluster + margin
          const xs = wealthy.map(r => scaleX(r.x));
          const ys = wealthy.map(r => scaleY(r.y));
          const minX = Math.min(...xs) - DOT_R - 14;
          const maxX = Math.max(...xs) + DOT_R + 14;
          const minY = Math.min(...ys) - DOT_R - 14;
          const maxY = Math.max(...ys) + DOT_R + 14;
          const prog = clamp(accentIn, 0, 1);

          return (
            <rect
              x={minX} y={minY}
              width={(maxX - minX) * prog} height={(maxY - minY) * prog}
              fill="none"
              stroke={CLAUDE.SPARK}
              strokeWidth={2}
              rx={8}
              opacity={prog * 0.8}
            />
          );
        })()}
      </svg>

      {/* Axis labels HTML */}
      <div style={{
        position: 'absolute',
        left: CHART_L + CHART_W / 2 - 120,
        top: CHART_B + 32,
        fontFamily: SANS, fontSize: height * 0.013,
        color: CLAUDE.INK_SOFT, opacity: clamp(axisIn * 0.8, 0, 1),
      }}>
        Jobs &amp; economy concern (% of respondents)
      </div>

      <div style={{
        position: 'absolute',
        left: PAD_X - 12,
        top: CHART_T + CHART_H / 2 - 60,
        fontFamily: SANS, fontSize: height * 0.013,
        color: CLAUDE.INK_SOFT, opacity: clamp(axisIn * 0.8, 0, 1),
        transform: 'rotate(-90deg)',
        transformOrigin: 'left center',
        whiteSpace: 'nowrap',
      }}>
        Negative AI sentiment (%)
      </div>

      {/* Region labels */}
      {REGIONS.map((r, i) => {
        const isWealthyRegion = r.isWealthy;
        const wealthyIdx = wealthy.indexOf(r);
        const nonWealthyIdx = nonWealthy.indexOf(r);
        const anim = isWealthyRegion
          ? wealthyAnims[wealthyIdx]
          : nonWealthyAnims[nonWealthyIdx];
        const prog = clamp(anim, 0, 1);

        const cx = scaleX(r.x);
        const cy = scaleY(r.y);

        // Offset label to avoid clutter — alternate top/bottom/right
        let lx = cx + DOT_R + 4;
        let ly = cy - 8;
        if (r.label === 'Sub-Saharan Africa') { lx = cx - 130; ly = cy + 14; }
        if (r.label === 'Latin America') { lx = cx - 110; ly = cy + 14; }
        if (r.label === 'Central Asia') { lx = cx - 90; ly = cy - 16; }
        if (r.label === 'Western Europe') { ly = cy - 20; }
        if (r.label === 'North America') { lx = cx + DOT_R + 4; ly = cy + 14; }
        if (r.label === 'East Asia') { lx = cx - 90; ly = cy - 16; }

        return (
          <div key={r.label} style={{
            position: 'absolute',
            left: lx, top: ly,
            fontFamily: SANS, fontSize: height * 0.011,
            color: isWealthyRegion ? CLAUDE.INK : CLAUDE.INK_SOFT,
            fontWeight: isWealthyRegion ? 600 : 400,
            opacity: prog * (prog > 0.3 ? 1 : 0),
            whiteSpace: 'nowrap',
          }}>
            {r.label}
          </div>
        );
      })}

      {/* Wealthy cluster callout */}
      {clamp(accentIn, 0, 1) > 0.5 && (
        <div style={{
          position: 'absolute',
          right: PAD_X,
          top: CHART_T,
          fontFamily: SERIF, fontSize: height * 0.014,
          fontStyle: 'italic', color: CLAUDE.SPARK,
          textAlign: 'right',
          opacity: clamp(accentIn, 0, 1),
          lineHeight: 1.35,
        }}>
          wealthier regions:<br />higher fear, higher negativity
        </div>
      )}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.12,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Data: Anthropic, What 81,000 People Want from AI (2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
