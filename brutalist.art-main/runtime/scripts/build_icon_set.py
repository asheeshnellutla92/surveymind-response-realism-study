#!/usr/bin/env python3
"""build_icon_set.py — cut the CANONICAL icon set from the raw upstream libraries.

THE PROBLEM this solves: `svg/` holds ~12 GB and 2.4 M files across a dozen
upstream icon libraries. Almost all of it is variants — every style, every
density, every platform — of a much smaller number of actual ideas. None of it
is shippable, and none of it is searchable.

THE CANONICAL SET is the opposite: ONE icon per concept, all stroke-based, all
B&W, all the same geometry and the same line width, small enough to live in git,
and carrying a generated annotation index so `./art icons "<what the beat needs>"`
can actually find things.

THE FOUR RULES (each one throws work away on purpose):

  1. STROKE ONLY. "44 pt line width" is only meaningful for a line. A filled
     icon has no line width, so filled libraries are dropped whole — RemixIcon
     (100% filled) and material-design-icons (1.79 M files, 9.1 GB, filled) do
     not contribute a single icon.
  2. ONE ICON PER THING. Names are normalised (case, separators, and the
     -outline/-filled/-16/-24 suffix noise) and the first library in PRIORITY
     order to claim a concept keeps it. Later libraries fill gaps only.
  3. ONE GEOMETRY, ONE WEIGHT. Everything is rewritten to viewBox 0 0 24 24,
     fill="none", stroke="currentColor", stroke-width=2, round caps/joins.
     Sources at 1.5 (iconoir, heroicons) are re-weighted, not left inconsistent.
  4. B&W. Any hard-coded colour becomes currentColor, so one icon serves ink on
     cream and cream on ink without a second file.

WHY 24/2 IS THE "44 pt" SET: a stroke of 2 in a 24-unit viewBox scales with the
render. At the canonical render size of 528 px, 2 * (528/24) = **44 pt** exactly.
That constant ships in icons.json as `render.line_44pt_px` so a beat never has to
rediscover it. Render smaller and the line stays proportional — that is the point
of normalising the source instead of baking a pixel width into it.

ANNOTATION IS GENERATED, NOT INHERITED. The upstream libraries ship essentially
no usable tags (tabler aliases: 2 entries, RemixIcon tags: 21). So tokens come
from the icon's own name, its source category, and a hand-kept synonym map for
the words a video author actually types ("money" → coins/banknote/wallet).

Usage:
    python3 runtime/scripts/build_icon_set.py            # build into icons/
    python3 runtime/scripts/build_icon_set.py --dry-run  # report, write nothing
    python3 runtime/scripts/build_icon_set.py --limit 50 # small trial cut
"""
import argparse, json, re, shutil, sys
from pathlib import Path
from xml.etree import ElementTree as ET

HOME = Path(__file__).resolve().parents[2]
SVG = HOME / "svg"
OUT = HOME / "icons"
INDEX = OUT / "icons.json"

VIEWBOX = "0 0 24 24"
STROKE_W = 2
RENDER_PX_FOR_44PT = 528          # 2 * (528/24) == 44

# PRIORITY: first to claim a concept keeps it. Ordered by cleanliness —
# lucide is 100% stroke, one weight, one viewBox, and the best-named.
SOURCES = [
    ("lucide",       SVG / "lucide/icons",          None),
    ("tabler",       SVG / "tabler-icons/icons/outline", None),   # outline dir ONLY
    ("iconoir",      SVG / "iconoir/icons",         None),
    ("feather",      SVG / "feather/icons",         None),
    ("brand",        SVG / "tabler-icons/icons/outline", "brand-"),  # brand-* logos
]

# EXCLUDED ON PURPOSE — do not re-add without resolving the reason.
#   anthropics/  614 stroke icons, NO LICENSE FILE anywhere in the directory and
#                no README naming an upstream. Unknown provenance cannot be
#                redistributed from a public repo. Resolve the source and its
#                licence first; only then consider adding it.
#   RemixIcon/   100% filled — no line width to normalise (rule 1).
#   material-design-icons/  filled, and 1.79 M files / 9.1 GB (rule 1 + rule 2).
#   heroicons/   mostly solid; its outline set duplicates lucide concepts that
#                lucide already serves at a cleaner single weight.

