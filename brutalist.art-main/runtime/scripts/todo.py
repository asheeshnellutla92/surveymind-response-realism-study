#!/usr/bin/env python3
"""todo.py — the per-video beat ledger: which beats still need filling, and how.

The beat sheet is the heart; this ledger is a DERIVED VIEW (never hand-edit it —
change the beat sheet instead). For every beat it reports:

    status   filled | needs-fill
    method   manim | remotion | ai-video-prompt | historical-image | user-capture
    who      pipeline | human
    prompt   suggested generation prompt / search terms (when method needs one)
    slot     the filename that satisfies the beat

Writes <reel>/todo.json (machine-readable, for agents) and <reel>/STATUS.md
(human-readable mirror). Regenerated on every compile pass via run.sh, so it
never drifts from the clips actually on disk.

Usage:
  python3 runtime/scripts/todo.py <reel-folder>                 # regenerate + print summary
  python3 runtime/scripts/todo.py <reel-folder> --method manim  # list beats with that fill method
  python3 runtime/scripts/todo.py <reel-folder> --open          # only beats still needing fill
  python3 runtime/scripts/todo.py <reel-folder> --json          # print todo.json to stdout

Agent loop (the intended use): ask for every beat suggesting animated_graphics
(`--method manim --open`), try to fill each; if a prompt-based clip or an actual
historical image would teach better, update that beat's annotations in
beat_sheet.json (the heart) and re-run — the ledger and the slate request card
follow automatically.
"""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from beat_plan import fill_plan  # noqa: E402

METHOD_TO_SCENE_HINT = {"manim": "animated_graphics"}


def resolve_slot(folder: Path, bid: str):
    """Mirror of compile.py slot resolution: what's on disk for this beat?"""
    for rel, status in ((f"media/{bid}.mp4", "VIDEO"), (f"manim/{bid}.mp4", "MANIM"),
                        (f"manim/{bid}.mov", "MANIM"), (f"media/{bid}.png", "STILL")):
        if (folder / rel).exists():
            return rel, status
    return None, "SLATE"


def build_ledger(folder: Path) -> dict:
    sheet = folder / "beat_sheet.json"
    if not sheet.exists():
        sys.exit(f"[todo] no beat_sheet.json in {folder}")
    data = json.loads(sheet.read_text())
    beats = data["beats"] if isinstance(data, dict) and "beats" in data else data

    entries = []
    for b in beats:
        bid = b.get("beat_id", "B??")
        rel, slot_status = resolve_slot(folder, bid)
        plan = fill_plan(b)
        filled = slot_status != "SLATE"
        entries.append({
            "beat_id": bid,
            "status": "filled" if filled else "needs-fill",
            "on_disk": rel,
            "method": plan["method"],
            "who": plan["responsible"],
            "scene_hint": METHOD_TO_SCENE_HINT.get(plan["method"]),
            "prompt": plan["prompt"],
            "slot": plan["slot"],
            "label": (b.get("new_visual_element") or b.get("narration_text", ""))[:100],
        })
    open_n = sum(1 for e in entries if e["status"] == "needs-fill")
    return {"video": folder.name, "metadata": (data.get("metadata") if isinstance(data, dict) else {}) or {},
            "source_of_truth": "beat_sheet.json — edit the sheet, not this file",
            "beats_total": len(entries), "beats_open": open_n, "beats": entries}


def write_status_md(folder: Path, ledger: dict):
    L = [f"# STATUS — {ledger['video']}", "",
         f"{ledger['beats_total'] - ledger['beats_open']}/{ledger['beats_total']} beats filled. "
         f"Derived from beat_sheet.json — edit the sheet, not this file.", "",
         "| beat | status | fill method | who | slot | suggested prompt / search |",
         "|---|---|---|---|---|---|"]
    for e in ledger["beats"]:
        mark = "✅" if e["status"] == "filled" else "⬜"
        L.append(f"| {e['beat_id']} | {mark} {e['status']} | {e['method']} | {e['who']} "
                 f"| `{e['on_disk'] or e['slot']}` | {(e['prompt'] or '')[:90]} |")
    (folder / "STATUS.md").write_text("\n".join(L) + "\n")


def main():
    ap = argparse.ArgumentParser(description="Per-video beat ledger (todo.json + STATUS.md + ToDo.md)")
    ap.add_argument("reel", help="reel folder containing beat_sheet.json")
    ap.add_argument("--method", help="filter: only beats whose fill method matches "
                                     "(manim|remotion|ai-video-prompt|historical-image|user-capture "
                                     "or a scene hint like animated_graphics)")
    ap.add_argument("--open", action="store_true", help="only beats still needing fill")
    ap.add_argument("--json", action="store_true", help="print todo.json to stdout")
    a = ap.parse_args()

    folder = Path(a.reel).resolve()
    ledger = build_ledger(folder)
    (folder / "todo.json").write_text(json.dumps(ledger, indent=2) + "\n")
    write_status_md(folder, ledger)
    write_todo_md(folder, ledger, ledger.get("metadata", {}))

    rows = ledger["beats"]
    if a.open:
        rows = [e for e in rows if e["status"] == "needs-fill"]
    if a.method:
        m = a.method.lower()
        rows = [e for e in rows if e["method"] == m or (e["scene_hint"] or "") == m]

    if a.json:
        print(json.dumps({**ledger, "beats": rows}, indent=2))
        return
    print(f"[todo] {ledger['video']}: {ledger['beats_total'] - ledger['beats_open']}"
          f"/{ledger['beats_total']} filled → todo.json + STATUS.md + ToDo.md")
    for e in rows:
        p = f"  · prompt: {e['prompt'][:80]}" if e["prompt"] else ""
        print(f"  {e['beat_id']:>5}  {e['status']:<10} {e['method']:<17} {e['who']:<8} {e['slot']}{p}")




