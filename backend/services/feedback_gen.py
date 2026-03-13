"""
Feedback Report Generation Service using Groq Llama3.
Evaluates all Q&A pairs from an interview session and produces
detailed per-question feedback and overall scores.
"""
import json
from typing import List, Dict, Any
from groq import Groq
from config import get_settings

settings = get_settings()
_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def evaluate_answer(
    question_text: str,
    question_type: str,
    candidate_answer: str,
) -> Dict[str, Any]:
    """
    Evaluate a single answer. Returns score, ideal_answer, and tips.
    """
    if not candidate_answer or len(candidate_answer.strip()) < 10:
        return {
            "score": 0,
            "ideal_answer": "No answer provided.",
            "tips": ["Make sure to speak your answer clearly when the microphone is active."]
        }

    prompt = f"""You are an expert interview coach. Evaluate this candidate answer.

Question Type: {question_type}
Question: {question_text}
Candidate's Answer: {candidate_answer}

Provide your evaluation as a JSON object ONLY (no markdown, no explanation):
{{
  "score": <integer 0-100>,
  "ideal_answer": "<concise model answer in 2-4 sentences>",
  "tips": ["<specific improvement tip 1>", "<specific improvement tip 2>"]
}}"""

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=600,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        return json.loads(content)

    except Exception as e:
        print(f"[FeedbackGen] Answer evaluation error: {e}")
        return {
            "score": 50,
            "ideal_answer": "Unable to generate ideal answer at this time.",
            "tips": ["Practice structuring answers with the STAR method."]
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
    qa_summary = "\n".join([
        f"Q{i+1} [{p['type']}]: {p['question']} | Score: {p['score']}/100 | Answer: {p['answer'][:200]}"
        for i, p in enumerate(qa_pairs)
    ])

    prompt = f"""You are an expert interview coach. Based on these Q&A results, provide an overall assessment.

Candidate Skills: {', '.join(skills[:10]) if skills else 'general'}

Q&A Summary:
{qa_summary}

Respond ONLY with a valid JSON object (no markdown):
{{
  "overall_score": <integer 0-100>,
  "confidence_score": <integer 0-100>,
  "clarity_score": <integer 0-100>,
  "relevance_score": <integer 0-100>,
  "pacing_score": <integer 0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area to improve 1>", "<area to improve 2>"],
  "advice": ["<actionable advice 1>", "<actionable advice 2>"],
  "summary_message": "<2-3 sentence motivational summary of the candidate's performance>"
}}"""

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=800,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        return json.loads(content)

    except Exception as e:
        print(f"[FeedbackGen] Overall feedback error: {e}")
        avg_score = sum(p.get("score", 50) for p in qa_pairs) / max(len(qa_pairs), 1)
        return {
            "overall_score": round(avg_score),
            "confidence_score": 70,
            "clarity_score": 70,
            "relevance_score": 70,
            "pacing_score": 70,
            "strengths": ["Engaged with all questions"],
            "improvements": ["Continue practicing with more sessions"],
            "advice": ["Review your answers and study the ideal responses"],
            "summary_message": "Good effort! Keep practicing to improve your interview performance."
        }
