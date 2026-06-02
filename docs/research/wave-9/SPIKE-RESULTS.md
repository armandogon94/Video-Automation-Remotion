# SPIKE RESULTS — Hyperframes vs. Remotion (over-speaker caption + logo-pop)

> Wave-9 · 2026-06-01 · The apples-to-apples spike specified in
> [HYPERFRAMES-VS-REMOTION-FAIR-COMPARISON.md §7](./HYPERFRAMES-VS-REMOTION-FAIR-COMPARISON.md).
> Companion to [BAKEOFF.md](../../../BAKEOFF.md) and CLAUDE.md decision #6.
> This document records evidence; the engine decision framework is §8 of the
> fair-comparison doc.

---

## 0. TL;DR

- **Both engines rendered successfully** from the **same shared word-timings
  fixture**, producing byte-comparable 1920×1080 / 30fps / 4.5s / h264 MP4s.
- **Visually they are near-indistinguishable** — same backdrop, same editorial-
  register karaoke caption (cyan active word), same right-anchored "AI Factory"
  logo pop with the gold letter-reveal sweep, same handle chip. (Frame compares
  in §4.)
- **Hyperframes DID misbehave in exactly the way Nate Herk warned about** — its
  HTML-discovery model fired a blocking-class `multiple_root_compositions` lint
  error because the committed `index.html` coexists with the spike file, plus
  repeated `404 Not Found` resource errors and a caption-exit-hard-kill warning
  during capture. None broke *this* render (no audio track), but they are real
  friction and map directly to his "HTML-based previews misbehave" complaint.
- **Authoring effort was a wash on raw size (~205 HF LOC vs. ~30 lines of props
  JSON for Remotion)** — but ONLY because Remotion's `FloatingCaption` +
  `BrandLogoPopOverSpeaker` + `SpeakerOverlayScene16x9` **already existed**. The
  spike re-implemented in one HF file what Remotion already ships as tested,
  typed, reusable molecules. That asymmetry is the whole story.
- **Render time favored Remotion** (~11.2s wall vs. ~22.3s for HF) on this
  machine, though both are trivially fast for a 4.5s clip and the gap is
  dominated by fixed browser/bundler startup, not per-frame cost.
- **Recommendation: Outcome (B) — Remotion primary, Hyperframes as a thin escape
  hatch.** The spike did **not** show a meaningful authoring-ergonomics gap that
  would dethrone Remotion for the templated bulk; it reconfirmed Remotion's
  reliability edge; but it also confirmed HF can match the visual output
  faithfully and remains valuable for LLM-paste / 3D / shader one-offs.

---

## 1. What was built (spike artifacts)

| Artifact | Path | Purpose |
|---|---|---|
| Shared fixture | `hyperframes/overspeaker-spike.timings.json` | 9 words ("La mejor manera de predecir el futuro es crearlo."), 30fps, absolute frames + seconds. The single source of truth both engines consume. |
| HF spike template | `hyperframes/overspeaker-spike.html` | NEW throwaway file. Dark-slate backdrop + editorial karaoke caption + right-anchored logo pop, GSAP per Hyperframes idiom. Does NOT touch existing templates or the generator. |
| HF render | `hyperframes/output/spike-hf.mp4` (gitignored) | 221 KB · 1920×1080 · 135 frames · 4.5s |
| Remotion props | `output/spike-remotion-props.json` (gitignored) | Same fixture as `caption.wordTimings` (register `editorial`) + one `BrandLogoPopOverSpeaker` overlay keyed to frame 74. |
| Remotion render | `output/spike-remotion.mp4` (gitignored) | 312 KB · 1920×1080 · 135 frames · 4.5s |
| Compare frames | `output/spike-frames/{hf,remotion}-f{30,80}.png` (gitignored) | Frame 30 (caption-only, "manera" active) + frame 80 (logo pop settled, "futuro" active). |

**Constraint compliance:** only the four allowed paths were created. No existing
HF template, no `scripts/generate.ts`, no `src/`, and no `Root.tsx` were touched.
The fixture is consumed unchanged by both engines so only the render engine differs.

---

## 2. Reliability — did Hyperframes misbehave? (the Nate Herk question)

**Yes, in the predicted way — but it still rendered.** Concretely, during
`hyperframes render -c overspeaker-spike.html`:

1. **`multiple_root_compositions` (lint ERROR, not warning).** Because the repo's
   committed `hyperframes/index.html` carries a `data-composition-id` AND the
   spike file does too, HF's runtime flagged: *"Multiple root-level HTML files
   with data-composition-id … The runtime may discover both as entry points,
   causing duplicate audio playback."* It continued (lint errors don't block
   without `--strict`), but this is a **structural fragility of HF's
   file-discovery model**: there is no first-class "render this one file in
   isolation" without the project's other root HTML files interfering. This is
   the architectural root of Nate Herk's complaint — *"HTML-based … it has a
   problem sometimes"* — and it cost the spike a real head-scratch (the `lint`
   subcommand only accepts a directory and validates `index.html`, so the spike
   file can't be linted standalone at all).

