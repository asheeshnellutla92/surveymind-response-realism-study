import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PrincipalsHierarchy — "Claude's Three Principals" B02
 * Source: Anthropic Claude Constitution, January 2026
 *
 * Three stacked horizontal bands, animating in top → bottom.
 * TOP (widest): "Anthropic" — hardcoded limits · training-time rules
 * MIDDLE:       "Operator" — system prompt · can restrict · signs ToS
 * BOTTOM (narrowest): "User" — conversation messages · protected floor
 *
 * Terracotta: a bold dividing line between Operator and User, labeled
 * "protected floor — operator cannot cross." ONE terracotta accent per beat.
 */

export const principalsHierarchySchema = z.object({
  sparkLine: z.string().default('Authority by design.'),
});

export type PrincipalsHierarchyProps = z.infer<typeof principalsHierarchySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const LAYERS = [
  {
    label: 'Anthropic',
    sublabel: 'Trains Claude · sets the rules everyone else works within',
    chips: ['hardcoded limits', 'training-time rules', 'cannot be overridden'],
    widthFraction: 1.0,
    opacityLevel: 1.0,
    bg: CLAUDE.CARD,
  },
  {
    label: 'Operator',
    sublabel: 'The company that built the app you\'re using',
    chips: ['system prompt', 'can restrict topics', 'can require persona', 'signs Anthropic ToS'],
    widthFraction: 0.82,
    opacityLevel: 0.9,
    bg: CLAUDE.PILL,
  },
  {
    label: 'User',
    sublabel: 'You — in the conversation',
    chips: ['conversation messages', 'protected floor', 'adjusted within operator grant'],
    widthFraction: 0.62,
    opacityLevel: 0.75,
    bg: CLAUDE.FOOTER,
  },
];

export const PrincipalsHierarchy: React.FC<PrincipalsHierarchyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const staggerDelay = 30;
  const bandAnims = LAYERS.map((_, i) =>
    spring({ frame: frame - i * staggerDelay, fps, config: { damping: 26, stiffness: 90, mass: 0.9 } })
  );

  const titleIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });
  const floorIn = spring({ frame: frame - staggerDelay * 2 - 10, fps, config: { damping: 24, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - staggerDelay * 2 - 45, fps, config: { damping: 28, stiffness: 90, mass: 0.9 } });
  const citeIn = spring({ frame: frame - staggerDelay * 2 - 55, fps, config: { damping: 28, stiffness: 90, mass: 0.9 } });

  const PAD_X = width * 0.08;
  const PAD_Y = height * 0.08;
  const BAND_AREA_TOP = height * 0.28;
  const BAND_AREA_H = height * 0.52;
  const BAND_H = BAND_AREA_H / 3 - 10;
  const MAX_W = width - PAD_X * 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.014,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        AI DESIGN · CLAUDE CONSTITUTION
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.06,
        fontFamily: SERIF,
        fontSize: height * 0.038,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        The Principal Hierarchy
      </div>

      {/* Band rows */}
      {LAYERS.map((layer, i) => {
        const anim = bandAnims[i];
        const bandY = BAND_AREA_TOP + i * (BAND_H + 14);
        const bandW = MAX_W * layer.widthFraction;
        const bandLeft = PAD_X + (MAX_W - bandW) / 2;

        return (
          <div key={layer.label} style={{
            position: 'absolute',
            left: bandLeft,
            top: bandY,
            width: bandW,
            height: BAND_H,
            borderRadius: 12,
            background: layer.bg,
            border: `1.5px solid ${CLAUDE.BORDER}`,
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${width * 0.025}px`,
            opacity: clamp(anim * layer.opacityLevel, 0, 1),
            transform: `translateY(${(1 - anim) * 22}px)`,
            boxSizing: 'border-box',
          }}>
            {/* Label block */}
            <div style={{ flex: '0 0 auto', marginRight: width * 0.02 }}>
              <div style={{
                fontFamily: SERIF,
                fontSize: height * 0.028,
                fontWeight: 700,
                color: CLAUDE.INK,
                lineHeight: 1.15,
              }}>{layer.label}</div>
              <div style={{
                fontFamily: SANS,
                fontSize: height * 0.013,
                color: CLAUDE.INK_SOFT,
                marginTop: 3,
                maxWidth: 260,
              }}>{layer.sublabel}</div>
            </div>

            {/* Chips */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap' as const,
              gap: 8,
              flex: 1,
            }}>
              {layer.chips.map(chip => (
                <span key={chip} style={{
                  fontFamily: SANS,
                  fontSize: height * 0.012,
                  color: CLAUDE.INK_SOFT,
                  background: CLAUDE.PAGE,
                  border: `1px solid ${CLAUDE.BORDER}`,
                  borderRadius: 6,
                  padding: '3px 10px',
                }}>{chip}</span>
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Terracotta "protected floor" divider between Operator and User ── */}
      {/* Sits between band[1] and band[2] */}
      {(() => {
        const band1Bottom = BAND_AREA_TOP + (BAND_H + 14) * 1 + BAND_H;
        const lineY = band1Bottom + 7;
        const lineW = MAX_W * LAYERS[1].widthFraction;
        const lineLeft = PAD_X + (MAX_W - lineW) / 2;

        return (
          <div style={{
            position: 'absolute',
            left: lineLeft,
            top: lineY,
            width: lineW,
            opacity: clamp(floorIn, 0, 1),
            transform: `translateY(${(1 - floorIn) * 6}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              height: 3,
              flex: 1,
              background: CLAUDE.SPARK,
              borderRadius: 2,
            }} />
            <span style={{
              fontFamily: SANS,
              fontSize: height * 0.0125,
              color: CLAUDE.SPARK,
              fontWeight: 700,
              letterSpacing: 1,
              whiteSpace: 'nowrap' as const,
            }}>protected floor — operator cannot cross</span>
            <div style={{
              height: 3,
              flex: 1,
              background: CLAUDE.SPARK,
              borderRadius: 2,
            }} />
          </div>
        );
      })()}

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Source: Anthropic Claude Constitution, January 2026
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        bottom: height * 0.055,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.022,
          fontStyle: 'italic',
          color: CLAUDE.INK,
        }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
