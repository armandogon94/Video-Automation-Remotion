# @bilawal.ai — Wave 4 Consensus (5 voters)

> **Method:** Jaccard-style consensus across 5 independent Opus voters. HIGH = ≥3, MED = 2, LOW = 1.
>
> **Headline:** Prior ANALYSIS claimed "Bilawal runs ONE tentpole template (tweet+dashboard) — tweet card is static for the entire reel." The 5-voter pass reveals **3 distinct templates, 12 missed motion patterns, the tweet-card avatar SWAPS between scenes, the card DEMOTES itself mid-reel, the face-cam is a chroma-key cutout (not a rectangle PiP), the Anduril Lattice UFO frame is a 6-layer faux-product UI (not 2), and the HUD numbers TICK frame-over-frame.** Prior captured the shape but none of the life.

---

## HIGH-CONFIDENCE FINDINGS (3+ voters)

### 1. HUD telemetry illusion: every static-looking info element is actually ticking 🔴 SHIP-FIRST
**Votes:** V2 (M5 number ticker + datestamp ticker), V3 (N5 explicit `RollingDigitTicker` / `KineticHUDCounter`), V4 (#1 "HUD telemetry illusion — the entire account's signature")

The single most polished thing in the corpus. Sampled frames show:
- `ALT: 35,000 FT → 36,000 FT`, `SPEED: MACH 4.2 → 3.2`, `RNG: 15 NM → 14 → 13 → 12` (1 unit per ~1.5 s)
- `GIFTS DELIVERED: 4,500,000 → 3,148,093`
- `CROSSING EVENTS: 121 → 140 → 4 → 7 → 14` (never holds the same number twice)
- Date ticker: `FEB 25 → FEB 27 → MAR 02 → MAR 06 → APR 03`

Prior treated these as flavor labels. They are **load-bearing kinetic typography** that converts infographics into live-feed simulations. V4: "it is the difference between a screenshot and a heartbeat."

**Action:** Build `<RollingDigitTicker value step interval>` shared primitive. Use in `BigNumberHero9x16`, `BenchmarkBars9x16`, every dashboard/HUD scene. **Highest-leverage primitive in the entire corpus.**

### 2. TweetCardHero with AVATAR SWAP and DEMOTION TRANSITION 🔴
**Votes:** V1 T-1 (3/7 reels), V2 #1 sticky tweet card top-third, V3 N1 ("avatar swaps between scene cuts") + N2 ("card scales 1.0→0.6 mid-reel"), V4 #2 ("anchored frame, mobile content")

Prior claimed "card is static for the entire reel." Wrong in two ways:
- **N1 Avatar swap:** Same tweet body, different avatar photo between scene boundaries (closed-smile → open-laugh). Subliminal "alive with the host."
- **N2 Tweet demotion:** Card starts ~25% frame height, then scales DOWN and shifts UP mid-reel to cede attention to the artifact. "Lead-with-author → cede-to-evidence" pacing.

**Action:** `<TweetCardHero>` schema: `avatar: string | string[]` (pick-by-time), `motion: 'static' | 'demote'`, demote scales 1.0→0.6 over ~300 ms.

### 3. ALL-CAPS karaoke captions, step-function pop, no fade, no pill 🔴
**Votes:** V1 T-2 (karaoke captions), V2 #3 ("ALL-CAPS single-line burned caption (drop shadow, no pill)"), V3 N9 ("ChunkedPhraseCaption shared across templates"), V4 #5 ("step-function pop on the syllable hit")

Two-to-four words per burst, hard centered bottom-third, **no animation curve** — instant on the syllable, instant off at chunk end. V4: "The rigidity of the timing IS the polish. An eased caption says 'I am a video maker.' A stepped caption says 'I am the source.'"

**Action:** Add `<ChunkedPhraseCaption>` mode to `EditorialCaption` — 3-word window, step-function, drop-shadow `2px / 60% opacity`, no background pill.

### 4. Hard cuts on the beat — journalism, not VFX 🔴
**Votes:** V1 (all three templates use hard cuts), V2 §6 (transitions = hard cut + overlay reveal only), V4 #4 ("no transitions — straight cuts only — reads as journalism, not creator hype-edit")

Bilawal **almost never crossfades, whips, or wipes**. Cuts are either straight cuts or scene-wide invert. The resistance to whip-pan/glitch transitions IS the OSINT-credibility move.

**Action:** Default to hard cuts everywhere. Reject built-in fancy transitions for Bilawal-inspired templates.

### 5. Two-accent discipline: amber + cyan + nothing else 🔴
**Votes:** V2 #4 ("Cyan accent system `#22D3EE` pills + dots"), V5 §2 ("Amber `#E0B96A` + cyan `#7BD4D9` + nothing"), V4 implicit

Amber = "the thing happened" (vessel paths, oil prices). Cyan = "the system is watching" (focus rings, live indicators, chokepoint markers). Red = negative deltas only. Yellow = outro CTA only. **No decoration colors.**

**Action:** Apply our brand version: `--accent-warm: #D4AF37` (our gold replaces amber), `--accent-cool: #6FB4E0` (lightened navy-cyan). Reserve red/yellow as meaning-only.

### 6. TRUE `#000` black background, NOT navy-with-tint 🔴
**Votes:** V2 BG ("pure black canvas — default backdrop"), V3 N4 ("pure black canvas"), V5 lesson #2 ("true black, not dark navy — letterbox bars vanish into device bezel")

On phones the letterbox bars vanish into the device bezel and the content "floats" — a "screenshot taken from real life" feel.

**Action:** Add `--bg-black: #000000` token. Use for Bilawal-style templates (HUD/dashboard/tweet hooks). Distinct from Carlos's warm-near-black `#080608` — different aesthetic register.

### 7. Multi-clip ArtifactMontage (artifact slot is NOT a single video) 🔴
**Votes:** V1 T-3 ("cycles through 3-5 prompt samples"), V2 #8 (pinned card + B-roll swap), V3 N11 ("ArtifactMontage — chimp → F1 car → fox in 30 s"), V4 #2 ("4-5 clip changes inside fixed tweet frame")

`DYh_jS_vM4L` (highest-engagement reel — 3,089 likes): tweet card stays identical while artifact slot cuts hard between 3-5 different Genie 3 generations. `DWeLzV4hxsp`: dashboard view 1 → 2 → 3 with zooms + panel changes.

**Action:** Artifact prop should accept `Array<{src, durationMs}>` not just `{src}`.

### 8. Damped Kalman-style camera follow on moving subjects 🔴
**Votes:** V2 chrome (viewfinder brackets + selected-vessel cursor), V3 N3 ("keyed cutout floats over data — soft-masked"), V4 #3 ("Kalman-style camera follow — subject drifts 85-95% of velocity")

The reticle stays glued to a moving ship icon while the transit trails extend behind like a comet tail. Subject sits slightly off-center (drifts), not pinned. Lag is the signature.

**Action:** Build `dampedFollow(targetPath, dampingFactor=0.9)` for any reticle/cursor/PiP that tracks a moving subject. Hardest motion primitive to replicate; biggest "real surveillance feed" payoff.

---

## MED-CONFIDENCE FINDINGS (2 voters)

| Finding | Voters | Action |
|---|---|---|
| `<KeyedFaceFloater>` chroma-key cutout (not rectangle PiP) | V3 N3, V2 #9 | Build feathered alpha-mask wrapper for face-cam |
| `<FauxProductUI>` 5-6-layer chrome (Anduril Lattice + side rail + counters + corner brackets + PiP globe) | V3 N4, V2 chrome §2-3 | High-density "I built a tool" template — promote priority |
| `<NewsClipCitation>` press-card cite overlay | V3 N6 | Distinct from `TechNewsFlash9x16` (full canvas) — this is overlay-on-evidence |
| `<TitledDossierCard>` chapter-break composition | V3 N7 | Kicker + hero title + amber stat + bullet dossier |
| `<StatCounterCard>` (big numeral + tiny uppercase label) | V2 #5, V3 N5 | Cross-creator with Carlos/DIYSmart |
| `<DODDeltaChip>` green-up / red-down monospace | V2 #6 | Tiny but reliable |
| `<DatestampTicker>` (`MMM DD, YYYY` uppercase letter-spaced) | V2 #7 | Drive from single Date prop, `Intl.DateTimeFormat` + `.toUpperCase()` |
| Cinematic chapter title (extended/condensed mono, +200 tracking, `TEHRAN'S TOLLBOOTH`) | V5 typography | Cross-creator with Carlos `SectionLabel` |
| `<LiveCursorPresence>` (faux cursor sprite over dashboard) | V3 N10 | Don't crop out the cursor — adds "this is real software" signal |
| `<CrossPromoEndCard>` (tablet mock + thumbnail + CTA arrow) | V3 N12 | Reuse YouTube-thumbnail assets |

---

## LOW-CONFIDENCE FINDINGS (1 voter)

- V3 N8: `DWr9DkpDzsI` reel was misclassified in per-reel index (talking-head-led, not Template A) — correction only
- V5 §A: Verified blue is classic-blue `#1DA1F2` not new X badge — stylistic identity statement
- V2 #10: Mock-OS chrome novelty / low-frequency reuse

---

## DELTA AGAINST PRIOR ANALYSIS.md

**Prior was right about:** pure-black canvas, tweet-card identity device, one-accent-per-scene direction, letterbox-then-artifact layout, all-caps tracked monospace HUD labels, `TweetCardHero9x16` gap in our typology.
**Prior was wrong about:** "tweet card is static for the entire reel" (avatar swaps + demote transition), "face-cam is rectangle PiP" (chroma-key cutout), "no transitions/cuts within the dominant frame" (5+ ways false), the UFO template being 2 layers (actually 6+).
**Prior missed:** 12 patterns including `RollingDigitTicker` (the entire HUD-telemetry signature), `TweetDemotionTransition`, `KeyedHostFloater`, `FauxProductUI`, `NewsClipCitation`, `TitledDossierCard`, `ChunkedPhraseCaption` as shared rather than per-template, `ArtifactMontage`.

---

## SPRINT 5 QUEUE (Bilawal-derived only)

🔴 **Must build:**
1. `<RollingDigitTicker>` shared primitive — **the highest-leverage component**
2. `<TweetCardHero>` v2 with `avatar: string[]` swap + `motion: 'demote'` transition
3. `<ChunkedPhraseCaption>` 3-word step-function mode in `EditorialCaption`
4. `dampedFollow()` Kalman-style camera utility
5. Brand tokens: `--bg-true-black: #000000`, two-accent discipline application

🟠 **Build later:**
- `<KeyedFaceFloater>` alpha-mask wrapper (waits for keyed avatar asset)
- `<FauxProductUI>` 6-layer dashboard composition (high effort, niche use)
- `<NewsClipCitation>` press-card overlay
- `<TitledDossierCard>` chapter-break
- `<DatestampTicker>`, `<DODDeltaChip>`, `<StatCounterCard>` primitives
- `<CrossPromoEndCard>` (waits for YouTube channel)

🟢 **Skip:** Mock-OS chrome (novelty), `LiveCursorPresence` (polish detail).
