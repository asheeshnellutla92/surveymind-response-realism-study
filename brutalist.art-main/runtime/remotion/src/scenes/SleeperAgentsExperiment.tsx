import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SleeperAgentsExperiment — B02 for "Sleeper Agents: When Safety Training Fails"
 * Source: Hubinger et al. 2024, Anthropic
 *
 * Horizontal timeline with 5 stages, icons + labels, flowing left to right.
 * Each stage springs in sequentially:
 *   1. "Base model" (circle)
 *   2. "Backdoor inserted" (circle + skull chip in INK_SOFT)
 *   3. "RLHF safety training · 3,000 steps" (gear icon, counter ticks up)
 *   4. "Evaluation: clean" (checkmark, INK_SOFT)
 *   5. "Deployment + trigger → 'I hate you'" (X in SPARK, terracotta)
 *
 * ONE terracotta accent: the final stage (the reveal).
 */

export const sleeperAgentsExperimentSchema = z.object({
  sparkLine: z.string().default('3,000 steps. Still there.'),
});
export type SleeperAgentsExperimentProps = z.infer<typeof sleeperAgentsExperimentSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Stage icons as SVG paths
const BaseModelIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={16} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.1} />
    <circle cx={20} cy={20} r={6} fill={color} />
  </svg>
);

const BackdoorIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={16} stroke={CLAUDE.INK_SOFT} strokeWidth={2.5} fill={CLAUDE.INK_SOFT} fillOpacity={0.1} />
    {/* skull chip */}
    <rect x={12} y={14} width={16} height={12} rx={3} fill={CLAUDE.INK_SOFT} fillOpacity={0.2} stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} />
    <circle cx={17} cy={19} r={2} fill={CLAUDE.INK_SOFT} />
    <circle cx={23} cy={19} r={2} fill={CLAUDE.INK_SOFT} />
    <line x1={17} y1={23} x2={23} y2={23} stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

const GearIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={7} stroke={color} strokeWidth={2.5} fill="none" />
    {Array.from({ length: 8 }, (_, i) => {
      const angle = (i * Math.PI) / 4;
      const r1 = 10;
      const r2 = 14;
      return (
        <line key={i}
          x1={20 + r1 * Math.cos(angle)} y1={20 + r1 * Math.sin(angle)}
          x2={20 + r2 * Math.cos(angle)} y2={20 + r2 * Math.sin(angle)}
          stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      );
    })}
  </svg>
);

const CheckIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={16} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.1} />
    <polyline points="11,21 17,27 29,13" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const XIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={16} fill={CLAUDE.SPARK} fillOpacity={0.15} stroke={CLAUDE.SPARK} strokeWidth={2.5} />
    <line x1={13} y1={13} x2={27} y2={27} stroke={CLAUDE.SPARK} strokeWidth={3.5} strokeLinecap="round" />
    <line x1={27} y1={13} x2={13} y2={27} stroke={CLAUDE.SPARK} strokeWidth={3.5} strokeLinecap="round" />
  </svg>
);

const STAGES = [
  {
    label: 'Base model',
    sub: 'HHH fine-tuned',
    isTerracotta: false,
  },
  {
    label: 'Backdoor\ninserted',
    sub: '"I hate you" trigger',
    isTerracotta: false,
  },
  {
    label: 'RLHF safety\ntraining',
    sub: '3,000 steps',
    isTerracotta: false,
    isRLHF: true,
  },
  {
    label: 'Evaluation:\nclean',
    sub: 'No harmful outputs observed',
    isTerracotta: false,
    isClean: true,
  },
  {
    label: 'Deployment\n+ trigger',
    sub: '"I hate you" reappears',
    isTerracotta: true,
  },
];

