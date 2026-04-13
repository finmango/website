#!/usr/bin/env python3
"""
Remove ambassador announcement banner from all HTML pages.
Removes: the banner HTML, body class, early script, bottom JS, and CSS blocks.
"""
import os
import re
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def process(content):
    original = content

    # 1. Remove announcement bar HTML div
    content = re.sub(
        r'\n?[ \t]*<div class="announcement-bar" id="announcementBar">[\s\S]*?</div>',
        '',
        content
    )

    # 2. Remove 'has-announcement' class from <body>
    content = re.sub(r'(<body) class="has-announcement"', r'\1', content)
    content = re.sub(r'(<body[^>]*) has-announcement([^"]*")', r'\1\2', content)

    # 3. Remove early dismissal <script> block from <head>
    content = re.sub(
        r'\n?[ \t]*<!-- Early announcement bar dismissal check[^>]*-->[ \t]*\n[ \t]*<script>[\s\S]*?ambassadorAnnouncementClosedAt_v1[\s\S]*?</script>',
        '',
        content
    )

    # 4a. Remove bottom <!-- Announcement Bar --> <script> block (navbar.js pages)
    content = re.sub(
        r'\n?[ \t]*<!-- Announcement Bar -->[ \t]*\n[ \t]*<script>[\s\S]*?ambassadorAnnouncementClosedAt_v1[\s\S]*?</script>',
        '',
        content
    )

    # 4b. Remove inline // Announcement Bar script block (index.html style)
    content = re.sub(
        r'\n?[ \t]*<script>\n[ \t]*// Announcement Bar\n[ \t]*\(function \(\) \{[\s\S]*?ambassadorAnnouncementClosedAt_v1[\s\S]*?\}\)\(\);[ \t]*\n[ \t]*</script>',
        '',
        content
    )

    # 5. Remove CSS: /* ============================================
    #                   ANNOUNCEMENT BAR
    #                   ============================================ */
    #    ... up to the next /* ===... comment (sync-script style)
    content = re.sub(
        r'\n?[ \t]*\/\*[= ]*\n[ \t]*ANNOUNCEMENT BAR\n[ \t]*[= ]*\*\/[\s\S]*?(?=[ \t]*\/\*[= ]*\n[ \t]*(?:RESPONSIVE|[A-Z]))',
        '\n',
        content
    )

    # 6. Remove CSS: /* Announcement Bar */ ... up to next /* comment (original page style)
    content = re.sub(
        r'\n?[ \t]*\/\* Announcement Bar \*\/\n[\s\S]*?(?=[ \t]*\/\*|\s*</style>)',
        '\n',
        content
    )

    # 7. Remove standalone single-line announcement CSS rules that may remain
    lines_out = []
    for line in content.split('\n'):
        s = line.strip()
        if (s.startswith('.announcement-bar') or
                s.startswith('.announcement-close') or
                s.startswith('html.announcement-dismissed') or
                (s.startswith('body.has-announcement') and
                 any(tok in s for tok in ('nav', 'mobile-menu', 'hero'))) or
                ('@media' in s and '.announcement-bar' in s and '.announcement-close' in s)):
            continue
        lines_out.append(line)
    content = '\n'.join(lines_out)

    return content, content != original


html_files = sorted(glob.glob('**/*.html', recursive=True))

updated = 0
skipped = 0
for fpath in html_files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            orig = f.read()
    except Exception as e:
        print(f'  ERR  {fpath}: {e}')
        continue

    if 'announcementBar' not in orig and 'has-announcement' not in orig:
        skipped += 1
        continue

    new_content, changed = process(orig)
    if changed:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'  OK   {fpath}')
        updated += 1
    else:
        print(f' SKIP  {fpath}')

print(f'\nDone: {updated} updated, {skipped} skipped (no banner).')
