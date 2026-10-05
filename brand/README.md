# MH brand kit

| Folder | What |
|---|---|
| `logo/` | Vector logo kit, built by `build_logo.py` from the traced mark and Barlow outlines. `MH-Logo.ai` / `MH-Logo.pdf` hold every variant as an artboard; `svg/`, `pdf/`, `eps/` hold one file per variant; `png/` holds 480–2400px renders; `favicon/` holds `.ico` and 16–512px icons. |
| `fonts/` | Barlow, Poppins, Readex Pro, JetBrains Mono (TTF for desktop/Illustrator, WOFF2 for web). SIL Open Font License. |
| `design-system/` | Sources of the MH Design System artifact: `project/` (tokens, components, fonts), `build_ds.py` (previews, guidelines, types), `_test/` (local preview page). |

Rebuild the logos: `python3 build_logo.py` (needs `fontTools` and `Pillow`).
Rebuild the component previews: `python3 design-system/build_ds.py`.

Colours: lime `#C2F852` · ink `#0B0D0A` · bone `#FAFAF7`. The lime is RGB-native; for print, proof it against a Pantone 375/2297-class swatch rather than trusting a CMYK conversion.
