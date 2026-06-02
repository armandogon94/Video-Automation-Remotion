# @AZisk (Alex Ziskind) — OVER-SPEAKER POP-UPS · OBJECT-SEGMENTATION EMPHASIS · TEXT-BEHIND-SPEAKER

> **New reference creator. Dev/tech YouTuber** (Macs, dev hardware, local LLMs, AI clusters). Channel: https://www.youtube.com/@AZisk
>
> **Why he's the reference for a NEW capability axis:** Hormozi (see `references/creators/alexhormozi/OVERLAY-ANALYSIS.md`) is our reference for *typography over your own talking-head*. Ziskind does that too, **plus** something Hormozi does not: he constantly **isolates a specific physical object or on-screen UI element and emphasizes it** — a port on a cabling shot gets a red box, a single VRAM row in a macOS panel gets a highlight rectangle, a code line gets a green/yellow luma bar, his own body occludes a background title word. This file's load-bearing deliverable is **§2: classifying each emphasis moment by the SEGMENTATION TYPE needed to replicate it** (person-matte vs arbitrary-object/SAM2 vs rectangular-region vs chroma/luma), because that tells the build which need a local AI segmentation model and which need only a CSS/FFmpeg box mask.
>
> **Scraped:** 2026-06-01 · 3 videos pulled (480p, video+audio) · all analyzed for the three axes · **all source MP4s deleted one-at-a-time after frame+clip extraction** (see §5). Network-hygiene: strictly one download at a time (3rd of 3 concurrent network agents).

---

## 0. Videos processed

| ID | Title | Dur | Format chassis | Why chosen / verdict |
|---|---|---|---|---|
| `25xVqvL5j4g` | I Ran a Trillion Parameter AI on a Mac… Here's the Secret | 15:44 | Studio talking-head + heavy screen-recording + hardware B-roll | **PRIMARY (dense).** Step-card overlays, luma-highlighted code lines, red box/underline annotations on cabling + code, side-by-side region split of two Activity Monitor windows, bottom-center keyword pops, CTA pops. |
| `CDILhdQgBOM` | BEAST RTX 5090 vs RTX Pro 6000 | 19:48 | Talking-head + store B-roll + full-screen bar charts | **CONTRAST.** Emphasis here is mostly *physical* (foreground GPU bokeh, product lighting) + full-screen benchmark charts + lower-third banners + price-strikethrough callouts. Few digital per-object segmentation effects — good negative example for §2. |
| `nxCtScEImew` | Your Mac Has Hidden VRAM… Here's How to Unlock It | 6:23 | Tutorial talking-head + screen-recording | **RICHEST for all 3 axes.** Bold keyword pops (APPLE SILICON / INSANITY / GIGANTIC), circular PiP face-cam over terminal, custom RAM-split gauge graphic, **VRAM-row highlight rectangle** (region emphasis), **"MEMORY" title occluded by his body (text-behind-speaker)**, confetti overlay, glowing app-icon pop. |

Frame anchors use `videoID@tNNNs` (seconds into source). Coarse contact sheets (1f/12–30s) + key dense frames saved under `references/creators/azisk/frames/`. Reference clips (audio-stripped, 480p, ≤2MB) under `docs/research/wave-6/references/azisk/<id>-NN.mp4`.

---

## 1. Over-speaker pop-up vocabulary

Same format as Hormozi's `OVERLAY-ANALYSIS.md`: **name · anchor/region · what it shows · how it animates (transitionVerb) · replicability.** Names are PascalCase, intended as future component names. These are the *typographic/graphic* pop-ups; the *object-emphasis* effects are §2.

