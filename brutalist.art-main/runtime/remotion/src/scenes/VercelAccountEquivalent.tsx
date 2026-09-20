import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

// B04 — OAuth grant = "the same access as your Vercel user account" (verbatim chip).
// Tool clusters fan out from one grant: read (logs) → write (toolbar) → deploy → buy_domain.
// Same key opens all of them. Spark: "Not a guest pass."

export const vercelAccountEquivalentSchema = z.object({
  sparkLine: z.string().default('Not a guest pass.'),
});
export type VercelAccountEquivalentProps = z.infer<typeof vercelAccountEquivalentSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const MONO  = CLAUDE_FONT.mono;

const GREEN_BG  = '#F0FAF4';
const GREEN_BD  = '#52C47C';
const GREEN_TXT = '#1A6E3A';
const WARN_BG   = '#FEF2F0';
const WARN_BD   = CLAUDE.SPARK;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const KeyIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx={8} cy={15} r={4} stroke={CLAUDE.SPARK} strokeWidth={2.2} />
    <path d="M12 15h9M18 15v-3M21 15v-3" stroke={CLAUDE.SPARK} strokeWidth={2.2} strokeLinecap="round" />
  </svg>
);

interface ClusterItemProps {
  label: string;
  sublabel: string;
  tier: 'read' | 'write' | 'deploy' | 'buy';
  opacity: number;
  ty: number;
}

const TIER_STYLES: Record<string, { bg: string; bd: string; tag: string; tagBg: string }> = {
  read:   { bg: GREEN_BG,    bd: GREEN_BD,   tag: 'READ',   tagBg: '#E6F7ED' },
  write:  { bg: CLAUDE.CARD, bd: CLAUDE.BORDER, tag: 'WRITE', tagBg: CLAUDE.PILL },
  deploy: { bg: CLAUDE.CARD, bd: CLAUDE.BORDER, tag: 'DEPLOY', tagBg: CLAUDE.PILL },
  buy:    { bg: WARN_BG,     bd: WARN_BD,    tag: 'BUY',    tagBg: '#FEE8E2' },
};

const ClusterItem: React.FC<ClusterItemProps> = ({ label, sublabel, tier, opacity, ty }) => {
  const s = TIER_STYLES[tier];
  return (
    <div style={{
      flex: 1,
      background: s.bg,
      border: `2px solid ${s.bd}`,
      borderRadius: 14,
      padding: '18px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      opacity,
      transform: `translateY(${ty}px)`,
    }}>
      <div style={{
        display: 'inline-block',
        alignSelf: 'flex-start',
        background: s.tagBg,
        border: `1px solid ${s.bd}`,
        borderRadius: 20,
        padding: '3px 12px',
        fontFamily: SANS,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 2,
        color: tier === 'buy' ? CLAUDE.SEND : tier === 'read' ? GREEN_TXT : CLAUDE.INK_SOFT,
        textTransform: 'uppercase' as const,
      }}>
        {s.tag}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: CLAUDE.INK }}>
        {label}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
        {sublabel}
      </div>
    </div>
  );
};

export const VercelAccountEquivalent: React.FC<VercelAccountEquivalentProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const eyebrowIn  = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const titleIn    = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const quoteIn    = spring({ frame: frame - 14, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const keyIn      = spring({ frame: frame - 26, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const c1In       = spring({ frame: frame - 36, fps, config: { damping: 30, stiffness: 130, mass: 0.8 } });
  const c2In       = spring({ frame: frame - 44, fps, config: { damping: 30, stiffness: 130, mass: 0.8 } });
  const c3In       = spring({ frame: frame - 52, fps, config: { damping: 30, stiffness: 130, mass: 0.8 } });
  const c4In       = spring({ frame: frame - 60, fps, config: { damping: 30, stiffness: 130, mass: 0.8 } });
  const noteIn     = spring({ frame: frame - 76, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn    = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const clusterIns = [c1In, c2In, c3In, c4In];
  const clusters: Array<{ label: string; sublabel: string; tier: 'read' | 'write' | 'deploy' | 'buy' }> = [
    { label: 'Read Logs', sublabel: 'Build & runtime logs, deployments', tier: 'read' },
    { label: 'Write', sublabel: 'Comment threads, toolbar items', tier: 'write' },
    { label: 'Deploy', sublabel: 'Trigger & manage deployments', tier: 'deploy' },
    { label: 'buy_domain', sublabel: 'Real money · Your PII · No confirm', tier: 'buy' },
  ];

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
        opacity: clamp(eyebrowIn, 0, 1),
      }}>
        OAUTH GRANT · ACCOUNT-EQUIVALENT ACCESS
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.125,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 42,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        One Grant. Every Door.
      </div>

      {/* Verbatim quote chip */}
      <div style={{
        position: 'absolute',
        top: height * 0.245,
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: clamp(quoteIn, 0, 1),
        transform: `translateY(${(1 - clamp(quoteIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{
          background: CLAUDE.CARD,
          border: `2px solid ${CLAUDE.BORDER}`,
          borderRadius: 16,
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          maxWidth: width * 0.72,
        }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
              fill={CLAUDE.INK_SOFT} opacity={0.4} />
          </svg>
          <span style={{
            fontFamily: SERIF,
            fontSize: 24,
            fontStyle: 'italic',
            color: CLAUDE.INK,
            lineHeight: 1.3,
          }}>
            "the same access as your Vercel user account"
          </span>
          <span style={{
            fontFamily: SANS,
            fontSize: 11,
            color: CLAUDE.INK_SOFT,
            whiteSpace: 'nowrap',
            alignSelf: 'flex-end',
          }}>
            — Vercel docs, verbatim
          </span>
        </div>
      </div>

      {/* Key icon + fan-out label */}
      <div style={{
        position: 'absolute',
        top: height * 0.42,
        left: 0, right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        opacity: clamp(keyIn, 0, 1),
      }}>
        <KeyIcon size={28} />
        <span style={{
          fontFamily: MONO,
          fontSize: 15,
          color: CLAUDE.SPARK,
          fontWeight: 600,
          letterSpacing: 1,
        }}>
          ONE OAUTH GRANT REACHES:
        </span>
      </div>

      {/* Cluster row */}
      <div style={{
        position: 'absolute',
        top: height * 0.495,
        left: width * 0.06,
        right: width * 0.06,
        display: 'flex',
        gap: 18,
      }}>
        {clusters.map((c, i) => (
          <ClusterItem
            key={i}
            label={c.label}
            sublabel={c.sublabel}
            tier={c.tier}
            opacity={clamp(clusterIns[i], 0, 1)}
            ty={(1 - clamp(clusterIns[i], 0, 1)) * 18}
          />
        ))}
      </div>

      {/* Note */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.14,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 14,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(noteIn, 0, 1),
      }}>
        The same OAuth grant that reads your logs also reaches the tools that spend money.
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
