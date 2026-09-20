import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const linkedInRedFlagsSchema = z.object({
  sparkLine: z.string().default('The safety feature IS the risk.'),
});
export type LinkedInRedFlagsProps = z.infer<typeof linkedInRedFlagsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const FLAGS = [
  {
    claim: 'Daily send caps · per-day limits',
    pitched: '"We protect your account"',
    reality: 'These exist to stay under LinkedIn\'s detection thresholds — not because LinkedIn approved the activity.',
  },
  {
    claim: 'Randomized timing · "human simulation"',
    pitched: '"Undetectable activity"',
    reality: 'Naming what it\'s evading. The randomization IS the evasion — and "undetectable" is the vendor\'s tell.',
  },
  {
    claim: 'Multi-account rotation · profile spreading',
    pitched: '"Scale your outreach safely"',
    reality: 'A tool that needs several identities to hit its volume is admitting no single account survives that volume.',
  },
];

export const LinkedInRedFlags: React.FC<LinkedInRedFlagsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn  = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const card1In   = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const flip1In   = spring({ frame: frame - 24, fps, config: { damping: 26, stiffness: 110, mass: 1.0 } });
  const card2In   = spring({ frame: frame - 36, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const flip2In   = spring({ frame: frame - 50, fps, config: { damping: 26, stiffness: 110, mass: 1.0 } });
  const card3In   = spring({ frame: frame - 62, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const flip3In   = spring({ frame: frame - 76, fps, config: { damping: 26, stiffness: 110, mass: 1.0 } });
  const verdictIn = spring({ frame: frame - 92, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn   = spring({ frame: frame - 106, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const cardIns = [card1In, card2In, card3In];
  const flipIns = [flip1In, flip2In, flip3In];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.065,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        HOW TO READ VENDOR SAFETY LANGUAGE
      </div>

      <div style={{
        position: 'absolute',
        top: height * 0.12,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 38,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        Three Claims. Three Real Meanings.
      </div>

      {/* Flag cards */}
      <div style={{
        position: 'absolute',
        top: height * 0.245,
        left: width * 0.06,
        right: width * 0.06,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}>
        {FLAGS.map((flag, i) => {
          const cardIn = cardIns[i];
          const flipIn = flipIns[i];
          const flipped = clamp(flipIn, 0, 1) > 0.5;
          return (
            <div key={i} style={{
              display: 'flex',
              gap: 16,
              alignItems: 'stretch',
              opacity: clamp(cardIn, 0, 1),
              transform: `translateY(${(1 - clamp(cardIn, 0, 1)) * 18}px)`,
            }}>
              {/* Claim label */}
              <div style={{
                width: 230,
                flexShrink: 0,
                background: CLAUDE.CARD,
                border: `2px solid ${CLAUDE.BORDER}`,
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.4 }}>
                  {flag.claim}
                </div>
              </div>

              {/* Arrow */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                width: 44,
                flexShrink: 0,
              }}>
                <svg width={44} height={20} viewBox="0 0 44 20" fill="none">
                  <line x1={2} y1={10} x2={36} y2={10} stroke={flipped ? CLAUDE.SPARK : CLAUDE.BORDER} strokeWidth={2} strokeLinecap="round" />
                  <polyline points="28,4 38,10 28,16" stroke={flipped ? CLAUDE.SPARK : CLAUDE.BORDER} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Pitched / Real */}
              <div style={{ flex: 1, display: 'flex', gap: 12 }}>
                {/* Pitched as */}
                <div style={{
                  flex: 1,
                  background: flipped ? CLAUDE.PILL : CLAUDE.CARD,
                  border: `2px solid ${flipped ? CLAUDE.BORDER : CLAUDE.BORDER}`,
                  borderRadius: 12,
                  padding: '14px 18px',
                  opacity: flipped ? 0.45 : 1,
                  transition: 'opacity 0.2s',
                }}>
                  <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 5 }}>
                    Pitched as
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 15, color: CLAUDE.INK, fontStyle: 'italic' }}>
                    {flag.pitched}
                  </div>
                </div>

                {/* Real meaning */}
                <div style={{
                  flex: 2,
                  background: flipped ? '#FEF2F0' : CLAUDE.FOOTER,
                  border: `2px solid ${flipped ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                  borderRadius: 12,
                  padding: '14px 18px',
                }}>
                  <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: flipped ? CLAUDE.SPARK : CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 5 }}>
                    Real meaning
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.5 }}>
                    {flag.reality}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verdict line */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.145,
        left: width * 0.06,
        right: width * 0.06,
        background: CLAUDE.SPARK,
        borderRadius: 12,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: clamp(verdictIn, 0, 1),
        transform: `scaleX(${clamp(verdictIn, 0, 1)})`,
        transformOrigin: 'center',
      }}>
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#fff' }}>
          When the product's safety feature is spreading the risk across more of your accounts — the safety feature IS the risk.
        </span>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.065,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
