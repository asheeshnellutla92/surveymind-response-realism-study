/**
 * BearBrownLogoRemotionShowcase16x9 — every Remotion move, one logo. (16:9 landscape)
 *
 * claude-liam channel · @NikBearBrown · Kokoro am_onyx · Teardown register
 * Subject: the Bear Brown full logo mark
 *   viewBox 0 0 7500 5000 (3:2 ratio, wide mark)
 *   Single complex <path> — all paths, no live text
 *   Logo ink: #000000/#171717 on cream #FAF9F5
 * Palette: CLAUDE fidelity (cream PAGE, warm INK, terracotta SPARK one-per-beat)
 * Format: 1920×1080 landscape (16:9), 30 fps
 *
 * Beat catalog:
 * B00  ClaudeComposerAsk cold open (Liam intro)
 * B01  Spring Entrance
 * B02  Overshoot Spring — squash-and-stretch on landing
 * B03  Draw-On Stroke — evolvePath() trace then fill
 * B04  Mask Reveal — clip-path wipe, then radial iris
 * B05  Scale Zoom — linear vs bezier contrast
 * B06  Rotation
 * B07  Skew And Shear
 * B08  Opacity Through Blur
 * B09  Color Interpolation (treatment beat)
 * B10  Kinetic Grid — mark tiled across frame with staggered ripple
 * B11  Glitch Slices
 * B12  Trail Echo
 * B13  Noise Wobble
 * B14  Elastic Physics
 * B15  Card Flip — perspective rotateY
 * B16  Shadow Play
 * B17  Composer Summon — terracotta spark on send
 * B18  Stroke Pulse — stroke-dashoffset heartbeat rhythm
 * B19  Scale Breathe — subtle continuous scale oscillation
 * B20  Exit Family — shrink-spin, blur-out, mask-close
 * B21  Handoff (Your turn.)
 * B22  ClaudeTitleOutro
 */

import React from 'react';
import {
  AbsoluteFill, Audio, Sequence, staticFile,
  useCurrentFrame, useVideoConfig,
  spring, interpolate, interpolateColors,
} from 'remotion';
import { evolvePath } from '@remotion/paths';
import TIMING from './bear-brown-logo-remotion-showcase-16x9-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

// ── Brand constants ───────────────────────────────────────────────────────────
const SERIF  = CLAUDE_FONT.serif;
const SANS   = CLAUDE_FONT.ui;
const FOLDER = '@NikBearBrown';
const TOPIC  = 'DESIGN · MOTION';
const SEGMENT = 'Bear Brown Logo Techniques';

