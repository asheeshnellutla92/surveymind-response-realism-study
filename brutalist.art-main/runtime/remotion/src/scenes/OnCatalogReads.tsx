import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnCatalogReads — B04 "Claude, On Your Catalog"
 * Branching: 'can it rank my songs?' → routes to 'reads' (yes) and 'ranks by quality' (no).
 */

export const onCatalogReadsSchema = z.object({
  sparkLine: z.string().default('It reads. It does not rank.'),
});
export type OnCatalogReadsProps = z.infer<typeof onCatalogReadsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const OnCatalogReads: React.FC<OnCatalogReadsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const qO = ease(remap(p, 0.08, 0.20, 0, 1));
  const yesO = ease(remap(p, 0.28, 0.42, 0, 1));
  const noO = ease(remap(p, 0.44, 0.58, 0, 1));

  const Q_X = 640, Q_Y = 380, Q_W = 640, Q_H = 90;
  const YES_X = 200, YES_Y = 580, YES_W = 580, YES_H = 240;
  const NO_X = 1060, NO_Y = 580, NO_W = 580, NO_H = 240;

  const READS = [
    'structural patterns (verse/chorus ratios)',
    'imagery clusters and recurring metaphors',
    'harmonic vocabulary across the catalog',
    'length and format habits — cited by title',
  ];
  const WONT_RANK = [
    '"which song is your best work"',
    '"which song will perform best"',
    '"this one deserves more attention"',
    '— no ear, no lived context for art value',
  ];

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Question */}
        <g opacity={qO}>
          <rect x={Q_X} y={Q_Y} width={Q_W} height={Q_H} rx={10}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={2} />
          <text x={Q_X + Q_W / 2} y={Q_Y + 42} textAnchor="middle"
            fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK}>
            "can it tell me which song is best?"
          </text>
          <text x={Q_X + Q_W / 2} y={Q_Y + 68} textAnchor="middle"
            fontFamily={SANS} fontSize={14} fill={CLAUDE.INK_SOFT}>depends what you mean by best</text>
        </g>

        {/* YES branch — what it does */}
        <g opacity={yesO}>
          <path d={`M ${Q_X + 60} ${Q_Y + Q_H + 8} L ${YES_X + YES_W / 2} ${YES_Y - 8}`}
            fill="none" stroke='#2D6A4F' strokeWidth={2} />
          <rect x={YES_X} y={YES_Y} width={YES_W} height={YES_H} rx={12}
            fill='#D8F3DC' stroke='#2D6A4F' strokeWidth={2} />
          <text x={YES_X + YES_W / 2} y={YES_Y - 18} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fontWeight={800} fill='#2D6A4F' letterSpacing="0.1em">IT READS</text>
          {READS.map((r, i) => (
            <text key={i} x={YES_X + 22} y={YES_Y + 44 + i * 42}
              fontFamily={SANS} fontSize={13} fill='#1B4332'>✓ {r}</text>
          ))}
        </g>

        {/* NO branch — what it won't do */}
        <g opacity={noO}>
          <path d={`M ${Q_X + Q_W - 60} ${Q_Y + Q_H + 8} L ${NO_X + NO_W / 2} ${NO_Y - 8}`}
            fill="none" stroke='#A44A32' strokeWidth={2} />
          <rect x={NO_X} y={NO_Y} width={NO_W} height={NO_H} rx={12}
            fill='#FDE8E8' stroke='#A44A32' strokeWidth={2} />
          <text x={NO_X + NO_W / 2} y={NO_Y - 18} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fontWeight={800} fill='#A44A32' letterSpacing="0.1em">WON'T RANK QUALITY</text>
          {WONT_RANK.map((r, i) => (
            <text key={i} x={NO_X + 22} y={NO_Y + 44 + i * 42}
              fontFamily={SANS} fontSize={13} fill='#6B1A0A'>✗ {r}</text>
          ))}
        </g>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          pattern miner, not talent scout — the map is yours to interpret
        </text>
      </svg>
    </AbsoluteFill>
  );
};
