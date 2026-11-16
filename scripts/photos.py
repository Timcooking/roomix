"""
Builds every photo the app uses into public/photos/ as WebP, served from our own domain.

Sources are read from src/data/photos.ts:
  'unsplash:<id>'   downloaded from Unsplash once and cached in photos-src/.cache/
  'src:<file>'      your own original in photos-src/ (any size; EXIF rotation is respected)

Each photo gets <key>.webp (1080 wide) and <key>-sm.webp (480 wide), cropped to at most 4:5
so it fills tall cards without upscaling. A content hash per photo goes into
src/data/photo-manifest.json so browsers can cache forever and still pick up replacements.

Usage:  python scripts/photos.py        (needs Pillow: pip install pillow)
"""
import hashlib
import io
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / 'photos-src'
CACHE = SRC_DIR / '.cache'
OUT = ROOT / 'public' / 'photos'
MANIFEST = ROOT / 'src' / 'data' / 'photo-manifest.json'

SIZES = {'': 1080, '-sm': 480}
MAX_ASPECT = 4 / 5  # width / height


def load_sources():
    text = (ROOT / 'src' / 'data' / 'photos.ts').read_text(encoding='utf-8')
    return re.findall(r"^\s*(\w+):\s*'(unsplash|src):([^']+)'", text, re.M)


def open_source(kind, ref):
    if kind == 'src':
        return Image.open(SRC_DIR / ref)
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / f'{ref}.jpg'
    if not cached.exists():
        url = f'https://images.unsplash.com/photo-{ref}?w=1600&q=85&fm=jpg'
        cached.write_bytes(urllib.request.urlopen(url, timeout=60).read())
    return Image.open(cached)


def crop(im):
    w, h = im.size
    if w / h > MAX_ASPECT:  # too wide for a portrait card: keep the centre
        nw = round(h * MAX_ASPECT)
        left = (w - nw) // 2
        im = im.crop((left, 0, left + nw, h))
    return im


def build(entry):
    key, kind, ref = entry
    im = crop(ImageOps.exif_transpose(open_source(kind, ref)).convert('RGB'))
    digest = hashlib.sha1()
    for suffix, width in SIZES.items():
        scaled = im if im.width <= width else im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        scaled.save(buf, 'WEBP', quality=78 if suffix == '' else 72, method=6)
        data = buf.getvalue()
        (OUT / f'{key}{suffix}.webp').write_bytes(data)
        digest.update(data)
    return key, digest.hexdigest()[:8]


def main():
    entries = load_sources()
    if not entries:
        sys.exit('no photos found in src/data/photos.ts')
    OUT.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(8) as ex:
        manifest = dict(sorted(ex.map(build, entries)))
    MANIFEST.write_text(json.dumps(manifest, indent=1) + '\n', encoding='utf-8')
    # drop files for photos that no longer exist
    keep = {f'{k}{s}.webp' for k in manifest for s in SIZES}
    for f in OUT.glob('*.webp'):
        if f.name not in keep:
            f.unlink()
    total = sum(f.stat().st_size for f in OUT.glob('*.webp'))
    print(f'{len(manifest)} photos -> {OUT} ({total / 1024 / 1024:.1f} MB)')


if __name__ == '__main__':
    main()
