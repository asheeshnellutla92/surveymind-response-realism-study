import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnCatalogData — B05 "Claude, On Your Catalog"
 * Catalog folder with lock; unreleased masters and financial data stay out.
 */

export const onCatalogDataSchema = z.object({
  sparkLine: z.string().default('Your data, your rules.'),
});
export type OnCatalogDataProps = z.infer<typeof onCatalogDataSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const IN_FOLDER = [
  { label: 'Lyrics (text)', ok: true },
  { label: 'Chord charts', ok: true },
  { label: 'Production notes', ok: true },
  { label: 'Release history', ok: true },
];

const OUT_FOLDER = [
  { label: 'Unreleased masters (.wav)', ok: false, reason: 'model cannot hear' },
  { label: 'Financial statements', ok: false, reason: 'not needed for pattern work' },
  { label: 'Contracts & splits', ok: false, reason: 'legal exposure, no benefit' },
  { label: 'Personal correspondence', ok: false, reason: 'privacy' },
];

export const OnCatalogData: React.FC<OnCatalogDataProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const folderO = ease(remap(p, 0.08, 0.20, 0, 1));
  const inO = ease(remap(p, 0.22, 0.40, 0, 1));
  const outO = ease(remap(p, 0.44, 0.62, 0, 1));

  const F_CX = 960, F_CY = 360;
  const LEFT_X = 180, RIGHT_X = 1160, COL_W = 520, COL_Y = 280, ITEM_H = 72, ITEM_GAP = 84;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Folder + lock icon in center */}
        <g opacity={folderO}>
          {/* Folder */}
          <rect x={F_CX - 52} y={F_CY - 8} width={104} height={80} rx={8} fill={CLAUDE.SPARK} opacity={0.15} stroke={CLAUDE.SPARK} strokeWidth={2} />
          <rect x={F_CX - 52} y={F_CY - 24} width={60} height={20} rx={6} fill={CLAUDE.SPARK} opacity={0.3} />
          {/* Lock */}
          <rect x={F_CX - 16} y={F_CY + 26} width={32} height={26} rx={4} fill={CLAUDE.INK} />
          <path d={`M ${F_CX - 10} ${F_CY + 26} a 10 10 0 0 1 20 0`} fill="none" stroke={CLAUDE.INK} strokeWidth={3.5} />
          <text x={F_CX} y={F_CY + 106} textAnchor="middle" fontFamily={SANS} fontSize={13} fontWeight={800} fill={CLAUDE.INK_SOFT} letterSpacing="0.1em">YOUR CATALOG PROJECT</text>
        </g>

        {/* In folder */}
        <g opacity={inO}>
          <text x={LEFT_X + COL_W / 2} y={COL_Y - 22} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fontWeight={800} fill='#2D6A4F' letterSpacing="0.1em">IN THE PROJECT FOLDER</text>
          {IN_FOLDER.map((item, i) => {
            const rowO = ease(remap(p, 0.22 + i * 0.06, 0.30 + i * 0.06, 0, 1));
            return (
              <g key={i} opacity={rowO}>
                <rect x={LEFT_X} y={COL_Y + i * ITEM_GAP} width={COL_W} height={ITEM_H} rx={8}
                  fill='#D8F3DC' stroke='#2D6A4F' strokeWidth={1.5} />
                <text x={LEFT_X + 22} y={COL_Y + i * ITEM_GAP + 42} fontFamily={SERIF} fontSize={16} fill='#1B4332'>✓  {item.label}</text>
              </g>
            );
          })}
        </g>

        {/* Out of folder */}
        <g opacity={outO}>
          <text x={RIGHT_X + COL_W / 2} y={COL_Y - 22} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fontWeight={800} fill='#A44A32' letterSpacing="0.1em">STAYS OUT</text>
          {OUT_FOLDER.map((item, i) => {
            const rowO = ease(remap(p, 0.44 + i * 0.06, 0.52 + i * 0.06, 0, 1));
            return (
              <g key={i} opacity={rowO}>
                <rect x={RIGHT_X} y={COL_Y + i * ITEM_GAP} width={COL_W} height={ITEM_H} rx={8}
                  fill='#FDE8E8' stroke='#A44A32' strokeWidth={1.5} />
                <text x={RIGHT_X + 22} y={COL_Y + i * ITEM_GAP + 34} fontFamily={SERIF} fontSize={15} fill='#6B1A0A'>✗  {item.label}</text>
                <text x={RIGHT_X + 22} y={COL_Y + i * ITEM_GAP + 56} fontFamily={SANS} fontSize={12} fill='#A44A32'>{item.reason}</text>
              </g>
            );
          })}
        </g>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          give it only what it needs — keep what doesn't belong in a project folder
        </text>
      </svg>
    </AbsoluteFill>
  );
};
