import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * FrontendDesignAnatomy — B01 — TRIGGER + 5 design principles + 3 AI defaults to avoid.
 */

export const frontendDesignAnatomySchema = z.object({
  sparkLine: z.string().default('Design for this brief. Not for a similar brief.'),
});
export type FrontendDesignAnatomyProps = z.infer<typeof frontendDesignAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PRINCIPLES = [
  { num: '01', label: 'Hero as thesis', detail: 'Open with the most characteristic thing in the subject\'s world — not a gradient stat block by default' },
  { num: '02', label: 'Typography as personality', detail: 'Pair typefaces deliberately for this brief, not the same families you reach for on any other project' },
  { num: '03', label: 'Structure as information', detail: 'Numbered markers only if the content is an actual sequence — question before using' },
  { num: '04', label: 'Motion serves the subject', detail: 'Orchestrated moments beat scattered effects; sometimes less is more' },
  { num: '05', label: 'Complexity matches vision', detail: 'Minimalism needs precision in spacing and detail; maximalism needs elaborate execution' },
];

const DEFAULTS = [
  'Warm cream (#F4F1EA) + high-contrast serif + terracotta accent',
  'Near-black background + acid-green or vermilion accent',
  'Broadsheet layout + hairline rules + dense newspaper columns',
];

export const FrontendDesignAnatomy: React.FC<FrontendDesignAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const principleSprings = PRINCIPLES.map((_, i) =>
    spring({ frame: frame - 22 - i * 11, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const defaultSprings = DEFAULTS.map((_, i) =>
    spring({ frame: frame - 30 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.42;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.45;
  const PRIN_H = (H * 0.62) / 5 - 12;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        FRONTEND DESIGN · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Five principles. Three traps to avoid.
      </div>

      {/* Left: TRIGGER + 3 AI defaults to avoid */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 14, padding: '12px 16px',
          marginBottom: 16, opacity: clamp(triggerIn, 0, 1),
          transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 12}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 5 }}>
            TRIGGER
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.5 }}>
            "landing page" · "UI design" · "visual identity" · "CSS" · "frontend" · "layout" · "typography" · "palette"
          </div>
        </div>

        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 12,
          opacity: clamp(defaultSprings[0], 0, 1),
        }}>
          ✗ 3 AI DESIGN DEFAULTS — AVOID UNLESS BRIEF CALLS FOR THEM:
        </div>
        {DEFAULTS.map((d, i) => {
          const op = clamp(defaultSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.04)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {d}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: 5 design principles */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12,
          opacity: clamp(principleSprings[0], 0, 1),
        }}>
          DESIGN PRINCIPLES:
        </div>
        {PRINCIPLES.map((p, i) => {
          const op = clamp(principleSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.INK}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              height: PRIN_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.SPARK, fontWeight: 700 }}>{p.num}</span>
                <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: CLAUDE.INK }}>{p.label}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
                {p.detail}
              </div>
            </div>
          );
        })}
      </div>

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
