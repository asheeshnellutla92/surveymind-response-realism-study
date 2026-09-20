import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './why-ai-will-fail-timing.json';
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

export const WhyAiWillFail: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Ciao, Liam`,
            topic: `RUBEN · AI SKEPTICS`,
            segment: `AI Will Fail.`,
            command: `who are the smartest people who said AI would fail — and what happened to them?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The pattern — a century of wrong calls`,
            artifactHeading: `Technology, expert, prediction, outcome`,
            artifactLines: [`1943 — IBM chairman: 'world market for maybe five computers.' Now: billions.`,
              `1977 — DEC founder: 'no reason for anyone to have a computer at home.' DEC: gone.`,
              `1995 — Ethernet inventor: internet will 'catastrophically collapse in 1996.' Still here.`,
              `2007 — Microsoft CEO: iPhone has 'no chance' of significant market share. 2.3B sold.`],
            sparkLine: `Experts, confident, and wrong.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`A few of the quotes are worth sitting with. Jim Keyes, CEO of Blockbuster in 2008, on streaming: 'I've been frankly confused by this fascination that everybody has with Netflix.' Netflix passed three hundred million subscribers. Blockbuster has one store left. Larry Ellison, also 2008, on cloud computing: 'It's complete gibberish. It's insane. When is this idiocy going to stop?' The cloud became a seven-hundred-billion-dollar-a-year market. Oracle now sells thirty-four billion dollars of it annually. Jack Valenti, head of the MPAA, on home video: 'The VCR is to the American film producer as the Boston Strangler is to the woman home alone.' Within years, home video earned Hollywood more than the box office.`}
            slotNote={`SLOT — fill media/B02.png (screenshot of the article showing the Blockbuster/Netflix and Oracle/cloud quotes side by side, with their outcomes)`}
            sparkLine={`Blockbuster. Oracle. MPAA.`}
          />
        );
        break;
      case 'B03':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Why experts get disruption wrong`,
            artifactHeading: `The insider trap`,
            artifactLines: [`Domain expertise makes you the best judge of the current model.`,
              `The replacement doesn't improve the current model — it replaces the whole frame.`,
              `Netflix looked wrong to Blockbuster because Blockbuster optimized for stores.`,
              `The new thing always looks like a toy until it doesn't.`],
            sparkLine: `Expertise blinds to replacement.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The AI skeptic playbook — familiar form`,
            artifactHeading: `Current skeptic claims vs. historical pattern`,
            artifactLines: [`'AI hallucinates' → early Netflix streaming was also genuinely bad.`,
              `'No productivity gains yet' → internet's economic impact wasn't visible in 1997.`,
              `'It's just hype' → Blockbuster CEO also had real evidence for his position.`,
              `The historical bet: trajectory matters more than current state.`],
            sparkLine: `Bad now doesn't mean failing.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The asymmetric bet`,
            artifactHeading: `Cost of being wrong`,
            artifactLines: [`AI matters + you waited: you catch up from behind, in a faster market.`,
              `AI overhyped + you learned it: you lost some hours and got a useful skill.`,
              `The downside of learning is small. The downside of dismissing is potentially large.`,
              `Historical base rate: confident expert dismissals have been wrong every time.`],
            sparkLine: `Learning AI is the low-risk bet.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <SlateBeat
            beatId={`B06`}
            narration={`One quote from the list deserves its own moment. 1941 — the British Medical Journal on penicillin: it 'does not appear to have been considered as possibly useful from any other point of view.' This was printed in a peer-reviewed journal. The discovery had already been made. The mechanism was understood. Penicillin has since saved an estimated two hundred million lives. The gatekeepers of knowledge, writing in the authoritative venue of their field, got the most important medical technology of the twentieth century completely wrong. Humility about predictions is not weakness. It's the lesson.`}
            slotNote={`SLOT — fill media/B06.png (screenshot of the article section showing the penicillin quote from the British Medical Journal with its outcome)`}
            sparkLine={`Penicillin dismissed — 200M lives.`}
          />
        );
        break;
      case 'B07':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · AI SKEPTICS`,
            segment: `AI Will Fail.`,
            command: `Find the 5 most commonly cited reasons AI will fail or is overhyped in 2026. For each one, tell me: (1) the strongest version of the argument, (2) the historical technology it most resembles, and (3) what it would take to prove it right vs. wrong. Be a fair referee.`,
            runningText: `paste this into Claude...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `AI will fail.`,
            handle: `@NikBearBrown`,
            subline: `They said that about everything else too`,
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
