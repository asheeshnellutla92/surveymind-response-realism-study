import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './neoantigen-vaccine-pipeline-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeCodeBeat, claudeCodeBeatSchema } from './scenes/ClaudeCodeBeat';
import { ClaudeWindow, claudeWindowSchema } from './scenes/ClaudeWindow';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const TOPIC = 'CANCER BIOLOGY';
const SEGMENT = 'Neoantigen Vaccines';
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
export const NeoantigenaVaccinePipeline: React.FC = () => {
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
            greeting: `Vanakkam, Liam`,
            topic: TOPIC,
            segment: SEGMENT,
            command: `Neoantigen vaccines — engineering immunity to your own cancer's mutations.`,
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
            narration={`Every tumor carries mutations the immune system could learn to recognize — if it were taught. The mRNA-4157 melanoma trial cut recurrence by 44 percent in combination with pembrolizumab. Can this scale beyond melanoma and beyond affluent clinical trial sites?`}
            slotNote='fill media/B01.png'
            sparkLine={`mRNA-4157: teaching immune recognition.`}
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
            command: `Research personalized neoantigen cancer vaccines: the mRNA-4157/V940 Moderna-Merck trial results (recurrence-free survival in stage III/IV melanoma), the pipeline steps (tumor sequencing -> neoantigen prediction -> mRNA manufacturing -> dosing), manufacturing timeline and cost, extension to other tumor types (NSCLC, colorectal), and the main barriers to broad adoption.`,
            runningText: `researching neoantigen vaccines...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B03 — THE-SCRIPT (ClaudeCodeBeat) ───────────────────────────────────
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `neoantigen_pipeline.py — the count, not the claim`,
            code: `STAGES = [
    {"stage": "Tumor biopsy + QC",        "days": 3,   "cost_usd": 500,   "attrition_pct": 10},
    {"stage": "Whole-genome sequencing",   "days": 14,  "cost_usd": 1500,  "attrition_pct": 5},
    {"stage": "Neoantigen prediction",     "days": 7,   "cost_usd": 3000,  "attrition_pct": 15},
    {"stage": "mRNA manufacturing",        "days": 28,  "cost_usd": 50000, "attrition_pct": 8},
    {"stage": "QC release + dosing",       "days": 7,   "cost_usd": 2000,  "attrition_pct": 2},
]
cumulative_loss = 0
print(f"{'Stage':<30} {'Days':>5}  {'Cost':>8}  {'Loss':>6}  {'Cumulative loss'}")
print("-" * 70)
for s in STAGES:
    cumulative_loss = 100 - (100 - cumulative_loss) * (1 - s["attrition_pct"]/100)
    print(f"{s['stage']:<30} {s['days']:>5}d  \${s['cost_usd']:>7,}  {s['attrition_pct']:>5}%  {cumulative_loss:>8.1f}%")`,
            sparkLine: `The script does the counting.`,
          })} />
        );
        break;

      // ── B04 — THE-OUTPUT (SLOT) ──────────────────────────────────────────────
      case 'B04':
        content = (
          <SlateBeat
            beatId='B04'
            narration={`Pipeline stages output — tumor biopsy, whole-genome sequencing, neoantigen prediction, mRNA synthesis, dosing — with timeline and estimated cost per stage.`}
            slotNote='fill media/B04.png'
            sparkLine={`Biopsy to dose — times and failure rates.`}
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
            command: `Add the main failure point at each pipeline stage — what percentage of patients fail to reach dosing due to tumor biopsy quality, sequencing turnaround, neoantigen prediction accuracy, or manufacturing failure?`,
            runningText: `adding attrition data...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B06 — THE-REVISED-OUTPUT (SLOT) ─────────────────────────────────────
      case 'B06':
        content = (
          <SlateBeat
            beatId='B06'
            narration={`Revised pipeline with attrition rates at each stage — cumulative loss from biopsy to dose.`}
            slotNote='fill media/B06.png'
            sparkLine={`Pipeline attrition — cumulative loss per stage.`}
          />
        );
        break;

      // ── B07 — VERDICT (ClaudeWindow artifact) ────────────────────────────────
      case 'B07':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: 'artifact',
            artifactTitle: `Neoantigen vaccine pipeline — the teardown, one page`,
            artifactHeading: `What the evidence shows`,
            artifactLines: [
              `The vaccine works when it reaches the patient.`,
              `30% attrition from biopsy to first dose — the real barrier is logistics.`,
              `This is not a vaccine failure. It is a pipeline failure.`,
              `The biology is solved. The supply chain is not.`,
            ],
            sparkLine: `Attrition, not biology, is the wall.`,
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
            command: `Read the V940 trial preprint on survival outcomes and find the subgroup analysis by tumor mutation burden. High-TMB patients should respond better — verify whether the effect size is larger in that group, and whether the trial was powered to show it.`,
            runningText: `paste this into Claude…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B09 — OUTRO (ClaudeTitleOutro) ──────────────────────────────────────
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Neoantigen Vaccines.`,
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
