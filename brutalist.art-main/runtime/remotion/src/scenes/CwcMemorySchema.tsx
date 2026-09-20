import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcMemorySchema — What the memory store actually holds
 * Annotated memory record card + a second record sliding in
 * Source: agents-that-remember/ — CWC Workshop 2026 W3
 */

export const cwcMemorySchemaSchema = z.object({
  sparkLine: z.string().default("The store is just structured facts about users."),
});
export type CwcMemorySchemaProps = z.infer<typeof cwcMemorySchemaSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const FIELDS = [
  { key: 'user_id', value: '"u_9823"', annotation: 'scoped — one store per user', color: CLAUDE_FONT.ui },
  { key: 'key', value: '"prefers_async"', annotation: 'retrieval key — how the agent finds it', color: CLAUDE_FONT.ui },
  { key: 'value', value: '"true"', annotation: 'content — the stored fact', color: CLAUDE_FONT.ui },
  { key: 'created', value: '"2026-07-14T09:12Z"', annotation: 'when the memory was written', color: CLAUDE_FONT.ui },
  { key: 'confidence', value: '0.9', annotation: 'how certain the agent was', color: CLAUDE_FONT.ui },
];

export const CwcMemorySchema: React.FC<CwcMemorySchemaProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const cardIn = spring({ frame: frame - 20, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const secondCardIn = spring({ frame: frame - 180, fps, config: { damping: 24, stiffness: 90, mass: 1.1 } });
  const sparkIn = spring({ frame: frame - 250, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const CARD_X = PAD_X;
  const CARD_Y = height * 0.23;
  const CARD_W = width * 0.52;
  const ROW_H = height * 0.072;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        MEMORY STORE · SCHEMA
      </div>
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.04,
        fontFamily: SERIF, fontSize: height * 0.028, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
      }}>
        What a memory record actually looks like
      </div>

      {/* Primary record card */}
      <div style={{
        position: 'absolute', left: CARD_X, top: CARD_Y,
        width: CARD_W,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 12, overflow: 'hidden',
        opacity: clamp(cardIn, 0, 1),
        transform: `translateY(${(1 - clamp(cardIn, 0, 1)) * 14}px)`,
      }}>
        {/* Card header */}
        <div style={{
          background: CLAUDE.BORDER, padding: '10px 18px',
          fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK_SOFT, fontWeight: 700,
        }}>
          memory_record #1
        </div>
        {/* Fields */}
        {FIELDS.map((field, i) => {
          const fieldIn = spring({ frame: frame - 35 - i * 22, fps, config: { damping: 26, stiffness: 100 } });
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              padding: '0 18px',
              height: ROW_H,
              borderBottom: i < FIELDS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              opacity: clamp(fieldIn, 0, 1),
              transform: `translateX(${(1 - clamp(fieldIn, 0, 1)) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK_SOFT, width: '22%' }}>
                {field.key}:
              </div>
              <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.SPARK, fontWeight: 700, width: '30%' }}>
                {field.value}
              </div>
              <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT, fontStyle: 'italic', width: '48%' }}>
                ← {field.annotation}
              </div>
            </div>
          );
        })}
      </div>

      {/* Second record sliding in */}
      <div style={{
        position: 'absolute',
        left: CARD_X + CARD_W + width * 0.04,
        top: CARD_Y + height * 0.08,
        width: CARD_W * 0.65,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.SPARK}40`,
        borderRadius: 12, overflow: 'hidden',
        opacity: clamp(secondCardIn, 0, 1),
        transform: `translateX(${(1 - clamp(secondCardIn, 0, 1)) * 30}px)`,
      }}>
        <div style={{
          background: `${CLAUDE.SPARK}15`, padding: '10px 18px',
          fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.SPARK, fontWeight: 700,
        }}>
          memory_record #2 (new)
        </div>
        <div style={{ padding: '0 18px' }}>
          {[
            { k: 'key', v: '"timezone"' },
            { k: 'value', v: '"US/Eastern"' },
            { k: 'confidence', v: '0.95' },
          ].map((r, i) => {
            const rIn = spring({ frame: frame - 195 - i * 20, fps, config: { damping: 26, stiffness: 100 } });
            return (
              <div key={i} style={{
                display: 'flex', gap: 16,
                padding: '8px 0',
                borderBottom: i < 2 ? `1px solid ${CLAUDE.BORDER}` : 'none',
                opacity: clamp(rIn, 0, 1),
              }}>
                <div style={{ fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK_SOFT }}>{r.k}:</div>
                <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.SPARK, fontWeight: 700 }}>{r.v}</div>
              </div>
            );
          })}
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
