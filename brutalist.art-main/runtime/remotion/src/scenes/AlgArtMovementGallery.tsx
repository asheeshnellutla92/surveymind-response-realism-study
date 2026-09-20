import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AlgArtMovementGallery — four living generative-art vignettes cycling in gallery style.
 * Each ~7s (210 frames): Quantum Harmonics → Recursive Whispers → Field Dynamics → Stochastic Crystallization.
 * Cross-fade 20 frames between vignettes. Named like gallery plaques.
 * Palette: cream page, ink, terracotta accent per beat.
 * Seeds logged in SOURCES.md: Quantum=7, Whispers=13, Field=99, Crystal=137.
 */

export const algArtMovementGallerySchema = z.object({
  sparkLine: z.string().default('A movement, named.'),
});
export type AlgArtMovementGalleryProps = z.infer<typeof algArtMovementGallerySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const SECTION_LEN = 210; // 7s per vignette
const FADE = 20;         // cross-fade frames

// ─── Seeded PRNG ───
function mulberry32(s: number) {
  return function() {
    s = (s | 0) + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function vNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const h = (px: number, py: number) => {
    const n = Math.sin(px * 127.1 + py * 311.7 + seed * 7.31) * 43758.5453;
    return n - Math.floor(n);
  };
  const a = h(ix, iy), b = h(ix + 1, iy), c = h(ix, iy + 1), d = h(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// ─── Vignette 1: Quantum Harmonics ───
const QuantumHarmonics: React.FC<{ frame: number; W: number; H: number }> = ({ frame, W, H }) => {
  const seed = 7;
  const ROWS = 12, COLS = 18;
  const cellW = W / COLS, cellH = H / ROWS;
  const t = frame * 0.025;

  const dots = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const phase = vNoise(c * 0.4, r * 0.4, seed) * Math.PI * 2;
      const amp = 0.3 + vNoise(c * 0.3 + 1, r * 0.3 + 1, seed + 5) * 0.7;
      const val = Math.sin(t * 2 + phase) * amp;
      const brightness = (val + 1) / 2;
      const isHot = brightness > 0.72;
      const color = isHot ? CLAUDE.SPARK : CLAUDE.INK;
      const size = 3 + brightness * 5;
      const opacity = 0.15 + brightness * 0.7;
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={c * cellW + cellW / 2}
          cy={r * cellH + cellH / 2}
          r={size}
          fill={color}
          opacity={opacity}
        />
      );
    }
  }
  return <>{dots}</>;
};

// ─── Vignette 2: Recursive Whispers ───
const RecursiveWhispers: React.FC<{ frame: number; W: number; H: number }> = ({ frame, W, H }) => {
  const seed = 13;
  const rng = mulberry32(seed);
  const t = frame * 0.02;

  const drawBranch = (
    x: number, y: number, angle: number, len: number, depth: number, weight: number
  ): React.ReactElement[] => {
    if (depth <= 0 || len < 4) return [];
    const phi = 1.618;
    const noise = vNoise(x * 0.01, y * 0.01 + t, seed) * 0.3 - 0.15;
    const nx = x + Math.cos(angle + noise) * len;
    const ny = y + Math.sin(angle + noise) * len;
    const isHot = depth === 4;
    const color = isHot ? CLAUDE.SPARK : CLAUDE.INK;
    return [
      <line
        key={`${depth}-${x.toFixed(0)}-${y.toFixed(0)}`}
        x1={x} y1={y} x2={nx} y2={ny}
        stroke={color}
        strokeWidth={weight}
        strokeLinecap="round"
        opacity={0.15 + depth * 0.12}
      />,
      ...drawBranch(nx, ny, angle - Math.PI / 4.5, len / phi, depth - 1, weight * 0.65),
      ...drawBranch(nx, ny, angle + Math.PI / 4.5, len / phi, depth - 1, weight * 0.65),
    ];
  };

  return <>{drawBranch(W / 2, H * 0.92, -Math.PI / 2, 120, 6, 3.5)}</>;
};

