import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SkillTeardownPipeline — horizontal phase-flow diagram for any skill teardown.
 * Shows INPUT → [phases] → OUTPUT with terracotta arrows.
 * ILLUSTRATE LAW: concept illustration, NOT a UI beat.
 */

const phaseSchema = z.object({
  label: z.string(),
  desc: z.string().default(''),
  accent: z.boolean().default(false),
});

export const skillTeardownPipelineSchema = z.object({
  eyebrow: z.string().default('SKILL · PIPELINE'),
  title: z.string().default('How the skill works.'),
  inputLabel: z.string().default('INPUT'),
  outputLabel: z.string().default('OUTPUT'),
  phases: z.array(phaseSchema).default([]),
  footerNote: z.string().optional(),
  sparkLine: z.string().default('One pass through the machine.'),
});
export type SkillTeardownPipelineProps = z.infer<typeof skillTeardownPipelineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const Arrow: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{ display: 'flex', alignItems: 'center', opacity }}>
    <div style={{ width: 32, height: 2, background: CLAUDE.SPARK }} />
    <div style={{
      width: 0, height: 0,
      borderLeft: `10px solid ${CLAUDE.SPARK}`,
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
    }} />
  </div>
);

export const SkillTeardownPipeline: React.FC<SkillTeardownPipelineProps> = ({
  eyebrow, title, inputLabel, outputLabel, phases, footerNote, sparkLine,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 60, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const allNodes = ['input', ...phases.map((_, i) => `p${i}`), 'output'];
  const nodeIn = allNodes.map((_, i) =>
    spring({ frame: frame - 20 - i * 12, fps, config: { damping: 28, stiffness: 130, mass: 0.85 } })
  );

  // Responsive sizing based on number of phases
  const n = phases.length + 2; // +2 for input/output
  const boxW = Math.min(200, Math.floor((width * 0.78) / n) - 20);
  const boxH = 120;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.07,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        {eyebrow}
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.125,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 44,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        {title}
      </div>

      {/* Pipeline row */}
      <div style={{
        position: 'absolute',
        top: height * 0.38,
        left: width * 0.07,
        right: width * 0.07,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        flexWrap: 'nowrap' as const,
      }}>

        {/* INPUT node */}
        <div style={{
          display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
          opacity: clamp(nodeIn[0], 0, 1),
          transform: `translateY(${(1 - clamp(nodeIn[0], 0, 1)) * 16}px)`,
        }}>
          <div style={{
            width: boxW, minHeight: boxH,
            background: CLAUDE.FOOTER,
            border: `1px solid ${CLAUDE.BORDER}`,
            borderRadius: 10,
            padding: '16px 14px',
            textAlign: 'center' as const,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 8 }}>INPUT</div>
            <div style={{ fontFamily: SERIF, fontSize: 20, color: CLAUDE.INK, fontWeight: 600 }}>{inputLabel}</div>
          </div>
        </div>

        <Arrow opacity={clamp(nodeIn[1], 0, 1)} />

        {/* Phase nodes */}
        {phases.map((ph, i) => {
          const ni = i + 1;
          const op = clamp(nodeIn[ni], 0, 1);
          return (
            <React.Fragment key={i}>
              <div style={{
                display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
                opacity: op,
                transform: `translateY(${(1 - op) * 16}px)`,
              }}>
                <div style={{
                  width: boxW, minHeight: boxH,
                  background: ph.accent ? 'rgba(217,119,87,0.07)' : CLAUDE.CARD,
                  border: `1px solid ${ph.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                  borderLeft: `4px solid ${ph.accent ? CLAUDE.SPARK : CLAUDE.INK}`,
                  borderRadius: 10,
                  padding: '16px 14px',
                  textAlign: 'center' as const,
                  boxShadow: '0 4px 16px rgba(61,57,41,0.07)',
                }}>
                  <div style={{ fontFamily: SERIF, fontSize: Math.min(22, boxW * 0.1 + 8), color: ph.accent ? CLAUDE.SPARK : CLAUDE.INK, fontWeight: 600, lineHeight: 1.25 }}>{ph.label}</div>
                  {ph.desc && (
                    <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, marginTop: 8, lineHeight: 1.4 }}>{ph.desc}</div>
                  )}
                </div>
              </div>
              {i < phases.length - 1 && <Arrow opacity={clamp(nodeIn[ni + 1], 0, 1)} />}
            </React.Fragment>
          );
        })}

        <Arrow opacity={clamp(nodeIn[phases.length + 1], 0, 1)} />

        {/* OUTPUT node */}
        <div style={{
          display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
          opacity: clamp(nodeIn[phases.length + 1], 0, 1),
          transform: `translateY(${(1 - clamp(nodeIn[phases.length + 1], 0, 1)) * 16}px)`,
        }}>
          <div style={{
            width: boxW, minHeight: boxH,
            background: 'rgba(217,119,87,0.07)',
            border: `2px solid ${CLAUDE.SPARK}`,
            borderRadius: 10,
            padding: '16px 14px',
            textAlign: 'center' as const,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 8 }}>OUTPUT</div>
            <div style={{ fontFamily: SERIF, fontSize: 20, color: CLAUDE.INK, fontWeight: 600 }}>{outputLabel}</div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      {footerNote && (
        <div style={{
          position: 'absolute',
          bottom: height * 0.16,
          left: 0, right: 0,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: 20,
          color: CLAUDE.INK_SOFT,
          opacity: clamp(nodeIn[nodeIn.length - 1], 0, 1),
        }}>
          {footerNote}
        </div>
      )}

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
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
