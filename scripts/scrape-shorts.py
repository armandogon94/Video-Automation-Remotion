#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""
Download YouTube Shorts from a public channel using yt-dlp (system-installed).

Output structure matches scrape-reels.py (per-id folders so downstream tools work
identically across platforms):
    references/creators/<handle>/<video_id>/video.mp4
    references/creators/<handle>/<video_id>/metadata.json
    references/creators/<handle>/<video_id>/cover.jpg

Usage:
    scripts/scrape-shorts.py --handle DIYSmartCode --count 12
    scripts/scrape-shorts.py --url https://www.youtube.com/@DIYSmartCode/shorts --count 12
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


def find_yt_dlp() -> str:
    for c in ["yt-dlp", "/opt/homebrew/bin/yt-dlp", "/usr/local/bin/yt-dlp"]:
        if shutil.which(c) or Path(c).exists():
            return c
    print("ERROR: yt-dlp not found. Install with: brew install yt-dlp", file=sys.stderr)
    sys.exit(1)


def restructure(creator_dir: Path) -> int:
    """yt-dlp writes <video_id>.mp4 + <video_id>.info.json + <video_id>.{webp,jpg}.
    Restructure into <video_id>/{video.mp4, metadata.json, cover.{ext}}."""
    count = 0
    for mp4 in list(creator_dir.glob("*.mp4")):
        if mp4.parent != creator_dir:
            continue
        video_id = mp4.stem
        out_dir = creator_dir / video_id
        out_dir.mkdir(exist_ok=True)
        mp4.rename(out_dir / "video.mp4")
        for sidecar in list(creator_dir.glob(f"{video_id}.*")):
            if sidecar.name.endswith(".info.json") or sidecar.name.endswith(".json"):
                sidecar.rename(out_dir / "metadata.json")
            elif sidecar.suffix in (".jpg", ".webp", ".png"):
                sidecar.rename(out_dir / f"cover{sidecar.suffix}")
            else:
                sidecar.unlink()
        count += 1
    return count


def fetch_shorts(handle: str | None, url: str | None, count: int, output_dir: str) -> tuple[str, int]:
    if url:
        target_url = url
        slug = url.rstrip("/").split("/")[-1].lstrip("@").lower()
        if slug == "shorts":
            slug = url.rstrip("/").split("/")[-2].lstrip("@").lower()
        handle_slug = slug
    else:
        handle_slug = handle.lstrip("@").lower()
        target_url = f"https://www.youtube.com/@{handle.lstrip('@')}/shorts"

    creator_dir = Path(output_dir) / handle_slug
    creator_dir.mkdir(parents=True, exist_ok=True)

    yt_dlp = find_yt_dlp()
    print(f"\nFetching {count} shorts from {target_url}...", file=sys.stderr)

    cmd = [
        yt_dlp,
        "--playlist-end", str(count),
        "--write-info-json",
        "--write-thumbnail",
        "--no-progress",
        "--no-overwrites",
        "--format", "best[ext=mp4]/best",
        "-o", f"{creator_dir}/%(id)s.%(ext)s",
        target_url,
    ]
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"ERROR: yt-dlp failed: {e}", file=sys.stderr)
        return handle_slug, 0

    downloaded = restructure(creator_dir)
    print(f"\n✓ Restructured {downloaded} shorts into per-id folders.", file=sys.stderr)
    return handle_slug, downloaded


def main():
    parser = argparse.ArgumentParser(description="Download YouTube Shorts for motion-design reference")
    parser.add_argument("--handle", help="YouTube channel handle (with or without @)")
    parser.add_argument("--url", help="Full channel-shorts URL (alternative to --handle)")
    parser.add_argument("--count", type=int, default=12, help="Max shorts (default 12)")
    parser.add_argument(
        "--output",
        default="references/creators",
        help="Output directory (default: references/creators)",
    )
    args = parser.parse_args()

    if not args.handle and not args.url:
        parser.error("--handle or --url required")

    handle_slug, count = fetch_shorts(args.handle, args.url, args.count, args.output)
    print(json.dumps({"handle": handle_slug, "downloaded": count}))


if __name__ == "__main__":
    main()
