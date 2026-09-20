import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01VerbGap — four-verb-career-signal-audit B01.
 * Bar chart: IDEATE | BUILD | SHIP | MEASURE.
 * Phase 1 (0–80): BUILD bar rises tall, others at 0. "Your signal."
 * Phase 2 (80+): Many BUILD bars appear (the crowd), BUILD bar lost in noise.
 *   IDEATE/SHIP/MEASURE stay at 0 — "Market can't see these."
 *   Terracotta annotation: "Build was the signal. Now it's noise."
 * Source: Branding and AI, Chapter 1 — The Creative Engineer (Nina Harris).
 */
export const brandB01VerbGapSchema = z.object({
  sparkLine: z.string().default("Build was the signal. Now it's noise."),
});
export type BrandB01VerbGapProps = z.infer<typeof brandB01VerbGapSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const VERBS = ['IDEATE', 'BUILD', 'SHIP', 'MEASURE'];
const BUILD_INDEX = 1;

// Heights of "your" bar per verb (0–1), phase 1
const YOUR_HEIGHTS: Record<string, number> = {
  IDEATE: 0,
  BUILD: 0.82,
  SHIP: 0,
  MEASURE: 0,
};

// Number of crowd bars that appear in phase 2 beside BUILD
const CROWD_COUNT = 6;

