import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig05DiffVsTrack — "Differentiation vs Tracking — The Ceiling Check"
 * Source: Agent Skills for K-12 Teachers (Anthropic)
 *
 * Phase 1: Two columns. LEFT: 3 entry arrows (Below/At/Above) converge into
 * ONE "Same Hard Case" destination box. RIGHT: ONE entry splits into 3 ceiling
 * boxes — each has a flat lid symbolising the ceiling.
 * Phase 2: Spark line + UDL annotations under each column.
 */

export const k12Fig05DiffVsTrackSchema = z.object({
  sparkLine: z.string().default('Differentiation widens the path. Tracking forks it.'),
});
export type K12Fig05DiffVsTrackProps = z.infer<typeof k12Fig05DiffVsTrackSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PHASE_SWITCH = 75;
const ENTRY_LABELS = ['Below', 'At', 'Above'];
const ENTRY_COLORS = [CLAUDE.SPARK, CLAUDE.INK_SOFT, CLAUDE.GHOST];

export const K12Fig05DiffVsTrack: React.FC<K12Fig05DiffVsTrackProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 140, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 18, stiffness: 80 } });
  const showP2 = frame >= PHASE_SWITCH;

  // Layout
  const COL_W = (width - PAD_X * 2 - 40) / 2;
  const LEFT_X = PAD_X;
  const RIGHT_X = PAD_X + COL_W + 40;
  const CONTENT_TOP = height * 0.26;
  const CONTENT_H = height * 0.52;

  // SVG geometry for left column (differentiation): arrows → single box
  const lCX = LEFT_X + COL_W / 2;
  const destBoxW = COL_W * 0.58;
  const destBoxH = height * 0.09;
  const destBoxX = lCX - destBoxW / 2;
  const destBoxY = CONTENT_TOP + CONTENT_H - destBoxH - height * 0.02;
  const entryY = CONTENT_TOP + height * 0.04;
  const entrySpacing = COL_W * 0.28;

  // SVG geometry for right column (tracking): one entry → 3 ceiling boxes
  const rCX = RIGHT_X + COL_W / 2;
  const srcY = CONTENT_TOP + height * 0.04;
  const ceilBoxW = (COL_W - 20) / 3 - 6;
  const ceilBoxH = height * 0.09;
  const ceilBoxY = CONTENT_TOP + CONTENT_H - ceilBoxH - height * 0.02;
  const ceilBoxYArr = [
    RIGHT_X + 0,
    RIGHT_X + ceilBoxW + 10,
    RIGHT_X + (ceilBoxW + 10) * 2,
  ];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        DIFFERENTIATION vs TRACKING · THE CEILING CHECK
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showP2 ? 'One destination. Three doors.' : 'Same hard case — or three separate ceilings?'}
      </div>

      {/* Column headers */}
      {(['DIFFERENTIATION', 'TRACKING'] as const).map((label, ci) => {
        const x = ci === 0 ? LEFT_X + COL_W / 2 : RIGHT_X + COL_W / 2;
        const col = ci === 0 ? CLAUDE.INK : CLAUDE.INK_SOFT;
        const hIn = spring({ frame: frame - 5 - ci * 12, fps, config: { damping: 24, stiffness: 80 } });
        return (
          <div key={label} style={{
            position: 'absolute',
            left: x - COL_W / 2, top: CONTENT_TOP - height * 0.06,
            width: COL_W,
            fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase' as const,
            color: col, textAlign: 'center' as const,
            opacity: clamp(hIn, 0, 1),
          }}>
            {label}
          </div>
        );
      })}

      {/* SVG: left column arrows + right column fork */}
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={width} height={height}>
        {/* LEFT column: 3 entry arrows converging to destination box */}
        {ENTRY_LABELS.map((lbl, i) => {
          const ex = LEFT_X + COL_W * 0.18 + i * entrySpacing;
          const anim = spring({ frame: frame - 10 - (2 - i) * 12, fps, config: { damping: 22, stiffness: 80 } });
          const prog = clamp(anim, 0, 1);
          const targetX = destBoxX + destBoxW / 2;
          const targetY = destBoxY;
          const midY = entryY + (targetY - entryY) * 0.5;
          return (
            <g key={lbl} opacity={prog}>
              {/* Arrow label */}
              <text x={ex} y={entryY - 8} textAnchor="middle"
                fontFamily={SANS} fontSize={height * 0.013} fontWeight="700"
                fill={ENTRY_COLORS[i]}>
                {lbl}
              </text>
              {/* Arrow shaft + head */}
              <polyline
                points={`${ex},${entryY + 4} ${ex},${midY} ${targetX},${targetY}`}
                fill="none" stroke={ENTRY_COLORS[i]} strokeWidth={2.5}
                strokeDasharray={i === 0 ? '5 3' : i === 1 ? 'none' : '2 4'}
              />
              <polygon
                points={`${targetX},${targetY} ${targetX - 5},${targetY - 10} ${targetX + 5},${targetY - 10}`}
                fill={ENTRY_COLORS[i]}
              />
            </g>
          );
        })}

        {/* LEFT: destination box */}
        {(() => {
          const dAnim = spring({ frame: frame - 32, fps, config: { damping: 22, stiffness: 80 } });
          const dp = clamp(dAnim, 0, 1);
          return (
            <g opacity={dp}>
              <rect x={destBoxX} y={destBoxY} width={destBoxW} height={destBoxH}
                rx={8} fill="#FEF5F0" stroke={CLAUDE.SPARK} strokeWidth={2} />
              <text x={destBoxX + destBoxW / 2} y={destBoxY + destBoxH * 0.45}
                textAnchor="middle" fontFamily={SERIF} fontSize={height * 0.016} fontWeight="700"
                fill={CLAUDE.SPARK}>
                Same Hard Case
              </text>
              <text x={destBoxX + destBoxW / 2} y={destBoxY + destBoxH * 0.73}
                textAnchor="middle" fontFamily={SANS} fontSize={height * 0.011}
                fill={CLAUDE.INK_SOFT}>
                All tiers. One destination.
              </text>
            </g>
          );
        })()}

        {/* RIGHT column: one source → 3 ceiling boxes */}
        {(() => {
          const sAnim = spring({ frame: frame - 10, fps, config: { damping: 22, stiffness: 80 } });
          const sp = clamp(sAnim, 0, 1);
          return (
            <g opacity={sp}>
              {/* Source dot / label */}
              <circle cx={rCX} cy={srcY} r={6} fill={CLAUDE.INK_SOFT} />
              <text x={rCX} y={srcY - 14} textAnchor="middle"
                fontFamily={SANS} fontSize={height * 0.012} fontWeight="700"
                fill={CLAUDE.INK_SOFT}>
                ONE ENTRY
              </text>
            </g>
          );
        })()}

        {ENTRY_LABELS.map((lbl, i) => {
          const bx = ceilBoxYArr[i];
          const bcx = bx + ceilBoxW / 2;
          const anim = spring({ frame: frame - 16 - i * 12, fps, config: { damping: 22, stiffness: 80 } });
          const prog = clamp(anim, 0, 1);
          return (
            <g key={`r-${lbl}`} opacity={prog}>
              {/* Fork line from source to box */}
              <line x1={rCX} y1={srcY + 6} x2={bcx} y2={ceilBoxY - 6}
                stroke={CLAUDE.INK_SOFT} strokeWidth={2} strokeDasharray="4 3" />
              <polygon
                points={`${bcx},${ceilBoxY} ${bcx - 4},${ceilBoxY - 10} ${bcx + 4},${ceilBoxY - 10}`}
                fill={CLAUDE.INK_SOFT}
              />
              {/* Ceiling box with lid */}
              <rect x={bx} y={ceilBoxY} width={ceilBoxW} height={ceilBoxH}
                rx={6} fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
              {/* Ceiling lid — thick flat top line */}
              <line x1={bx} y1={ceilBoxY + 6} x2={bx + ceilBoxW} y2={ceilBoxY + 6}
                stroke={CLAUDE.INK} strokeWidth={5} strokeLinecap="round" />
              <text x={bcx} y={ceilBoxY + ceilBoxH * 0.52}
                textAnchor="middle" fontFamily={SANS} fontSize={height * 0.012} fontWeight="700"
                fill={CLAUDE.INK}>
                {lbl}
              </text>
              <text x={bcx} y={ceilBoxY + ceilBoxH * 0.78}
                textAnchor="middle" fontFamily={SANS} fontSize={height * 0.010}
                fill={CLAUDE.GHOST}>
                ceiling
              </text>
            </g>
          );
        })}
      </svg>

      {/* Phase 2: UDL annotations */}
      {showP2 && (
        <>
          <div style={{
            position: 'absolute',
            left: LEFT_X, top: destBoxY + destBoxH + height * 0.02,
            width: COL_W,
            fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT,
            textAlign: 'center' as const, fontStyle: 'italic',
            opacity: clamp(phase2In, 0, 1),
          }}>
            "One destination. Multiple doors."
          </div>
          <div style={{
            position: 'absolute',
            left: RIGHT_X, top: ceilBoxY + ceilBoxH + height * 0.02,
            width: COL_W,
            fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
            textAlign: 'center' as const, fontStyle: 'italic',
            opacity: clamp(phase2In, 0, 1),
          }}>
            "Different ceilings. Some doors close."
          </div>
        </>
      )}

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
