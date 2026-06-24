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

---

## DEEP adversarial re-pass (2026-06-04)

Re-extracted 4 frames of our clip and re-read builtbystephan source frames
`DW4pAkNkT7_/frame-06` (top b-roll / bottom face-cam hard split, caption "so
instead" on the seam), `DXzkSK1RyFo/frame-04` (App-Store screen-rec top / face-cam
bottom, caption "this"), `DXC4oRLEYih/frame-05` (FACE_FULL, caption "for example"),
plus `DW4pAkNkT7_/frame-03` ("including" on near-black). These FRESH frames re-confirm
the signature: **top/bottom hard split, B-roll/screen-rec on TOP + face-cam on
BOTTOM, NO decorative seam divider, bold LOWERCASE WHITE sans captions (no
box/pill, subtle shadow) centered near the seam/mid-frame**.

**Verified the prior fallback-color IMPROVED edit is in place and working:** source
shows `fallbackFaceBg = ${resolvedInk}1A`, `fallbackBrollBg = ${resolvedMuted}3D`.
Our re-rendered frame (~2.8s, SPLIT mode) shows a clean, legible hard split —
dark-grey top band over deep-navy bottom band with a crisp edge at y=960 — and the
breadcrumb "STEPHAN · PATTERN" (green accent) at top. FACE_FULL frames stay uniform.
The load-bearing hard-split signature is legible even with placeholder media. No
regression.

**Caption-style observation (SHARED molecule — described, NOT edited):**
builtbystephan's captions are bold lowercase white sans with NO border/pill,
centered mid-frame. Our `EditorialCaption` (shared molecule, off-limits for this
comp's agent) uses a more editorial treatment. The demo render has empty
`wordTimings` so no caption shows; with real timings the EditorialCaption style
would differ from Stefan's naked-white-word look. If a builtbystephan-faithful
caption is wanted, that belongs in a shared-molecule change (a "naked bold white"
caption preset), not in this composition.

**Decision: VALIDATE the architecture (score held at 8/10 — IMPROVED via the prior
fallback-color fix, which this pass confirms is correct).** The comp is a faithful
capture of the continuous-face-cam + hard-cut-crop-modes + no-seam-divider pattern.
No further in-comp edit needed.
