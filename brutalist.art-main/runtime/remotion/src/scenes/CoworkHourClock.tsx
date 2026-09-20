import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CoworkHourClock — the sixty-minute pie clock for claude-liam-1hr-cowork.
 *
 * Six wedges representing the setup plan:
 *   1. Build Your Folder       (10 min)
 *   2. Global Instructions     (10 min)
 *   3. Create a Project        (10 min)
 *   4. Write Your Markdown     (15 min) — biggest wedge
 *   5. Run Your First Task     ( 5 min) — smallest wedge
 *   6. Plugins/Connectors      (10 min)
 *
 * activeWedge = 0  → all wedges muted (overview beat)
 * activeWedge = 1–6 → that wedge highlights in SPARK terracotta; others muted
 *
 * NBB logo bug rule: "@NikBearBrown" watermark at low opacity, lower-right.
 */

export const coworkHourClockSchema = z.object({
  /** 0 = overview (all muted), 1–6 = active wedge index */
  activeWedge: z.number().int().min(0).max(6).default(0),
  /** Label shown below the clock (the wedge name or overview caption) */
  label: z.string().default('The sixty-minute plan.'),
  /** Footer handle chip — always @NikBearBrown for this series */
  handle: z.string().default('@NikBearBrown'),
});
export type CoworkHourClockProps = z.infer<typeof coworkHourClockSchema>;

// Wedge definitions: [name, minutes, startAngle degrees from top (12 o'clock = -90)]
// Total = 60 min. Angles computed from proportions.
const WEDGES = [
  { name: 'Build Your Folder',    minutes: 10, label: '10 min' },
  { name: 'Global Instructions',  minutes: 10, label: '10 min' },
  { name: 'Create a Project',     minutes: 10, label: '10 min' },
  { name: 'Write Your Markdown',  minutes: 15, label: '15 min' },
  { name: 'Run Your First Task',  minutes:  5, label: ' 5 min' },
  { name: 'Plugins & Connectors', minutes: 10, label: '10 min' },
];
const TOTAL_MIN = 60;

// Muted wedge color (cream-side of the palette, low contrast)
const MUTED = '#E5E2D9';   // CLAUDE.BORDER
const ACTIVE = CLAUDE.SPARK; // terracotta accent

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180); // -90 so 0° is 12 o'clock
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function wedgePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number, gap = 1.5): string {
  // gap in degrees between wedges
  const s = startDeg + gap / 2;
  const e = endDeg - gap / 2;
  const p1 = polarToXY(cx, cy, r, s);
  const p2 = polarToXY(cx, cy, r, e);
  const largeArc = (e - s) > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${p1.x} ${p1.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    'Z',
  ].join(' ');
}

// Build cumulative start angles
function buildAngles() {
  const angles: { start: number; end: number }[] = [];
  let cursor = 0;
  for (const w of WEDGES) {
    const span = (w.minutes / TOTAL_MIN) * 360;
    angles.push({ start: cursor, end: cursor + span });
    cursor += span;
  }
  return angles;
}
const ANGLES = buildAngles();

