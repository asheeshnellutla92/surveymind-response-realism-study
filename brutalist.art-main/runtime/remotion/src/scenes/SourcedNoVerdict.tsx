import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SourcedNoVerdict — B05 "Claude, Sourced"
 * Poster-plain rule card: "No source." / "No verdict."
 * Clean serif, terracotta periods.
 */

export const sourcedNoVerdictSchema = z.object({
  sparkLine: z.string().default('No source, no verdict.'),
});
export type SourcedNoVerdictProps = z.infer<typeof sourcedNoVerdictSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const SourcedNoVerdict: React.FC<SourcedNoVerdictProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const line1O = ease(remap(p, 0.06, 0.20, 0, 1));
  const line2O = ease(remap(p, 0.22, 0.36, 0, 1));
  const subO = ease(remap(p, 0.44, 0.58, 0, 1));
  const bottomO = ease(remap(p, 0.68, 0.80, 0, 1));

  return (
    <AbsoluteFill style={{
      background: '#F2F0E9',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 0,
    }}>
      {/* Main rule — two lines */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 100,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
        textAlign: 'center',
        opacity: line1O,
      }}>
        No source<span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      <div style={{
        fontFamily: SERIF,
        fontSize: 100,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
        textAlign: 'center',
        opacity: line2O,
        marginTop: 8,
      }}>
        No verdict<span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Sub-rule */}
      <div style={{
        fontFamily: SANS,
        fontSize: 22,
        color: CLAUDE.INK_SOFT,
        marginTop: 40,
        textAlign: 'center',
        maxWidth: 760,
        lineHeight: 1.5,
        opacity: subO,
      }}>
        Not for guides you read. Not for briefs your bot writes. Not for promises a promo service makes.
      </div>

      {/* Call-to-action */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 26,
        color: CLAUDE.SPARK,
        marginTop: 48,
        textAlign: 'center',
        opacity: bottomO,
      }}>
        The person charging you $300 can always cite their source. Watch what happens when you ask.
      </div>
    </AbsoluteFill>
  );
};