// ── Bear Brown logo path (from logos/bear-brown-logo-black.svg, viewBox 0 0 7500 5000) ──
// Single complex path — all paths, no live text. Filters dropped.
const LOGO_PATH = 'M4638.91,1435c68.96,8.61,151.71,31.02,193.08,51.71,55.17,25.86,89.65,60.34,115.51,110.33,17.24,36.21,20.69,51.73,20.69,94.83,0,117.23-77.58,213.77-277.56,344.79-106.89,68.96-262.04,151.7-425.82,225.84-74.13,34.49-137.92,65.5-143.09,68.96-3.45,3.45,31.03,6.9,86.2,6.9,144.81,0,218.95,12.07,265.49,44.82l25.86,17.23,56.89-15.52c55.17-13.79,58.61-15.5,86.2-51.71,15.52-20.69,32.76-36.2,37.93-36.2,12.07,0,31.03,32.75,31.03,51.71,0,6.89-12.07,31.03-27.58,53.44-13.79,24.15-25.86,43.1-24.14,44.82,5.17,5.18,68.96-44.82,113.78-91.38,48.27-48.26,62.06-49.99,62.06-8.61,0,13.79,9.77,18.97,29.31,15.52,29.31-5.18,46.55-12.07,108.61-46.55l29.31-15.52,13.79,15.52c6.9,8.63,12.07,22.42,12.07,31.03,0,12.07,3.45,12.07,25.86,8.61,13.79-3.44,51.72-13.79,86.2-25.86,34.48-10.34,65.51-18.95,68.96-18.95,12.07,0,13.79,32.75,1.72,55.16-5.17,12.07-8.62,22.41-6.9,24.13,1.72,1.73,22.41-12.07,46.55-31.03,24.14-18.95,48.27-31.03,51.72-29.31,15.52,10.35,13.79,31.03-1.72,75.86-8.62,27.58-17.24,58.62-17.24,72.41-3.45,18.97,0,22.41,15.52,24.13,25.86,3.45,51.72-12.07,89.65-51.71,55.17-55.16,110.33-151.72,94.82-162.06-10.34-5.16,0-25.86,15.52-25.86,29.31,0,22.41,56.89-17.24,134.47-20.69,43.1-105.16,134.46-137.92,151.7-27.58,15.52-51.72,12.07-74.13-10.34-17.24-17.24-20.69-25.86-20.69-58.62,0-20.69,3.45-44.82,6.9-55.16,12.07-29.31-1.72-20.69-56.89,31.03-27.58,25.86-56.89,48.26-62.06,48.26-12.07,0-29.31-22.41-36.2-49.99-3.45-12.08,1.72-29.31,13.79-53.45,10.34-20.68,17.24-37.92,17.24-37.92-1.72-1.73-20.69,3.45-41.38,12.07-36.2,13.79-37.93,15.52-34.48,37.94,3.45,43.1-51.72,99.99-110.33,113.78-37.93,8.61-82.75-51.73-72.41-99.99,2.3-13.79-3.45-18.97-17.24-15.52-13.79,1.73-25.86,0-41.37-8.63-22.41-13.79-12.07-22.41-134.47,96.55-39.65,36.2-75.85,67.23-81.03,67.23-15.52,0-32.76-25.86-36.2-53.44-3.45-18.97,1.72-37.94,13.79-67.24l18.96-39.65-27.58,3.45c-55.17,8.61-63.79,15.52-63.79,46.55,0,60.33-41.38,113.78-139.64,179.29-168.95,112.06-487.88,241.35-601.67,241.35-50,0-75.86-20.68-75.86-62.05,0-24.15,5.17-32.76,34.48-63.79,96.54-96.54,298.25-198.25,568.91-286.18,153.43-48.28,155.16-51.71,34.48-65.52-79.3-8.61-239.63-3.44-362.03,10.35-41.38,5.16-79.3,8.61-82.75,6.89-22.41-8.61-31.03-68.96-12.07-86.2,6.9-5.16,72.41-32.75,146.54-60.34,172.4-63.78,289.63-115.49,455.13-201.69,198.26-101.72,299.97-167.23,382.72-246.53,70.68-67.24,94.82-132.75,67.23-177.57-27.58-44.82-98.27-82.75-191.36-106.89-56.89-13.79-77.58-15.5-244.8-15.5-193.08,0-268.94,6.89-462.02,41.37-480.99,87.92-989.56,318.92-1093,496.5-17.24,29.31-17.24,31.03-6.9,43.1,6.9,6.9,49.99,32.76,94.82,56.89,86.2,43.1,115.51,63.79,115.51,79.31,0,17.23-131.02-13.79-194.81-46.55-51.72-27.58-89.65-106.89-74.13-162.06,32.76-124.12,282.73-284.45,656.83-420.65,362.03-132.74,849.92-206.87,1118.86-174.11h0l-.02.02ZM4971.64,2422.83c-29.31,29.31-32.76,36.2-22.41,37.92,34.48,6.9,96.54-43.1,79.3-65.5-12.07-15.52-20.69-12.07-56.89,27.58h0ZM4369.98,2469.38c-208.6,70.68-422.37,168.95-537.88,246.52-60.34,39.66-113.78,86.2-113.78,98.28,0,41.37,389.62-103.44,577.53-215.5,72.41-43.1,174.12-129.3,174.12-148.27,0-13.79-12.07-12.07-99.99,18.97h0ZM2535.67,1583.25c160.33,15.52,256.87,60.34,284.46,131.02,17.24,46.55,10.34,120.68-17.24,175.85-70.68,146.54-303.42,325.83-717.17,553.39-46.55,25.87-84.47,48.28-84.47,50,0,3.45,20.69,1.73,43.1-1.73,67.23-6.9,148.26-3.45,187.91,6.9,29.31,8.61,43.1,18.95,63.79,43.1l25.86,29.29,51.72-13.79c60.34-15.5,56.89-13.79,106.89-53.44,41.38-31.03,81.03-48.26,101.71-43.1,15.52,3.45,27.58,36.21,22.41,60.34-6.9,24.13-79.3,101.72-129.3,137.91-56.89,39.66-53.44,46.55,13.79,22.42,58.61-22.42,131.02-67.24,151.71-94.83,27.58-34.47,56.89-62.05,86.2-77.57,44.82-22.42,55.17-17.24,70.68,31.03,3.45,12.07,8.62,8.61,43.1-18.97,34.48-31.03,37.93-32.76,48.27-22.41,10.34,10.34,10.34,13.79-8.62,53.44-10.34,22.41-17.24,43.1-15.52,44.82,13.79,13.79,156.88-75.86,167.23-103.44,6.9-17.24,46.55-39.65,56.89-31.03,15.52,13.79,10.34,41.37-15.52,82.75-36.2,58.62-31.03,67.24,17.24,34.49,22.41-17.24,70.68-55.16,106.89-87.92,37.93-32.76,67.23-53.44,70.68-50,1.72,3.45,1.72,17.24,0,31.03-3.45,16.1,3.45,24.15,20.69,24.15,13.79,0,46.55-5.18,70.68-10.35,39.65-8.61,46.55-8.61,55.17,0,17.24,17.24,0,32.76-55.17,48.28-75.85,22.41-93.09,22.41-110.33-6.9-8.62-13.79-17.24-24.13-20.69-24.13s-43.1,34.49-87.92,77.58c-46.55,44.82-93.09,84.47-105.16,91.36-20.69,10.35-22.41,10.35-36.2-3.44-12.07-12.08-15.52-22.42-15.52-55.18l1.72-41.37-25.86,20.69c-37.93,29.31-70.68,48.28-86.2,48.28-18.96,0-37.93-24.15-37.93-46.55,0-8.63-1.72-15.52-3.45-15.52-3.45,0-29.31,18.97-58.62,41.37-55.17,43.1-105.16,68.96-120.68,63.79-3.45-1.73-12.07-12.08-17.24-22.42-5.17-8.61-10.34-18.97-10.34-20.68-1.72-1.73-24.14,12.07-48.27,31.02-63.79,44.82-110.33,65.52-146.54,65.52-27.58,0-34.48-3.45-60.34-31.03-17.24-15.52-31.03-34.49-31.03-41.37s10.34-17.24,20.69-24.13c20.69-10.35,34.48-37.94,25.86-46.55-3.45-1.73-17.24,1.73-32.76,8.61-24.14,10.34-27.58,15.52-27.58,34.49,0,84.47-103.44,215.5-262.04,329.28-82.75,58.62-287.9,162.06-396.51,196.53-146.54,50-199.98,44.82-231.01-15.52-18.96-41.37-15.52-58.62,32.76-108.6,72.41-75.86,263.77-193.09,486.16-301.7,148.26-72.41,312.04-144.81,322.38-144.81,15.52,0,5.17-22.42-15.52-32.76-34.48-18.95-186.19-17.24-281.01,3.45-103.44,24.13-215.5,58.62-293.07,91.38l-67.24,29.31-12.07-15.52c-6.9-6.9-13.79-27.58-17.24-43.1-5.17-27.58-3.45-31.03,22.41-51.73,31.03-27.58,177.57-106.88,408.58-222.39,324.11-165.51,546.5-313.76,686.14-462.03,46.55-50,84.47-115.51,77.58-134.47-6.9-17.24-49.99-44.82-91.37-60.34-67.23-22.41-149.99-32.75-275.84-32.75-546.5,0-1315.39,243.08-1806.72,572.36-215.5,143.09-367.21,303.42-413.75,434.44-15.52,44.82-13.79,115.51,3.45,149.98,43.1,82.75,163.78,136.2,362.04,156.88,72.41,6.9,99.99,12.07,105.16,20.69,5.17,6.89,6.9,13.79,5.17,17.24-6.9,10.34-167.23,6.89-237.91-3.45-125.85-20.69-227.57-89.65-275.84-187.91-31.03-62.07-36.2-136.2-13.79-201.71,31.03-93.1,136.19-220.67,268.94-327.55,137.92-108.62,368.93-249.98,562.01-343.07,503.4-239.64,1187.82-399.96,1558.47-367.21h.01ZM2525.33,2524.54c-34.48,22.41-82.75,70.68-82.75,82.75,0,10.34,101.71-62.07,118.95-84.47,17.24-25.86,5.17-25.86-36.2,1.73h0ZM2713.24,2596.95c-18.96,18.95-27.58,31.03-20.69,31.03,15.52,0,74.13-39.66,74.13-51.73,0-18.97-20.69-12.07-53.44,20.69h0ZM2165.02,2683.15c-272.39,117.23-543.05,277.55-639.59,375.83l-37.93,39.65,31.03-5.18c67.23-10.34,260.32-81.02,375.83-137.91,184.47-91.38,287.9-167.23,358.59-260.32,27.58-36.21,39.65-60.34,27.58-60.34-1.72,0-53.44,20.69-115.51,48.28h0ZM6754.23,1800.47c312.04,20.69,546.5,82.75,596.49,158.61,32.76,46.55,17.24,108.62-43.1,165.51-60.34,56.89-167.23,118.94-324.11,186.19-305.14,131.01-587.87,212.05-855.09,244.8-108.61,12.07-168.95,10.34-222.39-10.35-77.58-29.31-110.33-72.41-117.23-153.43l-5.17-46.55-62.06,44.82c-34.48,24.13-79.3,58.62-101.71,75.86-29.31,22.41-46.55,31.03-58.62,29.31-22.41-3.45-49.99-41.37-49.99-70.68,0-27.58,27.58-82.76,58.62-117.23,24.14-25.86,25.86-25.86,37.93-13.79,8.62,6.89,15.52,22.41,18.96,34.47,3.45,17.24,0,27.58-22.41,55.18-12.07,17.23-22.41,34.47-20.69,36.2,5.17,3.45,50-22.41,148.26-86.2,98.27-65.5,99.99-63.79,93.09,34.49-3.45,65.5-3.45,68.96,12.07,84.47,36.2,39.65,84.47,51.71,201.7,51.71,217.22,0,532.71-81.02,934.39-237.9,224.12-87.92,379.27-193.09,379.27-255.16,0-20.68-43.1-60.33-91.37-82.75-198.26-94.81-630.97-118.94-1139.55-65.5-308.59,32.76-649.94,101.72-760.27,153.43-24.14,10.34-27.58,15.52-20.69,22.42,10.34,12.07-1.72,27.58-27.58,34.47-20.69,5.18-36.2-10.34-36.2-39.65,0-43.1,105.16-103.44,236.18-136.2,241.36-60.33,946.46-115.51,1241.26-96.54h.01ZM4021.73,1915.98c10.34,20.69,10.34,24.13-29.31,81.02-87.92,129.3-253.42,444.78-344.79,663.73-67.23,156.88-70.68,170.67-60.34,191.37,12.07,20.68,5.17,46.55-22.41,77.58-22.41,24.13-24.14,24.13-44.82,15.5-44.82-18.95-51.72-48.26-27.58-118.94,13.79-41.37,148.26-317.21,203.43-418.93,170.67-312.03,287.9-503.4,310.31-503.4,5.17,0,12.07,5.18,15.52,12.07h0ZM1820.22,2098.71c1.72,12.08-1.72,24.15-13.79,39.66-34.48,46.54-155.16,239.63-215.5,344.79-82.75,144.81-177.57,332.71-231.01,462.01-39.65,91.38-151.71,384.46-151.71,396.52,0,1.73,6.9,1.73,17.24-1.73,37.93-8.61,41.38,55.16,3.45,82.75-12.64,9.19-26.43,9.19-41.38,0-32.76-18.95-55.17-53.44-55.17-86.2,0-60.34,165.5-424.09,327.55-717.17,99.99-182.74,270.66-458.58,318.94-515.47,20.69-25.86,34.48-27.58,41.38-5.18h0v.02ZM6130.15,2745.2c13.79,13.79,10.34,24.15-8.62,39.66-18.96,15.52-81.03,20.68-89.65,8.61-5.17-8.61,8.62-32.76,22.41-41.37,24.14-12.07,67.23-15.52,75.86-6.9h0ZM5740.53,2769.35c10.34,10.34,5.17,34.47-8.62,48.26-10.34,10.35-27.58,12.07-101.71,13.79-48.27,1.73-127.57,5.18-177.57,10.35-48.27,3.44-179.29,12.07-289.63,20.68-829.23,56.89-1467.1,141.36-2120.49,279.29-491.33,103.44-984.39,253.42-1239.54,379.27-58.62,27.58-108.61,51.73-112.06,51.73-12.07,0-27.58-41.37-27.58-72.41v-32.76l43.1-18.97c48.27-22.41,208.6-74.12,374.1-120.67,446.51-127.57,1405.04-322.39,1910.16-386.17,134.47-17.24,417.2-48.28,972.32-103.44,170.67-17.24,384.45-39.65,475.82-50,182.74-20.68,294.8-27.58,301.7-18.95h0Z';

