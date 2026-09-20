import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InYourVoiceMoat — B05 "Claude, In Your Voice"
 * Many identical bot-caption cards vs one card in the artist's distinct voice.
 */

export const inYourVoiceMoatSchema = z.object({
  sparkLine: z.string().default('The voice is the moat.'),
});
export type InYourVoiceMoatProps = z.infer<typeof inYourVoiceMoatSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const GENERIC_CAPTIONS = [
  '"Excited to share this with you!"',
  '"So grateful for your support 🙏"',
  '"New music — hope you love it!"',
  '"Check out my latest release!"',
  '"Dropping this for all my fans ❤️"',
  '"This one comes from the heart."',
];

export const InYourVoiceMoat: React.FC<InYourVoiceMoatProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const labelO = ease(remap(p, 0.08, 0.18, 0, 1));
  const distO = ease(remap(p, 0.62, 0.76, 0, 1));

  const CARD_W = 260, CARD_H = 80, COLS = 3, ROWS = 2;
  const START_X = 160, START_Y = 280, GAP_X = 280, GAP_Y = 100;

  const MOAT_X = 1200, MOAT_Y = 260, MOAT_W = 440, MOAT_H = 300;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Generic caption grid */}
        <g opacity={labelO}>
          <text x={START_X + (COLS * CARD_W + (COLS - 1) * (GAP_X - CARD_W)) / 2} y={START_Y - 26}
            textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={800}
            fill='#A44A32' letterSpacing="0.1em">
            GENERIC — COULD BE ANYONE
          </text>
        </g>
        {GENERIC_CAPTIONS.map((cap, i) => {
          const col = i % COLS, row = Math.floor(i / COLS);
          const t0 = 0.12 + i * 0.06;
          const op = ease(remap(p, t0, t0 + 0.10, 0, 1));
          const cx = START_X + col * GAP_X;
          const cy = START_Y + row * GAP_Y;
          return (
            <g key={i} opacity={op}>
              <rect x={cx} y={cy} width={CARD_W} height={CARD_H} rx={8}
                fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1} />
              <text x={cx + 14} y={cy + 28} fontFamily={SANS} fontSize={12} fill={CLAUDE.INK_SOFT}>{cap.slice(0, 26)}</text>
              {cap.length > 26 && <text x={cx + 14} y={cy + 48} fontFamily={SANS} fontSize={12} fill={CLAUDE.INK_SOFT}>{cap.slice(26)}</text>}
            </g>
          );
        })}

        {/* The moat: the distinct-voice card */}
        <g opacity={distO}>
          <text x={MOAT_X + MOAT_W / 2} y={MOAT_Y - 26} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fontWeight={800} fill={CLAUDE.SPARK} letterSpacing="0.1em">
            YOUR VOICE — DISTINCT
          </text>
          <rect x={MOAT_X} y={MOAT_Y} width={MOAT_W} height={MOAT_H} rx={14}
            fill={CLAUDE.CARD} stroke={CLAUDE.SPARK} strokeWidth={3} />
          <text x={MOAT_X + 28} y={MOAT_Y + 54} fontFamily={SERIF} fontSize={18} fill={CLAUDE.INK}>
            "three takes, two AM, the bridge
          </text>
          <text x={MOAT_X + 28} y={MOAT_Y + 78} fontFamily={SERIF} fontSize={18} fill={CLAUDE.INK}>
            finally landed. you'll know why."
          </text>
          <line x1={MOAT_X + 24} y1={MOAT_Y + 100} x2={MOAT_X + MOAT_W - 24} y2={MOAT_Y + 100} stroke={CLAUDE.BORDER} strokeWidth={1} />
          <text x={MOAT_X + 28} y={MOAT_Y + 132} fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>
            built through the voice file.
          </text>
          <text x={MOAT_X + 28} y={MOAT_Y + 154} fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>
            no bot without the brief can replicate it.
          </text>
          <text x={MOAT_X + 28} y={MOAT_Y + 188} fontFamily={SANS} fontSize={13} fontWeight={700} fill={CLAUDE.SPARK}>
            the moat is the specificity.
          </text>
          <text x={MOAT_X + 28} y={MOAT_Y + 210} fontFamily={SANS} fontSize={13} fontWeight={700} fill={CLAUDE.SPARK}>
            the voice file is the key to it.
          </text>
        </g>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          every brand-voice-free AI produces the left side — yours is on the right
        </text>
      </svg>
    </AbsoluteFill>
  );
};
