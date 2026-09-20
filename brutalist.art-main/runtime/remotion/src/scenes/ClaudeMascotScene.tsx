import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {z} from 'zod';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

/**
 * ClaudeMascotScene — renders the Claude mascot performing one of 18 named
 * animations. Each animation is a pure JS math loop (Math.sin/cos) driven by
 * frame and fps — no GSAP, no external animation libs.
 *
 * Canonical mascot viewBox: "-20 0 136 86"
 * Body color: #dd775b  |  Eye color: #000
 *
 * Coordinates (exact, do not alter):
 *   torso:      x=0,   y=0,  w=96, h=60
 *   left-arm:   x=-20, y=20, w=20, h=20
 *   right-arm:  x=96,  y=20, w=20, h=20
 *   left-eye:   x=11,  y=10, w=11, h=10
 *   right-eye:  x=74,  y=10, w=11, h=10
 *   leg-1:      x=11,  y=60, w=11, h=26
 *   leg-2:      x=32,  y=60, w=11, h=26
 *   leg-3:      x=64,  y=60, w=11, h=26
 *   leg-4:      x=85,  y=60, w=11, h=26
 *
 * ┌─ PIXEL-ART LAW (hard — no exceptions) ────────────────────────────────┐
 * │ shape-rendering:crispEdges rects may move ONLY by translation and      │
 * │ axis-aligned scale. NEVER rotation. Rotating a pixel-rect puts its     │
 * │ edges on diagonals the renderer must anti-alias — that is "the fuzzy." │
 * │ spin = scaleX flip (cos oscillation), NOT rotate.                      │
 * │ nod/bounce/stretch/crouch/jump = foot-anchored scaleY, NOT rotate.     │
 * │ wave = rightArmTy oscillation, NOT rightArmRotate.                     │
 * │ Foot-anchor formula: mascotTy = 86*(1−scaleY) − jumpHeight            │
 * │                      mascotTx = 48*(1−scaleX)   (center anchor)       │
 * └────────────────────────────────────────────────────────────────────────┘
 */

export const ANIMATIONS = [
  'idle', 'bounce', 'wave', 'look', 'walk', 'run', 'think', 'type',
  'sleep', 'error', 'nod', 'shake', 'dance', 'stretch', 'crouch',
  'jump', 'spin', 'celebrate',
] as const;

export type AnimationName = typeof ANIMATIONS[number];

export const claudeMascotSceneSchema = z.object({
  animationName: z.enum(ANIMATIONS).default('idle'),
  label: z.string().default('⚠ SET IN BEAT SHEET'),
  bgColor: z.string().default(CLAUDE.PAGE),
});

export type ClaudeMascotSceneProps = z.infer<typeof claudeMascotSceneSchema>;

// Mascot colors
const BODY = '#dd775b';
const EYE  = '#000';

// ──────────────────────────────────────────────────────────────────────────────
// Animation math helpers
// ──────────────────────────────────────────────────────────────────────────────

interface AnimState {
  // outer group (whole mascot) — translation + axis-aligned scale only
  mascotTx: number;
  mascotTy: number;
  mascotScaleX: number;
  mascotScaleY: number;
  // arms — translation only, no rotation (PIXEL-ART LAW)
  leftArmTy: number;
  rightArmTy: number;
  // eyes
  eyeTx: number;
  leftEyeH: number;
  rightEyeH: number;
  // legs (per-leg translateY, height override)
  leg1Ty: number;
  leg2Ty: number;
  leg3Ty: number;
  leg4Ty: number;
  leg1H: number;
  leg2H: number;
  leg3H: number;
  leg4H: number;
}

function defaultState(): AnimState {
  return {
    mascotTx: 0, mascotTy: 0,
    mascotScaleX: 1, mascotScaleY: 1,
    leftArmTy: 0, rightArmTy: 0,
    eyeTx: 0, leftEyeH: 10, rightEyeH: 10,
    leg1Ty: 0, leg2Ty: 0, leg3Ty: 0, leg4Ty: 0,
    leg1H: 26, leg2H: 26, leg3H: 26, leg4H: 26,
  };
}

