import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandGuidelinesTypography — B04 — SELF-DEMO: Poppins vs Lora type specimens.
 * Shows the 24pt threshold rule visually: above is heading, below is body.
 * The fallback chain (Arial/Georgia) is shown as a secondary note.
 * SELF-DEMO LAW: real font names from the SKILL.md, not an approximation.
 */

export const brandGuidelinesTypographySchema = z.object({
  sparkLine: z.string().default('24pt is the line.'),
});
export type BrandGuidelinesTypographyProps = z.infer<typeof brandGuidelinesTypographySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (v: number, a: number, b: number, c: number, d: number) => c + ((v - a) / (b - a)) * (d - c);


export const BrandGuidelinesTypography: React.FC<BrandGuidelinesTypographyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 95, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const headingIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const bodyIn = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const lineIn = spring({ frame: frame - 50, fps, config: { damping: 40, stiffness: 200, mass: 0.8 } });
  const rulesIn = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 110, mass: 0.95 } });
  const fallbackIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  // The threshold line position
  const thresholdY = H * 0.48;
  const lineWidth = clamp(lineIn, 0, 1) * (W * 0.86);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 13, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BRAND GUIDELINES · SELF-DEMO · TYPOGRAPHY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.125, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        Two fonts. One threshold.
      </div>

      {/* Left column: heading zone */}
      <div style={{
        position: 'absolute', top: H * 0.22, left: W * 0.07, width: W * 0.40,
        opacity: clamp(headingIn, 0, 1),
        transform: `translateY(${(1 - clamp(headingIn, 0, 1)) * 14}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 16,
        }}>
          Headings · 24pt and above
        </div>
        {/* Poppins specimen */}
        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderTop: `4px solid ${CLAUDE.SPARK}`,
          borderRadius: 12, padding: '22px 28px',
          boxShadow: '0 6px 20px rgba(61,57,41,0.09)',
        }}>
          <div style={{
            fontFamily: 'Poppins, Arial, sans-serif',
            fontSize: 42, fontWeight: 700, color: '#141413',
            lineHeight: 1.1, marginBottom: 10,
          }}>
            Poppins
          </div>
          <div style={{
            fontFamily: 'Poppins, Arial, sans-serif',
            fontSize: 28, fontWeight: 400, color: '#141413',
            lineHeight: 1.3, marginBottom: 14,
          }}>
            Quarterly Report
          </div>
          <div style={{
            fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT,
          }}>
            font: Poppins · fallback: Arial
          </div>
        </div>
        <div style={{
          marginTop: 14, fontFamily: SANS, fontSize: 16, color: CLAUDE.INK_SOFT, lineHeight: 1.5,
        }}>
          Applied to any text element where<br />point size ≥ 24. The SKILL.md says:<br />
          <span style={{ color: CLAUDE.SPARK, fontFamily: MONO, fontSize: 14 }}>
            "Headings (24pt and larger)"
          </span>
        </div>
      </div>

      {/* Threshold divider — vertical line in the middle */}
      <div style={{
        position: 'absolute', top: H * 0.22, left: W * 0.50 - 1,
        width: 2, height: H * 0.55,
        background: CLAUDE.BORDER,
        opacity: clamp(lineIn, 0, 1),
      }} />
      <div style={{
        position: 'absolute', top: H * 0.22 + H * 0.55 / 2 - 20,
        left: W * 0.50 - 40,
        width: 80, height: 40,
        background: CLAUDE.SPARK, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 1,
        opacity: clamp(lineIn, 0, 1),
      }}>
        24 pt
      </div>

      {/* Right column: body zone */}
      <div style={{
        position: 'absolute', top: H * 0.22, left: W * 0.54, width: W * 0.40,
        opacity: clamp(bodyIn, 0, 1),
        transform: `translateY(${(1 - clamp(bodyIn, 0, 1)) * 14}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 16,
        }}>
          Body Text · below 24pt
        </div>
        {/* Lora specimen */}
        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderTop: `4px solid ${CLAUDE.INK_SOFT}`,
          borderRadius: 12, padding: '22px 28px',
          boxShadow: '0 6px 20px rgba(61,57,41,0.09)',
        }}>
          <div style={{
            fontFamily: 'Lora, Georgia, serif',
            fontSize: 26, fontWeight: 400, color: '#141413',
            lineHeight: 1.2, marginBottom: 10,
          }}>
            Lora
          </div>
          <div style={{
            fontFamily: 'Lora, Georgia, serif',
            fontSize: 18, fontWeight: 400, color: '#141413',
            lineHeight: 1.6, marginBottom: 14,
          }}>
            Revenue grew 14% year over year,<br />driven by enterprise subscription growth.
          </div>
          <div style={{
            fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT,
          }}>
            font: Lora · fallback: Georgia
          </div>
        </div>
        <div style={{
          marginTop: 14, fontFamily: SANS, fontSize: 16, color: CLAUDE.INK_SOFT, lineHeight: 1.5,
        }}>
          Applied to all text below the threshold.<br />SKILL.md: <span style={{ color: CLAUDE.INK_SOFT, fontFamily: MONO, fontSize: 14 }}>
            "Body Text: Lora (with Georgia fallback)"
          </span>
        </div>
      </div>

      {/* Fallback note */}
      <div style={{
        position: 'absolute', bottom: H * 0.10, left: W * 0.07, right: W * 0.07,
        padding: '14px 22px',
        background: 'rgba(176,174,165,0.10)', border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        opacity: clamp(fallbackIn, 0, 1),
        transform: `translateY(${(1 - clamp(fallbackIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SANS, fontSize: 16, color: CLAUDE.INK_SOFT }}>
          Fallback chain: <span style={{ fontFamily: MONO, color: CLAUDE.INK }}>Poppins → Arial</span> (headings) · <span style={{ fontFamily: MONO, color: CLAUDE.INK }}>Lora → Georgia</span> (body) — works on every system without installation.
        </span>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
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
