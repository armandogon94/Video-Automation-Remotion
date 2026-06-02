# Hyperframes vs. Remotion — A Fair, Open-Minded Engine Comparison

> Wave-9 · 2026-06-01 · Analysis only (no code changed). Companion to
> [BAKEOFF.md](../../../BAKEOFF.md), CLAUDE.md decision #6, and the existing
> deep-dive [C-hyperframes-capabilities.md](../C-hyperframes-capabilities.md).
>
> **This document deliberately does NOT pick a winner.** The user has asked for a
> genuine evaluation, not a rationalization for retiring the challenger. The goal
> is a decision *framework* plus a concrete spike so a real side-by-side can be
> judged on evidence rather than on a hunch.

---

## 0. TL;DR (the verdict-framework, not a verdict)

- **Today's reality:** all 122 production compositions are Remotion. Hyperframes
  carries 6 hand-written HTML templates and is used at ~10% of its capability
  (per `C-hyperframes-capabilities.md`). That asymmetry is the result of *where
  effort was spent*, **not** proof that either engine is better.
- **Where Hyperframes genuinely wins:** running arbitrary web-native HTML+GSAP/
  Three.js/Lottie/WAAPI **frame-accurately** (its frame-adapter is the headline
  architectural differentiator), hand-editable single-file artifacts, paste-and-
  render LLM/CodePen output, a 95-item registry of prebuilt blocks, lighter
  footprint, and Apache-2.0 licensing freedom.
- **Where Remotion genuinely wins:** the 122-template library + the OV1–OV12
  overlay registry, end-to-end typed props (zod) and snapshot tests, the
  `EditPlan` → `SpeakerOverlayScene` render target that already drives our
  auto-edit pipeline, `@remotion/captions`, and deterministic headless render
  with a mature ecosystem.
- **For the new talking-head + Tella-style layout-switching + over-speaker
  overlays + text-behind-speaker (alpha-matte) direction:** **Remotion is the
  better fit *given our current investment*** — the layer-stack, overlay
  registry, and EditPlan already exist and the matte path is a known Remotion
  pattern. **Hyperframes is NOT disqualified** — it can do alpha-matte
  compositing (WebM with transparency, GLSL/shader transitions, frame-accurate
  GSAP layout morphs) and may be *more ergonomic* for the smooth layout
  transitions specifically. The honest answer is **decide with the spike**, not
  before it.
- **Recommendation:** keep both for now; do not retire Hyperframes on a hunch.
  Run the single-scenario spike in §7. Re-evaluate against the §8 framework once
  the spike + Nate Herk's take (§9) are both in hand.

---

## 1. What each engine actually is (grounded in the files)

### Remotion (incumbent) — `src/`
- React/TSX components compiled by a bundler; every video is a `<Composition>`
  with a zod schema. Example: `SpeakerOverlayScene16x9.tsx` declares
  `speakerOverlayScene16x9Schema` with `.default()`ed fields so it renders
  standalone in Studio.
- Time model: pull-based. Each component reads `useCurrentFrame()` and computes
  its own state for that frame (`FloatingCaption.tsx` scans `wordTimings` per
  frame; `BrandLogoPopOverSpeaker.tsx` derives a `spring()` from `frame -
  enterFrame`). Remotion owns the clock and re-renders the React tree per frame.
- Composition surface: **122 compositions** (`src/compositions/`, 97+ files
  counted plus 9x16/16x9 pairs), a **12-entry over-speaker overlay registry**
  (`src/components/overlays/registry.ts`, OV1–OV12), reusable chassis molecules
  (`DarkSlateChassis16x9.tsx`), and an **auto-edit pipeline** (`src/autoedit/`)
  that emits a typed `EditPlan` consumed by `SpeakerOverlayScene{16x9,9x16}`.
- Node ≥ 20 OK.

