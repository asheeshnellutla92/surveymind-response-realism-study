import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ThemeFactoryConsentGate — B03 — four pipeline nodes: SHOW → ASK → WAIT → APPLY
 * Nodes 1 (SHOW) and 4 (APPLY): Claude palette (machine work)
 * Nodes 2 (ASK) and 3 (WAIT): terracotta accent + human silhouette icon
 * WAIT node pulses (opacity oscillation) while narration lands on it.
 * Verbatim caption plaque: "Get explicit confirmation about the chosen theme."
 * ILLUSTRATE LAW: concept illustration, NOT a UI beat.
 */

export const themeFactoryConsentGateSchema = z.object({
  sparkLine: z.string().default('Taste stays human.'),
});
export type ThemeFactoryConsentGateProps = z.infer<typeof themeFactoryConsentGateSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Human silhouette SVG for the human-gate nodes
const HumanIcon: React.FC<{ size?: number; color?: string }> = ({ size = 32, color = '#FFFFFF' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
    <circle cx={12} cy={7} r={4} fill={color} opacity={0.85} />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.85} />
  </svg>
);

// Machine icon (Claude spark)
const MachineIcon: React.FC<{ size?: number; color?: string }> = ({ size = 32, color = CLAUDE.INK_SOFT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
    <polygon points="12,3 14.5,9.5 21,12 14.5,14.5 12,21 9.5,14.5 3,12 9.5,9.5" fill={color} opacity={0.9} />
  </svg>
);

interface NodeConfig {
  step: string;
  label: string;
  sublabel: string;
  type: 'machine' | 'human';
  delay: number;
}

const NODES: NodeConfig[] = [
  { step: '01', label: 'SHOW', sublabel: 'Display theme-showcase.pdf', type: 'machine', delay: 0 },
  { step: '02', label: 'ASK', sublabel: 'Ask which theme to apply', type: 'human', delay: 12 },
  { step: '03', label: 'WAIT', sublabel: 'Get explicit confirmation', type: 'human', delay: 24 },
  { step: '04', label: 'APPLY', sublabel: 'Apply colors and fonts', type: 'machine', delay: 36 },
];

// Arrow between nodes
const Arrow: React.FC<{ accent: boolean; opacity: number }> = ({ accent, opacity }) => (
  <svg width={80} height={36} viewBox="0 0 80 36" style={{ display: 'block', flexShrink: 0, opacity }}>
    <line x1={4} y1={18} x2={64} y2={18} stroke={accent ? CLAUDE.SPARK : CLAUDE.BORDER} strokeWidth={2.5} strokeLinecap="round" />
    <polyline points="54,10 64,18 54,26" stroke={accent ? CLAUDE.SPARK : CLAUDE.BORDER} strokeWidth={2.5} fill="none"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ThemeFactoryConsentGate: React.FC<ThemeFactoryConsentGateProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 60, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  // WAIT node pulse: begins after it appears (~frame 55+), oscillates 0.6–1.0
  const waitPulse = 0.7 + 0.3 * Math.sin((frame - 55) * 0.12);

  const nodeSprings = NODES.map((n) =>
    spring({ frame: frame - n.delay, fps, config: { damping: 28, stiffness: 130, mass: 0.85 } })
  );
  const arrowSprings = NODES.map((_, i) =>
    spring({ frame: frame - NODES[i].delay + 6, fps, config: { damping: 28, stiffness: 130, mass: 0.85 } })
  );

  const plaqueIn = spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.065,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        THEME FACTORY · CONSENT GATE · USAGE INSTRUCTIONS
      </div>

      {/* Section title */}
      <div style={{
        position: 'absolute',
        top: height * 0.13,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 42,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        The four-step gate
      </div>

      {/* Four nodes in a row */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: width * 0.05,
        right: width * 0.05,
        transform: 'translateY(-55%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}>
        {NODES.map((node, i) => {
          const isHuman = node.type === 'human';
          const isWait = node.label === 'WAIT';
          const op = clamp(nodeSprings[i], 0, 1);
          const pulse = isWait && op > 0.9 ? waitPulse : 1;

          return (
            <React.Fragment key={node.step}>
              {/* Node */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 200,
                opacity: op,
                transform: `translateY(${(1 - op) * 20}px) scale(${isWait && op > 0.9 ? 0.97 + 0.03 * pulse : 0.93 + 0.07 * op})`,
              }}>
                {/* Icon badge */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: isHuman ? CLAUDE.SPARK : CLAUDE.PAGE,
                  border: isHuman ? `2px solid ${CLAUDE.SEND}` : `2px solid ${CLAUDE.BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isHuman ? '0 4px 20px rgba(217,119,87,0.3)' : '0 2px 12px rgba(61,57,41,0.08)',
                  marginBottom: 14,
                  opacity: isWait && op > 0.9 ? pulse : 1,
                }}>
                  {isHuman
                    ? <HumanIcon size={28} color="#FFFFFF" />
                    : <MachineIcon size={28} color={CLAUDE.INK_SOFT} />
                  }
                </div>

                {/* Step label */}
                <div style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 3,
                  color: isHuman ? CLAUDE.SPARK : CLAUDE.GHOST,
                  textTransform: 'uppercase' as const,
                  marginBottom: 6,
                }}>
                  STEP {node.step}
                </div>

                {/* Node card */}
                <div style={{
                  background: isHuman ? 'rgba(217,119,87,0.08)' : CLAUDE.CARD,
                  border: `2px solid ${isHuman ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                  borderRadius: 16,
                  padding: '20px 16px',
                  width: '100%',
                  textAlign: 'center',
                  boxShadow: isHuman ? '0 6px 24px rgba(217,119,87,0.18)' : '0 3px 14px rgba(61,57,41,0.08)',
                }}>
                  <div style={{
                    fontFamily: SANS,
                    fontSize: 24,
                    fontWeight: 900,
                    color: isHuman ? CLAUDE.SPARK : CLAUDE.INK,
                    letterSpacing: 1,
                  }}>
                    {node.label}
                  </div>
                  <div style={{
                    fontFamily: SANS,
                    fontSize: 13,
                    color: CLAUDE.INK_SOFT,
                    marginTop: 8,
                    lineHeight: 1.4,
                  }}>
                    {node.sublabel}
                  </div>
                </div>

                {/* HUMAN / MACHINE label below */}
                <div style={{
                  marginTop: 10,
                  fontFamily: SANS,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase' as const,
                  color: isHuman ? CLAUDE.SPARK : CLAUDE.GHOST,
                }}>
                  {isHuman ? '← human' : 'machine →'}
                </div>
              </div>

              {/* Arrow (between nodes) */}
              {i < NODES.length - 1 && (
                <Arrow
                  accent={i === 1}
                  opacity={clamp(arrowSprings[i], 0, 1)}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Verbatim quote plaque */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.16,
        left: width * 0.15,
        right: width * 0.15,
        background: 'rgba(217,119,87,0.07)',
        border: `1px solid ${CLAUDE.SPARK}`,
        borderLeft: `4px solid ${CLAUDE.SPARK}`,
        borderRadius: 12,
        padding: '16px 28px',
        opacity: clamp(plaqueIn, 0, 1),
        transform: `translateY(${(1 - clamp(plaqueIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: CLAUDE.INK, fontStyle: 'italic' }}>
          "Get explicit confirmation about the chosen theme."
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.GHOST, marginTop: 6 }}>
          — Anthropic, theme-factory SKILL.md, Usage Instructions step 3
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
