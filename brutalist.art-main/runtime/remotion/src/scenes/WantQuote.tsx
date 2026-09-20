import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantQuote — Reusable typographic quote scene for B03, B05, B07, B09.
 * Source: Anthropic, "What 81,000 People Want from AI" (2026)
 *
 * Full-screen cream background (#FAF9F5).
 * Large open-quote mark (terracotta, ~15% height, EB Garamond italic) fades in.
 * Quote text in EB Garamond italic, warm ink, centered, ~4% height font.
 * Attribution chip below — small Montserrat all-caps, INK_SOFT.
 * SparkLine footer.
 *
 * ONE terracotta accent: the opening quotation mark.
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const wantQuoteSchema = z.object({
  quote: z.string(),
  attribution: z.string(),
  sparkLine: z.string().default(''),
});
export type WantQuoteProps = z.infer<typeof wantQuoteSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const WantQuote: React.FC<WantQuoteProps> = ({ quote, attribution, sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // The open-quote mark fades in first
  const quoteMarkIn = spring({ frame, fps, config: { damping: 25, stiffness: 80, mass: 1.1 } });
  // Quote text slides up from below
  const quoteTextIn = spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  // Attribution chip
  const attributionIn = spring({ frame: frame - 30, fps, config: { damping: 26, stiffness: 90, mass: 1.0 } });
  // Citation line
  const citeIn = spring({ frame: frame - 50, fps, config: { damping: 26, stiffness: 90, mass: 0.9 } });
  // Spark line
  const sparkIn = spring({ frame: frame - 45, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.15;

  return (
    <AbsoluteFill style={{
      background: CLAUDE.PAGE,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>

      {/* Open-quote mark — terracotta, large — the ONE accent */}
      <div style={{
        position: 'absolute',
        left: PAD_X - width * 0.02,
        top: height * 0.18,
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontSize: height * 0.20,
        color: CLAUDE.SPARK,
        lineHeight: 1,
        opacity: clamp(quoteMarkIn, 0, 1),
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        &#x201C;
      </div>

      {/* Quote text */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        top: '50%',
        transform: `translateY(calc(-50% + ${(1 - quoteTextIn) * 24}px))`,
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontSize: height * 0.046,
        fontWeight: 500,
        color: CLAUDE.INK,
        textAlign: 'center',
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        opacity: clamp(quoteTextIn, 0, 1),
      }}>
        {quote}
      </div>

      {/* Attribution chip */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        top: '50%',
        transform: `translateY(calc(${height * 0.14}px + ${(1 - attributionIn) * 12}px))`,
        display: 'flex',
        justifyContent: 'center',
        opacity: clamp(attributionIn, 0, 1),
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: height * 0.015,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT,
          borderTop: `1px solid ${CLAUDE.BORDER}`,
          paddingTop: 10,
          paddingLeft: 20,
          paddingRight: 20,
          textAlign: 'center',
        }}>
          {attribution}
        </div>
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Data: Anthropic, What 81,000 People Want from AI (2026)
      </div>

      {/* Spark line */}
      {sparkLine && (
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: height * 0.06,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          opacity: clamp(sparkIn, 0, 1),
        }}>
          <span style={{
            fontFamily: SERIF,
            fontSize: height * 0.022,
            fontStyle: 'italic',
            color: CLAUDE.INK,
          }}>
            {sparkLine}
          </span>
        </div>
      )}

    </AbsoluteFill>
  );
};
