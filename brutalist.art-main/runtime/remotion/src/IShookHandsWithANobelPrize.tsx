import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './i-shook-hands-with-a-nobel-prize-timing.json';
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

export const IShookHandsWithANobelPrize: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Jambo, Liam`,
            topic: `RUBEN · AGI TIMELINE AND WORK`,
            segment: `AGI By 2030.`,
            command: `Demis Hassabis says AGI by 2030. What does that actually mean for my job?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Demis Hassabis — the resume`,
            artifactHeading: `Why this claim carries weight`,
            artifactLines: [`Age 13: chess master. Age 34: co-founded DeepMind.`,
              `Age 37: Google acquires DeepMind for £600M — best acquisition in history.`,
              `Age 39: AlphaGo beats world champion Go player. 10¹⁷⁰ possible board states.`,
              `Age 48: Nobel Prize in Chemistry for AlphaFold. Now building AGI.`],
            sparkLine: `Nobel Prize. Now building AGI.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`Ruben was at Google I/O on May 20th. He got a few minutes with Demis — you can see the photo in his newsletter, Demis in a cap, Ruben the curly guy on the right. They talked about the future of work. And Ruben's honest about what that conversation did to him: Demis isn't speculating about AGI from the outside. He's building it, from the inside, right now. His definition of AGI: when the machine becomes smarter than us, humans, in every domain that matters.`}
            slotNote={`SLOT — fill media/B02.png (photo from Ruben's newsletter: Demis Hassabis in a cap, Ruben on the right, at Google I/O — or a screenshot of Ruben's newsletter showing the photo and caption)`}
            sparkLine={`Ruben met Demis at I/O.`}
          />
        );
        break;
      case 'B03':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Ruben's dad — the four-decade comparison`,
            artifactHeading: `What discontinuity looks like`,
            artifactLines: [`1984, Paris: marketing = walking the street, stopping strangers, notebook + typewriter.`,
              `2022: same job, different planet — dashboards, forms, digital everything.`,
              `That transformation took 40 years. AGI compresses it to 4.`,
              `DeepMind's mission: 'Solve intelligence, then use that to solve everything else.'`],
            sparkLine: `Forty years in four.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Ruben's frame — urgency, not fear`,
            artifactHeading: `What the meeting actually meant`,
            artifactLines: [`Ruben's wishlist: Sutskever, Karpathy, Pressfield, Rubin, Greene — and Demis.`,
              `Demis is building AGI from inside the lab. Not speculating. Building.`,
              `If he's right: 4 years. If he's wrong: a few more years to prepare.`,
              `Either way: the move is the same.`],
            sparkLine: `Same move either way.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The move Ruben implies`,
            artifactHeading: `Get fluent now, not later`,
            artifactLines: [`Get fluent while the fluency gap is still large enough to matter.`,
              `Build your workflow around AI — make upgrades incremental, not catastrophic.`,
              `Stop treating AI as a shortcut. It's the new floor of knowledge work.`,
              `Fluent in 2026 → not scrambling in 2030. That's the whole thesis.`],
            sparkLine: `Fluent in 2026, ready in 2030.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <SlateBeat
            beatId={`B06`}
            narration={`Andrej Karpathy is worth a footnote here because Ruben mentions it in passing but it's significant: Karpathy, one of the original architects of GPT at OpenAI, just joined Anthropic — the company behind Claude. The people who shaped the architecture of the most transformative AI systems are now concentrating at Anthropic. Whether that changes the competitive landscape between Claude and GPT is a separate question, but it's a signal worth tracking if you're placing bets on which AI ecosystem to get fluent in.`}
            slotNote={`SLOT — fill media/B06.png (screenshot of news coverage or announcement of Andrej Karpathy joining Anthropic, or his LinkedIn/X post about the move)`}
            sparkLine={`Karpathy joined Anthropic.`}
          />
        );
        break;
      case 'B07':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · AGI TIMELINE AND WORK`,
            segment: `AGI By 2030.`,
            command: `I work in [your field / role]. If AGI arrives by 2030, what parts of my job are most at risk of being automated, and what skills should I be building right now to stay relevant? Ask me clarifying questions first.`,
            runningText: `paste this into Claude...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `AGI by 2030.`,
            handle: `@NikBearBrown`,
            subline: `Fluent now. Ready in four years.`,
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
