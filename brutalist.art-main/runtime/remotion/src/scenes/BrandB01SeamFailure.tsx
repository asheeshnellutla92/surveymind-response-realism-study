import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01SeamFailure — B01 beat for boondoggle-score-calculator.
 * Enacts the narration: a task flow [Human] → Claude → [Human paste] → [Email]
 * Phase 1 builds clean; Phase 2 reveals the seam failure — the paste step is
 * crossed out and the Claude→Human arrow turns terracotta.
 * Duration: 627 frames @ 30fps (20.9s)
 * Source: Branding and AI, Chapter 97 — Fundamental Themes (Nina Harris).
 */
export const brandB01SeamFailureSchema = z.object({
  sparkLine: z.string().default('Most AI failures are seam failures.'),
});
export type BrandB01SeamFailureProps = z.infer<typeof brandB01SeamFailureSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface NodeDef {
  label: string;
  sublabel: string;
  isAI: boolean;
}

const NODES: NodeDef[] = [
  { label: 'Human', sublabel: 'Write crisis statement', isAI: false },
  { label: 'Claude', sublabel: 'Drafts from training', isAI: true },
  { label: 'Human', sublabel: 'Paste → send', isAI: false },
  { label: 'Email sent', sublabel: 'Legal exposure owned', isAI: false },
];

