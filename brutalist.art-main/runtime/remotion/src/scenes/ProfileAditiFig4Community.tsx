import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileAditiFig4Community — "Invisible Until Absent"
 * A network of 60+ nodes (women in tech) fills and connects,
 * then the facilitator node is removed and the network frays.
 * Beat B04 of claude-liam-profile-aditi-deodhar.
 */

export const profileAditiFig4CommunitySchema = z.object({
  sparkLine: z.string().default("Invisible until it's absent."),
});
export type ProfileAditiFig4CommunityProps = z.infer<typeof profileAditiFig4CommunitySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const NODE_COUNT = 24;
const rng = seededRng(42);
const NODES = Array.from({ length: NODE_COUNT }, (_, i) => ({
  x: 0.12 + rng() * 0.76,
  y: 0.28 + rng() * 0.52,
  r: 5 + rng() * 4,
  isFacilitator: i === 0,
}));
NODES[0] = { x: 0.50, y: 0.52, r: 11, isFacilitator: true };

const EDGES = NODES.map((n, i) => {
  if (i === 0) return null;
  const target = Math.floor(rng() * Math.min(i, NODE_COUNT - 1));
  return { from: i, to: target === i ? 0 : target };
}).filter(Boolean) as { from: number; to: number }[];

export const ProfileAditiFig4Community: React.FC<ProfileAditiFig4CommunityProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.09;
  const netLeft = PAD;
  const netRight = width * 0.60;
  const netW = netRight - netLeft;
  const netTop = height * 0.26;
  const netH = height * 0.52;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const eyebrowIn = spring({ frame, fps, config: { damping: 30, stiffness: 100 } });
  const titleIn   = spring({ frame: frame - Math.round(8 * S),   fps, config: { damping: 28, stiffness: 90 } });
  const networkIn = spring({ frame: frame - Math.round(20 * S),  fps, config: { damping: 24, stiffness: 60 } });
  const fraySt    = frame - Math.round(160 * S);
  const frayIn    = fraySt > 0 ? spring({ frame: fraySt, fps, config: { damping: 28, stiffness: 80 } }) : 0;
  const labelIn   = spring({ frame: frame - Math.round(50 * S),  fps, config: { damping: 28, stiffness: 80 } });
  const chipsIn   = spring({ frame: frame - Math.round(120 * S), fps, config: { damping: 28, stiffness: 80 } });
  const quoteIn   = spring({ frame: frame - Math.round(150 * S), fps, config: { damping: 28, stiffness: 80 } });
  const sparkIn   = spring({ frame: frame - Math.round(230 * S), fps, config: { damping: 28, stiffness: 100 } });

  const facilitatorOpacity = clamp(1 - frayIn * 2, 0, 1);
  const edgeOpacity = clamp(1 - frayIn * 0.8, 0, 1);

  const nodeX = (n: typeof NODES[0]) => netLeft + n.x * netW;
  const nodeY = (n: typeof NODES[0]) => netTop + n.y * netH;

  const CHIPS = [
    'RTC Boston Hub Leader',
    '60+ women in tech · 3 months',
    '2 AnitaB.org mentees',
    'GHC 2024 Advancing Inclusion Scholarship',
  ];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(eyebrowIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.13,
        fontFamily: SERIF, fontSize: height * 0.035, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Invisible Until Absent
      </div>

      {/* Network SVG */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}>
        {/* Edges */}
        {EDGES.map((e, i) => {
          const from = NODES[e.from];
          const to   = NODES[e.to];
          return (
            <line key={i}
              x1={nodeX(from)} y1={nodeY(from)}
              x2={nodeX(to)}   y2={nodeY(to)}
              stroke={CLAUDE.INK_SOFT}
              strokeWidth={1.2}
              strokeOpacity={edgeOpacity * 0.4 * clamp(networkIn, 0, 1)}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((n, i) => {
          const nodeProgress = clamp(networkIn * NODE_COUNT - i * 0.4, 0, 1);
          if (n.isFacilitator) {
            return (
              <g key={i}>
                <circle
                  cx={nodeX(n)} cy={nodeY(n)} r={n.r * 1.6}
                  fill={`${CLAUDE.SPARK}18`}
                  opacity={facilitatorOpacity * clamp(networkIn, 0, 1)}
                />
                <circle
                  cx={nodeX(n)} cy={nodeY(n)} r={n.r}
                  fill={CLAUDE.SPARK}
                  opacity={facilitatorOpacity * clamp(networkIn, 0, 1)}
                />
              </g>
            );
          }
          return (
            <circle key={i}
              cx={nodeX(n)} cy={nodeY(n)} r={n.r}
              fill={CLAUDE.INK_SOFT}
              opacity={0.55 * nodeProgress}
            />
          );
        })}

        {/* Fray indicator — lines going nowhere when facilitator removed */}
        {frayIn > 0.1 && EDGES.slice(0, 6).map((e, i) => {
          const from = NODES[e.from];
          const angle = Math.atan2(nodeY(from) - height * 0.5, nodeX(from) - width * 0.5);
          return (
            <line key={`fray-${i}`}
              x1={nodeX(from)} y1={nodeY(from)}
              x2={nodeX(from) + Math.cos(angle) * 40 * frayIn}
              y2={nodeY(from) + Math.sin(angle) * 40 * frayIn}
              stroke={CLAUDE.INK_SOFT}
              strokeWidth={1.2}
              strokeOpacity={0.3 * frayIn}
              strokeDasharray="4 6"
            />
          );
        })}
      </svg>

      {/* "Three months" label */}
      <div style={{
        position: 'absolute',
        left: netLeft + netW * 0.25, top: netTop - height * 0.04,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 600,
        color: CLAUDE.INK_SOFT, letterSpacing: 1,
        opacity: clamp(labelIn, 0, 1),
      }}>
        60+ women in tech · three months
      </div>

      {/* Quote — "invisible until absent" — appears when fray starts */}
      <div style={{
        position: 'absolute',
        left: netLeft + netW * 0.1,
        top: netTop + netH * 0.4,
        maxWidth: netW * 0.7,
        fontFamily: SERIF, fontSize: height * 0.020, fontStyle: 'italic',
        color: CLAUDE.SPARK,
        opacity: frayIn * clamp(quoteIn, 0, 1),
      }}>
        "invisible until it's absent"
      </div>

      {/* Right side — chips */}
      <div style={{
        position: 'absolute',
        left: netRight + 32, top: netTop + netH * 0.10,
        width: width - netRight - 48,
        display: 'flex', flexDirection: 'column', gap: 14,
        opacity: clamp(chipsIn, 0, 1),
      }}>
        {CHIPS.map((c, i) => (
          <div key={i} style={{
            background: CLAUDE.CARD,
            border: `1.5px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${CLAUDE.SPARK}`,
            borderRadius: 10, padding: '10px 16px',
            fontFamily: SANS, fontSize: height * 0.014,
            color: CLAUDE.INK,
          }}>{c}</div>
        ))}
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.07,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `scale(${idlePulse})`,
      }}>
        <div style={{ transform: `rotate(${frame * 0.15}deg)` }}>
        </div>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
