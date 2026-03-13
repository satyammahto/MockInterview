"""
Confidence Analyzer Service.
Analyzes transcript text to detect filler words, speaking pace,
pauses, and computes a confidence score. No external API needed.
"""
import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Filler words/phrases to detect (ordered by priority)
FILLER_PATTERNS = [
    "you know", "kind of", "sort of", "i mean", "you see",
    "um", "uh", "like", "basically", "literally",
    "actually", "so", "right", "okay", "well",
    "hmm", "er", "ah",
]


def analyze_confidence(
    transcript: str,
    duration_seconds: int = 0,
) -> Dict[str, Any]:
    """
    Analyze a transcript for confidence indicators.

    Args:
        transcript: The candidate's spoken answer text.
        duration_seconds: How long the answer took in seconds.

    Returns:
        dict with confidence_score, filler_words, pace_wpm, issues, etc.
    """
    if not transcript or len(transcript.strip()) < 5:
        return {
            "confidence_score": 0,
            "filler_words": [],
            "filler_word_count": 0,
            "word_count": 0,
            "pace_wpm": 0.0,
            "pause_count": 0,
            "issues": ["No answer was provided."],
        }

    text = transcript.strip().lower()
    words = text.split()
    word_count = len(words)

    # ── 1. Detect filler words ────────────────────────────────────────────────
    filler_counts: Dict[str, int] = {}
    for filler in FILLER_PATTERNS:
        # Use word boundary regex for single words, simple count for phrases
        if " " in filler:
            count = text.count(filler)
        else:
            count = len(re.findall(rf'\b{re.escape(filler)}\b', text))
        if count > 0:
            filler_counts[filler] = count

    filler_words_list = [
        {"word": w, "count": c}
        for w, c in sorted(filler_counts.items(), key=lambda x: -x[1])
    ]
    total_filler_count = sum(c for c in filler_counts.values())

    # ── 2. Speaking pace (WPM) ────────────────────────────────────────────────
    if duration_seconds and duration_seconds > 0:
        pace_wpm = round((word_count / duration_seconds) * 60, 1)
    else:
        # Estimate ~150 WPM if duration unknown
        pace_wpm = 0.0

    # ── 3. Pause detection (ellipses, long gaps) ──────────────────────────────
    pause_count = text.count("...") + text.count("…") + len(re.findall(r'—\s*—', text))

    # ── 4. Confidence score calculation ───────────────────────────────────────
    score = 100.0

    # Penalize filler words (each filler word costs 2-3 points)
    filler_ratio = total_filler_count / max(word_count, 1)
    if filler_ratio > 0.08:
        score -= 25  # Very heavy filler use
    elif filler_ratio > 0.05:
        score -= 15
    elif filler_ratio > 0.02:
        score -= 8
    elif total_filler_count > 0:
        score -= 3

    # Penalize very short answers
    if word_count < 20:
        score -= 20
    elif word_count < 50:
        score -= 10

    # Penalize too many pauses
    if pause_count > 5:
        score -= 15
    elif pause_count > 2:
        score -= 8

    # Reward specific examples (numbers, percentages, proper nouns)
    specifics = len(re.findall(r'\b\d+%?\b', transcript))
    if specifics >= 3:
        score += 10
    elif specifics >= 1:
        score += 5

    # Penalize pace extremes
    if pace_wpm > 0:
        if pace_wpm > 200:
            score -= 10  # Speaking too fast
        elif pace_wpm < 80:
            score -= 10  # Speaking too slow

    score = max(0, min(100, round(score)))

    # ── 5. Build issues list ──────────────────────────────────────────────────
    issues: List[str] = []
    if filler_ratio > 0.05:
        issues.append("Too many filler words — practice pausing instead of saying 'um' or 'like'.")
    if word_count < 30:
        issues.append("Answer is too short — provide more detail and examples.")
    if pace_wpm > 180:
        issues.append("Speaking too fast — slow down for clarity.")
    elif 0 < pace_wpm < 90:
        issues.append("Slow speaking pace — try to be more concise and direct.")
    if pause_count > 3:
        issues.append("Frequent pauses detected — practice your answers to improve fluency.")

    return {
        "confidence_score": score,
        "filler_words": filler_words_list,
        "filler_word_count": total_filler_count,
        "word_count": word_count,
        "pace_wpm": pace_wpm,
        "pause_count": pause_count,
        "issues": issues,
    }


def aggregate_confidence(analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Aggregate confidence analyses from multiple answers into session-level metrics.
    """
    if not analyses:
        return {
            "avg_confidence_score": 0,
            "total_filler_count": 0,
            "avg_pace_wpm": 0.0,
            "top_filler_words": [],
            "all_issues": [],
        }

    scores = [a["confidence_score"] for a in analyses]
    total_fillers = sum(a["filler_word_count"] for a in analyses)
    paces = [a["pace_wpm"] for a in analyses if a["pace_wpm"] > 0]

    # Merge all filler word counts
    merged_fillers: Dict[str, int] = {}
    for a in analyses:
        for fw in a["filler_words"]:
            merged_fillers[fw["word"]] = merged_fillers.get(fw["word"], 0) + fw["count"]

    top_fillers = [
        {"word": w, "count": c}
        for w, c in sorted(merged_fillers.items(), key=lambda x: -x[1])[:5]
    ]

    all_issues = list({issue for a in analyses for issue in a.get("issues", [])})

    return {
        "avg_confidence_score": round(sum(scores) / len(scores)),
        "total_filler_count": total_fillers,
        "avg_pace_wpm": round(sum(paces) / len(paces), 1) if paces else 0.0,
        "top_filler_words": top_fillers,
        "all_issues": all_issues,
    }
