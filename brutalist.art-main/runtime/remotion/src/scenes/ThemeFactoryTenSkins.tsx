import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ThemeFactoryTenSkins — B04 — the centerpiece.
 * One demo card (title, two bullets, a small bar chart) re-skinned through all 10 themes.
 * TRUE-HEX EXCEPTION: themed demo cards use verbatim source hexes.
 * Frame chrome (eyebrow, spark line, gallery plaque border) stays in Claude palette.
 * Themes morph smoothly (interpolated color transitions, not jump-cuts).
 * Beat total_duration_s: 32.45s → 973 frames at 30fps.
 * 10 themes → each gets ~97 frames, morph starts at frame 10 of each theme.
 * Caption: "Redrawn from theme-showcase.pdf" — once, small.
 * ILLUSTRATE LAW: concept illustration, NOT a UI beat.
 *
 * Verbatim hex values from themes/*.md (verified in SOURCES.md):
 */

export const themeFactoryTenSkinsSchema = z.object({
  sparkLine: z.string().default('Same plate, ten prints.'),
});
export type ThemeFactoryTenSkinsProps = z.infer<typeof themeFactoryTenSkinsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// All 10 themes — verbatim from themes/*.md, in SKILL.md narration order
interface ThemeData {
  name: string;
  bg: string;      // background / dominant dark
  accent: string;  // primary accent
  mid: string;     // secondary / mid-tone
  light: string;   // light / text color
  headerFont: string;
  bodyFont: string;
  bestFor: string;
}

