import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * CwcMemoryTimeline — C1 centerpiece for "Why Agents Forget"
 * Three-session timeline: amnesia → memory store recall.
 * Sessions A, B (no store), then A, B, C (with store + file tree growing).
 * Source: agents-that-remember/ — CWC Workshop 2026
 */

export const cwcMemoryTimelineSchema = z.object({
  sparkLine: z.string().default('Write once. Recall forever.'),
});
export type CwcMemoryTimelineProps = z.infer<typeof cwcMemoryTimelineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const CwcMemoryTimeline: React.FC<CwcMemoryTimelineProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase timing (at 30fps, total ~36s = ~1080 frames, but audio dictates)
  // 0-20: eyebrow + "WITHOUT store" label appear
  // 20-50: Session A node + speech bubble "I prefer async/await"
  // 50-80: arrow → Session B + "What's my coding style?" bubble
  // 80-110: Session B output "I don't know" (amnesia)
  // 110-140: divider + "WITH memory store" label
  // 140-170: Session A writes to file tree (terracotta moment)
  // 170-200: Session B reads → Session C
  // 200-230: Session C output "You prefer async/await" (green)
  // 230+: sparkline

  const eyebrowIn = spring({ frame, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const sessionAIn = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const bubbleAIn = spring({ frame: frame - 30, fps, config: { damping: 26, stiffness: 100, mass: 1.0 } });
  const arrowABIn = spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const sessionBIn = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const bubbleBAmnesiaIn = spring({ frame: frame - 70, fps, config: { damping: 26, stiffness: 100, mass: 1.0 } });
  const amnesiaIn = spring({ frame: frame - 80, fps, config: { damping: 26, stiffness: 100, mass: 1.0 } });
  const dividerIn = spring({ frame: frame - 110, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const withStoreIn = spring({ frame: frame - 120, fps, config: { damping: 30, stiffness: 120, mass: 0.8 } });
  const fileTreeIn = spring({ frame: frame - 140, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const entry1In = spring({ frame: frame - 155, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const entry2In = spring({ frame: frame - 165, fps, config: { damping: 26, stiffness: 100, mass: 0.9 } });
  const arrowBCIn = spring({ frame: frame - 180, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const sessionCIn = spring({ frame: frame - 185, fps, config: { damping: 28, stiffness: 110, mass: 0.9 } });
  const recallIn = spring({ frame: frame - 200, fps, config: { damping: 26, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 230, fps, config: { damping: 28, stiffness: 100, mass: 0.8 } });

  const PAD_X = width * 0.06;
  const PAD_Y = height * 0.07;

  // Layout: top half = WITHOUT, bottom half = WITH
  const topY = PAD_Y + height * 0.06;
  const botY = height * 0.52;

  // Session node size
  const NODE_W = width * 0.13;
  const NODE_H = height * 0.10;
  const NODE_R = 10;

  // Session X positions (3 sessions across width)
  const sX = (i: number) => PAD_X + i * ((width - PAD_X * 2 - NODE_W) / 2);

  // File tree panel
  const TREE_X = width * 0.74;
  const TREE_Y = botY + height * 0.005;
  const TREE_W = width * 0.20;
  const TREE_H = height * 0.30;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD_X, top: PAD_Y,
        fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(eyebrowIn, 0, 1),
      }}>
        AGENT MEMORY · CROSS-SESSION RECALL
      </div>

      {/* ── TOP ROW: WITHOUT STORE ── */}
      <div style={{
        position: 'absolute', left: PAD_X, top: topY,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 2, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(eyebrowIn, 0, 1),
      }}>Without memory store</div>

      {/* Session A node */}
      <div style={{
        position: 'absolute',
        left: sX(0), top: topY + height * 0.05,
        width: NODE_W, height: NODE_H, borderRadius: NODE_R,
        background: CLAUDE.CARD, border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: clamp(sessionAIn, 0, 1),
        transform: `scale(${0.8 + 0.2 * clamp(sessionAIn, 0, 1)})`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.016, fontWeight: 700, color: CLAUDE.INK }}>Session A</div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT }}>tell agent</div>
      </div>

      {/* Bubble A: "I prefer async/await" */}
      <div style={{
        position: 'absolute',
        left: sX(0) + NODE_W + 6, top: topY + height * 0.04,
        maxWidth: width * 0.18,
        background: CLAUDE.PILL, border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 8, padding: '6px 10px',
        opacity: clamp(bubbleAIn, 0, 1),
        transform: `translateX(${(1 - clamp(bubbleAIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.INK, lineHeight: 1.4 }}>
          "I prefer async/await over promises"
        </div>
      </div>

      {/* Arrow A→B */}
      <svg style={{
        position: 'absolute',
        left: sX(0) + NODE_W, top: topY + height * 0.05,
        width: sX(1) - sX(0) - NODE_W, height: NODE_H,
        overflow: 'visible', opacity: clamp(arrowABIn, 0, 1),
      }}>
        <defs>
          <marker id="arr1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.INK_SOFT} />
          </marker>
        </defs>
        <line x1={0} y1={NODE_H / 2} x2={sX(1) - sX(0) - NODE_W - 4} y2={NODE_H / 2}
          stroke={CLAUDE.INK_SOFT} strokeWidth={1.5} strokeDasharray="6 4"
          markerEnd="url(#arr1)" />
      </svg>

      {/* Session B node */}
      <div style={{
        position: 'absolute',
        left: sX(1), top: topY + height * 0.05,
        width: NODE_W, height: NODE_H, borderRadius: NODE_R,
        background: CLAUDE.CARD, border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: clamp(sessionBIn, 0, 1),
        transform: `scale(${0.8 + 0.2 * clamp(sessionBIn, 0, 1)})`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.016, fontWeight: 700, color: CLAUDE.INK }}>Session B</div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT }}>ask agent</div>
      </div>

      {/* Bubble B: "What's my coding style?" */}
      <div style={{
        position: 'absolute',
        left: sX(1) + NODE_W + 6, top: topY + height * 0.04,
        maxWidth: width * 0.16,
        background: CLAUDE.PILL, border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 8, padding: '6px 10px',
        opacity: clamp(bubbleBAmnesiaIn, 0, 1),
        transform: `translateX(${(1 - clamp(bubbleBAmnesiaIn, 0, 1)) * 12}px)`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
          "What's my coding style?"
        </div>
      </div>

      {/* Amnesia output */}
      <div style={{
        position: 'absolute',
        left: sX(1), top: topY + height * 0.18,
        width: NODE_W + width * 0.16,
        background: CLAUDE.CARD,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 8, padding: '8px 14px',
        opacity: clamp(amnesiaIn, 0, 1),
        transform: `translateY(${(1 - clamp(amnesiaIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: CLAUDE.INK_SOFT, lineHeight: 1.5 }}>
          ❌ "I don't have that context."
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{
        position: 'absolute',
        left: PAD_X, top: height * 0.485,
        width: width - PAD_X * 2, height: 1,
        background: CLAUDE.BORDER,
        opacity: clamp(dividerIn, 0, 1),
      }} />

      {/* ── BOTTOM ROW: WITH STORE ── */}
      <div style={{
        position: 'absolute', left: PAD_X, top: botY - height * 0.02,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 2, textTransform: 'uppercase' as const,
        color: CLAUDE.SPARK, opacity: clamp(withStoreIn, 0, 1),
      }}>With memory store</div>

      {/* Session A (bottom) */}
      <div style={{
        position: 'absolute',
        left: sX(0), top: botY + height * 0.05,
        width: NODE_W, height: NODE_H, borderRadius: NODE_R,
        background: CLAUDE.CARD, border: `2px solid ${CLAUDE.SPARK}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: clamp(withStoreIn, 0, 1),
        transform: `scale(${0.8 + 0.2 * clamp(withStoreIn, 0, 1)})`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.016, fontWeight: 700, color: CLAUDE.INK }}>Session A</div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.SPARK, fontWeight: 700 }}>writes ↗</div>
      </div>

      {/* File tree panel — growing */}
      <div style={{
        position: 'absolute',
        left: TREE_X, top: TREE_Y,
        width: TREE_W, height: TREE_H,
        background: CLAUDE.CARD,
        border: `2px solid ${CLAUDE.SPARK}`,
        borderRadius: 10,
        overflow: 'hidden',
        opacity: clamp(fileTreeIn, 0, 1),
        transform: `scale(${0.85 + 0.15 * clamp(fileTreeIn, 0, 1)})`,
      }}>
        <div style={{
          background: CLAUDE.PAGE,
          borderBottom: `1px solid ${CLAUDE.BORDER}`,
          padding: '8px 12px',
          fontFamily: SANS, fontSize: height * 0.011, fontWeight: 700,
          color: CLAUDE.INK_SOFT, letterSpacing: 1, textTransform: 'uppercase' as const,
        }}>
          memory-store/
        </div>
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Entry 1 */}
          <div style={{
            opacity: clamp(entry1In, 0, 1),
            transform: `translateX(${(1 - clamp(entry1In, 0, 1)) * -10}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.SPARK, lineHeight: 1.4 }}>
              📄 coding-preferences.md
            </div>
            <div style={{
              fontFamily: MONO, fontSize: height * 0.010, color: CLAUDE.INK_SOFT,
              marginLeft: 16, lineHeight: 1.5,
            }}>
              prefers: async/await
            </div>
          </div>
          {/* Entry 2 */}
          <div style={{
            opacity: clamp(entry2In, 0, 1),
            transform: `translateX(${(1 - clamp(entry2In, 0, 1)) * -10}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: height * 0.011, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>
              📄 stack.md
            </div>
            <div style={{
              fontFamily: MONO, fontSize: height * 0.010, color: CLAUDE.INK_SOFT,
              marginLeft: 16, lineHeight: 1.5,
            }}>
              stack: TypeScript/Node
            </div>
          </div>
        </div>
      </div>

      {/* Write arrow A → file tree */}
      <svg style={{
        position: 'absolute',
        left: sX(0) + NODE_W, top: botY + height * 0.05,
        width: TREE_X - (sX(0) + NODE_W), height: NODE_H,
        overflow: 'visible', opacity: clamp(fileTreeIn, 0, 1),
      }}>
        <defs>
          <marker id="arr2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={CLAUDE.SPARK} />
          </marker>
        </defs>
        <line x1={0} y1={NODE_H / 2} x2={TREE_X - (sX(0) + NODE_W) - 4} y2={NODE_H / 2}
          stroke={CLAUDE.SPARK} strokeWidth={2} markerEnd="url(#arr2)" />
      </svg>

      {/* Session B (bottom — reads) */}
      <div style={{
        position: 'absolute',
        left: sX(1), top: botY + height * 0.05,
        width: NODE_W, height: NODE_H, borderRadius: NODE_R,
        background: CLAUDE.CARD, border: `1.5px solid ${CLAUDE.BORDER}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: clamp(arrowBCIn, 0, 1),
        transform: `scale(${0.8 + 0.2 * clamp(arrowBCIn, 0, 1)})`,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: height * 0.016, fontWeight: 700, color: CLAUDE.INK }}>Session B</div>
        <div style={{ fontFamily: SANS, fontSize: height * 0.010, color: CLAUDE.INK_SOFT }}>reads ↙</div>
      </div>

      {/* Session C — recall */}
      <div style={{
        position: 'absolute',
        left: sX(1), top: botY + height * 0.22,
        width: NODE_W + width * 0.20,
        background: CLAUDE.CARD,
        border: `2px solid #4CAF50`,
        borderRadius: 8, padding: '8px 14px',
        opacity: clamp(recallIn, 0, 1),
        transform: `translateY(${(1 - clamp(recallIn, 0, 1)) * 10}px)`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: height * 0.012, color: '#4CAF50', lineHeight: 1.5 }}>
          ✓ "You prefer async/await over promises."
        </div>
      </div>

      {/* Citation */}
      <div style={{
        position: 'absolute', left: PAD_X, bottom: height * 0.12,
        fontFamily: SANS, fontSize: height * 0.011, color: CLAUDE.GHOST,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        Source: Claude Code Workshops (Anthropic) — agents-that-remember
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
