import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandVerbScorecard — C06 four-verb-career-signal-audit centerpiece.
 * 3-project × 4-verb scorecard (Ideate/Build/Brand/Ship) populating with 0–3 scores.
 * Bar chart of aggregate verb profile below.
 * Lowest-scoring verb highlighted in terracotta with next-project recommendation.
 * Source: Branding and AI, Chapter 1 (Nina Harris).
 */
export const brandVerbScorecardSchema = z.object({
  projects: z.array(z.object({
    name: z.string(),
    ideate: z.number(),
    build: z.number(),
    brand: z.number(),
    ship: z.number(),
  })).default([
    { name: 'ML GitHub Repo', ideate: 1, build: 3, brand: 0, ship: 0 },
    { name: 'AI Dashboard', ideate: 1, build: 3, brand: 1, ship: 0 },
    { name: 'Data Pipeline', ideate: 2, build: 3, brand: 0, ship: 1 },
  ]),
  recommendation: z.string().default('Ship: Build a project that requires talking to real users before writing any code.'),
});
export type BrandVerbScorecardProps = z.infer<typeof brandVerbScorecardSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const VERBS = ['Ideate', 'Build', 'Brand', 'Ship'];

export const BrandVerbScorecard: React.FC<BrandVerbScorecardProps> = ({ projects, recommendation }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const headerIn = clamp(spring({ frame: frame - 8, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1);

  const rowSprings = projects.map((_, i) =>
    clamp(spring({ frame: frame - (14 + i * 12), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );
  const barSprings = VERBS.map((_, i) =>
    clamp(spring({ frame: frame - (42 + i * 8), fps, config: { damping: 24, stiffness: 120, mass: 1 } }), 0, 1)
  );
  const recoIn = clamp(spring({ frame: frame - 70, fps, config: { damping: 24, stiffness: 110, mass: 1 } }), 0, 1);
  const sourceIn = clamp(interpolate(frame, [80, 95], [0, 1]), 0, 1);

  const PAD = width * 0.07;
  const TABLE_W = width - PAD * 2;
  const COL_W = [TABLE_W * 0.32, TABLE_W * 0.17, TABLE_W * 0.17, TABLE_W * 0.17, TABLE_W * 0.17];

  // Compute aggregates
  const totals = {
    Ideate: projects.reduce((s, p) => s + p.ideate, 0),
    Build: projects.reduce((s, p) => s + p.build, 0),
    Brand: projects.reduce((s, p) => s + p.brand, 0),
    Ship: projects.reduce((s, p) => s + p.ship, 0),
  };
  const maxScore = projects.length * 3;
  const lowestVerb = VERBS.reduce((a, b) => (totals[a as keyof typeof totals] <= totals[b as keyof typeof totals] ? a : b));

  const scoreColor = (score: number) => {
    if (score === 0) return CLAUDE.GHOST;
    if (score === 1) return CLAUDE.INK_SOFT;
    if (score === 2) return CLAUDE.INK;
    return '#4A7C59';
  };

  const verbIsLowest = (verb: string) => verb === lowestVerb;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${height * 0.06}px ${PAD}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 34,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 16,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Four-Verb Portfolio Scorecard
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* Scorecard table */}
      <div style={{
        background: CLAUDE.CARD,
        border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 18,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          background: CLAUDE.FOOTER,
          borderBottom: `1px solid ${CLAUDE.BORDER}`,
          opacity: headerIn,
        }}>
          {['Project', ...VERBS].map((h, ci) => (
            <div key={ci} style={{
              flex: ci === 0 ? '0 0 32%' : '1',
              padding: '11px 12px',
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 700,
              color: verbIsLowest(h) ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRight: ci < VERBS.length ? `1px solid ${CLAUDE.BORDER}` : 'none',
              background: verbIsLowest(h) ? 'rgba(217,119,87,0.06)' : 'transparent',
            }}>{h}</div>
          ))}
        </div>

        {/* Project rows */}
        {projects.map((project, ri) => {
          const scores = [project.ideate, project.build, project.brand, project.ship];
          return (
            <div key={ri} style={{
              display: 'flex',
              borderBottom: ri < projects.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
              opacity: rowSprings[ri],
              transform: `translateX(${(1 - rowSprings[ri]) * -16}px)`,
              minHeight: 52,
              alignItems: 'center',
            }}>
              <div style={{
                flex: '0 0 32%',
                padding: '12px',
                fontFamily: SERIF,
                fontSize: 16,
                color: CLAUDE.INK,
                fontWeight: 600,
                borderRight: `1px solid ${CLAUDE.BORDER}`,
              }}>{project.name}</div>
              {VERBS.map((verb, vi) => {
                const score = scores[vi];
                return (
                  <div key={vi} style={{
                    flex: '1',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: vi < VERBS.length - 1 ? `1px solid ${CLAUDE.BORDER}` : 'none',
                    background: verbIsLowest(verb) ? 'rgba(217,119,87,0.04)' : 'transparent',
                  }}>
                    <span style={{
                      fontFamily: MONO,
                      fontSize: 22,
                      fontWeight: 700,
                      color: verbIsLowest(verb) && score === 0 ? CLAUDE.SPARK : scoreColor(score),
                    }}>{score}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Aggregate bar chart */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {VERBS.map((verb, i) => {
          const total = totals[verb as keyof typeof totals];
          const pct = (total / maxScore) * barSprings[i];
          return (
            <div key={verb} style={{ flex: 1 }}>
              <div style={{
                height: 60,
                background: CLAUDE.BORDER,
                borderRadius: 6,
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${pct * 100}%`,
                  background: verbIsLowest(verb) ? CLAUDE.SPARK : CLAUDE.INK,
                  borderRadius: 6,
                }} />
              </div>
              <div style={{
                textAlign: 'center',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 700,
                color: verbIsLowest(verb) ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                marginTop: 6,
                letterSpacing: '0.04em',
              }}>
                {verb} ({total}/{maxScore})
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      <div style={{
        padding: '14px 18px',
        background: `rgba(217,119,87,0.07)`,
        border: `1px solid ${CLAUDE.SPARK}`,
        borderRadius: 10,
        opacity: recoIn,
        transform: `translateY(${(1 - recoIn) * 10}px)`,
      }}>
        <span style={{
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 700,
          color: CLAUDE.SPARK,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginRight: 10,
        }}>Next project →</span>
        <span style={{ fontFamily: SERIF, fontSize: 16, color: CLAUDE.INK }}>{recommendation}</span>
      </div>

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        right: PAD,
        fontFamily: SANS,
        fontSize: 12,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 1
      </div>
    </AbsoluteFill>
  );
};
