# @nateherk — Layout / Composition + Remotion-vs-Hyperframes analysis (Wave-9)

> **Creator:** Nate Herk (Nate Herkelman) — AI-automation / n8n / AI-agents / **Claude Code** channel. Talking-head + screen-share teaching style, landscape 16:9, ~13–32 min long-form. Studio set: light-gray wall, two floating shelves with awards/trophies, a Shure MV7+ on a boom arm, black "AIS" (AI Automation Society) quarter-zip.
>
> **Why he's a reference for THIS project:** He is the single closest match to our goal — he composites **his own talking-head camera** with **screen-share / screenshots / generated motion-graphics**, switching layouts, and he openly builds the pipeline with **Claude Code + Hyperframes (and Remotion)** — the exact bake-off this repo runs (see CLAUDE.md / BAKEOFF.md). Two of his videos are literal tutorials on doing this.
>
> **Processed:** 2026-06-01 · 6 videos pulled (<=720p) · 2 frames each · all sources deleted after frame + audio-stripped clip extraction. Clips at `docs/research/wave-6/references/nateherk/<id>-NN.mp4` (all <2 MB, video-only). Transcripts at `references/creators/nateherk/<id>/transcript.txt`.
> Frame anchors below use `<id>@~Ns` (approx seconds into source).

---

## 0. Videos processed

| ID | Title | Dur | Goal | What it gave us |
|---|---|---|---|---|
| `Aw3BkmhYu4I` | Claude Video Editing Just Became Unrecognizable | 28:12 | **B** (priority) + A | The end-to-end **Claude Code + HyperFrames + video-use** editing pipeline. Remotion-vs-Hyperframes recommendation, token cost, the prompting style, the timeline editor, screenshot-verification trick. |
| `ZNbgOhxhzXg` | Claude Just Destroyed Every Video Editing Tool | 32:00 | **B** (priority) + A | Two methods: **Claude Design** (web app, animates HTML) vs **Claude Code + HyperFrames**. "Better version of Remotion" quote. The `make-a-video` skill, gates, transcription requirement, RAM/token gotchas. |
| `tDGiWn0flK8` | From Zero to Your First Agentic AI Workflow in 26 Minutes (Claude Code) | 26:22 | A | Screen-share teaching layouts (n8n canvas, VS Code + Claude Code), corner-cam variants. |
| `jZgcWCzxh1I` | Claude Code Dynamic Workflows Clearly Explained | 16:31 | A | Full-screen terminal + large corner cam; full-bleed generated **explainer slides** + corner cam. |
| `eRS3CmvrOvA` | I Tried 100+ Claude Code Skills. These 6 Are The Best | 13:38 | A | Full-bleed **no-cam motion-graphic** intro scene (numbered grid teaser); clean A-roll baseline. |
| `q5lg3npxjAc` | Opus 4.8 Just Dropped. Here's How To Actually Use It. | 13:43 | A | Browser-docs screen-share + corner cam; white notes/outline doc + corner cam. |

---

## 1. LAYOUT TAXONOMY + DISTRIBUTION (Goal A — the priority)

Nate's grammar is simple and very consistent: **(a) full-frame talking head** for hooks/intros/transitions, and **(b) full-screen captured content (screen-share/slide/graphic) with his webcam pinned to one bottom corner as a rounded-rectangle PIP** for the bulk of every tutorial. He does NOT use true side-by-side split layouts (no "cam-right-30% + content-left" panes); content is always full-bleed and the cam floats on top in a corner. Over-speaker overlays (§2) appear only on the full-frame talking-head layout, never over screen-share.

### 1.1 Layout catalog

