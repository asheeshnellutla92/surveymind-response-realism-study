import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * TeachClaudeFig5 — Constitutional Adherence Grid (Act 4 support; 3x3 sparkline grid)
 * Source: Anthropic, "Teaching Claude why", May 2026
 *
 * 9 behaviors organized in a 3x3 grid of mini line panels:
 *   Up-is-better: Admirable, Factual, Good for the user
 *   Down-is-better: Misaligned behavior, Brazen cooperation w/ misuse, Cooperation w/ misuse
 *   Mixed / neutral: Fake factual, Open-ended, Disappointing
 *
 * Shape anchors: SDF lines far above (up-is-better) or far below (down-is-better)
 *   the near-flat baseline; gaps persist across RL steps.
 *
 * Animate: grid cards flip in staggered; then zoom "Admirable" card full-frame
 *   for the narration "more actively admirable behavior."
 *
 * Per CLAUDE-BRAND.md: terracotta accent = the "Admirable" card zoom moment.
 */

export const teachClaudeFig5Schema = z.object({
  sparkLine: z.string().default('More admirable. Less misaligned.'),
});
export type TeachClaudeFig5Props = z.infer<typeof teachClaudeFig5Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// 9 behaviors in grid order (3 cols, 3 rows)
const BEHAVIORS = [
  // Row 0
  { label: 'Admirable', dir: 'up', isAccent: true },
  { label: 'Factual', dir: 'up', isAccent: false },
  { label: 'Good for user', dir: 'up', isAccent: false },
  // Row 1
  { label: 'Misaligned', dir: 'down', isAccent: false },
  { label: 'Brazen misuse', dir: 'down', isAccent: false },
  { label: 'Coop. w/ misuse', dir: 'down', isAccent: false },
  // Row 2
  { label: 'Fake factual', dir: 'down', isAccent: false },
  { label: 'Open-ended', dir: 'neutral', isAccent: false },
  { label: 'Disappointing', dir: 'down', isAccent: false },
];

const STEPS_N = 8;
const STEPS = Array.from({ length: STEPS_N }, (_, i) => i / (STEPS_N - 1));

// Illustrative sparkline values: SDF line above/below baseline
function makeVals(dir: string, isBaseline: boolean): number[] {
  if (dir === 'up') {
    return STEPS.map(t => isBaseline ? 0.35 + t * 0.05 : 0.65 + t * 0.08);
  } else if (dir === 'down') {
    return STEPS.map(t => isBaseline ? 0.65 - t * 0.05 : 0.30 - t * 0.08);
  } else {
    return STEPS.map(t => isBaseline ? 0.50 : 0.50 + (dir === 'up' ? 0.1 : -0.05));
  }
}

interface SparklineProps {
  behavior: typeof BEHAVIORS[0];
  width: number;
  height: number;
  progress: number;
}