const LOGO_W = 7500;
const LOGO_H = 5000;

// ── Shared helpers ────────────────────────────────────────────────────────────
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// The mark as a centered SVG component
// The 3:2 mark fits naturally in 16:9 — we render it at ~55% of canvas width
interface MarkProps {
  fill?: string;
  opacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  showStroke?: boolean;
  svgStyle?: React.CSSProperties;
  pathLength?: number;  // for stroke-dasharray tricks
  dashOffset?: number;
  scale?: number;       // additional scale factor (applied to SVG dimensions)
}

// Rendered width: 55% of 1920px = 1056px; height = 1056 * (5000/7500) = 704px
const RENDER_W = 1056;
const RENDER_H = 704;

const LogoMark: React.FC<MarkProps> = ({
  fill = '#000000',
  opacity = 1,
  strokeColor = CLAUDE.SPARK,
  strokeWidth = 0,
  showStroke = false,
  svgStyle = {},
  dashOffset,
  scale = 1,
}) => {
  const w = RENDER_W * scale;
  const h = RENDER_H * scale;
  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
      style={{ display: 'block', overflow: 'visible', ...svgStyle }}
    >
      <path
        d={LOGO_PATH}
        fill={showStroke ? 'none' : fill}
        opacity={opacity}
        stroke={showStroke ? strokeColor : 'none'}
        strokeWidth={showStroke ? strokeWidth : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...(dashOffset !== undefined ? {
          strokeDasharray: LOGO_W * 6,
          strokeDashoffset: dashOffset,
        } : {})}
      />
    </svg>
  );
};

