import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ThemeFactoryContrastMeter — B08 — WCAG AA/AAA contrast meter.
 * Three pairs with ratios counting up in real time:
 *   Silver #e6e6fa on Deep Purple #2b1e3e → 12.57:1 ✓ AAA (Midnight Galaxy)
 *   Chocolate Brown #4a403a on Warm Beige #d4b896 → 5.32:1 ✓ AA (Golden Hour)
 *   Mustard Yellow #f4a900 on Warm Beige #d4b896 → 1.05:1 ✗ FAIL — mustard text fades into beige
 *
 * SHOW-DON'T-TELL: ratios count up, mustard text visibly fades into beige.
 * All hexes verbatim from themes/midnight-galaxy.md and themes/golden-hour.md (SOURCES.md).
 * ILLUSTRATE LAW: concept illustration, NOT a UI beat.
 */

export const themeFactoryContrastMeterSchema = z.object({
  sparkLine: z.string().default('One load-bearing sentence.'),
});
export type ThemeFactoryContrastMeterProps = z.infer<typeof themeFactoryContrastMeterSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// True-hex pairs — verbatim from SOURCES.md (computed WCAG 2.x)
const PAIRS = [
  {
    foreground: '#e6e6fa',   // Silver — Midnight Galaxy
    background: '#2b1e3e',   // Deep Purple — Midnight Galaxy
    fgName: 'Silver',
    bgName: 'Deep Purple',
    theme: 'Midnight Galaxy',
    ratio: 12.57,
    grade: 'AAA',
    pass: true,
    delay: 0,
  },
  {
    foreground: '#4a403a',   // Chocolate Brown — Golden Hour
    background: '#d4b896',   // Warm Beige — Golden Hour
    fgName: 'Chocolate Brown',
    bgName: 'Warm Beige',
    theme: 'Golden Hour',
    ratio: 5.32,
    grade: 'AA',
    pass: true,
    delay: 18,
  },
  {
    foreground: '#f4a900',   // Mustard Yellow — Golden Hour
    background: '#d4b896',   // Warm Beige — Golden Hour
    fgName: 'Mustard Yellow',
    bgName: 'Warm Beige',
    theme: 'Golden Hour',
    ratio: 1.05,
    grade: 'FAIL',
    pass: false,
    delay: 36,
  },
];

// Frame schedule: each pair's ratio counts up over COUNT_FRAMES
// Total: 40.66s → ~1220 frames
// Pair 1: 0–60; Pair 2: 18–78; Pair 3: 36–96 (countdown from 1→ratio)
const COUNT_FRAMES = 55;

interface PairCardProps {
  pair: typeof PAIRS[0];
  frame: number;
  fps: number;
}

