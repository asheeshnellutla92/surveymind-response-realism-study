import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CadencesFig3Artifacts — "What Claude Makes" ranked bars + regroup.
 * Source: Anthropic Economic Index, Cadences (June 2026)
 *
 * Phase 1 (0–70f): ranked bar chart of top artifact types (% of conversations).
 * Phase 2 (70–end): regroup into three buckets: conversational ~1/3,
 *   written deliverables ~1/3, code & technical ~1/6.
 *
 * Terracotta moment: the 93% "produce an artifact" stat callout.
 */

export const cadencesFig3ArtifactsSchema = z.object({
  sparkLine: z.string().default('93% of conversations. Something to show.'),
});
export type CadencesFig3ArtifactsProps = z.infer<typeof cadencesFig3ArtifactsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const ARTIFACTS = [
  { label: 'Explanations',        pct: 17, group: 'conversational' },
  { label: 'Documents & reports', pct: 15, group: 'written' },
  { label: 'Guidance',            pct: 11, group: 'conversational' },
  { label: 'Code snippets',       pct: 9,  group: 'code' },
  { label: 'Analyses',            pct: 7,  group: 'written' },
  { label: 'Recommendations',     pct: 6,  group: 'conversational' },
  { label: 'Email drafts',        pct: 5,  group: 'written' },
  { label: 'Summaries',           pct: 5,  group: 'written' },
];

const GROUPS = [
  { key: 'conversational', label: 'Conversational outputs', share: '~1/3', color: CLAUDE.INK },
  { key: 'written',        label: 'Written deliverables',  share: '~1/3', color: CLAUDE.INK_SOFT },
  { key: 'code',           label: 'Code & technical',      share: '~1/6', color: CLAUDE.GHOST },
];

const PHASE_SWITCH = 70;

export const CadencesFig3Artifacts: React.FC<CadencesFig3ArtifactsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const titleIn  = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const sparkIn  = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const statIn   = spring({ frame: frame - 5,  fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const showPhase2 = frame >= PHASE_SWITCH;

  // Ranked bar chart geometry
  const CHART_LEFT = PAD_X + 160;
  const CHART_RIGHT = width - PAD_X;
  const CHART_W = CHART_RIGHT - CHART_LEFT;
  const ROW_H = height * 0.07;
  const CHART_TOP = height * 0.26;
  const MAX_PCT = 20;

  // Group pie geometry
  const CX = width * 0.5;
  const CY = height * 0.56;
  const R = height * 0.22;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* 93% big stat — always visible */}
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y,
        fontFamily: SERIF, fontSize: height * 0.055, fontWeight: 700,
        color: CLAUDE.SPARK, opacity: clamp(statIn, 0, 1),
        lineHeight: 1,
      }}>
        93%
      </div>
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y + height * 0.07,
        fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT,
        opacity: clamp(statIn, 0, 1), textAlign: 'right' as const,
      }}>
        produce an artifact
      </div>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        ARTIFACT TYPES · % OF CONVERSATIONS
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showPhase2 ? 'Three families of output.' : 'Named and counted.'}
      </div>

      {/* ── PHASE 1: Ranked bars ── */}
      {!showPhase2 && ARTIFACTS.map((a, i) => {
        const barAnim = spring({ frame: frame - 10 - i * 6, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
        const barW = (a.pct / MAX_PCT) * CHART_W * clamp(barAnim, 0, 1);
        const y = CHART_TOP + i * ROW_H;
        const isTop = i < 2;

        return (
          <React.Fragment key={a.label}>
            {/* Label */}
            <div style={{
              position: 'absolute', right: width - CHART_LEFT + 8, top: y + 8,
              fontFamily: SERIF, fontSize: height * 0.015,
              color: CLAUDE.INK, textAlign: 'right' as const,
              opacity: clamp(barAnim, 0, 1),
              whiteSpace: 'nowrap' as const,
            }}>
              {a.label}
            </div>
            {/* Bar */}
            <div style={{
              position: 'absolute',
              left: CHART_LEFT, top: y + 4,
              width: barW, height: ROW_H * 0.6,
              background: isTop ? CLAUDE.INK : CLAUDE.INK_SOFT,
              opacity: isTop ? 0.85 : 0.45,
              borderRadius: '0 4px 4px 0',
            }} />
            {/* Value */}
            {clamp(barAnim, 0, 1) > 0.8 && (
              <div style={{
                position: 'absolute',
                left: CHART_LEFT + barW + 8, top: y + 8,
                fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
                color: CLAUDE.INK_SOFT,
              }}>
                {a.pct}%
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* ── PHASE 2: Group buckets ── */}
      {showPhase2 && GROUPS.map((g, i) => {
        const gAnim = spring({ frame: frame - PHASE_SWITCH - 8 - i * 12, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
        const bx = PAD_X + i * (width - 2 * PAD_X) / 3;
        const bw = (width - 2 * PAD_X) / 3 - 20;

        return (
          <div key={g.key} style={{
            position: 'absolute',
            left: bx, top: height * 0.28,
            width: bw,
            background: CLAUDE.CARD,
            borderRadius: 16,
            border: `1px solid ${CLAUDE.BORDER}`,
            padding: '28px 24px',
            opacity: clamp(gAnim, 0, 1),
            transform: `translateY(${(1 - clamp(gAnim, 0, 1)) * 20}px)`,
          }}>
            <div style={{
              fontFamily: SERIF, fontSize: height * 0.048, fontWeight: 700,
              color: g.key === 'conversational' ? CLAUDE.SPARK : g.color,
              marginBottom: 8,
            }}>
              {g.share}
            </div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.014,
              color: CLAUDE.INK_SOFT, lineHeight: 1.4,
            }}>
              {g.label}
            </div>
            <div style={{
              marginTop: 16,
              fontFamily: SANS, fontSize: height * 0.012,
              color: CLAUDE.GHOST,
            }}>
              {g.key === 'conversational' && 'explanations · guidance · recommendations'}
              {g.key === 'written' && 'documents · analyses · email drafts · summaries'}
              {g.key === 'code' && 'code snippets · apps · queries · scripts'}
            </div>
          </div>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Data: Anthropic Economic Index, Cadences (June 2026)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    
      {/* @NikBearBrown watermark — lower-right, low opacity (LOGO LAW) */}
      <div style={{
        position: 'absolute',
        right: width * 0.04,
        bottom: height * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        @NikBearBrown
      </div>
    </AbsoluteFill>

  );
};
