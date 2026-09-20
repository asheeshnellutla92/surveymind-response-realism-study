import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CadencesFig6Tide — "The Rising Tide" (rebuilt from report Fig 3.3).
 * Source: Anthropic Economic Index, Cadences (June 2026)
 *
 * Two scatter panels side by side:
 *   Left:  observed exposure (x) vs stated task share (y)
 *   Right: Eloundou et al. (2023) theoretical exposure (x) vs same
 * Grey dots = share doable today; orange dots = expected in 12 months.
 * Dashed 45° reference. Both best-fit lines essentially parallel.
 *
 * Terracotta moment: the constant gap between the two best-fit lines
 * (everyone expects the same increment regardless of exposure).
 */

export const cadencesFig6TideSchema = z.object({
  sparkLine: z.string().default('A rising tide. Same increment everywhere.'),
});
export type CadencesFig6TideProps = z.infer<typeof cadencesFig6TideSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Mock scatter: [exposure 0-1, today 0-1, future 0-1]
const SCATTER: { x: number; tod: number; fut: number }[] = [
  { x: 0.10, tod: 0.12, fut: 0.28 },
  { x: 0.20, tod: 0.18, fut: 0.34 },
  { x: 0.30, tod: 0.25, fut: 0.42 },
  { x: 0.40, tod: 0.32, fut: 0.48 },
  { x: 0.50, tod: 0.40, fut: 0.56 },
  { x: 0.60, tod: 0.46, fut: 0.62 },
  { x: 0.70, tod: 0.54, fut: 0.70 },
  { x: 0.80, tod: 0.60, fut: 0.76 },
  { x: 0.90, tod: 0.68, fut: 0.84 },
];

