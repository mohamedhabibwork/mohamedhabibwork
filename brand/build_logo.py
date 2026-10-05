"""Build the MH logo kit: SVG, PDF, Illustrator (.ai, PDF-compatible), EPS, PNG, ICO.

Geometry of the mark is traced from the original raster lockup (2000x667 px);
the wordmark is Barlow outlined to paths so no font is needed to open it.
Run: python3 build_logo.py   (needs fontTools + Pillow)
"""
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).parent
OUT = ROOT / "logo"
FONTS = ROOT / "fonts"

LIME = "#c2f852"
INK = "#0b0d0a"
BONE = "#fafaf7"
WHITE = "#ffffff"

# ── The mark, in source-image pixels (y down) ──
MARK = [
    [(105, 152), (250, 249), (400, 152), (400, 310), (342, 349), (342, 265),
     (250, 324), (165, 268), (165, 428), (105, 466)],                     # M
    [(269, 330), (329, 291), (329, 500), (269, 466)],                      # shared stem
    [(488, 206), (547, 166), (547, 466), (488, 500), (488, 370), (338, 370),
     (428, 310), (488, 310)],                                              # H
]
MARK_BOX = (105, 152, 547, 500)

# text, font, ink x0, ink x1, baseline, cap height — measured from the source lockup
NAME = ("MOHAMED HABIB", "Barlow-800.ttf", 609, 1911, 359, 117)
TAGLINE = ("TECH LEAD", "Barlow-600.ttf", 609, 1389, 444, 51)


class CmdPen(BasePen):
    """Collects contours as ('M'|'L'|'C', points) commands through a transform."""

    def __init__(self, glyphset, tf):
        super().__init__(glyphset)
        self.tf, self.contours, self.cur = tf, [], None

    def _moveTo(self, p):
        self.cur = [("M", [self.tf(p)])]

    def _lineTo(self, p):
        self.cur.append(("L", [self.tf(p)]))

    def _curveToOne(self, a, b, c):
        self.cur.append(("C", [self.tf(a), self.tf(b), self.tf(c)]))

    def _closePath(self):
        self.contours.append(self.cur)
        self.cur = None

    _endPath = _closePath


def text_contours(text, font_file, x0, x1, baseline, cap):
    font = TTFont(FONTS / font_file)
    gs, cmap = font.getGlyphSet(), font.getBestCmap()
    scale = cap / font["OS/2"].sCapHeight
    names = [cmap[ord(ch)] for ch in text]
    adv = [gs[n].width * scale for n in names]
    lsb0 = font["hmtx"][names[0]][1] * scale
    last = font["glyf"][names[-1]]
    rsb1 = (gs[names[-1]].width - last.xMax) * scale
    ink = sum(adv) - lsb0 - rsb1
    track = ((x1 - x0) - ink) / (len(text) - 1)
    contours, x = [], x0 - lsb0
    for n, a in zip(names, adv):
        pen = CmdPen(gs, lambda p, ox=x: (ox + p[0] * scale, baseline - p[1] * scale))
        gs[n].draw(pen)
        contours += pen.contours
        x += a + track
    return contours


def poly_contour(pts):
    return [("M", [pts[0]])] + [("L", [p]) for p in pts[1:]]


def shifted(contours, dx, dy):
    return [[(op, [(x + dx, y + dy) for x, y in pts]) for op, pts in c] for c in contours]


MARK_C = [poly_contour(p) for p in MARK]
NAME_C = text_contours(*NAME)
TAG_C = text_contours(*TAGLINE)

PAD = 60  # clear space = the crossbar height
LOCK_VB = (MARK_BOX[0] - PAD, MARK_BOX[1] - PAD, 1911 - MARK_BOX[0] + 2 * PAD, MARK_BOX[3] - MARK_BOX[1] + 2 * PAD)
MARK_VB = (MARK_BOX[0] - PAD, MARK_BOX[1] - PAD, MARK_BOX[2] - MARK_BOX[0] + 2 * PAD, MARK_BOX[3] - MARK_BOX[1] + 2 * PAD)


def stacked():
    """Mark centred above the name and tagline."""
    mw = MARK_BOX[2] - MARK_BOX[0]
    name_w = 1911 - 609
    mark = shifted(MARK_C, 609 + (name_w - mw) / 2 - MARK_BOX[0], 0)
    text_dy = MARK_BOX[3] + 90 - 242
    name = shifted(NAME_C, 0, text_dy)
    tag = shifted(TAG_C, (name_w - (1389 - 609)) / 2, text_dy)
    vb = (609 - PAD, MARK_BOX[1] - PAD, name_w + 2 * PAD, 444 + text_dy - MARK_BOX[1] + 2 * PAD)
    return mark, name, tag, vb


