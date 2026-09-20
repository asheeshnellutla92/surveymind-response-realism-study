import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, spring } from 'remotion';
import TIMING from './claude-linkedin-timing.json';
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

export const ClaudeLinkedin: React.FC = () => {
  let at = 0;
  const seqs = TIMED.map((t) => {
    const from = at;
    at += t.frames;
    let content: React.ReactNode = null;
    switch (t.id) {
      case 'B00':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Hallo, Liam`,
            topic: `RUBEN · LINKEDIN SKILL`,
            segment: `Claude + Linkedin.`,
            command: `how do I train Claude on my best LinkedIn posts so it writes in my voice?`,
            runningText: `analyzing...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B01':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The four-step system`,
            artifactHeading: `From posts to Skill`,
            artifactLines: [`Step 1: Extract your LinkedIn posts via Apify — safely, legally, ~$2 for 1,000 posts.`,
              `Step 2: Download as a spreadsheet (CSV or XLSX). Save it.`,
              `Step 3: Upload to Claude Cowork with an analysis prompt. Claude builds a report.`,
              `Step 4: Create a /linkedin Skill from your best posts. Call it anytime.`],
            sparkLine: `Four steps, one reusable skill.`,
          })} />
        );
        break;
      case 'B02':
        content = (
          <SlateBeat
            beatId={`B02`}
            narration={`Step one: extract your LinkedIn posts without touching your account. Ruben uses Apify — a web scraping tool. He's not affiliated; it's just the best legal option. Your posts are public on the web, so this is legitimate. Create a free account — you get five dollars of credits, which covers two thousand posts. Find the LinkedIn profile posts agent inside Apify, add your profile URL, save and start. Ruben scraped four hundred eighty-nine posts for about a dollar. Wait a few minutes, then export to CSV. That file is your raw material.`}
            slotNote={`SLOT — fill media/B02.png (screenshot of the Apify LinkedIn profile posts agent interface showing the profile URL input and the export/results screen)`}
            sparkLine={`Scrape posts, $2, legally.`}
          />
        );
        break;
      case 'B03':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `cowork-linkedin-analysis-prompt.md`,
            code: `I'm going to give you an Apify LinkedIn profile posts export —\na CSV or XLSX of one person's LinkedIn posts (50–5,000+ rows).\n\nI coach this person on content and need a decision-ready report\non what's actually working, so I can tell them what to double\ndown on and what to drop.\n\nBefore building, list your top 10 assumptions so I can\nsanity-check them, then execute.`,
            sparkLine: `Analysis before the skill.`,
          })} />
        );
        break;
      case 'B04':
        content = (
          <ClaudeCodeBeat {...claudeCodeBeatSchema.parse({
            title: `linkedin-post/SKILL.md`,
            code: `---\nname: linkedin-post\ndescription: >\n  Write LinkedIn post options in my voice.\n  Use when I type /linkedin-post or ask for\n  a LinkedIn draft.\n---\n\n# Voice: first-person, one idea per post, hook up top.\n# Best patterns: contrarian takes, before/after, numbers.\n# Ban: hashtag stacks, 'I'm excited to announce', emojis.\n# Output: 5 options, each with angle + image direction.`,
            sparkLine: `Voice rules in a file.`,
          })} />
        );
        break;
      case 'B05':
        content = (
          <SlateBeat
            beatId={`B05`}
            narration={`What the Skill produces when you call it. Ruben types /linkedin-post with a brief — what he wants to talk about. Claude outputs five post options: different angles, different formats, different hooks. Each one comes with a suggested image and a note on what could make it stronger. He picks the one that fits. The optimization is only from his posts — not from a generic LinkedIn best-practices dataset from the internet, which is probably outdated. This is the difference between a fine-tuned system and a generic prompt.`}
            slotNote={`SLOT — fill media/B05.png (screenshot of Claude generating 5 LinkedIn post options using the /linkedin-post skill, showing the options with angles and image suggestions)`}
            sparkLine={`5 options, voice-matched.`}
          />
        );
        break;
      case 'B06':
        content = (
          <ClaudeWindow {...claudeWindowSchema.parse({
            view: `artifact`,
            artifactTitle: `The compounding feedback loop`,
            artifactHeading: `How the system gets better over time`,
            artifactLines: [`Post performs well → add it to the Skill file → Skill gets smarter.`,
              `Re-run Apify every few months → updated training data → better patterns.`,
              `Minimum viable dataset: 30+ posts. Below that, not enough signal.`,
              `The system rewards consistency: more posts → better voice model.`],
            sparkLine: `Better posts train better outputs.`,
          })} />
        );
        break;
      case 'B07':
        content = (
          <ClaudeComposerAsk {...claudeComposerAskSchema.parse({
            greeting: `Your turn.`,
            topic: `RUBEN · LINKEDIN SKILL`,
            segment: `Claude + Linkedin.`,
            command: `I want to build a /linkedin-post Claude Skill from my writing patterns. Ask me 10 questions about my voice, my best posts, what I never write, and what always performs. Then write me a complete SKILL.md file I can load immediately.`,
            runningText: `paste this into Claude...`,
            folderLabel: `@NikBearBrown`,
          })} />
        );
        break;
      case 'B08':
        content = (
          <ClaudeTitleOutro {...claudeTitleOutroSchema.parse({
            title: `Claude + Linkedin.`,
            handle: `@NikBearBrown`,
            subline: `Train Claude on your best posts`,
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