// Draw-On stroke using @remotion/paths evolvePath
const DrawOnMark: React.FC<{ progress: number; fill: string; strokeColor?: string }> = ({
  progress, fill, strokeColor = CLAUDE.SPARK,
}) => {
  const clampedP = clamp(progress, 0, 1);
  // stroke trace phase: 0 → 0.55; fill flood phase: 0.55 → 1
  const strokeP = clamp(clampedP / 0.55, 0, 1);
  const fillOpacity = clamp((clampedP - 0.55) / 0.45, 0, 1);
  const { strokeDasharray, strokeDashoffset } = evolvePath(strokeP, LOGO_PATH);
  const strokeFadeOut = strokeP >= 1 ? clamp(1 - (clampedP - 0.55) / 0.2, 0, 1) : 1;
  return (
    <svg width={RENDER_W} height={RENDER_H} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
      style={{ display: 'block', overflow: 'visible' }}>
      <path d={LOGO_PATH} fill={fill} opacity={fillOpacity} />
      <path d={LOGO_PATH} fill="none"
        stroke={strokeColor} strokeWidth={24}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        opacity={strokeFadeOut}
      />
    </svg>
  );
};

// ── Technique beat wrapper ────────────────────────────────────────────────────
interface TechniqueBeatProps {
  label: string;
  sparkLine: string;
  children: React.ReactNode;
}
const TechniqueBeat: React.FC<TechniqueBeatProps> = ({ label, sparkLine, children }) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Segment label */}
      <div style={{
        position: 'absolute', top: '6%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(labelIn, 0, 1),
        transform: `translateY(${(1 - labelIn) * 8}px)`,
      }}>
        <div style={{
          fontFamily: SERIF, fontSize: 44, fontWeight: 600,
          color: CLAUDE.INK, letterSpacing: '-0.01em', textAlign: 'center',
        }}>{label}</div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
      </div>

      {/* Mark stage — centered, uses middle 64% of 16:9 canvas */}
      <div style={{
        position: 'absolute',
        top: '18%', bottom: '18%',
        left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>

      {/* Spark line — bottom */}
      <div style={{
        position: 'absolute', bottom: '6%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF, fontSize: 28, fontStyle: 'italic',
          color: CLAUDE.INK, letterSpacing: '-0.01em',
        }}>{sparkLine}</span>
      </div>
    </AbsoluteFill>
  );
};

// ── B01 Spring Entrance ───────────────────────────────────────────────────────
const SpringEntrance: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const s = spring({ frame, fps, config: { damping: 24, stiffness: 100, mass: 1 } });
  return (
    <TechniqueBeat label="Spring Entrance" sparkLine="Weight, not a click.">
      <div style={{ transform: `scale(${s})`, opacity: clamp(s, 0, 1) }}>
        <LogoMark />
      </div>
    </TechniqueBeat>
  );
};

// ── B02 Overshoot Spring ──────────────────────────────────────────────────────
const OvershootSpring: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const s = spring({ frame, fps, config: { damping: 7, stiffness: 240, mass: 0.6 } });
  const entryFrames = 18;
  const squashPhase = Math.max(0, Math.sin(Math.PI * clamp(frame / entryFrames, 0, 1)));
  const scaleX = clamp(s, 0, 2) + squashPhase * 0.26;
  const scaleY = clamp(s, 0, 2) - squashPhase * 0.20;
  return (
    <TechniqueBeat label="Overshoot Spring" sparkLine="Compresses on landing.">
      <div style={{
        transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
        transformOrigin: 'bottom center',
        opacity: clamp(s * 2, 0, 1),
      }}>
        <LogoMark />
      </div>
    </TechniqueBeat>
  );
};

// ── B03 Draw-On Stroke ────────────────────────────────────────────────────────
const DrawOnStroke: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = clamp(frame / (durationInFrames * 0.88), 0, 1);
  return (
    <TechniqueBeat label="Draw-On Stroke" sparkLine="Pen, or loading bar?">
      <DrawOnMark progress={progress} fill="#000000" strokeColor={CLAUDE.SPARK} />
    </TechniqueBeat>
  );
};