export function computeAnimation(
  name: AnimationName,
  frame: number,
  fps: number,
): AnimState {
  const s = defaultState();
  const t = (frame / fps) * 2 * Math.PI; // main time oscillator

  switch (name) {

    // ── idle ────────────────────────────────────────────────────────────────
    case 'idle': {
      s.mascotTy = Math.sin(t * 1.2) * 2;
      // blink: every 80 frames, eyes shut for 4 frames
      const blinkPhase = frame % 80;
      if (blinkPhase < 4) {
        const h = interpolate(blinkPhase, [0, 2, 4], [10, 0, 10], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        s.leftEyeH = h;
        s.rightEyeH = h;
      }
      break;
    }

    // ── bounce ───────────────────────────────────────────────────────────────
    case 'bounce': {
      // Foot-anchored squash-and-stretch: feet stay planted at y=86
      const arc      = Math.abs(Math.sin(t * 3));
      const ground   = 1 - arc;
      const sy       = 1 - ground * 0.15;
      const sx       = 1 + ground * 0.10;
      const jumpH    = arc * 28;
      s.mascotScaleY = sy;
      s.mascotScaleX = sx;
      s.mascotTy     = 86 * (1 - sy) - jumpH; // foot anchor
      s.mascotTx     = 48 * (1 - sx);          // center anchor
      break;
    }

    // ── wave ─────────────────────────────────────────────────────────────────
    case 'wave': {
      // rightArmTy oscillation — NOT rightArmRotate (PIXEL-ART LAW)
      s.rightArmTy = Math.sin(t * 3) * -12;
      s.mascotTy   = Math.sin(t * 1.5) * 2;
      break;
    }

    // ── look ─────────────────────────────────────────────────────────────────
    case 'look': {
      s.eyeTx    = Math.sin(t * 1.8) * 8;
      s.mascotTy = Math.sin(t * 0.8) * 2;
      break;
    }

    // ── walk ─────────────────────────────────────────────────────────────────
    case 'walk': {
      const lp  = Math.sin(t * 4);
      s.leg1Ty  = -Math.max(0,  lp) * 8;
      s.leg3Ty  = -Math.max(0,  lp) * 8;
      s.leg2Ty  = -Math.max(0, -lp) * 8;
      s.leg4Ty  = -Math.max(0, -lp) * 8;
      s.mascotTx = Math.sin(t * 4) * 3;
      s.mascotTy = -Math.abs(Math.sin(t * 8)) * 2;
      break;
    }

    // ── run ──────────────────────────────────────────────────────────────────
    case 'run': {
      // Fast leg alternation + x-slide; no body tilt (was mascotRotate=-8)
      const rp  = Math.sin(t * 6);
      s.leg1Ty  = -Math.max(0,  rp) * 14;
      s.leg3Ty  = -Math.max(0,  rp) * 14;
      s.leg2Ty  = -Math.max(0, -rp) * 14;
      s.leg4Ty  = -Math.max(0, -rp) * 14;
      s.mascotTx = Math.sin(t * 6) * 6;
      s.mascotTy = -Math.abs(Math.sin(t * 12)) * 4;
      break;
    }

    // ── think ────────────────────────────────────────────────────────────────
    case 'think': {
      // Eyes scan side-to-side + arm rises; no body tilt (was mascotRotate)
      s.eyeTx      = Math.sin(t * 1.5) * 6;
      s.leftArmTy  = Math.sin(t * 1.5) * -10;
      s.mascotTy   = Math.sin(t * 0.8) * 2;
      break;
    }

    // ── type ─────────────────────────────────────────────────────────────────
    case 'type': {
      s.leftArmTy  = 8;
      s.rightArmTy = 8;
      s.mascotTy   = Math.sin(t * 12) * 1.5;
      break;
    }

    // ── sleep ────────────────────────────────────────────────────────────────
    case 'sleep': {
      const eyeH = interpolate(frame, [0, fps], [10, 2], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      s.leftEyeH  = eyeH;
      s.rightEyeH = eyeH;
      s.mascotTy  = Math.sin(t * 0.6) * 3;
      break;
    }

    // ── error ────────────────────────────────────────────────────────────────
    case 'error': {
      s.mascotTx = Math.sin(t * 15) * 10;
      break;
    }

    // ── nod ──────────────────────────────────────────────────────────────────
    case 'nod': {
      // Foot-anchored scaleY squash: head dips DOWN, feet stay planted
      const sy       = 1 - Math.abs(Math.sin(t * 3)) * 0.12;
      s.mascotScaleY = sy;
      s.mascotTy     = 86 * (1 - sy); // foot anchor — head dips, feet stay
      break;
    }

    // ── shake ────────────────────────────────────────────────────────────────
    case 'shake': {
      s.mascotTx = Math.sin(t * 8) * 12;
      break;
    }

    // ── dance ────────────────────────────────────────────────────────────────
    case 'dance': {
      // Foot-anchored bounce + alternating arm bob + side sway; no mascotRotate
      const arc      = Math.abs(Math.sin(t * 4));
      const ground   = 1 - arc;
      const sy       = 1 - ground * 0.08;
      s.mascotScaleY = sy;
      s.mascotTy     = 86 * (1 - sy) - arc * 15; // foot anchor
      s.leftArmTy    = Math.sin(t * 3) * -12;
      s.rightArmTy   = Math.sin(t * 3 + Math.PI) * -12;
      s.mascotTx     = Math.sin(t * 2) * 8;       // side sway replaces tilt
      break;
    }

    // ── stretch ──────────────────────────────────────────────────────────────
    case 'stretch': {
      // Foot-anchored whole-body scaleY > 1 — legs never detach (was torsoScaleY)
      const sy       = Math.sin(t * 1.5) * 0.25 + 1; // 0.75 to 1.25
      s.mascotScaleY = sy;
      s.mascotTy     = 86 * (1 - sy); // foot anchor — head rises, feet stay
      break;
    }

    // ── crouch ───────────────────────────────────────────────────────────────
    case 'crouch': {
      // Foot-anchored compression — feet stay planted (was mascotTy+legH hack)
      const cr       = (Math.sin(t * 2) + 1) / 2; // 0→1 cycle
      const sy       = 1 - cr * 0.25;
      s.mascotScaleY = sy;
      s.mascotTy     = 86 * (1 - sy); // foot anchor
      break;
    }

    // ── jump ─────────────────────────────────────────────────────────────────
    case 'jump': {
      // Foot-anchored squash on landing + jump height
      const arc      = Math.max(0, Math.sin(t * 2.5));
      const landing  = 1 - arc;
      const sy       = 1 - landing * 0.15;
      const sx       = 1 + landing * 0.08;
      const jumpH    = arc * 35;
      s.mascotScaleY = sy;
      s.mascotScaleX = sx;
      s.mascotTy     = 86 * (1 - sy) - jumpH; // foot anchor
      s.mascotTx     = 48 * (1 - sx);          // center anchor
      break;
    }

    // ── spin ─────────────────────────────────────────────────────────────────
    case 'spin': {
      // scaleX flip: cos oscillates 1→0→-1→0→1 (horizontal axis spin effect)
      // NOT mascotRotate (PIXEL-ART LAW: rotation anti-aliases crispEdges)
      const sx       = Math.cos((frame / fps) * 2 * Math.PI * 1.5);
      s.mascotScaleX = sx;
      s.mascotTx     = 48 * (1 - sx); // center anchor at x=48
      break;
    }

    // ── celebrate ────────────────────────────────────────────────────────────
    case 'celebrate': {
      // Jump arc + raised arms + excited side hop; no mascotRotate
      const carc     = Math.max(0, Math.sin(t * 2.5));
      const landing  = 1 - carc;
      const sy       = 1 - landing * 0.12;
      const jumpH    = carc * 35;
      s.mascotScaleY = sy;
      s.mascotTy     = 86 * (1 - sy) - jumpH; // foot anchor
      s.leftArmTy    = -carc * 20 - 10;
      s.rightArmTy   = -carc * 20 - 10;
      s.mascotTx     = Math.sin(t * 4) * 10;   // excited side hop
      break;
    }
  }

  return s;
}

// ──────────────────────────────────────────────────────────────────────────────
// SVG mascot renderer
// ──────────────────────────────────────────────────────────────────────────────

interface MascotProps {
  s: AnimState;
  scale: number; // uniform CSS scale applied outside the SVG
}

export const MascotSVG: React.FC<MascotProps> = ({s}) => {
  // PIXEL-ART LAW: translation + axis-aligned scale ONLY — no rotate ever.
  // transform="translate(tx,ty) scale(sx,sy)" maps local point (x,y) to
  // parent (tx + x*sx, ty + y*sy). Foot anchor: ty=86*(1-sy)-jumpH ensures
  // the foot line (local y=86) always lands at parent y=86.
  const outerTransform = `translate(${s.mascotTx}, ${s.mascotTy}) scale(${s.mascotScaleX}, ${s.mascotScaleY})`;

  return (
    <svg
      viewBox="-20 0 136 86"
      xmlns="http://www.w3.org/2000/svg"
      style={{width: '100%', height: '100%', overflow: 'visible'}}
      shapeRendering="crispEdges"
    >
      <g id="claude-mascot" transform={outerTransform}>

        {/* ── Torso block ─────────────────────────────────────────────── */}
        <rect x="0" y="0" width="96" height="60" fill={BODY} />

        {/* Eyes */}
        <rect x={11 + s.eyeTx} y="10" width="11" height={s.leftEyeH}  fill={EYE} />
        <rect x={74 + s.eyeTx} y="10" width="11" height={s.rightEyeH} fill={EYE} />

        {/* ── Left arm ────────────────────────────────────────────────── */}
        <rect x="-20" y={20 + s.leftArmTy} width="20" height="20" fill={BODY} />

        {/* ── Right arm (translation only — PIXEL-ART LAW: no rotation) ─ */}
        <rect x="96" y={20 + s.rightArmTy} width="20" height="20" fill={BODY} />

        {/* ── Legs ────────────────────────────────────────────────────── */}
        <rect x="11" y={60 + s.leg1Ty} width="11" height={s.leg1H} fill={BODY} />
        <rect x="32" y={60 + s.leg2Ty} width="11" height={s.leg2H} fill={BODY} />
        <rect x="64" y={60 + s.leg3Ty} width="11" height={s.leg3H} fill={BODY} />
        <rect x="85" y={60 + s.leg4Ty} width="11" height={s.leg4H} fill={BODY} />

      </g>
    </svg>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────

// Title-safe insets (px) — matches the QC safe zone: 96 L/R, 54 T/B.
const SAFE_X = 96;
const SAFE_Y = 54;
// Bottom label strip height within the safe zone.
const STRIP_H = 240;

export const ClaudeMascotScene: React.FC<ClaudeMascotSceneProps> = ({
  animationName,
  label,
  bgColor,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const s = computeAnimation(animationName, frame, fps);

  // Mascot: 600px tall in the safe upper zone (972 - 240 strip = 732px available).
  // SVG viewBox 136×86 → scale 600/86 ≈ 6.98 → display width ≈ 948px.
  const mascotH = 600;
  const mascotW = Math.round((136 / 86) * mascotH); // ≈ 948

  return (
    <AbsoluteFill style={{
      backgroundColor: bgColor,
      display: 'flex',
      flexDirection: 'column',
      padding: `${SAFE_Y}px ${SAFE_X}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      {/* Upper zone: mascot centered in remaining height above the strip */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          width: mascotW,
          height: mascotH,
          position: 'relative',
          overflow: 'visible',
        }}>
          <MascotSVG s={s} scale={1} />
        </div>
      </div>

      {/* Bottom strip: terracotta label band — within the safe zone */}
      <div style={{
        height: STRIP_H,
        backgroundColor: CLAUDE.SPARK,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: CLAUDE_FONT.ui,
          fontSize: 110,
          fontWeight: 800,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: CLAUDE.PAGE,
          lineHeight: 1,
        }}>
          {label}
        </div>
      </div>

    </AbsoluteFill>
  );
};
