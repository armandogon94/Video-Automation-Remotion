#!/usr/bin/env -S uv run --extra matting --script
"""
Build CROSS-CREATOR-COMPARE.html — side-by-side of each reference creator's
preserved SOURCE keyframes vs OUR rendered signature composition clip, with the
cycle's fidelity score + one-line verdict.

The creator side is a strip of N evenly-sampled source frames (the originals are
keyframes, not video); the our side is our looping mp4. Source frames are copied
into output/cross-creator/srcframes/ for stable relative paths.

Usage: ./scripts/build-cross-creator-gallery.py
"""
import glob
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output" / "cross-creator"
SRCF = OUT / "srcframes"
SRCF.mkdir(parents=True, exist_ok=True)
CRE = ROOT / "references" / "creators"

# (comp, creator, preferred_video_id_or_None, score, verdict, note)
PAIRINGS = [
    ("RankedTierList9x16", "adamrosler", "S5ZFkY756IY", "8/10", "IMPROVED",
     "Added persistent single glowing-active-row (his signature; ours only glowed during dwell)."),
    ("TerminalBlock9x16", "adamrosler", "S5ZFkY756IY", "9/10", "VALIDATED",
     "SKILL-LIBRARY/terminal grammar: dark, mac chrome, mono body, green success, typewriter reveal."),
    ("ForceGraph9x16", "adamrosler", "S5ZFkY756IY", "7/10", "VALIDATED",
     "d3-force layout, accent focus node w/ pulse ring, staggered edge draw-on; palette is brand-driven."),
    ("AnimatedCounter9x16", "adamrosler", "S5ZFkY756IY", "7/10", "VALIDATED",
     "Rolling-digit ramp, cubic ease-out, comma-thousands, tabular-nums; mono vs sans is brand identity."),
    ("EquationCardChain16x9", "natebjones", "ltbzgzZZmgI", "8/10", "VALIDATED",
     "NamedCardEquation: A+B=C chips, colored operators, L→R stagger, orange-keyword pill, dark slate."),
    ("BeforeAfterText16x9", "natebjones", "ltbzgzZZmgI", "8/10", "VALIDATED",
     "Two-column DEFAULT/BETTER + central operator, colored underline labels, blurIn slide-in."),
    ("TopHeroBottomTrioCards16x9", "natebjones", "ltbzgzZZmgI", "8/10", "VALIDATED",
     "N4 hero header + 3 supporting cards + emphasis pill; hero-drops-then-trio-rises motion."),
    ("ThreeStageRisingBars16x9", "natebjones", "ltbzgzZZmgI", "8/10", "VALIDATED",
     "N2 three-labeled-tower chronology: staggered L→R rise + accent border-draw + uppercase labels."),
    ("BigNumberHero9x16", "motiondarwin", "DN6w6Tjgbzx", "9/10", "VALIDATED",
     "Giant-numeral + small-label-beneath + land-then-context beat (Brevo 99% stat-card pattern)."),
    ("BarChartList9x16", "sahilbloom", "0Q0vWA1xH_0", "8/10", "VALIDATED",
     "Horizontal rounded bars, left labels, sparse cream, single-accent, stagger + L→R fill."),
    ("BenchmarkBars9x16", "sahilbloom", "0Q0vWA1xH_0", "9/10", "VALIDATED",
     "X-vs-Y comparison bars: rounded, left labels, sequential eased fill, value-on-complete, source caption."),
    ("LineChartAnnotated9x16", "aiexplained", "2_DPnzoiHaY", "9/10", "VALIDATED",
     "Rising hero trend line, academic ground, axis+gridline chrome, end-dot ping + terminus label."),
    ("TweetCardHero9x16", "bilawal.ai", "DVJTSypDSYA", "9/10", "VALIDATED",
     "TweetCardOverlay: white card w/ avatar/bold-name/muted-handle/blue-tick over near-black field."),
    ("TechNewsFlash9x16", "diysmartcode", "rfzA7HWcpCQ", "8/10", "IMPROVED",
     "Cross-creator dark-changelog palette + persistent gold section-label + sustained overlays (was blank @3s)."),
    ("QuoteCard9x16", "black.one.studio", "DUTmCQfAbPt", "7/10", "IMPROVED",
     "palette:dark — near-black field + warm vignette + declarative period copy + late staggered reveal."),
    ("BrandedOpener9x16", "alexhormozi", "Z1tOBULRiIQ", "8/10", "VALIDATED",
     "Opening-title-card discipline: solid dark field, bold white ALL-CAPS centered sans, snap-in opener."),
    ("DiagramExplainer9x16", "midu.dev", "DYPnhQPiY4s", "9/10", "VALIDATED",
     "Single-accent discipline (every chrome element one warm-red family), mono meta, sequential box build."),
    ("VennDiagram9x16", "aiexplained", "2_DPnzoiHaY", "9/10", "VALIDATED",
     "Neutral surface + one saturated accent marking subject; circles draw-on; intersection pops last."),
    ("LayerCardStack9x16", "simonhoiberg", "DPT3n_PgEiU", "8.5/10", "IMPROVED",
     "Squared 'Layer N' badge (borderRadius 999→8) to match Simon's rectangular chip; glassmorphic backdrop."),
    ("StudioCompositor16x9", "theaiadvantage", "3mTMPEGWRWA", "9/10", "VALIDATED",
     "Deep-navy stage, presenter PIP bottom-left, floating UI mockup right w/ glow, orange-keyword pill."),
    ("KeynoteSlidePIP16x9", "allin", None, "9/10", "VALIDATED",
     "All-In P2: slide left + white-bordered PIP bottom-right + persistent never-animating event-lockup chyron."),
    ("SplitWebcamScreen9x16", "mreflow", "8Jw5Wa_8K0Y", "7/10", "VALIDATED",
     "Two-half vertical split + seam band + seam-riding keyword caption w/ karaoke pop + hard-cut grammar."),
    ("TalkingHeadDynamic9x16", "builtbystephan", None, "8/10", "IMPROVED",
     "Tightened fallback band colors so the load-bearing hard split reads in the placeholder render."),
]

