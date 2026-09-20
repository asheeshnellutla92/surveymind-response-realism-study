/**
 * HaiWordmarkShowcase — claude-liam · 1080×1920 · 30fps
 * One wordmark. Every motion technique Remotion knows. For review.
 *
 * Palette: CLAUDE fidelity brand (cream #FAF9F5, ink #3D3929, terracotta #D97757)
 * Voice:   Liam (am_onyx, Kokoro, in for Bear)
 * Channel: @NikBearBrown
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
} from 'remotion';
import TIMING from './hai-wordmark-timing.json';
import { ClaudeComposerAsk } from './scenes/ClaudeComposerAsk';
import { claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeTitleOutro } from './scenes/ClaudeTitleOutro';
import { claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

// ── Brand constants ───────────────────────────────────────────────────────────
const PAGE   = CLAUDE.PAGE;      // #FAF9F5
const INK    = CLAUDE.INK;       // #3D3929
const SPARK  = CLAUDE.SPARK;     // #D97757
const SERIF  = CLAUDE_FONT.serif;
const SANS   = CLAUDE_FONT.ui;

const TOPIC   = 'DESIGN · MOTION';
const SEGMENT = 'Wordmark Techniques';
const FOLDER  = '@NikBearBrown';

// ── SVG paths from HUMANITARIANS-AI-wordmark.outlined.svg ────────────────────
// H-mark (leading): two paths forming the custom ligature H
const H_MARK_P1 = "M0,8.63h19.25v38.49h27.05l7.28,18.21H19.25v39.02H0V8.63Z";
const H_MARK_P2 = "M30.95,8.89h18.73l38.75,95.2h-19.25L30.95,8.89Z";

// AI-mark (trailing diagonal)
const AI_MARK_PATH = "M1003.33,8.63h18.73l38.75,95.2h-19.25l-38.23-95.2Z";

// UMANITARIANS body text (the outlined glyphs, relative to translate(80.55,92.65))
const UMANITARIANS_D = "M 7.7519531,-77.308594 H 23.361328 V -35.4375 q 0,9.966797 0.580078,12.919922 1.001953,4.746094 4.746094,7.646484 3.796875,2.847656 10.335937,2.847656 6.644532,0 10.019532,-2.689453 3.375,-2.742187 4.060547,-6.697265 0.685546,-3.955078 0.685546,-13.13086 v -42.767578 h 15.609375 v 40.605469 q 0,13.921875 -1.265625,19.669922 -1.265625,5.748047 -4.693359,9.7031249 -3.375,3.9550781 -9.070312,6.328125 -5.695313,2.3203125 -14.871094,2.3203125 -11.074219,0 -16.822266,-2.53125 Q 16.980469,-3.796875 13.658203,-7.8574219 10.335938,-11.970703 9.28125,-16.453125 7.7519531,-23.097656 7.7519531,-36.070312 Z M 86.720627,0 v -77.308594 h 23.361323 l 14.02735,52.734375 13.86914,-52.734375 H 161.3925 V 0 H 146.89055 V -60.855469 L 131.54485,0 h -15.0293 L 101.22258,-60.855469 V 0 Z M 247.69125,0 h -16.98047 l -6.75,-17.560547 H 193.05844 L 186.67758,0 h -16.55859 l 30.11133,-77.308594 h 16.50586 z m -28.74023,-30.585937 -10.65234,-28.6875 -10.44141,28.6875 z M 257.20876,0 v -77.308594 h 15.1875 l 31.64062,51.626953 v -51.626953 h 14.50195 V 0 Z m 78.44133,0 v -77.308594 h 15.60937 V 0 Z m 49.039063,0 v -64.230469 h -22.93945 v -13.078125 h 61.43554 v 13.078125 H 401.29913 V 0 Z m 111.5625,0 h -16.98047 l -6.75,-17.560547 H 442.61945 L 436.23859,0 h -16.5586 l 30.11133,-77.308594 h 16.50586 z m -28.74024,-30.585937 -10.65234,-28.6875 -10.44141,28.6875 z M 506.66429,0 v -77.308594 h 32.85352 q 12.39258,0 17.98242,2.109375 5.64258,2.056641 9.01758,7.382813 3.375,5.326172 3.375,12.18164 0,8.701172 -5.11524,14.396485 -5.11523,5.642578 -15.29297,7.11914 5.0625,2.953125 8.33204,6.486329 3.32226,3.533203 8.9121,12.550781 L 576.1682,0 h -18.66797 l -11.28516,-16.822266 q -6.01172,-9.017578 -8.22656,-11.33789 -2.21484,-2.373047 -4.69336,-3.216797 -2.47851,-0.896484 -7.85742,-0.896484 h -3.16406 V 0 Z m 15.60938,-44.613281 h 11.54882 q 11.23243,0 14.02735,-0.949219 2.79492,-0.949219 4.37695,-3.269531 1.58203,-2.320313 1.58203,-5.800781 0,-3.902344 -2.10937,-6.275391 -2.05664,-2.425781 -5.85352,-3.058594 -1.89844,-0.263672 -11.39062,-0.263672 H 522.27367 Z M 585.21109,0 v -77.308594 h 15.60938 V 0 Z M 686.4864,0 h -16.98046 l -6.75,-17.560547 H 631.85359 L 625.47273,0 h -16.55859 l 30.11133,-77.308594 h 16.50586 z m -28.74023,-30.585937 -10.65234,-28.6875 -10.44141,28.6875 z M 696.00391,0 v -77.308594 h 15.1875 l 31.64062,51.626953 v -51.626953 h 14.50195 V 0 Z m 74.96084,-25.154297 15.1875,-1.476562 q 1.3711,7.646484 5.53711,11.232421 4.21875,3.585938 11.33789,3.585938 7.54102,0 11.33789,-3.164063 3.84961,-3.216796 3.84961,-7.488281 0,-2.742187 -1.63476,-4.640625 -1.58203,-1.951172 -5.58985,-3.375 -2.74218,-0.949218 -12.49804,-3.375 -12.55079,-3.111328 -17.61329,-7.646484 -7.11914,-6.380859 -7.11914,-15.556641 0,-5.90625 3.32227,-11.021484 3.375,-5.167969 9.65039,-7.857422 6.32813,-2.689453 15.24023,-2.689453 14.55469,0 21.88477,6.380859 7.38281,6.38086 7.75195,17.033203 l -15.60937,0.685547 q -1.00195,-5.958984 -4.32422,-8.542968 -3.26953,-2.636719 -9.86133,-2.636719 -6.80273,0 -10.65234,2.794922 -2.47852,1.792968 -2.47852,4.798828 0,2.742187 2.32031,4.693359 2.95313,2.478516 14.34375,5.167969 11.39063,2.689453 16.82227,5.589844 5.48438,2.847656 8.54297,7.857422 3.11133,4.957031 3.11133,12.287109 0,6.644531 -3.69141,12.445312 -3.69141,5.8007816 -10.44141,8.6484379 -6.75,2.7949218 -16.82226,2.7949218 -14.66016,0 -22.51758,-6.7499999 -7.85742,-6.8027348 -9.38672,-19.7753908 z";

// A glyph (outlined, relative to translate(937.71, 92.65))
const A_GLYPH_D = "M 77.572266,0 H 60.591797 l -6.75,-17.560547 H 22.939453 L 16.558594,0 H 0 l 30.111328,-77.308594 h 16.505859 z m -28.740235,-30.585937 -10.652344,-28.6875 -10.441406,28.6875 z";

// SVG coordinate space: viewBox 0 0 1060.82 133.31
// Layout in 1080x1920 portrait:
//   Stacked (B layout): line1="HUMANITARIANS", line2="AI" each fills width
//   Marquee (A layout): full wordmark scrolling horizontally
//   Rotate (C layout): 90° spine
//   Focus/crop (D layout): panning along wordmark

// ── Utility ───────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const iclamp = (v: number, i: [number,number], o: [number,number]) =>
  clamp(interpolate(v, i, o), Math.min(o[0], o[1]), Math.max(o[0], o[1]));

// Spark SVG icon

// Technique label overlay — segment title + subline
const TechLabel: React.FC<{ name: string; sub?: string; progress?: number }> = ({
  name, sub, progress = 1,
}) => {
  const o = clamp(progress, 0, 1);
  return (
    <div style={{
      position: 'absolute', top: '7%', left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 6, pointerEvents: 'none', opacity: o,
      transform: `translateY(${(1 - o) * -12}px)`,
    }}>
      <div style={{
        fontFamily: SERIF, fontSize: 32, fontWeight: 600,
        color: INK, letterSpacing: '-0.01em', textAlign: 'center',
      }}>{name}</div>
      {/* Terracotta underline — the ONE accent */}
      <div style={{ width: 48, height: 2.5, background: SPARK, borderRadius: 2 }} />
      {sub && <div style={{
        fontFamily: SANS, fontSize: 17, color: CLAUDE.INK_SOFT,
        letterSpacing: 1, textTransform: 'uppercase' as const, marginTop: 2,
      }}>{sub}</div>}
    </div>
  );
};

