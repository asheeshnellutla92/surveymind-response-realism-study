#!/usr/bin/env python3
"""check_keys.py — validate optional keys LIVE and FREE (no generation, no spend).

This toolkit is free by default (Kokoro, Manim, Remotion — no keys needed).
This script checks the optional keys that unlock upgrade features:
  higgsfield   `higgsfield account status` → logged in? + credits   (no gen)

Reads the repo-root `.env` (shell env wins). Prints a table; never prints a
secret value. Exit 0 if every present key is valid; 1 if any present key is
invalid.

Usage:  ./art keys        (or)  python3 runtime/scripts/check_keys.py
"""
from __future__ import annotations
import os, sys, json, subprocess
from pathlib import Path

REPO = Path(os.environ.get("ART_HOME") or Path(__file__).resolve().parents[2])

def load_env():
    f = REPO / ".env"
    if not f.exists():
        return
    for line in f.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip(); v = v.strip().strip('"').strip("'")
        os.environ.setdefault(k, v)   # shell wins

C = {"ok": "\033[32m", "bad": "\033[31m", "warn": "\033[33m", "z": "\033[0m", "b": "\033[1m"}
rows = []
_state = {'inconclusive': False}
def row(service, var, status, detail):
    rows.append((service, var, status, detail))

def main():
    load_env()
    any_invalid = False

    # ── higgsfield CLI (no env key; login-based) ─────────────────────────────
    try:
        r = subprocess.run(["higgsfield", "account", "status"],
                           capture_output=True, text=True, timeout=25)
        out = (r.stdout + r.stderr).strip().replace("\n", " ")[:80]
        if r.returncode == 0:
            row("higgsfield", "(CLI login)", "valid", out or "logged in")
        else:
            row("higgsfield", "(CLI login)", "invalid",
                "run `higgsfield auth login` — " + (out or "not logged in"))
    except FileNotFoundError:
        row("higgsfield", "(CLI login)", "unset",
            "CLI not installed — AI video beats use free path (Ken Burns stills)")
    except Exception as e:
        _state["inconclusive"] = True
        row("higgsfield", "(CLI login)", "warn", f"status check failed: {e}")

    # ── print ────────────────────────────────────────────────────────────────
    print()
    print(f"  {C['b']}key readiness (live, free — no generation){C['z']}\n")
    print(f"  {'SERVICE':<14}{'VAR':<32}{'STATUS':<10}DETAIL")
    print(f"  {'-------':<14}{'---':<32}{'------':<10}------")
    for svc, var, st, det in rows:
        col = {"valid": C["ok"], "invalid": C["bad"], "warn": C["warn"]}.get(st, C["warn"])
        mark = {"valid": "✅ valid", "invalid": "❌ invalid", "unset": "· unset",
                "warn": "⚠ check", "set (not probed)": "· set"}.get(st, st)
        print(f"  {svc:<14}{var:<32}{col}{mark:<10}{C['z']}{det}")
    print()
    print("  No keys are required. Higgsfield is an opt-in upgrade — if its CLI is")
    print("  absent or not logged in, all beats fall back to the free path silently.")
    if any_invalid:
        print(f"\n  {C['bad']}One or more present keys are invalid — fix before using those features.{C['z']}\n")
        return 1
    if _state["inconclusive"]:
        print(f"\n  {C['warn']}Some probes were inconclusive (no network?) — re-run "
              f"`./art keys` in a terminal with internet.{C['z']}\n")
        return 0
    print(f"\n  {C['ok']}All present keys validated.{C['z']}\n")
    return 0

if __name__ == "__main__":
    sys.exit(main())
