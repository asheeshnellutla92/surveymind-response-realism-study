import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AlgArtSeedGrid — 3×3 grid of the same generative algorithm run with 9 different seeds.
 * Seeds logged in SOURCES.md: 1, 7, 13, 42, 99, 137, 256, 314, 512.
 * Tiles materialize one by one. Terracotta ring on seed=42 (tile index 3).
 * Caption verbatim: "a series of prints from the same plate."
 * Re-run seed 42 with identical output demonstrates reproducibility.
 */

export const algArtSeedGridSchema = z.object({
  sparkLine: z.string().default('The plate. The print.'),
  highlightSeed: z.number().default(3), // index in the 3×3 grid (0-indexed)
});
export type AlgArtSeedGridProps = z.infer<typeof algArtSeedGridSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const SEEDS = [1, 7, 13, 42, 99, 137, 256, 314, 512];
const SEED_VALUES = [1, 7, 13, 42, 99, 137, 256, 314, 512];

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

// Mini flow field for each tile (small scale)
function TileViz({ seed, W, H, frame }: { seed: number; W: number; H: number; frame: number }) {
  const N = 35;
  const TRAIL = 12;
  const trails: { x: number; y: number }[][] = [];

  for (let i = 0; i < N; i++) {
    const rng = mulberry32(seed * 1000 + i * 13);
    let x = rng() * W, y = rng() * H;
    const spd = 0.8 + rng() * 1.5;
    const fastEnd = Math.max(0, frame - TRAIL);
    for (let t = 0; t < fastEnd; t += 3) {
      const angle = (vNoise(x * 0.008 + t * 0.04, y * 0.008, seed) * 1.6 +
        vNoise(x * 0.008, y * 0.008 + t * 0.03, seed + 123) * 0.7) * Math.PI * 3;
      x = ((x + Math.cos(angle) * spd * 3) % W + W) % W;
      y = ((y + Math.sin(angle) * spd * 3) % H + H) % H;
    }
    const trail: { x: number; y: number }[] = [];
    for (let t = fastEnd; t <= frame; t++) {
      trail.push({ x, y });
      const angle = (vNoise(x * 0.008 + t * 0.04, y * 0.008, seed) * 1.6 +
        vNoise(x * 0.008, y * 0.008 + t * 0.03, seed + 123) * 0.7) * Math.PI * 3;
      x = ((x + Math.cos(angle) * spd) % W + W) % W;
      y = ((y + Math.sin(angle) * spd) % H + H) % H;
    }
    trails.push(trail);
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {trails.map((tr, pi) => {
        if (tr.length < 2) return null;
        const rng2 = mulberry32(seed * 1000 + pi * 13 + 9999);
        const isHot = rng2() * rng2() > 0.55;
        const d = tr.map((pt, j, arr) => {
          if (j === 0) return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          const prev = arr[j - 1];
          if (Math.abs(pt.x - prev.x) > W / 2 || Math.abs(pt.y - prev.y) > H / 2) {
            return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          }
          return `L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        }).join(' ');
        return (
          <path key={pi} d={d} fill="none"
            stroke={isHot ? CLAUDE.SPARK : CLAUDE.INK}
            strokeWidth={isHot ? 1.2 : 0.7}
            strokeLinecap="round"
            opacity={isHot ? 0.6 : 0.28} />
        );
      })}
    </svg>
  );
}

export const AlgArtSeedGrid: React.FC<AlgArtSeedGridProps> = ({ sparkLine, highlightSeed }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();

  // Tile dimensions: 3×3 grid with padding
  const PAD = 60;
  const GAP = 16;
  const tileW = (W - PAD * 2 - GAP * 2) / 3;
  const tileH = (H * 0.72 - GAP * 2) / 3;

  const gridTop = H * 0.14;

  const titleIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const captionIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 110, mass: 1.0 } });

  // Tiles materialize one by one: staggered entry
  const TILE_STRIDE = 14; // frames between each tile appearing

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: H * 0.07,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        SAME PLATE · DIFFERENT PRINTS · THE ART BLOCKS PATTERN
      </div>

      {/* 3×3 grid */}
      <div style={{
        position: 'absolute',
        top: gridTop,
        left: PAD,
        right: PAD,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: GAP,
        height: H * 0.72,
      }}>
        {SEEDS.map((seed, idx) => {
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          const tileFrame = frame - idx * TILE_STRIDE;
          const tileOpacity = clamp(interpolate(tileFrame, [0, 12], [0, 1]), 0, 1);
          const isHighlight = idx === highlightSeed;
          const isVisible = tileFrame > 0;

          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                background: CLAUDE.CARD,
                border: `1.5px solid ${isHighlight ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderRadius: 10,
                overflow: 'hidden',
                opacity: tileOpacity,
                boxShadow: isHighlight
                  ? '0 0 0 2px rgba(217,119,87,0.3), 0 4px 16px rgba(61,57,41,0.12)'
                  : '0 2px 8px rgba(61,57,41,0.08)',
              }}
            >
              {isVisible && (
                <TileViz seed={seed} W={tileW} H={tileH} frame={Math.max(0, tileFrame)} />
              )}
              {/* Seed label */}
              <div style={{
                position: 'absolute',
                bottom: 6,
                left: 8,
                fontFamily: SANS,
                fontSize: 10,
                fontWeight: 700,
                color: isHighlight ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                opacity: 0.9,
              }}>
                seed {SEED_VALUES[idx]}
              </div>
              {/* Terracotta ring overlay for highlight tile */}
              {isHighlight && (
                <svg
                  style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                  width={tileW} height={tileH}
                  viewBox={`0 0 ${tileW} ${tileH}`}
                >
                  <rect
                    x={3} y={3} width={tileW - 6} height={tileH - 6}
                    fill="none"
                    stroke={CLAUDE.SPARK}
                    strokeWidth={2.5}
                    rx={8}
                    opacity={0.75}
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute',
        bottom: H * 0.07,
        left: 0, right: 0,
        textAlign: 'center',
        opacity: clamp(captionIn, 0, 1),
        transform: `translateY(${(1 - clamp(captionIn, 0, 1)) * 8}px)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <span style={{
            fontFamily: SERIF,
            fontSize: 22,
            fontStyle: 'italic',
            color: CLAUDE.INK,
          }}>
            "a series of prints from the same plate"
          </span>
        </div>
        <div style={{
          marginTop: 6,
          fontFamily: SANS,
          fontSize: 10,
          color: CLAUDE.GHOST,
        }}>
          Source: Anthropic, algorithmic-art SKILL.md
        </div>
      </div>

    </AbsoluteFill>
  );
};
