import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CodingAgentsFig6Paradox — "The Expectations Paradox" (two-panel; †digitized).
 * Source: Anthropic, Coding Agents in the Social Sciences (May 2026)
 *
 * Left panel: two rising lines vs # AI use cases adopted (0→6), 1–10 positivity scale.
 *   Productivity line: ~6.1 → ~8.6 (rises steeply)
 *   Field impact line: ~4.6 → ~6.9 (rises, but always lower)
 *   Terracotta shades the persistent gap between the lines.
 *
 * Right panel (phase 2): non-agent vs agent users
 *   Non-agent: productivity ~7.2, field ~5.4
 *   Agent: productivity ~8.6, field ~7.0
 *
 * Stat chips: 88% above midpoint on productivity · half at 8+ · 70% more optimistic about papers than field.
 */

export const codingAgentsFig6ParadoxSchema = z.object({
  sparkLine: z.string().default('Good for my papers. Unclear for my science.'),
});
export type CodingAgentsFig6ParadoxProps = z.infer<typeof codingAgentsFig6ParadoxSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Left panel data: x = # use cases 0–6, y = 1–10 scale
const USE_X = [0, 1, 2, 3, 4, 5, 6];
const PROD_Y =  [6.1, 6.6, 7.1, 7.6, 8.0, 8.3, 8.6];
const FIELD_Y = [4.6, 5.0, 5.4, 5.8, 6.2, 6.5, 6.9];

const PHASE_SWITCH = 90;

