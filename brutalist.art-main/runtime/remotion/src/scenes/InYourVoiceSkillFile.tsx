import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InYourVoiceSkillFile — B01 "Claude, In Your Voice"
 * Code-kind: artist brand-voice skill file rendered as staggered code block.
 */

export const inYourVoiceSkillFileSchema = z.object({
  sparkLine: z.string().default('Your voice, versioned.'),
});
export type InYourVoiceSkillFileProps = z.infer<typeof inYourVoiceSkillFileSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const CODE_LINES: Array<{ text: string; kind: 'comment' | 'key' | 'value' | 'blank' }> = [
  { text: '# artist-brand-voice.md — your voice, saved in a file', kind: 'comment' },
  { text: '', kind: 'blank' },
  { text: 'TONE:', kind: 'key' },
  { text: '  - direct and warm, never corporate', kind: 'value' },
  { text: '  - sentence length: short. fragments allowed.', kind: 'value' },
  { text: '', kind: 'blank' },
  { text: 'BANNED_PHRASES:', kind: 'key' },
  { text: '  - "journey", "authentic", "passionate"', kind: 'value' },
  { text: '  - any phrase that could belong to anyone else', kind: 'value' },
  { text: '', kind: 'blank' },
  { text: 'PLATFORM_DEFAULTS:', kind: 'key' },
  { text: '  instagram: visual-first caption, emoji allowed, ≤ 150 chars', kind: 'value' },
  { text: '  x_twitter: punchy opener, no hashtag soup', kind: 'value' },
  { text: '  newsletter: first person, story opens the paragraph', kind: 'value' },
  { text: '', kind: 'blank' },
  { text: 'RED_LINES:', kind: 'key' },
  { text: '  ask_before_naming: any collaborator or venue', kind: 'value' },
  { text: '  flag_numeric_claims: engagement rates, listener counts', kind: 'value' },
];

export const InYourVoiceSkillFile: React.FC<InYourVoiceSkillFileProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const blockO = ease(remap(p, 0.06, 0.18, 0, 1));
  const BLOCK_X = 280, BLOCK_Y = 160, BLOCK_W = 1360, LINE_H = 29;

  const colorFor = (kind: string) => {
    if (kind === 'comment') return '#7A9E7E';
    if (kind === 'key') return CLAUDE.SPARK;
    return CLAUDE.INK;
  };

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={blockO}>
          <rect x={BLOCK_X} y={BLOCK_Y} width={BLOCK_W} height={CODE_LINES.length * LINE_H + 60} rx={12}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
          <rect x={BLOCK_X} y={BLOCK_Y} width={BLOCK_W} height={42} rx={12} fill={CLAUDE.PAGE} />
          <rect x={BLOCK_X} y={BLOCK_Y + 28} width={BLOCK_W} height={14} fill={CLAUDE.PAGE} />
          <text x={BLOCK_X + 20} y={BLOCK_Y + 26} fontFamily={MONO} fontSize={13} fill={CLAUDE.SPARK} fontWeight={600}>
            artist-brand-voice.md
          </text>
        </g>
        {CODE_LINES.map((line, i) => {
          if (line.kind === 'blank') return null;
          const t0 = 0.16 + i * 0.038;
          const op = ease(remap(p, t0, t0 + 0.06, 0, 1));
          return (
            <text key={i} x={BLOCK_X + 32} y={BLOCK_Y + 60 + i * LINE_H}
              fontFamily={MONO} fontSize={15} fill={colorFor(line.kind)} opacity={op}>
              {line.text}
            </text>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
