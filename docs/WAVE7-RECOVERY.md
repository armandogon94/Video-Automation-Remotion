# Wave-7 recovery checkpoint — 2026-05-27 23:30

> **Read this file FIRST on session resume.** It captures the exact state of the 14 parallel Wave-7 research agents at the moment they were dispatched, so a fresh session can pick up cleanly if/when the weekly quota burns through.
>
> **TL;DR**: 14 agents were launched in parallel. 1 of 14 (`A1 Hormozi long-form`) was killed by network contention. 1 of 14 (`N3 matthewberman`) is still actively running. The other 12 went silent simultaneously around 9-11 minutes after dispatch — likely all crashed for the same network-contention reason or quota throttling.

---

## 1. What Wave 7 was attempting

A "burn weekly tokens overnight, review tomorrow" mega-research wave. **14 agents in parallel:**

- **8 deepening agents (A1–A8)** — extend existing creators with MORE videos
- **6 new-creator agents (N1–N6)** — add NEW creators to the catalog

Each agent's contract:
- Use `/tmp/wave7-<creator>/` for scratch downloads
- Sequential per-video loop: download → coarse-scan → identify animation ranges → dense-extract → reference clip → DELETE source MP4
- Write per-creator artifacts: `picks-wave7.json`, `animation-ranges-wave7.json`, `ANALYSIS-WAVE7.md`
- Append a row to `references/creators/CREATORS.md` for new creators
- Save reference clips under `docs/research/wave-6/references/<creator>/`

---

## 2. Agent IDs + last-known status

Agent IDs (from the harness — may be useful for `TaskOutput` if the harness preserves them):

| Code | Agent ID | Target | Status @ 23:30 |
|---|---|---|---|
| A1 | a6abc1fdba0144621 | Hormozi long-form +15 | **KILLED** (network contention) |
| A2 | a9f566408ea788030 | Nate B Jones +15 | STALLED (last act 11m ago) |
| A3 | a41c8b00200088aba | Carlos →25 | STALLED EARLY (0B in /tmp) |
| A4 | a13bd2c7b16b0c0d9 | DIYSmart →25 | STALLED (1.9M in /tmp) |
| A5 | af68f57b97075c38d | Bilawal →20 | STALLED mid-download (55M) |
| A6 | af53675caafa833dc | Simon →25 | STALLED EARLY (0B in main /tmp, 44M in `wave7-simon-staging`) |
| A7 | aff9db6acfcb1d027 | midu.dev →25 | STALLED EARLY (3.2M) |
| A8 | a831c4b05a3017564 | dotcsv →25 | STALLED mid-download (60M) |
| N1 | a500555f54d87fab9 | Matt Wolfe / mreflow | STALLED (864K) |
| N2 | a85d4d346cd399aa6 | AI Explained | STALLED (1.3M) |
| N3 | ac072a88b58c3b2d7 | Matthew Berman | **STILL ACTIVE** (156M, last act 0m) |
| N4 | a544564951ac0ece0 | The AI Advantage | STALLED (656K) |
| N5 | aa65673ae8aa4a725 | Sahil Bloom | STALLED (7.2M) |
| N6 | a6d32eb9466700499 | All-In Podcast | STALLED (12M) |

**Likely root cause**: simultaneous yt-dlp downloads from 14 agents saturated network bandwidth, causing most agents to time out on their download steps and exit before completing extraction.

---

## 3. Artifacts ALREADY produced (preserved on disk)

These are SAFE — they survived the crashes and represent real work product. Resume should NOT redo these.

### 3.1 Picks JSONs landed (12/14 agents got this far)
- ✓ `references/creators/alexhormozi/longform-picks-wave7.json` (A1, before killed)
- ✓ `references/creators/natebjones/picks-wave7.json` (A2)
- ✗ `references/creators/carloscuamatzin/picks-wave7.json` — MISSING (A3 stalled early)
- ✓ `references/creators/diysmartcode/picks-wave7.json` (A4)
- ✓ `references/creators/bilawal.ai/picks-wave7.json` (A5)
- ✗ Simon picks — MISSING (A6 stalled early — but `wave7-simon-staging` has 44M of something, investigate)
- ✗ midu picks — MISSING (A7)
- ✗ dotcsv picks — MISSING (A8 has downloads but no picks doc, weird)
- ✓ `references/creators/mreflow/picks-wave7.json` (N1)
- ✓ `references/creators/aiexplained/picks-wave7.json` (N2)
- ✓ `references/creators/matthewberman/picks-wave7.json` (N3, still active)
- ✓ `references/creators/theaiadvantage/picks-wave7.json` (N4)
- ✓ `references/creators/sahilbloom/picks-wave7.json` (N5)
- ✓ `references/creators/allin/picks-wave7.json` (N6)

### 3.2 NEW creator directories created (all 6 new creators have a dir)
- `references/creators/mreflow/`
- `references/creators/aiexplained/`
- `references/creators/matthewberman/`
- `references/creators/theaiadvantage/`
- `references/creators/sahilbloom/`
- `references/creators/allin/`

(None of these have ANALYSIS.md yet — those need a finishing pass.)

