import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig12ColdReadTest — "Transfer Test: Cold Reads vs Rehearsed Passages"
 * Source: Agent Skills for K-12 Teachers (Anthropic) — k12-fluency-scaffolding
 *
 * Line chart, 8 weeks. Two lines animate left-to-right.
 *   1. Dashed grey — rehearsed-passage rate (rises steeply, levels off ~week 4-5)
 *   2. Solid terracotta — cold-read fluency (slower, steady, continues rising)
 * Phase 2 (PHASE_SWITCH=90): annotations appear.
 */

export const k12Fig12ColdReadTestSchema = z.object({
  sparkLine: z.string().default("Cold reads, not rehearsed passages — that's where automaticity lives."),
});
export type K12Fig12ColdReadTestProps = z.infer<typeof k12Fig12ColdReadTestSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PHASE_SWITCH = 90;


// Data points for each line (week 1..8, 0-indexed, values 0-100)
// Rehearsed: rises steeply, then levels off
const REHEARSED_Y = [22, 40, 58, 74, 82, 85, 86, 86];
// Cold-read: slower, steady, continues rising
const COLD_Y =      [14, 22, 32, 44, 54, 64, 74, 83];

// Build an SVG polyline path from data points given chart bounds
function buildPath(
  data: number[],
  chartX: number, chartY: number, chartW: number, chartH: number,
  progress: number
): string {
  const nWeeks = data.length;
  const points = data.map((v, i) => {
    const x = chartX + (i / (nWeeks - 1)) * chartW;
    const y = chartY + chartH - (v / 100) * chartH;
    return { x, y };
  });

  // Interpolate how many points to draw based on progress
  const maxIdx = progress * (nWeeks - 1);
  const fullCount = Math.floor(maxIdx);
  const frac = maxIdx - fullCount;

  const usedPoints = points.slice(0, fullCount + 1);
  if (frac > 0 && fullCount < nWeeks - 1) {
    const p0 = points[fullCount];
    const p1 = points[fullCount + 1];
    usedPoints.push({
      x: p0.x + (p1.x - p0.x) * frac,
      y: p0.y + (p1.y - p0.y) * frac,
    });
  }

  if (usedPoints.length < 2) return '';
  return usedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

export const K12Fig12ColdReadTest: React.FC<K12Fig12ColdReadTestProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 18, stiffness: 80 } });
  const showP2 = frame >= PHASE_SWITCH;
  const phase2Prog = clamp(phase2In, 0, 1);

  // Lines draw in starting from frame 30
  const lineDrawIn = spring({ frame: frame - 30, fps, config: { damping: 22, stiffness: 60, mass: 1.2 } });
  const lineProg = clamp(lineDrawIn, 0, 1);

  // Chart geometry
  const CHART_LEFT = PAD_X + 70;
  const CHART_RIGHT = width - PAD_X - 40;
  const CHART_TOP = height * 0.26;
  const CHART_BOTTOM = height * 0.72;
  const CHART_W = CHART_RIGHT - CHART_LEFT;
  const CHART_H = CHART_BOTTOM - CHART_TOP;

  const N_WEEKS = 8;
  const N_YTICKS = 5; // 0, 25, 50, 75, 100

  const rehearsedPath = buildPath(REHEARSED_Y, CHART_LEFT, CHART_TOP, CHART_W, CHART_H, lineProg);
  const coldPath = buildPath(COLD_Y, CHART_LEFT, CHART_TOP, CHART_W, CHART_H, lineProg);

  // Where is the cold-read line at week 6 (for annotation placement)
  const annotWeekIdx = 5; // week 6 (0-indexed)
  const annotX = CHART_LEFT + (annotWeekIdx / (N_WEEKS - 1)) * CHART_W;
  const annotY = CHART_TOP + CHART_H - (COLD_Y[annotWeekIdx] / 100) * CHART_H;

  // Rehearsed annotation near week 5
  const rehAnnotWeekIdx = 4;
  const rehAnnotX = CHART_LEFT + (rehAnnotWeekIdx / (N_WEEKS - 1)) * CHART_W;
  const rehAnnotY = CHART_TOP + CHART_H - (REHEARSED_Y[rehAnnotWeekIdx] / 100) * CHART_H;

  const axisOpacity = clamp(titleIn, 0, 1);

  return (
    <AbsoluteFill style={{ background: '#FAF9F5', overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: '#6B6B68', opacity: axisOpacity,
      }}>
        TRANSFER TEST · FLUENCY MEASUREMENT
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.052,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: '#1A1A18', opacity: axisOpacity,
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Rehearsal rate rises. Cold-read fluency transfers.
      </div>

      {/* SVG chart */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        width={width} height={height}
      >
        {/* Y axis */}
        <line
          x1={CHART_LEFT} y1={CHART_TOP}
          x2={CHART_LEFT} y2={CHART_BOTTOM}
          stroke="#E5E3DD" strokeWidth={2}
          opacity={axisOpacity}
        />
        {/* X axis */}
        <line
          x1={CHART_LEFT} y1={CHART_BOTTOM}
          x2={CHART_RIGHT} y2={CHART_BOTTOM}
          stroke="#E5E3DD" strokeWidth={2}
          opacity={axisOpacity}
        />

        {/* Y tick lines and labels */}
        {Array.from({ length: N_YTICKS + 1 }, (_, i) => {
          const val = i * 25;
          const y = CHART_TOP + CHART_H - (val / 100) * CHART_H;
          return (
            <g key={i} opacity={axisOpacity}>
              <line x1={CHART_LEFT - 6} y1={y} x2={CHART_RIGHT} y2={y}
                stroke="#E5E3DD" strokeWidth={1} strokeDasharray="4 4" />
              <text
                x={CHART_LEFT - 10} y={y + 5}
                fontFamily={SANS} fontSize={height * 0.011}
                fill="#6B6B68" textAnchor="end"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* X tick labels (Week 1–8) */}
        {Array.from({ length: N_WEEKS }, (_, i) => {
          const x = CHART_LEFT + (i / (N_WEEKS - 1)) * CHART_W;
          return (
            <text key={i}
              x={x} y={CHART_BOTTOM + 22}
              fontFamily={SANS} fontSize={height * 0.011}
              fill="#6B6B68" textAnchor="middle"
              opacity={axisOpacity}
            >
              W{i + 1}
            </text>
          );
        })}

        {/* X axis label */}
        <text
          x={CHART_LEFT + CHART_W / 2} y={CHART_BOTTOM + 44}
          fontFamily={SANS} fontSize={height * 0.012}
          fill="#6B6B68" textAnchor="middle"
          opacity={axisOpacity}
        >
          Weeks
        </text>

        {/* Y axis label */}
        <text
          x={CHART_LEFT - 56} y={CHART_TOP + CHART_H / 2}
          fontFamily={SANS} fontSize={height * 0.012}
          fill="#6B6B68" textAnchor="middle"
          transform={`rotate(-90, ${CHART_LEFT - 56}, ${CHART_TOP + CHART_H / 2})`}
          opacity={axisOpacity}
        >
          Fluency score
        </text>

        {/* Rehearsed line (dashed grey) */}
        {rehearsedPath && (
          <path
            d={rehearsedPath}
            fill="none"
            stroke="#A9A491"
            strokeWidth={3}
            strokeDasharray="8 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Cold-read line (solid terracotta) */}
        {coldPath && (
          <path
            d={coldPath}
            fill="none"
            stroke="#D97757"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Phase 2: Transfer annotation on cold-read line */}
        {showP2 && lineProg > 0.6 && (
          <g opacity={phase2Prog} transform={`translate(${annotX + 12}, ${annotY - 44})`}>
            <rect x={0} y={0} width={150} height={44} rx={6}
              fill="#FAF9F5" stroke="#D97757" strokeWidth={1.5} />
            <text x={10} y={17}
              fontFamily={SANS} fontSize={height * 0.012}
              fontWeight={700} fill="#D97757">
              Transfer = the learning
            </text>
            <line x1={-12} y1={44} x2={0} y2={30} stroke="#D97757" strokeWidth={1.5} />
            <text x={10} y={35}
              fontFamily={SANS} fontSize={height * 0.010}
              fill="#6B6B68">
              cold-read fluency
            </text>
          </g>
        )}

        {/* Phase 2: Rehearsal annotation */}
        {showP2 && lineProg > 0.4 && (
          <g opacity={phase2Prog} transform={`translate(${rehAnnotX - 140}, ${rehAnnotY - 50})`}>
            <rect x={0} y={0} width={138} height={40} rx={6}
              fill="#FAF9F5" stroke="#E5E3DD" strokeWidth={1.5} />
            <text x={10} y={16}
              fontFamily={SANS} fontSize={height * 0.011}
              fill="#A9A491">
              Rehearsal ≠ learning
            </text>
            <text x={10} y={30}
              fontFamily={SANS} fontSize={height * 0.010}
              fill="#A9A491">
              plateaus ~week 4–5
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        left: CHART_LEFT,
        top: CHART_TOP - 32,
        display: 'flex', gap: 28,
        opacity: axisOpacity,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width={32} height={12}>
            <line x1={0} y1={6} x2={32} y2={6}
              stroke="#A9A491" strokeWidth={2.5}
              strokeDasharray="6 4" />
          </svg>
          <span style={{ fontFamily: SANS, fontSize: height * 0.011, color: '#6B6B68' }}>
            Rehearsed-passage rate
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width={32} height={12}>
            <line x1={0} y1={6} x2={32} y2={6}
              stroke="#D97757" strokeWidth={3} />
          </svg>
          <span style={{ fontFamily: SANS, fontSize: height * 0.011, color: '#D97757', fontWeight: 600 }}>
            Cold-read fluency
          </span>
        </div>
      </div>

      {/* Phase 2 bottom rule */}
      {showP2 && (
        <div style={{
          position: 'absolute',
          left: PAD_X, bottom: height * 0.15,
          right: PAD_X,
          fontFamily: SANS, fontSize: height * 0.013,
          color: '#6B6B68', lineHeight: 1.5,
          borderTop: `1px solid #E5E3DD`, paddingTop: 10,
          opacity: phase2Prog,
        }}>
          Build cold-read checks <span style={{ color: '#D97757', fontWeight: 600 }}>every two weeks.</span>
        </div>
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
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: '#1A1A18' }}>
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
