import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnScheduleDigest — B02 "Claude, On Schedule"
 * Monday 9am clock feeds a weekly digest card (what posted / what moved / three follow-ups).
 */

export const onScheduleDigestSchema = z.object({
  sparkLine: z.string().default('Start with the digest.'),
});
export type OnScheduleDigestProps = z.infer<typeof onScheduleDigestSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const ROWS = [
  { label: 'What went out', value: 'last week\'s posts, summarized' },
  { label: 'What moved', value: 'verified engagement — no guesses' },
  { label: 'Three follow-ups', value: 'worth making this week' },
];

export const OnScheduleDigest: React.FC<OnScheduleDigestProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const clockO = ease(remap(p, 0.08, 0.22, 0, 1));
  const arrowO = ease(remap(p, 0.28, 0.38, 0, 1));
  const cardO = ease(remap(p, 0.35, 0.48, 0, 1));

  const CLOCK_CX = 480, CLOCK_CY = 480, CLOCK_R = 110;
  const CARD_X = 740, CARD_Y = 300, CARD_W = 500, CARD_H = 360;

  // Clock hand angle for 9:00 → minute hand at top (−90°), hour hand at left (−90° + 270°)
  const handMin = -Math.PI / 2;
  const handHour = -Math.PI / 2 + (270 / 360) * 2 * Math.PI;

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
        {/* Clock */}
        <g opacity={clockO}>
          <circle cx={CLOCK_CX} cy={CLOCK_CY} r={CLOCK_R} fill={CLAUDE.CARD} stroke={CLAUDE.INK} strokeWidth={3} />
          {/* Tick marks */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * Math.PI) / 6 - Math.PI / 2;
            const r1 = i % 3 === 0 ? CLOCK_R - 18 : CLOCK_R - 10;
            return (
              <line key={i}
                x1={CLOCK_CX + r1 * Math.cos(angle)} y1={CLOCK_CY + r1 * Math.sin(angle)}
                x2={CLOCK_CX + (CLOCK_R - 4) * Math.cos(angle)} y2={CLOCK_CY + (CLOCK_R - 4) * Math.sin(angle)}
                stroke={CLAUDE.INK} strokeWidth={i % 3 === 0 ? 3 : 1.5} />
            );
          })}
          {/* Minute hand → 12 */}
          <line x1={CLOCK_CX} y1={CLOCK_CY}
            x2={CLOCK_CX + (CLOCK_R - 22) * Math.cos(handMin)}
            y2={CLOCK_CY + (CLOCK_R - 22) * Math.sin(handMin)}
            stroke={CLAUDE.INK} strokeWidth={3} strokeLinecap="round" />
          {/* Hour hand → 9 */}
          <line x1={CLOCK_CX} y1={CLOCK_CY}
            x2={CLOCK_CX + (CLOCK_R - 40) * Math.cos(handHour)}
            y2={CLOCK_CY + (CLOCK_R - 40) * Math.sin(handHour)}
            stroke={CLAUDE.INK} strokeWidth={4.5} strokeLinecap="round" />
          {/* Center dot */}
          <circle cx={CLOCK_CX} cy={CLOCK_CY} r={6} fill={CLAUDE.SPARK} />
          {/* Label */}
          <text x={CLOCK_CX} y={CLOCK_CY + CLOCK_R + 36} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={800} fill={CLAUDE.SPARK} letterSpacing="0.12em">
            MON 9:00 AM
          </text>
        </g>

        {/* Arrow */}
        <g opacity={arrowO}>
          <line x1={CLOCK_CX + CLOCK_R + 10} y1={CLOCK_CY}
            x2={CARD_X - 12} y2={CLOCK_CY}
            stroke={CLAUDE.INK_SOFT} strokeWidth={2.5} />
          <polygon
            points={`${CARD_X - 12},${CLOCK_CY - 7} ${CARD_X + 4},${CLOCK_CY} ${CARD_X - 12},${CLOCK_CY + 7}`}
            fill={CLAUDE.INK_SOFT} />
        </g>

        {/* Digest card */}
        <g opacity={cardO}>
          <rect x={CARD_X} y={CARD_Y} width={CARD_W} height={CARD_H} rx={14}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={2} />
          {/* Card header */}
          <rect x={CARD_X} y={CARD_Y} width={CARD_W} height={52} rx={14}
            fill={CLAUDE.PAGE} />
          <rect x={CARD_X} y={CARD_Y + 38} width={CARD_W} height={14} fill={CLAUDE.PAGE} />
          <text x={CARD_X + 22} y={CARD_Y + 32} fontFamily={SERIF} fontSize={16} fontWeight={600} fill={CLAUDE.INK}>
            Monday Digest
          </text>

          {/* Rows */}
          {ROWS.map((row, i) => {
            const ry = CARD_Y + 70 + i * 88;
            const rowO = ease(remap(p, 0.42 + i * 0.10, 0.54 + i * 0.10, 0, 1));
            return (
              <g key={i} opacity={rowO}>
                <rect x={CARD_X + 20} y={ry} width={CARD_W - 40} height={72} rx={8}
                  fill='#F8F7F2' stroke={CLAUDE.BORDER} strokeWidth={1} />
                <text x={CARD_X + 38} y={ry + 26} fontFamily={SANS} fontSize={12}
                  fontWeight={800} fill={CLAUDE.SPARK} letterSpacing="0.1em">
                  {row.label.toUpperCase()}
                </text>
                <text x={CARD_X + 38} y={ry + 50} fontFamily={SERIF} fontSize={15} fill={CLAUDE.INK}>
                  {row.value}
                </text>
              </g>
            );
          })}
        </g>

        {/* Bottom note */}
        <text x={960} y={1020} textAnchor="middle"
          fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.80, 0.92, 0, 1))}>
          low stakes · runs weekly · builds trust before anything bigger
        </text>
      </svg>
    </AbsoluteFill>
  );
};
