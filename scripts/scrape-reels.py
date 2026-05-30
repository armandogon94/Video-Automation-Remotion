#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["gallery-dl>=1.32"]
# ///
"""
Download REELS (video posts) from public Instagram profiles using gallery-dl.

Why gallery-dl, not instaloader: instaloader hardcodes Instagram GraphQL doc_ids that
Instagram rotates aggressively. As of 2026-05-23 the `get_posts()` doc_id is broken
and returns 400. gallery-dl uses a different (more resilient) extraction path and worked
without auth on the first try.

Output structure (consistent with sibling 17-Instagram-Slides scraper):
    references/creators/<handle>/<shortcode>/video.mp4
    references/creators/<handle>/<shortcode>/metadata.json     (from gallery-dl --write-metadata)
    references/creators/<handle>/info.json                     (account-level)

Usage:
    scripts/scrape-reels.py --handle carloscuamatzin --count 12
    scripts/scrape-reels.py --handle carloscuamatzin --count 24 --output references/creators
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


def find_gallery_dl() -> str:
    """gallery-dl can land in /usr/local/bin, ~/.local/bin, or be on PATH."""
    candidates = [
        "gallery-dl",
        str(Path.home() / ".local" / "bin" / "gallery-dl"),
        "/usr/local/bin/gallery-dl",
        "/opt/homebrew/bin/gallery-dl",
    ]
    for c in candidates:
        if shutil.which(c) or Path(c).exists():
            return c
    print(
        "ERROR: gallery-dl not found. Install with: pip3 install --user gallery-dl",
        file=sys.stderr,
    )
    sys.exit(1)


def restructure_into_shortcode_folders(creator_dir: Path) -> int:
    """gallery-dl writes files as <shortcode>-<num>.mp4. Move each into <shortcode>/video.mp4
    + <shortcode>/metadata.json so downstream tools (extract-keyframes.py, analysis) find them.
    Returns count of restructured reels."""
    count = 0
    for mp4 in sorted(creator_dir.glob("*-1.mp4")):
        shortcode = mp4.name[: -len("-1.mp4")]
        out_dir = creator_dir / shortcode
        out_dir.mkdir(exist_ok=True)
        mp4.rename(out_dir / "video.mp4")
        meta = creator_dir / f"{mp4.name}.json"
        if meta.exists():
            meta.rename(out_dir / "metadata.json")
        count += 1
    return count


def fetch_reels(handle: str, count: int, output_dir: str) -> int:
    handle = handle.lstrip("@")
    creator_dir = Path(output_dir) / handle
    creator_dir.mkdir(parents=True, exist_ok=True)

    gallery_dl = find_gallery_dl()
    print(f"  Using {gallery_dl}", file=sys.stderr)
    print(f"\nFetching {count} reels from @{handle}...", file=sys.stderr)

    cmd = [
        gallery_dl,
        "--range", f"1-{count}",
        "--write-metadata",
        "--write-info-json",
        "-D", str(creator_dir),
        "-f", "{shortcode}-{num}.{extension}",
        f"https://www.instagram.com/{handle}/",
    ]
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"ERROR: gallery-dl failed: {e}", file=sys.stderr)
        return 0

    downloaded = restructure_into_shortcode_folders(creator_dir)
    print(f"\n✓ Restructured {downloaded} reels into per-shortcode folders.", file=sys.stderr)
    return downloaded


def main():
    parser = argparse.ArgumentParser(description="Download Instagram reels for motion-design reference")
    parser.add_argument("--handle", required=True, help="Instagram handle (with or without @)")
    parser.add_argument("--count", type=int, default=12, help="Max reels (default 12)")
    parser.add_argument(
        "--output",
        default="references/creators",
        help="Output directory (default: references/creators)",
    )
    args = parser.parse_args()

    count = fetch_reels(args.handle, args.count, args.output)
    print(json.dumps({"handle": args.handle.lstrip("@"), "downloaded": count}))


if __name__ == "__main__":
    main()
