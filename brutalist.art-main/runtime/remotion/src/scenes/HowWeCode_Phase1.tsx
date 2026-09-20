import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * HowWeCode_Phase1 — Phase 1: Interview-Driven Brainstorm
 * Source: cwc-workshops/how-we-claude-code, Anthropic
 *
 * Three-panel horizontal flow:
 *   Left:   Claude interview question chip ("Who uses this product?")
 *   Middle: User answer chip
 *   Right:  Product Spec card (terracotta accent — the one orange moment)
 *
 * Panels animate in with staggered springs; connecting arrows draw
 * left-to-right between panels. Terracotta: the spec card on the right.
 *
 * Per CLAUDE-BRAND.md: one terracotta moment per beat.
 */

export const howWeCodePhase1Schema = z.object({
  sparkLine: z.string().default('Think before you build.'),
});
export type HowWeCodePhase1Props = z.infer<typeof howWeCodePhase1Schema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


// Animated arrow that draws from left to right
const DrawArrow: React.FC<{ progress: number; width: number }> = ({ progress, width }) => {
  const drawnWidth = progress * width;
  return (
    <svg
      width={width + 20}
      height={32}
      viewBox={`0 0 ${width + 20} 32`}
      style={{ overflow: 'visible' }}
    >
      {/* Shaft */}
      <line
        x1={0} y1={16}
        x2={drawnWidth} y2={16}
        stroke={CLAUDE.BORDER}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Arrowhead — only visible once drawn ~80% */}
      {progress > 0.75 && (
        <polygon
          points={`${drawnWidth},10 ${drawnWidth + 14},16 ${drawnWidth},22`}
          fill={CLAUDE.BORDER}
          opacity={clamp((progress - 0.75) / 0.25, 0, 1)}
        />
      )}
    </svg>
  );
};

