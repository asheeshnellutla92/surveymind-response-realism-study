/**
 * HLogoRemotionShowcase — every Remotion move, one logo.
 *
 * claude-liam channel · @NikBearBrown · Kokoro am_onyx · Teardown register
 * Subject: the HAI H-ligature mark (two SVG paths, #171717 ink, 340×368 viewBox)
 * Palette: CLAUDE fidelity (cream PAGE, warm INK, terracotta SPARK one-per-beat)
 * Format: 1080×1920 portrait (9:16), 30 fps
 *
 * Path strings extracted directly from logos/H-HAI-Logo.svg — SVG filter removed,
 * shadows re-implemented as cheap offset/opacity layers where beats require them.
 *
 * B00  ClaudeComposerAsk cold open (Liam intro)
 * B01  Spring Entrance
 * B02  Overshoot Spring
 * B03  Draw-On Stroke  (uses @remotion/paths evolvePath)
 * B04  Per-Path Stagger
 * B05  Mask Reveal (linear wipe → radial iris)
 * B06  Scale Zoom
 * B07  Rotation
 * B08  Skew And Shear
 * B09  Opacity Through Blur
 * B10  Color Interpolation
 * B11  Kinetic Grid
 * B12  Glitch Slices
 * B13  Trail Echo
 * B14  Noise Wobble
 * B15  Elastic Physics
 * B16  Orbit Parts
 * B17  Card Flip
 * B18  Shadow Play
 * B19  Composer Summon
 * B20  Exit Family
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
import TIMING from './h-logo-remotion-showcase-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

// ── Brand constants ───────────────────────────────────────────────────────────
const SERIF  = CLAUDE_FONT.serif;
const SANS   = CLAUDE_FONT.ui;
const FOLDER = '@NikBearBrown';
const TOPIC  = 'REMOTION · MOTION TECHNIQUES';
const SEGMENT = 'H Logo Techniques';

// ── HAI H-mark path data (from logos/H-HAI-Logo.svg, viewBox 0 0 340 368) ───
// Two paths: the H-bar body (P1) and the A-diagonal (P2)
const P1 = 'M0,0h74v148h104l28,70H74v150H0V0Z';
const P2 = 'M119,1h72l149,366h-74L119,1Z';
const LOGO_W = 340;
const LOGO_H = 368;

// ── Helper: the H mark as an SVG at a given size, with per-path props ─────────
interface HMarkProps {
  size?: number;            // scale factor relative to native 340×368
  p1Fill?: string;
  p2Fill?: string;
  p1Opacity?: number;
  p2Opacity?: number;
  p1Transform?: string;
  p2Transform?: string;
  p1PathLength?: number;   // for stroke-dasharray tricks
  p2PathLength?: number;
  strokeColor?: string;
  strokeWidth?: number;
  showStroke?: boolean;
  viewBoxTransform?: string; // on the <g> inside SVG
}

const HMark: React.FC<HMarkProps> = ({
  size = 1,
  p1Fill = '#171717', p2Fill = '#171717',
  p1Opacity = 1, p2Opacity = 1,
  p1Transform = '', p2Transform = '',
  showStroke = false, strokeColor = '#171717', strokeWidth = 2,
  viewBoxTransform = '',
}) => {
  const w = LOGO_W * size;
  const h = LOGO_H * size;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
      style={{ display: 'block', overflow: 'visible' }}>
      <g transform={viewBoxTransform}>
        <path d={P1} fill={p1Fill} opacity={p1Opacity} transform={p1Transform}
          stroke={showStroke ? strokeColor : 'none'} strokeWidth={showStroke ? strokeWidth : 0} />
        <path d={P2} fill={p2Fill} opacity={p2Opacity} transform={p2Transform}
          stroke={showStroke ? strokeColor : 'none'} strokeWidth={showStroke ? strokeWidth : 0} />
      </g>
    </svg>
  );
};

// ── Draw-On stroke using @remotion/paths ─────────────────────────────────────
const DrawOnPath: React.FC<{ d: string; progress: number; fill: string; strokeColor?: string }> = ({
  d, progress, fill, strokeColor = CLAUDE.SPARK,
}) => {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  // stroke trace phase: 0 → 0.5
  // fill flood phase: 0.5 → 1
  const strokeProgress = Math.min(1, clampedProgress * 2);
  const fillOpacity = Math.max(0, (clampedProgress - 0.5) * 2);

  const { strokeDasharray, strokeDashoffset } = evolvePath(strokeProgress, d);

  return (
    <g>
      {/* Filled shape fades in after stroke completes */}
      <path d={d} fill={fill} opacity={fillOpacity} />
      {/* Stroke trace */}
      <path d={d} fill="none"
        stroke={strokeColor} strokeWidth={4}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        opacity={strokeProgress < 1 ? 1 : Math.max(0, 1 - (clampedProgress - 0.5) * 4)}
      />
    </g>
  );
};

