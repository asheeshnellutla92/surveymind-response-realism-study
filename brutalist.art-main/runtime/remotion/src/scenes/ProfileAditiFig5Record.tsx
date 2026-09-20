import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ProfileAditiFig5Record — "What 3.717 Understates"
 * The GPA sits center; the things held alongside it orbit in one by one.
 * Beat B05 of claude-liam-profile-aditi-deodhar.
 */

export const profileAditiFig5RecordSchema = z.object({
  sparkLine: z.string().default('The number understates the achievement.'),
});
export type ProfileAditiFig5RecordProps = z.infer<typeof profileAditiFig5RecordSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


const ORBIT_ITEMS = [
  { label: 'Full co-op', sub: 'Jutly Inc. (Cambridge)',   angle: -90,  r: 0.30 },
  { label: 'RTC Boston', sub: 'Hub Leader · 60+ members', angle: -18,  r: 0.32 },
  { label: 'Hackathons', sub: 'Multiple competitive',     angle: 54,   r: 0.30 },
  { label: 'AWS Certs', sub: 'Cloud + AI Practitioner',   angle: 126,  r: 0.32 },
  { label: 'Relocation', sub: 'Pune → Boston, no network',angle: 198,  r: 0.30 },
];

const toRad = (deg: number) => (deg * Math.PI) / 180;

export const ProfileAditiFig5Record: React.FC<ProfileAditiFig5RecordProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const S = Math.max(1, durationInFrames / 300);

  const PAD = width * 0.09;
  const cx = width / 2;
  const cy = height * 0.50;

  const idlePulse = 0.97 + 0.03 * Math.abs(Math.sin(frame * Math.PI / 90));
  const eyebrowIn = spring({ frame, fps, config: { damping: 30, stiffness: 100 } });
  const titleIn   = spring({ frame: frame - Math.round(8 * S),   fps, config: { damping: 28, stiffness: 90 } });
  const gpaIn     = spring({ frame: frame - Math.round(20 * S),  fps, config: { damping: 22, stiffness: 60, mass: 1.2 } });
  const labelIn   = spring({ frame: frame - Math.round(50 * S),  fps, config: { damping: 28, stiffness: 80 } });
  const underIn   = spring({ frame: frame - Math.round(80 * S),  fps, config: { damping: 28, stiffness: 80 } });
  const sparkIn   = spring({ frame: frame - Math.round(200 * S), fps, config: { damping: 28, stiffness: 100 } });

  const gpaScale = clamp(gpaIn, 0, 1);
  const ORBIT_R = height * 0.30;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, overflow: 'hidden' }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.08,
        fontFamily: SANS, fontSize: height * 0.013, fontWeight: 700,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT, opacity: clamp(eyebrowIn, 0, 1),
      }}>
        HUMANITARIANS AI · PROFILE SERIES
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', left: PAD, top: height * 0.13,
        fontFamily: SERIF, fontSize: height * 0.034, fontWeight: 600,
        color: CLAUDE.INK, letterSpacing: '-0.01em',
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 10}px)`,
      }}>
        What 3.717 Understates
      </div>

      {/* Orbit lines */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}>
        {ORBIT_ITEMS.map((item, i) => {
          const orbitIn = spring({ frame: frame - Math.round((80 + i * 18) * S), fps, config: { damping: 26, stiffness: 75 } });
          const ox = cx + ORBIT_R * Math.cos(toRad(item.angle));
          const oy = cy + ORBIT_R * Math.sin(toRad(item.angle));
          return (
            <line key={i}
              x1={cx} y1={cy}
              x2={cx + (ox - cx) * clamp(orbitIn, 0, 1)}
              y2={cy + (oy - cy) * clamp(orbitIn, 0, 1)}
              stroke={CLAUDE.BORDER}
              strokeWidth={1.5}
              strokeDasharray="6 6"
              strokeOpacity={0.6}
            />
          );
        })}
      </svg>

      {/* Orbit chips */}
      {ORBIT_ITEMS.map((item, i) => {
        const orbitIn = spring({ frame: frame - Math.round((88 + i * 18) * S), fps, config: { damping: 26, stiffness: 75 } });
        const ox = cx + ORBIT_R * Math.cos(toRad(item.angle));
        const oy = cy + ORBIT_R * Math.sin(toRad(item.angle));
        const chipW = 190;
        const chipH = 56;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: ox - chipW / 2,
            top: oy - chipH / 2,
            width: chipW, height: chipH,
            background: CLAUDE.CARD,
            border: `1.5px solid ${CLAUDE.BORDER}`,
            borderRadius: 10,
            padding: '8px 14px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(61,57,41,0.07)',
            opacity: clamp(orbitIn, 0, 1),
            transform: `scale(${clamp(orbitIn, 0, 1)})`,
          }}>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.014, fontWeight: 700,
              color: CLAUDE.INK,
            }}>{item.label}</div>
            <div style={{
              fontFamily: SANS, fontSize: height * 0.012,
              color: CLAUDE.INK_SOFT,
            }}>{item.sub}</div>
          </div>
        );
      })}

      {/* GPA CENTER */}
      <div style={{
        position: 'absolute',
        left: cx - 90, top: cy - 70,
        width: 180, height: 140,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: CLAUDE.CARD,
        border: `3px solid ${CLAUDE.SPARK}`,
        borderRadius: '50%',
        boxShadow: `0 8px 40px ${CLAUDE.SPARK}22`,
        transform: `scale(${gpaScale})`,
        opacity: gpaScale,
      }}>
        <div style={{
          fontFamily: SERIF, fontSize: height * 0.055, fontWeight: 700,
          color: CLAUDE.SPARK, lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          3.717
        </div>
        <div style={{
          fontFamily: SANS, fontSize: height * 0.011, fontWeight: 800,
          letterSpacing: 2, textTransform: 'uppercase' as const,
          color: CLAUDE.INK_SOFT, marginTop: 4,
        }}>
          GPA · MS · Dec 2025
        </div>
      </div>

      {/* "held alongside" label */}
      <div style={{
        position: 'absolute', left: cx - 130, top: cy + 80,
        width: 260, textAlign: 'center' as const,
        fontFamily: SERIF, fontSize: height * 0.016, fontStyle: 'italic',
        color: CLAUDE.INK_SOFT,
        opacity: clamp(underIn, 0, 1),
      }}>
        held alongside all of the above
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.07,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `scale(${idlePulse})`,
      }}>
        <div style={{ transform: `rotate(${frame * 0.15}deg)` }}>
        </div>
        <span style={{ fontFamily: SERIF, fontSize: height * 0.022, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
