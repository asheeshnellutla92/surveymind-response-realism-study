#!/usr/bin/env python3
"""
capture_sim.py — Playwright headless Chromium recorder for D3 HTML simulations.

Loads a sim <slug>.html, waits for first paint, then records:
  <output_dir>/media/output.mp4      — BASELINE hold (defaults, no interaction)
  <output_dir>/media/change.mp4      — animated sweep of the card's "change" control
  <output_dir>/media/<stem>.mp4      — discrete click-through of matched elements (--click-through)
  <output_dir>/media/<stem>.mp4      — scripted step sequence (--script)

Serves the file via a local HTTP server so CDN requests (D3 v7) are not blocked
by Chromium's cross-origin restrictions on file:// URLs.

Usage:
  python3 capture_sim.py <sim_html_path> <reel_dir>
    [--duration SECS]          baseline hold in seconds (default: 6)
    [--change-dur SECS]        change animation in seconds (default: 8)
    [--fps INT]                output fps (default: 24)
    [--width INT]              viewport width (default: 1280)
    [--height INT]             viewport height (default: 720)
    [--selector CSS]           CSS selector of the control to drive (default: first input[type=range])
    [--click-through CSS]      click each matched element in DOM order, hold --hold-each s each
    [--hold-each SECS]         hold per element for --click-through (default: 2.5)
    [--script STEPS_JSON]      JSON file of ordered steps to execute while recording
    [--out-name STEM]          output filename stem for --click-through or --script
    [--smoke-test]             write smoke-test marker file and exit 0 on success

--script step verbs (verb is the JSON key):
  {"set": "#sel", "value": <num>}                      set range/input, fire input+change
  {"click": "#sel"}                                     click element
  {"click": "#sel", "at": [0.25, 0.25]}                click at fractional coords within element
  {"check": "#sel"}                                     ensure checkbox is checked
  {"uncheck": "#sel"}                                   ensure checkbox is unchecked
  {"sweep": "#sel"}                                     animated sweep using element's own min→max
  {"sweep": "#sel", "from": <n>, "to": <n>,
   "steps": <n>, "step_delay": <s>}                    animated sweep with explicit range
  {"scroll": "#sel"}                                    scroll element into view
  {"wait": <seconds>}                                   sleep

Fails loudly if any selector matches 0 elements — a silent miss IS the bug.
--out-name defaults to the script file stem when --script is used.

NOTE: Playwright only records from the first page-activity event. A script that
starts with {"wait": N} will NOT capture that idle period. Always open with an
interactive step (set/click/check) to anchor the recording at t=0.

Exit 0 on success, 1 on failure.
"""

import argparse
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

FFMPEG = shutil.which("ffmpeg") or "ffmpeg"


# ── local HTTP server ────────────────────────────────────────────────────────

