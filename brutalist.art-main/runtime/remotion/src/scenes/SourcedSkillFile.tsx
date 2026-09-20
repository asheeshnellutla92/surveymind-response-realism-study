import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SourcedSkillFile — B04 "Claude, Sourced"
 * Code-kind beat: the source-tier skill file rendered as a Claude-skinned code block.
 * Lines stagger in to match narration pace.
 */

export const sourcedSkillFileSchema = z.object({
  sparkLine: z.string().default('Three tiers, one rule.'),
});
export type SourcedSkillFileProps = z.infer<typeof sourcedSkillFileSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const CODE_LINES: Array<{ text: string; kind: 'comment' | 'key' | 'value' | 'blank' }> = [
  { text: '# research-source-tiers.md — source filter for all platform research', kind: 'comment' },
  { text: '', kind: 'blank' },
  { text: 'TIER_1:', kind: 'key' },
  { text: '  cite: freely', kind: 'value' },
  { text: '  sources: Spotify for Artists docs, engineering blogs,', kind: 'value' },
  { text: '           SEC filings, peer-reviewed papers', kind: 'value' },
  { text: '', kind: 'blank' },
  { text: 'TIER_2:', kind: 'key' },
  { text: '  cite: with named source, flagged as "industry claim"', kind: 'value' },
  { text: '  sources: named agencies with real case numbers', kind: 'value' },
  { text: '', kind: 'blank' },
  { text: 'TIER_3:', kind: 'key' },
  { text: '  cite: never as fact', kind: 'value' },
  { text: '  flag: unsigned SEO posts, invented terminology,', kind: 'value' },
  { text: '         suspicious precision (exact formulas)', kind: 'value' },
  { text: '', kind: 'blank' },
  { text: 'TRIPWIRE:', kind: 'key' },
  { text: '  if term belongs to different platform: flag, do not repeat', kind: 'value' },
];

export const SourcedSkillFile: React.FC<SourcedSkillFileProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const blockO = ease(remap(p, 0.06, 0.18, 0, 1));

  const BLOCK_X = 280, BLOCK_Y = 170, BLOCK_W = 1360, LINE_H = 28;

  const colorFor = (kind: string) => {
    if (kind === 'comment') return '#7A9E7E';
    if (kind === 'key') return CLAUDE.SPARK;
    return CLAUDE.INK;
  };

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
        {/* Code block background */}
        <g opacity={blockO}>
          <rect x={BLOCK_X} y={BLOCK_Y} width={BLOCK_W}
            height={CODE_LINES.length * LINE_H + 60} rx={12}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
          {/* File tab */}
          <rect x={BLOCK_X} y={BLOCK_Y} width={BLOCK_W} height={42} rx={12} fill={CLAUDE.PAGE} />
          <rect x={BLOCK_X} y={BLOCK_Y + 28} width={BLOCK_W} height={14} fill={CLAUDE.PAGE} />
          <text x={BLOCK_X + 20} y={BLOCK_Y + 26} fontFamily={MONO} fontSize={13}
            fill={CLAUDE.SPARK} fontWeight={600}>
            research-source-tiers.md
          </text>
          <circle cx={BLOCK_X + BLOCK_W - 40} cy={BLOCK_Y + 21} r={5} fill='#E74C3C' />
          <circle cx={BLOCK_X + BLOCK_W - 60} cy={BLOCK_Y + 21} r={5} fill='#F39C12' />
          <circle cx={BLOCK_X + BLOCK_W - 80} cy={BLOCK_Y + 21} r={5} fill='#2ECC71' />
        </g>

        {/* Lines stagger in */}
        {CODE_LINES.map((line, i) => {
          const t0 = 0.16 + i * 0.040;
          const op = ease(remap(p, t0, t0 + 0.06, 0, 1));
          const ly = BLOCK_Y + 60 + i * LINE_H;

          if (line.kind === 'blank') return null;
          return (
            <text key={i} x={BLOCK_X + 32} y={ly} fontFamily={MONO} fontSize={15}
              fill={colorFor(line.kind)} opacity={op}>
              {line.text}
            </text>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
