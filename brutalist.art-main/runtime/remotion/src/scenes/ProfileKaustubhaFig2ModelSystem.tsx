import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileKaustubhaFig2ModelSystem — the thesis engine.
 * Central MODEL node absorbed into the surrounding SYSTEM.
 * Terracotta: "a curiosity → a tool" transition.
 * Beat B02 of claude-liam-profile-kaustubha-eluri.
 */

export const profileKaustubhaFig2ModelSystemSchema = z.object({
  sparkLine: z.string().default('Trustworthiness is a system property.'),
});
export type ProfileKaustubhaFig2ModelSystemProps = z.infer<typeof profileKaustubhaFig2ModelSystemSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const SYSTEM_NODES = [
  { label: 'Integration', angle: 0 },
  { label: 'Deployment', angle: 60 },
  { label: 'Reliability', angle: 120 },
  { label: 'Failure Handling', angle: 180 },
  { label: 'Observability', angle: 240 },
  { label: 'Scale', angle: 300 },
];

export const ProfileKaustubhaFig2ModelSystem: React.FC<ProfileKaustubhaFig2ModelSystemProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const cx = width / 2;
  const cy = height * 0.53;
  const radius = height * 0.28;
  const modelR = height * 0.11;
  const nodeR = 54;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const modelIn = spring({ frame: frame - Math.round(8 * S),   fps, config: { damping: 26, stiffness: 80 } });
  const tagIn = spring({ frame: frame - Math.round(40 * S),    fps, config: { damping: 30, stiffness: 100 } });
  const sparkIn = spring({ frame: frame - Math.round(130 * S), fps, config: { damping: 28, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: width * 0.10, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: width * 0.10, top: height * 0.13,
        fontFamily: SERIF, fontSize: height * 0.050, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(headerIn, 0, 1), transform: `translateY(${(1 - headerIn) * 10}px)`,
      }}>
        Model vs System
      </div>

      {/* SVG layer — lines and nodes */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {SYSTEM_NODES.map((node, i) => {
          const delay = Math.round((30 + i * 15) * S);
          const nodeIn = spring({ frame: frame - delay, fps, config: { damping: 26, stiffness: 80 } });
          if (nodeIn <= 0) return null;
          const angleRad = (node.angle * Math.PI) / 180;
          const nx = cx + radius * Math.cos(angleRad);
          const ny = cy + radius * Math.sin(angleRad);
          const lineLen = spring({ frame: frame - Math.max(0, delay - 10), fps, config: { damping: 30, stiffness: 100 } });
          const lineEnd = {
            x: cx + (radius - nodeR - 8) * Math.cos(angleRad) * clamp(lineLen, 0, 1),
            y: cy + (radius - nodeR - 8) * Math.sin(angleRad) * clamp(lineLen, 0, 1),
          };

          return (
            <g key={i} opacity={clamp(nodeIn, 0, 1)}>
              {/* Connector line */}
              <line
                x1={cx + (modelR + 6) * Math.cos(angleRad)}
                y1={cy + (modelR + 6) * Math.sin(angleRad)}
                x2={lineEnd.x}
                y2={lineEnd.y}
                stroke={CLAUDE.BORDER}
                strokeWidth={1.5}
              />
              {/* System node circle */}
              <circle
                cx={nx}
                cy={ny}
                r={nodeR}
                fill={CLAUDE.CARD}
                stroke={CLAUDE.BORDER}
                strokeWidth={2}
              />
            </g>
          );
        })}
      </svg>

      {/* System node labels */}
      {SYSTEM_NODES.map((node, i) => {
        const delay = Math.round((30 + i * 15) * S);
        const nodeIn = spring({ frame: frame - delay, fps, config: { damping: 26, stiffness: 80 } });
        if (nodeIn <= 0) return null;
        const angleRad = (node.angle * Math.PI) / 180;
        const nx = cx + radius * Math.cos(angleRad);
        const ny = cy + radius * Math.sin(angleRad);

        return (
          <div key={i} style={{
            position: 'absolute',
            left: nx - nodeR,
            top: ny - 22,
            width: nodeR * 2,
            textAlign: 'center',
            fontFamily: SANS,
            fontSize: height * 0.016,
            fontWeight: 600,
            color: CLAUDE.INK_SOFT,
            opacity: clamp(nodeIn, 0, 1),
            lineHeight: 1.3,
          }}>
            {node.label}
          </div>
        );
      })}

      {/* Central MODEL node */}
      <div style={{
        position: 'absolute',
        left: cx - modelR,
        top: cy - modelR,
        width: modelR * 2,
        height: modelR * 2,
        borderRadius: '50%',
        background: CLAUDE.CARD,
        border: `3px solid ${CLAUDE.SPARK}`,
        boxShadow: `0 8px 32px ${CLAUDE.SPARK}40`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 4,
        opacity: clamp(modelIn, 0, 1),
        transform: `scale(${0.7 + 0.3 * clamp(modelIn, 0, 1)})`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.016, fontWeight: 700,
          letterSpacing: 2, textTransform: 'uppercase' as const,
          color: CLAUDE.SPARK,
        }}>MODEL</div>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.014,
          color: CLAUDE.INK_SOFT, textAlign: 'center',
        }}>accurate<br />in isolation</div>
      </div>

      {/* "curiosity → tool" tag */}
      <div style={{
        position: 'absolute',
        left: cx - 160,
        top: cy + radius + 24,
        width: 320,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: height * 0.030,
        fontStyle: 'italic',
        color: CLAUDE.SPARK,
        opacity: clamp(tagIn, 0, 1),
        transform: `translateY(${(1 - clamp(tagIn, 0, 1)) * 12}px)`,
      }}>
        a curiosity → a tool
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.07,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `scale(${idlePulse})`,
      }}>
        <div style={{ transform: `rotate(${frame * 0.15}deg)` }}>
        </div>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.026, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