export const BrandB01SeamFailure: React.FC<BrandB01SeamFailureProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase 1: 0–80 — flow builds left to right
  // Phase 2: 80+ — seam gap highlights, paste crossed out

  const titleIn = clamp(
    spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } }),
    0, 1
  );

  // Each node springs in with staggered delay
  const nodeDelay = 18;
  const nodeSprings = NODES.map((_, i) =>
    clamp(spring({ frame: frame - (10 + i * nodeDelay), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );

  // Arrows between nodes (3 arrows for 4 nodes)
  const arrowDelay = 18;
  const arrowSprings = [0, 1, 2].map((i) =>
    clamp(spring({ frame: frame - (20 + i * nodeDelay), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );

  // Phase 2 triggers
  const seamIn = clamp(
    spring({ frame: frame - 80, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  const crossIn = clamp(
    spring({ frame: frame - 100, fps, config: { damping: 30, stiffness: 150, mass: 0.7 } }),
    0, 1
  );

  const finalAnnotationIn = clamp(
    spring({ frame: frame - 140, fps, config: { damping: 26, stiffness: 100, mass: 1 } }),
    0, 1
  );

  const footerIn = clamp(interpolate(frame, [40, 65], [0, 1]), 0, 1);

  // Layout — fill the canvas: nodes stay within safe area
  const PAD_H = width * 0.06;
  const NODE_W = width * 0.18;
  const NODE_H = height * 0.24;
  // Spread nodes so left edge of first = PAD_H, right edge of last = width - PAD_H
  const TOTAL_W = width - PAD_H * 2 - NODE_W;
  const STEP = TOTAL_W / (NODES.length - 1);
  const DIAGRAM_TOP = height * 0.18;
  const DIAGRAM_BOT = height * 0.85;
  const FLOW_Y = (DIAGRAM_TOP + DIAGRAM_BOT) / 2 - NODE_H / 2;

  const nodeX = (i: number) => PAD_H + i * STEP;
  const nodeCX = (i: number) => nodeX(i) + NODE_W / 2;

  // The seam is between node 1 (Claude) and node 2 (Human paste)
  const SEAM_IDX = 1; // arrow between node 1 and node 2

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.04,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SERIF,
        fontSize: Math.round(Math.min(width, height) * 0.075),
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Crisis statement flow
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      <div style={{
        position: 'absolute',
        top: height * 0.04 + height * 0.088,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SANS,
        fontSize: Math.round(height * 0.033),
        color: frame >= 80 ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
        transition: 'color 0.3s',
      }}>
        {frame < 80 ? 'Seems clean. — AI drafts, human sends.' : 'Seam failure: approval was handed to the model.'}
      </div>

      {/* SVG arrows */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}
        width={width}
        height={height}
      >
        {[0, 1, 2].map((i) => {
          const x1 = nodeX(i) + NODE_W;
          const x2 = nodeX(i + 1);
          const y = FLOW_Y + NODE_H / 2;
          const isSeamArrow = i === SEAM_IDX;
          const arrowColor = (frame >= 80 && isSeamArrow)
            ? CLAUDE.SPARK
            : CLAUDE.BORDER;
          const arrowW = (frame >= 80 && isSeamArrow) ? 6 : 5;
          const progress = arrowSprings[i];

          return (
            <g key={i} opacity={progress}>
              <line
                x1={x1} y1={y}
                x2={x1 + (x2 - x1) * progress} y2={y}
                stroke={arrowColor}
                strokeWidth={arrowW}
              />
              {progress > 0.9 && (
                <polygon
                  points={`${x2},${y} ${x2 - 16},${y - 10} ${x2 - 16},${y + 10}`}
                  fill={arrowColor}
                />
              )}
            </g>
          );
        })}

        {/* Seam gap highlight (phase 2) */}
        {frame >= 80 && (
          <g opacity={seamIn}>
            <rect
              x={nodeX(SEAM_IDX) + NODE_W - 4}
              y={FLOW_Y - 16}
              width={(nodeX(SEAM_IDX + 1) - nodeX(SEAM_IDX) - NODE_W) + 8}
              height={NODE_H + 32}
              rx={6}
              fill={`rgba(217,119,87,0.08)`}
              stroke={CLAUDE.SPARK}
              strokeWidth={2.5}
              strokeDasharray="8 5"
            />
            <text
              x={(nodeX(SEAM_IDX) + NODE_W + nodeX(SEAM_IDX + 1)) / 2}
              y={FLOW_Y + NODE_H + 60}
              fontFamily={SANS} fontSize={28} fontWeight={700}
              fill={CLAUDE.SPARK} textAnchor="middle"
            >
              THE SEAM
            </text>
          </g>
        )}

        {/* Cross-out stroke on paste node (node 2) — phase 2 */}
        {frame >= 100 && (
          <g opacity={crossIn}>
            <line
              x1={nodeX(2) - 6}
              y1={FLOW_Y - 10}
              x2={nodeX(2) + NODE_W * crossIn + 6}
              y2={FLOW_Y + NODE_H + 10}
              stroke={CLAUDE.SPARK}
              strokeWidth={8}
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>

      {/* Flow nodes */}
      {NODES.map((node, i) => {
        const sp = nodeSprings[i];
        const isClaudeNode = i === 1;
        const isPasteNode = i === 2;
        const isHighlighted = frame >= 80 && (isPasteNode || isClaudeNode);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: nodeX(i),
              top: FLOW_Y,
              width: NODE_W,
              height: NODE_H,
              background: isClaudeNode ? CLAUDE.FOOTER : CLAUDE.CARD,
              border: `2px solid ${isHighlighted && frame >= 80 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 10px',
              boxShadow: '0 2px 10px rgba(61,57,41,0.06)',
              opacity: sp,
              transform: `translateY(${(1 - sp) * 20}px)`,
            }}
          >
            <div style={{
              fontFamily: SERIF,
              fontSize: Math.round(height * 0.036),
              fontWeight: 700,
              color: isClaudeNode ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'center',
              lineHeight: 1.2,
            }}>
              {node.label}
            </div>
            <div style={{
              fontFamily: SANS,
              fontSize: Math.round(height * 0.026),
              color: CLAUDE.INK_SOFT,
              textAlign: 'center',
              marginTop: 6,
              lineHeight: 1.3,
            }}>
              {node.sublabel}
            </div>
            {/* Paste node: "No real read" label */}
            {isPasteNode && frame >= 80 && (
              <div style={{
                fontFamily: SANS,
                fontSize: Math.round(height * 0.024),
                color: CLAUDE.SPARK,
                textAlign: 'center',
                marginTop: 6,
                fontWeight: 700,
                opacity: seamIn,
              }}>
                No real read.
              </div>
            )}
          </div>
        );
      })}

      {/* Final annotation — "Most AI failures are seam failures" */}
      {frame >= 140 && (
        <div style={{
          position: 'absolute',
          left: PAD_H,
          right: PAD_H,
          top: FLOW_Y + NODE_H + 90,
          background: CLAUDE.CARD,
          border: `2px solid ${CLAUDE.SPARK}`,
          borderRadius: 12,
          padding: '18px 28px',
          fontFamily: SANS,
          fontSize: Math.round(height * 0.028),
          fontWeight: 700,
          color: CLAUDE.INK,
          textAlign: 'center',
          opacity: finalAnnotationIn,
          transform: `translateY(${(1 - finalAnnotationIn) * 10}px)`,
          boxShadow: '0 4px 20px rgba(217,119,87,0.10)',
        }}>
          <span style={{ color: CLAUDE.SPARK }}>Most AI failures are seam failures.</span>
        </div>
      )}

      {/* Footer sparkLine */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SANS,
        fontSize: Math.round(Math.min(width, height) * 0.034),
        color: CLAUDE.INK_SOFT,
        opacity: footerIn,
        borderTop: `1px solid ${CLAUDE.BORDER}`,
        paddingTop: 12,
      }}>
        <span style={{ color: CLAUDE.SPARK, fontWeight: 700, marginRight: 10 }}>Boondoggle Score:</span>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
