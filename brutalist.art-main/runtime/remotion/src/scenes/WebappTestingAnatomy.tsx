import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WebappTestingAnatomy — B01 — Decision tree + recon-and-action pipeline.
 */

export const webappTestingAnatomySchema = z.object({
  sparkLine: z.string().default('Static: read → script. Dynamic: server → recon → act.'),
});
export type WebappTestingAnatomyProps = z.infer<typeof webappTestingAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const STATIC_STEPS = [
  { label: 'Read file', detail: 'Identify selectors from raw HTML' },
  { label: 'Write Playwright script', detail: 'Target a file:// URL — no server needed' },
];

const DYNAMIC_STEPS = [
  { label: 'Server not running', detail: 'python scripts/with_server.py --help → start via helper', highlight: true },
  { label: 'Server already running', detail: 'Go straight to reconnaissance-then-action', highlight: false },
  { label: 'Recon → Act', detail: 'Navigate · wait networkidle · screenshot · identify selectors · execute', highlight: false },
];

const RECON_STEPS = [
  '① Navigate and wait for networkidle',
  '② Screenshot or inspect rendered DOM',
  '③ Identify selectors from actual render',
  '④ Execute actions with discovered selectors',
];

export const WebappTestingAnatomy: React.FC<WebappTestingAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 6, fps, config: { damping: 28, stiffness: 110, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const staticSprings = STATIC_STEPS.map((_, i) =>
    spring({ frame: frame - 24 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const dynamicSprings = DYNAMIC_STEPS.map((_, i) =>
    spring({ frame: frame - 24 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const reconSprings = RECON_STEPS.map((_, i) =>
    spring({ frame: frame - 60 - i * 8, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.32;
  const COL_W = W * 0.38;
  const STEP_H = (H * 0.30) / 2 - 10;
  const DYN_H = (H * 0.30) / 3 - 10;
  const RECON_H = (H * 0.28) / 4 - 8;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        WEB APPLICATION TESTING · PIPELINE
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 46, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Decision tree: static vs dynamic.
      </div>

      {/* TRIGGER */}
      <div style={{
        position: 'absolute', top: H * 0.228, left: W * 0.08, right: W * 0.08,
        background: `rgba(217,119,87,0.08)`, border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 14, padding: '12px 22px',
        display: 'flex', alignItems: 'center', gap: 16,
        opacity: clamp(triggerIn, 0, 1),
        transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 10}px)`,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: CLAUDE.SPARK, whiteSpace: 'nowrap' as const }}>
          TRIGGER
        </span>
        <span style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK, lineHeight: 1.4 }}>
          Test a local web app → decide: is it{' '}
          <span style={{ fontFamily: MONO, color: CLAUDE.SPARK, fontWeight: 700 }}>static HTML</span>{' '}
          or a{' '}
          <span style={{ fontFamily: MONO, color: CLAUDE.SPARK, fontWeight: 700 }}>dynamic webapp</span>{' '}
          that requires a server?
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        position: 'absolute', top: COL_TOP - 28, left: W * 0.06,
        fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
        color: '#4A7C59', textTransform: 'uppercase' as const,
        opacity: clamp(staticSprings[0], 0, 1),
      }}>
        STATIC HTML
      </div>
      <div style={{
        position: 'absolute', top: COL_TOP - 28, left: W * 0.53,
        fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.SPARK, textTransform: 'uppercase' as const,
        opacity: clamp(dynamicSprings[0], 0, 1),
      }}>
        DYNAMIC WEBAPP
      </div>

      {/* Static column */}
      <div style={{ position: 'absolute', left: W * 0.06, top: COL_TOP, width: COL_W }}>
        {STATIC_STEPS.map((step, i) => {
          const op = clamp(staticSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              height: STEP_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#4A7C59', marginBottom: 4 }}>
                {`0${i + 1}`}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: CLAUDE.INK }}>{step.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.4, marginTop: 4 }}>{step.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Dynamic column */}
      <div style={{ position: 'absolute', left: W * 0.53, top: COL_TOP, width: COL_W }}>
        {DYNAMIC_STEPS.map((step, i) => {
          const op = clamp(dynamicSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: step.highlight ? `rgba(217,119,87,0.06)` : '#FFFFFF',
              border: `1px solid ${step.highlight ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 10,
              height: DYN_H, boxSizing: 'border-box' as const,
              boxShadow: step.highlight ? '0 3px 12px rgba(217,119,87,0.08)' : '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: step.highlight ? CLAUDE.SPARK : CLAUDE.INK }}>
                {step.label}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4, marginTop: 4 }}>{step.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Recon loop */}
      <div style={{
        position: 'absolute', top: COL_TOP + (H * 0.30) + 16, left: W * 0.06, right: W * 0.06,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(reconSprings[0], 0, 1),
        }}>
          RECONNAISSANCE-THEN-ACTION LOOP
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {RECON_STEPS.map((step, i) => {
            const op = clamp(reconSprings[i], 0, 1);
            return (
              <div key={i} style={{
                flex: 1, background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
                borderTop: `3px solid ${CLAUDE.SPARK}`,
                borderRadius: 8, padding: '10px 12px',
                height: RECON_H, boxSizing: 'border-box' as const,
                boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
                opacity: op, transform: `translateY(${(1 - op) * 10}px)`,
              }}>
                <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.45 }}>{step}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
