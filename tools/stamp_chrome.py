#!/usr/bin/env python3
"""
Stamp the shared chrome (nav + mobile menu, footer, chrome script) from
templates/ into every root-level page that carries chrome markers. This is
the ONE command to run after editing templates/nav.html, templates/footer.html
or templates/chrome-script.html:

    python3 tools/stamp_chrome.py            # rewrite marked pages
    python3 tools/stamp_chrome.py --init     # also add markers to pages that
                                             # have the chrome but no markers
    python3 tools/stamp_chrome.py --check    # exit non-zero if anything would
                                             # change (CI guard)

Markers in a page look like:

    <!-- chrome:nav active="about.html" -->   ... <!-- /chrome:nav -->
    <!-- chrome:footer -->                    ... <!-- /chrome:footer -->
    <!-- chrome:script -->                    ... <!-- /chrome:script -->

The optional active="..." href gets aria-current="page" applied to matching
top-level links in both the desktop nav and the mobile menu.

Only root-level *.html files are stamped (subdirectory apps like judges/ and
ai-ready/ manage their own chrome). Pages without chrome (social/print
graphics templates) are ignored.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

MODE_INIT = '--init' in sys.argv
MODE_CHECK = '--check' in sys.argv


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


TPL = {
    'nav': read('templates/nav.html').rstrip('\n'),
    'footer': read('templates/footer.html').rstrip('\n'),
    'script': read('templates/chrome-script.html').rstrip('\n'),
}

# Top-level nav links eligible for an active state.
ACTIVE_LINKS = ('about.html', 'research.html', 'education.html',
                'ambassadors.html', 'get-involved.html', 'donate.html')

MARK = {
    'nav': (re.compile(
        r'<!-- chrome:nav( active="(?P<active>[^"]*)")? -->.*?<!-- /chrome:nav -->',
        re.S), '<!-- chrome:nav{a} -->\n{body}\n  <!-- /chrome:nav -->'),
    'footer': (re.compile(
        r'<!-- chrome:footer -->.*?<!-- /chrome:footer -->', re.S),
        '<!-- chrome:footer -->\n{body}\n  <!-- /chrome:footer -->'),
    'script': (re.compile(
        r'<!-- chrome:script -->.*?<!-- /chrome:script -->', re.S),
        '<!-- chrome:script -->\n{body}\n  <!-- /chrome:script -->'),
}


def apply_active(nav_html, active):
    """Add aria-current="page" to the top-level links matching `active`."""
    if not active or active not in ACTIVE_LINKS:
        return nav_html
    return nav_html.replace(f'<a href="{active}">',
                            f'<a href="{active}" aria-current="page">')


def balanced_div_end(content, start):
    """Position just after the </div> matching the <div…> opening at start."""
    pos = content.find('>', start) + 1
    depth = 1
    while depth and pos < len(content):
        m = re.compile(r'<div\b|</div>').search(content, pos)
        if not m:
            return -1
        depth += 1 if m.group(0) != '</div>' else -1
        pos = m.end()
    return pos


def init_markers(content):
    """Wrap an unmarked page's existing chrome in markers (one-time)."""
    notes = []

    # nav + mobile menu = one block, <nav id="nav"> … mobile-menu </div>
    if '<!-- chrome:nav' not in content:
        nav_start = content.find('<nav id="nav">')
        mm_start = content.find('<div class="mobile-menu" id="mobileMenu">')
        if nav_start >= 0 and mm_start > nav_start:
            mm_end = balanced_div_end(content, mm_start)
            if mm_end > 0:
                old = content[nav_start:mm_end]
                m = re.search(r'<a href="([^"]+)" aria-current="page">', old)
                active = f' active="{m.group(1)}"' if m else ''
                content = (content[:nav_start]
                           + f'<!-- chrome:nav{active} -->\n  '
                           + old + '\n  <!-- /chrome:nav -->'
                           + content[mm_end:])
                notes.append('nav-marked')

    if '<!-- chrome:footer -->' not in content:
        f_start = content.find('<footer>')
        f_end = content.find('</footer>', f_start)
        if f_start >= 0 and f_end > 0:
            f_end += len('</footer>')
            content = (content[:f_start] + '<!-- chrome:footer -->\n  '
                       + content[f_start:f_end]
                       + '\n  <!-- /chrome:footer -->' + content[f_end:])
            notes.append('footer-marked')

    if '<!-- chrome:script -->' not in content:
        anchor = '// Navigation scroll effect'
        a_pos = content.find(anchor)
        if a_pos >= 0:
            s_start = content.rfind('<script>', 0, a_pos)
            s_end = content.find('</script>', a_pos)
            if s_start >= 0 and s_end > 0:
                s_end += len('</script>')
                body = content[s_start:s_end]
                # Refuse unless every line of the script already exists in the
                # canonical template — pages sometimes append page-specific JS
                # to the chrome script, which stamping would delete.
                tpl_lines = {l.strip() for l in TPL['script'].splitlines()}
                tpl_lines.update(('<script>', '</script>', ''))
                foreign = [l for l in body.splitlines()
                           if l.strip() not in tpl_lines]
                if foreign:
                    notes.append('script-SKIPPED-page-specific-code')
                else:
                    content = (content[:s_start] + '<!-- chrome:script -->\n  '
                               + body + '\n  <!-- /chrome:script -->'
                               + content[s_end:])
                    notes.append('script-marked')

    return content, notes


changed, skipped, would_change = [], [], []
for fname in sorted(os.listdir(ROOT)):
    if not fname.endswith('.html'):
        continue
    original = read(fname)
    content = original

    # Only pages on the editorial design system carry the shared chrome;
    # legacy pages get markers as part of their migration instead.
    if MODE_INIT and '--paper: #FAFAF7' in content:
        content, notes = init_markers(content)
        if notes:
            print(f'  init {fname}: {", ".join(notes)}')

    if '<!-- chrome:' not in content:
        skipped.append(fname)
        continue

    for kind, (rx, fmt) in MARK.items():
        m = rx.search(content)
        if not m:
            continue
        body = TPL[kind]
        a = ''
        if kind == 'nav':
            active = m.groupdict().get('active')
            body = apply_active(body, active)
            a = f' active="{active}"' if active else ''
        replacement = fmt.format(a=a, body=body)
        content = content[:m.start()] + replacement + content[m.end():]

    if content != original:
        would_change.append(fname)
        if not MODE_CHECK:
            with open(fname, 'w', encoding='utf-8') as f:
                f.write(content)
            changed.append(fname)

if MODE_CHECK:
    if would_change:
        print('STALE CHROME (run tools/stamp_chrome.py):',
              ', '.join(would_change))
        sys.exit(1)
    print('chrome in sync everywhere')
else:
    print(f'\nstamped {len(changed)} pages; '
          f'{len(skipped)} pages have no chrome markers')
