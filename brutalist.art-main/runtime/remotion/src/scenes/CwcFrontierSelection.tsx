import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcFrontierSelection — How to pick the optimal model from the scatter
 * Pareto scatter with decision boundary line + frontier ring annotations
 * Source: rightmodel/ — CWC Workshop 2026
 */

export const cwcFrontierSelectionSchema = z.object({
  sparkLine: z.string().default("On the frontier — never off it."),
});
export type CwcFrontierSelectionProps = z.infer<typeof cwcFrontierSelectionSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const GREEN = '#4CAF50';

// Scatter data: cost (x fraction 0-1), quality (y fraction 0-1), label, isFrontier
const POINTS = [
  // Opus cluster — expensive, high quality
  { cx: 0.78, cy: 0.85, label: 'Opus', model: 'Opus', frontier: false, dominated: false },
  // Sonnet — frontier
  { cx: 0.38, cy: 0.68, label: 'Sonnet', model: 'Sonnet', frontier: true, dominated: false },
  // Haiku cluster — cheap, lower quality
  { cx: 0.10, cy: 0.45, label: 'Haiku', model: 'Haiku', frontier: false, dominated: false },
  // Dominated points (bad value)
  { cx: 0.55, cy: 0.50, label: '', model: '', frontier: false, dominated: true },
  { cx: 0.30, cy: 0.38, label: '', model: '', frontier: false, dominated: true },
];

export const CwcFrontierSelection: React.FC<CwcFrontierSelectionProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axisIn = spring({ frame: frame - 15, fps, config: { damping: 26, stiffness: 100 } });
  const lineIn = spring({ frame: frame - 150, fps, config: { damping: 22, stiffness: 80, mass: 1.2 } });
  const labelIn = spring({ frame: frame - 200, fps, config: { damping: 26, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 260, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const CHART_L = PAD_X + width * 0.08;
  const CHART_T = height * 0.22;
  const CHART_W = width * 0.60;
  const CHART_H = height * 0.56;
  const CHART_B = CHART_T + CHART_H;
  const CHART_R = CHART_L + CHART_W;

  const DOT_R = 16;
  const FRONTIER_RING = DOT_R + 8;

  // Map fraction coords to pixel coords
  const toX = (fx: number) => CHART_L + fx * CHART_W;
  const toY = (fy: number) => CHART_B - fy * CHART_H; // invert y

  // Frontier line: from Haiku through Sonnet extended
  const line_x1 = toX(-0.05);
  const line_y1 = toY(0.18);
  const line_x2 = toX(0.80);
  const line_y2 = toY(0.92);
  const lineProgress = clamp(lineIn, 0, 1);
  const line_cx2 = line_x1 + (line_x2 - line_x1) * lineProgress;
  const line_cy2 = line_y1 + (line_y2 - line_y1) * lineProgress;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        FRONTIER SELECTION · PARETO SCATTER
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        Pick the frontier point closest to your quality threshold
      </div>

      {/* SVG chart */}
      <svg style={{
        position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
        overflow: 'visible',
      }}>
        {/* Axes */}
        <g opacity={clamp(axisIn, 0, 1)}>
          {/* X axis */}
          <line x1={CHART_L} y1={CHART_B} x2={CHART_R} y2={CHART_B} stroke={CLAUDE.BORDER} strokeWidth={2} />
          {/* Y axis */}
          <line x1={CHART_L} y1={CHART_T} x2={CHART_L} y2={CHART_B} stroke={CLAUDE.BORDER} strokeWidth={2} />
          {/* Axis labels */}
          <text x={CHART_L + CHART_W / 2} y={CHART_B + height * 0.055}
            textAnchor="middle" fontFamily={SANS} fontSize={height * 0.011}
            fill={CLAUDE.INK_SOFT} fontWeight={600} letterSpacing={1}>
            COST PER CALL →
          </text>
          <text x={CHART_L - width * 0.055} y={CHART_T + CHART_H / 2}
            textAnchor="middle" fontFamily={SANS} fontSize={height * 0.011}
            fill={CLAUDE.INK_SOFT} fontWeight={600} letterSpacing={1}
            transform={`rotate(-90, ${CHART_L - width * 0.055}, ${CHART_T + CHART_H / 2})`}>
            ACCURACY % →
          </text>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(f => (
            <React.Fragment key={f}>
              <line x1={CHART_L} y1={toY(f)} x2={CHART_R} y2={toY(f)}
                stroke={CLAUDE.BORDER} strokeWidth={1} strokeDasharray="4 4" />
              <line x1={toX(f)} y1={CHART_T} x2={toX(f)} y2={CHART_B}
                stroke={CLAUDE.BORDER} strokeWidth={1} strokeDasharray="4 4" />
            </React.Fragment>
          ))}
        </g>

        {/* Frontier line */}
        <line x1={line_x1} y1={line_y1} x2={line_cx2} y2={line_cy2}
          stroke={CLAUDE.SPARK} strokeWidth={2.5} strokeDasharray="8 4" opacity={0.7} />

        {/* Dominated region shading */}
        <rect x={CHART_L} y={CHART_T} width={CHART_W} height={CHART_H}
          fill={`${CLAUDE.INK_SOFT}06`}
          clipPath="url(#dominated)"
          opacity={clamp(lineIn, 0, 1)} />

        {/* Points */}
        {POINTS.map((pt, i) => {
          const ptIn = spring({ frame: frame - 35 - i * 20, fps, config: { damping: 24, stiffness: 100 } });
          const px = toX(pt.cx);
          const py = toY(pt.cy);
          const op = clamp(ptIn, 0, 1);

          return (
            <g key={i} opacity={op}>
              {pt.frontier && (
                <circle cx={px} cy={py} r={FRONTIER_RING * op}
                  fill="none" stroke={CLAUDE.SPARK} strokeWidth={2.5} />
              )}
              <circle cx={px} cy={py} r={DOT_R * op}
                fill={pt.dominated ? `${CLAUDE.BORDER}` : (pt.frontier ? CLAUDE.SPARK : CLAUDE.INK_SOFT)}
                opacity={pt.dominated ? 0.5 : 1} />
              {pt.label && (
                <text x={px} y={py - DOT_R - 8}
                  textAnchor="middle" fontFamily={SANS} fontSize={height * 0.011}
                  fill={pt.frontier ? CLAUDE.SPARK : CLAUDE.INK_SOFT} fontWeight={700}>
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        left: CHART_R + width * 0.03, top: CHART_T,
        width: width * 0.20,
        display: 'flex', flexDirection: 'column', gap: 14,
        opacity: clamp(labelIn, 0, 1),
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, fontWeight: 700, color: CLAUDE.SPARK, letterSpacing: 1, textTransform: 'uppercase' as const }}>
          Frontier
        </div>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.012, color: CLAUDE.INK, lineHeight: 1.6, fontStyle: 'italic' }}>
          Points on the dashed line: dominated points below-left offer worse value.
        </div>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.012, color: CLAUDE.INK, lineHeight: 1.6, fontStyle: 'italic' }}>
          Pick the frontier point closest to your quality threshold — not the most accurate.
        </div>
        <div style={{
          background: `${CLAUDE.SPARK}12`,
          border: `1px solid ${CLAUDE.SPARK}40`,
          borderRadius: 6, padding: '8px 12px',
          fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.SPARK, fontWeight: 700,
        }}>
          Sonnet: 90% quality, $0.04/call
        </div>
      </div>

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
