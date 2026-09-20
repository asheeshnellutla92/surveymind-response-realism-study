import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HorrorComplication — B03 for "The Math of Being Afraid Together"
 * Source: Zebonastic essay by Seth Brown & Humanitarians AI, May 17 2026.
 *
 * Two sub-panels:
 * (a) Fear curve: solo vs co-op — flatter trough, sharper/taller spikes.
 * (b) Contagion: three circle-nodes; one flashes, panic propagates.
 *
 * Terracotta accent: the contagion flash propagating (the single vivid moment).
 * One terracotta moment per beat (CLAUDE-BRAND.md).
 */

export const horrorComplicationSchema = z.object({
  sparkLine: z.string().default('Panic transmits before the monster does.'),
});
export type HorrorComplicationProps = z.infer<typeof horrorComplicationSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Phase timing
const PHASE_TITLE_IN = 0;
const PHASE_CURVE_IN = 20;
const PHASE_COOP_IN = 80;
const PHASE_NODES_IN = 130;
const PHASE_CONTAGION = 180;
const PHASE_SPINE_IN = 220;
const PHASE_SPARK_IN = 250;

// Simple SVG fear curve paths
// Solo: smoother sine wave
const soloPoints = (w: number, h: number): string => {
  const pts = [];
  for (let x = 0; x <= w; x += 4) {
    const t = x / w;
    const y = h * 0.5 - h * 0.32 * Math.sin(t * Math.PI * 3.5);
    pts.push(`${x},${y}`);
  }
  return pts.join(' ');
};

// Co-op: flatter troughs, sharper spikes
const coopPoints = (w: number, h: number): string => {
  const pts = [];
  for (let x = 0; x <= w; x += 4) {
    const t = x / w;
    // Flatter base, concentrated spikes
    const base = Math.sin(t * Math.PI * 3.5);
    const spike = Math.max(0, Math.sin(t * Math.PI * 7)) ** 3;
    const y = h * 0.5 - h * 0.18 * base - h * 0.38 * spike;
    pts.push(`${x},${y}`);
  }
  return pts.join(' ');
};

