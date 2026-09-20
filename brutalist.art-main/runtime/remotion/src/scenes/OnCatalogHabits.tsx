import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnCatalogHabits — B02 "Claude, On Your Catalog"
 * Pattern cards pinned to specific song titles — habits, cited.
 */

export const onCatalogHabitsSchema = z.object({
  sparkLine: z.string().default('Habits, cited.'),
});
export type OnCatalogHabitsProps = z.infer<typeof onCatalogHabitsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const PATTERNS = [
  { habit: 'rain imagery', songs: '"Glass Half Full", "November", "Overcast"', count: '7 songs' },
  { habit: 'bVII → IV move', songs: '"Hold", "Last Light", "Coming Home"', count: '9 songs' },
  { habit: 'long bridge (≥ 16 bars)', songs: '"Patience", "Wide Open", "Tide"', count: '5 songs' },
  { habit: 'unresolved question closer', songs: '"Where Are You?", "Still Here?"', count: '4 songs' },
];

export const OnCatalogHabits: React.FC<OnCatalogHabitsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));

  const CARD_X = 240, CARD_Y_START = 230, CARD_W = 1440, CARD_H = 110, CARD_GAP = 126;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {PATTERNS.map((pat, i) => {
          const t0 = 0.12 + i * 0.16;
          const op = ease(remap(p, t0, t0 + 0.14, 0, 1));
          const cy = CARD_Y_START + i * CARD_GAP;
          return (
            <g key={i} opacity={op}>
              <rect x={CARD_X} y={cy} width={CARD_W} height={CARD_H} rx={10}
                fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
              {/* Left accent */}
              <rect x={CARD_X} y={cy} width={6} height={CARD_H} rx={3} fill={CLAUDE.SPARK} />
              {/* Pattern badge */}
              <rect x={CARD_X + 24} y={cy + 24} width={120} height={28} rx={5} fill='#F2EDE4' stroke={CLAUDE.SPARK} strokeWidth={1} />
              <text x={CARD_X + 84} y={cy + 43} textAnchor="middle" fontFamily={SANS} fontSize={11} fontWeight={800} fill={CLAUDE.SPARK}>{pat.count}</text>
              {/* Pattern name */}
              <text x={CARD_X + 164} y={cy + 40} fontFamily={SERIF} fontSize={18} fontWeight={700} fill={CLAUDE.INK}>{pat.habit}</text>
              {/* Song citations */}
              <text x={CARD_X + 164} y={cy + 68} fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>{pat.songs}</text>
              {/* "cited" label */}
              <text x={CARD_X + CARD_W - 20} y={cy + 44} textAnchor="end" fontFamily={SANS} fontSize={11} fontWeight={800} fill='#2D6A4F' letterSpacing="0.1em">CITED</text>
            </g>
          );
        })}
        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          not 'you seem to like rain' — 'seven songs, here are their names'
        </text>
      </svg>
    </AbsoluteFill>
  );
};
