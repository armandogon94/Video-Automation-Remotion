# TELLA — Product Research (Wave 9)

> Deep-dive on **Tella** (tella.tv / tella.com): the screen-and-camera recorder whose
> signature is **click-to-switch layouts on a timeline**. Goal: understand the
> "layouts / scenes" editing paradigm well enough to replicate it in our pipeline,
> and spec how it maps onto our existing `SpeakerOverlayScene` foundation.
>
> Researched 2026-06-01. Sources: tella.com feature/help pages + Tella's official
> YouTube channel (`@tellahq`) — transcripts of *Layouts V2*, *Custom Layouts*, and
> *Squircles (12 Days of Tella – Day 2)*, plus two analyzed UI frames from *Layouts V2*.

---

## §1 — Product overview + who / why

**What it is.** Tella is an all-in-one browser-based (plus a Mac app) **screen + camera
recorder and editor**. Its core trick: it captures the **screen stream and the camera
stream separately** rather than baking them into one frame. Because the two streams stay
independent, **the entire layout is editable *after* recording** — you decide where the
camera sits, how big it is, and when it appears, in post.

**The core promise — "record like a doc, edit without a timeline-scrubbing NLE."**
You hit record, talk through your screen, and then *arrange* the result by clicking
between layout presets rather than keyframing tracks in a Premiere/DaVinci-style editor.
The mental model Tella pushes is **"dynamic scene changes like movie editing"** — you
change what's on screen at chosen moments, and Tella tweens between them automatically.

**Who it's for.**
- Founders / solopreneurs recording product demos, async updates, and sales videos.
- Course creators & educators (the *Layouts V2* demo is literally someone recording a course).
- Designers / PMs doing walkthroughs (Tella has a dedicated "for designers" solution page).
- Loom-style async video, but with far more polish and a built-in import-from-Loom migration tool.

**Why people pick it.** Minimal editing skill required; the camera/screen relationship is
a *preset you click*, not a composition you build. Separate streams mean you can totally
re-stage a recording afterward. AI "Auto Layouts" can even author the whole layout track
for you.

**Pricing (brief, as of mid-2026).**
| Plan | Price | Notable |
|------|-------|---------|
| Free trial | 7 days, full Pro access | — |
| **Pro** | $19/mo (or $12/mo annual) | 4K@60fps export ≤5 min/export, no video/storage/bandwidth caps, 6 h max clip |
| **Premium** | $49/mo (or $39/mo annual) | + custom branding, custom domain, analytics, unlimited export length |
| **Team** | contact sales | collaboration |

Editing toolset beyond layouts: trim/split, custom backgrounds, AI filler-word removal,
transitions, zoom/punch-in, captions/subtitles, background music, blur sensitive info,
chapters, GIF export, MP4 export, shareable links + embeds.

---

## §2 — THE LAYOUT SYSTEM (in detail)

This is the heart of Tella and the thing we want to replicate.

### 2.1 What a "layout" is

A **layout** = an arrangement of the (up to) two video layers — **screen** and **camera** —
on the canvas: each layer's position, size, z-order, plus a camera **border shape**.
Tella ships **30+ layout presets**. A video has a **base layout** (the whole-duration
default) and any number of **timed layout segments** that temporarily override it.

### 2.2 Enumerated layout / scene types

Confirmed from feature pages, help docs, and the *Layouts V2* / *Custom Layouts* transcripts:

**Single-layer layouts**
- **Camera only (Talking Head)** — full-frame camera, no screen. Used for intros / "to-camera" moments.
- **Screen only** — full-frame screen, camera hidden. Used when the screen is all that matters.

**Camera-bubble-over-screen (picture-in-picture)** — screen fills the canvas; camera is a small floating bubble.
- Camera **position**: a **3×3 / nine-point grid** — 4 corners, 4 edge-midpoints, center.
  (Corners are the common case: top-left, top-right, bottom-left, bottom-right.)
- Camera **size**: presets **Small / Medium / Large**, plus **freeform resize via corner handles**.
- The analyzed *Layouts V2* frame shows a **round camera bubble pinned top-left over a near-full screen** — the canonical PiP.

**Split / side-by-side (both layers, comparably sized)**
- **Side-by-side 50/50** — frame split evenly. Horizontal split in landscape, **vertical split in portrait**.
- **Screen-dominant split** — screen takes most of the frame, camera a smaller fixed panel beside it.
- **TV Presenter** — camera is prominent (often a large left/right block) with the screen "floating" alongside; "Full" variants fill the canvas with the camera and float the screen *on top* of it.

