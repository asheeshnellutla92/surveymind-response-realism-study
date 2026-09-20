import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HorrorAlphaHero — B05 for "The Math of Being Afraid Together"
 * Source: Zebonastic essay by Seth Brown & Humanitarians AI, May 17 2026.
 *
 * Two states: armed hero (TPI craters) → survivor (one snatched, all gauges spike).
 * Terracotta accent: the snatch event — N drops, gauges spike in terracotta simultaneously.
 * One terracotta moment per beat (CLAUDE-BRAND.md).
 */

export const horrorAlphaHeroSchema = z.object({
  sparkLine: z.string().default('Structural inability to fight back.'),
});
export type HorrorAlphaHeroProps = z.infer<typeof horrorAlphaHeroSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Phase timing
const PHASE_TITLE_IN = 0;
const PHASE_HEROES_IN = 20;
const PHASE_TPI_LOW = 70;
const PHASE_SURVIVOR_IN = 130;
const PHASE_SNATCH = 200;
const PHASE_SPIKE = 220;
const PHASE_SPINE_IN = 260;
const PHASE_SPARK_IN = 280;

export const HorrorAlphaHero: React.FC<HorrorAlphaHeroProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const heroesIn = spring({ frame: frame - PHASE_HEROES_IN, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const tpiLow = spring({ frame: frame - PHASE_TPI_LOW, fps, config: { damping: 24, stiffness: 110, mass: 0.8 } });
  const survivorIn = spring({ frame: frame - PHASE_SURVIVOR_IN, fps, config: { damping: 22, stiffness: 110, mass: 0.8 } });
  const snatchAnim = spring({ frame: frame - PHASE_SNATCH, fps, config: { damping: 14, stiffness: 200, mass: 0.6 } });
  const spikeAnim = spring({ frame: frame - PHASE_SPIKE, fps, config: { damping: 14, stiffness: 200, mass: 0.6 } });
  const spineIn = spring({ frame: frame - PHASE_SPINE_IN, fps, config: { damping: 26, stiffness: 110, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - PHASE_SPARK_IN, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const snatched = clamp(snatchAnim, 0, 1);
  const spiked = clamp(spikeAnim, 0, 1);

  // Hero TPI gauge: low (denominator ballooned)
  const heroTpiLevel = interpolate(clamp(tpiLow, 0, 1), [0, 1], [0.7, 0.12]);

  // Survivor TPI gauges: spike when N drops
  const survivorGaugeColor = spiked > 0.3 ? CLAUDE.SPARK : CLAUDE.INK_SOFT;
  const survivorTpiLevel = interpolate(spiked, [0, 1], [0.25, 0.85]);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.015, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        STEP 4 · THE ALPHA HERO PROBLEM
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        Arm the players. TPI craters. It becomes a brawler.
      </div>

      {/* ─── LEFT PANEL: Armed Heroes ─── */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: height * 0.28,
        width: width * 0.38,
        height: height * 0.52,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        opacity: clamp(heroesIn, 0, 1),
        transform: `translateY(${(1 - clamp(heroesIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
          Armed Heroes
        </div>

        {/* Two figures back-to-back with weapon icons */}
        <svg width={180} height={100} viewBox="0 0 180 100">
          {/* Figure 1 facing left */}
          <circle cx={60} cy={18} r={12} fill="none" stroke={CLAUDE.INK} strokeWidth={2} />
          <line x1={60} y1={30} x2={60} y2={60} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          <line x1={38} y1={44} x2={82} y2={44} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          <line x1={60} y1={60} x2={44} y2={90} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          <line x1={60} y1={60} x2={76} y2={90} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          {/* Gun icon for fig 1 */}
          <rect x={20} y={40} width={20} height={8} rx={2} fill={CLAUDE.INK} />
          <rect x={17} y={42} width={6} height={4} rx={1} fill={CLAUDE.INK_SOFT} />

          {/* Figure 2 facing right */}
          <circle cx={120} cy={18} r={12} fill="none" stroke={CLAUDE.INK} strokeWidth={2} />
          <line x1={120} y1={30} x2={120} y2={60} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          <line x1={98} y1={44} x2={142} y2={44} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          <line x1={120} y1={60} x2={104} y2={90} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          <line x1={120} y1={60} x2={136} y2={90} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          {/* Gun icon for fig 2 */}
          <rect x={140} y={40} width={20} height={8} rx={2} fill={CLAUDE.INK} />
          <rect x={157} y={42} width={6} height={4} rx={1} fill={CLAUDE.INK_SOFT} />
        </svg>

        {/* Equation labels */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ label: 'N↑', note: 'big group' }, { label: 'δ↑', note: 'high comms' }].map(({ label, note }) => (
            <div key={label} style={{
              textAlign: 'center',
              background: CLAUDE.PILL, border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 8, padding: '5px 12px',
            }}>
              <div style={{ fontFamily: SERIF, fontSize: height * 0.018, fontWeight: 700, color: CLAUDE.INK }}>{label}</div>
              <div style={{ fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK_SOFT }}>{note}</div>
            </div>
          ))}
        </div>

        {/* TPI gauge — near zero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT }}>TPI</span>
          <div style={{
            width: 80, height: 12,
            background: CLAUDE.PILL, borderRadius: 6, overflow: 'hidden',
          }}>
            <div style={{
              width: `${heroTpiLevel * 100}%`, height: '100%',
              background: CLAUDE.INK_SOFT, borderRadius: 6,
            }} />
          </div>
          <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT }}>↓ low</span>
        </div>

        <div style={{
          fontFamily: SERIF, fontSize: height * 0.016, fontStyle: 'italic',
          color: CLAUDE.INK_SOFT, textAlign: 'center', maxWidth: '80%',
        }}>
          N↑ · δ↑ → TPI↓ → "brawler"
        </div>
      </div>

      {/* Arrow between panels */}
      <div style={{
        position: 'absolute',
        left: PAD_X + width * 0.38 + 8,
        top: height * 0.50,
        fontFamily: SANS, fontSize: height * 0.026,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(survivorIn, 0, 1),
      }}>
        →
      </div>

      {/* ─── RIGHT PANEL: Survivor ─── */}
      <div style={{
        position: 'absolute',
        right: PAD_X,
        top: height * 0.28,
        width: width * 0.38,
        height: height * 0.52,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        opacity: clamp(survivorIn, 0, 1),
        transform: `translateY(${(1 - clamp(survivorIn, 0, 1)) * 20}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
          Survivor Premise
        </div>

        {/* Two figures — one gets snatched */}
        <svg width={160} height={100} viewBox="0 0 160 100">
          {/* Figure 1 — stays */}
          <circle cx={60} cy={18} r={12} fill="none" stroke={CLAUDE.INK} strokeWidth={2} />
          <line x1={60} y1={30} x2={60} y2={60} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          <line x1={42} y1={44} x2={78} y2={44} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          <line x1={60} y1={60} x2={44} y2={90} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          <line x1={60} y1={60} x2={76} y2={90} stroke={CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          {/* Crossed-out weapon */}
          <line x1={28} y1={36} x2={44} y2={52} stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} />
          <line x1={44} y1={36} x2={28} y2={52} stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} />

          {/* Figure 2 — gets snatched (fades/moves up) */}
          <g opacity={1 - snatched * 0.95}
            transform={`translate(0, ${-snatched * 40})`}>
            <circle cx={110} cy={18} r={12} fill="none" stroke={snatched > 0.3 ? CLAUDE.SPARK : CLAUDE.INK} strokeWidth={2} />
            <line x1={110} y1={30} x2={110} y2={60} stroke={snatched > 0.3 ? CLAUDE.SPARK : CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
            <line x1={92} y1={44} x2={128} y2={44} stroke={snatched > 0.3 ? CLAUDE.SPARK : CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
            <line x1={110} y1={60} x2={94} y2={90} stroke={snatched > 0.3 ? CLAUDE.SPARK : CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
            <line x1={110} y1={60} x2={126} y2={90} stroke={snatched > 0.3 ? CLAUDE.SPARK : CLAUDE.INK} strokeWidth={2} strokeLinecap="round" />
          </g>
        </svg>

        {/* N counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: SERIF, fontSize: height * 0.018, color: CLAUDE.INK }}>N =</span>
          <span style={{
            fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 700,
            color: spiked > 0.3 ? CLAUDE.SPARK : CLAUDE.INK,
          }}>
            {snatched > 0.5 ? '1' : '2'}
          </span>
          {snatched > 0.5 && (
            <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.SPARK, fontWeight: 700 }}>↓ snatched</span>
          )}
        </div>

        {/* TPI gauges spike — terracotta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          {['Player 1 TPI', 'Group TPI'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT, width: 80 }}>{label}</span>
              <div style={{
                width: 90, height: 12,
                background: CLAUDE.PILL, borderRadius: 6, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${survivorTpiLevel * 100}%`, height: '100%',
                  background: survivorGaugeColor,
                  borderRadius: 6,
                  transition: 'width 0.2s ease',
                }} />
              </div>
              {spiked > 0.5 && (
                <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.SPARK, fontWeight: 700 }}>↑</span>
              )}
            </div>
          ))}
        </div>

        <div style={{
          fontFamily: SERIF, fontSize: height * 0.014, fontStyle: 'italic',
          color: spiked > 0.3 ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
          textAlign: 'center', maxWidth: '85%',
          fontWeight: spiked > 0.3 ? 700 : 400,
        }}>
          N drops → TPI spikes · everyone
        </div>
      </div>

      {/* Proof spine card — Step 4 */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.04,
        width: width * 0.42,
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
        }}>Step 4</div>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.014, color: CLAUDE.INK, lineHeight: 1.4 }}>
          survivors, not heroes · structure over weapons
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
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
