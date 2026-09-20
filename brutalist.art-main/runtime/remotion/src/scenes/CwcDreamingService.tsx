import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcDreamingService — The Dreaming Service loop
 * Three-node cycle: Session ends → Dreaming synthesizes → Next session loads
 * Source: agents-that-remember/ — CWC Workshop 2026 W3
 */

export const cwcDreamingServiceSchema = z.object({
  sparkLine: z.string().default("Dreaming runs between sessions, not during."),
});
export type CwcDreamingServiceProps = z.infer<typeof cwcDreamingServiceSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const NODES = [
  { label: 'Session ends', sub: 'transcript saved', highlight: false },
  { label: 'Dreaming synthesizes', sub: 'new memories written', highlight: true },
  { label: 'Next session loads', sub: 'memories injected', highlight: false },
];

export const CwcDreamingService: React.FC<CwcDreamingServiceProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 250, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Three nodes arranged in a triangle / cycle shape
  // Top-left, top-right, bottom-center
  const NODE_R = Math.min(width, height) * 0.09;
  const CX = width * 0.5;
  const CY = height * 0.52;
  const ORBIT = height * 0.23;

  const NODE_POSITIONS = [
    { x: CX - ORBIT * 0.95, y: CY - ORBIT * 0.5 },   // Session ends (left)
    { x: CX + ORBIT * 0.95, y: CY - ORBIT * 0.5 },   // Dreaming (right)
    { x: CX, y: CY + ORBIT * 0.7 },                   // Next session (bottom)
  ];

  // Arrow paths between nodes (curved arcs)
  const makeArc = (from: { x: number; y: number }, to: { x: number; y: number }, curvature = 0.25) => {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const cx = mx - dy * curvature;
    const cy = my + dx * curvature;
    return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
  };

  const annotationIn = spring({ frame: frame - 160, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        DREAMING SERVICE · BETWEEN-SESSION LOOP
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        The memory cycle that runs while you're away
      </div>

      {/* SVG layer: arrows */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
        <defs>
          <marker id="dreamArr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.INK_SOFT} />
          </marker>
          <marker id="dreamArrSpark" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.SPARK} />
          </marker>
        </defs>
        {/* Arrow 0→1: Session ends → Dreaming */}
        {(() => {
          const arrIn = spring({ frame: frame - 50, fps, config: { damping: 24, stiffness: 90 } });
          const op = clamp(arrIn, 0, 1);
          return (
            <path
              d={makeArc(NODE_POSITIONS[0], NODE_POSITIONS[1], -0.2)}
              fill="none" stroke={CLAUDE.SPARK} strokeWidth={2.5}
              markerEnd="url(#dreamArrSpark)"
              strokeDasharray="8 4"
              opacity={op}
            />
          );
        })()}
        {/* Arrow 1→2: Dreaming → Next session */}
        {(() => {
          const arrIn = spring({ frame: frame - 100, fps, config: { damping: 24, stiffness: 90 } });
          const op = clamp(arrIn, 0, 1);
          return (
            <path
              d={makeArc(NODE_POSITIONS[1], NODE_POSITIONS[2], -0.2)}
              fill="none" stroke={CLAUDE.INK_SOFT} strokeWidth={2}
              markerEnd="url(#dreamArr)"
              strokeDasharray="8 4"
              opacity={op}
            />
          );
        })()}
        {/* Arrow 2→0: Next session → back to Session ends */}
        {(() => {
          const arrIn = spring({ frame: frame - 150, fps, config: { damping: 24, stiffness: 90 } });
          const op = clamp(arrIn, 0, 1);
          return (
            <path
              d={makeArc(NODE_POSITIONS[2], NODE_POSITIONS[0], -0.2)}
              fill="none" stroke={CLAUDE.INK_SOFT} strokeWidth={2}
              markerEnd="url(#dreamArr)"
              strokeDasharray="8 4"
              opacity={op}
            />
          );
        })()}
      </svg>

      {/* Nodes */}
      {NODES.map((node, i) => {
        const nodeIn = spring({ frame: frame - 20 - i * 35, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
        const pos = NODE_POSITIONS[i];
        return (
          <div key={i} style={{
            position: 'absolute',
            left: pos.x - NODE_R,
            top: pos.y - NODE_R,
            width: NODE_R * 2,
            height: NODE_R * 2,
            borderRadius: '50%',
            background: node.highlight ? `${CLAUDE.SPARK}20` : CLAUDE.CARD,
            border: node.highlight ? `2.5px solid ${CLAUDE.SPARK}` : `1.5px solid ${CLAUDE.BORDER}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 4, textAlign: 'center' as const, padding: 12,
            opacity: clamp(nodeIn, 0, 1),
            transform: `scale(${0.7 + 0.3 * clamp(nodeIn, 0, 1)})`,
          }}>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
              color: node.highlight ? CLAUDE.SPARK : CLAUDE.INK,
              textTransform: 'uppercase' as const, letterSpacing: 1,
            }}>
              {node.label}
            </div>
            <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT }}>
              {node.sub}
            </div>
          </div>
        );
      })}

      {/* Annotation */}
      <div style={{
        position: 'absolute',
        left: width * 0.62, top: height * 0.24,
        width: width * 0.30,
        background: `${CLAUDE.INK_SOFT}10`,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 8, padding: '12px 16px',
        opacity: clamp(annotationIn, 0, 1),
        transform: `translateX(${(1 - clamp(annotationIn, 0, 1)) * 14}px)`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.013, color: CLAUDE.INK, fontStyle: 'italic', lineHeight: 1.6 }}>
          "Runs between sessions, not during — zero latency impact on your conversation."
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
