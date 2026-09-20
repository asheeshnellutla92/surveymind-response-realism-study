import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WebArtifactsDesign — B02 — Anti-slop design mandate + bundle anatomy.
 */

export const webArtifactsDesignSchema = z.object({
  sparkLine: z.string().default('No centered layouts. No purple gradients. No Inter font.'),
});
export type WebArtifactsDesignProps = z.infer<typeof webArtifactsDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const ANTI_SLOP = [
  { rule: 'No excessive centered layouts', note: 'AI slop pattern #1 — vary alignment, use grids' },
  { rule: 'No purple gradients', note: 'AI slop pattern #2 — use purposeful, branded color' },
  { rule: 'No uniform rounded corners', note: 'AI slop pattern #3 — vary radius by context' },
  { rule: 'No Inter font', note: 'AI slop pattern #4 — pick a font with intent' },
];

const BUNDLE_FACTS = [
  { label: 'Input requirement', detail: 'index.html must exist in project root — bundle-artifact.sh fails without it' },
  { label: 'Build chain', detail: 'Parcel (no source maps) → html-inline → single self-contained bundle.html' },
  { label: 'What\'s inlined', detail: 'All JS, CSS, Tailwind classes, shadcn/ui styles, Radix UI, and any imports' },
  { label: 'Node requirement', detail: 'Node 18+ required — init-artifact.sh auto-detects and pins Vite version' },
];

export const WebArtifactsDesign: React.FC<WebArtifactsDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const slopSprings = ANTI_SLOP.map((_, i) =>
    spring({ frame: frame - 22 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const bundleSprings = BUNDLE_FACTS.map((_, i) =>
    spring({ frame: frame - 40 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const SLOP_H = (H * 0.64) / 4 - 12;
  const BUNDLE_H = (H * 0.60) / 4 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        WEB ARTIFACTS BUILDER · DESIGN MANDATE
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Avoid AI slop. Taste required.
      </div>

      {/* Left: 4 anti-slop rules */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.04, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 12,
          opacity: clamp(calloutIn, 0, 1),
        }}>
          AVOID (AI SLOP PATTERNS):
        </div>
        {ANTI_SLOP.map((item, i) => {
          const op = clamp(slopSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.04)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `5px solid ${CLAUDE.SPARK}`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 10,
              height: SLOP_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 12px rgba(217,119,87,0.08)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK, marginBottom: 5 }}>✗ {item.rule}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.SPARK }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* Right: bundle anatomy */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12,
          opacity: clamp(bundleSprings[0], 0, 1),
        }}>
          BUNDLE ANATOMY:
        </div>
        {BUNDLE_FACTS.map((item, i) => {
          const op = clamp(bundleSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `5px solid ${CLAUDE.INK}`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 10,
              height: BUNDLE_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.SPARK, fontWeight: 700, marginBottom: 5 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.4 }}>{item.detail}</div>
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