export const CodingAgentsFig6Paradox: React.FC<CodingAgentsFig6ParadoxProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const phase2In = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 26, stiffness: 90, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const showP2 = frame >= PHASE_SWITCH;
  const lineProgress = clamp(interpolate(frame, [10, 80], [0, 1]), 0, 1);

  // Left chart geometry
  const L_LEFT = PAD_X;
  const L_RIGHT = showP2 ? width / 2 - 30 : width - PAD_X;
  const L_W = L_RIGHT - L_LEFT;
  const L_TOP = height * 0.28;
  const L_BOTTOM = height * 0.80;
  const L_H = L_BOTTOM - L_TOP;
  const lX = (xi: number) => L_LEFT + (xi / 6) * L_W;
  const lY = (y: number) => L_BOTTOM - ((y - 1) / 9) * L_H;

  // Right chart geometry
  const R_LEFT = width / 2 + 30;
  const R_W = width - PAD_X - R_LEFT;
  const R_TOP = height * 0.35;
  const R_BOTTOM = height * 0.80;
  const R_H = R_BOTTOM - R_TOP;
  const rY = (y: number) => R_BOTTOM - ((y - 1) / 9) * R_H;

  // Build progressive path up to lineProgress
  const nPoints = USE_X.length;
  const visibleIdx = Math.floor(lineProgress * (nPoints - 1));
  const frac = lineProgress * (nPoints - 1) - visibleIdx;
  const interpProd = (i: number) => {
    if (i < visibleIdx) return PROD_Y[i];
    if (i === visibleIdx && i < nPoints - 1) return PROD_Y[i] + (PROD_Y[i + 1] - PROD_Y[i]) * frac;
    return null;
  };
  const interpField = (i: number) => {
    if (i < visibleIdx) return FIELD_Y[i];
    if (i === visibleIdx && i < nPoints - 1) return FIELD_Y[i] + (FIELD_Y[i + 1] - FIELD_Y[i]) * frac;
    return null;
  };

  // Fill points for gap shading
  const fillPoints = USE_X.map((_, i) => {
    const py = interpProd(i);
    const fy = interpField(i);
    if (py === null || fy === null) return null;
    return { x: lX(USE_X[i]), prodY: lY(py), fieldY: lY(fy) };
  }).filter(Boolean) as { x: number; prodY: number; fieldY: number }[];

  const gapPath = fillPoints.length >= 2
    ? `M ${fillPoints.map(p => `${p.x},${p.prodY}`).join(' L ')} L ${[...fillPoints].reverse().map(p => `${p.x},${p.fieldY}`).join(' L ')} Z`
    : '';

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        POSITIVITY (1–10) vs AI USE · {showP2 ? 'AND BY AGENT ADOPTION' : 'BY # USE CASES ADOPTED'}
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Optimistic about papers. Worried about science.
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.13,
        display: 'flex', gap: 28, opacity: clamp(titleIn, 0, 1),
      }}>
        {[
          { label: 'Paper productivity', color: CLAUDE.SPARK },
          { label: 'Field impact', color: CLAUDE.INK_SOFT },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 2.5, background: l.color }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT }}>{l.label}</span>
          </div>
        ))}
      </div>

      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
        width={width} height={height}>

        {/* ─ LEFT PANEL ─ */}
        {/* Y gridlines */}
        {[2, 4, 6, 8, 10].map(v => (
          <React.Fragment key={v}>
            <line x1={L_LEFT} y1={lY(v)} x2={L_RIGHT} y2={lY(v)}
              stroke={CLAUDE.BORDER} strokeWidth={1} opacity={0.5}
            />
            <text x={L_LEFT - 8} y={lY(v) + 4}
              textAnchor="end" fontFamily={SANS} fontSize={height * 0.011}
              fill={CLAUDE.GHOST}>
              {v}
            </text>
          </React.Fragment>
        ))}

        {/* X-axis ticks */}
        {USE_X.map(x => (
          <text key={x} x={lX(x)} y={L_BOTTOM + 18}
            textAnchor="middle" fontFamily={SANS} fontSize={height * 0.011}
            fill={CLAUDE.GHOST}>
            {x}
          </text>
        ))}
        <text x={lX(3)} y={L_BOTTOM + 34}
          textAnchor="middle" fontFamily={SANS} fontSize={height * 0.012}
          fill={CLAUDE.GHOST}>
          # AI use cases adopted →
        </text>

        {/* Gap fill */}
        {gapPath && (
          <path d={gapPath} fill={CLAUDE.SPARK} opacity={0.12} />
        )}

        {/* Productivity line */}
        {fillPoints.length >= 2 && (
          <polyline
            points={fillPoints.map(p => `${p.x},${p.prodY}`).join(' ')}
            fill="none" stroke={CLAUDE.SPARK} strokeWidth={2.5}
          />
        )}

        {/* Field impact line */}
        {fillPoints.length >= 2 && (
          <polyline
            points={fillPoints.map(p => `${p.x},${p.fieldY}`).join(' ')}
            fill="none" stroke={CLAUDE.INK_SOFT} strokeWidth={2.5}
          />
        )}

        {/* X axis baseline */}
        <line x1={L_LEFT} y1={L_BOTTOM} x2={L_RIGHT} y2={L_BOTTOM}
          stroke={CLAUDE.BORDER} strokeWidth={1.5}
        />

        {/* ─ RIGHT PANEL (phase 2) ─ */}
        {showP2 && (() => {
          const p2o = clamp(phase2In, 0, 1);
          const groups = [
            { label: 'Non-agent\nusers', prod: 7.2, field: 5.4 },
            { label: 'Coding agent\nusers', prod: 8.6, field: 7.0 },
          ];
          const bW = R_W * 0.28;
          const gap = R_W * 0.15;
          const gxs = [R_LEFT + gap, R_LEFT + gap + bW + R_W * 0.12];

          return (
            <>
              <line x1={R_LEFT} y1={R_BOTTOM} x2={R_LEFT + R_W} y2={R_BOTTOM}
                stroke={CLAUDE.BORDER} strokeWidth={1.5} opacity={p2o}
              />
              {[2, 4, 6, 8, 10].map(v => (
                <React.Fragment key={v}>
                  <line x1={R_LEFT} y1={rY(v)} x2={R_LEFT + R_W} y2={rY(v)}
                    stroke={CLAUDE.BORDER} strokeWidth={1} opacity={0.5 * p2o}
                  />
                  <text x={R_LEFT - 8} y={rY(v) + 4}
                    textAnchor="end" fontFamily={SANS} fontSize={height * 0.011}
                    fill={CLAUDE.GHOST} opacity={p2o}>
                    {v}
                  </text>
                </React.Fragment>
              ))}
              {groups.map((g, gi) => {
                const bx = gxs[gi];
                const prodBarH = (rY(1) - rY(g.prod)) * p2o;
                const fieldBarH = (rY(1) - rY(g.field)) * p2o;
                return (
                  <React.Fragment key={g.label}>
                    {/* Productivity bar */}
                    <rect x={bx} y={rY(1) - prodBarH} width={bW * 0.45} height={prodBarH}
                      fill={CLAUDE.SPARK} opacity={p2o * 0.85}
                    />
                    {/* Field bar */}
                    <rect x={bx + bW * 0.55} y={rY(1) - fieldBarH} width={bW * 0.45} height={fieldBarH}
                      fill={CLAUDE.INK_SOFT} opacity={p2o * 0.7}
                    />
                    {/* Labels */}
                    <text x={bx + bW * 0.5} y={R_BOTTOM + 16}
                      textAnchor="middle" fontFamily={SANS} fontSize={height * 0.012}
                      fill={CLAUDE.INK} opacity={p2o}>
                      {g.label.split('\n')[0]}
                    </text>
                    <text x={bx + bW * 0.5} y={R_BOTTOM + 30}
                      textAnchor="middle" fontFamily={SANS} fontSize={height * 0.012}
                      fill={CLAUDE.INK_SOFT} opacity={p2o}>
                      {g.label.split('\n')[1] || ''}
                    </text>
                    {/* Values */}
                    <text x={bx + bW * 0.22} y={rY(1) - prodBarH - 5}
                      textAnchor="middle" fontFamily={SANS} fontSize={height * 0.012} fontWeight="bold"
                      fill={CLAUDE.SPARK} opacity={p2o}>
                      {g.prod}
                    </text>
                    <text x={bx + bW * 0.78} y={rY(1) - fieldBarH - 5}
                      textAnchor="middle" fontFamily={SANS} fontSize={height * 0.012}
                      fill={CLAUDE.INK_SOFT} opacity={p2o}>
                      {g.field}
                    </text>
                  </React.Fragment>
                );
              })}
            </>
          );
        })()}
      </svg>

      {/* Stat chips */}
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y + height * 0.13,
        display: 'flex', flexDirection: 'column' as const, gap: 8,
        opacity: showP2 ? clamp(phase2In, 0, 1) : 0,
        maxWidth: 240,
      }}>
        {[
          '88% rate productivity above midpoint',
          'Half rate it 8 or higher',
          '70% more optimistic about papers than about the field',
        ].map(s => (
          <div key={s} style={{
            background: CLAUDE.CARD, borderRadius: 8, border: `1px solid ${CLAUDE.BORDER}`,
            padding: '7px 12px',
            fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.INK_SOFT, lineHeight: 1.4,
          }}>
            {s}
          </div>
        ))}
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.11,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Data (†digitized): Anthropic, Coding Agents in the Social Sciences (2026)
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
