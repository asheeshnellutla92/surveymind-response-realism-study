#!/usr/bin/env python3
"""scene_search.py — library-first scene lookup. Ask BEFORE you author a beat.

THE DOCTRINE (same as pantry_search.py's, one level up the stack): before a beat
is routed to Manim, or slated, or sent to a human as a request card, search here.
The library has 750+ renderable compositions and no one can hold that in their
head — which is exactly how a reel ends up with ten beats slated while a
purpose-built component sits unused two directories away.

A hit is a LEAD, not a verdict. Read the desc and the props; a name match with
the wrong props is not a match.

A genuine miss is a PUNT, and a punt is a design card — stop and build the
component, then it is in the library forever. It is not a licence to slate.
A miss is LOGGED AUTOMATICALLY to TEMPLATE-MISSES.md so the punt ledger stops
depending on anyone's discipline. Pass --reel <path> so the row says who needed it.

Usage (from brutalist-art/):
    python3 runtime/scripts/scene_search.py "access boundary folders"
    python3 runtime/scripts/scene_search.py "schedule recurring" --top 5
    python3 runtime/scripts/scene_search.py "words falling" --reel ../book/youtube/slug
    python3 runtime/scripts/scene_search.py --check FormBCard ClaudeUsageBeat
    python3 runtime/scripts/scene_search.py --undocumented        # the backfill list
    python3 runtime/scripts/scene_search.py "..." --no-log        # exploring, do not log

Or through the toolkit entry point:  ./art scenes "words falling"
"""
import json, sys, re, datetime
from pathlib import Path

HERE = Path(__file__).resolve()
IDX = None
for cand in [HERE.parents[1] / "remotion" / "src" / "scenes.json",
             Path("runtime/remotion/src/scenes.json"),
             Path("brutalist-art/runtime/remotion/src/scenes.json")]:
    if cand.exists():
        IDX = cand
        break
if IDX is None:
    sys.exit("scenes.json not found — run build_scene_index.py first")

LEDGER = HERE.parents[2] / "TEMPLATE-MISSES.md"
AUTO_HEADER = "## Auto-logged search misses (scene_search.py)"

data = json.loads(IDX.read_text())
scenes = data["scenes"]
by_id = {s["id"]: s for s in scenes}

argv = sys.argv[1:]
VALUED = ("--top", "--reel")            # flags that consume the next token
def opt(name, default=None):
    return argv[argv.index(name) + 1] if name in argv and argv.index(name) + 1 < len(argv) else default
args, skip = [], False
for i, a in enumerate(argv):            # the query is what is left after the flags
    if skip:
        skip = False
        continue
    if a in VALUED:
        skip = True
        continue
    if a.startswith("--"):
        continue
    args.append(a)

top = int(opt("--top", 8))
reel = opt("--reel", "")

# --undocumented: what the library cannot describe about itself yet.
if "--undocumented" in argv:
    der = [s for s in scenes if s.get("desc_source") == "derived"]
    print(f"{len(der)} of {len(scenes)} scenes run on DERIVED search text "
          f"(no header comment in the component):\n")
    for s in der:
        print(f"  {s['id']:34s} {s.get('file') or '?'}")
    print("\nEach needs one honest sentence at the top of its .tsx — what it puts on")
    print("screen, and when to reach for it. Then re-run build_scene_index.py --todo.")
    sys.exit(0)

# --check: is this exact name renderable? The question that stops a slate.
if "--check" in argv:
    for name in args:
        s = by_id.get(name)
        if s:
            print(f"  {name:28s} RENDERABLE   {s['aspect']}   props: {', '.join(s['props'][:6]) or '—'}")
        else:
            print(f"  {name:28s} NOT RENDERABLE — no <Composition> in Root.tsx. Authoring this is a punt.")
    sys.exit(0)

q = " ".join(args).lower()
if not q:
    sys.exit(__doc__)
