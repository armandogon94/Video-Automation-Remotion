---
status: pending
target_platforms: [instagram-reels, tiktok, youtube-shorts]
aspect_ratio: "9:16"
target_duration_s: 35-45
voice: es-MX-JorgeNeural (Edge-TTS, business-friendly Spanish male)
caption_style: word-by-word animated (TikTok-style)
deliver_two_variants: true   # one rendered via Remotion, one rendered via HyperFrames
created: 2026-05-18
created_by: claude-code (project 17-Instagram-Slides)
sibling_project: /Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion
output_dir_in_sibling: output/2026-05-18-gemini-3-2-flash-leak/
---

# Video request — Gemini 3.2 Flash leak (Monday AM, week of 2026-05-18)

> **What this file is.** A self-contained video brief written by Claude Code in the `17-Instagram-Slides` project. Drop the prompt at the bottom into a Claude Code session inside `10-Video-Automation-Remotion` and that agent will produce the video using your existing Remotion + Edge-TTS + faster-whisper + FFmpeg pipeline, AND a parallel HyperFrames-rendered variant.
>
> **Why.** This is the first piece in the W21 content calendar (see `docs/CONTENT_CALENDAR_2026-W21-v2.md` in 17-Instagram-Slides). Google I/O 2026 is May 19–20; this video has to ship BEFORE I/O so it lands as a pre-event leak take.
>
> **Two variants requested.** This is also a benchmark — the user wants to compare Remotion vs HyperFrames quality for future videos.

---

## 1. Voice & audience

- **Audience:** Spanish-speaking founders / operators 25–35.
- **Voice pinning:** every script line must comply with [`17-Instagram-Slides/VOICE.md`](../../../VOICE.md) v1.3 — especially §3 (story validation checklist), §5 (story spine: what / why / what-it-means / what-to-do), §6 (similes), §14 (translation quality — never ship the "envió ≠ shipped" class of errors).
- **Dialect:** Spanish neutro / latino. Use `tú / eres / tienes` — never `vos / sos / tenés`.
- **Tone:** calm, mechanism-first, no clickbait fear, no breathless drama. No "Nadie está hablando de esto" hooks.
- **Disclosure:** the user enables Instagram's native AI-content toggle. We do NOT bake "Imagen generada con IA" disclaimer text into the video. The voice-over is Edge-TTS (AI), but disclosed at platform level.

---

## 2. The script (final, Spanish neutro)

Total target: **35–45 seconds** at conversational pace. The script below is timed in approximate seconds. Use Edge-TTS with `es-MX-JorgeNeural` and let the natural word-timestamps drive the captions.

> **Tag slide-1 / opening frame:** `FILTRACIÓN` chip displayed top-left for the first 3 seconds. (Per VOICE.md §9.)

### Beat 1 — Hook (0:00 – 0:03)
> Filtraron Gemini tres punto dos Flash dos días antes del Google I/O. Y los números son escandalosos.

### Beat 2 — What happened (0:03 – 0:12)
> Apareció el cinco de mayo en builds del app de iOS y en metadata de AI Studio. Google I/O arranca esta semana. Cero coincidencia. Esta es la jugada de Google: filtrar el hype dos días antes del evento.

### Beat 3 — The numbers that matter (0:12 – 0:26)
> Quince veces más barato que GPT cinco punto cinco. Veinticinco centavos por millón de tokens de entrada. Dos dólares por millón de salida. Y en código rinde al noventa y dos por ciento de GPT cinco punto cinco. Latencia: menos de doscientos milisegundos.

### Beat 4 — Why it matters to you (0:26 – 0:38)
> Si pagas API hoy para tu producto, la matemática cambia esta semana. Features que apagaste por costo — chatbots de soporte, agentes para usuarios gratuitos — vuelven a ser rentables.

### Beat 5 — Action + CTA (0:38 – 0:43)
> Haz una lista hoy de las features que apagaste por costo. Mañana las vuelves a encender. Y sígueme para el debrief en vivo del I/O.

**Total spoken duration estimate:** ~42 seconds. Adjust playback speed minutely if needed to land between 35–45s.

---

## 3. On-screen text plan (overlay timing)

Word-by-word captions throughout (the Remotion `@remotion/captions` package handles this from the faster-whisper output).

Plus these big-typography overlays, layered ON TOP of the captions for emphasis:

| Time | Big overlay (top quarter of frame) | Style |
|---|---|---|
| 0:00 – 0:03 | `FILTRACIÓN` chip + `GEMINI 3.2 FLASH` | Bold sans-serif, warm-red chip + white text |
| 0:12 – 0:14 | `15× MÁS BARATO` | Huge centered, ink-gray on cream paper, slight scale-in animation |
| 0:14 – 0:18 | `$0.25 / $2.00 por millón de tokens` | Smaller, dotted underline |
| 0:18 – 0:22 | `92% del rendimiento de GPT-5.5` | Same big style as 15× |
| 0:22 – 0:26 | `<200ms latencia` | Same |
| 0:38 – 0:43 | `LISTA HOY` (call-to-action overlay) | Warm-red background, white text |

Caption position: bottom third of frame, NOT colliding with the big overlays.

---

## 4. Visual / template direction

### Variant A — Remotion (your existing pipeline)

