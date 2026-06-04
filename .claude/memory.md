# Project Memory — AI Video Factory

> Persistent notes, decisions, patterns, and preferences learned during development.
> Updated at the end of each significant work session.

---

## Project Status: WORKING END-TO-END

The full pipeline is operational as of 2026-04-02. A single CLI command generates a complete video:
```bash
npm run generate -- --script "Your text" --voice "es-MX-JorgeNeural" --template explainer --platforms youtube
```

**Performance benchmark:** 14.6s to generate an 11.5s video (1920x1080 H.264+AAC, 446KB) on Apple Silicon.

---

## Architectural Decisions

### [Architect] Local-Only Execution (2026-04-01)
- **Decision:** Run all video rendering locally on macOS Apple Silicon, not on the Hostinger VPS
- **Reason:** VPS has only 2 vCPU / 8GB RAM — insufficient for Remotion's Chrome Headless Shell + FFmpeg rendering
- **Impact:** No Traefik labels, no production Docker Compose, no systemd services. Docker is dev-only.

### [Architect] Pipeline Orchestration: TypeScript + tsx + execa (2026-04-01)
- **Decision:** Use TypeScript pipeline with `tsx` for execution and `execa` for subprocess management
- **Alternatives rejected:** BullMQ+Redis (overkill for single user), N8N (extra dependency), plain Node.js child_process (rough edges)
- **Reason:** Single developer, local tool, no concurrency needs. Sequential pipeline is simpler and debuggable.
- **CLI:** Commander.js for argument parsing (35M+ weekly downloads, first-class TypeScript)

### [Architect] Dual Runtime: Node.js + Python via uv (2026-04-01)
- **Decision:** Node.js for Remotion/pipeline/FFmpeg, Python for TTS/transcription
- **Reason:** Remotion is React-based (requires Node.js). Edge-TTS and faster-whisper are Python libraries.
- **Bridge:** TypeScript pipeline calls Python scripts via `execa`, passing args and reading stdout/files.
- **Note:** `edge-tts-universal` (pure Node.js) exists but Python `edge-tts` was used for reliability. Future opportunity to eliminate Python for TTS.

### [Architect] Edge-TTS over ElevenLabs (2026-04-01)
- **Decision:** Use Edge-TTS (free) as primary TTS engine
- **Reason:** Free unlimited usage, **45 Spanish neural voices** (22 locales), generates timing data for caption sync
- **Best voices:** es-MX-JorgeNeural (professional male), es-MX-DaliaNeural (warm female), es-CO-GonzaloNeural (clear neutral)
- **Fallback:** ElevenLabs API can be added later as premium option

### [Architect] faster-whisper "small" model (2026-04-01)
- **Decision:** Use faster-whisper with "small" model for transcription
- **Reason:** ~88% accuracy for Spanish, ~500MB RAM with int8, fast enough for batch processing
- **Alternative:** whisper.cpp has better Metal GPU acceleration but worse Python integration

---

## Installed Versions (Pinned)

| Package | Version | Notes |
|---------|---------|-------|
| Remotion (all packages) | 4.0.443 | `--save-exact`, all packages same version |
| React | 19.2.4 | Required by Remotion |
| Zod | 4.3.6 | v4, compatible with @remotion/zod-types |
| tsx | latest | TypeScript execution |
| execa | latest | ESM-only subprocess management |
| Commander.js | latest | CLI framework |
| vitest | latest | Test runner (dev dep) |
| TypeScript | latest | Dev dep |
| edge-tts | 7.2.8 | Python, via uv |
| faster-whisper | 1.2.1 | Python, via uv |
| pytest | 9.0.2 | Python dev dep |
| Node.js | 24.14.0 | System |
| Python | 3.14.0 | System |
| FFmpeg | 8.1 | Homebrew |
| uv | 0.11.3 | Python package manager |

---

## User Preferences

- Content language is primarily **Spanish** (Mexican Spanish es-MX preferred)
- User creates business/educational content for multiple platforms (YouTube, TikTok, Reels, Shorts)
- User prefers CLI-based tools over web UIs
- User uses `uv` for Python package management
- Project memory must stay LOCAL in `.claude/` (not global `~/.claude/`)
- User wants portable projects — copying the folder should bring all context