### AZ1 — `BottomCenterKeywordCallout` *(his most frequent over-speaker beat)*
- **Anchor / region:** `nxCtScEImew@0s` ("APPLE SILICON" blue + "LARGE LANGUAGE MODELS" green), `nxCtScEImew@30s` ("INSANITY"), `nxCtScEImew@150s` ("DEFAULT SETTINGS"), `nxCtScEImew@360s` ("GIGANTIC MODELS" red, "75%" red), `25xVqvL5j4g@30s` ("QUERY IT"), `25xVqvL5j4g@45s` ("$50,000"). Region: **bottom-center** (occasionally mid-right for one-word shouts).
- **What:** 1–3 words in heavy ALL-CAPS, color-coded by sentiment (blue = neutral topic, green = positive, red = warning/big number, white/silver = neutral emphasis), thick black or white stroke + drop-shadow. Larger than the caption track, positioned as a graphic. Unlike Hormozi's yellow-glow corner word, Ziskind's sits **bottom-center, dead in the lower-third lane** and rotates color by meaning.
- **transitionVerb:** `Scale-pop 0.8→1.0 over 4–5 frames with a small overshoot; no glow (he relies on stroke+shadow, not halo); hold ~20–30 frames; cut out.`
- **Replicability:** TRIVIAL. CSS text + stroke (`-webkit-text-stroke`) + shadow over base `<Video>`. Reuse Hormozi `<YellowGlowWordCallout>` with a `color`/`stroke` variant and a `bottom-center` anchor.

### AZ2 — `NumberedStepCard` *(tutorial spine — appears across the whole how-to)*
- **Anchor / region:** `25xVqvL5j4g@690s` ("7) Run the distributed tokens/sec benchmark"), `@840s` (same), `@900s` ("8) Run the OpenAI-compatible server"), earlier "2) Create the conda env and install MLX", "4) Create a JACCL hostfile". Region: **full-width top band over a white/screen-recording base**, OR top-left over the talking-head.
- **What:** a numbered section heading (`N) Title`) with a **yellow highlighter swipe behind the text**, sitting above the relevant terminal block. Functions as a chapter marker for a multi-step build. Often the base under it is a screen-recording, not his face.
- **transitionVerb:** `Wipe the yellow highlighter bar left→right behind the heading over 8 frames (clip-path inset); fade the heading text in alongside; hold for the whole step; cut.`
- **Replicability:** EASY. Heading + animated `clip-path` highlighter rect. Pairs with §2 luma code-line highlights.

### AZ3 — `LowerThirdBanner`
- **Anchor / region:** `CDILhdQgBOM@~1050s` ("TOPPED OUT AT 683 WATTS"), "WORKSTATION EDITION", "Single Stream Profile", `25xVqvL5j4g` "MEMORY USAGE: 200GB". Region: **lower-third strip**.
- **What:** a single bold caps line (sometimes with a small colored accent block/icon) pinned lower-third, stating a result/spec while he keeps talking. More banner-like than AZ1's punchy keyword.
- **transitionVerb:** `Slide up from the bottom edge 16px + fade over 8 frames; hold; slide back down.`
- **Replicability:** TRIVIAL. Lower-third text strip molecule.

### AZ4 — `CircularPipFaceCam` *(over-speaker in reverse — speaker pops over the screen-recording)*
- **Anchor / region:** `nxCtScEImew@70s` & `@156s`-region (small **circular** face-cam top-right over an Activity Monitor recording), `25xVqvL5j4g@~210s` (circular face over terminal). Region: **top-right or bottom-left corner** of a full-screen screen-recording.
- **What:** when the base layer switches to a screen-recording, his talking-head shrinks into a **circular masked PiP bubble** in a corner so he stays present. This is the inverse of AZ1 (graphic over face) — here the face is the pop-up over the screen content.
- **transitionVerb:** `Scale the circular bubble in 0→1.0 over 6 frames from the corner; soft drop-shadow ring; hold for the screen-rec segment; scale out.`
- **Replicability:** EASY *if the source is already a circular crop* (he likely records face-cam separately and circle-masks it — a static `border-radius:50%` + `object-fit:cover`). **Note:** this is a person-matte-adjacent effect but does NOT need AI — a circular crop of a clean studio face-cam is just CSS. See §2 cross-ref.