- **Suggested template:** new composition `TechNewsFlash9x16` (or extend `ExplainerVideo` if it's close).
- **Layout:** cream paper background (`#FAF7F2`), ink-gray text (`#1A1A1A`), warm-red accent (`#B33A2A`) per the impeccable design system used in `17-Instagram-Slides`.
- **No talking head video.** Pure text-on-screen + animated overlays + the Edge-TTS voiceover.
- **Subtle motion:** numbers scale-in, the FILTRACIÓN chip pulses softly once on entry, transitions are clean fades / cuts.
- **No background music** for this first test (we evaluate clean voice). Optional: subtle ambient drone at -32dB if it helps pacing.
- **Output:** `output/2026-05-18-gemini-3-2-flash-leak/remotion/master.mp4` (9:16, 1080×1920, H.264, ~30s–45s).
- **Platform variants:** TikTok, IG Reels, YouTube Shorts — all 9:16 1080×1920 so re-encode for codec/bitrate per platform, not for aspect.

### Variant B — HyperFrames (parallel test)

- **What this is.** HyperFrames is HeyGen's open-source HTML → MP4 renderer (Apache 2.0, released April 2026). It uses Puppeteer + FFmpeg under the hood. Repo: <https://github.com/heygen-com/hyperframes>.
- **Goal.** Produce the same script + on-screen plan as Variant A but rendered from HTML/CSS instead of Remotion compositions. Then we A/B compare quality, render speed, dev time.
- **Required steps for the sibling agent:**
  1. `npm install hyperframes` (or use `npx hyperframes` if available) inside the sibling project, in a new subfolder so it doesn't collide with the existing Remotion setup.
  2. Write the video as a single `.html` file with timeline annotations per HyperFrames docs.
  3. Reuse the same Edge-TTS audio that the Remotion variant uses (don't regenerate).
  4. Reuse the same faster-whisper transcript for captions.
  5. Render to `output/2026-05-18-gemini-3-2-flash-leak/hyperframes/master.mp4`.
- **Constraint:** if HyperFrames blocks for non-obvious reasons (dependency conflict, Node version mismatch, etc.), log the failure and ship the Remotion variant alone. Don't sink an hour debugging HyperFrames on the first run.

---

## 5. Output structure (in the sibling project)

```
10-Video-Automation-Remotion/output/2026-05-18-gemini-3-2-flash-leak/
├── audio/
│   ├── voiceover.mp3                # Edge-TTS output
│   └── voiceover.timestamps.json    # word-level timestamps
├── transcript/
│   └── transcript.srt               # faster-whisper output
├── remotion/
│   ├── raw.mp4                      # raw Remotion render before FFmpeg pass
│   ├── master.mp4                   # final 1080×1920 H.264 ⭐ THE DELIVERABLE
│   ├── master.tiktok.mp4            # platform-encoded
│   ├── master.reels.mp4
│   └── master.shorts.mp4
├── hyperframes/
│   ├── source.html                  # HTML/CSS source of the HyperFrames version
│   ├── master.mp4                   # final 1080×1920 H.264 ⭐ THE DELIVERABLE
│   └── (platform variants same as above)
└── REPORT.md                        # one-page comparison: which variant won, render times, file sizes, gotchas
```

The `REPORT.md` is critical — it's what closes the loop back to Claude Code in `17-Instagram-Slides` so we can decide which renderer to use going forward.

---

## 6. Acceptance criteria

For each variant (Remotion + HyperFrames):

1. `master.mp4` is 9:16, 1080×1920, H.264, between 35 and 45 seconds.
2. Voice-over plays cleanly with no clipping.
3. Word-by-word captions are synced to within ±100ms of the audio.
4. The five big-typography overlays land at the times listed in §3.
5. The `FILTRACIÓN` chip is visible for the first 3 seconds.
6. The 5 numeric claims (15×, $0.25/$2.00, 92%, <200ms, "lista hoy") are spelled correctly and visible long enough to read.
7. Translation check (per VOICE.md §14): no "envió" / "envía" / "enviar" anywhere. No false-friend technical-Spanish errors.
8. The platform-encoded variants pass the platform's max file-size and codec requirements.

If any of these fail, fix and re-render before reporting back.

---

## 7. Report-back format (REPORT.md content)

Once both variants are rendered, the sibling agent writes `REPORT.md` with:

```markdown
# Video render report — 2026-05-18-gemini-3-2-flash-leak

## Remotion variant
- Render time: <seconds>
- Output size: <MB>
- Issues: <any>

## HyperFrames variant
- Setup time (install + first run): <minutes>
- Render time per re-render after first: <seconds>
- Output size: <MB>
- Issues: <any>

## Subjective quality comparison
- Caption rendering: Remotion vs HyperFrames — which felt cleaner?
- Big-overlay animations: which renderer produced the better motion?
- Voice-caption sync: any drift?
- Production cost in code: estimate lines of code / dev minutes per variant

## Recommendation
- For W21 weekly videos, use: <Remotion / HyperFrames / either>
- Why: <one paragraph>
```

This report comes back to 17-Instagram-Slides to inform the W21 pipeline.

---

## 8. Version

VIDEO_REQUEST.md v1 — 2026-05-18. First in a series. The pattern (REQUEST.md + sibling-project agent reads it + REPORT.md back) mirrors the image-gen sibling-agent contract.
