import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DocxEdit — B03 — Editing existing .docx: 3-step workflow + XML patterns.
 * Left: 3-step unpack→edit→pack flow. Right: tracked changes XML pattern.
 */

export const docxEditSchema = z.object({
  sparkLine: z.string().default('Unpack. Edit XML. Repack. In that order.'),
});
export type DocxEditProps = z.infer<typeof docxEditSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STEPS = [
  {
    num: 1,
    label: 'Unpack',
    cmd: 'python scripts/office/unpack.py document.docx unpacked/',
    note: 'Extracts XML, pretty-prints, merges adjacent runs. Converts smart quotes to XML entities.',
    delay: 10,
  },
  {
    num: 2,
    label: 'Edit XML',
    cmd: 'Edit tool → unpacked/word/document.xml',
    note: 'Use Edit tool for str_replace. Do NOT write Python scripts. Author = "Claude".',
    delay: 28,
  },
  {
    num: 3,
    label: 'Pack',
    cmd: 'python scripts/office/pack.py unpacked/ output.docx --original document.docx',
    note: 'Validates with auto-repair. Use --validate false to skip.',
    delay: 46,
  },
];

const XML_PITFALLS = [
  'Replace entire <w:r> elements for tracked changes — never inject tags inside a run',
  'Preserve <w:rPr> formatting blocks when adding tracked changes',
  'Use <w:delText> inside <w:del>, not <w:t>',
  'Element order in <w:pPr>: pStyle → numPr → spacing → ind → jc → rPr LAST',
  'Smart quotes via XML entities: &#x2019; &#x201C; &#x201D;',
];

export const DocxEdit: React.FC<DocxEditProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const pitfallsIn = spring({ frame: frame - 58, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const stepSprings = STEPS.map(s =>
    spring({ frame: frame - s.delay, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const pitfallSprings = XML_PITFALLS.map((_, i) =>
    spring({ frame: frame - 60 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.43;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.44;
  const STEP_H = (H * 0.58) / 3 - 12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DOCX · EDIT · UNPACK → XML → REPACK
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Three steps. In order. Every time.
      </div>

      {/* Left: 3-step workflow */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        {STEPS.map((step, i) => {
          const op = clamp(stepSprings[i], 0, 1);
          return (
            <div key={i}>
              <div style={{
                background: i === 1 ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
                border: `1px solid ${i === 1 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderLeft: `5px solid ${i === 1 ? CLAUDE.SPARK : CLAUDE.INK}`,
                borderRadius: 14, padding: '16px 20px',
                height: STEP_H, boxSizing: 'border-box' as const,
                boxShadow: i === 1 ? '0 6px 22px rgba(217,119,87,0.14)' : '0 4px 14px rgba(61,57,41,0.06)',
                opacity: op, transform: `translateX(${(1 - op) * 16}px)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: i === 1 ? CLAUDE.SPARK : CLAUDE.INK,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#FFF',
                  }}>
                    {step.num}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: CLAUDE.INK }}>
                    {step.label}
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12, color: i === 1 ? CLAUDE.SPARK : CLAUDE.INK_SOFT, marginBottom: 6, lineHeight: 1.4 }}>
                  {step.cmd}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
                  {step.note}
                </div>
              </div>
              {i < 2 && (
                <div style={{
                  textAlign: 'center', fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT,
                  height: 18, lineHeight: '18px', marginBottom: 4,
                  opacity: clamp(stepSprings[i + 1], 0, 1),
                }}>
                  ↓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: XML pitfalls */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 14,
          opacity: clamp(pitfallsIn, 0, 1),
        }}>
          XML PITFALLS:
        </div>
        {XML_PITFALLS.map((pitfall, i) => {
          const op = clamp(pitfallSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14,
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: CLAUDE.SPARK, flexShrink: 0, marginTop: 6 }} />
              <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {pitfall}
              </div>
            </div>
          );
        })}

        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 10, padding: '12px 16px', marginTop: 6,
          boxShadow: '0 4px 12px rgba(61,57,41,0.06)',
          opacity: clamp(pitfallSprings[4], 0, 1),
        }}>
          <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT, marginBottom: 4 }}>AUTO-REPAIR HANDLES:</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.4 }}>
            durableId overflow · missing xml:space="preserve"
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.SPARK, marginTop: 4 }}>AUTO-REPAIR WON'T FIX:</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.4 }}>
            Malformed XML · invalid nesting · missing relationships
          </div>
        </div>
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
