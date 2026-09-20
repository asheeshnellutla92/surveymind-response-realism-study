import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CadencesFig7Jobs — "Whose Job Changes" (rebuilt from report Fig 3.5; † digitized).
 * Source: Anthropic Economic Index, Cadences (June 2026)
 *
 * Two stacked-bar panels: Responsibilities change | Job loss
 * For: Self, Peer, Junior, Senior
 * Stacks: Very Likely (>80%) solid terracotta, Likely (60–80%) tint.
 *
 * Values (†digitized):
 *   Responsibilities: Self 46 (20 VL) | Peer 39 (13 VL) | Junior 55 (31 VL) | Senior 39 (19 VL)
 *   Job loss:         Self 9  (4 VL)  | Peer 17 (7 VL)  | Junior 40 (18 VL) | Senior 20 (9 VL)
 *
 * Animate: responsibilities panel first, then job loss (floor drops).
 * Terracotta moment: Junior bars pulse with a ring.
 */

export const cadencesFig7JobsSchema = z.object({
  sparkLine: z.string().default('It\'ll happen to someone junior.'),
});
export type CadencesFig7JobsProps = z.infer<typeof cadencesFig7JobsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const PEOPLE = ['Self', 'Peer', 'Junior', 'Senior'];

const RESP_DATA = [
  { person: 'Self',   total: 46, vl: 20 },
  { person: 'Peer',  total: 39, vl: 13 },
  { person: 'Junior',total: 55, vl: 31 },
  { person: 'Senior',total: 39, vl: 19 },
];
const LOSS_DATA = [
  { person: 'Self',   total: 9,  vl: 4  },
  { person: 'Peer',  total: 17, vl: 7  },
  { person: 'Junior',total: 40, vl: 18 },
  { person: 'Senior',total: 20, vl: 9  },
];

const PHASE_SWITCH = 75;
const MAX_Y = 60; // cap for chart

export const CadencesFig7Jobs: React.FC<CadencesFig7JobsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn   = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const phase2In  = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const sparkIn   = spring({ frame: frame - 145, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const showP2    = frame >= PHASE_SWITCH;

  const PANEL_W   = (width - 2 * PAD_X - 60) / 2;
  const P1_LEFT   = PAD_X;
  const P2_LEFT   = PAD_X + PANEL_W + 60;
  const BAR_TOP   = height * 0.28;
  const BAR_BOTTOM = height * 0.78;
  const BAR_H     = BAR_BOTTOM - BAR_TOP;
  const GROUP_W   = PANEL_W / PEOPLE.length;
  const BAR_W     = GROUP_W * 0.5;

  const renderBars = (
    data: typeof RESP_DATA,
    panelLeft: number,
    animDelay: number,
    show: boolean,
  ) => {
    if (!show) return null;
    return data.map((d, i) => {
      const barAnim = spring({ frame: frame - animDelay - i * 8, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
      const bx = panelLeft + i * GROUP_W + (GROUP_W - BAR_W) / 2;
      const isJunior = d.person === 'Junior';
      const totalH = (d.total / MAX_Y) * BAR_H * clamp(barAnim, 0, 1);
      const vlH    = (d.vl    / MAX_Y) * BAR_H * clamp(barAnim, 0, 1);
      const likelyH = totalH - vlH;

      return (
        <React.Fragment key={d.person}>
          {/* Likely segment (lighter tint) */}
          <div style={{
            position: 'absolute',
            left: bx, top: BAR_BOTTOM - totalH,
            width: BAR_W, height: likelyH,
            background: isJunior ? `${CLAUDE.SPARK}80` : `${CLAUDE.INK_SOFT}55`,
            borderRadius: '4px 4px 0 0',
          }} />
          {/* Very Likely segment (solid) */}
          <div style={{
            position: 'absolute',
            left: bx, top: BAR_BOTTOM - vlH,
            width: BAR_W, height: vlH,
            background: isJunior ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
          }} />
          {/* Total label */}
          {clamp(barAnim, 0, 1) > 0.8 && (
            <div style={{
              position: 'absolute',
              left: bx, top: BAR_BOTTOM - totalH - 22,
              width: BAR_W, fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
              color: isJunior ? CLAUDE.SPARK : CLAUDE.INK,
              textAlign: 'center' as const,
            }}>
              {d.total}%
            </div>
          )}
          {/* Person label */}
          <div style={{
            position: 'absolute',
            left: bx, top: BAR_BOTTOM + 10,
            width: BAR_W, fontFamily: SERIF, fontSize: height * 0.015,
            color: isJunior ? CLAUDE.SPARK : CLAUDE.INK,
            fontWeight: isJunior ? 700 : 500,
            textAlign: 'center' as const,
            opacity: clamp(barAnim, 0, 1),
          }}>
            {d.person}
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        % RATING AS LIKELY OR VERY LIKELY · SELF-REPORTED
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showP2 ? 'Job loss: the floor drops.' : 'Everyone expects responsibility shifts.'}
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.13,
        display: 'flex', gap: 24, opacity: clamp(titleIn, 0, 1),
      }}>
        {[
          { label: 'Very Likely (>80%)', color: CLAUDE.INK_SOFT },
          { label: 'Likely (60–80%)',    color: `${CLAUDE.INK_SOFT}55` },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>

      {/* Panel headers */}
      {[
        { left: P1_LEFT, label: 'Responsibilities change' },
        showP2 && { left: P2_LEFT, label: 'Job loss' },
      ].filter(Boolean).map((p: any) => (
        <div key={p.label} style={{
          position: 'absolute',
          left: p.left, top: BAR_TOP - height * 0.04,
          fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
          color: CLAUDE.INK_SOFT, letterSpacing: 1,
          opacity: clamp(p.label === 'Job loss' ? phase2In : titleIn, 0, 1),
        }}>
          {p.label}
        </div>
      ))}

      {/* Y gridlines */}
      {[0, 20, 40, 60].map(v => {
        const y = BAR_BOTTOM - (v / MAX_Y) * BAR_H;
        return (
          <React.Fragment key={v}>
            <div style={{
              position: 'absolute', left: PAD_X, top: y,
              width: width - 2 * PAD_X, height: 1,
              background: CLAUDE.BORDER, opacity: 0.5,
            }} />
            <div style={{
              position: 'absolute', right: width - PAD_X + 6, top: y - 9,
              fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
              textAlign: 'right' as const,
            }}>
              {v}%
            </div>
          </React.Fragment>
        );
      })}

      {/* Bars: Panel 1 — always */}
      {renderBars(RESP_DATA, P1_LEFT, 15, true)}

      {/* Bars: Panel 2 — phase 2 */}
      {renderBars(LOSS_DATA, P2_LEFT, PHASE_SWITCH, showP2)}

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Data (†digitized): Anthropic Economic Index, Cadences (June 2026), Fig 3.5
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