# --- ToDo.md: a human fill-list so you never re-watch the video ---------------
import re as _re, urllib.parse as _url

# free / open-license image & footage archives, as search-URL templates
_ARCHIVES = {
    "Smithsonian Open Access": "https://www.si.edu/search/collection-images?edan_q={q}",
    "Wikimedia Commons":       "https://commons.wikimedia.org/w/index.php?search={q}&title=Special:MediaSearch&type=image",
    "Library of Congress":     "https://www.loc.gov/search/?q={q}&fa=access-restricted:false",
    "NASA Images":             "https://images.nasa.gov/search-results?q={q}",
    "AIP Segrè (physics)":     "https://repository.aip.org/?f%5Bcollection_title%5D=Emilio+Segre+Visual+Archives&q={q}",
    "Wellcome (science/med)":  "https://wellcomecollection.org/search/images?query={q}",
    "Met Open Access":         "https://www.metmuseum.org/art/collection/search?q={q}&showOnly=openAccess",
    "Internet Archive":        "https://archive.org/search?query={q}",
}
_STOP = set("the a an of to in on for with and or is are was were be as by at from into this that "
            "we you it its their his her they how why what when where which one two both each".split())

def _keywords(text, n=6):
    words = _re.findall(r"[A-Za-z][A-Za-z\-]{2,}", text or "")
    out, seen = [], set()
    for w in words:
        lw = w.lower()
        if lw in _STOP or lw in seen:
            continue
        seen.add(lw); out.append(w)
        if len(out) >= n:
            break
    return " ".join(out) or (text or "").strip()[:60]

def _topic_extra(meta):
    blob = " ".join(str(meta.get(k, "")) for k in ("series","book","topic","segment")).lower()
    if any(k in blob for k in ("physics","quantum","electromag","mechanic","optic","particle","astro","cosmo")):
        return ["NASA Images", "AIP Segrè (physics)"]
    if any(k in blob for k in ("cancer","bio","medic","nano","cell","clinical","pharma","health")):
        return ["Wellcome (science/med)"]
    if any(k in blob for k in ("history","art","civic","policy","law","society","culture")):
        return ["Met Open Access", "Internet Archive"]
    return ["NASA Images"]

def _sources_for(entry, meta):
    q = _url.quote_plus(_keywords(entry.get("prompt") or entry.get("label") or ""))
    method = entry["method"]
    lines = []
    if method == "user-capture":
        lines.append("  - You capture this (screen / camera recording) — no archive source.")
        return lines
    if method in ("ai-video-prompt",):
        lines.append(f"  - GENERATE (motion): render it yourself (Manim / Remotion / screen capture) → save as `{entry['slot']}`.")
        lines.append("  - If a STILL would teach as well, use an archive below (then it's a Ken-Burns still, not a clip):")
    names = ["Smithsonian Open Access", "Wikimedia Commons", "Library of Congress"] + _topic_extra(meta)
    for name in dict.fromkeys(names):
        lines.append(f"  - {name}: {_ARCHIVES[name].format(q=q)}")
    return lines

def write_todo_md(folder: Path, ledger: dict, meta: dict):
    human = [e for e in ledger["beats"] if e["status"] == "needs-fill" and e["who"] == "human"]
    L = [f"# ToDo — {ledger['video']}", "",
         f"{len(human)} slot(s) need YOU. Fill each, drop the file at the named pantry path, then re-run `run.sh`.",
         "Everything you need is here — you do not need to re-watch the video.", ""]
    if not human:
        L.append("Nothing outstanding — every human slot is filled (or every beat is machine-made). ✅")
    for e in human:
        need = {"ai-video-prompt": "a 5–10s clip (generate or an archive still)",
                "historical-image": "a real/archival image",
                "user-capture": "a screen or camera recording"}.get(e["method"], "media")
        L += [f"## {e['beat_id']} — {need}",
              f"- **Teaches:** {(e['label'] or '').strip()[:140]}",
              f"- **Drop it here (pantry):** `{e['slot']}`",
              f"- **Suggested prompt / search:** {e['prompt'] or '(see the beat)'}",
              "- **Where to find / make it:**", *(_sources_for(e, meta)), ""]
    (folder / "ToDo.md").write_text("\n".join(L) + "\n")


if __name__ == "__main__":
    main()
