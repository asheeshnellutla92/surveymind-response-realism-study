import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InYourVoiceLyricFile — B03 "Claude, In Your Voice"
 * Code-kind: lyric-writer skill excerpt with syllable cadence and banned rhymes.
 */

export const inYourVoiceLyricFileSchema = z.object({
  sparkLine: z.string().default('The lyric file, separately.'),
});
export type InYourVoiceLyricFileProps = z.infer<typeof inYourVoiceLyricFileSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const CODE_LINES: Array<{ text: string; kind: 'comment' | 'key' | 'value' | 'blank' }> = [
  { text: '# lyric-writer.md — kept separate from brand-voice', kind: 'comment' },
  { text: '# why separate: lyrics are for you, captions are for platforms', kind: 'comment' },
  { text: '', kind: 'blank' },
  { text: 'CADENCE:', kind: 'key' },
  { text: '  syllable_pattern: "stress on the downbeat, rest on 3"', kind: 'value' },
  { text: '  line_length: short (≤ 8 syllables) for hooks', kind: 'value' },
  { text: '  bridge_exception: longer lines allowed, one breath', kind: 'value' },
  { text: '', kind: 'blank' },
  { text: 'BANNED_RHYMES:', kind: 'key' },
  { text: '  - fire / desire   # overused', kind: 'value' },
  { text: '  - night / light   # cliché', kind: 'value' },
  { text: '  - heart / apart   # only if you mean it literally', kind: 'value' },
  { text: '', kind: 'blank' },
  { text: 'REFERENCE_TRACKS:', kind: 'key' },
  { text: '  - [your track] — the tension in verse 2', kind: 'value' },
  { text: '  - [your track] — the resolution pattern in the bridge', kind: 'value' },
  { text: '', kind: 'blank' },
  { text: '# This file is NOT the brand-voice file.', kind: 'comment' },
  { text: '# The lyric file is for creative drafts only.', kind: 'comment' },
];

export const InYourVoiceLyricFile: React.FC<InYourVoiceLyricFileProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const blockO = ease(remap(p, 0.06, 0.18, 0, 1));
  const BLOCK_X = 280, BLOCK_Y = 120, BLOCK_W = 1360, LINE_H = 28;

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
          <rect x={BLOCK_X} y={BLOCK_Y} width={BLOCK_W} height={CODE_LINES.length * LINE_H + 56} rx={12}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
          <rect x={BLOCK_X} y={BLOCK_Y} width={BLOCK_W} height={42} rx={12} fill={CLAUDE.PAGE} />
          <rect x={BLOCK_X} y={BLOCK_Y + 28} width={BLOCK_W} height={14} fill={CLAUDE.PAGE} />
          <text x={BLOCK_X + 20} y={BLOCK_Y + 26} fontFamily={MONO} fontSize={13} fill={CLAUDE.SPARK} fontWeight={600}>
            lyric-writer.md
          </text>
        </g>
        {CODE_LINES.map((line, i) => {
          if (line.kind === 'blank') return null;
          const t0 = 0.16 + i * 0.036;
          const op = ease(remap(p, t0, t0 + 0.06, 0, 1));
          return (
            <text key={i} x={BLOCK_X + 32} y={BLOCK_Y + 56 + i * LINE_H}
              fontFamily={MONO} fontSize={14} fill={colorFor(line.kind)} opacity={op}>
              {line.text}
            </text>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
