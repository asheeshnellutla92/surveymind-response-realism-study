import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandSignalMatrix — C01 brand-signal-collapse-detector centerpiece.
 * 3×3 signal-health matrix: Cost-to-fake × Population-saturation × Status.
 * Phase "theory": animates the axis labels and dimension explanation.
 * Phase "result": populates cells with scores, highlights Collapsed cell in terracotta.
 * Source: Branding and AI, Chapter 1 — The Creative Engineer (Nina Harris).
 */
export const brandSignalMatrixSchema = z.object({
  phase: z.enum(['theory', 'result']).default('result'),
});
export type BrandSignalMatrixProps = z.infer<typeof brandSignalMatrixSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const rows = [
  { label: 'GitHub repo', costToFake: '2', saturation: '5', status: 'COLLAPSED', isHighlight: true },
  { label: 'CS degree', costToFake: '4', saturation: '4', status: 'Pooling', isHighlight: false },
  { label: 'Deployed product', costToFake: '4', saturation: '2', status: 'Separating', isHighlight: false },
];

const COL_HEADERS = ['Credential', 'Cost to fake (1–5)', 'Population sat. (1–5)', 'Status'];

export const BrandSignalMatrix: React.FC<BrandSignalMatrixProps> = ({ phase }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const headerIn = spring({ frame: frame - 8, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });

  const rowDelay = 14;
  const rowSprings = rows.map((_, i) =>
    clamp(spring({ frame: frame - (16 + i * rowDelay), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );

  const cellDelay = 8;
  const cellSprings = rows.map((_, i) =>
    clamp(spring({ frame: frame - (16 + i * rowDelay + cellDelay), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );

  const sourceIn = clamp(interpolate(frame, [55, 70], [0, 1]), 0, 1);
  const recoIn = clamp(spring({ frame: frame - 70, fps, config: { damping: 26, stiffness: 120, mass: 1 } }), 0, 1);

  const PAD = width * 0.07;
  const TABLE_W = width - PAD * 2;
  const COL_WIDTHS = [TABLE_W * 0.26, TABLE_W * 0.22, TABLE_W * 0.22, TABLE_W * 0.3];
  const ROW_H = 62;
  const HEADER_H = 52;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${height * 0.06}px ${PAD}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 38,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 10,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 14}px)`,
      }}>
        Signal Health Matrix
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: SANS,
        fontSize: 17,
        color: CLAUDE.INK_SOFT,
        marginBottom: 24,
        opacity: clamp(headerIn, 0, 1),
      }}>
        {phase === 'theory'
          ? 'Three dimensions reveal whether a credential still separates candidates.'
          : 'GitHub repo, software engineering 2024 — scored by Claude.'}
      </div>

      {/* Table */}
      <div style={{
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(61,57,41,0.08)',
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex',
          background: CLAUDE.FOOTER,
          borderBottom: `1px solid ${CLAUDE.BORDER}`,
          opacity: clamp(headerIn, 0, 1),
        }}>
          {COL_HEADERS.map((h, ci) => (
            <div key={ci} style={{
              width: COL_WIDTHS[ci],
              padding: '14px 16px',
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 600,
              color: CLAUDE.INK_SOFT,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              borderRight: ci < COL_HEADERS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
            }}>{h}</div>
          ))}
        </div>

        {/* Data rows */}
        {rows.map((row, ri) => {
          const isCollapsed = row.status === 'COLLAPSED';
          const rowVisible = rowSprings[ri];
          const cellVisible = cellSprings[ri];
          return (
            <div key={ri} style={{
              display: 'flex',
              borderBottom: ri < rows.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              background: isCollapsed && phase === 'result' ? `rgba(217,119,87,0.08)` : 'transparent',
              opacity: rowVisible,
              transform: `translateX(${(1 - rowVisible) * -20}px)`,
            }}>
              {/* Credential */}
              <div style={{
                width: COL_WIDTHS[0],
                padding: '16px 16px',
                fontFamily: SERIF,
                fontSize: 18,
                fontWeight: 600,
                color: CLAUDE.INK,
                borderRight: `1px solid ${CLAUDE.BORDER}`,
                display: 'flex',
                alignItems: 'center',
              }}>{row.label}</div>

              {/* Cost to fake */}
              <div style={{
                width: COL_WIDTHS[1],
                padding: '16px',
                fontFamily: MONO,
                fontSize: 22,
                fontWeight: 700,
                color: CLAUDE.INK,
                borderRight: `1px solid ${CLAUDE.BORDER}`,
                display: 'flex',
                alignItems: 'center',
                opacity: cellVisible,
              }}>{phase === 'result' ? row.costToFake : '—'}</div>

              {/* Population saturation */}
              <div style={{
                width: COL_WIDTHS[2],
                padding: '16px',
                fontFamily: MONO,
                fontSize: 22,
                fontWeight: 700,
                color: CLAUDE.INK,
                borderRight: `1px solid ${CLAUDE.BORDER}`,
                display: 'flex',
                alignItems: 'center',
                opacity: cellVisible,
              }}>{phase === 'result' ? row.saturation : '—'}</div>

              {/* Status */}
              <div style={{
                width: COL_WIDTHS[3],
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                opacity: cellVisible,
              }}>
                <span style={{
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: phase === 'result'
                    ? (isCollapsed ? CLAUDE.SPARK : row.status === 'Pooling' ? CLAUDE.INK_SOFT : '#4A7C59')
                    : CLAUDE.GHOST,
                  background: phase === 'result' && isCollapsed ? `rgba(217,119,87,0.12)` : 'transparent',
                  padding: isCollapsed ? '4px 10px' : '0',
                  borderRadius: isCollapsed ? 6 : 0,
                  border: isCollapsed && phase === 'result' ? `1px solid ${CLAUDE.SPARK}` : 'none',
                }}>
                  {phase === 'result' ? row.status : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendation block */}
      {phase === 'result' && (
        <div style={{
          marginTop: 22,
          padding: '16px 20px',
          background: CLAUDE.CARD,
          border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 10,
          opacity: recoIn,
          transform: `translateY(${(1 - recoIn) * 10}px)`,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK_SOFT, letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 10 }}>
            Next costly signal →
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 18, color: CLAUDE.INK }}>
            Deployed product with real users
          </span>
          <span style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, marginLeft: 10 }}>
            Cost structure has not pooled yet.
          </span>
        </div>
      )}

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
