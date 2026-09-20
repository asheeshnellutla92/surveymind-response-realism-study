import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * GoogleDriveApiDesign — B02 — pagination trap + Workspace export + shared drive 404.
 */

export const googleDriveApiDesignSchema = z.object({
  sparkLine: z.string().default('fields= silently drops nextPageToken. Workspace files: export path, not alt=media. Shared drive 404 = missing param.'),
});
export type GoogleDriveApiDesignProps = z.infer<typeof googleDriveApiDesignSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const TRAPS = [
  { label: 'fields= omits nextPageToken', detail: 'Default response subset is minimal. 100-file result with no nextPageToken = silent truncation, not completion.', warn: true },
  { label: 'fileNotDownloadable 403', detail: 'alt=media on Docs/Sheets/Slides. Fix: use export endpoint. drive_read.sh branches on mimeType automatically.', warn: true },
  { label: 'Shared drive 404', detail: 'supportsAllDrives=true missing. For list/search: also need corpora=allDrives + includeItemsFromAllDrives=true.', warn: true },
  { label: 'exportSizeLimitExceeded', detail: 'Export > 10 MB. Named in error table but no fallback in SKILL.md — deferred to references/api.md.', warn: true },
];

const PATTERNS = [
  { label: 'Pagination contract', how: 'Always include', detail: 'Request nextPageToken in fields=. When present in response, pass as pageToken in next call. Stop when absent.', warn: false },
  { label: 'Workspace export flow', how: 'MimeType branch', detail: 'Check mimeType first. Google Apps types → /export?mimeType=. Binary types → ?alt=media. drive_read.sh does this.', warn: false },
  { label: 'pageSize cap', how: 'Clamps to 100', detail: 'files.list pageSize max is 100. Larger values are silently clamped. Always use pagination rather than larger pageSize.', warn: false },
];

export const GoogleDriveApiDesign: React.FC<GoogleDriveApiDesignProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const trapSprings = TRAPS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const patternSprings = PATTERNS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const TRAP_H = (H * 0.57) / 4 - 11;
  const PATTERN_H = (H * 0.57) / 3 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        GOOGLE DRIVE API · TRAPS + PATTERNS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 42, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        100 results and stopped? That's not done.
      </div>

      {/* Traps (left) */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(trapSprings[0], 0, 1),
        }}>
          ERROR TRAPS
        </div>
        {TRAPS.map((t, i) => {
          const op = clamp(trapSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: 'rgba(217,119,87,0.05)',
              border: `1px solid ${CLAUDE.SPARK}`,
              borderLeft: `4px solid ${CLAUDE.SPARK}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: TRAP_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 10px rgba(217,119,87,0.08)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: CLAUDE.SPARK, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{t.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Patterns (right) */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: '#4A7C59', textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(patternSprings[0], 0, 1),
        }}>
          CORRECT PATTERNS
        </div>
        {PATTERNS.map((p, i) => {
          const op = clamp(patternSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: '#FFFFFF',
              border: `1px solid ${CLAUDE.BORDER}`,
              borderLeft: `4px solid #4A7C59`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: PATTERN_H, boxSizing: 'border-box' as const,
              boxShadow: '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#4A7C59' }}>{p.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, color: CLAUDE.INK_SOFT, fontWeight: 600 }}>{p.how}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{p.detail}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 20, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
