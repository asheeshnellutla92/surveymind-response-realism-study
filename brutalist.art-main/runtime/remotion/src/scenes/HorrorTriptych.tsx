import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HorrorTriptych — B06 for "The Math of Being Afraid Together"
 * Source: Zebonastic essay by Seth Brown & Humanitarians AI, May 17 2026.
 *
 * Three equal panels: Phasmophobia (Hc glows), Lethal Company (δ glows), Haunt & Harvest (Hc+δ degraded).
 * Terracotta accent: Haunt & Harvest panel — proving fear is structural, not graphical.
 * One terracotta moment per beat (CLAUDE-BRAND.md).
 */

export const horrorTriptychSchema = z.object({
  sparkLine: z.string().default('Information and connection, not polygons.'),
});
export type HorrorTriptychProps = z.infer<typeof horrorTriptychSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Phase timing
const PHASE_TITLE_IN = 0;
const PHASE_PANEL1 = 20;
const PHASE_PANEL2 = 60;
const PHASE_PANEL3 = 100;
const PHASE_CAPTION = 220;
const PHASE_SPINE_IN = 240;
const PHASE_SPARK_IN = 270;

// Mini equation: show TPI with highlighted term
const MiniEquation: React.FC<{
  highlightHc?: boolean;
  highlightDelta?: boolean;
  degraded?: boolean;
}> = ({ highlightHc = false, highlightDelta = false, degraded = false }) => {
  const termStyle = (highlighted: boolean): React.CSSProperties => ({
    fontFamily: SERIF,
    fontSize: 13,
    fontWeight: highlighted ? 700 : 400,
    color: highlighted ? CLAUDE.SPARK : (degraded ? CLAUDE.GHOST : CLAUDE.INK_SOFT),
    background: highlighted ? 'rgba(217,119,87,0.12)' : 'transparent',
    borderRadius: 3,
    padding: highlighted ? '0 4px' : '0',
    textDecoration: degraded && !highlighted ? 'line-through' : 'none',
    textDecorationColor: CLAUDE.GHOST,
  });
  return (
    <div style={{ fontFamily: SERIF, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.8, textAlign: 'center' }}>
      <span style={{ color: CLAUDE.INK_SOFT }}>TPI = Ψ · (</span>
      <span style={termStyle(highlightHc)}>H<sub>c</sub></span>
      <span style={{ color: CLAUDE.INK_SOFT }}>/N) · (1 + β · Σ </span>
      <span style={termStyle(highlightDelta)}>δ<sub>ij</sub></span>
      <span style={{ color: CLAUDE.INK_SOFT }}>·e<sup>-λd</sup>)</span>
    </div>
  );
};

// Panel illustrations
const GhostIllustration: React.FC = () => (
  <svg width={80} height={80} viewBox="0 0 80 80">
    {/* Ghost */}
    <path d="M40 10 Q24 10 20 28 L20 64 L28 58 L36 64 L44 58 L52 64 L60 28 Q56 10 40 10 Z"
      fill="none" stroke={CLAUDE.INK_SOFT} strokeWidth={2.5} strokeLinejoin="round" />
    <circle cx={32} cy={34} r={4} fill={CLAUDE.INK_SOFT} />
    <circle cx={48} cy={34} r={4} fill={CLAUDE.INK_SOFT} />
    {/* Clipboard */}
    <rect x={54} y={46} width={20} height={24} rx={3} fill={CLAUDE.PILL} stroke={CLAUDE.BORDER} strokeWidth={1.5} />
    <line x1={58} y1={52} x2={70} y2={52} stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} />
    <line x1={58} y1={56} x2={70} y2={56} stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} />
    <line x1={58} y1={60} x2={66} y2={60} stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} />
  </svg>
);

const SoundWaveIllustration: React.FC = () => (
  <svg width={100} height={60} viewBox="0 0 100 60">
    {/* Sound waves decaying with wall in middle */}
    {[0, 1, 2, 3, 4].map(i => {
      const x = 10 + i * 12;
      const amplitude = 20 - i * 3.5;
      const opacity = 1 - i * 0.18;
      return (
        <path key={i}
          d={`M ${x} ${30 - amplitude} Q ${x + 6} ${30} ${x} ${30 + amplitude}`}
          fill="none" stroke={CLAUDE.INK_SOFT} strokeWidth={2 - i * 0.25}
          opacity={opacity}
          strokeLinecap="round"
        />
      );
    })}
    {/* Wall in middle */}
    <rect x={72} y={12} width={6} height={36} fill={CLAUDE.INK} rx={2} />
    {/* Muted signal after wall */}
    {[0, 1].map(i => {
      const x = 84 + i * 8;
      const amplitude = 6 - i * 2;
      return (
        <path key={`after-${i}`}
          d={`M ${x} ${30 - amplitude} Q ${x + 4} ${30} ${x} ${30 + amplitude}`}
          fill="none" stroke={CLAUDE.GHOST} strokeWidth={1}
          strokeLinecap="round"
        />
      );
    })}
  </svg>
);

const CardFaceDownIllustration: React.FC = () => (
  <svg width={100} height={60} viewBox="0 0 100 60">
    {/* Face-down cards */}
    {[0, 1, 2, 3].map(i => (
      <rect key={i}
        x={8 + i * 22} y={10 + (i % 2) * 8}
        width={18} height={28} rx={3}
        fill={CLAUDE.PILL} stroke={CLAUDE.BORDER} strokeWidth={1.5}
      />
    ))}
    {/* Question marks — information deficit */}
    {[0, 1, 2, 3].map(i => (
      <text key={`q-${i}`}
        x={8 + i * 22 + 9} y={10 + (i % 2) * 8 + 18}
        textAnchor="middle"
        fontFamily={SERIF} fontSize={12}
        fill={CLAUDE.INK_SOFT}>?</text>
    ))}
  </svg>
);

