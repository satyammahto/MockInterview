"""
Voice Analysis Service — runs entirely locally, no external API needed.
Analyses a transcript for filler words, speaking pace, and a confidence score.
"""
import re
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

# Filler words to detect (lower-cased for matching)
_FILLER_WORDS = [
    "um", "uh", "like", "you know", "basically", "literally",
    "actually", "so", "right", "okay", "well", "kind of",
    "sort of", "i mean", "hmm", "er", "ah",
]

# Build a regex pattern that matches whole words/phrases from longest to shortest
# so "you know" is matched before "you"
_sorted_fillers = sorted(_FILLER_WORDS, key=len, reverse=True)
_FILLER_PATTERN = re.compile(
    r'\b(' + '|'.join(re.escape(f) for f in _sorted_fillers) + r')\b',
    re.IGNORECASE,
)


def analyze_voice(transcript: str, duration_seconds: float) -> Dict[str, Any]:
    """
    Analyse a candidate's spoken answer given its transcript and recording duration.

    Args:
        transcript:       The full transcribed text of the candidate's answer.
        duration_seconds: How long the candidate spoke (in seconds).

    Returns a dict with:
        fillerWords       — list of {word, count} objects for every filler found
        totalFillerCount  — sum of all filler occurrences
        wordCount         — total words spoken
        speakingPace      — WPM (words per minute)
        pauseCount        — estimated pause count (rough heuristic)
        confidenceScore   — 0-100 (penalises filler density)
    """
    if not transcript or not transcript.strip():
        return _empty_result()

    text = transcript.strip()

    # ── Word count ──────────────────────────────────────────────────────────────
    words = text.split()
    word_count = len(words)

    # ── Speaking pace (WPM) ─────────────────────────────────────────────────────
    duration_minutes = max(duration_seconds / 60.0, 0.01)
    speaking_pace = round(word_count / duration_minutes)

    # ── Filler word detection ───────────────────────────────────────────────────
    filler_map: Dict[str, int] = {}
    for match in _FILLER_PATTERN.finditer(text):
        word = match.group(0).lower()
        filler_map[word] = filler_map.get(word, 0) + 1

    filler_words = [{"word": w, "count": c} for w, c in sorted(filler_map.items(), key=lambda x: -x[1])]
    total_filler_count = sum(c for c in filler_map.values())

    # ── Pause count heuristic ───────────────────────────────────────────────────
    # Count sentence endings — each is a potential pause point
    sentence_ends = len(re.findall(r'[.!?…]+', text))
    # Also count long pauses implied by ellipses or multiple spaces
    long_pauses = len(re.findall(r'\.{2,}|\s{3,}', text))
    pause_count = max(sentence_ends + long_pauses, 0)

    # ── Confidence score ──────────────────────────────────────────────────────
    # Start at 100; deduct for high filler density, too slow or too fast pace
    score = 100

    # Filler penalty: each filler beyond 2 per 100 words costs 3 pts (max -30)
    filler_per_100 = (total_filler_count / max(word_count, 1)) * 100
    filler_penalty = min(int(max(filler_per_100 - 2, 0) * 3), 30)
    score -= filler_penalty

    # Pace penalty: ideal 110–160 WPM
    if speaking_pace < 80:
        score -= 10   # too slow
    elif speaking_pace > 200:
        score -= 10   # too fast
    elif speaking_pace < 100 or speaking_pace > 180:
        score -= 5    # slightly off

    # Word count penalty: very short answers < 20 words
    if word_count < 20:
        score -= 15
    elif word_count < 40:
        score -= 5

    confidence_score = max(0, min(100, score))

    logger.info(
        f"[VoiceAnalysis] words={word_count}, pace={speaking_pace}wpm, "
        f"fillers={total_filler_count}, confidence={confidence_score}"
    )

    return {
        "fillerWords": filler_words,
        "totalFillerCount": total_filler_count,
        "wordCount": word_count,
        "speakingPace": speaking_pace,
        "pauseCount": pause_count,
        "confidenceScore": confidence_score,
    }


def _empty_result() -> Dict[str, Any]:
    return {
        "fillerWords": [],
        "totalFillerCount": 0,
        "wordCount": 0,
        "speakingPace": 0,
        "pauseCount": 0,
        "confidenceScore": 0,
    }
