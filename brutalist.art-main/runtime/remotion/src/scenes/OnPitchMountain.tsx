import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnPitchMountain — B03 "Claude, On the Pitch"
 * The 'non-musical mountain': bio (3 lengths), press release, one-sheet cards stack.
 */

export const onPitchMountainSchema = z.object({
  sparkLine: z.string().default('The mountain, drafted flat.'),
});
export type OnPitchMountainProps = z.infer<typeof onPitchMountainSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const DOCS = [
  { label: 'Bio — 50 words', sub: 'for one-line submission slots', color: '#4A90D9' },
  { label: 'Bio — 150 words', sub: 'for playlist and press inquiries', color: '#7B68EE' },
  { label: 'Bio — full (500+ words)', sub: 'for feature articles and EPKs', color: CLAUDE.SPARK },
  { label: 'Press release', sub: 'for the single announcement', color: '#2D6A4F' },
  { label: 'One-sheet / EPK', sub: 'the complete promo doc', color: '#E67E22' },
];

export const OnPitchMountain: React.FC<OnPitchMountainProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));

  const CARD_X = 300, CARD_Y_START = 240, CARD_W = 1320, CARD_H = 86, CARD_GAP = 100;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {DOCS.map((doc, i) => {
          const t0 = 0.10 + i * 0.14;
          const op = ease(remap(p, t0, t0 + 0.12, 0, 1));
          const ty = CARD_Y_START + i * CARD_GAP;
          const entryTy = remap(op, 0, 1, ty + 24, ty);
          return (
            <g key={i} opacity={op}>
              <rect x={CARD_X} y={entryTy} width={CARD_W} height={CARD_H} rx={10}
                fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
              <rect x={CARD_X} y={entryTy} width={6} height={CARD_H} rx={3} fill={doc.color} />
              <text x={CARD_X + 26} y={entryTy + 36} fontFamily={SERIF} fontSize={18} fontWeight={700} fill={CLAUDE.INK}>{doc.label}</text>
              <text x={CARD_X + 26} y={entryTy + 62} fontFamily={SANS} fontSize={14} fill={CLAUDE.INK_SOFT}>{doc.sub}</text>
              <text x={CARD_X + CARD_W - 20} y={entryTy + 36} textAnchor="end"
                fontFamily={SANS} fontSize={11} fontWeight={800} fill={doc.color} letterSpacing="0.1em">DRAFTED</text>
            </g>
          );
        })}

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.84, 0.94, 0, 1))}>
          the non-musical mountain — the machine builds the stack while you focus on the music
        </text>
      </svg>
    </AbsoluteFill>
  );
};
