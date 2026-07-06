# AUTOEDIT DOGFOOD PLAYBOOK — talking-head → fully-edited video, graded against real creators

> **Who this is for:** the Opus session that continues this work. Armando's goal, verbatim:
> *"in the future, I give you one of my talking-head videos, and you can edit it completely
> for me"* — captions + timed overlays + cuts that look like what austin.marchese /
> creator-grade editors produce. This playbook is the REPEATABLE LOOP that gets us there:
> run the pipeline on real creator footage, grade the output against the creator grammar,
> fix the worst gap, re-run the SAME fixtures, repeat.
>
> **Written 2026-07-06 by Fable after Round 1** (which found and fixed 2 real bugs — see §6).
> Follow it literally; every command is copy-pasteable from the project root.
> **Permissions:** Armando granted use of Matthew Berman's videos (@matthew_berman) for this
> testing. austin.marchese footage is the existing study corpus. Do NOT publish any output
> containing their footage — internal QA only.

---

## 1. The principle

A dogfood run = **real third-party talking-head clip → `npm run autoedit -- --render` →
frame-strip QA → graded verdict vs the creator grammar (§4)**. Never grade on synthetic
clips (lavfi/TTS): real footage exposes what demos hide — Round 1's two bugs (§6) were
invisible in every demo driver and appeared within minutes on real footage.

Two failure classes to keep separate when grading:
- **Correctness bugs** (overlay at wrong time, hallucinated transcript, clipped text) → fix
  in code immediately, they block everything else.
- **Grammar gaps** (too few graphics, wrong overlay type for the moment, missing lower-third)
  → these are `suggestOverlays.ts` / planner work; log them, prioritize by §7.

## 2. The fixture library (deterministic regression clips)

Fixtures live at `output/dogfood/fixtures/` (gitignored). If missing, regenerate EXACTLY:

```bash
# Sources (KEPT on disk, do not delete):
#   references/creators/matthewberman/IwKuv4LrCVk/video.mp4  ("Anthropic is coming for EVERYTHING", 903s)
#   references/creators/austin.marchese/HGCHgD4uGgY/video.mp4 ("8 Claude Loops…", 1031s)
#   references/creators/austin.marchese/2fc0NX9vIJ8/video.mp4 ("Self-Improving System…", 1006s)
# If a source is gone, re-download: yt-dlp -f "bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720]" \
#   --merge-output-format mp4 -o "<creatordir>/<id>/video.mp4" "https://www.youtube.com/watch?v=<id>"
mkdir -p output/dogfood/fixtures
ffmpeg -y -ss 757 -t 25 -i references/creators/matthewberman/IwKuv4LrCVk/video.mp4 \
  -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k output/dogfood/fixtures/berman-end1.mp4
ffmpeg -y -ss 785 -t 25 -i references/creators/matthewberman/IwKuv4LrCVk/video.mp4 \
  -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k output/dogfood/fixtures/berman-end2.mp4
ffmpeg -y -ss 393 -t 22 -i references/creators/austin.marchese/HGCHgD4uGgY/video.mp4 \
  -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k output/dogfood/fixtures/austin-mid.mp4
# Round-0 fixture (the one that exposed the V24 timing bug):
ffmpeg -y -ss 292 -t 22 -i references/creators/austin.marchese/2fc0NX9vIJ8/video.mp4 \
  -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k output/footage/austin-test/austin-th-clip.mp4
```

Why these: `berman-end1/2` = clean talking head over a BRIGHT warm wall (the caption-contrast
stress case, FABLE V2); `austin-mid` = dark studio + his own baked graphics (tests our layer
over a busy frame); `austin-th-clip` = mostly-clean dark footage with a spoken stat ("99%").
**Rule: fixtures are frozen.** Same input → comparable output across code changes. Add new
fixtures, never re-cut existing ones.

## 3. The runbook (one dogfood round, step by step)

