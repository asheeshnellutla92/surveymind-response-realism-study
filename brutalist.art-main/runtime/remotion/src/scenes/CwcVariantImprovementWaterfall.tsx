import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcVariantImprovementWaterfall — Cumulative improvement across 6 variants
 * Horizontal waterfall: Naive=42 → +ReAct=14 → +Memory=8 → +Critic=9 → +ToolPlan=5 → +Format=3 = 81%
 * Source: eval-driven-agent-development/ — CWC Workshop 2026
 */

export const cwcVariantImprovementWaterfallSchema = z.object({
  sparkLine: z.string().default("Every structured change is a measurable gain."),
});
export type CwcVariantImprovementWaterfallProps = z.infer<typeof cwcVariantImprovementWaterfallSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const VARIANTS = [
  { label: 'Naive', delta: 42, base: 0, color: '#8B7355', isFinal: false },
  { label: '+ReAct', delta: 14, base: 42, color: '#9E7D5C', isFinal: false },
  { label: '+Memory', delta: 8, base: 56, color: '#B08060', isFinal: false },
  { label: '+Critic', delta: 9, base: 64, color: '#C28060', isFinal: false },
  { label: '+ToolPlan', delta: 5, base: 73, color: '#D07840', isFinal: false },
  { label: '+Format', delta: 3, base: 78, color: CLAUDE.SPARK, isFinal: true },
];

const TOTAL = 81;
const MAX_PCT = 100;

export const CwcVariantImprovementWaterfall: React.FC<CwcVariantImprovementWaterfallProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;
  const CHART_L = PAD_X + width * 0.06;
  const CHART_W = width * 0.82;
  const CHART_H = height * 0.46;
  const CHART_T = height * 0.26;
  const CHART_B = CHART_T + CHART_H;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axisIn = spring({ frame: frame - 15, fps, config: { damping: 26, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 270, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const BAR_W = CHART_W / VARIANTS.length - 12;
  const pxPerPct = CHART_H / MAX_PCT;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        VARIANT IMPROVEMENT · WATERFALL
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        42% → 81%: each change, each delta
      </div>

      {/* Axis */}
      <svg style={{
        position: 'absolute', left: CHART_L - 40, top: CHART_T,
        width: CHART_W + 80, height: CHART_H + 30,
        overflow: 'visible', opacity: clamp(axisIn, 0, 1),
      }}>
        {/* Baseline */}
        <line x1={40} y1={CHART_H} x2={CHART_W + 40} y2={CHART_H} stroke={CLAUDE.BORDER} strokeWidth={2} />
        {/* Y-axis labels */}
        {[0, 20, 40, 60, 80, 100].map(pct => (
          <g key={pct}>
            <line x1={35} y1={CHART_H - pct * pxPerPct} x2={CHART_W + 40} y2={CHART_H - pct * pxPerPct}
              stroke={CLAUDE.BORDER} strokeWidth={1} strokeDasharray="4 4" />
            <text x={30} y={CHART_H - pct * pxPerPct + 5}
              textAnchor="end" fontFamily={SANS} fontSize={height * 0.009}
              fill={CLAUDE.INK_SOFT}>{pct}%</text>
          </g>
        ))}
      </svg>

      {/* Bars */}
      {VARIANTS.map((v, i) => {
        const barIn = spring({ frame: frame - 30 - i * 28, fps, config: { damping: 26, stiffness: 100 } });
        const labelIn = spring({ frame: frame - 50 - i * 28, fps, config: { damping: 26, stiffness: 100 } });
        const progress = clamp(barIn, 0, 1);

        const barX = CHART_L + i * (BAR_W + 12);
        const barH = v.delta * pxPerPct * progress;
        const barTop = CHART_B - (v.base + v.delta) * pxPerPct;
        const baseTop = CHART_B - v.base * pxPerPct;

        return (
          <React.Fragment key={v.label}>
            {/* Stacked base connector (for non-naive bars) */}
            {i > 0 && (
              <div style={{
                position: 'absolute',
                left: barX, top: baseTop - 2,
                width: BAR_W, height: 2,
                background: CLAUDE.BORDER,
                opacity: clamp(barIn, 0, 1),
              }} />
            )}
            {/* Bar */}
            <div style={{
              position: 'absolute',
              left: barX, top: baseTop - barH,
              width: BAR_W, height: barH,
              background: v.isFinal ? CLAUDE.SPARK : v.color,
              borderRadius: '4px 4px 0 0',
              opacity: progress,
            }} />
            {/* Delta label above bar */}
            <div style={{
              position: 'absolute',
              left: barX, top: baseTop - v.delta * pxPerPct - height * 0.045,
              width: BAR_W, textAlign: 'center' as const,
              fontFamily: MONO, fontSize: height * 0.012,
              color: v.isFinal ? CLAUDE.SPARK : CLAUDE.INK,
              fontWeight: 700,
              opacity: clamp(labelIn, 0, 1),
            }}>
              {i === 0 ? `${v.delta}%` : `+${v.delta}%`}
            </div>
            {/* Variant label below */}
            <div style={{
              position: 'absolute',
              left: barX, top: CHART_B + 8,
              width: BAR_W, textAlign: 'center' as const,
              fontFamily: SANS, fontSize: height * 0.009,
              color: v.isFinal ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
              fontWeight: v.isFinal ? 700 : 400,
              opacity: clamp(labelIn, 0, 1),
            }}>
              {v.label}
            </div>
          </React.Fragment>
        );
      })}

      {/* Total label */}
      {(() => {
        const totIn = spring({ frame: frame - 230, fps, config: { damping: 24, stiffness: 90 } });
        return (
          <div style={{
            position: 'absolute',
            right: PAD_X, top: CHART_T - height * 0.04,
            fontFamily: SERIF, fontSize: height * 0.032, fontWeight: 700,
            color: CLAUDE.SPARK, fontStyle: 'italic',
            opacity: clamp(totIn, 0, 1),
          }}>
            81% total
          </div>
        );
      })()}

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
