/**
 * illustrations/kit.tsx — shared primitives for the concept-illustration library.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Every illustration in this folder is a PURE FUNCTION OF THE AUDIO CLOCK.
 * There is exactly one source of time: `useP()`, which returns normalized
 * progress p ∈ [0,1] across the beat's duration. Nothing here reads wall-clock
 * time, mounts a CSS transition, or holds mutable state — so seeking to any
 * frame renders identically every time (Remotion's determinism contract).
 *
 * All motion is built from three tiny helpers:
 *   clamp   — bound a value
 *   remap   — clamped linear remap of x∈[x0,x1] → [y0,y1]   (the workhorse)
 *   ease    — easeOutCubic, the house settle curve
 *
 * The two exported wrappers enforce brand law so a new illustration can't drift:
 *   SparkLine  — the ONE serif line + spark that every inner beat must carry
 *                (SPARK-LINE LAW: inner beats never show a lonely asterisk).
 *   IlluStage  — the cream stage (#F2F0E9) + SparkLine + your illustration.
 *
 * STARTER-TEMPLATE NOTE FOR FUTURE BRUTALIST REELS
 * ------------------------------------------------
 * To adapt any illustration in this library to a new reel: keep useP()/IlluStage
 * exactly as-is, change only the DATA passed in as props. If you find yourself
 * editing the motion math, you're probably building a NEW pattern — add it here
 * as its own component rather than forking an existing one.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const SERIF = CLAUDE_FONT.serif;
export const SANS = CLAUDE_FONT.ui;
export const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
export const STAGE = '#F2F0E9'; // the cream illustration ground (one step off PAGE)

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const remap = (x: number, x0: number, x1: number, y0: number, y1: number) => {
  const t = clamp((x - x0) / (x1 - x0 || 1), 0, 1);
  return y0 + (y1 - y0) * t;
};
export const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

/** The single clock. p ∈ [0,1] across the beat. Never read frame directly in an illustration. */
export const useP = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);
};

/** SPARK-LINE LAW: spark + one short serif line. Top by default; bottom when the
 *  illustration owns the top of the frame. Keep the text ≤4 words. */
export const SparkLine: React.FC<{ text: string; pos?: 'top' | 'bottom' }> = ({ text, pos = 'top' }) => {
  const p = useP();
  const o = remap(p, 0, 0.06, 0, 1);
  return (
    <div style={{ position: 'absolute', ...(pos === 'top' ? { top: 44 } : { bottom: 40 }), left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: o }}>
      <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{text}</div>
    </div>
  );
};

/** Stage wrapper: cream ground + spark line + centered illustration. */
export const IlluStage: React.FC<{ spark: string; sparkPos?: 'top' | 'bottom'; children: React.ReactNode }> = ({ spark, sparkPos, children }) => (
  <AbsoluteFill style={{ background: STAGE }}>
    {children}
    <SparkLine text={spark} pos={sparkPos} />
  </AbsoluteFill>
);
