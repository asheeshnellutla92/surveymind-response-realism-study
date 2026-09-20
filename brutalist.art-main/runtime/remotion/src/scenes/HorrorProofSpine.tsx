import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HorrorProofSpine — B08 for "The Math of Being Afraid Together"
 * Source: Zebonastic essay by Seth Brown & Humanitarians AI, May 17 2026.
 *
 * A vertical chain of 6 step-cards accumulates, then collapses accordion-style
 * to the single root card: "fear is physiological, and company dampens it."
 * Closing line appears in large EB Garamond italic (2 lines, staggered fade).
 *
 * Terracotta: the collapse moment — when the whole chain pins to the root.
 * One terracotta moment per beat (CLAUDE-BRAND.md).
 */

export const horrorProofSpineSchema = z.object({
  sparkLine: z.string().default('The distance between you.'),
});
export type HorrorProofSpineProps = z.infer<typeof horrorProofSpineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STEP_CARDS = [
  { step: 1, text: 'Fear is physiological · company dampens it', startFrame: 15 },
  { step: 2, text: 'Groups = multiple nervous systems · not averaged', startFrame: 35 },
  { step: 3, text: 'TPI = Ψ · (Hc/N) · (1 + β · Σ δij · e⁻λd)', startFrame: 55 },
  { step: 4, text: 'Survivors, not heroes · structure over weapons', startFrame: 75 },
  { step: 5, text: 'Hc, δ, Hc+δ — three games, one model', startFrame: 95 },
  { step: 6, text: 'Laughter has no term · the model ends here', startFrame: 115 },
];

// Phase timing
const PHASE_TITLE_IN = 0;
const PHASE_CARDS_START = 15;
const PHASE_COLLAPSE = 190;
const PHASE_ROOT_IN = 225;
const PHASE_CLOSING_LINE1 = 250;
const PHASE_CLOSING_LINE2 = 280;
const PHASE_SPARK_IN = 330;

export const HorrorProofSpine: React.FC<HorrorProofSpineProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const collapseAnim = spring({ frame: frame - PHASE_COLLAPSE, fps, config: { damping: 18, stiffness: 160, mass: 0.7 } });
  const rootIn = spring({ frame: frame - PHASE_ROOT_IN, fps, config: { damping: 22, stiffness: 130, mass: 0.75 } });
  const closingLine1 = spring({ frame: frame - PHASE_CLOSING_LINE1, fps, config: { damping: 28, stiffness: 90, mass: 1.0 } });
  const closingLine2 = spring({ frame: frame - PHASE_CLOSING_LINE2, fps, config: { damping: 28, stiffness: 90, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const collapseP = clamp(collapseAnim, 0, 1);
  const showCards = collapseP < 0.85;
  const showRoot = clamp(rootIn, 0, 1);
  const showClosing = collapseP > 0.5;

  // Card layout (left column, right column alternating)
  const cardW = width * 0.38;
  const cardH = 58;
  const cardGap = 14;
  const leftX = PAD_X;
  const rightX = width * 0.54;
  const startY = height * 0.28;

  // During collapse: all cards slide down toward the root position
  const rootY = height * 0.52;
  const rootX = width * 0.5 - cardW * 0.5 - 40;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        THE PROOF · COMPLETE
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1) * (1 - collapseP * 0.8),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Trace it back. One fact about the body.
      </div>

      {/* Step cards — accumulate then collapse */}
      {STEP_CARDS.map(({ step, text, startFrame }, idx) => {
        const cardIn = spring({ frame: frame - startFrame, fps, config: { damping: 24, stiffness: 110, mass: 0.85 } });
        const cardProgress = clamp(cardIn, 0, 1);

        // Layout: staggered two-column
        const isLeft = idx % 2 === 0;
        const colX = isLeft ? leftX : rightX;
        const row = Math.floor(idx / 2);
        const normalY = startY + row * (cardH + cardGap);

        // Collapse: all converge toward root Y, opacity fades
        const collapseY = normalY + (rootY - normalY) * collapseP;
        const collapseOpacity = 1 - collapseP * 1.2;

        return (
          <div key={step} style={{
            position: 'absolute',
            left: colX,
            top: collapseY,
            width: cardW,
            height: cardH,
            background: CLAUDE.CARD,
            border: `1.5px solid ${CLAUDE.BORDER}`,
            borderRadius: 10,
            padding: '10px 16px',
            opacity: cardProgress * Math.max(0, collapseOpacity),
            transform: `translateX(${(1 - cardProgress) * 30}px)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
          }}>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.010, fontWeight: 700,
              color: CLAUDE.SPARK, letterSpacing: 2, textTransform: 'uppercase' as const,
            }}>
              Step {step}
            </div>
            <div style={{
              fontFamily: SERIF, fontSize: height * 0.013, color: CLAUDE.INK, lineHeight: 1.35,
            }}>
              {text}
            </div>
          </div>
        );
      })}

      {/* Connector line between columns */}
      {showCards && (
        <svg style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} width={width} height={height}>
          <line
            x1={leftX + cardW} y1={startY + cardH * 0.5}
            x2={rightX} y2={startY + cardH * 0.5}
            stroke={CLAUDE.BORDER} strokeWidth={1.5} strokeDasharray="4,4"
            opacity={clamp(spring({ frame: frame - STEP_CARDS[1].startFrame, fps, config: { damping: 24, stiffness: 110, mass: 0.85 } }), 0, 1)}
          />
        </svg>
      )}

      {/* Root card — appears after collapse, terracotta border */}
      {collapseP > 0.4 && (
        <div style={{
          position: 'absolute',
          left: rootX,
          top: rootY,
          width: cardW * 1.1 + 80,
          background: CLAUDE.CARD,
          border: `2.5px solid ${CLAUDE.SPARK}`,
          borderRadius: 14,
          padding: '16px 24px',
          opacity: showRoot,
          transform: `scale(${0.9 + showRoot * 0.1})`,
          transformOrigin: 'center center',
          zIndex: 10,
        }}>
          <div style={{
            fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
            color: CLAUDE.SPARK, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 8,
          }}>
            The root axiom
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: height * 0.020, fontWeight: 600, color: CLAUDE.INK, lineHeight: 1.4,
          }}>
            Fear is physiological, and company dampens it.
          </div>
        </div>
      )}

      {/* Closing lines — EB Garamond italic, staggered */}
      {showClosing && (
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          bottom: height * 0.22,
          textAlign: 'center',
          padding: `0 ${PAD_X}px`,
        }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: height * 0.030,
            fontStyle: 'italic',
            color: CLAUDE.INK,
            lineHeight: 1.5,
            opacity: clamp(closingLine1, 0, 1),
            transform: `translateY(${(1 - clamp(closingLine1, 0, 1)) * 12}px)`,
          }}>
            "The terror was never in the monster.
          </div>
          <div style={{
            fontFamily: SERIF,
            fontSize: height * 0.030,
            fontStyle: 'italic',
            color: CLAUDE.INK,
            lineHeight: 1.5,
            opacity: clamp(closingLine2, 0, 1),
            transform: `translateY(${(1 - clamp(closingLine2, 0, 1)) * 12}px)`,
          }}>
            It was in the distance between you and the person who was supposed to have your back."
          </div>
        </div>
      )}

      {/* Attribution */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        bottom: height * 0.12,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(closingLine2, 0, 1),
      }}>
        Zebonastic · Seth Brown &amp; Humanitarians AI (May 2026)
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
