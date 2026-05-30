# @simonhoiberg — Vote 4 — Motion Grammar

**Voter scope:** MOTION GRAMMAR only — entry choreography, easing, transitions, dwell, A/V sync, cut cadence, continuous motion, deliberate stillness, timing quirks.

**Frames sampled:** 28 frames across 7 reels (DBMBFjoCy1N, DQWsK-UCnTq, DOdy8xIjH-A, DNnr51Mqp75, DPT3n_PgEiU, DMsj5dNPzK3, DN5lzNDjMkV, DNVjkdEsKAj, DQb8u0vihLC). Adjacent-frame inference where reels offered tighter sampling windows (~5–8 s apart); coarser sampling for long-form reels (~15–22 s apart).

---

## Reel typology (sets the motion ceiling)

Three modes coexist on the feed, each with a different motion budget:

1. **High-production "studio" reels** (DBMBFjoCy1N at ~38 s): multiple practical locations (factory floor, warehouse, exterior 3D-rendered building), shot-scale jumps from wide-medium to extreme close-up, B-roll cutaways with shallow DOF, branded CTA card at the end. Heaviest motion budget.
2. **Desk demo reels** (DQWsK-UCnTq, DOdy8xIjH-A, DNnr51Mqp75): single locked-off desk camera, presenter framed waist-up, screen recordings or motion-graphics overlays inserted as a split-screen *top half* while talking-head holds the *bottom half*.
3. **Pure talking-head reels** (DNVjkdEsKAj across all 7 frames sampled): same desk shot held for the full reel. No B-roll, no overlays, no graphics. Motion comes only from his hands and face — *deliberate stillness as a format choice*, not absence of editing.

The motion grammar I describe below is the *house style* that runs through all three modes, even when mode 3 is editing-minimum.

---

## Top 5 motion principles

### 1. Shot-scale jumps do the work that "transitions" do for other creators
Adjacent frames on the studio reel jump from wide medium (DBMBFjoCy1N f00, full torso, 38-s reel) → wide drone-pan B-roll of a building (f01, ~5 s later) → tight close-up at a *different* location (f02, +5 s) → even tighter ECU with brow furrow (f03, +5 s). That is **four shot scales and at least two physical locations in 16 seconds**, and the only visible "transition" is a hard cut. No swipes, no whips, no zooms — just *the scale itself* delivering the punctuation. Easing in/out is structural, not animated. The DBMBFjoCy1N f01 building B-roll shows lateral motion blur on the lamp-post and pavement — a *moving* camera dolly, not a still establishing shot — so even his B-roll has its own internal velocity, which means the cut feels alive without needing a transition effect to mask it.

### 2. The split-screen demo lock — continuous bottom, cutting top
On the tutorial reels (DQWsK-UCnTq f01 vs. f02, ~7 s apart) the bottom half holds the same talking-head desk shot in the same posture, while the top half advances independently — first an "Agent Builder / Templates" grid, then a different "Connect to MCP Server" modal.

The implication: *one continuous take of the presenter is paired with several screen-recording shots stacked above it.* This is cheap to produce (one camera roll, one screencast) but feels paced because the *top* is cutting while the *bottom* is not. The eye accepts the bottom as the stable anchor and reads the top as the "edit."

The split is roughly **45/55** with the screen on top — large enough for the UI to be legible, small enough that the presenter is unambiguously the subject. The presenter's framing changes too: in pure talking-head mode he sits *centered* in the frame, but in split-screen mode he's framed slightly *low* (more head-and-shoulders, less of the desk) so that his face sits near the seam where the two layers meet. That's a small composition detail that prevents the screen-recording layer from feeling glued-on.

### 3. The dwell beat — held stillness as climax
Mid-reel close-ups in DBMBFjoCy1N (f06, t=33 s, the post-tension exhale) and DOdy8xIjH-A (f03, t=36 s, hands clasped low, eyes locked) show the same move: after a string of expressive frames, Simon physically arrests his body — hands either stop entirely or lock into a clasp — and faces the lens deadpan for a beat.

The clue this is *deliberate stillness* and not a coincidence of sampling: in the same reel the surrounding frames have motion-blurred hands and open mouths mid-syllable, so the held frame is the *exception*. The DBMBFjoCy1N f06 frame in particular shows a closed mouth and direct eye contact, which only happens for fractions of a second in normal speech — catching it on a sampling grid means the held duration is *long enough* (probably ≥0.8 s) for the sampler to land on it.

