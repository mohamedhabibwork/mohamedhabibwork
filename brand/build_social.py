"""Build the MH social & multi-use kit: platform covers, profile icons, posts, stories,
email signature, business cards, video-call background, OG/GitHub previews.

Reuses the traced mark and outlined Barlow from build_logo.py, so every file is pure vector
(text outlined, no fonts needed). Outputs per format: SVG, PNG (exact platform pixels), PDF;
plus brand/social/MH-Social-Kit.ai (one artboard per format) and brand/MH-Brand-Kit.ai
(logo variants + social, all artboards). Run: python3 build_social.py
"""
from fontTools.ttLib import TTFont

import build_logo as L

OUT = L.ROOT / "social"
LIME, INK, BONE, WHITE = L.LIME, L.INK, L.BONE, L.WHITE
LIME_SOFT = "#232c10"  # accent-soft (dark): the oversized background mark
MUTED_D = "#a6ab9a"    # text-muted on dark
MUTED_L = "#565c4c"    # text-muted on light
OLIVE = "#3d5806"      # lime-900, text-safe lime on light
URL = "habib.dev"
ROLE = "SENIOR FULL STACK DEVELOPER & TEAM LEADER"

_FONTS = {}


def font(name):
    if name not in _FONTS:
        f = TTFont(L.FONTS / name)
        _FONTS[name] = (f, f.getGlyphSet(), f.getBestCmap(), f["OS/2"].sCapHeight)
    return _FONTS[name]


def text(s, font_file, cap, x, baseline, tracking=0.0, anchor="start"):
    """Outlined text with cap height `cap` px; tracking in em. anchor: start | middle | end."""
    f, gs, cmap, capu = font(font_file)
    scale = cap / capu
    names = [cmap.get(ord(ch), cmap[ord("?")]) for ch in s]
    width = sum(gs[n].width * scale for n in names) + tracking * cap / 0.7 * (len(s) - 1)
    x0 = x - (width / 2 if anchor == "middle" else width if anchor == "end" else 0)
    out, pen_x = [], x0
    for n in names:
        pen = L.CmdPen(gs, lambda p, ox=pen_x: (ox + p[0] * scale, baseline - p[1] * scale))
        gs[n].draw(pen)
        out += pen.contours
        pen_x += gs[n].width * scale + tracking * cap / 0.7
    return out, width


def mark(x, y, h):
    """The MH mark with its top-left at (x, y), h px tall."""
    bx0, by0, bx1, by1 = L.MARK_BOX
    s = h / (by1 - by0)
    return [[(op, [((px - bx0) * s + x, (py - by0) * s + y) for px, py in pts]) for op, pts in c] for c in L.MARK_C], (bx1 - bx0) * s


def rect(x, y, w, h):
    return [L.poly_contour([(x, y), (x + w, y), (x + w, y + h), (x, y + h)])]


def slant(x, y, w, h, rise):
    """Parallelogram band: the mark's 33° cut, used as a lime accent rule."""
    return [L.poly_contour([(x, y + rise), (x + w, y), (x + w, y + h - rise), (x, y + h)])]


def lockup(x, y, h, dark=True, tagline=True, name_scale=0.33):
    """Horizontal lockup: mark h tall at (x, y), name + tagline to its right. Returns layers, width."""
    m, mw = mark(x, y, h)
    gap = h * 0.16
    name_cap = h * name_scale
    name_c, nw = text("MOHAMED HABIB", "Barlow-800.ttf", name_cap, x + mw + gap, y + h * 0.5)
    layers = [(LIME if dark else INK, m), (WHITE if dark else INK, name_c)]
    w = mw + gap + nw
    if tagline:
        tag_c, tw = text("TECH LEAD", "Barlow-600.ttf", name_cap * 0.42, x + mw + gap, y + h * 0.5 + name_cap * 0.95, tracking=0.42)
        layers.append((MUTED_D if dark else MUTED_L, tag_c))
        w = max(w, mw + gap + tw)
    return layers, w


def bg_mark(W, H, scale=1.15, right=0.06, color=LIME_SOFT, y_shift=0.0):
    """Oversized background mark bleeding off the right edge."""
    h = H * scale
    m, mw = mark(0, 0, h)
    dx = W - mw * (1 - right) - W * 0.02
    dy = (H - h) / 2 + H * y_shift
    return (color, L.shifted(m, dx, dy))


def frame(W, H):
    return (0, 0, W, H)


