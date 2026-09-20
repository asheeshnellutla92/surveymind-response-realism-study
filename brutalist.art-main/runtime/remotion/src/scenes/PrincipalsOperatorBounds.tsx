import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PrincipalsOperatorBounds — "Claude's Three Principals" B03
 * Source: Anthropic Claude Constitution, January 2026
 *
 * Two-column split card:
 *   Left  — "Operators CAN"  — bullets in INK, stagger in
 *   Right — "Operators CANNOT" — bullets in CLAUDE.SPARK, stagger in
 *
 * Terracotta: the CANNOT column's left-border accent + bullet text color.
 * ONE terracotta moment per beat — the CANNOT column is it.
 */

export const principalsOperatorBoundsSchema = z.object({
  sparkLine: z.string().default('Restrict yes. Weaponize never.'),
});

export type PrincipalsOperatorBoundsProps = z.infer<typeof principalsOperatorBoundsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const CAN_ITEMS = [
  'Restrict topics',
  'Require a persona',
  'Limit to certain tasks',
  'Keep system prompt confidential',
  'Prevent discussion of competitors',
];

const CANNOT_ITEMS = [
  'Deceive users to harm them',
  'Deny urgent safety help',
  'Demean or manipulate users',
  "Override Anthropic's absolute limits",
];

export const PrincipalsOperatorBounds: React.FC<PrincipalsOperatorBoundsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const COL_DELAY = 15;
  const ITEM_DELAY = 18;

  // Left column header + items
  const leftHeaderIn = spring({ frame: frame - COL_DELAY, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const leftItemAnims = CAN_ITEMS.map((_, i) =>
    spring({ frame: frame - COL_DELAY - (i + 1) * ITEM_DELAY, fps, config: { damping: 24, stiffness: 90, mass: 0.9 } })
  );

  // Right column header + items (offset so CANNOT column finishes after CAN)
  const RIGHT_OFFSET = 30;
  const rightHeaderIn = spring({ frame: frame - COL_DELAY - RIGHT_OFFSET, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const rightItemAnims = CANNOT_ITEMS.map((_, i) =>
    spring({ frame: frame - COL_DELAY - RIGHT_OFFSET - (i + 1) * ITEM_DELAY, fps, config: { damping: 24, stiffness: 90, mass: 0.9 } })
  );

  const lastItemFrame = COL_DELAY + RIGHT_OFFSET + CANNOT_ITEMS.length * ITEM_DELAY;
  const sparkIn = spring({ frame: frame - lastItemFrame - 15, fps, config: { damping: 28, stiffness: 90, mass: 0.9 } });
  const citeIn = spring({ frame: frame - lastItemFrame - 25, fps, config: { damping: 28, stiffness: 90, mass: 0.9 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.07;
  const CARD_TOP = height * 0.26;
  const CARD_H = height * 0.58;
  const CARD_W = (width - PAD_X * 2 - 32) / 2;
  const GAP = 32;
  const LEFT_CARD_X = PAD_X;
  const RIGHT_CARD_X = PAD_X + CARD_W + GAP;
  const CARD_INNER_PAD = width * 0.025;

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
        top: PAD_Y + height * 0.055,
        fontFamily: SERIF,
        fontSize: height * 0.036,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        What Operators Can and Cannot Do
      </div>

      {/* ── LEFT CARD: Operators CAN ── */}
      <div style={{
        position: 'absolute',
        left: LEFT_CARD_X,
        top: CARD_TOP,
        width: CARD_W,
        height: CARD_H,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 14,
        padding: `${height * 0.035}px ${CARD_INNER_PAD}px`,
        boxSizing: 'border-box',
        opacity: clamp(leftHeaderIn, 0, 1),
        transform: `translateY(${(1 - leftHeaderIn) * 16}px)`,
      }}>
        {/* Column header */}
        <div style={{
          fontFamily: SERIF,
          fontSize: height * 0.030,
          fontWeight: 700,
          color: CLAUDE.INK,
          marginBottom: height * 0.025,
          borderBottom: `1.5px solid ${CLAUDE.BORDER}`,
          paddingBottom: height * 0.018,
        }}>
          Operators CAN
        </div>

        {/* Bullets */}
        {CAN_ITEMS.map((item, i) => (
          <div key={item} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: height * 0.018,
            opacity: clamp(leftItemAnims[i], 0, 1),
            transform: `translateX(${(1 - leftItemAnims[i]) * 14}px)`,
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: CLAUDE.INK,
              marginTop: 8,
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: SERIF,
              fontSize: height * 0.020,
              color: CLAUDE.INK,
              lineHeight: 1.4,
            }}>{item}</span>
          </div>
        ))}
      </div>

      {/* ── RIGHT CARD: Operators CANNOT ── */}
      <div style={{
        position: 'absolute',
        left: RIGHT_CARD_X,
        top: CARD_TOP,
        width: CARD_W,
        height: CARD_H,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 14,
        borderLeft: `5px solid ${CLAUDE.SPARK}`,
        padding: `${height * 0.035}px ${CARD_INNER_PAD}px`,
        boxSizing: 'border-box',
        opacity: clamp(rightHeaderIn, 0, 1),
        transform: `translateY(${(1 - rightHeaderIn) * 16}px)`,
      }}>
        {/* Column header */}
        <div style={{
          fontFamily: SERIF,
          fontSize: height * 0.030,
          fontWeight: 700,
          color: CLAUDE.SPARK,
          marginBottom: height * 0.025,
          borderBottom: `1.5px solid ${CLAUDE.BORDER}`,
          paddingBottom: height * 0.018,
        }}>
          Operators CANNOT
        </div>

        {/* Bullets */}
        {CANNOT_ITEMS.map((item, i) => (
          <div key={item} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: height * 0.022,
            opacity: clamp(rightItemAnims[i], 0, 1),
            transform: `translateX(${(1 - rightItemAnims[i]) * 14}px)`,
          }}>
            <div style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: CLAUDE.SPARK,
              marginTop: 8,
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: SERIF,
              fontSize: height * 0.021,
              color: CLAUDE.SPARK,
              lineHeight: 1.4,
              fontWeight: 600,
            }}>{item}</span>
          </div>
        ))}
      </div>

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
