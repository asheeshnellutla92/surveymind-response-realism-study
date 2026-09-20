import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const a8ShipItRuleSchema = z.object({
  sparkLine: z.string().default('Functional beats flawless.'),
});
export type A8ShipItRuleProps = z.infer<typeof a8ShipItRuleSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const GREEN_BG = '#F0FAF4';
const GREEN_BD = '#52C47C';
const GREEN_TXT = '#1A6E3A';


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const A8ShipItRule: React.FC<A8ShipItRuleProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn  = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const rule1In   = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const vsIn      = spring({ frame: frame - 22, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const rule2In   = spring({ frame: frame - 26, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const mottoIn   = spring({ frame: frame - 42, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn   = spring({ frame: frame - 56, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.08,
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
        ASSIGNMENT 8 · THE MINDSET RULE
      </div>

      <div style={{
        position: 'absolute',
        top: height * 0.135,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 40,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        Ship the First Version. Not the Final.
      </div>

      {/* Two-column comparison */}
      <div style={{
        position: 'absolute',
        top: height * 0.295,
        left: width * 0.07,
        right: width * 0.07,
        display: 'flex',
        alignItems: 'stretch',
        gap: 24,
        height: height * 0.38,
      }}>
        {/* LIVE — the good choice */}
        <div style={{
          flex: 1,
          background: GREEN_BG,
          border: `2.5px solid ${GREEN_BD}`,
          borderRadius: 18,
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 14,
          opacity: clamp(rule1In, 0, 1),
          transform: `translateX(${(1 - clamp(rule1In, 0, 1)) * -18}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: GREEN_TXT, textTransform: 'uppercase' as const }}>
            ✓ Ship it
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.3 }}>
            Live site with four real sections
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
            Your name. Your palette. Your actual project. Published and viewable on a real URL.
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: GREEN_BD,
            borderRadius: 8,
            padding: '6px 16px',
            alignSelf: 'flex-start',
          }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#fff' }}>
              Graded on this
            </span>
          </div>
        </div>

        {/* VS divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          flexShrink: 0,
          opacity: clamp(vsIn, 0, 1),
        }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: 22,
            fontWeight: 700,
            color: CLAUDE.INK_SOFT,
            fontStyle: 'italic',
          }}>
            vs
          </div>
        </div>

        {/* NOT published — the trap */}
        <div style={{
          flex: 1,
          background: CLAUDE.FOOTER,
          border: `2.5px solid ${CLAUDE.BORDER}`,
          borderRadius: 18,
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 14,
          opacity: clamp(rule2In, 0, 1),
          transform: `translateX(${(1 - clamp(rule2In, 0, 1)) * 18}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.GHOST, textTransform: 'uppercase' as const }}>
            ✗ Don't do this
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.3 }}>
            Beautiful mockup — not published
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
            Perfect in your editor. Zero points for the "live website" requirement because there is no link to submit.
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: CLAUDE.GHOST + '33',
            border: `1px solid ${CLAUDE.GHOST}`,
            borderRadius: 8,
            padding: '6px 16px',
            alignSelf: 'flex-start',
          }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.GHOST }}>
              Zero credit
            </span>
          </div>
        </div>
      </div>

      {/* Motto */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.155,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 15,
        fontWeight: 600,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(mottoIn, 0, 1),
        transform: `translateY(${(1 - clamp(mottoIn, 0, 1)) * 6}px)`,
      }}>
        The AI gets you to functional fast. Your judgment makes it yours.
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.07,
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
