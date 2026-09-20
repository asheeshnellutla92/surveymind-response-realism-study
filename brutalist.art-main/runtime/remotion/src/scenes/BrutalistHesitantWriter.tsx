import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, random} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {CLAUDE, CLAUDE_FONT} from '../tokens/claude';

/**
 * BrutalistHesitantWriter — a deterministic performance of someone writing
 * badly: typos caught and fixed, pauses mid-word, and words typed then
 * reconsidered and replaced.
 *
 * Source: brik/base44 auto-converted canvas component `typing-animation-mnzzraks`.
 * Author unknown — see SOURCES.md. Credit resolves before 4K/YouTube.
 *
 * REWRITE, not a port. The source is a wall-clock rAF canvas toy; this is a
 * pure function of frame. Every action's duration and jitter is drawn ONCE at
 * build time from a seeded stream, so the film is identical at any refresh
 * rate, on any machine, forever. See SPEC.md §"Source defect audit".
 *
 * ACCENT LAW: terracotta marks text that is ABOUT TO BE DELETED — the typo,
 * the word being reconsidered. It is the moment of hesitation, which is the
 * component's whole subject. Nothing else is ever terracotta.
 *
 * Canvas: reads useVideoConfig(); all geometry scales off a 1920x1080 design
 * reference, so it composes at 16:9, 9:16, 1:1 and 4:3.
 */

// ── Schema (defaults live here, once — no `||`, no `??` in the body) ─────────

export const brutalistHesitantWriterSchema = z.object({
  /** The text to write. \n starts a new line. */
  text: z.string().default(
    'The quick brown fox\njumps over the lazy dog\nWait, was it a dog?\nOr a cat? Whatever.\nIt was fast.',
  ),
  /** House type face. The source loaded a remote .otf; that does not ship. */
  face: z.enum(['serif', 'mono']).default('serif'),
  /** Type size in design units at the 1920x1080 reference canvas. */
  fontSize: z.number().min(35).default(88),
  /** Leading as a multiple of fontSize. */
  lineSpacing: z.number().default(1.25),
  align: z.enum(['left', 'center', 'right']).default('center'),
  /** Resting text colour. */
  ink: zColor().default(CLAUDE.INK),
  /** THE accent — text that is about to be deleted. Nothing else. */
  accent: zColor().default(CLAUDE.SPARK),
  /** Ground. Wires the source's dead `__sys_bg` prop. */
  bg: zColor().default(CLAUDE.PAGE),
  /** Comma-separated words that get typed, reconsidered, and replaced. */
  triggerWords: z.string().default('fox, dog, cat'),
  /** Comma-separated replacements, positionally matched to triggerWords. */
  replacementWords: z.string().default('wolf, bear, lion'),
  /** Percent chance per character of a typo that gets caught and fixed. */
  mistakeRate: z.number().min(0).max(100).default(10),
  /** Percent chance per character of a pause mid-word. */
  hesitateWithin: z.number().min(0).max(100).default(3),
  /** Percent chance per word of a longer pause after it. */
  hesitateBetween: z.number().min(0).max(100).default(20),
  /** Milliseconds per character at an even pace. */
  charMs: z.number().min(1).default(50),
  /** Percent variation applied to each keystroke's duration. Higher = less even. */
  jitter: z.number().min(0).max(100).default(30),
  /** Same seed = identical performance, forever. */
  seed: z.string().default('hesitant-writer'),
  /** Block offset from centre, in design units. */
  xOffset: z.number().default(0),
  yOffset: z.number().default(0),
  showCaret: z.boolean().default(true),
  /**
   * Optional corner label — e.g. "DRAMATIZATION". Displayed top-right in a
   * small pill. Empty string = no label. Prop-gated per the mascot rule so
   * existing renders are unchanged.
   */
  banner: z.string().default(''),
});

export type BrutalistHesitantWriterProps = z.infer<typeof brutalistHesitantWriterSchema>;

// ── Timeline (built once, pure, seeded — never touched per frame) ────────────

type Step = {
  /** Full visible text at this step. */
  text: string;
  /** How many trailing characters are doomed (about to be deleted). */
  doomed: number;
  /** Frames this step is held for. */
  hold: number;
};