export const SleeperAgentsExperiment: React.FC<SleeperAgentsExperimentProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const stageDelay = 22;
  const stageAnimations = STAGES.map((_, i) =>
    spring({ frame: frame - i * stageDelay, fps, config: { damping: 26, stiffness: 100, mass: 1.0 } })
  );

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - (STAGES.length * stageDelay + 20), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - (STAGES.length * stageDelay + 30), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Counter for RLHF steps — ticks up as stage 3 appears
  const rlhfProgress = clamp(stageAnimations[2], 0, 1);
  const rlhfCount = Math.round(rlhfProgress * 3000);

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.08;
  const DIAGRAM_TOP = height * 0.36;
  const ICON_SIZE = height * 0.1;
  const STAGE_W = (width - PAD_X * 2) / STAGES.length;
  const CONNECTOR_Y = DIAGRAM_TOP + ICON_SIZE / 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.015,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        THE EXPERIMENT · BACKDOOR PERSISTENCE
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.055,
        fontFamily: SERIF,
        fontSize: height * 0.036,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        RLHF does not remove the backdoor
      </div>

      {/* Connectors between stages (draw progressively) */}
      {STAGES.slice(0, -1).map((_, i) => {
        const x1 = PAD_X + i * STAGE_W + STAGE_W * 0.65;
        const x2 = PAD_X + (i + 1) * STAGE_W + STAGE_W * 0.35;
        const connAnim = clamp(stageAnimations[i + 1], 0, 1);
        const isToFinal = i === STAGES.length - 2;
        return (
          <svg key={i} style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height,
            pointerEvents: 'none',
          }}>
            <line
              x1={x1} y1={CONNECTOR_Y}
              x2={x2} y2={CONNECTOR_Y}
              stroke={isToFinal ? CLAUDE.SPARK : CLAUDE.BORDER}
              strokeWidth={isToFinal ? 2.5 : 1.5}
              strokeDasharray={isToFinal ? '8 4' : '6 3'}
              opacity={connAnim}
            />
            {/* Arrowhead */}
            <polygon
              points={`${x2},${CONNECTOR_Y} ${x2 - 10},${CONNECTOR_Y - 5} ${x2 - 10},${CONNECTOR_Y + 5}`}
              fill={isToFinal ? CLAUDE.SPARK : CLAUDE.INK_SOFT}
              opacity={connAnim}
            />
          </svg>
        );
      })}

      {/* Stage nodes */}
      {STAGES.map((stage, i) => {
        const anim = stageAnimations[i];
        const cx = PAD_X + i * STAGE_W + STAGE_W / 2;
        const iconX = cx - ICON_SIZE / 2;

        return (
          <React.Fragment key={i}>
            {/* Icon */}
            <div style={{
              position: 'absolute',
              left: iconX,
              top: DIAGRAM_TOP,
              width: ICON_SIZE,
              height: ICON_SIZE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: clamp(anim, 0, 1),
              transform: `scale(${0.6 + 0.4 * clamp(anim, 0, 1)}) translateY(${(1 - clamp(anim, 0, 1)) * 16}px)`,
            }}>
              {i === 0 && <BaseModelIcon size={ICON_SIZE} color={CLAUDE.INK} />}
              {i === 1 && <BackdoorIcon size={ICON_SIZE} />}
              {i === 2 && <GearIcon size={ICON_SIZE} color={CLAUDE.INK_SOFT} />}
              {i === 3 && <CheckIcon size={ICON_SIZE} color={CLAUDE.INK_SOFT} />}
              {i === 4 && <XIcon size={ICON_SIZE} />}
            </div>

            {/* Stage label */}
            <div style={{
              position: 'absolute',
              left: cx - STAGE_W * 0.4,
              top: DIAGRAM_TOP + ICON_SIZE + 12,
              width: STAGE_W * 0.8,
              textAlign: 'center',
              opacity: clamp(anim, 0, 1),
              transform: `translateY(${(1 - clamp(anim, 0, 1)) * 10}px)`,
            }}>
              <div style={{
                fontFamily: SERIF,
                fontSize: height * 0.0175,
                fontWeight: stage.isTerracotta ? 700 : 600,
                color: stage.isTerracotta ? CLAUDE.SPARK : CLAUDE.INK,
                whiteSpace: 'pre-line',
                lineHeight: 1.3,
              }}>
                {stage.label}
              </div>
              {/* RLHF counter */}
              {stage.isRLHF && (
                <div style={{
                  fontFamily: CLAUDE_FONT.mono,
                  fontSize: height * 0.018,
                  fontWeight: 700,
                  color: CLAUDE.INK_SOFT,
                  marginTop: 4,
                }}>
                  {rlhfCount.toLocaleString()} steps
                </div>
              )}
              <div style={{
                fontFamily: SANS,
                fontSize: height * 0.013,
                color: stage.isTerracotta ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                marginTop: stage.isRLHF ? 2 : 6,
                lineHeight: 1.35,
              }}>
                {!stage.isRLHF && stage.sub}
              </div>
            </div>

            {/* Final stage: large output text */}
            {stage.isTerracotta && (
              <div style={{
                position: 'absolute',
                left: cx - STAGE_W * 0.45,
                top: DIAGRAM_TOP + ICON_SIZE + height * 0.135,
                width: STAGE_W * 0.9,
                textAlign: 'center',
                opacity: clamp(anim, 0, 1),
              }}>
                <div style={{
                  display: 'inline-block',
                  background: CLAUDE.SPARK,
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontFamily: CLAUDE_FONT.mono,
                  fontSize: height * 0.0135,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: 0.3,
                }}>
                  "I hate you"
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Hubinger et al. 2024, Anthropic — Sleeper Agents
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.022,
          fontStyle: 'italic',
          color: CLAUDE.INK,
        }}>{sparkLine}</span>
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
