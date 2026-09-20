import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

// B08 — Two panels: vercel mcp --project (blast-radius shrink) and the
// deployment-protection bypass token (scoped, revocable — the GOOD pattern).
// Contrast to buy_domain. Spark: "Narrow. Revocable. Yours."

export const vercelMitigationsSchema = z.object({
  sparkLine: z.string().default('Narrow. Revocable. Yours.'),
});
export type VercelMitigationsProps = z.infer<typeof vercelMitigationsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const MONO  = CLAUDE_FONT.mono;

const GREEN_BG  = '#F0FAF4';
const GREEN_BD  = '#52C47C';
const GREEN_TXT = '#1A6E3A';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const VercelMitigations: React.FC<VercelMitigationsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const eyebrowIn  = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const titleIn    = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const panel1In   = spring({ frame: frame - 16, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const code1In    = spring({ frame: frame - 32, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const panel2In   = spring({ frame: frame - 44, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const code2In    = spring({ frame: frame - 60, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const bullet1In  = spring({ frame: frame - 72, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const bullet2In  = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const bullet3In  = spring({ frame: frame - 88, fps, config: { damping: 28, stiffness: 130, mass: 0.8 } });
  const noteIn     = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn    = spring({ frame: frame - 114, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const bullets = [
    { label: 'Narrow', detail: 'Scoped to one project — no reach across your account', in: bullet1In },
    { label: 'Revocable', detail: 'Delete the bypass secret any time from project settings', in: bullet2In },
    { label: 'Yours', detail: "Store it locally; never expose it to Claude's context", in: bullet3In },
  ];

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.07,
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
        TWO CONCRETE MOVES — BOTH VERCEL-DOCUMENTED
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.125,
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
        Scope It. Protect It. Keep Control.
      </div>

      {/* Two-panel layout */}
      <div style={{
        position: 'absolute',
        top: height * 0.245,
        left: width * 0.06,
        right: width * 0.06,
        display: 'flex',
        gap: 28,
        alignItems: 'flex-start',
      }}>

        {/* Panel 1 — vercel mcp --project */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={{
            background: CLAUDE.CARD,
            border: `2px solid ${CLAUDE.BORDER}`,
            borderRadius: 18,
            padding: '26px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            opacity: clamp(panel1In, 0, 1),
            transform: `translateY(${(1 - clamp(panel1In, 0, 1)) * 18}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
              MOVE 1 — BLAST-RADIUS SHRINK
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.2 }}>
              Scope to<br />One Project
            </div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
              An injected instruction can't reach across unrelated projects under your account.
            </div>
          </div>

          {/* Code block */}
          <div style={{
            background: '#2F2A26',
            borderRadius: 14,
            padding: '20px 24px',
            opacity: clamp(code1In, 0, 1),
            transform: `translateY(${(1 - clamp(code1In, 0, 1)) * 12}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#888', textTransform: 'uppercase' as const, marginBottom: 10 }}>
              VERCEL DOCS EXAMPLE
            </div>
            <div style={{ fontFamily: MONO, fontSize: 16, color: '#F3EBDD', lineHeight: 1.7 }}>
              <span style={{ color: CLAUDE.SPARK }}>vercel mcp</span>{' '}
              <span style={{ color: '#C8C4BA' }}>--project</span>{' '}
              <span style={{ color: '#F3EBDD' }}>my-app</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: '#888', marginTop: 8, lineHeight: 1.4 }}>
              Connects Claude only to the named project.
            </div>
          </div>
        </div>

        {/* Panel 2 — Deployment protection bypass token */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={{
            background: GREEN_BG,
            border: `2px solid ${GREEN_BD}`,
            borderRadius: 18,
            padding: '26px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            opacity: clamp(panel2In, 0, 1),
            transform: `translateY(${(1 - clamp(panel2In, 0, 1)) * 18}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: GREEN_TXT, textTransform: 'uppercase' as const }}>
              MOVE 2 — THE GOOD CREDENTIAL PATTERN
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: CLAUDE.INK, lineHeight: 1.2 }}>
              Scoped Bypass<br />Secret
            </div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
              Claude hits a 403 on a preview URL? Don't disable protection. Generate a bypass token.
            </div>
          </div>

          {/* Code block */}
          <div style={{
            background: '#2F2A26',
            borderRadius: 14,
            padding: '20px 24px',
            opacity: clamp(code2In, 0, 1),
            transform: `translateY(${(1 - clamp(code2In, 0, 1)) * 12}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#888', textTransform: 'uppercase' as const, marginBottom: 10 }}>
              HOW IT WORKS
            </div>
            <div style={{ fontFamily: MONO, fontSize: 14, color: '#F3EBDD', lineHeight: 1.7 }}>
              <span style={{ color: '#888' }}># Project settings → Deployment Protection</span>
              {'\n'}
              <span style={{ color: CLAUDE.SPARK }}>Generate bypass secret</span>
              {'\n'}
              <span style={{ color: '#C8C4BA' }}>Store locally · attach as header</span>
            </div>
          </div>

          {/* Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bullets.map((b, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                opacity: clamp(b.in, 0, 1),
                transform: `translateX(${(1 - clamp(b.in, 0, 1)) * 14}px)`,
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: GREEN_BD,
                  flexShrink: 0,
                }} />
                <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: CLAUDE.INK, flexShrink: 0 }}>
                  {b.label}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>
                  — {b.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Note */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.14,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 15,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(noteIn, 0, 1),
      }}>
        The bypass token is the pattern to want: built exactly so you don't have to make staging public.
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