// Panel data
const PANELS = [
  {
    title: 'Phasmophobia',
    term: 'Hc attacks',
    desc: 'Gather evidence, classify the entity. The weapon is knowledge.',
    weakness: 'Predictable entities cap Ψ — fear bounded.',
    highlightHc: true,
    highlightDelta: false,
    degraded: false,
    isAccent: false,
    illustration: <GhostIllustration />,
    caption: 'investigative loop — evidence → classify',
    startFrame: PHASE_PANEL1,
  },
  {
    title: 'Lethal Company',
    term: 'δij attacks',
    desc: 'Proximity voice chat: distance and walls degrade volume.',
    weakness: 'Bracken and Coil-Head weaponize attention itself.',
    highlightHc: false,
    highlightDelta: true,
    degraded: false,
    isAccent: false,
    illustration: <SoundWaveIllustration />,
    caption: 'voice chat decays with distance + walls',
    startFrame: PHASE_PANEL2,
  },
  {
    title: 'Haunt & Harvest',
    term: 'Hc + δ both attacked',
    desc: 'Face-down card drafting. Fear with nothing but cardboard.',
    weakness: 'Proves: fear is structural uncertainty, not polygons.',
    highlightHc: true,
    highlightDelta: true,
    degraded: true,
    isAccent: true,
    illustration: <CardFaceDownIllustration />,
    caption: 'face-down cards — Hc and δ degraded by design',
    startFrame: PHASE_PANEL3,
  },
];

export const HorrorTriptych: React.FC<HorrorTriptychProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const captionIn = spring({ frame: frame - PHASE_CAPTION, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const spineIn = spring({ frame: frame - PHASE_SPINE_IN, fps, config: { damping: 26, stiffness: 110, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.05;
  const PAD_Y = height * 0.08;
  const panelW = (width - PAD_X * 2 - 32) / 3;
  const panelTop = height * 0.27;
  const panelH = height * 0.56;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        STEP 5 · THREE GAMES, THREE TERMS
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Each game attacks a different variable.
      </div>

      {/* Three panels */}
      {PANELS.map((panel, idx) => {
        const panelIn = spring({ frame: frame - panel.startFrame, fps, config: { damping: 24, stiffness: 110, mass: 0.85 } });
        const x = PAD_X + idx * (panelW + 16);

        return (
          <div key={panel.title} style={{
            position: 'absolute',
            left: x,
            top: panelTop,
            width: panelW,
            height: panelH,
            background: panel.isAccent ? `rgba(217, 119, 87, 0.06)` : CLAUDE.CARD,
            border: `${panel.isAccent ? 2 : 1.5}px solid ${panel.isAccent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 16px',
            gap: 12,
            opacity: clamp(panelIn, 0, 1),
            transform: `translateY(${(1 - clamp(panelIn, 0, 1)) * 24}px)`,
          }}>
            {/* Game title */}
            <div style={{
              fontFamily: SERIF, fontSize: height * 0.022, fontWeight: 700,
              color: panel.isAccent ? CLAUDE.SEND : CLAUDE.INK,
              textAlign: 'center', lineHeight: 1.2,
            }}>
              {panel.title}
            </div>

            {/* Illustration */}
            <div style={{ opacity: 0.9 }}>
              {panel.illustration}
            </div>

            {/* Term attacked chip */}
            <div style={{
              background: panel.isAccent ? CLAUDE.SPARK : CLAUDE.PILL,
              border: `1px solid ${panel.isAccent ? CLAUDE.SEND : CLAUDE.BORDER}`,
              borderRadius: 8, padding: '4px 12px',
              fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
              color: panel.isAccent ? '#FFFFFF' : CLAUDE.INK,
              textTransform: 'uppercase' as const, letterSpacing: 1,
            }}>
              {panel.term}
            </div>

            {/* Mini equation */}
            <MiniEquation
              highlightHc={panel.highlightHc}
              highlightDelta={panel.highlightDelta}
              degraded={panel.degraded}
            />

            {/* Description */}
            <div style={{
              fontFamily: SERIF, fontSize: height * 0.014, color: CLAUDE.INK,
              lineHeight: 1.45, textAlign: 'center',
            }}>
              {panel.desc}
            </div>

            {/* Caption */}
            <div style={{
              fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK_SOFT,
              lineHeight: 1.4, textAlign: 'center', fontStyle: 'italic',
              marginTop: 'auto',
            }}>
              {panel.caption}
            </div>
          </div>
        );
      })}

      {/* Through-line caption */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        bottom: height * 0.12,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: height * 0.018,
        fontStyle: 'italic',
        color: CLAUDE.INK,
        opacity: clamp(captionIn, 0, 1),
      }}>
        "information and connection, not polygons."
      </div>

      {/* Proof spine card — Step 5 */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        bottom: height * 0.03,
        width: width * 0.28,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        padding: '10px 18px',
        opacity: clamp(spineIn, 0, 1),
        transform: `translateY(${(1 - clamp(spineIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
          color: CLAUDE.SPARK, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4,
        }}>Step 5</div>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.014, color: CLAUDE.INK, lineHeight: 1.4 }}>
          Hc, δ, Hc+δ — three games, one model
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.04,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
