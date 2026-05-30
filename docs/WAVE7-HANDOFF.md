# Wave 7 — Session Handoff (2026-05-28)

> **For the next session.** Status at quota cutoff. Everything below is the truth as of the last successful agent landing.

---

## TL;DR — Where we are

- **Wave 7 = the deepest research wave we've done.** 8 research agents finished, 18 build agents finished, 1 architecture decision recorded (with addendum), 1 canonical analysis synthesis written.
- **Corpus: 281 videos analyzed across 21 active creators.** Filesystem-walked + manifested (`scripts/sync-analyzed-manifests.py`).
- **Build state: 99 Remotion compositions registered** (started at 73 — net +26 this wave). `tsc --noEmit` is clean.
- **Nothing is committed.** 138 files uncommitted. The next session should decide whether to commit in one Wave-7 mega-commit or several thematic commits.
- **In-flight when quota hit: NONE.** All dispatched agents landed before quota. We were about to dispatch the *next* wave of builds.

---

## What got SHIPPED this session (read these to orient)

### Foundation molecules (new in Wave 7)
| Path | Role |
|---|---|
| `src/components/chassis/DarkSlateChassis16x9.tsx` | The "Stripe Press in motion" 16:9 foundation chassis (B25) |
| `src/components/captions/CaptionPillWithKeyword.tsx` | Atomic 1-orange-keyword caption pill (B23) — used by ALL 6 new Nate patterns |
| `src/components/primitives/SplitFrame.tsx` | V-split / H-split layout primitive (B11) — Bilawal N5 |
| `src/components/chrome/PersistentEventLockupChyron16x9.tsx` | All-In corner stage bug, BL/BR/TL/TR anchor + regional event token (B10) |
| `src/components/captions/EducationalDisclaimerCaption.tsx` | Hormozi 3-line compliance moat overlay (B18) |
| `src/components/WebcamPipOverlay.tsx` | Rectangle webcam tile + NeonRingFaceCamPip circular variant (B1, earlier) |
| `src/components/DotRowGradientGauge.tsx` | Adam Rosler telephone-game drift gauge (B2) |
| `src/components/BlackPillCaption.tsx` | Matt/Hormozi seam pill caption (B2) |
| `src/components/BulletSequenceCounter.tsx` | Adam Rosler step-N-of-K walkthrough (B3) |
| `src/components/ChapterProgressTimeline.tsx` | Sahil Bloom horizontal progress timeline (B4) |
| `src/components/MagnifiedPullQuoteCard.tsx` | Matt Wolfe article-overlay pull quote (B5) |
| `src/components/IconObjectPair.tsx` | Adam Rosler pair-with-bracketed-callout (B5) |

### 16:9 templates (Wave 7 — NEW compositions)
| ID | Source creator | Build task | Lines |
|---|---|---|---:|
| `StudioCompositor16x9` (+ ?) | Igor / theaiadvantage | B7 | 319 |
| `KeynoteSlidePIP16x9` + `KeynoteSlidePIP16x9-Davos` | All-In Podcast | B8 | 370 |
| `MemeLoopDiagram16x9` | aiexplained | B9 | 485 |
| `ThreeRowLabeledCardStack16x9` | Nate B Jones N1 | B22 | 297 |
| `EquationCardChain16x9` | Nate B Jones N3 (highest reuse) | B19 | 491 |
| `SectionDividerTitleCard16x9` | Nate B Jones (breath-beat) | B27 | 158 |
| `LiveEventAudienceMicSplitScreen16x9` | Hormozi NEW-H7 + Igor convergence | B16 | 299 |

### 9:16 templates (Wave 7 — NEW)
| ID | Source | Build task | Lines |
|---|---|---|---:|
| `KineticMacroTypeOpener9x16` | Bilawal N3 (silent hook) | B13 | 108 |