**Stylized / custom**
- **Camera-backdrop** — camera blown up full-canvas as a *background*, screen shrunk into the foreground (built in the *Custom Layouts* demo).
- **Phone-camera left / right** — tall phone-shaped camera framed on one side (a saved custom layout in the demo).
- **Custom layouts** — users freely move/resize either layer and **Save** the arrangement as a named reusable preset; can **Update**, **rename**, **delete**, **reorder**, and reuse across all videos. Custom layouts **preserve their screen↔camera relationship across aspect-ratio crops** (4:3, 16:9, square 1:1, 9:16 portrait, 9:6).

**Canvas / aspect ratios** (orthogonal to layout): landscape 16:9, portrait 9:16, square 1:1, 4:3, 9:6.

### 2.3 Camera shape (border)

A per-clip **border style** applied to the camera (and a *subtle* version to the screen):
- **Sharp** (square corners)
- **Rounded** (rounded-rect corners)
- **Squircle** (square-meets-circle superellipse — shipped as "12 Days of Tella – Day 2")

The border shape is consistent across every layout in the clip, so switching layouts keeps
the camera's look stable. Screens get only a *subtle* rounding so icons/buttons aren't clipped.

### 2.4 How users switch layouts (the editing model)

This is the paradigm to copy. From the *Layouts V2* transcript, verbatim mechanics:

1. **Set a base layout** for the full duration (the "if there were only one layout" look).
2. **Add a timed layout** by **clicking + dragging directly on the timeline** — a hover state
   reads "drag to add". The drag defines a **segment** with a start and a length.
3. **Reassign** a segment's layout: select the segment block on the timeline, pick a different preset.
4. **Resize / move** a segment: drag its **handles** to change duration, or drag the whole block to reposition.
5. **Stack layouts**: place segments adjacent so the video transitions *segment → segment*
   (instead of returning to base between them) — chain many for elaborate sequences.
   A **connecting handle** between stacked segments sets where one transitions into the next;
   pull two apart to disconnect (then each returns to base).
6. **Edit the base layout** later by clicking the *gaps* between segments (they highlight purple)
   and choosing a new base — changes everything except the explicit segments.
7. **Power-user shortcuts**: `⌘/Ctrl + Add layout` = **"add until end"** (fills to next segment or video end);
   hold **Shift** to seek + drag a new segment from the playhead; **⌘C / ⌘V** to copy-paste a segment
   (same layout + same duration) elsewhere.
8. **Apply to all clips** — copy one clip's layout onto every clip, with per-clip overrides.

UI confirmed from frames: a toolbar with **Add layout / Delete layout / Adjust layout**,
a **waveform timeline** under the canvas, and **purple segment blocks** with drag handles
sitting on the timeline (one frame shows the segment widget selected mid-timeline).

### 2.5 Transitions between layouts

- Every new layout segment gets a **smooth transition by default** — the camera/screen layers
  **animate (move + resize) from the previous layout to the next**. This is the signature
  "bubble glides and grows/shrinks" feel.
- Per-segment **"Adjust" → transition type**: **Smooth** (animated tween) or **Hard cut** (instant).
- The **transition handle / connecting handle** lets you drag *where* the transition occurs.
- (No explicit slide/wipe/fade variants are exposed for layout changes — the two documented
  options are **smooth (resize-tween)** and **hard cut**.)

### 2.6 AI Auto Layouts

- Uses **Google Gemini** to analyze speech, tone, gestures, and on-screen cursor activity, then
  **authors the layout segment track automatically** — switching **camera-focused** when you're
  animated/explaining and **screen-focused** during demos.
- Also generates intros, **cutaways**, **punch-ins (zoom into a region)**, split-screen, and
  AI image **B-roll**.
- Output is **the same editable segment track** described in §2.4 — you can adjust/regenerate.
  Data isn't used for training; tokenized video is deleted after analysis.

---

## §3 — SPEC: replicating Tella in our pipeline

### 3.1 The model: a video is a **timeline of scenes**

We already model an edit as a **track-based, frame-native `EditPlan`** (`src/autoedit/editPlan.ts`,
ADR-003): kept `segments`, an `overlayTrack`, and a `captionTrack` layered over a base video, all
carrying both seconds and frames. **Tella's "layouts" map cleanly onto a new track on that same
model** — a **`layoutTrack`** (a.k.a. scene track) parallel to `overlayTrack`/`captionTrack`.

Define:

