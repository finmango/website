"""
Generate 2026 FinMango Ambassador QUOTE cards.

A second graphic per ambassador that pairs a portrait with a real pull-quote
from their own bio. Distinct layout from the existing announcement cards in
``generate_ambassador_graphics.py``:

  - Quote-forward composition: big DM Serif Display pull-quote anchored to a
    large orange opening quotation mark.
  - Smaller circular portrait offset to the bottom-right (square) or bottom
    (vertical), so the words lead the eye.
  - Same brand tokens, eyebrow rule, squiggle, and footer system, so the two
    cards read as a set.
  - Alternates portrait side (left/right) by index so a feed of all 11 has
    rhythm instead of feeling identical.

Outputs to /ambassador-graphics/2026/<slug>-quote-square.png (+ vertical).
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path("/tmp/fonts")
OUT = ROOT / "ambassador-graphics" / "2026"
OUT.mkdir(parents=True, exist_ok=True)

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
CREAM = (250, 247, 242)
ORANGE = (255, 107, 53)
GRAY = (107, 101, 96)
INK = (26, 26, 26)

ROLE_LABEL = "2026 FinMango Ambassador"
MISSION = "Advancing financial health."
URL = "finmango.org/ambassadors"

AMBASSADORS = [
    {
        "slug": "david-johnson", "name": "David Johnson", "photo": "33.jpg",
        "city": "Smyrna, TN", "country": "USA",
        "quote": "A passion of mine is connecting the fight for financial freedom to the fight for true equality.",
    },
    {
        "slug": "dylan-forman", "name": "Dylan Forman", "photo": "34.jpg",
        "city": "Columbus, OH", "country": "USA",
        "quote": "Financial health is an avenue toward stronger community.",
    },
    {
        "slug": "pranita-jadhav", "name": "Pranita Jadhav", "photo": "35.jpg",
        "city": "Pune, India", "country": "India",
        "quote": "Many people struggle not because they lack income, but because they lack structured financial knowledge.",
    },
    {
        "slug": "hans-patel", "name": "Hans Patel", "photo": "36.jpg",
        "city": "River Edge, NJ", "country": "USA",
        "quote": "Education alone cannot overcome structural exploitation.",
    },
    {
        "slug": "onyemeri-ihegazie", "name": "Onyemeri Ihegazie", "photo": "37.jpg",
        "city": "Abia, Nigeria", "country": "Nigeria",
        "quote": "I want young people to stop feeling ashamed of not knowing, and start feeling empowered to learn.",
    },
    {
        "slug": "harshil-shah", "name": "Harshil Shah", "photo": "38_Updated.jpg",
        "city": "Columbia, SC", "country": "USA",
        "quote": "I helped build the Carolina Wealth Initiative because I wanted to promote change in any way possible.",
    },
    {
        "slug": "eduardo-charles-alba", "name": "Eduardo Charles Alba", "photo": "39.jpg",
        "city": "Santo Domingo, DR", "country": "Dominican Republic",
        "quote": "Access and education on their own don't guarantee better outcomes.",
    },
    {
        "slug": "caleb-vales", "name": "Caleb Vales", "photo": "40.jpg",
        "city": "North Olmsted, OH", "country": "USA",
        "quote": "Financial literacy should be treated like a core class, the same way we treat STEM and English.",
    },
    {
        "slug": "aren-inan", "name": "Aren Inan", "photo": "41.jpg",
        "city": "Ridgefield, NJ", "country": "USA",
        "quote": "Financial education by itself is not enough to help people.",
    },
    {
        "slug": "hayley-foote", "name": "Hayley Foote", "photo": "42.jpg",
        "city": "Columbus, OH", "country": "USA",
        "quote": "I want others to be able to say yes to the opportunities that come into their lives.",
    },
    {
        "slug": "sophie-hong", "name": "Sophie Hong", "photo": "43.jpg",
        "city": "Concord, MA", "country": "USA",
        "quote": "Kids from families like mine don't get exposed to financial knowledge until it's too late.",
    },
]


# ---------- font + geometry helpers ----------

def font(style: str, size: int) -> ImageFont.FreeTypeFont:
    files = {
        "serif":        "DMSerifDisplay-Regular.ttf",
        "serif_italic": "DMSerifDisplay-Italic.ttf",
        "regular":      "DMSans-Regular.ttf",
        "medium":       "DMSans-Medium.ttf",
        "bold":         "DMSans-Bold.ttf",
    }
    return ImageFont.truetype(str(FONTS / files[style]), size)


def measure(f: ImageFont.FreeTypeFont, text: str):
    bbox = f.getbbox(text)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_tracked(draw, xy, text, f, fill, tracking=2, anchor="la"):
    widths = [f.getbbox(c)[2] - f.getbbox(c)[0] for c in text]
    total = sum(widths) + tracking * max(0, len(text) - 1)
    x = xy[0] - total // 2 if anchor == "ma" else xy[0]
    y = xy[1]
    for c, w in zip(text, widths):
        draw.text((x, y), c, font=f, fill=fill, anchor="la")
        x += w + tracking


def wrap_to_width(text: str, f: ImageFont.FreeTypeFont, max_w: int):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = w if not cur else cur + " " + w
        if f.getbbox(trial)[2] - f.getbbox(trial)[0] <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_quote(text: str, max_w: int, max_h: int, max_lines: int,
              start_size: int, min_size: int, style="serif"):
    """Pick the largest serif size where the wrapped quote fits both
    the width budget and the line/height budget."""
    size = start_size
    while size >= min_size:
        f = font(style, size)
        lines = wrap_to_width(text, f, max_w)
        line_h = int(size * 1.12)
        if len(lines) <= max_lines and line_h * len(lines) <= max_h:
            return f, lines, line_h
        size -= 2
    f = font(style, min_size)
    return f, wrap_to_width(text, f, max_w), int(min_size * 1.12)


# ---------- image helpers ----------

def circle_crop(im: Image.Image, size: int) -> Image.Image:
    im = im.convert("RGB")
    src = min(im.size)
    left = (im.width - src) // 2
    top = (im.height - src) // 2
    im = im.crop((left, top, left + src, top + src)).resize((size, size), Image.LANCZOS)
    ss = 4
    mask = Image.new("L", (size * ss, size * ss), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * ss, size * ss), fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


def soft_shadow(circle_rgba: Image.Image, blur=18, offset=(0, 10), alpha=70):
    w, h = circle_rgba.size
    pad = blur * 3
    shadow = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    shadow_mask = Image.new("L", shadow.size, 0)
    shadow_mask.paste(circle_rgba.split()[3], (pad + offset[0], pad + offset[1]))
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(blur))
    black_fill = Image.new("RGBA", shadow.size, (0, 0, 0, alpha))
    shadow.paste(black_fill, (0, 0), shadow_mask)
    return shadow


def fit_logo(logo: Image.Image, target_height: int) -> Image.Image:
    ratio = target_height / logo.height
    return logo.resize((int(logo.width * ratio), target_height), Image.LANCZOS)


def tint_rgba(im: Image.Image, opacity: float) -> Image.Image:
    im = im.convert("RGBA")
    r, g, b, a = im.split()
    a = a.point(lambda v: int(v * opacity))
    return Image.merge("RGBA", (r, g, b, a))


# ---------- squiggle ----------

def _cubic_points(p0, p1, p2, p3, steps=48):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        mt = 1 - t
        pts.append((
            mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0],
            mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1],
        ))
    return pts


def squiggle_points(width_px, height_px):
    segs = [
        ((2, 6),   (12, 2),   (22, 10),  (32, 6)),
        ((32, 6),  (42, 2),   (52, 2),   (62, 6)),
        ((62, 6),  (72, 10),  (82, 10),  (92, 6)),
        ((92, 6),  (102, 2),  (108, 2),  (118, 6)),
    ]
    sx = width_px / 120.0
    sy = height_px / 12.0
    pts = []
    for seg in segs:
        pts.extend(_cubic_points(
            (seg[0][0] * sx, seg[0][1] * sy),
            (seg[1][0] * sx, seg[1][1] * sy),
            (seg[2][0] * sx, seg[2][1] * sy),
            (seg[3][0] * sx, seg[3][1] * sy),
        ))
    return pts


def draw_squiggle(canvas, center_xy, width_px, height_px, stroke=4, color=ORANGE):
    pts = squiggle_points(width_px, height_px)
    cx, cy = center_xy
    pts = [(cx - width_px / 2 + x, cy - height_px / 2 + y) for x, y in pts]
    d = ImageDraw.Draw(canvas)
    d.line(pts, fill=color, width=stroke, joint="curve")
    r = stroke / 2
    for end in (pts[0], pts[-1]):
        d.ellipse([end[0] - r, end[1] - r, end[0] + r, end[1] + r], fill=color)


# ---------- cohort mark ``'26`` background ----------

def compose_year_mark(size_px, apostrophe_color=ORANGE, digit_color=BLACK):
    f = font("bold", size_px)
    apo = "’"
    digits = "26"
    aw = f.getbbox(apo)[2] - f.getbbox(apo)[0]
    dw = f.getbbox(digits)[2] - f.getbbox(digits)[0]
    gap = int(size_px * 0.02)
    total_w = aw + gap + dw
    bbox_full = f.getbbox(apo + digits)
    h = bbox_full[3] - bbox_full[1]
    pad = int(size_px * 0.2)
    tile = Image.new("RGBA", (total_w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    baseline = pad - bbox_full[1]
    d.text((pad, baseline), apo, font=f, fill=apostrophe_color, anchor="la")
    d.text((pad + aw + gap, baseline), digits, font=f, fill=digit_color, anchor="la")
    return tile


# ---------- layouts ----------

def draw_eyebrow_and_country(draw, ambassador, W, eyebrow_y, side_margin):
    rule_len = 44 if W <= 1200 else 60
    rule_x = side_margin
    draw.rectangle([rule_x, eyebrow_y + 11, rule_x + rule_len, eyebrow_y + 14], fill=ORANGE)
    role_f = font("bold", 22 if W <= 1200 else 24)
    draw_tracked(draw, (rule_x + rule_len + 20, eyebrow_y - 2),
                 ROLE_LABEL.upper(), role_f, BLACK, tracking=3)

    country_f = font("medium", 20 if W <= 1200 else 22)
    ct = ambassador["country"].upper()
    ctw = sum(country_f.getbbox(c)[2] - country_f.getbbox(c)[0] for c in ct) + \
          3 * max(0, len(ct) - 1)
    draw_tracked(draw, (W - side_margin - ctw, eyebrow_y - 2),
                 ct, country_f, GRAY, tracking=3)


def draw_footer(base, draw, W, H, side_margin, logo, font_scale=1.0):
    mission_f = font("regular", int(22 * font_scale))
    draw.text((side_margin, H - int(66 * font_scale)),
              MISSION, font=mission_f, fill=INK, anchor="la")

    lg = fit_logo(logo, int(40 * font_scale))
    logo_y = H - int(88 * font_scale)
    logo_x = W - lg.width - side_margin
    base.alpha_composite(lg.convert("RGBA"), (logo_x, logo_y))

    url_f = font("medium", int(20 * font_scale))
    url_w = url_f.getbbox(URL)[2] - url_f.getbbox(URL)[0]
    ImageDraw.Draw(base).text((W - side_margin - url_w, logo_y + lg.height + 8),
                              URL, font=url_f, fill=INK, anchor="la")


def make_square(ambassador, photo, logo, photo_side="right"):
    W, H = 1080, 1080
    SIDE = 72
    base = Image.new("RGB", (W, H), CREAM).convert("RGBA")

    # background '26 — opposite the photo for visual balance
    mark = compose_year_mark(size_px=560)
    mark = tint_rgba(mark, 0.06)
    if photo_side == "right":
        # photo lives bottom-right, so put '26 top-left, bleeding off
        mx, my = -120, -80
    else:
        mx, my = W - mark.width + 60, -60
    base.alpha_composite(mark, (mx, my))

    draw = ImageDraw.Draw(base)

    border = 3
    draw.rectangle([border // 2, border // 2, W - border // 2 - 1, H - border // 2 - 1],
                   outline=BLACK, width=border)

    # eyebrow + country
    eyebrow_y = 88
    draw_eyebrow_and_country(draw, ambassador, W, eyebrow_y, SIDE)

    # ---- portrait disc (offset to one side, ~bottom)
    disc = 360
    disc_img = circle_crop(photo, disc)
    if photo_side == "right":
        disc_x = W - SIDE - disc
    else:
        disc_x = SIDE
    disc_y = H - 260 - disc  # leaves space for name + footer

    shadow = soft_shadow(disc_img, blur=20, offset=(0, 12), alpha=55)
    base.alpha_composite(shadow, (disc_x - 60, disc_y - 60))
    base.alpha_composite(disc_img, (disc_x, disc_y))
    ImageDraw.Draw(base).ellipse(
        [disc_x, disc_y, disc_x + disc, disc_y + disc], outline=BLACK, width=2
    )
    draw = ImageDraw.Draw(base)

    # ---- big opening quote glyph in orange (decorative)
    quote_glyph_f = font("serif", 240)
    if photo_side == "right":
        glyph_x = SIDE - 8
    else:
        glyph_x = SIDE - 8 + 0  # symmetrical position on right? keep at left margin still
    # always anchor glyph to the QUOTE side (opposite the photo)
    if photo_side == "right":
        glyph_anchor_x = SIDE - 4
    else:
        glyph_anchor_x = W - SIDE - 4
    # render to a temp tile so we can right-align if needed
    g_tile = Image.new("RGBA", (260, 280), (0, 0, 0, 0))
    ImageDraw.Draw(g_tile).text((0, -70), "“", font=quote_glyph_f, fill=ORANGE, anchor="la")
    if photo_side == "right":
        base.alpha_composite(g_tile, (SIDE - 14, 150))
    else:
        # flip horizontally so the curl reads right-to-left at the right side
        base.alpha_composite(g_tile, (W - SIDE - g_tile.width + 14, 150))
    draw = ImageDraw.Draw(base)

    # ---- quote text block
    quote_top = 220
    quote_bottom = disc_y + 40  # quote can slightly overlap the area above disc
    quote_h = quote_bottom - quote_top
    if photo_side == "right":
        quote_left = SIDE
        quote_right = disc_x - 40
    else:
        quote_left = disc_x + disc + 40
        quote_right = W - SIDE
    max_w = quote_right - quote_left

    qf, lines, line_h = fit_quote(
        ambassador["quote"], max_w=max_w, max_h=quote_h,
        max_lines=6, start_size=66, min_size=40, style="serif",
    )

    total_h = line_h * len(lines)
    qy = quote_top + (quote_h - total_h) // 2
    for ln in lines:
        # left-align on left side, right-align on right side for typographic interest
        if photo_side == "right":
            draw.text((quote_left, qy), ln, font=qf, fill=INK, anchor="la")
        else:
            draw.text((quote_right, qy), ln, font=qf, fill=INK, anchor="ra")
        qy += line_h

    # ---- attribution block (under quote, opposite the portrait)
    # name + city under disc instead, matching announcement card pattern.
    name_f = font("serif", 44)
    while measure(name_f, ambassador["name"])[0] > disc and name_f.size > 32:
        name_f = font("serif", name_f.size - 2)
    name_cx = disc_x + disc // 2
    name_y = disc_y + disc + 22
    draw.text((name_cx, name_y), ambassador["name"], font=name_f, fill=BLACK, anchor="ma")

    # squiggle under name
    _, name_h = measure(name_f, "Ag")
    sq_cy = name_y + name_h + 18
    draw_squiggle(base, (name_cx, sq_cy), width_px=90, height_px=10, stroke=3)

    city_f = font("medium", 20)
    ImageDraw.Draw(base).text((name_cx, sq_cy + 14),
                              ambassador["city"], font=city_f, fill=GRAY, anchor="ma")

    # footer
    draw_footer(base, ImageDraw.Draw(base), W, H, SIDE, logo, font_scale=1.0)

    return base.convert("RGB")


def make_vertical(ambassador, photo, logo):
    W, H = 1080, 1920
    SIDE = 96
    base = Image.new("RGB", (W, H), CREAM).convert("RGBA")

    mark = compose_year_mark(size_px=720)
    mark = tint_rgba(mark, 0.05)
    base.alpha_composite(mark, (-160, -90))

    draw = ImageDraw.Draw(base)

    border = 3
    draw.rectangle([border // 2, border // 2, W - border // 2 - 1, H - border // 2 - 1],
                   outline=BLACK, width=border)

    eyebrow_y = 150
    draw_eyebrow_and_country(draw, ambassador, W, eyebrow_y, SIDE)

    # ---- opening quote glyph
    quote_glyph_f = font("serif", 340)
    g_tile = Image.new("RGBA", (360, 380), (0, 0, 0, 0))
    ImageDraw.Draw(g_tile).text((0, -100), "“", font=quote_glyph_f, fill=ORANGE, anchor="la")
    base.alpha_composite(g_tile, (SIDE - 18, 240))

    # ---- quote block (top portion)
    quote_top = 350
    quote_bottom = 1060
    qf, lines, line_h = fit_quote(
        ambassador["quote"], max_w=W - SIDE * 2, max_h=quote_bottom - quote_top,
        max_lines=8, start_size=96, min_size=56, style="serif",
    )
    qy = quote_top
    for ln in lines:
        ImageDraw.Draw(base).text((SIDE, qy), ln, font=qf, fill=INK, anchor="la")
        qy += line_h

    # ---- portrait disc (centered, lower)
    disc = 440
    disc_img = circle_crop(photo, disc)
    disc_x = (W - disc) // 2
    disc_y = 1120
    shadow = soft_shadow(disc_img, blur=24, offset=(0, 16), alpha=55)
    base.alpha_composite(shadow, (disc_x - 70, disc_y - 70))
    base.alpha_composite(disc_img, (disc_x, disc_y))
    ImageDraw.Draw(base).ellipse(
        [disc_x, disc_y, disc_x + disc, disc_y + disc], outline=BLACK, width=2
    )
    draw = ImageDraw.Draw(base)

    # ---- name + squiggle + city
    name_y = disc_y + disc + 50
    name_f = font("serif", 72)
    while measure(name_f, ambassador["name"])[0] > W - SIDE * 2 and name_f.size > 48:
        name_f = font("serif", name_f.size - 2)
    draw.text((W // 2, name_y), ambassador["name"], font=name_f, fill=BLACK, anchor="ma")

    _, name_h = measure(name_f, "Ag")
    sq_cy = name_y + name_h + 36
    draw_squiggle(base, (W // 2, sq_cy), width_px=140, height_px=14, stroke=4)

    city_f = font("medium", 28)
    ImageDraw.Draw(base).text((W // 2, sq_cy + 24),
                              ambassador["city"], font=city_f, fill=GRAY, anchor="ma")

    # footer
    draw_footer(base, ImageDraw.Draw(base), W, H, SIDE, logo, font_scale=1.25)

    return base.convert("RGB")


# ---------- entry ----------

def generate(only_slug=None):
    logo = Image.open(ROOT / "finmango.png").convert("RGBA")
    for i, a in enumerate(AMBASSADORS):
        if only_slug and a["slug"] != only_slug:
            continue
        photo_path = ROOT / a["photo"]
        if not photo_path.exists():
            print(f"  ! missing photo: {photo_path}")
            continue
        photo = Image.open(photo_path)
        photo_side = "right" if i % 2 == 0 else "left"

        sq = make_square(a, photo, logo, photo_side=photo_side)
        vt = make_vertical(a, photo, logo)
        sq.save(OUT / f"{a['slug']}-quote-square.png", "PNG", optimize=True)
        vt.save(OUT / f"{a['slug']}-quote-vertical.png", "PNG", optimize=True)
        print(f"  {a['slug']}: quote square + vertical ({photo_side})")


if __name__ == "__main__":
    import sys
    slug = sys.argv[1] if len(sys.argv) > 1 else None
    generate(slug)
    print("Done.")
