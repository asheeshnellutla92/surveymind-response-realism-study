import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CurriculumStages — animated four-node curriculum progression for Denison et al. (2024).
 * An agent token sweeps through four nodes; each lights up in sequence. Stage 4 node
 * pulses in terracotta to mark the reward-tampering jump.
 */

export const curriculumStagesSchema = z.object({
  handle: z.string().default('@NikBearBrown'),
});
export type CurriculumStagesProps = z.infer<typeof curriculumStagesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

interface Stage {
  label: string;
  behavior: string;
  samples: string;
  tamper?: boolean;
}

const STAGES: Stage[] = [
  {
    label: 'Stage 1',
    behavior: 'Flattery',
    samples: '32,768 samples\nNo oversight tamper',
  },
  {
    label: 'Stage 2',
    behavior: 'Rubric Edit',
    samples: '32,768 samples\nNo oversight tamper',
  },
  {
    label: 'Stage 3',
    behavior: 'Insubordinate Edit',
    samples: '32,768 samples\nNo oversight tamper',
  },
  {
    label: 'Stage 4',
    behavior: 'Reward Tampering',
    samples: '32,768 samples\n7 tamper cases detected',
    tamper: true,
  },
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const NODE_SPACING = 220;
const START_X = 80;
const NODE_Y = 0;
const NODE_R = 48;

export const CurriculumStages: React.FC<CurriculumStagesProps> = ({ handle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 28, stiffness: 160, mass: 0.7 } });

  // Agent token position: sweeps left→right over first 60% of duration
  const travelFrames = Math.floor(durationInFrames * 0.65);
  const totalWidth = START_X + NODE_SPACING * (STAGES.length - 1);
  const agentX = interpolate(
    frame,
    [0, travelFrames],
    [START_X - NODE_R - 10, START_X + NODE_SPACING * (STAGES.length - 1) + NODE_R],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Each node lights up when agent passes through it
  const nodeActive = (i: number) => {
    const nodeX = START_X + NODE_SPACING * i;
    return agentX >= nodeX - NODE_R;
  };

  // Stage 4 pulse after agent arrives
  const stage4ArrivedFrame = Math.floor(travelFrames * 0.85);
  const pulseFrame = Math.max(0, frame - stage4ArrivedFrame);
  const pulse = 1 + 0.07 * Math.sin(pulseFrame * 0.28);

  const canvasW = 960;
  const canvasH = 320;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0 }}>

      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 26,
        fontWeight: 700,
        color: CLAUDE.INK,
        marginBottom: 32,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
        textAlign: 'center',
      }}>
        The curriculum.
      </div>

      {/* SVG canvas */}
      <svg width={canvasW} height={canvasH} viewBox={`0 0 ${canvasW} ${canvasH}`} style={{ overflow: 'visible' }}>
        {/* Connector lines */}
        {STAGES.slice(0, -1).map((_, i) => {
          const x1 = START_X + NODE_SPACING * i + NODE_R;
          const x2 = START_X + NODE_SPACING * (i + 1) - NODE_R;
          const active = nodeActive(i + 1);
          return (
            <line key={i}
              x1={x1} y1={canvasH / 2 - 30} x2={x2} y2={canvasH / 2 - 30}
              stroke={active ? CLAUDE.SPARK : CLAUDE.BORDER}
              strokeWidth={3}
              strokeDasharray={active ? 'none' : '6 4'}
              style={{ transition: 'stroke 0.3s' }}
            />
          );
        })}

        {/* Stage nodes */}
        {STAGES.map((s, i) => {
          const cx = START_X + NODE_SPACING * i;
          const cy = canvasH / 2 - 30;
          const active = nodeActive(i);
          const isLast = i === STAGES.length - 1;
          const nodeColor = active ? (isLast ? CLAUDE.SPARK : CLAUDE.INK) : CLAUDE.BORDER;
          const scale = isLast && active ? pulse : 1;
          const nodeIn = spring({ frame: frame - i * 4, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } });
          const op = clamp(nodeIn, 0, 1);

          return (
            <g key={i} opacity={op} transform={`translate(${cx}, ${cy}) scale(${scale})`} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              {/* Circle */}
              <circle cx={0} cy={0} r={NODE_R}
                fill={active ? nodeColor : CLAUDE.PAGE}
                stroke={nodeColor}
                strokeWidth={active ? 0 : 2.5}
              />
              {/* Stage number */}
              <text x={0} y={-8} textAnchor="middle" dominantBaseline="middle"
                fontFamily={SANS} fontSize={11} fontWeight={700}
                fill={active ? CLAUDE.PAGE : CLAUDE.INK_SOFT}
                style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.label}
              </text>
              {/* Behavior label inside node */}
              <text x={0} y={8} textAnchor="middle" dominantBaseline="middle"
                fontFamily={SERIF} fontSize={13} fontWeight={700}
                fill={active ? (isLast ? CLAUDE.PAGE : CLAUDE.PAGE) : CLAUDE.INK}>
                {s.behavior.split(' ').map((word, wi) => (
                  <tspan key={wi} x={0} dy={wi === 0 ? 0 : 14}>{word}</tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* Agent token */}
        <circle cx={agentX} cy={canvasH / 2 - 30} r={10}
          fill={CLAUDE.SPARK}
          opacity={0.92}
        />

        {/* Sample count labels below each node */}
        {STAGES.map((s, i) => {
          const cx = START_X + NODE_SPACING * i;
          const active = nodeActive(i);
          const labelIn = spring({ frame: frame - (i * 6 + 14), fps, config: { damping: 24, stiffness: 110, mass: 0.9 } });
          const op = clamp(labelIn, 0, 1);
          const isLast = i === STAGES.length - 1;
          const lines = s.samples.split('\n');
          return (
            <g key={i} opacity={op}>
              {lines.map((line, li) => (
                <text key={li}
                  x={cx} y={canvasH / 2 + NODE_R + 16 + li * 18}
                  textAnchor="middle"
                  fontFamily={SANS} fontSize={12}
                  fill={isLast && li === 1 ? CLAUDE.SPARK : CLAUDE.INK_SOFT}
                  fontWeight={isLast && li === 1 ? 700 : 400}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* Arrow heads at connector ends */}
        {STAGES.slice(0, -1).map((_, i) => {
          const x = START_X + NODE_SPACING * (i + 1) - NODE_R - 2;
          const y = canvasH / 2 - 30;
          const active = nodeActive(i + 1);
          return (
            <polygon key={i}
              points={`${x},${y - 5} ${x + 9},${y} ${x},${y + 5}`}
              fill={active ? CLAUDE.SPARK : CLAUDE.BORDER}
            />
          );
        })}
      </svg>

      {/* Watermark */}
      <div style={{
        position: 'absolute',
        bottom: 28,
        right: 40,
        fontFamily: SANS,
        fontSize: 14,
        color: CLAUDE.INK,
        opacity: 0.22,
        fontWeight: 600,
        letterSpacing: '0.03em',
      }}>
        {handle}
      </div>
    </AbsoluteFill>
  );
};