In an automated pipeline this would correspond to a 1.0–1.5 s scene of zero parallax over the punchline word. The audio underneath might still be a held inhale or a short silence — Simon's edit *does not cut* during the dwell, which means there's a tiny breath/silence on the timeline at exactly the moment the visual stops moving.

### 4. A/V is welded to the sentence, not to a beat grid
Every studio-reel frame I sampled catches a different mouth shape — there is no music-bar quantization. The cut from frame 03 (mouth open mid-word) to frame 04 (mouth in different shape, eyebrows higher) at +5.5 s in DBMBFjoCy1N is *between* phonemes, not on a downbeat. Cuts happen when the sentence does. This rules out the TikTok "kick-drum cut every 0.6 s" pattern and puts him closer to a podcast-clip editor's logic: the speech is the metronome.

Corollary: there is no visible background music in the frames (nothing pulsing, nothing pumping the highlights), and the audio-driven cadence implies music — if present — is sub-mixed enough not to *drive* the edit. Cuts ride speech, music rides cuts.

### 5. The CTA card is the only animated graphic, and it stays still
The end-card template recurs at least three times in the sampled set (DBMBFjoCy1N f07, DOdy8xIjH-A f07, DNnr51Mqp75 f07, DPT3n_PgEiU f07). In every case it is a *static composite*: blurred YouTube interface as background plate + a static "Watch Now" badge + a YouTube-thumbnail card with corner brackets + `@SimonHoiberg` handle. No motion graphics, no parallax, no shimmer. The card *appears on a hard cut* and holds. Where most creators escalate motion at the CTA, Simon's reels *decelerate to a freeze* — the contrast with the busy preceding edit *is* the call to action.

### Bonus motion observations

- **Cold-open text reveal (DPT3n_PgEiU f00):** the reel opens *before* the presenter, on three stacked card-shaped tiles ("Layer 1 / Layer 2 / Layer 3") layered over an out-of-focus office plate. The cards are static in this frame but the layered composition (pixel-blurred favicons + violet category pill + bold sans-serif label) implies a staggered slide-in entrance. This is the only place I see Simon use what looks like a motion-design entrance, and it's reserved for the *hook* — a "list" promise that the rest of the reel pays off.
- **Prop reveals replace cutaways (DNnr51Mqp75 f04):** at t=31 s, Simon's hand has acquired a black pen-shaped object compared to f02 (t=15.9 s) where his hands were empty. The shot setup didn't change — same desk, same camera, same posture. So the "prop arrives" without a cut. This is a very cheap *substitute for a B-roll insert*: the talking-head becomes its own visual variation.
- **The "watch face / wrist" frame composition** (DBMBFjoCy1N f07, DNnr51Mqp75 desk shots): hands often resolve around the wrist watch — there's a consistent micro-composition where his Calvin Klein logo on the chest and his wristwatch create a vertical triangle with his face. This isn't motion per se, but it's a *visual rest position* that his gestures return to, giving the eye a place to land between phrases.
- **Background lights as motion proxy:** even on the locked-off desk shots, the ceiling fairy-light strip and the linear LED tube to camera-left (visible in nearly every desk frame) provide *static* parallax — they're enough out-of-focus to feel alive in compression artifacts, which compensates for the camera not moving. The pipeline equivalent is keeping a noisy/bokeh background plate rather than a flat color.

---

## Cut cadence table (inferred from sample windows)

| Reel | Total length | Sample window | Cuts visible across sample | Inferred avg shot length | Mode |
|---|---|---|---|---|---|
| DBMBFjoCy1N | ~38 s | 5.5 s | ≥5 distinct setups in 8 frames (different locations, scales) | ~5–7 s | studio (high) |
| DQWsK-UCnTq | ~53 s | 7.5 s | screen above cuts every ≥7 s; talking-head below appears continuous | ~7–10 s (top), ~30 s+ (bottom) | demo (split) |
| DOdy8xIjH-A | ~84 s | 12 s | same desk shot across f00–f06, then end-card; only the end-card is a hard cut | ~70 s + 14 s end-card | static + CTA |
| DNnr51Mqp75 | ~55 s | 7.9 s | f00 desk → f01 product B-roll → f02–f06 desk → f07 CTA — ~3 cuts | ~13–18 s | desk + 1 insert |
| DPT3n_PgEiU | ~158 s | 22.5 s | cold-open graphic → laptop B-roll → end-card; cuts cluster, not metronomic | ~25–40 s | long-form |
| DMsj5dNPzK3 | ~104 s | 14.8 s | desk shot + hand-drawn paper inserts (~2 visible insert beats) | ~25–35 s | desk + paper inserts |
| DNVjkdEsKAj | ~85 s | 14.2 s | all 7 frames are the same locked desk shot | likely a single take or seamless jump-cuts | pure static |

