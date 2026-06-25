#!/usr/bin/env -S uv run --extra matting --script
"""
Build contact sheets for Codex visual review: per cross-creator target, tile the
creator's SOURCE frame next to OUR rendered clip's mid-frame, labelled, into a few
master PNGs small enough to attach to a Codex prompt. Also covers the abhi set.
Output: docs/codex-review/sheets/cc-<n>.png and abhi-<n>.png
"""
import glob, os, re, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "codex-review" / "sheets"
OUT.mkdir(parents=True, exist_ok=True)
SRCF = ROOT / "output" / "cross-creator" / "srcframes"

def font(sz):
    for fp in ["/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/System/Library/Fonts/Helvetica.ttc"]:
        if Path(fp).exists():
            try: return ImageFont.truetype(fp, sz)
            except Exception: pass
    return ImageFont.load_default()
F = font(15)

def clip_mid(mp4, dst, frac=0.62):
    # Sample at a fraction of the clip's actual duration (not a hardcoded 2.0s) so
    # delayed-reveal templates (e.g. QuoteCard revealDelaySeconds) show real content.
    try:
        d = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
            "-of","default=nw=1:nk=1",str(mp4)],capture_output=True,text=True).stdout.strip() or "5")
    except Exception:
        d = 5.0
    t = max(0.1, d * frac)
    subprocess.run(["ffmpeg","-y","-ss",f"{t:.2f}","-i",str(mp4),"-frames:v","1","-q:v","3",str(dst)],capture_output=True)
    return dst if dst.exists() else None

def driver_targets():
    t = (ROOT/"src/autoedit/runCrossCreatorReplicas.ts").read_text()
    return [(m.group(1),m.group(2)) for m in re.finditer(r'comp:\s*"([^"]+)",\s*creator:\s*"([^"]+)"', t)]

def row(label, src_img, our_img, w=380):
    h = int(w*16/9) if "9x16" in label or src_img is None else int(w*9/16)
    cell_h = 300
    def fit(im):
        if im is None: return Image.new("RGB",(int(cell_h*0.6),cell_h),(30,30,36))
        ww = int(im.width*cell_h/im.height); return im.resize((ww,cell_h))
    s = fit(src_img); o = fit(our_img)
    r = Image.new("RGB",(s.width+o.width+30, cell_h+26),(16,18,24))
    d = ImageDraw.Draw(r); d.text((6,4),label,font=F,fill=(238,242,248))
    d.text((6,cell_h+8),"SOURCE",font=font(11),fill=(212,175,55))
    d.text((s.width+30,cell_h+8),"OURS",font=font(11),fill=(91,192,232))
    r.paste(s,(0,22)); r.paste(o,(s.width+30,22))
    return r

def build(pairs, prefix, per=10):
    tmp = OUT/"_tmp"; tmp.mkdir(exist_ok=True)
    rows=[]
    for comp, creator in pairs:
        srcs = sorted(glob.glob(str(SRCF/f"{comp}__*.jpg")))
        src = Image.open(srcs[len(srcs)//2]).convert("RGB") if srcs else None
        clip = ROOT/f"output/cross-creator/{comp}.mp4"
        our = None
        if clip.exists():
            f = clip_mid(clip, tmp/f"{comp}.jpg")
            if f: our = Image.open(f).convert("RGB")
        rows.append(row(f"{comp}  vs  @{creator}", src, our))
    n=0
    for i in range(0,len(rows),per):
        chunk=rows[i:i+per]; W=max(r.width for r in chunk); H=sum(r.height+6 for r in chunk)+6
        sheet=Image.new("RGB",(W,H),(8,9,13)); y=6
        for r in chunk: sheet.paste(r,(0,y)); y+=r.height+6
        p=OUT/f"{prefix}-{n+1}.png"; sheet.save(p); print("wrote",p,sheet.size); n+=1

def build_abhi(per=8):
    tmp = OUT/"_tmp"; tmp.mkdir(exist_ok=True)
    comps = [Path(p).stem for p in sorted(glob.glob(str(ROOT/"output/abhi/*.mp4")))]
    rows=[]
    for comp in comps:
        srcm = ROOT/f"output/abhi/source-scenes/{comp}.mp4"
        ourm = ROOT/f"output/abhi/{comp}.mp4"
        src = Image.open(clip_mid(srcm, tmp/f"abhisrc_{comp}.jpg")).convert("RGB") if srcm.exists() else None
        our = Image.open(clip_mid(ourm, tmp/f"abhiour_{comp}.jpg")).convert("RGB") if ourm.exists() else None
        rows.append(row(f"abhi/{comp}", src, our))
    for i in range(0,len(rows),per):
        chunk=rows[i:i+per]; W=max(r.width for r in chunk); H=sum(r.height+6 for r in chunk)+6
        sheet=Image.new("RGB",(W,H),(8,9,13)); y=6
        for r in chunk: sheet.paste(r,(0,y)); y+=r.height+6
        p=OUT/f"abhi-{i//per+1}.png"; sheet.save(p); print("wrote",p,sheet.size)

build(driver_targets(), "cc", per=10)
build_abhi(per=8)
print("done")
