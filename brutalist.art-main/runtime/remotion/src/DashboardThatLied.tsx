/**
 * DashboardThatLied.tsx — reel-local Remotion components for
 * claude-liam-dashboard-that-lied (deep-explainer episode 3).
 *
 * Palette: cream #F2F0E9, ink #3D3929, terracotta #D97757 (ONE accent).
 * Three components:
 *   DtlScale      B18 — 1k rows + SCM vs 1B rows + correlations; gate opens for the model
 *   DtlChipGrid   B25 — analytics maturity stages + parallel-ladder note
 *   DtlLayerStack B27 + B29 — 4-property checklist (no layers) OR explicit layer stack (layers prop)
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
const SAFE  = 80;
const CW    = 1920;
const CH    = 1080;

// ── Spring config ─────────────────────────────────────────────────────────────
const SPRING_GENTLE = { damping: 30, stiffness: 120, mass: 0.9 };

const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DtlScale — B18: small data + SCM passes the gate; large data bounces off
// Props: left_label, right_label, note
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const dtlScaleSchema = z.object({
  left_label:  z.string().default('1,000 rows + SCM'),
  right_label: z.string().default('1,000,000,000 rows + correlations'),
  note:        z.string().optional().default('the gate only opens for the model'),
});
export type DtlScaleProps = z.infer<typeof dtlScaleSchema>;

export const DtlScale: React.FC<DtlScaleProps> = ({ left_label, right_label, note }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const enterIn    = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  const badgesIn   = cl(spring({ frame: frame - 10, fps, config: SPRING_GENTLE }));
  // Gate opens at t≈0.5 for left side
  const gateOpen   = interpolate(t, [0.44, 0.58], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Right side bounces at t≈0.6
  const rightBounce = interpolate(t, [0.58, 0.65, 0.72], [0, -18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const noteIn     = interpolate(t, [0.75, 0.92], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const PANEL_W  = 360;
  const GATE_X   = CW / 2;
  const SMALL_H  = 160;
  const LARGE_H  = 340;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{
        position: 'absolute', inset: SAFE,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: enterIn,
        gap: 40,
      }}>
        {/* Title */}
        <div style={{
          fontFamily: SANS, fontSize: 22, letterSpacing: '0.12em',
          color: SOFT, textTransform: 'uppercase',
        }}>
          A rung-two question
        </div>

        {/* Two-panel comparison */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          gap: 80, width: '100%',
        }}>
          {/* LEFT — small data + SCM */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            opacity: badgesIn,
          }}>
            {/* Block */}
            <div style={{
              width: PANEL_W, height: SMALL_H,
              background: CARD, border: `2px solid ${INK}`,
              borderRadius: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 12, padding: 20,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, letterSpacing: '0.12em', color: SOFT, textTransform: 'uppercase' }}>
                1,000 rows
              </div>
              <div style={{
                background: ACC, color: CARD,
                fontFamily: SANS, fontSize: 15, fontWeight: 600,
                padding: '6px 20px', borderRadius: 20, letterSpacing: '0.08em',
              }}>
                + structural causal model
              </div>
            </div>
            {/* Label */}
            <div style={{
              fontFamily: SERIF, fontSize: 22, color: INK,
              textAlign: 'center', maxWidth: PANEL_W + 40, lineHeight: 1.35,
            }}>
              {left_label}
            </div>
          </div>

          {/* Gate — opens for left side */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', flexShrink: 0,
          }}>
            {/* Gate posts (top & bottom) */}
            <div style={{
              width: 10, height: 180,
              background: interpolate(gateOpen, [0, 1], [INK, ACC]) as unknown as string,
              borderRadius: 5, marginBottom: 0,
              transition: 'none',
            }} />
            <div style={{
              width: 10, height: 180,
              background: interpolate(gateOpen, [0, 1], [INK, ACC]) as unknown as string,
              borderRadius: 5, marginTop: 0,
              transform: `translateY(${gateOpen * 80}px)`,
              transition: 'none',
            }} />
            {/* Gate label */}
            <div style={{
              position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
              left: '50%',
              fontFamily: SANS, fontSize: 14, letterSpacing: '0.1em',
              color: ACC, textTransform: 'uppercase', whiteSpace: 'nowrap',
              opacity: gateOpen,
              background: BG, padding: '4px 10px',
            }}>
              rung two
            </div>
          </div>

          {/* RIGHT — large data + correlations */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            opacity: badgesIn,
            transform: `translateY(${rightBounce}px)`,
          }}>
            {/* Block */}
            <div style={{
              width: PANEL_W, height: LARGE_H,
              background: GHOST, border: `2px solid ${GHOST}`,
              borderRadius: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 12, padding: 20,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, letterSpacing: '0.12em', color: SOFT, textTransform: 'uppercase' }}>
                1,000,000,000 rows
              </div>
              <div style={{
                background: GHOST, color: SOFT, border: `1.5px solid ${BORDER}`,
                fontFamily: SANS, fontSize: 15, fontWeight: 600,
                padding: '6px 20px', borderRadius: 20, letterSpacing: '0.08em',
              }}>
                + correlations
              </div>
            </div>
            {/* Label */}
            <div style={{
              fontFamily: SERIF, fontSize: 22, color: SOFT,
              textAlign: 'center', maxWidth: PANEL_W + 40, lineHeight: 1.35,
            }}>
              {right_label}
            </div>
          </div>
        </div>

        {/* Note */}
        {note && (
          <div style={{
            fontFamily: SERIF, fontSize: 26, color: INK,
            textAlign: 'center', opacity: noteIn,
            fontStyle: 'italic',
          }}>
            {note}<span style={{ color: ACC, fontStyle: 'normal' }}>.</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DtlChipGrid — B25: 4 analytics-maturity chips + parallel-ladder note
// Props: chips (string[]), note (optional)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const dtlChipGridSchema = z.object({
  chips: z.array(z.string()).default(['what happened', 'why', "what's next", 'what to do']),
  note:  z.string().optional().default('prescriptive ≠ rung two'),
});
export type DtlChipGridProps = z.infer<typeof dtlChipGridSchema>;

