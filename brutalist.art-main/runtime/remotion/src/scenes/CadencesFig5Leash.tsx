import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CadencesFig5Leash — "The Leash" autonomy split.
 * Source: Anthropic Economic Index, Cadences (June 2026)
 *
 * Paired horizontal bars per output type: chat vs Claude Code on 1–5 autonomy scale.
 * Code higher in 26 of 31 types; overall gap +0.37; scripts +0.53.
 * Big-type center comparison: blog post chat=13 rounds vs Code=1 prompt.
 * Counter-argument beat: 54% Code sessions run Opus vs 10% chat — but
 * Sonnet-only gap persists at +0.26.
 *
 * Terracotta moment: the +0.37 overall gap callout.
 */

export const cadencesFig5LeashSchema = z.object({
  sparkLine: z.string().default('The product sets the leash length.'),
});
export type CadencesFig5LeashProps = z.infer<typeof cadencesFig5LeashSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Output types: [label, chat_autonomy, code_autonomy] (scale 1–5)
const OUTPUTS = [
  { label: 'Scripts & code snippets', chat: 2.80, code: 3.33 },
  { label: 'Blog posts',              chat: 2.90, code: 3.15 },
  { label: 'Email drafts',            chat: 3.10, code: 3.40 },
  { label: 'Analyses',                chat: 2.60, code: 2.90 },
  { label: 'Apps (overall)',          chat: 2.50, code: 2.90 },
  { label: 'Database queries',        chat: 2.70, code: 3.00 },
];

const MAX_SCALE = 5;
const PHASE_SWITCH = 80;

