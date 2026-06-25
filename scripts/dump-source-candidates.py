#!/usr/bin/env python3
"""Emit a compact candidate-source catalog for the cross-creator source-map
verification workflow.

For each reference creator we list every frame directory (reel `frames/`, reel
`_fresh/`, `_new/`, `_backcat/<reel>/...`) that contains JPGs, plus — for the shared
per-creator `_fresh` bucket — one pseudo-candidate per distinct filename prefix
(each prefix is a different re-downloaded pattern). Agents read these abs frames +
the comp note to pick the correct SOURCE scene per template.

Output (stdout): JSON {worktree, comps:[{comp,creator,note_rel,current_srcid}],
creators:{<creator>:[{dir_rel,prefix,n,sample_abs}]}}.
"""
import glob
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CRE = ROOT / "references" / "creators"
NOTES = ROOT / "docs" / "research" / "cross-creator" / "notes"
DRIVER = ROOT / "src" / "autoedit" / "runCrossCreatorReplicas.ts"
HTML = ROOT / "CROSS-CREATOR-COMPARE.html"


def pairings():
    t = DRIVER.read_text()
    return [(m.group(1), m.group(2)) for m in
            re.finditer(r'comp:\s*"([^"]+)",\s*creator:\s*"([^"]+)"', t)]


def stem_prefix(name):
    return re.sub(r"\d+(\.jpg)?$", "", name)


def candidates(creator):
    base = CRE / creator
    if not base.exists():
        return []
    out = []
    dirs = sorted({Path(p).parent for p in glob.glob(str(base / "**" / "*.jpg"), recursive=True)})
    for d in dirs:
        js = sorted(glob.glob(str(d / "*.jpg")))
        if not js:
            continue
        rel = str(d.relative_to(ROOT))
        # shared per-creator `_fresh` bucket -> one pseudo-candidate per pattern prefix
        if d.name == "_fresh" and d.parent.name == creator:
            groups = {}
            for j in js:
                groups.setdefault(stem_prefix(Path(j).name), []).append(j)
            for pre, members in sorted(groups.items()):
                out.append({"dir_rel": rel, "prefix": pre, "n": len(members),
                            "sample_abs": members[0]})
        else:
            out.append({"dir_rel": rel, "prefix": None, "n": len(js),
                        "sample_abs": js[0]})
    return out


def current_srcids():
    if not HTML.exists():
        return {}
    html = HTML.read_text()
    out = {}
    for m in re.finditer(
        r'<div class="hd"><h2>([A-Za-z0-9]+)\b.*?SOURCE · \d+ frames(?: · ([A-Za-z0-9_\-]+))?',
            html, re.S):
        out[m.group(1)] = m.group(2) or "(fallback)"
    return out


pr = pairings()
srcids = current_srcids()
creators = {}
comps = []
for comp, creator in pr:
    if creator not in creators:
        creators[creator] = candidates(creator)
    note = NOTES / f"{comp}.md"
    comps.append({
        "comp": comp, "creator": creator,
        "note_rel": str(note.relative_to(ROOT)) if note.exists() else None,
        "current_srcid": srcids.get(comp, "(none)"),
    })

print(json.dumps({"worktree": str(ROOT), "comps": comps, "creators": creators}))
