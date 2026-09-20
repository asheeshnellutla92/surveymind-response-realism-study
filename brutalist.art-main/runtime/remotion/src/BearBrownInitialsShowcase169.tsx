/**
 * BearBrownInitialsShowcase169 — claude-liam · 1920×1080 · 30fps
 * One mark (Bear Brown initials). Every motion technique Remotion knows.
 * 16:9 landscape edition.
 *
 * Source SVG: logos/bear-brown-initials-black.svg
 *   viewBox 0 0 7500 5000 (wide, 3:2 ratio)
 *   One complex <path> (cls-2, #010202) + one transparent <rect> background
 *   SVG filters removed; ink stays #3D3929 on cream #FAF9F5
 *
 * The mark's 3:2 ratio fits naturally in 16:9 — centered with space on all
 * sides. The horizontal canvas gives room for lateral motion beats.
 *
 * Palette: CLAUDE fidelity brand
 * Voice:   Liam (am_onyx, Kokoro, in for Bear)
 * Channel: @NikBearBrown
 *
 * Beat list:
 *  B00  ClaudeComposerAsk cold open
 *  B01  Spring Entrance
 *  B02  Overshoot Spring
 *  B03  Draw-On Stroke (evolvePath)
 *  B04  Mask Reveal (clip-path wipe + radial iris)
 *  B05  Scale Zoom (linear vs bezier)
 *  B06  Rotation
 *  B07  Skew And Shear
 *  B08  Opacity Through Blur
 *  B09  Color Interpolation (treatment beat)
 *  B10  Kinetic Grid (4×3, staggered ripple)
 *  B11  Glitch Slices
 *  B12  Trail Echo (lateral motion)
 *  B13  Noise Wobble
 *  B14  Elastic Physics
 *  B15  Card Flip (perspective rotateY)
 *  B16  Shadow Play
 *  B17  Composer Summon
 *  B18  Stroke Pulse
 *  B19  Scale Breathe
 *  B20  Exit Family (shrink-spin, blur-out, mask-close)
 *  B21  Your Turn (handoff)
 *  B22  ClaudeTitleOutro
 */

import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  interpolateColors,
} from 'remotion';
import { evolvePath } from '@remotion/paths';
import TIMING from './bear-brown-initials-remotion-showcase-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

// ── Brand constants ───────────────────────────────────────────────────────────
const PAGE   = CLAUDE.PAGE;    // #FAF9F5
const INK    = CLAUDE.INK;     // #3D3929
const SPARK  = CLAUDE.SPARK;   // #D97757
const SERIF  = CLAUDE_FONT.serif;
const SANS   = CLAUDE_FONT.ui;
const FOLDER = '@NikBearBrown';
const TOPIC  = 'DESIGN · MOTION';
const SEGMENT = 'Bear Brown Initials';

