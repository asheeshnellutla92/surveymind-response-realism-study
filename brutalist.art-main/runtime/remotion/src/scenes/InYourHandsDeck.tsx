import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InYourHandsDeck — B01 "Claude, In Your Hands"
 * The full promo deck assembled: six pieces slot into the road case.
 */

export const inYourHandsDeckSchema = z.object({
  sparkLine: z.string().default('The deck, assembled.'),
});
export type InYourHandsDeckProps = z.infer<typeof inYourHandsDeckSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const PIECES = [
  { ep: 'E1', label: 'Lane sorter', desc: 'which tool does what' },
  { ep: 'E2', label: 'Monday digest', desc: 'Cowork recipe' },
  { ep: 'E3', label: 'Source filter', desc: 'scam detector' },
  { ep: 'E4', label: 'Voice file', desc: 'brand-voice skill' },
  { ep: 'E5', label: 'Catalog audit', desc: 'pattern miner' },
  { ep: 'E6', label: 'Pitch machine', desc: 'supervisor finder' },
];

export const InYourHandsDeck: React.FC<InYourHandsDeckProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const caseO = ease(remap(p, 0.08, 0.22, 0, 1));
  const labelO = ease(remap(p, 0.72, 0.84, 0, 1));

  const CRATE_W = 210, CRATE_H = 110;
  const CASE_X = 100, CASE_Y = 380, CASE_W = 1720, CASE_H = 200;
  const slotW = CASE_W / 6;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Road case */}
        <g opacity={caseO}>
          <rect x={CASE_X} y={CASE_Y} width={CASE_W} height={CASE_H} rx={12}
            fill={CLAUDE.CARD} stroke={CLAUDE.INK} strokeWidth={2.5} />
          {[CASE_X + 20, CASE_X + CASE_W - 40].map((lx, i) => (
            <rect key={i} x={lx} y={CASE_Y - 8} width={20} height={16} rx={3} fill={CLAUDE.SPARK} />
          ))}
          <text x={CASE_X + CASE_W / 2} y={CASE_Y + CASE_H + 38} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={700} fill={CLAUDE.INK_SOFT} letterSpacing="0.1em">
            YOUR PROMO DECK
          </text>
        </g>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i}
            x1={CASE_X + (i + 1) * slotW} y1={CASE_Y + 10}
            x2={CASE_X + (i + 1) * slotW} y2={CASE_Y + CASE_H - 10}
            stroke={CLAUDE.BORDER} strokeWidth={1} opacity={caseO} />
        ))}

        {/* Pieces landing in */}
        {PIECES.map((piece, i) => {
          const t0 = 0.18 + i * 0.10;
          const cp = ease(remap(p, t0, t0 + 0.14, 0, 1));
          const destX = CASE_X + i * slotW + slotW / 2 - CRATE_W / 2;
          const destY = CASE_Y + (CASE_H - CRATE_H) / 2;
          const startY = destY - 200;
          const cy = remap(cp, 0, 1, startY, destY);
          const bounceY = cp >= 1 ? destY : cy + Math.sin(cp * Math.PI) * -16;
          const landed = cp >= 0.98;

          return (
            <g key={i} opacity={cp}>
              <rect x={destX} y={bounceY} width={CRATE_W} height={CRATE_H} rx={8}
                fill={CLAUDE.CARD}
                stroke={landed ? CLAUDE.SPARK : CLAUDE.BORDER}
                strokeWidth={landed ? 2.5 : 1.5} />
              <text x={destX + CRATE_W / 2} y={bounceY + 26} textAnchor="middle"
                fontFamily={SANS} fontSize={11} fontWeight={800} fill={CLAUDE.SPARK} letterSpacing="0.1em">
                {piece.ep}
              </text>
              <text x={destX + CRATE_W / 2} y={bounceY + 50} textAnchor="middle"
                fontFamily={SERIF} fontSize={14} fill={CLAUDE.INK}>{piece.label}</text>
              <text x={destX + CRATE_W / 2} y={bounceY + 70} textAnchor="middle"
                fontFamily={SANS} fontSize={11} fill={CLAUDE.INK_SOFT}>{piece.desc}</text>
            </g>
          );
        })}

        <text x={CASE_X + CASE_W / 2} y={820} textAnchor="middle"
          fontFamily={SERIF} fontSize={22} fill={CLAUDE.INK_SOFT} opacity={labelO}>
          follow the season · own the deck · rent nothing
        </text>
      </svg>
    </AbsoluteFill>
  );
};
