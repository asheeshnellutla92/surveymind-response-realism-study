import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DocxTell — B05 — Teardown moment.
 * Central callout: The ZIP insight. Two columns: gets right / bites.
 */

export const docxTellSchema = z.object({
  sparkLine: z.string().default('It is XML. Treat it like XML.'),
});
export type DocxTellProps = z.infer<typeof docxTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const GETS_RIGHT = [
  'Two paths cover 100% of use cases: create new or edit existing',
  'docx-js critical rules prevent the most common generation failures',
  'Unpack/repack workflow makes XML editable without a library',
  'Auto-repair in pack.py catches durableId overflow and whitespace bugs',
  'Quick reference maps 5 task types to exact approach — no guessing',
];

const BITES = [
  'docx-js defaults silently produce A4 documents — page size trap',
  'WidthType.PERCENTAGE tables break in Google Docs, no warning',
  'Tracked changes XML is verbose — easy to nest elements incorrectly',
  'No access to LibreOffice means .doc conversion is blocked',
  'Element order inside <w:pPr> is fixed — wrong order = invalid XML',
];

export const DocxTell: React.FC<DocxTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const rightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 36 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const bitesSprings = BITES.map((_, i) =>
    spring({ frame: frame - 36 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.40;
  const COL_W = W * 0.40;
  // Card height per item: fill from COL_TOP+label to spark at H*0.92
  const ITEM_H = (H * 0.51) / 5 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DOCX · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Word documents are just dressed-up XML.
      </div>

      {/* Central callout */}
      <div style={{
        position: 'absolute', top: H * 0.26, left: W * 0.08, right: W * 0.08,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 16, padding: '18px 28px',
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 17, color: CLAUDE.INK, lineHeight: 1.6 }}>
          A{' '}<span style={{ fontFamily: MONO, color: CLAUDE.SPARK, fontWeight: 700 }}>.docx is a ZIP archive</span>{' '}containing XML files.
          That is the insight. Unpack it, edit the XML with the Edit tool, repack it.
          No library needed for edits. The five docx-js critical rules exist because the library's
          defaults don't match what Word actually produces — the skill documents the gap.
        </div>
      </div>

      {/* Two columns — card-row style to fill canvas */}
      <div style={{ position: 'absolute', left: W * 0.06, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 14,
        }}>
          ✓ WHAT IT GETS RIGHT
        </div>
        {GETS_RIGHT.map((item, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              height: ITEM_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK, lineHeight: 1.5 }}>
                {item}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', left: W * 0.53, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 14,
        }}>
          ✗ WHERE IT BITES
        </div>
        {BITES.map((item, i) => {
          const op = clamp(bitesSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.04)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              height: ITEM_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 12px rgba(217,119,87,0.08)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK, lineHeight: 1.5 }}>
                {item}
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
