import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './the-claude-code-bible-timing.json';
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

export const TheClaudeCodeBible: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Hej, Liam`,
            topic: `RUBEN · VIBECODING`,
            segment: `Vibecoding.`,
            command: `what is vibecoding actually good for — and what is it not good for?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `What vibecoding is`,
            artifactHeading: `The honest definition`,
            artifactLines: [`You describe what you want in plain English. Claude writes all the code.`,
              `Claude Code lives in the Code tab of the Claude desktop app.`,
              `You won't write a single line of code. You will review every output.`,
              `Rough edges are fine — depends entirely on who sees the result.`],
            sparkLine: `Plain English in, code out.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Two good reasons to vibecode`,
            artifactHeading: `Where it earns its time`,
            artifactLines: [`Use case 1: build a clickable mockup to brief devs/designers — beats any spec doc.`,
              `Use case 2: build a small custom tool for you or a tiny team — rough edges are fine.`,
              `Not good for: public products, production software, things real users will break.`,
              `The honest filter: who sees the rough edges? If nobody, vibecode away.`],
            sparkLine: `Mockups and small tools.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <SlateBeat
            beatId={`B03`}
            narration={`Seven steps to set up Claude Code. One: get the app at claude.com/download, install it, open the Code tab. Two: create a clean folder on your computer, just for this project — nothing private, nothing you'd hate to lose, because Claude will read everything inside it. Three: turn on bypass permissions — without it, Claude asks your approval for every file operation, which slows everything down. Four: point Claude to your folder. Five: describe what you want. Six: review what it builds. Seven: iterate by talking to it, not by editing code manually.`}
            slotNote={`SLOT — fill media/B03.png (screenshot of the Claude app Code tab with bypass permissions turned on and a clean folder pointed at it)`}
            sparkLine={`Seven steps, twenty minutes.`}
          />
        );
        break;
      case 'B04':
        content = (
          <SlateBeat
            beatId={`B04`}
            narration={`Ruben's first real example: a mockup for his consulting firm GPC to hand to developers. He can't code but he has developers he hires. Before vibecoding, he'd try to explain what he wanted verbally — and developers would interpret it wrong. Now he builds a rough version and sends an actual website link. The developers see the layout, the flow, the feel. The designer gets the vision. This is not rocket science — it's a communication tool. The value is not in the software quality; it's in eliminating misunderstanding before expensive development starts.`}
            slotNote={`SLOT — fill media/B04.png (screenshot of a vibecoded website mockup built with Claude Code — ideally a real example showing a working prototype)`}
            sparkLine={`Mockup stops misunderstanding.`}
          />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The LinkedIn analytics dashboard`,
            artifactHeading: `Custom tool, personal formula`,
            artifactLines: [`Connected Apify's public LinkedIn API to a simple dashboard.`,
              `Scores each post: his own formula, his own weights for likes/comments/reposts.`,
              `Clickable post links. Search by topic. Used daily.`,
              `Doesn't exist as a product. He built it for himself, with Claude Code.`],
            sparkLine: `One tool, built for one person.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Where vibecoding breaks`,
            artifactHeading: `Ruben's honest limits`,
            artifactLines: [`Not hardened: edge cases get missed, logic errors happen, no testing.`,
              `Not secure: Claude Code won't catch data leaks or auth problems.`,
              `Not debuggable by you: if it breaks, you can't read the code to fix it.`,
              `Rule: the moment a customer pays for it, get a real engineer involved.`],
            sparkLine: `Prototype yes. Production no.`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `vibecode-start-prompt.md`,
            code: `Build me a [type of tool] that does [one specific job].\n\nWho uses it: [me / my team of N / internal only]\nInputs: [what data or files it takes in]\nOutputs: [what it produces or shows]\n\nBefore writing any code, list your top 5 assumptions\nand ask me any clarifying questions.\nThen build it step by step.`,
            sparkLine: `Plan before code.`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · VIBECODING`,
            segment: `Vibecoding.`,
            command: `I want to vibecode a small tool for personal use. It should [describe your one-sentence use case]. Before writing code: ask me 5 clarifying questions about inputs, outputs, and who uses it. Then build it step by step in my clean project folder.`,
            runningText: `paste this into Claude Code...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Vibecoding.`,
            handle: `@NikBearBrown`,
            subline: `Mockups and small tools — nothing more`,
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
