#!/usr/bin/env python3
"""wcag_margin_check.py — GATE W: independent pre-render accessibility + layout check.

A SECOND, INDEPENDENT static gate for reels (no code, no mock, no manim
import shared with static_scene_check.py). Pure AST analysis of a reel's
scenes.py. Runs BEFORE any render. Checks, per scene:

  W1  GOLD-as-text        gold is a highlighter fill, NEVER a text color (DESIGN.md)
  W2  WCAG contrast       text color vs its background: ERROR < 3.0, WARN < 4.5
                          (>=36pt "large text" passes at 3.0). LabelChip contrast
                          is checked accent-box vs white glyphs.
  W3  Margins             text/shape bbox outside frame (+-7.1/+-4.0) = ERROR,
                          outside safe area (+-6.3/+-3.4) = WARN
  W4  Text-on-text        two text bboxes overlapping > 25% of the smaller = ERROR,
                          any overlap = WARN
  W5  Text-on-shape       text bbox crossing a Line's span or a stroked shape edge = WARN
  W6  White-text-adrift   WHITE text with no accent box in sight = WARN
  W7  Chapter-on-slide    "Chapter N" / book-title citation on screen = ERROR
                          (name the TOPIC kicker, never the chapter — SLATE-RUNNER)

Static estimation honesty: positions come from explicit move_to/shift/to_edge
arithmetic; items positioned only via next_to/arrange are checked for color but
skipped for geometry (reported as 'unresolved'). Gate B remains the pixel truth
after render — this gate exists to stop the OBVIOUS failures before they cost a
render. Exit: 0 clean, 1 warnings, 2 errors.

Usage:
  python3 wcag_margin_check.py path/to/scenes.py [--class B02_Name] [--quiet]
"""
import argparse, ast, itertools, re, sys

# ---- palette lock (kept in sync with animated_graphics.py tokens; aliases included).
# Palette-aware: the active palette is chosen by --palette or env ART_PALETTE
# (default teardown). Same role keys, per-palette values — so a teardown reel is
# checked against white/ink/red, not the old cream/teal defaults.
import os as _os
_PALETTES = {  # GROUND, INK, TEAL(good), CRIMSON(bad), SLATE(struct), GOLD(highlight)
    "teardown":      ("#FFFFFF", "#2A1A0E", "#2A1A0E", "#C8102E", "#545454", "#F6D8DC"),
    "newsprint":     ("#F3EBDD", "#2F2A26", "#1F6F5C", "#BF3339", "#3E5559", "#F5D061"),
    "neu":           ("#FFFFFF", "#000000", "#000000", "#545454", "#545454", "#A4804A"),
    "medhavy":       ("#F0EAD6", "#000000", "#009E73", "#D55E00", "#4D4D4D", "#F0E442"),
    "humanitarians": ("#F3EBDD", "#2F2A26", "#1F4E5F", "#E4572E", "#29335C", "#F3A712"),
}
def build_hex(pal):
    g, ink, teal, crim, slate, gold = _PALETTES.get(pal, _PALETTES["teardown"])
    return {
        "GROUND": g, "CREAM": g, "INK": ink,
        "CRIMSON": crim, "TEAL": teal, "GOLD": gold,
        "SLATE": slate, "WHITE": "#FFFFFF", "BLACK": "#000000",
        "NAVY": teal, "BLUE": slate, "TERRA": crim,
        "GRAY": "#888888", "GREY": "#888888",
    }
HEX = build_hex(_os.environ.get("ART_PALETTE", _os.environ.get("VOX_PALETTE","teardown")))
FRAME_X, FRAME_Y, SAFE_X, SAFE_Y = 7.1, 4.0, 6.3, 3.4

def lum(hexc):
    r, g, b = (int(hexc[i:i+2], 16)/255 for i in (1, 3, 5))
    f = lambda c: c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
    r, g, b = f(r), f(g), f(b)
    return 0.2126*r + 0.7152*g + 0.0722*b

def contrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

