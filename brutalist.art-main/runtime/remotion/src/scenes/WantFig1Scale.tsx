import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WantFig1Scale — Figure 1: The Scale
 * Source: Anthropic, "What 81,000 People Want from AI" (2026)
 *
 * Animated dot field forming a loose globe silhouette.
 * Counters tick up: 80,508 · 159 countries · 70 languages.
 * ONE terracotta moment: globe outline pulses in terracotta.
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const wantFig1ScaleSchema = z.object({
  sparkLine: z.string().default('Largest qualitative study ever.'),
});
export type WantFig1ScaleProps = z.infer<typeof wantFig1ScaleSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const TOTAL_DOTS = 400;
const DOT_RESPONDENTS = 4;

// Build a deterministic dot grid hinting at a globe silhouette
function buildDots(count: number, cx: number, cy: number, rx: number, ry: number) {
  const dots: { x: number; y: number }[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    // squish x slightly to hint at 3D globe curvature
    const x = cx + r * rx * Math.cos(angle) * (0.75 + 0.25 * Math.abs(Math.cos(angle)));
    const y = cy + r * ry * Math.sin(angle);
    dots.push({ x, y });
  }
  return dots;
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

export const WantFig1Scale: React.FC<WantFig1ScaleProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const dotsIn = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 60, mass: 1.2 } });
  const counter1In = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 90, mass: 0.9 } });
  const counter2In = spring({ frame: frame - 35, fps, config: { damping: 28, stiffness: 90, mass: 0.9 } });
  const counter3In = spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 90, mass: 0.9 } });
  const globePulse = spring({ frame: frame - 40, fps, config: { damping: 18, stiffness: 60, mass: 1.5 } });
  const noteIn = spring({ frame: frame - 65, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 85, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const dotAreaCX = width * 0.32;
  const dotAreaCY = height * 0.52;
  const dotAreaRX = width * 0.22;
  const dotAreaRY = height * 0.30;

  const dots = buildDots(TOTAL_DOTS, dotAreaCX, dotAreaCY, dotAreaRX, dotAreaRY);
  const visibleDots = Math.round(TOTAL_DOTS * clamp(dotsIn, 0, 1));

  const STATS = [
    { value: 80508, label: 'people surveyed', prog: counter1In },
    { value: 159, label: 'countries', prog: counter2In },
    { value: 70, label: 'languages', prog: counter3In },
  ];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        THE SCALE · QUALITATIVE STUDY
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.06,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
        maxWidth: width * 0.5,
        lineHeight: 1.2,
      }}>
        80,508 people. 159 countries. 70 languages.
      </div>

      {/* Dot field SVG */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width, height }}
        viewBox={`0 0 ${width} ${height}`}>

        {/* Globe silhouette outline — ONE terracotta accent */}
        <ellipse
          cx={dotAreaCX} cy={dotAreaCY}
          rx={dotAreaRX * clamp(globePulse, 0, 1)}
          ry={dotAreaRY * clamp(globePulse, 0, 1)}
          fill="none"
          stroke={CLAUDE.SPARK}
          strokeWidth={1.8}
          opacity={clamp(globePulse, 0, 1) * 0.5}
          strokeDasharray="6 4"
        />

        {/* Equator ghost line */}
        <ellipse
          cx={dotAreaCX} cy={dotAreaCY}
          rx={dotAreaRX * clamp(globePulse, 0, 1)}
          ry={dotAreaRY * 0.18 * clamp(globePulse, 0, 1)}
          fill="none"
          stroke={CLAUDE.BORDER}
          strokeWidth={0.8}
          opacity={clamp(globePulse, 0, 1) * 0.5}
        />

        {/* Dots */}
        {dots.slice(0, visibleDots).map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={2.8}
            fill={CLAUDE.INK_SOFT}
            opacity={0.55}
          />
        ))}
      </svg>

      {/* Stats column — right side */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        top: height * 0.28,
        display: 'flex',
        flexDirection: 'column',
        gap: height * 0.055,
        alignItems: 'flex-end',
      }}>
        {STATS.map((stat, i) => (
          <div key={i} style={{ textAlign: 'right', opacity: clamp(stat.prog, 0, 1) }}>
            <div style={{
              fontFamily: SERIF, fontWeight: 700,
              fontSize: height * 0.064,
              color: CLAUDE.INK,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              {Math.round(stat.value * easeOut(clamp(stat.prog, 0, 1))).toLocaleString()}
            </div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.017,
              color: CLAUDE.INK_SOFT, marginTop: 4,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Sub-note */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.19,
        fontFamily: SERIF,
        fontSize: height * 0.017,
        fontStyle: 'italic',
        color: CLAUDE.INK_SOFT,
        opacity: clamp(noteIn, 0, 1),
        maxWidth: width * 0.44,
        lineHeight: 1.5,
      }}>
        Each dot = {DOT_RESPONDENTS} respondents. Interviewed by Anthropic Interviewer — a version of Claude itself.
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.12,
        fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Data: Anthropic, What 81,000 People Want from AI (2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
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
