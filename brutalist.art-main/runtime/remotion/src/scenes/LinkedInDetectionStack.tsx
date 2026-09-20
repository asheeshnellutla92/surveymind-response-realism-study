import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const linkedInDetectionStackSchema = z.object({
  sparkLine: z.string().default("'Undetectable' is a warning."),
});
export type LinkedInDetectionStackProps = z.infer<typeof linkedInDetectionStackSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const WALL_TXT = '#9B2C1A';


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const DETECT_LAYERS = [
  { label: 'Extension signatures', detail: 'browser plugin fingerprint' },
  { label: 'Browser fingerprinting', detail: 'canvas, WebGL, user agent' },
  { label: 'Datacenter-IP gating', detail: 'non-residential origin' },
  { label: 'Timing analysis', detail: 'inhuman request cadence' },
];

export const LinkedInDetectionStack: React.FC<LinkedInDetectionStackProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn    = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const leftIn      = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const cookieIn    = spring({ frame: frame - 16, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const arrowIn     = spring({ frame: frame - 26, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const voyagerIn   = spring({ frame: frame - 36, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const rightIn     = spring({ frame: frame - 46, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const d1In        = spring({ frame: frame - 54, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const d2In        = spring({ frame: frame - 62, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const d3In        = spring({ frame: frame - 70, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const d4In        = spring({ frame: frame - 78, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const warningIn   = spring({ frame: frame - 94, fps, config: { damping: 24, stiffness: 110, mass: 1.0 } });
  const sparkIn     = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const detectIns = [d1In, d2In, d3In, d4In];

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
        HOW COOKIE-REPLAY TOOLS WORK · AND WHY LINKEDIN SEES THEM
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
        Cookie Extraction → Voyager Replay vs. the Detector
      </div>

      {/* Two-column layout */}
      <div style={{
        position: 'absolute',
        top: height * 0.245,
        left: width * 0.06,
        right: width * 0.06,
        bottom: height * 0.17,
        display: 'flex',
        gap: 40,
      }}>

        {/* Left — the attack path */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          opacity: clamp(leftIn, 0, 1),
          transform: `translateX(${(1 - clamp(leftIn, 0, 1)) * -16}px)`,
        }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase' as const,
            color: CLAUDE.INK_SOFT,
            marginBottom: 14,
          }}>
            The Unofficial Path
          </div>

          {/* Cookie box */}
          <div style={{
            background: '#FFF8F5',
            border: `2px solid ${CLAUDE.SPARK}`,
            borderRadius: 12,
            padding: '18px 20px',
            opacity: clamp(cookieIn, 0, 1),
            transform: `translateY(${(1 - clamp(cookieIn, 0, 1)) * 14}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 6 }}>
              Your session cookie
            </div>
            <div style={{ fontFamily: MONO, fontSize: 15, color: CLAUDE.INK, letterSpacing: -0.3 }}>
              li_at=<span style={{ color: CLAUDE.SPARK }}>AQEDARf...</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, marginTop: 6 }}>
              + JSESSIONID · copied from your browser
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: WALL_TXT, marginTop: 6, fontWeight: 600 }}>
              = your active login handed to a stranger
            </div>
          </div>

          {/* Arrow down */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '10px 0',
            opacity: clamp(arrowIn, 0, 1),
          }}>
            <svg width={28} height={32} viewBox="0 0 28 32" fill="none">
              <line x1={14} y1={2} x2={14} y2={24} stroke={CLAUDE.INK_SOFT} strokeWidth={2} strokeDasharray="4,3" strokeLinecap="round" />
              <polyline points="7,18 14,28 21,18" stroke={CLAUDE.INK_SOFT} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Voyager box */}
          <div style={{
            background: CLAUDE.CARD,
            border: `2px solid ${CLAUDE.BORDER}`,
            borderRadius: 12,
            padding: '18px 20px',
            opacity: clamp(voyagerIn, 0, 1),
            transform: `translateY(${(1 - clamp(voyagerIn, 0, 1)) * 14}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 6 }}>
              LinkedIn internal Voyager API
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.7 }}>
              /voyager/api/identity/profiles<br />
              /voyager/api/relationships
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, marginTop: 6 }}>
              Internal endpoint the website uses. Not a public API.
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 2,
          background: CLAUDE.BORDER,
          borderRadius: 2,
          margin: '0 4px',
          opacity: clamp(rightIn, 0, 1),
        }} />

        {/* Right — the detection stack */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          opacity: clamp(rightIn, 0, 1),
          transform: `translateX(${(1 - clamp(rightIn, 0, 1)) * 16}px)`,
        }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase' as const,
            color: CLAUDE.INK_SOFT,
            marginBottom: 14,
          }}>
            LinkedIn's Layered Detector
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DETECT_LAYERS.map((layer, i) => (
              <div key={i} style={{
                background: CLAUDE.CARD,
                border: `2px solid ${CLAUDE.BORDER}`,
                borderRadius: 10,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                opacity: clamp(detectIns[i], 0, 1),
                transform: `translateX(${(1 - clamp(detectIns[i], 0, 1)) * 14}px)`,
              }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: CLAUDE.SPARK,
                  flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: CLAUDE.INK }}>
                    {layer.label}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT }}>
                    {layer.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* "Undetectable" warning label */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.155,
        left: width * 0.06,
        right: width * 0.06,
        background: '#FEF2F0',
        border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 12,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        opacity: clamp(warningIn, 0, 1),
        transform: `scaleX(${clamp(warningIn, 0, 1)})`,
        transformOrigin: 'center center',
      }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={CLAUDE.SPARK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#9B2C1A' }}>
          When a vendor claims "undetectable" — that's naming what it's evading, not a feature. The evasion IS the tell.
        </span>
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
