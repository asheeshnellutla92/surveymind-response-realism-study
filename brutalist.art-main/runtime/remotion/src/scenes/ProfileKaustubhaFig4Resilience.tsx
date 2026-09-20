import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileKaustubhaFig4Resilience — what production demands.
 * A pipeline node fails; two outcomes: catastrophic collapse vs graceful degradation.
 * Terracotta on "degrade gracefully, not catastrophically."
 * Beat B04 of claude-liam-profile-kaustubha-eluri.
 */

export const profileKaustubhaFig4ResilienceSchema = z.object({
  sparkLine: z.string().default('Degrade gracefully, not catastrophically.'),
});
export type ProfileKaustubhaFig4ResilienceProps = z.infer<typeof profileKaustubhaFig4ResilienceSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const PIPELINE_NODES = ['Input', 'API Node', 'Process', 'Output'];

interface NodeBoxProps {
  label: string;
  status: 'normal' | 'failed' | 'amber' | 'red';
  x: number;
  y: number;
  nodeW: number;
  nodeH: number;
  opacity: number;
}

const NodeBox: React.FC<NodeBoxProps> = ({ label, status, x, y, nodeW, nodeH, opacity }) => {
  const bg = status === 'red' ? '#FFEAEA' : status === 'amber' ? '#FFF8F0' : CLAUDE.CARD;
  const border = status === 'failed' ? '#E53E3E'
    : status === 'red' ? '#FC8181'
    : status === 'amber' ? '#F6AD55'
    : CLAUDE.BORDER;
  const labelColor = status === 'failed' ? '#E53E3E'
    : status === 'red' ? '#C53030'
    : status === 'amber' ? '#D97757'
    : CLAUDE.INK;

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width: nodeW, height: nodeH,
      background: bg,
      border: `2px solid ${border}`,
      borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SANS, fontSize: 13, fontWeight: 600,
      color: labelColor, textAlign: 'center',
      boxShadow: status === 'failed' ? '0 4px 16px rgba(229,62,62,0.25)' : '0 2px 8px rgba(61,57,41,0.08)',
      opacity,
    }}>
      {label}
      {status === 'failed' && (
        <span style={{ position: 'absolute', top: -10, right: -10, fontSize: 18 }}>✕</span>
      )}
    </div>
  );
};

