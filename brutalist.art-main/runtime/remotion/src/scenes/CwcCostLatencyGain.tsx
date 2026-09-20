import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcCostLatencyGain — Before/after cost and latency as animated bar charts
 * Two side-by-side bar charts: Latency (488s → ~100s) and Token cost (proportional)
 * Source: agent-decomposition/ — CWC Workshop 2026
 */

export const cwcCostLatencyGainSchema = z.object({
  sparkLine: z.string().default("Decompose once. Pay less every call."),
});
export type CwcCostLatencyGainProps = z.infer<typeof cwcCostLatencyGainSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const GREEN = '#4CAF50';

interface BarChartProps {
  title: string;
  beforeLabel: string;
  afterLabel: string;
  beforeH: number;
  afterH: number;
  gainLabel: string;
  x: number;
  y: number;
  w: number;
  maxH: number;
  frame: number;
  fps: number;
  delay: number;
  height: number;
}

const BarChart: React.FC<BarChartProps> = ({
  title, beforeLabel, afterLabel, beforeH, afterH, gainLabel,
  x, y, w, maxH, frame, fps, delay, height,
}) => {
  const SERIF = CLAUDE_FONT.serif;
  const SANS = CLAUDE_FONT.ui;
  const MONO = CLAUDE_FONT.mono;

  const titleIn = spring({ frame: frame - delay, fps, config: { damping: 28, stiffness: 110 } });
  const beforeBarIn = spring({ frame: frame - delay - 20, fps, config: { damping: 26, stiffness: 100 } });
  const afterBarIn = spring({ frame: frame - delay - 50, fps, config: { damping: 26, stiffness: 100 } });
  const gainIn = spring({ frame: frame - delay - 90, fps, config: { damping: 26, stiffness: 100 } });

  const BAR_W = w * 0.28;
  const CHART_H = maxH;
  const BEFORE_FINAL = CHART_H * beforeH;
  const AFTER_FINAL = CHART_H * afterH;

  const beforeAnimH = BEFORE_FINAL * clamp(beforeBarIn, 0, 1);
  const afterAnimH = AFTER_FINAL * clamp(afterBarIn, 0, 1);

  const GAP = w * 0.1;
  const beforeX = GAP;
  const afterX = beforeX + BAR_W + GAP;

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, opacity: clamp(titleIn, 0, 1) }}>
      {/* Chart title */}
      <div style={{ fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK, textTransform: 'uppercase' as const, marginBottom: 10, textAlign: 'center' as const }}>
        {title}
      </div>
      {/* Bars container */}
      <div style={{ position: 'relative', width: w, height: CHART_H + 40 }}>
        {/* Before bar */}
        <div style={{
          position: 'absolute',
          left: beforeX, bottom: 30,
          width: BAR_W, height: beforeAnimH,
          background: CLAUDE.SPARK,
          borderRadius: '4px 4px 0 0',
        }} />
        {/* Before label */}
        <div style={{
          position: 'absolute', left: beforeX, bottom: 0, width: BAR_W,
          textAlign: 'center' as const, fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.SPARK, fontWeight: 700,
        }}>
          {beforeLabel}
        </div>
        {/* Before value */}
        <div style={{
          position: 'absolute', left: beforeX, bottom: BEFORE_FINAL * clamp(beforeBarIn, 0, 1) + 34,
          width: BAR_W, textAlign: 'center' as const,
          fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.SPARK, fontWeight: 700,
          opacity: clamp(beforeBarIn, 0, 1),
        }}>
          {beforeLabel === 'BEFORE' ? '488s' : '102 calls'}
        </div>
        {/* After bar */}
        <div style={{
          position: 'absolute',
          left: afterX, bottom: 30,
          width: BAR_W, height: afterAnimH,
          background: GREEN,
          borderRadius: '4px 4px 0 0',
        }} />
        {/* After label */}
        <div style={{
          position: 'absolute', left: afterX, bottom: 0, width: BAR_W,
          textAlign: 'center' as const, fontFamily: SANS, fontSize: height * 0.010, color: GREEN, fontWeight: 700,
        }}>
          {afterLabel}
        </div>
        {/* After value */}
        <div style={{
          position: 'absolute', left: afterX, bottom: AFTER_FINAL * clamp(afterBarIn, 0, 1) + 34,
          width: BAR_W, textAlign: 'center' as const,
          fontFamily: MONO, fontSize: height * 0.012, color: GREEN, fontWeight: 700,
          opacity: clamp(afterBarIn, 0, 1),
        }}>
          {beforeLabel === 'BEFORE' ? '~100s' : '3 scripts'}
        </div>
        {/* Gain label */}
        <div style={{
          position: 'absolute', right: 0, top: 0,
          fontFamily: SERIF, fontSize: height * 0.022, fontWeight: 700,
          color: GREEN, fontStyle: 'italic',
          opacity: clamp(gainIn, 0, 1),
        }}>
          {gainLabel}
        </div>
      </div>
    </div>
  );
};

export const CwcCostLatencyGain: React.FC<CwcCostLatencyGainProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 250, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const CHART_W = width * 0.38;
  const CHART_H = height * 0.42;
  const CHART_Y = height * 0.24;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        BEFORE / AFTER · COST AND LATENCY
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        Decomposition: 5× faster, proportional token savings
      </div>

      {/* Latency chart */}
      <BarChart
        title="Latency"
        beforeLabel="BEFORE"
        afterLabel="AFTER"
        beforeH={0.90}
        afterH={0.20}
        gainLabel="5× faster"
        x={PAD_X}
        y={CHART_Y}
        w={CHART_W}
        maxH={CHART_H}
        frame={frame}
        fps={fps}
        delay={20}
        height={height}
      />

      {/* Token cost chart */}
      <BarChart
        title="Tool Calls"
        beforeLabel="BEFORE"
        afterLabel="AFTER"
        beforeH={0.90}
        afterH={0.10}
        gainLabel="proportional reduction"
        x={width * 0.54}
        y={CHART_Y}
        w={CHART_W}
        maxH={CHART_H}
        frame={frame}
        fps={fps}
        delay={50}
        height={height}
      />

      {/* Divider */}
      <div style={{
        position: 'absolute', left: width * 0.5 - 1, top: CHART_Y - 10,
        width: 2, height: CHART_H + 60, background: CLAUDE.BORDER,
        opacity: clamp(headerIn, 0, 1),
      }} />

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
