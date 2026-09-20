import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HaiBrutalistE09Rebuild — static → animated rebuild + ASK→RESULT receipt.
 * LEFT (60%): greyed "static source figure" card with crosshatch pattern
 * RIGHT (40%): native animated bar chart in terracotta
 * Center: "REBUILT →" label in SPARK
 * Bottom strip: ASK→RESULT receipt
 * Beat B01 of hai-brutalist-make-it-move.
 */

export const haiBrutalistE09RebuildSchema = z.object({
  sparkLine: z.string().default('Rebuild the idea as motion. Never screenshot.'),
});
export type HaiBrutalistE09RebuildProps = z.infer<typeof haiBrutalistE09RebuildSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const BAR_DATA = [
  { label: 'A', pct: 0.55 },
  { label: 'B', pct: 0.80 },
  { label: 'C', pct: 0.40 },
  { label: 'D', pct: 0.95 },
  { label: 'E', pct: 0.65 },
];

export const HaiBrutalistE09Rebuild: React.FC<HaiBrutalistE09RebuildProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PANEL_Y = height * 0.27;
  const PANEL_H = height * 0.46;

  const LEFT_W = width * 0.44;
  const RIGHT_W = width * 0.35;
  const RIGHT_X = PAD_X + LEFT_W + 80;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const leftIn = spring({ frame: frame - 14, fps, config: { damping: 25, stiffness: 80 } });
  const labelIn = spring({ frame: frame - 45, fps, config: { damping: 25, stiffness: 100 } });
  const rightIn = spring({ frame: frame - 55, fps, config: { damping: 25, stiffness: 80 } });
  const receiptIn = spring({ frame: frame - 95, fps, config: { damping: 25, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 100 } });

  const BAR_MAX_H = PANEL_H * 0.60;
  const BAR_W = (RIGHT_W - 40) / BAR_DATA.length - 8;

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
        Make It Move
      </div>

      {/* LEFT — static source figure */}
      <div style={{
        position: 'absolute',
        left: PAD_X, top: PANEL_Y,
        width: LEFT_W, height: PANEL_H,
        background: '#EBEBEB',
        border: `2px solid ${CLAUDE.BORDER}`,
        borderRadius: 14,
        overflow: 'hidden',
        opacity: clamp(leftIn, 0, 1),
        transform: `translateX(${(1 - clamp(leftIn, 0, 1)) * -20}px)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        {/* Crosshatch pattern via SVG */}
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}>
          <defs>
            <pattern id="crosshatch" width={16} height={16} patternUnits="userSpaceOnUse">
              <path d="M0 16 L16 0 M-4 4 L4 -4 M12 20 L20 12" stroke="#666" strokeWidth={1} />
              <path d="M0 0 L16 16 M-4 12 L4 20 M12 -4 L20 4" stroke="#666" strokeWidth={1} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crosshatch)" />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: height * 0.020, fontWeight: 700, color: CLAUDE.GHOST, zIndex: 1 }}>
          Static Source Figure
        </div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.015, color: CLAUDE.GHOST, zIndex: 1 }}>
          screenshot / exported image
        </div>
      </div>

      {/* Center REBUILT label */}
      <div style={{
        position: 'absolute',
        left: PAD_X + LEFT_W + 12,
        top: PANEL_Y + PANEL_H / 2 - 18,
        width: 60,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 4,
        opacity: clamp(labelIn, 0, 1),
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.SPARK, letterSpacing: 1 }}>
          REBUILT
        </div>
        <svg width={36} height={28} viewBox="0 0 36 28">
          <path d="M2 14 L30 14 M22 6 L32 14 L22 22"
            stroke={CLAUDE.SPARK} strokeWidth={2.5} fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* RIGHT — animated bar chart */}
      <div style={{
        position: 'absolute',
        left: RIGHT_X, top: PANEL_Y,
        width: RIGHT_W, height: PANEL_H,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 14,
        padding: '16px 20px',
        opacity: clamp(rightIn, 0, 1),
        transform: `translateX(${(1 - clamp(rightIn, 0, 1)) * 20}px)`,
        boxShadow: `0 6px 24px ${CLAUDE.SPARK}22`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: BAR_MAX_H }}>
          {BAR_DATA.map((bar, i) => {
            const barDelay = 65 + i * 10;
            const barIn = spring({ frame: frame - barDelay, fps, config: { damping: 22, stiffness: 80 } });
            const barH = clamp(barIn, 0, 1) * bar.pct * BAR_MAX_H;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                <div style={{
                  width: '100%', height: barH,
                  background: CLAUDE.SPARK,
                  borderRadius: '4px 4px 0 0',
                  minHeight: barH > 0 ? 4 : 0,
                }} />
                <span style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{bar.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ASK→RESULT receipt */}
      <div style={{
        position: 'absolute',
        left: PAD_X, right: PAD_X,
        bottom: height * 0.12,
        background: CLAUDE.FOOTER,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        opacity: clamp(receiptIn, 0, 1),
      }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.SPARK }}>ASK →</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT, flex: 1 }}>"build a bar chart of…"</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.SPARK }}>RESULT →</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT }}>rendered Manim scene</span>
      </div>

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
