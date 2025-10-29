#!/usr/bin/env python3
"""
FinMango Image Optimizer
Optimizes PNG and JPG images for web performance

Usage:
    python3 optimize-images.py              # Optimize all images
    python3 optimize-images.py --dry-run    # Preview what would be optimized
    python3 optimize-images.py --aggressive # More aggressive compression
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ PIL/Pillow not installed")
    print("\nInstall it with:")
    print("  pip3 install Pillow")
    print("\nOr using system package manager:")
    print("  macOS:   brew install python-pillow")
    print("  Ubuntu:  sudo apt-get install python3-pil")
    sys.exit(1)

def get_file_size_mb(filepath):
    """Get file size in MB"""
    return os.path.getsize(filepath) / (1024 * 1024)

def optimize_image(filepath, quality=85, max_dimension=2000, dry_run=False):
    """
    Optimize a single image

    Args:
        filepath: Path to image
        quality: JPEG/PNG quality (1-100, higher = better quality)
        max_dimension: Maximum width or height
        dry_run: If True, don't save, just report what would happen
    """
    original_size = get_file_size_mb(filepath)

    if dry_run:
        img = Image.open(filepath)
        width, height = img.size

        # Calculate what the new size would be
        if max(width, height) > max_dimension:
            ratio = max_dimension / max(width, height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            print(f"  Would resize: {width}x{height} → {new_width}x{new_height}")

        print(f"  Would compress with quality={quality}")
        return original_size, 0  # Can't predict exact size without saving

    # Actually optimize
    img = Image.open(filepath)

    # Convert RGBA to RGB for JPEGs
    if img.mode == 'RGBA' and filepath.lower().endswith(('.jpg', '.jpeg')):
        # Create white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])  # 3 is the alpha channel
        img = background

    # Resize if too large
    width, height = img.size
    if max(width, height) > max_dimension:
        ratio = max_dimension / max(width, height)
        new_size = (int(width * ratio), int(height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        print(f"  Resized: {width}x{height} → {new_size[0]}x{new_size[1]}")

    # Save optimized version
    save_kwargs = {'optimize': True}

    if filepath.lower().endswith('.png'):
        save_kwargs['compress_level'] = 9
    elif filepath.lower().endswith(('.jpg', '.jpeg')):
        save_kwargs['quality'] = quality
        save_kwargs['progressive'] = True

    img.save(filepath, **save_kwargs)

    new_size = get_file_size_mb(filepath)
    return original_size, new_size

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Optimize images for FinMango website')
    parser.add_argument('--dry-run', action='store_true', help='Preview without making changes')
    parser.add_argument('--aggressive', action='store_true', help='More aggressive compression (quality=75)')
    parser.add_argument('--quality', type=int, default=85, help='JPEG quality (1-100, default: 85)')
    parser.add_argument('--max-size', type=int, default=2000, help='Maximum dimension in pixels (default: 2000)')
    parser.add_argument('files', nargs='*', help='Specific files to optimize (default: all)')

    args = parser.parse_args()

    if args.aggressive:
        args.quality = 75

    # Find all images
    if args.files:
        image_files = [Path(f) for f in args.files if os.path.exists(f)]
    else:
        image_files = list(Path('.').glob('*.png')) + list(Path('.').glob('*.jpg')) + list(Path('.').glob('*.jpeg'))

    if not image_files:
        print("❌ No image files found")
        return

    # Sort by size (largest first)
    image_files.sort(key=lambda f: os.path.getsize(f), reverse=True)

    print(f"🥭 FinMango Image Optimizer")
    print(f"{'='*60}")
    print(f"Mode: {'DRY RUN (no changes)' if args.dry_run else 'LIVE (will modify files)'}")
    print(f"Quality: {args.quality}")
    print(f"Max dimension: {args.max_size}px")
    print(f"Files to process: {len(image_files)}")
    print()

    if not args.dry_run:
        response = input("⚠️  This will MODIFY your image files. Continue? (yes/no): ")
        if response.lower() != 'yes':
            print("Cancelled.")
            return
        print()

    total_before = 0
    total_after = 0
    optimized_count = 0

    for filepath in image_files:
        size_before = get_file_size_mb(filepath)

        # Skip small files (already optimized)
        if size_before < 0.1:  # Less than 100KB
            continue

        print(f"📸 {filepath.name}")
        print(f"  Original: {size_before:.2f} MB")

        try:
            before, after = optimize_image(
                filepath,
                quality=args.quality,
                max_dimension=args.max_size,
                dry_run=args.dry_run
            )

            if not args.dry_run:
                savings = before - after
                percent = (savings / before * 100) if before > 0 else 0
                print(f"  Optimized: {after:.2f} MB (saved {savings:.2f} MB, -{percent:.1f}%)")
                total_after += after

            total_before += before
            optimized_count += 1
            print()

        except Exception as e:
            print(f"  ❌ Error: {e}")
            print()
            continue

    print(f"{'='*60}")
    print(f"✅ Summary")
    print(f"Files processed: {optimized_count}")
    print(f"Total size before: {total_before:.2f} MB")

    if not args.dry_run:
        savings = total_before - total_after
        percent = (savings / total_before * 100) if total_before > 0 else 0
        print(f"Total size after: {total_after:.2f} MB")
        print(f"Total saved: {savings:.2f} MB ({percent:.1f}% reduction)")
    else:
        print("\n💡 Run without --dry-run to actually optimize the files")

    print()
    print("Next steps:")
    print("1. Test your website locally")
    print("2. Check that images look good")
    print("3. Commit the optimized images")
    print("4. Deploy to production")

if __name__ == '__main__':
    main()
