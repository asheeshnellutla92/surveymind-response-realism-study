import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SourcedSorting — B03 "Claude, Sourced"
 * From one document, cards split: confirmed real vs invented.
 */

export const sourcedSortingSchema = z.object({
  sparkLine: z.string().default('Not everything in it is false.'),
});
export type SourcedSortingProps = z.infer<typeof sourcedSortingSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const REAL = [
  'Waterfall release strategy',
  'Release Radar: Friday cadence',
  '1,000-stream royalty threshold',
];
const INVENTED = [
  '"Andromeda" engine name',
  'Exact engagement formulas',
  'Precise tier-gate numbers',
];

export const SourcedSorting: React.FC<SourcedSortingProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = ease(remap(p, 0, 0.06, 0, 1));
  const docO = ease(remap(p, 0.06, 0.20, 0, 1));
  const labelO = ease(remap(p, 0.22, 0.32, 0, 1));

  const DOC_X = 780, DOC_Y = 360, DOC_W = 360, DOC_H = 200;
  const REAL_X = 180, INV_X = 1380;
  const COL_W = 340, COL_Y = 290, ITEM_H = 72, ITEM_GAP = 86;

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
        {/* Source document */}
        <g opacity={docO}>
          <rect x={DOC_X} y={DOC_Y} width={DOC_W} height={DOC_H} rx={10}
            fill='#FFF8EC' stroke='#D4C8A8' strokeWidth={2} />
          <text x={DOC_X + DOC_W / 2} y={DOC_Y + 36} textAnchor="middle"
            fontFamily={SANS} fontSize={11} fontWeight={800} fill='#7A7060' letterSpacing="0.1em">
            THE GUIDE
          </text>
          <text x={DOC_X + DOC_W / 2} y={DOC_Y + 62} textAnchor="middle"
            fontFamily={SERIF} fontSize={16} fill='#2C2A1E'>
            "Spotify Andromeda"
          </text>
          <text x={DOC_X + DOC_W / 2} y={DOC_Y + 86} textAnchor="middle"
            fontFamily={SERIF} fontSize={16} fill='#2C2A1E'>
            Algorithm Guide
          </text>
          <text x={DOC_X + DOC_W / 2} y={DOC_Y + 118} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fill='#7A7060'>
            mixed truth + invention
          </text>
          <text x={DOC_X + DOC_W / 2} y={DOC_Y + 148} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fill='#7A7060'>
            all stated with equal confidence
          </text>
        </g>

        {/* Column headers */}
        <g opacity={labelO}>
          <text x={REAL_X + COL_W / 2} y={COL_Y - 28} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={800} fill='#2D6A4F' letterSpacing="0.12em">
            CONFIRMED REAL
          </text>
          <text x={REAL_X + COL_W / 2} y={COL_Y - 8} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fill={CLAUDE.INK_SOFT}>
            consistent with Spotify's own docs
          </text>
          <text x={INV_X + COL_W / 2} y={COL_Y - 28} textAnchor="middle"
            fontFamily={SANS} fontSize={13} fontWeight={800} fill='#A44A32' letterSpacing="0.12em">
            INVENTED
          </text>
          <text x={INV_X + COL_W / 2} y={COL_Y - 8} textAnchor="middle"
            fontFamily={SANS} fontSize={12} fill={CLAUDE.INK_SOFT}>
            no platform source exists
          </text>
        </g>

        {/* Real items */}
        {REAL.map((item, i) => {
          const t0 = 0.30 + i * 0.12;
          const op = ease(remap(p, t0, t0 + 0.12, 0, 1));
          const startX = DOC_X + DOC_W / 2;
          const destX = REAL_X;
          const iy = COL_Y + i * ITEM_GAP;
          const cx = remap(op, 0, 1, startX, destX);

          return (
            <g key={i} opacity={op}>
              <rect x={cx} y={iy} width={COL_W} height={ITEM_H} rx={8}
                fill='#D8F3DC' stroke='#2D6A4F' strokeWidth={1.5} />
              <text x={cx + 20} y={iy + 28} fontFamily={SANS} fontSize={12}
                fontWeight={700} fill='#1B4332'>
                ✓
              </text>
              <text x={cx + 44} y={iy + 28} fontFamily={SERIF} fontSize={15} fill='#1B4332'>
                {item}
              </text>
              <text x={cx + 44} y={iy + 50} fontFamily={SANS} fontSize={11} fill='#2D6A4F'>
                documented
              </text>
            </g>
          );
        })}

        {/* Invented items */}
        {INVENTED.map((item, i) => {
          const t0 = 0.42 + i * 0.12;
          const op = ease(remap(p, t0, t0 + 0.12, 0, 1));
          const startX = DOC_X + DOC_W / 2;
          const destX = INV_X;
          const iy = COL_Y + i * ITEM_GAP;
          const cx = remap(op, 0, 1, startX, destX);

          return (
            <g key={i} opacity={op}>
              <rect x={cx} y={iy} width={COL_W} height={ITEM_H} rx={8}
                fill='#FDE8E8' stroke='#A44A32' strokeWidth={1.5} />
              <text x={cx + 20} y={iy + 28} fontFamily={SANS} fontSize={12}
                fontWeight={700} fill='#A44A32'>
                ✗
              </text>
              <text x={cx + 44} y={iy + 28} fontFamily={SERIF} fontSize={15} fill='#6B1A0A'>
                {item}
              </text>
              <text x={cx + 44} y={iy + 50} fontFamily={SANS} fontSize={11} fill='#A44A32'>
                no source found
              </text>
            </g>
          );
        })}

        {/* Bottom note */}
        <text x={960} y={1020} textAnchor="middle"
          fontFamily={SERIF} fontSize={20} fill={CLAUDE.INK_SOFT}
          opacity={ease(remap(p, 0.82, 0.93, 0, 1))}>
          the truth is the costume the lie wears — you can't ignore it all, you must tier it
        </text>
      </svg>
    </AbsoluteFill>
  );
};
