import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandArchetypeWheel — C02 brand-archetype-classifier centerpiece.
 * 12-archetype wheel (Mark & Pearson) with primary archetype lighting in terracotta,
 * shadow arc dimming beside it, and three downstream forcing-function decisions
 * appearing as branching nodes.
 * Source: Branding and AI, Chapter 5 — Brand Archetypes as a System (Nina Harris).
 */
export const brandArchetypeWheelSchema = z.object({
  primaryArchetype: z.string().default('Innocent'),
  shadowArchetype: z.string().default('Orphan'),
  forcingFunctions: z.array(z.string()).default([
    'Copy tone: warmth, not urgency',
    'Visual: bright palette, no dark',
    'Features: simplicity first',
  ]),
});
export type BrandArchetypeWheelProps = z.infer<typeof brandArchetypeWheelSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const ARCHETYPES = [
  'Innocent', 'Sage', 'Explorer', 'Hero',
  'Outlaw', 'Magician', 'Everyman', 'Lover',
  'Jester', 'Caregiver', 'Creator', 'Ruler',
];

export const BrandArchetypeWheel: React.FC<BrandArchetypeWheelProps> = ({
  primaryArchetype, shadowArchetype, forcingFunctions,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const wheelIn = clamp(spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 1 } }), 0, 1);
  const labelIn = clamp(spring({ frame: frame - 20, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1);

  const ffSprings = forcingFunctions.map((_, i) =>
    clamp(spring({ frame: frame - (35 + i * 12), fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1)
  );
  const sourceIn = clamp(interpolate(frame, [65, 80], [0, 1]), 0, 1);

  const CX = width * 0.38;
  const CY = height * 0.5;
  const R_OUTER = Math.min(width, height) * 0.30;
  const R_INNER = R_OUTER * 0.52;
  const N = ARCHETYPES.length;

  const primaryIdx = ARCHETYPES.indexOf(primaryArchetype);
  const shadowIdx = ARCHETYPES.indexOf(shadowArchetype);

  const sliceAngle = (2 * Math.PI) / N;

  const arcPath = (i: number) => {
    const startAngle = i * sliceAngle - Math.PI / 2 - sliceAngle / 2;
    const endAngle = startAngle + sliceAngle;
    const gap = 0.03;
    const x1 = CX + R_INNER * Math.cos(startAngle + gap);
    const y1 = CY + R_INNER * Math.sin(startAngle + gap);
    const x2 = CX + R_OUTER * Math.cos(startAngle + gap);
    const y2 = CY + R_OUTER * Math.sin(startAngle + gap);
    const x3 = CX + R_OUTER * Math.cos(endAngle - gap);
    const y3 = CY + R_OUTER * Math.sin(endAngle - gap);
    const x4 = CX + R_INNER * Math.cos(endAngle - gap);
    const y4 = CY + R_INNER * Math.sin(endAngle - gap);
    return `M ${x1} ${y1} L ${x2} ${y2} A ${R_OUTER} ${R_OUTER} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${R_INNER} ${R_INNER} 0 0 0 ${x1} ${y1} Z`;
  };

  const labelPos = (i: number) => {
    const angle = i * sliceAngle - Math.PI / 2;
    const r = (R_INNER + R_OUTER) / 2;
    return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
  };

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.06,
        left: width * 0.06,
        right: width * 0.06,
        fontFamily: SERIF,
        fontSize: 36,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Archetype Classifier Output
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Wheel */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {ARCHETYPES.map((name, i) => {
          const isPrimary = i === primaryIdx;
          const isShadow = i === shadowIdx;
          let fill: string = CLAUDE.BORDER;
          if (isPrimary) fill = CLAUDE.SPARK;
          else if (isShadow) fill = CLAUDE.INK_SOFT;

          const opacity = isPrimary
            ? wheelIn
            : isShadow
            ? wheelIn * 0.55
            : wheelIn * 0.3;

          const lp = labelPos(i);
          return (
            <g key={name} opacity={opacity}>
              <path d={arcPath(i)} fill={fill} />
              <text
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={R_OUTER > 160 ? 12 : 10}
                fontFamily={SANS}
                fontWeight={isPrimary ? 700 : 500}
                fill={isPrimary ? '#fff' : isShadow ? CLAUDE.CARD : CLAUDE.INK}
                style={{ opacity: labelIn }}
              >
                {name}
              </text>
            </g>
          );
        })}
        {/* Center label */}
        <text
          x={CX}
          y={CY - 14}
          textAnchor="middle"
          fontSize={16}
          fontFamily={SANS}
          fontWeight={700}
          fill={CLAUDE.INK}
          opacity={labelIn}
        >
          Primary
        </text>
        <text
          x={CX}
          y={CY + 10}
          textAnchor="middle"
          fontSize={22}
          fontFamily={SERIF}
          fontWeight={700}
          fill={CLAUDE.SPARK}
          opacity={labelIn}
        >
          {primaryArchetype}
        </text>
        <text
          x={CX}
          y={CY + 34}
          textAnchor="middle"
          fontSize={13}
          fontFamily={SANS}
          fill={CLAUDE.INK_SOFT}
          opacity={labelIn}
        >
          Shadow: {shadowArchetype}
        </text>
      </svg>

      {/* Forcing functions panel */}
      <div style={{
        position: 'absolute',
        right: width * 0.05,
        top: height * 0.25,
        width: width * 0.28,
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: 13,
          fontWeight: 700,
          color: CLAUDE.INK_SOFT,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 14,
          opacity: ffSprings[0] ?? 0,
        }}>
          Forcing Functions →
        </div>
        {forcingFunctions.map((ff, i) => (
          <div key={i} style={{
            marginBottom: 12,
            padding: '12px 16px',
            background: CLAUDE.CARD,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 10,
            borderLeft: `3px solid ${CLAUDE.SPARK}`,
            opacity: ffSprings[i],
            transform: `translateX(${(1 - (ffSprings[i] ?? 0)) * 20}px)`,
          }}>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: CLAUDE.INK, fontWeight: 600 }}>
              {ff}
            </div>
          </div>
        ))}
      </div>

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        right: width * 0.05,
        fontFamily: SANS,
        fontSize: 12,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 5
      </div>
    </AbsoluteFill>
  );
};
