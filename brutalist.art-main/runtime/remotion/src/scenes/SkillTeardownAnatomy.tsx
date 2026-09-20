import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * SkillTeardownAnatomy — generic folder-tree beat for any skill teardown.
 * Reveals files one-by-one as narration progresses.
 * Claude palette: cream PAGE, warm ink, terracotta accent on key node.
 * ILLUSTRATE LAW: concept illustration, NOT a UI beat.
 */

const fileEntrySchema = z.object({
  indent: z.number().default(0),
  icon: z.string().default('📄'),
  name: z.string(),
  size: z.string().optional(),
  accent: z.boolean().default(false),
  tag: z.string().optional(),
});

export const skillTeardownAnatomySchema = z.object({
  skillName: z.string().default('skill-name'),
  oldName: z.string().optional(),
  eyebrow: z.string().default('SKILL · ANATOMY'),
  title: z.string().default('A skill is a folder.'),
  files: z.array(fileEntrySchema).default([]),
  calloutText: z.string().optional(),
  calloutSub: z.string().optional(),
  sparkLine: z.string().default('The file is the instruction.'),
});
export type SkillTeardownAnatomyProps = z.infer<typeof skillTeardownAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


export const SkillTeardownAnatomy: React.FC<SkillTeardownAnatomyProps> = ({
  skillName, oldName, eyebrow, title, files, calloutText, calloutSub, sparkLine,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const DELAY_PER_FILE = 8;
  const fileIn = files.map((_, i) =>
    spring({ frame: frame - 20 - i * DELAY_PER_FILE, fps, config: { damping: 30, stiffness: 140, mass: 0.8 } })
  );
  const calloutIn = spring({ frame: frame - 20 - files.length * DELAY_PER_FILE - 4, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const accentIdx = files.findIndex(f => f.accent);

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        top: height * 0.07,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: 'uppercase' as const,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        {eyebrow}{oldName ? ` · was ${oldName}` : ''}
      </div>

      {/* Section title */}
      <div style={{
        position: 'absolute',
        top: height * 0.125,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 44,
        fontWeight: 700,
        color: CLAUDE.INK,
        opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 12}px)`,
      }}>
        {title}
      </div>

      {/* Folder tree */}
      <div style={{
        position: 'absolute',
        top: height * 0.24,
        left: width * 0.12,
        right: width * 0.08,
        bottom: height * 0.16,
      }}>
        {files.map((f, i) => {
          const op = clamp(fileIn[i], 0, 1);
          const tx = (1 - op) * -16;
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingLeft: f.indent * 32,
              marginBottom: 13,
              opacity: op,
              transform: `translateX(${tx}px)`,
            }}>
              <span style={{ fontFamily: MONO, fontSize: 18, color: f.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT }}>{f.icon}</span>
              <span style={{
                fontFamily: MONO,
                fontSize: 20,
                color: f.accent ? CLAUDE.SPARK : CLAUDE.INK,
                fontWeight: f.accent ? 700 : 400,
              }}>{f.name}</span>
              {f.size && (
                <span style={{ fontFamily: MONO, fontSize: 15, color: CLAUDE.GHOST, marginLeft: 12 }}>{f.size}</span>
              )}
              {f.tag && (
                <div style={{
                  background: CLAUDE.SPARK, borderRadius: 6, padding: '2px 8px', marginLeft: 8,
                  fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#fff',
                  letterSpacing: 1, textTransform: 'uppercase' as const,
                }}>{f.tag}</div>
              )}
            </div>
          );
        })}

        {/* Callout box */}
        {(calloutText || calloutSub) && (
          <div style={{
            marginTop: 20,
            padding: '16px 24px',
            background: 'rgba(217,119,87,0.07)',
            border: `1px solid ${CLAUDE.SPARK}`,
            borderLeft: `4px solid ${CLAUDE.SPARK}`,
            borderRadius: 12,
            opacity: clamp(calloutIn, 0, 1),
            transform: `translateY(${(1 - clamp(calloutIn, 0, 1)) * 10}px)`,
          }}>
            {calloutText && (
              <div style={{ fontFamily: SANS, fontSize: 20, color: CLAUDE.INK, lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{ __html: calloutText }} />
            )}
            {calloutSub && (
              <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.INK_SOFT, marginTop: 6 }}>{calloutSub}</div>
            )}
          </div>
        )}
      </div>

      {/* Spark line — bottom left */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.06,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
        transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 8}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>{sparkLine}</span>
      </div>

    </AbsoluteFill>
  );
};
