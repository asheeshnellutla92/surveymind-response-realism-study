/**
 * MusiniqueLogo2RemotionShowcase — every Remotion move, one logo.
 *
 * claude-liam channel · @NikBearBrown · Kokoro am_onyx · Teardown register
 * Subject: the Musinique logo-2 mark (logos/musinique-logo-2.svg)
 *   viewBox 0 0 2048 2048, square format, 1 complex <path> fill="black" + white <rect>
 * Palette: CLAUDE fidelity (cream PAGE, warm INK, terracotta SPARK one-per-beat)
 * Format: 1080×1920 portrait (9:16), 30 fps
 *
 * B00  ClaudeComposerAsk cold open (Liam intro)
 * B01  Spring Entrance
 * B02  Overshoot Spring (squash-and-stretch on landing)
 * B03  Draw-On Stroke (evolvePath trace then fill)
 * B04  Mask Reveal (linear wipe + radial iris)
 * B05  Scale Zoom (linear vs bezier)
 * B06  Rotation (pivot entrance + slow hold)
 * B07  Skew And Shear
 * B08  Opacity Through Blur
 * B09  Color Interpolation (treatment beat)
 * B10  Kinetic Grid (tiled staggered ripple)
 * B11  Glitch Slices
 * B12  Trail Echo
 * B13  Noise Wobble
 * B14  Elastic Physics
 * B15  Card Flip (perspective rotateY)
 * B16  Shadow Play
 * B17  Composer Summon (terracotta spark on send)
 * B18  Stroke Pulse (dashoffset heartbeat)
 * B19  Scale Breathe (subtle continuous oscillation)
 * B20  Exit Family (shrink-spin, blur-out, mask-close)
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
import TIMING from './musinique-logo-2-remotion-showcase-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

// ── Brand constants ───────────────────────────────────────────────────────────
const SERIF  = CLAUDE_FONT.serif;
const SANS   = CLAUDE_FONT.ui;
const FOLDER = '@NikBearBrown';
const TOPIC  = 'REMOTION · MOTION TECHNIQUES';
const SEGMENT = 'Musinique Logo Techniques';

// ── Logo mark ─────────────────────────────────────────────────────────────────
// Musinique logo-2: viewBox 0 0 2048 2048, square, 1 complex path fill="black"
// The square viewBox fits naturally in 9:16 with space above and below.
// NOTE: The path is 100k chars; evolvePath (Draw-On) works but is compute-heavy.
import { MUSINIQUE_LOGO_2_PATH as LOGO_PATH } from './musinique-logo-2-path';

// ── Shared helpers ─────────────────────────────────────────────────────────────
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// The mark as an SVG — renders at given size (pixels for the SVG element)
// markSize: pixel dimension of the rendered SVG element (square)
interface MarkProps {
  markSize?: number;
  fill?: string;
  opacity?: number;
  style?: React.CSSProperties;
  pathStyle?: React.CSSProperties;
}

const MusiniqueMark: React.FC<MarkProps> = ({
  markSize = 480,
  fill = CLAUDE.INK,
  opacity = 1,
  style = {},
  pathStyle = {},
}) => (
  <svg
    width={markSize}
    height={markSize}
    viewBox="0 0 2048 2048"
    style={{ display: 'block', overflow: 'visible', ...style }}
  >
    <path
      d={LOGO_PATH}
      fill={fill}
      opacity={opacity}
      style={pathStyle}
    />
  </svg>
);

// ── Spark icon ────────────────────────────────────────────────────────────────

// ── Technique beat wrapper ─────────────────────────────────────────────────────
// Cream bg, centered mark area (top 12% label, bottom 10% spark line)
interface TechniqueBeatProps {
  label: string;
  sparkLine: string;
  children: React.ReactNode;
  accentColor?: string;
}

const TechniqueBeat: React.FC<TechniqueBeatProps> = ({
  label, sparkLine, children, accentColor = CLAUDE.SPARK,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Segment label */}
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
          fontSize: 40,
          fontWeight: 600,
          color: CLAUDE.INK,
          letterSpacing: '-0.01em',
          textAlign: 'center',
        }}>
          {label}
        </div>
        <div style={{ width: 48, height: 2, background: accentColor, marginTop: 6 }} />
      </div>

      {/* Mark stage — centered in middle 78% */}
      <div style={{
        position: 'absolute',
        top: '13%', bottom: '13%',
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
        bottom: '4%',
        left: 0, right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
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
  return (
    <TechniqueBeat label="Spring Entrance" sparkLine="Weight, or cheap?">
      <div style={{ transform: `scale(${s})`, opacity: s }}>
        <MusiniqueMark markSize={480} />
      </div>
    </TechniqueBeat>
  );
};

// ── B02 Overshoot Spring ──────────────────────────────────────────────────────
const OvershootSpring: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const s = spring({ frame, fps, config: { damping: 7, stiffness: 240, mass: 0.5 } });
  const entryFrames = 18;
  const squashPhase = Math.max(0, Math.sin(Math.PI * clamp(frame / entryFrames, 0, 1)));
  const scaleX = clamp(s, 0, 2) + squashPhase * 0.30;
  const scaleY = clamp(s, 0, 2) - squashPhase * 0.24;
  return (
    <TechniqueBeat label="Overshoot Spring" sparkLine="Physical, or noise?">
      <div style={{
        transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
        transformOrigin: 'bottom center',
        opacity: clamp(s * 2, 0, 1),
      }}>
        <MusiniqueMark markSize={480} />
      </div>
    </TechniqueBeat>
  );
};

