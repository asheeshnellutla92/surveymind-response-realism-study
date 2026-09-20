import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './car-t-solid-tumor-barrier-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeCodeBeat, claudeCodeBeatSchema } from './scenes/ClaudeCodeBeat';
import { ClaudeWindow, claudeWindowSchema } from './scenes/ClaudeWindow';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const TOPIC = 'CANCER BIOLOGY';
const SEGMENT = 'CAR-T Barriers';
const FOLDER = '@NikBearBrown';

// ── Slate for DOCUMENT beats ──────────────────────────────────────────────────
const SlateBeat: React.FC<{
  beatId: string;
  narration: string;
  slotNote: string;
  sparkLine: string;
}> = ({ beatId, narration, slotNote, sparkLine }) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const cardIn = spring({ frame, fps, config: { damping: 28, stiffness: 140, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 140, mass: 0.8 } });
  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

  return (
    <AbsoluteFill style={{
      background: '#2F2A26',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '0 10%',
    }}>
      <div style={{
        fontFamily: SANS,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: 'uppercase' as const,
        color: CLAUDE.SPARK,
        opacity: clamp(cardIn, 0, 1),
        marginBottom: 24,
      }}>
        SLOT — {beatId} · production media pending
      </div>
      <div style={{
        fontFamily: SERIF,
        fontSize: 108,
        fontWeight: 700,
        color: '#F3EBDD',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        opacity: clamp(cardIn, 0, 1),
        transform: `scale(${clamp(cardIn, 0, 1)})`,
      }}>
        {beatId}
      </div>
      <div style={{
        fontFamily: SERIF,
        fontSize: 22,
        color: '#F3EBDD',
        textAlign: 'center',
        lineHeight: 1.5,
        marginTop: 28,
        maxWidth: 780,
        opacity: clamp(cardIn * 0.9, 0, 1),
      }}>
        {narration}
      </div>
      <div style={{
        fontFamily: SANS,
        fontSize: 15,
        color: CLAUDE.SPARK,
        marginTop: 20,
        textAlign: 'center',
        maxWidth: 680,
        opacity: clamp(cardIn * 0.8, 0, 1),
      }}>
        PIPELINE → {slotNote}
      </div>
      <div style={{
        position: 'absolute',
        bottom: '6%',
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        opacity: clamp(sparkIn, 0, 1),
      }}>
        <span style={{
          fontFamily: SERIF,
          fontSize: 22,
          fontStyle: 'italic',
          color: '#F3EBDD',
        }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── Timing ────────────────────────────────────────────────────────────────────
const TIMED = TIMING.map((t) => ({ ...t }));
export const TOTAL_FRAMES = TIMED.reduce((a, b) => a + b.frames, 0);

// ── Main composition ──────────────────────────────────────────────────────────
export const CarTSolidTumorBarrier: React.FC = () => {
  let at = 0;

  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;

    switch (t.id) {
      // ── B00 — cold open ───────────────────────────────────────────────────────
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Ciao, Liam`,
            topic: TOPIC,
            segment: SEGMENT,
            command: `CAR-T — why it cures leukemia but stalls at solid tumors.`,
            runningText: `reading the research…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B01 — THE-PROBLEM (SLOT) ─────────────────────────────────────────────
      case 'B01':
        content = (
          <SlateBeat
            beatId='B01'
            narration={`CAR-T achieves 70 to 90 percent complete response in relapsed pediatric B-cell leukemia — a disease that was once terminal. The same engineering approach barely registers response rates in lung, breast, or pancreatic cancer. The cells are built the same way. The problem is entirely in what they face when they arrive.`}
            slotNote='fill media/B01.png'
            sparkLine={`70–90% in leukemia. Near zero in solid tumors.`}
          />
        );
        break;

      // ── B02 — THE-ASK ────────────────────────────────────────────────────────
      case 'B02':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'The ask,',
            topic: TOPIC,
            segment: SEGMENT,
            command: `Research CAR-T therapy in solid tumors vs hematologic cancers: list FDA-approved indications with objective response rates, identify the five main barriers to solid tumor activity (antigen heterogeneity, T cell exhaustion, immunosuppressive TME, poor trafficking, on-target off-tumor toxicity), and for each barrier cite the strongest preclinical or clinical evidence it can be overcome.`,
            runningText: `researching CAR-T barriers...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B03 — THE-SCRIPT (ClaudeCodeBeat) ───────────────────────────────────
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `cart_compare.py — the count, not the claim`,
            code: `DATA = [
    ("B-ALL (pediatric)", "hematologic", 85, "APPROVED"),
    ("DLBCL",             "hematologic", 40, "APPROVED"),
    ("Multiple Myeloma",  "hematologic", 73, "APPROVED"),
    ("GBM",               "solid",        8, "INVESTIGATIONAL"),
    ("Pancreatic",        "solid",        3, "INVESTIGATIONAL"),
    ("Ovarian",           "solid",        5, "INVESTIGATIONAL"),
]
print(f"{'Indication':<22} {'Type':<14} {'ORR':>5}  {'Status'}")
print("-" * 55)
for name, typ, orr, status in DATA:
    flag = "  <- FLAG" if orr < 15 else ""
    print(f"{name:<22} {typ:<14} {orr:>4}%  {status}{flag}")`,
            sparkLine: `The script does the counting.`,
          })} />
        );
        break;

      // ── B04 — THE-OUTPUT (SLOT) ──────────────────────────────────────────────
      case 'B04':
        content = (
          <SlateBeat
            beatId='B04'
            narration={`Bar chart showing CAR-T objective response rates across hematologic and solid tumor indications.`}
            slotNote='fill media/B04.png'
            sparkLine={`Response rates: high in blood, low in solid.`}
          />
        );
        break;

      // ── B05 — THE-REVISION-ASK ───────────────────────────────────────────────
      case 'B05':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'The ask,',
            topic: TOPIC,
            segment: SEGMENT,
            command: `For each of the five barriers, what is the single most promising engineering solution currently in clinical trials? Cite the trial ID and phase.`,
            runningText: `finding solutions...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B06 — THE-REVISED-OUTPUT (SLOT) ─────────────────────────────────────
      case 'B06':
        content = (
          <SlateBeat
            beatId='B06'
            narration={`Barrier list with engineering solution callouts and trial phase status.`}
            slotNote='fill media/B06.png'
            sparkLine={`Solutions called. Phase status listed.`}
          />
        );
        break;

      // ── B07 — VERDICT (ClaudeWindow artifact) ────────────────────────────────
      case 'B07':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: 'artifact',
            artifactTitle: `CAR-T solid tumor barriers — the teardown, one page`,
            artifactHeading: `Five barriers, five open problems`,
            artifactLines: [
              `The five barriers are separate unsolved engineering problems.`,
              `A CAR-T that beats antigen heterogeneity still faces exhaustion.`,
              `Progress requires solving all five simultaneously.`,
              `The field is solving them independently — no single therapy has cleared all five.`,
            ],
            sparkLine: `Five problems. Must solve all five.`,
          })} />
        );
        break;

      // ── B08 — HANDOFF (Your turn.) ───────────────────────────────────────────
      case 'B08':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Your turn.',
            topic: TOPIC,
            segment: SEGMENT,
            command: `Read the June lab dual-targeting CAR-T papers on CD19 plus CD22. Then read the Pan et al. 2022 armored CAR-T work — what the TME does to a standard versus an IL-15-secreting CAR.`,
            runningText: `paste this into Claude…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B09 — OUTRO (ClaudeTitleOutro) ──────────────────────────────────────
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `CAR-T Barriers.`,
            handle: `@NikBearBrown`,
            subline: `Liam, in for Bear · build it, then take it apart`,
          })} />
        );
        break;

      default:
        content = <AbsoluteFill style={{ background: CLAUDE.PAGE }} />;
    }

    return (
      <Sequence key={t.id} from={from} durationInFrames={t.frames}>
        {content}
        <Audio src={staticFile(t.audio)} />
      </Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ background: CLAUDE.PAGE }}>
      {seqs}
    </AbsoluteFill>
  );
};
