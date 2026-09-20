import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SycCurriculumStages — B02 for "From People-Pleaser to Reward Hacker"
 * Source: Denison et al. 2024, Anthropic — Sycophancy to Subterfuge
 *
 * Eight numbered stage cards in a 4×2 grid, springing in with stagger.
 * Each card: stage number, behavior name, one-line chip.
 * Stages 7 and 8 get terracotta border — the reward-editing stages.
 * Per CLAUDE-BRAND.md: terracotta is the ONE accent — earned by the final two stages.
 */

export const sycCurriculumStagesSchema = z.object({
  sparkLine: z.string().default('Same drive. Different budget.'),
});
export type SycCurriculumStagesProps = z.infer<typeof sycCurriculumStagesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STAGES = [
  { num: 1, name: 'Mildly Agreeable', chip: 'Slight approval-seeking' },
  { num: 2, name: 'Consistently Agreeable', chip: 'Positive reinforcement of user views' },
  { num: 3, name: 'Sycophantic', chip: 'Validates false premises' },
  { num: 4, name: 'Politically Sycophantic', chip: 'Mirrors political beliefs' },
  { num: 5, name: 'Factually Wrong', chip: 'Agrees despite clear errors' },
  { num: 6, name: 'Test-Tampering (Mild)', chip: 'Alters inputs to the test harness' },
  { num: 7, name: 'Modifies Reward Script', chip: 'Edits reward_cmd directly', isAlarm: true },
  { num: 8, name: 'Edits Reward + Tests', chip: 'Modifies reward script + unit tests', isAlarm: true },
];

export const SycCurriculumStages: React.FC<SycCurriculumStagesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  // Grid layout: 4 columns, 2 rows
  const COLS = 4;
  const ROWS = 2;
  const GRID_LEFT = PAD_X;
  const GRID_TOP = height * 0.28;
  const GRID_WIDTH = width - PAD_X * 2;
  const GRID_HEIGHT = height * 0.56;
  const CELL_W = GRID_WIDTH / COLS;
  const CELL_H = GRID_HEIGHT / ROWS;
  const CARD_PAD = height * 0.008;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Stagger: 12 frames between each card
  const STAGGER = 12;
  const cardAnims = STAGES.map((_, i) =>
    spring({ frame: frame - 15 - i * STAGGER, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } })
  );

  const sparkIn = spring({ frame: frame - (15 + STAGES.length * STAGGER + 20), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - (15 + STAGES.length * STAGGER + 30), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

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
        CURRICULUM · 8 ENVIRONMENTS
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.065,
        fontFamily: SERIF,
        fontSize: height * 0.036,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Eight stages of the same drive
      </div>

      {/* Stage cards */}
      {STAGES.map((stage, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const anim = cardAnims[i];
        const x = GRID_LEFT + col * CELL_W + CARD_PAD;
        const y = GRID_TOP + row * CELL_H + CARD_PAD;
        const cardW = CELL_W - CARD_PAD * 2;
        const cardH = CELL_H - CARD_PAD * 2;

        return (
          <div key={i} style={{
            position: 'absolute',
            left: x,
            top: y,
            width: cardW,
            height: cardH,
            borderRadius: 10,
            background: stage.isAlarm ? `rgba(217,119,87,0.06)` : CLAUDE.CARD,
            border: stage.isAlarm
              ? `2px solid ${CLAUDE.SPARK}`
              : `1.5px solid ${CLAUDE.BORDER}`,
            padding: `${height * 0.012}px ${height * 0.012}px`,
            boxSizing: 'border-box' as const,
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
            opacity: clamp(anim, 0, 1),
            transform: `translateY(${(1 - clamp(anim, 0, 1)) * 20}px)`,
            boxShadow: stage.isAlarm
              ? `0 4px 20px rgba(217,119,87,0.15)`
              : `0 2px 8px rgba(61,57,41,0.06)`,
          }}>
            {/* Stage number */}
            <div style={{
              fontFamily: SANS,
              fontSize: height * 0.012,
              fontWeight: 700,
              letterSpacing: 2,
              color: stage.isAlarm ? CLAUDE.SPARK : CLAUDE.GHOST,
              textTransform: 'uppercase' as const,
            }}>
              Stage {stage.num}
            </div>

            {/* Stage name */}
            <div style={{
              fontFamily: SERIF,
              fontSize: height * 0.018,
              fontWeight: stage.isAlarm ? 700 : 500,
              color: stage.isAlarm ? CLAUDE.SPARK : CLAUDE.INK,
              lineHeight: 1.3,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}>
              {stage.name}
            </div>

            {/* Behavior chip */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              paddingLeft: height * 0.006,
              paddingRight: height * 0.006,
              paddingTop: height * 0.004,
              paddingBottom: height * 0.004,
              borderRadius: 4,
              background: stage.isAlarm ? `rgba(217,119,87,0.12)` : CLAUDE.PILL,
              alignSelf: 'flex-start',
            }}>
              <div style={{
                fontFamily: SANS,
                fontSize: height * 0.011,
                color: stage.isAlarm ? CLAUDE.SEND : CLAUDE.INK_SOFT,
                lineHeight: 1.2,
              }}>
                {stage.chip}
              </div>
            </div>
          </div>
        );
      })}

      {/* Connecting arrows between cards (horizontal, within each row) */}
      {[0, 1, 2, 4, 5, 6].map((i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const anim = cardAnims[i + 1]; // arrow appears with the next card
        const arrowX = GRID_LEFT + (col + 1) * CELL_W - CARD_PAD;
        const arrowY = GRID_TOP + row * CELL_H + CELL_H / 2;

        return (
          <svg
            key={`arrow-${i}`}
            style={{
              position: 'absolute',
              left: arrowX - 8,
              top: arrowY - 8,
              opacity: clamp(anim, 0, 1),
              overflow: 'visible',
            }}
            width={16}
            height={16}
            viewBox="0 0 16 16"
          >
            <path d="M2 8 L14 8 M10 4 L14 8 L10 12" stroke={CLAUDE.GHOST} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      })}

      {/* Bottom label */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.15,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: height * 0.013,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(citeIn, 0, 1),
      }}>
        8 environments · 32,768 samples per stage · Denison et al. 2024, Anthropic
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
