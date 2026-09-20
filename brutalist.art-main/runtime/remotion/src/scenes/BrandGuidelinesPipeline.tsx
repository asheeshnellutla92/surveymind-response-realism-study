import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { z } from 'zod';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * BrandGuidelinesPipeline — B02 — three-node pipeline.
 * FILL-THE-CANVAS: nodes vertically centered at H*0.50, spanning full width.
 * Document IN → skill reads brand spec → branded document OUT.
 */

export const brandGuidelinesPipelineSchema = z.object({
  sparkLine: z.string().default('Read, then write.'),
});
export type BrandGuidelinesPipelineProps = z.infer<typeof brandGuidelinesPipelineSchema>;

const SERIF = CLAUDE_FONT.serif;
const SANS = CLAUDE_FONT.ui;
const MONO = CLAUDE_FONT.mono;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const remap = (v: number, a: number, b: number, c: number, d: number) =>
  c + ((clamp(v, a, b) - a) / (b - a)) * (d - c);
const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;


const RULES = [
  '→ Headings → Poppins (24pt+)',
  '→ Body → Lora',
  '→ Shapes → accent cycling',
  '→ Bg → Dark or Light brand tone',
];

export const BrandGuidelinesPipeline: React.FC<BrandGuidelinesPipelineProps> = ({ sparkLine }) => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();

  const p = clamp(frame / (fps * 5.5), 0, 1);

  const headerIn = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });
  const sparkIn = spring({ frame: frame - 90, fps, config: { damping: 28, stiffness: 120, mass: 0.9 } });

  // Node geometry — fill 1920×1080 canvas properly
  const NODE_W = 360;
  const SKILL_H = 380;
  const IO_H = 260;
  const GAP = (W - 3 * NODE_W) / 4; // even horizontal distribution

  const nodes = [
    { x: GAP, y: H * 0.50 - IO_H / 2, w: NODE_W, h: IO_H, label: 'Document', sub: '.pptx / .docx / .pdf', icon: '📄', accent: false, delay: 0 },
    { x: GAP * 2 + NODE_W, y: H * 0.50 - SKILL_H / 2, w: NODE_W, h: SKILL_H, label: 'brand-guidelines', sub: 'SKILL.md · spec as instruction', icon: '✳', accent: true, delay: 14 },
    { x: GAP * 3 + NODE_W * 2, y: H * 0.50 - IO_H / 2, w: NODE_W, h: IO_H, label: 'Branded Output', sub: 'Anthropic look · exact palette · correct fonts', icon: '📑', accent: false, delay: 28 },
  ];

  const nodeSprings = nodes.map((n) =>
    spring({ frame: frame - n.delay, fps, config: { damping: 30, stiffness: 110, mass: 0.95 } })
  );

  const arc1P = ease(remap(p, 0.20, 0.42, 0, 1));
  const arc2P = ease(remap(p, 0.42, 0.68, 0, 1));

  const ruleSprings = RULES.map((_, i) =>
    spring({ frame: frame - 30 - i * 12, fps, config: { damping: 28, stiffness: 120, mass: 0.85 } })
  );

  // Arc endpoints
  const n0 = nodes[0], n1 = nodes[1], n2 = nodes[2];
  const cy0 = n0.y + n0.h / 2, cy1 = n1.y + n1.h / 2, cy2 = n2.y + n2.h / 2;

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {/* Eyebrow */}
      <div style={{
        position: 'absolute', top: H * 0.065, left: 0, right: 0,
        textAlign: 'center', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        letterSpacing: 4, textTransform: 'uppercase' as const, color: CLAUDE.INK_SOFT,
        opacity: clamp(headerIn, 0, 1),
      }}>
        BRAND GUIDELINES · PIPELINE
      </div>

      <div style={{
        position: 'absolute', top: H * 0.12, left: 0, right: 0,
        textAlign: 'center', fontFamily: SERIF, fontSize: 52, fontWeight: 700,
        color: CLAUDE.INK, opacity: clamp(headerIn, 0, 1),
        transform: `translateY(${(1 - clamp(headerIn, 0, 1)) * 14}px)`,
      }}>
        Three nodes. No loops.
      </div>

      {/* SVG arcs */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {/* Arc 1: doc → skill */}
        <path
          d={`M ${n0.x + n0.w} ${cy0} C ${n0.x + n0.w + 120} ${cy0 - 80}, ${n1.x - 120} ${cy1 - 80}, ${n1.x} ${cy1}`}
          stroke={CLAUDE.SPARK} strokeWidth={5} fill="none" strokeLinecap="round"
          strokeDasharray={400} strokeDashoffset={400 * (1 - arc1P)}
        />
        {/* Arc 2: skill → output */}
        <path
          d={`M ${n1.x + n1.w} ${cy1} C ${n1.x + n1.w + 120} ${cy1 - 80}, ${n2.x - 120} ${cy2 - 80}, ${n2.x} ${cy2}`}
          stroke={CLAUDE.INK_SOFT} strokeWidth={5} fill="none" strokeLinecap="round"
          strokeDasharray={400} strokeDashoffset={400 * (1 - arc2P)}
        />
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const op = clamp(nodeSprings[i], 0, 1);
        return (
          <div key={i} style={{
            position: 'absolute', left: node.x, top: node.y, width: node.w, height: node.h,
            background: node.accent ? 'rgba(217,119,87,0.06)' : '#FFFFFF',
            border: `1px solid ${node.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderTop: `5px solid ${node.accent ? CLAUDE.SPARK : CLAUDE.BORDER}`,
            borderRadius: 16, padding: '22px 24px',
            boxShadow: node.accent
              ? '0 10px 36px rgba(217,119,87,0.20)'
              : '0 8px 24px rgba(61,57,41,0.10)',
            opacity: op, transform: `translateY(${(1 - op) * 22}px)`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 26, marginBottom: 8,
              color: node.accent ? CLAUDE.SPARK : CLAUDE.INK_SOFT }}>
              {node.icon}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: CLAUDE.INK, marginBottom: 8, lineHeight: 1.2 }}>
              {node.label}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 16, color: CLAUDE.INK_SOFT, lineHeight: 1.6 }}>
              {node.sub}
            </div>

            {/* Skill node: show rules */}
            {node.accent && (
              <div style={{ marginTop: 16 }}>
                {RULES.map((rule, ri) => {
                  const rop = clamp(ruleSprings[ri], 0, 1);
                  return (
                    <div key={ri} style={{
                      fontFamily: MONO, fontSize: 17,
                      color: ri === 0 ? CLAUDE.SPARK : CLAUDE.INK_SOFT,
                      marginBottom: 8, opacity: rop,
                      transform: `translateX(${(1 - rop) * 10}px)`,
                    }}>
                      {rule}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom insight bar */}
      <div style={{
        position: 'absolute',
        bottom: H * 0.10,
        left: W * 0.12, right: W * 0.12,
        padding: '18px 30px',
        background: '#FFFFFF', border: `1px solid ${CLAUDE.BORDER}`,
        borderRadius: 14, boxShadow: '0 4px 16px rgba(61,57,41,0.07)',
        opacity: clamp(remap(p, 0.65, 0.80, 0, 1), 0, 1),
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 22, color: CLAUDE.INK, fontStyle: 'italic', flex: 1 }}>
          "One instruction file, applied universally. The pipeline has no loops, no conditionals."
        </div>
        <div style={{ fontFamily: MONO, fontSize: 14, color: CLAUDE.INK_SOFT, flexShrink: 0 }}>
          Source: brand-guidelines SKILL.md
        </div>
      </div>

      {/* Spark line */}
      <div style={{
        position: 'absolute', left: W * 0.07, bottom: H * 0.04,
        display: 'flex', alignItems: 'center', gap: 12,
        opacity: clamp(sparkIn, 0, 1), transform: `translateY(${(1 - clamp(sparkIn, 0, 1)) * 10}px)`,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 28, fontStyle: 'italic', color: CLAUDE.INK }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};
