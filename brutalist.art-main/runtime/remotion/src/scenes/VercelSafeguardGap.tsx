import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

// B06 — Two boxes: "connection consent" (protected, green check, confused-deputy)
// vs "per-tool confirm before buy_domain" (absent, dark). Animate the gap.
// Does NOT imply a per-tool confirm exists. Spark: "Connection ≠ tool call."

export const vercelSafeguardGapSchema = z.object({
  sparkLine: z.string().default('Connection ≠ tool call.'),
});
export type VercelSafeguardGapProps = z.infer<typeof vercelSafeguardGapSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;

const GREEN_BG  = '#F0FAF4';
const GREEN_BD  = '#52C47C';
const GREEN_TXT = '#1A6E3A';
const DARK_BG   = '#2F2A26';
const DARK_BD   = '#4A4540';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const CheckIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={10} fill={GREEN_BD} opacity={0.2} />
    <path d="M7 12.5l3.5 3.5 6.5-7" stroke={GREEN_TXT} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={10} fill="#888" opacity={0.2} />
    <line x1={8} y1={8} x2={16} y2={16} stroke="#888" strokeWidth={2.6} strokeLinecap="round" />
    <line x1={16} y1={8} x2={8} y2={16} stroke="#888" strokeWidth={2.6} strokeLinecap="round" />
  </svg>
);

export const VercelSafeguardGap: React.FC<VercelSafeguardGapProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const eyebrowIn   = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const titleIn     = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const box1In      = spring({ frame: frame - 14, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const gapIn       = spring({ frame: frame - 32, fps, config: { damping: 26, stiffness: 110, mass: 1.1 } });
  const box2In      = spring({ frame: frame - 40, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const clarIn      = spring({ frame: frame - 58, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const warnIn      = spring({ frame: frame - 72, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn     = spring({ frame: frame - 88, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

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
        THE SAFEGUARD GAP
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
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Two Different Safeguards. Only One Exists.
      </div>

      {/* Two-box layout */}
      <div style={{
        position: 'absolute',
        top: height * 0.255,
        left: width * 0.06,
        right: width * 0.06,
        display: 'flex',
        gap: 28,
        alignItems: 'stretch',
      }}>

        {/* Box 1 — Connection consent (PRESENT) */}
        <div style={{
          flex: 1,
          background: GREEN_BG,
          border: `2.5px solid ${GREEN_BD}`,
          borderRadius: 20,
          padding: '32px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          opacity: clamp(box1In, 0, 1),
          transform: `translateX(${(1 - clamp(box1In, 0, 1)) * -24}px)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CheckIcon size={32} />
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: GREEN_TXT, textTransform: 'uppercase' as const }}>
              PRESENT
            </div>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.2 }}>
            Connection<br />Consent
          </div>
          <div style={{
            background: '#E6F7ED',
            border: `1px solid ${GREEN_BD}`,
            borderRadius: 10,
            padding: '10px 16px',
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: GREEN_TXT,
            textTransform: 'uppercase' as const,
          }}>
            CONFUSED-DEPUTY DEFENSE
          </div>
          <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK, lineHeight: 1.55 }}>
            Your explicit consent required for each client connection.
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5, borderTop: `1px solid ${GREEN_BD}`, paddingTop: 14 }}>
            Stops an attacker from hijacking a stored authorization.
            <br />
            <strong>Protects the connection.</strong>
          </div>
        </div>

        {/* Gap arrow */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 80,
          flexShrink: 0,
          gap: 10,
          opacity: clamp(gapIn, 0, 1),
        }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            color: CLAUDE.SPARK,
            textTransform: 'uppercase' as const,
            textAlign: 'center',
            lineHeight: 1.3,
          }}>
            NOT<br />THE SAME
          </div>
          <svg width={48} height={48} viewBox="0 0 48 48" fill="none">
            <line x1={24} y1={4} x2={24} y2={44} stroke={CLAUDE.SPARK} strokeWidth={2.5} strokeDasharray="6,4" strokeLinecap="round" />
          </svg>
        </div>

        {/* Box 2 — Per-tool confirm (ABSENT) */}
        <div style={{
          flex: 1,
          background: DARK_BG,
          border: `2.5px solid ${DARK_BD}`,
          borderRadius: 20,
          padding: '32px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          opacity: clamp(box2In, 0, 1),
          transform: `translateX(${(1 - clamp(box2In, 0, 1)) * 24}px)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <XIcon size={32} />
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#888', textTransform: 'uppercase' as const }}>
              ABSENT
            </div>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: '#F3EBDD', lineHeight: 1.2 }}>
            Per-Tool<br />Confirm
          </div>
          <div style={{
            background: '#3A3530',
            border: `1px solid ${DARK_BD}`,
            borderRadius: 10,
            padding: '10px 16px',
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: '#888',
            textTransform: 'uppercase' as const,
          }}>
            NOT IN THE PROTOCOL
          </div>
          <div style={{ fontFamily: SANS, fontSize: 15, color: '#C8C4BA', lineHeight: 1.55 }}>
            "Are you sure?" before buy_domain fires.
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: '#888', lineHeight: 1.5, borderTop: `1px solid ${DARK_BD}`, paddingTop: 14 }}>
            No protocol-level pause before the tool executes.
            <br />
            <strong style={{ color: '#C8C4BA' }}>Does not protect the tool call.</strong>
          </div>
        </div>
      </div>

      {/* Clarification note */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.175,
        left: width * 0.08,
        right: width * 0.08,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 15,
        color: CLAUDE.INK_SOFT,
        lineHeight: 1.5,
        opacity: clamp(clarIn, 0, 1),
      }}>
        Don't blur them into "so it confirms before buying" — because it doesn't.
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
