import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE_FONT } from '../tokens/claude';

// Finance palette — SKILL.md §Palette
const F = {
  PAGE:     '#FAF9F5',
  INK:      '#3D3929',
  RULE:     '#D8D2C4',
  INK_SOFT: '#73705F',
  GHOST:    '#A9A491',
  SUBJECT:  '#D97757',   // terracotta — subject company ONLY
  KEYLINE:  '#1a1a1a',   // mandatory 1px keyline on every fill
} as const;

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Even-count median fix — SKILL.md §Two audits / AUDIT-SOURCE median fix
function computeMedian(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n % 2 === 1) return sorted[Math.floor(n / 2)];
  return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}


export const financeDotPlotSchema = z.object({
  title:     z.string().default('Gross Margin — Sector Distribution'),
  subtitle:  z.string().default(''),
  metric:    z.string().default('Gross Margin (%)'),
  subject:   z.string(),
  companies: z.array(z.object({
    ticker:   z.string(),
    name:     z.string(),
    value:    z.number(),
    estimate: z.boolean().default(false),
  })).min(2).max(10),
  source:     z.string().default(''),
  sparkLine:  z.string().default(''),
  glossTerms: z.array(z.string()).default([]),
});
export type FinanceDotPlotProps = z.infer<typeof financeDotPlotSchema>;