**Read of the table:** Simon's cadence is **slow by short-form standards** (5–7 s on the busiest reels, 25 s+ on the calmer ones), with the *one* big tempo change being the cold open and the CTA. Most reels live in a 1–2 cut/10-s rhythm, not the 4–6 cuts/10-s rhythm typical of motion-heavy creators.

---

## Polished vs. amateur — what makes Simon's motion read as polished

What I'd flag as *amateur* in this corpus: nothing, mostly. Where motion appears, it's restrained and consistent — same CTA template across reels, same desk camera lock-off, same shallow-DOF treatment on every B-roll (the FeedHive box in DBMBFjoCy1N f05, the Macbook in DPT3n_PgEiU f03, the tablet in DNnr51Mqp75 f01 all share a ~f/2 look).

What reads as *polished* is the **discipline to under-edit**: no whip-pans, no zoom-punches, no shake-on-beat, no overlaid stickers vibrating to music, no kinetic typography. Even the lower-third "WATCH HERE / youtube.com/@SimonHoiberg" in DBMBFjoCy1N f07 is *static*, on a hard cut, holding for the duration of the outro. The signal he's sending with motion grammar is: *the words are the show; the edit shows up only when it has something to say.*

The risk of this approach is that a pipeline that mimics his look needs above-average writing — without a strong sentence, "long held shots + occasional B-roll + static end-card" turns into "low-energy". The reward is that everything still feels human-cut in 2026: every cut has a reason, and nothing is on a metronome. The closest reference I can think of is the editing of a long-form YouTube essayist (Veritasium, Wendover) compressed into 40–90 s — cuts justified by content rather than by tempo. That's a high bar for a script-to-video pipeline to meet, but the *structural* recipe (slow cadence + occasional B-roll + dwell beats + static end-card) is reproducible even if the writing quality varies.

---

## Timing quirks worth replicating