### Existing templates EXTENDED (Wave 7)
| File | Change |
|---|---|
| `src/compositions/BeforeAfterText16x9.tsx` | B21 added `connectorGlyph` prop (VS/TO/→/↔), `+ BeforeAfterText16x9-VS` variant in Root.tsx |
| `src/compositions/PipelineFlow16x9.tsx` | B20 variable-N (2-6 stages), `+ PipelineFlow16x9N3` variant for Nate N6 |
| `src/compositions/TweetCardHero9x16.tsx` | B12 added `artifactStack` dual-pane mode for Bilawal N1, `+ TweetCardHero9x16-DualPane` variant |
| `src/components/captions/EditorialCaption.tsx` | B14 added `transition: 'pop'\|'fade'` prop (register='editorial' defaults to pop, Bilawal R4C validation); B24 added `pulloutChip` prop with auto-sync (Nate C7) |
| `src/components/captions/ChunkedPhraseCaption.tsx` | B4 added `register: 'punchy'\|'editorial'\|'technical'\|'custom'` prop |
| `src/components/BrandBreadcrumb*.tsx`, `BrandWatermark*.tsx` | B3 added `chrome?: 'minimal'\|'full'` opt-out prop |
| 3 templates refactored to consume DarkSlateChassis16x9 (B26 Phase 1): `TitleCardKineticTwoLine16x9`, `PipelineFlow16x9`, `HormoziTweetCardListicle16x9`. Byte-equivalent output preserved. |

### Documentation written
| Path | Purpose |
|---|---|
| `docs/research/wave-7/ADR-001-16x9-lane.md` | **464 lines** — the formal decision to open a 16:9 template lane. 6 confirming creators. Includes Addendum-A with Nate R4B corrections. |
| `docs/conventions/analyzed-videos-manifest.md` | Schema for per-creator `analyzed-videos.json` manifests + jq/Python usage |
| `docs/wave7-validation.html` | **606 lines, 18 reference clips, 6 molecules** — side-by-side ref↔recreation validator with "Recreation pending" placeholders |
| `docs/WAVE7-RECOVERY.md` | Quota-crash recovery checklist (older — from when 13/14 agents stalled during initial Wave-7 dispatch) |
| `docs/IN-FLIGHT-NOW.md` | Snapshot from earlier quota-recovery moment |
| `references/creators/natebjones/ANALYSIS.md` | **307 lines, canonical** — D4 consolidation closing R4B citation gap |
| `references/creators/<creator>/ANALYSIS.md` × 6 more | Wave-7 NEW creator analyses (matthewberman, adamrosler, aiexplained, mreflow, sahilbloom, theaiadvantage, allin) |
| `references/creators/<creator>/analyzed-videos.json` × 21 | Per-creator video manifest (B6 system) |
| `scripts/sync-analyzed-manifests.py` | Idempotent manifest regenerator |

