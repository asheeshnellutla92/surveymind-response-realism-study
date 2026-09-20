import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * MedhavyConceptCard — inner beat illustration for claude-medhavy season 1.
 * Cream stage, white card, heading + body + optional evidence note footer.
 * SparkLine (terracotta spark + one serif line) overlays top center.
 * ILLUSTRATE LAW: this component owns educator concept beats where the
 * UI is NOT the subject. Evidence flag (evidenceNote prop) displays ⚑ source.
 */

export const medhavyConceptCardSchema = z.object({
  sparkLine: z.string().default('The key insight.'),
  heading: z.string().default('the concept'),
  body: z.string().default('The body of the concept goes here.'),
  evidenceNote: z.string().optional(),
});
export type MedhavyConceptCardProps = z.infer<typeof medhavyConceptCardSchema>;

const STAGE = '#F2F0E9';
const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const MedhavyConceptCard: React.FC<MedhavyConceptCardProps> = ({
  sparkLine, heading, body, evidenceNote,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sparkIn = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardIn = spring({ frame: frame - 4, fps, config: { damping: 28, stiffness: 130, mass: 0.9 } });
  const headIn = spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 130, mass: 0.9 } });
  const bodyIn = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 130, mass: 0.9 } });
  const evidIn = spring({ frame: frame - 28, fps, config: { damping: 28, stiffness: 130, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: STAGE, alignItems: 'center', justifyContent: 'center' }}>
      {/* SparkLine — top center overlay */}
      <div style={{
        position: 'absolute', top: 44, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14,
        opacity: sparkIn,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 38, color: CLAUDE.INK }}>{sparkLine}</span>
      </div>

      {/* Card */}
      <div style={{
        width: 820,
        background: CLAUDE.CARD,
        borderRadius: 20,
        boxShadow: '0 14px 52px rgba(61,57,41,0.13)',
        border: `1px solid ${CLAUDE.BORDER}`,
        padding: '44px 52px 40px',
        opacity: clamp(cardIn, 0, 1),
        transform: `translateY(${(1 - clamp(cardIn, 0, 1)) * 20}px)`,
      }}>
        {/* Heading */}
        <div style={{
          fontFamily: SERIF,
          fontSize: 44,
          fontWeight: 600,
          color: CLAUDE.INK,
          lineHeight: 1.2,
          marginBottom: 24,
          opacity: clamp(headIn, 0, 1),
          transform: `translateY(${(1 - clamp(headIn, 0, 1)) * 10}px)`,
        }}>
          {heading}
        </div>

        {/* Body */}
        <div style={{
          fontFamily: SANS,
          fontSize: 22,
          color: CLAUDE.INK_SOFT,
          lineHeight: 1.65,
          marginBottom: evidenceNote ? 28 : 0,
          opacity: clamp(bodyIn, 0, 1),
          transform: `translateY(${(1 - clamp(bodyIn, 0, 1)) * 8}px)`,
        }}>
          {body}
        </div>

        {/* Evidence note */}
        {evidenceNote && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            paddingTop: 20,
            borderTop: `1px solid ${CLAUDE.BORDER}`,
            opacity: clamp(evidIn, 0, 1),
          }}>
            <span style={{ color: CLAUDE.SPARK, fontFamily: MONO, fontSize: 14, marginTop: 1 }}>⚑</span>
            <span style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
              {evidenceNote}
            </span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
