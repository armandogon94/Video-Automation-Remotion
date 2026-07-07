# FABLE.md — Deep Technical + Product Review & Fix Plan

> **Author:** Claude Fable 5 (claude-fable-5), 2026-07-02.
> **Reviewed at:** `main` @ `79b5006` (working tree clean).
> **Audience:** a Claude Opus session that will EXECUTE the fixes below. This document is
> written to be followed step-by-step without re-deriving anything. Every finding carries
> file:line citations, a concrete failure scenario, an exact fix, and a verification command.
> **Method:** everything marked **CONFIRMED** was verified by running a command (tsc, vitest,
> ffmpeg/ffprobe experiments in a scratchpad, git, grep) or by reading the exact cited lines.
> Everything marked **PLAUSIBLE** is a strong hypothesis that needs one check before fixing.
> Three ffmpeg bugs were **empirically reproduced** with disposable ffmpeg 8.1 runs (never
> touching repo files). Five parallel review agents + the orchestrator read ~40 source files
> end-to-end and grepped the full 110,312-line / 294-file TypeScript surface.

---

## HOW TO USE THIS DOCUMENT (instructions for Opus — read this first)

1. **Work phase by phase, task by task, in the order given** in "THE FIX PLAN" (§11).
   Tasks are ordered so that earlier tasks unblock verification of later ones.
2. **One atomic commit per task.** Use the commit message given in each task. Never combine
   tasks into one commit. Run the task's **Verify** block before committing; if verification
   fails, STOP on that task and investigate — do not proceed to the next task on top of a
   broken state.
3. **Do not refactor beyond what a task says.** Several findings are intentionally deferred
   or marked "do NOT do this now" — respect that.
