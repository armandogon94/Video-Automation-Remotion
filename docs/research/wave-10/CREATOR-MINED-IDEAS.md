# Wave-10 — Creator-mined variation ideas (workflow digest)

49 buildable ideas across 4 dimensions, mined in parallel from 12 creators (Hormozi, AZisk, Nate Herk, Jack, motiondarwin, motiongraphicsweb, mreflow, aiexplained, theaiadvantage, zenzuke, bilawal.ai, sahilbloom).

## depth-behind-speaker (10)
- **Ghosted Brand Macro Word Behind Speaker** 🔧NEW CODE — Massive wide-tracked ALL-CAPS hero word (e.g. INTELIGENCIA, FUTURO) at ~28% opacity sits behind the speaker who occludes its lower edge for real depth.
  - *build:* KineticMacroTypeOpener rendered through SpeakerForegroundMatte, anchor=center, large fontSize overflowing frame, navy #1B3A6E base + silver/gold #D4AF37 word. New word-reveal 'track-fade' (letter-staggered opacity 0->0.28).
- **Numbered Chapter Title Behind Speaker** — Giant chapter numeral + section title slams in BEHIND the talking head so the section header reveals while the person keeps talking.
  - *build:* AnimatedOpenerTitleOverDarkSet + FloatingNumberedChipRow rendered inside SpeakerForegroundMatte, anchor=center, topPct~30, hard 8-frame scale-in (pop). Gold numeral, white title.
- **Big Stat Number Rising Behind Head** 🔧NEW CODE — Large count-up figure (+248%, 10x) scales up behind the speaker as a 'data appears in the room' depth moment.
  - *build:* ColumnarNumberWithDividers inside SpeakerForegroundMatte, anchor=center/right-third, big fontSize, cyan #5BC0E8. Needs a count-up word animation synced to the Whisper word timestamp.
- **Saturated Chapter Numeral Behind Speaker** — One huge numeral (02, 06) filling ~60% of vertical, scale-popping in behind the head to stamp 'point N' without leaving the speaker.
  - *build:* Single big numeral via ColumnarNumberWithDividers through SpeakerForegroundMatte, anchor=center/side, reuse existing 'pop' (0.85->1 over 10f). Navy fill or gold hairline outline.
- **Dual Flanking Glass HUD Behind Speaker** 🔧NEW CODE — Two cards (checklist top-left, stat top-right) flank the centered head, both behind the person for a sophisticated HUD-in-the-room hook.
  - *build:* DiagnosticCalloutCard (left) + ColumnarNumberWithDividers (right) each wrapped in SpeakerForegroundMatte at anchor top-left/top-right, staggered edge entrances. CSS backdrop blur, navy/cyan accents.
- **Brand Logo Glow Wall Behind Speaker** — Armando Inteligencia mark glows on the side wall behind the speaker as a persistent depth backdrop for a 'real set' feel.
  - *build:* BrandLogoPopOverSpeaker rendered THROUGH SpeakerForegroundMatte at ~28% opacity, pinned side/corner, mix-blend screen, over a navy->deep-navy #0F1B2D Background gradient.
- **Persistent Section TOC Rail Behind Speaker Edge** 🔧NEW CODE — Vertical numbered where-am-I rail lives behind the speaker on one side of the 9:16 frame, advancing as sections progress.
  - *build:* ChapterProgressTimeline-driven rail via SpeakerForegroundMatte anchored left/right side; active item uses gold highlight; advance index off section timestamps with slide-up.
- **Overflowing Macro Word Horizontal Scroll Behind** 🔧NEW CODE — A single word fills 130% of frame width (only middle letters visible) and slowly translates horizontally behind the speaker as a scroll-stopping opener.
  - *build:* KineticMacroTypeOpener through SpeakerForegroundMatte, fontSize exceeds frame, anchor center no-wrap. New depth reveal mode 'macro-overflow-scroll' translating X over ~2s. Pure navy set, white type.
- **Three-Column Infographic Behind Speaker** 🔧NEW CODE — Three growing bar columns with icon badges render behind the person for a depth-infographic moment without leaving the talking-head.
  - *build:* ColumnarNumberWithDividers + IconStatChipStack through SpeakerForegroundMatte, anchor center, columns scaleY-from-baseline staggered. Navy/gold/cyan column tints.
