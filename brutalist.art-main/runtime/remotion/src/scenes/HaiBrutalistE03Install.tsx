import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE03Install — terminal checklist: four install steps.
 * Step 1: Email chip (terracotta circle)
 * Step 2: cp .env.example .env (mono)
 * Step 3: ./setup --install (mono)
 * Step 4: ./art keys → ALL GREEN check (green glow on arrival)
 * Beat B01 of hai-brutalist-install.
 */

export const haiBrutalistE03InstallSchema = z.object({
  sparkLine: z.string().default('Five minutes from zero to ready.'),
});
export type HaiBrutalistE03InstallProps = z.infer<typeof haiBrutalistE03InstallSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STEPS = [
  {
    circle: CLAUDE.SPARK,
    label: 'hr@humanitarians.ai',
    isEmail: true,
    suffix: null,
  },
  {
    circle: CLAUDE.SPARK,
    label: 'cp .env.example .env',
    isEmail: false,
    suffix: null,
  },
  {
    circle: CLAUDE.SPARK,
    label: './setup --install',
    isEmail: false,
    suffix: null,
  },
  {
    circle: '#4A9E6A',
    label: './art keys',
    isEmail: false,
    suffix: 'ALL GREEN ✓',
  },
];

export const HaiBrutalistE03Install: React.FC<HaiBrutalistE03InstallProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.12;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 100 } });

  const LIST_TOP = height * 0.30;
  const ROW_H = height * 0.12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.09,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        HUMANITARIANS AI · BRUTALIST SERIES
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: height * 0.14,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Install & Set Up
      </div>

      {/* Step rows */}
      {STEPS.map((step, i) => {
        const delay = 18 + i * 22;
        const stepIn = spring({ frame: frame - delay, fps, config: { damping: 25, stiffness: 90, mass: 0.9 } });
        const isLast = i === STEPS.length - 1;
        const glow = isLast ? `0 0 24px #4A9E6A44, 0 4px 16px #4A9E6A22` : 'none';

        return (
          <div key={i} style={{
            position: 'absolute',
            left: PAD_X,
            top: LIST_TOP + i * ROW_H,
            right: PAD_X,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            opacity: clamp(stepIn, 0, 1),
            transform: `translateX(${(1 - clamp(stepIn, 0, 1)) * -20}px)`,
          }}>
            {/* Circle indicator */}
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: step.circle,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: isLast ? `0 0 18px #4A9E6A60` : 'none',
            }}>
              <span style={{
                fontFamily: SANS, fontSize: 15, fontWeight: 700,
                color: '#FFFFFF',
              }}>
                {i + 1}
              </span>
            </div>

            {/* Label */}
            {step.isEmail ? (
              <div style={{
                background: `${CLAUDE.SPARK}15`,
                border: `1.5px solid ${CLAUDE.SPARK}`,
                borderRadius: 20,
                padding: '7px 20px',
                fontFamily: SANS,
                fontSize: height * 0.022,
                fontWeight: 700,
                color: CLAUDE.SPARK,
              }}>
                {step.label}
              </div>
            ) : (
              <div style={{
                fontFamily: MONO,
                fontSize: height * 0.024,
                color: CLAUDE.INK,
              }}>
                {step.label}
              </div>
            )}

            {/* Suffix (step 4 only) */}
            {step.suffix && (
              <div style={{
                fontFamily: SANS,
                fontSize: height * 0.022,
                fontWeight: 700,
                color: '#4A9E6A',
                boxShadow: glow,
              }}>
                {step.suffix}
              </div>
            )}
          </div>
        );
      })}

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.07,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
