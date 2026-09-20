import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ThemeFactoryThemeCard — B02 — museum spec-sheet card for the Golden Hour theme.
 * TRUE-HEX EXCEPTION: swatches render with verbatim source hexes.
 * Terracotta accent (#D97757) used only for frame chrome / borders — NEVER as a fifth swatch.
 * Swatches materialize staggered; card springs in.
 * ILLUSTRATE LAW: concept illustration, NOT a UI beat.
 *
 * Verbatim from themes/golden-hour.md:
 *   Mustard Yellow #f4a900 · Terracotta #c1666b · Warm Beige #d4b896 · Chocolate Brown #4a403a
 *   Headers: FreeSans Bold · Body: FreeSans
 *   Best for: restaurant presentations, hospitality brands, fall campaigns, cozy lifestyle content, artisan products
 */

export const themeFactoryThemeCardSchema = z.object({
  sparkLine: z.string().default('A brief, not code.'),
  theme: z.string().default('golden-hour'),
});
export type ThemeFactoryThemeCardProps = z.infer<typeof themeFactoryThemeCardSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Verbatim from themes/golden-hour.md
const SWATCHES = [
  { hex: '#f4a900', name: 'Mustard Yellow', role: 'Bold primary accent' },
  { hex: '#c1666b', name: 'Terracotta', role: 'Warm secondary color' },
  { hex: '#d4b896', name: 'Warm Beige', role: 'Neutral backgrounds' },
  { hex: '#4a403a', name: 'Chocolate Brown', role: 'Dark text and anchors' },
];

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const srgb = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function textOnSwatch(hex: string): string {
  const L = luminance(hex);
  return L > 0.179 ? '#2a1a0a' : '#fffaf0';
}

interface SwatchProps {
  hex: string;
  name: string;
  role: string;
  opacity: number;
  scale: number;
}

const Swatch: React.FC<SwatchProps> = ({ hex, name, role, opacity, scale }) => {
  const textColor = textOnSwatch(hex);
  return (
    <div style={{
      flex: 1,
      borderRadius: 14,
      overflow: 'hidden',
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'bottom center',
      boxShadow: '0 6px 24px rgba(61,57,41,0.14)',
    }}>
      {/* Color block */}
      <div style={{
        background: hex,
        height: 120,
        display: 'flex',
        alignItems: 'flex-end',
        padding: '12px 16px',
      }}>
        <span style={{
          fontFamily: MONO,
          fontSize: 14,
          color: textColor,
          fontWeight: 700,
          opacity: 0.9,
        }}>{hex.toUpperCase()}</span>
      </div>
      {/* Label */}
      <div style={{
        background: CLAUDE.CARD,
        padding: '12px 16px',
        borderTop: `2px solid ${CLAUDE.SPARK}`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: CLAUDE.INK }}>{name}</div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, marginTop: 4 }}>{role}</div>
      </div>
    </div>
  );
};

export const ThemeFactoryThemeCard: React.FC<ThemeFactoryThemeCardProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const titleIn = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const swatchSprings = SWATCHES.map((_, i) =>
    spring({ frame: frame - 16 - i * 10, fps, config: { damping: 28, stiffness: 130, mass: 0.85 } })
  );
  const fontIn = spring({ frame: frame - 58, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const bestIn = spring({ frame: frame - 68, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.06,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(cardIn, 0, 1),
      }}>
        THEME FACTORY · SPEC SHEET · TRUE HEX
      </div>

      {/* Museum card */}
      <div style={{
        position: 'absolute',
        top: height * 0.11,
        left: width * 0.08,
        right: width * 0.08,
        bottom: height * 0.13,
        background: CLAUDE.CARD,
        borderRadius: 24,
        boxShadow: '0 16px 60px rgba(61,57,41,0.14)',
        border: `1px solid ${CLAUDE.BORDER}`,
        overflow: 'hidden',
        opacity: clamp(cardIn, 0, 1),
        transform: `scale(${0.95 + 0.05 * clamp(cardIn, 0, 1)})`,
      }}>

        {/* Header stripe — terracotta accent line, the ONE accent */}
        <div style={{
          height: 5,
          background: CLAUDE.SPARK,
          width: '100%',
        }} />

        {/* Card body */}
        <div style={{ padding: '32px 48px 28px', height: 'calc(100% - 5px)', display: 'flex', flexDirection: 'column' }}>

          {/* Theme name + badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
            opacity: clamp(titleIn, 0, 1),
            transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
          }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 8 }}>
                THEME 05 OF 10
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.1 }}>
                Golden Hour
              </div>
              <div style={{ fontFamily: SANS, fontSize: 16, color: CLAUDE.INK_SOFT, marginTop: 6, fontStyle: 'italic' }}>
                A rich and warm autumnal palette
              </div>
            </div>
            <div style={{
              background: CLAUDE.PAGE,
              border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 12,
              padding: '14px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.GHOST, textTransform: 'uppercase' as const }}>VERBATIM FROM</div>
              <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK, marginTop: 4 }}>themes/golden-hour.md</div>
            </div>
          </div>

          {/* Swatches row */}
          <div style={{
            display: 'flex',
            gap: 14,
            flex: '1 1 auto',
            minHeight: 0,
            marginBottom: 28,
          }}>
            {SWATCHES.map((sw, i) => (
              <Swatch
                key={sw.hex}
                hex={sw.hex}
                name={sw.name}
                role={sw.role}
                opacity={clamp(swatchSprings[i], 0, 1)}
                scale={0.88 + 0.12 * clamp(swatchSprings[i], 0, 1)}
              />
            ))}
          </div>

          {/* Typography + Best-for row */}
          <div style={{
            display: 'flex',
            gap: 24,
            opacity: clamp(fontIn, 0, 1),
            transform: `translateY(${(1 - clamp(fontIn, 0, 1)) * 8}px)`,
          }}>
            {/* Typography spec */}
            <div style={{
              flex: '0 0 auto',
              background: CLAUDE.PAGE,
              borderRadius: 10,
              padding: '14px 20px',
              border: `1px solid ${CLAUDE.BORDER}`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.GHOST, textTransform: 'uppercase' as const, marginBottom: 8 }}>TYPOGRAPHY</div>
              <div style={{ fontFamily: SANS, fontSize: 16, color: CLAUDE.INK }}>
                <span style={{ fontWeight: 700 }}>Headers:</span> FreeSans Bold
              </div>
              <div style={{ fontFamily: SANS, fontSize: 16, color: CLAUDE.INK, marginTop: 4 }}>
                <span style={{ fontWeight: 700 }}>Body:</span> FreeSans
              </div>
            </div>

            {/* Best-for plaque */}
            <div style={{
              flex: 1,
              background: 'rgba(217,119,87,0.07)',
              border: `1px solid ${CLAUDE.SPARK}`,
              borderRadius: 10,
              padding: '14px 20px',
              opacity: clamp(bestIn, 0, 1),
              transform: `translateY(${(1 - clamp(bestIn, 0, 1)) * 6}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 8 }}>BEST USED FOR</div>
              <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK, lineHeight: 1.5 }}>
                Restaurant presentations, hospitality brands, fall campaigns, cozy lifestyle content, artisan products.
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.GHOST, marginTop: 6 }}>
                — verbatim from themes/golden-hour.md
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Spark line — bottom left */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.05,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
