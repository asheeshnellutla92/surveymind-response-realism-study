#!/usr/bin/env python3
"""build_scene_index.py — generate scenes.json, the renderable-scene index.

THE LAW: a scene is usable only if Root.tsx declares a <Composition id="..."> for
it. A .tsx file in scenes/ is NOT enough — several exist that no composition
references, and they are invisible to the pipeline. This index is generated from
Root.tsx for that reason: registered is the only truth.

THE INDEX IS THE SEARCH SURFACE. scene_search.py can only find a scene through
the text stored here, so this script's job is to carry as much of the component's
own account of itself as possible:

  * every composition is resolved to its BACKING FILE through the import map —
    scenes/, top-level illustration comps, and multi-export modules
    (deckPatterns, illustrations/kit) alike. A composition with no file has no
    desc, no props and no synonyms, and is invisible to search;
  * `desc` is the real opening of the component's header — NOT the fragment
    before the first em-dash (the old bug: "BrutalistCommandRain —");
  * `when` carries the header's own use-when / reach-for sentence, which is what
    a beat author is actually searching for;
  * `synonyms` are mined from the header body (accent laws, sibling
    disambiguation, mechanics), the folder, and the prop names — not just a
    CamelCase split of the id;
  * a component with no header at all still gets DERIVED search text from
    evidence in the file (name, folder, props, defaultProps copy). Derived text
    is marked `desc_source: "derived"` and `documented: false` — it is never
    presented as the component's own account of itself.

Run from brutalist-art/runtime/remotion/src/:
    python3 ../../scripts/build_scene_index.py

Writes  scenes.json  next to Root.tsx. Regenerate after adding any component.
`--todo` also writes SCENE-DOC-TODO.md — the backfill list of scenes still
running on derived text.
Sibling of svg/svg/icons.json — same job, different library.
"""
import re, json, sys
from pathlib import Path

ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
WRITE_TODO = "--todo" in sys.argv
SRC = Path(ARGS[0] if ARGS else ".").resolve()
root_src = (SRC / "Root.tsx").read_text()

# ── the import map: local name -> (module path, exported name) ───────────────
# Handles  import {A, B as C} from './scenes/Foo'  and  import D from './Bar'.
imports = {}
for m in re.finditer(r"import\s*\{([^}]*)\}\s*from\s*'\./([A-Za-z0-9_/\-]+)'", root_src):
    for part in m.group(1).split(","):
        part = part.strip()
        if not part:
            continue
        if " as " in part:
            orig, local = (x.strip() for x in part.split(" as ", 1))
        else:
            orig = local = part
        imports[local] = (m.group(2), orig)
for m in re.finditer(r"import\s+([A-Za-z0-9_]+)\s+from\s*'\./([A-Za-z0-9_/\-]+)'", root_src):
    imports[m.group(1)] = (m.group(2), m.group(1))

_file_cache = {}
def module_src(mod):
    """Read a module by its Root-relative import path. scenes/Foo, Foo, dir/index."""
    if mod in _file_cache:
        return _file_cache[mod]
    for cand in (SRC / f"{mod}.tsx", SRC / f"{mod}.ts",
                 SRC / mod / "index.tsx", SRC / mod / "index.ts"):
        if cand.exists():
            _file_cache[mod] = (cand.read_text(), str(cand.relative_to(SRC)))
            return _file_cache[mod]
    _file_cache[mod] = ("", None)
    return _file_cache[mod]

# ── composition scan: id, component, size, folder, defaultProps copy ─────────
# Folders are tracked by a linear walk so every composition knows its family.
events = []
for m in re.finditer(r"\{/\*((?:(?!\*/).)*)\*/\}", root_src, re.S):
    banner = re.sub(r"[─—–\-]{2,}", " ", m.group(1))
    banner = " ".join(banner.split()).strip(" -—–")
    if 3 < len(banner) < 120:
        events.append((m.start(), "banner", banner))
for m in re.finditer(r'<Folder\s+name="([^"]+)"', root_src):
    events.append((m.start(), "folder_open", m.group(1)))
for m in re.finditer(r"</Folder>", root_src):
    events.append((m.start(), "folder_close", None))
comp_spans = [m.start() for m in re.finditer(r"<Composition\b", root_src)]
for s in comp_spans:
    events.append((s, "comp", s))
events.sort()

