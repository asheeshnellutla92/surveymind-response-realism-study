import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnCatalogGrid — B01 "Claude, On Your Catalog"
 * Catalog grid: 30 song cards feed into a pattern-mining analysis.
 */

export const onCatalogGridSchema = z.object({
  sparkLine: z.string().default('Thirty songs, one table.'),
});
export type OnCatalogGridProps = z.infer<typeof onCatalogGridSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const OnCatalogGrid: React.FC<OnCatalogGridProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const arrowO = ease(remap(p, 0.55, 0.68, 0, 1));
  const outO = ease(remap(p, 0.65, 0.78, 0, 1));

  const COLS = 6, ROWS = 5;
  const CARD_W = 110, CARD_H = 56, GAP_X = 120, GAP_Y = 68;
  const GRID_X = 100, GRID_Y = 220;
  const OUT_X = 890, OUT_Y = 320, OUT_W = 880, OUT_H = 240;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Grid of 30 song cards */}
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const col = i % COLS, row = Math.floor(i / COLS);
          const t0 = 0.08 + i * 0.018;
          const op = ease(remap(p, t0, t0 + 0.06, 0, 1));
          const cx = GRID_X + col * GAP_X;
          const cy = GRID_Y + row * GAP_Y;
          return (
            <g key={i} opacity={op}>
              <rect x={cx} y={cy} width={CARD_W} height={CARD_H} rx={6}
                fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.2} />
              <text x={cx + 8} y={cy + 20} fontFamily={SANS} fontSize={9} fontWeight={700} fill={CLAUDE.SPARK}>SONG {i + 1}</text>
              <text x={cx + 8} y={cy + 36} fontFamily={SERIF} fontSize={10} fill={CLAUDE.INK_SOFT}>lyrics · chords</text>
              <text x={cx + 8} y={cy + 50} fontFamily={SANS} fontSize={9} fill={CLAUDE.INK_SOFT}>notes</text>
            </g>
          );
        })}

        {/* Arrow */}
        <g opacity={arrowO}>
          <line x1={GRID_X + COLS * GAP_X - (GAP_X - CARD_W)} y1={GRID_Y + (ROWS * GAP_Y) / 2}
            x2={OUT_X - 14} y2={OUT_Y + OUT_H / 2}
            stroke={CLAUDE.INK_SOFT} strokeWidth={2.5} />
          <polygon points={`${OUT_X - 14},${OUT_Y + OUT_H / 2 - 7} ${OUT_X + 2},${OUT_Y + OUT_H / 2} ${OUT_X - 14},${OUT_Y + OUT_H / 2 + 7}`} fill={CLAUDE.INK_SOFT} />
        </g>

        {/* Analysis output */}
        <g opacity={outO}>
          <rect x={OUT_X} y={OUT_Y} width={OUT_W} height={OUT_H} rx={14}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={2} />
          <rect x={OUT_X} y={OUT_Y} width={OUT_W} height={46} rx={14} fill={CLAUDE.PAGE} />
          <rect x={OUT_X} y={OUT_Y + 32} width={OUT_W} height={14} fill={CLAUDE.PAGE} />
          <text x={OUT_X + 22} y={OUT_Y + 30} fontFamily={SERIF} fontSize={15} fontWeight={600} fill={CLAUDE.INK}>Pattern Analysis</text>
          {[
            '→  recurring imagery: rain, glass, open windows',
            '→  harmonic moves: bVII → IV appears in 9 of 30 songs',
            '→  structural habit: bridges run long — avg 16 bars',
            '→  threads for mining: the glass motif, the unresolved question',
          ].map((line, i) => (
            <text key={i} x={OUT_X + 22} y={OUT_Y + 68 + i * 38} fontFamily={SANS} fontSize={14} fill={CLAUDE.INK}>{line}</text>
          ))}
        </g>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          it reads your whole catalog at once — you never could
        </text>
      </svg>
    </AbsoluteFill>
  );
};
