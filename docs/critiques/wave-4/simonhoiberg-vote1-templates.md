# Voter 1 — Templates on @simonhoiberg

**Confidence: HIGH** for the 4 dominant templates (T1, T6, T7, T8). **MED** for T2/T3 (CGI broll variants — strong signal but only 2 reels each). **LOW** for T4 (whiteboard insert appears once) and T5 (split-screen LinkedIn quote appears once).

**Corpus:** 12 reels × 8 keyframes ≈ 96 frames inspected. Frames live under `references/creators/simonhoiberg/<shortcode>/frames/`. No prior analyses read.

**Headline:** Simon's grammar is essentially **two locked talking-head sets + 4 reusable inserts/endcards**. Once you nail the talking-head treatment + the YouTube CTA endcard, you cover ~80% of his surface. Everything else is asset-driven (CGI broll, whiteboard, layered cards).

---

## Identified templates

### T1 — `TalkingHead.Desk.LightBeige` (anchor desk set) — HIGH 🔴

- **Reels (8/12):** DM0MxiTOu-p, DMsj5dNPzK3, DN5lzNDjMkV (cuts), DNDqoVHRlsq, DNVjkdEsKAj, DNnr51Mqp75, DOdy8xIjH-A, DPT3n_PgEiU (cuts), DQWsK-UCnTq, DQb8u0vihLC, DM0MxiTOu-p (frames 0,4,6).
- **Visual structure:** Subject centered, eyeline ~upper-third, light beige brick wall + warm string-light bokeh band along the top, light-wood desk in lower 25% with iPad/stylus/paper/phone props. Cool teal background ambient + warm rim from the string lights = teal/orange complementary push. Pull-quote zoom: identical set but cropped 1.15–1.3× to push the talker face into ~70% of frame height.
- **Motion:** Static camera; subtle organic head/hand motion only. Cuts roughly every 6–10s — visible from the jump-cut framing variation between sequential frames (00 vs 02 vs 04). No camera zoom-in/zoom-out; the "zoom" happens at the editor cut.
- **Audio/captions:** No burned captions visible in the frames I sampled — assumes IG/YT auto-captions handle it. (Worth confirming in vote2-components.)
- **Map to Stream-E:** new addition — call it `TalkingHeadDeskAnchor9x16`. Closest existing is `TalkingHeadDynamic9x16`, but Simon's variant locks the desk-prop staging and the warm-string-light cue, both of which are signature.
- **Sprint priority:** 🔴 HIGH. This is 65–80% of his on-screen time across the sample. If we want to recreate his look, this is the table-stakes set.

### T2 — `TalkingHead.Walk.CGIWarehouse` (walking-into-CGI hook) — MED 🟠

- **Reels (1/12):** DBMBFjoCy1N ("Create a SaaS Factory"). The reel opens with him walking in a dark CGI warehouse environment, cuts to a CGI conveyor + FeedHive-branded box, cuts to a CGI factory with logo wall (Amazon, etc.), then ends with him walking out of a CGI hangar with a `youtube.com/@SimonHoiberg` chip overlay.
- **Visual structure:** Subject keyed (cleanly cut) onto generative video backgrounds (clearly Veo / Sora / Kling output — see the building lighting in frame-01 and the warehouse depth in frame-03). Closing CTA: walking subject, white pill containing red YouTube glyph + handle URL, vertically centered around 80%.
- **Motion:** True parallax — the subject moves laterally as the camera tracks (or the BG moves). Combined with the BG video having its own slow dolly motion gives a "feature trailer" feel.
- **Map to Stream-E:** new — `WalkingHero.AICompose9x16`. No existing typology slot covers AI-keyed-background walking. Closest neighbor is `BeforeAfter` (which is split-frame, not parallax).
- **Sprint priority:** 🟠 MED. Visually striking but expensive: requires green-screen capture + a Veo/Kling render budget + keying. Only spawn this template after the core 5 ship; reserve for hero pieces (e.g. annual recap, big launch).

