import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { GH, GH_FONT } from '../tokens/github';
import { OctoMark } from './GitHubRepoHero';

export const gitHubSectionRailSchema = z.object({
  kicker:   z.string().default('⚠ SET IN BEAT SHEET'),
  headline: z.string().default('Claude stops after one pass'),
  body:     z.string().default('⚠ SET IN BEAT SHEET'),
  chip:     z.string().default('one pass'),
});
export type GitHubSectionRailProps = z.infer<typeof gitHubSectionRailSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const SPRING = { damping: 26, stiffness: 110, mass: 0.9 };

export const GitHubSectionRail: React.FC<GitHubSectionRailProps> = ({
  kicker, headline, body, chip,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const railIn  = spring({ frame,           fps, config: SPRING });
  const kickIn  = spring({ frame: frame - 4,  fps, config: SPRING });
  const h2In    = spring({ frame: frame - 8,  fps, config: SPRING });
  const bodyIn  = spring({ frame: frame - 12, fps, config: SPRING });
  const chipIn  = spring({ frame: frame - 16, fps, config: SPRING });

  const op = (s: number) => clamp(s, 0, 1);
  const tx = (s: number, px = 24) => (1 - op(s)) * px;

  return (
    <AbsoluteFill style={{ background: GH.BG, overflow: 'hidden' }}>
      {/* Faint octo watermark — right side, 5% opacity */}
      <div style={{
        position: 'absolute', right: -70, top: '50%',
        transform: 'translateY(-50%)',
        width: 760, height: 744,
        opacity: 0.05,
        pointerEvents: 'none',
      }}>
        <OctoMark size={760} color="#c9d1d9" />
      </div>

      {/* Main content: accent rail + column */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          display: 'flex', gap: 44, paddingLeft: 150,
          position: 'relative', zIndex: 1,
          opacity: op(railIn),
          transform: `translateX(${tx(railIn)}px)`,
        }}>
          {/* Blue vertical accent rail */}
          <div style={{
            width: 5, alignSelf: 'stretch', minHeight: 520,
            background: GH.BLUE, borderRadius: 3,
          }} />

          {/* Text column */}
          <div style={{ maxWidth: 1180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Kicker */}
            <div style={{
              fontFamily: GH_FONT.ui,
              color: GH.BLUE, fontWeight: 700, fontSize: 26,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              opacity: op(kickIn), transform: `translateY(${(1 - op(kickIn)) * 10}px)`,
            }}>
              {kicker}
            </div>

            {/* Headline */}
            <div style={{
              fontFamily: GH_FONT.ui,
              fontSize: 104, fontWeight: 800, color: GH.FG,
              letterSpacing: '-0.03em',
              margin: '26px 0 30px', lineHeight: 1.02,
              opacity: op(h2In), transform: `translateY(${(1 - op(h2In)) * 14}px)`,
            }}>
              {headline}
            </div>

            {/* Body */}
            <div style={{
              fontFamily: GH_FONT.ui,
              fontSize: 36, color: GH.MUTED, lineHeight: 1.5,
              marginBottom: 48, maxWidth: 1000,
              opacity: op(bodyIn), transform: `translateY(${(1 - op(bodyIn)) * 10}px)`,
            }}>
              {body}
            </div>

            {/* Chip */}
            <div style={{ opacity: op(chipIn), transform: `translateY(${(1 - op(chipIn)) * 8}px)` }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                border: `1px solid ${GH.BORDER}`, background: GH.CHIP,
                borderRadius: 999, padding: '9px 18px',
                fontFamily: GH_FONT.mono, fontSize: 24, color: GH.BODY,
              }}>
                <OctoMark size={22} color={GH.MUTED} />
                {chip}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
