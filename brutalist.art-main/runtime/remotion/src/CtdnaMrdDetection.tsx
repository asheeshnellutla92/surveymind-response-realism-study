import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './ctdna-mrd-detection-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeCodeBeat, claudeCodeBeatSchema } from './scenes/ClaudeCodeBeat';
import { ClaudeWindow, claudeWindowSchema } from './scenes/ClaudeWindow';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const TOPIC = 'CANCER BIOLOGY';
const SEGMENT = 'ctDNA MRD';
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
export const CtdnaMrdDetection: React.FC = () => {
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
            greeting: `Jambo, Liam`,
            topic: TOPIC,
            segment: SEGMENT,
            command: `ctDNA MRD — the blood test that sees cancer before imaging can.`,
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
            narration={`After surgery for colorectal cancer, the scan is clean. But a ctDNA blood test taken six weeks later is positive. That patient will almost certainly relapse within two years — and the ctDNA-negative patient probably won't. A biomarker that detects micrometastatic disease invisible to imaging already exists. Should every post-surgical patient get it?`}
            slotNote='fill media/B01.png'
            sparkLine={`Clean scan, positive ctDNA — act now.`}
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
            command: `Research ctDNA minimal residual disease testing in solid tumors: which cancer types have the strongest clinical validation (colorectal, breast, lung, bladder), what is the sensitivity and specificity of the leading platforms (Foundation Medicine, Guardant, Grail), what is the lead time to imaging detection, and which clinical trials have shown ctDNA-MRD-guided escalation/de-escalation of adjuvant therapy changes outcomes?`,
            runningText: `researching ctDNA MRD...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B03 — THE-SCRIPT (ClaudeCodeBeat) ───────────────────────────────────
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `ctdna_matrix.py — the count, not the claim`,
            code: `DATA = [
    {"cancer": "Colorectal (stage II)", "sensitivity": 0.88, "lead_mo": 8, "rct": "DYNAMIC (NEJM 2022)"},
    {"cancer": "Breast (early)",        "sensitivity": 0.70, "lead_mo": 11, "rct": "C-TRAK (ongoing)"},
    {"cancer": "NSCLC (stage I-III)",   "sensitivity": 0.75, "lead_mo": 5,  "rct": "TRACERx (Nature 2022)"},
    {"cancer": "Bladder",               "sensitivity": 0.82, "lead_mo": 3,  "rct": "Pilot only"},
    {"cancer": "Ovarian",               "sensitivity": 0.60, "lead_mo": 2,  "rct": "No RCT"},
]
print(f"{'Cancer':<28} {'Sens':>5}  {'Lead (mo)':>10}  {'Trial evidence'}")
print("-" * 65)
for d in DATA:
    flag = "  <- VALIDATED" if "NEJM" in d["rct"] or "Nature" in d["rct"] else ""
    print(f"{d['cancer']:<28} {d['sensitivity']*100:>4.0f}%  {d['lead_mo']:>9}mo  {d['rct']}{flag}")`,
            sparkLine: `The script does the counting.`,
          })} />
        );
        break;

      // ── B04 — THE-OUTPUT (SLOT) ──────────────────────────────────────────────
      case 'B04':
        content = (
          <SlateBeat
            beatId='B04'
            narration={`Evidence matrix output — cancer types with sensitivity, lead time months, and trial evidence tier.`}
            slotNote='fill media/B04.png'
            sparkLine={`Evidence tier, by cancer type.`}
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
            command: `Add a column: for each cancer type, what is the cost per test, and is it covered by Medicare or major private insurers as of 2024?`,
            runningText: `adding coverage data...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B06 — THE-REVISED-OUTPUT (SLOT) ─────────────────────────────────────
      case 'B06':
        content = (
          <SlateBeat
            beatId='B06'
            narration={`Revised matrix with cost and coverage column — what the test costs and who pays for it.`}
            slotNote='fill media/B06.png'
            sparkLine={`Cost and coverage — added to the matrix.`}
          />
        );
        break;

      // ── B07 — VERDICT (ClaudeWindow artifact) ────────────────────────────────
      case 'B07':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: 'artifact',
            artifactTitle: `ctDNA MRD detection — the teardown, one page`,
            artifactHeading: `What the evidence shows`,
            artifactLines: [
              `The test works: ctDNA detects MRD months before imaging.`,
              `The clinical question: does acting on that detection improve survival?`,
              `DYNAMIC said yes for colorectal cancer (Tie et al. 2022, NEJM).`,
              `Every other cancer type: pending.`,
            ],
            sparkLine: `Detection solved. Acting on it isn’t.`,
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
            command: `Read the DYNAMIC trial by Tie et al. 2022 in NEJM. Count the number of patients who avoided adjuvant chemotherapy based on ctDNA negativity — and the recurrence rate in that group. That is the number you need to trust the test.`,
            runningText: `paste this into Claude…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B09 — OUTRO (ClaudeTitleOutro) ──────────────────────────────────────
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `ctDNA MRD.`,
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
