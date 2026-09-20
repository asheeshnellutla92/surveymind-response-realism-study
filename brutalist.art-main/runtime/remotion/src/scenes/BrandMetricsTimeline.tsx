import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandMetricsTimeline — C03 brand-metrics-performance-dashboard centerpiece.
 * Dual-track timeline: Brand metrics track (awareness/consideration/preference)
 * on top in ink, Performance metrics (conversion/CAC/ROAS) on bottom in terracotta.
 * A "patience gap" bracket draws between them showing the months delay.
 * Source: Branding and AI, Chapter 13 — Measuring Brand Equity (Nina Harris).
 */
export const brandMetricsTimelineSchema = z.object({
  patienceGapMonths: z.number().default(6),
});
export type BrandMetricsTimelineProps = z.infer<typeof brandMetricsTimelineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const BRAND_METRICS = ['Unaided Awareness', 'Consideration', 'Preference'];
const PERF_METRICS = ['Conversion', 'CAC', 'ROAS'];

export const BrandMetricsTimeline: React.FC<BrandMetricsTimelineProps> = ({ patienceGapMonths }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const brandTrackIn = clamp(spring({ frame: frame - 10, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1);
  const perfTrackIn = clamp(spring({ frame: frame - 22, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1);
  const gapIn = clamp(spring({ frame: frame - 36, fps, config: { damping: 26, stiffness: 120, mass: 1 } }), 0, 1);
  const sourceIn = clamp(interpolate(frame, [60, 75], [0, 1]), 0, 1);

  const PAD = width * 0.07;
  const TRACK_W = width - PAD * 2;
  const TRACK_H = 100;
  const CHIP_W = TRACK_W / (BRAND_METRICS.length + 0.5);
  const MONTHS = 12;

  // X position for a given month (0-indexed)
  const xForMonth = (m: number) => PAD + (m / MONTHS) * TRACK_W;

  // Brand metrics start at month 0, performance starts at patienceGapMonths
  const brandStartX = xForMonth(0);
  const perfStartX = xForMonth(patienceGapMonths);
  const endX = xForMonth(MONTHS);

  const TOP_TRACK_Y = height * 0.24;
  const BOT_TRACK_Y = height * 0.56;
  const BRACKET_MID_Y = (TOP_TRACK_Y + TRACK_H + BOT_TRACK_Y) / 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.06,
        left: PAD,
        fontFamily: SERIF,
        fontSize: 36,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Dual-Track Measurement Plan
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Month axis */}
        {Array.from({ length: MONTHS + 1 }, (_, m) => (
          <g key={m} opacity={brandTrackIn}>
            <line
              x1={xForMonth(m)} y1={TOP_TRACK_Y - 8}
              x2={xForMonth(m)} y2={BOT_TRACK_Y + TRACK_H + 8}
              stroke={CLAUDE.BORDER}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            {m % 3 === 0 && (
              <text
                x={xForMonth(m)}
                y={BOT_TRACK_Y + TRACK_H + 26}
                textAnchor="middle"
                fontSize={12}
                fontFamily={SANS}
                fill={CLAUDE.INK_SOFT}
              >
                M{m}
              </text>
            )}
          </g>
        ))}

        {/* Brand track bar */}
        <rect
          x={brandStartX}
          y={TOP_TRACK_Y}
          width={(endX - brandStartX) * brandTrackIn}
          height={TRACK_H}
          rx={8}
          fill={CLAUDE.INK}
          opacity={0.88}
        />

        {/* Brand metric chips */}
        {BRAND_METRICS.map((m, i) => {
          const cx = brandStartX + (i + 0.5) * (TRACK_W / BRAND_METRICS.length);
          return (
            <g key={m} opacity={brandTrackIn}>
              <text
                x={cx}
                y={TOP_TRACK_Y + TRACK_H / 2 - 6}
                textAnchor="middle"
                fontSize={13}
                fontFamily={SANS}
                fontWeight={600}
                fill={CLAUDE.PAGE}
              >
                {m}
              </text>
              <text
                x={cx}
                y={TOP_TRACK_Y + TRACK_H / 2 + 14}
                textAnchor="middle"
                fontSize={11}
                fontFamily={SANS}
                fill={CLAUDE.GHOST}
              >
                quarterly survey
              </text>
            </g>
          );
        })}

        {/* Brand track label */}
        <text
          x={brandStartX}
          y={TOP_TRACK_Y - 16}
          fontSize={13}
          fontFamily={SANS}
          fontWeight={700}
          fill={CLAUDE.INK}
          opacity={brandTrackIn}
          letterSpacing="0.04em"
        >
          BRAND METRICS
        </text>

        {/* Performance track bar */}
        <rect
          x={perfStartX}
          y={BOT_TRACK_Y}
          width={(endX - perfStartX) * perfTrackIn}
          height={TRACK_H}
          rx={8}
          fill={CLAUDE.SPARK}
          opacity={0.88}
        />

        {/* Performance metric chips */}
        {PERF_METRICS.map((m, i) => {
          const cx = perfStartX + (i + 0.5) * ((endX - perfStartX) / PERF_METRICS.length);
          return (
            <g key={m} opacity={perfTrackIn}>
              <text
                x={cx}
                y={BOT_TRACK_Y + TRACK_H / 2 - 6}
                textAnchor="middle"
                fontSize={13}
                fontFamily={SANS}
                fontWeight={600}
                fill={CLAUDE.PAGE}
              >
                {m}
              </text>
              <text
                x={cx}
                y={BOT_TRACK_Y + TRACK_H / 2 + 14}
                textAnchor="middle"
                fontSize={11}
                fontFamily={SANS}
                fill={CLAUDE.CARD}
              >
                weekly dashboard
              </text>
            </g>
          );
        })}

        {/* Performance track label */}
        <text
          x={perfStartX}
          y={BOT_TRACK_Y - 16}
          fontSize={13}
          fontFamily={SANS}
          fontWeight={700}
          fill={CLAUDE.SPARK}
          opacity={perfTrackIn}
          letterSpacing="0.04em"
        >
          PERFORMANCE METRICS
        </text>

        {/* Patience gap bracket */}
        {gapIn > 0.05 && (
          <g opacity={gapIn}>
            {/* Vertical bracket line left */}
            <line
              x1={brandStartX + 2}
              y1={TOP_TRACK_Y + TRACK_H + 4}
              x2={brandStartX + 2}
              y2={BOT_TRACK_Y - 4}
              stroke={CLAUDE.SPARK}
              strokeWidth={2}
            />
            {/* Horizontal bracket top */}
            <line
              x1={brandStartX + 2}
              y1={BRACKET_MID_Y}
              x2={perfStartX - 2}
              y2={BRACKET_MID_Y}
              stroke={CLAUDE.SPARK}
              strokeWidth={2}
            />
            {/* Vertical bracket line right */}
            <line
              x1={perfStartX - 2}
              y1={BRACKET_MID_Y}
              x2={perfStartX - 2}
              y2={BOT_TRACK_Y - 4}
              stroke={CLAUDE.SPARK}
              strokeWidth={2}
            />
            {/* Label */}
            <rect
              x={(brandStartX + perfStartX) / 2 - 60}
              y={BRACKET_MID_Y - 24}
              width={120}
              height={30}
              rx={6}
              fill={CLAUDE.SPARK}
            />
            <text
              x={(brandStartX + perfStartX) / 2}
              y={BRACKET_MID_Y - 3}
              textAnchor="middle"
              fontSize={13}
              fontFamily={SANS}
              fontWeight={700}
              fill={CLAUDE.PAGE}
            >
              {patienceGapMonths}mo patience gap
            </text>
          </g>
        )}
      </svg>

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        right: PAD,
        fontFamily: SANS,
        fontSize: 12,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 13
      </div>
    </AbsoluteFill>
  );
};
