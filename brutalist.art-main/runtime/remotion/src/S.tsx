import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './s-timing.json';
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

export const S: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Merhaba, Liam`,
            topic: `RUBEN · AI IN FOUR LEVELS`,
            segment: `Being Good At AI Is (Stupidly) Simple`,
            command: `What are Ruben's four levels of AI fluency, and what separates each one?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Level 1 — Pick the right model`,
            artifactHeading: `Three steps to start right`,
            artifactLines: [`Go to claude.ai → create account → verify phone.`,
              `Bottom-right corner: model selector. Free = Sonnet. You want Opus.`,
              `Set Thinking to High. Turn on Thinking mode.`,
              `Then use AskUserQuestion: 'Help me do [X]. Use AskUserQuestion first.'`],
            sparkLine: `Opus plus Thinking first.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`The trick Ruben buries inside level one is the move that makes you a power user: AskUserQuestion. You don't prompt Claude. You ask Claude to prompt you instead. The formula is dead simple — Help me do X for Y, use AskUserQuestion first. Claude comes back with three to five targeted questions. You answer them. Then the output is dramatically better than anything you'd get from a cold one-shot prompt. Ruben says write it on your hand. He's not joking.`}
            slotNote={`SLOT — fill media/B02.png (screenshot of Claude using AskUserQuestion — showing the question interface with clickable answer options and 'Something else' text box)`}
            sparkLine={`Claude asks you instead.`}
          />
        );
        break;
      case 'B03':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Level 2 — Talk to your computer`,
            artifactHeading: `Voice input changes the math`,
            artifactLines: [`You speak 4x faster than you type. Use that.`,
              `Wispr Flow: free, AI-powered, works inside any text box including Claude.`,
              `Talk → Wispr transcribes → Claude receives a fuller, faster prompt.`,
              `This alone moves you past most AI users.`],
            sparkLine: `Talk four times faster.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <SlateBeat
            beatId={`B04`}
            narration={`Level three is Claude Cowork — the desktop app, not the browser. The distinction matters. Browser Claude gives you text back, and you copy-paste it somewhere. Cowork creates the actual file and saves it to your computer. The real PDF. The real spreadsheet. You point Cowork at one folder, drop in a messy document or last month's numbers, and then prompt: build me a spreadsheet to do X, but ask what you need first. Three minutes later: a clean Excel file sitting in your folder.`}
            slotNote={`SLOT — fill media/B04.png (screenshot of Claude Cowork tab in desktop app with a folder selected, showing a completed spreadsheet or document output in the Cowork folder)`}
            sparkLine={`Real files, not just text.`}
          />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Level 4 — Connect your apps`,
            artifactHeading: `Claude as the hub`,
            artifactLines: [`Customize → Connectors: Gmail, Calendar, Granola, Otter, and 200+ more.`,
              `Ask Claude to read email + calendar + meeting notes in one prompt.`,
              `No copy-paste. No tab-switching. Claude has the full context.`,
              `Test prompt: 'Read my email, my last meeting, and tell me what needs doing today.'`],
            sparkLine: `One hub, all your apps.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · AI IN FOUR LEVELS`,
            segment: `Being Good At AI Is (Stupidly) Simple`,
            command: `I currently use AI at level [1/2/3]. What's the single highest-leverage thing I should set up next to reach the next level? Ask me clarifying questions first.`,
            runningText: `paste this into Claude...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `being good at ai is (stupidly) simple`,
            handle: `@NikBearBrown`,
            subline: `Four levels. Start at one.`,
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
