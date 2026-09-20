import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './how-to-rot-your-brain-with-ai-timing.json';
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

export const HowToRotYourBrainWithAi: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Konnichiwa, Liam`,
            topic: `RUBEN · BRAIN ROT`,
            segment: `How to outsource everything to AI & get dumb:`,
            command: `how do I use AI without letting it make me dumb?`,
            runningText: `thinking about thinking…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `How most people use AI (brain rot edition)`,
            artifactHeading: `The outsourcing trap`,
            artifactLines: [`Face problem → open Claude → paste it in → hope it understands.`,
              `Claude produces something. You ship it. The client isn't happy.`,
              `You fix it. You cross-check every formula. You rewrote the email 3 times.`,
              `You saved time by using AI. You wasted time fixing AI.`],
            sparkLine: `Saved time, wasted time.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The one line you can't cross`,
            artifactHeading: `Outsource work. Keep understanding.`,
            artifactLines: [`✓ Outsource: writing, formatting, first drafts, synthesis.`,
              `✗ Outsource: deciding what the goal is.`,
              `✗ Outsource: knowing whether the output is right.`,
              `Clear intent in → useful output out. Vague hope in → AI slop out.`],
            sparkLine: `Work yes. Understanding no.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <SlateBeat
            beatId={`B03`}
            narration={`Here's Ruben's real-life scenario. He got on a call with a Chief of Staff at a two-hundred-forty-person company. Twenty-five minutes in she said: I need to roll out Claude across the whole org — help me sell you internally. By Friday she needed three things: a ninety-day adoption roadmap, a one-page pricing breakdown, and an email she could send her exec team. Her credibility partially on the line.`}
            slotNote={`SLOT — fill media/B03.png (screenshot of Ruben's article showing the Chief of Staff scenario or his five-step method diagram)`}
            sparkLine={`Context before prompt.`}
          />
        );
        break;
      case 'B04':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `no-brain-rot-method.md`,
            code: `# 5 Steps to outsource work, not thinking\n\n1. Write your constraints before opening Claude.\n   (output format, audience, what can't be in it)\n\n2. Write a rough draft — even a bad one.\n\n3. Paste: draft + constraints → Claude.\n\n4. Ask for 3 versions.\n\n5. Pick one. Edit it. That's yours.`,
            sparkLine: `Draft first, then Claude.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Three domains, same method`,
            artifactHeading: `Where the method runs`,
            artifactLines: [`Strategy doc → write goals and constraints → Claude drafts → you edit.`,
              `Executive email → write the one point that must land → Claude writes the words.`,
              `Spreadsheet → list assumptions for Claude to sanity-check → Claude builds.`],
            sparkLine: `Intent first, always.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <SlateBeat
            beatId={`B06`}
            narration={`The trap is subtle. The brain rot doesn't feel like getting dumb. It feels like getting fast. You're shipping things faster, answering faster, producing more. But when someone asks you to explain the reasoning behind the document — you can't. You used AI to think so you don't have to. And the first time AI isn't available, or the client pushes back, you realize you don't know the terrain anymore.`}
            slotNote={`SLOT — fill media/B06.png (Ruben's diagram or quote card from the article about the difference between outsourcing work vs. understanding)`}
            sparkLine={`Fast feels fine. Until it doesn't.`}
          />
        );
        break;
      case 'B07':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · BRAIN ROT`,
            segment: `How to outsource everything to AI & get dumb:`,
            command: `Here is my rough draft and my constraints: [paste draft] [paste constraints: audience, format, what can't be in it]. Give me 3 improved versions. Keep my core point. Don't change my voice.`,
            runningText: `paste this into Claude…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `How to outsource everything to AI & get dumb:`,
            handle: `@NikBearBrown`,
            subline: `Draft first. Claude improves. You decide.`,
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
