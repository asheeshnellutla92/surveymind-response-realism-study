import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './dont-use-claude-fable-5-timing.json';
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

export const DontUseClaudeFable5: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Olá, Liam`,
            topic: `RUBEN · FABLE-5 GUIDE`,
            segment: `Fable 5.`,
            command: `when should I actually use Claude Fable-5 — and when should I not?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The Claude tier map`,
            artifactHeading: `From cheapest to smartest`,
            artifactLines: [`Haiku: fastest, cheapest. Good for simple, repetitive tasks.`,
              `Sonnet: the reliable middle — best cost-to-quality ratio for daily work.`,
              `Opus: the big one. Very smart, formerly the top tier.`,
              `Fable-5 (Mythos level): smartest on earth. Now usage-billed, not in subscription.`],
            sparkLine: `Four tiers, one is different.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The senior lawyer rule`,
            artifactHeading: `When to spend Fable tokens`,
            artifactLines: [`Fable = senior partner ($1,000/hr): use for strategy, hard reasoning, complex plans.`,
              `Sonnet = capable intern ($100/hr): use for drafting, execution, routine tasks.`,
              `The intern reads the partner's plan and follows it reliably.`,
              `Rule: match model intelligence to task complexity — not to your anxiety.`],
            sparkLine: `Strategy gets Fable. Rest gets Sonnet.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Don't prompt Fable — brief it`,
            artifactHeading: `How to get value from the top model`,
            artifactLines: [`Wrong: type a detailed prompt into Fable, wait for a long output.`,
              `Right: give Fable the goal + constraints, let it write the plan.`,
              `Then: hand the plan to Sonnet for execution. Sonnet follows Fable reliably.`,
              `One Fable planning turn > five Fable generation turns.`],
            sparkLine: `Brief it, don't prompt it.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <SlateBeat
            beatId={`B04`}
            narration={`Where Fable genuinely earns its cost. Interactive charts that need real logic behind them, not just visual formatting. Spreadsheets with complex dependencies — twelve tabs, real formulas, board-ready. Deep market research across hundreds of sources where the synthesis has to be accurate, not just plausible. Co-writing anything where you've uploaded everything about yourself and need the output to actually sound like you. Deck generation where the argument structure matters. The pattern: tasks where being wrong is costly, or where the output will be seen by people who can tell.`}
            slotNote={`SLOT — fill media/B04.png (screenshot of a Fable-5 complex output — e.g. multi-tab spreadsheet or market research artifact in Claude)`}
            sparkLine={`High stakes, use Fable.`}
          />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Fable is waste for these`,
            artifactHeading: `Use Sonnet or Haiku instead`,
            artifactLines: [`Summarizing a document you already understand → Haiku.`,
              `Drafting a routine email or reformatting text → Sonnet.`,
              `Generating caption options, quick Q&A → Sonnet.`,
              `The rule: if being wrong costs nothing, don't use Fable.`],
            sparkLine: `Simple tasks, cheaper model.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `team-model-rule.md`,
            code: `# Model decision rule — post this for your team\n\nUse Fable-5 when:\n- The task requires multi-step reasoning or strategy\n- Being wrong would cost time, money, or credibility\n- You are planning something a cheaper model will execute\n\nUse Sonnet-5 for everything else:\n- Drafts, summaries, formatting, routine email\n- Any task where a near-miss is acceptable\n\nWhen in doubt: start with Sonnet.\nIf the output is wrong, escalate to Fable.`,
            sparkLine: `Write the rule before access.`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <SlateBeat
            beatId={`B07`}
            narration={`Ruben is clear about what Fable-5 doesn't fix. It doesn't fix a bad brief. If you give it vague instructions, it produces a confident-sounding, well-structured version of vague. It doesn't fix missing context — if you don't tell it what your company does, it guesses. And it doesn't fix the habit of not reviewing outputs. Fable makes fewer mistakes than Sonnet. It does not make zero mistakes. The senior lawyer still needs a client who reads the contract.`}
            slotNote={`SLOT — fill media/B07.png (screenshot of a Fable-5 response where the model asks clarifying questions — illustrating that it still needs good context)`}
            sparkLine={`Smart model, dumb brief: still bad.`}
          />
        );
        break;
      case 'B08':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · FABLE-5 GUIDE`,
            segment: `Fable 5.`,
            command: `I want a model-routing audit. Ask me about my 5 most common Claude tasks. For each one, tell me whether it should go to Fable-5, Sonnet-5, or Haiku — with one sentence of reasoning. Be strict. I probably overuse Fable.`,
            runningText: `paste this into Claude...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Fable 5.`,
            handle: `@NikBearBrown`,
            subline: `Smartest model — match it to the task`,
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
