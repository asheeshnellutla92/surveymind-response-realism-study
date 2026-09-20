import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ClaudeWindow — the Claude app window frame in the fidelity skin.
 * view:'artifact'  — artifact panel (staggered numbered lines, terracotta spark line).
 * view:'composer'  — empty composer window (future use).
 * view:'blank'     — cream stage only.
 *
 * Per ILLUSTRATE LAW: this is a UI beat — the Claude UI is the subject.
 * Used for verdict pages and ASK→RESULT artifact pages.
 * Duration-agnostic — compile.py conforms to actual audio length.
 */

export const claudeWindowSchema = z.object({
  view:           z.enum(['artifact', 'composer', 'blank']).default('artifact'),
  artifactTitle:  z.string().default('Verdict'),
  artifactHeading:z.string().default('The verdict'),
  artifactLines:  z.array(z.string()).default([]),
  sparkLine:      z.string().default(''),
  width:          z.number().optional(),
  height:         z.number().optional(),
  fontSize:       z.number().optional(),
});
export type ClaudeWindowProps = z.infer<typeof claudeWindowSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const ClaudeWindow: React.FC<ClaudeWindowProps> = ({
  view, artifactTitle, artifactHeading, artifactLines, sparkLine,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame,        fps, config: { damping: 28, stiffness: 140, mass: 0.8 } });
  const headIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 140, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - (artifactLines.length + 3) * 7, fps, config: { damping: 28, stiffness: 140, mass: 0.8 } });

  const lines = artifactLines ?? [];

  if (view === 'blank') {
    return <AbsoluteFill style={{ background: CLAUDE.PAGE }} />;
  }

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0 }}>
      {/* Artifact card */}
      <div style={{
        width: 1100,
        background: CLAUDE.CARD,
        borderRadius: 20,
        boxShadow: '0 12px 48px rgba(61,57,41,0.14)',
        border: `1px solid ${CLAUDE.BORDER}`,
        overflow: 'hidden',
        transform: `scale(${clamp(cardIn, 0, 1)})`,
        opacity: clamp(cardIn, 0, 1),
      }}>
        {/* Title bar */}
        <div style={{
          background: CLAUDE.PAGE,
          borderBottom: `1px solid ${CLAUDE.BORDER}`,
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontFamily: SERIF, fontSize: 20, color: CLAUDE.INK, fontWeight: 600 }}>
            {artifactTitle}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: '30px 40px 36px' }}>
          {/* Heading */}
          <div style={{
            fontFamily: SERIF,
            fontSize: 32,
            fontWeight: 700,
            color: CLAUDE.INK,
            marginBottom: 24,
            opacity: clamp(headIn, 0, 1),
          }}>
            {artifactHeading}
          </div>

          {/* Lines */}
          {lines.map((line, i) => {
            const lineIn = spring({ frame: frame - (i + 2) * 7, fps, config: { damping: 28, stiffness: 140, mass: 0.8 } });
            const op = clamp(lineIn, 0, 1);
            const ty = (1 - op) * 12;
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                marginBottom: 20,
                opacity: op,
                transform: `translateY(${ty}px)`,
              }}>
                <span style={{
                  fontFamily: SANS,
                  fontSize: 19,
                  color: CLAUDE.SPARK,
                  flexShrink: 0,
                  marginTop: 2,
                  fontWeight: 700,
                }}>
                  {i + 1}.
                </span>
                <span style={{
                  fontFamily: SANS,
                  fontSize: 19,
                  color: CLAUDE.INK,
                  lineHeight: 1.55,
                }}>
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spark line below card */}
      {sparkLine ? (
        <div style={{
          marginTop: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: clamp(sparkIn, 0, 1),
          transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
        }}>
          <span style={{
            fontFamily: SERIF,
            fontSize: 26,
            fontStyle: 'italic',
            color: CLAUDE.INK,
          }}>
            {sparkLine}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
