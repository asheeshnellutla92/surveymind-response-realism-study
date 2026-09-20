import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * FrontendDesignProcess — B02 — 2-pass process: plan template + critique gate.
 * Left: 4-part plan (color/type/layout/signature). Right: critique loop + code gate.
 */

export const frontendDesignProcessSchema = z.object({
  sparkLine: z.string().default('Plan first. Critique second. Code third.'),
});
export type FrontendDesignProcessProps = z.infer<typeof frontendDesignProcessSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PLAN_PARTS = [
  {
    label: 'COLOR',
    detail: '4–6 named hex values — describe the palette, not CSS variables',
    example: 'e.g. Clay #B5694E · Linen #F7F3EE · Smoke #8C7B70 · Dark #2B1F1A',
    accent: false,
  },
  {
    label: 'TYPE',
    detail: 'Typefaces for each role — display (used with restraint) · body · utility',
    example: 'Characterful display face paired deliberately for this brief',
    accent: false,
  },
  {
    label: 'LAYOUT',
    detail: 'One-sentence description + ASCII wireframe to compare options',
    example: '┌──────────────┐\n│ HERO          │\n│ 2-col feature │\n│ Gallery       │',
    accent: false,
  },
  {
    label: 'SIGNATURE',
    detail: 'The single element the page will be remembered by — specific to this brief',
    example: 'The one real aesthetic risk, justified by the subject\'s world',
    accent: true,
  },
];

const CRITIQUE_STEPS = [
  'Does any part read as the default for ANY similar brief?',
  'If yes — name what you changed and why before moving on',
  'Only after confirming relative uniqueness: write the code',
];

export const FrontendDesignProcess: React.FC<FrontendDesignProcessProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const critiqueIn = spring({ frame: frame - 60, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const planSprings = PLAN_PARTS.map((_, i) =>
    spring({ frame: frame - 14 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const critiqueSprings = CRITIQUE_STEPS.map((_, i) =>
    spring({ frame: frame - 62 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.43;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.45;
  const PLAN_H = (H * 0.68) / 4 - 14;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        FRONTEND DESIGN · 2-PASS PROCESS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Plan first. Critique second. Code third.
      </div>

      {/* Left: 4-part design plan */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 14,
          opacity: clamp(planSprings[0], 0, 1),
        }}>
          PASS 1 — DESIGN PLAN:
        </div>
        {PLAN_PARTS.map((part, i) => {
          const op = clamp(planSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: part.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${part.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${part.accent ? CLAUDE.SPARK : CLAUDE.INK}`,
              borderRadius: 12, padding: '14px 18px', marginBottom: 14,
              height: PLAN_H, boxSizing: 'border-box' as const,
              boxShadow: part.accent ? '0 6px 20px rgba(217,119,87,0.12)' : '0 4px 12px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: part.accent ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 5 }}>
                {part.label}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.4, marginBottom: 4 }}>
                {part.detail}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
                {part.example}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: critique gate + code gate */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 14,
          opacity: clamp(critiqueIn, 0, 1),
        }}>
          PASS 2 — CRITIQUE GATE:
        </div>
        {CRITIQUE_STEPS.map((step, i) => {
          const op = clamp(critiqueSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: i === 2 ? '#FFFFFF' : 'rgba(217,119,87,0.04)',
              border: `1px solid ${i === 2 ? CLAUDE.BORDER : CLAUDE.SPARK}`,
              borderLeft: `5px solid ${i === 2 ? CLAUDE.INK : CLAUDE.SPARK}`,
              borderRadius: 12, padding: '16px 18px', marginBottom: 14,
              boxShadow: '0 4px 12px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: i === 2 ? CLAUDE.INK : CLAUDE.SPARK,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#FFF',
                }}>
                  {i + 1}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK, lineHeight: 1.4 }}>
                  {step}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 12, padding: '14px 18px', marginTop: 6,
          boxShadow: '0 4px 14px rgba(61,57,41,0.06)',
          opacity: clamp(critiqueSprings[2], 0, 1),
        }}>
          <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.SPARK, fontWeight: 700, marginBottom: 6 }}>
            CSS SELECTOR NOTE:
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.4 }}>
            Derive every color and type decision from the plan. Watch for CSS selector specificity conflicts — .section + element selectors cancel each other.
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        display: 'flex', alignItems: 'center', gap: 12,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 28, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
