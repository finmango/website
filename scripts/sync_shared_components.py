#!/usr/bin/env python3
"""
Sync shared components from index.html to all other pages.
Updates: early dismissal script, shared CSS, announcement bar,
         desktop nav, mobile menu, footer, and their JS.
"""
import os
import re
import sys

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# =============================================================================
# EXTRACT SHARED COMPONENTS FROM INDEX.HTML
# =============================================================================

with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()
index_lines = index_content.split('\n')

def L(start, end):
    """Get lines from index.html (1-indexed, inclusive)."""
    return '\n'.join(index_lines[start - 1:end])

# 1. Early announcement dismissal script (lines 100-111)
EARLY_SCRIPT = L(100, 111)

# 2. CSS blocks from index.html
MEGA_DROPDOWN_CSS = L(548, 665)   # Mega dropdown + .mobile-controls
FOOTER_CSS        = L(1789, 1982) # Footer styles (incl. social, squiggle)
MOBILE_MENU_CSS   = L(1983, 2293) # Mobile menu (incl. card tiles, footer)
ANNOUNCEMENT_CSS  = L(2424, 2490) # Announcement bar + html.announcement-dismissed

# Responsive rules for shared components (extracted from index.html media queries,
# page-specific rules omitted)
RESPONSIVE_SHARED_CSS = """
    /* ============================================
       RESPONSIVE — SHARED COMPONENTS ONLY
       ============================================ */
    @media (max-width: 1200px) {
      .nav-right { gap: 1.5rem; }
      .nav-right a { font-size: 0.95rem; }
      .btn-donate, .btn-get-involved { padding: 0.65rem 1.5rem; font-size: 0.9rem; }
    }

    @media (max-width: 1080px) {
      nav { padding: 1.25rem 0; }
      nav.scrolled { padding: 0.875rem 0; }
      .logo img { height: 42px; }
      nav.scrolled .logo img { height: 36px; }
      .nav-right { gap: 1.25rem; }
      .nav-right a { font-size: 0.9rem; }
      .btn-donate, .btn-get-involved { padding: 0.6rem 1.25rem; font-size: 0.85rem; text-transform: none; }
    }

    @media (max-width: 968px) {
      .nav-container { grid-template-columns: 1fr auto; gap: 1rem; }
      .nav-right { display: none; }
      .mobile-controls { display: flex; }
      .mobile-menu-btn { display: block; }
      .mobile-get-involved { display: inline-block; padding: 0.35rem 0.85rem; font-size: 0.72rem; }
      .mobile-menu { display: block; }
      .footer-newsletter { padding: 2rem 1.5rem; }
      .footer-newsletter-container { flex-direction: column; text-align: center; gap: 1rem; }
      .footer-newsletter-text { text-align: center; }
      .footer-newsletter h3 { font-size: 1.15rem; }
      .footer-newsletter p { font-size: 0.85rem; }
      .footer-newsletter-btn { padding: 0.7rem 1.5rem; font-size: 0.85rem; }
      .footer-container { grid-template-columns: 1fr 1fr; gap: 2rem; }
      .footer-brand-col { grid-column: 1 / -1; }
      .footer-social { justify-content: flex-start; }
      .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
    }

    @media (max-width: 480px) {
      .mobile-menu-nav > a { font-size: 1.3rem; }
      .mobile-dropdown-toggle { font-size: 1.3rem; }
    }"""

NEW_CSS_BLOCK = (
    '\n\n' + MEGA_DROPDOWN_CSS + '\n\n' +
    FOOTER_CSS + '\n\n' +
    MOBILE_MENU_CSS + '\n\n' +
    ANNOUNCEMENT_CSS +
    RESPONSIVE_SHARED_CSS
)

# 3. HTML blocks
ANNOUNCEMENT_HTML  = L(2620, 2624)
NAV_HTML           = L(2626, 2726)
MOBILE_MENU_HTML   = L(2728, 2795)
FOOTER_HTML        = L(3170, 3248)

# 4. JS blocks (with wrapping <script> tags)
ANNOUNCEMENT_JS_BLOCK     = L(3431, 3471)
MOBILE_ACCORDION_JS_BLOCK = L(3587, 3599)

# =============================================================================
# HELPERS
# =============================================================================

def find_closing_div_end(content, content_start):
    """
    Given the position just INSIDE an opening <div> tag (i.e., after '>'),
    return the position just after the matching closing </div>.
    """
    pos = content_start
    depth = 1
    while depth > 0 and pos < len(content):
        open_pos  = content.find('<div', pos)
        close_pos = content.find('</div>', pos)
        if close_pos < 0:
            return -1  # Malformed HTML
        if open_pos >= 0 and open_pos < close_pos:
            depth += 1
            pos = open_pos + 4
        else:
            depth -= 1
            pos = close_pos + 6
    return pos


# =============================================================================
# UPDATE A SINGLE PAGE
# =============================================================================