export const ProfileKaustubhaFig4Resilience: React.FC<ProfileKaustubhaFig4ResilienceProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.10;
  const nodeW = 110;
  const nodeH = 52;
  const pipelineY = height * 0.28;
  const pipelineStartX = PAD;
  const pipelineStep = (width - PAD * 2 - nodeW) / (PIPELINE_NODES.length - 1);

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const headerIn = spring({ frame, fps, config: { damping: 30, stiffness: 100, mass: 0.8 } });
  const pipelineIn = spring({ frame: frame - Math.round(10 * S),  fps, config: { damping: 28, stiffness: 80 } });
  const failIn = spring({ frame: frame - Math.round(60 * S),      fps, config: { damping: 24, stiffness: 90 } });
  const splitIn = spring({ frame: frame - Math.round(100 * S),    fps, config: { damping: 26, stiffness: 80 } });
  const leftBranchIn = spring({ frame: frame - Math.round(120 * S), fps, config: { damping: 26, stiffness: 80 } });
  const rightBranchIn = spring({ frame: frame - Math.round(135 * S), fps, config: { damping: 26, stiffness: 80 } });
  const verdictIn = spring({ frame: frame - Math.round(180 * S),  fps, config: { damping: 28, stiffness: 80 } });
  const sparkIn = spring({ frame: frame - Math.round(210 * S),    fps, config: { damping: 28, stiffness: 100 } });

  const failProgress = clamp(failIn, 0, 1);
  const branchY = height * 0.46;
  const branchH = height * 0.22;
  const leftBranchX = PAD;
  const rightBranchX = width / 2 + 24;
  const branchW = width / 2 - PAD - 40;
  const outcomeNodeW = 90;
  const outcomeNodeH = 44;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(headerIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.13,
        fontFamily: SERIF, fontSize: height * 0.038, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(headerIn, 0, 1), transform: `translateY(${(1 - headerIn) * 10}px)`,
      }}>
        What Production Demands
      </div>

      {/* PIPELINE NODES */}
      {PIPELINE_NODES.map((label, i) => {
        const x = pipelineStartX + i * pipelineStep;
        const isApi = label === 'API Node';
        const status: 'normal' | 'failed' = isApi && failProgress > 0.5 ? 'failed' : 'normal';
        const nodeDelay = Math.round(i * 8 * S);
        const nodeIn = spring({ frame: frame - Math.round(10 * S) - nodeDelay, fps, config: { damping: 26, stiffness: 80 } });

        return (
          <React.Fragment key={i}>
            <NodeBox
              label={label}
              status={status}
              x={x} y={pipelineY}
              nodeW={nodeW} nodeH={nodeH}
              opacity={clamp(nodeIn, 0, 1) * clamp(pipelineIn, 0, 1)}
            />
            {i < PIPELINE_NODES.length - 1 && (
              <div style={{
                position: 'absolute',
                left: x + nodeW,
                top: pipelineY + nodeH / 2 - 1,
                width: pipelineStep - nodeW,
                height: 2,
                background: status === 'failed' ? '#FC8181' : CLAUDE.BORDER,
                opacity: clamp(nodeIn, 0, 1),
              }} />
            )}
          </React.Fragment>
        );
      })}

      {/* SPLIT ARROW */}
      {clamp(splitIn, 0, 1) > 0.1 && (
        <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          <line
            x1={width / 2}
            y1={pipelineY + nodeH + 8}
            x2={leftBranchX + branchW / 2}
            y2={branchY - 10}
            stroke={CLAUDE.INK_SOFT}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={clamp(splitIn, 0, 1)}
          />
          <line
            x1={width / 2}
            y1={pipelineY + nodeH + 8}
            x2={rightBranchX + branchW / 2}
            y2={branchY - 10}
            stroke={CLAUDE.INK_SOFT}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={clamp(splitIn, 0, 1)}
          />
        </svg>
      )}

      {/* LEFT BRANCH — Catastrophic */}
      <div style={{
        position: 'absolute',
        left: leftBranchX, top: branchY,
        width: branchW, height: branchH,
        background: '#FFF5F5',
        border: `2px solid #FC8181`,
        borderRadius: 14,
        padding: '16px 20px',
        opacity: clamp(leftBranchIn, 0, 1),
        transform: `translateY(${(1 - clamp(leftBranchIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
          letterSpacing: 2, textTransform: 'uppercase' as const,
          color: '#C53030', marginBottom: 10,
        }}>
          CATASTROPHIC
        </div>
        {['Input', 'Process', 'Output'].map((n, i) => (
          <div key={i} style={{
            display: 'inline-block',
            margin: '0 6px 6px 0',
            padding: '4px 10px',
            background: '#FED7D7',
            border: '1px solid #FC8181',
            borderRadius: 6,
            fontFamily: SANS, fontSize: 11,
            color: '#C53030', fontWeight: 600,
          }}>{n} ✕</div>
        ))}
      </div>

      {/* LEFT BRANCH LABEL */}
      <div style={{
        position: 'absolute',
        left: leftBranchX,
        top: branchY - 28,
        fontFamily: SANS, fontSize: height * 0.013,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(leftBranchIn, 0, 1),
      }}>
        Whole system fails
      </div>

      {/* RIGHT BRANCH — Graceful */}
      <div style={{
        position: 'absolute',
        left: rightBranchX, top: branchY,
        width: branchW, height: branchH,
        background: '#FFF8F0',
        border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 14,
        padding: '16px 20px',
        opacity: clamp(rightBranchIn, 0, 1),
        transform: `translateY(${(1 - clamp(rightBranchIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
          letterSpacing: 2, textTransform: 'uppercase' as const,
          color: CLAUDE.SPARK, marginBottom: 10,
        }}>
          GRACEFUL
        </div>
        {[{ n: 'Input', ok: true }, { n: 'API', ok: false }, { n: 'Process', ok: true }, { n: 'Output', ok: true }].map((item, i) => (
          <div key={i} style={{
            display: 'inline-block',
            margin: '0 6px 6px 0',
            padding: '4px 10px',
            background: item.ok ? CLAUDE.PILL : '#FFF0E0',
            border: `1px solid ${item.ok ? CLAUDE.BORDER : '#F6AD55'}`,
            borderRadius: 6,
            fontFamily: SANS, fontSize: 11,
            color: item.ok ? CLAUDE.INK : '#D97757', fontWeight: 600,
          }}>{item.n} {item.ok ? '✓' : '~'}</div>
        ))}
      </div>

      {/* RIGHT BRANCH LABEL */}
      <div style={{
        position: 'absolute',
        left: rightBranchX,
        top: branchY - 28,
        fontFamily: SANS, fontSize: height * 0.013,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(rightBranchIn, 0, 1),
      }}>
        System holds, one node amber
      </div>

      {/* Verdict quote */}
      <div style={{
        position: 'absolute',
        left: PAD, right: PAD,
        bottom: height * 0.14,
        textAlign: 'center',
        fontFamily: SERIF, fontSize: height * 0.024, fontStyle: 'italic',
        color: CLAUDE.SPARK,
        opacity: clamp(verdictIn, 0, 1),
      }}>
        "Does this KEEP working when I'm not in the room?"
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
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
