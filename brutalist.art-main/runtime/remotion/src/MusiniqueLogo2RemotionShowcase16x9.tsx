/**
 * MusiniqueLogo2RemotionShowcase16x9 — claude-liam · 1920×1080 · 30fps
 * One SVG logo mark. Every motion technique Remotion knows.
 *
 * Mark: musinique-logo-2.svg — viewBox 0 0 2048 2048, square format,
 * 73 subpaths, fill=black on white rect. No live text — all paths.
 *
 * Palette: CLAUDE fidelity brand (cream #FAF9F5, ink #3D3929, terracotta #D97757)
 * Voice:   Liam (am_onyx, Kokoro, in for Bear)
 * Channel: @NikBearBrown
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
} from 'remotion';
import TIMING from './musinique-logo-2-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';
import { MUSINIQUE_LOGO_2_PATH } from './musinique-logo-2-path';

// ── Brand constants ───────────────────────────────────────────────────────────
const PAGE  = CLAUDE.PAGE;   // #FAF9F5
const INK   = CLAUDE.INK;    // #3D3929
const SPARK = CLAUDE.SPARK;  // #D97757
const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;

const TOPIC   = 'DESIGN · MOTION';
const SEGMENT = 'Logo Mark Techniques';
const FOLDER  = '@NikBearBrown';

// ── Utility ───────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const iclamp = (v: number, i: [number, number], o: [number, number]) =>
  clamp(interpolate(v, i, o), Math.min(o[0], o[1]), Math.max(o[0], o[1]));

// ── The logo mark SVG — inline, centered on cream stage ──────────────────────
// viewBox 0 0 2048 2048 — square mark. On a 1920x1080 canvas we center it
// at 480px wide (25% of width) so there's generous horizontal space.
// The horizontal space is exploited in layout-aware beats.
const MARK_SIZE = 480; // px — centered mark size

const LogoMark: React.FC<{
  fill?: string;
  opacity?: number;
  style?: React.CSSProperties;
  size?: number;
}> = ({ fill = INK, opacity = 1, style = {}, size = MARK_SIZE }) => (
  <svg
    viewBox="0 0 2048 2048"
    width={size}
    height={size}
    style={{ display: 'block', opacity, ...style }}
    preserveAspectRatio="xMidYMid meet"
  >
    <path d={MUSINIQUE_LOGO_2_PATH} fill={fill} />
  </svg>
);

// ── Technique label overlay (top-center) ──────────────────────────────────────
const TechLabel: React.FC<{ name: string; sub?: string; progress?: number }> = ({
  name, sub, progress = 1,
}) => {
  const o = clamp(progress, 0, 1);
  return (
    <div style={{
      position: 'absolute', top: '7%', left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 6, pointerEvents: 'none', opacity: o,
      transform: `translateY(${(1 - o) * -12}px)`,
    }}>
      <div style={{
        fontFamily: SERIF, fontSize: 36, fontWeight: 600,
        color: INK, letterSpacing: '-0.01em', textAlign: 'center',
      }}>{name}</div>
      {/* Terracotta underline — the ONE accent */}
      <div style={{ width: 48, height: 2.5, background: SPARK, borderRadius: 2 }} />
      {sub && <div style={{
        fontFamily: SANS, fontSize: 17, color: CLAUDE.INK_SOFT,
        letterSpacing: 1, textTransform: 'uppercase' as const, marginTop: 2,
      }}>{sub}</div>}
    </div>
  );
};

// ── Spark rule (bottom-left) ───────────────────────────────────────────────────
const SparkRule: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{
    position: 'absolute', bottom: '8%', left: '5%',
    width: 60, height: 2, background: SPARK, opacity,
  }} />
);

// ═══════════════════════════════════════════════════════════════════════════════
// BEAT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── B01: Spring Entrance ──────────────────────────────────────────────────────
const B01_SpringEntrance: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const DROP_START = 15;
  const arrive = spring({
    frame: frame - DROP_START,
    fps,
    config: { damping: 20, stiffness: 160, mass: 1.0 },
  });

  const ty = (1 - clamp(arrive, 0, 1)) * -300;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Spring Entrance" sub="Standard spring · damping 20" progress={labelIn} />
      <div style={{
        transform: `translateY(${ty}px)`,
        opacity: clamp(arrive * 2, 0, 1),
      }}>
        <LogoMark />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B02: Overshoot Spring — squash-and-stretch ────────────────────────────────
