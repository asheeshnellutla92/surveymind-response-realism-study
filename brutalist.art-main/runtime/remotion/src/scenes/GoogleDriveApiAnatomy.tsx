import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * GoogleDriveApiAnatomy — B01 — four fundamentals + bundled scripts.
 */

export const googleDriveApiAnatomySchema = z.object({
  sparkLine: z.string().default('Everything is a file. Workspace files have no bytes. fields= or nextPageToken silently vanishes.'),
});
export type GoogleDriveApiAnatomyProps = z.infer<typeof googleDriveApiAnatomySchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const FUNDAMENTALS = [
  { label: 'Everything is a file', detail: 'Folders = mimeType:folder. Hierarchy via parents[]. No path API — navigate by ID only.', warn: false },
  { label: 'Workspace files: no bytes', detail: 'Docs/Sheets/Slides: ?alt=media → 403 fileNotDownloadable. Must use export endpoint.', warn: true },
  { label: 'fields= must be explicit', detail: 'Default subset omits nextPageToken. Always pass fields= or pagination silently breaks.', warn: true },
  { label: 'Shared drive: invisible by default', detail: 'Files on shared drives return 404 without supportsAllDrives=true. Most common surprise 404.', warn: true },
];

const SCRIPTS = [
  { name: 'drive_search.sh', role: 'Search / list', detail: 'Builds q expression, requests nextPageToken, follows pagination, includes all shared drives.', warn: false },
  { name: 'drive_read.sh', role: 'Read content', detail: 'Branches on mimeType: export Workspace files, alt=media for binaries. Guards >10 MB without --out.', warn: false },
  { name: 'gdrive() helper', role: 'Auth alias', detail: 'One-liner bearer alias. Session-only — not a persisted script. Referenced throughout operations.', warn: true },
];

export const GoogleDriveApiAnatomy: React.FC<GoogleDriveApiAnatomyProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 120, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const fundSprings = FUNDAMENTALS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );
  const scriptSprings = SCRIPTS.map((_, i) =>
    spring({ frame: frame - 18 - i * 9, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_TOP = H * 0.27;
  const LEFT_W = W * 0.40;
  const RIGHT_W = W * 0.46;
  const FUND_H = (H * 0.57) / 4 - 11;
  const SCRIPT_H = (H * 0.57) / 3 - 11;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        GOOGLE DRIVE API · FOUR FUNDAMENTALS + BUNDLED SCRIPTS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Everything is a file. Workspace files have no bytes.
      </div>

      {/* Fundamentals */}
      <div style={{ position: 'absolute', left: W * 0.04, top: COL_TOP, width: LEFT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.SPARK, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(fundSprings[0], 0, 1),
        }}>
          KNOW BEFORE FIRST REQUEST
        </div>
        {FUNDAMENTALS.map((f, i) => {
          const op = clamp(fundSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: f.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${f.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${f.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: FUND_H, boxSizing: 'border-box' as const,
              boxShadow: f.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: f.warn ? CLAUDE.SPARK : '#4A7C59', marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{f.detail}</div>
            </div>
          );
        })}
      </div>

      {/* Scripts */}
      <div style={{ position: 'absolute', left: W * 0.50, top: COL_TOP, width: RIGHT_W }}>
        <div style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: CLAUDE.INK_SOFT, textTransform: 'uppercase' as const, marginBottom: 10,
          opacity: clamp(scriptSprings[0], 0, 1),
        }}>
          BUNDLED SCRIPTS + HELPERS
        </div>
        {SCRIPTS.map((s, i) => {
          const op = clamp(scriptSprings[i], 0, 1);
          return (
            <div key={i} style={{
              background: s.warn ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
              border: `1px solid ${s.warn ? CLAUDE.SPARK : CLAUDE.BORDER}`,
              borderLeft: `4px solid ${s.warn ? CLAUDE.SPARK : '#4A7C59'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 12,
              height: SCRIPT_H, boxSizing: 'border-box' as const,
              boxShadow: s.warn ? '0 2px 10px rgba(217,119,87,0.08)' : '0 2px 8px rgba(61,57,41,0.05)',
              opacity: op, transform: `translateX(${(1 - op) * 12}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: s.warn ? CLAUDE.SPARK : '#4A7C59' }}>{s.name}</div>
                <div style={{ fontFamily: SANS, fontSize: 9, color: CLAUDE.INK_SOFT, fontWeight: 600 }}>{s.role}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 10.5, color: CLAUDE.INK_SOFT, lineHeight: 1.45 }}>{s.detail}</div>
            </div>
          );
        })}
      </div>

      {/* spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: CLAUDE.INK,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        {sparkLine}
      </div>
    </AbsoluteFill>
  );
};
