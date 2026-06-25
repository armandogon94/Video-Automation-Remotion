Overall verdict: the Abhi family is mostly coherent and production-looking in the current sheets, with no obvious font fallback, mojibake, or major overflow. The cross-creator gallery is less trustworthy: many SOURCE frames are repeated per creator instead of selected per template/source clip, several media-driven templates render placeholders or empty fields, and one numeric template clips its hero figure. Static checks found no missing rendered MP4s in the actual gallery paths, no invalid Remotion composition IDs, and no zod `_def`/`.shape` reflection in the reviewed TSX sources, but `tsc --noEmit` is currently blocked by a TypeScript config error.

## Visual fidelity

[HIGH] Cross-creator source panels for multi-template creators: many rows compare against the same SOURCE frame for an entire creator block, so the visual comparison is often invalid. In the sheets, all adamrosler rows reuse the neural-network frame, all natebjones rows reuse the "Review Gate" frame, and most sahilbloom rows reuse the same giant blue "07" frame. This prevents honest pattern scoring because the left side is not the source pattern for the named template. Fix the gallery source selection to map each comp to a specific source video/frame directory, then rebuild the source strips/contact sheets.

[HIGH] SplitWebcamScreen9x16 / TalkingHeadDynamic9x16 / TalkingHead / Listicle: footage-dependent templates render as placeholders or near-empty backgrounds instead of the reference layout. `SplitWebcamScreen9x16` shows a cream field with a red "BOOM" line, `TalkingHeadDynamic9x16` is mostly an empty dark field, and Simon's `TalkingHead`/`Listicle` rows do not show usable foreground content. These are not copy/brand differences; the core visible pattern is missing at the review frame. Add cross-creator props with real still/video assets for the required media slots, or create representative local fallback media so the rendered template exercises the intended layout.

[HIGH] AnimatedCounter9x16: the large counter is clipped off both sides in the OUR mid-frame; only part of the leading digit and trailing digits are visible. The component computes `numberFontSize` from string length but does not enforce the resulting rendered width against the 1080px canvas. Reduce the mono font size for long comma-formatted figures, include actual prefix/suffix width in the fit calculation, or wrap the figure in a measured/scaled container with horizontal safe padding.

[MEDIUM] QuoteCard9x16: the review sheet's OUR frame is effectively blank except for the breadcrumb. The clip has `revealDelaySeconds: 2.0`, while the contact-sheet extractor always samples at `2.0s`, so the sampled "mid-frame" lands before the main quote is visible. Either sample percentage-based mid/late frames for delayed-reveal templates or move this template's reveal earlier enough that the canonical QA frame contains its primary text.

[LOW] Abhi templates: the family generally matches the source vocabulary well. I did not see real rendering blockers in the current contact sheets; differences are mostly allowed brand/copy/localization choices.

## Code / HTML bugs

[HIGH] `scripts/build-cross-creator-gallery.py:70`: `frames_dir(creator)` selects the largest/freshest frame directory under a creator, not the source directory for the specific composition. This creates repeated or wrong SOURCE strips across many rows. Extend `src/autoedit/runCrossCreatorReplicas.ts:29` targets with a `sourceId`/`framesDir` field, or add a manifest mapping comp -> source frame directory, then make `frames_dir` take `(comp, creator)` and resolve the exact directory.

[HIGH] `src/Root.tsx:688` and `src/Root.tsx:1081`: cross-creator renders rely on default props with empty media fields (`webcamImageUrl`, `screenImageUrl`, `faceCamSrc`, `brollClips`). Since `docs/research/cross-creator/props/SplitWebcamScreen9x16.json` and `TalkingHeadDynamic9x16.json` are absent, the gallery renders placeholders instead of the intended footage layouts. Add per-comp props files with existing static assets or change the defaults to meaningful demo assets for gallery renders.

[HIGH] `tsconfig.json:15`: `npx tsc --noEmit` fails immediately because `baseUrl` is deprecated under the installed TypeScript version and no `ignoreDeprecations` is set. Add `"ignoreDeprecations": "6.0"` or migrate away from `baseUrl` so TypeScript can actually validate the repo.

[MEDIUM] `scripts/build-codex-review-sheets.py:25`: `clip_mid()` hardcodes `-ss 2.0` despite the script claiming to extract the clip mid-frame. This misrepresents clips with delayed reveals and any duration other than about four seconds. Use `ffprobe` to get duration and sample `duration * 0.5`, with an optional per-template override for late-reveal patterns.

[MEDIUM] `src/components/abhi/templates/AbhiCtaComment.tsx:433`: the handle text still uses `backgroundClip: "text"` plus `color: "transparent"`. This is the known Remotion headless Chromium failure mode that can render an opaque rectangle over text. Replace it with solid colored spans or a masked SVG/text approach that does not depend on CSS background clipping.

[LOW] Gallery media path checks: `CROSS-CREATOR-COMPARE.html` references 329 static media paths and none are missing; `ABHI-COMPARE.html` resolves all 23 source and replica MP4 pairs when evaluated with its actual component keys. No fix needed there.
