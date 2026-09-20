import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DocCoauthoringStage1 — B02 — Stage 1: Context Gathering.
 * Left: info-dump + clarifying questions mechanic. Right: 5 meta-context questions + integration note.
 */

export const docCoauthoringStage1Schema = z.object({
  sparkLine: z.string().default('Dump context. Claude closes the gap.'),
});
export type DocCoauthoringStage1Props = z.infer<typeof docCoauthoringStage1Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const META_QUESTIONS = [
  { q: '1. What type of document is this?', hint: 'technical spec · decision doc · proposal' },
  { q: '2. Who\'s the primary audience?', hint: 'engineers · executives · cross-functional' },
  { q: '3. What\'s the desired impact?', hint: 'approve · align · inform · act' },
  { q: '4. Is there a template to follow?', hint: 'fetch the doc if shared; read if provided' },
  { q: '5. Any constraints or context?', hint: 'timeline · org politics · tech deps' },
];

const INFO_DUMP = [
  'Background on the project / problem',
  'Related team discussions or shared docs',
  'Why alternative solutions aren\'t used',
  'Organizational context: team dynamics, past incidents',
  'Timeline pressures or constraints',
];

export const DocCoauthoringStage1: React.FC<DocCoauthoringStage1Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const stageIn = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const exitIn = spring({ frame: frame - 72, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const qSprings = META_QUESTIONS.map((_, i) =>
    spring({ frame: frame - 20 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const dumpSprings = INFO_DUMP.map((_, i) =>
    spring({ frame: frame - 20 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.43;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.44;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DOC CO-AUTHORING · STAGE 1 · CONTEXT GATHERING
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Close the knowledge gap before drafting.
      </div>

      {/* Left: Info dump items */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 16,
          opacity: clamp(stageIn, 0, 1),
        }}>
          INFO DUMP — REQUEST FROM USER:
        </div>
        {INFO_DUMP.map((item, i) => {
          const op = clamp(dumpSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14,
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: CLAUDE.SPARK, flexShrink: 0, marginTop: 7,
              }} />
              <div style={{ fontFamily: SANS, fontSize: 16, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {item}
              </div>
            </div>
          );
        })}

        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 12, padding: '12px 18px', marginTop: 18,
          opacity: clamp(exitIn, 0, 1),
          boxShadow: '0 4px 14px rgba(61,57,41,0.06)',
        }}>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 6 }}>
            EXIT CONDITION
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK, lineHeight: 1.5 }}>
            When Claude can ask about edge cases and trade-offs — without needing basics explained.
          </div>
        </div>
      </div>

      {/* Right: 5 meta-context questions */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 16,
          opacity: clamp(stageIn, 0, 1),
        }}>
          INITIAL META-CONTEXT QUESTIONS:
        </div>
        {META_QUESTIONS.map((item, i) => {
          const op = clamp(qSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${i === 0 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 10,
              opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
              boxShadow: '0 3px 10px rgba(61,57,41,0.06)',
            }}>
              <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: CLAUDE.INK, marginBottom: 2 }}>
                {item.q}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT }}>
                {item.hint}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        display: 'flex', alignItems: 'center', gap: 12,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 28, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
