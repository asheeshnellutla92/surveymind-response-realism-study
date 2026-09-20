/**
 * RequireReport.tsx — reel-local Remotion components for
 * claude-liam-what-a-university-can-require.
 *
 * Palette: cream #F2F0E9, ink #3D3929, terracotta #D97757 (ONE accent).
 * All at 1920x1080, registered in Root.tsx under the folder "RequireReport".
 *
 * SOURCE CARE: every number these components display comes from the Brown
 * GAITL final report (July 2026). Props carry the numbers; no component
 * hardcodes a statistic, so a wrong figure is a beat-sheet fix, not a
 * component fix.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';

// -- Palette ------------------------------------------------------------------
const BG     = '#F2F0E9';
const INK    = '#3D3929';
const ACC    = '#D97757';
const SOFT   = '#73705F';
const GHOST  = '#B0AD9A';
const CARD   = '#FFFFFF';
const BORDER = '#DDD9CC';

// -- Type stack ---------------------------------------------------------------
const SERIF = '"EB Garamond", Georgia, "Times New Roman", serif';
const SANS  = '-apple-system, "SF Pro Text", "Segoe UI", sans-serif';

// -- Layout -------------------------------------------------------------------
const SAFE = 96;   // 5% title-safe inset on the 1920 axis
const CW   = 1920;
const CH   = 1080;

const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const SPRING_GENTLE = { damping: 30, stiffness: 120, mass: 0.9 };

/** Spark + one short serif line, top-left. SPARK-LINE LAW on illustration beats. */
const SparkLine: React.FC<{ line: string; t: number; bottom?: boolean }> = ({ line, t, bottom }) => (
  <div style={{
    position: 'absolute', left: SAFE, [bottom ? 'bottom' : 'top']: SAFE - 24,
    display: 'flex', alignItems: 'baseline', gap: 14, opacity: t,
  }}>
    <span style={{ fontFamily: SERIF, fontSize: 40, color: ACC, lineHeight: 1 }}>*</span>
    <span style={{ fontFamily: SERIF, fontSize: 40, color: SOFT, lineHeight: 1 }}>{line}</span>
  </div>
);


// ===========================================================================
// ReqSegmentCard - act card: eyebrow + serif title + terracotta period
// ===========================================================================
export const reqSegmentCardSchema = z.object({
  title: z.string().default('Act Title'),
  index: z.string().default('I'),
});
export type ReqSegmentCardProps = z.infer<typeof reqSegmentCardSchema>;