# ── Formats ──────────────────────────────────────────────────────────────
def cover(W, H, *, content_x, content_cy, mark_h, sub=ROLE, align="start", url=True, bg_scale=1.15, safe=None):
    """A dark cover: background mark, lockup, role line, lime slant rule, URL."""
    layers = [bg_mark(W, H, bg_scale)]
    lk, lw = lockup(0, 0, mark_h)
    x = content_x - (lw / 2 if align == "middle" else lw if align == "end" else 0)
    y = content_cy - mark_h / 2 - mark_h * 0.18
    layers += [(c, L.shifted(cs, x, y)) for c, cs in lk]
    role_cap = mark_h * 0.11
    role_y = y + mark_h + mark_h * 0.36
    rc, rw = text(sub, "Barlow-600.ttf", role_cap, x, role_y, tracking=0.18)
    layers.append((LIME, slant(x, role_y + role_cap * 0.9, min(rw, lw) * 0.28, role_cap * 0.42, role_cap * 0.14)))
    layers.append((MUTED_D, rc))
    if url:
        ux, uy = ((safe[2], safe[3] - 8) if safe else (W - W * 0.03, H - H * 0.07))
        uc, _ = text(URL, "Barlow-700.ttf", max(14, H * 0.032 if not safe else (safe[3] - safe[1]) * 0.07), ux, uy, tracking=0.12, anchor="end")
        layers.append((MUTED_D, uc))
    return layers


def centered(W, H, *, mark_h, sub=ROLE, dark=True, bg=True, url=True, stacked_y=None):
    """Stacked, centred composition for square / vertical / preview images."""
    layers = [bg_mark(W, H, 1.0, right=0.25, y_shift=0.1)] if (bg and dark) else []
    m, mw = mark((W - mark_h * 442 / 348) / 2, 0, mark_h)
    cy = stacked_y if stacked_y is not None else H * 0.42
    top = cy - mark_h * 0.75
    layers.append((LIME if dark else INK, L.shifted(m, 0, top)))
    name_cap = mark_h * 0.26
    nc, nw = text("MOHAMED HABIB", "Barlow-800.ttf", name_cap, W / 2, top + mark_h + mark_h * 0.42, anchor="middle")
    layers.append((WHITE if dark else INK, nc))
    tc, _ = text("TECH LEAD", "Barlow-600.ttf", name_cap * 0.42, W / 2, top + mark_h + mark_h * 0.42 + name_cap * 1.0, tracking=0.42, anchor="middle")
    layers.append((LIME if dark else OLIVE, tc))
    if sub:
        sub_cap = name_cap * 0.36
        _, sw = text(sub, "Barlow-600.ttf", sub_cap, 0, 0, tracking=0.16)
        sub_cap *= min(1.0, W * 0.84 / sw)
        sc, sw = text(sub, "Barlow-600.ttf", sub_cap, W / 2, top + mark_h + mark_h * 0.42 + name_cap * 2.0, tracking=0.16, anchor="middle")
        layers.append((MUTED_D if dark else MUTED_L, sc))
    if url:
        uc, _ = text(URL, "Barlow-700.ttf", max(16, H * 0.022), W / 2, H - H * 0.06, tracking=0.12, anchor="middle")
        layers.append((MUTED_D if dark else MUTED_L, uc))
    return layers


def avatar(S, dark=True):
    """Profile picture: mark centred inside the circle-safe area (platforms crop to a circle)."""
    h = S * 0.42
    m, mw = mark((S - h * 442 / 348) / 2, (S - h) / 2, h)
    return [(LIME if dark else INK, m)]


def email_signature(W=600, H=160):
    layers = []
    m, mw = mark(24, 34, 92)
    layers.append((INK, m))
    layers.append((LIME, rect(24 + mw + 22, 30, 3, 100)))
    x = 24 + mw + 44
    nc, _ = text("Mohamed Habib", "Barlow-800.ttf", 24, x, 66)
    rc, _ = text("Senior Full Stack Developer & Team Leader", "Barlow-600.ttf", 11.5, x, 90)
    cc, _ = text("mohamedhabibwork@gmail.com  ·  habib.dev  ·  +20 115 197 8927", "Barlow-600.ttf", 10, x, 118)
    layers += [(INK, nc), (OLIVE, rc), (MUTED_L, cc)]
    return layers


def card_front(W=1050, H=600):
    lk, lw = lockup(0, 0, 150)
    layers = [bg_mark(W, H, 1.25, right=0.18)]
    layers += [(c, L.shifted(cs, 80, (H - 150) / 2 - 20)) for c, cs in lk]
    return layers


def card_back(W=1050, H=600):
    layers = []
    m, _ = mark(W - 80 - 110 * 442 / 348, 70, 110)
    layers.append((INK, m))
    nc, _ = text("MOHAMED HABIB", "Barlow-800.ttf", 46, 80, 300)
    rc, rw = text(ROLE, "Barlow-600.ttf", 17, 80, 340, tracking=0.12)
    layers += [(INK, nc), (OLIVE, rc), (LIME, slant(80, 358, 120, 8, 2.5))]
    lines = ["mohamedhabibwork@gmail.com", "+20 115 197 8927", "habib.dev  ·  linkedin.com/in/mohamedhabibwork"]
    for i, s in enumerate(lines):
        lc, _ = text(s, "Barlow-600.ttf", 18, 80, 440 + i * 36)
        layers.append((MUTED_L, lc))
    return layers