const STAGE_LABELS = ['DESCRIPTIVE', 'DIAGNOSTIC', 'PREDICTIVE', 'PRESCRIPTIVE'];

export const DtlChipGrid: React.FC<DtlChipGridProps> = ({ chips, note }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const enterIn  = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  const noteIn   = interpolate(t, [0.72, 0.90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Chips stagger in
  const chipIns  = chips.map((_, i) =>
    cl(spring({ frame: frame - i * 6, fps, config: SPRING_GENTLE }))
  );
  // Prescriptive-on-rung-1 marker at t≈0.55
  const markerIn = interpolate(t, [0.50, 0.65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{
        position: 'absolute', inset: SAFE,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: enterIn, gap: 48,
      }}>
        {/* Title */}
        <div style={{
          fontFamily: SERIF, fontSize: 38, fontWeight: 400, color: INK,
          letterSpacing: '0.01em',
        }}>
          Analytics Maturity Stages
        </div>

        {/* Chip row */}
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 20,
          width: '100%', justifyContent: 'center',
        }}>
          {chips.map((chip, i) => {
            const isLast = i === chips.length - 1;
            return (
              <div key={i} style={{
                opacity: chipIns[i],
                transform: `translateY(${(1 - chipIns[i]) * 24}px)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                minWidth: 230,
              }}>
                {/* Stage label */}
                <div style={{
                  fontFamily: SANS, fontSize: 13, letterSpacing: '0.14em',
                  color: isLast ? INK : SOFT, textTransform: 'uppercase',
                }}>
                  {STAGE_LABELS[i] ?? `STAGE ${i + 1}`}
                </div>
                {/* Card */}
                <div style={{
                  width: 230, minHeight: 100,
                  background: CARD, border: `${isLast ? 2 : 1.5}px solid ${isLast ? INK : BORDER}`,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '20px 24px', textAlign: 'center',
                }}>
                  <span style={{
                    fontFamily: SERIF, fontSize: 24, color: INK,
                    lineHeight: 1.35,
                  }}>
                    {chip}
                  </span>
                </div>
                {/* Arrow to next */}
                {i < chips.length - 1 && (
                  <div style={{ position: 'absolute', display: 'none' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Arrows between chips */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 0, marginTop: -36,
          width: chips.length * 250 + (chips.length - 1) * 20,
        }}>
          {chips.map((_, i) => (
            <React.Fragment key={i}>
              <div style={{ width: 250, flexShrink: 0 }} />
              {i < chips.length - 1 && (
                <div style={{
                  width: 20, height: 2, background: GHOST,
                  flexShrink: 0, position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', right: -4, top: -4,
                    width: 0, height: 0,
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: `8px solid ${GHOST}`,
                  }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Prescriptive-on-rung-1 marker */}
        <div style={{
          opacity: markerIn,
          display: 'flex', alignItems: 'center', gap: 20,
          background: CARD, border: `1.5px solid ${BORDER}`,
          borderRadius: 12, padding: '14px 32px',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            border: `2.5px solid ${ACC}`, flexShrink: 0,
          }} />
          <span style={{ fontFamily: SANS, fontSize: 18, color: SOFT }}>
            prescriptive org · Pearl's Ladder →
          </span>
          <div style={{
            background: SOFT, color: CARD,
            fontFamily: SANS, fontSize: 14, fontWeight: 600,
            padding: '4px 16px', borderRadius: 20, letterSpacing: '0.08em',
          }}>
            rung one
          </div>
        </div>

        {/* Note */}
        {note && (
          <div style={{
            fontFamily: SERIF, fontSize: 28, color: ACC, fontWeight: 400,
            textAlign: 'center', opacity: noteIn, letterSpacing: '0.01em',
          }}>
            {note}<span style={{ color: INK }}>.</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DtlLayerStack — B27 (checklist mode: no layers) + B29 (stack mode: layers provided)
// Props: layers (optional string[]), note (optional)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const dtlLayerStackSchema = z.object({
  layers: z.array(z.string()).optional(),
  note:   z.string().optional(),
});
export type DtlLayerStackProps = z.infer<typeof dtlLayerStackSchema>;

const LIVING_MODEL_ROWS = [
  { label: 'Causal',              detail: 'recommendations are estimated do-effects' },
  { label: 'Counterfactual',      detail: 'can price the decision not taken' },
  { label: 'Continually updated', detail: 'parameters live against incoming data' },
  { label: 'Treatment-oriented',  detail: 'output is a ranked list of interventions' },
];

const CHECKLIST_SCORES: Record<string, string[]> = {
  'DASHBOARD': ['✗', '✗', '✗', '✗'],
  'PREDICTIVE': ['✗', '✗', '✓', '✗'],
  'PRESCRIPTIVE': ['✗', '✗', '✓', '✓'],
  'LIVING MODEL': ['✓', '✓', '✓', '✓'],
};

export const DtlLayerStack: React.FC<DtlLayerStackProps> = ({ layers, note }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const enterIn = cl(spring({ frame, fps, config: SPRING_GENTLE }));
  const noteIn  = interpolate(t, [0.78, 0.95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Mode: explicit layer stack (B29) ──────────────────────────────────────
  if (layers && layers.length > 0) {
    const layerIns = layers.map((_, i) =>
      cl(spring({ frame: frame - i * 8, fps, config: SPRING_GENTLE }))
    );
    const stampsIn = interpolate(t, [0.48, 0.65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const flipIn   = interpolate(t, [0.65, 0.80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    return (
      <AbsoluteFill style={{ background: BG }}>
        <div style={{
          position: 'absolute', inset: SAFE,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', opacity: enterIn, gap: 0,
        }}>
          {/* Title */}
          <div style={{
            fontFamily: SERIF, fontSize: 36, fontWeight: 400, color: INK,
            marginBottom: 48, letterSpacing: '0.01em',
          }}>
            Two unverified trust links
          </div>

          {/* Stacked layers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: 900 }}>
            {layers.map((layer, i) => {
              const isTop = i === layers.length - 1;
              const isBottom = i === 0;
              return (
                <div key={i} style={{
                  opacity: layerIns[i],
                  transform: `translateY(${(1 - layerIns[i]) * 16}px)`,
                }}>
                  {/* Connector arrow going up */}
                  {i < layers.length - 1 && (
                    <div style={{
                      display: 'flex', justifyContent: 'center',
                      height: 48, alignItems: 'center',
                    }}>
                      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 2, height: 28, background: GHOST }} />
                        {/* UNVERIFIED / VERIFIABLE stamp */}
                        <div style={{
                          position: 'absolute', left: 18,
                          fontFamily: SANS, fontSize: 13, letterSpacing: '0.1em',
                          color: interpolate(flipIn, [0, 1], [0.0, 0.0]) > 0.5 ? ACC : SOFT,
                          opacity: stampsIn,
                          textTransform: 'uppercase',
                        }}>
                          {flipIn > 0.5
                            ? <span style={{ color: ACC }}>VERIFIABLE</span>
                            : <span style={{ color: SOFT }}>UNVERIFIED</span>
                          }
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Layer card */}
                  <div style={{
                    background: isTop ? INK : CARD,
                    border: `2px solid ${isTop ? INK : BORDER}`,
                    borderRadius: 10,
                    padding: '22px 36px',
                    textAlign: 'center',
                  }}>
                    <span style={{
                      fontFamily: SERIF, fontSize: 26,
                      color: isTop ? CARD : INK,
                      lineHeight: 1.3,
                    }}>
                      {layer}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Note */}
          {note && (
            <div style={{
              fontFamily: SERIF, fontSize: 26, color: ACC, marginTop: 40,
              opacity: noteIn, textAlign: 'center',
            }}>
              {note}<span style={{ color: INK }}>.</span>
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // ── Mode: checklist grid (B27) ─────────────────────────────────────────────
  const rowIns = LIVING_MODEL_ROWS.map((_, i) =>
    cl(spring({ frame: frame - i * 7, fps, config: SPRING_GENTLE }))
  );
  const colIns = Object.keys(CHECKLIST_SCORES).map((_, i) =>
    interpolate(t, [0.40 + i * 0.06, 0.55 + i * 0.06], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );

  const COLS = Object.entries(CHECKLIST_SCORES);

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{
        position: 'absolute', inset: SAFE,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', opacity: enterIn, gap: 40,
      }}>
        {/* Title */}
        <div style={{
          fontFamily: SERIF, fontSize: 38, fontWeight: 400, color: INK,
          letterSpacing: '0.01em',
        }}>
          The Living Model Checklist
        </div>

        {/* Property rows */}
        <div style={{ display: 'flex', gap: 0, width: '100%', maxWidth: 1500 }}>
          {/* Property column */}
          <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{
              height: 52, display: 'flex', alignItems: 'center',
              fontFamily: SANS, fontSize: 14, letterSpacing: '0.12em',
              color: SOFT, textTransform: 'uppercase', paddingBottom: 8,
            }}>
              Property
            </div>
            {LIVING_MODEL_ROWS.map((row, i) => (
              <div key={i} style={{
                height: 88,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                borderTop: `1px solid ${BORDER}`, paddingRight: 24,
                opacity: rowIns[i],
              }}>
                <div style={{ fontFamily: SERIF, fontSize: 22, color: INK, fontWeight: 400 }}>
                  {row.label}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: SOFT, marginTop: 4 }}>
                  {row.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Score columns */}
          {COLS.map(([colName, scores], ci) => {
            const isLiving = ci === COLS.length - 1;
            return (
              <div key={ci} style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', gap: 0,
                alignItems: 'center',
                opacity: colIns[ci],
              }}>
                {/* Column header */}
                <div style={{
                  height: 52, display: 'flex', alignItems: 'center',
                  fontFamily: SANS, fontSize: 14, letterSpacing: '0.10em',
                  color: isLiving ? ACC : SOFT, textTransform: 'uppercase',
                  textAlign: 'center', paddingBottom: 8,
                }}>
                  {colName}
                </div>
                {/* Score cells */}
                {scores.map((score, ri) => (
                  <div key={ri} style={{
                    height: 88, width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderTop: `1px solid ${BORDER}`,
                    background: isLiving && score === '✓' ? 'rgba(217,119,87,0.07)' : 'transparent',
                  }}>
                    <span style={{
                      fontFamily: SANS, fontSize: 24,
                      color: score === '✓' ? (isLiving ? ACC : INK) : GHOST,
                      fontWeight: score === '✓' ? 600 : 400,
                    }}>
                      {score}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Note */}
        {note && (
          <div style={{
            fontFamily: SANS, fontSize: 16, color: SOFT,
            textAlign: 'center', opacity: noteIn,
            letterSpacing: '0.04em',
          }}>
            {note}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
