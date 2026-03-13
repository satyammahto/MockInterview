"""
Feedback Report Generation Service using Groq Llama3.
Evaluates all Q&A pairs from an interview session and produces
detailed per-question feedback, STAR analysis, and overall scores.
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
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

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
    Evaluate a single answer. Returns score, ideal_answer, tips, feedback,
    and STAR analysis for behavioral questions.
    """
    from config import get_settings
    settings = get_settings()

    if not candidate_answer or len(candidate_answer.strip()) < 10:
        return {
            "score": 0,
            "ideal_answer": "No answer provided.",
            "tips": ["Make sure to speak your answer clearly when the microphone is active."],
            "feedback": "No answer was recorded for this question.",
            "star_analysis": {
                "situation": False, "task": False, "action": False, "result": False,
                "star_score": 0, "missing_components": ["situation", "task", "action", "result"],
            },
        }

    # Include STAR evaluation in the prompt for ALL question types
    prompt = f"""You are an expert interview coach evaluating a candidate answer.

Question Type: {question_type}
Question: {question_text}
Candidate's Answer: {candidate_answer}

Evaluate the answer based on:
- Technical accuracy and depth
- Communication clarity
- Relevance to the question
- Structure (STAR method: Situation, Task, Action, Result)

Also analyze whether the answer follows the STAR format:
- Situation: Did the candidate describe a specific context or scenario?
- Task: Did the candidate explain the challenge or responsibility?
- Action: Did the candidate describe what they specifically did?
- Result: Did the candidate mention the outcome with measurable impact?

IMPORTANT: Respond with ONLY a raw JSON object. No markdown, no explanation, just the JSON.
{{
  "score": <integer 0-100>,
  "ideal_answer": "<concise model answer in 3-5 sentences showing depth>",
  "tips": ["<specific improvement tip 1>", "<specific improvement tip 2>"],
  "feedback": "<1-2 sentence summary of what was good and what needs work>",
  "star_analysis": {{
    "situation": <true/false>,
    "task": <true/false>,
    "action": <true/false>,
    "result": <true/false>,
    "star_score": <integer 0-100>,
    "missing_components": ["<list of missing STAR components>"]
  }}
}}"""

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=900,
        )
        content = response.choices[0].message.content
        logger.debug(f"[FeedbackGen] Evaluate raw: {content[:300]}")

        result = _extract_json_object(content)
        if result:
            # Ensure star_analysis exists
            if "star_analysis" not in result:
                result["star_analysis"] = _default_star_analysis()
            return result

        logger.warning("[FeedbackGen] Could not parse evaluation JSON. Using fallback.")
        return _fallback_evaluation()

    except RuntimeError:
        raise
    except Exception as e:
        logger.error(f"[FeedbackGen] Answer evaluation error: {e}")
        return _fallback_evaluation()


def _default_star_analysis() -> Dict[str, Any]:
    return {
        "situation": False, "task": False, "action": False, "result": False,
        "star_score": 0, "missing_components": ["situation", "task", "action", "result"],
    }


def _fallback_evaluation() -> Dict[str, Any]:
    return {
        "score": 50,
        "ideal_answer": "Unable to generate ideal answer at this time.",
        "tips": ["Practice structuring answers with the STAR method."],
        "feedback": "Answer evaluation failed — please try again.",
        "star_analysis": _default_star_analysis(),
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
  "prep_tips": ["<personalized interview prep tip 1>", "<personalized interview prep tip 2>"],
  "learning_resources": [
    {"title": "<resource title>", "url": "<resource url>"},
    {"title": "<resource title>", "url": "<resource url>"}
  ],
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
        "prep_tips": ["Standardize your technical explanations", "Focus on impact-driven results"],
        "learning_resources": [{"title": "Cracking the Coding Interview", "url": "https://www.careercup.com/book"}],
        "summary_message": "Good effort! Keep practicing to improve your interview performance. Review the ideal answers to strengthen your responses."
    }