// Full-frame wordmark rendered as inline SVG (both lines, stacked, layout B)
// The wordmark is 1060.82 × 133.31. In stacked layout:
//   Line1 "HUMANITARIANS" ≈ the first 920px of the viewbox width
//   Line2 "AI" ≈ the last 140px
// We render two separate SVGs, each scaled to fill 1080px wide.
const WordmarkLine1: React.FC<{
  fill?: string;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ fill = INK, opacity = 1, style }) => (
  <svg
    viewBox="0 0 1060.82 133.31"
    width="100%"
    height="auto"
    style={{ display: 'block', opacity, ...style }}
    preserveAspectRatio="xMidYMid meet"
  >
    <g fill={fill}>
      {/* H ligature */}
      <path d={H_MARK_P1} />
      <path d={H_MARK_P2} />
      {/* UMANITARIANS */}
      <g transform="translate(80.55,92.65)">
        <path d={UMANITARIANS_D} />
      </g>
      {/* A glyph */}
      <g transform="translate(937.71,92.65)">
        <path d={A_GLYPH_D} />
      </g>
      {/* AI diagonal mark */}
      <path d={AI_MARK_PATH} />
    </g>
  </svg>
);

// Per-glyph wordmark split — for techniques that need individual letter control.
// We use a simplified per-letter approach with SVG text characters indexed.
// The wordmark letters in order: H(ligature), U, M, A, N, I, T, A, R, I, A, N, S,
//                                 A(text), I(from word), A(glyph), I(diagonal mark)
// For animation purposes, we treat the SVG as 14 logical "slots":
// slot 0 = H-mark, slots 1-13 = UMANITARIANS letters, slot 14 = A glyph, slot 15 = AI diagonal

