import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnScheduleOvernight — B03 "Claude, On Schedule"
 * Research cards stack overnight → morning briefing with DRAFT stamp.
 */

export const onScheduleOvernightSchema = z.object({
  sparkLine: z.string().default('Overnight, the homework.'),
});
export type OnScheduleOvernightProps = z.infer<typeof onScheduleOvernightSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const RESEARCH_CARDS = [
  { label: 'Supervisors', sub: 'placements in last 18 months' },
  { label: 'Comparable artists', sub: 'shipped this week' },
  { label: 'Catalog match', sub: 'your songs, relevant placements' },
];

export const OnScheduleOvernight: React.FC<OnScheduleOvernightProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const moonO = ease(remap(p, 0.06, 0.18, 0, 1));

  const STACK_X = 220, STACK_Y = 290, CARD_W = 280, CARD_H = 90, CARD_GAP = 108;
  const BRIEF_X = 800, BRIEF_Y = 270, BRIEF_W = 420, BRIEF_H = 340;
  const STAMP_CX = BRIEF_X + BRIEF_W / 2, STAMP_CY = BRIEF_Y + BRIEF_H / 2;

  const draftO = ease(remap(p, 0.72, 0.84, 0, 1));

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      {/* SparkLine */}
      <div style={{
        position: 'absolute', top: 44, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        opacity: sparkO,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Moon icon */}
        <g opacity={moonO}>
          <path d="M 960 140 A 60 60 0 1 1 900 200 A 42 42 0 1 0 960 140 Z"
            fill={CLAUDE.INK} opacity={0.18} />
          <text x={960} y={170} textAnchor="middle"
            fontFamily={SANS} fontSize={11} fontWeight={800} fill={CLAUDE.INK_SOFT} letterSpacing="0.14em">
            RUNNING OVERNIGHT
          </text>
        </g>

        {/* Research cards stacking in */}
        {RESEARCH_CARDS.map((card, i) => {
          const t0 = 0.18 + i * 0.14;
          const op = ease(remap(p, t0, t0 + 0.14, 0, 1));
          const ty = STACK_Y + i * CARD_GAP;
          const startTy = ty - 40;
          const curY = remap(op, 0, 1, startTy, ty);
          return (
            <g key={i} opacity={op}>
              <rect x={STACK_X} y={curY} width={CARD_W} height={CARD_H} rx={10}
                fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
              <text x={STACK_X + 20} y={curY + 32} fontFamily={SANS} fontSize={11}
                fontWeight={800} fill={CLAUDE.SPARK} letterSpacing="0.1em">
                {card.label.toUpperCase()}
              </text>
              <text x={STACK_X + 20} y={curY + 56} fontFamily={SERIF} fontSize={14} fill={CLAUDE.INK}>
                {card.sub}
              </text>
            </g>
          );
        })}

        {/* Arrow right to briefing */}
        <g opacity={ease(remap(p, 0.58, 0.68, 0, 1))}>
          <line x1={STACK_X + CARD_W + 12} y1={STACK_Y + CARD_GAP}
            x2={BRIEF_X - 12} y2={BRIEF_Y + BRIEF_H / 2}
            stroke={CLAUDE.INK_SOFT} strokeWidth={2} />
          <polygon
            points={`${BRIEF_X - 12},${BRIEF_Y + BRIEF_H / 2 - 7} ${BRIEF_X + 4},${BRIEF_Y + BRIEF_H / 2} ${BRIEF_X - 12},${BRIEF_Y + BRIEF_H / 2 + 7}`}
            fill={CLAUDE.INK_SOFT} />
        </g>

        {/* Morning briefing card */}
        <g opacity={ease(remap(p, 0.60, 0.72, 0, 1))}>
          <rect x={BRIEF_X} y={BRIEF_Y} width={BRIEF_W} height={BRIEF_H} rx={14}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={2} />
          <rect x={BRIEF_X} y={BRIEF_Y} width={BRIEF_W} height={52} rx={14} fill={CLAUDE.PAGE} />
          <rect x={BRIEF_X} y={BRIEF_Y + 38} width={BRIEF_W} height={14} fill={CLAUDE.PAGE} />
          <text x={BRIEF_X + 22} y={BRIEF_Y + 32} fontFamily={SERIF} fontSize={15}
            fontWeight={600} fill={CLAUDE.INK}>
            Morning Briefing
          </text>
          {/* Briefing lines */}
          {[
            'Supervisor leads: 3 found, songs matched',
            'Comparable activity: 2 relevant releases',
            'Pitch template: catalogued → ready to review',
          ].map((line, i) => (
            <text key={i} x={BRIEF_X + 22} y={BRIEF_Y + 86 + i * 48}
              fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>
              {line}
            </text>
          ))}
        </g>

        {/* DRAFT stamp */}
        <g opacity={draftO} transform={`rotate(-18, ${STAMP_CX + 60}, ${STAMP_CY + 60})`}>
          <rect x={STAMP_CX - 10} y={STAMP_CY + 30} width={160} height={50} rx={6}
            fill="none" stroke={CLAUDE.SPARK} strokeWidth={4} />
          <text x={STAMP_CX + 70} y={STAMP_CY + 66} textAnchor="middle"
            fontFamily={SANS} fontSize={28} fontWeight={900} fill={CLAUDE.SPARK}
            letterSpacing="0.12em" opacity={0.85}>
            DRAFT
          </text>
        </g>

        {/* Bottom note */}
        <text x={960} y={1020} textAnchor="middle"
          fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          it runs while you sleep · you send, nothing else
        </text>
      </svg>
    </AbsoluteFill>
  );
};
