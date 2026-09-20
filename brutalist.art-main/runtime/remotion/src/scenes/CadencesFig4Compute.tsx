import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CadencesFig4Compute — "Compute Tracks Value" economics centerpiece.
 * Source: Anthropic Economic Index, Cadences (June 2026)
 *
 * Phase 1 (0–80f): wage-vs-tokens scatter (log scale implied by relative positions).
 *   Named points: Marketing managers $80/hr vs Editors $37/hr (~2.5× tokens).
 *   Terracotta outlier ring: Pharmacists $68/hr vs Statistical assistants $24/hr.
 * Phase 2 (80–end): tercile stat band (top vs bottom wage tercile).
 *
 * Terracotta moment: the 1.53× user-turns stat ("augmentation's signature").
 */

export const cadencesFig4ComputeSchema = z.object({
  sparkLine: z.string().default('More from Claude. More from you.'),
});
export type CadencesFig4ComputeProps = z.infer<typeof cadencesFig4ComputeSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Scatter: [wage_norm 0-1, tokens_norm 0-1, label, highlight]
const SCATTER_PTS: { wx: number; ty: number; label: string; hot?: boolean; outlier?: boolean }[] = [
  { wx: 0.20, ty: 0.18, label: 'Editors $37/hr',          hot: true },
  { wx: 0.55, ty: 0.42, label: 'Marketing mgrs $80/hr',   hot: true },
  { wx: 0.45, ty: 0.10, label: 'Stat. assistants $24/hr', outlier: true },
  { wx: 0.40, ty: 0.09, label: 'Pharmacists $68/hr',      outlier: true },
  // generic cloud
  { wx: 0.10, ty: 0.08, label: '' },
  { wx: 0.18, ty: 0.14, label: '' },
  { wx: 0.30, ty: 0.22, label: '' },
  { wx: 0.38, ty: 0.28, label: '' },
  { wx: 0.48, ty: 0.32, label: '' },
  { wx: 0.60, ty: 0.50, label: '' },
  { wx: 0.70, ty: 0.58, label: '' },
  { wx: 0.80, ty: 0.68, label: '' },
  { wx: 0.90, ty: 0.78, label: '' },
];

// Tercile data
const TERCILE = [
  { key: 'tokens',     label: 'Tokens per task',          top: '2.07×',  bottom: '1.0×',  accent: false },
  { key: 'output',     label: 'Claude output per turn',   top: '1.34×',  bottom: '1.0×',  accent: false },
  { key: 'turns',      label: 'User turns per task',      top: '1.53×',  bottom: '1.0×',  accent: true  },
  { key: 'thinking',   label: 'Extended thinking rate',   top: '34%',    bottom: '31%',   accent: false },
];

const PHASE_SWITCH = 80;