const MiniSparkline: React.FC<SparklineProps> = ({ behavior, width, height, progress }) => {
  const W = width;
  const H = height;
  const PADDING = 6;
  const plotW = W - PADDING * 2;
  const plotH = H - PADDING * 2 - 20; // leave room for label

  const baselineVals = makeVals(behavior.dir, true);
  const sdfVals = makeVals(behavior.dir, false);

  const maxPts = Math.max(2, Math.floor(progress * (STEPS_N - 1)) + 1);

  const makePath = (vals: number[]) => {
    return vals.slice(0, maxPts).map((v, i) => {
      const x = PADDING + (i / (STEPS_N - 1)) * plotW;
      const y = PADDING + (1 - v) * plotH;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const arrowUp = behavior.dir === 'up';
  const arrowNeutral = behavior.dir === 'neutral';
  const arrowColor = behavior.isAccent ? CLAUDE.SPARK : (arrowUp ? CLAUDE.INK : CLAUDE.INK_SOFT);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Background */}
      <rect x={0} y={0} width={W} height={H} fill={CLAUDE.PAGE} rx={4}
        stroke={behavior.isAccent ? CLAUDE.SPARK : CLAUDE.BORDER} strokeWidth={behavior.isAccent ? 2 : 1} />

      {/* Baseline line */}
      <path d={makePath(baselineVals)} fill="none" stroke={CLAUDE.GHOST}
        strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" />

      {/* SDF line */}
      <path d={makePath(sdfVals)} fill="none"
        stroke={behavior.isAccent ? CLAUDE.SPARK : CLAUDE.INK}
        strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />

      {/* Arrow chip */}
      {!arrowNeutral && (
        <polygon
          points={arrowUp
            ? `${W - 14},${10} ${W - 8},${20} ${W - 20},${20}`
            : `${W - 14},${20} ${W - 8},${10} ${W - 20},${10}`}
          fill={arrowColor} opacity={0.9}
        />
      )}

      {/* Label */}
      <text x={PADDING} y={H - 5}
        fontFamily={SANS} fontSize={Math.max(9, H * 0.13)}
        fill={behavior.isAccent ? CLAUDE.SPARK : CLAUDE.INK}
        fontWeight={behavior.isAccent ? '700' : '400'}>
        {behavior.label}
      </text>
    </svg>
  );
};

export const TeachClaudeFig5: React.FC<TeachClaudeFig5Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkInAnim = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 85, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Grid layout
  const GRID_TOP = height * 0.26;
  const GRID_LEFT = PAD_X;
  const GRID_RIGHT = width - PAD_X;
  const GRID_W = GRID_RIGHT - GRID_LEFT;
  const GRID_H = height * 0.52;
  const CELL_W = (GRID_W - 16) / 3;
  const CELL_H = (GRID_H - 16) / 3;

  // Card flip-in stagger
  const cardAnims = BEHAVIORS.map((_, i) =>
    spring({ frame: frame - 10 - i * 6, fps, config: { damping: 28, stiffness: 120, mass: 0.7 } })
  );

  // Line draw progress
  const lineProgress = clamp(interpolate(frame, [20, 65], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }), 0, 1);

  // Zoom animation for "Admirable" card (index 0) — activates late
  const ZOOM_START = 72;
  const zoomAnim = spring({ frame: frame - ZOOM_START, fps, config: { damping: 22, stiffness: 70, mass: 1.2 } });
  const showZoom = frame >= ZOOM_START;

  const ADMIRABLE_COL = 0;
  const ADMIRABLE_ROW = 0;
  const admX = GRID_LEFT + ADMIRABLE_COL * (CELL_W + 8);
  const admY = GRID_TOP + ADMIRABLE_ROW * (CELL_H + 8);

  // Zoomed card center position
  const zoomCX = width / 2;
  const zoomCY = height * 0.52;
  const zoomScale = 2.2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        CONSTITUTIONAL ADHERENCE ACROSS 9 BEHAVIORS · OVER RL STEPS
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
        maxWidth: width * 0.8,
      }}>
        SDF lines stay above baseline. Across all nine.
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.13,
        display: 'flex', gap: 24, opacity: clamp(titleIn, 0, 1),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width={24} height={10}><line x1={0} y1={5} x2={24} y2={5}
            stroke={CLAUDE.GHOST} strokeWidth={2} strokeDasharray="4 3" /></svg>
          <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>Baseline</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width={24} height={10}><line x1={0} y1={5} x2={24} y2={5}
            stroke={CLAUDE.INK} strokeWidth={2.2} /></svg>
          <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>SDF + stories</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width={12} height={12}><polygon points="6,0 12,12 0,12" fill={CLAUDE.INK} opacity={0.8} /></svg>
          <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>up = better</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width={12} height={12}><polygon points="6,12 12,0 0,0" fill={CLAUDE.INK_SOFT} opacity={0.8} /></svg>
          <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>down = better</span>
        </div>
      </div>

      {/* 3x3 Grid */}
      {BEHAVIORS.map((behavior, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = GRID_LEFT + col * (CELL_W + 8);
        const y = GRID_TOP + row * (CELL_H + 8);
        const anim = cardAnims[i];

        const isAdmirable = i === 0;

        // Zoom: admirable card moves to center and scales up
        let transform = `translateY(${(1 - clamp(anim, 0, 1)) * 20}px)`;
        let zoomOpacity = 1;

        if (showZoom && isAdmirable) {
          const z = clamp(zoomAnim, 0, 1);
          const tx = zoomCX - x - CELL_W / 2 + (-(CELL_W * (zoomScale - 1)) / 2);
          const ty = zoomCY - y - CELL_H / 2 + (-(CELL_H * (zoomScale - 1)) / 2);
          transform = `translate(${tx * z}px, ${ty * z}px) scale(${1 + (zoomScale - 1) * z})`;
          zoomOpacity = showZoom && !isAdmirable ? Math.max(0, 1 - clamp(zoomAnim, 0, 1) * 0.7) : 1;
        }

        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y,
            width: CELL_W, height: CELL_H,
            opacity: clamp(anim, 0, 1) * zoomOpacity,
            transform,
            transformOrigin: isAdmirable ? 'left top' : 'center center',
            zIndex: isAdmirable && showZoom ? 10 : 1,
          }}>
            <MiniSparkline
              behavior={behavior}
              width={CELL_W}
              height={CELL_H}
              progress={lineProgress}
            />
          </div>
        );
      })}

      {/* Zoom caption for Admirable */}
      {showZoom && clamp(zoomAnim, 0, 1) > 0.5 && (
        <div style={{
          position: 'absolute',
          left: width * 0.3,
          top: height * 0.73,
          fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic',
          color: CLAUDE.SPARK,
          opacity: (clamp(zoomAnim, 0, 1) - 0.5) / 0.5,
        }}>
          More actively admirable behavior — not just less bad.
        </div>
      )}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Redrawn (simplified) from Anthropic, "Teaching Claude why", 2026
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkInAnim, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
