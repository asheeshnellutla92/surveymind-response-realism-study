import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DocxAnatomy — B01 — TRIGGER + two paths (create vs edit) + quick reference table.
 */

export const docxAnatomySchema = z.object({
  sparkLine: z.string().default('A .docx is just a ZIP of XML.'),
});
export type DocxAnatomyProps = z.infer<typeof docxAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const QUICK_REF = [
  { task: 'Read / analyze content', approach: 'pandoc or unpack for raw XML' },
  { task: 'Create new document', approach: 'docx-js (npm install -g docx)' },
  { task: 'Edit existing document', approach: 'Unpack → edit XML → repack' },
  { task: 'Convert .doc to .docx', approach: 'scripts/office/soffice.py --convert-to docx' },
  { task: 'Convert to images', approach: 'soffice → pdf → pdftoppm' },
];

const PATHS = [
  {
    label: 'CREATE',
    desc: 'New .docx from scratch',
    tool: 'docx-js (npm)',
    steps: ['Write JS with Document / Paragraph / Table', 'Packer.toBuffer() → writeFileSync', 'validate.py to confirm'],
    accent: true,
    delay: 18,
  },
  {
    label: 'EDIT',
    desc: 'Modify existing .docx',
    tool: 'unpack → XML → repack',
    steps: ['unpack.py → word/*.xml', 'Edit tool for str_replace in XML', 'pack.py → output.docx'],
    accent: false,
    delay: 36,
  },
];

export const DocxAnatomy: React.FC<DocxAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const pathSprings = PATHS.map(p =>
    spring({ frame: frame - p.delay, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const refSprings = QUICK_REF.map((_, i) =>
    spring({ frame: frame - 55 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.42;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.44;
  const PATH_H = (H * 0.46) / 2 - 12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DOCX · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 52, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Create or edit. Two paths. One ZIP.
      </div>

      {/* Left: TRIGGER + two path cards */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 14, padding: '14px 18px',
          marginBottom: 18, opacity: clamp(triggerIn, 0, 1),
          transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 12}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 6 }}>
            TRIGGER
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK, lineHeight: 1.5 }}>
            "Word doc" · ".docx" · "report" · "memo" · "letter" · "template" · TOC / headings / page numbers.
          </div>
        </div>

        {PATHS.map((path, i) => {
          const op = clamp(pathSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: path.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${path.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${path.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 14, padding: '16px 20px',
              height: PATH_H, boxSizing: 'border-box' as const, marginBottom: 12,
              boxShadow: path.accent ? '0 6px 22px rgba(217,119,87,0.14)' : '0 4px 14px rgba(61,57,41,0.06)',
              opacity: op, transform: `translateX(${(1 - op) * 16}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{
                  fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: 2,
                  color: path.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                }}>
                  {path.label}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: CLAUDE.INK }}>
                  {path.desc}
                </div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13, color: path.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT, marginBottom: 8 }}>
                {path.tool}
              </div>
              {path.steps.map((s, j) => (
                <div key={j} style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, marginBottom: 3 }}>
                  {j + 1}. {s}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Right: Quick reference table */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 14,
          opacity: clamp(triggerIn, 0, 1),
        }}>
          QUICK REFERENCE:
        </div>
        {QUICK_REF.map((row, i) => {
          const op = clamp(refSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${i < 2 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 10,
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
            }}>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: CLAUDE.INK, marginBottom: 2 }}>
                {row.task}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT }}>
                {row.approach}
              </div>
            </div>
          );
        })}

        <div style={{
          background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.SPARK}`,
          borderRadius: 10, padding: '10px 14px', marginTop: 4,
          opacity: clamp(refSprings[4], 0, 1),
        }}>
          <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.5 }}>
            A <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>.docx is a ZIP archive</span> containing XML files. Unpack it and you have editable text.
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
