#!/usr/bin/env python3
"""fill_slates.py — fill every slate beat (no mp4) with a FormACard Remotion scene.

A slate beat is one that has neither media/<bid>.mp4 nor manim/<bid>.mp4 and carries no
shot.remotion.pattern yet. This script stamps each such beat with:
  shot.remotion.pattern = "FormACard"
  shot.remotion.props   = { lines: [headline], dark: false }

Then calls remotion_scenes.py to render → media/<bid>.mp4, and run.sh to recompile the
review cut. Dry-run by default; --apply renders and recompiles.

Usage:
  python3 scripts/fill_slates.py                     # dry-run: list all slates
  python3 scripts/fill_slates.py --apply             # stamp + render + recut all reels
  python3 scripts/fill_slates.py <REEL> --apply      # one reel only
"""
import argparse, json, os, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]   # runtime/

_NVM_NODE = Path.home() / ".nvm" / "versions" / "node"
def _node_env():
    env = dict(os.environ)
    if _NVM_NODE.is_dir():
        for c in sorted(_NVM_NODE.iterdir(), reverse=True):
            nb = c / "bin"
            if (nb / "node").exists():
                env["PATH"] = str(nb) + os.pathsep + env.get("PATH", "")
                break
    return env


def _truncate(text: str, words: int = 12) -> str:
    """Return first N words of text, appending '…' if truncated."""
    if not text:
        return ""
    parts = text.split()
    if len(parts) <= words:
        return text
    return " ".join(parts[:words]) + "…"


def _topic(sheet: dict) -> str:
    """Extract topic eyebrow from beat sheet metadata."""
    meta = sheet.get("metadata", {})
    return (meta.get("topic") or meta.get("series") or
            meta.get("book") or "").upper()


def slate_resolves(reel: Path, bid: str) -> bool:
    for rel in (f"media/{bid}.mp4", f"manim/{bid}.mp4", f"manim/{bid}.mov"):
        if (reel / rel).exists():
            return False
    return True


def find_slates(reel: Path):
    """Return list of beats that need a FormACard fill."""
    sheet_path = reel / "beat_sheet.json"
    if not sheet_path.exists():
        return [], None
    sheet = json.loads(sheet_path.read_text())
    slates = []
    for b in sheet.get("beats", []):
        bid = b.get("beat_id", "")
        if not slate_resolves(reel, bid):
            continue
        if b.get("silent"):
            continue
        if b.get("shot", {}).get("remotion", {}).get("pattern"):
            continue
        slates.append(b)
    return slates, sheet


def stamp_slates(reel: Path, slates: list, sheet: dict):
    """Stamp FormACard pattern+props onto each slate beat and write beat_sheet.json.

    SlateCard is DELETED (2026-08-26, Bear's order — DESIGN-PRINCIPLES §1 banned
    card: eyebrow/kicker + bold sans headline + rule + decorative circle). Slates
    now fill with the Form A card: serif lines only, no chrome, no redundant
    act-name echo.
    """
    changed = False
    for b in slates:
        bid = b["beat_id"]
        headline = _truncate(b.get("narration_text", ""), words=11)
        if not headline:
            headline = b.get("name", bid)
        shot = b.setdefault("shot", {})
        shot["remotion"] = {
            "pattern": "FormACard",
            "provenance": "proven-core/FormACard",
            "version": "1",
            "props": {
                "lines": [headline],
                "dark": False,
            },
        }
        changed = True
    if changed:
        (reel / "beat_sheet.json").write_text(
            json.dumps(sheet, indent=1, ensure_ascii=False)
        )
    return changed


def render_reel(reel: Path, env: dict) -> list:
    acts = []
    r = subprocess.run(
        [sys.executable, str(HERE / "scripts" / "remotion_scenes.py"), str(reel)],
        env=env, capture_output=True, text=True,
    )
    if r.returncode != 0:
        acts.append(f"REMOTION FAIL: {(r.stderr or r.stdout)[-300:]}")
        return acts
    acts.append("remotion: ok")

    r = subprocess.run(
        ["bash", str(HERE / "scripts" / "run.sh"), str(reel)],
        env=env, capture_output=True, text=True,
    )
    if r.returncode != 0:
        acts.append(f"ART_RUN FAIL: {(r.stderr or r.stdout)[-300:]}")
        return acts
    review = reel / f"{reel.name}-slate.mp4"
    sz = f"{review.stat().st_size // 1024}K" if review.exists() else "missing"
    acts.append(f"recut: {review.name} ({sz})")
    return acts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("reel", nargs="?", type=Path)
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--books", type=Path, default=HERE.parent)
    a = ap.parse_args()

    if a.reel:
        reels = [a.reel.resolve()]
    else:
        reels = sorted(
            r for book in sorted(a.books.resolve().iterdir())
            if (book / "youtube").is_dir()
            for r in sorted((book / "youtube").iterdir())
            if r.is_dir() and (r / "beat_sheet.json").exists()
        )

    env = _node_env()
    total_slates = 0
    affected_reels = []

    for reel in reels:
        slates, sheet = find_slates(reel)
        if not slates:
            continue
        total_slates += len(slates)
        affected_reels.append((reel, slates, sheet))

    mode = "APPLY" if a.apply else "DRY-RUN"
    print(f"[fill-slates] {mode}: {len(affected_reels)} reels, "
          f"{total_slates} slate beats to fill")

    if not a.apply:
        for reel, slates, _ in affected_reels[:20]:
            book = reel.parents[1].name
            bids = [b["beat_id"] for b in slates]
            print(f"  {book}/{reel.name}: {bids}")
        if len(affected_reels) > 20:
            print(f"  … and {len(affected_reels) - 20} more reels")
        print("\nRe-run with --apply to stamp + render + recut.")
        return

    ok_reels = fail_reels = 0
    for reel, slates, sheet in affected_reels:
        book = reel.parents[1].name
        bids = [b["beat_id"] for b in slates]
        stamp_slates(reel, slates, sheet)
        acts = render_reel(reel, env)
        status = "ok" if not any("FAIL" in a for a in acts) else "FAIL"
        if status == "ok":
            ok_reels += 1
        else:
            fail_reels += 1
        print(f"  [{status}] {book}/{reel.name}  {bids}  |  " + " | ".join(acts))

    print(f"[fill-slates] done — {ok_reels} ok, {fail_reels} failed")


if __name__ == "__main__":
    main()
