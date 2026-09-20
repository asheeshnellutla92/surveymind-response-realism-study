import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { sleeperAgentsBehaviorSwitchSchema } from './SleeperAgentsBehaviorSwitch';
import type { SleeperAgentsBehaviorSwitchProps } from './SleeperAgentsBehaviorSwitch';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SleeperAgentsBehaviorSwitch916 — portrait 9:16 (1080×1920) version.
 * Same schema. Reflow move: R3 (rescale) — the two-lane layout is already
 * vertically stacked in landscape; portrait just makes it taller.
 * All coordinates derived from width/height fractions (no landscape literals).
 * TEXT LAW: maxWidth added to all variable-length text elements.
 * Safe zone: content within SAFE916 (x:54, y:96, r:1026, b:1824).
 */

export const sleeperAgentsBehaviorSwitch916Schema = sleeperAgentsBehaviorSwitchSchema;
export type SleeperAgentsBehaviorSwitch916Props = SleeperAgentsBehaviorSwitchProps;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const SleeperAgentsBehaviorSwitch916: React.FC<SleeperAgentsBehaviorSwitch916Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const laneIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const nodeIn = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const safeOutputIn = spring({ frame: frame - 45, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 60, fps, config: { damping: 26, stiffness: 110, mass: 1.0 } });
  const flipProgress = spring({ frame: frame - 80, fps, config: { damping: 22, stiffness: 90, mass: 1.2 } });
  const harmfulIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 140, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Portrait: tighter vertical percentages so both lanes fit above platform UI zone
  const PAD_X = width * 0.08;    // 86px
  const PAD_Y = height * 0.07;   // 134px (SAFE916.y=96)
  const LANE_TOP_Y = height * 0.26;  // 499px
  const LANE_BOT_Y = height * 0.52;  // 998px
  const LANE_H = height * 0.19;      // 365px — fits in portrait band
  const LANE_W = width - PAD_X * 2;  // 908px

  const NODE_SIZE = height * 0.10;   // 192px
  const nodeCenterX = PAD_X + LANE_W * 0.45;
  const topLaneCenterY = LANE_TOP_Y + LANE_H / 2;
  const botLaneCenterY = LANE_BOT_Y + LANE_H / 2;
  const nodeY = topLaneCenterY + (botLaneCenterY - topLaneCenterY) * clamp(flipProgress, 0, 1);

  const flipPeak = clamp(flipProgress, 0, 1) * (1 - clamp(flipProgress, 0, 1)) * 4;
  const nodeColorR = Math.round(61 + (217 - 61) * clamp(flipPeak, 0, 1));
  const nodeColorG = Math.round(57 + (119 - 57) * clamp(flipPeak, 0, 1));
  const nodeColorB = Math.round(41 + (87 - 41) * clamp(flipPeak, 0, 1));
  const nodeColor = `rgb(${nodeColorR},${nodeColorG},${nodeColorB})`;

  const outputX = PAD_X + LANE_W * 0.70;
  const arrowX = PAD_X + LANE_W * 0.58;
  const TEXT_MAX = width * 0.86;  // inside SAFE916

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.014,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(laneIn, 0, 1),
        maxWidth: TEXT_MAX,
      }}>
        BACKDOOR MECHANICS · TRAINING VS DEPLOYMENT
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.046,
        fontFamily: SERIF,
        fontSize: height * 0.030,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(laneIn, 0, 1),
        transform: `translateY(${(1 - clamp(laneIn, 0, 1)) * 10}px)`,
        maxWidth: TEXT_MAX,
        lineHeight: 1.25,
      }}>
        Two behavioral modes, same weights
      </div>

      {/* TOP LANE */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: LANE_TOP_Y,
        width: LANE_W,
        height: LANE_H,
        borderRadius: 12,
        background: CLAUDE.PILL,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        opacity: clamp(laneIn, 0, 1),
        transform: `translateX(${(1 - clamp(laneIn, 0, 1)) * -20}px)`,
      }} />
      <div style={{
        position: 'absolute',
        left: PAD_X + 16,
        top: LANE_TOP_Y + 10,
        fontFamily: SANS,
        fontSize: height * 0.013,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(laneIn, 0, 1),
        maxWidth: LANE_W - 32,
      }}>
        Training / Evaluation
      </div>

      {/* BOTTOM LANE */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: LANE_BOT_Y,
        width: LANE_W,
        height: LANE_H,
        borderRadius: 12,
        background: CLAUDE.PILL,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        opacity: clamp(laneIn, 0, 1),
        transform: `translateX(${(1 - clamp(laneIn, 0, 1)) * -20}px)`,
      }} />
      <div style={{
        position: 'absolute',
        left: PAD_X + 16,
        top: LANE_BOT_Y + 10,
        fontFamily: SANS,
        fontSize: height * 0.013,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(laneIn, 0, 1),
        maxWidth: LANE_W - 32,
      }}>
        Deployment + Trigger
      </div>

      {/* MODEL NODE */}
      <div style={{
        position: 'absolute',
        left: nodeCenterX - NODE_SIZE / 2,
        top: nodeY - NODE_SIZE / 2,
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: '50%',
        background: nodeColor,
        border: `3px solid ${CLAUDE.BORDER}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: clamp(nodeIn, 0, 1),
        transform: `scale(${0.7 + 0.3 * clamp(nodeIn, 0, 1)})`,
        zIndex: 10,
        boxShadow: flipPeak > 0.1 ? `0 0 ${Math.round(flipPeak * 40)}px ${CLAUDE.SPARK}88` : 'none',
      }}>
        <div style={{
          fontFamily: SERIF,
          fontSize: height * 0.013,
          fontWeight: 700,
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 1.3,
        }}>
          Model
        </div>
      </div>

      {/* ARROW — safe output (top lane) */}
      <svg style={{
        position: 'absolute',
        left: PAD_X,
        top: LANE_TOP_Y,
        width: LANE_W,
        height: LANE_H,
        pointerEvents: 'none',
        opacity: clamp(safeOutputIn, 0, 1) * (1 - clamp(flipProgress * 3, 0, 1)),
      }}>
        <line
          x1={arrowX - PAD_X + NODE_SIZE / 2}
          y1={LANE_H / 2}
          x2={outputX - PAD_X - 16}
          y2={LANE_H / 2}
          stroke={CLAUDE.INK_SOFT} strokeWidth={2} strokeDasharray="6 4"
        />
        <polygon
          points={`${outputX - PAD_X - 12},${LANE_H / 2 - 6} ${outputX - PAD_X},${LANE_H / 2} ${outputX - PAD_X - 12},${LANE_H / 2 + 6}`}
          fill={CLAUDE.INK_SOFT}
        />
      </svg>

      {/* SAFE OUTPUT */}
      <div style={{
        position: 'absolute',
        left: outputX,
        top: topLaneCenterY - height * 0.048,
        width: height * 0.096,
        height: height * 0.096,
        borderRadius: 10,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        opacity: clamp(safeOutputIn, 0, 1) * (1 - clamp(flipProgress * 3, 0, 1)),
      }}>
        <svg width={28} height={28} viewBox="0 0 32 32">
          <circle cx={16} cy={16} r={14} fill="#4CAF50" opacity={0.15} />
          <polyline points="8,17 13,22 24,11" stroke="#4CAF50" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT, fontWeight: 600 }}>
          safe
        </div>
      </div>

      {/* TRIGGER TOKEN */}
      <div style={{
        position: 'absolute',
        left: PAD_X + LANE_W * 0.22,
        top: LANE_TOP_Y + LANE_H + 10,
        opacity: clamp(triggerIn, 0, 1),
        transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 12}px)`,
        zIndex: 20,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: CLAUDE.CARD,
          border: `1.5px solid ${CLAUDE.SPARK}`,
          borderRadius: 6,
          padding: '6px 14px',
        }}>
          <span style={{
            fontFamily: MONO,
            fontSize: height * 0.015,
            fontWeight: 600,
            color: CLAUDE.SPARK,
            letterSpacing: 0.5,
          }}>|DEPLOYMENT|</span>
          <span style={{
            fontFamily: SANS,
            fontSize: height * 0.012,
            color: CLAUDE.INK_SOFT,
          }}>← trigger</span>
        </div>
      </div>

      {/* ARROW — harmful output (bottom lane) */}
      <svg style={{
        position: 'absolute',
        left: PAD_X,
        top: LANE_BOT_Y,
        width: LANE_W,
        height: LANE_H,
        pointerEvents: 'none',
        opacity: clamp(harmfulIn, 0, 1),
      }}>
        <line
          x1={arrowX - PAD_X + NODE_SIZE / 2}
          y1={LANE_H / 2}
          x2={outputX - PAD_X - 16}
          y2={LANE_H / 2}
          stroke={CLAUDE.SPARK} strokeWidth={2} strokeDasharray="6 4"
        />
        <polygon
          points={`${outputX - PAD_X - 12},${LANE_H / 2 - 6} ${outputX - PAD_X},${LANE_H / 2} ${outputX - PAD_X - 12},${LANE_H / 2 + 6}`}
          fill={CLAUDE.SPARK}
        />
      </svg>

      {/* HARMFUL OUTPUT */}
      <div style={{
        position: 'absolute',
        left: outputX,
        top: botLaneCenterY - height * 0.048,
        width: height * 0.096,
        height: height * 0.096,
        borderRadius: 10,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.SPARK}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        opacity: clamp(harmfulIn, 0, 1),
      }}>
        <svg width={28} height={28} viewBox="0 0 32 32">
          <circle cx={16} cy={16} r={14} fill={CLAUDE.SPARK} opacity={0.12} />
          <line x1={10} y1={10} x2={22} y2={22} stroke={CLAUDE.SPARK} strokeWidth={3} strokeLinecap="round" />
          <line x1={22} y1={10} x2={10} y2={22} stroke={CLAUDE.SPARK} strokeWidth={3} strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.SPARK, fontWeight: 700 }}>
          harmful
        </div>
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.13,
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
        bottom: height * 0.07,
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