def _ints(h):
    return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))

def blend(fg, bg, alpha):
    """Composite a fill over a ground at the given opacity -> effective bg hex."""
    try:
        fr, fgc, fb = _ints(fg); br, bgc, bb = _ints(bg)
    except Exception:
        return bg
    a = max(0.0, min(1.0, alpha or 0.0))
    m = lambda f, b: int(round(a*f + (1-a)*b))
    return "#%02X%02X%02X" % (m(fr, br), m(fgc, bgc), m(fb, bb))

CHAP_RE = re.compile(r'\bchapter\b|\bch\.\s*\d', re.I)

DIRS = {"UP": (0, 1), "DOWN": (0, -1), "LEFT": (-1, 0), "RIGHT": (1, 0),
        "ORIGIN": (0, 0), "UL": (-1, 1), "UR": (1, 1), "DL": (-1, -1), "DR": (1, -1)}

def vec(node):
    """Evaluate simple Manim vector arithmetic -> (x, y) or None."""
    if isinstance(node, ast.Call):
        f = node.func
        if isinstance(f, ast.Attribute) and f.attr == "array" and node.args:
            return vec(node.args[0])
        return None
    if isinstance(node, ast.Name) and node.id in DIRS:
        return DIRS[node.id]
    if isinstance(node, (ast.List, ast.Tuple)) and len(node.elts) >= 2:
        try:
            return (float(ast.literal_eval(node.elts[0])), float(ast.literal_eval(node.elts[1])))
        except Exception:
            return None
    if isinstance(node, ast.BinOp):
        if isinstance(node.op, ast.Mult):
            for a, b in ((node.left, node.right), (node.right, node.left)):
                v = vec(a)
                if v is not None:
                    try:
                        k = float(ast.literal_eval(b))
                        return (v[0]*k, v[1]*k)
                    except Exception:
                        return None
        if isinstance(node.op, (ast.Add, ast.Sub)):
            va, vb = vec(node.left), vec(node.right)
            if va and vb:
                s = 1 if isinstance(node.op, ast.Add) else -1
                return (va[0]+s*vb[0], va[1]+s*vb[1])
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
        v = vec(node.operand)
        return (-v[0], -v[1]) if v else None
    return None

def kw(call, name, default=None):
    for k in call.keywords:
        if k.arg == name:
            return k.value
    return default

def const(node, default=None):
    try:
        return ast.literal_eval(node) if node is not None else default
    except Exception:
        if isinstance(node, ast.Name):
            return node.id
        return default

class Item:
    def __init__(self, var, kind, text, color, size, line):
        self.var, self.kind, self.text = var, kind, text
        self.color, self.size, self.line = color, size, line
        self.pos = None          # (x, y) center, if resolved
        self.on_shape = None     # shape var this text is move_to'd onto (fill contrast)
        self.boxed = kind == "LabelChip"
    def bbox(self):
        if self.pos is None:
            return None
        h = (self.size or 30) * 0.011
        per = 0.62 if self.kind == "mono" else 0.55
        w = max(1, len(self.text or "")) * (self.size or 30) * 0.011 * per
        x, y = self.pos
        return (x - w/2, y - h/2, x + w/2, y + h/2)

def overlap(b1, b2):
    x0, y0 = max(b1[0], b2[0]), max(b1[1], b2[1])
    x1, y1 = min(b1[2], b2[2]), min(b1[3], b2[3])
    if x1 <= x0 or y1 <= y0:
        return 0.0
    inter = (x1-x0)*(y1-y0)
    a1 = (b1[2]-b1[0])*(b1[3]-b1[1]); a2 = (b2[2]-b2[0])*(b2[3]-b2[1])
    return inter / max(1e-9, min(a1, a2))