- **Hero Keyword Behind Torso (set-dressing)** — A desaturated mid-frame ALL-CAPS keyword the speaker's arm/torso physically passes in front of; used ~once per video as muted set-dressing.
  - *build:* Plain large-caps text or AnimatedOpenerTitleOverDarkSet behind SpeakerForegroundMatte, anchor center, topPct~40, silver/gray, no glow. Used sparingly.

## text-on-screen-reveal (13)
- **Sentiment-Colored Keyword Pop** 🔧NEW CODE — 1-3 word ALL-CAPS keyword pops dead-center lower-third, color-coded by meaning (cyan=topic, gold=positive/emphasis, navy=neutral), thick stroke, scale-pop with overshoot.
  - *build:* YellowGlowWordCallout retargeted to brand: add color variant (cyan/gold/navy) + stroke instead of glow + anchor bottom-center. 'pop' word animation, condensed-hype caption style.
- **Persistent Top Hook Pill** 🔧NEW CODE — A rounded hook pill pinned top-third for the entire video as the sound-off orientation anchor.
  - *build:* PersistentCornerBadge repurposed as a top-third pill (thin variant), held full duration, slide-clean style, navy bg/white text ~85% opacity.
- **Numbered Step Card with Highlighter Swipe** — A numbered heading with a gold highlighter bar wiping left->right behind it as the heading fades in; acts as a chapter marker across a how-to.
  - *build:* LumaHighlightBar (wipe enter already supported) behind a heading + FloatingNumberedChipRow for the number, box-highlight style, gold #D4AF37.
- **One-Word Emphasis Within Caption** 🔧NEW CODE — Within a karaoke phrase exactly one keyword renders full saturation/weight while siblings dim to ~50%.
  - *build:* hormozi-pop caption style with recolor+pop on the emphasized word index; add emphasis_style enum (color-shift|bold|gold-glow|underline); siblings get reduced opacity.
- **One-Shot Opening Title Card** — Large solid dark rounded-rect with bold white ALL-CAPS centered theme line shown once at t=0-4s then exits.
  - *build:* AnimatedOpenerTitleOverDarkSet directly, text+durationFrames from template JSON, blur-in for soft push or pop for hard entrance. Navy card, gold accent rule.
- **Editorial Cyan Karaoke Caption** — All words shown at once, active word bright cyan, past words white, upcoming faded light-blue; colors snap at speech cadence for an editorial register.
  - *build:* editorial-cyan caption style (already in set) wired to recolor with three states active #5BC0E8 / past #FFFFFF / future #A8C5D9, no position animation.
- **Full-Sentence Single-Italic-Emphasis Caption** 🔧NEW CODE — Whole sentence fades in as one unit with exactly one italic word held at 1.05x scale; editorial/quote register.
  - *build:* slide-clean/classic caption sub-mode 'sentence' with emphasisIndex; segment fades over 8f; emphasized token italic + 1.05x via new 'emphasis-hold' animation.
- **All-Caps Chunked Phrase Swap** 🔧NEW CODE — Single ALL-CAPS white phrase (2-4 words) centered low, soft drop shadow, no plate; hard-swaps per VO beat chunked not word-by-word.
  - *build:* condensed-hype/classic style with a new chunked-phrase grouping (batch Whisper words into pause-group pages), 'pop' on entry + 4f fade + translateY(6->0).
- **Terminal Type-On Checklist** 🔧NEW CODE — Monospace lines reveal one at a time with a gold 'ok' badge popping after each lands; staged satisfying build.
  - *build:* DiagnosticCalloutCard or BuildingBulletListOverSpeaker in type-terminal style; add 'stagger-lines' reveal where each line types on then a badge pops, driven by Whisper timestamps.
- **Building Bullet List Tracking the VO** — Accent pills/list items slide-up + fade in one at a time as each is mentioned, accumulating rather than replacing.
  - *build:* BuildingBulletListOverSpeaker directly, each item slide-up 16px + fade over 8f staggered on Whisper boundaries, paired with FloatingNumberedChipRow index. Navy pills, gold index.
- **Gold Marker Sweep on Key Sentence** 🔧NEW CODE — A translucent gold highlight wipes left-to-right across the single load-bearing sentence as the VO hits it.
  - *build:* box-highlight caption style + a box word-reveal variant animating width 0->100% over ~16f in rgba gold, or LumaHighlightBar swept horizontally, triggered on the emphasized word group.
