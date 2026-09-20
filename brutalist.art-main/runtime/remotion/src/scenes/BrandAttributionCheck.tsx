import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandAttributionCheck — C08 brand-attribution-problem centerpiece.
 * Three case evidence blocks populating:
 *   claimed improvement → cited cause → alternative explanation → what was needed for causation.
 * Five-question attribution checklist appearing as a numbered list at the end.
 * Source: Branding and AI, Chapter 13 (Nina Harris).
 */
export const brandAttributionCheckSchema = z.object({
  phase: z.enum(['cases', 'checklist']).default('checklist'),
});
export type BrandAttributionCheckProps = z.infer<typeof brandAttributionCheckSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const CASES = [
  {
    brand: 'DTC Brand — 2023',
    claimed: 'NPS rose 3 points after brand campaign',
    cause: 'New brand TV spend',
    alternative: 'Competitor pulled back distribution same quarter',
    needed: 'Holdout market with no TV spend; control for competitor exit',
  },
  {
    brand: 'SaaS Company — 2022',
    claimed: 'Trial conversion up 12% after rebrand',
    cause: 'Repositioned messaging',
    alternative: 'Pricing dropped 15% in same quarter',
    needed: 'Factorial test: messaging × pricing; holdout on old messaging',
  },
  {
    brand: 'CPG Launch — 2021',
    claimed: 'Awareness up 8 points after influencer push',
    cause: 'Influencer seeding',
    alternative: 'Seasonal category surge (holiday window)',
    needed: 'Year-over-year baseline with no influencer; category index control',
  },
];

const CHECKLIST = [
  'Did the metric move before the campaign had time to cause it?',
  'Was there a control group or holdout region?',
  'Did competitor activity, pricing, or seasonality change simultaneously?',
  'Can you account for the base rate of this metric improving on its own?',
  'Would a holdout test have been possible, and if not, why not?',
];

export const BrandAttributionCheck: React.FC<BrandAttributionCheckProps> = ({ phase }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const caseSprings = CASES.map((_, i) =>
    clamp(spring({ frame: frame - (10 + i * 16), fps, config: { damping: 28, stiffness: 130, mass: 0.9 } }), 0, 1)
  );
  const checkSprings = CHECKLIST.map((_, i) =>
    clamp(spring({ frame: frame - (phase === 'checklist' ? 10 + i * 10 : 60 + i * 10), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }), 0, 1)
  );
  const sourceIn = clamp(interpolate(frame, [80, 95], [0, 1]), 0, 1);

  const PAD = width * 0.07;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${height * 0.06}px ${PAD}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 34,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 18,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        The Attribution Problem
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {phase === 'cases' ? (
        <>
          {CASES.map((c, ci) => (
            <div key={ci} style={{
              padding: '14px 18px',
              marginBottom: 14,
              background: CLAUDE.CARD,
              border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 12,
              opacity: caseSprings[ci],
              transform: `translateY(${(1 - caseSprings[ci]) * 12}px)`,
            }}>
              <div style={{
                fontFamily: SERIF,
                fontSize: 17,
                fontWeight: 700,
                color: CLAUDE.INK,
                marginBottom: 10,
                borderBottom: `1px solid ${CLAUDE.BORDER}`,
                paddingBottom: 8,
              }}>{c.brand}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                {[
                  { label: 'Claimed improvement', val: c.claimed, accent: false },
                  { label: 'Cited cause', val: c.cause, accent: false },
                  { label: 'Alternative explanation', val: c.alternative, accent: true },
                  { label: 'Needed for causation', val: c.needed, accent: false },
                ].map((item, ii) => (
                  <div key={ii}>
                    <div style={{
                      fontFamily: SANS,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: item.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                      marginBottom: 3,
                    }}>{item.label}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 14, color: CLAUDE.INK }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          <div style={{
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            color: CLAUDE.SPARK,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 16,
            opacity: checkSprings[0] ?? 0,
          }}>
            Five-Question Attribution Checklist
          </div>
          {CHECKLIST.map((q, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              marginBottom: 14,
              padding: '14px 18px',
              background: CLAUDE.CARD,
              border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 10,
              opacity: checkSprings[i],
              transform: `translateX(${(1 - (checkSprings[i] ?? 0)) * -14}px)`,
            }}>
              <span style={{
                fontFamily: SANS,
                fontSize: 18,
                fontWeight: 700,
                color: CLAUDE.SPARK,
                minWidth: 28,
                flexShrink: 0,
              }}>{i + 1}.</span>
              <span style={{ fontFamily: SERIF, fontSize: 18, color: CLAUDE.INK, lineHeight: 1.4 }}>{q}</span>
            </div>
          ))}
        </>
      )}

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        right: PAD,
        fontFamily: SANS,
        fontSize: 12,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 13
      </div>
    </AbsoluteFill>
  );
};
