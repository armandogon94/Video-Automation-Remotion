#!/usr/bin/env python3
"""Generate the HLG(arib-std-b67, bt2020) → SDR(bt709) 3D LUT used by the
auto-edit render pipeline (`src/autoedit/renderFromPlan.ts` → ffmpeg `lut3d`).

WHY A LUT
---------
iPhone .MOV footage is HLG 10-bit bt2020. This ffmpeg build has no zscale/libplacebo,
and the `colorspace` filter cannot parse the `arib-std-b67` transfer — a naive
transfer-swap only corrects the gamut and leaves the HLG curve un-inverted, which is
what produced the wrong (over-bright, over-saturated) colors. The full correct tonemap
is a deterministic per-pixel RGB→RGB function, so we bake it into a 33³ .cube LUT and
apply it natively with `lut3d` (fast, no extra deps).

The exposure gain (2.0), OOTF system gamma (1.2) and final saturation (0.65) were
tuned to MATCH the user's ground-truth reference frame
(`output/color-ref/HDR to SDR real colors.png`): polo≈[31,58,110], skin≈[138,107,103],
neutral bg≈[128,134,135]. See `.claude/memory.md` for the calibration notes.

Re-run after changing any constant:
    uv run --extra matting python scripts/gen_hlg_lut.py
"""
from __future__ import annotations

from pathlib import Path

import numpy as np

# ── Calibration constants (matched to the reference frame) ──
LUT_SIZE = 33
GAIN = 2.0  # exposure scale after OOTF
SYSG = 1.2  # HLG OOTF system gamma
SAT = 0.65  # final saturation multiplier (gamma-domain, luma-preserving)
# Highlight shoulder (extended-Reinhard white point, in display-linear). A single
# global gain that matched the polo/neutral pushed bright skin into a hard clip
# ("blown out"). LW rolls highlights off smoothly so lit skin keeps detail instead
# of clamping to white; LW≈1.5 drops lit-cheek clipping ~5.8%→~0.2% while leaving
# mids/darks (neutral bg, polo) essentially unchanged. Set very large to disable.
SHOULDER_LW = 1.5

# HLG (ARIB STD-B67) inverse-OETF constants.
_A, _B, _C = 0.17883277, 0.28466892, 0.55991073
# bt2020 → bt709 gamut conversion (linear-light 3×3).
_M_2020_TO_709 = np.array(
    [
        [1.660491, -0.587641, -0.072850],
        [-0.124550, 1.132900, -0.008349],
        [-0.018151, -0.100579, 1.118730],
    ]
)
_LUMA_2020 = np.array([0.2627, 0.6780, 0.0593])  # OOTF scene-luminance weights
_LUMA_709 = np.array([0.2126, 0.7152, 0.0722])  # display-luma weights for desat

# ── Empirical cross-channel correction (THE calibration to ground truth) ──
# The analytic HLG tonemap above gets the structure right but is too contrasty vs
# Apple's actual HLG→SDR grade (highlights too bright, mids/darks crushed, polo
# desaturated). This quadratic regression (features [1,R,G,B,R²,G²,B²,RG,RB,GB] →
# RGB) was least-squares-fit on 1564 flat patches pairing this tonemap's output
# against the user's ground-truth reference = the correctly-graded FIRST FRAME of
# IMG_3618.MOV (identified by NCC 0.957). It reproduces Apple's tonemap: post-fit
# per-region error dropped from 14–24 to 1–4 levels (full MAE R/G/B 8.5/7.8/9.1,
# residual is edge/detail misalignment, not color bias). Re-derive: scripts/fit_poly.
# A pure function of RGB, so it composes into the same 3D LUT.
_FIT_COEF = np.array([
    [+0.10961908, +0.10374458, +0.10574351],
    [+0.69281432, -0.01042838, +0.07072180],
    [+0.56711184, +0.54380585, -0.96666674],
    [-0.64895944, +0.12962180, +1.54318756],
    [+0.04434101, -0.44178070, +0.57317273],
    [+0.70159188, -1.62369194, -1.59509493],
    [+1.74352130, -0.60982907, -2.17874065],
    [-0.21154705, +1.51007957, -0.47129039],
    [+0.91798853, -0.53938870, -1.07293455],
    [-3.08980696, +1.75816942, +4.81052294],
])


def _apply_fit(v: np.ndarray) -> np.ndarray:
    """Quadratic cross-channel correction mapping the analytic tonemap onto the
    ground-truth Apple grade. v in 0..1 → corrected 0..1."""
    r, g, b = v[..., 0], v[..., 1], v[..., 2]
    feat = np.stack(
        [np.ones_like(r), r, g, b, r * r, g * g, b * b, r * g, r * b, g * b], -1
    )
    return np.clip(feat @ _FIT_COEF, 0, 1)


def hlg_to_sdr(e: np.ndarray) -> np.ndarray:
    """Map HLG-encoded bt2020 signal (E', shape (...,3), 0..1) → SDR bt709 (0..1)."""
    lin = np.where(e <= 0.5, e * e / 3.0, (np.exp((e - _C) / _A) + _B) / 12.0)
    y = lin @ _LUMA_2020
    lin = lin * np.power(np.clip(y, 1e-6, None), SYSG - 1)[..., None] * GAIN
    lc = np.clip(lin @ _M_2020_TO_709.T, 0, None)
    # Extended-Reinhard highlight shoulder (white point SHOULDER_LW): ~linear for
    # mids/darks, asymptotic toward 1.0 for highlights → no hard clip on lit skin.
    lc = lc * (1 + lc / (SHOULDER_LW * SHOULDER_LW)) / (1 + lc)
    lc = np.clip(lc, 0, 1)
    v = np.where(lc < 0.018, 4.5 * lc, 1.099 * np.power(lc, 0.45) - 0.099)
    v = np.clip(v, 0, 1)
    lum = (v @ _LUMA_709)[..., None]
    v = np.clip(lum + (v - lum) * SAT, 0, 1)
    return _apply_fit(v)


def main() -> None:
    out_path = Path(__file__).resolve().parent.parent / "src/matting/luts/hlg_to_sdr.cube"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    g = np.linspace(0, 1, LUT_SIZE)
    # .cube ordering: R varies fastest, then G, then B.
    bb, gg, rr = np.meshgrid(g, g, g, indexing="ij")
    e = np.stack([rr, gg, bb], -1).reshape(-1, 3)
    v = hlg_to_sdr(e)

    with out_path.open("w") as f:
        f.write(f"# HLG(arib-std-b67,bt2020) -> SDR bt709. gain{GAIN} sysg{SYSG} sat{SAT}\n")
        f.write(f"LUT_3D_SIZE {LUT_SIZE}\n")
        for px in v:
            f.write(f"{px[0]:.6f} {px[1]:.6f} {px[2]:.6f}\n")
    print(f"wrote {out_path} ({v.shape[0]} entries)")


if __name__ == "__main__":
    main()
