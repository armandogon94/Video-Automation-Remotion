# @simonhoiberg — visual + motion analysis

> **Creator:** Simon Høiberg — Danish bootstrapped-SaaS founder (FeedHive, OpenClaw). ~44K IG followers, English-language. Studio look: dark loft with warm string lights + brick + cool fluorescent tube + Calvin Klein knitwear, photographed in a desk-cam ¾ frame. Pentagram-style restraint with one warm/cool accent per video.
> **Scraped:** 2026-05-24 via gallery-dl (`/reels/` endpoint, NOT the regular feed). First scrape attempt against `instagram.com/simonhoiberg/` returned only JPGs because **his recent feed is ~70% essay-image text posts**, not reels; the regular endpoint also 401'd on `--count 20`/`30` after returning the JPG batch. Switching to the `/reels/` URL got 12 MP4s on the first try.
> **Template-value verdict:** **MIXED — narrow but two patterns are gold.** 8/12 reels are an undecorated studio talking head with NO captions, NO motion graphics, NO B-roll overlays — Simon trusts his face + voice + Instagram caption to carry the message. The graphic-design discipline only kicks in on his **higher-effort "framework" reels (DPBv4qMkmXE, DPT3n_PgEiU)** where he uses two distinctive templates we should steal. Total: **6 distinct templates** identified, but only 2 are reproducible in Remotion at a level worth speccing.

This is the opposite of Carlos (graphics-first) or midu (callout-driven). Simon's IG is a **content brand**, not a motion-design brand. The lesson is: when he DOES reach for graphics, he picks the right tool, uses one purple accent, and never decorates. That restraint is the replicable asset.

---

## Templates observed

### Template A — TalkingHeadStudio (dominant, 8/12 reels)
**Reels using it:** `DM0MxiTOu-p`, `DMsj5dNPzK3` (between cutaways), `DN5lzNDjMkV`, `DNDqoVHRlsq`, `DNVjkdEsKAj`, `DNnr51Mqp75`, `DOdy8xIjH-A`, `DQb8u0vihLC`.

