#!/usr/bin/env python3
"""
static_scene_check.py — Manim-free static QA for Bear's Doodles scene files.
============================================================================

The repo's real check is ``manim_layout_audit.py``, but it needs a working
Manim install (pangocairo). On machines without it, this script gives a fast,
deterministic, *render-free* smoke + distinctness check by executing a scene's
``construct()`` against a lightweight geometry STUB that stands in for manim.

It catches the four things that actually went wrong with the Codex-authored
biology scenes:

  1. RUNS AT ALL        construct() executes start→finish with no Python error
                        (NameError / KeyError / bad beat id / arithmetic bug).
  2. NO GENERIC ART     the file does not contain the ``generic_art`` template
                        that produced one identical drawing for the whole video.
  3. DISTINCT PER BEAT  the set of on-screen *shapes* (text excluded) actually
                        changes across the video — i.e. the same animation is
                        not repeated beat after beat. Reported as a ratio of
                        distinct shape-states to content beats.
  4. IN FRAME           explicit coordinates passed to mobjects / move_to stay
                        inside the 16:9 frame (±7.1 x, ±4.0 y).

Exit 0 = clean, 1 = warnings, 2 = errors. Advisory: it never edits a scene.
It does NOT replace the real render — a clean result here means "this should
render and is not the repeated-animation defect", not "this is pixel-perfect".

Usage:
    python tools/scripts/static_scene_check.py <scene.py>
    python tools/scripts/static_scene_check.py <folder>        # finds the scene
    python tools/scripts/static_scene_check.py --all           # every why-* folder
    python tools/scripts/static_scene_check.py --all --json out.json
"""
from __future__ import annotations

import argparse
import json
import math
import sys
import types
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent

# frame geometry (16:9 house default)
HARD_X, HARD_Y = 7.12, 4.05
SAFE_X, SAFE_Y = 6.3, 3.4

# --------------------------------------------------------------------------- #
#  recording state (per run)                                                   #
# --------------------------------------------------------------------------- #
_COORDS: list = []        # (x, y, where)
_SHAPE_STATES: list = []  # signature of non-text shapes at each steady state
_TEXT_SNAPS: list = []    # per steady state: list of (text, box) for visible text
_SCENE_REF = {"obj": None}


def _num(v):
    try:
        f = float(v)
        return f if math.isfinite(f) else None
    except (TypeError, ValueError):
        return None


def _record_coord(seq, where):
    """If seq looks like a point [x, y, (z)], record (x, y)."""
    try:
        vals = list(seq)
    except TypeError:
        return
    nums = [_num(v) for v in vals]
    if len(nums) >= 2 and nums[0] is not None and nums[1] is not None:
        _COORDS.append((nums[0], nums[1], where))


def _scan_for_points(obj, where, depth=0):
    if depth > 3:
        return
    if isinstance(obj, (list, tuple)):
        nums = [_num(v) for v in obj]
        if len(obj) in (2, 3) and all(n is not None for n in nums):
            _record_coord(obj, where)
        else:
            for v in obj:
                _scan_for_points(v, where, depth + 1)


