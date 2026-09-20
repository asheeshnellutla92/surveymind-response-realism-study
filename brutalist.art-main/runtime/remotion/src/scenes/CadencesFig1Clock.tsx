import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CadencesFig1Clock — "The Clock" dual motion graphic.
 * Source: Anthropic Economic Index, Cadences (June 2026)
 *
 * Phase 1 (0–90f): 24-hour ribbon with labelled request clusters.
 * Phase 2 (90–end): weekly view — personal share bars, weekday vs weekend,
 *   with callout chips for topic risers/fallers.
 *
 * Terracotta moment: the 6 pm recipe spike (2.3x — the single biggest).
 * One accent per beat law observed.
 */

export const cadencesFig1ClockSchema = z.object({
  sparkLine: z.string().default('Morning news. Evening recipes. Night advice.'),
});
export type CadencesFig1ClockProps = z.infer<typeof cadencesFig1ClockSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Hourly activity clusters (normalized 0–1, with 6pm recipe spike as peak=1.0 terracotta)
const HOUR_CLUSTERS: { hour: number; label: string; level: number; terracotta?: boolean }[] = [
  { hour: 5,  label: 'Sleep advice',         level: 0.45 },
  { hour: 7,  label: 'News',                 level: 0.62 },
  { hour: 10, label: 'Business correspondence', level: 0.70 },
  { hour: 18, label: 'Recipes 2.3×',         level: 1.0, terracotta: true },
  { hour: 20, label: 'Media recs',           level: 0.55 },
];

// Weekly personal share: weekday ~35%, weekend ~50%
const WEEK_DATA = [
  { day: 'Mon', personal: 35, work: 65 },
  { day: 'Tue', personal: 35, work: 65 },
  { day: 'Wed', personal: 36, work: 64 },
  { day: 'Thu', personal: 35, work: 65 },
  { day: 'Fri', personal: 37, work: 63 },
  { day: 'Sat', personal: 48, work: 52 },
  { day: 'Sun', personal: 49, work: 51 },
];

const PHASE_SWITCH = 90; // frames

