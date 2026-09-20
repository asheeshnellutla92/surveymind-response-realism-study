import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { GH, GH_FONT } from '../tokens/github';

export const structureRowSchema = z.object({
  name: z.string().default('renderer.ts'),
  loc:  z.number().default(533),
  hi:   z.boolean().optional(),
});

export const gitHubStructureMapSchema = z.object({
  rows: z.array(structureRowSchema).default([
    { name: 'renderer.ts',  loc: 533, hi: true },
    { name: 'generator.ts', loc: 311 },
    { name: 'fillers/',     loc: 293 },
    { name: 'canvas.ts',    loc: 153 },
    { name: 'svg.ts',       loc: 134 },
    { name: 'core.ts',      loc: 94  },
  ]),
  max:     z.number().default(533),
  caption: z.string().default('⚠ SET IN BEAT SHEET'),
});
export type GitHubStructureMapProps = z.infer<typeof gitHubStructureMapSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const SPRING = { damping: 26, stiffness: 120, mass: 0.9 };

export const GitHubStructureMap: React.FC<GitHubStructureMapProps> = ({ rows, max, caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickIn    = spring({ frame,            fps, config: SPRING });
  const captionIn = spring({ frame: frame - 6, fps, config: SPRING });

  const op = (s: number) => clamp(s, 0, 1);

  // Bar max pixel width matches mock: (loc/max)*1100
  const MAX_BAR_W = 1100;

  return (
    <AbsoluteFill style={{
      background: GH.BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '90px 120px', boxSizing: 'border-box',
    }}>
      {/* Kicker */}
      <div style={{
        position: 'absolute', top: 70, left: 120,
        color: GH.BLUE, fontWeight: 700, fontSize: 24,
        letterSpacing: '0.20em', textTransform: 'uppercase',
        fontFamily: GH_FONT.ui,
        opacity: op(kickIn), transform: `translateY(${(1 - op(kickIn)) * 8}px)`,
      }}>
        Structure
      </div>

      {/* Rows */}
      <div style={{ width: '100%' }}>
        {rows.map((row, i) => {
          const rowOp = clamp(
            interpolate(frame, [Math.round(fps * 0.15) + i * 5, Math.round(fps * 0.15) + i * 5 + 12], [0, 1]),
            0, 1,
          );
          const barProgress = clamp(
            interpolate(frame, [Math.round(fps * 0.2) + i * 5, Math.round(fps * 0.2) + i * 5 + 18], [0, 1]),
            0, 1,
          );
          const targetW = (row.loc / max) * MAX_BAR_W;

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 24,
              marginBottom: 20,
              opacity: rowOp,
            }}>
              {/* File name — right aligned in fixed width */}
              <div style={{
                width: 300, textAlign: 'right',
                fontFamily: GH_FONT.mono, fontSize: 30,
                color: row.hi ? GH.FG : GH.MUTED,
                flexShrink: 0,
              }}>
                {row.name}
              </div>

              {/* Bar */}
              <div style={{
                height: 44,
                width: targetW * barProgress,
                background: row.hi ? GH.BLUE : GH.DIM,
                borderRadius: 6,
                flexShrink: 0,
              }} />

              {/* LOC count */}
              <div style={{
                fontFamily: GH_FONT.mono, fontSize: 30,
                color: row.hi ? GH.BLUE : GH.MUTED,
                fontWeight: row.hi ? 700 : 400,
              }}>
                {row.loc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 70, left: 120, right: 120,
        color: GH.MUTED, fontSize: 30, fontFamily: GH_FONT.ui,
        opacity: op(captionIn),
      }}>
        {caption}
      </div>
    </AbsoluteFill>
  );
};