// ── B04 Mask Reveal ───────────────────────────────────────────────────────────
const MaskReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const wipeP = clamp(frame / (durationInFrames * 0.48), 0, 1);
  const irisP = clamp((frame - durationInFrames * 0.5) / (durationInFrames * 0.42), 0, 1);
  const cx = LOGO_W / 2;
  const cy = LOGO_H / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy) * 1.15;
  const useRadial = wipeP >= 1;
  return (
    <TechniqueBeat label="Mask Reveal" sparkLine="Two reveals, one beat.">
      <svg width={RENDER_W} height={RENDER_H} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
        style={{ display: 'block' }}>
        <defs>
          <clipPath id="bb-wipe"><rect x={0} y={0} width={LOGO_W * wipeP} height={LOGO_H} /></clipPath>
          <clipPath id="bb-iris"><circle cx={cx} cy={cy} r={maxR * irisP} /></clipPath>
        </defs>
        <g clipPath={useRadial ? 'url(#bb-iris)' : 'url(#bb-wipe)'}>
          <path d={LOGO_PATH} fill="#000000" />
        </g>
      </svg>
    </TechniqueBeat>
  );
};

// ── B05 Scale Zoom ────────────────────────────────────────────────────────────
const ScaleZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const half = durationInFrames * 0.5;
  const isLinear = frame < half;
  const linearScale = isLinear
    ? interpolate(frame, [0, half], [7, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })
    : 1;
  const bezierScale = isLinear ? 7 : interpolate(frame, [half, durationInFrames * 0.9], [7, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
    easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  });
  const scale = isLinear ? linearScale : bezierScale;
  const accentFill = isLinear ? '#000000' : CLAUDE.SPARK;
  return (
    <TechniqueBeat label="Scale Zoom" sparkLine="Bezier earns it.">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <LogoMark fill={isLinear ? '#000000' : accentFill} />
      </div>
    </TechniqueBeat>
  );
};

// ── B06 Rotation ──────────────────────────────────────────────────────────────
const Rotation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entryFrames = fps * 1.2;
  const entranceS = spring({ frame, fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });
  const pivotAngle = interpolate(1 - entranceS, [0, 1], [0, -45]);
  const drift = frame > entryFrames
    ? interpolate(frame - entryFrames, [0, durationInFrames - entryFrames], [0, 180])
    : 0;
  return (
    <TechniqueBeat label="Rotation" sparkLine="Meditative or lazy?">
      <div style={{
        transform: `rotate(${pivotAngle + drift}deg)`,
        opacity: clamp(entranceS, 0, 1),
      }}>
        <LogoMark />
      </div>
    </TechniqueBeat>
  );
};

// ── B07 Skew And Shear ────────────────────────────────────────────────────────
const SkewAndShear: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const leanIn = spring({ frame, fps, config: { damping: 22, stiffness: 140, mass: 0.9 } });
  const holdUntil = durationInFrames * 0.6;
  const releaseP = clamp((frame - holdUntil) / (durationInFrames * 0.32), 0, 1);
  const skewAngle = interpolate(leanIn, [0, 1], [0, 16]) * (1 - releaseP);
  return (
    <TechniqueBeat label="Skew And Shear" sparkLine="Tension, then neutral.">
      <div style={{ transform: `skewX(${skewAngle}deg)`, opacity: clamp(leanIn, 0, 1) }}>
        <LogoMark />
      </div>
    </TechniqueBeat>
  );
};

// ── B08 Opacity Through Blur ──────────────────────────────────────────────────
const OpacityThroughBlur: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const s = spring({ frame, fps, config: { damping: 26, stiffness: 90, mass: 1.2 } });
  const opacity = clamp(s, 0, 1);
  const blur = interpolate(s, [0, 1], [18, 0]);
  return (
    <TechniqueBeat label="Opacity Through Blur" sparkLine="Arrives out of focus.">
      <div style={{ opacity, filter: `blur(${blur}px)` }}>
        <LogoMark />
      </div>
    </TechniqueBeat>
  );
};

// ── B09 Color Interpolation (treatment beat) ─────────────────────────────────
const ColorInterpolation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const t = frame / durationInFrames;
  const fillColor = t < 0.5
    ? interpolateColors(t * 2, [0, 1], ['#000000', CLAUDE.SPARK])
    : interpolateColors((t - 0.5) * 2, [0, 1], [CLAUDE.SPARK, '#000000']);
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '6%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(labelIn, 0, 1), transform: `translateY(${(1 - labelIn) * 8}px)`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 600, color: CLAUDE.INK, textAlign: 'center' }}>
          Color Interpolation
        </div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
        <div style={{
          fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginTop: 8,
        }}>Color Treatment Beat</div>
      </div>
      <div style={{
        position: 'absolute', top: '18%', bottom: '18%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LogoMark fill={fillColor} />
      </div>
      <div style={{
        position: 'absolute', bottom: '6%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 28, fontStyle: 'italic', color: CLAUDE.INK }}>
          Signal, or noise?
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── B10 Kinetic Grid ──────────────────────────────────────────────────────────
const KineticGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const { width: canvasW, height: canvasH } = useVideoConfig();
  const cols = 4;
  const rows = 3;
  const cellW = canvasW / cols;
  const cellH = canvasH / rows;
  // Fit the 3:2 mark into each cell
  const tileScale = Math.min(cellW * 0.80, cellH * 0.80 * (LOGO_W / LOGO_H));
  const tileH = tileScale * (LOGO_H / LOGO_W);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const delay = (row * cols + col) * 4;
          const s = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 130, mass: 0.9 } });
          const rippleY = Math.sin((frame - delay) / 9) * 4;
          return (
            <div key={`${row}-${col}`} style={{
              position: 'absolute',
              left: col * cellW + cellW / 2,
              top: row * cellH + cellH / 2,
              transform: `translate(-50%, -50%) scale(${clamp(s, 0, 1)}) translateY(${rippleY}px)`,
              opacity: clamp(s * 1.2, 0, 1),
            }}>
              <LogoMark scale={tileScale / RENDER_W} />
            </div>
          );
        })
      )}
      <div style={{
        position: 'absolute', top: '3%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          fontFamily: SERIF, fontSize: 40, fontWeight: 600, color: CLAUDE.INK, textAlign: 'center',
          background: CLAUDE.PAGE, padding: '4px 20px', borderRadius: 4, opacity: 0.92,
        }}>Kinetic Grid</div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
      </div>
      <div style={{
        position: 'absolute', bottom: '3%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } }), 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF, fontSize: 26, fontStyle: 'italic', color: CLAUDE.INK,
          background: CLAUDE.PAGE, padding: '2px 12px', borderRadius: 3,
        }}>Grid becomes rhythm.</span>
      </div>
    </AbsoluteFill>
  );
};

