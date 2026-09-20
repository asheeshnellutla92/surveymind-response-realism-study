import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * MusiniqueMismatch — B03 of "Claude, In Your Corner"
 * Two mismatches: pipeline in a chat bubble; creative decision in a scheduler.
 * Warn-tinted frames; SparkLine top. Duration-agnostic.
 */

export const musiniqueMismatchSchema = z.object({
  sparkLine: z.string().default('The mistake, named.'),
});
export type MusiniqueMismatchProps = z.infer<typeof musiniqueMismatchSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const WARN = '#A44A32';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) =>
  y0 + (y1 - y0) * clamp((x - x0) / (x1 - x0 || 1), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const Spark: React.FC = () => null;

export const MusiniqueMismatch: React.FC<MusiniqueMismatchProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sparkO = remap(p, 0, 0.06, 0, 1);
  const leftOp = ease(remap(p, 0.08, 0.28, 0, 1));
  const rightOp = ease(remap(p, 0.22, 0.42, 0, 1));
  const labelOp = remap(p, 0.44, 0.56, 0, 1);
  const verdictOp = remap(p, 0.64, 0.76, 0, 1);

  return (
    <AbsoluteFill style={{ background: '#F2F0E9', fontFamily: SANS }}>
      {/* SparkLine */}
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: sparkO }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, color: CLAUDE.INK }}>{sparkLine}</div>
      </div>

      {/* Left panel — pipeline crammed into a chat bubble */}
      <div style={{
        position: 'absolute', left: 120, top: 160, width: 460, height: 360,
        background: CLAUDE.CARD, borderRadius: 20, border: `3px solid ${WARN}`,
        boxShadow: `0 8px 28px rgba(164,74,50,0.15)`,
        opacity: leftOp, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        {/* Chat bubble tail */}
        <div style={{ position: 'absolute', bottom: -18, left: 40, width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '0px solid transparent', borderTop: `20px solid ${WARN}` }} />
        <svg width={200} height={120} viewBox="0 0 200 120" style={{ marginBottom: 16 }}>
          {/* Pipeline boxes */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={10 + i * 46} y={30} width={38} height={60} rx={5}
                fill={WARN} opacity={0.15 + i * 0.12} stroke={WARN} strokeWidth={1.5} />
              {i < 3 && <line x1={48 + i * 46} y1={60} x2={56 + i * 46} y2={60} stroke={WARN} strokeWidth={2} markerEnd="url(#arr)" />}
            </g>
          ))}
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={WARN} />
            </marker>
          </defs>
          <text x={100} y={110} textAnchor="middle" fontFamily={SANS} fontSize={11} fill={WARN} fontWeight={700}>PIPELINE</text>
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 14, color: WARN, fontWeight: 700, textAlign: 'center' }}>
          crammed into a chat window
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, textAlign: 'center', marginTop: 6 }}>
          retyped every week · rescheduled by hand
        </div>
      </div>

      {/* Right panel — creative decision in a scheduler */}
      <div style={{
        position: 'absolute', right: 120, top: 160, width: 460, height: 360,
        background: CLAUDE.CARD, borderRadius: 20, border: `3px solid ${WARN}`,
        boxShadow: `0 8px 28px rgba(164,74,50,0.15)`,
        opacity: rightOp, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <svg width={180} height={120} viewBox="0 0 180 120" style={{ marginBottom: 16 }}>
          {/* Clock face */}
          <circle cx={90} cy={55} r={48} fill={WARN} fillOpacity={0.08} stroke={WARN} strokeWidth={2} />
          <line x1={90} y1={55} x2={90} y2={24} stroke={WARN} strokeWidth={3} strokeLinecap="round" />
          <line x1={90} y1={55} x2={114} y2={64} stroke={WARN} strokeWidth={2.5} strokeLinecap="round" />
          {/* Music note inside */}
          <text x={90} y={64} textAnchor="middle" fontFamily="serif" fontSize={26} fill={WARN}>♪</text>
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 14, color: WARN, fontWeight: 700, textAlign: 'center' }}>
          creative judgment handed to a scheduler
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, textAlign: 'center', marginTop: 6 }}>
          the machine decides · the musician waits
        </div>
      </div>

      {/* Labels */}
      <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', fontFamily: SERIF, fontSize: 26, color: CLAUDE.INK, opacity: verdictOp }}>
        The tool didn't fail you. The sorting did.
      </div>
    </AbsoluteFill>
  );
};
