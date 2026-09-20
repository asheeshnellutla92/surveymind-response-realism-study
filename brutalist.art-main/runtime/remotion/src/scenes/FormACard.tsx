import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * FormACard — Design vocabulary Form A card (DESIGN-PRINCIPLES.md §1).
 * Text-only, EB Garamond serif, centered on plain solid ground.
 * Karaoke reveal: lines appear progressively (first line → each subsequent line
 * on its spoken cue). Duration-agnostic — compile.py conforms to audio length.
 *
 * BANNED patterns this component never has: eyebrow / kicker label, rule,
 * decorative circle / blob, bold geometric sans headline, underline accent.
 *
 * Polarity: dark=false (default) → cream #FAF9F5 / ink #3D3929.
 *           dark=true            → charcoal #2A2720 / cream #FAF9F5.
 * Author the dark= flag from a seeded value at beat-sheet time — never random.
 */

export const formACardSchema = z.object({
  lines: z.array(z.string()).default(['⚠ SET lines IN BEAT SHEET']),
  /**
   * Optional COLOPHON tier: provenance, sources, credits. Rendered smaller and
   * softer beneath the main lines so a citation never reads as a peer of the
   * headline. Sources belong in a colophon, not in the stack. Omit for the
   * classic all-equal card — existing beat sheets are unaffected.
   */
  meta:  z.array(z.string()).optional(),
  dark:  z.boolean().default(false),
});
export type FormACardProps = z.infer<typeof formACardSchema>;

const SERIF = CLAUDE_FONT.serif;
const DARK_BG = '#2A2720';

// First line appears at frame 8; each subsequent line strides 20 frames later.
const APPEAR_START = 8;
const LINE_STRIDE  = 20;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const FormACard: React.FC<FormACardProps> = ({ lines, meta, dark }) => {
  const frame                  = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();

  const bg  = dark ? DARK_BG   : CLAUDE.PAGE;
  const fg  = dark ? CLAUDE.PAGE : CLAUDE.INK;

  // ── Auto-fit & code-penalty ───────────────────────────────────────────────
  // Card has 10 % horizontal padding each side → usable width = 80 % of frame.
  // Average EB Garamond advance ≈ 0.62 em (conservative; prevents overflow).
  const CHAR_ADV   = 0.62;
  const FONT_FLOOR = Math.round(height * 0.045);   // §8.1 type-gate minimum — 48.6px CSS → 71px physical blob at 4K (ratio ~0.73)
  const availW     = width * 0.80;

  // Script / prompt / code detection: any line > 55 chars or typical code
  // punctuation → apply ~20 % base-size reduction to the whole card.
  const titleLen   = lines[0]?.length || 1;
  const bodyMaxLen = Math.max(...lines.slice(1).map(l => l.length), 1);
  const isCodeLike = titleLen > 55
    || bodyMaxLen > 55
    || lines.some(l => l.length > 20 && /[`{}()\[\];=]/.test(l));
  const penalty    = isCodeLike ? 0.80 : 1.0;

  // Font sizes: first line is the title (larger); the rest are body.
  // Clamped so the longest line of each role fits inside availW.
  const titleSz = Math.max(
    FONT_FLOOR,
    Math.min(Math.round(height * 0.066) * penalty, Math.floor(availW / (titleLen   * CHAR_ADV))),
  );
  const bodySz  = Math.max(
    FONT_FLOOR,
    Math.min(Math.round(height * 0.050) * penalty, Math.floor(availW / (bodyMaxLen * CHAR_ADV))),
  );
  // Colophon tier: subordinate by size AND colour, and exempt from the type
  // floor on purpose — it is reference matter, not something read aloud.
  const metaMaxLen = Math.max(...(meta ?? ['']).map(l => l.length), 1);
  const metaSz     = Math.min(Math.round(height * 0.048), Math.floor(availW / (metaMaxLen * CHAR_ADV)));
  const metaStart  = APPEAR_START + lines.length * LINE_STRIDE;

  return (
    <AbsoluteFill style={{ background: bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 10%',
        gap: Math.round(height * 0.022),
      }}>
        {lines.map((line, i) => {
          const appearAt = APPEAR_START + i * LINE_STRIDE;
          const sp = spring({
            frame: frame - appearAt,
            fps,
            config: { damping: 30, stiffness: 170, mass: 0.7 },
          });
          const visible = frame >= appearAt;
          return (
            <div
              key={i}
              style={{
                fontFamily:    SERIF,
                fontSize:      i === 0 ? titleSz : bodySz,
                fontWeight:    i === 0 ? 700 : 400,
                fontStyle:     'normal',
                color:         fg,
                letterSpacing: '-0.02em',
                lineHeight:    1.12,
                opacity:       visible ? clamp(sp, 0, 1) : 0,
                transform:     `translateY(${(1 - (visible ? clamp(sp, 0, 1) : 0)) * 12}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      {meta && meta.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', padding: '0 12%',
          marginTop: Math.round(height * 0.055),
          gap: Math.round(height * 0.010),
        }}>
          {meta.map((line, i) => {
            const appearAt = metaStart + i * 10;
            const sp = spring({
              frame: frame - appearAt,
              fps,
              config: { damping: 30, stiffness: 170, mass: 0.7 },
            });
            const visible = frame >= appearAt;
            return (
              <div
                key={`meta-${i}`}
                style={{
                  fontFamily:    SERIF,
                  fontSize:      metaSz,
                  fontWeight:    400,
                  color:         fg,
                  opacity:       (visible ? clamp(sp, 0, 1) : 0) * 0.58,
                  letterSpacing: '-0.01em',
                  lineHeight:    1.25,
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
