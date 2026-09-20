import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './i-replaced-myself-timing.json';
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

export const IReplacedMyself: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Annyeong, Liam`,
            topic: `RUBEN · AI REPLACING YOU`,
            segment: `Claude Replaced Me`,
            command: `Ruben says he replaced himself with a Claude skill — what does that actually mean?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `What /how-to actually does`,
            artifactHeading: `The skill Ruben built`,
            artifactLines: [`Download from Dropbox → upload into Claude → invoke with /how-to.`,
              `Claude asks clarifying questions, then lays out a full plan.`,
              `Works for any Claude task, even ones you've never tried before.`,
              `Ruben's claim: this replaces him. His newsletter. His job.`],
            sparkLine: `One skill replaces Ruben.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `A Claude skill — one-line definition`,
            artifactHeading: `Skills 101`,
            artifactLines: [`A skill = a file of instructions Claude loads before answering.`,
              `You call it with a slash: /how-to, /linkedin-post, /email-draft.`,
              `Install once. Use forever. Share with your whole team.`,
              `Ruben's /how-to skill: Claude becomes his substitute teacher.`],
            sparkLine: `Install once, use forever.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <SlateBeat
            beatId={`B03`}
            narration={`The install is four steps — and Ruben documents them with screenshots. Go to the Dropbox link. Password: I-dont-need-Ruben-anymore. Download the file. Then inside Claude: Customize → Skills → plus sign → Create skill → Upload a skill. Select the file. Done. Open a new chat, type /how-to, add what you want to accomplish, and Claude starts asking you questions instead of waiting for a perfect prompt from you.`}
            slotNote={`SLOT — fill media/B03.png (screenshot of Claude Skills install flow: Customize → Skills → + → Upload a skill, or the Dropbox download screen)`}
            sparkLine={`Four steps, you're done.`}
          />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `AskUserQuestion — the trick inside`,
            artifactHeading: `Why the skill works`,
            artifactLines: [`Claude asks YOU the questions. Not the other way around.`,
              `3-5 targeted questions before any plan gets written.`,
              `The more you answer, the sharper the output.`,
              `Shortcut: add ELI5 if you're stuck on a step — Claude dials back the complexity.`],
            sparkLine: `Claude interviews you first.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <SlateBeat
            beatId={`B05`}
            narration={`Ruben adds a bonus layer for power users. Don't use the regular chat view. Open Claude Cowork instead. Select Opus model at High effort. Then invoke /how-to. The reasoning engine runs longer, the questions go deeper, and the plan that comes back is more thorough. Solo users get a fine result in Chat mode — but Cowork plus Opus is the ceiling. That's Ruben's own stack for running the skill.`}
            slotNote={`SLOT — fill media/B05.png (screenshot of Claude Cowork tab with model selector showing Opus at High effort, /how-to invoked)`}
            sparkLine={`Cowork plus Opus wins.`}
          />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · AI REPLACING YOU`,
            segment: `Claude Replaced Me`,
            command: `/how-to I want to [describe the thing you've been putting off with Claude]. Ask me what you need first.`,
            runningText: `paste this into Claude...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Claude replaced me.`,
            handle: `@NikBearBrown`,
            subline: `One skill. No Ruben needed.`,
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
