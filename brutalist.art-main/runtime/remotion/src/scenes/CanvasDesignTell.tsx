import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CanvasDesignTell — B05 — Teardown moment.
 * Central callout: "This skill pre-approves its own critique."
 * Two-column: What it gets right / Where it bites.
 * FILL-THE-CANVAS: header 20%, central callout, two columns, spark line bottom.
 */

export const canvasDesignTellSchema = z.object({
  sparkLine: z.string().default('Claude writes the critique too.'),
});
export type CanvasDesignTellProps = z.infer<typeof canvasDesignTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const GETS_RIGHT = [
  'Claude writes the design brief — never guessing the aesthetic',
  'Philosophy-to-canvas split makes intent explicit before execution',
  '"Conceptual soul" is embedded, not announced — depth without verbosity',
  'Craftsmanship mandate is structural, not aspirational',
];

const BITES = [
  'Canvas quality depends entirely on Claude\'s code generation ability',
  '"Ultimate design freedom" means outputs vary widely between runs',
  'Overlapping elements possible in complex compositions — no layout guard',
  'The pre-baked critique ("make it pristine") runs regardless of quality',
];

export const CanvasDesignTell: React.FC<CanvasDesignTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const rightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 30 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const bitesSprings = BITES.map((_, i) =>
    spring({ frame: frame - 30 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.45;
  const COL_H = H * 0.42;
  const COL_W = W * 0.40;
  const LEFT_X = W * 0.06;
  const RIGHT_X = W * 0.53;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CANVAS DESIGN · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 52, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        This skill pre-approves its own critique.
      </div>

      {/* Central callout */}
      <div style={{
        position: 'absolute', top: H * 0.27, left: W * 0.08, right: W * 0.08,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 16, padding: '22px 32px',
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 20, color: CLAUDE.INK, lineHeight: 1.55 }}>
          The FINAL STEP in SKILL.md opens:{' '}
          <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>
            "The user ALREADY said it isn't perfect enough."
          </span>{' '}
          This is not a response to feedback. It is pre-emptive refinement baked into the skill itself — Claude critiques the work before the human can.
        </div>
      </div>

      {/* Two columns */}
      <div style={{
        position: 'absolute', left: LEFT_X, top: COL_TOP, width: COL_W,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 16,
        }}>
          ✓ WHAT IT GETS RIGHT
        </div>
        {GETS_RIGHT.map((item, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              marginBottom: 18, opacity: op,
              transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4A7C59', flexShrink: 0, marginTop: 7 }} />
              <div style={{ fontFamily: SANS, fontSize: 17, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {item}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', left: RIGHT_X, top: COL_TOP, width: COL_W,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 16,
        }}>
          ✗ WHERE IT BITES
        </div>
        {BITES.map((item, i) => {
          const op = clamp(bitesSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              marginBottom: 18, opacity: op,
              transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: CLAUDE.SPARK, flexShrink: 0, marginTop: 7 }} />
              <div style={{ fontFamily: SANS, fontSize: 17, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {item}
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