def icon(size=1024, inset=0.2):
    mw, mh = MARK_BOX[2] - MARK_BOX[0], MARK_BOX[3] - MARK_BOX[1]
    s = size * (1 - 2 * inset) / max(mw, mh)
    dx, dy = (size - mw * s) / 2, (size - mh * s) / 2
    return [[(op, [((x - MARK_BOX[0]) * s + dx, (y - MARK_BOX[1]) * s + dy) for x, y in pts]) for op, pts in c]
            for c in MARK_C]


SM, SN, ST, SVB = stacked()
ICON_C = icon()

# name, layers [(fill, contours)], viewBox, background, description
VARIANTS = [
    ("mh-lockup-dark", [(LIME, MARK_C), (WHITE, NAME_C), (WHITE, TAG_C)], LOCK_VB, None,
     "Primary lockup for dark grounds (transparent)"),
    ("mh-lockup-dark-bg", [(LIME, MARK_C), (WHITE, NAME_C), (WHITE, TAG_C)], LOCK_VB, INK,
     "Primary lockup on the ink ground"),
    ("mh-lockup-light", [(INK, MARK_C), (INK, NAME_C), (INK, TAG_C)], LOCK_VB, None,
     "Lockup for light grounds (lime fails contrast on white)"),
    ("mh-lockup-light-bg", [(INK, MARK_C), (INK, NAME_C), (INK, TAG_C)], LOCK_VB, BONE,
     "Light lockup on the bone ground"),
    ("mh-stacked-dark", [(LIME, SM), (WHITE, SN), (WHITE, ST)], SVB, INK, "Stacked lockup, dark"),
    ("mh-stacked-light", [(INK, SM), (INK, SN), (INK, ST)], SVB, BONE, "Stacked lockup, light"),
    ("mh-mark", [(LIME, MARK_C)], MARK_VB, None, "Mark only, lime"),
    ("mh-mark-black", [(INK, MARK_C)], MARK_VB, None, "Mark only, one-colour ink"),
    ("mh-mark-white", [(WHITE, MARK_C)], MARK_VB, None, "Mark only, one-colour white"),
    ("mh-app-icon", [(LIME, ICON_C)], (0, 0, 1024, 1024), INK, "App icon: lime mark on ink"),
    ("mh-app-icon-lime", [(INK, ICON_C)], (0, 0, 1024, 1024), LIME, "Inverse app icon: ink mark on lime"),
]


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


# ── SVG ──
def svg_path(contours):
    out = []
    for c in contours:
        for op, pts in c:
            out.append(op + " ".join(f"{f(x)} {f(y)}" for x, y in pts))
        out.append("Z")
    return "".join(out)


def write_svg(name, layers, vb, bg, desc):
    x, y, w, h = vb
    body = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{f(x)} {f(y)} {f(w)} {f(h)}" '
            f'width="{f(w)}" height="{f(h)}" role="img" aria-label="Mohamed Habib, Tech Lead">',
            f"  <title>MH: {desc}</title>"]
    if bg:
        body.append(f'  <rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" fill="{bg}"/>')
    for layer_id, (color, contours) in zip(("mark", "name", "tagline"), layers):
        body.append(f'  <path id="{layer_id}" fill="{color}" fill-rule="evenodd" d="{svg_path(contours)}"/>')
    body.append("</svg>\n")
    (OUT / "svg" / f"{name}.svg").write_text("\n".join(body))


# ── PDF / AI (multi-artboard) and EPS ──
def rgb(hexc):
    return tuple(int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5))


def ps_ops(contours, vb, style):
    """Path operators with y flipped: PDF ('m l c h') or PostScript."""
    x0, y0, _, h = vb
    ops = {"pdf": ("m", "l", "c", "h"), "eps": ("moveto", "lineto", "curveto", "closepath")}[style]
    out = []
    for c in contours:
        for op, pts in c:
            coords = " ".join(f"{f(px - x0)} {f(h - (py - y0))}" for px, py in pts)
            out.append(f"{coords} {ops['MLC'.index(op)]}")
        out.append(ops[3])
    return "\n".join(out)


def page_stream(layers, vb, bg):
    _, _, w, h = vb
    s = []
    if bg:
        s.append("%.4f %.4f %.4f rg 0 0 %s %s re f" % (*rgb(bg), f(w), f(h)))
    for color, contours in layers:
        s.append("%.4f %.4f %.4f rg" % rgb(color))
        s.append(ps_ops(contours, vb, "pdf"))
        s.append("f*")
    return "\n".join(s).encode()


