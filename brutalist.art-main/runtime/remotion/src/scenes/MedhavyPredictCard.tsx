import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * MedhavyPredictCard — PREDICT beat for claude-medhavy.
 * Cream stage. Large EB Garamond question centered. Terracotta draw-on
 * underline (the commit signal). Commit text fades in last.
 * brutalist-medhavy law: >=1 PREDICT per episode. The learner commits
 * before the reveal — this card holds that moment.
 */

export const medhavyPredictCardSchema = z.object({
  sparkLine: z.string().default('Commit before the reveal.'),
  question: z.string().default("What's the most likely failure mode?"),
  commit: z.string().default('commit to an answer before the next beat'),
});
export type MedhavyPredictCardProps = z.infer<typeof medhavyPredictCardSchema>;

const STAGE = '#F2F0E9';
const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) => {
  const t = clamp((x - x0) / (x1 - x0 || 1), 0, 1);
  return y0 + (y1 - y0) * t;
};
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);


export const MedhavyPredictCard: React.FC<MedhavyPredictCardProps> = ({
  sparkLine, question, commit,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkIn = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const qOp = remap(p, 0.04, 0.18, 0, 1);
  const lineP = ease(remap(p, 0.28, 0.52, 0, 1));
  const commitOp = remap(p, 0.55, 0.68, 0, 1);

  const lineW = 340;

  return (
    <AbsoluteFill style={{ background: STAGE }}>
      {/* SparkLine */}
      <div style={{
        position: 'absolute', top: 44, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14,
        opacity: sparkIn,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 38, color: CLAUDE.INK }}>{sparkLine}</span>
      </div>

      {/* Question — large centered serif */}
      <div style={{
        position: 'absolute',
        top: 200,
        left: 100,
        right: 100,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 58,
        fontWeight: 600,
        color: CLAUDE.INK,
        lineHeight: 1.25,
        opacity: qOp,
      }}>
        {question}
      </div>

      {/* Terracotta draw-on underline */}
      <svg
        width={width} height={height}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <line
          x1={(width - lineW) / 2}
          y1={height * 0.64}
          x2={(width - lineW) / 2 + lineW * lineP}
          y2={height * 0.64}
          stroke={CLAUDE.SPARK}
          strokeWidth={5}
          strokeLinecap="round"
        />
      </svg>

      {/* Commit text */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 22,
        color: CLAUDE.INK_SOFT,
        opacity: commitOp,
        letterSpacing: '0.02em',
      }}>
        {commit}
      </div>
    </AbsoluteFill>
  );
};
