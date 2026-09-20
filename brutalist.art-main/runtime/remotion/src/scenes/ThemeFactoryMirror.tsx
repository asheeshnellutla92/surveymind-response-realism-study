import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ThemeFactoryMirror — B05 — the same demo card re-skins INTO this video's
 * own palette: cream #FAF9F5 / ink #3D3929 / terracotta #D97757.
 * A highlight frame pulses around the card (terracotta glow).
 * Spark line: "You're watching one."
 * ILLUSTRATE LAW: concept illustration, NOT a UI beat.
 */

export const themeFactoryMirrorSchema = z.object({
  sparkLine: z.string().default("You're watching one."),
});
export type ThemeFactoryMirrorProps = z.infer<typeof themeFactoryMirrorSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// "Brutalist Cream" — this video's own theme (matching CLAUDE tokens)
const THIS_THEME = {
  name: 'Brutalist Cream',
  bg: '#FAF9F5',
  accent: '#D97757',
  mid: '#73705F',
  light: '#3D3929',
  headerFont: 'EB Garamond',
  bodyFont: 'System UI',
};

// The "source" theme this card just came from (Midnight Galaxy — the last in B04)
const SOURCE_THEME = {
  bg: '#2b1e3e',
  accent: '#4a4e8f',
  mid: '#a490c2',
  light: '#e6e6fa',
};

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function lerpHex(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

const BARS = [
  { label: 'Q1', value: 0.65 },
  { label: 'Q2', value: 0.82 },
  { label: 'Q3', value: 0.74 },
  { label: 'Q4', value: 0.91 },
];

export const ThemeFactoryMirror: React.FC<ThemeFactoryMirrorProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Morph into this video's palette over the first 40 frames
  const MORPH_END = 40;
  const morphT = clamp(frame / MORPH_END, 0, 1);

  const bg = lerpHex(SOURCE_THEME.bg, THIS_THEME.bg, morphT);
  const accent = lerpHex(SOURCE_THEME.accent, THIS_THEME.accent, morphT);
  const mid = lerpHex(SOURCE_THEME.mid, THIS_THEME.mid, morphT);
  const light = lerpHex(SOURCE_THEME.light, THIS_THEME.light, morphT);

  const cardIn = spring({ frame, fps, config: { damping: 28, stiffness: 100, mass: 1 } });
  const sparkIn = spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const labelIn = spring({ frame: frame - 45, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  // Pulse after morph completes: glow ring oscillation
  const pulsePhase = Math.max(0, frame - MORPH_END);
  const pulse = morphT >= 1 ? 0.5 + 0.5 * Math.sin(pulsePhase * 0.18) : 0;
  const glowColor = `rgba(217,119,87,${pulse * 0.5})`;
  const glowShadow = `0 0 ${20 + pulse * 30}px ${glowColor}, 0 0 ${40 + pulse * 60}px rgba(217,119,87,${pulse * 0.2})`;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.065,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(cardIn, 0, 1),
      }}>
        THEME FACTORY · SKIN 11 · THIS VIDEO
      </div>

      {/* The demo card — same layout as B04, morphing into Claude palette */}
      <div style={{
        position: 'absolute',
        top: height * 0.13,
        left: width * 0.14,
        right: width * 0.14,
        bottom: height * 0.20,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: morphT >= 1
          ? `0 20px 64px rgba(61,57,41,0.16), ${glowShadow}`
          : '0 20px 64px rgba(61,57,41,0.22)',
        opacity: clamp(cardIn, 0, 1),
        transform: `scale(${0.94 + 0.06 * clamp(cardIn, 0, 1)})`,
        // Terracotta border highlight when fully morphed
        outline: morphT >= 1 ? `${2 + pulse * 2}px solid rgba(217,119,87,${pulse * 0.6})` : 'none',
      }}>
        {/* Card header */}
        <div style={{ background: bg, padding: '32px 40px 28px' }}>
          <div style={{ fontFamily: SANS, fontSize: 30, fontWeight: 900, color: light, marginBottom: 10, lineHeight: 1.2 }}>
            Annual Report Q3
          </div>
          <div style={{ width: 60, height: 3, background: accent, borderRadius: 2, marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Revenue up 18% YoY across all regions', 'Customer retention at record high: 94.2%'].map((bullet, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontFamily: SANS, fontSize: 17, color: mid, lineHeight: 1.4 }}>
                <span style={{ color: accent, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>▸</span>
                {bullet}
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ background: morphT < 1 ? light : '#FFFFFF', padding: '24px 40px 20px' }}>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: THIS_THEME.light, opacity: 0.5, marginBottom: 16 }}>
            Quarterly Performance
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', height: 100 }}>
            {BARS.map((bar) => (
              <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 8 }}>
                <div style={{
                  width: '100%',
                  height: Math.round(bar.value * 80),
                  background: accent,
                  borderRadius: '4px 4px 0 0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: 4,
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#fff', fontWeight: 700 }}>
                    {Math.round(bar.value * 100)}
                  </span>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 13, color: THIS_THEME.light, opacity: 0.6 }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* "This video" label — appears after morph */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.14,
        left: '50%',
        transform: 'translateX(-50%)',
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 12,
        padding: '10px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        opacity: clamp(labelIn, 0, 1),
      }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: CLAUDE.SPARK }} />
        <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: CLAUDE.INK }}>
          Brutalist Cream — this video's own theme
        </div>
        <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.GHOST }}>
          #FAF9F5 / #3D3929 / #D97757
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
