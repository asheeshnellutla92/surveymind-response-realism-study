import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './oncolytic-virotherapy-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeCodeBeat, claudeCodeBeatSchema } from './scenes/ClaudeCodeBeat';
import { ClaudeWindow, claudeWindowSchema } from './scenes/ClaudeWindow';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const TOPIC = 'CANCER BIOLOGY';
const SEGMENT = 'Oncolytic Virotherapy';
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
export const OncolyticVirotherapy: React.FC = () => {
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
            greeting: `Bonjour, Liam`,
            topic: TOPIC,
            segment: SEGMENT,
            command: `T-VEC — the FDA-approved herpes virus that fights cancer.`,
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
            narration={`T-VEC is a herpes simplex virus engineered to infect and lyse cancer cells, and to secrete GM-CSF to recruit the immune system. It is FDA-approved for melanoma. Injected directly into a tumor, it works. But the same strategy delivered systemically — through the bloodstream — has failed repeatedly. What does direct injection accomplish that systemic delivery cannot?`}
            slotNote='fill media/B01.png'
            sparkLine={`T-VEC: engineered herpes, FDA-approved.`}
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
            command: `Research oncolytic virotherapy: T-VEC mechanism (modified HSV-1, deleted ICP34.5, added GM-CSF), the OPTiM trial results (durable response rate vs GM-CSF), why systemic delivery fails (neutralizing antibodies, liver sequestration, innate immune clearance), what engineering modifications are being tested to overcome systemic barriers, and the current clinical pipeline beyond melanoma.`,
            runningText: `researching oncolytic viruses...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B03 — THE-SCRIPT (ClaudeCodeBeat) ───────────────────────────────────
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `tvec_compare.py — the count, not the claim`,
            code: `STRATEGIES = [
    {"delivery": "Intratumoral (T-VEC)", "virus": "HSV-1 modified",
     "DRR_pct": 16.3, "barrier": "Requires accessible lesion", "status": "FDA APPROVED"},
    {"delivery": "Systemic IV (Pexa-Vec)", "virus": "Vaccinia",
     "DRR_pct": 0.0,  "barrier": "Neutralizing Ab + liver sequestration", "status": "Phase 3 FAILED"},
    {"delivery": "Systemic (ONCOS-102)",  "virus": "Adenovirus",
     "DRR_pct": None, "barrier": "Innate immune clearance", "status": "Phase 1/2"},
    {"delivery": "Cell carrier (OV-CAR-3)","virus": "Measles",
     "DRR_pct": None, "barrier": "Cell survival after infusion", "status": "Preclinical"},
]
for s in STRATEGIES:
    drr = f"{s['DRR_pct']:.1f}%" if s["DRR_pct"] is not None else "not reported"
    print(f"[{s['status']:<18}] {s['delivery']:<30}  DRR: {drr}")
    print(f"   Barrier: {s['barrier']}")`,
            sparkLine: `The script does the counting.`,
          })} />
        );
        break;

      // ── B04 — THE-OUTPUT (SLOT) ──────────────────────────────────────────────
      case 'B04':
        content = (
          <SlateBeat
            beatId='B04'
            narration={`Comparison output — OPTiM trial results versus systemic delivery failure cases with barrier analysis.`}
            slotNote='fill media/B04.png'
            sparkLine={`OPTiM versus systemic delivery — compared.`}
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
            command: `List the five most advanced systemic oncolytic virotherapy programs in clinical trials as of 2024, their virus type, modification strategy, cancer target, and current phase.`,
            runningText: `building pipeline table...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B06 — THE-REVISED-OUTPUT (SLOT) ─────────────────────────────────────
      case 'B06':
        content = (
          <SlateBeat
            beatId='B06'
            narration={`Systemic pipeline table — virus, modification strategy, cancer target, and current phase.`}
            slotNote='fill media/B06.png'
            sparkLine={`Systemic pipeline: virus, target, phase.`}
          />
        );
        break;

      // ── B07 — VERDICT (ClaudeWindow artifact) ────────────────────────────────
      case 'B07':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: 'artifact',
            artifactTitle: `Oncolytic virotherapy — the teardown, one page`,
            artifactHeading: `What the evidence shows`,
            artifactLines: [
              `T-VEC converts cold tumors to hot — forcing antigen release and immune recruitment in situ.`,
              `The effect reaches uninjected distant lesions — the abscopal response.`,
              `Ceiling: immune-excluded tumors that block recruitment entirely.`,
              `Systemic delivery remains unsolved; intratumoral injection limits reach.`,
            ],
            sparkLine: `Cold → hot → abscopal. The mechanism.`,
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
            command: `Read Andtbacka et al. 2015 in JCO — the OPTiM trial. Find the abscopal response rate: tumors not injected with T-VEC that nonetheless responded. That number is the evidence the immune mechanism is real. Then check whether the abscopal responders had higher CD8+ T cell infiltration at baseline.`,
            runningText: `paste this into Claude…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B09 — OUTRO (ClaudeTitleOutro) ──────────────────────────────────────
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Oncolytic Virotherapy.`,
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