# --------------------------------------------------------------------------- #
#  the stub mobject layer                                                      #
# --------------------------------------------------------------------------- #
class _Mob:
    """Permissive stand-in for a Manim mobject. Records points, supports the
    chainable API, and computes a cheap structural signature."""

    _ID = 0

    def __init__(self, *args, **kwargs):
        _Mob._ID += 1
        self._id = _Mob._ID
        self._cls = type(self).__name__
        self.submobjects = []
        self._center = [0.0, 0.0, 0.0]
        self._w = None
        self._h = None
        # absorb child mobjects passed positionally (VGroup etc.)
        for a in args:
            if isinstance(a, _Mob):
                self.submobjects.append(a)
            elif isinstance(a, (list, tuple)) and a and all(isinstance(x, _Mob) for x in a):
                self.submobjects.extend(a)
        # record numeric points from args + kwargs
        for a in args:
            _scan_for_points(a, self._cls)
        for k in ("start", "end", "point", "center", "arc_center", "point_to",
                  "start_angle", "radius", "width", "height", "side_length"):
            if k in kwargs:
                _scan_for_points(kwargs[k], self._cls)
        # crude size hints
        self._w = _num(kwargs.get("width")) or _num(kwargs.get("radius"))
        self._h = _num(kwargs.get("height")) or _num(kwargs.get("radius"))

    # geometry ------------------------------------------------------------- #
    @property
    def width(self):
        if self._w is not None:
            return abs(self._w) * (2 if self._cls in ("Circle", "Dot", "Ellipse") else 1) or 1.0
        if self.submobjects:
            return max((s.width for s in self.submobjects), default=1.0)
        return 1.0

    @property
    def height(self):
        if self._h is not None:
            return abs(self._h) * (2 if self._cls in ("Circle", "Dot", "Ellipse") else 1) or 1.0
        if self.submobjects:
            return max((s.height for s in self.submobjects), default=1.0)
        return 1.0

    def get_center(self):
        return list(self._center)

    def _edge(self, dx, dy):
        return [self._center[0] + dx, self._center[1] + dy, 0.0]

    def get_top(self):    return self._edge(0, self.height / 2)
    def get_bottom(self): return self._edge(0, -self.height / 2)
    def get_left(self):   return self._edge(-self.width / 2, 0)
    def get_right(self):  return self._edge(self.width / 2, 0)
    def get_corner(self, *a, **k): return list(self._center)
    def get_start(self):  return list(self._center)
    def get_end(self):    return list(self._center)
    def point_from_proportion(self, *a, **k): return list(self._center)
    def get_boundary_point(self, *a, **k): return list(self._center)

    # placement (all chainable) ------------------------------------------- #
    def move_to(self, p, *a, **k):
        if isinstance(p, _Mob):
            self._center = p.get_center()
        elif isinstance(p, (list, tuple)):
            nums = [_num(v) for v in p]
            if len(nums) >= 2 and None not in nums[:2]:
                self._center = [nums[0], nums[1], 0.0]
                _record_coord(p, "move_to")
        return self

    def next_to(self, m, *a, **k):
        # reference center + size
        if isinstance(m, _Mob):
            rc = m.get_center(); rwd, rht = m.width, m.height
        else:
            nums = [_num(v) for v in m] if hasattr(m, "__len__") else []
            if len(nums) >= 2 and None not in nums[:2]:
                rc = [nums[0], nums[1], 0.0]
            else:
                return self
            rwd = rht = 0.0
        # direction (first vector-ish positional arg, else kwarg, else RIGHT)
        d = None
        for arg in a:
            if hasattr(arg, "__len__") and not isinstance(arg, str):
                vv = [_num(x) for x in arg]
                if len(vv) >= 2 and None not in vv[:2]:
                    d = vv
                    break
        if d is None:
            dk = k.get("direction", [1.0, 0.0, 0.0])
            d = [_num(x) for x in dk] if hasattr(dk, "__len__") else [1.0, 0.0, 0.0]
        buff = _num(k.get("buff", 0.25)) or 0.25
        dx, dy = d[0], d[1]
        horiz = abs(dx) >= abs(dy)
        off_ref = (rwd / 2 if horiz else rht / 2)
        off_self = (self.width / 2 if horiz else self.height / 2)
        mag = off_ref + off_self + buff
        nrm = math.hypot(dx, dy) or 1.0
        self._center = [rc[0] + dx / nrm * mag, rc[1] + dy / nrm * mag, 0.0]
        return self

    def shift(self, *a, **k):
        for a0 in a:
            nums = [_num(v) for v in a0] if isinstance(a0, (list, tuple)) else None
            if nums and len(nums) >= 2 and None not in nums[:2]:
                self._center = [self._center[0] + nums[0], self._center[1] + nums[1], 0.0]
        return self

    def to_edge(self, *a, **k):  return self
    def to_corner(self, *a, **k): return self
    def align_to(self, *a, **k): return self
    def arrange(self, *a, **k):  return self
    def arrange_in_grid(self, *a, **k): return self
    def scale(self, *a, **k):    return self
    def scale_to_fit_width(self, w, *a, **k):
        self._w = _num(w); return self
    def scale_to_fit_height(self, h, *a, **k):
        self._h = _num(h); return self
    def set_width(self, w, *a, **k):
        self._w = _num(w); return self
    def set_height(self, h, *a, **k):
        self._h = _num(h); return self
    def stretch(self, *a, **k):  return self
    def rotate(self, *a, **k):   return self
    def flip(self, *a, **k):     return self

    # styling (chainable no-ops) ------------------------------------------ #
    def _chain(self, *a, **k):  return self
    set_color = set_fill = set_stroke = set_opacity = set_z_index = _chain
    set_fill_opacity = set_stroke_width = set_sheen = set_color_by_gradient = _chain
    fade = fade_to = become = match_style = match_color = _chain
    add_updater = remove_updater = clear_updaters = suspend_updating = _chain
    set_points_smoothly = set_points_as_corners = make_smooth = _chain
    apply_function = _chain

    def add(self, *m, **k):
        for x in m:
            if isinstance(x, _Mob):
                self.submobjects.append(x)
            elif isinstance(x, (list, tuple)):
                self.submobjects.extend(y for y in x if isinstance(y, _Mob))
        return self

    def remove(self, *m, **k):
        for x in m:
            if x in self.submobjects:
                self.submobjects.remove(x)
        return self

    def copy(self):
        c = _Mob.__new__(type(self))
        _Mob._ID += 1
        c._id = _Mob._ID
        c._cls = self._cls
        c.submobjects = list(self.submobjects)
        c._center = list(self._center)
        c._w, c._h = self._w, self._h
        return c

    def get_corner_or(self, *a, **k): return list(self._center)

    # the .animate proxy --------------------------------------------------- #
    @property
    def animate(self):
        return _AnimateProxy(self)

    # iteration / indexing for VGroup-like access -------------------------- #
    def __iter__(self):
        return iter(self.submobjects)

    def __getitem__(self, i):
        if self.submobjects:
            return self.submobjects[i]
        return self

    def __len__(self):
        return len(self.submobjects)

    # anything else: chainable no-op that also acts callable --------------- #
    def __getattr__(self, name):
        if name.startswith("__"):
            raise AttributeError(name)
        def _f(*a, **k):
            return self
        return _f

    # signature: structural fingerprint of the shape (NOT its text) -------- #
    def signature(self):
        cx = round(self._center[0], 1)
        cy = round(self._center[1], 1)
        if self.submobjects:
            inner = tuple(s.signature() for s in self.submobjects)
            return (self._cls, cx, cy, inner)
        return (self._cls, cx, cy, round(self.width, 1), round(self.height, 1))


