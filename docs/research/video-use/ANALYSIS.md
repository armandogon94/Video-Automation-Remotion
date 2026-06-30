# Decision Memo — Should AI Video Factory adopt or learn from `browser-use/video-use`?

> **Date:** 2026-06-26
> **Author:** Armando Gonzalez (via Claude Code research session)
> **Subject:** `browser-use/video-use` — the "edit videos with coding agents" Claude Code skill — vs. our own auto-edit pipeline (`src/autoedit` / D1–D5 / WS-C / reel-assembly)
> **TL;DR recommendation:** **Harvest ideas, keep our stack.** Do **not** vendor it in. Steal the editor-layer discipline (12 ffmpeg rules, packed-transcript reading model, self-eval render loop, EDL schema fields we're missing). Keep our branded template library + local/free constraint as the moat.

---

## 1. What it is

`browser-use/video-use` is an **MIT-licensed Claude Code skill that EDITS video** — raw footage in, finished `final.mp4` out. It is shipped by the Browser Use team (Gregor Žunič / @gregpr07; YC W25, $17M seed). Created 2026-04-12, ~16 commits, ~10.3k stars / ~1.5k forks as of 2026-06-26 — high star velocity, thin/young community, one dominant maintainer, spam-heavy issue tracker.

What it actually does on a clip:
- **Transcribe** each source via **ElevenLabs Scribe** (`scribe_v1`) → word timestamps + diarization + audio events `(laughter)/(applause)`.
- **Pack** the transcript into a phrase-level `takes_packed.md` (breaks on silence ≥0.5s) — this is the LLM's primary, **text-first** interface to the footage.
- **LLM proposes** a 4–8 sentence edit strategy, **waits for plain-English approval**, then writes `edl.json`.
- **Render** via ffmpeg (`render.py`): per-segment extract → lossless concat → per-segment color grade → 30ms audio fades at every cut → composite pre-rendered overlay MP4/WebM → burn SRT last.
- **Self-eval loop**: `timeline_view.py` renders filmstrip + waveform PNGs **at each cut boundary**, the LLM inspects for discontinuities/audio pops/subtitle overlap/overlay misalignment, capped at **3 passes**.
- **Animations are authored FRESH per brief** by parallel sub-agents (Agent tool), each rendered to a file referenced by path in the EDL. Backends: Hyperframes (HTML/CSS/GSAP, default), Remotion (React/reuse), Manim (math), PIL (simple cards).

The durable architectural idea (the "DOM-not-screenshot" insight ported to video): **the agent reads a packed transcript + renders PNGs only at decision points, never a raw-frame dump.** ~12KB of text + a few PNGs replaces a naive ~45M-token frame dump.

**Critically: it is NOT a competitor to Remotion or Hyperframes.** It is an orchestration/editor layer that *consumes* them as overlay producers. It is a **peer to our own auto-edit pipeline** (`src/autoedit`, D1–D5, WS-C, reel-assembly), not to our renderer.

---

## 2. The template misconception (read this first)

**There is nothing to "translate our templates into."** A natural but wrong framing is "port our 130-comp Remotion library into video-use's format." That is a category error on two counts:

1. **video-use is an EDITOR, not a component framework.** Its job is cut/grade/fade/subtitle/assemble. Templates are not its unit of work — *ranges and overlays* are. `render.py` literally only knows about `edl.json` + ffmpeg + pre-rendered overlay files by path; it has **zero** references to Remotion/Hyperframes/Manim/PIL internals (the animation authoring lives in `SKILL.md`'s sub-agent prompts).

2. **video-use deliberately has NO template library and REJECTS reusable templates.** Every animation is authored fresh, one-off, by a parallel sub-agent from a brief. That is the *opposite* of our entire thesis: a curated 15-template typology + atom/molecule registry + cross-creator replication library, brand-locked to Armando Inteligencia.

So the integration seam, if we ever wanted one, runs the *other* direction: **our Remotion/Hyperframes templates render to MP4/WebM → we hand those file paths to video-use's `edl.json` overlays array.** video-use would *consume* our templates as overlays; it would never *contain* them. Our template library is an asset video-use lacks, not a thing to be migrated.

---

## 3. Head-to-head vs. our pipeline (code-grounded)

Our auto-edit pipeline is real, EDL-driven, and already implements most of video-use's spine. The contract is a zod-validated `EditPlan` (`src/autoedit/editPlan.ts`, 415 lines) written to `./output/editplan.json` — our direct analog to `edl.json`. Two-phase: ANALYSIS (ffprobe → silencedetect → faster-whisper → word re-projection → rule-based overlay suggester → zod) then RENDER (ffmpeg trim/concat → Remotion `SpeakerOverlayScene`).

| Capability | video-use | OUR pipeline (file evidence) | Verdict |
|---|---|---|---|
| **EDL / plan schema** | `edl.json` (ranges+grade+overlays+subtitles+total_duration_s), v1 | `EditPlan` zod schema, **frame-native** (every time in BOTH seconds and frames), richer: captionTrack, overlayTrack, layoutTrack, foregroundMatte, provenance — `editPlan.ts` | **PARITY+, ours richer** |
| **Transcript-driven cuts** | Yes — cuts snap to word boundaries, transcript drives the cut | **Partial.** Cuts driven by ffmpeg `silencedetect` energy (`silenceTrim.ts`); whisper words re-projected onto trimmed timeline (`buildEditPlan.shiftWordsToEditTimeline`) but transcript does NOT drive the cut decision | **THEY win** (semantic vs energy) |
| **Filler-word removal** ("um/like") | Yes | **No.** Silence-span removal only; filler removal absent. Reel bloopers/dead-air removed by HAND-CODED beat ranges (`runAssembleReel.ts`) | **THEY win** |
| **Per-segment creative grade** | Yes | **No.** One global corrective HLG→SDR `lut3d` (`hlg_to_sdr.cube`) applied uniformly; no per-segment grade field on `EditSegment` | **THEY win** |
| **30ms audio fades at cuts** | Yes (`afade=t=in:st=0:d=0.03`) | **No.** Grep confirms zero `afade`/`acrossfade` in `src/autoedit`; segments `concat` straight | **THEY win** |
| **Burned subtitles w/ styles** | ffmpeg-burned ASS | **Yes, RICHER — via Remotion not ffmpeg.** `FloatingCaption` in `SpeakerOverlayScene`, **8 typographic presets** (`CaptionStyle`: classic, hormozi-pop, box-highlight, editorial-cyan, condensed-hype, slide-clean, blur-premium, type-terminal) | **WE win** |
| **Animation overlays over footage** | Fresh-authored per brief | **Yes, strongest area — TEMPLATE-based.** 8-member closed OV vocabulary anchored to edit-time frames, composited by `SpeakerOverlayScene` | **Opposite stances** (see §2) |
| **Scene layout engine** | (none claimed) | **Yes.** Full Tella-style `layoutTrack` (cam/screen regions 0..1, Ken Burns, transitions, backdrop) | **WE have, they don't** |
| **Person matte / RVM** | (none claimed) | **Yes.** `rvm_matte.py` RobustVideoMatting on MPS → text-behind-speaker depth (`foregroundMatte`) | **WE have, they don't** |
| **Multi-source reel assembly** | Single input → final | **Yes, fuller.** `renderMultiSourcePlan` stitches best takes across N MOVs, per-source HDR probe + LUT, re-bases words onto cumulative timeline | **WE have, they don't** |
| **LLM-driven editing** | Yes (the model authors the edit) | **No.** Overlay suggester is rule-based keyword heuristics (`suggestOverlays.ts` R1–R4); LLM is a documented deferred seam (`SuggestStrategy`), not implemented | **THEY win** |
| **Self-eval render loop** | Yes (timeline_view, cap 3 passes) | **No.** `renderFromPlan.ts` renders once; grep for self-eval/qa-loop/timeline-view/filmstrip = empty | **THEY win** |
| **Transcription** | **ElevenLabs Scribe (paid, REQUIRED)** | **faster-whisper "small" int8 (local, free)** | **WE win** (constraint moat) |
| **Per-session edit memory** | Yes | No pipeline-level analog (EditPlan JSON is a re-loadable artifact, not a session log) | **THEY win (minor)** |

**Net: we already built the spine** (EDL contract, silence trim, transcript re-projection, overlay track, render-from-plan) in D1–D5 / WS-C / reel-assembly. The **7 things genuinely missing** on our side: (1) LLM-driven editing, (2) filler-word removal, (3) per-segment creative grade, (4) 30ms audio fades, (5) self-eval render loop, (6) transcript-semantic (vs silence-energy) cutting, (7) per-session edit memory. Items (3) and (4) are the cheapest, highest-confidence wins.

---

## 4. Harvest now — concrete steals (no dependency required)

We do **not** need to install or depend on video-use to take its best ideas. Harvest these directly into `src/autoedit` / `src/ffmpeg`:

1. **The 12 ffmpeg correctness rules → hardening checklist for our render path.** Especially: subtitles applied LAST after overlays; per-segment extract + lossless `-c copy` concat (no single-pass re-encode); **30ms audio fades at boundaries** (`afade=t=in:st=0:d=0.03`) — currently missing in `renderFromPlan.ts` filtergraphs; overlay `setpts=PTS-STARTPTS+T/TB` alignment; output-timeline SRT offset math (`output_time = word.start - segment_start + segment_offset`); pad cut edges 30–200ms; word-boundary snapping. **These directly defend against the lip-sync drift bug (their #62) that our multi-source reel assembly also has to fight.**

2. **The packed-transcript reading model** (`takes_packed.md` + on-demand `timeline_view` PNGs). This is the token-efficient "DOM-not-screenshot for video" pattern. Our INGEST/money-shot triage already uses transcript-first selection; tighten it into an explicit `takes_packed.md`-style artifact + render filmstrip/waveform PNGs only at decision points. This is the right model for an eventual LLM overlay pass (our `SuggestStrategy` seam).

3. **The self-eval render loop, capped at 3 passes.** A render → inspect-at-cut-boundaries → fix → re-render guardrail. We have *no* analog. Add a capped post-render QA pass to WS-C orchestration that reads `timeline_view`-style stills at each cut.

4. **EDL schema fields we're missing.** Add an optional per-segment `grade` field and an audio-fade field to `EditSegment` in `editPlan.ts`. Our schema is already richer in every other dimension; these two close the gap.

5. **The strategy-confirm-before-edit gate.** Propose a 4–8 sentence plan, get approval, then cut. Cheap guardrail; copy into the orchestration layer.

---

## 5. Keep ours — the moat

Two things video-use structurally cannot match, and they are exactly our brand's requirements:

1. **The branded reusable template library.** Armando Inteligencia is Spanish-first, brand-locked (navy/gold/Inter/avatar watermark), repeatable, high-volume content. A **curated template/molecule registry produces consistent brand motion at zero per-render LLM cost.** video-use's fresh-every-time authoring optimizes for novelty/variety at higher LLM + iteration cost and *cannot* guarantee brand consistency or reproducibility. Our 130-comp library (incl. the new liquid-glass family) is a multi-month asset; do not let video-use's anti-template stance pull us off it. **For our use case, the template library is correct and the moat.**

2. **Local-only / free tooling.** Our hard constraint (Decision Log #2, #3): Edge-TTS + faster-whisper, no paid APIs, runs on Apple Silicon. video-use is **hard-wired to paid ElevenLabs Scribe** with no shipped local fallback (offline-Whisper issue #60 is open but unmerged; `install.md` literally warns "Scribe costs real money"). Adopting it as-is means either paying per-minute or forking `transcribe.py`. That conflict alone disqualifies it as a vendored dependency — but the interface boundary is clean (it just needs word-level JSON with timestamps, which our faster-whisper wrapper already emits), so the *ideas* port fine without the dependency.

---

## 6. Recommendation: **harvest-ideas-keep-stack**

Do not adopt or vendor `browser-use/video-use`. It is a young (~2-month, ~16-commit), single-maintainer, fast-evolving skill with active correctness bugs in flight (#62 lip-sync drift, #67 portrait stretch, #55 hardcoded 24fps, incomplete Windows support) and a hard paid-API dependency that violates our local-only constraint. Treat it as a **reference design and rule-source to study**, not a production dependency.

Concretely:
- **Harvest** the 5 items in §4 into `src/autoedit` / `src/ffmpeg` — prioritize the 30ms audio fades and per-segment grade EDL field (cheapest, highest confidence), then the self-eval loop.
- **Keep** our template library + local/free stack as-is.
- **Pin to a commit** if we ever script against `helpers/render.py` (EDL schema is v1 and could change).
- **Re-evaluate** only if: a second real maintainer joins, a local-Whisper path merges (#60), and a tagged stable release ships.

---

## 7. Visual comparison plan (reels-vs-reels, NOT templates-vs-templates)

The honest experiment is **edit the SAME real footage both ways and compare the finished reels** — this is an *editor* comparison, not a *template* comparison. We already have the raw material from the INGEST work: 9 raw iPhone MOVs at
`output/footage/claude-cowork/IMG_36*.MOV` (the "Claude Cowork" Spanish talking-head shoot).

**Steps:**
1. **Pick one shoot** (e.g. IMG_3616 + IMG_3617 + IMG_3627, the beats already mapped in `runAssembleReel.ts`).
2. **Our cut:** run our pipeline → `runAssembleReel.ts` / `renderFromPlan.ts` → branded reel with FloatingCaption + OV overlays + HLG→SDR LUT. (Already producible today, free, local.)
3. **video-use cut:** clone video-use, `uv sync`, install ffmpeg, **set `ELEVENLABS_API_KEY`** (this is a hard blocker — the transcribe step costs real money per minute and there is NO local fallback; budget for it or fork `transcribe.py` to swap in our `src/transcribe/transcribe.py` faster-whisper wrapper before running). Point it at the same MOVs → `final.mp4`.
4. **Compare on the dimensions where they claim an edge:** cut tightness (filler removal), audio fade smoothness at cuts, per-segment color consistency, subtitle timing accuracy, and overall pacing. Compare on OUR edges: brand consistency, caption typography, overlay richness, multi-source assembly.
5. **Write up** which specific outputs are better and *why*, frame-by-frame at cut boundaries (reuse our existing frame-extraction tooling).

**Flag:** the ElevenLabs key requirement means this experiment is **not free** unless we fork their transcribe step first. Recommend forking `transcribe.py` to faster-whisper *before* the comparison so the test stays inside our local/free constraint and isolates the *editing* differences (the thing we actually want to learn from) rather than the transcription backend.

---

## 8. Risks

- **Paid dependency conflict** — ElevenLabs Scribe is required, no local fallback merged (#60 open). Directly violates our local-only/free constraint. Any direct use leaks cost.
- **Maturity / bus factor** — ~2 months old, ~16 commits, gregpr07 authored ~9 of ~15, spam-heavy issues, no tagged release, no roadmap. Concentration + churn risk; EDL schema (v1) may break under us.
- **Correctness bugs in flight** — #62 progressive lip-sync drift across multi-segment edits (the exact failure our multi-source assembly fights), #67 portrait rotation stretch, #55 hardcoded 24fps, #64 cut-boundary QA is instruction-only not automated, incomplete Windows support.
- **Philosophy drift risk** — if we over-index on "agent authors animations fresh," we erode the template-library investment that *is* our moat. Harvest the editor discipline, not the anti-template stance.
- **Naming collision** — there is a *separate* "VideoUse" (a paid video-processing API in MindStudio writeups). Do not conflate; the relevant project is `github.com/browser-use/video-use` by gregpr07.
- **Hype-vs-substance** — 10.3k stars in 2 months is a viral signal, not a stability signal. Track whether stars plateau, a second maintainer joins, and issue quality rises before reconsidering.

---

### Sources
- Our pipeline (code-grounded): `src/autoedit/{editPlan,renderFromPlan,silenceTrim,buildEditPlan,suggestOverlays,cli,runAssembleReel,runStyledReel}.ts`, `src/matting/{rvm_matte.py,luts/hlg_to_sdr.cube}`, `docs/research/wave-8/ADR-003-autoedit-pipeline.md`, `src/transcribe/transcribe.py`. Grep-verified: no `afade`, no LLM call, no self-eval loop, no ffmpeg `subtitles=` in `src/autoedit`.
- video-use: `SKILL.md`, `install.md`, `pyproject.toml`, `helpers/{transcribe,render}.py`, GitHub API (repo/issues/contributors) as of 2026-06-26.
- Reception: Pexo "Can Claude Code Make Videos", Medium/Coding-Nexus walkthrough, browser-use seed-round/TechCrunch.