- **Serif-Glyph Shortcut Recap List** — A clean key:value reference reveal ('<symbol> - <meaning>') in mono/serif, good for CLI/AI-tool teaching beats.
  - *build:* BuildingBulletListOverSpeaker in slide-clean or type-terminal style, each bullet '<glyph> - <label>', staggered slide-up; full-frame or behind speaker via SpeakerForegroundMatte.
- **Word-Timestamp Karaoke Highlight (baseline)** — Subtitle words highlight exactly on their spoken timestamp; the workhorse caption for every reel.
  - *build:* hormozi-pop or box-highlight caption style with recolor/box word animations fed by faster-whisper word timings. No new code; ensure overlay enter times bind to word.start.

## transition (11)
- **Continuous-Audio B-Roll Cut Cadence** 🔧NEW CODE — Audio runs continuously while the visual hard-cuts between settings every 3-5s to keep a static monologue alive.
  - *build:* Layout engine with a frame-driven source picker pickBrollAtFrame(frame, cadence=120, srcs[]) swapping the region media on cut; captions + hook pill stay pinned.
- **Letterboxed Cinematic Quote Hard-Cut** 🔧NEW CODE — Hard-cut into a 12% letterboxed cinematic crop with vignette + single-line bottom quote, hold ~120f, hard-cut back.
  - *build:* New 'letterbox-cut' transition: camScale zoom on focal point + animated black bars + DimSurroundingsSpotlight vignette + slide-clean single-line caption. Hard cuts via layout engine.
- **Cam-Shrink-to-Corner** 🔧NEW CODE — Full-frame face cam smoothly shrinks, rounds corners + drop shadow, and slides into a corner while a dark-mode background reveals behind.
  - *build:* New 'cam-shrink-to-corner' transition using camScale + animated focal point interpolating speaker region full-bleed->corner over ~0.5-1s with eased borderRadius/boxShadow. Builds on smooth grow/shrink.
- **Circular Speaker PiP Over Screen-Rec** — When base switches to a screen-recording, the speaker shrinks into a circular PiP bubble in a corner then scales back out.
  - *build:* Layout engine corner region holding the speaker clip with circle mask (border-radius 50% + object-fit cover) + gold drop-shadow ring, smooth scale in/out. Cheap version needs no matte.
- **Hard-Cut on Word Boundary (discipline)** 🔧NEW CODE — Clean hard cut synced to a word/voice beat between registers; restraint is the technique, overlays suppressed during full-bleed source.
  - *build:* Layout engine transitions=cut fired on Whisper word boundaries; add a 'suppressOverlays' flag per shot so molecules hide while a full-bleed asset plays.
- **Tella Cursor-Follow Auto-Zoom** — An eased ken-burns zoom/pan toward the UI region being discussed acts as an emphasis pointer, keeping long screen-share passages alive.
  - *build:* Layout engine camScale zoom + focal point with smooth (grow/shrink), animating focal point toward a target region over a few seconds; optionally pair with RegionBoxAnnotation.
- **Two-Register Cut: Studio <-> Warm** 🔧NEW CODE — Hard-cut between a dark studio-compositor register (overlays + zoom on) and a warm full-bleed face-cam register (overlays off) to change rhetorical gear.
  - *build:* Add a mode discriminated union to the talking-head layout (studioCompositor vs warmPodcast); switch via cut on a beat; camScale zoom only in studio mode.
- **V-Split Seam Layout with Chunked Caption** 🔧NEW CODE — Frame splits 50/50 horizontally — graphic top, speaker close-up bottom — with a 3-4 word ALL-CAPS chunked caption sitting at the seam; sharp seam, no crossfade.
  - *build:* New 'v-split' region preset (two stacked full-width regions ratio 0.5); top holds a graphic/overlay, bottom the speaker; caption at seam y; enter as hard cut. ~25 lines.
- **Full-Bleed Silent-Hook Opener -> Card Slide-Up** 🔧NEW CODE — Open full-bleed on an intriguing visual for ~1.5s of silent curiosity, then a title/identity card slides up and narration begins.
  - *build:* Add silentDuration prop to opener flow: first ~1.5s camScale slow push with no overlay, then trigger AnimatedOpenerTitleOverDarkSet via new 'slide-up' transition as VO enters.
- **Crossfade Dissolve Between Demos** 🔧NEW CODE — Rare clean cross-dissolve between a full-bleed talking head and a framed screen-share demo, alternating with hard cuts.
  - *build:* Add a 'crossfade' transition type to the layout engine (opacity blend over ~10f) alongside the existing cut/smooth, driven by a scene list.
