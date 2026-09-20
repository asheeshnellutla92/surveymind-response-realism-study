import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './claude-roadmap-timing.json';
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

export const ClaudeRoadmap: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Shalom, Liam`,
            topic: `RUBEN · CLAUDE READING ORDER`,
            segment: `Claude 101.`,
            command: `Ruben wrote 21 guides on Claude. Which ones still matter, and in what order?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Claude 101 — the seven guides`,
            artifactHeading: `Reading order + time estimates`,
            artifactLines: [`#1 Claude For Dummies — 5 min. Never tried Claude? Start here.`,
              `#2 Claude basics — 9-10 min. What Claude can actually do.`,
              `#3 Claude Cowork — 20 min. His best newsletter. Multiagent for non-coders.`,
              `#4-7: Skills (15 min), Voice training, Free certification, Anti-AI writing.`],
            sparkLine: `Seven guides. One week.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Why the old guides are wrong`,
            artifactHeading: `The update cycle problem`,
            artifactLines: [`Claude ships new models every few months. Guides written for 4.6 are wrong on 4.7.`,
              `Cowork's interface changed — the folder setup that worked in January breaks in March.`,
              `Ruben's two most-shared pieces (20M views combined): he tells you not to read them.`,
              `The Claude 101 syllabus = the seven that are still accurate as of today.`],
            sparkLine: `Twenty million views. Now outdated.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <SlateBeat
            beatId={`B03`}
            narration={`Ruben flags one guide that's not on the official seven list but should be on yours: the Claude Code newsletter, which he calls vibecoding. He built claude101.com using Claude Code — a website, hosted, with real functionality, zero coding knowledge required. Vibecoding is describing what you want in plain English and letting Claude write every line of code. The guide he links is outdated, but the concept is the fastest-moving part of the Claude ecosystem right now.`}
            slotNote={`SLOT — fill media/B03.png (screenshot of claude101.com homepage — Ruben's vibecoded website, or screenshot of the Claude Code tab in the desktop app)`}
            sparkLine={`Claude Code is missing.`}
          />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The actual action items`,
            artifactHeading: `What Ruben wants you to do`,
            artifactLines: [`Save the guide. Don't read all seven right now — pick one this week.`,
              `Block 20 minutes. Calendar it. Otherwise it doesn't happen.`,
              `Start with #1 (Claude For Dummies) if you've never run a Claude session.`,
              `Start with #3 (Cowork) if you already know the basics.`],
            sparkLine: `One guide. Twenty minutes.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Which guides age well vs. badly`,
            artifactHeading: `How to use this syllabus`,
            artifactLines: [`Ages well: Cowork concepts, Skills logic, voice training, anti-AI writing.`,
              `Ages fast: anything with UI screenshots or model-selector steps.`,
              `Rule: conceptual guides last. Setup guides go stale with every Claude release.`,
              `Treat the list as orientation — not gospel. Update your mental model as Claude ships.`],
            sparkLine: `Concepts last. UI guides decay.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · CLAUDE READING ORDER`,
            segment: `Claude 101.`,
            command: `I just read Ruben Hassid's guide on [Cowork / Skills / Claude basics]. Walk me through the setup hands-on. Ask me what I've already done so we start in the right place.`,
            runningText: `paste this into Claude...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Claude 101.`,
            handle: `@NikBearBrown`,
            subline: `Seven guides. Pick one today.`,
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