// ── Shared layout helpers ─────────────────────────────────────────────────────
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Technique beat wrapper: cream bg, centered mark area, technique label + spark line
interface TechniqueBeatProps {
  label: string;         // Title Case segment label
  sparkLine: string;     // ≤4 words, bottom spark + serif line
  children: React.ReactNode;
}
const TechniqueBeat: React.FC<TechniqueBeatProps> = ({ label, sparkLine, children }) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Segment label — terracotta underline, EB Garamond, Title Case */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: 0, right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: clamp(labelIn, 0, 1),
        transform: `translateY(${(1 - labelIn) * 8}px)`,
      }}>
        <div style={{
          fontFamily: SERIF,
          fontSize: 38,
          fontWeight: 600,
          color: CLAUDE.INK,
          letterSpacing: '-0.01em',
          textAlign: 'center',
        }}>
          {label}
        </div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
      </div>

      {/* Mark stage — centered vertically in the middle 70% */}
      <div style={{
        position: 'absolute',
        top: '15%', bottom: '15%',
        left: 0, right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {children}
      </div>

      {/* Spark line — bottom */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: 0, right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } }), 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: 24,
          fontStyle: 'italic',
          color: CLAUDE.INK,
          letterSpacing: '-0.01em',
        }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── B01 Spring Entrance ───────────────────────────────────────────────────────
const SpringEntrance: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const s = spring({ frame, fps, config: { damping: 24, stiffness: 100, mass: 1 } });
  const size = 0.65;
  return (
    <TechniqueBeat label="Spring Entrance" sparkLine="Weight, or cheap?">
      <div style={{ transform: `scale(${s})`, opacity: s }}>
        <HMark size={size} />
      </div>
    </TechniqueBeat>
  );
};

// ── B02 Overshoot Spring ──────────────────────────────────────────────────────
const OvershootSpring: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  // High stiffness, low damping → strong overshoot
  const s = spring({ frame, fps, config: { damping: 8, stiffness: 220, mass: 0.6 } });
  // Squash: compute from spring value directly — avoid non-monotonic inputRange
  // We model squash as a function of how far we are from the "natural" 1.0 value
  // When s < 1: mark is still arriving (normal spring scale)
  // When s > 1: mark has overshot (squash in X, stretch in Y — but we keep it simple)
  // We use the raw spring value as scale and add squash separately via frame timing
  const entryFrames = 20;
  // Entry squash: short window around landing (frame ~10-18 for high-stiffness spring)
  const squashPhase = Math.max(0, Math.sin(Math.PI * clamp(frame / entryFrames, 0, 1)));
  const scaleX = clamp(s, 0, 2) + squashPhase * 0.28;
  const scaleY = clamp(s, 0, 2) - squashPhase * 0.22;
  const size = 0.65;
  return (
    <TechniqueBeat label="Overshoot Spring" sparkLine="Physical, or noise?">
      <div style={{
        transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
        transformOrigin: 'bottom center',
        opacity: clamp(s * 2, 0, 1),
      }}>
        <HMark size={size} />
      </div>
    </TechniqueBeat>
  );
};

// ── B03 Draw-On Stroke ────────────────────────────────────────────────────────
const DrawOnStroke: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  // Trace over most of the beat; fill in last quarter
  const progress1 = clamp(frame / (durationInFrames * 0.7), 0, 1);
  const progress2 = clamp(frame / (durationInFrames * 0.65), 0, 1);
  const size = 0.65;
  const w = LOGO_W * size;
  const h = LOGO_H * size;
  return (
    <TechniqueBeat label="Draw-On Stroke" sparkLine="Pen, or loading bar?">
      <svg width={w} height={h} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} style={{ display: 'block' }}>
        <DrawOnPath d={P1} progress={progress1} fill="#171717" strokeColor={CLAUDE.SPARK} />
        <DrawOnPath d={P2} progress={Math.max(0, progress2 - 0.1)} fill="#171717" strokeColor={CLAUDE.SEND} />
      </svg>
    </TechniqueBeat>
  );
};

