#!/usr/bin/env python3
"""
Deploy a repo Apps Script file to its live Google Apps Script project.

    tools/clasp-sync.py <script-id> <deployment-id> <repo-file> [--dry-run]

What it does, in order:
  1. `clasp clone` the live project into a temp folder (needs ~/.clasprc.json —
     see docs/APPS-SCRIPT-DEPLOY.md for where the credential lives).
  2. Start from the repo file, then copy every CONFIG value from the live copy
     whose live value is real (not a REPLACE_WITH… / change-this placeholder).
     That is how the deployed script keeps its keys while the repo never holds
     them. CONFIG keys that exist only in the repo file keep the repo value.
  3. Show a masked diff of what would change on the live project.
  4. `clasp push`, then `clasp deploy -i <deployment-id>` so the existing /exec
     URL (the one the website's Cloudflare functions call) picks up the new
     version. With --dry-run it stops after step 3.

The live project is expected to be a single Code.js (plus appsscript.json).
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

PLACEHOLDER = re.compile(r"^(REPLACE_WITH|change-this)")
CONFIG_LINE = re.compile(r"^(\s{2})([A-Z_]+): ('(?:[^'\\]|\\.)*'),\s*$")


def run(cmd, cwd=None):
    print("$ " + " ".join(cmd))
    res = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    out = re.sub(r"\x1b\[[0-9;]*[A-Za-z]", "", (res.stdout or "") + (res.stderr or ""))
    print(out.strip())
    if res.returncode != 0:
        sys.exit("command failed: " + " ".join(cmd))
    return out


def config_values(src):
    """{KEY: "'value'"} for every `  KEY: '…',` line inside `const CONFIG = {`."""
    vals = {}
    inside = False
    for line in src.splitlines():
        if line.startswith("const CONFIG = {"):
            inside = True
            continue
        if inside and line.startswith("};"):
            break
        if inside:
            m = CONFIG_LINE.match(line)
            if m:
                vals[m.group(2)] = m.group(3)
    return vals


def mask(line):
    return re.sub(r"('[^']{6})[^']*'", r"\1…'", line)


def main():
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry = "--dry-run" in sys.argv
    if len(args) != 3:
        sys.exit(__doc__)
    script_id, deployment_id, repo_file = args
    repo_src = open(repo_file, encoding="utf-8").read()

    work = tempfile.mkdtemp(prefix="clasp-sync-")
    try:
        run(["clasp", "clone", script_id], cwd=work)
        live_path = os.path.join(work, "Code.js")
        if not os.path.exists(live_path):
            sys.exit("live project has no Code.js; files: " + ", ".join(os.listdir(work)))
        live_src = open(live_path, encoding="utf-8").read()

        live_vals = config_values(live_src)
        merged_lines = []
        carried = []
        for line in repo_src.splitlines(keepends=True):
            m = CONFIG_LINE.match(line.rstrip("\n"))
            if m and m.group(2) in live_vals:
                lv = live_vals[m.group(2)]
                if not PLACEHOLDER.match(lv.strip("'")) and lv != m.group(3):
                    line = "%s%s: %s,\n" % (m.group(1), m.group(2), lv)
                    carried.append(m.group(2))
            merged_lines.append(line)
        merged = "".join(merged_lines)
        print("\nCONFIG values carried over from the live script: " + (", ".join(carried) or "none"))

        print("\nChanges the live project would receive (values masked):")
        import difflib
        diff = list(difflib.unified_diff(live_src.splitlines(), merged.splitlines(), "live", "new", lineterm="", n=0))
        if not diff:
            print("  (none — live already matches)")
            return
        for d in diff[:120]:
            print("  " + mask(d))
        if len(diff) > 120:
            print("  … %d more lines" % (len(diff) - 120))

        if dry:
            print("\n--dry-run: nothing pushed.")
            return

        open(live_path, "w", encoding="utf-8").write(merged)
        subprocess.run(["node", "--check", live_path], check=True)
        run(["clasp", "push", "-f"], cwd=work)
        run(["clasp", "deploy", "-i", deployment_id, "-d", "Synced from website repo"], cwd=work)
        print("\nDeployed. The /exec URL is unchanged; the new version is live.")
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()
