import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE_FONT } from '../tokens/claude';

// Finance palette — SKILL.md §Palette
const F = {
  PAGE:     '#FAF9F5',
  INK:      '#3D3929',
  RULE:     '#D8D2C4',
  INK_SOFT: '#73705F',
  GHOST:    '#A9A491',
  SUBJECT:  '#D97757',
  KEYLINE:  '#1a1a1a',
  // CVD-safe series
  TOTAL:    '#000000',
  INFLOW:   '#009E73',  // Okabe-Ito bluish green — profit/inflow
  OUTFLOW:  '#D55E00',  // Okabe-Ito vermilion — loss/cost/outflow
  OTHER:    '#F0E442',
} as const;

const COLOR_MAP: Record<string, string> = {
  total:   F.TOTAL,
  inflow:  F.INFLOW,
  outflow: F.OUTFLOW,
  other:   F.OTHER,
  subject: F.SUBJECT,
};

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const financeStackedBarSchema = z.object({
  title:    z.string(),
  subtitle: z.string().default(''),
  periods:  z.array(z.string()).min(1).max(8),
  segments: z.array(z.object({
    label:     z.string(),
    color:     z.enum(['total', 'inflow', 'outflow', 'other', 'subject']).default('other'),
    values:    z.array(z.number()),          // one value per period
    estimates: z.array(z.boolean()).default([]),  // one flag per period
  })).min(1).max(8),
  unit:       z.string().default('$B'),
  normalize:  z.boolean().default(false),    // true → stack to 100%
  source:     z.string().default(''),
  sparkLine:  z.string().default(''),
  glossTerms: z.array(z.string()).default([]),
});
export type FinanceStackedBarProps = z.infer<typeof financeStackedBarSchema>;