export const CadencesFig5Leash: React.FC<CadencesFig5LeashProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.07;
  const PAD_Y = height * 0.08;

  const titleIn  = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const gapIn    = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const ctaIn    = spring({ frame: frame - PHASE_SWITCH, fps, config: { damping: 26, stiffness: 90, mass: 0.9 } });
  const sparkIn  = spring({ frame: frame - 155, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const showCTA = frame >= PHASE_SWITCH;

  const CHART_LEFT = PAD_X + 180;
  const CHART_RIGHT = width - PAD_X - 60;
  const CHART_W = CHART_RIGHT - CHART_LEFT;
  const ROW_H = height * 0.082;
  const BAR_H = height * 0.025;
  const CHART_TOP = height * 0.28;

  const barW = (v: number) => (v / MAX_SCALE) * CHART_W;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(titleIn, 0, 1),
      }}>
        AUTONOMY SCALE 1–5 · CHAT vs CLAUDE CODE
      </div>

      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.055,
        fontFamily: SERIF, fontSize: height * 0.036, fontWeight: 600,
        color: CLAUDE.INK, opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        {showCTA ? 'Not the model — the product.' : 'Same task, different leash.'}
      </div>

      {/* Overall gap callout */}
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y,
        fontFamily: SERIF, fontSize: height * 0.055, fontWeight: 700,
        color: CLAUDE.SPARK, opacity: clamp(gapIn, 0, 1), lineHeight: 1,
      }}>
        +0.37
      </div>
      <div style={{
        position: 'absolute', right: PAD_X, top: PAD_Y + height * 0.07,
        fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT,
        textAlign: 'right' as const, opacity: clamp(gapIn, 0, 1),
      }}>
        overall Code gap
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y + height * 0.13,
        display: 'flex', gap: 24, opacity: clamp(titleIn, 0, 1),
      }}>
        {[
          { label: 'Chat / Cowork', color: CLAUDE.INK_SOFT },
          { label: 'Claude Code',   color: CLAUDE.INK },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 18, height: 8, borderRadius: 2, background: l.color }} />
            <span style={{ fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>

      {/* Paired bars */}
      {OUTPUTS.map((o, i) => {
        const chatAnim = spring({ frame: frame - 15 - i * 6, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
        const codeAnim = spring({ frame: frame - 25 - i * 6, fps, config: { damping: 25, stiffness: 80, mass: 1.0 } });
        const y = CHART_TOP + i * ROW_H;

        return (
          <React.Fragment key={o.label}>
            {/* Row label */}
            <div style={{
              position: 'absolute', right: width - CHART_LEFT + 8, top: y + 4,
              fontFamily: SERIF, fontSize: height * 0.014, color: CLAUDE.INK,
              textAlign: 'right' as const, opacity: clamp(chatAnim, 0, 1),
              whiteSpace: 'nowrap' as const,
            }}>
              {o.label}
            </div>
            {/* Chat bar */}
            <div style={{
              position: 'absolute', left: CHART_LEFT, top: y + 2,
              width: barW(o.chat) * clamp(chatAnim, 0, 1),
              height: BAR_H, background: CLAUDE.INK_SOFT, opacity: 0.5,
              borderRadius: '0 4px 4px 0',
            }} />
            {/* Code bar */}
            <div style={{
              position: 'absolute', left: CHART_LEFT, top: y + BAR_H + 6,
              width: barW(o.code) * clamp(codeAnim, 0, 1),
              height: BAR_H, background: CLAUDE.INK,
              borderRadius: '0 4px 4px 0',
            }} />
            {/* Value labels */}
            {clamp(codeAnim, 0, 1) > 0.8 && (
              <>
                <div style={{
                  position: 'absolute',
                  left: CHART_LEFT + barW(o.chat) + 6, top: y + 2,
                  fontFamily: SANS, fontSize: height * 0.012, color: CLAUDE.GHOST,
                }}>
                  {o.chat.toFixed(2)}
                </div>
                <div style={{
                  position: 'absolute',
                  left: CHART_LEFT + barW(o.code) + 6, top: y + BAR_H + 6,
                  fontFamily: SANS, fontSize: height * 0.012, fontWeight: 700,
                  color: CLAUDE.INK,
                }}>
                  {o.code.toFixed(2)}
                </div>
              </>
            )}
          </React.Fragment>
        );
      })}

      {/* Scale axis marks */}
      {[1, 2, 3, 4, 5].map(v => (
        <div key={v} style={{
          position: 'absolute',
          left: CHART_LEFT + barW(v) - 6, top: CHART_TOP + OUTPUTS.length * ROW_H + 4,
          width: 12, fontFamily: SANS, fontSize: height * 0.012,
          color: CLAUDE.GHOST, textAlign: 'center' as const,
          opacity: clamp(titleIn, 0, 1),
        }}>
          {v}
        </div>
      ))}

      {/* CTA: Blog post comparison + counter-argument */}
      {showCTA && (
        <div style={{
          position: 'absolute',
          left: PAD_X, right: PAD_X,
          top: height * 0.26,
          background: CLAUDE.CARD,
          borderRadius: 20,
          border: `1px solid ${CLAUDE.BORDER}`,
          padding: '32px 40px',
          opacity: clamp(ctaIn, 0, 1),
          transform: `translateY(${(1 - clamp(ctaIn, 0, 1)) * 20}px)`,
        }}>
          <div style={{ display: 'flex', gap: 48, marginBottom: 28 }}>
            {[
              { mode: 'Chat', stat: '13 rounds', sub: 'back-and-forth', color: CLAUDE.INK_SOFT },
              { mode: 'Claude Code', stat: '1 prompt',  sub: 'same blog post',  color: CLAUDE.INK },
            ].map(c => (
              <div key={c.mode} style={{ flex: 1 }}>
                <div style={{
                  fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.GHOST, marginBottom: 4,
                }}>
                  {c.mode}
                </div>
                <div style={{
                  fontFamily: SERIF, fontSize: height * 0.048, fontWeight: 700,
                  color: c.color, lineHeight: 1,
                }}>
                  {c.stat}
                </div>
                <div style={{
                  fontFamily: SANS, fontSize: height * 0.013, color: CLAUDE.INK_SOFT, marginTop: 4,
                }}>
                  {c.sub}
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: CLAUDE.BORDER, marginBottom: 20 }} />
          <div style={{
            fontFamily: SANS, fontSize: height * 0.014, color: CLAUDE.INK_SOFT, lineHeight: 1.5,
          }}>
            <span style={{ fontWeight: 700, color: CLAUDE.INK }}>Counter: "It's just Opus."</span>
            {' '}54% of Code sessions run Opus vs 10% of chat. Filter to Sonnet-only — gap persists at{' '}
            <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>+0.26</span>.
            The product sets the leash length.
          </div>
        </div>
      )}

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