const B02_OvershootSpring: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const DROP_START = 15;
  const elastic = spring({
    frame: frame - DROP_START,
    fps,
    config: { damping: 5, stiffness: 220, mass: 1.2 },
  });

  const ty = (1 - clamp(elastic, 0, 2)) * -280;
  // squash on landing: scaleY shrinks, scaleX widens
  const squash = Math.max(0, 1 - elastic);
  const scaleY = 1 - squash * 0.35;
  const scaleX = 1 + squash * 0.25;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Overshoot Spring" sub="Squash · damping 5" progress={labelIn} />
      <div style={{
        transform: `translateY(${ty}px) scaleY(${scaleY}) scaleX(${scaleX})`,
        transformOrigin: '50% 100%',
        opacity: clamp(elastic * 3, 0, 1),
      }}>
        <LogoMark />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B03: Draw-On Stroke ────────────────────────────────────────────────────────
const B03_DrawOnStroke: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const DRAW_DUR = Math.floor(durationInFrames * 0.6);
  const FILL_START = DRAW_DUR;
  const FILL_DUR = 40;

  const drawProgress = clamp(frame / DRAW_DUR, 0, 1);
  const fillProgress = iclamp(frame, [FILL_START, FILL_START + FILL_DUR], [0, 1]);

  // Large estimated stroke length for the complex multi-subpath logo
  const STROKE_LEN = 120000;
  const dashOffset = STROKE_LEN * (1 - drawProgress);

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Draw-On Stroke" sub="stroke-dashoffset trace then fill" progress={labelIn} />
      <svg
        viewBox="0 0 2048 2048"
        width={MARK_SIZE}
        height={MARK_SIZE}
        style={{ display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={MUSINIQUE_LOGO_2_PATH}
          fill={`rgba(61,57,41,${fillProgress})`}
          stroke={SPARK}
          strokeWidth={8}
          strokeDasharray={STROKE_LEN}
          strokeDashoffset={dashOffset}
          style={{ paintOrder: 'stroke' }}
        />
      </svg>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B04: Mask Reveal — wipe then radial iris ───────────────────────────────────
const B04_MaskReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const HALF = Math.floor(durationInFrames / 2);

  // First half: horizontal wipe
  const wipe = iclamp(frame, [10, HALF - 10], [0, 100]);

  // Second half: radial iris open from 0% to 80% of mark diagonal
  const iris = iclamp(frame, [HALF + 10, durationInFrames - 20], [0, 100]);

  const isWipe = frame < HALF;
  const clipStyle = isWipe
    ? { clipPath: `inset(0 ${100 - wipe}% 0 0)` as const }
    : { clipPath: `circle(${iris}% at 50% 50%)` as const };

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel
        name="Mask Reveal"
        sub={isWipe ? 'Wipe → Radial Iris' : 'Radial Iris'}
        progress={labelIn}
      />
      <div style={{ ...clipStyle }}>
        <LogoMark />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B05: Scale Zoom — linear vs bezier ────────────────────────────────────────
const B05_ScaleZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const HALF = Math.floor(durationInFrames / 2);
  const localFrame = frame % HALF;
  const isLinear = frame < HALF;

  // Linear scale: 0 → 1 in 60 frames
  const linearScale = iclamp(localFrame, [10, 70], [0, 1]);

  // Bezier scale: spring with slight overshoot
  const bezierScale = clamp(
    spring({ frame: localFrame - 10, fps, config: { damping: 14, stiffness: 200, mass: 0.8 } }),
    0, 1.15
  );

  const scale = isLinear ? linearScale : bezierScale;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel
        name="Scale Zoom"
        sub={isLinear ? 'Linear' : 'Bezier (overshoot)'}
        progress={labelIn}
      />
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: '50% 50%',
      }}>
        <LogoMark />
      </div>
      {/* terracotta label indicating which half */}
      <div style={{
        position: 'absolute', bottom: '16%', left: 0, right: 0, textAlign: 'center',
        fontFamily: SANS, fontSize: 16, color: SPARK, letterSpacing: 2,
        textTransform: 'uppercase' as const,
      }}>
        {isLinear ? 'LINEAR' : 'BEZIER'}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B06: Rotation ─────────────────────────────────────────────────────────────
