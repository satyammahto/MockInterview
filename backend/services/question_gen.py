"""
Question Generation Service using Groq Llama3.
Generates tailored interview questions based on skills and JD.
"""
import re
import json
import logging
from typing import List, Dict, Optional

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


def _extract_json_array(text: str) -> Optional[list]:
    """Robustly extract a JSON array from LLM response text."""
    # Try direct parse first
    text = text.strip()
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return parsed
    except json.JSONDecodeError:
        pass

    # Try regex extraction of array
    match = re.search(r'\[[\s\S]*\]', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None


def generate_questions(
    skills: List[str],
    job_description: str,
    difficulty: str = "medium",
    num_questions: int = 5,
    role: str = "",
) -> List[Dict[str, str]]:
    """
    Call Groq Llama3 to generate interview questions.
    Returns a list of {text, type} dicts.
    """
    from config import get_settings
    settings = get_settings()

    skill_str = ", ".join(skills[:20]) if skills else "general software engineering"

    def _build_prompt(n: int) -> str:
        return f"""You are an expert technical interviewer. Generate exactly {n} interview questions for the following candidate.

Candidate Skills: {skill_str}
Target Role: {role or 'Software Engineer'}
Job Description: {job_description[:2000]}
Difficulty: {difficulty}

Requirements:
- Mix types: Technical (deep tech knowledge), Behavioral (STAR format), and Deep Dive (system design or architecture)
- Tailor questions to the candidate's actual skills AND the JD requirements
- Reference specific technologies from the candidate's skill set when possible
- Each question must be clear and concise (1-2 sentences)
- {difficulty.capitalize()} difficulty level

IMPORTANT: You MUST return EXACTLY {n} questions. Respond with ONLY a raw JSON array. No markdown, no explanation.
[
  {{"text": "question text here", "type": "Technical"}},
  {{"text": "question text here", "type": "Behavioral"}},
  {{"text": "question text here", "type": "Deep Dive"}}
]"""

    def _call_groq(prompt: str) -> Optional[list]:
        try:
            response = _get_client().chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.6,
                max_tokens=2000,
            )
            content = response.choices[0].message.content
            logger.debug(f"[QuestionGen] Raw response: {content[:300]}")
            return _extract_json_array(content)
        except RuntimeError:
            raise
        except Exception as e:
            logger.error(f"[QuestionGen] Groq call error: {e}")
            return None

    try:
        # First attempt
        questions = _call_groq(_build_prompt(num_questions))

        if not questions:
            logger.warning("[QuestionGen] First attempt returned no parseable JSON. Retrying once.")
            questions = _call_groq(_build_prompt(num_questions))

        if not questions:
            logger.warning("[QuestionGen] Could not parse JSON from LLM response. Using fallback.")
            return _fallback_questions(num_questions, skills)

        # Validate and sanitise
        validated = []
        for q in questions:
            if isinstance(q, dict) and q.get("text"):
                validated.append({
                    "text": str(q["text"]).strip(),
                    "type": str(q.get("type", "Technical")).strip(),
                })

        # If still short, retry once for the missing count
        if validated and len(validated) < num_questions:
            logger.warning(
                f"[QuestionGen] Got {len(validated)}/{num_questions} questions. Retrying for remainder."
            )
            extra = _call_groq(_build_prompt(num_questions - len(validated)))
            if extra:
                for q in extra:
                    if isinstance(q, dict) and q.get("text") and len(validated) < num_questions:
                        validated.append({
                            "text": str(q["text"]).strip(),
                            "type": str(q.get("type", "Technical")).strip(),
                        })

        # Pad with fallback questions if still short
        if len(validated) < num_questions:
            fallback = _fallback_questions(num_questions - len(validated), skills)
            validated.extend(fallback)

        return validated[:num_questions] if validated else _fallback_questions(num_questions, skills)

    except RuntimeError:
        raise  # Re-raise config errors
    except Exception as e:
        logger.error(f"[QuestionGen] Error: {e}")
        return _fallback_questions(num_questions, skills)



def generate_followup_question(
    original_question: str,
    candidate_answer: str,
    skills: List[str],
) -> str:
    """
    Generate a single follow-up question based on the candidate's answer.
    Returns the follow-up question text, or empty string if not needed.
    """
    from config import get_settings
    settings = get_settings()

    if not candidate_answer or len(candidate_answer.strip()) < 20:
        return ""

    prompt = f"""You are a technical interviewer. The candidate just answered a question. Based on their answer, provide ONE brief follow-up question to dig deeper or clarify.

Original Question: {original_question}
Candidate's Answer: {candidate_answer[:800]}

Rules:
- If the answer is complete and thorough, respond with exactly: SKIP
- Otherwise write ONE concise follow-up question (max 2 sentences)
- Do NOT include any explanation, only the follow-up question or SKIP"""

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=150,
        )
        result = response.choices[0].message.content.strip()
        return "" if result.upper() == "SKIP" else result
    except Exception as e:
        logger.error(f"[QuestionGen] Follow-up generation error: {e}")
        return ""


def _fallback_questions(num: int, skills: List[str]) -> List[Dict[str, str]]:
    top_skill = skills[0] if skills else "software development"
    templates = [
        {"text": f"Can you walk me through a recent project where you used {top_skill}?", "type": "Technical"},
        {"text": "Tell me about a time you had to solve a complex technical problem under pressure.", "type": "Behavioral"},
        {"text": f"How would you design a scalable system using {top_skill}?", "type": "Deep Dive"},
        {"text": "Describe a situation where you disagreed with a team member. How did you handle it?", "type": "Behavioral"},
        {"text": f"What are the most important best practices when working with {top_skill}?", "type": "Technical"},
        {"text": "Tell me about your most challenging project and what you learned from it.", "type": "Behavioral"},
        {"text": "How do you approach debugging a production issue under high pressure?", "type": "Technical"},
    ]
    return templates[:num]