// ── B04 Per-Path Stagger ──────────────────────────────────────────────────────
const PerPathStagger: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const s1 = spring({ frame, fps, config: { damping: 24, stiffness: 110, mass: 1 } });
  // P2 delayed by 18 frames
  const s2 = spring({ frame: frame - 18, fps, config: { damping: 24, stiffness: 110, mass: 1 } });
  const size = 0.65;
  const w = LOGO_W * size;
  const h = LOGO_H * size;
  // SVG transform attribute uses translate(), not translateX()
  const tx1 = (1 - clamp(s1, 0, 1)) * -40;
  const tx2 = (1 - clamp(s2, 0, 1)) * 40;
  return (
    <TechniqueBeat label="Per-Path Stagger" sparkLine="Two shapes, one beat.">
      <svg width={w} height={h} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} style={{ display: 'block', overflow: 'visible' }}>
        <path d={P1} fill="#171717"
          opacity={clamp(s1, 0, 1)}
          transform={`translate(${tx1}, 0)`}
        />
        <path d={P2} fill={CLAUDE.SPARK}
          opacity={clamp(s2, 0, 1)}
          transform={`translate(${tx2}, 0)`}
        />
      </svg>
    </TechniqueBeat>
  );
};

// ── B05 Mask Reveal ───────────────────────────────────────────────────────────
const MaskReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Phase 1: linear wipe left-to-right (0 → 50% of beat)
  // Phase 2: radial iris open (50% → 90% of beat)
  const wipeP  = clamp(frame / (durationInFrames * 0.5), 0, 1);
  const irisP  = clamp((frame - durationInFrames * 0.5) / (durationInFrames * 0.4), 0, 1);
  const size = 0.65;
  const w = LOGO_W * size;
  const h = LOGO_H * size;
  const cx = LOGO_W / 2;
  const cy = LOGO_H / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy) * 1.1;
  const clipId1 = 'mask-linear';
  const clipId2 = 'mask-radial';

  // After wipe completes, switch to radial
  const useRadial = wipeP >= 1;

  return (
    <TechniqueBeat label="Mask Reveal" sparkLine="The world opens.">
      <svg width={w} height={h} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} style={{ display: 'block' }}>
        <defs>
          <clipPath id={clipId1}>
            <rect x={0} y={0} width={LOGO_W * wipeP} height={LOGO_H} />
          </clipPath>
          <clipPath id={clipId2}>
            <circle cx={cx} cy={cy} r={maxR * irisP} />
          </clipPath>
        </defs>
        <g clipPath={useRadial ? `url(#${clipId2})` : `url(#${clipId1})`}>
          <path d={P1} fill="#171717" />
          <path d={P2} fill="#171717" />
        </g>
      </svg>
    </TechniqueBeat>
  );
};

// ── B06 Scale Zoom ────────────────────────────────────────────────────────────
const ScaleZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  // Linear first half, bezier easing second half
  const halfFrames = durationInFrames * 0.5;
  const isLinearPhase = frame < halfFrames;

  const linearScale = isLinearPhase
    ? interpolate(frame, [0, halfFrames], [8, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })
    : 1;
  const bezierScale = isLinearPhase
    ? 8
    : interpolate(frame, [halfFrames, durationInFrames * 0.9], [8, 1], {
        extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
        easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      });

  const scale = isLinearPhase ? linearScale : bezierScale;
  const size = 0.65;
  const accentColor = isLinearPhase ? CLAUDE.INK_SOFT : CLAUDE.SPARK;

  return (
    <TechniqueBeat label="Scale Zoom" sparkLine="Bezier earns it.">
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}>
        <HMark size={size} p1Fill={isLinearPhase ? '#171717' : '#171717'} p2Fill={accentColor} />
      </div>
    </TechniqueBeat>
  );
};

// ── B07 Rotation ──────────────────────────────────────────────────────────────
const Rotation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  // Pivot entrance: fast spring to 0, then slow continuous rotation
  const entranceFrames = fps * 1.5;
  const entranceRot = spring({ frame, fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });
  const pivotAngle = interpolate(1 - entranceRot, [0, 1], [0, -45]);
  const continuousAngle = frame > entranceFrames
    ? interpolate(frame - entranceFrames, [0, durationInFrames - entranceFrames], [0, 180])
    : 0;
  const totalAngle = pivotAngle + continuousAngle;
  const size = 0.65;
  return (
    <TechniqueBeat label="Rotation" sparkLine="Meditative or lazy?">
      <div style={{
        transform: `rotate(${totalAngle}deg)`,
        opacity: clamp(entranceRot, 0, 1),
      }}>
        <HMark size={size} />
      </div>
    </TechniqueBeat>
  );
};

