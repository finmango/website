"""
Generate 2026 FinMango Ambassador social graphics.

Outputs a 1080x1080 square and a 1080x1920 vertical for each ambassador
under /ambassador-graphics/2026/.

V3 design direction (the "poster" refresh):
- Same family as V2 (cream field, thin black frame, DM Serif name,
  orange squiggle divider) but bolder: the circle headshot becomes a
  big square photo with an 8px black border and a hard, solid-orange
  offset shadow — the site's poster motif.
- A solid orange band anchors the bottom edge and carries the role
  label and URL in white, with the script logo top-left.
- Square and vertical share the system; the vertical gets a taller
  photo and more air.
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

def square_crop(im: Image.Image, size: int) -> Image.Image:
    """Center-crop to a square and resize."""
    im = im.convert("RGB")
    src = min(im.size)
    left = (im.width - src) // 2
    top = (im.height - src) // 2
    return im.crop((left, top, left + src, top + src)).resize((size, size), Image.LANCZOS)


def draw_photo_block(base: Image.Image, photo: Image.Image, size: int, x: int, y: int,
                     border: int, offset: int):
    """Square photo with a black border and a hard orange offset shadow."""
    d = ImageDraw.Draw(base)
    # Solid orange shadow, offset down-right, behind the framed photo.
    d.rectangle([x + offset, y + offset,
                 x + size + 2 * border + offset, y + size + 2 * border + offset], fill=ORANGE)
    d.rectangle([x, y, x + size + 2 * border, y + size + 2 * border], fill=BLACK)
    base.paste(square_crop(photo, size), (x + border, y + border))


def draw_band(base: Image.Image, top: int, pad_x: int, label_size: int, url_size: int):
    """Solid orange band along the bottom with the role label and URL."""
    W, H = base.size
    d = ImageDraw.Draw(base)
    d.rectangle([0, top, W, H], fill=ORANGE)
    d.rectangle([0, top, W, top + 3], fill=BLACK)
    mid = top + (H - top) // 2
    label_f = font("bold", label_size)
    lh = measure(label_f, "AG")[1]
    draw_tracked(d, (pad_x, mid - lh // 2 - 2), ROLE_LABEL.upper(), label_f, WHITE, tracking=3)
    url_f = font("medium", url_size)
    uw = url_f.getbbox(URL)[2] - url_f.getbbox(URL)[0]
    d.text((W - pad_x - uw, mid), URL, font=url_f, fill=WHITE, anchor="lm")


def make_square(ambassador: dict, photo: Image.Image, logo: Image.Image) -> Image.Image:
    W, H = 1080, 1080
    base = Image.new("RGB", (W, H), CREAM).convert("RGBA")
    draw = ImageDraw.Draw(base)

    band_h = 108
    border = 3
    draw.rectangle([border // 2, border // 2, W - border // 2 - 1, H - border // 2 - 1],
                   outline=BLACK, width=border)

    # ------ header: script logo left, country right
    lg = fit_logo(logo, 46)
    base.alpha_composite(lg.convert("RGBA"), (72, 58))
    draw = ImageDraw.Draw(base)
    country_f = font("medium", 20)
    ct = ambassador["country"].upper()
    ctw = sum(country_f.getbbox(c)[2] - country_f.getbbox(c)[0] for c in ct) + \
          3 * max(0, len(ct) - 1)
    draw_tracked(draw, (W - 72 - ctw, 72), ct, country_f, GRAY, tracking=3)

    # ------ photo block
    psize, pborder, poffset = 560, 8, 26
    block = psize + 2 * pborder
    px = (W - block - poffset) // 2
    py = 158
    draw_photo_block(base, photo, psize, px, py, pborder, poffset)
    draw = ImageDraw.Draw(base)

    # ------ name / squiggle / city
    name_y = py + block + poffset + 44
    name_f = font("serif", 82)
    while measure(name_f, ambassador["name"])[0] > W - 160 and name_f.size > 48:
        name_f = font("serif", name_f.size - 4)
    draw.text((W // 2, name_y), ambassador["name"], font=name_f, fill=BLACK, anchor="ma")

    _, name_h = measure(name_f, "Ag")
    squiggle_cy = name_y + name_h + 30
    draw_squiggle(base, (W // 2, squiggle_cy), width_px=130, height_px=14, stroke=4)

    city_f = font("medium", 26)
    draw.text((W // 2, squiggle_cy + 22), ambassador["city"], font=city_f, fill=GRAY, anchor="ma")

    # ------ orange band
    draw_band(base, H - band_h, pad_x=72, label_size=24, url_size=20)

    return base.convert("RGB")


def make_vertical(ambassador: dict, photo: Image.Image, logo: Image.Image) -> Image.Image:
    W, H = 1080, 1920
    base = Image.new("RGB", (W, H), CREAM).convert("RGBA")
    draw = ImageDraw.Draw(base)

    band_h = 140
    border = 3
    draw.rectangle([border // 2, border // 2, W - border // 2 - 1, H - border // 2 - 1],
                   outline=BLACK, width=border)

    # ------ header
    lg = fit_logo(logo, 56)
    base.alpha_composite(lg.convert("RGBA"), (96, 108))
    draw = ImageDraw.Draw(base)
    country_f = font("medium", 22)
    ct = ambassador["country"].upper()
    ctw = sum(country_f.getbbox(c)[2] - country_f.getbbox(c)[0] for c in ct) + \
          3 * max(0, len(ct) - 1)
    draw_tracked(draw, (W - 96 - ctw, 126), ct, country_f, GRAY, tracking=3)

    # ------ photo block
    psize, pborder, poffset = 760, 9, 32
    block = psize + 2 * pborder
    px = (W - block - poffset) // 2
    py = 360
    draw_photo_block(base, photo, psize, px, py, pborder, poffset)
    draw = ImageDraw.Draw(base)

    # ------ name / squiggle / city — centered in the gap to the band
    name_y = py + block + poffset + 170
    name_f = font("serif", 106)
    while measure(name_f, ambassador["name"])[0] > W - 180 and name_f.size > 56:
        name_f = font("serif", name_f.size - 4)
    draw.text((W // 2, name_y), ambassador["name"], font=name_f, fill=BLACK, anchor="ma")

    _, name_h = measure(name_f, "Ag")
    squiggle_cy = name_y + name_h + 48
    draw_squiggle(base, (W // 2, squiggle_cy), width_px=170, height_px=18, stroke=5)

    city_f = font("medium", 32)
    draw.text((W // 2, squiggle_cy + 34), ambassador["city"], font=city_f, fill=GRAY, anchor="ma")

    # ------ orange band
    draw_band(base, H - band_h, pad_x=96, label_size=28, url_size=24)

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