type Act =
  | {t: 'char'; ch: string; doomed: boolean}
  | {t: 'pause'; ms: number}
  | {t: 'back'};

const PUNCT = /[.,!?;:'"()\[\]{}\-—…]/;

/** Split a token into leading punctuation, core word, trailing punctuation. */
function splitToken(token: string): [string, string, string] {
  let a = 0;
  let b = token.length;
  while (a < b && PUNCT.test(token[a])) a++;
  while (b > a && PUNCT.test(token[b - 1])) b--;
  return [token.slice(0, a), token.slice(a, b), token.slice(b)];
}

function buildActs(p: BrutalistHesitantWriterProps): Act[] {
  const acts: Act[] = [];
  const triggers = p.triggerWords.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const replacements = p.replacementWords.split(',').map((s) => s.trim()).filter(Boolean);
  const mistake = p.mistakeRate / 100;
  const within = p.hesitateWithin / 100;
  const between = p.hesitateBetween / 100;

  // One seeded draw per decision site — never a shared mutable stream.
  let n = 0;
  const roll = () => random(`${p.seed}-roll-${n++}`);
  const pick = (lo: number, hi: number) => lo + random(`${p.seed}-span-${n++}`) * (hi - lo);

  const tokens = p.text.split(/(\s+)/);

  for (const token of tokens) {
    if (token.trim() === '') {
      for (const ch of token) {
        acts.push({t: 'char', ch, doomed: false});
        if (ch === '\n') acts.push({t: 'pause', ms: 400});
      }
      continue;
    }

    const [lead, core, tail] = splitToken(token);
    const ti = triggers.indexOf(core.toLowerCase());

    if (ti !== -1 && replacements[ti]) {
      // Type the core, stop, delete ONLY the core, type the replacement,
      // THEN the punctuation. The source deleted token.length characters,
      // which ate the trailing punctuation ("cat?" -> "lion"). Fixed here.
      for (const ch of lead) acts.push({t: 'char', ch, doomed: false});
      for (const ch of core) acts.push({t: 'char', ch, doomed: true});
      acts.push({t: 'pause', ms: 1000 + pick(0, 500)});
      for (let i = 0; i < core.length; i++) acts.push({t: 'back'});
      for (const ch of replacements[ti]) acts.push({t: 'char', ch, doomed: false});
      for (const ch of tail) acts.push({t: 'char', ch, doomed: false});
      acts.push({t: 'pause', ms: 300});
      continue;
    }

    for (const ch of token) {
      if (roll() < mistake) {
        const wrong = String.fromCharCode(97 + Math.floor(random(`${p.seed}-typo-${n++}`) * 26));
        acts.push({t: 'char', ch: wrong, doomed: true});
        acts.push({t: 'pause', ms: 150 + pick(0, 200)});
        acts.push({t: 'back'});
      }
      acts.push({t: 'char', ch, doomed: false});
      if (PUNCT.test(ch)) {
        acts.push({t: 'pause', ms: 400 + pick(0, 400)});
      } else if (roll() < within) {
        acts.push({t: 'pause', ms: 200 + pick(0, 400)});
      }
    }
    if (roll() < between) acts.push({t: 'pause', ms: 500 + pick(0, 800)});
  }
  return acts;
}

/**
 * Simulate the action list into per-step visible text plus a frame budget.
 * Keystroke jitter is drawn HERE, once per action — not per rendered frame,
 * which is what made the source resolution- and refresh-rate-dependent.
 */
export function buildTimeline(p: BrutalistHesitantWriterProps, fps: number): Step[] {
  const acts = buildActs(p);
  const steps: Step[] = [];
  const amount = p.jitter / 100;
  let text = '';
  let doomed = 0;

  acts.forEach((a, i) => {
    let ms: number;
    if (a.t === 'pause') {
      ms = a.ms;
    } else if (a.t === 'back') {
      ms = p.charMs * 0.5;
    } else {
      const j = (random(`${p.seed}-jit-${i}`) * 2 - 1) * p.charMs * amount;
      ms = Math.max(1, p.charMs + j);
    }

    if (a.t === 'char') {
      text += a.ch;
      doomed = a.doomed ? doomed + 1 : 0;
    } else if (a.t === 'back') {
      text = text.slice(0, -1);
      doomed = Math.max(0, doomed - 1);
    }
    steps.push({text, doomed, hold: Math.max(1, Math.round((ms / 1000) * fps))});
  });

  return steps;
}

/** Total frames the written performance occupies. Use it to size the composition. */
export function hesitantWriterFrames(p: BrutalistHesitantWriterProps, fps: number): number {
  return buildTimeline(p, fps).reduce((sum, s) => sum + s.hold, 0);
}

function stepAt(steps: Step[], frame: number): Step {
  let acc = 0;
  for (const s of steps) {
    acc += s.hold;
    if (frame < acc) return s;
  }
  return steps.length ? steps[steps.length - 1] : {text: '', doomed: 0, hold: 1};
}

// ── Component ────────────────────────────────────────────────────────────────

export const BrutalistHesitantWriter: React.FC<BrutalistHesitantWriterProps> = (props) => {
  const p = brutalistHesitantWriterSchema.parse(props);
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();

  // Everything scales off the canvas against a 1920x1080 design reference.
  const scale = Math.min(width / 1920, height / 1080);
  const size = p.fontSize * scale;
  const leading = size * p.lineSpacing;

  const steps = React.useMemo(() => buildTimeline(p, fps), [
    p.text, p.triggerWords, p.replacementWords, p.mistakeRate, p.hesitateWithin,
    p.hesitateBetween, p.charMs, p.jitter, p.seed, fps,
  ]);

  const step = stepAt(steps, frame);
  const lines = step.text.split('\n');
  const lastIndex = lines.length - 1;
  const last = lines[lastIndex];
  const doomed = Math.min(step.doomed, last.length);
  const head = last.slice(0, last.length - doomed);
  const tail = doomed > 0 ? last.slice(last.length - doomed) : '';

  // Caret blink derived from frame and wrapped — no unbounded accumulator.
  const blinkPeriod = Math.max(2, Math.round(fps * 1.06));
  const caretOn = frame % blinkPeriod < blinkPeriod * 0.55;

  const family = p.face === 'mono' ? CLAUDE_FONT.mono : CLAUDE_FONT.serif;
  const justify =
    p.align === 'left' ? 'flex-start' : p.align === 'right' ? 'flex-end' : 'center';

  return (
    <AbsoluteFill style={{backgroundColor: p.bg}}>
      {p.banner ? (
        <div
          style={{
            position: 'absolute',
            top: 72 * scale,
            right: 220 * scale,
            fontFamily: CLAUDE_FONT.ui,
            fontSize: 18 * scale,
            fontWeight: 700,
            letterSpacing: 2 * scale,
            textTransform: 'uppercase' as const,
            color: p.ink,
            opacity: 0.62,
            backgroundColor: p.bg,
            padding: `${5 * scale}px ${11 * scale}px`,
            border: `${1.5 * scale}px solid ${p.ink}`,
            borderRadius: 4 * scale,
            lineHeight: 1,
          }}
        >
          {p.banner}
        </div>
      ) : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${p.xOffset * scale}px, ${p.yOffset * scale}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: justify,
            fontFamily: family,
            fontSize: size,
            lineHeight: `${leading}px`,
            color: p.ink,
            maxWidth: width * 0.86,
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{whiteSpace: 'pre', textAlign: p.align}}>
              {i === lastIndex ? (
                <>
                  {head}
                  {tail ? <span style={{color: p.accent}}>{tail}</span> : null}
                  {p.showCaret ? (
                    <span
                      style={{
                        color: doomed > 0 ? p.accent : p.ink,
                        opacity: caretOn ? 1 : 0.15,
                      }}
                    >
                      |
                    </span>
                  ) : null}
                </>
              ) : (
                line
              )}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Demo twin ────────────────────────────────────────────────────────────────

export const brutalistHesitantWriterDemoDefaultProps: BrutalistHesitantWriterProps =
  brutalistHesitantWriterSchema.parse({});