def _collect_text_leaves(m, out):
    if isinstance(m, _Text):
        out.append(m)
        return
    if isinstance(m, _Mob):
        for s in m.submobjects:
            _collect_text_leaves(s, out)


def _box_area(b):
    return max(0.0, b[2] - b[0]) * max(0.0, b[3] - b[1])


def _box_inter(a, b):
    ix = min(a[2], b[2]) - max(a[0], b[0])
    iy = min(a[3], b[3]) - max(a[1], b[1])
    return ix * iy if (ix > 0 and iy > 0) else 0.0


def _is_textish(m):
    """True for a Text node or any group whose every leaf is Text — i.e. a
    caption/label, which must NOT count toward shape distinctness."""
    if isinstance(m, _Text):
        return True
    if isinstance(m, _Mob) and m.submobjects:
        return all(_is_textish(s) for s in m.submobjects)
    return False


class _AnimateProxy:
    def __init__(self, mob):
        self._mob = mob

    def __getattr__(self, name):
        def _f(*a, **k):
            return _Anim(self._mob, *a, kind="animate")
        return _f


# text-like classes carry their string but report it separately ------------- #
class _Text(_Mob):
    def __init__(self, text="", *a, **k):
        self._text = str(text)
        fs = _num(k.get("font_size")) or 32.0
        super().__init__(text, *a, **k)
        # width estimate from glyphs so bn_layout's wrap logic runs for real
        self._w = max(0.20, len(self._text) * fs * 0.012)
        self._h = max(0.20, fs * 0.020)

    @property
    def text(self):
        return self._text

    def signature(self):
        # text excluded from shape distinctness; tag generically
        return ("TEXT",)