// Simplified per-letter by rendering the full wordmark with transform tricks on subpaths.
// For cascade/flip/typewriter, we use individual character rendering via positioned spans
// (the outlined paths aren't trivially splittable, so we use CSS approach for these).

// ── Per-character span wordmark for CSS-driven techniques ────────────────────
const CHARS = ['H','U','M','A','N','I','T','A','R','I','A','N','S',' ','A','I'];
// Approximate widths as fraction of total (rough, for positioning)
// Total width ≈ 1060. H=88, U=84, M=94, A=82, N=76, I=16, T=70, A=82, R=94, I=16, A=82, N=76, S=80, gap=12, A=78, I=37(diagonal)
const CHAR_WIDTHS = [88,84,94,82,76,16,70,82,94,16,82,76,80,12,78,37];

// ── B01: Letter Cascade ───────────────────────────────────────────────────────
const B01_LetterCascade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const letters = ['H','U','M','A','N','I','T','A','R','I','A','N','S'];
  const STAGGER = 4;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Letter Cascade" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* Line 1: H + UMANITARIANS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          {letters.map((ch, i) => {
            const s = spring({
              frame: frame - i * STAGGER,
              fps,
              config: { damping: 22, stiffness: 180, mass: 0.7 },
            });
            return (
              <div key={i} style={{
                fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
                fontWeight: 900,
                fontSize: 86,
                color: INK,
                lineHeight: 1,
                opacity: clamp(s, 0, 1),
                transform: `translateY(${(1 - clamp(s, 0, 1)) * 60}px)`,
              }}>{ch}</div>
            );
          })}
        </div>
        {/* Line 2: AI */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {['A','I'].map((ch, i) => {
            const s = spring({
              frame: frame - (letters.length + 2 + i) * STAGGER,
              fps,
              config: { damping: 22, stiffness: 180, mass: 0.7 },
            });
            return (
              <div key={i} style={{
                fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
                fontWeight: 900,
                fontSize: 340,
                color: INK,
                lineHeight: 0.85,
                letterSpacing: '-0.02em',
                opacity: clamp(s, 0, 1),
                transform: `translateY(${(1 - clamp(s, 0, 1)) * 120}px)`,
              }}>{ch}</div>
            );
          })}
        </div>
      </div>
      {/* Terracotta accent rule bottom */}
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B02: Word Slam ────────────────────────────────────────────────────────────
const B02_WordSlam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const line1In = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 280, mass: 1.2 } });
  const SLAM_FRAME = 50;
  const line2In = spring({ frame: frame - SLAM_FRAME, fps, config: { damping: 12, stiffness: 400, mass: 1.5 } });

  // Screen shake on line2 slam
  const shakeAmt = interpolate(frame, [SLAM_FRAME, SLAM_FRAME + 4, SLAM_FRAME + 8, SLAM_FRAME + 12], [0, 12, -8, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Word Slam" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{
        width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        transform: `translateX(${shakeAmt}px) translateY(${-shakeAmt * 0.5}px)`,
      }}>
        {/* HUMANITARIANS — slides down from above */}
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 75, color: INK, lineHeight: 1,
          letterSpacing: '-0.01em', textAlign: 'center',
          opacity: clamp(line1In, 0, 1),
          transform: `translateY(${(1 - clamp(line1In, 0, 1)) * -120}px)`,
        }}>HUMANITARIANS</div>
        {/* AI — slams up from below */}
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 340, color: INK, lineHeight: 0.85,
          letterSpacing: '-0.03em', textAlign: 'center',
          opacity: clamp(line2In, 0, 1),
          transform: `translateY(${(1 - clamp(line2In, 0, 1)) * 200}px) scaleY(${clamp(line2In, 0, 1) * 0.3 + 0.7})`,
        }}>AI</div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B03: Draw-On Glyphs ───────────────────────────────────────────────────────
