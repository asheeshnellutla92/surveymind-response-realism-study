import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SourcedExhibit — B01 "Claude, Sourced"
 * GRADED EXHIBIT: fake guide card assembles, "Andromeda" highlighted,
 * mismatch tag drops — "Meta ad-retrieval. Wrong platform."
 * Exhibit keeps its own look (warm document skin, not claude UI).
 */

export const sourcedExhibitSchema = z.object({
  sparkLine: z.string().default('The exhibit, on screen.'),
});
export type SourcedExhibitProps = z.infer<typeof sourcedExhibitSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

// exhibit skin (warm parchment, distinct from claude UI)
const EX_BG = '#FFF8EC';
const EX_BORDER = '#D4C8A8';
const EX_TEXT = '#2C2A1E';
const EX_MUTED = '#7A7060';
const TAG_WARN = '#A44A32';

export const SourcedExhibit: React.FC<SourcedExhibitProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const cardO = ease(remap(p, 0.06, 0.20, 0, 1));
  const hlO = ease(remap(p, 0.35, 0.48, 0, 1));
  const tagO = ease(remap(p, 0.52, 0.65, 0, 1));
  const tagTy = remap(tagO, 0, 1, -30, 0);

  const CARD_X = 320, CARD_Y = 200, CARD_W = 860, CARD_H = 540;

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
        {/* Exhibit document card */}
        <g opacity={cardO}>
          <rect x={CARD_X} y={CARD_Y} width={CARD_W} height={CARD_H} rx={10}
            fill={EX_BG} stroke={EX_BORDER} strokeWidth={2} />
          {/* "Article" header band */}
          <rect x={CARD_X} y={CARD_Y} width={CARD_W} height={46} rx={10} fill={EX_BORDER} opacity={0.4} />
          <rect x={CARD_X} y={CARD_Y + 32} width={CARD_W} height={14} fill={EX_BORDER} opacity={0.4} />
          <text x={CARD_X + 20} y={CARD_Y + 30} fontFamily={SANS} fontSize={12}
            fill={EX_MUTED} letterSpacing="0.1em">
            MUSIC GROWTH WEEKLY — UNLISTED GUIDE
          </text>

          {/* Article title */}
          <text x={CARD_X + 30} y={CARD_Y + 90} fontFamily={SERIF} fontSize={22}
            fontWeight={700} fill={EX_TEXT}>
            Unlock Spotify's Andromeda Algorithm:
          </text>
          <text x={CARD_X + 30} y={CARD_Y + 118} fontFamily={SERIF} fontSize={22}
            fontWeight={700} fill={EX_TEXT}>
            The Formula Behind Your Growth
          </text>

          {/* Fake claim rows */}
          {[
            { label: 'Engine name:', value: '"Andromeda" stream-ranking model' },
            { label: 'Tier-2 gate:', value: 'streams ≥ 847 in first 14 days activates boost' },
            { label: 'Formula:', value: '(engagement × 0.73) + (saves × 2.4) = score' },
            { label: 'Source:', value: 'industry insiders · verified by multiple creators' },
          ].map((row, i) => (
            <g key={i}>
              <text x={CARD_X + 30} y={CARD_Y + 175 + i * 68}
                fontFamily={SANS} fontSize={13} fontWeight={700} fill={EX_MUTED}>
                {row.label}
              </text>
              <text x={CARD_X + 30} y={CARD_Y + 200 + i * 68}
                fontFamily={MONO} fontSize={14} fill={EX_TEXT}>
                {row.value}
              </text>
              <line x1={CARD_X + 20} y1={CARD_Y + 215 + i * 68} x2={CARD_X + CARD_W - 20} y2={CARD_Y + 215 + i * 68}
                stroke={EX_BORDER} strokeWidth={1} />
            </g>
          ))}
        </g>

        {/* Highlight: "Andromeda" on the first claim row */}
        <g opacity={hlO}>
          <rect x={CARD_X + 150} y={CARD_Y + 186} width={148} height={22} rx={3}
            fill={CLAUDE.SPARK} opacity={0.28} />
          <rect x={CARD_X + 150} y={CARD_Y + 186} width={148} height={22} rx={3}
            fill="none" stroke={CLAUDE.SPARK} strokeWidth={1.5} />
        </g>

        {/* Mismatch tag */}
        <g opacity={tagO} transform={`translate(0, ${tagTy})`}>
          <rect x={CARD_X + 300} y={CARD_Y + 150} width={420} height={70} rx={8}
            fill={TAG_WARN} />
          <text x={CARD_X + 510} y={CARD_Y + 180} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={900} fill="#FFF" letterSpacing="0.12em">
            ANDROMEDA = META AD SYSTEM
          </text>
          <text x={CARD_X + 510} y={CARD_Y + 202} textAnchor="middle"
            fontFamily={SERIF} fontSize={14} fill="rgba(255,255,255,0.85)">
            wrong platform · wrong engine · invented formulas
          </text>
          {/* Arrow down to highlight */}
          <line x1={CARD_X + 510} y1={CARD_Y + 220} x2={CARD_X + 224} y2={CARD_Y + 207}
            stroke={TAG_WARN} strokeWidth={2} strokeDasharray="4 3" opacity={0.7} />
        </g>

        {/* Bottom note */}
        <text x={960} y={1020} textAnchor="middle"
          fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.78, 0.90, 0, 1))}>
          real platforms don't publish their internals — if they have exact formulas, they invented them
        </text>
      </svg>
    </AbsoluteFill>
  );
};