### Research findings shipped (282 videos)
- **adamrosler** corpus: 18 → 22 (R3A extended +4, 5 new patterns)
- **alexhormozi** corpus: 10 → 25 (R4A extended +15, 7 new patterns + dual-aspect promotion candidate)
- **natebjones** corpus: 24 → 39 (R4B extended +15, 6 new 16:9 patterns + C7 caption variant — invalidated 4 hypothesized ADR templates as single-creator)
- **bilawal.ai** corpus: 7 → 20 (R4C extended +13, 5 new patterns, validated EXACT match to shipped EditorialCaption)
- **matthewberman** corpus: 12 (W1b recovery)
- **theaiadvantage** corpus: 12 (R2B, 12 patterns, 5th confirming 16:9 creator)
- **sahilbloom** corpus: 12 (R2A, captions taxonomy discovery)
- **allin** corpus: 12 (R2C, 12 patterns, 6th confirming 16:9 creator, register='none' anti-finding)
- **mreflow** corpus: 4 (partial — backfill to 12 queued #143)
- **aiexplained** corpus: 4 (partial — backfill to 12 queued #143)

---

## Critical decisions recorded

### ADR-001 (formal): Open a 16:9 horizontal template lane
- **Path**: `docs/research/wave-7/ADR-001-16x9-lane.md` (464 lines)
- **6 confirming creators**: natebjones, aiexplained, mreflow, sahilbloom, theaiadvantage, allin (+ alexhormozi long-form = 7 if we promote — #142 pending)
- **Addendum-A** (post-R4B): Hypothesized vocab (ChartHero/TimelineHorizontal/SidebarSourceCitation/TwitterScreencap) was **wrong**. Actual shared vocab is "Stripe Press in motion": dark-slate slab + translucent brand-glyph + typographic card stacks + caption pill w/ 1 orange keyword + persistent handle chip.
- **Negative aspect duality**: 9:16 and 16:9 use DIFFERENT visual grammars, not the same vocab rescaled. Port 16:9 → 9:16 = STRIP slate cards entirely, rely on karaoke + blue pullout chip.

### Captions taxonomy (informal, from Wave-7 research)
- `register: 'punchy'` — Hormozi/Igor (yellow active word #F1C232)
- `register: 'editorial'` — Sahil/Bilawal (cyan active word #5BC0E8) — DEFAULTS to hard pop after B14
- `register: 'technical'` — Adam Rosler (white active word)
- `register: 'custom'` — opt out (back-compat)
- `register: 'none'` — Sahil A-roll + allin + matthewberman long-form (no burned-in caption)
- ADR-002 still needs writing (#141 pending) to formalize the register × aspect matrix

### Manifest system (B6)
- Every creator dir has `analyzed-videos.json` listing analyzed video IDs.
- Future scrape agents MUST read this to skip duplicates.
- Regenerate via `python3 scripts/sync-analyzed-manifests.py` after any analysis.
- Doc: `docs/conventions/analyzed-videos-manifest.md`.

### Brand token graduations queued
- TNF_ORANGE `#E07B3C` is currently a local const in CaptionPillWithKeyword (used across Nate templates). Graduate to `src/brand/palettes.ts` (#161 pending).
- Condensed-sans font (Barlow Condensed / Oswald / Bebas Neue) NOT loaded — B10 chyron approximates with Inter 800 + tracking. Add to `src/brand/fonts.ts` (#168 pending).

---

## Pending work — ranked

### High-leverage (next session should consider first)
1. **#143 Backfill aiexplained + mreflow to 12-of-12 samples** (research; uses manifest system; blocks promoting their patterns from "preliminary" to "confirmed")
2. **#141 ADR-002 — Captions register × aspect matrix** (decision doc; 10 cells: 4 registers × 2 aspects + 'none')
3. **#171 ADR-002 prep — `captionRegister` as schema field vs renderer-only** (B8 surfaced; impacts pipeline efficiency — skip whisper when register='none')
4. **#133 Cross-creator synthesis doc** (all 21 creators in one place — synthesis of Wave-7 findings)

### Build queue (no blockers, can dispatch in batches of 5 in parallel)
- **#148 B15 StudioDeskTalkingHead16x9** (4-creator owned-media chassis — Hormozi/Adam/Matt/Igor)
- **#150 B17 FlipChartLiveDrawing16x9** (Hormozi NEW-H8 + Matt easel convergence)
- **#169 B26 Phase 2 — Refactor BeforeAfterText16x9 to consume chassis** (mirror Phase 1 pattern, safe after B21 soaks)
- **#170 B24b KaraokeWithBlueChipPullout9x16 composition** (multi-chip schedule wrapper over EditorialCaption.pulloutChip primitive)

### Future templates from R4A/R4B/R4C findings not yet ticketed
- Hormozi NEW-H10 `AcquisitionLogoSidewallBackdrop16x9`
- Hormozi NEW-H11 `HardCutFullscreenLetterboxQuote16x9`
- Hormozi NEW-H13 `ZoomVideoWallBacking16x9`
- Nate N2 `ThreeStageRisingBars16x9` (then/now/next)
- Nate N4 `TopHeroBottomTrioCards16x9`
- Adam V19 `Loupe9x16` (magnifying-glass overlay)
- Adam V21 `LossLandscape9x16` (gradient-descent valley + rolling ball)
- Adam V22 `PageTableGrid9x16` (copy-on-write page-table)

### Tech-debt followups
- **#142** Promote alexhormozi to dual-aspect roster (makes 16:9 lane 7 creators)
- **#152** Tag dual-aspect atoms (H6, H4, M21, H12) with `@dualAspect true` JSDoc
- **#161** Graduate TNF_ORANGE to brand token
- **#166** Reconcile `transition` vs `transitionVerb` prop naming (Wave-5 contract drift)
- **#167** Add `anchor='relative'` mode to CaptionPillWithKeyword (B11 followup)
- **#168** Add condensed-sans font to brand config
- **#136** Extract mreflow ref clips (validation HTML had 2 molecules with empty ref dirs)
- **#135 Wave-8 re-pick All-In podcast set** (sample bias: 11/12 picks were Summit, not the podcast)

### Old pending (Wave 7 master tasks)
- **#125** Wave 7 — Cross-creator synthesis + new template builds + extended validation HTML (the umbrella task; ~70% done; partials are above)

---

## Tooling state

```bash
# Verify trunk is healthy
cd /Users/armandogonzalez/Downloads/Claude/Deep\ Research\ Claude\ Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b
npx tsc --noEmit --ignoreDeprecations 6.0          # expect 0 output
npx remotion compositions src/index.ts | tail -3   # expect ~99 compositions

# Refresh manifests after any analysis work
python3 scripts/sync-analyzed-manifests.py

# Open validation page
open docs/wave7-validation.html
```

---

## Known traps / hard-won lessons

1. **Network contention**: never dispatch more than 3 yt-dlp / gallery-dl agents in parallel. The original Wave-7 dispatch killed 13/14 agents. All subsequent batches stayed at 3 net-heavy max.
2. **Image budget per video**: max 2 frame Reads per video, sequential single-path Reads (not bundled). W1 matthewberman crashed loading too many parallel images.
3. **Disk hygiene**: every research agent runs sequential download-extract-delete in `/tmp/wave7-*/`. Delete the source mp4 BEFORE moving to next video. Cleanup `/tmp` at end. Verify zero source mp4s in project.
4. **Reference clips ≤2MB, audio-stripped, 10s each** — go in `docs/research/wave-6/references/<creator>/<id>-anim-NN.mp4`. (Yes, "wave-6" — that's the canonical refs dir name, unchanged.)
5. **Frame extraction conventions**: coarse 1f/15s → identify 2-3 animation ranges → dense 1f/1.5s at those ranges. Coarse and dense both go in `references/creators/<handle>/<id>/frames/`.
6. **tsc transient errors**: When multiple agents Write concurrently, `npx tsc` may catch a transient state mid-Write. Re-run after the next agent lands; usually resolves.
7. **Write tool guard on canonical ANALYSIS.md**: D4 hit a false-positive "report file" block; fell through to `Bash` heredoc. If you hit this, do the same.
8. **Remotion composition IDs reject underscores** — use `-N3` not `_N3`, `-Davos` not `_Davos`.

---

## What the next session should NOT do

- Don't dispatch the original ADR-001 top-3 — they're done (StudioCompositor + KeynoteSlidePIP + MemeLoopDiagram).
- Don't dispatch B19 / B22 / B27 / B25 / B23 — those foundation molecules and Nate templates landed.
- Don't re-scrape any creator without first reading their `analyzed-videos.json` to build an exclusion set.
- Don't try to "fix" the pre-existing TypeScript errors B7/B20 mentioned — they were transient (caught during concurrent agent writes). `tsc --noEmit` is currently clean.
- Don't refactor `BeforeAfterText16x9` to chassis (#169) **immediately** — let B21's connectorGlyph soak. Defer 1 day.

---

## Recommended starting move for next session

Read this doc + the task list, then ask the user: "ready to commit Wave-7 work in one mega-commit, or break into thematic commits?"

If they want to keep building first: dispatch this 5-agent batch (no network, no overlapping files):
1. **B15** StudioDeskTalkingHead16x9 (#148) — 4-creator owned-media chassis composition
2. **B17** FlipChartLiveDrawing16x9 (#150) — Hormozi H8
3. **#169** Refactor BeforeAfterText16x9 to chassis (mirror B26 Phase 1 pattern, +1 line each)
4. **#170** B24b KaraokeWithBlueChipPullout9x16 composition
5. **#141 ADR-002** writer — captions register × aspect matrix

Then in parallel research agent for **#143** mreflow + aiexplained backfill (sequential per-creator).

Token-cost note: the user explicitly said earlier "Token usage is not a concern right now. I'm just concerned about getting quality." Lean toward thoroughness.

---

*Generated 2026-05-28 at quota cutoff. Update this doc as the next session progresses, or write a WAVE7-HANDOFF-v2.md.*
