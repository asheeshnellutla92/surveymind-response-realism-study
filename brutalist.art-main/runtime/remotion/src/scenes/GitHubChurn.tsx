import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { GH, GH_FONT } from '../tokens/github';

export const churnYearSchema = z.object({
  label:  z.string().default("'18"),
  count:  z.number().default(0),
  peak:   z.boolean().optional(),
  frozen: z.boolean().optional(),
});

export const gitHubChurnSchema = z.object({
  years: z.array(churnYearSchema).default([
    { label: "'17", count: 100 },
    { label: "'18", count: 159, peak: true },
    { label: "'19", count: 42 },
    { label: "'20", count: 107 },
    { label: "'21", count: 38 },
    { label: "'22", count: 0, frozen: true },
    { label: "'23", count: 22 },
    { label: "'24", count: 0, frozen: true },
    { label: "'25", count: 0, frozen: true },
  ]),
  max:     z.number().default(159),
  caption: z.string().default('159 → 22 → frozen since Nov 2023. And 455 of 469 commits are one author.'),
});
export type GitHubChurnProps = z.infer<typeof gitHubChurnSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const SPRING = { damping: 26, stiffness: 120, mass: 0.9 };

const CHART_H = 520;  // matches mock

export const GitHubChurn: React.FC<GitHubChurnProps> = ({ years, max, caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kickIn    = spring({ frame,            fps, config: SPRING });
  const captionIn = spring({ frame: frame - 6, fps, config: SPRING });

  const op = (s: number) => clamp(s, 0, 1);

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
        Git archaeology
      </div>

      {/* Bar chart — bottom-aligned */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 26,
        height: CHART_H, width: '100%', justifyContent: 'center',
        paddingTop: 20,
      }}>
        {years.map((yr, i) => {
          const barProgress = clamp(
            interpolate(frame, [Math.round(fps * 0.2) + i * 4, Math.round(fps * 0.2) + i * 4 + 16], [0, 1]),
            0, 1,
          );
          const pct = yr.count ? (yr.count / max * 100) : 3;
          const barH = (pct / 100) * CHART_H * barProgress;

          return (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              height: '100%', gap: 14,
            }}>
              {/* Bar */}
              {yr.frozen ? (
                <div style={{
                  width: 96, height: barH,
                  background: 'transparent',
                  border: `2px dashed ${GH.DIM}`,
                  borderRadius: '6px 6px 0 0',
                  flexShrink: 0,
                }} />
              ) : (
                <div style={{
                  width: 96, height: barH,
                  background: yr.peak ? GH.BLUE : GH.DIM,
                  borderRadius: '6px 6px 0 0',
                  flexShrink: 0,
                }} />
              )}

              {/* Year label */}
              <div style={{
                fontFamily: GH_FONT.mono, fontSize: 24,
                color: yr.frozen ? GH.DIM : GH.MUTED,
              }}>
                {yr.label}
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