const B03_DrawOnGlyphs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // Animate strokeDashoffset to "draw" the letters, then fill flood
  const DRAW_DUR = 90; // frames to draw
  const FILL_START = 100;
  const drawProgress = clamp(frame / DRAW_DUR, 0, 1);
  const fillProgress = iclamp(frame, [FILL_START, FILL_START + 30], [0, 1]);

  // Simplified: animate a single SVG with stroke-dashoffset
  // We use a large estimatedLength for the stroke
  const estimatedLength = 8000;
  const dashOffset = estimatedLength * (1 - drawProgress);

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Draw-On Glyphs" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* Line 1: HUMANITARIANS drawn on */}
        <svg viewBox="0 0 1060.82 133.31" width="100%" height="auto" style={{ display: 'block' }}>
          <g
            fill={`rgba(61,57,41,${fillProgress})`}
            stroke={SPARK}
            strokeWidth={3}
            strokeDasharray={estimatedLength}
            strokeDashoffset={dashOffset}
            style={{ paintOrder: 'stroke' }}
          >
            <path d={H_MARK_P1} />
            <path d={H_MARK_P2} />
            <g transform="translate(80.55,92.65)"><path d={UMANITARIANS_D} /></g>
            <g transform="translate(937.71,92.65)"><path d={A_GLYPH_D} /></g>
            <path d={AI_MARK_PATH} />
          </g>
        </svg>
        {/* Line 2: AI drawn on (offset stagger) */}
        <div style={{ fontSize: 240, fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, color: INK, lineHeight: 1, opacity: iclamp(frame, [DRAW_DUR * 0.6, DRAW_DUR * 0.6 + 20], [0, 1]) }}>AI</div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B04: Baseline Wave ────────────────────────────────────────────────────────
const B04_BaselineWave: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });
  const SETTLE_START = 160;
  const settled = frame > SETTLE_START;

  const letters = 'HUMANITARIANS'.split('');
  const WAVE_FREQ = 0.4;
  const WAVE_AMP = 32;
  const WAVE_SPEED = 0.12;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Baseline Wave" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {letters.map((ch, i) => {
            const waveY = settled ? 0 : WAVE_AMP * Math.sin(i * WAVE_FREQ + frame * WAVE_SPEED);
            const settleProgress = settled ? spring({ frame: frame - SETTLE_START, fps, config: { damping: 20, stiffness: 200 } }) : 0;
            const finalY = settled ? waveY * (1 - settleProgress) : waveY;
            return (
              <div key={i} style={{
                fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
                fontWeight: 900, fontSize: 80, color: INK, lineHeight: 1,
                transform: `translateY(${finalY}px)`,
                display: 'inline-block',
              }}>{ch}</div>
            );
          })}
        </div>
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 320, color: INK, lineHeight: 0.9,
          letterSpacing: '-0.03em',
        }}>AI</div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B05: Tracking Breathe ─────────────────────────────────────────────────────
const B05_TrackingBreathe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // Expand then contract — one breath
  const breathe = Math.sin(frame * 0.06) * 0.5 + 0.5;  // 0→1→0
  const letterSpacing = interpolate(breathe, [0, 1], ['-0.01em', '0.22em']);

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Tracking Breathe" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '92%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 66, color: INK, lineHeight: 1,
          letterSpacing, textAlign: 'center', whiteSpace: 'nowrap',
        }}>HUMANITARIANS</div>
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 300, color: INK, lineHeight: 0.9,
          letterSpacing: interpolate(breathe, [0, 1], ['-0.04em', '0.30em']),
        }}>AI</div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B06: Typewriter ───────────────────────────────────────────────────────────
const B06_Typewriter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const TICK = 6; // frames per character
  const fullText = 'HUMANITARIANS AI';
  const charCount = Math.floor(frame / TICK);
  const shown = fullText.slice(0, charCount);
  const blink = Math.floor(frame / 10) % 2 === 0;
  const done = charCount >= fullText.length;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Typewriter" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '88%', textAlign: 'center' }}>
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 76, color: INK, lineHeight: 1.1,
          letterSpacing: '-0.01em',
          display: 'inline',
        }}>
          {shown.slice(0, 13)}{/* HUMANITARIANS */}
          {charCount < 14 && blink && !done && (
            <span style={{ display: 'inline-block', width: 4, height: 70, background: SPARK, verticalAlign: 'text-bottom', marginLeft: 3 }} />
          )}
        </div>
        <br />
        <div style={{ display: 'inline' }}>
          <span style={{
            fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
            fontWeight: 900, fontSize: 320, color: INK, lineHeight: 0.9, letterSpacing: '-0.02em',
          }}>{shown.length >= 14 ? shown.slice(14) : ''}</span>
          {charCount >= 14 && !done && blink && (
            <span style={{ display: 'inline-block', width: 8, height: 250, background: SPARK, verticalAlign: 'text-bottom', marginLeft: 4 }} />
          )}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B07: Mask Wipe ────────────────────────────────────────────────────────────
