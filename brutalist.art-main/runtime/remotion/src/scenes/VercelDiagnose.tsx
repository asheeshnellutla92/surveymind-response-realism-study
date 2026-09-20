import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

// B03 — Failed build → Claude calls get_deployment_build_logs / get_runtime_logs
// → surfaces the error. The low-risk, high-value core. Green/positive framing.

export const vercelDiagnoseSchema = z.object({
  sparkLine: z.string().default('Read the logs. Fix the build.'),
});
export type VercelDiagnoseProps = z.infer<typeof vercelDiagnoseSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const MONO  = CLAUDE_FONT.mono;

const RED_BG  = '#FEF2F0';
const RED_BD  = '#D97757';
const GREEN_BG  = '#F0FAF4';
const GREEN_BD  = '#52C47C';
const GREEN_TXT = '#1A6E3A';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const VercelDiagnose: React.FC<VercelDiagnoseProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const eyebrowIn  = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const titleIn    = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const step1In    = spring({ frame: frame - 14, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const arrow1In   = spring({ frame: frame - 26, fps, config: { damping: 28, stiffness: 140, mass: 0.8 } });
  const step2In    = spring({ frame: frame - 32, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const arrow2In   = spring({ frame: frame - 44, fps, config: { damping: 28, stiffness: 140, mass: 0.8 } });
  const step3In    = spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const detailIn   = spring({ frame: frame - 66, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn    = spring({ frame: frame - 80, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const arrowW = width * 0.05;

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
        THE USEFUL CORE — LOW RISK, HIGH VALUE
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
        Deploy Fails → Claude Reads → Error Found
      </div>

      {/* Three-step flow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: width * 0.06,
        right: width * 0.06,
        transform: 'translateY(-44%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}>

        {/* Step 1 — Failed Deploy */}
        <div style={{
          flex: 1,
          background: RED_BG,
          border: `2px solid ${RED_BD}`,
          borderRadius: 18,
          padding: '26px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: clamp(step1In, 0, 1),
          transform: `translateY(${(1 - clamp(step1In, 0, 1)) * 20}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: RED_BD, textTransform: 'uppercase' as const }}>
            TRIGGER
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: CLAUDE.INK }}>
            Deploy Failed
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: RED_BD, lineHeight: 1.5 }}>
            Error: build exit code 1<br />
            Missing: DATABASE_URL
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>
            You ask Claude to look.
          </div>
        </div>

        {/* Arrow 1 */}
        <div style={{
          width: arrowW,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: clamp(arrow1In, 0, 1),
          flexShrink: 0,
        }}>
          <svg width={arrowW} height={32} viewBox={`0 0 ${arrowW} 32`}>
            <line x1={4} y1={16} x2={arrowW - 12} y2={16} stroke={CLAUDE.SPARK} strokeWidth={2.5} strokeLinecap="round" />
            <polyline points={`${arrowW - 18},10 ${arrowW - 6},16 ${arrowW - 18},22`} stroke={CLAUDE.SPARK} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Step 2 — Claude Reads Logs */}
        <div style={{
          flex: 1.2,
          background: CLAUDE.CARD,
          border: `2px solid ${CLAUDE.BORDER}`,
          borderRadius: 18,
          padding: '26px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: clamp(step2In, 0, 1),
          transform: `translateY(${(1 - clamp(step2In, 0, 1)) * 20}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const }}>
            CLAUDE CALLS
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: CLAUDE.INK }}>
            Read Logs via MCP
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.6, background: CLAUDE.FOOTER, borderRadius: 8, padding: '10px 14px' }}>
            get_deployment_build_logs<br />
            get_runtime_logs
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>
            No dashboard. No copy-paste.
          </div>
        </div>

        {/* Arrow 2 */}
        <div style={{
          width: arrowW,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: clamp(arrow2In, 0, 1),
          flexShrink: 0,
        }}>
          <svg width={arrowW} height={32} viewBox={`0 0 ${arrowW} 32`}>
            <line x1={4} y1={16} x2={arrowW - 12} y2={16} stroke={CLAUDE.SPARK} strokeWidth={2.5} strokeLinecap="round" />
            <polyline points={`${arrowW - 18},10 ${arrowW - 6},16 ${arrowW - 18},22`} stroke={CLAUDE.SPARK} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Step 3 — Error Found */}
        <div style={{
          flex: 1,
          background: GREEN_BG,
          border: `2px solid ${GREEN_BD}`,
          borderRadius: 18,
          padding: '26px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: clamp(step3In, 0, 1),
          transform: `translateY(${(1 - clamp(step3In, 0, 1)) * 20}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: GREEN_TXT, textTransform: 'uppercase' as const }}>
            RESULT
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: CLAUDE.INK }}>
            Error Diagnosed
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: GREEN_TXT, lineHeight: 1.5 }}>
            Missing env var:<br />
            DATABASE_URL
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT }}>
            Set it. Redeploy. Done.
          </div>
        </div>
      </div>

      {/* Detail note */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.175,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 15,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(detailIn, 0, 1),
        transform: `translateY(${(1 - clamp(detailIn, 0, 1)) * 8}px)`,
      }}>
        Also: list_projects · get_deployments · filter_runtime_logs by status code + time range
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
