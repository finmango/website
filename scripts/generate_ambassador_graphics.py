"""
Generate 2026 FinMango Ambassador social graphics.

Outputs a 1080x1080 square and a 1080x1920 vertical for each ambassador
under /ambassador-graphics/2026/.

V4 design direction (the "keynote"):
- Bold, modern, simple — one idea per canvas. Pure white field, no
  frame, no band, no ornament. A large squircle-cropped photo floats
  on a soft shadow; beneath it the name, huge, in near-black; one
  orange line for the role; the city in gray; a small URL footer and
  the script logo as a letterhead. Everything centered, everything
  breathing.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path("/tmp/fonts")
OUT = ROOT / "ambassador-graphics" / "2026"
OUT.mkdir(parents=True, exist_ok=True)

# Brand tokens (lifted from the site)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
CREAM = (250, 247, 242)
ORANGE = (255, 107, 53)
GRAY = (107, 101, 96)
INK = (26, 26, 26)

AMBASSADORS = [
    {"slug": "david-johnson",       "name": "David Johnson",        "photo": "33.jpg", "city": "Smyrna, TN",       "country": "USA"},
    {"slug": "dylan-forman",        "name": "Dylan Forman",         "photo": "34.jpg", "city": "Columbus, OH",     "country": "USA"},
    {"slug": "pranita-jadhav",      "name": "Pranita Jadhav",       "photo": "35.jpg", "city": "Pune, India",      "country": "India"},
    {"slug": "hans-patel",          "name": "Hans Patel",           "photo": "36.jpg", "city": "River Edge, NJ",   "country": "USA"},
    {"slug": "onyemeri-ihegazie",   "name": "Onyemeri Ihegazie",    "photo": "37.jpg", "city": "Abia, Nigeria",    "country": "Nigeria"},
    {"slug": "harshil-shah",        "name": "Harshil Shah",         "photo": "38_Updated.jpg", "city": "Columbia, SC",     "country": "USA"},
    {"slug": "eduardo-charles-alba","name": "Eduardo Charles Alba", "photo": "39.jpg", "city": "Santo Domingo, DR","country": "Dominican Republic"},
    {"slug": "caleb-vales",         "name": "Caleb Vales",          "photo": "40.jpg", "city": "North Olmsted, OH","country": "USA"},
    {"slug": "aren-inan",           "name": "Aren Inan",            "photo": "41.jpg", "city": "Ridgefield, NJ",   "country": "USA"},
    {"slug": "hayley-foote",        "name": "Hayley Foote",         "photo": "42.jpg", "city": "Columbus, OH",     "country": "USA"},
    {"slug": "sophie-hong",         "name": "Sophie Hong",          "photo": "43.jpg", "city": "Concord, MA",      "country": "USA"},
    {"slug": "devin-acar",          "name": "Devin Acar",           "photo": "45.jpg", "city": "Montvale, NJ",     "country": "USA"},
]

ROLE_LABEL = "2026 FinMango Ambassador"
MISSION = "Advancing financial health."
URL = "finmango.org/ambassadors"


# ---------- font + geometry helpers ----------

def font(style: str, size: int) -> ImageFont.FreeTypeFont:
    files = {
        "serif":   "DMSerifDisplay-Regular.ttf",
        "regular": "DMSans-Regular.ttf",
        "medium":  "DMSans-Medium.ttf",
        "bold":    "DMSans-Bold.ttf",
    }
    return ImageFont.truetype(str(FONTS / files[style]), size)


def measure(f: ImageFont.FreeTypeFont, text: str):
    bbox = f.getbbox(text)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_tracked(draw: ImageDraw.ImageDraw, xy, text: str, f, fill, tracking: int = 2, anchor="la"):
    """Draw text with manual letter tracking. anchor supports 'la' and 'ma'."""
    widths = [f.getbbox(c)[2] - f.getbbox(c)[0] for c in text]
    total = sum(widths) + tracking * max(0, len(text) - 1)
    if anchor == "ma":
        x = xy[0] - total // 2
    else:
        x = xy[0]
    y = xy[1]
    for c, w in zip(text, widths):
        draw.text((x, y), c, font=f, fill=fill, anchor="la")
        x += w + tracking


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


def soft_shadow(circle_rgba: Image.Image, blur: int = 18, offset=(0, 10), alpha: int = 70) -> Image.Image:
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


# ---------- squiggle (from the site's SVG divider) ----------

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


def squiggle_points(width_px: int, height_px: int):
    """
    Recreate the site's squiggle path at a given pixel size:
      M2 6 C 12 2, 22 10, 32 6 S 52 2, 62 6 S 82 10, 92 6 S 108 2, 118 6
    viewBox is 120 wide / 12 tall.
    """
    # Original path in SVG units.
    segs = [
        ((2, 6),   (12, 2),   (22, 10),  (32, 6)),
        ((32, 6),  (42, 2),   (52, 2),   (62, 6)),   # S 52 2, 62 6
        ((62, 6),  (72, 10),  (82, 10),  (92, 6)),   # S 82 10, 92 6
        ((92, 6),  (102, 2),  (108, 2),  (118, 6)),  # S 108 2, 118 6
    ]
    sx = width_px / 120.0
    sy = height_px / 12.0
    all_pts = []
    for seg in segs:
        all_pts.extend(
            _cubic_points(
                (seg[0][0] * sx, seg[0][1] * sy),
                (seg[1][0] * sx, seg[1][1] * sy),
                (seg[2][0] * sx, seg[2][1] * sy),
                (seg[3][0] * sx, seg[3][1] * sy),
            )
        )
    return all_pts


def draw_squiggle(canvas: Image.Image, center_xy, width_px: int, height_px: int, stroke: int = 4, color=ORANGE):
    """Draw the brand squiggle centered at center_xy."""
    pts = squiggle_points(width_px, height_px)
    cx, cy = center_xy
    pts = [(cx - width_px / 2 + x, cy - height_px / 2 + y) for x, y in pts]
    d = ImageDraw.Draw(canvas)
    d.line(pts, fill=color, width=stroke, joint="curve")
    # Round end caps
    r = stroke / 2
    for end in (pts[0], pts[-1]):
        d.ellipse([end[0] - r, end[1] - r, end[0] + r, end[1] + r], fill=color)


# ---------- cohort mark ``'26`` ----------

def compose_year_mark(size_px: int, apostrophe_color=ORANGE, digit_color=BLACK):
    """Render ``'26`` (DM Sans Bold; apostrophe in orange) as an RGBA tile.

    Cropped tight to glyph bounds.
    """
    f = font("bold", size_px)
    # Use individual glyphs so we can color the apostrophe separately.
    apo = "\u2019"  # right single quote — matches the site's ``'26``
    digits = "26"
    # Measure widths.
    aw = f.getbbox(apo)[2] - f.getbbox(apo)[0]
    dw = f.getbbox(digits)[2] - f.getbbox(digits)[0]
    gap = int(size_px * 0.02)
    total_w = aw + gap + dw
    # Height: generous to avoid clipping
    bbox_full = f.getbbox(apo + digits)
    h = bbox_full[3] - bbox_full[1]
    pad = int(size_px * 0.2)
    tile = Image.new("RGBA", (total_w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    baseline = pad - bbox_full[1]
    d.text((pad, baseline), apo, font=f, fill=apostrophe_color, anchor="la")
    d.text((pad + aw + gap, baseline), digits, font=f, fill=digit_color, anchor="la")
    return tile


def tint_rgba(im: Image.Image, opacity: float) -> Image.Image:
    """Return a copy of `im` with alpha scaled by `opacity`."""
    im = im.convert("RGBA")
    r, g, b, a = im.split()
    a = a.point(lambda v: int(v * opacity))
    return Image.merge("RGBA", (r, g, b, a))


# ---------- layouts ----------

# Keynote palette: true white field, near-black ink, quiet grays.
PAPER = (255, 255, 255)
INK4 = (17, 17, 20)
GRAY4 = (110, 110, 115)
FAINT4 = (134, 134, 139)


def squircle_crop(im: Image.Image, size: int, radius: int) -> Image.Image:
    """Center-crop to a square and mask to a continuous rounded rect."""
    im = im.convert("RGB")
    src = min(im.size)
    left = (im.width - src) // 2
    top = (im.height - src) // 2
    im = im.crop((left, top, left + src, top + src)).resize((size, size), Image.LANCZOS)
    ss = 4
    mask = Image.new("L", (size * ss, size * ss), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size * ss - 1, size * ss - 1),
                                           radius=radius * ss, fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


def keynote_photo(base: Image.Image, photo: Image.Image, size: int, radius: int, cx: int, y: int):
    """Squircle photo floating on a soft, low shadow."""
    tile = squircle_crop(photo, size, radius)
    shadow = soft_shadow(tile, blur=38, offset=(0, 22), alpha=42)
    x = cx - size // 2
    base.alpha_composite(shadow, (x - 38 * 3, y - 38 * 3))
    base.alpha_composite(tile, (x, y))


def keynote_text(base: Image.Image, ambassador: dict, cx: int, name_y: int,
                 name_size: int, line_size: int, gap: int, max_w: int):
    """Name, then one line: orange role · gray city. Returns the baseline y."""
    draw = ImageDraw.Draw(base)
    name_f = font("bold", name_size)
    while measure(name_f, ambassador["name"])[0] > max_w and name_f.size > 44:
        name_f = font("bold", name_f.size - 4)
    draw.text((cx, name_y), ambassador["name"], font=name_f, fill=INK4, anchor="ma")
    _, name_h = measure(name_f, "Ag")

    line_y = name_y + name_h + gap
    role_f = font("medium", line_size)
    city_f = font("regular", line_size)
    sep = "   ·   "
    role_w = measure(role_f, ROLE_LABEL)[0]
    sep_w = measure(city_f, sep)[0]
    city_w = measure(city_f, ambassador["city"])[0]
    x = cx - (role_w + sep_w + city_w) // 2
    draw.text((x, line_y), ROLE_LABEL, font=role_f, fill=ORANGE, anchor="la")
    draw.text((x + role_w, line_y), sep, font=city_f, fill=FAINT4, anchor="la")
    draw.text((x + role_w + sep_w, line_y), ambassador["city"], font=city_f, fill=GRAY4, anchor="la")
    return line_y + measure(city_f, "Ag")[1]


def make_square(ambassador: dict, photo: Image.Image, logo: Image.Image) -> Image.Image:
    W, H = 1080, 1080
    base = Image.new("RGB", (W, H), PAPER).convert("RGBA")

    # Letterhead: small script logo, centered.
    lg = fit_logo(logo, 58)
    base.alpha_composite(lg.convert("RGBA"), ((W - lg.width) // 2, 46))

    keynote_photo(base, photo, size=600, radius=56, cx=W // 2, y=150)

    keynote_text(base, ambassador, cx=W // 2, name_y=822,
                 name_size=88, line_size=27, gap=34, max_w=W - 140)

    ImageDraw.Draw(base).text((W // 2, H - 58), URL,
                              font=font("regular", 21), fill=FAINT4, anchor="ma")
    return base.convert("RGB")


def make_vertical(ambassador: dict, photo: Image.Image, logo: Image.Image) -> Image.Image:
    W, H = 1080, 1920
    base = Image.new("RGB", (W, H), PAPER).convert("RGBA")

    lg = fit_logo(logo, 72)
    base.alpha_composite(lg.convert("RGBA"), ((W - lg.width) // 2, 88))

    keynote_photo(base, photo, size=790, radius=72, cx=W // 2, y=250)

    keynote_text(base, ambassador, cx=W // 2, name_y=1210,
                 name_size=112, line_size=33, gap=46, max_w=W - 160)

    ImageDraw.Draw(base).text((W // 2, H - 96), URL,
                              font=font("regular", 25), fill=FAINT4, anchor="ma")
    return base.convert("RGB")


# ---------- entry ----------

def generate(only_slug: str | None = None):
    logo = Image.open(ROOT / "finmango.png").convert("RGBA")
    for a in AMBASSADORS:
        if only_slug and a["slug"] != only_slug:
            continue
        photo_path = ROOT / a["photo"]
        if not photo_path.exists():
            print(f"  ! missing photo: {photo_path}")
            continue
        photo = Image.open(photo_path)

        sq = make_square(a, photo, logo)
        vt = make_vertical(a, photo, logo)

        sq.save(OUT / f"{a['slug']}-square.png", "PNG", optimize=True)
        vt.save(OUT / f"{a['slug']}-vertical.png", "PNG", optimize=True)
        print(f"  {a['slug']}: square + vertical")


if __name__ == "__main__":
    import sys
    slug = sys.argv[1] if len(sys.argv) > 1 else None
    generate(slug)
    print("Done.")