### AZ5 — `CustomMetricGauge` (animated diagram graphic)
- **Anchor / region:** `nxCtScEImew@~70s` (horizontal RAM bar split blue/red, "8GB | 16GB", legend "LM STUDIO / OTHER TASKS"), `nxCtScEImew@~310s` (green "MEMORY PRESSURE" gauge). Region: **lower-left or mid-frame over the talking-head**.
- **What:** a bespoke motion-graphic gauge/bar that visualizes a metric (memory split, pressure) — not a screenshot, a built graphic that animates a fill. Color-coded segments + small legend dots.
- **transitionVerb:** `Draw the bar track in, then animate the colored fill widths to target over 12–15 frames with ease-out; pop the legend dots in 3 frames apart.`
- **Replicability:** MEDIUM. Custom React gauge component with animated fill props. Maps to a future `<MetricBar segments legend>`.

### AZ6 — `PriceStrikethroughCallout`
- **Anchor / region:** `CDILhdQgBOM@~90s` over a product-listing screenshot ("$649.00 ~~$609.40~~" red strike + green new price). Region: **over a browser/listing screen-recording**, near the price.
- **What:** a price-comparison pop — old price struck through, new/deal price highlighted in green/red — composited onto a store-page screenshot.
- **transitionVerb:** `Pop the strikethrough line across the old price (scaleX 0→1, 5 frames); fade/scale the new price chip in beside it with a small bounce.`
- **Replicability:** EASY. Text + animated strike line + colored chip.

### AZ7 — `CtaPromoPop` (sponsor / course CTA)
- **Anchor / region:** `25xVqvL5j4g@~270s` ("365-Day Access", "LINK DOWN BELOW (CODE - ALEX26) $100 OFF"). Region: **bottom-center / lower-third**, often over a course-platform screen-recording.
- **What:** promo/discount-code callouts — bold offer text + code, sometimes a "LINK BELOW" arrow. Functionally Hormozi's OV1 CTA cousin.
- **transitionVerb:** `Scale-pop the offer text; slide the code chip up under it 4 frames later; optional bobbing down-arrow.`
- **Replicability:** TRIVIAL. Reuse AZ1 + a code chip + arrow.

### AZ8 — `OpenerTitleHero` / `SectionTitleCard`
- **Anchor / region:** `CDILhdQgBOM@~600s` ("COMING UP…"), cold-open hero title over a darkened set / B-roll. Region: **full-frame or centered over dimmed base**.
- **What:** kinetic section/opener title over a dimmed or B-roll base (Hormozi OV12 analogue).
- **transitionVerb:** `Push title up with blur-to-sharp over 12 frames; dim base to ~40%; lift base back as title clears.`
- **Replicability:** EASY–MEDIUM. Reuse Hormozi `<OpenerTitleOverDimmedSet>`.

### AZ9 — `ConfettiCelebrationOverlay`
- **Anchor / region:** `nxCtScEImew@~330s` (confetti particles raining over his face on a "success" beat). Region: **full-frame particle layer over the talking-head**.
- **What:** a transparent full-frame confetti/particle burst composited over the live face on a payoff moment.
- **transitionVerb:** `Emit particles from top edge over ~30 frames with gravity + fade-out tails; one-shot.`
- **Replicability:** EASY. Particle component (or a transparent confetti video) over base. No segmentation — it's *in front of* him.

### AZ10 — `GlowingAppIconPop`
- **Anchor / region:** `nxCtScEImew@~300s` (purple sparkle app icon scale-pops mid-frame). Region: beside head / mid-frame.
- **What:** a single app icon/logo scale-popped when he names a tool. Hormozi OV10/OV11 analogue.
- **transitionVerb:** `Scale-pop 0→1.0 over 6 frames + overshoot; optional glow pulse; hold; pop out.`
- **Replicability:** TRIVIAL. `<img>`/SVG scale-pop, reuse `<IconPopOverSpeaker>`.

