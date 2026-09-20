import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcMemoryRetrieval — How memory gets recalled
 * Linear flow: user message → semantic lookup → top-3 retrieved → injected into context
 * Source: agents-that-remember/ — CWC Workshop 2026 W3
 */

export const cwcMemoryRetrievalSchema = z.object({
  sparkLine: z.string().default("Retrieval happens before the first token."),
});
export type CwcMemoryRetrievalProps = z.infer<typeof cwcMemoryRetrievalSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STEPS = [
  {
    id: 'msg',
    label: 'User message arrives',
    sub: '"What\'s my coding style?"',
    highlight: false,
  },
  {
    id: 'lookup',
    label: 'Semantic lookup fires',
    sub: 'embedding similarity search',
    highlight: false,
  },
  {
    id: 'retrieve',
    label: 'Top-3 memories retrieved',
    sub: 'prefers_async, timezone, py_version',
    highlight: false,
  },
  {
    id: 'inject',
    label: 'Injected into context prefix',
    sub: 'before the agent reads the message',
    highlight: true,
  },
];

export const CwcMemoryRetrieval: React.FC<CwcMemoryRetrievalProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 250, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const NODE_W = width * 0.18;
  const NODE_H = height * 0.22;
  const NODE_Y = height * 0.34;
  const TOTAL_W = width * 0.88;
  const STEP_GAP = (TOTAL_W - NODE_W * 4) / 3;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        MEMORY RETRIEVAL · RECALL FLOW
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        How the agent recalls what it knows about you
      </div>

      {/* Steps */}
      {STEPS.map((step, i) => {
        const nodeIn = spring({ frame: frame - 25 - i * 40, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
        const arrowIn = spring({ frame: frame - 50 - i * 40, fps, config: { damping: 26, stiffness: 100 } });
        const nodeX = PAD_X + i * (NODE_W + STEP_GAP);

        return (
          <React.Fragment key={step.id}>
            {/* Node */}
            <div style={{
              position: 'absolute',
              left: nodeX, top: NODE_Y,
              width: NODE_W, height: NODE_H,
              borderRadius: 10,
              background: step.highlight ? `${CLAUDE.SPARK}18` : CLAUDE.CARD,
              border: step.highlight ? `2px solid ${CLAUDE.SPARK}` : `1.5px solid ${CLAUDE.BORDER}`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              textAlign: 'center' as const, padding: '10px 12px', gap: 8,
              opacity: clamp(nodeIn, 0, 1),
              transform: `scale(${0.8 + 0.2 * clamp(nodeIn, 0, 1)})`,
            }}>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
                color: step.highlight ? CLAUDE.SPARK : CLAUDE.INK,
                lineHeight: 1.4,
              }}>
                {step.label}
              </div>
              <div style={{
                fontFamily: MONO, fontSize: height * 0.010,
                color: step.highlight ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                lineHeight: 1.3,
              }}>
                {step.sub}
              </div>
            </div>
            {/* Step number */}
            <div style={{
              position: 'absolute',
              left: nodeX + NODE_W / 2 - height * 0.022,
              top: NODE_Y - height * 0.06,
              width: height * 0.044, height: height * 0.044,
              borderRadius: '50%',
              background: step.highlight ? CLAUDE.SPARK : CLAUDE.BORDER,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
              color: step.highlight ? CLAUDE.PAGE : CLAUDE.INK_SOFT,
              opacity: clamp(nodeIn, 0, 1),
            }}>
              {i + 1}
            </div>
            {/* Arrow to next */}
            {i < STEPS.length - 1 && (
              <svg style={{
                position: 'absolute',
                left: nodeX + NODE_W,
                top: NODE_Y + NODE_H / 2 - 14,
                width: STEP_GAP,
                height: 28,
                overflow: 'visible',
                opacity: clamp(arrowIn, 0, 1),
              }}>
                <defs>
                  <marker id={`retArr${i}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.INK_SOFT} />
                  </marker>
                </defs>
                <line x1={0} y1={14} x2={STEP_GAP - 6} y2={14}
                  stroke={CLAUDE.INK_SOFT} strokeWidth={2} markerEnd={`url(#retArr${i})`} />
              </svg>
            )}
          </React.Fragment>
        );
      })}

      {/* Timing note */}
      {(() => {
        const noteIn = spring({ frame: frame - 200, fps, config: { damping: 26, stiffness: 100 } });
        return (
          <div style={{
            position: 'absolute',
            left: PAD_X, right: PAD_X,
            top: NODE_Y + NODE_H + height * 0.06,
            background: `${CLAUDE.SPARK}10`,
            border: `1px solid ${CLAUDE.SPARK}40`,
            borderRadius: 8, padding: '10px 18px',
            opacity: clamp(noteIn, 0, 1),
          }}>
            <div style={{ fontFamily: SERIF, fontSize: height * 0.013, color: CLAUDE.INK, fontStyle: 'italic' }}>
              The retrieval fires before the agent processes the message — memories are already in context by the time it reads your question.
            </div>
          </div>
        );
      })()}

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
