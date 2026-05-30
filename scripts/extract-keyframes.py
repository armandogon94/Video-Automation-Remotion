#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""
Extract keyframes from a reference creator's reels for visual analysis.

For each video.mp4 under references/creators/<handle>/<shortcode>/, write N evenly-spaced
keyframes to references/creators/<handle>/<shortcode>/frames/. Defaults: 8 frames per reel.

Usage:
    scripts/extract-keyframes.py --handle carloscuamatzin
    scripts/extract-keyframes.py --handle carloscuamatzin --frames 12
    scripts/extract-keyframes.py --handle carloscuamatzin --shortcode ABC123 --frames 16
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path


def get_duration(video_path: Path) -> float | None:
    """Return video duration in seconds, or None on failure."""
    try:
        result = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=nw=1:nk=1",
                str(video_path),
            ],
            capture_output=True, text=True, check=True,
        )
        return float(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError) as e:
        print(f"  ERROR probing {video_path}: {e}", file=sys.stderr)
        return None


def extract_keyframes(video_path: Path, out_dir: Path, n_frames: int) -> int:
    """Extract n_frames evenly-spaced frames into out_dir. Returns count extracted."""
    duration = get_duration(video_path)
    if duration is None or duration <= 0:
        return 0

    out_dir.mkdir(parents=True, exist_ok=True)

    margin = min(0.2, duration * 0.02)
    step = (duration - 2 * margin) / max(1, n_frames - 1) if n_frames > 1 else 0
    extracted = 0

    for i in range(n_frames):
        t = margin + i * step
        frame_path = out_dir / f"frame-{i:02d}-t{t:05.2f}s.jpg"
        try:
            subprocess.run(
                [
                    "ffmpeg", "-y", "-ss", f"{t:.3f}",
                    "-i", str(video_path),
                    "-frames:v", "1", "-q:v", "2",
                    str(frame_path),
                ],
                capture_output=True, check=True,
            )
            extracted += 1
        except subprocess.CalledProcessError as e:
            print(f"  ERROR extracting frame at {t}s: {e}", file=sys.stderr)

    return extracted


def main():
    parser = argparse.ArgumentParser(description="Extract keyframes from reference creator reels")
    parser.add_argument("--handle", required=True, help="Creator handle (folder name under references/creators/)")
    parser.add_argument("--shortcode", help="Only this reel's shortcode (default: all)")
    parser.add_argument("--frames", type=int, default=8, help="Frames per reel (default 8)")
    parser.add_argument(
        "--base",
        default="references/creators",
        help="Base directory (default: references/creators)",
    )
    args = parser.parse_args()

    handle = args.handle.lstrip("@")
    creator_dir = Path(args.base) / handle
    if not creator_dir.exists():
        print(f"ERROR: {creator_dir} does not exist. Run scrape:reels first.", file=sys.stderr)
        sys.exit(1)

    summary = []
    if args.shortcode:
        reel_dirs = [creator_dir / args.shortcode]
    else:
        reel_dirs = sorted([d for d in creator_dir.iterdir() if d.is_dir() and (d / "video.mp4").exists()])

    if not reel_dirs:
        print(f"ERROR: no reels found under {creator_dir}", file=sys.stderr)
        sys.exit(1)

    print(f"Extracting {args.frames} keyframes from {len(reel_dirs)} reel(s) under @{handle}...", file=sys.stderr)

    for reel_dir in reel_dirs:
        video_path = reel_dir / "video.mp4"
        if not video_path.exists():
            continue
        frames_dir = reel_dir / "frames"
        if frames_dir.exists():
            for f in frames_dir.glob("frame-*.jpg"):
                f.unlink()
        count = extract_keyframes(video_path, frames_dir, args.frames)
        duration = get_duration(video_path)
        summary.append({
            "shortcode": reel_dir.name,
            "duration": duration,
            "frames_extracted": count,
            "frames_dir": str(frames_dir),
        })
        suffix = f" (duration {duration:.1f}s)" if duration else ""
        print(f"  ✓ {reel_dir.name} — {count} frames{suffix}", file=sys.stderr)

    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
