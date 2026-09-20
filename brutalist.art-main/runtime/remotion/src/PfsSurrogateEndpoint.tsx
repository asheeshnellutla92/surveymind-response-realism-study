import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './pfs-surrogate-endpoint-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeCodeBeat, claudeCodeBeatSchema } from './scenes/ClaudeCodeBeat';
import { ClaudeWindow, claudeWindowSchema } from './scenes/ClaudeWindow';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const TOPIC = 'CANCER BIOLOGY';
const SEGMENT = 'PFS Surrogate';
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
export const PfsSurrogateEndpoint: React.FC = () => {
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
            greeting: `Merhaba, Liam`,
            topic: TOPIC,
            segment: SEGMENT,
            command: `PFS as a surrogate — the endpoint that sometimes lies.`,
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
            narration={`A cancer drug wins FDA approval showing it delays tumor progression by 2.5 months on a CT scan. Three years later the same drug fails to improve survival. Patients lived just as long whether they took it or not. The endpoint that got the drug approved measured the wrong thing. This is the progression-free survival surrogate problem — and it happens more often than the public knows.`}
            slotNote='fill media/B01.png'
            sparkLine={`Tumor shrank. Patient didn’t live longer.`}
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
            command: `Research the PFS-to-overall-survival surrogate endpoint problem in oncology: what is the Spearman correlation between PFS benefit and OS benefit across cancer types (citing Prasad and Mailankody 2017, Kim and Prasad 2015), list five high-profile cases where PFS benefit did not translate to OS benefit, explain when PFS is a valid surrogate (colorectal first-line) vs invalid (second-line lung), and what the FDA's current policy is on PFS as primary endpoint.`,
            runningText: `researching PFS surrogacy...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B03 — THE-SCRIPT (ClaudeCodeBeat) ───────────────────────────────────
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `pfs_audit.py — the count, not the claim`,
            code: `CASES = [
    {"drug": "Bevacizumab (breast)", "PFS_mo": 5.9, "OS_benefit": False,
     "FDA_approved": True,  "approval_withdrawn": True},
    {"drug": "Avastin (glioblastoma)", "PFS_mo": 4.0, "OS_benefit": False,
     "FDA_approved": True,  "approval_withdrawn": False},
    {"drug": "FOLFOX (colon, 1L)",   "PFS_mo": 2.1, "OS_benefit": True,
     "FDA_approved": True,  "approval_withdrawn": False},
    {"drug": "Sunitinib (GIST)",      "PFS_mo": 24.1,"OS_benefit": True,
     "FDA_approved": True,  "approval_withdrawn": False},
    {"drug": "Palbociclib (breast)",  "PFS_mo": 10.0,"OS_benefit": None,
     "FDA_approved": True,  "approval_withdrawn": False},
]
print(f"{'Drug':<28} {'PFS benefit':>11}  {'OS confirmed':>13}  {'Status'}")
print("-" * 70)
for c in CASES:
    os = "YES" if c["OS_benefit"] else ("PENDING" if c["OS_benefit"] is None else "NO <- FLAG")
    status = "WITHDRAWN" if c["approval_withdrawn"] else "APPROVED"
    print(f"{c['drug']:<28} {c['PFS_mo']:>10.1f}mo  {os:>13}  {status}")`,
            sparkLine: `The script does the counting.`,
          })} />
        );
        break;

      // ── B04 — THE-OUTPUT (SLOT) ──────────────────────────────────────────────
      case 'B04':
        content = (
          <SlateBeat
            beatId='B04'
            narration={`Matrix output — PFS benefit versus OS translation cases with FDA approval status.`}
            slotNote='fill media/B04.png'
            sparkLine={`PFS versus OS — the translation gap.`}
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
            command: `Add a column: for each case, was the PFS benefit detected in a phase 3 trial with OS as a co-primary or secondary endpoint, and did that OS endpoint eventually read out positively or negatively?`,
            runningText: `adding OS readout data...`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B06 — THE-REVISED-OUTPUT (SLOT) ─────────────────────────────────────
      case 'B06':
        content = (
          <SlateBeat
            beatId='B06'
            narration={`Revised matrix with OS co-primary readout column — positive, negative, or never tested.`}
            slotNote='fill media/B06.png'
            sparkLine={`OS co-primary — positive, negative, untested.`}
          />
        );
        break;

      // ── B07 — VERDICT (ClaudeWindow artifact) ────────────────────────────────
      case 'B07':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: 'artifact',
            artifactTitle: `PFS as surrogate endpoint — the teardown, one page`,
            artifactHeading: `What the evidence shows`,
            artifactLines: [
              `PFS: tumor shrinks or holds. OS: patient lives longer.`,
              `These are not the same question.`,
              `Treating PFS as OS proxy requires biological rationale — often absent.`,
              `PFS improved, OS unchanged: scan timing extended, not life.`,
            ],
            sparkLine: `Two different questions. Treated as one.`,
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
            command: `Read Prasad and Mailankody 2017 in JAMA Internal Medicine — the study that measured how often cancer approvals based on PFS or response rate are later confirmed with OS benefit. Find the percentage that were confirmed, the percentage that failed to confirm, and the percentage that were never tested.`,
            runningText: `paste this into Claude…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B09 — OUTRO (ClaudeTitleOutro) ──────────────────────────────────────
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `PFS Surrogate.`,
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
