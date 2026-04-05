"""
Edge-TTS wrapper — generates audio + word-level timestamps for Remotion.
Usage: python src/tts/generate.py --text "Your text" --voice "es-MX-JorgeNeural" --output-dir ./output
Outputs: audio.mp3 + word_timings.json
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

import edge_tts


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

    communicate = edge_tts.Communicate(
        text,
        voice=voice,
        rate=rate,
        pitch=pitch,
    )

    sentences: list[dict] = []
    audio_chunks: list[bytes] = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
        elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
            offset_sec = chunk["offset"] / 10_000_000
            duration_sec = chunk["duration"] / 10_000_000
            sentences.append({
                "type": chunk["type"],
                "text": chunk["text"],
                "startSeconds": round(offset_sec, 4),
                "endSeconds": round(offset_sec + duration_sec, 4),
            })

    # Generate approximate word-level timings from sentence boundaries
    # by evenly distributing words within each sentence's time window
    words: list[dict] = []
    for sent in sentences:
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
    gen.add_argument("--rate", default="+0%", help="Speech rate (e.g. +20%%)")
    gen.add_argument("--pitch", default="+0Hz", help="Pitch adjustment")
    gen.add_argument("--output-dir", default="./output", help="Output directory")
    gen.add_argument("--fps", type=int, default=30, help="Video FPS for frame calc")

    # List voices command
    subparsers.add_parser("voices", help="List Spanish voices")

    args = parser.parse_args()

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