N_FRAMES = 6


def frames_dir(creator: str, vid: str | None) -> Path | None:
    base = CRE / creator
    if vid and (base / vid / "frames").is_dir():
        return base / vid / "frames"
    # fallback: the frames dir with the most jpgs
    cands = [Path(p) for p in glob.glob(str(base / "**" / "frames"), recursive=True)]
    cands = [c for c in cands if c.is_dir()]
    if not cands:
        # some creators store frames flat
        cands = [Path(p).parent for p in glob.glob(str(base / "**" / "*.jpg"), recursive=True)]
        cands = list(dict.fromkeys(cands))
    if not cands:
        return None
    return max(cands, key=lambda d: len(glob.glob(str(d / "*.jpg"))))


def sample_frames(d: Path, n: int) -> list[Path]:
    js = sorted(glob.glob(str(d / "*.jpg")))
    if not js:
        return []
    if len(js) <= n:
        return [Path(p) for p in js]
    step = len(js) / n
    return [Path(js[int(i * step)]) for i in range(n)]


rows = []
for comp, creator, vid, score, verdict, note in PAIRINGS:
    d = frames_dir(creator, vid)
    srcs = []
    if d:
        for i, f in enumerate(sample_frames(d, N_FRAMES)):
            dst = SRCF / f"{comp}__{i}.jpg"
            try:
                shutil.copy(f, dst)
                srcs.append(f"output/cross-creator/srcframes/{dst.name}")
            except Exception:
                pass
    clip = f"output/cross-creator/{comp}.mp4"
    has_clip = (ROOT / clip).exists()
    rows.append({
        "comp": comp, "creator": creator, "score": score, "verdict": verdict,
        "note": note, "srcs": srcs, "clip": clip if has_clip else "",
        "nframes": len(glob.glob(str(d / "*.jpg"))) if d else 0,
    })

# group by creator (preserve first-seen order)
order = []
for r in rows:
    if r["creator"] not in order:
        order.append(r["creator"])

def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

cards = []
for r in rows:
    vc = "imp" if r["verdict"] == "IMPROVED" else "val"
    strip = "".join(f'<img src="{s}" loading="lazy">' for s in r["srcs"]) or '<div class="noimg">no preserved frames</div>'
    clip = (f'<video src="{r["clip"]}" muted loop autoplay playsinline controls></video>'
            if r["clip"] else '<div class="noimg">no clip</div>')
    cards.append(f'''
    <div class="row" data-creator="{esc(r['creator'])}">
      <div class="hd">
        <h2>{esc(r['comp'])} <span class="arrow">↔</span> <span class="cre">@{esc(r['creator'])}</span></h2>
        <span class="badge {vc}">{r['verdict']} · {r['score']}</span>
      </div>
      <div class="note">{esc(r['note'])}</div>
      <div class="pair">
        <div class="cell"><span class="tag s">SOURCE · {r['nframes']} preserved frames</span><div class="strip">{strip}</div></div>
        <div class="cell"><span class="tag r">OUR TEMPLATE</span>{clip}</div>
      </div>
    </div>''')

