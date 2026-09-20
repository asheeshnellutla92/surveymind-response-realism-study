import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CanvasDesignAnatomy — B01 — two-step skill anatomy.
 * Left: Step 1 Philosophy (.md) + Step 2 Canvas (.pdf/.png).
 * Right: Three key callout cards from SKILL.md.
 */

export const canvasDesignAnatomySchema = z.object({
  sparkLine: z.string().default('The philosophy is the brief.'),
});
export type CanvasDesignAnatomyProps = z.infer<typeof canvasDesignAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STEPS = [
  {
    num: '1',
    label: 'Design Philosophy',
    output: 'philosophy.md',
    detail: 'Claude names an aesthetic movement and writes a 4–6 paragraph manifesto: form, space, color, composition, rhythm.',
    accent: true,
    delay: 0,
  },
  {
    num: '2',
    label: 'Canvas Creation',
    output: '.pdf or .png',
    detail: 'Claude reads the philosophy and generates a single-page canvas — 90% visual design, 10% essential text.',
    accent: false,
    delay: 18,
  },
];

const CALLOUTS = [
  {
    label: 'Creative freedom',
    detail: '"Embrace ultimate design freedom and choice. Push aesthetics to the frontier."',
    mono: true,
    delay: 36,
  },
  {
    label: 'Craftsmanship mandate',
    detail: 'SKILL.md says to "REPEATEDLY emphasize" that the final work appears as though it took countless hours.',
    mono: false,
    delay: 50,
  },
  {
    label: 'Pre-baked refinement',
    detail: '"The user ALREADY said it isn\'t perfect enough." — baked into FINAL STEP, before any feedback.',
    mono: false,
    delay: 64,
  },
];

export const CanvasDesignAnatomy: React.FC<CanvasDesignAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const stepSprings = STEPS.map(s =>
    spring({ frame: frame - s.delay, fps, config: { damping: 30, stiffness: 120, mass: 0.9 } })
  );
  const calloutSprings = CALLOUTS.map(c =>
    spring({ frame: frame - c.delay, fps, config: { damping: 28, stiffness: 110, mass: 1.0 } })
  );

  const CONTENT_TOP = H * 0.20;
  const LEFT_W = W * 0.42;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.44;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CANVAS DESIGN · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 52, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Two steps. One vision.
      </div>

      {/* Left: Two steps */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        {STEPS.map((step, i) => {
          const op = clamp(stepSprings[i], 0, 1);
          const isAccent = step.accent;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 20,
              marginBottom: 32, opacity: op,
              transform: `translateY(${(1 - op) * 16}px)`,
            }}>
              {/* Step number badge */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: isAccent ? CLAUDE.SPARK : CLAUDE.BORDER,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SANS, fontSize: 22, fontWeight: 700,
                color: isAccent ? '#FFFFFF' : CLAUDE.INK,
                marginTop: 4,
              }}>
                {step.num}
              </div>
              <div style={{
                flex: 1,
                background: isAccent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
                border: `1px solid ${isAccent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderLeft: `5px solid ${isAccent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderRadius: 14, padding: '20px 24px',
                boxShadow: isAccent ? '0 8px 28px rgba(217,119,87,0.15)' : '0 6px 20px rgba(61,57,41,0.08)',
              }}>
                <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 700, color: CLAUDE.INK, marginBottom: 6 }}>
                  {step.label}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 16, color: CLAUDE.SPARK, marginBottom: 10 }}>
                  → {step.output}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 17, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}

        {/* Bottom arrow connector visual */}
        <div style={{
          marginLeft: 68, marginTop: 0,
          padding: '18px 24px',
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 12, boxShadow: '0 4px 14px rgba(61,57,41,0.07)',
          opacity: clamp(calloutSprings[0] * 0.85, 0, 1),
        }}>
          <div style={{ fontFamily: SERIF, fontSize: 20, color: CLAUDE.INK, fontStyle: 'italic', lineHeight: 1.5 }}>
            "Treat the first page as just a single page in a coffee table book waiting to be filled."
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT, marginTop: 8 }}>
            Source: canvas-design SKILL.md › Multi-Page Option
          </div>
        </div>
      </div>

      {/* Right: Callout cards */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
          marginBottom: 24, opacity: clamp(headerIn, 0, 1),
        }}>
          SKILL.md design choices:
        </div>

        {CALLOUTS.map((c, i) => {
          const op = clamp(calloutSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `6px solid ${i === 1 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 14, padding: '22px 26px', marginBottom: 20,
              boxShadow: '0 6px 18px rgba(61,57,41,0.08)',
              opacity: op, transform: `translateX(${(1 - op) * 22}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: CLAUDE.INK, marginBottom: 8 }}>
                {c.label}
              </div>
              <div style={{
                fontFamily: c.mono ? MONO : SANS, fontSize: 16,
                color: CLAUDE.INK_SOFT, lineHeight: 1.55,
                fontStyle: c.mono ? 'italic' : 'normal',
              }}>
                {c.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.055,
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
