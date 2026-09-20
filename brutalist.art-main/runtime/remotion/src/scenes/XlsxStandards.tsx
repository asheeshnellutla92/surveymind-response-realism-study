import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * XlsxStandards — B02 — Financial model color/number standards + formula mandate.
 */

export const xlsxStandardsSchema = z.object({
  sparkLine: z.string().default('Blue inputs. Black formulas. Never hardcode a calc.'),
});
export type XlsxStandardsProps = z.infer<typeof xlsxStandardsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const COLOR_CODES = [
  { swatch: '#0000FF', label: 'Blue text', detail: 'Hardcoded inputs — numbers users change for scenarios' },
  { swatch: '#000000', label: 'Black text', detail: 'ALL formulas and calculations' },
  { swatch: '#008000', label: 'Green text', detail: 'Cross-sheet links from elsewhere in workbook' },
  { swatch: '#FF0000', label: 'Red text', detail: 'External links to other files' },
  { swatch: '#FFFF00', label: 'Yellow BG', detail: 'Key assumptions needing attention' },
];

const NUM_FORMATS = [
  { label: 'Years', format: '"2024" not "2,024"', detail: 'Text strings — prevent comma formatting' },
  { label: 'Currency', format: '$#,##0', detail: 'Always specify units in header: Revenue ($mm)' },
  { label: 'Zeros', format: '"-"', detail: 'Number format: $#,##0;($#,##0);-' },
  { label: 'Percentages', format: '0.0%', detail: 'One decimal; negatives in parentheses' },
  { label: 'Multiples', format: '0.0x', detail: 'Valuation: EV/EBITDA, P/E etc.' },
];

export const XlsxStandards: React.FC<XlsxStandardsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const mandateIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const colorSprings = COLOR_CODES.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const numSprings = NUM_FORMATS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.28;
  const COL_W = W * 0.38;
  const COLOR_H = (H * 0.44) / 5 - 9;
  const NUM_H = (H * 0.44) / 5 - 9;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        XLSX · FINANCIAL MODEL STANDARDS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 46, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Color code it. Format it. Write formulas.
      </div>

      {/* Color coding column */}
      <div style={{ position: 'absolute', left: W * 0.06, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(colorSprings[0], 0, 1),
        }}>
          INDUSTRY COLOR CODING
        </div>
        {COLOR_CODES.map((cc, i) => {
          const op = clamp(colorSprings[i], 0, 1);
          const isSwatch = cc.swatch === '#FFFF00';
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.INK_SOFT}`,
              borderRadius: 8, padding: '9px 13px', marginBottom: 9,
              height: COLOR_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{
                width: 28, height: 28, flexShrink: 0,
                background: isSwatch ? cc.swatch : 'transparent',
                border: isSwatch ? `1px solid ${CLAUDE.BORDER}` : 'none',
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!isSwatch && (
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: cc.swatch }}>A</span>
                )}
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{cc.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>{cc.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Number formats column */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(numSprings[0], 0, 1),
        }}>
          NUMBER FORMATTING
        </div>
        {NUM_FORMATS.map((nf, i) => {
          const op = clamp(numSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 8, padding: '9px 13px', marginBottom: 9,
              height: NUM_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{nf.label}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.SPARK, fontWeight: 700 }}>{nf.format}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.35, marginTop: 3 }}>{nf.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Formula mandate callout */}
      <div style={{
        position: 'absolute',
        top: COL_TOP + (H * 0.44) + 14,
        left: W * 0.06, right: W * 0.06,
        background: 'rgba(217,119,87,0.08)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 14, padding: '14px 22px',
        opacity: clamp(mandateIn, 0, 1),
        transform: `translateY(${(1 - clamp(mandateIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK, lineHeight: 1.5 }}>
          <span style={{ fontFamily: MONO, color: CLAUDE.SPARK, fontWeight: 700 }}>FORMULA MANDATE</span>
          {'  '}Never calculate in Python and hardcode: not{' '}
          <span style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT }}>sheet["B10"] = 5000</span>
          {'  '}but{' '}
          <span style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.SPARK, fontWeight: 700 }}>sheet["B10"] = "=SUM(B2:B9)"</span>
          {'  '}— spreadsheet stays dynamic and recalculable.
        </div>
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
