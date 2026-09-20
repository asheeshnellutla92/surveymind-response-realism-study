import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandGuidelinesAnatomy — B01 — skill folder tree + contents.
 * FILL-THE-CANVAS: top 20% header, left 45% = folder tree,
 * right 45% = three large spec cards filling down to ~85% height.
 */

export const brandGuidelinesAnatomySchema = z.object({
  sparkLine: z.string().default('The guide is the code.'),
});
export type BrandGuidelinesAnatomyProps = z.infer<typeof brandGuidelinesAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const ENTRIES = [
  { indent: 0, icon: '📁', name: 'brand-guidelines/', accent: false, delay: 0 },
  { indent: 1, icon: '📄', name: 'SKILL.md', size: '1,248 B', accent: true, delay: 10 },
  { indent: 1, icon: '📄', name: 'LICENSE.txt', accent: false, delay: 20 },
];

const CALLOUT_ITEMS = [
  {
    label: 'Colors',
    detail: 'Dark · Light · Mid Gray · Light Gray · 3 accents (orange, blue, green)',
    accent: true,
  },
  {
    label: 'Typography',
    detail: 'Poppins for headings (24pt+) · Lora for body · fallback chains included',
    accent: false,
  },
  {
    label: 'Application rules',
    detail: 'Size threshold · contrast selection · accent cycling for shapes',
    accent: false,
  },
];

export const BrandGuidelinesAnatomy: React.FC<BrandGuidelinesAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const entrySprings = ENTRIES.map((e) =>
    spring({ frame: frame - e.delay, fps, config: { damping: 30, stiffness: 140, mass: 0.8 } })
  );
  const calloutIn = spring({ frame: frame - 32, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const calloutItemSprings = CALLOUT_ITEMS.map((_, i) =>
    spring({ frame: frame - 44 - i * 14, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.40;
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
        BRAND GUIDELINES · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 52, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        One file. The entire brand.
      </div>

      {/* Left: folder tree */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.07, width: LEFT_W }}>
        {ENTRIES.map((e, i) => {
          const op = clamp(entrySprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              paddingLeft: e.indent * 48, marginBottom: 28,
              opacity: op, transform: `translateY(${(1 - op) * 14}px)`,
            }}>
              <span style={{ fontFamily: MONO, fontSize: 26, color: e.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT }}>
                {e.icon}
              </span>
              <span style={{
                fontFamily: MONO, fontSize: 28,
                color: e.accent ? CLAUDE.SPARK : CLAUDE.INK,
                fontWeight: e.accent ? 700 : 400,
              }}>
                {e.name}
              </span>
              {'size' in e && e.size && (
                <span style={{ fontFamily: MONO, fontSize: 18, color: CLAUDE.GHOST, marginLeft: 10 }}>
                  {e.size}
                </span>
              )}
            </div>
          );
        })}

        {/* SKILL.md callout — anchored under the tree */}
        <div style={{
          marginTop: 20, marginLeft: 48,
          padding: '24px 28px',
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 14,
          opacity: clamp(calloutIn, 0, 1),
          transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 12}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 21, color: CLAUDE.SPARK, fontWeight: 700, marginBottom: 10 }}>
            The entire specification.
          </div>
          <div style={{ fontFamily: SANS, fontSize: 18, color: CLAUDE.INK_SOFT, lineHeight: 1.55 }}>
            One markdown file Claude reads before every run. No scripts. No templates. Just instructions.
          </div>
        </div>

        {/* Bottom insight quote */}
        <div style={{
          marginTop: 36, marginLeft: 0,
          padding: '22px 28px',
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 14, boxShadow: '0 4px 16px rgba(61,57,41,0.07)',
          opacity: clamp(calloutIn * 0.8, 0, 1),
        }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, color: CLAUDE.INK, lineHeight: 1.5, fontStyle: 'italic' }}>
            "The brand guide became the instruction set."
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT, marginTop: 8 }}>
            Source: Anthropic, brand-guidelines SKILL.md (frontmatter description)
          </div>
        </div>
      </div>

      {/* Right: 3 large spec cards */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 15, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
          marginBottom: 28, opacity: clamp(calloutIn, 0, 1),
        }}>
          SKILL.md contains:
        </div>

        {CALLOUT_ITEMS.map((item, i) => {
          const op = clamp(calloutItemSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `6px solid ${i === 0 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 14, padding: '26px 30px', marginBottom: 24,
              boxShadow: '0 6px 20px rgba(61,57,41,0.08)',
              opacity: op, transform: `translateX(${(1 - op) * 24}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 700, color: CLAUDE.INK, marginBottom: 10 }}>
                {item.label}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: CLAUDE.INK_SOFT, lineHeight: 1.55 }}>
                {item.detail}
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