export const HorrorComplication: React.FC<HorrorComplicationProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame: frame - PHASE_TITLE_IN, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const curveIn = spring({ frame: frame - PHASE_CURVE_IN, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const coopIn = spring({ frame: frame - PHASE_COOP_IN, fps, config: { damping: 22, stiffness: 110, mass: 0.8 } });
  const nodesIn = spring({ frame: frame - PHASE_NODES_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const contagionIn = spring({ frame: frame - PHASE_CONTAGION, fps, config: { damping: 16, stiffness: 180, mass: 0.6 } });
  const spineIn = spring({ frame: frame - PHASE_SPINE_IN, fps, config: { damping: 26, stiffness: 110, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  // Chart dimensions
  const chartW = width * 0.38;
  const chartH = height * 0.32;
  const chartLeft = PAD_X + width * 0.02;
  const chartTop = height * 0.31;

  // Contagion node positions
  const nodeCX = width * 0.62;
  const nodeCY = height * 0.52;
  const nodeR = 28;
  const nodePositions = [
    { x: nodeCX, y: nodeCY - 100 },       // top — source
    { x: nodeCX - 110, y: nodeCY + 60 },  // bottom-left
    { x: nodeCX + 110, y: nodeCY + 60 },  // bottom-right
  ];

  // Contagion propagation: source flashes at t=0, others follow
  const contagionP = clamp(contagionIn, 0, 1);
  const node1Flash = contagionP;                                    // source — terracotta
  const node2Flash = clamp(contagionP * 2 - 0.8, 0, 1);           // delayed
  const node3Flash = clamp(contagionP * 2 - 1.0, 0, 1);           // delayed

  const nodeColors = [
    { fill: interpolateColor('#FFFFFF', CLAUDE.SPARK, node1Flash), stroke: interpolateColor(CLAUDE.BORDER, CLAUDE.SEND, node1Flash) },
    { fill: interpolateColor('#FFFFFF', CLAUDE.SPARK, node2Flash * 0.7), stroke: interpolateColor(CLAUDE.BORDER, CLAUDE.SPARK, node2Flash * 0.7) },
    { fill: interpolateColor('#FFFFFF', CLAUDE.SPARK, node3Flash * 0.7), stroke: interpolateColor(CLAUDE.BORDER, CLAUDE.SPARK, node3Flash * 0.7) },
  ];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        STEP 2 · THE COMPLICATION
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        A group is several nervous systems wired together.
      </div>

      {/* ─── Panel A: Fear curves ─── */}
      <div style={{
        position: 'absolute',
        left: chartLeft - 10,
        top: chartTop - height * 0.08,
        fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
        letterSpacing: 2, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(curveIn, 0, 1),
      }}>
        (a) Fear over time
      </div>

      <svg style={{
        position: 'absolute',
        left: chartLeft,
        top: chartTop,
        opacity: clamp(curveIn, 0, 1),
      }}
        width={chartW} height={chartH}
        viewBox={`0 0 ${chartW} ${chartH}`}
      >
        {/* Axes */}
        <line x1={30} y1={chartH - 20} x2={chartW - 10} y2={chartH - 20} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
        <line x1={30} y1={10} x2={30} y2={chartH - 20} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
        {/* Axis labels */}
        <text x={chartW / 2} y={chartH - 2} fontFamily={SANS} fontSize={10} fill={CLAUDE.INK_SOFT} textAnchor="middle">time</text>
        <text x={8} y={chartH / 2} fontFamily={SANS} fontSize={10} fill={CLAUDE.INK_SOFT} textAnchor="middle" transform={`rotate(-90, 8, ${chartH / 2})`}>fear</text>

        {/* Solo curve — ink, always visible */}
        <polyline
          points={soloPoints(chartW - 40, chartH - 40).split(' ').map(p => {
            const [px, py] = p.split(',');
            return `${Number(px) + 30},${Number(py) + 10}`;
          }).join(' ')}
          fill="none"
          stroke={CLAUDE.INK_SOFT}
          strokeWidth={2.5}
          strokeDasharray="6,4"
          strokeLinecap="round"
        />
        {/* Solo label */}
        <text x={chartW - 40} y={chartH * 0.25} fontFamily={SANS} fontSize={11} fill={CLAUDE.INK_SOFT} textAnchor="end">solo</text>

        {/* Co-op curve — ink, fades in later */}
        <polyline
          points={coopPoints(chartW - 40, chartH - 40).split(' ').map(p => {
            const [px, py] = p.split(',');
            return `${Number(px) + 30},${Number(py) + 10}`;
          }).join(' ')}
          fill="none"
          stroke={CLAUDE.INK}
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={clamp(coopIn, 0, 1)}
        />
        {/* Co-op label */}
        <text x={chartW - 40} y={chartH * 0.08} fontFamily={SANS} fontSize={11} fill={CLAUDE.INK} textAnchor="end" opacity={clamp(coopIn, 0, 1)}>co-op</text>
      </svg>

      {/* Curve legend */}
      <div style={{
        position: 'absolute',
        left: chartLeft,
        top: chartTop + chartH + 8,
        display: 'flex',
        gap: 24,
        opacity: clamp(coopIn, 0, 1),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 2.5, background: CLAUDE.INK_SOFT, borderRadius: 2 }} />
          <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>solo — smooth</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 2.5, background: CLAUDE.INK, borderRadius: 2 }} />
          <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK }}>co-op — flatter trough, sharper spikes</span>
        </div>
      </div>

      {/* ─── Panel B: Contagion ─── */}
      <div style={{
        position: 'absolute',
        left: width * 0.54,
        top: height * 0.24,
        fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
        letterSpacing: 2, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(nodesIn, 0, 1),
      }}>
        (b) Panic contagion
      </div>

      {/* Node connections */}
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={width} height={height}>
        {nodePositions.map((pos, i) =>
          nodePositions.slice(i + 1).map((pos2, j) => (
            <line key={`${i}-${j}`}
              x1={pos.x} y1={pos.y} x2={pos2.x} y2={pos2.y}
              stroke={CLAUDE.BORDER} strokeWidth={2}
              opacity={clamp(nodesIn, 0, 1)}
            />
          ))
        )}
        {/* Propagation lines glow */}
        {[
          { x1: nodePositions[0].x, y1: nodePositions[0].y, x2: nodePositions[1].x, y2: nodePositions[1].y, progress: node2Flash },
          { x1: nodePositions[0].x, y1: nodePositions[0].y, x2: nodePositions[2].x, y2: nodePositions[2].y, progress: node3Flash },
        ].map((line, i) => (
          <line key={`glow-${i}`}
            x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
            stroke={CLAUDE.SPARK} strokeWidth={3}
            opacity={line.progress * 0.8}
          />
        ))}
        {/* Nodes */}
        {nodePositions.map((pos, i) => (
          <g key={i} opacity={clamp(nodesIn, 0, 1)}>
            <circle cx={pos.x} cy={pos.y} r={nodeR}
              fill={nodeColors[i].fill}
              stroke={nodeColors[i].stroke}
              strokeWidth={2.5}
            />
            {i === 0 && (
              <text x={pos.x} y={pos.y + 4} textAnchor="middle"
                fontFamily={SANS} fontSize={12} fill={contagionP > 0.3 ? '#FFFFFF' : CLAUDE.INK} fontWeight="700">
                PANIC
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Contagion label */}
      <div style={{
        position: 'absolute',
        left: width * 0.54,
        top: nodeCY + nodeR + 90,
        fontFamily: SERIF,
        fontSize: height * 0.015,
        color: CLAUDE.INK_SOFT,
        fontStyle: 'italic',
        opacity: clamp(spineIn, 0, 1),
      }}>
        one player's panic propagates to teammates
      </div>

      {/* Proof spine card — Step 2 */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        bottom: height * 0.15,
        width: width * 0.22,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        padding: '14px 18px',
        opacity: clamp(spineIn, 0, 1),
        transform: `translateX(${(1 - clamp(spineIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
          color: CLAUDE.SPARK, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 6,
        }}>Step 2</div>
        <div style={{
          fontFamily: SERIF, fontSize: height * 0.014, color: CLAUDE.INK, lineHeight: 1.4,
        }}>
          groups = multiple nervous systems · not averaged
        </div>
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

    </AbsoluteFill>
  );
};

// Helper: interpolate between two hex colors
function interpolateColor(from: string, to: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const clampC = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const f = parse(from), tArr = parse(to);
  return `rgb(${clampC(f[0] + (tArr[0] - f[0]) * t)},${clampC(f[1] + (tArr[1] - f[1]) * t)},${clampC(f[2] + (tArr[2] - f[2]) * t)})`;
}
