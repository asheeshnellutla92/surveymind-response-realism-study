import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CardputerBuddyLayout — B01 — /flash/ device layout + launcher auto-discovery + template.
 */

export const cardputerBuddyLayoutSchema = z.object({
  sparkLine: z.string().default('Drop a .py in apps/. Push it. Appears on next boot. No registration needed.'),
});
export type CardputerBuddyLayoutProps = z.infer<typeof cardputerBuddyLayoutSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const CardputerBuddyLayout: React.FC<CardputerBuddyLayoutProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const treeIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const rightIn = spring({ frame: frame - 16, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const addIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const TREE_W = W * 0.36;
  const RIGHT_W = W - W * 0.10 - TREE_W - 20;
  const TOP = H * 0.22;
  const MAIN_H = H * 0.50;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CARDPUTER BUDDY · DEVICE LAYOUT
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        main.py scans apps/ at boot. Every .py is a menu entry.
      </div>

      {/* /flash/ tree */}
      <div style={{
        position: 'absolute', top: TOP, left: W * 0.05,
        width: TREE_W, height: MAIN_H,
        background: 'rgba(74,124,89,0.05)', border: `1.5px solid #4A7C59`,
        borderRadius: 12, padding: '14px 16px', boxSizing: 'border-box' as const,
        opacity: clamp(treeIn, 0, 1), transform: `translateX(${(1 - clamp(treeIn, 0, 1)) * -14}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#4A7C59', marginBottom: 12 }}>/FLASH/ DEVICE LAYOUT</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK, lineHeight: 2.1 }}>
          <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>/flash/</span><br />
          {'├── '}<span style={{ color: '#4A7C59', fontWeight: 700 }}>main.py</span>{'          ← launcher menu'}<br />
          {'├── buddy_*.py       ← shared libs'}<br />
          {'│   (BLE · UI · state · proto · chars)'}<br />
          {'├── burst_frames.py  ← sprite frames'}<br />
          {'└── '}<span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>apps/</span><br />
          {'    ├── claude_buddy.py'}<br />
          {'    │   ← BLE client → Claude Desktop'}<br />
          {'    ├── hello_cardputer.py'}<br />
          {'    │   ← '}<span style={{ color: '#4A7C59' }}>CANONICAL TEMPLATE</span><br />
          {'    └── snake.py'}
        </div>
      </div>

      {/* Right column: launcher pattern + add app */}
      <div style={{
        position: 'absolute', top: TOP, left: W * 0.05 + TREE_W + 20,
        width: RIGHT_W,
        opacity: clamp(rightIn, 0, 1), transform: `translateX(${(1 - clamp(rightIn, 0, 1)) * 14}px)`,
      }}>
        {/* Launcher auto-discovery */}
        <div style={{
          background: 'rgba(217,119,87,0.05)', border: `1.5px solid ${CLAUDE.SPARK}`,
          borderRadius: 12, padding: '14px 16px', boxSizing: 'border-box' as const,
          marginBottom: 16,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: CLAUDE.SPARK, marginBottom: 8 }}>LAUNCHER AUTO-DISCOVERY</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.7 }}>
            <span style={{ fontWeight: 700 }}>main.py</span> scans <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>/flash/apps/</span> at boot<br />
            → lists every <span style={{ fontFamily: MONO }}>*.py</span> as a menu entry<br />
            → no registration code required
          </div>
        </div>

        {/* hello_cardputer template */}
        <div style={{
          background: 'rgba(74,124,89,0.05)', border: `1.5px solid #4A7C59`,
          borderRadius: 12, padding: '14px 16px', boxSizing: 'border-box' as const,
          marginBottom: 16,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#4A7C59', marginBottom: 8 }}>CANONICAL APP TEMPLATE</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.7 }}>
            <span style={{ color: '#4A7C59' }}>hello_cardputer.py</span><br />
            {'  · Keyboard polling'}<br />
            {'  · Font rendering'}<br />
            {'  · Exit convention (return to launcher)'}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, marginTop: 6 }}>Smallest working example — start here for any new app</div>
        </div>

        {/* Add app command */}
        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderLeft: `4px solid ${CLAUDE.SPARK}`,
          borderRadius: 8, padding: '10px 12px', boxSizing: 'border-box' as const,
          opacity: clamp(addIn, 0, 1),
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, marginBottom: 6 }}>PUSH WITHOUT RE-FLASHING</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK }}>
            python3 onboard/scripts/install_apps.py \<br />
            {'  --port <PORT> --src buddy'}
          </div>
        </div>
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
