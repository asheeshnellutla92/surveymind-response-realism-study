import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PrincipalsNaiveView — "Claude's Three Principals" B01
 * Source: Anthropic Claude Constitution, January 2026
 *
 * PHASE 1 (frames 0–89): The naive picture.
 *   User icon → arrow → Claude circle → arrow → Response chip.
 *   Label: "How most people think it works."
 *   All in INK on PAGE.
 *
 * PHASE 2 (frames 90–299): The naive arrow shatters (terracotta flash +
 *   scale-down + opacity fade). Three labeled nodes emerge:
 *   "Anthropic" (top), "Operator" (middle), "User" (bottom), each with
 *   arrows pointing to Claude. Labels stagger in.
 *
 * Terracotta accent: the shattering arrow and the flash that triggers phase 2.
 * ONE terracotta moment per beat — the transition flash is it.
 */

export const principalsNaiveViewSchema = z.object({
  sparkLine: z.string().default('Three, not one.'),
});

export type PrincipalsNaiveViewProps = z.infer<typeof principalsNaiveViewSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; opacity: number }> = ({
  x1, y1, x2, y2, color, opacity,
}) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len;
  const ny = dy / len;
  const headLen = 14;
  const ax = x2 - nx * headLen - ny * headLen * 0.5;
  const ay = y2 - ny * headLen + nx * headLen * 0.5;
  const bx = x2 - nx * headLen + ny * headLen * 0.5;
  const by = y2 - ny * headLen - nx * headLen * 0.5;

  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} fill={color} />
    </g>
  );
};

