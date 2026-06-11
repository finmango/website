#!/usr/bin/env python3
"""
Static sanity checks for the site. Run after any bulk page change:

    python3 tools/check_pages.py

- Every local href/src on every page must resolve to a file in the repo.
- Every editorial-system page must carry the shared chrome markers, the GA
  tag, a viewport meta, a canonical link, and a non-empty <title>.

Exits non-zero on regressions so it can guard CI.
"""
import os
import re
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

SKIP_DIRS = {'.git', 'node_modules', 'tools', 'templates', 'docs'}
ATTR_RX = re.compile(r'''(?:href|src)\s*=\s*["']([^"'#]+)["']''', re.I)
EXTERNAL = ('http://', 'https://', 'mailto:', 'tel:', 'javascript:', 'data:',
            '/cdn-cgi/', '//')

problems = []
pages = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for f in sorted(files):
        if f.endswith('.html'):
            pages.append(os.path.normpath(os.path.join(root, f)))

for page in pages:
    with open(page, encoding='utf-8') as fh:
        content = fh.read()
    base = os.path.dirname(page)

    for ref in ATTR_RX.findall(content):
        ref = ref.strip()
        if not ref or ref.startswith(EXTERNAL) or ref.startswith('#'):
            continue
        if '{{' in ref or '${' in ref:   # templated refs in inline JS
            continue
        path = urllib.parse.unquote(ref.split('?')[0].split('#')[0])
        if path.startswith('/'):
            target = path.lstrip('/')
        else:
            target = os.path.normpath(os.path.join(base, path))
        if target and not os.path.exists(target):
            # _redirects maps /foo.html -> /foo, so foo.html also resolves
            # when a foo/index.html directory page exists.
            alt = re.sub(r'\.html$', '', target)
            if not (alt != target and os.path.isfile(
                    os.path.join(alt, 'index.html'))):
                problems.append(f'{page}: broken local ref -> {ref}')

    if '--paper: #FAFAF7' in content and base == '.':
        for need, label in [('<!-- chrome:nav', 'chrome:nav marker'),
                            ('<!-- chrome:footer -->', 'chrome:footer marker'),
                            ('<!-- chrome:script -->', 'chrome:script marker'),
                            ('G-DW5HBYS9JW', 'Google Analytics tag'),
                            ('name="viewport"', 'viewport meta'),
                            ('rel="canonical"', 'canonical link')]:
            if need not in content:
                problems.append(f'{page}: missing {label}')
        title = re.search(r'<title>([^<]*)</title>', content)
        if not title or not title.group(1).strip():
            problems.append(f'{page}: empty or missing <title>')

print(f'checked {len(pages)} pages')
if problems:
    print(f'\n{len(problems)} problems:')
    for p in problems:
        print(' ', p)
    sys.exit(1)
print('all checks pass')
