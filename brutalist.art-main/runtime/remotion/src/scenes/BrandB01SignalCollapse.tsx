import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01SignalCollapse — B01 beat for brand-signal-collapse-detector.
 * Enacts the narration: credential signal value rises 2019–2022, then AI tooling
 * enters and collapses the cost structure. Investment bar stays tall; value is gone.
 * Duration: 573 frames @ 30fps (19.1s)
 * Source: Branding and AI, Chapter 1 — The Creative Engineer (Nina Harris).
 */
export const brandB01SignalCollapseSchema = z.object({
  sparkLine: z.string().default('A signal works only as long as its cost structure holds.'),
});
export type BrandB01SignalCollapseProps = z.infer<typeof brandB01SignalCollapseSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// X-axis: 2019 → 2024 (5 intervals)
const YEARS = ['2019', '2020', '2021', '2022', '2023', '2024'];
// Signal value path: rises to ~85 by 2022, then drops to ~10 by 2024
const SIGNAL_VALUES = [20, 40, 65, 85, 45, 10]; // %

export const BrandB01SignalCollapse: React.FC<BrandB01SignalCollapseProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  // Phase 1: 0–90 frames — line builds up (2019–2022)
  // Phase 2: 90+ frames — collapse (2022–2024) + annotation

  const titleIn = clamp(
    spring({ frame, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Investment bar builds in phase 1
  const investBarIn = clamp(
    spring({ frame: frame - 20, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Phase 2 trigger
  const collapseIn = clamp(
    spring({ frame: frame - 90, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Annotation fade after collapse
  const annotationIn = clamp(
    spring({ frame: frame - 130, fps, config: { damping: 26, stiffness: 100, mass: 1 } }),
    0, 1
  );

  const footerIn = clamp(interpolate(frame, [60, 80], [0, 1]), 0, 1);

  // Chart geometry
  const PAD_H = width * 0.06;
  const PAD_V = height * 0.12;
  const CHART_W = width - PAD_H * 2;
  const CHART_H = isPortrait ? height * 0.60 : height * 0.64;
  const CHART_X = PAD_H;
  const CHART_Y = isPortrait ? height * 0.26 : height * 0.22;

  // Map year index + value% to pixel coords
  const xFor = (i: number) => CHART_X + (i / (YEARS.length - 1)) * CHART_W;
  const yFor = (pct: number) => CHART_Y + CHART_H - (pct / 100) * CHART_H;

  // How far along the line has been drawn (0=none, 1=all 6 points)
  // Phase 1 draws points 0–3 (2019–2022), phase 2 draws points 3–5 (2022–2024)
  const phase1Progress = clamp(interpolate(frame, [10, 85], [0, 3]), 0, 3);
  const phase2Progress = clamp(interpolate(frame, [90, 200], [3, 5]), 3, 5);
  const totalProgress = frame < 90 ? phase1Progress : phase2Progress;

  // Build SVG polyline points up to totalProgress
  const buildPoints = (upTo: number): string => {
    const pts: string[] = [];
    const fullIdx = Math.floor(upTo);
    for (let i = 0; i <= fullIdx && i < YEARS.length; i++) {
      const x = xFor(i);
      const y = yFor(SIGNAL_VALUES[i]);
      pts.push(`${x},${y}`);
    }
    // Interpolate the partial segment
    if (fullIdx < YEARS.length - 1 && upTo > fullIdx) {
      const frac = upTo - fullIdx;
      const x = xFor(fullIdx) + frac * (xFor(fullIdx + 1) - xFor(fullIdx));
      const y = yFor(SIGNAL_VALUES[fullIdx]) + frac * (yFor(SIGNAL_VALUES[fullIdx + 1]) - yFor(SIGNAL_VALUES[fullIdx]));
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  };

  const linePoints = buildPoints(totalProgress);

  // Phase 2: color change — the collapse portion is terracotta
  const phase1Points = buildPoints(Math.min(totalProgress, 3));
  const phase2Points = frame >= 90 ? buildPoints(totalProgress).split(' ').slice(3).join(' ') : '';
  const phase2StartPt = `${xFor(3)},${yFor(SIGNAL_VALUES[3])}`;

  // AI tooling dashed line x-position
  const aiLineX = xFor(3);

  // Investment bar
  const investBarH = CHART_H * 0.55;
  const investBarX = CHART_X + CHART_W * 0.85;
  const investBarW = 60;

  // Label: "Signal value" pill position
  const labelY = yFor(SIGNAL_VALUES[2]) - 22;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: PAD_V * 0.5,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SERIF,
        fontSize: Math.round(Math.min(width, height) * 0.075),
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        GitHub repo signal value, 2019–2024
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Subtitle */}
      <div style={{
        position: 'absolute',
        top: PAD_V * 0.5 + (isPortrait ? height * 0.16 : height * 0.10),
        left: PAD_H,
        fontFamily: SANS,
        fontSize: Math.round(Math.min(width, height) * 0.033),
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        Credential signal value vs. time — what breaks when cost structure collapses.
      </div>

      {/* SVG chart */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}
        width={width}
        height={height}
      >
        {/* Y-axis label */}
        <text
          x={CHART_X - 12}
          y={CHART_Y + CHART_H / 2}
          fontFamily={SANS}
          fontSize={24}
          fill={CLAUDE.INK_SOFT}
          textAnchor="middle"
          transform={`rotate(-90, ${CHART_X - 48}, ${CHART_Y + CHART_H / 2})`}
          opacity={titleIn}
        >
          Signal value (%)
        </text>

        {/* Y-axis ticks */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <g key={pct} opacity={titleIn}>
            <line
              x1={CHART_X - 6} y1={yFor(pct)}
              x2={CHART_X + CHART_W} y2={yFor(pct)}
              stroke={CLAUDE.BORDER} strokeWidth={1}
              strokeDasharray={pct === 0 ? 'none' : '4 4'}
            />
            <text
              x={CHART_X - 12} y={yFor(pct) + 4}
              fontFamily={MONO} fontSize={26}
              fill={CLAUDE.INK_SOFT} textAnchor="end"
            >
              {pct}%
            </text>
          </g>
        ))}

        {/* X-axis */}
        <line
          x1={CHART_X} y1={CHART_Y + CHART_H}
          x2={CHART_X + CHART_W} y2={CHART_Y + CHART_H}
          stroke={CLAUDE.BORDER} strokeWidth={1.5}
          opacity={titleIn}
        />

        {/* X-axis year labels */}
        {YEARS.map((yr, i) => (
          <text
            key={yr}
            x={xFor(i)}
            y={CHART_Y + CHART_H + 22}
            fontFamily={MONO} fontSize={26}
            fill={CLAUDE.INK_SOFT} textAnchor="middle"
            opacity={titleIn}
          >
            {yr}
          </text>
        ))}

        {/* Phase 1 line — ink color (rising signal) */}
        {phase1Points.length > 0 && (
          <polyline
            points={phase1Points}
            fill="none"
            stroke={CLAUDE.INK}
            strokeWidth={5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Phase 2 line — terracotta (collapse) */}
        {frame >= 90 && phase2Points.length > 0 && (
          <polyline
            points={`${phase2StartPt} ${phase2Points}`}
            fill="none"
            stroke={CLAUDE.SPARK}
            strokeWidth={5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Data point dots */}
        {YEARS.map((yr, i) => {
          const drawn = i <= Math.floor(totalProgress) || (i === Math.ceil(totalProgress) && totalProgress % 1 > 0.8);
          if (!drawn) return null;
          const isCollapse = i >= 3 && frame >= 90;
          return (
            <circle
              key={yr}
              cx={xFor(i)} cy={yFor(SIGNAL_VALUES[i])}
              r={9}
              fill={isCollapse ? CLAUDE.SPARK : CLAUDE.CARD}
              stroke={isCollapse ? CLAUDE.SPARK : CLAUDE.INK}
              strokeWidth={2}
            />
          );
        })}

        {/* AI tooling vertical dashed line (phase 2) */}
        {frame >= 90 && (
          <g opacity={collapseIn}>
            <line
              x1={aiLineX} y1={CHART_Y + 10}
              x2={aiLineX} y2={CHART_Y + CHART_H}
              stroke={CLAUDE.SPARK}
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
            <text
              x={aiLineX + 8} y={CHART_Y + 36}
              fontFamily={SANS} fontSize={24} fontWeight={700}
              fill={CLAUDE.SPARK}
            >
              AI tooling
            </text>
            <text
              x={aiLineX + 8} y={CHART_Y + 68}
              fontFamily={SANS} fontSize={24}
              fill={CLAUDE.SPARK}
            >
              enters market
            </text>
          </g>
        )}

        {/* "Signal value" label near peak */}
        {frame >= 50 && (
          <g opacity={clamp(interpolate(frame, [50, 70], [0, 1]), 0, 1)}>
            <rect
              x={xFor(2) - 140} y={labelY - 22}
              width={280} height={34}
              rx={4}
              fill={CLAUDE.FOOTER}
              stroke={CLAUDE.BORDER}
            />
            <text
              x={xFor(2) + 1} y={labelY + 2}
              fontFamily={SANS} fontSize={24} fontWeight={600}
              fill={CLAUDE.INK} textAnchor="middle"
            >
              GitHub repo signal value
            </text>
          </g>
        )}

        {/* Investment bar — effort stays tall, value gone */}
        <g opacity={investBarIn}>
          <rect
            x={investBarX - investBarW / 2}
            y={CHART_Y + CHART_H - investBarH * investBarIn}
            width={investBarW}
            height={investBarH * investBarIn}
            rx={3}
            fill={`rgba(61,57,41,0.12)`}
            stroke={CLAUDE.BORDER}
          />
          <text
            x={investBarX}
            y={CHART_Y + CHART_H + 36}
            fontFamily={SANS} fontSize={24}
            fill={CLAUDE.INK_SOFT} textAnchor="middle"
          >
            You invest
          </text>
        </g>
      </svg>

      {/* Cost collapse annotation (phase 2) */}
      {frame >= 90 && (
        <div style={{
          position: 'absolute',
          left: xFor(4) - 20,
          top: yFor(SIGNAL_VALUES[4]) + 12,
          background: `rgba(217,119,87,0.10)`,
          border: `1px solid ${CLAUDE.SPARK}`,
          borderRadius: 6,
          padding: '9px 15px',
          fontFamily: SANS,
          fontSize: Math.round(Math.min(width, height) * 0.026),
          fontWeight: 600,
          color: CLAUDE.SPARK,
          opacity: annotationIn,
          transform: `translateY(${(1 - annotationIn) * 8}px)`,
          maxWidth: isPortrait ? Math.round(width * 0.38) : undefined,
        }}>
          Cost to fake: collapsed.
        </div>
      )}

      {/* "You find out at the interview" annotation */}
      {frame >= 130 && (
        <div style={{
          position: 'absolute',
          right: PAD_H,
          top: yFor(SIGNAL_VALUES[5]) - 50,
          background: CLAUDE.CARD,
          border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 8,
          padding: '12px 21px',
          fontFamily: SANS,
          fontSize: Math.round(Math.min(width, height) * 0.026),
          color: CLAUDE.INK,
          opacity: annotationIn,
          transform: `translateX(${(1 - annotationIn) * 16}px)`,
          maxWidth: isPortrait ? Math.round(width * 0.40) : 200,
          boxShadow: '0 2px 12px rgba(61,57,41,0.08)',
        }}>
          <span style={{ fontWeight: 700, color: CLAUDE.INK_SOFT, fontSize: Math.round(Math.min(width, height) * 0.022), textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market repriced. You find out</span>
          <br />
          <span style={{ fontWeight: 700, color: CLAUDE.SPARK }}>at the interview.</span>
        </div>
      )}

      {/* Footer sparkLine */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SANS,
        fontSize: Math.round(Math.min(width, height) * 0.034),
        color: CLAUDE.INK_SOFT,
        opacity: footerIn,
        borderTop: `1px solid ${CLAUDE.BORDER}`,
        paddingTop: 10,
      }}>
        <span style={{ color: CLAUDE.SPARK, fontWeight: 700, marginRight: 8 }}>Spence's law:</span>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
