import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcResultAggregation — How results come back from parallel analysts
 * N analyst chips fly into aggregator box → dedup → rank → final report
 * Source: research-desk/ — CWC Workshop 2026
 */

export const cwcResultAggregationSchema = z.object({
  sparkLine: z.string().default("Fan out collects everything. Fan in decides."),
});
export type CwcResultAggregationProps = z.infer<typeof cwcResultAggregationSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const ANALYSTS = [
  { ticker: 'NVDA', score: 9, color: '#4CAF50', angle: -50, dist: 0.28 },
  { ticker: 'AMD', score: 6, color: CLAUDE.INK_SOFT, angle: -15, dist: 0.26 },
  { ticker: 'MU', score: 4, color: CLAUDE.BORDER, angle: 20, dist: 0.27 },
  { ticker: 'INTC', score: 5, color: CLAUDE.BORDER, angle: 55, dist: 0.25 },
  { ticker: 'TSM', score: 8, color: '#4CAF5080', angle: -85, dist: 0.24 },
];

export const CwcResultAggregation: React.FC<CwcResultAggregationProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const aggBoxIn = spring({ frame: frame - 15, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const reportIn = spring({ frame: frame - 210, fps, config: { damping: 24, stiffness: 90, mass: 1.1 } });
  const sparkIn = spring({ frame: frame - 260, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const AGG_CX = width * 0.50;
  const AGG_CY = height * 0.52;
  const AGG_W = width * 0.22;
  const AGG_H = height * 0.28;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        RESULT AGGREGATION · FAN IN
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        Analysts return — the aggregator decides
      </div>

      {/* Analyst chips flying in */}
      {ANALYSTS.map((analyst, i) => {
        const chipIn = spring({ frame: frame - 30 - i * 25, fps, config: { damping: 24, stiffness: 90, mass: 1.0 } });
        const progress = clamp(chipIn, 0, 1);

        // Chip starts at orbit position, moves toward aggregator center
        const rad = (analyst.angle * Math.PI) / 180;
        const startX = AGG_CX + Math.cos(rad) * width * analyst.dist;
        const startY = AGG_CY + Math.sin(rad) * height * analyst.dist * 0.7;
        const endX = AGG_CX - 60;
        const endY = AGG_CY - 30 + i * 15;

        const chipX = startX + (endX - startX) * progress;
        const chipY = startY + (endY - startY) * progress;

        return (
          <div key={analyst.ticker} style={{
            position: 'absolute',
            left: chipX - 50, top: chipY - 18,
            width: 100, height: 36,
            borderRadius: 8,
            background: CLAUDE.CARD,
            border: `1.5px solid ${analyst.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: progress,
          }}>
            <div style={{ fontFamily: MONO, fontSize: height * 0.012, fontWeight: 700, color: CLAUDE.INK }}>{analyst.ticker}</div>
            <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: analyst.score >= 7 ? '#4CAF50' : CLAUDE.INK_SOFT, fontWeight: 700 }}>{analyst.score}/10</div>
          </div>
        );
      })}

      {/* Aggregator box */}
      <div style={{
        position: 'absolute',
        left: AGG_CX - AGG_W / 2, top: AGG_CY - AGG_H / 2,
        width: AGG_W, height: AGG_H,
        borderRadius: 12,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
        opacity: clamp(aggBoxIn, 0, 1),
        transform: `scale(${0.85 + 0.15 * clamp(aggBoxIn, 0, 1)})`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
          Aggregator
        </div>
        <div style={{ width: '80%', height: 1, background: CLAUDE.BORDER }} />
        {['deduplicates', 'ranks', 'merges'].map((step, i) => {
          const stepIn = spring({ frame: frame - 30 - i * 20, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div key={step} style={{
              fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK,
              opacity: clamp(stepIn, 0, 1),
            }}>
              · {step}
            </div>
          );
        })}
      </div>

      {/* Final report box */}
      <div style={{
        position: 'absolute',
        left: AGG_CX + AGG_W / 2 + width * 0.04,
        top: AGG_CY - height * 0.14,
        width: width * 0.24,
        background: `${CLAUDE.SPARK}10`,
        border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12, padding: '14px 16px',
        opacity: clamp(reportIn, 0, 1),
        transform: `translateX(${(1 - clamp(reportIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, fontWeight: 700, color: CLAUDE.SPARK, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>
          Final Report
        </div>
        {['1. NVDA — 9 — Strong', '2. TSM — 8 — Good', '3. AMD — 6 — Moderate', '4. INTC — 5 — Watch', '5. MU — 4 — Caution'].map((line, i) => {
          const lineIn = spring({ frame: frame - 220 - i * 15, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div key={i} style={{
              fontFamily: MONO, fontSize: height * 0.010, color: CLAUDE.INK,
              lineHeight: 1.7, opacity: clamp(lineIn, 0, 1),
            }}>
              {line}
            </div>
          );
        })}
      </div>

      {/* Arrow: aggregator → report */}
      <svg style={{
        position: 'absolute',
        left: AGG_CX + AGG_W / 2,
        top: AGG_CY - 14,
        width: width * 0.04,
        height: 28, overflow: 'visible',
        opacity: clamp(reportIn, 0, 1),
      }}>
        <defs>
          <marker id="aggArr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.SPARK} />
          </marker>
        </defs>
        <line x1={0} y1={14} x2={width * 0.04 - 4} y2={14}
          stroke={CLAUDE.SPARK} strokeWidth={2.5} markerEnd="url(#aggArr)" />
      </svg>

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