// ── B03 Draw-On Stroke ────────────────────────────────────────────────────────
// evolvePath traces the complex path; fill floods in after stroke completes
const DrawOnStroke: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Stroke trace: 0 → 0.6 of beat; fill flood: 0.6 → 1.0
  const rawP = clamp(frame / (durationInFrames * 0.85), 0, 1);
  const strokeProgress = Math.min(1, rawP * (1 / 0.6));
  const fillOpacity = Math.max(0, (rawP - 0.6) * (1 / 0.4));
  const strokeFade = strokeProgress < 1 ? 1 : Math.max(0, 1 - (rawP - 0.6) * 4);

  const evolved = evolvePath(clamp(strokeProgress, 0, 1), LOGO_PATH);

  return (
    <TechniqueBeat label="Draw-On Stroke" sparkLine="Pen, or loading bar?">
      <svg
        width={480}
        height={480}
        viewBox="0 0 2048 2048"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Fill floods in */}
        <path d={LOGO_PATH} fill={CLAUDE.INK} opacity={fillOpacity} />
        {/* Stroke trace */}
        <path
          d={LOGO_PATH}
          fill="none"
          stroke={CLAUDE.SPARK}
          strokeWidth={8}
          strokeDasharray={evolved.strokeDasharray}
          strokeDashoffset={evolved.strokeDashoffset}
          strokeLinecap="round"
          opacity={strokeFade}
        />
      </svg>
    </TechniqueBeat>
  );
};

// ── B04 Mask Reveal ───────────────────────────────────────────────────────────
const MaskReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const wipeP = clamp(frame / (durationInFrames * 0.48), 0, 1);
  const irisP = clamp((frame - durationInFrames * 0.5) / (durationInFrames * 0.42), 0, 1);
  const useRadial = wipeP >= 1;
  const maxR = Math.sqrt(1024 * 1024 + 1024 * 1024) * 1.15;

  return (
    <TechniqueBeat label="Mask Reveal" sparkLine="The world opens.">
      <svg
        width={480}
        height={480}
        viewBox="0 0 2048 2048"
        style={{ display: 'block' }}
      >
        <defs>
          <clipPath id="ml2-clip-wipe">
            <rect x={0} y={0} width={2048 * wipeP} height={2048} />
          </clipPath>
          <clipPath id="ml2-clip-iris">
            <circle cx={1024} cy={1024} r={maxR * irisP} />
          </clipPath>
        </defs>
        <g clipPath={useRadial ? 'url(#ml2-clip-iris)' : 'url(#ml2-clip-wipe)'}>
          <path d={LOGO_PATH} fill={CLAUDE.INK} />
        </g>
      </svg>
    </TechniqueBeat>
  );
};

// ── B05 Scale Zoom ────────────────────────────────────────────────────────────
const ScaleZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const halfFrames = durationInFrames * 0.5;
  const isLinear = frame < halfFrames;
  const scale = isLinear
    ? interpolate(frame, [0, halfFrames], [7, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })
    : interpolate(frame, [halfFrames, durationInFrames * 0.9], [7, 1], {
        extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
        easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      });
  return (
    <TechniqueBeat label="Scale Zoom" sparkLine="Bezier earns it.">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <MusiniqueMark markSize={480} fill={isLinear ? CLAUDE.INK_SOFT : CLAUDE.INK} />
      </div>
    </TechniqueBeat>
  );
};