### Hyperframes (challenger) — `hyperframes/`
- Plain HTML files with inline `<style>` + `<script>`; animation via GSAP
  (loaded from CDN), with documented adapters for anime.js, Lottie, Three.js,
  WAAPI, and CSS. Example: `templates/talking-head.html` is a single self-
  contained file — DOM, CSS, a paused GSAP timeline, and per-word `tl.to(...)`
  tweens keyed off `startSeconds`/`endSeconds`.
- Time model: push-based / seek. HF **pauses** every registered animation and
  calls its `seek(t)`-shaped API at `t = frame / fps` for each frame. This is
  the architectural inversion of Remotion: instead of the engine owning the
  clock and re-rendering React, HF lets any library own its own timeline and
  forces it to a deterministic frame via `timeline.totalTime(frame/fps)`,
  `goToAndStop`, `mixer.setTime`, `hf-seek` events, etc.
- Generation model: our `hyperframes/scripts/generate.ts` does **string
  templating** — it reads `templates/<name>.html`, replaces `{{TITLE}}`,
  `{{WORD_TIMINGS_JSON}}`, `{{DURATION_SECONDS}}`, etc., writes `index.html`,
  then shells out to the `hyperframes render` CLI. Shared with Remotion: TTS,
  Whisper, and `exportMultiPlatform`/`normalizeAudio` from `src/ffmpeg/`.
- Capability surface available but unused: a **95-item registry** (18 caption
  styles, 14 GLSL shader transitions, VFX/3D blocks, maps, social cards),
  `data-composition-variables` theming, Tailwind-v4 browser runtime, WebM-with-
  transparency output. Per the C-doc we ship essentially none of it.
- Node 24 required (`hyperframes/.nvmrc` = `24.14.0`).

---

## 2. Balanced comparison table (criteria × engine)

Scoring is qualitative: **W** = clear advantage, **=** = roughly even, with a
short why. No criterion is weighted yet — weighting happens in §8 against the
actual roadmap.

