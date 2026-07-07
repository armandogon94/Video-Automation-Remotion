# Bake-off — Remotion vs. Hyperframes

## OWNER OVERRIDE (2026-07-06, Armando): KEEP BOTH ENGINES.

Armando's ruling supersedes the verdict below: **Hyperframes stays as a living creative
option, not a retired reference.** His reasoning: the "Remotion wins" call reflects
*investment bias* (Hyperframes got 2 commits and zero real feature work while Remotion got
everything), not a fair test — the same-script side-by-side this document describes NEVER
actually ran, and he wants per-video choice ("this one came out better in X"). Standing
task (attended, low priority): give Hyperframes a fair shake — `npm install` it, run ONE
real script through BOTH engines per this doc's workflow, present side-by-side. Remotion
remains the DEFAULT engine meanwhile. Do not delete `hyperframes/`.

## Prior verdict (2026-07-02, superseded above): Remotion wins.

**Decision (superseded):** Remotion is the primary production rendering engine. Hyperframes
was to be retired to reference status. The rest of this document (the original head-to-head
workflow) is kept — it is now again the ACTIVE recipe for the pending fair-shake run.

**How it was decided — by revealed preference, not a visual head-to-head.** The original plan
(below) was "run the same script through both, judge visually side-by-side." That comparison
was never actually run. In the meantime the decision made itself:

- **Investment was 100% Remotion.** Since the bake-off was set up (2026-05-15) the Remotion
  side grew to **130 registered compositions**, the entire **auto-edit subsystem**
  (`src/autoedit/`), the creator-replica families, and the **liquid-glass atom family**.
  Hyperframes received **2 commits total** (2026-05-29, 2026-06-01) and has not been touched
  since — it has **no installed `node_modules`**, so its documented commands cannot even run
  today.
- **The library IS the product.** The branded, creator-replica Remotion template library is
  the moat. Re-platforming ~100k lines of TSX onto HTML+GSAP is not a real option, and the
  auto-edit pipeline (overlay registry, EDL props, `calculateMetadata`) is architecturally
  Remotion-only.
- **Carry cost with zero payoff.** Keeping the challenger duplicates brand assets, duplicates
  caption styling across templates, and forces every doc to explain two engines and two Node
  setups — for a comparison nobody is going to run.
- **Risk of retiring it ≈ zero.** Everything shared (Edge-TTS, faster-whisper,
  `src/ffmpeg/commands.ts`, the brand) lives OUTSIDE `hyperframes/` and stays. The
  `hyperframes/` tree remains committed as a reference; nothing about it is deleted by this
  decision.

**What this means going forward:**
- Build all new templates and features in Remotion (`src/`).
- Do not add features to `hyperframes/`; treat it as a frozen reference.
- If the visual head-to-head is ever genuinely wanted, run ONE real script through the (fixed)
  Remotion pipeline first, then spin Hyperframes back up (`cd hyperframes && npm install`)
  before comparing.

---

## Original bake-off workflow (historical — kept for reference)

> Run the same Spanish script through both engines, compare the outputs.

This project carried **two independent rendering engines**:

- **Remotion** (incumbent, now the winner) — React/TSX components, lives in `src/`.
- **Hyperframes** (challenger, now retired) — plain HTML + GSAP, lives in `hyperframes/`.

They share everything else (Edge-TTS for audio, faster-whisper for word timings, FFmpeg for post-processing, the Armando Inteligencia brand assets). Whichever engine you pick later is the variable being tested. Same script in, two MP4s out, judge visually.

---

## Prerequisites (one-time)

```bash
# Node 24 is required for Hyperframes (the Remotion side accepts ≥20).
nvm install 24.14.0
nvm use 24.14.0

# From project root
npm install
cd hyperframes && npm install && cd ..

# Python tooling (Edge-TTS + faster-whisper)
uv sync   # reads pyproject.toml + uv.lock
```

First run will download:
- Chrome Headless Shell (~90 MB) — for both Remotion and Hyperframes
- faster-whisper "small" model (~500 MB) — cached at `~/.cache/huggingface/`

After that, runs are warm.

---

## Run the same script through both engines

Pick the script + voice + template you want, then run **both** of these:

### Remotion side

```bash
npm run generate -- \
  --script "Tu texto en español aquí." \
  --voice "es-MX-JorgeNeural" \
  --template explainer \
  --platforms youtube,reels \
  --output ./output/remotion-run-1
```