// ── B08 Skew And Shear ────────────────────────────────────────────────────────
const SkewAndShear: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  // Lean in, hold, release
  const leanIn = spring({ frame, fps, config: { damping: 22, stiffness: 140, mass: 0.9 } });
  const holdUntil = durationInFrames * 0.6;
  const releaseP = clamp((frame - holdUntil) / (durationInFrames * 0.3), 0, 1);
  const skewAngle = interpolate(leanIn, [0, 1], [0, 18]) * (1 - releaseP);
  const size = 0.65;
  return (
    <TechniqueBeat label="Skew And Shear" sparkLine="Tension, or wobble?">
      <div style={{
        transform: `skewX(${skewAngle}deg)`,
        opacity: clamp(leanIn, 0, 1),
      }}>
        <HMark size={size} />
      </div>
    </TechniqueBeat>
  );
};

// ── B09 Opacity Through Blur ──────────────────────────────────────────────────
const OpacityThroughBlur: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const s = spring({ frame, fps, config: { damping: 26, stiffness: 90, mass: 1.2 } });
  const opacity = clamp(s, 0, 1);
  const blur = interpolate(s, [0, 1], [18, 0]);
  const size = 0.65;
  return (
    <TechniqueBeat label="Opacity Through Blur" sparkLine="Arrives out of focus.">
      <div style={{
        opacity,
        filter: `blur(${blur}px)`,
      }}>
        <HMark size={size} />
      </div>
    </TechniqueBeat>
  );
};

// ── B10 Color Interpolation ───────────────────────────────────────────────────
const ColorInterpolation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Full cycle: ink → terracotta → ink
  const t = frame / durationInFrames;
  const fillColor = t < 0.5
    ? interpolateColors(t * 2, [0, 1], ['#171717', CLAUDE.SPARK])
    : interpolateColors((t - 0.5) * 2, [0, 1], [CLAUDE.SPARK, '#171717']);
  const labelIn = spring({ frame, fps: 30, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const size = 0.65;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Label */}
      <div style={{
        position: 'absolute', top: '5%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(labelIn, 0, 1),
        transform: `translateY(${(1 - labelIn) * 8}px)`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 600, color: CLAUDE.INK, textAlign: 'center' }}>
          Color Interpolation
        </div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
        {/* Treatment label */}
        <div style={{
          fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginTop: 8,
        }}>
          Color Treatment Beat
        </div>
      </div>
      {/* Mark */}
      <div style={{
        position: 'absolute', top: '15%', bottom: '15%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <HMark size={size} p1Fill={fillColor} p2Fill={fillColor} />
      </div>
      {/* Spark line */}
      <div style={{
        position: 'absolute', bottom: '5%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(spring({ frame: frame - 12, fps: 30, config: { damping: 28, stiffness: 120, mass: 0.9 } }), 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>
          Signal, or noise?
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── B11 Kinetic Grid ──────────────────────────────────────────────────────────
const KineticGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const cols = 4;
  const rows = 5;
  const cellW = 1080 / cols;
  const cellH = 1920 / rows;
  const tileSize = Math.min(cellW, cellH) * 0.55;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const delay = (row * cols + col) * 3;
          const s = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 130, mass: 0.9 } });
          const rippleOffset = Math.sin((frame - delay) / 8) * 3;
          const scale = clamp(s, 0, 1);
          return (
            <div key={`${row}-${col}`} style={{
              position: 'absolute',
              left: col * cellW + cellW / 2,
              top: row * cellH + cellH / 2,
              transform: `translate(-50%, -50%) scale(${scale}) translateY(${rippleOffset}px)`,
              opacity: clamp(s * 1.2, 0, 1),
            }}>
              <HMark size={tileSize / LOGO_W} />
            </div>
          );
        })
      )}
      {/* Label overlay */}
      <div style={{
        position: 'absolute', top: '3%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          fontFamily: SERIF, fontSize: 34, fontWeight: 600,
          color: CLAUDE.INK, textAlign: 'center',
          background: CLAUDE.PAGE, padding: '4px 20px', borderRadius: 4,
          opacity: 0.92,
        }}>
          Kinetic Grid
        </div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
      </div>
      {/* Spark line */}
      <div style={{
        position: 'absolute', bottom: '3%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } }), 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
          background: CLAUDE.PAGE, padding: '2px 12px', borderRadius: 3,
        }}>
          Grid becomes rhythm.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── B12 Glitch Slices ─────────────────────────────────────────────────────────
