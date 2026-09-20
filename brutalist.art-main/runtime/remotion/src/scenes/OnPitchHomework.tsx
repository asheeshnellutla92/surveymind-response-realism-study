import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnPitchHomework — B01 "Claude, On the Pitch"
 * Overnight placement research: cards assembling into a morning briefing.
 */

export const onPitchHomeworkSchema = z.object({
  sparkLine: z.string().default('The homework, machine-shaped.'),
});
export type OnPitchHomeworkProps = z.infer<typeof onPitchHomeworkSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const RESEARCH = [
  { label: 'Supervisor placements', sub: 'songs like yours, last 18 mo' },
  { label: 'Show / film needs', sub: 'open briefs, tone matches' },
  { label: 'Comparable artists', sub: 'who placed, how often' },
];

export const OnPitchHomework: React.FC<OnPitchHomeworkProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const moonO = ease(remap(p, 0.06, 0.16, 0, 1));
  const briefO = ease(remap(p, 0.60, 0.72, 0, 1));

  const CARD_X = 200, CARD_Y_START = 300, CARD_W = 340, CARD_H = 100, CARD_GAP = 120;
  const BRIEF_X = 820, BRIEF_Y = 270, BRIEF_W = 800, BRIEF_H = 360;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Moon */}
        <g opacity={moonO}>
          <text x={500} y={220} textAnchor="middle" fontFamily={SANS} fontSize={11} fontWeight={800}
            fill={CLAUDE.INK_SOFT} letterSpacing="0.14em">RUNNING OVERNIGHT</text>
        </g>

        {/* Research cards */}
        {RESEARCH.map((card, i) => {
          const t0 = 0.18 + i * 0.14;
          const op = ease(remap(p, t0, t0 + 0.14, 0, 1));
          const cy = CARD_Y_START + i * CARD_GAP;
          return (
            <g key={i} opacity={op}>
              <rect x={CARD_X} y={cy} width={CARD_W} height={CARD_H} rx={10}
                fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
              <text x={CARD_X + 20} y={cy + 34} fontFamily={SERIF} fontSize={16} fontWeight={600} fill={CLAUDE.INK}>{card.label}</text>
              <text x={CARD_X + 20} y={cy + 58} fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>{card.sub}</text>
            </g>
          );
        })}

        {/* Arrow */}
        <g opacity={ease(remap(p, 0.54, 0.64, 0, 1))}>
          <line x1={CARD_X + CARD_W + 12} y1={CARD_Y_START + CARD_GAP} x2={BRIEF_X - 12} y2={BRIEF_Y + BRIEF_H / 2}
            stroke={CLAUDE.INK_SOFT} strokeWidth={2} />
          <polygon points={`${BRIEF_X - 12},${BRIEF_Y + BRIEF_H / 2 - 7} ${BRIEF_X + 4},${BRIEF_Y + BRIEF_H / 2} ${BRIEF_X - 12},${BRIEF_Y + BRIEF_H / 2 + 7}`} fill={CLAUDE.INK_SOFT} />
        </g>

        {/* Morning briefing */}
        <g opacity={briefO}>
          <rect x={BRIEF_X} y={BRIEF_Y} width={BRIEF_W} height={BRIEF_H} rx={14}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={2} />
          <rect x={BRIEF_X} y={BRIEF_Y} width={BRIEF_W} height={46} rx={14} fill={CLAUDE.PAGE} />
          <rect x={BRIEF_X} y={BRIEF_Y + 32} width={BRIEF_W} height={14} fill={CLAUDE.PAGE} />
          <text x={BRIEF_X + 22} y={BRIEF_Y + 30} fontFamily={SERIF} fontSize={15} fontWeight={600} fill={CLAUDE.INK}>Morning Briefing</text>
          {[
            '3 supervisors matched your catalog profile',
            '2 open briefs align with your sound',
            '4 comparable-artist placements — noted for reference',
            'DRAFT pitches ready for your review — you send',
          ].map((line, i) => (
            <text key={i} x={BRIEF_X + 22} y={BRIEF_Y + 68 + i * 48} fontFamily={SANS} fontSize={14} fill={i === 3 ? CLAUDE.SPARK : CLAUDE.INK}>{line}</text>
          ))}
        </g>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          sync pitching is unusually time-expensive — this is the machine doing the gruntwork
        </text>
      </svg>
    </AbsoluteFill>
  );
};