export const CadencesFig4Compute: React.FC<CadencesFig4ComputeProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn  = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const sparkIn  = spring({ frame: frame - 155, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const showPhase2 = frame >= PHASE_SWITCH;

  // Scatter geometry
  const SC_LEFT = PAD_X + 60;
  const SC_RIGHT = width - PAD_X;
  const SC_TOP = height * 0.28;
  const SC_BOTTOM = height * 0.80;
  const SC_W = SC_RIGHT - SC_LEFT;
  const SC_H = SC_BOTTOM - SC_TOP;

  const ptX = (wx: number) => SC_LEFT + wx * SC_W;
  const ptY = (ty: number) => SC_BOTTOM - ty * SC_H;

  // Tercile table geometry
  const TBL_TOP = height * 0.26;
  const COL_W = (width - 2 * PAD_X - 20) / TERCILE.length;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        {showPhase2 ? 'TOP vs BOTTOM WAGE TERCILE' : 'WAGE vs TOKEN USE · RELATIVE SCALE'}
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showPhase2
          ? 'Higher-wage tasks: more turns, not fewer.'
          : 'Compute tracks the value of work.'}
      </div>

      {/* ── PHASE 1: Scatter ── */}
      {!showPhase2 && (
        <>
          {/* Best-fit line */}
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
            width={width} height={height}>
            <line
              x1={SC_LEFT} y1={SC_BOTTOM}
              x2={SC_RIGHT} y2={SC_TOP}
              stroke={CLAUDE.BORDER}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              opacity={clamp(titleIn, 0, 1)}
            />
          </svg>

          {/* Axis labels */}
          <div style={{
            position: 'absolute', left: SC_LEFT + SC_W / 2 - 60, top: SC_BOTTOM + 16,
            fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.GHOST,
            opacity: clamp(titleIn, 0, 1),
          }}>
            Hourly wage →
          </div>
          <div style={{
            position: 'absolute', left: PAD_X, top: SC_TOP + SC_H / 2,
            fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.GHOST,
            transform: 'rotate(-90deg) translateX(-50%)',
            transformOrigin: 'left center',
            whiteSpace: 'nowrap' as const,
            opacity: clamp(titleIn, 0, 1),
          }}>
            Token use →
          </div>

          {/* Points */}
          {SCATTER_PTS.map((p, i) => {
            const ptAnim = spring({ frame: frame - 15 - i * 4, fps, config: { damping: 25, stiffness: 100, mass: 0.8 } });
            const ox = ptX(p.wx);
            const oy = ptY(p.ty);
            const r = p.hot || p.outlier ? 9 : 5;
            const color = p.outlier ? CLAUDE.SPARK : p.hot ? CLAUDE.INK : CLAUDE.INK_SOFT;

            return (
              <React.Fragment key={i}>
                <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}
                  width={width} height={height}>
                  {p.outlier && (
                    <circle cx={ox} cy={oy} r={r + 5}
                      fill="none" stroke={CLAUDE.SPARK} strokeWidth={1.5}
                      opacity={clamp(ptAnim, 0, 1)} />
                  )}
                  <circle cx={ox} cy={oy} r={r}
                    fill={color}
                    opacity={clamp(ptAnim, 0, 1) * (p.label ? 1 : 0.35)} />
                </svg>
                {p.label && clamp(ptAnim, 0, 1) > 0.6 && (
                  <div style={{
                    position: 'absolute',
                    left: ox + 12, top: oy - 10,
                    fontFamily: SANS, fontSize: height * 0.013, fontWeight: 600,
                    color: p.outlier ? CLAUDE.SPARK : CLAUDE.INK,
                    opacity: clamp(ptAnim, 0, 1),
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {p.label}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* 44% caption */}
          <div style={{
            position: 'absolute', right: PAD_X, bottom: height * 0.15,
            maxWidth: 260,
            fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT,
            textAlign: 'right' as const,
            opacity: interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            44% of the wage gradient explained by output mix.
          </div>

          <div style={{
            position: 'absolute', left: PAD_X, bottom: height * 0.11,
            fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
            opacity: clamp(titleIn, 0, 1),
          }}>
            Data: Anthropic Economic Index, Cadences (June 2026)
          </div>
        </>
      )}

      {/* ── PHASE 2: Tercile table ── */}
      {showPhase2 && TERCILE.map((t, i) => {
        const tAnim = spring({ frame: frame - PHASE_SWITCH - 8 - i * 10, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
        const bx = PAD_X + i * COL_W;

        return (
          <div key={t.key} style={{
            position: 'absolute',
            left: bx, top: TBL_TOP,
            width: COL_W - 16,
            background: t.accent ? `${CLAUDE.SPARK}15` : CLAUDE.CARD,
            borderRadius: 16,
            border: `1px solid ${t.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            padding: '28px 20px',
            opacity: clamp(tAnim, 0, 1),
            transform: `translateY(${(1 - clamp(tAnim, 0, 1)) * 20}px)`,
          }}>
            {/* Top tercile big stat */}
            <div style={{
              fontFamily: SERIF, fontSize: height * 0.050, fontWeight: 700,
              color: t.accent ? CLAUDE.SPARK : CLAUDE.INK,
              marginBottom: 6,
            }}>
              {t.top}
            </div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.GHOST,
              marginBottom: 12,
            }}>
              top-wage tercile
            </div>
            {/* Divider */}
            <div style={{ height: 1, background: CLAUDE.BORDER, marginBottom: 12 }} />
            {/* Bottom tercile */}
            <div style={{
              fontFamily: SERIF, fontSize: height * 0.032, fontWeight: 600,
              color: CLAUDE.INK_SOFT, marginBottom: 4,
            }}>
              {t.bottom}
            </div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.GHOST,
              marginBottom: 16,
            }}>
              bottom-wage tercile
            </div>
            {/* Label */}
            <div style={{
              fontFamily: SANS, fontSize: height * 0.013,
              color: t.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
              lineHeight: 1.4,
            }}>
              {t.label}
            </div>
          </div>
        );
      })}

      {/* Citation (phase 2) */}
      {showPhase2 && (
        <div style={{
          position: 'absolute', left: PAD_X, bottom: height * 0.11,
          fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
          opacity: clamp(phase2In, 0, 1),
        }}>
          Data: Anthropic Economic Index, Cadences (June 2026)
        </div>
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
