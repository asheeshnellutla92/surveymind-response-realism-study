import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HorrorAxiom — B02 for "The Math of Being Afraid Together"
 * Source: Zebonastic essay by Seth Brown & Humanitarians AI, May 17 2026.
 *
 * Body diagram: outline figure with three animated indicators (heart rate, skin conductance, cortisol) — all up.
 * Second figure appears. Chain animation: oxytocin ↑ → HPA axis ↓ → cortisol ↓.
 * Fear meter eases. Label: "social buffering."
 * Proof-spine Step 1 card pins to the right.
 *
 * Terracotta accent: the "social buffering" chain link (the intervention moment).
 * One terracotta moment per beat (CLAUDE-BRAND.md).
 */

export const horrorAxiomSchema = z.object({
  sparkLine: z.string().default('A biological cheat code.'),
});
export type HorrorAxiomProps = z.infer<typeof horrorAxiomSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Simple body silhouette SVG path (torso + head)
const BodyFigure: React.FC<{ color: string; size: number; opacity?: number }> = ({ color, size, opacity = 1 }) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 48 80" style={{ opacity }}>
    {/* head */}
    <circle cx={24} cy={10} r={9} fill="none" stroke={color} strokeWidth={2.5} />
    {/* neck */}
    <line x1={24} y1={19} x2={24} y2={24} stroke={color} strokeWidth={2.5} />
    {/* torso */}
    <path d="M12 24 L8 50 L16 50 L18 70 L24 70 L24 50 L30 70 L36 70 L38 50 L40 50 L36 24 Z"
      fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
    {/* arms */}
    <line x1={12} y1={24} x2={2} y2={42} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <line x1={36} y1={24} x2={46} y2={42} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </svg>
);

// Phase timing
const PHASE_BODY_IN = 0;
const PHASE_INDICATORS_IN = 30;
const PHASE_FRIEND_IN = 80;
const PHASE_CHAIN_IN = 120;
const PHASE_METER_EASE = 140;
const PHASE_LABEL_IN = 200;
const PHASE_SPINE_IN = 210;
const PHASE_SPARK_IN = 240;