const PairCard: React.FC<PairCardProps> = ({ pair, frame, fps }) => {
  const cardIn = spring({ frame: frame - pair.delay, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const op = clamp(cardIn, 0, 1);
  const ty = (1 - op) * 20;

  // Ratio counts up from 1.00 to pair.ratio
  const countProgress = clamp((frame - pair.delay - 10) / COUNT_FRAMES, 0, 1);
  const displayRatio = 1 + (pair.ratio - 1) * countProgress;

  // Mustard fail effect: text opacity drops as narration lands on "invisibility"
  const failFrameStart = pair.delay + COUNT_FRAMES;
  const failEffect = pair.pass ? 1 : clamp(
    1 - interpolate(frame, [failFrameStart, failFrameStart + 40], [0, 0.85], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    }),
    0.15, 1
  );

  const gradeColor = pair.grade === 'AAA' ? '#2d8b40' : pair.grade === 'AA' ? '#4a6fa5' : '#d9534f';
  const borderColor = pair.pass ? (pair.grade === 'AAA' ? '#2d8b40' : '#4a6fa5') : '#d9534f';

  return (
    <div style={{
      flex: 1,
      background: CLAUDE.CARD,
      borderRadius: 18,
      overflow: 'hidden',
      border: `2px solid ${borderColor}`,
      boxShadow: `0 6px 24px rgba(61,57,41,0.10)`,
      opacity: op,
      transform: `translateY(${ty}px)`,
    }}>
      {/* Swatch preview */}
      <div style={{
        background: pair.background,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: 26,
          fontWeight: 700,
          color: pair.foreground,
          opacity: failEffect,
        }}>
          Sample Text
        </span>
      </div>

      {/* Pair info */}
      <div style={{ padding: '18px 20px' }}>
        {/* Hex pair */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' as const }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: CLAUDE.PAGE,
            borderRadius: 6,
            padding: '4px 10px',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: pair.foreground, border: `1px solid ${CLAUDE.BORDER}` }} />
            <span style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK }}>{pair.fgName} {pair.foreground.toUpperCase()}</span>
          </div>
          <span style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.GHOST, alignSelf: 'center' }}>on</span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: CLAUDE.PAGE,
            borderRadius: 6,
            padding: '4px 10px',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: pair.background, border: `1px solid ${CLAUDE.BORDER}` }} />
            <span style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK }}>{pair.bgName} {pair.background.toUpperCase()}</span>
          </div>
        </div>

        {/* Theme source */}
        <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.GHOST, marginBottom: 14 }}>
          Source: themes/{pair.theme.toLowerCase().replace(/ /g, '-')}.md
        </div>

        {/* Ratio meter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <div style={{
            fontFamily: MONO,
            fontSize: 36,
            fontWeight: 900,
            color: gradeColor,
            lineHeight: 1,
          }}>
            {displayRatio.toFixed(2)}
            <span style={{ fontSize: 18, color: CLAUDE.INK_SOFT }}>:1</span>
          </div>
          <div style={{
            background: pair.pass ? (pair.grade === 'AAA' ? '#eaf7ed' : '#e8f0f8') : '#fceeed',
            border: `2px solid ${gradeColor}`,
            borderRadius: 10,
            padding: '8px 18px',
          }}>
            <div style={{
              fontFamily: SANS,
              fontSize: 20,
              fontWeight: 900,
              color: gradeColor,
              letterSpacing: 1,
            }}>
              {pair.pass ? '✓ ' : '✗ '}{pair.grade}
            </div>
          </div>
        </div>

        {/* Progress bar showing ratio vs max (21:1) */}
        <div style={{ height: 6, background: CLAUDE.BORDER, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(displayRatio / 21) * 100}%`,
            background: gradeColor,
            borderRadius: 3,
          }} />
        </div>

        {/* Fail callout */}
        {!pair.pass && countProgress >= 1 && (
          <div style={{
            marginTop: 12,
            fontFamily: SANS,
            fontSize: 13,
            color: '#d9534f',
            lineHeight: 1.4,
            opacity: clamp((frame - pair.delay - COUNT_FRAMES) / 12, 0, 1),
          }}>
            Mustard on its own palette background: invisibility.
            <br />
            "Ensure proper contrast and readability." — SKILL.md
          </div>
        )}
      </div>
    </div>
  );
};

export const ThemeFactoryContrastMeter: React.FC<ThemeFactoryContrastMeterProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

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
        opacity: clamp(headerIn, 0, 1),
      }}>
        THEME FACTORY · WCAG CONTRAST AUDIT · TRUE HEX
      </div>

      {/* Section title */}
      <div style={{
        position: 'absolute',
        top: height * 0.115,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 40,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        One sentence. Heavy lifting.
      </div>

      {/* Three pair cards in a row */}
      <div style={{
        position: 'absolute',
        top: height * 0.22,
        left: width * 0.05,
        right: width * 0.05,
        bottom: height * 0.13,
        display: 'flex',
        gap: 24,
      }}>
        {PAIRS.map((pair) => (
          <PairCard key={pair.fgName + pair.theme} pair={pair} frame={frame} fps={fps} />
        ))}
      </div>

      {/* WCAG scale legend */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.085,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        opacity: clamp(spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } }), 0, 1),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: '#2d8b40' }} />
          <span style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>≥7.0:1 AAA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: '#4a6fa5' }} />
          <span style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>≥4.5:1 AA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: '#d9534f' }} />
          <span style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>&lt;4.5:1 FAIL</span>
        </div>
        <div style={{ width: 1, height: 18, background: CLAUDE.BORDER }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.GHOST }}>WCAG 2.x relative luminance · ratios computed</span>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.04,
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
