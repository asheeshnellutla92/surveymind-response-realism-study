import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ThemeFactoryAnatomy — B01 — ink-line folder tree of the theme-factory skill
 * with real byte counts. Reveals lines one by one as narration progresses.
 * Claude palette: cream PAGE, warm ink, terracotta accent on the themes/ node.
 * ILLUSTRATE LAW: concept illustration, NOT a UI beat.
 */

export const themeFactoryAnatomySchema = z.object({
  sparkLine: z.string().default('A factory in 8 KB.'),
});
export type ThemeFactoryAnatomyProps = z.infer<typeof themeFactoryAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));


interface FileRowProps {
  indent: number;
  icon: string;
  name: string;
  size?: string;
  accent?: boolean;
  opacity: number;
  translateY: number;
}

const FileRow: React.FC<FileRowProps> = ({ indent, icon, name, size, accent, opacity, translateY }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingLeft: indent * 32,
    marginBottom: 14,
    opacity,
    transform: `translateX(${(1 - opacity) * -16}px) translateY(${translateY}px)`,
  }}>
    {/* connector lines for tree */}
    {Array.from({ length: indent }, (_, i) => (
      <div key={i} style={{
        position: 'absolute',
        left: 280 + i * 32,
        width: 2,
        height: 14,
        background: CLAUDE.BORDER,
        marginTop: 0,
      }} />
    ))}
    <span style={{
      fontFamily: MONO,
      fontSize: 18,
      color: accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
    }}>{icon}</span>
    <span style={{
      fontFamily: MONO,
      fontSize: 20,
      color: accent ? CLAUDE.SPARK : CLAUDE.INK,
      fontWeight: accent ? 700 : 400,
    }}>{name}</span>
    {size && (
      <span style={{
        fontFamily: MONO,
        fontSize: 15,
        color: CLAUDE.GHOST,
        marginLeft: 12,
      }}>{size}</span>
    )}
    {accent && (
      <div style={{
        background: CLAUDE.SPARK,
        borderRadius: 6,
        padding: '2px 8px',
        marginLeft: 8,
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 700,
        color: '#fff',
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
      }}>10 themes</div>
    )}
  </div>
);

// Tree entries with timing offsets (frame delays for staggered reveal)
const ENTRIES = [
  { indent: 0, icon: '📁', name: 'theme-factory/', size: undefined, accent: false, delay: 0 },
  { indent: 1, icon: '📄', name: 'SKILL.md', size: '3,124 B', accent: false, delay: 8 },
  { indent: 1, icon: '📁', name: 'themes/', size: '10 files · 513–544 B each', accent: true, delay: 16 },
  { indent: 2, icon: '📄', name: 'golden-hour.md', size: '513 B', accent: false, delay: 24 },
  { indent: 2, icon: '📄', name: 'midnight-galaxy.md', size: '522 B', accent: false, delay: 28 },
  { indent: 2, icon: '📄', name: 'ocean-depths.md', size: '521 B', accent: false, delay: 32 },
  { indent: 2, icon: '··· 7 more files', name: '', size: undefined, accent: false, delay: 36 },
  { indent: 1, icon: '📄', name: 'theme-showcase.pdf', size: 'visual reference', accent: false, delay: 44 },
  { indent: 1, icon: '📄', name: 'LICENSE.txt', size: undefined, accent: false, delay: 48 },
];

export const ThemeFactoryAnatomy: React.FC<ThemeFactoryAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 55, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const entrySprings = ENTRIES.map((e) =>
    spring({ frame: frame - e.delay, fps, config: { damping: 30, stiffness: 140, mass: 0.8 } })
  );

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
        THEME FACTORY · ANTHROPIC SKILL · ANATOMY
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
        A skill is a folder.
      </div>

      {/* Folder tree — centered, filling the safe area */}
      <div style={{
        position: 'absolute',
        top: height * 0.24,
        left: width * 0.12,
        right: width * 0.08,
        bottom: height * 0.16,
      }}>
        {ENTRIES.map((e, i) => {
          const op = clamp(entrySprings[i], 0, 1);
          const ty = (1 - op) * 12;
          if (e.indent === 2 && e.name === '') {
            // Ellipsis row for "7 more files"
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingLeft: e.indent * 32,
                marginBottom: 14,
                opacity: op,
                transform: `translateY(${ty}px)`,
              }}>
                <span style={{ fontFamily: MONO, fontSize: 18, color: CLAUDE.GHOST }}>{e.icon}</span>
              </div>
            );
          }
          return (
            <FileRow
              key={i}
              indent={e.indent}
              icon={e.icon}
              name={e.name}
              size={e.size}
              accent={e.accent}
              opacity={op}
              translateY={ty}
            />
          );
        })}

        {/* Callout box for themes/ accent */}
        <div style={{
          marginTop: 28,
          padding: '18px 28px',
          background: 'rgba(217,119,87,0.07)',
          border: `1px solid ${CLAUDE.SPARK}`,
          borderLeft: `4px solid ${CLAUDE.SPARK}`,
          borderRadius: 12,
          opacity: clamp(entrySprings[2], 0, 1),
          transform: `translateY(${(1 - clamp(entrySprings[2], 0, 1)) * 10}px)`,
        }}>
          <div style={{
            fontFamily: SANS,
            fontSize: 20,
            color: CLAUDE.INK,
            lineHeight: 1.5,
          }}>
            Each theme file: <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>4 hex colors</span> · <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>2 fonts</span> · <span style={{ fontFamily: MONO, color: CLAUDE.SPARK }}>1 line of intent</span>
          </div>
          <div style={{
            fontFamily: SANS,
            fontSize: 15,
            color: CLAUDE.INK_SOFT,
            marginTop: 6,
          }}>
            A complete design identity in a text message.
          </div>
        </div>
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
        <span style={{ fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>

    </AbsoluteFill>
  );
};
