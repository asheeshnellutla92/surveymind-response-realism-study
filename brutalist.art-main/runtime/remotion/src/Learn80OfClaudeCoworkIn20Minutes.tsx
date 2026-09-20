import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './learn-80-of-claude-cowork-in-20-minutes-timing.json';
import { ClaudeComposerAsk, claudeComposerAskSchema } from './scenes/ClaudeComposerAsk';
import { ClaudeCodeBeat, claudeCodeBeatSchema } from './scenes/ClaudeCodeBeat';
import { ClaudeWindow, claudeWindowSchema } from './scenes/ClaudeWindow';
import { ClaudeTitleOutro, claudeTitleOutroSchema } from './scenes/ClaudeTitleOutro';
import { CLAUDE, CLAUDE_FONT } from './tokens/claude';

const SERIF = CLAUDE_FONT.serif;
const SANS  = CLAUDE_FONT.ui;

const SlateBeat: React.FC<{
  beatId: string; narration: string; slotNote: string; sparkLine: string;
}> = ({ beatId, narration, slotNote, sparkLine }) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const cardIn = spring({ frame, fps, config: { damping: 28, stiffness: 140, mass: 0.8 } });
  const sparkIn = spring({ frame: frame - 20, fps, config: { damping: 28, stiffness: 140, mass: 0.8 } });
  const cl = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  return (
    <AbsoluteFill style={{
      background: '#2F2A26', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', padding: '0 10%',
    }}>
      <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: 3,
        textTransform: 'uppercase' as const, color: CLAUDE.SPARK,
        opacity: cl(cardIn, 0, 1), marginBottom: 24 }}>
        SLOT — {beatId} · production media pending
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 108, fontWeight: 700, color: '#F3EBDD',
        letterSpacing: '-0.03em', lineHeight: 1,
        opacity: cl(cardIn, 0, 1), transform: `scale(${cl(cardIn, 0, 1)})` }}>
        {beatId}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 22, color: '#F3EBDD', textAlign: 'center',
        lineHeight: 1.5, marginTop: 28, maxWidth: 780, opacity: cl(cardIn * 0.9, 0, 1) }}>
        {narration}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 15, color: CLAUDE.SPARK, marginTop: 20,
        textAlign: 'center', maxWidth: 680, opacity: cl(cardIn * 0.8, 0, 1) }}>
        PIPELINE → {slotNote}
      </div>
      <div style={{ position: 'absolute', bottom: '6%', left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, opacity: cl(sparkIn, 0, 1) }}>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', color: '#F3EBDD' }}>
          {sparkLine}
        </span>
      </div>
    </AbsoluteFill>
  );
};

const TIMED = TIMING.map((t) => ({ ...t }));
export const TOTAL_FRAMES = TIMED.reduce((a, b) => a + b.frames, 0);

export const Learn80OfClaudeCoworkIn20Minutes: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Bonjour, Liam`,
            topic: `RUBEN · COWORK SETUP`,
            segment: `How to Set Up Claude Cowork.`,
            command: `how do I actually set up Claude Cowork so it works for me and my team?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <SlateBeat
            beatId={`B01`}
            narration={`Start from zero. Cowork lives in the Claude desktop app, in the tab between Chat and Code. You need a Pro account — twenty dollars a month minimum, Ruben pays a hundred. The core difference from regular Claude: Cowork doesn't give you one answer. It spawns multiple Claudes to plan, search, and build in parallel. One prompt can run for thirty minutes. It makes the actual file — the real PDF, the real spreadsheet — and saves it to your computer. That's the whole thing. Many Claudes, one output, on your disk.`}
            slotNote={`SLOT — fill media/B01.png (screenshot of the Claude desktop app with the Cowork tab visible and active, showing the tab layout between Chat and Code)`}
            sparkLine={`Many Claudes, one output.`}
          />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`Here's the setup Ruben taught for months — and the one half of LinkedIn copied. A folder on your computer. Inside it: an about-me file with your personal context, an output folder for Cowork's deliverables. You point Cowork to that folder when you start a session and it reads everything before answering. It works. Ruben used it. He had twenty million people follow along. And then he ran workshops with enterprise teams — hundreds of people — and the setup fell apart.`}
            slotNote={`SLOT — fill media/B02.png (screenshot of the old Cowork folder structure — about-me files and output files inside a computer folder, or the Cowork folder picker)`}
            sparkLine={`The folder setup that broke.`}
          />
        );
        break;
      case 'B03':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Why folders fail on teams`,
            artifactHeading: `Two failure modes`,
            artifactLines: [`Folders leak — old outputs sneak into context even when you say not to read them.`,
              `Files rot — about-me files need maintenance nobody actually does.`,
              `Solo: you survive both. Team: both failures multiply across every user.`,
              `The architecture is fine for one. It breaks the moment you share.`],
            sparkLine: `Folders leak. Files rot.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The two-thing setup`,
            artifactHeading: `Skills + Projects — nothing else`,
            artifactLines: [`Skill: a slash-command capability. Write once, call anywhere, portable.`,
              `Project: a persistent workspace. Files + instructions stay loaded. Team-shareable.`,
              `No about-me files to maintain. No output folders to accidentally read.`,
              `Solo: folders are still fine. Team: drop them entirely.`],
            sparkLine: `Call a skill. Go to a project.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `example-skill/SKILL.md`,
            code: `---\nname: weekly-brief\ndescription: >\n  Turn raw notes or a Granola transcript into a\n  structured weekly brief. Use when I type /weekly-brief\n  or ask for a brief from meeting notes.\n---\n\n# Format: three sections — Done, Decisions, Next.\n# Length: under one page. No bullets longer than 15 words.\n# Tone: direct. No 'in today's world'. No 'leverage'.`,
            sparkLine: `Judgment written once, reused always.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <SlateBeat
            beatId={`B06`}
            narration={`A Project is where the persistent context lives. You create it from the left sidebar, add files — your company overview, your brand voice, a reference doc — and write custom instructions for that workspace. From then on, every session inside that Project starts with all of it pre-loaded. You don't re-upload anything. Your team members join the Project and get the same context. This is how enterprises run it: one shared Project, specific Skills mapped to recurring tasks, Opus or Fable for complex turns, Sonnet for routine execution.`}
            slotNote={`SLOT — fill media/B06.png (screenshot of a Claude Project showing the left-sidebar Projects menu, the files and custom instructions panel, and the share/collaborators control)`}
            sparkLine={`Shared project, shared context.`}
          />
        );
        break;
      case 'B07':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Model selection in Cowork`,
            artifactHeading: `Which model, when`,
            artifactLines: [`Opus + Adaptive thinking: Ruben's default. Good for anything complex.`,
              `Fable-5: use when available, for high-stakes planning and hard reasoning.`,
              `Sonnet: routine execution, drafts, formatting — most of what you actually do.`,
              `Selector is bottom-right in Cowork. Change it per task, not per session.`],
            sparkLine: `Opus default. Fable for stakes.`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · COWORK SETUP`,
            segment: `How to Set Up Claude Cowork.`,
            command: `I want to build my first Claude Skill from my most-repeated weekly task. Ask me 5 questions to understand the task, then write me a complete SKILL.md file I can load directly into Claude. End with one sentence on which Project to put it in.`,
            runningText: `paste this into Cowork...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `How to set up Claude Cowork.`,
            handle: `@NikBearBrown`,
            subline: `Skills to call · Projects to share`,
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
  return <AbsoluteFill style={{ background: CLAUDE.PAGE }}>{seqs}</AbsoluteFill>;
};