const THEMES: ThemeData[] = [
  {
    name: 'Ocean Depths',
    bg: '#1a2332',
    accent: '#2d8b8b',
    mid: '#a8dadc',
    light: '#f1faee',
    headerFont: 'DejaVu Sans Bold',
    bodyFont: 'DejaVu Sans',
    bestFor: 'Corporate presentations, financial reports',
  },
  {
    name: 'Sunset Boulevard',
    bg: '#264653',
    accent: '#e76f51',
    mid: '#f4a261',
    light: '#e9c46a',
    headerFont: 'DejaVu Serif Bold',
    bodyFont: 'DejaVu Sans',
    bestFor: 'Creative pitches, lifestyle brands',
  },
  {
    name: 'Forest Canopy',
    bg: '#2d4a2b',
    accent: '#7d8471',
    mid: '#a4ac86',
    light: '#faf9f6',
    headerFont: 'FreeSerif Bold',
    bodyFont: 'FreeSans',
    bestFor: 'Environmental presentations, sustainability',
  },
  {
    name: 'Modern Minimalist',
    bg: '#36454f',
    accent: '#708090',
    mid: '#d3d3d3',
    light: '#ffffff',
    headerFont: 'DejaVu Sans Bold',
    bodyFont: 'DejaVu Sans',
    bestFor: 'Tech presentations, design showcases',
  },
  {
    name: 'Golden Hour',
    bg: '#4a403a',
    accent: '#f4a900',
    mid: '#c1666b',
    light: '#d4b896',
    headerFont: 'FreeSans Bold',
    bodyFont: 'FreeSans',
    bestFor: 'Restaurant presentations, hospitality',
  },
  {
    name: 'Arctic Frost',
    bg: '#1a5f9e',
    accent: '#4a6fa5',
    mid: '#c0c0c0',
    light: '#fafafa',
    headerFont: 'DejaVu Sans Bold',
    bodyFont: 'DejaVu Sans',
    bestFor: 'Healthcare, technology, clean tech',
  },
  {
    name: 'Desert Rose',
    bg: '#5d2e46',
    accent: '#b87d6d',
    mid: '#d4a5a5',
    light: '#e8d5c4',
    headerFont: 'FreeSans Bold',
    bodyFont: 'FreeSans',
    bestFor: 'Fashion, beauty brands, boutique',
  },
  {
    name: 'Tech Innovation',
    bg: '#1e1e1e',
    accent: '#0066ff',
    mid: '#00ffff',
    light: '#ffffff',
    headerFont: 'DejaVu Sans Bold',
    bodyFont: 'DejaVu Sans',
    bestFor: 'Tech startups, AI/ML presentations',
  },
  {
    name: 'Botanical Garden',
    bg: '#4a7c59',
    accent: '#f9a620',
    mid: '#b7472a',
    light: '#f5f3ed',
    headerFont: 'DejaVu Serif Bold',
    bodyFont: 'DejaVu Sans',
    bestFor: 'Garden, food, farm-to-table',
  },
  {
    name: 'Midnight Galaxy',
    bg: '#2b1e3e',
    accent: '#4a4e8f',
    mid: '#a490c2',
    light: '#e6e6fa',
    headerFont: 'FreeSans Bold',
    bodyFont: 'FreeSans',
    bestFor: 'Entertainment, gaming, luxury brands',
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHex(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `rgb(${r},${g},${b})`;
}

// Bar chart data for the demo card (fixed layout, only colors change)
const BARS = [
  { label: 'Q1', value: 0.65 },
  { label: 'Q2', value: 0.82 },
  { label: 'Q3', value: 0.74 },
  { label: 'Q4', value: 0.91 },
];

export const ThemeFactoryTenSkins: React.FC<ThemeFactoryTenSkinsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Total duration: 32.45s → 973 frames
  // Each theme: 973/10 ≈ 97 frames; morph over 18 frames at start of each theme
  const THEME_FRAMES = 97;
  const MORPH_FRAMES = 18;

  const themeIndex = Math.min(Math.floor(frame / THEME_FRAMES), THEMES.length - 1);
  const nextIndex = Math.min(themeIndex + 1, THEMES.length - 1);
  const withinTheme = frame - themeIndex * THEME_FRAMES;
  const morphT = clamp(withinTheme / MORPH_FRAMES, 0, 1);

  const current = THEMES[themeIndex];
  const next = THEMES[nextIndex];

  // Interpolate all four color channels
  const bg = morphT < 1 ? lerpHex(current.bg, next.bg, morphT) : current.bg;
  const accent = morphT < 1 ? lerpHex(current.accent, next.accent, morphT) : current.accent;
  const mid = morphT < 1 ? lerpHex(current.mid, next.mid, morphT) : current.mid;
  const light = morphT < 1 ? lerpHex(current.light, next.light, morphT) : current.light;

  // Name cross-dissolve
  const displayTheme = withinTheme < MORPH_FRAMES / 2 && themeIndex > 0
    ? THEMES[themeIndex - 1]
    : current;
  const nameOpacity = withinTheme < MORPH_FRAMES
    ? interpolate(withinTheme, [0, MORPH_FRAMES * 0.4, MORPH_FRAMES], [0, 1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  const cardIn = spring({ frame, fps, config: { damping: 28, stiffness: 100, mass: 1 } });
  const sparkIn = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.055,
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
        THEME FACTORY · 10 SKINS · ONE SLIDE CARD
      </div>

      {/* Demo card — the one slide that gets re-skinned */}
      <div style={{
        position: 'absolute',
        top: height * 0.12,
        left: width * 0.12,
        right: width * 0.12,
        bottom: height * 0.18,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 64px rgba(61,57,41,0.22)',
        opacity: clamp(cardIn, 0, 1),
        transform: `scale(${0.94 + 0.06 * clamp(cardIn, 0, 1)})`,
      }}>
        {/* Card header */}
        <div style={{
          background: bg,
          padding: '32px 40px 28px',
        }}>
          {/* Slide title */}
          <div style={{
            fontFamily: SANS,
            fontSize: 32,
            fontWeight: 900,
            color: light,
            marginBottom: 10,
            lineHeight: 1.2,
          }}>
            Annual Report Q3
          </div>
          <div style={{
            width: 60,
            height: 3,
            background: accent,
            borderRadius: 2,
            marginBottom: 16,
          }} />
          {/* Two bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Revenue up 18% YoY across all regions', 'Customer retention at record high: 94.2%'].map((bullet, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                fontFamily: SANS,
                fontSize: 18,
                color: mid,
                lineHeight: 1.4,
              }}>
                <span style={{ color: accent, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>▸</span>
                {bullet}
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart section */}
        <div style={{
          background: light,
          padding: '28px 40px 24px',
          flex: 1,
        }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase' as const,
            color: bg,
            opacity: 0.6,
            marginBottom: 18,
          }}>
            Quarterly Performance
          </div>

          {/* Bars */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', height: 120 }}>
            {BARS.map((bar) => (
              <div key={bar.label} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                gap: 8,
              }}>
                <div style={{
                  width: '100%',
                  height: Math.round(bar.value * 100),
                  background: accent,
                  borderRadius: '4px 4px 0 0',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: 4,
                }}>
                  <span style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: light,
                    fontWeight: 700,
                    opacity: 0.9,
                  }}>
                    {Math.round(bar.value * 100)}
                  </span>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 13, color: bg, opacity: 0.7 }}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>

          {/* Font attribution — shows current theme fonts */}
          <div style={{
            marginTop: 16,
            display: 'flex',
            gap: 16,
            opacity: 0.5,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: bg }}>
              H: {displayTheme.headerFont}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: bg }}>
              B: {displayTheme.bodyFont}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery plaque — terracotta bordered, shows current theme name */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.105,
        left: '50%',
        transform: 'translateX(-50%)',
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 12,
        padding: '10px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 4px 20px rgba(61,57,41,0.10)',
        opacity: nameOpacity,
      }}>
        <div style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: accent,
          flexShrink: 0,
        }} />
        <div style={{
          fontFamily: SERIF,
          fontSize: 22,
          fontWeight: 700,
          color: CLAUDE.INK,
          whiteSpace: 'nowrap' as const,
        }}>
          {themeIndex + 1} of 10 — {current.name}
        </div>
        <div style={{
          fontFamily: SANS,
          fontSize: 13,
          color: CLAUDE.INK_SOFT,
        }}>
          {current.bestFor}
        </div>
      </div>

      {/* Progress bar — shows which theme we're on */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.085,
        left: width * 0.12,
        right: width * 0.12,
        height: 3,
        background: CLAUDE.BORDER,
        borderRadius: 2,
      }}>
        <div style={{
          height: '100%',
          width: `${((themeIndex + morphT) / THEMES.length) * 100}%`,
          background: CLAUDE.SPARK,
          borderRadius: 2,
          transition: 'width 0.05s linear',
        }} />
      </div>

      {/* Caption — once, small */}
      <div style={{
        position: 'absolute',
        right: width * 0.06,
        bottom: height * 0.065,
        fontFamily: SANS,
        fontSize: 11,
        color: CLAUDE.GHOST,
        opacity: clamp(cardIn, 0, 1),
      }}>
        Redrawn from theme-showcase.pdf · hex values verbatim from themes/*.md
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.05,
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
