import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * K12Fig10FadingSchedule — "The Fading Schedule"
 * Source: Agent Skills for K-12 Teachers (Anthropic) — k12-fluency-scaffolding
 *
 * Horizontal timeline: 5 weeks, scaffold bars removed one per week.
 * Phase 2 (PHASE_SWITCH=90): annotation appears on Week 5.
 */

export const k12Fig10FadingScheduleSchema = z.object({
  sparkLine: z.string().default('One scaffold at a time, until the text stands alone.'),
});
export type K12Fig10FadingScheduleProps = z.infer<typeof k12Fig10FadingScheduleSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PHASE_SWITCH = 90;

// Scaffold bar colours
const BAR_READING = '#C4B9A8';   // warm grey — reading protocol
const BAR_VOCAB = '#B5C4B1';     // sage — vocab gloss
const BAR_STARTERS = '#D4C5A9'; // tan — sentence starters


// Which bars are shown each week: true = present, false = removed
const WEEK_BARS: Array<{ reading: boolean; vocab: boolean; starters: boolean }> = [
  { reading: true,  vocab: true,  starters: true  }, // Week 1
  { reading: true,  vocab: true,  starters: false }, // Week 2 — starters removed
  { reading: true,  vocab: false, starters: false }, // Week 3 — vocab removed
  { reading: false, vocab: false, starters: false }, // Week 4 — reading removed
  { reading: false, vocab: false, starters: false }, // Week 5 — nothing
];

const BAR_H = 32;
const BAR_GAP = 6;
const BAR_LABELS = ['Reading protocol', 'Vocab gloss', 'Sentence starters'];
const BAR_COLORS = [BAR_READING, BAR_VOCAB, BAR_STARTERS];