# --------------------------------------------------------------------------- #
#  animations — capture target mobjects + add/remove semantics                 #
# --------------------------------------------------------------------------- #
_ADD = {"Create", "Write", "FadeIn", "DrawBorderThenFill", "GrowArrow",
        "GrowFromCenter", "GrowFromEdge", "GrowFromPoint", "SpinInFromNothing",
        "AddTextLetterByLetter", "AddTextWordByWord", "ShowIncreasingSubsets",
        "FadeInFromPoint", "FadeInFromLarge", "DrawBorderThenFill", "ShowCreation",
        "TypeWithCursor", "Wait"}
_REMOVE = {"FadeOut", "Uncreate", "Unwrite", "ShrinkToCenter", "FadeOutToPoint",
           "RemoveTextLetterByLetter"}
_REPLACE = {"Transform", "ReplacementTransform", "TransformMatchingShapes",
            "TransformMatchingTex", "FadeTransform", "FadeTransformPieces",
            "MoveToTarget", "ClockwiseTransform", "CounterclockwiseTransform"}
_GROUP = {"AnimationGroup", "LaggedStart", "Succession", "LaggedStartMap"}


class _Anim:
    def __init__(self, *args, kind=None, **kwargs):
        self.kind = kind or type(self).__name__
        self.targets = [a for a in args if isinstance(a, _Mob)]
        self.children = [a for a in args if isinstance(a, _Anim)]
        # also flatten lists of anims/mobs
        for a in args:
            if isinstance(a, (list, tuple)):
                self.targets += [x for x in a if isinstance(x, _Mob)]
                self.children += [x for x in a if isinstance(x, _Anim)]

    def __getattr__(self, name):
        # Keeps `.animate` chains alive across multiple calls, e.g.
        # bar.animate.stretch_to_fit_width(w).align_to(bg_bar, LEFT) — each
        # link is a real Manim _AnimationBuilder that stays chainable; this
        # stub previously returned a plain _Anim with no further attributes,
        # so the second call in the chain raised AttributeError.
        if name.startswith("__") and name.endswith("__"):
            raise AttributeError(name)

        def _f(*a, **k):
            return _Anim(*self.targets, *self.children, *a, kind=self.kind)
        return _f


def _apply_anim(scene, anim):
    """Mutate scene.mobjects to reflect an animation, mirroring manim semantics."""
    kind = anim.kind
    if kind in _GROUP:
        for c in anim.children:
            _apply_anim(scene, c)
        for t in anim.targets:
            scene._add(t)
        return
    if kind in _ADD:
        for t in anim.targets:
            scene._add(t)
    elif kind in _REMOVE:
        for t in anim.targets:
            scene._remove(t)
    elif kind in _REPLACE:
        if anim.targets:
            scene._remove(anim.targets[0])
            for t in anim.targets[1:]:
                scene._add(t)
            if len(anim.targets) == 1:
                scene._add(anim.targets[0])  # Transform(a) in place
    # highlights (Indicate/Flash/etc.) and animate-proxy: no membership change
    for c in anim.children:
        _apply_anim(scene, c)


# --------------------------------------------------------------------------- #
#  the stub Scene                                                              #
# --------------------------------------------------------------------------- #
class _Renderer:
    def __init__(self):
        self.time = 0.0

    def get_frame(self):
        return None


class _Camera:
    def __init__(self):
        self.background_color = "#FFFFFF"
        self.frame_center = [0, 0, 0]