// ── Mark path data (from logos/bear-brown-initials-black.svg) ─────────────────
// viewBox 0 0 7500 5000 — one complex path, ink #010202
const MARK_PATH = 'M2370.24,4129.65c-49.87-29.37-85.08-88-85.08-140.81,0-96.84,281.64-718.77,545.68-1202.86,99.75-181.88,331.51-569.13,431.26-721.69,55.74-82.13,67.48-108.54,67.48-152.56,0-73.34,49.87-152.56,152.55-249.35,102.68-93.88,231.76-176.05,451.79-287.5,287.51-143.77,302.17-146.69,492.86-146.69,205.36-2.96,234.7,11.7,114.42,49.85-481.13,158.43-988.67,448.89-1070.81,613.15-14.67,29.37-32.27,58.68-38.14,70.43-20.53,29.32-5.87,41.06,178.96,137.85,146.69,79.22,202.43,120.28,181.89,137.9-11.74,11.75-196.56-32.28-284.57-67.47-49.88-20.53-96.81-49.9-114.42-70.43l-29.34-35.19-88.01,132.03c-181.89,278.71-445.93,768.62-575.01,1070.83-61.61,140.81-167.22,407.78-252.3,639.51l-35.21,93.92,38.14-2.96c35.2-2.91,38.14,0,41.07,46.94,2.93,41.06-2.93,55.72-26.4,79.22-35.21,35.19-46.94,38.15-96.82,5.87h0ZM2877.78,3745.31c-49.87-23.45-79.21-70.38-85.08-129.07l-5.87-58.68,79.21-82.13c176.02-176.05,619.02-428.31,1194.03-680.62,102.68-44.02,184.82-85.09,187.76-90.96,0-5.87-17.6-20.53-38.14-32.28-55.74-35.19-211.23-38.15-360.85-14.66-217.1,38.15-481.13,114.41-648.35,187.75-76.28,35.19-102.68,35.19-117.35-8.79-26.4-73.34-26.4-102.71,8.8-134.94,41.07-38.15,305.11-184.84,624.89-343.27,319.77-158.43,522.2-272.84,721.7-404.87,369.65-243.47,610.21-466.46,651.29-604.32,14.67-44.03,11.73-49.9-14.67-76.3-38.14-43.98-129.08-82.13-252.3-105.62-143.75-29.32-566.21-29.32-789.17,0-938.79,123.24-1942.13,489.96-2643.29,959.34-316.84,211.24-577.95,478.21-677.69,689.46-26.4,55.72-29.34,82.13-29.34,167.22,0,93.88,2.94,105.62,35.21,152.56,46.94,70.38,158.42,140.81,275.77,178.97,126.15,38.1,193.62,49.85,360.85,64.51,132.02,11.75,155.49,20.53,155.49,58.68,0,23.49-375.52,8.79-478.2-14.66-272.83-67.47-463.53-293.37-445.93-531.02,14.67-264.01,261.1-545.68,765.71-883.03,401.92-266.97,862.51-487,1402.32-671.83,689.43-234.69,1469.8-369.63,1901.06-328.56,208.29,20.53,178.96,23.44,393.12-26.41,777.44-176.05,1425.79-178.96,1686.89-5.87,123.22,79.22,176.02,178.97,178.96,319.78,0,85.09-5.87,105.62-41.07,176.01-90.94,181.93-316.84,363.8-745.17,598.49-137.88,73.34-252.3,126.15-651.29,308.03-23.47,11.75,2.93,14.66,134.95,14.66,252.3,2.96,375.52,23.49,457.66,79.22l44,29.37,108.55-26.41c61.61-14.66,114.42-23.49,117.35-20.53,11.73,11.7-17.6,43.98-38.14,43.98-11.73,0-55.74,11.75-99.75,26.41l-79.21,23.49v52.81c0,70.38-26.4,123.19-96.81,193.62-146.69,146.69-495.8,328.56-865.45,451.76-129.08,44.02-178.96,55.77-264.03,58.68-102.68,5.87-108.55,5.87-134.95-23.45-29.34-32.28-35.2-93.88-14.67-134.99,35.2-64.51,202.43-184.79,407.79-293.37,167.23-90.92,504.6-220.03,777.44-296.29,26.4-8.79,49.87-17.62,49.87-23.45,0-38.15-451.79-49.9-745.17-17.62-88.01,8.79-170.16,14.66-178.96,11.75-20.54-8.83-44.01-90.96-32.27-120.28,8.8-29.37,35.2-41.11,293.37-137.9,542.74-202.41,1082.54-487,1358.31-712.9,149.62-126.15,208.29-258.18,146.69-349.1-52.81-79.22-184.82-146.69-360.85-184.84-140.82-29.32-604.35-26.41-856.65,8.79-178.96,23.49-492.87,79.22-504.6,90.96-2.93,2.91,8.8,23.44,26.4,46.94,44.01,64.56,61.61,164.31,44.01,243.47-26.41,114.46-79.21,199.5-196.56,325.65-217.1,222.99-475.27,398.99-1158.82,786.24l-58.68,32.28,164.29-8.79c225.9-8.83,305.11,17.57,369.65,114.41l17.6,26.41,85.08-26.41c82.14-23.49,137.89-23.49,129.08,5.87-5.87,14.66-41.07,32.28-132.02,67.47l-70.41,26.41-8.8,58.68c-26.4,231.73-337.38,519.28-792.11,742.22-287.5,140.81-563.28,217.12-642.49,181.88h0ZM3006.86,3563.44c187.76-46.94,463.53-155.47,651.29-255.22,258.17-137.9,510.47-343.27,572.08-466.47l26.4-49.9-55.74,23.49c-334.44,132.03-783.3,363.76-1029.74,533.94-111.48,76.26-299.24,246.44-258.17,237.6,11.74-2.91,55.74-14.66,93.88-23.45h0ZM4966.59,3184.97c252.3-73.34,677.69-264.01,868.38-390.16,111.48-73.34,228.83-178.97,228.83-208.33,0-23.45-5.87-23.45-161.35,32.28-322.71,111.5-724.63,293.37-900.66,407.78-105.61,70.43-202.42,146.69-211.23,173.09-8.8,26.41,58.68,20.53,176.03-14.66h0ZM4438.52,3425.53c-38.14-20.53-64.54-61.6-64.54-93.88-2.93-123.19,507.54-1114.81,792.11-1546.08,93.88-140.81,114.41-152.56,143.75-93.88,14.67,29.37,11.73,35.24-26.4,85.09-108.55,143.77-413.65,718.77-583.81,1103.06-126.15,284.59-158.42,369.68-140.82,381.42,17.6,11.7,23.47,61.6,11.73,88-20.54,38.15-70.41,88-90.94,88-8.8,0-29.34-5.87-41.07-11.75h0Z';

// viewBox extents
const VW = 7500;
const VH = 5000;

// ── Helpers ───────────────────────────────────────────────────────────────────
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const iclamp = (v: number, i: [number, number], o: [number, number]) =>
  clamp(interpolate(v, i, o), Math.min(o[0], o[1]), Math.max(o[0], o[1]));

