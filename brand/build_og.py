"""Build the default social share image (Open Graph / Twitter): public/og-default.png, 1200x630.

Social crawlers don't render SVG and crop square icons, so pages share this PNG unless they
have their own raster image. Run: python3 brand/build_og.py   (needs Pillow)
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
OUT = ROOT.parent / "public" / "og-default.png"
FONTS = ROOT / "fonts"
MARK = ROOT / "logo" / "png" / "mh-mark@512.png"

W, H = 1200, 630
PAD = 80
LIME = "#c2f852"
INK = "#0b0d0a"
BONE = "#fafaf7"
MUTED = "#a3a89c"

NAME = "Mohamed Habib"
ROLE = "Senior Full-Stack Engineer & Tech Lead"
STACK = "Laravel · .NET · React · Cloud-native platforms"
DOMAIN = "mohamedhabib.work"


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def main() -> None:
    img = Image.new("RGB", (W, H), INK)
    draw = ImageDraw.Draw(img)

    mark = Image.open(MARK).convert("RGBA")
    mark.thumbnail((112, 112))
    img.paste(mark, (PAD, PAD), mark)

    draw.text((PAD, 312), NAME, font=font("Barlow-800.ttf", 104), fill=BONE, anchor="ls")
    draw.text((PAD, 384), ROLE, font=font("Poppins-600.ttf", 44), fill=LIME, anchor="ls")
    draw.text((PAD, 446), STACK, font=font("Poppins-400.ttf", 30), fill=MUTED, anchor="ls")

    draw.rectangle((PAD, H - PAD - 64, PAD + 96, H - PAD - 58), fill=LIME)
    draw.text((PAD, H - PAD), DOMAIN, font=font("JetBrainsMono-600.ttf", 32), fill=BONE, anchor="ls")

    img.save(OUT, optimize=True)
    print(f"wrote {OUT.relative_to(ROOT.parent)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
