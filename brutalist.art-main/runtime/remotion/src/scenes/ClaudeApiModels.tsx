import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ClaudeApiModels — B04 — SELF-DEMO: current model table with IDs and pricing.
 * Renders the exact model table from SKILL.md verbatim.
 * FILL-THE-CANVAS: header + full-width model table + rule callout.
 */

export const claudeApiModelsSchema = z.object({
  sparkLine: z.string().default('Use the exact ID. No date suffixes.'),
});
export type ClaudeApiModelsProps = z.infer<typeof claudeApiModelsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Verbatim from SKILL.md › Current Models (cached: 2026-06-24)
const MODELS = [
  { name: 'Claude Fable 5', id: 'claude-fable-5', ctx: '1M', inp: '$10.00', out: '$50.00', isDefault: false, delay: 10 },
  { name: 'Claude Opus 4.8', id: 'claude-opus-4-8', ctx: '1M', inp: '$5.00', out: '$25.00', isDefault: true, delay: 18 },
  { name: 'Claude Opus 4.7', id: 'claude-opus-4-7', ctx: '1M', inp: '$5.00', out: '$25.00', isDefault: false, delay: 26 },
  { name: 'Claude Sonnet 5', id: 'claude-sonnet-5', ctx: '1M', inp: '$3.00', out: '$15.00', isDefault: false, delay: 34 },
  { name: 'Claude Sonnet 4.6', id: 'claude-sonnet-4-6', ctx: '1M', inp: '$3.00', out: '$15.00', isDefault: false, delay: 42 },
  { name: 'Claude Haiku 4.5', id: 'claude-haiku-4-5', ctx: '200K', inp: '$1.00', out: '$5.00', isDefault: false, delay: 50 },
];

export const ClaudeApiModels: React.FC<ClaudeApiModelsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const ruleIn = spring({ frame: frame - 62, fps, config: { damping: 28, stiffness: 110, mass: 1.0 } });

  const modelSprings = MODELS.map(m =>
    spring({ frame: frame - m.delay, fps, config: { damping: 30, stiffness: 120, mass: 0.9 } })
  );

  const CONTENT_TOP = H * 0.21;
  const ROW_H = (H * 0.53) / MODELS.length - 4;
  const COL_W = [W * 0.22, W * 0.26, W * 0.08, W * 0.10, W * 0.10]; // name, id, ctx, inp, out

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CLAUDE API · SELF-DEMO · CURRENT MODELS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 52, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Exact IDs. No guessing. No date suffixes.
      </div>

      {/* Table header */}
      <div style={{
        position: 'absolute', top: CONTENT_TOP - 24, left: W * 0.05, right: W * 0.05,
        display: 'flex', opacity: clamp(headerIn, 0, 1),
      }}>
        {['Model', 'Model ID', 'Context', 'Input $/1M', 'Output $/1M'].map((h, i) => (
          <div key={i} style={{
            width: COL_W[i], flexShrink: 0,
            fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
          }}>
            {h}
          </div>
        ))}
      </div>

      {/* Model rows */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, right: W * 0.05 }}>
        {MODELS.map((model, i) => {
          const op = clamp(modelSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              height: ROW_H, marginBottom: 5,
              background: model.isDefault ? 'rgba(217,119,87,0.07)' : (i % 2 === 0 ? '#FFFFFF' : '#FAFAF8'),
              border: `1px solid ${model.isDefault ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${model.isDefault ? CLAUDE.SPARK : 'transparent'}`,
              borderRadius: 10,
              opacity: op, transform: `translateX(${(1 - op) * 16}px)`,
              boxShadow: model.isDefault ? '0 4px 18px rgba(217,119,87,0.14)' : undefined,
            }}>
              <div style={{ width: COL_W[0], flexShrink: 0, padding: '0 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: model.isDefault ? 700 : 400, color: CLAUDE.INK }}>
                    {model.name}
                  </div>
                  {model.isDefault && (
                    <div style={{
                      background: CLAUDE.SPARK, color: '#FFF', fontSize: 10, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 4, fontFamily: SANS, letterSpacing: 1,
                    }}>
                      DEFAULT
                    </div>
                  )}
                </div>
              </div>
              <div style={{ width: COL_W[1], flexShrink: 0, padding: '0 12px' }}>
                <div style={{
                  fontFamily: MONO, fontSize: 14,
                  color: model.isDefault ? CLAUDE.SPARK : CLAUDE.INK,
                  fontWeight: model.isDefault ? 700 : 400,
                }}>
                  {model.id}
                </div>
              </div>
              <div style={{ width: COL_W[2], flexShrink: 0, fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT }}>
                {model.ctx}
              </div>
              <div style={{ width: COL_W[3], flexShrink: 0, fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT }}>
                {model.inp}
              </div>
              <div style={{ width: COL_W[4], flexShrink: 0, fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT }}>
                {model.out}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rule callouts */}
      <div style={{
        position: 'absolute', bottom: H * 0.10, left: W * 0.05, right: W * 0.05,
        display: 'flex', gap: 16,
        opacity: clamp(ruleIn, 0, 1),
      }}>
        <div style={{
          flex: 1, background: 'rgba(217,119,87,0.06)', border: `1px solid ${CLAUDE.SPARK}`,
          borderRadius: 12, padding: '14px 18px',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 15, color: CLAUDE.SPARK, fontWeight: 700, marginBottom: 4 }}>
            ALWAYS USE claude-opus-4-8
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
            "Unless the user explicitly names a different model. This is non-negotiable."
          </div>
        </div>
        <div style={{
          flex: 1, background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 12, padding: '14px 18px',
          boxShadow: '0 4px 14px rgba(61,57,41,0.07)',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 15, color: CLAUDE.INK, fontWeight: 700, marginBottom: 4 }}>
            NEVER append date suffixes
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
            Use <span style={{ fontFamily: MONO, color: CLAUDE.INK }}>claude-sonnet-4-6</span>, never <span style={{ fontFamily: MONO, color: '#C44444' }}>claude-sonnet-4-6-20251114</span>
          </div>
        </div>
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