export const FinanceDotPlot: React.FC<FinanceDotPlotProps> = ({
  title, subtitle, metric, subject, companies, source, sparkLine, glossTerms = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Sort by value ascending so subject lands wherever it actually falls
  const sorted = [...companies].sort((a, b) => a.value - b.value);
  const values  = sorted.map(c => c.value);
  const med     = computeMedian(values);
  const minVal  = values[0];
  const maxVal  = values[values.length - 1];

  // Plot dimensions
  const PAD_X      = width  * 0.07;
  const PLOT_TOP   = height * 0.26;
  const PLOT_BOT   = height * 0.65;
  const PLOT_H     = PLOT_BOT - PLOT_TOP;
  const PLOT_LEFT  = PAD_X + width * 0.04;
  const PLOT_RIGHT = width  - PAD_X - width * 0.02;
  const PLOT_W     = PLOT_RIGHT - PLOT_LEFT;

  // Map value → x with 12% padding on each side of the data range
  const dataRange = Math.max(maxVal - minVal, 1);
  const xLo = minVal - dataRange * 0.12;
  const xHi = maxVal + dataRange * 0.12;
  const valToX = (v: number) => PLOT_LEFT + ((v - xLo) / (xHi - xLo)) * PLOT_W;

  // Dot y: center of plot, with modest y-jitter for near-overlapping dots
  const DOT_CY = PLOT_TOP + PLOT_H * 0.35;
  const JITTER  = 38;
  const dotPos = sorted.map((c, i) => {
    const x = valToX(c.value);
    let y = DOT_CY;
    for (let j = 0; j < i; j++) {
      if (Math.abs(x - valToX(sorted[j].value)) < 32) {
        y += (j % 2 === 0) ? JITTER : -JITTER;
        break;
      }
    }
    return { x, y };
  });

  const medX = valToX(med);
  const N    = sorted.length;

  // Springs
  const titleIn  = spring({ frame,              fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axesIn   = spring({ frame: frame - 12,  fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const dotIn    = sorted.map((_, i) =>
    spring({ frame: frame - 28 - i * 8, fps, config: { damping: 22, stiffness: 90, mass: 0.9 } })
  );
  const afterDots = 28 + N * 8;
  const medIn    = spring({ frame: frame - afterDots,      fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const hlIn     = spring({ frame: frame - afterDots + 12, fps, config: { damping: 22, stiffness: 70,  mass: 1.3 } });
  const labsIn   = spring({ frame: frame - afterDots + 22, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const keyIn    = spring({ frame: frame - afterDots + 32, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn  = spring({ frame: frame - afterDots + 52, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // X-axis ticks at 5 evenly-spaced positions
  const ticks = Array.from({ length: 5 }, (_, i) => xLo + i * (xHi - xLo) / 4);

  return (
    <AbsoluteFill style={{ background: F.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.06,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: F.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        SECTOR DISTRIBUTION
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.10,
        fontFamily: SERIF, fontSize: height * 0.032, fontWeight: 700,
        color: F.INK, letterSpacing: '-0.01em', lineHeight: 1.2,
        maxWidth: width * 0.75,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {title}
      </div>

      {subtitle ? (
        <div style={{
          position: 'absolute', left: PAD_X, top: height * 0.175,
          fontFamily: SERIF, fontSize: height * 0.017, fontStyle: 'italic',
          color: F.INK_SOFT, opacity: clamp(titleIn, 0, 1),
        }}>
          {subtitle}
        </div>
      ) : null}

      {/* SVG layer: axes, dots, median */}
      <svg style={{
        position: 'absolute', left: 0, top: 0,
        width, height, overflow: 'visible', pointerEvents: 'none',
      }}>
        {/* X axis */}
        <line x1={PLOT_LEFT} y1={PLOT_BOT} x2={PLOT_RIGHT} y2={PLOT_BOT}
          stroke={F.RULE} strokeWidth={1.5} opacity={clamp(axesIn, 0, 1)} />

        {/* Ticks + labels */}
        {ticks.map((tick, i) => {
          const x = valToX(tick);
          return (
            <g key={i} opacity={clamp(axesIn, 0, 1)}>
              <line x1={x} y1={PLOT_BOT} x2={x} y2={PLOT_BOT + 8}
                stroke={F.RULE} strokeWidth={1.5} />
              <text x={x} y={PLOT_BOT + 26}
                textAnchor="middle" fontFamily={SANS} fontSize={height * 0.013}
                fill={F.INK_SOFT}>
                {tick.toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* X axis label */}
        <text x={PLOT_LEFT + PLOT_W / 2} y={PLOT_BOT + 50}
          textAnchor="middle" fontFamily={SERIF} fontSize={height * 0.016}
          fill={F.INK} fontStyle="italic"
          opacity={clamp(axesIn, 0, 1)}>
          {metric}
        </text>

        {/* Median dashed line */}
        <line x1={medX} y1={PLOT_TOP} x2={medX} y2={PLOT_BOT + 8}
          stroke={F.INK_SOFT} strokeWidth={1.5} strokeDasharray="6 4"
          opacity={clamp(medIn, 0, 1)} />
        <text x={medX + 8} y={PLOT_TOP + 16}
          fontFamily={SANS} fontSize={height * 0.012} fill={F.INK_SOFT}
          opacity={clamp(medIn, 0, 1)}>
          median {med.toFixed(1)}%
        </text>

        {/* Dots */}
        {sorted.map((c, i) => {
          const isSub  = c.ticker.toUpperCase() === subject.toUpperCase();
          const { x, y } = dotPos[i];
          const sp     = clamp(dotIn[i], 0, 1);
          const r      = isSub ? 14 : 9;
          const fill   = isSub ? F.SUBJECT : F.INK;

          return (
            <g key={c.ticker}>
              {/* Back-solved estimate ring */}
              {c.estimate && (
                <circle cx={x} cy={y} r={r + 6}
                  fill="none" stroke={F.INK_SOFT} strokeWidth={1.5}
                  strokeDasharray="4 3" opacity={sp} />
              )}
              {/* Subject highlight pulse */}
              {isSub && (
                <circle cx={x} cy={y} r={(r + 20) * clamp(hlIn, 0, 1)}
                  fill="none" stroke={F.SUBJECT} strokeWidth={1.5}
                  opacity={clamp(hlIn, 0, 1) * 0.45} />
              )}
              {/* Dot */}
              <circle cx={x} cy={y} r={r * sp}
                fill={fill} stroke={F.KEYLINE} strokeWidth={1}
                opacity={sp} />
              {/* Value label above dot */}
              <text x={x} y={y - r - 9}
                textAnchor="middle" fontFamily={SANS}
                fontSize={height * 0.012}
                fill={isSub ? F.SUBJECT : F.INK_SOFT}
                opacity={clamp(labsIn, 0, 1)}>
                {c.estimate ? '~' : ''}{c.value.toFixed(1)}%
              </text>
              {/* Ticker label below plot */}
              <text x={x} y={PLOT_BOT + 70}
                textAnchor="middle" fontFamily={SANS}
                fontSize={height * 0.013} fontWeight="700"
                fill={isSub ? F.SUBJECT : F.INK}
                opacity={clamp(labsIn, 0, 1)}>
                {c.ticker}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Key — full company names */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.13,
        display: 'flex', flexWrap: 'wrap' as const, gap: '5px 22px',
        maxWidth: width * 0.86, opacity: clamp(keyIn, 0, 1),
      }}>
        {sorted.map(c => {
          const isSub = c.ticker.toUpperCase() === subject.toUpperCase();
          return (
            <div key={c.ticker} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: isSub ? 14 : 9, height: isSub ? 14 : 9,
                borderRadius: '50%',
                background: isSub ? F.SUBJECT : F.INK,
                border: `1px solid ${F.KEYLINE}`,
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: SANS, fontSize: height * 0.011,
                color: isSub ? F.SUBJECT : F.INK_SOFT,
                fontWeight: isSub ? 700 : 400,
              }}>
                {c.ticker} — {c.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Source */}
      {source ? (
        <div style={{
          position: 'absolute', left: PAD_X, bottom: height * 0.085,
          fontFamily: SANS, fontSize: height * 0.011, color: F.GHOST,
          opacity: clamp(sparkIn, 0, 1),
        }}>
          {source}
        </div>
      ) : null}

      {/* Gloss line */}
      {glossTerms.length > 0 && (
        <div style={{
          position: 'absolute', left: PAD_X, right: PAD_X, bottom: height * 0.025,
          fontFamily: SANS, fontSize: height * 0.0095, color: F.RULE,
          letterSpacing: '0.02em', opacity: clamp(sparkIn, 0, 1),
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