// ── Landscape layout constants ─────────────────────────────────────────────────
// The mark's 3:2 ratio (7500×5000) fits naturally in 16:9.
// At 800px wide → 533px tall: leaves ~140px top/bottom margin in 1080px canvas.
const MARK_W = 800;
const MARK_H = Math.round(MARK_W * (VH / VW)); // ≈ 533

// ── Mark component ─────────────────────────────────────────────────────────────
interface MarkProps {
  fill?: string;
  opacity?: number;
  style?: React.CSSProperties;
  svgStyle?: React.CSSProperties;
  displayW?: number;
  displayH?: number;
}

const Mark: React.FC<MarkProps> = ({
  fill = '#171717',
  opacity = 1,
  style,
  svgStyle,
  displayW = MARK_W,
  displayH = MARK_H,
}) => (
  <div style={{ opacity, ...style }}>
    <svg
      width={displayW}
      height={displayH}
      viewBox={`0 0 ${VW} ${VH}`}
      style={{ display: 'block', ...svgStyle }}
    >
      <path d={MARK_PATH} fill={fill} />
    </svg>
  </div>
);

// ── Draw-on component using @remotion/paths evolvePath ─────────────────────────
const DrawOnMark: React.FC<{
  progress: number;
  fillColor?: string;
  strokeColor?: string;
  displayW?: number;
  displayH?: number;
}> = ({
  progress,
  fillColor = '#171717',
  strokeColor = SPARK,
  displayW = MARK_W,
  displayH = MARK_H,
}) => {
  const cp = clamp(progress, 0, 1);
  const strokeProgress = Math.min(1, cp * 2);
  const fillOpacity = Math.max(0, (cp - 0.5) * 2);
  const { strokeDasharray, strokeDashoffset } = evolvePath(strokeProgress, MARK_PATH);
  return (
    <svg width={displayW} height={displayH} viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block' }}>
      <path d={MARK_PATH} fill={fillColor} opacity={fillOpacity} />
      <path
        d={MARK_PATH}
        fill="none"
        stroke={strokeColor}
        strokeWidth={40}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        opacity={strokeProgress < 1 ? 1 : Math.max(0, 1 - (cp - 0.5) * 4)}
      />
    </svg>
  );
};

// ── Spark icon ─────────────────────────────────────────────────────────────────

// ── TechniqueBeat — landscape shell ───────────────────────────────────────────
// In 16:9, label sits top-center, mark fills center stage, spark line bottom-left.
interface TechniqueBeatProps {
  label: string;
  sparkLine: string;
  children: React.ReactNode;
  labelSub?: string;
}

const TechniqueBeat: React.FC<TechniqueBeatProps> = ({ label, sparkLine, children, labelSub }) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: PAGE, overflow: 'hidden' }}>
      {/* Segment label — Title Case, EB Garamond, terracotta underline */}
      <div style={{
        position: 'absolute',
        top: '7%',
        left: 0, right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: clamp(labelIn, 0, 1),
        transform: `translateY(${(1 - labelIn) * 8}px)`,
      }}>
        <div style={{
          fontFamily: SERIF,
          fontSize: 36,
          fontWeight: 600,
          color: INK,
          letterSpacing: '-0.01em',
          textAlign: 'center',
        }}>
          {label}
        </div>
        <div style={{ width: 44, height: 2.5, background: SPARK, marginTop: 6, borderRadius: 2 }} />
        {labelSub && (
          <div style={{
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase' as const,
            color: CLAUDE.INK_SOFT,
            marginTop: 6,
          }}>
            {labelSub}
          </div>
        )}
      </div>

      {/* Mark stage — centered in landscape frame */}
      <div style={{
        position: 'absolute',
        top: '18%',
        bottom: '14%',
        left: 0, right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {children}
      </div>

      {/* Spark + serif line — bottom left */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: '5%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: 22,
          fontStyle: 'italic',
          color: INK,
          letterSpacing: '-0.01em',
        }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── B01 Spring Entrance ────────────────────────────────────────────────────────
const SpringEntrance: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const s = spring({ frame, fps, config: { damping: 24, stiffness: 100, mass: 1 } });
  return (
    <TechniqueBeat label="Spring Entrance" sparkLine="Weight, or just slow?">
      <div style={{ transform: `scale(${clamp(s, 0, 1.5)})`, opacity: clamp(s * 1.5, 0, 1) }}>
        <Mark />
      </div>
    </TechniqueBeat>
  );
};

// ── B02 Overshoot Spring ───────────────────────────────────────────────────────
const OvershootSpring: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const s = spring({ frame, fps, config: { damping: 6, stiffness: 260, mass: 0.6 } });
  const entryFrames = 16;
  const squashPhase = Math.max(0, Math.sin(Math.PI * clamp(frame / entryFrames, 0, 1)));
  const scaleX = clamp(s, 0, 2) + squashPhase * 0.3;
  const scaleY = clamp(s, 0, 2) - squashPhase * 0.25;
  return (
    <TechniqueBeat label="Overshoot Spring" sparkLine="Physical, or noise?">
      <div style={{
        transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
        transformOrigin: 'bottom center',
        opacity: clamp(s * 2, 0, 1),
      }}>
        <Mark />
      </div>
    </TechniqueBeat>
  );
};

