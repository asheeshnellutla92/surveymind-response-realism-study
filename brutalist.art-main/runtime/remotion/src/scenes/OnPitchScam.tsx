import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnPitchScam — B04 "Claude, On the Pitch"
 * Split frame: 'guaranteed placement' service (money in, promise out) vs real pitch work.
 */

export const onPitchScamSchema = z.object({
  sparkLine: z.string().default('The scam, for contrast.'),
});
export type OnPitchScamProps = z.infer<typeof onPitchScamSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const OnPitchScam: React.FC<OnPitchScamProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const leftO = ease(remap(p, 0.08, 0.22, 0, 1));
  const rightO = ease(remap(p, 0.30, 0.44, 0, 1));
  const verdictO = ease(remap(p, 0.60, 0.74, 0, 1));

  const LEFT_X = 100, RIGHT_X = 1020, COL_Y = 240, COL_W = 780, COL_H = 540;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Left: the scam */}
        <g opacity={leftO}>
          <rect x={LEFT_X} y={COL_Y} width={COL_W} height={COL_H} rx={14}
            fill='#FDE8E8' stroke='#A44A32' strokeWidth={2.5} />
          <text x={LEFT_X + COL_W / 2} y={COL_Y - 20} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={800} fill='#A44A32' letterSpacing="0.1em">THE SCAM</text>
          <text x={LEFT_X + 36} y={COL_Y + 54} fontFamily={SERIF} fontSize={22} fontWeight={700} fill='#6B1A0A'>"Guaranteed Placement"</text>
          <text x={LEFT_X + 36} y={COL_Y + 82} fontFamily={SERIF} fontSize={18} fill='#6B1A0A'>Service — $299/mo</text>
          <line x1={LEFT_X + 24} y1={COL_Y + 100} x2={LEFT_X + COL_W - 24} y2={COL_Y + 100} stroke='#A44A32' strokeWidth={1} />
          {[
            '✗ "contacts in the industry" — unnamed',
            '✗ "guaranteed" with no contract terms',
            '✗ playlists you can\'t verify are heard',
            '✗ month 2: you\'re in a credits dispute',
            '✗ the receipt: money out, no placement in',
          ].map((line, i) => (
            <text key={i} x={LEFT_X + 36} y={COL_Y + 144 + i * 58}
              fontFamily={SANS} fontSize={15} fill='#6B1A0A'>{line}</text>
          ))}
        </g>

        {/* Right: real pitch work */}
        <g opacity={rightO}>
          <rect x={RIGHT_X} y={COL_Y} width={COL_W} height={COL_H} rx={14}
            fill='#D8F3DC' stroke='#2D6A4F' strokeWidth={2.5} />
          <text x={RIGHT_X + COL_W / 2} y={COL_Y - 20} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={800} fill='#2D6A4F' letterSpacing="0.1em">THE REAL WORK</text>
          <text x={RIGHT_X + 36} y={COL_Y + 54} fontFamily={SERIF} fontSize={22} fontWeight={700} fill='#1B4332'>Research-backed pitch</text>
          <text x={RIGHT_X + 36} y={COL_Y + 82} fontFamily={SERIF} fontSize={18} fill='#1B4332'>you built, you send</text>
          <line x1={RIGHT_X + 24} y1={COL_Y + 100} x2={RIGHT_X + COL_W - 24} y2={COL_Y + 100} stroke='#2D6A4F' strokeWidth={1} />
          {[
            '✓ named supervisor, verified placements',
            '✓ specific catalog match cited in pitch',
            '✓ draft reviewed by you before sending',
            '✓ you own the relationship — no middleman',
            '✓ the receipt: hours saved, relationship real',
          ].map((line, i) => (
            <text key={i} x={RIGHT_X + 36} y={COL_Y + 144 + i * 58}
              fontFamily={SANS} fontSize={15} fill='#1B4332'>{line}</text>
          ))}
        </g>

        {/* Verdict */}
        <text x={960} y={860} textAnchor="middle" fontFamily={SERIF} fontSize={22} fill={CLAUDE.SPARK}
          opacity={verdictO}>
          the bot can build the left column's pitch for free · the scammer rents you access to their Rolodex
        </text>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          ask for a citation · watch what happens
        </text>
      </svg>
    </AbsoluteFill>
  );
};
