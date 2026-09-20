import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './claude-design-timing.json';
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

export const ClaudeDesign: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Kumusta, Liam`,
            topic: `RUBEN · CLAUDE DESIGN`,
            segment: `Claude Design.`,
            command: `how do I use Claude Design to build websites and slide decks?`,
            runningText: `loading Claude Design…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `How to access Claude Design`,
            artifactHeading: `Three access paths`,
            artifactLines: [`Pro or Max plan → go to claude.ai/design. Sign in. Done.`,
              `Team or Enterprise → admin enables it: Org Settings → Capabilities → Anthropic Labs.`,
              `Research preview: gradual rollout. If it redirects home, wait.`,
              `Token usage: fast. Faster than regular Claude. Watch your limits.`,
              `Send to Canva button: built in at the end of every output.`],
            sparkLine: `Own URL, paid plan.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`First test: a landing page, two-line prompt, one shot. Ruben built a high-fidelity landing page for a fictional underwater datacenter company — targeted at Israeli VCs — in a single prompt. No iterations, no back-and-forth. The result looked designed. He didn't write a word that appeared on the page. The workflow: Wireframe tab, select High Fidelity, paste the prompt, hit Create, then click Present.`}
            slotNote={`SLOT — fill media/B02.png (screenshot of Ruben's underwater datacenter landing page output from Claude Design — the one-shot high-fidelity result from the article)`}
            sparkLine={`One prompt, full website.`}
          />
        );
        break;
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `landing-page-prompt.md`,
            code: `Create a high-fidelity landing page to raise\n$[AMOUNT] from [TARGET INVESTORS] for\n"[PRODUCT NAME]" — [short description].\n\nTarget audience: [investor type].\nTone: [how visitor should feel]\n  — think [website] + [website] + [ecosystem].\n\n# Workflow:\n# 1. Wireframe tab → select High Fidelity\n# 2. Paste prompt → Create\n# 3. Click Present to see it full-screen\n# 4. Comment mode to request edits`,
            sparkLine: `Name the register. Done.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Slide deck workflow`,
            artifactHeading: `Three steps from prompt to deck`,
            artifactLines: [`1. Homepage → Slide Deck tab.`,
              `2. Paste the prompt. Answer Claude's clarifying questions.`,
              `3. Deck appears. Click Present. Export or Send to Canva.`,
              `Claude asks questions first — answer fast, first instinct wins.`,
              `Edit by clicking a slide and describing the change in plain English.`],
            sparkLine: `Questions first, deck next.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Cowork + Design workflow`,
            artifactHeading: `Strategy in Cowork, visuals in Design`,
            artifactLines: [`Step 1: Open Claude Cowork. Generate the full content.`,
              `  — narrative, data, structure, key messages.`,
              `Step 2: Copy the output. Go to claude.ai/design.`,
              `Step 3: Paste as context. Build the visual layer on top.`,
              `Result: designed output grounded in real strategic thinking.`],
            sparkLine: `Cowork thinks. Design renders.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · CLAUDE DESIGN`,
            segment: `Claude Design.`,
            command: `Create a high-fidelity landing page designed to raise $[AMOUNT] from [TARGET AUDIENCE] for "[PRODUCT]" — [description]. Tone: [feel] — think [reference site] + [reference site]. Make it one-shot, high fidelity, ready to present.`,
            runningText: `paste this into claude.ai/design…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Claude Design.`,
            handle: `@NikBearBrown`,
            subline: `one prompt · full design · send to Canva`,
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