4. **Hard constraints (violating any of these is failure):**
   - LOCAL-ONLY macOS Apple Silicon. Never add VPS/Traefik/systemd/Nginx/production-Docker
     anything. (Some legacy files violating this get DELETED in Phase 5 — that's the fix.)
   - FREE/LOCAL tooling only. Edge-TTS + faster-whisper stay. No required paid APIs.
   - All project memory stays in `.claude/` inside this project. Never write to `~/.claude/`.
   - Single-developer tool: prefer the simplest fix that works. No queues, no DI frameworks,
     no config systems.
   - Brand: navy `#1B3A6E`, gold `#D4AF37`, deep-navy `#0F1B2D`, cream `#FAF7F2`, Inter.
5. **Codebase invariants that are currently CLEAN — do not break them** (all grep-verified
   at zero violations; any PR that reintroduces one is a regression):
   - No `background-clip: text` / `WebkitBackgroundClip` / `WebkitTextFillColor` in code
     (headless Chrome renders it as an opaque rectangle — the project's #1 recorded gotcha).
   - No `Math.random()` / `Date.now()` / unseeded `new Date()` in composition render paths
     (only seeded/deterministic PRNGs: FNV-1a, mulberry32, hash01).
   - `<OffthreadVideo>` only, never `<Video>`, in render paths.
   - Composition ids match `[a-zA-Z0-9-]+`.
   - Zod v4 + Remotion defaultProps convention: content fields use `.default()` WITHOUT
     `.optional()` and Root.tsx supplies complete defaultProps; genuinely-new/optional fields
     use `.optional()` (never `.default()`-only for those). See the recorded gotcha at
     `src/autoedit/editPlan.ts:237` and `src/compositions/SpeakerOverlayScene9x16.tsx:27-28`.
   - No `._def` reflection on zod schemas (one `.shape` violation exists; Phase 5 removes it).
   - All subprocess calls use `execa` with ARRAY arguments (zero shell-string interpolation
     exists today — keep it that way).
   - Fonts load exactly once at module scope in `src/brand/fonts.ts` (imported for side
     effect at `src/Root.tsx:144`) — never add per-composition `loadFont` calls.
6. **Things you must NOT delete under any circumstances:** `references/creators/**` (scraped
   research data), `docs/research/**`, `.claude/memory.md` history (you may append/annotate,
   Phase 5 says exactly how), `brand/**`, anything under `output/` that a gallery HTML
   references (Phase 0 measures this first).
7. **Renders and scraping must never run concurrently** (`.claude/NEXT-STEPS.md:104` — the
   Google-Fonts fetch inside a render breaks when the network is saturated by scraping).

---

## 1. EXECUTIVE SUMMARY

### One-paragraph honest take

This is a strikingly healthy codebase by AI-session standards — 130 registered compositions,
zero `any`, zero lint-suppressions, tsc-clean (in the worktree), all recorded render gotchas
(background-clip, determinism, OffthreadVideo, Zod-v4 defaults) uniformly enforced with zero
live violations, and the autoedit data model (two-timeline EDL) is genuinely well designed.
But the health is **concentrated in the Remotion composition layer**, and the project's
actual PRODUCT — "script in, multi-platform videos out" — is broken at the last mile: the
multi-platform export stage crashes for `square` from every vertical template, silently
amputates ~68% of the frame for `tiktok`/`reels` from 16:9 masters, and ships non-standard
96 kHz audio in every export (all three empirically reproduced). Meanwhile the quality gates
are theater: `npm run lint` has never worked, `uv run pytest` runs zero tests through a venv
with a broken shebang, `npm run render` points at a file that never existed, and the "44
passing tests" are 22 tests run twice because vitest also globs a stale 9.9 GB worktree. The
docs describe an April codebase (the CLAUDE.md tree is ~60% fiction), the bake-off with
Hyperframes has been de-facto decided for a month but nobody wrote it down, and 102 commits
of June work exist on exactly one laptop. Fix the export layer, fix the gates, write down
the bake-off verdict, push a backup — then this is a genuinely strong foundation for the LLM
editing pass the roadmap wants.

### Top 5 things to fix NOW (all CONFIRMED)

1. **`exportMultiPlatform` crop math is wrong twice** — `square` export hard-fails for all
   9:16 masters (`crop=1920:1920` from a 1080-wide input → "Conversion failed!"), and
   `tiktok`/`reels` from a 16:9 master keep only the middle 607 px (~32%) of the frame.
   `src/ffmpeg/commands.ts:19-20,94-99`. → Task 1.1.
2. **Every export ships 96 kHz AAC audio** — `normalizeAudio`'s `loudnorm` upsamples
   internally and no `-ar` is set (`src/ffmpeg/commands.ts:58-64`; reproduced:
   `sample_rate=96000`). → Task 1.2.
3. **Backup: origin/main is 102 commits behind local main** — all June work (autoedit, 100+
   comps, liquid-glass) exists only on this laptop, next to 10 GB of removable worktrees.
   → Tasks 0.3, 0.4.
4. **The quality gates are fake** — broken `npm run lint` (no eslint config, unpinned
   transitive eslint 10, invalid `--ext` flag), broken `.venv` (shebangs point at the old
   `Documents/…` path; project moved to `Downloads/…`), no `vitest.config.ts` (tests run 2×
   via the stale worktree), broken `npm run render` script. → Tasks 0.1, 0.2, 0.5, 3.3.
5. **The 30 ms audio fades eat speech** — silence-trim keeps end exactly at `silence_start`
   with zero edge padding, so the fade-out added in commit `09172e4` attenuates the tail of
   the last word at every cut, and the fade-in ramps over the first 30 ms of the next word.
   FFMPEG-RULES-AUDIT.md rule 7's "N/A" verdict is wrong. → Task 2.1.

> **Visual addendum (2026-07-02):** a frame-level inspection of the actual renders was done
> after the code review — see §14. It confirmed two shipping visual defects the static review
> could not see: an overlay text collision in the production video and illegible captions
> over bright footage — plus visual proof that the whisper-verbatim caption bug (§4.10) and
> the HDR→SDR LUT correctness both show up exactly as predicted. §14's tasks V.1–V.4 are
> spliced into the phases.

### Top 5 higher-leverage bets

1. **Render platform variants natively instead of cropping a single master.** The repo
   already has 9:16 AND 16:9 variants of most templates — the entire crop-from-master bug
   class (top-fix #1) exists only because the pipeline renders once and crops. Rendering
   the right composition per platform makes exports composition-perfect. → Task 4.7.
2. **The LLM editing pass (`SuggestStrategy` seam) is genuinely unblocked** — packTranscript
   landed, the EDL contract is clean, and a local-first design (Claude Code session as the
   "LLM") fits the free/local constraint. This is the roadmap's real next feature. → §10.
3. **One `renderComposition()` helper kills ~30 files of copy-paste** — the
   bundle→selectComposition→renderMedia skeleton is pasted in 10 autoedit drivers + 21
   scripts + 3 in-file copies. Also make `bundleOnce` actually memoize (today
   `runStyledReel` webpack-bundles the identical entry twice, ~3 GB × 2, per run). → Tasks 4.2, 4.3.
4. **Test the ffmpeg command builders** — `buildTrimConcatFilter`, `buildMultiSourceConcatFilter`,
   `buildCombinedTranscript`, `exportMultiPlatform` are pure/pure-ish, load-bearing, exported…
   and have ZERO tests. Snapshot + ffprobe-assertion tests make every later fix safe. → Task 3.1/3.2.
5. **Close the bake-off: Remotion wins, archive Hyperframes.** Dormant since 2026-06-01, no
   `node_modules`, 2 commits ever, while the Remotion side grew 131 comps + autoedit. The
   carry cost (duplicated brand assets, duplicated caption styling, a second engine's docs)
   buys nothing. → Task 5.10 + §12.

---

## 2. VERIFIED ENVIRONMENT FACTS (baseline — re-check these before you start)

| Fact | Value | How verified |
|---|---|---|
| HEAD | `79b5006` on `main`, clean tree | `git status`, `git log` |
| origin/main | `575e16d` — **102 commits behind** local main | `git rev-list origin/main..main --count` → 102 |
| Worktrees | main + 3: `recursing-tu-dac74b` (9.9 GB, tip == main), `agent-a590da53…` (788 K, locked), `agent-ab34076a…` (253 M, locked) — `.claude/worktrees/` totals **10 GB** | `git worktree list`, `du -sh` |
| tsc (worktree, full node_modules) | **clean, 4.0 s** | `npx tsc --noEmit` |
| tsc (main checkout) | **14 errors**, all TS2307 missing-module — `node_modules` is a stale partial install (missing `@remotion/google-fonts`, `@remotion/transitions`, `@remotion/captions`, `@remotion/layout-utils`, `@remotion/lottie`, `d3-force`) | ran it |
| `npm test` | "6 files / 44 tests pass" — actually **3 files / 22 tests run twice** (no `vitest.config.ts`; default glob picks up `.claude/worktrees/recursing-tu-dac74b/src/autoedit/*.test.ts`) | `npx vitest list` |
| `uv run pytest` | broken: `.venv/bin/pytest` shebang → `/Users/…/Documents/…/.venv/bin/python3` (project moved to `Downloads/`); and there are **zero** Python test files anyway | ran it |
| `npm run lint` | fails before linting: no `eslint.config.*` anywhere, eslint 10.1.0 is an unpinned transitive hoist, `--ext` invalid under flat config | ran it |
| `npm run render` | broken: `src/pipeline/render.ts` does not exist and never existed | `git log --all -- src/pipeline/render.ts` empty |
| Compositions | **130** registered in `src/Root.tsx` (131 grep hits; 1 is inside a string literal at Root.tsx:1530) from 114 `.tsx` files; **zero unregistered files** | grep + `npx remotion compositions` (bundled + listed successfully from the worktree) |
| Codebase size | 110,312 TS/TSX lines, 294 files; largest: `src/Root.tsx` 4,281 lines | `wc -l` |
| `public/` (worktree) | **1.3 GB** — `public/matte` 924 MB + `public/autoedit` 393 MB — and Remotion **copies all of it on every `bundle()`** ("Copying public dir 1.3 GB" observed live) | ran `npx remotion compositions` |
| ffmpeg / node | ffmpeg 8.1 (Homebrew), node v24.14.0 | `ffmpeg -version`, `node --version` |
| Hyperframes | dormant: 2 commits ever (2026-05-29, 2026-06-01), no `node_modules`, 6 templates (docs say 5) | `git log -- hyperframes/` |

---

## 3. FINDINGS — ARCHITECTURE & MODULE BOUNDARIES

### 3.1 [HIGH] The two-engine bake-off is over in fact but not on paper
- **Location:** `hyperframes/` (whole dir), `BAKEOFF.md`, `CLAUDE.md:17-19`.
- **What's wrong:** Hyperframes has 2 commits ever (`e48cfbc` 2026-05-29, `5f665a0`
  2026-06-01 "apples-to-apples spike"), no installed `node_modules` (its documented commands
  cannot run today), no output dir, while the Remotion side accumulated 131 compositions,
  the entire autoedit subsystem, the abhi + cross-creator + liquid-glass families, and
  `.claude/memory.md` (2026-06-30) itself calls the branded Remotion library "our moat".
  Maintaining the challenger costs: duplicated brand assets (`brand/`, `public/brand/`,
  `hyperframes/brand/` — scratchpad gotcha #7), duplicated caption styling across 5–6 HTML
  templates, a second engine section in every doc, and cognitive overhead in every session.
- **Failure scenario:** an agent session "fixes captions" in Remotion; the Hyperframes copies
  silently rot further; a future bake-off run produces a strawman comparison.
- **Fix:** declare Remotion the winner (Task 5.10) and archive Hyperframes exactly per
  BAKEOFF.md:128's own recipe, preserved under a git tag. Full reasoning in §12.
- **Confidence:** CONFIRMED (git history, missing node_modules, doc reads).

### 3.2 [MEDIUM] `renderFromPlan.ts` is two modules in one file, and half its name lies
- **Location:** `src/autoedit/renderFromPlan.ts` (840 lines; lines 509–840 are the
  multi-source path).
- **What's wrong:** `renderMultiSourcePlan` takes NO `EditPlan` — its input is
  `{beats, wordsPerBeat, …}` (`renderFromPlan.ts:542-574`) and it hand-builds scene props
  (lines 776–789) bypassing `buildSceneProps` entirely. The single-source and multi-source
  paths duplicate the stage-2 render block (see 6.4) and will drift (the per-segment `grade`
  already exists only on the single-source side).
- **Fix:** in Phase 4 (after the correctness fixes land with tests), split into
  `renderFromPlan.ts` (single-source, EditPlan-driven) and `renderReel.ts` (multi-source),
  both delegating stage 2 to the shared `renderComposition()` helper (Task 4.3). Do NOT do
  this split before the Phase 2 correctness fixes — you'd be fixing bugs in a moving file.
- **Confidence:** CONFIRMED (read the full file).

### 3.3 [MEDIUM] Staged render intermediates live inside the source tree (`public/`), and every bundle pays for them
- **Location:** `src/autoedit/renderFromPlan.ts:295-298` and `:653-656` (stage under
  `public/autoedit/<slug>.mp4`); worktree `public/` = 1.3 GB (924 MB `public/matte`,
  393 MB `public/autoedit`, ~20 accumulated staged clips).
- **What's wrong:** Remotion `staticFile()` requires assets under `public/`, so staging there
  is necessary — but nothing ever cleans them, and `bundle()` copies the ENTIRE `public/`
  dir into every webpack bundle (observed live: "Copying public dir 1.3 GB" during a mere
  compositions listing). Every render pays ~1.3 GB of disk copy; every leaked bundle was
  ~2.9 GB largely because of this.
- **Failure scenario:** 10 more autoedit runs → `public/` grows to 4+ GB → every render's
  bundle step takes minutes and every crash leaks multi-GB dirs again.
- **Fix:** Task 4.1 (delete staged clip after successful render + a prune script; keep
  mattes but document them).
- **Confidence:** CONFIRMED (observed the copy; measured the dirs).

### 3.4 [LOW] `templates/*.json` defaults are dead config — a divergence trap
- **Location:** `templates/*.json` (9 files); only reader is `src/pipeline/templates.ts`
  (prints id/name/description for `npm run templates`). All real defaults are hardcoded in
  `src/pipeline/pipeline.ts` `buildProps()` (lines 249–408).
- **Failure scenario:** you edit `templates/explainer.json` `defaults.props.colors` expecting
  the video to change; nothing happens; you burn an hour.
- **Fix:** Task 5.9 — one-line comment in each JSON (`"_note": "display-only; render
  defaults live in src/pipeline/pipeline.ts buildProps()"`) — do NOT build a config loader.
- **Confidence:** CONFIRMED.

### 3.5 [LOW] Architecture positives (do not "fix" these)
- The EDL two-timeline model (`editPlan.ts` design principles 1–4) is sound and the
  SOURCE/EDIT re-projection is correct in structure (bugs found are numeric, §4.3).
- `src/autoedit/` correctly isolates pure logic (silenceTrim parse/invert, buildEditPlan,
  packTranscript) from IO shells — that's why the only tests in the repo could exist at all.
- `bundleOnce` adoption is 100% — `grep -rn 'from "@remotion/bundler"' src/ scripts/` hits
  only the wrapper itself. The disk-leak fix (`ecbe007`) held.
- All 28 overlay molecules, all 23 abhi templates, all 7 liquid-glass atoms are registered
  and consumed. Zero dead compositions.

---

## 4. FINDINGS — CORRECTNESS & BUGS (the bug hunt)

> §4.1–4.2 are the export layer (main pipeline). §4.3–4.9 are autoedit. §4.10+ are
> pipeline/TTS. Every item has a concrete failure scenario. "REPRODUCED" = a disposable
> ffmpeg experiment was actually run and failed/succeeded as described.

### 4.1 [CRITICAL] `exportMultiPlatform` crop formula breaks on vertical masters; `square` export hard-fails — REPRODUCED
- **Location:** `src/ffmpeg/commands.ts:19-20` (crop expression), used by
  `exportMultiPlatform` at `:94-99`.
- **What's wrong:** the crop filter is `crop=ih*${width}/${height}:ih`, which assumes a
  LANDSCAPE input. For a 1080×1920 master (every 9:16 template: tech-news-flash,
  diagram-explainer, quote-card-9x16, big-number-hero, split-webcam-screen…) exporting
  `square` (1080×1080, mode "crop") evaluates to `crop=1920:1920` — crop width greater than
  the input's 1080 width. ffmpeg 8.1: `Nothing was written into output file … Conversion
  failed!` (non-zero exit).
- **Failure scenario:** `npm run generate -- --script "…" --template tech-news-flash
  --platforms youtube,square` → the square export rejects → `Promise.all` rejects the whole
  export stage (see 4.4) → the run "fails" after minutes of successful TTS+render work.
- **Fix (Task 1.1):** replace the aspect-dependent crop with the standard fill-crop that the
  repo ALREADY uses correctly in `renderFromPlan.ts:231`:
  `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`.
  This one expression is correct for every input/output aspect combination, both directions.
- **Confidence:** CONFIRMED — empirically reproduced with ffmpeg 8.1.

### 4.2 [CRITICAL] 16:9 master → tiktok/reels export keeps only the middle 607 px (~32% of the frame) — VERIFIED BY MATH + ENCODE TEST
- **Location:** same crop expression, `src/ffmpeg/commands.ts:19-20` + platform table `:94-98`.
- **What's wrong:** the pipeline renders ONE master at the composition's native aspect
  (`ExplainerVideo` etc. are 1920×1080), then derives platforms by cropping. For
  `tiktok`/`reels` (1080×1920) from 1920×1080: `crop=ih*1080/1920:ih` = a 607×1080 center
  strip, upscaled to 1080×1920. Everything outside the middle 607 px — bottom-third captions
  wider than 607 px, the corner watermark, any left/right composition content — is amputated
  or blown up to mush. It encodes "successfully", so nobody notices until they watch it.
- **Failure scenario:** `--template explainer --platforms reels` → output is a blurry
  center-crop with clipped captions; brand watermark gone.
- **Fix:** Task 1.1 makes the crop math correct (no more amputation-by-crash), but the
  REAL fix is Task 4.7: for platforms whose aspect differs from the master, render the
  aspect-native composition variant (`ExplainerVideoVertical` exists!) instead of cropping.
- **Confidence:** CONFIRMED (math + test encode; not eyeballed on a real render, but the
  arithmetic is not in question).

### 4.3 [HIGH] Cumulative A/V + caption drift: video timeline is frame-quantized per segment, ffmpeg cuts in exact seconds
- **Location:** `src/autoedit/silenceTrim.ts:173-177` (`toEditSegments`) +
  `src/autoedit/buildEditPlan.ts:53-61` (`shiftWordsToEditTimeline`) vs
  `src/autoedit/renderFromPlan.ts:200-221` (ffmpeg trims by `startSeconds/endSeconds`).
- **What's wrong:** ffmpeg concatenates segments whose REAL durations are
  `endSeconds - startSeconds` (sample-accurate audio; video quantized once by the final
  `fps=` filter). But the plan computes each segment's edit-timeline length independently as
  `Math.round(end*fps) - Math.round(start*fps)` and accumulates those. Each segment
  contributes an independent rounding error of up to ±1 frame vs its true length; over N
  cuts the plan's `editStartFrame` positions drift from where the content actually lands in
  the staged clip (random-walk ≈ 0.4·√N frames; worst case ~N). Captions and overlays are
  authored against the plan's frames, so on a many-cut edit the karaoke highlighting runs
  visibly early/late by the end. `editDurationFrames` (last `editEndFrame`) likewise
  diverges from the staged clip's real duration — `renderMedia` overrides the composition to
  the plan's count (`renderFromPlan.ts:478-483`), so the render can outrun the staged clip
  (frozen last frames) or truncate it.
- **Failure scenario:** a 3-minute talking-head with 40 silence cuts at 30 fps → captions in
  the last third are ~2–4 frames (66–130 ms) offset from the audio; `selfEvalRender`'s
  duration check (tolerance 0.15 s) starts flagging MISMATCH on longer edits.
- **Fix (Task 2.2):** accumulate in SECONDS and quantize the cumulative value once per
  boundary, in `toEditSegments`:
  ```ts
  let editCursorSeconds = 0;
  keeps.forEach((k, i) => {
    const len = k.endSeconds - k.startSeconds;
    const editStartFrame = Math.round(editCursorSeconds * fps);
    const editEndFrame = Math.round((editCursorSeconds + len) * fps);
    // source frames stay as before
    …push segment with these edit frames…
    editCursorSeconds += len;
  });
  ```
  This bounds EVERY boundary's error to ±0.5 frame regardless of N (no accumulation).
  `shiftWordsToEditTimeline` (buildEditPlan.ts:53-61) must then compute the shift in
  seconds too: `shiftSeconds = seg.editStartFrame / fps - seg.source.startSeconds` and
  derive frames from shifted seconds (`Math.round(newStart * fps)`) instead of shifting
  pre-rounded frames. Keep `editDurationFrames` = last `editEndFrame` (now accurate).
  Update the existing unit tests' expected values if they change (they use round numbers,
  so most won't).
- **Confidence:** CONFIRMED mechanism (code read end-to-end; arithmetic checked); magnitude
  on real footage PLAUSIBLE (not rendered) — which is exactly why Task 3.2's golden test
  ffprobe-asserts staged-clip duration against the plan.

### 4.4 [HIGH] The 30 ms audio fades attenuate real speech because keeps have zero edge padding — the FFMPEG-RULES-AUDIT verdict on rule 7 is wrong
- **Location:** keeps butt exactly against speech: `src/autoedit/silenceTrim.ts:134-147`
  (keep spans = the gaps BETWEEN silences, boundaries at `silence_start`/`silence_end`).
  Fades: `src/autoedit/renderFromPlan.ts:214-219` (single-source) and `:614-621`
  (multi-source). The wrong verdict: `docs/research/video-use/FFMPEG-RULES-AUDIT.md:17`
  ("Pad every cut edge … ⚪ N/A (current) … our cuts are at *detected silence* … so there's
  no drift to absorb").
- **What's wrong:** `silencedetect`'s `silence_start` is the instant audio drops below
  −30 dB — i.e., the END of audible speech — and `silence_end` is where speech RESUMES. The
  keep span therefore starts exactly on a word onset and ends exactly on a word tail. The
  fade-in (`afade=t=in:st=0:d=0.03`) ramps up over the first 30 ms of the first word; the
  fade-out (`st=dur−0.03`) attenuates the last word's final 30 ms. Padding in video-use
  exists for TWO reasons and the audit only considered one (timestamp drift): the second is
  giving fades silent headroom. Rule 3's fix and rule 7's N/A are in direct tension.
- **Failure scenario:** every cut in every autoedit output has a subtly clipped consonant /
  swallowed word-tail; on percussive Spanish plosives it reads as a glitch.
- **Fix (Task 2.1):** pad each keep edge into the adjacent silence, clamped so padding never
  overlaps another keep. In `keepSegmentsFromSilences` (silenceTrim.ts), after computing
  `keeps`, expand: `start = max(prevKeepEnd, start − PAD)`, `end = min(nextKeepStart,
  end + PAD)` with `PAD = 0.05` (50 ms) — since keeps are separated by silences ≥
  `minSilenceSeconds` (0.5 s default), a 50 ms pad on each side can never collide (0.05+0.05
  < 0.5), but write the clamp anyway for custom options. Expose `padSeconds` in
  `SilenceDetectOptions`-adjacent options with default 0.05. The 30 ms fades then live
  entirely inside padded silence. Add unit tests: padded spans don't overlap; pad clamps at
  0 and duration.
- **Confidence:** CONFIRMED mechanism (semantics of silencedetect + code); audibility on
  real footage PLAUSIBLE (untested by ear) — fix is cheap and strictly safer regardless.

### 4.5 [HIGH] `normalizeAudio` ships 96 kHz AAC in every export — REPRODUCED
- **Location:** `src/ffmpeg/commands.ts:52-65` (loudnorm one-pass, no `-ar`).
- **What's wrong:** `loudnorm` internally upsamples to 192 kHz; with no output `-ar`, the
  AAC encoder clamps to 96 kHz. Reproduced with the exact args on ffmpeg 8.1: output stream
  `sample_rate=96000`. Every downstream platform export inherits or re-encodes from this
  non-standard rate. Platforms will transcode it again (quality + compatibility lottery).
- **Fix (Task 1.2):** add `"-ar", "48000"` after the loudnorm filter args. While in there:
  the platform `resize` step (`commands.ts:42-49`) re-encodes audio AGAIN needlessly —
  change it to `-c:a copy` (video-only geometry change; audio was just normalized). That
  cuts the audio generation chain from 4 lossy steps (TTS mp3 → Remotion AAC → loudnorm AAC
  → resize AAC) to 3.
- **Confidence:** CONFIRMED — empirically reproduced.

### 4.6 [HIGH] Multi-source reels with mixed mono/stereo sources silently downmix the ENTIRE reel to mono — REPRODUCED
- **Location:** `src/autoedit/renderFromPlan.ts:617-622` — audio chain has
  `aresample=48000` but no `aformat`/channel-layout normalization before `concat`.
- **What's wrong:** ffmpeg 8.1 does NOT error on concat of mono+stereo `atrim` outputs (the
  classic failure) — verified in a scratchpad experiment: it silently negotiates the whole
  output down to 1 channel. Mix one phone voice-memo beat (mono) into an otherwise stereo
  reel → the entire reel goes mono, nobody is told.
- **Fix (Task 2.4):** in BOTH audio chains append
  `aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo` (replacing the bare
  `aresample=48000` in the multi-source path, and adding it in the single-source path which
  currently has neither — `renderFromPlan.ts:217-221`).
- **Confidence:** CONFIRMED — empirically reproduced.

### 4.7 [MEDIUM] Per-segment creative grade is applied in HLG space on HDR sources (grade-before-LUT ordering)
- **Location:** grade inserted per segment BEFORE concat: `renderFromPlan.ts:206-208`;
  HLG→SDR `lut3d` applied AFTER concat on `[vcat]`: `renderFromPlan.ts:228-232`. Presets:
  `src/autoedit/editPlan.ts:93-98` (`GRADE_FILTERS` — plain SDR-style `eq`/`hue` chains).
- **What's wrong:** for iPhone HLG footage, `eq=contrast/saturation/gamma_*` runs on
  HLG-encoded bt2020 pixels and THEN the LUT tonemaps the already-graded values. The presets
  were designed for display-referred SDR; pre-tonemap they produce a different (and
  source-dependent) look — the same `warm-cinematic` preset renders differently on HDR vs
  SDR sources, and gamma nudges get remapped nonlinearly. video-use's own pipeline (the
  source of this harvest, `docs/research/video-use/ANALYSIS.md:18`) grades AFTER
  extract+concat, i.e. in display space. The audit blessed the harvest without noticing
  (`FFMPEG-RULES-AUDIT.md:28`).
- **Failure scenario:** two segments of the same HDR clip, one graded `warm-cinematic`, one
  ungraded → after the LUT the graded one has shifted hues/washed contrast that don't match
  the preset's look on SDR test footage.
- **Fix (Task 2.3):** move the color pipeline per-segment and order it colorFix→grade. In
  `buildTrimConcatFilter`, change each video part to
  `[0:v]trim=…,setpts=PTS-STARTPTS,${colorFix}${gradeF}[v${i}]` (colorFix = the `lut3d`
  prefix, applied per segment; drop it from the post-concat chain, whose scale line becomes
  `[vcat]scale=…`). This matches the multi-source path's structure (per-input colorFix,
  `renderFromPlan.ts:602-608`) and grades in SDR space. Cost: the LUT runs once per segment
  instead of once total — negligible (it's the same total pixel count). While there, also
  add `grade?` to `ReelBeat` and insert the same `${gradeF}` after the multi-source
  colorFix — that closes the documented multi-source-grade gap
  (`FFMPEG-RULES-AUDIT.md:29-32`) in the same commit.
- **Confidence:** CONFIRMED ordering (code read); visual severity PLAUSIBLE (not rendered).

### 4.8 [MEDIUM] Silent/no-audio sources crash the single-source path; genuinely-failed silencedetect silently means "keep everything"
- **Location:** hardcoded `[0:a]` at `renderFromPlan.ts:218` with `hasAudio` hardcoded
  `true` at `:235`; `detectSilences` uses `{reject:false}` (`silenceTrim.ts:236`) so its
  catch only fires on spawn failure — a failed ffmpeg run (corrupt file, no audio stream)
  yields empty stderr → zero silences → the whole video is kept, with no warning.
- **Failure scenario:** feed a screen-recording with no audio track → ffmpeg errors on
  `[0:a]` (`Stream specifier ':a' … matches no streams`) with a cryptic filtergraph message;
  OR feed a corrupt file → "no silences detected" → an untrimmed edit ships.
- **Fix (Task 2.5):** (a) probe for an audio stream in `trimAndStageBaseClip` (reuse
  `detectHdr`'s ffprobe pattern with `-select_streams a`); if absent, build a video-only
  filtergraph and add `-an` (or synthesize silence via `anullsrc` if the scene requires an
  audio track — prefer `-an`; Remotion doesn't need it). (b) in `detectSilences`, check
  `result.exitCode !== 0 && parsed.length === 0` → throw the existing actionable error
  instead of returning `[]`.
- **Confidence:** CONFIRMED code paths; the `[0:a]` failure mode is standard ffmpeg
  behavior (PLAUSIBLE-by-semantics, not reproduced).

### 4.9 [MEDIUM] `suggestOverlays` R2 merges every ordinal in the transcript into one giant enumeration overlay, and its cooldown suppresses overlays BEFORE the enumeration too — Spanish-hostile
- **Location:** `src/autoedit/suggestOverlays.ts:178-207` (enumeration span = first→last
  ordinal occurrence anywhere, no max-gap), `:206` (`cooldownUntil = toFrame`), `:211`
  (`if (w.startFrame < cooldownUntil) continue` — skips all beats from frame 0 to the
  enumeration's END), ES lexicon includes ultra-common connectives `luego`, `después`,
  `siguiente` (`:81-85`).
- **What's wrong:** in any real Spanish talking-head, `luego`/`después` appear constantly →
  ≥2 hits are near-certain → one `BuildingBulletListOverSpeaker` spans most of the video,
  and because the cooldown is set to the span's END while iteration is chronological, every
  single-word overlay (stats, brand pops) whose word starts before that end is suppressed.
  Note the unit test masks this: `autoedit.test.ts:135-163` tests with ENGLISH words
  ("First… second… $100 … Claude") for a Spanish-content product.
- **Failure scenario:** 90-second Spanish reel containing "primero… luego… después…" spread
  across the video → one bullet-list overlay from second 5 to second 80, zero other overlays.
- **Fix (Task 2.6):** three changes in `suggestOverlays.ts`:
  1. Enumeration grouping: consecutive ordinals must be within `MAX_ORDINAL_GAP_FRAMES`
     (suggest 8 s × fps) of the previous one; a larger gap starts a NEW candidate group;
     only groups with ≥2 members within the gap budget emit an overlay; cap the span at
     `MAX_ENUM_SPAN_FRAMES` (suggest 15 s × fps).
  2. Cooldown: suppress only beats INSIDE `[fromFrame, toFrame)` of an emitted overlay —
     replace the global `cooldownUntil` skip with an interval check (keep the short
     POST-overlay cooldown of 45 frames that already exists for single-word beats).
  3. Lexicon: drop `luego`, `después`, `siguiente` from the ORDINAL list (keep
     `primero/segundo/tercero/cuarto/quinto` + English ordinals); they can stay in a
     lower-weight emphasis list if desired.
  Add Spanish-language unit tests mirroring the failure scenario above (a transcript with
  scattered `luego`/`después` must NOT produce an enumeration overlay; clustered
  `primero…segundo…tercero` within 8 s MUST).
- **Confidence:** CONFIRMED logic (file read); real-world frequency of the bad trigger
  PLAUSIBLE (obvious from Spanish usage, not measured on a corpus).

### 4.10 [MEDIUM] Captions display whisper's recognized text instead of the authored script — the fix already exists in-repo, unused
- **Location:** `src/pipeline/pipeline.ts:114-117` (wholesale
  `wordTimings = whisperData.words`); the purpose-built-but-never-imported fix:
  `src/timing/align.ts` (`alignScriptToWhisper` — its own header says it exists precisely
  for this).
- **What's wrong:** whisper mis-recognitions, its punctuation and casing, replace the
  author's actual script in burned captions. For Spanish tech content (brand names, "Claude",
  "GPT", anglicisms) whisper errors are common.
- **Failure scenario:** script says "Claude 5 puede…", caption renders "cloud five puede…".
- **Fix (Task 2.7):** in pipeline.ts stage 1.5, after obtaining whisper words, call
  `alignScriptToWhisper(scriptWords, whisperWords)` and use the aligned output (script text +
  whisper timings). Read `src/timing/align.ts` first and follow its documented contract; it
  defines `AlignedWord { source: "whisper"|"interpolated"|"tts-fallback" }`. Record
  `source: "whisper-aligned"` in `word_timings_final.json`.
- **Confidence:** CONFIRMED (both files read; shapes verified compatible — both sides are
  `{text,startSeconds,endSeconds,startFrame,endFrame}`).

### 4.11 [MEDIUM] Video duration = `lastWord.endSeconds + 0.5` truncates audio tails
- **Location:** `src/pipeline/pipeline.ts:143-145`.
- **What's wrong:** whisper runs with VAD; its last word ends at last speech. Any outro
  breathing room/music tail in `audio.mp3` beyond 0.5 s is cut from the video while still
  present in the audio file (audible cut or A/V length mismatch depending on mux).
- **Fix (Task 2.8):** duration = `max(lastWord.endSeconds + 0.5, audioDurationSeconds)`
  where audio duration comes from ffprobe (helper already exists twice in the repo — after
  Task 4.3's consolidation, import the shared one).
- **Confidence:** CONFIRMED code; PLAUSIBLE severity (depends on TTS tail length).

### 4.12 [MEDIUM] Edge-TTS runs at sentence-boundary granularity — word timings in `--no-whisper` mode are synthetic
- **Location:** `src/tts/generate.py:31-36` (no `boundary=` argument; verified against the
  installed edge-tts 7.x source — default is `SentenceBoundary`,
  `.venv/…/edge_tts/communicate.py:335`), with even word distribution at `:54-72`.
- **What's wrong:** edge-tts CAN emit real per-word offsets for free
  (`boundary="WordBoundary"`); the code instead gets sentence events and spreads words
  evenly, making `--no-whisper` captions drift within every sentence.
- **Fix (Task 4.5):** pass `boundary="WordBoundary"` in the `Communicate` constructor and
  consume word events directly (keep the even-distribution code as fallback for any voice
  that doesn't emit word boundaries). The 100-ns tick math (`offset/10_000_000`,
  generate.py:45-46) is already CORRECT — don't touch it.
- **Confidence:** CONFIRMED (library source inspected).

### 4.13 [LOW] Negative `--rate`/`--pitch` break argparse
- **Location:** `src/tts/generate.py` argparse; caller `src/pipeline/pipeline.ts:88-89`
  passes `["--rate", "-20%"]` as separate array elements.
- **What's wrong:** argparse treats `-20%` as an option token → "expected one argument".
  Slowing speech from the TS CLI fails.
- **Fix (Task 4.5, same commit):** in pipeline.ts pass `--rate=-20%` single-token form
  (`` `--rate=${rate}` ``), same for pitch; OR in generate.py use
  `parser.add_argument("--rate", type=str, default="+0%")` with
  `parse_known_args`-safe `=`-form documented. The `=`-form caller fix is smallest.
- **Confidence:** CONFIRMED semantics (standard argparse behavior); not executed.

### 4.14 [LOW] Words straddling a cut keep full duration → captions momentarily overlap the next segment's words
- **Location:** `src/autoedit/buildEditPlan.ts:45-61` (kept iff START inside a segment; END
  unclamped) and the multi-source analog `renderFromPlan.ts:723-735`.
- **Fix (Task 2.9):** clamp `endSeconds/endFrame` to the containing segment's edit end
  (resp. the beat's rebased end). One-line `Math.min` in each.
- **Confidence:** CONFIRMED code; visual impact minor (karaoke highlight lingers ≤ word-tail).

### 4.15 [LOW] `keepSegmentsFromSilences` drops kept spans < 0.2 s — a short word between two pauses vanishes
- **Location:** `silenceTrim.ts:111,147` (`minKeepSeconds = 0.2` filter).
- **What's wrong:** a quiet, short interjection ("sí", "ok") bracketed by two ≥0.5 s pauses
  is deleted from audio AND captions with no trace. The audit graded rule 6 "✅ in-spirit"
  without noting this (`FFMPEG-RULES-AUDIT.md:16`).
- **Fix (Task 2.1, same file):** after Task 2.1's padding, a 0.2 s keep becomes 0.3 s padded
  — keep the filter but run it BEFORE padding and log dropped spans
  (`log(\`silence-trim: dropped ${n} sub-${minKeep}s spans\`)`) so it's at least visible.
  Do NOT remove the filter (2-frame slivers are worse).
- **Confidence:** CONFIRMED code; frequency PLAUSIBLE.

### 4.16 [LOW] `escapeFilterArg` uses invalid ffmpeg quoting for apostrophes
- **Location:** `renderFromPlan.ts:165-167` (`\\'` inside a single-quoted filter value).
- **What's wrong:** inside ffmpeg single quotes, backslash is literal and `'` terminates the
  quote — the correct idiom is `'…'\''…'`. Works today only because the repo path contains
  spaces (fine inside quotes) but no apostrophe.
- **Failure scenario:** project cloned under `~/Armando's Projects/…` → the `lut3d=file='…'`
  filter breaks with a parse error on every HDR staging run.
- **Fix (Task 2.10):** `return p.split("'").join("'\\''");` — i.e., close-quote, escaped
  quote, reopen — and keep wrapping the value in single quotes at the call sites (`:183`).
- **Confidence:** CONFIRMED semantics of ffmpeg quoting; not reproduced (no apostrophe path
  on hand). Cheap and safe.

### 4.17 [LOW] `extractThumbnail -ss 2` fails for sub-2 s videos and (via 4.19) kills the whole export batch
- **Location:** `src/ffmpeg/commands.ts:72-79`.
- **Fix (Task 1.4):** use `-sseof -0.5` (0.5 s before end) OR probe duration and seek
  `min(2, duration/2)`. Prefer `-ss` BEFORE `-i` (it already is — fast seek is fine for a
  thumbnail).
- **Confidence:** CONFIRMED code; failure mode standard ffmpeg behavior.

### 4.18 [LOW] Unknown `--template` silently renders ExplainerVideo; `parseInt` without radix
- **Location:** `src/pipeline/pipeline.ts:179` (fallback), `src/pipeline/generate.ts:81`.
- **Fix (Task 1.5):** throw an actionable error listing valid template keys (matches the
  "error messages must be actionable" convention); `parseInt(opts.fps, 10)`.
- **Confidence:** CONFIRMED.

### 4.19 [MEDIUM] `Promise.all` export fan-out leaves partial outputs and orphan ffmpeg work on any failure
- **Location:** `src/ffmpeg/commands.ts:101-122`.
- **What's wrong:** one platform's rejection (e.g. 4.1's square crash, 4.17's thumbnail)
  rejects the batch; sibling execa processes keep running unsupervised; half-written
  `${baseName}_*.mp4` files remain and can be mistaken for good exports.
- **Fix (Task 1.3):** `Promise.allSettled`; collect failures; delete (`fs.rmSync`) the
  output path of every rejected task; log a per-platform ✓/✗ table; throw ONE aggregate
  error listing failed platforms if any (so callers still fail loudly).
- **Confidence:** CONFIRMED code read.

### 4.20 [NIT-cluster] Small confirmed paper-cuts (bundle into Task 5.11)
- `packTranscript.ts:166` — `--gap` with a missing value → `Number(undefined)` = NaN → every
  gap comparison false → one giant phrase. Guard: `if (Number.isNaN(gap)) throw`.
- `packTranscript.ts:129` — header hardcodes ">= 0.5s" even with custom `--gap` (interpolate
  the actual value); `:144` docstring claims a dir arg works but `readFileSync` on a dir throws.
- `buildEditPlan.ts:139` — `provenance.overlaySource` labels an explicitly-passed
  `ruleBasedStrategy` as `"llm-assisted"` (it keys off "strategy arg present", not its kind).
  Fix: accept an explicit provenance label or compare against the exported rule-based
  strategy reference.
- `renderFromPlan.ts:488-493` and `:819-824` — `Math.round(progress*100) % 25 === 0` logs
  the same milestone many times (every callback in that percent). Track `lastLogged`.
- `suggestOverlays.ts:118` — `/^\d+x$/` branch is unreachable (`/\d/` on line 117 already
  matched); `:106` — `ñ` replace is redundant after NFD strip. Harmless; delete or comment.
- `src/autoedit/editPlan.ts:47` — comment references `src/schemas.ts`, which does not exist
  (the real file is `src/compositions/schemas.ts`). Fix the comment.
- `selfEvalRender.ts` — VERIFIED GOOD overall (the `eq(n\,F)` comma-escaping at `:139` is
  correct; the "zero-length leading segment" edge is even unit-tested).

---

## 5. FINDINGS — REMOTION COMPOSITIONS & ATOMS

> Headline: this layer is in unusually good shape. 130 comps, zero unregistered files, zero
> live `background-clip:text`, zero non-determinism, zero `<Video>`, comp-id charset clean,
> Zod-v4 defaultProps convention held everywhere, fonts load once at module scope
> (`src/brand/fonts.ts`, side-effect import at `Root.tsx:144`). The debt is duplication and
> a block of literal durations.

### 5.1 [MEDIUM] 18 comps registered with literal `durationInFrames` and no `calculateMetadata` — 4 of them truncate their own content
- **Location:** the one-liner registration block `src/Root.tsx:2641-2660` (18 comps; the
  other 83 registrations elsewhere in Root.tsx use `calculateMetadata={calcDurationFromAudio}`).
  Confirmed truncators:
  - `SceneSequencer9x16` — Root.tsx:2659 literal `375`, but content = Σ per-scene
    `durationInFrames` (unbounded array; each scene up to 900). Bonus: the comp EXPORTS
    `SCENE_SEQUENCER_DEFAULT_TOTAL_FRAMES` (SceneSequencer9x16.tsx:234) whose docstring
    claims Root uses it — Root doesn't (dead export + doc lie).
  - `StatCardSequenceWithUnderlines9x16` — Root.tsx:2656 literal `246`; content =
    `titleFrames + stats.length × statFrames` (comp file lines 581-599, 635). 5+ stats
    overflow; the last card freezes while frames run out.
  - `AppScreenCarousel9x16` — Root.tsx:2657 literal `150` (5 s) vs "3–5 screens" × per-screen
    beats + outro (`totalBeats` at AppScreenCarousel9x16.tsx:1088).
  - `ModelNameChipComparison9x16` — Root.tsx:2646 literal `180`; content =
    `models.length × framesPerModel` (file line 814).
- **Why it matters:** render drivers override duration so pipeline renders are fine — but
  Remotion Studio previews and any direct `npx remotion render <id>` silently truncate.
  These comps are exactly the ones you preview in Studio when composing.
- **Fix (Task 5.7):** give those 4 comps a `calculateMetadata` that computes
  `durationInFrames` from props (each comp already contains the formula — lift it):
  ```tsx
  calculateMetadata={({ props }) => ({
    durationInFrames: computeSceneSequencerFrames(props.scenes), // export the existing math
  })}
  ```
  For SceneSequencer, USE the existing exported constant/function rather than the literal.
  Leave the other 14 one-liners alone (their content fits their literals).
- **Confidence:** CONFIRMED (files + Root block read).

### 5.2 [MEDIUM] ~5,800 duplicated lines across 17 aspect-ratio pairs — worst offenders measured
- **Location / measurements** (byte-identical line counts via `comm -12` on sorted files):
  | Pair | lines (9x16 / 16x9) | identical | ratio |
  |---|---|---|---|
  | `SpeakerOverlayScene` | 237 / 273 | 184 | **78%** |
  | `AnimatedTable` | 519 / 581 | 385 | 74% |
  | `BarChartList` | 454 / 512 | 332 | 73% |
  | `LineChartAnnotated` | 632 / 567 | 399 | 70% |
  | `Sparkline` | 719 / 665 | 444 | 67% |
  | `VennDiagram` | 778 / 774 | 492 | 64% |
  | `DecisionTree` | 913 / 825 | 518 | 63% |
- **Fix (Task 5.8 — DEFERRED, do only the one pair):** merge ONLY `SpeakerOverlayScene`
  (78% identical, and it's the autoedit render target so it pays rent immediately): extract
  `SpeakerOverlaySceneCore.tsx` taking `{width,height,aspect}` + the shared schema; keep the
  two registered wrappers as 10-line files supplying aspect defaults. **Do NOT merge the
  other 16 pairs now** — they are stable creator-replica templates, the merge risk (subtle
  layout regressions across 130 comps) outweighs the maintenance win, and there's no test
  coverage to catch regressions. Revisit only if a global change (e.g. brand redesign)
  forces touching them all.
- **Confidence:** CONFIRMED (measured).

### 5.3 [MEDIUM] 25 files hardcode brand hexes despite `src/brand` existing (and usually being imported in the same file)
- **Location:** grep counts across `src/compositions/`: `#D4AF37`×26, `#0F1B2D`×26,
  `#FAF7F2`×14, `#1B3A6E`×11 (≈77 literals in 25 files). Canonical bad example:
  `SceneSequencer9x16.tsx:52-55` redeclares `const BRAND_NAVY = "#1B3A6E"` etc. while
  importing `resolveColors` from `../brand` on line 49. 104/114 files DO import from brand —
  the source of truth exists and dominates; these are stragglers.
- **Fix (Task 5.6):** mechanical: in each of the 25 files, replace the brand-hex literals
  with the corresponding `BRAND`/palette import. Verify by grep going to zero (exact command
  in the task). Non-brand hexes (`#5BC0E8` etc.) are intentional creator-parity palettes —
  LEAVE THEM.
- **Confidence:** CONFIRMED (grep counts).

### 5.4 [LOW] Dead exports / stale barrel in the composition layer
- `src/compositions/index.ts` — stale barrel exporting only the 4 original comps; zero
  consumers (`grep -rn "from '.*compositions'" src` → none). ALSO: `Makefile`'s `render`
  target points at it as a Remotion entry (it has no `registerRoot`) — broken. → Task 5.4.
- `SCENE_SEQUENCER_DEFAULT_TOTAL_FRAMES` — see 5.1; used by Task 5.7 (use it, don't delete).
- `src/timing/easing.ts:81` `outQuint`, `:92` `outExpo` — referenced only in comments. Delete.
- `src/autoedit/bundleOnce.ts:70` `cleanupBundle` — never called; KEEP it (it becomes useful
  with Task 4.2's memoization; document it there).
- **Confidence:** CONFIRMED (grepped each name repo-wide).

### 5.5 [LOW] Liquid-glass family — clean; one convention note
- `src/components/liquidglass/` (7 files) — tokens derive from `BRAND`
  (`tokens.ts:21,50-54`), atoms are consumed, showcases registered
  (`LiquidGlassShowcase9x16`, `LiquidGlassShowcaseB9x16`, `PromptCardPedagogy9x16` all in
  Root and listed by `npx remotion compositions`). `RibbonParallax` + `SoftDepthFieldVignette`
  have a single consumer each (the B showcase) — fine for an atom layer, no action.
- NIT: `AbhiScene9x16` registration hardcodes `accentColor: "#E8743B"` (Root.tsx:3805) —
  intentional creator-parity orange; add a one-line comment at the registration site
  (Task 5.11) so nobody "fixes" it to gold.
- **Confidence:** CONFIRMED.

### 5.6 [LOW] Render-time font fetches from Google CDN
- **Location:** `src/brand/fonts.ts:1-6` via `@remotion/google-fonts` — observed at bundle
  time: "Made 49 network requests to load fonts for Inter", 28 for Fira Code.
- **Why it matters:** offline/render-during-scrape breaks fonts silently (the repo already
  records "scraping must NOT run concurrent with renders", `.claude/NEXT-STEPS.md:104`);
  49+ requests per render session is waste.
- **Fix (Task 4.6):** two-step: (a) cheap now — pass weight/subset options to `loadFont()`
  to load only the weights `FONT_STACKS` uses (kills most of the 49); (b) optional later —
  vendor WOFF2s under `public/fonts/` + `@remotion/fonts` `loadFont({url: staticFile(…)})`
  to remove the network entirely. Do (a) now, defer (b).
- **Confidence:** CONFIRMED (warnings observed live).

---

## 6. FINDINGS — TYPE SAFETY, DEAD CODE, DUPLICATION, NAMING

### 6.1 [POSITIVE — baseline] Zero `any`, zero `as any`, zero `@ts-ignore`/`@ts-expect-error`/`eslint-disable` in 110k lines; tsc strict and clean (worktree). Only 7 `as unknown as` casts exist.

### 6.2 [MEDIUM] 4 of the 7 casts share one root cause: `src/timing/align.ts` param types are too narrow
- **Location:** `EditorialCaption.tsx:293`, `FloatingCaption.tsx:413`,
  `ChunkedPhraseCaption.tsx:156`, `SplitWebcamScreen9x16.tsx:76` — all cast plain
  `WordTiming[]` to `AlignedWord[]` because `nonOverlappingGroups`/`findKeyword` demand
  `AlignedWord` (which adds a required `source` field, `align.ts:38`) that the functions
  never read (admitted in the comment at SplitWebcamScreen9x16.tsx:73-75).
- **Fix (Task 5.5a):** widen those two functions' parameters to `TimedWord[]`
  (the base interface in align.ts) — then delete all four casts. Zero behavior change.
- **Confidence:** CONFIRMED (all call sites + align.ts read).
- The other 3 casts: registry type-erasure (`overlays/registry.ts:76`,
  `abhi/registry.ts:59` — pragmatic, KEEP) and `brands.ts:69` unvalidated JSON import
  (LOW — optionally `brandsFileSchema.parse(brandsJson)` since zod is right there; Task 5.11).

### 6.3 [MEDIUM] ~33 private copies of the word-timing zod schema
- **Location:** `grep -c "wordTimingSchema\s*=" src/compositions/*` → 33 local
  `const wordTimingSchema = z.object({…})` declarations; 63 files contain the literal
  `startSeconds: z.number()`. Canonical shape lives at `src/compositions/schemas.ts:15-23`
  (type exported, schema NOT exported — that's why everyone re-declared it). Divergent named
  exports include a SECOND exported `WordTiming` type (TalkingHeadDynamic9x16.tsx:96 —
  name-collides with the canonical one), `BrollListicleWordTiming` (:77),
  `SplitScreenInterviewWordTiming` (:99), etc. `editPlanWordSchema`
  (`src/autoedit/editPlan.ts:49-56`) is field-for-field identical too (KEEP that one
  separate on purpose — the EDL is a serialization contract and editPlan.ts documents why it
  must not import composition files).
- **Fix (Task 5.5b):** export `wordTimingSchema` from `src/compositions/schemas.ts`; then
  MECHANICALLY replace the 33 local copies with the import **only where the local copy is
  field-identical** (diff each before replacing — a minority may add fields; leave those,
  rename them to distinct names if they shadow `WordTiming`). This is a long mechanical
  task; it's Phase 5 (safe, non-urgent). The single non-negotiable piece: rename the
  colliding second `WordTiming` export in TalkingHeadDynamic9x16.tsx:96.
- **Confidence:** count CONFIRMED; per-copy identity PLAUSIBLE (diff before replacing).

### 6.4 [MEDIUM] The bundle→select→render skeleton is pasted ~30× and `bundleOnce`'s name lies
- **Locations:** the ~40-line stage-2 block (`ensureBrowser` → `bundle({entryPoint})` →
  `selectComposition` → `renderMedia({composition:{…override}, …, onProgress: %25 logger})`)
  exists at `src/pipeline/pipeline.ts:148-216`, `renderFromPlan.ts:446-495`,
  `renderFromPlan.ts:791-826`, in 10 standalone `src/autoedit/run*.ts` drivers
  (runAbhiTemplates, runAvailV2, runCrossCreatorReplicas, runComboDemos, runDepthDemo,
  runNewOverlayDemos, runMotionGraphicsShowcase, runOverlayAnimDemo, runVariationsShowcase,
  runTella16x9Demo — 1,948 lines total for the 14-file family), and in 21 of 22
  `scripts/*.ts` render drivers. Plus `correctWordText()`/`loadWords()` pasted 3×
  (runStyledReel.ts:37-52 ≡ runAssembleReel.ts:81-103 ≡ runFirstEdit.ts:47-62) and
  `probeDurationSeconds` pasted 2× (cli.ts:55, selfEvalRender.ts:95).
- **`bundleOnce` misnomer with real cost:** `bundleOnce` does NOT bundle once — it bundles
  fresh on every call (`bundleOnce.ts:63`) and only registers exit-time cleanup. VERIFIED
  consequence: `runStyledReel.ts` calls `renderMultiSourcePlan` twice per run → two full
  ~2.5–3 GB webpack bundles of the identical entry point.
- **Fix (Tasks 4.2 + 4.3):**
  - 4.2: make `bundleOnce` memoize per entryPoint:
    ```ts
    const cache = new Map<string, Promise<string>>();
    export async function bundleOnce(...args: Parameters<typeof bundle>): Promise<string> {
      const key = typeof args[0] === "string" ? args[0] : args[0].entryPoint;
      let p = cache.get(key);
      if (!p) { p = bundle(...args).then((dir) => { registered.add(dir); ensureHooked(); return dir; }); cache.set(key, p); }
      return p;
    }
    ```
    (`cleanupBundle` should also evict from the cache.) Now the name is true AND
    runStyledReel halves its bundle cost with zero call-site changes.
  - 4.3: add `src/autoedit/renderComposition.ts` exporting
    `renderComposition({compositionId, inputProps, durationInFrames, fps, outputLocation, onProgress?, log?})`
    that wraps ensureBrowser+bundleOnce+selectComposition+renderMedia with the deduped
    %-progress logger. Migrate ONLY `pipeline.ts` and both `renderFromPlan.ts` blocks to it
    now (with the Phase 2/3 tests as the safety net). Migrating the 10 run* drivers + 21
    scripts is OPTIONAL cleanup (they're one-shot QA drivers) — do it opportunistically,
    never as a big-bang.
- **Confidence:** CONFIRMED (files read, adoption grep, bundle cost observed).

### 6.5 [LOW] tsconfig: dead `baseUrl` silenced by `ignoreDeprecations`; `scripts/` never typechecked
- **Location:** `tsconfig.json:15` (`"baseUrl": "."` — no `paths`, nothing uses it),
  `:16` (`"ignoreDeprecations": "6.0"` added evidently just to silence the baseUrl warning);
  `include` covers only `src/**` + remotion.config.ts, so the 24 `scripts/*.ts` never see tsc.
- **Fix (Task 5.3):** delete both lines; add `"scripts/**/*.ts"` to `include`; fix whatever
  errors surface in scripts (expect a handful; they're small files). Missing strictness
  flags (`noUncheckedIndexedAccess` etc.) — do NOT add now (would surface hundreds of index
  errors across 130 comps for near-zero bug yield in deterministic render code).
- **Confidence:** CONFIRMED (file read; scripts exclusion verified).

### 6.6 [NIT] `.shape` reflection at `src/components/overlays/CountUpStat.tsx:80` violates the recorded "no zod `.shape`/`._def`" rule (two other files self-document the rule while complying). Replace with a named `const anchorSchema = z.enum([...])` reused in the object. → Task 5.11.

---

## 7. FINDINGS — TESTS

### 7.1 [HIGH] The entire quality-gate story is fiction (four independent breakages) — all CONFIRMED by running them
1. **vitest double-counts:** no `vitest.config.ts` exists (CLAUDE.md:124 claims it does);
   default globs include `.claude/worktrees/recursing-tu-dac74b/src/autoedit/*.test.ts` →
   reported "6 files / 44 tests" is 3 files / 22 tests × 2. → Task 0.5.
2. **pytest can't even start:** `.venv/bin/pytest` shebang points at
   `/Users/armandogonzalez/Documents/…` (pre-move path). And there are ZERO Python test
   files anywhere (despite CLAUDE.md:109/:160-162/:250, README.md:92/:301/:339-341,
   `.claude/tech-stack.md` all claiming pytest suites). → Tasks 0.2, 3.4.
3. **eslint has never worked:** no config file in git history, `--ext` invalid for flat
   config, eslint unpinned (transitive 10.1.0). → Task 3.3.
4. **`npm run render` broken:** `package.json:9` → `src/pipeline/render.ts` (never existed);
   README.md:162 documents it as a working command. `Makefile` has 3 more broken targets
   (`test-py` → missing dir; `lint` → ruff not installed; `render` → wrong Remotion entry
   `src/compositions/index.ts` which has no registerRoot). → Tasks 5.4, 5.2.

### 7.2 [HIGH] Zero coverage on the highest-risk code — the ffmpeg command builders and frame math
- What IS tested (22 real tests, all passing): silencedetect parsing, keep inversion,
  toEditSegments, shiftWords, overlay classifiers (in English…), packTranscript, cut
  boundaries. All pure-function autoedit logic. Good tests, wrong bottleneck.
- What is NOT tested at all: `buildTrimConcatFilter`, `buildMultiSourceConcatFilter`,
  `buildCombinedTranscript` (all pure, all EXPORTED, trivially testable),
  `exportMultiPlatform`/`normalizeAudio`/`resize` arg construction, `buildSceneProps`,
  `pipeline.ts` anything, `align.ts`, all Python.
- **Fix:** Tasks 3.1 (unit/snapshot tests on the builders — these lock in every Phase 1–2
  fix), 3.2 (a golden ffprobe-assertion E2E on synthetic media), 3.4 (either 3 small pytest
  files for the pure helpers in generate.py/transcribe.py, or delete the pytest claims —
  Task list picks: write the tests, they're cheap).
- **Confidence:** CONFIRMED (vitest list enumerated; exports grepped).

---

## 8. FINDINGS — PERFORMANCE

- **8.1 [HIGH] 1.3 GB `public/` copied per bundle** — see 3.3 / Task 4.1. This is the
  single biggest render-latency + disk lever in the repo.
- **8.2 [MEDIUM] Double-bundling in multi-render processes** — see 6.4 / Task 4.2.
- **8.3 [LOW] No VideoToolbox anywhere** (grep: 0 hits) although `CLAUDE.md:101` advertises
  "VideoToolbox HW accel". Everything is `libx264 -crf 18 -preset medium`. On M-series,
  h264_videotoolbox would be ~3–5× faster per export BUT: it takes `-b:v` (bitrate), NOT
  `-crf` — passing `-crf` silently degrades to defaults. Recommendation (Task 4.8 —
  OPTIONAL): keep libx264 for the staged/master encodes (quality-critical intermediates);
  optionally switch only the final platform exports to
  `h264_videotoolbox -b:v 10M -maxrate 12M -bufsize 20M` (9:16 1080p) after Task 1.1 lands
  with its tests. If not doing that, just fix the doc (Task 5.1 covers it).
- **8.4 [LOW] `trim=` decode-based cutting** — accurate but decodes from file start per
  segment chain; fine at current source lengths; do nothing. (Noted so nobody "optimizes"
  it into keyframe-snapping `-ss -c copy`, which would be a correctness regression.)
- **8.5 [LOW] 10 GB of worktrees** — 9.9 GB of it is `recursing-tu-dac74b`, whose branch tip
  IS main (fully merged). Removal is pure win, and it also fixes 7.1(1)'s double-glob at the
  root cause. → Task 0.4.
- **8.6 [POSITIVE] Multi-platform exports already parallelize** (`Promise.all` — becoming
  `allSettled` in Task 1.3); bundle-leak fix holds repo-wide; renders reuse one bundle per
  process in the drivers (they loop selectComposition/renderMedia over one bundle — good).

---

## 9. FINDINGS — DX, DOCS ACCURACY, MEMORY SYSTEM, SECURITY

### 9.1 [HIGH] CLAUDE.md's Project Structure tree is ~60% fiction (April snapshot)
CONFIRMED missing-from-reality: `vitest.config.ts` (:124), `tests/compositions/` +
`tests/python/` (:160-162), `src/pipeline/config.ts` (:145), `src/tts/voices.py` (:148),
`src/transcribe/formats.py` (:151), `src/ffmpeg/resize.ts` + `subtitles.ts` (:154-155) —
none exist, several NEVER existed. CONFIRMED missing-from-the-tree: `src/autoedit/` (the
largest subsystem), `src/brand/`, `src/timing/`, `src/animation/`, `src/matting/`,
`src/Root.tsx`, 118-file compositions dir (tree shows 5), 32-entry components dir + 9
subfamilies (tree shows 4), 9 template JSONs (shows 3), `hyperframes/`, `brand/`, `docs/`,
`references/`, `scripts/` (35 files), 12 root HTML galleries. Also stale: "Node.js 22 LTS"
(:102) vs actual node 24.14.0 (`.claude/tech-stack.md` and arch-decisions both already say
24 — CLAUDE.md contradicts the more-accurate memory docs), "VideoToolbox" claim (:101),
"`vitest` for compositions / `pytest` for wrappers" testing story (:105-109, :250). → Task 5.1.

### 9.2 [HIGH] `.claude/` memory contradicts itself on the branch merge-state, and two gotcha files are dangerously stale
- `scratchpad.md:200` "on branch `claude/recursing-tu-dac74b` (**not merged to main**)" and
  `NEXT-STEPS.md:91-93` "#0 Merge … main is behind" are BOTH FALSE — memory.md's 2026-06-26
  entry records the fast-forward merge and git confirms main == branch tip @ 79b5006. A
  future session following NEXT-STEPS #0 would try to merge an already-merged branch.
- `constraints-gotchas.md` claims "**No git repo yet** … you may need to `git init`" (!) and
  "faster-whisper … currently NOT wired in" (wired since 2026-05-15).
- `file-map.md`, `pipeline-architecture.md`, `project-structure.md` frozen at 2026-04-13
  (pipeline-architecture still lists whisper as "Planned"; file-map says transcribe.py "NOT
  yet wired", claims dirs that don't exist).
- `NEXT-STEPS.md:85-89` #4 says the Codex visual-audit MD hasn't landed — but
  `docs/codex-review/VISUAL-AUDIT-FROM-CODEX.md` exists (plus GEMINI variants and a
  VISUAL-AUDIT-RESPONSE.md suggesting it was already processed).
- `OVERNIGHT-PLAN.md` is a completed run (all boxes checked) sitting as if pending.
→ Task 5.3 rewrites these; the fix plan below tells you exactly what each file becomes.

### 9.3 [MEDIUM] Root directory contradicts the LOCAL-ONLY constraint and carries broken tooling
CONFIRMED: `VPS_DEPLOYMENT_GUIDE.md` (full Hostinger/systemd/MongoDB production guide —
directly contradicts CLAUDE.md:26-28), root `PORT-MAP.md` (VPS-era; superseded by PORTS.md
whose line 3 points at a DIFFERENT `../PORT-MAP.md` in the parent dir), `Dockerfile`
(node:22, `CMD npm run dev`, unused), `Makefile` (3 broken targets), `main.py` (uv-init
hello-world stub, flagged "Delete candidate" since April), `IMPLEMENTATION_QUICKSTART.md`
(references never-existent files), `docker-compose.dev.yml` (references the Dockerfile +
Redis "for future BullMQ" which Key-Decision-4 explicitly rejected). Also 12 committed root
HTML galleries with no index/doc pointing at them (INDEX.html links only 7). → Tasks 5.2, 5.4.

### 9.4 [MEDIUM] `.env.example` is 100% decorative
Every variable (`REMOTION_CONCURRENCY`, `REMOTION_QUALITY`, `FFMPEG_THREADS`,
`DEFAULT_VOICE`, `DEFAULT_LANGUAGE`, `OUTPUT_DIR`, 3 commented API keys) is read by NOTHING
(`process.env` usage repo-wide: only `HOME`, in 3 uv-path helpers; no dotenv loader exists).
No secrets in code anywhere (grep-verified); execa-array subprocess hygiene is clean
repo-wide. → Task 5.4 rewrites .env.example honestly.

### 9.5 [LOW] ADR discoverability
ADR-002/ADR-003 do NOT live in `.claude/arch-decisions.md` — they're at
`docs/research/wave-7/ADR-002-captions-register-aspect-matrix.md` and
`docs/research/wave-8/ADR-003-autoedit-pipeline.md`; ADR-002's header cites absolute paths
into the stale worktree. → Task 5.3 adds pointers.

### 9.6 [MEDIUM] Backup/robustness: 102 unpushed commits + tracked-but-mutable `public/audio.mp3`
- `git rev-list origin/main..main --count` → **102**. One laptop failure loses ~2 months.
  → Task 0.3 (with a privacy pre-check).
- `public/audio.mp3` is git-tracked but overwritten by every pipeline run
  (`pipeline.ts:136-140`) — permanent dirty-tree churn + a race if two runs overlap.
  → Task 5.11 unracks it (gitignore + `git rm --cached`).

---

## 10. FINDINGS — STRATEGY / PRODUCT / BLIND SPOTS

**S1. The roadmap's stack-rank is wrong.** `.claude/NEXT-STEPS.md` leads with merging an
already-merged branch and gallery polish, while the product's delivery stage (multi-platform
export) crashes or mangles output for the flagship vertical formats. Nothing in NEXT-STEPS
mentions the export layer at all. Re-rank: export correctness (Phase 1) > render-quality
fixes (Phase 2) > tests (Phase 3) > the LLM editing pass > more creator studies.

**S2. Native-aspect rendering is the strategic fix hiding behind the crop bug.** The repo
built 9x16 AND 16x9 variants of nearly everything (17 pairs!) yet the pipeline still renders
one master and crops it. Wiring `--platforms` to pick the aspect-native composition
(Task 4.7) converts an entire bug class into a product advantage no crop-based tool has.

**S3. The LLM editing pass should be a Claude-Code-session pass, not an API dependency.**
ADR-003 §5's `SuggestStrategy` seam + `packTranscript`'s reading substrate are ready. The
free/local constraint rules out a required API key — but the tool's actual operator IS a
Claude session. Design the strategy gate as: CLI emits `takes_packed.md` + a prompt file →
the operating agent (you/Opus/whoever runs the session) writes `strategy.json` → CLI
validates against a zod schema and builds the plan. Zero paid APIs, human-confirmable,
matches how this repo actually gets used. (Do NOT build this in this fix-pass; it's the
next feature after Phase 5.)

**S4. Test-language blind spot:** the overlay heuristics are tested in English for a
Spanish-content product (autoedit.test.ts:135-163), which is exactly why 4.9 shipped.
Task 2.6 adds Spanish fixtures; keep doing that for all text heuristics.

**S5. Self-eval exists but nothing runs it** (`selfEvalRender` has zero importers). QA that
doesn't run is documentation. → Task 2.11 wires it in with the 3-pass cap the module already
anticipates.

**S6. Memory-system entropy is a real operating risk for an agent-driven repo.** Two gotcha
files actively lie ("no git repo yet"), NEXT-STEPS' top item is done, scratchpad's resume
pointer is stale. For a project whose developer IS a rotating cast of agent sessions, stale
memory produces wrong actions, not just confusion (e.g., a session could try to "merge" the
branch or `git init`). Phase 5's doc pass is not cosmetic — treat it as operational safety.

**S7. What the team is probably wrong about (my read):**
- "The bake-off is still open" — it isn't; the sunk investment decided it (§12).
- "Production-correct per the 12-rules audit" — 4 of 12 verdicts are overstated (R2 hides a
  2-generation video / 4-generation audio encode chain; R7 is wrong outright; R6/R9 are
  graded by convention, not mechanism; R12's "sidecar" is actually `public/` accumulation).
- "More creator references = more value" — the overnight scan itself concluded ~everything
  is already covered (8 new patterns from ~150 videos). Diminishing returns are documented;
  the marginal hour goes further in Phases 1–3 than in creator study #23.

---

# 11. THE FIX PLAN (execute in order — one commit per task)

> Conventions for every task: run from the project root
> `/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion`
> unless stated. After EVERY code task: `npx tsc --noEmit` must be clean and `npm test` must
> pass before committing. Commit messages are given. If a Verify step fails, stop and
> investigate; do not stack further tasks on a red state.

---

## PHASE 0 — Environment, safety, backup (~30 min, do all of it first)

### Task 0.1 — Restore the main checkout's node_modules
```bash
npm install
npx tsc --noEmit        # expect: clean (worktree already proves the code is clean)
```
No commit (package-lock should be unchanged; if it changes, commit it alone:
`chore: refresh package-lock after clean install`).

### Task 0.2 — Rebuild the Python venv (broken shebangs from the Documents→Downloads move)
```bash
rm -rf .venv
uv sync
uv run python -c "import edge_tts, faster_whisper; print('ok')"
uv run pytest           # expect: exit code 5, 'no tests ran' — that's correct for now (Task 3.4 adds tests)
```
No commit (.venv is untracked).

### Task 0.3 — Push the 102-commit backup
Pre-check, then push:
```bash
gh repo view armandogon94/Video-Automation-Remotion --json visibility -q .visibility
# If PRIVATE → push. If PUBLIC → STOP and ask the user before pushing (repo contains brand
# assets and research docs; scraped creator media is gitignored, but confirm intent).
git push origin main
```
No commit.

### Task 0.4 — Remove the stale worktrees (reclaims ~10 GB and fixes the vitest double-glob at the root)
Safety checks are part of the task — run them, don't skip:
```bash
git worktree list
git log --oneline -1 claude/recursing-tu-dac74b   # MUST print 79b5006 (same as main). If not, STOP.
git -C .claude/worktrees/recursing-tu-dac74b status --short   # MUST be clean. If not, STOP and inspect.
git worktree remove .claude/worktrees/recursing-tu-dac74b
git worktree remove --force .claude/worktrees/agent-a590da53d970cc596   # locked; --force is required and safe (tip 575e16d is an ancestor of main)
git worktree remove --force .claude/worktrees/agent-ab34076ac91f171e4
git worktree prune
git branch -d claude/recursing-tu-dac74b
git branch -D worktree-agent-a590da53d970cc596 worktree-agent-ab34076ac91f171e4
du -sh .claude/worktrees 2>/dev/null   # expect: gone or ~0
```
No commit (worktrees are untracked metadata).

### Task 0.5 — Pin the test surface with a vitest config
Create `vitest.config.ts` at the root:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // .claude/worktrees copies must never be collected again:
    exclude: ["**/node_modules/**", ".claude/**", "hyperframes/**", "output/**"],
  },
});
```
**Verify:** `npm test` → exactly **3 files / 22 tests**, all passing.
**Commit:** `test: add vitest.config.ts — pin test glob to src/ (was double-running worktree copies)`

---

## PHASE 1 — Export-layer correctness (the product-breaking bugs)

### Task 1.1 — Fix the crop math in `src/ffmpeg/commands.ts`
At `commands.ts:19-20`, the `crop` mode filter is currently (landscape-only math):
```
crop=ih*${width}/${height}:ih, then scale
```
Replace the crop-mode expression with the direction-agnostic fill-crop already proven at
`renderFromPlan.ts:231`:
```ts
const cropFilter = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
```
(For "pad" mode, keep the existing pad logic but confirm it uses
`force_original_aspect_ratio=decrease` + centered pad; fix analogously if it has the same
directional assumption — read the file, it's ~40 lines.)
**Verify (empirically — create disposable inputs in the scratchpad dir, never in the repo):**
```bash
S=/private/tmp/claude-501/*/955a42cf*/scratchpad   # your scratchpad; use the literal path
ffmpeg -y -f lavfi -i testsrc2=size=1080x1920:rate=30:duration=2 -f lavfi -i sine=frequency=440:duration=2 -c:v libx264 -pix_fmt yuv420p -c:a aac "$S/vert.mp4"
ffmpeg -y -f lavfi -i testsrc2=size=1920x1080:rate=30:duration=2 -f lavfi -i sine=frequency=440:duration=2 -c:v libx264 -pix_fmt yuv420p -c:a aac "$S/horiz.mp4"
# then drive exportMultiPlatform over both via a tiny tsx script (or replicate its ffmpeg args):
# vert.mp4  → square  MUST succeed, 1080x1080
# vert.mp4  → youtube MUST succeed, 1920x1080
# horiz.mp4 → reels   MUST succeed, 1080x1920
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 <each output>
```
All 4 platform outputs must exist with exact target dimensions.
**Commit:** `fix(ffmpeg): direction-agnostic fill-crop in exportMultiPlatform — square from 9:16 crashed, reels from 16:9 kept a 607px strip`

### Task 1.2 — Fix normalizeAudio's 96 kHz output + stop re-encoding audio in resize
In `commands.ts:52-65` add after the loudnorm filter args: `"-ar", "48000"`.
In the platform resize step (`commands.ts:42-49`) replace the AAC re-encode with
`"-c:a", "copy"` (audio was just normalized; geometry changes don't need an audio encode).
**Verify:**
```bash
# run normalizeAudio on horiz.mp4 (or replicate args), then:
ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate,channels -of csv=p=0 <normalized.mp4>
# expect: 48000,2
```
**Commit:** `fix(ffmpeg): force 48kHz after loudnorm (was emitting 96kHz AAC); copy audio through platform resize (drop a lossy generation)`

### Task 1.3 — `exportMultiPlatform`: allSettled + partial-output cleanup
In `commands.ts:101-122`: switch `Promise.all` → `Promise.allSettled`; on each rejection
`fs.rmSync(outputPath, {force: true})`; log a per-platform result table; if any failed,
throw one aggregate `Error` naming the failed platforms (callers must still fail loudly).
**Verify:** unit-level — force one platform to fail (e.g. bogus dimensions in a test call)
and assert the other outputs exist, the failed file does NOT, and the call throws.
**Commit:** `fix(ffmpeg): exportMultiPlatform uses allSettled, deletes partial outputs, reports per-platform results`

### Task 1.4 — Thumbnail seek guard
`commands.ts:72-79`: replace `-ss 2` with `-sseof -0.5` (grab near the end; works for any
duration), or probe-and-clamp. Keep `-frames:v 1`.
**Verify:** thumbnail succeeds on a 1-second lavfi clip.
**Commit:** `fix(ffmpeg): thumbnail extraction works for sub-2s videos (-sseof)`

### Task 1.5 — Fail loudly on unknown template; parseInt radix
`pipeline.ts:179`: unknown template → throw
`` `Unknown template "${name}". Valid: ${Object.keys(compositionMap).join(", ")}` ``.
`generate.ts:81`: `parseInt(opts.fps, 10)`.
**Commit:** `fix(pipeline): error on unknown template instead of silently rendering ExplainerVideo; parseInt radix`

---

## PHASE 2 — Autoedit render correctness

### Task 2.1 — Edge padding for silence-trim keeps (fades stop eating speech)
In `src/autoedit/silenceTrim.ts`, add `padSeconds = 0.05` (option, default 0.05) applied in
`keepSegmentsFromSilences` AFTER the min-keep filter: expand each keep's start back / end
forward into the adjacent silence, clamped to `[0, durationSeconds]` and to half the gap to
the neighboring keep on each side (so padded keeps can never overlap; with defaults
0.05+0.05 < 0.5 min-silence this is guaranteed, but write the clamp anyway). Log dropped
sub-minKeep spans (see 4.15).
**Tests to add in `autoedit.test.ts`:** padded spans don't overlap; pad clamps at media
edges; pad ≤ half-gap under a tiny custom `minSilenceSeconds`.
**Commit:** `fix(autoedit): 50ms edge padding on silence-trim keeps — 30ms fades now land in silence, not on word onsets/tails (audit rule 7 was wrong)`

### Task 2.2 — Kill the cumulative frame drift (accumulate seconds, quantize per boundary)
Implement exactly the sketch in §4.3 in `toEditSegments` (silenceTrim.ts:164-196) and the
matching seconds-based shift in `shiftWordsToEditTimeline` (buildEditPlan.ts:37-65).
**Tests:** construct 25 keeps of length 1.03 s each at fps 30 → assert the LAST segment's
`editEndFrame === Math.round(25 * 1.03 * 30)` (773) — the OLD code gives 775 (25×31, since
round(1.03·30)=31); the new code must give 773. Also assert every boundary's
`|editStartFrame/fps − Σ prior lengths| < 1/(2·fps)`. Update any existing test expectations
that legitimately change (the current tests use whole-second spans, so they shouldn't).
**Commit:** `fix(autoedit): quantize edit timeline from cumulative seconds — per-segment rounding no longer accumulates caption/AV drift across cuts`

### Task 2.3 — Grade after tonemap; grade support in the multi-source path
Per §4.7: in `buildTrimConcatFilter` move the colorFix INTO each segment's chain before the
grade (`trim,setpts,${colorFix}${gradeF}`), remove colorFix from the post-concat scale
chain. Add `grade?: SegmentGrade` to `ReelBeat` (renderFromPlan.ts:525-535) and insert
`${gradeF}` after the per-input colorFix in `buildMultiSourceConcatFilter`.
**Tests (now possible because the builders are exported):** snapshot the filtergraph string
for (a) SDR 2-segment plan with one graded segment — grade present in `[v0]` chain only, no
lut3d; (b) HDR flag on — `lut3d` appears BEFORE the `eq=` grade in the same segment chain
and NOT after `[vcat]`; (c) multi-source beat with grade + isHdr — same ordering per input.
**Commit:** `fix(autoedit): apply HLG→SDR LUT per segment BEFORE creative grade (grades were running in HLG space on HDR sources); add per-beat grade to multi-source reels`

### Task 2.4 — Audio format normalization in both concat paths
Per §4.6: append `aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo` to
every per-segment/per-beat audio chain (replacing the bare `aresample=48000` in
multi-source; adding it in single-source).
**Verify (empirical):** scratchpad experiment — one mono + one stereo lavfi source through
`buildMultiSourceConcatFilter`'s graph → `ffprobe … stream=channels` on the output must be 2.
**Commit:** `fix(autoedit): normalize concat audio to 48kHz stereo fltp — mixed mono/stereo beats silently downmixed whole reels to mono`

### Task 2.5 — Handle audio-less sources + surface silencedetect failures
Per §4.8: audio-stream probe in `trimAndStageBaseClip` (+ `-an` video-only graph when
absent, and skip caption/fade audio parts); in `detectSilences`, treat
`exitCode !== 0 && intervals.length === 0` as an error using the existing actionable message.
**Commit:** `fix(autoedit): support audio-less sources; stop treating failed silencedetect runs as "no silences"`

### Task 2.6 — Fix the R2 enumeration heuristic (Spanish-hostile overlay suppression)
Implement the three changes in §4.9 (max-gap grouping ≤ 8 s, span cap ≤ 15 s,
interval-based suppression instead of `cooldownUntil`, prune `luego/después/siguiente` from
ordinals) in `src/autoedit/suggestOverlays.ts:178-211` + lexicon `:81-85`.
**Tests (Spanish fixtures):** scattered connectives → NO enumeration overlay + stat/brand
overlays still emitted; clustered `primero…segundo…tercero` (within 8 s) → ONE enumeration
overlay whose span covers only the cluster; a `$100` beat BEFORE the cluster is not suppressed.
**Commit:** `fix(autoedit): enumeration overlay requires clustered ordinals (8s max-gap, 15s span cap); suppression is interval-based; drop luego/después/siguiente from ordinal lexicon`

### Task 2.7 — Align whisper timings to the authored script text
Per §4.10: wire `alignScriptToWhisper` (src/timing/align.ts) into pipeline.ts stage 1.5
(lines 98-126). Read align.ts fully first; keep the whisper-failure fallback exactly as-is;
record `source: "whisper-aligned"` in `word_timings_final.json`.
**Verify:** `npm run generate -- --script "Claude es una inteligencia artificial de Anthropic" --template explainer --platforms youtube --output ./output/fable-verify-align` → open
`output/fable-verify-align/word_timings_final.json` — the `text` fields must reproduce the
script's exact words. Delete the output dir afterwards.
**Commit:** `fix(pipeline): captions use authored script text with whisper timings (alignScriptToWhisper was built for this and never wired)`

### Task 2.8 — Duration from audio, not last word + 0.5
Per §4.11 in pipeline.ts:143-145 (ffprobe the audio; take the max).
**Commit:** `fix(pipeline): video duration covers full audio tail (was lastWord+0.5s)`

### Task 2.9 — Clamp caption word-ends at segment/beat boundaries
Per §4.14: one `Math.min` in `shiftWordsToEditTimeline` (against
`seg.editEndFrame`-derived seconds) and one in `buildCombinedTranscript` (against the beat's
rebased end). Add one test each.
**Commit:** `fix(autoedit): clamp word end-times at cut boundaries (straddling words bled into the next segment)`

### Task 2.10 — Correct ffmpeg filter-arg quoting
Per §4.16 in `escapeFilterArg` (renderFromPlan.ts:165-167):
`return p.split("'").join("'\\''");` with the call sites keeping their surrounding quotes.
Add a unit test asserting the produced `lut3d=file='…'` string for a path containing `'`.
**Commit:** `fix(autoedit): ffmpeg-correct apostrophe escaping in filtergraph paths`

### Task 2.11 — Wire selfEvalRender into both render paths (capped)
In `renderEditedVideo` and `renderMultiSourcePlan`, after `renderMedia` succeeds:
```ts
const evalResult = await selfEvalRender(outputPath, planLike, { passNumber: 1 });
log(evalResult.durationOk
  ? `self-eval OK (Δ ${evalResult.durationDeltaSeconds.toFixed(3)}s) — report: ${evalResult.reportPath}`
  : `self-eval DURATION MISMATCH (Δ ${evalResult.durationDeltaSeconds.toFixed(3)}s) — inspect ${evalResult.reportPath}`);
```
For the multi-source path, synthesize the `BoundarySpec` from the beats' cumulative frames.
Do NOT auto-loop 3 passes yet (that's the future orchestrator); one mandatory pass + a loud
log is the win. Expose `--no-self-eval` in `cli.ts` for opt-out.
**Commit:** `feat(autoedit): run selfEvalRender after every render (duration check + cut contact sheet); --no-self-eval opt-out`

---

## PHASE 3 — Make the gates real

### Task 3.1 — Unit tests for the ffmpeg builders and transcript math
New file `src/autoedit/renderFromPlan.test.ts` covering (all pure, all already exported):
- `buildTrimConcatFilter`: 1-segment and 3-segment plans → snapshot the full filtergraph;
  assert fade `st`/`d` values for a 0.1 s segment (clamped to d=0.05); assert grade/LUT
  ordering (from Task 2.3); assert `aformat` presence (Task 2.4).
- `buildMultiSourceConcatFilter`: 2 beats, one HDR → per-input `lut3d` only on the HDR one;
  input indices `[0:v]`/`[1:v]` correct.
- `buildCombinedTranscript`: words filtered to [start,end), rebased offsets, `totalFrames`,
  boundary clamp (Task 2.9).
- `buildSceneProps`: register 'none' → empty captions; custom position passthrough;
  layoutTrack forwarding.
New file `src/ffmpeg/commands.test.ts`: assert the exact argv arrays built for each platform
(dimensions, fill-crop expression, `-ar 48000`, `-c:a copy`, faststart) — refactor
`exportMultiPlatform` minimally if needed so arg-construction is a pure exported function
(`buildPlatformArgs(platform, input, output)`); that refactor belongs in THIS commit.
**Verify:** `npm test` → 22 + (expect ~20 new) all green.
**Commit:** `test: cover ffmpeg filtergraph/argv builders and multi-source transcript math`

### Task 3.2 — Golden E2E on synthetic media (stage-1 only; no Chrome needed)
New file `src/autoedit/staging.e2e.test.ts` (include it in vitest config; mark with a
generous timeout): generate a 6 s lavfi test clip with two loud tones separated by 1 s of
silence (sine + volume automation, or concat three lavfi pieces); run `detectSilences` →
`keepSegmentsFromSilences` → `toEditSegments` → `trimAndStageBaseClip`; ffprobe-assert on
the staged clip: duration within 1 frame of `editDurationFrames/fps`, `sample_rate=48000`,
`channels=2`, `color_transfer=bt709`, width/height exact. Write all temp files under
`os.tmpdir()`, clean up in `afterAll`.
**Commit:** `test(e2e): synthetic-media golden test for silence-trim → staged clip (duration/audio/color assertions)`

### Task 3.3 — Make eslint real
```bash
npm install -D eslint@^9 @remotion/eslint-config@4.0.443   # check the config package's flat-config export first
```
Create `eslint.config.mjs` using `@remotion/eslint-config`'s flat export (read its README in
node_modules; Remotion 4.0.443 ships flat-config support — if it genuinely doesn't, use
`typescript-eslint` recommended + `eslint-plugin-react-hooks` and say so in the commit).
Change package.json script to `"lint": "eslint src"` (no `--ext`). First run will surface
real findings — fix ONLY mechanical ones (unused vars etc.); anything behavioral becomes a
`// TODO(lint)` and a note at the bottom of `.claude/NEXT-STEPS.md`.
**Verify:** `npm run lint` exits 0 (or exits documenting only the TODOs).
**Commit:** `chore(lint): working flat-config eslint (script had never run: no config, invalid --ext, unpinned transitive eslint)`

### Task 3.4 — Minimal real pytest suite
Create `tests/python/test_tts_helpers.py` and `tests/python/test_transcribe_formats.py`
testing the pure helpers: word-distribution math in `src/tts/generate.py` (sentence → even
word spread; 100-ns tick conversion) and `format_timestamp_srt` +
the words→JSON shape in `src/transcribe/transcribe.py` (refactor helpers to be importable
without side effects if needed — keep `if __name__ == "__main__":` guards). Add
`[tool.pytest.ini_options] testpaths = ["tests/python"]` to pyproject.toml.
**Verify:** `uv run pytest` → collected > 0, all pass.
**Commit:** `test(python): first real pytest coverage for TTS timing math and transcript formatting`

---

## PHASE 4 — Performance & pipeline leverage

### Task 4.1 — Stop `public/` bloat
(a) In `renderEditedVideo` / `renderMultiSourcePlan`, after a successful render, delete the
staged clip (`fs.rmSync(stagedClipPath, {force:true})`) — add option
`keepStagedClip?: boolean` (default false) for debugging.
(b) New script `scripts/prune-staged-clips.sh`: deletes `public/autoedit/*.mp4` older than
7 days; wire as `npm run clean:staged`.
(c) Document in `.claude/constraints-gotchas.md` (rewritten in Task 5.3): "everything under
`public/` is copied into EVERY webpack bundle — keep it lean; mattes live in `public/matte`
on purpose (compositions reference them via staticFile), staged clips must not accumulate."
**Verify:** run any autoedit render (or the Task 3.2 E2E plus a manual check) → staged clip
gone afterwards.
**Commit:** `perf(autoedit): delete staged base clips after successful renders + prune script (public/ is copied into every bundle; it had grown to 1.3GB)`

### Task 4.2 — Make `bundleOnce` memoize (name becomes true)
Implement the cache sketch in §6.4 in `src/autoedit/bundleOnce.ts`; `cleanupBundle` evicts
from the cache. Update the file's header comment (it currently documents non-memoizing
behavior).
**Verify:** temporary script calling `bundleOnce` twice with the same entry → second call
resolves instantly to the same dir (log timestamps); then delete the script.
**Commit:** `perf(render): bundleOnce now actually bundles once per entryPoint per process (runStyledReel was webpack-bundling ~3GB twice per run)`

### Task 4.3 — Shared `renderComposition()` helper; migrate the 3 core call sites
Per §6.4. New `src/autoedit/renderComposition.ts`; migrate `pipeline.ts:148-216`,
`renderFromPlan.ts:446-495`, `renderFromPlan.ts:791-826`. Deduplicate the progress logger
(fix the %25 repeat-logging NIT here). Also consolidate `probeDurationSeconds` into ONE
export (put it in a small `src/autoedit/ffprobe.ts` or alongside renderComposition) and
import it in cli.ts + selfEvalRender.ts. Do NOT migrate the run*/scripts drivers in this
commit.
**Verify:** tsc + tests + one real `npm run generate` smoke (any script, `--platforms youtube`, delete output after).
**Commit:** `refactor(render): single renderComposition() helper for bundle/select/render — pipeline + both autoedit paths; dedupe ffprobe helper`

### Task 4.4 — (intentionally left empty — folded into 4.3)

### Task 4.5 — Edge-TTS word boundaries + negative rate/pitch
Per §4.12/§4.13: `boundary="WordBoundary"` in generate.py (keep even-spread as fallback);
pipeline.ts passes `--rate=${rate}` / `--pitch=${pitch}` single-token.
**Verify:** `uv run python src/tts/generate.py generate --text "Hola mundo, esto es una prueba" --voice es-MX-JorgeNeural --output-dir ./output/fable-verify-tts` → word timings JSON has
non-uniform, per-word offsets; then delete the dir. Also verify `--rate=-20%` parses.
**Commit:** `fix(tts): real per-word timestamps from edge-tts WordBoundary; negative --rate/--pitch no longer break argparse`

### Task 4.6 — Trim the font-weight fetch storm
In `src/brand/fonts.ts`, pass `{weights: […], subsets: ["latin","latin-ext"]}` options to
each `loadFont()` matching only the weights actually used in `FONT_STACKS`/compositions
(grep `fontWeight` usage to build the list). Add
`ignoreTooManyRequestsWarning` only if a residual warning is justified.
**Verify:** `npx remotion compositions src/index.ts` → the "Made 49 network requests"
warning is gone or drastically reduced.
**Commit:** `perf(fonts): load only used weights/subsets (was 49 requests for Inter alone per render session)`

### Task 4.7 — Native-aspect platform rendering (the strategic export fix)
In `pipeline.ts`: build a per-template aspect map — when a requested platform's aspect
differs from the master composition's and an aspect-native variant exists (start with just
`explainer` → `ExplainerVideoVertical`, the pair that exists today), render THAT composition
for those platforms instead of cropping the master. Platforms sharing the master's aspect
keep the current path. Structure it as a small lookup:
`const verticalVariant: Record<string,string> = { ExplainerVideo: "ExplainerVideoVertical" }`.
Fall back to (now-correct) crop when no variant exists, and LOG which path was used.
**Verify:** `npm run generate -- --script "Prueba de plataformas" --template explainer --platforms youtube,reels --output ./output/fable-verify-native` → the reels output is
1080×1920 rendered from ExplainerVideoVertical (check the log + ffprobe), captions intact
full-width. Delete the dir after.
**Commit:** `feat(pipeline): render aspect-native composition variants per platform (reels/tiktok from ExplainerVideoVertical) instead of cropping the master`

### Task 4.8 — OPTIONAL (skip unless the user asks): VideoToolbox for final platform exports only, with `-b:v` (never `-crf`), behind a `--hw` flag. If skipped, ensure Task 5.1 removed the doc claim.

---

## PHASE 5 — Consolidation, docs, memory (make the repo tell the truth)

### Task 5.1 — Rewrite CLAUDE.md's stale sections
Fix ONLY these (keep the file's voice and the sections that are accurate — handoff spec,
creators workflow, memory rules):
- Project Structure tree → regenerate from reality (`src/autoedit/`, `src/brand/`,
  `src/timing/`, `src/animation/`, `src/matting/`, real compositions/components/templates
  counts, `docs/`, `references/`, `scripts/`, `hyperframes/` per Task 5.10's outcome, root
  galleries pointer, `.claude/` full inventory).
- Tech table: Node 24 (matching `.claude/tech-stack.md`), ffmpeg 8.x, pinned vitest 4.1.2 /
  zod 4.3.6, REMOVE "VideoToolbox HW accel" (or reword per Task 4.8's outcome), testing row
  → "vitest (src/**/*.test.ts) + pytest (tests/python/)".
- Commands: remove `npm run render` (or keep it only if Task 5.4 aliases it), add
  `npm run autoedit`, `npm run clean:bundles`, `npm run clean:staged`.
- Bake-off note → link the §12 verdict (per Task 5.10).
**Commit:** `docs: CLAUDE.md matches the July codebase (structure tree, versions, commands, testing story)`

### Task 5.2 — Quarantine the VPS-era contradictions
```bash
mkdir -p docs/legacy
git mv VPS_DEPLOYMENT_GUIDE.md PORT-MAP.md IMPLEMENTATION_QUICKSTART.md VIDEO_PIPELINE_RESEARCH.md docs/legacy/
git rm Dockerfile Makefile main.py
```
- Add a 3-line header to each moved file: "LEGACY (April 2026 research). This project is
  LOCAL-ONLY; do not follow deployment instructions here."
- `PORTS.md:3` — fix its reference (it currently points at `../PORT-MAP.md` in the PARENT
  directory; after the move, point at `docs/legacy/PORT-MAP.md` or drop the line).
- `docker-compose.dev.yml`: it references the deleted Dockerfile — either delete the file
  too (nothing in the current workflow uses it; PREFERRED) or strip it to the redis-free
  minimum. Check `.claude/commands.md` for references first.
- Makefile's useful bits (`clean`, etc.) — confirm none are load-bearing (`grep -rn "make "
  docs .claude *.md`) before deleting; port anything real to npm scripts.
**Commit:** `chore: quarantine VPS-era docs to docs/legacy, delete dead Dockerfile/Makefile/main.py (LOCAL-ONLY project)`

### Task 5.3 — Repair the .claude/ memory system
- `constraints-gotchas.md`: REWRITE. Remove "no git repo yet" and "whisper not wired".
  Keep/collect the real live gotchas: background-clip:text opaque-box, Zod-v4
  defaultProps rule, Node-24 note, bundle-leak + `clean:bundles`, public/-copied-per-bundle
  (Task 4.1c), scrape-vs-render conflict, worktree hygiene ("never leave merged worktrees;
  vitest/tsc/glob tools see them"), two-output-dirs note.
- `NEXT-STEPS.md`: delete #0 (merge already done — say so), mark #4 done-or-verify (the
  Codex MD exists; check `docs/codex-review/VISUAL-AUDIT-RESPONSE.md` and record the
  verdict), append a pointer: "FABLE.md fix-plan is the active backlog as of 2026-07-02".
- `scratchpad.md`: replace the stale RESUME POINTER with: work is merged @ main; FABLE.md
  is the plan; keep the historical sections below intact.
- `file-map.md`, `project-structure.md`, `pipeline-architecture.md`: regenerate the factual
  sections (file-map can be terse — a tree + one-liners; pipeline-architecture must describe
  stage 1.5 whisper + stage ordering as implemented in pipeline.ts TODAY, plus the autoedit
  flow cli.ts documents in its header).
- `arch-decisions.md`: add two pointer lines to the real ADR files
  (`docs/research/wave-7/ADR-002-…`, `docs/research/wave-8/ADR-003-…`); fix ADR-002's
  header paths that point into the deleted worktree.
- `OVERNIGHT-PLAN.md`: prepend "COMPLETED 2026-06-25 — archived".
- `memory.md`: APPEND a dated entry summarizing this review + link FABLE.md. Do not rewrite
  history entries.
**Commit:** `docs(memory): repair .claude/ — stale merge-state, fictional gotchas, regenerate file-map/pipeline-architecture, ADR pointers`

### Task 5.4 — Kill or honor the dead surfaces
- package.json: delete the `"render"` script (generate.ts covers it) — and remove it from
  README (below).
- Delete `src/compositions/index.ts` (zero consumers — re-grep first:
  `grep -rn "compositions/index\|from ['\"]\./compositions['\"]" src scripts`).
- Delete `src/timing/easing.ts` `outQuint`/`outExpo` (re-grep names first).
- `.env.example`: rewrite to tell the truth — header "No environment variables are currently
  read by this project" + keep the commented future-API-key placeholders only if you also
  add the comment "not implemented".
- README.md: fix `npm run render` (:162), the tests claims (:301, :339-341), add two
  sentences on autoedit + the galleries, correct Node version.
- gitignore + untrack the churn file: `git rm --cached public/audio.mp3` and add
  `public/audio.mp3` to .gitignore (pipeline recreates it every run).
- INDEX.html: add links to the 5 galleries it misses (ABHI-COMPARE, CROSS-CREATOR-COMPARE,
  DECISIONS, PROJECT_CONTEXT, + any other unreferenced) so the root HTMLs have one entry point.
**Commit:** `chore: remove dead render script/barrel/easings, truthful .env.example, README corrections, untrack mutable public/audio.mp3, complete INDEX.html`

### Task 5.5 — Type consolidation (two sub-commits)
(a) Widen `nonOverlappingGroups`/`findKeyword` params in `src/timing/align.ts` to
`TimedWord[]`; delete the 4 casts (`EditorialCaption.tsx:293`, `FloatingCaption.tsx:413`,
`ChunkedPhraseCaption.tsx:156`, `SplitWebcamScreen9x16.tsx:76`).
**Commit:** `refactor(timing): widen align.ts param types to TimedWord — deletes all 4 word-timing casts`
(b) Export `wordTimingSchema` from `src/compositions/schemas.ts`; rename the colliding
`WordTiming` export in `TalkingHeadDynamic9x16.tsx:96` (e.g. `TalkingHeadWordTiming`);
replace local schema copies with the import ONLY in files where `diff` shows field-identity
(script the diff; expect ~25 of 33 to be identical; leave divergent ones). This is the one
mechanical task where you must go file-by-file — budget it accordingly.
**Commit:** `refactor(schemas): single exported wordTimingSchema; replace N identical local copies; rename colliding WordTiming export`

### Task 5.6 — Brand hex sweep
Replace the ~77 brand-hex literals in the 25 offender files with `BRAND`/palette imports
(the agent-measured counts: `#D4AF37`×26, `#0F1B2D`×26, `#FAF7F2`×14, `#1B3A6E`×11; start
from `SceneSequencer9x16.tsx:52-55`). LEAVE non-brand creator-parity hexes alone.
**Verify:** `grep -rn "#1B3A6E\|#D4AF37\|#0F1B2D\|#FAF7F2" src/compositions --include="*.tsx" | grep -v "brand/"` → 0 hits (allow hits in `src/brand/` itself and in comments).
Spot-render 2 touched comps (`npx remotion render src/index.ts SceneSequencer9x16 <scratchpad>/ss.mp4 --frames=0-10 --log=error`) and eyeball a frame.
**Commit:** `refactor(brand): compositions import brand colors — removed 77 hardcoded brand hexes across 25 files`

### Task 5.7 — calculateMetadata for the 4 content-driven durations
Per §5.1: SceneSequencer9x16 (use its exported constant/summing function),
StatCardSequenceWithUnderlines9x16, AppScreenCarousel9x16, ModelNameChipComparison9x16.
Export each comp's existing duration formula and reference it from Root.
**Verify:** `npx remotion compositions src/index.ts` still lists all 130; the four now show
prop-derived defaults.
**Commit:** `fix(comps): prop-derived durations via calculateMetadata for the 4 comps whose literals truncated content in Studio/direct renders`

### Task 5.8 — Merge ONLY the SpeakerOverlayScene pair (78% identical, autoedit's render target)
Extract `src/compositions/scenes/SpeakerOverlaySceneCore.tsx` (or alongside the existing
`scenes/` dir); keep both registered ids as thin wrappers with aspect defaults. The Phase
2/3 tests + a before/after render of each id (first 30 frames, diff a frame visually) are
the safety net. **Do not touch the other 16 pairs** (documented decision, §5.2).
**Commit:** `refactor(scenes): single SpeakerOverlaySceneCore behind both aspect wrappers (was 78% byte-identical)`

### Task 5.9 — Truth-comments in templates/*.json (`"_note": "display-only; render defaults live in src/pipeline/pipeline.ts buildProps()"`). **Commit:** `docs(templates): mark JSONs display-only`

### Task 5.10 — Close the bake-off (see §12 for the full rationale to paste into the docs)
```bash
git tag hyperframes-final-0.6.7   # preserves the whole tree forever
git rm -r hyperframes/
```
- BAKEOFF.md: replace the body with a short VERDICT section (date, decision = Remotion,
  the §12 reasoning bullets, "resurrect via `git checkout hyperframes-final-0.6.7 -- hyperframes/`").
- CLAUDE.md: remove the two-engine framing (Task 5.1 coordinates); scratchpad note.
- .gitignore: drop the hyperframes/* lines.
**If the user has expressed ANY recent intent to run the bake-off, downgrade this task to
"add a DORMANT banner to BAKEOFF.md" and skip the removal — check with them if unsure.**
**Commit:** `feat!: close the bake-off — Remotion wins; hyperframes archived at tag hyperframes-final-0.6.7`

### Task 5.11 — NIT sweep (single commit)
All items from §4.20 + §6.6 + the AbhiScene accent comment (§5.5) + zod-validate
`brands.ts:69` + fix `editPlan.ts:47`'s dead `src/schemas.ts` reference.
**Commit:** `chore: nit sweep — packTranscript --gap guard, provenance label, progress-log dedupe, CountUpStat .shape, brands.ts validation, comment fixes`

### Task 5.12 — Final verification sweep + memory update
```bash
npx tsc --noEmit                      # clean
npm test                              # all green (3 original + new files)
npm run lint                          # clean or documented TODOs
uv run pytest                         # collected >0, green
npx remotion compositions src/index.ts | tail -5    # 130 comps still listed
git push origin main
```
Append the completion entry to `.claude/memory.md` (date, "FABLE.md plan executed through
Phase N", any tasks skipped and why). **Commit:** `docs(memory): record FABLE fix-pass completion`

---

# 12. BAKE-OFF RECOMMENDATION — Remotion wins; archive Hyperframes

> **SUPERSEDED by owner decision 2026-07-06:** Armando ruled to KEEP BOTH engines as living
> options (see BAKEOFF.md header + DOGFOOD-PLAYBOOK.md §9.5). Task 5.10's removal step is
> CANCELLED; the "what would change my mind" run (§12.5, one real script through both
> engines) is now a standing attended task instead. The analysis below stands as the record
> of why Remotion is the default.

**Recommendation: declare Remotion the winner and remove `hyperframes/` (preserved under a
git tag), exactly via BAKEOFF.md:128's own "If Remotion wins" recipe.** (Task 5.10.)

Reasoning, in order of weight:
1. **Revealed preference is unanimous.** Since the bake-off was set up (2026-05-15), 100% of
   feature investment went to Remotion: 130 compositions, 23 abhi replicas, 55 cross-creator
   pairings, the liquid-glass atom family, and the entire autoedit subsystem — which is
   architecturally Remotion-ONLY (SpeakerOverlayScene + overlay registry + EDL props).
   Hyperframes got 2 commits ever and has been untouched since 2026-06-01; it can't even run
   today (no node_modules).
2. **The original decision criterion was never exercised and no longer matters.** BAKEOFF.md
   wants "the same script through both, judge visually" — that never happened, and the
   library moat (creator-replica templates) now IS the product. Re-platforming 110k lines of
   TSX onto HTML+GSAP is not a real option; keeping the challenger "just in case" is pure
   carry cost (duplicated brand assets ×3, duplicated caption styling ×6 templates, dual
   Node-version docs, every doc explaining two engines).
3. **The one thing Hyperframes offered — a simpler authoring model — lost to network effects
   in-repo:** the abhi/cross-creator studies produced Remotion components, the QA machinery
   (contact sheets, galleries, self-eval) targets Remotion renders, and the Zod-props +
   calculateMetadata idioms carry the automation.
4. **Risk of removal ≈ zero:** a git tag preserves the full tree; the shared pieces
   (Edge-TTS, whisper, `src/ffmpeg/commands.ts`) live outside `hyperframes/` and stay.
5. **What would change my mind:** if the user still intends to run the visual bake-off on a
   real script (the scratchpad says one was being written in project 17), do that ONE run
   first — Phase 1's export fixes benefit both engines — then decide. Absent that intent
   within a couple of weeks, archive.

---

# 13. BLIND SPOTS / QUESTIONS FOR THE TEAM

1. **Is the first real Armando Inteligencia script still coming from project 17?** The
   scratchpad (2026-05-15) says the bake-off waits on it; nothing since. If yes → run it
   through the Phase-1-fixed pipeline before Task 5.10 removes Hyperframes. If it already
   happened, the memory system missed recording the single most important product event.
2. **Which galleries must keep working?** `output/` in the main checkout holds only 1.6 MB
   (`test-run/` from April) — the abhi/cross-creator render artifacts the galleries reference
   lived in the (now-removable) worktree's `output/` (4.8 GB). Before Task 0.4, decide:
   copy `output/abhi/`, `output/cross-creator*/`, `output/qa-*` from the worktree into the
   main checkout (they're gitignored — disk-only), or accept that the compare-HTML `<video>`
   tags dangle. **Recommendation: copy them (they're the visual QA record), THEN remove the
   worktree.** This is the one destructive-adjacent decision in the plan — if in doubt, ask.
3. **Whisper "small" for Spanish brand names** — is `small` chosen deliberately? Task 2.7's
   alignment mostly neutralizes text errors, but timing quality on proper nouns might justify
   `medium` on M-series (still fast). Measure once, decide, record in memory.
4. **Who consumes `REPORT.md`?** The project-17 handoff contract (CLAUDE.md) is documented
   but no `output/<slug>/REPORT.md` generator exists in `src/` (only the convention). Is
   that authored manually per request? If it's supposed to be automated, it's missing.
5. **`src/matting/` (924 MB of mattes, RVM tooling)** — no finding flagged it, but nothing
   in the render paths consumes `foregroundMatte` yet beyond the schema seam. Is
   depth-compositing still on the roadmap, or is 924 MB of matte data parked speculation?
6. **Are the E-15 typology's palette choices (cream/ink/warm-red) intended to override the
   navy/gold brand for some template families?** Today 25 files hardcode brand hexes and
   several families intentionally diverge — Task 5.6 preserves the divergences, but a
   one-paragraph brand-vs-parity policy in CLAUDE.md would stop future sessions from
   "correcting" either direction.
7. **Retention policy for `references/creators/`** — multiple GB of scraped media with
   "KEPT until user signs off" notes from June. Sign-off status? (Not touched by this plan.)

---

# 14. VISUAL INSPECTION ADDENDUM (frames actually looked at — 2026-07-02)

> Added after the initial report: a frame-level visual pass over the existing renders in the
> worktree's `output/` (4.8 GB). Method: read the pre-made QA contact sheets
> (`output/qa-liquidglass/*.png`, `output/abhi-qa/*.png`) and generated fresh frame grids in
> the scratchpad from: the real production video
> (`output/2026-05-18-gemini-3-2-flash-leak/remotion-v2/master.mp4`, 42.6 s, sampled every
> 2.8 s = 15 frames), the multi-source autoedit reel (`output/autoedit/claude-cowork-reel.mp4`,
> 8 frames), the single-source HDR edit (`output/autoedit/IMG_3618-edit.mp4`), a caption-style
> edit (`cap-hormozi-pop-edit.mp4`), and full-res frames from 6 cross-creator comps
> (BigNumberHero9x16, BenchmarkBars9x16, ModelNameChipComparison9x16,
> BeforeAfterSliderWipe9x16, ConcentricHierarchyRadialCallout9x16, MatrixGridHeatmap9x16).
> **Coverage honesty:** ~10 of 360 MP4s were eyeballed — a stratified sample of the highest-value
> outputs, not an exhaustive pass. The 23 abhi replicas were NOT re-judged frame-by-frame here
> (their sheets are too downscaled to re-verify; they already went through 5 recorded QA cycles).

### V1 [HIGH — CONFIRMED on frames] Overlay text collision in the shipped production video
- **Where seen:** `2026-05-18-gemini-3-2-flash-leak/remotion-v2/master.mp4` around t≈25 s:
  the center headline "92% del rendimiento de GPT-5.5" is OVERPRINTED with a second overlay
  "<200ms latencia" — two overlay beats rendered simultaneously, both illegible.
- **Why:** the W21 overlay track (`output/2026-05-18-…/audio/overlays.resolved.json` +
  the `scripts/render-w21-*.ts` drivers) has overlapping `[from,to)` windows and nothing
  validates non-overlap; the composition simply stacks both.
- **Fix (Task V.2 below):** add an overlap validator wherever an overlay track is assembled
  (a pure helper `assertNonOverlappingWindows(overlays: {fromFrame,toFrame}[])` in
  `src/autoedit/suggestOverlays.ts` or a small shared module; call it from `buildEditPlan`
  AND from the W21/manual-overlay script path). On conflict: clamp the earlier beat's
  `toFrame` to the later beat's `fromFrame` and log loudly. Add a unit test.
- Also confirms the whisper-verbatim caption problem in production (§4.10): burned captions
  read "GPT cinco punto cinco. Veinticinco centavos" and "doscientos milisegundos" — spoken-
  number transcriptions where the authored script/overlays use "GPT-5.5", "$0.25", "200 ms".
  Task 2.7 (align to script text) is therefore not cosmetic; it is visibly shipping wrong today.

### V2 [HIGH — CONFIRMED on frames] Caption legibility fails over bright footage (editorial-cyan style)
- **Where seen:** `claude-cowork-reel.mp4` — captions "ahora Anthropic saca Claude Cowork,
  Claude" over a bright window/ceiling and "disponible para usuarios del Plan Max, pero"
  over open sky are washed out to near-illegible. The `editorial-cyan` FloatingCaption style
  renders white/cyan text with no scrim, no box, and (apparently) minimal stroke; its
  already-spoken words additionally dim to low-alpha gray, which makes them vanish entirely
  on bright regions (also visible in `IMG_3618-edit.mp4`: the gray "Netflix." tail).
  By contrast `hormozi-pop` (heavy stroke + caps) stayed legible in every sampled frame.
- **Fix (Task V.1 below):** give every light-on-footage caption style a guaranteed-contrast
  treatment in `src/components/FloatingCaption.tsx` (and the caption components under
  `src/components/captions/`): either (a) a subtle rounded scrim behind the text block
  (`backgroundColor: "rgba(0,0,0,0.35)"`, padding ~0.4em, borderRadius ~12) — simplest and
  robust; or (b) a real text stroke via `WebkitTextStroke` + `textShadow` (0 2px 12px
  rgba(0,0,0,0.55) alone is NOT enough over sky). Apply to `editorial-cyan`, `slide-clean`,
  `blur-premium`, and raise the past-word dim floor (e.g. opacity ≥ 0.75 with the same
  scrim). Do NOT change `hormozi-pop`/`box-highlight` (already contrast-safe).
- **Verify:** re-render `cap-editorial-cyan-edit` (driver: `src/autoedit/runCaptionShowcase.ts`)
  or any 2-s slice over the balcony/sky footage; extract the caption frames; text must be
  readable over the sky. Commit: `fix(captions): guaranteed-contrast scrim for light caption styles — white text was illegible over bright footage`

### V3 [MEDIUM — CONFIRMED on frames] The production video is visually empty for long stretches, including the hook
- **Where seen:** in the 15-frame dense sample of the Gemini master, ~7 frames are a bare
  cream background with only the small bottom caption strip — including the entire first
  ~3 seconds (the hook: nothing on screen but a faint caption while the voiceover talks).
  Center overlays (GEMINI 3.2 FLASH / 15× MÁS BARATO / $0.25 / LISTA HOY) are good when
  present, but the duty cycle is roughly 50% empty frame.
- **Why it matters:** for short-form vertical content the first 1–2 seconds decide retention;
  an empty cream frame with a 40-px caption is a weak hook, and the long gaps between beats
  read as dead air visually even when the voiceover is dense.
- **Fix (Task V.3 below — editorial guardrail, not a refactor):** (a) extend
  `selfEvalRender`'s checklist with two automatable checks: "first 2 s contain a non-caption
  visual element" and "no gap > 4 s between overlay beats" — both computable from the
  overlay track (pure function + unit test; report-only, no auto-fix); (b) when authoring
  W21-style videos, require a persistent kicker/brand element (see V4) so no frame is
  fully bare. This feeds the future LLM strategy pass (§10-S3) as hard constraints.

### V4 [LOW — CONFIRMED on frames] No brand mark anywhere in the production master
- **Where seen:** the Gemini master has no `@armandointeligencia` chip and no watermark in
  any sampled frame (the autoedit reels DO show the handle chip bottom-center; the abhi/
  PromptCardPedagogy comps show brand chips). The E-15 cream/ink/warm-red palette is used —
  intentional per the typology — but nothing on screen says whose video it is until/unless
  an outro card appears.
- **Fix (Task V.4 below):** decide the policy (§13 Q6) and, assuming "brand chip everywhere",
  add the existing `BrandWatermark`/handle-chip component to the W21 template compositions
  (default on, prop to hide). One-line per comp registration once the policy is decided.

### V5 [LOW] Mixed-language defaults in creator-replica comps
- **Where seen:** cross-creator frames render English defaults ("One field. Three layers.",
  "ATTENTION IS A MATRIX", "BEFORE/AFTER") in an otherwise Spanish-first product. Fine for
  replica-fidelity QA against English source creators; a trap when a comp is reused for real
  content with default props. No code change now — add one line to the §13 Q6 policy note
  ("replica comps keep source-language defaults; production use MUST pass Spanish props").

### V6 [POSITIVE — visually verified] Things that looked right (do not touch)
- **HDR→SDR color path is visually correct:** natural skin tones, correct blue shirt, no
  red/oversaturation shift in `claude-cowork-reel.mp4` and `IMG_3618-edit.mp4` (both from
  iPhone HLG sources through the `hlg_to_sdr.cube` LUT). The LUT + SDR-retag chain works.
- **Multi-source reel assembly looks clean:** beat joins sampled showed no visible jump-cut
  artifacts, aspect fill is correct, b-roll beats intercut sensibly.
- **PromptCardPedagogy9x16 / LiquidGlassShowcase sheets:** brand-correct gold-on-navy glass
  cards, clean progressive bullet reveals, handle chip present. (LiquidGlassShowcaseB's
  warm olive backdrop reads muddy in stills — showcase-only comp, NIT, no action.)
- **hormozi-pop caption style** is contrast-safe as shipped.

## §14.2 SECOND PASS — full template sweep, both aspects (2026-07-02, later the same day)

> Method: labeled mid-frame (t = 55% of duration) contact sheets for EVERY rendered template
> family, both aspects: 13/13 16:9 cross-creator comps, 15 16:9 test-videos (incl.
> SpeakerOverlayScene16x9 + 4 real-content pieces), all 38 remaining 9:16 cross-creator comps,
> all 24 abhi replicas, all 29 overlay-molecule demos (mg/new/new2/combo), all 32 pipeline
> template previews (`_template-previews/`), SceneSequencer9x16 (7-frame strip),
> `tella-16x9-demo` (layout-track), and the only existing vanilla `npm run generate` output
> (April `test-run/video_…_youtube.mp4`, 6-frame strip). Coverage after both passes:
> **~175 of 360 rendered MP4s eyeballed at least at one frame; every template FAMILY sampled.**
> Limits: mid-frame stills can't judge MOTION (easing, flicker, timing feel) — see the
> remaining-work list at the end of this section.

### V7 [HIGH — CONFIRMED on frames] `GradientHeadlineCard` breaks Spanish words mid-word
- **Where seen:** `output/autoedit/new2/GradientHeadlineCard.mp4` mid-frame renders the
  headline as "INTELIG / ENCIA / ARTIFICI / AL" — hard breaks inside both words.
- **Where to fix:** the GradientHeadlineCard overlay molecule (`src/components/overlays/` —
  grep for `GradientHeadlineCard`). Almost certainly `wordBreak: "break-all"` (or a
  too-narrow fixed-width container with `overflowWrap: "anywhere"`). Fix: `wordBreak:
  "normal"`, `overflowWrap: "normal"`, and size the font down / container up (the existing
  `fitText`/`@remotion/layout-utils` used elsewhere in the repo is the right tool).
- **Verify:** re-render that one demo (`npx tsx src/autoedit/runNewOverlayDemos.ts` renders
  the new2 set, or a 30-frame direct render) and re-extract the mid-frame: no mid-word breaks
  with the default Spanish headline.
- **Commit:** `fix(overlays): GradientHeadlineCard no longer breaks words mid-word (INTELIG/ENCIA) — fit text instead of break-all`

### V8 [MEDIUM — CONFIRMED on frames] Overlay anchoring ignores safe areas: edge clipping, handle-chip collisions, face overlap
- **Where seen (all in `output/autoedit/mg/`):** `avail-bullets.mp4` — the bullet list is
  flush against the LEFT frame edge and its longest line is clipped ("EL FUTURO DEL TRABAJO
  CON I…"); `hook-stat.mp4` — the purple chip is clipped at the left edge; `avail-chips.mp4`
  — the third chip's text is cut AND the chip row crowds the `@armandointeligencia` handle
  chip; `features-bullets.mp4` — the list renders directly OVER the speaker's face
  (top-left anchor + close-up framing).
- **Fix:** in the overlay anchor→position mapping (the shared anchor logic used by the
  OV molecules — `src/components/overlays/`, likely a shared `anchorStyle()` helper or
  per-molecule `anchor` switch): (a) enforce a safe-area inset (≥ 48 px at 1080-wide) on
  every edge; (b) treat the bottom-center handle-chip zone (~bottom 140 px, center third) as
  reserved — bottom-anchored overlays sit above it; (c) constrain overlay text blocks to
  `maxWidth` with ellipsis/fit rather than clipping. Face overlap is an authoring problem
  (the suggester can't see the face) — mitigate by defaulting list-type overlays to the side
  anchors and documenting "top-left collides with close-ups" in the molecule's schema
  description.
- **Verify:** re-render the `mg` demo set; all four frames above must show unclipped text
  and no handle-chip overlap.
- **Commit:** `fix(overlays): safe-area insets + reserved handle-chip zone in anchor layout — mg demos clipped text at frame edges`

### V9 [MEDIUM — CONFIRMED on frames] LayoutTrack split-layout clips region content; camScale crops the face
- **Where seen:** `output/autoedit/tella-16x9-demo.mp4` — in the split layout the screen
  panel's label column is cut by the region boundary ("ORGANIZA"→"NIZA", "RESUME"→"ME"),
  i.e. content is rendered at canvas coordinates and window-clipped by the region instead of
  being laid out inside it; and in the full-cam beat the `camScale` zoom crops the top of
  the speaker's head (focal point too low for this footage).
- **Where to fix:** `src/components/layout/LayoutTrack.tsx` (+ `LayoutPresets.ts`): the
  screen layer's content must be scaled/inset to the region box (translate+scale the child,
  not just `overflow:hidden` window-clip), and the split preset needs an inner padding.
  The face-crop is data (the demo's `camFocusYPct`), but add a sanity default: when
  `camScale > 1` and no focus is given, default focus to `{0.5, 0.35}` (faces live in the
  upper part of talking-head footage), and document it in `regionSchema` (editPlan.ts:286-295).
- **Verify:** re-render the tella demo; labels fully visible inside the split panel; head
  not cropped in the zoom beat.
- **Commit:** `fix(layout): region content lays out inside its box (split layout clipped label column); saner camScale default focus`

### V10 [MEDIUM — CONFIRMED on frames, April-era render] The vanilla `npm run generate` explainer output is visually empty AND its caption collapses word spacing
- **Where seen:** the only existing vanilla pipeline render,
  `output/test-run/video_1775103743346_youtube.mp4` (April 2): all six sampled frames across
  its duration show ONLY a navy background, a small gold dash, and the caption strip — the
  ExplainerVideo template's title/content never appears. AND the caption karaoke highlight
  collapses spaces around the highlighted word: "Cinco claves para**implementar**inteligencia
  artificial" renders as "paraimplementarinteligencia" — the exact word-span-whitespace bug
  class that was found and fixed in AbhiWaveformTranscript in June (NEXT-STEPS "#5 …fixed a
  real wrap bug (word spans lacked inter-word whitespace)") but evidently still lives in the
  ORIGINAL `src/components/Caption.tsx` used by the pipeline templates.
- **Caveats:** this render predates the 2026-05-15 brand/watermark work — treat it as "last
  known output", not current. But NO newer vanilla-generate render exists anywhere on disk
  (the May 18 production piece used custom `scripts/render-w21-*.ts`, not `npm run
  generate`), so the flagship CLI path is UNVERIFIED in its current state.
- **Fix (Task V.5):** (a) read `src/components/Caption.tsx` and fix the highlighted-word
  span spacing exactly as AbhiWaveform was fixed (breakable space / explicit ` `+space
  between word spans); (b) run the Phase-2 verify smoke (`npm run generate -- --script
  "Cinco claves para implementar inteligencia artificial en tu empresa" --template explainer
  --platforms youtube --output ./output/fable-verify-explainer`), extract a 6-frame strip,
  and LOOK: title/content must appear, watermark must be present, caption spacing intact;
  (c) if the frame is still bare navy for most of the duration, fix ExplainerVideo's
  content timing/props (its sections/title should persist, not vanish after the intro) —
  read `src/compositions/ExplainerVideo.tsx` and `pipeline.ts buildProps()` together.
- **Commit:** `fix(captions+explainer): karaoke highlight no longer eats inter-word spaces; explainer content visible across full duration`

### V11 [LOW — CONFIRMED on frame] `BrandedOpener9x16` default prop misspells the brand in English
- **Where seen:** `output/cross-creator/BrandedOpener9x16.mp4` mid-frame reads
  "ARMANDO **INTELLIGENCE** / AI · BRAND · VOICE" — the brand is "Armando Inteligencia".
  (The abhi `AbhiBrandLockup` gets it right: "ARMANDO INTELIGENCIA.")
- **Fix:** correct the defaultProps/schema default in `src/compositions/BrandedOpener9x16.tsx`
  (+ its Root.tsx registration if duplicated there) to `ARMANDO INTELIGENCIA` (and the
  sub-line to Spanish: `IA · MARCA · VOZ` — check the source reel it replicates first; if
  the English is replica-parity-intentional, add the V5 policy comment instead of changing it).
- **Commit:** `fix(comps): BrandedOpener default says ARMANDO INTELIGENCIA (was English "INTELLIGENCE")`

### V12 [LOW — pattern, CONFIRMED across many frames] Recurring low-density / low-contrast template patterns (one polish list, not urgent)
Collected so a single polish pass can address them; none is individually blocking:
- **Near-invisible network graphics:** NeuralNetwork9x16/16x9 (hollow nodes + faint edges,
  dark variants almost blank), ForceGraph9x16/16x9 (tiny cluster + overlapping node labels,
  huge empty margins).
- **Outline-only bars:** ThreeStageRisingBars16x9 / `gemini-version-bars` — bar fills are so
  dark they read as empty rectangles at midpoint (both renders agree, so it's the style, not
  a mid-animation artifact).
- **Sparse mid-frames in content comps:** benchmark-cream/dark previews (two thin bars in an
  otherwise empty frame), wave3-table (2 tiny rows), DecisionTree both aspects (tree crammed
  into one quadrant), EditorBlock (near-empty editor), StatCardSequence (small bottom-left
  text, 80% black), SceneSequencer's FIRST frame fully empty (the hook — same V3 disease),
  diagram-explainer dark variant's pending step is dark-on-dark invisible.
- **Small collisions:** BrollListicle list number vs its text ("1 10x más barato" reads as
  "110x" — add a separator/spacing), OpeningTitleCard title box hugging the left edge with
  the right 60% empty.
- **Aspect-pair drift, concrete evidence:** VennDiagram9x16 shows all three set labels at
  midpoint; VennDiagram16x9 shows none (only "Sweet spot") — the 17 copy-paste pairs (§5.2)
  are already drifting visually, which is the argument for the §5.2 merge policy.
- **Fix:** fold into a single `chore(comps): density/contrast polish pass` after Phase 5,
  guided by this list; raise node/edge opacity + fill contrast, add minimum-content rules,
  and re-render the affected previews. Not scheduled into Phases 0–5 (polish, not defect).

### V13 [POSITIVE — second-pass verifications, do not touch]
- **16:9 is NOT the weak side:** all 13 16:9 cross-creator comps + the 16:9 test-video set
  render brand-consistent, legible, watermarked frames (KeynoteSlidePIP, StudioCompositor,
  ModelComparison2x2Grid, TweetCardHero16x9, karpathy-trio, intro-deskhead all clean).
- **The 23 abhi replicas hold up** at mid-frame (only AbhiBrowserMockup's midpoint is
  near-empty — likely between beats). AbhiBrandLockup spells the brand correctly.
- **Boxed overlay styles are uniformly legible** (CountUpStat, SentimentKeyword,
  ChecklistTypeOn, LowerThirdNameTag, StatRowTriple, cb1–cb6 combos) — every legibility
  failure in the demos is bare/unboxed text, which independently confirms the V2 fix
  direction (scrim/box beats bare text on footage).
- **cb5-depth-caption works:** the behind-speaker "NETFLIX" depth text renders correctly
  occluded by the head — the matting/depth pipeline's marquee effect is real.
- **SceneSequencer/PromptCardPedagogy/liquid-glass:** brand-correct navy/gold/cream.

### Visual-QA tasks (execute inside the phases)
- **Task V.1** (do with Phase 2, right after Task 2.11): caption contrast scrim — see V2.
- **Task V.2** (do with Phase 2, after Task 2.6): overlay-track overlap validator — see V1.
  Commit: `fix(overlays): validate + clamp overlapping overlay windows (production video shipped two overprinted beats)`
- **Task V.3** (do with Phase 3, after Task 3.1): selfEval density checks (hook-visual +
  max-gap) as pure functions with tests. Commit: `feat(selfeval): overlay-density checks — bare hook and >4s visual gaps are flagged`
- **Task V.4** (do with Phase 5, alongside Task 5.6): brand chip on W21/content templates
  once §13 Q6 is answered. Commit: `feat(brand): handle chip on content templates by default`
- **Task V.5** (do with Phase 2, alongside Task 2.7): Caption.tsx word-spacing fix +
  explainer visual smoke — see V10.
- **Task V.6** (do with Phase 2, after Task 2.6): overlay safe-area/anchor fixes — see V8.
- **Task V.7** (do with Phase 2, anytime): GradientHeadlineCard word-break fix — see V7.
- **Task V.8** (do with Phase 4, near Task 4.7): LayoutTrack region-content layout +
  camScale focus default — see V9.
- **Task V.9** (Phase 5 or later, optional): BrandedOpener brand spelling (V11) + the V12
  density/contrast polish list as one chore commit.
- **Standing rule for Opus:** after ANY render-affecting change in Phases 1–2, extract a
  4×2 frame grid of one affected output into the scratchpad and LOOK at it (the exact
  ffmpeg one-liner is in this addendum's header method note) — duration checks alone missed
  every one of V1–V4, and mid-frame sheets missed nothing but MOTION.

## §14.3 THIRD PASS — motion, all caption styles, fidelity sample (2026-07-02, same day)

> Method: dense frame strips (3–6 fps windows — stills can't feel easing, but strips expose
> flicker, popping, transition quality, and rhythm), a 1 fps full-watch strip of the
> production master (43 frames), mid-frames of the 6 previously-unchecked caption styles,
> and side-by-side source|replica pairs (6 abhi from `output/abhi/source-scenes/`, 4
> cross-creator from `output/cross-creator/srcframes/`).

### V14 [POSITIVE — motion verified] The liquid-glass atoms animate cleanly
25-frame strips (every 6th frame) of `LiquidGlassShowcase9x16.mp4` and
`PromptCardPedagogy9x16.mp4`: GlowPulseOverlay's two-stage border-settle→glow-bloom is
smooth and monotonic; ArcLightWipe's gold swoosh sweeps coherently over ~0.4–0.5 s;
LitSphereGlyph holds steady (no shimmer/jitter); PromptCardPedagogy's card scale-in, per-
bullet type-on rhythm (~0.6 s/bullet) and clause-highlight slide-in are all smooth. **Zero
frame-to-frame flicker anywhere.** No action.

### V1-UPGRADE [HIGH — CONFIRMED in motion] TWO overlay collisions, ~3 s each, plus a quantified 58% empty duty cycle
The 1 fps full watch of the Gemini master (43 frames) + a 3 fps close-up of t=22–30 s:
- Collision #1 at ~t=19–20 s: "15× MÁS BARATO" overprinted with "$0.25 / $2.00 por millón
  de tokens".
- Collision #2 at t≈24.7–27.5 s: "92% del rendimiento de GPT-5.5" and "<200ms latencia"
  co-occupy the center slot SOLIDLY for ~3 seconds — both fully opaque, no crossfade. This
  is overlapping `[from,to)` windows in the overlay track, definitively not a transition
  artifact. Task V.2's validator must clamp BOTH occurrences' pattern (beat N's exit
  overlapping beat N+1's entrance by seconds, twice in one 42 s video).
- Empty duty cycle quantified: ~25 of 43 sampled seconds (~58%) show NO visual besides the
  bottom caption strip, including the entire first second (the hook). Feeds Task V.3's
  max-gap check with a real number.
- Caption karaoke rhythm itself is even and flicker-free; the sentence-swap fade is ~0.5 s
  of half-transparent caption, which compounds the V2 legibility problem over bright footage.

### V2-EXTENSION [HIGH — CONFIRMED on frames] 5 of 8 caption styles are contrast-unsafe; 3 are safe
All 8 styles now frame-checked over the same bright-balcony footage
(`output/autoedit/cap-*-edit.mp4`):
- **SAFE (leave alone):** `hormozi-pop` (heavy stroke + caps), `box-highlight` (boxed
  current word), `condensed-hype` (stroke).
- **UNSAFE (need Task V.1's scrim/stroke):** `editorial-cyan`, `classic`, `slide-clean`
  (thin weight, worst of the set), `blur-premium` (words near-invisible mid-blur-transition
  — consider shortening its blur window too), `type-terminal` (small mono, no backing).
Task V.1's style list is now exact: apply the scrim to those five; don't touch the three safe ones.

### V15 [MEDIUM-confidence sample — fidelity mostly holds; gallery source-frame mismatches are real] Replica-vs-source spot check
- **abhi (6 side-by-side pairs at matched 60% timestamps):** BigStat, TitleCard,
  FeatureRows, TweetCard, PhoneMockup are excellent 1:1 style matches (typography, accent
  colors, card chrome, dot-grid details; BigStat/FeatureRows even localized to Spanish).
  NodeGraph's pair was unjudgeable (the source's 60% frame lands on a dark transition).
  Sampled fidelity is consistent with the recorded 9–9.5/10 — no re-litigation needed.
- **cross-creator (4 pairs vs gallery `srcframes/`):** TechNewsFlash and BenchmarkBars
  plausibly match their sources' style; but BrandedOpener's gallery source frame is a
  fitness-stage speaker and BigNumberDuel's is a learning-curve chart — neither resembles
  the replica. BigNumberDuel is explicitly on NEXT-STEPS' "#1 tail — rows still on resolver
  fallback" list, so this CONFIRMS that for fallback rows the gallery's source column is
  not evidence of fidelity (and BrandedOpener behaves like an unlisted fifth member of that
  list — worth adding). No new code work; annotate the gallery rows (ties to the already-
  skipped "ADAPTED badge" decision) rather than chase better sources (diminishing returns
  already documented).

### What is still NOT visually inspected (honest gap list)
1. ~~**Motion quality**~~ — **DONE in §14.3** via 3–6 fps strips (liquid-glass atoms clean;
   Gemini master's two collisions + 58% empty duty cycle; caption rhythm even). Residual
   gap: strips can't hear AUDIO — cut pops/clipped word-tails (§4.4) still need one
   listen-through of an autoedit output; and AbhiScrambleOpener's scramble was only seen at
   one frame.
2. ~~**6 of the 8 caption styles**~~ — **DONE in §14.3** (V2-EXTENSION: exact safe/unsafe
   split for all 8 styles).
3. ~~**Replica fidelity vs source**~~ — **SAMPLED in §14.3** (V15: 6 abhi + 4 cross-creator
   pairs; abhi holds, gallery fallback-row source frames are not evidence). Full 55-pair +
   23-pair re-verification remains un-redone — rely on the recorded 5 QA cycles.
4. **Hyperframes engine output** — only 2 spike frames exist (`output/spike-frames/hf-*.png`);
   no full Hyperframes video was ever rendered. Irrelevant if Task 5.10 archives the engine.
5. **Platform exports** — `master.reels/tiktok/shorts.mp4` of the Gemini piece were probed
   (1080×1920, correct) but not frame-diffed against the master; and no `square` export
   exists anywhere (it would have crashed — §4.1).
6. **`availv2/`, `depth-*`, styled-reel punchy/editorial variants, sprint5/6 smoke dirs** —
   same comps/templates as sheets above in other configurations; spot-check only if their
   base findings get fixed.
7. **The 5 original pipeline templates in CURRENT form** — TalkingHead, Listicle, QuoteCard,
   ExplainerVideoVertical have NO render on disk at all; ExplainerVideo only as the April
   artifact (V10). Task V.5's smoke render closes this for explainer; render the other four
   once during Phase 2 verification (one 10 s script each) and eyeball the strips.

# 14.4 FOURTH PASS — FULL-LIBRARY MOTION QA (2026-07-02, five parallel reviewers)

> Method: EVERY rendered video (220 of ~222 renderable files) reviewed across its FULL
> animation arc — 24-frame strips (32 for the 65 s reels) at ~0.2 s sampling, plus ~48
> dense/full-res re-extracts to confirm or refute every suspect, plus objective
> `freezedetect` measurement on the abhi set. Reviewers were primed with V1–V15 so
> everything below is NEW. False alarms were actively falsified (7 suspects cleared and
> documented: BrollListicle "chip jump", StatCardSequence "gaps" (crossfades),
> SplitWebcamScreen z-order, NeuralNetwork16x9 "dead last frame" (tile padding),
> action-flipchart "hard ending" (clean fade), av5 kicker drift, depth-matte halos (clean)).
> Artifacts: scratchpad `vqa-arc/{cc916,mix169,abhi,tpl,ov,dense}/`.
> Coverage: cross-creator 44×9:16 + 13×16:9 + Listicle/TalkingHead (unsuffixed), abhi 24,
> template-previews 32, test-videos 15, showcases/liquid-glass 5, autoedit 82.
> NOT rendered anywhere (still unverifiable): QuoteCard + ExplainerVideoVertical current form.

### V16 [HIGH — VERIFIED, systemic] Big-keyword text overflows the frame — including in the deliverable reels
- **Where seen (9 videos, one root cause):** `claude-cowork-reel-punchy.mp4` — banner
  keywords clipped at BOTH edges and held there: "8 HORAS → MINUTOS"→"HORAS → MINUT"
  (t≈2–6 s), "¿PARA TU EMPRESA?"→"ARA TU EMPRES" (t≈33–39 s), "LAUDE COWORK" (t≈6–10 s);
  `claude-cowork-reel-editorial.mp4` — "HERRAMIENTAS" final "S" clipped (t≈41–45 s);
  `var/d09-slide-up` ("AUTOMÁTI[CO]"), `var/t09-mask-wipe` ("ANTHR[OPIC]" ~40% off-frame),
  `var/d06-side-mask` ("FUTUR[O]"), `var/d04-typewriter` ("INTELIGENCI[A]"),
  `var/t02-fade-up` (zero right margin). All full-res confirmed.
- **Root cause:** the big-keyword/banner text lane has NO width-fit or safe-margin logic —
  any string wider than ~1000 px overflows the 1080 px canvas and HOLDS there (these are
  end-states, not slide-throughs).
- **Fix (Task V.10):** find the molecule(s): grep the rendered strings' prop sources —
  `runVariationsShowcase.ts` (drives var/*), `runStyledReel.ts` (drives the punchy/editorial
  keyword lane), then the component they mount. Apply `@remotion/layout-utils`
  `fitText`/`measureText` (already used elsewhere in the repo) with
  `maxWidth = canvasWidth − 2×64px` safe margin; shrink font-size to fit, never clip.
  Verify by re-rendering `var/d09`, `var/t09` and a 10 s slice of the punchy reel — all
  words fully inside frame.
- Related, same commit: `var/t10-rise-line`'s reveal never completes ("ORGANIZ[A]" — a
  TIMING truncation, not width): reveal duration must be ≤ clip duration.

### V17 [HIGH — VERIFIED, systemic across ALL sets] Build-then-freeze: choreography ends at ~1.5–2 s, the rest of the video is a still
- **Evidence (measured, not eyeballed):** abhi set via `freezedetect`: 11 of 24 replicas
  pixel-frozen for 46–83% of their runtime (worst: AbhiQuoteCard 83%, AbhiGridVsTerminal
  82% incl. a 9.5 s continuous dead tail on a 14 s video, AbhiComparisonTable/FeatureRows
  77%). Cross-creator 9:16: ~12 comps frozen 60–80% (BrandedOpener 81%, LockedFeatureRow
  80%, EditorBlock/KineticTypoCard 75%). Cross-creator 16:9: 11 of 13 frozen 55–70% after a
  ~2 s build. Test-videos: TweetCardHero16x9 ~95% static over 10 s,
  TitleCardKineticTwoLine16x9 static ~94% ("kinetic" in name only), BigNumberHero16x9 79%,
  AnimatedTable/BarChartList 70%. Template previews: tnf-refactor 85%, diagram-dark-v2 57%.
- **The passing comps show the fix:** AbhiAppCard/PhoneMockup/Waveform (idle float/pulse),
  KeynoteSlidePIP (slow zoom), ModelComparison2x2Grid (roving highlight),
  PaintStrokeRibbonBanner (wipe-in → hold → fade-OUT), RingTopologyHopCounter (counter runs
  to the last frame), TokenStream (cursor blink), ForceGraph (drift).
- **Fix (Task V.11):** one systemic pass, two options per comp: (a) add ambient/idle motion
  after the build (float, glow drift, cursor, slow zoom — pick per family, ≤4 px movement),
  or (b) shorten the registered duration to build+hold (~build_end + 1.5 s). Do NOT hand-
  tune 40 comps individually first — add a shared `useIdleDrift(frame, startFrame)` helper
  and apply to the frozen list. The full frozen list with percentages is in the §14.4
  reviewer tables (scratchpad artifacts) — work from it.
- **Same-family timing defects to fix in the same pass (all VERIFIED):**
  - Dead hooks: QuoteCard9x16 — screen empty for the FIRST 2.1 s (42%) before the quote
    fades in; 11 of 13 16:9 comps have a watermark-only first ~0.2 s frame; SceneSequencer's
    first frame is fully empty (known).
  - Payoff-too-late: RankedTierList9x16's #1 item enters at t≈4.3 of 5.06 s (readable
    ~0.6 s); MatrixGridHeatmap9x16's stat caption lands <0.5 s before end; template-preview
    `terminal` is CUT MID-WORD on its final payoff line ("2 advisori▍"); StatCardSequence
    hook title lives only ~0.7 s. Rule to encode: final beat must hold ≥1.5 s; first visual
    must appear ≤0.5 s.

### V18 [MEDIUM-HIGH — VERIFIED] Handle-chip zone violations are a confirmed CLASS (strengthens V8/Task V.8)
- `new2/StatRowTriple` AND `combo/cb4-stats-marker`: the @armandointeligencia chip prints
  ON TOP of the stat card, hiding the middle stat's "ACTIVOS" label (same molecule, both
  videos, full-res confirmed). `availv2/av2-typewriter`: terminal line runs UNDER the chip
  ("PLAN MAX" hidden). `var/t12-mono-terminal`: near-touch crowding. `mg/features-chips`:
  chips double-printed over EACH OTHER and clipped at the left edge (persistent, not
  mid-morph). Plus duplicate branding: `combo/cb1` renders the handle twice (nametag already
  contains it), `mg/follow-outro` shows avatar chip + handle chip simultaneously.
- **Fix:** same Task V.8 implementation (reserved bottom zone + safe-area insets) now has
  its verification list: re-render StatRowTriple, cb4, av2, features-chips, t12 and confirm
  zero chip overlaps; de-duplicate the handle when a nametag/outro already carries it
  (prop: `showHandle={false}` passed by those molecules).

### V19 [MAJOR — VERIFIED] SpeakerOverlayScene9x16's default/demo render shows NO overlays at all
- `test-videos/SpeakerOverlayScene9x16.mp4`: all frames + full-res checks show ONLY the
  "BASE VIDEO" placeholder and handle chip for the whole 5 s, while
  `SpeakerOverlayScene16x9.mp4` renders its full 4-item "EDICIÓN AUTOMÁTICA" checklist with
  gold active-item highlighting. IMPORTANT nuance: the REAL autoedit renders through this
  same scene work (cowork reels show captions/overlays), so this is the 9:16 defaultProps/
  demo overlay layout positioned off-canvas — an aspect-pair drift bug, and more evidence
  for Task 5.8 (merge the 78%-identical pair). Fix with Task 5.8 or as a quick
  defaultProps correction; verify via `npx remotion render SpeakerOverlayScene9x16` strip.

### V20 [MEDIUM — VERIFIED] Template-preview set: 7 fails, mostly stale variants and placeholder decisions
- `wave2-talkinghead-dynamic`: 100% empty for the entire arc + an exposed two-tone
  background seam — nothing but the kicker ever renders (the placeholder well IS the video).
- `split-webcam`: permanent empty gray top half; "BOOM" rides red-on-red on the divider;
  final 0.5 s fully empty.
- `diagram-explainer-preview` + `diagram-explainer-v2`: TRUNCATED build — step 3 never
  appears, connecting arrow lands in the last 0.2 s (v3 shows the corrected pacing —
  these are stale variants that should be deleted or re-rendered from the current comp).
- `diagram-dark` (v1): ALL step titles dark-on-dark for the full arc (worse than the known
  pending-step note; v2 fixed it — another stale variant).
- `terminal`: payoff line cut mid-word at the final frame (see V17 timing rule).
- `tnf-refactor`: single beat frozen ~85%.
- **Fix (Task V.13):** delete or regenerate the stale preview files (they misrepresent the
  current comps to anyone browsing `_template-previews/`), and make the placeholder wells
  (talkinghead-dynamic, split-webcam) render a labeled demo fill instead of emptiness.
- Also verified here: all 7 cream/dark palette pairs have IDENTICAL arcs (no palette drift)
  — the drift problem is aspect pairs (V19, VennDiagram), not palette pairs.

### V21 [MEDIUM — VERIFIED] The original Listicle and TalkingHead templates (current form) have content defects
- Found as unsuffixed `cross-creator/Listicle.mp4` + `TalkingHead.mp4` (default props,
  5 s): **Listicle** — title says "Top 5 Tendencias de IA" but only 3 items ever appear
  (defaults mismatch), the list occupies a small top-left region (~80% of the 16:9 frame
  empty), title alone for ~1.2 s. **TalkingHead** — the avatar slot renders as a bare gold
  disc for the whole video (no default avatar asset), and the TITLE FADES OUT mid-video
  leaving a nearly empty frame; name tag + watermark only content thereafter.
- **Fix (Task V.14):** align Listicle defaults (5 items or title "Top 3"), scale its layout
  to use the frame; give TalkingHead a default avatar (`brand/logos/avatar-pixar.png` via
  staticFile) and keep the title persistent. Fold into Task V.5's smoke-render batch
  (which must also render QuoteCard + ExplainerVideoVertical — still zero renders on disk).

### V22 [LOW-MEDIUM — VERIFIED] Micro-defect sweep list (bundle into one commit, Task V.15)
- `ModelNameChipComparison9x16`: model-name pill goes fully blank ~0.10–0.15 s at EVERY
  label swap (and blank first 0.25 s) — text pops with a gap instead of rolling.
- `TalkingHeadDynamic9x16`: full→split layout change at t≈3.0 is a 1–2-frame hard snap
  while everything else in the family eases.
- `TechNewsFlash9x16`: 0.3–0.4 s blank headline gap between beat 1 exit and beat 2 entry.
- `OpeningTitleCard9x16`: ends on 1–2 pure-black frames (no exit transition).
- `overlay-anim-demo`: brain emoji exit degrades into a gray blob for ~2 frames (dense-
  confirmed rendering glitch); "RIGHT WORDS" crowds the handle chip baseline.
- `var/d02-chapter-numeral`: giant gold "01" sits on the speaker's face the whole clip.
- Both cowork keyword reels: "SÍGUEME" overlay persists ~20 s to end (overlay never exits).
- `AbhiKineticSubtitle`: "OBSOLETE" stamp marquee-wraps with a visible snap ~every 0.7 s
  (SUSPECT vs source intent — check the abhi reference before changing).
- `AbhiWaveformTranscript9x16`: transcript text missing Spanish accents ("subtitulos
  automaticos" → "subtítulos automáticos") — content, not rendering.
- `mg/cta-callout` + `mg/setup-brand`: overlay text over the speaker's face (V8 class).
- SceneSequencer: small gold progress element clipped at the very top edge (SUSPECT-minor).
- `wave2-counter-cream` says "GPT-5.5" where bignum says "GPT-5" (copy inconsistency).
- karpathy-trio: all three cards read "Dejó OpenAI" (flagged; likely intentional pattern).

### V23 [POSITIVE — motion-verified, do not touch]
- All 12 `trans/` xfade variants: correct timing, zero ghosting/double-print.
- Depth mattes (`cb5`, `IMG_3618-depth`): occlusion boundary follows hair correctly at full
  res, no halo — the matting pipeline is genuinely clean.
- Karaoke word ORDER/progression correct in all 8 caption styles; zero whitespace-collapse
  regressions anywhere in the abhi/FloatingCaption paths (the April bug is isolated to the
  old pipeline `Caption.tsx`, V10).
- Base `claude-cowork-reel`: consistent captions across every cut, no layout jumps at scene
  changes — the multi-source assembly is visually clean in motion.
- `MetricBarsComparisonCard`, `ConcentricHierarchy`, `PipelineFlow`, `SpectrumSlider`,
  `RingTopologyHopCounter`, `TerminalCommand`, `action-flipchart`, `sparkline` pair,
  `DecisionTree16x9`, liquid-glass COOL variant: exemplary cadence — use these as the
  reference standard when fixing V17.

### New tasks from this pass (splice into the phases)
- **Task V.10** (Phase 2, HIGH): keyword width-fit + safe margins — see V16. Commit:
  `fix(overlays): fitText + safe margins on big-keyword lanes — reel banners were clipping off-frame`
- **Task V.11** (Phase 5, systemic): idle-motion/duration-matching pass over the frozen
  list + the ≥1.5 s final-hold / ≤0.5 s first-visual timing rules — see V17. Commit:
  `feat(comps): idle motion + choreography-duration alignment across frozen templates`
- **Task V.12** (with Task 5.8): SpeakerOverlayScene9x16 default overlay layout — see V19.
- **Task V.13** (Phase 5): regenerate/delete stale template previews; label placeholder
  wells — see V20. Commit: `chore(previews): regenerate stale diagram/tnf previews; labeled placeholder fills`
- **Task V.14** (with Task V.5): Listicle/TalkingHead default-prop fixes + render the two
  never-rendered templates — see V21.
- **Task V.15** (Phase 5): micro-defect sweep — see V22 list. Commit:
  `fix(comps): motion micro-defects — chip-swap blanks, layout snap, headline gap, black end frames, emoji exit glitch`
- **§14.2 gap list update:** motion is now FULLY DONE (220/222 files, full-arc, five
  reviewers + freezedetect). Remaining unverified: audio listen-through (§4.4 fades),
  QuoteCard + ExplainerVideoVertical renders (folded into Task V.14), platform-export
  frame diffs.

# 14.5 POST-REVIEW ADDENDUM (2026-07-06) — V24, found by DOGFOODING and already FIXED

### V24 [CRITICAL — VERIFIED + FIXED in `9ec50d2`] EDL overlays fired at scene t=0 instead of their planned beat
- **How found:** ran a real austin.marchese talking-head clip through the full
  `npm run autoedit -- --render` pipeline (the product's core promise). The planner correctly
  scheduled `YellowGlowWordCallout "99"` for frames 384–422, but the render showed the yellow
  "99" at frame ~30 (12 s BEFORE the word was spoken) and nothing at frame 400.
- **Root cause (three-part):** `buildSceneProps` (renderFromPlan.ts) dropped `fromFrame`,
  `toFrame` AND `anchor` when mapping the plan to scene props; both SpeakerOverlayScene
  variants mounted overlays with NO `<Sequence>` timing; overlay molecules self-animate from
  `useCurrentFrame()` with `enterFrame` default 0 — so every suggested overlay entered at
  scene frame 0 and exited ~24 frames later, for every EDL render ever made. All demo drivers
  masked it (they pass `enterFrame` manually). This also refines V19: the demo invisibility
  was this same class.
- **Fix shipped:** `sceneOverlaySchema` gains optional `fromFrame/toFrame` (Zod-v4 convention
  respected); `OverlayLayer` wraps timed overlays in `<Sequence from … layout="none">`;
  `buildSceneProps` forwards window + anchor; `RenderMultiSourceOptions.overlays` typed for
  windows. Verified by re-render: frame 30 clean, callout pops exactly on the spoken word.
  tsc clean, 22/22 tests.
- **For Opus:** Task 3.1's tests should now ALSO assert `buildSceneProps` forwards
  `fromFrame/toFrame/anchor` (regression lock for this bug), and Task V.12/5.8 (scene-pair
  merge) must preserve the Sequence-mounting behavior in the shared core.

# APPENDIX A — Findings the review VERIFIED AS CLEAN (do not "fix" these)

- Zero unregistered compositions; zero comp-id charset violations.
- Zero live `background-clip:text` (55 grep hits are all comments documenting avoidance).
- Zero render-path nondeterminism (all PRNGs seeded; the one `new Date(ms)` is seeded).
- Zero `<Video>` usage; 15 files correctly on `OffthreadVideo`.
- Zod defaultProps convention: zero violations across 292 `.default()` fields.
- interpolate() clamping: the 19 files without `extrapolate` all interpolate spring outputs
  (intentional overshoot) — not a bug class.
- Subprocess hygiene: 100% execa array-args; no shell interpolation anywhere.
- No secrets in code; no dotenv-loaded config to leak.
- `bundleOnce` adoption 100% (the leak fix holds); `selfEvalRender.ts`'s ffmpeg
  comma-escaping is correct; `scripts/gen_hlg_lut.py` and `clean-remotion-bundles.sh` are
  well-built; `scrape-reels.py` is injection-safe.
- The 100-ns tick math in edge-tts handling is correct.
- transcribe.py output field names match every TS consumer exactly.
- The 4 "landed" video-use harvests are genuinely landed (commits verified): fades
  `09172e4`, packTranscript `8538971`, selfEvalRender `40005f4`, grade field `a99e141`.

# APPENDIX B — Where each claim came from
Orchestrator (Fable) first-hand: tsc both checkouts, vitest run + list, pytest run, git
remote/worktree/rev-list state, `npx remotion compositions` (with the 1.3 GB public-dir copy
observed), all of renderFromPlan.ts / editPlan.ts / buildEditPlan.ts / silenceTrim.ts /
bundleOnce.ts / selfEvalRender.ts / autoedit.test.ts / cli.ts(head) / BAKEOFF.md /
FFMPEG-RULES-AUDIT.md read in full, .env grep, duplication greps. Agent 1 (compositions):
the §5 findings + Appendix-A comp-layer verifications, with its grep log reproduced in §5.
Agent 2 (pipeline/ffmpeg): §4.1/4.2/4.5 (empirically reproduced), 4.8–4.19, §7, Python
findings. Agent 3 (docs): all of §9, worktree/disk measurements. Agent 4 (types/dead code):
all of §6, eslint/tsconfig findings, line counts. Agent 5 (audit challenge): §4.4/4.6/4.7
verdict challenges (two empirically reproduced), the encode-generation trace, §10-S7.
Anything none of us executed is explicitly marked PLAUSIBLE inline.
