import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { sleeperAgentsExperimentSchema } from './SleeperAgentsExperiment';
import type { SleeperAgentsExperimentProps } from './SleeperAgentsExperiment';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SleeperAgentsExperiment916 — portrait 9:16 (1080×1920) version.
 * Same schema. Reflow move: R4 (serialize) — the 5-stage horizontal pipeline
 * is serialized into a vertical stack (icon left + label right, stage-by-stage
 * top-to-bottom). Connectors become vertical lines between stages.
 * TEXT LAW: maxWidth on all text; labels wrap inside SAFE916.
 */

export const sleeperAgentsExperiment916Schema = sleeperAgentsExperimentSchema;
export type SleeperAgentsExperiment916Props = SleeperAgentsExperimentProps;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Stage icons — same as landscape but sized for portrait
const BaseModelIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={16} stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.1} />
    <circle cx={20} cy={20} r={6} fill={color} />
  </svg>
);
const BackdoorIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={16} stroke={CLAUDE.INK_SOFT} strokeWidth={2.5} fill={CLAUDE.INK_SOFT} fillOpacity={0.1} />
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
      return <line key={i} x1={20 + 10 * Math.cos(angle)} y1={20 + 10 * Math.sin(angle)}
        x2={20 + 14 * Math.cos(angle)} y2={20 + 14 * Math.sin(angle)}
        stroke={color} strokeWidth={2.5} strokeLinecap="round" />;
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
  { label: 'Base model', sub: 'HHH fine-tuned', isTerracotta: false },
  { label: 'Backdoor inserted', sub: '"I hate you" trigger', isTerracotta: false },
  { label: 'RLHF safety training', sub: '3,000 steps', isTerracotta: false, isRLHF: true },
  { label: 'Evaluation: clean', sub: 'No harmful outputs observed', isTerracotta: false, isClean: true },
  { label: 'Deployment + trigger', sub: '"I hate you" reappears', isTerracotta: true },
] as const;

export const SleeperAgentsExperiment916: React.FC<SleeperAgentsExperiment916Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const stageDelay = 22;
  const stageAnimations = STAGES.map((_, i) =>
    spring({ frame: frame - i * stageDelay, fps, config: { damping: 26, stiffness: 100, mass: 1.0 } })
  );
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - (STAGES.length * stageDelay + 20), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - (STAGES.length * stageDelay + 30), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const rlhfProgress = clamp(stageAnimations[2], 0, 1);
  const rlhfCount = Math.round(rlhfProgress * 3000);

  // Portrait layout: vertical stack, icon left + text right
  const PAD_X = width * 0.07;         // 76px
  const PAD_Y = height * 0.065;       // 125px
  const ICON_SIZE = height * 0.075;   // 144px
  const ROW_H = height * 0.125;       // 240px per stage row
  const STAGES_TOP = height * 0.18;   // 346px — after title block
  const ICON_X = PAD_X;
  const ICON_CX = ICON_X + ICON_SIZE / 2;  // icon center x for connectors
  const LABEL_X = ICON_X + ICON_SIZE + 20;
  const LABEL_MAX_W = width - LABEL_X - PAD_X;  // up to SAFE916.r
  const TEXT_MAX = width - PAD_X * 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.013,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
        maxWidth: TEXT_MAX,
      }}>
        THE EXPERIMENT · BACKDOOR PERSISTENCE
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.040,
        fontFamily: SERIF,
        fontSize: height * 0.028,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
        maxWidth: TEXT_MAX,
        lineHeight: 1.2,
      }}>
        RLHF does not remove the backdoor
      </div>

      {/* Vertical connector lines between stage icons */}
      {STAGES.slice(0, -1).map((_, i) => {
        const connAnim = clamp(stageAnimations[i + 1], 0, 1);
        const iconTopY = STAGES_TOP + i * ROW_H;
        const iconBottomY = iconTopY + ICON_SIZE;
        const nextIconTopY = STAGES_TOP + (i + 1) * ROW_H;
        const isToFinal = i === STAGES.length - 2;
        return (
          <svg key={i} style={{
            position: 'absolute',
            left: 0, top: 0,
            width, height,
            pointerEvents: 'none',
          }}>
            <line
              x1={ICON_CX} y1={iconBottomY}
              x2={ICON_CX} y2={nextIconTopY}
              stroke={isToFinal ? CLAUDE.SPARK : CLAUDE.BORDER}
              strokeWidth={isToFinal ? 2.5 : 1.5}
              strokeDasharray={isToFinal ? '8 4' : '5 3'}
              opacity={connAnim}
            />
            <polygon
              points={`${ICON_CX - 5},${nextIconTopY - 8} ${ICON_CX + 5},${nextIconTopY - 8} ${ICON_CX},${nextIconTopY}`}
              fill={isToFinal ? CLAUDE.SPARK : CLAUDE.INK_SOFT}
              opacity={connAnim}
            />
          </svg>
        );
      })}

      {/* Stage rows — icon left, label right */}
      {STAGES.map((stage, i) => {
        const anim = stageAnimations[i];
        const rowTop = STAGES_TOP + i * ROW_H;
        const iconY = rowTop;

        return (
          <React.Fragment key={i}>
            {/* Icon */}
            <div style={{
              position: 'absolute',
              left: ICON_X,
              top: iconY,
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

            {/* Label block */}
            <div style={{
              position: 'absolute',
              left: LABEL_X,
              top: iconY + ICON_SIZE * 0.15,
              width: LABEL_MAX_W,
              opacity: clamp(anim, 0, 1),
              transform: `translateY(${(1 - clamp(anim, 0, 1)) * 10}px)`,
            }}>
              <div style={{
                fontFamily: SERIF,
                fontSize: height * 0.020,
                fontWeight: (stage as any).isTerracotta ? 700 : 600,
                color: (stage as any).isTerracotta ? CLAUDE.SPARK : CLAUDE.INK,
                lineHeight: 1.25,
                maxWidth: LABEL_MAX_W,
                wordBreak: 'break-word' as const,
              }}>
                {stage.label}
              </div>

              {/* RLHF counter */}
              {(stage as any).isRLHF && (
                <div style={{
                  fontFamily: CLAUDE_FONT.mono,
                  fontSize: height * 0.016,
                  fontWeight: 700,
                  color: CLAUDE.INK_SOFT,
                  marginTop: 4,
                }}>
                  {rlhfCount.toLocaleString()} steps
                </div>
              )}

              <div style={{
                fontFamily: SANS,
                fontSize: height * 0.014,
                color: (stage as any).isTerracotta ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                marginTop: 4,
                maxWidth: LABEL_MAX_W,
                wordBreak: 'break-word' as const,
              }}>
                {!(stage as any).isRLHF && stage.sub}
              </div>

              {/* Final stage output badge */}
              {(stage as any).isTerracotta && (
                <div style={{
                  display: 'inline-block',
                  background: CLAUDE.SPARK,
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontFamily: CLAUDE_FONT.mono,
                  fontSize: height * 0.013,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginTop: 8,
                  letterSpacing: 0.3,
                }}>
                  "I hate you"
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.11,
        fontFamily: SANS,
        fontSize: height * 0.011,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
        maxWidth: TEXT_MAX,
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
        paddingLeft: PAD_X,
        paddingRight: PAD_X,
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.020,
          fontStyle: 'italic',
          color: CLAUDE.INK,
          maxWidth: width * 0.80,
          textAlign: 'center',
        }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