// ── B03 Draw-On Stroke ─────────────────────────────────────────────────────────
const DrawOnStroke: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = clamp(frame / (durationInFrames * 0.75), 0, 1);
  return (
    <TechniqueBeat label="Draw-On Stroke" sparkLine="Pen, or loading bar?">
      <DrawOnMark progress={progress} />
    </TechniqueBeat>
  );
};

// ── B04 Mask Reveal ────────────────────────────────────────────────────────────
const MaskReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const wipeP  = clamp(frame / (durationInFrames * 0.5), 0, 1);
  const irisP  = clamp((frame - durationInFrames * 0.5) / (durationInFrames * 0.4), 0, 1);
  const useRadial = wipeP >= 1;
  const cx = VW / 2;
  const cy = VH / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy) * 1.1;

  return (
    <TechniqueBeat label="Mask Reveal" sparkLine="The world opens.">
      <svg width={MARK_W} height={MARK_H} viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block' }}>
        <defs>
          <clipPath id="wipe-clip-169">
            <rect x={0} y={0} width={VW * wipeP} height={VH} />
          </clipPath>
          <clipPath id="iris-clip-169">
            <circle cx={cx} cy={cy} r={maxR * irisP} />
          </clipPath>
        </defs>
        <g clipPath={useRadial ? 'url(#iris-clip-169)' : 'url(#wipe-clip-169)'}>
          <path d={MARK_PATH} fill="#171717" />
        </g>
      </svg>
    </TechniqueBeat>
  );
};

// ── B05 Scale Zoom ─────────────────────────────────────────────────────────────
const ScaleZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const half = durationInFrames * 0.5;
  const isLinear = frame < half;
  const linearScale = isLinear
    ? interpolate(frame, [0, half], [6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;
  const bezierScale = !isLinear
    ? interpolate(frame, [half, durationInFrames * 0.9], [6, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      })
    : 6;
  const scale = isLinear ? linearScale : bezierScale;
  return (
    <TechniqueBeat label="Scale Zoom" sparkLine="Bezier earns it.">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', overflow: 'visible' }}>
        <Mark />
      </div>
    </TechniqueBeat>
  );
};

// ── B06 Rotation ───────────────────────────────────────────────────────────────
const Rotation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entryFrames = fps * 1.5;
  const s = spring({ frame, fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });
  const pivotAngle = interpolate(1 - clamp(s, 0, 1), [0, 1], [0, -45]);
  const continuousAngle = frame > entryFrames
    ? interpolate(frame - entryFrames, [0, durationInFrames - entryFrames], [0, 180], {
        extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
      })
    : 0;
  return (
    <TechniqueBeat label="Rotation" sparkLine="Meditative or lazy?">
      <div style={{
        transform: `rotate(${pivotAngle + continuousAngle}deg)`,
        opacity: clamp(s, 0, 1),
      }}>
        <Mark />
      </div>
    </TechniqueBeat>
  );
};

// ── B07 Skew And Shear ─────────────────────────────────────────────────────────
const SkewAndShear: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const leanIn = spring({ frame, fps, config: { damping: 22, stiffness: 140, mass: 0.9 } });
  const holdUntil = durationInFrames * 0.6;
  const releaseP = clamp((frame - holdUntil) / (durationInFrames * 0.3), 0, 1);
  const skewAngle = interpolate(clamp(leanIn, 0, 1), [0, 1], [0, 18]) * (1 - releaseP);
  return (
    <TechniqueBeat label="Skew And Shear" sparkLine="Tension, or wobble?">
      <div style={{
        transform: `skewX(${skewAngle}deg)`,
        opacity: clamp(leanIn, 0, 1),
      }}>
        <Mark />
      </div>
    </TechniqueBeat>
  );
};

// ── B08 Opacity Through Blur ───────────────────────────────────────────────────
const OpacityThroughBlur: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const s = spring({ frame, fps, config: { damping: 26, stiffness: 90, mass: 1.2 } });
  const opacity = clamp(s, 0, 1);
  const blur = interpolate(clamp(s, 0, 1), [0, 1], [20, 0]);
  return (
    <TechniqueBeat label="Opacity Through Blur" sparkLine="Arrives out of focus.">
      <div style={{ opacity, filter: `blur(${blur}px)` }}>
        <Mark />
      </div>
    </TechniqueBeat>
  );
};

