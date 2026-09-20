import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const linkedInThreeLanesSchema = z.object({
  sparkLine: z.string().default('One request, three jobs.'),
});
export type LinkedInThreeLanesProps = z.infer<typeof linkedInThreeLanesSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface LaneProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  opacity: number;
  translateY: number;
}

const Lane: React.FC<LaneProps> = ({ label, description, icon, opacity, translateY }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    opacity,
    transform: `translateY(${translateY}px)`,
    width: 360,
  }}>
    <div style={{
      background: CLAUDE.CARD,
      border: `2px solid ${CLAUDE.BORDER}`,
      borderRadius: 20,
      padding: '36px 32px',
      width: '100%',
      boxShadow: '0 4px 20px rgba(61,57,41,0.09)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: CLAUDE.PILL,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{
        fontFamily: SERIF,
        fontSize: 26,
        fontWeight: 700,
        color: CLAUDE.INK,
        textAlign: 'center',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: SANS,
        fontSize: 14,
        color: CLAUDE.INK_SOFT,
        textAlign: 'center',
        lineHeight: 1.5,
        maxWidth: 280,
      }}>
        {description}
      </div>
    </div>
  </div>
);

export const LinkedInThreeLanes: React.FC<LinkedInThreeLanesProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const lane1In  = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const lane2In  = spring({ frame: frame - 22, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const lane3In  = spring({ frame: frame - 34, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const labelIn  = spring({ frame: frame - 50, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn  = spring({ frame: frame - 62, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.08,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        "CONNECT CLAUDE TO LINKEDIN" — THREE DIFFERENT TASKS
      </div>

      <div style={{
        position: 'absolute',
        top: height * 0.135,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 40,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        One Request Hides Three Jobs
      </div>

      {/* Three lanes */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -44%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 40,
      }}>
        <Lane
          label="Publishing"
          description="Post to your profile or company page. Announce a course. Share an update."
          icon={
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M5 12l7-7 7 7" stroke={CLAUDE.INK_SOFT} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          opacity={clamp(lane1In, 0, 1)}
          translateY={(1 - clamp(lane1In, 0, 1)) * 20}
        />
        <Lane
          label="Analytics"
          description="Read follower growth, post impressions, engagement metrics on pages you administer."
          icon={
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <polyline points="3,17 8,12 13,14 21,6" stroke={CLAUDE.INK_SOFT} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          opacity={clamp(lane2In, 0, 1)}
          translateY={(1 - clamp(lane2In, 0, 1)) * 20}
        />
        <Lane
          label="Outreach"
          description="Connection requests, cold DMs, automated prospecting campaigns."
          icon={
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1" stroke={CLAUDE.INK_SOFT} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 3H7a2 2 0 00-2 2v6a2 2 0 002 2h2l4 4V11a2 2 0 00-2-2z" stroke={CLAUDE.INK_SOFT} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          opacity={clamp(lane3In, 0, 1)}
          translateY={(1 - clamp(lane3In, 0, 1)) * 20}
        />
      </div>

      {/* Not the same difficulty label */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.18,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 15,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(labelIn, 0, 1),
        transform: `translateY(${(1 - clamp(labelIn, 0, 1)) * 8}px)`,
      }}>
        Not the same difficulty. Not even the same legal category.
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.07,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
