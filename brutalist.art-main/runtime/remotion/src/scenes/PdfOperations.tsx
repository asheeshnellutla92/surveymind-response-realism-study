import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PdfOperations — B02 — Quick reference (8 tasks → best tool + code) + OCR pipeline + reportlab gotcha.
 */

export const pdfOperationsSchema = z.object({
  sparkLine: z.string().default('Two steps for OCR. Never Unicode subscripts in reportlab.'),
});
export type PdfOperationsProps = z.infer<typeof pdfOperationsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const QUICK_REF = [
  { task: 'Merge PDFs', tool: 'pypdf', code: 'writer.add_page(page)' },
  { task: 'Split PDFs', tool: 'pypdf', code: 'one page per writer in loop' },
  { task: 'Extract text', tool: 'pdfplumber', code: 'page.extract_text()' },
  { task: 'Extract tables', tool: 'pdfplumber', code: 'page.extract_tables() → pandas' },
  { task: 'Create PDFs', tool: 'reportlab', code: 'Canvas or Platypus' },
  { task: 'CLI merge', tool: 'qpdf', code: 'qpdf --empty --pages ...' },
  { task: 'OCR scanned', tool: 'pytesseract', code: 'pdf2image → image_to_string' },
  { task: 'Fill forms', tool: 'FORMS.md', code: 'read FORMS.md first' },
];

export const PdfOperations: React.FC<PdfOperationsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const gotchaIn = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const rowSprings = QUICK_REF.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const ROW_H = (H * 0.66) / 4 - 10;
  const ROW_H_RIGHT = (H * 0.50) / 4 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        PDF · QUICK REFERENCE
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Task → Best tool → Code.
      </div>

      {/* Left: quick ref table (8 rows, split 4+4) */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.04, width: LEFT_W }}>
        {QUICK_REF.slice(0, 4).map((row, i) => {
          const op = clamp(rowSprings[i], 0, 1);
          const isLast = i === 3;
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.INK_SOFT}`,
              borderRadius: 8, padding: '9px 12px', marginBottom: 8,
              height: ROW_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: CLAUDE.INK }}>{row.task}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK }}>{row.tool}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT }}>{row.code}</div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.51, width: LEFT_W }}>
        {QUICK_REF.slice(4).map((row, i) => {
          const op = clamp(rowSprings[i + 4], 0, 1);
          return (
            <div key={i} style={{
              background: row.tool === 'FORMS.md' ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${row.tool === 'FORMS.md' ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${row.tool === 'FORMS.md' ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 8, padding: '9px 12px', marginBottom: 8,
              height: ROW_H_RIGHT, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: CLAUDE.INK }}>{row.task}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK }}>{row.tool}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT }}>{row.code}</div>
            </div>
          );
        })}

        {/* Reportlab gotcha callout */}
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1.5px solid ${CLAUDE.SPARK}`,
          borderRadius: 12, padding: '12px 16px', marginTop: 10,
          opacity: clamp(gotchaIn, 0, 1),
          transform: `translateY(${(1 - clamp(gotchaIn, 0, 1)) * 10}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.SPARK, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 5 }}>
            ⚠ REPORTLAB GOTCHA
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.4 }}>
            Never use Unicode subscripts (₂, ¹) — renders as{' '}
            <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>black boxes</span>.
            Use XML tags: <span style={{ fontFamily: MONO }}>{'<sub>2</sub>'}</span> in Paragraphs.
          </div>
        </div>
      </div>

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
