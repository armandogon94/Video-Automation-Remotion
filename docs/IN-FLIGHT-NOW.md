# Currently in-flight agents — quota-burnout snapshot 2026-05-28 00:18

> Quick-reference dump captured RIGHT BEFORE hitting weekly quota. Use this on resume to know exactly what was running, what stopped where, and what to restart.
>
> **See also**: `docs/WAVE7-RECOVERY.md` for the full Wave-7 recovery plan (290 lines, much more detail). This file is the short summary.

---

## Liveness check (filesystem-based)

| Status | Agent | scratch size | Last activity |
|---|---|---|---|
| **🟢 STILL RUNNING** | N3 matthewberman | 393M (grew from 156M) | 1m ago |
| 🔴 stalled | A1 hormozi (KILLED earlier) | 68K | 23m ago |
| 🔴 stalled | A2 natebjones | 1.0M | 25m ago |
| 🔴 stalled | A4 diysmart | 1.9M | 23m ago |
| 🔴 stalled | A5 bilawal | 55M | 23m ago |
| 🔴 stalled | A7 midu | 3.2M | 23m ago |
| 🔴 stalled | A8 dotcsv | 60M | 23m ago |
| 🔴 stalled | N1 mreflow | 864K | 23m ago |
| 🔴 stalled | N2 aiexplained | 1.3M | 23m ago |
| 🔴 stalled | N4 theaiadvantage | 656K | 23m ago |
| 🔴 stalled | N5 sahilbloom | 7.2M | 25m ago |
| 🔴 stalled | N6 allin | 12M | 42m ago |
| 🔴 stalled (early) | A3 carlos | 0B (empty dir) | n/a |
| 🔴 stalled (early) | A6 simon | 0B + 44M in `wave7-simon-staging` | 23m ago |

**Only 1 agent is still doing work**: `N3 matthewberman` (Matthew Berman YouTube channel analysis). All others stopped ~23-42 min ago — likely simultaneous network-contention crashes during yt-dlp downloads.

---

## What each agent was supposed to do (one line each)

### Wave 7A — deepen existing creators (8 agents)
- **A1 Hormozi long-form** — 15 ADDITIONAL videos beyond Wave-6's 10. (KILLED by network early)
- **A2 Nate B Jones** — 15 ADDITIONAL videos beyond Wave-6's 9.
- **A3 Carlos** — re-scrape Instagram to N=25, analyze 13 new reels (had 12 from Wave-1/4).
- **A4 DIYSmart** — YouTube Shorts to N=25, analyze 13 new.
- **A5 Bilawal** — Instagram to N=20, analyze 13 new.
- **A6 Simon Hoiberg** — Instagram to N=25, analyze 13 new.
- **A7 midu.dev** — Instagram to N=25, analyze 13 new.
- **A8 dotcsv** — Instagram to N=25, analyze 13 new.

### Wave 7B — NEW creators (6 agents)
- **N1 Matt Wolfe (@mreflow)** — AI tool roundup channel, 12-15 videos.
- **N2 AI Explained (@aiexplained-official)** — AI paper breakdowns.
- **N3 Matthew Berman (@matthewberman)** — AI agent demos + screen recs. **STILL RUNNING**.
- **N4 The AI Advantage (@theaiadvantage)** — Igor's AI tutorials.
- **N5 Sahil Bloom (@sahilbloom)** — finance/business motion graphics.
- **N6 All-In Podcast (@allin)** — long-form clips with infographics.

---

## What each agent ACTUALLY accomplished before stalling

