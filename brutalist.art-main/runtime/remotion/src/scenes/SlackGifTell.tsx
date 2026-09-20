import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SlackGifTell — B05 — Teardown: gets right / bites.
 */

export const slackGifTellSchema = z.object({
  sparkLine: z.string().default('GIF is a constraint problem. Solve it with PIL primitives.'),
});
export type SlackGifTellProps = z.infer<typeof slackGifTellSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const GETS_RIGHT = [
  'Exact Slack specs baked in — emoji 128×128 ≤3s, message 480×480; validator catches non-compliance before delivery',
  'GIFBuilder abstracts frame assembly and handles color quantization — no boilerplate per request',
  '7 easing curves (bounce_out, elastic_out, back_out, ease_in/out) cover the full smooth-motion range',
  'No-rigid-templates philosophy gives full PIL ImageDraw access — creative ceiling is PIL\'s ceiling',
  'Two optimization paths: emoji mode (optimize_for_emoji=True) vs standard, with remove_duplicates option',
];

const BITES = [
  'PIL-only drawing makes complex shapes (hearts, snowflakes) require careful polygon math by hand — no helpers',
  'No text rendering guidance: emoji fonts flagged unreliable, no font alternative or draw_text recipe given',
  'Color palette dithering artifacts at 48 colors not addressed — banding can appear on smooth gradients',
  'Seamless looping requires matching first and last frames manually — no loop-helper utility',
  '3 dependencies (Pillow, imageio, numpy) must be pre-installed — skill does not install them automatically',
];

export const SlackGifTell: React.FC<SlackGifTellProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const rightSprings = GETS_RIGHT.map((_, i) =>
    spring({ frame: frame - 36 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const bitesSprings = BITES.map((_, i) =>
    spring({ frame: frame - 36 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.40;
  const COL_W = W * 0.40;
  const ITEM_H = (H * 0.51) / 5 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        SLACK GIF CREATOR · TEARDOWN
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Spec is fixed. Compliance is verifiable.
      </div>

      {/* Central callout */}
      <div style={{
        position: 'absolute', top: H * 0.26, left: W * 0.08, right: W * 0.08,
        background: 'rgba(217,119,87,0.06)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 16, padding: '18px 28px',
        opacity: clamp(calloutIn, 0, 1),
        transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 17, color: CLAUDE.INK, lineHeight: 1.6 }}>
          The architectural insight is that the Slack GIF Creator solves a{' '}
          <span style={{ fontFamily: MONO, color: CLAUDE.SPARK, fontWeight: 700 }}>constraint problem</span>,
          not a creativity problem: the spec is fixed (emoji 128×128, ≤3s; message 480×480),
          compliance is verifiable (validator), and the toolkit handles frame assembly and easing
          so the animation logic can be expressive — not rigid.
        </div>
      </div>

      {/* Two columns */}
      <div style={{ position: 'absolute', left: W * 0.06, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 14,
        }}>
          ✓ WHAT IT GETS RIGHT
        </div>
        {GETS_RIGHT.map((item, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              height: ITEM_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {item}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', left: W * 0.53, top: COL_TOP, width: COL_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 14,
        }}>
          ✗ WHERE IT BITES
        </div>
        {BITES.map((item, i) => {
          const op = clamp(bitesSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.04)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              height: ITEM_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 12px rgba(217,119,87,0.08)',
              opacity: op, transform: `translateX(${(1 - op) * 10}px)`,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.45 }}>
                {item}
              </div>
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
