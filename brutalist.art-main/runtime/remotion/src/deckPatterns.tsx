import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

/* Shared deterministic helpers — mirror deck_anim.js so HTML(D3) and MP4(Remotion) match. */
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const remap = (x: number, x0: number, x1: number, y0: number, y1: number) => {
  if (x1 === x0) return y0;
  return lerp(y0, y1, clamp((x - x0) / (x1 - x0), 0, 1));
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const seeded = (i: number) => {
  const x = Math.sin((i + 1) * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const BG = '#F2F0E9';
const INK = '#3D3929';
const ACCENT = '#D97757';
const MUTE = '#7A7265';
const WARN = '#A44A32';
const GOOD = '#3D3929';
const FONT = "'JetBrains Mono', ui-monospace, monospace";

/* Cubic bezier point + sampled arc-length (Remotion can't measure the DOM). */
type Pt = {x: number; y: number};
const cubicPoint = (P0: Pt, P1: Pt, P2: Pt, P3: Pt, t: number): Pt => {
  const mt = 1 - t;
  const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t;
  return {x: a * P0.x + b * P1.x + c * P2.x + d * P3.x, y: a * P0.y + b * P1.y + c * P2.y + d * P3.y};
};
const cubicLen = (P0: Pt, P1: Pt, P2: Pt, P3: Pt, samples = 40): number => {
  let len = 0;
  let prev = cubicPoint(P0, P1, P2, P3, 0);
  for (let i = 1; i <= samples; i++) {
    const pt = cubicPoint(P0, P1, P2, P3, i / samples);
    len += Math.hypot(pt.x - prev.x, pt.y - prev.y);
    prev = pt;
  }
  return len;
};

export type AttritionStep = {label: string; survival: number};
export type AttritionData = {
  title: string;
  slideMeta: string;
  total: number;
  startLabel: string;
  stages: AttritionStep[];
  /** narration retained for TTS only; never rendered */
  script?: string;
};

export const AttritionChain: React.FC<{data: AttritionData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H, durationInFrames} = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const total = data.total;
  const stages = data.stages;
  const cols = stages.length + 1;
  const padX = 70, padTop = 96, padBot = 150;
  const laneW = (W - padX * 2) / cols;
  const panelW = laneW * 0.78;
  const panelTop = padTop + 10;
  const panelH = H - panelTop - padBot;

  const counts = [total];
  for (const s of stages) counts.push(Math.round(counts[counts.length - 1] * s.survival));

  const colX = (c: number) => padX + laneW * c + laneW / 2;

  const gridPos = (i: number, count: number, c: number) => {
    const n = Math.max(1, count);
    const cc = Math.max(3, Math.ceil(Math.sqrt(n * (panelW / panelH))));
    const rr = Math.max(1, Math.ceil(n / cc));
    const ipx = 16, ipy = 18;
    const uw = panelW - ipx * 2, uh = panelH - ipy * 2;
    const gc = i % cc, gr = Math.floor(i / cc);
    const x = colX(c) - panelW / 2 + ipx + (cc === 1 ? uw / 2 : (gc / (cc - 1)) * uw);
    const y = panelTop + ipy + (rr === 1 ? uh / 2 : (gr / Math.max(1, rr - 1)) * uh);
    return {x, y};
  };
  const lossPos = (i: number, c: number) => ({
    x: colX(c) + (seeded(i) - 0.5) * panelW * 0.7,
    y: panelTop + panelH + 26 + seeded(i * 3) * 70,
  });

  // dot radius from densest column pitch
  const dotR = (() => {
    const n = Math.max(1, counts[0]);
    const cc = Math.max(3, Math.ceil(Math.sqrt(n * (panelW / panelH))));
    const rr = Math.max(1, Math.ceil(n / cc));
    const uw = panelW - 32, uh = panelH - 36;
    const pitch = Math.min(cc > 1 ? uw / (cc - 1) : uw, rr > 1 ? uh / (rr - 1) : uh);
    return clamp(pitch * 0.34, 1.3, 6);
  })();

  const intro = 0.10, outro = 0.06;
  const span = 1 - intro - outro;
  const each = span / Math.max(1, stages.length);
  const ranges = stages.map((_, k) => ({a: intro + k * each, b: intro + (k + 1) * each}));

  // counter
  let curCount = counts[0], stageIdx = 0;
  for (let k = 0; k < stages.length; k++) {
    const r = ranges[k];
    if (p >= r.b) {curCount = counts[k + 1]; stageIdx = k + 1;}
    else if (p >= r.a) {curCount = Math.round(lerp(counts[k], counts[k + 1], easeOutCubic((p - r.a) / (r.b - r.a)))); stageIdx = k; break;}
    else break;
  }
  const pct = (curCount / total) * 100;

  const dots: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    let x = 0, y = 0, op = i < counts[0] ? 1 : 0, placed = false;
    for (let k = 0; k < stages.length; k++) {
      const fromCount = counts[k], toCount = counts[k + 1];
      const r = ranges[k];
      const survives = i < toCount;
      const from = gridPos(i, fromCount, k);
      if (p < r.a) {x = from.x; y = from.y; op = i < fromCount ? 1 : 0; placed = true; break;}
      const t = easeOutCubic((p - r.a) / (r.b - r.a));
      if (p < r.b) {
        if (survives) {const to = gridPos(i, toCount, k + 1); x = lerp(from.x, to.x, t); y = lerp(from.y, to.y, t); op = 1;}
        else {const lp = lossPos(i, k); x = lerp(from.x, lp.x, t); y = lerp(from.y, lp.y, t); op = remap(t, 0, 0.85, 1, 0);}
        placed = true; break;
      }
      if (survives) {const set = gridPos(i, toCount, k + 1); x = set.x; y = set.y; op = 1; continue;}
      op = 0; placed = true; break;
    }
    if (!placed && op > 0) {const q = gridPos(i, counts[counts.length - 1], cols - 1); x = q.x; y = q.y;}
    if (op <= 0.01) continue;
    const isFinal = stageIdx >= stages.length && i < counts[counts.length - 1];
    dots.push(<circle key={i} cx={x} cy={y} r={dotR} fill={isFinal ? ACCENT : INK} opacity={op} />);
  }

  return (
    <AbsoluteFill style={{backgroundColor: BG, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 60, top: 34, fontSize: 13, letterSpacing: '.18em', color: MUTE, fontWeight: 600}}>
        {data.slideMeta}
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: cols}).map((_, c) => (
          <g key={c}>
            <rect x={colX(c) - panelW / 2} y={panelTop} width={panelW} height={panelH} rx={6}
              fill="none" stroke={INK} strokeWidth={c === 0 ? 2.5 : 1.5} strokeOpacity={0.28} />
            <text x={colX(c)} y={panelTop - 16} textAnchor="middle" fontFamily={FONT} fontSize={14} fontWeight={700}
              fill={c <= stageIdx ? INK : MUTE} fillOpacity={c <= stageIdx + 1 ? 1 : 0.35}>
              {(c === 0 ? data.startLabel : stages[c - 1].label).toUpperCase()}
            </text>
          </g>
        ))}
        {dots}
      </svg>
      <div style={{position: 'absolute', left: W / 2 - 150, top: 20, width: 300, height: 58, borderRadius: 6,
        background: '#fff', border: `2px solid ${ACCENT}`, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: 30, fontWeight: 800, color: INK, lineHeight: 1}}>{curCount} / {total}</div>
        <div style={{fontSize: 13, fontWeight: 700, color: ACCENT, marginTop: 3}}>
          {pct >= 1 ? `${pct.toFixed(0)}% remain` : `${pct.toFixed(1)}% remain`}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* Shared top-left slide-meta label. */