- **`baseLayout`** — the whole-duration default layout preset (Tella's "base layout").
- **`layoutTrack`** — an ordered list of **layout segments**, each overriding the base for a frame range.
- Each **segment** = `{ layout preset | inline regions, transitionIn }`.

### 3.2 Layout presets

Closed vocabulary of named presets (mirrors §2.2). Each preset resolves to concrete
**regions** in normalized `[0..1]` canvas coordinates so it survives any aspect ratio:

```ts
// regions are {x,y,w,h} in 0..1 of the canvas; z is paint order (higher = on top)
type Region = { x: number; y: number; w: number; h: number; z: number };

const LAYOUT_PRESETS = {
  cameraOnly:        { camera: {x:0,   y:0,   w:1,    h:1,    z:1} },                                  // talking head
  screenOnly:        { screen: {x:0,   y:0,   w:1,    h:1,    z:0} },
  bubbleBottomRight: { screen: {x:0,y:0,w:1,h:1,z:0}, camera:{x:0.74,y:0.70,w:0.22,h:0.30,z:1} },
  bubbleBottomLeft:  { screen: {x:0,y:0,w:1,h:1,z:0}, camera:{x:0.04,y:0.70,w:0.22,h:0.30,z:1} },
  bubbleTopRight:    { screen: {x:0,y:0,w:1,h:1,z:0}, camera:{x:0.74,y:0.04,w:0.22,h:0.30,z:1} },
  bubbleTopLeft:     { screen: {x:0,y:0,w:1,h:1,z:0}, camera:{x:0.04,y:0.04,w:0.22,h:0.30,z:1} },      // matches analyzed frame
  sideBySide5050:    { screen: {x:0.5,y:0,w:0.5,h:1,z:0}, camera:{x:0,y:0,w:0.5,h:1,z:1} },            // vertical split in portrait
  screenDominant:    { screen: {x:0,y:0,w:0.72,h:1,z:0}, camera:{x:0.72,y:0,w:0.28,h:1,z:1} },
  tvPresenter:       { camera: {x:0,y:0,w:0.55,h:1,z:0}, screen:{x:0.42,y:0.12,w:0.56,h:0.7,z:1} },    // screen floats over big camera
  cameraBackdrop:    { camera: {x:0,y:0,w:1,h:1,z:0}, screen:{x:0.18,y:0.18,w:0.64,h:0.64,z:1} },      // camera as background
} as const;
```

Bubble `size` presets (Small/Medium/Large) scale the camera region; the **3×3 position grid**
selects which corner/edge/center anchor a bubble snaps to. A **custom layout** is just a
user-saved `{camera?, screen?}` region pair stored by name and reused.

### 3.3 Scene-timeline JSON shape

```jsonc
{
  "fps": 30,
  "canvas": { "aspect": "16:9", "width": 1920, "height": 1080 },
  "baseLayout": { "preset": "bubbleBottomRight" },
  "camera": {
    "shape": "squircle",            // sharp | rounded | squircle
    "borderRadius": 0.18,           // used when shape = rounded
    "source": "camera.mp4"          // separate camera stream (Tella keeps streams independent)
  },
  "screen": { "source": "screen.mp4" },
  "layoutTrack": [
    {
      "id": "seg-1",
      "startFrame": 0,   "endFrame": 90,           // edit-time frames (frame-native, like EditPlan)
      "layout": { "preset": "cameraOnly" },
      "transitionIn": { "type": "cut" }            // intro: hard cut to face
    },
    {
      "id": "seg-2",
      "startFrame": 90,  "endFrame": 450,
      "layout": { "preset": "screenDominant" },
      "transitionIn": { "type": "smooth", "durationFrames": 12 }   // camera glides+resizes in
    },
    {
      "id": "seg-3",
      "startFrame": 450, "endFrame": 540,
      "layout": {                                  // inline custom layout (no named preset)
        "camera": { "x": 0, "y": 0, "w": 1, "h": 1, "z": 0 },
        "screen": { "x": 0.2, "y": 0.2, "w": 0.6, "h": 0.6, "z": 1 }
      },
      "transitionIn": { "type": "smooth", "durationFrames": 10 }
    }
    // gaps between segments fall back to baseLayout (Tella semantics)
  ]
}
```

Per-segment scene schema (Tella → our fields):

| Tella concept | Our field |
|---------------|-----------|
| layout preset / custom arrangement | `layout.preset` **or** inline `layout.{camera,screen}` regions |
| camera region (corner, size, freeform) | `camera` `{x,y,w,h}` (0..1) + `z` paint order |
| screen region | `screen` `{x,y,w,h}` (0..1) + `z` |
| camera border (sharp/rounded/squircle) | top-level `camera.shape` (per-clip, consistent across segments) |
| smooth transition (animate move+resize) | `transitionIn.type = "smooth"` + `durationFrames` |
| hard cut | `transitionIn.type = "cut"` |
| (future slide variant) | `transitionIn.type = "slide"` (extension; Tella exposes only smooth/cut) |
| base layout for whole duration | top-level `baseLayout` |
| gap → return to base | implicit: any uncovered frame range renders `baseLayout` |
| stacked segments | adjacent segments transition into each other, not back to base |

**Transition semantics** (the signature behavior): a `smooth` transition over
`durationFrames` **interpolates each layer's `{x,y,w,h}`** from the outgoing layout's region
to the incoming layout's region with an ease curve (e.g. `Easing.inOut(cubic)`). That single
rule — *tween the regions* — reproduces "the bubble glides to the corner and shrinks," the
side-by-side collapse, etc. `cut` swaps instantly at `startFrame`.

### 3.4 Mapping onto our `SpeakerOverlayScene` foundation — what we extend

`SpeakerOverlayScene{16x9,9x16}` today owns a **layer stack** (base video → overlay slot →
caption → handle) and consumes a data-driven array via `OVERLAY_REGISTRY`. To get Tella's
layout-switching we extend, **not replace**, that foundation:

1. **Two source layers instead of one.** Today there's a single full-bleed `OffthreadVideo`
   (`videoSrc`). Add a second video layer so we hold **`screenSrc` + `cameraSrc`** as
   independent `OffthreadVideo`s — the prerequisite for re-layout-able compositing (Tella's
   "separate streams" insight). For our current single-stream talking-head footage, the
   camera layer can be the base video and the screen layer optional.

2. **A `<LayoutTrack>` layer below the overlay slot.** New component that, for the current
   frame, finds the active segment, computes each layer's `{x,y,w,h}` (interpolating during a
   `transitionIn` window via `interpolate` + `Easing`), and positions the two `OffthreadVideo`s
   accordingly. Camera layer gets `borderRadius`/squircle clip from `camera.shape`. Falls back
   to `baseLayout` on gaps. This slots in as a new layer *beneath* the existing overlay slot,
   so big-number pops / B-roll / captions still composite on top unchanged.

