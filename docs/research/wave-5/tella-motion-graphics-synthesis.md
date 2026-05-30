# Wave-5 — Tella YouTube research: motion graphics + Remotion replication

> Source: 5 Tella YouTube videos transcribed with faster-whisper `small` (CPU int8, EN), Wave-5 frames extracted at 16 evenly-spaced points per HIGH-priority video. All transcripts under `docs/research/wave-5/tella-transcripts/`, all frames under `docs/research/wave-5/tella-frames/`. Audio + raw video erased from `/tmp/tella-research/` after this synthesis was written.

---

## 1. Executive summary

1. **Motion graphics = the cheapest "pro" upgrade for screen-recorded content.** Tella's whole thesis is that adding a 2–8s motion-graphic insert per minute lifts a tutorial from amateur to "Ali-Abdaal-tier" without a single editor key-stroke.
2. **Reference-driven generation beats from-scratch prompting.** Every Remotion piece Tella demos starts from a *static screenshot* or a *screen-recorded reference clip*, fed to Claude Code as the inspiration anchor — never "make me a cool animation."
3. **Claude reads images frame-by-frame, not as motion.** Tella explicitly flags this: Claude needs to be *told* the transition (slide-up, stagger, blur-pop), because it cannot infer motion from a still or a video. Style transfers; choreography does not.
4. **The reusable Remotion vocabulary is small (~7 patterns):** community/tweet animator, listicle/hierarchy reveal, notes-app slide-up, decision-tree path-draw, app-icon connect + notification, animated chart (bar/line/Venn), and animated title card. Everything else is recombination.
5. **The hook is mostly *visual*, not verbal.** Tella's hooks video and her TikTok-hook-mining video both argue that the first 3-4s of a video succeed on *setting + color + gear + angle + hands*, plus on-screen text — not on the spoken line. Our compositions should optimize their first 45-60 frames as a *visual* statement.

---

## 2. Per-video distillation

### 2.1 ykBDqicGx0M — "Can Remotion Recreate ANY YouTube Animation? I Tested It"

- **URL:** https://www.youtube.com/watch?v=ykBDqicGx0M
- **Duration:** 21:06 (1266s)
- **Frames:** `docs/research/wave-5/tella-frames/ykBDqicGx0M/frame-00-t0s.jpg` … `frame-14-t1181.82s.jpg`
- **Transcript:** `docs/research/wave-5/tella-transcripts/ykBDqicGx0M.{txt,json}`

