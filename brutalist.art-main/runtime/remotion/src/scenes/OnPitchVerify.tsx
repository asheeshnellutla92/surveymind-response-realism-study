import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * OnPitchVerify — B05 "Claude, On the Pitch"
 * Claim card passing through the source-tier filter before the pitch goes out.
 */

export const onPitchVerifySchema = z.object({
  sparkLine: z.string().default('Verify before you cite.'),
});
export type OnPitchVerifyProps = z.infer<typeof onPitchVerifySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const CLAIMS = [
  { text: '"placed on [Show Name], season 3"', verdict: 'VERIFY', color: '#F39C12', ok: null },
  { text: '"supervisors placed 24 songs like yours"', verdict: 'CHECK TIER', color: '#F39C12', ok: null },
  { text: '"Release Radar Friday cadence"', verdict: 'TIER 1 ✓', color: '#2D6A4F', ok: true },
  { text: '"algorithm rewards saves over streams"', verdict: 'TIER 3 ✗', color: '#A44A32', ok: false },
];

export const OnPitchVerify: React.FC<OnPitchVerifyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const filterO = ease(remap(p, 0.06, 0.20, 0, 1));

  const FILTER_CX = 960, FILTER_CY = 440;
  const CLAIM_X = 180, CLAIM_Y_START = 290, CLAIM_W = 460, CLAIM_H = 86, CLAIM_GAP = 110;
  const OUT_X = 1340, OUT_W = 340, OUT_H = 86;

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* Filter badge */}
        <g opacity={filterO}>
          <rect x={FILTER_CX - 100} y={FILTER_CY - 30} width={200} height={60} rx={30}
            fill={CLAUDE.SPARK} />
          <text x={FILTER_CX} y={FILTER_CY - 4} textAnchor="middle"
            fontFamily={SANS} fontSize={11} fontWeight={800} fill="#FFF" letterSpacing="0.12em">SOURCE FILTER</text>
          <text x={FILTER_CX} y={FILTER_CY + 14} textAnchor="middle"
            fontFamily={SANS} fontSize={11} fill="rgba(255,255,255,0.8)">tier check</text>
        </g>

        {CLAIMS.map((claim, i) => {
          const t0 = 0.20 + i * 0.15;
          const claimO = ease(remap(p, t0, t0 + 0.12, 0, 1));
          const verdictO = ease(remap(p, t0 + 0.12, t0 + 0.22, 0, 1));
          const cy = CLAIM_Y_START + i * CLAIM_GAP;
          const outCy = cy;

          return (
            <g key={i}>
              {/* Claim card */}
              <g opacity={claimO}>
                <rect x={CLAIM_X} y={cy} width={CLAIM_W} height={CLAIM_H} rx={10}
                  fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
                <text x={CLAIM_X + 18} y={cy + 40} fontFamily={SERIF} fontSize={14} fill={CLAUDE.INK}>{claim.text}</text>
              </g>
              {/* Arrow through filter */}
              <line x1={CLAIM_X + CLAIM_W + 10} y1={cy + CLAIM_H / 2}
                x2={OUT_X - 10} y2={outCy + OUT_H / 2}
                stroke={CLAUDE.BORDER} strokeWidth={1.5} opacity={claimO} />
              {/* Verdict */}
              <g opacity={verdictO}>
                <rect x={OUT_X} y={outCy} width={OUT_W} height={OUT_H} rx={10}
                  fill={claim.ok === true ? '#D8F3DC' : claim.ok === false ? '#FDE8E8' : '#FFF8EC'}
                  stroke={claim.color} strokeWidth={2} />
                <text x={OUT_X + OUT_W / 2} y={outCy + 44} textAnchor="middle"
                  fontFamily={SANS} fontSize={14} fontWeight={800} fill={claim.color}
                  letterSpacing="0.1em">{claim.verdict}</text>
              </g>
            </g>
          );
        })}

        <text x={960} y={1020} textAnchor="middle" fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          the pitch is only as strong as its citations — no source, no claim
        </text>
      </svg>
    </AbsoluteFill>
  );
};