def write_pdf(path, pages, title):
    objs = []

    def add(b):
        objs.append(b)
        return len(objs)

    catalog, pages_id = add(None), add(None)
    kids = []
    for layers, vb, bg in pages:
        _, _, w, h = vb
        data = page_stream(layers, vb, bg)
        cs = add(b"<< /Length %d >>\nstream\n" % len(data) + data + b"\nendstream")
        kids.append(add(f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 {f(w)} {f(h)}] "
                        f"/ArtBox [0 0 {f(w)} {f(h)}] /Contents {cs} 0 R /Resources << >> >>".encode()))
    objs[catalog - 1] = f"<< /Type /Catalog /Pages {pages_id} 0 R >>".encode()
    objs[pages_id - 1] = (f"<< /Type /Pages /Kids [{' '.join(f'{k} 0 R' for k in kids)}] "
                          f"/Count {len(kids)} >>").encode()
    info = add(f"<< /Title ({title}) /Author (Mohamed Habib) /Creator (MH brand build_logo.py) >>".encode())
    buf = bytearray(b"%PDF-1.6\n%\xe2\xe3\xcf\xd3\n")
    offsets = []
    for i, o in enumerate(objs, 1):
        offsets.append(len(buf))
        buf += f"{i} 0 obj\n".encode() + o + b"\nendobj\n"
    xref = len(buf)
    buf += f"xref\n0 {len(objs) + 1}\n0000000000 65535 f \n".encode()
    for off in offsets:
        buf += f"{off:010d} 00000 n \n".encode()
    buf += (f"trailer\n<< /Size {len(objs) + 1} /Root {catalog} 0 R /Info {info} 0 R >>\n"
            f"startxref\n{xref}\n%%EOF\n").encode()
    path.write_bytes(bytes(buf))


def write_eps(name, layers, vb, bg):
    _, _, w, h = vb
    s = ["%!PS-Adobe-3.0 EPSF-3.0", f"%%BoundingBox: 0 0 {round(w)} {round(h)}",
         f"%%HiResBoundingBox: 0 0 {f(w)} {f(h)}", "%%Title: MH logo",
         "%%Creator: MH brand build_logo.py", "%%EndComments"]
    if bg:
        s.append("%.4f %.4f %.4f setrgbcolor newpath 0 0 moveto %s 0 lineto %s %s lineto 0 %s lineto closepath fill"
                 % (*rgb(bg), f(w), f(w), f(h), f(h)))
    for color, contours in layers:
        s.append("%.4f %.4f %.4f setrgbcolor newpath" % rgb(color))
        s.append(ps_ops(contours, vb, "eps"))
        s.append("eofill")
    s += ["showpage", "%%EOF\n"]
    (OUT / "eps" / f"{name}.eps").write_text("\n".join(s))


# ── PNG: supersampled even-odd rasteriser ──
def flatten(contour, steps=16):
    pts, cur = [], None
    for op, p in contour:
        if op in "ML":
            cur = p[0]
            pts.append(cur)
            continue
        a, b, c = p
        for i in range(1, steps + 1):
            t = i / steps
            mt = 1 - t
            pts.append(tuple(mt ** 3 * cur[k] + 3 * mt * mt * t * a[k] + 3 * mt * t * t * b[k] + t ** 3 * c[k]
                             for k in (0, 1)))
        cur = c
    return pts


def render_png(layers, vb, bg, width, ss=4):
    x0, y0, w, h = vb
    s = width / w
    W, H = width * ss, round(h * s) * ss
    img = Image.new("RGBA", (W, H), bg or (0, 0, 0, 0))
    for color, contours in layers:
        mask = Image.new("1", (W, H), 0)
        for c in contours:
            m = Image.new("1", (W, H), 0)
            ImageDraw.Draw(m).polygon([((x - x0) * s * ss, (y - y0) * s * ss) for x, y in flatten(c)], fill=1)
            mask = ImageChops.logical_xor(mask, m)
        img.paste(Image.new("RGBA", (W, H), color), (0, 0), mask.convert("L"))
    return img.resize((width, H // ss), Image.LANCZOS)


def png_widths(name):
    if "icon" in name:
        return [512, 1024]
    if "mark" in name:
        return [256, 512, 1024]
    return [480, 1200, 2400]


def main():
    for sub in ("svg", "pdf", "eps", "png", "favicon"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)
    pages = []
    for name, layers, vb, bg, desc in VARIANTS:
        write_svg(name, layers, vb, bg, desc)
        write_eps(name, layers, vb, bg)
        write_pdf(OUT / "pdf" / f"{name}.pdf", [(layers, vb, bg)], f"MH {name}")
        pages.append((layers, vb, bg))
        for wpx in png_widths(name):
            render_png(layers, vb, bg, wpx).save(OUT / "png" / f"{name}@{wpx}.png", optimize=True)
    # One document, one artboard per variant: opens in Illustrator as editable vectors.
    write_pdf(OUT / "MH-Logo.ai", pages, "MH Logo - all artboards")
    write_pdf(OUT / "MH-Logo.pdf", pages, "MH Logo - all artboards")
    _, icon_layers, icon_vb, _, _ = VARIANTS[9]
    fav = OUT / "favicon"
    for px_ in (16, 32, 48, 180, 192, 512):
        render_png(icon_layers, icon_vb, INK, px_).save(fav / f"icon-{px_}.png", optimize=True)
    render_png(icon_layers, icon_vb, INK, 256).save(fav / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    (fav / "favicon.svg").write_text((OUT / "svg" / "mh-app-icon.svg").read_text())
    print("variants:", len(VARIANTS))


if __name__ == "__main__":
    main()
