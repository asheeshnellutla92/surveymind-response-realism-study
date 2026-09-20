import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InYourVoiceSpecificity — B02 "Claude, In Your Voice"
 * Same model, split at brief quality: vague → generic output vs specific → on-voice output.
 */

export const inYourVoiceSpecificitySchema = z.object({
  sparkLine: z.string().default('Specificity is the lever.'),
});
export type InYourVoiceSpecificityProps = z.infer<typeof inYourVoiceSpecificitySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const InYourVoiceSpecificity: React.FC<InYourVoiceSpecificityProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const modelO = ease(remap(p, 0.06, 0.20, 0, 1));
  const leftO = ease(remap(p, 0.22, 0.36, 0, 1));
  const rightO = ease(remap(p, 0.40, 0.54, 0, 1));

  const MODEL_CX = 960, MODEL_CY = 400, MODEL_R = 56;
  const LEFT_X = 180, RIGHT_X = 1200, COL_Y = 290, COL_W = 500, COL_H = 340;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Model node */}
        <g opacity={modelO}>
          <circle cx={MODEL_CX} cy={MODEL_CY} r={MODEL_R} fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={2.5} />
          <text x={MODEL_CX} y={MODEL_CY - 6} textAnchor="middle" fontFamily={SANS} fontSize={11} fontWeight={800} fill={CLAUDE.INK_SOFT} letterSpacing="0.1em">SAME</text>
          <text x={MODEL_CX} y={MODEL_CY + 12} textAnchor="middle" fontFamily={SANS} fontSize={11} fontWeight={800} fill={CLAUDE.INK_SOFT} letterSpacing="0.1em">MODEL</text>
        </g>

        {/* Left: vague brief → generic output */}
        <g opacity={leftO}>
          <path d={`M ${MODEL_CX - MODEL_R - 10} ${MODEL_CY} C ${LEFT_X + COL_W + 40} ${MODEL_CY}, ${LEFT_X + COL_W + 40} ${COL_Y + COL_H / 2}, ${LEFT_X + COL_W + 10} ${COL_Y + COL_H / 2}`}
            fill="none" stroke={CLAUDE.BORDER} strokeWidth={2} />
          <rect x={LEFT_X} y={COL_Y} width={COL_W} height={COL_H} rx={12}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
          <text x={LEFT_X + COL_W / 2} y={COL_Y - 20} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fontWeight={800} fill='#A44A32' letterSpacing="0.1em">
            VAGUE BRIEF
          </text>
          <text x={LEFT_X + 22} y={COL_Y + 44} fontFamily={SANS} fontSize={14} fill={CLAUDE.INK_SOFT} fontStyle="italic">
            "write a caption about
          </text>
          <text x={LEFT_X + 22} y={COL_Y + 66} fontFamily={SANS} fontSize={14} fill={CLAUDE.INK_SOFT} fontStyle="italic">
            my new single"
          </text>
          <line x1={LEFT_X + 20} y1={COL_Y + 86} x2={LEFT_X + COL_W - 20} y2={COL_Y + 86} stroke={CLAUDE.BORDER} strokeWidth={1} />
          <text x={LEFT_X + 22} y={COL_Y + 116} fontFamily={SANS} fontSize={12} fill='#A44A32' fontWeight={700}>OUTPUT:</text>
          <text x={LEFT_X + 22} y={COL_Y + 140} fontFamily={SERIF} fontSize={14} fill={CLAUDE.INK_SOFT}>
            "Excited to share my new
          </text>
          <text x={LEFT_X + 22} y={COL_Y + 162} fontFamily={SERIF} fontSize={14} fill={CLAUDE.INK_SOFT}>
            music! Check it out!"
          </text>
          <text x={LEFT_X + 22} y={COL_Y + 196} fontFamily={SANS} fontSize={11} fill='#A44A32'>
            sounds like everyone. sounds like no one.
          </text>
          <text x={LEFT_X + 22} y={COL_Y + 220} fontFamily={SANS} fontSize={11} fill='#A44A32'>
            could be any artist, any song, any day.
          </text>
        </g>

        {/* Right: specific brief → on-voice output */}
        <g opacity={rightO}>
          <path d={`M ${MODEL_CX + MODEL_R + 10} ${MODEL_CY} C ${RIGHT_X - 40} ${MODEL_CY}, ${RIGHT_X - 40} ${COL_Y + COL_H / 2}, ${RIGHT_X - 10} ${COL_Y + COL_H / 2}`}
            fill="none" stroke={CLAUDE.SPARK} strokeWidth={2} />
          <rect x={RIGHT_X} y={COL_Y} width={COL_W} height={COL_H} rx={12}
            fill={CLAUDE.CARD} stroke={CLAUDE.SPARK} strokeWidth={2} />
          <text x={RIGHT_X + COL_W / 2} y={COL_Y - 20} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fontWeight={800} fill={CLAUDE.SPARK} letterSpacing="0.1em">
            SPECIFIC BRIEF + VOICE FILE
          </text>
          <text x={RIGHT_X + 22} y={COL_Y + 44} fontFamily={SANS} fontSize={13} fill={CLAUDE.INK} fontStyle="italic">
            "caption, my tone, IG,
          </text>
          <text x={RIGHT_X + 22} y={COL_Y + 66} fontFamily={SANS} fontSize={13} fill={CLAUDE.INK} fontStyle="italic">
            the opening lyric is: [lyric]"
          </text>
          <line x1={RIGHT_X + 20} y1={COL_Y + 86} x2={RIGHT_X + COL_W - 20} y2={COL_Y + 86} stroke={CLAUDE.BORDER} strokeWidth={1} />
          <text x={RIGHT_X + 22} y={COL_Y + 116} fontFamily={SANS} fontSize={12} fill={CLAUDE.SPARK} fontWeight={700}>OUTPUT:</text>
          <text x={RIGHT_X + 22} y={COL_Y + 140} fontFamily={SERIF} fontSize={14} fill={CLAUDE.INK}>
            caption that sounds like you.
          </text>
          <text x={RIGHT_X + 22} y={COL_Y + 162} fontFamily={SERIF} fontSize={14} fill={CLAUDE.INK}>
            platform-fit. brand-consistent.
          </text>
          <text x={RIGHT_X + 22} y={COL_Y + 196} fontFamily={SANS} fontSize={11} fill='#2D6A4F' fontWeight={700}>
            specific brief → on-voice result
          </text>
        </g>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.78, 0.90, 0, 1))}>
          the model didn't change · what you gave it did
        </text>
      </svg>
    </AbsoluteFill>
  );
};