3. **Extend the schema** with `screenSrc?`, `cameraSrc?`, `camera` (shape/source), `baseLayout`,
   and `layoutTrack` — all `.default()`ed so the comp still renders standalone in Studio.

4. **Extend `EditPlan`** (`src/autoedit/editPlan.ts`) with a `layoutTrack` parallel to
   `overlayTrack`/`captionTrack`, reusing the existing frame-native, source-vs-edit-time
   discipline. An **Auto-Layout pass** (rule-based first, Gemini-style later) can populate it —
   exactly mirroring Tella's "Auto Layouts produce the same editable segment track."

Net: we keep the overlay registry, captions, brand handle, and the layer-stack philosophy;
we add **one new track (layouts) + one new layer (LayoutTrack) + a second source video**.

---

## §4 — Remotion vs Hyperframes feasibility (brief)

*(A sibling agent owns the full engine bake-off; this is a layout-switching-specific note.)*

**Remotion fits the layout-switching system better.** Reasons specific to this feature:

- **Frame-native interpolation is first-class.** The whole smooth-transition behavior is
  "interpolate `{x,y,w,h}` of two video layers over a frame window." Remotion's
  `interpolate()` + `Easing` + `useCurrentFrame()` express this declaratively and
  deterministically — every frame is a pure function of the segment track, which renders
  identically headlessly. This is the exact pattern our existing overlays already use.
- **Two synced video layers.** `OffthreadVideo` already underpins our base layer; adding a
  second `OffthreadVideo` (camera + screen) and clipping/positioning each with CSS transforms
  is straightforward and frame-accurate. Audio/frame sync across two streams is handled by
  Remotion's timeline.
- **Reuses the foundation.** Our `SpeakerOverlayScene` + `EditPlan` + overlay registry are
  already Remotion; a `layoutTrack` is an incremental extension, not a new engine.

**Hyperframes (HTML + GSAP)** *can* animate the move/resize tween (GSAP is great at that) and
could even feel smoother to author, but: layout switching here is fundamentally about
**compositing and time-syncing two video streams frame-accurately for headless render**, which
is Remotion's home turf and is bolted onto our existing data model. For this specific
scene-layout feature, **Remotion is the lower-risk fit**; defer to the sibling bake-off for the
overall engine decision.

---

## Appendix — what was processed

**Pages fetched:** tella.com/features/multi-layouts, tella.com/features/transitions,
tella.com/auto-layouts, tella.tv/help/editing/use-layouts,
tella.com/docs/article/how-to-use-multi-layouts; plus search snippets for pricing & features.

**Videos processed (official channel `@tellahq`):**
- `CJQqwJw0v9Y` — *Layouts V2: Every Update Explained* (transcript + 30s 480p clip + 2 frames analyzed)
- `diLvU-4I_Pw` — *Custom Layouts* (transcript)
- `Z_ZADestVng` — *Squircles [12 Days of Tella – Day 2]* (transcript — camera border shapes)

**Kept reference artifact:** `docs/research/wave-6/references/tella/tella-layouts-v2-clip.mp4`
(1.45 MB, 480p, 30s — shows the layouts toolbar + timeline-segment UI).
