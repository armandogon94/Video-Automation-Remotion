# Motion Graphics Analysis: Austin Marchese, "18 Things You Didn't Know Claude Code Could Do" (Reviewer #3 - Gemini 3.5 Flash)

> **Reviewer Status:** Independent Evaluation (Reviewer #3)  
> **Workspace:** [Deep Research Worktree](file:///Users/armandogonzalez/Downloads/Claude/Deep%20Research%20Claude%20Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b)  
> **Reference Transcripts:** [austin.marchese/t9il-BN2wtM/transcript.txt](file:///Users/armandogonzalez/Downloads/Claude/Deep%20Research%20Claude%20Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/austin.marchese/t9il-BN2wtM/transcript.txt)  
> **Contact Sheets:** [austin.marchese/t9il-BN2wtM/sheets/](file:///Users/armandogonzalez/Downloads/Claude/Deep%20Research%20Claude%20Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/references/creators/austin.marchese/t9il-BN2wtM/sheets/)  

## Independent Verdict (Reviewer #3)

As Reviewer #3, I have conducted an independent frame-by-frame analysis of the contact sheets and raw keyframes for video `t9il-BN2wtM`. I **CONFIRM** the consensus reached by Reviewers #1 (Opus) and #2 (Codex) that the motion-graphics system in this video is a warm-color reskin (relying on a burgundy/magenta/gold palette) of the `nateherk` liquid-glass system. There are no net-new layout templates that represent a design gap; instead, the visual identity is driven by styling specifications, Claude Code terminal wrappers, and prompt pedagogy layouts.

However, I challenge the simplification that this is a static palette swap, and flag the following critical craft signatures visible in this video:

*   **Lit 3D Specular Orbs:** Unlike other videos in the corpus, this video fumbles or omits the heavy 3D specular orbs, relying instead on flat pill indicators or standard icons, confirming that the 3D orb is a modular accent, not an absolute system requirement.
*   **Glow-Arc swoosh transition:** I confirm the presence of the magenta light-streak transition wipe between section cards. The arc draws on dynamically to guide the eye across layout shifts, representing a custom transition primitive we do not currently support in our Remotion library.
*   **Scramble-to-resolve subtitles:** I observed the per-character scramble resolve state in key text elements. The intermediate frames contain broken/scrambled glyphs that settle left-to-right into correct text, mimicking a 'decryption' or 'AI generation' sequence.
*   **Magenta Clause Highlights:** Prompt cards in this video feature phrase-length magenta underlines or highlights that arrive 6–10 frames *after* the text has settled. This represents a second-read layer that guides the viewer's eye to copyable command syntax.
*   **Ribbon Parallax:** In the background plate, the magenta/orange ribbon drifts independently from the foreground card. Stills capture this as a flat design element, but motion reveals that the background holds dynamic energy while the text is read.

### What Stills Miss vs. What Motion Reveals
1.  **Glow-Bloom Latency:** Stills show a card with a fully illuminated border. Motion analysis shows a two-stage read: the card settles first with a crisp white border, and then the magenta glow blooms 2–4 frames later. This delay makes the interface feel like it is 'powering on' in response to layout locking.
2.  **Border vs. Glow Easing:** The card border and outer glow have independent interpolation curves. The border settles with a snappy spring overshoot, while the glow blooms with a slower, linear opacity fade, giving depth to the motion.
3.  **Active-vs-Inactive State Gradients:** In list views, active rows glow brightly while previous rows fade to a lower opacity rather than disappearing, preserving reading history while maintaining vertical focus.



Video: `t9il-BN2wtM`, 16:9  
Creator: `@austin.marchese`  
Runtime: `21:25`  
Title source: `references/creators/austin.marchese/t9il-BN2wtM/metadata.json`  
Source reviewed: supplied contact sheets and local sampled frames in `references/creators/austin.marchese/t9il-BN2wtM/frames`, sampled about every 3 seconds.  
Timestamp note: timestamps are approximate and follow the supplied mapping: sheet `N` starts at `(N - 1) * 108s`; cell `K` is about `(N - 1) * 108 + (K - 1) * 3s`. Motion, easing, stagger, exits, and micro-timing are inferred from adjacent sampled states, repeated Austin/nateherk component behavior, and visible staged states rather than frame-accurate extraction.

## Overall Motion Language

This is Austin's warm, listicle-scale Claude Code variant of the nateherk liquid-glass system. The video is not built around one continuous 3D world or one dashboard. It is a fast catalog of 18 use cases, so the graphics work as repeatable navigation: a use-case bumper, a prompt card, a proof card, a PIP presenter frame, then a screen-recorded result. The repeated format makes the video feel organized even though the subject matter jumps from DNA, apps, Remotion, Google Ads, finance, security, SOPs, desktop cleanup, subscriptions, and grocery shopping.

The visual language is consistent:

- Black and charcoal glass cards with translucent interiors.
- Warm burgundy, magenta, violet, and orange glow fields.
- Thin rose-pink borders around proof objects and presenter PIP.
- A recurring golden-orange ribbon that drifts behind title slates.
- A coral/orange screen mat for bright computer demos.
- White/light-gray type with magenta emphasis words.
- Small presenter PIP boxes that keep Austin visible during software proof.

Common animation rules visible across the contact sheets:

- Shell before content. Card containers, browser frames, and prompt panels land first; text, highlights, PIP, and internal UI states follow.
- Fast soft entrances. Most elements fade up while sliding 10-40 px and scaling from roughly 94-98% to a slight overshoot around 101-103%, then settle.
- Glow is delayed. Borders and background blooms brighten after the element is readable, creating a powered-on beat.
- Text resolves with micro-staggers. Use-case subtitles often begin as scattered or missing characters, then lock into clean tracking.
- PIP is a late top-layer anchor. Austin's portrait card usually appears after the screen/proof object and stays above it.
- Exit language is simple. Most exits are cuts, quick dissolves, or parent-scene cuts; the craft is in entrance, glow, internal scan, and proof framing.
- Background blur is functional. When prompt cards or quote slates appear, the live camera feed or software proof defocuses into a colored stage.

Compared with nateherk, Austin keeps the liquid-glass card physics but makes the system warmer, more creator-led, and more tutorial/proof oriented. Nateherk often reads as cyan/teal SaaS HUD. Austin reads as magenta/orange Claude-Code education, with more prompt-card overlays, PIP proof frames, CTA strips, and real OS/application footage.

## Chapter Timing

- `0:00-1:22`: Use case #1, Analyze Your DNA for Health Insights.
- `1:22-3:06`: Use case #2, Build a Full Web App in 10 Minutes.
- `3:06-3:59`: Use case #3, Create Video Content Programmatically.
- `3:59-5:10`: Use case #4, Create Your Own Personal Operating System.
- `5:10-6:29`: Use case #5, Writing and Editing Assistant.
- `6:29-7:41`: Use case #6, Automate Your Google Ads.
- `7:41-8:56`: Use case #7, Build an Interactive Vacation Planner.
- `8:56-10:29`: Use case #8, Come Up With Your Startup Idea.
- `10:29-11:53`: Use case #9, Run Security Checks on Your Website.
- `11:53-13:03`: Use case #10, Build a Multi-Agent Research System.
- `13:03-13:38`: Use case #11, Create Interactive Visualizations and Simulations.
- `13:38-14:47`: Use case #12, Automate Finance Workflows.
- `14:47-15:56`: Use case #13, Show, Don't Tell: Build What You're Imagining.
- `15:56-16:48`: Use case #14, Create and Maintain SOPs.
- `16:48-18:09`: Use case #15, Process Audio and Video Files.
- `18:09-19:51`: Use case #16, Clear Up Space on Your Computer.
- `19:51-20:33`: Use case #17, Stop Paying for Unnecessary Subscriptions.
- `20:33-21:25`: Use case #18, Go Grocery Shopping.

## Catalog Of Distinct Animations

### 1. Use-Case Chapter Bumper

Examples: ~0:00, ~1:21-1:24, ~3:06-3:09, ~4:00, ~5:09-5:12, ~6:30, ~7:42, ~8:57, ~10:30, ~11:54-11:57, ~13:03-13:06, ~13:39-13:42, ~14:48-14:51, ~15:57, ~16:48, ~18:09-18:12, ~19:51-19:54, ~20:33.

Motion: The warm abstract stage appears first, usually already carrying a soft golden ribbon from left to right. A small top-center eyebrow pill with the video title fades in at low opacity. The orange radial burst pops in near the left side of the label with a small rotation and scale push. The `Use case #N` glass pill slides or scales into place with a tiny overshoot, then its border bloom pulses. The subtitle below resolves in staggered groups, with the first sampled frame often showing missing or scrambled characters before the complete title locks in.

Color/material: Charcoal-to-black background, magenta/violet bloom at right, smoky burgundy midtones, golden ribbon, orange radial mark, translucent rounded glass label with rose-pink edge glow, white title text, widely tracked white subtitle.

Layout: Center-weighted composition. The glass label sits slightly above center, the burst overlaps its left edge, and the subtitle sits below in two or three centered lines. The tiny series title pill is top-center.

Subtle craft: The bumper is not a static title card. The subtitle often resolves from fragmentary letter states, so the viewer feels a "loading into clarity" effect. The golden ribbon passes behind the label and subtitle at a different blur depth, creating parallax without moving the main text much. The radial burst is slightly brighter than the label, making the eye land left-to-right.

Nateherk relation: This is Austin's clearest extension of nateherk. It uses the same glass-card physics but replaces nateherk's cooler data-HUD tone with a warm creator-series chapter system that can scale to 18 sections.

### 2. Use-Case Subtitle De-Scramble

Examples: ~0:00-0:03 `Analyze Your DNA for Health Insights`, ~1:21-1:24 `Build a Full Web App in 10 Minutes`, ~3:06-3:09 `Create Video Content Programmatically`, ~11:54-11:57 `Build a Multi-Agent Research System`, ~13:03-13:06 `Create Interactive Visualizations and Simulations`, ~18:09-18:12 `Clear Up Space on Your Computer`, ~19:51-19:54 `Stop Paying for Unnecessary Subscriptions`.

Motion: The subtitle begins as partial, widely tracked letter fragments. Missing letters, jittered spacing, or slightly misplaced characters resolve into the final phrase over a short beat. The reveal appears grouped by word or syllable rather than as a pure left-to-right typewriter. Some letters fade from low opacity while others slide a few pixels into place.

Color/material: Thin white text, soft shadow, a faint gray ghost of earlier letter positions, magenta background haze.

Layout: Centered beneath the main use-case pill, usually occupying the middle third of the frame. Long titles wrap into two or three centered lines.

Subtle craft: A still pass only sees a mildly broken title. In motion, that broken state creates anticipation and lets the viewer register "new chapter loading" before the text is readable. The effect is subtle enough to avoid becoming a sci-fi glitch trope.

Nateherk relation: Nateherk uses kinetic word pops and dashboard text reveals; Austin's de-scramble is more listicle-bumper specific and warmer in presentation.

### 3. Warm Ribbon Background Loop

Examples: every use-case bumper, especially ~0:00, ~4:00, ~7:42, ~10:30, ~16:48, ~20:33.

Motion: A golden/orange ribbon arcs across the lower-middle background while magenta and violet blobs drift at different blur levels. The motion is slow compared with the title text, reading as an ambient parallax layer. The ribbon holds through the bumper and cuts away with the scene.

Color/material: Soft-focus gradient light, not a hard vector line. Golden-orange arc, burgundy/magenta bloom, charcoal edges, mild vignette.

Layout: The ribbon crosses behind the subtitle and usually rises from left-lower to right-middle. It never blocks the use-case text; it gives the title stage depth.

Subtle craft: The ribbon's blur and brightness vary behind the card, helping the glass label feel translucent. It also ties unrelated use cases together visually without needing a literal branded background.

Nateherk relation: It inherits nateherk's glowing abstract backgrounds but Austin's ribbon is warmer, more editorial, and used as a recurring "series spine."

### 4. Prompt Card With Presenter PIP

Examples: ~0:36-0:48 DNA prompt, ~3:36-3:51 Remotion prompt, ~6:54-7:06 Google Ads prompt, ~11:33 security prompt, ~12:27-12:39 research-system prompt, ~13:21-13:30 simulation prompt, ~13:54-14:03 finance prompt, ~16:27-16:39 SOP prompt, ~17:09-17:21 meeting-transcript prompt, ~18:54-19:18 desktop cleanup prompt, ~20:45-20:54 grocery prompt.

Motion: The black prompt card lands left-of-center with opacity up, blur down, a small upward slide, and a scale settle. The `Prompt:` heading appears first or is already visible as the shell resolves. Body text fades in as one grouped block, then the presenter PIP slides in from the right or scales up at the card's right edge. The card edge glow pulses after both prompt and PIP are readable.

Color/material: Dark translucent glass card, charcoal fill, thin gray/rose border, white heading and body copy, subtle inner shadow. PIP is a small opaque portrait/video crop with a hot-pink outline and outer glow.

Layout: Prompt card usually occupies the left or center-left 40-55% of the frame. PIP sits to its immediate right, vertically centered. Background is a blurred magenta/black stage or defocused talking-head shot.

Subtle craft: The prompt card does not fill the frame. It leaves negative space to the right for PIP and magenta glow, so the card feels like an overlay Austin is presenting, not a full-screen slide. The PIP border remains brighter than the prompt border, keeping Austin human-present even when the prompt text dominates.

Nateherk relation: Closely related to nateherk's translucent prompt cards, but Austin makes the prompt/PIP pair a reusable listicle primitive. The warm border and portrait card are more creator-branded.

### 5. Prompt Card Hold With Micro-Parallax

Examples: ~0:36-0:48, ~3:36-3:51, ~6:54-7:06, ~13:21-13:30, ~17:09-17:21, ~18:54-19:18.

Motion: After the prompt card lands, it does not remain perfectly dead. The blurred background drifts slightly, the glow shifts, and Austin's PIP continues subtle live motion. The prompt card itself stays locked, functioning as a stable reading plane while the environment breathes.

Color/material: Same as the prompt card system, with moving magenta/violet reflections behind it.

Layout: Card and PIP remain in fixed relative positions; background motion supplies the depth.

Subtle craft: This is easy to miss in stills because the card looks static. In sequence, the live PIP and drifting glow prevent the long prompt holds from feeling frozen, while the prompt text remains readable.

Nateherk relation: Nateherk often animates cards internally; Austin sometimes lets the environment animate instead, which is more suitable for text-heavy prompts.

### 6. Screen Proof Card With Presenter PIP

Examples: ~0:15-0:24 DNA screenshots, ~1:45-2:06 app/browser proof, ~2:33-2:42 dark app proof, ~5:54-6:00 editor/document proof, ~8:09-8:21 vacation planner proof, ~11:15-11:21 website analytics proof, ~12:00-12:06 multi-agent IDE proof, ~16:30-16:39 SOP extraction proof, ~19:24-19:39 file-management proof, ~20:03-20:18 subscription audit proof.

Motion: A screenshot or screen recording appears inside a rounded frame or browser window. It scales from slightly small, sharpens, then settles. PIP arrives late in the lower-right or right rail. Internal screen content may scroll, update, or show cursor/selection movement while the outer proof frame stays stable. Exits are usually cuts back to talking head or to the next proof.

Color/material: Native white or dark app screens, thin glass outline, warm magenta/orange background, pink PIP stroke, soft card shadow.

Layout: The proof object dominates the frame, usually 70-90% width. PIP overlaps a non-critical corner, most often lower-right.

Subtle craft: Austin preserves the native UI contrast of the proof material. White screenshots stay bright and credible; dark terminal/app screens stay sharp. The house style is applied around the proof, not over it, so the graphic branding does not damage evidence readability.

Nateherk relation: Shared proof-card grammar. Austin extends it by making proof cards the spine of nearly every use case rather than occasional evidence.

### 7. Bright Screenshot On Coral Mat

Examples: ~1:33 folder/file demo, ~1:36 terminal over coral desktop, ~1:54 browser result, ~6:45-6:48 Google Ads setup, ~17:30-17:39 white "Building plan" and output cards.

Motion: A bright app/browser window appears over a flat coral/orange desktop-like mat. The window scales into place and casts a soft shadow. Sometimes a second dark terminal/card overlaps it, creating a layered desktop. The background mat is static or only subtly drifting, while the active window carries internal cursor or progress changes.

Color/material: Coral/orange fill, white window surfaces, black terminal overlays, macOS-style chrome, rounded corners, soft drop shadow.

Layout: Full-frame coral mat with one central app window or a two-layer stack. PIP is usually absent on pure desktop demonstrations or tucked into a corner if the source is a screen recording.

Subtle craft: The coral mat is much brighter than Austin's normal black glass stage. It signals "local computer action" and gives white windows a clean silhouette. It also creates a strong visual break between talking-head and dark Claude UI scenes.

Nateherk relation: Nateherk uses cool glass/dark dashboards more often. Austin's coral desktop mat is warmer and more Mac/tutorial oriented.

### 8. Terminal / Claude Code Proof Frame

Examples: ~1:36, ~2:03-2:06, ~3:27, ~4:15-4:24, ~4:30-4:51, ~5:36-6:00, ~9:33-10:00, ~12:00-12:06, ~16:30-16:39, ~18:54-19:18.

Motion: A terminal or code window appears as a framed, dark proof object. The outer frame enters with a short scale/fade and a glow pulse. Internal output changes through real screen-recording motion: text appears, scrolls, command lines update, and the cursor or selection moves. The PIP card often arrives after the terminal and overlaps the lower-right.

Color/material: Black/dark-gray terminal surface, white monospace text, green/red diff output, occasional pink command highlights, thin rose glass border, violet/magenta background.

Layout: Wide centered panel, sometimes split with a file tree on the left and output on the right. PIP sits lower-right and is top layer.

Subtle craft: Austin uses the outer frame to brand the terminal while leaving the terminal itself native. This keeps the material feeling like real Claude Code output instead of a fake animation. The PIP often covers blank or low-value terminal real estate, avoiding important lines.

Nateherk relation: Shared terminal proof vocabulary, but Austin's warm border/glow and frequent PIP use make it more creator-tutorial than cyber-dashboard.

### 9. Magenta Command / Text Focus Outline

Examples: ~4:18 command-line highlight, ~9:33-9:45 prompt/code line highlights, ~9:51 lower text block highlight, ~16:30-16:39 SOP/output focus boxes, ~18:54-19:06 desktop cleanup prompt and output highlights.

Motion: A hot-pink rectangular outline or filled highlight appears around the relevant command, paragraph, or code block. It either wipes on horizontally, pops on with a brief glow bloom, or tracks to a new block between sampled frames. The highlighted block often stays for a beat while the rest of the screen remains dimmer.

Color/material: Saturated magenta/pink stroke, sometimes with translucent fill; black/gray code or document background; soft outer glow.

Layout: Highlight is placed inside the proof frame, not around the whole card. It conforms to actual text block width or command-line position.

Subtle craft: The highlight is not decorative. It directs reading inside dense real software output. The stroke is close enough to the text to feel native to the screen recording, but bright enough to be legible at YouTube compression.

Nateherk relation: Nateherk uses callout boxes, but Austin's magenta focus rectangles are more tutorial/editorial and more frequent over real code/output.

### 10. Diff / Code-Edit Green Blocks

Examples: ~4:39-4:48 code edits in personal OS section, ~4:51 file list plus diff, ~5:36-5:39 writing assistant code/text transformation.

Motion: A code editor or terminal panel transitions from dense neutral text into blocks of green-highlighted changes, with occasional red deleted rows. The outer panel holds steady while the highlighted regions appear or jump between adjacent frames. The green blocks read as applied edits or accepted changes.

Color/material: Dark IDE, white/yellow syntax, green translucent diff fill, red deletion strips, magenta proof-frame border, PIP in hot-pink outline.

Layout: Wide editor panel with file tree or terminal sidebar. Highlighted changes occupy the central and right reading areas.

Subtle craft: The green edits are broad enough to read as "change accepted" even when text is unreadable. Austin uses color semantics rather than relying on viewers reading code.

Nateherk relation: Nateherk often turns code into styled cards. Austin keeps the real IDE and adds proof-oriented color states, extending the style into practical code review/editing demos.

### 11. Split Pane IDE / Agent Workspace

Examples: ~5:54-6:00, ~12:00-12:06, ~20:03-20:18.

Motion: A dark software workspace fills the screen with two or more vertical panes. The panel shell enters as one screen card, then internal selection, cursor, or text changes pull attention between panes. PIP appears on the right edge after the workspace is established.

Color/material: Dark IDE/app UI, gray dividers, white monospace/body text, purple/magenta frame border, occasional green status dots or blue selection states.

Layout: Multi-column workspace, often file tree left, content/output center, details or chat right. PIP lower-right or right rail.

Subtle craft: The panes do not animate independently as separate cards. Treating the entire IDE as one proof surface preserves authenticity, while highlights and cursor movement provide the animated focus path.

Nateherk relation: This extends nateherk's workflow diagrams into real multi-pane software. It is less abstract, more screen-recorded, and more useful for Claude Code education.

### 12. Progress / Planning Status Card

Examples: ~1:18 progress checklist, ~17:30 `Building plan...`, ~17:33-17:39 generated action/output card.

Motion: A white or light card appears with a centered progress state. In the `Building plan...` example, the small Claude-like orange mark and text appear centered, then the output changes to simple text and later a folder/file result. The card itself holds with a soft glow while content updates inside.

Color/material: Bright white card, gray text, small orange starburst/Claude mark, minimal chrome, faint magenta edge spill from the background.

Layout: Centered wide card against a dark/magenta blurred stage. Text is center-aligned and sparse.

Subtle craft: The white planning card works as a palate cleanser between dense dark UI shots. It implies Claude is doing intermediate work without showing every log line. The sparse card makes the subsequent file/folder result feel cleaner.

Nateherk relation: Nateherk has status cards and count-ups; Austin uses the same idea as an AI planning state rather than a metric animation.

### 13. Finder / File Output Reveal

Examples: ~1:33 folder over coral desktop, ~17:39 `Meeting Transcripts` and `SKILL.md`, ~18:30-18:39 desktop cleanup output, ~19:09-19:18 organized file lists.

Motion: A Finder/file view appears after a prompt or planning state. File/folder icons fade or pop into place, sometimes after a before/after desktop frame. The visible state changes between crowded and organized desktops, implying automated rearrangement. In the white output card, folder and document rows appear stacked with simple icon fades.

Color/material: macOS-style folder icons, white or dark Finder surfaces, coral desktop, black app sidebar, magenta border when framed.

Layout: Centered file window or full desktop view. In cleanup examples, desktop icons occupy the whole frame before contracting into organized rows/columns.

Subtle craft: The automation is shown through spatial order rather than text. A messy desktop becomes visibly sparse, and file rows are aligned in a clean vertical hierarchy. That makes the result instantly understandable.

Nateherk relation: This is more Austin-specific. Nateherk's style is often abstract UI; Austin extends it into real OS/file-system proof.

### 14. Claude Desktop / App Screen Record Card

Examples: ~1:45 Claude conversation, ~2:33-2:42 app page with PIP, ~5:42-5:54 prompt/results in dark app, ~19:24-19:39 cleanup assistant screen, ~20:03-20:18 subscription/grocery assistant screens.

Motion: A native dark Claude/app interface scales into frame or cuts in as a proof panel. The sidebars and chat areas remain mostly static while cursor/selection or generated text changes inside. PIP arrives after the app window and stays over the lower-right.

Color/material: Dark app chrome, low-contrast gray sidebars, white text, small colored icons/status dots, rose border and PIP outline.

Layout: Full-width or nearly full-width application capture. PIP lower-right; sometimes the app fills the entire background with no separate card shell.

Subtle craft: Austin does not over-glass these native app captures. He lets the app's own sidebars, buttons, and status indicators remain visible so viewers trust the workflow.

Nateherk relation: Shared proof-frame structure, but Austin's version is more screen-capture-forward and less stylized.

### 15. Quote Slate With Magenta Emphasis

Examples: ~2:24 `"Since I found Claude Code I haven't been able to sleep."`, ~15:15-15:18 `"If there's a specific thing you want to take on at work..."`.

Motion: The talking-head or abstract background blurs and darkens. The quote text fades in as multiple lines, with emphasized words appearing later or brighter. In the 15:15 sequence, the first half of the quote appears in white, then the key magenta phrase arrives as a second punch. Exit is a hard cut back to Austin.

Color/material: White italic or light sans-serif text, hot-magenta emphasized words, black/magenta blurred background, soft vignette.

Layout: Large quote block centered or center-left. The emphasized phrase occupies the lower lines and uses heavier weight/color.

Subtle craft: The emphasis is timed semantically, not just aesthetically. The quote first establishes context, then magenta words complete the point. The background blur makes the live-camera scene feel like a thought space.

Nateherk relation: Nateherk uses kinetic captions, but Austin's quote slates are more editorial and essay-like, especially with italicized white text plus magenta punch lines.

### 16. Over-Speaker Kinetic Caption / Word Emphasis

Examples: ~2:24 quote slate, ~3:09-3:15 section title transition, ~10:54 search-result overlay, ~15:15-15:18 work quote, various talking-head beats where a single phrase appears over blurred footage.

Motion: Live footage softens first. Text fades/slides into a negative-space pocket, often with one or two emphasized words arriving last. The type settles quickly and exits by cut. Some phrases use a tiny scale push on the emphasized word.

Color/material: White text, magenta emphasized words, blurred studio teal and magenta highlights, no card shell.

Layout: Usually center or right side of the frame, placed to avoid Austin's face and microphone.

Subtle craft: The blur is doing a lot of work. It separates text from the busy studio shelves and lets the type feel integrated with the live footage without a visible card.

Nateherk relation: Shared kinetic-caption pattern, but Austin's warmer palette and quote-like phrasing differ from nateherk's punchier HUD labels.

### 17. Presenter PIP Pop And Glow

Examples: nearly every proof screen: ~0:15-0:24, ~1:45-2:06, ~3:36-3:51, ~4:15-4:24, ~6:54-7:06, ~8:09-8:21, ~11:33-11:42, ~12:27-12:39, ~16:30-16:39, ~18:54-19:18, ~20:03-20:18.

Motion: The PIP card slides in from the right or bottom-right with opacity up and a slight scale overshoot. It may land after the main proof card by a fraction of a second. The border glow increases after landing and then holds. Exit is usually a cut with the parent scene.

Color/material: Opaque portrait/video crop, rounded rectangle, hot-pink outline, subtle outer glow and inner shadow.

Layout: Lower-right corner or right rail, sized around 12-18% of frame width. It avoids covering primary buttons or first lines of text.

Subtle craft: The PIP gives dense software proof a human anchor. The border is saturated enough to stay visible over white, black, or blurred magenta backgrounds. Austin often uses PIP as the highest z-order element, but not so large that it competes with proof.

Nateherk relation: Shared presenter-card motif, but Austin uses it more relentlessly as a proof companion and brand signature.

### 18. Physical Device Proof Insert

Examples: ~2:15-2:18 laptop with generated content, ~14:33-14:36 physical laptop/monitor with Remotion/image outputs.

Motion: The edit cuts from polished screen capture to handheld/physical footage. Any graphics are minimal; the motion comes from camera movement and the real screen perspective. Background remains blurred, and the physical screen functions as proof.

Color/material: Real laptop/monitor footage, natural reflections, blurred studio background, no heavy glass overlay.

Layout: Device centered or slightly right, with surrounding studio/desk visible. Sometimes it appears between talking-head and app-proof sequences.

Subtle craft: The unpolished physical insert creates credibility. It breaks the liquid-glass polish just enough to say "this exists on my machine," then the edit returns to the branded system.

Nateherk relation: This differs from nateherk's cleaner motion-graphics world. Austin extends the style with creator-desk evidence.

### 19. Web App Demo Frame

Examples: ~1:48-2:00 generated web app pages, ~2:45 weather app, ~13:15-13:18 simulation interface, ~8:09-8:21 vacation planner, ~11:39-11:42 security check interface.

Motion: A browser/app window appears centered, often already in an interactive state. It may scale in, then internal UI changes or cursor movement imply interaction. PIP either overlaps lower-right or is absent when the app needs full attention.

Color/material: Native app UI colors vary by use case: light white web pages, dark vacation-planner UI with amber accents, blue-gray weather card, white simulation charts. House magenta border/background unifies them.

Layout: Window centered in full frame, with margins revealing the warm background. PIP lower-right when present.

Subtle craft: Austin does not force every generated app into the same color theme. The house style is the frame and transition, while the app's own aesthetic is allowed to breathe. That supports the "Claude can build anything" thesis.

Nateherk relation: Nateherk's demos often feel like designed dashboard cards; Austin's web app frames are more varied and output-oriented.

### 20. Remotion / Video Timeline Proof

Examples: ~3:27 terminal for Remotion setup, ~3:30 rendered food/product video with timeline controls.

Motion: The section moves from title bumper to terminal proof, then to a rendered video/editor window. The video window appears inside a dark desktop frame and contains a visible timeline/playback strip. The shift from code terminal to visual output is a cut-based transformation rather than a morph.

Color/material: Dark terminal, black video/player chrome, vivid food image, blue/red timeline controls, magenta proof border.

Layout: Terminal or video player centered, with the visual output occupying the upper majority and controls along the bottom.

Subtle craft: The proof sequence is staged as cause then effect. Terminal first establishes generation; timeline frame proves the result is a video artifact, not just an image.

Nateherk relation: Austin extends the normal code proof card into a media-production proof card. The timeline strip is a useful reusable detail for any programmatic video example.

### 21. Personal Operating System Terminal Stack

Examples: ~4:15-4:24 command terminal with PIP, ~4:30-4:51 dense code/diff editor, ~4:48 file-tree/editor view.

Motion: A terminal card lands, then the view cuts into dense IDE/file-tree panels. Pink command focus appears around one terminal input, then green diff regions appear in the editor. The PIP stays in the same lower-right zone, tying multiple screens together.

Color/material: Dark terminal and IDE, magenta focus rectangles, green diff blocks, warm purple background, pink PIP stroke.

Layout: Full-width panels, left file tree when in IDE, command/status panel when in terminal.

Subtle craft: This sequence layers several proof modes without a new visual language for each. Command, file tree, diff, and PIP all use the same border/glow rules, so the complicated workflow still feels coherent.

Nateherk relation: It extends nateherk's card system into a real developer workflow stack with editor diffs, not just UI mockups.

### 22. Google Ads Step Card

Examples: ~6:45 `STEP 1 Select your goal`, ~6:48 `STEP 2 Create ad group...`.

Motion: A white Google Ads interface slides/scales into the frame on a dark/magenta background. A small blue step pill is visible at top-left of the screenshot. The next step card replaces it by cut or quick slide, preserving the same framing.

Color/material: Bright white Google Ads UI, blue `STEP` label, gray chrome, magenta border glow/background.

Layout: Screenshot centered with generous margins; no large PIP during these step screenshots, so the UI reads clearly.

Subtle craft: The blue step pill is not Austin's brand color, but it is allowed to remain because it reads as instructional annotation. This keeps the workflow practical and avoids over-branding the real platform UI.

Nateherk relation: Related to nateherk's numbered steps, but Austin uses actual platform screenshots with small step overlays instead of fully custom glass step cards.

### 23. Vacation Planner Dark Dashboard

Examples: ~8:09-8:21.

Motion: The generated vacation planner appears as a dark UI card. Category chips and itinerary panels are visible, with amber outlines and selected states. The sequence samples show different states, implying cursor-driven interaction or a quick tour across tabs/cards. PIP sits at the right/lower-right.

Color/material: Dark charcoal app surface, amber/yellow selection outlines, orange call-to-action button, white text, muted gray panels, rose PIP border.

Layout: Browser/app window centered, PIP at lower-right, selected options grouped across the top and itinerary/result panels below.

Subtle craft: This output app gets its own domain palette. The amber accent suggests travel planning and choice selection, while the surrounding magenta stage keeps it connected to the video brand.

Nateherk relation: This is closer to nateherk's dashboard cards, but Austin keeps it as a generated-app proof rather than a purely designed explainer graphic.

### 24. Offer / Playbook Card Grid

Examples: ~7:27 landing page, ~7:30-7:36 `Your AI Mastery Playbook`, day cards, `FIRST LINK IN THE DESCRIPTION`.

Motion: A dark product/offer page appears, then a grid of tall day cards is shown. Cards reveal in a subtle row/column stagger or via cut-in states. The white CTA banner slides in across the lower portion at ~7:36, over the card grid.

Color/material: Black/charcoal product page, white heading, magenta accent text, dark glass day cards, white CTA banner with black uppercase text, small pink product marker.

Layout: Page fills the frame; day cards arranged horizontally in the lower half; CTA banner crosses lower center/right.

Subtle craft: The offer grid uses the same card system as educational proof, but with a more marketing-style composition. The CTA banner deliberately breaks the dark palette with a white strip to force attention.

Nateherk relation: Austin extends nateherk's card grid into creator funnel/CTA graphics. This is more YouTube-business-specific than nateherk's typical SaaS UI.

### 25. Lower-Third CTA Banner

Examples: ~7:36 `FIRST LINK IN THE DESCRIPTION`, ~14:42-14:45 `SECOND LINK IN THE DESCRIPTION`, ~21:18-21:21 Austin Marchese subscribe/handle lower-third.

Motion: A white or dark lower-third banner slides in from below or expands horizontally from center. Text appears after the banner is fully in place. It exits by cut.

Color/material: White banner with black uppercase text for link CTAs; final social lower-third uses a white rounded label with small icon/avatar and black text.

Layout: Lower third, centered or slightly left. It avoids the microphone and face, often aligned under Austin's chest.

Subtle craft: The CTA banners are visually simpler than the liquid-glass proof cards. That restraint makes them read quickly as YouTube navigation prompts, not another concept card.

Nateherk relation: More Austin/creator-specific. Nateherk's motion vocabulary is adapted into direct audience-action labels.

### 26. Social Post Mockup Card

Examples: ~8:45-8:51 startup idea section.

Motion: A black X/Twitter-style post card appears centered against the warm blurred background. It scales up gently and holds while the screenshot within remains readable. The repeated adjacent frames show a stable hold rather than much internal animation.

Color/material: Black social UI, white post text, small blue verification/brand accents, white document/image preview, magenta glow background.

Layout: Tall social-post card centered; generous dark margins; no large competing text.

Subtle craft: The social mockup serves as "result you can publish." Austin avoids heavy overlay motion here because the post itself has to be recognizable.

Nateherk relation: Nateherk uses social-card proof occasionally; Austin uses it as one more output format in a Claude Code productivity list.

### 27. File List / Table Proof Card

Examples: ~9:27-9:30 startup source files, ~19:30 file-management result, ~20:09-20:18 subscription table/list, ~20:45-20:54 grocery/shopping output card.

Motion: A Finder/table/app list appears centered or full-frame. Rows are already populated, then selection bars or side panels change between sampled frames. PIP appears lower-right on many examples. The card entrance is usually a simple fade/scale, with internal row focus doing the later motion.

Color/material: Dark table/list UI, gray row separators, white text, blue native selection in some rows, magenta frame/PIP border.

Layout: Wide table or list occupying most of the frame. Sidebars at left/right remain visible to prove this is a real tool, not a designed slide.

Subtle craft: Row density is the metric. Austin uses many visible rows to communicate volume of work automated, while the PIP and highlight keep it from becoming anonymous spreadsheet footage.

Nateherk relation: Nateherk often uses custom metric cards; Austin uses real list/table density as the "stat."

### 28. Search Result / Website Proof Overlay

Examples: ~10:54-10:57 AI crypto search results, ~11:39-11:42 security result screen.

Motion: A semi-transparent or dark browser/search card appears over blurred talking-head footage. It scales into view and holds. The background remains blurred and alive. Some rows or result titles are highlighted by contrast rather than animated outlines.

Color/material: Dark search/result card, white text, magenta/purple page accents, blurred studio teal/magenta behind.

Layout: Card centered or upper-center, leaving Austin's blurred figure at the sides. In security section, the result card can occupy the right side while Austin remains visible left.

Subtle craft: The proof is integrated over Austin's talking-head background, not cut to a sterile browser. This makes it feel like a thought/proof overlay in the narration flow.

Nateherk relation: Similar to nateherk's over-speaker browser cards, but Austin's versions are warmer and more compressed for fast YouTube pacing.

### 29. Security Scan Score / Checklist Panel

Examples: ~11:39-11:42 security report list, ~10:30-11:53 security use case sequence.

Motion: A dark scanning/report panel appears with a magenta status bar or top label and rows of green/yellow status indicators. The outer panel scales in and holds; internal rows are likely revealed or scrolled during the screen recording. PIP is absent or offset so the checklist stays readable.

Color/material: Dark gray report UI, magenta header/progress bar, green check/status dots, yellow warning markers, thin light border.

Layout: Vertical report card on the right or centered, with lots of row data. Blurred studio background appears around it.

Subtle craft: The scan panel uses status color as motion shorthand. Even when labels are too small, green check repetition signals "pass" while yellow rows signal items to inspect.

Nateherk relation: Nateherk has metric/status cards; Austin uses a real scanner/report UI and only lightly brands it.

### 30. Multi-Agent Research Prompt And IDE Split

Examples: ~11:54-12:06 title and IDE, ~12:27-12:39 prompt card.

Motion: The use-case bumper introduces the section, then a dark IDE/chat workspace appears with split panes and live text/code. Later the prompt card/PIP pair appears, asking for multiple subagents. The sequence uses a repeatable chain: chapter title, proof workspace, talking-head explanation, prompt card.

Color/material: Warm bumper, dark IDE workspace, white monospace text, green terminal/code states, magenta proof/PIP borders.

Layout: Wide split IDE for proof, then left prompt card with right PIP for instruction.

Subtle craft: The prompt card explicitly describes subagents, but the split IDE panel visually prepares the viewer for parallel work by showing multiple panes. The graphics support the multi-agent idea before the prompt text is fully read.

Nateherk relation: This extends nateherk's workflow diagrams into actual multi-pane research/editor proof. It is one of the most Claude-Code-specific systems in the video.

### 31. Interactive Visualization / Simulation Demo

Examples: ~13:15 bar chart simulation, ~13:18 compound-interest chart UI, ~13:21-13:30 simulation prompt card.

Motion: Generated visualization windows appear after the use-case bumper. The bar/chart demo is framed as an app window, with visible sliders/controls and chart areas. The prompt card then lands to explain what was requested. The chart windows are likely screen captures where internal values/plots animate, but the contact-sheet cadence shows stable result states.

Color/material: Bright white chart UI for bar demo, dark teal/blue UI for compound-interest app, coral red/blue data panels, black prompt card, magenta stage.

Layout: App output centered first, then prompt card left with PIP right.

Subtle craft: Austin reverses the usual order here: he shows the visual result before or near the prompt card. That supports the use case title "interactive visualizations" because the audience immediately sees output.

Nateherk relation: Nateherk often has polished custom charts; Austin's twist is showing a generated interactive artifact with native UI controls.

### 32. Finance Workflow Prompt Card

Examples: ~13:54-14:03.

Motion: Same prompt-card shell and PIP pair, but the prompt is framed around Stripe transactions, bank statements, weekly cash flow, and discrepancies. The card lands with the standard soft scale/slide and holds for reading.

Color/material: Dark glass prompt, white text, pink PIP border, magenta/orange background.

Layout: Left prompt card, right PIP, blurred warm stage.

Subtle craft: The finance section relies more on the prompt than a separate animated dashboard in the sampled frames. The repeated prompt system lets Austin communicate a complex workflow quickly without needing a full custom finance animation.

Nateherk relation: Nateherk would often visualize finance metrics as cards/count-ups; Austin keeps it prompt/proof oriented. That is a difference, not a weakness.

### 33. Show-Don't-Tell Quote Slate

Examples: ~15:15-15:18.

Motion: A quote appears over a blurred magenta-black stage. The first lines are white and subdued, then the key phrase in magenta appears or brightens, creating the punch. The type holds briefly before cutting back to Austin.

Color/material: White italic/light text, hot magenta emphasis, dark vignette, magenta glow.

Layout: Large centered quote block, with the emphasized phrase occupying the bottom lines.

Subtle craft: The section title is about building what you imagine, and the quote's staggered emphasis dramatizes specificity. It is a conceptual animation, not a software proof card.

Nateherk relation: Austin extends the kinetic-caption grammar into reflective quote pacing.

### 34. SOP Extraction Prompt + Document Output

Examples: ~16:27-16:39.

Motion: A prompt card appears above/alongside a dark document/terminal proof. A table-like output or text block sits inside the screen frame. Pink focus bars or borders identify the active portion. PIP appears at the right.

Color/material: Black prompt card, dark output frame, white body text, gray table lines, magenta highlight bars, pink PIP border.

Layout: Prompt text sits across the top-left/upper area; output frame below or center; PIP on the right.

Subtle craft: The prompt asks for structured SOP docs, and the graphic supports that by showing a structured table/list rather than a generic paragraph. The magenta highlight frames the "structured" part of the output.

Nateherk relation: Similar prompt/proof system, but Austin applies it to document-processing workflows rather than pure coding.

### 35. Audio / Video Processing Plan And Output Cards

Examples: ~17:09-17:21 prompt card, ~17:30 `Building plan...`, ~17:33 text output, ~17:36 summary/action card, ~17:39 `Meeting Transcripts` folder and `SKILL.md`, ~17:48 mobile/narrow dark card.

Motion: The prompt card appears first. Then a white planning card replaces it, followed by output states: single text, action-list style text, and a folder/file list. The sequence ends with a small vertical/narrow card over blurred footage, likely a mobile or compact output proof. Each state arrives by cut or short dissolve, with the card staying centered.

Color/material: Black prompt glass, white AI planning card, gray/black compact mobile card, folder/document icons, magenta background glow.

Layout: Prompt left/PIP right, then centered output cards, then a narrow vertical card centered over blurred talking-head footage.

Subtle craft: The state progression is the animation: prompt -> plan -> text -> files -> compact share/output. Austin shows a pipeline rather than one screenshot, which makes the automation feel complete.

Nateherk relation: Extends nateherk's step-card grammar into an AI-processing pipeline with minimal UI.

### 36. Desktop Cleanup Before/After

Examples: ~18:30-18:39.

Motion: A cluttered coral desktop with many icons appears alongside or behind a dark assistant/file panel. The next sampled states show a dramatically cleaner desktop with fewer icons arranged in columns. The transition is likely a screen-recorded cleanup or a cut between before/after states; either way, it reads as icons being reorganized automatically.

Color/material: Coral desktop, bright blue folder/file icons, dark assistant window, thin magenta frame glow.

Layout: Full desktop fills the frame. Assistant/chat panel sits left, desktop icons spread across the right and then collapse into organized edges.

Subtle craft: This is one of the clearest non-card animations in the video. The visual payoff is spatial: entropy reduces. The coral background makes icon position changes obvious, which a dark background would not.

Nateherk relation: Strong Austin extension. Nateherk's liquid-glass system becomes an OS automation before/after demo.

### 37. Black-And-White Freeze / Comic Beat

Examples: ~18:48.

Motion: The talking-head footage cuts to a grayscale/low-saturation freeze-like state for a brief comedic or emphasis beat, then returns to normal color. There is no glass card; the color treatment itself is the graphic.

Color/material: Black-and-white or desaturated live footage, high contrast, no visible overlay.

Layout: Full talking-head frame.

Subtle craft: This gives the long software-heavy video a rhythmic reset. It is a small editorial animation that keeps the pacing from becoming only cards and screenshots.

Nateherk relation: Less nateherk, more creator-editing language. Austin adds personality without leaving the motion system for long.

### 38. Subscription Audit Table / Sidebar Focus

Examples: ~20:03-20:18.

Motion: A dark assistant/app screen with sidebars and table/list content appears. Selection states change across rows or sidebar items, with blue native highlight bars visible. PIP stays at lower-right. The outer frame remains steady while internal focus moves.

Color/material: Dark UI, gray panels, white text, blue native selection, magenta PIP border.

Layout: Wide software window with left navigation, main list/table center, details or chat on the right. PIP lower-right.

Subtle craft: The row selection is allowed to be native blue rather than recolored magenta. That preserves software authenticity and clearly says "this is being selected/inspected."

Nateherk relation: Austin extends proof cards into mundane but useful personal-finance software work. It is more real-workflow than designed metric card.

### 39. Grocery Shopping List / Output Card

Examples: ~20:45-20:54.

Motion: A dark grocery/shopping planning output card appears over the magenta stage with PIP. The card holds while its long text/list content is visible. It likely enters with the same proof-card scale/fade and then stays locked for readability.

Color/material: Dark gray/black card, white list text, faint gray dividers, magenta border and background glow, PIP with hot-pink outline.

Layout: Centered large vertical-ish card, PIP on the right, blurred warm background.

Subtle craft: The grocery example is intentionally simple at the end of a dense video. The motion language stays consistent, but the content card is quieter, helping the final use case feel accessible.

Nateherk relation: Austin applies the same premium visual system to everyday personal workflows, which broadens the nateherk-style UI beyond tech/productivity dashboards.

### 40. Final Social Lower-Third

Examples: ~21:18-21:21.

Motion: A small white social/subscribe lower-third pops up near the bottom-left/center while Austin remains talking-head. It likely scales from 95-100% with opacity up. It holds briefly and exits by end cut.

Color/material: White rounded rectangle, black text, small social/avatar icon, faint shadow.

Layout: Lower third, over desk/torso region, avoiding face and microphone.

Subtle craft: The final lower-third is clean and bright rather than glassy. It behaves like a final identity stamp, not another workflow object.

Nateherk relation: Creator-channel-specific rather than nateherk-specific, but it uses the same rounded-card timing.

## Subtle Craft A Quick Still Pass Misses

- The use-case title text often starts intentionally incomplete. The de-scramble is a chapter-loading cue, not a rendering mistake.
- The glow usually pulses after the card is readable. Austin separates "arrival" from "activation."
- PIP almost always enters after the proof object. That staging prioritizes evidence first and presenter second.
- Dense terminals are made readable through motion focus, not typography alone. Pink boxes, native blue selections, green diff regions, and cursor movement create a guided scan path.
- Warm/cool contrast is purposeful. Coral desktops and white planning cards interrupt the dark magenta world only when the workflow moves into local computer or clean AI-planning output.
- Austin lets native UI colors survive. Blue Google step labels, green checkmarks, amber vacation chips, and native blue selections remain because they add credibility.
- Real footage and physical devices are not errors in the polished system. They provide proof texture between glass cards.
- The golden ribbon is a continuity layer. It makes 18 separate use-case bumpers feel like one branded sequence.
- Prompt cards are stable while the background breathes. That lets long text remain readable without freezing the frame.
- Many exits are simple cuts. The visual sophistication is front-loaded into entry, glow, focus, and internal screen state.

## Differences And Extensions From Nateherk

- Austin's palette is warmer: burgundy, magenta, violet, orange, coral, and rose-pink replace nateherk's cooler cyan/teal emphasis.
- The use-case bumper is a full chapter-navigation system. Nateherk-style liquid glass becomes a repeatable numbered listicle engine.
- Prompt-card/PIP pairs are more central here. The prompt itself is treated as a hero object, not just supporting text.
- Austin uses real OS/application proof more often. Finder windows, desktop cleanup, Google Ads, Claude app screens, and browser outputs are allowed to stay native.
- CTA and offer graphics are integrated into the same card vocabulary. The playbook grid and link banners are creator-business overlays layered into the motion system.
- The video uses output density as a metric. Instead of many custom stat count-ups, table rows, file lists, checkmarks, diffs, and generated app screens visually demonstrate value.
- The proof rhythm is faster and more repetitive. The viewer learns the grammar: bumper -> explanation -> prompt -> proof -> next bumper.

## Top 5 Most Distinctive / Replicable Animations

1. **Use-case chapter bumper with de-scramble subtitle**  
   Most replicable because it can label any listicle section. Recipe: abstract warm stage, tiny top eyebrow, orange radial burst, translucent `Use case #N` pill, wide-tracked subtitle that resolves from partial letters, delayed border pulse.

2. **Prompt card plus hot-pink presenter PIP**  
   The core Austin educational component. Recipe: dark glass prompt card left, `Prompt:` heading, body copy as grouped reveal, PIP portrait card right, slight scale overshoot, edge glow after readability.

3. **Proof screen with late PIP and internal focus highlight**  
   Best for tutorials. Recipe: native screen capture in a branded frame, PIP arrives late, then magenta box/native selection/green diff guides the eye inside the real software.

4. **Desktop/file-system before-after automation**  
   Most Austin-specific extension. Recipe: show a messy real desktop or Finder list, run assistant panel/prompt, cut or animate to organized folders/files, keep coral or high-contrast desktop so spatial cleanup is obvious.

5. **White planning/output state sequence**  
   Useful for showing AI work between prompt and result. Recipe: black prompt card -> white `Building plan...` card -> simple generated text -> file/folder output -> final compact share/result card.

## Implementation Notes For Recreating The Style

- Base card animation: `opacity 0 -> 1`, `scale 0.96 -> 1.015 -> 1.0`, `translateY 18px -> 0`, blur `10px -> 0`, ease-out cubic with a short overshoot settle.
- Border activation: delay 4-8 frames after the card lands, then pulse border/box-shadow from low rose opacity to high hot-pink opacity and back to a steady medium glow.
- PIP entrance: delay after the proof object, `translateX 24px`, `scale 0.97 -> 1.02 -> 1`, pink outline and shadow bloom on settle.
- Use-case bumper: animate background first, burst second, label third, subtitle fourth. Let the subtitle resolve from missing characters over 8-14 frames.
- Prompt cards: keep body text stable after reveal. Let background haze and PIP motion provide life.
- Proof screens: avoid fake UI unless necessary. Native app captures with branded frames are more convincing.
- Highlights: use magenta rectangles for Austin-branded attention, but preserve native selections/checks when they help prove the software state.
- Exits: cuts are acceptable. The system's identity comes from the repeated entrances and holds.