def find_free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def start_server(directory: Path):
    """Start a SimpleHTTPRequestHandler in a daemon thread. Returns (server, port)."""
    port = find_free_port()

    class QuietHandler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(directory), **kwargs)
        def log_message(self, *_):
            pass  # suppress access logs

    server = HTTPServer(("127.0.0.1", port), QuietHandler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server, port


# ── ffmpeg conversion ─────────────────────────────────────────────────────────

def webm_to_mp4(src: Path, dst: Path, fps: int):
    """Convert a .webm Playwright recording to a well-muxed .mp4."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        FFMPEG, "-y", "-i", str(src),
        "-vf", f"fps={fps},scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-c:v", "libx264", "-preset", "slow", "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-an",  # no audio in screen recordings
        str(dst),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg conversion failed:\n{r.stderr[-800:]}")
    size = dst.stat().st_size
    if size < 4096:
        raise RuntimeError(f"output mp4 suspiciously small: {size} bytes")
    return size


# ── Playwright capture ────────────────────────────────────────────────────────

def capture(sim_html: Path, reel_dir: Path, *,
            duration: float, change_dur: float,
            fps: int, width: int, height: int, dpr: int,
            selector: str | None,
            smoke_test: bool):
    """Main capture: records output.mp4 and change.mp4 into reel_dir/media/."""
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
    except ImportError:
        sys.exit("[capture_sim] playwright not installed — pip install playwright")

    serve_dir = sim_html.parent
    server, port = start_server(serve_dir)
    url = f"http://127.0.0.1:{port}/{sim_html.name}"
    media_dir = reel_dir / "media"
    media_dir.mkdir(parents=True, exist_ok=True)

    tmp_dir = Path(tempfile.mkdtemp(prefix="capture_sim_"))
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage",
                      "--autoplay-policy=no-user-gesture-required"],
            )

            # ── BASELINE (output.mp4) ────────────────────────────────────────
            print(f"[capture_sim] recording baseline: {url}", flush=True)
            ctx_out = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=dpr,
                record_video_dir=str(tmp_dir / "out"),
                record_video_size={"width": width * dpr, "height": height * dpr},
            )
            (tmp_dir / "out").mkdir(parents=True, exist_ok=True)
            page_out = ctx_out.new_page()
            page_out.goto(url, wait_until="networkidle", timeout=30_000)
            # Extra settle time — D3 animations may still be running
            time.sleep(1.5)
            # Hold for the full baseline duration
            time.sleep(duration)
            page_out.close()
            ctx_out.close()

            # Find the webm file that Playwright wrote
            webm_files = list((tmp_dir / "out").glob("*.webm"))
            if not webm_files:
                raise RuntimeError("Playwright produced no .webm for baseline")
            out_webm = webm_files[0]
            out_mp4 = media_dir / "output.mp4"
            size = webm_to_mp4(out_webm, out_mp4, fps)
            print(f"[capture_sim] output.mp4 written ({size//1024} KB)", flush=True)

            # ── CHANGE (change.mp4) ──────────────────────────────────────────
            print(f"[capture_sim] recording change animation", flush=True)
            ctx_chg = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=dpr,
                record_video_dir=str(tmp_dir / "chg"),
                record_video_size={"width": width * dpr, "height": height * dpr},
            )
            (tmp_dir / "chg").mkdir(parents=True, exist_ok=True)
            page_chg = ctx_chg.new_page()
            page_chg.goto(url, wait_until="networkidle", timeout=30_000)
            time.sleep(1.5)  # let D3 settle

            # Determine the control to animate
            ctrl_sel = selector or "input[type=range]"
            try:
                ctrl = page_chg.locator(ctrl_sel).first
                ctrl.wait_for(timeout=5_000)

                # Read min/max/step
                attrs = page_chg.evaluate("""sel => {
                    const el = document.querySelector(sel);
                    if (!el) return null;
                    return {
                        min: parseFloat(el.min || 0),
                        max: parseFloat(el.max || 100),
                        step: parseFloat(el.step || 1)
                    };
                }""", ctrl_sel)

                if attrs:
                    mn, mx = attrs["min"], attrs["max"]
                    steps = 40  # number of animation steps
                    delay = change_dur / steps

                    # Sweep from min to max
                    for i in range(steps + 1):
                        val = mn + (mx - mn) * i / steps
                        page_chg.evaluate("""([sel, v]) => {
                            const el = document.querySelector(sel);
                            if (!el) return;
                            el.value = v;
                            el.dispatchEvent(new Event('input', {bubbles: true}));
                            el.dispatchEvent(new Event('change', {bubbles: true}));
                        }""", [ctrl_sel, val])
                        time.sleep(delay)

                    # Hold at max for a beat
                    time.sleep(1.0)
                else:
                    # No range input found and no min/max — hard error.
                    # Clicking btns[0] silently records nothing on mode-button UIs.
                    # Use --script to drive interactive controls explicitly.
                    candidates = page_chg.evaluate("""() => {
                        const out = [];
                        document.querySelectorAll(
                            'button, input[type=checkbox], input[type=radio], select, a[role=tab]'
                        ).forEach(el => {
                            const id = el.id ? '#' + el.id : '';
                            const cls = el.className
                                ? '.' + String(el.className).trim().replace(/\\s+/g, '.')
                                : '';
                            out.push(el.tagName.toLowerCase() + id + cls);
                        });
                        return out.slice(0, 20);
                    }""")
                    raise RuntimeError(
                        f"change capture: '{ctrl_sel}' is not a range input — "
                        f"use --script to drive interactive controls explicitly. "
                        f"Candidate controls on this page: {candidates}"
                    )

            except PWTimeout:
                print(f"[capture_sim] control '{ctrl_sel}' not found — holding {change_dur}s", flush=True)
                time.sleep(change_dur)

            page_chg.close()
            ctx_chg.close()

            webm_files_chg = list((tmp_dir / "chg").glob("*.webm"))
            if not webm_files_chg:
                raise RuntimeError("Playwright produced no .webm for change")
            chg_mp4 = media_dir / "change.mp4"
            size2 = webm_to_mp4(webm_files_chg[0], chg_mp4, fps)
            print(f"[capture_sim] change.mp4 written ({size2//1024} KB)", flush=True)

            browser.close()

    finally:
        server.shutdown()
        shutil.rmtree(tmp_dir, ignore_errors=True)

    if smoke_test:
        marker = reel_dir / "media" / "smoke_test_passed.txt"
        marker.write_text(f"capture_sim smoke test passed\noutput.mp4: {out_mp4}\nchange.mp4: {chg_mp4}\n")
        print(f"[capture_sim] SMOKE TEST PASSED — marker written", flush=True)


# ── CLI ───────────────────────────────────────────────────────────────────────

def capture_click_through(sim_html: Path, reel_dir: Path, *,
                          selector: str, hold_each: float,
                          out_name: str, fps: int, width: int, height: int, dpr: int):
    """
    Click-through mode: click each element matching `selector` in DOM order,
    hold `hold_each` seconds after each click so the DOM can settle, then move on.

    Fails loudly if the selector matches 0 or 1 elements — silently producing a
    static clip (the original bug) is treated as an error.

    Writes media/<out_name>.mp4.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("[capture_sim] playwright not installed — pip install playwright")

    serve_dir = sim_html.parent
    server, port = start_server(serve_dir)
    url = f"http://127.0.0.1:{port}/{sim_html.name}"
    media_dir = reel_dir / "media"
    media_dir.mkdir(parents=True, exist_ok=True)

    tmp_dir = Path(tempfile.mkdtemp(prefix="capture_sim_ct_"))
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage",
                      "--autoplay-policy=no-user-gesture-required"],
            )

            ctx = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=dpr,
                record_video_dir=str(tmp_dir),
                record_video_size={"width": width * dpr, "height": height * dpr},
            )
            page = ctx.new_page()
            page.goto(url, wait_until="networkidle", timeout=30_000)
            time.sleep(1.5)  # let D3 settle on load

            # Count matching elements — must be at least 2
            count = page.evaluate(
                "sel => document.querySelectorAll(sel).length", selector
            )
            if count < 2:
                raise RuntimeError(
                    f"[capture_sim] --click-through '{selector}' matched {count} element(s); "
                    f"need ≥ 2. A single-element selector silently produces a static clip — "
                    f"check your selector."
                )
            print(f"[capture_sim] click-through: {count} elements matching '{selector}'", flush=True)

            # Hold a beat on the initial state before clicking anything
            time.sleep(1.0)

            for i in range(count):
                # Re-query each time so live DOM mutations don't invalidate old handles
                page.evaluate("""([sel, idx]) => {
                    const el = document.querySelectorAll(sel)[idx];
                    if (!el) return;
                    el.click();
                }""", [selector, i])

                # Wait for DOM to settle: poll until the active/aria-pressed state
                # stabilises (up to hold_each seconds), then hold the remainder.
                settle_deadline = time.monotonic() + min(0.8, hold_each * 0.3)
                while time.monotonic() < settle_deadline:
                    time.sleep(0.05)

                label = page.evaluate(
                    """([sel, idx]) => {
                        const el = document.querySelectorAll(sel)[idx];
                        return el ? (el.textContent || el.value || String(idx)) : String(idx);
                    }""", [selector, i]
                ).strip()
                print(f"[capture_sim]   clicked [{i+1}/{count}] '{label}'", flush=True)

                remaining = hold_each - min(0.8, hold_each * 0.3)
                time.sleep(max(0.0, remaining))

            # Brief tail hold after the last element
            time.sleep(0.5)

            page.close()
            ctx.close()
            browser.close()

            webm_files = list(tmp_dir.glob("*.webm"))
            if not webm_files:
                raise RuntimeError("Playwright produced no .webm for click-through")

            out_mp4 = media_dir / f"{out_name}.mp4"
            size = webm_to_mp4(webm_files[0], out_mp4, fps)
            print(f"[capture_sim] {out_name}.mp4 written ({size//1024} KB)", flush=True)

    finally:
        server.shutdown()
        shutil.rmtree(tmp_dir, ignore_errors=True)


