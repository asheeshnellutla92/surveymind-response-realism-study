import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ClaudeApiTell — B05 — Teardown moment.
 * Central callout: TRIGGER is a pre-scan gate, not a lookup.
 * Two-column: what it gets right / where it bites + pitfall count badge.
 */

export const claudeApiTellSchema = z.object({
  sparkLine: z.string().default('44 pitfalls. All preventable.'),
});
export type ClaudeApiTellProps = z.infer<typeof claudeApiTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const GETS_RIGHT = [
  'TRIGGER fires before the file opens — no drift from stale training',
  'Three surfaces with explicit criteria prevent over-engineering',
  'API drift table makes the 400 error visible before it happens',
  'Language-specific routing: one skill, eight SDKs',
];

const BITES = [
  '44 pitfalls require knowing they exist — no enforcement at call time',
  'WebFetch dependency: if network is restricted, skill degrades to local patterns',
  'Drift table is cached (2026-06-24) — updates require a new SKILL.md version',
  'Managed Agents coverage is thinner than Claude API for non-Python languages',
];

export const ClaudeApiTell: React.FC<ClaudeApiTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const badgeIn = spring({ frame: frame - 14, fps, config: { damping: 24, stiffness: 90, mass: 1.2 } });

  const rightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 34 - i * 11, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const bitesSprings = BITES.map((_, i) =>
    spring({ frame: frame - 34 - i * 11, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.47;
  const COL_W = W * 0.40;
  const LEFT_X = W * 0.06;
  const RIGHT_X = W * 0.53;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CLAUDE API · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 48, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Error prevention, not documentation.
      </div>

      {/* Central callout + pitfall badge */}
      <div style={{
        position: 'absolute', top: H * 0.26, left: W * 0.08, right: W * 0.08,
        display: 'flex', alignItems: 'center', gap: 24,
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{
          flex: 1,
          background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
          borderRadius: 16, padding: '20px 28px',
        }}>
          <div style={{ fontFamily: SANS, fontSize: 18, color: CLAUDE.INK, lineHeight: 1.6 }}>
            The TRIGGER fires{' '}
            <span style={{ fontFamily: MONO, color: CLAUDE.SPARK, fontWeight: 700 }}>BEFORE</span>
            {' '}the target file opens — a pre-scan gate, not a post-request lookup. It doesn't wait for a question; it runs first. The model's training data becomes the fallback, not the source of truth.
          </div>
        </div>

        {/* 44 pitfalls badge */}
        <div style={{
          width: 140, height: 140, flexShrink: 0, borderRadius: '50%',
          background: CLAUDE.SPARK, display: 'flex', flexDirection: 'column' as const,
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(217,119,87,0.35)',
          transform: `scale(${clamp(badgeIn, 0, 1)})`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 52, fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
            44
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' as const, letterSpacing: 1 }}>
            pitfalls
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div style={{ position: 'absolute', left: LEFT_X, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 14,
        }}>
          ✓ WHAT IT GETS RIGHT
        </div>
        {GETS_RIGHT.map((item, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16,
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4A7C59', flexShrink: 0, marginTop: 7 }} />
              <div style={{ fontFamily: SANS, fontSize: 16, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {item}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', left: RIGHT_X, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 14,
        }}>
          ✗ WHERE IT BITES
        </div>
        {BITES.map((item, i) => {
          const op = clamp(bitesSprings[i], 0, 1);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16,
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: CLAUDE.SPARK, flexShrink: 0, marginTop: 7 }} />
              <div style={{ fontFamily: SANS, fontSize: 16, color: CLAUDE.INK, lineHeight: 1.45 }}>
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
