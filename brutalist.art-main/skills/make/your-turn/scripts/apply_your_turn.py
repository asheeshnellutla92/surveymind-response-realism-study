#!/usr/bin/env python3
"""apply_your_turn.py — standardize the closing block of a claude-explainer reel.

The your-turn closing is three Liam-narrated beats:

  VERDICT   (ClaudeVerdictArtifact)  full recap; opens with the handoff line
  YOUR TURN (ClaudeComposerAsk)      a video-relevant prompt Liam reads in full
  OUTRO     (ClaudeTitleOutro)       the title card; Liam re-reads the title

This script rewrites those three beats in place. It is idempotent (safe to
re-run). It targets the claude-explainer / nbb family — any sheet that has a
YOUR TURN (ClaudeComposerAsk) or a Liam OUTRO (ClaudeTitleOutro). Reels that
already have a verdict card get it cleaned + wired; reels that DON'T get one
INSERTED before the your-turn beat, using the drafted recap. Other families
(slate cuts) are skipped untouched.

Drafts (the non-deterministic, human-reviewed input) come from --drafts a
JSON map { "<slug>": {"prompt": "...", "recap": {"title": "...", "lines": [..4..]} | null} }.
recap is only used when the reel lacks a verdict card. Reels with no drafted
prompt keep existing YOUR TURN content and are reported as needs_prompt.

Usage:
  python apply_your_turn.py path/to/beat_sheet.json --drafts drafts.json --dry-run
  python apply_your_turn.py --root . --drafts drafts.json --report report.json

Voices: LIAM = kokoro/am_onyx (recap voice). BEAR = elevenlabs (main narrator).
"""
import argparse, json, glob, os, re

LIAM = {"engine": "kokoro", "voice": "am_onyx"}
HANDOFF_FROM_BEAR = "Thanks Bear, let's recap with Claude."
HANDOFF_FROM_LIAM = "Let's recap with Claude."
LEAD_SILENCE_S = 0.5
HANDLE = "@NikBearBrown"
VERDICT_HEADING = "What the body demonstrated"

_LEADNUM = re.compile(r"^\s*\d+\s*[.)\-–—:]\s*")


def _pattern(beat):
    if not isinstance(beat, dict):
        return None
    shot = beat.get("shot")
    if not isinstance(shot, dict):
        return None
    rem = shot.get("remotion")
    if not isinstance(rem, dict):
        return None
    return rem.get("pattern")


def _props(beat):
    shot = beat.get("shot")
    if not isinstance(shot, dict):
        shot = {}
        beat["shot"] = shot
    rem = shot.get("remotion")
    if not isinstance(rem, dict):
        rem = {}
        shot["remotion"] = rem
    if not isinstance(rem.get("props"), dict):
        rem["props"] = {}
    return rem["props"]


def _is_elevenlabs(beat, default_eng):
    if not isinstance(beat, dict):
        return "eleven" in default_eng
    eng = (beat.get("engine") or "").lower() or default_eng
    return "eleven" in eng


def _find(beats, pat):
    for i, b in enumerate(beats):
        if _pattern(b) == pat:
            return i, b
    return None, None


def _find_yourturn(beats):
    """The CLOSING your-turn composer = the LAST ClaudeComposerAsk that is NOT
    the beat-0 opening intro. Reels open with a ClaudeComposerAsk ("[hello],
    Liam") intro AND close with a ClaudeComposerAsk ("Your turn.") — we must
    edit the closing one and never the intro."""
    last = (None, None)
    for i, b in enumerate(beats):
        if i > 0 and _pattern(b) == "ClaudeComposerAsk":
            last = (i, b)
    return last


def _handoff_for(beats, before_index, default_eng):
    prev = beats[before_index - 1] if before_index > 0 else None
    prev_11 = _is_elevenlabs(prev, default_eng) if prev is not None else ("eleven" in default_eng)
    return (HANDOFF_FROM_BEAR if prev_11 else HANDOFF_FROM_LIAM), prev_11


def _make_verdict_beat(recap, handoff, bid):
    lines = [_LEADNUM.sub("", x) for x in recap.get("lines", [])]
    narration = (handoff + " " + " ".join(lines)).strip()
    return {
        "beat_id": bid,
        "act": "VERDICT",
        "engine": "kokoro", "voice": "am_onyx",
        "lead_silence_s": LEAD_SILENCE_S,
        "narration_text": narration,
        "shot": {
            "type": "CARD", "source": "remotion", "motion": "hold",
            "remotion": {
                "pattern": "ClaudeVerdictArtifact",
                "provenance": "proven-core/ClaudeVerdictArtifact",
                "version": "1",
                "props": {
                    "artifactTitle": recap.get("title", "The verdict"),
                    "artifactHeading": VERDICT_HEADING,
                    "artifactLines": lines,
                },
                "rendered": {"out": f"media/{bid}.mp4", "at": ""},
            },
        },
        "estimated_duration_s": max(6, min(22, len(narration.split()) / 2.6)),
    }


