/**
 * FluencyTrap.tsx — reel-local Remotion components for claude-liam-fluency-trap.
 *
 * Palette: cream #F2F0E9, ink #3D3929, terracotta #D97757 (ONE accent).
 * All at 1920×1080, registered in Root.tsx.
 * REAL-PERSON CARE: FluencyVerdictStamps is hardcoded — no name props.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';

// ── Palette ───────────────────────────────────────────────────────────────────
const BG    = '#F2F0E9';
const INK   = '#3D3929';
const ACC   = '#D97757';
const SOFT  = '#73705F';
const GHOST = '#B0AD9A';
const CARD  = '#FFFFFF';
const BORDER = '#DDD9CC';

// ── Type stack ────────────────────────────────────────────────────────────────
const SERIF = '"EB Garamond", Georgia, "Times New Roman", serif';
const SANS  = '-apple-system, "SF Pro Text", "Segoe UI", sans-serif';

// ── Safe-margin layout constants ──────────────────────────────────────────────
const SAFE  = 80;   // px inset from each edge
const CW    = 1920; // canvas width
const CH    = 1080; // canvas height

// ── Clamp helper ──────────────────────────────────────────────────────────────
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// ── Spring config — gentle pop-in ────────────────────────────────────────────
const SPRING_GENTLE = { damping: 30, stiffness: 120, mass: 0.9 };


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FluencySegmentCard — Act card: Roman numeral + serif title + terracotta period
// Beats: B01 B05 B10 B16 B24 B28
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const fluencySegmentCardSchema = z.object({
  title: z.string().default('Act Title'),
  index: z.string().default('I'),
});
export type FluencySegmentCardProps = z.infer<typeof fluencySegmentCardSchema>;

export const FluencySegmentCard: React.FC<FluencySegmentCardProps> = ({ title, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn  = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  const textIn  = cl(spring({ frame: frame - 6, fps, config: SPRING_GENTLE }));
  const dotIn   = cl(spring({ frame: frame - 10, fps, config: SPRING_GENTLE }));

  return (
    <AbsoluteFill style={{ background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        opacity: cardIn, transform: `translateY(${(1 - cardIn) * 28}px)`,
      }}>
        {/* Eyebrow: "ACT · I" */}
        <div style={{
          fontFamily: SANS, fontSize: 18, letterSpacing: '0.18em',
          color: SOFT, textTransform: 'uppercase', opacity: textIn,
        }}>
          ACT · {index}
        </div>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: SERIF, fontSize: 80, fontWeight: 400,
            color: INK, lineHeight: 1.1, opacity: textIn,
          }}>
            {title}
          </span>
          <span style={{
            fontFamily: SERIF, fontSize: 80, fontWeight: 400,
            color: ACC, lineHeight: 1.1, opacity: dotIn,
          }}>
            .
          </span>
        </div>
        {/* Hairline underline */}
        <div style={{
          width: `${Math.round(textIn * 420)}px`, height: 1,
          background: INK, opacity: 0.35, transition: 'none',
        }} />
      </div>
    </AbsoluteFill>
  );
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FluencyDivergence — Two paths: linked → sever → both continue separately
// Beats: B04 ("the polish / the thought"), B23 ("verified / viral"), B30 ("tests understanding / tests performance")
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const fluencyDivergenceSchema = z.object({
  a:    z.string().default('Path A'),
  b:    z.string().default('Path B'),
  note: z.string().optional(),
});
export type FluencyDivergenceProps = z.infer<typeof fluencyDivergenceSchema>;

