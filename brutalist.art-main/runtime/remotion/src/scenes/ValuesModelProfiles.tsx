import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ValuesModelProfiles — Figure 3 for "Claude's Values Across Models and Languages"
 * Source: Anthropic (Jul 13, 2026)
 *
 * Four axes drawn simultaneously. Three labeled chips per axis:
 *   - Sonnet 4.6, Opus 4.6, Opus 4.7
 *
 * Chips start stacked at center, then spring to their axis positions.
 * One terracotta moment: the separation flash — chips spring apart from stacked center.
 *
 * Required orderings (illustrative, no numeric labels):
 *   Deference↔Caution: Sonnet 4.6 most deferent; Opus 4.7 most cautious; Opus 4.6 slightly deference side
 *   Warmth↔Rigor: Sonnet 4.6 most warm; Opus 4.7 most rigorous; Opus 4.6 rigor side
 *   Depth↔Brevity: Opus 4.7 leans depth; Sonnet 4.6 and Opus 4.6 lean brevity (Opus 4.6 most brief)
 *   Candor↔Execution: Opus 4.7 candor side; Opus 4.6 execution side
 *
 * Behavior chips (below axes):
 *   Opus 4.7: "warns of risks unprompted"
 *   Sonnet 4.6: "comforts without judgment"
 *   Opus 4.6: "gets straight to the point"
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const valuesModelProfilesSchema = z.object({
  sparkLine: z.string().default('The method tracks something real.'),
});
export type ValuesModelProfilesProps = z.infer<typeof valuesModelProfilesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Models with distinct weights for visual differentiation
const MODELS = [
  {
    id: 'sonnet-4-6',
    label: 'Sonnet 4.6',
    fontWeight: 400,
    behavior: 'comforts without judgment',
    // position on each axis: -1.0 = full left pole, +1.0 = full right pole
    // Deference(-1) ↔ Caution(+1)
    // Warmth(-1) ↔ Rigor(+1)
    // Depth(-1) ↔ Brevity(+1)
    // Candor(-1) ↔ Execution(+1)
    positions: [-0.65, -0.70, 0.30, 0.0],
  },
  {
    id: 'opus-4-7',
    label: 'Opus 4.7',
    fontWeight: 700,
    behavior: 'warns of risks unprompted',
    positions: [0.65, 0.75, -0.40, -0.45],
  },
  {
    id: 'opus-4-6',
    label: 'Opus 4.6',
    fontWeight: 500,
    behavior: 'gets straight to the point',
    positions: [-0.20, 0.45, 0.55, 0.50],
  },
];

const AXES = [
  { leftLabel: 'Deference', rightLabel: 'Caution' },
  { leftLabel: 'Warmth', rightLabel: 'Rigor' },
  { leftLabel: 'Depth', rightLabel: 'Brevity' },
  { leftLabel: 'Candor', rightLabel: 'Execution' },
];

const PHASE_TITLE = 0;
const PHASE_AXES_IN = 20;
const PHASE_CHIPS_STACK = 50;  // chips appear stacked at center
const PHASE_CHIPS_SPREAD = 80; // chips spring to positions (terracotta flash)
const PHASE_BEHAVIORS = 130;
const PHASE_SPARK = 180;