### 3.1 Picking NEW clean windows from a new video (when adding fixtures)
1. Download the video (yt-dlp command above; 720p is enough; NEVER scrape/download while a
   render is running — Remotion's font fetch breaks).
2. Overview grid — 48 frames tiled, eyeball where the FULL-FRAME talking head lives:
   `D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 IN.mp4)`;
   `STEP=$(python3 -c "print(max(1,round($D*30/48)))")`;
   `ffmpeg -y -i IN.mp4 -vf "select='not(mod(n,$STEP))',scale=240:135,tile=8x6:padding=3:color=0x101010" -frames:v 1 grid.png`
   → view grid.png with the Read tool. Tile k (row-major, 0-based) ≈ t = k/48 × D.
3. Dense-verify the candidate window (estimates are ±20 s — Round 1 missed once):
   `ffmpeg -y -ss <t0> -t 60 -i IN.mp4 -vf "select='not(mod(n,60))',scale=240:135,tile=6x5:padding=3:color=0x101010" -frames:v 1 scan.png`
   Accept only if every tile is graphics-free talking head.
4. Cut 20–30 s with RE-ENCODE (never `-c copy` — keyframe-snapped starts drift ±2 s):
   the `ffmpeg -ss <t> -t <len> -c:v libx264 -crf 18 -preset fast -c:a aac` form in §2.

### 3.2 Run the pipeline (per fixture × style)
```bash
npx tsx src/autoedit/cli.ts \
  --video output/dogfood/fixtures/<clip>.mp4 \
  --aspect 16:9 --language en \            # es for Spanish audio; language MATTERS (see §6 bug 2)
  --register <punchy|editorial|technical> \
  --caption-style <style> \
  --out output/dogfood/<clip>-plan.json \
  --render --handle "@armandointeligencia" --slug dogfood-<clip>
```
Round-1 matrix already run: berman-end1×hormozi-pop×punchy, berman-end2×box-highlight×editorial,
austin-mid×type-terminal×technical, austin-th-clip×editorial-cyan×editorial.
**Next rounds:** rotate the remaining styles (classic, slide-clean, blur-premium,
condensed-hype) over berman fixtures — the bright wall is the acid test — and re-run the
full existing matrix after every planner/caption change. ~30–40 s per render.

### 3.3 Inspect the PLAN before the pixels
```bash
python3 -c "
import json;p=json.load(open('output/dogfood/<clip>-plan.json'))
ws=p['captionTrack']['wordTimings']
print('words:',len(ws),'| overlays:',[(o['type'],o['fromFrame'],o['toFrame'],o['reason']) for o in p['overlayTrack']])
print(' '.join(w['text'] for w in ws[:25]))"
```
Red flags AT THIS STAGE (cheaper than rendering): word count implausibly low for the clip
length (≈2.5–3 words/s of speech expected — 6 words for 23 s = the §6 hallucination bug);
zero overlays on a 25 s clip (grammar gap §7.1); overlay windows overlapping each other;
Spanish text from English audio.

### 3.4 Visual QA (NON-NEGOTIABLE — duration checks catch nothing visual)
```bash
# full-arc strip (1 fps):
ffmpeg -y -i output/autoedit/dogfood-<clip>-edit.mp4 \
  -vf "select='not(mod(n,30))',scale=280:158,tile=6x4:padding=3:color=0x101010" -frames:v 1 strip.png
# full-res still at each overlay's planned midpoint ((fromFrame+toFrame)/2):
ffmpeg -y -i output/autoedit/dogfood-<clip>-edit.mp4 -vf "select='eq(n\,<mid>)'" -frames:v 1 ov.png
# and ONE frame OUTSIDE every overlay window (must be overlay-free):
```
View them. Grade with §4. If anything is suspicious, dense-extract that 2 s window at mod-3.

## 4. Grading rubric (score each render 0–2 per row; 14+ / 18 = shippable)

| # | Check | What PASS looks like (the creator grammar) |
|---|---|---|
| 1 | Overlay TIMING | Graphic enters within ±5 frames of its trigger word (verify: full-res at plan fromFrame+5 shows it mid-pop) |
| 2 | Overlay DENSITY | ≥1 graphic per 8–15 s of speech (austin's rate). 25 s with 0 overlays = automatic 0 |
| 3 | Overlay RELEVANCE | Type matches the moment: stat→callout, enumeration→bullet build, brand/tool→its logo (NOT the default brain emoji), quote/prompt→card |
| 4 | Caption LEGIBILITY | Readable over the brightest frame of the clip (Berman wall). Boxed/stroked styles pass; bare white fails (FABLE V2) |
| 5 | Caption SYNC | Karaoke highlight on the word being spoken (spot-check 3 random frames against audio position) |
| 6 | SAFE AREAS | Nothing clipped at frame edges; nothing under/over the handle chip; nothing on the face (FABLE V8) |
| 7 | CUT QUALITY | Silence-trim cuts don't clip word tails audibly (LISTEN to 10 s — frames can't hear; FABLE 4.4 pads landing) |
| 8 | DEAD AIR | No stretch > 15 s with zero non-caption visuals (ties to overlay density) |
| 9 | BRAND | Handle chip present, correct corner, no double-branding |

Record scores in `docs/research/autoedit-dogfood/ROUNDS.md` (append-only, one table per round,
cite the strip/still paths you actually viewed).

## 5. Creator-grammar targets (what "similar to austin" means, concretely)

From the 31-video austin study + FINAL-CONSENSUS (docs/research/austin-anim/):
- **Rhythm:** a graphic beat every 8–15 s. Talking-head-only stretches > 20 s do not exist.
- **Vocabulary by moment:** topic change → lower-third title card (~4 s, slides in, holds,
  exits); enumeration ("first/second", "N things") → progressive bullet/number build;
  spoken stat/number → big word/number callout ON the word; tool/brand name → logo chip pop;
  prompt/quote being read → glass prompt-card takeover (bg blurred+dimmed 30–40%);
  process description → diagram takeover (our new `FeedbackLoopCycle16x9/9x16` covers cycles).
- **Enter/exit:** everything eases in AND out (200–400 ms); nothing pops or vanishes; nothing
  overstays > ~6 s except full-screen cards while being read aloud.
- **Palette:** on OUR renders always brand navy/gold (`theme="brand"`); austin's warm palette
  is only for parity studies.

## 6. Round 1 results (2026-07-06) — two bugs FOUND AND FIXED, gaps logged

**Bugs (both fixed, commits on main):**
1. **V24 — EDL overlays fired at t=0** (commit `9ec50d2`). `buildSceneProps` dropped
   `fromFrame/toFrame/anchor` and the SpeakerOverlayScene pair mounted overlays untimed →
   every planned overlay appeared at scene start and vanished ~24 frames later. Found on
   `austin-th-clip` ("99" callout 12 s early). Scenes now wrap timed overlays in
   `<Sequence from … layout="none">`. **Regression check every round:** one full-res frame
   inside each overlay window (graphic present) and one outside (absent).
2. **Whisper Spanish-prompt hallucination** (`src/transcribe/transcribe.py:40`). The hardcoded
   `initial_prompt="Transcripción en español…"` was applied for ALL languages; on
   `berman-end2` (EN) whisper returned the prompt itself as the entire transcript (6 words
   for 23 s). Now the Spanish prompt applies only when `language.startswith("es")`.
   **Regression check:** word count ≈ 2.5–3 × clip seconds.

**Verified working:** timing fix live ("KEY" callout at planned frame 175 in austin-mid;
brain-icon pop on "Anthropic" in berman-end2 at its beat); hormozi-pop and box-highlight
LEGIBLE over Berman's bright wall; type-terminal clean over dark footage; karaoke sync good;
handle chip correct in all four; no spacing/word-break bugs in any caption style tested.

**Gaps logged (the current to-fix queue, ordered):**
1. **Density: 0 overlays on both 25 s Berman clips** (rubric #2 = 0). The suggester only has
   R1 number / R2 ordinal / R3 emphasis / R4 brand rules — no lower-third-on-topic-change,
   no fallback beat. → §7.1.
2. **Brand beats render the DEFAULT brain emoji** (IconPopOverSpeaker for "Anthropic").
   Needs a brand→logo/icon map or a text-chip fallback. → §7.2.
3. **"KEY" callout hugs the left frame edge** (bottom-left anchor, no safe-area inset) —
   FABLE V8/Task V.8 confirmed on real footage.
4. Bare-text caption styles still unfixed for bright footage (FABLE Task V.1) — grade any
   classic/slide-clean/blur-premium run accordingly.
5. Round 1 did NOT listen to audio at the cuts (rubric #7 ungraded) — do this in Round 2;
   FABLE Task 2.1 (50 ms pad) very likely needed first.

## 7. What to build next (ordered, each ends with a re-run of ALL fixtures)

1. **`suggestOverlays` density pass:** add (a) lower-third title beat at t≈0 of each kept
   segment longer than 15 s (props: 3–5-word summary of that segment's words — rule-based:
   first noun-ish phrase; the LLM pass replaces this later); (b) guarantee ≥1 beat per 15 s:
   if a window has none, emit a `MarkerSweepWord` on the highest-TF-IDF word in the window
   at confidence 0.35 (low, so a future LLM pass can prune). Keep the FABLE 2.6 enumeration
   fixes in mind (ES lexicon; interval suppression).
2. **Brand-beat asset map:** `{claude|anthropic → brand/logos/logo-lentes.png, …}` in
   suggestOverlays R4 props; unknown brands → `SentimentKeyword`-style text chip instead of
   the brain emoji.
3. **FABLE Task V.1** (caption scrim for the 5 unsafe styles) then re-grade rubric #4 across
   the full style matrix on berman fixtures.
4. **FABLE Task V.8** (safe-area insets + handle-chip reserved zone) then re-grade #6.
5. **FABLE Task 2.1** (silence-trim edge padding) then grade #7 BY LISTENING.
6. When 3 consecutive rounds score ≥14/18 on all fixtures: cut fixtures from ARMANDO's own
   footage (`output/footage/claude-cowork/IMG_36*.MOV` sources exist) and tune on those —
   Spanish audio (`--language es`), 9:16, his lighting. That's the acceptance test that
   matters.

## 8. Bookkeeping rules
- Append every round to `ROUNDS.md`; never rewrite history there.
- Every bug found → fix + regression check added to §3.3/3.4 + FABLE.md addendum entry.
- Commit message convention: `dogfood(roundN): <what changed> — scores <clip>=x/18,…`.
- Keep downloads and renders strictly sequential (font-fetch conflict).
- The strips/stills you view go in the session scratchpad, not the repo.