const GlitchSlices: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const GLITCH_START = 15;
  const GLITCH_END = GLITCH_START + 8;
  const isGlitching = frame >= GLITCH_START && frame < GLITCH_END;

  // Seed deterministic pseudo-random from frame
  const seed = frame * 1337;
  const pseudo = (n: number) => ((seed * (n + 1) * 2654435761) & 0xffffffff) / 0xffffffff;

  const size = 0.65;
  const w = LOGO_W * size;
  const h = LOGO_H * size;
  const slices = 6;
  const sliceH = h / slices;

  const entryS = spring({ frame, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } });

  return (
    <TechniqueBeat label="Glitch Slices" sparkLine="Aggressive, then gone.">
      <div style={{ opacity: clamp(entryS, 0, 1) }}>
        {isGlitching ? (
          // Glitch: each slice offset independently
          <svg width={w} height={h} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} style={{ display: 'block' }}>
            {Array.from({ length: slices }, (_, i) => {
              const offsetX = (pseudo(i * 3 + frame) - 0.5) * 30;
              const offsetY = 0;
              const clipY = (i / slices) * LOGO_H;
              const clipH = LOGO_H / slices;
              const hueShift = pseudo(i + frame * 2) > 0.8 ? CLAUDE.SPARK : '#171717';
              return (
                <g key={i} style={{ transform: `translateX(${offsetX}px)` }}>
                  <clipPath id={`slice-${i}`}>
                    <rect x={0} y={clipY} width={LOGO_W} height={clipH} />
                  </clipPath>
                  <g clipPath={`url(#slice-${i})`}>
                    <path d={P1} fill={hueShift} />
                    <path d={P2} fill={hueShift} />
                  </g>
                </g>
              );
            })}
          </svg>
        ) : (
          <HMark size={size} />
        )}
      </div>
    </TechniqueBeat>
  );
};

// ── B13 Trail Echo ────────────────────────────────────────────────────────────
const TrailEcho: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  // Mark slides left-to-right; trail copies follow
  const TRAVEL = 240; // px slide distance
  const slideP = interpolate(frame, [0, durationInFrames * 0.7], [0, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
    easing: (t) => t * t * (3 - 2 * t), // smoothstep
  });
  const x = interpolate(slideP, [0, 1], [-TRAVEL / 2, TRAVEL / 2]);
  const size = 0.55;
  const trailCount = 5;
  const trailDelay = 4; // frames per echo

  return (
    <TechniqueBeat label="Trail Echo" sparkLine="Motion lingers.">
      <div style={{ position: 'relative', width: LOGO_W * size + TRAVEL, height: LOGO_H * size }}>
        {Array.from({ length: trailCount }, (_, i) => {
          const trailFrame = Math.max(0, frame - (i + 1) * trailDelay);
          const trailSlideP = interpolate(trailFrame, [0, durationInFrames * 0.7], [0, 1], {
            extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
            easing: (t) => t * t * (3 - 2 * t),
          });
          const tx = interpolate(trailSlideP, [0, 1], [-TRAVEL / 2, TRAVEL / 2]);
          const trailOpacity = (1 - i / trailCount) * 0.25;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: tx + TRAVEL / 2,
              top: 0,
              opacity: trailOpacity,
            }}>
              <HMark size={size} />
            </div>
          );
        })}
        {/* Main mark */}
        <div style={{ position: 'absolute', left: x + TRAVEL / 2, top: 0 }}>
          <HMark size={size} />
        </div>
      </div>
    </TechniqueBeat>
  );
};

// ── B14 Noise Wobble ──────────────────────────────────────────────────────────
const NoiseWobble: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  // Entry spring, then settle amplitude decays
  const entryS = spring({ frame, fps, config: { damping: 24, stiffness: 110, mass: 1 } });
  // Wobble amplitude decays over the beat
  const wobbleAmp = interpolate(frame, [0, durationInFrames * 0.9], [8, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });
  const wobbleX = Math.sin(frame * 0.47) * wobbleAmp;
  const wobbleY = Math.sin(frame * 0.31 + 1.2) * wobbleAmp * 0.6;
  const wobbleRot = Math.sin(frame * 0.23) * wobbleAmp * 0.3;
  const size = 0.65;
  return (
    <TechniqueBeat label="Noise Wobble" sparkLine="Alive or anxious?">
      <div style={{
        transform: `translate(${wobbleX}px, ${wobbleY}px) rotate(${wobbleRot}deg)`,
        opacity: clamp(entryS, 0, 1),
      }}>
        <HMark size={size} />
      </div>
    </TechniqueBeat>
  );
};

