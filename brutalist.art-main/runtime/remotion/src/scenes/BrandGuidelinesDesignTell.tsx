import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandGuidelinesDesignTell — B05 — the Teardown moment.
 * The design insight: this skill is entirely DATA, no logic.
 * Two columns: what it gets right (repeatability) vs. what it bites (no context).
 * One terracotta accent: "data, not logic" — the central design decision.
 */

export const brandGuidelinesDesignTellSchema = z.object({
  sparkLine: z.string().default('Constraints, not creativity.'),
});
export type BrandGuidelinesDesignTellProps = z.infer<typeof brandGuidelinesDesignTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const GETS_RIGHT = [
  'Same input → same output, every run',
  'Brand fidelity: exact hex, exact font names',
  'No creative interpretation to go wrong',
  'Style update = edit one file',
];

const BITES = [
  'Cannot adapt to context (projector, print, dark mode)',
  'No judgment on readability vs. brand compliance',
  'Spec errors in SKILL.md propagate silently',
];

export const BrandGuidelinesDesignTell: React.FC<BrandGuidelinesDesignTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 105, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const centralIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const getRightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 28 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const bitesSprings = BITES.map((_, i) =>
    spring({ frame: frame - 68 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const rLabelIn = spring({ frame: frame - 24, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const bLabelIn = spring({ frame: frame - 64, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 13, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BRAND GUIDELINES · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.125, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        The skill is entirely data.
      </div>

      {/* Central design decision callout */}
      <div style={{
        position: 'absolute', top: H * 0.235, left: W * 0.10, right: W * 0.10,
        padding: '18px 28px',
        background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
        borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 12,
        opacity: clamp(centralIn, 0, 1),
        transform: `translateY(${(1 - clamp(centralIn, 0, 1)) * 10}px)`,
      }}>
        <span style={{ fontFamily: SANS, fontSize: 20, color: CLAUDE.INK, lineHeight: 1.5 }}>
          The instruction file <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>contains</span> the brand — exact hex values, exact font names, exact rules. Claude's job is to apply it{' '}
          <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>mechanically</span>.{' '}
          There is no "be creative" anywhere in this file.
        </span>
      </div>

      {/* Left: Gets Right */}
      <div style={{
        position: 'absolute', top: H * 0.41, left: W * 0.07, width: W * 0.42,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const,
          color: '#4d7c4d',
          marginBottom: 14,
          opacity: clamp(rLabelIn, 0, 1),
        }}>
          ✓ What it gets right
        </div>
        {GETS_RIGHT.map((item, i) => {
          const op = clamp(getRightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14,
              opacity: op, transform: `translateX(${(1 - op) * -14}px)`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4, background: '#4d7c4d',
                flexShrink: 0, marginTop: 8,
              }} />
              <div style={{ fontFamily: SANS, fontSize: 18, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {item}
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{
        position: 'absolute', top: H * 0.41, left: W * 0.52 - 1,
        width: 2, height: H * 0.44,
        background: CLAUDE.BORDER,
        opacity: clamp(rLabelIn, 0, 1),
      }} />

      {/* Right: Bites */}
      <div style={{
        position: 'absolute', top: H * 0.41, left: W * 0.54, width: W * 0.40,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const,
          color: '#9b4a2c',
          marginBottom: 14,
          opacity: clamp(bLabelIn, 0, 1),
        }}>
          ✗ Where it bites
        </div>
        {BITES.map((item, i) => {
          const op = clamp(bitesSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14,
              opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4, background: '#9b4a2c',
                flexShrink: 0, marginTop: 8,
              }} />
              <div style={{ fontFamily: SANS, fontSize: 18, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {item}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.055,
        display: 'flex', alignItems: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
