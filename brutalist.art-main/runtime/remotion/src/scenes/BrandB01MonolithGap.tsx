import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01MonolithGap — madison-multi-agent-architecture-mapper B01.
 * Monolith mega-agent: 5 tasks flow IN, one output exits.
 * Phase 1 (0–80): Tasks flow in, output shows "Output ✓."
 * Phase 2 (80+): Output flips to ✗, question marks appear,
 *   token counter shows ∞, "No seam = no accountability" label fires.
 * Source: Branding and AI, Chapter 3 — The AI Toolchain (Nina Harris).
 */
export const brandB01MonolithGapSchema = z.object({
  sparkLine: z.string().default('No seam = no accountability.'),
});
export type BrandB01MonolithGapProps = z.infer<typeof brandB01MonolithGapSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const TASKS = ['Research', 'Draft', 'Personalize', 'Distribute', 'Measure'];

export const BrandB01MonolithGap: React.FC<BrandB01MonolithGapProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_H = width * 0.06;
  const PAD_V = height * 0.08;

  // Phase 1: tasks build in one by one
  const taskSprings = TASKS.map((_, i) =>
    clamp(spring({ frame: frame - (i * 10), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }), 0, 1)
  );

  // Monolith box
  const boxIn = clamp(
    spring({ frame: frame - 10, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Output arrow + label build in
  const outputIn = clamp(
    spring({ frame: frame - 40, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Phase 2 collapse at frame 80
  const COLLAPSE = 80;

  const outputCollapse = clamp(
    spring({ frame: frame - COLLAPSE, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Question marks appear per task (staggered from 85)
  const qMarkSprings = TASKS.map((_, i) =>
    clamp(spring({ frame: frame - (COLLAPSE + 5 + i * 8), fps, config: { damping: 26, stiffness: 140, mass: 0.8 } }), 0, 1)
  );

  // Token counter (frame 105)
  const tokenIn = clamp(
    spring({ frame: frame - (COLLAPSE + 25), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Seam label (frame 115)
  const seamIn = clamp(
    spring({ frame: frame - (COLLAPSE + 35), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // "Nothing distinct to sell" right label (frame 120)
  const sellIn = clamp(
    spring({ frame: frame - (COLLAPSE + 40), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  const footerIn = clamp(interpolate(frame, [55, 75], [0, 1]), 0, 1);

  // Title and sparkLine sizes
  const TITLE_SIZE = Math.round(height * 0.075);
  const SPARK_SIZE = Math.round(height * 0.034);

  // Layout constants — diagram spans y≈170 to y≈880
  const DIAGRAM_TOP = height * 0.157;    // ≈170
  const DIAGRAM_BOTTOM = height * 0.815; // ≈880

  const LEFT_AREA_W = width * 0.22;
  const BOX_X = width * 0.28;
  const BOX_W = Math.max(500, width * 0.26);
  const BOX_H = DIAGRAM_BOTTOM - DIAGRAM_TOP; // fills full vertical span
  const BOX_Y = DIAGRAM_TOP;
  const BOX_CENTER_Y = BOX_Y + BOX_H / 2;
  const RIGHT_AREA_X = BOX_X + BOX_W;

  // Task pill dimensions
  const TASK_H = 80;
  const TASK_W = LEFT_AREA_W - PAD_H - 8;
  // Distribute 5 tasks evenly across the diagram vertical span
  const TASK_TOTAL_SPACE = DIAGRAM_BOTTOM - DIAGRAM_TOP;
  const TASK_SPACING = TASK_TOTAL_SPACE / (TASKS.length - 1);
  const TASK_START_Y = DIAGRAM_TOP;

  // Output box
  const outCollapsing = outputCollapse > 0.5;
  const outBg = outCollapsing ? `rgba(217,119,87,0.12)` : `rgba(74,124,89,0.10)`;
  const outBorder = outCollapsing ? CLAUDE.SPARK : '#4A7C59';
  const outText = outCollapsing ? 'Output ✗' : 'Output ✓';
  const outTextColor = outCollapsing ? CLAUDE.SPARK : '#4A7C59';

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: height * 0.04,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SERIF,
        fontSize: TITLE_SIZE,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        opacity: clamp(boxIn, 0, 1),
      }}>
        What breaks<span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* LEFT: Task inputs */}
      {TASKS.map((task, i) => {
        const taskY = TASK_START_Y + i * TASK_SPACING - TASK_H / 2;
        const taskMidY = taskY + TASK_H / 2;
        const arrowEndX = BOX_X;
        const arrowStartX = LEFT_AREA_W;
        const taskOpacity = taskSprings[i];
        const qOpacity = qMarkSprings[i];

        return (
          <React.Fragment key={task}>
            {/* Task pill */}
            <div style={{
              position: 'absolute',
              left: PAD_H,
              top: taskY,
              width: TASK_W,
              height: TASK_H,
              background: CLAUDE.CARD,
              border: `2px solid ${CLAUDE.BORDER}`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: taskOpacity,
              transform: `translateX(${(1 - taskOpacity) * -20}px)`,
            }}>
              <span style={{
                fontFamily: SANS,
                fontSize: 28,
                fontWeight: 600,
                color: CLAUDE.INK,
              }}>{task}</span>
            </div>

            {/* Arrow from task → box (SVG inline) */}
            <svg
              style={{ position: 'absolute', left: 0, top: 0, width, height, pointerEvents: 'none' }}
            >
              <line
                x1={arrowStartX}
                y1={taskMidY}
                x2={arrowEndX - 2}
                y2={BOX_CENTER_Y}
                stroke={CLAUDE.BORDER}
                strokeWidth={4}
                opacity={taskOpacity * 0.7}
                strokeDasharray="6 4"
              />
              {/* Question mark badge on arrow in phase 2 */}
              {qOpacity > 0.1 && (
                <text
                  x={(arrowStartX + arrowEndX) / 2 - 8}
                  y={(taskMidY + BOX_CENTER_Y) / 2}
                  fontFamily={MONO}
                  fontSize={36}
                  fontWeight="700"
                  fill={CLAUDE.SPARK}
                  opacity={qOpacity}
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  ?
                </text>
              )}
            </svg>
          </React.Fragment>
        );
      })}

      {/* CENTER: Monolith box */}
      <div style={{
        position: 'absolute',
        left: BOX_X,
        top: BOX_Y,
        width: BOX_W,
        height: BOX_H,
        background: CLAUDE.CARD,
        border: `3px solid ${CLAUDE.BORDER}`,
        borderRadius: 18,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: boxIn,
        transform: `translateY(${(1 - boxIn) * -14}px)`,
        boxShadow: '0 4px 24px rgba(61,57,41,0.09)',
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: CLAUDE.INK_SOFT,
          marginBottom: 12,
        }}>
          AI Agent
        </div>
        <div style={{
          fontFamily: SERIF,
          fontSize: 40,
          fontWeight: 700,
          color: CLAUDE.INK,
          textAlign: 'center',
          lineHeight: 1.3,
        }}>
          Monolith
        </div>
        <div style={{
          fontFamily: SANS,
          fontSize: 28,
          color: CLAUDE.GHOST,
          marginTop: 10,
          textAlign: 'center',
        }}>
          One model call
        </div>

        {/* Token counter appears in phase 2 */}
        {tokenIn > 0.05 && (
          <div style={{
            marginTop: 24,
            padding: '10px 20px',
            background: `rgba(217,119,87,0.10)`,
            border: `2px solid ${CLAUDE.SPARK}`,
            borderRadius: 8,
            opacity: tokenIn,
            transform: `scale(${0.7 + 0.3 * tokenIn})`,
            display: 'flex',
            alignItems: 'center',
          }}>
            <span style={{
              fontFamily: MONO,
              fontSize: 36,
              fontWeight: 700,
              color: CLAUDE.SPARK,
            }}>∞</span>
            <span style={{
              fontFamily: SANS,
              fontSize: 28,
              color: CLAUDE.SPARK,
              marginLeft: 10,
            }}>tokens</span>
          </div>
        )}
      </div>

      {/* RIGHT: Output box */}
      <div style={{
        position: 'absolute',
        left: RIGHT_AREA_X + 32,
        top: BOX_CENTER_Y - 50,
        width: 180,
        height: 100,
        background: outBg,
        border: `3px solid ${outBorder}`,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: outputIn,
        transform: `translateX(${(1 - outputIn) * 20}px)`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: 28,
          fontWeight: 700,
          color: outTextColor,
          transition: 'color 0.3s',
        }}>
          {outText}
        </span>
      </div>

      {/* Output arrow (SVG) */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width, height, pointerEvents: 'none' }}>
        <line
          x1={BOX_X + BOX_W}
          y1={BOX_CENTER_Y}
          x2={RIGHT_AREA_X + 30}
          y2={BOX_CENTER_Y}
          stroke={outCollapsing ? CLAUDE.SPARK : CLAUDE.BORDER}
          strokeWidth={4}
          opacity={outputIn}
        />
        <polygon
          points={`${RIGHT_AREA_X + 20},${BOX_CENTER_Y - 10} ${RIGHT_AREA_X + 20},${BOX_CENTER_Y + 10} ${RIGHT_AREA_X + 32},${BOX_CENTER_Y}`}
          fill={outCollapsing ? CLAUDE.SPARK : CLAUDE.BORDER}
          opacity={outputIn}
        />
      </svg>

      {/* "Which part failed?" label under output */}
      {outputCollapse > 0.2 && (
        <div style={{
          position: 'absolute',
          left: RIGHT_AREA_X + 18,
          top: BOX_CENTER_Y + 62,
          width: 200,
          opacity: outputCollapse,
          transform: `translateY(${(1 - outputCollapse) * 8}px)`,
        }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 24,
            color: CLAUDE.INK_SOFT,
            fontStyle: 'italic',
            textAlign: 'center',
          }}>
            Which part failed?
          </div>
        </div>
      )}

      {/* "Nothing distinct to sell" right label */}
      {sellIn > 0.05 && (
        <div style={{
          position: 'absolute',
          right: PAD_H,
          top: BOX_Y,
          width: width * 0.18,
          opacity: sellIn,
          transform: `translateX(${(1 - sellIn) * 16}px)`,
        }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 28,
            fontWeight: 700,
            color: CLAUDE.INK_SOFT,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Brand problem
          </div>
          <div style={{
            fontFamily: SERIF,
            fontSize: 28,
            color: CLAUDE.INK,
            lineHeight: 1.5,
          }}>
            Nothing distinct to sell.
          </div>
        </div>
      )}

      {/* SEAM label — terracotta — appears at bottom of box boundary */}
      {seamIn > 0.05 && (
        <div style={{
          position: 'absolute',
          left: BOX_X,
          top: BOX_Y + BOX_H + 16,
          width: BOX_W,
          opacity: seamIn,
          transform: `translateY(${(1 - seamIn) * 8}px)`,
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: SANS,
            fontSize: 28,
            fontWeight: 700,
            color: CLAUDE.SPARK,
            letterSpacing: '0.04em',
          }}>
            No seam = no accountability.
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        left: PAD_H,
        right: PAD_H,
        fontFamily: SANS,
        fontSize: SPARK_SIZE,
        color: CLAUDE.GHOST,
        opacity: footerIn,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
