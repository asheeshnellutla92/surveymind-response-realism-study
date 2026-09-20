import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandRepricingTable — C10 creative-engineer-market-repricing centerpiece.
 * Field-by-field table (Field / Old separating signal / Now pooled / Currently separating).
 * 4–5 rows covering software engineering, marketing, design.
 * Populating row by row with ink for pooled signals and terracotta for currently-separating.
 * Source: Branding and AI, Chapter 1 (Nina Harris).
 */
export const brandRepricingTableSchema = z.object({});
export type BrandRepricingTableProps = z.infer<typeof brandRepricingTableSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const ROWS = [
  {
    field: 'Software Engineering',
    old: 'GitHub repo + CS degree',
    pooled: 'AI-assisted code production',
    separating: 'System design + deployed product with real users',
  },
  {
    field: 'Marketing',
    old: 'Content volume + ad copy',
    pooled: 'AI-generated copy at scale',
    separating: 'Campaign judgment + brand positioning decisions',
  },
  {
    field: 'Design',
    old: 'Figma files + visual output',
    pooled: 'AI-generated design variants',
    separating: 'Information architecture + audience mental model',
  },
  {
    field: 'Data Science',
    old: 'Python notebooks + model training',
    pooled: 'AI-assisted model generation',
    separating: 'Problem framing + causal reasoning',
  },
  {
    field: 'Writing',
    old: 'Draft volume + stylistic polish',
    pooled: 'AI-generated long-form content',
    separating: 'Editorial judgment + original sourcing',
  },
];

const HEADERS = ['Field', 'Old separating signal', 'Now pooled', 'Currently separating'];

export const BrandRepricingTable: React.FC<BrandRepricingTableProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const headerIn = clamp(spring({ frame: frame - 8, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1);

  const rowSprings = ROWS.map((_, i) =>
    clamp(spring({ frame: frame - (14 + i * 12), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );
  const sourceIn = clamp(interpolate(frame, [70, 85], [0, 1]), 0, 1);

  const PAD = width * 0.06;
  const TABLE_W = width - PAD * 2;
  const COL_WIDTHS = ['22%', '22%', '24%', '32%'];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${height * 0.06}px ${PAD}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 34,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 8,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        The Repricing Map
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>
      <div style={{
        fontFamily: SANS,
        fontSize: 16,
        color: CLAUDE.INK_SOFT,
        marginBottom: 20,
        opacity: headerIn,
      }}>
        Pooled signals (ink) vs. currently separating signals (terracotta) — by field.
      </div>

      {/* Table */}
      <div style={{
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          background: CLAUDE.FOOTER,
          borderBottom: `1px solid ${CLAUDE.BORDER}`,
          opacity: headerIn,
        }}>
          {HEADERS.map((h, ci) => (
            <div key={ci} style={{
              width: COL_WIDTHS[ci],
              padding: '12px 14px',
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 700,
              color: ci === 3 ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRight: ci < HEADERS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
            }}>{h}</div>
          ))}
        </div>

        {/* Data rows */}
        {ROWS.map((row, ri) => (
          <div key={ri} style={{
            display: 'flex',
            borderBottom: ri < ROWS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
            opacity: rowSprings[ri],
            transform: `translateX(${(1 - rowSprings[ri]) * -14}px)`,
            minHeight: 64,
          }}>
            {/* Field */}
            <div style={{
              width: COL_WIDTHS[0],
              padding: '14px 14px',
              fontFamily: SERIF,
              fontSize: 16,
              fontWeight: 700,
              color: CLAUDE.INK,
              borderRight: `1px solid ${CLAUDE.BORDER}`,
              display: 'flex',
              alignItems: 'center',
            }}>{row.field}</div>

            {/* Old separating */}
            <div style={{
              width: COL_WIDTHS[1],
              padding: '14px 14px',
              fontFamily: SERIF,
              fontSize: 14,
              color: CLAUDE.INK_SOFT,
              borderRight: `1px solid ${CLAUDE.BORDER}`,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'line-through',
              textDecorationColor: CLAUDE.BORDER,
            }}>{row.old}</div>

            {/* Now pooled */}
            <div style={{
              width: COL_WIDTHS[2],
              padding: '14px 14px',
              fontFamily: SERIF,
              fontSize: 14,
              color: CLAUDE.INK,
              borderRight: `1px solid ${CLAUDE.BORDER}`,
              display: 'flex',
              alignItems: 'center',
            }}>
              <span style={{
                padding: '3px 8px',
                background: 'rgba(61,57,41,0.07)',
                borderRadius: 4,
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}>POOLED</span>
              <span style={{ marginLeft: 8, fontSize: 14 }}>{row.pooled}</span>
            </div>

            {/* Currently separating */}
            <div style={{
              width: COL_WIDTHS[3],
              padding: '14px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{
                padding: '3px 8px',
                background: `rgba(217,119,87,0.1)`,
                border: `1px solid ${CLAUDE.SPARK}`,
                borderRadius: 4,
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 700,
                color: CLAUDE.SPARK,
                letterSpacing: '0.03em',
                flexShrink: 0,
              }}>NOW</span>
              <span style={{ fontFamily: SERIF, fontSize: 14, color: CLAUDE.INK, fontWeight: 600 }}>{row.separating}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        right: PAD,
        fontFamily: SANS,
        fontSize: 12,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 1
      </div>
    </AbsoluteFill>
  );
};
