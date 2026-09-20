import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CanvasDesignPhilosophy — B03 — SELF-DEMO: design philosophy structure.
 * Left: Movement name + structure (5 visual dimensions).
 * Right: The craftsmanship mandate + example from SKILL.md.
 * FILL-THE-CANVAS: header 20%, two columns 21%–90%, spark line bottom.
 */

export const canvasDesignPhilosophySchema = z.object({
  sparkLine: z.string().default('Claude writes the brief first.'),
});
export type CanvasDesignPhilosophyProps = z.infer<typeof canvasDesignPhilosophySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const DIMENSIONS = [
  { label: 'Space and form', delay: 20 },
  { label: 'Color and material', delay: 30 },
  { label: 'Scale and rhythm', delay: 40 },
  { label: 'Composition and balance', delay: 50 },
  { label: 'Visual hierarchy', delay: 60 },
];

const EXAMPLES = [
  { name: '"Geometric Silence"', detail: 'Grid-based precision, bold photography or stark graphics, dramatic negative space. Swiss formalism meets Brutalist material honesty.', delay: 24 },
  { name: '"Chromatic Language"', detail: 'Color as the primary information system. Geometric precision where color zones create meaning. Josef Albers meets data visualization.', delay: 44 },
  { name: '"Analog Meditation"', detail: 'Paper grain, ink bleeds, vast negative space. Photography dominates. Japanese photobook aesthetic.', delay: 64 },
];

export const CanvasDesignPhilosophy: React.FC<CanvasDesignPhilosophyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const mandateIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const dimSprings = DIMENSIONS.map(d =>
    spring({ frame: frame - d.delay, fps, config: { damping: 30, stiffness: 130, mass: 0.8 } })
  );
  const exSprings = EXAMPLES.map(e =>
    spring({ frame: frame - e.delay, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.42;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.44;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CANVAS DESIGN · SELF-DEMO · DESIGN PHILOSOPHY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 52, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Name the movement. Write the manifesto.
      </div>

      {/* Left: structure */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        {/* Movement name callout */}
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 14, padding: '18px 22px',
          marginBottom: 24, opacity: clamp(mandateIn, 0, 1),
          transform: `translateY(${(1 - clamp(mandateIn, 0, 1)) * 12}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 16, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 6 }}>
            Step 1: Name the movement
          </div>
          <div style={{ fontFamily: MONO, fontSize: 24, color: CLAUDE.INK, fontWeight: 700 }}>
            "Geometric Silence"
          </div>
          <div style={{ fontFamily: MONO, fontSize: 15, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
            1–2 words. An aesthetic movement, not a description.
          </div>
        </div>

        {/* 5 visual dimensions */}
        <div style={{
          fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 16,
          opacity: clamp(mandateIn, 0, 1),
        }}>
          5 VISUAL DIMENSIONS (required)
        </div>
        {DIMENSIONS.map((dim, i) => {
          const op = clamp(dimSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: 14, opacity: op,
              transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: CLAUDE.SPARK, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#FFFFFF',
              }}>
                {i + 1}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 20, color: CLAUDE.INK, lineHeight: 1.3 }}>
                {dim.label}
              </div>
            </div>
          );
        })}

        {/* Craftsmanship mandate */}
        <div style={{
          marginTop: 22,
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 12, padding: '16px 20px',
          opacity: clamp(dimSprings[4], 0, 1),
          boxShadow: '0 4px 14px rgba(61,57,41,0.07)',
        }}>
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 2 }}>
            CRAFTSMANSHIP MANDATE
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 18, color: CLAUDE.INK, fontStyle: 'italic', lineHeight: 1.5 }}>
            "REPEATEDLY emphasize that the final work appears as though it took countless hours to create."
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT, marginTop: 6 }}>
            Source: canvas-design SKILL.md › Critical Guidelines
          </div>
        </div>
      </div>

      {/* Right: examples from SKILL.md */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
          marginBottom: 24, opacity: clamp(headerIn, 0, 1),
        }}>
          PHILOSOPHY EXAMPLES (from SKILL.md):
        </div>

        {EXAMPLES.map((ex, i) => {
          const op = clamp(exSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `6px solid ${i === 0 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 14, padding: '22px 26px', marginBottom: 22,
              boxShadow: '0 6px 18px rgba(61,57,41,0.08)',
              opacity: op, transform: `translateX(${(1 - op) * 22}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: CLAUDE.INK, marginBottom: 8 }}>
                {ex.name}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 16, color: CLAUDE.INK_SOFT, lineHeight: 1.55 }}>
                {ex.detail}
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
