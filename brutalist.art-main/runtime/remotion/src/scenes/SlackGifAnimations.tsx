import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SlackGifAnimations — B02 — 8 animation concepts from SKILL.md, two-column quick-reference.
 */

export const slackGifAnimationsSchema = z.object({
  sparkLine: z.string().default('Combine concepts. PIL does more than you think.'),
});
export type SlackGifAnimationsProps = z.infer<typeof slackGifAnimationsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const LEFT_ANIMS = [
  { name: 'Shake / Vibrate', code: 'math.sin(i * freq)', detail: 'Oscillate position; add random variation for natural feel' },
  { name: 'Pulse / Heartbeat', code: 'sin(t × freq × 2π)', detail: 'Scale 0.8→1.2; two quick pulses then pause for heartbeat' },
  { name: 'Bounce', code: 'ease_in + bounce_out', detail: 'ease_in for falling (gravity), bounce_out for landing' },
  { name: 'Spin / Rotate', code: 'image.rotate(angle)', detail: 'Linear for spin; sine wave for wobble angle' },
];

const RIGHT_ANIMS = [
  { name: 'Fade In / Out', code: 'RGBA + alpha', detail: 'Adjust alpha channel or Image.blend() between frames' },
  { name: 'Slide', code: 'ease_out / back_out', detail: 'Start off-screen; ease_out for smooth stop, back_out for overshoot' },
  { name: 'Zoom', code: 'scale 0.1 → 2.0', detail: 'Scale and crop center; can add motion blur for drama' },
  { name: 'Explode / Particles', code: 'vx, vy + gravity', detail: 'Random angles, velocities; vy += gravity; fade alpha over time' },
];

export const SlackGifAnimations: React.FC<SlackGifAnimationsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const calloutIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const leftSprings = LEFT_ANIMS.map((_, i) =>
    spring({ frame: frame - 22 - i * 11, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const rightSprings = RIGHT_ANIMS.map((_, i) =>
    spring({ frame: frame - 30 - i * 11, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.44;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const ROW_H = (H * 0.66) / 4 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        SLACK GIF CREATOR · ANIMATION CONCEPTS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Eight concepts. Combine freely.
      </div>

      {/* Left: 4 animation concepts */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.04, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12,
          opacity: clamp(calloutIn, 0, 1),
        }}>
          MOTION CONCEPTS:
        </div>
        {LEFT_ANIMS.map((anim, i) => {
          const op = clamp(leftSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `5px solid ${CLAUDE.INK}`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 10,
              height: ROW_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{anim.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK }}>{anim.code}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{anim.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Right: 4 animation concepts */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.SPARK, marginBottom: 12,
          opacity: clamp(rightSprings[0], 0, 1),
        }}>
          MORE CONCEPTS:
        </div>
        {RIGHT_ANIMS.map((anim, i) => {
          const op = clamp(rightSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.03)', border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '12px 16px', marginBottom: 10,
              height: ROW_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(217,119,87,0.06)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{anim.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK }}>{anim.code}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{anim.detail}</div>
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