QSTOP = set("""the and for with that this from into your not are was were will would
any all its it's out one has have had can does did but who whose when where what how
show shows shown scene beat like just make made need needs want use used using""".split())
terms = [t for t in re.findall(r"[a-z0-9]+", q) if len(t) > 2 and t not in QSTOP]
if not terms:
    sys.exit("every word in that query is a stop word — search for the mechanic, not the sentence.")

def hay_of(s):
    return " ".join([s["id"].lower(), s["desc"].lower(), s.get("when", "").lower(),
                     s.get("folder", "").lower(), s.get("group", "").lower(),
                     " ".join(s["props"]).lower(), " ".join(s["synonyms"])])

# A rare word carries more signal than a common one: "sankey" should beat "flow".
_hays = [hay_of(s) for s in scenes]
DF = {t: sum(1 for h in _hays if t in h) for t in terms}
def weight(t):
    df = DF.get(t, 0)
    return 2.0 if df <= 12 else (1.5 if df <= 60 else 1.0)

def score(s):
    idl = s["id"].lower()
    syn = s["synonyms"]
    hay = hay_of(s)          # desc, when, folder, group and props are all surface now
    n = 0
    for t in terms:
        if t in idl:
            n += 3 * weight(t)
        elif t in syn:
            n += 2 * weight(t)
        elif t in hay:
            n += 1 * weight(t)
    if s.get("desc_source") == "derived":     # a described scene outranks a guessed one
        n -= 0.5
    return n

hits = sorted(((score(s), s) for s in scenes), key=lambda x: -x[0])
# a single weak substring hit is noise, not a lead
hits = [(n, s) for n, s in hits if n >= 2][:top]

def log_miss(query, reel):
    """A genuine miss is a design card. Write it down before it is forgotten."""
    if "--no-log" in argv:
        return
    day = datetime.date.today().isoformat()
    row = f"| {day} | `{query}` | {reel or '—'} |"
    try:
        text = LEDGER.read_text() if LEDGER.exists() else "# TEMPLATE-MISSES\n"
    except OSError:
        return
    if f"| `{query}` | {reel or '—'} |" in text:      # already on the ledger
        return
    if AUTO_HEADER not in text:
        text += (f"\n\n---\n\n{AUTO_HEADER}\n\n"
                 "Written by `scene_search.py` when a search returns nothing. Each row is a\n"
                 "beat that had no component to reach for — the raw material of the next\n"
                 "design card. Clear a row by building the component (then it is in the\n"
                 "library forever) or by striking it if the query was simply badly worded.\n\n"
                 "| Date | Query | Reel |\n|---|---|---|\n")
    text = text.rstrip("\n") + "\n" + row + "\n"
    try:
        LEDGER.write_text(text)
        print(f"logged to {LEDGER.name} — a miss is a design card, not a licence to slate.")
    except OSError:
        pass

if not hits:
    print(f'no scene matches "{q}".')
    print("That is a PUNT. Do not slate it — design the component, add it to the library,")
    print("and the next reel that needs this will find it here.")
    log_miss(q, reel)
    sys.exit(1)

if hits[0][0] < 3:
    print("WEAK MATCH — nothing scored above a passing word. Read these, but treat a")
    print("bad fit as a punt: build the component rather than slating the beat.\n")
print(f'{len(hits)} candidate(s) for "{q}"  —  a hit is a lead, read the props:\n')
for n, s in hits:
    tag = "  [derived text — open the file]" if s.get("desc_source") == "derived" else ""
    where = s.get("folder") or s.get("group") or ""
    print(f"  [{n:4.1f}] {s['id']}   ({s['aspect']}){tag}")
    if where:
        print(f"       under: {where[:88]}")
    if s["desc"]:
        print(f"       {s['desc'][:200]}")
    if s.get("when"):
        print(f"       WHEN: {s['when'][:150]}")
    if s["props"]:
        print(f"       props: {', '.join(s['props'][:8])}")
    print()
