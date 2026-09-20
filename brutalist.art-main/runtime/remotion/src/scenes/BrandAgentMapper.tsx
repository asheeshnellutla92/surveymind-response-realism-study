import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandAgentMapper — C05 madison-multi-agent-architecture-mapper centerpiece.
 * Two columns:
 *   Left: four agent-meaning labels (A/B/C/D) with the product's classification checked.
 *   Right: five Madison roles (Intelligence/Content/Research/Experience/Performance) with present/absent dots.
 *   Bottom: failure-locatability bar (HIGH/MEDIUM/LOW) filling to the rated level.
 * Source: Branding and AI, Chapter 3 (Nina Harris).
 */
export const brandAgentMapperSchema = z.object({
  agentMeanings: z.array(z.object({
    label: z.string(),
    desc: z.string(),
    checked: z.boolean(),
  })).default([
    { label: 'A', desc: 'Function with prompt', checked: true },
    { label: 'B', desc: 'ReAct loop + tools', checked: true },
    { label: 'C', desc: 'Autonomous over horizon', checked: false },
    { label: 'D', desc: 'Specialized pipeline role', checked: false },
  ]),
  madisonRoles: z.array(z.object({
    role: z.string(),
    present: z.boolean(),
  })).default([
    { role: 'Intelligence', present: false },
    { role: 'Content', present: false },
    { role: 'Research', present: false },
    { role: 'Experience', present: false },
    { role: 'Performance', present: false },
  ]),
  failureLocatability: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('LOW'),
});
export type BrandAgentMapperProps = z.infer<typeof brandAgentMapperSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const locatabilityFill = (fl: string) => {
  if (fl === 'HIGH') return 0.9;
  if (fl === 'MEDIUM') return 0.5;
  return 0.15;
};
const locatabilityColor = (fl: string) => {
  if (fl === 'HIGH') return '#4A7C59';
  if (fl === 'MEDIUM') return CLAUDE.INK_SOFT;
  return CLAUDE.SPARK;
};

export const BrandAgentMapper: React.FC<BrandAgentMapperProps> = ({
  agentMeanings, madisonRoles, failureLocatability,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 26, stiffness: 130, mass: 0.9 } });
  const colIn = clamp(spring({ frame: frame - 8, fps, config: { damping: 26, stiffness: 130, mass: 0.8 } }), 0, 1);

  const amSprings = agentMeanings.map((_, i) =>
    clamp(spring({ frame: frame - (14 + i * 10), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );
  const mrSprings = madisonRoles.map((_, i) =>
    clamp(spring({ frame: frame - (14 + i * 10), fps, config: { damping: 28, stiffness: 140, mass: 0.8 } }), 0, 1)
  );
  const barProgress = clamp(spring({ frame: frame - 52, fps, config: { damping: 24, stiffness: 100, mass: 1.2 } }), 0, 1);
  const sourceIn = clamp(interpolate(frame, [70, 85], [0, 1]), 0, 1);

  const PAD = width * 0.07;
  const COL_W = (width - PAD * 2 - 32) / 2;
  const BAR_H = 44;
  const BAR_W = width - PAD * 2;
  const BAR_Y = height * 0.80;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE, padding: `${height * 0.06}px ${PAD}px 0` }}>
      {/* Title */}
      <div style={{
        fontFamily: SERIF,
        fontSize: 34,
        fontWeight: 700,
        color: CLAUDE.INK,
        letterSpacing: '-0.02em',
        marginBottom: 20,
        opacity: clamp(titleIn, 0, 1),
        transform: `translateY(${(1 - clamp(titleIn, 0, 1)) * 12}px)`,
      }}>
        Multi-Agent Architecture Map
        <span style={{ color: CLAUDE.SPARK }}>.</span>
      </div>

      <div style={{ display: 'flex', gap: 32, opacity: colIn }}>
        {/* Left column: Agent Meanings */}
        <div style={{ width: COL_W }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 700,
            color: CLAUDE.INK_SOFT,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Four Agent Meanings
          </div>
          {agentMeanings.map((am, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              marginBottom: 8,
              background: am.checked ? `rgba(217,119,87,0.07)` : CLAUDE.CARD,
              border: `1px solid ${am.checked ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderRadius: 10,
              opacity: amSprings[i],
              transform: `translateX(${(1 - amSprings[i]) * -16}px)`,
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: am.checked ? CLAUDE.SPARK : CLAUDE.FOOTER,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 700,
                color: am.checked ? CLAUDE.PAGE : CLAUDE.INK_SOFT,
                flexShrink: 0,
              }}>{am.label}</div>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: 15, color: CLAUDE.INK, fontWeight: 600 }}>{am.desc}</div>
                {am.checked && (
                  <div style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    color: CLAUDE.SPARK,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    marginTop: 2,
                  }}>✓ PRESENT</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right column: Madison Roles */}
        <div style={{ width: COL_W }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 700,
            color: CLAUDE.INK_SOFT,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Madison Five Roles
          </div>
          {madisonRoles.map((mr, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              marginBottom: 8,
              background: CLAUDE.CARD,
              border: `1px solid ${CLAUDE.BORDER}`,
              borderRadius: 10,
              opacity: mrSprings[i],
              transform: `translateX(${(1 - mrSprings[i]) * 16}px)`,
            }}>
              <div style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: mr.present ? '#4A7C59' : CLAUDE.BORDER,
                flexShrink: 0,
              }} />
              <div style={{
                fontFamily: SERIF,
                fontSize: 16,
                color: mr.present ? CLAUDE.INK : CLAUDE.INK_SOFT,
                fontWeight: mr.present ? 700 : 400,
              }}>{mr.role}</div>
              {!mr.present && (
                <div style={{
                  marginLeft: 'auto',
                  fontFamily: SANS,
                  fontSize: 11,
                  color: CLAUDE.SPARK,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}>ABSENT</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Failure-locatability bar */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.12,
        left: PAD,
        right: PAD,
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: 13,
          fontWeight: 700,
          color: CLAUDE.INK_SOFT,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: 10,
          opacity: barProgress,
        }}>
          Failure Locatability: <span style={{ color: locatabilityColor(failureLocatability) }}>{failureLocatability}</span>
        </div>
        <div style={{
          height: BAR_H,
          background: CLAUDE.BORDER,
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${locatabilityFill(failureLocatability) * 100 * barProgress}%`,
            background: locatabilityColor(failureLocatability),
            borderRadius: 8,
            transition: 'width 0.3s',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 16,
          }}>
            <span style={{
              fontFamily: SANS,
              fontSize: 15,
              fontWeight: 700,
              color: CLAUDE.PAGE,
              letterSpacing: '0.06em',
              opacity: barProgress > 0.3 ? 1 : 0,
            }}>{failureLocatability}</span>
          </div>
        </div>
      </div>

      {/* Source */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.04,
        right: PAD,
        fontFamily: SANS,
        fontSize: 12,
        color: CLAUDE.GHOST,
        opacity: sourceIn,
      }}>
        Source: Branding and AI (Nina Harris) · Ch. 3
      </div>
    </AbsoluteFill>
  );
};