export const ReqSegmentCard: React.FC<ReqSegmentCardProps> = ({ title, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A 33-character act title at 156px is wider than the frame. Fit the type to
  // the title, and let it wrap — an act card must never crop its own name.
  const titlePx = title.length <= 18 ? 156 : title.length <= 26 ? 128 : 104;
  const cardIn = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  const textIn = cl(spring({ frame: frame - 6, fps, config: SPRING_GENTLE }));
  const dotIn  = cl(spring({ frame: frame - 12, fps, config: SPRING_GENTLE }));

  return (
    <AbsoluteFill style={{ background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26,
        opacity: cardIn, transform: `translateY(${(1 - cardIn) * 28}px)`,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 30, letterSpacing: '0.22em',
          color: SOFT, textTransform: 'uppercase', opacity: textIn,
        }}>
          ACT &middot; {index}
        </div>
        <div style={{
          maxWidth: CW - SAFE * 2, textAlign: 'center',
          fontFamily: SERIF, fontSize: titlePx, lineHeight: 1.08,
          overflowWrap: 'break-word',
        }}>
          <span style={{ color: INK, opacity: textIn }}>{title}</span>
          <span style={{ color: ACC, opacity: dotIn }}>.</span>
        </div>
        <div style={{ width: `${Math.round(textIn * 860)}px`, height: 2, background: INK, opacity: 0.35 }} />
      </div>
    </AbsoluteFill>
  );
};


// ===========================================================================
// ReqBars - horizontal percentage bars, optional second (compare) series.
// Bars grow to their value on a stagger; ONE bar earns terracotta.
// ===========================================================================
export const reqBarsSchema = z.object({
  title: z.string().default('Concerns'),
  data: z.array(z.object({
    label: z.string(),
    value: z.number(),
    compare: z.number().optional(),
  })).min(1).max(6),
  accentIndex: z.number().int().nonnegative().default(0),
  seriesA: z.string().default(''),
  seriesB: z.string().default(''),
  note: z.string().default(''),
  spark: z.string().default(''),
});
export type ReqBarsProps = z.infer<typeof reqBarsSchema>;

export const ReqBars: React.FC<ReqBarsProps> = ({ title, data, accentIndex, seriesA, seriesB, note, spark }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const titleIn = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  const noteIn  = cl(interpolate(t, [0.72, 0.86], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const hasCompare = data.some((d) => d.compare !== undefined);
  const trackX = SAFE + 680;
  const trackW = CW - trackX - SAFE - 230;
  const top    = 330;
  const bottom = 930;
  // Rows expand to fill the safe area — a 2-row chart must not sit in the top third.
  const rowH   = Math.min(320, (bottom - top) / data.length);

  return (
    <AbsoluteFill style={{ background: BG }}>
      {spark ? <SparkLine line={spark} t={titleIn} /> : null}

      <div style={{
        position: 'absolute', left: SAFE, top: 140, width: CW - SAFE * 2,
        fontFamily: SERIF, fontSize: 80, color: INK, opacity: titleIn,
        transform: `translateY(${(1 - titleIn) * 16}px)`,
      }}>
        {title}
      </div>

      {hasCompare ? (
        <div style={{ position: 'absolute', left: trackX, top: 268, display: 'flex', gap: 40, opacity: noteIn }}>
          <span style={{ fontFamily: SANS, fontSize: 26, letterSpacing: '0.1em', color: SOFT, textTransform: 'uppercase' }}>
            &#9644; {seriesA}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 26, letterSpacing: '0.1em', color: ACC, textTransform: 'uppercase' }}>
            &#9644; {seriesB}
          </span>
        </div>
      ) : null}

      {data.map((d, i) => {
        const grow  = cl(spring({ frame: frame - 10 - i * 8, fps, config: { damping: 34, stiffness: 90, mass: 1 } }));
        const grow2 = cl(spring({ frame: frame - 22 - i * 8, fps, config: { damping: 34, stiffness: 90, mass: 1 } }));
        const isAcc = i === accentIndex && !hasCompare;
        const y = top + i * rowH;
        const barH = hasCompare ? Math.min(84, rowH * 0.30) : Math.min(120, rowH * 0.50);

        return (
          <div key={d.label}>
            <div style={{
              position: 'absolute', left: SAFE, top: y - 6, width: 640,
              fontFamily: SERIF, fontSize: 44, color: isAcc ? INK : SOFT,
              textAlign: 'right', opacity: grow, lineHeight: 1.15,
            }}>
              {d.label}
            </div>
            {/* series A */}
            <div style={{
              position: 'absolute', left: trackX, top: y, height: barH,
              width: Math.round((trackW * d.value / 100) * grow),
              background: isAcc ? ACC : GHOST, borderRadius: 2,
            }} />
            <div style={{
              position: 'absolute', left: trackX + Math.round((trackW * d.value / 100) * grow) + 20,
              top: y - 10, fontFamily: SANS, fontSize: 58, fontWeight: 600,
              color: isAcc ? ACC : INK, opacity: grow,
            }}>
              {Math.round(d.value * grow)}%
            </div>
            {/* series B (compare) */}
            {d.compare !== undefined ? (
              <>
                <div style={{
                  position: 'absolute', left: trackX, top: y + barH + 16, height: barH,
                  width: Math.round((trackW * d.compare / 100) * grow2),
                  background: ACC, borderRadius: 2,
                }} />
                <div style={{
                  position: 'absolute', left: trackX + Math.round((trackW * d.compare / 100) * grow2) + 20,
                  top: y + barH + 4, fontFamily: SANS, fontSize: 58, fontWeight: 600,
                  color: ACC, opacity: grow2,
                }}>
                  {Math.round(d.compare * grow2)}%
                </div>
              </>
            ) : null}
          </div>
        );
      })}

      {note ? (
        <div style={{
          position: 'absolute', left: SAFE, bottom: SAFE, width: CW - SAFE * 2,
          fontFamily: SERIF, fontSize: 38, color: SOFT, opacity: noteIn, fontStyle: 'italic',
        }}>
          {note}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};


// ===========================================================================
// ReqLedger - rows with a right-hand verdict stamp. Used twice:
//   (1) the six recommendations, presented neutrally
//   (2) the same six, scored BINDING / OFFER
// Also carries the human-assistance ladder (acceptable / not).
// ===========================================================================
export const reqLedgerSchema = z.object({
  title: z.string().default('The Ledger'),
  rows: z.array(z.object({
    tier: z.string().default(''),
    label: z.string(),
    verdict: z.string().default(''),
    accent: z.boolean().default(false),
  })).min(2).max(7),
  note: z.string().default(''),
  spark: z.string().default(''),
});
export type ReqLedgerProps = z.infer<typeof reqLedgerSchema>;

export const ReqLedger: React.FC<ReqLedgerProps> = ({ title, rows, note, spark }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const titleIn = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  const noteIn  = cl(interpolate(t, [0.76, 0.9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const n = rows.length;
  const top = 300;
  const bottom = 950;
  // Two rows must not render as two thin strips in the upper third.
  const rowH = Math.min(300, (bottom - top) / n);
  const cardW = CW - SAFE * 2;

  return (
    <AbsoluteFill style={{ background: BG }}>
      {spark ? <SparkLine line={spark} t={titleIn} /> : null}

      <div style={{
        position: 'absolute', left: SAFE, top: 140, width: cardW,
        fontFamily: SERIF, fontSize: 64, color: INK, opacity: titleIn,
        transform: `translateY(${(1 - titleIn) * 16}px)`,
      }}>
        {title}
      </div>

      {rows.map((r, i) => {
        const rowIn = cl(spring({ frame: frame - 12 - i * 9, fps, config: SPRING_GENTLE }));
        const y = top + i * rowH;
        return (
          <div key={r.label} style={{
            position: 'absolute', left: SAFE, top: y, width: cardW, height: rowH - 16,
            display: 'flex', alignItems: 'center',
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4,
            opacity: rowIn, transform: `translateX(${(1 - rowIn) * -26}px)`,
          }}>
            {r.tier ? (
              <div style={{
                width: 320, paddingLeft: 30, paddingRight: 28, boxSizing: 'border-box',
                fontFamily: SANS, fontSize: 23,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: SOFT,
              }}>
                {r.tier}
              </div>
            ) : <div style={{ width: 30 }} />}

            <div style={{
              flex: 1, paddingRight: 26, fontFamily: SERIF, fontSize: 46,
              color: INK, lineHeight: 1.2,
            }}>
              {r.label}
            </div>

            {r.verdict ? (
              <div style={{
                marginRight: 30, padding: '14px 26px', borderRadius: 3,
                fontFamily: SANS, fontSize: 26, letterSpacing: '0.12em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
                color: r.accent ? CARD : SOFT,
                background: r.accent ? ACC : 'transparent',
                border: r.accent ? 'none' : `1px solid ${BORDER}`,
              }}>
                {r.verdict}
              </div>
            ) : null}
          </div>
        );
      })}

      {note ? (
        <div style={{
          position: 'absolute', left: SAFE, bottom: SAFE - 30, width: cardW,
          fontFamily: SERIF, fontSize: 38, color: SOFT, opacity: noteIn, fontStyle: 'italic',
        }}>
          {note}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};


// ===========================================================================
// ReqDefinitionDrop - N parts of a stated definition land; the part that is
// MISSING from it ghosts in last, struck, in terracotta.
// ===========================================================================
export const reqDefinitionDropSchema = z.object({
  title: z.string().default('The definition'),
  parts: z.array(z.string()).min(2).max(6),
  missing: z.string().default(''),
  missingLabel: z.string().default('not in the list'),
  note: z.string().default(''),
  spark: z.string().default(''),
});
export type ReqDefinitionDropProps = z.infer<typeof reqDefinitionDropSchema>;

export const ReqDefinitionDrop: React.FC<ReqDefinitionDropProps> = ({
  title, parts, missing, missingLabel, note, spark,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const titleIn = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  const missIn  = cl(interpolate(t, [0.56, 0.70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const strike  = cl(interpolate(t, [0.72, 0.86], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const noteIn  = cl(interpolate(t, [0.86, 0.96], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const top = 290;
  const rowH = 154;

  return (
    <AbsoluteFill style={{ background: BG }}>
      {spark ? <SparkLine line={spark} t={titleIn} /> : null}

      <div style={{
        position: 'absolute', left: SAFE, top: 140, width: CW - SAFE * 2,
        fontFamily: SERIF, fontSize: 74, color: INK, opacity: titleIn,
      }}>
        {title}
      </div>

      {parts.map((p, i) => {
        const inn = cl(spring({ frame: frame - 14 - i * 11, fps, config: SPRING_GENTLE }));
        return (
          <div key={p} style={{
            position: 'absolute', left: SAFE + 20, top: top + i * rowH,
            display: 'flex', alignItems: 'baseline', gap: 26,
            opacity: inn, transform: `translateX(${(1 - inn) * -20}px)`,
          }}>
            <span style={{ fontFamily: SANS, fontSize: 28, color: GHOST, width: 54 }}>{i + 1}</span>
            <span style={{ fontFamily: SERIF, fontSize: 68, color: INK }}>{p}</span>
          </div>
        );
      })}

      {missing ? (
        <div style={{
          position: 'absolute', left: SAFE + 20, top: top + parts.length * rowH + 34,
          display: 'flex', alignItems: 'baseline', gap: 26, opacity: missIn,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 28, color: ACC, width: 54 }}>&mdash;</span>
          <span style={{ position: 'relative', fontFamily: SERIF, fontSize: 68, color: ACC }}>
            {missing}
            <span style={{
              position: 'absolute', left: 0, top: '54%', height: 2, background: ACC,
              width: `${Math.round(strike * 100)}%`,
            }} />
          </span>
          <span style={{
            fontFamily: SANS, fontSize: 26, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: ACC, opacity: strike,
          }}>
            {missingLabel}
          </span>
        </div>
      ) : null}

      {note ? (
        <div style={{
          position: 'absolute', left: SAFE, bottom: SAFE - 26, width: CW - SAFE * 2,
          fontFamily: SERIF, fontSize: 38, color: SOFT, opacity: noteIn, fontStyle: 'italic',
        }}>
          {note}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};


// ===========================================================================
// ReqLevers - the levers a university actually holds, as filled columns;
// what it cannot reach ghosts out on the right.
// ===========================================================================
export const reqLeversSchema = z.object({
  title: z.string().default('What it can require'),
  levers: z.array(z.object({
    name: z.string(),
    sub: z.string().default(''),
  })).min(1).max(4),
  blocked: z.array(z.string()).default([]),
  blockedLabel: z.string().default('out of reach'),
  note: z.string().default(''),
  spark: z.string().default(''),
});
export type ReqLeversProps = z.infer<typeof reqLeversSchema>;

export const ReqLevers: React.FC<ReqLeversProps> = ({ title, levers, blocked, blockedLabel, note, spark }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const titleIn = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  const blkIn   = cl(interpolate(t, [0.58, 0.74], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const noteIn  = cl(interpolate(t, [0.80, 0.93], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const hasBlocked = blocked.length > 0;
  const leftW = hasBlocked ? (CW - SAFE * 2) * 0.60 : CW - SAFE * 2;
  const colGap = 28;
  const colW = (leftW - colGap * (levers.length - 1)) / levers.length;
  const top = 300;
  const colH = 690;

  return (
    <AbsoluteFill style={{ background: BG }}>
      {spark ? <SparkLine line={spark} t={titleIn} /> : null}

      <div style={{
        position: 'absolute', left: SAFE, top: 140, width: CW - SAFE * 2,
        fontFamily: SERIF, fontSize: 80, color: INK, opacity: titleIn,
      }}>
        {title}
      </div>

      {levers.map((lv, i) => {
        const inn = cl(spring({ frame: frame - 12 - i * 12, fps, config: SPRING_GENTLE }));
        return (
          <div key={lv.name} style={{
            position: 'absolute', left: SAFE + i * (colW + colGap), top,
            width: colW, height: colH, background: CARD,
            border: `1px solid ${BORDER}`, borderTop: `5px solid ${ACC}`, borderRadius: 4,
            padding: '46px 36px', boxSizing: 'border-box',
            opacity: inn, transform: `translateY(${(1 - inn) * 30}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 26, letterSpacing: '0.16em', color: ACC, textTransform: 'uppercase' }}>
              LEVER {i + 1}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 64, color: INK, marginTop: 28, lineHeight: 1.1 }}>
              {lv.name}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 38, color: SOFT, marginTop: 30, lineHeight: 1.38 }}>
              {lv.sub}
            </div>
          </div>
        );
      })}

      {hasBlocked ? (
        <div style={{
          position: 'absolute', left: SAFE + leftW + 56, top,
          width: CW - SAFE * 2 - leftW - 56, height: colH, opacity: blkIn,
        }}>
          <div style={{
            fontFamily: SANS, fontSize: 26, letterSpacing: '0.16em',
            color: GHOST, textTransform: 'uppercase', marginBottom: 32,
          }}>
            {blockedLabel}
          </div>
          {blocked.map((b, i) => (
            <div key={b} style={{
              fontFamily: SERIF, fontSize: 50, color: GHOST,
              marginBottom: 30, lineHeight: 1.2,
              textDecoration: 'line-through', textDecorationColor: GHOST,
            }}>
              {b}
            </div>
          ))}
        </div>
      ) : null}

      {note ? (
        <div style={{
          position: 'absolute', left: SAFE, bottom: SAFE - 30, width: CW - SAFE * 2,
          fontFamily: SERIF, fontSize: 38, color: SOFT, opacity: noteIn, fontStyle: 'italic',
        }}>
          {note}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};


// ===========================================================================
// ReqRingWord - a verbatim sentence from a source; ONE word rings terracotta.
// The evidence is on screen and the voice reacts to it (SHOW-DON'T-TELL).
// ===========================================================================
export const reqRingWordSchema = z.object({
  before: z.string().default(''),
  word: z.string().default('urges'),
  after: z.string().default(''),
  attribution: z.string().default(''),
  note: z.string().default(''),
  spark: z.string().default(''),
});
export type ReqRingWordProps = z.infer<typeof reqRingWordSchema>;

export const ReqRingWord: React.FC<ReqRingWordProps> = ({ before, word, after, attribution, note, spark }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const textIn = cl(spring({ frame: frame - 4, fps, config: SPRING_GENTLE }));
  // FILL-THE-CANVAS: type auto-fits to the quote's length so a short sentence
  // does not leave the lower half of the frame empty (QC underfill, 2026-08-31).
  const chars = (before + word + after).length;
  const quotePx = chars <= 95  ? 134
                : chars <= 125 ? 116
                : chars <= 155 ? 96
                : chars <= 195 ? 80
                :                68;
  // A long quote also needs to start higher or it runs into the attribution.
  const quoteTop = chars <= 125 ? 260 : chars <= 195 ? 205 : 175;
  const ring   = cl(interpolate(t, [0.46, 0.66], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const noteIn = cl(interpolate(t, [0.74, 0.88], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{ background: BG }}>
      {spark ? <SparkLine line={spark} t={textIn} /> : null}

      <div style={{
        position: 'absolute', left: SAFE + 20, right: SAFE + 20, top: quoteTop,
        fontFamily: SERIF, fontSize: quotePx, color: INK, lineHeight: 1.36,
        opacity: textIn, transform: `translateY(${(1 - textIn) * 18}px)`,
      }}>
        {before}
        <span style={{ position: 'relative', display: 'inline-block', color: ring > 0.4 ? ACC : INK }}>
          {word}
          <span style={{
            position: 'absolute', left: -14, top: -10, right: -14, bottom: -8,
            border: `3px solid ${ACC}`, borderRadius: '48% 52% 47% 53% / 55% 45% 55% 45%',
            opacity: ring,
            transform: `scale(${0.86 + ring * 0.14}) rotate(${-2 + ring * 2}deg)`,
          }} />
        </span>
        {after}
      </div>

      {attribution ? (
        <div style={{
          position: 'absolute', left: SAFE + 20, bottom: SAFE + 140,
          fontFamily: SANS, fontSize: 32, letterSpacing: '0.1em',
          color: GHOST, textTransform: 'uppercase', opacity: noteIn,
        }}>
          {attribution}
        </div>
      ) : null}

      {note ? (
        <div style={{
          position: 'absolute', left: SAFE + 20, bottom: SAFE - 26, right: SAFE + 20,
          fontFamily: SERIF, fontSize: 44, color: SOFT, opacity: noteIn, fontStyle: 'italic',
        }}>
          {note}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
