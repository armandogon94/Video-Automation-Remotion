# Wave-9 Research — Subtitle/Caption Styles + Text-Behind-Speaker (Depth) via Local Matting

> **Status:** Research + feasibility (NOT implementation). Read-only against `src/`; install probes done in a throwaway `/tmp` venv (since removed).
>
> **Scope:** Part 1 catalogs modern short-form caption styles and proposes concrete NEW presets to add to `FloatingCaption` as a `style` enum. Part 2 evaluates LOCAL person-matting models, recommends one, verifies installability on this machine (Apple Silicon, macOS 26.5 arm64), and outlines the "text behind speaker" compositing pipeline + a `SpeakerOverlayScene` integration sketch.
>
> **Grounding (read for this doc):**
> - `src/components/FloatingCaption.tsx` — the transparent-overlay caption molecule we will extend.
> - `src/components/captions/EditorialCaption.tsx`, `ChunkedPhraseCaption.tsx`, `CaptionPillWithKeyword.tsx`, `EducationalDisclaimerCaption.tsx` — existing caption family.
> - `docs/research/wave-7/ADR-002-captions-register-aspect-matrix.md` — the `register` × `aspect` matrix that governs the caption layer.
> - `src/compositions/SpeakerOverlayScene9x16.tsx` / `SpeakerOverlayScene16x9.tsx` — the talking-head overlay foundation we will extend with a foreground-matte layer.
> - `src/compositions/StudioCompositor16x9.tsx` + `src/components/WebcamPipOverlay.tsx` — prove the repo already plays **alpha-keyed presenter video via `OffthreadVideo`**, so the matte plumbing is not greenfield.
> - `src/brand/fonts.ts` — the loaded font faces (Inter, Oswald condensed, JetBrains Mono, Fira Code, Playfair Display).

---

## Part 0 — How this slots into what already exists (do not re-litigate)

Two things are load-bearing and must be respected:

1. **`register` is the COLOR axis; `mode`/`style` is the LAYOUT/ANIMATION axis — they are orthogonal sub-axes.** ADR-002 §7 #3 flags this explicitly as "the single biggest unresolved modeling question": the shipped enum `{punchy, editorial, technical, custom, none}` is a *color register* (active/past/future ink), NOT an animation style. `FloatingCaption` already separates them: it has `register` (color) and `mode` (`karaoke | sentence`). **The new `style` enum proposed in Part 1 is the animation/layout axis and must compose WITH `register`, not replace it.** A preset names a *recommended pairing* of (font, weight, case, animation, default register, position) but the caller can still override `register`.

2. **9:16 vs 16:9 are different primitives (ADR-002 Addendum A.2 / Nate Correction 2).** Every new style preset below declares which aspect lane(s) it belongs to. The whole 16:9-A-roll column collapses to `register:'none'` (no burned caption over a landscape talking head). New animated presets therefore target **9:16** and **16:9-B-roll**, never 16:9-A-roll.

`FloatingCaption` is the right home for the new presets because it renders text over a *fully transparent* `AbsoluteFill` (no pill, no paper chassis), which is exactly what sits over speaker footage and what we need for the depth effect in Part 2.

---

# PART 1 — Modern caption / subtitle styles + proposed presets

## 1.1 What top short-form creators actually use (2025–2026)

### Fonts
| Font | Where it shows up | Notes |
|---|---|---|
| **TheBoldFont** (a.k.a. "Komika"-adjacent free bold) | The literal Hormozi look; CapCut/Submagic "Hormozi preset" | The most-cited "what Hormozi actually uses." Ultra-heavy, slightly rounded. We do **not** have this face loaded. |
| **Montserrat (Black/800)** | The most common substitute for TheBoldFont | BlitzCut's "Hormozi" preset is Montserrat Bold. Geometric, very legible at small size. Not currently loaded (we have Inter as our geometric-ish sans). |
| **Anton / Bebas Neue / Oswald (condensed)** | "Premium"/editorial and sports/hype content | Tall, narrow, ALL-CAPS by nature. **We already load Oswald** (`FONT_STACKS.condensed`) — free win. |
| **Inter (800/900)** | Clean tech/educational captions | **Already our `FONT_STACKS.sans`** and what `FloatingCaption` uses today (weight 800). |
| **Druk Wide / Impact** | High-impact title-card-style captions | Wide, shouty. Not loaded; not free (Druk). |
| **TikTok Sans** | TikTok's own open-source UI face (released mid-2025) | Now usable in external editors; a "native platform" look. Optional future add. |

