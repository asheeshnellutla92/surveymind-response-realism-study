import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01PipelineGap — B01 beat for self-as-project-brand-runner.
 * Enacts the narration: two pipeline columns side by side.
 * LEFT (WITHOUT gates): Claude generates → paste → LinkedIn → "0 committed decisions."
 * RIGHT (WITH gates): lights up phase 2 — decision gates appear at each step.
 * Duration: 590 frames @ 30fps (19.7s)
 * Source: Branding and AI, Chapter 3 + Introduction (Nina Harris).
 */
export const brandB01PipelineGapSchema = z.object({
  sparkLine: z.string().default('The agent drafts. The plus-one decides.'),
});
export type BrandB01PipelineGapProps = z.infer<typeof brandB01PipelineGapSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const LEFT_STEPS = [
  { label: 'Human asks', sub: 'Build my personal brand' },
  { label: 'Claude generates', sub: 'Sounds plausible' },
  { label: 'Paste', sub: '0 committed decisions' },
  { label: 'LinkedIn', sub: 'Machine-authored brand' },
];

const RIGHT_STEPS = [
  { label: 'Claude drafts', sub: 'DRAFT — pending sign-off', gate: false },
  { label: 'Human decides', sub: 'Approve / edit / reject', gate: true },
  { label: 'Human commits', sub: 'Decision logged', gate: true },
  { label: 'Publish', sub: 'Yours, not the model\'s', gate: false },
];

