import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './how-to-use-your-personal-ai-at-work-timing.json';
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

export const HowToUseYourPersonalAiAtWork: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Namaste, Liam`,
            topic: `RUBEN · AI AT WORK RISK`,
            segment: `Stop Using Your Own Claude At Work`,
            command: `Can I actually get fired for using my personal Claude account at work?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Samsung, April 2023`,
            artifactHeading: `What happens when it goes wrong`,
            artifactLines: [`Engineers permitted to use ChatGPT → leaked source code 3 times in 20 days.`,
              `Semiconductor code, defect code, internal meeting recording — all pasted in.`,
              `Result: company-wide ChatGPT ban + disciplinary investigations.`,
              `Personal AI = outside party. That's what the NDA you signed covers.`],
            sparkLine: `Samsung got burned fast.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`Here's the mechanism. On personal Claude plans — Free, Pro, Max — Anthropic's terms allow your chats and coding sessions to be used to improve the model by default. Leave that on, and they can keep your conversations for up to five years. Every piece of confidential company information you paste in sits in that pool. Ruben's fix is one toggle, and you need to flip it before the next conversation you have.`}
            slotNote={`SLOT — fill media/B02.png (screenshot of Claude Settings → Privacy → 'Help improve our AI models' toggle being turned off)`}
            sparkLine={`One toggle. Flip it now.`}
          />
        );
        break;
      case 'B03':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Turn off training — all four AIs`,
            artifactHeading: `Where each toggle lives`,
            artifactLines: [`Claude: Settings → Privacy → 'Help improve our AI models' → off.`,
              `ChatGPT: Settings → Data controls → 'Improve the model for everyone' → off.`,
              `Grok: profile → settings → data controls → turn off everything.`,
              `Gemini: myactivity.google.com → Gemini activity → off (no shortcut).`],
            sparkLine: `Four AIs, four toggles.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Three legal angles your lawyer will use`,
            artifactHeading: `Why it's a real risk`,
            artifactLines: [`NDA breach: AI company = outside party. Your contract likely covers this.`,
              `Data protection violation: jurisdiction-dependent, but real exposure.`,
              `IT security policy breach: even if no NDA clause, the policy likely does.`,
              `None of these require malicious intent. A paste is enough.`],
            sparkLine: `Paste once, breach all three.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <SlateBeat
            beatId={`B05`}
            narration={`The practical solution, if your company won't pay for an enterprise AI account: keep your personal account, but run a clean-room policy for yourself. Never paste client names, internal financials, source code, or meeting recordings. Anonymize before you paste — replace proper nouns with placeholders. And turn off training, as covered. If you're the one managing risk for a team, Ruben's advice is the same: flag the legal exposure and advocate for an enterprise plan. Enterprise plans don't train on your data at all.`}
            slotNote={`SLOT — fill media/B05.png (screenshot showing Claude chat with placeholder names like [CLIENT_NAME] or [COMPANY], demonstrating clean-room pasting practice)`}
            sparkLine={`Anonymize before you paste.`}
          />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · AI AT WORK RISK`,
            segment: `Stop Using Your Own Claude At Work`,
            command: `I use my personal Claude account at work. What data-hygiene rules should I follow so I don't violate my NDA or company policy? Give me a short checklist I can print and keep at my desk.`,
            runningText: `paste this into Claude...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Stop using your own Claude at work.`,
            handle: `@NikBearBrown`,
            subline: `Flip the toggle. Keep your job.`,
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