---

## 2. OBJECT-SEGMENTATION EMPHASIS — patterns WITH segmentation-type classification *(the key deliverable)*

Each entry: **what's segmented · the effect · SEGMENTATION TYPE (the load-bearing classification) · replication path.** The four types:
- **`rectangular/region`** — a screen region / app window / UI element bounded by a box → simple crop/box mask, **NO AI**.
- **`chroma/luma`** — emphasis keyed off color/brightness (e.g. highlight a code line by its background) → FFmpeg/CSS, **NO AI**.
- **`person-matte`** — just the speaker's body silhouette → RVM / MediaPipe Selfie-Segmentation, **lightweight on-device AI**.
- **`arbitrary-object`** — a specific physical object he points at (a chip, a cable, a laptop) that is NOT a person and NOT a clean rectangle → needs **SAM2 / Segment-Anything click-to-segment**, the only one requiring a heavy local AI segmentation model.

| # | Pattern | Anchor | What's segmented | Effect applied | **SEGMENTATION TYPE** | Replication path |
|---|---|---|---|---|---|---|
| **OE1** | `RedBoxPortAnnotation` | `25xVqvL5j4g@900s` (cabling shot; red "1" box around a specific Thunderbolt port on the Mac Studio back) | A specific **port / connector** on a physical hardware close-up | Hand-drawn-style **red rectangle/outline + number label**, rest untouched | **rectangular/region** (he frames it as a box, not a pixel-tight cutout) — **NO AI**. *If he wanted a tight glow around the irregular cable it would escalate to `arbitrary-object`/SAM2, but he keeps it a box.* | Animated stroke-rect (`clip-path`/SVG `<rect>`) at fixed coords over the B-roll. The cheapest possible "emphasis." |
| **OE2** | `CodeLineLumaHighlight` | `25xVqvL5j4g@840s` (green bar behind `--env MLX_METAL_FAST_SYNCH=1`); `@900s` (red underline+box on `MODEL_DIR=… run_openai_cluster_server.sh`); `25xVqvL5j4g` sheet-B green/yellow bars on terminal lines | A **single line/token of code** inside a terminal screen-recording | Colored highlighter bar **behind** the line (green=do-this, yellow=note) or red underline+box | **chroma/luma** + **rectangular/region** — **NO AI**. The line's y-position is a known text row → a fixed rect. | Overlay an animated `clip-path` rect at the line's bbox. Pairs with AZ2 step cards. |
| **OE3** | `VramRowHighlight` | `nxCtScEImew@300s` (box drawn around the "VRAM 8.00 GB" / "14.00 GB" row in macOS Memory Capacity panel); `nxCtScEImew@90s` (purple highlight on the "11.28 GB" download pill) | A **single row / UI element** inside an app window screenshot | **Rectangle outline / highlight fill** around the target value, surrounding UI left as-is | **rectangular/region** — **NO AI**. UI elements are axis-aligned rectangles at known coords. | Stroke/fill `<rect>` over the screen-recording at the element bbox. |
| **OE4** | `SideBySideRegionSplit` | `25xVqvL5j4g@690s` (two Activity Monitor memory windows side-by-side with a vertical divider; "Memory Used 266 GB" vs "260 GB") | Two **app-window regions** placed in a split-screen for comparison | Each window cropped to its half + **vertical divider line**; sometimes one half dims | **rectangular/region** — **NO AI**. Pure crop + layout. | Two cropped `<Video>`/`<img>` halves + divider. A layout, not a segmentation. |
| **OE5** | `CircularSpeakerMatteBubble` | `nxCtScEImew@156s` & `@70s` (circular face-cam over screen-rec); `25xVqvL5j4g@210s` | **Just the speaker** (head/shoulders) shrunk into a corner bubble | Circular crop + drop-shadow ring | **person-matte — BUT effectively avoided.** He uses a **circular CROP** of a clean studio face-cam (uniform-ish background), not a true silhouette knockout, so in practice this is **rectangular/region (circle mask), NO AI needed**. A *true* background-removed PiP (no visible set behind him) WOULD need a **person-matte (RVM/MediaPipe)**. He chose the cheap path. | Circle-crop CSS PiP for the cheap version; RVM/MediaPipe only if you want the set removed. |
| **OE6** | `TextBehindSpeaker` | `nxCtScEImew@156s` ("MEMORY" title behind his torso/arm) — see §3 | **The speaker's body silhouette** (so a background word is occluded by it) | Background title rendered, then the speaker comp'd back IN FRONT of it | **person-matte** — needs **RVM / MediaPipe Selfie-Segmentation** (lightweight on-device AI). This is the ONE place AZ genuinely needs a person matte. | RVM/MediaPipe alpha → layer order: [base set] → [title] → [matted speaker]. See §3 + §4. |
| **OE7** | `PhysicalForegroundBokehEmphasis` | `CDILhdQgBOM@600s` (GPU coolers in soft-focus foreground framing the talking-head); GPU-on-desk product shots on dark bg | A **physical object** (GPU) emphasized by lens/lighting, not by software | Shallow-DoF foreground + product lighting/dark backdrop | **NONE — done in-camera.** Not a segmentation effect at all; achieved physically. Listed to mark the boundary: much of his "object emphasis" is *cinematography*, not compositing. | Not replicable in post for our pipeline (we have no physical rig). If we must fake it: SAM2-cut the object + blur-the-rest → `arbitrary-object`. |
| **OE8** | `ProductGlowPop` *(rare/borderline)* | `CDILhdQgBOM` GPU intro frames on dark bg with rim-light "glow" | A **GPU / device** isolated against dark | Apparent glow/aura — but it's **rim-lighting**, not a software aura | **NONE in-camera** today; *to replicate digitally* on arbitrary footage → **arbitrary-object (SAM2)** mask + outer-glow. | SAM2 click-to-segment → feather → outer glow/drop-shadow, recolor-rest-to-grayscale optional. |