export const CadencesFig1Clock: React.FC<CadencesFig1ClockProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const sparkIn  = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const showPhase2 = frame >= PHASE_SWITCH;

  // ── Phase 1: Hourly ribbon ───────────────────────────────────────────────
  const RIBBON_TOP = height * 0.30;
  const RIBBON_BOTTOM = height * 0.78;
  const RIBBON_H = RIBBON_BOTTOM - RIBBON_TOP;
  const RIBBON_LEFT = PAD_X + 40;
  const RIBBON_RIGHT = width - PAD_X;
  const RIBBON_W = RIBBON_RIGHT - RIBBON_LEFT;
  const hourX = (h: number) => RIBBON_LEFT + (h / 24) * RIBBON_W;

  // ── Phase 2: Weekly bars ─────────────────────────────────────────────────
  const BAR_TOP = height * 0.26;
  const BAR_BOTTOM = height * 0.78;
  const BAR_H = BAR_BOTTOM - BAR_TOP;
  const BAR_LEFT = PAD_X + 40;
  const BAR_RIGHT = width - PAD_X;
  const BAR_AREA_W = BAR_RIGHT - BAR_LEFT;
  const BAR_W = (BAR_AREA_W / WEEK_DATA.length) * 0.6;
  const BAR_GAP = (BAR_AREA_W / WEEK_DATA.length);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        ANTHROPIC ECONOMIC INDEX · CADENCES
      </div>

      {/* Title — transitions between phase 1 and phase 2 */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1), transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showPhase2
          ? 'Personal share jumps on weekends.'
          : 'Claude logs the economy\'s daily rhythm.'}
      </div>

      {/* ── PHASE 1: Hourly ribbon ── */}
      {!showPhase2 && (
        <>
          {/* Baseline axis */}
          <div style={{
            position: 'absolute', left: RIBBON_LEFT, top: RIBBON_BOTTOM,
            width: RIBBON_W, height: 2, background: CLAUDE.BORDER,
          }} />

          {/* Hour ticks */}
          {[0, 6, 12, 18, 24].map(h => (
            <React.Fragment key={h}>
              <div style={{
                position: 'absolute',
                left: hourX(h) - 0.5, top: RIBBON_BOTTOM,
                width: 1, height: 8, background: CLAUDE.GHOST,
              }} />
              <div style={{
                position: 'absolute',
                left: hourX(h) - 12, top: RIBBON_BOTTOM + 12,
                fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
              }}>
                {h === 0 ? '12am' : h === 6 ? '6am' : h === 12 ? 'noon' : h === 18 ? '6pm' : '12am'}
              </div>
            </React.Fragment>
          ))}

          {/* Activity spikes */}
          {HOUR_CLUSTERS.map((cluster, i) => {
            const barAnim = spring({ frame: frame - 10 - i * 8, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
            const barH = cluster.level * RIBBON_H * 0.85 * clamp(barAnim, 0, 1);
            const bx = hourX(cluster.hour);
            const isHot = !!cluster.terracotta;

            return (
              <React.Fragment key={cluster.label}>
                {/* Bar */}
                <div style={{
                  position: 'absolute',
                  left: bx - 18, top: RIBBON_BOTTOM - barH,
                  width: 36, height: barH,
                  background: isHot ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                  borderRadius: '4px 4px 0 0',
                  opacity: isHot ? 1 : 0.5,
                }} />
                {/* Label */}
                {clamp(barAnim, 0, 1) > 0.7 && (
                  <div style={{
                    position: 'absolute',
                    left: bx - 56, top: RIBBON_BOTTOM - barH - 26,
                    width: 112,
                    fontFamily: SANS, fontSize: height * 0.013,
                    color: isHot ? CLAUDE.SPARK : CLAUDE.INK,
                    fontWeight: isHot ? 700 : 500,
                    textAlign: 'center' as const,
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {cluster.label}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Cite */}
          <div style={{
            position: 'absolute', left: PAD_X, bottom: height * 0.11,
            fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
            opacity: clamp(titleIn, 0, 1),
          }}>
            Data: Anthropic Economic Index, Cadences (June 2026)
          </div>
        </>
      )}

      {/* ── PHASE 2: Weekly stacked bars ── */}
      {showPhase2 && (
        <>
          {/* Legend */}
          <div style={{
            position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.13,
            display: 'flex', gap: 24, opacity: clamp(phase2In, 0, 1),
          }}>
            {[
              { label: 'Personal use', color: CLAUDE.SPARK },
              { label: 'Work use', color: CLAUDE.INK_SOFT },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />
                <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>

          {/* Y axis label */}
          <div style={{
            position: 'absolute', right: PAD_X, top: BAR_TOP,
            fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
            opacity: clamp(phase2In, 0, 1), textAlign: 'right' as const,
          }}>
            % of conversations
          </div>

          {/* Y gridlines */}
          {[0, 25, 50, 75, 100].map(v => {
            const y = BAR_BOTTOM - (v / 100) * BAR_H;
            return (
              <React.Fragment key={v}>
                <div style={{
                  position: 'absolute', left: BAR_LEFT, top: y,
                  width: BAR_AREA_W, height: 1, background: CLAUDE.BORDER, opacity: 0.6,
                }} />
                <div style={{
                  position: 'absolute', right: width - BAR_LEFT + 6, top: y - 8,
                  fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
                }}>
                  {v}%
                </div>
              </React.Fragment>
            );
          })}

          {/* Weekend shading */}
          {WEEK_DATA.slice(5).map((d, i) => {
            const bx = BAR_LEFT + (5 + i) * BAR_GAP;
            return (
              <div key={d.day} style={{
                position: 'absolute',
                left: bx - BAR_GAP * 0.2, top: BAR_TOP,
                width: BAR_GAP * 1.4, height: BAR_H,
                background: `${CLAUDE.SPARK}0f`,
                borderRadius: 4,
                opacity: clamp(phase2In, 0, 1),
              }} />
            );
          })}

          {/* Bars */}
          {WEEK_DATA.map((d, i) => {
            const barAnim = spring({ frame: frame - PHASE_SWITCH - 8 - i * 5, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
            const bx = BAR_LEFT + i * BAR_GAP + (BAR_GAP - BAR_W) / 2;
            const personalH = (d.personal / 100) * BAR_H * clamp(barAnim, 0, 1);
            const workH = (d.work / 100) * BAR_H * clamp(barAnim, 0, 1);
            const isWeekend = i >= 5;

            return (
              <React.Fragment key={d.day}>
                {/* Work bar (bottom) */}
                <div style={{
                  position: 'absolute',
                  left: bx, top: BAR_BOTTOM - workH - personalH,
                  width: BAR_W, height: workH,
                  background: CLAUDE.INK_SOFT, opacity: 0.6,
                  borderRadius: '4px 4px 0 0',
                }} />
                {/* Personal bar (top) */}
                <div style={{
                  position: 'absolute',
                  left: bx, top: BAR_BOTTOM - personalH,
                  width: BAR_W, height: personalH,
                  background: isWeekend ? CLAUDE.SPARK : CLAUDE.INK,
                  opacity: isWeekend ? 1 : 0.55,
                  borderRadius: '0 0 0 0',
                }} />
                {/* Day label */}
                <div style={{
                  position: 'absolute',
                  left: bx, top: BAR_BOTTOM + 10,
                  width: BAR_W, fontFamily: SANS,
                  fontSize: height * 0.014,
                  color: isWeekend ? CLAUDE.SPARK : CLAUDE.INK,
                  fontWeight: isWeekend ? 700 : 500,
                  textAlign: 'center' as const,
                  opacity: clamp(phase2In, 0, 1),
                }}>
                  {d.day}
                </div>
                {/* Personal % label */}
                {clamp(barAnim, 0, 1) > 0.8 && (
                  <div style={{
                    position: 'absolute',
                    left: bx, top: BAR_BOTTOM - personalH - workH - 20,
                    width: BAR_W,
                    fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
                    color: isWeekend ? CLAUDE.SPARK : CLAUDE.INK,
                    textAlign: 'center' as const,
                  }}>
                    {d.personal}%
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Weekend label */}
          <div style={{
            position: 'absolute',
            left: BAR_LEFT + 5 * BAR_GAP,
            top: BAR_TOP - height * 0.02,
            fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.SPARK, fontWeight: 700,
            opacity: clamp(phase2In, 0, 1),
          }}>
            ↑ weekend
          </div>

          {/* Citation */}
          <div style={{
            position: 'absolute', left: PAD_X, bottom: height * 0.11,
            fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
            opacity: clamp(phase2In, 0, 1),
          }}>
            Data: Anthropic Economic Index, Cadences (June 2026)
          </div>
        </>
      )}

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

    
      {/* @NikBearBrown watermark — lower-right, low opacity (LOGO LAW) */}
      <div style={{
        position: 'absolute',
        right: width * 0.04,
        bottom: height * 0.04,
        fontFamily: CLAUDE_FONT.ui,
        fontSize: height * 0.016,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: 0.22,
        letterSpacing: 1,
      }}>
        @NikBearBrown
      </div>
    </AbsoluteFill>

  );
};
