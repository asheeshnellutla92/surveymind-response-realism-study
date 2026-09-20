import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnScheduleRedLine — B05 "Claude, On Schedule"
 * Three off-limits cards (numeric claims / named-person outreach / money decisions)
 * each get a red line and route to a human-review tray.
 */

export const onScheduleRedLineSchema = z.object({
  sparkLine: z.string().default('Drafts, not decisions.'),
});
export type OnScheduleRedLineProps = z.infer<typeof onScheduleRedLineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const CARDS = [
  { label: 'Numeric claim', sub: 'any number you haven\'t verified' },
  { label: 'Named person outreach', sub: 'no messages sent on your behalf' },
  { label: 'Money decision', sub: 'anything that spends' },
];

export const OnScheduleRedLine: React.FC<OnScheduleRedLineProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));

  const CARD_X = 200, CARD_START_Y = 300, CARD_W = 360, CARD_H = 100, CARD_GAP = 130;
  const TRAY_X = 1200, TRAY_Y = 350, TRAY_W = 360, TRAY_H = 240;

  const trayO = ease(remap(p, 0.08, 0.20, 0, 1));
  const trayLabelO = ease(remap(p, 0.72, 0.84, 0, 1));

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
        {/* Human-review tray */}
        <g opacity={trayO}>
          <rect x={TRAY_X} y={TRAY_Y} width={TRAY_W} height={TRAY_H} rx={14}
            fill={CLAUDE.CARD} stroke={CLAUDE.INK} strokeWidth={2.5} />
          {/* Tray header */}
          <rect x={TRAY_X} y={TRAY_Y} width={TRAY_W} height={52} rx={14} fill={CLAUDE.PAGE} />
          <rect x={TRAY_X} y={TRAY_Y + 38} width={TRAY_W} height={14} fill={CLAUDE.PAGE} />
          <text x={TRAY_X + TRAY_W / 2} y={TRAY_Y + 32} textAnchor="middle"
            fontFamily={SERIF} fontSize={15} fontWeight={700} fill={CLAUDE.INK}>
            Human Review
          </text>
          <text x={TRAY_X + TRAY_W / 2} y={TRAY_Y + TRAY_H / 2 + 20} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT} opacity={trayLabelO}>
            you decide · always
          </text>
        </g>

        {/* Off-limits cards */}
        {CARDS.map((card, i) => {
          const t0 = 0.16 + i * 0.16;
          const cardO = ease(remap(p, t0, t0 + 0.14, 0, 1));
          const lineT = ease(remap(p, t0 + 0.14, t0 + 0.24, 0, 1));
          const arrowO = ease(remap(p, t0 + 0.24, t0 + 0.34, 0, 1));
          const cy = CARD_START_Y + i * CARD_GAP;
          const cardMidY = cy + CARD_H / 2;
          const trayMidY = TRAY_Y + 80 + i * 60;

          const lineEndX = CARD_X + CARD_W * lineT;

          return (
            <g key={i}>
              {/* Card */}
              <g opacity={cardO}>
                <rect x={CARD_X} y={cy} width={CARD_W} height={CARD_H} rx={10}
                  fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
                <text x={CARD_X + 20} y={cy + 36} fontFamily={SERIF} fontSize={17}
                  fontWeight={600} fill={CLAUDE.INK}>
                  {card.label}
                </text>
                <text x={CARD_X + 20} y={cy + 62} fontFamily={SANS} fontSize={13}
                  fill={CLAUDE.INK_SOFT}>
                  {card.sub}
                </text>
              </g>

              {/* Red line crossing the card */}
              {lineT > 0 && (
                <line
                  x1={CARD_X + 14} y1={cardMidY}
                  x2={lineEndX} y2={cardMidY}
                  stroke={CLAUDE.SPARK} strokeWidth={4} strokeLinecap="round"
                  opacity={cardO} />
              )}

              {/* Arrow to tray */}
              <g opacity={arrowO}>
                <path
                  d={`M ${CARD_X + CARD_W + 10} ${cardMidY} C ${(CARD_X + CARD_W + TRAY_X) / 2} ${cardMidY}, ${(CARD_X + CARD_W + TRAY_X) / 2} ${trayMidY}, ${TRAY_X - 10} ${trayMidY}`}
                  fill="none" stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} strokeDasharray="5 3" />
                <polygon
                  points={`${TRAY_X - 10},${trayMidY - 6} ${TRAY_X + 6},${trayMidY} ${TRAY_X - 10},${trayMidY + 6}`}
                  fill={CLAUDE.INK_SOFT} />
              </g>
            </g>
          );
        })}

        {/* Bottom note */}
        <text x={960} y={1020} textAnchor="middle"
          fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          the schedule buys time · not judgment
        </text>
      </svg>
    </AbsoluteFill>
  );
};