def transform(sheet, slug, draft, drop_intro=False):
    """Mutates `sheet`. Returns (changed, notes)."""
    if not isinstance(sheet, dict) or not isinstance(sheet.get("beats"), list):
        return False, ["skip: not a beat-sheet dict with a beats list"]
    beats = sheet["beats"]
    notes = []

    # Manim-explainer (science) reels drop the opening Liam composer intro.
    if drop_intro and beats and _pattern(beats[0]) == "ClaudeComposerAsk":
        beats.pop(0)
        notes.append("intro: removed opening Liam composer")
    meta = sheet.get("metadata", {}) or {}
    default_eng = (meta.get("engine") or "").lower()
    title = (meta.get("title") or "").strip()
    prompt = (draft or {}).get("prompt")
    recap = (draft or {}).get("recap")

    yi, yt = _find_yourturn(beats)
    oi, outro = _find(beats, "ClaudeTitleOutro")
    if yt is None and outro is None:
        return False, ["skip: no claude-explainer closing (no your-turn / liam outro)"]

    vi, verdict = _find(beats, "ClaudeVerdictArtifact")

    # ---- 1. VERDICT — clean+wire existing, or INSERT one before the your-turn
    if verdict is not None:
        vp = _props(verdict)
        if isinstance(vp.get("artifactLines"), list):
            cleaned = [_LEADNUM.sub("", ln) for ln in vp["artifactLines"]]
            if cleaned != vp["artifactLines"]:
                vp["artifactLines"] = cleaned
                notes.append("verdict: stripped authored line numbers")
        verdict.update(LIAM)
        handoff, from_bear = _handoff_for(beats, vi, default_eng)
        nt = (verdict.get("narration_text") or "").strip()
        body = re.sub(r"^(Thanks Bear, let's recap with Claude\.|Let's recap with Claude\.)\s*", "", nt)
        verdict["narration_text"] = (handoff + " " + body).strip()
        verdict["lead_silence_s"] = LEAD_SILENCE_S
        notes.append(f"verdict: cleaned + handoff ({'from Bear' if from_bear else 'from Liam'})")
    else:
        # need to insert — requires a drafted recap
        anchor = yi if yi is not None else oi
        if recap and recap.get("lines"):
            handoff, from_bear = _handoff_for(beats, anchor, default_eng)
            nb = _make_verdict_beat(recap, handoff, "YTV01")
            beats.insert(anchor, nb)
            notes.append(f"verdict: INSERTED ({'from Bear' if from_bear else 'from Liam'})")
            # indices after `anchor` shifted by one
            if yi is not None and yi >= anchor:
                yi += 1
            if oi is not None and oi >= anchor:
                oi += 1
        else:
            notes.append("verdict: MISSING and no drafted recap — left without one")

    # ---- 2. YOUR TURN — Liam reads the relevant prompt in full
    if yt is not None:
        yt.update(LIAM)
        yp = _props(yt)
        yp["greeting"] = "Your turn."
        yp.setdefault("folderLabel", HANDLE)
        if prompt:
            yp["command"] = prompt
            yt["narration_text"] = prompt
            notes.append("your-turn: set relevant prompt + narration")
        else:
            notes.append("your-turn: NEEDS_PROMPT (left existing content)")

    # ---- 3. OUTRO title — Liam re-reads the title
    if outro is not None and title:
        outro.update(LIAM)
        outro["narration_text"] = title
        op = _props(outro)
        op["title"] = title
        op.setdefault("handle", HANDLE)
        notes.append("outro: Liam re-reads title")

    needs_prompt = (yt is not None) and not prompt
    return True, notes + (["needs_prompt"] if needs_prompt else [])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sheet", nargs="?")
    ap.add_argument("--root")
    ap.add_argument("--drafts", help="JSON map slug -> {prompt, recap}")
    ap.add_argument("--report")
    ap.add_argument("--drop-intro", action="store_true",
                    help="remove the opening Liam composer intro (science / Manim-explainer reels)")
    ap.add_argument("--books", help="comma-separated book names to include (batch scoping)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    drafts = {}
    if args.drafts and os.path.exists(args.drafts):
        drafts = json.load(open(args.drafts))

    if args.sheet:
        files = [args.sheet]
    elif args.root:
        # scope to reel folders (<book>/youtube/<slug>/beat_sheet.json) so foreign
        # or fixture beat sheets elsewhere in the tree are never touched
        files = glob.glob(os.path.join(args.root, "*", "youtube", "**", "beat_sheet.json"), recursive=True)
    else:
        ap.error("give a sheet or --root")

    if args.books:
        keep = {b.strip() for b in args.books.split(",")}
        files = [f for f in files if os.path.normpath(f).split(os.sep)[0] in keep]

    report = {"changed": [], "inserted_verdict": [], "skipped": [], "needs_prompt": [], "errors": []}
    for f in sorted(files):
        try:
            sheet = json.load(open(f))
        except Exception as e:
            report["skipped"].append({"file": f, "why": f"unreadable: {e}"}); continue
        folder = os.path.basename(os.path.dirname(f))
        slug = (sheet.get("metadata", {}) or {}).get("slug") if isinstance(sheet, dict) else None
        slug = slug or folder
        draft = drafts.get(slug) or drafts.get(folder)
        try:
            changed, notes = transform(sheet, slug, draft, drop_intro=args.drop_intro)
        except Exception as e:
            report["errors"].append({"file": f, "slug": slug, "why": repr(e)}); continue
        if not changed:
            report["skipped"].append({"file": f, "notes": notes}); continue
        if any("INSERTED" in n for n in notes):
            report["inserted_verdict"].append(slug)
        if "needs_prompt" in notes:
            report["needs_prompt"].append(slug)
        report["changed"].append({"slug": slug, "file": f, "notes": notes})
        if not args.dry_run:
            json.dump(sheet, open(f, "w"), indent=2, ensure_ascii=False)

    print(f"changed={len(report['changed'])} inserted_verdict={len(report['inserted_verdict'])} "
          f"skipped={len(report['skipped'])} needs_prompt={len(report['needs_prompt'])} "
          f"errors={len(report['errors'])}"
          f"{' (dry-run)' if args.dry_run else ''}")
    if args.report:
        json.dump(report, open(args.report, "w"), indent=2, ensure_ascii=False)
        print("report ->", args.report)


if __name__ == "__main__":
    main()
