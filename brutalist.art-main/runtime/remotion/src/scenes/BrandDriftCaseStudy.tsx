import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandDriftCaseStudy — C07 archetype-drift-case-studies centerpiece.
 * Three-case comparison table (Tropicana/Gap/New Coke):
 * rows: archetype held / triggering action / customer response timeline /
 * equity impact / recovery move — cells appearing one column at a time.
 * Drift-signature framework as a numbered list below.
 * Source: Branding and AI, Chapter 5 (Nina Harris).
 */
export const brandDriftCaseStudySchema = z.object({
  activeColumn: z.number().default(3),
});
export type BrandDriftCaseStudyProps = z.infer<typeof brandDriftCaseStudySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const CASES = [
  {
    brand: 'Tropicana 2009',
    archetype: 'Innocent',
    trigger: 'New packaging dropped orange-and-straw',
    response: '2 months · $33M sales drop',
    equityImpact: 'Loss of recognition asset',
    recovery: 'Returned to original packaging',
  },
  {
    brand: 'Gap 2010',
    archetype: 'Everyman',
    trigger: 'Logo modernization, crowdsourced rebellion',
    response: '6 days · public backlash peak',
    equityImpact: 'Association strength collapsed',
    recovery: 'Reverted in 1 week',
  },
  {
    brand: 'New Coke 1985',
    archetype: 'Everyman',
    trigger: 'Formula change, taste-test logic',
    response: '79 days · 400K complaint calls',
    equityImpact: 'Identity severed from audience',
    recovery: 'Coca-Cola Classic relaunched',
  },
];

const ROWS = [
  { key: 'archetype', label: 'Archetype held' },
  { key: 'trigger', label: 'Triggering action' },
  { key: 'response', label: 'Response timeline' },
  { key: 'equityImpact', label: 'Equity impact' },
  { key: 'recovery', label: 'Recovery move' },
];

const DRIFT_SIGNS = [
  'Changing the ONE thing the audience cannot articulate but immediately feels.',
  'Internal confidence in "improvement" misread as recognition-asset stability.',
  'Performance metrics greenlit — brand tracking moved slowly and too late.',
  'No early-warning criterion for "what makes us recognizable."',
];

export const BrandDriftCaseStudy: React.FC<BrandDriftCaseStudyProps> = ({ activeColumn }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const headerIn = clamp(spring({ frame: frame - 8, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1);

  const colSprings = CASES.map((_, i) =>
    clamp(spring({ frame: frame - (14 + i * 16), fps, config: { damping: 28, stiffness: 130, mass: 0.9 } }), 0, 1)
  );
  const driftSprings = DRIFT_SIGNS.map((_, i) =>
    clamp(spring({ frame: frame - (55 + i * 10), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }), 0, 1)
  );
  const sourceIn = clamp(interpolate(frame, [90, 105], [0, 1]), 0, 1);

  const PAD = width * 0.06;
  const TABLE_W = width - PAD * 2;
  const C_W = TABLE_W / (CASES.length + 1);
  const ROW_H = 68;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${height * 0.05}px ${PAD}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 32,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 14,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Archetype Drift Case Studies
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Table */}
      <div style={{
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex',
          background: CLAUDE.FOOTER,
          borderBottom: `1px solid ${CLAUDE.BORDER}`,
          opacity: headerIn,
        }}>
          <div style={{
            flex: `0 0 ${C_W}px`,
            padding: '11px 14px',
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 700,
            color: CLAUDE.INK_SOFT,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            borderRight: `1px solid ${CLAUDE.BORDER}`,
          }}>Dimension</div>
          {CASES.map((c, ci) => (
            <div key={ci} style={{
              flex: 1,
              padding: '11px 14px',
              fontFamily: SERIF,
              fontSize: 16,
              fontWeight: 700,
              color: CLAUDE.INK,
              borderRight: ci < CASES.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              opacity: colSprings[ci],
            }}>{c.brand}</div>
          ))}
        </div>

        {/* Data rows */}
        {ROWS.map((row, ri) => (
          <div key={ri} style={{
            display: 'flex',
            borderBottom: ri < ROWS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
            minHeight: ROW_H,
          }}>
            {/* Row label */}
            <div style={{
              flex: `0 0 ${C_W}px`,
              padding: '12px 14px',
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 700,
              color: CLAUDE.INK_SOFT,
              letterSpacing: '0.03em',
              background: CLAUDE.FOOTER,
              borderRight: `1px solid ${CLAUDE.BORDER}`,
              display: 'flex',
              alignItems: 'center',
              opacity: headerIn,
            }}>{row.label}</div>
            {/* Case cells */}
            {CASES.map((c, ci) => {
              const val = c[row.key as keyof typeof c];
              return (
                <div key={ci} style={{
                  flex: 1,
                  padding: '12px 14px',
                  fontFamily: SERIF,
                  fontSize: 14,
                  color: CLAUDE.INK,
                  borderRight: ci < CASES.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: colSprings[ci],
                  transform: `translateY(${(1 - colSprings[ci]) * 8}px)`,
                }}>{val}</div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Drift signature framework */}
      <div style={{
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        color: CLAUDE.SPARK,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: 10,
        opacity: driftSprings[0] ?? 0,
      }}>
        Drift Signature — Four Warning Signs
      </div>
      {DRIFT_SIGNS.map((sign, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 8,
          opacity: driftSprings[i],
          transform: `translateX(${(1 - (driftSprings[i] ?? 0)) * -12}px)`,
        }}>
          <span style={{
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 700,
            color: CLAUDE.SPARK,
            minWidth: 20,
          }}>{i + 1}.</span>
          <span style={{ fontFamily: SERIF, fontSize: 15, color: CLAUDE.INK }}>{sign}</span>
        </div>
      ))}

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.03,
        right: PAD,
        fontFamily: SANS,
        fontSize: 12,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 5
      </div>
    </AbsoluteFill>
  );
};
