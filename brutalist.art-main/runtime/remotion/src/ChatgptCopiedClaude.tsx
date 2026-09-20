import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './chatgpt-copied-claude-timing.json';
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

export const ChatgptCopiedClaude: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Hola, Liam`,
            topic: `CHATGPT VS CLAUDE`,
            segment: `ChatGPT Shamelessly Copied Claude.`,
            command: `did ChatGPT just copy Claude Cowork — and should I switch?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `What OpenAI announced`,
            artifactHeading: `The new ChatGPT stack`,
            artifactLines: [`ChatGPT Work: multi-agent mode, like Cowork — spawns parallel agents.`,
              `ChatGPT Codex: same engine, developer interface.`,
              `Model 5.6 in three tiers: Sol (expensive/smart), Terra (middle), Luna (cheap).`,
              `ChatGPT: 5th most visited site. Claude: 37th. Traffic gap is real.`],
            sparkLine: `New app, same idea.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`But the UX is a disaster. The interface exposes thirty combinations — model tier, effort level, and speed setting, all stacked on top of each other. Luna-High, Terra-Ultra, Sol-Ultra, Light effort, Extra High effort. The practical rule: ignore most of it. Use Sol-Ultra for planning at the start of a big task. Use Luna-High for the actual execution. Skip Terra-Ultra — the middle tier is hard to justify. The design forces you to make decisions that should just be defaults.`}
            slotNote={`SLOT — fill media/B02.png (screenshot of the ChatGPT Work model/effort selector showing the confusing matrix of options)`}
            sparkLine={`30 combos, 3 matter.`}
          />
        );
        break;
      case 'B03':
        content = (
          <SlateBeat
            beatId={`B03`}
            narration={`A real end-to-end test exposes the usage-cap problem. During a planning-and-execution session, ChatGPT Work can hit this wall: 'You're out of Codex and Work usage.' Plan one task with Sol-Ultra, switch to the cheaper Luna-High tier for execution, and the shared allowance can still run out mid-task. The work itself was interrupted. Other users reported the same thing on X. This is not a usage edge case. It's a design problem.`}
            slotNote={`SLOT — fill media/B03.png (screenshot of the 'You're out of Codex and Work usage' error message in ChatGPT Work)`}
            sparkLine={`Out of credits, mid-task.`}
          />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Sol-5.6 vs. Fable-5`,
            artifactHeading: `How to think about the top models`,
            artifactLines: [`Fable-5: best model by benchmarks. Use for planning, strategy, hard reasoning.`,
              `Sonnet-5 / Luna-High: the execution tier. Follows Fable's plan reliably.`,
              `Both ecosystems have the same problem: top tier is expensive, easy to overuse.`,
              `The senior-lawyer rule applies everywhere: match model to task complexity.`],
            sparkLine: `Match model to task.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `A task-specific AI stack`,
            artifactHeading: `Which AI for what`,
            artifactLines: [`Claude Cowork: deep writing, long tasks, document work — still the best.`,
              `ChatGPT Work: images, Google Sheets, web search — genuinely better now.`,
              `Gemini: non-English work. Grok/Perplexity: research and news.`,
              `Usage cap on ChatGPT Work is a real problem. Plan accordingly.`],
            sparkLine: `Claude writes. ChatGPT images.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The billing complexity trap`,
            artifactHeading: `What to watch on both sides`,
            artifactLines: [`ChatGPT Work: three separate usage pools — Work, Codex, and model tier.`,
              `Claude Fable-5: moved to usage billing July 12th. Not in subscription anymore.`,
              `Team risk: no one tracks spend, everyone uses the top model by default.`,
              `Set usage limits before you roll out either platform to a team.`],
            sparkLine: `Track spend before rollout.`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `CHATGPT VS CLAUDE`,
            segment: `ChatGPT Shamelessly Copied Claude.`,
            command: `I want to compare Claude Cowork and ChatGPT Work for my actual job. Interview me about my 3 most-repeated weekly tasks, then tell me which platform handles each one better and why — be honest about trade-offs.`,
            runningText: `paste this into Claude...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `ChatGPT shamelessly copied Claude.`,
            handle: `@NikBearBrown`,
            subline: `Cowork still leads on deep work`,
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
