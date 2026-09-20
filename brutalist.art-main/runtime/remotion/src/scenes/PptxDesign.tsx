import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PptxDesign — B02 — Design rules verbatim: palette, layout, typography, avoidances.
 */

export const pptxDesignSchema = z.object({
  sparkLine: z.string().default('Design for this topic. Not for any topic.'),
});
export type PptxDesignProps = z.infer<typeof pptxDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const DESIGN_RULES = [
  { rule: 'Topic-specific palette', detail: 'If it works in any presentation, you weren\'t specific enough' },
  { rule: 'Dominant color: 60-70%', detail: 'One color leads; 1-2 support; one sharp accent' },
  { rule: 'Commit to one visual motif', detail: 'Rounded frames, icons in circles, thick borders — repeat it' },
  { rule: 'Dark/light sandwich', detail: 'Dark for title + conclusion; light for content slides' },
  { rule: 'Every slide needs a visual', detail: 'Image, chart, icon, or shape — no text-only slides' },
];

const AVOIDANCES = [
  { rule: 'No accent lines under titles', note: 'hallmark of AI-generated slides' },
  { rule: 'Never default to Arial', note: 'pick a header font with personality' },
  { rule: 'Never center body text', note: 'center only titles; left-align paragraphs' },
  { rule: 'Never repeat the same layout', note: 'vary columns, cards, callouts across slides' },
  { rule: 'No low-contrast elements', note: 'icons AND text need strong contrast' },
];

export const PptxDesign: React.FC<PptxDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const ruleSprings = DESIGN_RULES.map((_, i) =>
    spring({ frame: frame - 22 - i * 11, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const avoidSprings = AVOIDANCES.map((_, i) =>
    spring({ frame: frame - 48 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.21;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const RULE_H = (H * 0.64) / 5 - 11;
  const AVOID_H = (H * 0.60) / 5 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        PPTX · DESIGN MANDATE
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Bold slides are the requirement.
      </div>

      {/* Left: 5 design rules */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.04, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12,
          opacity: clamp(calloutIn, 0, 1),
        }}>
          DESIGN RULES:
        </div>
        {DESIGN_RULES.map((rule, i) => {
          const op = clamp(ruleSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `5px solid ${CLAUDE.INK}`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 10,
              height: RULE_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK, marginBottom: 5 }}>{rule.rule}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>{rule.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Right: 5 avoidances */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 12,
          opacity: clamp(avoidSprings[0], 0, 1),
        }}>
          AVOIDANCES (HARD RULES):
        </div>
        {AVOIDANCES.map((a, i) => {
          const op = clamp(avoidSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: i === 0 ? 'rgba(217,119,87,0.06)' : 'rgba(217,119,87,0.03)',
              border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '11px 14px', marginBottom: 10,
              height: AVOID_H, boxSizing: 'border-box' as const,
              boxShadow: i === 0 ? '0 4px 14px rgba(217,119,87,0.12)' : '0 2px 8px rgba(217,119,87,0.06)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK, marginBottom: 4 }}>✗ {a.rule}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.SPARK }}>{a.note}</div>
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
