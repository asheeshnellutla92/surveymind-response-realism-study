import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { GH, GH_FONT } from '../tokens/github';

// Octocat path shared across all GitHub skin components
const OCTO_PATH = 'M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.362 19.412-6.52 33.405-24.935 33.405-46.69C97.707 22 75.788 0 48.854 0z';
export const OctoMark: React.FC<{ size: number; color?: string }> = ({ size, color = GH.FG }) => (
  <svg width={size} height={size * (94 / 98)} viewBox="0 0 98 96">
    <path d={OCTO_PATH} fill={color} />
  </svg>
);

export const gitHubRepoHeroSchema = z.object({
  name:      z.string().default('ralph-loop'),
  kind:      z.string().default('Claude Code plugin'),
  headline:  z.string().default("Keep building until it's done."),
  starLabel: z.string().default('Star'),
  repo:      z.string().default('anthropics/claude-plugins-public'),
  handle:    z.string().default('@clauded'),
  tagline:   z.string().default('iterate · verify · finish'),
});
export type GitHubRepoHeroProps = z.infer<typeof gitHubRepoHeroSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const SPRING = { damping: 28, stiffness: 120, mass: 0.9 };
const op = (s: number) => clamp(s, 0, 1);
const ty = (s: number, px = 20) => (1 - op(s)) * px;

export const GitHubRepoHero: React.FC<GitHubRepoHeroProps> = ({
  name, kind, headline, starLabel, repo, handle, tagline,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s0 = spring({ frame,           fps, config: SPRING });
  const s1 = spring({ frame: frame - 4,  fps, config: SPRING });
  const s2 = spring({ frame: frame - 8,  fps, config: SPRING });
  const s3 = spring({ frame: frame - 12, fps, config: SPRING });
  const s4 = spring({ frame: frame - 16, fps, config: SPRING });
  const s5 = spring({ frame: frame - 20, fps, config: SPRING });

  return (
    <AbsoluteFill style={{
      background: GH.BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Octocat mark */}
      <div style={{ opacity: op(s0), transform: `translateY(${ty(s0)}px)`, marginBottom: 38 }}>
        <OctoMark size={96} />
      </div>

      {/* Pill: name · kind */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 14,
        border: `1px solid ${GH.BORDER}`, background: GH.PANEL,
        borderRadius: 999, padding: '14px 26px',
        fontFamily: GH_FONT.mono, fontSize: 30, color: GH.FG,
        opacity: op(s1), transform: `translateY(${ty(s1, 14)}px)`,
      }}>
        <b>{name}</b>
        <span style={{ color: GH.MUTED, fontFamily: GH_FONT.ui, fontSize: 26 }}>{kind}</span>
      </div>

      {/* Headline */}
      <div style={{
        fontFamily: GH_FONT.ui, fontSize: 92, fontWeight: 800, color: GH.FG,
        letterSpacing: '-0.03em', margin: '34px 0 0', textAlign: 'center',
        opacity: op(s2), transform: `translateY(${ty(s2, 16)}px)`,
      }}>
        {headline}
      </div>

      {/* Blue rule — width animates in */}
      <div style={{
        width: op(s3) * 112, height: 5,
        background: GH.BLUE, borderRadius: 3,
        margin: '30px 0 46px',
        opacity: op(s3),
      }} />

      {/* Star button */}
      <div style={{
        display: 'inline-flex',
        border: `1px solid ${GH.BORDER}`, borderRadius: 10, overflow: 'hidden',
        fontFamily: GH_FONT.mono, fontSize: 30,
        opacity: op(s4), transform: `translateY(${ty(s4, 12)}px)`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: GH.CHIP, color: GH.FG, fontWeight: 700, padding: '16px 24px',
        }}>
          <span style={{ color: GH.GOLD }}>★</span>
          {starLabel}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: GH.PANEL, color: GH.MUTED,
          padding: '16px 30px', borderLeft: `1px solid ${GH.BORDER}`,
        }}>
          {repo}
        </div>
      </div>

      {/* Handle */}
      <div style={{
        fontFamily: GH_FONT.ui, fontSize: 34, color: GH.FG, marginTop: 64,
        opacity: op(s5), transform: `translateY(${ty(s5, 10)}px)`,
      }}>
        {handle}
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily: GH_FONT.mono, fontSize: 26, color: GH.MUTED2,
        marginTop: 16, letterSpacing: '0.05em',
        opacity: op(s5),
      }}>
        {tagline}
      </div>
    </AbsoluteFill>
  );
};
