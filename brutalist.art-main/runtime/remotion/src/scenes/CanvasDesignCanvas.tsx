import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CanvasDesignCanvas — B04 — SELF-DEMO: the canvas output phase.
 * Renders a live Geometric Silence composition demonstrating what
 * canvas-design generates: 90% visual, 10% text, geometric precision,
 * negative space, minimal typography.
 * FILL-THE-CANVAS: header zone + full-width canvas demo.
 */

export const canvasDesignCanvasSchema = z.object({
  sparkLine: z.string().default('90% visual. 10% text.'),
});
export type CanvasDesignCanvasProps = z.infer<typeof canvasDesignCanvasSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (v: number, a: number, b: number, c: number, d: number) =>
  c + ((clamp(v, a, b) - a) / (b - a)) * (d - c);


// Geometric Silence palette (from SKILL.md example)
const GS = {
  dark: '#1C1A17',
  mid: '#6B6860',
  light: '#E8E5DC',
  accent: CLAUDE.SPARK, // #D97757 — terracotta (one warm moment)
  page: '#F5F3EE',
};

export const CanvasDesignCanvas: React.FC<CanvasDesignCanvasProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const p = clamp(frame / (fps * 6), 0, 1);

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const labelIn = spring({ frame: frame - 60, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });

  // Canvas reveal progress
  const canvasReveal = clamp(remap(p, 0.05, 0.40, 0, 1), 0, 1);
  const gridReveal = clamp(remap(p, 0.10, 0.50, 0, 1), 0, 1);
  const shapeReveal = clamp(remap(p, 0.20, 0.60, 0, 1), 0, 1);
  const textReveal = clamp(remap(p, 0.50, 0.75, 0, 1), 0, 1);
  const annotReveal = clamp(remap(p, 0.60, 0.85, 0, 1), 0, 1);

  // Canvas frame sits in left 55% of the screen; right side has annotation labels
  const CX = W * 0.06;
  const CY = H * 0.19;
  const CW = W * 0.52;
  const CH = H * 0.72;

  // Grid lines inside canvas (5 vertical, 4 horizontal)
  const gCols = 5;
  const gRows = 4;

  // Large geometric block — left 35% of canvas, top 55%
  const blockW = CW * 0.38;
  const blockH = CH * 0.55;

  // Thin horizontal rule at 30% height of canvas
  const ruleY = CY + CH * 0.30;

  // Right side annotations
  const ANNOT_X = W * 0.63;

  const annotations = [
    { label: 'Geometric precision', sub: 'Grid-based structure', y: CY + CH * 0.10, delay: 0.62 },
    { label: 'Negative space', sub: '"Large quiet zones"', y: CY + CH * 0.36, delay: 0.68 },
    { label: 'Minimal typography', sub: '"Small essential text"', y: CY + CH * 0.63, delay: 0.74 },
    { label: 'One warm accent', sub: 'SKILL.md: terracotta #d97757', y: CY + CH * 0.83, delay: 0.80 },
  ];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CANVAS DESIGN · SELF-DEMO · GEOMETRIC SILENCE
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 48, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Live from the philosophy.
      </div>

      {/* Canvas frame */}
      <div style={{
        position: 'absolute', left: CX, top: CY, width: CW, height: CH,
        background: GS.page, border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(61,57,41,0.18)',
        opacity: canvasReveal,
      }}>
        {/* SVG grid lines */}
        <svg width={CW} height={CH} style={{ position: 'absolute', inset: 0, opacity: gridReveal * 0.15 }}>
          {Array.from({ length: gCols + 1 }, (_, i) => (
            <line key={`v${i}`} x1={(CW / gCols) * i} y1={0} x2={(CW / gCols) * i} y2={CH}
              stroke={GS.dark} strokeWidth={0.5} />
          ))}
          {Array.from({ length: gRows + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={(CH / gRows) * i} x2={CW} y2={(CH / gRows) * i}
              stroke={GS.dark} strokeWidth={0.5} />
          ))}
        </svg>

        {/* Large dark block — left side */}
        <div style={{
          position: 'absolute', left: 0, top: 0, width: blockW, height: blockH,
          background: GS.dark,
          opacity: shapeReveal,
          transform: `scaleY(${shapeReveal})`,
          transformOrigin: 'top left',
        }} />

        {/* Accent strip at bottom of block */}
        <div style={{
          position: 'absolute', left: 0, top: blockH, width: blockW, height: 6,
          background: GS.accent,
          opacity: shapeReveal,
        }} />

        {/* Thin horizontal rule */}
        <div style={{
          position: 'absolute', left: 0, top: ruleY - CY, width: CW, height: 1,
          background: GS.mid,
          opacity: gridReveal * 0.4,
        }} />

        {/* Minimal typography — bottom left of dark block */}
        <div style={{
          position: 'absolute', left: blockW + 24, top: 32,
          opacity: textReveal,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 3, color: GS.mid, marginBottom: 8, textTransform: 'uppercase' as const }}>
            PHILOSOPHY · 2026
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: GS.dark,
            lineHeight: 1.2,
          }}>
            Geometric<br />Silence
          </div>
          <div style={{
            fontFamily: SANS, fontSize: 11, color: GS.mid, marginTop: 12,
            maxWidth: CW - blockW - 48, lineHeight: 1.5,
          }}>
            Pure order. Restraint. Structure communicates, not words.
          </div>
        </div>

        {/* Small label bottom right */}
        <div style={{
          position: 'absolute', right: 20, bottom: 16,
          fontFamily: MONO, fontSize: 10, color: GS.mid,
          opacity: textReveal,
        }}>
          canvas-design · SKILL.md
        </div>

        {/* Geometric accent circle (top right) */}
        <svg style={{ position: 'absolute', right: 20, top: 20 }}
          width={60} height={60} viewBox="0 0 60 60">
          <circle cx={30} cy={30} r={28} fill="none" stroke={GS.accent}
            strokeWidth={1.5} opacity={shapeReveal * 0.6} />
          <circle cx={30} cy={30} r={4} fill={GS.accent} opacity={shapeReveal} />
        </svg>
      </div>

      {/* Right: annotations */}
      {annotations.map((ann, i) => {
        const op = clamp(remap(p, ann.delay, ann.delay + 0.12, 0, 1), 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute', left: ANNOT_X, top: ann.y - 24,
            opacity: op, transform: `translateX(${(1 - op) * 16}px)`,
          }}>
            {/* Connector line */}
            <svg style={{ position: 'absolute', left: -32, top: 20, overflow: 'visible' }}
              width={28} height={1}>
              <line x1={0} y1={0} x2={28} y2={0} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
            </svg>
            <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: CLAUDE.INK }}>
              {ann.label}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT, marginTop: 2 }}>
              {ann.sub}
            </div>
          </div>
        );
      })}

      {/* Bottom label */}
      <div style={{
        position: 'absolute', left: CX, bottom: H * 0.04,
        fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT,
        opacity: clamp(labelIn, 0, 1),
      }}>
        Source: canvas-design SKILL.md › "Geometric Silence" philosophy example
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', right: W * 0.05, bottom: H * 0.04,
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