export const BrandB01VerbGap: React.FC<BrandB01VerbGapProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_H = width * 0.06;

  // Chart fills from y≈170 to y≈860
  const CHART_Y = height * 0.17;
  const CHART_H = height * 0.62;
  const CHART_BOTTOM = CHART_Y + CHART_H;
  const CHART_LEFT = PAD_H + 20;
  const CHART_RIGHT = width - PAD_H;
  const CHART_W = CHART_RIGHT - CHART_LEFT;

  const VERB_W = CHART_W / VERBS.length;
  // Each bar is approximately width/6 wide
  const BAR_W = width / 6;

  // Title and sparkLine sizes
  const TITLE_SIZE = Math.round(height * 0.075);
  const SPARK_SIZE = Math.round(height * 0.034);

  // Phase 1: BUILD bar grows (frames 8–60)
  const buildBarProgress = clamp(interpolate(frame, [8, 60], [0, 1]), 0, 1);

  // Phase 1: "Your signal" label
  const labelIn = clamp(
    spring({ frame: frame - 55, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Phase 2: crowd bars appear (frames 80–110)
  const COLLAPSE = 80;
  const crowdSprings = Array.from({ length: CROWD_COUNT }, (_, i) =>
    clamp(spring({ frame: frame - (COLLAPSE + i * 5), fps, config: { damping: 24, stiffness: 110, mass: 1.0 } }), 0, 1)
  );

  // "Your signal" → "Lost in crowd" label swap
  const crowdLabelIn = clamp(
    spring({ frame: frame - (COLLAPSE + 8), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // "Market can't see these" annotations (frames 100+)
  const invisibleIn = clamp(
    spring({ frame: frame - (COLLAPSE + 20), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Terracotta annotation: "Build was the signal. Now it's noise." (frames 115+)
  const annotationIn = clamp(
    spring({ frame: frame - (COLLAPSE + 35), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  const footerIn = clamp(interpolate(frame, [55, 75], [0, 1]), 0, 1);

  const titleIn = clamp(
    spring({ frame: frame - 0, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  const isCrowding = frame >= COLLAPSE;

  // Helper: bar left X for each verb
  const verbCenterX = (vi: number) => CHART_LEFT + vi * VERB_W + VERB_W / 2;
  const barLeft = (vi: number) => verbCenterX(vi) - BAR_W / 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.04,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SERIF,
        fontSize: TITLE_SIZE,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        opacity: titleIn,
      }}>
        What breaks<span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* SVG chart layer */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width, height, pointerEvents: 'none' }}>

        {/* Baseline */}
        <line
          x1={CHART_LEFT}
          y1={CHART_BOTTOM}
          x2={CHART_RIGHT}
          y2={CHART_BOTTOM}
          stroke={CLAUDE.BORDER}
          strokeWidth={2}
        />

        {/* Faint grid line at ~18% from top */}
        <line
          x1={CHART_LEFT}
          y1={CHART_Y + CHART_H * 0.18}
          x2={CHART_RIGHT}
          y2={CHART_Y + CHART_H * 0.18}
          stroke={CLAUDE.BORDER}
          strokeWidth={2}
          strokeDasharray="6 5"
          opacity={0.5}
        />

        {VERBS.map((verb, vi) => {
          const isBuild = vi === BUILD_INDEX;
          const yourH = YOUR_HEIGHTS[verb];
          const bx = barLeft(vi);
          const cx = verbCenterX(vi);

          // Your bar height
          const phase1Progress = isBuild ? buildBarProgress : 0;
          const barH = phase1Progress * yourH * CHART_H;
          const barY = CHART_BOTTOM - barH;

          // "Your" bar color: BUILD is terracotta in phase 2, green in phase 1; others = border
          const yourBarColor = isBuild
            ? (isCrowding ? CLAUDE.SPARK : '#4A7C59')
            : CLAUDE.BORDER;

          return (
            <React.Fragment key={verb}>
              {/* YOUR bar */}
              {barH > 0 && (
                <rect
                  x={bx}
                  y={barY}
                  width={BAR_W}
                  height={barH}
                  fill={yourBarColor}
                  rx={6}
                  opacity={isBuild && isCrowding ? 0.55 : 1}
                />
              )}

              {/* Crowd bars — only for BUILD column */}
              {isBuild && crowdSprings.map((crowdProg, ci) => {
                const crowdH = crowdProg * (0.72 + Math.sin(ci * 1.7) * 0.12) * CHART_H;
                const crowdY = CHART_BOTTOM - crowdH;
                const offset = (ci - (CROWD_COUNT - 1) / 2) * (BAR_W * 0.92);
                return (
                  <rect
                    key={ci}
                    x={bx + offset + (ci % 2 === 0 ? 1 : -1)}
                    y={crowdY}
                    width={BAR_W * 0.7}
                    height={crowdH}
                    fill={CLAUDE.INK_SOFT}
                    rx={4}
                    opacity={crowdProg * 0.22}
                  />
                );
              })}

              {/* "82% of candidates" flood label on BUILD */}
              {isBuild && crowdLabelIn > 0.1 && (
                <text
                  x={cx + BAR_W * 1.6}
                  y={CHART_Y + CHART_H * 0.28}
                  fontFamily={SANS}
                  fontSize={26}
                  fill={CLAUDE.INK_SOFT}
                  opacity={crowdLabelIn}
                  dominantBaseline="middle"
                >
                  82% same repos
                </text>
              )}

              {/* Verb label */}
              <text
                x={cx}
                y={CHART_BOTTOM + 36}
                textAnchor="middle"
                fontFamily={SANS}
                fontSize={28}
                fontWeight="700"
                fill={isBuild ? (isCrowding ? CLAUDE.SPARK : CLAUDE.INK) : CLAUDE.INK_SOFT}
                letterSpacing="0.06em"
              >
                {verb}
              </text>
            </React.Fragment>
          );
        })}

        {/* "Your signal." label above BUILD bar — phase 1 */}
        {!isCrowding && labelIn > 0.1 && (
          <text
            x={verbCenterX(BUILD_INDEX)}
            y={CHART_BOTTOM - YOUR_HEIGHTS['BUILD'] * CHART_H - 18}
            textAnchor="middle"
            fontFamily={SANS}
            fontSize={26}
            fontWeight="700"
            fill={'#4A7C59'}
            opacity={labelIn * (1 - crowdLabelIn)}
          >
            Your signal.
          </text>
        )}

        {/* "Market can't see these" annotation over IDEATE/SHIP/MEASURE — phase 2 */}
        {invisibleIn > 0.05 && [0, 2, 3].map((vi) => (
          <text
            key={vi}
            x={verbCenterX(vi)}
            y={CHART_BOTTOM - 36}
            textAnchor="middle"
            fontFamily={SANS}
            fontSize={24}
            fill={CLAUDE.GHOST}
            opacity={invisibleIn}
          >
            invisible
          </text>
        ))}

      </svg>

      {/* "Market can't see these" side note */}
      {invisibleIn > 0.05 && (
        <div style={{
          position: 'absolute',
          right: PAD_H,
          top: CHART_Y + 10,
          width: width * 0.22,
          opacity: invisibleIn,
          transform: `translateX(${(1 - invisibleIn) * 16}px)`,
        }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 24,
            fontWeight: 600,
            color: CLAUDE.INK_SOFT,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            Market reads
          </div>
          <div style={{
            fontFamily: SERIF,
            fontSize: 24,
            color: CLAUDE.INK,
            lineHeight: 1.5,
          }}>
            Ideate — invisible from a repo.{' '}
            Ship — no evidence of real users.
          </div>
        </div>
      )}

      {/* Terracotta annotation */}
      {annotationIn > 0.05 && (
        <div style={{
          position: 'absolute',
          left: PAD_H,
          bottom: height * 0.21,
          right: PAD_H,
          opacity: annotationIn,
          transform: `translateY(${(1 - annotationIn) * 10}px)`,
        }}>
          <div style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: `rgba(217,119,87,0.10)`,
            border: `2px solid ${CLAUDE.SPARK}`,
            borderRadius: 10,
          }}>
            <span style={{
              fontFamily: SERIF,
              fontSize: 32,
              fontWeight: 700,
              color: CLAUDE.SPARK,
            }}>
              Build was the signal. Now it's noise.
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SANS,
        fontSize: SPARK_SIZE,
        color: CLAUDE.GHOST,
        opacity: footerIn,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
