import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './how-to-beat-ai-once-it-inevitably-timing.json';
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

export const HowToBeatAiOnceItInevitably: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Halo, Liam`,
            topic: `RUBEN · FUTURE OF WORK`,
            segment: `You can't beat AI.`,
            command: `what do I do when AI gets cheaper than me every single year?`,
            runningText: `thinking through the work problem…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The cost of intelligence — 4 years`,
            artifactHeading: `6,000x cheaper. Smarter at the same time.`,
            artifactLines: [`2022 GPT-4: expensive, state of the art.`,
              `2026 DeepSeek: a fraction of the price — and smarter.`,
              `This is not a discount. It is a structural repricing of knowledge work.`],
            sparkLine: `Cheaper and smarter.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`The jobs hit first are the obvious ones: memos, market scans, spreadsheets, landing pages, sales emails, first drafts, summaries, slide outlines, contract reviews, twenty ideas for a campaign. A company used to need an expensive human for all of that. Now it needs a prompt. Maybe thirty seconds. Maybe twenty dollars a month. And the output is fine. Sometimes better than the junior they hired last year. The market decided.`}
            slotNote={`SLOT — fill media/B02.png (screenshot or chart showing junior knowledge-work job postings declining, or Ruben's graphic from the article)`}
            sparkLine={`Junior jobs are crashing.`}
          />
        );
        break;
      case 'B03':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Jevons' Paradox — applied to AI`,
            artifactHeading: `Cheaper doesn't mean less. It means more.`,
            artifactLines: [`When efficiency rises, total consumption rises too.`,
              `Cheaper AI → more drafts, more analysis, more everything.`,
              `You won't lose because AI can think. You'll lose because everyone around you can suddenly think 100× more.`],
            sparkLine: `More work, not less.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `What AI collapses`,
            artifactHeading: `Three hidden costs of knowledge work`,
            artifactLines: [`1. Cost to know enough → AI starts from knowledge.`,
              `2. Cost to think through the work → AI drafts it.`,
              `3. Cost to produce the final thing → AI ships it.`,
              `Good enough × 100× more often = the new baseline.`],
            sparkLine: `Three costs, all attacked.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `What doesn't get commoditized`,
            artifactHeading: `The human layer above the model`,
            artifactLines: [`Judgment — deciding what the work should achieve.`,
              `Taste — knowing what good looks like before the output arrives.`,
              `Accountability — owning the result when it's wrong.`,
              `Trust and relationships — built over years, not tokens.`],
            sparkLine: `The bottleneck shifts up.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <SlateBeat
            beatId={`B06`}
            narration={`Ruben's actual prescription is this: stop competing on the output. Start competing on the input. The person who writes the best brief, who frames the right question, who catches the wrong assumption before Claude runs with it — that person is worth more every year, not less. Use AI a hundred times more than your peers. Become the one who orchestrates, not the one who produces.`}
            slotNote={`SLOT — fill media/B06.png (Ruben's graphic or diagram from the article showing the shift from producer to orchestrator / director of AI)`}
            sparkLine={`Orchestrate, don't produce.`}
          />
        );
        break;
      case 'B07':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · FUTURE OF WORK`,
            segment: `You can't beat AI.`,
            command: `Here is my current job: [describe your role and daily tasks]. Identify which parts AI can already do at a fraction of my cost, which parts require human judgment, and give me a 30-day plan to shift my value toward the parts that survive.`,
            runningText: `paste this into Claude…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `You can't beat AI.`,
            handle: `@NikBearBrown`,
            subline: `Orchestrate the model, own the judgment`,
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
