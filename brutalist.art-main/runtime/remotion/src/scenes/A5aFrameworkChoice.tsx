import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const a5aFrameworkChoiceSchema = z.object({
  sparkLine: z.string().default('Pick one. Build. Don\'t shop.'),
});
export type A5aFrameworkChoiceProps = z.infer<typeof a5aFrameworkChoiceSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const GREEN_BG = '#F0FAF4';
const GREEN_BD = '#52C47C';
const GREEN_TXT = '#1A6E3A';


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const A5aFrameworkChoice: React.FC<A5aFrameworkChoiceProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn  = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const ruleIn    = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const gradioIn  = spring({ frame: frame - 18, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const vsIn      = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const streamIn  = spring({ frame: frame - 34, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const ruleBarIn = spring({ frame: frame - 58, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn   = spring({ frame: frame - 74, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.07,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        INFO 7375 · ASSIGNMENT 5A · PART 1
      </div>

      <div style={{
        position: 'absolute',
        top: height * 0.125,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 40,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        Gradio vs Streamlit — One Decision
      </div>

      {/* 20-second rule pill */}
      <div style={{
        position: 'absolute',
        top: height * 0.235,
        left: '50%',
        transform: `translateX(-50%) translateY(${(1 - clamp(ruleIn, 0, 1)) * 10}px)`,
        opacity: clamp(ruleIn, 0, 1),
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: CLAUDE.PILL,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 24,
        padding: '7px 22px',
        whiteSpace: 'nowrap' as const,
      }}>
        <span style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>
          Rule: make this choice in under 20 seconds
        </span>
      </div>

      {/* Two-column cards */}
      <div style={{
        position: 'absolute',
        top: height * 0.32,
        left: width * 0.07,
        right: width * 0.07,
        display: 'flex',
        alignItems: 'stretch',
        gap: 24,
        height: height * 0.38,
      }}>
        {/* Gradio — recommended */}
        <div style={{
          flex: 1,
          background: GREEN_BG,
          border: `2.5px solid ${GREEN_BD}`,
          borderRadius: 18,
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 12,
          opacity: clamp(gradioIn, 0, 1),
          transform: `translateX(${(1 - clamp(gradioIn, 0, 1)) * -20}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: GREEN_TXT, textTransform: 'uppercase' as const }}>
            ✓ Start here
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: CLAUDE.INK }}>
            Gradio
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.55 }}>
            Fastest for input-to-output tools. Text box in, formatted answer out. Runs natively on Hugging Face Spaces — which matters for your deploy step.
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: GREEN_TXT, marginTop: 4 }}>
            Best for: most Madison tools
          </div>
        </div>

        {/* VS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          flexShrink: 0,
          opacity: clamp(vsIn, 0, 1),
        }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: CLAUDE.INK_SOFT, fontStyle: 'italic' }}>
            vs
          </div>
        </div>

        {/* Streamlit */}
        <div style={{
          flex: 1,
          background: CLAUDE.FOOTER,
          border: `2.5px solid ${CLAUDE.BORDER}`,
          borderRadius: 18,
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 12,
          opacity: clamp(streamIn, 0, 1),
          transform: `translateX(${(1 - clamp(streamIn, 0, 1)) * 20}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
            If you need more layout
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: CLAUDE.INK }}>
            Streamlit
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.55 }}>
            More layout control: columns, tabs, richer pages. Better when your tool is a multi-section dashboard — but more to configure before deploy.
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
            Best for: dashboard-style tools
          </div>
        </div>
      </div>

      {/* Bottom rule */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.135,
        left: width * 0.07,
        right: width * 0.07,
        background: CLAUDE.PILL,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        padding: '11px 22px',
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 14,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(ruleBarIn, 0, 1),
        transform: `translateY(${(1 - clamp(ruleBarIn, 0, 1)) * 8}px)`,
      }}>
        Pick one and build. You can always migrate. Right now you need something deployed.
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.065,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
