# Analyzed-Videos Manifest Convention

**Status:** active since 2026-05-28
**Owner:** anyone touching `references/creators/`
**Why:** future scrape agents need a fast way to know which videos have ALREADY been analyzed for a given creator, so they can SKIP those and pick only NEW content. Re-analyzing previously processed videos wastes tokens and inflates the token bill on every wave.

---

## The file

For every creator we study, the canonical "already-analyzed" record lives at:

```
references/creators/<handle>/analyzed-videos.json
```

It is REGENERATED in full each time the sync script runs — never hand-edit it. The script is idempotent: re-running it just refreshes counts, dates, and wave inferences. Existing per-video directories (`<id>/frames/`, `<id>/metadata.json`, `picks-*.json`, `ANALYSIS.md`, …) are NEVER modified.

---

## Schema

```json
{
  "creator_handle": "adamrosler",
  "analyzed_count": 22,
  "last_updated": "2026-05-28",
  "videos": [
    {
      "id": "mZgCDFEBna0",
      "title": "The #1 agent on OpenRouter is open source and runs on a 20GB laptop — Hermes",
      "platform": "youtube",
      "url": "https://www.youtube.com/watch?v=mZgCDFEBna0",
      "date_first_analyzed": "2026-05-28",
      "wave": "wave-7",
      "frame_count": 56,
      "clip_count": 2,
      "has_metadata_json": true,
      "notes": ""
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `creator_handle` | The handle (= directory name under `references/creators/`). |
| `analyzed_count` | `videos.length`. Convenience for quick reads. |
| `last_updated` | Date the script last ran (`YYYY-MM-DD`). |
| `id` | The video's platform-native ID (YouTube 11-char ID, Instagram shortcode, etc.). For variants like `lRmp0SYLCd8-redo`, the variant name is kept as-is and the parent ID is noted under `notes`. |
| `title` | Pulled from `<id>/metadata.json` → creator's `picks-*.json` → `"unknown"`. |
| `platform` | `youtube` \| `instagram` \| `tiktok` \| `unknown`. Inferred from per-video metadata, then creator-level info, then picks. |
| `url` | Canonical post URL. Never a transient yt-dlp CDN URL (`googlevideo.com`, `cdninstagram`). Constructed from id+platform when no canonical URL is in metadata. |
| `date_first_analyzed` | Earliest mtime found anywhere inside `<id>/` (`YYYY-MM-DD`). Best-effort proxy for when analysis started. |
| `wave` | Inferred from `date_first_analyzed`: `< 2026-05-15` → `wave-4`; `< 2026-05-25` → `wave-6`; otherwise → `wave-7`. |
| `frame_count` | Count of `*.jpg` files in `<id>/frames/`. |
| `clip_count` | Count of `*.mp4` files in `docs/research/wave-6/references/<handle>/` whose filename starts with `<id>-` (e.g. `mZgCDFEBna0-cuda-gpu-gauge.mp4`). |
| `has_metadata_json` | `true` iff `<id>/metadata.json` exists (the curated one — not the raw `metadata.info.json` yt-dlp dump). |
| `notes` | Optional. Auto-set to things like `"frame-only, no clips"`, `"variant of lRmp0SYLCd8 (redo)"`, etc. |

---

## How future scrape agents MUST use it

Before running any scraper (yt-dlp, gallery-dl, instaloader, …), read this manifest and exclude every ID it lists from the candidate set. Skipping is opportunistic — if the manifest is missing, treat the whole creator as not-yet-analyzed.

A minimal shell prelude:

```bash
handle="adamrosler"
manifest="references/creators/${handle}/analyzed-videos.json"

if [ -f "$manifest" ]; then
  jq -r '.videos[].id' "$manifest" > "/tmp/already-analyzed-${handle}.txt"
  # Now filter your yt-dlp / gallery-dl output to exclude these IDs:
  #   grep -vFf "/tmp/already-analyzed-${handle}.txt" candidate-ids.txt > new-ids.txt
fi
```

A Python equivalent:

```python
import json
from pathlib import Path

handle = "adamrosler"
manifest_path = Path(f"references/creators/{handle}/analyzed-videos.json")
analyzed_ids: set[str] = set()
if manifest_path.is_file():
    analyzed_ids = {v["id"] for v in json.loads(manifest_path.read_text())["videos"]}

new_candidates = [c for c in scrape_candidates(handle) if c["id"] not in analyzed_ids]
```

---

## How to regenerate

After any new scrape / frame-extraction / clip-render pass, re-run the sync script. It picks up new dirs, refreshes counts, and rewrites every manifest:

```bash
# All creators:
uv run python scripts/sync-analyzed-manifests.py

# One creator only:
uv run python scripts/sync-analyzed-manifests.py --creator adamrosler

# Preview without writing anything:
uv run python scripts/sync-analyzed-manifests.py --dry-run
```

The script lives at [`scripts/sync-analyzed-manifests.py`](../../scripts/sync-analyzed-manifests.py). It uses only the Python standard library — no external deps.

---

## Edge cases the script handles

- **Variant subdirs** like `lRmp0SYLCd8-redo` and `<id>-v2`: kept as a separate entry with `notes: "variant of <base> (redo)"`. The `url` still points at the base video.
- **Empty creator dirs** (e.g. `motiongraphics_web/`, `mr.eflow/`): produce `analyzed_count: 0` and an empty `videos: []`.
- **Stray files at the creator level** (e.g. half-downloaded `.mp4.part`, channel-level `.info.json`): ignored — only directories that contain `frames/` or `metadata.json` or `metadata.info.json` count as analyzed videos.
- **Non-video subdirs** named `frames/`, `longform-frames/`, `coarse/`: explicitly excluded from the video enumeration.
- **yt-dlp transient URLs**: the `url` field from yt-dlp's full dump (`metadata.info.json`) is often a CDN download URL (`googlevideo.com/videoplayback?…`). The script rejects these and constructs the canonical `https://www.youtube.com/watch?v=<id>` instead.

---

## Open questions / future work

- We do not yet record whether `ANALYSIS.md` mentions a video — that's a separate orthogonal axis (was the video *written up*, vs. just *frame-extracted*). If we need it, add a `mentioned_in_analysis: bool` field by grep-matching the id against the creator-level `ANALYSIS.md`.
- Clip counting is currently restricted to `docs/research/wave-6/references/<handle>/`. Future waves should either (a) keep using that path or (b) widen the glob in `count_clips()`.
