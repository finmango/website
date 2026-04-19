"""
Generate 2026 FinMango Ambassador social graphics.

Outputs a 1080x1080 square and a 1080x1920 vertical for each ambassador
under /ambassador-graphics/2026/.

Design: refined brutalism — DM Serif Display for the name, DM Sans for
supporting copy, warm off-white background with a thin black border and
a single soft drop shadow on the headshot disc. Orange is a single
accent line; the logo lives quietly in the bottom corner.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path("/tmp/fonts")
OUT = ROOT / "ambassador-graphics" / "2026"
OUT.mkdir(parents=True, exist_ok=True)

# Brand tokens (lifted from the site)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
CREAM = (250, 247, 242)        # warm off-white background
ORANGE = (255, 107, 53)        # --orange
GRAY = (107, 101, 96)          # --gray
INK = (26, 26, 26)             # soft black for body copy

# Ambassadors (pulled from ambassadors.html + each profile page)
AMBASSADORS = [
    {"slug": "david-johnson",       "name": "David Johnson",        "photo": "33.jpg", "city": "Smyrna, TN"},
    {"slug": "dylan-forman",        "name": "Dylan Forman",         "photo": "34.jpg", "city": "Columbus, OH"},
    {"slug": "pranita-jadhav",      "name": "Pranita Jadhav",       "photo": "35.jpg", "city": "Pune, India"},
    {"slug": "hans-patel",          "name": "Hans Patel",           "photo": "36.jpg", "city": "River Edge, NJ"},
    {"slug": "onyemeri-ihegazie",   "name": "Onyemeri Ihegazie",    "photo": "37.jpg", "city": "Abia, Nigeria"},
    {"slug": "harshil-shah",        "name": "Harshil Shah",         "photo": "38.jpg", "city": "Columbia, SC"},
    {"slug": "eduardo-charles-alba","name": "Eduardo Charles Alba", "photo": "39.jpg", "city": "Santo Domingo, DR"},
    {"slug": "caleb-vales",         "name": "Caleb Vales",          "photo": "40.jpg", "city": "North Olmsted, OH"},
    {"slug": "aren-inan",           "name": "Aren Inan",            "photo": "41.jpg", "city": "Ridgefield, NJ"},
    {"slug": "hayley-foote",        "name": "Hayley Foote",         "photo": "42.jpg", "city": "Columbus, OH"},
    {"slug": "sophie-hong",         "name": "Sophie Hong",          "photo": "43.jpg", "city": "Concord, MA"},
]

ROLE_LABEL = "2026 FinMango Ambassador"
MISSION = "Advancing financial health."


def font(style: str, size: int) -> ImageFont.FreeTypeFont:
    files = {
        "serif":   "DMSerifDisplay-Regular.ttf",
        "regular": "DMSans-Regular.ttf",
        "medium":  "DMSans-Medium.ttf",
        "bold":    "DMSans-Bold.ttf",
    }
    return ImageFont.truetype(str(FONTS / files[style]), size)


def circle_crop(im: Image.Image, size: int) -> Image.Image:
    """Crop `im` to a square-centered circle of diameter `size`, with AA."""
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


def soft_shadow(circle_rgba: Image.Image, blur: int = 18, offset: tuple = (0, 10), alpha: int = 70) -> Image.Image:
    """Build a soft shadow layer matching `circle_rgba`'s alpha mask."""
    w, h = circle_rgba.size
    pad = blur * 3
    shadow = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    mask = circle_rgba.split()[3]
    shadow_mask = Image.new("L", shadow.size, 0)
    shadow_mask.paste(mask, (pad + offset[0], pad + offset[1]))
    shadow_mask = shadow_mask.filter(ImageFilter.GaussianBlur(blur))
    black_fill = Image.new("RGBA", shadow.size, (0, 0, 0, alpha))
    shadow.paste(black_fill, (0, 0), shadow_mask)
    return shadow


def draw_text(draw: ImageDraw.ImageDraw, xy, text, f, fill, anchor="la"):
    draw.text(xy, text, font=f, fill=fill, anchor=anchor)


def measure(f: ImageFont.FreeTypeFont, text: str):
    bbox = f.getbbox(text)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def fit_logo(logo: Image.Image, target_height: int) -> Image.Image:
    ratio = target_height / logo.height
    return logo.resize((int(logo.width * ratio), target_height), Image.LANCZOS)