| # | Criterion | Remotion | Hyperframes | Notes |
|---|---|---|---|---|
| 1 | **Existing investment** | **W** | — | 122 comps, OV1–OV12 registry, chassis, EditPlan, tests. Hyperframes has 6 hand-written templates. Sunk cost, but real leverage. |
| 2 | **Programmatic composition / data-driven** | **W** | = | Remotion compositions are functions of typed props; the `overlays` array maps registry entries by name. HF can do data-driven via `data-composition-variables` but we template strings today. |
| 3 | **Type safety / prop discipline** | **W** | — | zod schemas end-to-end (`floatingCaptionSchema`, `editPlanWordSchema`); molecules self-validate. HF passes untyped `{{...}}` string substitution. |
| 4 | **Web-native / no-bundler authoring** | — | **W** | HF is literally an HTML file. Open it in a browser, it runs. No React, no JSX, no build step. |
| 5 | **Hand-editability of a single artifact** | = | **W** | A Hyperframes template is one readable file (DOM+CSS+GSAP). Remotion edits are spread across component + schema + registry + brand tokens. |
| 6 | **GSAP timeline ergonomics** | = | **W** | `gsap.timeline()` with `.from()`/`.to()` and named eases (`back.out(1.6)`) is more concise for sequenced motion than per-frame `interpolate()`/`spring()` math. HF makes GSAP render *frame-accurately*. |
| 7 | **Animation feel / physics** | **W** | = | Remotion `spring()` gives natural physics out of the box; GSAP eases are expressive but you pick curves manually. Different aesthetic, not strictly better. (BAKEOFF.md §2 calls this out as a *visual* judgement.) |
| 8 | **Paste LLM / CodePen / v0 output** | — | **W** | Claude/v0/CodePen emit HTML+CSS+GSAP. HF runs it as-is; Remotion needs every idiom translated to JSX. |
| 9 | **Prebuilt component breadth** | = | **W** | HF registry: 95 items (18 caption styles, 14 GLSL shaders, VFX/3D, maps, social). Ours: 122 *bespoke* comps — broader for *our* aesthetic, narrower for off-the-shelf effects. |
| 10 | **Captions** | **W** | = | `@remotion/captions` + our `FloatingCaption`/`EditorialCaption` register palettes (ADR-002) are battle-tested. HF has 18 registry caption styles we haven't wired up. |
| 11 | **3D / WebGL / Lottie / shaders** | = | **W** | HF's frame-adapter makes Three.js/Lottie/WAAPI/GLSL render deterministically — "libraries that own their own clock" that Remotion can't drive frame-perfectly per the C-doc. Remotion can do Three via `@remotion/three` but it's more work. |
| 12 | **Deterministic headless render** | **W** | = | Both deterministic. Remotion's is mature and what our pipeline assumes. HF's BeginFrame mode is byte-reproducible but **only on Linux+Docker**; macOS uses screenshot mode (BAKEOFF runs are macOS). |
| 13 | **Snapshot / unit testing** | **W** | — | vitest snapshot tests + `src/autoedit/autoedit.test.ts`. HF has `lint`+`inspect` but no composition unit-test story in our setup. |
| 14 | **Auto-edit / EditPlan render target** | **W** | — | `EditPlan` → `SpeakerOverlayScene` (overlayTrack/captionTrack/segments) is built and tested in Remotion. No HF equivalent exists. |
| 15 | **Render-time footprint** | = | **W** (lighter) | Both download chrome-headless-shell (~90MB). Remotion adds the React/bundler toolchain; HF is closer to "HTML + a renderer CLI." |
| 16 | **Licensing** | = | **W** | Remotion: free for individuals <$1M rev (company license otherwise). HF: **Apache 2.0** — no per-render fees, clean for white-label/marketplace if Armando Inteligencia commercializes. |
| 17 | **Runtime / maintenance fit** | **W** | — | Remotion runs on the project's Node 22 LTS; HF forces a **Node-24 split** (`.nvmrc`), an `nvm use` step, and dual `npm install`/dependency trees. |
| 18 | **Transparency / alpha output** | = | **W** | HF can emit **WebM with alpha** (`--format webm` is "the only format with transparency"). Relevant to matte work (§5). Remotion can render alpha too but our pipeline targets MP4. |

**Tally is intentionally not summed.** A raw count favors Remotion, but that
mostly reflects #1/#13/#14 (our investment) — which a fair reading must *weight
against the roadmap*, not treat as innate superiority. On the axes that are
purely about the *engine* (4, 5, 6, 8, 11, 15, 16, 18) Hyperframes leads.

---

## 3. Where Hyperframes may be genuinely better (concrete tasks)

Not hand-waving — each tied to a task we plausibly hit:

1. **Dropping in a one-off creative effect from an LLM or CodePen.** Ask Claude
   for "a glitchy RGB-split title reveal in GSAP," paste the HTML into a HF
   template, render. In Remotion you'd re-author it as a component with
   `interpolate`/`spring`. *HF wins for prototyping novel motion fast.*
