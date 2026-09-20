import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandBoondoggleScore — C11 boondoggle-score-calculator centerpiece.
 * Two-column task breakdown table (AI-DOES-BEST / HUMAN-CONDUCTS) populating.
 * Boondoggle Score gauge (0–100) animating to its value.
 * Misplaced judgment steps flagged in terracotta.
 * Source: Branding and AI, Chapter 97 (Nina Harris).
 */
export const brandBoondoggleScoreSchema = z.object({
  score: z.number().default(45),
});
export type BrandBoondoggleScoreProps = z.infer<typeof brandBoondoggleScoreSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const STEPS = [
  { step: 'Research stakeholder concerns', owner: 'AI-DOES-BEST', misplaced: false },
  { step: 'Draft initial crisis statement', owner: 'AI-DOES-BEST', misplaced: false },
  { step: 'Assess factual accuracy of claims', owner: 'HUMAN-CONDUCTS', misplaced: false },
  { step: 'Approve tone and empathy', owner: 'HUMAN-CONDUCTS', misplaced: false },
  { step: 'Generate alternative phrasings', owner: 'AI-DOES-BEST', misplaced: false },
  { step: 'Sign off on legal exposure', owner: 'HUMAN-CONDUCTS', misplaced: true },
  { step: 'Publish without review', owner: 'AI-DOES-BEST', misplaced: true },
];

export const BrandBoondoggleScore: React.FC<BrandBoondoggleScoreProps> = ({ score }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const headerIn = clamp(spring({ frame: frame - 8, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1);

  const rowSprings = STEPS.map((_, i) =>
    clamp(spring({ frame: frame - (14 + i * 9), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );
  const gaugeProgress = clamp(spring({ frame: frame - 65, fps, config: { damping: 20, stiffness: 80, mass: 1.5 } }), 0, 1);
  const sourceIn = clamp(interpolate(frame, [80, 95], [0, 1]), 0, 1);

  const PAD = width * 0.07;
  const TABLE_W = width - PAD * 2;

  // Gauge arc parameters
  const GCX = width * 0.5;
  const GCY = height * 0.80;
  const GR = Math.min(width, height) * 0.12;
  const gaugeVal = score * gaugeProgress;
  const startAngle = Math.PI;
  const endAngle = 0;
  const gaugeAngle = startAngle + (gaugeVal / 100) * (endAngle - startAngle + Math.PI);

  const arcPolarX = (angle: number) => GCX + GR * Math.cos(angle);
  const arcPolarY = (angle: number) => GCY + GR * Math.sin(angle);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${height * 0.05}px ${PAD}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 34,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 12,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Boondoggle Score — Write a Crisis Statement
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Task breakdown table */}
      <div style={{
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 14,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          background: CLAUDE.FOOTER,
          borderBottom: `1px solid ${CLAUDE.BORDER}`,
          opacity: headerIn,
        }}>
          {['Step', 'Owner', 'Seam Status'].map((h, ci) => (
            <div key={ci} style={{
              flex: ci === 0 ? '1' : '0 0 22%',
              padding: '11px 14px',
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 700,
              color: CLAUDE.INK_SOFT,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRight: ci < 2 ? `1px solid ${CLAUDE.BORDER}` : 'none',
            }}>{h}</div>
          ))}
        </div>

        {STEPS.map((s, ri) => (
          <div key={ri} style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: ri < STEPS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
            background: s.misplaced ? 'rgba(217,119,87,0.07)' : 'transparent',
            opacity: rowSprings[ri],
            transform: `translateX(${(1 - rowSprings[ri]) * -14}px)`,
            minHeight: 48,
          }}>
            <div style={{
              flex: '1',
              padding: '12px 14px',
              fontFamily: SERIF,
              fontSize: 15,
              color: s.misplaced ? CLAUDE.SPARK : CLAUDE.INK,
              borderRight: `1px solid ${CLAUDE.BORDER}`,
            }}>{s.step}</div>
            <div style={{
              flex: '0 0 22%',
              padding: '12px 14px',
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: s.owner === 'HUMAN-CONDUCTS' ? '#4A7C59' : CLAUDE.INK_SOFT,
              borderRight: `1px solid ${CLAUDE.BORDER}`,
            }}>{s.owner}</div>
            <div style={{
              flex: '0 0 22%',
              padding: '12px 14px',
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              color: s.misplaced ? CLAUDE.SPARK : CLAUDE.GHOST,
            }}>{s.misplaced ? '⚠ MISPLACED' : '✓ CORRECT'}</div>
          </div>
        ))}
      </div>

      {/* Score gauge */}
      <svg width={width} height={GR * 2.2} style={{ position: 'absolute', bottom: height * 0.08, left: 0 }}>
        {/* Background arc */}
        <path
          d={`M ${arcPolarX(Math.PI)} ${arcPolarY(Math.PI)} A ${GR} ${GR} 0 0 1 ${arcPolarX(0)} ${arcPolarY(0)}`}
          fill="none"
          stroke={CLAUDE.BORDER}
          strokeWidth={18}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${arcPolarX(Math.PI)} ${arcPolarY(Math.PI)} A ${GR} ${GR} 0 0 1 ${arcPolarX(gaugeAngle)} ${arcPolarY(gaugeAngle)}`}
          fill="none"
          stroke={gaugeVal > 70 ? '#4A7C59' : gaugeVal > 40 ? CLAUDE.INK_SOFT : CLAUDE.SPARK}
          strokeWidth={18}
          strokeLinecap="round"
        />
        {/* Score label */}
        <text x={GCX} y={GCY - GR * 0.3} textAnchor="middle" fontSize={32} fontFamily={SERIF} fontWeight={700} fill={CLAUDE.INK}>
          {Math.round(gaugeVal)}
        </text>
        <text x={GCX} y={GCY - GR * 0.3 + 22} textAnchor="middle" fontSize={13} fontFamily={SANS} fill={CLAUDE.INK_SOFT}>
          Boondoggle Score / 100
        </text>
        <text x={arcPolarX(Math.PI) - 12} y={GCY + 28} textAnchor="middle" fontSize={12} fontFamily={SANS} fill={CLAUDE.INK_SOFT}>0</text>
        <text x={arcPolarX(0) + 12} y={GCY + 28} textAnchor="middle" fontSize={12} fontFamily={SANS} fill={CLAUDE.INK_SOFT}>100</text>
      </svg>

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
        Source: Branding and AI (Nina Harris) · Ch. 97
      </div>
    </AbsoluteFill>
  );
};