2. **Repeated `404 Not Found` non-blocking resource errors** during frame
   capture (5×). Benign here (likely a probe for an absent favicon / default
   asset), but it is exactly the kind of noisy, hard-to-attribute console output
   that makes HF renders feel less trustworthy than Remotion's clean progress.

3. **`caption_exit_missing_hard_kill` (warning).** HF explicitly warns that
   karaoke word-level tweens can conflict with caption exit tweens and "leave
   captions stuck on screen," prescribing a manual `tl.set(..., {opacity:0,
   visibility:hidden})` kill. This is a **known GSAP-seek footgun** that Remotion's
   pull-based per-frame model cannot have by construction (each frame is computed
   fresh; nothing can get "stuck").

**Remotion, by contrast, rendered clean** — no lint layer, no resource 404s, no
stuck-state warnings, a single deterministic progress stream. This reconfirms
§2-row-12 and Nate Herk's load-bearing reliability point: **Remotion is the more
reliable engine in practice; HF's HTML/seek model introduces failure modes
Remotion structurally cannot have.**

> Note: the spike had **no audio track**, so the most-cited HF preview bug
> (`0 seconds out of 0 seconds`, duplicate audio) could not fully manifest — but
> the `multiple_root_compositions` error is the *same root cause* and it did fire.

---

## 3. Authoring effort

| Metric | Hyperframes | Remotion |
|---|---|---|
| Files authored for the spike | 2 (`.html` + `.timings.json`) | 1 props JSON (components pre-existed) |
| Lines authored | ~205 (full self-contained HTML: DOM + CSS + GSAP) | ~30 (props JSON only) |
| Components reused | 0 (everything hand-written in the one file) | 3 (`FloatingCaption`, `BrandLogoPopOverSpeaker`, `SpeakerOverlayScene16x9`) |
| Type safety at author time | none (untyped DOM + literal JS object) | full (zod schemas validate `caption` + overlay props) |
| Iteration loops to first good render | 1 (after discovering `-c` flag; `lint` rejects a file path) | 1 |
| Time to first render | ~minutes (write whole HTML by hand) | ~minutes (write props; recall registry key + enterFrame) |

**Honest read:** the raw LOC gap (205 vs. 30) is *not* evidence that Remotion is
easier to author **in general** — it is evidence that **we have already paid the
authoring cost in Remotion** (the molecules exist, typed and tested) and have
**not** in HF. For a *brand-new, never-before-built* effect, the HF single-file
approach is genuinely competitive: one readable file, GSAP timeline semantics
(`tl.to(..., startSeconds)`) that map 1:1 onto word timings, and no schema/
registry/Root.tsx ceremony. The fair-comparison doc's §2-rows-5/6 (hand-
editability, GSAP ergonomics favor HF) **held up**: the HF file is the more
hand-editable single artifact, and sequencing the logo pop as
`fromTo(...) → letter sweep → to(opacity:0)` on a timeline read more naturally
than Remotion's `spring()` + `interpolate()` + per-glyph `interpolate()` math in
`BrandLogoPopOverSpeaker`.

But the spike also surfaced HF's author-time cost: **no type net.** A wrong key
in the inlined timings, a mistyped `data-track-index`, or a forgotten
`window.__timelines['main']` registration fails silently or at render, not at
author time — whereas Remotion's zod parse would have rejected a malformed
`caption` prop immediately. (§2-row-3 held up.)

---

## 4. Visual fidelity / feel

Frames extracted at identical indices from both 135-frame renders:

- **Frame 30** (`*-f30.png`) — caption-only beat, word "manera" active:
  - Both: dark-slate navy→deep-navy 135° gradient, muted "BASE VIDEO" label
    centered, karaoke line at bottom with **"manera" cyan** (editorial active),
    "La mejor" white (past), "de predecir el futuro es crearlo." dimmed (future),
    gold-bordered handle chip bottom-right. Logo correctly absent (pre-enter).
  - Difference: negligible. Remotion's past/future contrast reads a hair crisper;
    HF's active-word pop-scale is a touch more emphatic. Both on-brand.
- **Frame 80** (`*-f80.png`) — logo pop settled, word "futuro" active:
  - Both: same backdrop + label, **"AI Factory" wordmark right-anchored** mid
    gold letter-reveal sweep ("AI" gold, "Factory" white), caption with **"futuro"
    cyan**, handle chip. The OV11 fade+scale-in (0.9→1.0) landed in both.
  - Difference: the gold sweep is one glyph further along in one engine vs. the
    other (sub-frame timing of the per-letter stagger), and HF's logo sits a few
    px higher. Immaterial for the use-case.

**Feel:** GSAP eases (`back.out(1.6)` on the pop) vs. Remotion `spring()` give
*slightly* different motion character on the logo entrance, but at this scale the
difference is aesthetic preference, not quality — consistent with BAKEOFF.md §2
and fair-comparison §2-row-7 ("different aesthetic, not strictly better"). Nate
Herk's claim that HF output is "more sophisticated/engaging" did **not** reproduce
on *this* effect: for a simple caption + logo pop the two are visually equivalent.
His claim likely applies to the richer 3D/shader/liquid-glass work HF can do that
this spike deliberately did not exercise.

---

## 5. Render time + file size

| | Hyperframes | Remotion |
|---|---|---|
| Wall-clock render | **~22.3s** (12.4s user + 6.9s sys) | **~11.2s** total |
| Output size | **221 KB** | **312 KB** |
| Dimensions / fps / frames | 1920×1080 · 30 · 135 | 1920×1080 · 30 · 135 |
| Codec / duration | h264 · 4.5s | h264 · 4.5s |
| Workers | 4 (auto, 10 cores) | Remotion default concurrency |

Remotion was ~2× faster wall-clock on this clip; HF produced a ~30% smaller file
(different default CRF/bitrate — both pre-`exportMultiPlatform`, which would
normalize them anyway). At 4.5s neither time is meaningful; the gap is fixed
startup (HF spins Chrome workers + inlines the CDN GSAP; Remotion bundles once).
For long renders the per-frame cost (not measured here) would dominate.

---

## 6. Hand-editability

- **Hyperframes wins this axis, as predicted.** Tweaking the logo color, the
  caption active tint, the pop timing, or the wordmark text is a one-line edit in
  a single self-contained file you can open in any browser. No build, no schema,
  no Root.tsx. This is the genuine HF strength (§2-row-5).
- **Remotion edits are spread** across the molecule (`BrandLogoPopOverSpeaker.tsx`),
  the caption molecule (`FloatingCaption.tsx`), the scene (`SpeakerOverlayScene16x9`),
  the registry, and the props JSON — but each is typed and reusable across 122
  compositions. You trade single-file convenience for systemic leverage.

---

## 7. Recommendation (feeds fair-comparison §8)

**Outcome (B): keep both — Remotion primary, Hyperframes as a thin escape hatch.**

Grounded in the spike against the §8 decision questions:

1. **Authoring-ergonomics gap?** *No meaningful gap for our templated work.* HF's
   single-file + GSAP ergonomics are genuinely nicer for a **brand-new one-off**,
   but Remotion already owns the over-speaker caption + OV11 logo pop as typed,
   tested, reusable molecules — so for the actual roadmap (overlays at scale on
   talking-head footage), the investment wins. The spike was, on effort, a wash
   that tilts to Remotion once you count what already exists.
2. **Reliability?** *Remotion, decisively.* HF reproduced the predicted misbehavior
   (`multiple_root_compositions` blocking-class error from coexisting root HTML,
   404 noise, a caption-stuck-state warning). Remotion rendered clean. This is the
   single most important spike finding and it matches Nate Herk's first-hand take.
3. **Visual fidelity?** *Even on this effect.* HF faithfully matched the brand
   look; the "more sophisticated" HF advantage Nate cites did not show up on a
   simple caption + logo pop and would need a 3D/shader spike to test.
4. **When does HF earn its keep?** Exactly the cases this spike excluded:
   LLM/CodePen paste, GSAP-sequenced bespoke motion, 3D/shaders/Lottie, WebM-alpha.
   Both Nate Herk (§3) and Jack/itsjack (§4) independently recommend HF for those
   *motion-graphic-insert* jobs — and both also note HF "isn't good at fully
   replacing an entire editor." That is precisely the escape-hatch role.

**Do NOT consolidate on Remotion (Outcome A) yet**, and do NOT retire HF on a
hunch — the escape-hatch value (3D/shader/paste) is real and untested here, and
the Node-24 split is tolerable while HF stays thin. **Do NOT go full hybrid
(Outcome C)** — the spike gave no evidence HF is *clearly better* at the layout-
morph hero shots that hybrid would require; that needs the §7 "next spike"
(Tella-style layout switching), which this one deliberately deferred.

**Next spike (if pursued):** the layout-morph / text-behind-speaker (alpha-matte)
case — the only place §5b suggested HF's GSAP layout interpolation might decisively
out-author Remotion's per-property `interpolate()`. Until then, Remotion is the
default and HF is the escape hatch.

---

## 8. Output paths (all gitignored under `output/` except the two committed spike inputs)

- HF render: `hyperframes/output/spike-hf.mp4`
- Remotion render: `output/spike-remotion.mp4`
- Remotion props: `output/spike-remotion-props.json`
- Compare frames: `output/spike-frames/hf-f30.png`, `hf-f80.png`, `remotion-f30.png`, `remotion-f80.png`
- Committed spike inputs: `hyperframes/overspeaker-spike.html`, `hyperframes/overspeaker-spike.timings.json`
