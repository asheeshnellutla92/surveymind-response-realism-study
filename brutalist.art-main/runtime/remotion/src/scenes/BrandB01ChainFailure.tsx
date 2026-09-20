import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandB01ChainFailure — pipeline-contract-resilience-audit B01.
 * Vertical dependency chain: Platform API → Your Product → Users.
 * Phase 1 (0–80): All boxes stable and green.
 * Phase 2 (80+): Platform changes terms → damage flows downhill →
 *   middle absorbs everything → bottom sees nothing useful.
 * Source: Branding and AI, Chapter 21 — Pipelines and Workflow (Nina Harris).
 */
export const brandB01ChainFailureSchema = z.object({
  sparkLine: z.string().default('The smallest, most dependent party absorbs everything.'),
});
export type BrandB01ChainFailureProps = z.infer<typeof brandB01ChainFailureSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const GREEN_STABLE = '#4A7C59';
const GREEN_BG = 'rgba(74,124,89,0.10)';
const GREY_CHANGED = '#8A8880';
const GREY_BG = 'rgba(138,136,128,0.10)';

export const BrandB01ChainFailure: React.FC<BrandB01ChainFailureProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const PAD_H = width * 0.06;
  const PAD_V = height * 0.08;
  const CENTER_X = width / 2;

  // Phase 1: stable boxes build in
  const topBoxIn = clamp(
    spring({ frame: frame - 0, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );
  const arrow1In = clamp(
    spring({ frame: frame - 10, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );
  const midBoxIn = clamp(
    spring({ frame: frame - 16, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );
  const arrow2In = clamp(
    spring({ frame: frame - 26, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );
  const botBoxIn = clamp(
    spring({ frame: frame - 32, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Phase 2: collapse at frame 80
  const COLLAPSE = 80;

  // Top box changes to grey "Terms changed"
  const topCollapse = clamp(
    spring({ frame: frame - COLLAPSE, fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Damage arrow flows down (frame 90–110)
  const damageArrowProgress = clamp(interpolate(frame, [COLLAPSE + 10, COLLAPSE + 30], [0, 1]), 0, 1);

  // Mid box turns terracotta "Absorbs everything" (frame 100)
  const midCollapse = clamp(
    spring({ frame: frame - (COLLAPSE + 20), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Bottom box shows "nothing useful" (frame 110)
  const botCollapse = clamp(
    spring({ frame: frame - (COLLAPSE + 30), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Asymmetry label (frame 120)
  const asymmetryIn = clamp(
    spring({ frame: frame - (COLLAPSE + 40), fps, config: { damping: 26, stiffness: 120, mass: 0.9 } }),
    0, 1
  );

  // Footer sparkLine
  const footerIn = clamp(interpolate(frame, [55, 75], [0, 1]), 0, 1);

  // Box dimensions — expanded to fill vertical safe area y≈170 to y≈880
  const BOX_W = width * 0.44;
  const BOX_H = 185;
  const GAP = 90;
  const BOX_X = CENTER_X - BOX_W / 2;
  // Three boxes + two gaps = 3*185 + 2*90 = 735px, starting at y=170
  const TOP_Y = height * 0.157; // ≈170
  const MID_Y = TOP_Y + BOX_H + GAP;
  const BOT_Y = MID_Y + BOX_H + GAP;
  const ARROW_MID_X = CENTER_X;

  // Title and sparkLine sizes
  const TITLE_SIZE = Math.round(height * 0.075);
  const SPARK_SIZE = Math.round(height * 0.034);

  // Box label sizes
  const SMALL_LABEL_SIZE = Math.round(13 * 1.8); // ≈23px, min 22
  const BOX_NAME_SIZE = Math.round(20 * 1.5); // 30px, min 36 → use 36
  const BOX_NAME_FINAL = Math.max(36, BOX_NAME_SIZE);

  // Colors that transition in phase 2
  const topBg = topCollapse > 0.5 ? GREY_BG : GREEN_BG;
  const topBorder = topCollapse > 0.5 ? GREY_CHANGED : GREEN_STABLE;
  const topLabel = topCollapse > 0.5 ? 'Terms changed' : 'External API';
  const topLabelColor = topCollapse > 0.5 ? GREY_CHANGED : GREEN_STABLE;

  const midBg = midCollapse > 0.5 ? `rgba(217,119,87,0.12)` : GREEN_BG;
  const midBorder = midCollapse > 0.5 ? CLAUDE.SPARK : GREEN_STABLE;
  const midLabel = midCollapse > 0.5 ? 'Absorbs everything' : 'Your Product';
  const midLabelColor = midCollapse > 0.5 ? CLAUDE.SPARK : GREEN_STABLE;

  const botLabel = botCollapse > 0.5 ? 'User sees: nothing useful' : 'Users';
  const botLabelColor = botCollapse > 0.5 ? CLAUDE.INK_SOFT : GREEN_STABLE;
  const botBg = botCollapse > 0.5 ? `rgba(107,107,104,0.07)` : GREEN_BG;
  const botBorder = botCollapse > 0.5 ? CLAUDE.BORDER : GREEN_STABLE;

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
        opacity: clamp(topBoxIn, 0, 1),
      }}>
        What breaks<span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      {/* TOP BOX — Platform API */}
      <div style={{
        position: 'absolute',
        left: BOX_X,
        top: TOP_Y,
        width: BOX_W,
        height: BOX_H,
        background: topBg,
        border: `4px solid ${topBorder}`,
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: topBoxIn,
        transform: `translateY(${(1 - topBoxIn) * -18}px)`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: SMALL_LABEL_SIZE,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: topLabelColor,
          marginBottom: 8,
        }}>
          {topLabel}
        </div>
        <div style={{
          fontFamily: SERIF,
          fontSize: BOX_NAME_FINAL,
          fontWeight: 700,
          color: CLAUDE.INK,
        }}>
          Platform API
        </div>
      </div>

      {/* ARROW 1: top → mid (normal) */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width, height, pointerEvents: 'none' }}
      >
        {/* Normal down arrow */}
        <line
          x1={ARROW_MID_X}
          y1={TOP_Y + BOX_H}
          x2={ARROW_MID_X}
          y2={MID_Y}
          stroke={CLAUDE.BORDER}
          strokeWidth={4}
          opacity={arrow1In * (1 - damageArrowProgress)}
          strokeDasharray="8 5"
        />
        <polygon
          points={`${ARROW_MID_X - 10},${MID_Y - 16} ${ARROW_MID_X + 10},${MID_Y - 16} ${ARROW_MID_X},${MID_Y}`}
          fill={CLAUDE.BORDER}
          opacity={arrow1In * (1 - damageArrowProgress)}
        />

        {/* Damage arrow — terracotta, animated progress */}
        {damageArrowProgress > 0 && (
          <>
            <line
              x1={ARROW_MID_X}
              y1={TOP_Y + BOX_H}
              x2={ARROW_MID_X}
              y2={TOP_Y + BOX_H + (MID_Y - TOP_Y - BOX_H) * damageArrowProgress}
              stroke={CLAUDE.SPARK}
              strokeWidth={5}
              opacity={damageArrowProgress}
            />
            {damageArrowProgress > 0.9 && (
              <polygon
                points={`${ARROW_MID_X - 10},${MID_Y - 16} ${ARROW_MID_X + 10},${MID_Y - 16} ${ARROW_MID_X},${MID_Y}`}
                fill={CLAUDE.SPARK}
                opacity={damageArrowProgress}
              />
            )}
            {/* "Damage flows downhill" label beside arrow */}
            <text
              x={ARROW_MID_X + 22}
              y={TOP_Y + BOX_H + (MID_Y - TOP_Y - BOX_H) * 0.5}
              fontFamily={SANS}
              fontSize={24}
              fill={CLAUDE.SPARK}
              opacity={damageArrowProgress}
              dominantBaseline="middle"
            >
              damage flows downhill
            </text>
          </>
        )}
      </svg>

      {/* MID BOX — Your Product */}
      <div style={{
        position: 'absolute',
        left: BOX_X,
        top: MID_Y,
        width: BOX_W,
        height: BOX_H,
        background: midBg,
        border: `4px solid ${midBorder}`,
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: midBoxIn,
        transform: `translateY(${(1 - midBoxIn) * -18}px)`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: SMALL_LABEL_SIZE,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: midLabelColor,
          marginBottom: 8,
        }}>
          {midLabel}
        </div>
        <div style={{
          fontFamily: SERIF,
          fontSize: BOX_NAME_FINAL,
          fontWeight: 700,
          color: CLAUDE.INK,
        }}>
          Your Product
        </div>
      </div>

      {/* ARROW 2: mid → bot */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width, height, pointerEvents: 'none', zIndex: 1 }}
      >
        <line
          x1={ARROW_MID_X}
          y1={MID_Y + BOX_H}
          x2={ARROW_MID_X}
          y2={BOT_Y}
          stroke={CLAUDE.BORDER}
          strokeWidth={4}
          opacity={arrow2In}
          strokeDasharray="8 5"
        />
        <polygon
          points={`${ARROW_MID_X - 10},${BOT_Y - 16} ${ARROW_MID_X + 10},${BOT_Y - 16} ${ARROW_MID_X},${BOT_Y}`}
          fill={CLAUDE.BORDER}
          opacity={arrow2In}
        />
      </svg>

      {/* BOT BOX — Users */}
      <div style={{
        position: 'absolute',
        left: BOX_X,
        top: BOT_Y,
        width: BOX_W,
        height: BOX_H,
        background: botBg,
        border: `4px solid ${botBorder}`,
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: botBoxIn,
        transform: `translateY(${(1 - botBoxIn) * -18}px)`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: SMALL_LABEL_SIZE,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: botLabelColor,
          marginBottom: 8,
        }}>
          {botLabel}
        </div>
        <div style={{
          fontFamily: SERIF,
          fontSize: BOX_NAME_FINAL,
          fontWeight: 700,
          color: CLAUDE.INK,
        }}>
          Users
        </div>
      </div>

      {/* "Asymmetry is structural" side label */}
      <div style={{
        position: 'absolute',
        right: PAD_H,
        top: MID_Y - 20,
        width: width * 0.26,
        opacity: asymmetryIn,
        transform: `translateX(${(1 - asymmetryIn) * 20}px)`,
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: 28,
          fontWeight: 700,
          color: CLAUDE.SPARK,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          Asymmetry is structural
        </div>
        <div style={{
          fontFamily: SERIF,
          fontSize: 28,
          color: CLAUDE.INK_SOFT,
          lineHeight: 1.45,
        }}>
          The top box is fine. The smallest, most dependent party absorbs everything.
        </div>
      </div>

      {/* Reddit / Apollo annotations */}
      <div style={{
        position: 'absolute',
        left: PAD_H,
        top: MID_Y + 20,
        opacity: midCollapse,
        transform: `translateX(${(1 - midCollapse) * 12}px)`,
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: 24,
          color: CLAUDE.SPARK,
          letterSpacing: '0.02em',
        }}>
          Apollo ← concentrated loss
        </div>
      </div>

      <div style={{
        position: 'absolute',
        left: PAD_H,
        top: TOP_Y + 30,
        opacity: topCollapse,
        transform: `translateX(${(1 - topCollapse) * 12}px)`,
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: 24,
          color: GREY_CHANGED,
          letterSpacing: '0.02em',
        }}>
          Reddit ← diffuse spread
        </div>
      </div>

      {/* Footer sparkLine */}
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