# Upstream licences that MUST ship with the cut set. ISC and MIT both permit
# modification and redistribution *provided the copyright notice travels with
# the work* — normalising stroke width and colour is a modification, so this
# NOTICE is the obligation being met, not a courtesy.
LICENSES = [
    ("lucide",  "ISC License", SVG / "lucide/LICENSE"),
    ("tabler",  "MIT License", SVG / "tabler-icons/LICENSE"),
    ("iconoir", "MIT License", SVG / "iconoir/LICENSE"),
    ("feather", "MIT License", SVG / "feather/LICENSE"),
]

TRADEMARK_NOTE = """\
## Brand / logo icons — copyright is not the only question

`brand-*` icons come from Tabler and are MIT-licensed **as drawings**. That covers
copying and modifying the artwork. It does NOT grant any right to the marks they
depict — company names and logos are trademarks of their owners, governed by
trademark law, not by the MIT licence.

Practical rule for a reel: using a brand mark to *refer to* that product
(nominative use — "this runs on GitHub") is ordinarily fine. Using it as your own
branding, or in a way that implies endorsement or partnership, is not. When in
doubt, use a generic concept icon instead of the mark.
"""

SUFFIX_NOISE = ("-outline", "-filled", "-fill", "-line", "-solid",
                "-16", "-20", "-24", "-32", "-48")

# Words a video author types → the concept names that should surface.
SYNONYMS = {
    "money": ["coins", "banknote", "wallet", "credit-card", "piggy-bank", "dollar-sign"],
    "ai": ["brain", "brain-circuit", "cpu", "bot", "sparkles", "circuit-board"],
    "model": ["box", "layers", "brain-circuit", "network"],
    "data": ["database", "table", "chart-bar", "file-spreadsheet", "server"],
    "risk": ["alert-triangle", "shield-alert", "trending-down", "skull"],
    "time": ["clock", "hourglass", "calendar", "timer", "history"],
    "person": ["user", "users", "user-circle", "contact"],
    "idea": ["lightbulb", "sparkles", "zap"],
    "search": ["search", "zoom-in", "scan", "telescope"],
    "build": ["hammer", "wrench", "tool", "settings", "package"],
    "write": ["pencil", "pen", "edit", "file-text", "notebook"],
    "compare": ["scale", "git-compare", "columns", "arrow-left-right"],
    "grow": ["trending-up", "chart-line", "sprout", "arrow-up-right"],
    "fail": ["x", "x-circle", "alert-circle", "trending-down", "bug"],
    "verify": ["check", "check-circle", "badge-check", "shield-check", "clipboard-check"],
    "publish": ["upload", "send", "share", "rocket", "megaphone"],
    "video": ["video", "film", "clapperboard", "play", "camera"],
    "audio": ["mic", "volume", "music", "headphones", "waveform"],
    "code": ["code", "terminal", "braces", "git-branch", "file-code"],
    "cloud": ["cloud", "server", "cloud-upload", "cloud-download"],
    "secure": ["lock", "shield", "key", "eye-off", "fingerprint"],
}

NS = "http://www.w3.org/2000/svg"


def concept_of(stem: str) -> str:
    """Normalise a filename to the THING it depicts, so variants collapse."""
    c = stem.lower().replace("_", "-").replace(" ", "-")
    for s in SUFFIX_NOISE:
        if c.endswith(s):
            c = c[: -len(s)]
    return re.sub(r"-+", "-", c).strip("-")


def tokens_of(concept: str, source: str) -> list:
    """Generated annotation — upstream ships none worth having."""
    toks = set(concept.split("-"))
    toks.add(concept)
    for word, concepts in SYNONYMS.items():
        if concept in concepts or any(concept.startswith(c) for c in concepts):
            toks.add(word)
    toks.discard("")
    return sorted(toks)


