import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * MusiniqueArsenal — B05 of "Claude, In Your Corner"
 * Six episode crates stagger in and lock into the promo-deck road case.
 * Terracotta accent on the final lock-in. Duration-agnostic.
 */

export const musiniqueArsenalSchema = z.object({
  sparkLine: z.string().default('This season is an arsenal.'),
});
export type MusiniqueArsenalProps = z.infer<typeof musiniqueArsenalSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const CRATES = [
  { ep: 'EP 2', label: 'Monday digest', desc: 'Cowork recipe' },
  { ep: 'EP 3', label: 'source gate', desc: 'scam detector' },
  { ep: 'EP 4', label: 'voice file', desc: 'brand-voice skill' },
  { ep: 'EP 5', label: 'catalog audit', desc: 'pattern miner' },
  { ep: 'EP 6', label: 'pitch machine', desc: 'supervisor finder' },
  { ep: 'EP 7', label: 'review gate', desc: 'deck checker' },
];

const CRATE_W = 160, CRATE_H = 100;
const CASE_X = 140, CASE_Y = 250, CASE_W = 1000, CASE_H = 160;

const Spark: React.FC = () => null;

export const MusiniqueArsenal: React.FC<MusiniqueArsenalProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = remap(p, 0, 0.06, 0, 1);
  const caseOp = ease(remap(p, 0.06, 0.20, 0, 1));
  const caseLabelOp = remap(p, 0.70, 0.82, 0, 1);

  const slotW = CASE_W / 6;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      {/* SparkLine */}
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>

      <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
        {/* Road case outline */}
        <g opacity={caseOp}>
          <rect x={CASE_X} y={CASE_Y} width={CASE_W} height={CASE_H} rx={12}
            fill={CLAUDE.CARD} stroke={CLAUDE.INK} strokeWidth={2.5} />
          {/* Corner latches */}
          {[CASE_X + 20, CASE_X + CASE_W - 40].map((lx, i) => (
            <rect key={i} x={lx} y={CASE_Y - 8} width={20} height={16} rx={3}
              fill={CLAUDE.SPARK} />
          ))}
          <text x={CASE_X + CASE_W / 2} y={CASE_Y + CASE_H + 38} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={700} fill={CLAUDE.INK_SOFT} letterSpacing="0.1em">
            YOUR PROMO DECK
          </text>
        </g>

        {/* Slot dividers */}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i}
            x1={CASE_X + (i + 1) * slotW} y1={CASE_Y + 10}
            x2={CASE_X + (i + 1) * slotW} y2={CASE_Y + CASE_H - 10}
            stroke={CLAUDE.BORDER} strokeWidth={1} opacity={caseOp} />
        ))}

        {/* Crates flying in */}
        {CRATES.map((c, i) => {
          const t0 = 0.16 + i * 0.11;
          const cp = ease(remap(p, t0, t0 + 0.14, 0, 1));
          const landed = cp >= 1;
          const destX = CASE_X + i * slotW + slotW / 2 - CRATE_W / 2;
          const destY = CASE_Y + (CASE_H - CRATE_H) / 2;
          const startY = destY - 220;
          const cx = destX;
          const cy = remap(cp, 0, 1, startY, destY);
          const bounceY = landed ? destY : cy + Math.sin(cp * Math.PI) * -18;

          return (
            <g key={i} opacity={cp}>
              <rect x={cx} y={bounceY} width={CRATE_W} height={CRATE_H} rx={8}
                fill={CLAUDE.CARD}
                stroke={landed ? CLAUDE.SPARK : CLAUDE.BORDER}
                strokeWidth={landed ? 2.5 : 1.5} />
              <text x={cx + CRATE_W / 2} y={bounceY + 26} textAnchor="middle"
                fontFamily={SANS} fontSize={11} fontWeight={800} fill={CLAUDE.SPARK} letterSpacing="0.1em">
                {c.ep}
              </text>
              <text x={cx + CRATE_W / 2} y={bounceY + 48} textAnchor="middle"
                fontFamily={SERIF} fontSize={14} fill={CLAUDE.INK}>
                {c.label}
              </text>
              <text x={cx + CRATE_W / 2} y={bounceY + 68} textAnchor="middle"
                fontFamily={SANS} fontSize={11} fill={CLAUDE.INK_SOFT}>
                {c.desc}
              </text>
            </g>
          );
        })}

        {/* Final label */}
        <text x={640} y={620} textAnchor="middle"
          fontFamily={SERIF} fontSize={22} fill={CLAUDE.INK_SOFT} opacity={caseLabelOp}>
          follow the season · own the deck · rent nothing
        </text>
      </svg>
    </AbsoluteFill>
  );
};