- **Clockwise Grid Cell Stagger-In** 🔧NEW CODE — Four comparison cells reveal in clockwise order (TL->TR->BR->BL), each scale-popping + fade, presenter held between rows — a composed X-vs-Y reveal.
  - *build:* New ModelComparisonGrid layout (2/3/4/6 cells) of FloatingProductCard cells; each scale-pop + fade staggered 6f CW; labels slide-up below; speaker centered via SpeakerForegroundMatte.

## overlay-combo (15)
- **Region Emphasis Box on UI/Hardware** — Animated stroke/fill rectangle over a screen-rec or hardware B-roll (box a port, highlight a code line, box a row) with a small number label; one pattern, many uses, no AI.
  - *build:* RegionBoxAnnotation (box, enter 'draw') + LumaHighlightBar (fill/underline) at fixed {x,y,w,h} over base media + small FloatingNumberedChipRow label. Gold/cyan stroke.
- **Emoji/Icon Trio Above Hook Pill** — A horizontal strip of 3-4 icon glyphs centered just above the persistent hook pill, visually compressing the claim.
  - *build:* IconPopOverSpeaker as a row (IconStatChipStack horizontal) anchored above a PersistentCornerBadge hook pill; staggered scale-pops; rendered as one molecule group.
- **Price Strikethrough + New-Price Chip** — Over a listing screenshot, an old price gets a strikethrough that pops across, then a colored new-price chip scales in beside it with a bounce.
  - *build:* FloatingProductCard with two text nodes: old price + animated strike (scaleX 0->1) + a colored chip using the bounce word animation. Gold/cyan chip. Anchored near price region.
- **Side-by-Side Region Comparison Split** — Two app-window/B-roll regions side-by-side with a 4px divider for direct comparison; optionally dim one half.
  - *build:* Layout engine two media regions at 50/50 with divider; DimSurroundingsSpotlight on the inactive half; stat chips via IconStatChipStack / ColumnarNumberWithDividers.
- **Neon-Ring Face-Cam PiP Over Source** 🔧NEW CODE — Circular face-cam PiP with a thick neon-cyan ring parked in a corner over full-bleed source material; corner dodges to avoid app UI.
  - *build:* New NeonRingFaceCamPIP molecule: border-radius 50%, ~10px cyan #5BC0E8 ring, ~22% frame width, corner prop, over a full-bleed source region + PersistentCornerBadge branding.
- **Persistent Compliance/Disclaimer Block** — A 3-4 line white sans disclaimer block at bottom-center on the opener (fade in/hold/fade out) as a branded compliance device.
  - *build:* EducationalDisclaimerCaption or DiagnosticCalloutCard pinned bottom-center driven by template JSON {lines[], dwellFrames}, slide-clean style, classic fade.
- **Magnified Pull-Quote Card Over Article** — A magnified serif pull-quote card with soft drop-shadow scales in over an article screenshot, optionally with a tweet anchor and corner PiP.
  - *build:* MagnifiedPullQuoteCard (exists in components/) over a full-bleed article image + FloatingTweetCardOverSpeaker anchor + corner NeonRingFaceCamPIP. Stack as overlay regions.
- **Counter Badge + Highlighted Comparison Row** — A giant circled number counter beside a comparison element where one column/row is tinted/boxed to draw the eye — listicle marker + selective highlight.
  - *build:* FloatingNumberedChipRow (big counter) + RegionBoxAnnotation (gold box) or LumaHighlightBar (cyan fill) on the emphasized row; rows reveal top-to-bottom ~8f stagger; counter cross-fades per cut.
- **Glowing UI Mockup Floating Beside Speaker** 🔧NEW CODE — A UI mockup (prompt bar, app window) floats to one side of the keyed presenter on a dark BG with a soft glow halo and slight 3D tilt.
  - *build:* Speaker keyed via SpeakerForegroundMatte on dark region; beside it FloatingProductCard / IconPopOverSpeaker with CSS box-shadow cyan glow + ~5deg rotateY; scale 0.85->1 + glow swell 12f; DimSurroundingsSpotlight.
- **Identity Tweet Card + Live Artifact + Corner Cam** — A static tweet/post card top-third, a playing artifact in the middle ~60%, and a small corner webcam asserting authorship; card is the static anchor, artifact is the show.
  - *build:* FloatingTweetCardOverSpeaker (top, static) + center artifact region (layout engine) + speaker as small corner region. Pure dark bg, one accent (cyan/gold).
