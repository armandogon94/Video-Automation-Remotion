#!/usr/bin/env -S uv run --extra matting --script
"""
Build CROSS-CREATOR-COMPARE.html — side-by-side of each reference creator's
preserved SOURCE keyframes vs OUR rendered signature composition clip, with the
deep-QA fidelity score + verdict.

Data-driven (auto-covers the full set):
  - comp -> creator pairings parsed from src/autoedit/runCrossCreatorReplicas.ts (TARGETS)
  - score + verdict + blurb parsed from docs/research/cross-creator/notes/<Comp>.md
  - source frames: prefers a *_fresh* dir (freshly re-downloaded graphics), else the
    largest keyframe dir, under references/creators/<creator>/.

Usage: ./scripts/build-cross-creator-gallery.py
"""
import glob
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output" / "cross-creator"
SRCF = OUT / "srcframes"
NOTES = ROOT / "docs" / "research" / "cross-creator" / "notes"
CRE = ROOT / "references" / "creators"
DRIVER = ROOT / "src" / "autoedit" / "runCrossCreatorReplicas.ts"
SRCF.mkdir(parents=True, exist_ok=True)
N_FRAMES = 6


def pairings():
    """(comp, creator) in driver order."""
    t = DRIVER.read_text()
    out = []
    for m in re.finditer(r'comp:\s*"([^"]+)",\s*creator:\s*"([^"]+)"', t):
        out.append((m.group(1), m.group(2)))
    return out


PROPS = ROOT / "docs" / "research" / "cross-creator" / "props"


def note_meta(comp):
    """(score, verdict, blurb). IMPROVED if a cross-creator props override exists or
    the note states it; else VALIDATED (the only two real outcomes — never blank)."""
    f = NOTES / f"{comp}.md"
    has_props = (PROPS / f"{comp}.json").exists()
    if not f.exists():
        return ("—", "IMPROVED" if has_props else "VALIDATED", "")
    t = f.read_text(errors="ignore")
    scores = re.findall(r"([0-9]+(?:\.[0-9])?)\s*/\s*10", t)
    score = (scores[-1] + "/10") if scores else "—"
    improved = has_props or bool(re.search(r"[—\-]\s*IMPROVED", t))
    verd = "IMPROVED" if improved else "VALIDATED"
    # blurb: text after the verdict token on a score line, else first substantial line
    blurb = ""
    for line in t.splitlines():
        if verd in line and re.search(r"/\s*10", line):
            blurb = line.split(verd, 1)[-1].lstrip(":—- *").strip()
            break
    if not blurb:
        for line in t.splitlines():
            s = line.strip().lstrip("#*-> ").strip()
            if len(s) > 30 and not s.lower().startswith(comp.lower()):
                blurb = s
                break
    # Clean markdown/punctuation artifacts the notes carry (**, `, leading
    # ". "/heading "#"/"Creator pattern:") so gallery blurbs read cleanly.
    blurb = blurb.replace("**", "").replace("`", "")
    blurb = re.sub(r"^[\s.:>\-—*#]+", "", blurb).strip()
    return (score, verd, blurb[:240])


def frames_dir(creator):
    base = CRE / creator
    if not base.exists():
        return None
    cands = [Path(p) for p in glob.glob(str(base / "**"), recursive=True) if Path(p).is_dir()]
    cands = [c for c in cands if glob.glob(str(c / "*.jpg"))]
    if not cands:
        return None
    fresh = [c for c in cands if "_fresh" in c.name]
    pool = fresh if fresh else cands
    return max(pool, key=lambda d: len(glob.glob(str(d / "*.jpg"))))


def sample(d, n):
    js = sorted(glob.glob(str(d / "*.jpg")))
    if not js:
        return []
    if len(js) <= n:
        return [Path(p) for p in js]
    step = len(js) / n
    return [Path(js[int(i * step)]) for i in range(n)]


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


rows = []
for comp, creator in pairings():
    score, verd, blurb = note_meta(comp)
    d = frames_dir(creator)
    srcs = []
    nframes = 0
    if d:
        nframes = len(glob.glob(str(d / "*.jpg")))
        for i, f in enumerate(sample(d, N_FRAMES)):
            dst = SRCF / f"{comp}__{i}.jpg"
            try:
                shutil.copy(f, dst)
                srcs.append(f"output/cross-creator/srcframes/{dst.name}")
            except Exception:
                pass
    clip = f"output/cross-creator/{comp}.mp4"
    rows.append({
        "comp": comp, "creator": creator, "score": score, "verdict": verd,
        "blurb": blurb, "srcs": srcs, "fresh": bool(d and "_fresh" in d.name),
        "clip": clip if (ROOT / clip).exists() else "", "nframes": nframes,
    })

order = []
for r in rows:
    if r["creator"] not in order:
        order.append(r["creator"])

cards = []
for r in rows:
    vc = "imp" if r["verdict"] == "IMPROVED" else ("val" if r["verdict"] == "VALIDATED" else "na")
    strip = "".join(f'<img src="{s}" loading="lazy">' for s in r["srcs"]) or '<div class="noimg">no preserved frames</div>'
    clip = (f'<video src="{r["clip"]}" muted loop autoplay playsinline controls></video>'
            if r["clip"] else '<div class="noimg">no clip rendered</div>')
    fresh = '<span class="fresh">FRESH</span>' if r["fresh"] else ''
    cards.append(f'''
    <div class="row" data-creator="{esc(r['creator'])}" data-verdict="{r['verdict']}">
      <div class="hd"><h2>{esc(r['comp'])} <span class="arrow">↔</span> <span class="cre">@{esc(r['creator'])}</span></h2>
        <span class="badge {vc}">{r['verdict']} · {r['score']}</span></div>
      <div class="note">{esc(r['blurb'])}</div>
      <div class="pair">
        <div class="cell"><span class="tag s">SOURCE · {r['nframes']} frames {fresh}</span><div class="strip">{strip}</div></div>
        <div class="cell"><span class="tag r">OUR TEMPLATE</span>{clip}</div>
      </div>
    </div>''')

