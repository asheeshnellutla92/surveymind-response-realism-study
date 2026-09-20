import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01AlignmentDrift — B01 beat for brand-archetype-classifier.
 * Enacts the narration: four brand touchpoints start aligned around a center
 * node, then each drifts in a different direction as no constraint exists.
 * Duration: 542 frames @ 30fps (18.05s)
 * Source: Branding and AI, Chapter 5 — Brand Archetypes as a System (Nina Harris).
 */
export const brandB01AlignmentDriftSchema = z.object({
  sparkLine: z.string().default('There was just never a constraint.'),
});
export type BrandB01AlignmentDriftProps = z.infer<typeof brandB01AlignmentDriftSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Four spokes: label, drift direction (x,y offsets in chart units), drift color
const NODES = [
  { label: 'Palette',   driftX: -160, driftY: -90,  color: '#7C6F9E', role: 'Visual team' },
  { label: 'Copy',      driftX:  170, driftY: -80,  color: '#4A7C59', role: 'Growth team' },
  { label: 'Design',    driftX: -140, driftY:  110, color: '#8C7057', role: 'Designer' },
  { label: 'Product',   driftX:  150, driftY:  120, color: '#5B7D8C', role: 'Product mgr' },
];

export const BrandB01AlignmentDrift: React.FC<BrandB01AlignmentDriftProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const clampedWidth = width;
  const clampedHeight = height;

  const PAD_H = clampedWidth * 0.08;
  const PAD_V = clampedHeight * 0.12;

  // Center of diagram
  const cx = clampedWidth / 2;
  const cy = clampedHeight * 0.50;

  // Aligned spoke length
  const SPOKE_LEN = clampedWidth * 0.22;

  // Node positions when aligned (evenly spaced at 45°/135°/225°/315°)
  const ALIGNED_ANGLES = [-135, -45, 135, 45]; // degrees for top-left, top-right, bottom-left, bottom-right
  const alignedPos = ALIGNED_ANGLES.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * SPOKE_LEN, y: cy + Math.sin(rad) * SPOKE_LEN };
  });

  // Title in
  const titleIn = clamp(
    spring({ frame, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Center node in
  const centerIn = clamp(
    spring({ frame: frame - 6, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Phase 1: spokes and nodes appear (frames 0–60)
  const spokeIns = NODES.map((_, i) =>
    clamp(
      spring({ frame: frame - (14 + i * 10), fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }),
      0, 1
    )
  );

  // "Consistent" label in phase 1
  const consistentIn = clamp(interpolate(frame, [55, 75], [0, 1]), 0, 1);

  // Phase 2: drift starts at frame 60
  const driftSprings = NODES.map((_, i) =>
    clamp(
      spring({ frame: frame - (60 + i * 12), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
      0, 1
    )
  );

  // "No constraint" terracotta label
  const noConstraintIn = clamp(
    spring({ frame: frame - 110, fps, config: { damping: 26, stiffness: 100, mass: 1 } }),
    0, 1
  );

  const footerIn = clamp(interpolate(frame, [50, 70], [0, 1]), 0, 1);

  // Compute current node positions (lerp from aligned to drifted)
  const currentPos = NODES.map((node, i) => {
    const drift = driftSprings[i];
    const aligned = alignedPos[i];
    return {
      x: aligned.x + node.driftX * drift,
      y: aligned.y + node.driftY * drift,
    };
  });

  // Node radius
  const NODE_R = clampedWidth * 0.088;
  const CENTER_R = clampedWidth * 0.068;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: PAD_V * 0.45,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SERIF,
        fontSize: Math.round(clampedHeight * 0.075),
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Without an archetype
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Subtitle */}
      <div style={{
        position: 'absolute',
        top: PAD_V * 0.45 + clampedHeight * 0.058,
        left: PAD_H,
        fontFamily: SANS,
        fontSize: Math.round(clampedHeight * 0.022),
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        Four brand touchpoints, no shared constraint — nobody is wrong.
      </div>

      {/* SVG diagram */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        width={clampedWidth}
        height={clampedHeight}
      >
        {/* Spokes and outer nodes */}
        {NODES.map((node, i) => {
          const spokeIn = spokeIns[i];
          const pos = currentPos[i];
          const drift = driftSprings[i];
          const aligned = alignedPos[i];

          // Spoke color transitions from INK to node.color as it drifts
          const spokeColor = drift > 0.05
            ? `color-mix(in srgb, ${node.color} ${Math.round(drift * 70)}%, ${CLAUDE.BORDER})`
            : CLAUDE.BORDER;

          return (
            <g key={node.label} opacity={spokeIn}>
              {/* Spoke line */}
              <line
                x1={cx} y1={cy}
                x2={pos.x} y2={pos.y}
                stroke={drift > 0.05 ? node.color : CLAUDE.BORDER}
                strokeWidth={drift > 0.05 ? 1.5 + drift : 1.5}
                strokeOpacity={0.5 + drift * 0.4}
                strokeDasharray={drift > 0.5 ? '6 4' : 'none'}
              />

              {/* Outer node circle */}
              <circle
                cx={pos.x} cy={pos.y}
                r={NODE_R}
                fill={drift > 0.05 ? `${node.color}18` : CLAUDE.FOOTER}
                stroke={drift > 0.05 ? node.color : CLAUDE.BORDER}
                strokeWidth={drift > 0.05 ? 2 : 1}
              />

              {/* Node label */}
              <text
                x={pos.x} y={pos.y - 12}
                fontFamily={SANS} fontSize={25} fontWeight={700}
                fill={drift > 0.05 ? node.color : CLAUDE.INK}
                textAnchor="middle"
              >
                {node.label}
              </text>
              <text
                x={pos.x} y={pos.y + 16}
                fontFamily={SANS} fontSize={20}
                fill={drift > 0.05 ? node.color : CLAUDE.INK_SOFT}
                textAnchor="middle"
              >
                {node.role}
              </text>

              {/* Drift annotation */}
              {drift > 0.5 && (
                <text
                  x={pos.x} y={pos.y + 46}
                  fontFamily={SANS} fontSize={24}
                  fill={node.color}
                  textAnchor="middle"
                  opacity={clamp((drift - 0.5) * 2, 0, 1)}
                >
                  drifted
                </text>
              )}
            </g>
          );
        })}

        {/* Center "Brand" node */}
        <g opacity={centerIn}>
          <circle
            cx={cx} cy={cy}
            r={CENTER_R}
            fill={CLAUDE.CARD}
            stroke={noConstraintIn > 0.1 ? CLAUDE.SPARK : CLAUDE.BORDER}
            strokeWidth={noConstraintIn > 0.1 ? 2.5 : 1.5}
          />
          <text
            x={cx} y={cy - 8}
            fontFamily={SERIF} fontSize={32} fontWeight={700}
            fill={CLAUDE.INK} textAnchor="middle"
          >
            Brand
          </text>
          <text
            x={cx} y={cy + 24}
            fontFamily={SANS} fontSize={20}
            fill={CLAUDE.INK_SOFT} textAnchor="middle"
          >
            no archetype
          </text>
        </g>

        {/* "Consistent" label — phase 1 only */}
        {frame < 90 && (
          <g opacity={consistentIn * (1 - clamp(interpolate(frame, [75, 90], [0, 1]), 0, 1))}>
            <rect
              x={cx - 96} y={cy + CENTER_R + 14}
              width={192} height={40}
              rx={5}
              fill={`rgba(74,124,89,0.10)`}
              stroke={'#4A7C59'}
            />
            <text
              x={cx} y={cy + CENTER_R + 42}
              fontFamily={SANS} fontSize={26} fontWeight={700}
              fill={'#4A7C59'} textAnchor="middle"
            >
              Consistent.
            </text>
          </g>
        )}
      </svg>

      {/* "No constraint" terracotta label — phase 2 */}
      {frame >= 90 && (
        <div style={{
          position: 'absolute',
          left: cx - 90,
          top: cy + CENTER_R + 14,
          background: `rgba(217,119,87,0.10)`,
          border: `1.5px solid ${CLAUDE.SPARK}`,
          borderRadius: 6,
          padding: '9px 27px',
          fontFamily: SANS,
          fontSize: Math.round(clampedHeight * 0.027),
          fontWeight: 700,
          color: CLAUDE.SPARK,
          opacity: noConstraintIn,
          transform: `scale(${0.85 + noConstraintIn * 0.15})`,
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
          No constraint.
        </div>
      )}

      {/* Footer sparkLine */}
      <div style={{
        position: 'absolute',
        bottom: clampedHeight * 0.04,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SANS,
        fontSize: Math.round(clampedHeight * 0.034),
        color: CLAUDE.INK_SOFT,
        opacity: footerIn,
        borderTop: `1px solid ${CLAUDE.BORDER}`,
        paddingTop: 10,
      }}>
        <span style={{ color: CLAUDE.SPARK, fontWeight: 700, marginRight: 8 }}>The problem:</span>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
