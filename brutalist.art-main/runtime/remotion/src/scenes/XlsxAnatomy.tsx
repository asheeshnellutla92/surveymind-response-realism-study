import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * XlsxAnatomy — B01 — Tool decision (pandas vs openpyxl) + 6-step workflow.
 */

export const xlsxAnatomySchema = z.object({
  sparkLine: z.string().default('Tool decision. Six steps. recalc.py is mandatory.'),
});
export type XlsxAnatomyProps = z.infer<typeof xlsxAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PANDAS_USES = [
  'Data analysis, statistics, filtering',
  'Bulk operations and transformations',
  'Simple export to Excel',
];

const OPENPYXL_USES = [
  'Complex formatting and color coding',
  'Writing formula strings to cells',
  'Column widths, merging, Excel features',
];

const WORKFLOW_STEPS = [
  { n: '01', label: 'Choose tool', detail: 'pandas or openpyxl based on formulas/formatting need', highlight: false },
  { n: '02', label: 'Create or load', detail: 'Workbook() or load_workbook("existing.xlsx")', highlight: false },
  { n: '03', label: 'Modify', detail: 'Add data, write formula strings, apply formatting', highlight: false },
  { n: '04', label: 'Save', detail: 'wb.save("output.xlsx")', highlight: false },
  { n: '05', label: 'scripts/recalc.py', detail: 'MANDATORY — LibreOffice recalc + error scan → JSON', highlight: true },
  { n: '06', label: 'Fix errors', detail: 'Read JSON, fix #REF!/#DIV/0! errors, recalculate again', highlight: false },
];

export const XlsxAnatomy: React.FC<XlsxAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 110, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const pandasSprings = PANDAS_USES.map((_, i) =>
    spring({ frame: frame - 22 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const openpyxlSprings = OPENPYXL_USES.map((_, i) =>
    spring({ frame: frame - 22 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const workflowSprings = WORKFLOW_STEPS.map((_, i) =>
    spring({ frame: frame - 22 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.30;
  const LEFT_W = W * 0.36;
  const RIGHT_W = W * 0.40;
  const PD_H = (H * 0.24) / 3 - 8;
  const PY_H = (H * 0.24) / 3 - 8;
  const STEP_H = (H * 0.58) / 6 - 9;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        XLSX · TOOL DECISION + WORKFLOW
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 46, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        pandas or openpyxl — then recalc.
      </div>

      {/* TRIGGER */}
      <div style={{
        position: 'absolute', top: H * 0.228, left: W * 0.08, right: W * 0.08,
        background: `rgba(217,119,87,0.07)`, border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 14, padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        opacity: clamp(triggerIn, 0, 1),
        transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 10}px)`,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: CLAUDE.SPARK, whiteSpace: 'nowrap' as const }}>TRIGGER</span>
        <span style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK }}>
          Primary deliverable IS a spreadsheet file (.xlsx/.xlsm/.csv/.tsv) — not a doc, HTML report, or database pipeline
        </span>
      </div>

      {/* pandas column */}
      <div style={{ position: 'absolute', left: W * 0.06, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(pandasSprings[0], 0, 1),
        }}>
          PANDAS — analysis + bulk export
        </div>
        {PANDAS_USES.map((item, i) => {
          const op = clamp(pandasSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 8, padding: '9px 13px', marginBottom: 8,
              height: PD_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.4 }}>{item}</div>
            </div>
          );
        })}

        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginTop: 16, marginBottom: 8,
          opacity: clamp(openpyxlSprings[0], 0, 1),
        }}>
          OPENPYXL — formulas + formatting
        </div>
        {OPENPYXL_USES.map((item, i) => {
          const op = clamp(openpyxlSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: `rgba(217,119,87,0.04)`, border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 8, padding: '9px 13px', marginBottom: 8,
              height: PY_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 10px rgba(217,119,87,0.06)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.4 }}>{item}</div>
            </div>
          );
        })}
      </div>

      {/* Workflow column */}
      <div style={{ position: 'absolute', left: W * 0.53, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(workflowSprings[0], 0, 1),
        }}>
          6-STEP WORKFLOW
        </div>
        {WORKFLOW_STEPS.map((step, i) => {
          const op = clamp(workflowSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: step.highlight ? 'rgba(217,119,87,0.08)' : '#FFFFFF',
              border: `1px solid ${step.highlight ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${step.highlight ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 8, padding: '9px 13px', marginBottom: 8,
              height: STEP_H, boxSizing: 'border-box' as const,
              boxShadow: step.highlight ? '0 3px 12px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: step.highlight ? CLAUDE.SPARK : CLAUDE.INK_SOFT }}>{step.n}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: step.highlight ? CLAUDE.SPARK : CLAUDE.INK }}>{step.label}</span>
              </div>
              <div style={{ fontFamily: step.highlight ? MONO : SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4, marginTop: 3 }}>
                {step.detail}
              </div>
            </div>
          );
        })}
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