export const ValuesModelProfiles: React.FC<ValuesModelProfilesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.07;

  const titleIn = spring({ frame: frame - PHASE_TITLE, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axesIn = spring({ frame: frame - PHASE_AXES_IN, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const stackIn = spring({ frame: frame - PHASE_CHIPS_STACK, fps, config: { damping: 24, stiffness: 90, mass: 0.9 } });
  const spreadAnim = spring({ frame: frame - PHASE_CHIPS_SPREAD, fps, config: { damping: 20, stiffness: 100, mass: 1.0 } });
  const behaviorsIn = spring({ frame: frame - PHASE_BEHAVIORS, fps, config: { damping: 26, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - PHASE_BEHAVIORS, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Layout
  const CHIP_POOL_W = width * 0.14;
  const LINE_START = PAD_X + CHIP_POOL_W + 12;
  const LINE_END = width - PAD_X - CHIP_POOL_W - 12;
  const LINE_W = LINE_END - LINE_START;
  const AXES_TOP = PAD_Y + height * 0.18;
  const AXIS_BLOCK_H = (height * 0.60) / AXES.length;

  // Terracotta: chips spread — use SPARK border on chip flash
  const spreadT = clamp(spreadAnim, 0, 1);

  // Model chip colors for borders — spread flash
  // Terracotta flash = sparkT high
  const chipBorderColor = (modelIndex: number) => {
    if (spreadT < 0.5) return CLAUDE.BORDER;
    // Only ONE terracotta moment — applied to the spread event itself via glow
    return CLAUDE.BORDER;
  };

  // Terracotta accent: a brief glow on the axis-area background during spread
  const flashOpacity = spreadT > 0.3 && spreadT < 0.85
    ? (1 - Math.abs(spreadT - 0.5) * 4) * 0.12
    : 0;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Terracotta separation flash — the ONE accent moment */}
      <div style={{
        position: 'absolute',
        left: LINE_START - 24,
        right: width - LINE_END - 24,
        top: AXES_TOP - 20,
        bottom: height * 0.18,
        background: CLAUDE.SPARK,
        opacity: Math.max(0, flashOpacity),
        borderRadius: 12,
        pointerEvents: 'none',
      }} />

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        MODEL PROFILES · THREE MEASURED CHARACTERS
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Same product. Measurably different characters.
      </div>

      {/* Axes */}
      {AXES.map((axis, axisIdx) => {
        const axisY = AXES_TOP + axisIdx * AXIS_BLOCK_H + AXIS_BLOCK_H * 0.45;
        const anim = clamp(axesIn, 0, 1);

        return (
          <React.Fragment key={axis.leftLabel}>
            {/* Left pole */}
            <div style={{
              position: 'absolute',
              left: PAD_X,
              top: axisY - height * 0.012,
              width: CHIP_POOL_W,
              textAlign: 'right',
              fontFamily: SERIF, fontSize: height * 0.018, fontWeight: 600,
              color: CLAUDE.INK_SOFT,
              opacity: anim,
            }}>
              {axis.leftLabel}
            </div>

            {/* Axis line */}
            <div style={{
              position: 'absolute',
              left: LINE_START,
              top: axisY,
              width: LINE_W * anim,
              height: 1.5,
              background: CLAUDE.INK,
            }} />

            {/* End caps */}
            {anim > 0.1 && (
              <div style={{
                position: 'absolute',
                left: LINE_START - 3,
                top: axisY - 3,
                width: 6, height: 6,
                borderRadius: '50%',
                background: CLAUDE.INK,
                opacity: anim,
              }} />
            )}
            {anim > 0.9 && (
              <div style={{
                position: 'absolute',
                left: LINE_END - 3,
                top: axisY - 3,
                width: 6, height: 6,
                borderRadius: '50%',
                background: CLAUDE.INK,
                opacity: anim,
              }} />
            )}

            {/* Right pole */}
            <div style={{
              position: 'absolute',
              left: LINE_END + 12,
              top: axisY - height * 0.012,
              width: CHIP_POOL_W,
              fontFamily: SERIF, fontSize: height * 0.018, fontWeight: 600,
              color: CLAUDE.INK_SOFT,
              opacity: anim,
            }}>
              {axis.rightLabel}
            </div>

            {/* Model chips on this axis */}
            {MODELS.map((model, modelIdx) => {
              const stackOpacity = clamp(stackIn, 0, 1);
              const spread = clamp(spreadAnim, 0, 1);

              // Stacked position = center of axis
              const stackX = LINE_START + LINE_W * 0.5;
              // Spread position = axis position
              const targetX = LINE_START + LINE_W * (0.5 + model.positions[axisIdx] * 0.45);

              const chipX = stackX + (targetX - stackX) * spread;
              const chipY = axisY;

              // Stack offset (so they don't perfectly overlap before spread)
              const stackOffsetY = (modelIdx - 1) * (spread < 0.3 ? 18 : 0);

              return (
                <div key={model.id} style={{
                  position: 'absolute',
                  left: chipX,
                  top: chipY + stackOffsetY - 11,
                  transform: 'translateX(-50%)',
                  background: CLAUDE.CARD,
                  border: `1.5px solid ${CLAUDE.BORDER}`,
                  borderRadius: 12,
                  padding: '3px 9px',
                  fontFamily: SANS,
                  fontSize: height * 0.012,
                  fontWeight: model.fontWeight,
                  color: CLAUDE.INK,
                  opacity: stackOpacity,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}>
                  {model.label}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}

      {/* Behavior chips (below all axes) */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        bottom: height * 0.14,
        display: 'flex',
        justifyContent: 'space-around',
        opacity: clamp(behaviorsIn, 0, 1),
        transform: `translateY(${(1 - clamp(behaviorsIn, 0, 1)) * 12}px)`,
      }}>
        {MODELS.map((model) => (
          <div key={model.id} style={{ textAlign: 'center', maxWidth: width * 0.25 }}>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
              color: CLAUDE.INK, marginBottom: 6,
            }}>
              {model.label}
            </div>
            <div style={{
              display: 'inline-block',
              background: CLAUDE.PILL,
              border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 16,
              padding: '5px 14px',
              fontFamily: SERIF, fontSize: height * 0.014, fontStyle: 'italic',
              color: CLAUDE.INK_SOFT,
            }}>
              {model.behavior}
            </div>
          </div>
        ))}
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1), fontStyle: 'italic',
      }}>
        Redrawn from Anthropic, Claude's Values Across Models and Languages (2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.03,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
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
