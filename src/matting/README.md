# `src/matting` — Person-matte pre-step (text-behind-speaker enabler)

Generates a per-frame **alpha matte** of the speaker from talking-head footage so a
Remotion composition can place captions / graphics **behind** the person (the person
occludes the text → a 3D depth effect). This is the LOCAL, offline pre-render step
that feeds `SpeakerOverlayScene.foregroundMatte` (built by sibling agent D1).

Model: **RobustVideoMatting (RVM)**, `mobilenetv3` variant. Purpose-built for video
(recurrent, temporally stable edges — no per-frame flicker), produces soft alpha
(hair edges), runs locally on Apple Silicon (MPS) or CPU. Chosen in
`docs/research/wave-9/SUBTITLES-AND-DEPTH-MATTING.md` Part 2.

## Install (one-time)

RVM is an **optional extra** (not a core dep) — it pulls torch (~84 MB):

```bash
uv add --optional matting torch torchvision av pims      # already in pyproject.toml [matting]
# or just: uv sync --extra matting
```

> **Install trap (from the research doc):** there is **NO usable PyPI package named
> `rvm`** — the one that exists is unrelated "R in Python". RVM is loaded via
> `torch.hub.load("PeterL1n/RobustVideoMatting", "mobilenetv3")`. Do **not** `uv add rvm`.
> Weights (~14.5 MB) are fetched from GitHub on first run, cached under
> `~/.cache/torch/hub`, then run fully offline.

### SSL note (first run only, macOS python.org builds)

The macOS python.org framework build ships without a CA bundle, so the first
torch.hub fetch fails with `CERTIFICATE_VERIFY_FAILED`. Export certifi's bundle for
the first (network) run:

```bash
export SSL_CERT_FILE=$(uv run --extra matting python -c "import certifi; print(certifi.where())")
```

The script also sets this itself from `certifi` if `SSL_CERT_FILE` is unset, so the
manual export is belt-and-suspenders. After weights are cached, no network is needed.

## Run

### Quick verification (first 4 s, RGBA PNG sequence — the recommended output)

```bash
export SSL_CERT_FILE=$(uv run --extra matting python -c "import certifi; print(certifi.where())")
uv run --extra matting python src/matting/rvm_matte.py \
  --input  output/footage/claude-cowork/IMG_3618.MOV \
  --output output/matting-test/IMG_3618-pngs \
  --device mps --downsample-ratio 0.25 --seconds 4 --output-type png_sequence
```

### Matte a FULL clip (RGBA PNG sequence → Remotion)

```bash
export SSL_CERT_FILE=$(uv run --extra matting python -c "import certifi; print(certifi.where())")
uv run --extra matting python src/matting/rvm_matte.py \
  --input  output/<slug>/speaker.mp4 \
  --output public/matte/<slug>/fg \
  --device mps --downsample-ratio 0.25 --output-type png_sequence
```

(For 4K footage use `--downsample-ratio 0.4`; for 1080p `0.25` is fine. Drop
`--seconds` to matte the whole clip.)

### Single-file green-screen `.mp4` alternative

```bash
uv run --extra matting python src/matting/rvm_matte.py \
  --input output/<slug>/speaker.mp4 --output public/matte/<slug>/fg.mp4 \
  --device mps --output-type green
```

## CLI

| Flag | Default | Meaning |
|---|---|---|
| `--input` | (required) | Source talking-head video. |
| `--output` | (required) | png_sequence → a **directory** (RGBA PNGs written inside). green/alpha → a `.mp4` file path. |
| `--device` | `auto` | `auto` (prefers MPS, CPU fallback) \| `mps` \| `cpu`. |
| `--downsample-ratio` | `0.25` | RVM internal downsample. Lower = faster/coarser. ~0.25 HD, ~0.4 for 4K. |
| `--seconds N` | (none) | Matte only the first N seconds (quick runs). Requires ffmpeg on PATH. |
| `--output-type` | `png_sequence` | `png_sequence` (RGBA, recommended) \| `green` (green-screen mp4) \| `alpha` (grayscale alpha mp4, debug). |
| `--seq-chunk` | `12` | Frames per forward pass (throughput vs memory). |

Importable API: `rvm_matte.run_matte(input_path, output_path, device, downsample_ratio,
seconds, output_type, seq_chunk) -> dict` (returns paths, device, `elapsedSeconds`,
`frameCount`, `outputBytes`).

## Output modes — what RVM can and cannot emit