---

## Research Findings (2026-04-02)

### Remotion v4
- Current stable: **v4.0.443**
- v5.0 planned but NOT released yet — stay on v4
- **Free for individuals** and companies < $1M revenue
- Works natively on Apple Silicon — Chrome Headless Shell has ARM64 builds
- Key API: `bundle()` (call once, reuse), `selectComposition()` (preferred over `getCompositions()`), `renderMedia()`
- Zod schemas integrate natively for props validation in Remotion Studio
- `calculateMetadata()` can dynamically set duration from audio length
- `@remotion/captions` has `createTikTokStyleCaptions()` — native animated captions (NOT yet integrated)

### Edge-TTS (v7.2.8)
- 45 Spanish neural voices across 22 locales
- **v7.2.8 only emits SentenceBoundary, NOT WordBoundary** — word timings approximated by distributing words evenly within sentence duration
- Timestamps come as 100-nanosecond ticks — divide by 10,000,000 for seconds
- Audio output: 48kbps CBR MP3 at 24kHz (fixed, cannot change)
- `edge-tts-universal` package available for pure Node.js usage (zero deps) — not yet evaluated

### faster-whisper (v1.2.1)
- CPU-only on Apple Silicon (no Metal/MPS) via CTranslate2
- `compute_type="int8"` best for ARM64 (becomes int8_float32)
- `word_timestamps=True` gives accurate per-word timing via `segment.words`
- **IMPORTANT:** `segments` is a generator — must `list(segments)` before reprocessing
- Models cached in `~/.cache/huggingface/hub/`
- "small" model: ~500MB RAM with int8, ~88% accuracy for Spanish
- "medium" model: ~1.3GB RAM with int8, ~92% accuracy — also fits 8GB Mac
- Do NOT use `distil-*` variants for Spanish (English-only in practice)
- No FFmpeg system dependency needed — `av` (PyAV) bundles its own

### FFmpeg (v8.1)
- ASS format essential for karaoke-style word-by-word captions
- VideoToolbox (`h264_videotoolbox`) available on macOS for HW acceleration
- Two-pass loudnorm recommended for accurate normalization
- Blurred background fill looks best for landscape→vertical conversion
- `xfade` filter for crossfade transitions between segments
- `-movflags +faststart` for web playback optimization

---

## Gotchas & Lessons Learned

### Remotion-Specific
- **`staticFile()` does NOT accept absolute paths** — audio/assets must be copied to `public/` directory and referenced by filename only (e.g., `staticFile("audio.mp3")`)
- **Folder names must match `[a-zA-Z0-9-]`** — no spaces, parentheses, or colons. Use "Landscape-16x9" not "Landscape (16:9)"
- **Webpack bundler resolves `.tsx` extensions directly** — do NOT use `.js` extensions in source imports (use `"./Root"` not `"./Root.js"`)
- Chrome Headless Shell downloads automatically on first `render` (~90MB). Already downloaded and cached.
- All Remotion packages MUST be the exact same version — use `--save-exact` and `npx remotion upgrade`

### Edge-TTS
- **v7.2.8 only emits SentenceBoundary** — word-level timing from edge-tts is approximate (evenly distributed within sentence). For accurate word timing, use faster-whisper post-transcription.
- Each `Communicate` instance can only call `stream()` once — create a new instance per request

### Pipeline
- Audio files must be copied from output dir to `public/` before Remotion render (staticFile constraint)
- Pipeline runs sequentially: TTS (~2s) → Bundle+Render (~10s) → FFmpeg normalize (~1s) → FFmpeg export (~2s)
- Python scripts output JSON to stdout, TypeScript parses it via `JSON.parse(result.stdout)`

### FFmpeg
- `-ss` before `-i` seeks by keyframe (faster), after `-i` seeks exactly (slower)
- ASS subtitle colors use BGR format (`&HAABBGGRR`), not RGB

---

## Session Log

### Session 1 — 2026-04-01/02: Project Setup, Research & Full Implementation

