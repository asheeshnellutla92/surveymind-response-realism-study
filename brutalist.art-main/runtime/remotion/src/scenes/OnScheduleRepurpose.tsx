import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnScheduleRepurpose — B01 "Claude, On Schedule"
 * One studio-diary source fans into 4 platform output cards through a voice-file badge.
 */

export const onScheduleRepurposeSchema = z.object({
  sparkLine: z.string().default('One take, every platform.'),
});
export type OnScheduleRepurposeProps = z.infer<typeof onScheduleRepurposeSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const OUTPUTS = [
  { label: 'Blog Post', sub: 'long-form' },
  { label: 'IG Captions', sub: 'platform-fit' },
  { label: 'X Thread', sub: 'platform-fit' },
  { label: 'Short Script', sub: 'video' },
];

export const OnScheduleRepurpose: React.FC<OnScheduleRepurposeProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const sourceO = ease(remap(p, 0.06, 0.20, 0, 1));
  const badgeO = ease(remap(p, 0.25, 0.38, 0, 1));

  const SRC_X = 200, SRC_Y = 310, SRC_W = 220, SRC_H = 130;
  const BADGE_CX = 680, BADGE_CY = 375;
  const OUT_X = 860, OUT_START_Y = 180, OUT_GAP = 120, OUT_W = 240, OUT_H = 90;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      {/* SparkLine */}
      <div style={{
        position: 'absolute', top: 44, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16,
        opacity: sparkO,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Source card */}
        <g opacity={sourceO}>
          <rect x={SRC_X} y={SRC_Y} width={SRC_W} height={SRC_H} rx={12}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={2} />
          <text x={SRC_X + SRC_W / 2} y={SRC_Y + 36} textAnchor="middle"
            fontFamily={SANS} fontSize={11} fontWeight={800} fill={CLAUDE.SPARK} letterSpacing="0.1em">
            SOURCE
          </text>
          <text x={SRC_X + SRC_W / 2} y={SRC_Y + 62} textAnchor="middle"
            fontFamily={SERIF} fontSize={18} fill={CLAUDE.INK}>
            Studio Diary
          </text>
          <text x={SRC_X + SRC_W / 2} y={SRC_Y + 86} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>
            one entry
          </text>
        </g>

        {/* Voice-file badge */}
        <g opacity={badgeO}>
          <rect x={BADGE_CX - 90} y={BADGE_CY - 28} width={180} height={56} rx={28}
            fill={CLAUDE.SPARK} />
          <text x={BADGE_CX} y={BADGE_CY - 4} textAnchor="middle"
            fontFamily={SANS} fontSize={11} fontWeight={800} fill="#FFF" letterSpacing="0.1em">
            VOICE FILE
          </text>
          <text x={BADGE_CX} y={BADGE_CY + 14} textAnchor="middle"
            fontFamily={SANS} fontSize={11} fill="rgba(255,255,255,0.8)">
            brand filter
          </text>
        </g>

        {/* Fan arrows + output cards */}
        {OUTPUTS.map((out, i) => {
          const t0 = 0.38 + i * 0.10;
          const op = ease(remap(p, t0, t0 + 0.12, 0, 1));
          const cy = OUT_START_Y + i * OUT_GAP + OUT_H / 2;
          const midX = (BADGE_CX + 90 + OUT_X) / 2;

          return (
            <g key={i} opacity={op}>
              {/* Arrow from badge to card */}
              <path
                d={`M ${BADGE_CX + 90} ${BADGE_CY} C ${midX} ${BADGE_CY}, ${midX} ${cy}, ${OUT_X} ${cy}`}
                fill="none" stroke={CLAUDE.BORDER} strokeWidth={1.5} strokeDasharray="4 3" />
              {/* Output card */}
              <rect x={OUT_X} y={OUT_START_Y + i * OUT_GAP} width={OUT_W} height={OUT_H} rx={10}
                fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
              <text x={OUT_X + OUT_W / 2} y={OUT_START_Y + i * OUT_GAP + 34} textAnchor="middle"
                fontFamily={SERIF} fontSize={16} fontWeight={600} fill={CLAUDE.INK}>
                {out.label}
              </text>
              <text x={OUT_X + OUT_W / 2} y={OUT_START_Y + i * OUT_GAP + 56} textAnchor="middle"
                fontFamily={SANS} fontSize={12} fill={CLAUDE.INK_SOFT}>
                {out.sub}
              </text>
            </g>
          );
        })}

        {/* Arrow from source to badge */}
        <line
          x1={SRC_X + SRC_W} y1={SRC_Y + SRC_H / 2}
          x2={BADGE_CX - 92} y2={BADGE_CY}
          stroke={CLAUDE.INK_SOFT} strokeWidth={2}
          opacity={clamp(badgeO, 0, 1)} />

        {/* Bottom label */}
        <text x={960} y={1020} textAnchor="middle"
          fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.80, 0.92, 0, 1))}>
          one take · four formats · sounds like you
        </text>
      </svg>
    </AbsoluteFill>
  );
};
