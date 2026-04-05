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


def transcribe(
    input_path: str,
    model_size: str = "small",
    language: str = "es",
    fps: int = 30,
    output_srt: str | None = None,
) -> dict:
    """Transcribe audio with word-level timestamps."""
    from faster_whisper import WhisperModel

    print(f"Loading model '{model_size}'...", file=sys.stderr)
    model = WhisperModel(
        model_size,
        device="cpu",
        compute_type="int8",
    )

    print(f"Transcribing '{input_path}'...", file=sys.stderr)
    segments, info = model.transcribe(
        input_path,
        language=language,
        beam_size=5,
        word_timestamps=True,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
        initial_prompt="Transcripción en español con puntuación correcta.",
        condition_on_previous_text=True,
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

    args = parser.parse_args()

    result = transcribe(
        input_path=args.input,
        model_size=args.model,
        language=args.language,
        fps=args.fps,
        output_srt=args.output_srt,
    )

    json.dump(result, sys.stdout, ensure_ascii=False)
    print()


if __name__ == "__main__":
    main()
