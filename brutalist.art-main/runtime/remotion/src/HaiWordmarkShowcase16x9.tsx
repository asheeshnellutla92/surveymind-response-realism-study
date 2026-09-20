/**
 * HaiWordmarkShowcase16x9 — claude-liam · 1920×1080 · 30fps
 * One wordmark. Every motion technique Remotion knows. Landscape edition.
 *
 * Palette: CLAUDE fidelity brand (cream #FAF9F5, ink #3D3929, terracotta #D97757)
 * Voice:   Liam (am_onyx, Kokoro, in for Bear)
 * Channel: @NikBearBrown
 *
 * Layout adaptation from 1080×1920 (portrait) to 1920×1080 (landscape):
 * - Wordmark is 1060.82×133.31 — fits naturally at full width in 16:9
 * - Layout H (Horizontal): full wordmark centered, single row — replaces Layout B
 * - Layout A (Marquee): same as portrait, but uses the wider frame
 * - Layout D (Focus Crop): same zoom technique, wider panning range
 * - Layout K (Kinetic Stack): two stacked rows with opposing lateral motion
 *   (B16 only — the one technique that benefits from vertical rhythm)
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

// ── Utility ───────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const iclamp = (v: number, i: [number,number], o: [number,number]) =>
  clamp(interpolate(v, i, o), Math.min(o[0], o[1]), Math.max(o[0], o[1]));

// ── Full-frame inline SVG wordmark (landscape: fills 90% of 1920px width) ────
// In landscape, the wordmark renders as a single row — no stacking needed.
// viewBox 0 0 1060.82 133.31 → at 90% of 1920px = 1728px wide → height ≈ 217px
const WordmarkSVG: React.FC<{
  fill?: string;
  opacity?: number;
  style?: React.CSSProperties;
  width?: string | number;
}> = ({ fill = INK, opacity = 1, style, width = '90%' }) => (
  <svg
    viewBox="0 0 1060.82 133.31"
    width={width}
    height="auto"
    style={{ display: 'block', opacity, ...style }}
    preserveAspectRatio="xMidYMid meet"
  >
    <g fill={fill}>
      <path d={H_MARK_P1} />
      <path d={H_MARK_P2} />
      <g transform="translate(80.55,92.65)">
        <path d={UMANITARIANS_D} />
      </g>
      <g transform="translate(937.71,92.65)">
        <path d={A_GLYPH_D} />
      </g>
      <path d={AI_MARK_PATH} />
    </g>
  </svg>
);

// ── Technique label overlay — landscape layout ─────────────────────────────
// In 16:9, the label sits at top (12% from top), centered.
// The terracotta underline rule is the ONE accent per beat.
const TechLabel: React.FC<{ name: string; sub?: string; progress?: number }> = ({
  name, sub, progress = 1,
}) => {
  const o = clamp(progress, 0, 1);
  return (
    <div style={{
      position: 'absolute', top: '8%', left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 6, pointerEvents: 'none', opacity: o,
      transform: `translateY(${(1 - o) * -12}px)`,
    }}>
      <div style={{
        fontFamily: SERIF, fontSize: 36, fontWeight: 600,
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

// ── Spark accent rule (bottom-left) ───────────────────────────────────────────
const SparkRule: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{
    position: 'absolute', bottom: '8%', left: '5%',
    width: 60, height: 2, background: SPARK, opacity,
  }} />
);

// ── B01: Letter Cascade ───────────────────────────────────────────────────────
// Landscape: letters spring in left-to-right in a single horizontal row.
const B01_LetterCascade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const letters = 'HUMANITARIANS AI'.split('');
  const STAGGER = 4;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Letter Cascade" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0 }}>
        {letters.map((ch, i) => {
          const s = spring({
            frame: frame - i * STAGGER,
            fps,
            config: { damping: 22, stiffness: 180, mass: 0.7 },
          });
          const isAI = i >= 14;
          return (
            <div key={i} style={{
              fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
              fontWeight: 900,
              fontSize: isAI ? 160 : 90,
              color: INK,
              lineHeight: 1,
              letterSpacing: '-0.01em',
              opacity: clamp(s, 0, 1),
              transform: `translateY(${(1 - clamp(s, 0, 1)) * 50}px)`,
            }}>{ch === ' ' ? ' ' : ch}</div>
          );
        })}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B02: Word Slam ────────────────────────────────────────────────────────────
// Landscape: HUMANITARIANS slides in from left, AI slams in from right.
const B02_WordSlam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const line1In = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 280, mass: 1.2 } });
  const SLAM_FRAME = 50;
  const line2In = spring({ frame: frame - SLAM_FRAME, fps, config: { damping: 12, stiffness: 400, mass: 1.5 } });

  // Screen shake on line2 slam
  const shakeAmt = interpolate(frame, [SLAM_FRAME, SLAM_FRAME + 4, SLAM_FRAME + 8, SLAM_FRAME + 12], [0, 10, -6, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Word Slam" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 32,
        transform: `translateX(${shakeAmt}px) translateY(${-shakeAmt * 0.3}px)`,
      }}>
        {/* HUMANITARIANS — slides in from left */}
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 90, color: INK, lineHeight: 1,
          letterSpacing: '-0.01em',
          opacity: clamp(line1In, 0, 1),
          transform: `translateX(${(1 - clamp(line1In, 0, 1)) * -300}px)`,
        }}>HUMANITARIANS</div>
        {/* AI — slams in from right */}
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 160, color: INK, lineHeight: 0.85,
          letterSpacing: '-0.03em',
          opacity: clamp(line2In, 0, 1),
          transform: `translateX(${(1 - clamp(line2In, 0, 1)) * 400}px) scaleX(${clamp(line2In, 0, 1) * 0.3 + 0.7})`,
        }}>AI</div>
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B03: Draw-On Glyphs ───────────────────────────────────────────────────────
// Landscape: the full-width SVG wordmark draws on in one pass.
const B03_DrawOnGlyphs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const DRAW_DUR = 90;
  const FILL_START = 100;
  const drawProgress = clamp(frame / DRAW_DUR, 0, 1);
  const fillProgress = iclamp(frame, [FILL_START, FILL_START + 30], [0, 1]);

  const estimatedLength = 8000;
  const dashOffset = estimatedLength * (1 - drawProgress);

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Draw-On Glyphs" sub="Horizontal · Layout H" progress={labelIn} />
      {/* Full-width SVG wordmark drawn on with stroke-dashoffset */}
      <div style={{ width: '90%' }}>
        <svg viewBox="0 0 1060.82 133.31" width="100%" height="auto" style={{ display: 'block' }}>
          <g
            fill={`rgba(61,57,41,${fillProgress})`}
            stroke={SPARK}
            strokeWidth={2.5}
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
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B04: Baseline Wave ────────────────────────────────────────────────────────
// Landscape: single horizontal row, each letter bobs on its baseline.
const B04_BaselineWave: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });
  const SETTLE_START = 160;
  const settled = frame > SETTLE_START;

  const letters = 'HUMANITARIANS AI'.split('');
  const WAVE_FREQ = 0.4;
  const WAVE_AMP = 28;
  const WAVE_SPEED = 0.12;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Baseline Wave" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
        {letters.map((ch, i) => {
          const isAI = i >= 14;
          const waveY = settled ? 0 : WAVE_AMP * Math.sin(i * WAVE_FREQ + frame * WAVE_SPEED);
          const settleProgress = settled ? spring({ frame: frame - SETTLE_START, fps, config: { damping: 20, stiffness: 200 } }) : 0;
          const finalY = settled ? waveY * (1 - settleProgress) : waveY;
          return (
            <div key={i} style={{
              fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
              fontWeight: 900, fontSize: isAI ? 160 : 90, color: INK, lineHeight: 1,
              transform: `translateY(${finalY}px)`,
              display: 'inline-block',
            }}>{ch === ' ' ? ' ' : ch}</div>
          );
        })}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B05: Tracking Breathe ─────────────────────────────────────────────────────