bounds = comp_spans + [len(root_src)]
next_start = {s: bounds[i + 1] for i, s in enumerate(comp_spans)}

stack, comps, banner = [], [], ""
for _, kind, val in events:
    if kind == "banner":
        banner = val
    elif kind == "folder_open":
        stack.append(val)
    elif kind == "folder_close":
        if stack:
            stack.pop()
    else:
        chunk = root_src[val:next_start[val]]
        cid = re.search(r'id="([^"]+)"', chunk)
        comp = re.search(r"component=\{([A-Za-z0-9_]+)\}", chunk)
        w = re.search(r"width=\{(\d+)\}", chunk)
        h = re.search(r"height=\{(\d+)\}", chunk)
        if not cid:
            continue
        comps.append({
            "id": cid.group(1),
            "component": comp.group(1) if comp else cid.group(1),
            "folder": "/".join(stack),
            "group": banner,
            "w": int(w.group(1)) if w else None,
            "h": int(h.group(1)) if h else None,
            "chunk": chunk,
        })

# ── header extraction ────────────────────────────────────────────────────────
SECTION = re.compile(
    r"\b(PALETTE|DETERMINISM|ACCENT LAW|CANVAS|SOURCE|Source|STANDING INSTRUCTION|"
    r"REWRITE|NOTE|WARNING|USAGE|Usage|Determinism translation|ITEMS ARE DATA|"
    r"Pure function|Canvas|Sibling)\b\s*[:(]?")
WHEN = re.compile(
    r"[^.]*\b(use (?:this|it)\b|use when|USE WHEN|reach for\b|the house card for|"
    r"drop (?:it|this) behind|if the words|when the subject|for any beat|"
    r"any beat whose|use it for|good for\b|the default when)\b[^.]*\.",
    re.I)

def clean(block):
    t = re.sub(r"\n[ \t]*\*[ \t]?", "\n", block)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"(?m)^\s*\*+\s*$", "", t)      # comment-gutter leftovers
    return t.strip().strip("*").strip()

def all_blocks(src):
    return [(m.start(), m.group(1)) for m in re.finditer(r"/\*\*(.*?)\*/", src, re.S)]

def header_for(src, export_name):
    """The component's own header. Prefers the block attached to its export —
    the fix for multi-export modules and for prop comments masquerading as headers."""
    if not src:
        return ""
    m = re.search(r"/\*\*((?:(?!\*/).)*)\*/\s*(?:export\s+)?const\s+" + re.escape(export_name) + r"\b",
                  src, re.S)
    if m:
        return clean(m.group(1))
    m = re.search(r"((?:^[ \t]*//[^\n]*\n){2,})\s*(?:export\s+)?const\s+" + re.escape(export_name) + r"\b",
                  src, re.M)
    if m:
        return re.sub(r"(?m)^[ \t]*//\s?", "", m.group(1)).strip()
    blocks = all_blocks(src)
    if not blocks:
        return ""
    first_export = src.find("export ")
    pos, body = blocks[0]
    if first_export == -1 or pos < first_export:
        return clean(body)
    for pos, body in blocks:                      # header sits lower: match by name
        if export_name.lower() in body.lower():
            return clean(body)
    return ""

def desc_from(header, cid, component):
    """2–3 real sentences. The old bug was splitting on the em-dash after the
    component name, which left the name and nothing else."""
    if not header:
        return ""
    t = " ".join(header.split())
    for name in (component, cid):                 # drop the "Name —" title prefix
        t = re.sub(r"^" + re.escape(name) + r"\s*[—–-]\s*", "", t)
    cut = SECTION.search(t)
    if cut and cut.start() > 60:
        t = t[:cut.start()]
    t = t.strip()
    sentences, out = re.split(r"(?<=[.!?])\s+", t), []
    for s in sentences:
        if not s.strip():
            continue
        out.append(s.strip())
        if len(" ".join(out)) > 240 or len(out) >= 3:
            break
    d = " ".join(out).strip()
    if d and d[0].islower():
        d = d[0].upper() + d[1:]
    return d[:320]

def when_from(header, desc, cid, component):
    if not header:
        return ""
    m = WHEN.search(" ".join(header.split()))
    if not m:
        return ""
    w = m.group(0).strip()
    for name in (component, cid):
        w = re.sub(r"^" + re.escape(name) + r"\s*[—–-]\s*", "", w).strip()
    if not w or w[:60].lower() in desc.lower():   # already said in the desc
        return ""
    return (w[0].upper() + w[1:])[:200]

