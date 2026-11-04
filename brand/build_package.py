"""Package the whole MH brand into one zip: logos, Illustrator/PDF kits, social covers,
app/web icons (PWA, Apple, Android, Windows, Safari), UI icons, fonts, images, tokens.
Run after build_logo.py and build_social.py:  python3 build_package.py  → MH-Brand-Kit.zip
"""
import json
import shutil
import zipfile
from pathlib import Path

import build_logo as L

ROOT = Path(__file__).parent
APP = ROOT / "app-icons"
ZIP = ROOT / "MH-Brand-Kit.zip"


def icon_layers(size, inset, fg):
    return [(fg, L.icon(size, inset))]


def app_icons():
    APP.mkdir(exist_ok=True)
    made = []

    def png(name, size, bg, fg=L.LIME, inset=0.2):
        L.render_png(icon_layers(1024, inset, fg), (0, 0, 1024, 1024), bg, size).save(APP / name, optimize=True)
        made.append(name)

    for s in (16, 32, 48, 64, 96, 128, 256, 512, 1024):
        png(f"icon-{s}.png", s, L.INK)
    png("apple-touch-icon.png", 180, L.INK)                       # iOS home screen (no transparency)
    for s in (192, 512):
        png(f"android-chrome-{s}.png", s, L.INK)                 # PWA "any"
        png(f"maskable-{s}.png", s, L.INK, inset=0.3)            # PWA "maskable": mark inside the 80% safe zone
    png("android-adaptive-foreground.png", 432, None, inset=0.32)  # adaptive icon layers (108dp @4x)
    from PIL import Image
    Image.new("RGBA", (432, 432), L.INK).save(APP / "android-adaptive-background.png"); made.append("android-adaptive-background.png")
    png("mstile-150x150.png", 150, L.INK, inset=0.26)             # Windows tile
    png("app-store-1024.png", 1024, L.INK)                       # App Store / Play listing
    L.render_png(icon_layers(1024, 0.2, L.INK), (0, 0, 1024, 1024), L.LIME, 1024).save(APP / "icon-lime-1024.png"); made.append("icon-lime-1024.png")
    L.render_png(icon_layers(1024, 0.22, L.LIME), (0, 0, 1024, 1024), L.INK, 256).save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]); made.append("favicon.ico")
    shutil.copy(L.OUT / "svg" / "mh-app-icon.svg", APP / "favicon.svg"); made.append("favicon.svg")
    # Safari pinned tab: single-colour mark, no background
    mark_svg = (L.OUT / "svg" / "mh-mark-black.svg").read_text().replace(L.INK, "#000000")
    (APP / "safari-pinned-tab.svg").write_text(mark_svg); made.append("safari-pinned-tab.svg")
    manifest = {
        "name": "Mohamed Habib · Tech Lead", "short_name": "Habib", "start_url": "/", "display": "standalone",
        "background_color": L.INK, "theme_color": L.INK,
        "icons": [
            {"src": "/android-chrome-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "/android-chrome-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "/maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
            {"src": "/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    (APP / "site.webmanifest").write_text(json.dumps(manifest, indent=2) + "\n"); made.append("site.webmanifest")
    (APP / "browserconfig.xml").write_text(f'<?xml version="1.0" encoding="utf-8"?>\n<browserconfig><msapplication><tile><square150x150logo src="/mstile-150x150.png"/><TileColor>{L.INK}</TileColor></tile></msapplication></browserconfig>\n'); made.append("browserconfig.xml")
    (APP / "head-snippet.html").write_text(f'''<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="{L.LIME}">
<meta name="theme-color" content="{L.INK}">
<meta name="msapplication-config" content="/browserconfig.xml">
''')
    made.append("head-snippet.html")
    return made


README = """# MH Brand Kit · Mohamed Habib, Tech Lead

Everything is vector where it can be (text outlined; no fonts needed to open logos).

| Folder | Contents |
|---|---|
| `01-illustrator/` | **MH-Brand-Kit.ai** (27 artboards: 11 logo versions + 16 social formats), MH-Logo.ai, MH-Social-Kit.ai, and matching PDFs. Open in Adobe Illustrator: each artboard is editable vector. |
| `02-logos/` | Every logo version as SVG, PDF, EPS and PNG (480–2400px): horizontal & stacked lockups (dark/light), mark (lime/black/white), app icons. |
| `03-social/` | LinkedIn, X, Facebook, YouTube covers; GitHub & Open Graph previews; Instagram post & story; profile pictures; video-call background; title slide; email signature; business card. SVG, PNG (exact platform sizes), PDF. |
| `04-app-icons/` | Favicons (.ico/.svg), Apple touch icon, PWA any + maskable, Android adaptive layers, Windows tile, Safari pinned tab, App Store 1024, `site.webmanifest`, `browserconfig.xml`, `head-snippet.html`. |
| `05-ui-icons/` | 68 interface icons, 24px stroke SVG (ink #8a8f7f). |
| `06-fonts/` | Barlow, Poppins, Readex Pro (Arabic), JetBrains Mono: TTF (desktop/Illustrator) + WOFF2 (web). SIL Open Font License. |
| `07-images/` | Profile portrait, project covers, CV template thumbnails. |
| `08-design-tokens/` | `tokens.json` (colours, type, spacing, radius, shadows; dark + light) and `brand-guide.md`. |

## Colours
| | Hex | RGB | Use |
|---|---|---|---|
| Lime | #C2F852 | 194 248 82 | The mark, primary actions. Never as text on white. |
| Carbon | #0B0D0A | 11 13 10 | Backgrounds, the mark on light grounds |
| Bone | #FAFAF7 | 250 250 247 | Light backgrounds |
| Olive | #3D5806 | 61 88 6 | Lime-family text on light |

Lime is an RGB colour; for print, match against a Pantone swatch (≈ 375 C / 2297 C) rather than trusting a CMYK conversion.

## Rules
- Clear space: the height of the H's crossbar on every side. Minimum: mark 16px tall, lockup 120px wide.
- Lime mark on dark grounds; carbon mark on light. Don't recolour, stretch, outline or add effects.
- Install the fonts from `06-fonts/` before editing type in Illustrator (logo text is already outlined).
"""


def main():
    made = app_icons()
    if ZIP.exists():
        ZIP.unlink()
    plan = [
        ("01-illustrator", [ROOT / "MH-Brand-Kit.ai", L.OUT / "MH-Logo.ai", L.OUT / "MH-Logo.pdf", ROOT / "social" / "MH-Social-Kit.ai", ROOT / "social" / "MH-Social-Kit.pdf"]),
    ]
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr("MH-Brand-Kit/README.md", README)
        for folder, files in plan:
            for f in files:
                z.write(f, f"MH-Brand-Kit/{folder}/{f.name}")
        tree = [
            ("02-logos", L.OUT, ("svg", "pdf", "eps", "png")),
            ("03-social", ROOT / "social", ("svg", "png", "pdf")),
        ]
        for folder, base, subs in tree:
            for sub in subs:
                for f in sorted((base / sub).iterdir()):
                    z.write(f, f"MH-Brand-Kit/{folder}/{sub}/{f.name}")
        z.write(ROOT / "social" / "README.md", "MH-Brand-Kit/03-social/README.md")
        for f in sorted(APP.iterdir()):
            z.write(f, f"MH-Brand-Kit/04-app-icons/{f.name}")
        for f in sorted((ROOT / "icons").glob("*.svg")):
            z.write(f, f"MH-Brand-Kit/05-ui-icons/{f.name}")
        for f in sorted((ROOT / "fonts").iterdir()):
            if f.suffix in (".ttf", ".woff2"):
                z.write(f, f"MH-Brand-Kit/06-fonts/{'ttf' if f.suffix == '.ttf' else 'woff2'}/{f.name}")
        for sub in ("images", "templates"):
            for f in sorted((ROOT / sub).iterdir()):
                z.write(f, f"MH-Brand-Kit/07-images/{f.name}")
        z.write(ROOT / "design-system" / "project" / "tokens.json", "MH-Brand-Kit/08-design-tokens/tokens.json")
        z.write(ROOT / "design-system" / "project" / "README.md", "MH-Brand-Kit/08-design-tokens/brand-guide.md")
    with zipfile.ZipFile(ZIP) as z:
        names = z.namelist()
    print(f"app icons: {len(made)}  zip entries: {len(names)}  size: {ZIP.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
