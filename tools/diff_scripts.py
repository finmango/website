#!/usr/bin/env python3
"""
Verify that a migrated page kept its functional JavaScript.

    python3 tools/diff_scripts.py <pre-dir> <page.html> [page2.html ...]

For each page, extracts every inline <script> body from the pre-migration
copy in <pre-dir> and from the current file, normalizes whitespace, and
reports which pre-migration scripts vanished. Known-removable scripts
(legacy chrome/nav/menu JS, announcement bar, reveal-on-scroll observers,
animated counters) are tolerated; anything else missing is flagged.
"""
import os
import re
import sys

SCRIPT_RX = re.compile(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', re.S)

LEGACY_OK = ('// Navigation scroll effect', 'IntersectionObserver',
             'announcementBar', 'navbar', 'counter', 'reveal',
             'dataLayer')  # GA bootstrap is kept but identical anyway


def bodies(path):
    with open(path, encoding='utf-8') as f:
        content = f.read()
    out = {}
    for m in SCRIPT_RX.findall(content):
        norm = re.sub(r'\s+', ' ', m).strip()
        if norm:
            out[norm] = m
    return out


pre_dir = sys.argv[1]
failed = False
for page in sys.argv[2:]:
    pre = bodies(os.path.join(pre_dir, os.path.basename(page)))
    post = bodies(page)
    missing = []
    for norm, raw in pre.items():
        if norm in post:
            continue
        if any(tok in raw for tok in LEGACY_OK):
            continue
        missing.append(raw)
    if missing:
        failed = True
        print(f'\n{page}: {len(missing)} functional script(s) MISSING or '
              f'modified:')
        for raw in missing:
            head = raw.strip().splitlines()[0][:90]
            print(f'  - {len(raw)} chars, starts: {head}')
    else:
        print(f'{page}: OK ({len(pre)} pre / {len(post)} post inline scripts)')

sys.exit(1 if failed else 0)
