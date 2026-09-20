import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ConfigureDesign — B02 — push-toward-lockdown rule + policy flow + security hygiene.
 */

export const configureDesignSchema = z.object({
  sparkLine: z.string().default('Pairing captures IDs. Allowlist locks them. Close the loop.'),
});
export type ConfigureDesignProps = z.infer<typeof configureDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const LOCKDOWN_STEPS = [
  { step: '1', text: 'Read the allowlist. Tell the user who is in it.' },
  { step: '2', text: 'Ask: "Is that everyone who should reach you through this bot?"' },
  { step: '3', text: 'If yes + policy is still pairing → offer to lock it down proactively' },
  { step: '4', text: 'If people are missing → have them DM the bot; approve each pair code' },
  { step: '5', text: 'If allowlist is empty → DM the bot to capture own ID first' },
  { step: '6', text: 'If policy is already allowlist → confirm locked; use Copy User ID to add more' },
];

const SECURITY_NOTES = [
  {
    title: '.env restart rule',
    detail: 'Server reads .env once at boot. Token change needs session restart or /reload-plugins.',
    accent: CLAUDE.SPARK,
  },
  {
    title: 'access.json immediate rule',
    detail: 'Server re-reads access.json on every inbound message. Policy changes take effect without restart.',
    accent: '#4A7C59',
  },
  {
    title: 'chmod 600 mandatory',
    detail: 'Token save always runs chmod 600 — bot token is a credential, not a config value.',
    accent: '#4A7C59',
  },
  {
    title: 'pairing is temporary',
    detail: 'Pairing exists only to capture Discord snowflakes. Once IDs are in the allowlist, turn pairing off.',
    accent: CLAUDE.SPARK,
  },
];

export const ConfigureDesign: React.FC<ConfigureDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const stepSprings = LOCKDOWN_STEPS.map((_, i) =>
    spring({ frame: frame - 18 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const noteSprings = SECURITY_NOTES.map((_, i) =>
    spring({ frame: frame - 18 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.42;
  const STEP_H = (H * 0.60) / 6 - 9;
  const NOTE_H = (H * 0.60) / 4 - 9;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CONFIGURE · LOCKDOWN RULE + POLICY FLOW + SECURITY HYGIENE
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Pairing is temporary. Allowlist is the goal.
      </div>

      {/* Lockdown steps */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(stepSprings[0], 0, 1),
        }}>
          PUSH-TOWARD-LOCKDOWN — 6 STEPS
        </div>
        {LOCKDOWN_STEPS.map((s, i) => {
          const op = clamp(stepSprings[i], 0, 1);
          const isOffer = i === 2;
          return (
            <div key={i} style={{
              background: isOffer ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${isOffer ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${isOffer ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 8,
              height: STEP_H, boxSizing: 'border-box' as const,
              display: 'flex', alignItems: 'flex-start', gap: 10,
              boxShadow: isOffer ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 6px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{
                fontFamily: MONO, fontSize: 16, fontWeight: 800,
                color: isOffer ? CLAUDE.SPARK : '#4A7C59',
                lineHeight: 1, marginTop: 1, minWidth: 14,
              }}>{s.step}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.4 }}>{s.text}</div>
            </div>
          );
        })}
      </div>

      {/* Security notes */}
      <div style={{ position: 'absolute', left: W * 0.49, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(noteSprings[0], 0, 1),
        }}>
          IMPLEMENTATION RULES
        </div>
        {SECURITY_NOTES.map((note, i) => {
          const op = clamp(noteSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid ${note.accent}`,
              borderRadius: 10, padding: '11px 14px', marginBottom: 10,
              height: NOTE_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: note.accent, marginBottom: 4 }}>{note.title}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{note.detail}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
