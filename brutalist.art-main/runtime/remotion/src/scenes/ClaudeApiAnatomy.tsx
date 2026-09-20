import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ClaudeApiAnatomy — B01 — TRIGGER system + language detection + reading guide.
 * Left: TRIGGER callout + language detection list.
 * Right: Three reading-guide task cards.
 * FILL-THE-CANVAS: header 20%, two columns 21%–90%, spark line bottom.
 */

export const claudeApiAnatomySchema = z.object({
  sparkLine: z.string().default('Read before you open the file.'),
});
export type ClaudeApiAnatomyProps = z.infer<typeof claudeApiAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const LANGS = ['Python', 'TypeScript', 'Java', 'Go', 'Ruby', 'C#', 'PHP', 'cURL'];

const TASKS = [
  {
    label: 'Single LLM call',
    sub: 'Read {lang}/claude-api/README.md',
    delay: 30,
  },
  {
    label: 'Tool use / agents',
    sub: 'Read README.md + shared/tool-use-concepts.md + {lang}/claude-api/tool-use.md',
    delay: 44,
  },
  {
    label: 'Model migration',
    sub: 'Read shared/model-migration.md',
    delay: 58,
  },
  {
    label: 'Prompt caching',
    sub: 'Read shared/prompt-caching.md + README.md caching section',
    delay: 72,
  },
];

export const ClaudeApiAnatomy: React.FC<ClaudeApiAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 100, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });

  const langSprings = LANGS.map((_, i) =>
    spring({ frame: frame - 26 - i * 7, fps, config: { damping: 30, stiffness: 140, mass: 0.8 } })
  );
  const taskSprings = TASKS.map(t =>
    spring({ frame: frame - t.delay, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.20;
  const LEFT_W = W * 0.42;
  const RIGHT_X = W * 0.50;
  const RIGHT_W = W * 0.44;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CLAUDE API · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 52, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        One skill. Eight languages. Three surfaces.
      </div>

      {/* Left: TRIGGER + languages */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.05, width: LEFT_W }}>
        {/* TRIGGER callout */}
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 14, padding: '18px 22px',
          marginBottom: 24, opacity: clamp(triggerIn, 0, 1),
          transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 12}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 8 }}>
            TRIGGER (from frontmatter)
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: CLAUDE.INK, lineHeight: 1.55 }}>
            Read <span style={{ color: CLAUDE.SPARK, fontWeight: 700 }}>BEFORE</span> opening the target file — whenever: the prompt names Claude/Anthropic in any form; the user asks about an LLM; OR the task is LLM-shaped with provider unstated.
          </div>
        </div>

        {/* SKIP rule */}
        <div style={{
          background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
          borderRadius: 12, padding: '14px 18px', marginBottom: 24,
          opacity: clamp(triggerIn * 0.8, 0, 1),
        }}>
          <div style={{ fontFamily: SANS, fontSize: 14, color: CLAUDE.INK_SOFT, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 2 }}>
            SKIP only when
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
            Another provider is being worked on: OpenAI/GPT, Gemini, Llama, Mistral, Cohere, Ollama.
          </div>
        </div>

        {/* Language chips */}
        <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 16, opacity: clamp(triggerIn, 0, 1) }}>
          8 LANGUAGES:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 12 }}>
          {LANGS.map((lang, i) => {
            const op = clamp(langSprings[i], 0, 1);
            return (
              <div key={i} style={{
                background: i < 2 ? 'rgba(217,119,87,0.08)' : '#FFFFFF',
                border: `1px solid ${i < 2 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderRadius: 8, padding: '6px 16px',
                fontFamily: MONO, fontSize: 16,
                color: i < 2 ? CLAUDE.SPARK : CLAUDE.INK,
                opacity: op, transform: `translateY(${(1 - op) * 8}px)`,
              }}>
                {lang}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Quick task reference */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
          marginBottom: 20, opacity: clamp(headerIn, 0, 1),
        }}>
          QUICK TASK REFERENCE:
        </div>

        {TASKS.map((task, i) => {
          const op = clamp(taskSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `6px solid ${i === 0 ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 14, padding: '18px 22px', marginBottom: 18,
              boxShadow: '0 5px 16px rgba(61,57,41,0.07)',
              opacity: op, transform: `translateX(${(1 - op) * 20}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: CLAUDE.INK, marginBottom: 6 }}>
                {task.label}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
                {task.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.055,
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
