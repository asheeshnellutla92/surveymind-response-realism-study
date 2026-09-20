import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig08ScaffoldContract — "The Scaffolding Contract"
 * Source: Agent Skills for K-12 Teachers (Anthropic)
 *
 * Three horizontal boxes connected by arrows:
 *   1. CONTINGENCY — support matched to current state. Icon: calibration bracket.
 *   2. FADING — gradual withdrawal. Icon: shrinking bar.
 *   3. TRANSFER — learner does it alone. Icon: standing person. Terracotta border.
 * Phase 1: boxes + arrows spring in sequentially.
 * Phase 2 (75): Failure-mode path appears — dashed loop from box 1 back to 1.
 *   "Permanent scaffold = dependence." Transfer box gets checkmark.
 */

export const k12Fig08ScaffoldContractSchema = z.object({
  sparkLine: z.string().default('Scaffolding without fading is dependence with good design.'),
});
export type K12Fig08ScaffoldContractProps = z.infer<typeof k12Fig08ScaffoldContractSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PHASE_SWITCH = 75;

// Icon SVGs as viewBox="0 0 40 40" paths
const ContingencyIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    {/* Calibration bracket — two L-brackets flanking a dot */}
    <polyline points="5,8 5,20 12,20" fill="none" stroke={CLAUDE.INK_SOFT} strokeWidth={2.5} strokeLinecap="round" />
    <polyline points="35,8 35,20 28,20" fill="none" stroke={CLAUDE.INK_SOFT} strokeWidth={2.5} strokeLinecap="round" />
    <circle cx={20} cy={20} r={3.5} fill={CLAUDE.INK_SOFT} />
    <line x1={12} y1={20} x2={16} y2={20} stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} />
    <line x1={24} y1={20} x2={28} y2={20} stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} />
    <text x={20} y={34} textAnchor="middle" fontFamily={SANS} fontSize={8} fill={CLAUDE.GHOST}>calibrate</text>
  </svg>
);

const FadingIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    {/* Shrinking support bars — tall on left, decreasing right */}
    {[0, 1, 2, 3].map(i => (
      <rect key={i} x={4 + i * 9} y={30 - (3 - i) * 5} width={7} height={(3 - i) * 5 + 4}
        rx={2} fill={CLAUDE.INK_SOFT} opacity={1 - i * 0.2} />
    ))}
    <text x={20} y={38} textAnchor="middle" fontFamily={SANS} fontSize={8} fill={CLAUDE.GHOST}>fade</text>
  </svg>
);

const TransferIcon: React.FC<{ size: number; hot: boolean }> = ({ size, hot }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    {/* Standing person */}
    <circle cx={20} cy={9} r={4.5} fill={hot ? CLAUDE.SPARK : CLAUDE.INK_SOFT} />
    <line x1={20} y1={13.5} x2={20} y2={26} stroke={hot ? CLAUDE.SPARK : CLAUDE.INK_SOFT} strokeWidth={3} strokeLinecap="round" />
    <line x1={13} y1={18} x2={27} y2={18} stroke={hot ? CLAUDE.SPARK : CLAUDE.INK_SOFT} strokeWidth={3} strokeLinecap="round" />
    <line x1={20} y1={26} x2={15} y2={34} stroke={hot ? CLAUDE.SPARK : CLAUDE.INK_SOFT} strokeWidth={3} strokeLinecap="round" />
    <line x1={20} y1={26} x2={25} y2={34} stroke={hot ? CLAUDE.SPARK : CLAUDE.INK_SOFT} strokeWidth={3} strokeLinecap="round" />
    <text x={20} y={42} textAnchor="middle" fontFamily={SANS} fontSize={8} fill={hot ? CLAUDE.SPARK : CLAUDE.GHOST}>transfer</text>
  </svg>
);

const STEPS = [
  {
    num: '1.',
    title: 'CONTINGENCY',
    desc: 'Support matched to current state',
    hot: false,
  },
  {
    num: '2.',
    title: 'FADING',
    desc: 'Gradual withdrawal of support',
    hot: false,
  },
  {
    num: '3.',
    title: 'TRANSFER',
    desc: 'Learner works independently',
    hot: true,
  },
];