creators_js = ",".join(f'"{c}"' for c in order)
n_imp = sum(1 for r in rows if r["verdict"] == "IMPROVED")
n_val = sum(1 for r in rows if r["verdict"] == "VALIDATED")

html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Cross-creator — source vs our templates ({len(rows)} pairings)</title>
<style>
  :root{{--bg:#0b0d12;--panel:#141821;--ink:#eef2f8;--muted:#8b94a6;--cyan:#5BC0E8;--gold:#D4AF37;--line:#222836;--imp:#E8a13b;--val:#4bc07a}}
  *{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 -apple-system,BlinkMacSystemFont,Inter,sans-serif;padding:28px 38px}}
  h1{{font-size:28px;margin:0 0 4px}}.sub{{color:var(--muted);max-width:1100px;margin:0 0 8px}}
  .stat{{display:inline-block;font-size:12px;border:1px solid var(--line);border-radius:6px;padding:2px 8px;margin-right:6px;color:var(--muted)}}
  .filter{{margin:12px 0 18px}}.filter button{{background:#141821;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:5px 11px;margin:0 6px 6px 0;cursor:pointer;font-size:12.5px}}
  .filter button.on{{border-color:var(--cyan);color:var(--cyan)}}
  .row{{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:16px}}
  .hd{{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}}
  .row h2{{margin:0;font-size:17px;font-weight:700}}.arrow{{color:var(--muted)}}.cre{{color:var(--gold)}}
  .badge{{font-size:11.5px;font-weight:800;letter-spacing:.04em;padding:3px 10px;border-radius:7px}}
  .badge.imp{{background:rgba(232,161,59,.16);color:var(--imp);border:1px solid var(--imp)}}
  .badge.val{{background:rgba(75,192,122,.14);color:var(--val);border:1px solid var(--val)}}
  .note{{color:var(--muted);font-size:13px;margin:6px 0 11px}}
  .pair{{display:grid;grid-template-columns:1fr 380px;gap:18px;align-items:start}}
  .cell{{position:relative}}.cell .tag{{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.07em;padding:2px 8px;border-radius:6px;margin-bottom:7px}}
  .tag.s{{background:rgba(212,175,55,.92);color:#1a1206}}.tag.r{{background:rgba(91,192,232,.92);color:#04222e}}
  .strip{{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}}
  .strip img{{height:300px;border-radius:8px;border:1px solid var(--line);background:#000;flex:0 0 auto}}
  .cell video{{width:100%;max-width:380px;aspect-ratio:auto;border-radius:10px;background:#000;border:1px solid var(--line);display:block}}
  .noimg{{color:var(--muted);font-size:12px;padding:20px;border:1px dashed var(--line);border-radius:8px}}
  @media(max-width:900px){{.pair{{grid-template-columns:1fr}}}}
</style></head><body>
  <h1>Cross-creator validation — <b style="color:var(--gold)">SOURCE FRAMES</b> vs <b style="color:var(--cyan)">OUR TEMPLATES</b></h1>
  <p class="sub">For each reference creator we built templates from, their preserved source keyframes (left strip — scrub) next to our rendered signature composition (right — looping). Judged on PATTERN fidelity (layout/color/type/motion), not copy — our templates intentionally use the Armando navy/gold brand + our own copy. <span class="stat">{len(rows)} pairings</span><span class="stat" style="color:var(--imp)">{n_imp} improved</span><span class="stat" style="color:var(--val)">{n_val} validated</span></p>
  <div class="filter" id="filter"></div>
  <div id="rows">{''.join(cards)}</div>
<script>
  const CREATORS=[{creators_js}];
  const f=document.getElementById('filter');
  f.innerHTML='<button data-c="all" class="on">All ('+{len(rows)}+')</button>'+CREATORS.map(c=>`<button data-c="${{c}}">@${{c}}</button>`).join('');
  f.querySelectorAll('button').forEach(b=>b.onclick=()=>{{
    f.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
    const c=b.dataset.c;
    document.querySelectorAll('.row').forEach(r=>{{r.style.display=(c==='all'||r.dataset.creator===c)?'':'none';}});
  }});
  document.querySelectorAll('video').forEach(v=>v.play().catch(()=>{{}}));
</script></body></html>'''

outp = ROOT / "CROSS-CREATOR-COMPARE.html"
outp.write_text(html)
print(f"wrote {outp}  ({len(rows)} pairings, {n_imp} improved / {n_val} validated)")
missing = [r["comp"] for r in rows if not r["srcs"]]
if missing:
    print("WARNING — no source frames found for:", ", ".join(missing))
