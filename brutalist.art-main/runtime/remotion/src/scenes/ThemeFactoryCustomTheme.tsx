import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ThemeFactoryCustomTheme — B07 — a new "Brutalist Cream" theme card assembles
 * on screen using the skill's spec format (swatch + name + hex + best-for).
 * A review chip labeled "PENDING SIGN-OFF" sits over the APPLY button, blocking it.
 * Spark line: "The gate survives."
 * ILLUSTRATE LAW: concept illustration, NOT a UI beat.
 */

export const themeFactoryCustomThemeSchema = z.object({
  sparkLine: z.string().default('The gate survives.'),
});
export type ThemeFactoryCustomThemeProps = z.infer<typeof themeFactoryCustomThemeSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// "Brutalist Cream" custom theme swatches
const CUSTOM_SWATCHES = [
  { hex: '#FAF9F5', name: 'Cream Paper', role: 'Ground / page background' },
  { hex: '#3D3929', name: 'Warm Ink', role: 'Primary text + anchors' },
  { hex: '#D97757', name: 'Terracotta', role: 'THE accent — one per beat' },
  { hex: '#73705F', name: 'Ink Soft', role: 'Secondary text, chrome' },
];

function textOnSwatch(hex: string): string {
  function lum(h: string): number {
    const r = parseInt(h.slice(1, 3), 16) / 255;
    const g = parseInt(h.slice(3, 5), 16) / 255;
    const b = parseInt(h.slice(5, 7), 16) / 255;
    const srgb = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  }
  return lum(hex) > 0.179 ? '#2a1a0a' : '#fffaf0';
}

