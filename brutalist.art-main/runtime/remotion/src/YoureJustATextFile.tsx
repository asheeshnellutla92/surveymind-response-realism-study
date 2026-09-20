import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './youre-just-a-text-file-timing.json';
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

export const YoureJustATextFile: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Privet, Liam`,
            topic: `RUBEN · VOICE CLONING`,
            segment: `I can be you.`,
            command: `how do I train Claude to write exactly like me?`,
            runningText: `extracting voice patterns…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <SlateBeat
            beatId={`B01`}
            narration={`Ruben is a professional writer — 500,000 readers a week, 20 years of craft, living proof that voice is a thing you build over decades. And he's the one saying: upload me to Claude, and Claude sounds exactly like me. He's not selling this as impressive. He's slightly bothered by it. That's the tell. If the person with the most to lose from voice commoditization is calling it inevitable, you should believe him.`}
            slotNote={`SLOT — fill media/B01.png (screenshot of Ruben's Claude output that 'sounds like him' — the newsletter example he shares in the article)`}
            sparkLine={`Professional writer, bothered.`}
          />
        );
        break;
      case 'B02':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `What goes in the voice file`,
            artifactHeading: `100 questions across 6 categories`,
            artifactLines: [`Beliefs & contrarian takes — what you'd defend to the death.`,
              `Writing mechanics — sentence structure, how you open and close, punctuation.`,
              `Aesthetic crimes — what makes you cringe in other people's writing.`,
              `Voice & personality — humor, tone, how you handle disagreement.`,
              `Reference points — the people, books, phrases that shaped your thinking.`,
              `Anti-patterns — what you'd never write, words you'd never use.`],
            sparkLine: `Patterns, not biography.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `prompt-1-interview.md`,
            code: `You are a Taste Interviewer — a relentless interviewer\nwhose job is to extract the DNA of how I think, write,\nand see the world.\n\nYour goal: create a document so precise that another\nClaude instance could write and think exactly like me.\n\nYou're not here to be polite. You're here to get the\ntruth. Conduct 100 questions across: beliefs, writing\nmechanics, aesthetic crimes, voice & personality,\nreference points, and anti-patterns.\n\nFollow interesting threads. Don't stop at comfortable.`,
            sparkLine: `Relentless, not polite.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The compression step`,
            artifactHeading: `Prompt 2 — distill to one file`,
            artifactLines: [`Take all 100 answers. Extract the repeating patterns.`,
              `Write a dense voice document: how I open, how I close,`,
              `the words I use, the words I'd never use, my hot takes.`,
              `Output: one file I can upload into any AI, anywhere.`,
              `This is not a bio. It's a behavioral fingerprint.`],
            sparkLine: `One file, full voice.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Setup checklist`,
            artifactHeading: `Before you start the interview`,
            artifactLines: [`Claude desktop app → Cowork tab.`,
              `Model: Opus 4.7. Thinking: Extended.`,
              `Voice input: Wispr Flow (free) — talk, don't type.`,
              `Block 2 hours. No interruptions.`,
              `Answer fast. First instinct over polished answer.`],
            sparkLine: `Talk, don't type.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `What you get after two hours`,
            artifactHeading: `The file does three things`,
            artifactLines: [`First drafts in your voice — before you've thought of the sentence.`,
              `Catches your patterns — the ones you didn't know were patterns.`,
              `Travels anywhere — Claude, ChatGPT, Gemini, whatever ships next.`],
            sparkLine: `Drafts before you think.`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · VOICE CLONING`,
            segment: `I can be you.`,
            command: `Act as a Taste Interviewer. Run a 100-question interview to extract my voice, writing mechanics, beliefs, aesthetic crimes, and anti-patterns. Then compress everything into one voice document I can upload into any AI. Start with question one.`,
            runningText: `paste this into Claude Cowork…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `I can be you.`,
            handle: `@NikBearBrown`,
            subline: `two hours · one file · your voice`,
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
