import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * AsanaApiOps — B02 — ten core operations grid.
 */

export const asanaApiOpsSchema = z.object({
  sparkLine: z.string().default('Ten operations. One script. Pagination handled. gid required before every write.'),
});
export type AsanaApiOpsProps = z.infer<typeof asanaApiOpsSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const OPS = [
  { num: '01', label: 'list tasks', detail: 'asana_tasks.sh — pagination, TSV/JSONL', accent: CLAUDE.SPARK },
  { num: '02', label: 'get one task', detail: 'GET /tasks/{gid}?opt_fields=…', accent: CLAUDE.INK_SOFT },
  { num: '03', label: 'create task', detail: 'POST /tasks — workspace or projects required', accent: '#4A7C59' },
  { num: '04', label: 'update/complete', detail: 'PUT /tasks/{gid} — completed:true marks done', accent: '#4A7C59' },
  { num: '05', label: 'comment', detail: 'POST stories — filter comment_added to read', accent: CLAUDE.INK_SOFT },
  { num: '06', label: 'search', detail: 'PREMIUM ONLY · capped 100 · no stable pagination', accent: CLAUDE.SPARK },
  { num: '07', label: 'projects/sections', detail: 'GET /projects?workspace=… + /sections', accent: CLAUDE.INK_SOFT },
  { num: '08', label: 'move tasks', detail: 'addProject · removeProject · sections/addTask', accent: CLAUDE.INK_SOFT },
  { num: '09', label: 'gid lookup', detail: '/workspaces · /users · /users/me for caller', accent: '#4A7C59' },
  { num: '10', label: 'subtasks/tags/attachments', detail: '/subtasks · addTag · multipart upload', accent: CLAUDE.INK_SOFT },
];

export const AsanaApiOps: React.FC<AsanaApiOpsProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 130, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  const opSprings = OPS.map((_, i) =>
    spring({ frame: frame - 6 - i * 7, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  const COL_COUNT = 2;
  const ROWS = Math.ceil(OPS.length / COL_COUNT);
  const TOP = H * 0.27;
  const ITEM_H = (H * 0.62) / ROWS - 6;
  const COL_W = (W - W * 0.10) / COL_COUNT - 10;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        ASANA API · TEN CORE OPERATIONS
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 38, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        List. Create. Move. Comment. Search knows its limits.
      </div>

      {OPS.map((op, i) => {
        const col = i % COL_COUNT;
        const row = Math.floor(i / COL_COUNT);
        const op_ = clamp(opSprings[i], 0, 1);
        const isPremium = op.num === '06';
        return (
          <div key={i} style={{
            position: 'absolute',
            top: TOP + row * (ITEM_H + 6),
            left: W * 0.05 + col * (COL_W + 20),
            width: COL_W, height: ITEM_H,
            background: isPremium ? 'rgba(217,119,87,0.05)' : '#FFFFFF',
            border: `1px solid ${CLAUDE.BORDER}`,
            borderLeft: `4px solid ${op.accent}`,
            borderRadius: 8, display: 'flex', alignItems: 'center',
            padding: '0 10px', boxSizing: 'border-box' as const,
            boxShadow: '0 1px 4px rgba(61,57,41,0.04)',
            opacity: op_, transform: `translateY(${(1 - op_) * 8}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 12, color: op.accent, fontWeight: 700, minWidth: 26 }}>{op.num}</span>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 1 }}>
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: CLAUDE.INK }}>{op.label}</span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: CLAUDE.INK_SOFT, lineHeight: 1.2 }}>{op.detail}</span>
            </div>
          </div>
        );
      })}

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
