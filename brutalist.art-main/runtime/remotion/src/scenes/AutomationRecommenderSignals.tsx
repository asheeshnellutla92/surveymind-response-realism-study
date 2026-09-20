import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AutomationRecommenderSignals — B02 — 3-phase workflow + signal→recommendation examples.
 */

export const automationRecommenderSignalsSchema = z.object({
  sparkLine: z.string().default('Detect signals. Match type. Cap at 1-2. Tell users they can ask for more.'),
});
export type AutomationRecommenderSignalsProps = z.infer<typeof automationRecommenderSignalsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PHASES = [
  {
    num: '1',
    label: 'Analyze Codebase',
    items: ['Detect language & framework (package.json / pyproject.toml)', 'Check for existing Claude config', 'Find testing frameworks, CI config, DB clients, API SDKs'],
  },
  {
    num: '2',
    label: 'Generate Recommendations',
    items: ['Match each signal to an automation type', 'Apply 1-2 per category cap — most valuable first', 'Tell users they can ask for more'],
  },
  {
    num: '3',
    label: 'Output Report',
    items: ['Codebase profile summary', 'One section per type: rec + why + how to install/create', 'Structured, not a raw table dump'],
  },
];

const SIGNALS = [
  { signal: 'Prettier configured', type: 'Hook', rec: 'PostToolUse format hook', color: '#4A7C59' },
  { signal: 'Popular libraries in use', type: 'MCP Server', rec: 'Context7 (default MCP rec)', color: CLAUDE.SPARK },
  { signal: 'GitHub repository detected', type: 'MCP Server', rec: 'GitHub MCP Server', color: CLAUDE.SPARK },
  { signal: 'Auth or payments code found', type: 'Subagent', rec: 'Security-reviewer subagent', color: '#4A7C59' },
  { signal: 'Codebase > 500 files', type: 'Subagent', rec: 'Code-reviewer subagent', color: '#4A7C59' },
];

export const AutomationRecommenderSignals: React.FC<AutomationRecommenderSignalsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const phaseSprings = PHASES.map((_, i) =>
    spring({ frame: frame - 8 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const sigLabelIn = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const sigSprings = SIGNALS.map((_, i) =>
    spring({ frame: frame - 60 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const PHASE_TOP = H * 0.20;
  const PHASE_H = (H * 0.34) / 3 - 6;
  const SIG_TOP = H * 0.64;
  const SIG_H = (H * 0.25) / 5 - 5;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CLAUDE AUTOMATION RECOMMENDER · WORKFLOW
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Analyze → match → cap at 1–2 → report.
      </div>

      {PHASES.map((ph, i) => {
        const op = clamp(phaseSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: PHASE_TOP + i * (PHASE_H + 6),
            left: W * 0.05, right: W * 0.05,
            height: PHASE_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${i === 1 ? CLAUDE.SPARK : '#4A7C59'}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 16,
            padding: '0 14px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -10}px)`,
          }}>
            <span style={{
              fontFamily: MONO, fontSize: 20, fontWeight: 700,
              color: i === 1 ? CLAUDE.SPARK : '#4A7C59',
              minWidth: 32, textAlign: 'center',
            }}>{ph.num}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: CLAUDE.INK }}>{ph.label}</span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT }}>
                {ph.items.join(' · ')}
              </span>
            </div>
          </div>
        );
      })}

      <div style={{
        position: 'absolute', top: SIG_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(sigLabelIn, 0, 1),
      }}>SIGNAL → RECOMMENDATION EXAMPLES</div>

      {SIGNALS.map((s, i) => {
        const op = clamp(sigSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: SIG_TOP + i * (SIG_H + 5),
            left: W * 0.05, right: W * 0.05,
            height: SIG_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${s.color}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 0,
            padding: '0 12px', boxSizing: 'border-box' as const,
            opacity: op, transform: `translateY(${(1 - op) * 6}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT, minWidth: 240 }}>{s.signal}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: s.color, minWidth: 100 }}>{s.type}</span>
            <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK }}>{s.rec}</span>
          </div>
        );
      })}

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
