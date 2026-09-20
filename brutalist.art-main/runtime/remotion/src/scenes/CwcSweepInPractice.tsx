import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcSweepInPractice — Running a sweep in practice
 * Linear pipeline: eval suite → 3 models → collect pairs → plot → pick
 * Source: rightmodel/ — CWC Workshop 2026
 */

export const cwcSweepInPracticeSchema = z.object({
  sparkLine: z.string().default("The sweep is three lines of code."),
});
export type CwcSweepInPracticeProps = z.infer<typeof cwcSweepInPracticeSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STEPS = [
  {
    label: 'Eval suite',
    sub: '10 representative tasks',
    highlight: false,
    mono: null,
  },
  {
    label: 'Run 3 models',
    sub: 'Opus, Sonnet, Haiku',
    highlight: false,
    mono: 'for model in models:\n  run_eval(model, tasks)',
  },
  {
    label: 'Collect pairs',
    sub: '(quality, cost) per model',
    highlight: false,
    mono: '[(98%, $0.08), (90%, $0.04), (82%, $0.01)]',
  },
  {
    label: 'Plot',
    sub: 'scatter: cost vs. quality',
    highlight: true,
    mono: 'plot_pareto(results)',
  },
  {
    label: 'Pick',
    sub: 'frontier model for threshold',
    highlight: false,
    mono: null,
  },
];

export const CwcSweepInPractice: React.FC<CwcSweepInPracticeProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 260, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const NODE_W = width * 0.14;
  const NODE_H = height * 0.22;
  const NODE_Y = height * 0.30;
  const TOTAL_NODE_W = NODE_W * 5;
  const TOTAL_ARROW_W = width * 0.88 - TOTAL_NODE_W;
  const ARROW_W = TOTAL_ARROW_W / 4;
  const START_X = PAD_X;

  const CODE_Y = NODE_Y + NODE_H + height * 0.06;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        SWEEP IN PRACTICE · PIPELINE
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        Run → collect → plot → decide
      </div>

      {/* Steps */}
      {STEPS.map((step, i) => {
        const nodeIn = spring({ frame: frame - 20 - i * 38, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
        const arrowIn = spring({ frame: frame - 45 - i * 38, fps, config: { damping: 24, stiffness: 90 } });
        const nodeX = START_X + i * (NODE_W + ARROW_W);

        return (
          <React.Fragment key={step.label}>
            {/* Node */}
            <div style={{
              position: 'absolute',
              left: nodeX, top: NODE_Y,
              width: NODE_W, height: NODE_H,
              borderRadius: 12,
              background: step.highlight ? `${CLAUDE.SPARK}18` : CLAUDE.CARD,
              border: step.highlight ? `2.5px solid ${CLAUDE.SPARK}` : `1.5px solid ${CLAUDE.BORDER}`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              textAlign: 'center' as const, padding: '10px 10px', gap: 8,
              opacity: clamp(nodeIn, 0, 1),
              transform: `scale(${step.highlight ? 1.05 : 1}) translateY(${(1 - clamp(nodeIn, 0, 1)) * 16}px)`,
            }}>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
                color: step.highlight ? CLAUDE.SPARK : CLAUDE.INK,
                lineHeight: 1.4,
              }}>
                {step.label}
              </div>
              <div style={{
                fontFamily: SANS, fontSize: height * 0.010,
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
              top: NODE_Y - height * 0.065,
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
            {/* Arrow */}
            {i < STEPS.length - 1 && (
              <svg style={{
                position: 'absolute',
                left: nodeX + NODE_W,
                top: NODE_Y + NODE_H / 2 - 14,
                width: ARROW_W, height: 28, overflow: 'visible',
                opacity: clamp(arrowIn, 0, 1),
              }}>
                <defs>
                  <marker id={`sweepArr${i}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.INK_SOFT} />
                  </marker>
                </defs>
                <line x1={0} y1={14} x2={ARROW_W - 6} y2={14}
                  stroke={CLAUDE.INK_SOFT} strokeWidth={2} markerEnd={`url(#sweepArr${i})`} />
              </svg>
            )}
            {/* Code snippet below highlighted node */}
            {step.mono && (
              <div style={{
                position: 'absolute',
                left: nodeX - NODE_W * 0.5, top: CODE_Y,
                width: NODE_W * 2,
                background: `${CLAUDE.INK}08`,
                border: `1px solid ${CLAUDE.BORDER}`,
                borderRadius: 6, padding: '8px 12px',
                opacity: clamp(nodeIn, 0, 1),
              }}>
                <div style={{ fontFamily: MONO, fontSize: height * 0.009, color: CLAUDE.INK, lineHeight: 1.7, whiteSpace: 'pre' as const }}>
                  {step.mono}
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* "This is where the decision happens" annotation under plot node */}
      {(() => {
        const annIn = spring({ frame: frame - 180, fps, config: { damping: 26, stiffness: 100 } });
        const plotNode = STEPS.findIndex(s => s.highlight);
        const plotX = START_X + plotNode * (NODE_W + ARROW_W);
        return (
          <div style={{
            position: 'absolute',
            left: plotX - NODE_W * 0.2,
            top: CODE_Y + height * 0.13,
            width: NODE_W * 1.4,
            textAlign: 'center' as const,
            fontFamily: SERIF, fontSize: height * 0.011, color: CLAUDE.SPARK,
            fontStyle: 'italic',
            opacity: clamp(annIn, 0, 1),
          }}>
            this is where the decision happens
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