// ── B11 Glitch Slices ─────────────────────────────────────────────────────────
const GlitchSlices: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const GLITCH_START = 18;
  const GLITCH_END = GLITCH_START + 10;
  const isGlitching = frame >= GLITCH_START && frame < GLITCH_END;
  const seed = frame * 1337;
  const pseudo = (n: number) => ((seed * (n + 1) * 2654435761) & 0xffffffff) / 0xffffffff;
  const entryS = spring({ frame, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } });
  const slices = 7;

  return (
    <TechniqueBeat label="Glitch Slices" sparkLine="Aggressive, then gone.">
      <div style={{ opacity: clamp(entryS, 0, 1) }}>
        {isGlitching ? (
          <svg width={RENDER_W} height={RENDER_H} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
            style={{ display: 'block', overflow: 'visible' }}>
            {Array.from({ length: slices }, (_, i) => {
              const offsetX = (pseudo(i * 3 + frame) - 0.5) * 350;
              const clipY = (i / slices) * LOGO_H;
              const clipH = LOGO_H / slices;
              const hueShift = pseudo(i + frame * 2) > 0.78 ? CLAUDE.SPARK : '#000000';
              return (
                <g key={i} style={{ transform: `translateX(${offsetX}px)` }}>
                  <clipPath id={`bb-slice-${i}`}>
                    <rect x={0} y={clipY} width={LOGO_W} height={clipH} />
                  </clipPath>
                  <g clipPath={`url(#bb-slice-${i})`}>
                    <path d={LOGO_PATH} fill={hueShift} />
                  </g>
                </g>
              );
            })}
          </svg>
        ) : (
          <LogoMark />
        )}
      </div>
    </TechniqueBeat>
  );
};

// ── B12 Trail Echo ────────────────────────────────────────────────────────────
const TrailEcho: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const TRAVEL = 480;
  const ease = (t: number) => t * t * (3 - 2 * t);
  const slideP = interpolate(frame, [0, durationInFrames * 0.72], [0, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp', easing: ease,
  });
  const x = interpolate(slideP, [0, 1], [-TRAVEL / 2, TRAVEL / 2]);
  const trailCount = 5;
  const trailDelay = 5;

  return (
    <TechniqueBeat label="Trail Echo" sparkLine="Motion lingers.">
      <div style={{ position: 'relative', width: RENDER_W + TRAVEL, height: RENDER_H }}>
        {Array.from({ length: trailCount }, (_, i) => {
          const tf = Math.max(0, frame - (i + 1) * trailDelay);
          const tSlideP = interpolate(tf, [0, durationInFrames * 0.72], [0, 1], {
            extrapolateRight: 'clamp', extrapolateLeft: 'clamp', easing: ease,
          });
          const tx = interpolate(tSlideP, [0, 1], [-TRAVEL / 2, TRAVEL / 2]);
          return (
            <div key={i} style={{
              position: 'absolute', left: tx + TRAVEL / 2, top: 0,
              opacity: (1 - i / trailCount) * 0.22,
            }}>
              <LogoMark />
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: x + TRAVEL / 2, top: 0 }}>
          <LogoMark />
        </div>
      </div>
    </TechniqueBeat>
  );
};

// ── B13 Noise Wobble ──────────────────────────────────────────────────────────
const NoiseWobble: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entryS = spring({ frame, fps, config: { damping: 24, stiffness: 110, mass: 1 } });
  const amp = interpolate(frame, [0, durationInFrames * 0.88], [10, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });
  const wobbleX = Math.sin(frame * 0.43) * amp;
  const wobbleY = Math.sin(frame * 0.29 + 1.1) * amp * 0.55;
  const wobbleRot = Math.sin(frame * 0.21) * amp * 0.25;
  return (
    <TechniqueBeat label="Noise Wobble" sparkLine="Alive or anxious?">
      <div style={{
        transform: `translate(${wobbleX}px, ${wobbleY}px) rotate(${wobbleRot}deg)`,
        opacity: clamp(entryS, 0, 1),
      }}>
        <LogoMark />
      </div>
    </TechniqueBeat>
  );
};

// ── B14 Elastic Physics ───────────────────────────────────────────────────────
const ElasticPhysics: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const dropS = spring({ frame, fps, config: { damping: 10, stiffness: 180, mass: 1.2 } });
  const dropY = interpolate(clamp(dropS, 0, 2), [0, 1], [-300, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });
  const LAND = 12;
  const squashBurst = Math.max(0, Math.sin(Math.PI * clamp((frame - LAND) / 10, 0, 1)));
  const squashX = 1 + squashBurst * 0.26;
  const squashY = 1 - squashBurst * 0.20;
  return (
    <TechniqueBeat label="Elastic Physics" sparkLine="It hits the floor.">
      <div style={{
        transform: `translateY(${dropY}px) scaleX(${squashX}) scaleY(${squashY})`,
        transformOrigin: 'bottom center',
        opacity: clamp(dropS * 1.5, 0, 1),
      }}>
        <LogoMark />
      </div>
    </TechniqueBeat>
  );
};