class Scene:  # noqa: N801  (manim name)
    def __init__(self, *a, **k):
        self.mobjects = []
        self.renderer = _Renderer()
        self.camera = _Camera()
        _SCENE_REF["obj"] = self

    # membership ----------------------------------------------------------- #
    def _add(self, m):
        if isinstance(m, _Mob) and m not in self.mobjects:
            self.mobjects.append(m)

    def _remove(self, m):
        if m in self.mobjects:
            self.mobjects.remove(m)

    def add(self, *m, **k):
        for x in m:
            if isinstance(x, _Mob):
                self._add(x)

    def remove(self, *m, **k):
        for x in m:
            self._remove(x)

    def bring_to_front(self, *a, **k): pass
    def bring_to_back(self, *a, **k): pass
    def add_sound(self, *a, **k): pass
    def next_section(self, *a, **k): pass

    # the timeline --------------------------------------------------------- #
    def play(self, *anims, **kwargs):
        for a in anims:
            if isinstance(a, _Anim):
                _apply_anim(self, a)
            elif isinstance(a, _Mob):
                self._add(a)
        self.renderer.time += float(kwargs.get("run_time", 1.0) or 1.0)
        self._snapshot()

    def wait(self, t=1.0, *a, **k):
        self.renderer.time += float(t or 0.0)
        self._snapshot()

    def _snapshot(self):
        shapes = [m for m in self.mobjects if not _is_textish(m)]
        if not shapes:
            return
        sig = tuple(sorted(repr(s.signature()) for s in shapes))
        _SHAPE_STATES.append(sig)

    def construct(self):
        pass

    def render(self, *a, **k):
        self.construct()


