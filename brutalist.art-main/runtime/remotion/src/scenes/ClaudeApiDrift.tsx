import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ClaudeApiDrift — B03 — SELF-DEMO: API drift table (old vs. current).
 * Shows three documented drift points from SKILL.md, verbatim.
 * FILL-THE-CANVAS: header + three drift rows filling canvas vertically.
 */

export const claudeApiDriftSchema = z.object({
  sparkLine: z.string().default('Training data lags the API.'),
});
export type ClaudeApiDriftProps = z.infer<typeof claudeApiDriftSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Verbatim from SKILL.md › API Drift table
const DRIFTS = [
  {
    area: 'Extended thinking',
    stale: 'thinking: {type: "enabled", budget_tokens: N}',
    current: 'thinking: {type: "adaptive"} — budget_tokens deprecated on Opus 4.6 / Sonnet 4.6, REJECTED with a 400 on Fable 5 / Sonnet 5 / Opus 4.8 / 4.7',
    fatal: true,
    delay: 10,
  },
  {
    area: 'Web search / web fetch tool type',
    stale: 'web_search_20250305 · web_fetch_20250910',
    current: 'web_search_20260209 · web_fetch_20260209 (dynamic filtering) on Opus 4.8/4.7/4.6, Sonnet 5, Sonnet 4.6',
    fatal: false,
    delay: 30,
  },
  {
    area: 'PHP parameter names',
    stale: 'snake_case wire names as named args (max_tokens)',
    current: 'Top-level named args are camelCase (maxTokens). Nested array keys vary — copy from documented example, do not bulk-convert.',
    fatal: false,
    delay: 50,
  },
];

export const ClaudeApiDrift: React.FC<ClaudeApiDriftProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const noteIn = spring({ frame: frame - 72, fps, config: { damping: 28, stiffness: 110, mass: 1.0 } });

  const driftSprings = DRIFTS.map(d =>
    spring({ frame: frame - d.delay, fps, config: { damping: 30, stiffness: 120, mass: 0.9 } })
  );

  const CONTENT_TOP = H * 0.20;
  const CARD_H = (H * 0.65) / 3 - 12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CLAUDE API · SELF-DEMO · API DRIFT
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 52, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Your training prior may be stale.
      </div>

      {/* Column headers */}
      <div style={{
        position: 'absolute', top: CONTENT_TOP - 28, left: W * 0.05, right: W * 0.05,
        display: 'flex', gap: 12, opacity: clamp(headerIn, 0, 1),
      }}>
        <div style={{ width: W * 0.18, fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT }}>
          AREA
        </div>
        <div style={{ flex: 1, fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#C44444' }}>
          STALE PRIOR (returns 400 or wrong behavior)
        </div>
        <div style={{ flex: 1, fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#4A7C59' }}>
          CURRENT API
        </div>
      </div>

      {/* Drift rows */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, right: W * 0.05 }}>
        {DRIFTS.map((drift, i) => {
          const op = clamp(driftSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', gap: 12, marginBottom: 12,
              height: CARD_H, opacity: op, transform: `translateY(${(1 - op) * 14}px)`,
            }}>
              {/* Area label */}
              <div style={{
                width: W * 0.18, background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
                borderRadius: 12, padding: '14px 16px', flexShrink: 0,
                display: 'flex', alignItems: 'center',
                boxShadow: '0 4px 14px rgba(61,57,41,0.06)',
              }}>
                <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.3 }}>
                  {drift.area}
                </div>
              </div>

              {/* Stale */}
              <div style={{
                flex: 1, background: 'rgba(196,68,68,0.04)', border: '1px solid rgba(196,68,68,0.25)',
                borderLeft: '4px solid #C44444', borderRadius: 12, padding: '14px 18px',
                overflow: 'hidden',
              }}>
                <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT, marginBottom: 4 }}>
                  STALE:
                </div>
                <div style={{ fontFamily: MONO, fontSize: 14, color: '#C44444', lineHeight: 1.5 }}>
                  {drift.stale}
                </div>
                {drift.fatal && (
                  <div style={{ fontFamily: SANS, fontSize: 12, color: '#C44444', fontWeight: 700, marginTop: 8 }}>
                    → Returns 400 on current models
                  </div>
                )}
              </div>

              {/* Current */}
              <div style={{
                flex: 1, background: 'rgba(74,124,89,0.04)', border: '1px solid rgba(74,124,89,0.25)',
                borderLeft: '4px solid #4A7C59', borderRadius: 12, padding: '14px 18px',
                overflow: 'hidden',
              }}>
                <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT, marginBottom: 4 }}>
                  CURRENT:
                </div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: '#4A7C59', lineHeight: 1.5 }}>
                  {drift.current}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{
        position: 'absolute', bottom: H * 0.10, left: W * 0.05, right: W * 0.05,
        background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12, padding: '14px 22px',
        display: 'flex', alignItems: 'center', gap: 16,
        opacity: clamp(noteIn, 0, 1), boxShadow: '0 4px 14px rgba(61,57,41,0.07)',
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 19, color: CLAUDE.INK, fontStyle: 'italic', flex: 1 }}>
          "Several common Claude API shapes changed in 2025–2026. If you recall a pattern from training, verify it against the {'{lang}'}/{'files in this skill'} before writing."
        </div>
        <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT, flexShrink: 0 }}>
          Source: claude-api SKILL.md
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
