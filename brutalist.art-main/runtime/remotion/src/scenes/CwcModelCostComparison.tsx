import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcModelCostComparison — Animated cost comparison table
 * Three rows: Opus / Sonnet / Haiku with input/output price + quality score
 * Source: rightmodel/ — CWC Workshop 2026
 */

export const cwcModelCostComparisonSchema = z.object({
  sparkLine: z.string().default("Cost is a variable, not a constraint."),
});
export type CwcModelCostComparisonProps = z.infer<typeof cwcModelCostComparisonSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const GREEN = '#4CAF50';

const MODELS = [
  {
    name: 'Opus',
    input: '$15 / M',
    output: '$75 / M',
    quality: 98,
    qLabel: '98%',
    rowColor: CLAUDE.CARD,
    accent: CLAUDE.SPARK,
    label: 'most capable',
  },
  {
    name: 'Sonnet',
    input: '$3 / M',
    output: '$15 / M',
    quality: 90,
    qLabel: '90%',
    rowColor: CLAUDE.CARD,
    accent: CLAUDE.INK,
    label: 'balanced',
  },
  {
    name: 'Haiku',
    input: '$0.25 / M',
    output: '$1.25 / M',
    quality: 82,
    qLabel: '82%',
    rowColor: `${GREEN}08`,
    accent: GREEN,
    label: 'fastest / cheapest',
  },
];

const COLS = ['Model', 'Input $/M tokens', 'Output $/M tokens', 'Quality score'];

export const CwcModelCostComparison: React.FC<CwcModelCostComparisonProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const tableHeaderIn = spring({ frame: frame - 18, fps, config: { damping: 26, stiffness: 100 } });
  const footIn = spring({ frame: frame - 220, fps, config: { damping: 26, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 260, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const TABLE_X = PAD_X;
  const TABLE_W = width * 0.88;
  const TABLE_Y = height * 0.24;
  const ROW_H = height * 0.14;
  const HEADER_H = height * 0.07;

  const COL_WIDTHS = [0.18, 0.27, 0.27, 0.28];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        MODEL COST COMPARISON · OPUS / SONNET / HAIKU
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        Same task, different prices — find the frontier
      </div>

      {/* Table */}
      <div style={{
        position: 'absolute', left: TABLE_X, top: TABLE_Y,
        width: TABLE_W,
        borderRadius: 12, overflow: 'hidden',
        border: `1.5px solid ${CLAUDE.BORDER}`,
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex', height: HEADER_H,
          background: CLAUDE.BORDER,
          opacity: clamp(tableHeaderIn, 0, 1),
        }}>
          {COLS.map((col, ci) => (
            <div key={ci} style={{
              width: `${COL_WIDTHS[ci] * 100}%`,
              display: 'flex', alignItems: 'center',
              padding: '0 16px',
              borderRight: ci < COLS.length - 1 ? `1px solid ${CLAUDE.PAGE}30` : 'none',
              fontFamily: SANS, fontSize: height * 0.010, fontWeight: 700,
              color: CLAUDE.INK_SOFT, letterSpacing: 1, textTransform: 'uppercase' as const,
            }}>
              {col}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {MODELS.map((model, mi) => {
          const rowIn = spring({ frame: frame - 40 - mi * 45, fps, config: { damping: 26, stiffness: 100 } });
          const barIn = spring({ frame: frame - 65 - mi * 45, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div key={model.name} style={{
              display: 'flex',
              height: ROW_H,
              background: model.rowColor,
              borderTop: `1px solid ${CLAUDE.BORDER}`,
              opacity: clamp(rowIn, 0, 1),
              transform: `translateX(${(1 - clamp(rowIn, 0, 1)) * 16}px)`,
            }}>
              {/* Model name */}
              <div style={{
                width: `${COL_WIDTHS[0] * 100}%`,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: '0 16px',
                borderRight: `1px solid ${CLAUDE.BORDER}`,
              }}>
                <div style={{ fontFamily: SANS, fontSize: height * 0.016, fontWeight: 700, color: model.accent }}>
                  {model.name}
                </div>
                <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT, marginTop: 3 }}>
                  {model.label}
                </div>
              </div>
              {/* Input price */}
              <div style={{
                width: `${COL_WIDTHS[1] * 100}%`,
                display: 'flex', alignItems: 'center', padding: '0 16px',
                borderRight: `1px solid ${CLAUDE.BORDER}`,
              }}>
                <div style={{ fontFamily: MONO, fontSize: height * 0.015, color: model.accent, fontWeight: 700 }}>
                  {model.input}
                </div>
              </div>
              {/* Output price */}
              <div style={{
                width: `${COL_WIDTHS[2] * 100}%`,
                display: 'flex', alignItems: 'center', padding: '0 16px',
                borderRight: `1px solid ${CLAUDE.BORDER}`,
              }}>
                <div style={{ fontFamily: MONO, fontSize: height * 0.015, color: model.accent, fontWeight: 700 }}>
                  {model.output}
                </div>
              </div>
              {/* Quality bar */}
              <div style={{
                width: `${COL_WIDTHS[3] * 100}%`,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: '0 16px', gap: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ height: 10, flex: 1, background: CLAUDE.BORDER, borderRadius: 5, marginRight: 10, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${model.quality * clamp(barIn, 0, 1)}%`,
                      background: model.accent, borderRadius: 5,
                    }} />
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: model.accent, fontWeight: 700 }}>
                    {model.qLabel}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <div style={{
        position: 'absolute',
        left: PAD_X, top: TABLE_Y + HEADER_H + ROW_H * 3 + height * 0.04,
        fontFamily: SANS, fontSize: height * 0.009,
        color: CLAUDE.GHOST, fontStyle: 'italic',
        opacity: clamp(footIn, 0, 1),
      }}>
        Relative prices at time of workshop — always check current pricing at anthropic.com/api
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
