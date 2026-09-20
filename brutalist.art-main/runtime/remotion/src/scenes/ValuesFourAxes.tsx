import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ValuesFourAxes — Figure 2 for "Claude's Values Across Models and Languages"
 * Source: Anthropic (Jul 13, 2026)
 *
 * Four horizontal axes, one at a time. Each axis:
 *   - Slides in from left with spring
 *   - Left-pole chip cluster + right-pole chip cluster
 *   - Small filled circle marker slides from center to demonstrate spectrum
 *
 * No numeric tick marks — positions are illustrative.
 * One terracotta moment: NOT used here (see palette: this is an explanatory beat,
 * the axes themselves are the accent — the INK lines are the signal).
 * Actually: we use SPARK on the sliding marker as the ONE terracotta accent.
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const valuesFourAxesSchema = z.object({
  sparkLine: z.string().default('Four spectrums. One model.'),
});
export type ValuesFourAxesProps = z.infer<typeof valuesFourAxesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const AXES = [
  {
    name: 'Axis 1',
    leftLabel: 'Deference',
    rightLabel: 'Caution',
    leftChips: ['accommodation', 'respects preferences'],
    rightChips: ['harm reduction', 'responsible guidance'],
    markerOffset: -0.25, // -1 = full left, +1 = full right
  },
  {
    name: 'Axis 2',
    leftLabel: 'Warmth',
    rightLabel: 'Rigor',
    leftChips: ['encouragement', 'positive framing'],
    rightChips: ['accuracy', 'transparency'],
    markerOffset: 0.1,
  },
  {
    name: 'Axis 3',
    leftLabel: 'Depth',
    rightLabel: 'Brevity',
    leftChips: ['nuance', 'critical thinking'],
    rightChips: ['compliance', 'concise'],
    markerOffset: 0.15,
  },
  {
    name: 'Axis 4',
    leftLabel: 'Candor',
    rightLabel: 'Execution',
    leftChips: ['honest limits', 'owns errors'],
    rightChips: ['results', 'polish'],
    markerOffset: 0.2,
  },
];

// Stagger: each axis appears 40 frames after the previous
const AXIS_STAGGER = 45;
const TITLE_IN = 0;
const FIRST_AXIS_IN = 20;
const SPARK_IN = FIRST_AXIS_IN + AXES.length * AXIS_STAGGER + 20;

