import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring, interpolate } from 'remotion';
import TIMING from './adaptive-therapy-timing.json';
import { ClaudeComposerAsk } from './scenes/ClaudeComposerAsk';
import { claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeCodeBeat } from './scenes/ClaudeCodeBeat';
import { claudeCodeBeatSchema } from './scenes/ClaudeCodeBeat';
import { ClaudeWindow } from './scenes/ClaudeWindow';
import { claudeWindowSchema } from './scenes/ClaudeWindow';
import { ClaudeTitleOutro } from './scenes/ClaudeTitleOutro';
import { claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const TOPIC = 'CANCER BIOLOGY · EVOLUTION';
const SEGMENT = 'Adaptive Therapy';
const FOLDER = '@NikBearBrown';

// ── Slate for DOCUMENT beats (B01, B03, B07) ─────────────────────────────────
// Dark request card: beat id + narration + "SLOT → fill media/BXX.png"
// Matches the compile.py slate law: ink background, cream text, terracotta pointer.
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
      {/* SLOT eyebrow */}
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

      {/* Beat ID */}
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

      {/* Narration excerpt */}
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

      {/* Slot note — terracotta pipeline pointer */}
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

      {/* Spark line */}
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
export const AdaptiveTherapyRevolution: React.FC = () => {
  let at = 0;

  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;

    switch (t.id) {
      // ── B00 — cold open (ClaudeComposerAsk, type-on) ─────────────────────
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Namaste, Liam',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'why would leaving cancer cells alive beat killing all of them?',
            runningText: 'reading the trial…',
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B01 — THE-PROBLEM (SLOT — production slate) ───────────────────────
      case 'B01':
        content = (
          <SlateBeat
            beatId="B01"
            narration="Maximum-dose therapy kills the drug-sensitive cells first — the easy ones. That clears the field for the resistant cells, which now grow with nothing to compete against."
            slotNote="fill media/B01.png (competition schematic or Gatenby et al. 2009 figure)"
            sparkLine="Kill the sensitive, free the resistant."
          />
        );
        break;

      // ── B02 — THE-ASK (ClaudeComposerAsk, arc cue "The ask,") ────────────
      case 'B02':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'The ask,',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Research adaptive therapy in cancer: the evolutionary rationale (Gatenby 2009), the Moffitt abiraterone prostate trial (Zhang et al. 2017, Nature Communications), clinical evidence in other cancers, and the practical barriers to adoption. Cite published sources.',
            runningText: 'researching adaptive therapy…',
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B03 — THE-EVIDENCE (SLOT — production slate) ─────────────────────
      case 'B03':
        content = (
          <SlateBeat
            beatId="B03"
            narration="And here's the receipt. Moffitt's Phase 2 abiraterone trial: adaptive dosing reached twenty-seven months of progression-free survival against about seventeen for continuous dosing."
            slotNote="fill media/B03.png (Zhang et al. 2017 Kaplan-Meier PFS curve)"
            sparkLine="27 vs ~17 months — one trial."
          />
        );
        break;

      // ── B04 — THE-SCRIPT (ClaudeCodeBeat, line-reveal) ───────────────────
      case 'B04':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: 'adaptive_audit.py — the count, not the claim',
            code: [
              'TRIALS = [',
              '    {"setting": "Prostate (abiraterone)", "PFS_mo": 27.0,',
              '     "control_PFS_mo": 16.8, "status": "Phase 2 complete"},',
              '    {"setting": "Breast (endocrine)",     "PFS_mo": None,',
              '     "control_PFS_mo": None, "status": "Preclinical only"},',
              '    {"setting": "GBM (TMZ)",              "PFS_mo": None,',
              '     "control_PFS_mo": None, "status": "Phase 1 recruiting"},',
              ']',
              'for t in TRIALS:',
              '    pfs = (f"{t[\'PFS_mo\']:.1f} vs {t[\'control_PFS_mo\']:.1f} mo"',
              '           if t[\'PFS_mo\'] else "no RCT data")',
              '    print(f"{t[\'setting\']:<26} {pfs:<18} [{t[\'status\']}]")',
            ].join('\n'),
            sparkLine: 'The script does the counting.',
          })} />
        );
        break;

      // ── B05 — THE-TABLE (ClaudeWindow artifact) ───────────────────────────
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: 'artifact',
            artifactTitle: 'Adaptive vs continuous — the evidence, one page',
            artifactHeading: 'Progression-free survival by cancer',
            artifactLines: [
              'Prostate (abiraterone) — 27.0 vs 16.8 mo · Phase 2 complete (Zhang 2017)',
              'Breast (endocrine) — no RCT data · preclinical only',
              'GBM (temozolomide) — no RCT data · Phase 1 recruiting',
              'One controlled trial carries the whole idea. The rest is promise.',
            ],
            sparkLine: 'One trial strong, the rest thin.',
          })} />
        );
        break;

      // ── B06 — THE-REVISION (ClaudeComposerAsk, arc cue "The ask,") ───────
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'The ask,',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Add a column for each cancer type: the minimum drug holiday that still preserves competitive suppression. Cite any dose-scheduling trials — and mark the rows where none exist.',
            runningText: 'adding drug-holiday data…',
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B07 — THE-CATCH (SLOT — production slate) ────────────────────────
      case 'B07':
        content = (
          <SlateBeat
            beatId="B07"
            narration="And the new column comes back mostly blank. Outside prostate, nobody knows the safe holiday yet. The entire strategy rests on one assumption: that resistant cells pay a fitness cost when the drug is gone."
            slotNote="fill media/B07.png (revised drug-holiday table or Strobl et al. 2021 figure)"
            sparkLine="It all rests on a fitness cost."
          />
        );
        break;

      // ── B08 — VERDICT (ClaudeWindow artifact, one-page teardown) ─────────
      case 'B08':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: 'artifact',
            artifactTitle: 'Adaptive therapy — the teardown, one page',
            artifactHeading: 'What holds, what\'s missing',
            artifactLines: [
              'The move: keep sensitive cells alive so they suppress the resistant ones.',
              'The evidence: one controlled trial (prostate, 27 vs 16.8 mo). Everything else is preclinical.',
              'The load-bearing assumption: resistant cells pay a fitness cost off-drug.',
              'The gap: is that cost measured, or inferred from response curves? That\'s the whole ballgame.',
            ],
            sparkLine: 'Control, not cure.',
          })} />
        );
        break;

      // ── B09 — HANDOFF (ClaudeComposerAsk, greeting "Your turn.", type-on) ─
      case 'B09':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: 'Your turn.',
            topic: TOPIC,
            segment: SEGMENT,
            command: 'Read Zhang et al. 2017 (Nature Communications) and Strobl et al. 2021 (Cancer Research). For each, tell me: is the fitness cost of resistance directly measured, or inferred from response curves? Rate the evidence and show your reasoning.',
            runningText: 'paste this into Claude…',
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B10 — OUTRO (ClaudeTitleOutro, title-restate) ────────────────────
      case 'B10':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: 'Adaptive therapy.',
            handle: '@NikBearBrown',
            subline: 'Liam, in for Bear · build it, then take it apart',
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
