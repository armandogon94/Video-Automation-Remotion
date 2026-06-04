# TalkingHeadDynamic9x16 ↔ builtbystephan (Stefan)

**Creator source frames:** `references/creators/builtbystephan/DYkyJfxx5Lx/frames-dense/seg2-t10.34s.jpg`
(BROLL_FULL — runner in field, bold-white caption "feels alive"),
`DYkyJfxx5Lx/frames/frame-17-t20.93s.jpg` (SPLIT_50_TOP_BROLL — Claude desktop
screen-rec top / face-cam bottom, hard split, caption "Brand Alchemy" on the seam).
Pattern documented in `references/creators/builtbystephan/ANALYSIS.md` §Template A.

## builtbystephan's signature pattern (TalkingHeadDynamic9x16)
- ONE continuous home-studio face-cam take underneath.
- Visible frame switches between crop modes via HARD CUTS aligned to caption-word
  onsets: FACE_FULL, BROLL_FULL, SPLIT_50_TOP_BROLL (dominant ~45%), SPLIT_50_TOP_FACE.
- HARD split-line at the midline (y=960), NO decorative seam divider — the split
  between two distinct image bands IS the chrome.
- Bold-white sans captions, y-position near the face per crop mode.
- HARD CUTS only — no dissolves.

## Composition fidelity (source code) — judged independent of placeholder media
The .tsx faithfully implements the documented spec:
- ONE `<OffthreadVideo>` face-cam mounted full-duration (never unmounts across cuts). ✓
- 5 crop modes incl. all four signature modes + a SPLIT_33_TOP_FACE "heavy graphics"
  extra; geometry via `clipPath: inset(...)` at the exact y=960 / y=640 lines. ✓
- `HARD_CUT` is the schema DEFAULT; CROSSFADE only fires when explicitly set. ✓
- NO decorative seam accent (matches Stephan's clean-hard-split grammar). ✓
- Bottom-anchored bold captions, dynamic-per-mode rationale documented. ✓
- Default segment track in Root.tsx sequences FACE_FULL → SPLIT_50_TOP_BROLL →
  BROLL_FULL → SPLIT_50_TOP_FACE → FACE_FULL → SPLIT_33_TOP_FACE at ~1 cut / 3s. ✓

## Problem found in the COMPARISON RENDER (and the fix)
The cross-creator clip ships with NO face-cam / NO B-roll / empty wordTimings, so
every band fell back to its placeholder color. In the `dark` palette the two
fallback tints were `fallbackBrollBg = paper (#0A0F1A)` and `fallbackFaceBg =
ink@20%` — BOTH near-navy, so the hard split (the load-bearing signature) was
INVISIBLE. The placeholder render read as a uniform empty navy frame with no
discernible crop structure.

**IMPROVED (minimal, safe):** in `TalkingHeadDynamic9x16.tsx` I made the two
fallback band colors DISTINCT so the hard split stays legible when an asset is
missing/loading:
- `fallbackBrollBg`: `resolvedPaper` → `${resolvedMuted}3D` (muted @ ~24% — a
  slightly-elevated warm-gray panel)
- `fallbackFaceBg`: `${resolvedInk}33` → `${resolvedInk}1A` (ink @ ~10% — subtle wash)

This ONLY affects the missing/loading state — real `objectFit: cover` media fully
occludes both tints, so live renders are unchanged. Re-rendered + verified:
SPLIT_50_TOP_BROLL frame (4.2s) now shows a clean hard split — warm-gray B-roll
band (sampled (55,52,47)) over a deep-navy face band ((23,24,29)) with a crisp
edge at y=960; FACE_FULL frame (1.0s) stays correctly uniform (no split). No
regression to the breadcrumb chrome. Typecheck clean.

## Score: 8/10 — IMPROVED
Composition architecture is a faithful, near-textbook capture of builtbystephan's
continuous-face-cam + hard-cut-crop-modes pattern. Tightened the placeholder
fallback so the signature hard-split is legible in the comparison render and any
asset-missing state, without touching real-media behavior.

## Files edited
- `src/compositions/TalkingHeadDynamic9x16.tsx` (2 fallback-color constants)
