import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnPitchDraft — B02 "Claude, On the Pitch"
 * Pitch email card citing a specific placement + a specific song from catalog — DRAFT stamp.
 */

export const onPitchDraftSchema = z.object({
  sparkLine: z.string().default('The draft, against your catalog.'),
});
export type OnPitchDraftProps = z.infer<typeof onPitchDraftSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const OnPitchDraft: React.FC<OnPitchDraftProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const emailO = ease(remap(p, 0.08, 0.22, 0, 1));
  const hlO = ease(remap(p, 0.30, 0.44, 0, 1));
  const stampO = ease(remap(p, 0.50, 0.64, 0, 1));
  const stampTy = (1 - ease(remap(p, 0.50, 0.64, 0, 1))) * (-30);

  const EMAIL_X = 360, EMAIL_Y = 200, EMAIL_W = 1200, EMAIL_H = 580;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Email card */}
        <g opacity={emailO}>
          <rect x={EMAIL_X} y={EMAIL_Y} width={EMAIL_W} height={EMAIL_H} rx={14}
            fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={2} />
          <rect x={EMAIL_X} y={EMAIL_Y} width={EMAIL_W} height={52} rx={14} fill={CLAUDE.PAGE} />
          <rect x={EMAIL_X} y={EMAIL_Y + 38} width={EMAIL_W} height={14} fill={CLAUDE.PAGE} />
          <text x={EMAIL_X + 22} y={EMAIL_Y + 32} fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>To: [Supervisor Name] — From: [Your Name]</text>
          <text x={EMAIL_X + 22} y={EMAIL_Y + 82} fontFamily={SERIF} fontSize={18} fontWeight={700} fill={CLAUDE.INK}>
            Re: "Glass Half Full" — placement in [Show Name]
          </text>
          {[
            'I noticed you placed [Comparable Artist\'s track] in [Show], season 2 —',
            'the emotional tone in that cue maps well to my song "Glass Half Full."',
            '',
            'The track is an acoustic indie piece, 3:12, with a lyric about patience',
            'in ambiguous endings. I\'ve attached the stems and a one-sheet.',
            '',
            'Happy to provide anything else you need.',
          ].map((line, i) => (
            <text key={i} x={EMAIL_X + 22} y={EMAIL_Y + 122 + i * 40}
              fontFamily={SERIF} fontSize={15} fill={line === '' ? CLAUDE.INK : CLAUDE.INK}>
              {line}
            </text>
          ))}
        </g>

        {/* Highlights on specific catalog/placement references */}
        <g opacity={hlO}>
          <rect x={EMAIL_X + 22} y={EMAIL_Y + 100} width={312} height={24} rx={3}
            fill={CLAUDE.SPARK} opacity={0.2} stroke={CLAUDE.SPARK} strokeWidth={1} />
          <rect x={EMAIL_X + 22} y={EMAIL_Y + 182} width={196} height={24} rx={3}
            fill={CLAUDE.SPARK} opacity={0.2} stroke={CLAUDE.SPARK} strokeWidth={1} />
          <text x={EMAIL_X + EMAIL_W - 20} y={EMAIL_Y + 114} textAnchor="end"
            fontFamily={SANS} fontSize={11} fill={CLAUDE.SPARK} fontWeight={700}>your catalog</text>
          <text x={EMAIL_X + EMAIL_W - 20} y={EMAIL_Y + 196} textAnchor="end"
            fontFamily={SANS} fontSize={11} fill={CLAUDE.SPARK} fontWeight={700}>researched reference</text>
        </g>

        {/* DRAFT stamp */}
        <g opacity={stampO} transform={`translate(0, ${stampTy})`}>
          <rect x={EMAIL_X + EMAIL_W - 220} y={EMAIL_Y + EMAIL_H - 80} width={160} height={52} rx={6}
            fill="none" stroke={CLAUDE.SPARK} strokeWidth={4} />
          <text x={EMAIL_X + EMAIL_W - 140} y={EMAIL_Y + EMAIL_H - 44} textAnchor="middle"
            fontFamily={SANS} fontSize={28} fontWeight={900} fill={CLAUDE.SPARK}
            letterSpacing="0.12em" opacity={0.85}>DRAFT</text>
        </g>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          specific catalog reference + specific supervisor match — you send, it doesn't
        </text>
      </svg>
    </AbsoluteFill>
  );
};
