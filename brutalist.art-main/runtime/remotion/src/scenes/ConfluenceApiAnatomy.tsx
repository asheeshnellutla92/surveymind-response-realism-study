import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * ConfluenceApiAnatomy — B01 — two API versions + three bundled scripts + body formats.
 */

export const confluenceApiAnatomySchema = z.object({
  sparkLine: z.string().default('v2 by default. v1 only for search, upload, labels.'),
});
export type ConfluenceApiAnatomyProps = z.infer<typeof confluenceApiAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const VERSIONS = [
  {
    ver: 'v2',
    path: '/wiki/api/v2/',
    label: 'DEFAULT',
    covers: 'Pages · spaces · blog posts · comments · attachments · labels — use first',
    highlight: false,
  },
  {
    ver: 'v1',
    path: '/wiki/rest/api/',
    label: 'CQL / UPLOAD / LABELS',
    covers: 'CQL search · attachment upload/download · label add — use only where v2 has no equivalent',
    highlight: true,
  },
];

const SCRIPTS = [
  {
    name: 'cql_search.sh',
    flags: '--space KEY · --limit N · --json',
    detail: 'Sends CQL to v1 search · follows _links.next · TSV or JSON output · exit 0/1',
  },
  {
    name: 'read_page.sh',
    flags: '--format view|storage · --text · --json',
    detail: 'Fetches page in requested body format · diagnostics to stderr · body to stdout',
  },
  {
    name: 'write_page.sh',
    flags: '--page ID · --space KEY --title T · --append · --message',
    detail: 'Resolves space key → ID · reads current version · bumps · retries once on 409',
  },
];

const FORMATS = [
  { name: 'storage', note: 'read+write · Storage XHTML · most predictable for writes' },
  { name: 'atlas_doc_format', note: 'read+write · ADF JSON · value field is a JSON string — parse twice', warn: true },
  { name: 'view', note: 'read only · rendered HTML · macros expanded' },
  { name: 'export_view', note: 'read only · rendered HTML · absolute URLs' },
];

export const ConfluenceApiAnatomy: React.FC<ConfluenceApiAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const verSprings = VERSIONS.map((_, i) =>
    spring({ frame: frame - 18 - i * 10, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const scriptSprings = SCRIPTS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const fmtSprings = FORMATS.map((_, i) =>
    spring({ frame: frame - 90 - i * 7, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.36;
  const RIGHT_W = W * 0.46;
  const VER_H = (H * 0.28) / 2 - 10;
  const SCRIPT_H = (H * 0.38) / 3 - 9;
  const FMT_H = (H * 0.15) / 4 - 6;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        CONFLUENCE API · TWO VERSIONS + THREE SCRIPTS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        v2 by default. Three scripts for the hot path.
      </div>

      {/* Versions column */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(verSprings[0], 0, 1),
        }}>
          API VERSIONS
        </div>
        {VERSIONS.map((ver, i) => {
          const op = clamp(verSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: ver.highlight ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
              border: `1px solid ${ver.highlight ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${ver.highlight ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '12px 14px', marginBottom: 12,
              height: VER_H, boxSizing: 'border-box' as const,
              boxShadow: ver.highlight ? '0 2px 10px rgba(217,119,87,0.10)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: ver.highlight ? CLAUDE.SPARK : '#4A7C59' }}>{ver.ver}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.INK_SOFT, background: 'rgba(61,57,41,0.07)', padding: '1px 7px', borderRadius: 4 }}>{ver.label}</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK, marginBottom: 4 }}>{ver.path}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{ver.covers}</div>
            </div>
          );
        })}
      </div>

      {/* Scripts column */}
      <div style={{ position: 'absolute', left: W * 0.46, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(scriptSprings[0], 0, 1),
        }}>
          BUNDLED SCRIPTS (HOT PATH)
        </div>
        {SCRIPTS.map((script, i) => {
          const op = clamp(scriptSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 10,
              height: SCRIPT_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#4A7C59', marginBottom: 3 }}>{script.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: CLAUDE.SPARK, marginBottom: 4 }}>{script.flags}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: CLAUDE.INK_SOFT, lineHeight: 1.4 }}>{script.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Body formats row */}
      <div style={{
        position: 'absolute',
        top: COL_TOP + (H * 0.28) + 14,
        left: W * 0.04, right: W * 0.04,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 8,
          opacity: clamp(fmtSprings[0], 0, 1),
        }}>
          BODY FORMATS
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {FORMATS.map((fmt, i) => {
            const op = clamp(fmtSprings[i], 0, 1);
            return (
              <div key={i} style={{
                flex: 1, background: fmt.warn ? 'rgba(217,119,87,0.04)' : '#FFFFFF',
                border: `1px solid ${fmt.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
                borderTop: `3px solid ${fmt.warn ? CLAUDE.SPARK : '#4A7C59'}`,
                borderRadius: 8, padding: '9px 12px',
                height: FMT_H, boxSizing: 'border-box' as const,
                opacity: op, transform: `translateY(${(1 - op) * 10}px)`,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: fmt.warn ? CLAUDE.SPARK : CLAUDE.INK, marginBottom: 4 }}>{fmt.name}</div>
                <div style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.35 }}>{fmt.note}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 24, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
