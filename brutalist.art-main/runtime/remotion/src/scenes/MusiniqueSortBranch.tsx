import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * MusiniqueSortBranch — B02 of "Claude, In Your Corner"
 * 3-way routing tree: question → chat / Cowork / Code.
 * Duration-agnostic, progress-based animation.
 */

export const musiniqueSortBranchSchema = z.object({
  sparkLine: z.string().default('Judgment stays in the room.'),
});
export type MusiniqueSortBranchProps = z.infer<typeof musiniqueSortBranchSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const W = 1280, H = 720;
const CX = W / 2;
const QY = 160;
const FORK_Y = 290;
const CARD_Y = 420;

const ROUTES = [
  { x: CX - 420, label: 'CHAT', detail: 'needs my judgment every step', tone: CLAUDE.INK },
  { x: CX,       label: 'COWORK', detail: 'same recipe, every week', tone: CLAUDE.SPARK },
  { x: CX + 420, label: 'CODE', detail: 'a system I\'ll run forever', tone: CLAUDE.INK_SOFT },
];

const Spark: React.FC = () => null;

export const MusiniqueSortBranch: React.FC<MusiniqueSortBranchProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = remap(p, 0, 0.06, 0, 1);
  const qOp = ease(remap(p, 0.04, 0.18, 0, 1));
  const lineP = ease(remap(p, 0.20, 0.50, 0, 1));
  const cardOp = ease(remap(p, 0.48, 0.64, 0, 1));
  const hintOp = remap(p, 0.70, 0.82, 0, 1);

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      {/* SparkLine */}
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {/* Question box */}
        <g opacity={qOp}>
          <rect x={CX - 280} y={QY - 38} width={560} height={66} rx={8}
            fill={CLAUDE.CARD} stroke={CLAUDE.INK} strokeWidth={2.5} />
          <text x={CX} y={QY + 4} textAnchor="middle" dy="0.35em"
            fontFamily={SANS} fontSize={20} fontWeight={800} fill={CLAUDE.INK}>
            where does this task belong?
          </text>
        </g>

        {/* Branch lines */}
        {ROUTES.map((r, i) => {
          const totalLen = Math.hypot(r.x - CX, CARD_Y - FORK_Y) + (FORK_Y - QY - 38 + 66) / 2;
          const d = `M ${CX} ${QY + 28} L ${CX} ${FORK_Y} L ${r.x} ${CARD_Y - 36}`;
          return (
            <path key={i} d={d} fill="none"
              stroke={r.tone} strokeWidth={i === 1 ? 3.5 : 2.5}
              strokeDasharray={totalLen * 2}
              strokeDashoffset={totalLen * 2 * (1 - lineP)}
              strokeLinecap="round" strokeLinejoin="round" />
          );
        })}

        {/* Outcome cards */}
        {ROUTES.map((r, i) => (
          <g key={i} opacity={cardOp}>
            <rect x={r.x - 160} y={CARD_Y - 36} width={320} height={100} rx={10}
              fill={CLAUDE.CARD} stroke={r.tone} strokeWidth={i === 1 ? 3 : 1.5} />
            <text x={r.x} y={CARD_Y - 4} textAnchor="middle"
              fontFamily={SANS} fontSize={i === 1 ? 22 : 20} fontWeight={800} fill={r.tone}>
              {r.label}
            </text>
            <text x={r.x} y={CARD_Y + 22} textAnchor="middle"
              fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>
              {r.detail}
            </text>
          </g>
        ))}

        {/* Hint line */}
        <text x={CX} y={H - 60} textAnchor="middle"
          fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT} opacity={hintOp}>
          one question, three clear lanes — the sorting is the skill
        </text>
      </svg>
    </AbsoluteFill>
  );
};
