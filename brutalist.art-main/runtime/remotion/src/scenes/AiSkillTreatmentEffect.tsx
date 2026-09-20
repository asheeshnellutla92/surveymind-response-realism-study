import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AiSkillTreatmentEffect — Figure 2 rebuild for "AI Speeds You Up. What Does It Do to Your Skills?"
 * Source: Shen & Tamkin 2026, arXiv:2601.20245
 *
 * Panel A — Task time (minutes), point estimate + 95% CI:
 *   AI:    23.0 min [20.6, 25.5]
 *   No AI: 24.7 min [21.7, 27.6]
 *   Label: p = 0.391 (not significant)
 *
 * Panel B — Quiz score (%), point estimate + 95% CI:
 *   AI:    50% [41, 59]
 *   No AI: 67% [59, 72]
 *   Label: p = 0.010*, Cohen's d = 0.738
 *
 * prop "panel" = "A" | "B" controls which panel shows.
 * Animate: point drops in, CI whiskers grow outward, bracket + p-value last.
 * Terracotta accent = the gap between the Panel B points (the mastery cost).
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const aiSkillTreatmentEffectSchema = z.object({
  panel: z.enum(['A', 'B']).default('A'),
  sparkLine: z.string().default(''),
});
export type AiSkillTreatmentEffectProps = z.infer<typeof aiSkillTreatmentEffectSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Data from paper Table 2
const PANEL_DATA = {
  A: {
    title: 'Task Completion Time',
    unit: 'minutes',
    axis: { min: 16, max: 30, step: 2 },
    points: [
      { label: 'AI group', mean: 23.0, lo: 20.6, hi: 25.5 },
      { label: 'No AI group', mean: 24.7, lo: 21.7, hi: 27.6 },
    ],
    pLabel: 'p = 0.391  (not significant)',
    significant: false,
  },
  B: {
    title: 'Skills Quiz Score',
    unit: '%',
    axis: { min: 25, max: 80, step: 5 },
    points: [
      { label: 'AI group', mean: 50, lo: 41, hi: 59 },
      { label: 'No AI group', mean: 67, lo: 59, hi: 72 },
    ],
    pLabel: 'p = 0.010*   Cohen\'s d = 0.738',
    significant: true,
  },
};