// ── B15 Card Flip ─────────────────────────────────────────────────────────────
const CardFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const flipS = spring({ frame, fps, config: { damping: 22, stiffness: 140, mass: 0.9 } });
  const rotY = interpolate(flipS, [0, 1], [90, 0]);
  const holdUntil = durationInFrames * 0.5;
  const spin = frame > holdUntil
    ? interpolate(frame - holdUntil, [0, durationInFrames * 0.42], [0, 360], {
        extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
      })
    : 0;
  const totalRotY = rotY + spin;
  const showBack = totalRotY % 360 > 90 && totalRotY % 360 < 270;

  return (
    <TechniqueBeat label="Card Flip" sparkLine="Depth, or squash?">
      <div style={{
        width: RENDER_W + 80, height: RENDER_H + 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 1200,
      }}>
        <div style={{
          transform: `rotateY(${totalRotY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'none',
        }}>
          <div style={{
            background: CLAUDE.CARD,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 20,
            padding: 40,
            boxShadow: '0 8px 48px rgba(61,57,41,0.14)',
          }}>
            <LogoMark fill={showBack ? CLAUDE.SPARK : '#000000'} />
          </div>
        </div>
      </div>
    </TechniqueBeat>
  );
};

// ── B16 Shadow Play ───────────────────────────────────────────────────────────
const ShadowPlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entryS = spring({ frame, fps, config: { damping: 24, stiffness: 110, mass: 1 } });
  const SHADOW_PHASE = durationInFrames * 0.5;
  const shadowP = clamp(frame / SHADOW_PHASE, 0, 1);
  const snapP = clamp((frame - SHADOW_PHASE) / (durationInFrames * 0.38), 0, 1);
  const shadowOffX = interpolate(shadowP, [0, 1], [0, 70]) * (1 - snapP);
  const shadowOffY = interpolate(shadowP, [0, 1], [0, 50]) * (1 - snapP);
  const shadowOpacity = interpolate(shadowP, [0, 0.3, 1], [0, 0.32, 0.16]) * (1 - snapP * 0.5);

  return (
    <TechniqueBeat label="Shadow Play" sparkLine="Detached, then grounded.">
      <div style={{ position: 'relative', opacity: clamp(entryS, 0, 1) }}>
        <div style={{
          position: 'absolute', left: shadowOffX, top: shadowOffY, opacity: shadowOpacity,
        }}>
          <LogoMark fill="#000000" />
        </div>
        <LogoMark fill="#000000" />
      </div>
    </TechniqueBeat>
  );
};

// ── B17 Composer Summon ───────────────────────────────────────────────────────
const ComposerSummon: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const SEND_FRAME = Math.floor(durationInFrames * 0.40);
  const promptText = 'animate the Bear Brown logo — spring entrance, terracotta accent, cream stage';
  const typingP = clamp(frame / (SEND_FRAME * 0.82), 0, 1);
  const charsShown = Math.floor(typingP * promptText.length);

  const sparkBurst = interpolate(frame, [SEND_FRAME, SEND_FRAME + 8, SEND_FRAME + 20], [0, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const markArrivalS = spring({
    frame: Math.max(0, frame - SEND_FRAME - 10),
    fps, config: { damping: 20, stiffness: 160, mass: 0.8 },
  });

  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const UI = 22;
  const blinkOn = Math.floor(frame / 10) % 2 === 0;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Label */}
      <div style={{
        position: 'absolute', top: '5%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(labelIn, 0, 1),
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 600, color: CLAUDE.INK }}>
          Composer Summon
        </div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
      </div>

      {/* Composer card */}
      <div style={{
        position: 'absolute', top: '18%', left: '18%', right: '18%',
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: UI * 1.2,
        boxShadow: '0 6px 32px rgba(61,57,41,0.08)',
        padding: `${UI * 0.8}px ${UI * 1.0}px`,
        fontFamily: CLAUDE_FONT.ui,
      }}>
        <div style={{ minHeight: UI * 2.5, fontSize: UI, lineHeight: 1.45, color: CLAUDE.INK }}>
          {charsShown < promptText.length
            ? <>{promptText.slice(0, charsShown)}<span style={{ display: blinkOn ? 'inline-block' : 'none', width: 2, height: UI, background: CLAUDE.INK, verticalAlign: 'text-bottom', marginLeft: 1 }} /></>
            : promptText
          }
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: UI * 0.5 }}>
          <div style={{
            width: UI * 1.4, height: UI * 1.4, borderRadius: UI * 0.4,
            background: charsShown >= promptText.length ? CLAUDE.SEND : CLAUDE.GHOST,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={UI * 0.8} height={UI * 0.8} viewBox="0 0 24 24" fill="none">
              <path d="M12 20V5m0 0-6 6m6-6 6 6" stroke="#FFF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Spark burst on send */}
      {sparkBurst > 0.01 && (
        <div style={{
          position: 'absolute', top: '37%', right: '18%',
          width: 60, height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: sparkBurst, transform: `scale(${1 + sparkBurst * 0.9})`,
        }}>
        </div>
      )}

      {/* Mark arriving — lower half */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: clamp(markArrivalS, 0, 1),
        transform: `scale(${clamp(markArrivalS * 0.8, 0, 0.8)}) translateY(${(1 - markArrivalS) * 60}px)`,
      }}>
        <LogoMark fill="#000000" scale={0.72} />
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', bottom: '4%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(markArrivalS * 0.85, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 26, fontStyle: 'italic', color: CLAUDE.INK }}>
          The interface is the origin.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── B18 Stroke Pulse ──────────────────────────────────────────────────────────
const StrokePulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entryS = spring({ frame, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } });
  // Total path length approximation — used to drive dashoffset
  // We cycle strokeDashoffset back and forth for a heartbeat
  const CYCLE_FRAMES = fps * 1.2;
  const cycleP = (frame % CYCLE_FRAMES) / CYCLE_FRAMES;
  const TOTAL_PATH_LEN = 90000; // approximate for this complex path at 7500×5000
  // dasharray = half path, dashoffset cycles from 0 to pathLen
  const dashoffset = interpolate(cycleP, [0, 0.5, 1], [0, TOTAL_PATH_LEN / 2, 0]);

  return (
    <TechniqueBeat label="Stroke Pulse" sparkLine="A heartbeat in ink.">
      <div style={{ opacity: clamp(entryS, 0, 1) }}>
        <svg width={RENDER_W} height={RENDER_H} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
          style={{ display: 'block', overflow: 'visible' }}>
          {/* Base fill, slightly ghost */}
          <path d={LOGO_PATH} fill="#000000" opacity={0.12} />
          {/* Pulsing stroke */}
          <path d={LOGO_PATH} fill="none"
            stroke={CLAUDE.SPARK} strokeWidth={28}
            strokeDasharray={`${TOTAL_PATH_LEN / 2} ${TOTAL_PATH_LEN}`}
            strokeDashoffset={-dashoffset}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </TechniqueBeat>
  );
};

// ── B19 Scale Breathe ─────────────────────────────────────────────────────────
const ScaleBreathe: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const entryS = spring({ frame, fps, config: { damping: 26, stiffness: 100, mass: 1 } });
  // Subtle sinusoidal scale oscillation: ~0.5 Hz, ±3%
  const breathe = 1 + Math.sin(frame * (Math.PI * 2) / (fps * 2.0)) * 0.03;

  return (
    <TechniqueBeat label="Scale Breathe" sparkLine="Barely there.">
      <div style={{
        transform: `scale(${clamp(entryS, 0, 1) * breathe})`,
        transformOrigin: 'center center',
      }}>
        <LogoMark />
      </div>
    </TechniqueBeat>
  );
};

// ── B20 Exit Family ───────────────────────────────────────────────────────────
const ExitFamily: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const third = Math.floor(durationInFrames / 3);
  const exitIdx = Math.floor(frame / third);
  const localFrame = frame - exitIdx * third;
  const HOLD = third * 0.28;
  const ANIM_DUR = third - HOLD;
  const exitP = clamp((localFrame - HOLD) / ANIM_DUR, 0, 1);

  let markStyle: React.CSSProperties = {};
  let clipStyle: React.CSSProperties = {};

  if (exitIdx === 0) {
    // Shrink-spin
    const s = 1 - exitP;
    const rot = exitP * 360;
    markStyle = { transform: `scale(${s}) rotate(${rot}deg)`, opacity: Math.max(0, 1 - exitP * 1.4) };
  } else if (exitIdx === 1) {
    // Blur-out
    const blurV = exitP * 22;
    markStyle = { filter: `blur(${blurV}px)`, opacity: Math.max(0, 1 - exitP * 1.2) };
  } else {
    // Mask-close (iris)
    const irisR = (1 - exitP) * 220;
    clipStyle = {
      clipPath: `circle(${irisR}px at center)`,
      WebkitClipPath: `circle(${irisR}px at center)`,
    };
  }

  const exitNames = ['Shrink Spin', 'Blur Out', 'Mask Close'];
  const exitName = exitNames[Math.min(exitIdx, 2)] || 'Exit';

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '5%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 600, color: CLAUDE.INK }}>
          Exit Family
        </div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
        <div style={{
          fontFamily: SANS, fontSize: 18, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginTop: 8,
        }}>{exitName}</div>
      </div>

      <div style={{
        position: 'absolute', top: '18%', bottom: '18%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ ...clipStyle }}>
          <div style={{ ...markStyle }}>
            <LogoMark />
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div style={{
        position: 'absolute', bottom: '10%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 11, height: 11, borderRadius: 6,
            background: i <= exitIdx ? CLAUDE.SPARK : CLAUDE.BORDER,
          }} />
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: '4%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 26, fontStyle: 'italic', color: CLAUDE.INK }}>
          Exits are underrated.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── Timing (conforms to audio durations) ─────────────────────────────────────
const TIMED = TIMING.map((t) => ({ ...t }));
export const TOTAL_FRAMES = TIMED.reduce((a, b) => a + b.frames, 0);

// ── Main composition ──────────────────────────────────────────────────────────
export const BearBrownLogoRemotionShowcase16x9: React.FC = () => {
  let at = 0;

  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;

    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Halo, Liam',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Animate the Bear Brown logo every way Remotion knows. Show me which techniques deserve to live.',
            runningText: 'this is Liam, in for Bear…',
            folderLabel: FOLDER,
            output: [
              '20 techniques queued',
              'Kokoro am_onyx voice',
              'free pipeline only',
            ],
          })} />
        );
        break;

      case 'B01': content = <SpringEntrance />; break;
      case 'B02': content = <OvershootSpring />; break;
      case 'B03': content = <DrawOnStroke />; break;
      case 'B04': content = <MaskReveal />; break;
      case 'B05': content = <ScaleZoom />; break;
      case 'B06': content = <Rotation />; break;
      case 'B07': content = <SkewAndShear />; break;
      case 'B08': content = <OpacityThroughBlur />; break;
      case 'B09': content = <ColorInterpolation />; break;
      case 'B10': content = <KineticGrid />; break;
      case 'B11': content = <GlitchSlices />; break;
      case 'B12': content = <TrailEcho />; break;
      case 'B13': content = <NoiseWobble />; break;
      case 'B14': content = <ElasticPhysics />; break;
      case 'B15': content = <CardFlip />; break;
      case 'B16': content = <ShadowPlay />; break;
      case 'B17': content = <ComposerSummon />; break;
      case 'B18': content = <StrokePulse />; break;
      case 'B19': content = <ScaleBreathe />; break;
      case 'B20': content = <ExitFamily />; break;

      case 'B21':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Your turn.',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Take my logo SVG. Run it through spring entrance, draw-on stroke, and card flip. For each: show me a 6-second Remotion composition with the full motion, then mark it keep or kill.',
            runningText: 'paste this into Claude…',
            folderLabel: FOLDER,
          })} />
        );
        break;

      case 'B22':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: 'Bear Brown Logo, Every Remotion Move.',
            handle: '@NikBearBrown',
            subline: 'Liam, in for Bear · technique showcase',
          })} />
        );
        break;

      default:
        content = <AbsoluteFill style={{ background: CLAUDE.PAGE }} />;
    }

    return (
      <Sequence key={t.id} from={from} durationInFrames={t.frames}>
        {content}
        <Audio src={staticFile(t.audio)} />
      </Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {seqs}
    </AbsoluteFill>
  );
};