// ── B09 Color Interpolation (treatment beat) ───────────────────────────────────
const ColorInterpolation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const t = frame / durationInFrames;
  const fillColor = t < 0.5
    ? interpolateColors(t * 2, [0, 1], ['#171717', SPARK])
    : interpolateColors((t - 0.5) * 2, [0, 1], [SPARK, '#171717']);
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: PAGE, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '7%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(labelIn, 0, 1), transform: `translateY(${(1 - labelIn) * 8}px)`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, color: INK, textAlign: 'center' }}>
          Color Interpolation
        </div>
        <div style={{ width: 44, height: 2.5, background: SPARK, marginTop: 6, borderRadius: 2 }} />
        <div style={{
          fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginTop: 6,
        }}>
          Color Treatment Beat
        </div>
      </div>
      <div style={{
        position: 'absolute', top: '18%', bottom: '14%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Mark fill={fillColor} />
      </div>
      <div style={{
        position: 'absolute', bottom: '5%', left: '5%',
        display: 'flex', alignItems: 'center', gap: 10,
        opacity: clamp(spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } }), 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: INK }}>
          Signal, or noise?
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── B10 Kinetic Grid — 4×3 for landscape ──────────────────────────────────────
const KineticGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  // 4×3 grid for landscape: 1920/4=480 wide, 1080/3=360 tall per cell
  const cols = 4;
  const rows = 3;
  const cellW = 1920 / cols;
  const cellH = 1080 / rows;
  const tileW = cellW * 0.85;
  const tileH = tileW * (VH / VW); // preserve 3:2 aspect ratio

  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: PAGE, overflow: 'hidden' }}>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const delay = (row * cols + col) * 3;
          const s = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 130, mass: 0.9 } });
          const rippleY = Math.sin((frame - delay) / 8) * 3;
          const scale = clamp(s, 0, 1);
          return (
            <div key={`${row}-${col}`} style={{
              position: 'absolute',
              left: col * cellW + cellW / 2,
              top: row * cellH + cellH / 2,
              transform: `translate(-50%, -50%) scale(${scale}) translateY(${rippleY}px)`,
              opacity: clamp(s * 1.2, 0, 1),
            }}>
              <svg width={tileW} height={tileH} viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block' }}>
                <path d={MARK_PATH} fill="#171717" />
              </svg>
            </div>
          );
        })
      )}
      {/* Label overlay */}
      <div style={{
        position: 'absolute', top: '2%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(labelIn, 0, 1),
      }}>
        <div style={{
          fontFamily: SERIF, fontSize: 32, fontWeight: 600, color: INK, textAlign: 'center',
          background: `${PAGE}E8`, padding: '4px 20px', borderRadius: 4,
        }}>
          Kinetic Grid
        </div>
        <div style={{ width: 44, height: 2, background: SPARK, marginTop: 6, borderRadius: 2 }} />
      </div>
      {/* Spark line bottom-left */}
      <div style={{
        position: 'absolute', bottom: '2%', left: '5%',
        display: 'flex', alignItems: 'center', gap: 10,
        opacity: clamp(spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } }), 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', color: INK,
          background: `${PAGE}E8`, padding: '2px 10px', borderRadius: 3,
        }}>
          Grid becomes rhythm.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── B11 Glitch Slices ──────────────────────────────────────────────────────────
const GlitchSlices: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const GLITCH_START = 15;
  const GLITCH_END = GLITCH_START + 10;
  const isGlitching = frame >= GLITCH_START && frame < GLITCH_END;
  const seed = frame * 1337;
  const pseudo = (n: number) => ((seed * (n + 1) * 2654435761) & 0xffffffff) / 0xffffffff;
  const slices = 6;
  const entryS = spring({ frame, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } });

  return (
    <TechniqueBeat label="Glitch Slices" sparkLine="Aggressive, then gone.">
      <div style={{ opacity: clamp(entryS, 0, 1) }}>
        {isGlitching ? (
          <svg width={MARK_W} height={MARK_H} viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block' }}>
            {Array.from({ length: slices }, (_, i) => {
              const offsetX = (pseudo(i * 3 + frame) - 0.5) * 800;
              const clipY = (i / slices) * VH;
              const clipH = VH / slices;
              const colorShift = pseudo(i + frame * 2) > 0.75 ? SPARK : '#171717';
              return (
                <g key={i}>
                  <defs>
                    <clipPath id={`gs169-${i}`}>
                      <rect x={0} y={clipY} width={VW} height={clipH} />
                    </clipPath>
                  </defs>
                  <g clipPath={`url(#gs169-${i})`} transform={`translate(${offsetX},0)`}>
                    <path d={MARK_PATH} fill={colorShift} />
                  </g>
                </g>
              );
            })}
          </svg>
        ) : (
          <Mark />
        )}
      </div>
    </TechniqueBeat>
  );
};

