import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandGuidelinesPalette — B03 — SELF-DEMO: the Anthropic brand palette.
 * Renders the exact hex values from brand-guidelines/SKILL.md as live swatches.
 * SELF-DEMO LAW: these are the actual values — not approximations.
 * VERBATIM: hex values and labels match the SKILL.md exactly.
 */

export const brandGuidelinesPaletteSchema = z.object({
  sparkLine: z.string().default('The exact RGB.'),
});
export type BrandGuidelinesPaletteProps = z.infer<typeof brandGuidelinesPaletteSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Exact values from brand-guidelines/SKILL.md — VERBATIM QUOTE LAW
const MAIN_COLORS = [
  { hex: '#141413', label: 'Dark', role: 'Primary text and dark backgrounds', textColor: '#faf9f5', accent: false },
  { hex: '#faf9f5', label: 'Light', role: 'Light backgrounds and text on dark', textColor: '#141413', border: true, accent: false },
  { hex: '#b0aea5', label: 'Mid Gray', role: 'Secondary elements', textColor: '#141413', accent: false },
  { hex: '#e8e6dc', label: 'Light Gray', role: 'Subtle backgrounds', textColor: '#141413', accent: false },
];

const ACCENT_COLORS = [
  { hex: '#d97757', label: 'Orange', role: 'Primary accent', textColor: '#fff', accent: true },
  { hex: '#6a9bcc', label: 'Blue', role: 'Secondary accent', textColor: '#fff', accent: false },
  { hex: '#788c5d', label: 'Green', role: 'Tertiary accent', textColor: '#fff', accent: false },
];

export const BrandGuidelinesPalette: React.FC<BrandGuidelinesPaletteProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const mainSprings = MAIN_COLORS.map((_, i) =>
    spring({ frame: frame - 8 - i * 12, fps, config: { damping: 30, stiffness: 130, mass: 0.85 } })
  );
  const accentSprings = ACCENT_COLORS.map((_, i) =>
    spring({ frame: frame - 60 - i * 12, fps, config: { damping: 30, stiffness: 130, mass: 0.85 } })
  );

  const labelIn = spring({ frame: frame - 4, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const accentLabelIn = spring({ frame: frame - 52, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 13, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BRAND GUIDELINES · SELF-DEMO · ANTHROPIC PALETTE
      </div>

      <div style={{
        position: 'absolute', top: H * 0.125, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        Source: brand-guidelines SKILL.md
      </div>

      {/* Main Colors label */}
      <div style={{
        position: 'absolute', top: H * 0.23, left: W * 0.07,
        fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 3,
        textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(labelIn, 0, 1),
      }}>
        Main Colors
      </div>

      {/* Main color swatches — 4 across */}
      {MAIN_COLORS.map((c, i) => {
        const op = clamp(mainSprings[i], 0, 1);
        const swatchW = (W * 0.86) / 4 - 16;
        const x = W * 0.07 + i * (swatchW + 16);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: H * 0.275, left: x, width: swatchW, height: 140,
            opacity: op, transform: `translateY(${(1 - op) * 20}px)`,
          }}>
            {/* Swatch block */}
            <div style={{
              width: '100%', height: 90,
              background: c.hex,
              border: c.border ? `2px solid ${CLAUDE.BORDER}` : 'none',
              borderRadius: '10px 10px 0 0',
              display: 'flex', alignItems: 'flex-end', padding: '0 12px 10px',
            }}>
              <div style={{
                fontFamily: MONO, fontSize: 15, color: c.textColor, opacity: 0.9,
              }}>
                {c.hex}
              </div>
            </div>
            {/* Label block */}
            <div style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`, borderTop: 'none',
              borderRadius: '0 0 10px 10px', padding: '10px 12px',
            }}>
              <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: CLAUDE.INK, marginBottom: 3 }}>
                {c.label}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
                {c.role}
              </div>
            </div>
          </div>
        );
      })}

      {/* Accent Colors label */}
      <div style={{
        position: 'absolute', top: H * 0.62, left: W * 0.07,
        fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 3,
        textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(accentLabelIn, 0, 1),
      }}>
        Accent Colors · cycles in this order for shapes
      </div>

      {/* Accent swatches */}
      {ACCENT_COLORS.map((c, i) => {
        const op = clamp(accentSprings[i], 0, 1);
        const swatchW = (W * 0.86) / 3 - 16;
        const x = W * 0.07 + i * (swatchW + 16);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: H * 0.665, left: x, width: swatchW, height: 130,
            opacity: op, transform: `translateY(${(1 - op) * 16}px)`,
          }}>
            <div style={{
              width: '100%', height: 80,
              background: c.hex,
              borderRadius: '10px 10px 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px',
            }}>
              <div style={{ fontFamily: MONO, fontSize: 16, color: c.textColor }}>
                {c.hex}
              </div>
              {i === 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.25)', borderRadius: 6,
                  padding: '3px 8px', fontFamily: SANS, fontSize: 11,
                  fontWeight: 700, color: '#fff', letterSpacing: 1,
                  textTransform: 'uppercase' as const,
                }}>
                  PRIMARY
                </div>
              )}
            </div>
            <div style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`, borderTop: 'none',
              borderRadius: '0 0 10px 10px', padding: '10px 14px',
            }}>
              <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: CLAUDE.INK, marginBottom: 2 }}>
                {c.label}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>
                {c.role}
              </div>
            </div>
          </div>
        );
      })}

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.035,
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