export const CadencesFig6Tide: React.FC<CadencesFig6TideProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn  = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const todIn    = spring({ frame: frame - 15, fps, config: { damping: 24, stiffness: 70, mass: 1.1 } });
  const futIn    = spring({ frame: frame - 50, fps, config: { damping: 24, stiffness: 70, mass: 1.1 } });
  const gapIn    = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const sparkIn  = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  // Two panels side by side
  const PANEL_W = (width - 3 * PAD_X) / 2;
  const PANELS = [
    { left: PAD_X, label: 'Observed exposure' },
    { left: PAD_X * 2 + PANEL_W, label: 'Eloundou et al. (2023)' },
  ];

  const SC_TOP    = height * 0.30;
  const SC_BOTTOM = height * 0.80;
  const SC_H      = SC_BOTTOM - SC_TOP;

  const ptX = (px: number, exp: number) => px + exp * PANEL_W;
  const ptY = (v: number) => SC_BOTTOM - v * SC_H;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        EXPECTED AI TASK SHARE vs EXPOSURE · N≈9,700
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Everyone expects the same increment of progress.
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.13,
        display: 'flex', gap: 24, opacity: clamp(titleIn, 0, 1),
      }}>
        {[
          { label: 'Doable today',        color: CLAUDE.INK_SOFT },
          { label: 'Expected in 12 months', color: CLAUDE.SPARK },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>

      {/* SVG: both panels */}
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        width={width} height={height}>

        {PANELS.map(panel => (
          <React.Fragment key={panel.label}>
            {/* 45° reference line */}
            <line
              x1={ptX(panel.left, 0)} y1={ptY(0)}
              x2={ptX(panel.left, 1)} y2={ptY(1)}
              stroke={CLAUDE.BORDER} strokeWidth={1.2}
              strokeDasharray="5 4"
              opacity={clamp(titleIn, 0, 1)}
            />

            {/* "Today" grey dots */}
            {SCATTER.map((d, i) => {
              const pA = spring({ frame: frame - 15 - i * 4, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
              return (
                <circle key={`tod-${i}`}
                  cx={ptX(panel.left, d.x)} cy={ptY(d.tod)} r={5}
                  fill={CLAUDE.INK_SOFT}
                  opacity={clamp(pA, 0, 1) * 0.6 * clamp(todIn, 0, 1)}
                />
              );
            })}

            {/* "Future" orange dots */}
            {SCATTER.map((d, i) => {
              const pA = spring({ frame: frame - 50 - i * 4, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
              return (
                <circle key={`fut-${i}`}
                  cx={ptX(panel.left, d.x)} cy={ptY(d.fut)} r={5}
                  fill={CLAUDE.SPARK}
                  opacity={clamp(pA, 0, 1) * clamp(futIn, 0, 1)}
                />
              );
            })}

            {/* Today best-fit line */}
            {clamp(todIn, 0, 1) > 0.5 && (
              <line
                x1={ptX(panel.left, 0.05)} y1={ptY(0.07)}
                x2={ptX(panel.left, 0.95)} y2={ptY(0.73)}
                stroke={CLAUDE.INK_SOFT} strokeWidth={1.5}
                opacity={clamp(todIn, 0, 1)}
              />
            )}

            {/* Future best-fit line */}
            {clamp(futIn, 0, 1) > 0.5 && (
              <line
                x1={ptX(panel.left, 0.05)} y1={ptY(0.23)}
                x2={ptX(panel.left, 0.95)} y2={ptY(0.89)}
                stroke={CLAUDE.SPARK} strokeWidth={1.5}
                opacity={clamp(futIn, 0, 1)}
              />
            )}

            {/* Constant-gap bracket (terracotta moment) */}
            {clamp(gapIn, 0, 1) > 0.3 && (
              <>
                <line
                  x1={ptX(panel.left, 0.5)} y1={ptY(0.40)}
                  x2={ptX(panel.left, 0.5)} y2={ptY(0.56)}
                  stroke={CLAUDE.SPARK} strokeWidth={2.5}
                  opacity={clamp(gapIn, 0, 1)}
                />
                <line x1={ptX(panel.left, 0.5) - 6} y1={ptY(0.40)} x2={ptX(panel.left, 0.5) + 6} y2={ptY(0.40)}
                  stroke={CLAUDE.SPARK} strokeWidth={2}
                  opacity={clamp(gapIn, 0, 1)}
                />
                <line x1={ptX(panel.left, 0.5) - 6} y1={ptY(0.56)} x2={ptX(panel.left, 0.5) + 6} y2={ptY(0.56)}
                  stroke={CLAUDE.SPARK} strokeWidth={2}
                  opacity={clamp(gapIn, 0, 1)}
                />
              </>
            )}

            {/* Axes */}
            <line x1={ptX(panel.left, 0)} y1={SC_BOTTOM}
              x2={ptX(panel.left, 1)} y2={SC_BOTTOM}
              stroke={CLAUDE.BORDER} strokeWidth={1.5} />
          </React.Fragment>
        ))}
      </svg>

      {/* Panel labels */}
      {PANELS.map(panel => (
        <div key={panel.label} style={{
          position: 'absolute',
          left: panel.left, top: SC_BOTTOM + 14,
          width: PANEL_W,
          fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.GHOST,
          textAlign: 'center' as const,
          opacity: clamp(titleIn, 0, 1),
        }}>
          {panel.label}
        </div>
      ))}

      {/* Gap label */}
      {clamp(gapIn, 0, 1) > 0.3 && (
        <div style={{
          position: 'absolute',
          left: PAD_X + PANEL_W / 2 + 16,
          top: ptY(0.48) - 12,
          fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.SPARK, fontWeight: 700,
          opacity: clamp(gapIn, 0, 1),
        }}>
          constant gap
        </div>
      )}

      {/* Stat chips */}
      <div style={{
        position: 'absolute', right: PAD_X, top: height * 0.30,
        display: 'flex', flexDirection: 'column' as const, gap: 12,
        opacity: clamp(gapIn, 0, 1),
      }}>
        {[
          { stat: '~6 in 10', desc: 'expect higher AI share next year' },
          { stat: '>1/3',     desc: 'expect AI does most or nearly all' },
        ].map(s => (
          <div key={s.stat} style={{
            background: CLAUDE.CARD, borderRadius: 12, border: `1px solid ${CLAUDE.BORDER}`,
            padding: '12px 16px', maxWidth: 200,
          }}>
            <div style={{ fontFamily: SERIF, fontSize: height * 0.030, fontWeight: 700, color: CLAUDE.INK }}>
              {s.stat}
            </div>
            <div style={{ fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Data: Anthropic Economic Index, Cadences (June 2026)
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
