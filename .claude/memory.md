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

## 2026-06-03 — FIX: Remotion bundle() disk leak (~2.9 GB per render)

GOTCHA (was leaking the disk): `@remotion/bundler`'s `bundle()` writes a ~2.5-3 GB
`remotion-webpack-bundle-*` dir into $TMPDIR (here /tmp/claude-501, the macOS per-user
tmp — SHARED across ALL Claude sessions/projects) and NEVER deletes it. Every render
leaked one; across a heavy session they pile up and fill the disk (a sibling project
once leaked 204 ≈ 370 GB → "System Data" balloons; a reboot wipes /tmp so it "fixes
itself" then recurs). Reboot-transient, not permanent.

FIX (root cause, never recurs):
- `src/autoedit/bundleOnce.ts` — self-cleaning drop-in for `bundle()`. Registers the
  returned bundle dir and `fs.rmSync`'s it on process `exit` AND on SIGINT/SIGTERM/SIGHUP
  (more robust than try/finally — covers Ctrl-C). Same signature/return as `bundle()`.
- All 33 callers (src/**, scripts/render-*.ts) converted with a ONE-LINE import swap:
  `import { bundleOnce as bundle } from "<rel>/bundleOnce";` — call sites unchanged.
  (renderFromPlan.ts + runTella16x9Demo.ts bundle twice; both registrations cleaned.)
- `scripts/clean-remotion-bundles.sh` (npm run clean:bundles) — manual sweep for the
  SIGKILL/crash case the exit-handler can't catch. PORTABLE (macOS bash 3.2, no mapfile).
  REFUSES to delete while any Remotion render is alive (compositor/chrome-headless-shell/
  our run*.ts) — critical because the tmpdir is shared, so a bundle may be ANOTHER
  project's live render. After any killed render: `npm run clean:bundles`.
VERIFIED: a real render now leaves 0 bundle dirs (was ~2.9 GB), tmpdir stays ~11 MB.
NOTE: when checking ps for "active render", remember sibling project 17-Instagram-Slides
renders into the SAME /tmp/claude-501 — never blanket `rm -rf /tmp/claude-*/remotion-*`
without the running-process guard or you can break their live render.

## 2026-06-04 — Cross-creator DEEP QA (full 44-comp set) + 2 render gotchas

Expanded the cross-creator pass from 23 signature comps to the FULL 44 the attribution
map ties to these creators. Re-downloaded FRESH source frames for the 6 weak-frame
creators (adamrosler/aiexplained/motiondarwin/theaiadvantage/natebjones/sahilbloom) →
`references/creators/<c>/_fresh/` (videos deleted after extraction). 12-agent Opus
adversarial QA (each comp owned by one agent → race-safe). Result: 17 IMPROVED / 27
VALIDATED. Gallery `CROSS-CREATOR-COMPARE.html` now data-driven over all 44.
- Biggest finding: the adamrosler procedural diagrams (ForceGraph/NeuralNetwork/
  PipelineFlow9x16/DecisionTree/RankedTierList) were faithful in STRUCTURE but rendered
  CREAM while Adam is near-black → flipped to dark via per-comp props overrides
  (`docs/research/cross-creator/props/<comp>.json`, merged by the driver) + 2 .tsx tweaks.
- Per-comp tuning lever WITHOUT touching Root.tsx: write a props JSON; the driver
  shallow-merges it over the comp's defaultProps. Root.tsx defaultProps pin these
  procedural comps to `palette:"cream"` — a dark default / "adamrosler preset" is the
  real root-cause fix (BACKLOG, not done).

GOTCHA 1 (render vs network): running heavy downloads (yt-dlp/gallery-dl) CONCURRENTLY
with Remotion renders breaks the render — Remotion fetches Google Fonts at render time,
and the network contention throws `ERR_INTERNET_DISCONNECTED`/`ERR_NETWORK_CHANGED` →
comps render with fallback fonts or fail. SEQUENCE them: finish downloads, THEN render.
GOTCHA 2 (macOS bash): `timeout` and `mapfile`/`readarray` don't exist in stock macOS
bash 3.2 — wrapping render commands in `timeout` silently no-ops ("command not found").

## 2026-06-25 — Fresh-content scan + net-new build + triple-vote (3 workflows)

DISCOVERY (7 Opus agents, all 23 creators, content since late-May): ~60 new videos scanned;
**only 1 genuinely new buildable pattern** — builtbystephan's "Builder Drop" product-spec
poster. Everything else reuses our existing 44+23 library = strong coverage validation.
Fresh frames under references/creators/<c>/_new/ (videos deleted). IG scrape needs
`gallery-dl --cookies-from-browser chrome` against /<handle>/posts/ (anon 401s); motiondarwin
+ zenzuke stayed blocked (throttled IP).

BUILT (6 Opus agents, race-safe own-file edits; I wired Root + rendered serially):
- 3 NEW comps: BuilderDropPoster9x16, ModelComparison2x2Grid16x9 (theaiadvantage's dominant
  pattern), OpeningTitleCard9x16 (Hormozi Pattern E). Registered in Root + driver TARGETS (47).
- 3 default-safe extensions: TechNewsFlash9x16 `mode:"dark-changelog"` (diysmartcode), shared
  EditorialCaption `register:"karaoke"`+`boxless`+`textTransform`+`showAccentBar` (verified 73
  consumers unaffected), QuoteCard9x16 `revealDelaySeconds` (black.one.studio late arrival).

GOTCHA (real bug caught): **Remotion composition IDs cannot contain `_`** (only a-z A-Z 0-9 -).
`ModelComparisonGrid2x2_16x9` as an id threw during composition-list build and broke
selectComposition for the WHOLE registry (every render failed). Fix: id → `ModelComparison2x2Grid16x9`
(the JS component identifier can keep the underscore; only the id STRING must be hyphen/alnum).

TRIPLE-VOTE (Phase 3, 18 Opus agents = 6 items × 3 independent judges + conditional fixer on
≥2 REVISE): ALL 6 PASSED (BuilderDrop 9/9/9, ModelGrid 9/8/8, OpeningTitleCard 8/8/9,
TechNewsFlash 8/9/8, Karaoke 8/8/8, QuoteCard 9/8/9). No fixer fired. Two unanimous minor gaps
I then fixed proactively: OpeningTitleCard radius 28→14px; karaoke inter-word spacing collapse
("CLAUDEIS") — widened the EditorialCaption flex word-gap proportional to fontSize in boxless
mode only (boxed renders byte-unchanged). Both re-rendered + visually confirmed.

ROOT DARK-DEFAULT (backlog item): audited — decided NOT to flip the shared cream default for the
procedural comps. Dark is already available via 11 existing `*Dark` registered variants +
`palette:"dark"` prop + the cross-creator props overrides; flipping the global default would
wrongly darken cream brand content. Correct outcome = keep cream default, dark via variant/prop.

Gallery `CROSS-CREATOR-COMPARE.html` now 47 pairings (19 improved / 28 validated), data-driven.

## 2026-06-25 — Overnight autonomous run (back-catalog + 8 new templates + 3 Codex cycles)

Deep back-catalog scan of ALL 22 creators (enumerated full channels — thousands of videos;
deep-sampled ~150 previously-unanalyzed; frames in references/creators/<c>/_backcat/, videos
deleted). Library already covered ~everything → 8 genuinely-new templates built + registered
(cross-creator driver now 55 + abhi 23): MatrixGridHeatmap9x16, DocumentHighlightSwipe16x9,
PaintStrokeRibbonBanner16x9 (aiexplained), SpectrumSlider9x16 (abhishek), BeforeAfterSliderWipe9x16
+ ModelNameChipComparison9x16 (estebandiba), RingTopologyHopCounter9x16 + RotatingVectorDial9x16
(adamrosler).

Then 3 Codex (gpt-5.5, reasoning=high — gpt-5.5-pro/codex are BLOCKED on the ChatGPT-account
Codex CLI) visual+code review cycles (docs/codex-review/OVERNIGHT-ITER-{1,2,3}.md), fixing real
findings between each (always verify Codex against ground truth — it produced a confident FALSE
POSITIVE earlier claiming ABHI-COMPARE paths broken; they resolve via k=component id):
- C1: BeforeAfterSliderWipe label/handle collision (anchor labels per-half, upper band, smaller);
  build-cross-creator-gallery.py blurb markdown cleanup.
- C2: ModelNameChipComparison persistent ModelRail (comparison legible on a still); gallery "NEW"
  verdict + badge for the 8 unscored new comps (were overstated as VALIDATED·—).
- C3: clean final pass (only NITs).

OVERNIGHT TOOLING/HABITS that worked: .claude/OVERNIGHT-PLAN.md = idempotent phase checklist a
resume reads; armed a durable-ish CronCreate at 5:22am to auto-resume after the 5h limit reset
(the disk-backed scheduled-tasks MCP needs an approval the sleeping user can't give). Codex CLI:
`cat promptfile | codex exec -m gpt-5.5 -c model_reasoning_effort=high -s workspace-write -c
approval_policy=never --skip-git-repo-check -i <sheets...>` (the -i flag is VARIADIC — pass the
prompt via stdin, not as a positional arg, or -i swallows it). Codex sheets:
scripts/build-codex-review-sheets.py (source vs ours contact sheets).
End state: tsc=0, registry loads, 55+23 clips, 0 leaked bundles, all committed.


## 2026-06-25 — CodingFab (@CodingFab) added + 4 new templates
New reference creator: **codingfab** (YouTube, English AI/coding/dev-tools). 24 Shorts
scraped via `npm run scrape:shorts -- --handle codingfab`, 192 keyframes extracted,
source videos deleted (frames kept). Analyzed by 24 parallel Opus agents + synthesis vs
the 121-comp inventory (raw: docs/research/codingfab/SYNTHESIS.md; creator doc:
references/creators/codingfab/ANALYSIS.md). 13/24 mapped to existing comps; **4 genuinely-new
atomic templates built + registered + rendered + visually QA'd**:
- ConcentricHierarchyRadialCallout9x16 (nested containment rings — gap vs Venn/Force/Decision)
- MetricBarsComparisonCard9x16 (per-item multi-metric bar grids — denser than 2x2/benchmark)
- StatCardSequenceWithUnderlines9x16 (CodingFab signature colored-underline stat reveal)
- AppScreenCarousel9x16 (procedural multi-screen phone-mockup walkthrough)
Added to cross-creator driver TARGETS + source-map.json (pinned to source reels);
CROSS-CREATOR-COMPARE.html now 59 pairings. Library 121 -> 125 registered compositions.
Skipped as non-atomic (honest): GameProgressWalkthrough (footage), ProductExplainerHeroSequence
(sequencer), ComparisonFeatureExplainer + InteractiveUICarousel (covered by existing combos).
GOTCHA confirmed again: a build agent stacked ConcentricHierarchy ring labels at center; fixed
to per-band staggered Y (labelY = CENTER_Y - radius + inset).


## 2026-06-25 (2nd session) — backlog wave: SceneSequencer + polish, 125->127 comps
- NEW SceneSequencer9x16: self-contained multi-scene orchestrator (hero/comparison/stat/
  bullets/cta via <Series> + per-scene transitions + progress bar). The "one props array ->
  full multi-scene Short" capability. Registered/rendered/QA'd.
- NEW AbhiWaveformTranscript9x16 wrapper (showTranscript variant). GOTCHA fixed in
  AbhiWaveform.tsx: transcript word spans had no inter-word whitespace, so a long transcript
  could not line-break and overflowed — fix = breakable space between words + canvas-relative
  chip (left/right px(80)). showTranscript default false so 73 consumers unaffected.
- ConcentricHierarchyRadialCallout9x16: rings now bold/visible; dropped redundant in-band
  descriptions so the 4 ring labels are single-line + non-overlapping (3rd iteration — the
  concentric ring-tops are only ~60-70px apart, so label+description blocks inherently
  overlapped; labels-only fits).
- 4 CodingFab cross-creator notes added -> gallery scores them NEW 8-9/10 (was bare NEW).
- Skipped (documented): ADAPTED gallery badge (cosmetic/debatable) + DiagramExplainer relabel
  (would drop midu.dev from the gallery). Backlog/decisions live in .claude/NEXT-STEPS.md.
- Gave the user a paste-ready Codex prompt to frame-by-frame audit both galleries ->
  docs/codex-review/VISUAL-AUDIT-FROM-CODEX.md (to fold in next).


## 2026-06-26 — merged worktree -> main; added rileybrown.ai (reference, 0 templates)
- MERGED branch claude/recursing-tu-dac74b -> main (fast-forward to 21f2341): banked the
  whole session (CodingFab + 4 templates, SceneSequencer, AbhiWaveform variant, source-map,
  3-reviewer audit fixes). main's pre-session WIP stashed at stash@{0} (recoverable).
- NEW reference creator rileybrown.ai (@rileybrown.ai, TikTok, Vibecode.dev cofounder) — the
  candidate-pool "must-track English builder lane." 18 TikToks scraped, 144 frames, videos
  deleted. 18-agent analysis: he is a product-demo/talking-head VLOGGER, not a motion-graphics
  creator — 83% talking-head, 89% screen-rec, 0% procedural motion-graphic. ZERO new buildable
  templates (all 4 layouts COVERED by SpeakerOverlayScene/EditorBlock/SplitScreenInterview/
  DiagramExplainer). Kept as persona/coverage/topic reference. Honest outcome: confirms
  coverage of the builder-demo lane, does not expand the library. Docs: references/creators/
  rileybrown.ai/ANALYSIS.md + docs/research/rileybrown/SYNTHESIS.md.
- IG retries motiondarwin/zenzuke still throttled (motiondarwin returned only a profile URL).
- ⚠️ **GOTCHA (2026-06-26): Workflow `agentType:'Explore'` (and the default workflow subagent)
  run on `claude-haiku-4-5`, NOT the session Opus model.** Confirmed via run metadata. For any
  VISION-critical fan-out (analyzing contact sheets / frames for motion craft), pin `model:'opus'`
  on the `agent()` call — Haiku under-detects subtle craft. Caught when austin.marchese's catalog
  (Haiku) missed 18 craft details that Codex xhigh caught; re-ran Reviewer #1 on Opus
  (`docs/research/austin-anim/MY-CATALOG-OPUS.md`). Also feed Opus the raw `frames/m-XXXX.jpg`
  (higher-res) in addition to the tiled sheets for the subtle calls.
- ✅ **Liquid-glass atom family SHIPPED (2026-06-26)** from the austin.marchese + nateherk study
  (3-reviewer consensus: both creators = ONE liquid-glass system, austin warm / nate cool; 0 net-new
  templates → an ATOM layer, not duplicate comps). New: `src/components/liquidglass/{tokens,
  GlowPulseOverlay,LitSphereGlyph,ArcLightWipe,ClauseHighlightPhrase}.tsx` + comps
  `LiquidGlassShowcase9x16` + `PromptCardPedagogy9x16` (Root.tsx); FloatingCaption gained optional
  `glowColor`+`rotationDegrees`. tsc 0, render-QA'd (`output/qa-liquidglass/`). nate cool variant =
  `theme="cool"` token (no separate build). Signature craft to preserve when extending: two-stage
  border-settle→glow-bloom (separate easing), clause-highlight arrives ~6-10f AFTER text (second-read),
  LitSphereGlyph is OPT-IN per card. Reverify: `LG_THEMES` in tokens.ts before recommending colors.
- ⚖️ **video-use evaluation (2026-06-30): harvest-ideas-keep-stack.** browser-use/video-use is an AI
  video EDITOR (Claude Code skill, ffmpeg + paid ElevenLabs) that *consumes* Remotion/Hyperframes —
  a peer to our auto-edit pipeline (D1-D5/WS-C), NOT a Remotion competitor and NOT a framework to
  migrate templates into (it has no template library by design). Our moat = branded template library +
  local/free (faster-whisper, no paid API). Docs: `docs/research/video-use/{ANALYSIS,FFMPEG-RULES-AUDIT}.md`.
  HARVESTED (all committed): 30ms audio fades (renderFromPlan), packTranscript.ts (takes_packed.md),
  selfEvalRender.ts (QA pass), optional EditSegment.grade. Our pipeline is production-correct vs their
  12 ffmpeg rules (cuts at detected silence; captions/overlays in Remotion). Do NOT vendor it in (young
  single-maintainer repo + paid dep). Open follow-ups in NEXT-STEPS (multi-source grade, wire self-eval,
  transcript-semantic LLM cutting). If revisiting: re-check their repo maturity (was ~2mo old, ~16 commits).

## 2026-07-06 — austin.marchese re-check + pipeline dogfood (Fable session)

- **Channel diff vs 2026-06-26 study:** +2 new uploads (`HGCHgD4uGgY` "8 Claude Loops…",
  `2fc0NX9vIJ8` "Self-Improving System…"). Three-reviewer verdict HOLDS (reskinned nateherk,
  atom layer not templates). One uncataloged layout → built `FeedbackLoopCycle16x9/9x16`
  (shared core + thin aspect wrappers, content-driven duration, idle glow after build — per
  FABLE V17 lesson). New videos KEPT at `references/creators/austin.marchese/<id>/video.mp4`.
- **Dogfood milestone:** first real end-to-end autoedit run on third-party talking-head
  footage (22s clip, whisper EN, ~30s render). Found + FIXED a CRITICAL EDL bug (`9ec50d2`):
  overlay `fromFrame/toFrame/anchor` were dropped and scenes mounted overlays untimed →
  every suggested overlay fired at t=0. Scenes now mount timed overlays in `<Sequence>`.
  Full findings ledger: FABLE.md (root, V1–V24 + phased fix plan for Opus).
- **Gotcha reaffirmed:** overlay molecules self-animate from local frame 0 — any NEW scene
  consuming `overlayTrack` MUST wrap them in `<Sequence from={fromFrame}>`.
