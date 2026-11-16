from __future__ import annotations

import base64
import io
import json
import re
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from PIL import Image

from deck_render import render

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / "cn-launch-ppt" / "Roomix-产品路演.html"

ASSETS = {
    "quiz": (ROOT / "cn-launch-ppt/assets/01-quiz.png", (390, 844), 84),
    "kaylee": (ROOT / "cn-launch-ppt/assets/05-discover-kaylee.png", (390, 844), 86),
    "match": (ROOT / "cn-launch-ppt/assets/06-match.png", (390, 844), 86),
    "rooms": (ROOT / "cn-launch-ppt/assets/07-shared-rooms.png", (390, 844), 84),
    "roomMatch": (ROOT / "cn-launch-ppt/assets/09-room-match.png", (390, 844), 84),
    "detail": (ROOT / "cn-launch-ppt/assets/04-person-detail.png", (390, 844), 84),
    "me": (ROOT / "public/photos/me-sm.webp", (220, 220), 84),
    "kayleePhoto": (ROOT / "public/photos/kaylee-sm.webp", (220, 220), 84),
    "living": (ROOT / "public/photos/living2.webp", (760, 520), 82),
    "livingWide": (ROOT / "public/photos/living4.webp", (1100, 700), 82),
    "closingRoom": (ROOT / "public/photos/living5.webp", (900, 1100), 84),
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
    data = json.loads((HERE / "deck-data.json").read_text(encoding="utf-8"))
    slides = data["slides"]
    assert len(slides) == data["meta"]["slideCount"] == 18
    assert [slide["id"] for slide in slides] == list(range(1, 19))
    html = (HERE / "deck-template.html").read_text(encoding="utf-8")
    html = html.replace("@@STYLE@@", (HERE / "deck-style.css").read_text(encoding="utf-8"))
    html = html.replace("@@SLIDES@@", "\n".join(render(slide) for slide in slides))
    html = html.replace("@@SCRIPT@@", (HERE / "deck-app.js").read_text(encoding="utf-8"))
    for name, (path, size, quality) in ASSETS.items():
        html = html.replace(f"@@IMG_{name}@@", image_data(path, size, quality))
    html = html.replace("@@FONT_SANS@@", font_data(Path("C:/Windows/Fonts/NotoSansSC-VF.ttf"), html))
    html = html.replace("@@FONT_SERIF@@", font_data(Path("C:/Windows/Fonts/NotoSerifSC-VF.ttf"), html))
    unresolved = sorted(set(re.findall(r"@@[A-Za-z0-9_]+@@", html)))
    if unresolved:
        raise RuntimeError(f"Unresolved placeholders: {unresolved}")
    OUT.write_text(html, encoding="utf-8")
    print(f"BUILD_OK {OUT.name} {OUT.stat().st_size / 1024 / 1024:.2f} MiB, {len(slides)} slides")


if __name__ == "__main__":
    main()