export const AiSkillTreatmentEffect: React.FC<AiSkillTreatmentEffectProps> = ({ panel, sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const data = PANEL_DATA[panel];

  // Animation timing
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const point0In = spring({ frame: frame - 15, fps, config: { damping: 26, stiffness: 110, mass: 0.9 } });
  const whisker0In = spring({ frame: frame - 25, fps, config: { damping: 24, stiffness: 90, mass: 0.9 } });
  const point1In = spring({ frame: frame - 30, fps, config: { damping: 26, stiffness: 110, mass: 0.9 } });
  const whisker1In = spring({ frame: frame - 40, fps, config: { damping: 24, stiffness: 90, mass: 0.9 } });
  const bracketIn = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const pLabelIn = spring({ frame: frame - 65, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 75, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 70, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const pointAnims = [point0In, point1In];
  const whiskerAnims = [whisker0In, whisker1In];

  const PAD_X = width * 0.10;
  const PAD_Y = height * 0.08;
  const CHART_L = PAD_X + 140;
  const CHART_R = width - PAD_X - 60;
  const CHART_T = height * 0.24;
  const CHART_B = height * 0.72;
  const CHART_W = CHART_R - CHART_L;
  const CHART_H = CHART_B - CHART_T;

  const { min, max } = data.axis;
  const scale = (v: number) => CHART_L + ((v - min) / (max - min)) * CHART_W;

  // Colors: AI group = SPARK (terracotta only for panel B where gap matters), No AI = INK
  // Panel A: both muted (overlapping CIs, not significant)
  // Panel B: AI group = SPARK (the cost), No AI = INK
  const dotColors = panel === 'B'
    ? [CLAUDE.SPARK, CLAUDE.INK]
    : [CLAUDE.INK_SOFT, CLAUDE.INK_SOFT];

  const DOT_R = 10;
  const ROW_H = CHART_H / 3;
  const y0 = CHART_T + ROW_H * 0.75;
  const y1 = CHART_T + ROW_H * 1.75;
  const yValues = [y0, y1];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.015,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        TREATMENT EFFECT · PANEL {panel}
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.06,
        fontFamily: SERIF,
        fontSize: height * 0.038,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {data.title}
      </div>

      {/* Unit label top-right of chart */}
      <div style={{
        position: 'absolute',
        right: PAD_X + 60,
        top: CHART_T - 28,
        fontFamily: SANS,
        fontSize: height * 0.014,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn * 0.7, 0, 1),
      }}>
        ({data.unit})
      </div>

      {/* X-axis baseline */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width, height }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Axis line */}
        <line
          x1={CHART_L} y1={CHART_B + 2}
          x2={CHART_R} y2={CHART_B + 2}
          stroke={CLAUDE.BORDER} strokeWidth={1.5}
          opacity={clamp(titleIn, 0, 1)}
        />

        {/* Tick marks and labels */}
        {Array.from({ length: Math.round((max - min) / data.axis.step) + 1 }, (_, i) => {
          const val = min + i * data.axis.step;
          const x = scale(val);
          return (
            <g key={val} opacity={clamp(titleIn * 0.7, 0, 1)}>
              <line x1={x} y1={CHART_B + 2} x2={x} y2={CHART_B + 10} stroke={CLAUDE.BORDER} strokeWidth={1} />
              <text x={x} y={CHART_B + 24} textAnchor="middle"
                fontFamily={SANS} fontSize={height * 0.012} fill={CLAUDE.INK_SOFT}>
                {val}
              </text>
            </g>
          );
        })}

        {/* Data points and whiskers */}
        {data.points.map((pt, i) => {
          const cy = yValues[i];
          const cx = scale(pt.mean);
          const cxLo = scale(pt.lo);
          const cxHi = scale(pt.hi);
          const ptAnim = pointAnims[i];
          const wAnim = whiskerAnims[i];
          const color = dotColors[i];

          return (
            <g key={i}>
              {/* CI whisker line — grows from center outward */}
              <line
                x1={cx - (cx - cxLo) * clamp(wAnim, 0, 1)}
                y1={cy}
                x2={cx + (cxHi - cx) * clamp(wAnim, 0, 1)}
                y2={cy}
                stroke={color} strokeWidth={2.5} opacity={0.6}
              />
              {/* CI end caps */}
              <line
                x1={cxLo} y1={cy - 7 * clamp(wAnim, 0, 1)}
                x2={cxLo} y2={cy + 7 * clamp(wAnim, 0, 1)}
                stroke={color} strokeWidth={2} opacity={clamp(wAnim, 0, 1) * 0.6}
              />
              <line
                x1={cxHi} y1={cy - 7 * clamp(wAnim, 0, 1)}
                x2={cxHi} y2={cy + 7 * clamp(wAnim, 0, 1)}
                stroke={color} strokeWidth={2} opacity={clamp(wAnim, 0, 1) * 0.6}
              />
              {/* Point */}
              <circle
                cx={cx} cy={cy} r={DOT_R * clamp(ptAnim, 0, 1)}
                fill={color}
              />
            </g>
          );
        })}

        {/* Significance bracket (between points, Panel B only) */}
        {panel === 'B' && (
          <g opacity={clamp(bracketIn, 0, 1)}>
            <line
              x1={scale(data.points[0].mean)} y1={y0 - 22}
              x2={scale(data.points[1].mean)} y2={y0 - 22}
              stroke={CLAUDE.SPARK} strokeWidth={2}
            />
            <line
              x1={scale(data.points[0].mean)} y1={y0 - 22}
              x2={scale(data.points[0].mean)} y2={y0 - 10}
              stroke={CLAUDE.SPARK} strokeWidth={2}
            />
            <line
              x1={scale(data.points[1].mean)} y1={y0 - 22}
              x2={scale(data.points[1].mean)} y2={y0 - 10}
              stroke={CLAUDE.SPARK} strokeWidth={2}
            />
          </g>
        )}
      </svg>

      {/* Row labels (left of chart) */}
      {data.points.map((pt, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: PAD_X,
          top: yValues[i] - 16,
          width: CHART_L - PAD_X - 8,
          textAlign: 'right',
          opacity: clamp(pointAnims[i], 0, 1),
        }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: height * 0.018,
            fontWeight: 600,
            color: i === 0 && panel === 'B' ? CLAUDE.SPARK : CLAUDE.INK,
            lineHeight: 1.2,
          }}>{pt.label}</div>
          <div style={{
            fontFamily: SANS,
            fontSize: height * 0.014,
            color: CLAUDE.INK_SOFT,
            marginTop: 2,
          }}>
            {pt.mean}{data.unit === '%' ? '%' : ' min'}
            <span style={{ fontSize: height * 0.011 }}> [{pt.lo}, {pt.hi}]</span>
          </div>
        </div>
      ))}

      {/* p-value label */}
      <div style={{
        position: 'absolute',
        left: CHART_L,
        top: CHART_B + 44,
        fontFamily: SANS,
        fontSize: height * 0.017,
        fontWeight: data.significant ? 700 : 400,
        color: data.significant ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
        opacity: clamp(pLabelIn, 0, 1),
        transform: `translateY(${(1 - pLabelIn) * 8}px)`,
      }}>
        {data.pLabel}
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Data: Anthropic — Shen &amp; Tamkin 2026, arXiv:2601.20245
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.022,
          fontStyle: 'italic',
          color: CLAUDE.INK,
        }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
