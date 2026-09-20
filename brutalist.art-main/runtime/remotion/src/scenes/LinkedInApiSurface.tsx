import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const linkedInApiSurfaceSchema = z.object({
  sparkLine: z.string().default('Self-serve, audit, or wall.'),
});
export type LinkedInApiSurfaceProps = z.infer<typeof linkedInApiSurfaceSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const GREEN_BG  = '#F0FAF4';
const GREEN_BD  = '#52C47C';
const GREEN_TXT = '#1A6E3A';
const AUDIT_BG  = '#FFFBF0';
const AUDIT_BD  = '#D4A017';
const AUDIT_TXT = '#7A5000';
const WALL_BG   = '#FEF2F0';
const WALL_BD   = CLAUDE.SPARK;
const WALL_TXT  = '#9B2C1A';


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface RowProps {
  task: string;
  product: string;
  access: string;
  accessLabel: string;
  bgColor: string;
  borderColor: string;
  tagColor: string;
  opacity: number;
  ty: number;
}

const TableRow: React.FC<RowProps> = ({ task, product, access, accessLabel, bgColor, borderColor, tagColor, opacity, ty }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    opacity,
    transform: `translateY(${ty}px)`,
    background: bgColor,
    border: `2px solid ${borderColor}`,
    borderRadius: 12,
    overflow: 'hidden',
  }}>
    {/* Access badge */}
    <div style={{
      width: 148,
      flexShrink: 0,
      background: borderColor,
      padding: '16px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 2,
        textTransform: 'uppercase' as const,
        color: '#fff',
        textAlign: 'center' as const,
      }}>
        {accessLabel}
      </span>
    </div>
    {/* Task */}
    <div style={{
      flex: 1,
      padding: '16px 20px',
      borderRight: `1px solid ${borderColor}40`,
    }}>
      <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: CLAUDE.INK }}>
        {task}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK_SOFT, marginTop: 3 }}>
        {product}
      </div>
    </div>
    {/* Access detail */}
    <div style={{
      width: 260,
      flexShrink: 0,
      padding: '16px 20px',
    }}>
      <div style={{ fontFamily: SANS, fontSize: 13, color: tagColor, lineHeight: 1.45 }}>
        {access}
      </div>
    </div>
  </div>
);

export const LinkedInApiSurface: React.FC<LinkedInApiSurfaceProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const row1In   = spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const row2In   = spring({ frame: frame - 24, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const row3In   = spring({ frame: frame - 36, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const row4In   = spring({ frame: frame - 48, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn  = spring({ frame: frame - 70, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.07,
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
        LINKEDIN API · REAL ACCESS LEVELS
      </div>

      <div style={{
        position: 'absolute',
        top: height * 0.125,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 40,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        The Official Surface, Precisely
      </div>

      {/* Table */}
      <div style={{
        position: 'absolute',
        top: height * 0.26,
        left: width * 0.06,
        right: width * 0.06,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        <TableRow
          task="Personal profile posting"
          product="Share on LinkedIn"
          access="Self-serve, instant, no approval. Compliant by default."
          accessLabel="SELF-SERVE"
          bgColor={GREEN_BG}
          borderColor={GREEN_BD}
          tagColor={GREEN_TXT}
          opacity={clamp(row1In, 0, 1)}
          ty={(1 - clamp(row1In, 0, 1)) * 18}
        />
        <TableRow
          task="Company page posting & analytics"
          product="Community Management API"
          access="Real audit: verified domain, business email, corporate registration, OAuth screen recording."
          accessLabel="AUDIT"
          bgColor={AUDIT_BG}
          borderColor={AUDIT_BD}
          tagColor={AUDIT_TXT}
          opacity={clamp(row2In, 0, 1)}
          ty={(1 - clamp(row2In, 0, 1)) * 18}
        />
        <TableRow
          task="Generic member profile reading"
          product="(no product name)"
          access="Not accepting new requests. Closed door."
          accessLabel="CLOSED"
          bgColor={WALL_BG}
          borderColor={CLAUDE.GHOST}
          tagColor={CLAUDE.INK_SOFT}
          opacity={clamp(row3In, 0, 1)}
          ty={(1 - clamp(row3In, 0, 1)) * 18}
        />
        <TableRow
          task="Automated outreach · connection requests · DMs"
          product="(no scope exists)"
          access="No API scope at any price. Not gated — nonexistent."
          accessLabel="NO PATH"
          bgColor={WALL_BG}
          borderColor={WALL_BD}
          tagColor={WALL_TXT}
          opacity={clamp(row4In, 0, 1)}
          ty={(1 - clamp(row4In, 0, 1)) * 18}
        />
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
