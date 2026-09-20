import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './everyone-wants-one-ai-timing.json';
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

export const EveryoneWantsOneAi: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Bula, Liam`,
            topic: `RUBEN · AI STACK`,
            segment: `ChatGPT-5.5 or Claude 4.7?`,
            command: `which AI should I actually be using right now?`,
            runningText: `comparing the current stack…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The one decision rule`,
            artifactHeading: `Follow the enterprise contract`,
            artifactLines: [`Company pays for Claude Enterprise → use Claude properly.`,
              `Company pays for ChatGPT Enterprise → use ChatGPT properly.`,
              `Can afford both → pay for both.`,
              `Don't write in English → Gemini often wins on benchmarks.`,
              `Real benchmark: test on your actual work, not someone's chart.`],
            sparkLine: `Follow enterprise money.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `ruben-master-prompt.md`,
            code: `I want to do [TASK] for [SUCCESS CRITERIA].\n\nBut first, read my folder and use AskUserQuestion.\n\n# What AskUserQuestion does:\n# Claude prompts YOU instead of guessing.\n# You click answers. Claude gets the context it needs.\n# Result: better output, fewer revisions.`,
            sparkLine: `Context beats magic prompts.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <SlateBeat
            beatId={`B03`}
            narration={`Then that April week happened. ChatGPT released what Ruben calls the best image generation he's seen from any AI. Not just stylistically — functionally. Edit in context, compose accurately, follow complex prompts. Then Google Sheets integration. Then improved search. Three days of releases that genuinely moved Ruben's stack. He hadn't opened ChatGPT in months. Now it's back for a specific slice of his work.`}
            slotNote={`SLOT — fill media/B03.png (screenshot of a ChatGPT image generation example from the article period, or the Ruben stack comparison graphic)`}
            sparkLine={`Three days, stack changed.`}
          />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Ruben's current AI stack`,
            artifactHeading: `April 2026 — honest version`,
            artifactLines: [`Claude Cowork → writing, analysis, long docs, contracts.`,
              `ChatGPT-5.5 → images, search, Google Sheets.`,
              `Gemini → non-English work.`,
              `Gamma → presentations.`,
              `Not forever. The market ships every week.`],
            sparkLine: `Four tools, clear jobs.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Two decision exits`,
            artifactHeading: `Stop reading here if one fits`,
            artifactLines: [`Most of your job is writing → Claude Cowork, still king.`,
              `You need images, search, or Google Sheets → new ChatGPT.`,
              `Both matter to you → pay for both, use each for its lane.`,
              `Still unsure → test both on your actual work this week.`],
            sparkLine: `Writing or images. Pick.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · AI STACK`,
            segment: `ChatGPT-5.5 or Claude 4.7?`,
            command: `I want to test Claude vs ChatGPT on my actual work. Take the task I describe, complete it fully, then tell me what context or file you'd need to do this consistently — so I can build a setup that runs this every week.`,
            runningText: `paste this into Claude Cowork…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `ChatGPT-5.5 or Claude 4.7?`,
            handle: `@NikBearBrown`,
            subline: `right tool · right task · test it`,
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