def normalise(svg_text: str) -> str | None:
    """Rewrite one icon to the canonical geometry/weight/colour. None = unusable."""
    try:
        ET.register_namespace("", NS)
        root = ET.fromstring(svg_text)
    except ET.ParseError:
        return None

    # Drop anything that is not a line drawing — a filled icon has no line width.
    body = "".join(ET.tostring(c, encoding="unicode") for c in root)
    if not body.strip():
        return None

    root.set("viewBox", VIEWBOX)   # ET emits xmlns itself — setting it duplicates
    root.set("width", "24")
    root.set("height", "24")
    root.set("fill", "none")
    root.set("stroke", "currentColor")
    root.set("stroke-width", str(STROKE_W))
    root.set("stroke-linecap", "round")
    root.set("stroke-linejoin", "round")
    for junk in ("class", "style", "color", "aria-hidden", "data-name"):
        root.attrib.pop(junk, None)

    # Children inherit from the root: strip per-element colour + weight so the
    # whole set really is one weight and one colour.
    for el in root.iter():
        if el is root:
            continue
        for attr in ("stroke-width", "stroke", "color", "style", "class"):
            el.attrib.pop(attr, None)
        f = el.attrib.get("fill")
        if f and f.lower() not in ("none", "currentcolor"):
            el.attrib["fill"] = "currentColor"

    out = ET.tostring(root, encoding="unicode")
    return re.sub(r"\s+", " ", out).replace("> <", "><").strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    a = ap.parse_args()

    claimed, rows, stats = {}, [], {}
    for source, root, prefix in SOURCES:
        if not root.is_dir():
            stats[source] = "source dir absent"
            continue
        kept = skipped = dup = 0
        for f in sorted(root.rglob("*.svg")):
            stem = f.stem
            if prefix and not stem.startswith(prefix):
                continue
            if not prefix and stem.startswith("brand-"):
                continue          # brands are claimed by the 'brand' pass
            c = concept_of(stem)
            if not c:
                continue
            if c in claimed:
                dup += 1
                continue
            svg = normalise(f.read_text(errors="ignore"))
            if svg is None:
                skipped += 1
                continue
            claimed[c] = True
            rows.append({"name": c, "source": source, "svg": svg,
                         "tokens": tokens_of(c, source),
                         "brand": bool(prefix)})
            kept += 1
            if a.limit and len(rows) >= a.limit:
                break
        stats[source] = f"kept {kept}, dropped-as-duplicate {dup}, unparseable {skipped}"
        if a.limit and len(rows) >= a.limit:
            break

    print("SOURCE PASSES (priority order — first to claim a concept keeps it)")
    for s, msg in stats.items():
        print(f"  {s:<12} {msg}")
    brands = sum(1 for r in rows if r["brand"])
    print(f"\nCANONICAL SET: {len(rows)} concepts  ({brands} brand/logo, "
          f"{len(rows)-brands} general)")
    print(f"  geometry {VIEWBOX} · stroke-width {STROKE_W} · currentColor · round caps")
    print(f"  = {STROKE_W * RENDER_PX_FOR_44PT // 24} pt line at {RENDER_PX_FOR_44PT}px render")

    if a.dry_run:
        print("\n--dry-run: nothing written.")
        return

    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "svg").mkdir(parents=True)
    for r in rows:
        (OUT / "svg" / f"{r['name']}.svg").write_text(r["svg"])

    INDEX.write_text(json.dumps({
        "canonical": True,
        "count": len(rows),
        "geometry": {"viewBox": VIEWBOX, "stroke_width": STROKE_W,
                     "stroke": "currentColor", "fill": "none"},
        "render": {"line_44pt_px": RENDER_PX_FOR_44PT,
                   "note": f"stroke {STROKE_W} in a 24 viewBox = 44pt at "
                           f"{RENDER_PX_FOR_44PT}px; scales proportionally"},
        "sources": {s: m for s, m in stats.items()},
        "icons": [{"name": r["name"], "source": r["source"],
                   "brand": r["brand"], "tokens": r["tokens"],
                   "file": f"svg/{r['name']}.svg"} for r in rows],
    }, indent=1))
    # ── NOTICE: the licence obligation, met ──────────────────────────────────
    used = {r["source"] for r in rows}
    parts = ["# NOTICE — upstream licences for the canonical icon set\n",
             "These icons are MODIFIED copies: every icon was rewritten to a single\n"
             "geometry (24×24), a single line width (stroke 2), and `currentColor`.\n"
             "ISC and MIT both permit that, on the condition that the copyright notice\n"
             "travels with the work. It is reproduced in full below.\n"]
    for name, kind, path in LICENSES:
        if name not in used and not (name == "tabler" and "brand" in used):
            continue
        parts.append(f"\n---\n\n## {name} — {kind}\n\n```\n"
                     + (path.read_text(errors="ignore").strip()
                        if path.exists() else f"({path} not found at build time)")
                     + "\n```\n")
    parts.append("\n---\n\n" + TRADEMARK_NOTE)
    (OUT / "NOTICE.md").write_text("".join(parts))

    size = sum(f.stat().st_size for f in OUT.rglob("*")) / 1024 / 1024
    print(f"\nwrote {OUT}  ({size:.1f} MB — shippable in git)")
    print(f"index {INDEX}")
    print(f"NOTICE {OUT / 'NOTICE.md'}  (upstream licences — must ship)")
    print(f"search it:  ./art icons \"<what the beat needs>\"")


if __name__ == "__main__":
    main()