- **The "punctuation freeze" at the CTA boundary.** In every reel with an end-card, the cut from talking-head to CTA is a *hard* cut to a *fully static* graphic. There's no fade. There's no animated card swoop. The motion energy drops to zero in one frame. This is the inverse of the convention (CTA = most-animated thing) and it works because the preceding edit has been moving, even subtly.
- **Asymmetric cold opens.** The hook is consistently the *most-edited* moment of the reel. DBMBFjoCy1N opens on a moving wide medium with motion-blurred arms (i.e., the camera-roll's most kinetic frame). DPT3n_PgEiU opens on a graphic. DOdy8xIjH-A opens on the tightest framing of its desk shot. After the hook, the energy *settles* rather than escalating. This contradicts the usual "build to a crescendo" template.
- **The screen-recording lag.** In DQWsK-UCnTq the cursor in f01 is visible on a "+ Create" button. In f02 the same modal has *advanced* to a different state with the cursor on "Connect". The screen recording is playing back at roughly the *speed of his sentence about it* — not 2× or 4×. This is unusual; many creators speed-ramp their screen recordings to 200–400 %. Simon keeps them at real-time and trusts the viewer to follow.
- **Whiteboard inserts (DMsj5dNPzK3 f04, f07)** are handheld-camera-on-paper, not Procreate exports. You can see the angle of the paper relative to the desk and the slight DOF on the iPad behind it. This makes the "graphic" feel hand-made even though the function is purely informational. The inserts aren't animated — they're held *still* in his hand and the camera moves around them.

## Implications for the 10-Video-Automation-Remotion pipeline

- **Default cut cadence target: 5–10 s per shot for active reels, 20 s+ for calm ones.** Avoid the 0.5–1.5 s "TikTok rhythm" templates — that is not this creator.
- **Build a "split-screen demo" template:** continuous talking-head locked to bottom 40–55 % of frame; top region holds independently cut screen recordings or motion-graphics cards. The two layers must NOT share a timeline.
- **Build a "dwell beat" capability:** the pipeline needs to support a 1.0–1.5 s scene of zero parallax / zero animation that lands on the punchline word from the Whisper transcript. This is the unit of emphasis in Simon's grammar.
- **Build a static end-card template:** YouTube thumbnail + "Watch Now" badge + handle, hard cut in, 1.5–2 s hold, no animation. Reuse across every reel — repetition *is* the brand.
- **Sync cuts to phoneme/word boundaries, not to a music grid.** This aligns with the existing faster-whisper transcript step in `src/pipeline/pipeline.ts` — the cut points should come from Whisper word timestamps, not from BPM.
- **Do NOT add:** whip transitions, zoom punches on every cut, animated lower-thirds, kinetic typography stickers, shake-on-impact, beat-quantized B-roll. None of these appear in Simon's grammar, and adding them would break the "considered" feel.

---

## Evidence trail (where each principle was seen)

| Principle | Primary evidence | Cross-reference |
|---|---|---|
| 1. Shot-scale jumps as transitions | DBMBFjoCy1N f00→f01→f02→f03 (medium → wide B-roll → CU → ECU in 16 s) | DBMBFjoCy1N f04 (climax ECU), f05 (product B-roll), f06 (deadpan return) |
| 2. Split-screen demo lock | DQWsK-UCnTq f01 vs. f02 (top changes from grid to modal; bottom holds) | DQWsK-UCnTq f04 returns to full-frame, confirming the split is *modal* not permanent |
| 3. Dwell beat | DBMBFjoCy1N f06 (closed mouth, direct gaze after expressive run) | DOdy8xIjH-A f03 (hands clasped low, ECU, brow neutral) |
| 4. Sentence-driven A/V | Every studio frame catches mid-phoneme mouth shapes; no detectable beat alignment | Inferred — needs source audio to confirm definitively |
| 5. Static CTA card | DBMBFjoCy1N f07, DOdy8xIjH-A f07, DNnr51Mqp75 f07, DPT3n_PgEiU f07 (4 reels share template) | All share: blurred bg + "Watch Now" + corner-bracket thumbnail + handle |
| Cold-open text | DPT3n_PgEiU f00 (3 stacked layer cards over OOF background, no presenter yet) | Solo example in sample — may not generalize across full feed |
| Prop reveal substitution | DNnr51Mqp75 f02 (empty hands) vs. f04 (pen in hand, same shot setup) | DN5lzNDjMkV f00/f04 also show small pen-prop interactions |
| Pure-static talking-head | DNVjkdEsKAj f00, f03, f06 (same desk shot, only gestures change) | Demonstrates "no edit" *is* a valid mode for this creator |

## Confidence & caveats

- **Confidence high (5/5):** Static CTA-card template — sighted across 4 distinct reels with identical layout, this is unambiguous.
- **Confidence high (5/5):** Slow cut cadence — 8 frames at 5–22 s intervals consistently land on talking-head or held compositions, not on the chaos that fast-cut creators would produce at the same sampling rate.
- **Confidence medium (3/5):** Dwell beat as *intentional* emphasis — visually plausible across the two frames cited, but without source audio I can't lock the dwell to a specific punchline. A pipeline implementation should A/B test placement against random.
- **Confidence medium (3/5):** Sentence-driven A/V — the mouth-shape evidence is suggestive but cuts could still be beat-aligned to a sub-mixed music track. Confirming would require listening to source audio.
- **Confidence low (2/5):** Cold-open graphic template — single example (DPT3n_PgEiU f00). Could be a one-off rather than a recurring opener.
- **Sampling limitation:** 8 frames per reel is coarse for short reels (~38 s = one frame every 5 s) and *very* coarse for long ones (~158 s = one frame every 22 s). Fast cuts of <1 s would be invisible to this sampler. If they exist, this analysis would miss them — but the held-frame evidence makes that unlikely as a dominant mode.
- **Selection bias:** I picked the 7 reels I sampled to span what looked like different formats from filenames + first-frame thumbnails. A re-roll on different reels might surface a fourth mode I haven't catalogued.