export const HorrorAxiom: React.FC<HorrorAxiomProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const bodyIn = spring({ frame: frame - PHASE_BODY_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const friendIn = spring({ frame: frame - PHASE_FRIEND_IN, fps, config: { damping: 22, stiffness: 120, mass: 0.8 } });
  const chainIn1 = spring({ frame: frame - PHASE_CHAIN_IN, fps, config: { damping: 20, stiffness: 130, mass: 0.7 } });
  const chainIn2 = spring({ frame: frame - PHASE_CHAIN_IN - 20, fps, config: { damping: 20, stiffness: 130, mass: 0.7 } });
  const chainIn3 = spring({ frame: frame - PHASE_CHAIN_IN - 40, fps, config: { damping: 20, stiffness: 130, mass: 0.7 } });
  const labelIn = spring({ frame: frame - PHASE_LABEL_IN, fps, config: { damping: 26, stiffness: 110, mass: 0.8 } });
  const spineIn = spring({ frame: frame - PHASE_SPINE_IN, fps, config: { damping: 26, stiffness: 110, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  // Fear meter level: drops after chain animation
  const fearLevel = interpolate(clamp(chainIn3, 0, 1), [0, 1], [0.82, 0.32]);

  // Indicator animation
  const indicators = [
    { label: 'Heart Rate', icon: '♥', startFrame: PHASE_INDICATORS_IN },
    { label: 'Skin Conductance', icon: '~', startFrame: PHASE_INDICATORS_IN + 12 },
    { label: 'Cortisol', icon: '◉', startFrame: PHASE_INDICATORS_IN + 24 },
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
        STEP 1 · THE AXIOM
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Fear is measurable. Company changes it.
      </div>

      {/* Body figures */}
      <div style={{
        position: 'absolute',
        left: PAD_X + width * 0.04,
        top: height * 0.30,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 32,
        opacity: clamp(bodyIn, 0, 1),
        transform: `translateY(${(1 - clamp(bodyIn, 0, 1)) * 20}px)`,
      }}>
        <BodyFigure color={CLAUDE.INK} size={160} />
        <div style={{ opacity: clamp(friendIn, 0, 1), transform: `scale(${0.5 + clamp(friendIn, 0, 1) * 0.5})` }}>
          <BodyFigure color={CLAUDE.INK_SOFT} size={160} />
        </div>
      </div>

      {/* Physiological indicators */}
      <div style={{
        position: 'absolute',
        left: PAD_X + width * 0.22,
        top: height * 0.33,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        {indicators.map(({ label, icon, startFrame }, i) => {
          const indIn = spring({ frame: frame - startFrame, fps, config: { damping: 26, stiffness: 110, mass: 0.8 } });
          return (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: clamp(indIn, 0, 1),
              transform: `translateX(${(1 - clamp(indIn, 0, 1)) * 16}px)`,
            }}>
              <div style={{
                width: 32, height: 32,
                background: CLAUDE.PILL,
                border: `1.5px solid ${CLAUDE.BORDER}`,
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SANS, fontSize: 14, color: CLAUDE.INK,
              }}>{icon}</div>
              <div style={{ fontFamily: SERIF, fontSize: height * 0.016, color: CLAUDE.INK }}>{label}</div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.018, fontWeight: 700,
                color: CLAUDE.INK,
              }}>↑</div>
            </div>
          );
        })}
      </div>

      {/* Chain: oxytocin → HPA axis → cortisol (terracotta accent) */}
      <div style={{
        position: 'absolute',
        left: PAD_X + width * 0.22,
        top: height * 0.56,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {[
          { text: 'oxytocin ↑', anim: chainIn1, isAccent: true },
          { text: 'HPA axis ↓', anim: chainIn2, isAccent: false },
          { text: 'cortisol ↓', anim: chainIn3, isAccent: false },
        ].map(({ text, anim, isAccent }, i) => (
          <React.Fragment key={text}>
            {i > 0 && (
              <div style={{
                fontFamily: SANS, fontSize: height * 0.016, color: CLAUDE.INK_SOFT,
                paddingLeft: 12, opacity: clamp(anim, 0, 1),
              }}>→</div>
            )}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: isAccent ? CLAUDE.SPARK : CLAUDE.PILL,
              border: `1.5px solid ${isAccent ? CLAUDE.SEND : CLAUDE.BORDER}`,
              borderRadius: 8,
              padding: '7px 16px',
              fontFamily: SERIF,
              fontSize: height * 0.018,
              fontWeight: isAccent ? 700 : 500,
              color: isAccent ? '#FFFFFF' : CLAUDE.INK,
              opacity: clamp(anim, 0, 1),
              transform: `translateX(${(1 - clamp(anim, 0, 1)) * 16}px)`,
              alignSelf: 'flex-start',
            }}>
              {text}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Fear meter ease */}
      <div style={{
        position: 'absolute',
        right: PAD_X + width * 0.25,
        top: height * 0.34,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        opacity: clamp(bodyIn, 0, 1),
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>Fear</div>
        <div style={{
          width: 20, height: height * 0.28,
          background: CLAUDE.PILL,
          border: `1.5px solid ${CLAUDE.BORDER}`,
          borderRadius: 6,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            width: '100%',
            height: `${fearLevel * 100}%`,
            background: `linear-gradient(to top, ${CLAUDE.SEND}, ${CLAUDE.SPARK})`,
            borderRadius: 4,
          }} />
        </div>
      </div>

      {/* "social buffering" label */}
      <div style={{
        position: 'absolute',
        left: PAD_X + width * 0.22,
        top: height * 0.76,
        fontFamily: SERIF,
        fontSize: height * 0.018,
        fontStyle: 'italic',
        color: CLAUDE.INK_SOFT,
        opacity: clamp(labelIn, 0, 1),
      }}>
        "social buffering"
      </div>

      {/* Proof spine card — Step 1 */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        top: height * 0.34,
        width: width * 0.22,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        padding: '14px 18px',
        opacity: clamp(spineIn, 0, 1),
        transform: `translateX(${(1 - clamp(spineIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
          color: CLAUDE.SPARK, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 6,
        }}>Step 1</div>
        <div style={{
          fontFamily: SERIF, fontSize: height * 0.014, color: CLAUDE.INK, lineHeight: 1.4,
        }}>
          Fear is physiological · company dampens it
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