const B07_MaskWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // Forward wipe: 0→60, hold 60→140, reverse: 140→200
  const fwd = iclamp(frame, [15, 75], [0, 100]);
  const rev = iclamp(frame, [140, 200], [100, 0]);
  const clipPct = frame < 140 ? fwd : rev;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <TechLabel name="Mask Wipe" sub="Marquee · Layout A" progress={labelIn} />
      {/* Full-width horizontal marquee at natural size */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 2160, // oversized to allow full scrolling
        whiteSpace: 'nowrap',
        clipPath: `inset(0 ${100 - clipPct}% 0 0)`,
        willChange: 'clip-path',
      }}>
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 120, color: INK, lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>HUMANITARIANS AI</div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B08: Highlight Sweep ──────────────────────────────────────────────────────
const B08_HighlightSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // A bright band sweeps left→right once
  const SWEEP_START = 20;
  const SWEEP_DUR = 120;
  const sweepPos = iclamp(frame, [SWEEP_START, SWEEP_START + SWEEP_DUR], [-15, 115]); // % of width

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Highlight Sweep" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative' }}>
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 75, color: INK, lineHeight: 1,
          letterSpacing: '-0.01em', textAlign: 'center', position: 'relative',
        }}>
          HUMANITARIANS
          {/* Highlight band overlay */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${sweepPos - 12}%`,
            width: '24%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
            pointerEvents: 'none',
          }} />
        </div>
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 340, color: INK, lineHeight: 0.85,
          letterSpacing: '-0.03em', position: 'relative',
        }}>
          AI
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${sweepPos - 12}%`,
            width: '24%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B09: Ligature Spotlight ───────────────────────────────────────────────────
const B09_LigatureSpotlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const SPIN_SPEED = 0.025;
  const hRot = frame * SPIN_SPEED * (180 / Math.PI);
  const aiRot = -frame * SPIN_SPEED * (180 / Math.PI);

  // Plain letters dim to 20%
  const plainOpacity = 0.2;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Ligature Spotlight" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {/* HUMANITARIANS with H at full, rest dimmed */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* H ligature — rotates */}
          <div style={{
            fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 80,
            color: SPARK, lineHeight: 1,
            transform: `rotate(${hRot}deg)`,
            display: 'inline-block',
          }}>H</div>
          {/* UMANITARIANS — dimmed */}
          <div style={{
            fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 80,
            color: INK, lineHeight: 1, opacity: plainOpacity, letterSpacing: '-0.01em',
          }}>UMANITARIANS</div>
        </div>
        {/* AI — A dimmed, I diagonal rotates */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{
            fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340,
            color: INK, lineHeight: 0.85, opacity: plainOpacity,
          }}>A</div>
          <div style={{
            fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340,
            color: SPARK, lineHeight: 0.85,
            transform: `rotate(${aiRot}deg)`,
            display: 'inline-block',
          }}>I</div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B10: Per-Letter Flip ──────────────────────────────────────────────────────
const B10_PerLetterFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const letters = 'HUMANITARIANS'.split('');
  const STAGGER = 6;
  const FLIP_DUR = 20;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Per-Letter Flip" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 600 }}>
          {letters.map((ch, i) => {
            const localFrame = frame - i * STAGGER;
            const flipAngle = interpolate(localFrame, [0, FLIP_DUR], [90, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const opacity = localFrame < 0 ? 0 : 1;
            return (
              <div key={i} style={{
                fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 82,
                color: INK, lineHeight: 1, display: 'inline-block', opacity,
                transform: `rotateX(${flipAngle}deg)`,
                transformOrigin: '50% 50%',
              }}>{ch}</div>
            );
          })}
        </div>
        <div style={{ display: 'flex', perspective: 600 }}>
          {['A','I'].map((ch, i) => {
            const localFrame = frame - (letters.length + 2 + i) * STAGGER;
            const flipAngle = interpolate(localFrame, [0, FLIP_DUR], [90, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            const opacity = localFrame < 0 ? 0 : 1;
            return (
              <div key={i} style={{
                fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340,
                color: INK, lineHeight: 0.85, display: 'inline-block', opacity,
                transform: `rotateX(${flipAngle}deg)`,
                transformOrigin: '50% 50%',
              }}>{ch}</div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B11: Scale Focus ──────────────────────────────────────────────────────────
const B11_ScaleFocus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // Push in to AI ligature then back out
  const MID = durationInFrames / 2;
  const scale = frame < MID
    ? interpolate(frame, [15, MID], [1, 6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(frame, [MID, durationInFrames - 20], [6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Translate to keep AI ligature centered (it's at ~93% of wordmark width)
  const tx = (scale - 1) * -420; // push left as we zoom to keep AI mark in center

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <TechLabel name="Scale Focus" sub="Focus Crop · Layout D" progress={labelIn} />
      <div style={{
        transform: `scale(${scale}) translateX(${tx}px)`,
        transformOrigin: '80% 50%',
        width: '90%',
      }}>
        <WordmarkLine1 />
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B12: Blur Depth ───────────────────────────────────────────────────────────
const B12_BlurDepth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const letters = 'HUMANITARIANS'.split('');
  const RACK_SPEED = 8; // frames per letter to sharpen

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Blur Depth" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {letters.map((ch, i) => {
            // Each letter starts blurred, sharpens in sequence
            const sharpFrame = i * RACK_SPEED;
            const blur = Math.max(0, interpolate(frame, [sharpFrame, sharpFrame + RACK_SPEED * 1.5], [12, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            }));
            return (
              <div key={i} style={{
                fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 82,
                color: INK, lineHeight: 1, display: 'inline-block',
                filter: `blur(${blur}px)`,
              }}>{ch}</div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {['A','I'].map((ch, i) => {
            const sharpFrame = (letters.length + i) * RACK_SPEED;
            const blur = Math.max(0, interpolate(frame, [sharpFrame, sharpFrame + RACK_SPEED * 1.5], [12, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            }));
            return (
              <div key={i} style={{
                fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340,
                color: INK, lineHeight: 0.85, display: 'inline-block',
                filter: `blur(${blur}px)`,
              }}>{ch}</div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B13: Color Interpolation ──────────────────────────────────────────────────
// Treatment beat — labeled as such. Ink → terracotta → ink, letter by letter.
const B13_ColorInterp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const letters = 'HUMANITARIANS'.split('');
  const STAGGER = 12;
  const HALF = durationInFrames / 2;

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  };
  const lerp = (a: number[], b: number[], t: number) => a.map((v,i) => Math.round(v + (b[i]-v)*t));
  const toHex = (rgb: number[]) => '#' + rgb.map(v => v.toString(16).padStart(2,'0')).join('');

  const inkRgb = hexToRgb(INK);
  const sparkRgb = hexToRgb(SPARK);

  const getColor = (i: number) => {
    const localFrame = frame - i * STAGGER;
    const t = Math.sin(Math.max(0, localFrame) * 0.04) * 0.5 + 0.5;
    return toHex(lerp(inkRgb, sparkRgb, t));
  };

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Color Interpolation" sub="Stacked · Layout B · treatment" progress={labelIn} />
      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {letters.map((ch, i) => (
            <div key={i} style={{
              fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 82,
              color: getColor(i), lineHeight: 1, display: 'inline-block',
            }}>{ch}</div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {['A','I'].map((ch, i) => (
            <div key={i} style={{
              fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340,
              color: getColor(letters.length + i * 4), lineHeight: 0.85, display: 'inline-block',
            }}>{ch}</div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B14: Elastic Physics ──────────────────────────────────────────────────────
const B14_ElasticPhysics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const DROP_START = 20;
  // Spring with very low damping for elastic feel
  const elastic = spring({
    frame: frame - DROP_START,
    fps,
    config: { damping: 6, stiffness: 200, mass: 1.0 },
  });

  const ty = (1 - clamp(elastic, 0, 2)) * -300;
  const scaleY = 0.8 + clamp(elastic, 0, 1) * 0.2;
  const scaleX = 2 - scaleY;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Elastic Physics" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{
        width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        transform: `translateY(${ty}px) scaleY(${scaleY}) scaleX(${scaleX})`,
        transformOrigin: '50% 100%',
      }}>
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 76,
          color: INK, lineHeight: 1, letterSpacing: '-0.01em', textAlign: 'center',
        }}>HUMANITARIANS</div>
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340,
          color: INK, lineHeight: 0.85, letterSpacing: '-0.03em',
        }}>AI</div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B15: Glitch Slices ────────────────────────────────────────────────────────
const B15_GlitchSlices: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const GLITCH_START = 20;
  const GLITCH_DUR = 40;
  const SNAP_START = GLITCH_START + GLITCH_DUR;

  const glitchProgress = iclamp(frame, [GLITCH_START, SNAP_START], [1, 0]);

  // 5 horizontal slices, each with a random-seeded offset
  const sliceCount = 5;
  const slices = Array.from({ length: sliceCount }, (_, i) => {
    const seed = (i * 137 + 42) % 100;
    const maxOffset = 40 * glitchProgress;
    const dir = i % 2 === 0 ? 1 : -1;
    return dir * (seed / 100) * maxOffset;
  });

  return (
    <AbsoluteFill style={{ background: PAGE, overflow: 'hidden' }}>
      <TechLabel name="Glitch Slices" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%' }}>
        {slices.map((offset, i) => {
          const topPct = (i / sliceCount) * 100;
          const heightPct = 100 / sliceCount;
          return (
            <div key={i} style={{
              position: 'absolute',
              top: `${topPct}%`,
              left: 0, right: 0,
              height: `${heightPct}%`,
              overflow: 'hidden',
              transform: `translateX(${offset}px)`,
            }}>
              <div style={{
                position: 'absolute',
                top: `-${topPct}%`,
                left: 0, right: 0,
                height: '500%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 75, color: INK, lineHeight: 1, textAlign: 'center' }}>HUMANITARIANS</div>
                <div style={{ fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340, color: INK, lineHeight: 0.85 }}>AI</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B16: Kinetic Stack ────────────────────────────────────────────────────────
const B16_KineticStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // Two lines ripple against each other
  const SPEED = 0.06;
  const line1Offset = Math.sin(frame * SPEED) * 28;
  const line2Offset = Math.sin(frame * SPEED + Math.PI) * 28; // counter-phase

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Kinetic Stack" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 76,
          color: INK, lineHeight: 1, letterSpacing: '-0.01em', textAlign: 'center',
          transform: `translateX(${line1Offset}px)`,
        }}>HUMANITARIANS</div>
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 360,
          color: INK, lineHeight: 0.85, letterSpacing: '-0.03em',
          transform: `translateX(${line2Offset}px)`,
        }}>AI</div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B17: Marquee Loop ─────────────────────────────────────────────────────────
const B17_MarqueeLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  // Three speed phases
  const PHASE1_END = durationInFrames * 0.33;
  const PHASE2_END = durationInFrames * 0.66;

  let speed: number;
  if (frame < PHASE1_END) speed = 1.2;       // slow
  else if (frame < PHASE2_END) speed = 3.5;  // medium
  else speed = 8;                             // fast

  const totalMove = frame * speed;
  const wordWidth = 1600; // approximate px width of text at fontSize 110
  const offset = -(totalMove % wordWidth);

  return (
    <AbsoluteFill style={{ background: PAGE, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Marquee Loop" sub="Marquee · Layout A" progress={labelIn} />
      {/* Speed label */}
      <div style={{
        position: 'absolute', top: '18%', left: 0, right: 0, textAlign: 'center',
        fontFamily: SANS, fontSize: 18, fontWeight: 700, letterSpacing: 3,
        textTransform: 'uppercase' as const, color: SPARK,
      }}>
        {frame < PHASE1_END ? 'SLOW' : frame < PHASE2_END ? 'MEDIUM' : 'FAST'}
      </div>
      {/* Marquee strip */}
      <div style={{
        position: 'absolute', top: '42%',
        display: 'flex', whiteSpace: 'nowrap',
        transform: `translateX(${offset}px) translateY(-50%)`,
      }}>
        {[0,1,2].map(k => (
          <div key={k} style={{
            fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900,
            fontSize: 110, color: INK, lineHeight: 1, letterSpacing: '-0.02em',
            paddingRight: 80,
          }}>HUMANITARIANS AI</div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B18: Assembly ─────────────────────────────────────────────────────────────
const B18_Assembly: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const letters = 'HUMANITARIANS AI'.split('');
  const STAGGER = 8;

  // Each letter has a deterministic start position based on its index
  const getStartPos = (i: number) => ({
    x: ((i * 137) % 240) - 120,
    y: ((i * 97 + 43) % 400) - 200,
    r: ((i * 71) % 360) - 180,
  });

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <TechLabel name="Assembly" sub="Stacked · Layout B" progress={labelIn} />
      <div style={{ width: '90%', position: 'relative' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
          {letters.slice(0,13).map((ch, i) => {
            const { x, y, r } = getStartPos(i);
            const s = spring({ frame: frame - i * STAGGER, fps, config: { damping: 18, stiffness: 200, mass: 0.9 } });
            const sc = clamp(s, 0, 1);
            return (
              <div key={i} style={{
                fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 82,
                color: INK, lineHeight: 1, display: 'inline-block',
                transform: `translateX(${x * (1-sc)}px) translateY(${y * (1-sc)}px) rotate(${r * (1-sc)}deg)`,
                opacity: clamp(s * 2, 0, 1),
              }}>{ch}</div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {letters.slice(14).map((ch, i) => {
            const { x, y, r } = getStartPos(i + 14);
            const s = spring({ frame: frame - (14 + i) * STAGGER, fps, config: { damping: 18, stiffness: 200, mass: 0.9 } });
            const sc = clamp(s, 0, 1);
            return (
              <div key={i} style={{
                fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340,
                color: INK, lineHeight: 0.85, display: 'inline-block',
                transform: `translateX(${x * (1-sc)}px) translateY(${y * (1-sc)}px) rotate(${r * (1-sc)}deg)`,
                opacity: clamp(s * 2, 0, 1),
              }}>{ch}</div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── B19: Exit Family ──────────────────────────────────────────────────────────
const B19_ExitFamily: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const THIRD = Math.floor(durationInFrames / 3);
  const phase = frame < THIRD ? 0 : frame < THIRD * 2 ? 1 : 2;
  const localFrame = frame - phase * THIRD;

  // Exit 1: Letter-drop (letters fall off screen)
  // Exit 2: Blur-out
  // Exit 3: Wipe-close (clip-path closes left)
  const letters = 'HUMANITARIANS'.split('');

  const exit1 = (
    <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {letters.map((ch, i) => {
          const DROP_START = i * 4;
          const ty = Math.max(0, (localFrame - DROP_START) * 18);
          const op = Math.max(0, 1 - (localFrame - DROP_START) / 15);
          return (
            <div key={i} style={{
              fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 82,
              color: INK, lineHeight: 1, display: 'inline-block',
              transform: `translateY(${ty}px)`, opacity: op,
            }}>{ch}</div>
          );
        })}
      </div>
      <div style={{
        fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340,
        color: INK, lineHeight: 0.85,
        transform: `translateY(${Math.max(0, (localFrame - 30) * 24)}px)`,
        opacity: Math.max(0, 1 - Math.max(0, (localFrame - 30)) / 18),
      }}>AI</div>
    </div>
  );

  const blurAmt = Math.min(20, localFrame * 0.5);
  const exit2 = (
    <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, filter: `blur(${blurAmt}px)`, opacity: Math.max(0, 1 - localFrame / 30) }}>
      <div style={{ fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 76, color: INK, lineHeight: 1, textAlign: 'center' }}>HUMANITARIANS</div>
      <div style={{ fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340, color: INK, lineHeight: 0.85 }}>AI</div>
    </div>
  );

  const wipeAmt = clamp(localFrame / 40, 0, 1);
  const exit3 = (
    <div style={{ width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, clipPath: `inset(0 ${wipeAmt * 100}% 0 0)` }}>
      <div style={{ fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 76, color: INK, lineHeight: 1, textAlign: 'center' }}>HUMANITARIANS</div>
      <div style={{ fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 340, color: INK, lineHeight: 0.85 }}>AI</div>
    </div>
  );

  const phaseLabel = phase === 0 ? 'Exit 1 · Letter Drop' : phase === 1 ? 'Exit 2 · Blur Out' : 'Exit 3 · Wipe Close';

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Exit Family" sub={phaseLabel} progress={labelIn} />
      {phase === 0 ? exit1 : phase === 1 ? exit2 : exit3}
      <div style={{ position: 'absolute', bottom: '8%', left: '8%', width: 60, height: 2, background: SPARK, opacity: clamp(labelIn, 0, 1) }} />
    </AbsoluteFill>
  );
};

// ── Timing accumulator ────────────────────────────────────────────────────────
const TIMED = TIMING.map(t => ({ ...t }));
export const TOTAL_FRAMES = TIMED.reduce((a, b) => a + b.frames, 0);

// ── Main composition ──────────────────────────────────────────────────────────
export const HaiWordmarkShowcase: React.FC = () => {
  let at = 0;

  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;

    let content: React.ReactNode = null;

    switch (t.id) {
      // ── B00 — Cold open ──────────────────────────────────────────────────
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Ciao, Liam',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'animate HUMANITARIANS AI wordmark — every Remotion technique — for review',
            runningText: 'loading technique showcase…',
            folderLabel: FOLDER,
            output: [
              '19 techniques loaded',
              'outlined SVG ready',
              'Kokoro am_onyx narration locked',
            ],
          })} />
        );
        break;

      case 'B01': content = <B01_LetterCascade />; break;
      case 'B02': content = <B02_WordSlam />; break;
      case 'B03': content = <B03_DrawOnGlyphs />; break;
      case 'B04': content = <B04_BaselineWave />; break;
      case 'B05': content = <B05_TrackingBreathe />; break;
      case 'B06': content = <B06_Typewriter />; break;
      case 'B07': content = <B07_MaskWipe />; break;
      case 'B08': content = <B08_HighlightSweep />; break;
      case 'B09': content = <B09_LigatureSpotlight />; break;
      case 'B10': content = <B10_PerLetterFlip />; break;
      case 'B11': content = <B11_ScaleFocus />; break;
      case 'B12': content = <B12_BlurDepth />; break;
      case 'B13': content = <B13_ColorInterp />; break;
      case 'B14': content = <B14_ElasticPhysics />; break;
      case 'B15': content = <B15_GlitchSlices />; break;
      case 'B16': content = <B16_KineticStack />; break;
      case 'B17': content = <B17_MarqueeLoop />; break;
      case 'B18': content = <B18_Assembly />; break;
      case 'B19': content = <B19_ExitFamily />; break;

      // ── B20 — Your Turn (handoff) ────────────────────────────────────────
      case 'B20':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Your turn.',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Animate my SVG wordmark with these techniques: Letter Cascade, Elastic Physics, Mask Wipe. Build each as a Remotion scene at 1080×1920, 30fps, cream #FAF9F5 background, ink #3D3929 text, terracotta #D97757 accent. Export as separate mp4s for review.',
            runningText: 'paste this into Claude…',
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B21 — Outro ──────────────────────────────────────────────────────
      case 'B21':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: 'One Wordmark, Every Move Remotion Knows.',
            handle: '@NikBearBrown',
            subline: 'Liam, in for Bear.',
          })} />
        );
        break;

      default:
        content = (
          <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: SERIF, fontSize: 48, color: INK }}>{t.id}</div>
          </AbsoluteFill>
        );
    }

    return (
      <Sequence key={t.id} from={from} durationInFrames={t.frames} name={t.id}>
        {content}
        {t.audio && (
          <Audio src={staticFile(t.audio)} />
        )}
      </Sequence>
    );
  });

  return <AbsoluteFill>{seqs}</AbsoluteFill>;
};
