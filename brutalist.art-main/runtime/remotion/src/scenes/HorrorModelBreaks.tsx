import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HorrorModelBreaks — B07 for "The Math of Being Afraid Together"
 * Source: Zebonastic essay by Seth Brown & Humanitarians AI, May 17 2026.
 *
 * TPI equation displayed large.
 * Three "NO TERM FOR ___" stamps crash on sequentially:
 *   1. "NO TERM FOR: hesitation" (bystander effect)
 *   2. "NO TERM FOR: ego" (Dunning-Kruger)
 *   3. "NO TERM FOR: LAUGHTER" — CLAUDE.SPARK, largest, final
 *
 * Terracotta: the LAUGHTER stamp — the one accent.
 * One terracotta moment per beat (CLAUDE-BRAND.md).
 */

export const horrorModelBreaksSchema = z.object({
  sparkLine: z.string().default('The fraction cannot measure laughter.'),
});
export type HorrorModelBreaksProps = z.infer<typeof horrorModelBreaksSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Phase timing
const PHASE_TITLE_IN = 0;
const PHASE_EQ_IN = 20;
const PHASE_STAMP1 = 70;
const PHASE_STAMP2 = 110;
const PHASE_STAMP3 = 155;
const PHASE_CAPTION_IN = 220;
const PHASE_SPINE_IN = 240;
const PHASE_SPARK_IN = 260;

export const HorrorModelBreaks: React.FC<HorrorModelBreaksProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const eqIn = spring({ frame: frame - PHASE_EQ_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const stamp1 = spring({ frame: frame - PHASE_STAMP1, fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
  const stamp2 = spring({ frame: frame - PHASE_STAMP2, fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
  const stamp3 = spring({ frame: frame - PHASE_STAMP3, fps, config: { damping: 12, stiffness: 250, mass: 0.55 } });
  const captionIn = spring({ frame: frame - PHASE_CAPTION_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const spineIn = spring({ frame: frame - PHASE_SPINE_IN, fps, config: { damping: 26, stiffness: 110, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const stamps = [
    {
      label: 'NO TERM FOR: hesitation',
      subLabel: 'Dead by Daylight · volunteer\'s dilemma',
      anim: stamp1,
      isAccent: false,
      rotation: -4,
      x: width * 0.08,
      y: height * 0.46,
    },
    {
      label: 'NO TERM FOR: ego',
      subLabel: 'Dunning-Kruger · rage-quit · unpredictable spike',
      anim: stamp2,
      isAccent: false,
      rotation: 3,
      x: width * 0.35,
      y: height * 0.52,
    },
    {
      label: 'NO TERM FOR: LAUGHTER',
      subLabel: 'emergent comedy · spectacular failure · the release valve',
      anim: stamp3,
      isAccent: true,
      rotation: -2,
      x: width * 0.18,
      y: height * 0.60,
    },
  ];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        STEP 6 · WHERE THE MODEL BREAKS
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Honest. Three things the fraction cannot measure.
      </div>

      {/* The TPI equation — large, centered */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.28,
        right: PAD_X,
        textAlign: 'center',
        opacity: clamp(eqIn, 0, 1),
        transform: `translateY(${(1 - clamp(eqIn, 0, 1)) * 16}px)`,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: CLAUDE.CARD,
          border: `1.5px solid ${CLAUDE.BORDER}`,
          borderRadius: 14,
          padding: '20px 40px',
        }}>
          <span style={{ fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 700, color: CLAUDE.INK }}>
            TPI = Ψ ·
          </span>
          <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 700, color: CLAUDE.INK }}>H<sub>c</sub></span>
            <div style={{ width: '100%', height: 2, background: CLAUDE.INK, margin: '2px 0' }} />
            <span style={{ fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 700, color: CLAUDE.INK }}>N</span>
          </span>
          <span style={{ fontFamily: SERIF, fontSize: height * 0.030, color: CLAUDE.INK }}>
            · (1 + β · Σ δ<sub>ij</sub> · e<sup>−λ·d</sup>)
          </span>
        </div>
      </div>

      {/* Stamp overlays */}
      {stamps.map((stamp, i) => {
        const s = clamp(stamp.anim, 0, 1);
        // Spring "crash" effect: overshoot from below
        const scaleVal = 0.5 + s * 0.55;
        const opacityVal = s;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: stamp.x,
            top: stamp.y,
            transform: `rotate(${stamp.rotation}deg) scale(${scaleVal})`,
            transformOrigin: 'left center',
            opacity: opacityVal,
            zIndex: i + 1,
          }}>
            <div style={{
              background: stamp.isAccent ? CLAUDE.SPARK : CLAUDE.PAGE,
              border: `3px solid ${stamp.isAccent ? CLAUDE.SEND : CLAUDE.INK}`,
              borderRadius: 8,
              padding: '10px 20px',
              maxWidth: width * 0.55,
            }}>
              <div style={{
                fontFamily: SANS,
                fontSize: stamp.isAccent ? height * 0.028 : height * 0.022,
                fontWeight: 900,
                color: stamp.isAccent ? '#FFFFFF' : CLAUDE.INK,
                letterSpacing: stamp.isAccent ? 2 : 1,
                textTransform: 'uppercase' as const,
              }}>
                {stamp.label}
              </div>
              <div style={{
                fontFamily: SERIF,
                fontSize: height * 0.014,
                color: stamp.isAccent ? 'rgba(255,255,255,0.85)' : CLAUDE.INK_SOFT,
                marginTop: 4,
                fontStyle: 'italic',
              }}>
                {stamp.subLabel}
              </div>
            </div>
          </div>
        );
      })}

      {/* Final caption */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        bottom: height * 0.15,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: height * 0.018,
        fontStyle: 'italic',
        color: CLAUDE.INK_SOFT,
        opacity: clamp(captionIn, 0, 1),
      }}>
        "The fraction measures fear. It cannot measure the joy of watching fear go wrong."
      </div>

      {/* Proof spine card — Step 6 */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        bottom: height * 0.03,
        width: width * 0.28,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        padding: '10px 18px',
        opacity: clamp(spineIn, 0, 1),
        transform: `translateY(${(1 - clamp(spineIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
          color: CLAUDE.SPARK, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4,
        }}>Step 6</div>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.014, color: CLAUDE.INK, lineHeight: 1.4 }}>
          laughter has no term · the model ends here
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
