# Claude Code Prompt — General Visual QC Check (frame-level layout audit)

Why this exists: the explainer pipeline's "verify the mp4 plays" step is a FILE
check (duration + frame count), NOT a pixel check. Remotion does not guard
against text overflowing the 1920x1080 canvas — it silently bleeds past the
edge or hides behind a shape. This prompt makes Claude Code actually LOOK at
sampled frames, catch layout defects, fix the root cause in the scene code, and
re-render until clean. It works on ANY finished mp4 or any Remotion composition.

Run Claude Code from the folder that contains the video (or the Remotion
project). Replace TARGET with the mp4 path or the composition id, then paste.

```text
TARGET = <path/to/video.mp4  OR  a Remotion compositionId>

Run a frame-level VISUAL QC pass on TARGET. The mp4 already renders and plays —
that is not what we're checking. We are checking that nothing on screen is
clipped, overflowing, overlapping, offscreen, or illegible. Do not trust the
render; look at the pixels. No publishing, no git commit or push.

STEP 1 — GET FRAMES TO LOOK AT
- If TARGET is an mp4: sample frames with ffmpeg across the whole timeline.
  Grab at least 2 frames per second of runtime, plus a frame at the exact start
  and end of every beat if a beat_sheet.json / timing json is present (read it
  to get beat boundaries; sample each beat at ~15%, 50%, 85% of its span so
  mid-animation states are caught, not just settled ones). Write PNGs to
  ./_qc/frames/ named <index>_<t.sss>s.png.
    ffmpeg -i TARGET -vf fps=2 ./_qc/frames/%05d.png   (then add per-beat grabs
    with -ss for precise timestamps).
- If TARGET is a Remotion composition: render still frames instead
  (npx remotion still <id> ./_qc/frames/<beat>.png --frame=<n>) at the same
  sampling density. Prefer this when the project is available — stills are
  crisper and let you tie a defect directly to a scene file.

STEP 2 — LOOK AT EVERY SAMPLED FRAME (actually Read the PNGs)
Read the frames. For EACH frame, check this rubric and record any violation:
1. EDGE BLEED / CLIPPING: any text or graphic touching or crossing the frame
   border (x<0, x>1920, y<0, y>1080). Half-visible words at an edge = fail.
2. TITLE-SAFE MARGINS: all essential text/logos must sit inside a 5% inset
   (x 96..1824, y 54..1026). Content outside that band is a fail even if not
   yet clipped — it will clip on many players/TVs.
3. CONTAINER OVERFLOW: text overflowing its own box/card/pill, or a label
   partly hidden BEHIND another shape (e.g. a word disappearing under a
   rectangle). The "Deploym…" clipped by a box is this failure.
4. OVERLAP / COLLISION: two elements colliding or stacking so either becomes
   unreadable (label over label, arrow through text, logo over content).
5. OFFSCREEN ANCHOR: an element that entered/exited but is stuck partly
   offscreen at a settled moment (not mid-transition).
6. LEGIBILITY: contrast too low to read (ink on same-tone fill), font too small
   (<24px effective), or motion-blur frame mistaken for a keyframe (ignore
   genuine in-transition frames — judge the settled state).
7. BRAND BUG: the NBB/logo corner bug must NOT cover content and must be inside
   the safe area.
8. ASPECT / LETTERBOX: frame is the intended 16:9 (or 9:16) with no unintended
   bars or squish.

STEP 3 — REPORT
Write ./_qc/REPORT.md: a table of every DEFECT — frame file, timestamp, beat
(if known), rubric # violated, one-line description, and your best guess at the
CAUSE (which scene/element and why: fixed pixel width, absolute x off the grid,
text length exceeding a hardcoded box, missing maxWidth/overflow handling,
element positioned outside safe margins, etc.). Rank defects: BLOCKER (clipped/
unreadable) > MAJOR (outside safe margin, overlap) > MINOR (tight but legible).
If a frame is clean, don't list it. End the report with counts per severity.

STEP 4 — FIX THE ROOT CAUSE (only if the project source is available)
Do NOT nudge pixels blindly. For each defect, fix it in the scene code so it
can't recur:
- Wrap text in a container with an explicit maxWidth and let it wrap or
  auto-shrink (fit-to-box), rather than trusting a fixed width.
- Position essential elements relative to a safe-area constant (5% inset), not
  hardcoded coordinates that assume one string length.
- Give boxes that hold dynamic text room to grow, or clip with an ellipsis by
  intent — never by accident.
- Keep the logo bug pinned inside the safe area.
Re-render only the affected beats/comp, re-sample those frames, and re-run the
rubric on them. Repeat until zero BLOCKER and zero MAJOR remain. Log each
fix in REPORT.md under "Fixes applied".

STEP 5 — REPORT DONE
End with: frames sampled, defects found by severity, fixes applied, and whether
the re-check is clean. If source wasn't available to fix, hand back the ranked
defect list so a human (or the builder skill) can patch it.
```

---

## Make it stop happening (bake the rule into the builder)

The reason this recurs is that the explainer scenes position text with
hardcoded coordinates and fixed-width boxes, which break the moment a label is
longer than the developer assumed. Two standing changes prevent ~all of the
above:

1. Add a shared SAFE-AREA constant to the Remotion project (e.g.
   `runtime/remotion/src/tokens/layout.ts`): `SAFE = { x: 96, y: 54, w: 1728,
   h: 972 }` for 16:9. Every scene lays essential text/logo inside `SAFE`.
2. Every text element that can hold variable-length copy gets a `maxWidth` +
   wrap or auto-fit (shrink-to-fit), never a bare fixed width. Boxes that
   contain labels size to their content or clip on purpose.

Consider adding a one-line rule to `skills/make/explainer/REMOTION.md` (or the
claude-explainer SKILL.md): "All essential text and the logo bug must render
inside the 5% title-safe area; text boxes use maxWidth + wrap/auto-fit, never
fixed widths — and every build ends with the visual QC pass, not just the mp4
probe." Then the pixel check becomes part of the pipeline instead of an
afterthought.
```
