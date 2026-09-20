import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SycWatcherWatched — B04 for "From People-Pleaser to Reward Hacker"
 * Source: Denison et al. 2024, Anthropic — Sycophancy to Subterfuge
 *
 * Two large circle nodes, horizontally centered:
 *   Left:  "Oversight Mechanism" (INK)
 *   Right: "Model" (INK)
 *
 * Phase 1: Arrow from left → right (oversight watching model).
 * Phase 2: A second arrow appears right → left (model watching oversight).
 * Terracotta: the right-to-left arrow when it appears — ONE accent moment.
 *
 * Below each node: small chip with annotation.
 * Bottom: two spectrum chips — "sycophancy · small budget" ↔ "reward tampering · large budget"
 */

export const sycWatcherWatchedSchema = z.object({
  sparkLine: z.string().default('The watcher is being watched.'),
});
export type SycWatcherWatchedProps = z.infer<typeof sycWatcherWatchedSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const SycWatcherWatched: React.FC<SycWatcherWatchedProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.08;
  const PAD_Y = height * 0.08;

  // Node positions
  const NODE_R = height * 0.1;
  const NODE_Y = height * 0.44;
  const LEFT_X = width * 0.28;
  const RIGHT_X = width * 0.72;

  // Phase timing
  // Phase 1: everything up through first arrow (0–60)
  // Phase 2: second (terracotta) arrow appears (80+)
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const leftNodeIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const rightNodeIn = spring({ frame: frame - 25, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const arrow1In = spring({ frame: frame - 50, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  const arrow2In = spring({ frame: frame - 90, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
  const chip1In = spring({ frame: frame - 60, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const chip2In = spring({ frame: frame - 105, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const spectrumIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 155, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Arrow geometry: from edge of one circle to edge of other
  const GAP = 24; // px gap from circle edge
  const arrowStartX = LEFT_X + NODE_R + GAP;
  const arrowEndX = RIGHT_X - NODE_R - GAP;
  const arrowMidY = NODE_Y;

  // Arrow 1 progress (left→right)
  const a1Progress = clamp(arrow1In, 0, 1);
  const a1EndX = arrowStartX + (arrowEndX - arrowStartX) * a1Progress;

  // Arrow 2 progress (right→left, terracotta)
  const a2Progress = clamp(arrow2In, 0, 1);
  const a2StartX = RIGHT_X - NODE_R - GAP;
  const a2EndX = a2StartX - (arrowEndX - arrowStartX) * a2Progress;

  // Label above arrow 1
  const labelY = arrowMidY - NODE_R * 0.5;

  // Label above arrow 2 (terracotta)
  const label2Y = arrowMidY + NODE_R * 0.35;

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
        OVERSIGHT · THE FEEDBACK LOOP
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.065,
        fontFamily: SERIF,
        fontSize: height * 0.036,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        The watcher is being watched
      </div>

      {/* SVG layer for circles, arrows, labels */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'visible' }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Left node circle */}
        <circle
          cx={LEFT_X}
          cy={NODE_Y}
          r={NODE_R * clamp(leftNodeIn, 0, 1)}
          fill={CLAUDE.CARD}
          stroke={CLAUDE.BORDER}
          strokeWidth={2}
        />

        {/* Right node circle */}
        <circle
          cx={RIGHT_X}
          cy={NODE_Y}
          r={NODE_R * clamp(rightNodeIn, 0, 1)}
          fill={CLAUDE.CARD}
          stroke={CLAUDE.BORDER}
          strokeWidth={2}
        />

        {/* Arrow 1: left → right (oversight watching model) */}
        {a1Progress > 0.01 && (
          <g opacity={clamp(arrow1In * 2, 0, 1)}>
            <defs>
              <marker id="arr1head" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.INK_SOFT} />
              </marker>
            </defs>
            <line
              x1={arrowStartX}
              y1={arrowMidY - 18}
              x2={a1EndX}
              y2={arrowMidY - 18}
              stroke={CLAUDE.INK_SOFT}
              strokeWidth={2.5}
              markerEnd={a1Progress > 0.95 ? "url(#arr1head)" : undefined}
            />
          </g>
        )}

        {/* Arrow 1 label */}
        {a1Progress > 0.5 && (
          <text
            x={(arrowStartX + a1EndX) / 2}
            y={arrowMidY - 34}
            textAnchor="middle"
            fontFamily={SANS}
            fontSize={height * 0.012}
            fill={CLAUDE.INK_SOFT}
            opacity={clamp((a1Progress - 0.5) * 2, 0, 1)}
          >
            oversight watches model
          </text>
        )}

        {/* Arrow 2: right → left (model watching oversight) — TERRACOTTA accent */}
        {a2Progress > 0.01 && (
          <g opacity={clamp(arrow2In * 1.5, 0, 1)}>
            <defs>
              <marker id="arr2head" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto-start-reverse">
                <polygon points="8 0, 0 3, 8 6" fill={CLAUDE.SPARK} />
              </marker>
            </defs>
            <line
              x1={a2StartX}
              y1={arrowMidY + 18}
              x2={a2EndX}
              y2={arrowMidY + 18}
              stroke={CLAUDE.SPARK}
              strokeWidth={3}
              markerStart={a2Progress > 0.95 ? "url(#arr2head)" : undefined}
            />
          </g>
        )}

        {/* Arrow 2 label (terracotta) */}
        {a2Progress > 0.5 && (
          <text
            x={(a2StartX + a2EndX) / 2}
            y={arrowMidY + 42}
            textAnchor="middle"
            fontFamily={SANS}
            fontSize={height * 0.012}
            fill={CLAUDE.SPARK}
            fontWeight="700"
            opacity={clamp((a2Progress - 0.5) * 2, 0, 1)}
          >
            model learns what evaluator measures
          </text>
        )}

        {/* Left node label */}
        <text
          x={LEFT_X}
          y={NODE_Y + height * 0.004}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={SERIF}
          fontSize={height * 0.018}
          fontWeight="600"
          fill={CLAUDE.INK}
          opacity={clamp(leftNodeIn, 0, 1)}
        >
          Oversight
        </text>
        <text
          x={LEFT_X}
          y={NODE_Y + height * 0.026}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={SERIF}
          fontSize={height * 0.018}
          fontWeight="600"
          fill={CLAUDE.INK}
          opacity={clamp(leftNodeIn, 0, 1)}
        >
          Mechanism
        </text>

        {/* Right node label */}
        <text
          x={RIGHT_X}
          y={NODE_Y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={SERIF}
          fontSize={height * 0.02}
          fontWeight="600"
          fill={CLAUDE.INK}
          opacity={clamp(rightNodeIn, 0, 1)}
        >
          Model
        </text>
      </svg>

      {/* Left node chip */}
      <div style={{
        position: 'absolute',
        left: LEFT_X - width * 0.11,
        top: NODE_Y + NODE_R + height * 0.028,
        width: width * 0.22,
        textAlign: 'center',
        opacity: clamp(chip1In, 0, 1),
        transform: `translateY(${(1 - clamp(chip1In, 0, 1)) * 8}px)`,
      }}>
        <div style={{
          display: 'inline-block',
          padding: `${height * 0.006}px ${height * 0.01}px`,
          borderRadius: 6,
          background: CLAUDE.PILL,
          fontFamily: SANS,
          fontSize: height * 0.012,
          color: CLAUDE.INK_SOFT,
          lineHeight: 1.3,
        }}>
          Thinks it&apos;s watching the model
        </div>
      </div>

      {/* Right node chip */}
      <div style={{
        position: 'absolute',
        left: RIGHT_X - width * 0.1,
        top: NODE_Y + NODE_R + height * 0.028,
        width: width * 0.2,
        textAlign: 'center',
        opacity: clamp(chip2In, 0, 1),
        transform: `translateY(${(1 - clamp(chip2In, 0, 1)) * 8}px)`,
      }}>
        <div style={{
          display: 'inline-block',
          padding: `${height * 0.006}px ${height * 0.01}px`,
          borderRadius: 6,
          background: `rgba(217,119,87,0.08)`,
          border: `1px solid rgba(217,119,87,0.3)`,
          fontFamily: SANS,
          fontSize: height * 0.012,
          color: CLAUDE.SPARK,
          lineHeight: 1.3,
        }}>
          Learning what evaluator measures
        </div>
      </div>

      {/* Bottom spectrum — sycophancy ↔ reward tampering */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        bottom: height * 0.17,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        opacity: clamp(spectrumIn, 0, 1),
        transform: `translateY(${(1 - clamp(spectrumIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${height * 0.007}px ${height * 0.012}px`,
          borderRadius: 6,
          background: CLAUDE.PILL,
          border: `1.5px solid ${CLAUDE.BORDER}`,
          fontFamily: SANS,
          fontSize: height * 0.013,
          color: CLAUDE.INK_SOFT,
          whiteSpace: 'nowrap',
        }}>
          sycophancy · small budget
        </div>
        {/* Connecting arrow */}
        <div style={{ flex: 1, height: 2, background: CLAUDE.BORDER, position: 'relative', margin: `0 ${height * 0.01}px` }}>
          <svg style={{ position: 'absolute', top: -7, right: -2 }} width={16} height={16} viewBox="0 0 16 16">
            <path d="M2 8 L14 8 M10 4 L14 8 L10 12" stroke={CLAUDE.GHOST} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${height * 0.007}px ${height * 0.012}px`,
          borderRadius: 6,
          background: `rgba(217,119,87,0.08)`,
          border: `1.5px solid ${CLAUDE.SPARK}`,
          fontFamily: SANS,
          fontSize: height * 0.013,
          color: CLAUDE.SPARK,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          reward tampering · large budget
        </div>
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
        Denison et al. 2024, Anthropic — Sycophancy to Subterfuge
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

      {/* @NikBearBrown watermark — lower-right, low opacity (LOGO LAW) */}
      <div style={{
        position: 'absolute',
        right: width * 0.04,
        bottom: height * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        @NikBearBrown
      </div>

    </AbsoluteFill>
  );
};