const B06_Rotation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const SPIN_END = Math.floor(durationInFrames * 0.7);
  // Spin: 0 → 360 over SPIN_END frames
  const spinAngle = iclamp(frame, [15, SPIN_END], [0, 360]);
  // Then settle spring to 0
  const settleRot = SPIN_END < durationInFrames
    ? 360 - 360 * clamp(spring({ frame: frame - SPIN_END, fps, config: { damping: 18, stiffness: 120 } }), 0, 1)
    : 360;
  const angle = frame < SPIN_END ? spinAngle : settleRot;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Rotation" sub="Full 360° · spring settle" progress={labelIn} />
      <div style={{
        transform: `rotate(${angle}deg)`,
        transformOrigin: '50% 50%',
      }}>
        <LogoMark />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B07: Skew And Shear ────────────────────────────────────────────────────────
const B07_SkewAndShear: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // Skew left (−30°) then right (+30°) then back to 0
  const THIRD = Math.floor(durationInFrames / 3);
  let skewX: number;
  if (frame < THIRD) {
    skewX = iclamp(frame, [5, THIRD - 5], [0, -30]);
  } else if (frame < THIRD * 2) {
    skewX = iclamp(frame, [THIRD + 5, THIRD * 2 - 5], [-30, 30]);
  } else {
    skewX = iclamp(frame, [THIRD * 2 + 5, durationInFrames - 10], [30, 0]);
  }

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Skew And Shear" sub={`skewX ${skewX.toFixed(0)}°`} progress={labelIn} />
      <div style={{
        transform: `skewX(${skewX}deg)`,
        transformOrigin: '50% 50%',
      }}>
        <LogoMark />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B08: Opacity Through Blur ─────────────────────────────────────────────────
const B08_OpacityThroughBlur: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const IN_END = Math.floor(durationInFrames * 0.45);
  const HOLD = Math.floor(durationInFrames * 0.65);

  // Fade-in + sharpen
  const opacity = iclamp(frame, [10, IN_END], [0, 1]);
  const blur = iclamp(frame, [10, IN_END], [20, 0]);

  // Then fade out + re-blur
  const opacity2 = frame > HOLD ? iclamp(frame, [HOLD, durationInFrames - 10], [1, 0]) : 1;
  const blur2 = frame > HOLD ? iclamp(frame, [HOLD, durationInFrames - 10], [0, 20]) : 0;

  const finalOpacity = frame <= HOLD ? opacity : opacity2;
  const finalBlur = frame <= HOLD ? blur : blur2;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Opacity Through Blur" sub="Fade × gaussian sharpen" progress={labelIn} />
      <div style={{
        opacity: finalOpacity,
        filter: `blur(${finalBlur}px)`,
      }}>
        <LogoMark />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B09: Color Interpolation (treatment beat) ──────────────────────────────────