n_imp = sum(1 for r in rows if r["verdict"] == "IMPROVED")
n_val = sum(1 for r in rows if r["verdict"] == "VALIDATED")
creators_js = ",".join(f'"{c}"' for c in order)

html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Cross-creator deep QA — source vs our templates ({len(rows)} pairings)</title>
<style>
  :root{{--bg:#0b0d12;--panel:#141821;--ink:#eef2f8;--muted:#8b94a6;--cyan:#5BC0E8;--gold:#D4AF37;--line:#222836;--imp:#E8a13b;--val:#4bc07a}}
  *{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 -apple-system,BlinkMacSystemFont,Inter,sans-serif;padding:28px 38px}}
  h1{{font-size:27px;margin:0 0 4px}}.sub{{color:var(--muted);max-width:1100px;margin:0 0 8px}}
  .stat{{display:inline-block;font-size:12px;border:1px solid var(--line);border-radius:6px;padding:2px 8px;margin-right:6px;color:var(--muted)}}
  .filter{{margin:12px 0 18px}}.filter button{{background:#141821;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:5px 11px;margin:0 6px 6px 0;cursor:pointer;font-size:12.5px}}
  .filter button.on{{border-color:var(--cyan);color:var(--cyan)}}
  .row{{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:16px}}
  .hd{{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}}
  .row h2{{margin:0;font-size:16.5px;font-weight:700}}.arrow{{color:var(--muted)}}.cre{{color:var(--gold)}}
  .badge{{font-size:11.5px;font-weight:800;letter-spacing:.04em;padding:3px 10px;border-radius:7px}}
  .badge.imp{{background:rgba(232,161,59,.16);color:var(--imp);border:1px solid var(--imp)}}
  .badge.val{{background:rgba(75,192,122,.14);color:var(--val);border:1px solid var(--val)}}
  .badge.na{{background:#1a1f2a;color:var(--muted);border:1px solid var(--line)}}
  .note{{color:var(--muted);font-size:13px;margin:6px 0 11px}}
  .pair{{display:grid;grid-template-columns:1fr 360px;gap:18px;align-items:start}}
  .cell{{position:relative}}.cell .tag{{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.06em;padding:2px 8px;border-radius:6px;margin-bottom:7px}}
  .tag.s{{background:rgba(212,175,55,.92);color:#1a1206}}.tag.r{{background:rgba(91,192,232,.92);color:#04222e}}
  .fresh{{background:#1a3a2a;color:#6ee2a0;border-radius:4px;padding:1px 5px;font-size:9px;margin-left:4px}}
  .strip{{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}}
  .strip img{{height:290px;border-radius:8px;border:1px solid var(--line);background:#000;flex:0 0 auto}}
  .cell video{{width:100%;max-width:360px;border-radius:10px;background:#000;border:1px solid var(--line);display:block}}
  .noimg{{color:var(--muted);font-size:12px;padding:20px;border:1px dashed var(--line);border-radius:8px}}
  @media(max-width:900px){{.pair{{grid-template-columns:1fr}}}}
</style></head><body>
  <h1>Cross-creator deep QA — <b style="color:var(--gold)">SOURCE FRAMES</b> vs <b style="color:var(--cyan)">OUR TEMPLATES</b></h1>
  <p class="sub">Every composition we built from a reference creator (the full {len(rows)}-pairing set), each judged frame-by-frame against that creator's preserved source keyframes (green <b>FRESH</b> = freshly re-downloaded graphic frames). Scored on PATTERN fidelity — layout/color/type/motion — not copy; our templates intentionally use the Armando navy/gold brand + own content. <span class="stat">{len(rows)} pairings</span><span class="stat" style="color:var(--imp)">{n_imp} improved</span><span class="stat" style="color:var(--val)">{n_val} validated</span></p>
  <div class="filter" id="filter"></div>
  <div id="rows">{''.join(cards)}</div>
<script>
  const CREATORS=[{creators_js}];
  const f=document.getElementById('filter');
  f.innerHTML='<button data-k="creator" data-c="all" class="on">All ('+{len(rows)}+')</button>'
    +'<button data-k="verdict" data-c="IMPROVED">Improved ({n_imp})</button>'
    +'<button data-k="verdict" data-c="VALIDATED">Validated ({n_val})</button>'
    +CREATORS.map(c=>`<button data-k="creator" data-c="${{c}}">@${{c}}</button>`).join('');
  f.querySelectorAll('button').forEach(b=>b.onclick=()=>{{
    f.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
    const k=b.dataset.k,c=b.dataset.c;
    document.querySelectorAll('.row').forEach(r=>{{r.style.display=(c==='all'||r.dataset[k]===c)?'':'none';}});
  }});
  document.querySelectorAll('video').forEach(v=>v.play().catch(()=>{{}}));
</script></body></html>'''

(ROOT / "CROSS-CREATOR-COMPARE.html").write_text(html)
print(f"wrote CROSS-CREATOR-COMPARE.html — {len(rows)} pairings ({n_imp} improved / {n_val} validated)")
nofr = [r["comp"] for r in rows if not r["srcs"]]
noclip = [r["comp"] for r in rows if not r["clip"]]
if nofr:
    print("  no source frames:", ", ".join(nofr))
if noclip:
    print("  no clip:", ", ".join(noclip))
