import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const m5OnboardTellSchema = z.object({
  sparkLine: z.string().default('Button dance and background run pattern correct. NVS blob bug and dialout group buried.'),
});
export type M5OnboardTellProps = z.infer<typeof m5OnboardTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GETS_RIGHT = [
  'Single orchestrator: onboard.py --apps buddy covers all 4 stages — sub-scripts only for partial runs',
  'Button dance documented with exact coaching: hold G0, briefly RST, keep G0 dark — retry built in',
  'Background run pattern with grep filter: stage banners and button-dance prompt surfaced, byte-progress suppressed',
  'esptool post-flash watchdog-reset treated as non-fatal when Hash of data verified appears — no false failures',
  'Cardputer-Adv as default explicitly stated with rationale — right intent-default for the provisioning rig',
];

const BITES = [
  'Variant question is user-intent not hardware — developer who skips to the command will try to detect it and fail',
  'NVS set_str vs set_blob: prior blob write causes silent boot-loop — erase-key fix buried in critical gotchas',
  'BLE OSError -519 is opaque: nothing in the error points to boot_option=2 as root cause',
  'Linux dialout group requirement is in platform notes — developer hits Permission denied and blames hardware first',
  'Windows Store Python quirky PATH noted late in platform notes rather than upfront in dependencies section',
];

const CALLOUT = "Native-USB ESP32-S3 boards (Cardputer, Cardputer-Adv, CoreS3) have no software path into download mode. Hold BtnG0 on the back of the device, briefly press RST while holding, keep G0 until the screen goes fully dark. No DTR/RTS signal, no esptool flag, and no pyserial call substitutes. The script waits; the user must press.";

export const M5OnboardTell: React.FC<M5OnboardTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 14, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const rightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const biteSprings = BITES.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.40;
  const ITEM_H = (H * 0.51) / 5 - 10;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.40;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        M5-ONBOARD · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        What it gets right / where it bites
      </div>

      {/* Callout */}
      <div style={{
        position: 'absolute', left: W * 0.04, top: H * 0.255, right: W * 0.04,
        background: 'rgba(217,119,87,0.07)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 10, padding: '10px 16px',
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 8}px)`,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="9" cy="9" r="8" fill="none" stroke={CLAUDE.SPARK} strokeWidth="1.5" />
          <text x="9" y="13.5" textAnchor="middle" fontFamily="serif" fontSize="11" fontWeight="700" fill={CLAUDE.SPARK}>!</text>
        </svg>
        <div style={{ fontFamily: SANS, fontSize: 11.5, color: CLAUDE.INK, lineHeight: 1.55 }}>{CALLOUT}</div>
      </div>

      {/* Gets right column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(rightSprings[0], 0, 1),
        }}>
          GETS RIGHT
        </div>
        {GETS_RIGHT.map((txt, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', alignItems: 'center',
              boxShadow: '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.4 }}>{txt}</div>
            </div>
          );
        })}
      </div>

      {/* Bites column */}
      <div style={{ position: 'absolute', left: W * 0.52, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(biteSprings[0], 0, 1),
        }}>
          WHERE IT BITES
        </div>
        {BITES.map((txt, i) => {
          const op = clamp(biteSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 8, padding: '7px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', alignItems: 'center',
              boxShadow: '0 1px 6px rgba(217,119,87,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.4 }}>{txt}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
          <polygon points="8,1 10,6 15,6 11,10 13,15 8,12 3,15 5,10 1,6 6,6" fill={CLAUDE.SPARK} />
        </svg>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
