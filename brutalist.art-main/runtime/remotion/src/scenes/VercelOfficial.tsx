import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

// B01 — Official first-party badge, mcp.vercel.com, OAuth, supported-clients row.
// Tone: the cleanest story in the set — the tension is scope creep, not access.

export const vercelOfficialSchema = z.object({
  sparkLine: z.string().default('Official. Sanctioned. Still watch it.'),
});
export type VercelOfficialProps = z.infer<typeof vercelOfficialSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const MONO  = CLAUDE_FONT.mono;

const GREEN_BG  = '#F0FAF4';
const GREEN_BD  = '#52C47C';
const GREEN_TXT = '#1A6E3A';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = GREEN_TXT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx={12} cy={12} r={10} fill={color} opacity={0.12} />
    <path d="M7 12.5l3.5 3.5 6.5-7" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const VercelOfficial: React.FC<VercelOfficialProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const eyebrowIn  = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const titleIn    = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const badgeIn    = spring({ frame: frame - 14, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const urlIn      = spring({ frame: frame - 24, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const oauthIn    = spring({ frame: frame - 34, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const clientsIn  = spring({ frame: frame - 46, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const client1In  = spring({ frame: frame - 56, fps, config: { damping: 30, stiffness: 130, mass: 0.8 } });
  const client2In  = spring({ frame: frame - 64, fps, config: { damping: 30, stiffness: 130, mass: 0.8 } });
  const client3In  = spring({ frame: frame - 72, fps, config: { damping: 30, stiffness: 130, mass: 0.8 } });
  const noteIn     = spring({ frame: frame - 84, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn    = spring({ frame: frame - 96, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const clients = [
    { label: 'Claude Code', highlight: true },
    { label: 'Claude Desktop', highlight: true },
    { label: 'Other MCP Clients', highlight: false },
  ];
  const clientIns = [client1In, client2In, client3In];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.08,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(eyebrowIn, 0, 1),
      }}>
        VERCEL MCP · OFFICIAL FIRST-PARTY SERVER
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.135,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 44,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Built by the Platform. For Exactly This.
      </div>

      {/* Main content area — badge + URL + OAuth in a row */}
      <div style={{
        position: 'absolute',
        top: height * 0.265,
        left: width * 0.08,
        right: width * 0.08,
        display: 'flex',
        alignItems: 'stretch',
        gap: 24,
      }}>

        {/* Official badge card */}
        <div style={{
          flex: 1,
          background: GREEN_BG,
          border: `2px solid ${GREEN_BD}`,
          borderRadius: 20,
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          opacity: clamp(badgeIn, 0, 1),
          transform: `translateY(${(1 - clamp(badgeIn, 0, 1)) * 18}px)`,
        }}>
          <CheckIcon size={36} color={GREEN_TXT} />
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: GREEN_TXT, textTransform: 'uppercase' as const }}>
            OFFICIAL
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: CLAUDE.INK, textAlign: 'center' }}>
            First-Party<br />MCP Server
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, textAlign: 'center', lineHeight: 1.4 }}>
            Owned and operated<br />by Vercel, Inc.
          </div>
        </div>

        {/* URL card */}
        <div style={{
          flex: 1.4,
          background: CLAUDE.CARD,
          border: `2px solid ${CLAUDE.BORDER}`,
          borderRadius: 20,
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 18,
          opacity: clamp(urlIn, 0, 1),
          transform: `translateY(${(1 - clamp(urlIn, 0, 1)) * 18}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
            ENDPOINT
          </div>
          <div style={{
            fontFamily: MONO,
            fontSize: 26,
            color: CLAUDE.SPARK,
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}>
            mcp.vercel.com
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              background: CLAUDE.PILL,
              border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 20,
              padding: '4px 14px',
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 700,
              color: CLAUDE.INK_SOFT,
              letterSpacing: 1,
            }}>
              BETA
            </div>
            <div style={{
              background: CLAUDE.PILL,
              border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 20,
              padding: '4px 14px',
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 700,
              color: CLAUDE.INK_SOFT,
              letterSpacing: 1,
              opacity: clamp(oauthIn, 0, 1),
            }}>
              OAUTH
            </div>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
            Available on all Vercel plans — Hobby included.
          </div>
        </div>
      </div>

      {/* Supported clients row */}
      <div style={{
        position: 'absolute',
        top: height * 0.63,
        left: width * 0.08,
        right: width * 0.08,
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT,
          marginBottom: 16,
          opacity: clamp(clientsIn, 0, 1),
        }}>
          SUPPORTED CLIENTS — FROM VERCEL DOCS
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {clients.map((c, i) => {
            const cIn = clamp(clientIns[i], 0, 1);
            return (
              <div key={i} style={{
                flex: 1,
                background: c.highlight ? GREEN_BG : CLAUDE.CARD,
                border: `2px solid ${c.highlight ? GREEN_BD : CLAUDE.BORDER}`,
                borderRadius: 14,
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: cIn,
                transform: `translateY(${(1 - cIn) * 14}px)`,
              }}>
                {c.highlight && <CheckIcon size={20} color={GREEN_TXT} />}
                <span style={{
                  fontFamily: SERIF,
                  fontSize: c.highlight ? 22 : 18,
                  fontWeight: c.highlight ? 700 : 400,
                  color: c.highlight ? CLAUDE.INK : CLAUDE.INK_SOFT,
                }}>
                  {c.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.14,
        left: width * 0.08,
        right: width * 0.08,
        fontFamily: SANS,
        fontSize: 14,
        color: CLAUDE.INK_SOFT,
        textAlign: 'center',
        opacity: clamp(noteIn, 0, 1),
      }}>
        The gotcha here isn't access. The gotcha is scope creep inside a tool you're right to trust.
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
