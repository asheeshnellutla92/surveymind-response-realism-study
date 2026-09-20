import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * PluginSettingsPatterns — B02 — three usage patterns + parsing techniques.
 */

export const pluginSettingsPatternsSchema = z.object({
  sparkLine: z.string().default('Toggle with enabled. Coordinate with body. Parse with sed — carefully.'),
});
export type PluginSettingsPatternsProps = z.infer<typeof pluginSettingsPatternsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PATTERNS = [
  {
    label: 'HOOK TOGGLE',
    detail: 'enabled: true/false toggles hook activation — change without editing hooks.json (still needs restart)',
    color: '#4A7C59',
  },
  {
    label: 'AGENT STATE',
    detail: 'agent_name, task_number, coordinator_session in frontmatter; task description as markdown body prompt',
    color: CLAUDE.SPARK,
  },
  {
    label: 'CONFIG-DRIVEN',
    detail: 'validation_level field branches hook behavior: strict / standard / lenient via case statement',
    color: CLAUDE.INK_SOFT,
  },
];

export const PluginSettingsPatterns: React.FC<PluginSettingsPatternsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const parseIn = spring({ frame: frame - 10, fps, config: { damping: 28, stiffness: 100, mass: 1.0 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const patternSprings = PATTERNS.map((_, i) =>
    spring({ frame: frame - 70 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const PARSE_TOP = H * 0.27;
  const PARSE_H = H * 0.24;
  const PATTERN_TOP = PARSE_TOP + PARSE_H + 24;
  const PATTERN_H = (H * 0.38) / 3 - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* header */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        PLUGIN SETTINGS · PATTERNS + PARSING
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Three patterns. One parser. Know its limits.
      </div>

      {/* Parsing callout */}
      <div style={{
        position: 'absolute', top: PARSE_TOP, left: W * 0.05, right: W * 0.05,
        background: 'rgba(217,119,87,0.05)', border: `1.5px solid ${CLAUDE.SPARK}`,
        borderRadius: 14, padding: '16px 24px',
        opacity: clamp(parseIn, 0, 1),
        transform: `translateY(${(1 - clamp(parseIn, 0, 1)) * 12}px)`,
        height: PARSE_H, boxSizing: 'border-box' as const,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: CLAUDE.SPARK, marginBottom: 10 }}>PARSING TECHNIQUES</div>
        <div style={{ display: 'flex', gap: 20, height: 'calc(100% - 28px)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: '#4A7C59', marginBottom: 6 }}>FRONTMATTER (sed)</div>
            <div style={{ background: 'rgba(61,57,41,0.04)', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.7 }}>
                {'FRONTMATTER=$(sed -n \'/^---$/,/^---$/{'}<br />
                {'  /^---$/d; p; }\' "$FILE")'}<br />
                {'VALUE=$(echo "$FRONTMATTER" \\'}<br />
                {'  | grep \'^field:\' \\'}<br />
                {'  | sed \'s/field: *//)'}
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.INK_SOFT, marginBottom: 6 }}>BODY (awk)</div>
            <div style={{ background: 'rgba(61,57,41,0.04)', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.7 }}>
                {'BODY=$(awk \'/^---$/{i++;'}<br />
                {'  next} i>=2\' "$FILE")'}<br />
                <br />
                {'# Everything after second ---'}
              </div>
            </div>
          </div>
          <div style={{ flex: '0 0 auto', width: 180 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 6 }}>CAVEAT</div>
            <div style={{ background: 'rgba(217,119,87,0.08)', border: `1px solid ${CLAUDE.SPARK}`, borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK, lineHeight: 1.5 }}>
                sed breaks silently on multiline values, quoted colons, or indented blocks — no error output
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern label */}
      <div style={{
        position: 'absolute', top: PATTERN_TOP - 18, left: W * 0.05,
        fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const,
        opacity: clamp(patternSprings[0], 0, 1),
      }}>
        USAGE PATTERNS
      </div>

      {PATTERNS.map((p, i) => {
        const op = clamp(patternSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute',
            top: PATTERN_TOP + i * (PATTERN_H + 10),
            left: W * 0.05, right: W * 0.05,
            height: PATTERN_H, boxSizing: 'border-box' as const,
            background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `5px solid ${p.color}`,
            borderRadius: 9, padding: '10px 16px',
            boxShadow: '0 2px 6px rgba(61,57,41,0.04)',
            opacity: op, transform: `translateX(${(1 - op) * 14}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: p.color, marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT }}>{p.detail}</div>
          </div>
        );
      })}

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 26, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
