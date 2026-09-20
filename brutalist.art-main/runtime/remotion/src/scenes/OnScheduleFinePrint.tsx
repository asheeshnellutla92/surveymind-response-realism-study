import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnScheduleFinePrint — B04 "Claude, On Schedule"
 * Three honest constraints stagger in — no invented numbers.
 */

export const onScheduleFinePrintSchema = z.object({
  sparkLine: z.string().default('The fine print, out loud.'),
});
export type OnScheduleFinePrintProps = z.infer<typeof onScheduleFinePrintSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const CONSTRAINTS = [
  {
    icon: 'laptop',
    heading: 'Desktop must be awake',
    body: 'A missed morning is expected behavior — not a bug.',
  },
  {
    icon: 'usage',
    heading: 'Agentic runs cost more',
    body: 'Batch your jobs; they burn more usage than a chat.',
  },
  {
    icon: 'screen',
    heading: 'Browser reads: verify',
    body: 'JS-rendered dashboards — check the numbers yourself, always.',
  },
];

const LaptopIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x} y={y + 4} width={36} height={24} rx={3} fill="none" stroke={CLAUDE.INK} strokeWidth={2.5} />
    <rect x={x - 4} y={y + 28} width={44} height={4} rx={2} fill={CLAUDE.INK} opacity={0.5} />
  </g>
);

const UsageIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    {[0, 1, 2, 3].map(i => (
      <rect key={i} x={x + i * 10} y={y + 28 - (i + 1) * 6} width={7} height={(i + 1) * 6}
        rx={2} fill={i < 3 ? CLAUDE.INK_SOFT : CLAUDE.SPARK} />
    ))}
  </g>
);

const ScreenIcon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x} y={y} width={40} height={28} rx={3} fill="none" stroke={CLAUDE.INK} strokeWidth={2.5} />
    <line x1={x + 20} y1={y + 28} x2={x + 20} y2={y + 34} stroke={CLAUDE.INK} strokeWidth={2.5} />
    <line x1={x + 10} y1={y + 34} x2={x + 30} y2={y + 34} stroke={CLAUDE.INK} strokeWidth={2.5} />
    <text x={x + 20} y={y + 18} textAnchor="middle" fontFamily={SANS} fontSize={9} fill={CLAUDE.INK_SOFT}>?</text>
  </g>
);

export const OnScheduleFinePrint: React.FC<OnScheduleFinePrintProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));

  const ROW_X = 360, ROW_START_Y = 310, ROW_H = 100, ROW_GAP = 130, ROW_W = 1200;

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
        {CONSTRAINTS.map((c, i) => {
          const t0 = 0.12 + i * 0.18;
          const op = ease(remap(p, t0, t0 + 0.15, 0, 1));
          const ry = ROW_START_Y + i * ROW_GAP;
          const ty = remap(op, 0, 1, ry + 20, ry);

          return (
            <g key={i} opacity={op} transform={`translate(0, ${ty - ry})`}>
              {/* Row card */}
              <rect x={ROW_X} y={ry} width={ROW_W} height={ROW_H} rx={12}
                fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
              {/* Left accent bar */}
              <rect x={ROW_X} y={ry} width={6} height={ROW_H} rx={3} fill={CLAUDE.SPARK} />
              {/* Icon */}
              <g transform={`translate(${ROW_X + 36}, ${ry + 30})`}>
                {c.icon === 'laptop' && <LaptopIcon x={0} y={0} />}
                {c.icon === 'usage' && <UsageIcon x={0} y={0} />}
                {c.icon === 'screen' && <ScreenIcon x={0} y={0} />}
              </g>
              {/* Text */}
              <text x={ROW_X + 110} y={ry + 40} fontFamily={SERIF} fontSize={20}
                fontWeight={700} fill={CLAUDE.INK}>
                {c.heading}
              </text>
              <text x={ROW_X + 110} y={ry + 68} fontFamily={SANS} fontSize={15} fill={CLAUDE.INK_SOFT}>
                {c.body}
              </text>
            </g>
          );
        })}

        {/* Bottom note */}
        <text x={960} y={1020} textAnchor="middle"
          fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          I fight for you, not for the software
        </text>
      </svg>
    </AbsoluteFill>
  );
};