export const BrandB01PipelineGap: React.FC<BrandB01PipelineGapProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  const titleIn = clamp(
    spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } }),
    0, 1
  );

  // Left column steps stagger in
  const leftSprings = LEFT_STEPS.map((_, i) =>
    clamp(spring({ frame: frame - (10 + i * 14), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );

  // Left arrows
  const leftArrowSprings = [0, 1, 2].map((i) =>
    clamp(spring({ frame: frame - (18 + i * 14), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );

  // Phase 2: right column lights up
  const rightIn = clamp(
    spring({ frame: frame - 90, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  const rightSprings = RIGHT_STEPS.map((_, i) =>
    clamp(spring({ frame: frame - (95 + i * 16), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );

  const rightArrowSprings = [0, 1, 2].map((i) =>
    clamp(spring({ frame: frame - (103 + i * 16), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );

  // Left final annotation — terracotta label
  const leftAnnotationIn = clamp(
    spring({ frame: frame - 70, fps, config: { damping: 26, stiffness: 100, mass: 1 } }),
    0, 1
  );

  // Right final annotation — "The plus-one decides"
  const rightAnnotationIn = clamp(
    spring({ frame: frame - 150, fps, config: { damping: 26, stiffness: 100, mass: 1 } }),
    0, 1
  );

  const footerIn = clamp(interpolate(frame, [40, 65], [0, 1]), 0, 1);

  // Layout — fill canvas vertically y≈150 to y≈880
  const PAD_H = width * 0.06;
  const DIVIDER_X = width * 0.5;
  const COL_PAD = width * 0.035;

  const LEFT_COL_X = PAD_H;
  const RIGHT_COL_X = DIVIDER_X + COL_PAD;
  // Each column box width uses ~90% of available column width
  const COL_AVAILABLE = DIVIDER_X - PAD_H - COL_PAD;
  const COL_W = COL_AVAILABLE * 0.90;

  // Boxes fill from FLOW_START_Y to FLOW_END_Y
  // Subtitle sits at ~height*0.18, footer at ~height*0.92
  // Boxes: y≈0.19 to y≈0.88 — use that full range
  const FLOW_START_Y = isPortrait ? height * 0.22 : height * 0.19;
  const FLOW_END_Y = height * 0.85;  // where the last annotation ends
  const N_BOXES = LEFT_STEPS.length;  // 4 boxes
  // Total vertical space for boxes and gaps
  const BOX_H = isPortrait ? height * 0.10 : height * 0.14;
  const ANNOTATION_H = height * 0.06;
  // Gap between boxes: distribute remaining space
  const TOTAL_BOX_SPACE = N_BOXES * BOX_H;
  const TOTAL_GAP_SPACE = FLOW_END_Y - FLOW_START_Y - TOTAL_BOX_SPACE - ANNOTATION_H;
  const GAP = TOTAL_GAP_SPACE / (N_BOXES);  // gap between boxes (including after last)

  const STEP_H = BOX_H + GAP;

  const stepY = (i: number) => FLOW_START_Y + i * STEP_H;
  const stepCY = (i: number) => stepY(i) + BOX_H / 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.03,
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
        Gated vs. ungated pipeline
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Column headers */}
      <div style={{
        position: 'absolute',
        top: height * 0.03 + (isPortrait ? height * 0.15 : height * 0.088),
        left: LEFT_COL_X,
        width: COL_W,
        fontFamily: SANS,
        fontSize: Math.round(height * 0.028),
        fontWeight: 700,
        color: CLAUDE.INK_SOFT,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        opacity: clamp(titleIn, 0, 1),
      }}>
        Without gates
      </div>

      {frame >= 90 && (
        <div style={{
          position: 'absolute',
          top: height * 0.03 + (isPortrait ? height * 0.15 : height * 0.088),
          left: RIGHT_COL_X,
          width: COL_W,
          fontFamily: SANS,
          fontSize: Math.round(height * 0.028),
          fontWeight: 700,
          color: CLAUDE.SPARK,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: rightIn,
        }}>
          With gates
        </div>
      )}

      {/* Divider */}
      <div style={{
        position: 'absolute',
        left: DIVIDER_X - 1.5,
        top: height * 0.12,
        width: 3,
        bottom: height * 0.09,
        background: CLAUDE.BORDER,
        opacity: clamp(titleIn, 0, 1),
      }} />

      {/* SVG arrows */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}
        width={width}
        height={height}
      >
        {/* Left column arrows */}
        {[0, 1, 2].map((i) => {
          const x = LEFT_COL_X + COL_W / 2;
          const y1 = stepY(i) + BOX_H;
          const y2 = stepY(i + 1);
          const progress = leftArrowSprings[i];
          const isPasteArrow = i === 1; // arrow from Claude → Paste
          const arrowColor = (frame >= 70 && isPasteArrow) ? CLAUDE.SPARK : CLAUDE.BORDER;
          return (
            <g key={i} opacity={progress}>
              <line
                x1={x} y1={y1}
                x2={x} y2={y1 + (y2 - y1) * progress}
                stroke={arrowColor} strokeWidth={5}
              />
              {progress > 0.9 && (
                <polygon
                  points={`${x},${y2} ${x - 9},${y2 - 16} ${x + 9},${y2 - 16}`}
                  fill={arrowColor}
                />
              )}
            </g>
          );
        })}

        {/* Right column arrows — gated */}
        {frame >= 90 && [0, 1, 2].map((i) => {
          const x = RIGHT_COL_X + COL_W / 2;
          const y1 = stepY(i) + BOX_H;
          const y2 = stepY(i + 1);
          const progress = rightArrowSprings[i];
          const hasGate = RIGHT_STEPS[i + 1]?.gate;
          return (
            <g key={i} opacity={progress}>
              <line
                x1={x} y1={y1}
                x2={x} y2={y1 + (y2 - y1) * progress}
                stroke={hasGate ? CLAUDE.SPARK : CLAUDE.INK_SOFT}
                strokeWidth={hasGate ? 5 : 4}
              />
              {progress > 0.9 && (
                <polygon
                  points={`${x},${y2} ${x - 9},${y2 - 16} ${x + 9},${y2 - 16}`}
                  fill={hasGate ? CLAUDE.SPARK : CLAUDE.INK_SOFT}
                />
              )}
              {/* Gate checkmark diamond */}
              {hasGate && progress > 0.7 && (
                <g opacity={progress}>
                  <rect
                    x={x - 16}
                    y={y1 + (y2 - y1) / 2 - 16}
                    width={32} height={32}
                    rx={6}
                    fill={CLAUDE.SPARK}
                    transform={`rotate(45, ${x}, ${y1 + (y2 - y1) / 2})`}
                  />
                  <text
                    x={x} y={y1 + (y2 - y1) / 2 + 13}
                    fontFamily={SANS} fontSize={36} fontWeight={900}
                    fill={CLAUDE.CARD} textAnchor="middle"
                  >
                    ✓
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Left column step boxes */}
      {LEFT_STEPS.map((step, i) => {
        const sp = leftSprings[i];
        const isPaste = i === 2;
        const isLast = i === 3;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: LEFT_COL_X,
              top: stepY(i),
              width: COL_W,
              height: BOX_H,
              background: (isPaste && frame >= 70) ? `rgba(217,119,87,0.07)` : CLAUDE.CARD,
              border: `2px solid ${(isPaste && frame >= 70) ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sp,
              transform: `translateY(${(1 - sp) * 14}px)`,
            }}
          >
            <div style={{
              fontFamily: SERIF,
              fontSize: Math.round(height * 0.034),
              fontWeight: 700,
              color: (isPaste || isLast) && frame >= 70 ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'center',
            }}>
              {step.label}
            </div>
            <div style={{
              fontFamily: SANS,
              fontSize: Math.round(height * 0.026),
              color: isPaste && frame >= 70 ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
              textAlign: 'center',
              marginTop: 6,
              fontWeight: isPaste && frame >= 70 ? 700 : 400,
            }}>
              {step.sub}
            </div>
          </div>
        );
      })}

      {/* Left annotation — "Machine-authored brand" */}
      {frame >= 70 && (
        <div style={{
          position: 'absolute',
          left: LEFT_COL_X,
          top: stepY(LEFT_STEPS.length) + 6,
          width: COL_W,
          background: `rgba(217,119,87,0.10)`,
          border: `1.5px solid ${CLAUDE.SPARK}`,
          borderRadius: 8,
          padding: '10px 16px',
          fontFamily: SANS,
          fontSize: Math.round(height * 0.028),
          fontWeight: 700,
          color: CLAUDE.SPARK,
          textAlign: 'center',
          opacity: leftAnnotationIn,
          transform: `translateY(${(1 - leftAnnotationIn) * 8}px)`,
        }}>
          Machine-authored brand.
        </div>
      )}

      {/* Right column step boxes */}
      {frame >= 90 && RIGHT_STEPS.map((step, i) => {
        const sp = rightSprings[i];
        const isDecide = step.gate;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: RIGHT_COL_X,
              top: stepY(i),
              width: COL_W,
              height: BOX_H,
              background: isDecide ? `rgba(217,119,87,0.06)` : CLAUDE.CARD,
              border: `2px solid ${isDecide ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sp,
              transform: `translateY(${(1 - sp) * 14}px)`,
            }}
          >
            <div style={{
              fontFamily: SERIF,
              fontSize: Math.round(height * 0.034),
              fontWeight: 700,
              color: isDecide ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'center',
            }}>
              {step.label}
              {isDecide && (
                <span style={{ marginLeft: 8, fontSize: Math.round(height * 0.030) }}>✓</span>
              )}
            </div>
            <div style={{
              fontFamily: SANS,
              fontSize: Math.round(height * 0.026),
              color: CLAUDE.INK_SOFT,
              textAlign: 'center',
              marginTop: 6,
            }}>
              {step.sub}
            </div>
          </div>
        );
      })}

      {/* Right annotation — "The plus-one decides" */}
      {frame >= 150 && (
        <div style={{
          position: 'absolute',
          left: RIGHT_COL_X,
          top: stepY(RIGHT_STEPS.length) + 6,
          width: COL_W,
          background: CLAUDE.CARD,
          border: `1.5px solid ${CLAUDE.BORDER}`,
          borderRadius: 8,
          padding: '10px 16px',
          fontFamily: SANS,
          fontSize: Math.round(height * 0.032),
          fontWeight: 700,
          color: CLAUDE.INK,
          textAlign: 'center',
          opacity: rightAnnotationIn,
          transform: `translateY(${(1 - rightAnnotationIn) * 8}px)`,
        }}>
          <span style={{ color: CLAUDE.SPARK }}>The plus-one decides.</span>
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
        <span style={{ color: CLAUDE.SPARK, fontWeight: 700, marginRight: 10 }}>AI+1 thesis:</span>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
