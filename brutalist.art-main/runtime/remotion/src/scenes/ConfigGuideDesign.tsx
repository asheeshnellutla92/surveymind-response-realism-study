import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ConfigGuideDesign — B02 — index pattern + Slack-only scope + debug-plugins handoff.
 */

export const configGuideDesignSchema = z.object({
  sparkLine: z.string().default('Index routes. Each reference self-contained. Slack only — caveat up front.'),
});
export type ConfigGuideDesignProps = z.infer<typeof configGuideDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const DESIGN_POINTS = [
  {
    title: 'Index Pattern',
    accent: '#4A7C59',
    items: [
      'Skill holds routing logic only — no direct answers',
      'Five short, self-contained reference files',
      'Each file: bounded topic, no cross-dependencies',
      'Benefit: focused answers, no irrelevant content',
      'Risk: missing file → silent failure to answer',
    ],
    gapIndex: 4,
  },
  {
    title: 'Slack-Only Scope',
    accent: CLAUDE.SPARK,
    items: [
      'Stated at the top — upfront and clear',
      'Currently written for Slack surface only',
      'No guidance on other surface differences',
      'User on another surface gets no warning',
      'Gap: incomplete info with no caveat on gap',
    ],
    gapIndex: 4,
  },
  {
    title: 'Debug-Plugins Handoff',
    accent: '#4A7C59',
    items: [
      'Closes every configuration explanation',
      'Suggests debug-plugins in a new Slack thread',
      'New thread = fresh container = current config',
      'Config state scoped per session, not global',
      'Gap: new-thread reason not explained in skill',
    ],
    gapIndex: 4,
  },
];

export const ConfigGuideDesign: React.FC<ConfigGuideDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const cardSprings = DESIGN_POINTS.map((_, i) =>
    spring({ frame: frame - 20 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const CARD_W = (W * 0.88) / 3 - 12;
  const CARD_H = H * 0.60;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CONFIG GUIDE · INDEX PATTERN + SCOPE + DEBUG HANDOFF
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Route. Scope. Close. Three design choices.
      </div>

      {/* Three design cards */}
      <div style={{
        position: 'absolute', left: W * 0.06, top: COL_TOP,
        display: 'flex', gap: 14,
      }}>
        {DESIGN_POINTS.map((card, i) => {
          const op = clamp(cardSprings[i], 0, 1);
          const isSlack = i === 1;
          return (
            <div key={i} style={{
              width: CARD_W, height: CARD_H,
              background: isSlack ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1.5px solid ${isSlack ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderTop: `4px solid ${card.accent}`,
              borderRadius: 12, padding: '16px 16px 12px',
              boxSizing: 'border-box' as const,
              boxShadow: isSlack ? '0 3px 14px rgba(217,119,87,0.10)' : '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateY(${(1 - op) * 14}px)`,
            }}>
              <div style={{
                fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 2,
                color: card.accent, textTransform: 'uppercase' as const, marginBottom: 14,
              }}>
                {card.title}
              </div>
              {card.items.map((item, j) => (
                <div key={j} style={{
                  fontFamily: SANS, fontSize: 12,
                  lineHeight: 1.45, marginBottom: 10,
                  paddingLeft: 10,
                  borderLeft: `2px solid ${j === card.gapIndex ? CLAUDE.SPARK : 'transparent'}`,
                  color: j === card.gapIndex ? CLAUDE.SPARK : CLAUDE.INK,
                }}>
                  {item}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