export const FinanceStackedBar: React.FC<FinanceStackedBarProps> = ({
  title, subtitle, periods, segments, unit, normalize, source, sparkLine, glossTerms = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const nPeriods  = periods.length;
  const nSegments = segments.length;

  // Compute period totals
  const periodTotals = periods.map((_, pi) =>
    segments.reduce((sum, seg) => sum + (seg.values[pi] ?? 0), 0)
  );
  const maxTotal = Math.max(...periodTotals, 1);

  // Plot dimensions
  const PAD_X      = width  * 0.07;
  const PLOT_TOP   = height * 0.26;
  const PLOT_BOT   = height * 0.80;
  const PLOT_H     = PLOT_BOT - PLOT_TOP;
  const PLOT_LEFT  = PAD_X + width * 0.04;
  const PLOT_RIGHT = width  - PAD_X - width * 0.02;
  const PLOT_W     = PLOT_RIGHT - PLOT_LEFT;

  const BAR_GAP   = PLOT_W * 0.05;
  const BAR_W     = (PLOT_W - BAR_GAP * (nPeriods + 1)) / nPeriods;

  // Springs: title, axes, then one spring per period for the bars
  const titleIn = spring({ frame,             fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axesIn  = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const barIn   = periods.map((_, pi) =>
    spring({ frame: frame - 22 - pi * 14, fps, config: { damping: 24, stiffness: 90, mass: 0.9 } })
  );

  const afterBars = 22 + nPeriods * 14 + 20;
  const legendIn  = spring({ frame: frame - afterBars,      fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const srcIn     = spring({ frame: frame - afterBars + 16, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn   = spring({ frame: frame - afterBars + 30, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Y-axis ticks
  const yLabel = normalize ? ['0%', '25%', '50%', '75%', '100%'] : undefined;
  const yTicks = normalize
    ? [0, 25, 50, 75, 100]
    : [0, maxTotal * 0.25, maxTotal * 0.5, maxTotal * 0.75, maxTotal];

  const valToY = (v: number) => {
    const pct = normalize ? v : (v / maxTotal);
    return PLOT_BOT - pct * PLOT_H;
  };

  // Determine if any estimates
  const hasEstimates = segments.some(seg =>
    (seg.estimates ?? []).some(Boolean)
  );

  return (
    <AbsoluteFill style={{ background: F.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.06,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: F.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        SEGMENT BREAKDOWN
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.10,
        fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 700,
        color: F.INK, letterSpacing: '-0.01em', lineHeight: 1.2,
        maxWidth: width * 0.75,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {title}
      </div>

      {subtitle ? (
        <div style={{
          position: 'absolute', left: PAD_X, top: height * 0.165,
          fontFamily: SERIF, fontSize: height * 0.017, fontStyle: 'italic',
          color: F.INK_SOFT, opacity: clamp(titleIn, 0, 1),
        }}>
          {subtitle}
        </div>
      ) : null}

      {/* SVG layer */}
      <svg style={{
        position: 'absolute', left: 0, top: 0,
        width, height, overflow: 'visible', pointerEvents: 'none',
      }}>

        {/* Y-axis */}
        <line x1={PLOT_LEFT} y1={PLOT_TOP} x2={PLOT_LEFT} y2={PLOT_BOT}
          stroke={F.RULE} strokeWidth={1.5} opacity={clamp(axesIn, 0, 1)} />

        {/* X-axis baseline */}
        <line x1={PLOT_LEFT} y1={PLOT_BOT} x2={PLOT_RIGHT} y2={PLOT_BOT}
          stroke={F.RULE} strokeWidth={1.5} opacity={clamp(axesIn, 0, 1)} />

        {/* Y-axis ticks + grid lines */}
        {yTicks.map((tick, ti) => {
          const y = valToY(normalize ? tick : tick);
          const lbl = normalize
            ? `${tick}%`
            : `${tick >= 1 ? tick.toFixed(1) : '0'}${unit}`;
          return (
            <g key={ti} opacity={clamp(axesIn, 0, 1)}>
              <line x1={PLOT_LEFT - 6} y1={y} x2={PLOT_LEFT} y2={y}
                stroke={F.RULE} strokeWidth={1.5} />
              <line x1={PLOT_LEFT} y1={y} x2={PLOT_RIGHT} y2={y}
                stroke={F.RULE} strokeWidth={1} strokeDasharray="4 6" opacity={0.45} />
              <text x={PLOT_LEFT - 12} y={y + 5}
                textAnchor="end" fontFamily={SANS} fontSize={height * 0.011}
                fill={F.INK_SOFT}>
                {yLabel ? yLabel[ti] : lbl}
              </text>
            </g>
          );
        })}

        {/* Stacked bars, one per period */}
        {periods.map((period, pi) => {
          const barSp   = clamp(barIn[pi], 0, 1);
          const barX    = PLOT_LEFT + BAR_GAP + pi * (BAR_W + BAR_GAP);
          const total   = periodTotals[pi];

          // Build segments bottom to top
          let accumPct = 0;

          return (
            <g key={pi}>
              {segments.map((seg, si) => {
                const rawVal = seg.values[pi] ?? 0;
                const pct    = normalize
                  ? (total > 0 ? rawVal / total : 0)
                  : (rawVal / maxTotal);
                const segH   = pct * PLOT_H * barSp;
                const isEst  = (seg.estimates ?? [])[pi] ?? false;
                const fill   = COLOR_MAP[seg.color] ?? F.OTHER;

                const y  = PLOT_BOT - (accumPct + pct) * PLOT_H * barSp;
                accumPct += pct;

                return (
                  <g key={si}>
                    <rect
                      x={barX} y={y}
                      width={BAR_W} height={segH}
                      fill={fill}
                      stroke={F.KEYLINE} strokeWidth={1}
                      strokeDasharray={isEst ? '5 3' : undefined}
                      opacity={barSp * 0.9}
                    />
                  </g>
                );
              })}

              {/* Period label */}
              <text x={barX + BAR_W / 2} y={PLOT_BOT + 22}
                textAnchor="middle" fontFamily={SANS}
                fontSize={height * 0.014} fill={F.INK}
                opacity={barSp}>
                {period}
              </text>

              {/* Total value above bar */}
              {!normalize && (
                <text
                  x={barX + BAR_W / 2}
                  y={PLOT_BOT - periodTotals[pi] / maxTotal * PLOT_H * barSp - 8}
                  textAnchor="middle" fontFamily={SANS}
                  fontSize={height * 0.012} fill={F.INK_SOFT}
                  opacity={interpolate(barSp, [0.7, 1], [0, 1], {
                    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                  })}>
                  {periodTotals[pi].toFixed(1)}{unit}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend — bottom */}
      <div style={{
        position: 'absolute',
        left: PAD_X + width * 0.04, bottom: height * 0.13,
        display: 'flex', flexWrap: 'wrap' as const, gap: '5px 22px',
        maxWidth: width * 0.86, opacity: clamp(legendIn, 0, 1),
      }}>
        {segments.map((seg, si) => {
          const fill = COLOR_MAP[seg.color] ?? F.OTHER;
          return (
            <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 14, height: 14, flexShrink: 0,
                background: fill,
                border: `1px solid ${F.KEYLINE}`,
                outline: seg.color === 'other' ? `1px solid ${F.KEYLINE}` : undefined,
              }} />
              <span style={{
                fontFamily: SANS, fontSize: height * 0.012,
                color: F.INK_SOFT,
              }}>
                {seg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Estimate / source note */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.011, color: F.GHOST,
        opacity: clamp(srcIn, 0, 1),
      }}>
        {hasEstimates
          ? `Dashed border = back-solved estimate. ${source}`
          : source}
      </div>

      {/* Gloss line */}
      {glossTerms.length > 0 && (
        <div style={{
          position: 'absolute', left: PAD_X, right: PAD_X, bottom: height * 0.025,
          fontFamily: SANS, fontSize: height * 0.0095, color: F.RULE,
          letterSpacing: '0.02em', opacity: clamp(srcIn, 0, 1),
        }}>
          {glossTerms.join(' · ')}
        </div>
      )}

      {/* Spark line */}
      {sparkLine ? (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: height * 0.04,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, opacity: clamp(sparkIn, 0, 1),
        }}>
          <span style={{
            fontFamily: SERIF, fontSize: height * 0.022,
            fontStyle: 'italic', color: F.INK,
          }}>
            {sparkLine}
          </span>
        </div>
      ) : null}

    </AbsoluteFill>
  );
};
