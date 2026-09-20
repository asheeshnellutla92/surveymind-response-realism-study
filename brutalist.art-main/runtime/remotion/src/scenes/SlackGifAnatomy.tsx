import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SlackGifAnatomy — B01 — Slack spec (2 formats) + 3 utilities + dependency.
 */

export const slackGifAnatomySchema = z.object({
  sparkLine: z.string().default('Know the spec. Use the toolkit. Write the PIL logic yourself.'),
});
export type SlackGifAnatomyProps = z.infer<typeof slackGifAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


const FORMATS = [
  { label: 'Emoji GIF', dim: '128×128 px', params: '10–30 FPS · 48–128 colors · ≤3 seconds', accent: true },
  { label: 'Message GIF', dim: '480×480 px', params: '10–30 FPS · 48–128 colors', accent: false },
];

const UTILITIES = [
  { name: 'GIFBuilder', mod: 'core.gif_builder', detail: 'Frame assembly + color quantization. num_colors=48, optimize_for_emoji=True for emoji mode.' },
  { name: 'Validators', mod: 'core.validators', detail: 'validate_gif() for detailed report · is_slack_ready() for quick boolean check before delivery.' },
  { name: 'Easing', mod: 'core.easing', detail: '7 curves: linear, ease_in/out, ease_in_out, bounce_out, elastic_out, back_out. interpolate(start, end, t, easing).' },
];

export const SlackGifAnatomy: React.FC<SlackGifAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const triggerIn = spring({ frame: frame - 8, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 110, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const fmtSprings = FORMATS.map((_, i) =>
    spring({ frame: frame - 22 - i * 14, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const utilSprings = UTILITIES.map((_, i) =>
    spring({ frame: frame - 40 - i * 13, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const depIn = spring({ frame: frame - 85, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } });

  const CONTENT_TOP = H * 0.22;
  const LEFT_W = W * 0.42;
  const RIGHT_X = W * 0.51;
  const RIGHT_W = W * 0.44;
  const FMT_H = (H * 0.38) / 2 - 12;
  const UTIL_H = (H * 0.54) / 3 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        SLACK GIF CREATOR · ANTHROPIC SKILL · ANATOMY
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 50, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Two formats. Three utilities.
      </div>

      {/* Left: TRIGGER + 2 format cards */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: W * 0.04, width: LEFT_W }}>
        {/* Trigger box */}
        <div style={{
          background: 'rgba(217,119,87,0.07)', border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `5px solid ${CLAUDE.SPARK}`, borderRadius: 12, padding: '10px 14px',
          marginBottom: 14, opacity: clamp(triggerIn, 0, 1),
          transform: `translateY(${(1 - clamp(triggerIn, 0, 1)) * 10}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.SPARK, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>
            TRIGGER
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: CLAUDE.INK, lineHeight: 1.45 }}>
            "make a GIF for Slack" · "Slack emoji GIF" · "animate this for Slack"
          </div>
        </div>

        <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12, opacity: clamp(fmtSprings[0], 0, 1) }}>
          FORMAT TRACKS:
        </div>
        {FORMATS.map((fmt, i) => {
          const op = clamp(fmtSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: fmt.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${fmt.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `5px solid ${fmt.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT}`,
              borderRadius: 12, padding: '14px 18px',
              height: FMT_H, boxSizing: 'border-box' as const, marginBottom: 10,
              boxShadow: fmt.accent ? '0 4px 14px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.04)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: CLAUDE.INK }}>{fmt.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: CLAUDE.SPARK }}>{fmt.dim}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: CLAUDE.INK_SOFT }}>{fmt.params}</div>
            </div>
          );
        })}

        {/* Deps note */}
        <div style={{
          fontFamily: MONO, fontSize: 11, color: CLAUDE.INK_SOFT,
          marginTop: 8, opacity: clamp(depIn, 0, 1),
        }}>
          pip install pillow imageio numpy
        </div>
      </div>

      {/* Right: 3 utilities */}
      <div style={{ position: 'absolute', top: CONTENT_TOP, left: RIGHT_X, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT, marginBottom: 12,
          opacity: clamp(utilSprings[0], 0, 1),
        }}>
          UTILITIES (core/):
        </div>
        {UTILITIES.map((util, i) => {
          const op = clamp(utilSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `5px solid ${CLAUDE.INK}`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 10,
              height: UTIL_H, boxSizing: 'border-box' as const,
              boxShadow: '0 3px 10px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: CLAUDE.INK }}>{util.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK }}>{util.mod}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{util.detail}</div>
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