| `--output-type` | What it writes | Alpha? | Remotion consumption |
|---|---|---|---|
| `png_sequence` *(default)* | directory of **RGBA** PNGs (`0000.png`, `0001.png`, …) | ✅ true per-pixel alpha | **recommended** — pixel-perfect, no green spill |
| `green` | one H.264 `.mp4`, foreground over green `[120,255,155]` | ❌ (keyed at runtime) | `OffthreadVideo` + chroma key |
| `alpha` | one H.264 `.mp4`, grayscale alpha matte only | ❌ (it *is* the mask) | debug / static-mask reuse |

> **No alpha `.mov`:** RVM's bundled `VideoWriter` hard-codes H.264 / `yuv420p`, so it
> **cannot** emit a ProRes-4444 / alpha-channel `.mov`. For true alpha into Remotion use
> the **RGBA `png_sequence`** (default). The single-file option is green-screen `.mp4`.
> (The script monkey-patches RVM's `VideoWriter` so the green/alpha mp4 modes work on
> modern PyAV ≥ 14, which otherwise crash on a string `rate` arg.)

## How `SpeakerOverlayScene.foregroundMatte` consumes the output

Per the research doc (§2.4–2.5), the depth illusion is pure layer ordering:

```
1. base video (background plate — the speaker)
2. overlays / captions where behindSpeaker === true     ← BEHIND the person
── FOREGROUND MATTE LAYER (this module's output) ──      ← the cut-out person, occludes 2
3. overlays / captions where behindSpeaker !== true      ← in front (today's default)
4. handle chip
```

The matte produced here is layer "FOREGROUND". Wire it via the schema sketch in the
research doc:

```ts
foregroundMatte: z.object({
  src: z.string(),                                         // dir (png-sequence) OR .mp4, relative to public/
  kind: z.enum(["alpha-mov", "green-mov", "png-sequence"]).default("png-sequence"),
}).optional()                                              // omitted → no depth, all text in front (fallback)
```

- **`kind: "png-sequence"` (recommended)** → put the PNG dir under `public/matte/<slug>/fg/`.
  `<SpeakerForegroundMatte>` renders the frame for the current time:
  ```tsx
  const frame = useCurrentFrame();
  const name = String(frame).padStart(4, "0");           // 0000.png, 0001.png, … (matches this script's naming)
  return <Img src={staticFile(`matte/<slug>/fg/${name}.png`)} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />;
  ```
  Browser composites the RGBA natively — no chroma key, no green spill on hair.
- **`kind: "green-mov"`** → `<OffthreadVideo src={staticFile("matte/<slug>/fg.mp4")}>` wrapped
  in a chroma key (`@remotion/chromakey` or a CSS/WebGL key) to knock out the green.
- **`kind: "alpha-mov"`** → not produced by this script (RVM can't write alpha video). Use
  png-sequence for true alpha.

### Alignment requirements (must hold)

- Matte must be **frame-locked** to the background plate: same fps, same frame count,
  same start. Generate the matte from the **exact** `speaker.mp4` the composition uses.
- PNGs are zero-padded and indexed by **absolute frame** (`0000.png` = frame 0) — index
  them with `useCurrentFrame()` directly (no offset) when the matte covers the whole clip.
- Keep matte resolution == composition resolution so silhouette edges line up.
- Depth reads best for **decorative** big words / graphics, not the primary readable
  caption (the head occludes part of any line it overlaps). Keep the heavy text-shadow.

## Verification run (proves the pipeline is real)

Ran on the first **4 s** of `output/footage/claude-cowork/IMG_3618.MOV`
(2160×3840 HEVC, 30 fps):

| Metric | Value |
|---|---|
| Output | `output/matting-test/IMG_3618-pngs/` — **120** RGBA PNGs (`0000.png`…`0119.png`), ~962 MB |
| Alpha verified | frame 60: mode `RGBA`, size `(2160, 3840)`, alpha extrema `(0, 255)` → real transparency |
| Device | **MPS** (Apple Silicon Metal) |
| Wall-clock | **153.2 s** (~1.28 s/frame at 4K, PNG encode/IO bound) |
| Downsample | `0.25` |

Also verified `green` mode: `output/matting-test/IMG_3618-green.mp4` (60 frames, 2 s,
H.264 2160×3840, 26.3 s on MPS — much faster, single-file vs 4K PNG IO).

> Both test outputs live under `output/matting-test/` which is **gitignored**
> (`output/*`). 4K PNG sequences are large; prefer a lower input resolution or
> `--output-type green` for full clips if disk is a concern, or matte a 1080p
> down-scaled `speaker.mp4`.

## Fallback (if RVM ever fails to install/run)

Per the research doc, the fallback is **MediaPipe SelfieSegmentation/ImageSegmenter**
(`uv add mediapipe`, cleanest install, 100+ FPS CPU) — faster but flickers frame-to-frame
and gives coarser edges. RVM installed and ran cleanly on this machine (see above), so the
fallback is not currently needed.
