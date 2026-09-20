import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

export const a5aOutputFormatSchema = z.object({
  sparkLine: z.string().default('Can they act on it in ten seconds?'),
});
export type A5aOutputFormatProps = z.infer<typeof a5aOutputFormatSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;

const GREEN_BG = '#F0FAF4';
const GREEN_BD = '#52C47C';
const GREEN_TXT = '#1A6E3A';
const RED_BG = '#FFF5F5';
const RED_BD = '#FCBDBD';
const RED_TXT = '#9B2C1A';


const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const A5aOutputFormat: React.FC<A5aOutputFormatProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const badIn    = spring({ frame: frame - 12, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const vsIn     = spring({ frame: frame - 26, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const goodIn   = spring({ frame: frame - 30, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const testIn   = spring({ frame: frame - 58, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn  = spring({ frame: frame - 74, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

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
        INFO 7375 · ASSIGNMENT 5A · PART 1
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
        Human-Readable Output — The Anti-JSON Rule
      </div>

      {/* Two-column comparison */}
      <div style={{
        position: 'absolute',
        top: height * 0.28,
        left: width * 0.07,
        right: width * 0.07,
        display: 'flex',
        alignItems: 'stretch',
        gap: 24,
        height: height * 0.42,
      }}>
        {/* Wrong — JSON blob */}
        <div style={{
          flex: 1,
          background: RED_BG,
          border: `2.5px solid ${RED_BD}`,
          borderRadius: 18,
          padding: '22px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: clamp(badIn, 0, 1),
          transform: `translateX(${(1 - clamp(badIn, 0, 1)) * -20}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: RED_TXT, textTransform: 'uppercase' as const }}>
            ✗ Wrong — the rubric trap
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: CLAUDE.INK }}>
            Raw JSON / Dataframe
          </div>
          {/* JSON mock */}
          <div style={{
            background: '#1E1E1E',
            borderRadius: 8,
            padding: '12px 16px',
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#9CDCFE',
            lineHeight: 1.6,
            flex: 1,
          }}>
            <span style={{ color: '#569CD6' }}>{`{`}</span>{'\n'}
            {'  '}<span style={{ color: '#9CDCFE' }}>"result"</span>: <span style={{ color: '#CE9178' }}>"answer"</span>,{'\n'}
            {'  '}<span style={{ color: '#9CDCFE' }}>"score"</span>: <span style={{ color: '#B5CEA8' }}>0.87</span>,{'\n'}
            {'  '}<span style={{ color: '#9CDCFE' }}>"sources"</span>: <span style={{ color: '#569CD6' }}>[</span>...<span style={{ color: '#569CD6' }}>]</span>,{'\n'}
            {'  '}<span style={{ color: '#9CDCFE' }}>"tokens"</span>: <span style={{ color: '#B5CEA8' }}>412</span>{'\n'}
            <span style={{ color: '#569CD6' }}>{`}`}</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: RED_TXT }}>
            User reads keys and curly braces — doesn't know what to do.
          </div>
        </div>

        {/* VS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          flexShrink: 0,
          opacity: clamp(vsIn, 0, 1),
        }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: CLAUDE.INK_SOFT, fontStyle: 'italic' }}>
            vs
          </div>
        </div>

        {/* Right — formatted */}
        <div style={{
          flex: 1,
          background: GREEN_BG,
          border: `2.5px solid ${GREEN_BD}`,
          borderRadius: 18,
          padding: '22px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: clamp(goodIn, 0, 1),
          transform: `translateX(${(1 - clamp(goodIn, 0, 1)) * 20}px)`,
        }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: GREEN_TXT, textTransform: 'uppercase' as const }}>
            ✓ Right — human-readable
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: CLAUDE.INK }}>
            Markdown / Chart / File
          </div>
          {/* Readable mock */}
          <div style={{
            background: '#fff',
            border: `1px solid ${GREEN_BD}`,
            borderRadius: 8,
            padding: '12px 16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: CLAUDE.INK }}>Here's what I found:</div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: CLAUDE.INK, lineHeight: 1.4 }}>
              The top result is <strong>Option A</strong> — it scored highest on relevance (87%).
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: GREEN_TXT, marginTop: 4, fontWeight: 600 }}>
              → Download results as CSV ↓
            </div>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: GREEN_TXT }}>
            User can act on it in ten seconds — no explanation needed.
          </div>
        </div>
      </div>

      {/* Test question bar */}
      <div style={{
        position: 'absolute',
        bottom: height * 0.135,
        left: width * 0.07,
        right: width * 0.07,
        background: CLAUDE.PILL,
        border: `1.5px solid ${CLAUDE.BORDER}`,
        borderRadius: 10,
        padding: '11px 22px',
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 14,
        color: CLAUDE.INK_SOFT,
        opacity: clamp(testIn, 0, 1),
        transform: `translateY(${(1 - clamp(testIn, 0, 1)) * 8}px)`,
      }}>
        Test: show the output to someone who doesn't know the tool. Do they know what it means in ten seconds?
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute',
        left: width * 0.07,
        bottom: height * 0.065,
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
