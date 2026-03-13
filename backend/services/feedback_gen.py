"""
Feedback Report Generation Service using Groq Llama3.
Evaluates all Q&A pairs from an interview session and produces
detailed per-question feedback and overall scores.
"""
import re
import json
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        from groq import Groq
        from config import get_settings
        settings = get_settings()
        if not settings.has_groq:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Please add your key from https://console.groq.com/keys to backend/.env"
            )
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def _extract_json_object(text: str) -> Optional[dict]:
    """Robustly extract a JSON object from LLM response text."""
    text = text.strip()
    # Try direct parse first
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    # Use regex to find first JSON object in the text
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None


def evaluate_answer(
    question_text: str,
    question_type: str,
    candidate_answer: str,
) -> Dict[str, Any]:
    """
    Evaluate a single answer. Returns score, ideal_answer, and tips.
    """
    from config import get_settings
    settings = get_settings()

    if not candidate_answer or len(candidate_answer.strip()) < 10:
        return {
            "score": 0,
            "ideal_answer": "No answer provided.",
            "tips": ["Make sure to speak your answer clearly when the microphone is active."],
            "feedback": "No answer was recorded for this question.",
        }

    prompt = f"""You are an expert interview coach evaluating a candidate answer.

Question Type: {question_type}
Question: {question_text}
Candidate's Answer: {candidate_answer}

Evaluate the answer based on:
- Technical accuracy and depth
- Communication clarity
- Relevance to the question
- Structure (e.g., STAR method for behavioral)

IMPORTANT: Respond with ONLY a raw JSON object. No markdown, no explanation, just the JSON.
{{
  "score": <integer 0-100>,
  "ideal_answer": "<concise model answer in 3-5 sentences showing depth>",
  "tips": ["<specific improvement tip 1>", "<specific improvement tip 2>"],
  "feedback": "<1-2 sentence summary of what was good and what needs work>"
}}"""

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=700,
        )
        content = response.choices[0].message.content
        logger.debug(f"[FeedbackGen] Evaluate raw: {content[:300]}")

        result = _extract_json_object(content)
        if result:
            return result

        logger.warning("[FeedbackGen] Could not parse evaluation JSON. Using fallback.")
        return {
            "score": 50,
            "ideal_answer": "Unable to generate ideal answer at this time.",
            "tips": ["Practice structuring answers with the STAR method."],
            "feedback": "Answer evaluation failed — please try again."
        }

    except RuntimeError:
        raise
    except Exception as e:
        logger.error(f"[FeedbackGen] Answer evaluation error: {e}")
        return {
            "score": 50,
            "ideal_answer": "Unable to generate ideal answer at this time.",
            "tips": ["Practice structuring answers with the STAR method."],
            "feedback": "Answer evaluation failed — please try again."
        }


def generate_overall_feedback(
    qa_pairs: List[Dict[str, Any]],
    skills: List[str],
) -> Dict[str, Any]:
    """
    Given all evaluated Q&A pairs, generate overall session metrics and advice.
    Returns: overall_score, metrics dict (confidence/clarity/relevance/pacing),
             strengths, improvements, advice.
    """
    from config import get_settings
    settings = get_settings()

    qa_summary = "\n".join([
        f"Q{i+1} [{p.get('type','General')}] Score:{p.get('score',50)}/100 — {p.get('question','')[:120]}"
        for i, p in enumerate(qa_pairs)
    ])

    avg_score = sum(p.get("score", 50) for p in qa_pairs) / max(len(qa_pairs), 1)

    prompt = f"""You are an expert interview coach providing a holistic assessment of a mock interview session.

Candidate Skills: {', '.join(skills[:10]) if skills else 'general'}
Average Raw Score: {avg_score:.0f}/100

Q&A Summary:
{qa_summary}

Based on this, assess the candidate's overall performance across communication, technical skills, and behavioral competencies.

IMPORTANT: Respond with ONLY a raw JSON object. No markdown, no explanation.
{{
  "overall_score": <integer 0-100, weighted assessment>,
  "confidence_score": <integer 0-100>,
  "clarity_score": <integer 0-100>,
  "relevance_score": <integer 0-100>,
  "pacing_score": <integer 0-100>,
  "strengths": ["<key strength 1>", "<key strength 2>", "<key strength 3>"],
  "improvements": ["<area to improve 1>", "<area to improve 2>", "<area to improve 3>"],
  "advice": ["<actionable advice 1>", "<actionable advice 2>", "<actionable advice 3>"],
  "summary_message": "<2-3 sentence motivational summary of the candidate's overall performance>"
}}"""

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=900,
        )
        content = response.choices[0].message.content
        logger.debug(f"[FeedbackGen] Overall raw: {content[:300]}")

        result = _extract_json_object(content)
        if result:
            return result

        logger.warning("[FeedbackGen] Could not parse overall feedback JSON. Using computed fallback.")

    except RuntimeError:
        raise
    except Exception as e:
        logger.error(f"[FeedbackGen] Overall feedback error: {e}")

    # Computed fallback
    return {
        "overall_score": round(avg_score),
        "confidence_score": min(round(avg_score * 1.1), 100),
        "clarity_score": round(avg_score),
        "relevance_score": round(avg_score),
        "pacing_score": 72,
        "strengths": ["Engaged with all questions", "Showed effort in responses"],
        "improvements": ["Continue practicing with more sessions", "Focus on structuring answers clearly"],
        "advice": ["Review your answers and study the ideal responses", "Practice the STAR method for behavioral questions"],
        "summary_message": "Good effort! Keep practicing to improve your interview performance. Review the ideal answers to strengthen your responses."
    }
