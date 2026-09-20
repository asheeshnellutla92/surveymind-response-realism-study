import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * MedhavyTwoColumnCard — split-role illustration for claude-medhavy.
 * Left column (what Claude does) vs right column (what you do).
 * SparkLine overlays top center. Items stagger in.
 * Typical use: the draft-then-judge recipe beat (M1 B03).
 */

export const medhavyTwoColumnCardSchema = z.object({
  sparkLine: z.string().default('Draft, then judge.'),
  leftHeader: z.string().default('what Claude does'),
  leftItems: z.array(z.string()).default(['draft the plan', 'cite the standard', 'suggest levels']),
  rightHeader: z.string().default('what you do'),
  rightItems: z.array(z.string()).default(['judge every line', 'catch the errors', 'decide what ships']),
});
export type MedhavyTwoColumnCardProps = z.infer<typeof medhavyTwoColumnCardSchema>;

const STAGE = '#F2F0E9';
const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const MedhavyTwoColumnCard: React.FC<MedhavyTwoColumnCardProps> = ({
  sparkLine, leftHeader, leftItems, rightHeader, rightItems,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sparkIn = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardIn = spring({ frame: frame - 4, fps, config: { damping: 28, stiffness: 130, mass: 0.9 } });
  const hdrIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 130, mass: 0.9 } });

  const maxItems = Math.max(leftItems.length, rightItems.length);

  return (
    <AbsoluteFill style={{ background: STAGE, alignItems: 'center', justifyContent: 'center' }}>
      {/* SparkLine */}
      <div style={{
        position: 'absolute', top: 44, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14,
        opacity: sparkIn,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 38, color: CLAUDE.INK }}>{sparkLine}</span>
      </div>

      {/* Two-column card */}
      <div style={{
        width: 900,
        background: CLAUDE.CARD,
        borderRadius: 20,
        boxShadow: '0 14px 52px rgba(61,57,41,0.13)',
        border: `1px solid ${CLAUDE.BORDER}`,
        overflow: 'hidden',
        opacity: clamp(cardIn, 0, 1),
        transform: `translateY(${(1 - clamp(cardIn, 0, 1)) * 20}px)`,
      }}>
        {/* Column headers */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${CLAUDE.BORDER}` }}>
          {/* Left header */}
          <div style={{
            flex: 1,
            padding: '20px 36px',
            borderRight: `1px solid ${CLAUDE.BORDER}`,
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: CLAUDE.INK_SOFT,
            opacity: clamp(hdrIn, 0, 1),
          }}>
            {leftHeader}
          </div>
          {/* Right header — terracotta accent */}
          <div style={{
            flex: 1,
            padding: '20px 36px',
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: CLAUDE.SPARK,
            opacity: clamp(hdrIn, 0, 1),
          }}>
            {rightHeader}
          </div>
        </div>

        {/* Items */}
        <div style={{ display: 'flex' }}>
          {/* Left items */}
          <div style={{
            flex: 1,
            padding: '28px 36px 32px',
            borderRight: `1px solid ${CLAUDE.BORDER}`,
          }}>
            {leftItems.map((item, i) => {
              const itemIn = spring({ frame: frame - 16 - i * 6, fps, config: { damping: 28, stiffness: 130, mass: 0.9 } });
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  marginBottom: i < leftItems.length - 1 ? 18 : 0,
                  opacity: clamp(itemIn, 0, 1),
                  transform: `translateY(${(1 - clamp(itemIn, 0, 1)) * 8}px)`,
                }}>
                  <span style={{ color: CLAUDE.INK_SOFT, fontFamily: SANS, fontSize: 17, marginTop: 1 }}>·</span>
                  <span style={{ fontFamily: SANS, fontSize: 20, color: CLAUDE.INK, lineHeight: 1.5 }}>{item}</span>
                </div>
              );
            })}
          </div>

          {/* Right items — terracotta bullets */}
          <div style={{
            flex: 1,
            padding: '28px 36px 32px',
          }}>
            {rightItems.map((item, i) => {
              const itemIn = spring({ frame: frame - 16 - i * 6, fps, config: { damping: 28, stiffness: 130, mass: 0.9 } });
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  marginBottom: i < rightItems.length - 1 ? 18 : 0,
                  opacity: clamp(itemIn, 0, 1),
                  transform: `translateY(${(1 - clamp(itemIn, 0, 1)) * 8}px)`,
                }}>
                  <span style={{ color: CLAUDE.SPARK, fontFamily: SANS, fontSize: 17, fontWeight: 700, marginTop: 1 }}>→</span>
                  <span style={{ fontFamily: SANS, fontSize: 20, color: CLAUDE.INK, lineHeight: 1.5 }}>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