export const ValuesFourAxes: React.FC<ValuesFourAxesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.07;

  const titleIn = spring({ frame: frame - TITLE_IN, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkInAnim = spring({ frame: frame - SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - (FIRST_AXIS_IN + AXES.length * AXIS_STAGGER), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Layout constants
  const AXIS_W = width - PAD_X * 2;
  const CHIP_POOL_W = width * 0.18;
  const LINE_START = PAD_X + CHIP_POOL_W + 16;
  const LINE_END = width - PAD_X - CHIP_POOL_W - 16;
  const LINE_W = LINE_END - LINE_START;
  const AXIS_BLOCK_H = (height * 0.75) / AXES.length;
  const AXES_TOP = PAD_Y + height * 0.17;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        THE FOUR AXES · VALUE SPECTRUM
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Each axis: a spectrum of values
      </div>

      {/* Axes */}
      {AXES.map((axis, i) => {
        const startFrame = FIRST_AXIS_IN + i * AXIS_STAGGER;
        const axisIn = spring({ frame: frame - startFrame, fps, config: { damping: 24, stiffness: 90, mass: 0.9 } });
        const markerIn = spring({ frame: frame - startFrame - 15, fps, config: { damping: 20, stiffness: 80, mass: 1.0 } });
        const chipsIn = spring({ frame: frame - startFrame - 5, fps, config: { damping: 26, stiffness: 100, mass: 0.8 } });

        const anim = clamp(axisIn, 0, 1);
        const axisY = AXES_TOP + i * AXIS_BLOCK_H + AXIS_BLOCK_H * 0.5;

        // Marker position: 0 = left end, 1 = right end
        const markerT = (0.5 + axis.markerOffset * 0.5) * clamp(markerIn, 0, 1) + 0.5 * (1 - clamp(markerIn, 0, 1));
        const markerX = LINE_START + LINE_W * markerT;

        return (
          <React.Fragment key={axis.name}>
            {/* Axis number label */}
            <div style={{
              position: 'absolute',
              left: PAD_X,
              top: axisY - height * 0.025,
              fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
              color: CLAUDE.GHOST, letterSpacing: 2, textTransform: 'uppercase' as const,
              opacity: anim,
            }}>
              {axis.name}
            </div>

            {/* Left pole label */}
            <div style={{
              position: 'absolute',
              left: PAD_X,
              top: axisY - height * 0.008,
              width: CHIP_POOL_W,
              textAlign: 'right',
              opacity: anim,
              transform: `translateX(${(1 - anim) * -20}px)`,
            }}>
              <div style={{
                fontFamily: SERIF, fontSize: height * 0.020, fontWeight: 700,
                color: CLAUDE.INK, marginBottom: 4,
              }}>
                {axis.leftLabel}
              </div>
              {axis.leftChips.map((chip) => (
                <div key={chip} style={{
                  display: 'inline-block',
                  background: CLAUDE.PILL,
                  border: `1px solid ${CLAUDE.BORDER}`,
                  borderRadius: 12,
                  padding: '2px 8px',
                  marginTop: 3,
                  fontFamily: SANS, fontSize: height * 0.011,
                  color: CLAUDE.INK_SOFT, marginLeft: 4,
                  opacity: clamp(chipsIn, 0, 1),
                }}>
                  {chip}
                </div>
              ))}
            </div>

            {/* Axis line — grows from left */}
            <div style={{
              position: 'absolute',
              left: LINE_START,
              top: axisY,
              width: LINE_W * anim,
              height: 2,
              background: CLAUDE.INK,
              borderRadius: 2,
            }} />

            {/* End caps */}
            {anim > 0.05 && (
              <>
                <div style={{
                  position: 'absolute',
                  left: LINE_START - 4,
                  top: axisY - 4,
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: CLAUDE.INK,
                  opacity: anim,
                }} />
                {anim > 0.9 && (
                  <div style={{
                    position: 'absolute',
                    left: LINE_END - 4,
                    top: axisY - 4,
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: CLAUDE.INK,
                    opacity: anim,
                  }} />
                )}
              </>
            )}

            {/* Terracotta marker dot — slides along axis (ONE per beat = this is the accent moment) */}
            {i === 0 && clamp(markerIn, 0, 1) > 0.05 && (
              <div style={{
                position: 'absolute',
                left: markerX - 9,
                top: axisY - 9,
                width: 18, height: 18,
                borderRadius: '50%',
                background: CLAUDE.SPARK,
                border: `2px solid ${CLAUDE.PAGE}`,
                opacity: clamp(markerIn, 0, 1),
              }} />
            )}

            {/* INK marker for axes 2-4 */}
            {i > 0 && clamp(markerIn, 0, 1) > 0.05 && (
              <div style={{
                position: 'absolute',
                left: markerX - 6,
                top: axisY - 6,
                width: 12, height: 12,
                borderRadius: '50%',
                background: CLAUDE.INK,
                border: `2px solid ${CLAUDE.PAGE}`,
                opacity: clamp(markerIn, 0, 1),
              }} />
            )}

            {/* Right pole label */}
            <div style={{
              position: 'absolute',
              left: LINE_END + 16,
              top: axisY - height * 0.008,
              width: CHIP_POOL_W,
              opacity: anim,
              transform: `translateX(${(1 - anim) * 20}px)`,
            }}>
              <div style={{
                fontFamily: SERIF, fontSize: height * 0.020, fontWeight: 700,
                color: CLAUDE.INK, marginBottom: 4,
              }}>
                {axis.rightLabel}
              </div>
              {axis.rightChips.map((chip) => (
                <div key={chip} style={{
                  display: 'inline-block',
                  background: CLAUDE.PILL,
                  border: `1px solid ${CLAUDE.BORDER}`,
                  borderRadius: 12,
                  padding: '2px 8px',
                  marginTop: 3,
                  marginRight: 4,
                  fontFamily: SANS, fontSize: height * 0.011,
                  color: CLAUDE.INK_SOFT,
                  opacity: clamp(chipsIn, 0, 1),
                }}>
                  {chip}
                </div>
              ))}
            </div>
          </React.Fragment>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.10,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1), fontStyle: 'italic',
      }}>
        Redrawn from Anthropic, Claude's Values Across Models and Languages (2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.04,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkInAnim, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
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