// ── B15 Elastic Physics ───────────────────────────────────────────────────────
const ElasticPhysics: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  // Drop from above, squash on landing
  const dropS = spring({ frame, fps, config: { damping: 10, stiffness: 180, mass: 1.2 } });
  // Drop from -250px to 0 (clamp spring to [0,2] for the translateY only)
  const dropY = interpolate(clamp(dropS, 0, 2), [0, 1], [-250, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });
  // Squash on landing: frame-based burst at contact time (around frame 10 for these params)
  const LAND = 12;
  const squashBurst = Math.max(0, Math.sin(Math.PI * clamp((frame - LAND) / 10, 0, 1)));
  const squashX = 1 + squashBurst * 0.28;
  const squashY = 1 - squashBurst * 0.22;
  const size = 0.65;
  return (
    <TechniqueBeat label="Elastic Physics" sparkLine="Hits the floor.">
      <div style={{
        transform: `translateY(${dropY}px) scaleX(${squashX}) scaleY(${squashY})`,
        transformOrigin: 'bottom center',
        opacity: clamp(dropS * 1.5, 0, 1),
      }}>
        <HMark size={size} />
      </div>
    </TechniqueBeat>
  );
};

// ── B16 Orbit Parts ───────────────────────────────────────────────────────────
const OrbitParts: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  // Phase 1: separate (0 → 35%) | Phase 2: orbit (35% → 75%) | Phase 3: reunite (75% → 100%)
  const separateP = clamp(frame / (durationInFrames * 0.35), 0, 1);
  const orbitP    = clamp((frame - durationInFrames * 0.35) / (durationInFrames * 0.40), 0, 1);
  const reuniteS  = spring({
    frame: Math.max(0, frame - Math.floor(durationInFrames * 0.75)),
    fps,
    config: { damping: 20, stiffness: 180, mass: 0.8 },
  });
  const isReuniting = frame >= durationInFrames * 0.75;

  const ORBIT_R = 100;
  const angle = orbitP * Math.PI * 2;

  // Separation displacement
  const sepX1 = isReuniting ? interpolate(reuniteS, [0, 1], [-80, 0]) : separateP * -80;
  const sepX2 = isReuniting ? interpolate(reuniteS, [0, 1], [80, 0]) : separateP * 80;
  const sepY1 = 0;
  const sepY2 = 0;

  // Orbit displacement (added on top of separation)
  const orbitX1 = isReuniting ? 0 : Math.cos(angle) * ORBIT_R * separateP;
  const orbitY1 = isReuniting ? 0 : Math.sin(angle) * ORBIT_R * 0.5 * separateP;
  const orbitX2 = isReuniting ? 0 : Math.cos(angle + Math.PI) * ORBIT_R * separateP;
  const orbitY2 = isReuniting ? 0 : Math.sin(angle + Math.PI) * ORBIT_R * 0.5 * separateP;

  const size = 0.55;
  const w = LOGO_W * size;
  const h = LOGO_H * size;

  return (
    <TechniqueBeat label="Orbit Parts" sparkLine="Reunion lands with weight.">
      <div style={{ position: 'relative', width: w + 200, height: h + 100 }}>
        <svg
          width={w + 200} height={h + 100}
          viewBox={`${-100 / size} ${-50 / size} ${LOGO_W + 200 / size} ${LOGO_H + 100 / size}`}
          style={{ display: 'block' }}
        >
          <path d={P1} fill="#171717"
            transform={`translate(${sepX1 + orbitX1}, ${sepY1 + orbitY1})`}
          />
          <path d={P2} fill={CLAUDE.SPARK}
            transform={`translate(${sepX2 + orbitX2}, ${sepY2 + orbitY2})`}
          />
        </svg>
      </div>
    </TechniqueBeat>
  );
};

