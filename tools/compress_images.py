#!/usr/bin/env python3
"""
Compress oversized site images in place (filenames unchanged so no HTML edits).

- JPEG over JPEG_THRESHOLD: EXIF-orientation applied, resized to MAX_DIM,
  re-encoded quality 82 progressive, metadata stripped.
- PNG over PNG_THRESHOLD: resized to MAX_DIM, palette-quantized to 256 colors
  with dithering (pngquant-style); falls back to plain optimize for images
  that are already palette/low-color.
- A file is only overwritten when the result is at least MIN_SAVING smaller.

Usage: python3 tools/compress_images.py [--apply]   (default is dry run)
"""
import io
import os
import sys

from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None  # some headers are huge; we trust our own repo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JPEG_THRESHOLD = 250 * 1024
PNG_THRESHOLD = 500 * 1024
MAX_DIM = 2400
JPEG_QUALITY = 82
MIN_SAVING = 0.25  # only rewrite if >=25% smaller
SKIP_DIRS = {'.git', 'node_modules'}

apply_changes = '--apply' in sys.argv


def candidate_files():
    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in sorted(files):
            ext = os.path.splitext(name)[1].lower()
            path = os.path.join(root, name)
            size = os.path.getsize(path)
            if ext in ('.jpg', '.jpeg') and size > JPEG_THRESHOLD:
                yield path, size, 'jpeg'
            elif ext == '.png' and size > PNG_THRESHOLD:
                yield path, size, 'png'


def shrink_dimensions(img):
    w, h = img.size
    if max(w, h) <= MAX_DIM:
        return img, False
    if w >= h:
        new = (MAX_DIM, max(1, round(h * MAX_DIM / w)))
    else:
        new = (max(1, round(w * MAX_DIM / h)), MAX_DIM)
    return img.resize(new, Image.LANCZOS), True


def recompress(path, kind):
    with Image.open(path) as img:
        if getattr(img, 'is_animated', False):
            return None  # don't touch animations
        img = ImageOps.exif_transpose(img)
        img, resized = shrink_dimensions(img)
        buf = io.BytesIO()
        if kind == 'jpeg':
            if img.mode not in ('RGB', 'L'):
                img = img.convert('RGB')
            img.save(buf, 'JPEG', quality=JPEG_QUALITY, optimize=True,
                     progressive=True)
        else:
            if img.mode in ('RGB', 'RGBA'):
                quant = img.quantize(colors=256,
                                     method=Image.Quantize.FASTOCTREE,
                                     dither=Image.Dither.FLOYDSTEINBERG)
                quant.save(buf, 'PNG', optimize=True)
            else:
                img.save(buf, 'PNG', optimize=True)
        return buf.getvalue(), resized


total_before = total_after = changed = 0
for path, size, kind in candidate_files():
    rel = os.path.relpath(path, ROOT)
    result = recompress(path, kind)
    if result is None:
        print(f'  skip (animated)  {rel}')
        continue
    data, resized = result
    if len(data) > size * (1 - MIN_SAVING):
        print(f'  keep  {rel}  ({size//1024}KB, saving too small)')
        continue
    total_before += size
    total_after += len(data)
    changed += 1
    note = ' [resized]' if resized else ''
    print(f'  {size//1024:>5}KB -> {len(data)//1024:>5}KB  {rel}{note}')
    if apply_changes:
        with open(path, 'wb') as f:
            f.write(data)

mode = 'APPLIED' if apply_changes else 'DRY RUN'
print(f'\n{mode}: {changed} files, {total_before//1024//1024}MB -> '
      f'{total_after//1024//1024}MB')