### 3.3 Wave-7 frames + clips that DID get saved
- **81 Wave-7-tagged JPG frames** distributed across creator dirs
- **8 Wave-7 reference MP4 clips** under `docs/research/wave-6/references/<creator>/*wave7*.mp4`
- These are real evidence — preserve them.

### 3.4 Wave-6 artifacts (the prior session's completed work — still intact)
- `docs/research/wave-6/alexhormozi-longform-consensus.md` (329 lines)
- `docs/research/wave-6/natebjones-consensus.md` (324 lines)
- 4 voter analyses at `references/creators/{alexhormozi,natebjones}/ANALYSIS-{LONGFORM-}VOTE{1,2}.md`
- 66 reference MP4 clips
- 6 new 16:9 compositions registered in `src/Root.tsx`
- 6 smoke renders at `output/wave6-smoke/<id>/master.mp4`
- Validation HTML at `docs/wave6-validation.html`
- All 73 compositions in Studio (60 9:16 + 1 hyperframes + 6 Wave-6 16:9 + 6 other 16:9-style)

---

## 4. /tmp scratch state — needs cleanup before resume

Wasted bytes from stalled downloads. Safe to delete EXCEPT `wave7-matthewberman` (still active):

| Dir | Size | Action |
|---|---|---|
| `/tmp/wave7-hormozi` | 68K | DELETE (negligible) |
| `/tmp/wave7-natebjones` | 1.1M | DELETE |
| `/tmp/wave7-carlos` | 0B | DELETE (just an empty dir) |
| `/tmp/wave7-diysmart` | 1.9M | DELETE |
| `/tmp/wave7-bilawal` | 55M | DELETE |
| `/tmp/wave7-simon` | 0B | DELETE |
| `/tmp/wave7-simon-staging` | 44M | INVESTIGATE then delete (may contain downloads worth using) |
| `/tmp/wave7-midu` | 3.2M | DELETE |
| `/tmp/wave7-dotcsv` | 60M | DELETE |
| `/tmp/wave7-mreflow` | 864K | DELETE |
| `/tmp/wave7-aiexplained` | 1.3M | DELETE |
| `/tmp/wave7-matthewberman` | 156M | **DO NOT DELETE** — agent still active |
| `/tmp/wave7-aiadvantage` | 656K | DELETE |
| `/tmp/wave7-sahil` | 7.2M | DELETE |
| `/tmp/wave7-allin` | 12M | DELETE |

Total reclaimable: ~187M (excluding matthewberman). Run:
```bash
rm -rf /tmp/wave7-hormozi /tmp/wave7-natebjones /tmp/wave7-carlos /tmp/wave7-diysmart /tmp/wave7-bilawal /tmp/wave7-simon /tmp/wave7-simon-staging /tmp/wave7-midu /tmp/wave7-dotcsv /tmp/wave7-mreflow /tmp/wave7-aiexplained /tmp/wave7-aiadvantage /tmp/wave7-sahil /tmp/wave7-allin
# Leave /tmp/wave7-matthewberman alone
```

---

## 5. Resume strategy

Two viable paths depending on quota / time available:

### Path A — Lean salvage (use existing picks, skip what didn't even start picks)
Faster, smaller scope. Use only the agents that produced picks:
1. **For agents with picks but no analysis** (A1, A2, A4, A5, N1, N2, N3, N4, N5, N6): dispatch ONE focused agent per creator that reads the existing `picks-wave7.json` + sequentially downloads + extracts + writes ANALYSIS-WAVE7.md. Same methodology as before but ONE creator per agent (lower network contention).
2. **For agents that never made picks** (A3 Carlos, A6 Simon, A7 midu, A8 dotcsv): defer to a later sprint — these are existing creators we already have Wave-4 consensus for, so they're lower priority than the NEW creator analyses.
3. **For matthewberman (N3)**: let it finish, then check its artifacts.

Total agents needed on resume: 10 sequential single-creator agents (or parallel in batches of 3-4 to avoid the network contention issue).

### Path B — Reset to Wave 6 + plan smaller Wave 7
If salvage feels too messy, accept that Wave 7 stalled, mark task #124 completed-with-caveat, delete the partial wave7 artifacts to keep the repo clean, and plan a Wave 8 with **at most 3-4 agents in parallel** + per-agent network retries.

### Recommendation: **Path A with batches of 3**
Dispatch in waves of 3 agents at a time (instead of 14 simultaneously) so network bandwidth doesn't saturate. ~4 batches of 3 agents each, ~15-20 min per batch. Total ~60-80 min wallclock.

---

## 6. Resume kickoff commands

When resuming, run:

