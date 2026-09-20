import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SkillTeardownMechanism — key design decision / verbatim quote card.
 * Used for mechanism acts and design-tell beats in skill teardowns.
 * Supports: large serif heading, body text, optional verbatim quote,
 * optional cite, and spark line.
 * ILLUSTRATE LAW: concept illustration, NOT a UI beat.
 */

export const skillTeardownMechanismSchema = z.object({
  eyebrow: z.string().default('SKILL · MECHANISM'),
  heading: z.string().default('The design decision.'),
  body: z.string().default(''),
  quote: z.string().optional(),
  cite: z.string().optional(),
  verdictLabel: z.string().optional(),
  verdictPositive: z.boolean().default(true),
  sparkLine: z.string().default('This is the interesting part.'),
});
export type SkillTeardownMechanismProps = z.infer<typeof skillTeardownMechanismSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const SkillTeardownMechanism: React.FC<SkillTeardownMechanismProps> = ({
  eyebrow, heading, body, quote, cite, verdictLabel, verdictPositive, sparkLine,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const bodyIn = spring({ frame: frame - 18, fps, config: { damping: 26, stiffness: 110, mass: 1.0 } });
  const quoteIn = spring({ frame: frame - 32, fps, config: { damping: 26, stiffness: 110, mass: 1.0 } });
  const verdictIn = spring({ frame: frame - 50, fps, config: { damping: 26, stiffness: 110, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 60, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const hasQuote = !!quote;
  const hasVerdict = !!verdictLabel;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.07,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        {eyebrow}
      </div>

      {/* Main heading — large serif */}
      <div style={{
        position: 'absolute',
        top: height * 0.13,
        left: width * 0.1,
        right: width * 0.1,
        fontFamily: SERIF,
        fontSize: 52,
        fontWeight: 700,
        color: CLAUDE.INK,
        lineHeight: 1.15,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        {heading}
      </div>

      {/* Body text */}
      {body && (
        <div style={{
          position: 'absolute',
          top: height * (hasQuote ? 0.3 : 0.32),
          left: width * 0.1,
          right: width * 0.1,
          fontFamily: SANS,
          fontSize: 26,
          color: CLAUDE.INK,
          lineHeight: 1.55,
          opacity: clamp(bodyIn, 0, 1),
          transform: `translateY(${(1 - clamp(bodyIn, 0, 1)) * 10}px)`,
        }}>
          {body}
        </div>
      )}

      {/* Verbatim quote block */}
      {hasQuote && (
        <div style={{
          position: 'absolute',
          top: body ? height * 0.54 : height * 0.32,
          left: width * 0.1,
          right: width * 0.1,
          background: CLAUDE.CARD,
          border: `1px solid ${CLAUDE.BORDER}`,
          borderLeft: `4px solid ${CLAUDE.SPARK}`,
          borderRadius: 12,
          padding: '20px 28px',
          opacity: clamp(quoteIn, 0, 1),
          transform: `translateY(${(1 - clamp(quoteIn, 0, 1)) * 10}px)`,
        }}>
          <div style={{ fontFamily: MONO, fontSize: 20, color: CLAUDE.INK, lineHeight: 1.55, whiteSpace: 'pre-wrap' as const }}>
            "{quote}"
          </div>
          {cite && (
            <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.GHOST, marginTop: 10 }}>
              Source: {cite}
            </div>
          )}
        </div>
      )}

      {/* Verdict pill */}
      {hasVerdict && (
        <div style={{
          position: 'absolute',
          bottom: height * 0.14,
          left: width * 0.1,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: clamp(verdictIn, 0, 1),
          transform: `translateY(${(1 - clamp(verdictIn, 0, 1)) * 8}px)`,
        }}>
          <div style={{
            background: verdictPositive ? 'rgba(217,119,87,0.12)' : 'rgba(61,57,41,0.08)',
            border: `1px solid ${verdictPositive ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderRadius: 24,
            padding: '6px 18px',
            fontFamily: SANS,
            fontSize: 15,
            fontWeight: 700,
            color: verdictPositive ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
            letterSpacing: 1,
            textTransform: 'uppercase' as const,
          }}>
            {verdictLabel}
          </div>
        </div>
      )}

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