// Landscape: the full wordmark SVG width breathes in/out using overflow:hidden.
const B05_TrackingBreathe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const breathe = Math.sin(frame * 0.06) * 0.5 + 0.5;
  const letterSpacing = interpolate(breathe, [0, 1], ['-0.01em', '0.18em']);

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Tracking Breathe" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{ width: '92%', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 90, color: INK, lineHeight: 1,
          letterSpacing, whiteSpace: 'nowrap',
          display: 'inline-block',
        }}>HUMANITARIANS&nbsp;&nbsp;AI</div>
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B06: Typewriter ───────────────────────────────────────────────────────────
// Landscape: single-row typewriter, caret is terracotta spark.
const B06_Typewriter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const TICK = 6;
  const fullText = 'HUMANITARIANS AI';
  const charCount = Math.floor(frame / TICK);
  const shown = fullText.slice(0, charCount);
  const blink = Math.floor(frame / 10) % 2 === 0;
  const done = charCount >= fullText.length;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Typewriter" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
        <span style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 90, color: INK, lineHeight: 1,
          letterSpacing: '-0.01em', whiteSpace: 'nowrap',
        }}>{shown}</span>
        {!done && blink && (
          <span style={{
            display: 'inline-block', width: 5, height: 72, background: SPARK,
            verticalAlign: 'text-bottom', marginLeft: 3,
          }} />
        )}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B07: Mask Wipe ────────────────────────────────────────────────────────────