# --------------------------------------------------------------------------- #
#  build the fake `manim` module                                               #
# --------------------------------------------------------------------------- #
def _make_manim_module():
    import numpy as np

    m = types.ModuleType("manim")

    # config (mutable, landscape default)
    cfg = types.SimpleNamespace(
        pixel_width=1920, pixel_height=1080,
        frame_width=14.222222, frame_height=8.0,
        frame_x_radius=7.111, frame_y_radius=4.0,
        background_color="#FFFFFF",
    )
    m.config = cfg

    class _TempConfig:
        def __init__(self, d=None, **k):
            pass
        def __enter__(self): return cfg
        def __exit__(self, *a): return False
    m.tempconfig = _TempConfig

    # geometry / mobject classes — all subclass _Mob
    shape_names = [
        "Mobject", "VMobject", "VGroup", "Group", "VDict",
        "Line", "DashedLine", "TangentLine", "Arrow", "DoubleArrow", "Vector",
        "Rectangle", "RoundedRectangle", "Square", "Circle", "Dot", "AnnotationDot",
        "Ellipse", "Annulus", "Arc", "ArcBetweenPoints", "ArcPolygon", "CurvedArrow",
        "CurvedDoubleArrow", "Polygon", "Polygram", "RegularPolygon", "Triangle",
        "Star", "Cross", "Elbow", "RightAngle", "Angle", "Sector", "AnnularSector",
        "ParametricFunction", "FunctionGraph", "ImplicitFunction", "CubicBezier",
        "Brace", "BraceBetweenPoints", "BraceLabel", "Axes", "NumberLine", "NumberPlane",
        "ThreeDAxes", "SurroundingRectangle", "BackgroundRectangle", "DashedVMobject",
        "SVGMobject", "ImageMobject", "Dot3D", "Sphere", "Surface", "Point",
        "LabeledDot", "CurvesAsSubmobjects", "ManimBanner", "Rectangle",
    ]
    for nm in shape_names:
        m.__dict__[nm] = type(nm, (_Mob,), {})

    text_names = ["Text", "MarkupText", "Tex", "MathTex", "Title", "Paragraph",
                  "BulletedList", "Code", "DecimalNumber", "Integer", "Variable",
                  "MathTable", "Table", "Matrix"]
    for nm in text_names:
        m.__dict__[nm] = type(nm, (_Text,), {})

    # animations
    anim_names = list(_ADD | _REMOVE | _REPLACE | _GROUP) + [
        "Animation", "Indicate", "Flash", "Circumscribe", "Wiggle", "FocusOn",
        "ApplyWave", "ApplyMethod", "ApplyFunction", "MoveAlongPath", "Rotate",
        "Rotating", "MoveToTarget", "Restore", "ShowPassingFlash", "Broadcast",
        "ChangingDecimal", "Count", "CyclicReplace", "Swap", "TransformFromCopy",
        "AnimationGroup", "UpdateFromFunc", "UpdateFromAlphaFunc", "Homotopy",
        "Wait", "ScaleInPlace", "GrowFromEdge", "SpinInFromNothing", "Wait",
    ]
    for nm in set(anim_names):
        m.__dict__[nm] = type(nm, (_Anim,), {})

    m.Scene = Scene
    m.MovingCameraScene = type("MovingCameraScene", (Scene,), {})
    m.ThreeDScene = type("ThreeDScene", (Scene,), {})
    m.ZoomedScene = type("ZoomedScene", (Scene,), {})

    # constants
    m.UP = np.array([0.0, 1.0, 0.0]); m.DOWN = np.array([0.0, -1.0, 0.0])
    m.LEFT = np.array([-1.0, 0.0, 0.0]); m.RIGHT = np.array([1.0, 0.0, 0.0])
    m.IN = np.array([0.0, 0.0, -1.0]); m.OUT = np.array([0.0, 0.0, 1.0])
    m.ORIGIN = np.array([0.0, 0.0, 0.0])
    m.UL = m.UP + m.LEFT; m.UR = m.UP + m.RIGHT
    m.DL = m.DOWN + m.LEFT; m.DR = m.DOWN + m.RIGHT
    m.X_AXIS = m.RIGHT; m.Y_AXIS = m.UP; m.Z_AXIS = m.OUT
    m.PI = math.pi; m.TAU = 2 * math.pi; m.DEGREES = math.pi / 180
    m.SMALL_BUFF = 0.1; m.MED_SMALL_BUFF = 0.25; m.MED_LARGE_BUFF = 0.5; m.LARGE_BUFF = 1.0
    m.DEFAULT_STROKE_WIDTH = 4.0

    # colors — any reasonable name resolves to a hex-ish string
    palette = {
        "WHITE": "#FFFFFF", "BLACK": "#000000", "GRAY": "#888888", "GREY": "#888888",
        "LIGHT_GRAY": "#BBBBBB", "DARK_GRAY": "#444444", "LIGHT_GREY": "#BBBBBB",
        "DARK_GREY": "#444444", "RED": "#FC6255", "GREEN": "#83C167", "BLUE": "#58C4DD",
        "YELLOW": "#FFFF00", "ORANGE": "#FF862F", "PURPLE": "#9A72AC", "PINK": "#D147BD",
        "TEAL": "#5CD0B3", "GOLD": "#F0AC5F", "MAROON": "#C55F73", "BROWN": "#8B4513",
    }
    for base in list(palette):
        m.__dict__[base] = palette[base]
        for suf in ("_A", "_B", "_C", "_D", "_E"):
            m.__dict__[base + suf] = palette[base]
    m.GRAY_A = "#DDDDDD"; m.GRAY_B = "#BBBBBB"; m.GRAY_C = "#888888"
    m.GRAY_D = "#444444"; m.GRAY_E = "#222222"

    # rate functions / utils
    rf = types.SimpleNamespace(
        smooth=lambda t: t, linear=lambda t: t, there_and_back=lambda t: t,
        ease_in_out_sine=lambda t: t, ease_in_sine=lambda t: t, ease_out_sine=lambda t: t,
        rush_into=lambda t: t, rush_from=lambda t: t, double_smooth=lambda t: t,
        wiggle=lambda t: t, there_and_back_with_pause=lambda t: t, slow_into=lambda t: t,
        ease_in_out_cubic=lambda t: t, ease_out_bounce=lambda t: t, exponential_decay=lambda t: t,
    )
    m.rate_functions = rf
    for nm in vars(rf):
        m.__dict__[nm] = getattr(rf, nm)
    m.there_and_back = rf.there_and_back; m.smooth = rf.smooth; m.linear = rf.linear

    m.color_gradient = lambda *a, **k: ["#5A5653"]
    m.interpolate_color = lambda *a, **k: "#5A5653"
    m.rgb_to_color = m.hex_to_rgb = lambda *a, **k: "#5A5653"
    m.ManimColor = type("ManimColor", (_Mob,), {})
    m.value_tracker = types.SimpleNamespace()
    m.ValueTracker = type("ValueTracker", (_Mob,), {"get_value": lambda self: 0.0,
                                                    "set_value": lambda self, v: self})
    m.always_redraw = lambda f, *a, **k: f() if callable(f) else _Mob()
    m.rate_func = rf.smooth

    return m


