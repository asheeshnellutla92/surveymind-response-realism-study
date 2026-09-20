import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * FrontendDesignRestraint — B03 — Restraint rules + writing in design.
 * Left: restraint (spend boldness once, Chanel rule, self-critique).
 * Right: writing in design (5 rules).
 */

export const frontendDesignRestraintSchema = z.object({
  sparkLine: z.string().default('One memorable thing. Everything else quiet.'),
});
export type FrontendDesignRestraintProps = z.infer<typeof frontendDesignRestraintSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const RESTRAINT_RULES = [
  {
    label: 'Spend boldness in one place',
    detail: 'Let the signature element be the memorable thing — keep everything around it quiet',
    accent: true,
  },
  {
    label: 'The Chanel rule',
    detail: 'Before leaving the house, look in the mirror and remove one accessory',
    accent: false,
  },
  {
    label: 'Self-critique as you build',
    detail: 'Take screenshots if your environment supports it — a picture is worth 1000 tokens',
    accent: false,
  },
  {
    label: 'Build to a quality floor',
    detail: 'Responsive down to mobile, visible keyboard focus, reduced motion respected — without announcing it',
    accent: false,
  },
];

const WRITING_RULES = [
  'Words appear for one reason: help the user navigate — they are design material',
  'Write from the end user\'s side of the screen — name what people control, not how the system is built',
  'Active voice by default: "Save Changes" not "Submit" — the same name throughout the whole flow',
  'Errors: explain what went wrong and how to fix it — never apologize, never vague',
  'One job per element: a label labels, an example demonstrates, nothing quietly does double duty',
];

export const FrontendDesignRestraint: React.FC<FrontendDesignRestraintProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const writingIn = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const restraintSprings = RESTRAINT_RULES.map((_, i) =>
    spring({ frame: frame - 12 - i * 11, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const writingSprings = WRITING_RULES.map((_, i) =>
    spring({ frame: frame - 57 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.43;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.45;
  const RULE_H = (H * 0.68) / 4 - 14;
  const WRITE_H = (H * 0.66) / 5 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        FRONTEND DESIGN · RESTRAINT + WRITING
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Spend boldness once. Write to navigate.
      </div>

      {/* Left: 4 restraint rules */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 14,
          opacity: clamp(restraintSprings[0], 0, 1),
        }}>
          RESTRAINT:
        </div>
        {RESTRAINT_RULES.map((rule, i) => {
          const op = clamp(restraintSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: rule.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${rule.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${rule.accent ? CLAUDE.SPARK : CLAUDE.INK}`,
              borderRadius: 12, padding: '14px 18px', marginBottom: 14,
              height: RULE_H, boxSizing: 'border-box' as const,
              boxShadow: rule.accent ? '0 6px 20px rgba(217,119,87,0.12)' : '0 4px 12px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: rule.accent ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 6 }}>
                {rule.label}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
                {rule.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: 5 writing rules */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 14,
          opacity: clamp(writingIn, 0, 1),
        }}>
          WRITING IN DESIGN:
        </div>
        {WRITING_RULES.map((rule, i) => {
          const op = clamp(writingSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.INK}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              height: WRITE_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {rule}
              </div>
            </div>
          );
        })}
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
