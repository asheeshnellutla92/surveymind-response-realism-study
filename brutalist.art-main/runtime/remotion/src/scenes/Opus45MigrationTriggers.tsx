import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * Opus45MigrationTriggers — B02 — 5 behavioral adjustment triggers (opt-in only).
 */

export const opus45MigrationTriggersSchema = z.object({
  sparkLine: z.string().default('Opt-in only. Apply if reported. Never apply by default.'),
});
export type Opus45MigrationTriggersProps = z.infer<typeof opus45MigrationTriggersSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const TRIGGERS = [
  {
    num: '1',
    label: 'Tool Overtriggering',
    when: 'Tools called too frequently or unnecessarily',
    fix: 'Soften: CRITICAL → remove · You MUST → should · ALWAYS → do · NEVER → don\'t',
    color: CLAUDE.SPARK,
  },
  {
    num: '2',
    label: 'Over-Engineering',
    when: 'Unwanted files, excessive abstraction, unrequested features',
    fix: 'Add over-engineering prevention snippet (references/prompt-snippets.md)',
    color: CLAUDE.SPARK,
  },
  {
    num: '3',
    label: 'Code Exploration',
    when: 'Model proposes fixes without reading relevant files',
    fix: 'Add code exploration snippet (references/prompt-snippets.md)',
    color: CLAUDE.SPARK,
  },
  {
    num: '4',
    label: 'Frontend Design',
    when: 'User requests better design quality or reports generic output',
    fix: 'Add frontend aesthetics snippet (references/prompt-snippets.md)',
    color: CLAUDE.SPARK,
  },
  {
    num: '5',
    label: 'Thinking Sensitivity',
    when: 'Issues with "think" variants, no thinking parameter in request',
    fix: '"think" → "consider" / "believe" / "evaluate"',
    color: CLAUDE.SPARK,
  },
];

export const Opus45MigrationTriggers: React.FC<Opus45MigrationTriggersProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 160, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const bannerIn = spring({ frame: frame - 4, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });
  const triggerSprings = TRIGGERS.map((_, i) =>
    spring({ frame: frame - 14 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const noteIn = spring({ frame: frame - 70, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const TRIG_TOP = H * 0.30;
  const TRIG_H = (H * 0.52) / 5 - 6;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        OPUS 4.5 MIGRATION · PROMPT ADJUSTMENTS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 34, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Five known differences. Opt-in only.
      </div>

      {/* Opt-in banner */}
      <div style={{
        position: 'absolute', top: TRIG_TOP - 38, left: W * 0.05, right: W * 0.05,
        background: 'rgba(74,124,89,0.06)', border: `1px solid #4A7C59`,
        borderRadius: 6, padding: '5px 12px', boxSizing: 'border-box' as const,
        display: 'flex', alignItems: 'center', gap: 8,
        opacity: clamp(bannerIn, 0, 1),
      }}>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: '#4A7C59' }}>RULE:</span>
        <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK }}>Only apply if user explicitly requests OR reports the specific issue. Never by default.</span>
      </div>

      {TRIGGERS.map((t, i) => {
        const op = clamp(triggerSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: TRIG_TOP + i * (TRIG_H + 6),
            left: W * 0.05, right: W * 0.05,
            height: TRIG_H,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${t.color}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 0,
            padding: '0 12px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * -10}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: t.color, minWidth: 22 }}>{t.num}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK }}>{t.label}</span>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontFamily: SANS, fontSize: 9, color: CLAUDE.SPARK, flex: 1 }}>When: {t.when}</span>
                <span style={{ fontFamily: SANS, fontSize: 9, color: '#4A7C59', flex: 1 }}>Fix: {t.fix}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Integration note */}
      <div style={{
        position: 'absolute', bottom: H * 0.12, left: W * 0.05, right: W * 0.05,
        fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.4,
        opacity: clamp(noteIn, 0, 1),
      }}>
        Integration: use XML tags to organize additions · match existing style · place near related instructions · never just append
      </div>

      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
