import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const linkedInTrustBoundarySchema = z.object({
  sparkLine: z.string().default("You're trusting a stranger."),
});
export type LinkedInTrustBoundaryProps = z.infer<typeof linkedInTrustBoundarySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const LinkedInTrustBoundary: React.FC<LinkedInTrustBoundaryProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn  = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const directoryIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const noItemIn  = spring({ frame: frame - 18, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const boundaryIn = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const youIn     = spring({ frame: frame - 38, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const arrowIn   = spring({ frame: frame - 46, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const serverIn  = spring({ frame: frame - 54, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn   = spring({ frame: frame - 68, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

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
        ANTHROPIC MCP DIRECTORY · LINKEDIN
      </div>

      {/* Title */}
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
        No First-Party LinkedIn Connector
      </div>

      {/* Directory card */}
      <div style={{
        position: 'absolute',
        top: height * 0.27,
        left: width * 0.12,
        right: width * 0.12,
        opacity: clamp(directoryIn, 0, 1),
        transform: `translateY(${(1 - clamp(directoryIn, 0, 1)) * 14}px)`,
      }}>
        <div style={{
          background: CLAUDE.CARD,
          border: `2px solid ${CLAUDE.BORDER}`,
          borderRadius: 16,
          padding: '28px 36px',
          boxShadow: '0 4px 24px rgba(61,57,41,0.09)',
        }}>
          {/* Directory header */}
          <div style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase' as const,
            color: CLAUDE.INK_SOFT,
            marginBottom: 16,
          }}>
            Claude.ai / Connectors / Search: "LinkedIn"
          </div>

          {/* No result */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            opacity: clamp(noItemIn, 0, 1),
            transform: `translateX(${(1 - clamp(noItemIn, 0, 1)) * 12}px)`,
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: CLAUDE.FOOTER,
              border: `2px dashed ${CLAUDE.BORDER}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <line x1={6} y1={6} x2={18} y2={18} stroke={CLAUDE.GHOST} strokeWidth={2.5} strokeLinecap="round" />
                <line x1={18} y1={6} x2={6} y2={18} stroke={CLAUDE.GHOST} strokeWidth={2.5} strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: CLAUDE.INK }}>
                No official LinkedIn connector
              </div>
              <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
                All available options are third-party MCP servers — not owned, operated, or security-audited by Anthropic.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust boundary diagram */}
      <div style={{
        position: 'absolute',
        top: height * 0.575,
        left: width * 0.08,
        right: width * 0.08,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        opacity: clamp(boundaryIn, 0, 1),
        transform: `translateY(${(1 - clamp(boundaryIn, 0, 1)) * 14}px)`,
      }}>
        {/* You box */}
        <div style={{
          background: CLAUDE.CARD,
          border: `2px solid ${CLAUDE.BORDER}`,
          borderRadius: 12,
          padding: '18px 32px',
          textAlign: 'center',
          opacity: clamp(youIn, 0, 1),
          transform: `translateX(${(1 - clamp(youIn, 0, 1)) * -20}px)`,
          minWidth: 180,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
            YOU
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: CLAUDE.INK, marginTop: 6 }}>
            Claude desktop
          </div>
        </div>

        {/* Arrow + boundary */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 260,
          opacity: clamp(arrowIn, 0, 1),
        }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 4 }}>
            TRUST BOUNDARY
          </div>
          <svg width={260} height={36} viewBox="0 0 260 36" style={{ display: 'block' }}>
            <line x1={8} y1={18} x2={236} y2={18} stroke={CLAUDE.SPARK} strokeWidth={2.5} strokeDasharray="6,4" strokeLinecap="round" />
            <polyline points="224,10 236,18 224,26" stroke={CLAUDE.SPARK} strokeWidth={2.5} fill="none"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.GHOST, marginTop: 3 }}>
            access you hand over
          </div>
        </div>

        {/* Stranger server */}
        <div style={{
          background: '#FFF8F5',
          border: `2px solid ${CLAUDE.SPARK}`,
          borderRadius: 12,
          padding: '18px 32px',
          textAlign: 'center',
          opacity: clamp(serverIn, 0, 1),
          transform: `translateX(${(1 - clamp(serverIn, 0, 1)) * 20}px)`,
          minWidth: 220,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.SPARK, textTransform: 'uppercase' as const }}>
            THIRD-PARTY SERVER
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: CLAUDE.INK, marginTop: 6 }}>
            one specific stranger
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, marginTop: 4 }}>
            not audited by Anthropic
          </div>
        </div>
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