| # | Layout name (PascalCase, future component) | Cam position | Cam size (% frame W) | Cam shape | Screen/content region | Frame anchor |
|---|---|---|---|---|---|---|
| L1 | `FullFrameTalkingHead` | full-bleed (cam IS the frame), face centered | 100% | full-bleed | none (set is the bg) | `eRS3CmvrOvA@350`, `Aw3BkmhYu4I@9` |
| L2 | `TalkingHeadWithOverSpeakerOverlay` | full-bleed, face centered | 100% | full-bleed | transparent graphic layer pinned to a side/corner OVER the live cam (see §2) | `ZNbgOhxhzXg@12`, `Aw3BkmhYu4I@9` |
| L3 | `ScreenShareCornerCamSmall` (dense-UI teaching) | bottom-**left** OR bottom-**right** (picks the corner that doesn't cover active UI) | **~18–25%** | rounded-rect, ~16–20px radius, soft drop shadow, no border | full-bleed app capture (VS Code+Claude Code, n8n canvas, browser) | `ZNbgOhxhzXg@980` (BL, VS Code), `tDGiWn0flK8@20` (BR, n8n) |
| L4 | `ScreenShareCornerCamLarge` (he's the focus, screen secondary) | bottom-**right** (default) | **~28–32%** | rounded-rect, drop shadow | full-bleed content (terminal, docs, notes doc, slide) | `jZgcWCzxh1I@8` (terminal), `tDGiWn0flK8@700` (VS Code), `q5lg3npxjAc@30` (docs), `q5lg3npxjAc@300` (notes) |
| L5 | `FullBleedSlideCornerCam` (generated explainer slide) | bottom-right | ~28–32% | rounded-rect | full-bleed **generated** slide/diagram (dark bg, hand-drawn-style icons, color-coded concepts, slide nav arrows) | `jZgcWCzxh1I@480` |
| L6 | `FullBleedMotionGraphicNoCam` (intro/teaser/sizzle scene) | — (no cam) | 0% | — | full-bleed generated motion scene (window-mockup, numbered grid, terminal animation, app-showcase) | `eRS3CmvrOvA@10`; described throughout `ZNbgOhxhzXg` ("HyperFrames sizzle") |

### 1.2 Rough time distribution (typical tutorial)

Across the four Goal-A tutorials the split is roughly:

| Layout | ~% of runtime | Where it appears |
|---|---|---|
| L3/L4 `ScreenShareCornerCam` (small + large combined) | **~60–70%** | the entire "let me show you" body — this is the default teaching mode |
| L1/L2 `FullFrameTalkingHead` (± over-speaker overlay) | **~20–30%** | cold-open hook, chapter transitions, "let me explain why", outro/CTA |
| L5 `FullBleedSlideCornerCam` | **~3–8%** | concept-explainer beats (e.g. "do the agents talk to each other?" diagram) |
| L6 `FullBleedMotionGraphicNoCam` | **~2–5%** | the first ~5–10 s sizzle/intro + occasional B-roll graphic |

The dedicated video-editing tutorials (`Aw3BkmhYu4I`, `ZNbgOhxhzXg`) skew further toward L3/L4 because almost the whole video is screen-share of Claude Code, but their **intros** (L2 dual-glass-HUD) and the **rendered output demos** (L6) are exactly the polished compositing styles we want to replicate.

### 1.3 Transitions between layouts

- **Default = hard cut.** Hook (L1/L2) → first screen-share (L3/L4) is a plain cut. Screen-share ↔ screen-share is a cut. This is the overwhelming majority of his transitions.
- **Animated resize/slide exists only in the GENERATED outputs**, not in his own channel edit. In the HyperFrames/Claude-Design demos he explicitly directs animated layout moves — most relevant for us, the **"cam smoothly shrinks into the corner"** move he asks for verbatim:
  > "in the last 5 seconds, I want to transition. I want to take the face cam, and I want to **vertical crop it with rounded edges and a drop shadow**, and I want to reveal kind of just a dark mode modern-looking background, and I want the **face cam to shift over to the right half of the screen**." (`Aw3BkmhYu4I`)
  And the per-scene cam treatments his pipeline plans: *"face cam treatment: **corner pip throughout**, full screen for intro and outro, full screen with floating MG overlays"* (`ZNbgOhxhzXg`) — i.e. a single video animates between L1 (full intro) -> L2 (full + floating overlays) -> L4 (corner pip) -> L1 (full outro).
- **Over-speaker overlays** animate in/out independently of layout (scale-pop / slide-from-edge, §2).

---

## 2. OVER-SPEAKER OVERLAYS observed (Hormozi-style OV vocabulary)

Nate's over-speaker overlays appear on the **L2 full-frame talking head** (intros/hooks) and are the polished, generated, **iOS-26 "liquid glass"** aesthetic he repeatedly names. They flank his head (left-third / right-third) and never cover his face — a constraint he enforces by hand ("the liquid glass looks good, but it's actually covering my face a little bit, so… scale this down and crop off the right side"). Names below are PascalCase intended as future components, mirroring the Hormozi OV1–OV12 format.

| ID | Name | Anchor | What it is | transitionVerb | Replicability |
|---|---|---|---|---|---|
| NV1 | `LiquidGlassFlankCard` | `Aw3BkmhYu4I@9` | translucent frosted-glass rounded card sliding in from the **right edge** beside his head, left-third of frame kept clear of his face; holds a title / karaoke text | slide-in from edge + fade, blur backdrop ramps up, hold, slide/fade out | MEDIUM (CSS `backdrop-filter: blur` + translucent panel over `<Video>`) |
| NV2 | `TerminalChecklistCard` | `ZNbgOhxhzXg@12` (top-LEFT) | dark glass card titled `editing.loop()` listing steps (`analyze_clip`, `sync_captions`, `add_motion_gfx`, `render_frame`) each with a green **`ok`** badge; monospace | type-on / staggered line reveal, green badge pops per line | EASY–MEDIUM (mono list + per-line enter + badge) |
| NV3 | `StatChartGlassCard` | `ZNbgOhxhzXg@12` (top-RIGHT) | glass card with a big stat (`+248%`), label, and an orange **bar chart + line graph**; flanks the right of his head | number count-up, bars grow bottom-up staggered, line draws L->R | MEDIUM (animated bars + SVG line) |
| NV4 | `DualFlankingHUD` | `ZNbgOhxhzXg@12` | NV2 + NV3 **simultaneously**, one top-left + one top-right, head centered between them — his signature hook composition | both flank-cards animate in together from opposite edges | MEDIUM (composition of NV2+NV3 with center-clear zone) |
| NV5 | `KaraokeWordSubtitle` | described throughout both B videos | word-by-word "karaoke-style" subtitles synced to the transcript word-timestamps, bottom or inside a card | each word highlights on its timestamp | EASY (we already do this w/ Whisper word timings) |
| NV6 | `LowerThirdLabelCard` | `Aw3BkmhYu4I` (directed: *"add a card at the bottom of the screen that says 'mistakes will be cut'"*) | small glass label card pinned bottom-center/bottom-side | fade/slide up from bottom edge | TRIVIAL |
| NV7 | `IllustrativeMetaphorCard` | `Aw3BkmhYu4I` (directed: *"show me an actual animation of raw file being edited up with motion graphics applied… scissor comes across and cuts those out"*) | right-side glass card playing a small conceptual animation illustrating what he's saying (e.g. cards turn red -> scissor swipes -> cut) | bespoke per concept; card slides in, inner animation plays | HARD (bespoke animation per beat) |

**Key constraint he repeats (bake into our schema as a hard rule):** the overlay block is anchored to **one side / a corner, NEVER center over the face**; center-frame is reserved for full cutaways/slides. "Covering my face" is his #1 correction. This matches the Hormozi OV3 left-third/right-third rule exactly.

---

## 3. His Remotion / Hyperframes / Claude-Code RECOMMENDATIONS (transcript-sourced, quoted)

### 3.1 The tech stack he recommends

- **Orchestrator:** Claude Code (desktop app *or* VS Code extension). *"at the core of all of this, we're using Cloud Code as the orchestrator to connect all these different tools together."* (`Aw3BkmhYu4I`)
- **Trimming / editing:** **video-use** (`github.com/browser-use/video-use`) — *"Video Use is going to be the one that's doing the trimming and editing for us… drop in a raw file, and then it's basically being trimmed, edited, animated, and rendered."* (`Aw3BkmhYu4I`)
- **Motion graphics / render:** **HyperFrames** (`github.com/heygen-com/hyperframes`, HeyGen's HTML+GSAP video-for-agents tool). He prefers this over Remotion.
- **Alternative MG path:** **Claude Design** (Anthropic web app) — animates exported standalone HTML, hand off to Claude Code to render the MP4.
- **Transcription (required for sync):** Whisper. Options he lists: local `whisper.cpp` (free, RAM-heavy), OpenAI Whisper API, or **ElevenLabs API** (his pick for the editing video). *"VideoUse likes to default to [ElevenLabs]. HyperFrames likes to default to OpenAI Whisper… I am using 11 Labs API because I think that it's actually better at finding the right moments to cut."* (`Aw3BkmhYu4I`)

### 3.2 Remotion vs HyperFrames — the load-bearing recommendation

He is explicit and consistent: **HyperFrames over Remotion**, on *taste/quality of output*, not capability.

> "within video use, there's actually kind of like a motion graphics skill called **remotion**, which you guys might have been familiar with already. And **the reason why we're using hyperframes over remotion is because we just like it better.**" (`Aw3BkmhYu4I`)

> "with the new hyper frames, the way that it works with **HTML**, I just think I like it a little bit more… [Hyperframes output] is just a little bit more sophisticated and it just feels a little bit more engaging. So that's really the main difference between Remotion and Hyper Frames. **They don't actually work under the hood the exact same way**… as far as this actual flow, they both basically do this **animate** step. And then they will both go ahead and do the **rendering** as well." (`Aw3BkmhYu4I`)

> "we're going to talk about how to do it with HyperFrames, which is **kind of like a better version of Remotion** if you guys have seen that. It's a little bit more set up, but it's **way more powerful**." (`ZNbgOhxhzXg`)

> "It goes from **HTML to your browser to FFmpeg to MP4**, and it is just really, really impressive." (`ZNbgOhxhzXg`, describing HyperFrames' render path)

**One concrete reliability point that favors Remotion** (relevant to our bake-off): HyperFrames previews were flaky for him; Remotion's were not.
> "I've been having a lot of issues with these previews on localhost. **That's something that on Remotion I've basically never had an issue with, but for some reason HyperFrames, maybe because it's HTML-based or whatever it is, it has a problem sometimes**" (the localhost preview showed `0 seconds out of 0 seconds`). (`ZNbgOhxhzXg`)

**Net:** Remotion is *capable and more reliable in preview*; HyperFrames' HTML/GSAP output looks *more sophisticated/engaging* to him and is *more customizable / more powerful* once set up. Both do the same two pipeline stages (animate -> render). Claude Design is a viable no-setup third option ("really, really good at creating HTML… and apparently really good at animating that HTML").

### 3.3 The Claude-Code workflow (step-by-step, as he runs it)

1. **Set up the project:** open an empty folder in Claude Code; paste the HyperFrames + video-use GitHub repo URLs and say *"This is an open-source video editing tool I want to use. Analyze the repo, start to build some skills and knowledge around how it works, and then help me get it installed."* He distributes a pre-wired "student kit" repo to skip this.
2. **Drop in the raw file**, reference it with `@` in the prompt.
3. **Trim first (video-use):** *"remove any filler words or silences or retakes."* It transcribes, proposes cuts ("two clear retake moments to cut"), asks taste calls, snaps cuts to word boundaries with ~50 ms leads.
4. **Get word-level timestamps:** the edit produces a transcript JSON with per-word start times — *"if we wanted a motion graphic to start when I say the word 'you', then we would just need that motion graphic to start at 11.199 seconds."* This sync is the whole point.
5. **Plan mode for the motion graphics:** he flips to plan mode so Claude lays out each "beat" (scene) — anchor word, timing, card content, color palette — *before* writing HTML, to avoid wasting tokens. *"this planning stage is very important."* HyperFrames groups output into a **timeline of named beats/compositions** (he showed `01-hook`, `02-text-on-screen`, `03-karaoke-captions`, `04-mg-and-charts`, `05-pip`).
6. **Iterate via the timeline editor + comments:** the HyperFrames dashboard timeline lets him drag/delete/retime beats; changes write back to the code, and Claude Code reflects them. He gives feedback exactly like to a human editor: *"at this timestamp, I don't like this; at this timestamp, do this."*
7. **Screenshot-verification trick:** *"I'm basically telling it to take screenshots of what's going on in the scene to make sure that it looks good… if we tell it to take screenshots, it has to go verify for itself. That is just a really nice trick."* He recommends forcing a look-at-every-frame check before any render.
8. **Render** to MP4 into the per-project folder.

### 3.4 Project structure he uses (worth replicating)

A single Claude Code "video editing studio" project with a `video-projects/` folder, one sub-folder per video (`claude-edit-intro`, `aisoc-app-release`, `clickup-demo`, …); each holds `assets/` (clips, transcripts JSON), `compositions/` (the per-beat HTML), `components/`, and `renders/`. A `.claude/skills/` folder holds reusable skills (he showed a `make-a-video` skill). Confirmed visually at `ZNbgOhxhzXg@980` and `Aw3BkmhYu4I` (VS Code file tree).

### 3.5 Tips & gotchas (quoted / paraphrased)

- **Be very specific, and treat it as training data.** *"think about it like you're teaching a kid to ride a bike… you have to steer it in the right way at first."* Every finished video becomes a reference; build a per-type **design philosophy markdown** (e.g. a `lesson-design.md`) so *"every time I build a lesson, just use that"* -> eventually drop-in raw -> finished output. HyperFrames repo ships a **`motion philosophy doc`** with MG best practices.
- **Token cost is real (it writes a LOT of HTML).** One ~27 s edited video = **~238 k tokens** (`Aw3BkmhYu4I`). The golden-ratio video: first run ~260 k, second run ~125 k tokens; the whole project ~= **10% of his 5-hour limit on the $200/mo Max plan** (`ZNbgOhxhzXg`). Mitigations: tight planning, iterate before approving, and **clear the session between phases** — *"give me a summary of everything you've built and where the files are so I can clear the session… I don't want to be making all of these changes on top of 263,000 tokens."*
- **RAM/CPU:** rendering multiple videos at once thrashes the machine — *"my facecam was all glitchy… I was rendering like four videos as I was recording."* Do one render at a time; uninstall the local Whisper if RAM-bound and use an API instead.
- **Manually pre-trim truly raw footage.** AI is *"not going to be great at interpreting when is the start of a new sentence and when did you mess up."* He cuts obvious mistakes himself, then hands the cleaned file to the pipeline (Descript also "messes up a lot").
- **Claude Design limitation:** it *can't listen to / transcribe the video itself* — you must paste in the timestamped transcript for sync, and it can't export MP4 directly (screen-record short ones, or hand off to Claude Code to render long ones).
- **Taste is the moat.** *"people who already know how to edit and have a nice creative intuition are going to be able to use these tools to 10x their productivity… if someone has no taste, they might get outputs like [the mediocre clickup demo]."*

---

## 4. WHAT WE SHOULD BUILD / REPLICATE

### 4.1 Scene-layout schema (the deliverable for Goal A)

Nate's grammar maps onto a compact per-scene schema. Proposed fields:

```ts
type SceneLayout = {
  layout: "FullFrameTalkingHead"        // L1
        | "TalkingHeadWithOverlay"       // L2
        | "ScreenShareCornerCam"         // L3/L4 (size drives small vs large)
        | "FullBleedSlideCornerCam"      // L5
        | "FullBleedGraphicNoCam";       // L6

  cam?: {
    position: "fullbleed"
            | "bottom-left" | "bottom-right"
            | "right-half"  | "left-half";   // half = the animated "shift to right half" outro
    size: number;          // fraction of frame WIDTH. fullbleed=1.0; small corner ~0.18-0.25; large corner ~0.28-0.32
    shape: "fullbleed" | "rounded-rect" | "circle";   // he only uses fullbleed + rounded-rect; circle reserved
    cornerRadius?: number; // ~16-20px on the corner-cam
    dropShadow?: boolean;  // true on every corner-cam
  };

  screen?: {
    region: "none" | "full" | "inset-left" | "inset-right";  // he is effectively "none" | "full" only
    source: "app-capture" | "browser" | "slide" | "notes-doc" | "motion-graphic";
  };

  overlays?: OverlaySpec[];     // see §4.2; only valid on FullFrameTalkingHead/TalkingHeadWithOverlay
  transitionIn: "cut" | "slide-from-edge" | "cam-shrink-to-corner" | "fade";
};
```

Hard rules to encode (his hand-corrections):
- Corner-cam picks the corner **opposite the active UI**; never covers content the viewer needs.
- Over-speaker overlays anchor to a **side/corner, never center over the face**; keep a face-clear zone.
- Screen content is **full-bleed** (no true split panes) — cam floats on top. (We can still offer `inset-left/right` as an extension, but it's NOT in his vocabulary.)

### 4.2 Overlay spec (extends our existing caption layer)

```ts
type OverlaySpec = {
  kind: "LiquidGlassFlankCard" | "TerminalChecklistCard" | "StatChartGlassCard"
      | "DualFlankingHUD" | "KaraokeWordSubtitle" | "LowerThirdLabelCard"
      | "IllustrativeMetaphorCard";
  anchor: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left-third" | "right-third" | "bottom-center";
  widthPct: number;                 // ~30-40% (leaves face visible)
  glass: boolean;                   // backdrop-filter blur + translucent panel
  enter: "slide-from-edge" | "scale-pop" | "type-on" | "stagger-lines";
  syncWord?: string;                // align enter to this word's start timestamp (Whisper word timings)
};
```

### 4.3 Pipeline practices to adopt (directly from §3)

1. **Word-timestamp-driven sync is mandatory** — our Whisper word timings already feed captions; extend them to drive overlay `enter` times (his single most-repeated principle). Our faster-whisper path already produces word-level timings, so we don't need his ElevenLabs/OpenAI dependency.
2. **Plan beats before rendering** — emit a beat list (anchor word, timing, layout, overlay, palette) for review before generating the heavy render. Cheap to review, expensive to redo.
3. **Per-video-type design philosophy file** — keep a `<template>-design.md` per template (explainer / talking-head / listicle / quote) so style compounds across renders. Mirrors his "lesson-design.md" idea and our existing `brand/config.json`.
4. **Screenshot self-verification gate** — render a few keyframes and have the agent confirm framing (face not covered, text in-frame, nothing blurred) before the full render. Reuses our existing `scripts/extract-keyframes.py`.
5. **Token/RAM discipline** — clear/compact context between trim -> plan -> render phases; render one composition at a time. Relevant since our local-only M-series box has the same RAM ceiling he warns about.

### 4.4 Bake-off implication for THIS repo

His verdict (HyperFrames *looks* better/more customizable; Remotion is *more reliable in preview* and we already own a working Remotion stack) is useful evidence for our Remotion-vs-Hyperframes bake-off (CLAUDE.md decision #6 / BAKEOFF.md). Concretely: keep Remotion as the reliable default, but **steal the HyperFrames-style "liquid-glass flank card" and "dual flanking HUD" aesthetic** (§2 NV1/NV4) as new Remotion components — that look is what reads as "sophisticated," and it's pure CSS `backdrop-filter` + a translucent panel over our `<Video>` base, fully achievable in Remotion without adopting HyperFrames.
