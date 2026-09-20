import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './how-to-make-perfect-spreadsheets-timing.json';
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

export const HowToMakePerfectSpreadsheets: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Sawadee, Liam`,
            topic: `RUBEN · SPREADSHEETS`,
            segment: `Stop learning Excel.`,
            command: `how do I make any spreadsheet with Claude Cowork, no formulas required?`,
            runningText: `planning the spreadsheet…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `11 AI tools tested for spreadsheets`,
            artifactHeading: `The verdict`,
            artifactLines: [`Copilot → couldn't make a spreadsheet at all.`,
              `Grok → says done, no file appears.`,
              `ChatGPT inside Google Sheets → good for edits, not creation.`,
              `Claude Cowork → the only one that builds a finished, polished Excel.`],
            sparkLine: `One tool wins.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`Quick access reminder before we dive into the prompt. You need the Claude desktop app — not the browser. Go to claude.com/download. You need at least a Pro account at twenty dollars a month. Open the app. Click the Cowork tab at the top — it sits between Chat and Code. Select a folder from your computer. Then make sure you've got Opus 4.7 and Adaptive thinking turned on. That's the whole setup.`}
            slotNote={`SLOT — fill media/B02.png (screenshot: Claude desktop app, Cowork tab selected, model picker showing Opus 4.7 + Adaptive thinking on)`}
            sparkLine={`Cowork tab, Opus 4.7.`}
          />
        );
        break;
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `cowork-spreadsheet-prompt.md`,
            code: `Create an Excel spreadsheet from:\n[DATA: file path, folder, or pasted data].\n\n### Purpose:\n[Who uses this and what decision it supports — 1 sentence.]\n\n### Sheets needed:\n- "[Sheet name]": [columns, what each row is, formulas]\n- "[Sheet name]": [summary, pivot, charts]\n\n### Formatting:\n[Currency/dates, conditional highlighting, frozen headers, totals]\n\nBefore building, list your top 10 assumptions\nso I can sanity-check them, then execute.`,
            sparkLine: `Assumptions before execution.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <SlateBeat
            beatId={`B04`}
            narration={`Here's what that prompt looks like in the real world. Ruben's consulting firm needed a twelve-month revenue forecast — board-ready, four service lines with very different margins, enough detail that the board can pressure-test every assumption live in the meeting. He pasted the template, filled in the context, and Cowork came back with ten assumptions to approve before touching a single cell. That's the handshake that prevents the spreadsheet from being wrong.`}
            slotNote={`SLOT — fill media/B04.png (screenshot: Cowork session showing the ten-assumptions list Claude generated before building the revenue forecast)`}
            sparkLine={`Ten assumptions, one handshake.`}
          />
        );
        break;
      case 'B05':
        content = (
          <SlateBeat
            beatId={`B05`}
            narration={`Once you approve the assumptions, Cowork builds. It creates the actual Excel file and drops it in your folder — not a preview, not a screenshot, the real file you open in Excel or Google Sheets. Multiple tabs, real formulas, conditional formatting. Ruben uses this every week for board reports. The whole thing takes under five minutes from prompt to file.`}
            slotNote={`SLOT — fill media/B05.png (screenshot: the finished Excel file open in Excel or Google Sheets, showing multiple tabs with real formulas and formatting)`}
            sparkLine={`Real file in your folder.`}
          />
        );
        break;
      case 'B06':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · SPREADSHEETS`,
            segment: `Stop learning Excel.`,
            command: `Create an Excel spreadsheet from: [my data]. Purpose: [who uses it, what decision]. Sheets: [Sheet 1: columns, rows]. Formatting: [currency, frozen header]. Before building, list your top 10 assumptions so I can sanity-check them, then execute.`,
            runningText: `paste this into Claude Cowork…`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Stop learning Excel.`,
            handle: `@NikBearBrown`,
            subline: `Cowork builds the file for you`,
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
