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
  SUBJECT:  '#D97757',   // terracotta — subject company ONLY (not used in single-company view)
  KEYLINE:  '#1a1a1a',   // mandatory 1px keyline on every fill
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
};

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const itemSchema = z.object({
  label:      z.string(),
  pct:        z.number(),             // % of total (0–100)
  value:      z.string().default(''), // formatted string e.g. "$62.1B"
  color:      z.enum(['total', 'inflow', 'outflow', 'other']).default('other'),
  estimate:   z.boolean().default(false),
  isSubtotal: z.boolean().default(false),
});

export const financeMirroredBarSchema = z.object({
  title:       z.string(),
  subtitle:    z.string().default(''),
  leftLabel:   z.string().default('Assets'),
  rightLabel:  z.string().default('Liabilities & Equity'),
  leftItems:   z.array(itemSchema),
  rightItems:  z.array(itemSchema),
  totalValue:  z.string().default(''),
  source:      z.string().default(''),
  sparkLine:   z.string().default(''),
  glossTerms:  z.array(z.string()).default([]),
});
export type FinanceMirroredBarProps = z.infer<typeof financeMirroredBarSchema>;


export const FinanceMirroredBar: React.FC<FinanceMirroredBarProps> = ({
  title, subtitle, leftLabel, rightLabel, leftItems, rightItems,
  totalValue, source, sparkLine, glossTerms = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Layout constants — PAD_X ≥ 10% keeps content inside title-safe boundary
  const PAD_X      = width  * 0.10;
  const PLOT_TOP   = height * 0.24;
  const PLOT_BOT   = height * 0.86;
  const PLOT_H     = PLOT_BOT - PLOT_TOP;
  const CENTER_X   = width  * 0.50;
  const AXIS_W     = 120; // px around center for labels
  const BAR_MAX    = (width - PAD_X * 2 - AXIS_W) / 2; // max bar width = 100%, stays inside PAD_X

  const BAR_H = 36;
  const GAP   = 12;

  // Springs
  const titleIn = spring({ frame,             fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const hdrIn   = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });

  // Individual bar springs, staggered per side
  const leftSprings  = leftItems.map((_, i) =>
    spring({ frame: frame - 20 - i * 10, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } })
  );
  const rightSprings = rightItems.map((_, i) =>
    spring({ frame: frame - 20 - i * 10, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } })
  );

  const afterBars = 20 + Math.max(leftItems.length, rightItems.length) * 10 + 20;
  const srcIn    = spring({ frame: frame - afterBars,      fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn  = spring({ frame: frame - afterBars + 20, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Y position for each left row
  const leftY  = leftItems.map((_, i)  => PLOT_TOP + i  * (BAR_H + GAP));
  const rightY = rightItems.map((_, i) => PLOT_TOP + i  * (BAR_H + GAP));

  return (
    <AbsoluteFill style={{ background: F.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.06,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: F.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        BALANCE SHEET
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

      {/* SVG: bars and center axis */}
      <svg style={{
        position: 'absolute', left: 0, top: 0,
        width, height, overflow: 'visible', pointerEvents: 'none',
      }}>
        {/* Center axis */}
        <line x1={CENTER_X} y1={PLOT_TOP - 20} x2={CENTER_X} y2={PLOT_BOT}
          stroke={F.RULE} strokeWidth={1.5} opacity={clamp(hdrIn, 0, 1)} />

        {/* Column headers */}
        <text x={CENTER_X - AXIS_W / 2 - 24} y={PLOT_TOP - 28}
          textAnchor="end" fontFamily={SANS} fontSize={height * 0.014} fontWeight="700"
          letterSpacing={2} fill={F.INK} opacity={clamp(hdrIn, 0, 1)}>
          {leftLabel.toUpperCase()}
        </text>
        <text x={CENTER_X + AXIS_W / 2 + 24} y={PLOT_TOP - 28}
          textAnchor="start" fontFamily={SANS} fontSize={height * 0.014} fontWeight="700"
          letterSpacing={2} fill={F.INK} opacity={clamp(hdrIn, 0, 1)}>
          {rightLabel.toUpperCase()}
        </text>

        {/* Total value annotation */}
        {totalValue ? (
          <text x={CENTER_X} y={PLOT_TOP - 28}
            textAnchor="middle" fontFamily={SERIF} fontSize={height * 0.016} fontStyle="italic"
            fill={F.INK_SOFT} opacity={clamp(hdrIn, 0, 1)}>
            {totalValue} total
          </text>
        ) : null}

        {/* LEFT bars (grow left from center) */}
        {leftItems.map((item, i) => {
          const sp     = clamp(leftSprings[i], 0, 1);
          const barW   = item.pct / 100 * BAR_MAX * sp;
          const x      = CENTER_X - AXIS_W / 2;
          const y      = leftY[i];
          const fill   = COLOR_MAP[item.color] ?? F.OTHER;
          const isYellow = item.color === 'other';
          return (
            <g key={`left-${i}`}>
              {/* GAAP subtotal band */}
              {item.isSubtotal && (
                <line x1={PAD_X} y1={y - 4} x2={CENTER_X - AXIS_W / 2} y2={y - 4}
                  stroke={F.RULE} strokeWidth={1} strokeDasharray="3 3" opacity={sp} />
              )}
              {/* Bar rectangle (grows leftward from center) */}
              <rect
                x={x - barW} y={y} width={barW} height={BAR_H}
                fill={fill}
                stroke={F.KEYLINE} strokeWidth={1}
                strokeDasharray={item.estimate ? '5 3' : undefined}
                opacity={sp * (isYellow ? 1 : 0.85)}
              />
              {/* % label inside bar if wide enough */}
              {barW > 60 && (
                <text x={x - barW / 2} y={y + BAR_H / 2 + 5}
                  textAnchor="middle" fontFamily={SANS} fontSize={height * 0.012}
                  fill={F.INK} opacity={interpolate(sp, [0.7, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                  {item.pct.toFixed(1)}%
                </text>
              )}
              {/* Value label to the left of bar — clamped so it never crosses PAD_X */}
              {item.value && (
                <text x={Math.max(PAD_X + 8, x - barW - 8)} y={y + BAR_H / 2 + 5}
                  textAnchor="end" fontFamily={SANS} fontSize={height * 0.011}
                  fill={F.INK_SOFT} opacity={interpolate(sp, [0.6, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                  {item.value}
                </text>
              )}
            </g>
          );
        })}

        {/* LEFT labels (right of center axis) */}
        {leftItems.map((item, i) => {
          const sp = clamp(leftSprings[i], 0, 1);
          const y  = leftY[i];
          return (
            <text key={`llbl-${i}`}
              x={CENTER_X - AXIS_W / 2 + 8} y={y + BAR_H / 2 + 5}
              textAnchor="start" fontFamily={SANS} fontSize={height * 0.012}
              fontWeight={item.isSubtotal ? 700 : 400}
              fill={F.INK} opacity={sp}>
              {item.label}
            </text>
          );
        })}

        {/* RIGHT bars (grow right from center) */}
        {rightItems.map((item, i) => {
          const sp     = clamp(rightSprings[i], 0, 1);
          const barW   = item.pct / 100 * BAR_MAX * sp;
          const x      = CENTER_X + AXIS_W / 2;
          const y      = rightY[i];
          const fill   = COLOR_MAP[item.color] ?? F.OTHER;
          const isYellow = item.color === 'other';
          return (
            <g key={`right-${i}`}>
              {item.isSubtotal && (
                <line x1={CENTER_X + AXIS_W / 2} y1={y - 4} x2={width - PAD_X} y2={y - 4}
                  stroke={F.RULE} strokeWidth={1} strokeDasharray="3 3" opacity={sp} />
              )}
              <rect
                x={x} y={y} width={barW} height={BAR_H}
                fill={fill}
                stroke={F.KEYLINE} strokeWidth={1}
                strokeDasharray={item.estimate ? '5 3' : undefined}
                opacity={sp * (isYellow ? 1 : 0.85)}
              />
              {barW > 60 && (
                <text x={x + barW / 2} y={y + BAR_H / 2 + 5}
                  textAnchor="middle" fontFamily={SANS} fontSize={height * 0.012}
                  fill={F.INK} opacity={interpolate(sp, [0.7, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                  {item.pct.toFixed(1)}%
                </text>
              )}
              {item.value && (
                <text x={x + barW + 8} y={y + BAR_H / 2 + 5}
                  textAnchor="start" fontFamily={SANS} fontSize={height * 0.011}
                  fill={F.INK_SOFT} opacity={interpolate(sp, [0.6, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
                  {item.value}
                </text>
              )}
            </g>
          );
        })}

        {/* RIGHT labels (left of bar, at right axis) */}
        {rightItems.map((item, i) => {
          const sp = clamp(rightSprings[i], 0, 1);
          const y  = rightY[i];
          return (
            <text key={`rlbl-${i}`}
              x={CENTER_X + AXIS_W / 2 - 8} y={y + BAR_H / 2 + 5}
              textAnchor="end" fontFamily={SANS} fontSize={height * 0.012}
              fontWeight={item.isSubtotal ? 700 : 400}
              fill={F.INK} opacity={sp}>
              {item.label}
            </text>
          );
        })}
      </svg>

      {/* Estimate note */}
      {(leftItems.some(i => i.estimate) || rightItems.some(i => i.estimate)) && (
        <div style={{
          position: 'absolute', left: PAD_X, bottom: height * 0.14,
          fontFamily: SANS, fontSize: height * 0.011, color: F.INK_SOFT,
          opacity: clamp(srcIn, 0, 1),
        }}>
          Dashed border = back-solved estimate (total minus disclosed line items). Source: {source}
        </div>
      )}

      {!leftItems.some(i => i.estimate) && !rightItems.some(i => i.estimate) && source ? (
        <div style={{
          position: 'absolute', left: PAD_X, bottom: height * 0.14,
          fontFamily: SANS, fontSize: height * 0.011, color: F.GHOST,
          opacity: clamp(srcIn, 0, 1),
        }}>
          {source}
        </div>
      ) : null}

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