def make_square(ambassador: dict, photo: Image.Image, logo: Image.Image) -> Image.Image:
    W, H = 1080, 1080
    canvas = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(canvas)

    # Thin outer border — refined brutalism
    border = 3
    draw.rectangle([border // 2, border // 2, W - border // 2 - 1, H - border // 2 - 1],
                   outline=BLACK, width=border)

    # Eyebrow: role label with a short orange rule to its left
    eyebrow_y = 92
    rule_x = 72
    rule_len = 40
    draw.rectangle([rule_x, eyebrow_y + 11, rule_x + rule_len, eyebrow_y + 14], fill=ORANGE)
    role_f = font("bold", 22)
    draw_text(draw, (rule_x + rule_len + 18, eyebrow_y - 2),
              ROLE_LABEL.upper(), role_f, BLACK, anchor="la")
    # letter-spacing emulation via wider tracking — just draw it, DM Sans Bold reads cleanly
    # quick tracking: re-draw with spaces between chars at the end of the role label
    # (skipped — the font weight carries it)

    # Headshot — circle crop, ~640px, centered horizontally, upper-middle
    disc = 640
    disc_img = circle_crop(photo, disc)
    disc_x = (W - disc) // 2
    disc_y = 180

    # Soft shadow
    shadow = soft_shadow(disc_img, blur=22, offset=(0, 14), alpha=55)
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba.alpha_composite(shadow, (disc_x - 22 * 3, disc_y - 22 * 3))
    canvas_rgba.alpha_composite(disc_img, (disc_x, disc_y))

    # Thin ring around the disc for definition
    ring = ImageDraw.Draw(canvas_rgba)
    ring.ellipse([disc_x, disc_y, disc_x + disc, disc_y + disc], outline=BLACK, width=2)

    canvas = canvas_rgba.convert("RGB")
    draw = ImageDraw.Draw(canvas)

    # Name — DM Serif Display, large, centered below disc
    name_y = disc_y + disc + 56
    name_f = font("serif", 78)
    # auto-scale down if too wide
    while measure(name_f, ambassador["name"])[0] > W - 160 and name_f.size > 48:
        name_f = font("serif", name_f.size - 4)
    draw_text(draw, (W // 2, name_y), ambassador["name"], name_f, BLACK, anchor="ma")

    # City — DM Sans Medium, gray, centered
    city_f = font("medium", 28)
    city_y = name_y + 94
    draw_text(draw, (W // 2, city_y), ambassador["city"], city_f, GRAY, anchor="ma")

    # Mission tagline — bottom-left, quiet
    mission_f = font("regular", 22)
    draw_text(draw, (72, H - 66), MISSION, mission_f, INK, anchor="la")

    # Logo — bottom-right, subtle
    lg = fit_logo(logo, 44)
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba.alpha_composite(lg.convert("RGBA"), (W - lg.width - 72, H - 56 - lg.height // 2))
    return canvas_rgba.convert("RGB")


def make_vertical(ambassador: dict, photo: Image.Image, logo: Image.Image) -> Image.Image:
    W, H = 1080, 1920
    canvas = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(canvas)

    # Thin outer border
    border = 3
    draw.rectangle([border // 2, border // 2, W - border // 2 - 1, H - border // 2 - 1],
                   outline=BLACK, width=border)

    # Top eyebrow: short orange rule + role label
    eyebrow_y = 160
    rule_x = 96
    rule_len = 56
    draw.rectangle([rule_x, eyebrow_y + 13, rule_x + rule_len, eyebrow_y + 16], fill=ORANGE)
    role_f = font("bold", 24)
    draw_text(draw, (rule_x + rule_len + 22, eyebrow_y - 2),
              ROLE_LABEL.upper(), role_f, BLACK, anchor="la")

    # Headshot — larger on vertical, more breathing room
    disc = 720
    disc_img = circle_crop(photo, disc)
    disc_x = (W - disc) // 2
    disc_y = 320

    shadow = soft_shadow(disc_img, blur=28, offset=(0, 18), alpha=55)
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba.alpha_composite(shadow, (disc_x - 28 * 3, disc_y - 28 * 3))
    canvas_rgba.alpha_composite(disc_img, (disc_x, disc_y))

    ImageDraw.Draw(canvas_rgba).ellipse(
        [disc_x, disc_y, disc_x + disc, disc_y + disc], outline=BLACK, width=2
    )
    canvas = canvas_rgba.convert("RGB")
    draw = ImageDraw.Draw(canvas)

    # Name — bigger, centered, with more vertical space
    name_y = disc_y + disc + 120
    name_f = font("serif", 108)
    while measure(name_f, ambassador["name"])[0] > W - 180 and name_f.size > 56:
        name_f = font("serif", name_f.size - 4)
    draw_text(draw, (W // 2, name_y), ambassador["name"], name_f, BLACK, anchor="ma")

    # Thin underline — 40px orange rule under the name
    name_w = measure(name_f, ambassador["name"])[0]
    _, name_h = measure(name_f, "Ag")
    underline_y = name_y + name_h + 36
    draw.rectangle([W // 2 - 24, underline_y, W // 2 + 24, underline_y + 3], fill=ORANGE)

    # City — DM Sans Medium, below underline
    city_f = font("medium", 34)
    city_y = underline_y + 34
    draw_text(draw, (W // 2, city_y), ambassador["city"], city_f, GRAY, anchor="ma")

    # Mission tagline — bottom-left
    mission_f = font("regular", 26)
    draw_text(draw, (96, H - 96), MISSION, mission_f, INK, anchor="la")

    # Logo — bottom-right, subtle
    lg = fit_logo(logo, 54)
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba.alpha_composite(lg.convert("RGBA"), (W - lg.width - 96, H - 86 - lg.height // 2))
    return canvas_rgba.convert("RGB")


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

        sq_path = OUT / f"{a['slug']}-square.png"
        vt_path = OUT / f"{a['slug']}-vertical.png"
        sq.save(sq_path, "PNG", optimize=True)
        vt.save(vt_path, "PNG", optimize=True)
        print(f"  {a['slug']}: {sq_path.name}, {vt_path.name}")


if __name__ == "__main__":
    import sys
    slug = sys.argv[1] if len(sys.argv) > 1 else None
    generate(slug)
    print("Done.")
