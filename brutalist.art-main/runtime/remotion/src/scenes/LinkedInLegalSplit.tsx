import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const linkedInLegalSplitSchema = z.object({
  sparkLine: z.string().default('Not sued ≠ not banned.'),
});
export type LinkedInLegalSplitProps = z.infer<typeof linkedInLegalSplitSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const GREEN_BG  = '#F0FAF4';
const GREEN_BD  = '#52C47C';
const GREEN_TXT = '#1A6E3A';
const WALL_BG   = '#FEF2F0';
const WALL_BD   = CLAUDE.SPARK;
const WALL_TXT  = '#9B2C1A';


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const LinkedInLegalSplit: React.FC<LinkedInLegalSplitProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn    = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const col1In      = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const col1item1In = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const col1item2In = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const col2In      = spring({ frame: frame - 38, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const col2item1In = spring({ frame: frame - 48, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const col2item2In = spring({ frame: frame - 58, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const stampIn     = spring({ frame: frame - 72, fps, config: { damping: 22, stiffness: 100, mass: 1.1 } });
  const noteIn      = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn     = spring({ frame: frame - 106, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.065,
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
        HIQ v. LINKEDIN · CFAA vs. CONTRACT LAW
      </div>

      <div style={{
        position: 'absolute',
        top: height * 0.12,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 38,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        Two Laws. Two Different Verdicts.
      </div>

      {/* Two columns */}
      <div style={{
        position: 'absolute',
        top: height * 0.245,
        left: width * 0.06,
        right: width * 0.06,
        display: 'flex',
        gap: 36,
      }}>

        {/* Column 1 — CFAA */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          opacity: clamp(col1In, 0, 1),
          transform: `translateX(${(1 - clamp(col1In, 0, 1)) * -14}px)`,
        }}>
          <div style={{
            background: GREEN_BG,
            border: `2px solid ${GREEN_BD}`,
            borderRadius: 14,
            padding: '18px 22px',
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: GREEN_TXT, textTransform: 'uppercase' as const, marginBottom: 8 }}>
              CFAA — Federal Statute
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.3 }}>
              Computer Fraud and Abuse Act
            </div>
          </div>

          <div style={{
            background: CLAUDE.CARD,
            border: `2px solid ${CLAUDE.BORDER}`,
            borderRadius: 12,
            padding: '16px 20px',
            opacity: clamp(col1item1In, 0, 1),
            transform: `translateY(${(1 - clamp(col1item1In, 0, 1)) * 12}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: GREEN_TXT, marginBottom: 4 }}>
              9th Circuit, April 2022
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.55 }}>
              Scraping <em>public</em> data with no login wall does not violate the CFAA. hiQ won this argument.
            </div>
          </div>

          <div style={{
            background: CLAUDE.CARD,
            border: `2px solid ${CLAUDE.BORDER}`,
            borderRadius: 12,
            padding: '16px 20px',
            opacity: clamp(col1item2In, 0, 1),
            transform: `translateY(${(1 - clamp(col1item2In, 0, 1)) * 12}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 4 }}>
              But — does not cover
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.55 }}>
              Authenticated access behind a login. Cookie replay falls here — outside the protection.
            </div>
          </div>
        </div>

        {/* Column 2 — Contract */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          opacity: clamp(col2In, 0, 1),
          transform: `translateX(${(1 - clamp(col2In, 0, 1)) * 14}px)`,
        }}>
          <div style={{
            background: WALL_BG,
            border: `2px solid ${WALL_BD}`,
            borderRadius: 14,
            padding: '18px 22px',
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: WALL_TXT, textTransform: 'uppercase' as const, marginBottom: 8 }}>
              CONTRACT LAW
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.3 }}>
              LinkedIn User Agreement
            </div>
          </div>

          <div style={{
            background: CLAUDE.CARD,
            border: `2px solid ${CLAUDE.BORDER}`,
            borderRadius: 12,
            padding: '16px 20px',
            opacity: clamp(col2item1In, 0, 1),
            transform: `translateY(${(1 - clamp(col2item1In, 0, 1)) * 12}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: WALL_TXT, marginBottom: 4 }}>
              Bans bots, scrapers, and automated messaging
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.55 }}>
              A contract breach lets LinkedIn suspend your account regardless of what the federal statute allows.
            </div>
          </div>

          <div style={{
            background: CLAUDE.CARD,
            border: `2px solid ${CLAUDE.BORDER}`,
            borderRadius: 12,
            padding: '16px 20px',
            opacity: clamp(col2item2In, 0, 1),
            transform: `translateY(${(1 - clamp(col2item2In, 0, 1)) * 12}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK_SOFT, marginBottom: 4 }}>
              Vendors quote the first to imply the second
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.55 }}>
              "Won't get sued federally" and "won't get banned" are two completely different promises.
            </div>
          </div>
        </div>
      </div>

      {/* hiQ Settlement stamp */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.155,
        left: width * 0.06,
        right: width * 0.06,
        background: CLAUDE.SPARK,
        borderRadius: 12,
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        opacity: clamp(stampIn, 0, 1),
        transform: `scaleX(${clamp(stampIn, 0, 1)})`,
        transformOrigin: 'center center',
      }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4l3 3" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
          hiQ settled Dec 2022 · $500K · algorithms destroyed · despite "winning" the CFAA argument
        </span>
      </div>

      {/* Vendor note */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.085,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 13,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(noteIn, 0, 1),
        transform: `translateY(${(1 - clamp(noteIn, 0, 1)) * 6}px)`,
      }}>
        Source: Proskauer · Morgan Lewis · Privacy World · Wikipedia (hiQ Labs v. LinkedIn)
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.055,
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