- **3D/Looped Plate Behind Number or Quote Card** 🔧NEW CODE — A looped abstract motion plate sits behind a big-number or quote composition to escape the flat-color-card look.
  - *build:* Add an optional background-plate slot to the layout engine (full region) holding a looped video plate behind ColumnarNumberWithDividers or KineticTypoCard. Plate is sourced media.
- **Glowing Prompt Bar Type-On** 🔧NEW CODE — A dark pill-shaped prompt bar with a soft glow types its text char-by-char with a blinking cursor, then a 'file pill' slides up — a diegetic 'watch me prompt' reveal.
  - *build:* New GlowingPromptBar molecule: rounded dark bar, cyan box-shadow glow, type-terminal style char-by-char + blinking cursor; file pill = small chip sliding up + fade. Overlay or behind speaker.
- **Input->Output Dual-Pane Reveal** 🔧NEW CODE — Two stacked rectangles: top static 'input' (sketch/screenshot), bottom plays the generated 'output' clip — a before/after with zero labels.
  - *build:* Two stacked regions via the v-split primitive (ratio tuned) + a header card via FloatingTweetCardOverSpeaker; input holds, output fades/cuts in.
- **Karaoke Caption Riding the Split Seam** 🔧NEW CODE — In a stacked layout (B-roll top, face-cam bottom) a dark pill karaoke caption sits exactly on the seam, advancing word-by-word.
  - *build:* Layout engine stacked split + hormozi-pop caption (dark pill, white sans) positioned at the 45-55% seam line, 'pop' word animation; payoff modifier collapses bottom half to full-bleed.
- **Faked Email/Inbox Diegetic Prop Card** 🔧NEW CODE — A composed faux inbox card (subject, sender, body) centered on dark bg as an 'imagine you got this email' device; scale-pops with a tiny rotation correction, body reveals line-by-line.
  - *build:* FloatingProductCard 'email-card' variant: header row + body lines staggered fade; new 'pop-derotate' animation (scale 0.95->1 + rotation 1->0 over 12f). Over dark set or behind speaker.

## Gaps / new-component suggestions
- NeonRingFaceCamPIP — circular face-cam PiP with neon ring over full-bleed source (inverts the matte: source is hero, speaker is inset). Listed by mreflow/Jack corner-cam patterns; no existing molecule.
- GlowingPromptBar — diegetic prompt/terminal input bar with char-by-char type-on, blinking cursor, glow, and attached file pill. Core to AI-tool demo reels; no current molecule.
- New word-reveal animations needed: count-up (number ticking to value on word timestamp), track-fade (letter-staggered low-opacity resolve), emphasis-hold (italic + 1.05x scale), pop-derotate (scale + rotation correction), and a highlighter width-wipe variant for the box animation.
- New transition types needed: crossfade (opacity dissolve), slide-up / slide-from-edge (card entrances), letterbox-cut (bars + vignette + zoom), cam-shrink-to-corner (full-bleed->corner with eased radius/shadow), and macro-overflow-scroll depth reveal.
- Layout-engine primitives needed: v-split / stacked-split region preset (also unlocks Input->Output dual-pane and seam-caption), a per-shot suppressOverlays flag, a frame-driven b-roll source picker (pickBrollAtFrame for 3-5s cadence), an optional full-region background-plate slot, and a studioCompositor vs warmPodcast register mode.
- ModelComparisonGrid — 2/3/4/6-cell comparison grid layout with clockwise stagger-in; no current grid molecule (FloatingProductCard cells would compose it).
- Brand-color retargeting of YellowGlowWordCallout — currently yellow-glow only; needs cyan/gold/navy sentiment variants + a stroke (no-glow) mode to match the Armando Inteligencia palette. Most ideas assume this exists.
- Chunked-phrase caption grouping mode — batching Whisper words into VO-pause phrase pages (3-5 words) is assumed by several text-reveal ideas but is not a current caption grouping primitive.
- Persistent top-third hook pill — PersistentCornerBadge is corner-anchored; a thin top-third full-duration pill variant is needed and reused by the icon-trio combo.
- No verified inventory of the exact word-animation enum across all caption components — confirmed only 'pop' and RegionBoxAnnotation(pop|draw)/LumaHighlightBar(wipe|fade) in source; recolor/flip/bounce/slide-up/blur-in are declared in the brief but should be verified before wiring ideas that depend on them.