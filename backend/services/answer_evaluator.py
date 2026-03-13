import logging
import json
from typing import Dict, Any, Optional
from services.confidence_analyzer import analyze_confidence
from services.feedback_gen import _extract_json_object, _get_client
from config import get_settings

logger = logging.getLogger(__name__)

def evaluate_answer_v2(
    question: str,
    user_answer: str,
    interview_mode: str = "mixed",
    role: str = "Software Engineer",
    duration_seconds: int = 0
) -> Dict[str, Any]:
    """
    Evaluates a candidate's answer using a combination of local heuristics 
    (confidence analyzer) and LLM-powered qualitative analysis.
    """
    settings = get_settings()
    
    # 1. Local Confidence Analysis (Filler words, pace, etc.)
    local_metrics = analyze_confidence(user_answer, duration_seconds)
    
    # 2. Qualitative AI Analysis
    prompt = f"""You are an expert interview evaluator. Evaluate the following interview answer.

Target Role: {role}
Interview Mode: {interview_mode}
Question: {question}
Candidate Answer: {user_answer}

Analyze the answer for:
1. Communication Clarity and Grammar.
2. STAR Method Structure (Situation, Task, Action, Result).
3. Technical Knowledge / Accuracy (relative to a {role} role).
4. Qualitative Confidence (fluency and tone).

Respond with ONLY a JSON object in this format:
{{
  "communication_score": <0-10>,
  "grammar_score": <0-10>,
  "technical_score": <0-10>,
  "star_structure_score": <0-10>,
  "overall_score": <0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvement_suggestions": ["<suggestion 1>", "<suggestion 2>"],
  "star_details": {{
      "situation": <true/false>,
      "task": <true/false>,
      "action": <true/false>,
      "result": <true/false>
  }}
}}
"""

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1000,
        )
        content = response.choices[0].message.content
        ai_result = _extract_json_object(content)
        
        if not ai_result:
            logger.error("[AnswerEvaluator] Failed to parse AI response.")
            return _fallback_evaluation(local_metrics.get("confidence_score", 50))

        # Merge local confidence metrics into the final response
        # We use the higher-precision local score but weighted by AI perspective
        ai_result["confidence_score"] = round((local_metrics["confidence_score"] / 10 + ai_result.get("communication_score", 5)) / 2, 1)
        
        # Add local details for the frontend
        ai_result["local_confidence"] = local_metrics
        
        return ai_result

    except Exception as e:
        logger.error(f"[AnswerEvaluator] Evaluation error: {e}")
        return _fallback_evaluation(local_metrics.get("confidence_score", 50))

def _fallback_evaluation(local_confidence: float) -> Dict[str, Any]:
    return {
        "communication_score": 5,
        "grammar_score": 5,
        "confidence_score": round(local_confidence / 10, 1),
        "technical_score": 5,
        "star_structure_score": 5,
        "overall_score": 50,
        "strengths": ["Answer was recorded."],
        "weaknesses": ["AI evaluation failed partially."],
        "improvement_suggestions": ["Try providing more detailed examples."],
        "star_details": {"situation": False, "task": False, "action": False, "result": False}
    }
