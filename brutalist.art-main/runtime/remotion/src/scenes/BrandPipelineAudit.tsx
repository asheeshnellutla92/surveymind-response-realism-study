import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandPipelineAudit — C04 pipeline-contract-resilience-audit centerpiece.
 * Dependency audit table: services as rows, four contract fields as columns.
 * Cells populate with LOW/MEDIUM/HIGH risk ratings; HIGH cells light terracotta.
 * Reddit API row flags SINGLE-DEPENDENCY in a badge.
 * Source: Branding and AI, Chapter 21 (Nina Harris).
 */
export const brandPipelineAuditSchema = z.object({
  highlightRow: z.number().default(1),
});
export type BrandPipelineAuditProps = z.infer<typeof brandPipelineAuditSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const HEADERS = ['Service', 'Shape', 'Cost', 'Rate Limit', 'ToS Governance'];
const ROWS = [
  {
    service: 'Stripe API',
    shape: 'Versioned',
    cost: 'Fixed %',
    rate: 'Generous',
    tos: 'Stable',
    risks: ['LOW', 'LOW', 'LOW', 'LOW'],
    isSingleDep: false,
  },
  {
    service: 'Reddit API',
    shape: 'Fixed',
    cost: 'Ad valorem',
    rate: 'Restrictive',
    tos: 'Discretionary',
    risks: ['HIGH', 'HIGH', 'HIGH', 'HIGH'],
    isSingleDep: true,
  },
  {
    service: 'OpenAI API',
    shape: 'Versioned',
    cost: 'Usage-based',
    rate: 'Constrained',
    tos: 'Frequently revised',
    risks: ['LOW', 'MEDIUM', 'MEDIUM', 'HIGH'],
    isSingleDep: false,
  },
  {
    service: 'Google Maps',
    shape: 'Versioned',
    cost: 'Usage-based',
    rate: 'Generous',
    tos: 'Stable',
    risks: ['LOW', 'MEDIUM', 'LOW', 'LOW'],
    isSingleDep: false,
  },
];

const riskColor = (risk: string) => {
  if (risk === 'HIGH') return CLAUDE.SPARK;
  if (risk === 'MEDIUM') return CLAUDE.INK_SOFT;
  return '#4A7C59';
};
const riskBg = (risk: string) => {
  if (risk === 'HIGH') return 'rgba(217,119,87,0.1)';
  if (risk === 'MEDIUM') return 'rgba(115,112,95,0.08)';
  return 'rgba(74,124,89,0.08)';
};

export const BrandPipelineAudit: React.FC<BrandPipelineAuditProps> = ({ highlightRow }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const headerIn = clamp(spring({ frame: frame - 8, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1);
  const rowSprings = ROWS.map((_, i) =>
    clamp(spring({ frame: frame - (14 + i * 12), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );
  const badgeIn = clamp(spring({ frame: frame - 52, fps, config: { damping: 24, stiffness: 120, mass: 1 } }), 0, 1);
  const sourceIn = clamp(interpolate(frame, [65, 80], [0, 1]), 0, 1);

  const PAD = width * 0.06;
  const TABLE_W = width - PAD * 2;
  const COL_W = [TABLE_W * 0.22, TABLE_W * 0.13, TABLE_W * 0.13, TABLE_W * 0.16, TABLE_W * 0.21, TABLE_W * 0.15];

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
        Pipeline Contract Audit
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>
      <div style={{
        fontFamily: SANS,
        fontSize: 16,
        color: CLAUDE.INK_SOFT,
        marginBottom: 20,
        opacity: headerIn,
      }}>
        Four contract fields · HIGH cells indicate single-dependency failure risk.
      </div>

      {/* Table */}
      <div style={{
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(61,57,41,0.08)',
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
              flex: ci === 0 ? '0 0 22%' : '1',
              padding: '12px 14px',
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 700,
              color: CLAUDE.INK_SOFT,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRight: ci < HEADERS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
            }}>{h}</div>
          ))}
          <div style={{
            flex: '0 0 15%',
            padding: '12px 14px',
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 700,
            color: CLAUDE.INK_SOFT,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>Overall Risk</div>
        </div>

        {/* Rows */}
        {ROWS.map((row, ri) => {
          const maxRisk = row.risks.includes('HIGH') ? 'HIGH' : row.risks.includes('MEDIUM') ? 'MEDIUM' : 'LOW';
          return (
            <div key={ri} style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: ri < ROWS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              background: row.isSingleDep ? 'rgba(217,119,87,0.05)' : 'transparent',
              opacity: rowSprings[ri],
              transform: `translateX(${(1 - rowSprings[ri]) * -16}px)`,
              minHeight: 56,
            }}>
              {/* Service */}
              <div style={{
                flex: '0 0 22%',
                padding: '14px 14px',
                fontFamily: SERIF,
                fontSize: 17,
                fontWeight: 700,
                color: CLAUDE.INK,
                borderRight: `1px solid ${CLAUDE.BORDER}`,
              }}>
                {row.service}
                {row.isSingleDep && (
                  <span style={{
                    display: 'inline-block',
                    marginLeft: 8,
                    fontSize: 10,
                    fontFamily: SANS,
                    fontWeight: 700,
                    color: CLAUDE.PAGE,
                    background: CLAUDE.SPARK,
                    padding: '2px 7px',
                    borderRadius: 4,
                    letterSpacing: '0.05em',
                    opacity: badgeIn,
                  }}>SINGLE-DEP</span>
                )}
              </div>

              {/* Contract fields */}
              {[row.shape, row.cost, row.rate, row.tos].map((val, ci) => {
                const risk = row.risks[ci];
                return (
                  <div key={ci} style={{
                    flex: 1,
                    padding: '14px 14px',
                    borderRight: `1px solid ${CLAUDE.BORDER}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}>
                    <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK }}>{val}</div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontFamily: SANS,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: riskColor(risk),
                      background: riskBg(risk),
                      padding: '2px 8px',
                      borderRadius: 4,
                      alignSelf: 'flex-start',
                    }}>{risk}</div>
                  </div>
                );
              })}

              {/* Overall risk */}
              <div style={{
                flex: '0 0 15%',
                padding: '14px 14px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: riskColor(maxRisk),
                  background: riskBg(maxRisk),
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: `1px solid ${riskColor(maxRisk)}40`,
                }}>{maxRisk}</span>
              </div>
            </div>
          );
        })}
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
        Source: Branding and AI (Nina Harris) · Ch. 21
      </div>
    </AbsoluteFill>
  );
};