export const ThemeFactoryCustomTheme: React.FC<ThemeFactoryCustomThemeProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const titleIn = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const swatchSprings = CUSTOM_SWATCHES.map((_, i) =>
    spring({ frame: frame - 14 - i * 10, fps, config: { damping: 28, stiffness: 130, mass: 0.85 } })
  );
  const fontIn = spring({ frame: frame - 58, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const applyIn = spring({ frame: frame - 68, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const pendingIn = spring({ frame: frame - 78, fps, config: { damping: 28, stiffness: 130, mass: 0.85 } });
  const sparkIn = spring({ frame: frame - 92, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  // Pending chip pulse (draws attention)
  const pendingPulse = 0.8 + 0.2 * Math.sin(frame * 0.18);

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
        THEME FACTORY · CUSTOM THEME · ESCAPE HATCH
      </div>

      {/* Custom theme spec card */}
      <div style={{
        position: 'absolute',
        top: height * 0.12,
        left: width * 0.08,
        right: width * 0.08,
        bottom: height * 0.14,
        background: CLAUDE.CARD,
        borderRadius: 24,
        boxShadow: '0 16px 60px rgba(61,57,41,0.14)',
        border: `1px solid ${CLAUDE.BORDER}`,
        overflow: 'hidden',
        opacity: clamp(cardIn, 0, 1),
        transform: `scale(${0.95 + 0.05 * clamp(cardIn, 0, 1)})`,
      }}>
        {/* Accent stripe */}
        <div style={{ height: 5, background: CLAUDE.SPARK }} />

        <div style={{ padding: '28px 44px 24px', height: 'calc(100% - 5px)', display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            opacity: clamp(titleIn, 0, 1),
            transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
          }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 8 }}>
                GENERATED THEME · CUSTOM
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 46, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.1 }}>
                Brutalist Cream
              </div>
              <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK_SOFT, marginTop: 6, fontStyle: 'italic' }}>
                Warm ink on cream paper, one terracotta accent
              </div>
            </div>
            <div style={{
              background: CLAUDE.PAGE,
              border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 12,
              padding: '12px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: CLAUDE.GHOST, textTransform: 'uppercase' as const }}>GENERATED BY</div>
              <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, marginTop: 4 }}>theme-factory skill</div>
            </div>
          </div>

          {/* Swatches */}
          <div style={{ display: 'flex', gap: 12, flex: '1 1 auto', minHeight: 0, marginBottom: 24 }}>
            {CUSTOM_SWATCHES.map((sw, i) => {
              const op = clamp(swatchSprings[i], 0, 1);
              const textColor = textOnSwatch(sw.hex);
              return (
                <div key={sw.hex} style={{
                  flex: 1,
                  borderRadius: 14,
                  overflow: 'hidden',
                  opacity: op,
                  transform: `scale(${0.88 + 0.12 * op})`,
                  transformOrigin: 'bottom center',
                  boxShadow: `0 4px 18px rgba(61,57,41,0.12), inset 0 0 0 1px ${CLAUDE.BORDER}`,
                }}>
                  <div style={{ background: sw.hex, height: 100, display: 'flex', alignItems: 'flex-end', padding: '10px 14px', border: sw.hex === '#FAF9F5' ? `1px solid ${CLAUDE.BORDER}` : 'none' }}>
                    <span style={{ fontFamily: MONO, fontSize: 13, color: textColor, fontWeight: 700, opacity: 0.9 }}>{sw.hex.toUpperCase()}</span>
                  </div>
                  <div style={{ background: CLAUDE.CARD, padding: '10px 14px', borderTop: `2px solid ${CLAUDE.SPARK}` }}>
                    <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: CLAUDE.INK }}>{sw.name}</div>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, marginTop: 3 }}>{sw.role}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Typography + Best-for */}
          <div style={{
            display: 'flex',
            gap: 20,
            marginBottom: 20,
            opacity: clamp(fontIn, 0, 1),
            transform: `translateY(${(1 - clamp(fontIn, 0, 1)) * 8}px)`,
          }}>
            <div style={{ flex: '0 0 auto', background: CLAUDE.PAGE, borderRadius: 10, padding: '12px 18px', border: `1px solid ${CLAUDE.BORDER}` }}>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: CLAUDE.GHOST, textTransform: 'uppercase' as const, marginBottom: 6 }}>TYPOGRAPHY</div>
              <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK }}><span style={{ fontWeight: 700 }}>H:</span> EB Garamond Serif</div>
              <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK, marginTop: 3 }}><span style={{ fontWeight: 700 }}>B:</span> System UI Sans</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`, borderRadius: 10, padding: '12px 18px' }}>
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 6 }}>BEST USED FOR</div>
              <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK, lineHeight: 1.5 }}>
                Educational video, editorial teardowns, brutalist typography channels, practitioner documentation.
              </div>
            </div>
          </div>

          {/* APPLY button with PENDING SIGN-OFF chip blocking it */}
          <div style={{
            position: 'relative',
            opacity: clamp(applyIn, 0, 1),
            transform: `translateY(${(1 - clamp(applyIn, 0, 1)) * 8}px)`,
          }}>
            {/* Apply button (dimmed, blocked) */}
            <div style={{
              background: CLAUDE.BORDER,
              borderRadius: 12,
              padding: '16px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              opacity: 0.4,
              userSelect: 'none' as const,
            }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: CLAUDE.GHOST }} />
              <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: CLAUDE.INK_SOFT }}>
                Apply theme to artifact
              </span>
            </div>

            {/* PENDING SIGN-OFF chip — overlaid, blocking */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * clamp(pendingIn, 0, 1)})`,
              background: CLAUDE.SPARK,
              borderRadius: 10,
              padding: '10px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              opacity: clamp(pendingIn, 0, 1) * pendingPulse,
              boxShadow: `0 4px 24px rgba(217,119,87,0.4)`,
              zIndex: 2,
            }}>
              {/* Warning icon */}
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 900, color: '#FFFFFF', letterSpacing: 1, textTransform: 'uppercase' as const }}>
                PENDING SIGN-OFF
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Verbatim quote */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.09,
        left: width * 0.16,
        right: width * 0.16,
        fontFamily: MONO,
        fontSize: 13,
        color: CLAUDE.GHOST,
        textAlign: 'center',
        opacity: clamp(pendingIn, 0, 1),
      }}>
        "After generating the theme, show it for review and verification." — SKILL.md
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.04,
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