def update_page(filepath, content):
    changes = []

    # ------------------------------------------------------------------
    # 1. Add early announcement dismissal <script> to <head>
    # ------------------------------------------------------------------
    if "var key = 'ambassadorAnnouncementClosedAt_v1'" not in content:
        head_end = content.find('</head>')
        if head_end >= 0:
            content = content[:head_end] + '\n  ' + EARLY_SCRIPT + '\n\n' + content[head_end:]
            changes.append('early_script')

    # ------------------------------------------------------------------
    # 2. Append new shared CSS to the <style> block in <head>
    # ------------------------------------------------------------------
    if 'html.announcement-dismissed' not in content:
        head_end = content.find('</head>')
        # Find the last </style> before </head>
        style_end = content.rfind('</style>', 0, head_end)
        if style_end >= 0:
            content = (content[:style_end] +
                       NEW_CSS_BLOCK + '\n  </style>' +
                       content[style_end + len('</style>'):])
            changes.append('css')

    # ------------------------------------------------------------------
    # 3. Replace announcement bar HTML
    # ------------------------------------------------------------------
    ann_marker = '<div class="announcement-bar" id="announcementBar">'
    ann_start  = content.find(ann_marker)
    if ann_start >= 0:
        ann_end = find_closing_div_end(content, ann_start + len(ann_marker))
        if ann_end >= 0:
            content = content[:ann_start] + ANNOUNCEMENT_HTML + content[ann_end:]
            changes.append('announcement_html')

    # ------------------------------------------------------------------
    # 4. Replace desktop nav HTML
    # ------------------------------------------------------------------
    nav_marker = '<nav id="nav">'
    nav_start  = content.find(nav_marker)
    if nav_start >= 0:
        nav_end = content.find('</nav>', nav_start) + len('</nav>')
        content = content[:nav_start] + NAV_HTML + content[nav_end:]
        changes.append('nav_html')

    # ------------------------------------------------------------------
    # 5. Replace mobile menu HTML
    # ------------------------------------------------------------------
    mm_marker = '<div class="mobile-menu" id="mobileMenu">'
    mm_start  = content.find(mm_marker)
    if mm_start >= 0:
        mm_end = find_closing_div_end(content, mm_start + len(mm_marker))
        if mm_end >= 0:
            content = content[:mm_start] + MOBILE_MENU_HTML + content[mm_end:]
            changes.append('mobile_menu_html')

    # ------------------------------------------------------------------
    # 6. Replace footer HTML
    # ------------------------------------------------------------------
    footer_start = content.find('<footer>')
    if footer_start >= 0:
        footer_end = content.find('</footer>', footer_start) + len('</footer>')
        content = content[:footer_start] + FOOTER_HTML + content[footer_end:]
        changes.append('footer_html')

    # ------------------------------------------------------------------
    # 7. Handle JavaScript for pages without navbar.js
    # ------------------------------------------------------------------
    has_navbar_js = 'navbar.js' in content

    if not has_navbar_js:
        body_end = content.rfind('</body>')
        if body_end >= 0:
            inserts = []

            # Add announcement bar JS if correct storage key not already present
            if 'ambassadorAnnouncementClosedAt_v1' not in content:
                inserts.append(ANNOUNCEMENT_JS_BLOCK)

            # Add mobile accordion JS if not already present
            if ('mobile-dropdown-toggle' not in content or
                    "classList.toggle('open')" not in content):
                inserts.append(MOBILE_ACCORDION_JS_BLOCK)

            if inserts:
                js_text = '\n\n' + '\n\n'.join(inserts) + '\n\n'
                content = content[:body_end] + js_text + content[body_end:]
                changes.append('inline_js')

    return content, changes


# =============================================================================
# FIND AND PROCESS TARGET PAGES
# =============================================================================

SKIP_DIRS = {'.git', 'ai-ready', 'talent', 'scripts', 'css', 'js', 'data', 'docs', 'styles'}

target_pages = []
for root, dirs, files in os.walk('.'):
    dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
    for fname in sorted(files):
        if not fname.endswith('.html') or fname == 'index.html':
            continue
        filepath = os.path.join(root, fname)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                c = f.read()
            if 'id="mobileMenu"' in c:
                target_pages.append(filepath)
        except Exception as e:
            print(f'ERROR reading {filepath}: {e}', file=sys.stderr)

print(f'Found {len(target_pages)} target pages to update.\n')

updated = 0
errors  = 0

for filepath in target_pages:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()

        new_content, changes = update_page(filepath, original)

        if changes:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            rel = os.path.relpath(filepath)
            print(f'  OK  {rel:<55} [{", ".join(changes)}]')
            updated += 1
        else:
            rel = os.path.relpath(filepath)
            print(f'SKIP  {rel}')

    except Exception as e:
        import traceback
        rel = os.path.relpath(filepath)
        print(f' ERR  {rel}: {e}', file=sys.stderr)
        traceback.print_exc()
        errors += 1

print(f'\n{"="*60}')
print(f'Done: {updated} updated, {errors} errors out of {len(target_pages)} pages.')