export const K12Fig08ScaffoldContract: React.FC<K12Fig08ScaffoldContractProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 140, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 18, stiffness: 80 } });
  const showP2 = frame >= PHASE_SWITCH;

  // Layout: 3 boxes in a row with connecting arrows
  const TOTAL_W = width - PAD_X * 2;
  const BOX_W = (TOTAL_W - 80) / 3;
  const BOX_H = height * 0.22;
  const BOX_Y = height * 0.34;
  const ARROW_W = 40;
  const ICON_SIZE = height * 0.08;

  const boxX = (i: number) => PAD_X + i * (BOX_W + ARROW_W);
  const boxCX = (i: number) => boxX(i) + BOX_W / 2;

  // Phase 2 — failure loop geometry: arc from right side of box0 looping up and back
  const loopStartX = boxX(0) + BOX_W;
  const loopEndX = boxX(0);
  const loopCY = BOX_Y - height * 0.10;
  const p2 = clamp(phase2In, 0, 1);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        THE SCAFFOLDING CONTRACT · CONTINGENCY → FADING → TRANSFER
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showP2 ? 'A scaffold without an exit is a trap.' : 'Every scaffold has a contract: it must fade.'}
      </div>

      {/* SVG for arrows and failure loop */}
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={width} height={height}>
        {/* Forward arrows between boxes */}
        {[0, 1].map(i => {
          const aAnim = spring({ frame: frame - 20 - i * 16, fps, config: { damping: 24, stiffness: 80 } });
          const ap = clamp(aAnim, 0, 1);
          const ax = boxX(i) + BOX_W;
          const ay = BOX_Y + BOX_H / 2;
          const ex = ax + ARROW_W;
          return (
            <g key={i} opacity={ap}>
              <line x1={ax} y1={ay} x2={ex - 6} y2={ay}
                stroke={CLAUDE.INK_SOFT} strokeWidth={2.5} />
              <polygon points={`${ex},${ay} ${ex - 9},${ay - 5} ${ex - 9},${ay + 5}`}
                fill={CLAUDE.INK_SOFT} />
            </g>
          );
        })}

        {/* Phase 2: dashed failure loop from box1 → back to box1 (above) */}
        {showP2 && (
          <g opacity={p2}>
            {/* Arc path: from right side of box0, up and over, back to left side of box0 */}
            <path
              d={`M ${loopStartX},${BOX_Y + BOX_H * 0.4}
                  C ${loopStartX + 60},${loopCY}
                    ${loopEndX - 60},${loopCY}
                    ${loopEndX},${BOX_Y + BOX_H * 0.4}`}
              fill="none"
              stroke={CLAUDE.GHOST}
              strokeWidth={2}
              strokeDasharray="6 4"
            />
            {/* Arrow head pointing back into box0 top-left */}
            <polygon
              points={`${loopEndX},${BOX_Y + BOX_H * 0.4}
                       ${loopEndX + 10},${BOX_Y + BOX_H * 0.4 - 7}
                       ${loopEndX + 8},${BOX_Y + BOX_H * 0.4 + 7}`}
              fill={CLAUDE.GHOST}
            />
          </g>
        )}

        {/* Phase 2: checkmark on transfer box */}
        {showP2 && (() => {
          const cx = boxCX(2);
          const cy = BOX_Y - height * 0.04;
          return (
            <g opacity={p2}>
              <circle cx={cx} cy={cy} r={height * 0.028}
                fill={CLAUDE.SPARK} opacity={0.15} />
              <polyline
                points={`${cx - height * 0.016},${cy} ${cx - height * 0.004},${cy + height * 0.014} ${cx + height * 0.018},${cy - height * 0.014}`}
                fill="none" stroke={CLAUDE.SPARK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
              />
            </g>
          );
        })()}
      </svg>

      {/* Phase 2: failure label */}
      {showP2 && (
        <div style={{
          position: 'absolute',
          left: boxX(0) - 10,
          top: BOX_Y - height * 0.15,
          width: BOX_W + 20,
          fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
          textAlign: 'center' as const, fontStyle: 'italic',
          opacity: p2,
        }}>
          Permanent scaffold = dependence
        </div>
      )}

      {/* Step boxes */}
      {STEPS.map((s, i) => {
        const bAnim = spring({ frame: frame - 10 - i * 16, fps, config: { damping: 22, stiffness: 80 } });
        const prog = clamp(bAnim, 0, 1);
        const bx = boxX(i);
        return (
          <div key={s.title} style={{
            position: 'absolute',
            left: bx, top: BOX_Y,
            width: BOX_W, height: BOX_H,
            background: s.hot ? '#FEF5F0' : CLAUDE.CARD,
            borderRadius: 14,
            border: s.hot ? `2px solid ${CLAUDE.SPARK}` : `1px solid ${CLAUDE.BORDER}`,
            opacity: prog,
            transform: `translateY(${(1 - prog) * 14}px)`,
            display: 'flex', flexDirection: 'column' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            padding: '12px 10px',
            gap: 8,
          }}>
            {/* Icon */}
            <div style={{ flexShrink: 0 }}>
              {i === 0 && <ContingencyIcon size={ICON_SIZE} />}
              {i === 1 && <FadingIcon size={ICON_SIZE} />}
              {i === 2 && <TransferIcon size={ICON_SIZE} hot={s.hot} />}
            </div>
            {/* Number + title */}
            <div style={{ textAlign: 'center' as const }}>
              <span style={{
                fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
              }}>
                {s.num}{'  '}
              </span>
              <span style={{
                fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
                letterSpacing: 1,
                color: s.hot ? CLAUDE.SPARK : CLAUDE.INK,
              }}>
                {s.title}
              </span>
            </div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT,
              textAlign: 'center' as const, lineHeight: 1.35,
            }}>
              {s.desc}
            </div>
          </div>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Agent Skills for K-12 Teachers (Anthropic)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    
      {/* @NikBearBrown watermark — lower-right, low opacity (LOGO LAW) */}
      <div style={{
        position: 'absolute',
        right: width * 0.04,
        bottom: height * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        @NikBearBrown
      </div>
    </AbsoluteFill>

  );
};