**The headline finding for the build:** of 8 object-emphasis patterns, **6 need NO AI** (rectangular/region or chroma/luma boxes over screen-recordings/B-roll, or in-camera cinematography), **1 needs a person-matte** (OE6 text-behind-speaker — RVM/MediaPipe), and **0 that he actually ships today require SAM2.** SAM2/arbitrary-object is only needed if WE want to *digitally* reproduce his *in-camera* object glow (OE7/OE8) on footage that wasn't shot with a rig — i.e., it's an *upgrade path*, not a parity requirement. Ziskind's real secret is that he keeps almost all emphasis as **cheap boxes on screen-recordings**.

---

## 3. Text-behind-speaker instances + fonts

### Instances found
- **Confirmed, clear:** `nxCtScEImew@~156s` — the word **"MEMORY"** in large gray/silver bold caps is positioned mid-frame; as he gestures, his **torso and right arm pass in front of the word**, occluding the letters where they overlap, while the word still reads over the laptop/desk behind him. Unmistakable depth effect (background word, foreground speaker). Captured in `frames/nxCtScEImew_dense.jpg` (top panel) and clip `nxCtScEImew-01.mp4`.
- **Frequency:** **occasional, not constant.** In `nxCtScEImew` (6:23) it appears as a deliberate "hero word" device a small number of times; most keyword pops (AZ1) sit *in front* of him in the lower-third (no occlusion). In `25xVqvL5j4g` and `CDILhdQgBOM` I did not find a clear behind-speaker instance — those lean on bottom-center/lower-third (in-front) text and screen-recordings. So text-behind-speaker is a **signature accent he uses selectively for emphasis**, ~once per few minutes in his caption-heavy tutorials, not a constant layer.
- **How it looks:** large (≈18–28% of frame height) bold ALL-CAPS word, muted/desaturated color (gray/silver) so it reads as "set dressing behind him" rather than a shouty front caption; he then physically moves through its plane. The matte edge on his arm looks clean (studio lighting + likely RVM/MediaPipe), no obvious green-screen.
- **Corroboration:** this directly corroborates the parallel matting workstream — at least one real, repeatable creator ships **person-matte text-behind-speaker** on ordinary studio footage (no green screen visible). It is worth a person-matte capability. **Note:** `docs/research/wave-9/` exists but is currently **EMPTY** in this worktree — no matting research doc to cross-reference yet. When that workstream lands, OE6/§3 here is the consumer-side evidence that the capability is used.

