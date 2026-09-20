import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InYourHandsSubscription — B05 "Claude, In Your Hands"
 * Two cards: "their promise" (recurring charge) vs "your deck" (owned, no rent).
 */

export const inYourHandsSubscriptionSchema = z.object({
  sparkLine: z.string().default('The subscription you keep.'),
});
export type InYourHandsSubscriptionProps = z.infer<typeof inYourHandsSubscriptionSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const InYourHandsSubscription: React.FC<InYourHandsSubscriptionProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const leftO = ease(remap(p, 0.08, 0.24, 0, 1));
  const rightO = ease(remap(p, 0.32, 0.48, 0, 1));
  const verdictO = ease(remap(p, 0.60, 0.72, 0, 1));

  const COL_Y = 240, COL_W = 720, COL_H = 480;
  const LEFT_X = 120, RIGHT_X = 1080;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Their promise */}
        <g opacity={leftO}>
          <rect x={LEFT_X} y={COL_Y} width={COL_W} height={COL_H} rx={14}
            fill='#FDE8E8' stroke='#A44A32' strokeWidth={2} />
          <text x={LEFT_X + COL_W / 2} y={COL_Y - 20} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={800} fill='#A44A32' letterSpacing="0.1em">THEIR PROMISE</text>
          <text x={LEFT_X + 36} y={COL_Y + 56} fontFamily={SERIF} fontSize={22} fontWeight={700} fill='#6B1A0A'>
            $X / month
          </text>
          <text x={LEFT_X + 36} y={COL_Y + 84} fontFamily={SERIF} fontSize={16} fill='#6B1A0A'>
            recurring, no receipts
          </text>
          <line x1={LEFT_X + 24} y1={COL_Y + 104} x2={LEFT_X + COL_W - 24} y2={COL_Y + 104} stroke='#A44A32' strokeWidth={1} />
          {[
            '✗ you don\'t own the system',
            '✗ cancel: lose everything',
            '✗ no source on what worked',
            '✗ the promise is the product',
            '✗ you can\'t verify the numbers',
          ].map((line, i) => (
            <text key={i} x={LEFT_X + 36} y={COL_Y + 148 + i * 54}
              fontFamily={SANS} fontSize={15} fill='#6B1A0A'>{line}</text>
          ))}
        </g>

        {/* Your deck */}
        <g opacity={rightO}>
          <rect x={RIGHT_X} y={COL_Y} width={COL_W} height={COL_H} rx={14}
            fill='#D8F3DC' stroke='#2D6A4F' strokeWidth={2} />
          <text x={RIGHT_X + COL_W / 2} y={COL_Y - 20} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={800} fill='#2D6A4F' letterSpacing="0.1em">YOUR DECK</text>
          <text x={RIGHT_X + 36} y={COL_Y + 56} fontFamily={SERIF} fontSize={22} fontWeight={700} fill='#1B4332'>
            six skill files
          </text>
          <text x={RIGHT_X + 36} y={COL_Y + 84} fontFamily={SERIF} fontSize={16} fill='#1B4332'>
            yours permanently
          </text>
          <line x1={RIGHT_X + 24} y1={COL_Y + 104} x2={RIGHT_X + COL_W - 24} y2={COL_Y + 104} stroke='#2D6A4F' strokeWidth={1} />
          {[
            '✓ you own every file',
            '✓ cancel: your files stay yours',
            '✓ every claim sourced in receipts',
            '✓ the system is the product',
            '✓ you can audit what worked',
          ].map((line, i) => (
            <text key={i} x={RIGHT_X + 36} y={COL_Y + 148 + i * 54}
              fontFamily={SANS} fontSize={15} fill='#1B4332'>{line}</text>
          ))}
        </g>

        {/* Verdict */}
        <text x={960} y={820} textAnchor="middle" fontFamily={SERIF} fontSize={22} fill={CLAUDE.SPARK}
          opacity={verdictO}>
          the season was free · the deck is yours · that was always the point
        </text>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          Musinique · bot vs bot, season one · complete
        </text>
      </svg>
    </AbsoluteFill>
  );
};
