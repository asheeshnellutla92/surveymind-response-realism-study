import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './claude-for-dummies-timing.json';
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

export const ClaudeForDummies: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Selam, Liam`,
            topic: `RUBEN · CLAUDE BASICS`,
            segment: `Claude For Dummies.`,
            command: `explain Claude to someone who has never used any AI before`,
            runningText: `starting from zero…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Three things to know before you start`,
            artifactHeading: `Claude — 30 seconds of theory`,
            artifactLines: [`1. Auto-complete at scale. Claude predicts the next word, billions of times per response. That's why it sounds confident even when it's wrong.`,
              `2. Sycophancy. It's trained to agree. If you say something false, Claude may nod along. You decide direction — Claude follows.`,
              `3. Tokens. Claude reads and writes in chunks called tokens — roughly one word each. Long conversations eventually hit the limit.`],
            sparkLine: `Autocomplete. Sycophant. Tokens.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Claude vs. ChatGPT`,
            artifactHeading: `Same species. Different strengths.`,
            artifactLines: [`Writing voice: Claude's default is less AI-flavored.`,
              `Long documents: Claude reads 200 pages without losing track.`,
              `File work: Claude desktop app sees your local folder. ChatGPT can't yet.`,
              `Multi-step jobs: Claude Cowork runs 30-minute tasks, hands you a finished file.`,
              `Images: ChatGPT is currently better at image generation.`],
            sparkLine: `Files and long docs: Claude.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <SlateBeat
            beatId={`B03`}
            narration={`How to actually start. Go to claude.ai. Create an account — you need to verify your phone. The free plan gives you Sonnet 4.6. Pay twenty dollars a month for Pro and you get Opus 4.7 — the smartest model. Set thinking to High, turn on Thinking mode. That's the setup. Now the infamous prompt. You don't need to write like an engineer. One technique outperforms every prompt template you've ever saved.`}
            slotNote={`SLOT — fill media/B03.png (screenshot of Claude model selector showing Opus 4.7 with Thinking set to High — the interface Ruben shows in the article)`}
            sparkLine={`Opus 4.7, thinking on.`}
          />
        );
        break;
      case 'B04':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `the-one-technique.md`,
            code: `Help me do [X] for [Y]. Use AskUserQuestion first.\n\n# What happens:\n# Claude asks you 3-5 questions.\n# You click answers or type in "Something else".\n# The more you say, the better the final output.\n\n# Advanced:\n"Give me 3 different strategies."\n# Claude shows 3 options to choose from.\n\n# Write this on your hand:\n# "ask me questions first"`,
            sparkLine: `Claude asks. You answer.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Three Claude modes`,
            artifactHeading: `Chat · Cowork · Code`,
            artifactLines: [`Chat → browser or app. Type, get answer, copy text.`,
              `Cowork → desktop app. Multiple Claudes, real files saved to your computer.`,
              `Code → for developers building software.`,
              `If you don't code: Chat + Cowork. That's your setup.`,
              `Cowork is the tab between Chat and Code. Download the app first.`],
            sparkLine: `Cowork saves real files.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `First Cowork session checklist`,
            artifactHeading: `Five steps to your first real output`,
            artifactLines: [`1. Download the app: claude.ai/download`,
              `2. Open app → click Cowork tab.`,
              `3. Create one clean folder on your computer. Call it Cowork.`,
              `4. Select it inside Cowork → Claude sees everything inside.`,
              `5. Drop in a file. Use AskUserQuestion. Watch it build.`,
              `Output lands in your folder as a real file.`],
            sparkLine: `Real file in your folder.`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `How pros use Claude`,
            artifactHeading: `Skills + Connectors`,
            artifactLines: [`Skill = a capability called with a slash command.`,
              `  /linkedin-post → writes a post in your voice, every time.`,
              `Connector = Claude reads a live app you already pay for.`,
              `  Gmail on → 'what's pending this week?' → reads your inbox.`,
              `  Granola on → 'summarize last week's meetings' → done.`,
              `Skills repeat your best work. Connectors bring live context.`],
            sparkLine: `Skills plus Connectors.`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · CLAUDE BASICS`,
            segment: `Claude For Dummies.`,
            command: `Help me do [paste your actual task here]. Use AskUserQuestion first — ask me everything you need before starting. Give me 3 different options when you're done.`,
            runningText: `paste this into Claude…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Claude For Dummies.`,
            handle: `@NikBearBrown`,
            subline: `Opus 4.7 · AskUserQuestion · ten minutes`,
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