const B09_ColorInterp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };
  const lerpRgb = (a: number[], b: number[], t: number) =>
    a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const toHex = (rgb: number[]) =>
    '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');

  const inkRgb = hexToRgb(INK);     // #3D3929
  const sparkRgb = hexToRgb(SPARK); // #D97757 — terracotta
  const tealRgb = [14, 116, 144];   // deep teal #0E7490

  // Two cycles: ink→terracotta→ink, then ink→teal→ink
  const HALF = Math.floor(durationInFrames / 2);
  const t1 = Math.sin(Math.max(0, frame - 10) * Math.PI / Math.max(HALF - 20, 1)) * 0.5 + 0.5;
  const t2 = Math.sin(Math.max(0, frame - HALF) * Math.PI / Math.max(durationInFrames - HALF - 20, 1)) * 0.5 + 0.5;

  const color = frame < HALF
    ? toHex(lerpRgb(inkRgb, sparkRgb, clamp(t1, 0, 1)))
    : toHex(lerpRgb(inkRgb, tealRgb, clamp(t2, 0, 1)));

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel
        name="Color Interpolation"
        sub={frame < HALF ? 'Ink → Terracotta' : 'Ink → Teal'}
        progress={labelIn}
      />
      <LogoMark fill={color} />
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B10: Kinetic Grid ─────────────────────────────────────────────────────────
// Mark tiled across frame in a 4×2 grid, staggered ripple wave
const B10_KineticGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const COLS = 4;
  const ROWS = 2;
  const TILE = 200; // px per tile
  const GAP = 24;
  const RIPPLE_SPEED = 0.08;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Kinetic Grid" sub="4×2 tile · staggered ripple" progress={labelIn} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, ${TILE}px)`,
        gridTemplateRows: `repeat(${ROWS}, ${TILE}px)`,
        gap: GAP,
      }}>
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          // ripple: wave from top-left
          const dist = (col + row) * 0.5;
          const wave = Math.sin(frame * RIPPLE_SPEED - dist * 1.2) * 0.5 + 0.5;
          const scale = 0.85 + wave * 0.2;
          const opacity = 0.4 + wave * 0.6;
          return (
            <div
              key={i}
              style={{
                width: TILE,
                height: TILE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${scale})`,
              }}
            >
              <LogoMark size={TILE - 20} opacity={opacity} />
            </div>
          );
        })}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B11: Glitch Slices ─────────────────────────────────────────────────────────
const B11_GlitchSlices: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const GLITCH_START = 15;
  const GLITCH_DUR = 50;
  const SNAP_START = GLITCH_START + GLITCH_DUR;

  const glitchProgress = iclamp(frame, [GLITCH_START, SNAP_START], [1, 0]);
  const sliceCount = 7;
  const slices = Array.from({ length: sliceCount }, (_, i) => {
    const seed = (i * 137 + 17) % 100;
    const maxOffset = 60 * glitchProgress;
    const dir = i % 2 === 0 ? 1 : -1;
    return dir * (seed / 100) * maxOffset;
  });

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <TechLabel name="Glitch Slices" sub="7 horizontal strips · snap clean" progress={labelIn} />
      <div style={{
        position: 'relative',
        width: MARK_SIZE,
        height: MARK_SIZE,
      }}>
        {slices.map((offset, i) => {
          const topPct = (i / sliceCount) * 100;
          const heightPct = 100 / sliceCount;
          return (
            <div key={i} style={{
              position: 'absolute',
              top: `${topPct}%`,
              left: 0, right: 0,
              height: `${heightPct}%`,
              overflow: 'hidden',
              transform: `translateX(${offset}px)`,
            }}>
              <div style={{
                position: 'absolute',
                top: `-${topPct}%`,
                left: 0, right: 0,
                height: `${sliceCount * 100}%`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <LogoMark size={MARK_SIZE} />
              </div>
            </div>
          );
        })}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B12: Trail Echo ────────────────────────────────────────────────────────────
// Mark slides across frame; 5 ghost copies trail behind at decreasing opacity
const B12_TrailEcho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const TRAIL_LAYERS = 5;
  const TRAIL_GAP = 12; // frames behind per layer
  const MOVE_SPEED = 4; // px per frame
  const START_X = -600;
  const currentX = START_X + frame * MOVE_SPEED;

  // Keep mark on screen by looping
  const screenX = ((currentX + 1920) % (1920 + MARK_SIZE + 200)) - MARK_SIZE - 100;

  return (
    <AbsoluteFill style={{ background: PAGE, overflow: 'hidden' }}>
      <TechLabel name="Trail Echo" sub="5 ghost layers · layered opacity" progress={labelIn} />
      {/* Render trail layers from oldest (most faded) to newest (opaque) */}
      {Array.from({ length: TRAIL_LAYERS + 1 }, (_, i) => {
        const lag = (TRAIL_LAYERS - i) * TRAIL_GAP;
        const trailX = screenX - lag * MOVE_SPEED;
        const opacity = i === TRAIL_LAYERS ? 1 : (i / TRAIL_LAYERS) * 0.3;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: `translateX(${trailX}px) translateY(-50%)`,
          }}>
            <LogoMark opacity={opacity} />
          </div>
        );
      })}
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B13: Noise Wobble ─────────────────────────────────────────────────────────
const B13_NoiseWobble: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // Two sinusoid pairs at offset frequencies simulate Perlin-like noise
  const AMP = 18;
  const dx =
    Math.sin(frame * 0.13) * AMP +
    Math.sin(frame * 0.07 + 1.3) * AMP * 0.5;
  const dy =
    Math.sin(frame * 0.09 + 0.7) * AMP +
    Math.sin(frame * 0.05 + 2.1) * AMP * 0.5;
  // Slight rotation wobble
  const drot = Math.sin(frame * 0.11 + 0.4) * 2.5;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Noise Wobble" sub="Sinusoid-pair displacement" progress={labelIn} />
      <div style={{
        transform: `translate(${dx}px, ${dy}px) rotate(${drot}deg)`,
      }}>
        <LogoMark />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B14: Elastic Physics ──────────────────────────────────────────────────────
const B14_ElasticPhysics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const DROP_START = 20;
  const elastic = spring({
    frame: frame - DROP_START,
    fps,
    config: { damping: 5, stiffness: 180, mass: 1.5 },
  });

  const ty = (1 - clamp(elastic, 0, 2)) * -280;
  // Squash at impact
  const squash = Math.max(0, 1 - elastic);
  const scaleY = 0.7 + clamp(elastic, 0, 1) * 0.3;
  const scaleX = 1.4 - clamp(elastic, 0, 1) * 0.4;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Elastic Physics" sub="Heavy spring · squash on impact" progress={labelIn} />
      <div style={{
        transform: `translateY(${ty}px) scaleY(${scaleY}) scaleX(${scaleX})`,
        transformOrigin: '50% 100%',
        opacity: clamp(elastic * 3, 0, 1),
      }}>
        <LogoMark />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B15: Card Flip — perspective rotateY ──────────────────────────────────────
const B15_CardFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // Two flips over the duration
  const FLIP_DUR = Math.floor(durationInFrames / 2);
  const localFrame = frame % FLIP_DUR;
  const flipAngle = iclamp(localFrame, [10, FLIP_DUR - 10], [0, 180]);

  // Mid-flip color switch at 90 degrees
  const isFront = flipAngle < 90;
  const fill = isFront ? INK : SPARK;

  // Perspective transform
  const displayAngle = flipAngle <= 90 ? flipAngle : flipAngle - 180;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center', perspective: 800 }}>
      <TechLabel name="Card Flip" sub="rotateY · face swap at 90°" progress={labelIn} />
      <div style={{
        transform: `rotateY(${displayAngle}deg)`,
        transformStyle: 'preserve-3d' as const,
        // Hide when fully flipped past 90
        opacity: Math.abs(flipAngle - 90) < 2 ? 0 : 1,
      }}>
        <LogoMark fill={fill} />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B16: Shadow Play ───────────────────────────────────────────────────────────
const B16_ShadowPlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const HALF = Math.floor(durationInFrames / 2);
  const localFrame = frame % HALF;
  const isDirectional = frame < HALF;

  const t = Math.sin(localFrame * Math.PI / Math.max(HALF, 1));

  // Pass 1: directional drop shadow (ink color)
  const shadowX = t * 20;
  const shadowY = t * 20;
  const shadowBlur = t * 30;
  const shadowColor = `rgba(61,57,41,${t * 0.6})`;
  const directionalShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`;

  // Pass 2: ambient glow (terracotta)
  const glowSize = t * 40;
  const ambientShadow = `0 0 ${glowSize}px ${SPARK}88`;

  const shadow = isDirectional ? directionalShadow : ambientShadow;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel
        name="Shadow Play"
        sub={isDirectional ? 'Directional drop shadow' : 'Ambient terracotta glow'}
        progress={labelIn}
      />
      <div style={{ filter: `drop-shadow(${shadow})` }}>
        <LogoMark />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B17: Composer Summon — terracotta spark on send ───────────────────────────
// Uses ClaudeComposerAsk internally — the ask fires, then the mark assembles
// as the "result" below the composer card.
const B17_ComposerSummon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const RESULT_START = Math.floor(durationInFrames * 0.45);
  const resultIn = spring({
    frame: frame - RESULT_START,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.9 },
  });
  const markOpacity = clamp(resultIn, 0, 1);
  const markScale = 0.6 + clamp(resultIn, 0, 1) * 0.4;

  return (
    <AbsoluteFill style={{ background: PAGE }}>
      {/* Composer card (simplified) */}
      <div style={{
        position: 'absolute', top: '8%', left: '50%',
        transform: 'translateX(-50%)',
        width: '60%',
        background: CLAUDE.CARD,
        borderRadius: 12,
        padding: '24px 28px',
        boxShadow: '0 2px 12px rgba(61,57,41,0.10)',
        border: `1px solid ${CLAUDE.BORDER}`,
      }}>
        {/* Greeting */}
        <div style={{
          fontFamily: SERIF, fontSize: 22, color: INK, marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ color: SPARK, fontSize: 20 }}>✦</span>
          <span>Watch this, Liam</span>
        </div>
        {/* Prompt */}
        <div style={{
          fontFamily: CLAUDE_FONT.mono, fontSize: 15, color: INK,
          background: PAGE, borderRadius: 6, padding: '10px 14px',
          border: `1px solid ${CLAUDE.BORDER}`,
        }}>
          Generate the Musinique logo mark SVG and animate it entering the frame with a spring
        </div>
        {/* Running indicator */}
        <div style={{
          marginTop: 12, fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ color: SPARK }}>▶</span>
          rendering mark…
        </div>
      </div>
      {/* Result: the mark assembles below */}
      <div style={{
        position: 'absolute', bottom: '8%', left: '50%',
        transform: `translateX(-50%) scale(${markScale})`,
        opacity: markOpacity,
        transformOrigin: '50% 100%',
      }}>
        <LogoMark size={300} />
      </div>
    </AbsoluteFill>
  );
};

