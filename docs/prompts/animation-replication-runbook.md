# Animation replication runbook — copying motion graphics from other creators

> **Why this exists.** Wave-5 Tella research distilled a precise workflow for taking an animation you saw in another creator's video and recreating it inside our Remotion + Claude Code stack. The pattern is *not* "prompt Claude for a cool animation" — it's a deliberate sequence anchored to a reference asset, fed to Claude with the transition described **in words**.
>
> **The rule that defines everything below:** Claude reads images frame-by-frame, **not as motion**. Style transfers from a reference image; choreography does not. Every prompt must include the transition verb explicitly.
>
> **Verbatim cite (ykBDqicGx0M.txt L143–148):** _"I find that sometimes it's really good at interpreting things like styles, but not necessarily at the animations or how you'd like the animation to happen. So it's kind of good initially to give Claude some context as to or as much context as possible about the animation. Just because it cannot really analyze more than frame by frame, right? So it doesn't necessarily understand the transitions."_

---

## 0. Setup (one-time per machine)

Per Tella (PrGYLd7yu1s.txt L11–32):

1. `cd ~ && npm create remotion` (Tella's path), pick **blank**, accept Tailwind, accept the **agent skills install** so the same `claude` CLI session can prompt the Remotion comp into existence.
2. Have Claude Code installed and signed in (Chrome extension is optional but helpful per ykBDqicGx0M.txt L12–14).
3. Open `~/my-video` (or your repo). Run `npm run dev` to launch the Remotion Studio in Chrome — Tella's preview surface.

> **Verbatim cite (PrGYLd7yu1s.txt L17):** _"and then yes and add agent skills to cloud right. So we want Remotion as a skill."_

---

## 1. Reference library (build this once, mine it forever)

Maintain a folder on disk — Tella keeps hers at `~/animation-examples/`. Every interesting animation you see goes into it as one of three kinds of file:

| Kind | When to use | How to capture |
|---|---|---|
| **Screenshot (.png/.jpg)** | The animation is a static-feeling lower-third, card, or layout you want to mimic shape-for-shape | macOS screenshot, CleanShot, or Tella's screenshot mode |
| **Screen-recorded clip (.mp4 / .mov)** | The animation involves motion — bars rising, items sliding, icons connecting | Tella's screen-record button on the source video, OR QuickTime, OR CleanShot |
| **Pinterest GIF/MP4** | The reference is a static or looping diagram you want to bring to life | Save the GIF/MP4 from Pinterest directly into the inspo folder |

> **Verbatim cite (ykBDqicGx0M.txt L21–22):** _"I definitely recommend having a folder like this with videos or screenshots of motion graphics that you'd like to recreate."_
>
> **Verbatim cite (PrGYLd7yu1s.txt L43–46):** _"The first place I go to for inspiration for motion graphics or diagrams that I'd like to animate using remotion is Pinterest. Now you might think that most things on there are static and that is true but that's okay. We can actually animate a static image."_

### Where our reference library actually lives

We DON'T mirror Tella's `~/animation-examples/`. Our equivalent is `references/creators/<handle>/<shortcode>/frames/` — extracted JPG keyframes at the points the creator demos a motion. The `ANALYSIS.md` per creator is the prose distillation; the `frames/` directory is the visual library. Wave-4 already produced 1,168 frames across 14 creators. **When you see a new motion-graphic you want in our brand, add the creator (or video) here and run `npm run scrape:reels` / `npm run analyze:creator` so the visual evidence is committed to the repo, not just on disk.**

---

## 2. Per-recreation prompt structure

This is the contract for asking Claude Code to recreate any motion graphic. It has six required sections — in this exact order:

```
1. The reference. ABSOLUTE PATH to the screenshot or screen-recorded clip.
2. (If the reference is a video) — "Use ffmpeg to analyze each frame of this video."
3. The transitionVerb. ONE sentence in imperative voice describing what moves and how. (See §3.)
4. The content. What text / numbers / images go in the OUR version (specific to your script).
5. The constraints. Output frame size (1080×1920 default), durationInFrames, font, palette.
6. The composition target. Either "create a new composition called <Name>" or "modify <existingPath>".
```

> **Verbatim cite (ykBDqicGx0M.txt L44–46):** _"So here we're saying that it should use a tool called FFMPEG to analyze this video. Typically, it already knows to do this, but it's good to specify just in case if this is the first time."_
>
> **Verbatim cite (PrGYLd7yu1s.txt L103–105):** _"so we're just going to use a tool called ffmpeg to analyze each frame of the video that we've provided and ask Claude to create a similar animation."_

### 2.1 The transitionVerb rule (this is the whole game)

Every prompt MUST include a single sentence — in imperative voice, present tense — that describes the choreography. Style transfers from the image; choreography does not.

✅ **Good transitionVerbs:**
- "Each list item slides up from below one-at-a-time, each held 12 frames before the next starts."
- "Two app icons slide in from opposite sides, then a line draws between them L→R over 16 frames, then 3 notification toasts drop from the top in 4-frame succession."
- "The Venn-diagram circles drift in from off-frame and overlap; the center-intersection label fades in last."
- "The animated tweet renders as: avatar scale-pops, then handle slides in from the left, then body reveals line-by-line, then the attached image scale-pops, then the like-count rolls up."

❌ **Bad transitionVerbs (Claude can't act on these):**
- "Make it animated" (no choreography)
- "Make it cool" (no style or motion described)
- "Like the reference" (Claude only sees still frames — see The Rule)
- "Smooth animation" (no specifics — what slides where, in what order, for how long)

> **Verbatim cite (ykBDqicGx0M.txt L155–156):** _"Okay, so I just told it to make each list item appear one by one from the bottom to the top, so let's see if it can do that. I don't want the scrolling effect."_

### 2.2 Under-prompt FIRST, then iterate

Tella's heuristic (PrGYLd7yu1s.txt L82–84): when starting a recreation, give Claude **only** the reference + the transitionVerb. See what it produces. Then iterate with corrections. Don't pre-emptively specify every color, font, and spring config — you'll over-constrain Claude away from what the reference image is already telling it.

> **Verbatim cite:** _"I find that the best thing to do is just to give it an image and see what Claude comes up with first because the more information you give it initially the further away or the more room for interpretation there is for Claude."_

---

## 3. Asset specifics (per pattern type)

### 3.1 Community / tweet card animations

- **You need:** screenshot of your own community/post + screenshot of the reference creator's animation.
- **transitionVerb template:** "Highlight the Nth row with a colored underline and halo; dim sibling rows to 0.35 opacity."

### 3.2 App-icon connect + notification cascade

- **You need:** PNG files of every app logo. Do **not** ask Claude to "imagine" the logo — pass the file.
- **transitionVerb template:** "Icon-left and icon-right slide in from opposite sides; a [line | arc] draws between them; N notification toasts drop from the top in succession, each held 30 frames."

> **Verbatim cite (ykBDqicGx0M.txt L205–209):** _"When it comes to apps, I have noticed that you need to give it the actual image of the app, right? So the GPT logo as well as the Gmail logo."_

### 3.3 Listicle / ranked hierarchy

- **You need:** one screenshot of the reference creator's tier visual + your own list content.
- **transitionVerb template:** "Items appear bottom-to-top, each item slides from translateY(20) → 0 over 10 frames, then holds 14 frames before the next item starts (NOT a continuous stagger)."

### 3.4 Notes-app slide-up

- **You need:** screenshot of your own iOS Notes (or equivalent) page.
- **transitionVerb template:** "Each list item rises from translateY(60) → 0 with a slight overshoot spring, one at a time, ending in a held idle on the final item."

### 3.5 Decision-tree / pie split

- **You need:** screenshot of the reference creator's diagram + your own node labels.
- **transitionVerb template:** "Central node fades in first; child edges draw outward via stroke-dashoffset over 18 frames; labels fade in AFTER their edge completes; place a static dot or chevron at each edge tip — DO NOT animate arrowheads."

### 3.6 Animated tweet / social post card

- **You need:** screenshot of the tweet + the tweet's avatar PNG + the tweet's attached media PNG.
- **transitionVerb template:** "(i) avatar scale-pops 0→1 over 8 frames, (ii) handle + name slide in from left over 12 frames, (iii) body text reveals line-by-line at 6-frame stagger, (iv) media image scale-pops 0.9→1 with shadow blur-in, (v) like / retweet counters roll up."

### 3.7 Animated line / bar / Venn chart

- **You need:** static reference image of the chart + your own data (Excel, CSV, or inline literal).
- **transitionVerb template (line):** "Line draws from left to right via stroke-dashoffset; a head-of-line counter ticks the value as the line draws."
- **transitionVerb template (bar):** "Each bar rises from baseline with eased height; axis labels reveal 4 frames after the bars settle."
- **transitionVerb template (Venn):** "Each circle drifts in from off-frame, alpha-blending where they overlap; the center-intersection label fades in last."

---

## 4. Anti-rules (the things Tella explicitly warns against)

1. **Don't animate arrowheads.** Use a static dot or chevron at edge tips instead.
   > **Verbatim cite (ykBDqicGx0M.txt L254–258):** _"Now I will preference this by saying it uses arrows. And I've noticed that Remotion doesn't do an amazing job at arrows. It kind of shows the pointy bits of the arrow too quickly or in strange places."_

2. **Don't try to recreate complex blur / highlight / spotlight effects in Remotion.** Do them in Tella (or your post tool). Our `<SpotlightZoom>` molecule exists as a Remotion-side approximation for the cases where post-edit isn't an option — but Tella does it better.
   > **Verbatim cite (ykBDqicGx0M.txt L273–279):** _"now I'm going to show you one of the cool animations that you can actually create within Tella… which are blurs and highlights that are really hard to recreate while using Remotions."_

3. **Don't ask Claude to "make an animation."** Every prompt has a reference image AND a transitionVerb sentence. No exceptions.

4. **Don't over-prompt on the first attempt.** Reference + transitionVerb only. Iterate on result.

5. **Don't expect Claude to infer motion from a video.** Always pre-extract frames via ffmpeg first, even if Claude says it can analyze a video.
   > **Verbatim cite (PrGYLd7yu1s.txt L96–104):** _"we can't upload video directly to Claude so we just need to analyze it frame per frame… we're just going to use a tool called ffmpeg to analyze each frame of the video that we've provided and ask Claude to create a similar animation."_

---

## 5. Export pipeline (Remotion → final video)

Once the composition looks right in Remotion Studio, export per Tella (PrGYLd7yu1s.txt L116–123):

1. **Render at the highest quality the downstream tool will accept.** Tella renders ProRes `.mov` because she's uploading into Tella's editor as a clip. We render H.264 `.mp4` by default because our pipeline (`scripts/render-*.ts`) goes through `loudnorm` and `-c:v libx264` for distribution.
2. **Use it as a chapter break / title page / b-roll insert.** Per Tella (PrGYLd7yu1s.txt L122): _"For now in Tella this works best for title pages."_ In our pipeline this means a Remotion-generated clip is either (a) the whole video, or (b) a B-roll insert composed into a parent template like `KeyedFounderOverBroll9x16` or `GenerativeBrollWithDiegeticUI9x16`.

> **Verbatim cite (PrGYLd7yu1s.txt L117–119):** _"Now once we're done and we're ready to use this we're gonna go ahead and render this and we select the quality here. Alright let's go ahead with the highest quality pro res and let's call this .move"_

---

## 6. Where this runbook lives in our process

- **You're about to copy a motion graphic from another creator → read this file from top to bottom.**
- **You're writing a new template under `src/compositions/` → bake a `transitionVerb` field into the Zod schema** (Wave-5 contract: this is the documentation the prompt-engineering pass uses to keep the choreography description in sync with the code).
- **You're handing a template to a content writer → tell them to read §2 + §3** so they know what reference materials they need to gather before asking Claude for a new variant.
- **You're reviewing a generated comp that "looks off" → check the transitionVerb prop first.** If it's vague, that's why.

---

## Appendix — the small reusable transition-verb vocabulary

These verbs/phrases recur across every Tella example. Use them verbatim when they fit; pair them when you need a composite move.

| Verb / phrase | Frames | Where it shines |
|---|---|---|
| **slides up from below** | 8–12 | Notes-app items, listicle entries, lower-thirds |
| **scale-pops** | 6–10 | Avatar, app icon, image card, "stamp" moments |
| **rolls up** | 18–24 | Counters, percentages, durations |
| **draws via stroke-dashoffset** | 12–18 | Lines, arrows, decision-tree edges, Venn outlines |
| **drifts in from off-frame** | 14–22 | Venn circles, hero illustrations, b-roll plates |
| **drops from above** | 6–10 | Notification toasts, alert pills, banner CTAs |
| **dims sibling rows** | 6–10 | Community-post highlight, search-result row pick |
| **held [N] frames** | 12–60 | Tier-by-tier dwell beats; the entire point of §3.3 |
| **fades in line-by-line** | 6 per line | Body text reveal in a card |
| **center-out reveal** | 14–20 | Logo wordmarks, hero typography, lower-thirds |

When you write a `transitionVerb` string into a schema's default, prefer these terms — they're the words the rest of our compositions will recognize.
