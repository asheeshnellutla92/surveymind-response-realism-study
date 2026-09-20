import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AiSkillStudyDesign — Figure 1 rebuild for "AI Speeds You Up. What Does It Do to Your Skills?"
 * Source: Shen & Tamkin 2026, arXiv:2601.20245
 *
 * A four-stage horizontal pipeline, two rows (Treatment / Control):
 *   1. Warm-up coding task — 10 min — both rows: No AI
 *   2. Trio task — 35 min — Treatment: AI ASSISTANCE (terracotta); Control: No AI
 *   3. Post-task quiz — 25 min — both rows: No AI
 *   4. Post-task survey — 5 min — both rows: No AI
 *
 * Animate: stages slide in left-to-right; the single "AI assistance" cell is
 * the one terracotta accent moment; No AI cells are muted ink stamps.
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const aiSkillStudyDesignSchema = z.object({
  sparkLine: z.string().default('52 developers. One variable.'),
});
export type AiSkillStudyDesignProps = z.infer<typeof aiSkillStudyDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Study stages
const STAGES = [
  { label: 'Warm-up\ntask', duration: '10 min', stageIndex: 0 },
  { label: 'Trio\ntask', duration: '35 min', stageIndex: 1 },
  { label: 'Post-task\nquiz', duration: '25 min', stageIndex: 2 },
  { label: 'Post-task\nsurvey', duration: '5 min', stageIndex: 3 },
];

// Cells: [stageIndex][row] = { isAI, label }
function cellConfig(stageIndex: number, row: 'treatment' | 'control') {
  if (stageIndex === 1 && row === 'treatment') {
    return { isAI: true, label: 'AI\nAssistance' };
  }
  return { isAI: false, label: 'No AI' };
}

export const AiSkillStudyDesign: React.FC<AiSkillStudyDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Stagger: each stage slides in sequentially
  const stageDelay = 20; // frames between each stage appearing
  const stageAnimations = STAGES.map((_, i) =>
    spring({ frame: frame - i * stageDelay, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } })
  );

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const rowLabelIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - (STAGES.length * stageDelay + 20), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - (STAGES.length * stageDelay + 30), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const DIAGRAM_TOP = height * 0.30;
  const DIAGRAM_HEIGHT = height * 0.52;
  const CELL_W = (width - PAD_X * 2 - 120) / STAGES.length;
  const ROW_H = DIAGRAM_HEIGHT / 2 - 8;
  const ROW_LABEL_W = 110;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.015,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        STUDY DESIGN · RANDOMIZED CONTROLLED TRIAL
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.06,
        fontFamily: SERIF,
        fontSize: height * 0.038,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        How the study worked
      </div>

      {/* ROW LABELS */}
      {['Treatment\n(AI group)', 'Control\n(No AI group)'].map((label, rowIdx) => {
        const yPos = DIAGRAM_TOP + rowIdx * (ROW_H + 16);
        return (
          <div key={rowIdx} style={{
            position: 'absolute',
            left: PAD_X,
            top: yPos,
            width: ROW_LABEL_W,
            height: ROW_H,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 12,
            opacity: clamp(rowLabelIn, 0, 1),
          }}>
            <div style={{
              fontFamily: SERIF,
              fontSize: height * 0.016,
              fontWeight: 600,
              color: rowIdx === 0 ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'right',
              lineHeight: 1.35,
              whiteSpace: 'pre-line',
            }}>
              {label}
            </div>
          </div>
        );
      })}

      {/* STAGE CELLS */}
      {STAGES.map((stage, stageIdx) => {
        const anim = stageAnimations[stageIdx];
        const xBase = PAD_X + ROW_LABEL_W + stageIdx * CELL_W;

        return (
          <React.Fragment key={stageIdx}>
            {/* Stage header */}
            <div style={{
              position: 'absolute',
              left: xBase,
              top: DIAGRAM_TOP - height * 0.09,
              width: CELL_W - 4,
              textAlign: 'center',
              opacity: clamp(anim, 0, 1),
              transform: `translateY(${(1 - anim) * 14}px)`,
            }}>
              <div style={{
                fontFamily: SANS,
                fontSize: height * 0.013,
                fontWeight: 700,
                color: CLAUDE.INK,
                whiteSpace: 'pre-line',
                lineHeight: 1.3,
              }}>{stage.label}</div>
              <div style={{
                fontFamily: SANS,
                fontSize: height * 0.012,
                color: CLAUDE.INK_SOFT,
                marginTop: 2,
              }}>{stage.duration}</div>
            </div>

            {/* Cells for treatment and control */}
            {(['treatment', 'control'] as const).map((row, rowIdx) => {
              const cell = cellConfig(stageIdx, row);
              const yPos = DIAGRAM_TOP + rowIdx * (ROW_H + 16);

              return (
                <div key={row} style={{
                  position: 'absolute',
                  left: xBase,
                  top: yPos,
                  width: CELL_W - 6,
                  height: ROW_H,
                  borderRadius: 8,
                  background: cell.isAI ? CLAUDE.SPARK : CLAUDE.PILL,
                  border: cell.isAI ? 'none' : `1.5px solid ${CLAUDE.BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: clamp(anim, 0, 1),
                  transform: `translateX(${(1 - anim) * 24}px)`,
                }}>
                  <div style={{
                    fontFamily: SERIF,
                    fontSize: height * 0.0185,
                    fontWeight: cell.isAI ? 700 : 500,
                    color: cell.isAI ? '#FFFFFF' : CLAUDE.INK_SOFT,
                    textAlign: 'center',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.3,
                  }}>
                    {cell.label}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Data: Anthropic — Shen &amp; Tamkin 2026, arXiv:2601.20245
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.022,
          fontStyle: 'italic',
          color: CLAUDE.INK,
        }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
