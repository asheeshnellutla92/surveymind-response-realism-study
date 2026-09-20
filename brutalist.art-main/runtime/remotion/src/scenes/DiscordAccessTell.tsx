import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * DiscordAccessTell — B05 — teardown: gets right + bites + callout.
 */

export const discordAccessTellSchema = z.object({
  sparkLine: z.string().default('Prompt injection defense clear. $ARGUMENTS exposure: document it.'),
});
export type DiscordAccessTellProps = z.infer<typeof discordAccessTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GETS_RIGHT = [
  'Prompt injection defense: attack vector explained, not just "channel messages are untrusted"',
  'State shape fully documented with real JSON — pending includes senderId, chatId, expiry',
  'pair flow includes approved/ dir creation — server polling handshake, not just JSON edit',
  'Read-before-write rule + ENOENT handling address real concurrency failure mode',
  'Snowflake ID distinction documented: sender snowflake ≠ DM channel snowflake',
];

const BITES = [
  '$ARGUMENTS literal in skill body — how it gets populated and injection risk undocumented',
  'set mentionPatterns accepts regex strings with no validation bounds or backtracking note',
  'dmPolicy mode behavior differences (pairing vs allowlist vs disabled) never explained',
  'Channel server re-read mechanism undocumented: polling interval, file lock, race conditions',
  'group --allow id1,id2 parsing: error cases for malformed input not specified',
];

const CALLOUT = 'The security model is the strongest part — the attack vector is not just named but explained, and the auto-pick refusal has a concrete attacker scenario. The gap is $ARGUMENTS: it appears in the skill body as a literal placeholder with no documentation of how it\'s populated or whether it\'s sanitized.';

export const DiscordAccessTell: React.FC<DiscordAccessTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 140, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const COL_TOP = H * 0.40;
  const ITEM_H = (H * 0.51) / 5 - 10;
  const COL_W = (W - W * 0.10) / 2 - 12;

  const getRightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 14 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const bitesSprings = BITES.map((_, i) =>
    spring({ frame: frame - 14 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        DISCORD ACCESS · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 38, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Prompt injection defense clear. $ARGUMENTS exposure: document it.
      </div>

      <div style={{
        position: 'absolute', top: COL_TOP - 22, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: '#4A7C59', textTransform: 'uppercase' as const,
        opacity: clamp(getRightSprings[0], 0, 1),
      }}>GETS RIGHT</div>
      <div style={{
        position: 'absolute', top: COL_TOP - 22, left: W * 0.05 + COL_W + 24,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.SPARK, textTransform: 'uppercase' as const,
        opacity: clamp(bitesSprings[0], 0, 1),
      }}>BITES</div>

      {GETS_RIGHT.map((text, i) => {
        const op = clamp(getRightSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: COL_TOP + i * (ITEM_H + 10),
            left: W * 0.05, width: COL_W, height: ITEM_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid #4A7C59`, borderRadius: 9,
            display: 'flex', alignItems: 'center', padding: '0 12px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.3 }}>{text}</div>
          </div>
        );
      })}

      {BITES.map((text, i) => {
        const op = clamp(bitesSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: COL_TOP + i * (ITEM_H + 10),
            left: W * 0.05 + COL_W + 24, width: COL_W, height: ITEM_H,
            background: 'rgba(217,119,87,0.04)', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 9,
            display: 'flex', alignItems: 'center', padding: '0 12px',
            boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -14}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.3 }}>{text}</div>
          </div>
        );
      })}

      <div style={{
        position: 'absolute', bottom: H * 0.16, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 12, padding: '10px 16px',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        boxSizing: 'border-box' as const,
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 10}px)`,
      }}>
        <svg width={18} height={18} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M13 2L4.09 12.96A1 1 0 005 14.5h5.5L11 22l8.91-10.96A1 1 0 0019 9.5H13.5L13 2z" fill={CLAUDE.SPARK} />
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.5 }}>{CALLOUT}</div>
      </div>

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
