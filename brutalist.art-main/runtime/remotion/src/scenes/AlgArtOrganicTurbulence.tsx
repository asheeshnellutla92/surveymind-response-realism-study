import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AlgArtOrganicTurbulence — living flow-field generative system.
 * Deterministic: seeded at SEED=42, frame-keyed.
 * Particles follow Perlin-like noise vectors; fast particles → terracotta,
 * slow ones → ink shadow. Runs the kind of art the algorithmic-art skill produces.
 * Palette: cream #FAF9F5 page, warm ink #3D3929, terracotta #D97757 for focal particles.
 * SEED=42 logged in SOURCES.md.
 */

export const algArtOrganicTurbulenceSchema = z.object({
  sparkLine: z.string().default('Order from disorder.'),
  showTitle: z.boolean().default(true),
});
export type AlgArtOrganicTurbulenceProps = z.infer<typeof algArtOrganicTurbulenceSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const SEED = 42;
const N_PARTICLES = 140;
const TRAIL_LEN = 22;
const STEP_FAST = 3;

// Seeded PRNG
function mulberry32(s: number) {
  return function() {
    s = (s | 0) + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Value noise 2D
function vNoise(x: number, y: number, seedOff: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const h = (px: number, py: number) => {
    const n = Math.sin(px * 127.1 + py * 311.7 + seedOff * 7.31) * 43758.5453;
    return n - Math.floor(n);
  };
  const a = h(ix, iy), b = h(ix + 1, iy), c = h(ix, iy + 1), d = h(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function flowAngle(x: number, y: number, t: number): number {
  const scale = 0.0035;
  const n1 = vNoise(x * scale + t * 0.04, y * scale, SEED);
  const n2 = vNoise(x * scale, y * scale + t * 0.03, SEED + 987);
  return (n1 * 1.6 + n2 * 0.7) * Math.PI * 3;
}

interface Trail { points: { x: number; y: number }[]; speed: number }

function getTrail(particleIndex: number, W: number, H: number, frame: number): Trail {
  const rng = mulberry32(SEED * 1000 + particleIndex * 7);
  let x = rng() * W;
  let y = rng() * H;
  const spd = 1.2 + rng() * 2.2;

  const target = frame;
  const fastEnd = Math.max(0, target - TRAIL_LEN);

  // Fast-forward
  for (let t = 0; t < fastEnd; t += STEP_FAST) {
    const angle = flowAngle(x, y, t);
    x = ((x + Math.cos(angle) * spd * STEP_FAST) % W + W) % W;
    y = ((y + Math.sin(angle) * spd * STEP_FAST) % H + H) % H;
  }

  // Collect trail
  const points: { x: number; y: number }[] = [];
  for (let t = fastEnd; t <= target; t++) {
    points.push({ x, y });
    const angle = flowAngle(x, y, t);
    x = ((x + Math.cos(angle) * spd) % W + W) % W;
    y = ((y + Math.sin(angle) * spd) % H + H) % H;
  }
  return { points, speed: spd };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const AlgArtOrganicTurbulence: React.FC<AlgArtOrganicTurbulenceProps> = ({
  sparkLine, showTitle,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Build particle trails
  const particles: Trail[] = [];
  for (let i = 0; i < N_PARTICLES; i++) {
    particles.push(getTrail(i, width, height, frame));
  }

  // Fade in over first 20 frames
  const globalOpacity = clamp(interpolate(frame, [0, 20], [0, 1]), 0, 1);
  const titleOpacity = clamp(interpolate(frame, [8, 22], [0, 1]), 0, 1);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Flow field SVG */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', inset: 0, opacity: globalOpacity }}
      >
        {particles.map((p, pi) => {
          if (p.points.length < 2) return null;
          const isHot = p.speed > 2.8;
          const baseColor = isHot ? CLAUDE.SPARK : CLAUDE.INK;
          const d = p.points.map((pt, i, arr) => {
            if (i === 0) return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
            const prev = arr[i - 1];
            if (Math.abs(pt.x - prev.x) > width / 2 || Math.abs(pt.y - prev.y) > height / 2) {
              return `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
            }
            return `L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          }).join(' ');
          return (
            <path
              key={pi}
              d={d}
              fill="none"
              stroke={baseColor}
              strokeWidth={isHot ? 1.4 : 0.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isHot ? 0.65 : 0.25}
            />
          );
        })}
        {/* Dot at current particle tip (fast particles only) */}
        {particles.filter(p => p.speed > 2.8 && p.points.length > 0).map((p, pi) => {
          const tip = p.points[p.points.length - 1];
          return (
            <circle
              key={`dot-${pi}`}
              cx={tip.x}
              cy={tip.y}
              r={2.2}
              fill={CLAUDE.SPARK}
              opacity={0.8}
            />
          );
        })}
      </svg>

      {/* Title name card */}
      {showTitle && (
        <div style={{
          position: 'absolute',
          left: width * 0.07,
          bottom: height * 0.14,
          opacity: titleOpacity,
        }}>
          <div style={{
            background: 'rgba(250,249,245,0.92)',
            borderRadius: 12,
            padding: '18px 28px',
            backdropFilter: 'blur(4px)',
            display: 'inline-block',
          }}>
            <div style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase' as const,
              color: CLAUDE.SPARK,
              marginBottom: 6,
            }}>
              ORGANIC TURBULENCE · SEED 42
            </div>
            <div style={{
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: CLAUDE.INK,
              lineHeight: 1.3,
              maxWidth: 500,
            }}>
              Chaos constrained by natural law,<br />
              order emerging from disorder.
            </div>
          </div>
        </div>
      )}

      {/* Source citation */}
      <div style={{
        position: 'absolute',
        right: width * 0.05,
        bottom: height * 0.055,
        fontFamily: SANS,
        fontSize: 10,
        color: CLAUDE.GHOST,
        opacity: titleOpacity,
      }}>
        Source: Anthropic, algorithmic-art SKILL.md
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        right: width * 0.07,
        top: height * 0.08,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: titleOpacity,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