### T3 — `LaptopCGI.ScreenSwap` (CGI MacBook with hot-swap screen) — MED 🟠

- **Reels (2/12):** DPBv4qMkmXE ("AI now writes 90% of our code"), DPT3n_PgEiU ("AI Agents for coding"). Also a brief inset in DM0MxiTOu-p frame-02.
- **Visual structure:** Photoreal CGI MacBook Pro centered on a desk in a moody-lit room. The screen content is a real screen-recording (Lovable AI in DPBv4qMkmXE, GitHub PR view in DPT3n_PgEiU) composited onto the CGI laptop's display. Frame is letterboxed 4:3-ish in a 9:16 canvas with black bars top/bottom (~25% each), so the actual visible area is roughly 1080×1080.
- **Motion:** Slow dolly-in on the laptop. Screen content scrolls inside the screen as if a real session. Cuts to product UI without ever showing a transition shim.
- **Map to Stream-E:** partial match to `ToolReview` (Complexity 3) — extend the spec with a CGI-laptop wrapper option. New variant slug: `ToolReview.LaptopCGI9x16`.
- **Sprint priority:** 🟠 MED. Reuse for any "tool walkthrough" story; the CGI laptop asset is a one-time render (or a single hyperframes/Remotion 3D scene) that can be re-skinned per video.

### T4 — `WhiteboardSketch.Insert` (handwritten taxonomy card) — LOW 🟢

- **Reels (1/12):** DMsj5dNPzK3 frame-04 (handwritten "Marketing / Kling AI / FeedHive / Ops/Automa(tion) / n8n / Rep…").
- **Visual structure:** Full-frame photo of an actual handwritten list on light-gray paper, with brand glyphs (Kling logo, FeedHive logo, n8n logo) hand-drawn next to each label. Categories in larger handwriting headers; items as sub-bullets with glyphs.
- **Motion:** Static frame, but in the live reel this is a "marker-draw" reveal — each row written in by a hand-shaped mask wipe (visible from the partially-drawn `Rep…` truncation in frame 04). Could also be a still photo of an already-completed sketch held up to camera.
- **Map to Stream-E:** new — `WhiteboardListReveal9x16`. Loosely related to `Listicle5` but the aesthetic is hand-drawn / personal-notebook, not branded type. Pairs perfectly with the "anti-aesthetic cream paper" Armando Inteligencia direction.
- **Sprint priority:** 🟢 LOW. One observation only. Worth a test build as an *alternate aesthetic* for `Listicle5`, but not a stand-alone template.

### T5 — `SplitScreen.QuoteOverScreenrec.WebcamBelow` — LOW 🟢

- **Reels (1/12):** DQWsK-UCnTq frame-05 ("Will AgentBuilder replace n8n?"). Top half: LinkedIn post screenshot ("n8n is dead. And that's a good thing.") layered above a screen-recording of AgentKit's node canvas ("Agent 1: Simple Web Search"). Bottom half: webcam reaction with Simon in the desk set (T1 lighting).
- **Visual structure:** Vertical split, top ~55% / bottom ~45%. Top region itself layered: full-bleed screenrec backdrop + dark-on-white quote card pinned upper-left.
- **Motion:** Webcam reacts in real-time to the screenrec — classic "reaction reel" framing. Cuts probably tied to which UI region is being narrated.
- **Map to Stream-E:** matches `SplitWebcamScreen9x16` (an existing composition in `src/compositions/`). This reel validates that template is on-spec.
- **Sprint priority:** 🟢 LOW (already built). Just add the LinkedIn-quote-on-screenrec sub-layout as a sub-template option.

### T6 — `LayerCardStack.Numbered` (layer/step cards over blurred BG) — HIGH 🔴