| Agent | Channel listed | Picks JSON written | Animation ranges JSON | ANALYSIS.md written |
|---|---|---|---|---|
| A1 hormozi | ✓ | ✓ `longform-picks-wave7.json` | ✗ | ✗ |
| A2 natebjones | ✓ | ✓ `picks-wave7.json` | ✗ | ✗ |
| A3 carlos | ? | ✗ | ✗ | ✗ |
| A4 diysmart | ✓ | ✓ `picks-wave7.json` | ✗ | ✗ |
| A5 bilawal | ✓ | ✓ `picks-wave7.json` | ✗ | ✗ |
| A6 simon | ? | ✗ | ✗ | ✗ |
| A7 midu | ? | ✗ | ✗ | ✗ |
| A8 dotcsv | ✓ (info.json) | ✗ | ✗ | ✗ |
| N1 mreflow | ✓ | ✓ `picks-wave7.json` | ✗ | ✗ |
| N2 aiexplained | ✓ | ✓ `picks-wave7.json` | ✗ | ✗ |
| N3 matthewberman | ✓ | ✓ `picks-wave7.json` | (in progress) | (in progress) |
| N4 theaiadvantage | ✓ | ✓ `picks-wave7.json` | ✗ | ✗ |
| N5 sahilbloom | ✓ | ✓ `picks-wave7.json` | ✗ | ✗ |
| N6 allin | ✓ | ✓ `picks-wave7.json` | ✗ | ✗ |

**Net result so far**: 10 agents made picks. 4 agents stalled before picks. 0 agents produced an ANALYSIS doc (except N3 which may still be working). 81 wave7-tagged JPG frames + 8 wave7-tagged reference MP4 clips DID get saved to the project tree.

---

## RESUME CHECKLIST — copy-paste this when quota refreshes

```bash
cd /Users/armandogonzalez/Downloads/Claude/Deep\ Research\ Claude\ Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b

# 1. Read the full recovery plan
cat docs/WAVE7-RECOVERY.md

# 2. Check if matthewberman is still alive
du -sh /tmp/wave7-matthewberman 2>/dev/null
find /tmp/wave7-matthewberman -mmin -5 2>/dev/null | head

# 3. If matthewberman is dead (>10 min stale): clean up its scratch too. If alive, leave it.

# 4. Clean up the 13 stalled scratch dirs (this frees ~187M; matthewberman conditionally)
rm -rf /tmp/wave7-hormozi /tmp/wave7-natebjones /tmp/wave7-carlos /tmp/wave7-diysmart \
       /tmp/wave7-bilawal /tmp/wave7-simon /tmp/wave7-simon-staging /tmp/wave7-midu \
       /tmp/wave7-dotcsv /tmp/wave7-mreflow /tmp/wave7-aiexplained /tmp/wave7-aiadvantage \
       /tmp/wave7-sahil /tmp/wave7-allin

# 5. Verify Wave-6 state is intact (should be 73 compositions, tsc clean)
npx tsc --noEmit --ignoreDeprecations 6.0 2>&1 | head -5
npx remotion compositions src/index.ts 2>&1 | tail -3

# 6. Audit what wave-7 picks survived (10 should be there)
ls references/creators/*/picks-wave7.json references/creators/*/longform-picks-wave7.json 2>/dev/null
```

---

## RESUME STRATEGY (in 1 sentence)

Dispatch ONE focused agent per creator that already has a `picks-wave7.json` (10 creators) to read its picks, sequentially download → extract → write ANALYSIS-WAVE7.md → cleanup. Run in **batches of 3 parallel agents** instead of 14 to avoid the network-contention crash that killed this wave.

**Skip on resume** (defer to Wave 8): A3 Carlos, A6 Simon, A7 midu, A8 dotcsv — these never made picks, AND we already have Wave-4 consensus docs for them, so they're low priority.

---

## What's BULLETPROOF (already shipped, intact, unaffected)

- 73 compositions registered in `src/Root.tsx`
- 6 new 16:9 templates from Wave 6 (HormoziTweetCardListicle, TitleCardKineticTwoLine, BeforeAfterText, BigNumberHorizontalBars, SplitScreenInterviewLayout, PipelineFlow)
- Smoke renders at `output/wave6-smoke/*/master.mp4`
- `docs/wave6-validation.html` — the side-by-side validation page
- `docs/research/wave-6/{alexhormozi-longform,natebjones}-consensus.md`
- 66 Wave-6 reference clips + 8 Wave-7 reference clips
- 81 Wave-7 frames saved to creator dirs

These are guaranteed-safe; nothing in this quota burn touches them.
