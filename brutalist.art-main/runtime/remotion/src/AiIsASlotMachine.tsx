import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './ai-is-a-slot-machine-timing.json';
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

export const AiIsASlotMachine: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Salaam, Liam`,
            topic: `RUBEN · FIVE STAGES OF AI`,
            segment: `AI Is A Slot Machine.`,
            command: `What are the five stages of AI adoption, and how do I get to stage five?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Five stages — where do you fall?`,
            artifactHeading: `Kübler-Ross meets AI adoption`,
            artifactLines: [`Stage 1 Denial: 'AI is overhyped.' — One bad answer. Stopped there.`,
              `Stage 2 Anger: 'Look at this stupid answer ChatGPT gave me.'`,
              `Stage 3 Bargaining: 'I just need the perfect prompt.' ← Most people live here.`,
              `Stage 4 Depression: '6 hours. Nothing.' | Stage 5: Generate 100. Pick the best.`],
            sparkLine: `Five stages. Most stop at three.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `Stage 1 exit — ask for options`,
            code: `BAD: Write me an email to reschedule the meeting.\n\nGOOD: Give me 3 different angles on this email\nto reschedule the meeting with [contact].\nFor each: a different tone, a different opening line.\nSuccess criteria: they say yes.`,
            sparkLine: `Ask for three, not one.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `Stage 2 exit — call out the miss`,
            code: `BAD: [close the tab, post angry screenshot]\n\nGOOD: You missed the point. I meant to [call out\nthe specific mistake].\n\nI want to make sure you understood.\nSo ask me clarifying questions.`,
            sparkLine: `Call out the miss. Follow up.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Stage 3 exit — volume over precision`,
            artifactHeading: `The AI gambler's playbook`,
            artifactLines: [`Stop optimizing one prompt. Start generating batches.`,
              `Ask for 5 options instead of 1. Regenerate the weak sections.`,
              `The best output is already in the batch — you have to pull enough times.`,
              `Stage 5 means: 100 outputs, pick the best, done. That's the whole game.`],
            sparkLine: `Volume beats the perfect prompt.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Stage 4 exit + Stage 5 mindset`,
            artifactHeading: `From depression to gambler`,
            artifactLines: [`Stage 4: 6 hours, nothing. Exit: stop chasing one great output.`,
              `Stage 5: generate 100, keep 5, discard 95. That's the ratio.`,
              `A bad output isn't failure — it's a pull that didn't hit. Next.`,
              `The gambler has no attachment to any single output. That's the unlock.`],
            sparkLine: `Bad output is just a miss.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · FIVE STAGES OF AI`,
            segment: `AI Is A Slot Machine.`,
            command: `Give me 5 different versions of [the thing I've been procrastinating on — email / outline / proposal / draft]. Each one should take a different angle. I'll pick the best and we'll refine from there.`,
            runningText: `paste this into Claude...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `AI is a slot machine.`,
            handle: `@NikBearBrown`,
            subline: `Generate more. Pick the best.`,
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