export const PrincipalsNaiveView: React.FC<PrincipalsNaiveViewProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PHASE_BREAK = 75; // frame at which phase 1 → phase 2 transition begins
  const PHASE2_START = 90;

  // Phase 1 elements animate in
  const phase1In = spring({ frame, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });

  // Shatter: the naive arrow/picture fades out with a terracotta flash
  const shatterProgress = spring({
    frame: frame - PHASE_BREAK,
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.6 },
  });
  const naiveOpacity = clamp(1 - shatterProgress, 0, 1);

  // Terracotta flash peaks at shatter
  const flashOpacity = frame >= PHASE_BREAK
    ? interpolate(shatterProgress, [0, 0.4, 1], [0, 0.45, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Phase 2 nodes stagger in
  const p2Delays = [0, 18, 36]; // Anthropic, Operator, User
  const phase2Anims = p2Delays.map(d =>
    spring({ frame: frame - PHASE2_START - d, fps, config: { damping: 26, stiffness: 90, mass: 0.9 } })
  );

  // Spark line
  const sparkIn = spring({ frame: frame - PHASE2_START - 60, fps, config: { damping: 28, stiffness: 90, mass: 0.9 } });
  // Citation
  const citeIn = spring({ frame: frame - PHASE2_START - 70, fps, config: { damping: 28, stiffness: 90, mass: 0.9 } });

  const PAD_X = width * 0.08;
  const PAD_Y = height * 0.08;
  const CX = width / 2; // Center X (Claude circle)
  const CY = height / 2 + 20;
  const CLAUDE_R = 56;

  // Naive picture layout
  const USER_X = width * 0.2;
  const RESP_X = width * 0.8;

  // Phase 2 layout
  const NODES = [
    { label: 'Anthropic', y: CY - 190, color: CLAUDE.INK },
    { label: 'Operator', y: CY, color: CLAUDE.INK },
    { label: 'User', y: CY + 190, color: CLAUDE.INK_SOFT },
  ];
  const NODE_LEFT = width * 0.22;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Terracotta flash overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: CLAUDE.SPARK,
        opacity: flashOpacity,
        pointerEvents: 'none',
      }} />

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.014,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(phase1In, 0, 1),
      }}>
        AI DESIGN · CLAUDE CONSTITUTION
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.06,
        fontFamily: SERIF,
        fontSize: height * 0.038,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(phase1In, 0, 1),
        transform: `translateY(${(1 - phase1In) * 10}px)`,
      }}>
        Claude's Three Principals
      </div>

      {/* ── PHASE 1: Naive picture (SVG) ── */}
      <svg
        style={{
          position: 'absolute',
          left: 0, top: 0,
          width, height,
          opacity: clamp(naiveOpacity * phase1In, 0, 1),
        }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* User circle */}
        <circle cx={USER_X} cy={CY} r={46} fill={CLAUDE.PILL} stroke={CLAUDE.BORDER} strokeWidth={2} />
        <text x={USER_X} y={CY - 8} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>You</text>
        <text x={USER_X} y={CY + 12} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>(User)</text>

        {/* Arrow user → Claude */}
        <Arrow x1={USER_X + 50} y1={CY} x2={CX - CLAUDE_R - 8} y2={CY} color={CLAUDE.GHOST} opacity={1} />

        {/* Claude circle */}
        <circle cx={CX} cy={CY} r={CLAUDE_R} fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={2.5} />
        <text x={CX} y={CY + 7} textAnchor="middle" fontFamily={SERIF} fontSize={20} fontWeight={600} fill={CLAUDE.INK}>Claude</text>

        {/* Arrow Claude → Response */}
        <Arrow x1={CX + CLAUDE_R + 8} y1={CY} x2={RESP_X - 54} y2={CY} color={CLAUDE.GHOST} opacity={1} />

        {/* Response chip */}
        <rect x={RESP_X - 54} y={CY - 28} width={110} height={56} rx={10} fill={CLAUDE.PILL} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
        <text x={RESP_X} y={CY - 4} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>Response</text>
        <text x={RESP_X} y={CY + 14} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={CLAUDE.INK_SOFT}>↩</text>
      </svg>

      {/* Naive label */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        top: CY + 100,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: height * 0.020,
        fontStyle: 'italic',
        color: CLAUDE.INK_SOFT,
        opacity: clamp(naiveOpacity * phase1In, 0, 1),
      }}>
        How most people think it works.
      </div>

      {/* ── PHASE 2: Three-node diagram (SVG) ── */}
      <svg
        style={{
          position: 'absolute',
          left: 0, top: 0,
          width, height,
        }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Claude center circle — fades in with first node */}
        <g opacity={clamp(phase2Anims[0], 0, 1)}>
          <circle cx={CX} cy={CY} r={CLAUDE_R} fill={CLAUDE.CARD} stroke={CLAUDE.BORDER} strokeWidth={2.5} />
          <text x={CX} y={CY + 7} textAnchor="middle" fontFamily={SERIF} fontSize={20} fontWeight={600} fill={CLAUDE.INK}>Claude</text>
        </g>

        {/* Three principal nodes */}
        {NODES.map((node, i) => {
          const anim = phase2Anims[i];
          const nodeX = NODE_LEFT;
          const arrowOpacity = clamp(anim, 0, 1);

          // Arrow from principal node to Claude
          const arrowX1 = nodeX + 80;
          const arrowX2 = CX - CLAUDE_R - 10;
          const dy = CY - node.y;
          const dist = Math.sqrt((arrowX2 - arrowX1) ** 2 + dy ** 2);
          const nx2 = (arrowX2 - arrowX1) / dist;
          const ny2 = dy / dist;

          return (
            <g key={node.label} opacity={clamp(anim, 0, 1)}
              transform={`translateX(${(1 - anim) * -30}px)`}>
              {/* Node box */}
              <rect
                x={nodeX - 80}
                y={node.y - 28}
                width={162}
                height={56}
                rx={10}
                fill={i === 2 ? CLAUDE.PILL : CLAUDE.CARD}
                stroke={CLAUDE.BORDER}
                strokeWidth={1.5}
              />
              <text
                x={nodeX + 1}
                y={node.y + 8}
                textAnchor="middle"
                fontFamily={SERIF}
                fontSize={18}
                fontWeight={600}
                fill={node.color}
              >{node.label}</text>

              {/* Arrow to Claude */}
              <Arrow
                x1={nodeX + 82}
                y1={node.y}
                x2={CX - CLAUDE_R - 10}
                y2={node.y === CY ? CY : node.y + (CY - node.y) * 0.85}
                color={i === 1 ? CLAUDE.INK : CLAUDE.GHOST}
                opacity={arrowOpacity}
              />
            </g>
          );
        })}

        {/* Terracotta highlight ring on the Operator node */}
        <g opacity={clamp(phase2Anims[1], 0, 1)}>
          <rect
            x={NODE_LEFT - 80}
            y={NODES[1].y - 28}
            width={162}
            height={56}
            rx={10}
            fill="none"
            stroke={CLAUDE.SPARK}
            strokeWidth={2.5}
          />
        </g>
      </svg>

      {/* Phase 2 principal role labels (right side) */}
      {NODES.map((node, i) => (
        <div key={node.label + '-chip'} style={{
          position: 'absolute',
          left: NODE_LEFT + 100,
          top: node.y - 12,
          fontFamily: SANS,
          fontSize: height * 0.013,
          color: CLAUDE.INK_SOFT,
          opacity: clamp(phase2Anims[i], 0, 1),
          transform: `translateX(${(1 - phase2Anims[i]) * 20}px)`,
        }}>
          {i === 0 && 'training-time rules'}
          {i === 1 && 'system prompt · deployment context'}
          {i === 2 && 'conversation messages'}
        </div>
      ))}

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Source: Anthropic Claude Constitution, January 2026
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        bottom: height * 0.055,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.022,
          fontStyle: 'italic',
          color: CLAUDE.INK,
        }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
