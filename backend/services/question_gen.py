"""
Question Generation Service using Groq Llama3.
Generates tailored interview questions based on skills, JD, and interview mode.
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
    text = text.strip()
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return parsed
    except json.JSONDecodeError:
        pass

    match = re.search(r'\[[\s\S]*\]', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None


# ── Interview Mode Prompt Strategies ──────────────────────────────────────────

MODE_INSTRUCTIONS = {
    "hr": """Generate HR interview questions focused on:
- Personality and culture fit
- Strengths and weaknesses
- Teamwork and collaboration
- Conflict resolution and interpersonal skills
- Career goals and motivation
- Work ethic and values
Each question type should be "HR".""",

    "technical": """Generate deep technical questions focused on:
- Coding and problem-solving ability
- System architecture and design patterns
- Data structures and algorithms
- Role-specific technical knowledge
- Debugging and optimization techniques
- Real-world technical scenarios
Mix question types between "Technical" and "Deep Dive".""",

    "behavioral": """Generate behavioral questions using STAR methodology:
- Leadership and initiative
- Teamwork and collaboration
- Problem-solving under pressure
- Handling failure and learning from mistakes
- Communication and influence
- Adaptability and change management
Each question should start with "Tell me about a time..." or "Describe a situation where..."
Each question type should be "Behavioral".""",

    "stress": """Generate challenging stress interview questions designed to:
- Test confidence under pressure
- Present hypothetical dilemmas
- Challenge assumptions and push back
- Require quick thinking and composure
- Include curveball and unexpected questions
- Probe for resilience and mental toughness
Mix question types between "Stress" and "Behavioral". Make questions direct and intense.""",

    "mixed": """Generate a balanced mix of questions covering:
- 3 Technical questions (coding, architecture, problem-solving)
- 3 HR questions (personality, strengths, career goals)
- 2 Behavioral questions (STAR format, teamwork, leadership)
- 2 Deep Dive questions (system design, complex scenarios)
Ensure variety in question types.""",
}


def generate_questions(
    skills: List[str],
    job_description: str,
    difficulty: str = "medium",
    num_questions: int = 10,
    role: str = "",
    interview_mode: str = "mixed",
) -> List[Dict[str, str]]:
    """
    Call Groq Llama3 to generate interview questions based on interview mode.
    Returns a list of {text, type} dicts.
    """
    from config import get_settings
    settings = get_settings()

    skill_str = ", ".join(skills[:20]) if skills else "general software engineering"
    mode_key = interview_mode.lower() if interview_mode else "mixed"
    mode_instruction = MODE_INSTRUCTIONS.get(mode_key, MODE_INSTRUCTIONS["mixed"])

    prompt = f"""You are an expert interviewer. Generate exactly {num_questions} interview questions for the following candidate.

Candidate Skills: {skill_str}
Target Role: {role or 'Software Engineer'}
Job Description: {job_description[:2000]}
Difficulty: {difficulty}

INTERVIEW MODE: {mode_key.upper()}

{mode_instruction}

Additional requirements:
- Tailor questions to the candidate's specific skills AND the JD requirements
- Each question must be clear and concise (1-2 sentences)
- {difficulty.capitalize()} difficulty level
- Generate exactly {num_questions} questions

IMPORTANT: Respond with ONLY a raw JSON array. Do not add any explanation before or after. Do not use markdown.
[
  {{"text": "question text here", "type": "Technical"}},
  {{"text": "question text here", "type": "Behavioral"}}
]"""

    try:
        response = _get_client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=2000,
        )

        content = response.choices[0].message.content
        logger.debug(f"[QuestionGen] Raw response: {content[:300]}")

        questions = _extract_json_array(content)

        if not questions:
            logger.warning("[QuestionGen] Could not parse JSON from LLM response. Using fallback.")
            return _fallback_questions(num_questions, skills, mode_key)

        # Validate and sanitize
        validated = []
        for q in questions[:num_questions]:
            if isinstance(q, dict) and q.get("text"):
                validated.append({
                    "text": str(q["text"]).strip(),
                    "type": str(q.get("type", "Technical")).strip(),
                })

        return validated if validated else _fallback_questions(num_questions, skills, mode_key)

    except RuntimeError:
        raise  # Re-raise config errors
    except Exception as e:
        logger.error(f"[QuestionGen] Error: {e}")
        return _fallback_questions(num_questions, skills, mode_key)


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


def _fallback_questions(num: int, skills: List[str], mode: str = "mixed") -> List[Dict[str, str]]:
    top_skill = skills[0] if skills else "software development"

    mode_templates = {
        "hr": [
            {"text": "What are your greatest strengths and how do they help you in your work?", "type": "HR"},
            {"text": "Tell me about a conflict at work and how you resolved it.", "type": "HR"},
            {"text": "Where do you see yourself in 5 years?", "type": "HR"},
            {"text": "Why are you interested in this role and this company?", "type": "HR"},
            {"text": "How do you handle constructive criticism from your manager?", "type": "HR"},
        ],
        "technical": [
            {"text": f"Explain the architecture of a recent project where you used {top_skill}.", "type": "Technical"},
            {"text": f"How would you design a scalable system using {top_skill}?", "type": "Deep Dive"},
            {"text": "Walk me through how you would debug a production memory leak.", "type": "Technical"},
            {"text": f"What are common performance pitfalls when working with {top_skill}?", "type": "Technical"},
            {"text": "Design a rate limiter for an API. Explain your approach.", "type": "Deep Dive"},
        ],
        "behavioral": [
            {"text": "Tell me about a time you led a project through a major challenge.", "type": "Behavioral"},
            {"text": "Describe a situation where you had to adapt to a major change mid-project.", "type": "Behavioral"},
            {"text": "Give an example of when you had to make a difficult decision with incomplete information.", "type": "Behavioral"},
            {"text": "Tell me about a time you failed and what you learned from it.", "type": "Behavioral"},
            {"text": "Describe a situation where you had to influence someone without authority.", "type": "Behavioral"},
        ],
        "stress": [
            {"text": "If your manager told you your entire approach to this project is wrong, what would you do?", "type": "Stress"},
            {"text": "Why should we hire you over the other 50 candidates we're interviewing?", "type": "Stress"},
            {"text": "What would you do if a colleague publicly took credit for your work?", "type": "Stress"},
            {"text": "If we offered you 30% less than your expected salary, would you still take the job?", "type": "Stress"},
            {"text": "Tell me about something in your resume that you exaggerated.", "type": "Stress"},
        ],
    }

    templates = mode_templates.get(mode, [
        {"text": f"Can you walk me through a recent project where you used {top_skill}?", "type": "Technical"},
        {"text": "Tell me about a time you solved a complex problem under pressure.", "type": "Behavioral"},
        {"text": f"How would you design a scalable system using {top_skill}?", "type": "Deep Dive"},
        {"text": "Describe a conflict with a team member and how you resolved it.", "type": "Behavioral"},
        {"text": f"What are the best practices when working with {top_skill}?", "type": "Technical"},
        {"text": "Why are you interested in this role?", "type": "HR"},
        {"text": "Tell me about your most challenging project and what you learned.", "type": "Behavioral"},
        {"text": "How do you approach debugging a production issue under pressure?", "type": "Technical"},
        {"text": "Where do you see yourself in 3 years?", "type": "HR"},
        {"text": "How do you stay current with evolving technologies?", "type": "Technical"},
    ])

    # Repeat templates if not enough
    while len(templates) < num:
        templates.extend(templates[:num - len(templates)])

    return templates[:num]
