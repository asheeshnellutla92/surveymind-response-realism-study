import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * MusiniqueLanes — B01 of "Claude, In Your Corner"
 * Three-lane concept illustration: chat / Cowork / Code.
 * Cream stage, one terracotta accent (Cowork column), SparkLine top.
 * Duration-agnostic — progress-based animation.
 */

export const musiniqueLanesSchema = z.object({
  sparkLine: z.string().default('Three lanes, three jobs.'),
});
export type MusiniqueLanesProps = z.infer<typeof musiniqueLanesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const Spark: React.FC = () => null;

const LANES = [
  {
    id: 'chat',
    label: 'CHAT',
    desc: 'judgment, every step',
    sub: 'lyrics · critique · hard calls',
    accent: CLAUDE.INK,
    icon: (
      <svg width={52} height={52} viewBox="0 0 52 52" fill="none">
        <rect x={4} y={8} width={44} height={30} rx={8} stroke={CLAUDE.INK} strokeWidth={3} fill={CLAUDE.CARD} />
        <circle cx={16} cy={23} r={3.5} fill={CLAUDE.INK} />
        <circle cx={26} cy={23} r={3.5} fill={CLAUDE.INK} />
        <circle cx={36} cy={23} r={3.5} fill={CLAUDE.INK} />
        <path d="M18 38 L26 46 L34 38" stroke={CLAUDE.INK} strokeWidth={3} fill={CLAUDE.CARD} />
      </svg>
    ),
  },
  {
    id: 'cowork',
    label: 'COWORK',
    desc: 'recipes, on a schedule',
    sub: 'folder + recipe + clock',
    accent: CLAUDE.SPARK,
    icon: (
      <svg width={52} height={52} viewBox="0 0 52 52" fill="none">
        <circle cx={26} cy={26} r={21} stroke={CLAUDE.SPARK} strokeWidth={3} fill={CLAUDE.CARD} />
        <line x1={26} y1={26} x2={26} y2={13} stroke={CLAUDE.SPARK} strokeWidth={3} strokeLinecap="round" />
        <line x1={26} y1={26} x2={36} y2={30} stroke={CLAUDE.INK} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={26} cy={26} r={3} fill={CLAUDE.SPARK} />
      </svg>
    ),
  },
  {
    id: 'code',
    label: 'CODE',
    desc: 'the pipeline you own',
    sub: 'skills · gates · systems',
    accent: CLAUDE.INK,
    icon: (
      <svg width={52} height={52} viewBox="0 0 52 52" fill="none">
        <rect x={4} y={10} width={44} height={32} rx={6} stroke={CLAUDE.INK} strokeWidth={3} fill={CLAUDE.CARD} />
        <circle cx={12} cy={18} r={3} fill="#EC6A5E" />
        <circle cx={20} cy={18} r={3} fill="#F4BF4F" />
        <circle cx={28} cy={18} r={3} fill="#61C554" />
        <line x1={12} y1={27} x2={24} y2={27} stroke={CLAUDE.INK_SOFT} strokeWidth={2} strokeLinecap="round" />
        <line x1={12} y1={33} x2={32} y2={33} stroke={CLAUDE.INK_SOFT} strokeWidth={2} strokeLinecap="round" />
        <text x={12} y={29} fontFamily="monospace" fontSize={9} fill={CLAUDE.SPARK}>$</text>
      </svg>
    ),
  },
];

export const MusiniqueLanes: React.FC<MusiniqueLanesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = remap(p, 0, 0.06, 0, 1);

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      {/* SparkLine */}
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>

      {/* Lanes */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, paddingTop: 60 }}>
        {LANES.map((lane, i) => {
          const t0 = 0.08 + i * 0.14;
          const op = ease(remap(p, t0, t0 + 0.16, 0, 1));
          const ty = remap(ease(remap(p, t0, t0 + 0.16, 0, 1)), 0, 1, 32, 0);
          const isAccent = lane.id === 'cowork';
          return (
            <div key={lane.id} style={{
              width: 260,
              background: CLAUDE.CARD,
              borderRadius: 16,
              border: `2px solid ${isAccent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              padding: '28px 24px 24px',
              boxShadow: isAccent ? `0 8px 32px rgba(217,119,87,0.18)` : '0 6px 24px rgba(61,57,41,0.08)',
              opacity: op,
              transform: `translateY(${ty}px)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}>
              {lane.icon}
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 22, color: isAccent ? CLAUDE.SPARK : CLAUDE.INK, letterSpacing: '0.06em' }}>
                {lane.label}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: CLAUDE.INK, textAlign: 'center', lineHeight: 1.4 }}>
                {lane.desc}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, textAlign: 'center', lineHeight: 1.6 }}>
                {lane.sub}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
