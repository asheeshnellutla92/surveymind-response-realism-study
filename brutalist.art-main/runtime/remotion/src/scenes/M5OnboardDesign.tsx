import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const m5OnboardDesignSchema = z.object({
  sparkLine: z.string().default('Ask variant first. Background + tee. Relay button dance. Install-only mode for already-flashed.'),
});
export type M5OnboardDesignProps = z.infer<typeof m5OnboardDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const WORKFLOW_STEPS = [
  { label: 'Confirm variant first', note: 'Cardputer vs Cardputer-Adv: same form factor, different firmware — wrong image boot-loops', color: '#4A7C59' },
  { label: 'Background + tee + Monitor', note: 'run_in_background:true | tee /tmp/m5-onboard.log | grep stage banners and button-dance prompt', color: '#4A7C59' },
  { label: 'Relay button dance', note: 'hold BtnG0 on back, press RST, keep G0 until dark — tell user, wait for confirm', color: '#4A7C59' },
  { label: 'Install-only mode', note: 'install_apps.py --port PORT --src buddy — skip re-flash for already-provisioned devices', color: '#4A7C59' },
];

const GOTCHAS = [
  { label: 'Baud rate matters', note: '460800 for UART bridges · 115200 --no-stub native USB · 921600 fails on CH9102', color: CLAUDE.SPARK },
  { label: 'NVS boot_option=2', note: 'required when bundle ships main.py — prevents UIFlow BLE advertise wedging NimBLE', color: CLAUDE.SPARK },
  { label: 'Cardputer vs Cardputer-Adv', note: 'detect.py cannot tell them apart before flashing — same USB-JTAG VID, must ask user', color: CLAUDE.SPARK },
  { label: 'Never unplug during flash', note: 'mid-flash disconnect corrupts internal flash — recover with BtnG0 alone, re-run skill', color: CLAUDE.SPARK },
];

export const M5OnboardDesign: React.FC<M5OnboardDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const stepSprings = WORKFLOW_STEPS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const gotchaSprings = GOTCHAS.map((_, i) =>
    spring({ frame: frame - 20 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.28;
  const LEFT_W = W * 0.42;
  const RIGHT_W = W * 0.41;
  const ITEM_H = (H * 0.62) / 4 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        M5-ONBOARD · DESIGN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Workflow + key patterns
      </div>

      {/* Workflow steps — left */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(stepSprings[0], 0, 1),
        }}>
          WORKFLOW
        </div>
        {WORKFLOW_STEPS.map((item, i) => {
          const op = clamp(stepSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: '0 1px 5px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.INK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
            </div>
          );
        })}
      </div>

      {/* Gotchas — right */}
      <div style={{ position: 'absolute', left: W * 0.54, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(gotchaSprings[0], 0, 1),
        }}>
          GOTCHAS
        </div>
        {GOTCHAS.map((item, i) => {
          const op = clamp(gotchaSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.05)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 9,
              height: ITEM_H, boxSizing: 'border-box' as const,
              display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
              boxShadow: '0 1px 6px rgba(217,119,87,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{item.note}</div>
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
