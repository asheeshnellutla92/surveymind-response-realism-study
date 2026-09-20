import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ValuesLanguageProfiles — Figure 4 for "Claude's Values Across Models and Languages"
 * Source: Anthropic (Jul 13, 2026)
 *
 * Four axes. Six language chips per axis.
 * Required extremes honored:
 *   Warmth↔Rigor: Hindi and Arabic furthest warm; English and Russian furthest rigor
 *     LARGEST spread — Warmth-Rigor axis drawn with extra highlight (SPARK color fades to INK)
 *   Deference↔Caution: Arabic furthest deference; English furthest caution
 *   Depth↔Brevity: English furthest depth; Arabic furthest brevity
 *   Candor↔Execution: Dutch furthest candor; Indonesian furthest execution
 *
 * One terracotta moment: Warmth-Rigor axis highlighted (SPARK color).
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const valuesLanguageProfilesSchema = z.object({
  sparkLine: z.string().default('Biggest spread: Warmth to Rigor.'),
});
export type ValuesLanguageProfilesProps = z.infer<typeof valuesLanguageProfilesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Languages
// Position: -1.0 = full left pole, +1.0 = full right pole
// Axes order: [Deference↔Caution, Warmth↔Rigor, Depth↔Brevity, Candor↔Execution]
const LANGUAGES = [
  {
    id: 'hindi',
    label: 'Hindi',
    behavior: 'warmth-shaped replies',
    behaviorAxis: 1, // Warmth-Rigor
    positions: [-0.30, -0.80, 0.10, 0.0],
  },
  {
    id: 'arabic',
    label: 'Arabic',
    behavior: 'deference + brevity',
    behaviorAxis: 0,
    positions: [-0.75, -0.65, 0.70, 0.05],
  },
  {
    id: 'english',
    label: 'English',
    behavior: 'caution + depth',
    behaviorAxis: 0,
    positions: [0.70, 0.65, -0.75, -0.15],
  },
  {
    id: 'russian',
    label: 'Russian',
    behavior: 'rigorous, direct',
    behaviorAxis: 1,
    positions: [0.25, 0.75, -0.25, 0.20],
  },
  {
    id: 'dutch',
    label: 'Dutch',
    behavior: 'owns errors',
    behaviorAxis: 3,
    positions: [0.10, 0.20, 0.10, -0.70],
  },
  {
    id: 'indonesian',
    label: 'Indonesian',
    behavior: 'execution-focused',
    behaviorAxis: 3,
    positions: [0.05, -0.10, 0.25, 0.75],
  },
];

const AXES = [
  {
    leftLabel: 'Deference',
    rightLabel: 'Caution',
    isHighlighted: false,
  },
  {
    leftLabel: 'Warmth',
    rightLabel: 'Rigor',
    isHighlighted: true, // THE terracotta moment — largest spread
  },
  {
    leftLabel: 'Depth',
    rightLabel: 'Brevity',
    isHighlighted: false,
  },
  {
    leftLabel: 'Candor',
    rightLabel: 'Execution',
    isHighlighted: false,
  },
];

const PHASE_TITLE = 0;
const PHASE_AXES_IN = 20;
const PHASE_CHIPS_IN = 50;
const PHASE_HIGHLIGHT = 100; // warmth-rigor axis terracotta highlight
const PHASE_BEHAVIORS = 140;
const PHASE_SPARK = 190;