// ── B06 Rotation ──────────────────────────────────────────────────────────────
const Rotation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entranceFrames = fps * 1.4;
  const entranceRot = spring({ frame, fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });
  const pivotAngle = interpolate(1 - entranceRot, [0, 1], [0, -45]);
  const continuousAngle = frame > entranceFrames
    ? interpolate(frame - entranceFrames, [0, durationInFrames - entranceFrames], [0, 160])
    : 0;
  return (
    <TechniqueBeat label="Rotation" sparkLine="Meditative or lazy?">
      <div style={{
        transform: `rotate(${pivotAngle + continuousAngle}deg)`,
        opacity: clamp(entranceRot, 0, 1),
      }}>
        <MusiniqueMark markSize={480} />
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
  const holdUntil = durationInFrames * 0.58;
  const releaseP = clamp((frame - holdUntil) / (durationInFrames * 0.32), 0, 1);
  const skewAngle = interpolate(leanIn, [0, 1], [0, 16]) * (1 - releaseP);
  return (
    <TechniqueBeat label="Skew And Shear" sparkLine="Tension, or wobble?">
      <div style={{
        transform: `skewX(${skewAngle}deg)`,
        opacity: clamp(leanIn, 0, 1),
      }}>
        <MusiniqueMark markSize={480} />
      </div>
    </TechniqueBeat>
  );
};

// ── B08 Opacity Through Blur ──────────────────────────────────────────────────
const OpacityThroughBlur: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const s = spring({ frame, fps, config: { damping: 26, stiffness: 90, mass: 1.2 } });
  const blur = interpolate(s, [0, 1], [20, 0]);
  return (
    <TechniqueBeat label="Opacity Through Blur" sparkLine="Arrives out of focus.">
      <div style={{ opacity: clamp(s, 0, 1), filter: `blur(${blur}px)` }}>
        <MusiniqueMark markSize={480} />
      </div>
    </TechniqueBeat>
  );
};

// ── B09 Color Interpolation (treatment beat) ──────────────────────────────────
const ColorInterpolation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const t = frame / durationInFrames;
  const fillColor = t < 0.5
    ? interpolateColors(t * 2, [0, 1], [CLAUDE.INK, CLAUDE.SPARK])
    : interpolateColors((t - 0.5) * 2, [0, 1], [CLAUDE.SPARK, CLAUDE.INK]);
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '5%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(labelIn, 0, 1),
        transform: `translateY(${(1 - labelIn) * 8}px)`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, color: CLAUDE.INK }}>
          Color Interpolation
        </div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
        <div style={{
          fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginTop: 8,
        }}>
          Color Treatment Beat
        </div>
      </div>
      <div style={{
        position: 'absolute', top: '13%', bottom: '13%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <MusiniqueMark markSize={480} fill={fillColor} />
      </div>
      <div style={{
        position: 'absolute', bottom: '4%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>
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
  const cols = 3;
  const rows = 4;
  const cellW = 1080 / cols;
  const cellH = 1920 / rows;
  const tileSize = Math.min(cellW, cellH) * 0.72;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const delay = (row * cols + col) * 4;
          const s = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 130, mass: 0.9 } });
          const rippleOffset = Math.sin((frame - delay) / 9) * 4;
          const scale = clamp(s, 0, 1);
          return (
            <div key={`${row}-${col}`} style={{
              position: 'absolute',
              left: col * cellW + cellW / 2,
              top: row * cellH + cellH / 2,
              transform: `translate(-50%, -50%) scale(${scale}) translateY(${rippleOffset}px)`,
              opacity: clamp(s * 1.2, 0, 1),
            }}>
              <MusiniqueMark markSize={tileSize} />
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
          fontFamily: SERIF, fontSize: 36, fontWeight: 600, color: CLAUDE.INK,
          background: CLAUDE.PAGE, padding: '4px 20px', borderRadius: 4, opacity: 0.94,
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

// ── B11 Glitch Slices ─────────────────────────────────────────────────────────
const GlitchSlices: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const GLITCH_START = 14;
  const GLITCH_END = GLITCH_START + 8;
  const isGlitching = frame >= GLITCH_START && frame < GLITCH_END;
  const seed = frame * 1337;
  const pseudo = (n: number) => ((seed * (n + 1) * 2654435761) & 0xffffffff) / 0xffffffff;
  const slices = 7;
  const entryS = spring({ frame, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } });

  return (
    <TechniqueBeat label="Glitch Slices" sparkLine="Aggressive, then gone.">
      <div style={{ opacity: clamp(entryS, 0, 1) }}>
        {isGlitching ? (
          <svg width={480} height={480} viewBox="0 0 2048 2048" style={{ display: 'block' }}>
            {Array.from({ length: slices }, (_, i) => {
              const offsetX = (pseudo(i * 3 + frame) - 0.5) * 40;
              const clipY = (i / slices) * 2048;
              const clipH = 2048 / slices;
              const hueShift = pseudo(i + frame * 2) > 0.82 ? CLAUDE.SPARK : CLAUDE.INK;
              return (
                <g key={i} style={{ transform: `translateX(${offsetX}px)` }}>
                  <defs>
                    <clipPath id={`ml2-slice-${i}`}>
                      <rect x={0} y={clipY} width={2048} height={clipH} />
                    </clipPath>
                  </defs>
                  <g clipPath={`url(#ml2-slice-${i})`}>
                    <path d={LOGO_PATH} fill={hueShift} />
                  </g>
                </g>
              );
            })}
          </svg>
        ) : (
          <MusiniqueMark markSize={480} />
        )}
      </div>
    </TechniqueBeat>
  );
};