**Main claims:**
- Adding motion graphics to a screen-recording is "the easiest way I've ever found to make your videos go from amateur to pro YouTuber level" (00:00).
- The workflow is *always* the same: capture a reference (screen-record or screenshot of an existing creator's effect), drop it into Claude Code, prompt Claude to recreate it in Remotion, iterate.
- Some Remotion ops are still weak: **arrows render badly** ("Remotion doesn't do an amazing job at arrows" — 16:53), and **app/icon-style motion graphics need real PNG assets** of the app logos passed in.
- A separate category of effects — **blur + highlight zoom-and-spotlight** — is better done in Tella's built-in editor than in Remotion. (18:00–20:30)

**Specific creators cited:**
- Alex Hormozi (00:18, 04:42, 07:42) — listicle/ranked-hierarchy style and animated-tweet style
- Ali Abdaal (00:18, 02:54, 09:16) — animated YouTube-community post; animated notes-app slide-up
- Jay Klaus (00:19, 10:11) — ranked-tier listicle with side-by-side talking head
- "Shabam" (14:11) — app-icon connect + notification cascade (Gmail + ChatGPT)
- "Jeff Seuss" (16:47) — decision-tree pie-chart-style hierarchy

**Techniques demoed (with timestamps + frame anchors):**

| # | Timestamp | Technique | Frame |
|---|-----------|-----------|-------|
| 1 | 02:30–04:30 | **Community-post / tweet-card animator** — static screenshot of a circle community or X post; key text gets highlighted with a colored underline/halo while sibling rows stay dim | `frame-01-t84.41s.jpg`, `frame-02-t168.83s.jpg` |
| 2 | 04:38–07:24 | **Animated tweet** — avatar fade-in, body text reveals line-by-line, attached image scale-pop, like-count rolls up | `frame-03-t253.24s.jpg` |
| 3 | 07:32–12:08 | **Listicle / ranked hierarchy** — items appear one-by-one bottom-to-top, each tier with a slight rest beat before the next slides in | `frame-04-t337.66s.jpg`, `frame-05-t422.08s.jpg` |
| 4 | 09:16–11:53 | **Notes-app slide-up** — full-screen mock of iOS Notes; list items rise from below, one per beat, ending in a held idle | `frame-06-t506.49s.jpg`, `frame-07-t590.91s.jpg` |
| 5 | 12:08–13:56 | **Tier-ranking with side-by-side host** — same hierarchy primitive but offset to half-width, leaving room for a talking-head insert | `frame-08-t675.32s.jpg` |
| 6 | 14:04–16:42 | **App-icon connect + notification cascade** — two app logos slide in from sides, a line/arc connects them, then notification toasts drop in fast succession from the connected app | `frame-09-t759.74s.jpg`, `frame-10-t844.16s.jpg` |
| 7 | 16:47–17:55 | **Decision-tree / pie split** — central node fans out to 3+ children, labels reveal sequentially, arrows draw last (Tella notes Remotion struggles with arrowheads) | `frame-11-t928.57s.jpg`, `frame-12-t1012.99s.jpg` |
| 8 | 17:58–20:35 | **Highlight + blur spotlight** (in-editor, *not* Remotion) — zoom-in to a single rect, optional blur of everything outside the highlight rect | `frame-13-t1097.40s.jpg`, `frame-14-t1181.82s.jpg` |

**Quotable verbatim:**
- "Keep it simple and just do what the pros are doing." — 00:23
- "Within the first five seconds of their video, they just cram a bunch of motion graphics because we're such visual people. We want to see a lot going on." — 16:32
- "Remotion doesn't do an amazing job at arrows. It kind of shows the pointy bits of the arrow too quickly or in strange places." — 16:55
- "Sometimes it's really good at interpreting styles, but not necessarily at the animations… Claude cannot really analyze more than frame by frame… it doesn't necessarily understand the transitions." — 10:42–10:59 (THE rule for our prompts: state the transition explicitly).

---

### 2.2 PrGYLd7yu1s — "I Made Video Animations in Seconds with Remotion (Beginner-Friendly)"

- **URL:** https://www.youtube.com/watch?v=PrGYLd7yu1s
- **Duration:** 14:50 (890s)
- **Frames:** `docs/research/wave-5/tella-frames/PrGYLd7yu1s/`
- **Transcript:** `docs/research/wave-5/tella-transcripts/PrGYLd7yu1s.{txt,json}`

**Main claims:**
- Template marketplaces ("just use After Effects templates") fail because they "didn't quite match the vibe of my video" (00:18) — generation-from-reference is what fixes that.
- The Remotion install path is now an `npm create remotion` flow that *also* installs an "agent skill" for Claude Code, so the same `claude` CLI session can both write the TSX and render the MP4. (01:30–02:00)
- Two inspiration channels: (a) Pinterest static images / GIFs and (b) YouTube clips screen-recorded for reference. Both end up as input files to Claude.

**Specific creators cited:** Ali Abdaal (recreated 12:42 — wavy cream background, age-comparison vertical bars).

**Techniques demoed:**

| # | Timestamp | Technique | Frame |
|---|-----------|-----------|-------|
| 9 | 04:30–06:32 | **Animated growth line graph** — static Pinterest screenshot prompts → Claude generates a Remotion comp where the line draws from left to right with a counter at the head ("12,500 subscribers"). Tella says you can replace the placeholder data with an Excel/CSV your own data. | `frame-02-t118.60s.jpg`, `frame-03-t177.90s.jpg` |
| 10 | 06:37–07:43 | **Animated bar chart with rolling labels** — bars rise from baseline with eased height, x-axis labels (Q1–Q4) and chart title reveal slightly later | `frame-04-t237.21s.jpg`, `frame-05-t296.51s.jpg` |
| 11 | 07:55–09:55 | **Animated Venn diagram** — two/three circles drift in from off-frame, alpha-blend on overlap, central intersection label reveals last; horizontal layout encouraged for 16:9 | `frame-06-t355.81s.jpg`, `frame-07-t415.11s.jpg` |
| 12 | 10:14–13:13 | **Static-photo → motion-design replication via ffmpeg-frame-extract** — for a video reference, run `ffmpeg` (via Claude) to extract N frames, write a frame-by-frame description, then ask Claude for an equivalent Remotion comp. Tella says style transfers very well; specific motions (e.g. wavy background) often don't. | `frame-09-t533.72s.jpg`, `frame-10-t593.02s.jpg` |
| 13 | 13:15–14:30 | **Branded title-card / chapter-break** — render the Venn or counter as ProRes MOV, drop into Tella as a clip between chapters. "For now in Tella this works best for title pages." | `frame-12-t711.63s.jpg`, `frame-13-t770.93s.jpg` |

**Quotable verbatim:**
- "Some things work better in Remotion than others, so try to keep it simple initially… arrows are kind of hard to recreate." — 03:38
- "The best thing to do is just to give it an image and see what Claude comes up with first because the more information you give it initially, the further away or the more room for interpretation there is for Claude." — 08:42 (the *under*-prompt-first rule)

---

### 2.3 wviYUDGhie4 — "5 visual hooks that keep viewers watching"

- **URL:** https://www.youtube.com/watch?v=wviYUDGhie4
- **Duration:** 3:33 (213s)
- **Frames:** `docs/research/wave-5/tella-frames/wviYUDGhie4/`
- **Transcript:** `docs/research/wave-5/tella-transcripts/wviYUDGhie4.{txt,json}`

**Main claims:** the first ~4s of any video is a *visual* problem. Five plug-in hooks that don't depend on what you say:

1. **Unexpected setting** — car, morning walk, anything that isn't a desk. (00:36) Refs: Patrick (in-car), Jay (walking).
2. **Color** — a bright shirt or background beats a gray one. (01:07) Refs: founder Grant's weird t-shirts ("hardcore software", "BDSM = Business Development Sales Marketing").
3. **Gear** — Tella's pink fluffy mic; Subway Takes' subway-card mic; Liana Ava's call-center mic. (01:36)
4. **Angle** — above / below / side breaks pattern. Ref: Bella Freud's *Fashion Neurosis* (interviews shot lying-down therapy-style). (02:03)
5. **Hands** — peel a grapefruit, do makeup, brew tea while talking. Ref: Alex on a budget, makeup-while-storytime TikToks. (02:43)

**Frames:** the host's setup is reused as her own visual hook — see `frame-00-t0s.jpg` (pink fluffy mic on shoulder).

**Quotable verbatim:**
- "If you don't hook people within four seconds of starting your video, you're toast." — 00:00
- "A visual hook can be small or big, but if you manage to stay consistent with it, your viewers will know it's your video before they even hear you talk." — 02:58 (the *brand-as-visual-tic* doctrine).

---

### 2.4 1w_H6uA3N-g — "I Use Claude to Edit Videos: Here's My Exact Process"

- **URL:** https://www.youtube.com/watch?v=1w_H6uA3N-g
- **Duration:** 21:57 (1317s)
- **Transcript only:** `docs/research/wave-5/tella-transcripts/1w_H6uA3N-g.{txt,json}`

**Main claims:** end-to-end Claude-driven video editing replaces a manual editor. Pipeline phases:
1. **Rough cut** — `cut video` skill that runs whisper + ffmpeg, strips silences/ums/repetitions while preserving laughter. Reference style is taught by giving Claude a manually-edited prior video.
2. **Asset overlay** — drop a Google-Slides link or PDF; Claude extracts images, crops white padding, maps them to the right transcript timestamps.
3. **Sound effects** — a Slack bot ingests sound URLs into a `sounds/` folder; Claude adds e.g. the Duolingo "correct" chime whenever the transcript matches "yes, correct".
4. **Memes** — same Slack-bot pattern; Claude inserts the "confused math lady" clip at the timestamp the user names ("around 1:50").
5. **Zooms / Ken Burns / harsh zoom** — Claude infers high-laughter / argument moments and adds zooms. User can override per timestamp.
6. **Short-form clipping** — the `clipify` skill (300 GitHub stars) cuts the long-form into reels-ratio short with captions burned in. Optional split-screen for 2-speaker.
7. **Tella MCP** — direct MCP into Tella's editor for layout swaps, frame extraction for thumbnails, b-roll layout insertion. Generated Remotion graphic → uploaded as b-roll → layout swapped in Tella.

**Replicable techniques for Wave-5:** the *editing pipeline* — not visual primitives — but two visual patterns DO appear:
- **Reaction-meme insert** as a transcript-aware overlay (confused-math-lady at the laugh peak)
- **Smart-zoom on emotion peaks** (Ken Burns vs. hard zoom selectable)

**Quotable verbatim:**
- "Claude is basing himself off the transcript and sometimes it's kind of hard to tell where to add [a sound effect]." — 09:51 (we should always feed transcript + timestamps, not just audio).

---

### 2.5 LYpZiU2gfzg — "Save 100+ Video Hook Ideas from TikTok in Minutes (using Claude Code)"

- **URL:** https://www.youtube.com/watch?v=LYpZiU2gfzg
- **Duration:** 12:50 (770s)
- **Transcript only:** `docs/research/wave-5/tella-transcripts/LYpZiU2gfzg.{txt,json}`

**Main claims:** TikTok → Obsidian hook database via Claude Code Chrome extension + faster-whisper + ffmpeg.
- Save hooks to a TikTok collection → Claude (with Chrome extension) downloads them to `~/tiktok-hooks-vids/`.
- For each video: whisper extracts the spoken hook (first 1–2 sentences); ffmpeg analyzes the first 10 seconds of frames for the *visual/text* hook.
- Obsidian table columns: **spoken hook | text hook | link | your-content remix**.
- The 4th column ("how would *I* use this hook") requires CLAUDE.md context — Tella feeds her own messaging guide, product description, written substacks, video transcripts so Claude's remixes sound like *her*.

**Replicable techniques for Wave-5:** this isn't a visual technique — it's an *idea-pipeline* we should adopt for our own content calendar.

**Quotable verbatim:**
- "If you don't hook people within three seconds of your video, I already know it's going to do badly." — 00:00
- "It is going to use [your worldview] to apply the hook and if your take is kind of mid then the hook's not going to hit either." — 11:28 (we have to write a real CLAUDE.md voice file, not generic copy).

---

## 3. Replicable techniques catalog

Every motion-graphic technique Tella explicitly demos, in priority order for our `src/animation/` and composition library. **Bold = not yet in our codebase**; (✓) = we already have an analogue.

### T1. Highlight-row-in-feed (community / tweet / comment animator)
- **Where:** ykBDqicGx0M @ 02:30–04:30 (frame-01, frame-02)
- **Visual:** static screenshot of a feed; one row brightens / gets a colored underline + halo while sibling rows desaturate or blur 1–2px.
- **Encoding:** A composition prop `highlightedRowIndex` + a `<FeedRowHighlight>` molecule. Primitive needed: `dimSiblings(targetIndex, ease)`.

### T2. Animated tweet/post card (avatar pop → text reveal → image pop → counter roll) **NEW**
- **Where:** ykBDqicGx0M @ 04:38–07:24 (frame-03)
- **Visual:** four-stage choreography. (i) avatar scale-pop 0→1 over 8f, (ii) name+handle slide-in from left 12f, (iii) body text reveals line-by-line @ 6f stagger, (iv) image scale-pop 0.9→1 with shadow blur-in, (v) like/repost counters roll up using existing `rollingDigit.ts`.
- **Encoding:** new composition `TweetCard9x16.tsx` + new molecule `<SocialPostCard>` that takes `{avatarSrc, handle, body, mediaSrc, likes, retweets}`. **Uses existing `rollingDigit.ts`** for counters. (✓ partial)

### T3. Listicle bottom-to-top stagger with held tiers (Hormozi/Klaus hierarchy) **NEW**
- **Where:** ykBDqicGx0M @ 07:32–13:56 (frame-04, frame-05, frame-08)
- **Visual:** list items appear bottom-to-top, each item with `translateY(20→0) + opacity(0→1)` over 10f, then a hold beat of ~12-15f before the next item starts — *not* a flat stagger.
- **Encoding:** new primitive **`heldStagger.ts`** in `src/animation/` that returns per-index `(progress, isHeld)` given `holdFrames` + `revealFrames`. Build composition `RankedTierList9x16.tsx` on top.
- **Distinct from `staggeredCascade.ts`** which is a continuous stagger — this one has explicit dwell beats.

### T4. Notes-app slide-up reveal (✓ close)
- **Where:** ykBDqicGx0M @ 09:16–12:08 (frame-06, frame-07)
- **Visual:** iOS-Notes frame with title at top, items appear one at a time sliding from `translateY(60)` to 0 with mild over-shoot.
- **Encoding:** we have `BlurInFocus`/`StaggeredCascade`. Add a **`<NotesAppFrame>` chrome component** (top bar with date, title input style, body) under `src/components/`. Composition: `NotesAppList9x16.tsx`.

### T5. App-icon connect + notification cascade **NEW (HIGH VALUE)**
- **Where:** ykBDqicGx0M @ 14:04–16:42 (frame-09, frame-10)
- **Visual:** two app icons slide in from L and R, a line/arc draws between them, then 2–4 notification toasts drop from the top of the connected app with `translateY(-100→0) + opacity(0→1)` at 4-frame intervals, each held ~30f then exiting.
- **Encoding:**
  - New molecule **`<AppIconPair>`** — takes `{leftIcon, rightIcon, connector: 'line' | 'arc'}`.
  - New molecule **`<NotificationToast>`** — toast chrome (app-name badge, title, body, timestamp).
  - New primitive **`pathDraw.ts`** — animates SVG path `stroke-dashoffset` from `pathLength` to 0 (used here for the connector arc, *also* for the decision-tree edges in T7).
  - Composition `AppConnect9x16.tsx`.

### T6. Animated line/bar/Venn chart suite (✓ partial)
- **Where:** PrGYLd7yu1s @ 04:30–09:55 (frames 02–07)
- **Visual:** lines draw L→R with a head-counter using `countUp.ts`; bars rise from baseline with overshoot easing; Venn circles drift in and overlap.
- **Encoding:**
  - We already have `BarChartList9x16.tsx`, `LineChartAnnotated9x16.tsx`. Audit them against Tella's frames — does the line graph have a *moving head-of-line counter*? If not, add `<HeadOfLineCounter>` overlay (binds to existing `countUp.ts`).
  - **Build `VennDiagram9x16.tsx`** — three modes (2-circle, 3-circle, horizontal-3). Use `pathDraw.ts` for outlines. **NEW.**

### T7. Decision-tree / radial pie split **NEW**
- **Where:** ykBDqicGx0M @ 16:47–17:55 (frame-11, frame-12)
- **Visual:** central node, 3 children fan out radially; edges draw last with `pathDraw.ts`; labels fade in *after* their edge completes. Critical rule from Tella: do NOT animate arrowheads — they look bad. Use a small dot or chevron at the edge tip instead.
- **Encoding:** new composition `DecisionTree9x16.tsx` (we already have `DiagramExplainer9x16.tsx` — check overlap before building). Reuses `pathDraw.ts` and `heldStagger.ts`.

### T8. Highlight-with-zoom-and-blur spotlight (Tella's in-editor effect) **NEW**
- **Where:** ykBDqicGx0M @ 17:58–20:35 (frame-13, frame-14)
- **Visual:** zoom into a rect on a screen recording, blur everything outside the rect at ~8px Gaussian, hold ~40f, then ease out.
- **Encoding:** new molecule **`<SpotlightZoom>`** wrapping any `<Sequence>` content. Props: `{targetRect, zoomFactor, blurPx, dwellFrames}`. Internally uses CSS `mask-image` + `filter: blur()` layered over a `scale + translate` transform on the source. Composition example: layer on top of `MacWindow/` content.

### T9. Visual-hook bumper (mic-in-frame / unexpected setting / color tic) **NEW (lightweight)**
- **Where:** wviYUDGhie4 (whole video)
- **Visual:** a 30-60f opening sting that establishes a *reusable* visual element — mic, prop, color block — that the viewer learns to associate with the channel.
- **Encoding:** a new composition `BrandedOpener9x16.tsx` that takes a `propSrc` (PNG of a mic / object / icon) and animates it into frame with a snappy spring (overshoot 1.2 → 1.0) over 12f, then holds, then transitions into the main content. Pairs with `BrandWatermark.tsx`.

### T10. Reaction-meme overlay on emotion peak **NEW**
- **Where:** 1w_H6uA3N-g @ 10:38–11:36
- **Visual:** a sub-second meme video (e.g. confused-math-lady) drops in over the host's face when the transcript signals a comedic/confused beat. Held 60-90f then exits.
- **Encoding:** new molecule **`<MemeInsert>`** that takes `{src, startFrame, holdFrames, position: 'top-right' | 'full'}`. Inserts a `<Video>` from `remotion` with overshoot scale-in + slight rotate.

### T11. Smart-zoom on speaker (Ken Burns vs. hard) **NEW**
- **Where:** 1w_H6uA3N-g @ 12:11–13:35
- **Visual:** two distinct zoom flavors — slow Ken Burns (1.0 → 1.08 over 90-120f), and harsh punch-in (1.0 → 1.15 over 4-6f then held).
- **Encoding:** new primitive **`smartZoom.ts`** exporting `kenBurns(frame, fps, durationS, factor)` and `punchIn(frame, factor, framesIn)`.

---

## 4. Creator examples cited by Tella

| Creator | Cited for | URL/handle if known | In our `references/creators/`? |
|---|---|---|---|
| Alex Hormozi | listicle hierarchy, animated tweet | @hormozi (YouTube) | NEW candidate |
| Ali Abdaal | YT community-post highlight, notes-app slide-up, age-bar chart | @aliabdaal | NEW candidate |
| Jay Klaus | ranked tier listicle with side-by-side host | @jay_klaus / Creator Science | NEW candidate |
| Shabam | app-icon connect + notification cascade | (not specified in transcript) | NEW candidate — needs handle resolution |
| Jeff Seuss | decision-tree mental-model | (not specified) | NEW candidate — needs handle resolution |
| Patrick | in-car visual hook (filming setting) | (not specified — only first name) | NEW candidate |
| Bella Freud / *Fashion Neurosis* | lying-down interview angle | @fashionneurosis | NEW candidate (interview-format only, not motion-graphics) |
| Grant (Tella's founder) | weird-t-shirts as visual hook | (Tella internal) | n/a |
| Alex on a budget | peel-a-grapefruit hands hook | @alexonabudget | NEW candidate |
| Liana Ava | call-center-mic visual hook | @lianaava | NEW candidate |
| Subway Takes | mic-on-subway-card visual hook | @subwaytakes | NEW candidate |
| Renee (Tella's editor reference) | Claude-Code-edits-videos workflow | (Tella internal credit) | n/a |

**Already in `references/creators/`** (from prior waves): `bilawal.ai`, `black.one.studio`, `builtbystephan`, `carloscuamatzin`, `diysmartcode`, `dotcsv`, `estebandiba`, `midu.dev`, `motiondarwin`, `motiongraphics_web`, `motiongraphicsweb`, `mr.eflow`, `simonhoiberg`, `zenzuke`. **None of Tella's cited creators are in there yet.** Top three to add next: Ali Abdaal (highest payoff — animated notes-app, community-post, and chart styles all in one channel), Alex Hormozi (animated-tweet + listicle), Jay Klaus (talking-head-plus-graphic side-by-side, our exact format).

---

## 5. Wave-5 priority queue

Ranked list of new primitives / molecules / templates to build next, with rough ordering by ROI (= how many Tella-style motion graphics each unlocks, weighted by how trivially they slot into our existing brand chrome).

| Rank | Item | Type | Unlocks | Effort |
|---|---|---|---|---|
| 1 | **`pathDraw.ts`** primitive (SVG `stroke-dashoffset` animator with ease) | primitive | T5 connector, T7 tree edges, future arrows, future Venn outlines | S |
| 2 | **`heldStagger.ts`** primitive (per-index reveal with dwell beats) | primitive | T3 ranked-tier listicle, T5 notification cascade, any "punctuate-one-tier-at-a-time" flow | S |
| 3 | **`smartZoom.ts`** primitive (Ken Burns + punch-in) | primitive | T8 spotlight, T11 speaker emphasis, future b-roll inserts | S |
| 4 | **`<NotificationToast>`** molecule | molecule | T5 app-connect, any "X just shipped" beat | S |
| 5 | **`<SocialPostCard>`** molecule (avatar/handle/body/media/counters chrome) | molecule | T2 animated tweet, T1 community-post highlight | M |
| 6 | **`<NotesAppFrame>`** molecule (iOS Notes chrome) | molecule | T4 notes-app slide-up, future receipt/journal compositions | S |
| 7 | **`<AppIconPair>`** molecule (icon + connector) | molecule | T5 app-connect, future "tool stack" reveals | S |
| 8 | **`<SpotlightZoom>`** molecule (rect-mask + outside-blur on `<Sequence>` content) | molecule | T8 spotlight (NB: Tella does this *in Tella, not Remotion* — we may decide to defer if our pipeline always passes through Tella anyway) | M |
| 9 | **`TweetCard9x16.tsx`** composition | composition | T2 | M |
| 10 | **`RankedTierList9x16.tsx`** composition | composition | T3 | M |
| 11 | **`AppConnect9x16.tsx`** composition | composition | T5 | M |
| 12 | **`VennDiagram9x16.tsx`** composition | composition | T6 Venn | M |
| 13 | **`DecisionTree9x16.tsx`** composition | composition | T7 | M |
| 14 | **`BrandedOpener9x16.tsx`** composition | composition | T9 — pairs with `BrandWatermark.tsx` for first-3s recognition | S |
| 15 | **Add Ali Abdaal, Alex Hormozi, Jay Klaus** to `references/creators/CREATORS.md` and run `npm run scrape:reels -- --handle <h> --count 12` for each | data | richer reference corpus for next prompt-engineering session | S |
| 16 | **Decision: should T8 (spotlight) be Remotion or Tella-only?** | ADR | clarifies whether our pipeline outputs source-ready-for-Tella vs. final-MP4 | S (writeup) |

**Process notes for the queue:**
- T1 (highlight-row) is intentionally absent — it overlaps with our existing `<TextEmphasis>` + `dimSiblings` and is a 1-hour job once the others land.
- T10 (reaction-meme insert) is deferred: it's a Tella/Claude *editing* concern, not a Remotion *rendering* concern. Slot it into our `src/pipeline/` instead.
- Items 1-3 (the three new primitives) should ship first — they collectively unblock items 4-14 and align with our `src/animation/` philosophy of a thin, composable primitive layer.

---

### 6. Dense-frame reference index

Second-pass dense extraction (2026-05-27) targets the animation-demo segments at 1 frame / 1.5s, with sparse 1 frame / 6s fill outside ranges. Per-video totals: **ykBDqicGx0M = 855 frames** (up from 15), **PrGYLd7yu1s = 395 frames** (up from 15), **wviYUDGhie4 = 143 frames** (up from 15). All under `docs/research/wave-5/tella-frames-dense/<id>/frame-NNNN-tNNNNNs.jpg` (4-digit index, 5-digit integer seconds).

The frames below were hand-picked as the highest-signal exemplars per technique after visually scanning the dense range. For each, the cited timestamp is exact (matches the filename); the *adjacent* frames (±1-2 indices) show the animation immediately before/after each beat — open them sequentially to see the motion progression.

#### T1 — Highlight-row-in-feed (community-post animator)
ykBDqicGx0M dense range `02:30–04:30` (81 frames in range).

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/ykBDqicGx0M/frame-0025-t00150s.jpg` | 150 | Tella prompts Claude with Ali Abdaal community-post reference (ffmpeg frame-extract command visible) |
| `tella-frames-dense/ykBDqicGx0M/frame-0041-t00174s.jpg` | 174 | Claude Code generating `TellaCommunityV2.tsx` — explicit timing constants `POST1_IN=10, POST2_IN=90, POST3_IN=200, HIGHLIGHT_START=110, HIGHLIGHT_END=230, CIRCLE_IN=240` |
| `tella-frames-dense/ykBDqicGx0M/frame-0073-t00222s.jpg` | 222 | Result: stacked Tella community posts ("Presets", "Migrations") — clean cards on white, talking-head pip top-right |
| `tella-frames-dense/ykBDqicGx0M/frame-0089-t00246s.jpg` | 246 | Side-by-side: rendered Remotion composition next to original reference for visual diff check |
| `tella-frames-dense/ykBDqicGx0M/frame-0143-t00332s.jpg` | 332 | Reference library Finder view — every animation example .mp4 Tella keeps as a corpus |

**Net new evidence:** the prompt explicitly states the animation timeline as named frame constants (POST1_IN, POST2_IN, …). Our pipeline should do the same — request Claude to produce labelled frame-constants block at top of every composition, not magic numbers inside `interpolate()`.

#### T2 — Animated tweet (post-card composition)
ykBDqicGx0M dense range `04:38–07:24` (111 frames).

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/ykBDqicGx0M/frame-0107-t00278s.jpg` | 278 | Reference tweet from "@danielmurphy" (cyan-tinted bg) opened in Tella editor |
| `tella-frames-dense/ykBDqicGx0M/frame-0125-t00305s.jpg` | 305 | Claude generating `TwitterPost.tsx` — visible Composition mounted at `<Composition id="TwitterPost" />` in Root |
| `tella-frames-dense/ykBDqicGx0M/frame-0161-t00359s.jpg` | 359 | Iterating: Claude reads tweet body line-by-line, regenerates with rolling-counter on like count |
| `tella-frames-dense/ykBDqicGx0M/frame-0197-t00413s.jpg` | 413 | Final tweet card rendered — avatar, handle, multi-line body, image scale-pop, like counter |

**Net new evidence:** the reference is a *static screenshot* of a tweet, NOT a video. Claude reconstructs the motion from a still — confirming Tella's claim that style transfers but motion must be specified verbally.

#### T3 — Listicle / ranked-tier hierarchy (Hormozi style)
ykBDqicGx0M dense range `07:32–13:56` (372 frames — the longest demo block in the video).

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/ykBDqicGx0M/frame-0219-t00452s.jpg` | 452 | Reference: Hormozi horizontal bar listicle (5 ranked bars, longest at top) |
| `tella-frames-dense/ykBDqicGx0M/frame-0265-t00521s.jpg` | 521 | Claude's first generation — bars all same length, no rank-by-length yet |
| `tella-frames-dense/ykBDqicGx0M/frame-0288-t00556s.jpg` | 556 | Result: horizontal bar listicle with `1, 2, 3, 4` indices ascending, two purple-filled "RECORD YOUR SCREEN" / "USE TELLA FOR FREE" rows highlighted |
| `tella-frames-dense/ykBDqicGx0M/frame-0357-t00607s.jpg` | 607 | Tier-grid variant — S/A/B/C/D/F rows with colored emoji prefix and item lists |
| `tella-frames-dense/ykBDqicGx0M/frame-0449-t00676s.jpg` | 676 | Claude's "Animation:" log block: "each row outline fades in just before its pills, then each blue pill springs in with a bouncy scale (stiffness 220, low mass) — snappy but not jarring" |
| `tella-frames-dense/ykBDqicGx0M/frame-0541-t00762s.jpg` | 762 | TierList composition mounted in Root with `durationInFrames=620, width=1920, height=1080` |

**Net new evidence:** spring config is **stiffness 220, low mass, "snappy but not jarring"** — adopt as default for our `heldStagger` reveal. The tier-grid variant (S/A/B/C/D/F) is a separate composition from horizontal-bar-list — we should build both, not one with a flag.

#### T4 — Notes-app slide-up
ykBDqicGx0M dense range `09:16–12:08` (231 frames; overlaps T3).

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/ykBDqicGx0M/frame-0326-t00584s.jpg` | 584 | Reference: Ali Abdaal "Daily Reading" iOS Notes screenshot |
| `tella-frames-dense/ykBDqicGx0M/frame-0364-t00612s.jpg` | 612 | Claude generates `DailyReading.tsx`, mounted with `durationInFrames=280` |
| `tella-frames-dense/ykBDqicGx0M/frame-0440-t00670s.jpg` | 670 | Final Notes-app chrome rendered with title + 4 list items + checkmark/circle bullets |

**Net new evidence:** duration is **280 frames @ 30fps = ~9.3s** for a 4-item Notes list — sets our default for `NotesAppList9x16` composition.

#### T5 — App-icon connect + notification cascade (Shabam-style)
ykBDqicGx0M dense range `14:04–16:42` (106 frames). HIGHEST-VALUE block — the per-beat frame table is fully visible.

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/ykBDqicGx0M/frame-0592-t00844s.jpg` | 844 | Reference: Shubham Sharma's Gmail + ChatGPT connect animation playing |
| `tella-frames-dense/ykBDqicGx0M/frame-0626-t00895s.jpg` | 895 | Asset Finder showing Gmail iOS 26.webp, ChatGPT Logo.png, Notifications.mp4 — confirming Tella's claim that real PNG assets are required |
| `tella-frames-dense/ykBDqicGx0M/frame-0716-t01034s.jpg` | 1034 | **GmailGPT composition with FULL FRAME-BY-FRAME TABLE visible:** `0-10 Fade in`, `10-50 Gmail icon bounces (spring), badge shows 1,237 in red`, `50-80 ChatGPT icon slides in from right`, `80-140 Dashed gradient line draws across with travelling white dot`, `145 White flash on connect + "connected" label fades in`, `155-210 Badge rockets from 1,237→0 (fast easing, slows near 0)`, `210 Badge snaps green, bounces, shows 0`. Also visible: `CONNECT_FLASH=145, COUNT_START=155` constants in the TSX above. |
| `tella-frames-dense/ykBDqicGx0M/frame-0660-t00946s.jpg` | 946 | Reference video playing in Tella editor at the moment the connection-flash happens |

**Net new evidence:** **THIS is the canonical spec for our `AppConnect9x16` composition.** The frame table at `t=1034s` is a complete timing recipe — we can literally copy the frame ranges 1:1 into our composition. The "badge rockets 1,237→0" animation is `rollingDigit.ts` with fast-then-slow easing (likely `cubic-bezier(0.4, 0, 0.2, 1)` reversed or `easeOutQuint`). The "white flash on connect" is a single-frame `opacity: 1 → 0 over 4f` overlay.

#### T7 — Decision-tree / pie split
ykBDqicGx0M dense range `16:47–17:55` (46 frames).

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/ykBDqicGx0M/frame-0698-t01007s.jpg` | 1007 | Reference: Jeff Seuss decision tree (3-branch fan-out from central node, dashed edges) |
| `tella-frames-dense/ykBDqicGx0M/frame-0716-t01034s.jpg` | 1034 | Same frame referenced under T5 — shows the workflow continuity (Claude is being prompted with `decision\ tree.mp4` as the next reference, name visible in terminal) |
| `tella-frames-dense/ykBDqicGx0M/frame-0725-t01048s.jpg` | 1048 | Claude generates `DecisionTree.tsx` |
| `tella-frames-dense/ykBDqicGx0M/frame-0734-t01061s.jpg` | 1061 | Final decision tree rendered — central node, 3 children, edges drawn with `pathDraw`-style stroke-dashoffset (no arrowheads — matches Tella's "Remotion struggles with arrows" rule) |

**Net new evidence:** the actual final composition uses **dashed-line edges with NO arrowheads**, with a small dot/chevron at the tip — matches our planned T7 encoding exactly.

#### T8 — Highlight-zoom + blur spotlight (Tella in-editor)
ykBDqicGx0M dense range `17:58–20:35` (105 frames). **All in Tella's editor — NOT Remotion.**

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/ykBDqicGx0M/frame-0744-t01078s.jpg` | 1078 | Tella editor with screen recording loaded; "Highlight" effect panel visible |
| `tella-frames-dense/ykBDqicGx0M/frame-0786-t01141s.jpg` | 1141 | Active highlight rect drawn around a UI element with blurred surround |
| `tella-frames-dense/ykBDqicGx0M/frame-0807-t01172s.jpg` | 1172 | Same effect at peak zoom — ~1.4× scale, ~8px Gaussian blur outside rect |

**Net new evidence:** **CONFIRMED — this is a Tella native effect, not Remotion.** Wave-5 ADR item #16 ("should T8 be Remotion or Tella-only?") can be resolved: **TELLA-ONLY**, defer indefinitely from our Remotion library. Our pipeline produces compositions destined to be re-encoded inside Tella, where this effect is already free.

#### T6a — Animated line graph
PrGYLd7yu1s dense range `04:30–06:32` (82 frames).

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/PrGYLd7yu1s/frame-0045-t00270s.jpg` | 270 | Pinterest reference (static line-graph image) |
| `tella-frames-dense/PrGYLd7yu1s/frame-0084-t00328s.jpg` | 328 | Claude renders growth line chart in Remotion — line drawing L→R with subscriber counter at the head ("12,500 subscribers") |
| `tella-frames-dense/PrGYLd7yu1s/frame-0110-t00368s.jpg` | 368 | Same chart after iteration: head counter swapped to Excel-driven CSV data |

#### T6b — Animated bar chart
PrGYLd7yu1s dense range `06:37–07:43` (45 frames).

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/PrGYLd7yu1s/frame-0128-t00397s.jpg` | 397 | Static bar-chart reference |
| `tella-frames-dense/PrGYLd7yu1s/frame-0146-t00424s.jpg` | 424 | Bars rising from baseline (mid-animation captured) |
| `tella-frames-dense/PrGYLd7yu1s/frame-0164-t00451s.jpg` | 451 | Final rendered bars with Q1-Q4 labels and rolling y-axis |

#### T6c — Animated Venn diagram
PrGYLd7yu1s dense range `07:55–09:55` (81 frames).

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/PrGYLd7yu1s/frame-0188-t00494s.jpg` | 494 | Two-circle Venn drifting in from sides, intersection label appearing last |
| `tella-frames-dense/PrGYLd7yu1s/frame-0214-t00534s.jpg` | 534 | Three-circle horizontal variant (favored for 16:9) |
| `tella-frames-dense/PrGYLd7yu1s/frame-0240-t00572s.jpg` | 572 | Final composition mounted in Studio sidebar |

#### T6d — Frame-by-frame description workflow
PrGYLd7yu1s dense range `10:14–13:13` (120 frames). **Meta-technique — Tella demoing the ffmpeg→Claude prompt loop.**

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/PrGYLd7yu1s/frame-0259-t00614s.jpg` | 614 | ffmpeg command in terminal extracting N frames from a video reference |
| `tella-frames-dense/PrGYLd7yu1s/frame-0299-t00674s.jpg` | 674 | Claude reading the extracted frames sequentially and writing a per-frame description |
| `tella-frames-dense/PrGYLd7yu1s/frame-0339-t00734s.jpg` | 734 | Generated Remotion comp matches the *style* (cream wavy background) but not the exact motion (subtle hand-wave that Tella says didn't transfer) |

**Net new evidence:** confirms our pipeline must EXTRACT frames first, NOT pass raw video to Claude. Add this as a default step in `src/pipeline/generate.ts` whenever a video reference is provided.

#### T9 — Visual hook bumpers (wviYUDGhie4)
Entire 3:33 video at 1 frame / 1.5s (143 frames).

| Frame | t (s) | Beat shown |
|---|---|---|
| `tella-frames-dense/wviYUDGhie4/frame-0000-t00000s.jpg` | 0 | Pink fluffy mic in frame — Tella's signature visual tic |
| `tella-frames-dense/wviYUDGhie4/frame-0017-t00026s.jpg` | 26 | Patrick "in-car" hook example overlay |
| `tella-frames-dense/wviYUDGhie4/frame-0034-t00051s.jpg` | 51 | Color hook — bright-shirt founder examples |
| `tella-frames-dense/wviYUDGhie4/frame-0068-t00102s.jpg` | 102 | Gear hook — Subway Takes microphone close-up |
| `tella-frames-dense/wviYUDGhie4/frame-0085-t00128s.jpg` | 128 | Angle hook — *Fashion Neurosis* lying-down interview |
| `tella-frames-dense/wviYUDGhie4/frame-0102-t00153s.jpg` | 153 | Hands hook — peel-a-grapefruit / makeup-while-talking |

**Net new evidence:** the host's pink mic is held in-frame for almost every second of the 3:33 video. Our `BrandedOpener9x16` composition should NOT be a 60-frame intro that disappears — it should be a *persistent prop overlay* (a small Armando-brand element pinned to a corner for the duration). Re-architect the planned T9 composition: less "bumper", more "persistent visual identity element".

---

#### Aggregate findings from dense extraction

1. **Tella's Claude-Code prompts produce a frame-constants block at the top of every composition.** Our pipeline should require this (already partially the pattern in our `src/animation/`).
2. **Spring config "stiffness 220, low mass" is the house default** for snappy entrances. Codify as `springs.snappy` in `src/animation/`.
3. **The Shabam app-connect at `t=1034s` is a literal frame-by-frame recipe** — `0-10 fade, 10-50 left icon spring, 50-80 right icon slide, 80-140 connector path-draw, 145 flash, 155-210 counter roll-down, 210 done`. Hard-code as the default `AppConnect9x16` timeline.
4. **No arrowheads anywhere in Tella's final compositions** — confirmed by visual inspection. Our T7 decision-tree must use a dot/chevron edge tip.
5. **T8 Highlight+Blur is Tella-native, not Remotion.** ADR-resolved: defer.
6. **Pinterest+screenshot is the dominant reference type** (not video) — Claude reconstructs motion from a still 6/8 times in the dense sample.

---

## Appendix: data provenance

- Whisper model: faster-whisper `small`, `compute_type=int8`, `device=cpu`, `language=en`, VAD filter on (min silence 500ms). Generated 2026-05-27 inside this worktree.
- Frame extraction (first pass): `ffmpeg -ss <t> -i <src.webm> -vf "scale=1280:-2" -pix_fmt yuvj420p -frames:v 1 -q:v 3`. 15 frames per HIGH video (the duration-aligned final frame is skipped because seeking to end-of-file is unreliable with this version of ffmpeg + webm). Output: `docs/research/wave-5/tella-frames/`.
- Frame extraction (second pass — dense, 2026-05-27): same ffmpeg invocation, but transcript-aware timestamp set. Inside any animation-demo range (see section 6 ranges) sampled at 1 frame / 1.5s; outside ranges at 1 frame / 6.0s; `wviYUDGhie4` sampled at 1 frame / 1.5s throughout. Per-video counts: ykBDqicGx0M = 855, PrGYLd7yu1s = 395, wviYUDGhie4 = 143. Output: `docs/research/wave-5/tella-frames-dense/<id>/`. Extraction script kept at `/tmp/tella-research/extract_dense.py` for reference but `/tmp/tella-research/videos/` deleted after extraction.
- Source downloads in `/tmp/tella-research/` were deleted after this synthesis was written. Only transcripts (.txt + .json) and 1280-wide JPG keyframes (both sparse and dense passes) were retained under `docs/research/wave-5/`.
