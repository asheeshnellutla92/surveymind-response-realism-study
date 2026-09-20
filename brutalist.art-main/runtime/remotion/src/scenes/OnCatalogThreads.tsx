import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnCatalogThreads — B03 "Claude, On Your Catalog"
 * Loose threads pulled from the catalog grid, each becoming a new project card.
 */

export const onCatalogThreadsSchema = z.object({
  sparkLine: z.string().default('The threads worth mining.'),
});
export type OnCatalogThreadsProps = z.infer<typeof onCatalogThreadsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const THREADS = [
  { name: 'The glass motif', from: 'catalog', project: 'EP concept: "Glass Half Full" expanded — the imagery arc across 7 songs', color: '#4A90D9' },
  { name: 'Unresolved questions', from: 'catalog', project: 'Writing prompt: close 3 songs that never answered their own question', color: '#7B68EE' },
  { name: 'The bVII → IV pull', from: 'catalog', project: 'Production brief: lean into the unresolved cadence — it\'s a signature', color: CLAUDE.SPARK },
];

export const OnCatalogThreads: React.FC<OnCatalogThreadsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const sourceO = ease(remap(p, 0.06, 0.18, 0, 1));

  const SOURCE_X = 760, SOURCE_Y = 370, SOURCE_W = 400, SOURCE_H = 100;
  const PROJ_X_START = 180;
  const PROJ_YFIRST = 250;
  const PROJ_W = 480, PROJ_H = 130, PROJ_GAP = 160;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Catalog source */}
        <g opacity={sourceO}>
          <rect x={SOURCE_X} y={SOURCE_Y} width={SOURCE_W} height={SOURCE_H} rx={10}
            fill='#FFF8EC' stroke='#D4C8A8' strokeWidth={2} />
          <text x={SOURCE_X + SOURCE_W / 2} y={SOURCE_Y + 36} textAnchor="middle"
            fontFamily={SANS} fontSize={11} fontWeight={800} fill='#7A7060' letterSpacing="0.1em">YOUR CATALOG</text>
          <text x={SOURCE_X + SOURCE_W / 2} y={SOURCE_Y + 62} textAnchor="middle"
            fontFamily={SERIF} fontSize={16} fill='#2C2A1E'>30 songs, fully read</text>
          <text x={SOURCE_X + SOURCE_W / 2} y={SOURCE_Y + 84} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fill='#7A7060'>patterns surface. threads emerge.</text>
        </g>

        {/* Thread pulls */}
        {THREADS.map((thread, i) => {
          const t0 = 0.22 + i * 0.18;
          const op = ease(remap(p, t0, t0 + 0.15, 0, 1));
          const py = PROJ_YFIRST + i * PROJ_GAP;
          const midCY = SOURCE_Y + SOURCE_H / 2;

          return (
            <g key={i} opacity={op}>
              {/* Curved pull line */}
              <path d={`M ${SOURCE_X} ${midCY} C ${SOURCE_X - 100} ${midCY}, ${PROJ_X_START + PROJ_W + 60} ${py + PROJ_H / 2}, ${PROJ_X_START + PROJ_W + 10} ${py + PROJ_H / 2}`}
                fill="none" stroke={thread.color} strokeWidth={2} strokeDasharray="5 3" opacity={0.6} />
              <polygon points={`${PROJ_X_START + PROJ_W + 10},${py + PROJ_H / 2 - 6} ${PROJ_X_START + PROJ_W + 24},${py + PROJ_H / 2} ${PROJ_X_START + PROJ_W + 10},${py + PROJ_H / 2 + 6}`} fill={thread.color} opacity={0.8} />

              {/* Project card */}
              <rect x={PROJ_X_START} y={py} width={PROJ_W} height={PROJ_H} rx={10}
                fill={CLAUDE.CARD} stroke={thread.color} strokeWidth={2} />
              <rect x={PROJ_X_START} y={py} width={6} height={PROJ_H} rx={3} fill={thread.color} />
              <text x={PROJ_X_START + 24} y={py + 32} fontFamily={SERIF} fontSize={16} fontWeight={700} fill={CLAUDE.INK}>{thread.name}</text>
              <text x={PROJ_X_START + 24} y={py + 56} fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>{thread.project.slice(0, 52)}</text>
              {thread.project.length > 52 && <text x={PROJ_X_START + 24} y={py + 76} fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>{thread.project.slice(52)}</text>}
            </g>
          );
        })}

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          not a ranking — a map of what's already there
        </text>
      </svg>
    </AbsoluteFill>
  );
};
