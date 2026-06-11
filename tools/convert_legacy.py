#!/usr/bin/env python3
"""
Convert a legacy page to the editorial system by transplant: the page's
content markup stays byte-identical; the chrome (nav/footer/menu + JS),
fonts, and the entire <style> block are replaced with editorial
equivalents. Content styling comes from a per-page/per-family CSS file
authored against the page's existing class names.

    python3 tools/convert_legacy.py <page.html> <family.css> [more.css ...]

The result carries chrome markers, so tools/stamp_chrome.py keeps it in
sync from then on. Verify with tools/check_pages.py and a screenshot.
"""
import re
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

FONTS = '''  <!-- Performance: Preconnect to external domains -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Load fonts asynchronously (non-blocking) -->
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,900;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" as="style"
    onload="this.onload=null;this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,900;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap">
  </noscript>'''

EMAIL_DECODE = ('<script data-cfasync="false" '
                'src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/'
                'email-decode.min.js"></script>')


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def balanced_end(content, start, opening='<div', closing='</div>'):
    pos = content.find('>', start) + 1
    depth = 1
    rx = re.compile(re.escape(opening) + r'\b|' + re.escape(closing))
    while depth and pos < len(content):
        m = rx.search(content, pos)
        if not m:
            return -1
        depth += 1 if m.group(0) != closing else -1
        pos = m.end()
    return pos


def drop_block(c, start_marker, opening='<div', closing='</div>', label=''):
    s = c.find(start_marker)
    if s < 0:
        return c, False
    e = balanced_end(c, s + len(start_marker) - 1, opening, closing)
    if e < 0:
        sys.exit(f'FATAL: unbalanced block for {label or start_marker}')
    return c[:s] + c[e:], True


def main():
    page, css_files = sys.argv[1], sys.argv[2:]
    c = read(page)
    notes = []

    style_css = read('templates/editorial-foundation.css')
    for f in css_files:
        style_css += '\n\n' + read(f)

    # ---- HEAD ----
    # all google-fonts link tags -> canonical pattern (placed where the
    # first one was); drop preconnects (re-added by FONTS)
    fonts_rx = re.compile(
        r'[ \t]*<link[^>]*(fonts\.googleapis\.com|fonts\.gstatic\.com)'
        r'[^>]*>\n?')
    first = fonts_rx.search(c)
    if first:
        c = c[:first.start()] + '\x00FONTS\x00' + c[first.end():]
        c = fonts_rx.sub('', c)
        c = c.replace('\x00FONTS\x00', FONTS + '\n')
        notes.append('fonts')
    # also remove <noscript> wrappers that became empty + preload onload dupes
    c = re.sub(r'<noscript>\s*</noscript>\n?', '', c)

    # navbar css
    n = re.subn(r'[ \t]*<link[^>]*css/navbar\.css[^>]*>\n?', '', c)
    c, removed = n
    if removed:
        notes.append('navbar.css')

    # main style block -> editorial css
    m = re.search(r'<style>.*?</style>', c, re.S)
    if not m:
        sys.exit('FATAL: no <style> block found')
    c = (c[:m.start()] + '<style>\n' + style_css + '\n  </style>'
         + c[m.end():])
    extra_styles = len(re.findall(r'<style', c)) - 1
    if extra_styles:
        notes.append(f'WARNING: {extra_styles} extra <style> blocks kept')
    notes.append('style')

    # announcement early-dismissal script in head
    c2 = re.sub(
        r'[ \t]*<script>[^<]*ambassadorAnnouncementClosedAt[^<]*</script>\n?',
        '', c)
    if c2 != c:
        notes.append('early-announce-js')
        c = c2

    # ---- BODY ----
    ann = c.find('<div class="announcement-bar"')
    if ann >= 0:
        c, _ = drop_block(c, '<div class="announcement-bar"',
                          label='announcement bar')
        notes.append('announcement-html')

    # legacy nav + mobile menu -> marked template nav
    nav_s = c.find('<nav id="nav">')
    if nav_s < 0:
        nav_s = c.find('<nav')
    mm_s = c.find('<div class="mobile-menu"')
    if nav_s < 0 or mm_s < 0:
        sys.exit('FATAL: nav or mobile menu not found')
    mm_e = balanced_end(c, mm_s)
    nav_tpl = read('templates/nav.html').rstrip('\n')
    c = (c[:nav_s] + '<!-- chrome:nav -->\n  ' + nav_tpl
         + '\n  <!-- /chrome:nav -->' + c[mm_e:])
    notes.append('nav')

    # footer -> marked template footer
    f_s = c.find('<footer')
    f_e = c.find('</footer>', f_s)
    if f_s < 0 or f_e < 0:
        sys.exit('FATAL: footer not found')
    f_e += len('</footer>')
    foot_tpl = read('templates/footer.html').rstrip('\n')
    c = (c[:f_s] + '<!-- chrome:footer -->\n  ' + foot_tpl
         + '\n  <!-- /chrome:footer -->' + c[f_e:])
    notes.append('footer')

    # js/navbar.js include
    n = re.subn(r'[ \t]*<script[^>]*js/navbar\.js[^>]*>\s*</script>\n?', '', c)
    c, removed = n
    if removed:
        notes.append('navbar.js')

    # legacy inline chrome script (mobile menu handlers) -> marked template
    script_tpl = read('templates/chrome-script.html').rstrip('\n')
    chrome_block = ('<!-- chrome:script -->\n  ' + script_tpl
                    + '\n  <!-- /chrome:script -->')
    replaced = False
    for sm in re.finditer(r'<script>(.*?)</script>', c, re.S):
        body = sm.group(1)
        if ('mobileMenuBtn' in body or 'mobile-menu-btn' in body
                or 'Navigation scroll effect' in body
                or "getElementById('nav')" in body):
            foreign = [t for t in ('DOMContentLoaded', 'fetch(', 'Chart',
                       'calculate', 'localStorage')
                       if t in body and 'announcement' not in body.lower()]
            if foreign:
                notes.append(f'WARNING: chrome script has page code '
                             f'({",".join(foreign)}) — left in place, '
                             f'chrome script appended separately')
                continue
            c = c[:sm.start()] + chrome_block + c[sm.end():]
            replaced = True
            notes.append('chrome-script')
            break
    if not replaced:
        # no legacy chrome script found; insert before </body>
        be = c.rfind('</body>')
        c = c[:be] + '  ' + chrome_block + '\n\n' + c[be:]
        notes.append('chrome-script-inserted')

    # announcement bar JS
    c2 = re.sub(
        r'[ \t]*<script>(?:(?!</script>).)*announcementBar(?:(?!</script>).)*'
        r'</script>\n?', '', c, flags=re.S)
    if c2 != c:
        notes.append('announce-js')
        c = c2

    # email-decode before chrome script
    if 'email-decode.min.js' not in c:
        c = c.replace('<!-- chrome:script -->',
                      EMAIL_DECODE + '\n  <!-- chrome:script -->', 1)
        notes.append('email-decode')

    with open(page, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f'{page}: ' + ', '.join(notes))


if __name__ == '__main__':
    main()