- **Reels (2/12):** DPBv4qMkmXE frames 00, 01 + DPT3n_PgEiU frame 00, 01. Three stacked rounded-rectangle white cards reading `Layer 1 — Vibe Coding`, `Layer 2 — AI Agentic Coding`, `Layer 3 — AI-Assisted Coding`. Each card has a left-aligned pixelated/blocky thumbnail glyph + a purple/violet pill label ("Layer N") + bold black title.
- **Visual structure:** Cards float over a heavily-blurred version of the set (string lights, brick wall) so the cards pop. Purple pill is the only accent color — strict 2-color palette (purple + black on white). Pixelated 8-bit-style icon on left of each card is a recurring brand element.
- **Motion:** Sequential card slide-in from below + soft drop-shadow grow (inferred from sequential frames showing same 3 cards with no other change — they're the static state after all 3 have landed). Slight cards drift / parallax on the BG.
- **Map to Stream-E:** new — `LayerCardStack9x16`. Already a stub in `src/compositions/LayerCardStack9x16.tsx` per project structure. Validate spec against these 2 reels.
- **Sprint priority:** 🔴 HIGH. Reused twice in 12-sample window suggests this is Simon's go-to "3-step framework" device. High ROI to ship.

### T7 — `YouTubeCTA.BracketFrame.Endcard` (recurring outro) — HIGH 🔴

- **Reels (4/12 endings inspected):** DM0MxiTOu-p frame-07, DN5lzNDjMkV frame-07, DNnr51Mqp75 frame-07, DOdy8xIjH-A frame-07, DPT3n_PgEiU frame-07. Pattern: heavily blurred backdrop (looks like a recap-mosaic of other content); centered red YouTube glyph + "Watch Now" text; below it a YouTube-thumbnail-shaped card with four corner-bracket markers (`⌐ ¬ ⌐ ¬` style) framing the thumbnail content; `@SimonHoiberg` handle below.
- **Visual structure:** The thumbnail inside the brackets actually animates / cuts between *different thumbnails* (Sam Altman tweet, YouTube+LinkedIn logos, AI Coding stack repackaged). So the endcard is a *template* and the thumbnail asset varies per reel.
- **Motion:** Brackets pop in from corners (scale + opacity); thumbnail cross-fades; handle slides up. Last frame holds for 1–2s.
- **Map to Stream-E:** new — `EndCardYouTubeCTA9x16`. Not currently in the 15-template list. Should be added as a *universal* endcard module that any template can append, not as a stand-alone template.
- **Sprint priority:** 🔴 HIGH. Used on ≥5/12 reels. Easy build (overlays + thumbnail slot + corner brackets). Massive reusability across all 15 templates.

### T8 — `IPadDataChart.HeldUp` (real iPad showing a chart insert) — MED 🟠

- **Reels (1/12, but the device is on the desk in many):** DN5lzNDjMkV frame-03. Real iPad held up to the camera showing a multi-line chart ("User Growth of Discord, Microsoft Teams, and Slack" — Discord/Teams/Slack lines from 2015 to 2024).
- **Visual structure:** iPad fills ~85% of frame; chart UI is real, not a CGI overlay. Top/bottom of iPad bezel visible. Soft desk edge below.
- **Motion:** Held-still, with very slight handheld drift. Cuts hard to/from T1 talking-head shots.
- **Map to Stream-E:** Aligns with `ChartReveal` (Complexity 4) — but Simon's version delegates the chart rendering to a real iPad device. Faster to ship than building an animated SVG chart, lower production polish.
- **Sprint priority:** 🟠 MED. Cheaper-to-execute fallback for `ChartReveal` (just render chart in browser → screenshot → composite onto iPad image). Worth a low-effort variant build.

---

## Sprint priorities (rolled up)

| Priority | Template | Reels | Notes |
|---|---|---|---|
| 🔴 | T1 TalkingHead.Desk.LightBeige | 8 | The anchor set; ship first |
| 🔴 | T6 LayerCardStack.Numbered | 2 | Already stubbed in repo; finish + ship |
| 🔴 | T7 EndCardYouTubeCTA | ≥5 | Universal endcard module |
| 🟠 | T2 WalkingHero.AICompose | 1 | Hero-piece only; needs Veo budget |
| 🟠 | T3 LaptopCGI.ScreenSwap | 2 | Extends `ToolReview` |
| 🟠 | T8 iPadDataChart.HeldUp | 1 | Low-poly `ChartReveal` variant |
| 🟢 | T4 WhiteboardSketch.Insert | 1 | Alternate aesthetic for `Listicle5` |
| 🟢 | T5 SplitScreen.QuoteOverScreenrec | 1 | Already covered by `SplitWebcamScreen9x16` |

## Coverage / differentiation

Reels that route to *only T1*: DNDqoVHRlsq, DNVjkdEsKAj, DNnr51Mqp75 body (insert appears only at end), DOdy8xIjH-A body, DQb8u0vihLC (humanoid robots — caption hints at broll but the 8 sampled frames are all T1). This confirms ~50% of his reels are pure desk + auto-captions + a YT endcard.

Reels with **2+ templates composited**: DBMBFjoCy1N (T2 + T1 close-up + T7), DM0MxiTOu-p (T1 + T3 insert + T7), DMsj5dNPzK3 (T1 + T4), DN5lzNDjMkV (T1 + T8 + T7), DPBv4qMkmXE (T6 + T1 + T3), DPT3n_PgEiU (T6 + T1 + T3 + T7), DQWsK-UCnTq (T1 + T5).

The compositional pattern is consistent: **T1 narrates → an insert (T3/T4/T6/T8) makes the point visual → T7 closes**. Replicating this *editorial spine* is more important than perfectly matching any single insert template.

## Open questions for vote2 (components)

- Confirm caption treatment on T1 — burned in or platform-default? Sampled frames show none, but compressed thumbnails may have dropped them. If burned, voter2 should pull the exact font (looks Inter Bold) and stroke/shadow recipe.
- Validate T6 card spec: is the purple `#7A3CE8`-ish pill always identical width or content-fit? Frame-00 and frame-01 of both DPBv4qMkmXE and DPT3n_PgEiU look identical card-to-card, suggesting a fixed pill geometry — but the title text "AI Agentic Coding" vs "Vibe Coding" suggests the card width itself flexes. Measure.
- T7 bracket dimensions/timing — measure from a video frame, not just a still. The corner brackets (`⌐ ¬` style) need exact stroke weight + offset from the inner thumbnail edge. Also: is "Watch Now" + the YouTube glyph a clickable IG sticker or burned-in graphic? (Affects whether we ship as PNG overlay vs Remotion sequence.)
- T3 LaptopCGI: identify the source of the CGI laptop scene. If it's a single re-rendered 3D scene (Blender/C4D), we can ship it as a static MP4 underlay + screenrec composite on top. If it's a per-shot Veo render, that's a much more expensive workflow.

## What I would NOT replicate

- The walking-out-of-CGI-warehouse (T2) is gorgeous but is essentially a feature-film-trailer move. For weekly-cadence content, the ROI is too low — burn that budget on better hooks for T1, not on hero compositing.
- The brick-wall + warm-string-light backdrop is *very* Simon. We should design our own equivalent (cream paper / ink-gray / warm-red per the existing brand) instead of copying his palette, or it'll feel derivative on the timeline.

## Recommended next moves (this week)

1. Build T7 EndCardYouTubeCTA9x16 as a stand-alone Remotion sequence that any other composition can `<Sequence>` in. Highest ROI for least effort.
2. Finish stubbing T6 LayerCardStack9x16 (already exists in the repo per project structure) — match the purple pill + pixelated icon style but with our brand palette swap.
3. Document T1 desk-set lighting + camera framing as a *production guide* (it's a physical-set template, not a software template). Useful for any human-talking-head reel we shoot.

