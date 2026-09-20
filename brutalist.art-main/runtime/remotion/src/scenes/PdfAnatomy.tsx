import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PdfAnatomy — B01 — 3 Python libraries mapped to operations + CLI tools + specialist files.
 */

export const pdfAnatomySchema = z.object({
  sparkLine: z.string().default('Route to the right library. Never guess.'),
});
export type PdfAnatomyProps = z.infer<typeof pdfAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const LIBRARIES = [
  {
    name: 'pypdf',
    domain: 'Manipulation',
    ops: 'merge · split · rotate · watermark · encrypt · metadata',
    accent: true,
  },
  {
    name: 'pdfplumber',
    domain: 'Extraction',
    ops: 'text with layout · tables → pandas DataFrames',
    accent: false,
  },
  {
    name: 'reportlab',
    domain: 'Creation',
    ops: 'Canvas (low-level) · Platypus (structured documents)',
    accent: false,
  },
];

const CLI_TOOLS = [
  { name: 'pdftotext', note: 'layout-preserving text extraction' },
  { name: 'qpdf', note: 'merge · split · rotate · decrypt' },
  { name: 'pdftk', note: 'merge · split · rotate (if available)' },
  { name: 'pdfimages', note: 'extract embedded images' },
];

const SPECIALIST_FILES = [
  { file: 'FORMS.md', note: 'form filling — read before attempting pdf forms' },
  { file: 'REFERENCE.md', note: 'advanced pypdfium2 + JavaScript pdf-lib' },
];

export const PdfAnatomy: React.FC<PdfAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const libSprings = LIBRARIES.map((_, i) =>
    spring({ frame: frame - 20 - i * 14, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const cliSprings = CLI_TOOLS.map((_, i) =>
    spring({ frame: frame - 50 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const specSprings = SPECIALIST_FILES.map((_, i) =>
    spring({ frame: frame - 90 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const LIB_H = (H * 0.56) / 3 - 12;
  const CLI_H = (H * 0.38) / 4 - 9;
  const SPEC_H = (H * 0.17) / 2 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        PDF · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Manipulate. Extract. Create.
      </div>

      {/* Left: 3 library cards */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.04, width: LEFT_W }}>
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 12, padding: '10px 14px',
          marginBottom: 14, opacity: clamp(triggerIn, 0, 1),
          transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 10}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>
            TRIGGER
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.45 }}>
            any .pdf file · "extract" · "merge" · "create PDF" · "fill form" · "OCR"
          </div>
        </div>

        {LIBRARIES.map((lib, i) => {
          const op = clamp(libSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: lib.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${lib.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${lib.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 12, padding: '14px 18px',
              height: LIB_H, boxSizing: 'border-box' as const,
              marginBottom: 10,
              boxShadow: lib.accent ? '0 4px 14px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: lib.accent ? CLAUDE.SPARK : CLAUDE.INK }}>{lib.name}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK_SOFT, letterSpacing: 1, textTransform: 'uppercase' as const }}>{lib.domain}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT }}>{lib.ops}</div>
            </div>
          );
        })}
      </div>

      {/* Right: CLI tools + specialist files */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12,
          opacity: clamp(cliSprings[0], 0, 1),
        }}>
          CLI TOOLS:
        </div>
        {CLI_TOOLS.map((t, i) => {
          const op = clamp(cliSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.INK}`,
              borderRadius: 8, padding: '9px 12px', marginBottom: 9,
              height: CLI_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.SPARK, flexShrink: 0 }}>{t.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{t.note}</div>
            </div>
          );
        })}

        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 10, marginTop: 14,
          opacity: clamp(specSprings[0], 0, 1),
        }}>
          SPECIALIST FILES:
        </div>
        {SPECIALIST_FILES.map((sf, i) => {
          const op = clamp(specSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.SPARK}`,
              borderRadius: 8, padding: '9px 12px', marginBottom: 9,
              height: SPEC_H, boxSizing: 'border-box' as const,
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.SPARK, flexShrink: 0 }}>{sf.file}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK }}>{sf.note}</div>
            </div>
          );
        })}
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