**Visual structure (top → bottom):**
- **Bg:** Recognizable Copenhagen-loft studio — exposed light-gray painted brick, long cool-white fluorescent tube horizontal upper-left, warm string lights swag along the top edge, dark wood desk in foreground with a black drawing tablet + pen + blank A4 paper + iPhone props (always the same arrangement — it's a set).
- **Subject:** Simon centered in ¾ frame from mid-chest up, slightly off-axis pose (looking left of camera, not directly into lens). Wardrobe rotates between **charcoal Calvin Klein crewneck**, **gray merino crewneck**, **navy ribbed sweater** — all monochrome cool tones, no logos visible beyond a faint `CK` chest mark. Glasses on the more recent ones (post-2025-09).
- **No on-screen text, no captions, no breadcrumb, no watermark, no handle, no end-card.** The caption work happens in the IG description, not the video.

**Motion grammar:**
- Static locked-off camera the entire clip. No zoom-ins, no jump-cuts (rare cuts between two takes of the same setup).
- The ONLY motion is Simon's gestures + facial expression. He uses very expressive hands ("explaining shapes in the air") and his eyes flick to camera at key beats.
- No music bed visible from frames (likely VO-only or low-bed).

**Map to our Stream-E typology:** **Not a template we'd build.** This is "raw founder talking-head" — we don't have a face-cam workflow and our `TalkingHead` composition serves a different purpose (avatar-pixar + AI voice). The closest equivalent in our system is leaving the screen blank and letting voice + caption carry, which would defeat the purpose of using Remotion.

**Recommendation:** **Don't replicate.** Note this as a discipline reminder — Simon's editorial restraint is the lesson. Most reels need ZERO graphics if the script is strong enough. Don't decorate to fill space.

---

### Template B — LayerCardStack (2/12 reels, high replication value)
**Reels using it:** `DPBv4qMkmXE` (vibe coding cold-open), `DPT3n_PgEiU` (AI agents for coding cold-open + recurring beat).

**Visual structure:**
- **Bg:** the studio shot, **heavily blurred + warm-tinted** to push it behind a glassmorphic plate. This is a B-roll-as-backdrop trick — the original studio frame becomes pure ambient texture.
- **Centerpiece:** **3 horizontally rounded white cards stacked vertically**, ~85% frame width, ~24 px corner radius, soft 30%-opacity drop shadow, each card ~25% of frame height with ~16 px vertical gap between cards.
- **Per-card content (left → right):** small square colored icon at left (pixelated/stylized app icon, ~64 px), then a **purple-filled rounded badge** containing white bold text `Layer 1` / `Layer 2` / `Layer 3`, then the layer name in **black bold sans** below the badge (`Vibe Coding`, `AI Agentic Coding`, `AI-Assisted Coding`).
- **Color accent:** electric purple **`#5B2EE5`** for the badge fill — the SAME purple shows up in his end-card thumbnail mockup and in the screen-recording UI glows below. **One accent color per reel.**
- Typography: looks like a geometric sans (DM Sans or Plus Jakarta Sans), heavy/bold weight.

**Motion grammar:**
- Cards likely fade-up + slight-rise-from-below in stagger (frame 00 already shows all 3 cards present, so the reveal happens in the first ~600 ms — would need higher fps sampling to confirm).
- Static once placed. The blurred studio backdrop has subtle parallax/breathing motion from the original 24 fps video underneath.

**Map to our Stream-E typology:** **NEW — propose `LayerCardStack9x16` as Stream-E template #17.** Closest existing slot is our `Listicle` composition but that's a per-item full-screen card; this is a *single-frame triple-card stack* (all 3 visible at once — comparison, not enumeration). Different intent, different layout.

**Recommendation: ADD `LayerCardStack9x16` to the typology.** ~150 lines:
- Reusable `<StackCard>` component with props `{icon, badge: {text, color}, label}`.
- Composition accepts an array of 2-4 cards (3 is the sweet spot per Simon's usage).
- Backdrop is either solid (palette-default dark) OR a `<Video src={broll}>` with blur(20px) + brightness(0.5) for the glassmorphic look.
- Accent color is a single prop driving all badge fills — enforces the "one accent per video" discipline.
- Optional staggered entrance: `interpolate` opacity 0→1 + translateY 24px→0 with 120ms stagger between cards.

**Why this matters:** This is the cleanest "framework intro" pattern I've seen in the reference set. It compresses a 3-tier taxonomy into one static glance, then the VO unpacks each tier in the talking-head segments that follow. Perfect for "3 types of X" or "AI's 3 layers" Spanish-language reels. Highest ratio of "informational density ÷ visual noise" in this entire scrape.

---

### Template C — DeviceMockupBroll (2/12 reels)
**Reels using it:** `DPT3n_PgEiU` (multiple beats — Forgejo issues page + Hashtag Manager on Macbook), `DPBv4qMkmXE` (PromptVault on his desk monitor).

**Visual structure:**
- **Bg:** pure near-black `#0A0A0F`, faint purple radial-gradient halo bleeding in from off-screen-left.
- **Centerpiece:** physical-device B-roll shot — a **closed-frame Macbook Pro from a 3/4 angle** OR his **27" monitor at a low angle** — with the actual screen content visible. The screen recording is composited onto the display in perspective (likely shot in-camera with the recording playing on the real device, NOT post-corner-pinned).
- **HUD:** none. No HUDs, no labels, no callouts on top — the artifact speaks for itself. The "MacBook Pro" lettering on the laptop case is visible naturally.
- **Color accent:** purple `#5B2EE5` again, this time as a soft monitor glow + occasional UI element inside the recording (Cursor's purple, etc.).

**Motion grammar:**
- Mostly static camera, BUT very slight slow drift/dolly suggests gimbal or slider — adds depth without distracting.
- Cursor moves naturally inside the screen recording (real interaction, not post-animated).
- ~3–5 s per shot before cutting to next beat (face-cam or another device shot).

**Map to our Stream-E typology:** **partial overlap with planned `SplitWebcamScreen9x16`** but with one critical difference: Simon doesn't show his face + screen split — he shows the *device itself*. This is a "B-roll style screen reveal" that gives a recording physical presence.

**Recommendation:** **build as a variant of `SplitWebcamScreen9x16`** (call it `mode: 'device-broll'`). The hard part isn't the composition — it's having clean device B-roll stock footage. We'd need to either:
- (a) Use stock Macbook/monitor B-roll (Pexels has decent options) + post-corner-pin our screen recording onto the display rect via Remotion's `transform: matrix3d()`.
- (b) Skip the physical-device illusion and just render a clean dark-bg + screen recording with a subtle drop shadow (cheaper, 80% of the visual impact).

Option (b) is the pragmatic call. ~60 lines, no stock-footage dependency.

---

### Template D — StackedTripleQuote (1/12 reels)
**Reel using it:** `DQWsK-UCnTq` (AgentBuilder vs n8n review).

**Visual structure (top → bottom, 3 stacked panels):**
- **Top panel (~25%):** a LinkedIn post screenshot — `Shabbir Nooruddin` avatar + name + verified badge + `"n8n is dead. And that's a good thing."` headline. Cropped to the relevant text only, dark-themed (his LinkedIn was on dark mode).
- **Middle panel (~35%):** screen recording of OpenAI's AgentBuilder canvas — dark theme, agent nodes with `Agent 1: Simple Web Search`, `Web Search`, `Chat Model`, `Memory`, `Tool` labels, dotted connection lines. The recording plays continuously as Simon talks over it.
- **Bottom panel (~40%):** standard TalkingHeadStudio face-cam with the studio backdrop visible behind him. Simon's eyes look up at the screen recording above him (he's literally responding to it).

**Motion grammar:**
- Three stacked rectangles, no animation between them — they're all on screen for the duration of the segment.
- Only the middle panel (screen recording) has motion. Top and bottom are essentially static (the face-cam has natural movement but no graphic changes).
- Cuts between this triple-stack and a full-screen face-cam shot for "I think..." commentary beats.

**Map to our Stream-E typology:** **NEW — propose `ReactionStack9x16` as Stream-E template #18.** Closest existing template is `TweetCardHero9x16` (Bilawal's pattern) but with two differences: (1) the social-post screenshot here is a real LinkedIn post not a composed tweet, (2) the bottom face-cam is essential — it visually anchors "this is my reaction to that."

**Recommendation:** **build as a follow-on to `TweetCardHero9x16`** once that ships. ~140 lines, composition is:
- `25% top: <SocialPostScreenshot src=...>` (rounded clip, drop shadow, just an image not a real-time render).
- `35% middle: <OffthreadVideo src={demo}>` (the artifact, with rounded corners).
- `40% bottom: <Video src={faceCam}>` OR fallback to a `<DiagramCanvas>` for our avatar-pixar use case.

For OUR avatar-pixar workflow (no real face-cam), the bottom slot could host an animated avatar pose or a `BigNumberHero`-style stat callout reacting to the source above. Worth thinking about — this is a strong "I'm reacting to this take" reel format.

---

### Template E — WhiteboardMarkerList (1/12 reels)
**Reel using it:** `DMsj5dNPzK3` (2 million AI models — beat at ~59 s).

**Visual structure:**
- **Bg:** flat **light-gray `#D8D8DA` paper texture**, no shadows, no plates. Looks like a Notability scribble or a real hand-marker page.
- **Content:** category headers in **black hand-drawn marker** (`Cursor`, `Marketing`, `Ops/Automation`...) each followed by 2-3 product entries. Each entry = real brand-color product logo (Cursor logo, Kling AI gradient ring, FeedHive cubes, n8n red-pink swirl, Replit gold cube) + product name in the same hand-marker font.
- **Color accent:** none from Simon — the colors come from the *brand logos themselves* which act as natural accent variety against the neutral gray. Pentagram-restraint applied to a kid's-drawing aesthetic.
- Typography: a marker/handwriting display font (likely Caveat, Permanent Marker, or a custom Apple Pencil scribble).

**Motion grammar:**
- Items likely fade in / draw-on per category in sequence (would need higher fps to verify the stroke-on animation).
- Background is completely static.

**Map to our Stream-E typology:** **NEW — but NICHE.** Closest existing slot is `DiagramExplainer9x16` if we added a "hand-drawn" mode, but the friendly-paper aesthetic is a big visual departure from our editorial-Bloomberg house style. Worth noting because it's a recognizable creator-pattern (also seen in some `@nathanbarry` and `@aliabdaal` reels) but not aligned with @armandointeligencia's serious-business positioning.

**Recommendation:** **skip — wrong tone for our brand.** Keep as a reference for if/when Armando ever spins up a casual/educational lane that needs a softer, "explainer doodle" vibe. ~100 lines if we ever build it (handwriting-font asset is the bottleneck — Caveat is free on Google Fonts).

---

### Template F — YouTubeEndCard (1/12 reels)
**Reel using it:** `DPT3n_PgEiU` (final 2 s).

**Visual structure:**
- Blurred studio backdrop, dimmed ~50%.
- Center: red **YouTube play-button icon** + `Watch Now` in white bold sans.
- Below: a mocked-up **YouTube thumbnail** (16:9 image) showing Simon's face-cam on the left + the `AI Coding` title + the LayerCardStack pattern from Template B on the right + `#1 #2 #2` numbered breadcrumbs on the cards.
- Bottom: `@SimonHoiberg` handle in white bold sans.

**Motion grammar:**
- Static end card, displayed for ~2 s before reel loops.

**Map to our Stream-E typology:** **cross-platform CTA pattern.** Not a Remotion template per se — it's a closing card composition. We don't currently have a "redirect-to-YouTube" workflow (Armando's primary distribution is Reels/Shorts native, not YouTube long-form). Skip unless we add a YouTube channel.

**Recommendation:** **defer.** Revisit if @armandointeligencia ever launches a YouTube long-form channel and wants cross-promotional end cards on the reels.

---

## Cross-template "house grammar"

| Pattern | Where it appears | Replicate for us? |
|---|---|---|
| **One accent color per reel (electric purple `#5B2EE5`)** | B, C, F — also bleeds into the LinkedIn-dark, screen-rec UI accents | **Yes — already our discipline.** Simon confirms what midu showed: commit to ONE accent. He picks purple as a sort-of-brand color across multiple framework reels. |
| **Dark + cool palette with single warm-glow accent** | All graphic reels, all talking-head bg (the warm string lights are the only warm element in an otherwise blue-cool environment) | **Yes — adopt as our `DarkEditorial` mode default.** Reinforces what Bilawal showed. |
| **Pure restraint: NO captions, NO subtitles, NO breadcrumbs on most reels** | A (8/12) | **Don't fully replicate.** Our audience is Spanish-speaking on muted feeds — captions earn the watch. But the lesson is: don't decorate. If a beat doesn't need a graphic, don't put one there. |
| **Glassmorphic blurred-studio backdrop behind clean cards** | B | **Yes — adopt for our `LayerCardStack` build.** Cheaper than designing a custom gradient bg, gives instant depth + warmth. |
| **Physical-device B-roll for screen recordings** | C | **Aspirational** — needs real Macbook B-roll. Use option (b) above (clean dark bg + rounded recording + drop shadow) as the pragmatic substitute. |
| **Pentagram-style typography: one geometric sans, one weight (bold), sentence case** | B, D, F | **Yes — matches our Inter discipline.** Simon uses DM Sans / Plus Jakarta Sans, we use Inter — visually equivalent. |
| **No animated transitions inside a graphic frame** | B, C, D | **Yes — already a stated discipline.** Cards appear, they stay, they leave. No mid-clip motion graphics. |
| **No avatar / no watermark / no logo** | All | **Doesn't apply.** Simon's face IS the watermark (talking-head-heavy). Armando uses an avatar-pixar watermark for content-brand recall — different positioning, keep ours. |

---

## What we replicate (priority for our 15-template build)

| Priority | Simon pattern | Our template slot | Already specced? |
|---|---|---|---|
| 🔴 **1 (next sprint)** | LayerCardStack — 3-card vertical comparison stack on glassmorphic bg | NEW `LayerCardStack9x16` | **No — propose adding as template #17 / Stream E.** Highest informational-density-per-frame pattern in this scrape. Trivial to build. |
| 🟠 2 | DeviceMockupBroll (pragmatic variant: dark bg + rounded screen rec + shadow) | Variant of planned `SplitWebcamScreen9x16` (`mode: 'screen-only-dark'`) | Yes — add as a mode |
| 🟡 3 | ReactionStack — social-post + artifact + face-cam triple stack | NEW `ReactionStack9x16` | No — build AFTER `TweetCardHero9x16` ships (it's a sibling pattern). Spanish-language adaptation could be `tweet → AgentBuilder/Cursor/Claude demo → avatar reaction`. |
| ⚪ 4 | WhiteboardMarkerList | NEW `WhiteboardMarkerList9x16` | No — wrong tone for our brand. Skip. |

---

## Concrete next steps

1. **Spec `LayerCardStack9x16` as template #17 in the Stream-E roadmap.** Single composition, props: `{cards: Array<{icon: src, badge: {text, color}, label: string}>, backdrop: {kind: 'video' | 'color', src?}, accent: '#5B2EE5'}`. Glassmorphic backdrop, stagger fade-up entrance, static once placed.
2. **Audit our pending `SplitWebcamScreen9x16` spec** to add a `mode: 'screen-only-dark'` variant — pure dark bg + rounded screen recording + soft drop shadow, no face-cam. Captures Simon's DeviceMockupBroll pattern without needing physical-device stock footage.
3. **Content-strategy note:** Simon's reels validate the thesis that **most "framework explainer" reels need exactly 2 visual modes** — (1) a clean static information frame (LayerCardStack) and (2) a face/voice delivery layer (which for us = avatar + caption, not face-cam). The rest of the visual budget should go to ONE cinematic moment (DeviceMockupBroll equivalent) per reel.
4. **Scraping note for the registry:** Simon's regular feed endpoint is unreliable (mostly text-as-image essay posts + paginates to 401 quickly). **Always use the `/reels/` URL for him** — confirmed working on 2026-05-24. Update `scrape-reels.py` someday to fall back from `instagram.com/<handle>/` to `instagram.com/<handle>/reels/` if the first call returns >50% jpgs.

---

## Per-reel index

| Shortcode | Duration | Date | Template | Likes | Notes |
|---|---|---|---|---|---|
| `DBMBFjoCy1N` | 39 s | 2024-10-16 | TalkingHead + rotating B-roll bg (variant A) | 186 | "SaaS Factory" — older style, B-roll backdrops (Amazon warehouse, server room) behind the face. Highest-liked reel in scrape. |
| `DMsj5dNPzK3` | 104 s | 2025-07-29 | A → E mid-cut | 41 | "2 million AI models" — only reel with WhiteboardMarkerList (Template E) inserted between talking-head segments. |
| `DM0MxiTOu-p` | 121 s | 2025-08-01 | A | 30 | Kling AI for visual content |
| `DNDqoVHRlsq` | 99 s | 2025-08-07 | A | 45 | "Cursor for [x]" pitch critique — pure talking-head |
| `DNVjkdEsKAj` | 100 s | 2025-08-14 | A | 30 | "cat-and-mouse tools" / AI detector hate |
| `DNnr51Mqp75` | 55 s | 2025-08-21 | A | 25 | "Fast Fashion Era of SaaS" |
| `DN5lzNDjMkV` | 55 s | 2025-08-28 | A | 24 | First-mover advantage critique |
| `DOdy8xIjH-A` | 84 s | 2025-09-11 | A | 28 | Paid ads defense |
| `DPBv4qMkmXE` | 118 s | 2025-09-25 | A + B (LayerCardStack cold-open) + C (PromptVault on monitor) | 92 | "AI now writes 90% of our code" — 2nd-highest-liked, deploys the most templates of any single reel. |
| `DPT3n_PgEiU` | 158 s | 2025-10-02 | A + B + C (multiple device shots) + F (end-card) | 56 | "AI Agents for coding" — longest reel, full template deck. The reference reel for B and C. |
| `DQWsK-UCnTq` | 53 s | 2025-10-28 | A + D (StackedTripleQuote at ~38 s) | 35 | "AgentBuilder vs n8n" — only reel with the LinkedIn-reaction triple-stack pattern. |
| `DQb8u0vihLC` | 75 s | 2025-10-30 | A | 18 | "Humanoid robots / Figure 03" — pure talking-head |

---

## Sources for replication

- Frames per reel: `references/creators/simonhoiberg/<shortcode>/frames/frame-NN-tXX.XXs.jpg`
- Original videos: `<shortcode>/video.mp4`
- Metadata + caption + likes: `<shortcode>/metadata.json` (`description` field has full IG caption — Simon's captions are essay-length and corpus-worthy for "founder-voice take" prompt-engineering)

To re-scrape and refresh: `gallery-dl --range 1-12 --write-metadata --write-info-json -D references/creators/simonhoiberg -f '{shortcode}-{num}.{extension}' 'https://www.instagram.com/simonhoiberg/reels/' && python scripts/extract-keyframes.py --handle simonhoiberg --frames 8`. Note the `/reels/` URL suffix — the bare profile URL returns essay-image JPGs and 401s on pagination.
