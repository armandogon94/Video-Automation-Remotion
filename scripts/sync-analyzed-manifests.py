#!/usr/bin/env python3
"""
Sync `analyzed-videos.json` manifests for every creator under references/creators/.

For each creator directory, this script enumerates per-video subdirectories
(those that contain analysis artifacts — frames, metadata.json, etc.) and
writes a consolidated manifest at:

    references/creators/<handle>/analyzed-videos.json

The manifest tells future scrape agents which videos have ALREADY been
analyzed so they can skip them and pick only NEW content.

Schema (see docs/conventions/analyzed-videos-manifest.md):
    {
      "creator_handle": "<handle>",
      "analyzed_count": <int>,
      "last_updated": "<YYYY-MM-DD>",
      "videos": [
        {
          "id": "<videoId>",
          "title": "<title or 'unknown'>",
          "platform": "youtube|tiktok|instagram|unknown",
          "url": "<canonical url>",
          "date_first_analyzed": "<YYYY-MM-DD>",
          "wave": "wave-4|wave-6|wave-7",
          "frame_count": <int>,
          "clip_count": <int>,
          "has_metadata_json": <bool>,
          "notes": "<optional>"
        },
        ...
      ]
    }

The script is IDEMPOTENT — re-running it overwrites each manifest with
freshly recomputed values. It NEVER modifies any other file.

Usage:
    uv run python scripts/sync-analyzed-manifests.py                     # all creators
    uv run python scripts/sync-analyzed-manifests.py --creator adamrosler  # one creator
    uv run python scripts/sync-analyzed-manifests.py --dry-run           # preview only
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Resolve project root: scripts/ lives directly under the repo root.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CREATORS_ROOT = PROJECT_ROOT / "references" / "creators"
WAVE6_CLIPS_ROOT = PROJECT_ROOT / "docs" / "research" / "wave-6" / "references"

# Subdir names inside a creator dir that are NOT individual videos.
NON_VIDEO_SUBDIRS = {"frames", "longform-frames", "coarse"}

# Boundary mtimes for wave inference.
WAVE_6_CUTOFF = datetime(2026, 5, 15)  # anything older than this = wave-4 or earlier
WAVE_7_CUTOFF = datetime(2026, 5, 25)  # 5-15 .. 5-25 = wave-6; later = wave-7


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class VideoEntry:
    id: str
    title: str = "unknown"
    platform: str = "unknown"
    url: str = ""
    date_first_analyzed: str = ""
    wave: str = "wave-7"
    frame_count: int = 0
    clip_count: int = 0
    has_metadata_json: bool = False
    notes: str = ""

    def to_dict(self) -> dict:
        d: dict = {
            "id": self.id,
            "title": self.title,
            "platform": self.platform,
            "url": self.url,
            "date_first_analyzed": self.date_first_analyzed,
            "wave": self.wave,
            "frame_count": self.frame_count,
            "clip_count": self.clip_count,
            "has_metadata_json": self.has_metadata_json,
        }
        if self.notes:
            d["notes"] = self.notes
        return d


@dataclass
class CreatorManifest:
    creator_handle: str
    analyzed_count: int = 0
    last_updated: str = ""
    videos: list[VideoEntry] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "creator_handle": self.creator_handle,
            "analyzed_count": self.analyzed_count,
            "last_updated": self.last_updated,
            "videos": [v.to_dict() for v in self.videos],
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def is_video_subdir(p: Path) -> bool:
    """A video subdir is a directory whose name is not in NON_VIDEO_SUBDIRS
    and that contains either a `frames/` dir or a metadata file."""
    if not p.is_dir():
        return False
    if p.name in NON_VIDEO_SUBDIRS:
        return False
    if p.name.startswith("."):
        return False
    # Require some sign of analysis: frames/ subdir or a metadata file.
    if (p / "frames").is_dir():
        return True
    if (p / "metadata.json").is_file():
        return True
    if (p / "metadata.info.json").is_file():
        return True
    return False


def safe_load_json(path: Path):
    """Load JSON or return None if missing/malformed."""
    if not path.is_file():
        return None
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def extract_picks(picks_obj) -> list[dict]:
    """Pick-file shapes vary:
      - {"wave": ..., "picks": [...]}
      - {"voter": ..., "picks": [...]}
      - bare list [{...}, ...]
    Return a flat list of pick dicts (possibly empty).
    """
    if picks_obj is None:
        return []
    if isinstance(picks_obj, list):
        return [p for p in picks_obj if isinstance(p, dict)]
    if isinstance(picks_obj, dict):
        picks = picks_obj.get("picks")
        if isinstance(picks, list):
            return [p for p in picks if isinstance(p, dict)]
    return []


def load_creator_picks(creator_dir: Path) -> dict[str, dict]:
    """Walk every picks-*.json (and longform-picks-*.json) at the creator level
    and build a {video_id: pick_dict} index. Later picks overwrite earlier
    ones (alphabetical sort gives stable behavior)."""
    index: dict[str, dict] = {}
    pick_files = sorted(creator_dir.glob("picks-*.json")) + sorted(
        creator_dir.glob("longform-picks-*.json")
    )
    for pf in pick_files:
        for pick in extract_picks(safe_load_json(pf)):
            vid = pick.get("id")
            if isinstance(vid, str) and vid:
                index[vid] = pick
    return index


def _platform_from_url(url: str) -> str:
    lower = url.lower()
    if "youtube.com" in lower or "youtu.be" in lower:
        return "youtube"
    if "instagram.com" in lower:
        return "instagram"
    if "tiktok.com" in lower:
        return "tiktok"
    return ""


def infer_platform_from_creator_info(creator_dir: Path) -> str:
    """Best-effort: read creator-level info.json for `primary_platform`,
    then fall back to any URL hint we can find. Also inspects any
    `*.info.json` (yt-dlp channel dump) sitting at the creator level."""
    candidates: list[Path] = [creator_dir / "info.json"]
    candidates.extend(sorted(creator_dir.glob("*.info.json")))
    for path in candidates:
        info = safe_load_json(path)
        if not isinstance(info, dict):
            continue
        p = info.get("primary_platform")
        if isinstance(p, str) and p:
            return p.lower()
        # gallery-dl-style Instagram metadata (creator-level dump).
        if "post_url" in info or "post_shortcode" in info:
            return "instagram"
        # Look for any URL-shaped field at the top level.
        for key in ("channel_url", "primary_url", "url", "webpage_url",
                    "youtube_url", "instagram_url", "tiktok_url",
                    "uploader_url"):
            val = info.get(key)
            if isinstance(val, str):
                hit = _platform_from_url(val)
                if hit:
                    return hit
        # yt-dlp `extractor` field is the clearest signal.
        extractor = info.get("extractor") or info.get("extractor_key")
        if isinstance(extractor, str):
            el = extractor.lower()
            if "youtube" in el:
                return "youtube"
            if "instagram" in el:
                return "instagram"
            if "tiktok" in el:
                return "tiktok"
    return "unknown"


def guess_platform_from_id(video_id: str, fallback: str) -> str:
    """Instagram shortcodes are usually 11 chars and contain mixed case +
    digits, often starting with a capital. YouTube IDs are 11 chars too,
    but the creator-level fallback is more reliable than ID-shape heuristics.
    We just return the fallback here — platform is mostly determined by the
    creator, not the ID."""
    return fallback


def _is_canonical_post_url(url: str) -> bool:
    """Reject yt-dlp-style temporary download URLs (e.g. googlevideo CDN).
    Accept human-shareable post URLs only."""
    if not url.startswith("http"):
        return False
    lower = url.lower()
    if "googlevideo.com" in lower or "videoplayback" in lower:
        return False
    if "cdninstagram" in lower or "fbcdn.net" in lower:
        return False
    return True


def url_for(video_id: str, platform: str, metadata: dict | None) -> str:
    """Prefer explicit canonical URLs from metadata; otherwise construct one.

    We deliberately ignore yt-dlp's `url` field (which is a transient CDN
    download URL) and prefer `webpage_url` / `post_url` (human-shareable)."""
    if isinstance(metadata, dict):
        for key in ("webpage_url", "post_url"):
            url = metadata.get(key)
            if isinstance(url, str) and _is_canonical_post_url(url):
                return url
        # Only accept `url` if it looks canonical (not a CDN playback URL).
        url = metadata.get("url")
        if isinstance(url, str) and _is_canonical_post_url(url) and (
            "youtube.com/watch" in url
            or "youtu.be/" in url
            or "instagram.com/p/" in url
            or "tiktok.com/" in url
        ):
            return url
    if platform == "youtube":
        return f"https://www.youtube.com/watch?v={video_id}"
    if platform == "instagram":
        return f"https://www.instagram.com/p/{video_id}/"
    if platform == "tiktok":
        # We do not have usernames per video here; leave bare.
        return ""
    return ""


def earliest_mtime(p: Path) -> float:
    """Return the earliest mtime found inside `p` (recursively). Falls back
    to `p.stat().st_mtime` if the directory has no children."""
    earliest: float | None = None
    try:
        st = p.stat()
        earliest = st.st_mtime
    except OSError:
        pass
    try:
        for child in p.rglob("*"):
            try:
                m = child.stat().st_mtime
            except OSError:
                continue
            if earliest is None or m < earliest:
                earliest = m
    except OSError:
        pass
    return earliest if earliest is not None else 0.0


def infer_wave(earliest_dt: datetime) -> str:
    if earliest_dt < WAVE_6_CUTOFF:
        return "wave-4"
    if earliest_dt < WAVE_7_CUTOFF:
        return "wave-6"
    return "wave-7"


def count_frames(video_dir: Path) -> int:
    frames_dir = video_dir / "frames"
    if not frames_dir.is_dir():
        return 0
    return sum(1 for f in frames_dir.iterdir() if f.suffix.lower() == ".jpg")


def count_clips(creator_handle: str, video_id: str) -> int:
    """Count clips in docs/research/wave-6/references/<creator>/<id>*.mp4."""
    clips_dir = WAVE6_CLIPS_ROOT / creator_handle
    if not clips_dir.is_dir():
        return 0
    # The id may itself contain hyphens; match `<id>` then a hyphen or dot
    # before the extension. Use literal id prefix.
    prefix = f"{video_id}-"
    return sum(
        1
        for f in clips_dir.iterdir()
        if f.is_file()
        and f.suffix.lower() == ".mp4"
        and (f.name.startswith(prefix) or f.stem == video_id)
    )


def extract_metadata(video_dir: Path) -> tuple[dict | None, bool]:
    """Return (parsed_metadata_dict_or_None, has_metadata_json_flag).

    Prefers metadata.json (curated), then metadata.info.json (yt-dlp dump).
    """
    md = safe_load_json(video_dir / "metadata.json")
    if isinstance(md, dict):
        return md, True
    md = safe_load_json(video_dir / "metadata.info.json")
    if isinstance(md, dict):
        return md, False
    return None, False


def build_video_entry(
    video_dir: Path,
    creator_handle: str,
    creator_platform: str,
    picks_index: dict[str, dict],
) -> VideoEntry:
    raw_name = video_dir.name
    # Special case: variants like `lRmp0SYLCd8-redo` — treat suffix as a note,
    # use the dir name as the unique id so it doesn't collide with the
    # parent video's entry.
    base_id_match = re.match(r"^(.+?)(-redo|-v\d+)$", raw_name)
    notes_extra = ""
    lookup_id = raw_name
    if base_id_match:
        lookup_id = base_id_match.group(1)
        notes_extra = f"variant of {lookup_id} ({base_id_match.group(2).lstrip('-')})"

    metadata, has_metadata_json = extract_metadata(video_dir)

    # Title resolution:  metadata.title > pick.title > 'unknown'
    title = "unknown"
    if isinstance(metadata, dict) and isinstance(metadata.get("title"), str):
        title = metadata["title"]
    elif lookup_id in picks_index and isinstance(
        picks_index[lookup_id].get("title"), str
    ):
        title = picks_index[lookup_id]["title"]
    elif raw_name in picks_index and isinstance(
        picks_index[raw_name].get("title"), str
    ):
        title = picks_index[raw_name]["title"]

    # Platform: metadata > creator-level > pick > unknown
    platform = "unknown"
    if isinstance(metadata, dict):
        p = metadata.get("platform")
        if isinstance(p, str) and p:
            platform = p.lower()
        else:
            for key in ("webpage_url", "url", "post_url"):
                v = metadata.get(key)
                if isinstance(v, str):
                    hit = _platform_from_url(v)
                    if hit:
                        platform = hit
                        break
        if platform == "unknown" and (
            "post_url" in metadata or "post_shortcode" in metadata
        ):
            platform = "instagram"
    if platform == "unknown":
        platform = creator_platform
    if platform == "unknown":
        pick = picks_index.get(lookup_id) or picks_index.get(raw_name)
        if isinstance(pick, dict):
            p = pick.get("platform")
            if isinstance(p, str) and p:
                platform = p.lower()

    # Use the base id (without -redo / -vN suffix) when constructing URLs,
    # so variants point at the underlying canonical video.
    url = url_for(lookup_id, platform, metadata)

    # Date-first-analyzed: earliest mtime in the dir.
    em = earliest_mtime(video_dir)
    earliest_dt = datetime.fromtimestamp(em) if em else datetime.now()
    date_str = earliest_dt.strftime("%Y-%m-%d")
    wave = infer_wave(earliest_dt)

    frame_count = count_frames(video_dir)
    clip_count = count_clips(creator_handle, lookup_id)

    # Compose notes.
    note_parts: list[str] = []
    if notes_extra:
        note_parts.append(notes_extra)
    if frame_count > 0 and clip_count == 0:
        note_parts.append("frame-only, no clips")
    if frame_count == 0 and clip_count == 0 and not has_metadata_json:
        note_parts.append("no frames, no clips, no metadata.json")

    return VideoEntry(
        id=raw_name,
        title=title,
        platform=platform if platform else "unknown",
        url=url,
        date_first_analyzed=date_str,
        wave=wave,
        frame_count=frame_count,
        clip_count=clip_count,
        has_metadata_json=has_metadata_json,
        notes="; ".join(note_parts),
    )


def build_creator_manifest(creator_dir: Path) -> CreatorManifest:
    handle = creator_dir.name
    creator_platform = infer_platform_from_creator_info(creator_dir)
    picks_index = load_creator_picks(creator_dir)

    video_subdirs = sorted(
        (p for p in creator_dir.iterdir() if is_video_subdir(p)),
        key=lambda p: p.name,
    )

    videos = [
        build_video_entry(vd, handle, creator_platform, picks_index)
        for vd in video_subdirs
    ]

    return CreatorManifest(
        creator_handle=handle,
        analyzed_count=len(videos),
        last_updated=date.today().strftime("%Y-%m-%d"),
        videos=videos,
    )


def write_manifest(manifest: CreatorManifest, out_path: Path, dry_run: bool) -> None:
    payload = json.dumps(manifest.to_dict(), indent=2, ensure_ascii=False) + "\n"
    if dry_run:
        print(f"\n=== {out_path.relative_to(PROJECT_ROOT)} (dry-run) ===")
        print(payload)
        return
    out_path.write_text(payload, encoding="utf-8")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument(
        "--creator",
        help="Process a single creator handle only (matches the subdir name).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be written without modifying any files.",
    )
    args = parser.parse_args()

    if not CREATORS_ROOT.is_dir():
        print(f"error: creators root not found: {CREATORS_ROOT}", file=sys.stderr)
        return 1

    creator_dirs: list[Path]
    if args.creator:
        single = CREATORS_ROOT / args.creator
        if not single.is_dir():
            print(f"error: creator dir not found: {single}", file=sys.stderr)
            return 1
        creator_dirs = [single]
    else:
        creator_dirs = sorted(p for p in CREATORS_ROOT.iterdir() if p.is_dir())

    written = 0
    total_videos = 0
    for cd in creator_dirs:
        manifest = build_creator_manifest(cd)
        out_path = cd / "analyzed-videos.json"
        write_manifest(manifest, out_path, args.dry_run)
        written += 1
        total_videos += manifest.analyzed_count
        action = "would write" if args.dry_run else "wrote"
        print(
            f"{action} {out_path.relative_to(PROJECT_ROOT)} "
            f"({manifest.analyzed_count} videos)"
        )

    print(
        f"\nDone. {written} manifest(s) {'previewed' if args.dry_run else 'written'}, "
        f"{total_videos} total video entries."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