**Research Phase:**
- Ran 5 parallel research agents: Remotion v4, Edge-TTS, faster-whisper, FFmpeg, pipeline orchestration
- Key discoveries: 45 Spanish voices (not 11), `edge-tts-universal` Node.js package, `@remotion/captions`, faster-whisper only ~500MB with int8

**Infrastructure:**
- Created CLAUDE.md (project context), README.md (GitHub-facing with Mermaid diagrams), PLAN.md (updated, VPS refs removed)
- Set up .claude/ local memory directory
- Created Makefile, docker-compose.dev.yml (local Redis only), .gitignore, .env.example
- Created template JSON configs: explainer.json, talking-head.json, listicle.json

**Node.js Setup:**
- `npm init` with `"type": "module"` (ESM)
- Installed: remotion@4.0.443 (all packages), react@19.2.4, zod@4.3.6, tsx, execa, commander
- Dev deps: typescript, vitest, @types/react, @types/react-dom, @remotion/eslint-config
- Created tsconfig.json (ES2022, bundler resolution, strict) and remotion.config.ts

**Python Setup:**
- `uv init` + `uv add edge-tts faster-whisper` + `uv add --dev pytest`
- Creates pyproject.toml, .venv/, uv.lock

**Remotion Compositions (5 total):**
1. `ExplainerVideo` — gradient bg, animated title, accent bar, caption overlay
2. `TalkingHead` — speaker image/placeholder, gradient overlay, name tag, captions
3. `Listicle` — numbered items with slide-in animation, per-item sequences
4. `QuoteCard` — animated quote mark, italic text, author attribution, decorative line
5. `ExplainerVideoVertical` — same as Explainer but 1080x1920

**Shared Components:**
- `AnimatedText` — spring-animated fade+slide text
- `GradientBackground` — configurable CSS gradient fill
- `Caption` — word-by-word highlight with active/past/future coloring, windowed display (6 words)

**Schemas (Zod):**
- `explainerSchema`, `talkingHeadSchema`, `listicleSchema`, `quoteCardSchema`
- Shared: `wordTimingSchema`, `captionStyleSchema`

**Python Wrappers:**
- `src/tts/generate.py` — Edge-TTS with sentence→word timing approximation, CLI with `generate` and `voices` subcommands
- `src/transcribe/transcribe.py` — faster-whisper with word timestamps, SRT output, CLI interface

**FFmpeg Commands:**
- `src/ffmpeg/commands.ts` — resize (pad/crop/blur), normalizeAudio (loudnorm), extractThumbnail, exportMultiPlatform

**Pipeline & CLI:**
- `src/pipeline/pipeline.ts` — orchestrator: TTS → copy audio to public/ → bundle → render → normalize → export
- `src/pipeline/generate.ts` — Commander.js CLI entry point
- `src/pipeline/voices.ts` — list 45 Spanish voices
- `src/pipeline/templates.ts` — list available templates

**End-to-End Test:**
- Successfully generated a complete video: 14.6s pipeline time, 11.5s video duration, 1920x1080, H.264+AAC, 446KB
- Output files: audio.mp3, raw_video.mp4, normalized.mp4, video_*_youtube.mp4, video_*_thumbnail.jpg, word_timings.json

**Bugs Fixed:**
1. Remotion Folder names with special chars → changed to `Landscape-16x9`, `Vertical-9x16`
2. `.js` import extensions in Webpack → removed all `.js` extensions from source imports
3. Remotion staticFile() absolute path error → copy audio to `public/` dir, reference by filename
4. Edge-TTS WordBoundary not emitted in v7.2.8 → approximate word timing from SentenceBoundary

## 2026-06-01 — HDR→SDR color fix (HLG tonemap LUT) + full assembly

**Decision: bake the HLG→SDR tonemap into a 3D LUT, apply with ffmpeg `lut3d`.**
The prior `colorspace=...itrc=bt709...` was WRONG (user-rejected): it only fixed the
bt2020→709 gamut and left the HLG (arib-std-b67) transfer curve un-inverted →
over-bright/over-saturated. This ffmpeg (8.1, Homebrew) has NO zscale/libplacebo and
`colorspace` can't parse `arib-std-b67`, so a native one-filter HLG tonemap isn't
available. The whole tonemap is a deterministic per-pixel RGB→RGB function, so it bakes
perfectly into a 33³ .cube LUT.