export const FluencyDivergence: React.FC<FluencyDivergenceProps> = ({ a, b, note }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const enterIn  = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  // Link severs at t≈0.5
  const linkOpacity = interpolate(t, [0.44, 0.54], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bPathShift  = interpolate(t, [0.5, 0.72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // B path dims after sever (for B04 "thought stalls")
  const bOpacity    = interpolate(t, [0.5, 0.75], [1, 0.45], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Reader-eye mark (terracotta ring tracking A) at t≈0.85
  const ringOpacity = interpolate(t, [0.82, 0.92], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const chipStyle = (accent?: boolean) => ({
    fontFamily: SERIF, fontSize: 26, color: accent ? CARD : INK,
    background: accent ? ACC : CARD,
    border: `1.5px solid ${accent ? ACC : BORDER}`,
    borderRadius: 12,
    padding: '20px 44px',
    boxShadow: '0 4px 18px rgba(61,57,41,0.10)',
    lineHeight: 1.3, textAlign: 'center' as const,
    maxWidth: 480,
  });

  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48,
        opacity: enterIn, transform: `scale(${0.92 + 0.08 * enterIn})`,
        width: CW - 2 * SAFE, position: 'relative',
      }}>
        {/* Row: A chip ——link—— B chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 48, width: '100%', justifyContent: 'center' }}>
          {/* Chip A — "POLISH" / "verified" / "understanding" */}
          <div style={chipStyle(true)}>{a}</div>

          {/* Link line */}
          <div style={{
            width: 90, height: 3, background: INK,
            opacity: linkOpacity, borderRadius: 2, flexShrink: 0,
          }} />

          {/* Chip B — "THOUGHT" / "viral" / "performance" */}
          <div style={{
            ...chipStyle(),
            opacity: bOpacity,
            transform: `translateY(${bPathShift * 70}px)`,
          }}>
            {b}
          </div>
        </div>

        {/* Terracotta ring (reader eye tracking A) */}
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translate(-280px, 0)',
          width: 60, height: 60, borderRadius: '50%',
          border: `3px solid ${ACC}`, opacity: ringOpacity,
        }} />

        {/* Note line */}
        {note && (
          <div style={{
            fontFamily: SANS, fontSize: 18, color: SOFT, textAlign: 'center',
            opacity: interpolate(t, [0.7, 0.9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            maxWidth: 720,
          }}>
            {note}
          </div>
        )}

        {/* "fluency is not provenance" kicker for B23 — rendered from note field */}
        <div style={{
          position: 'absolute', bottom: -120,
          fontFamily: SERIF, fontSize: 28, color: INK, letterSpacing: '0.01em',
          opacity: interpolate(t, [0.78, 0.95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          fluency is not provenance<span style={{ color: ACC }}>.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FluencyThreshold — A flow approaching a gate; gate labels it; stream thins
// Beats: B07 ("cue influence" → "awareness"), B32 ("what passes" → "traceable + disclosed")
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const fluencyThresholdSchema = z.object({
  axis: z.string().default('influence'),
  gate: z.string().default('awareness'),
  note: z.string().optional(),
});
export type FluencyThresholdProps = z.infer<typeof fluencyThresholdSchema>;

export const FluencyThreshold: React.FC<FluencyThresholdProps> = ({ axis, gate, note }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const enterIn   = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  // Gate label snaps on at t≈0.55
  const gateIn    = interpolate(t, [0.50, 0.62], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Stream thins after gate (from full → narrow)
  const streamW   = interpolate(t, [0.54, 0.78], [1.0, 0.18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const streamColor = t < 0.55 ? INK : GHOST;
  const noteIn    = interpolate(t, [0.80, 0.95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const TRACK_W = 860;
  const STREAM_H = 56;

  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60,
        opacity: enterIn, width: CW - 2 * SAFE,
      }}>
        {/* Axis label */}
        <div style={{
          fontFamily: SANS, fontSize: 18, letterSpacing: '0.14em', color: SOFT,
          textTransform: 'uppercase',
        }}>
          {axis}
        </div>

        {/* Stream → Gate → Thinned stream */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: TRACK_W }}>
          {/* Inflow stream */}
          <div style={{
            width: TRACK_W * 0.38, height: STREAM_H,
            background: INK, borderRadius: '6px 0 0 6px', opacity: 0.75,
          }} />

          {/* Gate post */}
          <div style={{
            position: 'relative', flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{
              width: 8, height: STREAM_H + 60,
              background: ACC, borderRadius: 4, flexShrink: 0,
            }} />
            {/* Gate label */}
            <div style={{
              position: 'absolute', top: -(STREAM_H * 0.5 + 60),
              fontFamily: SERIF, fontSize: 24, color: ACC, fontWeight: 400,
              opacity: gateIn, transform: `translateY(${(1 - gateIn) * 12}px)`,
              whiteSpace: 'nowrap', textAlign: 'center',
            }}>
              {gate}
            </div>
          </div>

          {/* Outflow stream — thins after gate triggers */}
          <div style={{
            width: TRACK_W * 0.60, height: Math.round(STREAM_H * streamW),
            background: streamColor, borderRadius: '0 6px 6px 0',
            opacity: 0.5, transition: 'none',
            alignSelf: 'center',
          }} />
        </div>

        {/* Note */}
        {note && (
          <div style={{
            fontFamily: SANS, fontSize: 18, color: SOFT,
            textAlign: 'center', maxWidth: 640,
            opacity: noteIn,
          }}>
            {note}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FluencySourceFlow — Linear chip pipeline; optional "banned" struck element
// Beats: B12 (talent/practice/hours → prose → reader), B29 (outline → draft → revision → notes; banned=keystrokes)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const fluencySourceFlowSchema = z.object({
  stages: z.array(z.string()).default(['Stage A', 'Stage B', 'Stage C']),
  note:   z.string().optional(),
  banned: z.string().optional(),
});
export type FluencySourceFlowProps = z.infer<typeof fluencySourceFlowSchema>;

export const FluencySourceFlow: React.FC<FluencySourceFlowProps> = ({ stages, note, banned }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const enterIn = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  const gateOpacity = interpolate(t, [0.52, 0.65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bannedOpacity = interpolate(t, [0.50, 0.62], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bannedStrike = interpolate(t, [0.55, 0.72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const stageChip = (label: string, i: number) => {
    const chipIn = cl(spring({ frame: frame - i * 4, fps, config: SPRING_GENTLE }));
    const isProxy = i === stages.length - 1;
    return (
      <React.Fragment key={i}>
        {i > 0 && (
          <div style={{
            fontFamily: SANS, fontSize: 28, color: SOFT, flexShrink: 0,
            opacity: chipIn, lineHeight: 1,
          }}>→</div>
        )}
        <div style={{
          fontFamily: SERIF, fontSize: 22, color: isProxy ? CARD : INK,
          background: isProxy ? ACC : CARD,
          border: `1.5px solid ${isProxy ? ACC : BORDER}`,
          borderRadius: 10, padding: '16px 32px',
          boxShadow: '0 3px 12px rgba(61,57,41,0.09)',
          opacity: chipIn, transform: `scale(${0.9 + 0.1 * chipIn})`,
          flexShrink: 0, textAlign: 'center' as const,
          lineHeight: 1.35,
        }}>
          {label}
        </div>
      </React.Fragment>
    );
  };

  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56,
        opacity: enterIn, width: CW - 2 * SAFE,
      }}>
        {/* Pipeline row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'center', gap: 20,
        }}>
          {stages.map((s, i) => stageChip(s, i))}
        </div>

        {/* Note */}
        {note && (
          <div style={{
            fontFamily: SANS, fontSize: 18, color: SOFT, textAlign: 'center',
            opacity: gateOpacity, maxWidth: 700,
          }}>
            {note}
          </div>
        )}

        {/* Banned element (struck-through) */}
        {banned && (
          <div style={{
            position: 'relative', display: 'inline-flex', alignItems: 'center',
            opacity: bannedOpacity,
          }}>
            <div style={{
              fontFamily: SERIF, fontSize: 20, color: GHOST,
              border: `1.5px solid ${GHOST}`, borderRadius: 8,
              padding: '12px 28px',
            }}>
              {banned}
            </div>
            {/* Strike-through line */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              height: 2, background: ACC,
              top: '50%',
              transform: `translateY(-50%) scaleX(${bannedStrike})`,
              transformOrigin: 'left',
            }} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FluencyVerdictStamps — Three detector verdicts on one essay; institution sides
// with the outlier; gavel + citation card. HARDCODED per real-person care.
// Beat: B22
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const fluencyVerdictStampsSchema = z.object({
  note: z.string().optional(),
});
export type FluencyVerdictStampsProps = z.infer<typeof fluencyVerdictStampsSchema>;

export const FluencyVerdictStamps: React.FC<FluencyVerdictStampsProps> = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const enterIn = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  // Stamps appear sequentially t≈0–0.5
  const stamp1In = interpolate(t, [0.06, 0.18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const stamp2In = interpolate(t, [0.18, 0.30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const stamp3In = interpolate(t, [0.30, 0.44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Institution sides with stamp 1 at t≈0.55; stamps 2+3 grey out
  const institutionIn = interpolate(t, [0.50, 0.62], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const humanGrey     = interpolate(t, [0.50, 0.68], [1, 0.28], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Citation card at t≈0.85
  const citeIn = interpolate(t, [0.82, 0.94], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const stamp = (text: string, color: string, opacity: number, scale = 1.0) => (
    <div style={{
      fontFamily: SANS, fontSize: 18, fontWeight: 700,
      color: CARD, background: color, borderRadius: 8,
      padding: '14px 28px', letterSpacing: '0.06em',
      opacity, transform: `scale(${scale})`, transition: 'none',
    }}>
      {text}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 52,
        opacity: enterIn, width: CW - 2 * SAFE,
      }}>
        {/* Essay card */}
        <div style={{
          background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 16,
          width: 560, padding: '36px 44px',
          boxShadow: '0 8px 32px rgba(61,57,41,0.12)',
        }}>
          <div style={{ fontFamily: SERIF, fontSize: 20, color: INK, lineHeight: 1.7 }}>
            <div style={{ marginBottom: 10, fontWeight: 700, color: SOFT }}>Student Essay</div>
            <div style={{ fontSize: 14, color: GHOST }}>— content redacted for display —</div>
          </div>
        </div>

        {/* Three stamps */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {/* Detector 1: 100% AI — sides with institution */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              fontFamily: SANS, fontSize: 13, color: SOFT, letterSpacing: '0.1em',
              opacity: stamp1In,
            }}>
              DETECTOR A
            </div>
            {stamp('100% AI', ACC, stamp1In,
              1 + institutionIn * 0.18)}
            <div style={{
              fontFamily: SANS, fontSize: 13, color: ACC, fontWeight: 600,
              opacity: institutionIn,
            }}>
              ← institution accepted this
            </div>
          </div>

          {/* Detector 2: HUMAN */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              fontFamily: SANS, fontSize: 13, color: SOFT, letterSpacing: '0.1em',
              opacity: stamp2In,
            }}>
              DETECTOR B
            </div>
            {stamp('HUMAN', '#4A7C59', stamp2In * humanGrey)}
          </div>

          {/* Detector 3: HUMAN */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              fontFamily: SANS, fontSize: 13, color: SOFT, letterSpacing: '0.1em',
              opacity: stamp3In,
            }}>
              DETECTOR C
            </div>
            {stamp('HUMAN', '#4A7C59', stamp3In * humanGrey)}
          </div>
        </div>

        {/* Citation card — small, name on card only, never in narration */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
          padding: '14px 28px',
          fontFamily: SANS, fontSize: 14, color: SOFT,
          opacity: citeIn, transform: `translateY(${(1 - citeIn) * 12}px)`,
        }}>
          Newby v. Adelphi Univ., 2026 · federal court ruling
        </div>
      </div>
    </AbsoluteFill>
  );
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FluencyChipGrid — Grid of chips with optional cracking foundation bar
// Beat: B25 (grading/hiring/disclosure/peer review; foundation="assumes polish is costly")
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const fluencyChipGridSchema = z.object({
  chips:      z.array(z.string()).default(['Domain A', 'Domain B', 'Domain C', 'Domain D']),
  foundation: z.string().optional(),
});
export type FluencyChipGridProps = z.infer<typeof fluencyChipGridSchema>;

export const FluencyChipGrid: React.FC<FluencyChipGridProps> = ({ chips, foundation }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const enterIn = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  // Foundation bar cracks at t≈0.7
  const crackIn    = interpolate(t, [0.68, 0.84], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const crackColor = t > 0.68 ? ACC : INK;

  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48,
        opacity: enterIn, width: CW - 2 * SAFE,
      }}>
        {/* Chip grid */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24,
        }}>
          {chips.map((chip, i) => {
            const chipIn = cl(spring({ frame: frame - i * 5, fps, config: SPRING_GENTLE }));
            return (
              <div key={i} style={{
                fontFamily: SERIF, fontSize: 28, color: INK,
                background: CARD, border: `1.5px solid ${BORDER}`,
                borderRadius: 12, padding: '22px 52px',
                boxShadow: '0 4px 16px rgba(61,57,41,0.09)',
                opacity: chipIn, transform: `scale(${0.88 + 0.12 * chipIn})`,
              }}>
                {chip}
              </div>
            );
          })}
        </div>

        {/* Foundation bar */}
        {foundation && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{
              fontFamily: SANS, fontSize: 17, color: SOFT, letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              shared assumption
            </div>
            <div style={{
              fontFamily: SERIF, fontSize: 24, color: t > 0.68 ? ACC : INK,
              background: t > 0.68 ? 'rgba(217,119,87,0.10)' : CARD,
              border: `2px solid ${t > 0.68 ? ACC : BORDER}`,
              borderRadius: 10, padding: '18px 56px',
              position: 'relative', overflow: 'hidden',
            }}>
              {foundation}
              {/* Crack overlay */}
              {crackIn > 0 && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: `${Math.round(crackIn * 4)}px`,
                  background: ACC, opacity: 0.7,
                }} />
              )}
            </div>
            {crackIn > 0.5 && (
              <div style={{
                fontFamily: SANS, fontSize: 16, color: ACC, fontWeight: 600,
                opacity: interpolate(crackIn, [0.5, 1.0], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}>
                assumption broken
              </div>
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FluencyScale — Simplified scale showing two outcomes; grade markers
// Beat: B18 (94% undetected, scored higher)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const fluencyScaleSchema = z.object({
  left_label:  z.string().default('Label A'),
  right_label: z.string().default('Label B'),
  note:        z.string().optional(),
});
export type FluencyScaleProps = z.infer<typeof fluencyScaleSchema>;

export const FluencyScale: React.FC<FluencyScaleProps> = ({ left_label, right_label, note }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const enterIn = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  // 94 chips pass at t≈0.5
  const chipPassIn  = interpolate(t, [0.08, 0.52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Grade markers settle above human median at t≈0.6
  const gradeIn     = interpolate(t, [0.56, 0.78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const CHIP_COUNT = 14; // representative grid of submissions

  return (
    <AbsoluteFill style={{ background: BG, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48,
        opacity: enterIn, width: CW - 2 * SAFE,
      }}>
        {/* Two columns: submissions → passed gate */}
        <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start' }}>
          {/* Left: Submission chips */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ fontFamily: SANS, fontSize: 16, color: SOFT, letterSpacing: '0.1em' }}>
              SUBMISSIONS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: 300 }}>
              {Array.from({ length: CHIP_COUNT }, (_, i) => {
                const chipIn = interpolate(chipPassIn, [i / CHIP_COUNT, Math.min(1, (i + 2) / CHIP_COUNT)], [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return (
                  <div key={i} style={{
                    width: 36, height: 36, borderRadius: 6,
                    background: INK, opacity: 0.7 * chipIn,
                    border: `1px solid ${BORDER}`,
                  }} />
                );
              })}
            </div>
          </div>

          {/* Arrow */}
          <div style={{ alignSelf: 'center', fontFamily: SANS, fontSize: 40, color: SOFT, opacity: chipPassIn }}>→</div>

          {/* Right: Passed the gate */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ fontFamily: SANS, fontSize: 16, color: SOFT, letterSpacing: '0.1em' }}>
              PASSED UNDETECTED
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: 300 }}>
              {Array.from({ length: Math.round(CHIP_COUNT * 0.94) }, (_, i) => {
                const chipIn = interpolate(chipPassIn, [0.6 + i * 0.03, Math.min(1, 0.65 + i * 0.03)], [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return (
                  <div key={i} style={{
                    width: 36, height: 36, borderRadius: 6,
                    background: ACC, opacity: chipIn,
                  }} />
                );
              })}
            </div>
            {/* Percentage label */}
            <div style={{
              fontFamily: SERIF, fontSize: 48, color: ACC, fontWeight: 400,
              opacity: chipPassIn,
            }}>
              94%
            </div>
          </div>
        </div>

        {/* Grade marker: AI subs scored HIGHER than human median */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          opacity: gradeIn, transform: `translateY(${(1 - gradeIn) * 20}px)`,
        }}>
          <div style={{
            fontFamily: SERIF, fontSize: 26, color: INK,
          }}>
            {right_label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              fontFamily: SANS, fontSize: 15, color: SOFT, letterSpacing: '0.08em',
            }}>
              AI submissions graded higher than real students
            </div>
          </div>
        </div>

        {/* Note */}
        {note && (
          <div style={{
            fontFamily: SANS, fontSize: 16, color: SOFT, textAlign: 'center',
            opacity: gradeIn, maxWidth: 640,
          }}>
            {note}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