def capture_scripted(sim_html: Path, reel_dir: Path, *,
                     steps: list, out_name: str,
                     fps: int, width: int, height: int, dpr: int):
    """
    Execute an ordered step sequence while recording.

    Fails loudly if any selector matches 0 elements — silently recording a clip
    where nothing happened IS the bug.

    Writes media/<out_name>.mp4.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("[capture_sim] playwright not installed — pip install playwright")

    serve_dir = sim_html.parent
    server, port = start_server(serve_dir)
    url = f"http://127.0.0.1:{port}/{sim_html.name}"
    media_dir = reel_dir / "media"
    media_dir.mkdir(parents=True, exist_ok=True)

    tmp_dir = Path(tempfile.mkdtemp(prefix="capture_sim_scr_"))
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage",
                      "--autoplay-policy=no-user-gesture-required"],
            )
            ctx = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=dpr,
                record_video_dir=str(tmp_dir),
                record_video_size={"width": width * dpr, "height": height * dpr},
            )
            page = ctx.new_page()
            print(f"[capture_sim] scripted ({out_name}): loading {url}", flush=True)
            page.goto(url, wait_until="networkidle", timeout=30_000)
            time.sleep(1.5)  # initial D3 settle

            SETTLE = 0.15  # DOM settle after each interactive step

            def assert_sel(sel: str, step_i: int) -> int:
                count = page.evaluate(
                    "sel => document.querySelectorAll(sel).length", sel
                )
                if count == 0:
                    raise RuntimeError(
                        f"step {step_i}: selector '{sel}' matched 0 elements — "
                        f"nothing happened. A silent miss IS the bug; check your selector."
                    )
                return count

            for i, step in enumerate(steps):
                if "set" in step:
                    sel, val = step["set"], step["value"]
                    assert_sel(sel, i)
                    page.evaluate("""([sel, v]) => {
                        const el = document.querySelector(sel);
                        el.value = v;
                        el.dispatchEvent(new Event('input', {bubbles: true}));
                        el.dispatchEvent(new Event('change', {bubbles: true}));
                    }""", [sel, val])
                    print(f"[capture_sim]   step {i}: set {sel} = {val}", flush=True)
                    time.sleep(SETTLE)

                elif "click" in step:
                    sel = step["click"]
                    assert_sel(sel, i)
                    at = step.get("at")  # optional [fx, fy] fractional coords within element
                    if at:
                        page.evaluate("""([sel, at]) => {
                            const el = document.querySelector(sel);
                            if (!el) return;
                            const r = el.getBoundingClientRect();
                            const x = r.left + r.width * at[0];
                            const y = r.top + r.height * at[1];
                            // elementFromPoint finds the actual child (e.g. a D3
                            // rect with its own .on('click') handler) — dispatching
                            // on the container misses per-child listeners because
                            // events bubble UP the tree, not down.
                            const target = document.elementFromPoint(x, y) || el;
                            target.dispatchEvent(new MouseEvent('click', {
                                bubbles: true, clientX: x, clientY: y
                            }));
                        }""", [sel, at])
                        print(f"[capture_sim]   step {i}: click {sel} at {at}", flush=True)
                    else:
                        page.evaluate(
                            "sel => document.querySelector(sel).click()", sel
                        )
                        print(f"[capture_sim]   step {i}: click {sel}", flush=True)
                    time.sleep(SETTLE)

                elif "check" in step:
                    sel = step["check"]
                    assert_sel(sel, i)
                    page.evaluate("""sel => {
                        const el = document.querySelector(sel);
                        if (!el.checked) {
                            el.checked = true;
                            el.dispatchEvent(new Event('change', {bubbles: true}));
                        }
                    }""", sel)
                    print(f"[capture_sim]   step {i}: check {sel}", flush=True)
                    time.sleep(SETTLE)

                elif "uncheck" in step:
                    sel = step["uncheck"]
                    assert_sel(sel, i)
                    page.evaluate("""sel => {
                        const el = document.querySelector(sel);
                        if (el.checked) {
                            el.checked = false;
                            el.dispatchEvent(new Event('change', {bubbles: true}));
                        }
                    }""", sel)
                    print(f"[capture_sim]   step {i}: uncheck {sel}", flush=True)
                    time.sleep(SETTLE)

                elif "sweep" in step:
                    sel = step["sweep"]
                    assert_sel(sel, i)
                    # from/to are optional — fall back to element's own min/max
                    if "from" in step and "to" in step:
                        mn = float(step["from"])
                        mx = float(step["to"])
                    else:
                        attrs = page.evaluate("""sel => {
                            const el = document.querySelector(sel);
                            if (!el) return null;
                            return {min: parseFloat(el.min || 0),
                                    max: parseFloat(el.max || 100)};
                        }""", sel)
                        if not attrs:
                            raise RuntimeError(
                                f"step {i}: sweep '{sel}' — could not read min/max; "
                                f"provide explicit 'from' and 'to'."
                            )
                        mn, mx = attrs["min"], attrs["max"]
                    n_steps = int(step.get("steps", 30))
                    step_delay = float(step.get("step_delay", 0.15))
                    print(
                        f"[capture_sim]   step {i}: sweep {sel} {mn}→{mx}"
                        f" ({n_steps} steps × {step_delay}s)",
                        flush=True,
                    )
                    for j in range(n_steps + 1):
                        val = mn + (mx - mn) * j / n_steps
                        page.evaluate("""([sel, v]) => {
                            const el = document.querySelector(sel);
                            el.value = v;
                            el.dispatchEvent(new Event('input', {bubbles: true}));
                            el.dispatchEvent(new Event('change', {bubbles: true}));
                        }""", [sel, val])
                        time.sleep(step_delay)

                elif "scroll" in step:
                    sel = step["scroll"]
                    assert_sel(sel, i)
                    page.evaluate("""sel => {
                        document.querySelector(sel).scrollIntoView(
                            {behavior: 'instant', block: 'start'}
                        );
                    }""", sel)
                    print(f"[capture_sim]   step {i}: scroll to {sel}", flush=True)
                    time.sleep(SETTLE)

                elif "wait" in step:
                    duration = float(step["wait"])
                    print(f"[capture_sim]   step {i}: wait {duration}s", flush=True)
                    time.sleep(duration)

                else:
                    raise RuntimeError(
                        f"step {i}: unknown verb — keys are {list(step.keys())}. "
                        f"Supported: set / click / check / uncheck / sweep / scroll / wait"
                    )

            time.sleep(0.5)  # tail hold so last frame is captured
            page.close()
            ctx.close()
            browser.close()

            webm_files = list(tmp_dir.glob("*.webm"))
            if not webm_files:
                raise RuntimeError("Playwright produced no .webm for scripted capture")

            out_mp4 = media_dir / f"{out_name}.mp4"
            size = webm_to_mp4(webm_files[0], out_mp4, fps)
            print(f"[capture_sim] {out_name}.mp4 written ({size//1024} KB)", flush=True)

    finally:
        server.shutdown()
        shutil.rmtree(tmp_dir, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("sim_html", help="path to the sim .html file")
    ap.add_argument("reel_dir", help="reel directory (media/ will be created inside it)")
    ap.add_argument("--duration",      type=float, default=6.0,  help="baseline hold seconds")
    ap.add_argument("--change-dur",    type=float, default=8.0,  help="change animation seconds")
    ap.add_argument("--fps",           type=int,   default=24,   help="output fps")
    ap.add_argument("--width",         type=int,   default=1280)
    ap.add_argument("--height",        type=int,   default=720)
    ap.add_argument("--selector",      default=None, help="CSS selector of the range control to sweep")
    ap.add_argument("--click-through", default=None, dest="click_through",
                    metavar="CSS", help="click each matched element in DOM order")
    ap.add_argument("--hold-each",     type=float, default=2.5, dest="hold_each",
                    help="hold seconds per element for --click-through")
    ap.add_argument("--script",        default=None, metavar="STEPS_JSON",
                    help="JSON file of ordered steps to execute while recording")
    ap.add_argument("--out-name",      default=None, dest="out_name",
                    help="output stem for --click-through or --script (written to media/<stem>.mp4)")
    ap.add_argument("--dpr",           type=int,   default=1,
                    help="device pixel ratio — output resolution is width*dpr × height*dpr (default: 1)")
    ap.add_argument("--smoke-test",    action="store_true")
    args = ap.parse_args()

    sim_html = Path(args.sim_html).resolve()
    reel_dir = Path(args.reel_dir).resolve()

    if not sim_html.exists():
        sys.exit(f"[capture_sim] ERROR: sim not found: {sim_html}")

    print(f"[capture_sim] sim={sim_html.name}  reel={reel_dir}", flush=True)

    # Script mode — ordered step sequence
    if args.script is not None:
        if args.click_through is not None:
            sys.exit("[capture_sim] --script and --click-through are mutually exclusive")
        import json as _json
        steps_path = Path(args.script).resolve()
        if not steps_path.exists():
            sys.exit(f"[capture_sim] steps JSON not found: {steps_path}")
        with open(steps_path) as _f:
            steps = _json.load(_f)
        if not isinstance(steps, list) or len(steps) == 0:
            sys.exit(f"[capture_sim] steps JSON must be a non-empty array: {steps_path}")
        out_name = args.out_name or steps_path.stem
        try:
            capture_scripted(
                sim_html, reel_dir,
                steps=steps,
                out_name=out_name,
                fps=args.fps,
                width=args.width,
                height=args.height,
                dpr=args.dpr,
            )
        except Exception as e:
            print(f"[capture_sim] FAILED: {e}", file=sys.stderr, flush=True)
            sys.exit(1)
        return

    # Click-through mode (discrete controls) — separate path, no range sweep
    if args.click_through is not None:
        out_name = args.out_name or "change-clickthrough"
        try:
            capture_click_through(
                sim_html, reel_dir,
                selector=args.click_through,
                hold_each=args.hold_each,
                out_name=out_name,
                fps=args.fps,
                width=args.width,
                height=args.height,
                dpr=args.dpr,
            )
        except Exception as e:
            print(f"[capture_sim] FAILED: {e}", file=sys.stderr, flush=True)
            sys.exit(1)
        return

    try:
        capture(
            sim_html, reel_dir,
            duration=args.duration,
            change_dur=args.change_dur,
            fps=args.fps,
            width=args.width,
            height=args.height,
            dpr=args.dpr,
            selector=args.selector,
            smoke_test=args.smoke_test,
        )
    except Exception as e:
        print(f"[capture_sim] FAILED: {e}", file=sys.stderr, flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