# --------------------------------------------------------------------------- #
#  run one scene                                                               #
# --------------------------------------------------------------------------- #
def _find_scene(target: Path):
    if target.is_file():
        return target
    cands = [p for p in target.glob("*.py")
             if p.name not in ("bn_layout.py",)
             and not p.name.endswith(("_svg_doodles.py", "_test.py"))]
    cands = [p for p in cands if "def construct" in p.read_text(errors="ignore")
             or "BearsDoodlesVideo" in p.read_text(errors="ignore")]
    return cands[0] if len(cands) == 1 else (cands[0] if cands else None)


def check_scene(scene_path: Path, scene_cls="BearsDoodlesVideo"):
    import importlib.util
    import os

    _COORDS.clear()
    _SHAPE_STATES.clear()
    _TEXT_SNAPS.clear()

    folder = scene_path.parent
    try:                              # isolated-copy runs live outside REPO (run.sh Gate A)
        scene_label = str(scene_path.relative_to(REPO))
    except ValueError:
        scene_label = scene_path.name
    result = {"scene": scene_label, "errors": [], "warnings": [], "info": {}}

    src = scene_path.read_text(errors="ignore")
    if "generic_art" in src:
        result["errors"].append("contains generic_art() — the repeated-animation template")

    # count content beats from beat_sheet
    n_beats = None
    bs = folder / "beat_sheet.json"
    if bs.exists():
        try:
            beats = json.loads(bs.read_text()).get("beats", [])
            n_beats = sum(1 for b in beats if b.get("beat_id") not in ("INTRO", "OUTRO"))
        except Exception:
            pass

    # install fake manim
    fake = _make_manim_module()
    saved = {k: sys.modules.get(k) for k in ("manim",)}
    sys.modules["manim"] = fake
    # purge cached bn_layout / scene modules so they re-bind to the stub
    for k in list(sys.modules):
        if k in ("bn_layout", "bn_audit_scene") or k.startswith("bn_"):
            sys.modules.pop(k, None)

    import contextlib
    import io

    cwd0 = os.getcwd()
    syspath0 = list(sys.path)
    try:
        os.chdir(folder)
        sys.path.insert(0, str(folder))
        spec = importlib.util.spec_from_file_location("bn_static_scene", str(scene_path))
        mod = importlib.util.module_from_spec(spec)
        sys.modules["bn_static_scene"] = mod
        with contextlib.redirect_stdout(io.StringIO()):
            spec.loader.exec_module(mod)
            cls = getattr(mod, scene_cls, None)
            if cls is None:
                result["errors"].append(f"class {scene_cls} not found")
                return result
            scene = cls()
            scene.construct()
    except Exception as e:
        import traceback
        tb = traceback.format_exc().splitlines()
        result["errors"].append(f"construct() raised {type(e).__name__}: {e}")
        result["info"]["traceback"] = tb[-4:]
        return result
    finally:
        os.chdir(cwd0)
        sys.path[:] = syspath0
        sys.modules.pop("bn_static_scene", None)
        for k, v in saved.items():
            if v is None:
                sys.modules.pop(k, None)
            else:
                sys.modules[k] = v

    # ---- distinctness ---- #
    # When a specific per-beat class is checked (not the whole-video BearsDoodlesVideo),
    # the ratio against video-level n_beats is meaningless — use the scene's own snapshot
    # count as the reference so individual scenes don't false-alarm.
    per_beat_check = (scene_cls != "BearsDoodlesVideo")
    states = _SHAPE_STATES
    distinct = len(set(states))
    result["info"]["steady_states"] = len(states)
    result["info"]["distinct_shape_states"] = distinct
    result["info"]["content_beats"] = n_beats
    if states:
        # most common single state share
        from collections import Counter
        share = Counter(states).most_common(1)[0][1] / len(states)
        result["info"]["max_single_state_share"] = round(share, 2)
        ref = len(states) if per_beat_check else n_beats
        if ref and ref >= 2:
            ratio = distinct / ref
            result["info"]["distinct_ratio"] = round(ratio, 2)
            if distinct <= 1 and len(states) >= 3:
                result["errors"].append(
                    f"shapes never change — 1 distinct shape-state across {len(states)} frames (repeated animation)")
            elif not per_beat_check and ref >= 4 and ratio < 0.5:
                result["errors"].append(
                    f"low visual variety — only {distinct} distinct shape-states for {ref} beats (ratio {ratio:.2f})")
            elif not per_beat_check and ref >= 4 and ratio < 0.7:
                result["warnings"].append(
                    f"limited visual variety — {distinct} distinct shape-states for {ref} beats (ratio {ratio:.2f})")
    else:
        result["warnings"].append("no shapes recorded — scene may be text-only")

    # ---- frame bounds ---- #
    off_hard = [(x, y, w) for (x, y, w) in _COORDS if abs(x) > HARD_X or abs(y) > HARD_Y]
    off_safe = [(x, y, w) for (x, y, w) in _COORDS if abs(x) > SAFE_X or abs(y) > SAFE_Y]
    if off_hard:
        ex = off_hard[0]
        result["errors"].append(
            f"{len(off_hard)} explicit coord(s) outside the frame, e.g. ({ex[0]:.1f},{ex[1]:.1f}) in {ex[2]}")
    elif off_safe:
        ex = off_safe[0]
        result["warnings"].append(
            f"{len(off_safe)} coord(s) outside the safe area, e.g. ({ex[0]:.1f},{ex[1]:.1f}) in {ex[2]}")

    return result


