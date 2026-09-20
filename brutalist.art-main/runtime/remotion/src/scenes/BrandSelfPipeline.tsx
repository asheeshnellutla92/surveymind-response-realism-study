import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandSelfPipeline — C12 self-as-project-brand-runner centerpiece.
 * Four-artifact pipeline (Archetype → Position → Voice → Portfolio Thesis)
 * as a vertical flow — each node appearing with DRAFT label,
 * then a "+1 REQUIRED" gate appearing beside it.
 * Accountability log entries appearing as each gate fires.
 * Source: Branding and AI, Chapter 3 + Introduction (Nina Harris).
 */
export const brandSelfPipelineSchema = z.object({});
export type BrandSelfPipelineProps = z.infer<typeof brandSelfPipelineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const STAGES = [
  {
    name: 'Archetype',
    draft: 'Explorer — driven by possibility, shadow: aimlessness',
    check: 'Does this ring true to people who know you?',
  },
  {
    name: 'Position',
    draft: 'The engineer who ships products AND frames them for the market.',
    check: "Can you name two people you've actually positioned against?",
  },
  {
    name: 'Voice',
    draft: 'Direct, concrete, no hedging. The idea, then the evidence.',
    check: 'Does your last 5 pieces of writing match this?',
  },
  {
    name: 'Portfolio Thesis',
    draft: 'Every project is a proof point for "judgment + execution + ship."',
    check: 'Review your last 3 projects — do they prove this?',
  },
];

export const BrandSelfPipeline: React.FC<BrandSelfPipelineProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });

  const stageSprings = STAGES.map((_, i) =>
    clamp(spring({ frame: frame - (10 + i * 14), fps, config: { damping: 28, stiffness: 130, mass: 0.9 } }), 0, 1)
  );
  const gateSprings = STAGES.map((_, i) =>
    clamp(spring({ frame: frame - (22 + i * 14), fps, config: { damping: 26, stiffness: 120, mass: 1 } }), 0, 1)
  );
  const logIn = clamp(spring({ frame: frame - 62, fps, config: { damping: 24, stiffness: 110, mass: 1.1 } }), 0, 1);
  const sourceIn = clamp(interpolate(frame, [75, 90], [0, 1]), 0, 1);

  const PAD = width * 0.07;
  const NODE_W = width * 0.46;
  const GATE_W = width * 0.3;
  const NODE_X = PAD;
  const GATE_X = PAD + NODE_W + 28;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${height * 0.05}px ${PAD}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 32,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 18,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Self-as-Project Pipeline
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex',
        marginBottom: 10,
        opacity: clamp(titleIn, 0, 1),
      }}>
        <div style={{
          width: NODE_W,
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: CLAUDE.INK_SOFT,
        }}>AI Drafts</div>
        <div style={{
          marginLeft: 28,
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: CLAUDE.SPARK,
        }}>+1 Required (You Decide)</div>
      </div>

      {/* Stage nodes + gates */}
      {STAGES.map((stage, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'flex-start',
          marginBottom: 14,
          gap: 16,
        }}>
          {/* Stage node */}
          <div style={{
            width: NODE_W,
            padding: '14px 18px',
            background: CLAUDE.CARD,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 12,
            opacity: stageSprings[i],
            transform: `translateY(${(1 - stageSprings[i]) * 12}px)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                fontFamily: SERIF,
                fontSize: 18,
                fontWeight: 700,
                color: CLAUDE.INK,
              }}>{stage.name}</div>
              <span style={{
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: CLAUDE.INK_SOFT,
                background: CLAUDE.FOOTER,
                padding: '2px 8px',
                borderRadius: 4,
              }}>DRAFT</span>
            </div>
            <div style={{
              fontFamily: SERIF,
              fontSize: 14,
              color: CLAUDE.INK,
              lineHeight: 1.5,
            }}>{stage.draft}</div>
          </div>

          {/* Arrow connector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: 20,
            opacity: gateSprings[i],
          }}>
            <svg width={28} height={24}>
              <line x1={0} y1={12} x2={22} y2={12} stroke={CLAUDE.SPARK} strokeWidth={2} />
              <polygon points="18,7 28,12 18,17" fill={CLAUDE.SPARK} />
            </svg>
          </div>

          {/* Gate */}
          <div style={{
            flex: 1,
            padding: '12px 16px',
            background: `rgba(217,119,87,0.07)`,
            border: `1px solid ${CLAUDE.SPARK}`,
            borderRadius: 10,
            opacity: gateSprings[i],
            transform: `translateX(${(1 - gateSprings[i]) * 16}px)`,
          }}>
            <div style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: CLAUDE.SPARK,
              marginBottom: 6,
            }}>+1 REQUIRED</div>
            <div style={{
              fontFamily: SERIF,
              fontSize: 13,
              color: CLAUDE.INK,
              lineHeight: 1.4,
            }}>{stage.check}</div>
          </div>
        </div>
      ))}

      {/* Accountability log note */}
      <div style={{
        padding: '12px 16px',
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        marginTop: 4,
        opacity: logIn,
        transform: `translateY(${(1 - logIn) * 10}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: CLAUDE.INK_SOFT,
        }}>Accountability Log →</span>
        <span style={{ fontFamily: SERIF, fontSize: 15, color: CLAUDE.INK }}>
          Records which drafts you approved, edited, or rejected. The log proves which was which.
        </span>
      </div>

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.03,
        right: PAD,
        fontFamily: SANS,
        fontSize: 12,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 3 + Intro
      </div>
    </AbsoluteFill>
  );
};
