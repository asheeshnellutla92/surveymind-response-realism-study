#!/usr/bin/env python3
"""icon_search.py — find an icon in the canonical set. Ask BEFORE you draw one.

Sibling of scene_search.py, one level down the stack: scenes are whole beats,
icons are the marks inside them. Same doctrine — a library nobody can search is
the same as no library, and the failure it prevents is identical: a beat gets a
hand-drawn one-off, or a slate, while a perfectly good mark sits in icons/.

7,000+ icons is far past what anyone can hold in their head, so the index carries
GENERATED annotation: the icon's own name, its parts, and a synonym map for the
words a video author actually types — "money" finds `coins`, `banknote`, `wallet`;
"ai" finds `brain-circuit`, `cpu`, `bot`.

RANKING, most trusted first:
    exact name  >  every query word present  >  name prefix  >  token hit
Rare words outrank common ones, so "database" beats "data" in "data database".

A MISS IS NOT A LICENCE TO DRAW. The set is one icon per concept on purpose; if
nothing fits, the honest answers are (a) a nearby concept, (b) compose two icons,
or (c) the concept genuinely is not iconographic — say so in the beat, do not
invent a bespoke mark that will never be found again.

Usage (from brutalist.art/):
    python3 runtime/scripts/icon_search.py "money"
    python3 runtime/scripts/icon_search.py "risk warning" --top 12
    python3 runtime/scripts/icon_search.py --check brain-circuit database
    python3 runtime/scripts/icon_search.py "github" --brands
    python3 runtime/scripts/icon_search.py --show database      # print the SVG

Or through the entry point:   ./art icons "money"
"""
import argparse, json, math, sys
from collections import Counter
from pathlib import Path

HOME = Path(__file__).resolve().parents[2]
INDEX = HOME / "icons" / "icons.json"

STOP = {"a", "an", "the", "of", "for", "to", "in", "on", "and", "or",
        "icon", "symbol", "image", "picture", "show", "showing", "that", "with"}


def load():
    if not INDEX.exists():
        sys.exit(f"icon_search: no index at {INDEX}\n"
                 f"  build it first:  python3 runtime/scripts/build_icon_set.py")
    return json.loads(INDEX.read_text())


def rank(icons, query, want_brands=None):
    words = [w for w in query.lower().replace("-", " ").split() if w not in STOP]
    if not words:
        return []
    # Rarer query words carry more weight — "sankey" should beat "flow".
    df = Counter()
    for ic in icons:
        toks = set(ic["tokens"])
        for w in words:
            if w in toks:
                df[w] += 1
    n = len(icons)
    idf = {w: math.log((n + 1) / (df.get(w, 0) + 1)) + 1 for w in words}

    hits = []
    for ic in icons:
        if want_brands is True and not ic["brand"]:
            continue
        if want_brands is False and ic["brand"]:
            continue
        name, toks = ic["name"], set(ic["tokens"])
        score = 0.0
        matched = 0
        for w in words:
            if w in toks:
                score += 3 * idf[w]
                matched += 1
            elif any(t.startswith(w) for t in toks):
                score += 1.5 * idf[w]
                matched += 1
            elif w in name:
                score += 1.0 * idf[w]
                matched += 1
        if not matched:
            continue
        if name == query.lower().replace(" ", "-"):
            score += 100
        if matched == len(words):
            score += 10                      # every word present
        if name.startswith(words[0]):
            score += 4
        score -= 0.12 * len(name.split("-"))  # prefer the plainer name
        hits.append((score, ic))
    hits.sort(key=lambda x: (-x[0], x[1]["name"]))
    return hits


def main():
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument("query", nargs="*")
    ap.add_argument("--top", type=int, default=10)
    ap.add_argument("--check", nargs="+", metavar="NAME",
                    help="is that icon in the set? the anti-redraw check")
    ap.add_argument("--show", metavar="NAME", help="print an icon's SVG")
    ap.add_argument("--brands", action="store_true", help="brand/logo icons only")
    ap.add_argument("--no-brands", action="store_true", help="exclude brand/logo icons")
    a = ap.parse_args()

    data = load()
    icons = data["icons"]
    by_name = {ic["name"]: ic for ic in icons}

    if a.show:
        ic = by_name.get(a.show)
        if not ic:
            sys.exit(f"not in the set: {a.show}")
        print((HOME / "icons" / ic["file"]).read_text())
        return

    if a.check:
        for name in a.check:
            ic = by_name.get(name)
            if ic:
                kind = "brand/logo" if ic["brand"] else "concept"
                print(f"  {name:<28} IN SET   {kind:<11} {ic['file']}")
            else:
                near = [n for n in by_name if name in n or n in name][:4]
                tail = f"  near: {', '.join(near)}" if near else ""
                print(f"  {name:<28} not in the set.{tail}")
        return

    if not a.query:
        g, r = data["geometry"], data["render"]
        print(f"canonical icon set — {data['count']} icons "
              f"({sum(1 for i in icons if i['brand'])} brand/logo)")
        print(f"  {g['viewBox']} · stroke-width {g['stroke_width']} · {g['stroke']}")
        print(f"  {r['note']}")
        print(f"\n  ./art icons \"money\"            search")
        print(f"  ./art icons --check database   is it in the set?")
        print(f"  ./art icons --show database    print the SVG")
        return

    want = True if a.brands else (False if a.no_brands else None)
    hits = rank(icons, " ".join(a.query), want)
    if not hits:
        print(f'no icon matches "{" ".join(a.query)}".')
        print("  A miss is NOT a licence to draw a one-off. Try a nearby concept,")
        print("  compose two icons, or accept the idea is not iconographic.")
        return
    print(f'{len(hits)} match "{" ".join(a.query)}" — top {min(a.top, len(hits))}:\n')
    for score, ic in hits[:a.top]:
        tag = "brand" if ic["brand"] else ic["source"]
        toks = " ".join(t for t in ic["tokens"] if t != ic["name"])[:52]
        print(f"  {ic['name']:<30} {tag:<8} {ic['file']}")
        if toks:
            print(f"     {toks}")


if __name__ == "__main__":
    main()