# --------------------------------------------------------------------------- #
def main(argv=None):
    ap = argparse.ArgumentParser(description="Render-free QA for Bear's Doodles scenes.")
    ap.add_argument("target", nargs="?", help="scene .py or video folder")
    ap.add_argument("--all", action="store_true", help="check every why-* folder in the repo")
    ap.add_argument("--class", dest="cls", default="BearsDoodlesVideo")
    ap.add_argument("--json", dest="json_out", help="write full results to a JSON file")
    ap.add_argument("--quiet", action="store_true", help="only print the summary line")
    args = ap.parse_args(argv)

    targets = []
    if args.all:
        targets = sorted(p for p in REPO.glob("why-*") if p.is_dir())
    elif args.target:
        targets = [Path(args.target).resolve()]
    else:
        ap.error("pass a scene/folder or --all")

    results = []
    worst = 0
    for t in targets:
        sp = _find_scene(t) if t.is_dir() else t
        if sp is None:
            print(f"[skip] no scene found in {t.name}")
            continue
        r = check_scene(sp, args.cls)
        results.append(r)
        sev = 2 if r["errors"] else (1 if r["warnings"] else 0)
        worst = max(worst, sev)
        tag = "ERROR" if r["errors"] else ("WARN " if r["warnings"] else "OK   ")
        name = Path(r["scene"]).parent.name
        if not args.quiet:
            info = r["info"]
            extra = ""
            if "distinct_shape_states" in info:
                extra = f"  [{info['distinct_shape_states']} distinct / {info.get('content_beats','?')} beats]"
            print(f"[{tag}] {name}{extra}")
            for e in r["errors"]:
                print(f"        ✗ {e}")
            for w in r["warnings"]:
                print(f"        ! {w}")

    n_ok = sum(1 for r in results if not r["errors"] and not r["warnings"])
    n_warn = sum(1 for r in results if r["warnings"] and not r["errors"])
    n_err = sum(1 for r in results if r["errors"])
    print(f"\n[static-check] {len(results)} scene(s): {n_ok} clean · {n_warn} warn · {n_err} error")

    if args.json_out:
        Path(args.json_out).write_text(json.dumps(results, indent=2))
        print(f"[static-check] wrote {args.json_out}")

    return worst


if __name__ == "__main__":
    raise SystemExit(main())