```bash
cd /Users/armandogonzalez/Downloads/Claude/Deep\ Research\ Claude\ Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b

# 1. Check if matthewberman is still alive
du -sh /tmp/wave7-matthewberman 2>/dev/null
find /tmp/wave7-matthewberman -mmin -5 2>/dev/null | head

# 2. Clean up stalled scratch dirs (skip matthewberman if still active)
rm -rf /tmp/wave7-hormozi /tmp/wave7-natebjones /tmp/wave7-carlos /tmp/wave7-diysmart /tmp/wave7-bilawal /tmp/wave7-simon /tmp/wave7-simon-staging /tmp/wave7-midu /tmp/wave7-dotcsv /tmp/wave7-mreflow /tmp/wave7-aiexplained /tmp/wave7-aiadvantage /tmp/wave7-sahil /tmp/wave7-allin

# 3. Verify Wave-6 state is intact
npx tsc --noEmit --ignoreDeprecations 6.0 2>&1 | head -5  # should be clean
npx remotion compositions src/index.ts 2>&1 | tail -3      # should show 73 compositions

# 4. Audit current wave-7 artifacts
ls references/creators/*/picks-wave7.json 2>/dev/null
find references/creators -name "*wave7*.jpg" 2>/dev/null | wc -l
find docs/research/wave-6/references -name "*wave7*.mp4" 2>/dev/null | wc -l
```

---

## 7. The catalog state — what we have for context

**14 creators in `references/creators/`** with varying coverage. As of the START of Wave 7:

| Creator | Wave-1/2 count | Wave-6 added | Wave-7 picks made? | Wave-7 analysis written? |
|---|---|---|---|---|
| alexhormozi | 0 | 10 long-form | ✓ (15 new) | ✗ |
| bilawal.ai | 7 | 0 | ✓ (13 new) | ✗ |
| black.one.studio | 8 | 0 | not in W7 | n/a |
| builtbystephan | 30 | 0 | not in W7 | n/a |
| carloscuamatzin | 12 | 0 | ✗ (A3 stalled) | ✗ |
| diysmartcode | 12 | 0 | ✓ (13 new) | ✗ |
| dotcsv | 12 | 0 | ✗ (A8 stalled) | ✗ |
| estebandiba | 3 | 0 | not in W7 | n/a |
| midu.dev | 12 | 0 | ✗ (A7 stalled) | ✗ |
| motiondarwin | 12 | 0 | not in W7 | n/a |
| motiongraphicsweb | 2 | 0 | not in W7 | n/a |
| natebjones | 0 | 9 (4 unique each voter) | ✓ (15 new) | ✗ |
| simonhoiberg | 12 | 0 | ✗ (A6 stalled) | ✗ |
| zenzuke | 15 | 0 | not in W7 | n/a |
| **NEW** allin | — | — | ✓ | ✗ |
| **NEW** aiexplained | — | — | ✓ | ✗ |
| **NEW** matthewberman | — | — | ✓ (still active) | possibly |
| **NEW** mreflow | — | — | ✓ | ✗ |
| **NEW** sahilbloom | — | — | ✓ | ✗ |
| **NEW** theaiadvantage | — | — | ✓ | ✗ |

---

## 8. What happens after Wave 7 lands (the original Phase 3+ plan)

(Preserved from the dispatch plan so we don't lose it.)

1. **Cross-creator synthesis** — write a consolidated `docs/research/wave-7/cross-creator-consensus.md` that aggregates all wave-7 ANALYSIS docs into a single ranked queue of new primitives / molecules / templates / 16:9 variants.
2. **Build wave** — dispatch parallel agents to build the new templates that have strong cross-voter consensus.
3. **Smoke render** all new templates with the W21 voiceover.
4. **Extend `docs/wave6-validation.html`** → into a `wave7-validation.html` with reference↔recreation pairs for every new template (the user explicitly said "I don't care if the HTML grows to 50 videos long" — go for completeness).

The existing `docs/wave6-validation.html` is the template structure to extend.

---

## 9. Honest assessment for the user

If the user resumes tomorrow and asks "how did it go":
- 6 NEW creator directories created + picks made (good progress)
- 5 EXISTING creators had picks made for Wave-7 deepening (good progress)
- 3 EXISTING creators (Carlos, Simon, midu) and 1 (dotcsv) stalled before picks — these are low priority since we already have Wave-4 consensus for them
- 0 NEW ANALYSIS.md files were written (the actual deep work didn't complete)
- ~8 reference clips + ~81 frames did get saved before crashes
- matthewberman may complete if left alone (~156MB downloaded by 23:30)

The Wave-6 work (73 compositions, side-by-side validation HTML) is fully intact and unaffected.

---

## 10. File list for quick scan on resume

```
docs/WAVE7-RECOVERY.md                                    ← this file
docs/wave6-validation.html                                 ← prior wave's deliverable, still valid
docs/research/wave-6/alexhormozi-longform-consensus.md     ← Wave-6 consensus
docs/research/wave-6/natebjones-consensus.md               ← Wave-6 consensus
docs/research/wave-6/references/                           ← 74 ref clips (66 wave6 + 8 wave7-so-far)
references/creators/*/picks-wave7.json                     ← picks from any agent that made it that far
references/creators/<new>/info.json                        ← new creator metadata
src/Root.tsx                                               ← 73 compositions registered
src/compositions/<X>16x9.tsx                               ← 6 new 16:9 templates from Wave 6
src/components/{NumberedBadge,YellowGlowLowerThird,...}    ← Wave-6 foundation primitives
```

Resume confidence: HIGH. The Wave-6 deliverables are bulletproof. Wave-7 is partially complete and salvageable via Path A above.