# name, W, H, bg colour, layers, note
FORMATS = [
    ("linkedin-banner", 1584, 396, INK, lambda: cover(1584, 396, content_x=1584 * 0.42, content_cy=190, mark_h=150), "LinkedIn profile background 1584×396. Profile photo covers the bottom-left; content sits right of it."),
    ("x-header", 1500, 500, INK, lambda: cover(1500, 500, content_x=1500 * 0.36, content_cy=230, mark_h=170), "X / Twitter header 1500×500. Avatar overlaps bottom-left."),
    ("facebook-cover", 1640, 624, INK, lambda: cover(1640, 624, content_x=1640 * 0.30, content_cy=300, mark_h=200), "Facebook cover 1640×624 (displays 820×312)."),
    ("youtube-banner", 2560, 1440, INK, lambda: cover(2560, 1440, content_x=1280, content_cy=720, mark_h=230, align="middle", bg_scale=0.95, safe=(507, 509, 2053, 932)), "YouTube channel art 2560×1440; content inside the 1546×423 safe area."),
    ("github-social", 1280, 640, INK, lambda: cover(1280, 640, content_x=640, content_cy=300, mark_h=190, align="middle", bg_scale=1.0), "GitHub repository social preview 1280×640."),
    ("og-image", 1200, 630, INK, lambda: cover(1200, 630, content_x=600, content_cy=296, mark_h=180, align="middle", bg_scale=1.0), "Open Graph / link preview 1200×630 (site, LinkedIn & Slack shares)."),
    ("instagram-post", 1080, 1080, INK, lambda: centered(1080, 1080, mark_h=300), "Instagram / LinkedIn square post 1080×1080."),
    ("instagram-story", 1080, 1920, INK, lambda: centered(1080, 1920, mark_h=360, stacked_y=900), "Story / Reel cover 1080×1920; content clear of the top and bottom 250px."),
    ("video-background", 1920, 1080, INK, lambda: cover(1920, 1080, content_x=1920 - 90, content_cy=180, mark_h=150, align="end"), "Zoom / Teams / Meet background 1920×1080; logo top-right so your head doesn't cover it (it appears mirrored to you only)."),
    ("presentation-title", 1920, 1080, INK, lambda: cover(1920, 1080, content_x=150, content_cy=540, mark_h=260), "16:9 title slide / thumbnail 1920×1080."),
    ("avatar-dark", 800, 800, INK, lambda: avatar(800, True), "Profile picture: lime mark on ink. Circle-safe."),
    ("avatar-lime", 800, 800, LIME, lambda: avatar(800, False), "Profile picture: ink mark on lime. Circle-safe."),
    ("avatar-light", 800, 800, BONE, lambda: avatar(800, False), "Profile picture: ink mark on off-white. Circle-safe."),
    ("email-signature", 600, 160, WHITE, email_signature, "Email signature banner 600×160 (export @2x for retina)."),
    ("business-card-front", 1050, 600, INK, card_front, "Business card front, 3.5×2 in @300 dpi (add 0.125 in bleed at the printer)."),
    ("business-card-back", 1050, 600, BONE, card_back, "Business card back, 3.5×2 in @300 dpi."),
]


def main():
    for sub in ("svg", "png", "pdf"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)
    pages = []
    readme = ["# MH social & multi-use kit", "", "All vector (text outlined). Generated by `build_social.py`.", "", "| File | Use |", "|---|---|"]
    for name, W, H, bg, build, note in FORMATS:
        layers = build()
        vb = frame(W, H)
        body = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Mohamed Habib, Tech Lead">',
                f"  <title>MH: {note}</title>", f'  <rect width="{W}" height="{H}" fill="{bg}"/>']
        for color, contours in layers:
            body.append(f'  <path fill="{color}" fill-rule="evenodd" d="{L.svg_path(contours)}"/>')
        body.append("</svg>\n")
        (OUT / "svg" / f"{name}.svg").write_text("\n".join(body))
        L.write_pdf(OUT / "pdf" / f"{name}.pdf", [(layers, vb, bg)], f"MH {name}")
        L.render_png(layers, vb, bg, W, ss=2 if W * H > 2_000_000 else 3).save(OUT / "png" / f"{name}.png", optimize=True)
        pages.append((layers, vb, bg))
        readme.append(f"| `{name}` ({W}×{H}) | {note} |")
    L.write_pdf(OUT / "MH-Social-Kit.ai", pages, "MH Social Kit - all artboards")
    L.write_pdf(OUT / "MH-Social-Kit.pdf", pages, "MH Social Kit - all artboards")
    logo_pages = [(layers, vb, bg) for _, layers, vb, bg, _ in L.VARIANTS]
    L.write_pdf(L.ROOT / "MH-Brand-Kit.ai", logo_pages + pages, "MH Brand Kit - logos + social")
    readme += ["", "`MH-Social-Kit.ai` holds every format as an artboard; `../MH-Brand-Kit.ai` adds the 11 logo variants (27 artboards)."]
    (OUT / "README.md").write_text("\n".join(readme) + "\n")
    print("formats:", len(FORMATS))


if __name__ == "__main__":
    main()