// ── B12 Trail Echo — lateral motion, wider canvas helps ───────────────────────
const TrailEcho: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // In landscape, we can travel further side to side
  const TRAVEL = 600;
  const slideP = interpolate(frame, [0, durationInFrames * 0.7], [0, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
    easing: (t) => t * t * (3 - 2 * t),
  });
  const x = interpolate(slideP, [0, 1], [-TRAVEL / 2, TRAVEL / 2]);
  const trailCount = 5;
  const trailDelay = 5;

  return (
    <TechniqueBeat label="Trail Echo" sparkLine="Motion lingers.">
      <div style={{ position: 'relative', width: MARK_W + TRAVEL, height: MARK_H, overflow: 'visible' }}>
        {Array.from({ length: trailCount }, (_, i) => {
          const tf = Math.max(0, frame - (i + 1) * trailDelay);
          const tslideP = interpolate(tf, [0, durationInFrames * 0.7], [0, 1], {
            extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
            easing: (t) => t * t * (3 - 2 * t),
          });
          const tx = interpolate(tslideP, [0, 1], [-TRAVEL / 2, TRAVEL / 2]);
          return (
            <div key={i} style={{
              position: 'absolute', left: tx + TRAVEL / 2, top: 0,
              opacity: (1 - i / trailCount) * 0.22,
            }}>
              <Mark />
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: x + TRAVEL / 2, top: 0 }}>
          <Mark />
        </div>
      </div>
    </TechniqueBeat>
  );
};

// ── B13 Noise Wobble ───────────────────────────────────────────────────────────
const NoiseWobble: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entryS = spring({ frame, fps, config: { damping: 24, stiffness: 110, mass: 1 } });
  const wobbleAmp = interpolate(frame, [0, durationInFrames * 0.85], [10, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });
  const wobbleX = Math.sin(frame * 0.47) * wobbleAmp;
  const wobbleY = Math.sin(frame * 0.31 + 1.2) * wobbleAmp * 0.6;
  const wobbleRot = Math.sin(frame * 0.23) * wobbleAmp * 0.25;
  return (
    <TechniqueBeat label="Noise Wobble" sparkLine="Alive or anxious?">
      <div style={{
        transform: `translate(${wobbleX}px, ${wobbleY}px) rotate(${wobbleRot}deg)`,
        opacity: clamp(entryS, 0, 1),
      }}>
        <Mark />
      </div>
    </TechniqueBeat>
  );
};

// ── B14 Elastic Physics ────────────────────────────────────────────────────────
const ElasticPhysics: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const dropS = spring({ frame, fps, config: { damping: 10, stiffness: 180, mass: 1.2 } });
  const dropY = interpolate(clamp(dropS, 0, 2), [0, 1], [-300, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });
  const LAND = 12;
  const squashBurst = Math.max(0, Math.sin(Math.PI * clamp((frame - LAND) / 10, 0, 1)));
  const squashX = 1 + squashBurst * 0.28;
  const squashY = 1 - squashBurst * 0.22;
  return (
    <TechniqueBeat label="Elastic Physics" sparkLine="Hits the floor.">
      <div style={{
        transform: `translateY(${dropY}px) scaleX(${squashX}) scaleY(${squashY})`,
        transformOrigin: 'bottom center',
        opacity: clamp(dropS * 1.5, 0, 1),
      }}>
        <Mark />
      </div>
    </TechniqueBeat>
  );
};

// ── B15 Card Flip ──────────────────────────────────────────────────────────────
const CardFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const flipS = spring({ frame, fps, config: { damping: 22, stiffness: 140, mass: 0.9 } });
  const rotY = interpolate(clamp(flipS, 0, 1), [0, 1], [90, 0]);
  const holdUntil = durationInFrames * 0.5;
  const rotY2 = frame > holdUntil
    ? interpolate(frame - holdUntil, [0, durationInFrames * 0.45], [0, 360], {
        extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
      })
    : 0;
  const totalRotY = rotY + rotY2;
  const showBack = (totalRotY % 360) > 90 && (totalRotY % 360) < 270;
  const fillColor = showBack ? SPARK : '#171717';

  return (
    <TechniqueBeat label="Card Flip" sparkLine="Depth, or squash?">
      <div style={{
        width: MARK_W + 80, height: MARK_H + 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 1200,
      }}>
        <div style={{
          transform: `rotateY(${totalRotY}deg)`,
          transformStyle: 'preserve-3d',
        }}>
          <div style={{
            background: CLAUDE.CARD,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 12,
            padding: 40,
            boxShadow: '0 8px 40px rgba(61,57,41,0.14)',
          }}>
            <Mark fill={fillColor} />
          </div>
        </div>
      </div>
    </TechniqueBeat>
  );
};

