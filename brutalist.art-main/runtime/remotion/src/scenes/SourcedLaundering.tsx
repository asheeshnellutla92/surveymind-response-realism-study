import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SourcedLaundering — B02 "Claude, Sourced"
 * Laundering chain: content farm → reblog → reblog → "common knowledge"
 * Source attribution fades out at each step.
 */

export const sourcedLaunderingSchema = z.object({
  sparkLine: z.string().default('Why the lie works.'),
});
export type SourcedLaunderingProps = z.infer<typeof sourcedLaunderingSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const NODES = [
  { label: 'Content Farm', sub: 'invents the formula', source: '"industry insiders"', sourceO: 1.0 },
  { label: 'Blog A', sub: 'reposts it verbatim', source: '"as widely reported"', sourceO: 0.5 },
  { label: 'Blog B', sub: 'cites Blog A', source: '"sources say"', sourceO: 0.25 },
  { label: 'Common Knowledge', sub: 'everyone just knows', source: null, sourceO: 0 },
];

export const SourcedLaundering: React.FC<SourcedLaunderingProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));

  const NODE_W = 260, NODE_H = 110;
  const START_X = 140, Y = 430, GAP = (1920 - START_X * 2 - NODE_W * 4) / 3;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      {/* SparkLine */}
      <div style={{
        position: 'absolute', top: 44, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        opacity: sparkO,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {NODES.map((node, i) => {
          const t0 = 0.10 + i * 0.18;
          const nodeO = ease(remap(p, t0, t0 + 0.14, 0, 1));
          const nx = START_X + i * (NODE_W + GAP);
          const isLast = i === NODES.length - 1;

          return (
            <g key={i}>
              {/* Arrow to next */}
              {i < NODES.length - 1 && (
                <g opacity={ease(remap(p, t0 + 0.14, t0 + 0.24, 0, 1))}>
                  <line
                    x1={nx + NODE_W + 10} y1={Y + NODE_H / 2}
                    x2={nx + NODE_W + GAP - 10} y2={Y + NODE_H / 2}
                    stroke={CLAUDE.INK_SOFT} strokeWidth={2.5} />
                  <polygon
                    points={`${nx + NODE_W + GAP - 10},${Y + NODE_H / 2 - 7} ${nx + NODE_W + GAP + 6},${Y + NODE_H / 2} ${nx + NODE_W + GAP - 10},${Y + NODE_H / 2 + 7}`}
                    fill={CLAUDE.INK_SOFT} />
                  {/* Source disappearing label */}
                  <text x={nx + NODE_W + GAP / 2} y={Y + NODE_H / 2 - 16} textAnchor="middle"
                    fontFamily={SANS} fontSize={11} fill={CLAUDE.SPARK}
                    opacity={Math.max(0, 0.7 - i * 0.25)}>
                    source?
                  </text>
                </g>
              )}

              {/* Node */}
              <g opacity={nodeO}>
                <rect x={nx} y={Y} width={NODE_W} height={NODE_H} rx={10}
                  fill={isLast ? CLAUDE.CARD : '#FFF8EC'}
                  stroke={isLast ? CLAUDE.INK : '#D4C8A8'}
                  strokeWidth={isLast ? 2.5 : 1.5} />
                {isLast && (
                  <rect x={nx} y={Y} width={NODE_W} height={6} rx={3} fill={CLAUDE.SPARK} />
                )}
                <text x={nx + NODE_W / 2} y={Y + 36} textAnchor="middle"
                  fontFamily={SERIF} fontSize={15} fontWeight={700}
                  fill={isLast ? CLAUDE.SPARK : '#2C2A1E'}>
                  {node.label}
                </text>
                <text x={nx + NODE_W / 2} y={Y + 58} textAnchor="middle"
                  fontFamily={SANS} fontSize={12} fill={isLast ? CLAUDE.INK : '#7A7060'}>
                  {node.sub}
                </text>
                {node.source && (
                  <text x={nx + NODE_W / 2} y={Y + 82} textAnchor="middle"
                    fontFamily={SANS} fontSize={11} fill="#A44A32" opacity={node.sourceO}
                    fontStyle="italic">
                    {node.source}
                  </text>
                )}
              </g>

              {/* Step number */}
              <text x={nx + NODE_W / 2} y={Y - 18} textAnchor="middle"
                fontFamily={SANS} fontSize={11} fontWeight={800}
                fill={CLAUDE.INK_SOFT} letterSpacing="0.12em" opacity={nodeO}>
                {i === 0 ? 'ORIGIN' : i < 3 ? `STEP ${i}` : 'RESULT'}
              </text>
            </g>
          );
        })}

        {/* Bottom call-out */}
        <text x={960} y={620} textAnchor="middle"
          fontFamily={SERIF} fontSize={22} fill="#A44A32"
          opacity={ease(remap(p, 0.75, 0.87, 0, 1))}>
          your research bot ingests step 4 and calls it verified
        </text>
        <text x={960} y={1020} textAnchor="middle"
          fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          the scammer is counting on exactly that
        </text>
      </svg>
    </AbsoluteFill>
  );
};
