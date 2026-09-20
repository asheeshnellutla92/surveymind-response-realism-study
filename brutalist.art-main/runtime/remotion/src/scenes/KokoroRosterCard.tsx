import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {z} from 'zod';
import {VOX, FONT, SPRING_SMOOTH} from '../tokens/vox';

/**
 * KokoroRosterCard — one card per voice in any Kokoro language roster.
 * Shows name, voice code, group, grade (with chip), and roster index.
 * Optional subtitle (native text) + subtitleEn (English translation) for non-English rosters.
 * Grade chip: teal A/B · slate C · crimson D/F.
 * Teardown palette: #FFFFFF ground / #2A1A0E ink / #C8102E crimson.
 * Duration-agnostic — audio is master clock; card springs in then holds.
 */

export const kokoroRosterCardSchema = z.object({
  name:       z.string().default('Heart'),
  code:       z.string().default('af_heart'),
  group:      z.string().default('American'),
  grade:      z.string().default('A-'),
  index:      z.string().default('1/28'),
  topic:      z.string().default('KOKORO — THE FULL 28'),
  subtitle:   z.string().optional(),
  subtitleEn: z.string().optional(),
});
export type KokoroRosterCardProps = z.infer<typeof kokoroRosterCardSchema>;

const ACCENT_TEAL = '#1F6F5C';
const MONO = '"PT Mono", "SF Mono", Menlo, monospace';
const FONT_JA = '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
const FONT_ZH = '"Noto Sans SC", "PingFang SC", "Heiti SC", "STHeiti", sans-serif';
const FONT_HI = '"Noto Sans Devanagari", "Mangal", "Arial Unicode MS", sans-serif';

function gradeChipColor(grade: string): string {
  const first = grade.trim()[0]?.toUpperCase() ?? 'C';
  if (first === 'A' || first === 'B') return ACCENT_TEAL;
  if (first === 'C') return VOX.SLATE;
  return VOX.CRIMSON; // D or F
}

// Detect script from native subtitle text; return correct font stack + lang attribute.
// Devanagari (U+0900-U+097F) → Hindi. Hiragana/Katakana (U+3041-U+30FF) → Japanese.
// Otherwise treat as Chinese.
function nativeFont(text: string | undefined): {font: string; lang: string} {
  if (!text) return {font: FONT.display, lang: ''};
  if (/[ऀ-ॿ]/.test(text)) return {font: FONT_HI, lang: 'hi'};
  if (/[ぁ-ヿ]/.test(text)) return {font: FONT_JA, lang: 'ja'};
  if (/[一-鿿㐀-䶿]/.test(text)) return {font: FONT_ZH, lang: 'zh-Hans'};
  return {font: FONT.display, lang: ''};
}

export const KokoroRosterCard: React.FC<KokoroRosterCardProps> = ({
  name, code, group, grade, index, topic, subtitle, subtitleEn,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const isPortrait = height > width;

  const PAD_X = width  * 0.08;
  const PAD_Y = height * 0.10;

  const cardIn  = spring({frame,            fps, config: SPRING_SMOOTH});
  const gradeIn = spring({frame: frame - 6, fps, config: SPRING_SMOOTH});

  const chipColor = gradeChipColor(grade);
  const {font: subtitleFont, lang: subtitleLang} = nativeFont(subtitle);

  // Layout constants scale with frame dimensions
  const nameSz      = isPortrait ? height * 0.10  : height * 0.20;
  const codeSz      = isPortrait ? height * 0.030 : height * 0.042;
  const groupSz     = isPortrait ? height * 0.026 : height * 0.032;
  const gradeSz     = isPortrait ? height * 0.040 : height * 0.060;
  const idxSz       = isPortrait ? height * 0.022 : height * 0.028;
  const subtitleSz  = isPortrait ? height * 0.026 : height * 0.034;
  const subtitleEnSz= isPortrait ? height * 0.020 : height * 0.026;
  const chipW       = isPortrait ? width  * 0.22  : width  * 0.14;
  const chipH       = isPortrait ? height * 0.070 : height * 0.10;
  const ruleH       = isPortrait ? 1.5 : 2;

  // Center content block vertically and horizontally
  const contentTop = isPortrait ? height * 0.24 : height * 0.18;

  return (
    <AbsoluteFill style={{backgroundColor: VOX.CREAM, overflow: 'hidden'}}>

      {/* Topic eyebrow — top left */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: FONT.display,
        fontSize: height * 0.018,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: VOX.SLATE,
        opacity: cardIn * 0.7,
      }}>
        {topic}
      </div>

      {/* Index — top right */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        top: PAD_Y,
        fontFamily: MONO,
        fontSize: idxSz,
        color: VOX.SLATE,
        opacity: cardIn * 0.6,
      }}>
        {index}
      </div>

      {/* Main content — centered */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        top: contentTop,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: height * 0.024,
        opacity: cardIn,
        transform: `translateY(${(1 - cardIn) * 20}px)`,
      }}>

        {/* Group label */}
        <div style={{
          fontFamily: FONT.display,
          fontSize: groupSz,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: VOX.SLATE,
        }}>
          {group}
        </div>

        {/* Name — large */}
        <div style={{
          fontFamily: FONT.display,
          fontSize: nameSz,
          fontWeight: 900,
          letterSpacing: -1,
          color: VOX.INK,
          lineHeight: 1,
          textAlign: 'center',
        }}>
          {name.toUpperCase()}
        </div>

        {/* Code in mono */}
        <div style={{
          fontFamily: MONO,
          fontSize: codeSz,
          color: VOX.SLATE,
          letterSpacing: '0.04em',
        }}>
          {code}
        </div>

        {/* Hairline rule */}
        <div style={{
          width: isPortrait ? '60%' : '40%',
          height: ruleH,
          backgroundColor: VOX.HAIRLINE,
        }} />

        {/* Grade chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: chipW,
          height: chipH,
          backgroundColor: chipColor,
          borderRadius: 4,
          opacity: gradeIn,
          transform: `scale(${0.8 + gradeIn * 0.2})`,
        }}>
          <span style={{
            fontFamily: FONT.display,
            fontSize: gradeSz,
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: 1,
          }}>
            {grade}
          </span>
        </div>

        {/* Bilingual subtitles — native text + English translation */}
        {subtitle && (
          <div lang={subtitleLang || undefined} style={{
            fontFamily: subtitleFont,
            fontSize: subtitleSz,
            fontWeight: 500,
            color: VOX.INK,
            textAlign: 'center',
            lineHeight: 1.4,
            opacity: gradeIn * 0.9,
            maxWidth: '88%',
          }}>
            {subtitle}
          </div>
        )}
        {subtitleEn && (
          <div lang="en" style={{
            fontFamily: FONT.display,
            fontSize: subtitleEnSz,
            fontWeight: 400,
            fontStyle: 'italic',
            color: VOX.SLATE,
            textAlign: 'center',
            lineHeight: 1.4,
            opacity: gradeIn * 0.7,
            maxWidth: '88%',
          }}>
            {subtitleEn}
          </div>
        )}

      </div>

      {/* Bottom CRIMSON rule */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.07,
        width: width * 0.06,
        height: 2,
        backgroundColor: VOX.CRIMSON,
        opacity: cardIn,
      }} />

    </AbsoluteFill>
  );
};
