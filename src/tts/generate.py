"""
Edge-TTS wrapper — generates audio + word-level timestamps for Remotion.
Usage: python src/tts/generate.py generate --text "Your text" --voice "es-MX-JorgeNeural" --output-dir ./output
Outputs: audio.mp3 + word_timings.json

Word timing granularity
-----------------------
Edge-TTS is asked for real per-word timestamps via ``boundary="WordBoundary"``.
The installed edge-tts (7.x) emits one ``WordBoundary`` metadata event per word
with an accurate offset + duration, so in the common case captions are
frame-accurate even in ``--no-whisper`` mode. If a particular voice/response
does NOT emit any word boundaries (older/edge cases only emit
``SentenceBoundary``), we fall back to spreading each sentence's words evenly
across that sentence's time window — this is approximate and can drift within a
sentence. Each emitted word records how it was timed via the ``"timingSource"``
field ("word-boundary" | "sentence-even").
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

import edge_tts

# CLI options whose values may legitimately start with a sign ("-" or "+") and
# would otherwise be mistaken for a flag by argparse in the space-separated form
# (e.g. ``--rate -10%``). See ``normalize_signed_args``.
_SIGNED_VALUE_FLAGS = ("--rate", "--pitch")


def normalize_signed_args(argv: list[str]) -> list[str]:
    """Fold ``--rate -10%`` into the unambiguous ``--rate=-10%`` form.

    Negative TTS values (``--rate -10%``, ``--pitch -5Hz``) are parsed as
    separate tokens by the TS pipeline caller. On Python < 3.13, argparse treats
    a following token that starts with ``-`` as an option flag and rejects the
    value with "expected one argument". Rewriting to the ``=``-form makes it
    unambiguous on every supported Python (3.11+). Positive values (``+20%``,
    ``20%``) and the already-joined ``=``-form are left untouched, so this is
    fully backward-compatible.
    """
    normalized: list[str] = []
    i = 0
    while i < len(argv):
        token = argv[i]
        if (
            token in _SIGNED_VALUE_FLAGS
            and i + 1 < len(argv)
            and argv[i + 1].startswith(("-", "+"))
        ):
            normalized.append(f"{token}={argv[i + 1]}")
            i += 2
        else:
            normalized.append(token)
            i += 1
    return normalized


async def generate_tts(
    text: str,
    voice: str = "es-MX-JorgeNeural",
    rate: str = "+0%",
    pitch: str = "+0Hz",
    output_dir: str = "./output",
    fps: int = 30,
) -> dict:
    """Generate TTS audio with word-level timestamps."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    audio_path = output_path / "audio.mp3"
    timings_path = output_path / "word_timings.json"

    # Request REAL per-word boundaries. edge-tts 7.x emits one WordBoundary
    # metadata event per spoken word; this replaces the previous synthetic
    # even-distribution timings for voices that support it.
    communicate = edge_tts.Communicate(
        text,
        voice=voice,
        rate=rate,
        pitch=pitch,
        boundary="WordBoundary",
    )

    word_events: list[dict] = []
    sentence_events: list[dict] = []
    audio_chunks: list[bytes] = []

    async for chunk in communicate.stream():
        chunk_type = chunk["type"]
        if chunk_type == "audio":
            audio_chunks.append(chunk["data"])
        elif chunk_type in ("WordBoundary", "SentenceBoundary"):
            offset_sec = chunk["offset"] / 10_000_000
            duration_sec = chunk["duration"] / 10_000_000
            event = {
                "text": chunk["text"],
                "startSeconds": round(offset_sec, 4),
                "endSeconds": round(offset_sec + duration_sec, 4),
            }
            if chunk_type == "WordBoundary":
                word_events.append(event)
            else:
                sentence_events.append(event)

    words: list[dict]
    timing_source: str
    if word_events:
        # Preferred path: real per-word timestamps straight from edge-tts.
        timing_source = "word-boundary"
        words = [
            {
                "text": ev["text"],
                "startFrame": round(ev["startSeconds"] * fps),
                "endFrame": round(ev["endSeconds"] * fps),
                "startSeconds": ev["startSeconds"],
                "endSeconds": ev["endSeconds"],
                "timingSource": timing_source,
            }
            for ev in word_events
        ]
    else:
        # Fallback: no word boundaries were emitted (voice only produced sentence
        # boundaries). Approximate by evenly distributing each sentence's words
        # across its time window. This can drift within a sentence.
        timing_source = "sentence-even"
        words = []
        for sent in sentence_events:
            sent_words = sent["text"].split()
            if not sent_words:
                continue
            total_duration = sent["endSeconds"] - sent["startSeconds"]
            per_word = total_duration / len(sent_words)
            for i, word_text in enumerate(sent_words):
                w_start = sent["startSeconds"] + i * per_word
                w_end = w_start + per_word
                words.append({
                    "text": word_text,
                    "startFrame": round(w_start * fps),
                    "endFrame": round(w_end * fps),
                    "startSeconds": round(w_start, 4),
                    "endSeconds": round(w_end, 4),
                    "timingSource": timing_source,
                })

    # Write audio
    with open(audio_path, "wb") as f:
        for c in audio_chunks:
            f.write(c)

    # Write timings
    result = {
        "voice": voice,
        "text": text,
        "fps": fps,
        "timingSource": timing_source,
        "wordCount": len(words),
        "words": words,
        "audioFile": str(audio_path),
    }

    with open(timings_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return result


async def list_spanish_voices() -> list[dict]:
    """List all available Spanish voices."""
    voices = await edge_tts.VoicesManager.create()
    spanish = voices.find(Language="es")
    return [
        {
            "name": v["ShortName"],
            "gender": v["Gender"],
            "locale": v["Locale"],
        }
        for v in spanish
    ]


def main():
    parser = argparse.ArgumentParser(description="Edge-TTS audio generation")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Generate command
    gen = subparsers.add_parser("generate", help="Generate TTS audio")
    gen.add_argument("--text", required=True, help="Text to synthesize")
    gen.add_argument("--voice", default="es-MX-JorgeNeural", help="Voice name")
    gen.add_argument(
        "--rate",
        default="+0%",
        help="Speech rate, e.g. +20%% (faster) or -10%% (slower). "
        "Negative values work in both '--rate -10%%' and '--rate=-10%%' forms.",
    )
    gen.add_argument(
        "--pitch",
        default="+0Hz",
        help="Pitch adjustment, e.g. +5Hz or -5Hz. "
        "Negative values work in both '--pitch -5Hz' and '--pitch=-5Hz' forms.",
    )
    gen.add_argument("--output-dir", default="./output", help="Output directory")
    gen.add_argument("--fps", type=int, default=30, help="Video FPS for frame calc")

    # List voices command
    subparsers.add_parser("voices", help="List Spanish voices")

    # Fold "--rate -10%" into "--rate=-10%" so signed values are never mistaken
    # for flags (argparse < 3.13 rejects the space-separated form otherwise).
    args = parser.parse_args(normalize_signed_args(sys.argv[1:]))

    if args.command == "generate":
        result = asyncio.run(generate_tts(
            text=args.text,
            voice=args.voice,
            rate=args.rate,
            pitch=args.pitch,
            output_dir=args.output_dir,
            fps=args.fps,
        ))
        # Output JSON to stdout for pipeline consumption
        json.dump(result, sys.stdout, ensure_ascii=False)
        print()  # newline

    elif args.command == "voices":
        voices = asyncio.run(list_spanish_voices())
        json.dump(voices, sys.stdout, ensure_ascii=False, indent=2)
        print()


if __name__ == "__main__":
    main()
