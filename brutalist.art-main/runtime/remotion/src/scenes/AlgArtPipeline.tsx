import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AlgArtPipeline — three-node flow diagram for the algorithmic-art skill pipeline.
 * USER REQUEST → ALGORITHMIC PHILOSOPHY (.md manifesto) → EXPRESSION (.html artifact)
 * Terracotta arrow between the two Claude phases (the handoff is the invention).
 * Claude palette: cream page, warm ink, one terracotta accent.
 */

export const algArtPipelineSchema = z.object({
  sparkLine: z.string().default('The handoff is the invention.'),
});
export type AlgArtPipelineProps = z.infer<typeof algArtPipelineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


interface NodeProps {
  label: string;
  sublabel: string;
  chips?: string[];
  isAccent?: boolean;
  opacity: number;
  translateY: number;
}

const Node: React.FC<NodeProps> = ({ label, sublabel, chips, isAccent, opacity, translateY }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    opacity,
    transform: `translateY(${translateY}px)`,
    width: 300,
  }}>
    <div style={{
      background: isAccent ? CLAUDE.SPARK : CLAUDE.CARD,
      border: `2px solid ${isAccent ? CLAUDE.SEND : CLAUDE.BORDER}`,
      borderRadius: 16,
      padding: '28px 32px',
      width: '100%',
      boxShadow: isAccent
        ? '0 8px 32px rgba(217,119,87,0.25)'
        : '0 4px 20px rgba(61,57,41,0.10)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
    }}>
      <div style={{
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: isAccent ? 'rgba(255,255,255,0.75)' : CLAUDE.INK_SOFT,
      }}>
        {sublabel}
      </div>
      <div style={{
        fontFamily: SERIF,
        fontSize: 22,
        fontWeight: 700,
        color: isAccent ? '#FFFFFF' : CLAUDE.INK,
        textAlign: 'center',
        lineHeight: 1.3,
      }}>
        {label}
      </div>
    </div>
    {chips && chips.length > 0 && (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
      }}>
        {chips.map((chip, i) => (
          <div key={i} style={{
            background: CLAUDE.PILL,
            borderRadius: 8,
            padding: '4px 12px',
            fontFamily: SANS,
            fontSize: 12,
            color: CLAUDE.INK_SOFT,
            whiteSpace: 'nowrap' as const,
          }}>
            {chip}
          </div>
        ))}
      </div>
    )}
  </div>
);

const Arrow: React.FC<{ color: string; opacity: number; label?: string }> = ({ color, opacity, label }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    opacity,
    gap: 4,
    width: 80,
  }}>
    {label && (
      <div style={{
        fontFamily: SANS,
        fontSize: 10,
        color,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
        textAlign: 'center' as const,
      }}>
        {label}
      </div>
    )}
    <svg width={80} height={28} viewBox="0 0 80 28" style={{ display: 'block' }}>
      <line x1={4} y1={14} x2={68} y2={14} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <polyline points="58,6 68,14 58,22" stroke={color} strokeWidth={2.5} fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const AlgArtPipeline: React.FC<AlgArtPipelineProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const n1In = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const a1In = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const n2In = spring({ frame: frame - 18, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const a2In = spring({ frame: frame - 28, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const n3In = spring({ frame: frame - 36, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.10,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(n1In, 0, 1),
      }}>
        ALGORITHMIC ART · ANTHROPIC SKILL · PIPELINE
      </div>

      {/* Section title */}
      <div style={{
        position: 'absolute',
        top: height * 0.155,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 38,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(n1In, 0, 1),
        transform: `translateY(${(1 - clamp(n1In, 0, 1)) * 12}px)`,
      }}>
        What a Skill Does
      </div>

      {/* Three-node flow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 0,
        paddingTop: 20,
      }}>
        <Node
          label="User Request"
          sublabel="INPUT"
          opacity={clamp(n1In, 0, 1)}
          translateY={(1 - clamp(n1In, 0, 1)) * 16}
        />

        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 32 }}>
          <Arrow color={CLAUDE.INK_SOFT} opacity={clamp(a1In, 0, 1)} />
        </div>

        <Node
          label="Algorithmic Philosophy"
          sublabel="PHASE ONE · MANIFESTO"
          isAccent
          chips={['4–6 paragraphs', 'a named movement', 'written by Claude, for Claude']}
          opacity={clamp(n2In, 0, 1)}
          translateY={(1 - clamp(n2In, 0, 1)) * 16}
        />

        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 32 }}>
          <Arrow color={CLAUDE.SPARK} opacity={clamp(a2In, 0, 1)} label="HANDOFF" />
        </div>

        <Node
          label="Expression"
          sublabel="PHASE TWO · ARTIFACT"
          chips={['.html artifact', 'p5.js inline', 'seeded & reproducible']}
          opacity={clamp(n3In, 0, 1)}
          translateY={(1 - clamp(n3In, 0, 1)) * 16}
        />
      </div>

      {/* Source citation */}
      <div style={{
        position: 'absolute',
        right: width * 0.06,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: 11,
        color: CLAUDE.GHOST,
        opacity: clamp(n3In, 0, 1),
      }}>
        Source: Anthropic, algorithmic-art SKILL.md
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.07,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
