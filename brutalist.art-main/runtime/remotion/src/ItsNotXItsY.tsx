import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './its-not-x-its-y-timing.json';
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

export const ItsNotXItsY: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Talofa, Liam`,
            topic: `RUBEN · AI WRITING`,
            segment: `It's not [X], it's [Y].`,
            command: `how do I stop my writing from sounding like it was written by AI?`,
            runningText: `auditing for AI patterns…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The pattern and its disguises`,
            artifactHeading: `Negative parallelism — 15 forms`,
            artifactLines: [`It's not [X], it's [Y]. — the original.`,
              `This isn't about [X], it's about [Y].`,
              `Not [X] — [Y].`,
              `Less [X], more [Y].`,
              `Forget [X]. Focus on [Y].`,
              `Stop [X]. Start [Y]. — and 10 more variants.`,
              `All of them: same shape, same AI fingerprint.`],
            sparkLine: `Fifteen forms, one tell.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `anti-ai-writing-style.md`,
            code: `# BANNED PATTERNS\nNegative parallelism and its 15 variants:\n- "It's not [X], it's [Y]."\n- "This isn't about X, it's about Y."\n- "Not X — Y."\n- "Less X, more Y."\n→ Never use. Rewrite with direct assertion.\n\n# BANNED VOCABULARY (100+ words)\ndelve, unlock, leverage, empower, dive into,\nlandscape, robust, seamless, game-changer...\n\n# PACING RULES\nShort sentences earn long ones. Not the reverse.`,
            sparkLine: `Ban first, then write.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <SlateBeat
            beatId={`B03`}
            narration={`The workflow is three steps. Your Cowork folder has three files: about-me, my-company, and anti-ai-writing-style. Claude reads all three before every session because of a global instruction you paste once. Then when you ask for any written output, the audit runs automatically. Ruben shows it catching negative parallelism mid-draft and rewriting on the spot. You can push further — type 'audit it harder' and Claude finds what it missed.`}
            slotNote={`SLOT — fill media/B03.png (screenshot of Cowork folder showing about-me, my-company, anti-ai-writing-style files — Ruben's folder screenshot from the article)`}
            sparkLine={`Three files, full context.`}
          />
        );
        break;
      case 'B04':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `global-instructions.md`,
            code: `I usually start my Cowork session by pointing you to\nmy Cowork folder.\n\nBefore any and every single task, you must read every\nfile in ABOUT ME/:\n- about-me: who I am, what I love and hate\n- anti-ai-writing-style: audit everything against it\n- my-company: where I work, my role\n\nNever read OUTPUTS/ or TEMPLATES/ unless I point you.\nSave deliverables in OUTPUTS/ under the project name.\n\nIf the brief is unclear, use AskUserQuestion.\nDon't over-explain. Deliver the work.`,
            sparkLine: `Paste once. Always runs.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The vocabulary replacement rule`,
            artifactHeading: `Concrete over default`,
            artifactLines: [`leverage → use`,
              `scalable → works at any size`,
              `unlock → open, find, reach`,
              `dive into → read, look at, check`,
              `foster → build, grow, encourage`,
              `seamless → smooth, clean, simple`,
              `The rule: if it sounds like an AI, find the real word.`],
            sparkLine: `Real words, not defaults.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Where the file works`,
            artifactHeading: `One file, any AI`,
            artifactLines: [`Claude Cowork — drop it in your Cowork folder.`,
              `ChatGPT — upload to a Project.`,
              `Gemini — upload to a conversation or Gem.`,
              `Manage all your files in Obsidian (free, Markdown).`,
              `The audit runs wherever the file is.`],
            sparkLine: `Portable to any AI.`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Three classes of AI-ism`,
            artifactHeading: `What the audit catches`,
            artifactLines: [`Structural — negative parallelism and 15 variants.`,
              `Lexical — 100+ words no human reaches for first.`,
              `Tonal — over-explanation, unasked-for warmth, false confidence.`,
              `Strip all three: the text reads like a person.`,
              `Because a person constrained the machine.`],
            sparkLine: `Structural, lexical, tonal.`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · AI WRITING`,
            segment: `It's not [X], it's [Y].`,
            command: `Read the anti-ai-writing-style.md in my folder. Then take the text I'm about to paste and audit it hard — flag every banned pattern, every banned word, every tonal AI-ism. Rewrite each flagged section. Then audit the rewrite. Keep going until it passes.`,
            runningText: `paste this into Claude Cowork…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B09':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `It's not [X], it's [Y].`,
            handle: `@NikBearBrown`,
            subline: `one file · ban the pattern · sound human`,
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