2. **GSAP-sequenced motion.** A timeline with staggered `.from()`/`.to()` and
   named eases (see `talking-head.html`'s opener) is terser than the equivalent
   per-frame interpolation. *HF wins for "this then this then this" choreography.*
3. **3D / shader / Lottie.** `vfx-iphone-device` (real GLTF + HTML-in-canvas),
   14 GLSL transitions (`whip-pan`, `chromatic-radial-split`), After-Effects
   Lottie exports — all render frame-accurately via the adapter. *HF wins for
   GPU/3D-heavy moments.*
4. **Audio-reactive / beat-sync intros.** Pre-sample amplitude, key animation off
   `amplitudes[floor(t*fps)]` on `hf-seek`. Clean in HF; awkward in Remotion.
5. **Hand-tweaking a single video.** One self-contained HTML file is editable by
   a human (or an agent) without touching a component graph, schema, and
   registry. *HF wins for bespoke, one-shot videos.*
6. **Commercial/white-label freedom.** Apache 2.0 removes the Remotion company-
   license question entirely if this ever ships as a product.

---

## 4. Where Remotion is genuinely better (concrete tasks)

1. **Anything templated/parametrized at scale.** 122 typed compositions +
   OV1–OV12 registry mean new branded videos are *prop changes*, not new files.
2. **The auto-edit pipeline.** `src/autoedit/` analyzes a talking-head, emits an
   `EditPlan` (typed, dual-unit seconds+frames, tracks for segments/captions/
   overlays), and `SpeakerOverlayScene` renders it. This is a real, tested,
   data-driven render target with no HF counterpart.
3. **Caption maturity.** `@remotion/captions` + our register-palette idiom
   (`FloatingCaption`'s punchy/editorial/technical) is proven across the library.
4. **Correctness guarantees.** zod prop validation + vitest snapshots catch
   regressions before render. The string-substitution HF generator has no such
   net (a malformed `{{ITEMS_JSON}}` fails at render, not at author time).
5. **Reusable chassis composition.** `DarkSlateChassis16x9` (watermark + handle
   chip + caption-pill slot) is shared structure; HF duplicates caption styling
   across 5 HTML files (BAKEOFF.md "Known issues" flags this as tech debt).

---

## 5. The new direction: talking-head + layout-switching + over-speaker overlays + text-behind-speaker

This is the decision that actually matters. Break it into its four hard parts.

### 5a. Over-speaker overlays
- **Remotion is ahead today.** This is exactly what `SpeakerOverlayScene16x9.tsx`
  + the OV1–OV12 registry were built for: base video → overlay slot → caption,
  with overlays mounted by name from a data array (the EditPlan `overlayTrack`).
  It exists, is typed, and is tested.
- **Hyperframes could do it** (extra absolutely-positioned `class="clip"`
  elements on their own `data-track-index`, GSAP-animated), but we'd be
  rebuilding 12 molecules + a registry-equivalent from scratch.
- **Edge:** Remotion, decisively, because of investment.

### 5b. Tella-style smooth animated layout switching
- The hard part is *interpolating between layouts* (full-frame speaker →
  speaker-in-corner + content, with everything easing simultaneously).
- **GSAP is arguably more ergonomic for this specific task.** Animating
  `width`/`x`/`borderRadius`/`scale` of a speaker element along a timeline with a
  shared ease is GSAP's sweet spot, and HF renders it frame-accurately. The
  `talking-head.html` opener already shows the idiom (`back.out`, `power2.out`).
- **Remotion can do it** with `spring()`/`interpolate()` per layout property,
  but coordinating many properties across a transition is more verbose.
- **Edge:** lean Hyperframes on *ergonomics*; lean Remotion on *fits-existing-
  pipeline*. This is the strongest single reason to actually run the spike.

### 5c. Text-behind-speaker (alpha-matte compositing)
- The effect: a caption/graphic layer sits **behind** the speaker, with the
  speaker's silhouette (alpha matte / segmentation) cut out so they appear to
  stand in front of the text. Requires compositing a foreground alpha layer over
  a mid layer.
- **Remotion path:** layer the matte foreground over the caption layer in the
  existing `AbsoluteFill` stack; the matte itself comes from a per-frame alpha
  asset (segmented WebM/PNG sequence) or `OffthreadVideo` + CSS mask. The
  layer-stack discipline in `SpeakerOverlayScene` already supports inserting
  layers between base and caption.
- **Hyperframes path:** equally feasible — stack `class="clip"` divs by
  `data-track-index`, use a transparent **WebM** foreground (HF lists WebM as the
  only transparency-capable output, and can *consume* alpha video the same way),
  or CSS `mask-image`. Per-frame matte assets are just media clips HF seeks.
- **Key honest caveat for BOTH:** neither engine *generates* the alpha matte —
  that's an upstream segmentation step (e.g. a rotoscoping/matting model or a
  green-screen key in FFmpeg). Both engines only *composite* the resulting
  layers. So this is **not** a differentiator between them; it's an upstream
  asset-pipeline problem.
- **Edge:** roughly even on capability. Remotion wins on "it slots into the
  layer stack we already have"; HF wins on "WebM-alpha + frame-seek is native."

### 5d. Per-frame video assets (B-roll, segmented speaker, matte sequences)
- Both handle video clips deterministically. Remotion: `OffthreadVideo`. HF:
  `<video class="clip">` with `data-media-start`/`data-volume` (and the C-doc
  warns NOT to call `video.play()` or animate `<video>` dims directly — animate a
  wrapper). Even.

**Net for the new direction:** **Remotion is the recommended engine *now*** —
overlays (5a) and the auto-edit render target are already there, layout-switching
(5b) is achievable, and matting (5c) is an upstream problem either way. **But the
recommendation is conditional**: if the spike shows GSAP layout morphs (5b) are
dramatically nicer to author and the matte composites cleanly in HF, a *hybrid*
(HF for bespoke layout-morph hero shots, Remotion for the templated bulk) is a
legitimate outcome. Do not foreclose it.

---

## 6. Cost of keeping both vs. consolidating

### Cost of keeping both
- **Node split:** Remotion on Node 22 LTS, Hyperframes pinned to Node 24
  (`.nvmrc`). Every HF run needs `nvm use 24`; CI/scripts must branch. Friction,
  not a blocker.
- **Dual dependency trees:** two `npm install`s, two `node_modules`, two lockfiles
  (HF's `package-lock.json` is 126KB).
- **Duplicated styling:** caption colors/spacing live in 5 HTML files (BAKEOFF.md
  flags it) AND in the Remotion register palettes. Brand drift risk between
  `brand/` and `hyperframes/brand/` (BAKEOFF.md §4).
- **Cognitive load:** two mental models (pull/React vs. push/seek), two CLIs.

### Cost of consolidating (either direction)
- **Drop Hyperframes:** delete `hyperframes/`, remove `.gitignore`/README refs
  (BAKEOFF.md §"Picking a winner"). Lose the frame-adapter escape hatch for
  3D/shader/LLM-paste work. Lowest immediate maintenance.
- **Drop Remotion:** delete `src/Root.tsx`, `src/compositions/`, `src/components/`
  — i.e. **throw away 122 comps + OV registry + EditPlan + tests.** Keep the
  Python TTS/Whisper + FFmpeg tooling. Enormous re-implementation cost. Not
  credible today on effort grounds alone.

### Honest middle path
Keeping both is cheap *as long as Hyperframes stays a thin experiment*. The cost
balloons only if we start maintaining a *parallel template library* in HF. So the
real question §8 must answer is: **"do we invest in HF, freeze it as an escape
hatch, or retire it?"** — three options, not two.

---

## 7. Proposed apples-to-apples SPIKE (spec only — do NOT build yet)

**Goal:** replicate ONE representative piece in Hyperframes that already exists in
Remotion, render both, and judge side-by-side on authoring effort + visual result.

**Chosen piece:** an **over-speaker caption + a single over-speaker logo pop**,
i.e. replicate `FloatingCaption` (karaoke, editorial register) + the behavior of
`BrandLogoPopOverSpeaker` (OV11: fade+scale a wordmark in beside the speaker, hold,
fade out) over a placeholder dark backdrop. This exercises the three things that
matter for the new direction: per-word caption timing, an over-speaker overlay,
and the layer stack — without needing a real matte asset.

**Why this piece:** it's small, it's directly comparable (Remotion version is in
`src/components/FloatingCaption.tsx` + `overlays/BrandLogoPopOverSpeaker.tsx`), and
it touches the exact ergonomics we care about (per-frame word tinting + a timed
enter/hold/exit overlay).

**Exact steps (for the implementer, later):**
1. **Branch + Node.** `git checkout -b spike/hf-overspeaker-caption`; `nvm use 24`
   in the `hyperframes/` shell.
2. **Pick the fixture.** Reuse an existing `word_timings_final.json` from a prior
   bake-off run (same Whisper timings both engines consumed) so the comparison
   isolates the *render*, not the timings. If none exists, run the shared TTS+
   Whisper once and save it.
3. **Author the HF template** `hyperframes/templates/overspeaker-spike.html`
   (NEW file — does not touch existing templates):
   - Dark-slate `#0F1B2D` full-frame backdrop (`class="clip"`,
     `data-track-index="1"`) to mirror the Remotion placeholder.
   - Caption container (`data-track-index="5"`); inject one `<span class="word">`
     per timing in the inline script (the existing `talking-head.html` already
     shows this exact loop).
   - GSAP timeline: per word, `tl.to('#word-i', {color: editorialActive}, w.start)`
     and back to past/future tint — port the `FloatingCaption` punchy/editorial/
     technical palette so colors match.
   - A wordmark element (`data-track-index="6"`) anchored RIGHT; GSAP
     fade+scale-in (`0.9→1.0`, ~6 frames, `back.out`), hold ~54 frames, fade out
     — mirroring `BrandLogoPopOverSpeaker`'s timing constants.
   - Register the timeline on `window.__timelines['main']` (lint requires it).
4. **Wire the generator (minimal).** Either add `overspeaker-spike` to the
   template switch in a COPY of `hyperframes/scripts/generate.ts`, or hand-fill
   the `{{WORD_TIMINGS_JSON}}`/`{{DURATION_SECONDS}}` placeholders for the spike
   so no shared script changes. (Spike = throwaway; keep it out of the committed
   generator.)
5. **Lint + render.** `npm run lint` (fix any `class="clip"` / unregistered-
   timeline errors), then `hyperframes render -o output/spike-hf.mp4 --fps 30`.
6. **Render the Remotion twin.** `npm run render -- --comp SpeakerOverlayScene16x9
   --props <fixture-with-same-timings + one BrandLogoPopOverSpeaker overlay> --out
   output/spike-remotion.mp4`.
7. **Compare and record** (write findings into a `SPIKE-RESULTS.md`, NOT this doc):
   - **Authoring effort:** lines touched, files touched, time-to-first-render,
     how many lint/iteration loops.
   - **Visual:** caption sync vs. the shared timings, motion feel (GSAP ease vs.
     Remotion spring), font/brand match, legibility over the backdrop.
   - **Render time + filesize** for the identical 5s clip.
   - **Subjective:** which was nicer to *edit by hand* afterward.

**Out of scope for the spike (deliberately):** real talking-head footage, true
alpha matting (needs upstream segmentation), and layout-switching — those are the
*next* spike if this one is encouraging. Keep this one cheap.

**Decision value:** the spike directly fills the unknowns in §2 rows 5/6/7 and
§5b — it's the only honest way to settle the GSAP-ergonomics-vs-React-discipline
question for *our* hands.

---

## 8. Decision FRAMEWORK (apply after the spike + Nate Herk's take)

Do **not** decide on a hunch. Decide when these are answered:

1. **Did the spike show a meaningful authoring-ergonomics gap?** (Effort/files/
   iteration loops, §7 step 7.) If HF was *dramatically* faster to author the
   layout-morph/over-speaker motion → that's a real point for HF on the new
   direction. If it was a wash → investment (Remotion) wins.
2. **Does the roadmap need 3D/shaders/Lottie/LLM-paste?** If yes and often → HF's
   frame-adapter is a genuine, hard-to-replicate advantage → keep HF (at least as
   an escape hatch). If rarely → that advantage rarely fires.
3. **Will this ever commercialize?** If a templates marketplace / white-label is
   plausible → Apache-2.0 (HF) materially de-risks licensing. If purely personal
   → Remotion's individual license is fine.
4. **Can we tolerate the Node-24 split + dual maintenance?** For a single-dev
   local tool, "yes, if HF stays thin" is acceptable; "no" pushes toward
   consolidation.
5. **What does Nate Herk recommend, and does our context match his?** (§9 — fold
   in once available.)

**The three live outcomes (not two):**
- **(A) Consolidate on Remotion.** Justified if the spike is a wash AND the
  roadmap rarely needs 3D/shaders/paste AND no commercial plan. Cheapest
  maintenance; loses the escape hatch.
- **(B) Keep both — Remotion primary, Hyperframes as a thin escape hatch** for
  3D/shader/LLM-paste/bespoke one-offs. Justified if (2) or (3) is "yes" but the
  spike doesn't dethrone Remotion for the templated bulk. Accepts the Node-split
  cost in exchange for optionality.
- **(C) Hybrid by scenario.** Remotion for the 122-template bulk + auto-edit;
  Hyperframes specifically for layout-morph hero shots / 3D moments. Justified
  only if the spike shows HF is *clearly* better at 5b AND we're willing to
  maintain two render targets in the pipeline.

Retiring Hyperframes "on a hunch" (the user's explicit anti-goal) is **not** a
listed outcome — every path above is evidence-gated.

---

## 9. Nate Herk's take (fold in from `references/creators/nateherk/ANALYSIS.md` once available)

> **PLACEHOLDER FOR THE MAIN SESSION TO MERGE.**
>
> A sibling agent is analyzing Nate Herk's videos, which reportedly include his
> own Remotion-vs-Hyperframes-with-Claude-Code recommendations. As of this
> writing, `references/creators/nateherk/ANALYSIS.md` does **not exist yet** (the
> `nateherk/` folder currently holds only downloaded video shortcode dirs:
> `Aw3BkmhYu4I`, `ZNbgOhxhzXg`, `eRS3CmvrOvA`, `jZgcWCzxh1I`, `q5lg3npxjAc`,
> `tDGiWn0flK8`).
>
> When that ANALYSIS.md lands, fold its recommendation into the §8 framework as
> input #5. Specifically capture:
> - Which engine Nate recommends pairing with Claude Code, and **why** (authoring
>   speed? paste-from-LLM? determinism? his audience/use-case).
> - Whether his use-case matches ours (talking-head + overlays + Spanish content
>   + local-only macOS) or differs (so we weight his take accordingly).
> - Any concrete gotcha he hit that our spike (§7) should also check.
>
> Until then, treat §0–§8 as standing on the *local code evidence* only; Nate's
> take is an external data point, not a tiebreaker, and our context may diverge
> from his.

---

## 10. Sources (all local, this repo)

- `BAKEOFF.md` — dual-engine workflow, shared flags, "Picking a winner", known issues.
- `CLAUDE.md` decision #6 — bake-off-over-engine-choice rationale.
- `docs/research/C-hyperframes-capabilities.md` — frame-adapter mechanism, 95-item
  registry, WebM-alpha, determinism rules, "when HF beats Remotion" (5 cases).
- `hyperframes/templates/talking-head.html` — HF authoring model (DOM+CSS+paused
  GSAP timeline + per-word tweens).
- `hyperframes/scripts/generate.ts` — string-substitution generation, shared
  TTS/Whisper/FFmpeg, Node-24 pinning.
- `hyperframes/.nvmrc` (24.14.0), `hyperframes/package.json` (hyperframes 0.6.7,
  Apache 2.0), `hyperframes/brand/config.json`.
- `src/compositions/SpeakerOverlayScene16x9.tsx` — layer stack + overlay slot +
  EditPlan overlayTrack target.
- `src/components/FloatingCaption.tsx` — per-frame karaoke caption, register
  palettes (ADR-002).
- `src/components/overlays/registry.ts` + `BrandLogoPopOverSpeaker.tsx` — OV1–OV12
  over-speaker overlay system.
- `src/components/chassis/DarkSlateChassis16x9.tsx` — reusable chassis molecule.
- `src/autoedit/editPlan.ts` — typed EditPlan render contract.
