# Reference creator MP4 cleanup — 2026-05-25

Source `video.mp4` files were deleted across every creator under `references/creators/<handle>/<shortcode>/`
to reclaim ~866 MB. The distilled knowledge — extracted JPG frames + per-creator
`ANALYSIS.md` — is preserved and is what every downstream agent actually reads.

## What survives per creator

```
references/creators/<handle>/
├── info.json                          (gallery-dl account metadata)
├── ANALYSIS.md                        (human/agent-written distillation)
└── <shortcode>/
    ├── metadata.json                  (per-post caption, view count, etc.)
    └── frames/frame-NN-tXX.XXs.jpg    (8–N evenly-spaced keyframes)
```

The Wave-4 voting docs at `docs/critiques/wave-4/<handle>-{consensus,vote{1..5}-*}.md` cite specific
`frame-NN-tXX.XXs.jpg` paths — those are still valid.

## How to re-download a creator's MP4s if needed

The scraper at `scripts/scrape-reels.py` (gallery-dl-based for Instagram, yt-dlp-based for YouTube)
will re-fetch on demand:

```bash
npm run scrape:reels -- --handle <handle> --count 12
# or for YouTube creators:
npm run scrape:reels -- --handle <handle> --platform youtube --count 12
```

Then extract a denser frame set:
```bash
npm run analyze:creator -- --handle <handle> --frames 16
```

## Why this cleanup is safe

- Wave 4 (multi-angle voting analysis across @carloscuamatzin, @diysmartcode, @bilawal.ai, @simonhoiberg)
  is **closed** — 20 voter docs + 4 consensus docs land at `docs/critiques/wave-4/`.
- 24 templates derived from those consensus docs shipped in Sprint 5
  (see `docs/SLIDESHOW-v4-sprint5.html`).
- The `frames/*.jpg` directories are the canonical visual evidence for any
  future audit — they're typically 8–32 JPGs per video at ~80–120 KB each.

## Policy going forward

- Reference-creator MP4s are **scratch downloads**, NOT canonical assets.
- Delete `video.mp4` files once frame extraction + `ANALYSIS.md` are in place.
- Keep frames, metadata.json, and ANALYSIS.md. Discard the source MP4.
