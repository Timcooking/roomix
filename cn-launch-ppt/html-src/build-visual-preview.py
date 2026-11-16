from __future__ import annotations

import base64
import io
import re
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / "cn-launch-ppt" / "Roomix-视觉方向预览.html"

ASSETS = {
    "IMG_QUIZ": (ROOT / "cn-launch-ppt/assets/01-quiz.png", (390, 844), 86),
    "IMG_KAYLEE": (ROOT / "cn-launch-ppt/assets/05-discover-kaylee.png", (390, 844), 86),
    "IMG_MATCH": (ROOT / "cn-launch-ppt/assets/06-match.png", (390, 844), 86),
    "PHOTO_ME": (ROOT / "public/photos/me-sm.webp", (180, 180), 82),
    "PHOTO_KAYLEE": (ROOT / "public/photos/kaylee-sm.webp", (180, 180), 82),
    "PHOTO_LIVING": (ROOT / "public/photos/living2.webp", (760, 520), 82),
}


def image_data(path: Path, max_size: tuple[int, int], quality: int) -> str:
    with Image.open(path) as source:
        image = source.convert("RGB")
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        image.save(buffer, format="WEBP", quality=quality, method=6)
    return "data:image/webp;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")


def font_data(path: Path, text: str) -> str:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.notdef_glyph = True
    options.recommended_glyphs = True
    font = TTFont(path)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    font.flavor = "woff2"
    buffer = io.BytesIO()
    font.save(buffer)
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def main() -> None:
    html = (HERE / "visual-preview-template.html").read_text(encoding="utf-8")
    for name, (path, size, quality) in ASSETS.items():
        html = html.replace(f"@@{name}@@", image_data(path, size, quality))
    html = html.replace("@@FONT_SANS@@", font_data(Path("C:/Windows/Fonts/NotoSansSC-VF.ttf"), html))
    html = html.replace("@@FONT_SERIF@@", font_data(Path("C:/Windows/Fonts/NotoSerifSC-VF.ttf"), html))
    unresolved = re.findall(r"@@[A-Z0-9_]+@@", html)
    if unresolved:
        raise RuntimeError(f"Unresolved placeholders: {unresolved}")
    OUT.write_text(html, encoding="utf-8")
    print(f"BUILD_OK {OUT.name} {OUT.stat().st_size / 1024 / 1024:.2f} MiB")


if __name__ == "__main__":
    main()
