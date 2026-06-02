"""
RobustVideoMatting (RVM) person-matte pre-step for the AI Video Factory pipeline.

Produces a per-frame alpha matte of the speaker so a Remotion composition can put
captions/graphics BEHIND the person (text-behind-speaker depth effect). The matte
is consumed by `SpeakerOverlayScene.foregroundMatte` (built by a sibling agent).

The matting MODEL is RobustVideoMatting, loaded via torch.hub (there is NO usable
PyPI package named `rvm` — the one that exists is unrelated "R in Python"). Weights
are fetched once from GitHub, then cached under ~/.cache/torch/hub and run offline.

Output modes (mirrors RVM's bundled `convert_video`):
  * png_sequence (DEFAULT, recommended for Remotion): a directory of RGBA PNGs that
    carry a real per-pixel alpha channel. Pixel-perfect, no green-spill, trivially
    alpha-composited by the browser. This is what `foregroundMatte.kind = "png-sequence"`
    consumes.
  * green: an H.264 .mp4 with the foreground composited over green screen
    (RVM's VideoWriter is yuv420p / no alpha, so the "video" mode can only emit
    green-screen, NOT an alpha .mov). Consumed via OffthreadVideo + chroma key
    (`foregroundMatte.kind = "green-mov"`).
  * alpha: a grayscale H.264 .mp4 of the raw alpha matte only (debug / mask reuse).

NOTE on alpha .mov: RVM's PyAV VideoWriter hard-codes h264/yuv420p, so it cannot
emit a ProRes-4444 / alpha-channel video directly. For true alpha into Remotion use
the RGBA png_sequence (default). A green-screen .mp4 is the only single-file option.

Usage:
    SSL_CERT_FILE=$(python -c 'import certifi;print(certifi.where())') \
    uv run --extra matting python src/matting/rvm_matte.py \
        --input output/footage/clip.MOV \
        --output output/matting-test/clip \
        --device mps --downsample-ratio 0.25 --seconds 4

The SSL_CERT_FILE export is only needed for the FIRST run (the torch.hub weight
fetch) on a macOS python.org framework build, whose default install lacks a CA
bundle. After the weights are cached this script runs fully offline. The script
also sets the cert path itself from `certifi` if SSL_CERT_FILE is unset, so the
manual export is belt-and-suspenders.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

OutputType = str  # "png_sequence" | "green" | "alpha"

RVM_REPO = "PeterL1n/RobustVideoMatting"
RVM_VARIANT = "mobilenetv3"  # smaller/faster than resnet50; fine for offline batch


def _ensure_ssl_cert() -> None:
    """Point urllib at certifi's CA bundle so torch.hub can fetch over HTTPS.

    macOS python.org framework builds ship without a usable system CA bundle, so
    the torch.hub weight download fails with CERTIFICATE_VERIFY_FAILED. We set the
    standard env vars from certifi if they are not already set. Harmless when the
    weights are already cached (no network needed then).
    """
    if os.environ.get("SSL_CERT_FILE") and os.environ.get("REQUESTS_CA_BUNDLE"):
        return
    try:
        import certifi

        bundle = certifi.where()
        os.environ.setdefault("SSL_CERT_FILE", bundle)
        os.environ.setdefault("REQUESTS_CA_BUNDLE", bundle)
    except Exception:
        # certifi missing — if weights are cached this still works offline.
        pass


def _patch_rvm_video_writer() -> None:
    """Fix RVM's VideoWriter for modern PyAV (only needed for green/alpha video modes).

    RVM's bundled inference_utils.VideoWriter calls
    `container.add_stream('h264', rate=f'{frame_rate:.4f}')` — passing the frame
    rate as a STRING. PyAV >= 14 rejects that (AttributeError: 'str' object has no
    attribute 'numerator'), breaking output_type='video'. We wrap add_stream so a
    string `rate` is coerced to float. The png_sequence path never touches this,
    so it works without the patch; we only apply it for the .mp4 video modes.
    """
    import importlib

    iu = importlib.import_module("inference_utils")
    if getattr(iu.VideoWriter, "_factory_rate_patched", False):
        return

    orig_init = iu.VideoWriter.__init__

    def patched_init(self, path, frame_rate, bit_rate=1000000):  # type: ignore[no-untyped-def]
        import av
        from fractions import Fraction

        self.container = av.open(path, mode="w")
        self.stream = self.container.add_stream(
            "h264", rate=Fraction(float(frame_rate)).limit_denominator(1000)
        )
        self.stream.pix_fmt = "yuv420p"
        self.stream.bit_rate = bit_rate

    patched_init._factory_rate_patched = True  # type: ignore[attr-defined]
    iu.VideoWriter.__init__ = patched_init
    iu.VideoWriter._factory_rate_patched = True  # type: ignore[attr-defined]


def detect_device(requested: str) -> str:
    """Resolve the compute device, auto-detecting MPS with a CPU fallback."""
    import torch

    if requested == "cpu":
        return "cpu"
    if requested == "mps":
        if torch.backends.mps.is_available() and torch.backends.mps.is_built():
            return "mps"
        print(
            "[rvm] MPS requested but not available/built — falling back to CPU.",
            file=sys.stderr,
        )
        return "cpu"
    # requested == "auto"
    if torch.backends.mps.is_available() and torch.backends.mps.is_built():
        return "mps"
    return "cpu"


def trim_input(input_path: Path, seconds: float, work_dir: Path) -> Path:
    """Trim the input to the first `seconds` using ffmpeg (re-encode to be frame-exact).

    RVM's convert_video has no native duration limit, so for quick runs we cut a
    short clip first. We re-encode (not stream-copy) so the cut starts on a clean
    keyframe and the frame count is exact.
    """
    if shutil.which("ffmpeg") is None:
        raise RuntimeError(
            "--seconds requires ffmpeg on PATH (brew install ffmpeg). "
            "Either install ffmpeg or run without --seconds on a pre-trimmed clip."
        )
    trimmed = work_dir / f"trimmed_{seconds:g}s{input_path.suffix}"
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-t",
        f"{seconds:g}",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-an",
        str(trimmed),
    ]
    print(f"[rvm] Trimming first {seconds:g}s -> {trimmed}", file=sys.stderr)
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg trim failed:\n{proc.stderr[-2000:]}")
    return trimmed


def run_matte(
    input_path: Path,
    output_path: Path,
    device: str = "auto",
    downsample_ratio: float | None = 0.25,
    seconds: float | None = None,
    output_type: OutputType = "png_sequence",
    seq_chunk: int = 12,
) -> dict:
    """Run RVM and write the matte. Returns a small result dict (paths, timing, device).

    Args:
        input_path: source video (talking head).
        output_path: for png_sequence -> a DIRECTORY of RGBA PNGs; for green/alpha
            -> a .mp4 file path (a .mp4 suffix is appended if missing).
        device: "auto" | "mps" | "cpu".
        downsample_ratio: RVM internal downsample for the recurrent net. Lower =
            faster/coarser. 0.25 is a good start for HD; ~0.4 for 4K.
        seconds: if set, matte only the first N seconds (quick verification runs).
        output_type: "png_sequence" (RGBA, recommended) | "green" (green-screen mp4)
            | "alpha" (grayscale alpha mp4, debug).
        seq_chunk: frames processed per forward pass (throughput vs memory).
    """
    import torch

    _ensure_ssl_cert()
    resolved_device = detect_device(device)
    print(f"[rvm] device = {resolved_device}", file=sys.stderr)

    work_dir = Path(tempfile.mkdtemp(prefix="rvm_"))
    try:
        source = input_path
        if seconds is not None:
            source = trim_input(input_path, seconds, work_dir)

        print(f"[rvm] loading model {RVM_REPO}:{RVM_VARIANT} ...", file=sys.stderr)
        model = torch.hub.load(RVM_REPO, RVM_VARIANT, trust_repo=True)
        convert_video = torch.hub.load(RVM_REPO, "converter", trust_repo=True)
        model = model.eval().to(resolved_device)

        # The .mp4 video writers (green/alpha) need a PyAV-compat patch; PNG seq does not.
        if output_type in ("green", "alpha"):
            _patch_rvm_video_writer()

        # Resolve output target + RVM args by output_type.
        if output_type == "png_sequence":
            comp_dir = output_path
            comp_dir.mkdir(parents=True, exist_ok=True)
            convert_kwargs = dict(
                output_type="png_sequence",
                output_composition=str(comp_dir),  # RGBA PNGs (real alpha)
            )
            primary_output = comp_dir
        elif output_type == "green":
            out_file = output_path
            if out_file.suffix.lower() != ".mp4":
                out_file = out_file.with_suffix(".mp4")
            out_file.parent.mkdir(parents=True, exist_ok=True)
            convert_kwargs = dict(
                output_type="video",
                output_composition=str(out_file),  # green-screen H.264
            )
            primary_output = out_file
        elif output_type == "alpha":
            out_file = output_path
            if out_file.suffix.lower() != ".mp4":
                out_file = out_file.with_suffix(".mp4")
            out_file.parent.mkdir(parents=True, exist_ok=True)
            convert_kwargs = dict(
                output_type="video",
                output_alpha=str(out_file),  # grayscale alpha matte only
            )
            primary_output = out_file
        else:
            raise ValueError(
                f"unknown output_type {output_type!r}; "
                "expected png_sequence | green | alpha"
            )

        print(
            f"[rvm] matting '{source.name}' (downsample_ratio={downsample_ratio}, "
            f"output_type={output_type}) ...",
            file=sys.stderr,
        )
        start = time.time()
        convert_video(
            model,
            input_source=str(source),
            downsample_ratio=downsample_ratio,
            output_type=convert_kwargs["output_type"],
            output_composition=convert_kwargs.get("output_composition"),
            output_alpha=convert_kwargs.get("output_alpha"),
            seq_chunk=seq_chunk,
            num_workers=0,
            progress=True,
            device=resolved_device,
        )
        elapsed = round(time.time() - start, 1)
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)

    # Tally output.
    if output_type == "png_sequence":
        pngs = sorted(primary_output.glob("*.png"))
        frame_count = len(pngs)
        total_bytes = sum(p.stat().st_size for p in pngs)
    else:
        frame_count = None
        total_bytes = primary_output.stat().st_size if primary_output.exists() else 0

    result = {
        "input": str(input_path),
        "output": str(primary_output),
        "outputType": output_type,
        "device": resolved_device,
        "downsampleRatio": downsample_ratio,
        "seconds": seconds,
        "elapsedSeconds": elapsed,
        "frameCount": frame_count,
        "outputBytes": total_bytes,
    }
    print(
        f"[rvm] DONE in {elapsed}s on {resolved_device} -> {primary_output} "
        f"(frames={frame_count}, bytes={total_bytes})",
        file=sys.stderr,
    )
    if total_bytes == 0:
        raise RuntimeError(
            f"matte output is empty at {primary_output}; "
            "check input video and downsample_ratio."
        )
    return result


def main() -> None:
    parser = argparse.ArgumentParser(
        description="RobustVideoMatting person-matte pre-step (text-behind-speaker).",
    )
    parser.add_argument(
        "--input", required=True, help="Source video file (talking head)."
    )
    parser.add_argument(
        "--output",
        required=True,
        help=(
            "Output path. For png_sequence: a directory (RGBA PNGs written inside). "
            "For green/alpha: a .mp4 file path."
        ),
    )
    parser.add_argument(
        "--device",
        choices=["auto", "mps", "cpu"],
        default="auto",
        help="Compute device. 'auto' prefers MPS (Apple Silicon), falls back to CPU.",
    )
    parser.add_argument(
        "--downsample-ratio",
        type=float,
        default=0.25,
        help="RVM internal downsample (lower=faster/coarser). ~0.25 HD, ~0.4 for 4K.",
    )
    parser.add_argument(
        "--seconds",
        type=float,
        default=None,
        help="Limit to the first N seconds (quick runs). Requires ffmpeg on PATH.",
    )
    parser.add_argument(
        "--output-type",
        choices=["png_sequence", "green", "alpha"],
        default="png_sequence",
        help=(
            "png_sequence=RGBA PNGs (recommended for Remotion); "
            "green=green-screen .mp4; alpha=grayscale alpha .mp4 (debug)."
        ),
    )
    parser.add_argument(
        "--seq-chunk",
        type=int,
        default=12,
        help="Frames per forward pass (throughput vs memory).",
    )

    args = parser.parse_args()

    run_matte(
        input_path=Path(args.input),
        output_path=Path(args.output),
        device=args.device,
        downsample_ratio=args.downsample_ratio,
        seconds=args.seconds,
        output_type=args.output_type,
        seq_chunk=args.seq_chunk,
    )


if __name__ == "__main__":
    main()
