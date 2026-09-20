import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AlgArtHiddenSeed — flow field with a terracotta annotation ring
 * highlighting where a hidden reference lives in the parameters.
 * The field's rotation constant is derived from 1.618 (golden ratio) —
 * a visible embedded reference only those who know will catch.
 * Verbatim quote: "Think like a jazz musician quoting another song
 * through algorithmic harmony - only those who know will catch it,
 * but everyone appreciates the generative beauty."
 * SEED=256 logged in SOURCES.md. Hidden reference: φ = 1.618.
 */

export const algArtHiddenSeedSchema = z.object({
  sparkLine: z.string().default('Only those who know.'),
});
export type AlgArtHiddenSeedProps = z.infer<typeof algArtHiddenSeedSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const SEED = 256;
const PHI = 1.618033988749895; // the hidden reference
const N_PARTICLES = 120;
const TRAIL_LEN = 20;

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

// PHI (1.618) is the hidden reference embedded in the flow angle multiplier
function flowAngle(x: number, y: number, t: number): number {
  const scale = 0.0032;
  const n1 = vNoise(x * scale + t * 0.035, y * scale, SEED);
  const n2 = vNoise(x * scale, y * scale + t * 0.028, SEED + 500);
  return (n1 * PHI + n2 * 0.618) * Math.PI * 2.618; // PHI embedded here
}

function getTrail(idx: number, W: number, H: number, frame: number): { x: number; y: number }[] {
  const rng = mulberry32(SEED * 1000 + idx * 11);
  let x = rng() * W, y = rng() * H;
  const spd = 1.0 + rng() * 2.0;
  const fastEnd = Math.max(0, frame - TRAIL_LEN);
  for (let t = 0; t < fastEnd; t += 3) {
    const a = flowAngle(x, y, t);
    x = ((x + Math.cos(a) * spd * 3) % W + W) % W;
    y = ((y + Math.sin(a) * spd * 3) % H + H) % H;
  }
  const trail: { x: number; y: number }[] = [];
  for (let t = fastEnd; t <= frame; t++) {
    trail.push({ x, y });
    const a = flowAngle(x, y, t);
    x = ((x + Math.cos(a) * spd) % W + W) % W;
    y = ((y + Math.sin(a) * spd) % H + H) % H;
  }
  return trail;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const AlgArtHiddenSeed: React.FC<AlgArtHiddenSeedProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();

  const fieldOpacity = clamp(interpolate(frame, [0, 20], [0, 1]), 0, 1);
  const ringIn = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 100, mass: 1.2 } });
  const quoteIn = spring({ frame: frame - 50, fps, config: { damping: 30, stiffness: 100, mass: 1.0 } });

  // Annotation ring: center at ~40% x, 45% y
  const ringCX = W * 0.38;
  const ringCY = H * 0.45;
  const ringR = 90;

  const trails = Array.from({ length: N_PARTICLES }, (_, i) => getTrail(i, W, H, frame));

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Flow field */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', inset: 0, opacity: fieldOpacity }}>
        {trails.map((tr, pi) => {
          if (tr.length < 2) return null;
          const inRing = tr.some(pt =>
            Math.hypot(pt.x - ringCX, pt.y - ringCY) < ringR + 20
          );
          const color = inRing ? CLAUDE.SPARK : CLAUDE.INK;
          const d = tr.map((pt, j) => `${j === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
          return (
            <path key={pi} d={d} fill="none"
              stroke={color}
              strokeWidth={inRing ? 1.3 : 0.8}
              strokeLinecap="round"
              opacity={inRing ? 0.6 : 0.22} />
          );
        })}

        {/* Annotation ring */}
        <circle
          cx={ringCX} cy={ringCY} r={ringR}
          fill="none"
          stroke={CLAUDE.SPARK}
          strokeWidth={2.5}
          strokeDasharray="8 5"
          opacity={clamp(ringIn, 0, 1) * 0.85}
        />
        {/* φ label */}
        <text
          x={ringCX + ringR + 12}
          y={ringCY + 7}
          fontFamily={SERIF}
          fontSize={22}
          fill={CLAUDE.SPARK}
          opacity={clamp(ringIn, 0, 1)}
        >
          φ = 1.618
        </text>
        <text
          x={ringCX + ringR + 12}
          y={ringCY + 30}
          fontFamily={SANS}
          fontSize={11}
          fill={CLAUDE.INK_SOFT}
          opacity={clamp(ringIn, 0, 1)}
        >
          the hidden reference
        </text>
      </svg>

      {/* Verbatim quote card */}
      <div style={{
        position: 'absolute',
        left: W * 0.06,
        bottom: H * 0.12,
        maxWidth: W * 0.55,
        opacity: clamp(quoteIn, 0, 1),
        transform: `translateY(${(1 - clamp(quoteIn, 0, 1)) * 14}px)`,
      }}>
        <div style={{
          background: 'rgba(250,249,245,0.93)',
          borderRadius: 12,
          padding: '20px 28px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: 19,
            fontStyle: 'italic',
            color: CLAUDE.INK,
            lineHeight: 1.55,
            marginBottom: 10,
          }}>
            "Think like a jazz musician quoting another song through algorithmic harmony
            — only those who know will catch it, but everyone appreciates the generative beauty."
          </div>
          <div style={{
            fontFamily: SANS,
            fontSize: 10,
            color: CLAUDE.INK_SOFT,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase' as const,
          }}>
            Source: Anthropic, algorithmic-art SKILL.md
          </div>
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        right: W * 0.07,
        top: H * 0.08,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        opacity: fieldOpacity,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
