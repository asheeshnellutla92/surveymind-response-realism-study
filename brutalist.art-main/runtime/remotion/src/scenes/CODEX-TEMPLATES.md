# Codex interface templates

Reusable Remotion scenes for videos in which the Codex application or a Codex
repository workflow is the subject. They parallel the Claude interface family
without pretending the two products have the same interaction model.

## Components

- `CodexComposerAsk` — task enters the Codex workspace, types frame-by-frame,
  then reveals the execution checklist.
- `CodexWindow` — reusable task report or file-diff result surface.
- `CodexCodeBeat` — repository code plus the verification command and status.
- `CodexCallout` — annotated application frame for Teardown judgments.
- `CodexTitleOutro` — title-restating Codex end card.

All five are registered in Remotion Studio under `Codex-Templates`. Each exports
a Zod schema and a props type. Product colors and typography live in
`../tokens/codex.ts`.

## Editorial law

Use Codex chrome only when Codex or repository work is the subject. The visual
sequence should reveal the product's actual loop:

```text
TASK → INSPECT → CHANGE → VERIFY → REPORT
```

Name the owner of every interface judgment. Say “Codex’s task interface” or
“Claude Cowork’s composer,” not “the interface,” whenever two products appear
in the same script.

Generated charts, diagrams, and simulations still belong on their own result
plane. Codex chrome earns the task, diff, terminal, verification, and handoff
beats; it is not generic wallpaper.