export const ValuesLanguageProfiles: React.FC<ValuesLanguageProfilesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.07;

  const titleIn = spring({ frame: frame - PHASE_TITLE, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const axesIn = spring({ frame: frame - PHASE_AXES_IN, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const chipsIn = spring({ frame: frame - PHASE_CHIPS_IN, fps, config: { damping: 22, stiffness: 90, mass: 1.0 } });
  const highlightAnim = spring({ frame: frame - PHASE_HIGHLIGHT, fps, config: { damping: 20, stiffness: 80, mass: 1.0 } });
  const behaviorsIn = spring({ frame: frame - PHASE_BEHAVIORS, fps, config: { damping: 26, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - PHASE_BEHAVIORS, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Layout
  const CHIP_POOL_W = width * 0.13;
  const LINE_START = PAD_X + CHIP_POOL_W + 12;
  const LINE_END = width - PAD_X - CHIP_POOL_W - 12;
  const LINE_W = LINE_END - LINE_START;
  const AXES_TOP = PAD_Y + height * 0.18;
  const AXIS_BLOCK_H = (height * 0.62) / AXES.length;

  // Warmth-Rigor axis (index 1) highlight: SPARK color fades to INK
  const highlightT = clamp(highlightAnim, 0, 1);
  // Color lerp: SPARK → INK over time (but stays brighter than non-highlighted)
  const hlR = Math.round(217 + (61 - 217) * highlightT * 0.3); // stays terracotta-ish
  const hlG = Math.round(119 + (57 - 119) * highlightT * 0.3);
  const hlB = Math.round(87 + (41 - 87) * highlightT * 0.3);
  const highlightColor = `rgb(${hlR},${hlG},${hlB})`;

  // Behavior chips (shown near the language chips on their most distinctive axis)
  const distinctiveBehaviors: { label: string; axisIdx: number; position: number; behavior: string }[] = LANGUAGES.map((lang) => ({
    label: lang.label,
    axisIdx: lang.behaviorAxis,
    position: lang.positions[lang.behaviorAxis],
    behavior: lang.behavior,
  }));

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        LANGUAGE PROFILES · SIX LANGUAGES MEASURED
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Language shifts the expressed values.
      </div>

      {/* Axes */}
      {AXES.map((axis, axisIdx) => {
        const axisY = AXES_TOP + axisIdx * AXIS_BLOCK_H + AXIS_BLOCK_H * 0.45;
        const anim = clamp(axesIn, 0, 1);
        const isHL = axis.isHighlighted;
        const axisLineColor = isHL ? highlightColor : CLAUDE.INK;
        const axisLineH = isHL ? 3 : 1.5; // wider for the highlighted axis

        return (
          <React.Fragment key={axis.leftLabel}>
            {/* Left pole */}
            <div style={{
              position: 'absolute',
              left: PAD_X,
              top: axisY - height * 0.014,
              width: CHIP_POOL_W,
              textAlign: 'right',
              fontFamily: SERIF, fontSize: height * 0.018, fontWeight: isHL ? 700 : 600,
              color: isHL ? highlightColor : CLAUDE.INK_SOFT,
              opacity: anim,
            }}>
              {axis.leftLabel}
            </div>

            {/* Axis line — highlighted axis is thicker and terracotta */}
            <div style={{
              position: 'absolute',
              left: LINE_START,
              top: axisY - axisLineH / 2,
              width: LINE_W * anim,
              height: axisLineH,
              background: axisLineColor,
              borderRadius: 2,
            }} />

            {/* "LARGEST SPREAD" label on highlighted axis */}
            {isHL && clamp(highlightAnim, 0, 1) > 0.3 && (
              <div style={{
                position: 'absolute',
                left: LINE_START + LINE_W * 0.5,
                top: axisY - height * 0.042,
                transform: 'translateX(-50%)',
                fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
                color: highlightColor,
                letterSpacing: 2, textTransform: 'uppercase' as const,
                opacity: clamp(highlightAnim, 0, 1),
              }}>
                ← largest spread →
              </div>
            )}

            {/* End caps */}
            {anim > 0.1 && (
              <>
                <div style={{
                  position: 'absolute',
                  left: LINE_START - 3,
                  top: axisY - 3,
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: axisLineColor,
                  opacity: anim,
                }} />
                {anim > 0.9 && (
                  <div style={{
                    position: 'absolute',
                    left: LINE_END - 3,
                    top: axisY - 3,
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: axisLineColor,
                    opacity: anim,
                  }} />
                )}
              </>
            )}

            {/* Right pole */}
            <div style={{
              position: 'absolute',
              left: LINE_END + 12,
              top: axisY - height * 0.014,
              width: CHIP_POOL_W,
              fontFamily: SERIF, fontSize: height * 0.018, fontWeight: isHL ? 700 : 600,
              color: isHL ? highlightColor : CLAUDE.INK_SOFT,
              opacity: anim,
            }}>
              {axis.rightLabel}
            </div>

            {/* Language chips on this axis */}
            {LANGUAGES.map((lang, langIdx) => {
              const chipDelay = langIdx * 5;
              const chipAnim = spring({
                frame: frame - PHASE_CHIPS_IN - chipDelay,
                fps,
                config: { damping: 22, stiffness: 90, mass: 0.9 },
              });
              const t = clamp(chipAnim, 0, 1);
              const chipX = LINE_START + LINE_W * (0.5 + lang.positions[axisIdx] * 0.45);
              const chipOpacity = t;

              return (
                <div key={lang.id} style={{
                  position: 'absolute',
                  left: chipX,
                  top: axisY - 11,
                  transform: 'translateX(-50%)',
                  background: CLAUDE.CARD,
                  border: `1.5px solid ${isHL && clamp(highlightAnim, 0, 1) > 0.3 ? highlightColor : CLAUDE.BORDER}`,
                  borderRadius: 12,
                  padding: '3px 8px',
                  fontFamily: SANS,
                  fontSize: height * 0.011,
                  fontWeight: 500,
                  color: CLAUDE.INK,
                  opacity: chipOpacity,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                }}>
                  {lang.label}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}

      {/* Behavior summary row (bottom) */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        bottom: height * 0.14,
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 8,
        opacity: clamp(behaviorsIn, 0, 1),
        transform: `translateY(${(1 - clamp(behaviorsIn, 0, 1)) * 10}px)`,
      }}>
        {LANGUAGES.map((lang) => (
          <div key={lang.id} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
              color: CLAUDE.INK, marginBottom: 4,
            }}>
              {lang.label}
            </div>
            <div style={{
              display: 'inline-block',
              background: CLAUDE.PILL,
              border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 14,
              padding: '3px 10px',
              fontFamily: SERIF, fontSize: height * 0.012, fontStyle: 'italic',
              color: CLAUDE.INK_SOFT,
            }}>
              {lang.behavior}
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
