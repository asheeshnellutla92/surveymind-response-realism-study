import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './im-claude-certified-timing.json';
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

export const ImClaudeCertified: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Yassou, Liam`,
            topic: `RUBEN · CERTIFICATION`,
            segment: `Certified.`,
            command: `how do I get a real Claude certification for free and put it on LinkedIn?`,
            runningText: `checking the real certificates…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Three real Claude certifications — all free`,
            artifactHeading: `anthropic.skilljar.com`,
            artifactLines: [`Claude 101 → 1 hour. Chat, Cowork, Code, Projects, Skills, Connectors.`,
              `AI Fluency: Framework & Foundations → 3 hours. Best of the three. Start here.`,
              `Introduction to Claude Cowork → 2 hours. The best Claude feature, end to end.`],
            sparkLine: `Three certs, six hours, free.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`If you only have time for one, Ruben says AI Fluency. It's the closest thing to taste training you'll find for free. Thirteen lessons on how to actually engage with AI — not just use it. The Four D's: Delegation, Description, Discernment, Diligence. Effective prompting. Critical thinking around outputs. Ethics. There's a vocabulary cheat sheet inside. Download it and re-read it more than the lessons.`}
            slotNote={`SLOT — fill media/B02.png (screenshot: anthropic.skilljar.com/ai-fluency-framework-foundations course page, or the vocabulary cheat sheet)`}
            sparkLine={`Taste training, for free.`}
          />
        );
        break;
      case 'B03':
        content = (
          <SlateBeat
            beatId={`B03`}
            narration={`The steps are the same for all three. Go to anthropic.skilljar.com. Create a free account with your email. Navigate to the course URL. Complete it in one sitting if you can — each module ends with a short quiz. When you finish, Anthropic issues your certificate. You download it, it has your name, the course title, and the Anthropic logo. That's the one you put on LinkedIn.`}
            slotNote={`SLOT — fill media/B03.png (screenshot: Anthropic Academy completion page showing a certificate download, with the Anthropic logo visible)`}
            sparkLine={`One sitting, real certificate.`}
          />
        );
        break;
      case 'B04':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `linkedin-cert-format.md`,
            code: `LinkedIn → Add section\n→ Licenses & certifications\n\nName: Claude 101 — Anthropic Academy\nIssuing organization: Anthropic\nIssue date: [today]\n\nRepeat for:\n- AI Fluency: Framework & Foundations\n- Introduction to Claude Cowork`,
            sparkLine: `Three lines, real signal.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Why the certificate matters`,
            artifactHeading: `The numbers behind the signal`,
            artifactLines: [`78% of orgs used AI in 2024. Up from 55% a year earlier.`,
              `AI-skilled workers earn 56% wage premium on average (PwC 2025).`,
              `Less than 2% of the world has tried Claude Pro.`,
              `Certificate = proof you started before most people did.`],
            sparkLine: `56% wage premium signal.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · CERTIFICATION`,
            segment: `Certified.`,
            command: `I just completed the Anthropic AI Fluency certification. The key concepts were: Delegation, Description, Discernment, Diligence. Help me apply the 4D framework to my actual job: [describe your role]. Give me one concrete example per D, using my real work.`,
            runningText: `paste this into Claude after your cert…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Certified.`,
            handle: `@NikBearBrown`,
            subline: `Three free certs, real Anthropic signal`,
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