// Landscape: clip-path sweeps across the wider full-size wordmark.
const B07_MaskWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const fwd = iclamp(frame, [15, 75], [0, 100]);
  const rev = iclamp(frame, [140, 200], [100, 0]);
  const clipPct = frame < 140 ? fwd : rev;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <TechLabel name="Mask Wipe" sub="Marquee · Layout A" progress={labelIn} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '110%',
        clipPath: `inset(0 ${100 - clipPct}% 0 0)`,
        willChange: 'clip-path',
      }}>
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 110, color: INK, lineHeight: 1,
          letterSpacing: '-0.02em', whiteSpace: 'nowrap', textAlign: 'center',
        }}>HUMANITARIANS AI</div>
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B08: Highlight Sweep ──────────────────────────────────────────────────────
// Landscape: light band sweeps across the single-row full-width wordmark.
const B08_HighlightSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const SWEEP_START = 20;
  const SWEEP_DUR = 120;
  const sweepPos = iclamp(frame, [SWEEP_START, SWEEP_START + SWEEP_DUR], [-15, 115]);

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Highlight Sweep" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{ position: 'relative', width: '90%' }}>
        <div style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          fontWeight: 900, fontSize: 90, color: INK, lineHeight: 1,
          letterSpacing: '-0.01em', textAlign: 'center', position: 'relative',
        }}>
          HUMANITARIANS AI
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${sweepPos - 10}%`,
            width: '20%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B09: Ligature Spotlight ───────────────────────────────────────────────────
// Landscape: H and AI diagonal counter-rotate; plain letters dim.
// The wordmark is wide enough that the ligature marks are clearly separated.
const B09_LigatureSpotlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const SPIN_SPEED = 0.025;
  const hRot = frame * SPIN_SPEED * (180 / Math.PI);
  const aiRot = -frame * SPIN_SPEED * (180 / Math.PI);
  const plainOpacity = 0.18;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Ligature Spotlight" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0 }}>
        {/* H ligature — rotates, terracotta */}
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 90,
          color: SPARK, lineHeight: 1, display: 'inline-block',
          transform: `rotate(${hRot}deg)`,
        }}>H</div>
        {/* UMANITARIANS — dimmed */}
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 90,
          color: INK, lineHeight: 1, opacity: plainOpacity, letterSpacing: '-0.01em',
        }}>UMANITARIANS</div>
        {/* space */}
        <div style={{ width: 20 }} />
        {/* A — dimmed */}
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 160,
          color: INK, lineHeight: 0.85, opacity: plainOpacity,
        }}>A</div>
        {/* I diagonal — counter-rotates, terracotta */}
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 160,
          color: SPARK, lineHeight: 0.85, display: 'inline-block',
          transform: `rotate(${aiRot}deg)`,
        }}>I</div>
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B10: Per-Letter Flip ──────────────────────────────────────────────────────
// Landscape: letters card-flip in sequence along the single horizontal row.
const B10_PerLetterFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const letters = 'HUMANITARIANS AI'.split('');
  const STAGGER = 6;
  const FLIP_DUR = 20;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Per-Letter Flip" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', perspective: 800 }}>
        {letters.map((ch, i) => {
          const isAI = i >= 14;
          const localFrame = frame - i * STAGGER;
          const flipAngle = interpolate(localFrame, [0, FLIP_DUR], [90, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          const opacity = localFrame < 0 ? 0 : 1;
          return (
            <div key={i} style={{
              fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900,
              fontSize: isAI ? 160 : 90,
              color: INK, lineHeight: 1, display: 'inline-block', opacity,
              transform: `rotateX(${flipAngle}deg)`,
              transformOrigin: '50% 50%',
            }}>{ch === ' ' ? ' ' : ch}</div>
          );
        })}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B11: Scale Focus ──────────────────────────────────────────────────────────
// Landscape: the wider frame shows more context; zoom to AI ligature at right.
// The AI mark is at ~94.5% of wordmark width, so transformOrigin is 94.5% 50%.
const B11_ScaleFocus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const MID = durationInFrames / 2;
  const scale = frame < MID
    ? interpolate(frame, [15, MID], [1, 5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(frame, [MID, durationInFrames - 20], [5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <TechLabel name="Scale Focus" sub="Focus Crop · Layout D" progress={labelIn} />
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: '94.5% 50%',
        width: '90%',
      }}>
        <WordmarkSVG />
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B12: Blur Depth ───────────────────────────────────────────────────────────
// Landscape: rack focus left-to-right across the full horizontal wordmark.
const B12_BlurDepth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const letters = 'HUMANITARIANS AI'.split('');
  const RACK_SPEED = 7;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Blur Depth" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
        {letters.map((ch, i) => {
          const isAI = i >= 14;
          const sharpFrame = i * RACK_SPEED;
          const blur = Math.max(0, interpolate(frame, [sharpFrame, sharpFrame + RACK_SPEED * 1.5], [14, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          }));
          return (
            <div key={i} style={{
              fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900,
              fontSize: isAI ? 160 : 90,
              color: INK, lineHeight: 1, display: 'inline-block',
              filter: `blur(${blur}px)`,
            }}>{ch === ' ' ? ' ' : ch}</div>
          );
        })}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B13: Color Interpolation ──────────────────────────────────────────────────
// Treatment beat — ink → terracotta → ink, letter by letter across the row.
const B13_ColorInterp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const letters = 'HUMANITARIANS AI'.split('');
  const STAGGER = 10;

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
      <TechLabel name="Color Interpolation" sub="Horizontal · Layout H · treatment" progress={labelIn} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
        {letters.map((ch, i) => {
          const isAI = i >= 14;
          return (
            <div key={i} style={{
              fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900,
              fontSize: isAI ? 160 : 90,
              color: getColor(i), lineHeight: 1, display: 'inline-block',
            }}>{ch === ' ' ? ' ' : ch}</div>
          );
        })}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B14: Elastic Physics ──────────────────────────────────────────────────────
// Landscape: full wordmark drops as a unit, squashes at bottom, rebounds.
const B14_ElasticPhysics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const DROP_START = 20;
  const elastic = spring({
    frame: frame - DROP_START,
    fps,
    config: { damping: 6, stiffness: 200, mass: 1.0 },
  });

  const ty = (1 - clamp(elastic, 0, 2)) * -220;
  const scaleY = 0.8 + clamp(elastic, 0, 1) * 0.2;
  const scaleX = 2 - scaleY;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Elastic Physics" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{
        width: '90%',
        transform: `translateY(${ty}px) scaleY(${scaleY}) scaleX(${scaleX})`,
        transformOrigin: '50% 100%',
      }}>
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 90,
          color: INK, lineHeight: 1, letterSpacing: '-0.01em', textAlign: 'center',
        }}>HUMANITARIANS AI</div>
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B15: Glitch Slices ────────────────────────────────────────────────────────
// Landscape: horizontal slices offset, then snap clean.
// 7 slices across the tall-ish wordmark text block.
const B15_GlitchSlices: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const GLITCH_START = 20;
  const GLITCH_DUR = 40;
  const SNAP_START = GLITCH_START + GLITCH_DUR;
  const glitchProgress = iclamp(frame, [GLITCH_START, SNAP_START], [1, 0]);

  const sliceCount = 6;
  const slices = Array.from({ length: sliceCount }, (_, i) => {
    const seed = (i * 137 + 42) % 100;
    const maxOffset = 48 * glitchProgress;
    const dir = i % 2 === 0 ? 1 : -1;
    return dir * (seed / 100) * maxOffset;
  });

  // Container for the wordmark text block
  const BLOCK_HEIGHT = 130; // approximate px height at fontSize 90

  return (
    <AbsoluteFill style={{ background: PAGE, overflow: 'hidden' }}>
      <TechLabel name="Glitch Slices" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: BLOCK_HEIGHT }}>
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
                height: `${sliceCount * 100}%`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900,
                  fontSize: 90, color: INK, lineHeight: 1, textAlign: 'center',
                  letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                }}>HUMANITARIANS AI</div>
              </div>
            </div>
          );
        })}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B16: Kinetic Stack ────────────────────────────────────────────────────────
// In landscape, the stack is now two rows offset horizontally in opposing phase.
// This is the one beat that still benefits from a stacked layout — two wide
// lines of text moving against each other across the frame.
const B16_KineticStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const SPEED = 0.055;
  const line1Offset = Math.sin(frame * SPEED) * 40;
  const line2Offset = Math.sin(frame * SPEED + Math.PI) * 40;

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Kinetic Stack" sub="Kinetic Stack · Layout K" progress={labelIn} />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 110,
          color: INK, lineHeight: 1, letterSpacing: '-0.01em', textAlign: 'center',
          transform: `translateX(${line1Offset}px)`,
        }}>HUMANITARIANS</div>
        <div style={{
          fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900, fontSize: 110,
          color: INK, lineHeight: 1, letterSpacing: '-0.02em', textAlign: 'center',
          transform: `translateX(${line2Offset}px)`,
        }}>AI · HUMANITARIANS</div>
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B17: Marquee Loop ─────────────────────────────────────────────────────────
// Landscape: the marquee uses more of the wide frame; three speed phases.
const B17_MarqueeLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const PHASE1_END = durationInFrames * 0.33;
  const PHASE2_END = durationInFrames * 0.66;

  let speed: number;
  if (frame < PHASE1_END) speed = 1.5;
  else if (frame < PHASE2_END) speed = 4.0;
  else speed = 9;

  const totalMove = frame * speed;
  const wordWidth = 1900; // px at fontSize 110
  const offset = -(totalMove % wordWidth);

  return (
    <AbsoluteFill style={{ background: PAGE, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Marquee Loop" sub="Marquee · Layout A" progress={labelIn} />
      {/* Speed label */}
      <div style={{
        position: 'absolute', top: '22%', left: 0, right: 0, textAlign: 'center',
        fontFamily: SANS, fontSize: 18, fontWeight: 700, letterSpacing: 3,
        textTransform: 'uppercase' as const, color: SPARK,
      }}>
        {frame < PHASE1_END ? 'SLOW' : frame < PHASE2_END ? 'MEDIUM' : 'FAST'}
      </div>
      {/* Marquee strip */}
      <div style={{
        position: 'absolute', top: '44%',
        display: 'flex', whiteSpace: 'nowrap',
        transform: `translateX(${offset}px) translateY(-50%)`,
      }}>
        {[0,1,2,3].map(k => (
          <div key={k} style={{
            fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900,
            fontSize: 110, color: INK, lineHeight: 1, letterSpacing: '-0.02em',
            paddingRight: 100,
          }}>HUMANITARIANS AI</div>
        ))}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B18: Assembly ─────────────────────────────────────────────────────────────
// Landscape: scattered letters converge to their horizontal slots.
const B18_Assembly: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const letters = 'HUMANITARIANS AI'.split('');
  const STAGGER = 7;

  const getStartPos = (i: number) => ({
    x: ((i * 137) % 400) - 200,
    y: ((i * 97 + 43) % 280) - 140,
    r: ((i * 71) % 360) - 180,
  });

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <TechLabel name="Assembly" sub="Horizontal · Layout H" progress={labelIn} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
        {letters.map((ch, i) => {
          const isAI = i >= 14;
          const { x, y, r } = getStartPos(i);
          const s = spring({ frame: frame - i * STAGGER, fps, config: { damping: 18, stiffness: 200, mass: 0.9 } });
          const sc = clamp(s, 0, 1);
          return (
            <div key={i} style={{
              fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900,
              fontSize: isAI ? 160 : 90,
              color: INK, lineHeight: 1, display: 'inline-block',
              transform: `translateX(${x * (1-sc)}px) translateY(${y * (1-sc)}px) rotate(${r * (1-sc)}deg)`,
              opacity: clamp(s * 2, 0, 1),
            }}>{ch === ' ' ? ' ' : ch}</div>
          );
        })}
      </div>
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── B19: Exit Family ──────────────────────────────────────────────────────────
// Three quick exits: letter-drop, blur-out, wipe-close.
const B19_ExitFamily: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const labelIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.8 } });

  const THIRD = Math.floor(durationInFrames / 3);
  const phase = frame < THIRD ? 0 : frame < THIRD * 2 ? 1 : 2;
  const localFrame = frame - phase * THIRD;

  const letters = 'HUMANITARIANS AI'.split('');

  // Exit 1: Letter drop
  const exit1 = (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
      {letters.map((ch, i) => {
        const isAI = i >= 14;
        const DROP_START = i * 3;
        const ty = Math.max(0, (localFrame - DROP_START) * 16);
        const op = Math.max(0, 1 - (localFrame - DROP_START) / 14);
        return (
          <div key={i} style={{
            fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900,
            fontSize: isAI ? 160 : 90,
            color: INK, lineHeight: 1, display: 'inline-block',
            transform: `translateY(${ty}px)`, opacity: op,
          }}>{ch === ' ' ? ' ' : ch}</div>
        );
      })}
    </div>
  );

  // Exit 2: Blur out
  const blurAmt = Math.min(20, localFrame * 0.5);
  const exit2 = (
    <div style={{
      fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900,
      fontSize: 90, color: INK, lineHeight: 1, textAlign: 'center',
      letterSpacing: '-0.01em', whiteSpace: 'nowrap',
      filter: `blur(${blurAmt}px)`, opacity: Math.max(0, 1 - localFrame / 30),
    }}>HUMANITARIANS AI</div>
  );

  // Exit 3: Wipe close
  const wipeAmt = clamp(localFrame / 40, 0, 1);
  const exit3 = (
    <div style={{
      fontFamily: '"Arial Black", Arial, sans-serif', fontWeight: 900,
      fontSize: 90, color: INK, lineHeight: 1, textAlign: 'center',
      letterSpacing: '-0.01em', whiteSpace: 'nowrap',
      clipPath: `inset(0 ${wipeAmt * 100}% 0 0)`,
    }}>HUMANITARIANS AI</div>
  );

  const phaseLabel = phase === 0 ? 'Exit 1 · Letter Drop' : phase === 1 ? 'Exit 2 · Blur Out' : 'Exit 3 · Wipe Close';

  return (
    <AbsoluteFill style={{ background: PAGE, alignItems: 'center', justifyContent: 'center' }}>
      <TechLabel name="Exit Family" sub={phaseLabel} progress={labelIn} />
      {phase === 0 ? exit1 : phase === 1 ? exit2 : exit3}
      <SparkRule opacity={clamp(labelIn, 0, 1)} />
    </AbsoluteFill>
  );
};

// ── Timing accumulator ────────────────────────────────────────────────────────
const TIMED = TIMING.map(t => ({ ...t }));
export const TOTAL_FRAMES_16x9 = TIMED.reduce((a, b) => a + b.frames, 0);

// ── Main composition ──────────────────────────────────────────────────────────
export const HaiWordmarkShowcase16x9: React.FC = () => {
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
            command: 'animate HUMANITARIANS AI wordmark — every Remotion technique — 16:9 landscape for review',
            runningText: 'loading technique showcase…',
            folderLabel: FOLDER,
            output: [
              '19 techniques loaded',
              'outlined SVG ready — 1060×133 fits natively in landscape',
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
            command: 'Animate my SVG wordmark with these techniques: Letter Cascade, Elastic Physics, Mask Wipe. Build each as a Remotion scene at 1920×1080, 30fps, cream #FAF9F5 background, ink #3D3929 text, terracotta #D97757 accent. Export as separate mp4s for review.',
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