// ── B16 Shadow Play ────────────────────────────────────────────────────────────
const ShadowPlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entryS = spring({ frame, fps, config: { damping: 24, stiffness: 110, mass: 1 } });
  const SHADOW_PHASE = durationInFrames * 0.5;
  const shadowP = clamp(frame / SHADOW_PHASE, 0, 1);
  const snapP = clamp((frame - SHADOW_PHASE) / (durationInFrames * 0.35), 0, 1);
  const shadowOffX = interpolate(shadowP, [0, 1], [0, 50]) * (1 - snapP);
  const shadowOffY = interpolate(shadowP, [0, 1], [0, 35]) * (1 - snapP);
  const shadowOpacity = interpolate(shadowP, [0, 0.3, 1], [0, 0.3, 0.15]) * (1 - snapP * 0.5);

  return (
    <TechniqueBeat label="Shadow Play" sparkLine="Detached, then grounded.">
      <div style={{ position: 'relative', opacity: clamp(entryS, 0, 1) }}>
        <div style={{ position: 'absolute', left: shadowOffX, top: shadowOffY, opacity: shadowOpacity }}>
          <Mark fill="#171717" />
        </div>
        <Mark />
      </div>
    </TechniqueBeat>
  );
};

// ── B17 Composer Summon ────────────────────────────────────────────────────────
const ComposerSummon: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const SEND_FRAME = Math.floor(durationInFrames * 0.38);
  const typingP = clamp(frame / (SEND_FRAME * 0.8), 0, 1);
  const promptText = 'animate the Bear Brown initials mark — spring entrance, then draw-on stroke';
  const charsShown = Math.floor(typingP * promptText.length);
  const sparkBurst = interpolate(frame, [SEND_FRAME, SEND_FRAME + 8, SEND_FRAME + 20], [0, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const markS = spring({
    frame: Math.max(0, frame - SEND_FRAME - 8),
    fps, config: { damping: 20, stiffness: 160, mass: 0.8 },
  });
  const blinkOn = Math.floor(frame / 10) % 2 === 0;
  const UI = 20;
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: PAGE, overflow: 'hidden' }}>
      {/* Label top */}
      <div style={{
        position: 'absolute', top: '7%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(labelIn, 0, 1), transform: `translateY(${(1 - labelIn) * 8}px)`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, color: INK }}>
          Composer Summon
        </div>
        <div style={{ width: 44, height: 2.5, background: SPARK, marginTop: 6, borderRadius: 2 }} />
      </div>

      {/* Landscape layout: composer card on left, mark on right */}
      <div style={{
        position: 'absolute', top: '18%', bottom: '14%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60,
      }}>
        {/* Composer card */}
        <div style={{
          flex: '0 0 auto', width: 700,
          background: CLAUDE.CARD, border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: UI * 1.2, boxShadow: '0 6px 32px rgba(61,57,41,0.08)',
          padding: `${UI * 0.8}px ${UI * 1.0}px`,
        }}>
          <div style={{ minHeight: UI * 3, fontSize: UI * 0.85, lineHeight: 1.5, color: INK, fontFamily: SANS }}>
            {charsShown < promptText.length
              ? (
                <>{promptText.slice(0, charsShown)}
                  {blinkOn && <span style={{
                    display: 'inline-block', width: 2, height: UI * 0.85,
                    background: INK, verticalAlign: 'text-bottom', marginLeft: 1,
                  }} />}
                </>
              )
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
                <path d="M12 20V5m0 0-6 6m6-6 6 6" stroke="#FFF" strokeWidth={2.6}
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Spark burst + mark on right */}
        <div style={{ flex: '0 0 auto', position: 'relative', width: MARK_W, height: MARK_H }}>
          {/* Spark burst */}
          {sparkBurst > 0.01 && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: `translate(-50%, -50%)`,
              width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: sparkBurst, zIndex: 2,
            }}>
            </div>
          )}
          {/* Mark arriving */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: clamp(markS, 0, 1),
            transform: `scale(${clamp(markS, 0, 1)})`,
          }}>
            <Mark />
          </div>
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', bottom: '5%', left: '5%',
        display: 'flex', alignItems: 'center', gap: 10,
        opacity: clamp(markS * 0.8, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: INK }}>
          The interface is the origin.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── B18 Stroke Pulse ───────────────────────────────────────────────────────────
const StrokePulse: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const BPM = 72;
  const beatPeriod = (fps * 60) / BPM;
  const phase = (frame % beatPeriod) / beatPeriod;
  const pulse = phase < 0.15
    ? interpolate(phase, [0, 0.075, 0.15], [0, 1, 0])
    : phase < 0.30
    ? interpolate(phase, [0.15, 0.225, 0.30], [0, 0.7, 0])
    : 0;
  const entryS = spring({ frame, fps, config: { damping: 26, stiffness: 100, mass: 1 } });
  const TOTAL_PATH_LEN = 80000;
  const dashAmt = pulse * TOTAL_PATH_LEN * 0.04;
  const strokeOpacity = 0.08 + pulse * 0.6;

  return (
    <TechniqueBeat label="Stroke Pulse" sparkLine="Heartbeat, held.">
      <div style={{ opacity: clamp(entryS, 0, 1) }}>
        <svg width={MARK_W} height={MARK_H} viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block' }}>
          <path d={MARK_PATH} fill="#171717" />
          <path
            d={MARK_PATH}
            fill="none"
            stroke={SPARK}
            strokeWidth={80}
            strokeDasharray={`${dashAmt} ${TOTAL_PATH_LEN}`}
            strokeDashoffset={-TOTAL_PATH_LEN * 0.1 * (1 - phase)}
            opacity={strokeOpacity}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </TechniqueBeat>
  );
};