Outputs in `output/remotion-run-1/`:
- `audio.mp3`
- `raw_video.mp4`
- `normalized.mp4`
- `video_<timestamp>_youtube.mp4`
- `video_<timestamp>_reels.mp4`
- `video_<timestamp>_thumbnail.jpg`
- `word_timings_final.json` (with `source: "whisper"` or `"tts-approximate"`)

### Hyperframes side

```bash
cd hyperframes
npm run generate -- \
  --script "Tu texto en español aquí." \
  --voice "es-MX-JorgeNeural" \
  --template explainer \
  --platforms youtube,reels \
  --output ./output/hf-run-1
cd ..
```

Outputs in `hyperframes/output/hf-run-1/`:
- Same files as the Remotion side, plus `_hf` baked into the filename so you can tell them apart at a glance.

### Compare

The two MP4s are now ready to view side-by-side. Same script, same voice, same captions timing source — only the rendering pipeline differs.

---

## Shared flags (both CLIs accept the same options)

| Flag | Default | What it does |
|---|---|---|
| `--script <text>` | required | Spanish script text |
| `--voice <name>` | `es-MX-JorgeNeural` | Any of 45 Edge-TTS Spanish voices |
| `--template <name>` | `explainer` | `explainer` · `talking-head` · `listicle` · `quote` · `vertical` |
| `--platforms <csv>` | `youtube` | `youtube` · `tiktok` · `reels` · `square` |
| `--output <dir>` | `./output` | Output directory |
| `--fps <n>` | `30` | Frame rate |
| `--rate <±%>` | `+0%` | Speech rate (e.g. `+20%`) |
| `--pitch <±Hz>` | `+0Hz` | Pitch adjustment |
| `--whisper` / `--no-whisper` | on | Use faster-whisper for accurate word timings |
| `--whisper-model <size>` | `small` | `tiny` · `base` · `small` · `medium` · `large-v3` |
| `--language <code>` | `es` | Language code for whisper |

### Hyperframes-only extras

| Flag | Default | Template that uses it |
|---|---|---|
| `--title <text>` | first sentence of script | all (overrides auto-derived title) |
| `--name-tag <text>` | `Armando Inteligencia` | `talking-head` |
| `--author <text>` | `Anónimo` | `quote` |
| `--items <json>` | parsed from script newlines | `listicle` |
| `--seconds-per-item <n>` | `5` | `listicle` |

---

## What to compare

After the two runs finish, look for:

1. **Caption sync.** Both pipelines feed the same Whisper word timings to their compositions. Disagreement = a rendering bug to flag.
2. **Animation feel.** Remotion (spring physics) vs. Hyperframes (GSAP easings). Different aesthetic.
3. **Font rendering.** Remotion uses `@remotion/google-fonts/Inter`. Hyperframes loads from Google Fonts CDN. Should match closely.
4. **Brand consistency.** Same navy + gold + watermark on both sides. If they look different, the brand config copied into `hyperframes/brand/` may have drifted from `brand/`.
5. **Render time.** Each pipeline logs total wall-clock time at the end. Compare for the same composition.
6. **Filesize and bitrate.** Both pipelines use the same FFmpeg post-processing (`exportMultiPlatform`), so per-platform exports should be near-identical bytes. Differences come from the *raw* MP4 each engine produces.

---

## Picking a winner — DONE

The winner has been picked: **Remotion** (see the VERDICT at the top of this file, 2026-07-02).

The original removal recipe was: "If Remotion wins, delete `hyperframes/` entirely and remove
its references from `.gitignore` and `README.md`." We chose the softer path — **retire, don't
delete**: `hyperframes/` stays committed as a frozen reference (it is small and self-contained),
new work goes to Remotion only, and the docs no longer present this as an open question. If a
future cleanup wants the tree fully gone, the removal recipe above still applies.

---

## Known issues / future work

- **Hyperframes `--platforms` runs FFmpeg post-processing serially within `hyperframes/scripts/generate.ts`.** The Remotion side parallelizes via `Promise.all` in `src/ffmpeg/commands.ts`. Both share `exportMultiPlatform` from the same file, so Hyperframes gets the parallel speedup for free.
- **Hyperframes' `index.html` is overwritten each run.** It's git-ignored. The committed placeholder version just tells future-you "run the generate CLI."
- **Per-template caption styling is duplicated.** If you tweak caption colors/spacing, you'll need to update 5 HTML files. Easy candidate for a shared partial later.
- **Engine swap mid-run is not supported.** Pick one engine per `generate` call.
