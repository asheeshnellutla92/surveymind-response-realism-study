import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './tumor-heterogeneity-tracerx-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeCodeBeat, claudeCodeBeatSchema } from './scenes/ClaudeCodeBeat';
import { ClaudeWindow, claudeWindowSchema } from './scenes/ClaudeWindow';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const TOPIC = 'CANCER BIOLOGY';
const SEGMENT = 'Tumor Heterogeneity';
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
export const TumorHeterogeneityTracerx: React.FC = () => {
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
            greeting: `Yassou, Liam`,
            topic: TOPIC,
            segment: SEGMENT,
            command: `Tumor heterogeneity — why every biopsy tells a different story.`,
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
            narration={`A surgeon takes a biopsy from one region of a lung tumor. A mutation driving treatment choice is present in only 40 percent of the tumor's cells. The therapy hits those cells — and spares the other 60 percent. This is what the TRACERx study found: a single biopsy misrepresents the tumor almost every time. How do we treat a moving target?`}
            slotNote='fill media/B01.png'
            sparkLine={`One biopsy. 40% of the tumor, unseen.`}
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
            command: `Research the TRACERx trial: what fraction of driver mutations were subclonal vs. clonal in early-stage NSCLC, what was the relationship between clonal neoantigen burden and immunotherapy response, and what strategies — multi-region sampling, ctDNA, single-cell sequencing — best capture intratumoral heterogeneity for clinical decision-making? Cite TRACERx-specific findings.`,
            runningText: `researching TRACERx...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B03 — THE-SCRIPT (ClaudeCodeBeat) ───────────────────────────────────
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `heterogeneity_audit.py — the count, not the claim`,
            code: `MUTATIONS = [
    {"gene": "TP53",   "type": "clonal",    "ccf": 1.00, "target_for_IO": True},
    {"gene": "KRAS",   "type": "clonal",    "ccf": 0.95, "target_for_IO": True},
    {"gene": "CDKN2A", "type": "subclonal", "ccf": 0.42, "target_for_IO": False},
    {"gene": "PIK3CA", "type": "subclonal", "ccf": 0.31, "target_for_IO": False},
    {"gene": "MYC",    "type": "subclonal", "ccf": 0.19, "target_for_IO": False},
]
clonal = [m for m in MUTATIONS if m["type"] == "clonal"]
subcl  = [m for m in MUTATIONS if m["type"] == "subclonal"]
print(f"Clonal (trunk) mutations: {len(clonal)} -- present in ALL cells -- IO targets")
for m in clonal:
    print(f"  {m['gene']} CCF={m['ccf']:.2f}")
print(f"Subclonal (branch) mutations: {len(subcl)} -- partial coverage")
for m in subcl:
    flag = "  <- missed by single biopsy" if m["ccf"] < 0.40 else ""
    print(f"  {m['gene']} CCF={m['ccf']:.2f}{flag}")`,
            sparkLine: `The script does the counting.`,
          })} />
        );
        break;

      // ── B04 — THE-OUTPUT (SLOT) ──────────────────────────────────────────────
      case 'B04':
        content = (
          <SlateBeat
            beatId='B04'
            narration={`Clonal tree showing trunk mutations shared by all cells versus branch subclones, with single biopsy capturing only one branch.`}
            slotNote='fill media/B04.png'
            sparkLine={`Trunk versus branch — one biopsy captures one branch.`}
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
            command: `Quantify: what fraction of TRACERx patients would have been mis-stratified for immunotherapy if only a single biopsy was used to estimate clonal neoantigen burden?`,
            runningText: `calculating mis-stratification rate...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B06 — THE-REVISED-OUTPUT (SLOT) ─────────────────────────────────────
      case 'B06':
        content = (
          <SlateBeat
            beatId='B06'
            narration={`Two-panel comparison — single biopsy incomplete picture versus ctDNA plus multi-region complete clonal map.`}
            slotNote='fill media/B06.png'
            sparkLine={`ctDNA + multi-region. The complete map.`}
          />
        );
        break;

      // ── B07 — VERDICT (ClaudeWindow artifact) ────────────────────────────────
      case 'B07':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: 'artifact',
            artifactTitle: `Tumor heterogeneity — the teardown, one page`,
            artifactHeading: `What TRACERx showed`,
            artifactLines: [
              `The tumor is a population of competing clones, not a single entity.`,
              `A single biopsy captures one corner of that population.`,
              `TRACERx: trunk mutations present in every cell — better targets than subclonal ones.`,
              `Subclonal targets spare the rest. The trunk is the shared weakness.`,
            ],
            sparkLine: `Target the trunk. Miss the branch.`,
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
            command: `Read Jamal-Hanjani et al. 2017 in NEJM — the TRACERx primary results. Find the specific figure showing clonal versus subclonal neoantigen count as a predictor of immune response. That figure contains the clinical logic for why trunk-targeting immunotherapy should outperform subclone-targeting.`,
            runningText: `paste this into Claude…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B09 — OUTRO (ClaudeTitleOutro) ──────────────────────────────────────
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Tumor Heterogeneity.`,
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