// ── B18: Stroke Pulse — dashoffset heartbeat ──────────────────────────────────
const B18_StrokePulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const STROKE_LEN = 120000;
  const PULSE_FREQ = 0.08; // cycles per frame
  // Heartbeat rhythm: fast-slow-fast
  const beat1 = Math.max(0, Math.sin(frame * PULSE_FREQ * 2 * Math.PI)) * 0.5;
  const beat2 = Math.max(0, Math.sin(frame * PULSE_FREQ * 2 * Math.PI + 0.5)) * 0.3;
  const pulseProgress = beat1 + beat2;
  const dashOffset = STROKE_LEN * (0.05 + pulseProgress * 0.25);

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Stroke Pulse" sub="dashoffset heartbeat rhythm" progress={labelIn} />
      <svg
        viewBox="0 0 2048 2048"
        width={MARK_SIZE}
        height={MARK_SIZE}
        style={{ display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Solid fill underneath */}
        <path d={MUSINIQUE_LOGO_2_PATH} fill={INK} opacity={0.15} />
        {/* Animated stroke pulse on top */}
        <path
          d={MUSINIQUE_LOGO_2_PATH}
          fill="none"
          stroke={SPARK}
          strokeWidth={6}
          strokeDasharray={`${STROKE_LEN * 0.25} ${STROKE_LEN * 0.75}`}
          strokeDashoffset={-dashOffset}
        />
      </svg>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B19: Scale Breathe — subtle continuous oscillation ────────────────────────
const B19_ScaleBreathe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // Very subtle: scale oscillates between 0.96 and 1.04
  const FREQ = 0.025; // slow breath
  const breathe = 1 + Math.sin(frame * FREQ * 2 * Math.PI) * 0.04;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Scale Breathe" sub="±4% continuous oscillation" progress={labelIn} />
      <div style={{
        transform: `scale(${breathe})`,
        transformOrigin: '50% 50%',
      }}>
        <LogoMark />
      </div>
      {/* Subtle annotation showing the oscillation amplitude */}
      <div style={{
        position: 'absolute', bottom: '18%', left: 0, right: 0, textAlign: 'center',
        fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, letterSpacing: 1,
      }}>
        scale: {breathe.toFixed(3)}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B20: Exit Family — three quick exits ──────────────────────────────────────
const B20_ExitFamily: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const THIRD = Math.floor(durationInFrames / 3);
  const phase = frame < THIRD ? 0 : frame < THIRD * 2 ? 1 : 2;
  const localFrame = frame - phase * THIRD;

  // Exit 1: Shrink-spin (scale to 0, rotate 180°)
  const shrink = Math.max(0, 1 - localFrame / (THIRD * 0.7));
  const spinRot = localFrame * (180 / (THIRD * 0.7));
  const exit1 = (
    <div style={{
      transform: `scale(${shrink}) rotate(${spinRot}deg)`,
      opacity: shrink,
    }}>
      <LogoMark />
    </div>
  );

  // Exit 2: Blur-out to white
  const blurAmt = Math.min(40, localFrame * 1.2);
  const blurOpacity = Math.max(0, 1 - localFrame / 30);
  const exit2 = (
    <div style={{
      filter: `blur(${blurAmt}px)`,
      opacity: blurOpacity,
    }}>
      <LogoMark />
    </div>
  );

  // Exit 3: Mask-close — radial iris closes from 80% to 0%
  const irisSize = Math.max(0, 80 - (localFrame / 25) * 80);
  const exit3 = (
    <div style={{ clipPath: `circle(${irisSize}% at 50% 50%)` }}>
      <LogoMark />
    </div>
  );

  const phaseLabel =
    phase === 0 ? 'Exit 1 · Shrink-Spin' :
    phase === 1 ? 'Exit 2 · Blur-Out' :
    'Exit 3 · Radial Iris Close';

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Exit Family" sub={phaseLabel} progress={labelIn} />
      {phase === 0 ? exit1 : phase === 1 ? exit2 : exit3}
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIMING
// ═══════════════════════════════════════════════════════════════════════════════
const TIMED = TIMING.map(t => ({ ...t }));
export const TOTAL_FRAMES = TIMED.reduce((a, b) => a + b.frames, 0);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════════
export const MusiniqueLogo2RemotionShowcase16x9: React.FC = () => {
  let at = 0;

  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;

    let content: React.ReactNode = null;

    switch (t.id) {
      // ── B00 — Cold open ──────────────────────────────────────────────────
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Hej, Liam',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'animate musinique-logo-2.svg — every Remotion technique — 20 beats, 16:9 landscape, for review',
            runningText: 'loading technique showcase…',
            folderLabel: FOLDER,
            output: [
              '20 techniques loaded',
              'SVG mark 2048×2048 viewBox — 73 subpaths, all paths',
              'Kokoro am_onyx narration locked',
            ],
          })} />
        );
        break;

      case 'B01': content = <B01_SpringEntrance />; break;
      case 'B02': content = <B02_OvershootSpring />; break;
      case 'B03': content = <B03_DrawOnStroke />; break;
      case 'B04': content = <B04_MaskReveal />; break;
      case 'B05': content = <B05_ScaleZoom />; break;
      case 'B06': content = <B06_Rotation />; break;
      case 'B07': content = <B07_SkewAndShear />; break;
      case 'B08': content = <B08_OpacityThroughBlur />; break;
      case 'B09': content = <B09_ColorInterp />; break;
      case 'B10': content = <B10_KineticGrid />; break;
      case 'B11': content = <B11_GlitchSlices />; break;
      case 'B12': content = <B12_TrailEcho />; break;
      case 'B13': content = <B13_NoiseWobble />; break;
      case 'B14': content = <B14_ElasticPhysics />; break;
      case 'B15': content = <B15_CardFlip />; break;
      case 'B16': content = <B16_ShadowPlay />; break;
      case 'B17': content = <B17_ComposerSummon />; break;
      case 'B18': content = <B18_StrokePulse />; break;
      case 'B19': content = <B19_ScaleBreathe />; break;
      case 'B20': content = <B20_ExitFamily />; break;

      // ── B21 — Your Turn (handoff) ────────────────────────────────────────
      case 'B21':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Your turn.',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Animate my SVG logo mark with these techniques: Spring Entrance, Draw-On Stroke, Kinetic Grid, Card Flip, Exit Family. Build each as a Remotion scene at 1920×1080, 30fps, cream #FAF9F5 background, ink #3D3929 fill, terracotta #D97757 accent. Export separate mp4s for review.',
            runningText: 'paste this into Claude…',
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B22 — Outro ──────────────────────────────────────────────────────
      case 'B22':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: 'One Logo Mark, Every Move Remotion Knows.',
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
        {t.audio && (
          <Audio src={staticFile(t.audio)} />
        )}
      </Sequence>
    );
  });

  return <AbsoluteFill>{seqs}</AbsoluteFill>;
};
