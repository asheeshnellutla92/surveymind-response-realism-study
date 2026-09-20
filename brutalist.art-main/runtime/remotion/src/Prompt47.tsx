import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './prompt-47-timing.json';
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

export const Prompt47: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Aloha, Liam`,
            topic: `RUBEN · PROMPTING`,
            segment: `Prompt 4.7`,
            command: `how is prompting Opus 4.7 different from the old Claude, in plain English?`,
            runningText: `reading the 31-page PDF so you don't have to…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Old Claude vs. New Claude (4.7)`,
            artifactHeading: `The one rule that changes everything`,
            artifactLines: [`4.6: read between the lines, filled in what you meant.`,
              `4.7: does exactly what you typed. No more, no less.`,
              `Vague prompt → vague result, every time, with precision.`,
              `Fix: name every output, name the order, name the format.`],
            sparkLine: `Name everything now.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `prompt-47-rules.md`,
            code: `# 4 rules for Claude 4.7\n\n1. Scope: name every output + order + boundaries.\n   Old: Review this contract.\n   New: Flag risks per clause. Rate severity 1-5.\n        Suggest one rewrite. Return as a table.\n\n2. Length: be explicit.\n   Old: Summarize this report.\n   New: Exactly 5 bullets. Each under 15 words.\n\n3. Positive only: say what TO do.\n   Old: Don't use jargon.\n   New: Plain English a 16-year-old reads aloud.\n\n4. Action verbs: each one ships something.`,
            sparkLine: `Scope, length, positive, verbs.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Rules 5–7 for Claude 4.7`,
            artifactHeading: `Tools, tone, and creative range`,
            artifactLines: [`5. Tools: if you need web search, say so explicitly.`,
              `6. Tone: 4.7 is direct by default. Add warmth instructions if needed.`,
              `7. Creative tasks: add 'go beyond the basics' to unlock the model.`],
            sparkLine: `Explicit beats assumed.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `email-action-prompt.md`,
            code: `Go to my Gmail.\nFind [contact] and read our last conversation.\nWrite the answer email. Final draft. Send-ready.\nGoal: book a meeting with the CRO of Snowflake\nby Friday.\nLength: under 90 words.\nTone: confident, casual, specific.`,
            sparkLine: `A prompt that ships.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <SlateBeat
            beatId={`B05`}
            narration={`Quick reminder on where to access 4.7. In the Claude app, bottom right corner of the message box, you'll see the model picker. Select Opus 4.7. Then turn on Adaptive thinking. That's the model behind the thirty-one-page prompting guide. You don't need to read the guide. You just read this.`}
            slotNote={`SLOT — fill media/B05.png (screenshot: Claude app model picker showing Opus 4.7 selected with Adaptive thinking toggle turned on)`}
            sparkLine={`Opus 4.7, Adaptive thinking.`}
          />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · PROMPTING`,
            segment: `Prompt 4.7`,
            command: `Here is a prompt I use regularly: [paste your prompt]. Rewrite it for Claude Opus 4.7 using these rules: name every output, define length, use positive instructions only, use action verbs, and add explicit tone instructions. Return old vs. new side by side.`,
            runningText: `paste this into Claude 4.7…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Prompt 4.7`,
            handle: `@NikBearBrown`,
            subline: `Seven rules, better results, every time`,
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
