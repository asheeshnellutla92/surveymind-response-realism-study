import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const linkedInAsymmetrySchema = z.object({
  sparkLine: z.string().default('Two roads. One wall.'),
});
export type LinkedInAsymmetryProps = z.infer<typeof linkedInAsymmetrySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const GREEN_BG  = '#F0FAF4';
const GREEN_BD  = '#52C47C';
const GREEN_TXT = '#1A6E3A';
const WALL_BG   = '#FEF2F0';
const WALL_BD   = CLAUDE.SPARK;
const WALL_TXT  = '#9B2C1A';


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const LinkedInAsymmetry: React.FC<LinkedInAsymmetryProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn    = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const lane1In     = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const lane2In     = spring({ frame: frame - 18, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const greenReveal = spring({ frame: frame - 28, fps, config: { damping: 32, stiffness: 130, mass: 0.8 } });
  const lane3In     = spring({ frame: frame - 40, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const wallIn      = spring({ frame: frame - 52, fps, config: { damping: 24, stiffness: 100, mass: 1.1 } });
  const labelIn     = spring({ frame: frame - 64, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn     = spring({ frame: frame - 76, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const lane1Green = clamp(greenReveal, 0, 1);
  const lane2Green = clamp(greenReveal, 0, 1);

  const laneCard = (
    label: string,
    tag: string,
    tagColor: string,
    borderColor: string,
    bgColor: string,
    opacity: number,
    ty: number,
  ) => (
    <div style={{
      width: 320,
      background: bgColor,
      border: `2.5px solid ${borderColor}`,
      borderRadius: 18,
      padding: '30px 28px',
      boxShadow: '0 4px 24px rgba(61,57,41,0.08)',
      opacity,
      transform: `translateY(${ty}px)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 2.5,
        textTransform: 'uppercase' as const,
        padding: '4px 14px',
        borderRadius: 20,
        color: tagColor,
        background: borderColor + '22',
        border: `1px solid ${borderColor}`,
      }}>
        {tag}
      </div>
      <div style={{
        fontFamily: SERIF,
        fontSize: 26,
        fontWeight: 700,
        color: CLAUDE.INK,
        textAlign: 'center',
      }}>
        {label}
      </div>
    </div>
  );

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
        THE ASYMMETRY — THE MOST IMPORTANT FACT
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
        Two Open Roads. One Wall.
      </div>

      {/* Lanes row */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -44%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 36,
      }}>
        {/* Publishing — green */}
        {laneCard(
          'Publishing',
          'OFFICIAL API',
          GREEN_TXT,
          GREEN_BD,
          lane1Green > 0.5 ? GREEN_BG : CLAUDE.CARD,
          clamp(lane1In, 0, 1),
          (1 - clamp(lane1In, 0, 1)) * 20,
        )}

        {/* Analytics — green */}
        {laneCard(
          'Analytics',
          'OFFICIAL API',
          GREEN_TXT,
          lane2Green > 0.5 ? GREEN_BD : CLAUDE.BORDER,
          lane2Green > 0.5 ? GREEN_BG : CLAUDE.CARD,
          clamp(lane2In, 0, 1),
          (1 - clamp(lane2In, 0, 1)) * 20,
        )}

        {/* Outreach — wall */}
        <div style={{
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}>
          {/* Lane card */}
          <div style={{
            width: '100%',
            background: clamp(wallIn, 0, 1) > 0.5 ? WALL_BG : CLAUDE.CARD,
            border: `2.5px solid ${clamp(wallIn, 0, 1) > 0.5 ? WALL_BD : CLAUDE.BORDER}`,
            borderRadius: clamp(wallIn, 0, 1) > 0.5 ? '18px 18px 0 0' : 18,
            padding: '30px 28px 24px',
            boxShadow: '0 4px 24px rgba(61,57,41,0.08)',
            opacity: clamp(lane3In, 0, 1),
            transform: `translateY(${(1 - clamp(lane3In, 0, 1)) * 20}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              background: clamp(wallIn, 0, 1) > 0.5 ? WALL_BD + '22' : CLAUDE.PILL,
              color: clamp(wallIn, 0, 1) > 0.5 ? WALL_TXT : CLAUDE.INK_SOFT,
              border: `1px solid ${clamp(wallIn, 0, 1) > 0.5 ? WALL_BD : CLAUDE.BORDER}`,
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2.5,
              textTransform: 'uppercase' as const,
              padding: '4px 14px',
              borderRadius: 20,
            }}>
              {clamp(wallIn, 0, 1) > 0.5 ? 'NO SCOPE — ANY PRICE' : 'OUTREACH'}
            </div>
            <div style={{
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 700,
              color: CLAUDE.INK,
              textAlign: 'center',
            }}>
              Outreach
            </div>
          </div>

          {/* The Wall */}
          <div style={{
            width: '100%',
            background: CLAUDE.SPARK,
            borderRadius: '0 0 18px 18px',
            padding: '18px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            opacity: clamp(wallIn, 0, 1),
            transform: `scaleY(${clamp(wallIn, 0, 1)})`,
            transformOrigin: 'top center',
          }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <rect x={3} y={11} width={18} height={11} rx={2} stroke="#fff" strokeWidth={2.2} />
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
            </svg>
            <span style={{
              fontFamily: SANS,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 2,
              color: '#fff',
              textTransform: 'uppercase' as const,
            }}>
              WALL
            </span>
          </div>
        </div>
      </div>

      {/* Sub-label */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.18,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 15,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(labelIn, 0, 1),
        transform: `translateY(${(1 - clamp(labelIn, 0, 1)) * 8}px)`,
      }}>
        Vendor marketing is built to blur exactly this asymmetry — because the third lane is where the money is.
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
