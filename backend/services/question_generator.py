"""
AI Interview Question Generator Service.
Uses Gemini API (primary) with Groq Llama3 as fallback.
All heavy imports are lazy to prevent startup crashes if a library is not installed.
"""
import re
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


def _extract_json(text: str) -> dict | None:
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


def generate_interview_questions(file_bytes: bytes, filename: str, role: str) -> Dict[str, Any]:
    """
    Generate tailored interview questions using Gemini (preferred) or Groq as fallback.
    All AI imports are lazy to prevent startup crashes.
    """
    from config import get_settings
    from services.resume_analyzer import extract_raw_text
    from services.resume_parser import extract_skills

    settings = get_settings()

    # Extract resume context
    resume_text = extract_raw_text(file_bytes, filename)
    skills = extract_skills(file_bytes, filename)
    skills_str = ", ".join(skills[:20]) if skills else "general software engineering"

    prompt = f"""You are an expert technical interviewer. Analyze the following resume for the role of '{role}'.

Role: {role}
Resume Text: {resume_text[:4000]}
Extracted Skills: {skills_str}

Based on the resume and the target role, generate exactly:
- 5 Technical Interview Questions (focused on projects, technical skills, and role-specific knowledge)
- 5 Behavioral Interview Questions (STAR-format, focused on experience and soft skills)

IMPORTANT: Respond ONLY with a raw JSON object. No markdown, no explanation.
{{
  "role": "{role}",
  "technical_questions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ],
  "behavioral_questions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ]
}}"""

    result = None

    # Try Gemini first if configured
    if settings.has_gemini:
        result = _generate_with_gemini(prompt, settings)

    # Fallback to Groq if Gemini didn't work
    if not result and settings.has_groq:
        result = _generate_with_groq(prompt, settings, role)

    if result:
        return {
            "role": role,
            "technical_questions": result.get("technical_questions", [])[:5],
            "behavioral_questions": result.get("behavioral_questions", [])[:5],
        }

    # Final fallback with static questions
    logger.error("[QuestionGenerator] Both Gemini and Groq unavailable. Returning fallback questions.")
    return _fallback_questions(role)


def _generate_with_gemini(prompt: str, settings) -> dict | None:
    """Try generating question with Gemini."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt)
        result = _extract_json(response.text)
        if result:
            logger.info("[QuestionGenerator] Gemini generation successful.")
            return result
        logger.warning("[QuestionGenerator] Gemini returned unparseable response.")
    except Exception as e:
        logger.warning(f"[QuestionGenerator] Gemini failed: {e}")
    return None


def _generate_with_groq(prompt: str, settings, role: str) -> dict | None:
    """Fallback: generate questions with Groq."""
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=1500,
        )
        content = response.choices[0].message.content
        result = _extract_json(content)
        if result:
            logger.info("[QuestionGenerator] Groq fallback generation successful.")
            return result
        logger.warning("[QuestionGenerator] Groq returned unparseable response.")
    except Exception as e:
        logger.error(f"[QuestionGenerator] Groq failed: {e}")
    return None


def _fallback_questions(role: str) -> Dict[str, Any]:
    """Static fallback when all AI services are unavailable."""
    return {
        "role": role,
        "technical_questions": [
            f"Walk me through a complex technical project you built as a {role}.",
            "How do you approach debugging production issues under pressure?",
            "Explain how you would design a scalable backend system.",
            "What is your approach to code reviews and maintaining code quality?",
            "How do you stay current with evolving technologies in your field?",
        ],
        "behavioral_questions": [
            "Tell me about a time you had to meet a tight deadline. How did you manage it?",
            "Describe a situation where you disagreed with a team decision. What did you do?",
            "Give an example of a challenging bug you solved. What was your process?",
            "Tell me about a project where you demonstrated leadership.",
            "How have you handled a situation where requirements changed mid-project?",
        ],
    }
