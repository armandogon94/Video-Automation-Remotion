#!/usr/bin/env -S uv run --extra matting --script
"""compare-frames — frame-by-frame head-to-head of a SOURCE creator clip vs OUR
replica render, for the abhishek.devini style-replication loop.

Extracts N evenly-spaced frames from the source scene [start,start+dur) and from the
replica [0,dur), tiles them SOURCE (left) | REPLICA (right) per row, and computes
per-frame numerical similarity (downscaled per-channel MAE + grayscale NCC). Writes a
side-by-side PNG and prints a JSON verdict so iteration can be driven by numbers, not
just eyeballing.

Usage:
  scripts/compare-frames.py --source <src.mp4> --source-start 5.0 --dur 4.0 \
      --replica <replica.mp4> --n 8 --out /tmp/cmp.png [--label "title-card"]
"""
import argparse, io, json, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw


def grab(path: str, t: float) -> Image.Image:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{t}", "-i", path, "-frames:v", "1",
         "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True).stdout
    return Image.open(io.BytesIO(raw)).convert("RGB")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    ap.add_argument("--source-start", type=float, default=0.0)
    ap.add_argument("--dur", type=float, required=True)
    ap.add_argument("--replica", required=True)
    ap.add_argument("--replica-start", type=float, default=0.0)
    ap.add_argument("--n", type=int, default=8)
    ap.add_argument("--out", required=True)
    ap.add_argument("--label", default="")
    a = ap.parse_args()

    tw, th = 220, 391  # 9:16 thumb
    pad, hdr = 8, 22
    sheet = Image.new("RGB", (tw * 2 + pad * 3, (th + hdr) * a.n + hdr), (11, 13, 18))
    d = ImageDraw.Draw(sheet)
    d.text((pad, 4), f"{a.label}  SOURCE (left) vs REPLICA (right)  ·  {a.n} frames", fill=(212, 175, 55))

    metrics = []
    for i in range(a.n):
        frac = (i + 0.5) / a.n
        ts = a.source_start + frac * a.dur
        tr = a.replica_start + frac * a.dur
        try:
            s = grab(a.source, ts)
        except Exception:
            s = Image.new("RGB", (tw, th), (40, 0, 0))
        try:
            r = grab(a.replica, tr)
        except Exception:
            r = Image.new("RGB", (tw, th), (0, 0, 40))
        # numeric compare at common small size
        sa = np.asarray(s.resize((90, 160))).astype(float)
        ra = np.asarray(r.resize((90, 160))).astype(float)
        mae = float(np.abs(sa - ra).mean())
        sg = sa.mean(2); rg = ra.mean(2)
        sgn = (sg - sg.mean()) / (sg.std() + 1e-6); rgn = (rg - rg.mean()) / (rg.std() + 1e-6)
        ncc = float((sgn * rgn).mean())
        metrics.append({"frame": i, "t_src": round(ts, 2), "mae": round(mae, 1), "ncc": round(ncc, 3)})
        y = hdr + i * (th + hdr)
        d.text((pad, y - 16), f"t={ts:.2f}s  MAE {mae:.0f}  NCC {ncc:+.2f}", fill=(139, 148, 166))
        sheet.paste(s.resize((tw, th)), (pad, y))
        sheet.paste(r.resize((tw, th)), (pad * 2 + tw, y))

    sheet.save(a.out)
    verdict = {
        "label": a.label, "n": a.n,
        "mean_mae": round(float(np.mean([m["mae"] for m in metrics])), 1),
        "mean_ncc": round(float(np.mean([m["ncc"] for m in metrics])), 3),
        "per_frame": metrics, "out": a.out,
    }
    print(json.dumps(verdict, indent=2))


if __name__ == "__main__":
    main()