def prop_names(src, component):
    m = re.search(rf"{component[0].lower()}{component[1:]}Schema\s*=\s*z\.object\(\{{(.*?)\n\}}\)",
                  src, re.S)
    if not m:
        m = re.search(r"Schema\s*=\s*z\.object\(\{(.*?)\n\}\)", src, re.S)
    if not m:
        return []
    return re.findall(r"^\s{2}([a-zA-Z_][A-Za-z0-9_]*)\s*:", m.group(1), re.M)

# ── synonyms ─────────────────────────────────────────────────────────────────
STOP = set("""the and for with that this from into your you not are was were will would
each only ever never with within without which what when where whose than then them they
their there here have has had does did done doing but its it's about above after again
all also any because been before being below between both down during few further how
more most other over same some such through under until very once onto per via off out
one two three anything everything nothing something somewhere anywhere everywhere
component components scene scenes remotion react props prop frame frames render renders
rendered file files line lines text uses used using make makes made take takes taken
set sets like just even still every another same different thing things way ways see
read note notes source sources author unknown pending credit resolves before
brik base44 converted auto-converted youtube upstream vendored port ported rewrite
mouse listeners wall clock unseeded seeded cached indexes trajectory
""".split())
EXTRA = {
    "FlowDiagram":       ["flow", "pipeline", "architecture", "graph", "sequence", "data moving"],
    "CoworkFolderTree":  ["folder", "directory", "access", "permission", "boundary", "files"],
    "CoworkHourClock":   ["schedule", "cadence", "recurring", "unattended", "time", "clock"],
    "CoworkMarkdownFile":["markdown", "file", "document", "notes"],
    "CoworkSetup":       ["setup", "onboarding", "install", "configure"],
    "ClaudeConnectors":  ["connector", "integration", "tools", "reach", "external"],
    "ClaudeWindow":      ["app", "window", "ui", "interface", "artifact"],
    "ClaudeComposerAsk": ["prompt", "ask", "composer", "typing", "cold open"],
    "ClaudeCodeBeat":    ["code", "snippet", "listing", "terminal"],
    "FormACard":         ["text card", "one line", "statement", "quote"],
    "FormBCard":         ["icon card", "enumerated", "list", "three things"],
    "BarChart":          ["chart", "bars", "comparison", "quantities"],
    "SpectrumDial":      ["dial", "tradeoff", "spectrum", "autonomy", "control", "position", "slider"],
    "StepStream":        ["steps", "progress", "pipeline", "status", "active", "sequence", "stream"],
    "ScaleCompare":      ["bars", "comparison", "scale", "funnel", "quantities", "narrowing", "honest"],
    "SurfaceRail":       ["surface", "device", "continuity", "thread", "cross-device", "handoff", "session"],
}

def camel(s):
    return [w.lower() for w in re.findall(r"[A-Z]+(?![a-z])|[A-Z][a-z]+|[0-9]{2,}", s) if len(w) > 2]

def mine(text, cap):
    out = []
    for w in re.findall(r"[a-zA-Z][a-zA-Z\-]{3,}", text.lower()):
        w = w.strip("-")
        if len(w) < 4 or w in STOP or w in out:
            continue
        out.append(w)
        if len(out) >= cap:
            break
    return out

def default_props_copy(chunk):
    """Content the composition actually ships with — evidence, not invention."""
    strings = re.findall(r"'([^'\\]{4,80})'", chunk) + re.findall(r'"([^"\\]{4,80})"', chunk)
    return " ".join(s for s in strings if " " in s)[:600]

