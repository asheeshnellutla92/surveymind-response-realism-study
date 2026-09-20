import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * WebArtifactsAnatomy — B01 — 4-step pipeline + tech stack.
 */

export const webArtifactsAnatomySchema = z.object({
  sparkLine: z.string().default('Init once. Develop. Bundle. Share bundle.html.'),
});
export type WebArtifactsAnatomyProps = z.infer<typeof webArtifactsAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const STEPS = [
  { num: '01', label: 'Initialize', cmd: 'bash scripts/init-artifact.sh <project-name>', detail: 'Full stack in one command: React+TS+Vite, Tailwind, 40+ shadcn/ui, path aliases, Parcel config' },
  { num: '02', label: 'Develop', cmd: 'edit generated files', detail: 'Write components, routes, and logic using the provisioned stack' },
  { num: '03', label: 'Bundle', cmd: 'bash scripts/bundle-artifact.sh', detail: 'Parcel build → html-inline → single self-contained bundle.html' },
  { num: '04', label: 'Share', cmd: 'display bundle.html as artifact', detail: 'Self-contained: all JS, CSS, deps inlined. Testing is step 5 — optional, deferred' },
];

const STACK = [
  { layer: 'Runtime', tech: 'React 18 + TypeScript', via: 'Vite' },
  { layer: 'Styling', tech: 'Tailwind CSS 3.4.1', via: 'shadcn/ui theming' },
  { layer: 'Components', tech: '40+ shadcn/ui pre-installed', via: 'Radix UI' },
  { layer: 'Bundler', tech: 'Parcel + html-inline', via: '@parcel/config-default' },
];

export const WebArtifactsAnatomy: React.FC<WebArtifactsAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const stepSprings = STEPS.map((_, i) =>
    spring({ frame: frame - 22 - i * 13, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const stackSprings = STACK.map((_, i) =>
    spring({ frame: frame - 40 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const STEP_H = (H * 0.66) / 4 - 12;
  const STACK_H = (H * 0.60) / 4 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        WEB ARTIFACTS BUILDER · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Init. Develop. Bundle. Share.
      </div>

      {/* Left: 4-step pipeline */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.04, width: LEFT_W }}>
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 12, padding: '10px 14px',
          marginBottom: 14, opacity: clamp(triggerIn, 0, 1),
          transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 10}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>
            TRIGGER (complex artifacts only)
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK, lineHeight: 1.45 }}>
            state management · routing · shadcn/ui components — NOT simple single-file HTML
          </div>
        </div>

        {STEPS.map((step, i) => {
          const op = clamp(stepSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: i === 2 ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${i === 2 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${i === 2 ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 12, padding: '10px 14px', marginBottom: 10,
              height: STEP_H, boxSizing: 'border-box' as const,
              boxShadow: i === 2 ? '0 4px 14px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: CLAUDE.SPARK, flexShrink: 0, paddingTop: 1 }}>{step.num}</div>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{step.label}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT }}>{step.cmd}</div>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>{step.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: tech stack */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12,
          opacity: clamp(stackSprings[0], 0, 1),
        }}>
          STACK (provisioned by init):
        </div>
        {STACK.map((item, i) => {
          const op = clamp(stackSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `5px solid ${CLAUDE.INK}`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 10,
              height: STACK_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.SPARK, fontWeight: 700 }}>{item.layer}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT }}>via {item.via}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{item.tech}</div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        display: 'flex', alignItems: 'center', gap: 12,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 28, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
