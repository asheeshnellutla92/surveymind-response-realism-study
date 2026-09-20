import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InYourHandsBotVsBot — B03 "Claude, In Your Hands"
 * Two indies, split: rents promises vs owns the machine.
 */

export const inYourHandsBotVsBotSchema = z.object({
  sparkLine: z.string().default('Bot versus bot, said plainly.'),
});
export type InYourHandsBotVsBotProps = z.infer<typeof inYourHandsBotVsBotSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const InYourHandsBotVsBot: React.FC<InYourHandsBotVsBotProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const leftO = ease(remap(p, 0.08, 0.22, 0, 1));
  const rightO = ease(remap(p, 0.30, 0.44, 0, 1));
  const vsO = ease(remap(p, 0.20, 0.34, 0, 1));

  const COL_Y = 240, COL_W = 700, COL_H = 500;
  const LEFT_X = 100, RIGHT_X = 1120;

  const LEFT_ROWS = [
    'rents "AI for musicians" subscriptions',
    'month 1: $49, month 3: $89',
    'gets "AI-written" captions — sounds generic',
    'the algorithm is aimed at them',
    'no receipts, no source, no filter',
    'month 6: still guessing what moved',
  ];
  const RIGHT_ROWS = [
    'owns the voice file, the source filter,',
    'the catalog audit, the pitch brief',
    'captions sound like them — verified',
    'the algorithm\'s machines get the same tools',
    'every claim sourced, every draft reviewed',
    'month 6: pattern map, 3 supervisor leads',
  ];

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Left indie */}
        <g opacity={leftO}>
          <rect x={LEFT_X} y={COL_Y} width={COL_W} height={COL_H} rx={14}
            fill='#FDE8E8' stroke='#A44A32' strokeWidth={2} />
          <text x={LEFT_X + COL_W / 2} y={COL_Y - 20} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={800} fill='#A44A32' letterSpacing="0.1em">RENTS PROMISES</text>
          {LEFT_ROWS.map((row, i) => (
            <text key={i} x={LEFT_X + 28} y={COL_Y + 56 + i * 64}
              fontFamily={SANS} fontSize={14} fill='#6B1A0A'>✗  {row}</text>
          ))}
        </g>

        {/* VS */}
        <text x={960} y={COL_Y + COL_H / 2 + 10} textAnchor="middle"
          fontFamily={SERIF} fontSize={52} fontWeight={900} fill={CLAUDE.INK}
          opacity={vsO}>VS</text>

        {/* Right indie */}
        <g opacity={rightO}>
          <rect x={RIGHT_X} y={COL_Y} width={COL_W} height={COL_H} rx={14}
            fill='#D8F3DC' stroke='#2D6A4F' strokeWidth={2} />
          <text x={RIGHT_X + COL_W / 2} y={COL_Y - 20} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={800} fill='#2D6A4F' letterSpacing="0.1em">OWNS THE MACHINE</text>
          {RIGHT_ROWS.map((row, i) => (
            <text key={i} x={RIGHT_X + 28} y={COL_Y + 56 + i * 64}
              fontFamily={SANS} fontSize={14} fill='#1B4332'>✓  {row}</text>
          ))}
        </g>

        <text x={960} y={820} textAnchor="middle" fontFamily={SERIF} fontSize={22} fill={CLAUDE.SPARK}
          opacity={ease(remap(p, 0.62, 0.74, 0, 1))}>
          same tools available to both · the split is who built the filter
        </text>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          that is what bot vs bot means
        </text>
      </svg>
    </AbsoluteFill>
  );
};