Pipeline (scripts/gen_hlg_lut.py → src/matting/luts/hlg_to_sdr.cube):
HLG inverse-OETF (a=.17883277,b=.28466892,c=.55991073) → OOTF system-gamma **1.2**
(scene-luma 2020 weights) → exposure **gain 2.0** → bt2020→709 matrix → 709 OETF →
luma-preserving **saturation 0.65**.

**Calibration** (matched to user's ground-truth `output/color-ref/HDR to SDR real colors.png`):
gridded gain×sat against reference patches → best = polo[32,53,106]≈ref[31,58,110],
neutral-bg matches; skin gap is the pose/lighting confound (different frame). Confirmed
visually against the reference and in a real rendered MP4.

Integration: renderFromPlan `hlgLutPath()` + `escapeFilterArg()` + lut3d-based
`hdrColorFixFilter(isHdr,lutPath)`; threaded into single-source `buildTrimConcatFilter`
and multi-source `buildMultiSourceConcatFilter`; runTella16x9Demo imports the same.
RVM matte for the depth demo MUST be regenerated from the LUT-corrected plate (the fg
PNGs are full-color RGBA cutouts, not alpha-only — old ones carried the bluish wrong color).

Rendered/verified this session: claude-cowork-reel.mp4 (10 beats/2602f/86.7s),
tella-16x9-demo.mp4, IMG_3618-depth.mp4 (NETFLIX→upper-third, legible, behind speaker),
IMG_3618-edit.mp4, cap-<8 styles>-edit.mp4. Gallery: SHOWCASE.html (slideshow).
Gotcha: renderEditedVideo slug must be FLAT (no `/`) — staging only mkdirs public/autoedit,
not nested subdirs.

## 2026-06-01 — Color GOTCHAS (two real bugs found after the LUT)

1. **Highlight clip ("blown out")** — a single global gain that matched polo/neutral
   pushed lit skin into a hard clip (~5.8% of cheek at 255). Fix: extended-Reinhard
   highlight shoulder (white point 1.5) in gen_hlg_lut.py before the OETF → lit-cheek
   clip ~0.3%, skin keeps detail. Mids/darks (bg, polo) ~unchanged.

2. **Mislabeled color tags ("sunburn"/red skin)** — THE BIG ONE. After `lut3d` makes
   pixels bt709, ffmpeg COPIES the source's HLG/bt2020 frame metadata onto the staged
   mp4 (color_transfer=arib-std-b67, color_primaries=bt2020). Remotion OffthreadVideo →
   Chromium honors those tags and RE-TONEMAPS the already-correct frames → skin red
   (rendered cheek R/G 1.76 vs ref 1.29). PNG/ffprobe spot-checks DON'T catch it (PNGs
   are untagged). Fix: append `setparams=range=tv:colorspace=bt709:color_primaries=bt709:
   color_trc=bt709` to the END of the staging filter chain. NOTE: the `-color_trc` /
   `-color_primaries` OUTPUT OPTIONS are IGNORED when a filtergraph is present (only
   `-colorspace` partially took) — must use the setparams FILTER. Applied in
   renderFromPlan (SETPARAMS_BT709, single+multi-source) and runTella16x9Demo.
   Verify with: ffprobe -show_entries stream=color_space,color_transfer,color_primaries
   → all must read bt709 on every staged public/autoedit/*.mp4.

## 2026-06-02 — Color PROVEN + reel/tella/netflix iteration (user pushback)

**Color (numerical proof, no eyeballing):** The reference screenshot = FIRST FRAME of
IMG_3618.MOV (grayscale NCC 0.957 vs all clips). Compared LUT output to it per-region:
analytic tonemap was too contrasty (forehead/sky too bright, polo/hair too dark) AND
the earlier render looked red because of a SECOND bug (bt709 tag) — see prior entries.
Fit a quadratic cross-channel regression (1,R,G,B,R²,G²,B²,RG,RB,GB → RGB) on 1564 flat
patches, baked into gen_hlg_lut.py (_FIT_COEF). Per-region error 14-24 → 1-4 levels;
full MAE R/G/B 8.5/7.7/9.1 (residual = edge misalign, ref is half-res screenshot).
End-to-end proof: rendered-edit skin [152,122,109] ≈ LUT-on-raw [150,119,109] → Remotion
preserves the grade. Re-derive: /tmp/fit_poly pattern (pair lut3d-output vs reference).

**Reel bloopers:** user flagged off-camera takes. Frame-inspected all beats:
  • features IMG_3627 15-31s → reading off PAPER, looking down. DROPPED.
  • how-1 IMG_3617 6-10s → looking down at PHONE. DROPPED.
  • avail IMG_3629 42-54s → entire beat is a camera-PAN to the building/marina, voiceover
    only, no face. Currently KEPT as B-roll — FLAG for user (keep B-roll vs find on-cam take).
Reel now 8 beats / 65.6s (was 10 / 86.7s).

**Tella face-zoom:** focus was frame-center (0.5,0.4). His face sits LEFT-of-center
(skin-tone YCbCr centroid: x≈0.255 y≈0.41 mouth → use x0.29 y0.34 eyes). Verified zoom
now lands on the face.

**Netflix depth word:** topPct prop added to YellowGlowWordCallout upper-third anchor;
runDepthDemo now topPct 9 (was 20%) + fontSize 230 (was 180). Bigger + over the head.
Still partly occluded by head (the "behind" effect) — if user wants fully readable, drop
topPct to ~3-4 (clears head) at cost of the depth read.

## 2026-06-02 — Overnight autonomous batch (depth/text/transitions)

User: "didn't like the 3 avail options, keep trying, use dynamic workflows in parallel,
keep making text-behind-me / text-reveal / transition variations, do as much as possible
overnight." Delivered:
- **RevealText** component (src/components/overlays/RevealText.tsx, registered) — ONE
  versatile text overlay, reveal modes: pop, fade-up, slide-left, slide-up, scale-in,
  blur-in, typewriter, word-by-word, mask-wipe, rise-line. Props: opacityMax (ghosted
  behind-text), noWrap (macro overflow), accent word highlight, brand fonts. Works behind
  the matte (behindSpeaker) OR foreground.
  ⚠️ GOTCHA: adding an overlay requires BOTH the import AND an entry in the
  OVERLAY_REGISTRY object literal — I forgot the object entry → scene silently rendered
  nothing (OVERLAY_REGISTRY[type] undefined → null, no error). Always verify a frame.
- **runVariationsShowcase.ts**: 22 demos (10 depth behind-speaker + 12 text-reveal modes)
  over 3 matted plates (IMG_3618 + new depth-follow/depth-hook mattes). bundle-once.
- **Transitions**: 12 ffmpeg xfade demos (output/autoedit/trans/) between hook+benefit —
  fade/fadeblack/dissolve/wipeleft/slideup/smoothright/circleopen/radial/zoomin/pixelize/
  diagtl/squeezev. No Remotion needed.
- **Workflow** (mine-creator-techniques): 5 agents mined 12 creators → 49 buildable ideas
  digest at docs/research/wave-10/CREATOR-MINED-IDEAS.md (grounded the RevealText modes).
- Galleries: VARIATIONS.html (depth/text/transitions) + INDEX.html master + reuse
  SHOWCASE/MOTION-GRAPHICS/AVAIL-REVIEW.
- New mattes: public/matte/depth-follow, depth-hook (RVM, from color-correct plates).
STILL OPEN (user decisions): which depth styles / text-reveals / transitions to keep,
avail-beat graphic, Reel default caption style. Then wire winners into the Reel.

## 2026-06-02 — Parallel build workflow: 6 new components

Workflow (build-new-overlays, 6 sonnet agents) authored 6 self-contained overlay
components in parallel from the wave-10 digest; I integrated + rendered demos:
- CountUpStat (count-up numeral + label), SentimentKeyword (tone-colored stroke keyword
  pop), ChapterTocRail (section rail, active gold), SegmentedProgressBar, GrowthCompareBars
  (growing compare bars), MarkerSweepWord (highlighter sweep).
- All registered (import + object entry), typecheck clean, rendered over footage →
  output/autoedit/new/, gallery NEW-COMPONENTS.html (linked from INDEX.html).
- Driver: runNewOverlayDemos.ts (reads /tmp/new_demoprops.json).
GOTCHA (zod v4): agent-generated SentimentKeyword used `schema.shape.x._def.defaultValue()`
(zod v3 API) → runtime TypeError. Fixed by using an empty-string sentinel default instead
of reflecting the schema default. Watch for this in agent-authored zod code.

## 2026-06-02 — Rounds A/B/C: full remaining backlog built

- Round A: 6 more components (parallel workflow) — LowerThirdNameTag, PullQuoteCard,
  ChecklistTypeOn, ComparisonVS, StatRowTriple, GradientHeadlineCard → output/autoedit/new2.
  (FONT_STACKS.condensed IS valid; zod-v4 guard held.) 28 overlay files total.
- Round B: runComboDemos.ts — 6 stacked-component previews → output/autoedit/combo. Gotcha:
  matte-combo duration must be <= matte frame count (IMG_3618=138) or Remotion EncodingError.
- Round C: renderMultiSourcePlan gained `overlays?` pass-through; runStyledReel.ts assembles
  TWO full 65.6s reels (editorial vs punchy) with per-beat keyword + advancing progress bar.
- Galleries: NEW-COMPONENTS(12), COMBOS(6), STYLED-REELS(2), linked from INDEX.html.
OPEN (needs user taste): pick winners + reel style (editorial vs punchy).

## 2026-06-03 — abhishek.devini full-vocabulary replication (5 cycles)

Replicated Instagram creator **abhishek.devini**'s entire motion-graphics vocabulary
as a self-contained Remotion template family. End-to-end per-creator pipeline:
scrape (gallery-dl, 18 reels) → dense frame extraction (ffmpeg fps=30) → parallel
frame-by-frame analysis → STYLE-SPEC → parallel source-grounded template build →
render → frame-by-frame head-to-head compare → iterate (5 cycles).

**Architecture (foreground/background split):**
- `src/components/abhi/AbhiBackground.tsx` — the two signature bg modes (dark grid+glow,
  light pastel mesh+floating squares), parameterized. SHARED by every template.
- `src/compositions/AbhiScene9x16.tsx` — host: mounts AbhiBackground + the named
  foreground template from `ABHI_REGISTRY`. Registered in Root.tsx (1080x1920, 30fps).
- `src/components/abhi/registry.ts` — 23 templates (full vocabulary; 171 source scenes
  collapse to 23 distinct types). 8 core + 15 expansion.
- `src/components/abhi/templates/*.tsx` — 23 self-contained foreground FCs.
- `src/autoedit/runAbhiTemplates.ts` — renders each via AbhiScene9x16, reads per-key
  {bgProps, demoProps, durationFrames} from `docs/research/abhishek/build-meta.json`.
  **Takes exactly ONE key as argv[2]** (render one template at a time), or all if none.
- `docs/research/abhishek/` — STYLE-SPEC.md, SCENE-INDEX.json (171 scenes),
  VOCABULARY.json (23 types + cleanest source refs), build-meta.json (render config).
- `references/creators/abhishek.devini/*.mp4` — 18 source reels (gitignored, KEPT for
  comparison). `output/abhi/<Key>.mp4` = replicas; `output/abhi/source-scenes/<Key>.mp4`
  = the matched source scene clip for each template. `ABHI-COMPARE.html` = head-to-head
  gallery. `scripts/abhi-qa-contactsheet.py` = source-vs-replica static QA contact sheet.

**Style tokens:** DARK = warm near-black base #08050B, gradient to #0A0709, faint warm
square grid @4.5%, radial accent glow (topic-brand color) behind hero text, gentle
breathe. LIGHT = pastel mesh (peach #F9C8BA / lavender #CBC9F9 / mint #E0EEE7) on
#E7E0EA + drifting rounded squares. Fonts: headline=Inter Black 900 tracking -0.02em;
kicker=JetBrains/Fira mono uppercase ~0.2em (usually DOT-FREE — abhi's kicker pills
have no leading dot in most dark templates); accent sweep on second headline tone.

**GOTCHAS (critical):**
- Remotion headless Chromium renders `background-clip:text + color:transparent` as an
  OPAQUE rectangle (caused the BrandLockup "orange rectangle blocking text" bug). Use
  SOLID color for any animated/swept/hero text.
- Zod v4: every field needs `.default()`; NEVER reflect via `._def`/`.shape` (throws at
  render); use `""` sentinel for override/empty detection.
- bash `while IFS='|' read` drops the first char of the last line w/o trailing newline
  (mangled "AbhiBrandLockup"→"bhiBrandLockup"). Use python for robust line extraction.
- Parallel agents editing registry.ts / build-meta.json concurrently can race — rewrite
  registry cleanly afterward; validate build-meta JSON + re-render ALL at the end.
- Agents return one-line confirmations + write files to disk (more reliable than deeply
  nested StructuredOutput schemas for vision-heavy work).

**Cycles:** C1 fixed core 8 + corrected muddled source refs (terminal off +7s; re-extracted
all source scenes). C2 built the 15 expansion templates. C3 verified+fixed all 23 (7-9/10).
C4 final polish (5 parallel agents, per-template frame-compare + minimal edits) → all 9-9.5/10;
neutralized AbhiBackground dark gradient purple cast. C5 adversarial QA pass (skeptic finds
the ONE remaining gap per template). Source reels KEPT until user signs off on fidelity.

## 2026-06-03 — Cross-creator validation pass (all other creators)

After abhi, ran the same "their source vs our replica" consolidation across every
OTHER reference creator we built templates for. Unlike abhi (dedicated family), these
fed a SHARED library (111 registered comps). Pipeline:
- Discovery (2 Explore agents): `docs/research/cross-creator/ATTRIBUTION-MAP.md`
  (creator→built-comp map: 16 ★ BUILT-REPLICA, 3 ◐ partial, 4 ○ inspiration-only) +
  `RENDER-SURFACE.md` (how to render any comp standalone).
- Render driver: `src/autoedit/runCrossCreatorReplicas.ts` (bundle once, render the ~23
  signature comps to `output/cross-creator/<Comp>.mp4`, 150f cap, default props or
  `docs/research/cross-creator/props/<Comp>.json` override). Templates ship strong demo
  defaults so {} already yields real content.
- Compare/validate/improve (6-agent dynamic workflow, grouped by comp cluster so each
  comp .tsx is edited by exactly one agent — race-safe). Each compared our clip vs the
  creator's PRESERVED KEYFRAMES (full videos erased per "erase after use"; frames kept).
  Judged PATTERN fidelity (layout/color/type/motion), NOT copy — our templates use the
  Armando navy/gold brand + own copy by design.
- Result: 4 IMPROVED + 19 VALIDATED (7–9/10). Improvements:
  · RankedTierList9x16 (adamrosler): persistent single glowing-active-row.
  · LayerCardStack9x16 (simonhoiberg): squared 'Layer N' badge (radius 999→8).
  · TalkingHeadDynamic9x16 (builtbystephan): fallback band colors so hard-split reads.
  · TechNewsFlash9x16 (diysmartcode): props override → dark changelog palette (was blank @3s).
  · QuoteCard9x16 (black.one.studio): props override → palette:dark tagline-on-black.
- Gallery: `CROSS-CREATOR-COMPARE.html` (`scripts/build-cross-creator-gallery.py`) —
  per pairing: creator source-frame strip + our looping clip + score + verdict.
- Per-comp notes: `docs/research/cross-creator/notes/<Comp>.md`.
BACKLOG (agents recommended, NOT built — net-new features, deferred): BarChartList
`rankedReveal` mode (sahil), AnimatedCounter `figureFont:mono` (adam), ForceGraph in-node
labels, DarkSlateChassis deeper center-vignette (nate, shared by 21 comps), TechNewsFlash
`dark-changelog` numbered-counter mode, dedicated OpeningTitleCard9x16 (hormozi),
SplitWebcam/CalloutOverlay `seamCaptionStyle:pill|naked` (mreflow vs midu).
Creator source material (frames + ANALYSIS.md) STILL KEPT until user signs off.