// ─── Vignette 3: Field Dynamics ───
const FieldDynamics: React.FC<{ frame: number; W: number; H: number }> = ({ frame, W, H }) => {
  const seed = 99;
  const N = 80;
  const TRAIL = 30;

  const trails: { x: number; y: number }[][] = [];
  for (let i = 0; i < N; i++) {
    const rng = mulberry32(seed * 100 + i);
    // Born at edges
    const side = Math.floor(rng() * 4);
    let x = side === 0 ? 0 : side === 1 ? W : rng() * W;
    let y = side === 2 ? 0 : side === 3 ? H : rng() * H;
    const trail: { x: number; y: number }[] = [];

    const t0 = frame;
    const fastEnd = Math.max(0, t0 - TRAIL);
    for (let t = 0; t < fastEnd; t += 3) {
      const angle = vNoise(x * 0.004, y * 0.004 + t * 0.04, seed) * Math.PI * 4;
      x = ((x + Math.cos(angle) * 2 * 3) % W + W) % W;
      y = ((y + Math.sin(angle) * 2 * 3) % H + H) % H;
    }
    for (let t = fastEnd; t <= t0; t++) {
      trail.push({ x, y });
      const angle = vNoise(x * 0.004, y * 0.004 + t * 0.04, seed) * Math.PI * 4;
      x = ((x + Math.cos(angle) * 2) % W + W) % W;
      y = ((y + Math.sin(angle) * 2) % H + H) % H;
    }
    trails.push(trail);
  }

  return (
    <>
      {trails.map((tr, i) => {
        if (tr.length < 2) return null;
        const rng2 = mulberry32(seed * 100 + i + 99999);
        const isHot = rng2() > 0.7;
        const d = tr.map((pt, j, arr) => {
          if (j === 0) return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          const prev = arr[j - 1];
          if (Math.abs(pt.x - prev.x) > W / 2 || Math.abs(pt.y - prev.y) > H / 2) {
            return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          }
          return `L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        }).join(' ');
        return (
          <path key={i} d={d} fill="none"
            stroke={isHot ? CLAUDE.SPARK : CLAUDE.INK}
            strokeWidth={isHot ? 1.2 : 0.8}
            strokeLinecap="round"
            opacity={isHot ? 0.55 : 0.2} />
        );
      })}
    </>
  );
};

// ─── Vignette 4: Stochastic Crystallization ───
const StochasticCrystallization: React.FC<{ frame: number; W: number; H: number }> = ({ frame, W, H }) => {
  const seed = 137;
  const N_SITES = 25;
  const rng = mulberry32(seed);

  const sites: { x: number; y: number; color: string }[] = [];
  for (let i = 0; i < N_SITES; i++) {
    const x = rng() * W;
    const y = rng() * H;
    sites.push({ x, y, color: CLAUDE.INK });
  }

  // Reveal sites one by one
  const revealedCount = Math.min(N_SITES, Math.floor(frame / 8) + 1);

  // Draw Voronoi-ish cells via sampling
  const sampleStep = 28;
  const cells: { x: number; y: number; siteIdx: number; dist: number }[] = [];
  for (let sy = 0; sy < H; sy += sampleStep) {
    for (let sx = 0; sx < W; sx += sampleStep) {
      let minDist = Infinity;
      let minIdx = 0;
      sites.slice(0, revealedCount).forEach((s, i) => {
        const d = Math.hypot(sx - s.x, sy - s.y);
        if (d < minDist) { minDist = d; minIdx = i; }
      });
      cells.push({ x: sx, y: sy, siteIdx: minIdx, dist: minDist });
    }
  }

  // Color by cell size proxy (use site index mod for variation)
  const cellColors: string[] = sites.map((_, i) => {
    const t = (i / N_SITES);
    return t > 0.6 ? CLAUDE.SPARK : CLAUDE.INK;
  });

  return (
    <>
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={cell.x - sampleStep / 2}
          y={cell.y - sampleStep / 2}
          width={sampleStep}
          height={sampleStep}
          fill={cellColors[cell.siteIdx] || CLAUDE.INK}
          opacity={0.08 + (cell.siteIdx / N_SITES) * 0.15}
        />
      ))}
      {sites.slice(0, revealedCount).map((s, i) => (
        <circle
          key={`site-${i}`}
          cx={s.x} cy={s.y}
          r={4}
          fill={cellColors[i]}
          opacity={0.7}
        />
      ))}
    </>
  );
};

// ─── Main gallery component ───
const VIGNETTES = [
  {
    name: 'Quantum Harmonics',
    desc: 'Gridded particles — evolving phase, emergent mandalas.',
    seed: 7,
    Component: QuantumHarmonics,
  },
  {
    name: 'Recursive Whispers',
    desc: 'Golden-ratio branching — line weight thins per level.',
    seed: 13,
    Component: RecursiveWhispers,
  },
  {
    name: 'Field Dynamics',
    desc: 'Born at edges — dying at equilibrium, only traces remain.',
    seed: 99,
    Component: FieldDynamics,
  },
  {
    name: 'Stochastic Crystallization',
    desc: 'Random points relaxing into Voronoi cells — random yet inevitable.',
    seed: 137,
    Component: StochasticCrystallization,
  },
];

export const AlgArtMovementGallery: React.FC<AlgArtMovementGalleryProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();

  const currentSection = Math.min(Math.floor(frame / SECTION_LEN), VIGNETTES.length - 1);
  const sectionFrame = frame - currentSection * SECTION_LEN;
  const nextSection = Math.min(currentSection + 1, VIGNETTES.length - 1);

  // Cross-fade between sections
  const fadeInProgress = clamp(sectionFrame / FADE, 0, 1);
  const isTransition = sectionFrame < FADE && currentSection > 0;
  const prevSectionFrame = SECTION_LEN + sectionFrame;

  const vignette = VIGNETTES[currentSection];
  const Vignette = vignette.Component;
  const prevVignette = VIGNETTES[Math.max(0, currentSection - 1)];
  const PrevVignette = prevVignette.Component;

  const titleOpacity = clamp(interpolate(sectionFrame, [FADE, FADE + 15], [0, 1]), 0, 1);
  const sparkOpacity = clamp(interpolate(frame, [10, 24], [0, 1]), 0, 1);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Previous vignette (fading out during transition) */}
      {isTransition && (
        <svg
          width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          style={{ position: 'absolute', inset: 0, opacity: 1 - fadeInProgress }}
        >
          <PrevVignette frame={prevSectionFrame} W={W} H={H} />
        </svg>
      )}

      {/* Current vignette */}
      <svg
        width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', inset: 0, opacity: isTransition ? fadeInProgress : 1 }}
      >
        <Vignette frame={sectionFrame} W={W} H={H} />
      </svg>

      {/* Gallery plaque */}
      <div style={{
        position: 'absolute',
        left: W * 0.06,
        bottom: H * 0.13,
        opacity: titleOpacity,
      }}>
        <div style={{
          background: 'rgba(250,249,245,0.92)',
          borderRadius: 10,
          padding: '14px 22px',
          display: 'inline-block',
        }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase' as const,
            color: CLAUDE.SPARK,
            marginBottom: 4,
          }}>
            {`MOVEMENT ${currentSection + 1} / ${VIGNETTES.length} · SEED ${vignette.seed}`}
          </div>
          <div style={{
            fontFamily: SERIF,
            fontSize: 24,
            fontWeight: 700,
            color: CLAUDE.INK,
            marginBottom: 4,
          }}>
            {vignette.name}
          </div>
          <div style={{
            fontFamily: SANS,
            fontSize: 13,
            color: CLAUDE.INK_SOFT,
            maxWidth: 480,
          }}>
            {vignette.desc}
          </div>
        </div>
      </div>

      {/* Source citation */}
      <div style={{
        position: 'absolute',
        right: W * 0.05,
        bottom: H * 0.055,
        fontFamily: SANS,
        fontSize: 10,
        color: CLAUDE.GHOST,
        opacity: sparkOpacity,
      }}>
        Source: Anthropic, algorithmic-art SKILL.md
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        right: W * 0.07,
        top: H * 0.08,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: sparkOpacity,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
