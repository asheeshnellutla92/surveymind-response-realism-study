import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './claude-connectors-timing.json';
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

export const ClaudeConnectors: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Vanakkam, Liam`,
            topic: `RUBEN · CONNECTORS`,
            segment: `Claude Connectors.`,
            command: `how do I connect Claude to Gmail, Slack, and my meeting notes in one click?`,
            runningText: `connecting the apps…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <SlateBeat
            beatId={`B01`}
            narration={`A Connector is a one-click bridge between Claude and an app you already pay for. Over two hundred of them. You probably use zero. The setup is four steps: open Claude, click the plus inside the chatbox, find Connectors, click Add Connector, pick your app. Then in any new chat, click plus again and toggle your app on. That's it.`}
            slotNote={`SLOT — fill media/B01.png (screenshot: Claude chatbox with the + menu open, showing the Connectors option and the Add Connector button)`}
            sparkLine={`One-click bridge to your apps.`}
          />
        );
        break;
      case 'B02':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `What changes with connectors on`,
            artifactHeading: `Zero copy-paste. Real context.`,
            artifactLines: [`Gmail on → Claude reads your inbox. Zero copy-pastes.`,
              `Granola on → Claude reads all meeting transcripts. Zero dashboards.`,
              `Slack on → Claude pulls the full thread. Zero tabs.`,
              `Combine them: Granola + Gmail + Slack → one prompt, full context.`],
            sparkLine: `Context without copy-paste.`,
          })} />
        );
        break;
      case 'B03':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `Ruben's 9 favorite connectors`,
            artifactHeading: `The ones worth your fifteen minutes`,
            artifactLines: [`Granola — meeting transcripts, action items, blockers.`,
              `HubSpot / Salesforce — deals stuck in pipeline, follow-up drafts.`,
              `Notion — team knowledge base queries without opening Notion.`,
              `Google Drive + Gmail + Slack — combine for full work context.`],
            sparkLine: `Nine apps, zero tabs.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `granola-weekly-prompt.md`,
            code: `Pull my last meeting from Granola.\nSummarize in 5 bullets.\nThen list every action item assigned to me,\nwith deadlines.\nThen flag the 2-5 blockers I might have\nto complete some items.`,
            sparkLine: `Meeting already read.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `hubspot-followup-prompt.md`,
            code: `Read my HubSpot pipeline.\nList every deal in "Proposal Sent"\nthat hasn't moved in 7+ days.\nFor each: write a follow-up email\nI can send today.\nTone: direct, warm. No "just checking in."`,
            sparkLine: `CRM without opening CRM.`,
          })} />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · CONNECTORS`,
            segment: `Claude Connectors.`,
            command: `Read my Gmail, my Granola meeting notes, and my Slack. Give me: (1) top 3 things I need to action today from email, (2) action items from my last meeting, (3) any open threads in Slack waiting on me. Prioritize by urgency.`,
            runningText: `paste this into Claude with connectors on…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Claude Connectors.`,
            handle: `@NikBearBrown`,
            subline: `One prompt, every app, zero tabs`,
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