### Fonts (captions / titles)
- **Keyword pops (AZ1) & lower-third banners (AZ3):** a **heavy geometric/grotesque sans in ALL-CAPS** — condensed-ish, very bold, with a thick stroke. Reads like **Montserrat ExtraBold/Black** or a similar geometric (Poppins/Gotham family) in all-caps with `-webkit-text-stroke`. Not a system font; clearly a chosen display face. Color-coded (blue/green/red/silver) rather than Hormozi's single yellow.
- **Step cards (AZ2) & body callouts:** a cleaner **humanist sans, sentence-case or title-case**, looks like **Inter / Helvetica Neue / SF Pro** — used for the "N) Run the …" headings and explanatory text over screen-recordings.
- **Code / terminal:** native macOS terminal monospace (**SF Mono / Menlo**) — it's real screen-recording, not styled by him.
- **Distinction from Hormozi:** Hormozi = one accent color (yellow) + glow halo; Ziskind = **multi-color sentiment coding + stroke/shadow (no halo)**, bottom-center anchored, plus the occasional behind-speaker hero word. Our brand (Inter, navy `#1B3A6E` / gold `#D4AF37`) maps more naturally onto Ziskind's multi-weight clean-sans approach than onto Hormozi's single-yellow.

---

## 4. What we should build to replicate (segmentation routing)

Routing each requested capability to the cheapest sufficient tech. **Priority = ship the NO-AI patterns first; person-matte second; SAM2 is an optional upgrade.**

### Tier 0 — NO AI (CSS / FFmpeg boxes over screen-recordings & B-roll) — build first
These cover ~6 of 8 object-emphasis patterns and ALL of §1.
- **`<RegionEmphasisBox>`** — animated stroke/fill rect at fixed `{x,y,w,h}` over a base layer, with `color`, `style: 'box'|'underline'|'highlight-fill'`, `enter: 'draw'|'pop'`. Covers **OE1 (red port box), OE2 (code-line highlight), OE3 (VRAM-row box / pill highlight)**. *Single component, three patterns.* Highest leverage.
- **`<SideBySideRegions>`** — two cropped media halves + divider + optional dim-one-side. Covers **OE4**.
- **`<NumberedStepCard>`** (AZ2) — heading + animated highlighter swipe. Pairs with `<RegionEmphasisBox>` for tutorials.
- **AZ1/AZ3/AZ6/AZ7/AZ9/AZ10** — keyword pops, banners, price strikes, CTA, confetti, icon pops: all reuse Hormozi over-speaker molecules with a `color`/`anchor='bottom-center'` variant. No new tech.
- **`<CircularPipFaceCam>`** (AZ4 / OE5 cheap path) — `border-radius:50%` crop of a clean face-cam over a screen-recording. No AI.