export const CoworkHourClock: React.FC<CoworkHourClockProps> = ({
  activeWedge, label, handle,
}) => {
  const frame = useCurrentFrame();
  const { fps: vfps, width: vw, height: vh } = useVideoConfig();

  const clockIn = spring({ frame, fps: vfps, config: { damping: 26, stiffness: 120, mass: 0.9 } });
  const labelIn = spring({ frame: frame - 12, fps: vfps, config: { damping: 28, stiffness: 130, mass: 0.8 } });

  const CX = vw / 2;
  const CY = vh * 0.48;
  const R = Math.min(vw, vh) * 0.28;
  const INNER_R = R * 0.30; // donut hole

  // Center text (total time)
  const CENTER_FONT = R * 0.22;
  const CENTER_SUB  = R * 0.11;

  // Label positions per wedge (for tick marks at midpoint of arc)
  return (
    <AbsoluteFill style={{
      backgroundColor: CLAUDE.PAGE,
      overflow: 'hidden',
    }}>

      {/* SVG clock */}
      <svg
        width={vw}
        height={vh}
        viewBox={`0 0 ${vw} ${vh}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Render wedges */}
        {WEDGES.map((wedge, i) => {
          const { start, end } = ANGLES[i];
          const isActive = activeWedge === i + 1;
          const fill = isActive ? ACTIVE : MUTED;
          const opacity = clockIn;

          // For the active wedge, scale up slightly
          const scale = isActive ? interpolate(frame, [0, 18], [0.95, 1.0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          }) : 1;

          const midAngle = (start + end) / 2;
          const labelR = R * 0.70;
          const lp = polarToXY(CX, CY, labelR, midAngle);

          // Outer label: short name at outside of wedge
          const outerLabelR = R * 1.18;
          const op = polarToXY(CX, CY, outerLabelR, midAngle);
          const labelSize = Math.max(14, R * 0.085);
          const minLabelSize = Math.max(12, R * 0.068);

          return (
            <g key={i} style={{ opacity, transform: `scale(${scale})`, transformOrigin: `${CX}px ${CY}px` }}>
              {/* Wedge fill */}
              <path
                d={wedgePath(CX, CY, R, start, end)}
                fill={fill}
                style={{ transition: 'fill 0.3s ease' }}
              />
              {/* Donut hole mask — draw white circle over center */}

              {/* Minute label inside wedge */}
              <text
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive ? '#FFFFFF' : CLAUDE.INK_SOFT}
                fontSize={minLabelSize}
                fontFamily={CLAUDE_FONT.ui}
                fontWeight={isActive ? 700 : 400}
                style={{ opacity: isActive ? 1 : 0.7 }}
              >
                {wedge.label.trim()}
              </text>

              {/* Outer wedge name — only when active or overview (activeWedge=0) */}
              {(activeWedge === 0 || isActive) && (
                <text
                  x={op.x}
                  y={op.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isActive ? CLAUDE.SPARK : CLAUDE.INK_SOFT}
                  fontSize={labelSize * (isActive ? 1 : 0.85)}
                  fontFamily={CLAUDE_FONT.ui}
                  fontWeight={isActive ? 700 : 400}
                  style={{ opacity: isActive ? 1 : 0.55 }}
                >
                  {i + 1}. {wedge.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Donut hole — white circle over center */}
        <circle cx={CX} cy={CY} r={INNER_R} fill={CLAUDE.PAGE} style={{ opacity: clockIn }} />

        {/* Center text */}
        <text
          x={CX}
          y={CY - CENTER_FONT * 0.2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={CLAUDE.INK}
          fontSize={CENTER_FONT}
          fontFamily={CLAUDE_FONT.serif}
          fontWeight={700}
          style={{ opacity: clockIn }}
        >
          60
        </text>
        <text
          x={CX}
          y={CY + CENTER_FONT * 0.55}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={CLAUDE.INK_SOFT}
          fontSize={CENTER_SUB}
          fontFamily={CLAUDE_FONT.ui}
          style={{ opacity: clockIn * 0.8 }}
        >
          min
        </text>

        {/* Terracotta bottom rule — brand signature */}
        <rect
          x={vw * 0.08}
          y={vh * 0.93}
          width={vw * 0.08}
          height={2}
          fill={CLAUDE.SPARK}
          style={{ opacity: clockIn }}
        />
      </svg>

      {/* Label below clock */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: vh * 0.10,
        textAlign: 'center',
        fontFamily: CLAUDE_FONT.serif,
        fontSize: vh * 0.034,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: labelIn,
        transform: `translateY(${(1 - labelIn) * 10}px)`,
        padding: '0 10%',
      }}>
        {label}
      </div>

      {/* @NikBearBrown watermark — lower-right, low opacity (NBB logo bug rule) */}
      <div style={{
        position: 'absolute',
        right: vw * 0.04,
        bottom: vh * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: vh * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        {handle}
      </div>

    </AbsoluteFill>
  );
};
