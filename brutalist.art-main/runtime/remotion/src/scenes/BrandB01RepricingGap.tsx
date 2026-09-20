import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01RepricingGap — B01 beat for creative-engineer-market-repricing.
 * Enacts the narration: your professional development investment (bar, grows)
 * vs. market value of that credential (line, stays high then drops sharply at
 * AI tooling entry). The gap between them widens in terracotta.
 * Duration: 771 frames @ 30fps (25.7s)
 * Source: Branding and AI, Chapter 1 — The Creative Engineer (Nina Harris).
 */
export const brandB01RepricingGapSchema = z.object({
  sparkLine: z.string().default('AI tooling is the largest single-year credential cost-structure collapse.'),
});
export type BrandB01RepricingGapProps = z.infer<typeof brandB01RepricingGapSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// X-axis: 2022 → 2024 (3 points)
const YEARS = ['2022', '2023', '2024'];

// Market value path: 100% in 2022, drops to ~40% by 2023, ~12% by 2024
const MARKET_VALUES = [100, 40, 12]; // %

export const BrandB01RepricingGap: React.FC<BrandB01RepricingGapProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  // Phase 1: 0–90 frames — investment bar grows, market line stays high
  // Phase 2: 90+ frames — market line drops, gap widens in terracotta

  const titleIn = clamp(
    spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } }),
    0, 1
  );

  // Investment bar grows during phase 1
  const investIn = clamp(
    spring({ frame: frame - 18, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Phase 1 market value line — builds from 2022 to stay flat
  const marketPhase1 = clamp(
    spring({ frame: frame - 28, fps, config: { damping: 28, stiffness: 130, mass: 0.9 } }),
    0, 1
  );

  // Phase 2 collapse trigger
  const collapseIn = clamp(
    spring({ frame: frame - 90, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Annotation after collapse
  const annotationIn = clamp(
    spring({ frame: frame - 140, fps, config: { damping: 26, stiffness: 100, mass: 1 } }),
    0, 1
  );

  const footerIn = clamp(interpolate(frame, [50, 75], [0, 1]), 0, 1);

  // Chart geometry — FILL THE CANVAS
  const PAD_H = width * 0.06;
  const PAD_V = height * 0.08;
  const CHART_W = width - PAD_H * 2;
  const CHART_H = isPortrait ? height * 0.58 : height * 0.64;
  const CHART_X = PAD_H;
  const CHART_Y = isPortrait ? height * 0.28 : height * 0.24;

  const xFor = (i: number) => CHART_X + (i / (YEARS.length - 1)) * CHART_W;
  const yFor = (pct: number) => CHART_Y + CHART_H - (pct / 100) * CHART_H;

  // Investment bar: fixed at 85% height, grows in from 0
  const INVEST_BAR_H = CHART_H * 0.85;
  const INVEST_BAR_W = CHART_W * 0.18;
  const INVEST_BAR_X = CHART_X + CHART_W * 0.12;

  // Market value line progress
  // Phase 1: draw 2022 → 2023 (index 0→1), but 2023 value stays at 100 (flat)
  // Phase 2: 2023 value drops to 40, 2024 value drops to 12
  const phase1Progress = clamp(interpolate(frame, [28, 80], [0, 1]), 0, 1);

  // For phase 1, market values = [100, 100] (flat)
  // For phase 2, animate 2023 value from 100 → 40, and add 2024 at 12
  const market2023 = frame < 90
    ? 100
    : clamp(interpolate(frame, [90, 160], [100, 40]), 40, 100);
  const phase2Progress = clamp(interpolate(frame, [140, 220], [0, 1]), 0, 1);

  // Build phase 1 market line points (2022 → mid-2023 flat)
  const mkPt1 = { x: xFor(0), y: yFor(100) };
  const mkPt2 = { x: xFor(1), y: yFor(market2023) };
  const mkPt3 = { x: xFor(2), y: yFor(MARKET_VALUES[2]) };

  // Vertical x for AI entry annotation
  const aiX = xFor(1);

  // Gap polygon for terracotta fill — only in phase 2
  // Investment bar top = CHART_Y + CHART_H - INVEST_BAR_H
  // Market value line at that x position
  const investTopY = yFor(85); // roughly where bar top sits
  const marketAtBarX = yFor(market2023); // market value at 2023 collapses

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.05,
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
        Investment vs. market value
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Subtitle phase 1 */}
      <div style={{
        position: 'absolute',
        top: height * 0.05 + (isPortrait ? height * 0.16 : height * 0.088),
        left: PAD_H,
        right: PAD_H,
        fontFamily: SANS,
        fontSize: Math.round(Math.min(width, height) * 0.033),
        color: CLAUDE.INK_SOFT,
        opacity: frame < 90 ? clamp(titleIn, 0, 1) : clamp(interpolate(frame, [90, 110], [1, 0]), 0, 1),
      }}>
        Feels like the right answer. — 2022–2023.
      </div>

      {/* Subtitle phase 2 */}
      {frame >= 90 && (
        <div style={{
          position: 'absolute',
          top: height * 0.05 + (isPortrait ? height * 0.16 : height * 0.088),
          left: PAD_H,
          right: PAD_H,
          fontFamily: SANS,
          fontSize: Math.round(Math.min(width, height) * 0.033),
          color: CLAUDE.SPARK,
          opacity: clamp(interpolate(frame, [100, 125], [0, 1]), 0, 1),
        }}>
          The market has already repriced them.
        </div>
      )}

      {/* SVG chart */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}
        width={width}
        height={height}
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <g key={pct} opacity={titleIn}>
            <line
              x1={CHART_X - 8} y1={yFor(pct)}
              x2={CHART_X + CHART_W} y2={yFor(pct)}
              stroke={CLAUDE.BORDER} strokeWidth={1.5}
              strokeDasharray={pct === 0 ? 'none' : '6 4'}
            />
            <text
              x={CHART_X - 14} y={yFor(pct) + 8}
              fontFamily={MONO} fontSize={24}
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
          stroke={CLAUDE.BORDER} strokeWidth={3}
          opacity={titleIn}
        />

        {/* X-axis year labels */}
        {YEARS.map((yr, i) => (
          <text
            key={yr}
            x={xFor(i)}
            y={CHART_Y + CHART_H + 40}
            fontFamily={MONO} fontSize={26}
            fill={CLAUDE.INK_SOFT} textAnchor="middle"
            opacity={titleIn}
          >
            {yr}
          </text>
        ))}

        {/* Investment bar — grows during phase 1 */}
        <g opacity={investIn}>
          <rect
            x={INVEST_BAR_X}
            y={CHART_Y + CHART_H - INVEST_BAR_H * investIn}
            width={INVEST_BAR_W}
            height={INVEST_BAR_H * investIn}
            rx={6}
            fill={`rgba(61,57,41,0.10)`}
            stroke={CLAUDE.BORDER}
            strokeWidth={2}
          />
          {/* Label inside bar */}
          {investIn > 0.4 && (
            <text
              x={INVEST_BAR_X + INVEST_BAR_W / 2}
              y={CHART_Y + CHART_H - INVEST_BAR_H * 0.5}
              fontFamily={SANS} fontSize={24} fontWeight={600}
              fill={CLAUDE.INK_SOFT} textAnchor="middle"
              transform={`rotate(-90, ${INVEST_BAR_X + INVEST_BAR_W / 2}, ${CHART_Y + CHART_H - INVEST_BAR_H * 0.5})`}
            >
              Months invested
            </text>
          )}
          <text
            x={INVEST_BAR_X + INVEST_BAR_W / 2}
            y={CHART_Y + CHART_H + 40}
            fontFamily={SANS} fontSize={26}
            fill={CLAUDE.INK_SOFT} textAnchor="middle"
          >
            You invest
          </text>
        </g>

        {/* Market value line — phase 1 (flat) */}
        {phase1Progress > 0 && (
          <>
            <polyline
              points={`${mkPt1.x},${mkPt1.y} ${mkPt1.x + (mkPt2.x - mkPt1.x) * phase1Progress},${yFor(100)}`}
              fill="none"
              stroke={CLAUDE.INK}
              strokeWidth={5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Peak dot */}
            <circle
              cx={mkPt1.x} cy={yFor(100)}
              r={8}
              fill={CLAUDE.CARD}
              stroke={CLAUDE.INK}
              strokeWidth={3}
            />
          </>
        )}

        {/* Market value line — phase 2 collapse (terracotta) */}
        {frame >= 90 && (
          <>
            {/* Overwrite flat part with ink */}
            <line
              x1={mkPt1.x} y1={yFor(100)}
              x2={mkPt2.x} y2={yFor(100)}
              stroke={CLAUDE.INK}
              strokeWidth={5}
            />
            {/* Collapse segment */}
            <polyline
              points={`${mkPt2.x},${yFor(100)} ${mkPt2.x},${mkPt2.y}`}
              fill="none"
              stroke={CLAUDE.SPARK}
              strokeWidth={5}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={collapseIn}
            />
            {phase2Progress > 0 && (
              <polyline
                points={`${mkPt2.x},${mkPt2.y} ${mkPt2.x + (mkPt3.x - mkPt2.x) * phase2Progress},${mkPt2.y + (mkPt3.y - mkPt2.y) * phase2Progress}`}
                fill="none"
                stroke={CLAUDE.SPARK}
                strokeWidth={5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {/* End dot */}
            {phase2Progress > 0.9 && (
              <circle
                cx={mkPt3.x} cy={mkPt3.y}
                r={8}
                fill={CLAUDE.SPARK}
                stroke={CLAUDE.SPARK}
                strokeWidth={3}
              />
            )}
          </>
        )}

        {/* "Market value of credential" label near peak */}
        {phase1Progress > 0.5 && (
          <g opacity={clamp(interpolate(frame, [50, 70], [0, 1]), 0, 1)}>
            <rect
              x={mkPt1.x + 16} y={yFor(100) - 44}
              width={340} height={40}
              rx={6}
              fill={CLAUDE.FOOTER}
              stroke={CLAUDE.BORDER}
              strokeWidth={1.5}
            />
            <text
              x={mkPt1.x + 186} y={yFor(100) - 18}
              fontFamily={SANS} fontSize={26} fontWeight={600}
              fill={CLAUDE.INK} textAnchor="middle"
            >
              Market value of credential
            </text>
          </g>
        )}

        {/* AI tooling entry — vertical dashed line */}
        {frame >= 90 && (
          <g opacity={collapseIn}>
            <line
              x1={aiX} y1={CHART_Y + 10}
              x2={aiX} y2={CHART_Y + CHART_H}
              stroke={CLAUDE.SPARK}
              strokeWidth={5}
              strokeDasharray="8 5"
            />
            <text
              x={aiX + 12} y={CHART_Y + 44}
              fontFamily={SANS} fontSize={24} fontWeight={700}
              fill={CLAUDE.SPARK}
            >
              AI tooling
            </text>
            <text
              x={aiX + 12} y={CHART_Y + 76}
              fontFamily={SANS} fontSize={24}
              fill={CLAUDE.SPARK}
            >
              enters
            </text>
          </g>
        )}

        {/* Terracotta gap area between bar top and market line */}
        {frame >= 90 && phase2Progress > 0.2 && (
          <rect
            x={INVEST_BAR_X}
            y={yFor(market2023)}
            width={INVEST_BAR_W}
            height={investTopY - yFor(market2023)}
            rx={0}
            fill={`rgba(217,119,87,0.18)`}
            opacity={clamp(interpolate(frame, [140, 190], [0, 1]), 0, 1)}
          />
        )}
      </svg>

      {/* "You find out at the interview" annotation */}
      {frame >= 130 && (
        <div style={{
          position: 'absolute',
          right: PAD_H,
          top: CHART_Y + CHART_H * 0.55,
          background: CLAUDE.CARD,
          border: `2px solid ${CLAUDE.SPARK}`,
          borderRadius: 10,
          padding: '14px 22px',
          fontFamily: SANS,
          fontSize: Math.round(height * 0.028),
          color: CLAUDE.INK,
          opacity: annotationIn,
          transform: `translateX(${(1 - annotationIn) * 16}px)`,
          maxWidth: 360,
          boxShadow: '0 2px 12px rgba(217,119,87,0.12)',
        }}>
          <span style={{ fontWeight: 700, color: CLAUDE.SPARK }}>You find out at the interview.</span>
        </div>
      )}

      {/* Phase 1 label card */}
      {frame < 90 && (
        <div style={{
          position: 'absolute',
          left: INVEST_BAR_X + INVEST_BAR_W + 32,
          top: CHART_Y + CHART_H * 0.15,
          background: CLAUDE.CARD,
          border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 10,
          padding: '12px 20px',
          fontFamily: SANS,
          fontSize: Math.round(height * 0.026),
          color: CLAUDE.INK_SOFT,
          opacity: clamp(interpolate(frame, [35, 60], [0, 1]), 0, 1),
          maxWidth: 320,
        }}>
          Feels like the right answer.
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
        paddingTop: 12,
      }}>
        <span style={{ color: CLAUDE.SPARK, fontWeight: 700, marginRight: 10 }}>Spence's law:</span>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
