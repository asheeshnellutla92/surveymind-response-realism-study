import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, staticFile, Img } from 'remotion';
import { formBCardSchema } from './FormBCard';
import type { FormBCardProps, FormBItemProps } from './FormBCard';
import { CLAUDE, CLAUDE_FONT } from '../tokens/claude';

/**
 * FormBCard916 — portrait 9:16 (1080×1920) version of FormBCard.
 * Same schema. Items stack vertically in a title-safe inner zone.
 * Uses absolute inset positioning so content is guaranteed within the 90% safe zone.
 */

export const formBCard916Schema = formBCardSchema;
export type FormBCard916Props = FormBCardProps;

const SERIF       = CLAUDE_FONT.serif;
const DARK_BG     = '#2A2720';
const TITLE_START = 6;
const ICON_PX     = 44;

// Safe-zone inset: top 6%, bottom 15% (YouTube Shorts UI overlays ~14% at bottom).
const SAFE_V_TOP = 0.06;   // top inset fraction
const SAFE_V_BOT = 0.15;   // bottom inset fraction — keeps content above YouTube Shorts UI
const SAFE_H     = 0.07;   // left/right inset fraction

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const BoxPlaceholder: React.FC<{ label: string; fg: string }> = ({ label: _label, fg }) => (
  <div style={{
    width: ICON_PX, height: ICON_PX,
    border: `2px dashed ${fg}`, borderRadius: 6,
    opacity: 0.38,
  }} />
);

interface ItemPanelProps916 {
  item:     FormBItemProps;
  panelW:   number;
  panelH:   number;
  panelPad: number;
  labelSz:  number;
  subSz:    number;
  fg:       string;
  fgSub:    string;
  panelBg:  string;
  dark:     boolean;
}

const ItemPanel916: React.FC<ItemPanelProps916> = ({
  item, panelW, panelH, panelPad, labelSz, subSz, fg, fgSub, panelBg, dark,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = item.cueFrame ?? 0;
  const sp = spring({ frame: frame - cue, fps,
                      config: { damping: 30, stiffness: 170, mass: 0.7 } });
  const p  = frame >= cue ? clamp(sp, 0, 1) : 0;

  const iconFilter = dark
    ? 'brightness(0) invert(1) opacity(0.85)'
    : 'brightness(0) opacity(0.78)';

  return (
    <div style={{
      width: panelW, minHeight: panelH,
      background: panelBg, borderRadius: 14,
      display: 'flex', flexDirection: 'row',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: `${panelPad}px ${Math.round(panelPad * 1.2)}px`,
      gap: Math.round(panelPad * 0.9),
      opacity: p,
      transform: `translateY(${(1 - p) * 20}px)`,
      boxSizing: 'border-box',
    }}>
      {/* Icon */}
      <div style={{ width: ICON_PX, height: ICON_PX, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.icon === 'BOX' ? (
          <BoxPlaceholder label={item.label} fg={fg} />
        ) : (
          <Img
            src={staticFile(`form-b-icons/${item.icon}.svg`)}
            style={{ width: ICON_PX, height: ICON_PX, filter: iconFilter }}
          />
        )}
      </div>

      {/* Label + Sub stacked — flex:1/minWidth:0 prevents overflow past panel edge */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: SERIF, fontSize: labelSz, fontWeight: 700,
          color: fg, lineHeight: 1.15, letterSpacing: '-0.01em',
          wordBreak: 'break-word',
        }}>
          {item.label}
        </div>
        {item.sub ? (
          <div style={{
            fontFamily: SERIF, fontSize: subSz, fontWeight: 400,
            color: fgSub, lineHeight: 1.3,
            wordBreak: 'break-word',
          }}>
            {item.sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const FormBCard916: React.FC<FormBCard916Props> = ({ title, items, dark }) => {
  const frame  = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const bg      = dark ? DARK_BG     : CLAUDE.PAGE;
  const fg      = dark ? CLAUDE.PAGE : CLAUDE.INK;
  const fgSub   = dark ? '#A9A491'   : CLAUDE.INK_SOFT;
  const panelBg = dark ? '#2F2C24'   : CLAUDE.PILL;

  const safeW  = Math.round(width  * (1 - 2 * SAFE_H));
  const safeT  = Math.round(height * SAFE_V_TOP);
  const safeB  = Math.round(height * SAFE_V_BOT);
  const safeL  = Math.round(width  * SAFE_H);

  const panelW   = safeW;
  const panelPad = Math.round(height * 0.010);
  const panelH   = Math.round(height * 0.068);

  // 0.046 × height matches the 16:9 FormBCard fix — EB Garamond x-height clears the
  // §8.1 floor at 4K portrait (73px = 1.9% × 3840).
  const floorPx = Math.ceil(height * 0.032);
  const labelSz = Math.max(floorPx + 2, Math.round(height * 0.045));
  const subSz   = Math.max(floorPx,     Math.round(height * 0.045));
  const titleSz = Math.round(height * 0.046);

  const titleSp = spring({ frame: frame - TITLE_START, fps,
                           config: { damping: 30, stiffness: 170, mass: 0.7 } });
  const titleP  = frame >= TITLE_START ? clamp(titleSp, 0, 1) : 0;

  const rowGap  = Math.round(height * 0.010);
  const secGap  = Math.round(height * 0.012);

  return (
    <AbsoluteFill style={{ background: bg }}>
      {/* Absolutely positioned safe-zone container — top 6%, bottom 15% for Shorts UI */}
      <div style={{
        position: 'absolute',
        top: safeT, left: safeL, right: safeL, bottom: safeB,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: secGap,
      }}>
        {title ? (
          <div style={{
            fontFamily: SERIF, fontSize: titleSz, fontWeight: 700,
            color: fg, letterSpacing: '-0.02em', lineHeight: 1.1,
            textAlign: 'center',
            opacity: titleP,
            transform: `translateY(${(1 - titleP) * 10}px)`,
            maxWidth: panelW, wordBreak: 'break-word', width: '100%',
          }}>
            {title}
          </div>
        ) : null}

        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: rowGap, width: '100%',
        }}>
          {items.map((item, i) => (
            <ItemPanel916
              key={i}
              item={item}
              panelW={panelW}
              panelH={panelH}
              panelPad={panelPad}
              labelSz={labelSz}
              subSz={subSz}
              fg={fg}
              fgSub={fgSub}
              panelBg={panelBg}
              dark={dark}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