export const K12Fig10FadingSchedule: React.FC<K12Fig10FadingScheduleProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 150, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 18, stiffness: 80 } });
  const showP2 = frame >= PHASE_SWITCH;
  const phase2Prog = clamp(phase2In, 0, 1);

  const usableW = width - PAD_X * 2;
  const colW = usableW / 5;
  const timelineY = height * 0.26;
  const stackH = (BAR_H + BAR_GAP) * 3; // max 3 bars
  const stackTop = timelineY + 40; // below week label

  return (
    <AbsoluteFill style={{ background: '#FAF9F5', overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: '#6B6B68', opacity: clamp(titleIn, 0, 1),
      }}>
        FADING SCHEDULE · K-12 READING SCAFFOLDING
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.052,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: '#1A1A18', opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Remove one scaffold at a time.
      </div>

      {/* Baseline rule */}
      <div style={{
        position: 'absolute', left: PAD_X, top: stackTop + stackH + 18,
        width: usableW, height: 2, background: '#E5E3DD',
        opacity: clamp(titleIn, 0, 1),
      }} />

      {/* Week columns */}
      {WEEK_BARS.map((week, wi) => {
        const colX = PAD_X + wi * colW;
        const isWeek5 = wi === 4;

        // Stagger each week's entrance
        const weekIn = spring({ frame: frame - 20 - wi * 14, fps, config: { damping: 18, stiffness: 80 } });
        const weekProg = clamp(weekIn, 0, 1);

        // Which bars are present this week
        const barsPresent = [week.reading, week.vocab, week.starters];

        // Bars that were removed this week vs previous week
        const prevWeek = wi > 0 ? WEEK_BARS[wi - 1] : null;
        const removedThisWeek = prevWeek ? [
          !week.reading && prevWeek.reading,
          !week.vocab && prevWeek.vocab,
          !week.starters && prevWeek.starters,
        ] : [false, false, false];

        const barsToDraw = barsPresent.map((present, bi) => ({ present, removed: removedThisWeek[bi], bi }));

        return (
          <div key={wi} style={{
            position: 'absolute',
            left: colX, top: timelineY,
            width: colW - 8,
            opacity: weekProg,
            transform: `translateY(${(1 - weekProg) * 20}px)`,
          }}>
            {/* Week label */}
            <div style={{
              fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
              color: isWeek5 ? '#D97757' : '#6B6B68',
              letterSpacing: 1, textTransform: 'uppercase' as const,
              marginBottom: 10,
              borderTop: isWeek5 ? `2px solid #D97757` : `2px solid #E5E3DD`,
              paddingTop: 8,
            }}>
              Week {wi + 1}
            </div>

            {/* Bar stack — from bottom up: reading, vocab, starters */}
            <div style={{ position: 'relative', height: stackH }}>
              {barsToDraw.map(({ present, removed, bi }) => {
                const barColor = BAR_COLORS[bi];
                const barY = stackH - (bi + 1) * (BAR_H + BAR_GAP);

                if (isWeek5) return null; // Week 5: no bars

                if (present) {
                  return (
                    <div key={bi} style={{
                      position: 'absolute', top: barY, left: 0,
                      width: colW - 20, height: BAR_H,
                      background: barColor, borderRadius: 4,
                      display: 'flex', alignItems: 'center', paddingLeft: 6,
                    }}>
                      <span style={{
                        fontFamily: SANS, fontSize: height * 0.010, color: '#3D3929',
                        whiteSpace: 'nowrap' as const, overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {BAR_LABELS[bi]}
                      </span>
                    </div>
                  );
                } else if (removed) {
                  // Removed this week — show faded X outline
                  return (
                    <div key={bi} style={{
                      position: 'absolute', top: barY, left: 0,
                      width: colW - 20, height: BAR_H,
                      border: `1.5px dashed ${barColor}`,
                      borderRadius: 4, opacity: 0.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width={14} height={14} viewBox="0 0 14 14">
                        <line x1={2} y1={2} x2={12} y2={12} stroke={barColor} strokeWidth={2} strokeLinecap="round" />
                        <line x1={12} y1={2} x2={2} y2={12} stroke={barColor} strokeWidth={2} strokeLinecap="round" />
                      </svg>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Week 5: special "Unscaffolded passage." label */}
            {isWeek5 && (
              <div style={{
                height: stackH, display: 'flex', alignItems: 'center',
                borderLeft: `2px solid #D97757`, paddingLeft: 8,
              }}>
                <span style={{
                  fontFamily: SERIF, fontSize: height * 0.014, fontStyle: 'italic',
                  color: '#D97757', lineHeight: 1.3,
                }}>
                  Unscaffolded passage.
                </span>
              </div>
            )}

            {/* Text baseline label */}
            <div style={{
              marginTop: 12,
              fontFamily: SANS, fontSize: height * 0.010, color: '#A9A491',
            }}>
              {isWeek5 ? 'Same text.' : `${barsPresent.filter(Boolean).length} scaffold${barsPresent.filter(Boolean).length !== 1 ? 's' : ''}`}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div style={{
        position: 'absolute', left: PAD_X, top: stackTop + stackH + 50,
        display: 'flex', gap: 18, opacity: clamp(titleIn, 0, 1),
      }}>
        {BAR_LABELS.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, background: BAR_COLORS[i], borderRadius: 3 }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.011, color: '#6B6B68' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Phase 2 annotation on Week 5 */}
      {showP2 && (
        <div style={{
          position: 'absolute',
          left: PAD_X + 4 * colW - 10,
          top: stackTop - 50,
          width: colW + 60,
          background: '#FAF9F5',
          border: `1.5px solid #D97757`,
          borderRadius: 8,
          padding: '10px 12px',
          opacity: phase2Prog,
          transform: `translateY(${(1 - phase2Prog) * 12}px)`,
        }}>
          <div style={{
            fontFamily: SANS, fontSize: height * 0.012, color: '#D97757',
            fontWeight: 600, lineHeight: 1.4,
          }}>
            Same passage. No scaffold.<br />
            <span style={{ fontWeight: 400, color: '#6B6B68' }}>Does it hold?</span>
          </div>
        </div>
      )}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Agent Skills for K-12 Teachers (Anthropic)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.05,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: '#1A1A18' }}>
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