// ── B12 Trail Echo ────────────────────────────────────────────────────────────
const TrailEcho: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const TRAVEL = 300;
  const slideP = interpolate(frame, [0, durationInFrames * 0.7], [0, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
    easing: (t) => t * t * (3 - 2 * t),
  });
  const x = interpolate(slideP, [0, 1], [-TRAVEL / 2, TRAVEL / 2]);
  const trailCount = 5;
  const trailDelay = 5;

  return (
    <TechniqueBeat label="Trail Echo" sparkLine="Motion lingers.">
      <div style={{ position: 'relative', width: 480 + TRAVEL, height: 480 }}>
        {Array.from({ length: trailCount }, (_, i) => {
          const tf = Math.max(0, frame - (i + 1) * trailDelay);
          const tP = interpolate(tf, [0, durationInFrames * 0.7], [0, 1], {
            extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
            easing: (t) => t * t * (3 - 2 * t),
          });
          const tx = interpolate(tP, [0, 1], [-TRAVEL / 2, TRAVEL / 2]);
          return (
            <div key={i} style={{
              position: 'absolute',
              left: tx + TRAVEL / 2,
              top: 0,
              opacity: (1 - i / trailCount) * 0.22,
            }}>
              <MusiniqueMark markSize={480} />
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: x + TRAVEL / 2, top: 0 }}>
          <MusiniqueMark markSize={480} />
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
  const wobbleAmp = interpolate(frame, [0, durationInFrames * 0.9], [10, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });
  const wx = Math.sin(frame * 0.47) * wobbleAmp;
  const wy = Math.sin(frame * 0.31 + 1.2) * wobbleAmp * 0.6;
  const wrot = Math.sin(frame * 0.23) * wobbleAmp * 0.35;
  return (
    <TechniqueBeat label="Noise Wobble" sparkLine="Alive or anxious?">
      <div style={{
        transform: `translate(${wx}px, ${wy}px) rotate(${wrot}deg)`,
        opacity: clamp(entryS, 0, 1),
      }}>
        <MusiniqueMark markSize={480} />
      </div>
    </TechniqueBeat>
  );
};

// ── B14 Elastic Physics ───────────────────────────────────────────────────────
const ElasticPhysics: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const dropS = spring({ frame, fps, config: { damping: 9, stiffness: 190, mass: 1.1 } });
  const dropY = interpolate(clamp(dropS, 0, 2), [0, 1], [-280, 0], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });
  const LAND = 11;
  const squashBurst = Math.max(0, Math.sin(Math.PI * clamp((frame - LAND) / 10, 0, 1)));
  const squashX = 1 + squashBurst * 0.30;
  const squashY = 1 - squashBurst * 0.24;
  return (
    <TechniqueBeat label="Elastic Physics" sparkLine="Hits the floor.">
      <div style={{
        transform: `translateY(${dropY}px) scaleX(${squashX}) scaleY(${squashY})`,
        transformOrigin: 'bottom center',
        opacity: clamp(dropS * 1.5, 0, 1),
      }}>
        <MusiniqueMark markSize={480} />
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
  const rotY2 = frame > holdUntil
    ? interpolate(frame - holdUntil, [0, durationInFrames * 0.42], [0, 360], {
        extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
      })
    : 0;
  const totalRotY = rotY + rotY2;
  const showBack = (totalRotY % 360) > 90 && (totalRotY % 360) < 270;

  return (
    <TechniqueBeat label="Card Flip" sparkLine="Depth, or squash?">
      <div style={{
        width: 540, height: 540,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 900,
      }}>
        <div style={{
          transform: `rotateY(${totalRotY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'none',
        }}>
          <div style={{
            background: CLAUDE.CARD,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 18,
            padding: 30,
            boxShadow: '0 8px 40px rgba(61,57,41,0.14)',
          }}>
            <MusiniqueMark markSize={420} fill={showBack ? CLAUDE.SPARK : CLAUDE.INK} />
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
  const snapP = clamp((frame - SHADOW_PHASE) / (durationInFrames * 0.35), 0, 1);
  const shadowOffX = interpolate(shadowP, [0, 1], [0, 55]) * (1 - snapP);
  const shadowOffY = interpolate(shadowP, [0, 1], [0, 38]) * (1 - snapP);
  const shadowOpacity = interpolate(shadowP, [0, 0.3, 1], [0, 0.32, 0.16]) * (1 - snapP * 0.5);

  return (
    <TechniqueBeat label="Shadow Play" sparkLine="Detached, then grounded.">
      <div style={{ position: 'relative', opacity: clamp(entryS, 0, 1) }}>
        <div style={{
          position: 'absolute',
          left: shadowOffX, top: shadowOffY,
          opacity: shadowOpacity,
        }}>
          <MusiniqueMark markSize={480} />
        </div>
        <MusiniqueMark markSize={480} />
      </div>
    </TechniqueBeat>
  );
};

// ── B17 Composer Summon ───────────────────────────────────────────────────────
const ComposerSummon: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const SEND_FRAME = Math.floor(durationInFrames * 0.38);
  const typingP = clamp(frame / (SEND_FRAME * 0.8), 0, 1);
  const promptText = 'animate the Musinique logo — spring entrance';
  const charsShown = Math.floor(typingP * promptText.length);
  const sparkBurst = interpolate(frame, [SEND_FRAME, SEND_FRAME + 8, SEND_FRAME + 18], [0, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const markArrivalS = spring({
    frame: Math.max(0, frame - SEND_FRAME - 8),
    fps, config: { damping: 20, stiffness: 160, mass: 0.8 },
  });
  const UI = 20;
  const blinkOn = Math.floor(frame / 10) % 2 === 0;
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '4%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: clamp(labelIn, 0, 1),
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, color: CLAUDE.INK }}>
          Composer Summon
        </div>
        <div style={{ width: 48, height: 2, background: CLAUDE.SPARK, marginTop: 6 }} />
      </div>

      {/* Composer card */}
      <div style={{
        position: 'absolute', top: '14%', left: '8%', right: '8%',
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: UI * 1.2,
        boxShadow: '0 6px 32px rgba(61,57,41,0.08)',
        padding: `${UI * 0.8}px ${UI * 1.0}px`,
        fontFamily: CLAUDE_FONT.ui,
      }}>
        <div style={{ minHeight: UI * 2.5, fontSize: UI, lineHeight: 1.45, color: CLAUDE.INK }}>
          {charsShown < promptText.length ? (
            <>
              {promptText.slice(0, charsShown)}
              <span style={{
                display: blinkOn ? 'inline-block' : 'none',
                width: 2, height: UI, background: CLAUDE.INK,
                verticalAlign: 'text-bottom', marginLeft: 1,
              }} />
            </>
          ) : promptText}
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
          position: 'absolute', top: '34%', right: '8%',
          width: 60, height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: sparkBurst,
          transform: `scale(${1 + sparkBurst * 0.8})`,
        }}>
        </div>
      )}

      {/* Mark arriving */}
      <div style={{
        position: 'absolute', top: '42%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: clamp(markArrivalS, 0, 1),
        transform: `scale(${clamp(markArrivalS, 0, 1)}) translateY(${(1 - markArrivalS) * 70}px)`,
      }}>
        <MusiniqueMark markSize={380} />
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', bottom: '4%', left: 0, right: 0,
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

// ── B18 Stroke Pulse ──────────────────────────────────────────────────────────
// dashoffset cycles: the path appears to "breathe" with a heartbeat rhythm
const StrokePulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entryS = spring({ frame, fps, config: { damping: 24, stiffness: 120, mass: 0.9 } });
  // Stroke dash cycle: period ~24 frames (2.5 bpm-ish)
  const CYCLE = 24;
  const dashLength = 120;
  const gapLength = 80;
  const dashOffset = (frame % CYCLE) * ((dashLength + gapLength) / CYCLE);
  // Pulse scale: subtle throb at every cycle
  const pulseScale = 1 + Math.sin((frame / CYCLE) * Math.PI * 2) * 0.025;

  return (
    <TechniqueBeat label="Stroke Pulse" sparkLine="Alive, not rendered." accentColor={CLAUDE.SPARK}>
      <div style={{
        opacity: clamp(entryS, 0, 1),
        transform: `scale(${pulseScale})`,
      }}>
        <svg width={480} height={480} viewBox="0 0 2048 2048" style={{ display: 'block' }}>
          {/* Filled mark underneath */}
          <path d={LOGO_PATH} fill={CLAUDE.INK} opacity={0.18} />
          {/* Pulsing stroke overlay */}
          <path
            d={LOGO_PATH}
            fill="none"
            stroke={CLAUDE.SPARK}
            strokeWidth={10}
            strokeDasharray={`${dashLength} ${gapLength}`}
            strokeDashoffset={-dashOffset}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </TechniqueBeat>
  );
};

// ── B19 Scale Breathe ─────────────────────────────────────────────────────────
// Continuous very-slow scale oscillation — barely perceptible, never still
const ScaleBreathe: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const entryS = spring({ frame, fps, config: { damping: 28, stiffness: 80, mass: 1.5 } });
  // Very slow: period ~4 seconds (120 frames)
  const breatheScale = 1 + Math.sin((frame / 120) * Math.PI * 2) * 0.04;

  return (
    <TechniqueBeat label="Scale Breathe" sparkLine="Never still.">
      <div style={{
        opacity: clamp(entryS, 0, 1),
        transform: `scale(${breatheScale})`,
        transformOrigin: 'center center',
      }}>
        <MusiniqueMark markSize={480} />
      </div>
    </TechniqueBeat>
  );
};

// ── B20 Exit Family ───────────────────────────────────────────────────────────
const ExitFamily: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fps = 30;
  const third = Math.floor(durationInFrames / 3);
  const exitIdx = Math.min(2, Math.floor(frame / third));
  const localFrame = frame - exitIdx * third;
  const HOLD = third * 0.28;
  const ANIM_DUR = third - HOLD;
  const exitPhaseP = clamp((localFrame - HOLD) / ANIM_DUR, 0, 1);

  let markStyle: React.CSSProperties = {};
  let clipStyle: React.CSSProperties = {};

  if (exitIdx === 0) {
    const s = 1 - exitPhaseP;
    const rot = exitPhaseP * 360;
    markStyle = { transform: `scale(${s}) rotate(${rot}deg)`, opacity: Math.max(0, 1 - exitPhaseP * 1.5) };
  } else if (exitIdx === 1) {
    const blurV = exitPhaseP * 22;
    markStyle = { filter: `blur(${blurV}px)`, opacity: Math.max(0, 1 - exitPhaseP * 1.2) };
  } else {
    const irisR = (1 - exitPhaseP) * 250;
    clipStyle = { clipPath: `circle(${irisR}px at center)`, WebkitClipPath: `circle(${irisR}px at center)` };
  }

  const exitNames = ['Shrink Spin', 'Blur Out', 'Mask Close'];
  const exitName = exitNames[exitIdx] || 'Exit';

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '4%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 600, color: CLAUDE.INK }}>
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

      <div style={{
        position: 'absolute', top: '13%', bottom: '13%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ ...clipStyle }}>
          <div style={{ ...markStyle }}>
            <MusiniqueMark markSize={480} />
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
            width: 10, height: 10, borderRadius: 5,
            background: i <= exitIdx ? CLAUDE.SPARK : CLAUDE.BORDER,
          }} />
        ))}
      </div>

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

// ── Timing ─────────────────────────────────────────────────────────────────────
const TIMED = TIMING.map((t) => ({ ...t }));
export const TOTAL_FRAMES = TIMED.reduce((a, b) => a + b.frames, 0);

// ── Main composition ───────────────────────────────────────────────────────────
export const MusiniqueLogo2RemotionShowcase: React.FC = () => {
  let at = 0;

  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;

    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Selam, Liam',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Animate the Musinique logo every way Remotion knows. Show me which techniques deserve to live.',
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
            command: 'Take my logo SVG. Run it through spring entrance, draw-on stroke, and the exit family. For each: build a 6-second Remotion composition with the full motion, then mark it keep or kill.',
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
