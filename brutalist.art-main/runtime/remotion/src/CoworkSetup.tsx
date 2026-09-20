import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './cowork-setup-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeCodeBeat, claudeCodeBeatSchema } from './scenes/ClaudeCodeBeat';
import { ClaudeWindow, claudeWindowSchema } from './scenes/ClaudeWindow';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;
const TOPIC = 'COWORK · SETUP';
const SEGMENT = 'Claude Cowork, Set Up';
const FOLDER = '@NikBearBrown';

// ── Slate for DOCUMENT beats (B01, B02, B07) ─────────────────────────────────
// Standard production slate: dark card, beat id, narration excerpt,
// SLOT → pipeline note, spark line at bottom.
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
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: '#F3EBDD' }}>
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
export const CoworkSetup: React.FC = () => {
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
            greeting: `Kia ora, Bear`,
            topic: TOPIC,
            segment: SEGMENT,
            command: `how do I set up Cowork so my whole team can actually use it?`,
            runningText: `planning the setup…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B01 — MANY-CLAUDE (SLOT — production slate) ───────────────────────
      case 'B01':
        content = (
          <SlateBeat
            beatId="B01"
            narration={`First, what Cowork even is. It lives in the desktop app, in the tab between Chat and Code. And it's not one Claude — it's many.`}
            slotNote="fill media/B01.png (Cowork tab mid-plan, parallel subagents visible)"
            sparkLine={`Many Claude, one prompt.`}
          />
        );
        break;

      // ── B02 — THE-OLD-WAY (SLOT — production slate) ──────────────────────
      case 'B02':
        content = (
          <SlateBeat
            beatId="B02"
            narration={`Here's the setup everyone learned first — mine included. A folder on your computer: about-me files so Claude knows you, output files for its work.`}
            slotNote="fill media/B02.png (old folder+files setup, folder picker at session start)"
            sparkLine={`Folders were the old default.`}
          />
        );
        break;

      // ── B03 — WHY-IT-BREAKS (ClaudeWindow artifact) ──────────────────────
      case 'B03':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Why the folder setup breaks`,
            artifactHeading: `Two failure modes`,
            artifactLines: [
              `Folders leak — old outputs sneak into context and poison the new answer.`,
              `Files rot — the about-me file needs upkeep nobody has time for.`,
              `Fine for one person. Breaks the moment a team shares it.`,
            ],
            sparkLine: `Folders leak. Files rot.`,
          })} />
        );
        break;

      // ── B04 — THE-FIX (ClaudeWindow artifact) ────────────────────────────
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The whole setup — one page`,
            artifactHeading: `Skills + Projects. Nothing else.`,
            artifactLines: [
              `Skill = a capability you call — a slash command, from inside any chat.`,
              `Project = a place you go — files and instructions stay loaded, and it remembers.`,
              `No about-me files to maintain. No output folders to leak.`,
            ],
            sparkLine: `Skills and Projects. Nothing else.`,
          })} />
        );
        break;

      // ── B05 — SKILLS (ClaudeComposerAsk, ASK beat) ───────────────────────
      case 'B05':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Watch this,`,
            topic: TOPIC,
            segment: SEGMENT,
            command: `/linkedin-post turn today's launch notes into a post in my voice`,
            runningText: `running the skill…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B06 — INSIDE-A-SKILL (ClaudeCodeBeat, RESULT beat) ───────────────
      case 'B06':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `linkedin-post/SKILL.md — a skill is just a file`,
            code: `---\nname: linkedin-post\ndescription: >\n  Turn notes or a link into a LinkedIn post in my\n  voice. Use when I type /linkedin-post or ask for\n  a LinkedIn draft.\n---\n\n# Voice: first person, one idea, a hook up top.\n# Ban: hashtags, emoji, 'in today's world'.\n# End on a question that invites a reply.`,
            sparkLine: `A skill is judgment, written once.`,
          })} />
        );
        break;

      // ── B07 — PROJECTS (SLOT — production slate) ─────────────────────────
      case 'B07':
        content = (
          <SlateBeat
            beatId="B07"
            narration={`Then Projects. A project is a place you go, not a file you carry. Your files and instructions stay loaded, it remembers across sessions, and you share the one place with your team.`}
            slotNote="fill media/B07.png (shared Project: left-menu, files+instructions, share/collaborators visible)"
            sparkLine={`A project is a place you go.`}
          />
        );
        break;

      // ── B08 — VERDICT (ClaudeWindow artifact, one-page teardown) ─────────
      case 'B08':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Cowork, set up — one page`,
            artifactHeading: `The twenty-minute setup`,
            artifactLines: [
              `Solo → folders are fine. Team → drop them.`,
              `Skills = the capabilities you repeat, called by slash, portable anywhere.`,
              `Projects = one shared, persistent place your team works from.`,
              `Model: Opus for hard tasks (Fable when available). Block 20 min, build one Skill.`,
            ],
            sparkLine: `Set it up in twenty minutes.`,
          })} />
        );
        break;

      // ── B09 — HANDOFF (ClaudeComposerAsk, "Your turn." greeting) ─────────
      case 'B09':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: TOPIC,
            segment: SEGMENT,
            command: `/skill-creator take the task I redo most each week and turn it into a Skill, then tell me how to load it into a shared Project for my team.`,
            runningText: `paste this into Cowork…`,
            folderLabel: FOLDER,
          })} />
        );
        break;

      // ── B10 — OUTRO (ClaudeTitleOutro, title-restate) ────────────────────
      case 'B10':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Claude Cowork, set up.`,
            handle: `@NikBearBrown`,
            subline: `Skills to call · Projects to share · build one this week`,
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
