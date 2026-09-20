import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PptxAnatomy — B01 — 3 routing paths + QA workflow.
 */

export const pptxAnatomySchema = z.object({
  sparkLine: z.string().default('Read. Edit template. Create scratch. Then QA.'),
});
export type PptxAnatomyProps = z.infer<typeof pptxAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PATHS = [
  { trigger: 'Read / analyze content', tool: 'markitdown', cmd: 'python -m markitdown presentation.pptx', accent: false },
  { trigger: 'Edit existing template', tool: 'editing.md', cmd: 'thumbnail → unpack → edit → pack', accent: true },
  { trigger: 'Create from scratch', tool: 'pptxgenjs', cmd: 'npm install -g pptxgenjs', accent: false },
];

const QA_STEPS = [
  { step: 'Content QA', tool: 'markitdown', detail: 'Extract + grep for xxxx/lorem/ipsum placeholders' },
  { step: 'Thumbnail grid', tool: 'thumbnail.py', detail: 'Visual overview before committing to full QA' },
  { step: 'Convert to images', tool: 'soffice + pdftoppm', detail: 'PDF → JPEG slides for visual inspection' },
  { step: 'Visual QA', tool: 'subagents', detail: 'Fresh eyes — assume there are problems, not just confirm OK' },
];

export const PptxAnatomy: React.FC<PptxAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const pathSprings = PATHS.map((_, i) =>
    spring({ frame: frame - 22 - i * 14, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const qaSprings = QA_STEPS.map((_, i) =>
    spring({ frame: frame - 50 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const PATH_H = (H * 0.64) / 3 - 12;
  const QA_H = (H * 0.60) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        PPTX · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Three paths. Then QA.
      </div>

      {/* Left: 3 routing paths */}
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
            "deck" · "slides" · "presentation" · any .pptx filename
          </div>
        </div>

        {PATHS.map((path, i) => {
          const op = clamp(pathSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: path.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${path.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${path.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 12, padding: '14px 18px',
              height: PATH_H, boxSizing: 'border-box' as const,
              marginBottom: 10,
              boxShadow: path.accent ? '0 4px 14px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{path.trigger}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: CLAUDE.SPARK }}>{path.tool}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK_SOFT }}>{path.cmd}</div>
            </div>
          );
        })}
      </div>

      {/* Right: 4-step QA workflow */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 14,
          opacity: clamp(qaSprings[0], 0, 1),
        }}>
          QA WORKFLOW (MANDATORY):
        </div>
        {QA_STEPS.map((step, i) => {
          const op = clamp(qaSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: i === 3 ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${i === 3 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${i === 3 ? CLAUDE.SPARK : CLAUDE.INK}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              height: QA_H, boxSizing: 'border-box' as const,
              boxShadow: i === 3 ? '0 4px 14px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{step.step}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK }}>{step.tool}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>{step.detail}</div>
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