### Tier 1 — PERSON-MATTE (lightweight on-device AI: RVM or MediaPipe Selfie-Segmentation) — build second
- **`<TextBehindSpeaker>`** (OE6 / §3) — the ONE pattern that genuinely needs a person matte on Ziskind-style studio footage. Pipeline: run **Robust Video Matting (RVM)** or **MediaPipe Selfie-Segmentation** on the talking-head clip → produce an alpha matte → composite layer order `[set base] → [background title text] → [matted speaker on top]`. RVM is the better pick on Apple Silicon (CoreML/ONNX, real-time, no green screen, handles hair/arm edges). This is also what unlocks **true background-removed PiP** (the "expensive" OE5 path) and any future "speaker walks in front of a chart" beat.
  - **Local/M-series fit:** RVM runs on-device, no cloud, aligns with the project's local-only constraint. Decode source → per-frame alpha (PNG sequence or matted ProRes 4444) → feed as a Remotion `<Video>`/image-sequence layer with alpha.

### Tier 2 — SAM2 / arbitrary-object (heavy local AI) — OPTIONAL upgrade, NOT parity
- Only needed to **digitally** reproduce Ziskind's *in-camera* object emphasis (OE7/OE8 — glow/aura/desaturate-rest around an irregular physical object he points at) on footage we did NOT shoot with a rig. Pipeline: **SAM2 click-to-segment** the object → feather mask → apply outer-glow / spotlight / desaturate-the-rest / scale-pop.
- **Verdict:** defer. Ziskind himself achieves object emphasis with (a) a red BOX (Tier 0) or (b) cinematography (a rig we don't have). We only reach for SAM2 if Armando wants a Hormozi/Ziskind-grade object spotlight on arbitrary B-roll without a physical setup. Heaviest dependency; lowest near-term ROI.

### Build-order recommendation
1. `<RegionEmphasisBox>` (3 patterns, zero AI) → 2. AZ1/AZ2/AZ3 typography pops (reuse Hormozi chassis) → 3. `<SideBySideRegions>` + `<CircularPipFaceCam>` → 4. **RVM person-matte → `<TextBehindSpeaker>`** (the matting workstream's first consumer) → 5. *(optional, later)* SAM2 `<ObjectSpotlight>`.

### Cross-reference
- **Hormozi over-speaker overlays:** `references/creators/alexhormozi/OVERLAY-ANALYSIS.md` — AZ1/AZ3/AZ7/AZ8/AZ10 are Ziskind variants of OV1/OV3/OV8/OV12/OV10/OV11; reuse the same `SpeakerOverlayScene` chassis with `anchor` + `color` props.
- **Matting research:** `docs/research/wave-9/` is **empty in this worktree as of 2026-06-01** — no doc to cite yet. §2 (OE6) and §3 here are the *demand-side* evidence that a person-matte capability (RVM/MediaPipe) is warranted; SAM2 is explicitly classified as a non-parity upgrade.

---

## 5. Sources & disk hygiene

- **Channel:** https://www.youtube.com/@AZisk · **Scraped:** 2026-06-01 · `yt-dlp` (`-f "bestvideo[height<=480]+bestaudio"`, mp4 merge), `ffmpeg` (frames + clips).
- **Videos analyzed:** `25xVqvL5j4g` (primary/dense), `CDILhdQgBOM` (contrast), `nxCtScEImew` (richest for all 3 axes).
- **Network hygiene:** 3rd of 3 concurrent agents — **strictly one download at a time**, sequential: download → extract frames + clips → **DELETE source MP4 before next download**. No source MP4 ever co-resident with another.
- **Source MP4s:** held in `/tmp/wave9-azisk/`, each deleted immediately after its frame+clip extraction; scratch dir `rm -rf`'d at task end.
- **Frames:** `references/creators/azisk/frames/` — `<id>_sheet*.jpg` (coarse 1f/12–30s contact sheets) + `<id>_dense.jpg` (key dense frames).
- **Reference clips (audio-stripped, 480p, ≤2MB each):** `docs/research/wave-6/references/azisk/<id>-{01,02}.mp4` (6 clips, all <130KB).
- **Image-read budget:** primary video used 3 reads (2 contact sheets + 1 dense, justified — it's the dense-analysis target); the other 2 videos used exactly 2 reads each (1 sheet + 1 dense). All single-path sequential reads, no bundled multi-image reads.