const SlideMeta: React.FC<{meta: string}> = ({meta}) => (
  <div style={{position: 'absolute', left: 60, top: 34, fontSize: 13, letterSpacing: '.18em', color: MUTE, fontWeight: 600}}>
    {meta}
  </div>
);

// ===========================================================================
// PATTERN 2 — SCALE COMPARISON  (port of D3 scaleComparison)
// ===========================================================================
export type ScaleItem = {label: string; value: number; value2?: number; hot?: boolean};
export type ScaleData = {
  slideMeta: string;
  axis: {min: number; max: number; unit: string};
  band: {from: number; to: number; label: string};
  items: ScaleItem[];
  axisLabel?: string;
  script?: string;
};

export const ScaleComparison: React.FC<{data: ScaleData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H, durationInFrames} = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const ax = data.axis, items = data.items;
  const x0 = 150, x1 = W - 110, yAxis = H - 150;
  const lg = (v: number) => Math.log10(v);
  const xOf = (v: number) => remap(lg(v), lg(ax.min), lg(ax.max), x0, x1);
  const u = ax.unit || 'nm';
  const trimNum = (v: number) => (Math.round(v * 100) / 100).toString();
  const fmtV = (v: number) => {
    if (u === 'nm') return v >= 1e6 ? trimNum(v / 1e6) + 'mm' : v >= 1000 ? trimNum(v / 1000) + 'µm' : trimNum(v) + 'nm';
    if (u === 'µm') return v >= 1000 ? trimNum(v / 1000) + 'mm' : trimNum(v) + 'µm';
    return trimNum(v) + ' ' + u;
  };

  // axis draw-on 0-0.18
  const axP = remap(p, 0, 0.18, 0, 1);
  const axLen = x1 - x0;

  // decade ticks
  const ticks: number[] = [];
  for (let e = Math.ceil(lg(ax.min)); e <= Math.floor(lg(ax.max)); e++) ticks.push(Math.pow(10, e));

  // band 0.18-0.34
  const bandP = remap(p, 0.18, 0.34, 0, 1);
  const bx0 = xOf(data.band.from), bx1 = xOf(data.band.to);

  const rows = items.length;
  const yOf = (i: number) => 130 + (i + 0.5) * ((yAxis - 150) / rows);

  return (
    <AbsoluteFill style={{backgroundColor: BG, fontFamily: FONT}}>
      <SlideMeta meta={data.slideMeta} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {/* axis */}
        <g>
          <line x1={x0} x2={x1} y1={yAxis} y2={yAxis} stroke={INK} strokeWidth={2}
            strokeDasharray={axLen} strokeDashoffset={axLen * (1 - axP)} />
          {ticks.map((d, k) => (
            <g key={k}>
              <line x1={xOf(d)} x2={xOf(d)} y1={yAxis} y2={yAxis + 8} stroke={MUTE} strokeWidth={1} />
              <text x={xOf(d)} y={yAxis + 26} textAnchor="middle" fontFamily={FONT} fontSize={11} fill={MUTE}>
                {fmtV(d)}
              </text>
            </g>
          ))}
          <text x={x1} y={yAxis + 46} textAnchor="end" fontFamily={FONT} fontSize={11} fill={MUTE} letterSpacing=".1em">
            {`${((data as any).axisLabel || 'size').toUpperCase()} (log scale, ${u})`}
          </text>
        </g>
        {/* band */}
        <g opacity={bandP}>
          <rect x={bx0} y={96} width={(bx1 - bx0) * easeOutCubic(bandP)} height={yAxis - 96} fill={ACCENT} opacity={0.1} />
          <text x={(bx0 + bx1) / 2} y={88} textAnchor="middle" fontFamily={FONT} fontSize={13} fontWeight={700} fill={ACCENT}>
            {data.band.label.toUpperCase()}
          </text>
        </g>
        {/* items */}
        {items.map((d, i) => {
          const st = 0.30 + (i / rows) * 0.5;
          const en = st + 0.28;
          const t = easeOutCubic(remap(p, st, en, 0, 1));
          const y = yOf(i);
          const tx = xOf(d.value);
          const tx2 = d.value2 ? xOf(d.value2) : tx;
          const curX = lerp(x0, tx, t);
          const curX2 = lerp(x0, tx2, t);
          const col = d.hot ? ACCENT : INK;
          return (
            <g key={i}>
              <line x1={curX} x2={curX} y1={y} y2={yAxis} stroke={col} strokeWidth={d.hot ? 2 : 1} strokeOpacity={0.30 * t} />
              {d.value2 ? (
                <rect x={curX} y={y - (d.hot ? 7 : 5)} width={Math.max(6, curX2 - curX)} height={d.hot ? 14 : 10} rx={3} fill={col} />
              ) : null}
              <circle cx={d.value2 ? (curX + curX2) / 2 : curX} cy={y} r={d.hot ? 8 : 6} fill={col} opacity={d.value2 ? 0 : 1} />
              <text x={x0 - 14} y={y} textAnchor="end" dy="0.35em" fontFamily={FONT} fontWeight={700}
                fontSize={d.hot ? 16 : 14} fill={col} opacity={t}>
                {d.label.toUpperCase()}
              </text>
              <text x={(d.value2 ? curX2 : curX) + 16} y={y} dy="0.35em" fontFamily={FONT} fontSize={11} fill={MUTE} opacity={t}>
                {d.value2 ? `${d.value}–${d.value2} ${ax.unit}` : `${d.value} ${ax.unit}`}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ===========================================================================
// PATTERN 3 — BINARY BRANCH  (port of D3 binaryBranch)
// ===========================================================================
export type Branch = {label: string; detail: string; fix: string; tone: string};
export type BranchData = {
  slideMeta: string;
  question: string;
  branches: Branch[];
  resolver: {label: string; detail: string};
  ghostText?: string;
  script?: string;
};

export const BinaryBranch: React.FC<{data: BranchData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H, durationInFrames} = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const cx = W / 2, qy = 150;
  const leftX = W * 0.26, rightX = W * 0.74, outY = 360;
  const toneCol = (t: string) => (t === 'warn' ? WARN : t === 'good' ? GOOD : INK);
  const branches = data.branches.map((b, i) => ({...b, x: i === 0 ? leftX : rightX}));

  const sy = qy + 30, ey = outY - 22, my = (sy + ey) / 2;
  const brP = remap(p, 0.14, 0.42, 0, 1);
  const rP = easeOutCubic(remap(p, 0.66, 0.92, 0, 1));
  const rbY = H - 150;
  const qOp = remap(p, 0, 0.12, 0, 1);
  const cardOp = remap(p, 0.36, 0.52, 0, 1);
  const ghostOp = remap(p, 0.52, 0.62, 0, 1) * (1 - remap(p, 0.72, 0.82, 0, 1));
  const rbOp = remap(p, 0.66, 0.76, 0, 1);

  return (
    <AbsoluteFill style={{backgroundColor: BG, fontFamily: FONT}}>
      <SlideMeta meta={data.slideMeta} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {/* connector paths (draw-on) */}
        {branches.map((b, i) => {
          const P0 = {x: cx, y: sy}, P1 = {x: cx, y: my}, P2 = {x: b.x, y: my}, P3 = {x: b.x, y: ey};
          const l = cubicLen(P0, P1, P2, P3);
          const d = `M ${cx} ${sy} C ${cx} ${my}, ${b.x} ${my}, ${b.x} ${ey}`;
          return (
            <path key={i} d={d} fill="none" stroke={toneCol(b.tone)} strokeWidth={2.5}
              strokeDasharray={l} strokeDashoffset={l * (1 - easeOutCubic(brP))} />
          );
        })}
        {/* question node */}
        <g opacity={qOp}>
          <rect x={cx - 300} y={qy - 34} width={600} height={60} rx={6} fill="#fff" stroke={INK} strokeWidth={2} />
          <text x={cx} y={qy} textAnchor="middle" dy="0.35em" fontFamily={FONT} fontSize={18} fontWeight={800} fill={INK}>
            {data.question}
          </text>
        </g>
        {/* outcome cards */}
        {branches.map((b, i) => (
          <g key={i} opacity={cardOp}>
            <rect x={b.x - 190} y={outY - 20} width={380} height={132} rx={6} fill="#fff" stroke={toneCol(b.tone)} strokeWidth={2 + 1.5 * rP} />
            <text x={b.x} y={outY + 6} textAnchor="middle" fontFamily={FONT} fontSize={18} fontWeight={800} fill={toneCol(b.tone)}>
              {b.label.toUpperCase()}
            </text>
            <text x={b.x} y={outY + 34} textAnchor="middle" fontFamily={FONT} fontSize={13} fill={MUTE}>{b.detail}</text>
            <text x={b.x} y={outY + 78} textAnchor="middle" fontFamily={FONT} fontSize={13} fontWeight={700} fill={INK}>{`→ ${b.fix}`}</text>
          </g>
        ))}
        {/* ghost */}
        {data.ghostText ? (
          <text x={cx} y={outY + 40} textAnchor="middle" fontFamily={FONT} fontSize={13} fill={MUTE} opacity={ghostOp}>
            {data.ghostText}
          </text>
        ) : null}
        {/* resolver beams */}
        <line x1={cx - 120} y1={rbY - 34} x2={branches[0].x} y2={outY + 112} stroke={ACCENT} strokeWidth={2} strokeDasharray="5 5" opacity={rP} />
        <line x1={cx + 120} y1={rbY - 34} x2={branches[1].x} y2={outY + 112} stroke={ACCENT} strokeWidth={2} strokeDasharray="5 5" opacity={rP} />
        {/* resolver box */}
        <g opacity={rbOp}>
          <rect x={cx - 260} y={rbY - 34} width={520} height={64} rx={6} fill={ACCENT} />
          <text x={cx} y={rbY - 8} textAnchor="middle" fontFamily={FONT} fontSize={17} fontWeight={800} fill="#fff">
            {data.resolver.label.toUpperCase()}
          </text>
          <text x={cx} y={rbY + 14} textAnchor="middle" fontFamily={FONT} fontSize={12} fill="rgba(255,255,255,.85)">
            {data.resolver.detail}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ===========================================================================
// PATTERN 4 — DIVERGENT FATES  (port of D3 divergentFates)
// ===========================================================================
export type FateTrack = {label: string; outcome: string; tone: string; path: 'up' | 'down'; notes: string[]};
export type FatesData = {
  slideMeta: string;
  startLabel: string;
  splitLabel: string;
  tracks: FateTrack[];
  script?: string;
};

export const DivergentFates: React.FC<{data: FatesData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H, durationInFrames} = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const x0 = 150, xSplit = W * 0.34, x1 = W - 300;
  const yMid = H * 0.46, yUp = H * 0.20, yDn = H * 0.72;
  const tracks = data.tracks;
  const toneCol = (t: string) => (t === 'warn' ? WARN : t === 'good' ? GOOD : INK);
  const yEnd = (t: FateTrack) => (t.path === 'up' ? yUp : yDn);
  const trackPath = (t: FateTrack) => {
    const ye = yEnd(t);
    return `M ${x0} ${yMid} L ${xSplit} ${yMid} C ${(xSplit + x1) / 2} ${yMid}, ${(xSplit + x1) / 2} ${ye}, ${x1} ${ye}`;
  };

  // combined arc-length: straight lead-in + cubic
  const travelT = easeOutCubic(remap(p, 0.15, 0.88, 0, 1));
  const trackGeom = (t: FateTrack) => {
    const ye = yEnd(t);
    const P0 = {x: xSplit, y: yMid}, P1 = {x: (xSplit + x1) / 2, y: yMid}, P2 = {x: (xSplit + x1) / 2, y: ye}, P3 = {x: x1, y: ye};
    const straightLen = xSplit - x0;
    const N = 60;
    const samples: {x: number; y: number; c: number}[] = [{x: xSplit, y: yMid, c: straightLen}];
    let acc = straightLen;
    let prev = {x: xSplit, y: yMid};
    for (let i = 1; i <= N; i++) {
      const pt = cubicPoint(P0, P1, P2, P3, i / N);
      acc += Math.hypot(pt.x - prev.x, pt.y - prev.y);
      samples.push({x: pt.x, y: pt.y, c: acc});
      prev = pt;
    }
    const total = acc;
    const pointAt = (f: number): Pt => {
      const target = total * f;
      if (target <= straightLen) return {x: x0 + target, y: yMid};
      for (let i = 1; i < samples.length; i++) {
        if (samples[i].c >= target) {
          const seg = (samples[i].c - samples[i - 1].c) === 0 ? 0 : (target - samples[i - 1].c) / (samples[i].c - samples[i - 1].c);
          return {x: lerp(samples[i - 1].x, samples[i].x, seg), y: lerp(samples[i - 1].y, samples[i].y, seg)};
        }
      }
      return {x: x1, y: ye};
    };
    return {total, pointAt};
  };

  const badgeOp = remap(p, 0.82, 0.94, 0, 1);

  return (
    <AbsoluteFill style={{backgroundColor: BG, fontFamily: FONT}}>
      <SlideMeta meta={data.slideMeta} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {/* split marker + labels */}
        <line x1={xSplit} x2={xSplit} y1={110} y2={H - 120} stroke={MUTE} strokeWidth={1} strokeDasharray="4 5" opacity={0.5} />
        <text x={x0} y={96} fontFamily={FONT} fontSize={13} fontWeight={700} fill={MUTE} letterSpacing=".08em">
          {data.startLabel.toUpperCase()}
        </text>
        <text x={xSplit + 12} y={96} fontFamily={FONT} fontSize={13} fontWeight={700} fill={ACCENT} letterSpacing=".08em">
          {`→ ${data.splitLabel.toUpperCase()}`}
        </text>
        {/* tracks */}
        {tracks.map((d, i) => {
          const geom = trackGeom(d);
          const l = geom.total;
          return (
            <path key={i} d={trackPath(d)} fill="none" stroke={toneCol(d.tone)} strokeWidth={3}
              strokeDasharray={l} strokeDashoffset={l * (1 - travelT)} />
          );
        })}
        {/* notes */}
        {tracks.map((d, i) => (
          <g key={i}>
            {d.notes.map((nn, k) => (
              <text key={k} x={xSplit + 30} y={(d.path === 'up' ? yUp - 10 : yDn + 26) + k * 18}
                fontFamily={FONT} fontSize={12} fill={MUTE} opacity={remap(p, 0.4 + k * 0.08, 0.5 + k * 0.08, 0, 1)}>
                {`· ${nn}`}
              </text>
            ))}
          </g>
        ))}
        {/* markers */}
        {tracks.map((d, i) => {
          const pt = trackGeom(d).pointAt(travelT);
          return <circle key={i} cx={pt.x} cy={pt.y} r={9} fill={toneCol(d.tone)} stroke="#fff" strokeWidth={2} />;
        })}
        {/* endpoint badges */}
        {tracks.map((d, i) => {
          const ye = yEnd(d);
          return (
            <g key={i} opacity={badgeOp}>
              <rect x={x1 + 8} y={ye - 26} width={268} height={52} rx={6} fill="#fff" stroke={toneCol(d.tone)} strokeWidth={2} />
              <text x={x1 + 22} y={ye - 6} fontFamily={FONT} fontSize={14} fontWeight={800} fill={toneCol(d.tone)}>{d.label}</text>
              <text x={x1 + 22} y={ye + 14} fontFamily={FONT} fontSize={12} fill={MUTE}>{`→ ${d.outcome}`}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ===========================================================================
// PATTERN 5 — THRESHOLD / RESOLVING POWER  (port of D3 threshold)
// ===========================================================================
export type ThreshMode = {label: string; sub: string; limit: number; resolves: boolean};
export type ThreshData = {
  slideMeta: string;
  subject: {label: string; size: number; unit: string};
  modes: ThreshMode[];
  axisLabel?: string;
  axis?: {min: number; max: number; unit?: string; log?: boolean};
  verdicts?: {yes: string; no: string};
  script?: string;
};

export const Threshold: React.FC<{data: ThreshData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H, durationInFrames} = useVideoConfig();
  const p = clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

  const sub = data.subject, modes = data.modes;
  const cx = W * 0.62, cy = H * 0.44;
  const axX = 150, axTop = 130, axBot = H - 160;
  const lg = (v: number) => Math.log10(v);
  const ax = data.axis || {min: 0.1, max: 10000, unit: sub.unit || 'nm', log: true};
  const useLog = ax.log !== false && ax.min > 0;
  const aUnit = ax.unit || sub.unit || '';
  const isSize = aUnit === 'nm' || aUnit === 'µm';
  const fmt = (v: number) => isSize
    ? (v >= 1000 ? `${Math.round(v / 10) / 100}µm` : `${Math.round(v)}nm`)
    : `${Math.round(v * 10) / 10}`;
  const yOf = useLog
    ? (v: number) => remap(lg(v), lg(ax.max), lg(ax.min), axTop, axBot)
    : (v: number) => remap(v, ax.max, ax.min, axTop, axBot);

  const m1 = modes[0], m2 = modes[1];
  let limitV: number, mode: ThreshMode;
  if (p < 0.5) {limitV = m1.limit; mode = m1;}
  else if (p < 0.7) {
    const sweepT = easeOutCubic(remap(p, 0.5, 0.7, 0, 1));
    limitV = useLog ? Math.pow(10, lerp(lg(m1.limit), lg(m2.limit), sweepT)) : lerp(m1.limit, m2.limit, sweepT);
    mode = sweepT < 0.5 ? m1 : m2;
  } else {limitV = m2.limit; mode = m2;}
  const ly = yOf(limitV);
  const resolved = limitV <= sub.size;
  const dAbove = useLog ? (lg(limitV) - lg(sub.size)) : (limitV - sub.size);
  const norm = useLog ? Math.max(lg(m1.limit) - lg(sub.size), 0.3) : Math.max(Math.abs(m1.limit - sub.size), 1e-6);
  const blurAmt = lerp(0.01, 12, clamp(dAbove / norm, 0, 1));

  const parts = Array.from({length: 7}).map((_, i) => ({
    dx: (seeded(i) - 0.5) * 70,
    dy: (seeded(i * 5) - 0.5) * 70,
    r: 8 + seeded(i * 9) * 8,
  }));

  const axisTicks: number[] = [];
  if (useLog) { for (let e = Math.ceil(lg(ax.min)); e <= Math.floor(lg(ax.max)); e++) axisTicks.push(Math.pow(10, e)); }
  else { const n = 5; for (let k = 0; k <= n; k++) axisTicks.push(ax.min + (ax.max - ax.min) * k / n); }

  const lineLabel = data.axisLabel || (isSize ? 'resolution limit' : 'limit');
  const vYes = data.verdicts?.yes || 'RESOLVED';
  const vNo = data.verdicts?.no || 'CANNOT RESOLVE';
  const verdictOp = p < 0.35 ? remap(p, 0.2, 0.35, 0, 1) : 1;

  return (
    <AbsoluteFill style={{backgroundColor: BG, fontFamily: FONT}}>
      <SlideMeta meta={data.slideMeta} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="thblur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurAmt} />
          </filter>
        </defs>
        {/* resolution axis */}
        <line x1={axX} x2={axX} y1={axTop} y2={axBot} stroke={INK} strokeWidth={2} />
        {axisTicks.map((v, k) => (
          <g key={k}>
            <line x1={axX - 6} x2={axX} y1={yOf(v)} y2={yOf(v)} stroke={MUTE} />
            <text x={axX - 12} y={yOf(v)} textAnchor="end" dy="0.35em" fontFamily={FONT} fontSize={11} fill={MUTE}>
              {fmt(v)}
            </text>
          </g>
        ))}
        <text x={axX} y={axTop - 14} textAnchor="middle" fontFamily={FONT} fontSize={11} fill={MUTE} letterSpacing=".08em">
          {(data.axisLabel || 'limit').toUpperCase()}
        </text>
        {/* subject size guide */}
        <line x1={axX} x2={W - 90} y1={yOf(sub.size)} y2={yOf(sub.size)} stroke={INK} strokeWidth={1} strokeDasharray="3 4" opacity={0.35} />
        <text x={W - 90} y={yOf(sub.size) - 8} textAnchor="end" fontFamily={FONT} fontSize={12} fill={INK} fontWeight={700}>
          {`${sub.label} · ${sub.size} ${sub.unit}`}
        </text>
        {/* subject blob (blurred vs sharp) */}
        <g filter="url(#thblur)">
          {parts.map((d, i) => (
            <circle key={i} cx={cx + d.dx} cy={cy + d.dy} r={d.r} fill={ACCENT} opacity={0.9} />
          ))}
        </g>
        {/* moving resolution-limit line */}
        <line x1={axX} x2={W - 60} y1={ly} y2={ly} stroke={ACCENT} strokeWidth={3} />
        <text x={axX + 14} y={ly - 8} fontFamily={FONT} fontSize={13} fontWeight={800} fill={ACCENT}>
          {`${lineLabel} · ${fmt(limitV)}`}
        </text>
        {/* mode label + verdict */}
        <text x={cx} y={H - 118} textAnchor="middle" fontFamily={FONT} fontSize={18} fontWeight={800} fill={resolved ? GOOD : INK}>
          {mode.label.toUpperCase()}
        </text>
        <text x={cx} y={H - 96} textAnchor="middle" fontFamily={FONT} fontSize={12} fill={MUTE}>{mode.sub}</text>
        <text x={cx} y={cy + 120} textAnchor="middle" fontFamily={FONT} fontSize={22} fontWeight={800}
          fill={resolved ? GOOD : WARN} opacity={verdictOp}>
          {resolved ? vYes : vNo}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