**Takeaway for us:** we can ship the three highest-value looks with faces we *already load* — Inter 800/900 (clean), Oswald (condensed ALL-CAPS Anton/Bebas substitute). The only genuinely-missing face for full Hormozi fidelity is TheBoldFont/Montserrat Black; flag as an optional `@remotion/google-fonts/Montserrat` add (Montserrat is on Google Fonts, so it's a one-line loader addition like the existing Oswald line in `src/brand/fonts.ts:37`).

### Case
- **ALL-CAPS** dominates high-energy / opinion / motivational / business (Hormozi, hype). Reads punchier sound-off.
- **Sentence/Title case** reads "more natural" for educational/narrative and longer text — and is easier to read in long words (Spanish has long words; ALL-CAPS hurts readability of e.g. "INTELIGENCIA ARTIFICIAL" more than English). Given our **Spanish-default** content, sentence-case should be a first-class option, not an afterthought.

### Animation styles (ranked by sound-off legibility)
| Animation | Description | Sound-off read | Verdict |
|---|---|---|---|
| **Word-by-word karaoke highlight** | Phrase visible; active word recolors as spoken | **Best** — eye tracks the moving highlight; matches speech pace | Already our default (`mode:'karaoke'`). Keep as the workhorse. |
| **Pop / scale-in per word** | Each word scales 0.8→1.0 (+ slight overshoot) as it becomes active | **Excellent** — motion draws the eye; the Hormozi "bounce" | We have a weak `scale(1.06)` on the active word; a real pop preset is the biggest visible upgrade. |
| **Highlight-box (active word boxed)** | Active word gets a filled rounded rect behind it (the "marker" look) | **Excellent** — highest contrast, unmistakable focal point | New. Strong for busy backgrounds and brand-color emphasis. |
| **Bounce** | Word pops with vertical overshoot (spring) | **Very good** — energetic; can fatigue at length | New; a flavor of pop. Fold into the pop preset via a spring. |
| **Color-flip** | Whole word flips from inactive→accent instantly (no scale) | **Very good** — clean, calm; the cyan-editorial idiom | Already expressible (`mode:'karaoke'` with no scale). Name it. |
| **Slide-up** | Each chunk/word rises a few px on entry | Good — subtle; calm/editorial | New; pairs with sentence/editorial. |
| **Blur-in** | Word/chunk fades from blurred→sharp | Good (calm), weaker at speed | New; premium/editorial, calm backgrounds only. |
| **Typewriter** | Characters appear one at a time | **Weak sound-off** — too slow vs speech pace; reads "techy" | Niche (terminal/tech beats only). Lowest priority. |

### Positioning + safe areas
- **9:16 (1080×1920):** captions in the **lower-middle third** is the platform-standard, BUT TikTok/IG/YT-Shorts UI chrome (right-rail actions, bottom caption/CTA, progress bar) eats the bottom ~12–18% and right ~12%. Our `FloatingCaption` `bottom-center` anchors at `bottom:12%` — good, but for Shorts the **caption block should be centered horizontally and kept within the central ~80% width**, and many creators push captions to **vertical center** (where the face's mouth area is) for maximum eye-dwell. `SpeakerOverlayScene9x16` already defaults caption `position:'center'`.
- **16:9 (1920×1080):** burned captions live **lower-third, centered, ≤70% frame width, ≤3 lines** (ADR-002 16:9-B-roll cell). A-roll: **no captions**.
- **Safe-area rule of thumb to bake into presets:** keep text inside 90% width / 80% height of the frame; for 9:16 keep the block out of the bottom 14% (handle chip + platform CTA already live there — see `SpeakerOverlayScene9x16.tsx:128` handle chip at `bottom:64`).

## 1.2 Proposed NEW style presets for `FloatingCaption` (the `style` enum)

Add a `style` field to `floatingCaptionSchema` (orthogonal to `register` and `mode`). Each preset is a *named bundle of defaults* — font/weight/case/animation/position/default-register — that the caller can still override field-by-field. This keeps full back-compat: omit `style` → today's behavior.

**Recommended preset set (names are the deliverable):**

| Preset name | Font (loaded?) | Weight / case | Animation | Default register | Aspect lane | When to use |
|---|---|---|---|---|---|---|
| **`classic`** *(= today)* | Inter (yes) | 800 / as-typed | karaoke recolor + tiny scale(1.06) | `editorial` | 9:16, 16:9-B | Back-compat default. The current look, named so nothing changes. |
| **`hormozi-pop`** | Montserrat Black *(needs loader)* → fallback Inter 900 | 900 / **ALL-CAPS** | **word pop**: scale 0.7→1.0 with spring overshoot + per-word | `punchy` (yellow `#F1C232`) | 9:16, 16:9-B | High-energy business/hook. The benchmark sound-off style. |
| **`box-highlight`** | Inter (yes) | 800 / ALL-CAPS | **highlight-box**: active word gets a filled brand-accent rounded rect behind it; text flips to dark ink | `punchy` or brand accent | 9:16, 16:9-B | Busy backgrounds / max-contrast focal word. Brand-colored marker look. |
| **`editorial-cyan`** | Inter (yes) | 700 / sentence-case | **color-flip** (no scale), hard pop between chunks | `editorial` (cyan `#5BC0E8`) | 9:16, 16:9-B | Calm, refined Sahil/Bilawal voice. Good for Spanish long words (sentence case). |
| **`condensed-hype`** | **Oswald** (yes) | 700 condensed / **ALL-CAPS** | **bounce** (vertical spring) per word | `punchy` | 9:16 | Sports/hype/countdown energy. Uses the face we already load. |
| **`slide-clean`** | Inter (yes) | 600 / sentence-case | **slide-up** per chunk (rise 16px + fade) | `technical` (white) | 9:16, 16:9-B | Quiet educational walkthroughs (Adam-Rosler register). |
| **`blur-premium`** | Inter (yes) | 600 / sentence-case | **blur-in** (8px→0) per chunk | `editorial` or `technical` | 16:9-B, calm 9:16 | Premium/editorial inserts on CALM backgrounds only. |
| **`type-terminal`** | JetBrains Mono / Fira Code (yes) | 500 / as-typed | **typewriter** (char-by-char) | `technical` | 16:9-B | Niche: terminal/tech/code beats. Lowest priority. |

Notes:
- **Only `hormozi-pop` needs a new font load** (Montserrat Black via `@remotion/google-fonts/Montserrat`, mirroring the Oswald loader at `src/brand/fonts.ts:37`). Everything else uses already-loaded faces. Ship the others first; gate `hormozi-pop` on the font add (graceful fallback to Inter 900 in the meantime).
- **`box-highlight`** needs a small render change in `FloatingCaption`: wrap the active word in a positioned `<span>` with a background pill drawn behind only the active word (instead of just recoloring). This is the one preset that touches layout, not just timing.
- All presets keep the existing **heavy text-shadow** (`FloatingCaption.tsx:294`) so they stay legible over any backdrop — critical for Part 2 where text may sit partly over the speaker silhouette.
- `register` stays the source of truth for color; a preset only sets a *default* register. This honors ADR-002 §7 #3 (color vs layout are orthogonal axes).
- ALL-CAPS is applied via `textTransform:'uppercase'` in the preset, NOT by mutating the source text — so Spanish accents and the underlying `wordTimings` text are preserved.

**Schema sketch (illustrative — implementation later):**
```ts
style: z.enum([
  "classic", "hormozi-pop", "box-highlight", "editorial-cyan",
  "condensed-hype", "slide-clean", "blur-premium", "type-terminal",
]).default("classic"),
```
A `resolveStyle(style)` table maps each name → `{ fontFamily, fontWeight, textTransform, animation, defaultRegister, defaultPosition }`; explicit props on `FloatingCaption` always win over the preset's defaults.

---

# PART 2 — Text-behind-speaker (depth) via LOCAL matting

**Goal:** captions/graphics that sit BEHIND the speaker — the person occludes the text — for a 3D depth effect, using a LOCAL, offline model runnable like our faster-whisper setup (uv/pip, Apple Silicon, no cloud).

## 2.1 Candidate evaluation

Criteria: (a) per-frame alpha matte of a person in video; (b) runs LOCALLY/offline on Apple Silicon (MPS or CPU); (c) pip/uv-installable like faster-whisper; (d) temporal stability for video; (e) speed + quality.

| Model | Per-frame video matte? | Local on Apple Silicon? | pip/uv install? | Temporal stability | Speed | Quality | Verdict |
|---|---|---|---|---|---|---|---|
| **RobustVideoMatting (RVM)** | ✅ purpose-built for video (recurrent, temporal memory) | ✅ torch+MPS or CPU; also ONNX (`onnxruntime`) | ⚠️ **no PyPI package**, but installs via `pip install torch torchvision av pims` + `torch.hub.load("PeterL1n/RobustVideoMatting", "mobilenetv3")` (weights cached once, then offline) | **✅ Best** — designed for temporal coherence; minimal flicker | HD ~real-time on GPU; on M-series CPU/MPS slower but fine for offline batch | Excellent soft edges (hair) | **RECOMMENDED** |
| **MediaPipe Selfie/ImageSegmenter** | ⚠️ per-frame, but each frame independent (VIDEO mode helps a little) | ✅ pure pip wheel, arm64 | ✅ `uv add mediapipe` (cleanest install of all) | ⚠️ flickers frame-to-frame without smoothing | **Fastest** (100+ FPS CPU) | Coarse edges; binary-ish mask | Great FALLBACK / fast preview |
| **rembg (u2net / isnet / BiRefNet)** | ❌ image tool (per-frame still removal) | ✅ CPU (onnxruntime); arm64 | ✅ `uv add rembg` (weights auto-download to `~/.u2net/`, cached) | ❌ no temporal model → flickers on video | Slow per frame | High on STILLS (BiRefNet) | Best for STILLS, not video |
| **BiRefNet (standalone)** | ❌ stills | ✅ torch | ❌ **no official PyPI**; ships *inside* rembg as a model option | ❌ none | Slow | **Highest still quality** | Use via rembg if a still is enough |
| **InSPyReNet (`transparent-background`)** | ⚠️ has a video/`--type` mode but frame-wise | ✅ torch | ✅ **on PyPI** (`transparent-background 1.3.4`) | ⚠️ some jitter | Medium | Very high (stills) | Strong runner-up for quality |
| **BackgroundMattingV2** | ✅ video | ✅ torch | ❌ no PyPI; **requires a separate clean background plate** (impractical for talking-head) | good | fast | high | Rejected: needs bg plate |
| **SAM2** | ✅ video object segmentation (great masks) | ⚠️ heavy; torch; MPS partial | ⚠️ install from GitHub (`segment-anything-2`), large weights | ✅ strong | **Slow / heavy** | Excellent masks but hard edges (segmentation, not matting → no soft hair alpha) | Overkill; no soft alpha |
| **ormbg** | ❌ stills | ✅ torch | ❌ no PyPI (HF weights + repo) | ❌ | slow | high (portrait stills) | Rejected for video |

## 2.2 Recommendation: **RobustVideoMatting (RVM), mobilenetv3 variant**

**Why RVM wins for our use:**
1. **It is the only candidate purpose-built for VIDEO temporal coherence.** Our deliverable is per-frame mattes over a talking head; everything else (rembg/BiRefNet/InSPyReNet/ormbg) is a *stills* remover applied frame-by-frame → visible flicker on the silhouette edge, which is exactly where the depth illusion lives. RVM's recurrent design keeps the edge stable across frames.
2. **Soft alpha (hair, edges).** It's a *matting* model (continuous alpha), not a *segmentation* model (binary mask). SAM2 gives crisp object masks but hard edges; RVM gives the feathered alpha that makes "text passing behind a head" look real.
3. **Fully local + offline after first run.** No PyPI package, but the install is small and standard (`torch torchvision av pims`), and the model loads from `torch.hub` once (~MobileNetV3 weights are a few MB), then is cached under `~/.cache/torch/hub/` and runs with **no network**. This matches our faster-whisper "download once, run offline" posture.
4. **Outputs exactly what Remotion needs.** Its bundled `convert_video` emits either a **green-screen `.mov`** (`output_type='video'`, composited onto green) OR a **PNG sequence** plus a separate **alpha** track (`output_alpha=...`). Both are first-class Remotion inputs.
5. **Verified to install on THIS machine** (see 2.3).

**When to pick a fallback instead:**
- **MediaPipe** if you want a *fast preview* or the speaker is well-lit against a contrasty background and a little edge-flicker is acceptable — it's the cleanest single-command install (`uv add mediapipe`) and runs 100+ FPS on CPU.
- **rembg + BiRefNet** (or `transparent-background`) if you only need a **single static mask** (see 2.5 "good enough" middle), where temporal stability is irrelevant because the mask never changes.

## 2.3 Verified install (run on this machine: macOS 26.5, arm64, Python 3.11, uv)

I created a throwaway `uv venv` under `/tmp`, installed the stacks, confirmed imports, then removed the venv. Results:

- **mediapipe (fallback path):** `uv pip install mediapipe` → `mediapipe 0.10.35` imported OK on arm64; `mediapipe.tasks.python.vision.ImageSegmenter` present (the modern, recommended API; the legacy `solutions.selfie_segmentation` module is deprecated/restructured — use `tasks` API).
- **RVM stack (recommended path):** `uv pip install torch torchvision av pims` →
  - `torch 2.12.0`, **`torch.backends.mps.is_available() == True`** and **`is_built() == True`** (Metal acceleration confirmed),
  - `torchvision 0.27.0`, **PyAV `av 17.0.1`** (video I/O), `pims` (frame access),
  - `torch.hub.load` callable (RVM is loaded from GitHub once, then cached offline).
- **onnxruntime 1.26.0** is on PyPI (`requires_python >=3.11`) — optional ONNX path if you want to avoid torch.

**PyPI reality checks (important caveats):**
- ❌ **There is NO `robust-video-matting` package on PyPI** (404). The PyPI package literally named **`rvm` (0.1) is UNRELATED** — it's "R in Python" by `avelino`, a squatter for the R language. **Do not `uv add rvm`.** RVM installs from GitHub/torch.hub only.
- ❌ **No official `birefnet` / `BiRefNet` / `ormbg` PyPI package.** BiRefNet is reachable only *through* `rembg` (as a model name) or its GitHub repo.
- ✅ On PyPI and installable: `mediapipe 0.10.35`, `rembg 2.0.75` (`requires <4.0,>=3.11`), `transparent-background 1.3.4`, `onnxruntime 1.26.0`.

**Recommended install (add to `pyproject.toml` as an optional extra, e.g. `[matting]`, NOT core deps):**
```bash
# RVM (recommended) — torch.hub model, no PyPI package for RVM itself
uv add torch torchvision av pims
# then in code: model = torch.hub.load("PeterL1n/RobustVideoMatting", "mobilenetv3")

# Fallback / fast preview
uv add mediapipe

# Stills-only high-quality mask (static-depth middle ground)
uv add rembg            # BiRefNet/isnet/u2net models, weights cache to ~/.u2net/
```

**Minimal RVM run snippet (offline after first weight fetch):**
```python
import torch
from torch.hub import load
# loads RVM repo + mobilenetv3 weights once; cached under ~/.cache/torch/hub afterwards
model = load("PeterL1n/RobustVideoMatting", "mobilenetv3").eval()
if torch.backends.mps.is_available():
    model = model.to("mps")        # Apple Silicon Metal accel
convert = load("PeterL1n/RobustVideoMatting", "converter")  # bundled convert_video
convert(
    model,
    input_source="output/<slug>/speaker.mp4",
    output_type="png_sequence",                 # OR "video"
    output_composition="output/<slug>/fg/",     # dir for png seq (or .mov if video)
    output_alpha="output/<slug>/alpha/",        # per-frame alpha matte (the matte we need)
    downsample_ratio=0.25,                       # tune per resolution
)
```
For Remotion the easiest target is a **green-screen `.mov`** (`output_type='video'`, `output_composition='fg.mov'`) which `OffthreadVideo` can play and a chroma key can knock out — OR the **PNG sequence + alpha** for pixel-perfect alpha (no keying artifacts). See 2.4.

> Feasibility caveat: I verified **imports + MPS availability**, not a full matting render (per instructions — that's implementation). RVM on M-series via MPS is offline-batch-grade, not real-time at 1080×1920; budget it as a pre-render step alongside faster-whisper, not an interactive one. Some RVM ops may fall back to CPU on MPS depending on the torch build; if MPS errors, run on CPU (still fine for offline batch).

## 2.4 Compositing pipeline — "text behind speaker"

The depth illusion is pure **layer ordering**: put the caption/graphic BETWEEN a background plate and a *foreground* layer that is the speaker cut out via the matte.

```
INPUT: speaker.mp4 (talking head)
   │
   ├─(matting step, RVM, offline pre-render)──► foreground asset:
   │        • green-screen fg.mov  (OffthreadVideo + chroma key), OR
   │        • PNG sequence + alpha PNG sequence (pixel-perfect)
   │
   └─ Remotion composition layer stack (bottom → top):
        1. [BACKGROUND PLATE]   — original speaker.mp4 (or a blurred/darkened copy,
                                  or a brand gradient, or B-roll). The person is here too,
                                  but it's the *backdrop* copy.
        2. [CAPTION / GRAPHICS] — FloatingCaption / overlays  ← sits BEHIND the person
        3. [FOREGROUND = SPEAKER cut-out via matte]           ← occludes the text
```

Because layer 3 is the *same* person re-drawn on top via alpha, the text in layer 2 is visible everywhere EXCEPT where the person's silhouette is → the person appears to stand *in front of* the caption. Where `behindSpeaker` is false, the caption mounts ABOVE layer 3 (normal "in front" behavior) — no matte consulted.

**Per-frame asset wiring in Remotion (two options):**
- **Option A — green-screen `.mov` + chroma key (simplest):** layer 3 = `<OffthreadVideo src={fg.mov}>` wrapped so green is keyed out. Remotion has `@remotion/chromakey` (`makeRectangle`/CSS) or a WebGL/CSS `mix-blend`/`mask` approach; a green key is one extra dependency. The repo already plays alpha-keyed presenter video via `OffthreadVideo` (`WebcamPipOverlay.tsx`, `StudioCompositor16x9.tsx` presenter is "alpha-keyed video"), so this path is proven idiom here.
- **Option B — PNG sequence + alpha (pixel-perfect, no key spill):** layer 3 = an `<Img src={staticFile('fg/frame-####.png')}>` selected by `useCurrentFrame()` (RVM PNGs already carry alpha if exported RGBA, so a separate alpha track is optional). Use `staticFile` + zero-padded frame index. Heavier on disk (one PNG/frame) but artifact-free and trivial to alpha-composite (browser does it natively for RGBA PNG).
- **Recommended:** prefer **alpha-capable output** — either an alpha-channel `.mov` (ProRes 4444 / VP9-alpha `.webm`, which `OffthreadVideo` can decode) OR the RGBA PNG sequence — to avoid green-spill on hair. Use green-screen only if alpha encoding is inconvenient.

**Alignment requirements (caveats):**
- The foreground matte MUST be frame-locked to the background plate (same fps, same frame count, same start). Generate the matte from the *exact* `speaker.mp4` the composition uses; index PNGs by absolute frame.
- Keep matte resolution == composition resolution (or upscale cleanly) so edges line up.
- Text legibility: with the person occluding part of the line, keep the heavy text-shadow and prefer placing the caption block where the head ISN'T (e.g., to the side / lower third) so only graphics — not critical caption words — get occluded. Depth is best for *decorative* big words / graphics, not the primary readable caption.

## 2.5 SpeakerOverlayScene integration sketch (illustrative — not implemented)

Add a **top foreground-matte layer** and a `behindSpeaker?: boolean` flag on captions/overlays. The current stack (`SpeakerOverlayScene9x16.tsx`): `1 base video → 2 overlays → 3 FloatingCaption → 4 handle chip`. New stack:

```
1. base video (OR a "background plate" copy of the speaker)          [unchanged]
2. overlays where behindSpeaker === true        ← BEHIND the person
3. FloatingCaption when caption.behindSpeaker === true   ← BEHIND the person
─────────────  FOREGROUND MATTE LAYER (NEW)  ─────────────
4. <SpeakerForegroundMatte src={fgMatteSrc} />   ← the cut-out person, occludes 2–3
─────────────────────────────────────────────────────────
5. overlays where behindSpeaker !== true         ← in FRONT (today's default)
6. FloatingCaption when caption.behindSpeaker !== true   ← in FRONT (today's default)
7. handle chip                                                       [unchanged]
```

Schema additions (sketch):
```ts
// SpeakerOverlayScene*Schema
foregroundMatte: z.object({
  src: z.string(),                       // green .mov OR png-sequence dir (relative to public/)
  kind: z.enum(["alpha-mov", "green-mov", "png-sequence"]).default("alpha-mov"),
}).optional(),                           // omitted → no depth, everything in front (fallback)

// floatingCaptionSchema (and each overlay entry)
behindSpeaker: z.boolean().default(false),  // additive, back-compat: default = today's "in front"
```
- `<SpeakerForegroundMatte>` is a new small component: for `alpha-mov`/`green-mov` → `<OffthreadVideo>` (+ chroma key if green); for `png-sequence` → frame-indexed `<Img staticFile(...)>`. Mirrors the existing `OffthreadVideo` usage so it stays in-idiom.
- The scene partitions `overlays` by `behindSpeaker` to mount them on either side of the matte layer; captions check `caption.behindSpeaker`.
- **Back-compat:** no `foregroundMatte` → matte layer not mounted → identical to today (text in front).

## 2.6 The three fidelity tiers (pick per shot)

1. **Fallback (no matting):** text always in front. Today's behavior. Zero new deps. Use when depth isn't needed or footage is unsuitable.
2. **"Good-enough" middle (static depth):** compute ONE person mask from a single representative frame (rembg+BiRefNet or `transparent-background`, no temporal model needed since the mask is frozen), use it as a fixed foreground cut-out. Works only if the speaker barely moves (locked-off shot). Cheap, flicker-free (one mask), but breaks if the person moves out of the frozen silhouette.
3. **Full depth (recommended):** RVM per-frame matte. Handles motion, soft edges, temporal stability. The real effect.

---

## Sources

- RobustVideoMatting — repo, model variants, `torch.hub` load, performance: https://github.com/PeterL1n/RobustVideoMatting
- RVM inference / `convert_video` (`output_type` = video | png_sequence, `output_alpha`, green-screen composite): https://github.com/PeterL1n/RobustVideoMatting/blob/master/documentation/inference.md
- RVM project page (temporal guidance, recurrent design): https://peterl1n.github.io/RobustVideoMatting/
- RVM CLI wrapper (PNG sequence / mov output reference): https://github.com/Sxela/RobustVideoMattingCLI
- rembg (BiRefNet/ISNet/u2net models, `~/.u2net/` cache, offline): https://pypi.org/project/rembg/ , https://github.com/danielgatis/rembg
- MediaPipe Selfie Segmentation / ImageSegmenter (VIDEO mode, MobileNetV3, 100+ FPS CPU): https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/selfie_segmentation.md , https://ai.google.dev/edge/api/mediapipe/python/mp/tasks/vision/ImageSegmenter
- BackgroundMattingV2 (needs background plate): https://github.com/PeterL1n/BackgroundMattingV2
- Caption styles/fonts (TheBoldFont/Montserrat/Anton/Bebas, Hormozi preset, karaoke +15%, ALL-CAPS vs sentence, sound-off): https://blitzcutai.com/blog/best-caption-style-tiktok , https://blitzcutai.com/blog/best-caption-fonts-tiktok , https://www.opus.pro/blog/best-caption-presets-styles-boost-retention , https://sendshort.ai/guides/tiktok-font/
- PyPI verification (this machine): `robust-video-matting`=404; `rvm 0.1`="R in Python" (unrelated); `mediapipe 0.10.35`, `rembg 2.0.75`, `transparent-background 1.3.4`, `onnxruntime 1.26.0` present. torch `2.12.0` MPS available+built on arm64.
