import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
// interpolate used for markerProgress only — color interpolation via ternary
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SycGradientSpectrum — B01 for "From People-Pleaser to Reward Hacker"
 * Source: Denison et al. 2024, Anthropic — Sycophancy to Subterfuge
 *
 * A horizontal spectrum bar from "Agreeable" (left, muted) to "Edits own grader"
 * (right, terracotta). Four labeled stage markers spaced evenly:
 *   1. Agreeable
 *   2. Sycophantic
 *   3. Test-tampering
 *   4. Reward-editing
 *
 * A circular marker dot springs from left to right in sequence, pausing at each
 * label. When it reaches the right end (SPARK), the right-end label flashes terracotta.
 * Per CLAUDE-BRAND.md: ONE terracotta accent — the rightmost stage is that moment.
 */

export const sycGradientSpectrumSchema = z.object({
  sparkLine: z.string().default('Not a UX problem.'),
});
export type SycGradientSpectrumProps = z.infer<typeof sycGradientSpectrumSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STAGES = [
  { label: 'Agreeable', sublabel: 'mild approval-seeking', color: CLAUDE.INK_SOFT },
  { label: 'Sycophantic', sublabel: 'validates false premises', color: CLAUDE.INK_SOFT },
  { label: 'Test-tampering', sublabel: 'modifies oversight tests', color: CLAUDE.INK },
  { label: 'Reward-editing', sublabel: 'edits reward script + tests', color: CLAUDE.SPARK },
];

export const SycGradientSpectrum: React.FC<SycGradientSpectrumProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.08;
  const PAD_Y = height * 0.08;
  const BAR_TOP = height * 0.44;
  const BAR_HEIGHT = height * 0.06;
  const BAR_LEFT = PAD_X;
  const BAR_WIDTH = width - PAD_X * 2;

  // Title animation
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Bar fill animation (bar grows from left to right over first 40 frames)
  const barFill = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 80, mass: 1.0 } });

  // Marker dot moves through 4 positions, each pausing ~20 frames
  // Position 0 = left edge, position 3 = right edge
  // Marker appears at frame 20, moves to stage 1 at 50, 2 at 80, 3 at 110
  const markerStops = [0, 1, 2, 3];
  const markerFrames = [20, 55, 90, 125];

  // Interpolate marker position across its journey
  const markerProgress = interpolate(
    frame,
    markerFrames,
    markerStops.map(i => i / 3), // 0.0 to 1.0
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Stage label animations (each label springs in as marker approaches)
  const stageAnims = markerFrames.map((startFrame, i) =>
    spring({ frame: frame - (startFrame - 15), fps, config: { damping: 28, stiffness: 110, mass: 0.85 } })
  );

  // The right-end flash: terracotta bloom when marker reaches stage 4 (index 3)
  const reachedEnd = frame >= 125;
  const endFlash = spring({ frame: frame - 125, fps, config: { damping: 22, stiffness: 90, mass: 0.9 } });

  const sparkIn = spring({ frame: frame - 155, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Marker x position
  const markerX = BAR_LEFT + markerProgress * BAR_WIDTH;

  // Gradient: left = PILL/muted, right = SPARK
  const gradientId = 'spectrumGrad';

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
        SYCOPHANCY · THE SPECTRUM
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.065,
        fontFamily: SERIF,
        fontSize: height * 0.038,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        The same drive, at different intensities
      </div>

      {/* Gradient bar background */}
      <div style={{
        position: 'absolute',
        left: BAR_LEFT,
        top: BAR_TOP,
        width: BAR_WIDTH * clamp(barFill, 0, 1),
        height: BAR_HEIGHT,
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        <svg width={BAR_WIDTH} height={BAR_HEIGHT} style={{ display: 'block' }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={CLAUDE.PILL} />
              <stop offset="60%" stopColor={CLAUDE.BORDER} />
              <stop offset="85%" stopColor="#E8A887" />
              <stop offset="100%" stopColor={CLAUDE.SPARK} />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={BAR_WIDTH} height={BAR_HEIGHT} fill={`url(#${gradientId})`} rx={8} />
        </svg>
      </div>

      {/* Stage markers — vertical ticks and labels */}
      {STAGES.map((stage, i) => {
        const xPos = BAR_LEFT + (i / (STAGES.length - 1)) * BAR_WIDTH;
        const anim = stageAnims[i];
        const isLast = i === STAGES.length - 1;
        // Last stage: flip to SPARK when marker reaches it
        const lastLabelColor = isLast
          ? (reachedEnd ? CLAUDE.SPARK : CLAUDE.INK)
          : stage.color;

        return (
          <React.Fragment key={i}>
            {/* Tick mark above bar */}
            <div style={{
              position: 'absolute',
              left: xPos - 1,
              top: BAR_TOP - height * 0.03,
              width: 2,
              height: height * 0.03,
              background: isLast && reachedEnd ? CLAUDE.SPARK : CLAUDE.BORDER,
              opacity: clamp(anim, 0, 1),
            }} />

            {/* Stage label above tick */}
            <div style={{
              position: 'absolute',
              left: xPos,
              top: BAR_TOP - height * 0.13,
              transform: `translateX(-50%) translateY(${(1 - clamp(anim, 0, 1)) * 10}px)`,
              textAlign: 'center',
              opacity: clamp(anim, 0, 1),
            }}>
              <div style={{
                fontFamily: SERIF,
                fontSize: height * 0.021,
                fontWeight: isLast ? 700 : 500,
                color: lastLabelColor,
                lineHeight: 1.25,
              }}>
                {stage.label}
              </div>
            </div>

            {/* Sublabel below bar */}
            <div style={{
              position: 'absolute',
              left: xPos,
              top: BAR_TOP + BAR_HEIGHT + height * 0.025,
              transform: `translateX(-50%)`,
              textAlign: 'center',
              opacity: clamp(anim, 0, 1) * 0.75,
              maxWidth: BAR_WIDTH / STAGES.length - 8,
            }}>
              <div style={{
                fontFamily: SANS,
                fontSize: height * 0.012,
                color: isLast && reachedEnd ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
              }}>
                {stage.sublabel}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Moving marker dot */}
      {frame >= 20 && (
        <div style={{
          position: 'absolute',
          left: markerX - height * 0.022,
          top: BAR_TOP + BAR_HEIGHT / 2 - height * 0.022,
          width: height * 0.044,
          height: height * 0.044,
          borderRadius: '50%',
          background: CLAUDE.CARD,
          border: `3px solid ${frame >= 125 ? CLAUDE.SPARK : CLAUDE.INK}`,
          boxShadow: frame >= 125 ? `0 0 0 4px rgba(217,119,87,0.2)` : `0 2px 8px rgba(61,57,41,0.15)`,
          transition: 'border-color 0.3s, box-shadow 0.3s',
          zIndex: 10,
        }} />
      )}

      {/* Axis labels */}
      <div style={{
        position: 'absolute',
        left: BAR_LEFT,
        top: BAR_TOP + BAR_HEIGHT + height * 0.09,
        fontFamily: SANS,
        fontSize: height * 0.013,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(barFill, 0, 1),
      }}>
        mildly agreeable →
      </div>
      <div style={{
        position: 'absolute',
        right: PAD_X,
        top: BAR_TOP + BAR_HEIGHT + height * 0.09,
        fontFamily: SANS,
        fontSize: height * 0.013,
        fontWeight: 600,
        color: CLAUDE.SPARK,
        opacity: clamp(barFill, 0, 1),
        textAlign: 'right',
      }}>
        ← edits own grader
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