export const HowWeCode_Phase1: React.FC<HowWeCodePhase1Props> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.08;

  // Panel springs: staggered by 18 frames each
  const panelDelay = 18;
  const leftIn = spring({ frame, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const midIn = spring({ frame: frame - panelDelay, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });
  const rightIn = spring({ frame: frame - panelDelay * 2, fps, config: { damping: 28, stiffness: 100, mass: 0.9 } });

  // Arrow draw progress (after panels)
  const arrow1Progress = clamp(
    interpolate(frame, [panelDelay + 10, panelDelay + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    0, 1
  );
  const arrow2Progress = clamp(
    interpolate(frame, [panelDelay * 2 + 10, panelDelay * 2 + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    0, 1
  );

  // Spark line + citation
  const sparkIn = spring({ frame: frame - (panelDelay * 3 + 20), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const citeIn = spring({ frame: frame - (panelDelay * 3 + 25), fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });
  const titleIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });

  // Layout
  const PANEL_AREA_TOP = height * 0.28;
  const PANEL_H = height * 0.44;
  const ARROW_W = width * 0.055;
  const PANEL_W = (width - PAD_X * 2 - ARROW_W * 2) / 3;

  const leftX = PAD_X;
  const arrow1X = leftX + PANEL_W;
  const midX = arrow1X + ARROW_W;
  const arrow2X = midX + PANEL_W;
  const rightX = arrow2X + ARROW_W;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y,
        fontFamily: SANS,
        fontSize: height * 0.015,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(titleIn, 0, 1),
      }}>
        PHASE 1 · INTERVIEW-DRIVEN BRAINSTORM
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        top: PAD_Y + height * 0.058,
        fontFamily: SERIF,
        fontSize: height * 0.038,
        fontWeight: 600,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - titleIn) * 10}px)`,
      }}>
        Prompts only. No mockups, no code.
      </div>

      {/* ── Left Panel: Claude question chip ── */}
      <div style={{
        position: 'absolute',
        left: leftX,
        top: PANEL_AREA_TOP,
        width: PANEL_W,
        height: PANEL_H,
        borderRadius: 14,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 28px',
        boxSizing: 'border-box',
        opacity: clamp(leftIn, 0, 1),
        transform: `translateX(${(1 - leftIn) * -24}px)`,
      }}>
        {/* Role label */}
        <div style={{
          fontFamily: SANS,
          fontSize: height * 0.012,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT,
          marginBottom: 14,
        }}>Claude</div>

        {/* Question chip */}
        <div style={{
          background: CLAUDE.PILL,
          borderRadius: 10,
          padding: '14px 18px',
          fontFamily: SERIF,
          fontSize: height * 0.022,
          fontStyle: 'italic',
          color: CLAUDE.INK,
          lineHeight: 1.5,
          maxWidth: '100%',
        }}>
          "Who uses this product, and what are they actually trying to accomplish?"
        </div>

        <div style={{
          marginTop: 16,
          background: CLAUDE.PILL,
          borderRadius: 10,
          padding: '10px 18px',
          fontFamily: SERIF,
          fontSize: height * 0.019,
          fontStyle: 'italic',
          color: CLAUDE.INK_SOFT,
          lineHeight: 1.4,
        }}>
          "What would make them trust it?"
        </div>
      </div>

      {/* ── Arrow 1 ── */}
      <div style={{
        position: 'absolute',
        left: arrow1X,
        top: PANEL_AREA_TOP + PANEL_H / 2 - 16,
        width: ARROW_W,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <DrawArrow progress={arrow1Progress} width={ARROW_W - 4} />
      </div>

      {/* ── Middle Panel: User answer chip ── */}
      <div style={{
        position: 'absolute',
        left: midX,
        top: PANEL_AREA_TOP,
        width: PANEL_W,
        height: PANEL_H,
        borderRadius: 14,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 28px',
        boxSizing: 'border-box',
        opacity: clamp(midIn, 0, 1),
        transform: `translateX(${(1 - midIn) * 16}px)`,
      }}>
        {/* Role label */}
        <div style={{
          fontFamily: SANS,
          fontSize: height * 0.012,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT,
          marginBottom: 14,
        }}>You</div>

        {/* Answer chip */}
        <div style={{
          background: CLAUDE.FOOTER,
          borderRadius: 10,
          padding: '14px 18px',
          fontFamily: SERIF,
          fontSize: height * 0.02,
          color: CLAUDE.INK,
          lineHeight: 1.5,
        }}>
          "People splitting restaurant bills with friends. They want it fast and they don't want to sign up."
        </div>

        <div style={{
          marginTop: 14,
          background: CLAUDE.FOOTER,
          borderRadius: 10,
          padding: '10px 18px',
          fontFamily: SERIF,
          fontSize: height * 0.018,
          color: CLAUDE.INK_SOFT,
          lineHeight: 1.4,
        }}>
          "No account. Just a link."
        </div>
      </div>

      {/* ── Arrow 2 ── */}
      <div style={{
        position: 'absolute',
        left: arrow2X,
        top: PANEL_AREA_TOP + PANEL_H / 2 - 16,
        width: ARROW_W,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <DrawArrow progress={arrow2Progress} width={ARROW_W - 4} />
      </div>

      {/* ── Right Panel: Product Spec card (TERRACOTTA accent) ── */}
      <div style={{
        position: 'absolute',
        left: rightX,
        top: PANEL_AREA_TOP,
        width: PANEL_W,
        height: PANEL_H,
        borderRadius: 14,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.SPARK}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '22px 24px',
        boxSizing: 'border-box',
        opacity: clamp(rightIn, 0, 1),
        transform: `translateX(${(1 - rightIn) * 24}px)`,
      }}>
        {/* Spec header */}
        <div style={{
          fontFamily: SANS,
          fontSize: height * 0.011,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase' as const,
          color: CLAUDE.SPARK,
          marginBottom: 10,
        }}>Product Spec</div>

        {/* Spec lines */}
        {[
          'No-account bill-splitting app',
          'Audience: friends at restaurants',
          'Core job: split fast, share a link',
          'Trust signal: no signup required',
          'Output: shareable URL, no login',
        ].map((line, i) => (
          <div key={i} style={{
            fontFamily: SERIF,
            fontSize: height * 0.016,
            color: i === 0 ? CLAUDE.INK : CLAUDE.INK_SOFT,
            fontWeight: i === 0 ? 600 : 400,
            lineHeight: 1.5,
            marginBottom: i === 0 ? 12 : 6,
            paddingLeft: i > 0 ? 0 : 0,
          }}>
            {i > 0 ? `— ${line}` : line}
          </div>
        ))}
      </div>

      {/* Panel labels below */}
      {[
        { x: leftX + PANEL_W / 2, label: 'The interview' },
        { x: midX + PANEL_W / 2, label: 'Your answers' },
        { x: rightX + PANEL_W / 2, label: 'The spec' },
      ].map(({ x, label }, i) => {
        const anims = [leftIn, midIn, rightIn];
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x - 80,
            top: PANEL_AREA_TOP + PANEL_H + 14,
            width: 160,
            textAlign: 'center',
            fontFamily: SANS,
            fontSize: height * 0.013,
            fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: 'uppercase' as const,
            color: i === 2 ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
            opacity: clamp(anims[i], 0, 1),
          }}>
            {label}
          </div>
        );
      })}

      {/* Citation */}
      <div style={{
        position: 'absolute',
        left: PAD_X,
        bottom: height * 0.12,
        fontFamily: SANS,
        fontSize: height * 0.012,
        color: CLAUDE.GHOST,
        opacity: clamp(citeIn, 0, 1),
      }}>
        Source: cwc-workshops/how-we-claude-code, Anthropic
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: height * 0.022,
          fontStyle: 'italic',
          color: CLAUDE.INK,
        }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