rows, todo = [], []
for c in comps:
    cid, component, chunk = c["id"], c["component"], c["chunk"]
    mod, export_name = imports.get(component, (None, component))
    src, rel = module_src(mod) if mod else ("", None)
    header = header_for(src, export_name)
    desc = desc_from(header, cid, component)
    when = when_from(header, desc, cid, component)
    props = prop_names(src, component) if src else []

    syn = {cid.lower()} | set(camel(cid)) | set(camel(component)) | set(EXTRA.get(cid, [])) | set(EXTRA.get(component, []))
    syn |= set(camel(c["folder"]))
    syn |= set(mine(c["folder"].replace("-", " "), 6)) | set(mine(c["group"], 8))
    syn |= {p.lower() for p in props if len(p) > 3}
    for p in props:
        syn |= set(camel(p))
    if header:
        syn |= set(mine(header, 22))
        desc_source = "header"
    elif re.match(re.escape(cid) + r"\s*[—–-]", c["group"] or ""):
        # The Root.tsx section banner names this component: human-written text,
        # just not in the component's own file. Better than derived keywords.
        desc = re.sub(r"^" + re.escape(cid) + r"\s*[—–-]\s*", "", c["group"]).strip()
        desc = (desc[0].upper() + desc[1:])[:320] if desc else c["group"][:320]
        desc_source = "root-banner"
        syn |= set(mine(c["group"], 10)) | set(mine(default_props_copy(chunk), 8))
        todo.append((cid, rel or "?", c["folder"] or c["group"]))
    else:
        # DERIVED: no header exists. Everything below is evidence from the file
        # itself — never a machine-written account of what the scene means.
        syn |= set(mine(default_props_copy(chunk), 12))
        desc_source = "derived"
        bits = " ".join(sorted(set(camel(cid)))) or cid
        fam = c["folder"] or c["group"]
        copy = default_props_copy(chunk)
        shown = [x for x in re.findall(r"'([^'\\]{6,60})'", chunk)
                 if " " in x and ":" not in x and re.search(r"[A-Za-z]{3}", x)][:2]
        desc = ("(derived — no header in the component) "
                + f"{cid}"
                + (f", registered under \u201c{fam}\u201d" if fam else "")
                + f"; keywords: {bits}"
                + (f"; on screen: \u201c{shown[0]}\u201d" if shown else "")
                + (f"; props: {', '.join(props[:6])}" if props else "")).strip()[:320]
        todo.append((cid, rel or "?", c["folder"] or c["group"]))

    if c["w"] and c["h"]:
        aspect = "9:16" if c["h"] > c["w"] else ("1:1" if c["h"] == c["w"] else "16:9")
    else:
        aspect = "9:16" if cid.endswith("916") else "16:9"

    rows.append({
        "id": cid,
        "component": component,
        "file": rel,
        "folder": c["folder"],
        "group": c["group"],
        "desc": desc,
        "when": when,
        "props": props,
        "aspect": aspect,
        "documented": desc_source == "header",
        "desc_source": desc_source,
        "synonyms": sorted(syn),
    })

out = {
    "_note": "RENDERABLE scenes only — generated from Root.tsx <Composition> ids. "
             "A .tsx file in scenes/ that no Composition references cannot render. "
             "Regenerate with build_scene_index.py after adding a component. "
             "desc_source=derived means the component has NO header: the text is "
             "assembled from file evidence (name, folder, props, defaultProps copy) "
             "and is a search aid only — open the file before trusting it.",
    "count": len(rows),
    "undocumented": sum(1 for r in rows if not r["documented"]),
    "unresolved": sum(1 for r in rows if not r["file"]),
    "scenes": rows,
}
(SRC / "scenes.json").write_text(json.dumps(out, indent=1))
print(f"scenes.json — {len(rows)} renderable, {out['undocumented']} undocumented, "
      f"{out['unresolved']} unresolved (no backing file)")

if WRITE_TODO:
    lines = ["# SCENE-DOC-TODO — scenes running on derived search text",
             "",
             "Generated by `build_scene_index.py --todo`. Each row is a registered,",
             "renderable composition whose component has **no header comment**, so",
             "`scenes.json` carries machine-derived keywords instead of the component's",
             "own account of itself. Search can reach these by name and props only.",
             "",
             "The fix per row is one honest sentence at the top of the .tsx: what it puts",
             "on screen, and when to reach for it. Add it, then re-run the builder.",
             "",
             f"**{len(todo)} scenes** ({round(100*len(todo)/max(len(rows),1))}% of {len(rows)}).",
             "",
             "| Scene | File | Folder / registered under |", "|---|---|---|"]
    for cid, rel, folder in sorted(todo):
        lines.append(f"| `{cid}` | `{rel}` | {folder or '—'} |")
    (SRC.parents[2] / "SCENE-DOC-TODO.md").write_text("\n".join(lines) + "\n")
    print(f"SCENE-DOC-TODO.md — {len(todo)} scenes need a header sentence")