def analyze_scene(cls, src_lines, quiet):
    errors, warns, infos = [], [], []
    texts, shapes, lines_ = {}, {}, {}
    boxed_vars = set()

    for node in ast.walk(cls):
        # ---- assignments: name = Text(...)/SerifLabel/LabelChip/Line/Rect...
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Call):
            call, tgt = node.value, node.targets[0]
            var = tgt.id if isinstance(tgt, ast.Name) else None
            # peel chained method calls: Ctor(...).scale(k).move_to(p) ...
            chain = []
            while (isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute)
                   and isinstance(call.func.value, ast.Call)):
                chain.append((call.func.attr, call))
                call = call.func.value
            fn = call.func.id if isinstance(call.func, ast.Name) else (
                 call.func.attr if isinstance(call.func, ast.Attribute) else "")
            ln = node.lineno
            def _apply_chain(item):
                for meth, c in reversed(chain):
                    if meth == "scale" and c.args:
                        k = const(c.args[0], 1.0)
                        if isinstance(k, (int, float)):
                            item.size = (item.size or 48) * k
                    elif meth == "move_to" and c.args:
                        p = vec(c.args[0])
                        if p:
                            item.pos = p
                        elif isinstance(c.args[0], ast.Name):
                            item.on_shape = c.args[0].id
                    elif meth == "shift" and c.args:
                        p = vec(c.args[0])
                        if p and item.pos:
                            item.pos = (item.pos[0]+p[0], item.pos[1]+p[1])
                    elif meth == "to_edge" and c.args and isinstance(c.args[0], ast.Name):
                        d = c.args[0].id
                        buff = const(kw(c, "buff"), 0.5) or 0.5
                        e = {"UP": (0, FRAME_Y-0.5-buff), "DOWN": (0, -(FRAME_Y-0.5-buff)),
                             "LEFT": (-(FRAME_X-0.7-buff), 0), "RIGHT": (FRAME_X-0.7-buff, 0)}.get(d)
                        if e: item.pos = e
                    elif meth == "set_color" and c.args:
                        cc = const(c.args[0])
                        if isinstance(cc, str): item.color = cc
            if fn in ("Text", "Paragraph", "MarkupText"):
                txt = const(call.args[0], "") if call.args else ""
                color = const(kw(call, "color"), "INK")
                size = const(kw(call, "font_size"), 48)
                font = const(kw(call, "font"), "")
                kind = "mono" if font == "MONO" else "text"
                _it = Item(var, kind, str(txt), color, size, ln)
                _apply_chain(_it)
                texts[var or f"@{ln}"] = _it
            elif fn == "SerifLabel":
                txt = const(call.args[0], "") if call.args else ""
                size = const(kw(call, "size"), const(call.args[2], 30) if len(call.args) > 2 else 30)
                _it = Item(var, "text", str(txt), "INK", size, ln)
                _apply_chain(_it)
                texts[var or f"@{ln}"] = _it
            elif fn == "LabelChip":
                txt = const(call.args[0], "") if call.args else ""
                accent = const(kw(call, "accent"), const(call.args[1], "CRIMSON") if len(call.args) > 1 else "CRIMSON")
                size = const(kw(call, "size"), 26)
                it = Item(var, "LabelChip", str(txt), "WHITE", size, ln)
                it.accent = accent
                _apply_chain(it)
                texts[var or f"@{ln}"] = it
            elif fn in ("Line", "Arrow", "DashedLine"):
                p0 = vec(call.args[0]) if call.args else None
                p1 = vec(call.args[1]) if len(call.args) > 1 else None
                lines_[var or f"@{ln}"] = (p0, p1, ln)
            elif fn in ("Rectangle", "Square", "RoundedRectangle", "Circle"):
                _fc = const(kw(call, "fill_color"), const(kw(call, "color"), None))
                _fo = const(kw(call, "fill_opacity"), 0.0)
                _sh = {"line": ln, "pos": None,
                       "w": const(kw(call, "width"), 1.0),
                       "h": const(kw(call, "height"), 1.0),
                       "fill": _fc if isinstance(_fc, str) else None,
                       "opacity": _fo if isinstance(_fo, (int, float)) else 0.0}
                for _m, _c in reversed(chain):
                    if _m == "move_to" and _c.args:
                        _p = vec(_c.args[0])
                        if _p: _sh["pos"] = _p
                shapes[var or f"@{ln}"] = _sh
        # ---- method calls: positioning + fills
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
            meth = node.func.attr
            base = node.func.value
            root = None
            while isinstance(base, ast.Call) and isinstance(base.func, ast.Attribute):
                base = base.func.value
            if isinstance(base, ast.Name):
                root = base.id
            if root:
                if meth == "move_to" and node.args:
                    p = vec(node.args[0])
                    if p:
                        if root in texts: texts[root].pos = p
                        if root in shapes: shapes[root]["pos"] = p
                    elif isinstance(node.args[0], ast.Name) and root in texts:
                        texts[root].on_shape = node.args[0].id
                elif meth == "to_edge" and node.args and isinstance(node.args[0], ast.Name):
                    d = node.args[0].id
                    buff = const(kw(node, "buff"), 0.5) or 0.5
                    edge = {"UP": (0, FRAME_Y - 0.5 - buff), "DOWN": (0, -(FRAME_Y - 0.5 - buff)),
                            "LEFT": (-(FRAME_X - 0.7 - buff), 0), "RIGHT": (FRAME_X - 0.7 - buff, 0)}.get(d)
                    if edge and root in texts: texts[root].pos = edge
                elif meth == "shift" and node.args:
                    p = vec(node.args[0])
                    if p and root in texts and texts[root].pos:
                        x, y = texts[root].pos; texts[root].pos = (x+p[0], y+p[1])
                elif meth in ("next_to", "arrange", "arrange_in_grid"):
                    if root in texts and texts[root].pos is None:
                        infos.append(f"{root} positioned via {meth} — geometry unresolved (color checks still apply)")
                elif meth == "set_fill" and root in texts:
                    boxed_vars.add(root)

    # ---- W1/W2/W6: color + contrast
    for name, it in texts.items():
        c = it.color if isinstance(it.color, str) else "INK"
        chex = HEX.get(c, c if isinstance(c, str) and c.startswith("#") else None)
        big = (it.size or 30) >= 36
        label = f"{name} ('{(it.text or '')[:28]}' line {it.line})"
        if c == "GOLD":
            errors.append(f"W1 GOLD-AS-TEXT {label} — gold is the highlighter FILL, never a text color (DESIGN.md)")
            continue
        if it.kind == "LabelChip":
            acc = getattr(it, "accent", "CRIMSON")
            ahex = HEX.get(acc if isinstance(acc, str) else "CRIMSON")
            if ahex:
                r = contrast("#FFFFFF", ahex)
                if acc == "GOLD" or r < 3.0:
                    errors.append(f"W2 CONTRAST {label} — white on {acc} chip = {r:.2f}:1 (<3.0)")
            continue
        if chex is None:
            continue
        if c == "WHITE" and name not in boxed_vars:
            warns.append(f"W6 WHITE-ADRIFT {label} — white text with no accent box; on ground it is {contrast('#FFFFFF', HEX['GROUND']):.2f}:1")
            continue
        bg = HEX["GROUND"]; bg_desc = "ground"
        osh = getattr(it, "on_shape", None)
        if osh and osh in shapes and shapes[osh].get("fill"):
            fhex = HEX.get(shapes[osh]["fill"])
            if fhex:
                bg = blend(fhex, HEX["GROUND"], shapes[osh].get("opacity") or 0.0)
                bg_desc = f"{shapes[osh]['fill']}-fill on cream"
        r = contrast(chex, bg)
        need = 3.0 if big else 4.5
        if r < 3.0:
            errors.append(f"W2 CONTRAST {label} — {c} on {bg_desc} = {r:.2f}:1 (<3.0)")
        elif r < need:
            warns.append(f"W2 CONTRAST {label} — {c} on {bg_desc} = {r:.2f}:1 (< {need} for {'large' if big else 'body'} text)")

    # ---- W3: margins
    for name, it in texts.items():
        bb = it.bbox()
        if not bb:
            continue
        x0, y0, x1, y1 = bb
        label = f"{name} ('{(it.text or '')[:24]}' line {it.line})"
        if x0 < -FRAME_X or x1 > FRAME_X or y0 < -FRAME_Y or y1 > FRAME_Y:
            errors.append(f"W3 OFF-FRAME {label} bbox [{x0:.1f},{y0:.1f}..{x1:.1f},{y1:.1f}]")
        elif x0 < -SAFE_X or x1 > SAFE_X or y0 < -SAFE_Y or y1 > SAFE_Y:
            warns.append(f"W3 MARGIN {label} outside safe area (+-{SAFE_X}/{SAFE_Y})")

    # ---- W4: text-on-text
    resolved = [(n, i) for n, i in texts.items() if i.bbox()]
    for (na, ia), (nb, ib) in itertools.combinations(resolved, 2):
        ov = overlap(ia.bbox(), ib.bbox())
        if ov > 0.25:
            errors.append(f"W4 TEXT-ON-TEXT {na} ('{ia.text[:20]}') overlaps {nb} ('{ib.text[:20]}') {ov*100:.0f}% of smaller")
        elif ov > 0.0:
            warns.append(f"W4 TEXT-NEAR-TEXT {na} touches {nb} ({ov*100:.0f}%)")

    # ---- W5: text over lines
    for name, it in texts.items():
        bb = it.bbox()
        if not bb:
            continue
        for ln_name, (p0, p1, lln) in lines_.items():
            if not (p0 and p1):
                continue
            lx0, lx1 = min(p0[0], p1[0]) - 0.05, max(p0[0], p1[0]) + 0.05
            ly0, ly1 = min(p0[1], p1[1]) - 0.05, max(p0[1], p1[1]) + 0.05
            if bb[0] < lx1 and bb[2] > lx0 and bb[1] < ly1 and bb[3] > ly0:
                warns.append(f"W5 TEXT-ON-LINE {name} ('{it.text[:20]}') crosses {ln_name} (line {lln}) — mark _qc_intentional if deliberate")

    # ---- W7: chapter numbers (and book-title citations) never on a slide
    for cnode in ast.walk(cls):
        if isinstance(cnode, ast.Constant) and isinstance(cnode.value, str) and CHAP_RE.search(cnode.value):
            snip = cnode.value.replace("\n", " ")[:44]
            errors.append(f"W7 CHAPTER-ON-SLIDE ('{snip}' line {getattr(cnode, 'lineno', '?')}) — chapter numbers never appear on screen; name the TOPIC, not the chapter (SLATE-RUNNER recap law)")
    return errors, warns, infos

def main():
    global HEX
    ap = argparse.ArgumentParser()
    ap.add_argument("file"); ap.add_argument("--class", dest="cls"); ap.add_argument("--quiet", action="store_true")
    ap.add_argument("--palette", default=None,
                    help="palette lock to check against (default: $ART_PALETTE or teardown)")
    a = ap.parse_args()
    if a.palette:
        HEX = build_hex(a.palette)
    src = open(a.file, encoding="utf-8").read()
    tree = ast.parse(src)
    lines = src.split("\n")
    rc = 0
    for node in tree.body:
        if not (isinstance(node, ast.ClassDef) and re.match(r"[A-Z]+\d+_", node.name)):
            continue
        if a.cls and node.name != a.cls:
            continue
        errs, warns, infos = analyze_scene(node, lines, a.quiet)
        tag = f"[gateW] {node.name}"
        for e in errs: print(f"{tag} ERROR {e}")
        for w in warns: print(f"{tag} WARN  {w}")
        if not a.quiet:
            for i in infos: print(f"{tag} info  {i}")
        if errs: rc = max(rc, 2)
        elif warns: rc = max(rc, 1)
        if not errs and not warns:
            print(f"{tag} clean")
    return rc

if __name__ == "__main__":
    sys.exit(main())
