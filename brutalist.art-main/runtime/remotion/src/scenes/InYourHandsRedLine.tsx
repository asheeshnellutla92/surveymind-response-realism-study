import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InYourHandsRedLine — B02 "Claude, In Your Hands"
 * Poster-plain red-line card: the three things that never delegate.
 */

export const inYourHandsRedLineSchema = z.object({
  sparkLine: z.string().default('What never delegates.'),
});
export type InYourHandsRedLineProps = z.infer<typeof inYourHandsRedLineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const InYourHandsRedLine: React.FC<InYourHandsRedLineProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const line1O = ease(remap(p, 0.08, 0.20, 0, 1));
  const line2O = ease(remap(p, 0.24, 0.36, 0, 1));
  const line3O = ease(remap(p, 0.40, 0.52, 0, 1));
  const bottomO = ease(remap(p, 0.60, 0.72, 0, 1));
  const sparkO = ease(remap(p, 0, 0.06, 0, 1));

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0, paddingTop: 60,
      }}>
        {[
          { text: 'Claims of fact.', o: line1O },
          { text: 'Money.', o: line2O },
          { text: 'Your name on it.', o: line3O },
        ].map((item, i) => (
          <div key={i} style={{
            fontFamily: SERIF,
            fontSize: 72,
            fontWeight: 700,
            color: CLAUDE.INK,
            letterSpacing: '-0.02em',
            lineHeight: 1.12,
            opacity: item.o,
            display: 'flex', alignItems: 'center', gap: 0,
          }}>
            <span style={{ color: CLAUDE.SPARK, marginRight: 12 }}>—</span>
            {item.text}
          </div>
        ))}

        <div style={{
          fontFamily: SANS,
          fontSize: 22,
          color: CLAUDE.INK_SOFT,
          marginTop: 52,
          textAlign: 'center',
          maxWidth: 800,
          lineHeight: 1.5,
          opacity: bottomO,
        }}>
          Everything else in this deck is designed to buy you time for these three.
        </div>
      </div>
    </AbsoluteFill>
  );
};