// ── B17 Card Flip ─────────────────────────────────────────────────────────────
const CardFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const flipS = spring({ frame, fps, config: { damping: 22, stiffness: 140, mass: 0.9 } });
  const rotY = interpolate(flipS, [0, 1], [90, 0]);
  // After flip, do a slow second rotation pass
  const holdUntil = durationInFrames * 0.5;
  const rotY2 = frame > holdUntil
    ? interpolate(frame - holdUntil, [0, durationInFrames * 0.4], [0, 360], {
        extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
      })
    : 0;
  const totalRotY = rotY + rotY2;
  // Determine which face: front (logo on cream), back (logo on cream different position)
  const showBack = totalRotY % 360 > 90 && totalRotY % 360 < 270;
  const size = 0.6;

  return (
    <TechniqueBeat label="Card Flip" sparkLine="Depth, or squash?">
      <div style={{
        width: LOGO_W * size + 80,
        height: LOGO_H * size + 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 800,
      }}>
        <div style={{
          transform: `rotateY(${totalRotY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'none',
          backfaceVisibility: 'visible',
        }}>
          <div style={{
            background: CLAUDE.CARD,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 16,
            padding: 40,
            boxShadow: '0 8px 40px rgba(61,57,41,0.14)',
          }}>
            <HMark size={size} p1Fill="#171717" p2Fill={showBack ? CLAUDE.SPARK : '#171717'} />
          </div>
        </div>
      </div>
    </TechniqueBeat>
  );
};

// ── B18 Shadow Play ───────────────────────────────────────────────────────────
const ShadowPlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entryS = spring({ frame, fps, config: { damping: 24, stiffness: 110, mass: 1 } });
  // Shadow stretches ahead then snaps back
  const SHADOW_PHASE = durationInFrames * 0.5;
  const shadowP = clamp(frame / SHADOW_PHASE, 0, 1);
  const snapP   = clamp((frame - SHADOW_PHASE) / (durationInFrames * 0.35), 0, 1);
  const shadowOffX = interpolate(shadowP, [0, 1], [0, 60]) * (1 - snapP);
  const shadowOffY = interpolate(shadowP, [0, 1], [0, 40]) * (1 - snapP);
  const shadowOpacity = interpolate(shadowP, [0, 0.3, 1], [0, 0.35, 0.18]) * (1 - snapP * 0.5);
  const size = 0.65;
  const w = LOGO_W * size;
  const h = LOGO_H * size;

  return (
    <TechniqueBeat label="Shadow Play" sparkLine="Detached, then grounded.">
      <div style={{ position: 'relative', opacity: clamp(entryS, 0, 1) }}>
        {/* Shadow — independent offset layer */}
        <div style={{
          position: 'absolute',
          left: shadowOffX,
          top: shadowOffY,
          opacity: shadowOpacity,
        }}>
          <HMark size={size} p1Fill="#171717" p2Fill="#171717" />
        </div>
        {/* Mark */}
        <HMark size={size} />
      </div>
    </TechniqueBeat>
  );
};

// ── B19 Composer Summon ───────────────────────────────────────────────────────
// The mark "sent" from the Claude composer UI; terracotta spark on send
const ComposerSummon: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  // Phase 1: composer UI with prompt typed (0 → 40%)
  // Phase 2: send flash (spark burst) + mark arrives (40% → 100%)
  const SEND_FRAME = Math.floor(durationInFrames * 0.38);
  const composerPhase = frame < SEND_FRAME;
  const typingP = clamp(frame / (SEND_FRAME * 0.8), 0, 1);
  const promptText = 'animate the HAI H-mark — spring entrance';
  const charsShown = Math.floor(typingP * promptText.length);

  const sparkBurst = interpolate(frame, [SEND_FRAME, SEND_FRAME + 8, SEND_FRAME + 18], [0, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const markArrivalS = spring({
    frame: Math.max(0, frame - SEND_FRAME - 8),
    fps, config: { damping: 20, stiffness: 160, mass: 0.8 },
  });

  const UI = 20;
  const size = 0.55;
  const blinkOn = Math.floor(frame / 10) % 2 === 0;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Technique label */}
      <div style={{
        position: 'absolute', top: '4%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(spring({ frame, fps: 30, config: { damping: 28, stiffness: 120, mass: 0.9 } }), 0, 1),
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 600, color: CLAUDE.INK }}>
          Composer Summon
        </div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
      </div>

      {/* Composer card (upper half) */}
      <div style={{
        position: 'absolute', top: '15%', left: '8%', right: '8%',
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
            width: UI * 1.4, height: UI * 1.4,
            borderRadius: UI * 0.4,
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
          position: 'absolute', top: '35%', right: '8%',
          width: 60, height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: sparkBurst,
          transform: `scale(${1 + sparkBurst * 0.8})`,
        }}>
        </div>
      )}

      {/* Mark arriving */}
      <div style={{
        position: 'absolute', top: '45%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: clamp(markArrivalS, 0, 1),
        transform: `scale(${clamp(markArrivalS, 0, 1)}) translateY(${(1 - markArrivalS) * 60}px)`,
      }}>
        <HMark size={size} />
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', bottom: '5%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(markArrivalS * 0.8, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>
          The interface is the origin.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── B20 Exit Family ───────────────────────────────────────────────────────────
const ExitFamily: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;

  // Three exits, each ~1/3 of the beat
  // Show the mark clean, then perform the exit
  const third = Math.floor(durationInFrames / 3);
  const exitIdx = Math.floor(frame / third);
  const localFrame = frame - exitIdx * third;
  const localP = localFrame / third;

  // Exit 0: shrink-spin
  // Exit 1: blur-out
  // Exit 2: mask-close
  const HOLD = third * 0.3; // show static first
  const ANIM_DUR = third - HOLD;

  const exitPhaseP = clamp((localFrame - HOLD) / ANIM_DUR, 0, 1);

  let markStyle: React.CSSProperties = {};
  let clipStyle: React.CSSProperties = {};
  const size = 0.65;

  if (exitIdx === 0) {
    // Shrink-spin
    const s = 1 - exitPhaseP;
    const rot = exitPhaseP * 360;
    markStyle = { transform: `scale(${s}) rotate(${rot}deg)`, opacity: Math.max(0, 1 - exitPhaseP * 1.5) };
  } else if (exitIdx === 1) {
    // Blur-out
    const blurV = exitPhaseP * 20;
    markStyle = { filter: `blur(${blurV}px)`, opacity: Math.max(0, 1 - exitPhaseP * 1.2) };
  } else {
    // Mask-close (iris)
    const irisR = (1 - exitPhaseP) * 200;
    clipStyle = {
      clipPath: `circle(${irisR}px at center)`,
      WebkitClipPath: `circle(${irisR}px at center)`,
    };
  }

  const exitNames = ['Shrink Spin', 'Blur Out', 'Mask Close'];
  const exitName = exitNames[Math.min(exitIdx, 2)] || 'Exit';

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Labels */}
      <div style={{
        position: 'absolute', top: '4%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 600, color: CLAUDE.INK }}>
          Exit Family
        </div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
        <div style={{
          fontFamily: SANS, fontSize: 18, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginTop: 8,
        }}>
          {exitName}
        </div>
      </div>

      {/* Mark */}
      <div style={{
        position: 'absolute', top: '15%', bottom: '15%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ ...clipStyle }}>
          <div style={{ ...markStyle }}>
            <HMark size={size} />
          </div>
        </div>
      </div>

      {/* Exit counter dots */}
      <div style={{
        position: 'absolute', bottom: '10%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: 5,
            background: i <= exitIdx ? CLAUDE.SPARK : CLAUDE.BORDER,
          }} />
        ))}
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', bottom: '4%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK }}>
          Exits are underrated.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── Timing ────────────────────────────────────────────────────────────────────
const TIMED = TIMING.map((t) => ({ ...t }));
export const TOTAL_FRAMES = TIMED.reduce((a, b) => a + b.frames, 0);

// ── Main composition ──────────────────────────────────────────────────────────
export const HLogoRemotionShowcase: React.FC = () => {
  let at = 0;

  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;

    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Ciao, Liam',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Animate the HAI H-mark every way Remotion knows. Show me which techniques deserve to live.',
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
      case 'B04': content = <PerPathStagger />; break;
      case 'B05': content = <MaskReveal />; break;
      case 'B06': content = <ScaleZoom />; break;
      case 'B07': content = <Rotation />; break;
      case 'B08': content = <SkewAndShear />; break;
      case 'B09': content = <OpacityThroughBlur />; break;
      case 'B10': content = <ColorInterpolation />; break;
      case 'B11': content = <KineticGrid />; break;
      case 'B12': content = <GlitchSlices />; break;
      case 'B13': content = <TrailEcho />; break;
      case 'B14': content = <NoiseWobble />; break;
      case 'B15': content = <ElasticPhysics />; break;
      case 'B16': content = <OrbitParts />; break;
      case 'B17': content = <CardFlip />; break;
      case 'B18': content = <ShadowPlay />; break;
      case 'B19': content = <ComposerSummon />; break;
      case 'B20': content = <ExitFamily />; break;

      case 'B21':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Your turn.',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Take my logo SVG. Run it through spring entrance, draw-on stroke, and orbit parts. For each: show me a 6-second Remotion composition with the full motion, then mark it keep or kill.',
            runningText: 'paste this into Claude…',
            folderLabel: FOLDER,
          })} />
        );
        break;

      case 'B22':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: 'Every Remotion move, one logo.',
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
