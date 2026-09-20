import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InYourHandsCosts — B04 "Claude, In Your Hands"
 * Honest-ledger card: documented costs, no invented numbers.
 */

export const inYourHandsCostsSchema = z.object({
  sparkLine: z.string().default('The costs, restated.'),
});
export type InYourHandsCostsProps = z.infer<typeof inYourHandsCostsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const COSTS = [
  { label: 'Can\'t hear audio', detail: 'mix analysis means reasoning about your description', kind: 'limit' },
  { label: 'Desktop must be awake', detail: 'Cowork misses its window if the machine is sleeping', kind: 'limit' },
  { label: 'Agentic runs cost more', detail: 'batch your jobs; they burn more usage than chat', kind: 'limit' },
  { label: 'Judgment is yours', detail: 'facts, money, your name — the machine never decides these', kind: 'rule' },
  { label: 'Browser reads: verify', detail: 'JS-rendered dashboards read imperfectly — check yourself', kind: 'limit' },
];

export const InYourHandsCosts: React.FC<InYourHandsCostsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));

  const CARD_X = 280, CARD_Y_START = 220, CARD_W = 1360, CARD_H = 86, CARD_GAP = 104;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {COSTS.map((cost, i) => {
          const t0 = 0.10 + i * 0.14;
          const op = ease(remap(p, t0, t0 + 0.12, 0, 1));
          const cy = CARD_Y_START + i * CARD_GAP;
          return (
            <g key={i} opacity={op}>
              <rect x={CARD_X} y={cy} width={CARD_W} height={CARD_H} rx={10}
                fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
              <rect x={CARD_X} y={cy} width={6} height={CARD_H} rx={3}
                fill={cost.kind === 'rule' ? CLAUDE.SPARK : CLAUDE.INK_SOFT} />
              <text x={CARD_X + 26} y={cy + 34} fontFamily={SERIF} fontSize={17} fontWeight={700} fill={CLAUDE.INK}>{cost.label}</text>
              <text x={CARD_X + 26} y={cy + 62} fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>{cost.detail}</text>
            </g>
          );
        })}

        <text x={960} y={760} textAnchor="middle" fontFamily={SERIF} fontSize={22} fill={CLAUDE.SPARK}
          opacity={ease(remap(p, 0.80, 0.92, 0, 1))}>
          honest about the limits — that's how you know the receipts are real
        </text>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.84, 0.94, 0, 1))}>
          no fake numbers · no invented efficiency claims · the tools are what they are
        </text>
      </svg>
    </AbsoluteFill>
  );
};