// ── B19 Scale Breathe ──────────────────────────────────────────────────────────
const ScaleBreathe: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const entryS = spring({ frame, fps, config: { damping: 30, stiffness: 80, mass: 1.2 } });
  const breatheProgress = Math.sin(frame * (Math.PI * 2 / 120));
  const scale = 1.0 + breatheProgress * 0.04;
  return (
    <TechniqueBeat label="Scale Breathe" sparkLine="The quietest technique.">
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        opacity: clamp(entryS, 0, 1),
      }}>
        <Mark />
      </div>
    </TechniqueBeat>
  );
};

// ── B20 Exit Family ────────────────────────────────────────────────────────────
const ExitFamily: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const third = Math.floor(durationInFrames / 3);
  const exitIdx = Math.min(2, Math.floor(frame / third));
  const localFrame = frame - exitIdx * third;
  const HOLD = third * 0.3;
  const ANIM_DUR = third - HOLD;
  const exitPhaseP = clamp((localFrame - HOLD) / ANIM_DUR, 0, 1);

  let markStyle: React.CSSProperties = {};
  let clipStyle: React.CSSProperties = {};

  if (exitIdx === 0) {
    const s = 1 - exitPhaseP;
    const rot = exitPhaseP * 360;
    markStyle = { transform: `scale(${s}) rotate(${rot}deg)`, opacity: Math.max(0, 1 - exitPhaseP * 1.5) };
  } else if (exitIdx === 1) {
    markStyle = { filter: `blur(${exitPhaseP * 24}px)`, opacity: Math.max(0, 1 - exitPhaseP * 1.2) };
  } else {
    clipStyle = {
      clipPath: `circle(${(1 - exitPhaseP) * 400}px at center)`,
      WebkitClipPath: `circle(${(1 - exitPhaseP) * 400}px at center)`,
    };
  }

  const exitNames = ['Shrink Spin', 'Blur Out', 'Mask Close'];
  const exitName = exitNames[exitIdx] || 'Exit';
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: PAGE, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '7%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(labelIn, 0, 1),
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, color: INK }}>
          Exit Family
        </div>
        <div style={{ width: 44, height: 2.5, background: SPARK, marginTop: 6, borderRadius: 2 }} />
        <div style={{
          fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase' as const, color: SPARK, marginTop: 8,
        }}>
          {exitName}
        </div>
      </div>

      <div style={{
        position: 'absolute', top: '18%', bottom: '14%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ ...clipStyle }}>
          <div style={{ ...markStyle }}>
            <Mark />
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div style={{
        position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: 5,
            background: i <= exitIdx ? SPARK : CLAUDE.BORDER,
          }} />
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: '5%', left: '5%',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: INK }}>
          Exits are underrated.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── Timing accumulator ────────────────────────────────────────────────────────
const TIMED = TIMING.map((t) => ({ ...t }));
export const TOTAL_FRAMES_169 = TIMED.reduce((a, b) => a + b.frames, 0);

// ── Main composition ──────────────────────────────────────────────────────────
export const BearBrownInitialsShowcase169: React.FC = () => {
  let at = 0;

  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;

    switch (t.id) {
      // ── B00 Cold open ──────────────────────────────────────────────────────
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Selam, Liam',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'animate bear-brown-initials-black.svg — every Remotion technique — 16:9 landscape · 20 techniques · this is Liam, in for Bear',
            runningText: 'loading technique showcase…',
            folderLabel: FOLDER,
            output: [
              '20 techniques loaded',
              'complex path · viewBox 7500×5000 · 3:2 ratio fits natively in landscape',
              'Kokoro am_onyx narration locked · this is Liam, in for Bear',
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

      // ── B21 Your Turn (handoff) ────────────────────────────────────────────
      case 'B21':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Your turn.',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Take my logo SVG. Run it through spring entrance, draw-on stroke, and elastic physics. For each: a Remotion composition at 1920×1080, 30fps, cream #FAF9F5 background, ink #3D3929, terracotta #D97757 accent. Export as separate mp4s for review.',
            runningText: 'paste this into Claude…',
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B22 Outro ──────────────────────────────────────────────────────────
      case 'B22':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: 'One Mark. Every Move Remotion Knows.',
            handle: '@NikBearBrown',
            subline: 'Liam, in for Bear.',
          })} />
        );
        break;

      default:
        content = (
          <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: SERIF, fontSize: 48, color: INK }}>{t.id}</div>
          </AbsoluteFill>
        );
    }

    return (
      <Sequence key={t.id} from={from} durationInFrames={t.frames} name={t.id}>
        {content}
        {t.audio && <Audio src={staticFile(t.audio)} />}
      </Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ background: PAGE }}>
      {seqs}
    </AbsoluteFill>
  );
};
