#!/usr/bin/env python3
"""
W21 5x6 comparison-grid v4 builder.

Stitches all 28 W21 preview frames into a single 5-cols x 6-rows montage with
variant labels under each cell. Cells 29 and 30 are left blank.

Output: output/2026-05-18-gemini-3-2-flash-leak/comparison-grid-v4.jpg
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SLUG = "2026-05-18-gemini-3-2-flash-leak"
OUT_DIR = PROJECT_ROOT / "output" / SLUG

# Variant order: roughly grouped by phase of the bake-off process. New W21
# Wave-3 templates (the 5 just rendered) land at the bottom-right cluster.
VARIANTS: list[tuple[str, str]] = [
    # row 1
    ("bignum-cream",            "BigNumber · cream"),
    ("bignum-dark",             "BigNumber · dark"),
    ("counter-cream",           "Counter · cream"),
    ("counter-dark",            "Counter · dark"),
    ("text-blurin-cream",       "Text Blur · cream"),
    # row 2
    ("text-blurin-dark",        "Text Blur · dark"),
    ("text-scramble-cream",     "Text Scramble · cream"),
    ("text-scramble-dark",      "Text Scramble · dark"),
    ("quote-cream",             "Quote · cream"),
    ("quote-dark",              "Quote · dark"),
    # row 3
    ("benchmark-cream",         "Benchmark · cream"),
    ("benchmark-dark",          "Benchmark · dark"),
    ("diagram-cream",           "Diagram · cream"),
    ("diagram-dark",            "Diagram · dark"),
    ("thinking-cream",          "Thinking · cream"),
    # row 4
    ("thinking-dark",           "Thinking · dark"),
    ("tokenstream-cream",       "TokenStream · cream"),
    ("tokenstream-dark",        "TokenStream · dark"),
    ("attention-cream",         "Attention · cream"),
    ("attention-dark",          "Attention · dark"),
    # row 5
    ("tnf-blue",                "TNF · blue"),
    ("tnf-transitions",         "TNF · transitions"),
    ("tweetcard",               "TweetCard"),
    # ── W21 Wave-3 (just rendered) ────────────────────────────────────────
    ("logocarousel",            "LogoCarousel"),
    ("table",                   "AnimatedTable"),
    # row 6
    ("sparkline",               "Sparkline"),
    ("forcegraph",              "ForceGraph"),
    ("thd-revised",             "THD revised"),
    # cells 29 & 30 left blank.
]

assert len(VARIANTS) == 28, f"Expected 28 variants, got {len(VARIANTS)}"


def first_preview(variant_dir: Path) -> Path | None:
    """Pick the first preview*.jpg inside the variant directory."""
    candidates = sorted(variant_dir.glob("preview*.jpg"))
    return candidates[0] if candidates else None


def main() -> None:
    COLS, ROWS = 5, 6
    CELL_W, CELL_H = 270, 480  # 9:16, 1/4 of 1080x1920
    LABEL_H = 36
    PAD = 6
    BG = (15, 27, 45)  # navy
    INK = (245, 239, 227)  # cream
    MUTED = (140, 150, 165)

    full_w = COLS * (CELL_W + PAD) + PAD
    full_h = ROWS * (CELL_H + LABEL_H + PAD) + PAD

    canvas = Image.new("RGB", (full_w, full_h), BG)
    draw = ImageDraw.Draw(canvas)

    # Try several font paths, fall back to default if all fail.
    font = None
    for font_path in [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ]:
        try:
            font = ImageFont.truetype(font_path, 16)
            break
        except OSError:
            continue
    if font is None:
        font = ImageFont.load_default()

    missing: list[str] = []
    for idx, (slug, label) in enumerate(VARIANTS):
        col = idx % COLS
        row = idx // COLS
        x = PAD + col * (CELL_W + PAD)
        y = PAD + row * (CELL_H + LABEL_H + PAD)

        variant_dir = OUT_DIR / slug
        preview = first_preview(variant_dir)
        if preview is None or not preview.exists():
            # Placeholder cell with muted block + slug.
            draw.rectangle((x, y, x + CELL_W, y + CELL_H), fill=(40, 50, 65))
            draw.text((x + 8, y + 8), f"MISSING: {slug}", fill=MUTED, font=font)
            missing.append(slug)
        else:
            img = Image.open(preview).convert("RGB")
            img = img.resize((CELL_W, CELL_H), Image.LANCZOS)
            canvas.paste(img, (x, y))

        # Label band below the cell
        label_y = y + CELL_H
        draw.rectangle(
            (x, label_y, x + CELL_W, label_y + LABEL_H),
            fill=(25, 38, 60),
        )
        # Centre the label text within the label band.
        try:
            bbox = draw.textbbox((0, 0), label, font=font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
        except AttributeError:  # very old PIL
            tw, th = draw.textsize(label, font=font)
        tx = x + (CELL_W - tw) // 2
        ty = label_y + (LABEL_H - th) // 2 - 2
        draw.text((tx, ty), label, fill=INK, font=font)

    out_path = OUT_DIR / "comparison-grid-v4.jpg"
    canvas.save(out_path, "JPEG", quality=88, optimize=True)
    print(f"Wrote {out_path}  ({full_w}x{full_h})  variants={len(VARIANTS)}")
    if missing:
        print(f"WARN: {len(missing)} missing preview(s): {missing}")


if __name__ == "__main__":
    main()
