#!/usr/bin/env -S uv run --extra matting --script
"""
Final QA contact sheet for the abhishek.devini replica set.
For each of the 23 templates, extract 3 evenly-spaced frames from BOTH the
source scene clip and our replica, tile them into a labelled row
(SOURCE on top, REPLICA below), then stack all rows into split master sheets
small enough to eyeball for regressions.

Usage: ./scripts/abhi-qa-contactsheet.py
"""
import json
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
REPL = ROOT / "output" / "abhi"
SRC = REPL / "source-scenes"
OUT = ROOT / "output" / "abhi-qa"
OUT.mkdir(parents=True, exist_ok=True)

# template order from the registry
KEYS = [
    "AbhiTitleCard", "AbhiBigStat", "AbhiTerminalCard", "AbhiFeatureGrid",
    "AbhiFeatureRows", "AbhiGridVsTerminal", "AbhiCtaComment", "AbhiBrandLockup",
    "AbhiBrowserMockup", "AbhiKineticSubtitle", "AbhiNodeGraph", "AbhiBarChart",
    "AbhiPhoneMockup", "AbhiComparisonTable", "AbhiChecklist", "AbhiTwoColumn",
    "AbhiScrambleOpener", "AbhiQuoteCard", "AbhiTweetCard", "AbhiWaveform",
    "AbhiAppCard", "AbhiLineChart", "AbhiCodeDiff",
]

THUMB_W = 220          # per-frame thumb width
THUMB_H = int(THUMB_W * 16 / 9)
N = 3                  # frames per clip
PAD = 6
LABEL_W = 150

def dur(p: Path) -> float:
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(p)],
            capture_output=True, text=True, check=True).stdout.strip()
        return float(out)
    except Exception:
        return 0.0

def grab(p: Path, n: int, tmp: Path) -> list[Image.Image]:
    d = dur(p)
    imgs = []
    for i in range(n):
        t = d * (i + 0.5) / n if d else 0.1
        f = tmp / f"{p.stem}_{i}.jpg"
        subprocess.run(
            ["ffmpeg", "-y", "-ss", f"{t:.3f}", "-i", str(p),
             "-frames:v", "1", "-q:v", "3", str(f)],
            capture_output=True, check=False)
        if f.exists():
            imgs.append(Image.open(f).convert("RGB").resize((THUMB_W, THUMB_H)))
        else:
            imgs.append(Image.new("RGB", (THUMB_W, THUMB_H), (20, 20, 26)))
    return imgs

def font(sz: int):
    for fp in ["/System/Library/Fonts/Supplemental/Arial Bold.ttf",
               "/System/Library/Fonts/Helvetica.ttc"]:
        if Path(fp).exists():
            try:
                return ImageFont.truetype(fp, sz)
            except Exception:
                pass
    return ImageFont.load_default()

F_KEY = font(17)
F_TAG = font(13)

row_w = LABEL_W + N * (THUMB_W + PAD) + PAD
row_h = 2 * (THUMB_H + PAD) + PAD + 26

def build_row(key: str, tmp: Path) -> Image.Image:
    src_p = SRC / f"{key}.mp4"
    rep_p = REPL / f"{key}.mp4"
    row = Image.new("RGB", (row_w, row_h), (14, 16, 22))
    d = ImageDraw.Draw(row)
    d.text((10, row_h // 2 - 8), key.replace("Abhi", ""), font=F_KEY, fill=(238, 242, 248))
    for col, (lbl, p, color) in enumerate([
        ("SOURCE", src_p, (212, 175, 55)),
        ("REPLICA", rep_p, (91, 192, 232)),
    ]):
        y = PAD + col * (THUMB_H + PAD) + (26 if col else 0)
        if not p.exists():
            d.text((LABEL_W, y), f"{lbl}: MISSING", font=F_TAG, fill=(220, 90, 90))
            continue
        imgs = grab(p, N, tmp)
        for i, im in enumerate(imgs):
            x = LABEL_W + i * (THUMB_W + PAD)
            row.paste(im, (x, y))
        d.rectangle([LABEL_W - 2, y - 2, LABEL_W + 52, y + 15], fill=color)
        d.text((LABEL_W + 3, y - 1), lbl, font=F_TAG, fill=(10, 10, 14))
    return row

def main():
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        rows = [build_row(k, tmp) for k in KEYS]
        # split into 2 master sheets of ~12 rows for readability
        for half, chunk in enumerate([rows[:12], rows[12:]]):
            H = sum(r.height + PAD for r in chunk) + PAD
            sheet = Image.new("RGB", (row_w, H), (8, 9, 13))
            yy = PAD
            for r in chunk:
                sheet.paste(r, (0, yy))
                yy += r.height + PAD
            outp = OUT / f"abhi-qa-sheet-{half+1}.png"
            sheet.save(outp)
            print(f"wrote {outp}  ({sheet.width}x{sheet.height})")

if __name__ == "__main__":
    main()
