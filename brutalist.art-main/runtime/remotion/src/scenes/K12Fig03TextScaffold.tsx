import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig03TextScaffold — "Same Text, Different Support"
 * Source: Agent Skills for K-12 Teachers (Anthropic) — k12-lesson-differentiation
 *
 * Manim move: split (one text divides into: scaffolded Left | clean Right)
 *
 * Phase 1: The same passage shown once, full width (unified)
 * Phase 2: It splits into two columns — Left (Below) fills with annotation prompts in terracotta;
 *           Right (At) stays clean. The text itself is IDENTICAL in both columns.
 *
 * Terracotta: the scaffold annotations on the left (Below) column.
 */

export const k12Fig03TextScaffoldSchema = z.object({
  sparkLine: z.string().default('Same text. Different support structure.'),
});
export type K12Fig03TextScaffoldProps = z.infer<typeof k12Fig03TextScaffoldSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PASSAGE = 'The First Amendment protects five fundamental freedoms: speech, religion, press, assembly, and petition. Ratified in 1791, it was designed to prevent government from silencing citizens or controlling beliefs. These rights are not absolute — courts have defined limits in cases of clear danger or defamation.';

const SCAFFOLDS = [
  { prompt: 'As you read, mark: (circle) the main idea', line: 0 },
  { prompt: '(underline) one piece of evidence', line: 1 },
  { prompt: '(?) one unknown word', line: 2 },
  { prompt: 'Vocabulary: amendment = a change to law\nratified = officially approved', line: 3 },
];

const PHASE_SWITCH = 60;

export const K12Fig03TextScaffold: React.FC<K12Fig03TextScaffoldProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const splitIn = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 26, stiffness: 90, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const showSplit = frame >= PHASE_SWITCH;

  const splitProg = clamp(splitIn, 0, 1);
  const MID = width / 2;

  // Phase 1: one centered column; Phase 2: two columns
  const leftW = showSplit ? (MID - PAD_X - 20) * splitProg + (width - PAD_X * 2) * (1 - splitProg) : width - PAD_X * 2;
  const leftX = showSplit ? PAD_X : PAD_X;

  const CARD_Y = height * 0.26;
  const CARD_H = height * 0.56;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        7TH GRADE ELA · SAME TEXT · ACCESS SCAFFOLD vs CLEAN
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Easier text closes the door. Scaffolds open it.
      </div>

      {/* LEFT panel (Below tier) */}
      <div style={{
        position: 'absolute', left: leftX, top: CARD_Y,
        width: leftW, height: CARD_H,
        background: CLAUDE.CARD, borderRadius: 12,
        border: `2px solid ${showSplit ? CLAUDE.SPARK : CLAUDE.BORDER}`,
        padding: 20, overflow: 'hidden',
        transition: 'none',
      }}>
        {showSplit && (
          <div style={{
            fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
            color: CLAUDE.SPARK, marginBottom: 10, opacity: splitProg,
          }}>
            BELOW — Access Scaffold
          </div>
        )}
        <div style={{
          fontFamily: SERIF, fontSize: height * 0.015, color: CLAUDE.INK,
          lineHeight: 1.7,
        }}>
          {PASSAGE}
        </div>
        {/* Scaffold annotations */}
        {showSplit && SCAFFOLDS.map((s, si) => {
          const anim = spring({ frame: frame - PHASE_SWITCH - si * 8, fps, config: { damping: 22, stiffness: 85, mass: 0.9 } });
          return (
            <div key={si} style={{
              marginTop: si === 0 ? 14 : 6,
              fontFamily: SANS, fontSize: height * 0.012,
              color: CLAUDE.SPARK, lineHeight: 1.4,
              opacity: clamp(anim, 0, 1),
              borderLeft: `2px solid ${CLAUDE.SPARK}`,
              paddingLeft: 8,
              whiteSpace: 'pre-line' as const,
            }}>
              {s.prompt}
            </div>
          );
        })}
      </div>

      {/* RIGHT panel (At tier) — only in phase 2 */}
      {showSplit && (
        <div style={{
          position: 'absolute', left: MID + 20, top: CARD_Y,
          width: MID - PAD_X - 20, height: CARD_H,
          background: CLAUDE.CARD, borderRadius: 12,
          border: `1px solid ${CLAUDE.BORDER}`,
          padding: 20, overflow: 'hidden',
          opacity: splitProg,
        }}>
          <div style={{
            fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
            color: CLAUDE.INK_SOFT, marginBottom: 10,
          }}>
            AT — No Scaffold
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: height * 0.015, color: CLAUDE.INK,
            lineHeight: 1.7,
          }}>
            {PASSAGE}
          </div>
          <div style={{
            marginTop: 14,
            fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
            fontStyle: 'italic' as const,
          }}>
            Identify the author's central argument.
          </div>
        </div>
      )}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Agent Skills for K-12 Teachers (Anthropic)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    
      {/* @NikBearBrown watermark — lower-right, low opacity (LOGO LAW) */}
      <div style={{
        position: 'absolute',
        right: width * 0.04,
        bottom: height * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        @NikBearBrown
      </div>
    </AbsoluteFill>

  );
};
