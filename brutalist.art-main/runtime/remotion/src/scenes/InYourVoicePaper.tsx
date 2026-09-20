import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * InYourVoicePaper — B04 "Claude, In Your Voice"
 * Master tape with a signature line; rewrite arrow shows what gets flagged for human decision.
 */

export const inYourVoicePaperSchema = z.object({
  sparkLine: z.string().default('The paper you sign.'),
});
export type InYourVoicePaperProps = z.infer<typeof inYourVoicePaperSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

export const InYourVoicePaper: React.FC<InYourVoicePaperProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const docO = ease(remap(p, 0.08, 0.22, 0, 1));
  const arrowO = ease(remap(p, 0.35, 0.48, 0, 1));
  const humanO = ease(remap(p, 0.50, 0.63, 0, 1));
  const rulesO = ease(remap(p, 0.65, 0.78, 0, 1));

  const DOC_X = 260, DOC_Y = 240, DOC_W = 540, DOC_H = 440;
  const HUMAN_X = 1060, HUMAN_Y = 360, HUMAN_W = 380, HUMAN_H = 200;

  const ROWS = [
    { label: 'Copyright ownership', value: 'human authorship required' },
    { label: 'AI disclosure', value: 'distributor policies vary — verify' },
    { label: 'Collaborator mentions', value: 'you name, not the bot' },
    { label: 'Lyric credits', value: 'your signature, your decision' },
  ];

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Document */}
        <g opacity={docO}>
          <rect x={DOC_X} y={DOC_Y} width={DOC_W} height={DOC_H} rx={12}
            fill='#FFF8EC' stroke='#D4C8A8' strokeWidth={2} />
          <rect x={DOC_X} y={DOC_Y} width={DOC_W} height={46} rx={12} fill='#D4C8A8' opacity={0.4} />
          <rect x={DOC_X} y={DOC_Y + 32} width={DOC_W} height={14} fill='#D4C8A8' opacity={0.4} />
          <text x={DOC_X + 20} y={DOC_Y + 30} fontFamily={SANS} fontSize={12} fill='#7A7060' letterSpacing="0.1em">DRAFT — AI-ASSISTED WORK</text>
          {ROWS.map((row, i) => (
            <g key={i}>
              <text x={DOC_X + 24} y={DOC_Y + 86 + i * 80} fontFamily={SANS} fontSize={12} fontWeight={800} fill='#7A7060' letterSpacing="0.08em">{row.label.toUpperCase()}</text>
              <text x={DOC_X + 24} y={DOC_Y + 110 + i * 80} fontFamily={SERIF} fontSize={16} fill='#2C2A1E'>{row.value}</text>
              {i < ROWS.length - 1 && <line x1={DOC_X + 16} y1={DOC_Y + 124 + i * 80} x2={DOC_X + DOC_W - 16} y2={DOC_Y + 124 + i * 80} stroke='#D4C8A8' strokeWidth={1} />}
            </g>
          ))}
          {/* Signature line */}
          <line x1={DOC_X + 40} y1={DOC_Y + DOC_H - 30} x2={DOC_X + DOC_W - 40} y2={DOC_Y + DOC_H - 30} stroke={CLAUDE.SPARK} strokeWidth={2.5} />
          <text x={DOC_X + DOC_W / 2} y={DOC_Y + DOC_H - 10} textAnchor="middle" fontFamily={SERIF} fontSize={13} fill={CLAUDE.SPARK}>your signature</text>
        </g>

        {/* Arrow to human */}
        <g opacity={arrowO}>
          <line x1={DOC_X + DOC_W + 12} y1={DOC_Y + DOC_H / 2}
            x2={HUMAN_X - 12} y2={HUMAN_Y + HUMAN_H / 2}
            stroke={CLAUDE.INK_SOFT} strokeWidth={2} />
          <polygon points={`${HUMAN_X - 12},${HUMAN_Y + HUMAN_H / 2 - 7} ${HUMAN_X + 4},${HUMAN_Y + HUMAN_H / 2} ${HUMAN_X - 12},${HUMAN_Y + HUMAN_H / 2 + 7}`} fill={CLAUDE.INK_SOFT} />
        </g>

        {/* Human decision box */}
        <g opacity={humanO}>
          <rect x={HUMAN_X} y={HUMAN_Y} width={HUMAN_W} height={HUMAN_H} rx={12}
            fill={CLAUDE.CARD} stroke={CLAUDE.SPARK} strokeWidth={2.5} />
          <text x={HUMAN_X + HUMAN_W / 2} y={HUMAN_Y + 44} textAnchor="middle"
            fontFamily={SERIF} fontSize={20} fontWeight={700} fill={CLAUDE.INK}>Human signs.</text>
          <text x={HUMAN_X + HUMAN_W / 2} y={HUMAN_Y + 72} textAnchor="middle"
            fontFamily={SERIF} fontSize={20} fontWeight={700} fill={CLAUDE.INK}>Human decides.</text>
          <text x={HUMAN_X + HUMAN_W / 2} y={HUMAN_Y + 104} textAnchor="middle"
            fontFamily={SANS} fontSize={14} fill={CLAUDE.INK_SOFT}>Not the voice file.</text>
          <text x={HUMAN_X + HUMAN_W / 2} y={HUMAN_Y + 126} textAnchor="middle"
            fontFamily={SANS} fontSize={14} fill={CLAUDE.INK_SOFT}>Not the bot. You.</text>
        </g>

        {/* Copyright note */}
        <g opacity={rulesO}>
          <text x={960} y={760} textAnchor="middle" fontFamily={SANS} fontSize={15} fill='#A44A32'>
            US Copyright Office: unmodified AI-generated lyrics may lack human authorship protection.
          </text>
          <text x={960} y={784} textAnchor="middle" fontFamily={SANS} fontSize={15} fill='#A44A32'>
            Distributor AI-disclosure policies vary — verify current language before you release.
          </text>
        </g>

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          the bot assists · the name on the work is yours
        </text>
      </svg>
    </AbsoluteFill>
  );
};
