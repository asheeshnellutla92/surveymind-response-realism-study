import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './pre-metastatic-niche-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeCodeBeat, claudeCodeBeatSchema } from './scenes/ClaudeCodeBeat';
import { ClaudeWindow, claudeWindowSchema } from './scenes/ClaudeWindow';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const TOPIC = 'CANCER BIOLOGY';
const SEGMENT = 'Pre-Metastatic Niche';
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
export const PreMetastaticNiche: React.FC = () => {
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
            greeting: `Aloha, Liam`,
            topic: TOPIC,
            segment: SEGMENT,
            command: `Pre-metastatic niche — the tumor is preparing your liver before it sends any cells.`,
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
            narration={`A breast cancer patient has no liver metastases — yet. But the tumor is already sending exosomes to the liver, recruiting immune-suppressive cells, remodeling the extracellular matrix, and creating a hospitable landing zone. The cancer is doing real estate preparation, using exosomes with organ-specific integrin addresses to target specific organs. This happens before the first cancer cell arrives.`}
            slotNote='fill media/B01.png'
            sparkLine={`The tumor preps the liver before it arrives.`}
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
            command: `Research the pre-metastatic niche: the Kaplan 2005 VEGFR1 paper defining the concept, how tumor-derived exosomes with organ-specific integrins (avb5->liver, a6b4->lung) educate stromal and immune cells before CTCs arrive, the role of MDSCs and fibronectin in niche preparation, and what experimental strategies block niche formation — citing published in vivo evidence.`,
            runningText: `researching niche formation...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B03 — THE-SCRIPT (ClaudeCodeBeat) ───────────────────────────────────
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `exosome_map.py — the count, not the claim`,
            code: `INTEGRIN_MAP = [
    {"integrin": "a6b4 + a6b1", "organ": "lung",   "exosome_source": "breast",
     "MDSC_recruited": True, "blocker": "anti-a6 Ab (preclinical)"},
    {"integrin": "avb5",        "organ": "liver",  "exosome_source": "breast/pancreatic",
     "MDSC_recruited": True, "blocker": "anti-avb5 Ab (preclinical)"},
    {"integrin": "a6b1 + avb5", "organ": "brain",  "exosome_source": "breast",
     "MDSC_recruited": False, "blocker": "None identified"},
    {"integrin": "avb5",        "organ": "bone",   "exosome_source": "prostate",
     "MDSC_recruited": True, "blocker": "Denosumab (approved; different mech)"},
]
print(f"{'Integrin':<18}  {'Organ':<7}  {'Source':<20}  {'Blocker'}")
print("-" * 65)
for m in INTEGRIN_MAP:
    flag = "  <- NO BLOCKER" if m["blocker"] == "None identified" else ""
    print(f"{m['integrin']:<18}  {m['organ']:<7}  {m['exosome_source']:<20}  {m['blocker']}{flag}")`,
            sparkLine: `The script does the counting.`,
          })} />
        );
        break;

      // ── B04 — THE-OUTPUT (SLOT) ──────────────────────────────────────────────
      case 'B04':
        content = (
          <SlateBeat
            beatId='B04'
            narration={`Horizontal schematic — Primary Tumor sends exosomes with integrin addresses to target organs, recruiting MDSCs, then CTCs colonize prepared niche.`}
            slotNote='fill media/B04.png'
            sparkLine={`The exosome address system, mapped.`}
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
            command: `For each organ-specific integrin pair, what is the most advanced experimental or clinical intervention blocking the exosome-integrin interaction, and what was the effect on metastatic colonization in vivo?`,
            runningText: `finding integrin blockers...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B06 — THE-REVISED-OUTPUT (SLOT) ─────────────────────────────────────
      case 'B06':
        content = (
          <SlateBeat
            beatId='B06'
            narration={`Same schematic with anti-integrin antibody block at the integrin step and Kaplan 2005 evidence box.`}
            slotNote='fill media/B06.png'
            sparkLine={`Anti-integrin block. Kaplan 2005 evidence.`}
          />
        );
        break;

      // ── B07 — VERDICT (ClaudeWindow artifact) ────────────────────────────────
      case 'B07':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: 'artifact',
            artifactTitle: `Pre-metastatic niche — the teardown, one page`,
            artifactHeading: `What the evidence shows`,
            artifactLines: [
              `Block niche formation before metastatic cells arrive — eliminate the landing zone.`,
              `The niche forms before any detectable metastatic lesion.`,
              `Therapy must be given to patients who appear disease-free.`,
              `Intervention window: widest before the first metastatic cell lands.`,
            ],
            sparkLine: `Eliminate the landing zone. Not the cells.`,
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
            command: `Read Hoshino et al. 2015 in Nature — the paper establishing organ-specific integrin-directed exosome homing. Find the in vivo experiment where they injected exosomes with lung-tropic integrins and measured colonization efficiency. That experiment is the proof-of-concept for the integrin address system.`,
            runningText: `paste this into Claude…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B09 — OUTRO (ClaudeTitleOutro) ──────────────────────────────────────
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Pre-Metastatic Niche.`,
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
