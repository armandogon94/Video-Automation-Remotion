"""Unit tests for the pure prompt/hotwords resolution in transcribe.py.

These deliberately avoid loading any whisper model (faster_whisper is only
imported inside transcribe.transcribe(), never at module import time), so the
suite runs in milliseconds.

Context: GPT56-FINDINGS §2.4 — the old default initial_prompt
"Transcripción en español con puntuación correcta." was reproduced verbatim
as the hallucinated transcript of real Spanish audio, so there must be NO
default prompt for any language.
"""

import importlib.util
import sys
from pathlib import Path

MODULE_PATH = (
    Path(__file__).resolve().parents[2] / "src" / "transcribe" / "transcribe.py"
)

_spec = importlib.util.spec_from_file_location("transcribe_module", MODULE_PATH)
assert _spec is not None and _spec.loader is not None
transcribe_module = importlib.util.module_from_spec(_spec)
sys.modules["transcribe_module"] = transcribe_module
_spec.loader.exec_module(transcribe_module)

resolve_prompt_and_hotwords = transcribe_module.resolve_prompt_and_hotwords
parse_glossary_text = transcribe_module.parse_glossary_text


class TestNoDefaultPrompt:
    def test_no_default_prompt_for_spanish(self):
        prompt, hotwords = resolve_prompt_and_hotwords(
            language="es", initial_prompt=None, hotwords=None, glossary_terms=None
        )
        assert prompt is None
        assert hotwords is None

    def test_no_default_prompt_for_spanish_regional(self):
        prompt, _ = resolve_prompt_and_hotwords(
            language="es-MX", initial_prompt=None, hotwords=None, glossary_terms=None
        )
        assert prompt is None

    def test_no_default_prompt_for_english(self):
        prompt, hotwords = resolve_prompt_and_hotwords(
            language="en", initial_prompt=None, hotwords=None, glossary_terms=None
        )
        assert prompt is None
        assert hotwords is None

    def test_empty_string_prompt_normalizes_to_none(self):
        prompt, _ = resolve_prompt_and_hotwords(
            language="es", initial_prompt="", hotwords=None, glossary_terms=None
        )
        assert prompt is None


class TestExplicitPrompt:
    def test_explicit_initial_prompt_passes_through(self):
        prompt, hotwords = resolve_prompt_and_hotwords(
            language="es",
            initial_prompt="Video sobre Claude Cowork y Anthropic.",
            hotwords=None,
            glossary_terms=None,
        )
        assert prompt == "Video sobre Claude Cowork y Anthropic."
        assert hotwords is None


class TestHotwordsResolution:
    def test_glossary_terms_join_into_hotwords(self):
        prompt, hotwords = resolve_prompt_and_hotwords(
            language="es",
            initial_prompt=None,
            hotwords=None,
            glossary_terms=["Claude Cowork", "Anthropic", "Remotion"],
        )
        assert prompt is None
        assert hotwords == "Claude Cowork, Anthropic, Remotion"

    def test_explicit_hotwords_wins_over_glossary(self):
        _, hotwords = resolve_prompt_and_hotwords(
            language="es",
            initial_prompt=None,
            hotwords="Armando Inteligencia",
            glossary_terms=["Claude Cowork", "Anthropic"],
        )
        assert hotwords == "Armando Inteligencia"

    def test_blank_glossary_terms_are_dropped(self):
        _, hotwords = resolve_prompt_and_hotwords(
            language="es",
            initial_prompt=None,
            hotwords=None,
            glossary_terms=["  Claude Cowork  ", "", "   "],
        )
        assert hotwords == "Claude Cowork"

    def test_all_blank_glossary_resolves_to_none(self):
        _, hotwords = resolve_prompt_and_hotwords(
            language="es",
            initial_prompt=None,
            hotwords=None,
            glossary_terms=["", "   "],
        )
        assert hotwords is None


class TestParseGlossaryText:
    def test_newline_separated(self):
        assert parse_glossary_text("Claude Cowork\nAnthropic\nRemotion") == [
            "Claude Cowork",
            "Anthropic",
            "Remotion",
        ]

    def test_comma_separated(self):
        assert parse_glossary_text("Claude Cowork, Anthropic, Remotion") == [
            "Claude Cowork",
            "Anthropic",
            "Remotion",
        ]

    def test_mixed_separators_and_blanks(self):
        text = "Claude Cowork, Anthropic\n\n  Remotion  ,\n"
        assert parse_glossary_text(text) == ["Claude Cowork", "Anthropic", "Remotion"]

    def test_empty_text(self):
        assert parse_glossary_text("") == []
