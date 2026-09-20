import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DocxCreate — B02 — Creating new documents with docx-js.
 * Left: 5 critical rules. Right: code snippet + table rules.
 */

export const docxCreateSchema = z.object({
  sparkLine: z.string().default('docx-js defaults to A4. Set US Letter explicitly.'),
});
export type DocxCreateProps = z.infer<typeof docxCreateSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const CRITICAL_RULES = [
  { rule: 'Set page size explicitly', detail: 'Default is A4 — use US Letter: 12240 × 15840 DXA', fatal: true },
  { rule: 'Never use \\n for line breaks', detail: 'Use separate Paragraph elements', fatal: true },
  { rule: 'Never use unicode bullets', detail: 'Use LevelFormat.BULLET with numbering config', fatal: true },
  { rule: 'Tables need dual widths', detail: 'columnWidths on table AND width on each cell (both DXA)', fatal: true },
  { rule: 'Always use WidthType.DXA', detail: 'Never WidthType.PERCENTAGE — breaks in Google Docs', fatal: true },
];

const TABLE_TRAPS = [
  'ShadingType.CLEAR — never SOLID (black backgrounds)',
  'PageBreak must be inside a Paragraph',
  'ImageRun requires type: "png" / "jpg"',
  'TOC: HeadingLevel only — no custom styles',
  'Override built-in styles: exact IDs "Heading1", "Heading2"',
];

export const DocxCreate: React.FC<DocxCreateProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const trapIn = spring({ frame: frame - 70, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const ruleSprings = CRITICAL_RULES.map((_, i) =>
    spring({ frame: frame - 12 - i * 11, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const trapSprings = TABLE_TRAPS.map((_, i) =>
    spring({ frame: frame - 72 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.43;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.44;
  const RULE_H = (H * 0.70) / 5 - 12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DOCX · CREATE · DOCX-JS RULES
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Five rules. All fatal if you miss them.
      </div>

      {/* Left: 5 critical rules */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 14,
          opacity: clamp(ruleSprings[0], 0, 1),
        }}>
          CRITICAL RULES FOR DOCX-JS:
        </div>
        {CRITICAL_RULES.map((item, i) => {
          const op = clamp(ruleSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: i < 2 ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${i < 2 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '16px 18px', marginBottom: 13,
              height: RULE_H, boxSizing: 'border-box' as const,
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              boxShadow: i < 2 ? '0 4px 14px rgba(217,119,87,0.10)' : '0 3px 10px rgba(61,57,41,0.05)',
            }}>
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 2 }}>
                ✕ {item.rule}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>
                {item.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: More traps + setup callout */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 12, padding: '14px 18px', marginBottom: 18,
          boxShadow: '0 4px 14px rgba(61,57,41,0.06)',
          opacity: clamp(headerIn, 0, 1),
        }}>
          <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.SPARK, fontWeight: 700, marginBottom: 6 }}>
            npm install -g docx
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
            After creating: <span style={{ fontFamily: MONO, color: CLAUDE.INK }}>python scripts/office/validate.py doc.docx</span>
          </div>
        </div>

        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12,
          opacity: clamp(trapIn, 0, 1),
        }}>
          ALSO WATCH FOR:
        </div>
        {TABLE_TRAPS.map((trap, i) => {
          const op = clamp(trapSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 13,
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: CLAUDE.SPARK, flexShrink: 0, marginTop: 6 }} />
              <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {trap}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
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
