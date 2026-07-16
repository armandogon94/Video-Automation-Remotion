"""
faster-whisper transcription wrapper.
Usage: python src/transcribe/transcribe.py --input audio.mp3 --model small --language es
Outputs JSON to stdout with word-level timestamps.
"""

import argparse
import json
import sys
from pathlib import Path


def format_timestamp_srt(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def parse_glossary_text(text: str) -> list[str]:
    """Parse a newline/comma-separated glossary into a clean term list."""
    terms: list[str] = []
    for chunk in text.replace(",", "\n").splitlines():
        term = chunk.strip()
        if term:
            terms.append(term)
    return terms


def resolve_prompt_and_hotwords(
    language: str,
    initial_prompt: str | None,
    hotwords: str | None,
    glossary_terms: list[str] | None,
) -> tuple[str | None, str | None]:
    """Resolve the (initial_prompt, hotwords) pair passed to whisper.

    There is deliberately NO default initial_prompt for ANY language
    (`language` is accepted so the no-default policy is testable per-language
    and so a future language-aware bias has an explicit seam):

    - 2026-07-06: the old generic prompt "Transcripción en español con
      puntuación correcta." was found to be hallucinated verbatim as the
      transcript of ENGLISH clips, so it was limited to `es*` languages.
    - 2026-07-15 (GPT-5.6 peer review, docs/peer-review/GPT56-FINDINGS.md
      §2.4): the SAME prompt was then REPRODUCED replacing real SPANISH
      speech with itself — a 30 s montage of real es raw takes transcribed
      as exactly those 6 prompt words (p≈0.004–0.018), while the identical
      run with no prompt returned 27 real words. The prompt is actively
      unsafe as a default; vocabulary bias belongs in `hotwords` /
      `--glossary-file` instead, and even those are hints, not truth.

    Precedence for hotwords: an explicit `hotwords` string wins; otherwise
    glossary terms are joined with ", "; otherwise None.
    """
    resolved_prompt = initial_prompt or None

    if hotwords:
        resolved_hotwords: str | None = hotwords
    elif glossary_terms:
        joined = ", ".join(t for t in (term.strip() for term in glossary_terms) if t)
        resolved_hotwords = joined or None
    else:
        resolved_hotwords = None

    return resolved_prompt, resolved_hotwords


def transcribe(
    input_path: str,
    model_size: str = "small",
    language: str = "es",
    fps: int = 30,
    output_srt: str | None = None,
    initial_prompt: str | None = None,
    hotwords: str | None = None,
    glossary_terms: list[str] | None = None,
) -> dict:
    """Transcribe audio with word-level timestamps."""
    import inspect

    from faster_whisper import WhisperModel

    print(f"Loading model '{model_size}'...", file=sys.stderr)
    model = WhisperModel(
        model_size,
        device="cpu",
        compute_type="int8",
    )

    print(f"Transcribing '{input_path}'...", file=sys.stderr)
    # No default initial_prompt — see resolve_prompt_and_hotwords() for why
    # (the old Spanish default was reproduced as a hallucinated transcript on
    # real Spanish audio; GPT56-FINDINGS §2.4).
    prompt, resolved_hotwords = resolve_prompt_and_hotwords(
        language=language,
        initial_prompt=initial_prompt,
        hotwords=hotwords,
        glossary_terms=glossary_terms,
    )

    transcribe_kwargs: dict = {}
    if resolved_hotwords is not None:
        # faster-whisper >= 1.0.2 supports `hotwords`; only pass it when the
        # installed version's signature actually accepts it.
        if "hotwords" in inspect.signature(WhisperModel.transcribe).parameters:
            transcribe_kwargs["hotwords"] = resolved_hotwords
        else:
            print(
                "Installed faster-whisper does not support 'hotwords'; "
                "ignoring the requested hotwords/glossary bias.",
                file=sys.stderr,
            )

    segments, info = model.transcribe(
        input_path,
        language=language,
        beam_size=5,
        word_timestamps=True,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
        initial_prompt=prompt,
        # False on purpose: True is the known trigger for repetition loops
        # ("words get stuck") on medium/large models — Armando hit this himself
        # (owner decision 2026-07-06). Cost: slightly less cross-segment context;
        # worth it for loop-free transcripts at every model size.
        condition_on_previous_text=False,
        **transcribe_kwargs,
    )

    # Convert generator to list
    segments = list(segments)

    result_segments = []
    all_words = []

    for seg in segments:
        seg_data = {
            "id": seg.id,
            "start": round(seg.start, 3),
            "end": round(seg.end, 3),
            "text": seg.text.strip(),
        }

        words = []
        if seg.words:
            for w in seg.words:
                word_data = {
                    "text": w.word.strip(),
                    "startSeconds": round(w.start, 4),
                    "endSeconds": round(w.end, 4),
                    "startFrame": round(w.start * fps),
                    "endFrame": round(w.end * fps),
                    "probability": round(w.probability, 4),
                }
                words.append(word_data)
                all_words.append(word_data)

        seg_data["words"] = words
        result_segments.append(seg_data)

    result = {
        "language": info.language,
        "languageProbability": round(info.language_probability, 4),
        "duration": round(info.duration, 3),
        "fps": fps,
        "segmentCount": len(result_segments),
        "wordCount": len(all_words),
        "segments": result_segments,
        "words": all_words,
    }

    # Optionally write SRT
    if output_srt:
        srt_path = Path(output_srt)
        with open(srt_path, "w", encoding="utf-8") as f:
            for i, seg in enumerate(result_segments, 1):
                start = format_timestamp_srt(seg["start"])
                end = format_timestamp_srt(seg["end"])
                f.write(f"{i}\n{start} --> {end}\n{seg['text']}\n\n")
        print(f"SRT written to {srt_path}", file=sys.stderr)

    return result


def main():
    parser = argparse.ArgumentParser(description="faster-whisper transcription")
    parser.add_argument("--input", required=True, help="Audio file path")
    parser.add_argument("--model", default="small", help="Whisper model size")
    parser.add_argument("--language", default="es", help="Language code")
    parser.add_argument("--fps", type=int, default=30, help="Video FPS")
    parser.add_argument("--output-srt", default=None, help="Optional SRT output path")
    parser.add_argument(
        "--initial-prompt",
        default=None,
        help=(
            "Optional whisper initial_prompt passthrough. NO default — the old "
            "generic Spanish prompt was hallucinated as the transcript on real "
            "Spanish audio (GPT56-FINDINGS §2.4). Prefer --hotwords/--glossary-file."
        ),
    )
    parser.add_argument(
        "--hotwords",
        default=None,
        help=(
            "Vocabulary bias (brand names, jargon) via faster-whisper hotwords. "
            "Wins over --glossary-file when both are given."
        ),
    )
    parser.add_argument(
        "--glossary-file",
        default=None,
        help=(
            "Path to a newline/comma-separated term list joined into the "
            "hotwords string (used when --hotwords is not given)."
        ),
    )

    args = parser.parse_args()

    glossary_terms: list[str] | None = None
    if args.glossary_file:
        glossary_path = Path(args.glossary_file)
        if not glossary_path.is_file():
            print(
                f"Glossary file not found: {glossary_path} — "
                "pass an existing newline/comma-separated term list.",
                file=sys.stderr,
            )
            sys.exit(1)
        glossary_terms = parse_glossary_text(
            glossary_path.read_text(encoding="utf-8")
        )

    result = transcribe(
        input_path=args.input,
        model_size=args.model,
        language=args.language,
        fps=args.fps,
        output_srt=args.output_srt,
        initial_prompt=args.initial_prompt,
        hotwords=args.hotwords,
        glossary_terms=glossary_terms,
    )

    json.dump(result, sys.stdout, ensure_ascii=False)
    print()


if __name__ == "__main__":
    main()
